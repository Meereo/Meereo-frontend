const { Router } = require('express')
const { getPrisma } = require('../db')
const { createError } = require('../middleware/errorHandler')

const router = Router()

/**
 * GET /api/pro/:publicId
 *
 * Endpoint PUBLIC — aucune authentification requise.
 * Retourne le profil public d'un professionnel identifié par son publicId (UUID).
 *
 * Données exposées : profil, onboardingData (filtré), statistiques agrégées.
 * Données non exposées : passwordHash, emails internes, tokens, données privées.
 */
router.get('/:publicId', async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { publicId } = req.params

    // Validation basique pour éviter les injections / requêtes invalides
    if (!publicId || publicId.length < 10) {
      throw createError('Identifiant de profil invalide', 400)
    }

    const user = await prisma.user.findUnique({
      where: { publicId },
      select: {
        id:        true,
        publicId:  true,
        name:      true,
        company:   true,
        ville:     true,
        verified:  true,
        type:      true,
        createdAt: true,
        onboardingData: true,
        proProfile: {
          select: {
            entreprise:    true,
            ville:         true,
            pays:          true,
            tel:           true,
            annee:         true,
            rccm:          true,
            secteurs:      true,
            services:      true,
            logoColor:     true,
            logoShape:     true,
            logoTypo:      true,
            logoFileUrl:   true,
            slogan:        true,
            bio:           true,
            projetsN:      true,
            effectif:      true,
            portfolioFiles: true,
            cockpitTeam:   true,
            coverUrl:      true,
          },
        },
        // Stats : projets
        ownedProjects: {
          where: { status: { not: 'deleted' } },
          select: { id: true, avancement: true },
        },
        // Stats : marchés complétés
        supplierMarkets: {
          select: { id: true, statut: true },
        },
      },
    })

    if (!user) {
      throw createError('Profil introuvable', 404)
    }

    if (user.type !== 'pro') {
      throw createError('Ce profil n\'est pas accessible publiquement', 403)
    }

    // Statistiques supplémentaires
    const [offersCount, aosAnswered, certifications] = await Promise.all([
      prisma.offer.count({ where: { supplierId: user.id } }),
      prisma.offer.count({ where: { supplierId: user.id, statut: 'accepted' } }),
      prisma.document.findMany({
        where: { userId: user.id, isEntreprise: true, category: 'certification', parentId: null },
        select: { id: true, name: true, expiresAt: true, createdAt: true },
      }),
    ])

    // Calculer les statistiques publiques
    const projects = user.ownedProjects || []
    const markets  = user.supplierMarkets || []
    const anciennete = Math.max(1, Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30)))
    const stats = {
      projectsCount:      projects.length,
      projectsActive:     projects.filter(p => p.avancement > 0 && p.avancement < 100).length,
      projectsCompleted:  projects.filter(p => p.avancement >= 100).length,
      missionsCompleted:  markets.filter(m => m.statut === 'completed' || m.statut === 'livre').length,
      missionsActive:     markets.filter(m => m.statut === 'signed' || m.statut === 'ongoing' || m.statut === 'IN_PROGRESS').length,
      offersSubmitted:    offersCount,
      offersAccepted:     aosAnswered,
      tauxReponse:        offersCount > 0 ? Math.round(aosAnswered / offersCount * 100) : 0,
      ancienneteMois:     anciennete,
      certifications:     certifications,
    }

    // Fusionner proProfile + onboardingData → profil public cohérent
    // onboardingData prime (données wizard les plus récentes)
    const od  = (user.onboardingData || {})
    const pro = user.proProfile || {}

    // Filtrer les champs sensibles de onboardingData
    const {
      password, passwordHash, token, resetToken, // champs à ne jamais exposer
      emailPro, // on expose seulement l'email pro (visible intentionnellement sur le profil)
      ...safeOd
    } = od

    const profile = {
      entreprise:    od.entreprise    || pro.entreprise    || user.company || user.name,
      ville:         od.ville         || pro.ville         || user.ville   || 'Abidjan',
      pays:          od.pays          || pro.pays          || "Côte d'Ivoire",
      tel:           od.tel           || od.telPro         || pro.tel      || '',
      email:         od.email         || emailPro          || '',
      annee:         od.annee         || pro.annee         || null,
      rccm:          od.rccm          || pro.rccm          || null,
      secteurs:      od.secteurs      || pro.secteurs      || [],
      services:      od.services      || pro.services      || [],
      logoColor:     od.logoColor     || pro.logoColor     || '#1D1D1F',
      logoShape:     od.logoShape     || pro.logoShape     || 'Hexagone',
      logoTypo:      od.logoTypo      || pro.logoTypo      || 'Gras',
      logoFileUrl:   od.logoFileUrl   || pro.logoFileUrl   || null,
      photoUrl:      od.photoUrl      || null,
      slogan:        od.slogan        || pro.slogan        || '',
      bio:           od.bio           || pro.bio           || '',
      projetsN:      od.projetsN      || pro.projetsN      || null,
      effectif:      od.effectif      || pro.effectif      || null,
      portfolioFiles: od.portfolio    || pro.portfolioFiles || [],
      cockpitTeam:   od.cockpitTeam   || pro.cockpitTeam  || [],
      coverUrl:      od.bannerUrl     || od.coverUrl || pro.coverUrl      || null,
      bannerUrl:     od.bannerUrl     || od.coverUrl || pro.coverUrl || null,
      bannerPosition: od.bannerPosition || 50,
      zones:         od.zones         || [],
    }

    res.json({
      id:        user.id,
      publicId:  user.publicId,
      name:      user.name,
      verified:  user.verified,
      createdAt: user.createdAt,
      profile,
      stats,
    })
  } catch (e) {
    next(e)
  }
})

module.exports = router
