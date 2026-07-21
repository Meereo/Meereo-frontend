const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')

const router = Router()

// ─── GET /api/project-members?projectId=xxx ───────────────────────────────────
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const userId = req.user.id

    if (req.query.projectId) {
      // Membres d'un projet spécifique
      const members = await prisma.projectMember.findMany({
        where: { projectId: req.query.projectId },
        orderBy: { joinedAt: 'asc' },
      })
      return res.json(members)
    }

    // Sans projectId : retourner les membres de TOUS les projets de l'utilisateur
    // 1. Trouver les projets auxquels l'utilisateur a accès
    const userProjects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { clientId: userId },
          { members: { some: { userId } } },
        ],
      },
      select: { id: true },
    })
    const projectIds = userProjects.map(p => p.id)
    if (projectIds.length === 0) return res.json([])

    const members = await prisma.projectMember.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { joinedAt: 'asc' },
    })
    res.json(members)
  } catch (e) { next(e) }
})

// ─── POST /api/project-members ────────────────────────────────────────────────
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { projectId, userId, role, userName, userEmail } = req.body
    if (!projectId || !userId) throw createError('projectId et userId requis', 400)

    // Verify the project exists before upserting — frontend may send local-only IDs
    const projectExists = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } })
    if (!projectExists) return res.status(404).json({ error: 'Projet introuvable' })

    const invitedByClient = req.body.invitedByClient || false
    const invitationStatus = invitedByClient ? 'pending' : 'accepted'

    const member = await prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId } },
      update: { role: role || 'MEMBER', userName: userName || '', userEmail: userEmail || '' },
      create: {
        projectId, userId,
        role:      role      || 'MEMBER',
        userName:  userName  || '',
        userEmail: userEmail || '',
        invitationStatus,
        invitedByUserId: invitedByClient ? req.user.id : null,
        invitedAt: invitedByClient ? new Date() : null,
      },
    })

    // Envoyer une notification à l'utilisateur invité + email
    if (invitedByClient) {
      const project = await prisma.project.findUnique({ where: { id: projectId }, select: { nom: true } })
      const inviterName = req.user.name || req.user.company || 'Un client'

      // Email notification
      if (userEmail) {
        const { sendNotificationEmail } = require('../utils/email')
        const frontendUrl = process.env.FRONTEND_URL || 'https://dev.meereo.com'
        sendNotificationEmail({
          to: userEmail,
          title: 'Invitation à rejoindre un projet',
          body: `${inviterName} vous invite à rejoindre le projet « ${project?.nom || 'Projet'} » sur Meereo.\nAcceptez l'invitation pour commencer à collaborer.`,
          ctaLabel: 'Voir l\'invitation →',
          ctaUrl: `${frontendUrl}/cockpit`,
        }).catch(() => {})
      }

      await prisma.notification.create({
        data: {
          userId,
          type: 'project_invitation',
          message: `${inviterName} vous invite à rejoindre le projet "${project?.nom || 'Projet'}"`,
          link: '/cockpit',
          read: false,
        },
      }).catch(() => {})
      // Notification temps réel via socket
      const { getIo } = require('../socket')
      const io = getIo()
      if (io) {
        io.to(`user:${userId}`).emit('notification:new', {
          id: 'notif_inv_' + member.id,
          msg: `${inviterName} vous invite à rejoindre le projet "${project?.nom || 'Projet'}"`,
          type: 'blue',
          read: false,
          ts: new Date().toISOString(),
          link: '/cockpit',
        })
      }
    }

    // ── Sync to public pro page cockpitTeam ──
    // When a member is added to a project, also add them to the project owner's cockpitTeam (public page)
    try {
      const project = await prisma.project.findUnique({ where: { id: projectId }, select: { ownerId: true } })
      if (project?.ownerId) {
        const ownerProfile = await prisma.proProfile.findUnique({ where: { userId: project.ownerId } })
        if (ownerProfile) {
          const team = Array.isArray(ownerProfile.cockpitTeam) ? ownerProfile.cockpitTeam : []
          const memberName = userName || userEmail || ''
          const alreadyInTeam = team.some(t => (t.nom || '').toLowerCase() === memberName.toLowerCase())
          if (memberName && !alreadyInTeam) {
            team.push({ nom: memberName, role: role || 'Collaborateur' })
            await prisma.proProfile.update({ where: { userId: project.ownerId }, data: { cockpitTeam: team } })
          }
        }
      }
    } catch (_) { /* non-blocking sync */ }

    res.status(201).json(member)
  } catch (e) { next(e) }
})

