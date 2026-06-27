// ─────────────────────────────────────────────────────────────────────────────
//  MEEREO — /api/payments
//  Ordres de paiement avec jalons, preuves et validations (PostgreSQL).
// ─────────────────────────────────────────────────────────────────────────────

const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')
const { randomUUID } = require('crypto')

const router = Router()

// ─── GET /api/payments ────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const where = { ownerId: req.user.id }
    if (req.query.projectId) where.projectId = req.query.projectId
    if (req.query.marketId)  where.marketId  = req.query.marketId
    res.json(await prisma.paymentOrder.findMany({ where, orderBy: { createdAt: 'desc' } }))
  } catch (e) { next(e) }
})

// ─── GET /api/payments/:id ────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const item = await prisma.paymentOrder.findUnique({ where: { id: req.params.id } })
    if (!item || item.ownerId !== req.user.id) throw createError('Non trouvé', 404)
    res.json(item)
  } catch (e) { next(e) }
})

// ─── POST /api/payments ───────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { label, amount, rail, projectId, marketId, milestones } = req.body

    const resolvedMilestones = Array.isArray(milestones)
      ? milestones.map(m => ({
          id:     randomUUID(),
          title:  m.title  || '',
          amount: parseFloat(m.amount) || 0,
          status: 'pending',
        }))
      : []

    const item = await prisma.paymentOrder.create({
      data: {
        label:      label     || '',
        amount:     parseFloat(amount) || 0,
        rail:       rail      || 'virement',
        status:     'PAY_INIT',
        projectId:  projectId || null,
        marketId:   marketId  || null,
        milestones: resolvedMilestones,
        ownerId:    req.user.id,
      },
    })
    res.status(201).json(item)
  } catch (e) { next(e) }
})

// ─── PATCH /api/payments/:id ──────────────────────────────────────────────────
// Supporte : { status } | { milestoneId, milestoneData } | { addProof } | { addValidation }
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.paymentOrder.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.ownerId !== req.user.id) throw createError('Non autorisé', 403)

    const data = {}

    if (req.body.status !== undefined) {
      data.status = req.body.status
    }

    if (req.body.milestoneId && req.body.milestoneData) {
      const milestones = Array.isArray(existing.milestones) ? existing.milestones : []
      data.milestones = milestones.map(m =>
        m.id === req.body.milestoneId ? { ...m, ...req.body.milestoneData } : m
      )
    }

    if (req.body.addProof) {
      const proofs = Array.isArray(existing.proofs) ? existing.proofs : []
      data.proofs = [...proofs, { id: randomUUID(), createdAt: new Date().toISOString(), ...req.body.addProof }]
    }

    if (req.body.addValidation) {
      const validations = Array.isArray(existing.validations) ? existing.validations : []
      data.validations = [...validations, { id: randomUUID(), createdAt: new Date().toISOString(), ...req.body.addValidation }]
    }

    if (Object.keys(data).length === 0) throw createError('Aucune modification', 400)

    res.json(await prisma.paymentOrder.update({ where: { id: req.params.id }, data }))
  } catch (e) { next(e) }
})

// ─── DELETE /api/payments/:id ─────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.paymentOrder.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.ownerId !== req.user.id) throw createError('Non autorisé', 403)
    await prisma.paymentOrder.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

// ─── GET /api/payments/:id/logs ───────────────────────────────────────────────
router.get('/:id/logs', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const item = await prisma.paymentOrder.findUnique({ where: { id: req.params.id } })
    if (!item || item.ownerId !== req.user.id) throw createError('Non trouvé', 404)
    res.json({ proofs: item.proofs || [], validations: item.validations || [] })
  } catch (e) { next(e) }
})

module.exports = router
