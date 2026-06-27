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
      // Le pro peut être prestataire (supplierId) OU maître d'ouvrage (clientId)
      where = { OR: [{ supplierId: user.id }, { clientId: user.id }] }
    }
    // fournisseur : aucun marché de prestation (pas de where → liste vide volontairement)
    // On filtre explicitement pour le fournisseur
    if (user.type === 'fournisseur') {
      return res.json([])
    }

    const markets = await prisma.market.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { id: true, name: true, company: true, email: true } },
        supplier: { select: { id: true, name: true, company: true } },
      },
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

    // Auto-ajouter le prestataire comme membre du projet dès la signature du marché
    if (supplierId && market.projectId) {
      try {
        const supplierUser = await prisma.user.findUnique({
          where: { id: supplierId },
          select: { name: true, email: true },
        })
        await prisma.projectMember.upsert({
          where: { projectId_userId: { projectId: market.projectId, userId: supplierId } },
          update: { role: 'SUPPLIER' },
          create: {
            projectId: market.projectId,
            userId:    supplierId,
            role:      'SUPPLIER',
            userName:  supplierUser?.name  || entreprise || '',
            userEmail: supplierUser?.email || '',
          },
        })
      } catch (_) { /* non bloquant */ }
    }

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

    // Seul le client ou le prestataire peut accéder au marché
    if (market.clientId !== req.user.id && market.supplierId !== req.user.id) {
      throw createError('Accès non autorisé', 403)
    }

    // Seul le maître d'ouvrage (clientId) peut changer le statut du marché
    if (req.body.statut !== undefined && market.clientId !== req.user.id) {
      throw createError("Seul le maître d'ouvrage peut modifier le statut du marché", 403)
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

    // Rétrocompat : si le marché a un supplierId + projectId mais pas encore de ProjectMember, l'ajouter
    const pid = updated.projectId || market.projectId
    const sid = updated.supplierId || market.supplierId
    if (pid && sid) {
      try {
        const supplierUser = await prisma.user.findUnique({
          where: { id: sid },
          select: { name: true, email: true },
        })
        await prisma.projectMember.upsert({
          where: { projectId_userId: { projectId: pid, userId: sid } },
          update: { role: 'SUPPLIER' },
          create: {
            projectId: pid,
            userId:    sid,
            role:      'SUPPLIER',
            userName:  supplierUser?.name  || updated.entreprise || '',
            userEmail: supplierUser?.email || '',
          },
        })
      } catch (_) { /* non bloquant */ }
    }

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
