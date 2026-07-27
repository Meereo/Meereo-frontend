// ─── Onboarding v2 — /api/onboarding ────────────────────────────────────────
//
// 7 routes :
//   GET  /steps/:role        Fil d'étapes par rôle (servi par l'API, jamais en dur côté front)
//   POST /email-available    Réponse volontairement pauvre (anti-énumération)
//   POST /draft              Crée ou met à jour un brouillon
//   GET  /draft/:id          Reprend un brouillon (410 si expiré)
//   POST /validate           Valide un palier sans persister
//   POST /submit             Crée le compte + ouvre la session (201 + cookie)
//   POST /logo               Upload de logo (413 si > 10 Mo)
//
// L'ancienne route POST /auth/register reste en place — le front basculera
// vers /api/onboarding/submit quand il sera prêt.
// ─────────────────────────────────────────────────────────────────────────────

const { Router } = require('express')
const path = require('path')
const fs = require('fs')
const multer = require('multer')
const crypto = require('crypto')
const { z } = require('zod')

const { createError } = require('../middleware/errorHandler')
const accountsAdapter = require('../adapters/accountsAdapter')
const companiesAdapter = require('../adapters/companiesAdapter')
const draftsAdapter = require('../adapters/draftsAdapter')
const onboardingTxAdapter = require('../adapters/onboardingTxAdapter')
const sessionAdapter = require('../adapters/sessionAdapter')
const { sendOnboardingWelcome } = require('../utils/onboardingMail')

const router = Router()

// ─── Rate-limit (mémoire) ───────────────────────────────────────────────────
// Appliqué à toutes les routes d'onboarding en prod.

const rateLimit = require('express-rate-limit')
const isDev = process.env.NODE_ENV !== 'production'

const onboardingLimiter = isDev
  ? (_req, _res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,   // 15 min
      max: 60,                     // 60 requêtes par fenêtre
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Trop de requêtes — réessayez dans quelques minutes' },
    })

router.use(onboardingLimiter)

// Limite renforcée sur submit (création de compte)
const submitLimiter = isDev
  ? (_req, _res, next) => next()
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 10,
      message: { error: 'Trop de tentatives de création de compte — réessayez dans 15 minutes' },
      standardHeaders: true,
      legacyHeaders: false,
    })

// ─── Storage local-fs (logos) ───────────────────────────────────────────────
// Branché sur le dossier d'upload du projet : server/uploads/logos/
// Fichiers servis en statique via /uploads/logos/* (déjà monté dans index.js)

const UPLOAD_DIR = path.join(__dirname, '../../uploads/logos')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const LOGO_MAX_SIZE = 10 * 1024 * 1024 // 10 Mo

const logoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png'
    cb(null, `logo-${crypto.randomUUID()}${ext}`)
  },
})

const logoUpload = multer({
  storage: logoStorage,
  limits: { fileSize: LOGO_MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.webp', '.svg']
    const ext = path.extname(file.originalname).toLowerCase()
    if (!allowed.includes(ext)) {
      return cb(createError('Format non supporté — PNG, JPG, WebP ou SVG', 422))
    }
    cb(null, true)
  },
})

// ─── Validation Zod partagée ────────────────────────────────────────────────

const VALID_ROLES = ['pro', 'client', 'fournisseur']

const emailSchema = z.string().email().toLowerCase().trim()

const passwordSchema = z.string().min(8).max(128)

// ─── Référentiel des étapes ─────────────────────────────────────────────────

