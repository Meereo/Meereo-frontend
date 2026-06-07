import { Router } from 'express'

/**
 * Payments routes — PaymentOrder escrow workflow
 *
 * Status flow:
 *   PAY_INIT → PAY_PENDING → FUNDS_CONFIRMED → HELD_FOR_MILESTONE
 *   → PAYOUT_REQUESTED → PAYOUT_DONE
 *   Or: any state → DISPUTE_OPEN → (PAYOUT_DONE | REVERSED)
 *
 * Mobile money integrations (Wave, Orange Money, MTN) are stubbed — 501 Not Implemented.
 * Replace stub bodies with real provider SDK calls when API access is available.
 */

const VALID_STATUTS = [
  'PAY_INIT', 'PAY_PENDING', 'FUNDS_CONFIRMED', 'HELD_FOR_MILESTONE',
  'PAYOUT_REQUESTED', 'PAYOUT_DONE', 'DISPUTE_OPEN', 'REVERSED',
]
const VALID_RAILS = ['virement', 'carte', 'mobile_money', 'wave', 'orange_money', 'mtn']

export default function paymentsRouter(prisma) {
  const router = Router()

  // ═══ LIST ═══
  // GET /payments[?projectId=xxx&status=xxx]
  router.get('/', async (req, res) => {
    try {
      const where = {}
      if (req.query.projectId) where.projectId = req.query.projectId
      if (req.query.status) where.status = req.query.status
      if (req.query.marketId) where.marketId = req.query.marketId
      // Users see only their own payment orders
      if (req.userId) where.payerId = req.userId
      const orders = await prisma.paymentOrder.findMany({
        where,
        include: { milestones: { orderBy: { order: 'asc' } }, proofs: true },
        orderBy: { createdAt: 'desc' },
      })
      res.json(orders)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // GET /payments/:id
  router.get('/:id', async (req, res) => {
    try {
      const order = await prisma.paymentOrder.findUnique({
        where: { id: req.params.id },
        include: {
          milestones: { orderBy: { order: 'asc' } },
          proofs: true,
          validations: { orderBy: { createdAt: 'desc' } },
        },
      })
      if (!order) return res.status(404).json({ error: 'Ordre de paiement introuvable' })
      res.json(order)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // ═══ CREATE ═══
  // POST /payments
  router.post('/', async (req, res) => {
    try {
      const { amount, rail, label, projectId, marketId, milestones } = req.body
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ error: 'Montant invalide' })
      }
      if (rail && !VALID_RAILS.includes(rail)) {
        return res.status(400).json({ error: `Rail invalide. Acceptés: ${VALID_RAILS.join(', ')}` })
      }
      const order = await prisma.paymentOrder.create({
        data: {
          amount: parseFloat(amount),
          rail: rail || 'virement',
          label: label || 'Paiement',
          status: 'PAY_INIT',
          projectId: projectId || null,
          marketId: marketId || null,
          payerId: req.userId || null,
          milestones: Array.isArray(milestones) && milestones.length > 0
            ? {
                create: milestones.map((m, i) => ({
                  title: m.title || `Tranche ${i + 1}`,
                  amount: parseFloat(m.amount || 0),
                  order: i,
                  dueAt: m.dueAt ? new Date(m.dueAt) : null,
                  status: 'pending',
                })),
              }
            : undefined,
        },
        include: { milestones: true },
      })
      res.status(201).json(order)
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  // ═══ STATUS WORKFLOW ═══
  // PATCH /payments/:id/status
  router.patch('/:id/status', async (req, res) => {
    try {
      const { status, disputeReason } = req.body
      if (!VALID_STATUTS.includes(status)) {
        return res.status(400).json({ error: `Statut invalide. Acceptés: ${VALID_STATUTS.join(', ')}` })
      }
      const current = await prisma.paymentOrder.findUnique({ where: { id: req.params.id } })
      if (!current) return res.status(404).json({ error: 'Ordre introuvable' })

      const data = { status }
      if (status === 'DISPUTE_OPEN' && disputeReason) data.disputeReason = disputeReason
      if (status === 'PAYOUT_DONE' || status === 'REVERSED') data.resolvedAt = new Date()

      const order = await prisma.paymentOrder.update({ where: { id: req.params.id }, data })
      res.json(order)
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  // ═══ MILESTONES ═══
  // PATCH /payments/:id/milestones/:milestoneId
  router.patch('/:id/milestones/:milestoneId', async (req, res) => {
    try {
      const { status, completedAt } = req.body
      const validMilestoneStatuts = ['pending', 'in_progress', 'completed', 'disputed']
      if (status && !validMilestoneStatuts.includes(status)) {
        return res.status(400).json({ error: `Statut jalón invalide. Acceptés: ${validMilestoneStatuts.join(', ')}` })
      }
      const data = {}
      if (status) data.status = status
      if (status === 'completed') data.completedAt = completedAt ? new Date(completedAt) : new Date()
      const milestone = await prisma.milestone.update({ where: { id: req.params.milestoneId }, data })
      res.json(milestone)
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  // ═══ PROOFS ═══
  // POST /payments/:id/proofs
  router.post('/:id/proofs', async (req, res) => {
    try {
      const { type, url } = req.body
      if (!url) return res.status(400).json({ error: 'URL requis' })
      const validTypes = ['document', 'photo', 'pv', 'bon_livraison']
      if (type && !validTypes.includes(type)) {
        return res.status(400).json({ error: `Type invalide. Acceptés: ${validTypes.join(', ')}` })
      }
      const proof = await prisma.paymentProof.create({
        data: {
          type: type || 'document',
          url,
          paymentOrderId: req.params.id,
          uploadedBy: req.userId || null,
        },
      })
      res.status(201).json(proof)
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  // ═══ VALIDATION ═══
  // POST /payments/:id/validate
  router.post('/:id/validate', async (req, res) => {
    try {
      const { validated, comment } = req.body
      const [validation] = await Promise.all([
        prisma.paymentValidation.create({
          data: {
            validated: Boolean(validated),
            comment: comment || null,
            paymentOrderId: req.params.id,
            validatedBy: req.userId || null,
          },
        }),
        // Auto-advance status when validated
        validated
          ? prisma.paymentOrder.update({ where: { id: req.params.id }, data: { status: 'FUNDS_CONFIRMED' } })
          : Promise.resolve(),
      ])
      res.status(201).json(validation)
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  // ═══ PAYMENT LOGS ═══
  // GET /payments/:id/logs — all proofs + validations for an order
  router.get('/:id/logs', async (req, res) => {
    try {
      const [proofs, validations] = await Promise.all([
        prisma.paymentProof.findMany({ where: { paymentOrderId: req.params.id }, orderBy: { createdAt: 'asc' } }),
        prisma.paymentValidation.findMany({ where: { paymentOrderId: req.params.id }, orderBy: { createdAt: 'asc' } }),
      ])
      res.json({ proofs, validations })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // ═══ MOBILE MONEY STUBS ═══
  // Replace with real provider SDK calls when API credentials are available

  router.post('/initiate/wave', async (_req, res) => {
    // TODO: POST to https://api.wave.com/v1/checkout/sessions with credentials
    res.status(501).json({ error: 'Wave CI API — intégration à venir', provider: 'wave' })
  })

  router.post('/initiate/orange-money', async (_req, res) => {
    // TODO: POST to Orange Money Côte d'Ivoire API
    res.status(501).json({ error: 'Orange Money API — intégration à venir', provider: 'orange_money' })
  })

  router.post('/initiate/mtn', async (_req, res) => {
    // TODO: POST to MTN MoMo API (https://momodeveloper.mtn.com)
    res.status(501).json({ error: 'MTN Mobile Money API — intégration à venir', provider: 'mtn_momo' })
  })

  // POST /payments/webhook — payment provider callback
  router.post('/webhook', async (req, res) => {
    // TODO: verify webhook signature using provider-specific HMAC header
    // Then update PaymentOrder status accordingly
    console.log('[PAYMENTS WEBHOOK]', req.body)
    res.json({ received: true })
  })

  return router
}
