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

// ─── Helper: save file to disk ────────────────────────────────────────────────
function saveFileToDisk(fileBuffer, originalname, subfolder) {
  const dir = path.join(UPLOADS_BASE, subfolder)
  fs.mkdirSync(dir, { recursive: true })
  const ext = path.extname(originalname) || ''
  const filename = `${randomUUID()}${ext}`
  const filePath = path.join(dir, filename)
  fs.writeFileSync(filePath, fileBuffer)
  return `/uploads/documents/${subfolder}/${filename}`
}

// ─── GET /api/documents ───────────────────────────────────────────────────────
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

    // Filtre optionnel par missionId
    if (req.query.missionId) {
      where = { ...where, missionId: req.query.missionId }
    }

    // Filtre optionnel par type (ex: type=photo pour la galerie)
    if (req.query.type) {
      where = { ...where, type: req.query.type }
    }

    // Filtre : dernières versions uniquement (par défaut, exclure les anciennes versions)
    if (req.query.latestOnly !== 'false') {
      where = { ...where, parentId: null }
    }

    // Filtre : documents entreprise uniquement
    if (req.query.isEntreprise === 'true') {
      where = { ...where, isEntreprise: true }
    }

    // Filtre : catégorie entreprise
    if (req.query.category) {
      where = { ...where, category: req.query.category }
    }

    // Filtre : documents expirant dans les 30 jours
    if (req.query.expiring === 'true') {
      const now = new Date()
      const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      where = { ...where, expiresAt: { gte: now, lte: in30 } }
    }

    // Filtre : documents déjà expirés
    if (req.query.expired === 'true') {
      where = { ...where, expiresAt: { lt: new Date() } }
    }

    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 100))
    const skip = (page - 1) * limit

    const docs = await prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    })
    res.json(docs)
  } catch (e) { next(e) }
})

// ─── GET /api/documents/:id/versions ──────────────────────────────────────────
router.get('/:id/versions', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const doc = await prisma.document.findUnique({ where: { id: req.params.id } })
    if (!doc) throw createError('Document introuvable', 404)

    // Vérifier l'accès : propriétaire du document OU membre du projet
    if (doc.userId !== req.user.id && doc.projectId) {
      const project = await prisma.project.findUnique({ where: { id: doc.projectId }, select: { ownerId: true, clientId: true } })
      const isOwnerOrClient = project?.ownerId === req.user.id || project?.clientId === req.user.id
      if (!isOwnerOrClient) {
        const isMember = await prisma.projectMember.findFirst({ where: { projectId: doc.projectId, userId: req.user.id } })
        if (!isMember) return res.status(403).json({ error: 'Accès refusé' })
      }
    }

    // Trouver le document racine (version 1)
    const rootId = doc.parentId || doc.id

    const versions = await prisma.document.findMany({
      where: { OR: [{ id: rootId }, { parentId: rootId }] },
      orderBy: { version: 'desc' },
    })
    res.json(versions)
  } catch (e) { next(e) }
})

// ─── POST /api/documents/:id/new-version ──────────────────────────────────────
router.post('/:id/new-version', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw createError('Aucun fichier reçu', 400)

    const prisma = getPrisma()
    const original = await prisma.document.findUnique({ where: { id: req.params.id } })
    if (!original) throw createError('Document introuvable', 404)

    // Vérifier l'accès au projet du document
    if (original.projectId) {
      const project = await prisma.project.findUnique({ where: { id: original.projectId }, select: { ownerId: true, clientId: true } })
      const isOwnerOrClient = project?.ownerId === req.user.id || project?.clientId === req.user.id
      if (!isOwnerOrClient) {
        const isMember = await prisma.projectMember.findFirst({ where: { projectId: original.projectId, userId: req.user.id } })
        if (!isMember) return res.status(403).json({ error: 'Accès refusé' })
      }
    }

    // Déterminer le document racine
    const rootId = original.parentId || original.id

    // Récupérer le numéro de version le plus élevé
    const latest = await prisma.document.findFirst({
      where: { OR: [{ id: rootId }, { parentId: rootId }] },
      orderBy: { version: 'desc' },
      select: { version: true },
    })
    const newVersion = (latest?.version || 1) + 1

    // Sauvegarder le fichier sur disque
    const subfolder = original.projectId || '_general'
    const url = saveFileToDisk(req.file.buffer, req.file.originalname, subfolder)

    const doc = await prisma.document.create({
      data: {
        name:         original.name,
        type:         original.type,
        url,
        projectId:    original.projectId,
        missionId:    original.missionId,
        userId:       req.user.id,
        isEntreprise: original.isEntreprise,
        category:     original.category,
        version:      newVersion,
        parentId:     rootId,
        expiresAt:    req.body.expiresAt ? new Date(req.body.expiresAt) : original.expiresAt,
      },
    })
    res.status(201).json(doc)
  } catch (e) { next(e) }
})

