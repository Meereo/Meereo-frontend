// ═══════════════════════════════════════════════════════
//  MEEREO — useProjectSync
//  Hook partagé entre cockpit et client
//  Fournit une vue unifiée d'un projet avec toutes ses
//  données dérivées et synchronisées
// ═══════════════════════════════════════════════════════

import { useMemo } from 'react'
import { useMeereo } from './useMeereoStore'
import { CHANTIER_PHASES } from '../data/chantier'
import {
  computeProgress,
  computeProjectAvancement,
  getCurrentPhase,
  computeBudgetSummary,
  computeProjectBadges,
  getChantierPhaseStatus,
} from '../domain/projectAggregates'
import { filterDocumentsForClient } from '../domain/permissions'
import { useDevise } from './useDevise'

/**
 * Vue unifiée d'un projet — utilisable côté pro ET client
 *
 * @param {string} projectId - ID du projet (ou null pour le premier en cours)
 * @param {object} options - { role: 'pro'|'client' }
 * @returns {object} Toutes les données dérivées du projet
 */
export function useProjectSync(projectId, options = {}) {
  const { store } = useMeereo()
  const { formatShort, parseBudget } = useDevise()
  const role = options.role || 'pro'

  // Source de vérité : store.projects
  const project = useMemo(() => {
    const allProjects = (store.projects || [])
    let proj = projectId
      ? allProjects.find(p => p.id === projectId)
      : allProjects.find(p => computeProgress(p.etapes) < 100) || allProjects[0]

    if (!proj) return null

    // Enrichir avec les données du store si elles existent
    const storeProj = (store.projects || []).find(p => p.id === proj.id)
    if (storeProj) {
      proj = { ...proj, ...storeProj }
    }

    return proj
  }, [projectId, store.projects, store.lastProjectUpdate])

  // Avancement calculé : MAX(étapes, phase-plancher, stored)
  const progress = useMemo(() => computeProjectAvancement(project), [project?.etapes, project?.phase, project?.avancement])

  // Phase courante
  const phase = useMemo(() => getCurrentPhase(project?.etapes), [project?.etapes])

  // Budget
  const budget = useMemo(() => {
    if (!project) return { totalBudget: 0, totalPaid: 0, remaining: 0, pctUsed: 0, transactions: [] }
    const totalBudget = parseBudget(project.budget || '0')
    return computeBudgetSummary(store.transactions, project.id, totalBudget)
  }, [project, parseBudget, store.transactions])

  // Équipe avec photos
  const team = useMemo(() => {
    if (!project?.equipe) return []
    return project.equipe.map(m => ({
      ...m,
      photo: null,
      initials: (m.nom || "").split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase(),
    }))
  }, [project?.equipe])

  // Documents (filtrés pour le client)
  const documents = useMemo(() => {
    const storeDocs = (store.documents || []).filter(d => d.projectId === project?.id && !d._deleted)
    return role === 'client' ? filterDocumentsForClient(storeDocs, project?.id) : storeDocs
  }, [project, store.documents, role])

  // Offres
  const offers = useMemo(() => {
    return (store.offers || []).filter(o => o.projectId === project?.id)
  }, [store.offers, project])

  // Marchés
  const markets = useMemo(() => {
    return (store.markets || []).filter(m => m.projectId === project?.id)
  }, [store.markets, project])

  // Décisions
  const decisions = useMemo(() => {
    const storeDecisions = (store.decisions || [])
    // Pour le client: montrer les décisions client_visible et celles par défaut
    if (role === 'client') {
      return storeDecisions.filter(d =>
        (d.projectId === project?.id || !d.projectId) &&
        (d.visibility !== 'internal')
      )
    }
    return storeDecisions.filter(d => d.projectId === project?.id || !d.projectId)
  }, [store.decisions, project, role])

  const pendingDecisions = useMemo(() =>
    decisions.filter(d => d.statut === 'en_attente'),
  [decisions])

  const resolvedDecisions = useMemo(() =>
    decisions.filter(d => d.statut !== 'en_attente'),
  [decisions])

  // Demandes de paiement
  const paymentRequests = useMemo(() => {
    return (store.paymentRequests || []).filter(r =>
      r.projectId === project?.id
    )
  }, [store.paymentRequests, project])

  const pendingPayments = useMemo(() =>
    paymentRequests.filter(r => r.statut === 'pending'),
  [paymentRequests])

  // Photos
  const photos = useMemo(() => {
    const storePhotos = (store.photos || []).filter(p => p.projectId === project?.id)
    if (role === 'client') return storePhotos.filter(p => p.visibility !== 'internal')
    return storePhotos
  }, [store.photos, project, role])

  // Badges / compteurs
  const badges = useMemo(() => {
    return computeProjectBadges(project?.id, {
      decisions:     store.decisions,
      conversations: store.conversations,
      transactions:  store.transactions,
      documents:     store.documents,
      offers:        store.offers,
    })
  }, [project, store.decisions, store.conversations, store.transactions, store.documents, store.offers])

  // Phases chantier avec statut dérivé
  const chantierStatus = useMemo(() => {
    return CHANTIER_PHASES.map((ph, idx) => ({
      ...ph,
      ...getChantierPhaseStatus(idx, project?.etapes),
    }))
  }, [project?.etapes])

  // Notifications filtrées
  const notifications = useMemo(() => {
    const all = store.notifications || []
    if (role === 'client') {
      const internalTypes = ['team_update', 'internal_note', 'report_draft']
      return all.filter(n => !internalTypes.includes(n.type))
    }
    return all
  }, [store.notifications, role])

  return {
    project,
    progress,
    phase,
    budget,
    team,
    documents,
    offers,
    markets,
    decisions,
    pendingDecisions,
    resolvedDecisions,
    paymentRequests,
    pendingPayments,
    photos,
    badges,
    chantierStatus,
    notifications,
    // Helpers
    formatShort,
    parseBudget,
  }
}

/**
 * Liste de tous les projets d'un client
 */
export function useClientProjects() {
  const { store } = useMeereo()

  return useMemo(() => {
    // En démo, tous les projets sont accessibles au client
    // En production: filter par store.user?.id === proj.clientId
    return (store.projects || []).map(p => ({
      ...p,
      progress: computeProjectAvancement(p),
      phase: p.phase || getCurrentPhase(p.etapes),
    }))
  }, [store.lastProjectUpdate])
}
