const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')
const { getIo } = require('../socket')

const router = Router()

// Champs modifiables
const ALLOWED = [
  'nom', 'type', 'phase', 'budget', 'adresse', 'livraison', 'priorite',
  'description', 'avancement', 'status', 'client', 'clientEmail',
  'clientId', 'color', 'img', 'notes', 'etapes', 'equipe', 'sourceAoId', 'taskStates',
  'clotureStatus', 'clotureAt', 'statusHistory',
]

// State machine: allowed transitions
const PROJECT_TRANSITIONS = {
  preparation: ['en_attente', 'active'],
  en_attente: ['active', 'archived'],
  active: ['suspendu', 'completed', 'archived', 'stopped'],
  suspendu: ['active', 'archived'],
  completed: ['cloture', 'active'],
  cloture: ['archived'],
  archived: [],
  draft: ['active', 'preparation'],
  stopped: ['archived'],
}

// ─── GET /api/projects ────────────────────────────────────────────────────────
// Renvoie les projets où l'utilisateur est owner OU membre OU prestataire signataire
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const userId = req.user.id

    // Projets liés via un marché (supplier) — rétrocompat marchés déjà en DB
    const supplierMarkets = await prisma.market.findMany({
      where: { supplierId: userId, projectId: { not: null } },
      select: { projectId: true },
    })
    const supplierProjectIds = supplierMarkets.map(m => m.projectId).filter(Boolean)

    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { clientId: userId },
          // Fallback: match by email in case clientId wasn't properly linked (case-insensitive)
          ...(req.user.email ? [{ clientEmail: { equals: req.user.email, mode: 'insensitive' } }] : []),
          { members: { some: { userId } } },
          ...(supplierProjectIds.length ? [{ id: { in: supplierProjectIds } }] : []),
        ],
      },
      include: {
        owner: { select: { id: true, name: true, company: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    // Enrichir le champ `client` si vide — lookup depuis clientId ou owner
    const clientIds = projects.map(p => p.clientId).filter(Boolean)
    const clientUsers = clientIds.length > 0
      ? await prisma.user.findMany({ where: { id: { in: clientIds } }, select: { id: true, name: true, company: true } })
      : []
    const clientMap = {}
    clientUsers.forEach(u => { clientMap[u.id] = u })
    const enriched = projects.map(p => {
      const clientUser = p.clientId ? clientMap[p.clientId] : null
      return {
        ...p,
        client: p.client || clientUser?.company || clientUser?.name || p.owner?.company || p.owner?.name || '',
      }
    })
    res.json(enriched)
  } catch (e) { next(e) }
})

// ─── GET /api/projects/:id ────────────────────────────────────────────────────
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const userId = req.user.id
    const project = await prisma.project.findUnique({ where: { id: req.params.id } })
    if (!project) throw createError('Projet introuvable', 404)

    // Vérifier que l'utilisateur a accès au projet
    const isOwnerOrClient = project.ownerId === userId || project.clientId === userId
    if (!isOwnerOrClient) {
      const isMember = await prisma.projectMember.findFirst({
        where: { projectId: project.id, userId },
      })
      const isSupplier = await prisma.market.findFirst({
        where: { projectId: project.id, supplierId: userId },
      })
      if (!isMember && !isSupplier) throw createError('Accès non autorisé', 403)
    }

    res.json(project)
  } catch (e) { next(e) }
})

