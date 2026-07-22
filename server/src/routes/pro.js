const { Router } = require('express')
const { getPrisma } = require('../db')
const { createError } = require('../middleware/errorHandler')
const { requireAuth } = require('../middleware/auth')

const router = Router()

/**
 * GET /api/pro/:identifier
 *
 * Endpoint PUBLIC — aucune authentification requise.
 * Accepte un slug SEO-friendly OU un publicId (UUID) pour rétrocompatibilité.
 */
router.get('/:identifier', async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { identifier } = req.params

    if (!identifier || identifier.length < 2) {
      throw createError('Identifiant de profil invalide', 400)
    }

    // Chercher par slug d'abord, puis par publicId (rétrocompat)
    const userSelect = {
      id: true, publicId: true, slug: true, name: true, company: true, ville: true,
      verified: true, type: true, createdAt: true, onboardingData: true,
      proProfile: {
        select: {
          entreprise: true, ville: true, pays: true, tel: true, annee: true,
          rccm: true, secteurs: true, services: true, logoColor: true, logoShape: true,
          logoTypo: true, logoFileUrl: true, activeLogoType: true, pagePublished: true,
          slogan: true, bio: true, projetsN: true,
          effectif: true, portfolioFiles: true, cockpitTeam: true, coverUrl: true,
          pageSections: true,
        },
      },
      ownedProjects: {
        where: { status: { not: 'deleted' } },
        select: { id: true, avancement: true },
      },
      supplierMarkets: {
        select: { id: true, statut: true },
      },
    }

    let user = await prisma.user.findUnique({ where: { slug: identifier }, select: userSelect }).catch(() => null)
    if (!user) {
      user = await prisma.user.findUnique({ where: { publicId: identifier }, select: userSelect }).catch(() => null)
    }

    if (!user) throw createError('Profil introuvable', 404)
    if (user.type !== 'pro') throw createError('Ce profil n\'est pas accessible publiquement', 403)

    // Stats supplémentaires
    const [offersCount, aosAnswered, certifications, reviews] = await Promise.all([
      prisma.offer.count({ where: { supplierId: user.id } }),
      prisma.offer.count({ where: { supplierId: user.id, statut: 'accepted' } }),
      prisma.document.findMany({
        where: { userId: user.id, isEntreprise: true, category: 'certification', parentId: null },
        select: { id: true, name: true, expiresAt: true, createdAt: true },
      }),
      prisma.review.findMany({
        where: { targetId: user.id },
        include: { author: { select: { id: true, name: true, company: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }).catch(() => []),
    ])

    // Calculer les statistiques publiques
    const projects = user.ownedProjects || []
    const markets = user.supplierMarkets || []
    const anciennete = Math.max(1, Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)))
    const avgNote = reviews.length > 0 ? Math.round(reviews.reduce((s, r) => s + r.note, 0) / reviews.length * 10) / 10 : null

    const stats = {
      projectsCount: projects.length,
      projectsActive: projects.filter(p => p.avancement > 0 && p.avancement < 100).length,
      projectsCompleted: projects.filter(p => p.avancement >= 100).length,
      missionsCompleted: markets.filter(m => m.statut === 'completed' || m.statut === 'livre').length,
      missionsActive: markets.filter(m => m.statut === 'signed' || m.statut === 'ongoing' || m.statut === 'IN_PROGRESS').length,
      offersSubmitted: offersCount,
      offersAccepted: aosAnswered,
      tauxReponse: offersCount > 0 ? Math.round(aosAnswered / offersCount * 100) : 0,
      ancienneteMois: anciennete,
      certifications,
      noteAvg: avgNote,
      reviewsCount: reviews.length,
    }

    // Fusionner proProfile + onboardingData — whitelist stricte (jamais de password/token)
    const rawOd = (user.onboardingData || {})
    const pro = user.proProfile || {}
    // Extraire uniquement les champs publics autorisés de onboardingData
    const od = {
      entreprise: rawOd.entreprise, ville: rawOd.ville, pays: rawOd.pays,
      tel: rawOd.tel || rawOd.telPro, email: rawOd.email,
      annee: rawOd.annee, rccm: rawOd.rccm,
      secteurs: rawOd.secteurs, services: rawOd.services,
      logoColor: rawOd.logoColor, logoShape: rawOd.logoShape,
      logoTypo: rawOd.logoTypo, logoFileUrl: rawOd.logoFileUrl,
      photoUrl: rawOd.photoUrl, slogan: rawOd.slogan, bio: rawOd.bio,
      projetsN: rawOd.projetsN, effectif: rawOd.effectif,
      portfolio: rawOd.portfolio, cockpitTeam: rawOd.cockpitTeam,
      bannerUrl: rawOd.bannerUrl, coverUrl: rawOd.coverUrl,
      bannerPosition: rawOd.bannerPosition, zones: rawOd.zones,
    }

    const profile = {
      entreprise: od.entreprise || pro.entreprise || user.company || user.name,
      ville: od.ville || pro.ville || user.ville || 'Abidjan',
      pays: od.pays || pro.pays || "Côte d'Ivoire",
      tel: od.tel || od.telPro || pro.tel || '',
      email: od.email || emailPro || '',
      annee: od.annee || pro.annee || null,
      rccm: od.rccm || pro.rccm || null,
      secteurs: od.secteurs || pro.secteurs || [],
      services: od.services || pro.services || [],
      logoColor: od.logoColor || pro.logoColor || '#1D1D1F',
      logoShape: od.logoShape || pro.logoShape || 'Hexagone',
      logoTypo: od.logoTypo || pro.logoTypo || 'Gras',
      logoFileUrl: od.logoFileUrl || pro.logoFileUrl || null,
      photoUrl: od.photoUrl || null,
      slogan: od.slogan || pro.slogan || '',
      bio: od.bio || pro.bio || '',
      projetsN: od.projetsN || pro.projetsN || null,
      effectif: od.effectif || pro.effectif || null,
      portfolioFiles: od.portfolio || pro.portfolioFiles || [],
      cockpitTeam: od.cockpitTeam || pro.cockpitTeam || [],
      coverUrl: od.bannerUrl || od.coverUrl || pro.coverUrl || null,
      bannerUrl: od.bannerUrl || od.coverUrl || pro.coverUrl || null,
      bannerPosition: od.bannerPosition || 50,
      zones: od.zones || [],
    }

    res.json({
      id: user.id,
      publicId: user.publicId,
      slug: user.slug,
      name: user.name,
      verified: user.verified,
      createdAt: user.createdAt,
      profile,
      pagePublished: pro.pagePublished || false,
      pageSections: pro.pageSections || [],
      stats,
      reviews: reviews.map(r => ({
        id: r.id,
        note: r.note,
        qualite: r.qualite,
        delais: r.delais,
        communication: r.communication,
        comment: r.comment,
        createdAt: r.createdAt,
        author: { name: r.author?.name, company: r.author?.company },
      })),
    })
  } catch (e) {
    next(e)
  }
})

