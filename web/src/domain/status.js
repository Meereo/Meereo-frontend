// ═══════════════════════════════════════════════════════
//  MEEREO — Référentiel central de statuts
//  Source de vérité unique pour cockpit + client
// ═══════════════════════════════════════════════════════

// ── Statuts génériques ──
export const STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  BLOCKED: 'blocked',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
}

// ── Phases projet (ordre strict) — 8 phases compréhensibles par tous ──
export const PROJECT_PHASES = [
  'ESQUISSE',
  'AVANT_PROJET',
  'PROJET_DETAILLE',
  'PLANS_EXECUTION',
  'CONSULTATION_ENTREPRISES',
  'ATTRIBUTION_MARCHES',
  'SUIVI_CHANTIER',
  'RECEPTION',
]

// Labels courts — affichage compact (cartes, badges, filtres)
export const PHASE_LABELS = {
  ESQUISSE: 'Esquisse',
  AVANT_PROJET: 'Avant-projet',
  PROJET_DETAILLE: 'Projet détaillé',
  PLANS_EXECUTION: 'Plans d\'exécution',
  CONSULTATION_ENTREPRISES: 'Consultation des entreprises',
  ATTRIBUTION_MARCHES: 'Attribution des marchés',
  SUIVI_CHANTIER: 'Suivi de chantier',
  RECEPTION: 'Réception du projet',
  // Backward compat
  IDEE: 'Esquisse',
  ETUDES: 'Esquisse',
  CONCEPTION: 'Avant-projet',
  CONSULTATION: 'Consultation des entreprises',
  TRAVAUX: 'Suivi de chantier',
  FINITIONS: 'Suivi de chantier',
  LIVRAISON: 'Réception du projet',
  EXPLOITATION: 'Réception du projet',
}

// Labels descriptifs — utilisés dans les selects de création/édition
export const PHASE_LABELS_FULL = {
  ESQUISSE: 'Esquisse',
  AVANT_PROJET: 'Avant-projet',
  PROJET_DETAILLE: 'Projet détaillé',
  PLANS_EXECUTION: 'Plans d\'exécution',
  CONSULTATION_ENTREPRISES: 'Consultation des entreprises',
  ATTRIBUTION_MARCHES: 'Attribution des marchés',
  SUIVI_CHANTIER: 'Suivi de chantier',
  RECEPTION: 'Réception du projet',
}

// Prochaine action recommandée par phase
export const PHASE_DETAIL = {
  ESQUISSE: ['Relevé de mesures', 'Analyse du site', 'Faisabilité'],
  AVANT_PROJET: ['Estimation budgétaire', 'Études BET', 'Études techniques'],
  PROJET_DETAILLE: ['Plans d\'exécution', 'Dossier permis de construire'],
  PLANS_EXECUTION: ['Lancer les consultations', 'Préparer le DCE'],
  CONSULTATION_ENTREPRISES: ['Réceptionner les offres', 'Analyser et comparer'],
  ATTRIBUTION_MARCHES: ['Signer les marchés', 'Planifier le chantier'],
  SUIVI_CHANTIER: ['Suivre l\'avancement', 'Contrôler la qualité'],
  RECEPTION: ['Lever les réserves', 'Remettre les clés'],
}

export const PHASE_INDEX = Object.fromEntries(PROJECT_PHASES.map((p, i) => [p, i]))

// Backward compatibility — map ALL old phase codes to new ones
export const PHASE_COMPAT = {
  // Anciens codes techniques
  ESQ: 'ESQUISSE', APS: 'AVANT_PROJET', APD: 'PROJET_DETAILLE', PRO: 'PLANS_EXECUTION',
  DCE: 'CONSULTATION_ENTREPRISES', ACT: 'ATTRIBUTION_MARCHES',
  EXE: 'SUIVI_CHANTIER', DET: 'SUIVI_CHANTIER', AOR: 'RECEPTION', REC: 'RECEPTION',
  // Anciennes phases simplifiées
  IDEE: 'ESQUISSE', ETUDES: 'ESQUISSE', CONCEPTION: 'AVANT_PROJET',
  CONSULTATION: 'CONSULTATION_ENTREPRISES', TRAVAUX: 'SUIVI_CHANTIER',
  FINITIONS: 'SUIVI_CHANTIER', LIVRAISON: 'RECEPTION', EXPLOITATION: 'RECEPTION',
}
export const normalizePhase = (p) => PHASE_COMPAT[p] || p

// ── Statuts projet ──
export const PROJECT_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
}

// ── Statuts tâche chantier ──
export const TASK_STATUS = {
  TODO: 'todo',
  ACTIVE: 'active',
  DONE: 'done',
  BLOCKED: 'blocked',
}

// ── Statuts AO ──
export const AO_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  OPEN: 'open',
  CLOSED: 'closed',
  ATTRIBUTED: 'attributed',
  CANCELLED: 'cancelled',
}

// ── Statuts offre ──
export const OFFER_STATUS = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
}

