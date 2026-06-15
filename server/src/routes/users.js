const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')

const router = Router()

// GET /api/users/fournisseurs — liste des fournisseurs inscrits (public avec auth)
router.get('/fournisseurs', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const users = await prisma.user.findMany({
      where: { type: 'fournisseur' },
      select: {
        id: true,
        name: true,
        company: true,
        email: true,
        phone: true,
        ville: true,
        verified: true,
        createdAt: true,
        fournisseurProfile: {
          select: {
            entreprise: true,
            ville: true,
            tel: true,
            categories: true,
            zones: true,
            logoFileUrl: true,
          },
        },
        products: {
          where: { isPublished: true, status: 'active' },
          select: { id: true, name: true, category: true, price: true, unit: true },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const result = users.map(u => ({
      id: u.id,
      nom: u.fournisseurProfile?.entreprise || u.company || u.name || '',
      specialite: (u.fournisseurProfile?.categories || []).join(', '),
      ville: u.fournisseurProfile?.ville || u.ville || 'Abidjan',
      tel: u.fournisseurProfile?.tel || u.phone || '',
      email: u.email || '',
      verified: u.verified || false,
      logoUrl: u.fournisseurProfile?.logoFileUrl || null,
      products: u.products || [],
      zones: u.fournisseurProfile?.zones || [],
      createdAt: u.createdAt,
    }))

    res.json(result)
  } catch (e) {
    next(e)
  }
})

// ─── Préférences utilisateur ──────────────────────────────────────────────────

/**
 * GET /api/users/me/prefs
 * Retourne les préférences de l'utilisateur connecté.
 */
router.get('/me/prefs', requireAuth, async (req, res) => {
  const prisma = getPrisma()
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { prefs: true },
    })
    res.json(user?.prefs || {})
  } catch (e) {
    console.error('[USERS] GET /me/prefs', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

/**
 * PATCH /api/users/me/prefs
 * Fusionne les préférences fournies avec celles existantes.
 * Body: objet partiel — ex: { notifEmail: false, theme: 'dark' }
 */
router.patch('/me/prefs', requireAuth, async (req, res) => {
  const prisma = getPrisma()
  try {
    const current = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { prefs: true },
    })
    const merged = { ...(current?.prefs || {}), ...req.body }
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { prefs: merged },
      select: { prefs: true },
    })
    res.json(updated.prefs)
  } catch (e) {
    console.error('[USERS] PATCH /me/prefs', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

module.exports = router
