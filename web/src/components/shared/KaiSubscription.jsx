import { useState } from 'react'
import { Check, Smartphone, CreditCard, Building2 } from 'lucide-react'
import { useMeereo } from '../../hooks/useMeereoStore'
import { getKaiQuotaStatus } from '../../domain/fintech'

// ══════════════════════════════════════════════════════════════
//  MEEREO — KAI Subscription Module
//  Composant partagé : cockpit, client, fournisseur
// ══════════════════════════════════════════════════════════════

const STATUS_META = {
  active:   { label: 'Actif', color: '#34c759', bg: 'rgba(52,199,89,.06)' },
  trialing: { label: 'Période d\'essai', color: '#FF9500', bg: 'rgba(255,149,0,.06)' },
  free:     { label: 'Gratuit', color: '#8e8e93', bg: 'rgba(142,142,147,.06)' },
  past_due: { label: 'Paiement à régulariser', color: '#FF3B30', bg: 'rgba(255,59,48,.06)' },
  unpaid:   { label: 'Impayé', color: '#FF3B30', bg: 'rgba(255,59,48,.06)' },
  canceled: { label: 'Annulé', color: '#8e8e93', bg: 'rgba(142,142,147,.06)' },
  expired:  { label: 'Expiré', color: '#FF9500', bg: 'rgba(255,149,0,.06)' },
}

const PLANS = {
  standard: {
    name: 'KAi Standard',
    price: 'Gratuit',
    period: '',
    features: ['25 analyses KAi / mois', 'Recommandations basiques', 'Alertes passives', 'Support communautaire'],
  },
  gold: {
    name: 'KAi Pro',
    period: '/ mois',
    features: ['Analyses illimitées', 'Orchestration proactive', 'Automatisations métier', 'Relances automatiques', 'Détection des blocages', 'Support prioritaire'],
  },
}

// FIN-02: tarifs KAi Pro différenciés par rôle (ACTÉS)
const KAI_PRO_PRICES = {
  client: '9 900 FCFA',
  pro: '19 900 FCFA',
  fournisseur: '39 000 FCFA',
}
const getKaiProPrice = (role) => KAI_PRO_PRICES[role] || KAI_PRO_PRICES.pro

const MOCK_HISTORY = [
  { id: 'inv_3', date: '2026-04-01', label: 'KAI Pro — Renouvellement mensuel', amount: '9 900 FCFA', status: 'paid', ref: 'INV-2026-0042' },
  { id: 'inv_2', date: '2026-03-01', label: 'KAI Pro — Renouvellement mensuel', amount: '9 900 FCFA', status: 'paid', ref: 'INV-2026-0031' },
  { id: 'inv_1', date: '2026-02-15', label: 'KAI Pro — Première souscription', amount: '9 900 FCFA', status: 'paid', ref: 'INV-2026-0018' },
]

const HIST_STATUS = {
  paid: { label: 'Payé', color: '#34c759' },
  pending: { label: 'En attente', color: '#FF9500' },
  failed: { label: 'Échoué', color: '#FF3B30' },
  refunded: { label: 'Remboursé', color: '#8e8e93' },
}

