const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')

const router = Router()

// ─── GET /api/notifications ───────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const notifs = await prisma.notification.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json(notifs)
  } catch (e) { next(e) }
})

// ─── POST /api/notifications ──────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { msg, message, type, role, link, page, targetUserId } = req.body
    const senderId = req.user.id
    const recipientId = targetUserId || senderId

    // Si l'utilisateur envoie une notification à quelqu'un d'autre, vérifier la relation
    if (recipientId !== senderId) {
      // Vérifier qu'ils partagent au moins un projet (owner, client, ou membre commun)
      const sharedProject = await prisma.project.findFirst({
        where: {
          OR: [
            { ownerId: senderId, clientId: recipientId },
            { ownerId: recipientId, clientId: senderId },
            { ownerId: senderId, members: { some: { userId: recipientId } } },
            { ownerId: recipientId, members: { some: { userId: senderId } } },
            { clientId: senderId, members: { some: { userId: recipientId } } },
            { clientId: recipientId, members: { some: { userId: senderId } } },
          ],
        },
        select: { id: true },
      })
      // Ou qu'ils partagent un marché
      const sharedMarket = !sharedProject ? await prisma.market.findFirst({
        where: {
          OR: [
            { clientId: senderId, supplierId: recipientId },
            { clientId: recipientId, supplierId: senderId },
          ],
        },
        select: { id: true },
      }) : null

      if (!sharedProject && !sharedMarket) {
        return res.status(403).json({ error: 'Vous ne pouvez notifier que des utilisateurs avec lesquels vous avez une relation professionnelle' })
      }
    }

    const notif = await prisma.notification.create({
      data: {
        msg:    msg || message || '',
        type:   type  || 'info',
        role:   role  || null,
        link:   link  || null,
        page:   page  || null,
        userId: recipientId,
      },
    })
    // Notifier en temps réel via socket
    const { getIo } = require('../socket')
    const io = getIo()
    if (io && notif.userId) {
      io.to(`user:${notif.userId}`).emit('notification:new', {
        id: notif.id, msg: notif.msg, type: notif.type, link: notif.link,
      })
    }
    res.status(201).json(notif)
  } catch (e) { next(e) }
})

// ─── PATCH /api/notifications/:id/read ────────────────────────────────────────
router.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    // Vérifier que la notification appartient à l'utilisateur avant de la marquer lue
    const notif = await prisma.notification.findUnique({ where: { id: req.params.id } })
    if (!notif) return res.status(404).json({ error: 'Notification introuvable' })
    if (notif.userId !== req.user.id) return res.status(403).json({ error: 'Accès non autorisé' })
    const updated = await prisma.notification.update({
      where: { id: req.params.id },
      data:  { read: true },
    })
    res.json(updated)
  } catch (e) { next(e) }
})

// ─── PATCH /api/notifications/read-all ────────────────────────────────────────
router.patch('/read-all', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    await prisma.notification.updateMany({
      where: { userId: req.user.id, read: false },
      data:  { read: true },
    })
    res.json({ success: true })
  } catch (e) { next(e) }
})

// ─── DELETE /api/notifications/:id ────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const notif = await prisma.notification.findUnique({ where: { id: req.params.id } })
    if (!notif) return res.status(404).json({ error: 'Notification introuvable' })
    if (notif.userId !== req.user.id) return res.status(403).json({ error: 'Accès non autorisé' })
    await prisma.notification.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

// ─── DELETE /api/notifications (all) ──────────────────────────────────────────
router.delete('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    await prisma.notification.deleteMany({ where: { userId: req.user.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router
