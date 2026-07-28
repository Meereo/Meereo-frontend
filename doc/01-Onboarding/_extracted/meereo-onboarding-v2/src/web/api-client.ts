/** Client HTTP de l'onboarding. Un seul endroit connaît les URL. */
import type { Role, FieldErrors } from '../core/schemas.ts';
import type { OnboardingIssue } from '../core/errors.ts';
import type { StepId } from '../core/steps.ts';

export interface SubmitResult { accountId: string; companyId: string | null; emailVerificationSent: boolean; nextAction: 'ESPACE' | 'ESPACE_AVEC_BANDEAU_EMAIL' }

const BASE = '/api/onboarding';

async function post<T>(path: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; status: number; issues: OnboardingIssue[] }> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    credentials: 'include', body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok) return { ok: true, data: data as T };
  return { ok: false, status: res.status, issues: (data as { issues?: OnboardingIssue[] }).issues ?? [] };
}

export const api = {
  emailAvailable: (email: string, role: Role) =>
    post<{ available: boolean; usedByOtherRoles: Role[] }>('/email-available', { email, role }),
  saveDraft: (d: { id?: string; role: Role | null; step: StepId; data: unknown; email?: string | null }) =>
    post<{ id: string }>('/draft', d),
  submit: (payload: unknown) => post<SubmitResult>('/submit', payload),
  uploadLogo: (filename: string, mime: string, base64: string) =>
    post<{ assetId: string; url: string }>('/logo', { filename, mime, base64 }),
};

/** Les erreurs serveur reviennent par (étape, champ) : on les repose au bon endroit. */
export function issuesToFieldErrors(issues: OnboardingIssue[], step: StepId): FieldErrors {
  const out: FieldErrors = {};
  for (const i of issues) if (i.step === step && i.field) out[i.field] ??= i.message;
  return out;
}
export const firstStepWithIssue = (issues: OnboardingIssue[]): StepId | null =>
  issues.find(i => i.step)?.step ?? null;