const sectionTitle = { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 12 }
const cardStyle = { background: 'var(--surface-1)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '20px 22px', marginBottom: 16 }
const labelStyle = { fontSize: 11, fontWeight: 600, color: 'var(--t3)', marginBottom: 4 }
const valueStyle = { fontSize: 13, fontWeight: 600, color: 'var(--tx)' }

export default function KaiSubscription({ role = 'pro' }) {
  const { store, upgradeToGold } = useMeereo()
  const quota = getKaiQuotaStatus(store.kaiEntitlement, role)
  const ent = (store.kaiEntitlement || {})[role] || {}
  const ob = store.onboardingData || {}
  const user = store.user || {}

  const isGold = quota.isGold
  const planKey = isGold ? 'gold' : 'standard'
  const plan = PLANS[planKey]

  // Derive status
  const getStatus = () => {
    if (!isGold) return 'free'
    if (ent.goldEndDate && new Date(ent.goldEndDate) < new Date()) return 'expired'
    return 'active'
  }
  const status = getStatus()
  const meta = STATUS_META[status]

  const [showUpgrade, setShowUpgrade] = useState(false)
  const [showPayMethod, setShowPayMethod] = useState(false)
  const [payMethod, setPayMethod] = useState(store.paymentMethod || { type: 'mobile', name: 'Orange Money', numero: '+225 07 XX XX XX' })
  const [billingEdit, setBillingEdit] = useState(false)

  const roleLabels = { pro: 'Professionnel', client: 'Client', fournisseur: 'Fournisseur' }
  const billingName = ob.prenom ? `${ob.prenom} ${ob.nom || ''}`.trim() : ob.entreprise || user.name || user.company || ''
  const billingEmail = ob.email || user.email || ''
  const billingPhone = ob.tel || user.phone || ''
  const billingCity = ob.ville || ''

  const [upgrading, setUpgrading] = useState(false)
  const [upgraded, setUpgraded] = useState(false)

  const handleUpgrade = () => {
    setUpgrading(true)
    setTimeout(() => {
      upgradeToGold(role)
      setUpgrading(false)
      setUpgraded(true)
      setTimeout(() => { setUpgraded(false); setShowUpgrade(false) }, 1500)
    }, 800)
  }

  return (
    <div style={{ maxWidth: 600 }}>
      {/* ═══ BLOC RÉSUMÉ ═══ */}
      <div style={sectionTitle}>Votre abonnement</div>
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: isGold ? '#7C3AED' : 'var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: isGold ? '#fff' : 'var(--t3)', fontSize: 16, fontWeight: 600 }}>K</span>
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.3px' }}>{plan.name}</div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>Espace {roleLabels[role]}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <div style={labelStyle}>Statut</div>
              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: meta.bg, color: meta.color }}>{meta.label}</span>
            </div>
            <div>
              <div style={labelStyle}>Tarif</div>
              <div style={valueStyle}>{plan.price} <span style={{ fontWeight: 400, color: 'var(--t3)' }}>{plan.period}</span></div>
            </div>
            {isGold && ent.goldEndDate && (
              <div>
                <div style={labelStyle}>Renouvellement</div>
                <div style={valueStyle}>{new Date(ent.goldEndDate).toLocaleDateString('fr-FR')}</div>
              </div>
            )}
            {!isGold && (
              <div>
                <div style={labelStyle}>Usage ce mois</div>
                <div style={valueStyle}>{quota.used} / {quota.limit} analyses</div>
              </div>
            )}
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          {!isGold && (
            <button onClick={() => setShowUpgrade(true)} style={{ padding: '10px 20px', borderRadius: 10, background: '#7C3AED', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', whiteSpace: 'nowrap' }}>
              Passer à KAI Pro
            </button>
          )}
          {status === 'expired' && (
            <button onClick={() => setShowUpgrade(true)} style={{ padding: '10px 20px', borderRadius: 10, background: '#7C3AED', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', whiteSpace: 'nowrap' }}>
              Réactiver
            </button>
          )}
          {status === 'past_due' && (
            <button onClick={() => setShowPayMethod(true)} style={{ padding: '10px 20px', borderRadius: 10, background: '#FF3B30', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', whiteSpace: 'nowrap' }}>
              Régulariser
            </button>
          )}
        </div>
      </div>

      {/* ═══ COMPARAISON PLANS ═══ */}
      <div style={sectionTitle}>Plans disponibles</div>
      <div className="rg-2" style={{ gap: 12, marginBottom: 24 }}>
        {Object.entries(PLANS).map(([key, p]) => (
          <div key={key} style={{ ...cardStyle, marginBottom: 0, border: planKey === key ? '2px solid var(--tx)' : '1px solid var(--border-subtle)', position: 'relative' }}>
            {planKey === key && <div style={{ position: 'absolute', top: 10, right: 12, fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'var(--tx)', color: '#fff' }}>ACTUEL</div>}
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{p.name}</div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-.5px', marginBottom: 12 }}>
              {p.price} <span style={{ fontSize: 11, fontWeight: 400, color: 'var(--t3)' }}>{p.period}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {p.features.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: 'var(--t2)' }}>
                  <span style={{ color: key === 'gold' ? '#7C3AED' : 'var(--ok)', flexShrink: 0 }}><Check size={12}/></span>
                  {f}
                </div>
              ))}
            </div>
            {key === 'gold' && !isGold && (
              <button onClick={() => setShowUpgrade(true)} style={{ marginTop: 14, width: '100%', padding: '9px 16px', borderRadius: 8, background: '#7C3AED', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>
                Souscrire
              </button>
            )}
          </div>
        ))}
      </div>

      {/* ═══ MOYEN DE PAIEMENT ═══ */}
      <div style={sectionTitle}>Moyen de paiement</div>
      <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {payMethod.name ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {payMethod.type === 'mobile' ? <Smartphone size={18}/> : payMethod.type === 'carte' ? <CreditCard size={18}/> : <Building2 size={18}/>}
            </div>
            <div>
              <div style={valueStyle}>{payMethod.name}</div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>{payMethod.numero}</div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: 'var(--t3)' }}>Aucun moyen de paiement configuré</div>
        )}
        <button onClick={() => setShowPayMethod(true)} style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--s2)', border: '1px solid var(--border-subtle)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', color: 'var(--tx)' }}>
          {payMethod.name ? 'Modifier' : 'Ajouter'}
        </button>
      </div>

      {/* ═══ FACTURATION ═══ */}
      <div style={sectionTitle}>Informations de facturation</div>
      <div style={cardStyle}>
        <div className="rg-2" style={{ gap: 14 }}>
          <div><div style={labelStyle}>Nom</div><div style={valueStyle}>{billingName || '—'}</div></div>
          <div><div style={labelStyle}>Email</div><div style={valueStyle}>{billingEmail || '—'}</div></div>
          <div><div style={labelStyle}>Téléphone</div><div style={valueStyle}>{billingPhone || '—'}</div></div>
          <div><div style={labelStyle}>Ville</div><div style={valueStyle}>{billingCity || '—'}</div></div>
        </div>
      </div>

      {/* ═══ HISTORIQUE ═══ */}
      <div style={sectionTitle}>Historique</div>
      <div style={{ ...cardStyle, padding: 0, overflow: 'hidden' }}>
        {(isGold ? MOCK_HISTORY : []).length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', fontSize: 12, color: 'var(--t4)' }}>Aucune transaction pour le moment</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['Date', 'Description', 'Montant', 'Statut', 'Réf.'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_HISTORY.map(inv => {
                const s = HIST_STATUS[inv.status] || HIST_STATUS.pending
                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--t2)' }}>{new Date(inv.date).toLocaleDateString('fr-FR')}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--tx)' }}>{inv.label}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--tx)' }}>{inv.amount}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: s.color + '10', color: s.color }}>{s.label}</span>
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--t3)', fontFamily: 'monospace', fontSize: 10 }}>{inv.ref}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ═══ MODAL: UPGRADE ═══ */}
      {showUpgrade && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowUpgrade(false)}>
          <div style={{ background: '#fff', borderRadius: 16, width: 440, maxWidth: '90vw', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '28px 28px 20px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <span style={{ color: '#fff', fontSize: 22, fontWeight: 600 }}>K</span>
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>Passer à KAi Pro</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 16 }}>Copilote opérationnel pour {roleLabels[role]}s</div>
              <div style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-1px', marginBottom: 4 }}>{getKaiProPrice(role)} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--t3)' }}>/ mois</span></div>
            </div>
            <div style={{ padding: '0 28px 20px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 8 }}>Inclus dans Pro</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 20 }}>
                {PLANS.gold.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--tx)' }}>
                    <span style={{ color: '#7C3AED', fontWeight: 600 }}><Check size={12}/></span> {f}
                  </div>
                ))}
              </div>
              <div style={{ padding: '14px 16px', background: 'var(--s2)', borderRadius: 10, marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>Moyen de paiement</div>
                <div style={{ fontSize: 12, color: 'var(--t2)' }}>{payMethod.name ? `${payMethod.name} — ${payMethod.numero}` : 'Aucun — à configurer'}</div>
              </div>
            </div>
            <div style={{ padding: '14px 28px 24px', borderTop: '1px solid var(--border)' }}>
              {upgraded ? (
                <div style={{ textAlign: 'center', padding: '8px 0' }}>
                  <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center', color: '#34C759' }}><Check size={24}/></div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#34C759' }}>KAI Pro activé avec succès</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>Actif dans tous vos espaces</div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setShowUpgrade(false)} disabled={upgrading} style={{ flex: 1, padding: '11px 16px', borderRadius: 10, background: 'var(--s2)', color: 'var(--t3)', border: '1px solid var(--border-subtle)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', opacity: upgrading ? .5 : 1 }}>Annuler</button>
                  <button onClick={handleUpgrade} disabled={upgrading} style={{ flex: 2, padding: '11px 16px', borderRadius: 10, background: upgrading ? '#9061E8' : '#7C3AED', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>{upgrading ? 'Activation en cours...' : 'Confirmer et payer'}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: MOYEN DE PAIEMENT ═══ */}
      {showPayMethod && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowPayMethod(false)}>
          <div style={{ background: '#fff', borderRadius: 16, width: 420, maxWidth: '90vw', boxShadow: '0 24px 80px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid var(--border)', fontSize: 16, fontWeight: 600 }}>Moyen de paiement</div>
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={labelStyle}>Type</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[{ k: 'mobile', l: 'Mobile Money', icon: <Smartphone size={16}/> }, { k: 'carte', l: 'Carte bancaire', icon: <CreditCard size={16}/> }, { k: 'banque', l: 'Virement', icon: <Building2 size={16}/> }].map(t => (
                    <div key={t.k} onClick={() => setPayMethod(p => ({ ...p, type: t.k }))} style={{ flex: 1, padding: '10px 8px', borderRadius: 8, border: payMethod.type === t.k ? '2px solid var(--tx)' : '1px solid var(--border-subtle)', background: payMethod.type === t.k ? 'rgba(0,0,0,.02)' : 'var(--surface-1)', cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ fontSize: 16, marginBottom: 2 }}>{t.icon}</div>
                      <div style={{ fontSize: 9, fontWeight: 600 }}>{t.l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div style={labelStyle}>Opérateur / Banque</div>
                <select value={payMethod.name} onChange={e => setPayMethod(p => ({ ...p, name: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--f)', background: 'var(--s2)', color: 'var(--tx)', outline: 'none' }}>
                  <option value="">Sélectionner</option>
                  {payMethod.type === 'mobile' && ['Orange Money', 'MTN MoMo', 'Wave', 'Moov Money'].map(n => <option key={n}>{n}</option>)}
                  {payMethod.type === 'carte' && ['Visa', 'Mastercard'].map(n => <option key={n}>{n}</option>)}
                  {payMethod.type === 'banque' && ['SGBCI', 'BICICI', 'Ecobank', 'BOA'].map(n => <option key={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <div style={labelStyle}>{payMethod.type === 'mobile' ? 'Numéro' : payMethod.type === 'carte' ? 'Numéro de carte' : 'IBAN'}</div>
                <input value={payMethod.numero} onChange={e => setPayMethod(p => ({ ...p, numero: e.target.value }))} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border-subtle)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--f)', background: 'var(--s2)', color: 'var(--tx)', outline: 'none' }} placeholder="+225 07 XX XX XX" />
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setShowPayMethod(false)} style={{ padding: '9px 16px', borderRadius: 8, background: 'var(--s2)', border: '1px solid var(--border-subtle)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', color: 'var(--tx)' }}>Annuler</button>
              <button onClick={() => setShowPayMethod(false)} style={{ padding: '9px 16px', borderRadius: 8, background: 'var(--tx)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
