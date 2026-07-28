/**
 * POLITIQUE DE MOT DE PASSE — décision arrêtée (Annexe 1, point 2, 27/07/2026).
 *
 * 10 caractères minimum, au moins une lettre et un chiffre.
 * NI majuscule NI caractère spécial imposés : les règles de composition complexes
 * sont déconseillées par le NIST (SP 800-63B). Elles produisent des contournements
 * prévisibles (« Motdepasse1! ») sans gain réel.
 *
 * Cette politique est la SEULE source. L'écran d'inscription et l'écran de
 * réinitialisation la lisent tous les deux — c'est ce qui corrige l'incohérence
 * relevée par INS-07 (« 8 caractères » affiché à un endroit, rien à l'autre).
 */
export const PASSWORD_POLICY = {
  minLength: 10,
  requireLetter: true,
  requireDigit: true,
  requireUppercase: false,
  requireSpecial: false,
} as const;

export const PASSWORD_HINT =
  `${PASSWORD_POLICY.minLength} caractères minimum, dont au moins une lettre et un chiffre.`;

export type PasswordProblem = 'too-short' | 'no-letter' | 'no-digit';

export function checkPassword(v: string): PasswordProblem[] {
  const out: PasswordProblem[] = [];
  if (v.length < PASSWORD_POLICY.minLength) out.push('too-short');
  if (PASSWORD_POLICY.requireLetter && !/\p{L}/u.test(v)) out.push('no-letter');
  if (PASSWORD_POLICY.requireDigit && !/\d/.test(v)) out.push('no-digit');
  return out;
}

export const PASSWORD_MESSAGES: Record<PasswordProblem, string> = {
  'too-short': `Au moins ${PASSWORD_POLICY.minLength} caractères.`,
  'no-letter': 'Au moins une lettre.',
  'no-digit': 'Au moins un chiffre.',
};
