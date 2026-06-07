// ═══════════════════════════════════════════════════════
//  MEEREO — Labels & couleurs des rôles multi-acteurs
//  Utilisé par l'UI pour afficher QUI fait QUOI
// ═══════════════════════════════════════════════════════

import { ROLES } from './permissions'

/** Labels lisibles pour chaque rôle */
export const ROLE_LABELS = {
  [ROLES.PRO_ADMIN]: 'Chef de projet',
  [ROLES.PRO_MEMBER]: 'Équipe projet',
  [ROLES.CLIENT]: 'Maître d\u2019ouvrage',
  [ROLES.ARCHITECTE]: 'Architecte',
  [ROLES.BET]: 'Bureau d\u2019études',
  [ROLES.ENTREPRISE]: 'Entreprise',
  [ROLES.SUPPLIER]: 'Fournisseur',
  [ROLES.ADMIN]: 'Administrateur',
}

/** Couleurs pour les badges rôle (fond léger + texte) */
export const ROLE_COLORS = {
  [ROLES.PRO_ADMIN]: { bg: 'rgba(0,122,255,.08)', color: '#007AFF' },
  [ROLES.PRO_MEMBER]: { bg: 'rgba(0,122,255,.05)', color: '#5AC8FA' },
  [ROLES.CLIENT]: { bg: 'rgba(52,199,89,.08)', color: '#34C759' },
  [ROLES.ARCHITECTE]: { bg: 'rgba(124,58,237,.08)', color: '#7C3AED' },
  [ROLES.BET]: { bg: 'rgba(255,149,0,.08)', color: '#FF9500' },
  [ROLES.ENTREPRISE]: { bg: 'rgba(255,59,48,.06)', color: '#FF3B30' },
  [ROLES.SUPPLIER]: { bg: 'rgba(88,86,214,.08)', color: '#5856D6' },
  [ROLES.ADMIN]: { bg: 'rgba(0,0,0,.06)', color: '#333' },
}

/** Icônes emoji pour chaque rôle */
export const ROLE_ICONS = {
  [ROLES.PRO_ADMIN]: '\uD83D\uDCBC',   // 💼
  [ROLES.PRO_MEMBER]: '\uD83D\uDC64',   // 👤
  [ROLES.CLIENT]: '\uD83C\uDFE0',       // 🏠
  [ROLES.ARCHITECTE]: '\uD83D\uDCD0',   // 📐
  [ROLES.BET]: '\u2699\uFE0F',          // ⚙️
  [ROLES.ENTREPRISE]: '\uD83D\uDEA7',   // 🚧
  [ROLES.SUPPLIER]: '\uD83D\uDCE6',     // 📦
  [ROLES.ADMIN]: '\uD83D\uDD12',        // 🔒
}

/**
 * Retourne le label lisible d'un rôle
 * @param {string} role
 * @returns {string}
 */
export function getRoleLabel(role) {
  return ROLE_LABELS[role] || role || 'Inconnu'
}

/**
 * Retourne le style CSS pour un badge rôle
 * @param {string} role
 * @returns {{ background: string, color: string, fontSize: number, fontWeight: number, padding: string, borderRadius: number }}
 */
export function getRoleBadgeStyle(role) {
  const colors = ROLE_COLORS[role] || { bg: 'rgba(0,0,0,.04)', color: '#666' }
  return {
    background: colors.bg,
    color: colors.color,
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 100,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
  }
}

/**
 * Messages d'états vides contextuels par rôle
 */
export const EMPTY_STATES = {
  ao_no_responses: {
    [ROLES.CLIENT]: 'Aucune offre reçue — invitez des entreprises via la bourse des AO.',
    [ROLES.ARCHITECTE]: 'Aucune offre reçue — invitez des entreprises ou élargissez la visibilité.',
    default: 'Aucune offre reçue pour le moment.',
  },
  market_empty: {
    [ROLES.CLIENT]: 'Aucun marché en cours. Publiez un AO pour recevoir des offres.',
    [ROLES.ENTREPRISE]: 'Aucun marché en cours. Répondez à des appels d\u2019offres pour décrocher des marchés.',
    default: 'Aucun marché en cours.',
  },
  tasks_empty: {
    [ROLES.ENTREPRISE]: 'Aucune tâche assignée. Les tâches apparaîtront quand un marché sera attribué.',
    [ROLES.CLIENT]: 'Le suivi de chantier apparaîtra ici une fois les travaux démarrés.',
    default: 'Aucune tâche pour le moment.',
  },
  payment_empty: {
    [ROLES.CLIENT]: 'Aucune demande de paiement en attente.',
    [ROLES.ENTREPRISE]: 'Aucun paiement reçu. Les paiements apparaîtront après validation des marchés.',
    default: 'Aucun paiement.',
  },
}

/**
 * Retourne le message d'état vide adapté au rôle
 * @param {string} context - Clé du contexte (ex: 'ao_no_responses')
 * @param {string} role - Rôle de l'utilisateur
 * @returns {string}
 */
export function getEmptyStateMessage(context, role) {
  const messages = EMPTY_STATES[context]
  if (!messages) return ''
  return messages[role] || messages.default || ''
}
