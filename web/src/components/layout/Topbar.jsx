import { useState, useRef, useEffect, useCallback } from 'react'
import { Star, Check } from 'lucide-react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useMeereo } from '../../hooks/useMeereoStore'
import ProDirectory from '../shared/ProDirectory'
import NotifBell from '../shared/NotifBell'
import UserMenu from '../shared/UserMenu'
import { getMetierColor } from '../shared/AoGear'
import { CLIENT_METIERS_AO } from '../../data/ao'
import { api } from '../../services/api/client'
import './Topbar.css'

const PAGE_NAMES = {
  dashboard: 'Tableau de bord',
  projets: 'Projets',
  chantier: 'Suivi chantier',
  planning: 'Planning',
  rapports: 'Rapports',
  documents: 'Documents',
  messages: 'Messages',
  clients: 'Clients',
  intervenants: 'Intervenants',
  agenda: 'Agenda',
  bourse: "Bourse des appels d'offres",
  offres: 'Offres',
  marches: 'Marchés',
  finance: 'Centre Financier',
  paiements: 'Paiements',
  marketplace: 'Produits',
  fournisseurs: 'Fournisseurs',
  commandes: 'Commandes',
  integrations: 'Intégrations',
  parametres: 'Paramètres'
}

const METIERS = CLIENT_METIERS_AO

export default function Topbar({ activePage, onOpenSidebar }) {
  const { store } = useMeereo()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchType, setSearchType] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [showDirectory, setShowDirectory] = useState(false)
  const [dirSearch, setDirSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const searchRef = useRef(null)
  const debounceRef = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Debounced search — loads all pros then filters client-side (avoids backend query param issues)
  const runSearch = useCallback((q, metier) => {
    clearTimeout(debounceRef.current)
    if (!q || q.trim().length < 2) { setSearchResults([]); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const all = await api.professionals.getAll()
        const qLow = q.trim().toLowerCase()
        const filtered = (all || []).filter(u => {
          const name = (u.company || u.name || '').toLowerCase()
          const mtr = (u.metier || '').toLowerCase()
          const vil = (u.ville || '').toLowerCase()
          const metierOk = !metier || u.metier === metier
          return metierOk && (name.includes(qLow) || mtr.includes(qLow) || vil.includes(qLow))
        })
        const mapped = filtered.map(u => ({ id: u.id, nom: u.company || u.name || '', metier: u.metier || '', ville: u.ville || '', note: 0, verified: u.verified || false })).filter(p => p.nom)
        setSearchResults(mapped)
      } catch {
        setSearchResults([])
      }
    }, 300)
  }, [])

  const filtered = searchResults

  return (
    <div className="topbar-premium">
      <div className="topbar-left">
        <button className="topbar-hamburger" onClick={onOpenSidebar} aria-label="Menu">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <span className="topbar-crumb">{PAGE_NAMES[activePage] || 'Tableau de bord'}</span>
      </div>

      {/* Search bar — absolute center (hidden on mobile) */}
      <div ref={searchRef} className="topbar-search" style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 420, maxWidth: 'calc(100% - 320px)', zIndex: 10 }}>
        <div style={{ position: 'relative' }}>
          <div data-search style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: 'transparent', borderRadius: 10, border: '1px solid var(--border-card)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setSearchOpen(true); runSearch(e.target.value, searchType) }}
              onFocus={() => searchQuery && setSearchOpen(true)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setSearchOpen(false); setDirSearch(searchQuery); setSearchQuery(''); setShowDirectory(true) } }}
              placeholder="Rechercher un professionnel..."
              style={{ flex: 1, background: 'none', border: 'none', outline: 'none', boxShadow: 'none', fontSize: 12.5, fontFamily: 'var(--f)', color: 'var(--tx)' }}
            />
            <select
              value={searchType}
              onChange={e => { setSearchType(e.target.value); setSearchOpen(true); runSearch(searchQuery, e.target.value) }}
              style={{ background: 'none', border: 'none', fontSize: 11, fontFamily: 'var(--f)', color: 'var(--t3)', cursor: 'pointer', outline: 'none' }}
            >
              <option value="">Tous métiers</option>
              {METIERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Search results dropdown via portal */}
          {searchOpen && searchQuery.trim().length >= 2 && createPortal(
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setSearchOpen(false)} />
              {(() => {
                const rect = searchRef.current?.querySelector('div')?.getBoundingClientRect()
                if (!rect) return null
                const results = filtered.slice(0, 6)
                return (
                  <div style={{ position: 'fixed', top: rect.bottom + 6, left: rect.left, width: rect.width, background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 12, boxShadow: '0 16px 48px rgba(0,0,0,.15)', maxHeight: 340, overflowY: 'auto', zIndex: 9999, fontFamily: 'var(--f)' }}>
                    {results.length > 0 ? (<>
                      <div style={{ padding: '8px 14px', fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid var(--border)' }}>{results.length} professionnel{results.length > 1 ? 's' : ''}</div>
                      {results.map(p => {
                        const initials = (p.nom || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
                        const mc = getMetierColor(p.metier)
                        return (
                          <div key={p.id} onClick={() => { setSearchOpen(false); setSearchQuery(''); navigate(p.publicId ? `/pro?uuid=${p.publicId}` : '/pro') }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .1s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'} onMouseOut={e => e.currentTarget.style.background = ''}>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: mc + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: mc, flexShrink: 0 }}>{initials}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5 }}>
                                {p.nom}
                                {p.verified && <span style={{ fontSize: 8, background: 'rgba(52,199,89,.08)', color: 'var(--ok)', padding: '1px 4px', borderRadius: 100, fontWeight: 700 }}>&#10003;</span>}
                              </div>
                              <div style={{ fontSize: 10.5, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 3 }}>{p.metier}{p.ville ? ' · ' + p.ville : ''}{p.note ? <><span style={{margin:'0 2px'}}>·</span><Star size={9} fill="#F59E0B" strokeWidth={0}/> {p.note}</> : ''}</div>
                            </div>
                          </div>
                        )
                      })}
                      <button onClick={() => { setSearchOpen(false); setDirSearch(searchQuery); setSearchQuery(''); setShowDirectory(true) }} style={{ width: '100%', padding: '10px 14px', border: 'none', borderTop: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 11.5, fontWeight: 600, color: 'var(--t3)' }}>Voir tout l'annuaire →</button>
                    </>) : (
                      <div style={{ padding: '28px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>Aucun résultat</div>
                        <div style={{ fontSize: 11.5, color: 'var(--t4)', marginBottom: 14 }}>Aucun professionnel trouvé pour cette recherche.</div>
                        <button onClick={() => { setSearchOpen(false); setSearchQuery(''); setShowDirectory(true) }} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid var(--border-card)', background: 'var(--surface-1)', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 600, color: 'var(--tx)' }}>Voir tous les professionnels</button>
                      </div>
                    )}
                  </div>
                )
              })()}
            </>,
            document.body
          )}
        </div>
      </div>

      <div className="topbar-right">
        <NotifBell />
        <UserMenu />
      </div>

      {/* Pro Directory overlay — same component as client */}
      <ProDirectory open={showDirectory} onClose={() => setShowDirectory(false)} initialSearch={dirSearch} />
    </div>
  )
}
