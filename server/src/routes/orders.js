const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')

const router = Router()

// ─── GET /api/orders ─────────────────────────────────────────────────────────
// Acheteur → ses commandes passées
// Fournisseur → commandes reçues sur ses produits (sellerId = moi)
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const user = req.user

    let orders
    if (user.type === 'fournisseur') {
      orders = await prisma.order.findMany({
        where: { sellerId: user.id },
        include: { buyer: { select: { id: true, name: true, company: true, type: true } } },
        orderBy: { createdAt: 'desc' },
      })
    } else {
      // pro ou client — commandes passées
      orders = await prisma.order.findMany({
        where: { buyerId: user.id },
        include: { seller: { select: { id: true, name: true, company: true, fournisseurProfile: { select: { entreprise: true } } } } },
        orderBy: { createdAt: 'desc' },
      })
    }
    res.json(orders)
  } catch (e) {
    next(e)
  }
})

// ─── POST /api/orders ─────────────────────────────────────────────────────────
// Créer une commande (pro/client qui achète)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { ref, designation, fournisseur, sellerId, items, total, statut, livMode, step, projet, address, paymentMethod, img } = req.body
    if (!ref) throw createError('ref requis', 400)
    if (!total && total !== 0) throw createError('total requis', 400)

    const order = await prisma.order.create({
      data: {
        ref,
        buyerId: req.user.id,
        sellerId: sellerId || null,
        designation: designation || '',
        fournisseur: fournisseur || '',
        items: items || [],
        total: parseFloat(total) || 0,
        statut: statut || 'confirmee',
        livMode: livMode || 'retrait',
        step: step || 1,
        projet: projet || '',
        address: address || '',
        paymentMethod: paymentMethod || '',
        img: img || null,
      },
      include: { seller: { select: { id: true, name: true, company: true, fournisseurProfile: { select: { entreprise: true } } } } },
    })
    res.status(201).json(order)
  } catch (e) {
    next(e)
  }
})

// ─── PATCH /api/orders/:id ────────────────────────────────────────────────────
// Fournisseur met à jour le step/statut
// Acheteur peut annuler la sienne si step === 1
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.order.findUnique({ where: { id: req.params.id } })
    if (!existing) throw createError('Commande introuvable', 404)

    const user = req.user
    const isBuyer = existing.buyerId === user.id
    const isSeller = existing.sellerId === user.id

    if (!isBuyer && !isSeller) throw createError('Non autorisé', 403)

    const allowed = {}
    if (isSeller) {
      if (req.body.step !== undefined) allowed.step = parseInt(req.body.step)
      if (req.body.statut !== undefined) allowed.statut = req.body.statut
    }
    if (isBuyer && existing.step === 1 && req.body.statut === 'annulee') {
      allowed.statut = 'annulee'
    }

    if (Object.keys(allowed).length === 0) throw createError('Aucune modification autorisée', 400)

    const updated = await prisma.order.update({ where: { id: req.params.id }, data: allowed })
    res.json(updated)
  } catch (e) {
    next(e)
  }
})

// ─── DELETE /api/orders/:id ──────────────────────────────────────────────────────
// Acheteur peut supprimer sa commande si elle est annulée ou au step 1
// Fournisseur peut supprimer une commande terminée
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.order.findUnique({ where: { id: req.params.id } })
    if (!existing) throw createError('Commande introuvable', 404)

    const user = req.user
    const isBuyer  = existing.buyerId  === user.id
    const isSeller = existing.sellerId === user.id

    if (!isBuyer && !isSeller) throw createError('Non autorisé', 403)

    // Buyer can delete if cancelled or step 1; seller can delete completed orders
    const canDelete =
      (isBuyer  && (existing.statut === 'annulee' || existing.step === 1)) ||
      (isSeller && (existing.statut === 'completed' || existing.statut === 'delivered'))

    if (!canDelete) throw createError('Suppression non autorisée dans cet état', 400)

    await prisma.order.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router
