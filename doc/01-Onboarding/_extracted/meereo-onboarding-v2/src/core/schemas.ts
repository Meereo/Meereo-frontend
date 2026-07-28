/**
 * SCHÉMAS DE VALIDATION — SOURCE UNIQUE, FRONT ET API.
 * Réf. Annexe 3/A3.2 : « le même schéma utilisé pour activer/désactiver le bouton,
 * afficher les erreurs, et revalider côté serveur ».
 *
 * C'est la correction de fond de INS-06 : l'état du bouton est DÉRIVÉ du schéma.
 * Le défaut d'origine était un onclick="afterAccount()" sans aucune condition.
 */
import { z } from 'zod';
import { checkPassword, PASSWORD_MESSAGES } from './password-policy.ts';
import { normalizeCiPhone, isMobileCi } from './phone-ci.ts';
import {
  PRO_SECTOR_IDS, CATEGORY_IDS, SALE_UNIT_IDS, PAYOUT_PROVIDER_IDS, DELIVERY_MODE_IDS,
} from './reference-data.ts';

export const roleSchema = z.enum(['CLIENT', 'PRO', 'FOURNISSEUR']);
export type Role = z.infer<typeof roleSchema>;

/* ─────────────── Identité légale (INS-01 / INS-20) ─────────────── */

export const RCCM_RE = /^CI-[A-Z]{3}-\d{4}-[A-Z]-\d{4,6}$/;
export const SAMPLE_RCCM = 'CI-ABJ-2024-B-12345';
export const TAX_RE = /^\d{7,13}[A-Z]?$/;

const rccmField = z.string().trim().toUpperCase()
  .refine(v => v !== SAMPLE_RCCM, 'Ceci est un exemple de format, pas un numéro valide.')
  .refine(v => RCCM_RE.test(v), 'Format attendu : CI-ABJ-AAAA-X-NNNNN');

const taxField = z.string().trim().toUpperCase()
  .refine(v => TAX_RE.test(v), 'Numéro de contribuable invalide.');

/** INS-01/INS-20 — l'identité légale appartient à l'ENTREPRISE, pas au compte.
 *  C'est ce déplacement qui rend le cumul de rôles possible sans rouvrir INS-20. */
export const companySchema = z.object({
  legalName: z.string().trim().min(2, 'Nom de l’entreprise requis.').max(160),
  rccm: rccmField,
  taxId: taxField,
});
export type CompanyInput = z.infer<typeof companySchema>;

/* ─────────────── Compte (INS-08 / INS-09 / INS-10) ─────────────── */

const emailField = z.string().trim().toLowerCase()
  .min(1, 'Adresse e-mail requise.')
  .email('Adresse e-mail invalide.');

