const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')

const router = Router()

// ─── Helper: vérifier qu'un utilisateur a accès à un projet ──────────────────
async function userCanAccessProject(prisma, userId, projectId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, clientId: true },
  })
  if (!project) return false
  if (project.ownerId === userId || project.clientId === userId) return true
  const isMember = await prisma.projectMember.findFirst({ where: { projectId, userId } })
  if (isMember) return true
  const isSupplier = await prisma.market.findFirst({ where: { projectId, supplierId: userId } })
  return !!isSupplier
}

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const userId = req.user.id
    const { projectId, assignedToMe, missionId } = req.query
    const where = {}

    if (projectId) {
      // Vérifier que l'utilisateur a accès au projet avant de lire ses tâches
      const canAccess = await userCanAccessProject(prisma, userId, projectId)
      if (!canAccess) throw createError('Accès non autorisé à ce projet', 403)
      where.projectId = projectId
    } else if (missionId) {
      where.missionId = missionId
    } else {
      // Sans filtre projet : uniquement les tâches créées par ou assignées à l'utilisateur
      where.OR = [{ createdBy: userId }, { assignedTo: userId }]
    }

    if (assignedToMe === 'true') where.assignedTo = userId

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
    const { title, description, status, priority, assignedTo, dueDate, projectId, marketId, missionId } = req.body
    if (!title) throw createError('title requis', 400)

    // Vérifier l'accès au projet si fourni
    if (projectId) {
      const canAccess = await userCanAccessProject(prisma, req.user.id, projectId)
      if (!canAccess) throw createError('Accès non autorisé à ce projet', 403)
    }

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
        missionId:   missionId   || null,
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
    const task = await prisma.task.findUnique({ where: { id: req.params.id } })
    if (!task) throw createError('Tâche introuvable', 404)

    // Autoriser : créateur de la tâche OU membre du projet associé
    const isCreator = task.createdBy === req.user.id
    const hasProjectAccess = task.projectId
      ? await userCanAccessProject(prisma, req.user.id, task.projectId)
      : false
    if (!isCreator && !hasProjectAccess) throw createError('Accès non autorisé', 403)

    const allowed = ['title', 'description', 'status', 'priority', 'assignedTo', 'dueDate', 'comment', 'projectId', 'missionId']
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
    const task = await prisma.task.findUnique({ where: { id: req.params.id } })
    if (!task) throw createError('Tâche introuvable', 404)

    // Seul le créateur ou le propriétaire du projet peut supprimer
    const isCreator = task.createdBy === req.user.id
    const isProjectOwner = task.projectId
      ? !!(await prisma.project.findFirst({ where: { id: task.projectId, ownerId: req.user.id } }))
      : false
    if (!isCreator && !isProjectOwner) throw createError('Accès non autorisé', 403)

    await prisma.task.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router
