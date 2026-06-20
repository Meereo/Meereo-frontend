// === FICHIER : web/src/pages/cockpit/FinancePage.jsx ===
import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { api } from '../../services/api/client'
import { useMeereo } from '../../hooks/useMeereoStore'
import { useDevise } from '../../hooks/useDevise'
import { DSPageHeader, DSFilterBar, DSKpiStrip, DSEmptyState, DSStatusBadge } from '../../design/components'
import Modal from '../../components/shared/Modal'
import ModalConfirm from '../../components/shared/ModalConfirm'
import MoneyInput from '../../components/shared/MoneyInput'
import { formatDateFR } from '../../utils/helpers'

const TABS = [
  { key: 'budgets',  label: 'Budgets' },
  { key: 'depenses', label: 'Dépenses' },
  { key: 'factures', label: 'Factures' },
  { key: 'rapports', label: 'Rapports' },
]

const INVOICE_TRANSITIONS = {
  brouillon: { next: 'emise',    label: 'Émettre' },
  emise:     { next: 'payee',    label: 'Marquer payée' },
  payee:     { next: 'validee',  label: 'Valider' },
}

const INVOICE_BADGE = {
  brouillon: { label: 'Brouillon', color: 'var(--t4)',  bg: 'var(--s2)' },
  emise:     { label: 'Émise',     color: '#007AFF',    bg: 'rgba(0,122,255,.07)' },
  payee:     { label: 'Payée',     color: 'var(--ok)',  bg: 'rgba(52,199,89,.07)' },
  validee:   { label: 'Validée',   color: '#7C3AED',    bg: 'rgba(124,58,237,.07)' },
}

const PIE_COLORS = ['#2563EB','#7C3AED','#DC2626','#16A34A','#F59E0B','#EA580C','#0891B2','#6366F1','#BE185D','#92400E']

const EXPENSE_CATEGORIES = ['Main d\'Å“uvre','Matériaux','Transport','Études','Honoraires','Équipements','Sous-traitance','Divers']

function Spinner() {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'48px 0' }}>
      <div style={{ width:24, height:24, border:'2.5px solid var(--border)', borderTopColor:'var(--tx)', borderRadius:'50%', animation:'spin .6s linear infinite' }} />
    </div>
  )
}

function SkeletonRow() {
  return (
    <div style={{ display:'flex', gap:12, padding:'14px 18px', borderBottom:'1px solid var(--border)', alignItems:'center' }}>
      <div style={{ height:12, width:'30%', background:'var(--s2)', borderRadius:6 }} />
      <div style={{ height:12, width:'20%', background:'var(--s2)', borderRadius:6 }} />
      <div style={{ height:12, width:'15%', background:'var(--s2)', borderRadius:6 }} />
      <div style={{ flex:1, height:8, background:'var(--s2)', borderRadius:100 }} />
    </div>
  )
}

function burnColor(pct) {
  if (pct >= 90) return 'var(--err)'
  if (pct >= 70) return 'var(--wrn)'
  return 'var(--ok)'
}

function formatMonth(key) {
  const months = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc']
  const [, m] = key.split('-')
  return months[parseInt(m, 10) - 1]
}

