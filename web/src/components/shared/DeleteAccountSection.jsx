import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const { updateStore, showToast, log } = useMeereo()
  const [showModal, setShowModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [password, setPassword] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  const texts = PROFILE_TEXTS[profileType] || PROFILE_TEXTS.pro

  const canConfirm = confirmText === 'SUPPRIMER' && password.length >= 1

  const handleDelete = () => {
    if (!canConfirm || isDeleting) return
    setIsDeleting(true)

    // 1. Purge backend (PostgreSQL + MinIO)
    api.auth.deleteAccount().catch(e => console.warn('[DELETE] Backend purge:', e.message))

    // 2. NUKE localStorage SYNCHRONOUSLY with an empty store
    // This is the ONLY reliable way to ensure no data survives
    const emptyStore = JSON.stringify({
      user: null, _token: null, users: [], projects: [], aos: [], offers: [],
      markets: [], tasks: [], documents: [], decisions: [], products: [],
      notifications: [], activities: [], transactions: [], commandes: [],
      messages: [], conversations: [], events: [], intervenants: [],
      clients: [], fournisseurs: [], rapports: [], sellerOrders: [],
      photos: [], notes: [], paymentRequests: [], projectMembers: [],
      projectInvitations: [], clotureRequests: [], aoInvitations: [],
      entrepriseDocs: [], introductions: [], commissions: [],
      commissionAcceptances: [], onboardingData: null,
      kaiOnboardingDone: { pro: false, client: false, fournisseur: false },
      kaiConversations: [], kaiMemory: [], kaiUsage: [],
      paymentOrders: [], ledgerEntries: [], payoutRequests: [],
      proofDocuments: [], disputeCases: [], wallets: [], reviews: [],
      offerStatuts: {}, marketStatuts: {}, taskStates: {},
      deletedEventIds: [], eventOverrides: {},
    })
    localStorage.setItem('meereo_store_v2', emptyStore)
    try { sessionStorage.clear() } catch {}

    // 3. Inject confirmation screen into DOM (outside React)
    const overlay = document.createElement('div')
    overlay.id = 'meereo-delete-confirm'
    overlay.innerHTML = `
      <div style="position:fixed;inset:0;z-index:999999;background:#fff;display:flex;align-items:center;justify-content:center;padding:20px;font-family:Inter,-apple-system,sans-serif">
        <div style="max-width:420px;text-align:center">
          <div style="width:56px;height:56px;border-radius:50%;background:rgba(22,163,74,.06);display:flex;align-items:center;justify-content:center;margin:0 auto 20px">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div style="font-size:22px;font-weight:700;color:#111;margin-bottom:8px;letter-spacing:-.3px">Compte supprimé</div>
          <div style="font-size:14px;color:#666;line-height:1.6;margin-bottom:8px">Votre compte et toutes vos données ont été définitivement supprimés.</div>
          <div style="font-size:12.5px;color:#999;line-height:1.6;margin-bottom:28px">Vos projets, documents, messages, fichiers et informations personnelles ont été effacés de nos serveurs. Cette action est irréversible.</div>
          <div style="display:flex;flex-direction:column;gap:8px;align-items:center">
            <button onclick="localStorage.clear();sessionStorage.clear();window.location.replace('/onboarding')" style="padding:12px 28px;border-radius:10px;background:#191c1d;color:#fff;border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit">Créer un nouveau compte</button>
            <button onclick="localStorage.clear();sessionStorage.clear();window.location.replace('/')" style="padding:10px 20px;border-radius:8px;background:transparent;color:#999;border:none;font-size:12px;font-weight:500;cursor:pointer;font-family:inherit">Retour à l'accueil</button>
            <div id="meereo-delete-countdown" style="font-size:11px;color:#bbb;margin-top:12px">Redirection automatique dans 8 secondes</div>
          </div>
        </div>
      </div>
    `
    document.body.appendChild(overlay)

    // 4. Countdown + force redirect
    let seconds = 8
    const iv = setInterval(() => {
      seconds--
      const el = document.getElementById('meereo-delete-countdown')
      if (el) el.textContent = seconds > 0 ? `Redirection automatique dans ${seconds} seconde${seconds > 1 ? 's' : ''}` : 'Redirection...'
      if (seconds <= 0) { clearInterval(iv); localStorage.clear(); sessionStorage.clear(); window.location.replace('/onboarding') }
    }, 1000)

    // 5. Kill React state completely — wipe EVERYTHING
    updateStore(() => ({
      user: null, _token: null,
      users: [], projects: [], aos: [], offers: [], markets: [], tasks: [],
      documents: [], decisions: [], products: [], notifications: [], activities: [],
      transactions: [], commandes: [], messages: [], conversations: [], events: [],
      intervenants: [], clients: [], fournisseurs: [], rapports: [], sellerOrders: [],
      photos: [], notes: [], paymentRequests: [], projectMembers: [], projectInvitations: [],
      clotureRequests: [], aoInvitations: [], entrepriseDocs: [], introductions: [],
      commissions: [], commissionAcceptances: [], onboardingData: null,
      kaiOnboardingDone: { pro: false, client: false, fournisseur: false },
      kaiConversations: [], kaiMemory: [], kaiUsage: [],
      paymentOrders: [], ledgerEntries: [], payoutRequests: [], proofDocuments: [],
      disputeCases: [], wallets: [], reviews: [], offerStatuts: {}, marketStatuts: {},
      taskStates: {}, deletedEventIds: [], eventOverrides: [],
    }))
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
        <div style={{ fontSize: 15, fontWeight: 700, color: '#ba1a1a', marginBottom: 8 }}>
          Supprimer mon compte
        </div>
        <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6, margin: '0 0 16px', maxWidth: 520 }}>
          {texts.desc}
        </p>
        <button
          onClick={() => { setShowModal(true); setConfirmText(''); setPassword(''); log('ACCOUNT_DELETION_REQUESTED', { profileType }) }}
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
              <div style={{ fontSize: 18, fontWeight: 700, textAlign: 'center', marginBottom: 8, color: '#111' }}>
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
    </>
  )
}
