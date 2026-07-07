import { useState, useEffect, useMemo } from 'react'
import { INTEGRATIONS_DATA } from '../../data/integrations'
import { api } from '../../services/api/client'
import { useMeereo } from '../../hooks/useMeereoStore'
import { DSPageHeader, DSFilterBar } from '../../design/components'

export default function Integrations({ showToast }) {
  const { store, updateStore } = useMeereo()
  const [filter, setFilter] = useState('all')
  const [catalog, setCatalog] = useState(INTEGRATIONS_DATA)

  // Fetch catalog from API; fall back to static data if backend is down
  useEffect(() => {
    api.integrations.getAll()
      .then(data => { if (Array.isArray(data) && data.length > 0) setCatalog(data) })
      .catch(() => { /* backend down — static fallback stays */ })
  }, [])

  // Merge catalog with persisted connection state from store
  const connectedIds = store.connectedIntegrations || []
  const integrations = useMemo(() => catalog.map(g => ({
    ...g,
    actif: g.actif || connectedIds.includes(g.id),
  })), [catalog, connectedIds])

  const cats = [...new Set(integrations.map(g => g.cat))]
  const filtered = filter === 'all' ? integrations : integrations.filter(g => g.cat === filter)
  const connected = integrations.filter(g => g.actif).length

  return (
    <div>
      <DSPageHeader title="Intégrations" subtitle={`${catalog.length} services · ${connected} connectés`}>
        <DSFilterBar filters={[{key:'all',label:'Tous'}, ...cats.map(c => ({key:c,label:c}))]} active={filter} onChange={setFilter} />
      </DSPageHeader>

      <div className="rg-3" style={{ gap: 12 }}>
        {filtered.map(g => (
          <div key={g.id} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                <img src={g.logo} alt={g.nom} style={{ width: 32, height: 32, objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; e.target.parentElement.textContent = g.nom[0] }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.nom}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{g.desc}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: g.actif ? 'var(--ok)' : 'var(--t4)' }} />
                <span style={{ fontSize: 11, fontWeight: 600, color: g.actif ? 'var(--ok)' : 'var(--t4)' }}>{g.actif ? 'Connecté' : 'Disponible'}</span>
              </div>
              <button className={`btn btn-sm ${g.actif ? '' : 'btn-primary'}`} style={{ fontSize: 11 }} onClick={() => {
                if (!g.actif) {
                  const next = [...(store.connectedIntegrations || []), g.id]
                  updateStore(prev => ({ ...prev, connectedIntegrations: next }))
                  api.usersApi.updatePrefs({ connectedIntegrations: next }).catch(e => console.warn('[Integrations]', e.message))
                  showToast && showToast(g.nom + ' connecté')
                } else {
                  showToast && showToast('Gestion ' + g.nom)
                }
              }}>{g.actif ? 'Gérer' : 'Connecter'}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

