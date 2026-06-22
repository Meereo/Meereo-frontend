import { useState, useEffect } from 'react'
import { Briefcase, Star, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getEntrepriseAvatar } from '../../data/avatars'
import { CLIENT_METIERS_AO } from '../../data/ao'
import { api } from '../../services/api/client'

function Avatar({ nom, size = 44 }) {
  const av = getEntrepriseAvatar(nom)
  const sz = size
  const initials = nom.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div style={{ width: sz, height: sz, borderRadius: sz / 2, background: av?.type === 'color' ? av.value : av?.type === 'img' ? 'var(--s2)' : 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: sz * .3, fontWeight: 800, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
      {av?.type === 'img' ? <img src={av.value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (av?.initials || initials)}
    </div>
  )
}

/**
 * ProDirectory — Overlay annuaire des professionnels.
 * Shared across client, pro, fournisseur.
 * Loads real users from the API (type=pro, metier + ville filled in).
 * @param {boolean} open
 * @param {Function} onClose
 * @param {string} initialSearch
 */
export default function ProDirectory({ open, onClose, initialSearch = '' }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState(initialSearch)
  const [metier, setMetier] = useState('all')
  const [pros, setPros] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    api.professionals.getAll()
      .then(data => setPros(data || []))
      .catch(() => setPros([]))
      .finally(() => setLoading(false))
  }, [open])

  useEffect(() => {
    if (open) setSearch(initialSearch)
  }, [open, initialSearch])

  if (!open) return null

  // Normalise: API returns { name, company, metier, ville, verified, avatar }
  // Display name = company if set, else name
  const allPros = pros.map(u => ({
    id: u.id,
    nom: u.company || u.name || '',
    metier: u.metier || '',
    ville: u.ville || '',
    note: 0,
    verified: u.verified || false,
    avatar: u.avatar || null,
  }))

  const filtered = allPros.filter(p => {
    const metierOk = metier === 'all' || p.metier === metier
    const q = search.toLowerCase()
    return metierOk && (!q || (p.nom + p.metier + p.ville).toLowerCase().includes(q))
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={onClose}>
      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 18, width: 680, maxWidth: '90vw', height: '80vh', maxHeight: 700, display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.3px' }}>Annuaire des professionnels</div>
            <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}>
              {loading ? 'Chargement…' : `${allPros.length} professionnel${allPros.length > 1 ? 's' : ''} sur MEEREO`}
            </div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border-card)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t3)' }}>×</button>
        </div>
        {/* Search */}
        <div style={{ padding: '12px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          <div data-search style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border-card)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, métier, ville..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 12.5, fontFamily: 'var(--f)', color: 'var(--tx)' }} autoFocus />
          </div>
          <select value={metier} onChange={e => setMetier(e.target.value)} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-card)', background: 'var(--surface-1)', fontSize: 11.5, fontFamily: 'var(--f)', color: 'var(--tx)' }}>
            <option value="all">Tous les métiers</option>
            {CLIENT_METIERS_AO.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        {/* Cards */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {loading ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--t3)', fontSize: 13 }}>Chargement…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ marginBottom: 12, opacity: .3 }}><Briefcase size={32}/></div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>
                {allPros.length === 0 ? 'Aucun professionnel inscrit' : 'Aucun résultat'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--t3)' }}>
                {allPros.length === 0
                  ? 'Les professionnels apparaissent ici dès qu\'ils complètent leur profil (métier + ville).'
                  : 'Modifiez vos critères de recherche.'}
              </div>
            </div>
          ) : (
            <div className="rg-2" style={{ gap: 10 }}>
              {filtered.map(p => {
                const mc = p.color || '#6B7280'
                return (
                  <div key={p.id} onClick={() => { onClose(); navigate(p.publicId ? `/pro?uuid=${p.publicId}` : '/pro') }} style={{ background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 16, cursor: 'pointer', transition: 'all .15s', display: 'flex', flexDirection: 'column', gap: 10 }} onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar nom={p.nom} size={44} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nom}</span>
                          {p.verified && <span style={{ fontWeight: 700, background: 'rgba(52,199,89,.08)', color: 'var(--ok)', padding: '1px 4px', borderRadius: 100, flexShrink: 0, display: 'inline-flex' }}><Check size={7}/></span>}
                        </div>
                        <div style={{ fontSize: 10.5, color: 'var(--t4)' }}>{p.ville || 'Côte d\'Ivoire'}</div>
                      </div>
                    </div>
                    <div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: mc + '14', color: mc, display: 'inline-block', marginBottom: 4 }}>{p.metier}</span>
                      {p.specialite && <div style={{ fontSize: 10.5, color: 'var(--t3)', lineHeight: 1.4 }}>{p.specialite}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {p.note > 0 && <><Star size={11} fill="#F59E0B" strokeWidth={0}/><span style={{ fontSize: 11, fontWeight: 700, color: 'var(--tx)' }}>{p.note}</span></>}
                        {p.projets > 0 && <span style={{ fontSize: 10, color: 'var(--t4)', marginLeft: 6 }}>{p.projets} projets</span>}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--t3)' }}>Voir →</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
