/**
 * Routes — Système de tâches & jalons (templates + instances projet)
 *
 * Toutes les routes sont préfixées par /api/project-missions
 * (enregistrées dans index.js).
 */

const { Router } = require('express')
const { z } = require('zod')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')
const { getIo } = require('../socket')

const { instantiateMissions, activateMission } = require('../services/missionInstantiation')
const {
  checkAndPromoteMilestone,
  validateMilestone,
  reopenMilestone,
  getMilestoneProgress,
  getMissionProgress,
  getProjectProgress,
} = require('../services/milestoneProgress')

const router = Router()

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function userCanAccessProject(prisma, userId, projectId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, clientId: true },
  })
  if (!project) return false
  if (project.ownerId === userId || project.clientId === userId) return true
  const isMember = await prisma.projectMember.findFirst({ where: { projectId, userId } })
  return !!isMember
}

// ─── Validation schemas ─────────────────────────────────────────────────────

const activateMissionsSchema = z.object({
  missionIds: z.array(z.string().min(1)).min(1, 'Au moins une mission requise'),
})

const activateSingleSchema = z.object({
  // pas de body nécessaire, le missionId est dans l'URL
})

const patchTaskStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'BLOCKED', 'IN_VALIDATION', 'DONE']),
  blockReason: z.string().optional(),
})

const validateMilestoneSchema = z.object({
  role: z.enum(['PROFESSIONAL', 'CLIENT']),
})

// ═══════════════════════════════════════════════════════════════════════════════
//  MISSION ACTIVATION
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/project-missions/projects/:projectId/missions/activate
// Body: { missionIds: [templateId, …] }
router.post('/projects/:projectId/missions/activate', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { projectId } = req.params

    const canAccess = await userCanAccessProject(prisma, req.user.id, projectId)
    if (!canAccess) throw createError('Accès non autorisé à ce projet', 403)

    const { missionIds } = activateMissionsSchema.parse(req.body)

    await instantiateMissions(projectId, missionIds)

    const missions = await prisma.projectMission.findMany({
      where: { projectId },
      include: {
        template: true,
        milestones: {
          include: { template: true },
          orderBy: { template: { order: 'asc' } },
        },
      },
    })

    res.status(201).json(missions)
  } catch (e) { next(e) }
})

// POST /api/project-missions/projects/:projectId/missions/:missionId/activate
// Active une mission unique (post-appel d'offres)
router.post('/projects/:projectId/missions/:missionId/activate', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { projectId, missionId } = req.params

    const canAccess = await userCanAccessProject(prisma, req.user.id, projectId)
    if (!canAccess) throw createError('Accès non autorisé à ce projet', 403)

    await activateMission(projectId, missionId)

    const mission = await prisma.projectMission.findUnique({
      where: { projectId_templateId: { projectId, templateId: missionId } },
      include: {
        template: true,
        milestones: {
          include: {
            template: true,
            tasks: { include: { template: true }, orderBy: { template: { order: 'asc' } } },
          },
          orderBy: { template: { order: 'asc' } },
        },
      },
    })

    res.status(201).json(mission)
  } catch (e) { next(e) }
})

// ═══════════════════════════════════════════════════════════════════════════════
//  LECTURE — Missions / Jalons / Tâches
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/project-missions/projects/:projectId/missions
router.get('/projects/:projectId/missions', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { projectId } = req.params

    const canAccess = await userCanAccessProject(prisma, req.user.id, projectId)
    if (!canAccess) throw createError('Accès non autorisé à ce projet', 403)

    const missions = await prisma.projectMission.findMany({
      where: { projectId },
      include: {
        template: true,
        milestones: {
          include: { template: true },
          orderBy: { template: { order: 'asc' } },
        },
      },
    })

    res.json(missions)
  } catch (e) { next(e) }
})

// GET /api/project-missions/projects/:projectId/missions/:missionId/milestones
router.get('/projects/:projectId/missions/:missionId/milestones', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { projectId, missionId } = req.params

    const canAccess = await userCanAccessProject(prisma, req.user.id, projectId)
    if (!canAccess) throw createError('Accès non autorisé à ce projet', 403)

    const projectMission = await prisma.projectMission.findUnique({
      where: { projectId_templateId: { projectId, templateId: missionId } },
    })
    if (!projectMission) throw createError('Mission non instanciée pour ce projet', 404)

    const milestones = await prisma.projectMilestone.findMany({
      where: { projectMissionId: projectMission.id },
      include: {
        template: true,
        tasks: {
          include: { template: true },
          orderBy: { template: { order: 'asc' } },
        },
      },
      orderBy: { template: { order: 'asc' } },
    })

    res.json(milestones)
  } catch (e) { next(e) }
})

