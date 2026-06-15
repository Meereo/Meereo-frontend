const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')

const router = Router()

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const where = {}
    if (req.query.projectId) where.projectId = req.query.projectId
    if (req.query.assignedToMe === 'true') where.assignedTo = req.user.id

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    res.json(tasks)
  } catch (e) { next(e) }
})

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { title, description, status, priority, assignedTo, dueDate, projectId, marketId } = req.body
    if (!title) throw createError('title requis', 400)

    const task = await prisma.task.create({
      data: {
        title,
        description: description || '',
        status:      status      || 'todo',
        priority:    priority    || 'normale',
        assignedTo:  assignedTo  || '',
        dueDate:     dueDate     ? new Date(dueDate) : null,
        projectId:   projectId   || null,
        marketId:    marketId    || null,
        createdBy:   req.user.id,
      },
    })
    res.status(201).json(task)
  } catch (e) { next(e) }
})

// ─── PATCH /api/tasks/:id ─────────────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const allowed = ['title', 'description', 'status', 'priority', 'assignedTo', 'dueDate', 'comment', 'projectId']
    const data = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        data[key] = key === 'dueDate'
          ? (req.body[key] ? new Date(req.body[key]) : null)
          : req.body[key]
      }
    }
    const updated = await prisma.task.update({ where: { id: req.params.id }, data })
    res.json(updated)
  } catch (e) { next(e) }
})

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    await prisma.task.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router
