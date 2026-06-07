// ═══════════════════════════════════════════════════════
//  MEEREO — Commission workflow (clé en main uniquement)
//
//  RÈGLE : la commission 5% ne s'applique QUE lorsque
//  le client a choisi l'option "clé en main" à l'onboarding.
//  MEEREO introduit les structures → 5% si concrétisé.
//  Le client ne paie JAMAIS MEEREO pour la mise en relation.
// ═══════════════════════════════════════════════════════

export const COMMISSION_RATE = 0.05 // 5%

// ── Statuts d'introduction (mise en relation) ──
export const INTRO_STATUS = {
  INTRODUCED:   'introduced',        // Structure présentée au client
  IN_EXCHANGE:  'in_exchange',        // Discussion active client ↔ structure
  RETAINED:     'retained',           // Client a retenu la structure
  DECLINED:     'declined',           // Client n'a pas retenu
  WITHDRAWN:    'withdrawn',          // Structure s'est retirée
}

// ── Statuts de commission ──
export const COMMISSION_STATUS = {
  POTENTIAL:    'potential',           // Introduction faite, pas encore concrétisée
  DUE:         'due',                 // Accord validé → commission exigible
  INVOICED:    'invoiced',            // Facture envoyée à la structure
  PAID:        'paid',                // Commission réglée
  OVERDUE:     'overdue',             // En retard de paiement
  WAIVED:      'waived',              // Commission annulée (geste commercial)
}

// ── Labels français ──
export const INTRO_LABELS = {
  [INTRO_STATUS.INTRODUCED]:  'Introduit',
  [INTRO_STATUS.IN_EXCHANGE]: 'En échange',
  [INTRO_STATUS.RETAINED]:    'Retenu',
  [INTRO_STATUS.DECLINED]:    'Non retenu',
  [INTRO_STATUS.WITHDRAWN]:   'Retiré',
}

export const COMMISSION_LABELS = {
  [COMMISSION_STATUS.POTENTIAL]: 'Potentielle',
  [COMMISSION_STATUS.DUE]:      'Due',
  [COMMISSION_STATUS.INVOICED]: 'Facturée',
  [COMMISSION_STATUS.PAID]:     'Réglée',
  [COMMISSION_STATUS.OVERDUE]:  'En retard',
  [COMMISSION_STATUS.WAIVED]:   'Annulée',
}

// ── Guard : vérifie si le projet est en mode clé en main ──
export function isCleEnMain(store) {
  const situation = store.onboardingData?.situation || ''
  return situation.includes('clé en main') || situation.includes('MEEREO')
}

// ── Calcul de la commission ──
export function calculateCommission(montantHT) {
  const base = typeof montantHT === 'string' ? parseInt(montantHT.replace(/\D/g, '')) || 0 : (montantHT || 0)
  return {
    base,
    rate: COMMISSION_RATE,
    amount: Math.round(base * COMMISSION_RATE),
  }
}

// ── Statuts qui déclenchent la commission (introduction → due) ──
export const COMMISSION_TRIGGERS = new Set([
  INTRO_STATUS.RETAINED,
])

// ── Résumé lisible pour affichage ──
export function formatCommission(amount) {
  if (!amount) return '—'
  return amount.toLocaleString('fr-FR') + ' FCFA'
}
