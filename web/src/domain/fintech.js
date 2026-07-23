// ══════════════════════════════════════════════════════════════
//  MEEREO — Fintech Domain Logic
//  Statuts, rails, commissions, validations
// ══════════════════════════════════════════════════════════════

// ── Payment Statuses ──
export const PAY_STATUS = {
  INIT: 'PAY_INIT',
  PENDING: 'PAY_PENDING',
  CONFIRMED: 'FUNDS_CONFIRMED',
  HELD: 'HELD_FOR_MILESTONE',
  PAYOUT_REQ: 'PAYOUT_REQUESTED',
  PAYOUT_DONE: 'PAYOUT_DONE',
  DISPUTE: 'DISPUTE_OPEN',
  REVERSED: 'REVERSED',
}

export const PAY_STATUS_META = {
  [PAY_STATUS.INIT]:        { label: 'Paiement initié',       color: 'var(--t4)',  bg: 'var(--s2)',                icon: '○', micro: 'En attente de traitement' },
  [PAY_STATUS.PENDING]:     { label: 'Paiement en cours',     color: 'var(--wrn)', bg: 'rgba(245,158,11,.06)',     icon: '◐', micro: 'Confirmation attendue du partenaire' },
  [PAY_STATUS.CONFIRMED]:   { label: 'Fonds confirmés',       color: 'var(--ok)',  bg: 'rgba(52,199,89,.06)',      icon: '●', micro: 'Le marché peut démarrer' },
  [PAY_STATUS.HELD]:        { label: 'Fonds sécurisés',       color: 'var(--inf)', bg: 'rgba(0,122,255,.06)',      icon: '◉', micro: 'Cantonnés jusqu\'à validation de l\'étape' },
  [PAY_STATUS.PAYOUT_REQ]:  { label: 'Libération demandée',   color: 'var(--wrn)', bg: 'rgba(245,158,11,.06)',     icon: '⊕', micro: 'En attente d\'exécution par le partenaire' },
  [PAY_STATUS.PAYOUT_DONE]: { label: 'Versement effectué',    color: 'var(--ok)',  bg: 'rgba(52,199,89,.06)',      icon: '✓', micro: 'Fonds transférés au bénéficiaire' },
  [PAY_STATUS.DISPUTE]:     { label: 'Litige ouvert',         color: 'var(--err)', bg: 'rgba(220,38,38,.06)',      icon: '⚠', micro: 'Libérations suivantes gelées' },
  [PAY_STATUS.REVERSED]:    { label: 'Remboursé',             color: 'var(--t3)',  bg: 'var(--s2)',                icon: '↩', micro: 'Fonds retournés au payeur' },
}

// ── Valid transitions ──
export const PAY_TRANSITIONS = {
  [PAY_STATUS.INIT]:       [PAY_STATUS.PENDING],
  [PAY_STATUS.PENDING]:    [PAY_STATUS.CONFIRMED, PAY_STATUS.REVERSED],
  [PAY_STATUS.CONFIRMED]:  [PAY_STATUS.HELD],
  [PAY_STATUS.HELD]:       [PAY_STATUS.PAYOUT_REQ],
  [PAY_STATUS.PAYOUT_REQ]: [PAY_STATUS.PAYOUT_DONE, PAY_STATUS.DISPUTE],
  [PAY_STATUS.DISPUTE]:    [PAY_STATUS.REVERSED, PAY_STATUS.PAYOUT_DONE],
  [PAY_STATUS.PAYOUT_DONE]: [],
  [PAY_STATUS.REVERSED]:   [],
}

// ── Rail Recommendation Engine ──
export const RAILS = {
  VIREMENT: 'virement',
  CARTE: 'carte',
  MOBILE_MONEY: 'mobile_money',
}

export const RAIL_META = {
  [RAILS.VIREMENT]:     { label: 'Virement bancaire', icon: '🏦', desc: 'Recommandé pour les montants élevés' },
  [RAILS.CARTE]:        { label: 'Carte bancaire',    icon: '💳', desc: 'Idéal pour les acomptes et paiements à distance' },
  [RAILS.MOBILE_MONEY]: { label: 'Mobile Money',      icon: '📱', desc: 'Rapide pour les petits montants et opérations terrain' },
}

