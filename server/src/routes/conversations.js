const { Router } = require('express')
const { requireAuth } = require('../middleware/auth')
const { getPrisma } = require('../db')
const { getIo } = require('../socket')

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

    // Vérifier le type de l'utilisateur pour filtrage sécurité
    const currentUser = await prisma.user.findUnique({ where: { id: userId }, select: { type: true } })
    const isPro = currentUser?.type === 'pro'

    // Si pro : récupérer les IDs des clients avec lesquels il partage un projet
    let allowedClientIds = null
    if (isPro) {
      const sharedProjects = await prisma.project.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId } } },
          ],
        },
        select: { clientId: true, ownerId: true },
      })
      allowedClientIds = new Set()
      sharedProjects.forEach(p => {
        if (p.clientId) allowedClientIds.add(p.clientId)
        if (p.ownerId) allowedClientIds.add(p.ownerId)
      })
      allowedClientIds.delete(userId)
    }

    let conversations = participations.map((p) => {
      const c = p.conversation
      const lastMsg = c.messages[0] || null
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

    // Sécurité : un pro ne voit que les conversations avec des clients liés à ses projets
    if (isPro && allowedClientIds) {
      conversations = conversations.filter(c => {
        if (c.isGroup) return true // Les groupes restent visibles
        // Pour les 1:1, vérifier que l'autre participant n'est pas un client non-autorisé
        const otherParticipants = c.participants.filter(pp => pp.id !== userId)
        return otherParticipants.every(pp => pp.type !== 'client' || allowedClientIds.has(pp.id))
      })
    }

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
    const { participantId, participantIds, title, aoId, offerId, type, projectId, missionId } = req.body

    if (participantId) {
      // ─── Sécurité : un pro ne peut contacter un client que s'ils partagent un projet ───
      const me = await prisma.user.findUnique({ where: { id: myId }, select: { type: true } })
      const other = await prisma.user.findUnique({ where: { id: participantId }, select: { type: true } })
      if (me?.type === 'pro' && other?.type === 'client') {
        const sharedProject = await prisma.project.findFirst({
          where: {
            OR: [
              { ownerId: myId, clientId: participantId },
              { ownerId: participantId, clientId: myId },
              { AND: [
                { members: { some: { userId: myId } } },
                { OR: [{ clientId: participantId }, { ownerId: participantId }] },
              ]},
              { AND: [
                { members: { some: { userId: participantId } } },
                { OR: [{ clientId: myId }, { ownerId: myId }] },
              ]},
            ],
          },
        })
        if (!sharedProject) {
          return res.status(403).json({ error: 'Vous ne pouvez contacter ce client que si vous partagez un projet' })
        }
      }

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
            type: type || 'libre',
            aoId: aoId || null,
            offerId: offerId || null,
            projectId: projectId || null,
            missionId: missionId || null,
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

      // Notifier l'autre participant via socket
      const io = getIo()
      if (io) {
        io.to(`user:${participantId}`).emit('conversation:updated', {
          conversationId: conv.id,
          lastMessage: null,
        })
      }
      return res.status(201).json({ conversation: conv, created: true })
    }

    if (participantIds && Array.isArray(participantIds)) {
      // ─── Groupe ───────────────────────────────────────────────────────────
      const allIds = [...new Set([myId, ...participantIds.filter(Boolean)])]
      console.log('[conversations] Creating group — myId:', myId, '| participantIds:', participantIds, '| allIds:', allIds)
      const conv = await prisma.conversation.create({
        data: {
          isGroup: true,
          title: title || 'Groupe',
          type: type || 'libre',
          aoId: aoId || null,
          offerId: offerId || null,
          projectId: projectId || null,
          missionId: missionId || null,
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
      // Notifier tous les autres participants via socket pour qu'ils voient la conversation immédiatement
      const io = getIo()
      if (io) {
        allIds.filter(uid => uid !== myId).forEach(uid => {
          io.to(`user:${uid}`).emit('conversation:updated', {
            conversationId: conv.id,
            lastMessage: null,
          })
        })
      }
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

    // Notifier les autres participants via socket (temps réel)
    const io = getIo()
    if (io) {
      const participants = await prisma.conversationParticipant.findMany({
        where: { conversationId: id },
        select: { userId: true },
      })
      const lastMsgPayload = { id: message.id, text: message.text, type: message.type, senderId: message.senderId, senderName: message.sender.name, createdAt: message.createdAt }
      participants.filter(p => p.userId !== userId).forEach(p => {
        io.to(`user:${p.userId}`).emit('conversation:updated', { conversationId: id, lastMessage: lastMsgPayload })
        io.to(`user:${p.userId}`).emit('notification:new', {
          id: 'notif_msg_' + message.id,
          msg: `Nouveau message de ${message.sender.name}`,
          type: 'info',
          read: false,
          ts: message.createdAt,
        })
      })
      // Émettre aussi dans la room de la conversation
      io.to(`conv:${id}`).emit('message:new', message)
    }

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

// ─── Ajouter un participant à une conversation existante ─────────────────────
// POST /api/conversations/:id/participants  { userId }
router.post('/:id/participants', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const myId = req.user.id
    const { id } = req.params
    const { userId } = req.body
    if (!userId) return res.status(400).json({ error: 'userId requis' })

    // Vérifier que l'appelant est participant
    const myPart = await prisma.conversationParticipant.findUnique({
      where: { conversationId_userId: { conversationId: id, userId: myId } },
    })
    if (!myPart) return res.status(403).json({ error: 'Accès refusé' })

    // Vérifier que l'utilisateur cible existe
    const targetUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!targetUser) return res.status(404).json({ error: 'Utilisateur introuvable' })

    // Ajouter le participant (ignorer si déjà présent)
    try {
      await prisma.conversationParticipant.create({
        data: { conversationId: id, userId },
      })
    } catch (e) {
      if (e.code === 'P2002') return res.json({ ok: true, alreadyMember: true })
      throw e
    }

    // Marquer la conversation comme groupe si elle ne l'est pas déjà
    await prisma.conversation.update({
      where: { id },
      data: { isGroup: true, updatedAt: new Date() },
    })

    // Retourner la conversation mise à jour
    const conv = await prisma.conversation.findUnique({
      where: { id },
      include: {
        participants: { include: { user: PARTICIPANT_USER_SELECT } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    })
    if (conv?.participants) conv.participants = conv.participants.map(pp => ({ ...pp, user: mapParticipantUser(pp.user) }))
    res.json({ ok: true, conversation: conv })
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
