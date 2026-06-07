import { useNavigate, useLocation } from 'react-router-dom'
import { useMeereo } from '../../hooks/useMeereoStore'
import './GlobalNav.css'

export default function GlobalNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { store, updateStore } = useMeereo()
  const user = store.user
  const userType = user?.type

  // SVG icons for consistency with sidebar
  const Icon = ({ d, size = 14 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
  const icons = {
    login: <Icon d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" />,
    cockpit: <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />,
    profil: <Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" />,
    client: <Icon d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />,
    fournisseur: <Icon d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />,
    logout: <Icon d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />,
  }

  // Filtrer la navigation selon le profil actif — un seul espace accessible
  const links = (() => {
    if (!user) return [{ label: icons.login, title: 'Connexion', path: '/onboarding' }]
    const base = []
    if (userType === 'pro') base.push({ label: icons.cockpit, title: 'Mon cockpit', path: '/cockpit' }, { label: icons.profil, title: 'Mon profil', path: '/profil' })
    if (userType === 'client') base.push({ label: icons.client, title: 'Mon espace', path: '/client' })
    if (userType === 'fournisseur') base.push({ label: icons.fournisseur, title: 'Mon espace', path: '/fournisseur' })
    base.push({ label: icons.logout, title: 'Changer de compte', path: '/onboarding', logout: true })
    return base
  })()

  return (
    <div className="global-nav-widget">
      <div className="global-nav-bar">
        {links.map(l => (
          <a
            key={l.path}
            className={`global-nav-link ${location.pathname.startsWith(l.path) ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); if (l.logout) updateStore(prev => ({ ...prev, user: null, _token: null })); navigate(l.path) }}
            title={l.title}
            href={l.path}
          >
            {l.label}
          </a>
        ))}
      </div>
    </div>
  )
}
