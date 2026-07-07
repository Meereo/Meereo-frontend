import { useState, useMemo, useCallback } from 'react'
import Modal from '../../components/shared/Modal'
import { useMeereo } from '../../hooks/useMeereoStore'
import { DSPageHeader, DSEmptyState } from '../../design/components'
import {
  MISSION_TYPES, MISSION_TYPE_LABELS, MISSION_TYPE_ICONS, MISSION_TYPE_RESPONSIBLE,
  MISSION_STATUS, MISSION_STATUS_LABELS, MISSION_STATUS_COLORS,
  buildInitialJalons,
} from '../../domain/status'

// ── Filtres ──
const FILTERS = [
  { key: 'all', label: 'Toutes' },
  { key: 'active', label: 'En cours' },
  { key: 'pending', label: 'En attente' },
  { key: 'done', label: 'Terminées' },
]

const ACTIVE_STATUSES = new Set(['accepted', 'in_preparation', 'in_progress', 'pending_validation'])
const PENDING_STATUSES = new Set(['created', 'invitation_sent'])
const DONE_STATUSES = new Set(['validated', 'completed', 'archived'])

function filterMissions(missions, filter) {
  if (filter === 'all') return missions
  if (filter === 'active') return missions.filter(m => ACTIVE_STATUSES.has(m.status))
  if (filter === 'pending') return missions.filter(m => PENDING_STATUSES.has(m.status))
  if (filter === 'done') return missions.filter(m => DONE_STATUSES.has(m.status))
  return missions
}

// ── Status Badge ──
function StatusBadge({ status }) {
  const label = MISSION_STATUS_LABELS[status] || status
  const color = MISSION_STATUS_COLORS[status] || 'var(--t4)'
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 6,
      fontSize: 11, fontWeight: 600, background: color + '18', color,
      whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

// ── Progress Bar ──
function ProgressBar({ value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--s2)', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', borderRadius: 3, background: value >= 100 ? 'var(--ok)' : 'var(--blue)', transition: 'width .3s' }} />
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', minWidth: 32, textAlign: 'right' }}>{value}%</span>
    </div>
  )
}

// ── Mission Card ──
function MissionCard({ mission, project, onSelect }) {
  const icon = MISSION_TYPE_ICONS[mission.type] || '📋'
  const typeLabel = MISSION_TYPE_LABELS[mission.type] || mission.type
  return (
    <div
      onClick={() => onSelect(mission)}
      style={{
        background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12,
        padding: 16, cursor: 'pointer', transition: 'box-shadow .15s',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,.06)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mission.title}</div>
          <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>{typeLabel}</div>
        </div>
        <StatusBadge status={mission.status} />
      </div>
      {mission.responsibleName && (
        <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 6 }}>
          Responsable : <span style={{ fontWeight: 600, color: 'var(--tx)' }}>{mission.responsibleName}</span>
        </div>
      )}
      {project && (
        <div style={{ fontSize: 11, color: 'var(--t4)', marginBottom: 8 }}>
          Projet : {project.nom || project.name}
        </div>
      )}
      <ProgressBar value={mission.avancement || 0} />
    </div>
  )
}

