const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')

const router = Router()

// ─── Introductions ─────────────────────────────────────────────────────────────

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const where = { ownerId: req.user.id }
    if (req.query.projectId) where.projectId = req.query.projectId
    const intros = await prisma.introduction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    res.json(intros)
  } catch (e) { next(e) }
})

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { aoId, projectId, clientId, structureId, structureName, metier, status, source, retainedAt } = req.body
    const intro = await prisma.introduction.create({
      data: {
        aoId:          aoId          || null,
        projectId:     projectId     || null,
        clientId:      clientId      || null,
        structureId:   structureId   || null,
        structureName: structureName || '',
        metier:        metier        || '',
        status:        status        || 'sent',
        source:        source        || 'manual',
        retainedAt:    retainedAt ? new Date(retainedAt) : null,
        ownerId:       req.user.id,
      },
    })
    res.status(201).json(intro)
  } catch (e) { next(e) }
})

router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.introduction.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Introduction introuvable' })
    if (existing.ownerId !== req.user.id) return res.status(403).json({ error: 'Accès non autorisé' })

    const allowed = ['status','retainedAt','structureName','metier']
    const data = {}
    for (const k of allowed) { if (req.body[k] !== undefined) data[k] = k === 'retainedAt' ? new Date(req.body[k]) : req.body[k] }

    const updated = await prisma.introduction.update({ where: { id: req.params.id }, data })
    res.json(updated)
  } catch (e) { next(e) }
})

// ─── Supprimer une introduction ─────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.introduction.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Introduction introuvable' })
    if (existing.ownerId !== req.user.id) return res.status(403).json({ error: 'Accès non autorisé' })
    await prisma.introduction.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

// ─── Commissions ──────────────────────────────────────────────────────────────

router.get('/commissions', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const commissions = await prisma.commission.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })
    res.json(commissions)
  } catch (e) { next(e) }
})

router.post('/commissions', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { introductionId, structureId, structureName, projectId, clientId, montantBase, montantCommission, rate, status } = req.body
    const commission = await prisma.commission.create({
      data: {
        introductionId:    introductionId    || null,
        structureId:       structureId       || null,
        structureName:     structureName     || '',
        projectId:         projectId         || null,
        clientId:          clientId          || null,
        montantBase:       parseFloat(montantBase)       || 0,
        montantCommission: parseFloat(montantCommission) || 0,
        rate:              parseFloat(rate)              || 0.05,
        status:            status            || 'pending',
        ownerId:           req.user.id,
      },
    })
    res.status(201).json(commission)
  } catch (e) { next(e) }
})

router.patch('/commissions/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.commission.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Commission introuvable' })
    if (existing.ownerId !== req.user.id) return res.status(403).json({ error: 'Accès non autorisé' })

    const data = {}
    if (req.body.status !== undefined) data.status = req.body.status

    const updated = await prisma.commission.update({ where: { id: req.params.id }, data })
    res.json(updated)
  } catch (e) { next(e) }
})

module.exports = router
