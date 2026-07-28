/**
 * PARCOURS PAR RÔLE — INS-15 (le fil d'étapes est DÉRIVÉ du rôle, jamais en dur).
 *
 * Le prototype affichait 5 points en dur pour les trois rôles. Ici, PATHS est la
 * seule source : le fil, la garde de progression et le service en dépendent tous.
 *
 * 🔴 DÉCISION 27/07/2026 — L'ÉTAPE « PROJET » DU CLIENT EST SUPPRIMÉE.
 * MEEREO : « elle ne crée aucune action donc pas besoin qu'elle soit là ».
 * Conséquence à connaître : la recommandation KAi de fin de parcours (INS-16)
 * n'a plus AUCUNE donnée d'entrée. Elle est donc retirée du parcours, et non
 * remplie de valeurs par défaut — ce que INS-16 interdit précisément.
 */
import { z } from 'zod';
import {
  makeAccountSchema, proStructureSchema, supplierStructureSchema,
  productSchema, payoutMethodSchema, logoSchema, roleSchema, type Role,
} from './schemas.ts';

export type StepId =
  | 'role' | 'account'
  | 'client-done'
  | 'pro-structure' | 'pro-logo' | 'pro-done'
  | 'supplier-structure' | 'supplier-logo' | 'supplier-payout' | 'supplier-product' | 'supplier-done';

export const roleStepSchema = z.object({ role: roleSchema });

/** Étape facultative : tout est optionnel, rien n'est prérempli (INS-16). */
export const optionalStep = z.object({}).passthrough();

export interface StepDef {
  id: StepId;
  label: string;
  schema: z.ZodTypeAny;
  /** false = franchissable sans saisie (INS-12 pour le logo, MKT-06 pour le produit) */
  required: boolean;
  /** true = écran terminal, pas une étape de saisie */
  terminal?: boolean;
}

const ROLE_STEP: StepDef  = { id: 'role',    label: 'Votre profil', schema: roleStepSchema, required: true };
const account = (r: Role): StepDef => ({ id: 'account', label: 'Votre compte', schema: makeAccountSchema(r), required: true });

/**
 * Comptage officiel des étapes de saisie (hors écran terminal) :
 *   CLIENT       : 2  (rôle, compte)
 *   PRO          : 4  (rôle, compte, structure, logo)
 *   FOURNISSEUR  : 6  (rôle, compte, structure, logo, encaissement, produit)
 * Le fournisseur en compte bien SIX — l'étape d'encaissement (MKT-06 §4) est
 * ce qui lui permet d'être payé. Sans elle il termine son inscription sans
 * pouvoir vendre.
 */
export const PATHS: Record<Role, StepDef[]> = {
  CLIENT: [
    ROLE_STEP,
    account('CLIENT'),
    { id: 'client-done', label: 'Terminé', schema: optionalStep, required: false, terminal: true },
  ],
  PRO: [
    ROLE_STEP,
    account('PRO'),
    { id: 'pro-structure', label: 'Votre entreprise', schema: proStructureSchema, required: true },
    { id: 'pro-logo',      label: 'Votre logo',       schema: logoSchema,         required: false },
    { id: 'pro-done',      label: 'Terminé',          schema: optionalStep,       required: false, terminal: true },
  ],
  FOURNISSEUR: [
    ROLE_STEP,
    account('FOURNISSEUR'),
    { id: 'supplier-structure', label: 'Votre entreprise', schema: supplierStructureSchema, required: true },
    { id: 'supplier-logo',      label: 'Votre logo',       schema: logoSchema,              required: false },
    { id: 'supplier-payout',    label: 'Encaissement',     schema: payoutMethodSchema,      required: true },
    { id: 'supplier-product',   label: 'Premier produit',  schema: productSchema,           required: false },
    { id: 'supplier-done',      label: 'Terminé',          schema: optionalStep,            required: false, terminal: true },
  ],
};

export const stepsOf = (role: Role): StepDef[] => PATHS[role];
export const inputStepsOf = (role: Role) => stepsOf(role).filter(s => !s.terminal);
export const stepDef = (role: Role, id: StepId) => stepsOf(role).find(s => s.id === id) ?? null;
export const stepIndex = (role: Role, id: StepId) => stepsOf(role).findIndex(s => s.id === id);
