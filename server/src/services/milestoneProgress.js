/**
 * MilestoneProgressService
 *
 * Règles d'avancement :
 *  1. Quand toutes les tâches d'un jalon passent DONE → jalon passe en IN_VALIDATION
 *  2. validateMilestone : accepte PROFESSIONAL ou CLIENT, quand les 2 → VALIDATED
 *  3. reopenMilestone : repasse REOPENED + toutes tâches en TODO
 *  4. getXxxProgress : pourcentage calculé à la volée, jamais stocké
 */

const { getPrisma } = require('../db')

// ─── Règle 1 : auto IN_VALIDATION ──────────────────────────────────────────

/**
 * Vérifie si toutes les tâches d'un jalon sont DONE.
 * Si oui, passe le jalon en IN_VALIDATION.
 * Appelé après chaque changement de statut de tâche.
 */
async function checkAndPromoteMilestone(projectMilestoneId) {
  const prisma = getPrisma()

  const milestone = await prisma.projectMilestone.findUnique({
    where: { id: projectMilestoneId },
    include: { tasks: true },
  })

  if (!milestone || milestone.tasks.length === 0) return milestone

  const allDone = milestone.tasks.every((t) => t.status === 'DONE')

  if (allDone && milestone.status !== 'IN_VALIDATION' && milestone.status !== 'VALIDATED') {
    return prisma.projectMilestone.update({
      where: { id: projectMilestoneId },
      data: { status: 'IN_VALIDATION', validatedByPro: false, validatedByClient: false },
    })
  }

  // Si le jalon était en statut initial et qu'il y a des tâches en cours
  if (milestone.status === 'NOT_STARTED') {
    const hasProgress = milestone.tasks.some((t) => t.status !== 'TODO')
    if (hasProgress) {
      return prisma.projectMilestone.update({
        where: { id: projectMilestoneId },
        data: { status: 'IN_PROGRESS' },
      })
    }
  }

  return milestone
}

// ─── Règle 2 : double validation ───────────────────────────────────────────

/**
 * @param {string} milestoneId - ProjectMilestone ID
 * @param {string} userId
 * @param {'PROFESSIONAL'|'CLIENT'} role
 */
async function validateMilestone(milestoneId, userId, role) {
  const prisma = getPrisma()

  const milestone = await prisma.projectMilestone.findUnique({
    where: { id: milestoneId },
    include: { tasks: true },
  })

  if (!milestone) {
    throw Object.assign(new Error('Jalon introuvable'), { statusCode: 404 })
  }

  // Vérifier que toutes les tâches sont DONE
  const allDone = milestone.tasks.every((t) => t.status === 'DONE')
  if (!allDone) {
    throw Object.assign(
      new Error('Impossible de valider : toutes les tâches ne sont pas terminées'),
      { statusCode: 400 },
    )
  }

  if (milestone.status !== 'IN_VALIDATION' && milestone.status !== 'DONE') {
    throw Object.assign(
      new Error(`Le jalon doit être en IN_VALIDATION pour être validé (actuel : ${milestone.status})`),
      { statusCode: 400 },
    )
  }

  const update = {}
  if (role === 'PROFESSIONAL') update.validatedByPro = true
  else if (role === 'CLIENT') update.validatedByClient = true
  else throw Object.assign(new Error('Rôle invalide : attendu PROFESSIONAL ou CLIENT'), { statusCode: 400 })

  // Appliquer la validation partielle
  const updated = await prisma.projectMilestone.update({
    where: { id: milestoneId },
    data: update,
  })

  // Si les deux ont validé → VALIDATED
  const proOk = role === 'PROFESSIONAL' ? true : milestone.validatedByPro
  const clientOk = role === 'CLIENT' ? true : milestone.validatedByClient

  if (proOk && clientOk) {
    return prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: { status: 'VALIDATED' },
    })
  }

  return updated
}

// ─── Règle 3 : réouverture ─────────────────────────────────────────────────

async function reopenMilestone(milestoneId) {
  const prisma = getPrisma()

  const milestone = await prisma.projectMilestone.findUnique({
    where: { id: milestoneId },
  })

  if (!milestone) {
    throw Object.assign(new Error('Jalon introuvable'), { statusCode: 404 })
  }

  return prisma.$transaction([
    prisma.projectMilestone.update({
      where: { id: milestoneId },
      data: { status: 'REOPENED', validatedByPro: false, validatedByClient: false },
    }),
    prisma.projectTask.updateMany({
      where: { projectMilestoneId: milestoneId },
      data: { status: 'TODO', blockReason: null },
    }),
  ])
}

// ─── Règle 4 : progress (pourcentage à la volée) ───────────────────────────

async function getMilestoneProgress(milestoneId) {
  const prisma = getPrisma()

  const tasks = await prisma.projectTask.findMany({
    where: { projectMilestoneId: milestoneId },
    select: { status: true },
  })

  if (tasks.length === 0) return { total: 0, done: 0, percentage: 0 }

  const done = tasks.filter((t) => t.status === 'DONE').length
  return {
    total: tasks.length,
    done,
    percentage: Math.round((done / tasks.length) * 100),
  }
}

async function getMissionProgress(projectMissionId) {
  const prisma = getPrisma()

  const milestones = await prisma.projectMilestone.findMany({
    where: { projectMissionId },
    select: { id: true, status: true },
  })

  if (milestones.length === 0) return { total: 0, validated: 0, percentage: 0 }

  const validated = milestones.filter((m) => m.status === 'VALIDATED').length
  return {
    total: milestones.length,
    validated,
    percentage: Math.round((validated / milestones.length) * 100),
  }
}

async function getProjectProgress(projectId) {
  const prisma = getPrisma()

  const missions = await prisma.projectMission.findMany({
    where: { projectId, isActive: true },
    include: {
      milestones: { select: { status: true } },
    },
  })

  let totalMilestones = 0
  let validatedMilestones = 0

  for (const m of missions) {
    totalMilestones += m.milestones.length
    validatedMilestones += m.milestones.filter((ms) => ms.status === 'VALIDATED').length
  }

  return {
    totalMissions: missions.length,
    totalMilestones,
    validatedMilestones,
    percentage: totalMilestones === 0 ? 0 : Math.round((validatedMilestones / totalMilestones) * 100),
  }
}

module.exports = {
  checkAndPromoteMilestone,
  validateMilestone,
  reopenMilestone,
  getMilestoneProgress,
  getMissionProgress,
  getProjectProgress,
}
