const { Router } = require('express')
const crypto = require('crypto')
const { getPrisma } = require('../db')
const { hashPassword, comparePassword } = require('../utils/password')
const { signToken } = require('../utils/token')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')
const { sendPasswordResetEmail } = require('../utils/email')
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

// ─── Blocklist RCCM / NCC ────────────────────────────────────────────────────
// Valeurs d'exemple / placeholder qui ne doivent jamais être enregistrées.
const RCCM_BLOCKLIST = [
  'CI-ABJ-2024-B-12345', 'CI-ABJ-0000-X-00000',
  'CI/ABJ/2024/B/12345', 'CI/ABJ/0000/X/00000',
]
const NCC_BLOCKLIST = [
  'CI0000000A', 'CI1234567A', '1234567A', '0000000A',
]

function isBlockedRccm(v) {
  if (!v) return false
  const clean = v.toUpperCase().replace(/[\s]/g, '')
  if (RCCM_BLOCKLIST.includes(clean)) return true
  // Reject obvious test patterns: all zeros in digit portions
  if (/^CI[-/][A-Z]{2,4}[-/]0{4}[-/][A-Z][-/]0{3,6}$/.test(clean)) return true
  return false
}

function isBlockedNcc(v) {
  if (!v) return false
  const clean = v.toUpperCase().replace(/[\s-]/g, '')
  if (NCC_BLOCKLIST.includes(clean)) return true
  // Reject all-zeros or all-same-digit patterns
  if (/^(CI)?0{7,}[A-Z]?$/.test(clean)) return true
  return false
}

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
      // Générer un slug SEO-friendly à partir du nom d'entreprise ou du nom
      const slugBase = (base.company || base.name || 'pro')
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 50)
      const slugSuffix = Math.random().toString(36).slice(2, 6)
      const slug = slugBase + '-' + slugSuffix

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
          slug,
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
        // Rejeter les valeurs d'exemple RCCM / NCC
        if (isBlockedRccm(profile.rccm)) {
          throw createError(400, 'Le RCCM saisi correspond à une valeur d\'exemple. Veuillez renseigner le véritable RCCM de votre entreprise.')
        }
        if (isBlockedNcc(profile.ncc)) {
          throw createError(400, 'Le numéro de contribuable saisi correspond à une valeur d\'exemple. Veuillez renseigner le véritable numéro de contribuable de votre entreprise.')
        }
        // Vérifier unicité RCCM
        if (profile.rccm) {
          const existingRccm = await tx.proProfile.findUnique({ where: { rccm: profile.rccm } })
            || await tx.fournisseurProfile.findUnique({ where: { rccm: profile.rccm } })
          if (existingRccm) throw createError(409, 'Ce numéro RCCM est déjà utilisé par une autre entreprise')
        }
        // Vérifier unicité NCC
        if (profile.ncc) {
          const existingNcc = await tx.proProfile.findUnique({ where: { ncc: profile.ncc } })
            || await tx.fournisseurProfile.findUnique({ where: { ncc: profile.ncc } })
          if (existingNcc) throw createError(409, 'Ce numéro de contribuable est déjà utilisé par une autre entreprise')
        }
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
            activeLogoType: profile.activeLogoType || (profile.logoFileUrl ? 'uploaded' : 'generated'),
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
        // Rejeter les valeurs d'exemple RCCM / NCC
        if (isBlockedRccm(profile.rccm)) {
          throw createError(400, 'Le RCCM saisi correspond à une valeur d\'exemple. Veuillez renseigner le véritable RCCM de votre entreprise.')
        }
        if (isBlockedNcc(profile.ncc)) {
          throw createError(400, 'Le numéro de contribuable saisi correspond à une valeur d\'exemple. Veuillez renseigner le véritable numéro de contribuable de votre entreprise.')
        }
        // Vérifier unicité RCCM
        if (profile.rccm) {
          const existingRccm = await tx.proProfile.findUnique({ where: { rccm: profile.rccm } })
            || await tx.fournisseurProfile.findUnique({ where: { rccm: profile.rccm } })
          if (existingRccm) throw createError(409, 'Ce numéro RCCM est déjà utilisé par une autre entreprise')
        }
        // Vérifier unicité NCC
        if (profile.ncc) {
          const existingNcc = await tx.proProfile.findUnique({ where: { ncc: profile.ncc } })
            || await tx.fournisseurProfile.findUnique({ where: { ncc: profile.ncc } })
          if (existingNcc) throw createError(409, 'Ce numéro de contribuable est déjà utilisé par une autre entreprise')
        }
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

    // 6. Persister les données d'onboarding (champs wizard) dans onboardingData
    //    pour que GET /users/me/onboarding retourne les données complètes dès la
    //    première hydration, sans dépendre d'un second appel PATCH.
    // Whitelist explicite des champs autorisés dans onboardingData.
    // On ne stocke PAS req.body entier pour éviter l'injection de champs arbitraires.
    const OD_ALLOWED_KEYS = new Set([
      'name','type','company','phone','metier','ville','pays','annee',
      'rccm','ncc','tel','telPro','slogan','bio','projetsN','effectif',
      'logoColor','logoShape','logoTypo','prenom','nom','civilite',
      'projectType','location','surface','budget','description','situation',
      'architecteEmail','delaiLivraison','secteurs','services','categories',
      'zones','cockpitTeam','logoFileUrl','photoUrl','coverUrl','entreprise',
      'activeLogoType',
    ])
    const initialOd = {}
    for (const [k, v] of Object.entries(req.body)) {
      if (!OD_ALLOWED_KEYS.has(k)) continue  // ignorer les champs inconnus
      if (k === 'password') continue
      if (v === null || v === undefined) continue
      if (typeof v === 'string') {
        if (v.trim() === '') continue
        if (v.startsWith('data:') && v.length > 5_000_000) continue // image trop volumineuse
        initialOd[k] = v
      } else if (Array.isArray(v)) {
        if (v.length > 0) initialOd[k] = v
      } else if (typeof v === 'number' || typeof v === 'boolean') {
        initialOd[k] = v
      }
      // objets imbriqués ignorés — ne stocker que scalaires et tableaux
    }
    if (Object.keys(initialOd).length > 0) {
      await getPrisma().user.update({
        where: { id: user.id },
        data: { onboardingData: initialOd },
      }).catch(e => console.warn('[AUTH] onboardingData initial save failed:', e.message))
    }

    // 7. Répondre avec le user public + token JWT
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

