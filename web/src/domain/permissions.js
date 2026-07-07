// ═══════════════════════════════════════════════════════
//  MEEREO — Permissions & Visibilité
//  Règles de ce que le client peut voir/faire
// ═══════════════════════════════════════════════════════

// ── Rôles ──
export const ROLES = {
  PRO_ADMIN: 'pro_admin',       // Le pro qui gère le projet
  PRO_MEMBER: 'pro_member',     // Membre de l'équipe pro
  CLIENT: 'client',             // Le client/MOA
  ARCHITECTE: 'architecte',     // Architecte (mandataire / conception)
  BET: 'bet',                   // Bureau d'études techniques (ingénierie)
  ENTREPRISE: 'entreprise',     // Entreprise d'exécution (BTP)
  SUPPLIER: 'fournisseur',      // Fournisseur marketplace
  ADMIN: 'admin',               // Admin plateforme
}

// ── Mapping type utilisateur → rôles projet possibles ──
export const USER_TYPE_TO_ROLES = {
  pro: [ROLES.PRO_ADMIN, ROLES.PRO_MEMBER, ROLES.ARCHITECTE, ROLES.BET, ROLES.ENTREPRISE],
  client: [ROLES.CLIENT],
  fournisseur: [ROLES.SUPPLIER],
}

// ── Qui peut faire quoi (matrice d'actions) ──
export const ACTION_PERMISSIONS = {
  // AO
  create_ao:     [ROLES.CLIENT, ROLES.PRO_ADMIN, ROLES.ARCHITECTE],
  respond_ao:    [ROLES.ENTREPRISE, ROLES.BET, ROLES.SUPPLIER],
  accept_offer:  [ROLES.CLIENT, ROLES.ARCHITECTE],  // Architecte si mandaté
  delete_ao:     [ROLES.CLIENT, ROLES.PRO_ADMIN, ROLES.ARCHITECTE],  // owner only

  // Marché
  create_market: [],  // Auto-created on offer acceptance
  sign_market:   [ROLES.CLIENT, ROLES.ARCHITECTE],

  // Paiements
  initiate_payment:  [ROLES.CLIENT],
  request_payment:   [ROLES.PRO_ADMIN, ROLES.ARCHITECTE, ROLES.ENTREPRISE, ROLES.BET],
  approve_payment:   [ROLES.CLIENT, ROLES.ARCHITECTE],

  // Chantier
  assign_task:     [ROLES.PRO_ADMIN, ROLES.ARCHITECTE],
  advance_task:    [ROLES.PRO_ADMIN, ROLES.ARCHITECTE, ROLES.ENTREPRISE, ROLES.BET],
  validate_task:   [ROLES.CLIENT, ROLES.ARCHITECTE],

  // Documents
  upload_document:   [ROLES.PRO_ADMIN, ROLES.PRO_MEMBER, ROLES.ARCHITECTE, ROLES.BET, ROLES.ENTREPRISE],
  share_with_client: [ROLES.PRO_ADMIN, ROLES.ARCHITECTE],

  // Décisions
  create_decision:   [ROLES.PRO_ADMIN, ROLES.ARCHITECTE],
  respond_decision:  [ROLES.CLIENT],

  // Missions
  create_mission:   [ROLES.PRO_ADMIN, ROLES.ARCHITECTE, ROLES.CLIENT],
  assign_mission:   [ROLES.PRO_ADMIN, ROLES.ARCHITECTE],
  advance_mission:  [ROLES.PRO_ADMIN, ROLES.ARCHITECTE, ROLES.ENTREPRISE, ROLES.BET],
  validate_mission: [ROLES.CLIENT, ROLES.ARCHITECTE],
  archive_mission:  [ROLES.PRO_ADMIN, ROLES.CLIENT],

  // Projet
  create_project:  [ROLES.PRO_ADMIN, ROLES.CLIENT, ROLES.ARCHITECTE],
  edit_project:    [ROLES.PRO_ADMIN, ROLES.ARCHITECTE],
  archive_project: [ROLES.PRO_ADMIN, ROLES.CLIENT],
  manage_team:     [ROLES.PRO_ADMIN, ROLES.ARCHITECTE],
}

