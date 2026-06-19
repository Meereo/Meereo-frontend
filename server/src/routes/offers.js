const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')

const router = Router()

// GET /api/offers
// - pro/fournisseur : leurs propres offres soumises
// - client : offres reçues sur SES AOs
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const user = req.user

    let where = {}
    if (user.type === 'client') {
      // Récupérer les AO du client, puis les offres associées
      const myAOs = await prisma.aO.findMany({ where: { ownerUserId: user.id }, select: { id: true } })
      const aoIds = myAOs.map(a => a.id)
      if (aoIds.length === 0) return res.json([])
      where.aoId = { in: aoIds }
    } else {
      // Pro/fournisseur : leurs offres soumises
      where.supplierId = user.id
    }

    const offers = await prisma.offer.findMany({
      where,
      include: {
        supplier: { select: { id: true, name: true, company: true, type: true, publicId: true, proProfile: { select: { entreprise: true } }, fournisseurProfile: { select: { entreprise: true } } } },
        ao: { select: { id: true, title: true, lot: true, ownerUserId: true, projectId: true, owner: { select: { id: true, name: true, company: true, publicId: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(offers)
  } catch (e) {
    next(e)
  }
})

// POST /api/offers — pro/fournisseur soumet une offre
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { aoId, entreprise, montant, delai, message } = req.body
    if (!aoId) throw createError('aoId requis', 400)
    if (!montant) throw createError('Montant requis', 400)

    const prisma = getPrisma()

    // Vérifier que l'AO existe et est ouvert
    const ao = await prisma.aO.findUnique({ where: { id: aoId } })
    if (!ao) throw createError('Appel d\'offres introuvable', 404)
    if (ao.status !== 'open') throw createError('Cet appel d\'offres n\'est plus ouvert', 400)

    // Interdire de répondre à son propre AO
    if (ao.ownerUserId === req.user.id) throw createError('Vous ne pouvez pas répondre à votre propre AO', 403)

    // Créer ou mettre à jour (upsert — un pro = une offre par AO)
    const offer = await prisma.offer.upsert({
      where: { aoId_supplierId: { aoId, supplierId: req.user.id } },
      update: { entreprise: entreprise || '', montant: String(montant), delai: delai || '', message: message || '' },
      create: {
        aoId,
        supplierId: req.user.id,
        entreprise: entreprise || req.user.company || req.user.name || '',
        montant: String(montant),
        delai: delai || '',
        message: message || '',
        statut: 'pending',
      },
    })
    res.status(201).json(offer)
  } catch (e) {
    next(e)
  }
})

// PATCH /api/offers/:id — client accepte/refuse, pro modifie la sienne
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.offer.findUnique({ where: { id: req.params.id }, include: { ao: true } })
    if (!existing) throw createError('Offre introuvable', 404)

    const user = req.user
    const isOwner = existing.supplierId === user.id
    const isAOOwner = existing.ao?.ownerUserId === user.id

    if (!isOwner && !isAOOwner) throw createError('Non autorisé', 403)

    const allowed = {}
    if (isAOOwner && req.body.statut !== undefined) allowed.statut = req.body.statut
    if (isOwner && existing.statut === 'pending') {
      if (req.body.montant !== undefined) allowed.montant = String(req.body.montant)
      if (req.body.delai !== undefined) allowed.delai = req.body.delai
      if (req.body.message !== undefined) allowed.message = req.body.message
    }

    const updated = await prisma.offer.update({ where: { id: req.params.id }, data: allowed })
    res.json(updated)
  } catch (e) {
    next(e)
  }
})

module.exports = router