// ─── PUT /api/pro/page-sections ──────────────────────────────────────────────
// Sauvegarde les sections de la page builder du pro connecté.
router.put('/page-sections', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const userId = req.user.id
    const { sections } = req.body

    if (!Array.isArray(sections)) {
      throw createError('sections doit être un tableau', 400)
    }

    // Extract team members from sections to keep cockpitTeam in sync
    const teamSection = sections.find(s => s.type === 'team')
    const teamMembers = teamSection?.data?.members || teamSection?.members || []
    const cockpitTeam = teamMembers.map(m => ({
      nom: m.name || m.nom || '',
      role: m.role || '',
      photo: m.photoSrc || m.photo || null,
    })).filter(m => m.nom)

    await prisma.proProfile.update({
      where: { userId },
      data: {
        pageSections: sections,
        pagePublished: true,
        ...(cockpitTeam.length > 0 ? { cockpitTeam } : {}),
      },
    })

    res.json({ success: true })
  } catch (e) {
    next(e)
  }
})

// ─── GET /api/pro/page-sections/me ──────────────────────────────────────────
// Récupère les sections de la page builder du pro connecté.
router.get('/page-sections/me', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const profile = await prisma.proProfile.findUnique({
      where: { userId: req.user.id },
      select: { pageSections: true, pagePublished: true },
    })
    res.json({ sections: profile?.pageSections || [], pagePublished: profile?.pagePublished || false })
  } catch (e) {
    next(e)
  }
})