// ─── POST /api/documents/upload — multipart file upload ───────────────────────
router.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) throw createError('Aucun fichier reçu', 400)

    const prisma = getPrisma()
    const { name, type, projectId, missionId } = req.body
    const isEntreprise = req.body.isEntreprise === 'true' || req.body.isEntreprise === true
    const expiresAt = req.body.expiresAt ? new Date(req.body.expiresAt) : null
    const category = req.body.category || null
    const userId = req.user.id

    // Check project access if projectId is given
    if (projectId) {
      const canAccess = await userCanAccessProject(prisma, userId, projectId)
      if (!canAccess) throw createError('Accès non autorisé à ce projet', 403)
    }

    // Save file to disk
    const subfolder = projectId || '_general'
    const url = saveFileToDisk(req.file.buffer, req.file.originalname, subfolder)
    const docName = name || req.file.originalname.replace(/\.[^.]+$/, '')

    const doc = await prisma.document.create({
      data: {
        name:         docName,
        type:         type || '',
        url,
        projectId:    projectId || null,
        missionId:    missionId || null,
        userId,
        isEntreprise: isEntreprise || (!projectId),
        expiresAt,
        category,
      },
    })
    res.status(201).json(doc)
  } catch (e) { next(e) }
})

// ─── POST /api/documents — JSON (url already hosted, e.g. MinIO) ──────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { name, type, url, projectId, missionId, isEntreprise, expiresAt, category } = req.body
    if (!name) throw createError('name requis', 400)

    const doc = await prisma.document.create({
      data: {
        name,
        type:         type        || '',
        url:          url         || '',
        projectId:    projectId   || null,
        missionId:    missionId   || null,
        userId:       req.user.id,
        isEntreprise: isEntreprise === true || isEntreprise === 'true' || (!projectId),
        expiresAt:    expiresAt ? new Date(expiresAt) : null,
        category:     category || null,
      },
    })

    // ── Email notification: document shared on project ──
    if (projectId) {
      const project = await prisma.project.findUnique({ where: { id: projectId }, select: { nom: true, clientId: true, clientEmail: true } }).catch(() => null)
      if (project?.clientId && project.clientId !== req.user.id) {
        const clientUser = await prisma.user.findUnique({ where: { id: project.clientId }, select: { email: true } }).catch(() => null)
        const email = clientUser?.email || project.clientEmail
        if (email) {
          const { sendNotificationEmail } = require('../utils/email')
          const frontendUrl = process.env.FRONTEND_URL || 'https://dev.meereo.com'
          sendNotificationEmail({
            to: email,
            title: 'Nouveau document partagé',
            body: `Un nouveau document « ${name} » a été ajouté au projet « ${project.nom} ».`,
            ctaLabel: 'Voir le document →',
            ctaUrl: `${frontendUrl}/client`,
          }).catch(() => {})
        }
      }
    }

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
    const { name, type, url, projectId, missionId, expiresAt, category } = req.body
    const updated = await prisma.document.update({
      where: { id: req.params.id },
      data: {
        ...(name      !== undefined ? { name }      : {}),
        ...(type      !== undefined ? { type }      : {}),
        ...(url       !== undefined ? { url }       : {}),
        ...(projectId !== undefined ? { projectId } : {}),
        ...(missionId !== undefined ? { missionId } : {}),
        ...(expiresAt !== undefined ? { expiresAt: expiresAt ? new Date(expiresAt) : null } : {}),
        ...(category  !== undefined ? { category }  : {}),
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

    // Si c'est un document racine, supprimer aussi toutes ses versions enfants
    if (!doc.parentId) {
      const childVersions = await prisma.document.findMany({
        where: { parentId: doc.id },
        select: { id: true, url: true },
      })
      for (const child of childVersions) {
        if (child.url && child.url.startsWith('/uploads/')) {
          fs.unlink(path.join(__dirname, '../../', child.url), () => {})
        }
      }
      await prisma.document.deleteMany({ where: { parentId: doc.id } })
    }

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
