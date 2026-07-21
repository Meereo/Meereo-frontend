/**
 * createAndPushNotification — helper réutilisable pour créer une notification
 * en base, la pousser en temps réel via Socket.IO, et envoyer un email optionnel.
 *
 * Usage depuis n'importe quelle route :
 *   const { createAndPushNotification } = require('../utils/notify')
 *   await createAndPushNotification({ userId, msg, type, link, page, senderId })
 */
const { getPrisma } = require('../db')

async function createAndPushNotification({ userId, msg, type, link, page, role, senderId }) {
  if (!userId || !msg) return null

  const prisma = getPrisma()

  // 1. Create notification in database
  const notif = await prisma.notification.create({
    data: {
      msg,
      type:   type || 'info',
      role:   role || null,
      link:   link || null,
      page:   page || null,
      userId,
    },
  })

  // 2. Push via Socket.IO in real-time
  try {
    const { getIo } = require('../socket')
    const io = getIo()
    if (io) {
      io.to(`user:${userId}`).emit('notification:new', {
        id: notif.id,
        msg: notif.msg,
        type: notif.type,
        link: notif.link,
        page: notif.page,
        read: false,
        createdAt: notif.createdAt,
      })
    }
  } catch (_) {}

  // 3. Send email for cross-user notifications (not self-notifications)
  if (senderId && senderId !== userId) {
    try {
      const recipient = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
      if (recipient?.email) {
        const { sendNotificationEmail } = require('./email')
        const frontendUrl = process.env.FRONTEND_URL || 'https://dev.meereo.com'
        sendNotificationEmail({
          to: recipient.email,
          title: 'Nouvelle notification',
          body: msg,
          ctaLabel: 'Voir sur Meereo',
          ctaUrl: frontendUrl + (link || ''),
        }).catch(() => {})
      }
    } catch (_) {}
  }

  return notif
}

module.exports = { createAndPushNotification }
