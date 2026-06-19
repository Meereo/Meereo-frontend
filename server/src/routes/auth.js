const { Router } = require('express')
const crypto = require('crypto')
const { getPrisma } = require('../db')
const { hashPassword, comparePassword } = require('../utils/password')
const { signToken } = require('../utils/token')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')
const {
  loginSchema,
  registerBaseSchema,
  registerClientProfileSchema,
  registerProProfileSchema,
  registerFournisseurProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validate,
} = require('../validators/auth')

const router = Router()

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Construit l'objet user public (sans passwordHash).
 */
function publicUser(user) {
  const { passwordHash, ...pub } = user // eslint-disable-line no-unused-vars
  return pub
}

/**
 * Génère une réponse d'authentification { user, token } ET pose un cookie httpOnly.
 */
function authResponse(user) {
  const token = signToken({ id: user.id, type: user.type })
  return { user: publicUser(user), token }
}

/** Pose le cookie JWT httpOnly sur la réponse. */
function setAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie('meereo_token', token, {
    httpOnly: true,           // inaccessible au JavaScript de la page
    sameSite: 'strict',       // bloque les requêtes cross-site (CSRF)
    secure: isProd,           // HTTPS uniquement en production
    maxAge: 30 * 24 * 3600 * 1000, // 30 jours
    path: '/',
  })
}

/**
 * Durée de validité d'un token de reset (en ms).
 */
const RESET_EXPIRES_MS =
  parseInt(process.env.RESET_TOKEN_EXPIRES_MIN || '60', 10) * 60 * 1000

// ─── POST /auth/register ──────────────────────────────────────────────────────
//
//  Crée un compte + profil selon le type (pro / client / fournisseur).
//  Payload minimal (toujours présent) :
//    { email, password, name, type, company?, phone?, metier?, ville? }
//  Payload étendu (optionnel — données wizard onboarding) :
//    Voir validators/auth.js pour les champs par type.
//
//  Réponse : { user, token }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/register', async (req, res, next) => {
  try {
    // 1. Validation des champs de base communs à tous les types
    const base = validate(registerBaseSchema, req.body)

    const prisma = getPrisma()

    // 2. Unicité de l'email
    const existing = await prisma.user.findUnique({ where: { email: base.email } })
    if (existing) {
      throw createError('Email déjà utilisé — connectez-vous ou utilisez une autre adresse', 409)
    }

    // 3. Hashage du mot de passe
    const passwordHash = await hashPassword(base.password)

    // 4. Création de l'utilisateur en base (transaction : user + profil atomique)
    let user

    await prisma.$transaction(async (tx) => {
      // Créer le compte
      user = await tx.user.create({
        data: {
          email: base.email,
          passwordHash,
          name: base.name,
          type: base.type,
          company: base.company || null,
          phone: base.phone || null,
          avatar: base.avatar || null,
          metier: base.metier || null,
          ville: base.ville || null,
        },
      })

      // 5. Créer le profil étendu selon le type
      if (base.type === 'client') {
        const profile = validate(registerClientProfileSchema, req.body)
        await tx.clientProfile.create({
          data: {
            userId: user.id,
            prenom: profile.prenom || base.name.split(' ')[0] || '',
            nom: profile.nom || base.name.split(' ').slice(1).join(' ') || '',
            civilite: profile.civilite || null,
            tel: profile.tel || base.phone || '',
            ville: profile.ville || base.ville || 'Abidjan',
            pays: profile.pays || "Côte d'Ivoire",
            photoUrl: profile.photoUrl || null,
            projectType: profile.projectType || null,
            location: profile.location || null,
            surface: profile.surface || null,
            budget: profile.budget || null,
            description: profile.description || null,
            situation: profile.situation || null,
            architecteEmail: profile.architecteEmail || null,
          },
        })
      } else if (base.type === 'pro') {
        const profile = validate(registerProProfileSchema, req.body)
        await tx.proProfile.create({
          data: {
            userId: user.id,
            entreprise: profile.entreprise || base.company || base.name,
            ville: profile.ville || base.ville || 'Abidjan',
            pays: profile.pays || "Côte d'Ivoire",
            annee: profile.annee || null,
            rccm: profile.rccm || null,
            ncc: profile.ncc || null,
            tel: profile.tel || base.phone || '',
            secteurs: profile.secteurs || [],
            services: profile.services || [],
            logoColor: profile.logoColor || '#1D1D1F',
            logoShape: profile.logoShape || 'Hexagone',
            logoTypo: profile.logoTypo || 'Gras',
            logoFileUrl: profile.logoFileUrl || null,
            slogan: profile.slogan || null,
            bio: profile.bio || null,
            projetsN: profile.projetsN || null,
            effectif: profile.effectif || null,
            portfolioFiles: profile.portfolioFiles || [],
            cockpitTeam: profile.cockpitTeam || [],
            coverUrl: profile.coverUrl || null,
          },
        })
      } else if (base.type === 'fournisseur') {
        const profile = validate(registerFournisseurProfileSchema, req.body)
        await tx.fournisseurProfile.create({
          data: {
            userId: user.id,
            entreprise: profile.entreprise || base.company || base.name,
            ville: profile.ville || base.ville || 'Abidjan',
            pays: profile.pays || "Côte d'Ivoire",
            rccm: profile.rccm || null,
            ncc: profile.ncc || null,
            tel: profile.tel || base.phone || '',
            logoColor: profile.logoColor || '#1D1D1F',
            logoShape: profile.logoShape || 'Hexagone',
            logoTypo: profile.logoTypo || 'Gras',
            logoFileUrl: profile.logoFileUrl || null,
            categories: profile.categories || [],
            zones: profile.zones || [],
            delaiLivraison: profile.delaiLivraison || null,
            products: profile.products || [],
          },
        })
      }
    })

    // 6. Répondre avec le user public + token JWT
    const resp = authResponse(user)
    setAuthCookie(res, resp.token)
    return res.status(201).json(resp)
  } catch (err) {
    next(err)
  }
})

