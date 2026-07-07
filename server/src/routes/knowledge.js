const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')

const router = Router()

// ─── GET /api/knowledge/graph/:projectId — sous-graphe d'un projet ──────────
router.get('/graph/:projectId', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const projectId = req.params.projectId

    // Récupérer le nœud projet
    const projectNode = await prisma.knowledgeNode.findUnique({
      where: { type_refId: { type: 'project', refId: projectId } },
    })

    // Récupérer toutes les relations du projet
    const edges = await prisma.knowledgeEdge.findMany({
      where: { OR: [
        { sourceType: 'project', sourceId: projectId },
        { targetType: 'project', targetId: projectId },
      ] },
    })

    // Collecter tous les refIds liés
    const linkedIds = new Set()
    edges.forEach(e => {
      linkedIds.add(`${e.sourceType}:${e.sourceId}`)
      linkedIds.add(`${e.targetType}:${e.targetId}`)
    })

    // Récupérer les nœuds liés
    const nodeQueries = [...linkedIds].map(key => {
      const [type, refId] = key.split(':')
      return { type, refId }
    })

    const nodes = await prisma.knowledgeNode.findMany({
      where: { OR: nodeQueries.length > 0 ? nodeQueries.map(q => ({ type: q.type, refId: q.refId })) : [{ id: 'none' }] },
    })

    res.json({
      projectNode,
      nodes: projectNode ? [projectNode, ...nodes.filter(n => n.id !== projectNode?.id)] : nodes,
      edges,
    })
  } catch (e) { next(e) }
})

// ─── GET /api/knowledge/node/:type/:refId — nœud + ses relations ────────────
router.get('/node/:type/:refId', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { type, refId } = req.params

    const node = await prisma.knowledgeNode.findUnique({
      where: { type_refId: { type, refId } },
    })
    if (!node) throw createError('Nœud introuvable', 404)

    const edges = await prisma.knowledgeEdge.findMany({
      where: { OR: [
        { sourceType: type, sourceId: refId },
        { targetType: type, targetId: refId },
      ] },
    })

    // Récupérer les nœuds liés
    const linkedKeys = edges.map(e =>
      e.sourceType === type && e.sourceId === refId
        ? { type: e.targetType, refId: e.targetId }
        : { type: e.sourceType, refId: e.sourceId }
    )

    const linkedNodes = linkedKeys.length > 0
      ? await prisma.knowledgeNode.findMany({ where: { OR: linkedKeys } })
      : []

    res.json({ node, edges, linkedNodes })
  } catch (e) { next(e) }
})

// ─── GET /api/knowledge/search?query= — recherche dans le graphe ────────────
router.get('/search', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { query, type } = req.query
    if (!query) throw createError('query requis', 400)

    const where = { label: { contains: query, mode: 'insensitive' } }
    if (type) where.type = type

    const nodes = await prisma.knowledgeNode.findMany({
      where,
      take: 50,
      orderBy: { createdAt: 'desc' },
    })

    // Pour chaque nœud, compter les relations
    const enriched = await Promise.all(nodes.map(async (node) => {
      const edgeCount = await prisma.knowledgeEdge.count({
        where: { OR: [
          { sourceType: node.type, sourceId: node.refId },
          { targetType: node.type, targetId: node.refId },
        ] },
      })
      return { ...node, edgeCount }
    }))

    res.json(enriched)
  } catch (e) { next(e) }
})

// ─── POST /api/knowledge/node — créer un nœud ──────────────────────────────
router.post('/node', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { type, refId, label, metadata } = req.body
    if (!type || !refId || !label) throw createError('type, refId et label requis', 400)

    const node = await prisma.knowledgeNode.upsert({
      where: { type_refId: { type, refId } },
      update: { label, metadata: metadata || {} },
      create: { type, refId, label, metadata: metadata || {} },
    })
    res.status(201).json(node)
  } catch (e) { next(e) }
})

// ─── POST /api/knowledge/edge — créer une relation ──────────────────────────
router.post('/edge', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { sourceType, sourceId, relation, targetType, targetId, metadata } = req.body
    if (!sourceType || !sourceId || !relation || !targetType || !targetId) {
      throw createError('sourceType, sourceId, relation, targetType, targetId requis', 400)
    }

    // Vérifier que la relation n'existe pas déjà
    const existing = await prisma.knowledgeEdge.findFirst({
      where: { sourceType, sourceId, relation, targetType, targetId },
    })
    if (existing) return res.json(existing)

    const edge = await prisma.knowledgeEdge.create({
      data: { sourceType, sourceId, relation, targetType, targetId, metadata: metadata || {} },
    })
    res.status(201).json(edge)
  } catch (e) { next(e) }
})

module.exports = router