// ─── POST /api/projects ───────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { nom, type, phase, budget, adresse, livraison, priorite, description,
            avancement, status, client, clientEmail, clientId, color, etapes,
            equipe, sourceAoId, taskStates } = req.body
    if (!nom) throw createError('nom requis', 400)

    const project = await prisma.project.create({
      data: {
        nom, ownerId: req.user.id,
        type:        type        || '',
        phase:       phase       || 'ESQUISSE',
        budget:      budget      || '',
        adresse:     adresse     || '',
        livraison:   livraison   || null,
        priorite:    priorite    || 'normale',
        description: description || '',
        avancement:  typeof avancement === 'number' ? avancement : 0,
        status:      status      || 'active',
        client:      client      || '',
        clientEmail: clientEmail || '',
        clientId:    clientId    || null,
        color:       color       || null,
        etapes:      etapes      || null,
        equipe:      equipe      || null,
        sourceAoId:  sourceAoId  || null,
        taskStates:  taskStates  || null,
      },
    })

    // Auto-créer une conversation de type "projet"
    await prisma.conversation.create({
      data: {
        title: 'Projet : ' + nom,
        isGroup: true,
        type: 'projet',
        projectId: project.id,
        participants: { create: [{ userId: req.user.id }] },
      },
    }).catch(() => {}) // non-blocking

    // Auto-créer un contact CRM si un client est désigné
    if (clientId && clientId !== req.user.id) {
      const clientUser = await prisma.user.findUnique({ where: { id: clientId }, select: { name: true, email: true, phone: true, company: true } }).catch(() => null)
      if (clientUser) {
        await prisma.contact.upsert({
          where: { id: 'auto_' + req.user.id + '_' + clientId }, // dummy — upsert par critère custom ci-dessous
          update: {},
          create: {
            type: 'client',
            nom: clientUser.company || clientUser.name || client || 'Client',
            email: clientUser.email || clientEmail || '',
            tel: clientUser.phone || '',
            statut: 'actif',
            ownerId: req.user.id,
          },
        }).catch(() => {
          // Si upsert échoue (pas de contrainte unique), essayer create simple en ignorant les doublons
          prisma.contact.create({
            data: {
              type: 'client',
              nom: clientUser.company || clientUser.name || client || 'Client',
              email: clientUser.email || clientEmail || '',
              tel: clientUser.phone || '',
              statut: 'actif',
              ownerId: req.user.id,
            },
          }).catch(() => {})
        })
      }
    }

    // ── Email notification: project created ──
    if (clientEmail) {
      const { sendNotificationEmail } = require('../utils/email')
      const frontendUrl = process.env.FRONTEND_URL || 'https://dev.meereo.com'
      sendNotificationEmail({
        to: clientEmail,
        title: 'Nouveau projet créé',
        body: `Le projet « ${nom} » vient d'être créé sur Meereo.\nVous pouvez suivre son avancement en temps réel depuis votre espace client.`,
        ctaLabel: 'Accéder au projet →',
        ctaUrl: `${frontendUrl}/client`,
      }).catch(() => {})
    }

    res.status(201).json(project)
  } catch (e) { next(e) }
})

// ─── GET /api/projects/:id/timeline — chronologie complète du projet ─────────
router.get('/:id/timeline', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const projectId = req.params.id
    const userId = req.user.id

    // Vérifier que l'utilisateur a accès au projet
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { ownerId: true, clientId: true } })
    if (!project) return res.status(404).json({ error: 'Projet introuvable' })
    const isOwnerOrClient = project.ownerId === userId || project.clientId === userId
    if (!isOwnerOrClient) {
      const isMember = await prisma.projectMember.findFirst({ where: { projectId, userId } })
      if (!isMember) return res.status(403).json({ error: 'Accès refusé' })
    }

    const [events, missions, decisions, documents, markets, activities] = await Promise.all([
      prisma.event.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' }, select: { id: true, titre: true, type: true, date: true, createdAt: true } }),
      prisma.mission.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' }, select: { id: true, title: true, type: true, status: true, createdAt: true, startedAt: true, completedAt: true } }),
      prisma.decision.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' }, select: { id: true, titre: true, statut: true, urgent: true, createdAt: true } }),
      prisma.document.findMany({ where: { projectId, parentId: null }, orderBy: { createdAt: 'desc' }, take: 20, select: { id: true, name: true, type: true, createdAt: true } }),
      prisma.market.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' }, select: { id: true, titre: true, lot: true, entreprise: true, statut: true, createdAt: true } }),
      prisma.activity.findMany({ where: { data: { path: ['projectId'], equals: projectId } }, orderBy: { createdAt: 'desc' }, take: 50, select: { id: true, action: true, data: true, createdAt: true } }).catch(() => []),
    ])

    // Fusionner en timeline unique triée par date
    const timeline = [
      ...events.map(e => ({ ...e, _type: 'event', _date: e.createdAt })),
      ...missions.map(m => ({ ...m, _type: 'mission', _date: m.createdAt })),
      ...decisions.map(d => ({ ...d, _type: 'decision', _date: d.createdAt })),
      ...documents.map(d => ({ ...d, _type: 'document', _date: d.createdAt })),
      ...markets.map(m => ({ ...m, _type: 'market', _date: m.createdAt })),
      ...activities.map(a => ({ ...a, _type: 'activity', _date: a.createdAt })),
    ].sort((a, b) => new Date(b._date) - new Date(a._date))

    res.json(timeline)
  } catch (e) { next(e) }
})

