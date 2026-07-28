/** Erreurs structurées : chaque erreur sait à quelle ÉTAPE et à quel CHAMP
 *  elle appartient. Sans cela, l'interface ne peut pas ramener l'utilisateur
 *  au bon endroit — c'est l'impasse que INS-06 demande de supprimer. */
import type { StepId } from './steps.ts';

export type OnboardingErrorCode =
  | 'VALIDATION' | 'EMAIL_TAKEN' | 'RCCM_TAKEN' | 'TAX_TAKEN'
  | 'ROLE_ALREADY_ON_COMPANY' | 'DRAFT_EXPIRED' | 'RATE_LIMITED' | 'STEP_LOCKED';

export interface OnboardingIssue { step: StepId | null; field: string | null; code: OnboardingErrorCode; message: string }

export class OnboardingError extends Error {
  issues: OnboardingIssue[];
  constructor(issues: OnboardingIssue[]) {
    super(issues[0]?.message ?? 'Erreur d’inscription');
    this.name = 'OnboardingError';
    this.issues = issues;
  }
  get code(): OnboardingErrorCode { return this.issues[0]?.code ?? 'VALIDATION' }
}

export const issue = (step: StepId | null, field: string | null, code: OnboardingErrorCode, message: string): OnboardingIssue =>
  ({ step, field, code, message });
