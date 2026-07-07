import { useState, useEffect, useMemo, useCallback } from 'react'
import Modal from '../../components/shared/Modal'
import { HardHat, Ruler, ClipboardList, Wrench, Package, Sofa, CheckCircle2, Check, Play, Circle, Star } from 'lucide-react'
import { CHANTIER_PHASES, ANNUAIRE_PLATEFORME } from '../../data/chantier'
import { getUserProjects } from '../../domain/projectsRepository'
import { INTERVENANTS_DATA } from '../../data/intervenants'
import { useMeereo } from '../../hooks/useMeereoStore'
import { api } from '../../services/api/client'
import { syncEtapesFromChantier } from '../../domain/projectAggregates'
import { useDevise } from '../../hooks/useDevise'
import { DSPageHeader } from '../../design/components'
import { PHASE_LABELS, normalizePhase } from '../../domain/status'
import AoGear from '../../components/shared/AoGear'

const PHASE_ICON_MAP = {
  '“é': <Ruler size={14}/>,
  '“‹': <ClipboardList size={14}/>,
  'é—️': <HardHat size={14}/>,
  '”é': <Wrench size={14}/>,
  '“é': <Package size={14}/>,
  '›‹️': <Sofa size={14}/>,
  'éœ…': <CheckCircle2 size={14}/>,
}


const ErrMsg = ({ show }) => show
  ? <p style={{ color: 'var(--err)', fontSize: 11, marginTop: 4, fontWeight: 500 }}>Champ obligatoire</p>
  : null

function ReportModal({ isOpen, onClose, showToast }) {
  const { store, updateStore, emitEvent } = useMeereo()
  const [f, setF] = useState({ type: 'Rapport hebdomadaire', projet: '', date: '', heure: '09:00', lieu: '', participants: '', ordre: '', decisions: '', alertes: '', prochaine: '' })
  const [saving, setSaving] = useState(false)
  const submit = async () => {
    setSaving(true)
    try {
      const created = await api.rapports.create({ ...f, visibility: 'client_visible', auteur: store.user?.name || '' })
      updateStore(prev => ({ ...prev, rapports: [...(prev.rapports || []), created] }))
      emitEvent('document_uploaded', { name: f.type }, { notifMsg: `Rapport créé : ${f.type}` })
      showToast('Rapport créé')
      setF({ type: 'Rapport hebdomadaire', projet: '', date: '', heure: '09:00', lieu: '', participants: '', ordre: '', decisions: '', alertes: '', prochaine: '' })
      onClose()
    } catch (e) {
      showToast(e.message || 'Erreur création rapport', 'red')
    } finally {
      setSaving(false)
    }
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau rapport" footer={<><button className="btn btn-sm" onClick={onClose}>Annuler</button><button className="btn btn-primary btn-sm" onClick={submit} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-row">
          <div><label className="form-label">Type de rapport</label><select className="form-input" value={f.type} onChange={e => setF(p => ({ ...p, type: e.target.value }))}><option>Rapport hebdomadaire</option><option>Rapport de visite</option><option>Compte-rendu réunion</option><option>Rapport technique</option><option>Rapport mensuel</option><option>Rapport de chantier</option><option>PV de réception</option></select></div>
          <div><label className="form-label">Projet</label><select className="form-input" value={f.projet} onChange={e => setF(p => ({ ...p, projet: e.target.value }))}><option value="">Sélectionner</option>{(store.projects || []).map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}</select></div>
        </div>
        <div className="form-row">
          <div><label className="form-label">Date</label><input className="form-input" type="date" value={f.date} onChange={e => setF(p => ({ ...p, date: e.target.value }))} /></div>
          <div><label className="form-label">Heure</label><input className="form-input" type="time" value={f.heure} onChange={e => setF(p => ({ ...p, heure: e.target.value }))} /></div>
        </div>
        <div><label className="form-label">Lieu</label><input className="form-input" placeholder="Bureau de chantier..." value={f.lieu} onChange={e => setF(p => ({ ...p, lieu: e.target.value }))} /></div>
        <div><label className="form-label">Participants</label><input className="form-input" placeholder="Noms séparés par des virgules" value={f.participants} onChange={e => setF(p => ({ ...p, participants: e.target.value }))} /></div>
        <div><label className="form-label">Ordre du jour</label><textarea className="form-input" rows="3" placeholder="1. Avancement
2. Points techniques" value={f.ordre} onChange={e => setF(p => ({ ...p, ordre: e.target.value }))} /></div>
        <div><label className="form-label">Décisions prises</label><textarea className="form-input" rows="2" placeholder="Décisions et actions..." value={f.decisions} onChange={e => setF(p => ({ ...p, decisions: e.target.value }))} /></div>
        <div><label className="form-label">Points d'alerte</label><textarea className="form-input" rows="2" placeholder="Retards, blocages..." value={f.alertes} onChange={e => setF(p => ({ ...p, alertes: e.target.value }))} /></div>
        <div><label className="form-label">Prochaine réunion</label><input className="form-input" type="date" value={f.prochaine} onChange={e => setF(p => ({ ...p, prochaine: e.target.value }))} /></div>
      </div>
    </Modal>
  )
}

function NoteModal({ isOpen, onClose, showToast }) {
  const { store, updateStore, createDecision } = useMeereo()
  const [f, setF] = useState({ tache: '', statut: 'Termine', avancement: '', type: 'Information', texte: '' })
  const submit = async () => {
    const noteId = 'note_' + Date.now()
    updateStore(prev => ({ ...prev, notes: [...(prev.notes || []), { id: noteId, ...f, createdAt: new Date().toISOString() }] }))
    if (f.type === 'Validation' && f.tache) {
      createDecision({ titre: f.tache, desc: f.texte, urgent: f.statut === 'Bloque', projectId: (store.projects || [])[0]?.id || null, sourceType: 'note_chantier', sourceId: noteId, decisionType: 'validation' })
    }
    try {
      const created = await api.rapports.create({ titre: f.tache || 'Note chantier', type: 'note_chantier', statut: f.statut, avancement: f.avancement, texte: f.texte, alertType: f.type, projectId: (store.projects || [])[0]?.id || null })
      updateStore(prev => ({ ...prev, notes: prev.notes.map(n => n.id === noteId ? { ...n, id: created.id } : n), rapports: [...(prev.rapports || []), created] }))
    } catch (e) { console.warn('[NoteModal]', e.message) }
    showToast('Note enregistrée')
    setF({ tache: '', statut: 'Termine', avancement: '', type: 'Information', texte: '' }); onClose()
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Note de chantier" footer={<><button className="btn btn-sm" onClick={onClose}>Annuler</button><button className="btn btn-primary btn-sm" onClick={submit}>Enregistrer</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-row">
          <div><label className="form-label">Tâche concernée</label><input className="form-input" placeholder="Nom de la tâche..." value={f.tache} onChange={e => setF(p => ({ ...p, tache: e.target.value }))} /></div>
          <div><label className="form-label">Statut</label><select className="form-input" value={f.statut} onChange={e => setF(p => ({ ...p, statut: e.target.value }))}><option>Terminé</option><option>En cours</option><option>à faire</option><option>Bloqué</option></select></div>
        </div>
        <div><label className="form-label">Avancement (%)</label><input className="form-input" type="number" min="0" max="100" placeholder="0-100" value={f.avancement} onChange={e => setF(p => ({ ...p, avancement: e.target.value }))} /></div>
        <div>
          <label className="form-label">Type de note</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Validation', 'Alerte', 'Information', 'Blocage'].map(t => (
              <button key={t} className={`filter-pill${f.type === t ? ' active' : ''}`} onClick={() => setF(p => ({ ...p, type: t }))} style={f.type === t ? { background: 'var(--tx)', color: '#fff' } : undefined}>{t}</button>
            ))}
          </div>
        </div>
        <div><label className="form-label">Note / Rapport</label><textarea className="form-input" style={{ resize: 'vertical', minHeight: 80 }} rows="4" placeholder="Avancement constaté, points de vigilance..." value={f.texte} onChange={e => setF(p => ({ ...p, texte: e.target.value }))} /></div>
      </div>
    </Modal>
  )
}

