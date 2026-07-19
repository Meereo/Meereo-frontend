const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')

const router = Router()

// GET /api/products — tous les produits publiés (accessible sans auth)
router.get('/', async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50))
    const skip = (page - 1) * limit

    const products = await prisma.product.findMany({
      where: { isPublished: true, status: 'active' },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
            company: true,
            fournisseurProfile: { select: { entreprise: true, logoFileUrl: true, ville: true } },
          },
        },
      },
      orderBy: [{ sponsored: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      skip,
    })
    res.json(products)
  } catch (e) {
    next(e)
  }
})

// GET /api/products/mine — mes produits (fournisseur connecté)
router.get('/mine', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const products = await prisma.product.findMany({
      where: { supplierId: req.user.id },
      orderBy: { createdAt: 'desc' },
    })
    res.json(products)
  } catch (e) {
    next(e)
  }
})

// POST /api/products — créer un produit (fournisseur connecté)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { name, category, price, unit, description, photoUrl, sponsored, flash, flashPrice, ficheUrl, noticeUrl, certificatUrl, garantieUrl, garantieDuree } = req.body
    if (!name || !name.trim()) throw createError('Le nom du produit est requis', 400)
    const prisma = getPrisma()
    const product = await prisma.product.create({
      data: {
        supplierId: req.user.id,
        name: name.trim(),
        category: category || '',
        price: parseFloat(price) || 0,
        unit: unit || 'unité',
        description: description || '',
        photoUrl: photoUrl || null,
        ficheUrl: ficheUrl || null,
        noticeUrl: noticeUrl || null,
        certificatUrl: certificatUrl || null,
        garantieUrl: garantieUrl || null,
        garantieDuree: garantieDuree || null,
        sponsored: sponsored || false,
        flash: flash || false,
        flashPrice: flashPrice ? parseFloat(flashPrice) : null,
      },
    })
    res.status(201).json(product)
  } catch (e) {
    next(e)
  }
})

// PATCH /api/products/:id — modifier un produit
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } })
    if (!existing) throw createError('Produit introuvable', 404)
    if (existing.supplierId !== req.user.id) throw createError('Non autorisé', 403)
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name: req.body.name ?? existing.name,
        category: req.body.category ?? existing.category,
        price: req.body.price !== undefined ? parseFloat(req.body.price) : existing.price,
        unit: req.body.unit ?? existing.unit,
        description: req.body.description ?? existing.description,
        photoUrl: req.body.photoUrl !== undefined ? req.body.photoUrl : existing.photoUrl,
        ficheUrl: req.body.ficheUrl !== undefined ? req.body.ficheUrl : existing.ficheUrl,
        noticeUrl: req.body.noticeUrl !== undefined ? req.body.noticeUrl : existing.noticeUrl,
        certificatUrl: req.body.certificatUrl !== undefined ? req.body.certificatUrl : existing.certificatUrl,
        garantieUrl: req.body.garantieUrl !== undefined ? req.body.garantieUrl : existing.garantieUrl,
        garantieDuree: req.body.garantieDuree !== undefined ? req.body.garantieDuree : existing.garantieDuree,
        isPublished: req.body.isPublished !== undefined ? req.body.isPublished : existing.isPublished,
        sponsored: req.body.sponsored ?? existing.sponsored,
        flash: req.body.flash ?? existing.flash,
        flashPrice: req.body.flashPrice !== undefined ? parseFloat(req.body.flashPrice) : existing.flashPrice,
        status: req.body.status ?? existing.status,
      },
    })
    res.json(product)
  } catch (e) {
    next(e)
  }
})

// DELETE /api/products/:id — archiver un produit (soft delete)
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.product.findUnique({ where: { id: req.params.id } })
    if (!existing) throw createError('Produit introuvable', 404)
    if (existing.supplierId !== req.user.id) throw createError('Non autorisé', 403)
    await prisma.product.update({ where: { id: req.params.id }, data: { status: 'archived', isPublished: false } })
    res.json({ success: true })
  } catch (e) {
    next(e)
  }
})

module.exports = router