export function recommendRail(amount, type, context = {}) {
  // Seuils en FCFA
  if (amount >= 5000000) return { rail: RAILS.VIREMENT, reason: 'Montant élevé (> 5M FCFA) — virement recommandé pour sécurité maximale' }
  if (amount >= 500000) {
    if (type === 'marche' || type === 'milestone') return { rail: RAILS.VIREMENT, reason: 'Marché / milestone — virement recommandé' }
    return { rail: RAILS.CARTE, reason: 'Montant intermédiaire — carte recommandée' }
  }
  if (type === 'frais' || type === 'commande' || context.terrain) return { rail: RAILS.MOBILE_MONEY, reason: 'Petit montant / opération terrain — Mobile Money recommandé' }
  return { rail: RAILS.CARTE, reason: 'Paiement standard — carte recommandée' }
}

// ── Commission Calculation ──
export const COMMISSION_RATES = {
  marketplace:    { min: 0.05, max: 0.10, default: 0.08 },
  services:       { min: 0.03, max: 0.06, default: 0.05 },
  orchestration:  { min: 0.007, max: 0.012, default: 0.01 },
  visibility:     { type: 'fixed' },
  referral:       { min: 0.015, max: 0.04, default: 0.025 },
}

export function calculateCommission(type, amount) {
  const rate = COMMISSION_RATES[type]
  if (!rate || rate.type === 'fixed') return 0
  return Math.round(amount * rate.default)
}

// ── Payout Validation ──
export function canRequestPayout(paymentOrder, proofs, validations) {
  if (!paymentOrder) return { allowed: false, reason: 'Aucun ordre de paiement' }
  if (paymentOrder.status === PAY_STATUS.DISPUTE) return { allowed: false, reason: 'Litige en cours — libérations gelées' }
  if (paymentOrder.status !== PAY_STATUS.HELD) return { allowed: false, reason: 'Les fonds ne sont pas encore sécurisés' }
  if (!proofs || proofs.length === 0) return { allowed: false, reason: 'Preuve manquante (PV, photo ou bon de livraison requis)' }
  if (!validations || !validations.some(v => v.validated)) return { allowed: false, reason: 'Validation client manquante' }
  return { allowed: true, reason: null }
}

// ── MKT-02: seuil global de paiement Marketplace ──
// En dessous : paiement Mobile Money intégré (FIN-02)
// Au-dessus : devis + paiement hors plateforme
// Configurable côté back-office (ne pas coder en dur dans la logique métier)
export const MARKETPLACE_PAYMENT_THRESHOLD = 500000 // FCFA — à rendre configurable via API admin

export function getPaymentMode(totalFCFA) {
  if (totalFCFA <= MARKETPLACE_PAYMENT_THRESHOLD) return { mode: 'mobile_money', label: 'Paiement Mobile Money' }
  return { mode: 'devis', label: 'Sur devis — paiement hors plateforme' }
}

// ── KAi Quota ──
export const KAI_QUOTA = {
  standard: 25,
  gold: Infinity,
}

export function getKaiQuotaStatus(entitlement, role = 'pro') {
  if (!entitlement) return { tier: 'standard', used: 0, limit: 25, remaining: 25, pct: 0, isGold: false }
  // Support per-role entitlement (new format) or flat entitlement (legacy)
  const ent = entitlement[role] || (entitlement.tier ? entitlement : { tier: 'standard', quotaLimit: 25, quotaUsed: 0 })
  const isGold = ent.tier === 'gold' && ent.goldEndDate && new Date(ent.goldEndDate) > new Date()
  const limit = isGold ? Infinity : (ent.quotaLimit || 25)
  const used = ent.quotaUsed || 0
  const remaining = isGold ? Infinity : Math.max(0, limit - used)
  const pct = isGold ? 0 : Math.round((used / limit) * 100)
  const isExhausted = !isGold && used >= limit
  return { tier: isGold ? 'gold' : 'standard', used, limit, remaining, pct, isGold, isExhausted }
}

export function shouldSuggestGold(quotaStatus, context = {}) {
  if (quotaStatus.isGold) return false
  if (quotaStatus.pct >= 80) return true
  if (context.intervenants > 3) return true
  if (context.milestones > 5) return true
  if (context.pendingValidations > 3) return true
  if (context.activeOrders > 10) return true
  return false
}
