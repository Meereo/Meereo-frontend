const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')

const router = Router()

// ─── GET /api/assets ─────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const where = {}
    if (req.query.projectId) where.projectId = req.query.projectId
    if (req.query.category) where.category = req.query.category
    if (req.query.status) where.status = req.query.status

    // Si pas de filtre projet, retourner les assets des projets accessibles
    if (!req.query.projectId) {
      const projects = await prisma.project.findMany({
        where: { OR: [{ ownerId: req.user.id }, { clientId: req.user.id }, { members: { some: { userId: req.user.id } } }] },
        select: { id: true },
      })
      where.projectId = { in: projects.map(p => p.id) }
    }

    const assets = await prisma.asset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { creator: { select: { id: true, name: true, company: true } } },
    })
    res.json(assets)
  } catch (e) { next(e) }
})

// ─── POST /api/assets ────────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { projectId, name, category, localisation, status, fabricant, fournisseur, reference, garantieDebut, garantieFin, garantieDoc, dureeVie, installDate, installateurId, notes, missionId } = req.body
    if (!projectId || !name) throw createError('projectId et name requis', 400)

    const asset = await prisma.asset.create({
      data: {
        projectId, name,
        category: category || '',
        localisation: localisation || '',
        status: status || 'planifie',
        fabricant: fabricant || null,
        fournisseur: fournisseur || null,
        reference: reference || null,
        garantieDebut: garantieDebut ? new Date(garantieDebut) : null,
        garantieFin: garantieFin ? new Date(garantieFin) : null,
        garantieDoc: garantieDoc || null,
        dureeVie: dureeVie || null,
        installDate: installDate ? new Date(installDate) : null,
        installateurId: installateurId || null,
        notes: notes || '',
        missionId: missionId || null,
        createdBy: req.user.id,
      },
    })
    res.status(201).json(asset)
  } catch (e) { next(e) }
})

// ─── PATCH /api/assets/:id ───────────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const asset = await prisma.asset.findUnique({ where: { id: req.params.id } })
    if (!asset) throw createError('Actif introuvable', 404)

    const allowed = ['name', 'category', 'localisation', 'status', 'fabricant', 'fournisseur', 'reference', 'garantieDebut', 'garantieFin', 'garantieDoc', 'dureeVie', 'installDate', 'installateurId', 'notes', 'documents', 'maintenances', 'missionId']
    const data = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        if (['garantieDebut', 'garantieFin', 'installDate'].includes(key)) {
          data[key] = req.body[key] ? new Date(req.body[key]) : null
        } else {
          data[key] = req.body[key]
        }
      }
    }
    const updated = await prisma.asset.update({ where: { id: req.params.id }, data })
    res.json(updated)
  } catch (e) { next(e) }
})

// ─── POST /api/assets/:id/maintenance — ajouter une maintenance ─────────────
router.post('/:id/maintenance', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const asset = await prisma.asset.findUnique({ where: { id: req.params.id } })
    if (!asset) throw createError('Actif introuvable', 404)

    const { date, entreprise, description, pieces, rapport } = req.body
    const maintenance = {
      id: 'maint_' + Date.now(),
      date: date || new Date().toISOString(),
      entreprise: entreprise || '',
      description: description || '',
      pieces: pieces || '',
      rapport: rapport || '',
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
    }

    const maintenances = Array.isArray(asset.maintenances) ? [...asset.maintenances, maintenance] : [maintenance]
    const updated = await prisma.asset.update({
      where: { id: req.params.id },
      data: { maintenances, status: 'en_maintenance' },
    })
    res.json(updated)
  } catch (e) { next(e) }
})

// ─── DELETE /api/assets/:id ──────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const asset = await prisma.asset.findUnique({ where: { id: req.params.id } })
    if (!asset) throw createError('Actif introuvable', 404)
    if (asset.createdBy !== req.user.id) throw createError('Accès non autorisé', 403)
    await prisma.asset.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router