// ── Jalon Stepper ──
function JalonStepper({ jalons, onToggle, readOnly }) {
  const statusIcons = { not_started: '○', in_progress: '◐', completed: '●', validated: '✓' }
  const statusColors = { not_started: 'var(--t4)', in_progress: 'var(--blue)', completed: 'var(--ok)', validated: 'var(--ok)' }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {jalons.map((j, i) => (
        <div key={j.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 24 }}>
            <button
              disabled={readOnly}
              onClick={() => !readOnly && onToggle(i)}
              style={{
                width: 24, height: 24, borderRadius: '50%', border: '2px solid ' + (statusColors[j.status] || 'var(--t4)'),
                background: j.status === 'completed' || j.status === 'validated' ? statusColors[j.status] : 'transparent',
                color: j.status === 'completed' || j.status === 'validated' ? '#fff' : statusColors[j.status],
                fontSize: 12, fontWeight: 600, cursor: readOnly ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >{statusIcons[j.status] || '○'}</button>
            {i < jalons.length - 1 && <div style={{ width: 2, height: 24, background: 'var(--border)' }} />}
          </div>
          <div style={{ paddingBottom: i < jalons.length - 1 ? 12 : 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: j.status === 'completed' || j.status === 'validated' ? 'var(--ok)' : 'var(--tx)' }}>{j.title}</div>
            <div style={{ fontSize: 11, color: 'var(--t4)' }}>
              {j.status === 'not_started' ? 'Non démarré' : j.status === 'in_progress' ? 'En cours' : j.status === 'completed' ? 'Terminé' : 'Validé'}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Create Mission Modal ──
function CreateMissionModal({ isOpen, onClose, projects, onCreate }) {
  const [step, setStep] = useState(1)
  const [type, setType] = useState('')
  const [projectId, setProjectId] = useState('')
  const [responsibleName, setResponsibleName] = useState('')
  const [responsibleEmail, setResponsibleEmail] = useState('')
  const [saving, setSaving] = useState(false)

  const reset = () => { setStep(1); setType(''); setProjectId(''); setResponsibleName(''); setResponsibleEmail(''); setSaving(false) }
  const close = () => { reset(); onClose() }

  const submit = async () => {
    if (!type || !projectId) return
    setSaving(true)
    const title = MISSION_TYPE_LABELS[type] || type
    await onCreate({ projectId, type, title, responsibleName, responsibleEmail })
    setSaving(false)
    close()
  }

  const types = Object.entries(MISSION_TYPE_LABELS)

  return (
    <Modal isOpen={isOpen} onClose={close} title="Nouvelle mission">
      {step === 1 && (
        <div>
          <label className="form-label">Type de mission</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
            {types.map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setType(key); setStep(2) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  background: type === key ? 'var(--blue-bg)' : 'var(--s1)', border: type === key ? '2px solid var(--blue)' : '1px solid var(--border)',
                  borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 20 }}>{MISSION_TYPE_ICONS[key]}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>{label}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)' }}>{MISSION_TYPE_RESPONSIBLE[key]}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 2 && (
        <div>
          <label className="form-label">Projet</label>
          <select className="form-input" value={projectId} onChange={e => setProjectId(e.target.value)} style={{ marginBottom: 16 }}>
            <option value="">Sélectionner un projet</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.nom || p.name}</option>)}
          </select>
          <label className="form-label">Responsable (optionnel)</label>
          <input className="form-input" placeholder="Nom de l'entreprise" value={responsibleName} onChange={e => setResponsibleName(e.target.value)} style={{ marginBottom: 8 }} />
          <input className="form-input" placeholder="Email du responsable" type="email" value={responsibleEmail} onChange={e => setResponsibleEmail(e.target.value)} style={{ marginBottom: 16 }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost btn-sm" onClick={() => setStep(1)}>Retour</button>
            <button className="btn btn-primary btn-sm" disabled={!projectId || saving} onClick={submit}>
              {saving ? 'Création…' : 'Créer la mission'}
            </button>
          </div>
        </div>
      )}
    </Modal>
  )
}

// ── Mission Detail Panel ──
function MissionDetail({ mission, onClose, onUpdate, onUpdateJalons }) {
  const { store } = useMeereo()
  const icon = MISSION_TYPE_ICONS[mission.type] || '📋'
  const typeLabel = MISSION_TYPE_LABELS[mission.type] || mission.type
  const project = (store.projects || []).find(p => p.id === mission.projectId)
  const isResponsible = store.user?.id === mission.responsibleUserId
  const isCreator = store.user?.id === mission.createdBy

  const jalons = Array.isArray(mission.jalons) ? mission.jalons : []

  const toggleJalon = useCallback((index) => {
    const cycle = { not_started: 'in_progress', in_progress: 'completed', completed: 'not_started' }
    const updated = jalons.map((j, i) => i === index ? { ...j, status: cycle[j.status] || 'in_progress' } : j)
    onUpdateJalons(mission.id, updated)
  }, [jalons, mission.id, onUpdateJalons])

  const canAdvance = isResponsible || isCreator
  const canValidate = isCreator || store.user?.type === 'client'

  return (
    <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 440, background: 'var(--bg)', borderLeft: '1px solid var(--border)', zIndex: 100, overflowY: 'auto', padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 24 }}>{icon}</span>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--tx)' }}>{mission.title}</div>
            <div style={{ fontSize: 12, color: 'var(--t3)' }}>{typeLabel}</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: 'var(--t3)' }}>✕</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <StatusBadge status={mission.status} />
        {project && <span style={{ fontSize: 11, color: 'var(--t4)', alignSelf: 'center' }}>• {project.nom || project.name}</span>}
      </div>

      <ProgressBar value={mission.avancement || 0} />

      {mission.responsibleName && (
        <div style={{ marginTop: 16, padding: 12, background: 'var(--s1)', borderRadius: 8, fontSize: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 2 }}>Responsable</div>
          <div style={{ color: 'var(--tx)' }}>{mission.responsibleName}</div>
          {mission.responsibleEmail && <div style={{ color: 'var(--t3)' }}>{mission.responsibleEmail}</div>}
        </div>
      )}

      {mission.description && (
        <div style={{ marginTop: 16, fontSize: 13, color: 'var(--t3)', lineHeight: 1.5 }}>{mission.description}</div>
      )}

      <div style={{ marginTop: 24, marginBottom: 12, fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>Jalons</div>
      {jalons.length > 0 ? (
        <JalonStepper jalons={jalons} onToggle={toggleJalon} readOnly={!canAdvance} />
      ) : (
        <div style={{ fontSize: 12, color: 'var(--t4)' }}>Aucun jalon défini</div>
      )}

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {mission.status === 'invitation_sent' && isResponsible && (
          <button className="btn btn-primary btn-sm" onClick={() => onUpdate(mission.id, { status: 'accepted' })}>
            Accepter la mission
          </button>
        )}
        {mission.status === 'accepted' && canAdvance && (
          <button className="btn btn-primary btn-sm" onClick={() => onUpdate(mission.id, { status: 'in_progress' })}>
            Démarrer la mission
          </button>
        )}
        {(mission.status === 'in_progress' || mission.status === 'in_preparation') && isResponsible && (
          <button className="btn btn-primary btn-sm" onClick={() => onUpdate(mission.id, { status: 'pending_validation' })}>
            Demander la validation
          </button>
        )}
        {mission.status === 'pending_validation' && canValidate && (
          <button className="btn btn-primary btn-sm" style={{ background: 'var(--ok)' }} onClick={() => onUpdate(mission.id, { status: 'validated', completedAt: new Date().toISOString() })}>
            Valider la mission
          </button>
        )}
        {mission.status === 'validated' && (isCreator || canValidate) && (
          <button className="btn btn-sm" style={{ background: 'var(--ok)', color: '#fff' }} onClick={() => onUpdate(mission.id, { status: 'completed' })}>
            Marquer comme terminée
          </button>
        )}
      </div>
    </div>
  )
}

