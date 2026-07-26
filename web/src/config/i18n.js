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

  // Common UI
  'common.loading': 'Chargement...',
  'common.search': 'Rechercher...',
  'common.cancel': 'Annuler',
  'common.confirm': 'Confirmer',
  'common.save': 'Enregistrer',
  'common.delete': 'Supprimer',
  'common.edit': 'Modifier',
  'common.add': 'Ajouter',
  'common.close': 'Fermer',
  'common.back': 'Retour',
  'common.next': 'Suivant',
  'common.previous': 'Précédent',
  'common.yes': 'Oui',
  'common.no': 'Non',
  'common.all': 'Tous',
  'common.none': 'Aucun',
  'common.send': 'Envoyer',
  'common.restore': 'Restaurer',
  'common.archive': 'Archiver',

  // Auth / Session
  'auth.sessionExpiredTitle': 'Session expirée',
  'auth.sessionExpiredMessage': 'Votre session a expiré pour des raisons de sécurité. Veuillez vous reconnecter pour continuer.',
  'auth.reconnect': 'Se reconnecter',
  'auth.login': 'Se connecter',
  'auth.loginSuccess': 'Connexion réussie !',
  'auth.emailRequired': 'Veuillez saisir votre email',
  'auth.passwordRequiredShort': 'Mot de passe requis',
  'auth.noAccount': 'Aucun compte trouvé avec cet email. Créez un espace ci-dessous.',
  'auth.loginError': 'Erreur de connexion',

  // Messages
  'messages.title': 'Vos messages',
  'messages.selectConversation': 'Sélectionnez une conversation ou démarrez-en une nouvelle',
  'messages.newConversation': 'Nouvelle conversation',
  'messages.typeMessage': 'Tapez un message…',
  'messages.markUnread': 'Conversation marquée non lue',
  'messages.archived': 'Conversation archivée',
  'messages.restored': 'Conversation restaurée',
  'messages.deleted': 'Conversation supprimée',
  'messages.quitGroup': 'Vous avez quitté le groupe',
  'messages.pendingAcceptance': "En attente d'acceptation par",
  'messages.cancelRequest': 'Annuler',
  'messages.simulateAccept': "Simuler l'acceptation",
  'messages.notOnPlatform': "n'est pas encore sur MEEREO",
  'messages.availableAfterSignup': "La messagerie sera disponible après son inscription.",
  'messages.waitingSignup': "En attente d'inscription",
  'messages.inviteSent': 'Invitation envoyée à',
  'messages.archivedBanner': 'Cette conversation est archivée',
  'messages.noMessages': 'Aucun message',
  'messages.photo': 'Photo',
  'messages.file': 'Fichier',
  'messages.proposal': 'Proposition commerciale',

  // Documents
  'documents.title': 'Documents',
  'documents.upload': 'Importer un document',
  'documents.download': 'Télécharger',
  'documents.preview': 'Aperçu',
  'documents.shared': 'Partagé',
  'documents.internal': 'Interne',
  'documents.noDocuments': 'Aucun document',
  'documents.addDocument': 'Ajouter un document',
  'documents.category': 'Catégorie',
  'documents.project': 'Projet',
  'documents.date': 'Date',
  'documents.size': 'Taille',

  // Projects
  'project.deleted': 'Supprimé',
  'project.preparation': 'En préparation',
  'project.active2': 'En cours',
  'project.suspended': 'Suspendu',
  'project.completed': 'Terminé',
  'project.closed': 'Clôturé',
  'project.archived': 'Archivé',

  // Tabs / Filters
  'filter.all': 'Tous',
  'filter.direct': 'Direct',
  'filter.group': 'Groupes',
  'filter.project': 'Projets',
  'filter.requests': 'Demandes',
  'filter.archives': 'Archives',

  // Toasts
  'toast.saved': 'Enregistré',
  'toast.deleted': 'Supprimé',
  'toast.error': 'Une erreur est survenue',
  'toast.copied': 'Copié dans le presse-papier',

  // Upload
  'upload.fileTooLarge': 'Le fichier dépasse la taille maximale autorisée',
  'upload.maxSize': 'Taille maximale :',
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
  'nav.markets': 'Markets',
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

  // Common UI
  'common.loading': 'Loading...',
  'common.search': 'Search...',
  'common.cancel': 'Cancel',
  'common.confirm': 'Confirm',
  'common.save': 'Save',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.add': 'Add',
  'common.close': 'Close',
  'common.back': 'Back',
  'common.next': 'Next',
  'common.previous': 'Previous',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.all': 'All',
  'common.none': 'None',
  'common.send': 'Send',
  'common.restore': 'Restore',
  'common.archive': 'Archive',

  // Auth / Session
  'auth.sessionExpiredTitle': 'Session expired',
  'auth.sessionExpiredMessage': 'Your session has expired for security reasons. Please log in again to continue.',
  'auth.reconnect': 'Log in again',
  'auth.login': 'Log in',
  'auth.loginSuccess': 'Login successful!',
  'auth.emailRequired': 'Please enter your email',
  'auth.passwordRequiredShort': 'Password required',
  'auth.noAccount': 'No account found with this email. Create one below.',
  'auth.loginError': 'Login error',

  // Messages
  'messages.title': 'Your messages',
  'messages.selectConversation': 'Select a conversation or start a new one',
  'messages.newConversation': 'New conversation',
  'messages.typeMessage': 'Type a message…',
  'messages.markUnread': 'Conversation marked as unread',
  'messages.archived': 'Conversation archived',
  'messages.restored': 'Conversation restored',
  'messages.deleted': 'Conversation deleted',
  'messages.quitGroup': 'You have left the group',
  'messages.pendingAcceptance': 'Pending acceptance by',
  'messages.cancelRequest': 'Cancel',
  'messages.simulateAccept': 'Simulate acceptance',
  'messages.notOnPlatform': 'is not yet on MEEREO',
  'messages.availableAfterSignup': 'Messaging will be available after they sign up.',
  'messages.waitingSignup': 'Awaiting sign-up',
  'messages.inviteSent': 'Invitation sent to',
  'messages.archivedBanner': 'This conversation is archived',
  'messages.noMessages': 'No messages',
  'messages.photo': 'Photo',
  'messages.file': 'File',
  'messages.proposal': 'Commercial proposal',

  // Documents
  'documents.title': 'Documents',
  'documents.upload': 'Upload a document',
  'documents.download': 'Download',
  'documents.preview': 'Preview',
  'documents.shared': 'Shared',
  'documents.internal': 'Internal',
  'documents.noDocuments': 'No documents',
  'documents.addDocument': 'Add a document',
  'documents.category': 'Category',
  'documents.project': 'Project',
  'documents.date': 'Date',
  'documents.size': 'Size',

  // Projects
  'project.deleted': 'Deleted',
  'project.preparation': 'In preparation',
  'project.active2': 'In progress',
  'project.suspended': 'Suspended',
  'project.completed': 'Completed',
  'project.closed': 'Closed',
  'project.archived': 'Archived',

  // Tabs / Filters
  'filter.all': 'All',
  'filter.direct': 'Direct',
  'filter.group': 'Groups',
  'filter.project': 'Projects',
  'filter.requests': 'Requests',
  'filter.archives': 'Archives',

  // Toasts
  'toast.saved': 'Saved',
  'toast.deleted': 'Deleted',
  'toast.error': 'An error occurred',
  'toast.copied': 'Copied to clipboard',

  // Upload
  'upload.fileTooLarge': 'The file exceeds the maximum allowed size',
  'upload.maxSize': 'Maximum size:',
}

// ─── Init ────────────────────────────────────────────────────
i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    en: { translation: en },
  },
  lng: localStorage.getItem('meereo_lang') || (navigator.language?.startsWith('en') ? 'en' : 'fr'),
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
})

export default i18n

// Helper pour changer de langue et persister le choix
export function setLanguage(lang) {
  i18n.changeLanguage(lang)
  localStorage.setItem('meereo_lang', lang)
}
