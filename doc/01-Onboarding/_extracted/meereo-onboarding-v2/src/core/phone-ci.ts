/**
 * TÉLÉPHONE CÔTE D'IVOIRE — normalisation E.164. Réf. INS-08.
 *
 * Décision du 27/07/2026 : PAS de vérification par SMS. Le numéro est validé
 * dans sa FORME et enregistré, sans code à usage unique.
 *
 * ⚠️ Les préfixes ci-dessous n'ont pas pu être confirmés sur une source
 * officielle ARTCI. Ils sont donc volontairement PERMISSIFS : on vérifie la
 * longueur et le format, pas l'appartenance à un opérateur. Un préfixe manquant
 * bloquerait des inscriptions légitimes — c'est le risque le plus coûteux ici.
 */
export const CI_DIAL_CODE = '+225';
const DIGITS_AFTER_CODE = 10;

export function normalizeCiPhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s.\-()]/g, '');
  let digits: string;
  if (cleaned.startsWith('+225')) digits = cleaned.slice(4);
  else if (cleaned.startsWith('00225')) digits = cleaned.slice(5);
  else if (cleaned.startsWith('225') && cleaned.length === 3 + DIGITS_AFTER_CODE) digits = cleaned.slice(3);
  else if (cleaned.startsWith('+')) return /^\+\d{8,15}$/.test(cleaned) ? cleaned : null; // étranger
  else digits = cleaned;
  if (!/^\d+$/.test(digits) || digits.length !== DIGITS_AFTER_CODE) return null;
  return `${CI_DIAL_CODE}${digits}`;
}

export const isMobileCi = (e164: string) => /^\+225(0[157])/.test(e164);