// ─── PATCH /api/projects/:id ──────────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const project = await prisma.project.findUnique({ where: { id: req.params.id } })
    if (!project) throw createError('Projet introuvable', 404)
    if (project.ownerId !== req.user.id) {
      // Permettre aux membres de modifier l'avancement
      const isMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: req.params.id, userId: req.user.id } },
      })
      if (!isMember) throw createError('Accès non autorisé', 403)
    }
    const data = {}
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined) data[key] = req.body[key]
    }

    // ── State machine validation for status changes ──
    if (data.status && data.status !== project.status) {
      const allowed = PROJECT_TRANSITIONS[project.status]
      if (allowed && !allowed.includes(data.status)) {
        throw createError(`Transition de statut invalide : « ${project.status} » → « ${data.status} »`, 400)
      }
      // Record transition in statusHistory
      const history = Array.isArray(project.statusHistory) ? project.statusHistory : []
      data.statusHistory = [...history, {
        from: project.status,
        to: data.status,
        at: new Date().toISOString(),
        userId: req.user.id,
      }]
    }

    const updated = await prisma.project.update({ where: { id: req.params.id }, data })

    // ── Notify client when project is archived or stopped ──
    if ((data.status === 'archived' || data.status === 'stopped') && project.clientId && project.clientId !== req.user.id) {
      const statusLabel = data.status === 'archived' ? 'archivé' : 'arrêté'
      const { createAndPushNotification } = require('../utils/notify')
      createAndPushNotification({
        userId: project.clientId,
        msg: `Le projet « ${project.nom} » a été ${statusLabel}`,
        type: data.status === 'stopped' ? 'orange' : 'info',
        page: 'projets',
        senderId: req.user.id,
      }).catch(() => {})
    }

    // ── Emit project:updated for real-time sync across all project participants ──
    try {
      const { getIo } = require('../socket')
      const io = getIo()
      if (io) {
        // Notify all related users: owner, client, and members
        const participantIds = new Set()
        if (project.ownerId) participantIds.add(project.ownerId)
        if (project.clientId) participantIds.add(project.clientId)
        const members = await prisma.projectMember.findMany({ where: { projectId: project.id }, select: { userId: true } })
        members.forEach(m => participantIds.add(m.userId))
        participantIds.delete(req.user.id) // Don't notify the actor
        for (const uid of participantIds) {
          io.to(`user:${uid}`).emit('project:updated', { projectId: project.id, status: data.status || project.status })
        }
      }
    } catch (_) {}

    res.json(updated)
  } catch (e) { next(e) }
})

// ─── DELETE /api/projects/:id ─────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const project = await prisma.project.findUnique({ where: { id: req.params.id } })
    if (!project) throw createError('Projet introuvable', 404)
    if (project.ownerId !== req.user.id) throw createError('Accès non autorisé', 403)
    await prisma.project.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router