// ─── POST /auth/login ─────────────────────────────────────────────────────────
//
//  Authentifie un utilisateur avec email + mot de passe.
//  Réponse : { user, token }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = validate(loginSchema, req.body)
    const prisma = getPrisma()

    const user = await prisma.user.findUnique({ where: { email } })

    // Message volontairement générique pour ne pas révéler l'existence du compte
    if (!user) {
      throw createError('Email ou mot de passe incorrect', 401)
    }

    // Compte supprimé (soft-delete)
    if (user.passwordHash === 'DELETED') {
      throw createError('Ce compte a été supprimé', 401)
    }

    const valid = await comparePassword(password, user.passwordHash)
    if (!valid) {
      throw createError('Email ou mot de passe incorrect', 401)
    }

    const resp = authResponse(user)
    setAuthCookie(res, resp.token)
    return res.json(resp)
  } catch (err) {
    next(err)
  }
})

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
//
//  Retourne l'utilisateur authentifié (vérifie le JWT).
//  Réponse : { ...user }
// ─────────────────────────────────────────────────────────────────────────────

router.get('/me', requireAuth, (req, res) => {
  res.json(req.user)
})

// ─── POST /auth/change-password ───────────────────────────────────────────────
//
//  Change le mot de passe de l'utilisateur connecté.
//  Payload : { currentPassword, newPassword, confirmPassword }
//  Réponse : { success: true }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/change-password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = validate(changePasswordSchema, req.body)
    const prisma = getPrisma()

    // Récupérer le hash stocké (pas dans req.user pour sécurité)
    const stored = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { passwordHash: true },
    })

    const valid = await comparePassword(currentPassword, stored.passwordHash)
    if (!valid) {
      throw createError('Mot de passe actuel incorrect', 401)
    }

    const newHash = await hashPassword(newPassword)
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newHash },
    })

    return res.json({ success: true, message: 'Mot de passe modifié avec succès' })
  } catch (err) {
    next(err)
  }
})

// ─── POST /auth/send-verification ─────────────────────────────────────────────
//
//  Envoie (ou simule) un email de vérification.
//  Réponse : { success: true, message }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/send-verification', requireAuth, async (req, res, next) => {
  try {
    // TODO : intégrer un provider email (Resend, SendGrid, Nodemailer…)
    // Pour l'instant on marque emailVerified directement (env dev)
    if (process.env.NODE_ENV !== 'production') {
      const prisma = getPrisma()
      await prisma.user.update({
        where: { id: req.user.id },
        data: { emailVerified: true },
      })
      return res.json({ success: true, message: 'Email vérifié automatiquement (mode développement)' })
    }

    // Production : envoyer l'email et attendre le clic
    return res.json({ success: true, message: 'Email de vérification envoyé' })
  } catch (err) {
    next(err)
  }
})

