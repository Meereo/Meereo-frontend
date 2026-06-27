const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')

const router = Router()

// ─── GET /api/events ──────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const where = { createdBy: req.user.id }
    if (req.query.projectId) where.projectId = req.query.projectId

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: 'asc' },
    })
    res.json(events)
  } catch (e) { next(e) }
})

// ─── POST /api/events ─────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { titre, date, type, description, color, auto, projectId } = req.body
    if (!titre) throw createError('titre requis', 400)
    if (!date)  throw createError('date requise', 400)

    // Verify projectId exists if provided — frontend may send local-only IDs
    const resolvedProjectId = projectId
      ? (await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } }))?.id || null
      : null

    const event = await prisma.event.create({
      data: {
        titre,
        date,
        type:        type        || 'event',
        description: description || '',
        color:       color       || '#2563EB',
        auto:        auto        || false,
        projectId:   resolvedProjectId,
        createdBy:   req.user.id,
      },
    })
    res.status(201).json(event)
  } catch (e) { next(e) }
})

// ─── PATCH /api/events/:id ────────────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const event = await prisma.event.findUnique({ where: { id: req.params.id } })
    if (!event) throw createError('Événement introuvable', 404)
    if (event.createdBy !== req.user.id) throw createError('Accès non autorisé', 403)
    const allowed = ['titre', 'date', 'type', 'description', 'color', 'auto', 'projectId']
    const data = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key]
    }
    const updated = await prisma.event.update({ where: { id: req.params.id }, data })
    res.json(updated)
  } catch (e) { next(e) }
})

// ─── DELETE /api/events/:id ───────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const event = await prisma.event.findUnique({ where: { id: req.params.id } })
    if (!event) throw createError('Événement introuvable', 404)
    if (event.createdBy !== req.user.id) throw createError('Accès non autorisé', 403)
    await prisma.event.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router
