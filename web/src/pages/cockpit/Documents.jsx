import { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { FileText, LayoutGrid, List, X, Download, ExternalLink } from 'lucide-react'
import FilePreview from '../../components/shared/FilePreview'
import { useMeereo } from '../../hooks/useMeereoStore'
import { useMergedData } from '../../hooks/useMergedData'
import { DSPageHeader , DSEmptyState } from '../../design/components'
import { formatDateFR } from '../../utils/helpers'
import { api } from '../../services/api/client'
import { ENTREPRISE_DOC_CATEGORY_LABELS, getDocExpirationStatus, getDocExpirationDays } from '../../domain/status'

const typeConf = {
  plan: { color: '#007AFF', bg: 'rgba(0,122,255,.07)', label: 'PLAN' },
  cctp: { color: '#7C3AED', bg: 'rgba(124,58,237,.07)', label: 'CCTP' },
  etude: { color: '#0891B2', bg: 'rgba(8,145,178,.07)', label: 'ETUDE' },
  admin: { color: '#6B7280', bg: 'rgba(107,114,128,.07)', label: 'ADMIN' },
  cr: { color: '#191c1d', bg: 'rgba(25,28,29,.06)', label: 'CR' },
  note: { color: '#EA580C', bg: 'rgba(234,88,12,.07)', label: 'NOTE' },
  devis: { color: '#16A34A', bg: 'rgba(22,163,74,.07)', label: 'DEVIS' },
  planning: { color: '#F59E0B', bg: 'rgba(245,158,11,.07)', label: 'PLAN.' },
  rapport: { color: '#DC2626', bg: 'rgba(220,38,38,.07)', label: 'RAPP.' },
  dpgf: { color: '#16A34A', bg: 'rgba(22,163,74,.07)', label: 'DPGF' },
  pv: { color: '#191c1d', bg: 'rgba(25,28,29,.06)', label: 'PV' },
  pdf: { color: '#FF3B30', bg: 'rgba(255,59,48,.07)', label: 'PDF' },
  dwg: { color: '#007AFF', bg: 'rgba(0,122,255,.07)', label: 'DWG' },
  xls: { color: '#34C759', bg: 'rgba(52,199,89,.07)', label: 'XLS' },
  doc: { color: '#FF9500', bg: 'rgba(255,149,0,.07)', label: 'DOC' },
  img: { color: '#BE185D', bg: 'rgba(190,24,93,.07)', label: 'IMG' },
  video: { color: '#7C3AED', bg: 'rgba(124,58,237,.07)', label: 'VIDEO' },
  // Enterprise document categories
  rccm: { color: '#059669', bg: 'rgba(5,150,105,.07)', label: 'RCCM' },
  attestation_fiscale: { color: '#D97706', bg: 'rgba(217,119,6,.07)', label: 'ATT.F' },
  assurance: { color: '#7C3AED', bg: 'rgba(124,58,237,.07)', label: 'ASSUR' },
  certification: { color: '#2563EB', bg: 'rgba(37,99,235,.07)', label: 'CERT' },
  presentation: { color: '#EC4899', bg: 'rgba(236,72,153,.07)', label: 'PRES' },
  portfolio: { color: '#F59E0B', bg: 'rgba(245,158,11,.07)', label: 'PORT' },
}
const getTC = t => typeConf[t] || { color: 'var(--t2)', bg: 'rgba(0,0,0,.04)', label: (t || '?').toUpperCase() }

// Detect document type from file extension
const detectType = (filename) => {
  const ext = (filename || '').split('.').pop().toLowerCase()
  if (['pdf'].includes(ext)) return 'pdf'
  if (['dwg', 'dxf'].includes(ext)) return 'dwg'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'xls'
  if (['doc', 'docx'].includes(ext)) return 'doc'
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'img'
  if (['mp4', 'mov', 'avi'].includes(ext)) return 'video'
  return 'pdf'
}

// Detect category from filename keywords
const detectCat = (filename) => {
  const f = (filename || '').toLowerCase()
  if (f.includes('plan') || f.includes('dwg') || f.includes('facade') || f.includes('coupe')) return 'Plans'
  if (f.includes('cctp')) return 'CCTP'
  if (f.includes('dpgf') || f.includes('quantitatif')) return 'DPGF'
  if (f.includes('devis') || f.includes('offre')) return 'Devis'
  if (f.includes('etude') || f.includes('calcul') || f.includes('thermique') || f.includes('sol')) return 'études'
  if (f.includes('rapport') || f.includes('cr ') || f.includes('compte') || f.includes('visite')) return 'CR'
  if (f.includes('pv') || f.includes('reception') || f.includes('proces')) return 'PV'
  if (f.includes('planning') || f.includes('gantt') || f.includes('calendrier')) return 'Planning'
  if (f.includes('permis') || f.includes('admin') || f.includes('assurance') || f.includes('marche')) return 'Administratif'
  if (f.includes('photo') || f.includes('img') || f.includes('chantier')) return 'Photos'
  return 'Divers'
}

// Detect document subtype for the data
const detectDocType = (filename) => {
  const f = (filename || '').toLowerCase()
  if (f.includes('plan') || f.includes('dwg') || f.includes('facade')) return 'plan'
  if (f.includes('cctp')) return 'cctp'
  if (f.includes('dpgf')) return 'dpgf'
  if (f.includes('devis')) return 'devis'
  if (f.includes('etude') || f.includes('calcul') || f.includes('note')) return 'etude'
  if (f.includes('rapport')) return 'rapport'
  if (f.includes('cr ') || f.includes('compte-rendu') || f.includes('reunion')) return 'cr'
  if (f.includes('pv')) return 'pv'
  if (f.includes('planning')) return 'planning'
  if (f.includes('permis') || f.includes('admin')) return 'admin'
  return detectType(filename)
}

// ── Expiration Badge ──
function ExpirationBadge({ expiresAt }) {
  const status = getDocExpirationStatus(expiresAt)
  if (!status || status === 'valid') return null
  const days = getDocExpirationDays(expiresAt)
  if (status === 'expired') return <span style={{ fontSize: 8, fontWeight: 600, padding: '1px 5px', borderRadius: 3, background: '#EF4444', color: '#fff', marginLeft: 4 }}>EXPIRÉ</span>
  return <span style={{ fontSize: 8, fontWeight: 600, padding: '1px 5px', borderRadius: 3, background: '#F59E0B', color: '#fff', marginLeft: 4 }}>J-{days}</span>
}

// ── Version Badge ──
function VersionBadge({ version }) {
  if (!version || version <= 1) return null
  return <span style={{ fontSize: 8, fontWeight: 600, padding: '1px 5px', borderRadius: 3, background: 'var(--blue)', color: '#fff', marginLeft: 4 }}>v{version}</span>
}

export default function Documents({ showToast }) {
  const { store, updateStore, emitEvent, uploadNewVersion } = useMeereo()
  const { documents: allDocs, markets: allMarches } = useMergedData()
  const [mainTab, setMainTab] = useState('projets') // 'projets' | 'entreprise' | 'expiration'
  const [typeFilter, setTypeFilter] = useState('all')
  const [projetFilter, setProjetFilter] = useState('all')
  const [marcheFilter, setMarcheFilter] = useState('all')
  const [entrepriseCategory, setEntrepriseCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [view, setView] = useState('grid')
  const [importModal, setImportModal] = useState(false)
  const [importFiles, setImportFiles] = useState([])
  const [importProjet, setImportProjet] = useState('')
  const [importAttempted, setImportAttempted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [importCategory, setImportCategory] = useState('')
  const [importExpiresAt, setImportExpiresAt] = useState('')
  // Document actions
  const [docMenu, setDocMenu] = useState(null) // { id, x, y }
  const [confirmDelete, setConfirmDelete] = useState(null) // { id, nom }
  const [renameModal, setRenameModal] = useState(null) // { id, nom }
  const [viewerDoc, setViewerDoc] = useState(null) // doc object for inline viewer
  const [versionUpload, setVersionUpload] = useState(null) // { id } for new version upload
  const [versionsModal, setVersionsModal] = useState(null) // [versions] for versions list
  const menuRef = useRef(null)

  // Fetch documents from backend on mount so shared project docs are visible
  useEffect(() => {
    api.documents.getAll().then(docs => {
      if (docs && docs.length >= 0) {
        updateStore(prev => ({ ...prev, documents: docs }))
      }
    }).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!docMenu) return
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setDocMenu(null) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [docMenu])

  const deleteDocument = (docId) => {
    // Call backend first (non-blocking — optimistic UI)
    api.documents.delete(docId).catch(() => {})
    updateStore(prev => {
      const inStore = (prev.documents || []).some(d => d.id === docId)
      if (inStore) {
        return { ...prev, documents: (prev.documents || []).filter(d => d.id !== docId) }
      }
      // Static doc — add a tombstone so merge skips it
      const staticDoc = allDocs.find(d => d.id === docId)
      if (staticDoc) {
        return { ...prev, documents: [...(prev.documents || []), { ...staticDoc, _deleted: true }] }
      }
      return prev
    })
    setConfirmDelete(null)
    showToast && showToast('Document supprimé')
  }

  const renameDocument = (docId, newName) => {
    if (!newName.trim()) return
    // Call backend (non-blocking — optimistic UI)
    api.documents.update(docId, { name: newName.trim() }).catch(() => {})
    updateStore(prev => {
      const inStore = (prev.documents || []).some(d => d.id === docId)
      if (inStore) {
        return { ...prev, documents: (prev.documents || []).map(d => d.id === docId ? { ...d, nom: newName.trim(), name: newName.trim() } : d) }
      }
      // Static doc — copy to store with new name (store overrides static in merge)
      const staticDoc = allDocs.find(d => d.id === docId)
      if (staticDoc) {
        return { ...prev, documents: [...(prev.documents || []), { ...staticDoc, nom: newName.trim(), name: newName.trim() }] }
      }
      return prev
    })
    setRenameModal(null)
    showToast && showToast('Document renommé')
  }

  const downloadDocument = (doc) => {
    if (doc.url) {
      const a = document.createElement('a'); a.href = doc.url; a.download = doc.nom || 'document'; a.click()
    } else {
      showToast && showToast('Téléchargement non disponible')
    }
  }

  const isEntrepriseMode = importProjet === '__entreprise__'

  // Expiration stats
  const expiringDocs = useMemo(() => allDocs.filter(d => getDocExpirationStatus(d.expiresAt) === 'expiring_soon'), [allDocs])
  const expiredDocs = useMemo(() => allDocs.filter(d => getDocExpirationStatus(d.expiresAt) === 'expired'), [allDocs])
  const entrepriseDocs = useMemo(() => allDocs.filter(d => d.isEntreprise || d.category === 'entreprise'), [allDocs])

  const filtered = allDocs.filter(d => {
    // Main tab filter
    if (mainTab === 'entreprise') {
      if (!d.isEntreprise && d.category !== 'entreprise') return false
      if (entrepriseCategory !== 'all' && d.category !== entrepriseCategory) return false
    } else if (mainTab === 'expiration') {
      const expStatus = getDocExpirationStatus(d.expiresAt)
      if (!expStatus || expStatus === 'valid') return false
    } else {
      // Projets tab — existing filters
      const pOk = projetFilter === 'all' || projetFilter === '__entreprise__'
        ? (projetFilter === '__entreprise__' ? (d.isEntreprise || d.category === 'entreprise') : true)
        : d.projet === projetFilter
      if (!pOk) return false
      const mOk = marcheFilter === 'all' || d.marketId === marcheFilter
      if (!mOk) return false
    }
    const tOk = typeFilter === 'all' || d.type === typeFilter || d.category === typeFilter
    const q = search.toLowerCase()
    const sOk = !q || ((d.nom || '') + (d.projet || '') + (d.auteur || '') + (d.cat || '') + (d.category || '')).toLowerCase().includes(q)
    return tOk && sOk
  })

  const recentDocs = allDocs.filter(d => d.isNew).slice(0, 4)
  // All projects — from store + from documents (backward compat)
  const allProjets = [...new Set([
    ...(store.projects || []).map(p => p.nom).filter(Boolean),
    ...allDocs.map(d => d.projet).filter(Boolean),
  ])]

  return (
    <div>
      <DSPageHeader title="Documents" subtitle={`${allDocs.length} documents à ${allDocs.filter(d => d.isNew).length} nouveaux`}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[['grid', <><LayoutGrid size={12}/> Grille</>], ['list', <><List size={12}/> Liste</>]].map(([v, l]) => (
            <button key={v} className={`filter-pill ${view === v ? 'active' : ''}`} onClick={() => setView(v)}>{l}</button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { setImportModal(true); setImportFiles([]); setImportAttempted(false); setImportProjet(projetFilter !== 'all' ? projetFilter : ''); setImportCategory(''); setImportExpiresAt('') }}>+ Importer</button>
      </DSPageHeader>

      {/* Main tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {[
          ['projets', 'Projets', allDocs.length],
          ['entreprise', `Référentiel Entreprise`, entrepriseDocs.length],
          ['expiration', `Alertes Expiration`, expiringDocs.length + expiredDocs.length],
        ].map(([key, label, count]) => (
          <button
            key={key}
            onClick={() => { setMainTab(key); setTypeFilter('all'); setSearch('') }}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none',
              background: mainTab === key ? 'var(--tx)' : 'var(--s2)',
              color: mainTab === key ? '#fff' : 'var(--t3)',
              cursor: 'pointer',
            }}
          >
            {label} ({count})
            {key === 'expiration' && expiredDocs.length > 0 && mainTab !== key && (
              <span style={{ marginLeft: 4, width: 6, height: 6, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
            )}
          </button>
        ))}
      </div>

      {/* Expiration summary banner */}
      {mainTab === 'expiration' && (expiringDocs.length > 0 || expiredDocs.length > 0) && (
        <div style={{ padding: '10px 16px', background: expiredDocs.length > 0 ? 'rgba(239,68,68,.06)' : 'rgba(245,158,11,.06)', borderRadius: 10, marginBottom: 16, fontSize: 12, display: 'flex', gap: 16, alignItems: 'center', border: '1px solid ' + (expiredDocs.length > 0 ? 'rgba(239,68,68,.15)' : 'rgba(245,158,11,.15)') }}>
          {expiredDocs.length > 0 && <span style={{ fontWeight: 600, color: '#EF4444' }}>{expiredDocs.length} expiré{expiredDocs.length > 1 ? 's' : ''}</span>}
          {expiringDocs.length > 0 && <span style={{ fontWeight: 600, color: '#F59E0B' }}>{expiringDocs.length} expire{expiringDocs.length > 1 ? 'nt' : ''} bientôt</span>}
        </div>
      )}

      {/* Enterprise category filter */}
      {mainTab === 'entreprise' && (
        <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
          {[['all', 'Tous'], ...Object.entries(ENTREPRISE_DOC_CATEGORY_LABELS)].map(([k, l]) => (
            <button key={k} className={`filter-pill ${entrepriseCategory === k ? 'active' : ''}`} onClick={() => setEntrepriseCategory(k)}>{l}</button>
          ))}
        </div>
      )}

      <div>
        {/* Filters — compact, all in one row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 220, padding: '8px 14px', border: '1px solid var(--border-card)', borderRadius: 8, fontSize: 13, fontFamily: 'var(--f)', background: 'transparent', outline: 'none', color: 'var(--tx)' }} />
          {/* Projet dropdown */}
          <select value={projetFilter} onChange={e => setProjetFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border-card)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--f)', background: 'transparent', color: projetFilter === 'all' ? 'var(--t3)' : 'var(--tx)', fontWeight: projetFilter === 'all' ? 400 : 600, cursor: 'pointer', outline: 'none' }}>
            <option value="all">Tous les projets ({allProjets.length})</option>
            <option value="__entreprise__">éé Dossier Entreprise</option>
            {allProjets.map(p => {
              const count = allDocs.filter(d => d.projet === p).length
              return <option key={p} value={p}>{p} ({count})</option>
            })}
          </select>
          {/* Marché dropdown */}
          {allMarches.length > 0 && (
            <select value={marcheFilter} onChange={e => setMarcheFilter(e.target.value)} style={{ padding: '8px 12px', border: '1px solid var(--border-card)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--f)', background: 'transparent', color: marcheFilter === 'all' ? 'var(--t3)' : 'var(--tx)', fontWeight: marcheFilter === 'all' ? 400 : 600, cursor: 'pointer', outline: 'none' }}>
              <option value="all">Tous les marchés</option>
              {allMarches.map(m => <option key={m.id} value={m.id}>{m.lot || m.titre || m.entreprise || 'Marché'}</option>)}
            </select>
          )}
          {/* Type pills */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[['all', 'Tous'], ['plan', 'Plans'], ['etude', 'études'], ['cctp', 'CCTP'], ['devis', 'Devis'], ['cr', 'CR'], ['admin', 'Admin'], ['pv', 'PV']].map(([k, l]) => (
              <button key={k} className={`filter-pill ${typeFilter === k ? 'active' : ''}`} onClick={() => setTypeFilter(k)}>{l}</button>
            ))}
          </div>
          <span style={{ fontSize: 11.5, color: 'var(--t3)', marginLeft: 'auto' }}>{filtered.length} document{filtered.length > 1 ? 's' : ''}</span>
        </div>

          {filtered.length === 0 && (
            <DSEmptyState icon={<FileText size={24}/>} title="Aucun document" description="Importez vos premiers documents pour centraliser vos plans, contrats et rapports." actionLabel="Importer" onAction={() => { setImportModal(true); setImportFiles([]); setImportProjet('') }} />
          )}

          {/* Grid view */}
          {view === 'grid' ? (
            <div className="doc-grid">
              {filtered.map(d => {
                const tc = getTC(d.type)
                const isImgDoc = d.type === 'img' || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(d.url || '')
                return (
                  <div key={d.id} className="doc-card" style={{ position: 'relative', cursor: d.url ? 'pointer' : 'default' }} onClick={() => d.url && setViewerDoc(d)}>
                    <div style={{ height: 80, borderRadius: 8, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, position: 'relative', background: tc.bg }}>
                      <span style={{ fontSize: 16, fontWeight: 600, color: tc.color }}>{tc.label}</span>
                      {isImgDoc && d.url && <img src={d.url} alt={d.nom} onError={e => { e.target.style.display = 'none' }} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: .92 }} />}
                      {d.isNew && <span style={{ position: 'absolute', top: 6, right: 6, fontSize: 8, fontWeight: 600, padding: '1px 5px', borderRadius: 3, background: 'var(--tx)', color: '#fff' }}>NEW</span>}
                    </div>
                    <div className="doc-card-name">{d.nom}<VersionBadge version={d.version} /><ExpirationBadge expiresAt={d.expiresAt} /></div>
                    <div className="doc-card-meta">{d.projet} à {formatDateFR(d.date)} à {d.taille}</div>
                    {/* Menu actions */}
                    <button onClick={(e) => { e.stopPropagation(); setDocMenu(docMenu?.id === d.id ? null : { id: d.id, x: e.clientX, y: e.clientY }) }} style={{ position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 7, background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(4px)', border: '1px solid var(--border-subtle)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity .12s' }} className="doc-action-btn">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--t2)" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                    </button>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="card">
              <table className="data-table">
                <thead><tr><th>Type</th><th>Document</th><th>Projet</th><th>Auteur</th><th>Date</th><th className="right">Taille</th><th style={{ width: 40 }}></th></tr></thead>
                <tbody>
                  {filtered.map(d => {
                    const tc = getTC(d.type)
                    return (
                      <tr key={d.id} style={{ cursor: d.url ? 'pointer' : 'default' }} onClick={() => d.url && setViewerDoc(d)}>
                        <td><span style={{ fontSize: 9, fontWeight: 600, color: tc.color, background: tc.bg, padding: '3px 7px', borderRadius: 4 }}>{tc.label}</span></td>
                        <td className="bold">{d.nom}{d.isNew && <span className="doc-card-new">NEW</span>}<VersionBadge version={d.version} /><ExpirationBadge expiresAt={d.expiresAt} /></td>
                        <td className="muted">{d.projet}</td>
                        <td className="muted">{d.auteur}</td>
                        <td className="muted">{formatDateFR(d.date)}</td>
                        <td className="right muted">{d.taille}</td>
                        <td>
                          <button onClick={(e) => { e.stopPropagation(); setDocMenu(docMenu?.id === d.id ? null : { id: d.id, x: e.clientX, y: e.clientY }) }} style={{ width: 26, height: 26, borderRadius: 7, background: 'transparent', border: '1px solid transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .1s' }} onMouseOver={e => { e.currentTarget.style.background = 'var(--s2)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {/* CONTEXT MENU: Actions document */}
      {docMenu && (() => {
        const doc = allDocs.find(d => d.id === docMenu.id)
        if (!doc) return null
        return createPortal(
          <div ref={menuRef} style={{ position: 'fixed', left: Math.min(docMenu.x, window.innerWidth - 210), top: Math.min(docMenu.y, window.innerHeight - 150), zIndex: 3000, width: 190, background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 10, boxShadow: '0 10px 36px rgba(0,0,0,.14)', overflow: 'hidden', animation: 'modalIn .1s ease' }}>
            <button onClick={() => { downloadDocument(doc); setDocMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 500, color: 'var(--tx)', textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Télécharger
            </button>
            <button onClick={() => { setRenameModal({ id: doc.id, nom: doc.nom }); setDocMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 500, color: 'var(--tx)', textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><path d="M17 3a2.83 2.83 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
              Renommer
            </button>
            <button onClick={() => { setVersionUpload({ id: doc.id }); setDocMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 500, color: 'var(--tx)', textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Nouvelle version
            </button>
            <button onClick={async () => { const v = await api.documents.getVersions(doc.id); setVersionsModal(v); setDocMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 500, color: 'var(--tx)', textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Historique ({doc.version || 1} version{(doc.version || 1) > 1 ? 's' : ''})
            </button>
            <div style={{ height: 1, background: 'var(--border-subtle)', margin: '2px 0' }} />
            <button onClick={() => { setConfirmDelete({ id: doc.id, nom: doc.nom }); setDocMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 500, color: '#EF4444', textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,.04)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              Supprimer
            </button>
          </div>,
          document.body
        )
      })()}

      {/* MODAL: Confirmer la suppression */}
      {confirmDelete && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .15s ease' }} onClick={() => setConfirmDelete(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 380, padding: '28px 24px 22px', boxShadow: '0 24px 80px rgba(0,0,0,.18)' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(239,68,68,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Supprimer le document</div>
            <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.6, marginBottom: 22 }}>Le document <strong>{confirmDelete.nom}</strong> sera dûfinitivement supprimé. Cette action est irréversible.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-sm" onClick={() => setConfirmDelete(null)} style={{ padding: '9px 18px', fontSize: 12.5 }}>Annuler</button>
              <button onClick={() => deleteDocument(confirmDelete.id)} style={{ padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12.5, fontWeight: 600, background: '#EF4444', color: '#fff' }}>Supprimer</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: Renommer */}
      {renameModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .15s ease' }} onClick={() => setRenameModal(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 400, padding: '24px', boxShadow: '0 24px 80px rgba(0,0,0,.18)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Renommer le document</div>
            <input autoFocus value={renameModal.nom} onChange={e => setRenameModal(p => ({ ...p, nom: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter') renameDocument(renameModal.id, renameModal.nom) }} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)', marginBottom: 18 }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-sm" onClick={() => setRenameModal(null)} style={{ padding: '9px 18px', fontSize: 12.5 }}>Annuler</button>
              <button className="btn btn-primary btn-sm" onClick={() => renameDocument(renameModal.id, renameModal.nom)} style={{ padding: '9px 18px', fontSize: 12.5 }}>Renommer</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: Importer des documents */}
      {importModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setImportModal(false)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 520, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.5px' }}>Importer des documents</div>
              <button onClick={() => setImportModal(false)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t3)' }}>×</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Projet */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>
                  Destination
                  {importAttempted && !importProjet && <span style={{ color: 'var(--err)', fontWeight: 400, marginLeft: 4 }}>— requis</span>}
                </label>
                <select value={importProjet} onChange={e => setImportProjet(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid ' + (importAttempted && !importProjet ? 'var(--err)' : 'var(--border-card)'), borderRadius: 10, fontSize: 13, fontFamily: 'var(--f)', background: 'var(--s2)', color: 'var(--tx)' }}>
                  <option value="">— Choisir —</option>
                  <option value="__entreprise__">éé Dossier Entreprise (RCCM, attestations...)</option>
                  {(store.projects || []).map(p => <option key={p.id} value={p.nom}>{p.nom}</option>)}
                </select>
              </div>

              {/* Enterprise fields — shown when Dossier Entreprise selected */}
              {isEntrepriseMode && (
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Catégorie</label>
                    <select value={importCategory} onChange={e => setImportCategory(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f)', background: 'var(--s2)', color: 'var(--tx)' }}>
                      <option value="">— Aucune —</option>
                      {Object.entries(ENTREPRISE_DOC_CATEGORY_LABELS).map(([k, l]) => (
                        <option key={k} value={k}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Date d'expiration</label>
                    <input type="date" value={importExpiresAt} onChange={e => setImportExpiresAt(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f)', background: 'var(--s2)', color: 'var(--tx)' }} />
                  </div>
                </div>
              )}

              {/* Drop zone */}
              <div
                style={{ padding: '28px 20px', border: '2px dashed var(--border-subtle)', borderRadius: 12, textAlign: 'center', cursor: 'pointer', background: 'var(--s2)', transition: 'border-color .15s' }}
                onClick={() => document.getElementById('doc-file-input').click()}
              >
                <input id="doc-file-input" type="file" multiple style={{ display: 'none' }} onChange={e => {
                  const files = Array.from(e.target.files || [])
                  const newFiles = files.map(f => ({
                    file: f,   // actual File object kept for upload
                    name: f.name,
                    size: f.size > 1e6 ? (f.size / 1e6).toFixed(1) + ' Mo' : Math.round(f.size / 1024) + ' Ko',
                    fileType: detectType(f.name),
                    docType: detectDocType(f.name),
                    cat: detectCat(f.name),
                  }))
                  setImportFiles(prev => [...prev, ...newFiles])
                  e.target.value = ''
                }} />
                <FileText size={28} style={{ marginBottom: 8 }}/>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>Cliquez pour selectionner des fichiers</div>
                <div style={{ fontSize: 11, color: 'var(--t4)' }}>PDF, DWG, XLS, DOC, images, videos...</div>
              </div>

              {/* Files list with auto-detected types */}
              {importFiles.length > 0 && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>{importFiles.length} fichier{importFiles.length > 1 ? 's' : ''} selectionne{importFiles.length > 1 ? 's' : ''}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {importFiles.map((f, i) => {
                      const tc = getTC(f.docType)
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--s2)', borderRadius: 10, border: '1px solid var(--border-card)' }}>
                          <div style={{ width: 32, height: 32, borderRadius: 7, background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: 9, fontWeight: 600, color: tc.color }}>{tc.label}</span>
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</div>
                            <div style={{ fontSize: 10, color: 'var(--t4)', marginTop: 1 }}>{f.size} à {f.cat}</div>
                          </div>
                          <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: tc.bg, color: tc.color }}>{f.cat}</span>
                          <button onClick={() => setImportFiles(prev => prev.filter((_, j) => j !== i))} style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid rgba(220,38,38,.2)', background: 'rgba(220,38,38,.05)', color: 'var(--err)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>×</button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: 'var(--t3)', alignSelf: 'center' }}>{importFiles.length > 0 ? importFiles.length + ' fichier' + (importFiles.length > 1 ? 's' : '') : ''}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm" onClick={() => setImportModal(false)}>Annuler</button>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={importFiles.length === 0 || !importProjet || uploading}
                  onClick={async () => {
                    if (!importProjet) { setImportAttempted(true); return }
                    const isEntreprise = importProjet === '__entreprise__'
                    const projObj = isEntreprise ? null : (store.projects || []).find(p => p.nom === importProjet)
                    const projectId = projObj?.id || null
                    setUploading(true)
                    const uploaded = []
                    for (const f of importFiles) {
                      const docName = f.name.replace(/\.[^.]+$/, '')
                      try {
                        const doc = await api.documents.upload(f.file, {
                          name: docName,
                          type: f.docType,
                          projectId,
                          isEntreprise,
                          category: isEntreprise && importCategory ? importCategory : undefined,
                          expiresAt: isEntreprise && importExpiresAt ? importExpiresAt : undefined,
                        })
                        uploaded.push({ ...doc, nom: doc.name, projet: isEntreprise ? 'Dossier Entreprise' : importProjet, cat: f.cat, taille: f.size, isNew: true, isEntreprise, category: isEntreprise ? 'entreprise' : undefined })
                      } catch (err) {
                        console.warn('[DocumentsPage] upload error:', err.message)
                        showToast && showToast(`échec : ${f.name}`, 'red')
                      }
                    }
                    setUploading(false)
                    if (uploaded.length > 0) {
                      updateStore(prev => ({
                        ...prev,
                        documents: [
                          ...(prev.documents || []).filter(d => !uploaded.some(u => u.id === d.id)),
                          ...uploaded,
                        ],
                      }))
                      emitEvent('document_uploaded', { count: uploaded.length, project: importProjet }, {
                        notifMsg: uploaded.length + ' document' + (uploaded.length > 1 ? 's' : '') + ' ajouté' + (uploaded.length > 1 ? 's' : ''),
                        notifType: 'info',
                      })
                      showToast && showToast(uploaded.length + ' document' + (uploaded.length > 1 ? 's' : '') + ' importé' + (uploaded.length > 1 ? 's' : ''))
                    }
                    setImportModal(false)
                    setImportFiles([])
                  }}
                >
                  {uploading ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin .6s linear infinite', display: 'inline-block' }} />
                      Importation...
                    </span>
                  ) : 'Importer'}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: Nouvelle version */}
      {versionUpload && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .15s ease' }} onClick={() => setVersionUpload(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 420, padding: '24px', boxShadow: '0 24px 80px rgba(0,0,0,.18)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Nouvelle version</div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 16 }}>Sélectionnez le fichier de remplacement. Le document conservera son nom et ses métadonnées.</div>
            <input type="file" id="version-file-input" style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-sm" onClick={() => setVersionUpload(null)}>Annuler</button>
              <button className="btn btn-primary btn-sm" onClick={async () => {
                const fileInput = document.getElementById('version-file-input')
                const file = fileInput?.files?.[0]
                if (!file) return
                await uploadNewVersion(versionUpload.id, file)
                setVersionUpload(null)
                // Refresh docs
                api.documents.getAll().then(docs => { if (docs) updateStore(prev => ({ ...prev, documents: docs })) }).catch(() => {})
              }}>Envoyer</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL: Historique des versions */}
      {versionsModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .15s ease' }} onClick={() => setVersionsModal(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 480, maxHeight: '70vh', overflow: 'auto', padding: '24px', boxShadow: '0 24px 80px rgba(0,0,0,.18)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Historique des versions</div>
            {versionsModal.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--t3)' }}>Aucune version trouvée</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {versionsModal.map(v => (
                  <div key={v.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--s2)', borderRadius: 10, border: '1px solid var(--border-card)' }}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: v.parentId ? 'var(--blue)' : 'var(--ok)', color: '#fff' }}>v{v.version}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--t4)' }}>{formatDateFR(v.createdAt)}</div>
                    </div>
                    {v.url && (
                      <a href={v.url} download={v.name} onClick={e => e.stopPropagation()} style={{ fontSize: 11, fontWeight: 600, color: 'var(--blue)', textDecoration: 'none' }}>Télécharger</a>
                    )}
                  </div>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn btn-sm" onClick={() => setVersionsModal(null)}>Fermer</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* VIEWER: Visualiseur de document */}
      {viewerDoc && <FilePreview file={viewerDoc} onClose={() => setViewerDoc(null)} />}
    </div>
  )
}

