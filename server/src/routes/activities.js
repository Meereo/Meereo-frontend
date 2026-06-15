const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')

const router = Router()

// ─── GET /api/activities ──────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const activities = await prisma.activity.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    res.json(activities)
  } catch (e) { next(e) }
})

// ─── POST /api/activities ─────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { action, data } = req.body

    const activity = await prisma.activity.create({
      data: {
        action,
        data:   data   || null,
        userId: req.user.id,
      },
    })
    res.status(201).json(activity)
  } catch (e) { next(e) }
})

module.exports = router
