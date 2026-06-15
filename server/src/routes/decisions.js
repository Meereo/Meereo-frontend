const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')

const router = Router()

// ─── GET /api/decisions ───────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const where = { createdBy: req.user.id }
    if (req.query.projectId) where.projectId = req.query.projectId

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
    const allowed = ['titre', 'description', 'statut', 'projectId']
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
    await prisma.decision.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router
