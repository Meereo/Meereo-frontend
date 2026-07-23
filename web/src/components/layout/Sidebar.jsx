import { useNavigate } from 'react-router-dom'
import { FLAG_SHOW_FINANCE, FLAG_SHOW_AO, FLAG_SHOW_MARKETPLACE, FLAG_SHOW_MESSAGES } from '../../config/featureFlags'
import { useMeereo } from '../../hooks/useMeereoStore'
import { logoShapeStyle } from '../../utils/logoShape'
import { useMergedData } from '../../hooks/useMergedData'
import { useDevise } from '../../hooks/useDevise'
import MeereoLogo from '../shared/MeereoLogo'
import KaiQuota from '../shared/KaiQuota'
import './Sidebar.css'

const NAV_GROUPS = [
  {
    label: 'Core',
    items: [
      { id: 'dashboard', label: 'Tableau de bord', icon: 'grid' },
      { id: 'projets', label: 'Projets', icon: 'folder', countKey: 'projects' },
    ]
  },
  {
    label: 'Opération',
    items: [
      { id: 'chantier',      label: 'Avancement',       icon: 'hardhat' },
      { id: 'taches-board',  label: 'Tâches',            icon: 'kanban' },
      { id: 'budget',        label: 'Budget',            icon: 'trending-up', flag: FLAG_SHOW_FINANCE },
    ]
  },
  {
    label: 'Collaboration',
    items: [
      { id: 'messages', label: 'Messages', icon: 'message', countKey: 'messages', badgeColor: 'red', flag: FLAG_SHOW_MESSAGES },
      { id: 'documents', label: 'Documents', icon: 'archive' },
      { id: 'intervenants', label: 'Intervenants', icon: 'user-check' },
      { id: 'clients', label: 'Clients', icon: 'users' },
    ]
  },
  {
    label: 'Business',
    items: [
      { id: 'bourse', label: 'Appels d\'offres', icon: 'briefcase', flag: FLAG_SHOW_AO, countKey: 'newAos', badgeColor: 'blue' },
      { id: 'offres', label: 'Offres', icon: 'inbox', countKey: 'offers', badgeColor: 'orange', flag: FLAG_SHOW_AO },
      { id: 'marches', label: 'Marchés', icon: 'handshake', flag: FLAG_SHOW_AO },
    ]
  },
  {
    label: 'Achats',
    items: [
      { id: 'marketplace', label: 'Marketplace', icon: 'shopping-bag', flag: FLAG_SHOW_MARKETPLACE },
      { id: 'commandes', label: 'Commandes', icon: 'package', flag: FLAG_SHOW_MARKETPLACE },
    ]
  },
  {
    label: 'Système',
    items: [
      { id: 'page-builder', label: 'Modifier ma page pro', icon: 'layers', premium: true },
      { id: 'parametres', label: 'Paramètres', icon: 'settings' },
    ]
  }
]

// Semantic icon colors — subtle tints by category
const ICON_TINTS = {
  // Core
  'grid': '#191c1d', 'folder': '#191c1d',
  // Opération
  'target': '#9333EA', 'box': '#0891B2', 'hardhat': '#EA580C', 'kanban': '#2563EB', 'trending-up': '#16A34A',
  // Collaboration
  'message': '#7C3AED', 'archive': '#0891B2', 'user-check': '#2563EB', 'users': '#2563EB',
  // Business
  'briefcase': '#DC2626', 'inbox': '#F59E0B', 'handshake': '#16A34A',
  // Achats
  'shopping-bag': '#0891B2', 'package': '#EA580C',
  // Système
  'layers': '#2563EB',
  'settings': '#6B7280',
}

function NavIcon({ name }) {
  const tint = ICON_TINTS[name] || '#6B7280'
  const icons = {
    'grid': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    'folder': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>,
    'target': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
    'box': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    'hardhat': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 18h20M4 18v-4a8 8 0 0116 0v4M12 2v4"/></svg>,
    'calendar': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    'file-text': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    'archive': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
    'message': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
    'users': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    'user-check': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>,
    'clock': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    'search': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    'briefcase': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
    'inbox': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>,
    'handshake': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.42 4.58a5.4 5.4 0 00-7.65 0l-.77.78-.77-.78a5.4 5.4 0 00-7.65 7.65l.78.77L12 20.65l7.65-7.65.77-.78a5.4 5.4 0 000-7.64z"/></svg>,
    'trending-up': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
    'kanban': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="5" height="14" rx="1"/><rect x="10" y="3" width="5" height="9" rx="1"/><rect x="17" y="3" width="5" height="11" rx="1"/></svg>,
    'credit-card': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
    'shopping-bag': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
    'truck': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    'package': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
    'link': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
    'layers': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
    'settings': <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
  }
  const svg = icons[name]
  if (!svg) return <span style={{ width: 14, height: 14, display: 'inline-block' }}>•</span>
  return (
    <span className="ni-ico" style={{ color: tint }}>
      {svg}
    </span>
  )
}

