const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')

const router = Router()

// GET /api/users/pros — annuaire public des professionnels (avec publicId)
router.get('/pros', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { q, metier } = req.query
    const where = { type: 'pro' }
    if (metier && metier !== 'all') where.metier = metier

    const users = await prisma.user.findMany({
      where,
      select: {
        id:        true,
        publicId:  true,
        name:      true,
        company:   true,
        metier:    true,
        ville:     true,
        verified:  true,
        avatar:    true,
        proProfile: {
          select: {
            entreprise: true,
            ville:      true,
            tel:        true,
            secteurs:   true,
            logoFileUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    let result = users.map(u => ({
      id:          u.id,
      publicId:    u.publicId,
      nom:         u.proProfile?.entreprise || u.company || u.name || '',
      metier:      u.metier || (u.proProfile?.secteurs?.[0]) || '',
      ville:       u.proProfile?.ville || u.ville || 'Abidjan',
      verified:    u.verified || false,
      avatar:      u.avatar || null,
      logoUrl:     u.proProfile?.logoFileUrl || null,
    }))

    if (q) {
      const ql = q.toLowerCase()
      result = result.filter(p => (p.nom + p.metier + p.ville).toLowerCase().includes(ql))
    }

    res.json(result)
  } catch (e) {
    next(e)
  }
})

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

// ─── Données d'onboarding ─────────────────────────────────────────────────────

/**
 * Nettoie un objet onboardingData avant de le sauvegarder :
 * - supprime les chaînes vides, null, undefined
 * - conserve les booléens false et les nombres 0
 * - tronque les images base64 > 5 MB (protection stockage)
 */
function sanitizeOnboardingData(raw) {
  if (!raw || typeof raw !== 'object') return {}
  const out = {}
  for (const [k, v] of Object.entries(raw)) {
    if (v === null || v === undefined) continue
    if (typeof v === 'string') {
      if (v.trim() === '') continue
      // Tronquer les images base64 trop volumineuses
      if (v.startsWith('data:') && v.length > 5_000_000) {
        console.warn(`[ONBOARDING] Image ${k} trop volumineuse (${Math.round(v.length / 1024)} Ko) — ignorée`)
        continue
      }
      out[k] = v
    } else if (Array.isArray(v)) {
      // Garder les tableaux non vides (ex: secteurs, portfolio)
      if (v.length > 0) out[k] = v
    } else {
      out[k] = v
    }
  }
  return out
}

/**
 * GET /api/users/me/onboarding
 * Retourne les données d'onboarding de l'utilisateur connecté.
 */
router.get('/me/onboarding', requireAuth, async (req, res) => {
  const prisma = getPrisma()
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { onboardingData: true },
    })
    res.json(user?.onboardingData || {})
  } catch (e) {
    console.error('[USERS] GET /me/onboarding', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

/**
 * PATCH /api/users/me/onboarding
 * Fusionne les données fournies avec celles existantes, après nettoyage.
 */
router.patch('/me/onboarding', requireAuth, async (req, res) => {
  const prisma = getPrisma()
  try {
    const current = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { onboardingData: true },
    })
    const merged = {
      ...(current?.onboardingData || {}),
      ...sanitizeOnboardingData(req.body),
    }
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { onboardingData: merged },
      select: { onboardingData: true },
    })
    res.json(updated.onboardingData)
  } catch (e) {
    console.error('[USERS] PATCH /me/onboarding', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

module.exports = router
