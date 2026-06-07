import { Router } from 'express'

/**
 * Allowed fields per entity — whitelist of fields that can be written via CRUD.
 * Fields not listed here are silently stripped from the request body.
 * This prevents injection of arbitrary fields (e.g. `role`, `password`, `id`).
 */
const ENTITY_FIELDS = {
  project:       ['nom', 'type', 'phase', 'budget', 'adresse', 'livraison', 'priorite', 'description', 'avancement', 'status', 'kanbanStatus', 'img', 'client', 'clientEmail', 'clientId', 'sourceAoId', 'etapes', 'equipe', 'color', 'ownerId'],
  aO:            ['title', 'description', 'budget', 'lot', 'status', 'projectId', 'ownerUserId', 'ownerProfileType', 'requestedTrade', 'visibilityScope', 'createdByClient'],
  offer:         ['titre', 'entreprise', 'montant', 'delai', 'statut', 'aoId', 'userId', 'supplierId', 'supplierRole', 'message', 'note', 'lot', 'acceptedBy', 'acceptedAt'],
  market:        ['titre', 'entreprise', 'lot', 'montant', 'statut', 'avancement', 'projectId', 'offerId', 'aoId', 'clientId', 'supplierId', 'delai', 'description'],
  document:      ['name', 'type', 'url', 'projectId', 'userId'],
  task:          ['title', 'description', 'status', 'priority', 'progress', 'dueDate', 'projectId', 'marketId', 'assignedTo', 'validatedBy', 'validatedAt', 'rejectedBy', 'rejectedAt', 'comment'],
  paymentOrder:  ['amount', 'status', 'rail', 'label', 'disputeReason', 'projectId', 'marketId', 'payerId'],
  milestone:     ['title', 'amount', 'status', 'order', 'marketId', 'paymentOrderId', 'dueAt', 'completedAt'],
  event:         ['titre', 'date', 'type', 'projectId', 'color', 'heure'],
  decision:      ['titre', 'desc', 'statut', 'urgent', 'projectId', 'visibility'],
  product:       ['name', 'category', 'price', 'unit', 'photoUrl', 'userId', 'description'],
  commande:      ['reference', 'statut', 'total', 'userId', 'projectId'],
  fournisseur:   ['nom', 'email', 'tel', 'ville', 'specialite', 'statut'],
  rapport:       ['titre', 'type', 'contenu', 'projectId', 'userId'],
  transaction:   ['type', 'label', 'montant', 'statut', 'projectId', 'marketId', 'userId'],
  notification:  ['msg', 'type', 'role', 'userId'],
  activity:      ['action', 'data', 'userId'],
  conversation:  ['title', 'projectId', 'aoId', 'offerId', 'marketId', 'participants', 'lastMessage', 'lastAt'],
  message:       ['contenu', 'conversationId', 'userId'],
  client:        ['nom', 'email', 'tel', 'ville', 'projectId'],
  intervenant:   ['nom', 'role', 'specialite', 'email', 'tel', 'projectId'],
  projectMember: ['projectId', 'userId', 'role', 'userName', 'userEmail'],
  user:          ['email', 'name', 'type', 'company', 'phone', 'avatar', 'metier', 'ville'],
  introduction:  ['projectId', 'clientId', 'structureId', 'structureName', 'metier', 'status', 'source'],
  commission:    ['introductionId', 'structureId', 'structureName', 'projectId', 'clientId', 'montantBase', 'montantCommission', 'rate', 'status'],
  photo:         ['url', 'caption', 'projectId', 'userId'],
}

/**
 * Sanitize request body: only allow whitelisted fields.
 * @param {string} modelName - Prisma model name (e.g. 'project')
 * @param {object} body - raw request body
 * @returns {object} sanitized body
 */
function sanitize(modelName, body) {
  const allowed = ENTITY_FIELDS[modelName]
  if (!allowed) return body // fallback: no whitelist defined → pass through
  const clean = {}
  for (const key of allowed) {
    if (body[key] !== undefined) clean[key] = body[key]
  }
  return clean
}

/**
 * Creates a generic CRUD router for any Prisma model.
 * @param {object} model - Prisma model (e.g. prisma.project)
 * @param {object} options - { exclude: ['password'], modelName: 'project', scopeByUser: 'ownerId' | ['ownerId','clientId'] | null }
 *
 * scopeByUser: if set, getAll() filters results so the user only sees their own data.
 *   - string: single field to match (e.g. 'userId')
 *   - array: OR filter across multiple fields (e.g. ['ownerId', 'clientId'])
 *   - null/undefined: no filtering (public data or shared data)
 */
export function createCrudRouter(model, options = {}) {
  const router = Router()
  const excludeFields = options.exclude || []
  const modelName = options.modelName || null
  const scopeByUser = options.scopeByUser || null

  // Strip excluded fields from response
  const clean = (item) => {
    if (!item || excludeFields.length === 0) return item
    const copy = { ...item }
    excludeFields.forEach(f => delete copy[f])
    return copy
  }
  const cleanAll = (items) => items.map(clean)

  /**
   * Build Prisma where clause for user scoping.
   * Returns {} if no scoping (user sees everything) or no userId (dev mode).
   */
  const buildUserScope = (req) => {
    if (!scopeByUser || !req.userId) return {}
    if (typeof scopeByUser === 'string') {
      return { [scopeByUser]: req.userId }
    }
    if (Array.isArray(scopeByUser)) {
      // OR across multiple fields: user is owner OR client OR member
      return { OR: scopeByUser.map(field => ({ [field]: req.userId })) }
    }
    return {}
  }

  // List all (scoped by user if configured)
  router.get('/', async (req, res) => {
    try {
      const where = buildUserScope(req)
      const items = await model.findMany({ where, orderBy: { createdAt: 'desc' } })
      res.json(cleanAll(items))
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // Get by ID
  router.get('/:id', async (req, res) => {
    try {
      const item = await model.findUnique({ where: { id: req.params.id } })
      if (!item) return res.status(404).json({ error: 'Not found' })
      res.json(clean(item))
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // Create — validate body
  router.post('/', async (req, res) => {
    try {
      const data = modelName ? sanitize(modelName, req.body) : req.body
      if (Object.keys(data).length === 0) return res.status(400).json({ error: 'Corps de requête vide ou invalide' })
      const item = await model.create({ data })
      res.status(201).json(clean(item))
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  // Update — validate body
  router.put('/:id', async (req, res) => {
    try {
      const data = modelName ? sanitize(modelName, req.body) : req.body
      if (Object.keys(data).length === 0) return res.status(400).json({ error: 'Corps de requête vide ou invalide' })
      const item = await model.update({ where: { id: req.params.id }, data })
      res.json(clean(item))
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  // Delete
  router.delete('/:id', async (req, res) => {
    try {
      await model.delete({ where: { id: req.params.id } })
      res.status(204).end()
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  return router
}
