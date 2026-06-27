const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { randomUUID } = require('crypto')

const router = Router()

// ─── Uploads directory ────────────────────────────────────────────────────────
const UPLOADS_BASE = path.join(__dirname, '../../uploads/documents')
fs.mkdirSync(UPLOADS_BASE, { recursive: true })

// Multer — memory storage so we can read projectId from body first
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
})

// ─── Helper: check project access ─────────────────────────────────────────────
async function userCanAccessProject(prisma, userId, projectId) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, clientId: true },
  })
  if (!project) return false
  if (project.ownerId === userId || project.clientId === userId) return true
  const isMember = await prisma.projectMember.findFirst({ where: { projectId, userId } })
  if (isMember) return true
  const isSupplier = await prisma.market.findFirst({ where: { projectId, supplierId: userId } })
  return !!isSupplier
}

// ─── GET /api/documents ───────────────────────────────────────────────────────
// Retourne tous les documents des projets accessibles à l'utilisateur
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const userId = req.user.id

    // Collect all project IDs the user has access to
    const [ownedProjects, memberProjects, supplierMarkets] = await Promise.all([
      prisma.project.findMany({
        where: { OR: [{ ownerId: userId }, { clientId: userId }] },
        select: { id: true },
      }),
      prisma.projectMember.findMany({
        where: { userId },
        select: { projectId: true },
      }),
      prisma.market.findMany({
        where: { supplierId: userId, projectId: { not: null } },
        select: { projectId: true },
      }),
    ])

    const accessibleIds = [
      ...new Set([
        ...ownedProjects.map(p => p.id),
        ...memberProjects.map(m => m.projectId),
        ...supplierMarkets.map(m => m.projectId),
      ]),
    ]

    // Filter by projectId if requested
    const projectIdFilter = req.query.projectId

    let where = projectIdFilter
      ? { projectId: projectIdFilter }
      : accessibleIds.length
        ? { OR: [{ userId }, { projectId: { in: accessibleIds } }] }
        : { userId }

    // Filtre optionnel par type (ex: type=photo pour la galerie)
    if (req.query.type) {
      where = { ...where, type: req.query.type }
    }

    const docs = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    res.json(docs)
  } catch (e) { next(e) }
})

// ─── POST /api/documents/upload — multipart file upload ───────────────────────
router.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw createError('Aucun fichier reçu', 400)

    const prisma = getPrisma()
    const { name, type, projectId } = req.body
    const isEntreprise = req.body.isEntreprise === 'true' || req.body.isEntreprise === true
    const userId = req.user.id

    // Check project access if projectId is given
    if (projectId) {
      const canAccess = await userCanAccessProject(prisma, userId, projectId)
      if (!canAccess) throw createError('Accès non autorisé à ce projet', 403)
    }

    // Save file to disk: uploads/documents/{projectId|_general}/{uuid}{ext}
    const subfolder = projectId || '_general'
    const dir = path.join(UPLOADS_BASE, subfolder)
    fs.mkdirSync(dir, { recursive: true })

    const ext = path.extname(req.file.originalname) || ''
    const filename = `${randomUUID()}${ext}`
    const filePath = path.join(dir, filename)
    fs.writeFileSync(filePath, req.file.buffer)

    // URL served statically
    const url = `/uploads/documents/${subfolder}/${filename}`
    const docName = name || req.file.originalname.replace(/\.[^.]+$/, '')

    const doc = await prisma.document.create({
      data: {
        name:         docName,
        type:         type || '',
        url,
        projectId:    projectId || null,
        userId,
        isEntreprise: isEntreprise || (!projectId),
      },
    })
    res.status(201).json(doc)
  } catch (e) { next(e) }
})

// ─── POST /api/documents — JSON (url already hosted, e.g. MinIO) ──────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { name, type, url, projectId, isEntreprise } = req.body
    if (!name) throw createError('name requis', 400)

    const doc = await prisma.document.create({
      data: {
        name,
        type:         type        || '',
        url:          url         || '',
        projectId:    projectId   || null,
        userId:       req.user.id,
        isEntreprise: isEntreprise === true || isEntreprise === 'true' || (!projectId),
      },
    })
    res.status(201).json(doc)
  } catch (e) { next(e) }
})

// ─── PATCH /api/documents/:id ─────────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const doc = await prisma.document.findUnique({ where: { id: req.params.id } })
    if (!doc) throw createError('Document introuvable', 404)
    if (doc.userId !== req.user.id) throw createError('Accès non autorisé', 403)
    const { name, type, url, projectId } = req.body
    const updated = await prisma.document.update({
      where: { id: req.params.id },
      data: {
        ...(name      !== undefined ? { name }      : {}),
        ...(type      !== undefined ? { type }      : {}),
        ...(url       !== undefined ? { url }       : {}),
        ...(projectId !== undefined ? { projectId } : {}),
      },
    })
    res.json(updated)
  } catch (e) { next(e) }
})

// ─── DELETE /api/documents/:id ────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const doc = await prisma.document.findUnique({ where: { id: req.params.id } })
    if (!doc) throw createError('Document introuvable', 404)
    if (doc.userId !== req.user.id) throw createError('Accès non autorisé', 403)
    await prisma.document.delete({ where: { id: req.params.id } })

    // Delete physical file if it was stored locally
    if (doc.url && doc.url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, '../../', doc.url)
      fs.unlink(filePath, () => {}) // non-blocking, ignore errors
    }

    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router

