const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')

const router = Router()

// ─── GET /api/project-members?projectId=xxx ───────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const where = {}
    if (req.query.projectId) where.projectId = req.query.projectId

    const members = await prisma.projectMember.findMany({
      where,
      orderBy: { joinedAt: 'asc' },
    })
    res.json(members)
  } catch (e) { next(e) }
})

// ─── POST /api/project-members ────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { projectId, userId, role, userName, userEmail } = req.body
    if (!projectId || !userId) throw createError('projectId et userId requis', 400)

    // Verify the project exists before upserting — frontend may send local-only IDs
    const projectExists = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } })
    if (!projectExists) return res.status(404).json({ error: 'Projet introuvable' })

    const member = await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId } },
      update: { role: role || 'MEMBER', userName: userName || '', userEmail: userEmail || '' },
      create: {
        projectId, userId,
        role:      role      || 'MEMBER',
        userName:  userName  || '',
        userEmail: userEmail || '',
      },
    })
    res.status(201).json(member)
  } catch (e) { next(e) }
})

// ─── DELETE /api/project-members/:id ─────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    await prisma.projectMember.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router
