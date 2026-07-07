/**
 * MEEREO Permission Engine — Permissions dynamiques par contexte et état workflow
 *
 * Les permissions dépendent de :
 * - Le rôle de l'utilisateur (client, pro_admin, architecte, entreprise, bet, fournisseur)
 * - Le projet (ownerId, clientId, membership)
 * - La mission (responsibleUserId, createdBy)
 * - L'état du workflow (phase du projet, statut de la mission)
 */

const ROLES = {
  PRO_ADMIN: 'pro_admin',
  PRO_MEMBER: 'pro_member',
  CLIENT: 'client',
  ARCHITECTE: 'architecte',
  BET: 'bet',
  ENTREPRISE: 'entreprise',
  SUPPLIER: 'fournisseur',
  ADMIN: 'admin',
}

// ── Actions et rôles autorisés ──
const BASE_PERMISSIONS = {
  // AO
  create_ao: [ROLES.CLIENT, ROLES.PRO_ADMIN, ROLES.ARCHITECTE],
  respond_ao: [ROLES.ENTREPRISE, ROLES.BET, ROLES.SUPPLIER],
  accept_offer: [ROLES.CLIENT, ROLES.ARCHITECTE],

  // Mission
  create_mission: [ROLES.PRO_ADMIN, ROLES.ARCHITECTE, ROLES.CLIENT],
  assign_mission: [ROLES.PRO_ADMIN, ROLES.ARCHITECTE],
  advance_mission: [ROLES.PRO_ADMIN, ROLES.ARCHITECTE, ROLES.ENTREPRISE, ROLES.BET],
  validate_mission: [ROLES.CLIENT, ROLES.ARCHITECTE],

  // Projet
  create_project: [ROLES.PRO_ADMIN, ROLES.CLIENT, ROLES.ARCHITECTE],
  edit_project: [ROLES.PRO_ADMIN, ROLES.ARCHITECTE],
  archive_project: [ROLES.PRO_ADMIN, ROLES.CLIENT],

  // Document
  upload_document: [ROLES.PRO_ADMIN, ROLES.PRO_MEMBER, ROLES.ARCHITECTE, ROLES.BET, ROLES.ENTREPRISE],
  edit_document: [ROLES.PRO_ADMIN, ROLES.PRO_MEMBER, ROLES.ARCHITECTE, ROLES.BET, ROLES.ENTREPRISE],
  validate_document: [ROLES.CLIENT, ROLES.ARCHITECTE],

  // Tâches
  assign_task: [ROLES.PRO_ADMIN, ROLES.ARCHITECTE],
  advance_task: [ROLES.PRO_ADMIN, ROLES.ARCHITECTE, ROLES.ENTREPRISE, ROLES.BET],
  validate_task: [ROLES.CLIENT, ROLES.ARCHITECTE],
}

// ── Restrictions par état de workflow ──
// Quand un objet est dans un certain état, certaines actions sont bloquées
const WORKFLOW_RESTRICTIONS = {
  mission: {
    completed: {
      blocked: ['advance_mission', 'edit_document', 'upload_document', 'assign_task', 'advance_task'],
      reason: 'La mission est terminée — les modifications ne sont plus autorisées.',
    },
    archived: {
      blocked: ['advance_mission', 'validate_mission', 'edit_document', 'upload_document', 'assign_task', 'advance_task', 'validate_task'],
      reason: 'La mission est archivée — aucune modification n\'est possible.',
    },
    validated: {
      blocked: ['advance_mission', 'edit_document'],
      reason: 'La mission est validée — seule la clôture est possible.',
    },
  },
  project: {
    RECEPTION: {
      blocked: ['edit_project', 'create_mission', 'assign_mission'],
      reason: 'Le projet est en phase de réception — les modifications structurelles ne sont plus autorisées.',
    },
  },
  document: {
    archived: {
      blocked: ['edit_document', 'validate_document'],
      reason: 'Le document est archivé.',
    },
  },
}

/**
 * Vérifie si un utilisateur a la permission d'effectuer une action
 * @param {object} params
 * @param {string} params.role - Rôle de l'utilisateur dans le projet
 * @param {string} params.action - Action demandée (create_mission, edit_document, etc.)
 * @param {string} [params.workflowType] - Type de workflow (mission, project, document)
 * @param {string} [params.workflowState] - État actuel du workflow
 * @returns {{ allowed: boolean, reason?: string }}
 */
function checkPermission({ role, action, workflowType, workflowState }) {
  // 1. Vérifier la permission de base (rôle)
  const allowedRoles = BASE_PERMISSIONS[action]
  if (!allowedRoles) return { allowed: true } // Action inconnue = autorisé par défaut
  if (!allowedRoles.includes(role)) {
    return { allowed: false, reason: `Le rôle "${role}" n'est pas autorisé à effectuer l'action "${action}".` }
  }

  // 2. Vérifier les restrictions par état de workflow
  if (workflowType && workflowState) {
    const restrictions = WORKFLOW_RESTRICTIONS[workflowType]?.[workflowState]
    if (restrictions && restrictions.blocked.includes(action)) {
      return { allowed: false, reason: restrictions.reason }
    }
  }

  return { allowed: true }
}

/**
 * Récupère toutes les actions possibles pour un rôle dans un contexte donné
 * @param {string} role
 * @param {string} [workflowType]
 * @param {string} [workflowState]
 * @returns {string[]}
 */
function getAvailableActions(role, workflowType, workflowState) {
  const actions = []
  for (const [action, roles] of Object.entries(BASE_PERMISSIONS)) {
    if (roles.includes(role)) {
      const result = checkPermission({ role, action, workflowType, workflowState })
      if (result.allowed) actions.push(action)
    }
  }
  return actions
}

module.exports = { ROLES, BASE_PERMISSIONS, WORKFLOW_RESTRICTIONS, checkPermission, getAvailableActions }
