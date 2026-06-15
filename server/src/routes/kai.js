// ─────────────────────────────────────────────────────────────────────────────
//  MEEREO — /api/kai
//  Gestion des entitlements, conversations et mémoire de l'assistant KAI.
// ─────────────────────────────────────────────────────────────────────────────

const { Router } = require('express')
const { requireAuth } = require('../middleware/auth')
const { getPrisma } = require('../db')

const router = Router()
const VALID_ROLES = ['pro', 'client', 'fournisseur']
const MAX_CONVERSATIONS = 20
const MAX_MEMORY = 15

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Retourne ou crée l'entitlement d'un utilisateur pour un rôle donné.
 */
async function upsertEntitlement(prisma, userId, role) {
  return prisma.kaiEntitlement.upsert({
    where: { userId_role: { userId, role } },
    update: {},
    create: { userId, role, tier: 'standard', quotaLimit: 25, quotaUsed: 0 },
  })
}

// ─── Entitlements ─────────────────────────────────────────────────────────────

/**
 * GET /api/kai/entitlements
 * Retourne les 3 entitlements (pro/client/fournisseur) de l'utilisateur.
 */
router.get('/entitlements', requireAuth, async (req, res) => {
  const prisma = getPrisma()
  try {
    // Upsert les 3 rôles pour garantir qu'ils existent toujours
    const rows = await Promise.all(
      VALID_ROLES.map(role => upsertEntitlement(prisma, req.user.id, role))
    )
    res.json(rows)
  } catch (e) {
    console.error('[KAI] GET /entitlements', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

/**
 * PATCH /api/kai/entitlements/:role
 * Met à jour un entitlement (quotaUsed, tier, dates, onboardingDone).
 * Seuls les champs autorisés sont acceptés.
 */
router.patch('/entitlements/:role', requireAuth, async (req, res) => {
  const { role } = req.params
  if (!VALID_ROLES.includes(role)) {
    return res.status(400).json({ error: `Rôle invalide. Valeurs acceptées : ${VALID_ROLES.join(', ')}` })
  }

  const prisma = getPrisma()
  const { quotaUsed, tier, quotaLimit, goldStartDate, goldEndDate, onboardingDone, incrementQuota } = req.body

  try {
    // S'assurer que la ligne existe
    await upsertEntitlement(prisma, req.user.id, role)

    const data = {}
    if (incrementQuota === true) {
      // Incrément atomique du compteur de quota
      const updated = await prisma.kaiEntitlement.update({
        where: { userId_role: { userId: req.user.id, role } },
        data: { quotaUsed: { increment: 1 } },
      })
      return res.json(updated)
    }
    if (typeof quotaUsed === 'number') data.quotaUsed = quotaUsed
    if (typeof quotaLimit === 'number') data.quotaLimit = quotaLimit
    if (tier && ['standard', 'gold'].includes(tier)) data.tier = tier
    if (goldStartDate !== undefined) data.goldStartDate = goldStartDate ? new Date(goldStartDate) : null
    if (goldEndDate !== undefined) data.goldEndDate = goldEndDate ? new Date(goldEndDate) : null
    if (typeof onboardingDone === 'boolean') data.onboardingDone = onboardingDone

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: 'Aucun champ valide fourni' })
    }

    const updated = await prisma.kaiEntitlement.update({
      where: { userId_role: { userId: req.user.id, role } },
      data,
    })
    res.json(updated)
  } catch (e) {
    console.error('[KAI] PATCH /entitlements/:role', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ─── Conversations ─────────────────────────────────────────────────────────────

/**
 * GET /api/kai/conversations?context=pro
 * Retourne les conversations de l'utilisateur, triées par updatedAt desc.
 */
router.get('/conversations', requireAuth, async (req, res) => {
  const prisma = getPrisma()
  const { context } = req.query
  try {
    const where = { userId: req.user.id }
    if (context && VALID_ROLES.includes(context)) where.context = context
    const rows = await prisma.kaiConversation.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: MAX_CONVERSATIONS,
    })
    res.json(rows)
  } catch (e) {
    console.error('[KAI] GET /conversations', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

/**
 * PUT /api/kai/conversations/:id
 * Crée ou met à jour une conversation.
 * Body: { context, title, messages, topic }
 */
router.put('/conversations/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const { context, title, messages, topic } = req.body

  if (!context || !VALID_ROLES.includes(context)) {
    return res.status(400).json({ error: 'context requis (pro|client|fournisseur)' })
  }

  const prisma = getPrisma()
  try {
    const row = await prisma.kaiConversation.upsert({
      where: { id },
      update: {
        title: title || '',
        messages: messages || [],
        topic: topic || null,
        updatedAt: new Date(),
      },
      create: {
        id,
        userId: req.user.id,
        context,
        title: title || '',
        messages: messages || [],
        topic: topic || null,
      },
    })

    // Purger les conversations les plus anciennes au-delà de MAX_CONVERSATIONS
    const all = await prisma.kaiConversation.findMany({
      where: { userId: req.user.id, context },
      orderBy: { updatedAt: 'desc' },
      select: { id: true },
    })
    if (all.length > MAX_CONVERSATIONS) {
      const toDelete = all.slice(MAX_CONVERSATIONS).map(c => c.id)
      await prisma.kaiConversation.deleteMany({ where: { id: { in: toDelete } } })
    }

    res.json(row)
  } catch (e) {
    console.error('[KAI] PUT /conversations/:id', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

/**
 * DELETE /api/kai/conversations/:id
 */
router.delete('/conversations/:id', requireAuth, async (req, res) => {
  const prisma = getPrisma()
  try {
    const existing = await prisma.kaiConversation.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    })
    if (!existing) return res.status(404).json({ error: 'Conversation introuvable' })
    await prisma.kaiConversation.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  } catch (e) {
    console.error('[KAI] DELETE /conversations/:id', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ─── Memory ─────────────────────────────────────────────────────────────────

/**
 * GET /api/kai/memory
 * Retourne les sujets mémorisés par l'assistant pour cet utilisateur.
 */
router.get('/memory', requireAuth, async (req, res) => {
  const prisma = getPrisma()
  try {
    const rows = await prisma.kaiMemory.findMany({
      where: { userId: req.user.id },
      orderBy: { lastDiscussed: 'desc' },
      take: MAX_MEMORY,
    })
    res.json(rows)
  } catch (e) {
    console.error('[KAI] GET /memory', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

/**
 * PUT /api/kai/memory
 * Crée ou met à jour une entrée mémoire.
 * Body: { topic, context }
 */
router.put('/memory', requireAuth, async (req, res) => {
  const { topic, context } = req.body
  if (!topic || !context || !VALID_ROLES.includes(context)) {
    return res.status(400).json({ error: 'topic et context (pro|client|fournisseur) requis' })
  }

  const prisma = getPrisma()
  try {
    const row = await prisma.kaiMemory.upsert({
      where: { userId_topic_context: { userId: req.user.id, topic, context } },
      update: { lastDiscussed: new Date() },
      create: { userId: req.user.id, topic, context },
    })

    // Garder seulement MAX_MEMORY entrées — purger les plus anciennes
    const all = await prisma.kaiMemory.findMany({
      where: { userId: req.user.id },
      orderBy: { lastDiscussed: 'desc' },
      select: { id: true },
    })
    if (all.length > MAX_MEMORY) {
      const toDelete = all.slice(MAX_MEMORY).map(m => m.id)
      await prisma.kaiMemory.deleteMany({ where: { id: { in: toDelete } } })
    }

    res.json(row)
  } catch (e) {
    console.error('[KAI] PUT /memory', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

module.exports = router
