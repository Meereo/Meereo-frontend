/**
 * MEEREO Rules Engine — Moteur centralisé des règles métier
 *
 * Chaque règle possède : un nom, une condition, un message d'erreur, et des actions de déblocage.
 * Les routes interrogent le Rules Engine avant d'exécuter une action.
 */

// ── Définitions des règles métier ──

const RULES = {
  // ── Inscription ──
  PRO_MUST_BE_VERIFIED: {
    name: 'PRO_MUST_BE_VERIFIED',
    description: 'Un professionnel doit être vérifié pour répondre aux AO et être affecté à une mission',
    check: (ctx) => ctx.user?.verified === true,
    failMessage: 'Votre entreprise doit être vérifiée pour effectuer cette action.',
    unlockActions: ['Déposer vos documents dans le Référentiel Entreprise', 'Contacter le support MEEREO pour accélérer la vérification'],
  },

  // ── Projet ──
  PROJECT_MUST_HAVE_OWNER: {
    name: 'PROJECT_MUST_HAVE_OWNER',
    description: 'Un projet doit toujours avoir un propriétaire',
    check: (ctx) => !!ctx.project?.ownerId,
    failMessage: 'Le projet doit avoir un propriétaire.',
    unlockActions: ['Désigner un propriétaire pour le projet'],
  },

  // ── AO ──
  CLIENT_RECRUITS_ONLY_ARCHITECT: {
    name: 'CLIENT_RECRUITS_ONLY_ARCHITECT',
    description: 'Le client ne peut créer un AO que pour un Bureau d\'Architecture',
    check: (ctx) => ctx.user?.type !== 'client' || ctx.requestedTrade === "Bureau d'Architecture",
    failMessage: 'En tant que client, vous ne pouvez recruter directement qu\'un Bureau d\'Architecture. Les autres professionnels sont intégrés par le coordinateur technique.',
    unlockActions: ['Demander à votre architecte d\'intégrer les autres professionnels'],
  },

  AO_MUST_BE_OPEN: {
    name: 'AO_MUST_BE_OPEN',
    description: 'Un AO doit être ouvert pour recevoir des réponses',
    check: (ctx) => ctx.ao?.status === 'open',
    failMessage: 'Cet appel d\'offres n\'est plus ouvert aux réponses.',
    unlockActions: ['Consulter les appels d\'offres ouverts'],
  },

  CANNOT_RESPOND_OWN_AO: {
    name: 'CANNOT_RESPOND_OWN_AO',
    description: 'Un utilisateur ne peut pas répondre à son propre AO',
    check: (ctx) => ctx.ao?.ownerUserId !== ctx.user?.id,
    failMessage: 'Vous ne pouvez pas répondre à votre propre appel d\'offres.',
    unlockActions: [],
  },

  // ── Mission ──
  MISSION_MUST_HAVE_PROJECT: {
    name: 'MISSION_MUST_HAVE_PROJECT',
    description: 'Une mission doit être rattachée à un projet',
    check: (ctx) => !!ctx.projectId,
    failMessage: 'La mission doit être rattachée à un projet.',
    unlockActions: ['Créer un projet d\'abord'],
  },

  // ── Document ──
  DOCUMENT_NOT_EXPIRED: {
    name: 'DOCUMENT_NOT_EXPIRED',
    description: 'Un document expiré ne peut pas être utilisé dans un dossier d\'AO',
    check: (ctx) => !ctx.document?.expiresAt || new Date(ctx.document.expiresAt) > new Date(),
    failMessage: 'Ce document est expiré et ne peut pas être inclus dans le dossier.',
    unlockActions: ['Mettre à jour le document avec une version valide'],
  },

  // ── Permissions ──
  USER_CAN_ACCESS_PROJECT: {
    name: 'USER_CAN_ACCESS_PROJECT',
    description: 'L\'utilisateur doit avoir accès au projet pour agir dessus',
    check: (ctx) => ctx.hasProjectAccess === true,
    failMessage: 'Vous n\'avez pas accès à ce projet.',
    unlockActions: ['Demander une invitation au propriétaire du projet'],
  },
}

/**
 * Évaluer une règle métier
 * @param {string} ruleName - Nom de la règle
 * @param {object} context - Contexte d'évaluation (user, project, ao, document, etc.)
 * @returns {{ allowed: boolean, rule?: string, reason?: string, unlockActions?: string[] }}
 */
function evaluate(ruleName, context) {
  const rule = RULES[ruleName]
  if (!rule) return { allowed: true } // Règle inconnue = autorisé par défaut

  const passed = rule.check(context)
  if (passed) return { allowed: true }

  return {
    allowed: false,
    rule: rule.name,
    reason: rule.failMessage,
    description: rule.description,
    unlockActions: rule.unlockActions || [],
  }
}

/**
 * Évaluer plusieurs règles d'un coup
 * @param {string[]} ruleNames - Noms des règles à évaluer
 * @param {object} context
 * @returns {{ allowed: boolean, failures: object[] }}
 */
function evaluateAll(ruleNames, context) {
  const failures = []
  for (const name of ruleNames) {
    const result = evaluate(name, context)
    if (!result.allowed) failures.push(result)
  }
  return { allowed: failures.length === 0, failures }
}

/**
 * Récupérer la définition d'une règle
 * @param {string} ruleName
 * @returns {object|null}
 */
function getRule(ruleName) {
  return RULES[ruleName] || null
}

/**
 * Lister toutes les règles
 * @returns {object[]}
 */
function listRules() {
  return Object.values(RULES).map(r => ({ name: r.name, description: r.description }))
}

module.exports = { RULES, evaluate, evaluateAll, getRule, listRules }
