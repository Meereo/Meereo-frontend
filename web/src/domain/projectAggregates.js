// ═══════════════════════════════════════════════════════
//  MEEREO — Agrégats Projet
//  Calculs dérivés partagés entre cockpit et client
// ═══════════════════════════════════════════════════════

import { PROJECT_PHASES, PHASE_INDEX, normalizePhase } from './status'

/**
 * Calcule l'avancement d'un projet depuis ses étapes (done/total)
 * Source de vérité unique — utilisé côté pro ET client
 */
export const computeProgress = (etapes) => {
  if (!etapes || !etapes.length) return 0
  const done = etapes.filter(e => e.done).length
  return Math.round(done / etapes.length * 100)
}

/**
 * Avancement plancher basé sur la phase courante du projet (8 phases).
 * Chaque phase correspond à un seuil minimal d'avancement.
 */
const PHASE_PROGRESS = {
  ESQUISSE: 0,
  AVANT_PROJET: 12,
  PROJET_DETAILLE: 25,
  PLANS_EXECUTION: 35,
  CONSULTATION_ENTREPRISES: 45,
  ATTRIBUTION_MARCHES: 55,
  SUIVI_CHANTIER: 65,
  RECEPTION: 90,
  // Backward compat — old phase codes
  IDEE: 0, ETUDES: 0, CONCEPTION: 12, CONSULTATION: 45,
  TRAVAUX: 65, FINITIONS: 65, LIVRAISON: 90, EXPLOITATION: 100,
}

export const computePhaseProgress = (phase) => {
  const normalized = normalizePhase(phase || 'IDEE')
  return PHASE_PROGRESS[normalized] ?? 0
}

/**
 * Calcule l'avancement réel d'un projet en combinant toutes les sources :
 * 1. taskStates (tâches CHANTIER_PHASES cochées par le pro) — le plus précis
 * 2. marchés liés (avancement moyen des marchés actifs)
 * 3. étapes (phases done/total)
 * 4. avancement stocké en DB
 *
 * Les planchers de phase (phaseFloor) ne sont PLUS utilisés pour éviter
 * d'afficher 55 % dès l'attribution d'un marché alors qu'aucune tâche n'est faite.
 *
 * @param {object} project
 * @param {Array}  linkedMarkets — marchés liés au projet (optionnel)
 */
export const computeProjectAvancement = (project, linkedMarkets = []) => {
  if (!project) return 0
  const etapes = project.etapes || []
  const stored = project.avancement || 0
  const etapesProgress = computeProgress(etapes)

  // Source 1 — task states set by the pro (most accurate, directly from task completion)
  const taskStates = project.taskStates
  if (taskStates && typeof taskStates === 'object') {
    const keys = Object.keys(taskStates)
    if (keys.length > 0) {
      const done = keys.filter(k => taskStates[k] === 'done').length
      const fromTaskStates = Math.round(done / keys.length * 100)
      return Math.max(stored, etapesProgress, fromTaskStates)
    }
  }

  // Source 2 — average avancement of linked active markets
  const activeMarkets = (linkedMarkets || []).filter(
    m => m.projectId === project.id && m.statut !== 'cancelled'
  )
  if (activeMarkets.length > 0) {
    const avgMarket = Math.round(
      activeMarkets.reduce((s, m) => s + (m.avancement || 0), 0) / activeMarkets.length
    )
    return Math.max(stored, etapesProgress, avgMarket)
  }

  // Source 3 — étapes or stored avancement only (no phase inflation)
  return Math.max(stored, etapesProgress)
}

/**
 * Détermine la phase courante d'un projet depuis ses étapes
 */
export const getCurrentPhase = (etapes) => {
  if (!etapes || !etapes.length) return 'ESQ'
  const current = etapes.find(e => e.current)
  if (current) return current.label
  // Si aucune étape n'est marquée current, trouver la première non-done
  const firstPending = etapes.find(e => !e.done)
  if (firstPending) return firstPending.label
  // Tout est done
  return 'REC'
}

/**
 * Recalcule les étapes d'un projet à partir des tâches chantier
 * Mapping : phases chantier → étapes projet
 *
 * @param {Array} etapes - les étapes du projet (ESQ, APS, etc.)
 * @param {Array} chantierPhases - CHANTIER_PHASES
 * @param {Function} getTaskState - (taskId) => 'todo'|'active'|'done'
 * @returns {Object} { etapes, phase, avancement }
 */
