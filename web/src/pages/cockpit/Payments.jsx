// === FICHIER : web/src/pages/cockpit/PaiementsPage.jsx ===
import { useState, useEffect, useCallback } from 'react'
import { CreditCard, Smartphone, Building2, CheckCircle, AlertCircle, Clock, X, ChevronRight } from 'lucide-react'
import { api } from '../../services/api/client'
import { useMeereo } from '../../hooks/useMeereoStore'
import { useDevise } from '../../hooks/useDevise'
import { useInterval } from '../../hooks/useInterval'
import { DSPageHeader, DSFilterBar, DSEmptyState, DSStatusBadge } from '../../design/components'
import Modal from '../../components/shared/Modal'
import ModalConfirm from '../../components/shared/ModalConfirm'
import MoneyInput from '../../components/shared/MoneyInput'
import { formatDateFR } from '../../utils/helpers'

const STATUS_META = {
  PAY_INIT:           { label:'Initié',              color:'var(--t4)',   bg:'var(--s2)' },
  PAY_PENDING:        { label:'En cours',             color:'#E07B00',    bg:'rgba(255,149,0,.08)' },
  FUNDS_CONFIRMED:    { label:'Confirmé',             color:'var(--ok)',  bg:'rgba(52,199,89,.08)' },
  HELD_FOR_MILESTONE: { label:'Sécurisé',             color:'#007AFF',   bg:'rgba(0,122,255,.08)' },
  PAYOUT_REQUESTED:   { label:'Libération demandée',  color:'#E07B00',   bg:'rgba(255,149,0,.08)' },
  PAYOUT_DONE:        { label:'Versé',                color:'var(--ok)', bg:'rgba(52,199,89,.08)' },
  DISPUTE_OPEN:       { label:'Litige',               color:'var(--err)',bg:'rgba(220,38,38,.07)' },
  REVERSED:           { label:'Remboursé',            color:'var(--t3)', bg:'var(--s2)' },
}

const MILESTONE_STATUS = {
  pending:    { label:'En attente', color:'var(--t4)' },
  in_progress:{ label:'En cours',   color:'#007AFF' },
  completed:  { label:'Terminé',    color:'var(--ok)' },
  disputed:   { label:'Contesté',   color:'var(--err)' },
}

const RAILS = [
  { value:'virement',      label:'Virement bancaire' },
  { value:'carte',         label:'Carte bancaire' },
  { value:'wave',          label:'Wave' },
  { value:'orange_money',  label:'Orange Money' },
  { value:'mtn',           label:'MTN MoMo' },
  { value:'mobile_money',  label:'Mobile Money (générique)' },
]

const MOBILE_RAILS = ['wave','orange_money','mtn','mobile_money']

const TABS = [
  { key:'liste',   label:'Paiements' },
  { key:'escrow',  label:'Escrow / Marchés' },
]

function StatusBadge({ status }) {
  const m = STATUS_META[status] || { label: status, color:'var(--t4)', bg:'var(--s2)' }
  return <span style={{ fontSize:10, fontWeight:600, padding:'3px 9px', borderRadius:100, background:m.bg, color:m.color, whiteSpace:'nowrap' }}>{m.label}</span>
}

function Spinner({ size = 20 }) {
  return <div style={{ width:size, height:size, border:`2px solid var(--border)`, borderTopColor:'var(--tx)', borderRadius:'50%', animation:'spin .6s linear infinite' }} />
}

