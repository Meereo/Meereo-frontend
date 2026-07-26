import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api/client'
import MeereoLogo from '../components/shared/MeereoLogo'

// INS-07 — Écran de réinitialisation du mot de passe (cible du lien envoyé par e-mail :
// /reset-password?token=...). Bouton désactivé tant que la politique n'est pas respectée
// et que la confirmation ne correspond pas. Erreurs inline par champ.
export default function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token')

  const [pwd, setPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [touched, setTouched] = useState({ pwd: false, confirm: false })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState(null)

  // Politique alignée sur le serveur (validators/auth.js : min 8 caractères)
  const pwdError = useMemo(() => {
    if (!pwd) return 'Mot de passe requis'
    if (pwd.length < 8) return 'Au moins 8 caractères'
    return null
  }, [pwd])
  const confirmError = useMemo(() => {
    if (!confirm) return 'Confirmation requise'
    if (confirm !== pwd) return 'Les mots de passe ne correspondent pas'
    return null
  }, [confirm, pwd])

  const valid = !pwdError && !confirmError && !!token

  const handleSubmit = async () => {
    setTouched({ pwd: true, confirm: true })
    if (!valid || submitting) return
    setSubmitting(true)
    setServerError(null)
    try {
      await api.auth.resetPassword({ token, newPassword: pwd, confirmPassword: confirm })
      setDone(true)
    } catch (e) {
      setServerError(e.message || 'Lien invalide ou expiré — demandez-en un nouveau.')
    } finally {
      setSubmitting(false)
    }
  }

  const shell = (children) => (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 20, boxShadow: '0 12px 40px rgba(0,0,0,.08)', overflow: 'hidden' }}>
        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <MeereoLogo size={28} />
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.2px' }}>MEEREO</div>
        </div>
        {children}
      </div>
    </div>
  )

  const inputStyle = (hasError) => ({
    width: '100%', padding: '11px 14px', border: `1px solid ${hasError ? '#ba1a1a' : 'rgba(0,0,0,.10)'}`,
    borderRadius: 10, fontSize: 13, fontFamily: 'Inter, -apple-system, sans-serif', background: '#f8f8f9',
    outline: 'none', color: '#111',
  })
  const errStyle = { fontSize: 11, color: '#ba1a1a', marginTop: 5 }
  const labelStyle = { fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 6, display: 'block' }

  if (!token) {
    return shell(
      <div style={{ padding: '48px 28px', textAlign: 'center' }}>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Lien invalide</div>
        <div style={{ fontSize: 13, color: '#777', lineHeight: 1.5 }}>Ce lien de réinitialisation est incomplet. Demandez-en un nouveau depuis « Mot de passe oublié ».</div>
      </div>
    )
  }

  if (done) {
    return shell(
      <div style={{ padding: '48px 28px', textAlign: 'center' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(52,199,89,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Mot de passe réinitialisé</div>
        <div style={{ fontSize: 13, color: '#777', lineHeight: 1.5, marginBottom: 20 }}>Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</div>
        <button onClick={() => navigate('/onboarding')} style={{ padding: '12px 24px', borderRadius: 10, background: '#191c1d', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Se connecter</button>
      </div>
    )
  }

  return shell(
    <>
      <div style={{ padding: '28px 28px 8px' }}>
        <div style={{ fontSize: 10, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 16 }}>Réinitialisation du mot de passe</div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Nouveau mot de passe</label>
          <input
            type="password"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, pwd: true }))}
            placeholder="Au moins 8 caractères"
            autoFocus
            style={inputStyle(touched.pwd && pwdError)}
          />
          {touched.pwd && pwdError && <div style={errStyle}>{pwdError}</div>}
        </div>

        <div style={{ marginBottom: 8 }}>
          <label style={labelStyle}>Confirmer le mot de passe</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, confirm: true }))}
            placeholder="Ressaisissez le mot de passe"
            style={inputStyle(touched.confirm && confirmError)}
          />
          {touched.confirm && confirmError && <div style={errStyle}>{confirmError}</div>}
        </div>

        {serverError && (
          <div style={{ padding: '10px 14px', background: 'rgba(186,26,26,.06)', borderRadius: 10, fontSize: 12, color: '#ba1a1a', marginTop: 12 }}>{serverError}</div>
        )}
      </div>

      <div style={{ padding: '16px 28px 28px' }}>
        <button
          onClick={handleSubmit}
          disabled={!valid || submitting}
          style={{
            width: '100%', padding: '14px 20px', borderRadius: 12,
            background: (valid && !submitting) ? '#111' : '#d5d5d8',
            color: (valid && !submitting) ? '#fff' : '#8a8a8f',
            border: 'none', fontSize: 14, fontWeight: 600,
            cursor: (valid && !submitting) ? 'pointer' : 'not-allowed',
            fontFamily: 'Inter, -apple-system, sans-serif',
          }}
        >
          {submitting ? 'Réinitialisation…' : 'Réinitialiser le mot de passe'}
        </button>
      </div>
    </>
  )
}
