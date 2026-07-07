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
    if (!type || !['client', 'intervenant', 'fournisseur'].includes(type))
      throw createError('type doit être "client", "intervenant" ou "fournisseur"', 400)

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

    const allowed = ['nom', 'email', 'tel', 'role', 'poste', 'statut', 'entreprise', 'relationshipStatus', 'linkedUserId']
    const data = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key]
    }
    const updated = await prisma.contact.update({ where: { id: req.params.id }, data })
    res.json(updated)
  } catch (e) { next(e) }
})

// ─── GET /api/contacts/:id/history — historique unifié projets/AO/marchés/commandes ──
router.get('/:id/history', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const contact = await prisma.contact.findUnique({ where: { id: req.params.id } })
    if (!contact) throw createError('Contact introuvable', 404)
    if (contact.ownerId !== req.user.id) throw createError('Accès non autorisé', 403)

    // Chercher l'utilisateur MEEREO lié (par email ou linkedUserId)
    const linkedId = contact.linkedUserId
    const linkedEmail = contact.email

    let projects = [], markets = [], offers = [], orders = []

    if (linkedId) {
      // Projets en commun
      const myProjectIds = (await prisma.project.findMany({ where: { ownerId: req.user.id }, select: { id: true } })).map(p => p.id)
      projects = await prisma.projectMember.findMany({
        where: { userId: linkedId, projectId: { in: myProjectIds } },
        include: { project: { select: { id: true, nom: true, phase: true, avancement: true, status: true, createdAt: true } } },
      })
      // Marchés ensemble
      markets = await prisma.market.findMany({
        where: { OR: [{ supplierId: linkedId, clientId: req.user.id }, { clientId: linkedId, supplierId: req.user.id }] },
        select: { id: true, titre: true, lot: true, entreprise: true, montant: true, statut: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      })
      // Offres sur mes AO
      const myAOs = (await prisma.aO.findMany({ where: { ownerUserId: req.user.id }, select: { id: true } })).map(a => a.id)
      if (myAOs.length > 0) {
        offers = await prisma.offer.findMany({
          where: { supplierId: linkedId, aoId: { in: myAOs } },
          include: { ao: { select: { id: true, title: true, lot: true } } },
          orderBy: { createdAt: 'desc' },
        })
      }
      // Commandes
      orders = await prisma.order.findMany({
        where: { OR: [{ buyerId: req.user.id, sellerId: linkedId }, { buyerId: linkedId, sellerId: req.user.id }] },
        select: { id: true, ref: true, designation: true, total: true, statut: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      })
    }

    res.json({
      contact,
      projects: projects.map(p => p.project).filter(Boolean),
      markets,
      offers,
      orders,
    })
  } catch (e) { next(e) }
})

// ─── GET /api/contacts/network — réseau professionnel (graphe de relations) ──
router.get('/network/graph', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const userId = req.user.id

    // Récupérer tous les contacts
    const contacts = await prisma.contact.findMany({
      where: { ownerId: userId },
      select: { id: true, nom: true, type: true, relationshipStatus: true, linkedUserId: true, entreprise: true },
    })

    // Récupérer les projets pour trouver les liens
    const projects = await prisma.project.findMany({
      where: { ownerId: userId },
      select: { id: true, nom: true },
    })
    const projectIds = projects.map(p => p.id)

    // Trouver tous les membres de mes projets (= mon réseau)
    const members = projectIds.length > 0 ? await prisma.projectMember.findMany({
      where: { projectId: { in: projectIds }, userId: { not: userId } },
      include: { user: { select: { id: true, name: true, company: true, metier: true } }, project: { select: { id: true, nom: true } } },
    }) : []

    // Construire les nœuds et liens
    const nodes = [
      { id: userId, label: req.user.company || req.user.name, type: 'self' },
      ...contacts.map(c => ({ id: c.id, label: c.nom, type: c.type, status: c.relationshipStatus })),
    ]
    const links = contacts.map(c => ({ source: userId, target: c.id, type: c.type }))

    // Enrichir avec les relations indirectes (membres de projets qui ne sont pas dans mes contacts)
    const contactLinkedIds = new Set(contacts.map(c => c.linkedUserId).filter(Boolean))
    members.forEach(m => {
      if (!contactLinkedIds.has(m.userId)) {
        const nodeId = 'member_' + m.userId
        if (!nodes.find(n => n.id === nodeId)) {
          nodes.push({ id: nodeId, label: m.user.company || m.user.name, type: 'collaborateur', metier: m.user.metier })
          links.push({ source: userId, target: nodeId, type: 'projet', project: m.project.nom })
        }
      }
    })

    res.json({ nodes, links, projectCount: projects.length })
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
