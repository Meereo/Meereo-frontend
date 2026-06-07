// ═══════════════════════════════════════════════════════
//  MEEREO — Workflow Remplacement Prestataire
//  Règles métier pour le changement de prestataire
//  en cours de chantier
// ═══════════════════════════════════════════════════════

import { MARKET_ALLOWS_REPLACEMENT, MARKET_BLOCKS_REPLACEMENT, normalizeMarketStatus } from './status'

/**
 * Types de besoin AO
 */
export const AO_NEED_TYPE = {
  NEW: 'new',                       // Nouveau besoin (pas de lot existant)
  COMPLEMENTARY: 'complementary',   // Besoin complémentaire (lot terminé, nouveau lot)
  REPLACEMENT: 'replacement',       // Remplacement prestataire (lot actif → résiliation + nouveau)
}

/**
 * Vérifie si un nouveau flux AO peut être ouvert pour un métier donné sur un projet
 *
 * @param {string} metier - Le métier demandé (ex: 'Gros-oeuvre', 'CVC')
 * @param {string} projectId - ID du projet
 * @param {Array} marches - Tous les marchés (MARCHES_DATA + store.markets)
 * @returns {Object} { allowed, needType, blockingMarkets, message }
 */
export function checkReplacementPreconditions(metier, projectId, marches) {
  if (!metier || !projectId) {
    return { allowed: true, needType: AO_NEED_TYPE.NEW, blockingMarkets: [], message: null }
  }

  // Trouver les marchés existants sur ce lot/métier/projet
  const relatedMarkets = (marches || []).filter(m =>
    (m.projectId === projectId || m.projet === projectId) &&
    (m.lot?.toLowerCase() === metier.toLowerCase() || m.metier?.toLowerCase() === metier.toLowerCase())
  )

  if (relatedMarkets.length === 0) {
    // Aucun marché existant → nouveau besoin, toujours autorisé
    return { allowed: true, needType: AO_NEED_TYPE.NEW, blockingMarkets: [], message: null }
  }

  // Vérifier l'état de chaque marché lié
  const blocking = relatedMarkets.filter(m => {
    const status = normalizeMarketStatus(m.statut || m.status)
    return MARKET_BLOCKS_REPLACEMENT.has(status)
  })

  const completed = relatedMarkets.filter(m => {
    const status = normalizeMarketStatus(m.statut || m.status)
    return MARKET_ALLOWS_REPLACEMENT.has(status)
  })

  if (blocking.length > 0) {
    // Un ou plusieurs marchés actifs bloquent le nouveau flux
    const names = blocking.map(m => m.entreprise || m.titre).join(', ')
    return {
      allowed: false,
      needType: AO_NEED_TYPE.REPLACEMENT,
      blockingMarkets: blocking,
      message: `Un marché est encore actif pour ce lot (${names}). Le professionnel doit d'abord mettre à jour le suivi chantier : clôturer, suspendre ou résilier le marché en cours avant de lancer un nouveau flux.`
    }
  }

  if (completed.length > 0) {
    // Tous les marchés sont terminés/clôturés → besoin complémentaire autorisé
    return {
      allowed: true,
      needType: AO_NEED_TYPE.COMPLEMENTARY,
      blockingMarkets: [],
      message: null
    }
  }

  return { allowed: true, needType: AO_NEED_TYPE.NEW, blockingMarkets: [], message: null }
}

/**
 * Labels en français pour les types de besoin
 */
export const NEED_TYPE_LABELS = {
  [AO_NEED_TYPE.NEW]: 'Nouveau besoin',
  [AO_NEED_TYPE.COMPLEMENTARY]: 'Besoin complémentaire',
  [AO_NEED_TYPE.REPLACEMENT]: 'Remplacement prestataire',
}

/**
 * Labels en français pour les statuts marché (remplacement)
 */
export const MARKET_ACTION_LABELS = {
  terminate: 'Résilier le marché',
  suspend: 'Suspendre le marché',
  replace: 'Déclarer le prestataire remplacé',
  close: 'Clôturer le lot',
}

/**
 * Filtre les AO visibles pour un client
 * Le client ne voit que ses propres AO et ceux liés à ses projets
 */
export function filterAOsForClient(aos, clientProjectIds) {
  const projectSet = new Set(clientProjectIds || [])
  return (aos || []).filter(ao =>
    ao.createdByClient || projectSet.has(ao.projectId) || ao.scope === 'client'
  )
}

/**
 * Filtre les offres visibles pour un client
 * Le client ne voit que les offres liées à ses AO
 */
export function filterOffersForClient(offers, clientAOIds) {
  const aoSet = new Set(clientAOIds || [])
  return (offers || []).filter(o => aoSet.has(o.aoId))
}

/**
 * Filtre les marchés visibles pour un client
 * Le client ne voit que les marchés liés à ses projets
 */
export function filterMarchesForClient(marches, clientProjectIds) {
  const projectSet = new Set(clientProjectIds || [])
  return (marches || []).filter(m =>
    projectSet.has(m.projectId) || m.visibility === 'client_visible'
  )
}