// GET /api/project-missions/projects/:projectId/milestones/:milestoneId/tasks
router.get('/projects/:projectId/milestones/:milestoneId/tasks', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { projectId, milestoneId } = req.params

    const canAccess = await userCanAccessProject(prisma, req.user.id, projectId)
    if (!canAccess) throw createError('Accès non autorisé à ce projet', 403)

    // Vérifier que le milestone appartient bien à ce projet
    const milestone = await prisma.projectMilestone.findUnique({
      where: { id: milestoneId },
      include: { projectMission: { select: { projectId: true } } },
    })
    if (!milestone || milestone.projectMission.projectId !== projectId) {
      throw createError('Jalon introuvable pour ce projet', 404)
    }

    const tasks = await prisma.projectTask.findMany({
      where: { projectMilestoneId: milestoneId },
      include: { template: true },
      orderBy: { template: { order: 'asc' } },
    })

    res.json(tasks)
  } catch (e) { next(e) }
})

// ═══════════════════════════════════════════════════════════════════════════════
//  TÂCHES — Changement de statut + Blocage
// ═══════════════════════════════════════════════════════════════════════════════

// PATCH /api/project-missions/tasks/:taskId/status
router.patch('/tasks/:taskId/status', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { taskId } = req.params
    const { status, blockReason } = patchTaskStatusSchema.parse(req.body)

    const task = await prisma.projectTask.findUnique({
      where: { id: taskId },
      include: {
        projectMilestone: {
          include: {
            projectMission: {
              include: { template: true },
            },
          },
        },
      },
    })

    if (!task) throw createError('Tâche introuvable', 404)

    const projectId = task.projectMilestone.projectMission.projectId
    const canAccess = await userCanAccessProject(prisma, req.user.id, projectId)
    if (!canAccess) throw createError('Accès non autorisé', 403)

    const data = { status }

    // Gestion BLOCKED
    if (status === 'BLOCKED') {
      data.blockReason = blockReason || null

      // Notifier le responsable de la ProjectMission parente
      const responsibleUserId = task.projectMilestone.projectMission.responsibleUserId
      if (responsibleUserId) {
        const io = getIo()
        const notifData = {
          msg: `Tâche bloquée sur la mission « ${task.projectMilestone.projectMission.template.title} »` +
               (blockReason ? ` — Raison : ${blockReason}` : ''),
          type: 'warning',
          userId: responsibleUserId,
          page: 'missions',
        }

        // Persister la notification
        await prisma.notification.create({ data: notifData })

        // Real-time
        if (io) {
          io.to(`user:${responsibleUserId}`).emit('notification:new', {
            ...notifData,
            read: false,
            createdAt: new Date().toISOString(),
          })
        }
      }
    }

    // Si on sort de BLOCKED, nettoyer blockReason
    if (status !== 'BLOCKED') {
      data.blockReason = null
    }

    const updated = await prisma.projectTask.update({
      where: { id: taskId },
      data,
      include: { template: true },
    })

    // Règle 1 : vérifier auto-promotion du jalon
    await checkAndPromoteMilestone(task.projectMilestoneId)

    res.json(updated)
  } catch (e) { next(e) }
})

// POST /api/project-missions/tasks/:taskId/unblock
router.post('/tasks/:taskId/unblock', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { taskId } = req.params

    const task = await prisma.projectTask.findUnique({
      where: { id: taskId },
      include: {
        projectMilestone: {
          include: { projectMission: { select: { projectId: true } } },
        },
      },
    })

    if (!task) throw createError('Tâche introuvable', 404)
    if (task.status !== 'BLOCKED') throw createError('La tâche n\'est pas bloquée', 400)

    const projectId = task.projectMilestone.projectMission.projectId
    const canAccess = await userCanAccessProject(prisma, req.user.id, projectId)
    if (!canAccess) throw createError('Accès non autorisé', 403)

    const updated = await prisma.projectTask.update({
      where: { id: taskId },
      data: { status: 'IN_PROGRESS', blockReason: null },
      include: { template: true },
    })

    res.json(updated)
  } catch (e) { next(e) }
})

