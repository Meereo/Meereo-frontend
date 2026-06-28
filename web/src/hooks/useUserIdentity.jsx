import { useMeereo } from './useMeereoStore'

// ══════════════════════════════════════════════════════════════
//  MEEREO — Source unique de vérité pour l'identité utilisateur
//  Utilisé par : UserMenu, Sidebar, ClientApp, FournisseurApp
// ══════════════════════════════════════════════════════════════

const ROLE_LABELS = {
  pro: 'Professionnel',
  client: 'Client',
  fournisseur: 'Fournisseur',
}

function getInitials(str) {
  if (!str || !str.trim()) return null
  return str.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || null
}

export default function useUserIdentity() {
  const { store } = useMeereo()
  const ob = store.onboardingData || {}
  const user = store.user

  if (!user) {
    return {
      displayName: null,
      firstName: null,
      initials: null,
      email: null,
      phone: null,
      photo: null,
      company: null,
      city: null,
      role: null,
      roleLabel: null,
      userType: null,
      hasIdentity: false,
    }
  }

  const userType = user.type // 'pro' | 'client' | 'fournisseur'

  // Nom complet — priorité onboardingData > user
  const firstName = ob.prenom || null
  const lastName = ob.nom || null
  const company = ob.entreprise || user.company || null

  // displayName : prenom+nom pour client, entreprise pour pro/fournisseur
  let displayName = null
  if (userType === 'client') {
    if (firstName) displayName = `${firstName} ${lastName || ''}`.trim()
    else if (user.name) displayName = user.name
  } else {
    // pro ou fournisseur : entreprise d'abord
    if (company) displayName = company
    else if (firstName) displayName = `${firstName} ${lastName || ''}`.trim()
    else if (user.name) displayName = user.name
  }

  const initials = getInitials(displayName)
  const email = ob.email || user.email || null
  const phone = ob.tel || user.phone || null
  // Pro/fournisseur: company logo takes priority over personal photo
  // Client: personal photo takes priority
  const photo = (userType === 'pro' || userType === 'fournisseur')
    ? (ob.logoFileUrl || ob.photoUrl || user.avatar || null)
    : (ob.photoUrl || ob.logoFileUrl || user.avatar || null)
  const city = ob.ville || null
  const role = ob.secteurs?.[0] || null
  const roleLabel = ROLE_LABELS[userType] || null

  return {
    displayName,
    firstName,
    initials,
    email,
    phone,
    photo,
    company,
    city,
    role,
    roleLabel,
    userType,
    hasIdentity: !!displayName,
  }
}

export { ROLE_LABELS, getInitials }
