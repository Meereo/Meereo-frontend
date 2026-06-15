const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')

const router = Router()

// ─── GET /api/documents ───────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const where = { userId: req.user.id }
    if (req.query.projectId) where.projectId = req.query.projectId

    const docs = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    res.json(docs)
  } catch (e) { next(e) }
})

// ─── POST /api/documents ──────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { name, type, url, projectId } = req.body
    if (!name) throw createError('name requis', 400)

    const doc = await prisma.document.create({
      data: {
        name,
        type:      type      || '',
        url:       url       || '',
        projectId: projectId || null,
        userId:    req.user.id,
      },
    })
    res.status(201).json(doc)
  } catch (e) { next(e) }
})

// ─── DELETE /api/documents/:id ────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const doc = await prisma.document.findUnique({ where: { id: req.params.id } })
    if (!doc) throw createError('Document introuvable', 404)
    if (doc.userId !== req.user.id) throw createError('Accès non autorisé', 403)
    await prisma.document.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router
