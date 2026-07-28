/**
 * API EXPRESS — routeur d'inscription.
 * Le métier est dans src/core : ce fichier ne fait que traduire HTTP ↔ service.
 * On doit pouvoir le remplacer par Fastify ou NestJS sans toucher au noyau.
 */
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { createOnboardingService, type SubmitPayload } from '../core/service.ts';
import type { OnboardingDeps, StoragePort } from '../core/ports.ts';
import { roleSchema } from '../core/schemas.ts';
import { stepsOf } from '../core/steps.ts';
import { toHttp } from './errors.http.ts';

export interface RouterOptions {
  deps: OnboardingDeps;
  storage: StoragePort;
  /** Pose le cookie de session. L'authentification n'étant pas encore arrêtée
   *  côté MEEREO, c'est le SEUL point à écrire le jour où elle le sera. */
  setSessionCookie?: (res: Response, token: string, expiresAt: Date) => void;
}

export function createOnboardingRouter(opts: RouterOptions): Router {
  const svc = createOnboardingService(opts.deps);
  const r = Router();
  const ok = (res: Response, body: unknown, status = 200) => res.status(status).json(body);
  const fail = (res: Response, e: unknown) => { const { status, body } = toHttp(e); res.status(status).json(body) };

  /** Le fil d'étapes est SERVI par l'API, jamais écrit en dur côté front (INS-15). */
  r.get('/steps/:role', (req: Request, res: Response) => {
    const p = roleSchema.safeParse(req.params.role?.toUpperCase());
    if (!p.success) return ok(res, { error: 'ROLE_INCONNU' }, 400);
    ok(res, { steps: stepsOf(p.data).map(s => ({ id: s.id, label: s.label, required: s.required, terminal: !!s.terminal })) });
  });

  /** INS-09 — disponibilité par (adresse, rôle). Réponse volontairement pauvre :
   *  on ne révèle jamais QUI possède une adresse (anti-énumération). */
  r.post('/email-available', async (req: Request, res: Response) => {
    const s = z.object({ email: z.string().email(), role: roleSchema });
    const p = s.safeParse(req.body);
    if (!p.success) return ok(res, { available: false }, 400);
    try { ok(res, await svc.checkEmailAvailability(p.data.email, p.data.role)) }
    catch (e) { fail(res, e) }
  });

  /** INS-13 — brouillon serveur. Jamais de mot de passe : stripSecrets s'en charge. */
  r.post('/draft', async (req: Request, res: Response) => {
    const s = z.object({
      id: z.string().optional(), role: roleSchema.nullable(),
      step: z.string(), data: z.unknown(), email: z.string().email().nullable().optional(),
    });
    const p = s.safeParse(req.body);
    if (!p.success) return ok(res, { error: 'PAYLOAD_INVALIDE' }, 400);
    try { ok(res, await svc.saveDraft(p.data as any)) } catch (e) { fail(res, e) }
  });

  r.get('/draft/:id', async (req: Request, res: Response) => {
    try {
      const d = await svc.resumeDraft(String(req.params.id));
      d ? ok(res, d) : ok(res, { error: 'INTROUVABLE' }, 404);
    } catch (e) { fail(res, e) }
  });

  /** Validation d'une étape sans rien écrire : le front s'en sert pour
   *  confirmer côté serveur ce que le schéma dit déjà côté client. */
  r.post('/validate', (req: Request, res: Response) => {
    const s = z.object({ role: roleSchema, payload: z.unknown() });
    const p = s.safeParse(req.body);
    if (!p.success) return ok(res, { error: 'PAYLOAD_INVALIDE' }, 400);
    const { issues } = svc.validateAll({ role: p.data.role, ...(p.data.payload as object) } as SubmitPayload);
    ok(res, { valid: issues.length === 0, issues });
  });

  /** Création du compte. NAV-07 : la session est ouverte dans la MÊME réponse.
   *  Aucune redirection vers un écran de connexion. */
  r.post('/submit', async (req: Request, res: Response) => {
    const s = z.object({
      role: roleSchema, account: z.unknown(),
      structure: z.unknown().optional(), logo: z.unknown().optional(),
      payout: z.unknown().optional(), product: z.unknown().optional(),
      draftId: z.string().nullable().optional(),
    });
    const p = s.safeParse(req.body);
    if (!p.success) return ok(res, { error: 'PAYLOAD_INVALIDE' }, 400);
    try {
      const out = await svc.submit(p.data as SubmitPayload);
      opts.setSessionCookie?.(res, out.session.token, out.session.expiresAt);
      ok(res, {
        accountId: out.accountId, companyId: out.companyId,
        emailVerificationSent: out.emailVerificationSent,
        // INS-09 — si l'e-mail n'est pas parti, le front affiche d'emblée le
        // bandeau de correction plutôt que de laisser l'utilisateur attendre.
        nextAction: out.emailVerificationSent ? 'ESPACE' : 'ESPACE_AVEC_BANDEAU_EMAIL',
      }, 201);
    } catch (e) { fail(res, e) }
  });

  /** INS-12 — dépôt de logo. Facultatif : aucune image de repli n'est produite. */
  r.post('/logo', async (req: Request, res: Response) => {
    const s = z.object({ filename: z.string().min(1), mime: z.string().min(1), base64: z.string().min(1) });
    const p = s.safeParse(req.body);
    if (!p.success) return ok(res, { error: 'PAYLOAD_INVALIDE' }, 400);
    try {
      const bytes = Uint8Array.from(Buffer.from(p.data.base64, 'base64'));
      ok(res, await opts.storage.put({ filename: p.data.filename, mime: p.data.mime, bytes }), 201);
    } catch (e) {
      ok(res, { error: 'UPLOAD_REFUSE', message: (e as Error).message }, 413);
    }
  });

  return r;
}