export default function Sidebar({ activePage, onNavigate, identity, isOpen, onClose }) {
  const { store } = useMeereo()
  const { format: fmtMoney } = useDevise()
  const nav = useNavigate()

  // Dynamic badge counts — projets de l'utilisateur connecté uniquement
  const userId = store.user?.id
  const memberProjectIds = new Set((store.projectMembers || []).filter(m => m.userId === userId).map(m => m.projectId))
  const projCount = (store.projects || []).filter(p => p.status !== 'archived' && p.status !== 'stopped' && p.status !== 'deleted' && (p.ownerId === userId || p.clientId === userId || memberProjectIds.has(p.id))).length
  const { badgeCounts: merged } = useMergedData()
  const badgeCounts = { projects: projCount, offers: merged.offresEnAttente, messages: merged.messagesNonLus, newAos: merged.aoOuverts }

  // Active project — filtré par utilisateur connecté
  const userProjects = (store.projects || []).filter(p =>
    p.status !== 'archived' && p.status !== 'stopped' && p.status !== 'deleted' &&
    (p.ownerId === userId || p.clientId === userId || memberProjectIds.has(p.id))
  )
  const activeProj = userProjects[0] || null

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar${isOpen ? ' sidebar-open' : ''}`}>
      <div className="sidebar-logo-wrap">
        <MeereoLogo size={28} />
        <div>
          <div className="sidebar-brand">MEEREO</div>
          <div className="sidebar-tagline">Professionnel</div>
        </div>
        <button className="sidebar-close" onClick={onClose} aria-label="Fermer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Project card — dynamic from store */}
      {activeProj ? (
        <div className="sidebar-project-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate('projets')}>
          <div className="sidebar-project-label">Projet actif</div>
          <div className="sidebar-project-name">{activeProj.nom || activeProj.name || 'Projet'}</div>
          <div className="sidebar-project-meta">{activeProj.adresse || activeProj.localisation || activeProj.address || ''}{activeProj.budget ? ' · ' + fmtMoney(Number(String(activeProj.budget).replace(/\D/g, '') || 0)) : ''}</div>
          <div className="sidebar-project-bar">
            <div className="sidebar-project-bar-fill" style={{ width: (activeProj.avancement || activeProj.progress || 0) + '%', background: activeProj.color || undefined }}></div>
          </div>
        </div>
      ) : (
        <div className="sidebar-project-card" style={{ cursor: 'pointer', textAlign: 'center' }} onClick={() => onNavigate('projets')}>
          <div style={{ fontSize: 10, color: 'var(--t4)', marginBottom: 4 }}>Aucun projet actif</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--tx)' }}>+ Créer un projet</div>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-nav">
        {NAV_GROUPS.map(group => {
          const visibleItems = group.items.filter(item => item.flag !== false)
          if (visibleItems.length === 0) return null
          return (
          <div key={group.label} className="sidebar-group">
            <div className="sidebar-group-label">{group.label}</div>
            {visibleItems.map(item => {
              const count = item.countKey ? badgeCounts[item.countKey] : 0
              return (
              <button
                key={item.id}
                className={`ni ${activePage === item.id ? 'active' : ''}${item.premium ? ' ni-premium' : ''}`}
                onClick={() => { onNavigate(item.id); onClose?.() }}
              >
                <NavIcon name={item.icon} />
                <span>{item.label}</span>
                {count > 0 ? (
                  <span className={`ni-badge ${item.badgeColor ? 'nb-' + item.badgeColor : ''}`}>
                    {count}
                  </span>
                ) : null}
              </button>)
            })}
          </div>
        )})}
      </nav>

      {/* KAI Quota */}
      <div style={{ padding: '0 10px 8px' }}>
        <KaiQuota role="pro" />
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          {(() => {
            const ob = store.onboardingData || {}
            const shape = logoShapeStyle(ob.logoShape)
            const fallback = <div className="sidebar-avatar" style={{ ...shape, background: ob.logoColor || undefined }}>{identity.initials || ''}</div>
            if (!identity.photo) return fallback
            return (
              <>
                <img
                  src={identity.photo} alt=""
                  style={{ width: 32, height: 32, objectFit: 'cover', flexShrink: 0, ...shape }}
                  onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex' }}
                />
                <div className="sidebar-avatar" style={{ ...shape, background: ob.logoColor || undefined, display: 'none' }}>{identity.initials || ''}</div>
              </>
            )
          })()}
          <div>
            {identity.displayName && <div className="sidebar-user-name">{identity.displayName}</div>}
            {(identity.company || identity.role || identity.roleLabel) && <div className="sidebar-user-role">{identity.company || identity.role || identity.roleLabel}</div>}
          </div>
        </div>
      </div>
      </aside>
    </>
  )
}
