// === FICHIER : web/src/pages/cockpit/TasksBoardPage.jsx ===
import { useState, useEffect, useCallback, useRef } from 'react'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { X, MessageSquare, Calendar, List, LayoutGrid, Plus } from 'lucide-react'
import { api } from '../../services/api/client'
import { useMeereo } from '../../hooks/useMeereoStore'
import { DSPageHeader, DSEmptyState } from '../../design/components'
import ModalConfirm from '../../components/shared/ModalConfirm'
import { formatDateFR } from '../../utils/helpers'

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const COLUMNS = [
  { id:'a_faire',    label:'À faire',      color:'var(--t4)' },
  { id:'en_cours',   label:'En cours',     color:'#007AFF' },
  { id:'en_revision',label:'En révision',  color:'#E07B00' },
  { id:'termine',    label:'Terminé',      color:'var(--ok)' },
  { id:'rejete',     label:'Rejeté',       color:'var(--err)' },
]

const PRIORITY_META = {
  urgente: { label:'Urgente', color:'var(--err)',  bg:'rgba(220,38,38,.08)' },
  haute:   { label:'Haute',   color:'#E07B00',    bg:'rgba(255,149,0,.08)' },
  normale: { label:'Normale', color:'#007AFF',    bg:'rgba(0,122,255,.07)' },
  basse:   { label:'Basse',   color:'var(--t4)',  bg:'var(--s2)' },
}

// Map old English status values to French kanban columns
const STATUS_COMPAT = {
  todo:        'a_faire',
  in_progress: 'en_cours',
  review:      'en_revision',
  done:        'termine',
  rejected:    'rejete',
}

function normalizeStatus(s) {
  return STATUS_COMPAT[s] || s || 'a_faire'
}

function PriorityBadge({ priority }) {
  const m = PRIORITY_META[priority] || PRIORITY_META.normale
  return <span style={{ fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:100, background:m.bg, color:m.color, whiteSpace:'nowrap' }}>{m.label}</span>
}