export const syncEtapesFromChantier = (etapes, chantierPhases, getTaskState) => {
  if (!etapes || !chantierPhases || !getTaskState) return { etapes, phase: etapes?.[0]?.label, avancement: 0 }

  const phaseComplete = (phIdx) => {
    const ph = chantierPhases[phIdx]
    return ph ? ph.tasks.every(t => getTaskState(t.id) === 'done') : false
  }

  const concTasks = chantierPhases[0]?.tasks || []
  const esqTasks = concTasks.filter(t => t.title.includes('ESQ') || t.title.includes('Releve') || t.title.includes('Faisabilite'))
  const apsTasks = concTasks.filter(t => t.title.includes('APS'))
  const apdTasks = concTasks.filter(t => t.title.includes('APD') || t.title.includes('BET') || t.title.includes('Estimation') || t.title.includes('permis'))

  const esqDone = esqTasks.length > 0 ? esqTasks.every(t => getTaskState(t.id) === 'done') : phaseComplete(0)
  const apsDone = apsTasks.length > 0 ? apsTasks.every(t => getTaskState(t.id) === 'done') && esqDone : phaseComplete(0)
  const apdDone = apdTasks.length > 0 ? apdTasks.every(t => getTaskState(t.id) === 'done') && apsDone : phaseComplete(0)
  const proDone = phaseComplete(1) && apdDone
  const dceDone = proDone
  const exeDone = phaseComplete(2) && phaseComplete(3) && phaseComplete(4) && phaseComplete(5) && dceDone
  const recDone = phaseComplete(6) && exeDone

  const etapeMap = { ESQ: esqDone, APS: apsDone, APD: apdDone, PRO: proDone, DCE: dceDone, EXE: exeDone, REC: recDone }

  const newEtapes = etapes.map(e => ({ ...e }))
  let foundCurrent = false
  newEtapes.forEach(e => {
    e.done = etapeMap[e.label] || false
    if (!e.done && !foundCurrent) {
      e.current = true
      foundCurrent = true
    } else {
      e.current = false
    }
  })

  const phase = getCurrentPhase(newEtapes)
  const avancement = computeProgress(newEtapes)

  return { etapes: newEtapes, phase, avancement }
}

/**
 * Calcule le résumé budgétaire d'un projet
 * @param {Array} transactions - toutes les transactions
 * @param {string} projectId - ID du projet
 * @param {number} totalBudget - budget total du projet (numérique)
 * @returns {Object} { totalBudget, totalPaid, remaining, pctUsed }
 */
export const computeBudgetSummary = (transactions, projectId, totalBudget) => {
  const projTx = (transactions || []).filter(t => t.projet === projectId || t.projectId === projectId)
  const totalPaid = projTx.filter(t => t.type === 'credit' || t.type === 'payment').reduce((s, t) => s + (t.montant || t.amount || 0), 0)
  const remaining = Math.max(0, totalBudget - totalPaid)
  const pctUsed = totalBudget > 0 ? Math.round(totalPaid / totalBudget * 100) : 0
  return { totalBudget, totalPaid, remaining, pctUsed, transactions: projTx }
}

/**
 * Calcule les compteurs/badges pour un projet
 * @returns {Object} { pendingDecisions, unreadMessages, pendingPayments, newDocs, pendingOffers }
 */
export const computeProjectBadges = (projectId, { decisions, conversations, transactions, documents, offers }) => {
  const pendingDecisions = (decisions || []).filter(d =>
    d.projectId === projectId && (d.statut === 'pending' || !d.statut)
  ).length

  const unreadMessages = (conversations || []).reduce((s, c) => s + (c.unread || 0), 0)

  const pendingPayments = (transactions || []).filter(t =>
    (t.projet === projectId || t.projectId === projectId) && (t.statut === 'pending' || t.status === 'pending')
  ).length

  const newDocs = (documents || []).filter(d =>
    d.isNew && (d.projet === projectId || d.projectId === projectId)
  ).length

  const pendingOffers = (offers || []).filter(o =>
    (o.projectId === projectId || o.projet === projectId) &&
    (o.statut === 'en_attente' || o.statut === 'en attente' || o.statut === 'pending')
  ).length

  return { pendingDecisions, unreadMessages, pendingPayments, newDocs, pendingOffers }
}

/**
 * Mappe les phases chantier aux étapes projet pour la vue client
 * Retourne pour chaque phase chantier son statut dérivé des étapes
 */
// Mapping index CHANTIER_PHASES → phases principales projet
export const CHANTIER_TO_ETAPES_MAP = {
  0: ['ESQUISSE', 'AVANT_PROJET', 'PROJET_DETAILLE', 'PLANS_EXECUTION'],  // Conception & Études
  1: ['CONSULTATION_ENTREPRISES', 'ATTRIBUTION_MARCHES'],                  // Préparation & Lancement
  2: ['SUIVI_CHANTIER'],  // Gros Œuvre
  3: ['SUIVI_CHANTIER'],  // Second Œuvre
  4: ['SUIVI_CHANTIER'],  // Matériaux & Équipements
  5: ['SUIVI_CHANTIER'],  // Mobilier & Décoration
  6: ['RECEPTION'],       // Réception & Livraison
}

export const getChantierPhaseStatus = (phaseIndex, etapes) => {
  const mappedLabels = CHANTIER_TO_ETAPES_MAP[phaseIndex] || []
  const mappedEtapes = mappedLabels.map(label => (etapes || []).find(e => e.label === label)).filter(Boolean)
  if (mappedEtapes.length === 0) return { allDone: false, anyActive: false, pct: 0 }
  const allDone = mappedEtapes.every(e => e.done)
  const anyActive = mappedEtapes.some(e => e.current)
  return { allDone, anyActive, pct: allDone ? 100 : anyActive ? 50 : 0 }
}

/**
 * Trouve la photo d'un membre d'équipe en matchant par nom
 */
export const getMemberPhoto = (nom, intervenants) => {
  if (!nom || !intervenants) return null
  const lastName = nom.split(' ').filter(Boolean).pop()?.toLowerCase()
  if (!lastName) return null
  const match = intervenants.find(i => i.nom.toLowerCase().includes(lastName) && i.photo)
  return match?.photo || null
}
