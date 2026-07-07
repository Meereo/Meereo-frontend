import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from './Modal'
import { useMeereo } from '../../hooks/useMeereoStore'
import { api } from '../../services/api/client'

/**
 * DeleteAccountSection — Suppression de compte multi-profils
 *
 * @param {'client'|'pro'|'fournisseur'} profileType
 */

const PROFILE_TEXTS = {
  client: {
    desc: 'La suppression de votre compte est irréversible. Vous perdrez l\u2019accès à votre espace client, votre historique de projets et vos documents. Les commandes passées resteront liées aux fournisseurs sous forme anonymisée.',
    modal: {
      title: 'Supprimer mon compte client',
      points: [
        'Perte définitive de l\u2019accès à votre espace et à vos projets',
        'Votre historique de suivi, décisions et documents sera supprimé',
        'Les commandes passées resteront visibles par les fournisseurs, mais anonymisées',
      ],
    },
  },
  pro: {
    desc: 'La suppression de votre compte est irréversible. Votre profil public, votre cockpit et vos données de projets ne seront plus accessibles. Les contrats et marchés liés peuvent être conservés selon les obligations légales.',
    modal: {
      title: 'Supprimer mon compte professionnel',
      points: [
        'Votre profil public et votre cockpit ne seront plus accessibles',
        'Les projets et missions perdent votre attribution (anonymisation)',
        'Les contrats, marchés et échanges liés peuvent être conservés selon les obligations légales',
      ],
    },
  },
  fournisseur: {
    desc: 'La suppression de votre compte est irréversible. Votre catalogue produits, votre espace fournisseur et vos données ne seront plus accessibles. Contactez MEEREO en cas de litige en cours.',
    modal: {
      title: 'Supprimer mon compte fournisseur',
      points: [
        'Votre catalogue produits/services et votre espace fournisseur seront supprimés',
        'Les commandes en cours peuvent rester visibles, mais anonymisées',
        'Contactez MEEREO si vous avez un litige en cours avant de supprimer',
      ],
    },
  },
}

export default function DeleteAccountSection({ profileType = 'pro' }) {
  const nav = useNavigate()
  const { logoutUser, showToast } = useMeereo()
  const [showModal, setShowModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [password, setPassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const texts = PROFILE_TEXTS[profileType] || PROFILE_TEXTS.pro

  const canConfirm = confirmText === 'SUPPRIMER' && password.length >= 1

  const handleDelete = async () => {
    if (!canConfirm || isDeleting) return
    setIsDeleting(true)

    // 1. Soft-delete on backend — cookie is cleared server-side on success
    try {
      await api.auth.deleteAccount(password)
    } catch (e) {
      setIsDeleting(false)
      showToast(e?.message || 'Erreur lors de la suppression', 'red')
      return
    }

    // 2. Clear session client-side (store + sessionStorage + in-memory token)
    await logoutUser()

    // 3. Navigate immediately — no 3-second wait to avoid stuck loading state
    setIsDeleting(false)
    setShowModal(false)
    setShowSuccess(true)
    // Short delay so the success screen is briefly visible, then redirect
    setTimeout(() => nav('/onboarding', { replace: true }), 1500)
  }

  return (
    <>
      {/* Section dans Paramètres */}
      <div style={{
        padding: '24px',
        borderRadius: 16,
        border: '1px solid rgba(186,26,26,.15)',
        background: 'rgba(186,26,26,.02)',
        marginTop: 24,
      }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: '#ba1a1a', marginBottom: 8 }}>
          Supprimer mon compte
        </div>
        <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, margin: '0 0 16px', maxWidth: 520 }}>
          {texts.desc}
        </p>
        <button
          onClick={() => { setShowModal(true); setConfirmText(''); setPassword('') }}
          style={{
            padding: '10px 18px',
            borderRadius: 12,
            background: 'transparent',
            color: '#ba1a1a',
            border: '1px solid rgba(186,26,26,.25)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--f)',
            transition: 'all .15s',
          }}
          onMouseOver={e => { e.target.style.background = 'rgba(186,26,26,.06)' }}
          onMouseOut={e => { e.target.style.background = 'transparent' }}
          data-analytics-event="DELETE_ACCOUNT_REQUEST"
          data-analytics-context={profileType}
        >
          Supprimer mon compte
        </button>
      </div>

      {/* Modal de confirmation */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 18, width: '100%', maxWidth: 440,
              boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ padding: '28px 28px 0' }}>
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'rgba(186,26,26,.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                  <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, textAlign: 'center', marginBottom: 8, color: '#111' }}>
                {texts.modal.title}
              </div>
              <div style={{ fontSize: 13, color: '#ba1a1a', fontWeight: 600, textAlign: 'center', marginBottom: 16 }}>
                Cette action est irréversible.
              </div>
            </div>

            {/* Points */}
            <div style={{ padding: '0 28px 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {texts.modal.points.map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ba1a1a', flexShrink: 0, marginTop: 6 }} />
                    <span style={{ fontSize: 12.5, color: '#666', lineHeight: 1.5 }}>{p}</span>
                  </div>
                ))}
              </div>

              {/* Re-auth : mot de passe */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#111', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Confirmez votre mot de passe"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    border: '1px solid #E5E5E5', fontSize: 13, fontFamily: 'var(--f)',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Double friction : taper SUPPRIMER */}
              <div style={{ marginBottom: 4 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#111', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 6 }}>
                  Tapez <strong style={{ color: '#ba1a1a' }}>SUPPRIMER</strong> pour confirmer
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder="SUPPRIMER"
                  autoComplete="off"
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    border: confirmText === 'SUPPRIMER' ? '1px solid #ba1a1a' : '1px solid #E5E5E5',
                    fontSize: 13, fontFamily: 'var(--f)',
                    outline: 'none', boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ padding: '16px 28px 24px', display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 12,
                  background: '#f3f4f5', color: '#555',
                  border: '1px solid rgba(0,0,0,.06)',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  fontFamily: 'var(--f)',
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={!canConfirm || isDeleting}
                style={{
                  flex: 1, padding: '12px 16px', borderRadius: 12,
                  background: canConfirm ? '#ba1a1a' : '#ddd',
                  color: canConfirm ? '#fff' : '#999',
                  border: 'none',
                  fontSize: 13, fontWeight: 600,
                  cursor: canConfirm ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--f)',
                  opacity: isDeleting ? 0.6 : 1,
                }}
              >
                {isDeleting ? 'Suppression...' : 'Oui, supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation screen — full overlay after deletion */}
      {showSuccess && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999999,
          background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, fontFamily: 'var(--f, Inter, sans-serif)',
        }}>
          <div style={{ maxWidth: 420, textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(22,163,74,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div style={{ fontSize: 22, fontWeight: 600, color: '#111', marginBottom: 8, letterSpacing: '-.3px' }}>Compte supprimé</div>
            <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, marginBottom: 24 }}>
              Votre compte et toutes vos données ont été définitivement supprimés.
              Redirection dans quelques secondes…
            </div>
          </div>
        </div>
      )}
    </>
  )
}