export default function Finance({ showToast }) {
  const { store } = useMeereo()
  const { format: fmt } = useDevise()
  const projects = store.projects || []

  const [tab, setTab] = useState('budgets')
  const [budgets,  setBudgets]  = useState([])
  const [expenses, setExpenses] = useState([])
  const [invoices, setInvoices] = useState([])
  const [report,   setReport]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [reportLoading, setReportLoading] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState('')

  // Filter state
  const [expCatFilter, setExpCatFilter] = useState('')
  const [invStatusFilter, setInvStatusFilter] = useState('')

  // Modal state: { type:'budget'|'expense'|'invoice', mode:'create'|'edit', item:{} }
  const [modal, setModal] = useState(null)
  const [form,  setForm]  = useState({})
  const [formSubmitted, setFormSubmitted] = useState(false)

  // Confirm delete state: { type, id, label }
  const [confirm, setConfirm] = useState(null)

  // Transition confirm: { id, nextStatus, label }
  const [transition, setTransition] = useState(null)

  // â”€â”€â”€ Fetchers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [b, e, i] = await Promise.all([
        api.finance.getBudgets(),
        api.finance.getExpenses(),
        api.finance.getInvoices(),
      ])
      setBudgets(b || [])
      setExpenses(e || [])
      setInvoices(i || [])
    } catch (err) {
      showToast && showToast('Erreur chargement finance : ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { fetchAll() }, [fetchAll])

  const fetchReport = useCallback(async (pid) => {
    if (!pid) { setReport(null); return }
    setReportLoading(true)
    try {
      const r = await api.finance.getReports(pid)
      setReport(r)
    } catch (err) {
      showToast && showToast('Erreur rapport : ' + err.message)
    } finally {
      setReportLoading(false)
    }
  }, [showToast])

  useEffect(() => { fetchReport(selectedProjectId) }, [selectedProjectId, fetchReport])

  // â”€â”€â”€ Modal helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const openCreate = (type) => {
    setForm({})
    setFormSubmitted(false)
    setModal({ type, mode: 'create' })
  }
  const openEdit = (type, item) => {
    setForm({ ...item })
    setFormSubmitted(false)
    setModal({ type, mode: 'edit', item })
  }
  const closeModal = () => { setModal(null); setForm({}); setFormSubmitted(false) }

  const pf = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  // â”€â”€â”€ CRUD — Budgets â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleSaveBudget = async () => {
    setFormSubmitted(true)
    if (!form.montant) return
    try {
      if (modal.mode === 'create') {
        await api.finance.createBudget({ label: form.label || 'Budget', montant: form.montant, projectId: form.projectId || null })
        showToast && showToast('Budget créé')
      } else {
        await api.finance.updateBudget(modal.item.id, { label: form.label, montant: form.montant })
        showToast && showToast('Budget mis à jour')
      }
      closeModal(); fetchAll()
    } catch (err) { showToast && showToast(err.message) }
  }

  const handleDeleteBudget = async (id) => {
    try {
      await api.finance.deleteBudget(id)
      showToast && showToast('Budget supprimé')
      setConfirm(null); fetchAll()
    } catch (err) { showToast && showToast(err.message) }
  }

  // â”€â”€â”€ CRUD — Expenses â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleSaveExpense = async () => {
    setFormSubmitted(true)
    if (!form.label || !form.montant) return
    try {
      if (modal.mode === 'create') {
        await api.finance.createExpense({ label: form.label, montant: form.montant, provider: form.provider || null, projectId: form.projectId || null })
        showToast && showToast('Dépense enregistrée')
      } else {
        await api.finance.updateExpense(modal.item.id, { label: form.label, montant: form.montant, provider: form.provider })
        showToast && showToast('Dépense mise à jour')
      }
      closeModal(); fetchAll()
    } catch (err) { showToast && showToast(err.message) }
  }

  const handleDeleteExpense = async (id) => {
    try {
      await api.finance.deleteExpense(id)
      showToast && showToast('Dépense supprimée')
      setConfirm(null); fetchAll()
    } catch (err) { showToast && showToast(err.message) }
  }

  // â”€â”€â”€ CRUD — Invoices â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleSaveInvoice = async () => {
    setFormSubmitted(true)
    if (!form.label || !form.montant) return
    try {
      if (modal.mode === 'create') {
        await api.finance.createInvoice({ label: form.label, montant: form.montant, provider: form.provider || null, projectId: form.projectId || null })
        showToast && showToast('Facture créée')
      } else {
        await api.finance.updateInvoice(modal.item.id, { label: form.label, montant: form.montant, provider: form.provider })
        showToast && showToast('Facture mise à jour')
      }
      closeModal(); fetchAll()
    } catch (err) { showToast && showToast(err.message) }
  }

  const handleTransitionInvoice = async () => {
    if (!transition) return
    try {
      await api.finance.patchInvoiceStatus(transition.id, transition.nextStatus)
      showToast && showToast('Statut mis à jour')
      setTransition(null); fetchAll()
    } catch (err) { showToast && showToast(err.message) }
  }

  // â”€â”€â”€ Computed â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const projectExpenses = (projectId) =>
    expenses.filter(e => e.projectId === projectId).reduce((s, e) => s + e.montant, 0)

  const filteredExpenses = expenses.filter(e =>
    (!expCatFilter || e.provider === expCatFilter)
  )

  const filteredInvoices = invoices.filter(i =>
    (!invStatusFilter || i.statut === invStatusFilter)
  )

  // â”€â”€â”€ Rapports: pie chart data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const pieData = (() => {
    const all = selectedProjectId
      ? report?.transactions?.expenses || []
      : expenses
    const acc = {}
    all.forEach(e => {
      const cat = e.provider || 'Autre'
      acc[cat] = (acc[cat] || 0) + e.montant
    })
    return Object.entries(acc).map(([name, value]) => ({ name, value }))
  })()

  // â”€â”€â”€ Modal footer helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const modalFooter = (onSave, disabled) => (
    <>
      <button className="btn btn-sm" onClick={closeModal}>Annuler</button>
      <button className="btn btn-primary btn-sm" disabled={disabled} onClick={onSave}>
        {modal?.mode === 'edit' ? 'Enregistrer' : 'Créer'}
      </button>
    </>
  )

  // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <div>
      <DSPageHeader title="Finance" subtitle="Budgets · Dépenses · Factures · Rapports">
        <DSFilterBar filters={TABS} active={tab} onChange={setTab} />
        {tab === 'budgets'  && <button className="btn btn-primary btn-sm" onClick={() => openCreate('budget')}>+ Budget</button>}
        {tab === 'depenses' && <button className="btn btn-primary btn-sm" onClick={() => openCreate('expense')}>+ Dépense</button>}
        {tab === 'factures' && <button className="btn btn-primary btn-sm" onClick={() => openCreate('invoice')}>+ Facture</button>}
      </DSPageHeader>

      {/* â•â•â• BUDGETS â•â•â• */}
      {tab === 'budgets' && (
        loading ? (
          <div className="card" style={{ overflow:'hidden' }}>
            {[1,2,3].map(i => <SkeletonRow key={i} />)}
          </div>
        ) : budgets.length === 0 ? (
          <DSEmptyState icon="ðŸ’°" title="Aucun budget" description="Créez votre premier budget pour suivre les dépenses par projet." actionLabel="Créer un budget" onAction={() => openCreate('budget')} />
        ) : (
          <div className="card" style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', minWidth:560, borderCollapse:'collapse', fontSize:13 }}>
              <thead>
                <tr style={{ background:'var(--s2)', textAlign:'left' }}>
                  {['Libellé','Projet','Montant','Dépensé','Taux',''].map((h, i) => (
                    <th key={i} style={{ padding:'10px 18px', fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--t4)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {budgets.map(b => {
                  const spent = projectExpenses(b.projectId)
                  const pct = b.montant > 0 ? Math.round((spent / b.montant) * 100) : 0
                  const proj = projects.find(p => p.id === b.projectId)
                  return (
                    <tr key={b.id} style={{ borderBottom:'1px solid var(--border)' }}>
                      <td style={{ padding:'12px 18px', fontWeight:600 }}>{b.label}</td>
                      <td style={{ padding:'12px 18px', color:'var(--t3)', fontSize:12 }}>{proj?.nom || '—'}</td>
                      <td style={{ padding:'12px 18px', fontWeight:700 }}>{fmt(b.montant)}</td>
                      <td style={{ padding:'12px 18px', color:'var(--err)' }}>{fmt(spent)}</td>
                      <td style={{ padding:'12px 18px', width:140 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ flex:1, height:6, background:'var(--s2)', borderRadius:100, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:Math.min(pct,100)+'%', background:burnColor(pct), borderRadius:100, transition:'width .3s' }} />
                          </div>
                          <span style={{ fontSize:11, fontWeight:700, color:burnColor(pct), flexShrink:0 }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding:'12px 18px' }}>
                        <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                          <button className="btn btn-sm" style={{ fontSize:10 }} onClick={() => openEdit('budget', b)}>Éditer</button>
                          <button className="btn btn-sm" style={{ fontSize:10, color:'var(--err)', borderColor:'rgba(220,38,38,.2)' }} onClick={() => setConfirm({ type:'budget', id:b.id, label:b.label })}>Suppr.</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* â•â•â• DÉPENSES â•â•â• */}
      {tab === 'depenses' && (
        budgets.length === 0 ? (
          <DSEmptyState icon="ðŸ“‹" title="Aucun budget défini" description="Créez d'abord un budget avant d'enregistrer des dépenses." actionLabel="Créer un budget" onAction={() => setTab('budgets')} />
        ) : (
          <div>
            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
              <select className="form-input" value={expCatFilter} onChange={e => setExpCatFilter(e.target.value)}>
                <option value="">Toutes catégories</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {loading ? (
              <div className="card" style={{ overflow:'hidden' }}>{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
            ) : filteredExpenses.length === 0 ? (
              <DSEmptyState icon="ðŸ’¸" title="Aucune dépense" description="Enregistrez vos premières dépenses de projet." actionLabel="Ajouter une dépense" onAction={() => openCreate('expense')} />
            ) : (
              <div className="card" style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', minWidth:560, borderCollapse:'collapse', fontSize:13 }}>
                  <thead>
                    <tr style={{ background:'var(--s2)', textAlign:'left' }}>
                      {['Description','Catégorie','Projet','Montant','Date',''].map((h, i) => (
                        <th key={i} style={{ padding:'10px 18px', fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--t4)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredExpenses.map(e => {
                      const proj = projects.find(p => p.id === e.projectId)
                      return (
                        <tr key={e.id} style={{ borderBottom:'1px solid var(--border)' }}>
                          <td style={{ padding:'12px 18px', fontWeight:600 }}>{e.label}</td>
                          <td style={{ padding:'12px 18px' }}>
                            {e.provider && <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:100, background:'var(--s2)', color:'var(--t3)' }}>{e.provider}</span>}
                          </td>
                          <td style={{ padding:'12px 18px', color:'var(--t3)', fontSize:12 }}>{proj?.nom || '—'}</td>
                          <td style={{ padding:'12px 18px', fontWeight:700, color:'var(--err)' }}>{fmt(e.montant)}</td>
                          <td style={{ padding:'12px 18px', color:'var(--t4)', fontSize:12 }}>{formatDateFR(e.createdAt)}</td>
                          <td style={{ padding:'12px 18px' }}>
                            <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
                              <button className="btn btn-sm" style={{ fontSize:10 }} onClick={() => openEdit('expense', e)}>Éditer</button>
                              <button className="btn btn-sm" style={{ fontSize:10, color:'var(--err)', borderColor:'rgba(220,38,38,.2)' }} onClick={() => setConfirm({ type:'expense', id:e.id, label:e.label })}>Suppr.</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )
      )}

      {/* â•â•â• FACTURES â•â•â• */}
      {tab === 'factures' && (
        <div>
          <div style={{ display:'flex', gap:10, marginBottom:16 }}>
            <select className="form-input" value={invStatusFilter} onChange={e => setInvStatusFilter(e.target.value)}>
              <option value="">Tous les statuts</option>
              {Object.entries(INVOICE_BADGE).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          {loading ? (
            <div className="card" style={{ overflow:'hidden' }}>{[1,2,3].map(i => <SkeletonRow key={i} />)}</div>
          ) : filteredInvoices.length === 0 ? (
            <DSEmptyState icon="ðŸ§¾" title="Aucune facture" description="Créez votre première facture." actionLabel="Nouvelle facture" onAction={() => openCreate('invoice')} />
          ) : (
            <div className="card" style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', minWidth:680, borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ background:'var(--s2)', textAlign:'left' }}>
                    {['Référence','Client / Note','Projet','Montant','Statut','Date','Actions'].map((h, i) => (
                      <th key={i} style={{ padding:'10px 18px', fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--t4)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map(inv => {
                    const badge = INVOICE_BADGE[inv.statut] || INVOICE_BADGE.brouillon
                    const tr = INVOICE_TRANSITIONS[inv.statut]
                    const proj = projects.find(p => p.id === inv.projectId)
                    return (
                      <tr key={inv.id} style={{ borderBottom:'1px solid var(--border)' }}>
                        <td style={{ padding:'12px 18px', fontWeight:700, fontFamily:'monospace', fontSize:11 }}>{inv.id.slice(-8).toUpperCase()}</td>
                        <td style={{ padding:'12px 18px', color:'var(--t3)', fontSize:12 }}>{inv.provider || '—'}</td>
                        <td style={{ padding:'12px 18px', color:'var(--t3)', fontSize:12 }}>{proj?.nom || '—'}</td>
                        <td style={{ padding:'12px 18px', fontWeight:700 }}>{fmt(inv.montant)}</td>
                        <td style={{ padding:'12px 18px' }}>
                          <span style={{ fontSize:10, fontWeight:600, padding:'3px 9px', borderRadius:100, background:badge.bg, color:badge.color }}>{badge.label}</span>
                        </td>
                        <td style={{ padding:'12px 18px', color:'var(--t4)', fontSize:12 }}>{formatDateFR(inv.createdAt)}</td>
                        <td style={{ padding:'12px 18px' }}>
                          <div style={{ display:'flex', gap:6 }}>
                            {tr && (
                              <button className="btn btn-sm" style={{ fontSize:10 }} onClick={() => setTransition({ id:inv.id, nextStatus:tr.next, label:tr.label })}>
                                {tr.label}
                              </button>
                            )}
                            <button className="btn btn-sm" style={{ fontSize:10 }} onClick={() => openEdit('invoice', inv)}>Éditer</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* â•â•â• RAPPORTS â•â•â• */}
      {tab === 'rapports' && (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <select className="form-input" value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)}>
              <option value="">Sélectionner un projet pour le rapport</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>

          {!selectedProjectId ? (
            <DSEmptyState icon="ðŸ“Š" title="Sélectionnez un projet" description="Choisissez un projet pour afficher les indicateurs financiers détaillés." />
          ) : reportLoading ? (
            <Spinner />
          ) : !report ? (
            <DSEmptyState icon="ðŸ“Š" title="Aucune donnée" description="Aucune transaction enregistrée pour ce projet." />
          ) : (
            <div>
              {/* KPIs */}
              <DSKpiStrip items={[
                { label:'Budget total',    value: fmt(report.kpi.totalBudget) },
                { label:'Total dépensé',   value: fmt(report.kpi.totalExpenses),  color:'var(--err)' },
                { label:'Total facturé',   value: fmt(report.kpi.totalInvoiced),  color:'#007AFF' },
                { label:'Total encaissé',  value: fmt(report.kpi.totalPaid),      color:'var(--ok)' },
              ]} />

              {/* Burn rate */}
              <div className="card" style={{ padding:'18px 22px', marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, marginBottom:2 }}>Burn Rate</div>
                    <div style={{ fontSize:11, color:'var(--t3)' }}>Budget consommé</div>
                  </div>
                  <div style={{ fontSize:28, fontWeight:800, color:burnColor(report.kpi.burnRate) }}>{report.kpi.burnRate}%</div>
                </div>
                <div style={{ height:10, background:'var(--s2)', borderRadius:100, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:Math.min(report.kpi.burnRate,100)+'%', background:burnColor(report.kpi.burnRate), borderRadius:100, transition:'width .6s ease' }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', marginTop:6, fontSize:10, color:'var(--t4)' }}>
                  <span>0%</span>
                  <span style={{ color:'var(--wrn)' }}>âš  70%</span>
                  <span style={{ color:'var(--err)' }}>ðŸ”´ 90%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Charts */}
              <div className="rg-2" style={{ gap:20, marginBottom:20 }}>
                {/* Bar chart — évolution mensuelle */}
                <div className="card" style={{ padding:'18px 22px' }}>
                  <div style={{ fontSize:12, fontWeight:700, marginBottom:16 }}>Évolution mensuelle</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={(report.monthlyBreakdown || []).map(m => ({ ...m, month: formatMonth(m.month) }))} barSize={8} barGap={2}>
                      <XAxis dataKey="month" tick={{ fontSize:10, fill:'var(--t4)' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize:9, fill:'var(--t4)' }} axisLine={false} tickLine={false} tickFormatter={v => v >= 1e6 ? (v/1e6).toFixed(1)+'M' : v >= 1e3 ? (v/1e3).toFixed(0)+'k' : v} />
                      <Tooltip formatter={(v, name) => [fmt(v), name === 'budgets' ? 'Budget' : 'Dépenses']} contentStyle={{ fontSize:11, borderRadius:8, border:'1px solid var(--border)' }} />
                      <Bar dataKey="budgets"  fill="#2563EB" radius={[3,3,0,0]} />
                      <Bar dataKey="depenses" fill="#DC2626" radius={[3,3,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div style={{ display:'flex', gap:16, justifyContent:'center', marginTop:8 }}>
                    <span style={{ fontSize:10, color:'var(--t4)', display:'flex', alignItems:'center', gap:4 }}><span style={{ width:8, height:8, borderRadius:2, background:'#2563EB', display:'inline-block' }} />Budget</span>
                    <span style={{ fontSize:10, color:'var(--t4)', display:'flex', alignItems:'center', gap:4 }}><span style={{ width:8, height:8, borderRadius:2, background:'#DC2626', display:'inline-block' }} />Dépenses</span>
                  </div>
                </div>

                {/* Pie chart — répartition par catégorie */}
                <div className="card" style={{ padding:'18px 22px' }}>
                  <div style={{ fontSize:12, fontWeight:700, marginBottom:16 }}>Répartition des dépenses</div>
                  {pieData.length === 0 ? (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:200, fontSize:12, color:'var(--t4)' }}>Aucune dépense enregistrée</div>
                  ) : (
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                          {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize:11, borderRadius:8, border:'1px solid var(--border)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* â•â•â• MODAL — Budget â•â•â• */}
      <Modal isOpen={modal?.type === 'budget'} onClose={closeModal} title={modal?.mode === 'edit' ? 'Modifier le budget' : 'Nouveau budget'}
        footer={modalFooter(handleSaveBudget, false)}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label className="form-label">Libellé *</label>
            <input className="form-input" value={form.label || ''} onChange={e => pf('label', e.target.value)} placeholder="ex: Budget gros Å“uvre" />
          </div>
          <div>
            <label className="form-label">Montant (FCFA) *</label>
            <MoneyInput value={form.montant || ''} onChange={v => pf('montant', v)} placeholder="10 000 000" />
            {formSubmitted && !form.montant && <p style={{ color:'var(--err)', fontSize:11, marginTop:4, fontWeight:500 }}>Champ obligatoire</p>}
          </div>
          <div>
            <label className="form-label">Projet associé <span style={{ color: 'var(--t4)', fontWeight: 400 }}>(optionnel)</span></label>
            <select className="form-input" value={form.projectId || ''} onChange={e => pf('projectId', e.target.value)}>
              <option value="">Aucun projet</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      {/* â•â•â• MODAL — Dépense â•â•â• */}
      <Modal isOpen={modal?.type === 'expense'} onClose={closeModal} title={modal?.mode === 'edit' ? 'Modifier la dépense' : 'Nouvelle dépense'}
        footer={modalFooter(handleSaveExpense, false)}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label className="form-label">Description *</label>
            <input className="form-input" value={form.label || ''} onChange={e => pf('label', e.target.value)} placeholder="ex: Achat ciment — 200 sacs" />
            {formSubmitted && !form.label && <p style={{ color:'var(--err)', fontSize:11, marginTop:4, fontWeight:500 }}>Champ obligatoire</p>}
          </div>
          <div className="modal-row" style={{ gap:10 }}>
            <div>
              <label className="form-label">Montant (FCFA) *</label>
              <MoneyInput value={form.montant || ''} onChange={v => pf('montant', v)} placeholder="500 000" />
              {formSubmitted && !form.montant && <p style={{ color:'var(--err)', fontSize:11, marginTop:4, fontWeight:500 }}>Champ obligatoire</p>}
            </div>
            <div>
              <label className="form-label">Catégorie</label>
              <select className="form-input" value={form.provider || ''} onChange={e => pf('provider', e.target.value)}>
                <option value="">Sélectionner</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="form-label">Projet associé</label>
            <select className="form-input" value={form.projectId || ''} onChange={e => pf('projectId', e.target.value)}>
              <option value="">Aucun projet</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      {/* â•â•â• MODAL — Facture â•â•â• */}
      <Modal isOpen={modal?.type === 'invoice'} onClose={closeModal} title={modal?.mode === 'edit' ? 'Modifier la facture' : 'Nouvelle facture'}
        footer={modalFooter(handleSaveInvoice, false)}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label className="form-label">Référence / Objet *</label>
            <input className="form-input" value={form.label || ''} onChange={e => pf('label', e.target.value)} placeholder="ex: Facture situation nÂ°1 — Gros Å“uvre" />
            {formSubmitted && !form.label && <p style={{ color:'var(--err)', fontSize:11, marginTop:4, fontWeight:500 }}>Champ obligatoire</p>}
          </div>
          <div className="modal-row" style={{ gap:10 }}>
            <div>
              <label className="form-label">Montant (FCFA) *</label>
              <MoneyInput value={form.montant || ''} onChange={v => pf('montant', v)} placeholder="5 000 000" />
              {formSubmitted && !form.montant && <p style={{ color:'var(--err)', fontSize:11, marginTop:4, fontWeight:500 }}>Champ obligatoire</p>}
            </div>
            <div>
              <label className="form-label">Client / Destinataire</label>
              <input className="form-input" value={form.provider || ''} onChange={e => pf('provider', e.target.value)} placeholder="Nom du client" />
            </div>
          </div>
          <div>
            <label className="form-label">Projet associé</label>
            <select className="form-input" value={form.projectId || ''} onChange={e => pf('projectId', e.target.value)}>
              <option value="">Aucun projet</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          </div>
        </div>
      </Modal>

      {/* â•â•â• CONFIRM — Suppression â•â•â• */}
      <ModalConfirm
        open={!!confirm}
        title={`Supprimer "${confirm?.label}" ?`}
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        destructive
        onConfirm={() => {
          if (confirm.type === 'budget')  handleDeleteBudget(confirm.id)
          if (confirm.type === 'expense') handleDeleteExpense(confirm.id)
        }}
        onCancel={() => setConfirm(null)}
      />

      {/* â•â•â• CONFIRM — Transition facture â•â•â• */}
      <ModalConfirm
        open={!!transition}
        title={`${transition?.label} cette facture ?`}
        message={`Le statut passera à "${INVOICE_BADGE[transition?.nextStatus]?.label}".`}
        confirmLabel={transition?.label || 'Confirmer'}
        onConfirm={handleTransitionInvoice}
        onCancel={() => setTransition(null)}
      />
    </div>
  )
}