router.get('/me', requireAuth, async (req, res) => {
  // Retourner aussi le token pour que le frontend puisse le garder en mémoire
  // (nécessaire pour le Bearer sur les WS et la compatibilité Bearer)
  let user = req.user

  // Auto-générer publicId si absent (comptes créés avant l'ajout du champ)
  if (!user.publicId) {
    try {
      const prisma = getPrisma()
      const publicId = crypto.randomUUID()
      await prisma.user.update({ where: { id: user.id }, data: { publicId } })
      user = { ...user, publicId }
    } catch {
      // Non bloquant — le profil public ne sera juste pas accessible
    }
  }

  res.json({ ...user, token: req.authToken })
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
    const prisma = getPrisma()
    const user = req.user

    if (user.emailVerified) {
      return res.json({ success: true, message: 'Email déjà vérifié' })
    }

    // Générer un token de vérification
    const rawToken = crypto.randomBytes(32).toString('hex')
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24h

    // Stocker dans onboardingData (pas de table dédiée — réutilise le champ JSON)
    await prisma.user.update({
      where: { id: user.id },
      data: { onboardingData: { ...((await prisma.user.findUnique({ where: { id: user.id }, select: { onboardingData: true } }))?.onboardingData || {}), _emailVerifyToken: tokenHash, _emailVerifyExpires: expiresAt.toISOString() } },
    })

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174'
    const verifyLink = `${frontendUrl}/verify-email?token=${rawToken}&uid=${user.id}`

    const { sendVerificationEmail } = require('../utils/email')
    await sendVerificationEmail({ to: user.email, verifyLink }).catch(e => console.warn('[AUTH] sendVerificationEmail failed:', e.message))

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

// NOTE : cet endpoint vérifie l'email via un token signé envoyé par /send-verification.
router.post('/verify-email', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { token } = req.body

    if (!token) {
      // Fallback: marquer vérifié directement (usage interne ou dev)
      await prisma.user.update({ where: { id: req.user.id }, data: { emailVerified: true } })
      return res.json({ success: true, verified: true })
    }

    // Vérifier le token
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const userData = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { onboardingData: true, emailVerified: true },
    })
    const od = userData?.onboardingData || {}

    if (od._emailVerifyToken !== tokenHash) {
      return res.status(400).json({ error: 'Token de vérification invalide' })
    }
    if (od._emailVerifyExpires && new Date(od._emailVerifyExpires) < new Date()) {
      return res.status(400).json({ error: 'Token expiré — veuillez redemander un email' })
    }

    // Nettoyer le token et marquer l'email vérifié
    const { _emailVerifyToken, _emailVerifyExpires, ...cleanOd } = od
    await prisma.user.update({
      where: { id: req.user.id },
      data: { emailVerified: true, onboardingData: cleanOd },
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
      // Stocker uniquement le HASH du token en base — le token brut n'est jamais persisté.
      // En cas de fuite de la DB, un attaquant ne peut pas utiliser les hashes pour reset.
      const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex')
      const expiresAt = new Date(Date.now() + RESET_EXPIRES_MS)

      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: tokenHash,  // hash SHA-256 du token brut
          expiresAt,
        },
      })

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174'
      const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`
      const emailResult = await sendPasswordResetEmail({ to: user.email, resetLink, expiresMin: Math.round(RESET_EXPIRES_MS / 60000) }).catch(e => {
        console.warn('[AUTH] sendPasswordResetEmail failed:', e.message)
        return { success: false }
      })

      if (process.env.NODE_ENV !== 'production' && emailResult.dev) {
        return res.json({
          success: true,
          message: 'Lien de réinitialisation généré (mode dev — voir console serveur)',
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

    // Le token en base est un hash SHA-256 ; hasher l'entrée avant de chercher
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: tokenHash },
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

    // Hard delete — Prisma onDelete:Cascade removes all related records
    // (profiles, projects, AOs, offers, messages, orders, tasks, documents, etc.)
    await prisma.user.delete({ where: { id: userId } })

    // Clear the session cookie so the user is immediately unauthenticated
    res.clearCookie('meereo_token', { path: '/', sameSite: 'strict' })
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
