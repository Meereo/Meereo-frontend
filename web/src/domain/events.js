// ═══════════════════════════════════════════════════════
//  MEEREO — Événements métier
//  Chaque action importante génère un événement
//  qui peut déclencher notifications + activity log
// ═══════════════════════════════════════════════════════

export const EVENTS = {
  // Projet
  PROJECT_CREATED: 'project_created',
  PROJECT_PHASE_CHANGED: 'project_phase_changed',
  PROJECT_PROGRESS_UPDATED: 'project_progress_updated',
  PROJECT_COMPLETED: 'project_completed',

  // Tâches chantier
  TASK_STATUS_CHANGED: 'task_status_changed',
  TASK_ASSIGNED: 'task_assigned',
  TASK_VALIDATED: 'task_validated',
  TASK_VALIDATION_REJECTED: 'task_validation_rejected',

  // AO / Offres / Marchés
  AO_PUBLISHED: 'ao_published',
  AO_CLOSED: 'ao_closed',
  OFFER_RECEIVED: 'offer_received',
  OFFER_ACCEPTED: 'offer_accepted',
  OFFER_REJECTED: 'offer_rejected',
  MARKET_SIGNED: 'market_signed',
  MARKET_COMPLETED: 'market_completed',

  // Paiements
  PAYMENT_REQUESTED: 'payment_requested',
  PAYMENT_APPROVED: 'payment_approved',
  PAYMENT_REJECTED: 'payment_rejected',
  PAYMENT_CONFIRMED: 'payment_confirmed',

  // Documents
  DOCUMENT_UPLOADED: 'document_uploaded',
  DOCUMENT_SHARED_WITH_CLIENT: 'document_shared_with_client',

  // Décisions
  DECISION_CREATED: 'decision_created',
  DECISION_APPROVED: 'decision_approved',
  DECISION_REJECTED: 'decision_rejected',
  DECISION_INFO_REQUESTED: 'decision_info_requested',

  // Messages
  MESSAGE_SENT: 'message_sent',
  MESSAGE_RECEIVED: 'message_received',

  // Commandes
  ORDER_PLACED: 'order_placed',
  ORDER_DELIVERED: 'order_delivered',

  // Photos
  PHOTO_ADDED: 'photo_added',
}

// Quels événements sont visibles par le client
export const CLIENT_VISIBLE_EVENTS = new Set([
  EVENTS.PROJECT_PHASE_CHANGED,
  EVENTS.PROJECT_PROGRESS_UPDATED,
  EVENTS.PROJECT_COMPLETED,
  EVENTS.AO_PUBLISHED,
  EVENTS.OFFER_RECEIVED,
  EVENTS.OFFER_ACCEPTED,
  EVENTS.OFFER_REJECTED,
  EVENTS.MARKET_SIGNED,
  EVENTS.MARKET_COMPLETED,
  EVENTS.PAYMENT_REQUESTED,
  EVENTS.PAYMENT_APPROVED,
  EVENTS.PAYMENT_CONFIRMED,
  EVENTS.DOCUMENT_SHARED_WITH_CLIENT,
  EVENTS.DECISION_CREATED,
  EVENTS.DECISION_APPROVED,
  EVENTS.DECISION_INFO_REQUESTED,
  EVENTS.MESSAGE_RECEIVED,
  EVENTS.ORDER_PLACED,
  EVENTS.ORDER_DELIVERED,
  EVENTS.PHOTO_ADDED,
  EVENTS.TASK_VALIDATED,
  EVENTS.TASK_VALIDATION_REJECTED,
])

// Messages de notification par événement
export const EVENT_MESSAGES = {
  [EVENTS.PROJECT_CREATED]: (d) => `Nouveau projet créé : ${d.projectName}`,
  [EVENTS.PROJECT_PHASE_CHANGED]: (d) => `Le projet ${d.projectName} passe en phase ${d.phase}`,
  [EVENTS.PROJECT_PROGRESS_UPDATED]: (d) => `Avancement mis à jour : ${d.progress}%`,
  [EVENTS.PROJECT_COMPLETED]: (d) => `Le projet ${d.projectName} est terminé`,
  [EVENTS.TASK_STATUS_CHANGED]: (d) => `Tâche "${d.taskTitle || 'tâche'}" : ${d.newStatus}`,
  [EVENTS.TASK_ASSIGNED]: (d) => `Tâche "${d.taskTitle || 'tâche'}" assignée à ${d.assignee || 'un intervenant'}`,
  [EVENTS.AO_PUBLISHED]: (d) => `AO publié : ${d.title}`,
  [EVENTS.AO_CLOSED]: (d) => `AO clôturé : ${d.title}`,
  [EVENTS.OFFER_RECEIVED]: (d) => `Nouvelle offre reçue de ${d.from}`,
  [EVENTS.OFFER_ACCEPTED]: (d) => `Offre acceptée — ${d.title}`,
  [EVENTS.OFFER_REJECTED]: (d) => `Offre refusée — ${d.title}`,
  [EVENTS.MARKET_SIGNED]: (d) => `Marché signé avec ${d.company}`,
  [EVENTS.MARKET_COMPLETED]: (d) => `Marché terminé : ${d.title || 'marché'}`,
  [EVENTS.PAYMENT_REQUESTED]: (d) => `Demande de paiement : ${d.amount}`,
  [EVENTS.PAYMENT_APPROVED]: (d) => `Paiement approuvé : ${d.amount}`,
  [EVENTS.PAYMENT_REJECTED]: (d) => `Paiement refusé : ${d.amount}`,
  [EVENTS.PAYMENT_CONFIRMED]: (d) => `Paiement confirmé : ${d.amount}`,
  [EVENTS.DOCUMENT_UPLOADED]: (d) => `Document ajouté : ${d.name || d.count + ' fichier(s)'}`,
  [EVENTS.DOCUMENT_SHARED_WITH_CLIENT]: (d) => `Nouveau document : ${d.name}`,
  [EVENTS.DECISION_CREATED]: (d) => `Nouvelle décision requise : ${d.title}`,
  [EVENTS.DECISION_APPROVED]: (d) => `Décision validée : ${d.title}`,
  [EVENTS.DECISION_REJECTED]: (d) => `Décision refusée : ${d.title}`,
  [EVENTS.DECISION_INFO_REQUESTED]: (d) => `Complément d'information demandé : ${d.title}`,
  [EVENTS.MESSAGE_SENT]: (d) => `Message envoyé à ${d.to || 'un contact'}`,
  [EVENTS.MESSAGE_RECEIVED]: (d) => `Nouveau message de ${d.from}`,
  [EVENTS.ORDER_PLACED]: (d) => `Commande passée : ${d.ref}`,
  [EVENTS.ORDER_DELIVERED]: (d) => `Commande livrée : ${d.ref}`,
  [EVENTS.PHOTO_ADDED]: (d) => `Nouvelle photo ajoutée au projet`,
  [EVENTS.TASK_VALIDATED]: (d) => `Tâche validée : ${d.taskTitle || 'tâche'}`,
  [EVENTS.TASK_VALIDATION_REJECTED]: (d) => `Tâche refusée : ${d.taskTitle || 'tâche'} — corrections requises`,
}
