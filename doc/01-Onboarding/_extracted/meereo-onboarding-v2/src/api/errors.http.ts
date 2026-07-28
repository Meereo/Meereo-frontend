/** Traduction des erreurs métier en réponses HTTP. Un seul endroit. */
import { OnboardingError } from '../core/errors.ts';

const STATUS: Record<string, number> = {
  VALIDATION: 422, EMAIL_TAKEN: 409, RCCM_TAKEN: 409, TAX_TAKEN: 409,
  ROLE_ALREADY_ON_COMPANY: 409, DRAFT_EXPIRED: 410, RATE_LIMITED: 429, STEP_LOCKED: 409,
};

export function toHttp(err: unknown): { status: number; body: unknown } {
  if (err instanceof OnboardingError)
    return { status: STATUS[err.code] ?? 422, body: { error: err.code, issues: err.issues } };
  return { status: 500, body: { error: 'INTERNAL', issues: [] } };
}
