import { useState, useMemo, useEffect } from 'react'
import { HardHat, Check, Wallet, FileText } from 'lucide-react'
import { INTERVENANTS_DATA } from '../../data/intervenants'
import MoneyInput from '../../components/shared/MoneyInput'
import Modal from '../../components/shared/Modal'
import { useMeereo } from '../../hooks/useMeereoStore'
import { api } from '../../services/api/client'
import { getUserProjects, getUserActiveProjects } from '../../domain/projectsRepository'
import PaymentBadge from '../../components/shared/PaymentBadge'
import NewProjectButton from '../../components/shared/NewProjectButton'
import { PAY_STATUS } from '../../domain/fintech'
import { useDevise } from '../../hooks/useDevise'
import { DSPageHeader, DSFilterBar, DSEmptyState } from '../../design/components'
import AoGear from '../../components/shared/AoGear'
import { computeProjectAvancement } from '../../domain/projectAggregates'
import { PHASE_LABELS, normalizePhase } from '../../domain/status'
import { formatDateFR } from '../../utils/helpers'
import { CHANTIER_PHASES } from '../../data/chantier'

const ACCESS_LEVELS = [
  { id: 'admin', label: 'Complet' },
  { id: 'edition', label: 'Edition' },
  { id: 'lecture', label: 'Lecture' },
]
const MEMBER_STATUS = ['actif', 'en attente', 'suspendu']
const accessColor = a => a === 'admin' ? 'var(--tx)' : a === 'edition' ? 'var(--inf)' : 'var(--t4)'
const statusColor = s => s === 'actif' ? 'var(--ok)' : s === 'suspendu' ? 'var(--err)' : 'var(--wrn)'

// Find photo for a team member by matching name against INTERVENANTS_DATA or onboarding team
const getMemberPhoto = (nom, store) => {
  if (!nom) return null
  const inter = INTERVENANTS_DATA.find(i => i.nom === nom || i.nom.includes(nom.split(' ').pop()))
  if (inter?.photo) return inter.photo
  const obTeam = store?.onboardingData?.team || []
  const obMatch = obTeam.find(t => t.name === nom || t.name?.includes(nom.split(' ').pop()))
  if (obMatch?.photoUrl) return obMatch.photoUrl
  return null
}


const ErrMsg = ({ show }) => show
  ? <p style={{ color: 'var(--err)', fontSize: 11, marginTop: 4, fontWeight: 500 }}>Champ obligatoire</p>
  : null

