const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')

const router = Router()

// ─── GET /api/payment-requests ────────────────────────────────────────────────
// Retourne les demandes créées par le user (pro) + celles pour ses projets (client)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const userId = req.user.id

    // Trouver les projets dont l'utilisateur est membre (pour les clients)
    const memberships = await prisma.projectMember.findMany({
      where: { userId },
      select: { projectId: true },
    })
    const memberProjectIds = memberships.map(m => m.projectId)

    const requests = await prisma.paymentRequest.findMany({
      where: {
        OR: [
          { ownerId: userId },
          ...(memberProjectIds.length > 0 ? [{ projectId: { in: memberProjectIds } }] : []),
        ],
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(requests)
  } catch (e) { next(e) }
})

// ─── POST /api/payment-requests ───────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { projectId, marketId, amount, label, paymentType, createdByName, createdByRole, visibility } = req.body

    const request = await prisma.paymentRequest.create({
      data: {
        projectId:     projectId     || null,
        marketId:      marketId      || null,
        amount:        parseFloat(amount) || 0,
        label:         label         || 'Demande de paiement',
        paymentType:   paymentType   || 'paiement',
        statut:        'pending',
        visibility:    visibility    || 'client_visible',
        createdByName: createdByName || '',
        createdByRole: createdByRole || null,
        ownerId:       req.user.id,
      },
    })
    res.status(201).json(request)
  } catch (e) { next(e) }
})

// ─── PATCH /api/payment-requests/:id ─────────────────────────────────────────
// Approuver / rejeter (côté client) ou mettre à jour (côté pro)
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.paymentRequest.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Demande introuvable' })

    // Seul le créateur ou un membre du projet peut modifier
    const memberships = await prisma.projectMember.findMany({
      where: { userId: req.user.id, projectId: existing.projectId || undefined },
    })
    const isMember = memberships.length > 0
    if (existing.ownerId !== req.user.id && !isMember) {
      return res.status(403).json({ error: 'Non autorisé' })
    }

    const data = {}
    if (req.body.statut !== undefined)        data.statut        = req.body.statut
    if (req.body.respondedBy !== undefined)   data.respondedBy   = req.body.respondedBy
    if (req.body.respondedByRole !== undefined) data.respondedByRole = req.body.respondedByRole
    if (req.body.respondedAt !== undefined)   data.respondedAt   = new Date(req.body.respondedAt)

    const updated = await prisma.paymentRequest.update({ where: { id: req.params.id }, data })
    res.json(updated)
  } catch (e) { next(e) }
})

// ─── DELETE /api/payment-requests/:id ────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.paymentRequest.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Demande introuvable' })
    if (existing.ownerId !== req.user.id) return res.status(403).json({ error: 'Non autorisé' })
    await prisma.paymentRequest.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router
