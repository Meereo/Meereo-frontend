import { Package, Store, Truck, Check } from 'lucide-react'
import { formatDateFR } from '../../utils/helpers'
import { api } from '../../services/api/client'

const DELIVERY_STEPS = ['Commande confirmée', 'En préparation', 'Remise au transport', 'En cours de livraison', 'Livrée']
const PICKUP_STEPS = ['Commande confirmée', 'En préparation', 'Prête pour retrait', 'Récupérée par le client', 'Terminée']
const STATUS_LABELS = { pending: 'En attente', accepted: 'Acceptée', rejected: 'Refusée', preparing: 'En préparation', shipped: 'Expédiée', delivered: 'Livrée', completed: 'Terminée', cancelled: 'Annulée' }
const STATUS_COLORS = { pending: 'var(--wrn)', accepted: 'var(--color-info)', delivered: 'var(--ok)', completed: 'var(--ok)', rejected: 'var(--err)', cancelled: 'var(--err)', preparing: 'var(--color-info)', shipped: 'var(--color-info)' }

export default function Orders({ ctx }) {
  const { sellerOrders, orderFilter, setOrderFilter, fmtMoney, setShowOrderDetail } = ctx

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[['all', 'Toutes'], ['pending', 'En attente'], ['shipped', 'En livraison'], ['delivered', 'Livrées'], ['completed', 'Terminées']].map(([k, l]) => (
          <button key={k} onClick={() => setOrderFilter(k)} style={{ padding: '5px 12px', borderRadius: 100, border: '1px solid var(--border-card)', background: orderFilter === k ? 'var(--surface-1)' : 'none', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--f)', color: 'var(--t2)', fontWeight: orderFilter === k ? 600 : 400, boxShadow: orderFilter === k ? 'var(--shadow-xs)' : 'none' }}>{l}</button>
        ))}
      </div>
      {sellerOrders.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ marginBottom: 12, opacity: .4 }}><Package size={32}/></div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Aucune commande</div>
          <div style={{ fontSize: 12, color: 'var(--t3)' }}>Les commandes apparaîtront ici quand un acheteur commandera vos produits</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sellerOrders.filter(o => orderFilter === 'all' || (orderFilter === 'pending' && o.statut === 'pending') || (orderFilter === 'shipped' && o.statut === 'shipped') || (orderFilter === 'delivered' && o.statut === 'delivered') || (orderFilter === 'completed' && o.statut === 'completed')).map(o => {
            const steps = o.livMode === 'retrait' ? PICKUP_STEPS : DELIVERY_STEPS
            const currentStep = o.step || 1
            return (
              <div key={o.id} className="card" style={{ padding: '14px 18px', cursor: 'pointer' }} onClick={() => setShowOrderDetail(o)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--t4)' }}>{o.ref}</span>
                      <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 7px', borderRadius: 100, background: (STATUS_COLORS[o.statut] || 'var(--t4)') + '14', color: STATUS_COLORS[o.statut] || 'var(--t4)' }}>{STATUS_LABELS[o.statut] || o.statut}</span>
                      <span style={{ fontSize: 8, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: 'var(--s2)', color: 'var(--t3)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>{o.livMode === 'retrait' ? <><Store size={8}/> Retrait</> : <><Truck size={8}/> Livraison</>}</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{o.buyer}</div>
                    <div style={{ fontSize: 11, color: 'var(--t3)' }}>{o.items?.map(it => it.name).join(', ')} · {formatDateFR(o.date)}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{fmtMoney(o.total)}</div>
                    <div style={{ fontSize: 9, color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 3 }}>{o.paymentMethod || '—'} · {o.paymentStatus === 'paid' ? <><Check size={8}/> Payé</> : 'En attente'}</div>
                  </div>
                </div>
                {/* Tracking steps */}
                <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {steps.map((s, si) => (
                    <div key={si} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                      <div style={{ width: '100%', height: 3, borderRadius: 2, background: si < currentStep ? 'var(--tx)' : 'var(--s3)' }} />
                      <span style={{ fontSize: 7, color: si < currentStep ? 'var(--tx)' : 'var(--t4)', fontWeight: si === currentStep - 1 ? 700 : 400, textAlign: 'center', lineHeight: 1.2 }}>{s}</span>
                    </div>
                  ))}
                </div>
                {/* Bouton avancer étape */}
                {currentStep < 5 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation()
                        const nextStep = currentStep + 1
                        try {
                          await api.commandes.update(o.id, { step: nextStep })
                          if (ctx.refreshOrders) ctx.refreshOrders()
                        } catch (err) { console.warn('Erreur avancement:', err) }
                      }}
                      style={{ padding: '5px 14px', borderRadius: 7, border: '1px solid var(--border-card)', background: 'var(--surface-1)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', color: 'var(--tx)', display: 'flex', alignItems: 'center', gap: 5 }}
                    >
                      <Check size={11} /> Étape suivante
                    </button>
                  </div>
                )}
                {/* Partenaire livraison */}
                {o.livMode === 'livraison' && o.partner && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '6px 10px', background: 'var(--s2)', borderRadius: 6 }}>
                    <Truck size={12}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 600 }}>{o.partner.nom} — {o.partner.chauffeur}</div>
                      <div style={{ fontSize: 9, color: 'var(--t4)' }}>{o.partner.vehicule} · {o.partner.tel}</div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
