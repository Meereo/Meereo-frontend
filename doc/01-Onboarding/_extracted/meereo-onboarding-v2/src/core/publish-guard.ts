/**
 * RÈGLES DE GARDE À LA SORTIE DU PARCOURS.
 *
 * MKT-06 : un fournisseur doit être OPÉRATIONNEL en sortant. Décision du
 * 27/07/2026 : le premier produit est FACULTATIF et SANS CONTRAINTE — mais un
 * fournisseur sans produit ne peut rien montrer, or MKT-07 réduit sa page
 * publique à « Voir le catalogue ». On ne bloque pas ; on le signale.
 *
 * INS-03 + décision du 27/07 : la page publique est CRÉÉE à l'inscription mais
 * reste en BROUILLON. Elle n'est ni visible ni indexée tant qu'elle n'est pas
 * publiée — c'est la réponse directe à INS-17 (page de démonstration servie en
 * production).
 */
export type Readiness = { canSell: boolean; canPublishPage: boolean; missing: string[]; warnings: string[] };

export interface SupplierSnapshot { hasPayoutMethod: boolean; productCount: number; hasLogo: boolean; hasDeliveryZones: boolean }
export interface ProSnapshot { sectorCount: number; hasLogo: boolean; hasPresentation: boolean }

export function assessSupplier(s: SupplierSnapshot): Readiness {
  const missing: string[] = []; const warnings: string[] = [];
  if (!s.hasPayoutMethod) missing.push('un moyen d’encaissement');      // MKT-06 §4 — bloquant
  if (!s.hasDeliveryZones) missing.push('au moins une zone de livraison');
  if (s.productCount === 0) warnings.push('Votre catalogue est vide : votre page publique n’a rien à montrer.');
  if (!s.hasLogo) warnings.push('Sans logo, un monogramme vous représente.');
  return { canSell: missing.length === 0 && s.productCount > 0, canPublishPage: missing.length === 0, missing, warnings };
}

export function assessPro(s: ProSnapshot): Readiness {
  const missing: string[] = []; const warnings: string[] = [];
  if (s.sectorCount === 0) missing.push('au moins un secteur d’activité');
  if (!s.hasPresentation) warnings.push('Ajoutez une présentation : c’est le premier bloc que lisent vos visiteurs.');
  if (!s.hasLogo) warnings.push('Sans logo, un monogramme vous représente.');
  return { canSell: false, canPublishPage: missing.length === 0, missing, warnings };
}

export function completionMessage(r: Readiness): string {
  if (r.missing.length === 0) return 'Votre espace est prêt.';
  return `Il vous manque ${r.missing.join(', ')} pour être pleinement opérationnel.`;
}
