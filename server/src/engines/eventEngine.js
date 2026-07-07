/**
 * MEEREO Event Engine — Bus d'événements centralisé avec journal immuable
 *
 * Chaque action importante génère un événement immuable.
 * Les modules s'abonnent aux événements pour réagir (notifications, CRM, KAI, etc.)
 */

const { getPrisma } = require('../db')
const { getIo } = require('../socket')

// ── Handlers enregistrés par type d'événement ──
const handlers = {}

/**
 * Enregistrer un handler pour un type d'événement
 * @param {string} eventType - ex: 'PROJECT_CREATED', 'MISSION_ACCEPTED'
 * @param {Function} handler - async (event) => void
 */
function on(eventType, handler) {
  if (!handlers[eventType]) handlers[eventType] = []
  handlers[eventType].push(handler)
}

/**
 * Émettre un événement — persiste dans le journal puis exécute les handlers
 * @param {string} eventType - Type d'événement (PROJECT_CREATED, MISSION_ACCEPTED, etc.)
 * @param {object} data - Données de l'événement
 * @param {object} context - { userId, userName, projectId?, missionId? }
 * @returns {object} L'événement persisté
 */
async function emit(eventType, data, context = {}) {
  const prisma = getPrisma()

  // 1. Persister dans le journal d'audit (table activities)
  const event = await prisma.activity.create({
    data: {
      action: eventType,
      data: { ...data, _context: context },
      userId: context.userId || null,
    },
  }).catch(() => ({ id: 'local_' + Date.now(), action: eventType, data }))

  // 2. Pousser en temps réel via Socket.IO
  const io = getIo()
  if (io && context.userId) {
    // Notifier tous les utilisateurs concernés
    const targetUsers = data._notifyUsers || []
    targetUsers.forEach(uid => {
      if (uid !== context.userId) {
        io.to(`user:${uid}`).emit('event:new', {
          id: event.id,
          type: eventType,
          data,
          userId: context.userId,
          userName: context.userName,
          createdAt: new Date().toISOString(),
        })
      }
    })
  }

  // 3. Exécuter les handlers abonnés (non-bloquant)
  const eventHandlers = handlers[eventType] || []
  for (const handler of eventHandlers) {
    try {
      await handler({ ...event, type: eventType, data, context })
    } catch (e) {
      console.warn(`[EventEngine] Handler error for ${eventType}:`, e.message)
    }
  }

  return event
}

/**
 * Récupérer le journal d'événements pour un projet
 * @param {string} projectId
 * @param {number} limit
 * @returns {object[]}
 */
async function getProjectLog(projectId, limit = 50) {
  const prisma = getPrisma()
  return prisma.activity.findMany({
    where: { data: { path: ['_context', 'projectId'], equals: projectId } },
    orderBy: { createdAt: 'desc' },
    take: limit,
  }).catch(() => [])
}

// ── Types d'événements officiels ──
const EVENT_TYPES = {
  // Projet
  PROJECT_CREATED: 'PROJECT_CREATED',
  PROJECT_UPDATED: 'PROJECT_UPDATED',
  PROJECT_PHASE_CHANGED: 'PROJECT_PHASE_CHANGED',
  PROJECT_ARCHIVED: 'PROJECT_ARCHIVED',
  PROJECT_CLOSED: 'PROJECT_CLOSED',
  // Mission
  MISSION_CREATED: 'MISSION_CREATED',
  MISSION_INVITATION_SENT: 'MISSION_INVITATION_SENT',
  MISSION_ACCEPTED: 'MISSION_ACCEPTED',
  MISSION_STARTED: 'MISSION_STARTED',
  MISSION_VALIDATION_REQUESTED: 'MISSION_VALIDATION_REQUESTED',
  MISSION_VALIDATED: 'MISSION_VALIDATED',
  MISSION_COMPLETED: 'MISSION_COMPLETED',
  MISSION_JALON_UPDATED: 'MISSION_JALON_UPDATED',
  // Documents
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  DOCUMENT_VERSION_CREATED: 'DOCUMENT_VERSION_CREATED',
  DOCUMENT_VALIDATED: 'DOCUMENT_VALIDATED',
  DOCUMENT_EXPIRED: 'DOCUMENT_EXPIRED',
  // AO
  AO_CREATED: 'AO_CREATED',
  AO_PUBLISHED: 'AO_PUBLISHED',
  OFFER_SUBMITTED: 'OFFER_SUBMITTED',
  OFFER_ACCEPTED: 'OFFER_ACCEPTED',
  AO_ATTRIBUTED: 'AO_ATTRIBUTED',
  // Marketplace
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_STEP_ADVANCED: 'ORDER_STEP_ADVANCED',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  // CRM
  CONTACT_CREATED: 'CONTACT_CREATED',
  RELATIONSHIP_UPDATED: 'RELATIONSHIP_UPDATED',
  // Communication
  CONVERSATION_CREATED: 'CONVERSATION_CREATED',
  // Utilisateur
  USER_REGISTERED: 'USER_REGISTERED',
  PROFESSIONAL_VERIFIED: 'PROFESSIONAL_VERIFIED',
  // Paiement
  PAYMENT_CREATED: 'PAYMENT_CREATED',
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
}

// ── Auto-alimentation du Knowledge Graph depuis les événements ──
function setupKnowledgeGraphListeners() {
  const prisma = getPrisma()

  on(EVENT_TYPES.PROJECT_CREATED, async (event) => {
    const d = event.data || {}
    await prisma.knowledgeNode.upsert({
      where: { type_refId: { type: 'project', refId: d.projectId || event.context?.projectId || '' } },
      update: { label: d.name || d.nom || 'Projet' },
      create: { type: 'project', refId: d.projectId || event.context?.projectId || '', label: d.name || d.nom || 'Projet' },
    }).catch(() => {})
  })

  on(EVENT_TYPES.MISSION_CREATED, async (event) => {
    const d = event.data || {}
    const missionId = d.missionId || ''
    const projectId = event.context?.projectId || ''
    await prisma.knowledgeNode.upsert({
      where: { type_refId: { type: 'mission', refId: missionId } },
      update: { label: d.title || 'Mission' },
      create: { type: 'mission', refId: missionId, label: d.title || 'Mission' },
    }).catch(() => {})
    if (projectId && missionId) {
      await prisma.knowledgeEdge.create({
        data: { sourceType: 'mission', sourceId: missionId, relation: 'FAIT_PARTIE_DE', targetType: 'project', targetId: projectId },
      }).catch(() => {})
    }
  })

  on(EVENT_TYPES.DOCUMENT_UPLOADED, async (event) => {
    const d = event.data || {}
    const docId = d.documentId || ''
    await prisma.knowledgeNode.upsert({
      where: { type_refId: { type: 'document', refId: docId } },
      update: { label: d.name || 'Document' },
      create: { type: 'document', refId: docId, label: d.name || 'Document' },
    }).catch(() => {})
    if (d.projectId && docId) {
      await prisma.knowledgeEdge.create({
        data: { sourceType: 'document', sourceId: docId, relation: 'ASSOCIE_A', targetType: 'project', targetId: d.projectId },
      }).catch(() => {})
    }
  })
}

module.exports = { on, emit, getProjectLog, EVENT_TYPES, setupKnowledgeGraphListeners }
