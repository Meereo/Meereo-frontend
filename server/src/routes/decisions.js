const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')

const router = Router()

// ─── GET /api/decisions ───────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    // Retourner les décisions créées par le user ET celles des projets dont il est membre
    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.user.id },
      select: { projectId: true },
    })
    const projectIds = memberships.map(m => m.projectId)

    const where = req.query.projectId
      ? { projectId: req.query.projectId }
      : { OR: [
          { createdBy: req.user.id },
          { projectId: { in: projectIds } },
        ] }

    const decisions = await prisma.decision.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    res.json(decisions)
  } catch (e) { next(e) }
})

// ─── POST /api/decisions ──────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { titre, description, statut, projectId } = req.body
    if (!titre) throw createError('titre requis', 400)

    const decision = await prisma.decision.create({
      data: {
        titre,
        description: description || '',
        statut:      statut      || 'en_attente',
        projectId:   projectId   || null,
        createdBy:   req.user.id,
      },
    })
    res.status(201).json(decision)
  } catch (e) { next(e) }
})

// ─── PATCH /api/decisions/:id ─────────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const decision = await prisma.decision.findUnique({ where: { id: req.params.id } })
    if (!decision) throw createError('Décision introuvable', 404)
    // Le créateur peut tout modifier ; le client désigné peut changer le statut
    if (decision.createdBy !== req.user.id) {
      // Autoriser uniquement la mise à jour du statut par un user tiers (client qui répond)
      const allowedForClient = ['statut', 'respondedBy', 'respondedByRole', 'respondedAt']
      const hasUnauthorizedField = Object.keys(req.body).some(k => !allowedForClient.includes(k))
      if (hasUnauthorizedField) throw createError('Non autorisé', 403)
    }
    const allowed = ['titre', 'description', 'statut', 'projectId', 'urgent', 'visibility', 'respondedBy', 'respondedByRole', 'respondedAt']
    const data = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key]
    }
    const updated = await prisma.decision.update({ where: { id: req.params.id }, data })
    res.json(updated)
  } catch (e) { next(e) }
})

// ─── DELETE /api/decisions/:id ────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const decision = await prisma.decision.findUnique({ where: { id: req.params.id } })
    if (!decision) throw createError('Décision introuvable', 404)
    if (decision.createdBy !== req.user.id) throw createError('Non autorisé', 403)
    await prisma.decision.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router
