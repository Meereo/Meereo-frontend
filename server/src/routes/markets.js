const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')

const router = Router()

// ─── GET /api/markets ─────────────────────────────────────────────────────────
// Client  → ses marchés (clientId = moi)
// Pro     → marchés dont il est prestataire (supplierId = moi)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const user = req.user

    let where = {}
    if (user.type === 'client') {
      where.clientId = user.id
    } else if (user.type === 'pro') {
      where.supplierId = user.id
    }
    // fournisseur : aucun marché de prestation (pas de where → liste vide volontairement)
    // On filtre explicitement pour le fournisseur
    if (user.type === 'fournisseur') {
      return res.json([])
    }

    const markets = await prisma.market.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    res.json(markets)
  } catch (e) {
    next(e)
  }
})

// ─── GET /api/markets/:id ─────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const market = await prisma.market.findUnique({ where: { id: req.params.id } })
    if (!market) throw createError('Marché introuvable', 404)
    // Vérifier accès
    if (market.clientId !== req.user.id && market.supplierId !== req.user.id) {
      throw createError('Accès non autorisé', 403)
    }
    res.json(market)
  } catch (e) {
    next(e)
  }
})

// ─── POST /api/markets ────────────────────────────────────────────────────────
// Créer un marché (déclenché par acceptOffer côté client)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const {
      titre, lot, entreprise, montant, statut, avancement,
      description, delai, projectId, aoId, offerId,
      clientId, supplierId, milestones, validations, documents,
    } = req.body

    const market = await prisma.market.create({
      data: {
        titre:       titre       || '',
        lot:         lot         || '',
        entreprise:  entreprise  || '',
        montant:     montant     || '0',
        statut:      statut      || 'signed',
        avancement:  typeof avancement === 'number' ? avancement : 0,
        description: description || '',
        delai:       delai       || '',
        projectId:   projectId   || null,
        aoId:        aoId        || null,
        offerId:     offerId     || null,
        clientId:    clientId    || null,
        supplierId:  supplierId  || null,
        milestones:  milestones  || [],
        validations: validations || [],
        documents:   documents   || [],
      },
    })
    res.status(201).json(market)
  } catch (e) {
    next(e)
  }
})

// ─── PATCH /api/markets/:id ───────────────────────────────────────────────────
// Mettre à jour statut, avancement, milestones, validations, documents
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const market = await prisma.market.findUnique({ where: { id: req.params.id } })
    if (!market) throw createError('Marché introuvable', 404)

    // Seul le client ou le prestataire peut modifier
    if (market.clientId !== req.user.id && market.supplierId !== req.user.id) {
      throw createError('Accès non autorisé', 403)
    }

    const allowed = [
      'statut', 'avancement', 'description', 'delai', 'titre', 'lot',
      'entreprise', 'montant', 'projectId', 'milestones', 'validations', 'documents',
    ]
    const data = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key]
    }

    const updated = await prisma.market.update({
      where: { id: req.params.id },
      data,
    })
    res.json(updated)
  } catch (e) {
    next(e)
  }
})

// ─── DELETE /api/markets/:id ──────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const market = await prisma.market.findUnique({ where: { id: req.params.id } })
    if (!market) throw createError('Marché introuvable', 404)
    if (market.clientId !== req.user.id) throw createError('Accès non autorisé', 403)

    await prisma.market.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) {
    next(e)
  }
})

module.exports = router
