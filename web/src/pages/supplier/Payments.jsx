import { useState, useEffect, useMemo } from 'react'
import { TrendingUp, Package, Clock, CheckCircle, XCircle, Download, RefreshCw } from 'lucide-react'
import Modal from '../../components/shared/Modal'
import { api } from '../../services/api/client'
import { useDevise } from '../../hooks/useDevise'
import { formatDateFR } from '../../utils/helpers'
import { DSPageHeader, DSKpiStrip, DSFilterBar } from '../../design/components'

// ── Statuts commande → état paiement ───────────────────────────────────────
const PAY_META = {
  pending:    { label: 'En attente',     color: '#E07B00', bg: 'rgba(245,158,11,.08)',  dot: '#E07B00' },
  confirmee:  { label: 'En attente',     color: '#E07B00', bg: 'rgba(245,158,11,.08)',  dot: '#E07B00' },
  accepted:   { label: 'En cours',       color: '#007AFF', bg: 'rgba(0,122,255,.08)',   dot: '#007AFF' },
  preparing:  { label: 'En préparation', color: '#007AFF', bg: 'rgba(0,122,255,.08)',   dot: '#007AFF' },
  shipped:    { label: 'Expédié',        color: '#7C3AED', bg: 'rgba(124,58,237,.08)',  dot: '#7C3AED' },
  delivered:  { label: 'Livré',          color: 'var(--ok)', bg: 'rgba(52,199,89,.08)', dot: 'var(--ok)' },
  completed:  { label: 'Payé',           color: 'var(--ok)', bg: 'rgba(52,199,89,.08)', dot: 'var(--ok)' },
  cancelled:  { label: 'Annulé',         color: 'var(--t4)', bg: 'var(--s2)',            dot: 'var(--t4)' },
  annulee:    { label: 'Annulé',         color: 'var(--t4)', bg: 'var(--s2)',            dot: 'var(--t4)' },
  rejected:   { label: 'Refusé',         color: 'var(--err)', bg: 'rgba(220,38,38,.07)', dot: 'var(--err)' },
}

const STEP_LABELS = [
  'Commande reçue',
  'En préparation',
  'Expédiée / Prête',
  'En cours de livraison',
  'Livrée & payée',
]

const STATUS_TO_STEP = {
  pending: 1, confirmee: 1,
  accepted: 1, preparing: 2,
  shipped: 3, delivered: 4,
  completed: 5,
  cancelled: 0, annulee: 0, rejected: 0,
}

function Badge({ statut }) {
  const m = PAY_META[statut] || PAY_META.pending
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: m.bg, color: m.color, whiteSpace: 'nowrap' }}>
      {m.label}
    </span>
  )
}

function PayMethodBadge({ method }) {
  if (!method) return null
  const icons = { wave: 'ŒŠ', orange_money: 'Ÿé', mtn: 'Ÿé', mobile_money: '“é', carte: '’é', virement: 'éé', especes: '’é' }
  const labels = { wave: 'Wave', orange_money: 'Orange Money', mtn: 'MTN MoMo', mobile_money: 'Mobile Money', carte: 'Carte', virement: 'Virement', especes: 'Espéces' }
  return (
    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 6, background: 'var(--s2)', color: 'var(--t3)', whiteSpace: 'nowrap' }}>
      {icons[method] || '’é'} {labels[method] || method}
    </span>
  )
}

const TABS = [
  { key: 'all',       label: 'Tout' },
  { key: 'received',  label: 'Payés' },
  { key: 'pending',   label: 'En cours' },
  { key: 'cancelled', label: 'Annulés' },
]