const phoneField = z.string().trim().min(1, 'Numéro de téléphone requis.')
  .transform((v, ctx) => {
    const n = normalizeCiPhone(v);
    if (!n) { ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Numéro invalide. Ex. : +225 07 07 12 34 56' }); return z.NEVER; }
    return n;
  });

const passwordField = z.string().superRefine((v, ctx) => {
  for (const p of checkPassword(v)) ctx.addIssue({ code: z.ZodIssueCode.custom, message: PASSWORD_MESSAGES[p] });
});

/** INS-08 : ville obligatoire pour PRO et FOURNISSEUR, facultative pour CLIENT.
 *  Le schéma dépend donc du rôle — d'où la fabrique. */
export function makeAccountSchema(role: Role) {
  const city = role === 'CLIENT'
    ? z.string().trim().max(80).optional().or(z.literal(''))
    : z.string().trim().min(2, 'Ville requise.').max(80);
  return z.object({
    firstName: z.string().trim().min(2, 'Prénom requis.').max(80),
    lastName:  z.string().trim().min(2, 'Nom requis.').max(80),
    email: emailField,
    phone: phoneField,
    city,
    password: passwordField,
    // INS-10 — sans version conservée, un consentement n'est pas opposable.
    acceptTerms: z.literal(true, { errorMap: () => ({ message: 'Vous devez accepter les CGU et la politique de confidentialité.' }) }),
    marketingOptIn: z.boolean().default(false),
  });
}
export type AccountInput = z.infer<ReturnType<typeof makeAccountSchema>>;

/* ─────────────── Structures ─────────────── */

export const proStructureSchema = companySchema.extend({
  sectors: z.array(z.enum(PRO_SECTOR_IDS)).min(1, 'Sélectionnez au moins un secteur d’activité.'),
});
export type ProStructureInput = z.infer<typeof proStructureSchema>;

export const supplierStructureSchema = companySchema.extend({
  servedCategories: z.array(z.enum(CATEGORY_IDS)).min(1, 'Sélectionnez au moins une catégorie.'),
  deliveryModes: z.array(z.enum(DELIVERY_MODE_IDS)).min(1, 'Choisissez au moins un mode de livraison.'),
  deliveryZones: z.array(z.string().trim().min(2)).min(1, 'Indiquez au moins une zone de livraison.'),
  deliveryLeadTimeDays: z.number().int().min(0).max(365).nullable(),
});
export type SupplierStructureInput = z.infer<typeof supplierStructureSchema>;

/* ─────────────── Produit — FIN-04 / MKT-01 ─────────────── */

export const pricingModeSchema = z.enum(['FIXED', 'ON_QUOTE']);
export type PricingMode = z.infer<typeof pricingModeSchema>;

/**
 * ⚠️ Le zéro NE signifie plus « sur devis ».
 * C'est le motif exact que FIN-04 impute à la chaîne financière rompue : un
 * montant absent devenu 0, puis propagé. Avec un zéro, aucun écran en aval ne
 * distingue « sur devis », « gratuit » et « non renseigné ».
 */
export const productSchema = z.object({
  name: z.string().trim().min(2, 'Nom du produit requis.').max(160),
  categoryId: z.enum(CATEGORY_IDS),
  unitId: z.enum(SALE_UNIT_IDS),
  stock: z.number().int().min(0, 'Le stock ne peut pas être négatif.'),
  pricingMode: pricingModeSchema,
  priceFcfa: z.number().int().positive('Le prix doit être strictement positif.').nullable(),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  photoUrl: z.string().trim().url('URL invalide.').optional().or(z.literal('')),
}).superRefine((v, ctx) => {
  if (v.pricingMode === 'ON_QUOTE' && v.priceFcfa !== null)
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['priceFcfa'], message: 'Un produit sur devis ne porte pas de prix.' });
  if (v.pricingMode === 'FIXED' && v.priceFcfa === null)
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['priceFcfa'], message: 'Indiquez un prix, ou choisissez « Sur devis ».' });
});
export type ProductInput = z.infer<typeof productSchema>;

/* ─────────────── Encaissement — MKT-06 §4 ─────────────── */

export const payoutMethodSchema = z.object({
  provider: z.enum(PAYOUT_PROVIDER_IDS),
  phone: z.string().trim().min(1, 'Numéro requis.').transform((v, ctx) => {
    const n = normalizeCiPhone(v);
    if (!n) { ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Numéro invalide.' }); return z.NEVER; }
    if (!isMobileCi(n)) { ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Un numéro mobile est requis pour le Mobile Money.' }); return z.NEVER; }
    return n;
  }),
  accountHolder: z.string().trim().min(2, 'Titulaire du compte requis.').max(120),
  isDefault: z.boolean().default(true),
});
export type PayoutMethodInput = z.infer<typeof payoutMethodSchema>;

/* ─────────────── Logo — INS-12 ─────────────── */

/** L'étape est FRANCHISSABLE. Le repli monogramme est CALCULÉ À L'AFFICHAGE
 *  (QAL-07) et n'est JAMAIS stocké : aucune valeur par défaut ici. */
export const logoSchema = z.object({ logoAssetId: z.string().trim().min(1).nullable() });

/* ─────────────── Utilitaires partagés ─────────────── */

export type FieldErrors = Record<string, string>;

export function collectErrors(err: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const i of err.issues) {
    const k = i.path.join('.') || '_';
    if (!(k in out)) out[k] = i.message;
  }
  return out;
}

export type Validated<T> = { ok: true; value: T } | { ok: false; errors: FieldErrors };

export function validate<S extends z.ZodTypeAny>(schema: S, data: unknown): Validated<z.infer<S>> {
  const r = schema.safeParse(data);
  return r.success ? { ok: true, value: r.data } : { ok: false, errors: collectErrors(r.error) };
}

/** Le booléen qui pilote le bouton « Continuer ». Dérivé, jamais posé. */
export const isStepValid = (schema: z.ZodTypeAny, data: unknown) => schema.safeParse(data).success;
