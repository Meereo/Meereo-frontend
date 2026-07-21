const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')

const router = Router()

// ─── GET /api/rapports ────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()

    // Find project IDs where the user is owner, client, or member
    const userProjects = await prisma.project.findMany({
      where: { OR: [{ ownerId: req.user.id }, { clientId: req.user.id }] },
      select: { id: true },
    })
    const memberProjects = await prisma.projectMember.findMany({
      where: { userId: req.user.id, invitationStatus: 'accepted' },
      select: { projectId: true },
    })
    const projectIds = [...new Set([
      ...userProjects.map(p => p.id),
      ...memberProjects.map(m => m.projectId),
    ])]

    const where = {
      OR: [
        { ownerId: req.user.id },
        // Reports visible to client on projects they belong to
        { projectId: { in: projectIds }, visibility: 'client_visible' },
      ],
    }
    if (req.query.projectId) {
      where.AND = [{ projectId: req.query.projectId }]
    }

    const rapports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    })
    res.json(rapports)
  } catch (e) { next(e) }
})

// ─── POST /api/rapports ───────────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { type, projet, projectId, date, heure, lieu, participants, ordre, decisions, alertes, prochaine, statut, visibility, auteur } = req.body
    const vis = visibility || 'private'
    const rapport = await prisma.report.create({
      data: {
        type:         type         || 'Rapport hebdomadaire',
        projet:       projet       || '',
        projectId:    projectId    || null,
        date:         date         || '',
        heure:        heure        || '09:00',
        lieu:         lieu         || '',
        participants: participants || '',
        ordre:        ordre        || '',
        decisions:    decisions    || '',
        alertes:      alertes      || '',
        prochaine:    prochaine    || '',
        statut:       statut       || 'brouillon',
        visibility:   vis,
        auteur:       auteur       || '',
        ownerId:      req.user.id,
      },
    })

    // ── Notify client when a report/note is visible to them ──
    if (vis === 'client_visible' && projectId) {
      const project = await prisma.project.findUnique({ where: { id: projectId }, select: { nom: true, clientId: true } }).catch(() => null)
      if (project?.clientId && project.clientId !== req.user.id) {
        const { createAndPushNotification } = require('../utils/notify')
        const noteLabel = (type === 'note_chantier') ? 'Note de chantier' : 'Rapport'
        createAndPushNotification({
          userId: project.clientId,
          msg: `${noteLabel} ajouté au projet « ${project.nom} »`,
          type: 'blue',
          page: 'avancement',
          senderId: req.user.id,
        }).catch(() => {})
      }
    }

    res.status(201).json(rapport)
  } catch (e) { next(e) }
})

// ─── PATCH /api/rapports/:id ──────────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.report.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Rapport introuvable' })
    if (existing.ownerId !== req.user.id) return res.status(403).json({ error: 'Accès non autorisé' })

    const allowed = ['type','projet','projectId','date','heure','lieu','participants','ordre','decisions','alertes','prochaine','statut','visibility','auteur']
    const data = {}
    for (const k of allowed) { if (req.body[k] !== undefined) data[k] = req.body[k] }

    const updated = await prisma.report.update({ where: { id: req.params.id }, data })
    res.json(updated)
  } catch (e) { next(e) }
})

// ─── DELETE /api/rapports/:id ─────────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.report.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).json({ error: 'Rapport introuvable' })
    if (existing.ownerId !== req.user.id) return res.status(403).json({ error: 'Accès non autorisé' })
    await prisma.report.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router