/**
 * Vérifie si un rôle est autorisé à effectuer une action
 * @param {string} role - Rôle de l'utilisateur dans le projet
 * @param {string} action - Clé d'action (ex: 'create_ao', 'accept_offer')
 * @returns {boolean}
 */
export function isAllowed(role, action) {
  const allowed = ACTION_PERMISSIONS[action]
  if (!allowed) return false
  return allowed.includes(role)
}

/**
 * Détermine le rôle projet d'un utilisateur dans un projet donné
 * @param {string} userId
 * @param {string} projectId
 * @param {Array} projectMembers - store.projectMembers
 * @param {object} user - store.user (fallback)
 * @returns {string|null} - Le rôle dans le projet ou null
 */
export function getProjectRole(userId, projectId, projectMembers, user) {
  if (!userId || !projectId) return user?.type === 'client' ? ROLES.CLIENT : null
  const membership = (projectMembers || []).find(
    m => m.userId === userId && m.projectId === projectId
  )
  if (membership) return membership.role
  // Fallback: user type mapping
  if (user?.type === 'client') return ROLES.CLIENT
  if (user?.type === 'fournisseur') return ROLES.SUPPLIER
  return null
}

/**
 * Retourne les projets auxquels un utilisateur a accès
 * @param {string} userId
 * @param {Array} projectMembers - store.projectMembers
 * @param {Array} projects - store.projects
 * @returns {Array} - Projets accessibles
 */
export function getAccessibleProjects(userId, projectMembers, projects) {
  const memberProjectIds = new Set(
    (projectMembers || []).filter(m => m.userId === userId).map(m => m.projectId)
  )
  return (projects || []).filter(p =>
    p.ownerId === userId || p.clientId === userId || memberProjectIds.has(p.id)
  )
}

// ── Flags de visibilité sur les entités ──
export const VISIBILITY = {
  INTERNAL: 'internal',           // Visible uniquement côté pro
  CLIENT_VISIBLE: 'client_visible', // Visible par le client
  PUBLIC: 'public',               // Visible par tous (ex: profil public)
}

// ── Ce que le client peut voir ──
export const CLIENT_CAN_VIEW = {
  projectOverview: true,          // Nom, adresse, phase, avancement
  projectPhases: true,            // Les étapes ESQ→REC
  projectBudgetSummary: true,     // Budget total, payé, reste
  projectTeam: true,              // L'équipe assignée au projet
  projectTimeline: true,          // Journal de chantier (entrées visibleToClient)
  projectPhotos: true,            // Galerie (photos visibleToClient)
  documents: true,                // Documents marqués client_visible
  decisions: true,                // Décisions qui le concernent
  messages: true,                 // Ses conversations
  marketplace: true,              // Le marketplace complet
  ao: true,                       // Ses AO publiés
  offers: true,                   // Les offres reçues sur ses AO
  markets: true,                  // Les marchés signés
  orders: true,                   // Ses commandes
  paymentHistory: true,           // Historique de ses paiements
  paymentRequests: true,          // Demandes de paiement en attente
}

// ── Ce que le client peut faire ──
export const CLIENT_CAN_DO = {
  publishAO: true,                // Publier un appel d'offres
  validateDecision: true,         // Valider/refuser une décision
  requestInfo: true,              // Demander plus d'infos
  approvePayment: true,           // Approuver une demande de paiement
  rejectPayment: true,            // Refuser une demande de paiement
  sendMessage: true,              // Envoyer un message
  contactPro: true,               // Contacter un professionnel
  orderMarketplace: true,         // Commander sur le marketplace
  viewDocument: true,             // Consulter un document
  downloadDocument: true,         // Télécharger un document
}

// ── Ce que le client NE PEUT PAS faire ──
export const CLIENT_CANNOT = {
  editProject: true,              // Modifier le projet
  advancePhase: true,             // Faire avancer les phases
  manageTasks: true,              // Gérer les tâches chantier
  editBudget: true,               // Modifier les lignes budgétaires
  manageTeam: true,               // Gérer l'équipe
  createReport: true,             // Créer un rapport
  editOffer: true,                // Modifier une offre
  signMarket: true,               // Signer un marché (le pro le fait)
}

