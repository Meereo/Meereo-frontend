// ══════════════════════════════════════════════════════════════
//  SYS-04 — Infrastructure i18n (Français + Anglais)
//  Architecture : react-i18next, fichiers de traduction embarqués,
//  détection automatique par navigateur, préférence utilisateur.
// ══════════════════════════════════════════════════════════════
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// ─── Traductions FR (référence) ──────────────────────────────
const fr = {
  // Navigation
  'nav.dashboard': 'Tableau de bord',
  'nav.projects': 'Projets',
  'nav.progress': 'Avancement',
  'nav.tasks': 'Tâches',
  'nav.budget': 'Budget',
  'nav.messages': 'Messages',
  'nav.documents': 'Documents',
  'nav.contractors': 'Intervenants',
  'nav.clients': 'Clients',
  'nav.tenders': "Appels d'offres",
  'nav.offers': 'Offres',
  'nav.markets': 'Marchés',
  'nav.marketplace': 'Marketplace',
  'nav.orders': 'Commandes',
  'nav.pageBuilder': 'Modifier ma page pro',
  'nav.settings': 'Paramètres',
  'nav.viewPublicPage': 'Voir ma page publique',
  'nav.logout': 'Se déconnecter',

  // Auth
  'auth.sessionExpired': 'Votre session a expiré — veuillez vous reconnecter',
  'auth.passwordRequired': 'Mot de passe requis pour confirmer la suppression',
  'auth.incorrectPassword': 'Mot de passe incorrect',

  // Settings
  'settings.profile': 'Profil',
  'settings.preferences': 'Préférences',
  'settings.currency': 'Devise & Région',
  'settings.security': 'Sécurité',
  'settings.team': 'Équipe',
  'settings.subscription': 'Abonnement',
  'settings.data': 'Données',

  // Projects
  'project.active': 'Projet actif',
  'project.noActive': 'Aucun projet actif',
  'project.createNew': '+ Créer un projet',
  'project.validateSection': 'Valider cette section',
  'project.validateProject': 'Valider le projet',
  'project.requestClosure': 'Demander la clôture',
  'project.allComplete': 'Toutes les tâches sont terminées !',

  // Marketplace
  'marketplace.onQuote': 'Sur devis',
  'marketplace.stockInsufficient': 'Stock insuffisant',
  'marketplace.freeQuota': '5 produits gratuits',

  // Reviews
  'reviews.noReviews': 'Aucun avis pour le moment',
  'reviews.systemGenerated': 'Les avis sont générés automatiquement à la fin de chaque mission.',
  'reviews.verified': 'Professionnel vérifié MEEREO',

  // Offers
  'offers.engagementNotice': 'En soumettant cette offre, vous vous engagez sur les termes proposés. Si le client accepte votre offre, celle-ci devient un marché signé.',
  'offers.submit': "Soumettre l'offre",

  // KAi
  'kai.standard': 'KAi Standard',
  'kai.pro': 'KAi Pro',
  'kai.upgradeTitle': 'Passer à KAi Pro',
}

// ─── Traductions EN ──────────────────────────────────────────
const en = {
  // Navigation
  'nav.dashboard': 'Dashboard',
  'nav.projects': 'Projects',
  'nav.progress': 'Progress',
  'nav.tasks': 'Tasks',
  'nav.budget': 'Budget',
  'nav.messages': 'Messages',
  'nav.documents': 'Documents',
  'nav.contractors': 'Contractors',
  'nav.clients': 'Clients',
  'nav.tenders': 'Tenders',
  'nav.offers': 'Offers',
  'nav.markets': 'Contracts',
  'nav.marketplace': 'Marketplace',
  'nav.orders': 'Orders',
  'nav.pageBuilder': 'Edit my page',
  'nav.settings': 'Settings',
  'nav.viewPublicPage': 'View my public page',
  'nav.logout': 'Log out',

  // Auth
  'auth.sessionExpired': 'Your session has expired — please log in again',
  'auth.passwordRequired': 'Password required to confirm deletion',
  'auth.incorrectPassword': 'Incorrect password',

  // Settings
  'settings.profile': 'Profile',
  'settings.preferences': 'Preferences',
  'settings.currency': 'Currency & Region',
  'settings.security': 'Security',
  'settings.team': 'Team',
  'settings.subscription': 'Subscription',
  'settings.data': 'Data',

  // Projects
  'project.active': 'Active project',
  'project.noActive': 'No active project',
  'project.createNew': '+ Create a project',
  'project.validateSection': 'Validate this section',
  'project.validateProject': 'Validate the project',
  'project.requestClosure': 'Request closure',
  'project.allComplete': 'All tasks are completed!',

  // Marketplace
  'marketplace.onQuote': 'On quote',
  'marketplace.stockInsufficient': 'Insufficient stock',
  'marketplace.freeQuota': '5 free products',

  // Reviews
  'reviews.noReviews': 'No reviews yet',
  'reviews.systemGenerated': 'Reviews are automatically generated at the end of each completed mission.',
  'reviews.verified': 'Verified by MEEREO',

  // Offers
  'offers.engagementNotice': 'By submitting this offer, you commit to the proposed terms. If the client accepts your offer, it becomes a signed contract.',
  'offers.submit': 'Submit offer',

  // KAi
  'kai.standard': 'KAi Standard',
  'kai.pro': 'KAi Pro',
  'kai.upgradeTitle': 'Upgrade to KAi Pro',
}

// ─── Init ────────────────────────────────────────────────────
i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: localStorage.getItem('meereo_lang') || navigator.language?.startsWith('en') ? 'en' : 'fr',
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
})

export default i18n

// Helper pour changer de langue et persister le choix
export function setLanguage(lang) {
  i18n.changeLanguage(lang)
  localStorage.setItem('meereo_lang', lang)
}
