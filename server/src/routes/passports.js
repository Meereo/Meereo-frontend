const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')
const { getIo } = require('../socket')

const router = Router()

// ─── GET /api/passports — mes passeports numériques ─────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const passports = await prisma.passport.findMany({
      where: { OR: [{ ownerId: req.user.id }, { transferredTo: req.user.id }] },
      include: { project: { select: { id: true, nom: true, type: true, phase: true, avancement: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(passports)
  } catch (e) { next(e) }
})

// ─── GET /api/passports/:id — passeport complet avec tout le contexte ───────
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const passport = await prisma.passport.findUnique({
      where: { id: req.params.id },
      include: { project: true, owner: { select: { id: true, name: true, company: true, email: true } } },
    })
    if (!passport) throw createError('Passeport introuvable', 404)
    if (passport.ownerId !== req.user.id && passport.transferredTo !== req.user.id) {
      throw createError('Accès non autorisé', 403)
    }

    // Récupérer tout le contexte du projet
    const [assets, missions, documents, markets, members, decisions, timeline] = await Promise.all([
      prisma.asset.findMany({ where: { projectId: passport.projectId }, orderBy: { category: 'asc' } }),
      prisma.mission.findMany({ where: { projectId: passport.projectId }, include: { responsibleUser: { select: { id: true, name: true, company: true } } } }),
      prisma.document.findMany({ where: { projectId: passport.projectId, parentId: null }, orderBy: { createdAt: 'desc' } }),
      prisma.market.findMany({ where: { projectId: passport.projectId }, include: { supplier: { select: { id: true, name: true, company: true } } } }),
      prisma.projectMember.findMany({ where: { projectId: passport.projectId }, include: { user: { select: { id: true, name: true, company: true, metier: true } } } }),
      prisma.decision.findMany({ where: { projectId: passport.projectId }, orderBy: { createdAt: 'desc' } }),
      prisma.activity.findMany({
        where: { data: { path: ['_context', 'projectId'], equals: passport.projectId } },
        orderBy: { createdAt: 'desc' }, take: 100,
      }).catch(() => []),
    ])

    // Actifs avec garanties expirantes
    const now = new Date()
    const assetsWithAlerts = assets.map(a => ({
      ...a,
      garantieExpired: a.garantieFin && new Date(a.garantieFin) < now,
      garantieExpiringSoon: a.garantieFin && new Date(a.garantieFin) > now && (new Date(a.garantieFin) - now) < 30 * 24 * 60 * 60 * 1000,
    }))

    res.json({
      ...passport,
      assets: assetsWithAlerts,
      missions,
      documents,
      markets,
      members,
      decisions,
      timeline,
    })
  } catch (e) { next(e) }
})

// ─── POST /api/passports/generate/:projectId — générer le passeport ─────────
router.post('/generate/:projectId', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const project = await prisma.project.findUnique({ where: { id: req.params.projectId } })
    if (!project) throw createError('Projet introuvable', 404)
    if (project.ownerId !== req.user.id && project.clientId !== req.user.id) {
      throw createError('Seul le propriétaire ou le client peut générer le passeport', 403)
    }

    // Vérifier qu'un passeport n'existe pas déjà
    const existing = await prisma.passport.findUnique({ where: { projectId: project.id } })
    if (existing) return res.json(existing)

    // Snapshot du projet à la clôture
    const snapshot = {
      nom: project.nom,
      type: project.type,
      phase: project.phase,
      budget: project.budget,
      adresse: project.adresse,
      avancement: project.avancement,
      description: project.description,
      etapes: project.etapes,
      equipe: project.equipe,
      generatedAt: new Date().toISOString(),
    }

    const passport = await prisma.passport.create({
      data: {
        projectId: project.id,
        ownerId: project.clientId || project.ownerId,
        nom: project.nom,
        adresse: project.adresse || '',
        type: project.type || '',
        dateLivraison: project.livraison ? new Date(project.livraison) : null,
        snapshot,
      },
    })

    // Notifier le propriétaire
    const io = getIo()
    const targetId = project.clientId || project.ownerId
    if (io && targetId) {
      io.to(`user:${targetId}`).emit('notification:new', {
        id: 'passport_' + passport.id,
        msg: 'Le Passeport Numérique du projet « ' + project.nom + ' » a été généré',
        type: 'green',
        read: false,
        createdAt: new Date().toISOString(),
        page: 'passport',
      })
    }

    res.status(201).json(passport)
  } catch (e) { next(e) }
})

// ─── PATCH /api/passports/:id — transfert de propriété ──────────────────────
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const passport = await prisma.passport.findUnique({ where: { id: req.params.id } })
    if (!passport) throw createError('Passeport introuvable', 404)
    if (passport.ownerId !== req.user.id) throw createError('Accès non autorisé', 403)

    const { transferredTo, status } = req.body
    const data = {}
    if (transferredTo !== undefined) data.transferredTo = transferredTo
    if (status !== undefined) data.status = status

    const updated = await prisma.passport.update({ where: { id: req.params.id }, data })
    res.json(updated)
  } catch (e) { next(e) }
})

module.exports = router
