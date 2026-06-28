/**
 * projectsRepository.js — Source de vérité unique pour les projets MEEREO
 *
 * Règle fondamentale :
 *   store.projects EST la seule source de vérité.
 *   Les projets sont créés dynamiquement par les utilisateurs.
 *   Aucune donnée démo n'est injectée automatiquement.
 *
 * Cycle de vie :
 *   - Un projet est créé via createProject() dans le store
 *   - store.projects est la seule source lue par les vues
 *   - Suppression = retrait réel du tableau store.projects
 *   - Archivage = status: 'archived' dans store.projects
 *   - Édition = mise à jour in-place dans store.projects
 *
 * Visibilité :
 *   - Un utilisateur ne voit que SES projets (owner, client, ou membre)
 */

// ── Selectors ─────────────────────────────────────────────────────────

/** Tous les projets non supprimés (actifs + archivés) */
export function getAllProjects(store) {
  return (store.projects || []).filter(p => p.status !== 'deleted')
}

/** Projets actifs uniquement (ni archivés, ni supprimés) */
export function getActiveProjects(store) {
  return (store.projects || []).filter(p => p.status !== 'archived' && p.status !== 'deleted')
}

/** Projets archivés */
export function getArchivedProjects(store) {
  return (store.projects || []).filter(p => p.status === 'archived')
}

/** Lookup par ID (inclut archivés, exclut supprimés) */
export function getProjectById(store, id) {
  return (store.projects || []).find(p => p.id === id && p.status !== 'deleted')
}

/** Lookup par ID sans filtre (pour opérations internes) */
export function getProjectByIdRaw(store, id) {
  return (store.projects || []).find(p => p.id === id)
}

/**
 * Projets accessibles par un utilisateur donné
 * Un utilisateur voit un projet s'il est :
 *   - owner (ownerId)
 *   - client (clientId)
 *   - membre formel (projectMembers)
 */
export function getUserProjects(store, userId) {
  if (!userId) return []
  const memberProjectIds = new Set(
    (store.projectMembers || []).filter(m => m.userId === userId).map(m => m.projectId)
  )
  return (store.projects || []).filter(p =>
    p.status !== 'deleted' &&
    (p.ownerId === userId || p.clientId === userId || memberProjectIds.has(p.id))
  )
}

/** Projets actifs uniquement (ni archivés, ni arrêtés, ni supprimés) */
export function getUserActiveProjects(store, userId) {
  return getUserProjects(store, userId).filter(p => p.status !== 'archived' && p.status !== 'stopped')
}
