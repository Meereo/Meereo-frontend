import { useState, useMemo, useCallback, useEffect } from 'react'
import Modal from '../../components/shared/Modal'
import { useMeereo } from '../../hooks/useMeereoStore'
import { DSPageHeader, DSEmptyState } from '../../design/components'
import { ASSET_STATUS_LABELS, ASSET_CATEGORIES } from '../../domain/status'
import { api } from '../../services/api/client'
import { formatDateFR } from '../../utils/helpers'

const STATUS_COLORS = {
  planifie: 'var(--t4)', en_conception: 'var(--info)', en_realisation: 'var(--wrn)',
  installe: 'var(--blue)', receptionne: 'var(--ok)', en_exploitation: 'var(--ok)',
  en_maintenance: 'var(--wrn)', renove: 'var(--info)', remplace: 'var(--t4)', archive: 'var(--t4)',
}

export default function Assets({ showToast }) {
  const { store, createAsset, updateAsset, addMaintenance } = useMeereo()
  const [backendAssets, setBackendAssets] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [projectFilter, setProjectFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [maintenanceModal, setMaintenanceModal] = useState(null)
  const [mForm, setMForm] = useState({ description: '', entreprise: '', pieces: '' })

  useEffect(() => { api.assets.getAll().then(a => { if (Array.isArray(a)) setBackendAssets(a) }).catch(() => {}) }, [])

  const assets = useMemo(() => {
    let list = backendAssets.length > 0 ? backendAssets : (store.assets || [])
    if (projectFilter) list = list.filter(a => a.projectId === projectFilter)
    if (categoryFilter !== 'all') list = list.filter(a => a.category === categoryFilter)
    return list
  }, [backendAssets, store.assets, projectFilter, categoryFilter])

  const projects = useMemo(() => (store.projects || []).filter(p => p.status !== 'stopped'), [store.projects])
  const projectMap = useMemo(() => { const m = {}; projects.forEach(p => { m[p.id] = p }); return m }, [projects])

  // Create form
  const [cf, setCf] = useState({ name: '', category: 'structure', projectId: '', localisation: '', fabricant: '', reference: '', garantieFin: '', dureeVie: '' })

  const submitCreate = async () => {
    if (!cf.name.trim() || !cf.projectId) return
    const created = await createAsset({ ...cf, garantieFin: cf.garantieFin || undefined })
    if (created) {
      setBackendAssets(prev => [...prev, created])
      setShowCreate(false)
      setCf({ name: '', category: 'structure', projectId: '', localisation: '', fabricant: '', reference: '', garantieFin: '', dureeVie: '' })
    }
  }

  const submitMaintenance = async () => {
    if (!maintenanceModal) return
    const updated = await addMaintenance(maintenanceModal.id, mForm)
    if (updated) {
      setBackendAssets(prev => prev.map(a => a.id === maintenanceModal.id ? updated : a))
      setMaintenanceModal(null)
      setMForm({ description: '', entreprise: '', pieces: '' })
    }
  }

  const now = new Date()

  return (
    <div>
      <DSPageHeader title="Actifs du Bâtiment" subtitle={`${assets.length} actifs`} actions={
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ Nouvel actif</button>
      } />

      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <select className="form-input" value={projectFilter} onChange={e => setProjectFilter(e.target.value)} style={{ width: 220, fontSize: 12 }}>
          <option value="">Tous les projets</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.nom || p.name}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className={`filter-pill ${categoryFilter === 'all' ? 'active' : ''}`} onClick={() => setCategoryFilter('all')}>Tous</button>
          {ASSET_CATEGORIES.slice(0, 8).map(c => (
            <button key={c.id} className={`filter-pill ${categoryFilter === c.id ? 'active' : ''}`} onClick={() => setCategoryFilter(c.id)}>{c.icon} {c.label}</button>
          ))}
        </div>
      </div>

      {assets.length === 0 ? (
        <DSEmptyState icon="🏗️" title="Aucun actif" description="Les actifs représentent les composants physiques de vos bâtiments : fondations, toiture, électricité, ascenseurs..." actionLabel="+ Nouvel actif" onAction={() => setShowCreate(true)} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {assets.map(a => {
            const cat = ASSET_CATEGORIES.find(c => c.id === a.category)
            const statusColor = STATUS_COLORS[a.status] || 'var(--t4)'
            const garantieExpired = a.garantieFin && new Date(a.garantieFin) < now
            const garantieSoon = a.garantieFin && !garantieExpired && (new Date(a.garantieFin) - now) < 90 * 24 * 60 * 60 * 1000
            return (
              <div key={a.id} className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => setSelected(a)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{cat?.icon || '⚙️'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{a.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--t3)' }}>{cat?.label || a.category}{a.localisation ? ' · ' + a.localisation : ''}</div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: statusColor + '14', color: statusColor }}>{ASSET_STATUS_LABELS[a.status] || a.status}</span>
                </div>
                {projectMap[a.projectId] && <div style={{ fontSize: 11, color: 'var(--t4)', marginBottom: 4 }}>Projet : {projectMap[a.projectId].nom}</div>}
                {a.fabricant && <div style={{ fontSize: 11, color: 'var(--t3)' }}>Fabricant : {a.fabricant}{a.reference ? ' · Réf: ' + a.reference : ''}</div>}
                {a.garantieFin && (
                  <div style={{ fontSize: 10, marginTop: 6, fontWeight: 700, color: garantieExpired ? '#EF4444' : garantieSoon ? '#F59E0B' : 'var(--ok)' }}>
                    {garantieExpired ? '⚠️ Garantie expirée' : garantieSoon ? '⏳ Garantie expire bientôt' : '✅ Garantie jusqu\'au ' + formatDateFR(a.garantieFin)}
                  </div>
                )}
                {Array.isArray(a.maintenances) && a.maintenances.length > 0 && (
                  <div style={{ fontSize: 10, color: 'var(--t4)', marginTop: 4 }}>{a.maintenances.length} maintenance(s)</div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Nouvel actif">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div><label className="form-label">Nom *</label><input className="form-input" value={cf.name} onChange={e => setCf(p => ({ ...p, name: e.target.value }))} placeholder="ex: Toiture principale" /></div>
          <div><label className="form-label">Projet *</label><select className="form-input" value={cf.projectId} onChange={e => setCf(p => ({ ...p, projectId: e.target.value }))}><option value="">Sélectionner</option>{projects.map(p => <option key={p.id} value={p.id}>{p.nom || p.name}</option>)}</select></div>
          <div><label className="form-label">Catégorie</label><select className="form-input" value={cf.category} onChange={e => setCf(p => ({ ...p, category: e.target.value }))}>{ASSET_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}</select></div>
          <div><label className="form-label">Localisation</label><input className="form-input" value={cf.localisation} onChange={e => setCf(p => ({ ...p, localisation: e.target.value }))} placeholder="ex: Bâtiment A, Étage 2" /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}><label className="form-label">Fabricant</label><input className="form-input" value={cf.fabricant} onChange={e => setCf(p => ({ ...p, fabricant: e.target.value }))} /></div>
            <div style={{ flex: 1 }}><label className="form-label">Référence</label><input className="form-input" value={cf.reference} onChange={e => setCf(p => ({ ...p, reference: e.target.value }))} /></div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ flex: 1 }}><label className="form-label">Fin de garantie</label><input className="form-input" type="date" value={cf.garantieFin} onChange={e => setCf(p => ({ ...p, garantieFin: e.target.value }))} /></div>
            <div style={{ flex: 1 }}><label className="form-label">Durée de vie</label><input className="form-input" value={cf.dureeVie} onChange={e => setCf(p => ({ ...p, dureeVie: e.target.value }))} placeholder="ex: 15 ans" /></div>
          </div>
          <button className="btn btn-primary btn-sm" onClick={submitCreate} disabled={!cf.name.trim() || !cf.projectId}>Créer l'actif</button>
        </div>
      </Modal>

      {/* Maintenance Modal */}
      <Modal isOpen={!!maintenanceModal} onClose={() => setMaintenanceModal(null)} title="Ajouter une maintenance">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div><label className="form-label">Description</label><textarea className="form-input" rows="2" value={mForm.description} onChange={e => setMForm(p => ({ ...p, description: e.target.value }))} /></div>
          <div><label className="form-label">Entreprise</label><input className="form-input" value={mForm.entreprise} onChange={e => setMForm(p => ({ ...p, entreprise: e.target.value }))} /></div>
          <div><label className="form-label">Pièces remplacées</label><input className="form-input" value={mForm.pieces} onChange={e => setMForm(p => ({ ...p, pieces: e.target.value }))} /></div>
          <button className="btn btn-primary btn-sm" onClick={submitMaintenance}>Enregistrer</button>
        </div>
      </Modal>

      {/* Detail panel */}
      {selected && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 440, background: 'var(--bg)', borderLeft: '1px solid var(--border)', zIndex: 100, overflowY: 'auto', padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{selected.name}</div>
            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--t3)' }}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12 }}>
            {[['Catégorie', ASSET_CATEGORIES.find(c => c.id === selected.category)?.label], ['Statut', ASSET_STATUS_LABELS[selected.status]], ['Localisation', selected.localisation], ['Fabricant', selected.fabricant], ['Référence', selected.reference], ['Durée de vie', selected.dureeVie], ['Garantie fin', selected.garantieFin ? formatDateFR(selected.garantieFin) : null]].filter(([,v]) => v).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}><span style={{ color: 'var(--t3)' }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span></div>
            ))}
          </div>
          {Array.isArray(selected.maintenances) && selected.maintenances.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Maintenances ({selected.maintenances.length})</div>
              {selected.maintenances.map((m, i) => (
                <div key={m.id || i} style={{ padding: '8px 12px', background: 'var(--s1)', borderRadius: 8, marginBottom: 6, fontSize: 11 }}>
                  <div style={{ fontWeight: 600 }}>{m.description || 'Maintenance'}</div>
                  <div style={{ color: 'var(--t4)' }}>{m.entreprise} · {formatDateFR(m.date)}</div>
                </div>
              ))}
            </div>
          )}
          <button className="btn btn-sm" style={{ marginTop: 16 }} onClick={() => { setMaintenanceModal(selected); setMForm({ description: '', entreprise: '', pieces: '' }) }}>+ Maintenance</button>
        </div>
      )}
    </div>
  )
}
