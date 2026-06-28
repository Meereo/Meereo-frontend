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
            entreprise:     true,
            ville:          true,
            tel:            true,
            secteurs:       true,
            logoFileUrl:    true,
            logoColor:      true,
            portfolioFiles: true,
            slogan:         true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    let result = users.map(u => ({
      id:             u.id,
      publicId:       u.publicId,
      nom:            u.proProfile?.entreprise || u.company || u.name || '',
      metier:         u.metier || (u.proProfile?.secteurs?.[0]) || '',
      ville:          u.proProfile?.ville || u.ville || 'Abidjan',
      verified:       u.verified || false,
      avatar:         u.avatar || null,
      logoUrl:        u.proProfile?.logoFileUrl || null,
      logoColor:      u.proProfile?.logoColor || null,
      portfolioFiles: u.proProfile?.portfolioFiles || [],
      secteurs:       u.proProfile?.secteurs || [],
      slogan:         u.proProfile?.slogan || null,
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
      // email non exposé publiquement
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
const PREFS_ALLOWED_KEYS = [
  'notifEmail', 'notifPush', 'rappels', 'resume', 'devise', 'theme', 'langue',
  'connectedIntegrations', 'entrepriseDocs', 'commissionAcceptances',
  'sidebar_collapsed', 'defaultView', 'currency', 'dateFormat',
]
router.patch('/me/prefs', requireAuth, async (req, res) => {
  const prisma = getPrisma()
  try {
    // Whitelist keys to prevent arbitrary data injection
    const safeBody = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => PREFS_ALLOWED_KEYS.includes(k))
    )
    const current = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { prefs: true },
    })
    const merged = { ...(current?.prefs || {}), ...safeBody }
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
 * Fusionne proProfile (source de vérité à la création) avec onboardingData
 * (mises à jour wizard/profil). onboardingData prend toujours le dessus.
 */
router.get('/me/onboarding', requireAuth, async (req, res) => {
  const prisma = getPrisma()
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        onboardingData: true,
        type: true,
        proProfile: true,
        fournisseurProfile: true,
        clientProfile: true,
      },
    })
    const od = (user?.onboardingData && typeof user.onboardingData === 'object')
      ? user.onboardingData
      : {}

    // Fusionner le profil structuré (créé à l'inscription) comme fallback
    // afin que les champs renseignés lors de l'onboarding soient toujours accessibles,
    // même si onboardingData n'a jamais été écrit (ex: bannerUrl seul).
    let base = {}
    if (req.user.type === 'pro' && user?.proProfile) {
      const p = user.proProfile
      base = {
        entreprise:   p.entreprise  || '',
        ville:        p.ville       || '',
        pays:         p.pays        || '',
        tel:          p.tel         || '',
        annee:        p.annee       || '',
        rccm:         p.rccm        || '',
        ncc:          p.ncc         || '',
        secteurs:     p.secteurs    || [],
        services:     p.services    || [],
        logoColor:    p.logoColor   || '#1D1D1F',
        logoShape:    p.logoShape   || 'Hexagone',
        logoTypo:     p.logoTypo    || 'Gras',
        logoFileUrl:  p.logoFileUrl || '',
        slogan:       p.slogan      || '',
        bio:          p.bio         || '',
        projetsN:     p.projetsN    || '',
        effectif:     p.effectif    || '',
        cockpitTeam:  p.cockpitTeam || [],
        portfolio:    p.portfolioFiles || [],
        coverUrl:     p.coverUrl    || '',
      }
    } else if (req.user.type === 'fournisseur' && user?.fournisseurProfile) {
      const p = user.fournisseurProfile
      base = {
        entreprise:  p.entreprise  || '',
        ville:       p.ville       || '',
        pays:        p.pays        || '',
        tel:         p.tel         || '',
        rccm:        p.rccm        || '',
        ncc:         p.ncc         || '',
        categories:  p.categories  || [],
        zones:       p.zones       || [],
        logoColor:   p.logoColor   || '#1D1D1F',
        logoShape:   p.logoShape   || 'Hexagone',
        logoFileUrl: p.logoFileUrl || '',
        delaiLivraison: p.delaiLivraison || '',
      }
    } else if (req.user.type === 'client' && user?.clientProfile) {
      const p = user.clientProfile
      base = {
        prenom:      p.prenom      || '',
        nom:         p.nom         || '',
        civilite:    p.civilite    || '',
        tel:         p.tel         || '',
        ville:       p.ville       || '',
        pays:        p.pays        || '',
        projectType: p.projectType || '',
        location:    p.location    || '',
        surface:     p.surface     || '',
        budget:      p.budget      || '',
        description: p.description || '',
        situation:   p.situation   || '',
        architecteEmail: p.architecteEmail || '',
        photoUrl:    p.photoUrl    || '',
      }
    }

    // od prend le dessus sur base pour chaque champ présent (valeur non vide)
    const merged = { ...base }
    for (const [k, v] of Object.entries(od)) {
      if (v === null || v === undefined) continue
      if (typeof v === 'string' && v.trim() === '') continue
      if (Array.isArray(v) && v.length === 0) continue
      merged[k] = v
    }
    // Normaliser : l'onboarding sauvegarde la bannière sous 'coverUrl',
    // le profil la lit sous 'bannerUrl'. Assurer la cohérence des deux clés.
    if (!merged.bannerUrl && merged.coverUrl) merged.bannerUrl = merged.coverUrl

    res.json(merged)
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
    const sanitized = sanitizeOnboardingData(req.body)
    const current = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { onboardingData: true },
    })
    const merged = {
      ...(current?.onboardingData || {}),
      ...sanitized,
    }
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { onboardingData: merged },
      select: { onboardingData: true },
    })

    // Sync to structured profile table so public API endpoint stays consistent
    if (Object.keys(sanitized).length > 0) {
      if (req.user.type === 'pro') {
        const proMap = {
          entreprise: 'entreprise', ville: 'ville', pays: 'pays', tel: 'tel',
          annee: 'annee', rccm: 'rccm', ncc: 'ncc', secteurs: 'secteurs',
          services: 'services', logoColor: 'logoColor', logoShape: 'logoShape',
          logoTypo: 'logoTypo', logoFileUrl: 'logoFileUrl', slogan: 'slogan',
          bio: 'bio', projetsN: 'projetsN', effectif: 'effectif',
          cockpitTeam: 'cockpitTeam', portfolio: 'portfolioFiles', bannerUrl: 'coverUrl',
        }
        const profileData = {}
        for (const [k, dest] of Object.entries(proMap)) {
          if (sanitized[k] !== undefined) profileData[dest] = sanitized[k]
        }
        if (Object.keys(profileData).length > 0) {
          await prisma.proProfile.update({
            where: { userId: req.user.id },
            data: profileData,
          }).catch(e => console.warn('[ONBOARDING] proProfile sync failed:', e.message))
        }
      } else if (req.user.type === 'fournisseur') {
        const frnMap = {
          entreprise: 'entreprise', ville: 'ville', pays: 'pays', tel: 'tel',
          rccm: 'rccm', ncc: 'ncc', logoColor: 'logoColor', logoShape: 'logoShape',
          logoTypo: 'logoTypo', logoFileUrl: 'logoFileUrl',
          categories: 'categories', zones: 'zones', delaiLivraison: 'delaiLivraison',
        }
        const profileData = {}
        for (const [k, dest] of Object.entries(frnMap)) {
          if (sanitized[k] !== undefined) profileData[dest] = sanitized[k]
        }
        if (Object.keys(profileData).length > 0) {
          await prisma.fournisseurProfile.update({
            where: { userId: req.user.id },
            data: profileData,
          }).catch(e => console.warn('[ONBOARDING] fournisseurProfile sync failed:', e.message))
        }
      }
    }

    res.json(updated.onboardingData)
  } catch (e) {
    console.error('[USERS] PATCH /me/onboarding', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

/**
 * PATCH /api/users/me
 * Met à jour les champs de base de l’utilisateur connecté (name, phone, email).
 * Seuls les champs autorisés sont acceptés.
 */
router.patch('/me', requireAuth, async (req, res) => {
  const prisma = getPrisma()
  try {
    const ALLOWED = ['name', 'phone', 'company', 'ville', 'metier', 'avatar']
    const patch = {}
    for (const key of ALLOWED) {
      if (req.body[key] !== undefined && req.body[key] !== null) {
        patch[key] = String(req.body[key]).trim()
      }
    }
    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: 'Aucun champ valide fourni' })
    }
    // Email change: enforce uniqueness
    if (req.body.email) {
      const email = String(req.body.email).trim().toLowerCase()
      const existing = await prisma.user.findUnique({ where: { email } })
      if (existing && existing.id !== req.user.id) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé' })
      }
      patch.email = email
    }
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: patch,
      select: { id: true, name: true, email: true, type: true, phone: true, company: true, ville: true, metier: true, avatar: true, verified: true, publicId: true },
    })
    res.json(updated)
  } catch (e) {
    console.error('[USERS] PATCH /me', e)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

module.exports = router
