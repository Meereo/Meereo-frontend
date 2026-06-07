import { useState } from 'react'
import { Check } from 'lucide-react'
import { useMeereo } from '../../hooks/useMeereoStore'
import { getKaiQuotaStatus } from '../../domain/fintech'

const FEATURES_BY_ROLE = {
  pro: [
    'Relances automatiques des parties prenantes',
    'Détection proactive des blocages chantier',
    'Suivi intelligent des milestones et livrables',
    'Priorisation des tâches et validations',
    'Orchestration de la coordination inter-acteurs',
  ],
  client: [
    'Pilotage actif de votre projet sans expertise technique',
    'Alertes automatiques sur les retards et blocages',
    'Relance des professionnels en votre nom',
    'Synthèse intelligente de l\'avancement',
    'Accompagnement dans les décisions à prendre',
  ],
  fournisseur: [
    'Suivi proactif de vos commandes et paiements',
    'Détection des incidents et recommandations',
    'Optimisation de votre visibilité marketplace',
    'Priorisation des actions commerciales',
    'Analyse de vos performances de vente',
  ],
}

export default function KaiGoldModal({ isOpen, onClose, role = 'pro' }) {
  const { store, upgradeToGold } = useMeereo()
  const quota = getKaiQuotaStatus(store.kaiEntitlement, role)
  const [confirming, setConfirming] = useState(false)
  const [activating, setActivating] = useState(false)
  const [success, setSuccess] = useState(false)

  if (!isOpen) return null

  const features = FEATURES_BY_ROLE[role] || FEATURES_BY_ROLE.pro
  const roleLabels = { pro: 'Professionnel', client: 'Client', fournisseur: 'Fournisseur' }

  // Lire la date de fin depuis le bon role
  const ent = (store.kaiEntitlement || {})[role] || store.kaiEntitlement || {}
  const endDate = ent.goldEndDate ? new Date(ent.goldEndDate).toLocaleDateString('fr-FR') : '—'

  // Flux d'activation reel
  const handleConfirm = () => {
    setActivating(true)
    // Simuler un delai reseau pour le flux de paiement
    setTimeout(() => {
      upgradeToGold(role) // Active uniquement pour le profil courant
      setActivating(false)
      setSuccess(true)
      // Fermer apres feedback visuel
      setTimeout(() => {
        setSuccess(false)
        setConfirming(false)
        onClose()
      }, 1500)
    }, 800)
  }

  // ═══ ETAT ACTIF ═══
  if (quota.isGold) {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
        <div style={{ background: '#fff', borderRadius: 16, width: 420, maxWidth: '90vw', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>
          <div style={{ padding: '28px 28px 24px', textAlign: 'center' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#fff', fontSize: 18, fontWeight: 700 }}>K</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>KAI Pro est actif</div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 4 }}>Espace {roleLabels[role]}</div>
            <div style={{ fontSize: 11, color: 'var(--t4)' }}>Actif jusqu'au {endDate}</div>
            <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 8 }}>9 900 FCFA / mois · Renouvellement automatique</div>
          </div>
          <div style={{ padding: '0 28px 24px' }}>
            <button onClick={onClose} style={{ width: '100%', padding: '11px 20px', borderRadius: 10, background: 'var(--tx)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>Fermer</button>
          </div>
        </div>
      </div>
    )
  }

  // ═══ ACTIVATION ═══
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 16, width: 460, maxWidth: '90vw', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '28px 28px 0', textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#191c1d', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 20px rgba(124,58,237,.25)' }}>
            <span style={{ color: '#7C3AED', fontSize: 22, fontWeight: 700 }}>K</span>
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.3px', marginBottom: 6 }}>Passez à KAI Pro</div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 4 }}>Copilote opérationnel pour {roleLabels[role]}s</div>
          <div style={{ fontSize: 11, color: 'var(--t4)' }}>Standard : {quota.used}/{quota.limit} analyses utilisées ce mois</div>
        </div>

        {/* Comparaison */}
        <div style={{ padding: '20px 28px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: '14px 16px', background: 'var(--s2)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 8 }}>Standard</div>
              <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.6 }}>
                {quota.limit} analyses/mois<br />
                Recommandations basiques<br />
                Alertes passives
              </div>
            </div>
            <div style={{ padding: '14px 16px', background: 'rgba(124,58,237,.03)', borderRadius: 10, border: '1px solid rgba(124,58,237,.12)' }}>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: '#7C3AED', marginBottom: 8 }}>Pro</div>
              <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.6 }}>
                Analyses illimitées<br />
                Orchestration proactive<br />
                Automatisations métier
              </div>
            </div>
          </div>

          {/* Features */}
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 8 }}>Ce que KAI Pro fait pour vous</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 11.5, color: 'var(--tx)', lineHeight: 1.5 }}>
                <span style={{ color: '#7C3AED', flexShrink: 0, marginTop: 1 }}><Check size={12}/></span>
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 28px 24px', borderTop: '1px solid var(--border)' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center', color: '#34C759' }}><Check size={24}/></div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#34C759' }}>KAI Pro activé avec succès</div>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>Actif dans tous vos espaces</div>
            </div>
          ) : !confirming ? (
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: '11px 16px', borderRadius: 10, background: 'var(--surface-1)', color: 'var(--t3)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>Plus tard</button>
              <button onClick={() => setConfirming(true)} style={{ flex: 2, padding: '11px 16px', borderRadius: 10, background: '#7C3AED', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>Activer KAI Pro</button>
            </div>
          ) : (
            <div>
              <div style={{ padding: '12px 16px', background: 'var(--s2)', borderRadius: 10, marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Récapitulatif</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.6 }}>
                  Plan : <strong style={{ color: 'var(--tx)' }}>KAI Pro</strong><br />
                  Tarif : <strong style={{ color: 'var(--tx)' }}>9 900 FCFA / mois</strong><br />
                  Espace : <strong style={{ color: 'var(--tx)' }}>{roleLabels[role]}</strong><br />
                  Activation : <strong style={{ color: 'var(--tx)' }}>Immédiate · Tous les espaces</strong>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirming(false)} disabled={activating} style={{ flex: 1, padding: '11px 16px', borderRadius: 10, background: 'var(--surface-1)', color: 'var(--t3)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', opacity: activating ? .5 : 1 }}>Annuler</button>
                <button onClick={handleConfirm} disabled={activating} style={{ flex: 2, padding: '11px 16px', borderRadius: 10, background: activating ? '#9061E8' : '#7C3AED', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>
                  {activating ? 'Activation en cours...' : 'Confirmer et payer'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
