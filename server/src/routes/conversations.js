const { Router } = require('express')
const { requireAuth } = require('../middleware/auth')
const { getPrisma } = require('../db')

const router = Router()

// ─── Shared participant user select (includes profile tables for photo lookup) ─
const PARTICIPANT_USER_SELECT = {
  select: {
    id: true, name: true, email: true, type: true, publicId: true, avatar: true, onboardingData: true,
    proProfile:         { select: { logoFileUrl: true } },
    clientProfile:      { select: { photoUrl: true } },
    fournisseurProfile: { select: { logoFileUrl: true } },
  },
}

// Strip base64 — only keep real URLs
const safeUrl = (v) => (v && typeof v === 'string' && !v.startsWith('data:') ? v : null)

// Compute a canonical photoUrl for a participant and remove the raw profile sub-objects
const mapParticipantUser = (u) => {
  if (!u) return u
  const photoUrl =
    safeUrl(u.proProfile?.logoFileUrl) ||
    safeUrl(u.clientProfile?.photoUrl) ||
    safeUrl(u.fournisseurProfile?.logoFileUrl) ||
    safeUrl(u.onboardingData?.logoFileUrl) ||
    safeUrl(u.onboardingData?.photoUrl) ||
    safeUrl(u.avatar) ||
    null
  const { proProfile: _1, clientProfile: _2, fournisseurProfile: _3, ...rest } = u
  return { ...rest, photoUrl }
}

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
              include: { user: PARTICIPANT_USER_SELECT },
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
        participants: c.participants.map((pp) => mapParticipantUser(pp.user)),
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
            include: { user: PARTICIPANT_USER_SELECT },
          },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      })

      if (existing) {
        if (existing.participants) existing.participants = existing.participants.map(pp => ({ ...pp, user: mapParticipantUser(pp.user) }))
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
              include: { user: PARTICIPANT_USER_SELECT },
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
              participants: { include: { user: PARTICIPANT_USER_SELECT } },
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
            include: { user: PARTICIPANT_USER_SELECT },
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
// ─── Envoyer un message dans une conversation (fallback HTTP — socket en priorité) ─────────
router.post('/:id/messages', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const userId = req.user.id
    const { id } = req.params
    const { text, type, fileUrl, fileName } = req.body

    if (!text && !fileUrl) return res.status(400).json({ error: 'text ou fileUrl requis' })

    // Vérifier participation
    const participation = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: id, userId } },
    })
    if (!participation) return res.status(403).json({ error: 'Accès refusé' })

    const message = await prisma.message.create({
      data: {
        conversationId: id,
        senderId: userId,
        text: text || '',
        type: type || 'text',
        fileUrl: fileUrl || null,
        fileName: fileName || null,
      },
      include: { sender: { select: { id: true, name: true, type: true } } },
    })

    // Mettre à jour updatedAt de la conversation
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    })

    res.status(201).json(message)
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

// ─── Quitter / masquer une conversation (DELETE pour l'utilisateur courant) ───
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const userId = req.user.id
    const { id } = req.params
    // Retirer le participant — la conversation reste pour les autres
    await prisma.conversationParticipant.deleteMany({
      where: { conversationId: id, userId },
    })
    res.json({ ok: true })
  } catch (err) {
    next(err)
  }
})

module.exports = router
