import { Routes, Route, Navigate } from 'react-router-dom'
import CockpitApp from './pages/cockpit/CockpitApp'
import OnboardingApp from './pages/onboarding/OnboardingApp'
import FournisseurApp from './pages/fournisseur/FournisseurApp'
import ClientApp from './pages/client/ClientApp'
import ProfilApp from './pages/profil/ProfilApp'
import LandingPage from './pages/landing/LandingPage'
import ConditionsPage from './pages/legal/ConditionsPage'
import ConfidentialitePage from './pages/legal/ConfidentialitePage'
import ValidationPage from './pages/legal/ValidationPage'
import GlobalNav from './components/shared/GlobalNav'
import Toast from './components/shared/Toast'
import NotifPanel from './components/shared/NotifPanel'
import { useMeereo } from './hooks/useMeereoStore'

// Hydration gate: wait for API session check before routing
function HydrationGate({ children }) {
  const { store } = useMeereo()
  if (!store._hydrated && store._token) {
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
  const user = store.user
  // Token présent mais user pas encore chargé — hydration en cours, attendre
  if (!user && store._token) return <LoadingSpinner />
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
  const user = store.user
  // Token présent mais user pas encore chargé — attendre l'hydration avant de rediriger
  if (!user && store._token) return <LoadingSpinner />
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
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding/*" element={<OnboardingGuard><OnboardingApp /></OnboardingGuard>} />
        <Route path="/cockpit/*" element={<RoleGuard allowedRole="pro"><CockpitApp /></RoleGuard>} />
        <Route path="/fournisseur/*" element={<RoleGuard allowedRole="fournisseur"><FournisseurApp /></RoleGuard>} />
        <Route path="/client/*" element={<RoleGuard allowedRole="client"><ClientApp /></RoleGuard>} />
        {/* Route publique — /pro?uuid=XXXX — profil public d'un professionnel */}
        <Route path="/pro" element={<ProfilApp />} />
        {/* Alias rétrocompat /profil → redirige vers /pro avec l'uuid du user connecté si pro */}
        <Route path="/profil/*" element={<ProfilApp />} />
        <Route path="/conditions" element={<ConditionsPage />} />
        <Route path="/confidentialite" element={<ConfidentialitePage />} />
        <Route path="/validation" element={<ValidationPage />} />
      </Routes>
      <GlobalNav />
      <Toast />
      <NotifPanel />
    </HydrationGate>
  )
}