// ── Page principale ──
export default function Missions() {
  const { store, createMission, updateMission, updateMissionJalons } = useMeereo()
  const [showCreate, setShowCreate] = useState(false)
  const [filter, setFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('')
  const [selected, setSelected] = useState(null)

  const projects = useMemo(() => (store.projects || []).filter(p => p.status === 'active'), [store.projects])

  const missions = useMemo(() => {
    let list = store.missions || []
    if (projectFilter) list = list.filter(m => m.projectId === projectFilter)
    return filterMissions(list, filter)
  }, [store.missions, filter, projectFilter])

  const projectMap = useMemo(() => {
    const map = {}
    ;(store.projects || []).forEach(p => { map[p.id] = p })
    return map
  }, [store.projects])

  const handleCreate = useCallback(async (data) => {
    const created = await createMission(data)
    if (created) setSelected(created)
  }, [createMission])

  const handleUpdate = useCallback(async (missionId, data) => {
    const updated = await updateMission(missionId, data)
    if (updated) setSelected(prev => prev?.id === missionId ? { ...prev, ...updated } : prev)
  }, [updateMission])

  const handleUpdateJalons = useCallback((missionId, jalons) => {
    updateMissionJalons(missionId, jalons)
    setSelected(prev => {
      if (!prev || prev.id !== missionId) return prev
      const completed = jalons.filter(j => j.status === 'completed' || j.status === 'validated').length
      const avancement = jalons.length ? Math.round(completed / jalons.length * 100) : 0
      return { ...prev, jalons, avancement }
    })
  }, [updateMissionJalons])

  // Counts for filter tabs
  const counts = useMemo(() => {
    const all = store.missions || []
    const filtered = projectFilter ? all.filter(m => m.projectId === projectFilter) : all
    return {
      all: filtered.length,
      active: filtered.filter(m => ACTIVE_STATUSES.has(m.status)).length,
      pending: filtered.filter(m => PENDING_STATUSES.has(m.status)).length,
      done: filtered.filter(m => DONE_STATUSES.has(m.status)).length,
    }
  }, [store.missions, projectFilter])

  return (
    <div>
      <DSPageHeader title="Missions" subtitle="Gérez les missions de vos projets" actions={
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ Nouvelle mission</button>
      } />

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select className="form-input" value={projectFilter} onChange={e => setProjectFilter(e.target.value)} style={{ width: 220, fontSize: 12 }}>
          <option value="">Tous les projets</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.nom || p.name}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 4 }}>
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: 'none',
                background: filter === f.key ? 'var(--tx)' : 'var(--s2)',
                color: filter === f.key ? '#fff' : 'var(--t3)',
                cursor: 'pointer',
              }}
            >
              {f.label} ({counts[f.key] || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Mission list */}
      {missions.length === 0 ? (
        <DSEmptyState
          icon="🎯"
          title="Aucune mission"
          description="Créez votre première mission pour structurer votre projet en étapes confiées à des professionnels."
          actionLabel="+ Nouvelle mission"
          onAction={() => setShowCreate(true)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340, 1fr))', gap: 12 }}>
          {missions.map(m => (
            <MissionCard key={m.id} mission={m} project={projectMap[m.projectId]} onSelect={setSelected} />
          ))}
        </div>
      )}

      {/* Create modal */}
      <CreateMissionModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        projects={projects}
        onCreate={handleCreate}
      />

      {/* Detail panel */}
      {selected && (
        <MissionDetail
          mission={(store.missions || []).find(m => m.id === selected.id) || selected}
          onClose={() => setSelected(null)}
          onUpdate={handleUpdate}
          onUpdateJalons={handleUpdateJalons}
        />
      )}
    </div>
  )
}
