const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')

const router = Router()

// GET /api/users/pros — annuaire public des professionnels (avec publicId)
// Supports: ?q=keyword&metier=xxx&ville=xxx&verified=true&secteur=xxx&page=1&limit=50
router.get('/pros', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { q, metier, ville: villeFilter, verified: verifiedFilter, secteur } = req.query
    const where = { type: 'pro' }
    if (metier && metier !== 'all') where.metier = metier
    if (verifiedFilter === 'true') where.verified = true

    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50))
    const skip = (page - 1) * limit

    // Get total count for pagination
    const total = await prisma.user.count({ where })

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
            services:       true,
            logoFileUrl:    true,
            logoColor:      true,
            logoShape:      true,
            logoTypo:       true,
            activeLogoType: true,
            pagePublished:  true,
            portfolioFiles: true,
            slogan:         true,
            bio:            true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip,
    })

    let result = users.map(u => {
      const activeType = u.proProfile?.activeLogoType || 'generated'
      return {
        id:             u.id,
        publicId:       u.publicId,
        nom:            u.proProfile?.entreprise || u.company || u.name || '',
        metier:         u.metier || (u.proProfile?.secteurs?.[0]) || '',
        ville:          u.proProfile?.ville || u.ville || 'Abidjan',
        verified:       u.verified || false,
        avatar:         u.avatar || null,
        logoUrl:        activeType === 'uploaded' ? (u.proProfile?.logoFileUrl || null) : null,
        logoColor:      u.proProfile?.logoColor || null,
        logoShape:      u.proProfile?.logoShape || 'Hexagone',
        logoTypo:       u.proProfile?.logoTypo || 'Gras',
        activeLogoType: activeType,
        pagePublished:  u.proProfile?.pagePublished || false,
        portfolioFiles: u.proProfile?.portfolioFiles || [],
        secteurs:       u.proProfile?.secteurs || [],
        services:       u.proProfile?.services || [],
        slogan:         u.proProfile?.slogan || null,
      }
    })

    // Enhanced search: covers entreprise, metier, ville, secteurs, services, slogan, bio
    if (q) {
      const ql = q.toLowerCase()
      result = result.filter(p => {
        const searchable = [
          p.nom, p.metier, p.ville, p.slogan || '',
          ...(p.secteurs || []), ...(p.services || []),
        ].join(' ').toLowerCase()
        return searchable.includes(ql)
      })
    }

    // Filter by ville
    if (villeFilter && villeFilter !== 'all') {
      result = result.filter(p => p.ville.toLowerCase() === villeFilter.toLowerCase())
    }

    // Filter by secteur
    if (secteur && secteur !== 'all') {
      result = result.filter(p => (p.secteurs || []).some(s => s.toLowerCase().includes(secteur.toLowerCase())))
    }

    res.json({ data: result, total, page, limit })
  } catch (e) {
    next(e)
  }
})

// GET /api/users/fournisseurs — liste des fournisseurs inscrits (public avec auth)
router.get('/fournisseurs', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const page = Math.max(1, parseInt(req.query.page) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50))
    const skip = (page - 1) * limit

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
      take: limit,
      skip,
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

// GET /api/users/registered — users with whom the caller has a professional relationship
// Returns only: conversation peers, project collaborators, market partners, CRM contacts
router.get('/registered', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const uid = req.user.id

    // 1. Users sharing a conversation
    const convPeers = prisma.conversationParticipant.findMany({
      where: { conversation: { participants: { some: { userId: uid } } }, userId: { not: uid } },
      select: { userId: true },
    })

    // 2. Users sharing a project (as owner, client, or member)
    const ownedProjects = prisma.project.findMany({
      where: { ownerId: uid },
      select: { clientId: true, members: { select: { userId: true } } },
    })
    const memberProjects = prisma.projectMember.findMany({
      where: { userId: uid },
      select: { project: { select: { ownerId: true, clientId: true, members: { select: { userId: true } } } } },
    })
    const clientProjects = prisma.project.findMany({
      where: { clientId: uid },
      select: { ownerId: true, members: { select: { userId: true } } },
    })

    // 3. Market partners
    const markets = prisma.market.findMany({
      where: { OR: [{ clientId: uid }, { supplierId: uid }] },
      select: { clientId: true, supplierId: true },
    })

    // 4. CRM contacts with linkedUserId
    const contacts = prisma.contact.findMany({
      where: { ownerId: uid, linkedUserId: { not: null } },
      select: { linkedUserId: true },
    })

    const [convRes, ownedRes, memberRes, clientRes, mktRes, contactRes] = await Promise.all([
      convPeers, ownedProjects, memberProjects, clientProjects, markets, contacts,
    ])

    // Collect unique related user IDs
    const relatedIds = new Set()

    for (const c of convRes) relatedIds.add(c.userId)

    for (const p of ownedRes) {
      if (p.clientId) relatedIds.add(p.clientId)
      for (const m of p.members) relatedIds.add(m.userId)
    }
    for (const pm of memberRes) {
      const p = pm.project
      relatedIds.add(p.ownerId)
      if (p.clientId) relatedIds.add(p.clientId)
      for (const m of p.members) relatedIds.add(m.userId)
    }
    for (const p of clientRes) {
      relatedIds.add(p.ownerId)
      for (const m of p.members) relatedIds.add(m.userId)
    }

    for (const m of mktRes) {
      if (m.clientId) relatedIds.add(m.clientId)
      if (m.supplierId) relatedIds.add(m.supplierId)
    }

    for (const c of contactRes) {
      if (c.linkedUserId) relatedIds.add(c.linkedUserId)
    }

    // Remove self
    relatedIds.delete(uid)

    if (relatedIds.size === 0) return res.json([])

    const users = await prisma.user.findMany({
      where: { id: { in: [...relatedIds] } },
      select: {
        id: true,
        name: true,
        type: true,
        company: true,
        publicId: true,
        avatar: true,
      },
      orderBy: { name: 'asc' },
    })
    res.json(users)
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
        logoColor:      p.logoColor      || '#1D1D1F',
        logoShape:      p.logoShape      || 'Hexagone',
        logoTypo:       p.logoTypo       || 'Gras',
        logoFileUrl:    p.logoFileUrl    || '',
        activeLogoType: p.activeLogoType || 'generated',
        pagePublished:  p.pagePublished  || false,
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
    // Bloquer la modification du RCCM si l'utilisateur est vérifié (INS-01/SYS-06)
    if (sanitized.rccm) {
      const caller = await prisma.user.findUnique({ where: { id: req.user.id }, select: { verified: true } })
      if (caller?.verified) {
        delete sanitized.rccm
      }
    }
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

    // Vérifier unicité RCCM avant sync
    if (sanitized.rccm) {
      const existingPro = await prisma.proProfile.findUnique({ where: { rccm: sanitized.rccm } })
      const existingFrn = await prisma.fournisseurProfile.findUnique({ where: { rccm: sanitized.rccm } })
      const ownId = req.user.id
      if ((existingPro && existingPro.userId !== ownId) || (existingFrn && existingFrn.userId !== ownId)) {
        return res.status(409).json({ error: 'Ce numéro RCCM est déjà utilisé par une autre entreprise' })
      }
    }

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