function Initials({ name, size = 24 }) {
  if (!name) return null
  const letters = name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  const colors = ['#2563EB','#7C3AED','#DC2626','#16A34A','#F59E0B','#EA580C','#0891B2']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:color+'18', border:`1.5px solid ${color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size * 0.38, fontWeight:700, color, flexShrink:0 }}>
      {letters}
    </div>
  )
}

function DueDateDisplay({ dueDate }) {
  if (!dueDate) return null
  const now = new Date()
  const due = new Date(dueDate)
  const diff = (due - now) / (1000 * 60 * 60)
  const color = diff < 0 ? 'var(--err)' : diff < 48 ? '#E07B00' : 'var(--t4)'
  return (
    <div style={{ display:'flex', alignItems:'center', gap:3, fontSize:10, color }}>
      <Calendar size={10} />
      {formatDateFR(dueDate)}
    </div>
  )
}

function Spinner({ size = 20 }) {
  return <div style={{ width:size, height:size, border:'2px solid var(--border)', borderTopColor:'var(--tx)', borderRadius:'50%', animation:'spin .6s linear infinite' }} />
}

// â”€â”€â”€ SortableTaskCard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TaskCard({ task, onClick, isDragging }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        onClick={() => onClick(task)}
        style={{ background:'var(--surface-1)', border:'1px solid var(--border-card)', borderRadius:10, padding:'10px 12px', marginBottom:8, cursor:'pointer', userSelect:'none', boxShadow:'0 1px 3px rgba(0,0,0,.05)' }}
      >
        <div style={{ fontSize:12, fontWeight:600, marginBottom:8, lineHeight:1.4 }}>{task.title}</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:6 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <PriorityBadge priority={task.priority} />
            {task.comment && (
              <span style={{ display:'flex', alignItems:'center', gap:2, fontSize:10, color:'var(--t4)' }}>
                <MessageSquare size={10} />1
              </span>
            )}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <DueDateDisplay dueDate={task.dueDate} />
            {task.assignedTo && <Initials name={task.assignedTo} size={20} />}
          </div>
        </div>
      </div>
    </div>
  )
}

// â”€â”€â”€ Column â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function Column({ col, tasks, onCardClick, activeId }) {
  return (
    <div style={{ flex:1, minWidth:220, maxWidth:320, display:'flex', flexDirection:'column' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, padding:'0 2px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:col.color, flexShrink:0 }} />
          <span style={{ fontSize:11, fontWeight:700, color:'var(--tx)' }}>{col.label}</span>
          <span style={{ fontSize:10, fontWeight:600, color:'var(--t4)', background:'var(--s2)', padding:'1px 6px', borderRadius:100 }}>{tasks.length}</span>
        </div>
      </div>
      {/* Cards */}
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div style={{ flex:1, minHeight:80 }}>
          {tasks.map(t => <TaskCard key={t.id} task={t} onClick={onCardClick} isDragging={activeId === t.id} />)}
        </div>
      </SortableContext>
    </div>
  )
}

// â”€â”€â”€ TaskDrawer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TaskDrawer({ task, onClose, onUpdate, onDelete, showToast }) {
  const [title,       setTitle]       = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [priority,    setPriority]    = useState(task.priority || 'normale')
  const [status,      setStatus]      = useState(task.status)
  const [assignedTo,  setAssignedTo]  = useState(task.assignedTo || '')
  const [dueDate,     setDueDate]     = useState(task.dueDate ? task.dueDate.slice(0, 10) : '')
  const [comment,     setComment]     = useState('')
  const [comments,    setComments]    = useState(task.comment ? [{ id:'_initial', content:task.comment, createdAt:task.createdAt, author:'' }] : [])
  const [sending,     setSending]     = useState(false)
  const [confirmDel,  setConfirmDel]  = useState(false)

  const patch = useCallback(async (data) => {
    try { await api.tasks.update(task.id, data) }
    catch (err) { showToast && showToast(err.message) }
  }, [task.id, showToast])

  const handleSendComment = async () => {
    if (!comment.trim()) return
    setSending(true)
    const optimistic = { id:'_opt_'+Date.now(), content:comment.trim(), createdAt:new Date().toISOString(), author:'Moi' }
    setComments(prev => [...prev, optimistic])
    const sent = comment.trim()
    setComment('')
    try {
      await api.tasks.addComment(task.id, sent)
    } catch (err) {
      setComments(prev => prev.filter(c => c.id !== optimistic.id))
      showToast && showToast(err.message)
    } finally {
      setSending(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.tasks.delete(task.id)
      showToast && showToast('Tâche supprimée')
      onDelete(task.id)
      onClose()
    } catch (err) {
      showToast && showToast(err.message)
    }
  }

  return (
    <>
      <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,.3)', backdropFilter:'blur(2px)' }} onClick={onClose} />
      <div style={{ position:'fixed', top:0, right:0, bottom:0, width:520, zIndex:1001, background:'var(--surface-1)', borderLeft:'1px solid var(--border)', boxShadow:'-16px 0 48px rgba(0,0,0,.12)', display:'flex', flexDirection:'column', animation:'cartSlideIn .2s ease' }}>

        {/* Header */}
        <div style={{ padding:'18px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={() => { if (title !== task.title) { patch({ title }); onUpdate(task.id, { title }) } }}
            style={{ flex:1, fontSize:16, fontWeight:700, border:'none', background:'transparent', color:'var(--tx)', fontFamily:'var(--f)', outline:'none', letterSpacing:'-.2px' }}
            placeholder="Titre de la tâche"
          />
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:8, border:'1px solid var(--border)', background:'var(--surface-1)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)', flexShrink:0 }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'18px 24px', display:'flex', flexDirection:'column', gap:18 }}>

          {/* Badges statut + priorité */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <PriorityBadge priority={priority} />
            <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:100, background:'var(--s2)', color:'var(--t3)' }}>
              {COLUMNS.find(c => c.id === status)?.label || status}
            </span>
          </div>

          {/* Méta */}
          <div className="modal-row" style={{ gap:12 }}>
            <div>
              <label className="form-label">Priorité</label>
              <select className="form-input" value={priority} onChange={e => { setPriority(e.target.value); patch({ priority:e.target.value }); onUpdate(task.id, { priority:e.target.value }) }}>
                {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Statut</label>
              <select className="form-input" value={status} onChange={e => { setStatus(e.target.value); patch({ status:e.target.value }); onUpdate(task.id, { status:e.target.value }) }}>
                {COLUMNS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Assigné à</label>
              <input className="form-input" value={assignedTo} onChange={e => setAssignedTo(e.target.value)} onBlur={() => { patch({ assignedTo }); onUpdate(task.id, { assignedTo }) }} placeholder="Nom du responsable" />
            </div>
            <div>
              <label className="form-label">Échéance</label>
              <input className="form-input" type="date" value={dueDate} onChange={e => { setDueDate(e.target.value); patch({ dueDate:e.target.value ? new Date(e.target.value).toISOString() : null }); onUpdate(task.id, { dueDate:e.target.value }) }} />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description</label>
            <textarea
              className="form-input"
              value={description}
              onChange={e => setDescription(e.target.value)}
              onBlur={() => { if (description !== (task.description || '')) { patch({ description }); onUpdate(task.id, { description }) } }}
              placeholder="Décrivez la tâche..."
              rows={3}
              style={{ resize:'vertical', fontFamily:'var(--f)', fontSize:13 }}
            />
          </div>

          {/* Commentaires */}
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:'var(--t4)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:10 }}>Commentaires ({comments.length})</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:12 }}>
              {comments.map(c => (
                <div key={c.id} style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                  <Initials name={c.author || 'Moi'} size={24} />
                  <div style={{ flex:1, background:'var(--s2)', borderRadius:8, padding:'8px 10px' }}>
                    <div style={{ fontSize:11, color:'var(--tx)' }}>{c.content}</div>
                    <div style={{ fontSize:10, color:'var(--t4)', marginTop:3 }}>{formatDateFR(c.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <textarea
                className="form-input"
                value={comment}
                onChange={e => setComment(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendComment() } }}
                placeholder="Ajouter un commentaire... (Entrée pour envoyer)"
                rows={2}
                style={{ flex:1, resize:'none', fontFamily:'var(--f)', fontSize:12 }}
              />
              <button className="btn btn-primary btn-sm" disabled={!comment.trim() || sending} onClick={handleSendComment} style={{ alignSelf:'flex-end' }}>
                Envoyer
              </button>
            </div>
          </div>
        </div>

        {/* Footer — delete */}
        <div style={{ padding:'14px 24px', borderTop:'1px solid var(--border)' }}>
          <button
            onClick={() => setConfirmDel(true)}
            style={{ background:'none', border:'1px solid rgba(220,38,38,.2)', borderRadius:8, color:'var(--err)', fontSize:12, fontWeight:600, cursor:'pointer', padding:'7px 14px', fontFamily:'var(--f)' }}
          >
            Supprimer la tâche
          </button>
        </div>
      </div>

      <ModalConfirm
        open={confirmDel}
        title="Supprimer cette tâche ?"
        message="Cette action est irréversible."
        confirmLabel="Supprimer"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDel(false)}
      />
    </>
  )
}

// â”€â”€â”€ Main Board â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function TasksBoard({ showToast }) {
  const { store } = useMeereo()
  const projects = store.projects || []

  const [tasks,       setTasks]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [view,        setView]        = useState('board') // 'board' | 'list'
  const [activeId,    setActiveId]    = useState(null)
  const [drawerTask,  setDrawerTask]  = useState(null)
  const [showCreate,  setShowCreate]  = useState(false)

  // Filters
  const [myTasksOnly,   setMyTasksOnly]   = useState(false)
  const [priorityFilter, setPriorityFilter] = useState('')
  const [projectFilter,  setProjectFilter]  = useState('')

  // Create form
  const [newTask, setNewTask] = useState({ title:'', priority:'normale', projectId:'', assignedTo:'', dueDate:'', description:'' })
  const [creating, setCreating] = useState(false)
  const [taskSubmitted, setTaskSubmitted] = useState(false)

  const userId = store.user?.id

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  // â”€â”€â”€ Fetch â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      let data
      if (myTasksOnly && userId) {
        data = await api.tasks.assignedToMe({ projectId: projectFilter || undefined })
      } else {
        data = await api.tasks.getAll()
        if (projectFilter) data = data.filter(t => t.projectId === projectFilter)
      }
      // Normalize status values
      setTasks((data || []).map(t => ({ ...t, status: normalizeStatus(t.status) })))
    } catch (err) {
      showToast && showToast('Erreur chargement tâches : ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [myTasksOnly, projectFilter, userId, showToast])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  // â”€â”€â”€ Filters â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const filteredTasks = tasks.filter(t => {
    if (priorityFilter && t.priority !== priorityFilter) return false
    return true
  })

  const tasksByColumn = (colId) => filteredTasks.filter(t => t.status === colId)

  // â”€â”€â”€ DnD handlers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleDragStart = ({ active }) => setActiveId(active.id)

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null)
    if (!over) return

    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

    // Determine target column
    let targetStatus = COLUMNS.find(c => c.id === over.id)?.id
    if (!targetStatus) {
      const overTask = tasks.find(t => t.id === over.id)
      if (overTask) targetStatus = overTask.status
    }

    if (!targetStatus || targetStatus === activeTask.status) return

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === activeTask.id ? { ...t, status: targetStatus } : t))

    api.tasks.update(activeTask.id, { status: targetStatus }).catch(() => {
      // Rollback
      setTasks(prev => prev.map(t => t.id === activeTask.id ? { ...t, status: activeTask.status } : t))
      showToast && showToast('Erreur lors du déplacement de la tâche')
    })
  }

  // â”€â”€â”€ Drawer callbacks â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleUpdate = useCallback((id, patch) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch, status: patch.status ? normalizeStatus(patch.status) : t.status } : t))
  }, [])

  const handleDelete = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }, [])

  // â”€â”€â”€ Create task â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  const handleCreate = async () => {
    setTaskSubmitted(true)
    if (!newTask.title.trim()) return
    setCreating(true)
    try {
      const payload = {
        title:       newTask.title.trim(),
        priority:    newTask.priority || 'normale',
        status:      'a_faire',
        projectId:   newTask.projectId || null,
        assignedTo:  newTask.assignedTo || null,
        dueDate:     newTask.dueDate ? new Date(newTask.dueDate).toISOString() : null,
        description: newTask.description || null,
      }
      const created = await api.tasks.create(payload)
      setTasks(prev => [{ ...created, status: normalizeStatus(created.status) }, ...prev])
      setShowCreate(false)
      setTaskSubmitted(false)
      setNewTask({ title:'', priority:'normale', projectId:'', assignedTo:'', dueDate:'', description:'' })
      showToast && showToast('Tâche créée')
    } catch (err) {
      showToast && showToast(err.message)
    } finally {
      setCreating(false)
    }
  }

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null

  // â”€â”€â”€ Render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

  return (
    <div>
      <DSPageHeader title="Tableau des tâches" subtitle="Kanban · Drag & drop · Suivi par statut">
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {/* View toggle */}
          <div style={{ display:'flex', border:'1px solid var(--border)', borderRadius:8, overflow:'hidden' }}>
            <button onClick={() => setView('board')} style={{ padding:'5px 10px', background: view === 'board' ? 'var(--tx)' : 'var(--surface-1)', color: view === 'board' ? '#fff' : 'var(--t3)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:11, fontWeight:600, fontFamily:'var(--f)' }}>
              <LayoutGrid size={13} />Board
            </button>
            <button onClick={() => setView('list')} style={{ padding:'5px 10px', background: view === 'list' ? 'var(--tx)' : 'var(--surface-1)', color: view === 'list' ? '#fff' : 'var(--t3)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:4, fontSize:11, fontWeight:600, fontFamily:'var(--f)' }}>
              <List size={13} />Liste
            </button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}><Plus size={13} />Nouvelle tâche</button>
        </div>
      </DSPageHeader>

      {/* Filters bar */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
        <button
          onClick={() => setMyTasksOnly(v => !v)}
          style={{ padding:'6px 12px', borderRadius:8, border:`1.5px solid ${myTasksOnly ? 'var(--tx)' : 'var(--border)'}`, background: myTasksOnly ? 'var(--tx)' : 'var(--surface-1)', color: myTasksOnly ? '#fff' : 'var(--t3)', fontSize:11, fontWeight:600, cursor:'pointer', fontFamily:'var(--f)' }}
        >
          Mes tâches
        </button>
        <select className="form-input" value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
          <option value="">Toutes priorités</option>
          {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select className="form-input" value={projectFilter} onChange={e => setProjectFilter(e.target.value)}>
          <option value="">Tous les projets</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
        </select>
      </div>

      {/* Loading */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'64px 0' }}><Spinner /></div>
      ) : filteredTasks.length === 0 ? (
        <DSEmptyState icon="âœ…" title="Aucune tâche" description="Créez votre première tâche pour commencer à suivre l'avancement." actionLabel="Créer une tâche" onAction={() => setShowCreate(true)} />
      ) : view === 'board' ? (
        /* â•â•â• VUE BOARD â•â•â• */
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div style={{ display:'flex', gap:16, alignItems:'flex-start', overflowX:'auto', paddingBottom:16 }}>
            {COLUMNS.map(col => (
              <Column key={col.id} col={col} tasks={tasksByColumn(col.id)} onCardClick={setDrawerTask} activeId={activeId} />
            ))}
          </div>
          <DragOverlay>
            {activeTask && (
              <div style={{ background:'var(--surface-1)', border:'1px solid var(--border)', borderRadius:10, padding:'10px 12px', boxShadow:'0 8px 24px rgba(0,0,0,.15)', opacity:.95, width:240 }}>
                <div style={{ fontSize:12, fontWeight:600 }}>{activeTask.title}</div>
                <div style={{ marginTop:6 }}><PriorityBadge priority={activeTask.priority} /></div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        /* â•â•â• VUE LISTE â•â•â• */
        <div className="card" style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', minWidth:560, borderCollapse:'collapse', fontSize:13 }}>
            <thead>
              <tr style={{ background:'var(--s2)', textAlign:'left' }}>
                {['Titre','Priorité','Statut','Assigné','Échéance','Projet'].map((h, i) => (
                  <th key={i} style={{ padding:'10px 18px', fontWeight:700, fontSize:10, textTransform:'uppercase', letterSpacing:'.06em', color:'var(--t4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map(t => {
                const col = COLUMNS.find(c => c.id === t.status)
                const proj = projects.find(p => p.id === t.projectId)
                return (
                  <tr key={t.id} style={{ borderBottom:'1px solid var(--border)', cursor:'pointer' }} onClick={() => setDrawerTask(t)}>
                    <td style={{ padding:'11px 18px', fontWeight:600 }}>{t.title}</td>
                    <td style={{ padding:'11px 18px' }}><PriorityBadge priority={t.priority} /></td>
                    <td style={{ padding:'11px 18px' }}>
                      <span style={{ fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:100, background:'var(--s2)', color:col?.color || 'var(--t4)' }}>{col?.label || t.status}</span>
                    </td>
                    <td style={{ padding:'11px 18px' }}>
                      {t.assignedTo ? <div style={{ display:'flex', alignItems:'center', gap:6 }}><Initials name={t.assignedTo} size={20} /><span style={{ fontSize:12 }}>{t.assignedTo}</span></div> : <span style={{ color:'var(--t4)', fontSize:12 }}>—</span>}
                    </td>
                    <td style={{ padding:'11px 18px' }}><DueDateDisplay dueDate={t.dueDate} /></td>
                    <td style={{ padding:'11px 18px', color:'var(--t3)', fontSize:12 }}>{proj?.nom || '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* â•â•â• DRAWER — Détail tâche â•â•â• */}
      {drawerTask && (
        <TaskDrawer
          task={drawerTask}
          onClose={() => setDrawerTask(null)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          showToast={showToast}
        />
      )}

      {/* â•â•â• MODAL — Créer une tâche â•â•â• */}
      {showCreate && (
        <div style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,.4)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center' }} onClick={() => setShowCreate(false)}>
          <div style={{ background:'var(--surface-1)', border:'1px solid var(--border)', borderRadius:16, width:480, boxShadow:'0 24px 80px rgba(0,0,0,.18)', overflow:'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding:'20px 22px 14px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:16, fontWeight:800 }}>Nouvelle tâche</div>
              <button onClick={() => setShowCreate(false)} style={{ width:30, height:30, borderRadius:8, border:'1px solid var(--border)', background:'var(--surface-1)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)' }}><X size={14} /></button>
            </div>
            <div style={{ padding:'18px 22px', display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <label className="form-label">Titre *</label>
                <input className="form-input" value={newTask.title} onChange={e => setNewTask(p => ({ ...p, title:e.target.value }))} placeholder="ex: Valider les plans d'exécution" autoFocus />
                {taskSubmitted && !newTask.title.trim() && <p style={{ color:'var(--err)', fontSize:11, marginTop:4, fontWeight:500 }}>Champ obligatoire</p>}
              </div>
              <div className="modal-row" style={{ gap:10 }}>
                <div>
                  <label className="form-label">Priorité</label>
                  <select className="form-input" value={newTask.priority} onChange={e => setNewTask(p => ({ ...p, priority:e.target.value }))}>
                    {Object.entries(PRIORITY_META).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Échéance</label>
                  <input className="form-input" type="date" value={newTask.dueDate} onChange={e => setNewTask(p => ({ ...p, dueDate:e.target.value }))} />
                </div>
              </div>
              <div className="modal-row" style={{ gap:10 }}>
                <div>
                  <label className="form-label">Assigné à</label>
                  <input className="form-input" value={newTask.assignedTo} onChange={e => setNewTask(p => ({ ...p, assignedTo:e.target.value }))} placeholder="Nom du responsable" />
                </div>
                <div>
                  <label className="form-label">Projet</label>
                  <select className="form-input" value={newTask.projectId} onChange={e => setNewTask(p => ({ ...p, projectId:e.target.value }))}>
                    <option value="">Aucun</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} value={newTask.description} onChange={e => setNewTask(p => ({ ...p, description:e.target.value }))} placeholder="Détails optionnels..." style={{ resize:'none', fontFamily:'var(--f)', fontSize:13 }} />
              </div>
            </div>
            <div style={{ padding:'14px 22px', borderTop:'1px solid var(--border)', display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button className="btn btn-sm" onClick={() => setShowCreate(false)}>Annuler</button>
              <button className="btn btn-primary btn-sm" disabled={creating} onClick={handleCreate}>
                {creating ? 'Création...' : 'Créer la tâche'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

