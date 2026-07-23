const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')
const { getIo } = require('../socket')

const router = Router()

// ─── PRJ-07 / FIN-01: 7 phases FIXES alignées avec la spec v1.27 ─────────────
// Alignées avec web/src/data/chantier.js (CHANTIER_PHASES)
const MISSION_JALONS = {
  conception_etudes: [
    'Relevé de mesures', 'Analyse du site', 'Faisabilité', 'Esquisse',
    'Avant-projet', 'Projet détaillé', 'Estimation budgétaire',
    'Études BET structure', 'Études BET fluides / CVC',
    'Plans d\'exécution', 'Dossier permis de construire',
  ],
  preparation_lancement: [
    'Dossier de consultation', 'Lancement des consultations', 'Réception des offres',
    'Analyse des offres', 'Choix des entreprises', 'Attribution des marchés',
    'Signature des marchés', 'Planning chantier', 'Installation chantier',
  ],
  gros_oeuvre: [
    'Implantation', 'Terrassement', 'Fondations', 'Soubassement', 'Dallage',
    'Poteaux / poutres / voiles', 'Dalles', 'Charpente', 'Toiture',
  ],
  second_oeuvre: [
    'Cloisons', 'Enduits', 'Faux plafonds', 'Électricité', 'Plomberie',
    'CVC / climatisation', 'Menuiseries', 'Revêtements sols',
    'Revêtements murs', 'Peinture', 'Équipements sanitaires', 'Finitions',
  ],
  materiaux_equipements: [
    'Sélection des matériaux', 'Validation client', 'Sélection équipements',
    'Demande de devis', 'Validation budget', 'Commande',
    'Livraison chantier', 'Vérification conformité',
  ],
  mobilier_decoration: [
    'Sélection mobilier', 'Sélection décoration', 'Validation client',
    'Commande', 'Livraison', 'Installation', 'Mise en place finale',
  ],
  reception_livraison: [
    'Nettoyage fin chantier', 'Vérifications finales', 'Pré-réception',
    'Réception', 'Réserves', 'Levée des réserves',
    'DOE / documents finaux', 'Remise des clés',
  ],
  // Legacy — compatibilité ascendante pour les projets existants
  conception_architecturale: [
    'Relevé & diagnostic', 'Esquisse', 'Avant-projet sommaire', 'Avant-projet détaillé',
    'Projet', 'Plans d\'exécution', 'Dossier de consultation', 'Suivi architectural', 'Réception',
  ],
  construction: [
    'Préparation chantier', 'Terrassement', 'Fondations', 'Gros œuvre', 'Charpente',
    'Couverture', 'Second œuvre', 'Finitions', 'Réception',
  ],
}

function buildInitialJalons(type) {
  const titles = MISSION_JALONS[type] || []
  return titles.map((title, i) => ({
    id: `jalon_${i}`,
    title,
    status: 'not_started',
    order: i,
  }))
}

function computeAvancement(jalons) {
  if (!Array.isArray(jalons) || jalons.length === 0) return 0
  const done = jalons.filter(j => j.status === 'completed' || j.status === 'validated').length
  return Math.round(done / jalons.length * 100)
}

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

// ─── GET /api/missions ───────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const userId = req.user.id
    const { projectId } = req.query
    const where = {}

    if (projectId) {
      const canAccess = await userCanAccessProject(prisma, userId, projectId)
      if (!canAccess) throw createError('Accès non autorisé à ce projet', 403)
      where.projectId = projectId
    } else {
      where.OR = [{ createdBy: userId }, { responsibleUserId: userId }]
    }

    const missions = await prisma.mission.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true, company: true } },
        responsibleUser: { select: { id: true, name: true, email: true, avatar: true, company: true } },
      },
    })
    res.json(missions)
  } catch (e) { next(e) }
})

// ─── GET /api/missions/:id ───────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const mission = await prisma.mission.findUnique({
      where: { id: req.params.id },
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true, company: true } },
        responsibleUser: { select: { id: true, name: true, email: true, avatar: true, company: true } },
      },
    })
    if (!mission) throw createError('Mission introuvable', 404)

    const canAccess = await userCanAccessProject(prisma, req.user.id, mission.projectId)
    const isCreator = mission.createdBy === req.user.id
    const isResponsible = mission.responsibleUserId === req.user.id
    if (!canAccess && !isCreator && !isResponsible) throw createError('Accès non autorisé', 403)

    res.json(mission)
  } catch (e) { next(e) }
})

// ─── POST /api/missions ──────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { projectId, type, title, description, responsibleUserId, responsibleName, responsibleEmail } = req.body

    if (!projectId) throw createError('projectId requis', 400)
    if (!type) throw createError('type requis', 400)
    if (!title) throw createError('title requis', 400)

    const canAccess = await userCanAccessProject(prisma, req.user.id, projectId)
    if (!canAccess) throw createError('Accès non autorisé à ce projet', 403)

    const jalons = buildInitialJalons(type)
    let status = 'created'

    // Si un responsable est désigné, passer en invitation_sent
    if (responsibleUserId) {
      const user = await prisma.user.findUnique({ where: { id: responsibleUserId }, select: { id: true } })
      if (user) status = 'invitation_sent'
    }

    const mission = await prisma.mission.create({
      data: {
        projectId,
        type,
        title,
        description: description || '',
        status,
        jalons,
        responsibleUserId: responsibleUserId || null,
        responsibleName: responsibleName || '',
        responsibleEmail: responsibleEmail || '',
        createdBy: req.user.id,
      },
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true, company: true } },
        responsibleUser: { select: { id: true, name: true, email: true, avatar: true, company: true } },
      },
    })

    // Notifier le responsable si désigné
    if (responsibleUserId && responsibleUserId !== req.user.id) {
      const io = getIo()
      if (io) {
        io.to(`user:${responsibleUserId}`).emit('notification:new', {
          id: 'mission_invite_' + mission.id,
          msg: (req.user.company || req.user.name || 'Un coordinateur') + ' vous invite sur la mission « ' + title + ' »',
          type: 'blue',
          read: false,
          createdAt: new Date().toISOString(),
          page: 'missions',
        })
      }
    }

    res.status(201).json(mission)
  } catch (e) { next(e) }
})

