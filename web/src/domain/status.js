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

// ── Catégories de documents entreprise ──
export const ENTREPRISE_DOC_CATEGORIES = {
  RCCM: 'rccm',
  ATTESTATION_FISCALE: 'attestation_fiscale',
  ASSURANCE: 'assurance',
  CERTIFICATION: 'certification',
  PRESENTATION: 'presentation',
  PORTFOLIO: 'portfolio',
}

export const ENTREPRISE_DOC_CATEGORY_LABELS = {
  rccm: 'RCCM',
  attestation_fiscale: 'Attestation Fiscale',
  assurance: 'Assurance',
  certification: 'Certification',
  presentation: 'Présentation',
  portfolio: 'Portfolio',
}

// ── Expiration des documents ──
export function getDocExpirationStatus(expiresAt) {
  if (!expiresAt) return null
  const now = new Date()
  const exp = new Date(expiresAt)
  const daysLeft = Math.ceil((exp - now) / (1000 * 60 * 60 * 24))
  if (daysLeft < 0) return 'expired'
  if (daysLeft <= 30) return 'expiring_soon'
  return 'valid'
}

export function getDocExpirationDays(expiresAt) {
  if (!expiresAt) return null
  const now = new Date()
  const exp = new Date(expiresAt)
  return Math.ceil((exp - now) / (1000 * 60 * 60 * 24))
}