export default function Payments({ showToast }) {
  const { format: fmt, formatShort } = useDevise()
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [tab, setTab]           = useState('all')
  const [detail, setDetail]     = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = () => {
    setRefreshing(true)
    api.commandes.getAll()
      .then(raw => {
        if (!Array.isArray(raw)) return
        setOrders(raw.map(o => ({
          id:            o.id,
          ref:           o.ref || 'CMD-' + String(o.id).slice(-6).toUpperCase(),
          buyer:         o.buyer?.company || o.buyer?.name || o.fournisseur || 'Acheteur',
          buyerId:       o.buyer?.id || o.buyerId,
          items:         Array.isArray(o.items) ? o.items : [],
          total:         parseFloat(o.total) || 0,
          statut:        o.statut || 'pending',
          livMode:       o.livMode || 'retrait',
          step:          o.step || 1,
          address:       o.address || '',
          paymentMethod: o.paymentMethod || '',
          createdAt:     o.createdAt,
          updatedAt:     o.updatedAt,
          designation:   o.designation || '',
        })))
      })
      .catch(() => {})
      .finally(() => { setLoading(false); setRefreshing(false) })
  }

  useEffect(() => { load() }, [])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived ──────────────────────────────────────────────────────────────
  const received   = useMemo(() => orders.filter(o => o.statut === 'completed' || o.statut === 'delivered'), [orders])
  const inProgress = useMemo(() => orders.filter(o => ['pending','confirmee','accepted','preparing','shipped'].includes(o.statut)), [orders])
  const cancelled  = useMemo(() => orders.filter(o => ['cancelled','annulee','rejected'].includes(o.statut)), [orders])

  const totalReceived   = useMemo(() => received.reduce((s, o) => s + o.total, 0), [received])
  const totalInProgress = useMemo(() => inProgress.reduce((s, o) => s + o.total, 0), [inProgress])

  const displayed = useMemo(() => {
    if (tab === 'received')  return received
    if (tab === 'pending')   return inProgress
    if (tab === 'cancelled') return cancelled
    return orders
  }, [tab, orders, received, inProgress, cancelled])

  // Methods breakdown
  const methodsBreakdown = useMemo(() => {
    const map = {}
    received.forEach(o => {
      const m = o.paymentMethod || 'non_précisé'
      if (!map[m]) map[m] = { method: m, count: 0, total: 0 }
      map[m].count++
      map[m].total += o.total
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [received])

  // ── Export CSV ────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const rows = [
      ['Réf', 'Acheteur', 'Produits', 'Montant', 'Méthode', 'Statut', 'Date'],
      ...displayed.map(o => [
        o.ref, o.buyer,
        o.items.map(it => it.name || it.designation || '').join(' + ') || o.designation,
        o.total, o.paymentMethod || '', o.statut,
        o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR') : '',
      ])
    ]
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'paiements_meereo.csv'; a.click()
    URL.revokeObjectURL(url)
    showToast && showToast('Export téléchargé')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', opacity: .4 }}>
      <div style={{ width: 24, height: 24, border: '2.5px solid var(--border)', borderTopColor: 'var(--tx)', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
    </div>
  )

  return (
    <div>
      <DSPageHeader title="Paiements" subtitle={`${orders.length} commande${orders.length > 1 ? 's' : ''} à chiffre d'affaires marketplace`}>
        <DSFilterBar filters={TABS} active={tab} onChange={setTab} />
        <button
          className="btn btn-sm"
          onClick={() => load()}
          disabled={refreshing}
          title="Actualiser"
          style={{ opacity: refreshing ? .5 : 1, transition: 'opacity .2s' }}
        >
          <RefreshCw size={13} style={{ display: 'inline', marginRight: 4, animation: refreshing ? 'spin .6s linear infinite' : 'none' }} />
          {refreshing ? '…' : 'Actualiser'}
        </button>
        <button className="btn btn-sm" onClick={exportCSV}>
          <Download size={13} style={{ display: 'inline', marginRight: 4 }} />
          Exporter
        </button>
      </DSPageHeader>

      {/* KPIs */}
      <DSKpiStrip hero items={[
        { value: formatShort(totalReceived),   label: 'Encaissé',       sub: received.length + ' commandes livrées', color: 'var(--ok)' },
        { value: formatShort(totalInProgress), label: 'En attente',     sub: inProgress.length + ' en cours',        color: '#E07B00' },
        { value: String(orders.length),        label: 'Total commandes', sub: cancelled.length + ' annulées' },
        { value: String(methodsBreakdown.length || 0), label: 'Méthodes de paiement', sub: methodsBreakdown[0]?.method ? (methodsBreakdown[0].method) : 'Aucune' },
      ]} />

      {/* Breakdown par méthode (si payements reçus) */}
      {methodsBreakdown.length > 0 && (
        <div className="card" style={{ padding: '16px 20px', marginBottom: 16, display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', flexShrink: 0 }}>Répartition</span>
          {methodsBreakdown.map(m => (
            <div key={m.method} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PayMethodBadge method={m.method} />
              <span style={{ fontSize: 12, fontWeight: 700 }}>{formatShort(m.total)}</span>
              <span style={{ fontSize: 10, color: 'var(--t4)' }}>({m.count} cmd)</span>
            </div>
          ))}
        </div>
      )}

      {/* Liste des commandes */}
      {displayed.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ marginBottom: 12, opacity: .3, display: 'flex', justifyContent: 'center' }}>
            <TrendingUp size={32} />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tx)', marginBottom: 6 }}>
            {tab === 'received' ? 'Aucun paiement encaissé' : tab === 'pending' ? 'Aucune commande en cours' : tab === 'cancelled' ? 'Aucune commande annulée' : 'Aucune commande'}
          </div>
          <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.6, maxWidth: 380, margin: '0 auto' }}>
            {tab === 'all' ? 'Vos ventes sur la marketplace apparaîtront ici.' : 'Rien dans cette catégorie pour l\'instant.'}
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Header table */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 130px 100px', gap: 8, padding: '10px 20px', background: 'var(--s2)', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
            <span>Commande</span>
            <span>Méthode</span>
            <span style={{ textAlign: 'right' }}>Montant</span>
            <span style={{ textAlign: 'center' }}>Statut</span>
            <span style={{ textAlign: 'right' }}>Date</span>
          </div>

          {displayed.map((o, i) => {
            const m = PAY_META[o.statut] || PAY_META.pending
            const productNames = o.items.map(it => it.name || it.designation || '').filter(Boolean).join(', ') || o.designation || '—'
            return (
              <div
                key={o.id}
                style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 130px 100px', gap: 8, padding: '14px 20px', borderBottom: i < displayed.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center', cursor: 'pointer', transition: 'background .12s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--s2)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
                onClick={() => setDetail(o)}
              >
                {/* Col 1: Commande */}
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{o.ref}</span>
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', paddingLeft: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {o.buyer} à {productNames}
                  </div>
                </div>
                {/* Col 2: Méthode */}
                <div><PayMethodBadge method={o.paymentMethod} /></div>
                {/* Col 3: Montant */}
                <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 800, color: (o.statut === 'completed' || o.statut === 'delivered') ? 'var(--ok)' : 'var(--tx)' }}>
                  {(o.statut === 'completed' || o.statut === 'delivered') ? '+' : ''}{fmt(o.total)}
                </div>
                {/* Col 4: Statut */}
                <div style={{ textAlign: 'center' }}><Badge statut={o.statut} /></div>
                {/* Col 5: Date */}
                <div style={{ textAlign: 'right', fontSize: 10, color: 'var(--t4)' }}>
                  {o.createdAt ? formatDateFR(o.createdAt) : '—'}
                </div>
              </div>
            )
          })}

          {/* Totaux */}
          {displayed.length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 100px 130px 100px', gap: 8, padding: '12px 20px', borderTop: '2px solid var(--border)', background: 'var(--s2)' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', paddingLeft: 14 }}>TOTAL ({displayed.length})</span>
              <span />
              <span style={{ textAlign: 'right', fontSize: 14, fontWeight: 800 }}>
                {formatShort(displayed.reduce((s, o) => s + o.total, 0))}
              </span>
              <span />
              <span />
            </div>
          )}
        </div>
      )}

      {/* ── Modal Détail commande ─────────────────────────────────────────── */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setDetail(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 460, maxHeight: '85vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.22)' }} onClick={e => e.stopPropagation()}>
            {/* Hero */}
            <div style={{ padding: '20px 22px 16px', background: 'linear-gradient(145deg,#0f1011,#2a2c2d)', color: '#fff', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginBottom: 4, letterSpacing: '.06em', textTransform: 'uppercase' }}>Commande</div>
                  <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.5px' }}>{detail.ref}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 2 }}>{detail.buyer}</div>
                </div>
                <button onClick={() => setDetail(null)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,.08)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'rgba(255,255,255,.6)' }}>×</button>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1.5px' }}>{fmt(detail.total)}</div>
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <Badge statut={detail.statut} />
                {detail.paymentMethod && <PayMethodBadge method={detail.paymentMethod} />}
                {detail.livMode && (
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>
                    {detail.livMode === 'livraison' ? 'šš Livraison' : detail.livMode === 'retrait' ? 'éé Retrait' : detail.livMode}
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Produits */}
              {detail.items.length > 0 && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Produits commandûs</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {detail.items.map((it, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: 'var(--s2)', borderRadius: 8 }}>
                        {it.imageUrl && <img src={it.imageUrl} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.name || it.designation || 'Produit'}</div>
                          {it.unit && <div style={{ fontSize: 10, color: 'var(--t4)' }}>Unité : {it.unit}</div>}
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          {it.qty && <div style={{ fontSize: 11, color: 'var(--t3)' }}>à {it.qty}</div>}
                          {it.price && <div style={{ fontSize: 12, fontWeight: 700 }}>{fmt(parseFloat(it.price) * (it.qty || 1))}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Progression */}
              {!['cancelled', 'annulee', 'rejected'].includes(detail.statut) && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Progression</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {STEP_LABELS.map((label, idx) => {
                      const curStep = STATUS_TO_STEP[detail.statut] || 1
                      const done = (idx + 1) < curStep
                      const active = (idx + 1) === curStep
                      return (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: done ? 'var(--ok)' : active ? 'var(--tx)' : 'var(--s2)', border: active ? 'none' : done ? 'none' : '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {done
                              ? <CheckCircle size={12} style={{ color: '#fff' }} />
                              : active
                              ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />
                              : null
                            }
                          </div>
                          <span style={{ fontSize: 12, fontWeight: active ? 700 : 400, color: done ? 'var(--ok)' : active ? 'var(--tx)' : 'var(--t4)' }}>{label}</span>
                          {active && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--t4)' }}>En cours</span>}
                          {done && <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--ok)' }}>éœ“</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Infos livraison */}
              {detail.address && (
                <div style={{ padding: '10px 12px', background: 'var(--s2)', borderRadius: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 4 }}>Adresse de livraison</div>
                  <div style={{ fontSize: 12 }}>{detail.address}</div>
                </div>
              )}

              {/* Dates */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {detail.createdAt && (
                  <div style={{ padding: '8px 12px', background: 'var(--s2)', borderRadius: 8, flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 2 }}>Passée le</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{formatDateFR(detail.createdAt)}</div>
                  </div>
                )}
                {detail.updatedAt && detail.updatedAt !== detail.createdAt && (
                  <div style={{ padding: '8px 12px', background: 'var(--s2)', borderRadius: 8, flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 2 }}>Mise à jour</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{formatDateFR(detail.updatedAt)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

