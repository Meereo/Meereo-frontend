import { useState } from 'react'
import { Briefcase, Star, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getEntrepriseAvatar } from '../../data/avatars'
import { METIERS_AO } from '../../data/ao'

const DEMO_PROS = [
  { id: 'pro_1', nom: 'Koné Architecture', metier: 'Architecte', ville: 'Abidjan, Cocody', note: 4.8, verified: true, specialite: 'Résidentiel haut standing', projets: 34, color: '#2563EB' },
  { id: 'pro_2', nom: 'BTP Ivoire Construction', metier: 'Gros-oeuvre', ville: 'Abidjan, Marcory', note: 4.5, verified: true, specialite: 'Gros œuvre & structure béton', projets: 67, color: '#DC2626' },
  { id: 'pro_3', nom: 'Diallo & Partners BET', metier: 'BET Structure', ville: 'Abidjan, Plateau', note: 4.7, verified: true, specialite: 'Études techniques & calcul', projets: 28, color: '#7C3AED' },
  { id: 'pro_4', nom: 'ElectriPro CI', metier: 'Electricite', ville: 'Abidjan, Yopougon', note: 4.3, verified: true, specialite: 'CFO/CFA & courants faibles', projets: 41, color: '#F59E0B' },
  { id: 'pro_5', nom: 'Hydrotech Plomberie', metier: 'Plomberie', ville: 'Abidjan, Riviera', note: 4.6, verified: true, specialite: 'Plomberie sanitaire & AEP', projets: 23, color: '#0891B2' },
  { id: 'pro_6', nom: 'ACI Design Intérieur', metier: 'Designer interieur', ville: 'Abidjan, Zone 4', note: 4.9, verified: true, specialite: 'Aménagement luxe & hôtellerie', projets: 19, color: '#BE185D' },
  { id: 'pro_7', nom: 'Traoré Menuiseries', metier: 'Menuiseries', ville: 'Abidjan, Abobo', note: 4.2, verified: false, specialite: 'Menuiseries alu & bois', projets: 55, color: '#92400E' },
  { id: 'pro_8', nom: 'CVC Afrique', metier: 'CVC', ville: 'Abidjan, Cocody', note: 4.4, verified: true, specialite: 'Climatisation & ventilation', projets: 31, color: '#6366F1' },
  { id: 'pro_9', nom: 'Géomètres Associés', metier: 'Geometre', ville: 'Abidjan, Plateau', note: 4.1, verified: true, specialite: 'Topographie & bornage', projets: 48, color: '#4338CA' },
  { id: 'pro_10', nom: 'VRD Solutions', metier: 'VRD', ville: 'Abidjan, Bingerville', note: 4.3, verified: true, specialite: 'Voirie & réseaux divers', projets: 36, color: '#16A34A' },
  { id: 'pro_11', nom: 'OPC Coordination', metier: 'OPC', ville: 'Abidjan, Cocody', note: 4.7, verified: true, specialite: 'Pilotage & coordination chantier', projets: 22, color: '#0F766E' },
  { id: 'pro_12', nom: 'Façades Premium CI', metier: 'Facades', ville: 'Abidjan, Marcory', note: 4.0, verified: false, specialite: 'Ravalement & murs-rideaux', projets: 15, color: '#64748B' },
]

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
 * @param {boolean} open
 * @param {Function} onClose
 * @param {string} initialSearch
 * @param {Array} extraPros — additional pros from store to merge with demo
 */
export default function ProDirectory({ open, onClose, initialSearch = '', extraPros = [] }) {
  const navigate = useNavigate()
  const [search, setSearch] = useState(initialSearch)
  const [metier, setMetier] = useState('all')

  if (!open) return null

  const allPros = (() => {
    const ids = new Set(extraPros.map(p => p.id))
    return [...extraPros, ...DEMO_PROS.filter(d => !ids.has(d.id))]
  })()

  const filtered = allPros.filter(p => {
    const metierOk = metier === 'all' || p.metier === metier
    const q = search.toLowerCase()
    return metierOk && (!q || (p.nom + p.metier + p.ville + (p.specialite || '')).toLowerCase().includes(q))
  })

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={onClose}>
      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 18, width: 680, maxWidth: '90vw', height: '80vh', maxHeight: 700, display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.3px' }}>Annuaire des professionnels</div>
            <div style={{ fontSize: 11.5, color: 'var(--t3)', marginTop: 2 }}>{allPros.length} professionnel{allPros.length > 1 ? 's' : ''} sur MEEREO</div>
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
            {METIERS_AO.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        {/* Cards */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ marginBottom: 12, opacity: .3 }}><Briefcase size={32}/></div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>Aucun résultat</div>
              <div style={{ fontSize: 12, color: 'var(--t3)' }}>Modifiez vos critères de recherche.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {filtered.map(p => {
                const mc = p.color || '#6B7280'
                return (
                  <div key={p.id} onClick={() => { onClose(); navigate('/profil') }} style={{ background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 14, padding: 16, cursor: 'pointer', transition: 'all .15s', display: 'flex', flexDirection: 'column', gap: 10 }} onMouseOver={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.08)'; e.currentTarget.style.transform = 'translateY(-2px)' }} onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}>
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
