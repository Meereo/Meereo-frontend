const { Router } = require('express')
const { requireAuth } = require('../middleware/auth')
const { getPrisma } = require('../db')

const router = Router()

// ─── Lister les conversations de l'utilisateur connecté ──────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const userId = req.user.id

    const participations = await prisma.conversationParticipant.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            participants: {
              include: { user: { select: { id: true, name: true, email: true, type: true, publicId: true } } },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: { sender: { select: { id: true, name: true } } },
            },
          },
        },
      },
      orderBy: { conversation: { updatedAt: 'desc' } },
    })

    const conversations = participations.map((p) => {
      const c = p.conversation
      const lastMsg = c.messages[0] || null
      // Compter les non-lus : messages après lastReadAt
      const lastReadAt = p.lastReadAt
      return {
        id: c.id,
        title: c.title,
        isGroup: c.isGroup,
        aoId: c.aoId,
        offerId: c.offerId,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        participants: c.participants.map((pp) => pp.user),
        lastMessage: lastMsg
          ? { id: lastMsg.id, text: lastMsg.text, type: lastMsg.type, senderId: lastMsg.senderId, senderName: lastMsg.sender.name, createdAt: lastMsg.createdAt }
          : null,
        lastReadAt: lastReadAt,
      }
    })

    res.json(conversations)
  } catch (err) {
    next(err)
  }
})

// ─── Créer ou retrouver une conversation 1:1 ─────────────────────────────────
// POST /api/conversations
// Body: { participantId } pour 1:1 ou { participantIds[], title } pour groupe
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const myId = req.user.id
    const { participantId, participantIds, title, aoId, offerId } = req.body

    if (participantId) {
      // ─── 1:1 : chercher si elle existe déjà ───────────────────────────────
      const existing = await prisma.conversation.findFirst({
        where: {
          isGroup: false,
          participants: {
            every: { userId: { in: [myId, participantId] } },
          },
          AND: [
            { participants: { some: { userId: myId } } },
            { participants: { some: { userId: participantId } } },
          ],
        },
        include: {
          participants: {
            include: { user: { select: { id: true, name: true, email: true, type: true, publicId: true } } },
          },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      })

      if (existing) {
        return res.json({ conversation: existing, created: false })
      }

      // Créer la conversation
      let conv
      try {
        conv = await prisma.conversation.create({
          data: {
            isGroup: false,
            aoId: aoId || null,
            offerId: offerId || null,
            participants: {
              create: [
                { userId: myId },
                { userId: participantId },
              ],
            },
          },
          include: {
            participants: {
              include: { user: { select: { id: true, name: true, email: true, type: true, publicId: true } } },
            },
            messages: true,
          },
        })
      } catch (e) {
        // Race condition: another request created the conversation simultaneously
        if (e.code === 'P2002') {
          const race = await prisma.conversation.findFirst({
            where: {
              isGroup: false,
              AND: [
                { participants: { some: { userId: myId } } },
                { participants: { some: { userId: participantId } } },
              ],
            },
            include: {
              participants: { include: { user: { select: { id: true, name: true, email: true, type: true, publicId: true } } } },
              messages: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
          })
          if (race) return res.json({ conversation: race, created: false })
        }
        throw e
      }

      return res.status(201).json({ conversation: conv, created: true })
    }

    if (participantIds && Array.isArray(participantIds)) {
      // ─── Groupe ───────────────────────────────────────────────────────────
      const allIds = [...new Set([myId, ...participantIds])]
      const conv = await prisma.conversation.create({
        data: {
          isGroup: true,
          title: title || 'Groupe',
          aoId: aoId || null,
          offerId: offerId || null,
          participants: {
            create: allIds.map((uid) => ({ userId: uid })),
          },
        },
        include: {
          participants: {
            include: { user: { select: { id: true, name: true, email: true, type: true, publicId: true } } },
          },
          messages: true,
        },
      })
      return res.status(201).json({ conversation: conv, created: true })
    }

    return res.status(400).json({ error: 'participantId ou participantIds requis' })
  } catch (err) {
    next(err)
  }
})

// ─── Récupérer les messages d'une conversation (paginés) ─────────────────────
router.get('/:id/messages', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const userId = req.user.id
    const { id } = req.params
    const cursor = req.query.cursor // id du dernier message connu (pagination)
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 100)

    // Vérifier que l'utilisateur est bien participant
    const participation = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: id, userId } },
    })
    if (!participation) return res.status(403).json({ error: 'Accès refusé' })

    const messages = await prisma.message.findMany({
      where: {
        conversationId: id,
        ...(cursor ? { createdAt: { lt: (await prisma.message.findUnique({ where: { id: cursor } }))?.createdAt } } : {}),
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
      include: { sender: { select: { id: true, name: true, type: true } } },
    })

    res.json({ messages })
  } catch (err) {
    next(err)
  }
})

// ─── Marquer une conversation comme lue ──────────────────────────────────────
router.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const userId = req.user.id
    const { id } = req.params
    await prisma.conversationParticipant.updateMany({
      where: { conversationId: id, userId },
      data: { lastReadAt: new Date() },
    })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

module.exports = router