// ── Filtres de visibilité ──

/**
 * Filtre les documents pour le client
 * Le client ne voit que les documents marqués visibleToClient ou de certains types
 */
export const filterDocumentsForClient = (docs, projectId) => {
  const clientVisibleTypes = ['plan', 'admin', 'cr', 'devis', 'pv', 'rapport']
  return docs.filter(d => {
    if (d.visibility === VISIBILITY.INTERNAL) return false
    if (d.visibility === VISIBILITY.CLIENT_VISIBLE) return true
    // Par défaut, les types courants sont visibles au client
    return clientVisibleTypes.includes(d.type)
  })
}

/**
 * Filtre les entrées du journal chantier pour le client
 * Le client ne voit pas les notes internes
 */
export const filterTimelineForClient = (entries) => {
  return entries.filter(e => e.visibility !== VISIBILITY.INTERNAL)
}

/**
 * Vérifie si un document nécessite la validation du client
 */
export const requiresClientApproval = (doc) => {
  return doc.requiresApproval === true || ['pv', 'devis'].includes(doc.type)
}

/**
 * Vérifie si une action a un impact financier
 */
export const hasFinancialImpact = (action) => {
  return ['payment_request', 'payment_confirmed', 'market_signed', 'order_confirmed'].includes(action)
}

/**
 * Filtre les notifications pour le client
 */
export const filterNotificationsForClient = (notifs) => {
  const internalTypes = ['team_update', 'internal_note', 'report_draft']
  return notifs.filter(n => !internalTypes.includes(n.type))
}

// ── Fonction utilitaire de permission ──
export function canDo(role, action) {
  if (role === 'pro' || role === 'pro_admin') return true // Pro peut tout faire
  if (role === 'client') return CLIENT_CAN_DO[action] === true
  return false
}

// ═══ SCOPING COMMERCE — Zone Achats Client ═══

/**
 * Scoping des commandes/achats client
 * Par défaut, les achats du client sont PRIVÉS
 * Ils ne remontent au cockpit que si explicitement rattachés au projet
 */
export const COMMERCE_SCOPE = {
  PRIVATE: 'private',               // Achat privé client — invisible cockpit
  SHARED: 'shared_with_project',    // Rattaché au projet — visible cockpit
}

/**
 * Filtre les commandes visibles côté cockpit
 * Seules les commandes rattachées au projet sont visibles
 */
export const filterOrdersForCockpit = (orders, projectId) => {
  return (orders || []).filter(o =>
    o.scope === COMMERCE_SCOPE.SHARED && (o.projectId === projectId || o.projet === projectId)
  )
}

/**
 * Filtre les commandes côté client — le client voit tout (ses achats privés + partagés)
 */
export const filterOrdersForClient = (orders) => {
  return orders || []
}

/**
 * Vérifie si une commande impacte le budget projet
 */
export const orderImpactsBudget = (order) => {
  return order.scope === COMMERCE_SCOPE.SHARED && order.montant > 0
}

// ═══ SCOPING CONVERSATIONS ═══

/**
 * Filtre les conversations visibles pour un rôle
 * Le client ne voit que les conversations où il est participant
 */
export const filterConversationsForClient = (conversations, clientName) => {
  return (conversations || []).filter(c => {
    // Le client voit les conversations de type client ou groupe projet
    if (c.type === 'client') return true
    if (c.isGroup && c.type === 'groupe') return true
    // Le client voit les conversations où il est participant
    if (c.participants?.includes(clientName)) return true
    // Par défaut, les conversations equipe internes sont masquées
    if (c.type === 'equipe') return false
    return true
  })
}

/**
 * Filtre les conversations visibles côté cockpit (tout sauf les privées client)
 */
export const filterConversationsForCockpit = (conversations) => {
  return (conversations || []).filter(c => c.scope !== 'client_private')
}
