/**
 * SERVICE D'INSCRIPTION — le cœur métier, sans framework ni base.
 * Testable de bout en bout contre des adaptateurs en mémoire.
 */
import { z } from 'zod';
import {
  makeAccountSchema, proStructureSchema, supplierStructureSchema,
  productSchema, payoutMethodSchema, logoSchema, validate, type Role,
} from './schemas.ts';
import { PATHS, stepsOf, type StepId } from './steps.ts';
import { OnboardingError, issue, type OnboardingIssue } from './errors.ts';
import type { OnboardingDeps, CreateAccountCommand } from './ports.ts';

export interface SubmitPayload {
  role: Role;
  account: unknown;
  structure?: unknown;
  logo?: unknown;
  payout?: unknown;
  product?: unknown;
  draftId?: string | null;
}

const STRUCTURE_STEP: Record<Role, StepId | null> = { CLIENT: null, PRO: 'pro-structure', FOURNISSEUR: 'supplier-structure' };
const LOGO_STEP: Record<Role, StepId | null> = { CLIENT: null, PRO: 'pro-logo', FOURNISSEUR: 'supplier-logo' };

export function createOnboardingService(deps: OnboardingDeps) {

  /** INS-09 — l'unicité porte sur (adresse, rôle) parmi les comptes ACTIFS.
   *  Décision 27/07 : une même adresse peut porter un compte PRO et un compte
   *  FOURNISSEUR, jamais deux du même rôle. */
  async function checkEmailAvailability(email: string, role: Role) {
    const ok = await deps.rateLimit.hit(`email-check:${email}`, 20, 60_000);
    if (!ok) throw new OnboardingError([issue('account', 'email', 'RATE_LIMITED', 'Trop de vérifications. Réessayez dans une minute.')]);
    const available = await deps.accounts.emailAvailableForRole(email, role);
    const others = await deps.accounts.listActiveByEmail(email);
    return { available, usedByOtherRoles: others.filter(a => a.role !== role).map(a => a.role) };
  }

  function validateAll(p: SubmitPayload): { issues: OnboardingIssue[]; parsed: Record<string, unknown> } {
    const issues: OnboardingIssue[] = []; const parsed: Record<string, unknown> = {};
    const push = (step: StepId, r: ReturnType<typeof validate>) => {
      if (!r.ok) for (const [f, m] of Object.entries(r.errors)) issues.push(issue(step, f, 'VALIDATION', m));
      return r;
    };
    const a = push('account', validate(makeAccountSchema(p.role), p.account));
    if (a.ok) parsed.account = a.value;

    const sStep = STRUCTURE_STEP[p.role];
    if (sStep) {
      const schema = p.role === 'PRO' ? proStructureSchema : supplierStructureSchema;
      const r = push(sStep, validate(schema, p.structure ?? {}));
      if (r.ok) parsed.structure = r.value;
    }
    const lStep = LOGO_STEP[p.role];
    if (lStep && p.logo !== undefined) {
      const r = push(lStep, validate(logoSchema, p.logo));
      if (r.ok) parsed.logo = r.value;
    }
    if (p.role === 'FOURNISSEUR') {
      const r = push('supplier-payout', validate(payoutMethodSchema, p.payout ?? {}));  // MKT-06 §4 — obligatoire
      if (r.ok) parsed.payout = r.value;
      // Produit FACULTATIF (décision 27/07). Validé seulement s'il est fourni.
      if (p.product !== undefined && p.product !== null) {
        const rp = push('supplier-product', validate(productSchema, p.product));
        if (rp.ok) parsed.product = rp.value;
      }
    }
    return { issues, parsed };
  }

  async function submit(p: SubmitPayload) {
    const { issues, parsed } = validateAll(p);
    if (issues.length) throw new OnboardingError(issues);

    const account = parsed.account as z.infer<ReturnType<typeof makeAccountSchema>>;
    const structure = parsed.structure as { legalName: string; rccm: string; taxId: string } | undefined;

    const extra: OnboardingIssue[] = [];

    // ── Unicité de l'adresse, par rôle ─────────────────────────────
    if (!(await deps.accounts.emailAvailableForRole(account.email, p.role)))
      extra.push(issue('account', 'email', 'EMAIL_TAKEN', 'Un compte de ce type existe déjà avec cette adresse.'));

    // ── INS-20 : unicité de l'identité légale, portée par l'ENTREPRISE ──
    let attachToCompanyId: string | null = null;
    if (structure) {
      const byRccm = await deps.companies.findByRccm(structure.rccm);
      const byTax  = await deps.companies.findByTaxId(structure.taxId);
      const step = STRUCTURE_STEP[p.role]!;

      if (byRccm && byTax && byRccm.id !== byTax.id) {
        extra.push(issue(step, 'rccm', 'RCCM_TAKEN', 'Ce RCCM et ce numéro de contribuable appartiennent à deux entreprises différentes.'));
      } else {
        const existing = byRccm ?? byTax;
        if (existing) {
          // L'entreprise existe : cumul de rôles autorisé (INS-14), MAIS le lien
          // ne peut PAS naître ici. Un rattachement déduit d'une simple égalité de
          // RCCM transformerait INS-20 en prise de contrôle de compte.
          if (await deps.companies.hasAccountForRole(existing.id, p.role))
            extra.push(issue(step, 'rccm', 'ROLE_ALREADY_ON_COMPANY', 'Un compte de ce type existe déjà pour cette entreprise.'));
          else
            extra.push(issue(step, 'rccm', 'RCCM_TAKEN',
              'Cette entreprise est déjà inscrite. Pour ajouter une activité, connectez-vous et utilisez « Ajouter une activité ».'));
        }
      }
    }
    if (extra.length) throw new OnboardingError(extra);

    // ── Écriture ───────────────────────────────────────────────────
    const passwordHash = await deps.password.hash(account.password);
    const cmd: CreateAccountCommand = {
      role: p.role,
      account: {
        firstName: account.firstName, lastName: account.lastName,
        email: account.email, phone: account.phone,
        city: account.city || undefined,
        passwordHash,
        termsVersion: deps.termsVersion,      // INS-10 — version conservée
        marketingOptIn: account.marketingOptIn ?? false,
      },
      company: structure ? { legalName: structure.legalName, rccm: structure.rccm, taxId: structure.taxId } : null,
      attachToCompanyId,
      proProfile: p.role === 'PRO'
        ? { sectors: (parsed.structure as any).sectors, logoAssetId: (parsed.logo as any)?.logoAssetId ?? null }
        : null,
      supplierProfile: p.role === 'FOURNISSEUR'
        ? {
            servedCategories: (parsed.structure as any).servedCategories,
            deliveryModes: (parsed.structure as any).deliveryModes,
            deliveryZones: (parsed.structure as any).deliveryZones,
            deliveryLeadTimeDays: (parsed.structure as any).deliveryLeadTimeDays ?? null,
            logoAssetId: (parsed.logo as any)?.logoAssetId ?? null,
          }
        : null,
      payoutMethod: (parsed.payout as any) ?? null,
      firstProduct: (parsed.product as any) ?? null,
      draftId: p.draftId ?? null,
    };

    const { accountId, companyId } = await deps.tx.createAccountWithProfile(cmd);

    // NAV-07 — la session est ouverte IMMÉDIATEMENT. Aucune redirection vers un
    // écran de connexion : c'est cette rupture qui déconnecte aujourd'hui.
    const session = await deps.session.issue(accountId);

    // INS-09 — l'échec d'envoi NE DOIT PAS annuler la création du compte.
    // La porte de correction (bandeau dans l'espace) permet de s'en sortir.
    const token = `vt_${accountId}_${deps.clock.now().getTime()}`;
    const expiresAt = new Date(deps.clock.now().getTime() + 24 * 3600_000);
    let mailSent = true;
    try { await deps.mail.sendVerificationLink(account.email, token, expiresAt); }
    catch { mailSent = false; }

    return { accountId, companyId, session, emailVerificationSent: mailSent, verificationToken: token };
  }

  /* ── Brouillon (INS-13) ────────────────────────────────────────── */

  async function saveDraft(input: { id?: string; role: Role | null; step: StepId; data: unknown; email?: string | null }) {
    const expiresAt = new Date(deps.clock.now().getTime() + deps.draftTtlDays * 24 * 3600_000);
    // RÈGLE : jamais de mot de passe dans un brouillon.
    return deps.drafts.save({ id: input.id, role: input.role, step: input.step, data: stripSecrets(input.data), email: input.email ?? null, expiresAt });
  }

  async function resumeDraft(id: string) {
    const d = await deps.drafts.get(id);
    if (!d) return null;
    if (d.expiresAt.getTime() <= deps.clock.now().getTime()) {
      await deps.drafts.delete(id);
      throw new OnboardingError([issue(null, null, 'DRAFT_EXPIRED', 'Ce brouillon a expiré. Reprenez votre inscription depuis le début.')]);
    }
    return d;
  }

  const purgeExpiredDrafts = () => deps.drafts.purgeExpired(deps.clock.now());

  return { checkEmailAvailability, validateAll, submit, saveDraft, resumeDraft, purgeExpiredDrafts, stepsOf, PATHS };
}

/** Un mot de passe n'a rien à faire dans un brouillon serveur. */
export function stripSecrets(data: unknown): unknown {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(stripSecrets);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data as Record<string, unknown>)) {
    if (/password|secret|token/i.test(k)) continue;
    out[k] = stripSecrets(v);
  }
  return out;
}

export type OnboardingService = ReturnType<typeof createOnboardingService>;
