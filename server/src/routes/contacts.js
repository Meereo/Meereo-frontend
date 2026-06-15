const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')

const router = Router()

// ─── GET /api/contacts ────────────────────────────────────────────────────────
// Retourne les contacts (clients/intervenants) de l'utilisateur connecté.
// ?type=client | ?type=intervenant  pour filtrer
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const where = { ownerId: req.user.id }
    if (req.query.type) where.type = req.query.type

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    res.json(contacts)
  } catch (e) { next(e) }
})

// ─── POST /api/contacts ───────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { type, nom, email, tel, role, poste, statut, entreprise } = req.body
    if (!nom)  throw createError('nom requis', 400)
    if (!type || !['client', 'intervenant'].includes(type))
      throw createError('type doit être "client" ou "intervenant"', 400)

    const contact = await prisma.contact.create({
      data: {
        type,
        nom,
        email:     email     || null,
        tel:       tel       || null,
        role:      role      || null,
        poste:     poste     || null,
        statut:    statut    || null,
        entreprise: entreprise || null,
        ownerId:   req.user.id,
      },
    })
    res.status(201).json(contact)
  } catch (e) { next(e) }
})

// ─── PATCH /api/contacts/:id ──────────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const contact = await prisma.contact.findUnique({ where: { id: req.params.id } })
    if (!contact) throw createError('Contact introuvable', 404)
    if (contact.ownerId !== req.user.id) throw createError('Accès non autorisé', 403)

    const allowed = ['nom', 'email', 'tel', 'role', 'poste', 'statut', 'entreprise']
    const data = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key]
    }
    const updated = await prisma.contact.update({ where: { id: req.params.id }, data })
    res.json(updated)
  } catch (e) { next(e) }
})

// ─── DELETE /api/contacts/:id ─────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const contact = await prisma.contact.findUnique({ where: { id: req.params.id } })
    if (!contact) throw createError('Contact introuvable', 404)
    if (contact.ownerId !== req.user.id) throw createError('Accès non autorisé', 403)
    await prisma.contact.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router
