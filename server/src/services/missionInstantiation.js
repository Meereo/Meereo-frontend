/**
 * MissionInstantiationService
 *
 * Crée les instances projet (ProjectMission → ProjectMilestone → ProjectTask)
 * à partir des templates du référentiel.
 *
 * Les deux fonctions sont idempotentes : si l'instance existe déjà, on skip.
 */

const { getPrisma } = require('../db')

/**
 * Instancie plusieurs missions pour un projet.
 * Les missions absentes de activeMissionIds ne sont PAS créées.
 *
 * @param {string} projectId
 * @param {string[]} activeMissionTemplateIds - IDs des MissionTemplate à activer
 */
async function instantiateMissions(projectId, activeMissionTemplateIds) {
  const prisma = getPrisma()

  for (const templateId of activeMissionTemplateIds) {
    await _instantiateOneMission(prisma, projectId, templateId)
  }
}

/**
 * Active une mission unique après la création du projet
 * (cas post-appel d'offres gagné).
 * Ne touche pas aux missions déjà actives.
 *
 * @param {string} projectId
 * @param {string} missionTemplateId
 */
async function activateMission(projectId, missionTemplateId) {
  const prisma = getPrisma()
  await _instantiateOneMission(prisma, projectId, missionTemplateId)
}

/**
 * @private Instancie une seule mission + jalons + tâches. Idempotent.
 */
async function _instantiateOneMission(prisma, projectId, templateId) {
  // Vérifier que le template existe et charger ses jalons + tâches
  const template = await prisma.missionTemplate.findUnique({
    where: { id: templateId },
    include: {
      milestones: {
        orderBy: { order: 'asc' },
        include: { tasks: { orderBy: { order: 'asc' } } },
      },
    },
  })

  if (!template) {
    throw Object.assign(new Error(`MissionTemplate introuvable : ${templateId}`), { statusCode: 404 })
  }

  // Idempotent : si déjà instanciée, on skip
  const existing = await prisma.projectMission.findUnique({
    where: { projectId_templateId: { projectId, templateId } },
  })
  if (existing) return existing

  // Créer en une transaction
  return prisma.$transaction(async (tx) => {
    const projectMission = await tx.projectMission.create({
      data: { projectId, templateId, isActive: true },
    })

    for (const milestoneTemplate of template.milestones) {
      const projectMilestone = await tx.projectMilestone.create({
        data: {
          projectMissionId: projectMission.id,
          templateId: milestoneTemplate.id,
          status: 'NOT_STARTED',
        },
      })

      if (milestoneTemplate.tasks.length > 0) {
        await tx.projectTask.createMany({
          data: milestoneTemplate.tasks.map((t) => ({
            projectMilestoneId: projectMilestone.id,
            templateId: t.id,
            status: 'TODO',
          })),
        })
      }
    }

    return projectMission
  })
}

module.exports = { instantiateMissions, activateMission }
