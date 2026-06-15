const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')

const router = Router()

// Champs modifiables
const ALLOWED = [
  'nom', 'type', 'phase', 'budget', 'adresse', 'livraison', 'priorite',
  'description', 'avancement', 'status', 'client', 'clientEmail',
  'clientId', 'color', 'etapes', 'equipe', 'sourceAoId',
]

// ─── GET /api/projects ────────────────────────────────────────────────────────
// Renvoie les projets où l'utilisateur est owner OU membre
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const userId = req.user.id

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { clientId: userId },
          { members: { some: { userId } } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(projects)
  } catch (e) { next(e) }
})

// ─── GET /api/projects/:id ────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const project = await prisma.project.findUnique({ where: { id: req.params.id } })
    if (!project) throw createError('Projet introuvable', 404)
    res.json(project)
  } catch (e) { next(e) }
})

// ─── POST /api/projects ───────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { nom, type, phase, budget, adresse, livraison, priorite, description,
            avancement, status, client, clientEmail, clientId, color, etapes,
            equipe, sourceAoId } = req.body
    if (!nom) throw createError('nom requis', 400)

    const project = await prisma.project.create({
      data: {
        nom, ownerId: req.user.id,
        type:        type        || '',
        phase:       phase       || 'CONCEPTION',
        budget:      budget      || '',
        adresse:     adresse     || '',
        livraison:   livraison   || null,
        priorite:    priorite    || 'normale',
        description: description || '',
        avancement:  typeof avancement === 'number' ? avancement : 0,
        status:      status      || 'active',
        client:      client      || '',
        clientEmail: clientEmail || '',
        clientId:    clientId    || null,
        color:       color       || null,
        etapes:      etapes      || null,
        equipe:      equipe      || null,
        sourceAoId:  sourceAoId  || null,
      },
    })
    res.status(201).json(project)
  } catch (e) { next(e) }
})

// ─── PATCH /api/projects/:id ──────────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const project = await prisma.project.findUnique({ where: { id: req.params.id } })
    if (!project) throw createError('Projet introuvable', 404)
    if (project.ownerId !== req.user.id) {
      // Permettre aux membres de modifier l'avancement
      const isMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: req.params.id, userId: req.user.id } },
      })
      if (!isMember) throw createError('Accès non autorisé', 403)
    }
    const data = {}
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) data[key] = req.body[key]
    }
    const updated = await prisma.project.update({ where: { id: req.params.id }, data })
    res.json(updated)
  } catch (e) { next(e) }
})

// ─── DELETE /api/projects/:id ─────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const project = await prisma.project.findUnique({ where: { id: req.params.id } })
    if (!project) throw createError('Projet introuvable', 404)
    if (project.ownerId !== req.user.id) throw createError('Accès non autorisé', 403)
    await prisma.project.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router