export default function Payments({ showToast }) {
  const { store } = useMeereo()
  const { format: fmt } = useDevise()
  const projects = store.projects || []
  const markets  = store.markets  || []

  const [tab,        setTab]        = useState('liste')
  const [payments,   setPayments]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [selected,   setSelected]   = useState(null) // full payment detail
  const [logs,       setLogs]       = useState({ proofs:[], validations:[] })
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerLoading, setDrawerLoading] = useState(false)

  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [railFilter,   setRailFilter]   = useState('')

  // Create modal
  const [showCreate, setShowCreate] = useState(false)
  const [form,       setForm]       = useState({ amount:'', rail:'virement', label:'', projectId:'', marketId:'', milestones:[] })
  const [creating,   setCreating]   = useState(false)

  // Milestone form in drawer
  const [mlForm,     setMlForm]     = useState({ title:'', amount:'' })

  // Polling: refresh selected payment every 5s if status = PAY_PENDING
  const isPolling = selected?.status === 'PAY_PENDING'
  const refreshSelected = useCallback(async () => {
    if (!selected) return
    try {
      const updated = await api.payments.getPayment(selected.id)
      setSelected(updated)
      setPayments(prev => prev.map(p => p.id === updated.id ? updated : p))
    } catch { /* silent */ }
  }, [selected])
  useInterval(refreshSelected, isPolling ? 5000 : null)

  // â”€â”€â”€ Fetch list â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const fetchPayments = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (statusFilter) params.status = statusFilter
      if (railFilter)   params.rail   = railFilter
      const data = await api.payments.getPayments(params)
      setPayments(data || [])
    } catch (err) {
      showToast && showToast('Erreur chargement paiements : ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, railFilter, showToast])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  // â”€â”€â”€ Open drawer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const openDrawer = async (payment) => {
    setSelected(payment)
    setDrawerOpen(true)
    setDrawerLoading(true)
    try {
      const [detail, logsData] = await Promise.all([
        api.payments.getPayment(payment.id),
        api.payments.getLogs(payment.id),
      ])
      setSelected(detail)
      setLogs(logsData || { proofs:[], validations:[] })
    } catch { /* keep initial data */ }
    finally { setDrawerLoading(false) }
  }

  const closeDrawer = () => { setDrawerOpen(false); setSelected(null); setLogs({ proofs:[], validations:[] }) }

  // â”€â”€â”€ Create payment â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleCreate = async () => {
    if (!form.amount) return
    setCreating(true)
    try {
      const payload = {
        amount:    form.amount,
        rail:      form.rail,
        label:     form.label || 'Paiement',
        projectId: form.projectId || null,
        marketId:  form.marketId  || null,
        milestones: form.milestones.length > 0 ? form.milestones : undefined,
      }
      await api.payments.createPayment(payload)
      showToast && showToast('Ordre de paiement créé')
      setShowCreate(false)
      setForm({ amount:'', rail:'virement', label:'', projectId:'', marketId:'', milestones:[] })
      fetchPayments()
    } catch (err) {
      showToast && showToast(err.message)
    } finally {
      setCreating(false)
    }
  }

  // â”€â”€â”€ Status transition â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleStatusUpdate = async (id, status) => {
    try {
      const updated = await api.payments.updateStatus(id, status)
      setSelected(updated)
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p))
      showToast && showToast('Statut mis à jour')
    } catch (err) {
      showToast && showToast(err.message)
    }
  }

  // â”€â”€â”€ Milestone update â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleMilestoneUpdate = async (mid, data) => {
    if (!selected) return
    try {
      await api.payments.updateMilestone(selected.id, mid, data)
      const updated = await api.payments.getPayment(selected.id)
      setSelected(updated)
      showToast && showToast('Jalon mis à jour')
    } catch (err) {
      showToast && showToast(err.message)
    }
  }

  // â”€â”€â”€ Milestone form (add) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const addMilestoneToForm = () => {
    if (!mlForm.title || !mlForm.amount) return
    setForm(prev => ({ ...prev, milestones: [...prev.milestones, { title:mlForm.title, amount:mlForm.amount }] }))
    setMlForm({ title:'', amount:'' })
  }

  // â”€â”€â”€ Filtered payments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const escrowPayments = payments.filter(p => p.milestones && p.milestones.length > 0)
  const displayPayments = tab === 'escrow' ? escrowPayments : payments

  // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <div>
      <DSPageHeader title="Paiements" subtitle="Ordres de paiement · Escrow · Mobile Money">
        <DSFilterBar filters={TABS} active={tab} onChange={setTab} />
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ Nouveau paiement</button>
      </DSPageHeader>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:16 }}>
        <select className="form-input" style={{ width:180 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="form-input" style={{ width:180 }} value={railFilter} onChange={e => setRailFilter(e.target.value)}>
          <option value="">Tous les modes</option>
          {RAILS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'48px 0' }}><Spinner /></div>
      ) : displayPayments.length === 0 ? (
        <DSEmptyState icon="ðŸ’³" title="Aucun paiement" description="Créez un ordre de paiement pour sécuriser un règlement." actionLabel="Nouveau paiement" onAction={() => setShowCreate(true)} />
      ) : (
        <div className="card" style={{ overflow:'hidden' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'var(--s2)', textAlign:'left' }}>
                {['Référence','Libellé','Mode','Montant','Jalons','Statut','Date',''].map((h, i) => (
                  <th key={i} style={{ padding:'10px 18px', fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--t4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {displayPayments.map(p => (
                <tr key={p.id} style={{ borderBottom:'1px solid var(--border)', cursor:'pointer' }} onClick={() => openDrawer(p)}>
                  <td style={{ padding:'12px 18px', fontFamily:'monospace', fontSize:11, fontWeight:700 }}>{p.id.slice(-10).toUpperCase()}</td>
                  <td style={{ padding:'12px 18px', maxWidth:200 }}>
                    <div style={{ fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.label}</div>
                  </td>
                  <td style={{ padding:'12px 18px', color:'var(--t3)', fontSize:12 }}>{RAILS.find(r => r.value === p.rail)?.label || p.rail}</td>
                  <td style={{ padding:'12px 18px', fontWeight:700 }}>{fmt(p.amount)}</td>
                  <td style={{ padding:'12px 18px', color:'var(--t4)', fontSize:12 }}>
                    {p.milestones?.length > 0 ? `${p.milestones.filter(m => m.status === 'completed').length}/${p.milestones.length}` : '—'}
                  </td>
                  <td style={{ padding:'12px 18px' }}>
                    <StatusBadge status={p.status} />
                    {p.status === 'PAY_PENDING' && <span style={{ marginLeft:6 }}><Spinner size={10} /></span>}
                  </td>
                  <td style={{ padding:'12px 18px', color:'var(--t4)', fontSize:12 }}>{formatDateFR(p.createdAt)}</td>
                  <td style={{ padding:'12px 18px' }}><ChevronRight size={14} color="var(--t4)" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* â•â•â• DRAWER — Détail paiement â•â•â• */}
      {drawerOpen && (
        <>
          {/* Overlay */}
          <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,.3)', backdropFilter:'blur(2px)' }} onClick={closeDrawer} />
          {/* Panel */}
          <div style={{ position:'fixed', top:0, right:0, bottom:0, width:500, zIndex:1001, background:'var(--surface-1)', borderLeft:'1px solid var(--border)', boxShadow:'-16px 0 48px rgba(0,0,0,.12)', display:'flex', flexDirection:'column', animation:'cartSlideIn .2s ease' }}>
            {/* Header */}
            <div style={{ padding:'20px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontSize:16, fontWeight:800, marginBottom:4 }}>{selected?.label}</div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <StatusBadge status={selected?.status} />
                  {selected?.status === 'PAY_PENDING' && <span style={{ fontSize:10, color:'var(--wrn)' }}>· polling actif</span>}
                </div>
              </div>
              <button onClick={closeDrawer} style={{ width:32, height:32, borderRadius:8, border:'1px solid var(--border)', background:'var(--surface-1)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)' }}><X size={16} /></button>
            </div>

            {drawerLoading ? (
              <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}><Spinner /></div>
            ) : (
              <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:20 }}>

                {/* Montant + infos */}
                <div className="rg-3" style={{ gap:10 }}>
                  {[
                    { l:'Montant', v:fmt(selected?.amount || 0) },
                    { l:'Mode',    v: RAILS.find(r => r.value === selected?.rail)?.label || selected?.rail },
                    { l:'Créé le', v: formatDateFR(selected?.createdAt) },
                  ].map((k, i) => (
                    <div key={i} style={{ padding:'10px 12px', background:'var(--s2)', borderRadius:10 }}>
                      <div style={{ fontSize:9, fontWeight:700, color:'var(--t4)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:3 }}>{k.l}</div>
                      <div style={{ fontSize:13, fontWeight:700 }}>{k.v}</div>
                    </div>
                  ))}
                </div>

                {/* Mobile money notice */}
                {MOBILE_RAILS.includes(selected?.rail) && (
                  <div style={{ padding:'12px 14px', background:'rgba(255,149,0,.06)', border:'1px solid rgba(255,149,0,.2)', borderRadius:10 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:'#E07B00', marginBottom:3 }}>Intégration mobile money en cours</div>
                    <div style={{ fontSize:11, color:'var(--t3)' }}>Le paiement est suivi manuellement. Les boutons de transition permettent de mettre à jour le statut.</div>
                  </div>
                )}

                {/* Transitions de statut */}
                {selected && (() => {
                  const transitions = {
                    PAY_INIT:           [{ to:'PAY_PENDING',       label:'Initier le virement' }],
                    PAY_PENDING:        [{ to:'FUNDS_CONFIRMED',   label:'Confirmer réception' }, { to:'REVERSED', label:'Annuler' }],
                    FUNDS_CONFIRMED:    [{ to:'HELD_FOR_MILESTONE', label:'Sécuriser (escrow)' }, { to:'PAYOUT_REQUESTED', label:'Demander libération' }],
                    HELD_FOR_MILESTONE: [{ to:'PAYOUT_REQUESTED', label:'Demander libération' }, { to:'DISPUTE_OPEN', label:'Ouvrir un litige' }],
                    PAYOUT_REQUESTED:   [{ to:'PAYOUT_DONE',      label:'Confirmer versement' }, { to:'DISPUTE_OPEN', label:'Ouvrir un litige' }],
                    DISPUTE_OPEN:       [{ to:'PAYOUT_DONE',      label:'Résoudre â†’ verser' },  { to:'REVERSED',    label:'Résoudre â†’ rembourser' }],
                  }
                  const avail = transitions[selected.status] || []
                  if (avail.length === 0) return null
                  return (
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:'var(--t4)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Actions</div>
                      <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                        {avail.map(tr => (
                          <button key={tr.to} className="btn btn-sm" style={{ fontSize:11 }} onClick={() => handleStatusUpdate(selected.id, tr.to)}>
                            {tr.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* Milestones */}
                {selected?.milestones?.length > 0 && (
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:'var(--t4)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Jalons ({selected.milestones.length})</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      {selected.milestones.map(m => {
                        const ms = MILESTONE_STATUS[m.status] || { label:m.status, color:'var(--t4)' }
                        return (
                          <div key={m.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', background:'var(--s2)', borderRadius:10 }}>
                            <div style={{ flex:1, minWidth:0 }}>
                              <div style={{ fontSize:12, fontWeight:600 }}>{m.title}</div>
                              <div style={{ fontSize:10, color:'var(--t4)' }}>{fmt(m.amount)}{m.dueAt ? ' · Échéance '+formatDateFR(m.dueAt) : ''}</div>
                            </div>
                            <span style={{ fontSize:10, fontWeight:600, color:ms.color, flexShrink:0 }}>{ms.label}</span>
                            {m.status !== 'completed' && (
                              <button className="btn btn-sm" style={{ fontSize:9, padding:'3px 8px' }} onClick={() => handleMilestoneUpdate(m.id, { status: m.status === 'pending' ? 'in_progress' : 'completed' })}>
                                {m.status === 'pending' ? 'â–¶ Démarrer' : 'âœ“ Terminer'}
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Preuves */}
                {logs.proofs.length > 0 && (
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:'var(--t4)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:8 }}>Preuves ({logs.proofs.length})</div>
                    {logs.proofs.map(proof => (
                      <div key={proof.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', background:'var(--s2)', borderRadius:8, marginBottom:6 }}>
                        <CheckCircle size={14} color="var(--ok)" />
                        <span style={{ fontSize:11, flex:1 }}>{proof.type}</span>
                        <a href={proof.url} target="_blank" rel="noreferrer" style={{ fontSize:10, color:'#007AFF', textDecoration:'none' }}>Voir</a>
                        <span style={{ fontSize:10, color:'var(--t4)' }}>{formatDateFR(proof.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Timeline logs */}
                {(logs.proofs.length > 0 || logs.validations.length > 0) && (
                  <div>
                    <div style={{ fontSize:10, fontWeight:700, color:'var(--t4)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Timeline</div>
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {[...logs.proofs.map(p => ({ ...p, _kind:'proof' })), ...logs.validations.map(v => ({ ...v, _kind:'validation' }))].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((item, i) => (
                        <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
                          <div style={{ width:8, height:8, borderRadius:'50%', background: item._kind === 'validation' ? (item.validated ? 'var(--ok)' : 'var(--err)') : '#007AFF', marginTop:4, flexShrink:0 }} />
                          <div style={{ flex:1 }}>
                            <div style={{ fontSize:11, fontWeight:600 }}>
                              {item._kind === 'proof' ? `Preuve ajoutée — ${item.type}` : item.validated ? 'Paiement validé' : 'Validation refusée'}
                            </div>
                            {item.comment && <div style={{ fontSize:10, color:'var(--t3)' }}>{item.comment}</div>}
                            <div style={{ fontSize:10, color:'var(--t4)' }}>{formatDateFR(item.createdAt)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* â•â•â• MODAL — Nouveau paiement â•â•â• */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nouveau paiement" wide
        footer={
          <>
            <button className="btn btn-sm" onClick={() => setShowCreate(false)}>Annuler</button>
            <button className="btn btn-primary btn-sm" disabled={!form.amount || creating} onClick={handleCreate}>
              {creating ? 'Création...' : 'Créer l\'ordre'}
            </button>
          </>
        }>
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div className="modal-row" style={{ gap:12 }}>
            <div>
              <label className="form-label">Montant (FCFA) *</label>
              <MoneyInput value={form.amount} onChange={v => setForm(p => ({ ...p, amount:v }))} placeholder="5 000 000" />
            </div>
            <div>
              <label className="form-label">Mode de paiement</label>
              <select className="form-input" value={form.rail} onChange={e => setForm(p => ({ ...p, rail:e.target.value }))}>
                {RAILS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>

          {MOBILE_RAILS.includes(form.rail) && (
            <div style={{ padding:'10px 14px', background:'rgba(255,149,0,.06)', border:'1px solid rgba(255,149,0,.2)', borderRadius:10, fontSize:11, color:'#E07B00' }}>
              Intégration {form.rail.replace('_', ' ')} en cours — le paiement sera enregistré et suivi manuellement.
            </div>
          )}

          <div>
            <label className="form-label">Libellé</label>
            <input className="form-input" value={form.label} onChange={e => setForm(p => ({ ...p, label:e.target.value }))} placeholder="ex: Règlement acompte — Gros Å“uvre" />
          </div>

          <div className="modal-row" style={{ gap:12 }}>
            <div>
              <label className="form-label">Projet associé</label>
              <select className="form-input" value={form.projectId} onChange={e => setForm(p => ({ ...p, projectId:e.target.value, marketId:'' }))}>
                <option value="">Aucun</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Marché associé</label>
              <select className="form-input" value={form.marketId} onChange={e => setForm(p => ({ ...p, marketId:e.target.value }))}>
                <option value="">Aucun</option>
                {markets.filter(m => !form.projectId || m.projectId === form.projectId).map(m => <option key={m.id} value={m.id}>{m.entreprise} — {m.lot}</option>)}
              </select>
            </div>
          </div>

          {/* Milestones */}
          <div style={{ borderTop:'1px solid var(--border)', paddingTop:14 }}>
            <div style={{ fontSize:11, fontWeight:700, marginBottom:10 }}>Jalons (escrow) — optionnel</div>
            {form.milestones.map((ml, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', background:'var(--s2)', borderRadius:8, marginBottom:6 }}>
                <div style={{ flex:1, fontSize:12 }}>{ml.title}</div>
                <div style={{ fontSize:12, fontWeight:700 }}>{fmt(Number(ml.amount))}</div>
                <button onClick={() => setForm(p => ({ ...p, milestones:p.milestones.filter((_, j) => j !== i) }))} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--err)', fontSize:14 }}>À</button>
              </div>
            ))}
            <div style={{ display:'flex', gap:8 }}>
              <input className="form-input" style={{ flex:2 }} placeholder="Description du jalon" value={mlForm.title} onChange={e => setMlForm(p => ({ ...p, title:e.target.value }))} />
              <MoneyInput style={{ flex:1 }} placeholder="Montant" value={mlForm.amount} onChange={v => setMlForm(p => ({ ...p, amount:v }))} />
              <button className="btn btn-sm" onClick={addMilestoneToForm} disabled={!mlForm.title || !mlForm.amount}>+ Ajouter</button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

