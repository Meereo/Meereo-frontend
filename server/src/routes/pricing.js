/**
 * FIN-02/03 — Routes de gestion des tarifs et abonnements
 *
 * Les tarifs sont configurables en back-office (PricingConfig), jamais codés en dur.
 * Seuls les tarifs KAi Pro sont ACTÉS (v1.25). Les autres sont des hypothèses à tester.
 */

const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')

const router = Router()

// ─── Tarifs par défaut (seed initial) — FIN-03 v1.25 ─────────────────────────
const DEFAULT_PRICING = [
  // KAi Pro — ACTÉS
  { key: 'kai_pro_client',       label: 'KAi Pro — Client',        amount: 9900,  interval: 'month' },
  { key: 'kai_pro_pro',          label: 'KAi Pro — Professionnel',  amount: 19900, interval: 'month' },
  { key: 'kai_pro_fournisseur',  label: 'KAi Pro — Fournisseur',    amount: 39000, interval: 'month' },
  // Hypothèses à tester — configurables
  { key: 'quota_product',        label: 'Forfait produit supplémentaire', amount: 2000, interval: 'month' },
  { key: 'flash_sale',           label: 'Vente flash (48-72h)',     amount: 15000, interval: 'one_time' },
  { key: 'sponsoring_product',   label: 'Sponsoring produit / mois', amount: 25000, interval: 'month' },
  { key: 'pack_visibility',      label: 'Pack visibilité',          amount: 75000, interval: 'month' },
  { key: 'abonnement_fournisseur', label: 'Abonnement fournisseur', amount: 20000, interval: 'month' },
]

// ─── GET /api/pricing — liste des tarifs (public) ────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const prisma = getPrisma()
    let configs = await prisma.pricingConfig.findMany({
      where: { isActive: true },
      orderBy: { key: 'asc' },
    })

    // Seed initial si la table est vide
    if (configs.length === 0) {
      for (const p of DEFAULT_PRICING) {
        await prisma.pricingConfig.upsert({
          where: { key: p.key },
          update: {},
          create: { ...p, currency: 'XOF' },
        }).catch(() => {})
      }
      configs = await prisma.pricingConfig.findMany({
        where: { isActive: true },
        orderBy: { key: 'asc' },
      })
    }

    res.json(configs)
  } catch (e) { next(e) }
})

// ─── PATCH /api/pricing/:key — admin modifie un tarif ────────────────────────
router.patch('/:key', requireAuth, async (req, res, next) => {
  try {
    // Vérifier admin
    if (req.user.role !== 'admin') throw createError('Accès admin requis', 403)

    const prisma = getPrisma()
    const { amount, label, isActive, interval, metadata } = req.body
    const data = {}
    if (amount !== undefined) data.amount = Number(amount)
    if (label !== undefined) data.label = label
    if (isActive !== undefined) data.isActive = Boolean(isActive)
    if (interval !== undefined) data.interval = interval
    if (metadata !== undefined) data.metadata = metadata

    const updated = await prisma.pricingConfig.update({
      where: { key: req.params.key },
      data,
    })
    res.json(updated)
  } catch (e) { next(e) }
})

// ─── GET /api/subscriptions/me — abonnements de l'utilisateur ────────────────
router.get('/subscriptions/me', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const subs = await prisma.subscription.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })
    res.json(subs)
  } catch (e) { next(e) }
})

// ─── POST /api/subscriptions — souscrire un abonnement ──────────────────────
router.post('/subscriptions', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { planKey, paymentMethod, paymentRef } = req.body
    if (!planKey) throw createError('planKey requis', 400)

    // Vérifier que le tarif existe
    const plan = await prisma.pricingConfig.findUnique({ where: { key: planKey } })
    if (!plan || !plan.isActive) throw createError('Tarif introuvable ou inactif', 404)

    // Vérifier qu'il n'a pas déjà un abonnement actif pour ce plan
    const existing = await prisma.subscription.findFirst({
      where: { userId: req.user.id, planKey, status: 'active' },
    })
    if (existing) throw createError('Abonnement déjà actif pour ce plan', 409)

    // Calculer la date de renouvellement
    const now = new Date()
    let renewalDate = null
    if (plan.interval === 'month') {
      renewalDate = new Date(now)
      renewalDate.setMonth(renewalDate.getMonth() + 1)
    } else if (plan.interval === 'year') {
      renewalDate = new Date(now)
      renewalDate.setFullYear(renewalDate.getFullYear() + 1)
    }

    const sub = await prisma.subscription.create({
      data: {
        userId: req.user.id,
        planKey,
        amount: plan.amount,
        paymentMethod: paymentMethod || null,
        paymentRef: paymentRef || null,
        renewalDate,
        status: 'active',
      },
    })

    res.status(201).json(sub)
  } catch (e) { next(e) }
})

// ─── PATCH /api/subscriptions/:id/cancel — résilier un abonnement ────────────
router.patch('/subscriptions/:id/cancel', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const sub = await prisma.subscription.findUnique({ where: { id: req.params.id } })
    if (!sub) throw createError('Abonnement introuvable', 404)
    if (sub.userId !== req.user.id) throw createError('Non autorisé', 403)

    const updated = await prisma.subscription.update({
      where: { id: req.params.id },
      data: { status: 'cancelled', cancelledAt: new Date() },
    })
    res.json(updated)
  } catch (e) { next(e) }
})

module.exports = router