// Mapping des anciens statuts vers les nouveaux (rétro-compat)
export const OFFER_STATUS_COMPAT = {
  'en_attente': OFFER_STATUS.PENDING,
  'en attente': OFFER_STATUS.PENDING,
  'acceptee': OFFER_STATUS.ACCEPTED,
  'refusee': OFFER_STATUS.REJECTED,
}

export const normalizeOfferStatus = (s) => OFFER_STATUS_COMPAT[s] || s

// ── Statuts marché ──
export const MARKET_STATUS = {
  SIGNED: 'signed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  SUSPENDED: 'suspended',       // Marché suspendu temporairement
  TERMINATED: 'terminated',     // Marché résilié / arrêté
  REPLACED: 'replaced',         // Prestataire remplacé — nouveau flux ouvert
  CLOSED: 'closed',             // Lot clôturé définitivement
}

export const MARKET_STATUS_COMPAT = {
  'en_cours': MARKET_STATUS.IN_PROGRESS,
  'signe': MARKET_STATUS.SIGNED,
  'livre': MARKET_STATUS.COMPLETED,
}

export const normalizeMarketStatus = (s) => MARKET_STATUS_COMPAT[s] || s

// Statuts qui autorisent l'ouverture d'un nouveau flux sur le même lot/métier
export const MARKET_ALLOWS_REPLACEMENT = new Set([
  MARKET_STATUS.COMPLETED,
  MARKET_STATUS.TERMINATED,
  MARKET_STATUS.REPLACED,
  MARKET_STATUS.CLOSED,
  MARKET_STATUS.CANCELLED,
])

// Statuts qui BLOQUENT un nouveau flux (le marché est encore actif)
export const MARKET_BLOCKS_REPLACEMENT = new Set([
  MARKET_STATUS.SIGNED,
  MARKET_STATUS.IN_PROGRESS,
])

// ── Statuts paiement ──
export const PAYMENT_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  PENDING_CLIENT: 'pending_client_approval',
  APPROVED: 'approved',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  SCHEDULED: 'scheduled',
  PAID: 'paid',
  CANCELLED: 'cancelled',
}

export const PAYMENT_STATUS_COMPAT = {
  'en attente': PAYMENT_STATUS.PENDING,
  'confirmé': PAYMENT_STATUS.CONFIRMED,
  'confirme': PAYMENT_STATUS.CONFIRMED,
}

export const normalizePaymentStatus = (s) => PAYMENT_STATUS_COMPAT[s] || s

// Statuts visibles pour le client
export const PAYMENT_CLIENT_VISIBLE = new Set([
  PAYMENT_STATUS.PENDING_CLIENT,
  PAYMENT_STATUS.PENDING,
  PAYMENT_STATUS.APPROVED,
  PAYMENT_STATUS.CONFIRMED,
  PAYMENT_STATUS.PAID,
])

// ── Statuts document ──
export const DOC_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived',
}

// ── Statuts décision ──
export const DECISION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  INFO_REQUESTED: 'info_requested',
}

export const DECISION_STATUS_COMPAT = {
  'validee': DECISION_STATUS.APPROVED,
  'info': DECISION_STATUS.INFO_REQUESTED,
}

// ── Statuts commande ──
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
}

export const ORDER_STATUS_COMPAT = {
  'en_transit': ORDER_STATUS.IN_TRANSIT,
  'livre': ORDER_STATUS.DELIVERED,
  'confirmee': ORDER_STATUS.CONFIRMED,
}

// ── Labels affichage (français) ──
export const STATUS_LABELS = {
  [STATUS.DRAFT]: 'Brouillon',
  [STATUS.PENDING]: 'En attente',
  [STATUS.IN_REVIEW]: 'En revue',
  [STATUS.APPROVED]: 'Approuvé',
  [STATUS.REJECTED]: 'Refusé',
  [STATUS.IN_PROGRESS]: 'En cours',
  [STATUS.COMPLETED]: 'Terminé',
  [STATUS.CANCELLED]: 'Annulé',
  [STATUS.BLOCKED]: 'Bloqué',
  [STATUS.PUBLISHED]: 'Publié',
  [STATUS.ARCHIVED]: 'Archivé',
  // Spécifiques
  [OFFER_STATUS.WITHDRAWN]: 'Retirée',
  [AO_STATUS.OPEN]: 'Ouvert',
  [AO_STATUS.CLOSED]: 'Clôturé',
  [AO_STATUS.ATTRIBUTED]: 'Attribué',
  [MARKET_STATUS.SIGNED]: 'Signé',
  [DECISION_STATUS.INFO_REQUESTED]: 'Info demandée',
  [ORDER_STATUS.IN_TRANSIT]: 'En transit',
  [ORDER_STATUS.DELIVERED]: 'Livré',
  [ORDER_STATUS.CONFIRMED]: 'Confirmée',
  [PAYMENT_STATUS.CONFIRMED]: 'Confirmé',
}

export const getStatusLabel = (s) => STATUS_LABELS[s] || s
