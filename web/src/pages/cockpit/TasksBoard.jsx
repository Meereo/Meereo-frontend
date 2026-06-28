// === Planning — Calendrier mensuel avec sync projets & CRUD événements ===
import { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, X, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { api } from '../../services/api/client'
import { useMeereo } from '../../hooks/useMeereoStore'

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS       = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const MONTHS_SHORT = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Aoû','Sep','Oct','Nov','Déc']
const DAYS         = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']
const pad          = n => String(n).padStart(2, '0')

const EVENT_TYPES = [
  { key: 'Réunion',             color: '#191c1d' },
  { key: 'Visite chantier',     color: '#16A34A' },
  { key: 'Rendez-vous client',  color: '#EA580C' },
  { key: 'Remise pièces',       color: '#6B7280' },
  { key: 'Deadline',            color: '#DC2626' },
  { key: 'Livraison projet',    color: '#7C3AED' },
  { key: 'Autre',               color: '#0891B2' },
]

const getTypeColor = type => EVENT_TYPES.find(t => t.key === type)?.color || '#6B7280'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMonthGrid(year, month) {
  const firstDay  = new Date(year, month, 1).getDay()
  const offset    = firstDay === 0 ? 6 : firstDay - 1
  const daysInMon = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMon; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function toDateStr(y, m, d) { return `${y}-${pad(m + 1)}-${pad(d)}` }

function todayStr() {
  const n = new Date()
  return toDateStr(n.getFullYear(), n.getMonth(), n.getDate())
}

// ─── DateBadge ────────────────────────────────────────────────────────────────

function DateBadge({ dateStr, color }) {
  if (!dateStr) return null
  const parts = dateStr.split('-').map(Number)
  const monthShort = MONTHS_SHORT[(parts[1] || 1) - 1] || ''
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', width:38, height:38, borderRadius:10, background:color+'14', border:`1.5px solid ${color}22`, flexShrink:0 }}>
      <div style={{ fontSize:14, fontWeight:800, color, lineHeight:1 }}>{parts[2]}</div>
      <div style={{ fontSize:8, fontWeight:700, color, textTransform:'uppercase', letterSpacing:'.04em' }}>{monthShort}</div>
    </div>
  )
}

// ─── EventModal ───────────────────────────────────────────────────────────────

function EventModal({ event, projects, onSave, onDelete, onClose, showToast }) {
  const isNew = !event?.id
  const [titre,     setTitre]     = useState(event?.titre || '')
  const [date,      setDate]      = useState(event?.date  || '')
  const [heure,     setHeure]     = useState(event?.heure || '09:00')
  const [type,      setType]      = useState(event?.type  || 'Réunion')
  const [projectId, setProjectId] = useState(event?.projectId || '')
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState(false)
  const [confirmDel,setConfirmDel]= useState(false)
  const [submitted, setSubmitted] = useState(false)

  const valid = titre.trim() && date

  const handleSave = async () => {
    setSubmitted(true)
    if (!valid) return
    setSaving(true)
    const proj  = projects.find(p => p.id === projectId)
    const color = getTypeColor(type)
    const payload = {
      titre:     titre.trim(),
      date,
      heure:     heure || null,
      type,
      projet:    proj?.nom || '',
      projectId: projectId || null,
      color,
    }
    try {
      let saved
      if (isNew) {
        saved = await api.events.create(payload)
      } else {
        saved = await api.events.update(event.id, payload)
      }
      onSave({ ...payload, ...(saved || {}), id: saved?.id || event.id, color })
      showToast?.(isNew ? 'Événement créé' : 'Événement modifié')
      onClose()
    } catch (err) {
      showToast?.('Erreur : ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await api.events.delete(event.id)
      onDelete(event.id)
      showToast?.('Événement supprimé')
      onClose()
    } catch (err) {
      showToast?.('Erreur : ' + err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,.4)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', animation:'modalIn .18s ease' }}
      onClick={onClose}
    >
      <div
        style={{ background:'var(--surface-1)', border:'1px solid var(--border-card)', borderRadius:16, width:460, maxWidth:'90vw', boxShadow:'0 24px 80px rgba(0,0,0,.18)', overflow:'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding:'20px 22px 14px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:16, fontWeight:800 }}>{isNew ? 'Nouvel événement' : "Modifier l'événement"}</div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, border:'1px solid var(--border)', background:'transparent', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--t3)' }}><X size={14}/></button>
        </div>

        <div style={{ padding:'16px 22px', display:'flex', flexDirection:'column', gap:12 }}>
          <div>
            <label className="form-label">Titre *</label>
            <input className="form-input" value={titre} onChange={e => setTitre(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSave()} placeholder="ex: Réunion de chantier..." autoFocus />
            {submitted && !titre.trim() && <p style={{ color:'var(--err)', fontSize:11, marginTop:4, fontWeight:500 }}>Champ obligatoire</p>}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label className="form-label">Date *</label>
              <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)}/>
              {submitted && !date && <p style={{ color:'var(--err)', fontSize:11, marginTop:4, fontWeight:500 }}>Champ obligatoire</p>}
            </div>
            <div>
              <label className="form-label">Heure</label>
              <input className="form-input" type="time" value={heure} onChange={e => setHeure(e.target.value)}/>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label className="form-label">Type</label>
              <select className="form-input" value={type} onChange={e => setType(e.target.value)}>
                {EVENT_TYPES.map(t => <option key={t.key} value={t.key}>{t.key}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Projet associé</label>
              <select className="form-input" value={projectId} onChange={e => setProjectId(e.target.value)}>
                <option value="">Aucun</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:9, height:9, borderRadius:'50%', background:getTypeColor(type), flexShrink:0 }}/>
            <span style={{ fontSize:11, color:'var(--t3)' }}>Couleur : {type}</span>
          </div>
        </div>

        <div style={{ padding:'12px 22px', borderTop:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {!isNew && !confirmDel && (
              <button onClick={() => setConfirmDel(true)} style={{ background:'none', border:'1px solid rgba(220,38,38,.2)', borderRadius:8, color:'var(--err)', fontSize:12, fontWeight:600, cursor:'pointer', padding:'6px 12px', fontFamily:'var(--f)', display:'flex', alignItems:'center', gap:5 }}>
                <Trash2 size={12}/> Supprimer
              </button>
            )}
            {confirmDel && (
              <>
                <span style={{ fontSize:12, color:'var(--err)', fontWeight:600 }}>Confirmer ?</span>
                <button onClick={handleDelete} disabled={deleting} style={{ padding:'6px 12px', borderRadius:8, background:'var(--err)', color:'#fff', border:'none', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'var(--f)' }}>{deleting ? '...' : 'Oui'}</button>
                <button onClick={() => setConfirmDel(false)} style={{ padding:'6px 12px', borderRadius:8, background:'var(--s2)', color:'var(--tx)', border:'1px solid var(--border)', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--f)' }}>Non</button>
              </>
            )}
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-sm" onClick={onClose}>Annuler</button>
            <button className="btn btn-primary btn-sm" disabled={saving} onClick={handleSave}>
              {saving ? 'Enregistrement...' : isNew ? 'Créer' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Planning component ─────────────────────────────────────────────────

export default function TasksBoard({ showToast }) {
  const { store, updateStore } = useMeereo()
  const projects = store.projects || []
  const today    = todayStr()
  const now      = new Date()

  const [year,    setYear]    = useState(now.getFullYear())
  const [month,   setMonth]   = useState(now.getMonth())
  const [events,  setEvents]  = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null)

  // ── Load events from API ──────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    api.events.getAll()
      .then(data => {
        const evs = (Array.isArray(data) ? data : (data?.events || [])).map(e => ({
          ...e,
          color: e.color || getTypeColor(e.type),
        }))
        setEvents(evs)
        updateStore(prev => ({ ...prev, events: evs }))
      })
      .catch(() => {
        const stored = (store.events || []).map(e => ({ ...e, color: e.color || getTypeColor(e.type) }))
        setEvents(stored)
      })
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Synthetic events from projects + tasks ────────────────────────────────
  const syntheticEvents = useMemo(() => {
    const evs = []
    projects.forEach(p => {
      if (p.livraison) {
        evs.push({
          id:         '_proj_livr_' + p.id,
          titre:      'Livraison — ' + p.nom,
          date:       p.livraison.slice(0, 10),
          heure:      '09:00',
          type:       'Livraison projet',
          projet:     p.nom,
          projectId:  p.id,
          color:      getTypeColor('Livraison projet'),
          _synthetic: true,
        })
      }
    })
    ;(store.tasks || []).forEach(t => {
      if (!t.dueDate) return
      const proj = projects.find(p => p.id === t.projectId)
      evs.push({
        id:         '_task_' + t.id,
        titre:      t.title,
        date:       t.dueDate.slice(0, 10),
        heure:      '09:00',
        type:       'Deadline',
        projet:     proj?.nom || '',
        projectId:  t.projectId || null,
        color:      getTypeColor('Deadline'),
        _synthetic: true,
      })
    })
    return evs
  }, [projects, store.tasks])

  // ── Merge events ──────────────────────────────────────────────────────────
  const allEvents = useMemo(() => (
    [...events, ...syntheticEvents].sort((a, b) => {
      const dc = a.date.localeCompare(b.date)
      return dc !== 0 ? dc : (a.heure || '').localeCompare(b.heure || '')
    })
  ), [events, syntheticEvents])

  // ── Calendar helpers ──────────────────────────────────────────────────────
  const monthCells = useMemo(() => getMonthGrid(year, month), [year, month])
  const prevMonth  = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth  = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }
  const goToToday  = () => { setYear(now.getFullYear()); setMonth(now.getMonth()) }

  const getEventsForDate = useCallback(dateStr => allEvents.filter(e => e.date === dateStr), [allEvents])

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const todayEvents = useMemo(() => getEventsForDate(today), [getEventsForDate, today])

  const currentMonthEvents = useMemo(() => allEvents.filter(e => {
    const p = e.date.split('-').map(Number)
    return p[0] === year && p[1] === month + 1
  }), [allEvents, year, month])

  const repartition = useMemo(() => EVENT_TYPES.map(t => ({
    ...t,
    count: currentMonthEvents.filter(e => e.type === t.key).length,
  })).filter(t => t.count > 0), [currentMonthEvents])

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const handleSave = useCallback((ev) => {
    setEvents(prev => {
      const exists = prev.some(e => e.id === ev.id)
      return exists ? prev.map(e => e.id === ev.id ? { ...e, ...ev } : e) : [...prev, ev]
    })
    updateStore(prev => {
      const list   = prev.events || []
      const exists = list.some(e => e.id === ev.id)
      return { ...prev, events: exists ? list.map(e => e.id === ev.id ? { ...e, ...ev } : e) : [...list, ev] }
    })
  }, [updateStore])

  const handleDelete = useCallback((id) => {
    setEvents(prev => prev.filter(e => e.id !== id))
    updateStore(prev => ({ ...prev, events: (prev.events || []).filter(e => e.id !== id) }))
  }, [updateStore])

  const openNew  = (date = '') => setModal({ _isNew:true, titre:'', date, heure:'09:00', type:'Réunion', projectId:'' })
  const openEdit = (ev)        => { if (ev._synthetic) return; setModal({ ...ev }) }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:800, letterSpacing:'-.4px', color:'var(--tx)' }}>Planning</div>
          <div style={{ fontSize:12, color:'var(--t3)', marginTop:2 }}>{MONTHS[month]} {year}</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <button className="btn btn-sm" onClick={goToToday} style={{ fontSize:11 }}>Aujourd'hui</button>
          <div style={{ display:'flex', border:'1px solid var(--border-card)', borderRadius:8, overflow:'hidden' }}>
            <button onClick={prevMonth} style={{ padding:'6px 10px', background:'var(--surface-1)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', color:'var(--t3)' }} title="Mois précédent"><ChevronLeft size={14}/></button>
            <button onClick={nextMonth} style={{ padding:'6px 10px', background:'var(--surface-1)', border:'none', borderLeft:'1px solid var(--border-card)', cursor:'pointer', display:'flex', alignItems:'center', color:'var(--t3)' }} title="Mois suivant"><ChevronRight size={14}/></button>
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => openNew()} style={{ display:'flex', alignItems:'center', gap:5 }}>
            <Plus size={13}/> Événement
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 276px', gap:18, alignItems:'flex-start' }}>

        {/* Calendar */}
        <div style={{ background:'var(--surface-1)', border:'1px solid var(--border-card)', borderRadius:14, overflow:'hidden' }}>
          {/* Sub-header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px 10px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ fontSize:13, fontWeight:700, color:'var(--tx)' }}>{MONTHS[month]} {year}</div>
            <div style={{ fontSize:11, color:'var(--t4)' }}>{currentMonthEvents.length} événement{currentMonthEvents.length !== 1 ? 's' : ''}</div>
          </div>
          {/* Day headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', borderBottom:'1px solid var(--border)' }}>
            {DAYS.map((d, i) => (
              <div key={d} style={{ padding:'8px 0', textAlign:'center', fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color: i >= 5 ? '#EA580C66' : 'var(--t4)' }}>
                {d}
              </div>
            ))}
          </div>
          {/* Cells */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)' }}>
            {monthCells.map((day, i) => {
              const colIdx = i % 7
              const isLast = i >= monthCells.length - 7
              const isRight= colIdx === 6
              if (day === null) {
                return <div key={i} style={{ minHeight:88, borderRight: isRight?'none':'1px solid var(--border)', borderBottom: isLast?'none':'1px solid var(--border)', background:'var(--s2)', opacity:.35 }} />
              }
              const dateStr  = toDateStr(year, month, day)
              const dayEvts  = getEventsForDate(dateStr)
              const isToday  = dateStr === today
              const isPast   = dateStr < today
              const isWeekend= colIdx >= 5
              return (
                <div
                  key={i}
                  onClick={() => openNew(dateStr)}
                  style={{ minHeight:88, borderRight: isRight?'none':'1px solid var(--border)', borderBottom: isLast?'none':'1px solid var(--border)', padding:'7px 8px', cursor:'pointer', background: isToday ? 'rgba(0,122,255,.04)' : 'transparent', transition:'background .1s' }}
                  onMouseEnter={e => { if (!isToday) e.currentTarget.style.background = 'var(--s2)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = isToday ? 'rgba(0,122,255,.04)' : 'transparent' }}
                >
                  <div style={{ marginBottom:4 }}>
                    {isToday ? (
                      <span style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', width:21, height:21, borderRadius:'50%', background:'var(--tx)', color:'#fff', fontSize:10, fontWeight:800 }}>{day}</span>
                    ) : (
                      <span style={{ fontSize:11, fontWeight: isWeekend ? 600 : 400, color: isWeekend ? '#EA580C88' : isPast ? 'var(--t4)' : 'var(--tx)' }}>{day}</span>
                    )}
                  </div>
                  {dayEvts.slice(0, 3).map(e => (
                    <div
                      key={e.id}
                      onClick={ev => { ev.stopPropagation(); openEdit(e) }}
                      title={e.titre}
                      style={{ fontSize:10, color:e.color, fontWeight:600, overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis', marginBottom:2, lineHeight:1.4, cursor: e._synthetic ? 'default' : 'pointer' }}
                    >
                      {e.heure && <span style={{ opacity:.65, fontWeight:500 }}>{e.heure} </span>}
                      {e.titre}
                    </div>
                  ))}
                  {dayEvts.length > 3 && <div style={{ fontSize:9, color:'var(--t4)', fontWeight:600 }}>+{dayEvts.length - 3} autre{dayEvts.length - 3 > 1 ? 's' : ''}</div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

          {/* Aujourd'hui */}
          <div style={{ background:'var(--surface-1)', border:'1px solid var(--border-card)', borderRadius:12, padding:'14px 16px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--tx)' }}>Aujourd'hui</div>
              <button onClick={goToToday} style={{ fontSize:10, color:'var(--t4)', background:'none', border:'none', cursor:'pointer', fontFamily:'var(--f)', fontWeight:600 }}>Autre mois</button>
            </div>
            {loading ? (
              <div style={{ display:'flex', alignItems:'center', height:20 }}><div style={{ width:14, height:14, border:'2px solid var(--border)', borderTopColor:'var(--tx)', borderRadius:'50%', animation:'spin .6s linear infinite' }}/></div>
            ) : todayEvents.length === 0 ? (
              <div style={{ fontSize:12, color:'var(--t4)', fontStyle:'italic' }}>Journée libre</div>
            ) : todayEvents.map(e => (
              <div key={e.id} onClick={() => openEdit(e)} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, cursor: e._synthetic ? 'default' : 'pointer' }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:e.color, flexShrink:0 }}/>
                <div style={{ fontSize:12, fontWeight:600, color:'var(--tx)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{e.titre}</div>
                {e.heure && <div style={{ fontSize:10, color:'var(--t3)', flexShrink:0 }}>{e.heure}</div>}
              </div>
            ))}
          </div>

          {/* À venir */}
          <div style={{ background:'var(--surface-1)', border:'1px solid var(--border-card)', borderRadius:12, padding:'14px 16px' }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--tx)', marginBottom:12 }}>À venir</div>
            {loading ? (
              <div style={{ display:'flex', alignItems:'center', height:20 }}><div style={{ width:14, height:14, border:'2px solid var(--border)', borderTopColor:'var(--tx)', borderRadius:'50%', animation:'spin .6s linear infinite' }}/></div>
            ) : currentMonthEvents.length === 0 ? (
              <div style={{ fontSize:12, color:'var(--t4)', fontStyle:'italic' }}>Aucun événement ce mois</div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10, maxHeight:360, overflowY:'auto' }}>
                {currentMonthEvents.map(e => {
                  const isPast = e.date < today
                  return (
                    <div key={e.id} onClick={() => openEdit(e)} style={{ display:'flex', gap:10, alignItems:'flex-start', cursor: e._synthetic ? 'default' : 'pointer' }}>
                      <DateBadge dateStr={e.date} color={e.color}/>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:11.5, fontWeight:600, color:'var(--tx)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{e.titre}</div>
                        <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:4, flexWrap:'wrap' }}>
                          {e.heure && <span style={{ fontSize:10, color:'var(--t3)' }}>{e.heure}</span>}
                          <span style={{ fontSize:9, fontWeight:700, padding:'1px 6px', borderRadius:100, background:e.color+'14', color:e.color, whiteSpace:'nowrap' }}>{e.type}</span>
                          {isPast && <span style={{ fontSize:9, fontWeight:600, padding:'1px 6px', borderRadius:100, background:'var(--s2)', color:'var(--t4)' }}>Passé</span>}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Répartition */}
          {repartition.length > 0 && (
            <div style={{ background:'var(--surface-1)', border:'1px solid var(--border-card)', borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'.07em', color:'var(--t4)', marginBottom:12 }}>Répartition</div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {repartition.map(t => {
                  const pct = currentMonthEvents.length > 0 ? Math.round((t.count / currentMonthEvents.length) * 100) : 0
                  return (
                    <div key={t.key}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                        <div style={{ width:8, height:8, borderRadius:'50%', background:t.color, flexShrink:0 }}/>
                        <span style={{ fontSize:11, color:'var(--tx)', flex:1 }}>{t.key}</span>
                        <span style={{ fontSize:11, fontWeight:700, color:'var(--tx)' }}>{t.count}</span>
                      </div>
                      <div style={{ height:2, borderRadius:2, background:'var(--border)', overflow:'hidden' }}>
                        <div style={{ height:'100%', borderRadius:2, background:t.color, width:pct+'%', transition:'width .4s ease' }}/>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <EventModal
          event={modal._isNew ? { ...modal, id: undefined } : modal}
          projects={projects}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
          showToast={showToast}
        />
      )}
    </div>
  )
}
