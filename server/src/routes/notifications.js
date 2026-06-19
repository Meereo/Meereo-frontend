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
    const { msg, type, role, link, page } = req.body

    const notif = await prisma.notification.create({
      data: {
        msg,
        type:   type  || 'info',
        role:   role  || null,
        link:   link  || null,
        page:   page  || null,
        userId: req.user.id,
      },
    })
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

module.exports = router