// ─── POST /auth/verify-email ──────────────────────────────────────────────────
//
//  Marque l'email comme vérifié (appelé depuis le lien dans le mail).
//  Payload : { email }
//  Réponse : { success: true, verified: true }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/verify-email', async (req, res, next) => {
  try {
    const email = (req.body.email || '').toLowerCase().trim()
    if (!email) throw createError('Email requis', 400)

    const prisma = getPrisma()
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // Réponse silencieuse pour ne pas révéler l'existence du compte
      return res.json({ success: true, verified: true })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    })

    return res.json({ success: true, verified: true })
  } catch (err) {
    next(err)
  }
})

// ─── POST /auth/forgot-password ───────────────────────────────────────────────
//
//  Génère un token de réinitialisation et l'envoie par email.
//  Payload : { email }
//  Réponse : { success: true } — même réponse si le compte n'existe pas (anti-énumération)
// ─────────────────────────────────────────────────────────────────────────────

router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = validate(forgotPasswordSchema, req.body)
    const prisma = getPrisma()

    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      // Révoquer les anciens tokens non utilisés
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      })

      // Générer un token aléatoire (32 octets = 64 hex chars)
      const rawToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + RESET_EXPIRES_MS)

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: rawToken,
          expiresAt,
        },
      })

      // TODO : envoyer l'email avec le lien
      // resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${rawToken}`
      // await sendResetEmail(user.email, resetLink)

      // En développement, retourner le token dans la réponse pour faciliter les tests
      if (process.env.NODE_ENV !== 'production') {
        return res.json({
          success: true,
          message: 'Lien de réinitialisation envoyé (mode dev — token inclus)',
          _devToken: rawToken,
        })
      }
    }

    // Réponse identique que le compte existe ou non (anti-énumération)
    return res.json({
      success: true,
      message: 'Si un compte existe avec cet email, vous recevrez un lien de réinitialisation.',
    })
  } catch (err) {
    next(err)
  }
})

// ─── POST /auth/reset-password ────────────────────────────────────────────────
//
//  Réinitialise le mot de passe avec un token valide.
//  Payload : { token, newPassword, confirmPassword }
//  Réponse : { success: true }
// ─────────────────────────────────────────────────────────────────────────────

router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = validate(resetPasswordSchema, req.body)
    const prisma = getPrisma()

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, passwordHash: true } } },
    })

    if (!resetToken) {
      throw createError('Token invalide ou déjà utilisé', 400)
    }
    if (resetToken.usedAt) {
      throw createError('Ce lien de réinitialisation a déjà été utilisé', 400)
    }
    if (new Date() > resetToken.expiresAt) {
      throw createError('Ce lien de réinitialisation a expiré — demandez-en un nouveau', 400)
    }

    // Vérifier que le nouveau mot de passe est différent de l'ancien
    const sameAsOld = await comparePassword(newPassword, resetToken.user.passwordHash)
    if (sameAsOld) {
      throw createError('Le nouveau mot de passe doit être différent de l\'ancien', 400)
    }

    const newHash = await hashPassword(newPassword)

    // Mise à jour atomique : MDP + marquer le token comme utilisé
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: newHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ])

    return res.json({ success: true, message: 'Mot de passe réinitialisé avec succès' })
  } catch (err) {
    next(err)
  }
})

// ─── DELETE /auth/account ─────────────────────────────────────────────────────
//
//  Suppression de compte (soft-delete : anonymise les données).
//  Réponse : { success: true }
// ─────────────────────────────────────────────────────────────────────────────

router.delete('/account', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const userId = req.user.id
    const { password } = req.body || {}

    if (!password) {
      return res.status(400).json({ error: 'Mot de passe requis pour confirmer la suppression' })
    }

    // Re-verify password server-side before deleting
    const stored = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } })
    const valid = stored && await comparePassword(password, stored.passwordHash)
    if (!valid) {
      return res.status(401).json({ error: 'Mot de passe incorrect' })
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: 'Compte supprimé',
        email: `deleted_${userId}@meereo.ci`,
        passwordHash: 'DELETED',
        avatar: null,
        phone: null,
        company: null,
      },
    })

    return res.json({ success: true, message: 'Compte supprimé' })
  } catch (err) {
    next(err)
  }
})

// ─── POST /auth/logout ────────────────────────────────────────────────────────
// Supprime le cookie httpOnly côté serveur.
router.post('/logout', (req, res) => {
  res.clearCookie('meereo_token', { path: '/', sameSite: 'strict' })
  res.json({ success: true })
})

module.exports = router