// ─── PATCH /api/missions/:id ─────────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const mission = await prisma.mission.findUnique({ where: { id: req.params.id } })
    if (!mission) throw createError('Mission introuvable', 404)

    const isCreator = mission.createdBy === req.user.id
    const isResponsible = mission.responsibleUserId === req.user.id
    const hasProjectAccess = await userCanAccessProject(prisma, req.user.id, mission.projectId)
    if (!isCreator && !isResponsible && !hasProjectAccess) throw createError('Accès non autorisé', 403)

    const allowed = [
      'title', 'description', 'status', 'avancement',
      'responsibleUserId', 'responsibleName', 'responsibleEmail',
      'jalons', 'conversationId', 'startedAt', 'completedAt', 'archivedAt',
    ]
    const data = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (['startedAt', 'completedAt', 'archivedAt'].includes(key)) {
          data[key] = req.body[key] ? new Date(req.body[key]) : null
        } else {
          data[key] = req.body[key]
        }
      }
    }

    // Recalculer avancement si jalons mis à jour
    if (data.jalons && Array.isArray(data.jalons)) {
      data.avancement = computeAvancement(data.jalons)
    }

    // Auto-créer conversation quand la mission est acceptée
    if (data.status === 'accepted' && mission.status !== 'accepted' && !mission.conversationId) {
      const participants = [mission.createdBy]
      if (mission.responsibleUserId && mission.responsibleUserId !== mission.createdBy) {
        participants.push(mission.responsibleUserId)
      }

      const conversation = await prisma.conversation.create({
        data: {
          isGroup: false,
          title: 'Mission : ' + (mission.title || ''),
          type: 'mission',
          projectId: mission.projectId,
          missionId: mission.id,
          participants: {
            create: participants.map(uid => ({ userId: uid })),
          },
        },
      })
      data.conversationId = conversation.id
      data.startedAt = new Date()

      // Auto-créer un contact CRM intervenant
      if (mission.responsibleUserId && mission.responsibleUserId !== mission.createdBy) {
        await prisma.contact.create({
          data: {
            type: 'intervenant',
            nom: mission.responsibleName || 'Intervenant',
            email: mission.responsibleEmail || '',
            role: mission.type || '',
            statut: 'actif',
            ownerId: mission.createdBy,
          },
        }).catch(() => {}) // ignore si doublon
      }

      // Ajouter le responsable comme membre du projet si nécessaire
      if (mission.responsibleUserId) {
        await prisma.projectMember.upsert({
          where: {
            projectId_userId: { projectId: mission.projectId, userId: mission.responsibleUserId },
          },
          update: {},
          create: {
            projectId: mission.projectId,
            userId: mission.responsibleUserId,
            role: 'SUPPLIER',
            userName: mission.responsibleName || '',
            userEmail: mission.responsibleEmail || '',
          },
        })
      }
    }

    // Notifier sur changements de statut importants
    const io = getIo()
    if (io && data.status && data.status !== mission.status) {
      const targetUserId = isCreator ? mission.responsibleUserId : mission.createdBy
      if (targetUserId && targetUserId !== req.user.id) {
        const labels = {
          accepted: 'a accepté la mission',
          in_progress: 'a démarré la mission',
          pending_validation: 'demande la validation de la mission',
          validated: 'a validé la mission',
          completed: 'a terminé la mission',
        }
        const label = labels[data.status]
        if (label) {
          io.to(`user:${targetUserId}`).emit('notification:new', {
            id: 'mission_status_' + mission.id + '_' + Date.now(),
            msg: (req.user.company || req.user.name) + ' ' + label + ' « ' + mission.title + ' »',
            type: data.status === 'validated' || data.status === 'completed' ? 'green' : 'blue',
            read: false,
            createdAt: new Date().toISOString(),
            page: 'missions',
          })
        }
      }
    }

    const updated = await prisma.mission.update({
      where: { id: req.params.id },
      data,
      include: {
        creator: { select: { id: true, name: true, email: true, avatar: true, company: true } },
        responsibleUser: { select: { id: true, name: true, email: true, avatar: true, company: true } },
      },
    })
    res.json(updated)
  } catch (e) { next(e) }
})

// ─── DELETE /api/missions/:id ────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const mission = await prisma.mission.findUnique({ where: { id: req.params.id } })
    if (!mission) throw createError('Mission introuvable', 404)

    const isCreator = mission.createdBy === req.user.id
    const isProjectOwner = !!(await prisma.project.findFirst({
      where: { id: mission.projectId, ownerId: req.user.id },
    }))
    if (!isCreator && !isProjectOwner) throw createError('Accès non autorisé', 403)

    await prisma.mission.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router