export const DOC_EXPIRATION_LABELS = {
  expired: 'Expiré',
  expiring_soon: 'Expire bientôt',
  valid: 'Valide',
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

// ── Types de mission ──
export const MISSION_TYPES = {
  CONCEPTION_ARCHITECTURALE: 'conception_architecturale',
  ETUDES_STRUCTURE: 'etudes_structure',
  ETUDES_FLUIDES: 'etudes_fluides',
  CONSTRUCTION: 'construction',
  ARCHITECTURE_INTERIEUR: 'architecture_interieur',
}

export const MISSION_TYPE_LABELS = {
  conception_architecturale: 'Conception Architecturale',
  etudes_structure: 'Études Structure',
  etudes_fluides: 'Études Fluides',
  construction: 'Construction',
  architecture_interieur: 'Architecture d\'Intérieur',
}

export const MISSION_TYPE_ICONS = {
  conception_architecturale: '📐',
  etudes_structure: '🔩',
  etudes_fluides: '🚿',
  construction: '🏗️',
  architecture_interieur: '🛋️',
}

export const MISSION_TYPE_RESPONSIBLE = {
  conception_architecturale: 'Bureau d\'Architecture',
  etudes_structure: 'Bureau d\'Études Structure',
  etudes_fluides: 'Bureau d\'Études Fluides',
  construction: 'Entreprise de Construction',
  architecture_interieur: 'Architecte d\'Intérieur',
}

// ── Statuts mission ──
export const MISSION_STATUS = {
  CREATED: 'created',
  INVITATION_SENT: 'invitation_sent',
  ACCEPTED: 'accepted',
  IN_PREPARATION: 'in_preparation',
  IN_PROGRESS: 'in_progress',
  PENDING_VALIDATION: 'pending_validation',
  VALIDATED: 'validated',
  COMPLETED: 'completed',
  ARCHIVED: 'archived',
}

export const MISSION_STATUS_LABELS = {
  created: 'Créée',
  invitation_sent: 'Invitation envoyée',
  accepted: 'Acceptée',
  in_preparation: 'En préparation',
  in_progress: 'En cours',
  pending_validation: 'En attente de validation',
  validated: 'Validée',
  completed: 'Terminée',
  archived: 'Archivée',
}

export const MISSION_STATUS_COLORS = {
  created: 'var(--t4)',
  invitation_sent: 'var(--wrn)',
  accepted: 'var(--info)',
  in_preparation: 'var(--info)',
  in_progress: 'var(--blue)',
  pending_validation: 'var(--wrn)',
  validated: 'var(--ok)',
  completed: 'var(--ok)',
  archived: 'var(--t4)',
}

// ── Jalons prédéfinis par type de mission ──
export const MISSION_JALONS = {
  conception_architecturale: [
    'Relevé & diagnostic', 'Esquisse', 'Avant-projet sommaire', 'Avant-projet détaillé',
    'Projet', 'Plans d\'exécution', 'Dossier de consultation', 'Suivi architectural', 'Réception',
  ],
  etudes_structure: [
    'Diagnostic structurel', 'Note de calcul', 'Plans de fondation', 'Plans de structure',
    'Plans d\'exécution', 'Suivi chantier structure', 'Réception structure',
  ],
  etudes_fluides: [
    'Diagnostic fluides', 'Conception CVC', 'Conception plomberie', 'Conception électricité',
    'Plans d\'exécution', 'Suivi chantier fluides', 'Réception fluides',
  ],
  construction: [
    'Préparation chantier', 'Terrassement', 'Fondations', 'Gros œuvre', 'Charpente',
    'Couverture', 'Second œuvre', 'Finitions', 'Réception',
  ],
  architecture_interieur: [
    'Brief & concept', 'Moodboard & planches', 'Plans d\'aménagement', 'Choix matériaux',
    'Suivi de réalisation', 'Installation mobilier', 'Réception',
  ],
}

export function buildInitialJalons(missionType) {
  const titles = MISSION_JALONS[missionType] || []
  return titles.map((title, i) => ({
    id: `jalon_${i}`,
    title,
    status: 'not_started',
    order: i,
  }))
}

// ── Statuts actif (Asset Engine) ──
export const ASSET_STATUS = {
  PLANIFIE: 'planifie',
  EN_CONCEPTION: 'en_conception',
  EN_REALISATION: 'en_realisation',
  INSTALLE: 'installe',
  RECEPTIONNE: 'receptionne',
  EN_EXPLOITATION: 'en_exploitation',
  EN_MAINTENANCE: 'en_maintenance',
  RENOVE: 'renove',
  REMPLACE: 'remplace',
  ARCHIVE: 'archive',
}

export const ASSET_STATUS_LABELS = {
  planifie: 'Planifié',
  en_conception: 'En conception',
  en_realisation: 'En réalisation',
  installe: 'Installé',
  receptionne: 'Réceptionné',
  en_exploitation: 'En exploitation',
  en_maintenance: 'En maintenance',
  renove: 'Rénové',
  remplace: 'Remplacé',
  archive: 'Archivé',
}

export const ASSET_CATEGORIES = [
  { id: 'fondations', label: 'Fondations', icon: '🏗️' },
  { id: 'structure', label: 'Structure', icon: '🔩' },
  { id: 'toiture', label: 'Toiture', icon: '🏠' },
  { id: 'facades', label: 'Façades', icon: '🧱' },
  { id: 'menuiseries', label: 'Menuiseries', icon: '🪟' },
  { id: 'electricite', label: 'Électricité', icon: '⚡' },
  { id: 'plomberie', label: 'Plomberie', icon: '🚿' },
  { id: 'climatisation', label: 'Climatisation', icon: '❄️' },
  { id: 'ascenseurs', label: 'Ascenseurs', icon: '🛗' },
  { id: 'solaire', label: 'Production solaire', icon: '☀️' },
  { id: 'incendie', label: 'Réseau incendie', icon: '🧯' },
  { id: 'espaces_verts', label: 'Espaces verts', icon: '🌳' },
  { id: 'mobilier_fixe', label: 'Mobilier fixe', icon: '🪑' },
  { id: 'equipements', label: 'Équipements techniques', icon: '⚙️' },
]

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
  // Missions
  [MISSION_STATUS.CREATED]: 'Créée',
  [MISSION_STATUS.INVITATION_SENT]: 'Invitation envoyée',
  [MISSION_STATUS.ACCEPTED]: 'Acceptée',
  [MISSION_STATUS.IN_PREPARATION]: 'En préparation',
  [MISSION_STATUS.IN_PROGRESS]: 'En cours',
  [MISSION_STATUS.PENDING_VALIDATION]: 'En attente de validation',
  [MISSION_STATUS.VALIDATED]: 'Validée',
  [MISSION_STATUS.COMPLETED]: 'Terminée',
}

export const getStatusLabel = (s) => STATUS_LABELS[s] || s
