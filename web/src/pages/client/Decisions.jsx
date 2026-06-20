import { useState } from 'react'
import { Check, X, CheckCircle2 as CheckCircle2Icon } from 'lucide-react'
import { METIERS_AO } from '../../data/ao'

export default function Decisions({ ctx }) {
  const { proj, store, pendingPaymentReqs, respondDecision, respondPayment, updateStore, showToast, fmtDevise } = ctx
  const [decSearch, setDecSearch] = useState('')
  const [decTrade, setDecTrade] = useState('all')

  const allStoreDecisions = store.decisions || []
  const allDecisions = allStoreDecisions.filter(sd =>
    (sd.projectId === proj?.id || !sd.projectId) &&
    sd.visibility !== 'internal'
  )

  const isActive = d => d.statut === 'pending' || d.statut === 'info_requested'
  const isResolved = d => !isActive(d)

  const q = (decSearch || '').toLowerCase()
  const tradeOk = t => !decTrade || decTrade === 'all' || (t || '').toLowerCase() === decTrade.toLowerCase()
  const searchOk = d => !q || (d.titre + (d.desc || '') + (d.trade || '')).toLowerCase().includes(q)
  const filtered = allDecisions.filter(d => tradeOk(d.trade) && searchOk(d))
  const active = filtered.filter(isActive)
  const resolved = filtered.filter(isResolved)

  const respond = (d, response) => {
    if (d.id.startsWith('dec_')) {
      updateStore(prev => ({ ...prev, decisions: [...(prev.decisions || []).filter(x => x.id !== d.id), { ...d, id: d.id, titre: d.titre, desc: d.desc, trade: d.trade, sourceType: d.sourceType, statut: response, respondedAt: new Date().toISOString() }] }))
    } else {
      respondDecision(d.id, response)
    }
    const labels = { approved: 'validée', rejected: 'refusée', info_requested: 'info demandée' }
    showToast('Décision ' + (labels[response] || response) + ' — le professionnel sera notifié')
  }
  const statusLabel = s => s === 'approved' || s === 'validee' ? 'Validée' : s === 'rejected' ? 'Refusée' : s === 'info_requested' || s === 'info' ? 'Info demandée' : s
  const statusColor = s => s === 'approved' || s === 'validee' ? 'var(--ok)' : s === 'rejected' ? 'var(--err)' : 'var(--color-info)'
  const statusBg = s => s === 'approved' || s === 'validee' ? 'rgba(52,199,89,.08)' : s === 'rejected' ? 'rgba(186,26,26,.06)' : 'rgba(0,122,255,.08)'
  const statusIcon = s => s === 'approved' || s === 'validee' ? <Check size={10}/> : s === 'rejected' ? <X size={10}/> : <span style={{fontSize:10}}>?</span>

  return (
    <div>
      {/* Pending payment requests from pro */}
      {pendingPaymentReqs.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Paiements en attente</div>
          {pendingPaymentReqs.map(r => (
            <div key={r.id} className="card" style={{ padding: '14px 18px', marginBottom: 8, borderLeft: '3px solid var(--color-info)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{r.label}</div>
                <span style={{ fontSize: 13, fontWeight: 800 }}>{fmtDevise(r.amount)}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button className="btn btn-primary btn-sm" onClick={() => { respondPayment(r.id, 'approved'); showToast('Paiement approuvé') }}>Approuver</button>
                <button className="btn btn-sm" onClick={() => { respondPayment(r.id, 'rejected'); showToast('Paiement refusé') }}>Refuser</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search + trade filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div data-search style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: 'transparent', borderRadius: 8, border: '1px solid var(--border-card)', flex: 1 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={decSearch} onChange={e => setDecSearch(e.target.value)} placeholder="Rechercher une décision..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 12, fontFamily: 'var(--f)', color: 'var(--tx)' }} />
        </div>
        <select value={decTrade} onChange={e => setDecTrade(e.target.value)} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border-card)', background: 'var(--s2)', fontSize: 11, fontFamily: 'var(--f)', color: 'var(--tx)' }}>
          <option value="all">Tous metiers</option>
          {METIERS_AO.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 12 }}>Choix en attente de votre validation</div>
      {active.length === 0 && pendingPaymentReqs.length === 0 && (
        <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ marginBottom: 8, opacity: .3, display: 'flex', justifyContent: 'center' }}><CheckCircle2Icon size={24}/></div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t3)' }}>Aucune decision en attente</div>
        </div>
      )}
      {active.map(d => (
        <div key={d.id} className="card" style={{ padding: '16px 18px', marginBottom: 10, borderLeft: d.urgent ? '3px solid var(--wrn)' : d.statut === 'info_requested' ? '3px solid var(--color-info)' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{d.titre}</div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              {d.trade && <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 100, background: 'rgba(0,0,0,.04)', color: 'var(--t3)' }}>{d.trade}</span>}
              {d.urgent && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 100, background: 'rgba(255,149,0,.08)', color: 'var(--wrn)' }}>Urgent</span>}
              {d.statut === 'info_requested' && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 100, background: 'rgba(0,122,255,.08)', color: 'var(--color-info)' }}>Info demandee</span>}
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.5, marginBottom: 12 }}>{d.desc || ''}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary btn-sm" onClick={() => respond(d, 'approved')}>Valider</button>
            <button className="btn btn-sm" onClick={() => respond(d, 'rejected')}>Refuser</button>
            {d.statut !== 'info_requested' && <button className="btn btn-sm" onClick={() => respond(d, 'info_requested')}>Demander plus d'infos</button>}
          </div>
        </div>
      ))}
      {resolved.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Decisions traitees</div>
          {resolved.map(d => (
            <div key={d.id} className="card" style={{ padding: '12px 18px', marginBottom: 6, opacity: .6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, background: statusBg(d.statut), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0, color: statusColor(d.statut) }}>{statusIcon(d.statut)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{d.titre}</div>
                  {d.trade && <div style={{ fontSize: 9, color: 'var(--t4)' }}>{d.trade}</div>}
                </div>
                <span style={{ fontSize: 9, fontWeight: 600, color: statusColor(d.statut) }}>{statusLabel(d.statut)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
