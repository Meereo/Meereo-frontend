import { useState, useMemo } from 'react'
import { TrendingUp, CheckCircle, Clock, AlertTriangle, ChevronRight, Wallet } from 'lucide-react'
import { useMeereo } from '../../hooks/useMeereoStore'
import { useDevise } from '../../hooks/useDevise'
import { DSPageHeader, DSKpiStrip, DSFilterBar, DSEmptyState } from '../../design/components'
import { MARKET_STATUS } from '../../domain/status'
import { formatDateFR } from '../../utils/helpers'

// â”€â”€ Status badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PayBadge({ status }) {
  const m = PAY_STATUS_META[status] || { label: status || '—', color: 'var(--t4)', bg: 'var(--s2)' }
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 100,
      background: m.bg, color: m.color, whiteSpace: 'nowrap',
    }}>
      {m.icon} {m.label}
    </span>
  )
}

// â”€â”€ Market status badge â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MarketBadge({ statut }) {
  const MAP = {
    [MARKET_STATUS.SIGNED]:      { label: 'Signé',    color: 'var(--t2)',  bg: 'var(--s2)' },
    [MARKET_STATUS.IN_PROGRESS]: { label: 'En cours', color: '#E07B00',   bg: 'rgba(245,158,11,.08)' },
    [MARKET_STATUS.COMPLETED]:   { label: 'Livré',    color: 'var(--ok)', bg: 'rgba(52,199,89,.08)' },
  }
  const m = MAP[statut] || { label: statut || '—', color: 'var(--t4)', bg: 'var(--s2)' }
  return (
    <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 100, background: m.bg, color: m.color }}>
      {m.label}
    </span>
  )
}

// â”€â”€ Progress bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ProgBar({ value, max, color }) {
  const pct = max > 0 ? Math.min(100, Math.round(value / max * 100)) : 0
  const barColor = color || (pct >= 90 ? 'var(--err)' : pct >= 70 ? 'var(--wrn)' : '#2563EB')
  return (
    <div style={{ height: 5, background: 'var(--s2)', borderRadius: 100, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: pct + '%', background: barColor, borderRadius: 100, transition: 'width .4s' }} />
    </div>
  )
}

const TABS_CLIENT = [
  { key: 'vue', label: 'Vue d\'ensemble' },
  { key: 'marches', label: 'Contrats' },
  { key: 'paiements', label: 'Paiements' },
]
const TABS_PRO = [
  { key: 'vue', label: 'Vue d\'ensemble' },
  { key: 'marches', label: 'Mes contrats' },
  { key: 'paiements', label: 'Mes paiements' },
]

