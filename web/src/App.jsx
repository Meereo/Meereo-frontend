import { Routes, Route, Navigate } from 'react-router-dom'
import Cockpit from './pages/cockpit/Cockpit'
import Onboarding from './pages/Onboarding'
import Supplier from './pages/supplier/Supplier'
import Client from './pages/client/Client'
import Profile from './pages/cockpit/profile/Profile'
import Landing from './pages/Landing'
import Conditions from './pages/Conditions'
import Privacy from './pages/Privacy'
import Validation from './pages/Validation'
import GlobalNav from './components/shared/GlobalNav'
import Toast from './components/shared/Toast'
import NotifPanel from './components/shared/NotifPanel'
import { useMeereo } from './hooks/useMeereoStore'

// Hydration gate: show spinner only when backend check is in progress AND no cached session hint
function HydrationGate({ children }) {
  const { store } = useMeereo()
  // If we have a cached user from last session, render immediately (no flash)
  // _checking becomes false once /auth/me responds
  if (store._checking && !store._cachedUser) {
    return <LoadingSpinner />
  }
  return children
}

const LoadingSpinner = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 28, height: 28, border: '3px solid rgba(0,0,0,.08)', borderTopColor: '#111', borderRadius: '50%', animation: 'spin .6s linear infinite', margin: '0 auto 16px' }} />
      <div style={{ fontSize: 13, color: '#999', fontWeight: 500 }}>Chargement...</div>
    </div>
  </div>
)

// Route guard: redirige vers l'espace correct selon le role actif
function RoleGuard({ allowedRole, children }) {
  const { store } = useMeereo()
  // Use confirmed user first, fall back to cached hint while backend check is in progress
  const user = store.user || store._cachedUser
  // Backend check still running — don't redirect yet, wait silently
  if (store._checking) return null
  if (!user) return <Navigate to="/onboarding" replace />
  if (user.type !== allowedRole) {
    const dest = user.type === 'pro' ? '/cockpit' : user.type === 'client' ? '/client' : user.type === 'fournisseur' ? '/fournisseur' : '/onboarding'
    return <Navigate to={dest} replace />
  }
  return children
}

// Onboarding guard: si l'utilisateur est déjà connecté, redirige vers son espace
function OnboardingGuard({ children }) {
  const { store } = useMeereo()
  const user = store.user || store._cachedUser
  // Backend check still running — don't redirect yet
  if (store._checking) return null
  if (user) {
    const dest = user.type === 'pro' ? '/cockpit' : user.type === 'client' ? '/client' : user.type === 'fournisseur' ? '/fournisseur' : '/cockpit'
    return <Navigate to={dest} replace />
  }
  return children
}

export default function App() {
  return (
    <HydrationGate>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/onboarding/*" element={<OnboardingGuard><Onboarding /></OnboardingGuard>} />
        <Route path="/cockpit/*" element={<RoleGuard allowedRole="pro"><Cockpit /></RoleGuard>} />
        <Route path="/fournisseur/*" element={<RoleGuard allowedRole="fournisseur"><Supplier /></RoleGuard>} />
        <Route path="/client/*" element={<RoleGuard allowedRole="client"><Client /></RoleGuard>} />
        {/* Route publique — /pro?uuid=XXXX — profil public d'un professionnel */}
        <Route path="/pro" element={<Profile />} />
        {/* Alias rétrocompat /profil → redirige vers /pro avec l'uuid du user connecté si pro */}
        <Route path="/profil/*" element={<Profile />} />
        <Route path="/conditions" element={<Conditions />} />
        <Route path="/confidentialite" element={<Privacy />} />
        <Route path="/validation" element={<Validation />} />
      </Routes>
      <GlobalNav />
      <Toast />
      <NotifPanel />
    </HydrationGate>
  )
}
