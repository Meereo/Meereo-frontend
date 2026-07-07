import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useMeereo } from '../hooks/useMeereoStore'
import { api } from '../services/api/client'
import MeereoLogo from '../components/shared/MeereoLogo'

export default function Validation() {
  const [params] = useSearchParams()
  const { store, respondCloture, updateStore } = useMeereo()

  // Email verification mode
  const verifyToken = params.get('token')
  const verifyEmail = params.get('email')
  const [emailVerified, setEmailVerified] = useState(false)
  const [emailError, setEmailError] = useState(null)
  const [emailLoading, setEmailLoading] = useState(!!verifyToken)

  useEffect(() => {
    if (!verifyToken || !verifyEmail) return
    setEmailLoading(true)
    api.auth.verifyEmail(verifyEmail, verifyToken)
      .then(() => {
        setEmailVerified(true)
        updateStore(prev => ({ ...prev, onboardingData: { ...(prev.onboardingData || {}), emailVerified: true } }))
      })
      .catch(e => setEmailError(e.message || 'Lien expiré ou invalide'))
      .finally(() => setEmailLoading(false))
  }, [verifyToken, verifyEmail, updateStore])

  // If this is an email verification page, show that UI
  if (verifyToken && verifyEmail) {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 20, boxShadow: '0 12px 40px rgba(0,0,0,.08)', overflow: 'hidden' }}>
          <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <MeereoLogo size={28} />
            <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.2px' }}>MEEREO</div>
          </div>
          <div style={{ padding: '48px 28px', textAlign: 'center' }}>
            {emailLoading ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Vérification en cours...</div>
                <div style={{ fontSize: 13, color: '#777' }}>Veuillez patienter.</div>
              </>
            ) : emailVerified ? (
              <>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(22,163,74,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Email vérifié</div>
                <div style={{ fontSize: 13, color: '#777', lineHeight: 1.5, marginBottom: 20 }}>Votre adresse <strong>{verifyEmail}</strong> a été vérifiée avec succès.</div>
                <button onClick={() => window.location.href = '/'} style={{ padding: '12px 24px', borderRadius: 10, background: '#191c1d', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>Accéder à mon espace</button>
              </>
            ) : (
              <>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(186,26,26,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Lien invalide ou expiré</div>
                <div style={{ fontSize: 13, color: '#777', lineHeight: 1.5 }}>{emailError || 'Ce lien de vérification n\'est plus valide. Connectez-vous à votre espace pour demander un nouveau lien.'}</div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Cloture validation mode (existing logic)
  const clotureId = params.get('id')
  const [done, setDone] = useState(false)
  const [refused, setRefused] = useState(false)
  const [comment, setComment] = useState('')

  const req = (store.clotureRequests || []).find(r => r.id === clotureId)
  const project = req ? (store.projects || []).find(p => p.id === req.projectId) : null

  const handleAccept = () => {
    if (req) respondCloture(req.id, true, comment)
    setDone(true)
  }
  const handleRefuse = () => {
    if (req) respondCloture(req.id, false, comment)
    setRefused(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f7', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 20, boxShadow: '0 12px 40px rgba(0,0,0,.08)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid rgba(0,0,0,.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <MeereoLogo size={28} />
          <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.2px' }}>MEEREO</div>
        </div>

        {done ? (
          <div style={{ padding: '48px 28px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(52,199,89,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Réception confirmée</div>
            <div style={{ fontSize: 13, color: '#777', lineHeight: 1.5 }}>Merci pour votre confirmation. Le projet est maintenant clôturé.</div>
          </div>
        ) : refused ? (
          <div style={{ padding: '48px 28px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,149,0,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Signalement enregistré</div>
            <div style={{ fontSize: 13, color: '#777', lineHeight: 1.5 }}>Le prestataire a été informé de votre retour.</div>
          </div>
        ) : !req ? (
          <div style={{ padding: '48px 28px', textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>Lien invalide ou expiré</div>
            <div style={{ fontSize: 13, color: '#777' }}>Cette demande de validation n'existe pas ou a déjà été traitée.</div>
          </div>
        ) : (
          <>
            {/* Contenu */}
            <div style={{ padding: '28px 28px 20px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 16 }}>Validation de réception</div>

              <div style={{ padding: '16px 18px', background: '#f8f8f9', borderRadius: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: '#999', marginBottom: 4 }}>Projet</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{project?.nom || project?.name || 'Projet'}</div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#666' }}>
                  <span>Prestataire : <strong style={{ color: '#111' }}>{req.requestedByName}</strong></span>
                  {project?.adresse && <span>{project.adresse}</span>}
                </div>
              </div>

              <div style={{ fontSize: 14, color: '#222', lineHeight: 1.6, marginBottom: 20 }}>
                Le prestataire vous indique que le projet est terminé. <strong>Confirmez-vous la réception et la conformité des travaux ?</strong>
              </div>

              {req.message && (
                <div style={{ padding: '12px 16px', background: '#f8f8f9', borderRadius: 10, marginBottom: 20, fontSize: 13, color: '#555', fontStyle: 'italic' }}>
                  "{req.message}"
                </div>
              )}

              {/* Commentaire */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 6 }}>Ajouter un commentaire (optionnel)</div>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Remarques, réserves, observations..."
                  rows="3"
                  style={{ width: '100%', padding: '12px 14px', border: '1px solid rgba(0,0,0,.08)', borderRadius: 10, fontSize: 13, fontFamily: 'Inter, -apple-system, sans-serif', background: '#f8f8f9', outline: 'none', resize: 'vertical', color: '#111' }}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '16px 28px 28px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={handleAccept} style={{ width: '100%', padding: '14px 20px', borderRadius: 12, background: '#111', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, -apple-system, sans-serif' }}>
                Confirmer la réception
              </button>
              <button onClick={handleRefuse} style={{ width: '100%', padding: '14px 20px', borderRadius: 12, background: '#fff', color: '#111', border: '1px solid rgba(0,0,0,.12)', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, -apple-system, sans-serif' }}>
                Signaler un problème
              </button>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 28px', borderTop: '1px solid rgba(0,0,0,.04)', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#bbb' }}>Cette action permet de finaliser le projet sur MEEREO.</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