export default function Worksite({ openModal, showToast, onNavigate }) {
  const { store, updateStore, updateProjectEtapes, saveTaskStates, emitEvent, requestCloture } = useMeereo()
  const { format: fmtMoney } = useDevise()
  const ob = store.onboardingData || {}

  // Refresh projects + members on mount so pro sees projects they've been added to
  useEffect(() => {
    Promise.all([
      api.projects.getAll().catch(() => null),
      api.projectMembers.getAll().catch(() => null),
    ]).then(([freshProjects, freshMembers]) => {
      updateStore(prev => ({
        ...prev,
        ...(freshProjects ? { projects: freshProjects } : {}),
        ...(freshMembers ? { projectMembers: freshMembers } : {}),
      }))
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const allChantierProjets = getUserProjects(store, store.user?.id, store.user?.email)
  const [selProjId, setSelProjId] = useState(allChantierProjets[0]?.id)
  const [openPhases, setOpenPhases] = useState({ 0: true })
  const [assignModal, setAssignModal] = useState(null) // { phaseIdx, taskId? }
  const [showCreateReport, setShowCreateReport] = useState(false)
  const [showCreateNote, setShowCreateNote] = useState(false)
  const [assignTab, setAssignTab] = useState('plateforme') // plateforme | inviter | creer
  const [assignSearch, setAssignSearch] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [newInter, setNewInter] = useState({ nom: '', role: '', email: '', tel: '' })
  const [assignments, setAssignments] = useState({}) // taskId -> { type, id/nom, ... }
  const [completedProjects, setCompletedProjects] = useState([]) // projIds declared as done
  const [confirmModal, setConfirmModal] = useState(null) // { projId, projNom, client } — pro declares done
  const [clientRatingModal, setClientRatingModal] = useState(null) // { projId, projNom, prestataire, ratings } — client rates
  const [evalPresta, setEvalPresta] = useState(null) // { nom, taskId, ratings: {stars,qualite,delais,communication,comment} }
  const [evalDone, setEvalDone] = useState([]) // taskIds already evaluated

  const proj = allChantierProjets.find(p => p.id === selProjId)

  //  Té‚CHES RéELLES DU PROJET (backend) 
  const [projTasks, setProjTasks] = useState([])

  // Recharger les tâches dûs que le projet change
  useEffect(() => {
    if (!selProjId) { setProjTasks([]); return }
    api.tasks.getByProject(selProjId).then(t => setProjTasks(Array.isArray(t) ? t : [])).catch(() => {})
  }, [selProjId])

  // Fusionner tâches backend + tâches locales (créées optimistiquement via acceptOffer)
  const allProjTasks = useMemo(() => {
    const fromStore = (store.tasks || []).filter(t => t.projectId === selProjId)
    const backendIds = new Set(projTasks.map(t => t.id))
    const localOnly = fromStore.filter(t => !backendIds.has(t.id))
    return [...projTasks, ...localOnly]
  }, [projTasks, store.tasks, selProjId])

  // Marchés liés au projet sâlectionné
  const projMarkets = useMemo(() =>
    (store.markets || []).filter(m => m.projectId === selProjId),
  [store.markets, selProjId])

  // Tâches groupées par marché
  const tasksByMarket = useMemo(() => {
    if (allProjTasks.length === 0) return []
    const marketMap = {}
    projMarkets.forEach(m => { marketMap[m.id] = { market: m, tasks: [] } })
    const unassigned = { market: null, tasks: [] }
    allProjTasks.forEach(t => {
      if (t.marketId && marketMap[t.marketId]) marketMap[t.marketId].tasks.push(t)
      else unassigned.tasks.push(t)
    })
    const result = Object.values(marketMap).filter(g => g.tasks.length > 0)
    if (unassigned.tasks.length > 0) result.push(unassigned)
    return result
  }, [allProjTasks, projMarkets])

  // Mise à jour statut d'une tâche rèelle — optimiste + sync API
  const cycleRealTask = useCallback((task) => {
    const cycle = { todo: 'in_progress', in_progress: 'done', done: 'todo', pending: 'in_progress', active: 'done' }
    const newStatus = cycle[task.status] || 'in_progress'
    const optimistic = t => t.id === task.id ? { ...t, status: newStatus } : t
    setProjTasks(prev => prev.map(optimistic))
    updateStore(prev => ({ ...prev, tasks: (prev.tasks || []).map(optimistic) }))
    api.tasks.update(task.id, { status: newStatus }).catch(() => {})
    // Recalculer l'avancement du projet
    const updated = allProjTasks.map(optimistic)
    const done = updated.filter(t => t.status === 'done' || t.status === 'completed').length
    const pct = updated.length ? Math.round(done / updated.length * 100) : 0
    if (proj?.id && pct !== (proj.avancement || 0)) {
      updateStore(prev => ({
        ...prev,
        projects: (prev.projects || []).map(pr => pr.id === proj.id ? { ...pr, avancement: pct } : pr)
      }))
      api.projects.update(proj.id, { avancement: pct }).catch(() => {})
    }
  }, [allProjTasks, proj, updateStore])

  // Task states per project — keyed as `projId_taskId`
  const [taskStates, setTaskStates] = useState({})

  // Load task states from the project's backend data whenever the selected project changes
  useEffect(() => {
    if (!proj?.id) return
    const backendTaskStates = proj.taskStates
    if (backendTaskStates && typeof backendTaskStates === 'object' && Object.keys(backendTaskStates).length > 0) {
      setTaskStates(prev => {
        const next = { ...prev }
        Object.entries(backendTaskStates).forEach(([taskId, status]) => {
          // Only overwrite if the project-scoped key isn't set yet (don't override pending user changes)
          if (!next[proj.id + '_' + taskId]) next[proj.id + '_' + taskId] = status
        })
        return next
      })
    }
  }, [proj?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const getTaskState = (taskId) => taskStates[selProjId + '_' + taskId] || 'todo'

  const cycleTask = useCallback((taskId) => {
    const cur = taskStates[selProjId + '_' + taskId] || 'todo'
    const cycle = { todo: 'active', active: 'done', done: 'todo' }
    const newState = cycle[cur]
    const key = selProjId + '_' + taskId

    // Compute new state synchronously so we can do side effects right away
    const nextTaskStates = { ...taskStates, [key]: newState }
    const getState = (tid) => nextTaskStates[selProjId + '_' + tid] || 'todo'

    // Build flat map { taskId: status } for backend storage
    const taskStatesForBackend = {}
    CHANTIER_PHASES.forEach(ph => ph.tasks.forEach(t => { taskStatesForBackend[t.id] = getState(t.id) }))

    // Compute avancement from task completion (source of truth)
    const taskDone = Object.values(taskStatesForBackend).filter(s => s === 'done').length
    const taskTotal = Object.values(taskStatesForBackend).length
    const taskPct = taskTotal ? Math.round(taskDone / taskTotal * 100) : 0

    // Sync étapes if they exist
    const etapesSync = (proj?.etapes && proj.etapes.length)
      ? syncEtapesFromChantier(proj.etapes, CHANTIER_PHASES, getState)
      : { etapes: proj?.etapes || [], phase: proj?.phase, avancement: 0 }
    const avancement = Math.max(taskPct, etapesSync.avancement)

    setTaskStates(nextTaskStates)
    saveTaskStates(selProjId, Object.fromEntries(Object.entries(nextTaskStates).filter(([k]) => k.startsWith(selProjId + '_'))))

    if (proj?.id) {
      // Update local store
      updateStore(p => ({
        ...p,
        projects: (p.projects || []).map(pr => pr.id === proj.id
          ? { ...pr, avancement, phase: etapesSync.phase || pr.phase, etapes: etapesSync.etapes || pr.etapes, taskStates: taskStatesForBackend }
          : pr)
      }))
      // Persist to backend (only real backend IDs, not optimistic proj_ IDs)
      if (!String(proj.id).startsWith('proj_')) {
        api.projects.update(proj.id, { taskStates: taskStatesForBackend, avancement }).catch(() => {})
      }
    }
  }, [selProjId, taskStates, proj, updateStore, saveTaskStates]) // eslint-disable-line react-hooks/exhaustive-deps

  const togglePhase = (i) => setOpenPhases(prev => ({ ...prev, [i]: !prev[i] }))

  // KPI counts — prioritise les tâches rèelles backend si disponibles
  const totalTasks = allProjTasks.length > 0 ? allProjTasks.length : CHANTIER_PHASES.reduce((s, ph) => s + ph.tasks.length, 0)
  const doneTasks = allProjTasks.length > 0
    ? allProjTasks.filter(t => t.status === 'done' || t.status === 'completed').length
    : CHANTIER_PHASES.reduce((s, ph) => s + ph.tasks.filter(t => getTaskState(t.id) === 'done').length, 0)
  const activeTasks = allProjTasks.length > 0
    ? allProjTasks.filter(t => t.status === 'in_progress' || t.status === 'active').length
    : CHANTIER_PHASES.reduce((s, ph) => s + ph.tasks.filter(t => getTaskState(t.id) === 'active').length, 0)
  const blockedTasks = 0
  const globalPct = totalTasks ? Math.round(doneTasks / totalTasks * 100) : (proj?.avancement || 0)

  const stIcon = (st) => st === 'done' ? <Check size={11}/> : st === 'active' ? <Play size={11}/> : <Circle size={11}/>
  const stStyle = (st) => st === 'done' ? { bg: 'var(--tx)', color: '#fff' } : st === 'active' ? { bg: 'var(--tx)', color: '#fff' } : { bg: 'rgba(0,0,0,.04)', color: 'var(--t4)' }

  // Partners for assign modal — merge ANNUAIRE + INTERVENANTS
  const allPartners = [
    ...ANNUAIRE_PLATEFORME.map(p => ({ ...p, source: 'annuaire' })),
    ...INTERVENANTS_DATA.map(i => ({ id: i.id, nom: i.nom, specialite: i.role, ville: 'Abidjan', verified: true, color: '#6B7280', note: 0, projets: 0, source: 'intervenant' }))
  ]
  const filteredPartners = assignSearch
    ? allPartners.filter(p => (p.nom + p.specialite + (p.ville || '')).toLowerCase().includes(assignSearch.toLowerCase()))
    : allPartners

  const getPartner = (taskId) => {
    const a = assignments[taskId]
    if (!a) return null
    if (a.type === 'plateforme') return allPartners.find(p => p.id === a.id) || { nom: a.nom, color: '#6B7280' }
    return { nom: a.nom, color: '#6B7280' }
  }

  const doAssign = (nom, id) => {
    const entry = { type: 'plateforme', id, nom }
    if (assignModal.taskId) {
      setAssignments(prev => ({ ...prev, [assignModal.taskId]: entry }))
      showToast && showToast(nom + ' assigne')
    } else {
      const ph = CHANTIER_PHASES[assignModal.phaseIdx]
      if (ph) {
        const upd = {}
        ph.tasks.forEach(t => { upd[t.id] = entry })
        setAssignments(prev => ({ ...prev, ...upd }))
        showToast && showToast(nom + ' assigné à toute la phase ' + ph.name)
      }
    }
    // Auto-add to INTERVENANTS_DATA + store if not already present
    if (!INTERVENANTS_DATA.find(i => i.nom === nom)) {
      const partner = ANNUAIRE_PLATEFORME.find(p => p.id === id || p.nom === nom)
      const newInter = {
        id: 'i_' + Date.now(), nom, role: partner?.specialite || 'Prestataire',
        email: '', tel: '', photo: '',
        statut: 'actif', entreprise: true, ville: partner?.ville || 'Abidjan',
        note: partner?.note || 0, projets: [proj?.nom || ''],
        profilUrl: store.user?.publicId ? `/pro?uuid=${store.user.publicId}` : '/pro'
      }
      updateStore(prev => ({ ...prev, intervenants: [...(prev.intervenants || []), newInter] }))
    } else {
      // Add project to existing intervenant via store (never mutate static imports)
      if (proj) {
        updateStore(prev => ({
          ...prev,
          intervenants: (prev.intervenants || []).map(i =>
            i.nom === nom && !(i.projets || []).includes(proj.nom)
              ? { ...i, projets: [...(i.projets || []), proj.nom] }
              : i
          )
        }))
      }
    }
    setAssignModal(null)
  }

  const doInvite = () => {
    if (!inviteEmail.trim()) return
    showToast && showToast('Invitation envoyée à ' + inviteEmail)
    const entry = { type: 'invite', nom: inviteEmail, email: inviteEmail }
    if (assignModal.taskId) {
      setAssignments(prev => ({ ...prev, [assignModal.taskId]: entry }))
    }
    setInviteEmail('')
    setAssignModal(null)
  }

  const doCreateInter = () => {
    if (!newInter.nom.trim()) return
    const newId = 'i_' + Date.now()
    const interObj = { id: newId, nom: newInter.nom, role: newInter.role || 'Prestataire', email: newInter.email || '', tel: newInter.tel || '', photo: '', statut: 'actif', entreprise: false, ville: 'Abidjan', note: 0, projets: [proj?.nom || ''], profilUrl: '' }
    updateStore(prev => ({ ...prev, intervenants: [...(prev.intervenants || []), interObj] }))
    const entry = { type: 'plateforme', id: newId, nom: newInter.nom }
    if (assignModal.taskId) {
      setAssignments(prev => ({ ...prev, [assignModal.taskId]: entry }))
    } else {
      const ph = CHANTIER_PHASES[assignModal.phaseIdx]
      if (ph) {
        const upd = {}
        ph.tasks.forEach(t => { upd[t.id] = entry })
        setAssignments(prev => ({ ...prev, ...upd }))
      }
    }
    showToast && showToast(newInter.nom + ' créé et assigné')
    setNewInter({ nom: '', role: '', email: '', tel: '' })
    setAssignModal(null)
  }

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)' }
  const labelStyle = { fontSize: 11, fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 4 }

  if (allChantierProjets.length === 0 && CHANTIER_PHASES.length === 0) {
    return (
      <div>
        <DSPageHeader title="Suivi chantier" subtitle="Pilotez vos chantiers phase par phase" />
        <div style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 32, marginBottom: 12, opacity: .3 }}>&#128679;</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>Aucun projet à suivre</div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 16 }}>Créez un projet pour dûmarrer le suivi de chantier.</div>
          <button className="btn btn-primary btn-sm" onClick={() => onNavigate && onNavigate('projets')}>Aller aux Projets</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <DSPageHeader title="Suivi chantier" subtitle={proj ? `${proj.nom} à ${PHASE_LABELS[normalizePhase(proj.phase)] || proj.phase || 'Esquisse'} à ${globalPct}%` : 'Sélectionnez un projet'}>
        <button className="btn btn-sm" onClick={() => setShowCreateReport(true)}>Rapport</button>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateNote(true)}>+ Note de chantier</button>
      </DSPageHeader>

      <div className="split" style={{ marginTop: 0, height: 'calc(100vh - var(--topbar-h) - 140px)' }}>
        {/* Project list sidebar */}
        <div className="split-left" style={{ width: 260 }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--t4)' }}>Projets ({allChantierProjets.length})</div>
          {allChantierProjets.map(p => {
            const isSel = selProjId === p.id
            return (
              <div key={p.id} className="list-item" style={{ background: isSel ? 'var(--s2)' : undefined }} onClick={() => { setSelProjId(p.id); setOpenPhases({ 0: true }) }}>
                {p.img ? (
                  <img src={p.img} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
                ) : (
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: (p.color || '#F59E0B') + '10', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AoGear size={16} color={p.color || '#F59E0B'} />
                  </div>
                )}
                <div className="list-item-body">
                  <div className="list-item-title">{p.nom}</div>
                  <div className="list-item-sub">{p.client} à {PHASE_LABELS[normalizePhase(p.phase)] || p.phase}</div>
                </div>
                <div style={{ width: 40, textAlign: 'right' }}>
                  <div style={{ fontSize: 11, fontWeight: 600 }}>{p.avancement}%</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Detail */}
        <div className="split-right">
          {!proj ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4, opacity: .4 }}><HardHat size={28}/></div><div style={{ fontSize: 14, fontWeight: 600 }}>Selectionnez un projet</div>
            </div>
          ) : (
            <div>
              {/* KPI strip */}
              <div className="rg-4" style={{ gap: 10, marginBottom: 16 }}>
                {[
                  { v: doneTasks + '/' + totalTasks, l: 'Terminées', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>, iconBg: 'rgba(52,199,89,.08)', iconColor: 'var(--ok)' },
                  { v: activeTasks, l: 'En cours', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>, iconBg: 'rgba(0,122,255,.07)', iconColor: '#007AFF' },
                  { v: blockedTasks, l: 'Bloquées', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>, iconBg: 'rgba(255,59,48,.07)', iconColor: 'var(--err)' },
                  { v: Object.keys(assignments).length, l: 'Assignés', svg: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>, iconBg: 'rgba(124,58,237,.07)', iconColor: '#7C3AED' },
                ].map((k, i) => (
                  <div key={i} className="card" style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: k.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: k.iconColor, flexShrink: 0 }}>{k.svg}</div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-.6px', lineHeight: 1 }}>{k.v}</div>
                      <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>{k.l}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Hero image + progress overlay */}
              <div style={{ height: 100, position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 16, background: 'linear-gradient(145deg,#191c1d,#2a2c2d)' }}>
                {proj.img && <img src={proj.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} onError={e => { e.target.style.display = 'none' }} />}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 20%, rgba(0,0,0,.75))' }} />
                <div style={{ position: 'absolute', bottom: 14, left: 20, right: 20, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#fff', letterSpacing: '-.2px' }}>{proj.nom}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.55)', marginTop: 2 }}>{proj.client}{proj.adresse ? ' à ' + proj.adresse : ''}{proj.budget ? ' à ' + fmtMoney(Number(String(proj.budget).replace(/\D/g, ''))) : ''}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 600, color: '#fff', lineHeight: 1 }}>{globalPct}%</div>
                    <div style={{ fontSize: 8, color: 'rgba(255,255,255,.45)', textTransform: 'uppercase', letterSpacing: '.4px', marginTop: 2 }}>avancement</div>
                  </div>
                </div>
              </div>

              {/* Bouton Cloturer — visible quand avancement >= 80% ou projet deja complete */}
              {/* Bloc cloture — statut dynamique */}
              {(() => {
                const cs = proj.clotureStatus
                if (cs === 'CLOTURE_VALIDE_EXTERNE' || cs === 'CLOTURE_VALIDE_MEEREO') return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', marginBottom: 16, background: 'rgba(52,199,89,.05)', border: '1px solid rgba(52,199,89,.15)', borderRadius: 12 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <div><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ok)' }}>Clôturé — validû par le client</div></div>
                  </div>
                )
                if (cs === 'DEMANDE_CLOTURE_ENVOYEE' || cs === 'EN_ATTENTE_VALIDATION_CLIENT') return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', marginBottom: 16, background: 'rgba(255,149,0,.04)', border: '1px solid rgba(255,149,0,.12)', borderRadius: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF9500', flexShrink: 0 }} />
                    <div><div style={{ fontSize: 13, fontWeight: 600, color: '#FF9500' }}>Demande envoyée — en attente de validation client</div></div>
                  </div>
                )
                if (cs === 'CLOTURE_REFUSEE') return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', marginBottom: 16, background: 'rgba(255,59,48,.04)', border: '1px solid rgba(255,59,48,.12)', borderRadius: 12 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--err)' }}>Clôture refusée par le client</div>
                      <button className="btn btn-sm" style={{ marginTop: 6, fontSize: 11 }} onClick={() => setConfirmModal({ projId: selProjId, projNom: proj.nom, client: proj.client })}>Renvoyer une demande</button>
                    </div>
                  </div>
                )
                // Pas de cloture en cours — afficher le bouton
                return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', marginBottom: 16, background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 12 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>Clôture du projet</div>
                      <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>Envoyez une demande de validation au client</div>
                    </div>
                    <button style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--tx)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 13, flexShrink: 0 }} onClick={() => setConfirmModal({ projId: selProjId, projNom: proj.nom, client: proj.client, clientEmail: proj.clientEmail })}>
                      Demander la clôture
                    </button>
                  </div>
                )
              })()}

              {/* Té‚CHES CONTRACTUELLES (depuis le backend) */}
              {tasksByMarket.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 10 }}>Tâches contractuelles</div>
                  {tasksByMarket.map((group, gi) => {
                    const mkt = group.market
                    const mktDone = group.tasks.filter(t => t.status === 'done' || t.status === 'completed').length
                    const mktPct = group.tasks.length ? Math.round(mktDone / group.tasks.length * 100) : 0
                    return (
                      <div key={gi} className="card" style={{ marginBottom: 10, overflow: 'hidden' }}>
                        {/* En-tête marché */}
                        {mkt && (
                          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--s2)', display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <HardHat size={14} color="#fff" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mkt.lot || mkt.titre || 'Marché'}</div>
                              <div style={{ fontSize: 10.5, color: 'var(--t3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mkt.entreprise || ''}</div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div className="prog-track" style={{ width: 60, height: 5 }}>
                                <div className="prog-fill" style={{ width: mktPct + '%' }} />
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 600 }}>{mktPct}%</span>
                            </div>
                          </div>
                        )}
                        {/* Liste de tâches */}
                        {group.tasks.map((t, ti) => {
                          const isDone = t.status === 'done' || t.status === 'completed'
                          const isActive = t.status === 'in_progress' || t.status === 'active'
                          const stBg = isDone ? 'var(--tx)' : isActive ? 'var(--tx)' : 'rgba(0,0,0,.04)'
                          const stColor = isDone || isActive ? '#fff' : 'var(--t4)'
                          return (
                            <div key={t.id || ti} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: ti < group.tasks.length - 1 ? '1px solid var(--border)' : 'none', borderLeft: isActive ? '3px solid var(--tx)' : '3px solid transparent', background: isActive ? 'rgba(0,0,0,.02)' : undefined }}>
                              <button onClick={() => cycleRealTask(t)} style={{ width: 28, height: 28, borderRadius: 8, background: stBg, color: stColor, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
                                {isDone ? <Check size={11}/> : isActive ? <Play size={11}/> : <Circle size={11}/>}
                              </button>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12.5, fontWeight: isDone ? 400 : 600, color: isDone ? 'var(--t3)' : 'var(--tx)', textDecoration: isDone ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                                {t.description && <div style={{ fontSize: 10.5, color: 'var(--t4)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</div>}
                              </div>
                              <span style={{ fontSize: 9.5, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: stBg, color: stColor, flexShrink: 0 }}>{isDone ? 'Terminé' : isActive ? 'En cours' : 'à faire'}</span>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Phase progress bars */}
              <div className="card" style={{ padding: 18, marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 12 }}>Avancement par phase</div>
                {CHANTIER_PHASES.map((ph, i) => {
                  const phDone = ph.tasks.filter(t => getTaskState(t.id) === 'done').length
                  const pct = Math.round(phDone / ph.tasks.length * 100)
                  const label = pct === 100 ? 'Termine' : pct > 0 ? 'En cours' : 'A venir'
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i < CHANTIER_PHASES.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <div style={{ width: 160, fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexShrink: 0 }}>{ph.name}</div>
                      <div className="prog-track" style={{ flex: 1, height: 6 }}>
                        <div className="prog-fill" style={{ width: pct + '%', background: pct === 100 ? 'var(--tx)' : pct > 0 ? 'var(--tx)' : 'var(--s3)' }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, width: 30, textAlign: 'right' }}>{pct}%</span>
                      <span style={{ fontSize: 9.5, fontWeight: 600, color: pct === 100 ? 'var(--ok)' : pct > 0 ? 'var(--tx)' : 'var(--t4)', width: 55, textAlign: 'right' }}>{label}</span>
                    </div>
                  )
                })}
              </div>

              {/* Horizontal timeline stepper */}
              <div className="card" style={{ padding: 18, marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 16 }}>Phases de mission</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                  {/* Connector line */}
                  <div style={{ position: 'absolute', top: 18, left: 30, right: 30, height: 2, background: 'var(--s3)' }} />
                  <div style={{ position: 'absolute', top: 18, left: 30, height: 2, background: 'var(--tx)', width: (CHANTIER_PHASES.filter((ph) => ph.tasks.some(t => getTaskState(t.id) === 'done' || getTaskState(t.id) === 'active')).length / Math.max(CHANTIER_PHASES.length - 1, 1) * 100) + '%', maxWidth: 'calc(100% - 60px)', transition: 'width .5s' }} />
                  {CHANTIER_PHASES.map((ph, i) => {
                    const phAllDone = ph.tasks.every(t => getTaskState(t.id) === 'done')
                    const phStarted = ph.tasks.some(t => getTaskState(t.id) === 'done' || getTaskState(t.id) === 'active')
                    return (
                      <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1, flex: 1, cursor: 'pointer' }} onClick={() => togglePhase(i)}>
                        <div style={{
                          width: phStarted ? 36 : 28, height: phStarted ? 36 : 28, borderRadius: '50%',
                          background: phAllDone ? (ph.color || 'var(--tx)') : phStarted ? '#fff' : 'var(--surface-1)',
                          border: phAllDone ? 'none' : phStarted ? '2.5px solid ' + (ph.color || 'var(--tx)') : '1.5px solid var(--s3)',
                          boxShadow: phStarted && !phAllDone ? '0 0 0 5px ' + (ph.color || 'rgba(29,29,31') + '14' : 'none',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all .3s'
                        }}>
                          {phAllDone ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                            : phStarted ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: ph.color || 'var(--tx)' }} />
                              : null}
                        </div>
                        <div style={{ fontSize: 9, fontWeight: phAllDone || phStarted ? 800 : 500, color: phAllDone || phStarted ? (ph.color || 'var(--tx)') : 'var(--t4)', textAlign: 'center', lineHeight: 1.2, maxWidth: 80 }}>{ph.name.split(' & ')[0]}</div>
                        <div style={{ fontSize: 8, fontWeight: 600, color: phAllDone ? 'var(--ok)' : phStarted ? (ph.color || 'var(--tx)') : 'var(--t4)' }}>
                          {phAllDone ? <><Check size={8}/> Terminé</> : phStarted ? Math.round(ph.tasks.filter(t => getTaskState(t.id) === 'done').length / ph.tasks.length * 100) + '%' : 'A venir'}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Phase accordions */}
              {CHANTIER_PHASES.map((ph, phIdx) => {
                const phDone = ph.tasks.filter(t => getTaskState(t.id) === 'done').length
                const phAct = ph.tasks.filter(t => getTaskState(t.id) === 'active').length
                const phPct = Math.round(phDone / ph.tasks.length * 100)
                const isDone = phPct === 100
                const isAct = phAct > 0
                const isOpen = !!openPhases[phIdx]

                return (
                  <div key={phIdx} className="card" style={{ marginBottom: 10, overflow: 'hidden' }}>
                    {/* Phase header */}
                    <div onClick={() => togglePhase(phIdx)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', cursor: 'pointer' }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        ...(isDone ? { background: ph.color || 'var(--tx)', color: '#fff' }
                          : isAct ? { background: 'var(--surface-1)', color: ph.color || 'var(--tx)', border: '2px solid ' + (ph.color || 'var(--tx)'), boxShadow: '0 0 0 4px ' + (ph.color || 'rgba(0,0,0') + '14' }
                            : { background: 'var(--s3)', color: 'var(--t3)' })
                      }}>
                        {isDone
                          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          : <span style={{ fontSize: 14 }}>{PHASE_ICON_MAP[ph.icon] ?? ph.icon}</span>
                        }
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 600, color: isDone || isAct ? 'var(--tx)' : 'var(--t4)' }}>{ph.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{ph.description}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {isDone && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'var(--s2)', color: 'var(--tx)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Check size={10}/> Terminé</span>}
                        {isAct && !isDone && <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'rgba(0,0,0,.06)', color: 'var(--tx)' }}>é—é En cours</span>}
                        <span style={{ fontSize: 10.5, fontWeight: 600 }}>{phPct}%</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2.5" strokeLinecap="round" style={{ transition: 'transform .2s', transform: isOpen ? 'rotate(180deg)' : 'none' }}><polyline points="6 9 12 15 18 9" /></svg>
                      </div>
                    </div>

                    {/* Tasks */}
                    {isOpen && (
                      <div style={{ borderTop: '1px solid var(--border)' }}>
                        {ph.tasks.map((t, ti) => {
                          const st = getTaskState(t.id)
                          const s = stStyle(st)
                          const partner = getPartner(t.id)
                          return (
                            <div key={ti} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px', borderBottom: ti < ph.tasks.length - 1 ? '1px solid var(--border)' : 'none', borderLeft: st === 'active' ? '3px solid var(--tx)' : '3px solid transparent', background: st === 'active' ? 'rgba(0,0,0,.02)' : undefined }}>
                              {/* Status cycle button */}
                              <button onClick={() => cycleTask(t.id)} style={{ width: 28, height: 28, borderRadius: 8, background: s.bg, color: s.color, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 600, transition: 'all .15s' }}>{stIcon(st)}</button>
                              {/* Task info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12.5, fontWeight: st === 'done' ? 500 : 600, color: st === 'done' ? 'var(--t3)' : 'var(--tx)', textDecoration: st === 'done' ? 'line-through' : 'none' }}>{t.title}</div>
                                {partner && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                                    <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: partner.color + '14', color: partner.color }}>{partner.nom}</span>
                                    {st === 'done' && !evalDone.includes(t.id) && (
                                      <button onClick={(e) => { e.stopPropagation(); setEvalPresta({ nom: partner.nom, taskId: t.id, ratings: { stars: 0, qualite: 0, delais: 0, communication: 0, comment: '' } }) }} style={{ fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'var(--tx)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)' }}>Evaluer</button>
                                    )}
                                    {evalDone.includes(t.id) && <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 100, background: 'rgba(52,199,89,.08)', color: 'var(--ok)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Check size={9}/> Evalué</span>}
                                  </div>
                                )}
                              </div>
                              {/* Status badge */}
                              <span style={{ fontSize: 9.5, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: s.bg, color: s.color }}>{st === 'done' ? 'Termine' : st === 'active' ? 'En cours' : 'A faire'}</span>
                              {/* Assign button */}
                              <button onClick={() => { setAssignModal({ phaseIdx: phIdx, taskId: t.id }); setAssignTab('plateforme'); setAssignSearch('') }} style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--s2)', border: '1px solid var(--border-card)', color: 'var(--t3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} title="Assigner un intervenant">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                              </button>
                              <button onClick={() => setShowCreateNote(true)} style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--s2)', border: '1px solid var(--border-card)', color: 'var(--t3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} title="Ajouter une note">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                              </button>
                            </div>
                          )
                        })}
                        {/* Phase action bar */}
                        <div style={{ display: 'flex', gap: 8, padding: '10px 16px', background: 'var(--s2)', borderTop: '1px solid var(--border)' }}>
                          <button className="btn btn-sm" style={{ fontSize: 10, padding: '4px 10px' }} onClick={() => { setAssignModal({ phaseIdx: phIdx }); setAssignTab('plateforme'); setAssignSearch('') }}>Assigner intervenant</button>
                          <button className="btn btn-sm" style={{ fontSize: 10, padding: '4px 10px' }} onClick={() => setShowCreateNote(true)}>+ Note</button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* MODAL: Assigner un intervenant */}
      {assignModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setAssignModal(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 580, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.18)' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: '20px 22px 14px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.5px' }}>Assigner un intervenant</div>
                  {assignModal.phaseIdx != null && <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: 'var(--s3)', marginTop: 6, display: 'inline-block' }}>{CHANTIER_PHASES[assignModal.phaseIdx]?.code} — {CHANTIER_PHASES[assignModal.phaseIdx]?.name}</span>}
                  {assignModal.taskId && <span style={{ fontSize: 10.5, color: 'var(--t3)', marginTop: 4, display: 'block' }}>Tache : {CHANTIER_PHASES[assignModal.phaseIdx]?.tasks.find(t => t.id === assignModal.taskId)?.title}</span>}
                </div>
                <button onClick={() => setAssignModal(null)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t3)' }}>×</button>
              </div>
              {/* 3 tabs */}
              <div style={{ display: 'flex', gap: 4 }}>
                {[['plateforme', 'Rechercher sur la plateforme'], ['inviter', 'Inviter par email'], ['creer', 'Créer un profil']].map(([k, l]) => (
                  <button key={k} className={`filter-pill ${assignTab === k ? 'active' : ''}`} style={{ fontSize: 10.5 }} onClick={() => setAssignTab(k)}>{l}</button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid var(--border)' }}>

              {/* ── Tab: Recherche plateforme ── */}
              {assignTab === 'plateforme' && (
                <div>
                  <div style={{ padding: '12px 22px' }}>
                    <input placeholder="Rechercher un intervenant, entreprise, specialite..." value={assignSearch} onChange={e => setAssignSearch(e.target.value)} className="form-input" autoFocus />
                    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                      {['Tous', 'Gros-oeuvre', 'Electricite', 'Plomberie', 'CVC', 'Architecte', 'BET'].map(f => (
                        <button key={f} className="filter-pill" style={{ fontSize: 10 }} onClick={() => setAssignSearch(f === 'Tous' ? '' : f)}>{f}</button>
                      ))}
                    </div>
                  </div>
                  {filteredPartners.map(p => {
                    const initials = p.nom.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
                    return (
                      <div key={p.id + p.source} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 22px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .1s' }} onClick={() => doAssign(p.nom, p.id)}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: p.color || 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{initials}</span>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 600 }}>{p.nom}</span>
                            {p.verified && <span style={{ background: 'rgba(52,199,89,.08)', color: 'var(--ok)', padding: '1px 5px', borderRadius: 100, fontWeight: 600 }}><Check size={9}/></span>}
                            <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: p.source === 'annuaire' ? 'rgba(37,99,235,.08)' : 'rgba(124,58,237,.08)', color: p.source === 'annuaire' ? '#2563EB' : '#7C3AED', fontWeight: 600 }}>{p.source === 'annuaire' ? 'Annuaire' : 'Equipe'}</span>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{p.specialite}{p.ville ? ' à ' + p.ville : ''}</div>
                        </div>
                        {p.note > 0 && <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--wrn)', fontWeight: 600 }}>{Array.from({length: Math.floor(p.note)}, (_, i) => <Star key={i} size={11} fill="#F59E0B" strokeWidth={0}/>)} {p.note}</div>
                          <div style={{ fontSize: 10, color: 'var(--t4)' }}>{p.projets} projets</div>
                        </div>}
                      </div>
                    )
                  })}
                  {filteredPartners.length === 0 && <div style={{ padding: '24px 22px', textAlign: 'center', fontSize: 12, color: 'var(--t4)' }}>Aucun résultat — essayez l'onglet "Inviter par email"</div>}
                </div>
              )}

              {/* ── Tab: Inviter par email ── */}
              {assignTab === 'inviter' && (
                <div style={{ padding: '22px' }}>
                  <div style={{ background: 'var(--s2)', borderRadius: 12, padding: 20, marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Inviter un intervenant externe</div>
                    <div style={{ fontSize: 11.5, color: 'var(--t3)', lineHeight: 1.5 }}>L'intervenant recevra une invitation par email pour rejoindre la plateforme MEEREO et sera automatiquement assigné à cette tâche.</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div><label className="form-label">Email de l'intervenant</label><input className="form-input" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="prenom.nom@entreprise.com" autoFocus /></div>
                    <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end' }} onClick={doInvite} disabled={!inviteEmail.trim()}>Envoyer l'invitation</button>
                  </div>
                  <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(124,58,237,.04)', borderRadius: 10, border: '1px solid rgba(124,58,237,.1)' }}>
                    <div style={{ fontSize: 11, color: '#7C3AED', fontWeight: 600, marginBottom: 4 }}>S'il ne souhaite pas rejoindre la plateforme</div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>Vous pouvez créer un profil manuellement dans l'onglet "Créer un profil", avec ou sans email.</div>
                  </div>
                </div>
              )}

              {/* ── Tab: Créer un profil ── */}
              {assignTab === 'creer' && (
                <div style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ background: 'var(--s2)', borderRadius: 12, padding: 16, marginBottom: 4 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>Créer un profil intervenant</div>
                    <div style={{ fontSize: 11, color: 'var(--t3)' }}>Ce profil sera ajouté à votre base d'intervenants et pourra être réutilisé sur d'autres projets.</div>
                  </div>
                  <div><label className="form-label">Nom complet *</label><input className="form-input" value={newInter.nom} onChange={e => setNewInter(p => ({ ...p, nom: e.target.value }))} placeholder="Prenom Nom" autoFocus /></div>
                  <div><label className="form-label">Rôle / Spécialité</label><input className="form-input" value={newInter.role} onChange={e => setNewInter(p => ({ ...p, role: e.target.value }))} placeholder="Electricien, Plombier, Architecte..." /></div>
                  <div className="modal-row">
                    <div><label className="form-label">Email (optionnel)</label><input className="form-input" type="email" value={newInter.email} onChange={e => setNewInter(p => ({ ...p, email: e.target.value }))} placeholder="email@exemple.com" /></div>
                    <div><label className="form-label">Telephone (optionnel)</label><input className="form-input" value={newInter.tel} onChange={e => setNewInter(p => ({ ...p, tel: e.target.value }))} placeholder="+225 07 00 00 00" /></div>
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end', marginTop: 4 }} onClick={doCreateInter} disabled={!newInter.nom.trim()}>Créer et assigner</button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 22px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--t3)' }}>{assignTab === 'plateforme' ? filteredPartners.length + ' intervenants disponibles' : ''}</span>
              <button className="btn btn-sm" onClick={() => setAssignModal(null)}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Evaluer un prestataire */}
      {evalPresta && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setEvalPresta(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 460, boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.4px', marginBottom: 4 }}>Evaluer le prestataire</div>
              <div style={{ fontSize: 12, color: 'var(--t3)' }}>{evalPresta.nom} à Mission terminee</div>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--s2)', borderRadius: 10, marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{evalPresta.nom.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{evalPresta.nom}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)' }}>Prestataire</div>
                </div>
              </div>
              {[['stars', 'Note globale'], ['qualite', 'Qualite du travail'], ['delais', 'Respect des delais'], ['communication', 'Communication']].map(([field, label]) => (
                <div key={field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--t2)' }}>{label}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} onClick={() => setEvalPresta(p => ({ ...p, ratings: { ...p.ratings, [field]: s } }))} style={{ cursor: 'pointer', transition: 'color .1s' }}><Star size={22} fill={s <= evalPresta.ratings[field] ? '#F59E0B' : 'none'} color={s <= evalPresta.ratings[field] ? '#F59E0B' : 'var(--s3)'}/></span>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 12 }}>
                <textarea placeholder="Commentaire (optionnel)..." value={evalPresta.ratings.comment} onChange={e => setEvalPresta(p => ({ ...p, ratings: { ...p.ratings, comment: e.target.value } }))} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 12, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)', resize: 'vertical', minHeight: 50 }} />
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-sm" onClick={() => setEvalPresta(null)}>Plus tard</button>
              <button style={{ padding: '8px 18px', borderRadius: 10, background: 'var(--tx)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 13 }} onClick={() => {
                if (evalPresta.ratings.stars > 0) {
                  updateStore(prev => ({
                    ...prev,
                    reviews: [...(prev.reviews || []), {
                      id: 'rev_' + Date.now(),
                      intervenant: evalPresta.nom,
                      taskId: evalPresta.taskId,
                      stars: evalPresta.ratings.stars,
                      comment: evalPresta.ratings.comment || '',
                      createdAt: new Date().toISOString(),
                    }]
                  }))
                }
                setEvalDone(prev => [...prev, evalPresta.taskId])
                setEvalPresta(null)
                showToast && showToast('évaluation enregistrée à Note mise à jour pour ' + evalPresta.nom)
              }}>Envoyer l'evaluation</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Demande de clôture (3 options) */}
      {confirmModal && (() => {
        const hasClientAccount = !!confirmModal.clientEmail
        const inputSt = { width: '100%', padding: '10px 14px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)' }
        return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setConfirmModal(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 500, maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,.18)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '22px 24px 16px' }}>
              <div style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-.3px', marginBottom: 4 }}>Clôture du projet</div>
              <div style={{ fontSize: 13, color: 'var(--t3)' }}>{confirmModal.projNom}</div>
              {!hasClientAccount && <div style={{ fontSize: 12, color: 'var(--t4)', marginTop: 8, lineHeight: 1.5 }}>Votre client n'est pas encore sur MEEREO. Choisissez comment finaliser la validation.</div>}
            </div>

            <div style={{ padding: '0 24px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Option 1 — Lien de validation (recommandûe) */}
              <div style={{ padding: '16px 18px', border: '2px solid var(--tx)', borderRadius: 12, cursor: 'pointer', background: 'rgba(0,0,0,.01)' }} onClick={() => {
                const email = prompt('Email du client pour recevoir le lien :')
                if (!email || !email.includes('@')) return
                requestCloture({ projectId: confirmModal.projId, clientEmail: email, validationMode: 'EXTERNAL_LINK' })
                setConfirmModal(null)
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Envoyer un lien de validation au client</div>
                  <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'var(--tx)', color: '#fff' }}>RECOMMANDé</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--t3)', lineHeight: 1.5 }}>Le client recevra un lien simple pour confirmer la réception du projet.</div>
              </div>

              {/* Option 2 — Inviter le client sur MEEREO */}
              <div style={{ padding: '16px 18px', border: '1px solid var(--border-card)', borderRadius: 12, cursor: 'pointer' }} onClick={() => {
                const email = prompt('Email du client à inviter sur MEEREO :')
                if (!email || !email.includes('@')) return
                requestCloture({ projectId: confirmModal.projId, clientEmail: email, validationMode: 'PLATFORM' })
                setConfirmModal(null)
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Inviter le client à rejoindre MEEREO</div>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--t3)', lineHeight: 1.5 }}>Le client recevra une invitation et pourra valider depuis son espace.</div>
              </div>

              {/* Option 3 — Validation manuelle avec preuve */}
              <div style={{ padding: '16px 18px', border: '1px solid var(--border-card)', borderRadius: 12, cursor: 'pointer' }} onClick={() => {
                const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*,.pdf'
                input.onchange = (ev) => {
                  const f = ev.target.files[0]; if (!f) return
                  const reader = new FileReader()
                  reader.onload = () => {
                    requestCloture({ projectId: confirmModal.projId, validationMode: 'MANUAL', proof: reader.result, message: 'Validation obtenue hors plateforme' })
                    setConfirmModal(null)
                  }
                  reader.readAsDataURL(f)
                }
                input.click()
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>Valider avec preuve externe</div>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--t3)', lineHeight: 1.5 }}>Vous avez dûjé obtenu la validation du client hors plateforme. Joignez une preuve (photo, PDF, message).</div>
              </div>
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-sm" style={{ width: '100%' }} onClick={() => setConfirmModal(null)}>Annuler</button>
            </div>
          </div>
        </div>
        )
      })()}

      {/* MODAL: Client note le prestataire */}
      {clientRatingModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setClientRatingModal(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 500, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.2)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ok)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Confirmation client</div>
                  <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.4px' }}>Evaluer le prestataire</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>{clientRatingModal.projNom} à {clientRatingModal.client}</div>
                </div>
                <button onClick={() => setClientRatingModal(null)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t3)' }}>×</button>
              </div>
            </div>

            {/* Rating form */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '14px 16px', background: 'var(--s2)', borderRadius: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#fff', flexShrink: 0 }}>AK</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{clientRatingModal.prestataire}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)' }}>Maitre d'oeuvre</div>
                </div>
              </div>

              {[['stars', 'Note globale'], ['qualite', 'Qualite du travail'], ['delais', 'Respect des delais'], ['communication', 'Communication & suivi']].map(([field, label]) => (
                <div key={field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--t2)' }}>{label}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} onClick={() => setClientRatingModal(prev => ({ ...prev, ratings: { ...prev.ratings, [field]: s } }))} style={{ cursor: 'pointer', transition: 'color .1s' }}><Star size={22} fill={s <= clientRatingModal.ratings[field] ? '#F59E0B' : 'none'} color={s <= clientRatingModal.ratings[field] ? '#F59E0B' : 'var(--s3)'}/></span>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Commentaire (optionnel)</label>
                <textarea placeholder="Votre experience avec ce prestataire..." value={clientRatingModal.ratings.comment} onChange={e => setClientRatingModal(prev => ({ ...prev, ratings: { ...prev.ratings, comment: e.target.value } }))} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 12, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)', resize: 'vertical', minHeight: 60 }} />
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end', flexShrink: 0 }}>
              <button className="btn btn-sm" onClick={() => { setClientRatingModal(null); showToast && showToast('Evaluation ignoree') }}>Plus tard</button>
              <button className="btn btn-primary btn-sm" onClick={() => { setClientRatingModal(null); showToast && showToast('Merci ! évaluation enregistrée à Le ranking du prestataire a été mis à jour') }}>Envoyer mon évaluation</button>
            </div>
          </div>
        </div>
      )}
      <ReportModal isOpen={showCreateReport} onClose={() => setShowCreateReport(false)} showToast={showToast} />
            <NoteModal isOpen={showCreateNote} onClose={() => setShowCreateNote(false)} showToast={showToast} />
    </div>
  )
}

