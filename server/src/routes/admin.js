const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')
const { getIo } = require('../socket')

const router = Router()

// Middleware admin — vérifie que l'utilisateur a le rôle admin en base
async function requireAdmin(req, res, next) {
  try {
    const prisma = getPrisma()
    const user = await prisma.user.findUnique({ where: { id: req.user.id }, select: { role: true } })
    if (user?.role === 'admin') return next()
    // Fallback temporaire : emails prédéfinis (rétrocompat pendant la migration)
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)
    if (adminEmails.length > 0 && adminEmails.includes(req.user.email)) return next()
    return res.status(403).json({ error: 'Accès admin requis' })
  } catch (e) {
    return res.status(403).json({ error: 'Accès admin requis' })
  }
}

// ─── GET /api/admin/verifications — liste des pros en attente de vérification ──
router.get('/verifications', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const pros = await prisma.user.findMany({
      where: { type: 'pro', verified: false },
      select: {
        id: true, name: true, company: true, email: true, metier: true, ville: true,
        publicId: true, slug: true, createdAt: true, onboardingData: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Enrichir avec les documents entreprise
    const enriched = await Promise.all(pros.map(async (p) => {
      const docs = await prisma.document.findMany({
        where: { userId: p.id, isEntreprise: true, parentId: null },
        select: { id: true, name: true, type: true, category: true, url: true, expiresAt: true },
        orderBy: { createdAt: 'desc' },
      })
      return { ...p, entrepriseDocs: docs }
    }))

    res.json(enriched)
  } catch (e) { next(e) }
})

// ─── PATCH /api/admin/verify/:userId — valider ou refuser un professionnel ────
router.patch('/verify/:userId', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { userId } = req.params
    const { action, reason } = req.body // action: 'approve' | 'reject' | 'request_complement'

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw createError('Utilisateur introuvable', 404)

    if (action === 'approve') {
      await prisma.user.update({ where: { id: userId }, data: { verified: true } })
      // Notifier le professionnel
      const io = getIo()
      if (io) {
        io.to(`user:${userId}`).emit('notification:new', {
          id: 'verified_' + userId,
          msg: 'Votre entreprise a été vérifiée ! Le badge Professionnel Vérifié est activé.',
          type: 'green',
          read: false,
          createdAt: new Date().toISOString(),
          page: 'parametres',
        })
      }
      await prisma.notification.create({
        data: { msg: 'Votre entreprise a été vérifiée ! Badge Professionnel Vérifié activé.', type: 'green', userId, page: 'parametres' },
      }).catch(() => {})
      res.json({ success: true, verified: true })
    } else if (action === 'reject') {
      await prisma.notification.create({
        data: { msg: 'Votre demande de vérification a été refusée. ' + (reason || 'Veuillez corriger vos documents.'), type: 'orange', userId, page: 'parametres' },
      }).catch(() => {})
      const io = getIo()
      if (io) {
        io.to(`user:${userId}`).emit('notification:new', {
          id: 'reject_' + userId,
          msg: 'Demande de vérification refusée : ' + (reason || 'documents insuffisants'),
          type: 'orange',
          read: false,
          createdAt: new Date().toISOString(),
          page: 'parametres',
        })
      }
      res.json({ success: true, verified: false })
    } else if (action === 'request_complement') {
      await prisma.notification.create({
        data: { msg: 'Documents complémentaires demandés : ' + (reason || 'Veuillez compléter votre dossier.'), type: 'blue', userId, page: 'documents' },
      }).catch(() => {})
      res.json({ success: true, complement_requested: true })
    } else {
      throw createError('Action invalide (approve|reject|request_complement)', 400)
    }
  } catch (e) { next(e) }
})

module.exports = router