function ProjetModal({ isOpen, onClose, showToast }) {
  const { store, updateStore, createProject } = useMeereo()
  const isClient = store.user?.type === 'client'

  const blank = { nom: '', type: 'Maison / Villa', phase: 'ESQUISSE', client: '', clientEmail: '', budget: '', livraison: '', localisation: '', priorite: 'Normale', description: '' }
  const [f, setF] = useState(blank)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Professional invitation (client flow only)
  const [proMode, setProMode] = useState('email') // 'email' | 'annuaire'
  const [proEmail, setProEmail] = useState('')
  const [proName, setProName] = useState('')
  const [proSearch, setProSearch] = useState('')
  const [selectedPro, setSelectedPro] = useState(null)

  const registeredPros = (store.users || []).filter(u => u && u.type === 'pro')
  const annuairePros = INTERVENANTS_DATA.filter(i => i.entreprise)
  const allPros = [
    ...registeredPros.map(u => ({ name: u.name || u.email, email: u.email || '', registered: true })),
    ...annuairePros
      .filter(i => !registeredPros.some(u => u.email === i.email))
      .map(i => ({ name: i.nom, email: i.email || '', registered: false })),
  ]
  const filteredPros = proSearch.trim()
    ? allPros.filter(p => p.name.toLowerCase().includes(proSearch.toLowerCase()) || p.email.toLowerCase().includes(proSearch.toLowerCase()))
    : []

  const reset = () => {
    setF(blank); setSubmitted(false)
    setProEmail(''); setProName(''); setProSearch(''); setSelectedPro(null); setProMode('email')
  }

  const proDesignated = isClient && (selectedPro || (proEmail.trim() && proEmail.includes('@')))
  const canSubmit = f.nom.trim() && (!isClient || proDesignated)

  const submit = () => {
    setSubmitted(true)
    if (!canSubmit || submitting) return
    setSubmitting(true)

    const projId = 'proj_' + Date.now()
    createProject({ id: projId, name: f.nom, type: f.type, budget: f.budget, address: f.localisation, phase: 'ESQUISSE', livraison: f.livraison, priorite: f.priorite, description: f.description, client: f.client, clientEmail: f.clientEmail })

    if (!isClient && f.client) {
      api.contacts.create({ type: 'client', nom: f.client, email: f.clientEmail || null })
        .then(created => updateStore(prev => {
          if ((prev.clients || []).some(c => c.nom === f.client)) return prev
          return { ...prev, contacts: [...(prev.contacts || []), created], clients: [...(prev.clients || []), created] }
        })).catch(() => {})
    }

    // Invite professional (client flow)
    if (isClient) {
      const invEmail = proMode === 'annuaire' && selectedPro ? selectedPro.email : proEmail.trim()
      const invName  = proMode === 'annuaire' && selectedPro ? selectedPro.name  : proName.trim()
      if (invEmail && invEmail.includes('@')) {
        api.projectMembers.create({ projectId: projId, userEmail: invEmail, userName: invName || invEmail, role: 'PRO_ADMIN', invitedByClient: true }).catch(() => {})
        updateStore(prev => ({
          ...prev,
          projectInvitations: [...(prev.projectInvitations || []), {
            id: 'pinv_pro_' + Date.now(), projectId: projId,
            clientEmail: invEmail, proName: invName || invEmail,
            status: 'pending', sentBy: prev.user?.id, sentByName: prev.user?.name || '',
            direction: 'client_to_pro', createdAt: new Date().toISOString(),
          }],
        }))
        showToast && showToast('Invitation envoyée à ' + (invName || invEmail))
      }
    }

    reset(); onClose(); setSubmitting(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau projet" footer={<><button className="btn btn-sm" onClick={onClose}>Annuler</button><button className="btn btn-primary btn-sm" onClick={submit} disabled={submitting || !canSubmit} style={{ opacity: (submitting || !canSubmit) ? .5 : 1 }}>{submitting ? 'Création...' : 'Créer le projet'}</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="form-label">Nom du projet *</label>
          <input className="form-input" placeholder="ex: Maison familiale R+1" value={f.nom} onChange={e => setF(p => ({ ...p, nom: e.target.value }))} />
          <ErrMsg show={submitted && !f.nom.trim()} />
        </div>

        <div className="form-row">
          <div>
            <label className="form-label">Type</label>
            <select className="form-input" value={f.type} onChange={e => setF(p => ({ ...p, type: e.target.value }))}>
              <option>Maison / Villa</option><option>Magasin / Activité</option><option>Usage mixte</option><option>Bureaux / Entreprise</option><option>Autre</option>
            </select>
          </div>
          {!isClient && (
            <div>
              <label className="form-label">Phase du projet</label>
              <select className="form-input" value={f.phase} onChange={e => setF(p => ({ ...p, phase: e.target.value }))}>
                <option value="ESQUISSE">Esquisse</option>
                <option value="AVANT_PROJET">Avant-projet</option>
                <option value="PROJET_DETAILLE">Projet détaillé</option>
                <option value="PLANS_EXECUTION">Plans d'exécution</option>
                <option value="CONSULTATION_ENTREPRISES">Consultation des entreprises</option>
                <option value="ATTRIBUTION_MARCHES">Attribution des marchés</option>
                <option value="SUIVI_CHANTIER">Suivi de chantier</option>
                <option value="RECEPTION">Réception du projet</option>
              </select>
            </div>
          )}
        </div>

        {!isClient && (
          <>
            <div><label className="form-label">Client</label><input className="form-input" placeholder="Nom du maître d'ouvrage" value={f.client} onChange={e => setF(p => ({ ...p, client: e.target.value }))} /></div>
            <div><label className="form-label">Email du client</label><input className="form-input" type="email" placeholder="client@email.com — invitation automatique" value={f.clientEmail} onChange={e => setF(p => ({ ...p, clientEmail: e.target.value }))} /></div>
          </>
        )}

        <div className="form-row">
          <div><label className="form-label">Budget estimé (FCFA)</label><MoneyInput value={f.budget} onChange={v => setF(p => ({ ...p, budget: v }))} placeholder="4 800 000" /></div>
          <div><label className="form-label">Livraison prévue</label><input className="form-input" type="date" value={f.livraison} onChange={e => setF(p => ({ ...p, livraison: e.target.value }))} /></div>
        </div>
        <div className="form-row">
          <div><label className="form-label">Localisation</label><input className="form-input" placeholder="Abidjan, Cocody" value={f.localisation} onChange={e => setF(p => ({ ...p, localisation: e.target.value }))} /></div>
          <div><label className="form-label">Priorité</label><select className="form-input" value={f.priorite} onChange={e => setF(p => ({ ...p, priorite: e.target.value }))}><option>Normale</option><option>Haute</option><option>Critique</option></select></div>
        </div>
        <div><label className="form-label">Description</label><textarea className="form-input" rows="2" placeholder="Contexte, objectifs..." value={f.description} onChange={e => setF(p => ({ ...p, description: e.target.value }))} /></div>

        {/* ── Section professionnel d'accompagnement (client uniquement) ── */}
        {isClient && (
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
            <label className="form-label" style={{ marginBottom: 4 }}>Professionnel d'accompagnement</label>
            <div style={{ fontSize: 11.5, color: 'var(--t3)', lineHeight: 1.5, marginBottom: 10 }}>
              Désignez le professionnel qui suivra votre projet et gérera son avancement.
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
              {[['email', 'Par email'], ['annuaire', "Depuis l'annuaire"]].map(([k, l]) => (
                <button key={k} type="button"
                  onClick={() => { setProMode(k); setSelectedPro(null); setProSearch('') }}
                  style={{ flex: 1, padding: '7px 10px', borderRadius: 8, border: proMode === k ? '2px solid var(--tx)' : '1px solid var(--border-subtle)', background: proMode === k ? 'rgba(0,0,0,.03)' : 'var(--surface-1)', fontFamily: 'var(--f)', fontSize: 12, fontWeight: proMode === k ? 700 : 400, cursor: 'pointer', color: 'var(--tx)' }}>
                  {l}
                </button>
              ))}
            </div>

            {proMode === 'email' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input className="form-input" type="email" placeholder="professionnel@email.com" value={proEmail} onChange={e => setProEmail(e.target.value)} />
                <input className="form-input" placeholder="Nom du professionnel (optionnel)" value={proName} onChange={e => setProName(e.target.value)} />
              </div>
            )}

            {proMode === 'annuaire' && (
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  placeholder="Rechercher un professionnel..."
                  value={selectedPro ? selectedPro.name : proSearch}
                  onChange={e => { setProSearch(e.target.value); setSelectedPro(null) }}
                />
                {selectedPro && (
                  <button type="button" onClick={() => setSelectedPro(null)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--t3)', lineHeight: 1 }}>×</button>
                )}
                {!selectedPro && filteredPros.length > 0 && (
                  <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50, background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.1)', maxHeight: 180, overflowY: 'auto' }}>
                    {filteredPros.map((p, i) => (
                      <div key={i}
                        onClick={() => { setSelectedPro(p); setProSearch('') }}
                        style={{ padding: '9px 12px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border-subtle)' }}
                        onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'}
                        onMouseOut={e => e.currentTarget.style.background = ''}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{(p.name || '?')[0].toUpperCase()}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600 }}>{p.name}</div>
                          {p.email && <div style={{ fontSize: 10, color: 'var(--t4)' }}>{p.email}</div>}
                        </div>
                        {p.registered && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 100, background: 'rgba(52,199,89,.08)', color: 'var(--ok)' }}>Inscrit</span>}
                      </div>
                    ))}
                  </div>
                )}
                {!selectedPro && proSearch.trim() && filteredPros.length === 0 && (
                  <div style={{ marginTop: 6, fontSize: 11, color: 'var(--t4)' }}>Aucun résultat — vous pouvez l'inviter par email.</div>
                )}
              </div>
            )}

            {submitted && isClient && !proDesignated && (
              <p style={{ color: 'var(--err)', fontSize: 11, marginTop: 6, fontWeight: 500 }}>Un professionnel d'accompagnement est requis pour créer un projet.</p>
            )}
            {proDesignated && (
              <div style={{ marginTop: 10, padding: '10px 14px', background: 'rgba(52,199,89,.05)', border: '1px solid rgba(52,199,89,.15)', borderRadius: 10, fontSize: 12, color: 'var(--ok)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={13}/>
                Une invitation sera envoyée à <strong>{selectedPro ? selectedPro.name : (proName || proEmail)}</strong> dès la création du projet.
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}

export default function Projects({ onNavigate, openModal, showToast }) {
  const { store, updateStore, deleteProject, archiveProject, unarchiveProject, updateProject } = useMeereo()
  const isClientUser = store.user?.type === 'client'
  const { format: fmtMoney, parseBudget: parseBgt } = useDevise()
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [phaseFilter, setPhaseFilter] = useState('all')
  const [viewMode, setViewMode] = useState('liste')
  const [deleteConfirm, setDeleteConfirm] = useState(null) // { id, nom, hasData }
  const [archiveConfirm, setArchiveConfirm] = useState(null) // { id, nom }
  const [showArchived, setShowArchived] = useState(false)

  // Edit project modal
  const [editModal, setEditModal] = useState(null) // project copy
  const [editSection, setEditSection] = useState('projet') // 'projet' | 'equipe' | 'notes'
  // Add member modal
  const [addMemberModal, setAddMemberModal] = useState(false)
  const [memberTab, setMemberTab] = useState('existant')
  const [memberSearch, setMemberSearch] = useState('')
  const [newMember, setNewMember] = useState({ nom: '', role: '', email: '', tel: '' })
  // Edit member modal
  const [editMember, setEditMember] = useState(null) // { idx, member }

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

  const userId = store.user?.id
  const allProjetsRaw = useMemo(() => getUserProjects(store, userId), [store.projects, userId, store.projectMembers])
  // Enrich with computed avancement (phase + étapes + stored)
  const allProjets = useMemo(() => allProjetsRaw.map(p => ({ ...p, avancement: computeProjectAvancement(p) })), [allProjetsRaw])

  const total = allProjets.length
  const enCours = allProjets.filter(p => p.avancement > 0 && p.avancement < 100).length
  const avgAvt = Math.round(allProjets.reduce((s, p) => s + p.avancement, 0) / Math.max(total, 1))

  const archivedProjets = useMemo(() => allProjets.filter(p => p.status === 'archived'), [allProjets])
  const activeRaw = useMemo(() => getUserActiveProjects(store, userId), [store.projects, userId, store.projectMembers])
  const activeProjets = useMemo(() => activeRaw.map(p => ({ ...p, avancement: computeProjectAvancement(p) })), [activeRaw])

  const filtered = (showArchived ? archivedProjets : activeProjets).filter(p => {
    const phaseOk = phaseFilter === 'all' || p.phase === phaseFilter
    const q = search.toLowerCase()
    const searchOk = !q || (p.nom + p.client + p.type).toLowerCase().includes(q)
    return phaseOk && searchOk
  })

  const selected = selectedId ? allProjets.find(p => p.id === selectedId) : filtered[0]

  // é── Edit project helpers
  const openEdit = (section) => {
    if (!selected) return
    setEditModal({ ...selected, equipe: [...(selected.equipe || [])].map(e => ({ ...e })) })
    setEditSection(section || 'projet')
  }
  const saveEdit = () => {
    if (!editModal) return
    updateProject(editModal.id, { nom: editModal.nom, name: editModal.nom, client: editModal.client, phase: editModal.phase, budget: editModal.budget, livraison: editModal.livraison, type: editModal.type, adresse: editModal.adresse, localisation: editModal.adresse, description: editModal.description, avancement: editModal.avancement, priorite: editModal.priorite, equipe: editModal.equipe, notes: editModal.notes, clientEmail: editModal.clientEmail })
    setEditModal(null)
    showToast && showToast('Projet mis à jour')
    setSelectedId(null); setTimeout(() => setSelectedId(editModal.id), 0)
  }

  // é── Add member
  const addExistingMember = (inter) => {
    if (!editModal) return
    const already = editModal.equipe.some(e => e.nom === inter.nom)
    if (already) { showToast && showToast('Deja dans l\'equipe'); return }
    setEditModal(prev => ({
      ...prev,
      equipe: [...prev.equipe, { id: 'eq_' + Date.now(), nom: inter.nom, role: inter.role, access: 'lecture', statut: 'actif' }]
    }))
    setAddMemberModal(false)
    showToast && showToast(inter.nom + ' ajoute')
  }
  const addNewMember = () => {
    if (!newMember.nom.trim()) return
    const newId = 'eq_' + Date.now()
    setEditModal(prev => ({
      ...prev,
      equipe: [...prev.equipe, { id: newId, nom: newMember.nom, role: newMember.role || 'Intervenant', access: 'lecture', statut: 'actif' }]
    }))
    // Persister dans le store
    updateStore(prev => {
      const exists = (prev.intervenants || []).some(i => i.nom === newMember.nom)
      if (exists) return prev
      return { ...prev, intervenants: [...(prev.intervenants || []), { id: 'i_' + Date.now(), nom: newMember.nom, role: newMember.role || 'Intervenant', email: newMember.email || '', tel: newMember.tel || '', photo: '', statut: 'actif', projectId: editModal?.id || null, phase: editModal?.phase || null, mission: newMember.role || '' }] }
    })
    setNewMember({ nom: '', role: '', email: '', tel: '' })
    setAddMemberModal(false)
    showToast && showToast('Nouveau membre ajoute')
  }
  const removeMember = (idx) => {
    setEditModal(prev => ({ ...prev, equipe: prev.equipe.filter((_, i) => i !== idx) }))
  }
  const saveEditMember = () => {
    if (!editMember) return
    setEditModal(prev => {
      const eq = [...prev.equipe]
      eq[editMember.idx] = { ...editMember.member }
      return { ...prev, equipe: eq }
    })
    setEditMember(null)
  }

  const filteredInter = memberSearch
    ? INTERVENANTS_DATA.filter(i => (i.nom + i.role).toLowerCase().includes(memberSearch.toLowerCase()))
    : INTERVENANTS_DATA

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)' }
  const labelStyle = { fontSize: 11, fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 4 }

  return (
    <div>
      {/* Header */}
      <DSPageHeader title="Projets" subtitle={showArchived ? archivedProjets.length + ' projet(s) archivé(s)' : activeProjets.length + ' projet(s) actif(s)'}>
        <DSFilterBar filters={[{key:'liste',label:'Liste'},{key:'kanban',label:'Kanban'}]} active={viewMode} onChange={setViewMode} />
        <DSFilterBar filters={['all','ESQUISSE','AVANT_PROJET','PROJET_DETAILLE','PLANS_EXECUTION','CONSULTATION_ENTREPRISES','ATTRIBUTION_MARCHES','SUIVI_CHANTIER','RECEPTION'].map(ph => ({key:ph,label:ph==='all'?'Tous':PHASE_LABELS[ph]||ph}))} active={phaseFilter} onChange={setPhaseFilter} />
        {archivedProjets.length > 0 && (
          <button className={`filter-pill ${showArchived ? 'active' : ''}`} onClick={() => setShowArchived(o => !o)} style={{ fontSize: 11 }}>
            {showArchived ? 'Projets actifs' : `Archives (${archivedProjets.length})`}
          </button>
        )}
        <NewProjectButton onOpen={() => setShowCreateProject(true)} context="header" />
      </DSPageHeader>

      {/* KPI strip */}
      <div className="rg-2" style={{ gap: 20, marginBottom: 24 }}>
        <div style={{ background: 'linear-gradient(145deg,#191c1d,#3c3b3b)', borderRadius: 12, padding: 22, color: '#fff' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Apercu</div>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-2.5px', lineHeight: 1, marginBottom: 5 }}>{total}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', marginBottom: 14 }}>projets en portefeuille</div>
          <NewProjectButton onOpen={() => setShowCreateProject(true)} context="overview" variant="light" />
        </div>
        <div className="rg-2" style={{ gap: 12 }}>
          {[
            { v: enCours, l: 'En cours' }, { v: avgAvt + '%', l: 'Avancement moyen' },
            { v: allProjets.filter(p => p.phase === 'ACT' || p.phase === 'DET').length, l: 'En chantier' },
            { v: allProjets.filter(p => p.avancement >= 100).length, l: 'Termines' },
          ].map((k, i) => (
            <div key={i} className="card" style={{ padding: 16 }}><div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.8px', marginBottom: 4 }}>{k.v}</div><div style={{ fontSize: 12, color: 'var(--t3)' }}>{k.l}</div></div>
          ))}
        </div>
      </div>

      {/* Kanban view */}
      {viewMode === 'kanban' && (() => {
        const COLS = [
          { key: 'todo',        label: 'à faire',  color: 'var(--t4)' },
          { key: 'in_progress', label: 'En cours',  color: 'var(--wrn)' },
          { key: 'done',        label: 'Terminé',   color: 'var(--ok)' },
        ]
        return (
          <div className="rg-3" style={{ gap: 14, marginTop: 4 }}>
            {COLS.map(col => {
              const colProjects = filtered.filter(p => (p.kanbanStatus || 'todo') === col.key)
              return (
                <div key={col.key} style={{ background: 'var(--s2)', borderRadius: 12, padding: 12, minHeight: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--tx)' }}>{col.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', marginLeft: 'auto', background: 'var(--surface-1)', borderRadius: 100, padding: '1px 7px', border: '1px solid var(--border-card)' }}>{colProjects.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {colProjects.map(p => (
                      <div key={p.id} style={{ background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 10, padding: 12, cursor: 'pointer' }} onClick={() => { setViewMode('liste'); setSelectedId(p.id) }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 7, background: (p.color || '#F59E0B') + '12', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <AoGear size={12} color={p.color || '#F59E0B'} />
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nom}</div>
                            <div style={{ fontSize: 10.5, color: 'var(--t3)' }}>{p.client || '—'}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                          <div className="prog-track" style={{ flex: 1, height: 3 }}><div className="prog-fill" style={{ width: p.avancement + '%', background: p.color || undefined }} /></div>
                          <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--t4)' }}>{p.avancement}%</span>
                        </div>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {COLS.map(c => (
                            <button key={c.key} onClick={e => { e.stopPropagation(); updateProject(p.id, { kanbanStatus: c.key }) }} style={{ flex: 1, padding: '3px 0', borderRadius: 6, border: '1px solid var(--border-card)', background: (p.kanbanStatus || 'todo') === c.key ? col.color + '18' : 'transparent', cursor: 'pointer', fontSize: 9, fontWeight: 700, color: (p.kanbanStatus || 'todo') === c.key ? col.color : 'var(--t4)', fontFamily: 'var(--f)', transition: 'all .12s' }}>{c.label}</button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {colProjects.length === 0 && (
                      <div style={{ padding: '20px 10px', textAlign: 'center', fontSize: 11, color: 'var(--t4)' }}>Aucun projet</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )
      })()}

      {/* Split view */}
      {viewMode === 'liste' && <div className="split" style={{ marginTop: 0, height: 'calc(100vh - var(--topbar-h) - 140px)' }}>
        <div className="split-left">
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
            <input placeholder="Rechercher un projet..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '8px 14px', border: '1px solid var(--border-card)', borderRadius: 8, fontSize: 13, fontFamily: 'var(--f)', background: 'transparent', outline: 'none', color: 'var(--tx)' }} />
          </div>
          {filtered.map(p => (
            <div key={p.id} className="list-item" style={{ background: selected?.id === p.id ? 'var(--s2)' : undefined }} onClick={() => setSelectedId(p.id)}>
              {p.img ? (
                <img src={p.img} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: 8, background: p.status === 'archived' ? 'var(--s2)' : (p.color || '#F59E0B') + '10', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {p.status !== 'archived' ? <AoGear size={16} color={p.color || '#F59E0B'} /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--t4)' }} />}
                </div>
              )}
              <div className="list-item-body">
                <div className="list-item-title">{p.nom}</div>
                <div className="list-item-sub">{p.client}{p.type ? ' à ' + p.type : ''}</div>
              </div>
              <div className="list-item-right">
                <span className="status-pill status-active" style={{ fontSize: 10 }}>{PHASE_LABELS[normalizePhase(p.phase)] || p.phase}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <div className="prog-track" style={{ width: 50, height: 3 }}><div className="prog-fill" style={{ width: p.avancement + '%', background: p.color || undefined }} /></div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: p.color || 'var(--tx)' }}>{p.avancement}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right — detail */}
        <div className="split-right">
          {allProjets.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4, opacity: .4 }}><HardHat size={28} /></div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Votre portefeuille est vide</div>
              <div style={{ fontSize: 12, color: 'var(--t3)' }}>Créez votre premier projet pour commencer.</div>
              <NewProjectButton onOpen={() => setShowCreateProject(true)} context="empty-state" style={{ marginTop: 4 }} />
            </div>
          ) : !selected ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <DSEmptyState icon={<HardHat size={24}/>} title="Sélectionnez un projet" description="Choisissez un projet dans la liste pour voir le dûtail." />
            </div>
          ) : (
            <div>
              {/* Hero image */}
              {selected.img && (
                <div style={{ position: 'relative', height: 160, borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
                  <img src={selected.img} alt={selected.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,.65))' }} />
                  <div style={{ position: 'absolute', bottom: 16, left: 24, right: 24 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-.4px' }}>{selected.nom}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.75)', marginTop: 3 }}>{selected.type} à {selected.adresse}</div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button className="btn btn-sm" onClick={() => openEdit('projet')}>Editer</button>
                <button className="btn btn-sm" onClick={() => onNavigate && onNavigate('chantier')}>Suivi chantier →</button>
                <button className="btn btn-sm" onClick={() => onNavigate && onNavigate('documents')}>Documents</button>
              </div>

              {/* KPI row */}
              <div className="rg-4" style={{ gap: 12, marginBottom: 20 }}>
                {[['Budget', selected.budget ? fmtMoney(parseBgt(selected.budget)) : '—'], ['Phase', selected.phase], ['Avancement', selected.avancement + '%'], ['Livraison', formatDateFR(selected.livraison)]].map(([l, v]) => (
                  <div key={l} className="card" style={{ padding: '14px 16px' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: 'var(--t4)', marginBottom: 5 }}>{l}</div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Phases de mission stepper — aligné sur CHANTIER_PHASES du suivi de chantier */}
              {(() => {
                const taskStates = store.taskStates || {}
                const getState = (taskId) => taskStates[selected.id + '_' + taskId] || taskStates['_' + taskId] || 'todo'

                // Calcul du taux de complétion par phase depuis les états réels des tâches
                const phaseStats = CHANTIER_PHASES.map(ph => {
                  const done = ph.tasks.filter(t => getState(t.id) === 'done').length
                  return { name: ph.name, done, total: ph.tasks.length }
                })

                // Phase active : première phase non terminée ; fallback sur avancement si aucune tâche cochée
                const hasTaskData = phaseStats.some(ph => ph.done > 0)
                let activeIdx = 0
                if (hasTaskData) {
                  activeIdx = phaseStats.findIndex(ph => ph.done < ph.total)
                  if (activeIdx === -1) activeIdx = phaseStats.length - 1
                } else {
                  const totalTasks = phaseStats.reduce((s, p) => s + p.total, 0) || 1
                  let cum = 0
                  for (let i = 0; i < phaseStats.length; i++) {
                    cum += phaseStats[i].total
                    if ((selected.avancement || 0) < (cum / totalTasks) * 100) { activeIdx = i; break }
                    activeIdx = i
                  }
                }

                const steps = phaseStats.map((ph, i) => ({
                  label: ph.name,
                  done: i < activeIdx || (i === activeIdx && ph.done === ph.total && ph.total > 0),
                  current: i === activeIdx && !(ph.done === ph.total && ph.total > 0),
                }))
                const progressPct = selected.avancement || 0

                return (
                  <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 14 }}>Phases de mission</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 14, left: 20, right: 20, height: 2, background: 'var(--s3)' }} />
                      <div style={{ position: 'absolute', top: 14, left: 20, height: 2, background: selected.color || 'linear-gradient(90deg, #F59E0B, #FBBF24)', width: Math.min(progressPct, 100) + '%', maxWidth: 'calc(100% - 40px)', transition: 'width .6s', borderRadius: 2 }} />
                      {steps.map((e, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1, flex: 1 }}>
                          <div style={{
                            width: e.current ? 32 : 24, height: e.current ? 32 : 24, borderRadius: '50%',
                            background: e.done ? (selected.color || 'var(--tx)') : e.current ? '#fff' : 'var(--surface-1)',
                            border: e.done ? 'none' : e.current ? '2px solid ' + (selected.color || 'var(--tx)') : '1.5px solid var(--s3)',
                            boxShadow: e.current ? '0 0 0 5px rgba(29,29,31,.08)' : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .3s'
                          }}>
                            {e.done
                              ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                              : e.current ? <div style={{ width: 8, height: 8, borderRadius: '50%', background: selected.color || 'var(--tx)' }} /> : null}
                          </div>
                          <div style={{ fontSize: 9, fontWeight: e.current ? 800 : e.done ? 700 : 400, color: e.done || e.current ? (selected.color || 'var(--tx)') : 'var(--t4)', textTransform: 'uppercase', textAlign: 'center', lineHeight: 1.2, maxWidth: 70 }}>{e.label}</div>
                          <div style={{ fontSize: 8, fontWeight: 700, color: e.done ? 'var(--ok)' : e.current ? (selected.color || '#F59E0B') : 'var(--t4)' }}>
                            {e.done ? <><Check size={8}/> Terminé</> : e.current ? 'En cours' : 'À venir'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
              {/* Timeline financiére */}
              {(() => {
                const projectOrders = (store.paymentOrders || []).filter(o => o.projectId === selected.id)
                const proofs = (store.proofDocuments || []).filter(d => projectOrders.some(o => o.id === d.payoutRequestId))
                if (projectOrders.length === 0) return (
                  <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 14 }}>Timeline financiére</div>
                    <div style={{ textAlign: 'center', padding: '8px 0 14px' }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}><Wallet size={18} color="var(--t3)"/></div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>Aucun flux financier</div>
                      <div style={{ fontSize: 11, color: 'var(--t4)', lineHeight: 1.5, maxWidth: 320, margin: '0 auto 14px' }}>La timeline se remplit automatiquement à partir de vos marchés et paiements. Créez un marché pour lancer le suivi financier.</div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                        <button className="btn btn-sm" style={{ fontSize: 11 }} onClick={() => onNavigate && onNavigate('finance')}>Voir la finance</button>
                      </div>
                    </div>
                    <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 12, marginTop: 4 }}>
                      <div style={{ fontSize: 10, color: 'var(--t4)', lineHeight: 1.6 }}>
                        <strong>Comment ça marche :</strong> Acceptez une offre → un marché est créé → les paiements et échéances alimentent cette timeline.
                      </div>
                    </div>
                  </div>
                )
                return (
                  <div className="card" style={{ padding: 20, marginBottom: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 12 }}>Timeline financiére</div>
                    {projectOrders.map(o => (
                      <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                        <PaymentBadge status={o.status} size="small" />
                        <div style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{o.type === 'marche' ? 'Marché' : o.type === 'milestone' ? 'Milestone' : 'Paiement'}</div>
                        <div style={{ fontSize: 12, fontWeight: 700 }}>{fmtMoney(o.amountGross || 0)}</div>
                      </div>
                    ))}
                    {proofs.length > 0 && (
                      <div style={{ marginTop: 10, fontSize: 10, color: 'var(--t4)' }}>{proofs.length} preuve(s) dûposée(s)</div>
                    )}
                  </div>
                )
              })()}

              {/* Marchés rattachés */}
              {(() => {
                const projMarkets = (store.markets || []).filter(m => m.projectId === selected.id)
                return (
                  <div className="card" style={{ padding: 0, marginBottom: 20, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>Marchés ({projMarkets.length})</div>
                      <button className="btn btn-sm" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => onNavigate && onNavigate('marches')}>Voir tout →</button>
                    </div>
                    {projMarkets.length === 0 ? (
                      <div style={{ padding: '16px 18px', fontSize: 12, color: 'var(--t4)', textAlign: 'center' }}>Aucun marché — acceptez une offre pour créer un marché</div>
                    ) : projMarkets.slice(0, 3).map(m => (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.statut === 'livre' ? 'var(--ok)' : m.statut === 'en_cours' ? 'var(--wrn)' : 'var(--tx)', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{m.lot || m.titre || 'Marché'}</div>
                          <div style={{ fontSize: 10.5, color: 'var(--t3)' }}>{m.entreprise || '—'} à {m.amount ? fmtMoney(m.amount) : '—'}</div>
                        </div>
                        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: m.statut === 'livre' ? 'rgba(52,199,89,.08)' : 'rgba(255,149,0,.08)', color: m.statut === 'livre' ? 'var(--ok)' : 'var(--wrn)' }}>{m.statut || m.status}</span>
                      </div>
                    ))}
                  </div>
                )
              })()}

              {/* Documents rattachés */}
              {(() => {
                const projDocs = (store.documents || []).filter(d => d.projectId === selected.id)
                return (
                  <div className="card" style={{ padding: 0, marginBottom: 20, overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>Documents ({projDocs.length})</div>
                      <button className="btn btn-sm" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => onNavigate && onNavigate('documents')}>Voir tout →</button>
                    </div>
                    {projDocs.length === 0 ? (
                      <div style={{ padding: '16px 18px', fontSize: 12, color: 'var(--t4)', textAlign: 'center' }}>Aucun document</div>
                    ) : projDocs.slice(0, 4).map(d => (
                      <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                        <FileText size={14}/>
                        <div style={{ flex: 1, fontWeight: 600 }}>{d.name || d.nom}</div>
                        <span style={{ fontSize: 10, color: 'var(--t4)' }}>{d.type}</span>
                      </div>
                    ))}
                  </div>
                )
              })()}

              {/* Equipe + Notes */}
              <div className="two-col">
                {/* Equipe */}
                <div className="card">
                  <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="card-title">Equipe ({(selected.equipe || []).length})</div>
                    {!isClientUser && <button className="btn btn-sm" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => openEdit('equipe')}>+ Ajouter</button>}
                  </div>
                  <div className="card-body" style={{ padding: 0 }}>
                    {(selected.equipe || []).length === 0 && (
                      <div style={{ padding: '20px 18px', fontSize: 12, color: 'var(--t4)', textAlign: 'center', lineHeight: 1.5 }}>
                        Aucun membre dans l'équipe
                        {!((store.onboardingData?.cockpitTeam?.length > 0) || (store.intervenants?.length > 0)) && (
                          <div style={{ marginTop: 6, fontSize: 11, color: 'var(--t5)' }}>Complétez les informations de votre entreprise pour structurer votre équipe projet.</div>
                        )}
                      </div>
                    )}
                    {(selected.equipe || []).map((m, i) => {
                      const initials = (m.nom || "").split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                      const photo = getMemberPhoto(m.nom, store)
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '10px 18px', borderBottom: '1px solid var(--border)', transition: 'background .1s' }}>
                          {photo ? (
                            <img src={photo} alt="" style={{ width: 36, height: 36, borderRadius: 9, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
                          ) : (
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--t2)', flexShrink: 0 }}>{initials}</div>
                          )}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600 }}>{m.nom}</div>
                            <div style={{ fontSize: 11, color: 'var(--t3)' }}>{m.role}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 100, background: statusColor(m.statut) + '18', color: statusColor(m.statut) }}>{m.statut}</span>
                            <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 100, background: 'var(--s2)', color: accessColor(m.access) }}>{ACCESS_LEVELS.find(a => a.id === m.access)?.label || m.access}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div className="card" style={{ padding: 18 }}>
                  <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 8 }}>Notes</div>
                  <div style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.65 }}>{selected.notes || '—'}</div>
                  <button className="btn btn-sm" style={{ fontSize: 10, padding: '3px 8px', marginTop: 10 }} onClick={() => openEdit('notes')}>Modifier</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>}

      {/*•• MODAL: Editer Projet •• */}
      {editModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setEditModal(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 620, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: '20px 22px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-.5px' }}>{editSection === 'projet' ? 'Editer le projet' : editSection === 'equipe' ? 'Gestion de l\'equipe' : 'Notes du projet'}</div>
                <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{editModal.nom}</div>
              </div>
              <button onClick={() => setEditModal(null)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t3)' }}>×</button>
            </div>

            {/* Section tabs */}
            <div style={{ display: 'flex', gap: 4, padding: '12px 22px', borderBottom: '1px solid var(--border)' }}>
              {[['projet', 'Informations'], ['equipe', 'Equipe (' + editModal.equipe.length + ')'], ['notes', 'Notes']].map(([k, l]) => (
                <button key={k} className={`filter-pill ${editSection === k ? 'active' : ''}`} onClick={() => setEditSection(k)}>{l}</button>
              ))}
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>

              {/* ── Section: Projet ── */}
              {editSection === 'projet' && (<>
                <div><label className="form-label">Nom du projet</label><input className="form-input" value={editModal.nom} onChange={e => setEditModal(p => ({ ...p, nom: e.target.value }))} /></div>
                <div className="modal-row">
                  <div><label className="form-label">Client</label><input className="form-input" value={editModal.client} onChange={e => setEditModal(p => ({ ...p, client: e.target.value }))} /></div>
                  <div><label className="form-label">Type</label>
                    <select className="form-input" value={editModal.type || ''} onChange={e => setEditModal(p => ({ ...p, type: e.target.value }))}>
                      {['Maison / Villa', 'Magasin / Activité', 'Usage mixte', 'Bureaux / Entreprise', 'Autre'].map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="modal-row">
                  <div><label className="form-label">Phase</label>
                    <select className="form-input" value={editModal.phase} onChange={e => setEditModal(p => ({ ...p, phase: e.target.value }))}>
                      {[['ESQUISSE','Esquisse'],['AVANT_PROJET','Avant-projet'],['PROJET_DETAILLE','Projet dûtaillé'],['PLANS_EXECUTION','Plans d\'exécution'],['CONSULTATION_ENTREPRISES','Consultation des entreprises'],['ATTRIBUTION_MARCHES','Attribution des marchés'],['SUIVI_CHANTIER','Suivi de chantier'],['RECEPTION','Réception du projet']].map(([k,l]) => <option key={k} value={k}>{l}</option>)}
                    </select>
                  </div>
                  <div><label className="form-label">Priorité</label>
                    <select className="form-input" value={editModal.priorite || 'Normale'} onChange={e => setEditModal(p => ({ ...p, priorite: e.target.value }))}>
                      {['Haute', 'Normale', 'Basse'].map(pr => <option key={pr}>{pr}</option>)}
                    </select>
                  </div>
                </div>
                <div className="modal-row">
                  <div><label className="form-label">Budget (FCFA)</label><MoneyInput value={editModal.budget} onChange={v => setEditModal(p => ({ ...p, budget: v }))} placeholder="100 000 000" /></div>
                  <div><label className="form-label">Livraison</label><input className="form-input" type="date" value={editModal.livraison || ''} onChange={e => setEditModal(p => ({ ...p, livraison: e.target.value }))} /></div>
                </div>
              </>)}

              {/* ── Section: Equipe ── */}
              {editSection === 'equipe' && (<>
                {/* Sub-sections: internal team + external */}
                {(() => {
                  const interne = (editModal.equipe || []).filter(m => m.type !== 'externe')
                  const externe = (editModal.equipe || []).filter(m => m.type === 'externe')
                  const renderMember = (m, idx) => {
                    const initials = (m.nom || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                    const mPhoto = getMemberPhoto(m.nom, store)
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--s2)', borderRadius: 10, border: '1px solid var(--border-card)' }}>
                        {mPhoto ? (
                          <img src={mPhoto} alt="" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
                        ) : (
                          <div style={{ width: 34, height: 34, borderRadius: 8, background: m.type === 'externe' ? 'rgba(37,99,235,.08)' : 'var(--surface-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: m.type === 'externe' ? '#2563EB' : 'var(--t2)', flexShrink: 0 }}>{initials}</div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600 }}>{m.nom}</div>
                          <div style={{ fontSize: 10.5, color: 'var(--t3)' }}>{m.role}{m.entreprise ? ' à ' + m.entreprise : ''}</div>
                        </div>
                        {m.type === 'externe' && <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 100, background: 'rgba(37,99,235,.08)', color: '#2563EB' }}>Externe</span>}
                        <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 100, background: statusColor(m.statut) + '18', color: statusColor(m.statut) }}>{m.statut}</span>
                        <button className="btn btn-sm" style={{ fontSize: 9, padding: '2px 7px' }} onClick={() => setEditMember({ idx, member: { ...m } })}>Modifier</button>
                        <button style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid rgba(220,38,38,.2)', background: 'rgba(220,38,38,.06)', color: 'var(--err)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }} onClick={() => removeMember(idx)}>×</button>
                      </div>
                    )
                  }
                  return (<>
                    {/* Mon équipe interne */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Mon équipe</div>
                        <div style={{ fontSize: 10.5, color: 'var(--t4)' }}>{interne.length} membre{interne.length > 1 ? 's' : ''} de ma structure</div>
                      </div>
                      {!isClientUser && <button className="btn btn-sm" style={{ fontSize: 10, padding: '4px 10px' }} onClick={() => { setAddMemberModal(true); setMemberTab('existant'); setMemberSearch('') }}>+ Depuis mon équipe</button>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {interne.map((m, idx) => renderMember(m, (editModal.equipe || []).indexOf(m)))}
                      {interne.length === 0 && <div style={{ fontSize: 11.5, color: 'var(--t4)', padding: '12px 8px', background: 'var(--s2)', borderRadius: 8, textAlign: 'center' }}>Aucun membre de votre structure affecté à ce projet</div>}
                    </div>

                    {/* Séparateur */}
                    <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />

                    {/* Intervenants externes */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>Intervenants</div>
                        <div style={{ fontSize: 10.5, color: 'var(--t4)' }}>{externe.length} intervenant{externe.length > 1 ? 's' : ''} externe{externe.length > 1 ? 's' : ''}</div>
                      </div>
                      {!isClientUser && <button className="btn btn-primary btn-sm" style={{ fontSize: 10, padding: '4px 10px' }} onClick={() => { setAddMemberModal(true); setMemberTab('nouveau'); setMemberSearch('') }}>+ Intervenant</button>}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {externe.map((m, idx) => renderMember(m, (editModal.equipe || []).indexOf(m)))}
                      {externe.length === 0 && <div style={{ fontSize: 11.5, color: 'var(--t4)', padding: '12px 8px', background: 'var(--s2)', borderRadius: 8, textAlign: 'center' }}>Aucun intervenant externe sur ce projet</div>}
                    </div>
                  </>)
                })()}
              </>)}

              {/* ── Section: Notes ── */}
              {editSection === 'notes' && (<>
                <div><label className="form-label">Notes du projet</label><textarea className="form-input" rows="5" value={editModal.notes || ''} onChange={e => setEditModal(p => ({ ...p, notes: e.target.value }))} placeholder="Contexte, objectifs, points de vigilance..." /></div>
              </>)}

            </div>

            {/* Footer */}
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 6 }}>
                <button style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--s2)', border: '1px solid var(--border-card)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', color: 'var(--t3)' }} onClick={() => setArchiveConfirm({ id: editModal.id, nom: editModal.nom })}>Archiver</button>
                <button style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(255,59,48,.04)', border: '1px solid rgba(255,59,48,.15)', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', color: 'var(--err)' }} onClick={() => {
                  const hasData = (store.markets || []).some(m => m.projectId === editModal.id) || (store.documents || []).some(d => d.projectId === editModal.id) || (store.paymentOrders || []).some(o => o.projectId === editModal.id)
                  setDeleteConfirm({ id: editModal.id, nom: editModal.nom, hasData })
                }}>Supprimer</button>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <button className="btn btn-sm" onClick={() => setEditModal(null)}>Annuler</button>
                <button className="btn btn-primary btn-sm" onClick={saveEdit}>Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirmer suppression */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2100, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .15s ease' }} onClick={() => setDeleteConfirm(null)}>
          <div style={{ background: '#fff', borderRadius: 16, width: 420, boxShadow: '0 24px 80px rgba(0,0,0,.2)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px 24px 16px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,59,48,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF3B30" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Supprimer ce projet ?</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.55 }}>
                {deleteConfirm.hasData
                  ? <><strong style={{ color: '#FF3B30' }}>Attention :</strong> Ce projet contient des données (marchés, documents ou paiements). Cette action est dûfinitive.</>
                  : 'Cette action est dûfinitive. Le projet sera retiré de votre portefeuille.'
                }
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#111', marginTop: 8 }}>« {deleteConfirm.nom} »</div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(0,0,0,.06)', display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '11px 16px', borderRadius: 10, background: 'var(--surface-1)', color: 'var(--t3)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>Annuler</button>
              <button onClick={() => {
                deleteProject(deleteConfirm.id)
                setDeleteConfirm(null); setEditModal(null); setSelectedId(null)
              }} style={{ flex: 1, padding: '11px 16px', borderRadius: 10, background: '#FF3B30', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>Confirmer la suppression</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Confirmer archivage */}
      {archiveConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2100, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .15s ease' }} onClick={() => setArchiveConfirm(null)}>
          <div style={{ background: '#fff', borderRadius: 16, width: 400, boxShadow: '0 24px 80px rgba(0,0,0,.2)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '24px 24px 16px', textAlign: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(0,0,0,.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><path d="M21 8v13H3V8"/><path d="M1 3h22v5H1z"/><path d="M10 12h4"/></svg>
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>Archiver ce projet ?</div>
              <div style={{ fontSize: 13, color: '#666', lineHeight: 1.55 }}>Le projet sera retiré de la liste active et dûplacé dans les archives. Vous pourrez le consulter depuis la section Archivés.</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#111', marginTop: 8 }}>« {archiveConfirm.nom} »</div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(0,0,0,.06)', display: 'flex', gap: 10 }}>
              <button onClick={() => setArchiveConfirm(null)} style={{ flex: 1, padding: '11px 16px', borderRadius: 10, background: 'var(--surface-1)', color: 'var(--t3)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>Annuler</button>
              <button onClick={() => {
                archiveProject(archiveConfirm.id)
                setArchiveConfirm(null); setEditModal(null); setSelectedId(null)
              }} style={{ flex: 1, padding: '11px 16px', borderRadius: 10, background: 'var(--tx)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>Archiver</button>
            </div>
          </div>
        </div>
      )}

      {/*•• MODAL: Ajouter un membre •• */}
      {addMemberModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2100, background: 'rgba(0,0,0,.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .15s ease' }} onClick={() => setAddMemberModal(false)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, width: 480, maxHeight: '70vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 20px 14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 700 }}>Ajouter un membre</div>
                <button onClick={() => setAddMemberModal(false)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--t3)' }}>×</button>
              </div>
              {/* Tabs */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                {[['existant', 'Mon équipe'], ['nouveau', 'Nouveau membre'], ['externe', 'Intervenant externe']].map(([k, l]) => (
                  <button key={k} className={`filter-pill ${memberTab === k ? 'active' : ''}`} onClick={() => setMemberTab(k)}>{l}</button>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid var(--border)' }}>
              {/* Tab: Mon équipe — sâlectionner depuis toutes les sources de l'environnement */}
              {memberTab === 'existant' && (
                <div>
                  <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>Recherchez parmi vos collaborateurs et intervenants dûjé enregistrès dans votre environnement MEEREO.</div>
                    <input placeholder="Rechercher par nom, métier, rôle..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} style={{ ...inputStyle, padding: '8px 12px' }} />
                  </div>
                  {(() => {
                    // Agrâger depuis TOUTES les sources de l'environnement
                    const seen = new Set((editModal.equipe || []).map(e => e.nom))
                    const all = []

                    // 1. équipe cockpit (onboarding / paramètres)
                    ;(store.onboardingData?.cockpitTeam || []).forEach(t => {
                      if (t.nom && !seen.has(t.nom)) { seen.add(t.nom); all.push({ ...t, source: 'equipe' }) }
                    })
                    // 2. Intervenants ajoutés via le store (ajouts manuels précédents)
                    ;(store.intervenants || []).forEach(i => {
                      if (i.nom && !seen.has(i.nom)) { seen.add(i.nom); all.push({ nom: i.nom, role: i.role || i.mission || '', email: i.email || '', tel: i.tel || '', source: 'intervenant' }) }
                    })
                    // 3. Membres d'autres projets (réutilisation cross-projet)
                    ;(store.projects || []).forEach(p => {
                      if (p.id === editModal?.id) return
                      ;(p.equipe || []).forEach(m => {
                        if (m.nom && !seen.has(m.nom)) { seen.add(m.nom); all.push({ nom: m.nom, role: m.role || '', email: m.email || '', source: 'projet' }) }
                      })
                    })
                    // 4. INTERVENANTS_DATA (mock statique, fallback)
                    INTERVENANTS_DATA.forEach(i => {
                      if (i.nom && !seen.has(i.nom)) { seen.add(i.nom); all.push({ ...i, source: 'intervenant' }) }
                    })

                    const q = memberSearch.toLowerCase()
                    const filtered = q ? all.filter(m => ((m.nom || '') + (m.role || '') + (m.email || '') + (m.entreprise || '')).toLowerCase().includes(q)) : all
                    if (filtered.length === 0) return (
                      <div style={{ padding: '28px 20px', textAlign: 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>Aucun résultat</div>
                        <div style={{ fontSize: 11.5, color: 'var(--t4)', marginBottom: 14 }}>{memberSearch ? `Aucun membre trouvé pour "${memberSearch}".` : 'Votre équipe est vide.'}</div>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          <button className="btn btn-sm" onClick={() => setMemberTab('nouveau')}>Créer un membre</button>
                          <button className="btn btn-primary btn-sm" onClick={() => setMemberTab('externe')}>Ajouter un intervenant</button>
                        </div>
                      </div>
                    )
                    return filtered.map((m, i) => {
                      const initials = (m.nom || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .1s' }} onClick={() => addExistingMember(m)} onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'} onMouseOut={e => e.currentTarget.style.background = ''}>
                          <div style={{ width: 36, height: 36, borderRadius: 9, background: m.source === 'equipe' ? 'rgba(124,58,237,.06)' : 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: m.source === 'equipe' ? '#7C3AED' : 'var(--t2)', flexShrink: 0 }}>{initials}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{m.nom}</div>
                            <div style={{ fontSize: 11, color: 'var(--t3)' }}>{m.role || m.poste || ''}</div>
                          </div>
                          <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 100, background: m.source === 'equipe' ? 'rgba(124,58,237,.06)' : m.source === 'projet' ? 'rgba(22,163,74,.06)' : 'var(--s2)', color: m.source === 'equipe' ? '#7C3AED' : m.source === 'projet' ? '#16A34A' : 'var(--t4)' }}>{m.source === 'equipe' ? 'équipe' : m.source === 'projet' ? 'Autre projet' : 'Intervenant'}</span>
                        </div>
                      )
                    })
                  })()}
                </div>
              )}

              {/* Tab: Nouveau membre interne */}
              {memberTab === 'nouveau' && (
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--t3)', padding: '8px 12px', background: 'var(--s2)', borderRadius: 8, lineHeight: 1.5 }}>Ce membre sera ajouté à votre équipe interne et affecté à ce projet.</div>
                  <div><label className="form-label">Nom complet *</label><input className="form-input" value={newMember.nom} onChange={e => setNewMember(p => ({ ...p, nom: e.target.value }))} placeholder="Prénom Nom" /></div>
                  <div><label className="form-label">Poste / Rôle</label><input className="form-input" value={newMember.role} onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))} placeholder="Chef de projet, Architecte..." /></div>
                  <div className="modal-row">
                    <div><label className="form-label">Email</label><input className="form-input" type="email" value={newMember.email} onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))} /></div>
                    <div><label className="form-label">Téléphone</label><input className="form-input" value={newMember.tel} onChange={e => setNewMember(p => ({ ...p, tel: e.target.value }))} /></div>
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end', marginTop: 4 }} disabled={!newMember.nom?.trim()} onClick={addNewMember}>Ajouter à l'équipe</button>
                </div>
              )}

              {/* Tab: Intervenant externe */}
              {memberTab === 'externe' && (
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--t3)', padding: '8px 12px', background: 'rgba(37,99,235,.04)', borderRadius: 8, lineHeight: 1.5, border: '1px solid rgba(37,99,235,.08)' }}>Les intervenants externes sont des partenaires, prestataires ou structures qui interviennent sur ce projet.</div>
                  <div><label className="form-label">Nom / Structure *</label><input className="form-input" value={newMember.nom} onChange={e => setNewMember(p => ({ ...p, nom: e.target.value }))} placeholder="Ex: BET Sigma, Entreprise Koné..." /></div>
                  <div className="modal-row">
                    <div><label className="form-label">Métier / Rôle *</label>
                      <select className="form-input" value={newMember.role} onChange={e => setNewMember(p => ({ ...p, role: e.target.value }))}>
                        <option value="">Choisir un métier</option>
                        {['Architecte','BET Structure','BET Fluides','Bureau de contrôle','Entreprise construction','Sous-traitant','Fournisseur','OPC','AMO','économiste','Géomètre','Paysagiste','Designer intérieur','Autre'].map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div><label className="form-label">Personne de contact</label><input className="form-input" value={newMember.contact || ''} onChange={e => setNewMember(p => ({ ...p, contact: e.target.value }))} placeholder="Nom du contact" /></div>
                  </div>
                  <div className="modal-row">
                    <div><label className="form-label">Email</label><input className="form-input" type="email" value={newMember.email} onChange={e => setNewMember(p => ({ ...p, email: e.target.value }))} /></div>
                    <div><label className="form-label">Téléphone</label><input className="form-input" value={newMember.tel} onChange={e => setNewMember(p => ({ ...p, tel: e.target.value }))} /></div>
                  </div>
                  <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end', marginTop: 4 }} disabled={!newMember.nom?.trim() || !newMember.role} onClick={() => {
                    if (!newMember.nom?.trim() || !newMember.role) return
                    setEditModal(prev => ({ ...prev, equipe: [...(prev.equipe || []), { nom: newMember.nom, role: newMember.role, entreprise: newMember.nom, contact: newMember.contact || '', email: newMember.email || '', tel: newMember.tel || '', statut: 'actif', access: 'lecture', type: 'externe' }] }))
                    setNewMember({ nom: '', role: '', email: '', tel: '', contact: '' })
                    setAddMemberModal(false)
                  }}>Ajouter l'intervenant</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/*•• MODAL: Modifier membre •• */}
      {editMember && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2200, background: 'rgba(0,0,0,.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .15s ease' }} onClick={() => setEditMember(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,.15)', padding: 22 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Modifier — {editMember.member.nom}</div>
              <button onClick={() => setEditMember(null)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--t3)' }}>×</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label className="form-label">Role dans le projet</label><input className="form-input" value={editMember.member.role} onChange={e => setEditMember(p => ({ ...p, member: { ...p.member, role: e.target.value } }))} /></div>
              <div><label className="form-label">Niveau d'acces</label>
                <select className="form-input" value={editMember.member.access} onChange={e => setEditMember(p => ({ ...p, member: { ...p.member, access: e.target.value } }))}>
                  {ACCESS_LEVELS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </select>
              </div>
              <div><label className="form-label">Statut</label>
                <select className="form-input" value={editMember.member.statut} onChange={e => setEditMember(p => ({ ...p, member: { ...p.member, statut: e.target.value } }))}>
                  {MEMBER_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn btn-sm" onClick={() => setEditMember(null)}>Annuler</button>
                <button className="btn btn-primary btn-sm" onClick={saveEditMember}>Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
      <ProjetModal isOpen={showCreateProject} onClose={() => setShowCreateProject(false)} showToast={showToast} />
    </div>
  )
}

