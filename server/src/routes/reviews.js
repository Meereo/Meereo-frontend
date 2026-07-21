const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')

const router = Router()

// GET /api/reviews?targetId=xxx — avis reçus par un professionnel
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { targetId } = req.query
    if (!targetId) throw createError('targetId requis', 400)

    const reviews = await prisma.review.findMany({
      where: { targetId },
      include: { author: { select: { id: true, name: true, company: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(reviews)
  } catch (e) { next(e) }
})

// POST /api/reviews — créer un avis (client uniquement, après projet)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { targetId, projectId, note, qualite, delais, communication, comment } = req.body
    if (!targetId) throw createError('targetId requis', 400)
    if (!note || note < 1 || note > 5) throw createError('Note entre 1 et 5 requise', 400)

    // Vérifier que l'auteur a collaboré avec la cible sur un projet
    const hasCollaboration = await prisma.projectMember.findFirst({
      where: {
        userId: targetId,
        project: { OR: [{ ownerId: req.user.id }, { clientId: req.user.id }] },
      },
    })
    if (!hasCollaboration) throw createError('Vous devez avoir collaboré avec ce professionnel pour laisser un avis', 403)

    // Vérifier que le projet est en statut completed ou cloture (si projectId fourni)
    if (projectId) {
      const project = await prisma.project.findUnique({ where: { id: projectId }, select: { status: true } })
      if (project && !['completed', 'cloture'].includes(project.status)) {
        throw createError('Les avis ne peuvent être déposés que sur un projet terminé ou clôturé', 400)
      }
    }

    // Seul un client peut évaluer un professionnel (pas l'inverse)
    if (req.user.type === 'pro') {
      throw createError('Seul un client peut évaluer un professionnel', 403)
    }

    const review = await prisma.review.upsert({
      where: { authorId_targetId_projectId: { authorId: req.user.id, targetId, projectId: projectId || '' } },
      update: { note, qualite: qualite || null, delais: delais || null, communication: communication || null, comment: comment || '' },
      create: {
        authorId: req.user.id,
        targetId,
        projectId: projectId || null,
        note,
        qualite: qualite || null,
        delais: delais || null,
        communication: communication || null,
        comment: comment || '',
      },
    })
    res.status(201).json(review)
  } catch (e) { next(e) }
})

module.exports = router
