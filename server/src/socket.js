const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const { getPrisma } = require('./db')

let _io = null

/** Expose the Socket.IO server for use in routes (e.g., push notifications). */
function getIo() { return _io }

/**
 * Attache Socket.IO au serveur HTTP et gère la messagerie temps réel.
 * @param {import('http').Server} httpServer
 * @param {string[]} allowedOrigins
 */
function attachSocketIO(httpServer, allowedOrigins) {
  const io = new Server(httpServer, {    cors: {
      origin: allowedOrigins,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    // Utiliser websocket en priorité, fallback polling
    transports: ['websocket', 'polling'],
  })

  _io = io

  // ─── Authentification JWT sur la connexion ─────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) return next(new Error('Authentification requise'))
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      socket.userId = payload.userId || payload.id || payload.sub
      if (!socket.userId) return next(new Error('Token invalide'))
      next()
    } catch {
      next(new Error('Token invalide ou expiré'))
    }
  })

  // ─── Événements ────────────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const userId = socket.userId
    // Rejoindre une room personnelle pour les notifications directes
    socket.join(`user:${userId}`)

    // ── Rejoindre une conversation ─────────────────────────────────────────
    socket.on('conversation:join', async (conversationId) => {
      try {
        const prisma = getPrisma()
        const p = await prisma.conversationParticipant.findUnique({
          where: { conversationId_userId: { conversationId, userId } },
        })
        if (!p) return socket.emit('error', { message: 'Accès refusé à cette conversation' })
        socket.join(`conv:${conversationId}`)
      } catch (err) {
        socket.emit('error', { message: 'Erreur serveur' })
      }
    })

    // ── Quitter une conversation ───────────────────────────────────────────
    socket.on('conversation:leave', (conversationId) => {
      socket.leave(`conv:${conversationId}`)
    })

    // ── Envoyer un message ─────────────────────────────────────────────────
    socket.on('message:send', async (data, ack) => {
      const { conversationId, text, type = 'text', fileUrl, fileName } = data || {}
      if (!conversationId || !text?.trim()) {
        return typeof ack === 'function' && ack({ error: 'Données invalides' })
      }

      try {
        const prisma = getPrisma()
        // Vérifier participation
        const p = await prisma.conversationParticipant.findUnique({
          where: { conversationId_userId: { conversationId, userId } },
        })
        if (!p) return typeof ack === 'function' && ack({ error: 'Accès refusé' })

        // Créer le message en DB
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: userId,
            text: text.trim(),
            type,
            fileUrl: fileUrl || null,
            fileName: fileName || null,
          },
          include: { sender: { select: { id: true, name: true, type: true } } },
        })

        // Mettre à jour updatedAt de la conversation
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        })

        // Diffuser aux autres membres de la conversation (pas l'expéditeur — il reçoit via ack)
        socket.to(`conv:${conversationId}`).emit('message:new', message)

        // Notifier les participants qui ne sont pas dans la room (app en arrière-plan)
        const participants = await prisma.conversationParticipant.findMany({
          where: { conversationId, userId: { not: userId } },
          select: { userId: true },
        })
        participants.forEach(({ userId: uid }) => {
          io.to(`user:${uid}`).emit('conversation:updated', {
            conversationId,
            lastMessage: {
              id: message.id,
              text: message.text,
              type: message.type,
              senderId: message.senderId,
              senderName: message.sender.name,
              createdAt: message.createdAt,
            },
          })
        })

        typeof ack === 'function' && ack({ message })
      } catch (err) {
        console.error('[socket] message:send error', err)
        typeof ack === 'function' && ack({ error: 'Erreur serveur' })
      }
    })

    // ── Indicateur de frappe ───────────────────────────────────────────────
    socket.on('typing:start', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing', { userId, conversationId })
    })

    socket.on('typing:stop', ({ conversationId }) => {
      socket.to(`conv:${conversationId}`).emit('typing:stop', { userId, conversationId })
    })

    // ── Marquer comme lu ──────────────────────────────────────────────────
    socket.on('read', async ({ conversationId }) => {
      try {
        const prisma = getPrisma()
        await prisma.conversationParticipant.updateMany({
          where: { conversationId, userId },
          data: { lastReadAt: new Date() },
        })
        socket.to(`conv:${conversationId}`).emit('read', { userId, conversationId })
      } catch {}
    })

    socket.on('disconnect', () => {
      // Nettoyage automatique par Socket.IO
    })
  })

  return io
}

module.exports = { attachSocketIO, getIo }
