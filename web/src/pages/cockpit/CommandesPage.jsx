import { useState } from 'react'
import { useMeereo } from '../../hooks/useMeereoStore'
import { useMergedData } from '../../hooks/useMergedData'
import { useDevise } from '../../hooks/useDevise'
import { formatDateFR } from '../../utils/helpers'
import { DSPageHeader, DSKpiStrip, DSFilterBar , DSEmptyState } from '../../design/components'
import { Package, Truck, Home, Store, Check, Star, MapPin, Phone } from 'lucide-react'

const fmt = n => new Intl.NumberFormat('fr-FR').format(n || 0)
const STEPS = [
  { id: 1, label: 'Confirmée', icon: <Check size={13}/> },
  { id: 2, label: 'Préparation', icon: <Package size={13}/> },
  { id: 3, label: 'Collecte', icon: <Truck size={13}/> },
  { id: 4, label: 'En transit', icon: <MapPin size={13}/> },
  { id: 5, label: 'Livrée', icon: <Home size={13}/> },
]

export default function CommandesPage({ onNavigate, showToast, openModal }) {
  const { updateStore } = useMeereo()
  const { format: fmtMoney } = useDevise()
  const { commandes: allCommandes } = useMergedData()
  const [filter, setFilter] = useState('all')
  const [tracking, setTracking] = useState(null)
  const [detail, setDetail] = useState(null)
  const [evalFourn, setEvalFourn] = useState(null)
  const [rated, setRated] = useState([])

  const total = allCommandes.length
  const enCours = allCommandes.filter(c => c.step < 5).length
  const livres = allCommandes.filter(c => c.step === 5).length

  const filtered = allCommandes.filter(c => {
    if (filter === 'en_cours') return c.step < 5
    if (filter === 'livre') return c.step === 5
    return true
  })

  return (
    <div>
      <DSPageHeader title="Commandes" subtitle={`${total} commandes · ${enCours} en cours`}>
        <DSFilterBar filters={[{key:'all',label:'Toutes'},{key:'en_cours',label:'En cours'},{key:'livre',label:'Livrées'}]} active={filter} onChange={setFilter} />
        <button className="btn btn-primary btn-sm" onClick={() => openModal('newCommande')}>+ Nouvelle commande</button>
        <button className="btn btn-primary btn-sm" onClick={() => onNavigate && onNavigate('marketplace')}>+ Commander</button>
      </DSPageHeader>

      <DSKpiStrip items={[
        { icon: <Package size={14}/>, iconBg: 'var(--s2)', value: total, label: 'Total' },
        { icon: <Truck size={14}/>, iconBg: 'var(--s2)', value: enCours, label: 'En cours' },
        { icon: <Check size={14}/>, iconBg: 'var(--s2)', value: livres, label: 'Livrées' },
        { value: fmt(allCommandes.reduce((s, c) => s + (c.montant || 0), 0)), label: 'FCFA total' },
      ]} />

      {/* Liste */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0 && (
          <DSEmptyState icon={<Package size={24}/>} title="Aucune commande" description="Passez votre première commande depuis le Marketplace." actionLabel="Aller au Marketplace" onAction={() => onNavigate && onNavigate('marketplace')} />
        )}
        {filtered.map(c => {
          const step = STEPS.find(s => s.id === c.step) || STEPS[0]
          const isActive = c.step < 5
          return (
            <div key={c.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px' }}>
                {c.img ? (
                  <img src={c.img} alt="" style={{ width: 42, height: 42, borderRadius: 11, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
                ) : (
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: isActive ? 'var(--tx)' : 'rgba(52,199,89,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: isActive ? '#fff' : 'var(--ok)', flexShrink: 0 }}>{step.icon}</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: 'var(--tx)' }}>{c.ref}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: isActive ? 'rgba(245,158,11,.08)' : 'rgba(52,199,89,.08)', color: isActive ? '#F59E0B' : 'var(--ok)' }}>{step.label}</span>
                    {c.livMode === 'livraison' && <span style={{ fontSize: 9, color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 3 }}><Truck size={9}/> Livraison</span>}
                    {c.livMode === 'retrait' && <span style={{ fontSize: 9, color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 3 }}><Store size={9}/> Retrait</span>}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{c.designation}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)' }}>{c.fournisseur} · {c.projet} · {formatDateFR(c.date)}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-.4px' }}>{fmtMoney(c.montant)}</div>
                  {c.refLiv && <div style={{ fontFamily: 'monospace', fontSize: 9, color: 'var(--t4)', marginTop: 2 }}>{c.refLiv}</div>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                  {!isActive && rated.includes(c.id) && <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: 'rgba(52,199,89,.08)', color: 'var(--ok)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Check size={9}/> Evalué</span>}
                  <button className="btn btn-sm" style={{ fontSize: 10, padding: '5px 10px' }} onClick={() => setDetail(c)}>Voir</button>
                  {isActive && c.livMode === 'livraison' && <button style={{ fontSize: 10, padding: '5px 10px', borderRadius: 6, background: 'var(--tx)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontWeight: 700 }} onClick={() => setTracking(c)}>Suivre</button>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ═══ Modal: Detail commande ═══ */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setDetail(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 480, boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', background: 'linear-gradient(145deg,#0f1011,#2a2c2d)', color: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'rgba(255,255,255,.5)', marginBottom: 4 }}>{detail.ref}</div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{detail.designation}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,.5)', marginTop: 3 }}>{detail.fournisseur} · {formatDateFR(detail.date)}</div>
                </div>
                <button onClick={() => setDetail(null)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'rgba(255,255,255,.6)' }}>×</button>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 12 }}>{fmtMoney(detail.montant)}</div>
            </div>
            <div style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: '10px 12px', background: 'var(--s2)', borderRadius: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 3 }}>Projet</div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{detail.projet}</div>
                </div>
                <div style={{ padding: '10px 12px', background: 'var(--s2)', borderRadius: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 3 }}>Livraison</div>
                  <div style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>{detail.livMode === 'livraison' ? <><Truck size={12}/> Livraison MEEREO</> : <><Store size={12}/> Retrait</>}</div>
                </div>
              </div>
              {detail.partner && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--s2)', borderRadius: 8 }}>
                  <Truck size={18}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{detail.partner.nom}</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)' }}>{detail.partner.chauffeur} · {detail.partner.vehicule} · {detail.partner.plaque}</div>
                  </div>
                  <button onClick={() => showToast && showToast('Appel en cours...')} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--ok)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Phone size={13}/></button>
                </div>
              )}
              {/* Steps */}
              <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
                {STEPS.map(s => (
                  <div key={s.id} style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ width: '100%', height: 3, borderRadius: 100, background: s.id <= detail.step ? 'var(--tx)' : 'var(--s3)', marginBottom: 4 }} />
                    <div style={{ fontSize: 9, fontWeight: s.id <= detail.step ? 700 : 500, color: s.id <= detail.step ? 'var(--tx)' : 'var(--t4)' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              {detail.step < 5 && detail.livMode === 'livraison' && (
                <button style={{ flex: 1, padding: '10px 16px', borderRadius: 10, background: 'var(--tx)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 13 }} onClick={() => { setDetail(null); setTracking(detail) }}>Suivre en direct</button>
              )}
              {detail.step < 5 && (
                <button style={{ flex: 1, padding: '10px 16px', borderRadius: 10, background: 'var(--ok)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 13 }} onClick={() => { const cmd = { ...detail, step: 5, statut: 'livre' }; setDetail(null); setEvalFourn({ cmd, ratings: { stars: 0, qualite: 0, delai: 0, emballage: 0, comment: '' } }) }}>Confirmer reception</button>
              )}
              {detail.step === 5 && (
                <div style={{ flex: 1, padding: '10px 16px', borderRadius: 10, background: 'rgba(52,199,89,.06)', border: '1px solid rgba(52,199,89,.12)', textAlign: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ok)', display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12}/> Commande livrée</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Modal: Tracking GPS ═══ */}
      {tracking && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2100, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setTracking(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 560, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.25)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px', background: 'linear-gradient(145deg,#0f1011,#2a2c2d)', color: '#fff', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Suivi en temps reel</div>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>{tracking.ref}</div>
                  {tracking.refLiv && <span style={{ fontSize: 9, fontFamily: 'monospace', padding: '2px 7px', borderRadius: 4, background: 'rgba(245,158,11,.15)', color: '#F59E0B', marginTop: 4, display: 'inline-block' }}>{tracking.refLiv}</span>}
                </div>
                <button onClick={() => setTracking(null)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'rgba(255,255,255,.6)' }}>×</button>
              </div>
              {/* GPS Map */}
              <div style={{ height: 150, borderRadius: 12, background: '#1a2332', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)' }}>
                {[0, 1, 2, 3, 4].map(i => <div key={'h' + i} style={{ position: 'absolute', left: 0, right: 0, top: (i * 25) + '%', height: 1, background: 'rgba(255,255,255,.04)' }} />)}
                {[0, 1, 2, 3, 4, 5, 6].map(i => <div key={'v' + i} style={{ position: 'absolute', top: 0, bottom: 0, left: (i * 16.6) + '%', width: 1, background: 'rgba(255,255,255,.04)' }} />)}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                  <path d="M 50 120 Q 140 50 260 70 Q 380 90 500 40" fill="none" stroke="rgba(245,158,11,.3)" strokeWidth="2" strokeDasharray="6,4" />
                  <path d={`M 50 120 Q 140 50 ${50 + (tracking.step / 5) * 450} ${120 - (tracking.step / 5) * 80}`} fill="none" stroke="#F59E0B" strokeWidth="3" />
                </svg>
                <div style={{ position: 'absolute', left: 40, top: 110, width: 18, height: 18, borderRadius: '50%', background: 'var(--ok)', border: '2px solid #1a2332', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Package size={8}/></div>
                <div style={{ position: 'absolute', right: 45, top: 28, width: 18, height: 18, borderRadius: '50%', background: '#fff', border: '2px solid #1a2332', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a2332' }}><Home size={8}/></div>
                <div style={{ position: 'absolute', left: `${8 + (tracking.step / 5) * 78}%`, top: `${78 - (tracking.step / 5) * 55}%`, transform: 'translate(-50%,-50%)', width: 28, height: 28, borderRadius: '50%', background: '#F59E0B', border: '3px solid #1a2332', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 0 16px rgba(245,158,11,.5)', animation: 'kaibreathe 2s ease-in-out infinite', transition: 'left 1s, top 1s' }}><Truck size={12}/></div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              {/* Timeline */}
              {STEPS.map((s, i) => {
                const done = s.id <= tracking.step
                const current = s.id === tracking.step
                return (
                  <div key={s.id} style={{ display: 'flex', gap: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: done ? 'var(--tx)' : 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: done ? '#fff' : 'var(--t4)', boxShadow: current ? '0 0 0 4px rgba(0,0,0,.06)' : 'none' }}>{done ? <Check size={12}/> : s.icon}</div>
                      {i < STEPS.length - 1 && <div style={{ width: 2, height: 28, background: done ? 'var(--tx)' : 'var(--s3)' }} />}
                    </div>
                    <div style={{ paddingBottom: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: done ? 700 : 500, color: done ? 'var(--tx)' : 'var(--t4)' }}>{s.label}</div>
                      {current && <div style={{ fontSize: 10, color: '#F59E0B', fontWeight: 600, marginTop: 2 }}>● En cours...</div>}
                    </div>
                  </div>
                )
              })}
              {/* Partner */}
              {tracking.partner && (
                <div style={{ padding: '12px 14px', background: 'var(--s2)', borderRadius: 10, marginTop: 8 }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 6 }}>Partenaire logistique</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}><Truck size={14}/></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{tracking.partner.nom}</div>
                      <div style={{ fontSize: 10, color: 'var(--t3)' }}>{tracking.partner.chauffeur} · {tracking.partner.vehicule} · {tracking.partner.plaque}</div>
                    </div>
                    <button onClick={() => showToast && showToast('Appel en cours...')} style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--ok)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Phone size={12}/></button>
                  </div>
                </div>
              )}
            </div>
            {tracking.step < 5 && (
              <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => showToast && showToast('Support contacte')}>Support</button>
                <button style={{ flex: 1, padding: '10px 16px', borderRadius: 10, background: 'var(--tx)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 13 }} onClick={() => { const cmd = { ...tracking, step: 5, statut: 'livre' }; setTracking(null); setEvalFourn({ cmd, ratings: { stars: 0, qualite: 0, delai: 0, emballage: 0, comment: '' } }) }}>Confirmer reception</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ Modal: Evaluer le fournisseur ═══ */}
      {evalFourn && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2200, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => { setEvalFourn(null); showToast && showToast('Réception confirmée') }}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 460, boxShadow: '0 24px 80px rgba(0,0,0,.2)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>Evaluer le fournisseur</div>
              <div style={{ fontSize: 12, color: 'var(--t3)' }}>{evalFourn.cmd.fournisseur} · {evalFourn.cmd.ref}</div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--s2)', borderRadius: 10, marginBottom: 16 }}>
                {evalFourn.cmd.img ? (
                  <img src={evalFourn.cmd.img} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{evalFourn.cmd.fournisseur.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}</div>
                )}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{evalFourn.cmd.designation}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)' }}>{fmtMoney(evalFourn.cmd.montant)}</div>
                </div>
              </div>
              {[['stars', 'Note globale'], ['qualite', 'Qualite des produits'], ['delai', 'Respect du delai'], ['emballage', 'Emballage & livraison']].map(([field, label]) => (
                <div key={field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--t2)' }}>{label}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} onClick={() => setEvalFourn(p => ({ ...p, ratings: { ...p.ratings, [field]: s } }))} style={{ cursor: 'pointer', color: s <= evalFourn.ratings[field] ? '#F59E0B' : 'var(--s3)', transition: 'color .1s' }}><Star size={22} fill={s <= evalFourn.ratings[field] ? '#F59E0B' : 'none'}/></span>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 12 }}>
                <textarea placeholder="Commentaire (optionnel)..." value={evalFourn.ratings.comment} onChange={e => setEvalFourn(p => ({ ...p, ratings: { ...p.ratings, comment: e.target.value } }))} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 12, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)', resize: 'vertical', minHeight: 50 }} />
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-sm" onClick={() => { setEvalFourn(null); showToast && showToast('Réception confirmée') }}>Plus tard</button>
              <button style={{ padding: '8px 18px', borderRadius: 10, background: 'var(--tx)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 13 }} onClick={() => {
                if (evalFourn.ratings.stars > 0) {
                  updateStore(prev => ({
                    ...prev,
                    reviews: [...(prev.reviews || []), {
                      id: 'rev_' + Date.now(),
                      fournisseur: evalFourn.cmd.fournisseur,
                      commandeId: evalFourn.cmd.id,
                      stars: evalFourn.ratings.stars,
                      qualite: evalFourn.ratings.qualite,
                      delai: evalFourn.ratings.delai,
                      emballage: evalFourn.ratings.emballage,
                      comment: evalFourn.ratings.comment,
                      createdAt: new Date().toISOString(),
                    }]
                  }))
                }
                setRated(prev => [...prev, evalFourn.cmd.id])
                setEvalFourn(null)
                showToast && showToast('Merci ! Note mise à jour pour ' + evalFourn.cmd.fournisseur)
              }}>Envoyer l'evaluation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