export default function Budget({ showToast, onNavigate }) {
  const { store } = useMeereo()
  const { format: fmt, formatShort, parseBudget } = useDevise()

  const userType = store.user?.type || 'pro'
  const userId   = store.user?.id
  const isClient = userType === 'client'

  const [tab, setTab] = useState('vue')
  const [projFilter, setProjFilter] = useState('') // '' = all

  // â”€â”€ Data derivations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const allProjects = useMemo(() => {
    return (store.projects || []).filter(p => p.status !== 'deleted')
  }, [store.projects])

  const myMarkets = useMemo(() => {
    const raw = store.markets || []
    if (isClient) return raw.filter(m => m.clientId === userId || m.aoOwnerId === userId)
    return raw.filter(m => m.supplierId === userId)
  }, [store.markets, userId, isClient])

  const filteredMarkets = useMemo(() => {
    if (!projFilter) return myMarkets
    return myMarkets.filter(m => m.projectId === projFilter)
  }, [myMarkets, projFilter])

  // Aggregates — derived from markets since no separate paymentOrders table exists in DB
  const stats = useMemo(() => {
    const totalContrats = filteredMarkets.reduce((s, m) => s + (parseFloat(m.montant) || parseFloat(m.amount) || 0), 0)
    // Derive paye/enAttente from market statuts (source of truth)
    const paye = filteredMarkets
      .filter(m => m.statut === MARKET_STATUS.COMPLETED)
      .reduce((s, m) => s + (parseFloat(m.montant) || parseFloat(m.amount) || 0), 0)
    const enAttente = filteredMarkets
      .filter(m => m.statut === MARKET_STATUS.IN_PROGRESS || m.statut === MARKET_STATUS.SIGNED)
      .reduce((s, m) => s + (parseFloat(m.montant) || parseFloat(m.amount) || 0), 0)
    const litiges = 0

    // Budget total from projects (client view)
    const totalBudgetProjets = isClient
      ? (store.projects || [])
          .filter(p => !projFilter || p.id === projFilter)
          .reduce((s, p) => s + parseBudget(p.budget || '0'), 0)
      : 0

    return { totalContrats, paye, enAttente, litiges, totalBudgetProjets }
  }, [filteredMarkets, isClient, store.projects, projFilter, parseBudget])

  const projOptions = useMemo(() => {
    const ids = [...new Set(myMarkets.map(m => m.projectId).filter(Boolean))]
    return ids.map(id => {
      const p = allProjects.find(pr => pr.id === id)
      return { id, label: p?.nom || 'Projet ' + id.slice(-6) }
    })
  }, [myMarkets, allProjects])

  const TABS = isClient ? TABS_CLIENT : TABS_PRO

  // â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div>
      <DSPageHeader
        title="Budget"
        subtitle={isClient ? 'Suivi financier de vos projets' : 'Vos contrats et paiements'}
      >
        <DSFilterBar filters={TABS} active={tab} onChange={setTab} />
        {projOptions.length > 1 && (
          <select
            value={projFilter}
            onChange={e => setProjFilter(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--f)', background: 'var(--surface-1)', color: 'var(--tx)', cursor: 'pointer', outline: 'none' }}
          >
            <option value="">Tous les projets</option>
            {projOptions.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        )}
      </DSPageHeader>

      {/* â•â• KPIs â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <DSKpiStrip hero items={isClient ? [
        { value: formatShort(stats.totalBudgetProjets || stats.totalContrats), label: 'Budget total', sub: 'Enveloppe allouée' },
        { value: formatShort(stats.totalContrats), label: 'Engagé', sub: 'Contrats signés', color: '#2563EB' },
        { value: formatShort(stats.paye), label: 'Payé', sub: 'Versements effectués', color: 'var(--ok)' },
        { value: formatShort(stats.enAttente), label: 'En cours', sub: 'Paiements en transit', color: 'var(--wrn)' },
        ...(stats.litiges > 0 ? [{ value: stats.litiges, label: 'Litige(s)', sub: 'À résoudre', color: 'var(--err)' }] : []),
      ] : [
        { value: formatShort(stats.totalContrats), label: 'Montant contractuel', sub: 'Total signé' },
        { value: formatShort(stats.paye), label: 'Reçu', sub: 'Versements confirmés', color: 'var(--ok)' },
        { value: formatShort(stats.enAttente), label: 'En cours', sub: 'En attente de versement', color: 'var(--wrn)' },
        { value: filteredMarkets.filter(m => m.statut === MARKET_STATUS.IN_PROGRESS).length, label: 'Missions actives', sub: 'En cours d\'exécution', color: '#2563EB' },
        ...(stats.litiges > 0 ? [{ value: stats.litiges, label: 'Litige(s)', sub: 'À résoudre', color: 'var(--err)' }] : []),
      ]} />

      {/* â•â• TAB: Vue d'ensemble â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {tab === 'vue' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 8 }}>

          {/* Budget burn (client only) */}
          {isClient && stats.totalBudgetProjets > 0 && (
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 16 }}>Consommation du budget</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 8 }}>
                <span style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1.5px' }}>{formatShort(stats.totalContrats)}</span>
                <span style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 4 }}>/ {formatShort(stats.totalBudgetProjets)}</span>
                <span style={{ marginLeft: 'auto', fontSize: 22, fontWeight: 800, color: stats.totalContrats / stats.totalBudgetProjets >= .9 ? 'var(--err)' : stats.totalContrats / stats.totalBudgetProjets >= .7 ? 'var(--wrn)' : 'var(--ok)' }}>
                  {stats.totalBudgetProjets > 0 ? Math.round(stats.totalContrats / stats.totalBudgetProjets * 100) : 0}%
                </span>
              </div>
              <ProgBar value={stats.totalContrats} max={stats.totalBudgetProjets} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--t4)', marginTop: 6 }}>
                <span>Engagé : {formatShort(stats.totalContrats)}</span>
                <span>Reste : {formatShort(Math.max(0, stats.totalBudgetProjets - stats.totalContrats))}</span>
              </div>
            </div>
          )}

          {/* Contrats par statut */}
          {filteredMarkets.length > 0 ? (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>
                  {isClient ? 'Contrats validés' : 'Mes contrats'} · {filteredMarkets.length}
                </div>
              </div>
              {filteredMarkets.slice(0, 5).map((m, i) => {
                const proj = allProjects.find(p => p.id === m.projectId)
                const amount = parseFloat(m.montant) || parseFloat(m.amount) || 0
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < filteredMarkets.slice(0,5).length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--t2)', flexShrink: 0 }}>
                      {(m.lot || m.titre || '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.titre || m.lot || 'Marché'}</div>
                      <div style={{ fontSize: 11, color: 'var(--t3)' }}>
                        {isClient ? m.entreprise : proj?.nom || 'Projet'} · {formatDateFR(m.createdAt)}
                      </div>
                    </div>
                    {/* Amount + badge */}
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{formatShort(amount)}</div>
                      <MarketBadge statut={m.statut} />
                    </div>
                  </div>
                )
              })}
              {filteredMarkets.length > 5 && (
                <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)' }}>
                  <button className="btn btn-sm" style={{ width: '100%' }} onClick={() => setTab('marches')}>
                    Voir les {filteredMarkets.length - 5} autres â†’ 
                  </button>
                </div>
              )}
            </div>
          ) : (
            <DSEmptyState
              icon={<Wallet size={28} />}
              title="Aucun contrat"
              desc={isClient ? "Vos contrats signés apparaîtront ici après acceptation d'une offre." : "Vos marchés apparaîtront ici après qu'un client accepte votre offre."}
            />
          )}

          {/* Paiements récents — marchés complétés */}
          {filteredMarkets.filter(m => m.statut === MARKET_STATUS.COMPLETED).length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Paiements reçus</div>
              </div>
              {filteredMarkets.filter(m => m.statut === MARKET_STATUS.COMPLETED).slice(0, 6).map((m, i, arr) => {
                const proj = allProjects.find(p => p.id === m.projectId)
                const amount = parseFloat(m.montant) || parseFloat(m.amount) || 0
                return (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(52,199,89,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>âœ“</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.titre || m.lot || 'Marché'}</div>
                      <div style={{ fontSize: 10, color: 'var(--t4)' }}>{isClient ? m.entreprise : proj?.nom || '—'} · {formatDateFR(m.updatedAt || m.createdAt)}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ok)' }}>{formatShort(amount)}</div>
                      <MarketBadge statut={m.statut} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* â•â• TAB: Contrats â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {tab === 'marches' && (
        <div style={{ marginTop: 8 }}>
          {filteredMarkets.length === 0 ? (
            <DSEmptyState icon={<Wallet size={28} />} title="Aucun contrat" desc={isClient ? "Acceptez une offre pour créer un marché." : "Répondez aux AOs pour obtenir des marchés."} />
          ) : (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 110px 110px', gap: 8, padding: '10px 20px', background: 'var(--s2)', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.04em' }}>
                <span>Contrat</span>
                <span style={{ textAlign: 'center' }}>Statut</span>
                <span style={{ textAlign: 'right' }}>Montant</span>
                <span style={{ textAlign: 'right' }}>Avancement</span>
              </div>
              {filteredMarkets.map((m, i) => {
                const proj = allProjects.find(p => p.id === m.projectId)
                const amount = parseFloat(m.montant) || parseFloat(m.amount) || 0
                const avt = typeof m.avancement === 'number' ? m.avancement : 0
                return (
                  <div key={m.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 110px 110px', gap: 8, padding: '14px 20px', borderBottom: i < filteredMarkets.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.titre || m.lot || 'Marché'}</div>
                      <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>
                        {isClient ? m.entreprise : proj?.nom || '—'} · {m.delai || '—'}
                      </div>
                      {m.description && <div style={{ fontSize: 10, color: 'var(--t4)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.description}</div>}
                    </div>
                    <div style={{ textAlign: 'center' }}><MarketBadge statut={m.statut} /></div>
                    <div style={{ textAlign: 'right', fontSize: 14, fontWeight: 800 }}>{formatShort(amount)}</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>{avt}%</div>
                      <ProgBar value={avt} max={100} color={avt >= 100 ? 'var(--ok)' : '#2563EB'} />
                    </div>
                  </div>
                )
              })}
              {/* Totaux */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 110px 110px', gap: 8, padding: '12px 20px', borderTop: '2px solid var(--border)', background: 'var(--s2)' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t3)' }}>TOTAL</span>
                <span />
                <span style={{ textAlign: 'right', fontSize: 14, fontWeight: 800 }}>{formatShort(stats.totalContrats)}</span>
                <span style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: 'var(--t3)' }}>
                  {filteredMarkets.length > 0 ? Math.round(filteredMarkets.reduce((s, m) => s + (m.avancement || 0), 0) / filteredMarkets.length) : 0}% moy.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* â•â• TAB: Paiements â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {tab === 'paiements' && (
        <div style={{ marginTop: 8 }}>
          {filteredMarkets.length === 0 ? (
            <DSEmptyState icon={<TrendingUp size={28} />} title="Aucun paiement" desc="Les paiements apparaîtront ici après livraison d'un marché." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredMarkets.map(m => {
                const proj = allProjects.find(p => p.id === m.projectId)
                const amount = parseFloat(m.montant) || parseFloat(m.amount) || 0
                const isCompleted = m.statut === MARKET_STATUS.COMPLETED
                const isInProgress = m.statut === MARKET_STATUS.IN_PROGRESS
                const bgColor = isCompleted ? 'rgba(52,199,89,.08)' : isInProgress ? 'rgba(245,158,11,.08)' : 'var(--s2)'
                const icon = isCompleted ? 'âœ“' : isInProgress ? 'âŸ³' : 'â—‹'
                return (
                  <div key={m.id} className="card" style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                        {icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>{m.titre || m.lot || 'Marché'}</div>
                          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px', color: isCompleted ? 'var(--ok)' : 'inherit' }}>{formatShort(amount)}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <MarketBadge statut={m.statut} />
                          <span style={{ fontSize: 10, color: 'var(--t4)' }}>{isClient ? m.entreprise : proj?.nom || '—'}</span>
                          <span style={{ fontSize: 10, color: 'var(--t4)', marginLeft: 'auto' }}>{formatDateFR(m.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