// ─── PATCH /api/project-members/:id/respond ──────────────────────────────────
// Accepter ou refuser une invitation à un projet
router.patch('/:id/respond', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { accept } = req.body
    const membership = await prisma.projectMember.findUnique({
      where: { id: req.params.id },
      include: { project: { select: { nom: true, ownerId: true } } },
    })
    if (!membership) return res.status(404).json({ error: 'Invitation introuvable' })
    if (membership.userId !== req.user.id) return res.status(403).json({ error: 'Non autorisé' })
    if (membership.invitationStatus !== 'pending') return res.status(400).json({ error: 'Invitation déjà traitée' })

    if (accept) {
      await prisma.projectMember.update({
        where: { id: req.params.id },
        data: { invitationStatus: 'accepted', acceptedAt: new Date() },
      })
      // Notifier le propriétaire du projet
      if (membership.project.ownerId) {
        const { getIo } = require('../socket')
        const io = getIo()
        await prisma.notification.create({
          data: {
            userId: membership.project.ownerId,
            type: 'invitation_accepted',
            message: `${req.user.name || 'Un professionnel'} a accepté de rejoindre "${membership.project.nom || 'votre projet'}"`,
            link: '/cockpit',
            read: false,
          },
        }).catch(() => {})
        if (io) {
          io.to(`user:${membership.project.ownerId}`).emit('notification:new', {
            id: 'notif_acc_' + req.params.id,
            msg: `${req.user.name || 'Un professionnel'} a accepté de rejoindre "${membership.project.nom || 'votre projet'}"`,
            type: 'green', read: false, ts: new Date().toISOString(),
          })
        }
      }
      res.json({ success: true, status: 'accepted' })
    } else {
      await prisma.projectMember.update({
        where: { id: req.params.id },
        data: { invitationStatus: 'rejected' },
      })
      res.json({ success: true, status: 'rejected' })
    }
  } catch (e) { next(e) }
})

// ─── GET /api/project-members/pending ────────────────────────────────────────
// Récupérer les invitations en attente pour l'utilisateur connecté
router.get('/pending', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const pending = await prisma.projectMember.findMany({
      where: { userId: req.user.id, invitationStatus: 'pending' },
      include: { project: { select: { id: true, nom: true, type: true, budget: true } } },
      orderBy: { invitedAt: 'desc' },
    })
    res.json(pending)
  } catch (e) { next(e) }
})

// ─── PUT /api/project-members/:id ────────────────────────────────────────────
// Modifier le rôle d'un intervenant
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const membership = await prisma.projectMember.findUnique({
      where: { id: req.params.id },
      include: { project: { select: { ownerId: true, nom: true } } },
    })
    if (!membership) return res.status(404).json({ error: 'Membre introuvable' })
    if (membership.project.ownerId !== req.user.id) return res.status(403).json({ error: 'Non autorisé' })

    const { role } = req.body
    if (!role) return res.status(400).json({ error: 'Rôle requis' })

    const updated = await prisma.projectMember.update({
      where: { id: req.params.id },
      data: { role },
    })

    // Notifier l'intervenant du changement de rôle
    const { createAndPushNotification } = require('../utils/notify')
    createAndPushNotification({
      userId: membership.userId,
      msg: `Votre rôle sur le projet « ${membership.project.nom} » a été modifié en « ${role} »`,
      type: 'info',
      page: 'projets',
      senderId: req.user.id,
    }).catch(() => {})

    res.json(updated)
  } catch (e) { next(e) }
})

// ─── DELETE /api/project-members/:id ─────────────────────────────────────────
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const membership = await prisma.projectMember.findUnique({
      where: { id: req.params.id },
      include: { project: { select: { ownerId: true, nom: true } } },
    })
    if (!membership) return res.status(404).json({ error: 'Membre introuvable' })
    // Seul le propriétaire du projet peut retirer un membre
    if (membership.project.ownerId !== req.user.id) return res.status(403).json({ error: 'Non autorisé' })
    await prisma.projectMember.delete({ where: { id: req.params.id } })

    // Notifier l'intervenant qu'il a été retiré du projet
    const { createAndPushNotification } = require('../utils/notify')
    createAndPushNotification({
      userId: membership.userId,
      msg: `Vous avez été retiré du projet « ${membership.project.nom} »`,
      type: 'orange',
      page: 'projets',
      senderId: req.user.id,
    }).catch(() => {})

    res.json({ success: true })
  } catch (e) { next(e) }
})

module.exports = router