const STEPS = {
  // Arbitrage 11 : client = 2 étapes (pas d'étape projet, pas de KAi)
  client: [
    { key: 'identity',  label: 'Mon compte' },
    { key: 'situation',  label: 'Ma situation' },
  ],
  // Pro = 4 étapes (ville obligatoire, logo franchissable)
  pro: [
    { key: 'structure',  label: 'Ma structure' },
    { key: 'logo',       label: 'Identité visuelle' },
    { key: 'services',   label: 'Mes services' },
    { key: 'portfolio',  label: 'Mon portfolio' },
  ],
  // Fournisseur = 6 étapes (encaissement obligatoire, produit facultatif)
  fournisseur: [
    { key: 'structure',  label: 'Ma structure' },
    { key: 'logo',       label: 'Identité visuelle' },
    { key: 'catalogue',  label: 'Mon catalogue' },
    { key: 'products',   label: 'Mes produits' },
    { key: 'payout',     label: 'Encaissement' },
    { key: 'zones',      label: 'Mes zones' },
  ],
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /steps/:role — fil d'étapes
// ─────────────────────────────────────────────────────────────────────────────

router.get('/steps/:role', (req, res) => {
  const { role } = req.params
  const steps = STEPS[role]
  if (!steps) {
    return res.status(422).json({ error: `Rôle invalide — valeurs acceptées : ${VALID_ROLES.join(', ')}` })
  }
  res.json({ role, steps })
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /email-available — réponse volontairement pauvre (anti-énumération)
// ─────────────────────────────────────────────────────────────────────────────

router.post('/email-available', async (req, res, next) => {
  try {
    const { email, role } = req.body
    const parsed = emailSchema.safeParse(email)
    if (!parsed.success) {
      return res.status(422).json({ available: false })
    }
    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(422).json({ available: false })
    }
    const available = await accountsAdapter.emailAvailableForRole(parsed.data, role)
    // Réponse volontairement pauvre — ne jamais révéler QUI possède l'adresse
    res.json({ available })
  } catch (err) {
    next(err)
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /draft — crée ou met à jour un brouillon
// ─────────────────────────────────────────────────────────────────────────────

router.post('/draft', async (req, res, next) => {
  try {
    const { email, role, data, draftId } = req.body

    if (!role || !VALID_ROLES.includes(role)) {
      return res.status(422).json({ error: 'Rôle invalide' })
    }

    // Mise à jour d'un brouillon existant
    if (draftId) {
      const existing = await draftsAdapter.findById(draftId)
      if (!existing) {
        return res.status(410).json({ error: 'Brouillon introuvable ou expiré' })
      }
      if (existing.expiresAt < new Date()) {
        return res.status(410).json({ error: 'Brouillon expiré — veuillez recommencer' })
      }
      const updated = await draftsAdapter.update(draftId, data || {})
      return res.json({ draft: updated })
    }

    // Création
    const parsed = emailSchema.safeParse(email)
    if (!parsed.success) {
      return res.status(422).json({ error: 'Adresse email invalide' })
    }

    // Reprendre un brouillon existant pour ce couple (email, role)
    const resume = await draftsAdapter.findByEmailAndRole(parsed.data, role)
    if (resume) {
      const merged = { ...(typeof resume.data === 'object' ? resume.data : {}), ...(data || {}) }
      const updated = await draftsAdapter.update(resume.id, merged)
      return res.json({ draft: updated, resumed: true })
    }

    const draft = await draftsAdapter.create({ email: parsed.data, role, data: data || {} })
    return res.status(201).json({ draft })
  } catch (err) {
    next(err)
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// GET /draft/:id — reprend un brouillon (410 si expiré)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/draft/:id', async (req, res, next) => {
  try {
    const draft = await draftsAdapter.findById(req.params.id)
    if (!draft) {
      return res.status(410).json({ error: 'Brouillon introuvable ou expiré' })
    }
    if (draft.expiresAt < new Date()) {
      return res.status(410).json({ error: 'Brouillon expiré — veuillez recommencer' })
    }
    res.json({ draft })
  } catch (err) {
    next(err)
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /validate — valide un palier sans persister
// ─────────────────────────────────────────────────────────────────────────────

const stepValidators = {
  // Identité pro/fournisseur
  identity: z.object({
    entreprise: z.string().min(1).max(200).optional(),
    name: z.string().min(1).max(150).optional(),
    tel: z.string().optional(),
    ville: z.string().max(100).optional(),
    rccm: z.string().optional(),
    ncc: z.string().optional(),
    prenom: z.string().max(80).optional(),
    nom: z.string().max(80).optional(),
    civilite: z.enum(['Monsieur', 'Madame']).optional(),
  }).passthrough(),

  // Secteurs/services (pro)
  activity: z.object({
    secteurs: z.array(z.string()).min(1, 'Au moins un secteur requis').max(10).optional(),
    services: z.array(z.string()).max(50).optional(),
  }).passthrough(),

  // Catalogue fournisseur
  catalogue: z.object({
    categories: z.array(z.string()).max(30).optional(),
    zones: z.array(z.string()).max(50).optional(),
  }).passthrough(),

  // Credentials
  credentials: z.object({
    email: emailSchema,
    password: passwordSchema,
  }),

  // Projet client
  project: z.object({
    projectType: z.string().max(80).optional(),
    location: z.string().max(200).optional(),
    budget: z.string().max(100).optional(),
  }).passthrough(),

  // Payout fournisseur
  payout: z.object({
    type: z.enum(['orange_money', 'mtn_momo', 'wave', 'bank_transfer']),
  }).passthrough(),
}

router.post('/validate', async (req, res, next) => {
  try {
    const { step, data, role } = req.body

    if (!step) {
      return res.status(422).json({ error: 'Champ step requis' })
    }

    const validator = stepValidators[step]
    if (!validator) {
      // Étapes sans validation spécifique (role, logo, presentation) → OK
      return res.json({ valid: true })
    }

    const result = validator.safeParse(data || {})
    if (!result.success) {
      const errors = result.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      return res.status(422).json({ valid: false, errors })
    }

    // Vérifications métier asynchrones sur credentials
    if (step === 'credentials' && role && VALID_ROLES.includes(role)) {
      const available = await accountsAdapter.emailAvailableForRole(result.data.email, role)
      if (!available) {
        return res.status(409).json({
          valid: false,
          errors: [{ field: 'email', message: 'Cette adresse est déjà utilisée pour ce type de compte' }],
        })
      }
    }

    res.json({ valid: true })
  } catch (err) {
    next(err)
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /submit — crée le compte + ouvre la session (201)
// ─────────────────────────────────────────────────────────────────────────────

// Schéma de validation du submit
const submitSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1).max(150).trim(),
  type: z.enum(['pro', 'client', 'fournisseur']),
  company: z.string().max(200).trim().optional(),
  phone: z.string().max(30).optional(),
  metier: z.string().max(100).optional(),
  ville: z.string().max(100).optional(),
  profile: z.record(z.unknown()).optional(),
  entreprise: z.object({
    id: z.string().optional(),
    legalName: z.string().max(200).optional(),
    rccm: z.string().optional(),
    ncc: z.string().optional(),
  }).optional(),
  payoutMethod: z.object({
    type: z.enum(['orange_money', 'mtn_momo', 'wave', 'bank_transfer']),
    label: z.string().max(100).optional(),
    details: z.record(z.unknown()).optional(),
  }).optional(),
  firstProduct: z.object({
    name: z.string().min(1).max(200),
    category: z.string().max(100).optional(),
    price: z.number().optional(),
    unit: z.string().max(50).optional(),
    description: z.string().max(2000).optional(),
    photoUrl: z.string().optional(),
  }).optional(),
  draftId: z.string().optional(),
})

router.post('/submit', submitLimiter, async (req, res, next) => {
  try {
    // 1. Validation du payload
    const parsed = submitSchema.safeParse(req.body)
    if (!parsed.success) {
      const errors = parsed.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }))
      return res.status(422).json({ error: 'Données invalides', errors })
    }
    const data = parsed.data

    // MKT-06 : encaissement obligatoire pour les fournisseurs
    if (data.type === 'fournisseur' && !data.payoutMethod) {
      return res.status(422).json({
        error: 'Moyen d\'encaissement requis pour les fournisseurs',
        errors: [{ field: 'payoutMethod', message: 'Sélectionnez un moyen d\'encaissement' }],
      })
    }

    // 2. Vérification RCCM : rattachement OU conflit
    if (data.entreprise && !data.entreprise.id) {
      if (data.entreprise.rccm) {
        const existing = await companiesAdapter.findByRccm(data.entreprise.rccm)
        if (existing) {
          // L'entreprise existe déjà — vérifier qu'elle n'a pas déjà un compte pour ce rôle
          const hasRole = await companiesAdapter.hasAccountForRole(existing.id, data.type)
          if (hasRole) {
            return res.status(409).json({
              error: 'Cette entreprise possède déjà un compte pour ce rôle',
              code: 'ROLE_ALREADY_ON_COMPANY',
            })
          }
          // Rattachement à l'entreprise existante
          data.entreprise = { id: existing.id }
        }
      }
    }

    // 3. Transaction atomique : compte + profil + draft cleanup
    const { user } = await onboardingTxAdapter.execute(data)

    // 4. Session ouverte DANS LA MÊME RÉPONSE (NAV-07)
    const session = sessionAdapter.open(user, res)

    // 5. Email de bienvenue — un échec n'annule JAMAIS la création
    sendOnboardingWelcome({ to: user.email, name: user.name, role: data.type })
      .catch(err => console.warn('[ONBOARDING] email bienvenue échoué:', err.message))

    return res.status(201).json(session)
  } catch (err) {
    // Traduire les codes métier en HTTP
    if (err.code === 'EMAIL_TAKEN') {
      return res.status(409).json({ error: 'Cette adresse est déjà utilisée pour ce type de compte', code: 'EMAIL_TAKEN' })
    }
    if (err.code === 'RCCM_TAKEN') {
      return res.status(409).json({ error: 'Ce numéro RCCM est déjà enregistré', code: 'RCCM_TAKEN' })
    }
    if (err.code === 'NCC_TAKEN') {
      return res.status(409).json({ error: 'Ce numéro de contribuable est déjà enregistré', code: 'NCC_TAKEN' })
    }
    if (err.code === 'ROLE_ALREADY_ON_COMPANY') {
      return res.status(409).json({ error: 'Cette entreprise possède déjà un compte pour ce rôle', code: 'ROLE_ALREADY_ON_COMPANY' })
    }
    next(err)
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// POST /logo — upload de logo (413 si trop volumineux)
// ─────────────────────────────────────────────────────────────────────────────

router.post('/logo', (req, res, next) => {
  logoUpload.single('logo')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'Fichier trop volumineux — 10 Mo maximum' })
      }
      return next(err)
    }
    if (!req.file) {
      return res.status(422).json({ error: 'Aucun fichier reçu (champ attendu : logo)' })
    }
    const url = `/uploads/logos/${req.file.filename}`
    res.status(201).json({ url, filename: req.file.filename })
  })
})

module.exports = router
