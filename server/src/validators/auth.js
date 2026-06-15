const { z } = require('zod')

// ─── Champs partagés ──────────────────────────────────────────────────────────

const emailField = z
  .string({ required_error: 'Email requis' })
  .email('Adresse email invalide')
  .toLowerCase()
  .trim()

const passwordField = z
  .string({ required_error: 'Mot de passe requis' })
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(128, 'Mot de passe trop long')

const phoneField = z
  .string({ required_error: 'Téléphone requis' })
  .min(8, 'Numéro de téléphone invalide')
  .max(30, 'Numéro de téléphone invalide')
  .regex(/^[+\d\s\-().]{8,30}$/, 'Format de téléphone invalide')

const optionalPhone = z
  .union([
    z.string().min(8, 'Numéro de téléphone invalide').max(30).regex(/^[+\d\s\-().]{8,30}$/, 'Format de téléphone invalide'),
    z.literal(''),
  ])
  .optional()

const rccmField = z
  .string()
  .toUpperCase()
  .refine(
    v => !v || /^CI[-/][A-Z]{2,4}[-/]\d{4}[-/][A-Z][-/]\d{3,6}$/.test(v.replace(/\s/g, '')),
    { message: 'Format RCCM invalide — attendu : CI-ABJ-2024-B-12345' }
  )
  .optional()

const nccField = z
  .string()
  .toUpperCase()
  .refine(
    v => !v || /^(CI\d{7,9}[A-Z]|\d{7,}[A-Z]?)$/.test(v.replace(/[\s-]/g, '')),
    { message: 'Format NCC invalide — attendu : CI-0000000-A' }
  )
  .optional()

// ─── Login ────────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: emailField,
  password: z.string({ required_error: 'Mot de passe requis' }).min(1, 'Mot de passe requis'),
})

// ─── Register — schéma minimal commun (ce que le frontend envoie à /auth/register) ──

const registerBaseSchema = z.object({
  email: emailField,
  password: passwordField,
  name: z.string({ required_error: 'Nom requis' }).min(1, 'Nom requis').max(150).trim(),
  type: z.enum(['pro', 'client', 'fournisseur'], {
    required_error: "Type d'utilisateur requis",
    invalid_type_error: "Type invalide — valeurs acceptées : pro, client, fournisseur",
  }),
  // Champs optionnels passés par le store
  company: z.string().max(200).trim().optional(),
  phone: optionalPhone,
  avatar: z.string().url('URL avatar invalide').optional().or(z.literal('')),
  metier: z.string().max(100).optional(),
  ville: z.string().max(100).optional(),
})

// ─── Register Client — wizard complet (facultatif, enrichit le profil) ────────

const registerClientProfileSchema = z.object({
  prenom: z.string().min(1, 'Prénom requis').max(80).trim().optional(),
  nom: z.string().min(1, 'Nom requis').max(80).trim().optional(),
  civilite: z.enum(['Monsieur', 'Madame']).optional(),
  tel: optionalPhone,
  ville: z.string().max(100).optional(),
  pays: z.string().max(80).optional(),
  photoUrl: z.string().optional(),

  // Projet
  projectType: z.string().max(80).optional(),
  location: z.string().max(200).optional(),
  surface: z.string().max(50).optional(),
  budget: z.string().max(100).optional(),
  description: z.string().max(2000).optional(),
  situation: z.string().max(200).optional(),
  architecteEmail: z.string().email('Email architecte invalide').optional().or(z.literal('')),
})

// ─── Register Pro — wizard complet ────────────────────────────────────────────

const registerProProfileSchema = z.object({
  entreprise: z.string().min(1, 'Nom de la structure requis').max(200).trim().optional(),
  ville: z.string().max(100).optional(),
  pays: z.string().max(80).optional(),
  annee: z
    .string()
    .refine(v => !v || /^\d{4}$/.test(v), { message: 'Année invalide (format AAAA)' })
    .optional(),
  rccm: rccmField,
  ncc: nccField,
  tel: optionalPhone,

  secteurs: z.array(z.string().max(100)).max(10).optional(),
  services: z.array(z.string().max(100)).max(50).optional(),

  logoColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hex invalide').optional(),
  logoShape: z.enum(['Hexagone', 'Cercle', 'Carré', 'Diamant', 'Triangle']).optional(),
  logoTypo: z.enum(['Gras', 'Serif', 'Léger']).optional(),
  logoFileUrl: z.string().optional(),

  slogan: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  projetsN: z.string().max(20).optional(),
  effectif: z.string().max(50).optional(),

  portfolioFiles: z.array(z.string()).max(20).optional(),
  cockpitTeam: z
    .array(
      z.object({
        nom: z.string().max(100).optional(),
        role: z.string().max(100).optional(),
        photoUrl: z.string().optional(),
      })
    )
    .max(20)
    .optional(),
  coverUrl: z.string().optional(),
})

// ─── Register Fournisseur — wizard complet ─────────────────────────────────────

const registerFournisseurProfileSchema = z.object({
  entreprise: z.string().min(1, 'Nom de l\'entreprise requis').max(200).trim().optional(),
  ville: z.string().max(100).optional(),
  pays: z.string().max(80).optional(),
  rccm: rccmField,
  ncc: nccField,
  tel: optionalPhone,

  logoColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Couleur hex invalide').optional(),
  logoShape: z.enum(['Hexagone', 'Cercle', 'Carré', 'Diamant', 'Triangle']).optional(),
  logoTypo: z.enum(['Gras', 'Serif', 'Léger']).optional(),
  logoFileUrl: z.string().optional(),

  categories: z.array(z.string().max(100)).max(30).optional(),
  zones: z.array(z.string().max(100)).max(50).optional(),
  delaiLivraison: z.string().max(100).optional(),

  products: z
    .array(
      z.object({
        name: z.string().min(1).max(200),
        price: z.union([z.string(), z.number()]).optional(),
        unit: z.string().max(50).optional(),
        category: z.string().max(100).optional(),
        photoUrl: z.string().optional(),
      })
    )
    .max(50)
    .optional(),
})

// ─── Change password ──────────────────────────────────────────────────────────

const changePasswordSchema = z
  .object({
    currentPassword: z.string({ required_error: 'Mot de passe actuel requis' }).min(1),
    newPassword: passwordField,
    confirmPassword: z.string({ required_error: 'Confirmation requise' }).min(1),
  })
  .refine(d => d.newPassword === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })
  .refine(d => d.currentPassword !== d.newPassword, {
    message: 'Le nouveau mot de passe doit être différent de l\'ancien',
    path: ['newPassword'],
  })

// ─── Forgot / Reset password ──────────────────────────────────────────────────

const forgotPasswordSchema = z.object({
  email: emailField,
})

const resetPasswordSchema = z
  .object({
    token: z.string({ required_error: 'Token requis' }).min(1),
    newPassword: passwordField,
    confirmPassword: z.string({ required_error: 'Confirmation requise' }).min(1),
  })
  .refine(d => d.newPassword === d.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Parse et valide un body avec un schéma Zod.
 * Lance une ZodError (capturée par errorHandler) si invalide.
 * @template T
 * @param {z.ZodSchema<T>} schema
 * @param {unknown} data
 * @returns {T}
 */
function validate(schema, data) {
  return schema.parse(data)
}

module.exports = {
  loginSchema,
  registerBaseSchema,
  registerClientProfileSchema,
  registerProProfileSchema,
  registerFournisseurProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  validate,
}
