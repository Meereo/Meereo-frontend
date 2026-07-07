/**
 * MEEREO Workflow Engine — Moteur centralisé des cycles de vie
 *
 * Chaque objet métier possède un workflow avec des états et des transitions autorisées.
 * Le Workflow Engine vérifie les préconditions, exécute la transition et déclenche les post-actions.
 */

// ── Définitions des workflows ──

const WORKFLOWS = {
  project: {
    states: ['ESQUISSE', 'AVANT_PROJET', 'PROJET_DETAILLE', 'PLANS_EXECUTION', 'CONSULTATION_ENTREPRISES', 'ATTRIBUTION_MARCHES', 'SUIVI_CHANTIER', 'RECEPTION'],
    transitions: {
      ESQUISSE: ['AVANT_PROJET'],
      AVANT_PROJET: ['PROJET_DETAILLE', 'ESQUISSE'],
      PROJET_DETAILLE: ['PLANS_EXECUTION', 'AVANT_PROJET'],
      PLANS_EXECUTION: ['CONSULTATION_ENTREPRISES', 'PROJET_DETAILLE'],
      CONSULTATION_ENTREPRISES: ['ATTRIBUTION_MARCHES', 'PLANS_EXECUTION'],
      ATTRIBUTION_MARCHES: ['SUIVI_CHANTIER', 'CONSULTATION_ENTREPRISES'],
      SUIVI_CHANTIER: ['RECEPTION', 'ATTRIBUTION_MARCHES'],
      RECEPTION: [],
    },
  },
  mission: {
    states: ['created', 'invitation_sent', 'accepted', 'in_preparation', 'in_progress', 'pending_validation', 'validated', 'completed', 'archived'],
    transitions: {
      created: ['invitation_sent', 'accepted'],
      invitation_sent: ['accepted', 'created'],
      accepted: ['in_preparation', 'in_progress'],
      in_preparation: ['in_progress', 'accepted'],
      in_progress: ['pending_validation', 'in_preparation'],
      pending_validation: ['validated', 'in_progress'],
      validated: ['completed'],
      completed: ['archived'],
      archived: [],
    },
  },
  ao: {
    states: ['draft', 'open', 'closed', 'attributed', 'cancelled'],
    transitions: {
      draft: ['open', 'cancelled'],
      open: ['closed', 'attributed', 'cancelled'],
      closed: ['attributed', 'open'],
      attributed: [],
      cancelled: [],
    },
  },
  order: {
    states: ['confirmee', 'en_transit', 'livre', 'annulee'],
    transitions: {
      confirmee: ['en_transit', 'annulee'],
      en_transit: ['livre', 'annulee'],
      livre: [],
      annulee: [],
    },
  },
  document: {
    states: ['draft', 'published', 'archived'],
    transitions: {
      draft: ['published'],
      published: ['archived', 'draft'],
      archived: ['published'],
    },
  },
  market: {
    states: ['signed', 'in_progress', 'completed', 'cancelled', 'suspended', 'terminated', 'replaced', 'closed'],
    transitions: {
      signed: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'suspended', 'terminated'],
      completed: ['closed'],
      suspended: ['in_progress', 'terminated'],
      terminated: ['replaced'],
      replaced: [],
      cancelled: [],
      closed: [],
    },
  },
}

/**
 * Vérifie si une transition est autorisée
 * @param {string} workflowName - Nom du workflow (project, mission, ao, etc.)
 * @param {string} currentState - État actuel
 * @param {string} targetState - État cible
 * @returns {{ allowed: boolean, reason?: string }}
 */
function canTransition(workflowName, currentState, targetState) {
  const workflow = WORKFLOWS[workflowName]
  if (!workflow) return { allowed: false, reason: `Workflow "${workflowName}" inconnu` }

  if (!workflow.states.includes(currentState)) return { allowed: false, reason: `État actuel "${currentState}" invalide pour le workflow "${workflowName}"` }
  if (!workflow.states.includes(targetState)) return { allowed: false, reason: `État cible "${targetState}" invalide pour le workflow "${workflowName}"` }

  const allowedTargets = workflow.transitions[currentState] || []
  if (!allowedTargets.includes(targetState)) {
    return {
      allowed: false,
      reason: `Transition "${currentState}" → "${targetState}" non autorisée. Transitions possibles : ${allowedTargets.join(', ') || 'aucune'}`,
    }
  }

  return { allowed: true }
}

/**
 * Récupère les transitions possibles depuis un état donné
 * @param {string} workflowName
 * @param {string} currentState
 * @returns {string[]}
 */
function getAvailableTransitions(workflowName, currentState) {
  const workflow = WORKFLOWS[workflowName]
  if (!workflow) return []
  return workflow.transitions[currentState] || []
}

/**
 * Récupère la définition complète d'un workflow
 * @param {string} workflowName
 * @returns {object|null}
 */
function getWorkflow(workflowName) {
  return WORKFLOWS[workflowName] || null
}

module.exports = { WORKFLOWS, canTransition, getAvailableTransitions, getWorkflow }