// ─── PUT /api/pro/slug ──────────────────────────────────────────────────────
// Permet au pro de modifier son URL publique (slug).
router.put('/slug', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { slug } = req.body
    if (!slug || typeof slug !== 'string') {
      throw createError('Le slug est requis', 400)
    }
    // Normalize: lowercase, remove accents, replace non-alphanumeric with hyphens
    const normalized = slug.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 60)

    if (normalized.length < 3) {
      throw createError('Le slug doit contenir au moins 3 caractères', 400)
    }

    // Check uniqueness
    const existing = await prisma.user.findUnique({ where: { slug: normalized } })
    if (existing && existing.id !== req.user.id) {
      throw createError('Cette URL est déjà utilisée par un autre professionnel', 409)
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { slug: normalized },
    })

    res.json({ slug: normalized, url: `/pro/${normalized}` })
  } catch (e) {
    next(e)
  }
})

// ─── POST /api/pro/request-verification ─────────────────────────────────────
// Le pro soumet sa demande de vérification (RCCM + documents admin)
router.post('/request-verification', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const userId = req.user.id
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { type: true, verified: true, onboardingData: true } })
    if (!user || user.type !== 'pro') throw createError('Réservé aux professionnels', 403)
    if (user.verified) return res.json({ success: true, alreadyVerified: true })

    const od = user.onboardingData || {}
    const rccm = od.rccm || req.body.rccm
    if (!rccm) throw createError('Le numéro RCCM est obligatoire pour la vérification', 400)

    // Vérifier qu'au moins un document admin a été uploadé
    const adminDocs = await prisma.document.count({
      where: { userId, category: { in: ['certification', 'admin', 'legal'] }, parentId: null },
    })
    if (adminDocs === 0) throw createError('Veuillez télécharger au moins un document administratif (RCCM, attestation, etc.)', 400)

    // Sauvegarder le RCCM dans onboardingData si pas encore fait
    if (!od.rccm && rccm) {
      await prisma.user.update({
        where: { id: userId },
        data: { onboardingData: { ...od, rccm, verificationRequestedAt: new Date().toISOString() } },
      })
    }

    // INS-04: Verify RCCM number matches the one declared at registration
    const proProfile = await prisma.proProfile.findUnique({ where: { userId }, select: { rccm: true } })
    const registeredRccm = (proProfile?.rccm || '').toUpperCase().replace(/[\s]/g, '')
    const submittedRccm = rccm.toUpperCase().replace(/[\s]/g, '')

    if (registeredRccm && submittedRccm && registeredRccm === submittedRccm) {
      // RCCM matches — auto-verify the professional (INS-04 badge activation)
      await prisma.user.update({
        where: { id: userId },
        data: { verified: true },
      })
      // Notify the pro about successful verification
      await prisma.notification.create({
        data: { userId, type: 'green', message: 'Votre entreprise est désormais vérifiée par MEEREO. Le badge est actif sur toutes les interfaces.', link: '/pro', read: false },
      }).catch(() => {})

      return res.json({ success: true, verified: true, message: 'RCCM vérifié avec succès. Badge « Vérifié par MEEREO » activé.' })
    }

    // RCCM doesn't match or not verifiable automatically — notify admins for manual review
    const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } })
    for (const admin of admins) {
      await prisma.notification.create({
        data: { userId: admin.id, type: 'verification_request', message: `Demande de vérification : ${od.entreprise || 'Professionnel'} — RCCM: ${rccm}${registeredRccm !== submittedRccm ? ' (écart avec inscription: ' + registeredRccm + ')' : ''}`, link: '/admin', read: false },
      }).catch(() => {})
    }

    res.json({ success: true, verified: false, message: registeredRccm !== submittedRccm
      ? 'Le numéro RCCM soumis ne correspond pas à celui de l\'inscription. Un administrateur va vérifier votre dossier.'
      : 'Demande de vérification envoyée. Vous serez notifié une fois la vérification effectuée.' })
  } catch (e) { next(e) }
})

module.exports = router