// ═══════════════════════════════════════════════════════════════════════════════
//  JALONS — Validation / Réouverture
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/project-missions/milestones/:milestoneId/validate
router.post('/milestones/:milestoneId/validate', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { milestoneId } = req.params
    const { role } = validateMilestoneSchema.parse(req.body)

    // Vérifier accès
    const milestone = await prisma.projectMilestone.findUnique({
      where: { id: milestoneId },
      include: { projectMission: { select: { projectId: true } } },
    })
    if (!milestone) throw createError('Jalon introuvable', 404)

    const canAccess = await userCanAccessProject(prisma, req.user.id, milestone.projectMission.projectId)
    if (!canAccess) throw createError('Accès non autorisé', 403)

    const updated = await validateMilestone(milestoneId, req.user.id, role)

    res.json(updated)
  } catch (e) { next(e) }
})

// POST /api/project-missions/milestones/bulk-validate
// Valider plusieurs jalons en une seule requête (validation groupée)
router.post('/milestones/bulk-validate', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { milestoneIds, role } = req.body

    if (!Array.isArray(milestoneIds) || milestoneIds.length === 0) {
      throw createError('milestoneIds doit être un tableau non vide', 400)
    }
    if (!role || !['pro', 'client'].includes(role)) {
      throw createError('role doit être "pro" ou "client"', 400)
    }

    // Verify access to all milestones (they must belong to the same project)
    const milestones = await prisma.projectMilestone.findMany({
      where: { id: { in: milestoneIds } },
      include: { projectMission: { select: { projectId: true } } },
    })
    if (milestones.length === 0) throw createError('Aucun jalon trouvé', 404)

    const projectIds = new Set(milestones.map(m => m.projectMission.projectId))
    for (const pid of projectIds) {
      const canAccess = await userCanAccessProject(prisma, req.user.id, pid)
      if (!canAccess) throw createError('Accès non autorisé', 403)
    }

    // Validate all milestones
    const results = []
    for (const mid of milestoneIds) {
      try {
        const updated = await validateMilestone(mid, req.user.id, role)
        results.push(updated)
      } catch (e) {
        results.push({ id: mid, error: e.message })
      }
    }

    res.json({ validated: results.filter(r => !r.error).length, total: milestoneIds.length, results })
  } catch (e) { next(e) }
})

// POST /api/project-missions/milestones/:milestoneId/reopen
router.post('/milestones/:milestoneId/reopen', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { milestoneId } = req.params

    // Vérifier accès
    const milestone = await prisma.projectMilestone.findUnique({
      where: { id: milestoneId },
      include: { projectMission: { select: { projectId: true } } },
    })
    if (!milestone) throw createError('Jalon introuvable', 404)

    const canAccess = await userCanAccessProject(prisma, req.user.id, milestone.projectMission.projectId)
    if (!canAccess) throw createError('Accès non autorisé', 403)

    const [updatedMilestone] = await reopenMilestone(milestoneId)

    res.json(updatedMilestone)
  } catch (e) { next(e) }
})

// ═══════════════════════════════════════════════════════════════════════════════
//  PROGRESS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/project-missions/projects/:projectId/progress
router.get('/projects/:projectId/progress', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { projectId } = req.params

    const canAccess = await userCanAccessProject(prisma, req.user.id, projectId)
    if (!canAccess) throw createError('Accès non autorisé à ce projet', 403)

    const progress = await getProjectProgress(projectId)

    // Détail par mission
    const missions = await prisma.projectMission.findMany({
      where: { projectId, isActive: true },
      include: { template: true },
    })

    const missionDetails = await Promise.all(
      missions.map(async (m) => ({
        missionId: m.id,
        templateId: m.templateId,
        title: m.template.title,
        code: m.template.code,
        progress: await getMissionProgress(m.id),
      })),
    )

    res.json({ ...progress, missions: missionDetails })
  } catch (e) { next(e) }
})

// ═══════════════════════════════════════════════════════════════════════════════
//  TEMPLATES (lecture seule)
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/project-missions/templates
router.get('/templates', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const templates = await prisma.missionTemplate.findMany({
      orderBy: { order: 'asc' },
      include: {
        milestones: {
          orderBy: { order: 'asc' },
          include: {
            tasks: { orderBy: { order: 'asc' } },
          },
        },
      },
    })
    res.json(templates)
  } catch (e) { next(e) }
})

module.exports = router
