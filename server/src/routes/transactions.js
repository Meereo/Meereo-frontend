const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')

const router = Router()

// ─── GET /api/transactions ────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const where = { ownerId: req.user.id }
    if (req.query.projectId) where.projectId = req.query.projectId
    if (req.query.marketId)  where.marketId  = req.query.marketId
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 500,
    })
    res.json(transactions)
  } catch (e) { next(e) }
})

// ─── POST /api/transactions ───────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { type, label, montant, statut, projectId, marketId, fromUserId, toUserId, fromRole, toRole } = req.body
    const tx = await prisma.transaction.create({
      data: {
        type:       type       || 'payment',
        label:      label      || '',
        montant:    parseFloat(montant) || 0,
        statut:     statut     || 'pending',
        projectId:  projectId  || null,
        marketId:   marketId   || null,
        fromUserId: fromUserId || null,
        toUserId:   toUserId   || null,
        fromRole:   fromRole   || null,
        toRole:     toRole     || null,
        ownerId:    req.user.id,
      },
    })
    res.status(201).json(tx)
  } catch (e) { next(e) }
})

// ─── PATCH /api/transactions/:id ─────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.transaction.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Transaction introuvable' })
    if (existing.ownerId !== req.user.id) return res.status(403).json({ error: 'Accès non autorisé' })

    const data = {}
    if (req.body.statut  !== undefined) data.statut  = req.body.statut
    if (req.body.label   !== undefined) data.label   = req.body.label
    if (req.body.montant !== undefined) data.montant = parseFloat(req.body.montant) || 0

    const updated = await prisma.transaction.update({ where: { id: req.params.id }, data })
    res.json(updated)
  } catch (e) { next(e) }
})

// ─── DELETE /api/transactions/:id ─────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.transaction.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Transaction introuvable' })
    if (existing.ownerId !== req.user.id) return res.status(403).json({ error: 'Accès non autorisé' })
    await prisma.transaction.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router
