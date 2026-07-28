import { useState, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api/client'
import '../styles/onboarding.css'

// INS-07 — Écran de réinitialisation du mot de passe (cible du lien envoyé par e-mail :
// /reset-password?token=...). v5 : gabarit unique page-head + carte centrée.
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

  // Politique v5 : 10 caractères, une lettre, un chiffre
  const pwdError = useMemo(() => {
    if (!pwd) return 'Mot de passe requis'
    if (pwd.length < 10) return '10 caractères, dont une lettre et un chiffre'
    if (!/[a-zA-Z]/.test(pwd)) return 'Au moins une lettre'
    if (!/\d/.test(pwd)) return 'Au moins un chiffre'
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

  // Page header réutilisable
  const pageHead = (
    <header className="page-head">
      <div className="ph-brand">
        <div className="ph-mark">MEE<br/>REO</div>
        <div className="ph-name">MEEREO</div>
        <div className="ph-sep" />
        <div className="ph-kind">Plateforme BTP et immobilier</div>
      </div>
      <p className="ph-tag">Tout votre projet, piloté d'un seul endroit.</p>
      <div className="ph-pillars">
        <span className="ph-p">Appels d'offres</span>
        <span className="ph-p">Marketplace</span>
        <span className="ph-p">Paiements</span>
        <span className="ph-p is-kai">KAi, votre IA personnelle</span>
      </div>
    </header>
  )

  if (!token) {
    return (
      <div className="ob-screen">
        {pageHead}
        <div className="ob-card-v5" style={{textAlign:'center'}}>
          <div className="ob-eyebrow-v5">Récupération</div>
          <h1 className="ob-title-v5">Lien invalide.</h1>
          <p className="ob-lede-v5">Ce lien de réinitialisation est incomplet. Demandez-en un nouveau depuis « Mot de passe oublié ».</p>
          <div className="ob-foot-v5">
            <a onClick={() => navigate('/onboarding')} style={{cursor:'pointer'}}>← Retour à la connexion</a>
          </div>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="ob-screen">
        {pageHead}
        <div className="ob-card-v5" style={{textAlign:'center'}}>
          <div className="ob-eyebrow-v5">Récupération</div>
          <div style={{width:56,height:56,borderRadius:'50%',background:'rgba(47,158,91,.08)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2F9E5B" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
          <h1 className="ob-title-v5">Mot de passe réinitialisé.</h1>
          <p className="ob-lede-v5">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
          <button className="ob-btn-role" style={{background:'var(--ink)'}} onClick={() => navigate('/onboarding')}>
            Se connecter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="ob-screen">
      {pageHead}
      <div className="ob-card-v5">
        <div className="ob-eyebrow-v5">Récupération</div>
        <h1 className="ob-title-v5">Nouveau mot de passe.</h1>
        <p className="ob-lede-v5">Choisissez un mot de passe d'au moins 10 caractères, contenant au moins une lettre et un chiffre.</p>

        <div className="ob-field">
          <label className="ob-label-v5">Nouveau mot de passe</label>
          <div style={{position:'relative'}}>
            <input
              className="ob-input-v5"
              type="password"
              value={pwd}
              onChange={e => setPwd(e.target.value)}
              onBlur={() => setTouched(t => ({ ...t, pwd: true }))}
              placeholder="••••••••"
              autoFocus
            />
          </div>
          {touched.pwd && pwdError && (
            <div className="ob-legal-status s-err" style={{marginTop:6}}>
              <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              <span>{pwdError}</span>
            </div>
          )}
        </div>

        <div className="ob-field">
          <label className="ob-label-v5">Confirmer le mot de passe</label>
          <input
            className="ob-input-v5"
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, confirm: true }))}
            placeholder="••••••••"
          />
          {touched.confirm && confirmError && (
            <div className="ob-legal-status s-err" style={{marginTop:6}}>
              <svg viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              <span>{confirmError}</span>
            </div>
          )}
        </div>

        {serverError && (
          <div style={{padding:'10px 14px',background:'rgba(192,57,43,.06)',borderRadius:10,fontSize:12,color:'#C0392B',marginTop:12}}>{serverError}</div>
        )}

        <button
          className="ob-btn-role"
          style={{
            marginTop: 14,
            background: (valid && !submitting) ? 'var(--ink)' : undefined,
            ...(!valid || submitting ? {opacity:.5,cursor:'not-allowed'} : {}),
          }}
          disabled={!valid || submitting}
          onClick={handleSubmit}
        >
          {submitting ? 'Réinitialisation…' : 'Réinitialiser'}
        </button>

        <div className="ob-foot-v5">
          ← <a onClick={() => navigate('/onboarding')} style={{cursor:'pointer',color:'var(--ink)',fontWeight:600,textDecoration:'none'}}>Retour à la connexion</a>
        </div>
      </div>
    </div>
  )
}
