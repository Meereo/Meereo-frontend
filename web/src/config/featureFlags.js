/**
 * MEEREO Feature Flags
 * Source de vérité pour les fonctionnalités conditionnelles.
 *
 * Convention : FLAG_* pour les flags, HAS_* pour les partenaires/intégrations
 *
 * false = fonctionnalité cachée (pas grisée)
 * true  = fonctionnalité active et visible
 */

// ── Logistique ──
// false → retrait uniquement, pas de livraison affichée
// true  → livraison + tarifs + délais affichés
export const HAS_LOGISTICS_PARTNER = false

// ── Modules cockpit (progressive disclosure) ──
export const FLAG_SHOW_FINANCE = true
export const FLAG_SHOW_AO = true
export const FLAG_SHOW_MARKETPLACE = true
export const FLAG_SHOW_MESSAGES = true
export const FLAG_SHOW_AGENDA = true
export const FLAG_SHOW_INTEGRATIONS = false
