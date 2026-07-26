import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Cockpit from './pages/cockpit/Cockpit'
import Onboarding from './pages/Onboarding'
import Supplier from './pages/supplier/Supplier'
import Client from './pages/client/Client'
import Profile from './pages/cockpit/profile/Profile'
import Landing from './pages/Landing'
import Conditions from './pages/Conditions'
import Privacy from './pages/Privacy'
import Validation from './pages/Validation'
import ResetPassword from './pages/ResetPassword'
import GlobalNav from './components/shared/GlobalNav'
import Toast from './components/shared/Toast'
import NotifPanel from './components/shared/NotifPanel'
import { useMeereo } from './hooks/useMeereoStore'
import { setSessionExpiredCallback } from './services/api/client'

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

// NAV-06: Modal « Session expirée » — affiché à la place des messages techniques bruts
function SessionExpiredModal({ visible, onReconnect }) {
  const { t } = useTranslation()
  if (!visible) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '32px 28px', maxWidth: 380, width: '90%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.2)' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, margin: '0 0 8px', color: '#111' }}>{t('auth.sessionExpiredTitle')}</h3>
        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, margin: '0 0 24px' }}>
          {t('auth.sessionExpiredMessage')}
        </p>
        <button
          onClick={onReconnect}
          style={{ width: '100%', padding: '10px 20px', fontSize: 14, fontWeight: 600, color: '#fff', background: '#111', border: 'none', borderRadius: 10, cursor: 'pointer' }}
        >
          {t('auth.reconnect')}
        </button>
      </div>
    </div>
  )
}

// NAV-01: Logged-in users should never see the landing page — redirect to their workspace
function LandingGuard({ children }) {
  const { store } = useMeereo()
  const user = store.user || store._cachedUser
  if (store._checking) return null
  if (user) {
    const dest = user.type === 'pro' ? '/cockpit' : user.type === 'client' ? '/client' : user.type === 'fournisseur' ? '/fournisseur' : '/cockpit'
    return <Navigate to={dest} replace />
  }
  return children
}

export default function App() {
  const [sessionExpired, setSessionExpired] = useState(false)

  // NAV-06: enregistrer le callback qui sera appelé par client.js sur un 401
  useEffect(() => {
    setSessionExpiredCallback(() => setSessionExpired(true))
    return () => setSessionExpiredCallback(null)
  }, [])

  const handleReconnect = useCallback(() => {
    setSessionExpired(false)
    window.location.href = '/onboarding'
  }, [])

  return (
    <HydrationGate>
      <Routes>
        <Route path="/" element={<LandingGuard><Landing /></LandingGuard>} />
        <Route path="/onboarding/*" element={<OnboardingGuard><Onboarding /></OnboardingGuard>} />
        <Route path="/cockpit/*" element={<RoleGuard allowedRole="pro"><Cockpit /></RoleGuard>} />
        <Route path="/fournisseur/*" element={<RoleGuard allowedRole="fournisseur"><Supplier /></RoleGuard>} />
        <Route path="/client/*" element={<RoleGuard allowedRole="client"><Client /></RoleGuard>} />
        {/* Route publique — /pro/:slug — profil public d'un professionnel */}
        <Route path="/pro/:slug" element={<Profile />} />
        {/* /pro sans slug → redirige le pro connecté vers son propre profil */}
        <Route path="/pro" element={<Profile />} />
        {/* Alias rétrocompat */}
        <Route path="/profil/*" element={<Profile />} />
        <Route path="/conditions" element={<Conditions />} />
        <Route path="/confidentialite" element={<Privacy />} />
        <Route path="/validation" element={<Validation />} />
        {/* INS-07 — cible du lien de réinitialisation envoyé par e-mail */}
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
      <GlobalNav />
      <Toast />
      <NotifPanel />
      {/* NAV-06: modal session expirée — jamais de message technique brut */}
      <SessionExpiredModal visible={sessionExpired} onReconnect={handleReconnect} />
    </HydrationGate>
  )
}
