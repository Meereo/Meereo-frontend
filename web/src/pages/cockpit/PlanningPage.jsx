import { useState, useMemo } from 'react'
// CAL_EVENTS mock removed — store.events is source of truth
import { useMeereo } from '../../hooks/useMeereoStore'
import { formatDateFR } from '../../utils/helpers'
import { PHASE_LABELS, normalizePhase } from '../../domain/status'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']
const HOURS = ['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00']

function getMonday(year, month, day) {
  const d = new Date(year, month, day)
  const dow = d.getDay()
  const diff = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + diff)
  return d
}

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length < 42) cells.push(null)
  return cells
}

const pad = n => String(n).padStart(2, '0')

export default function PlanningPage({ openModal, showToast }) {
  const { store, updateStore } = useMeereo()
  const [view, setView] = useState('semaine')

  const allEvents = useMemo(() => {
    const deletedIds = new Set(store.deletedEventIds || [])
    const overrides = store.eventOverrides || {}
    return (store.events || [])
      .filter(e => !deletedIds.has(e.id))
      .map(e => overrides[e.id] ? { ...e, ...overrides[e.id] } : e)
  }, [store.events, store.deletedEventIds, store.eventOverrides])
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [weekOffset, setWeekOffset] = useState(0)
  const [editEvent, setEditEvent] = useState(null)

  // Week navigation
  const baseMonday = getMonday(year, month, now.getDate())
  const currentMonday = new Date(baseMonday)
  currentMonday.setDate(currentMonday.getDate() + weekOffset * 7)

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentMonday)
    d.setDate(d.getDate() + i)
    return { day: DAYS[i], num: d.getDate(), month: d.getMonth(), year: d.getFullYear(), full: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` }
  })
  const weekLabel = `Semaine du ${weekDates[0].num} ${MONTHS[weekDates[0].month]} ${weekDates[0].year}`

  // Month navigation
  const monthCells = getMonthGrid(year, month)
  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1) }
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1) }

  const getEventsForDate = dateStr => allEvents.filter(e => e.date === dateStr)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.02em' }}>Planning</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="tabs">
            {['semaine', 'mois', 'projets'].map(v => (
              <button key={v} className={`tab ${v === view ? 'active' : ''}`} onClick={() => setView(v)}>{v}</button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => openModal && openModal('newEvent')}>+ Événement</button>
        </div>
      </div>

      {view === 'semaine' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn btn-sm" onClick={() => setWeekOffset(w => w - 1)}>← Prec.</button>
            <div className="card-title">{weekLabel}</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-sm" onClick={() => setWeekOffset(0)}>Aujourd'hui</button>
              <button className="btn btn-sm" onClick={() => setWeekOffset(w => w + 1)}>Suiv. →</button>
            </div>
          </div>
          <div className="card-body" style={{ padding: 0, overflowX: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', minWidth: 800 }}>
              <div style={{ padding: '8px 4px', borderBottom: '1px solid var(--s2)' }} />
              {weekDates.map(d => (
                <div key={d.full} style={{ padding: '10px 8px', textAlign: 'center', borderBottom: '1px solid var(--s2)', borderLeft: '1px solid var(--s2)' }}>
                  <div style={{ fontSize: 11, color: 'var(--t4)' }}>{d.day}</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{d.num}</div>
                </div>
              ))}
              {HOURS.map(h => (
                <div key={h} style={{ display: 'contents' }}>
                  <div style={{ padding: '8px 6px', fontSize: 10, color: 'var(--t4)', textAlign: 'right', borderBottom: '1px solid var(--s2)' }}>{h}</div>
                  {weekDates.map(d => {
                    const evts = getEventsForDate(d.full).filter(e => e.heure && e.heure.startsWith(h.split(':')[0]))
                    return (
                      <div key={d.full + h} style={{ minHeight: 40, borderBottom: '1px solid var(--s2)', borderLeft: '1px solid var(--s2)', padding: 2, cursor: 'pointer' }} onDoubleClick={() => openModal && openModal('newEvent')}>
                        {evts.map(e => (
                          <div key={e.id} onDoubleClick={ev => { ev.stopPropagation(); setEditEvent({ ...e }) }} style={{ fontSize: 10, padding: '3px 6px', borderRadius: 4, background: e.color + '18', color: e.color, fontWeight: 500, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', cursor: 'pointer' }}>
                            {e.heure} {e.titre.split(' — ')[0]}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'mois' && (
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button className="btn btn-sm" onClick={prevMonth}>← Prec.</button>
            <div className="card-title">{MONTHS[month]} {year}</div>
            <button className="btn btn-sm" onClick={nextMonth}>Suiv. →</button>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
              {DAYS.map(d => <div key={d} style={{ padding: 8, fontSize: 11, fontWeight: 600, color: 'var(--t4)', textAlign: 'center' }}>{d}</div>)}
              {monthCells.map((day, i) => {
                if (day == null) return <div key={i} />
                const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`
                const evts = allEvents.filter(e => e.date === dateStr)
                const isToday = dateStr === `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
                return (
                  <div key={i} style={{ minHeight: 70, padding: 4, border: '1px solid var(--s2)', borderRadius: 4, cursor: 'pointer', background: isToday ? 'rgba(0,0,0,.03)' : undefined }} onDoubleClick={() => openModal && openModal('newEvent')}>
                    <div style={{ fontSize: 11, fontWeight: isToday ? 800 : 400, color: isToday ? 'var(--tx)' : undefined, marginBottom: 2 }}>{day}</div>
                    {evts.slice(0, 2).map(e => (
                      <div key={e.id} onDoubleClick={ev => { ev.stopPropagation(); setEditEvent({ ...e }) }} style={{ fontSize: 9, padding: '1px 4px', borderRadius: 3, background: e.color + '18', color: e.color, marginBottom: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', cursor: 'pointer' }}>
                        {e.titre.split(' — ')[0]}
                      </div>
                    ))}
                    {evts.length > 2 && <div style={{ fontSize: 8, color: 'var(--t4)', fontWeight: 600 }}>+{evts.length - 2}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {view === 'projets' && (
        <div>
          {(store.projects || []).map(p => {
            const projEvents = allEvents.filter(e => e.projet === p.nom)
            return (
              <div key={p.id} className="card" style={{ marginBottom: 12 }}>
                <div className="card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {p.img ? <img src={p.img} alt="" style={{ width: 24, height: 24, borderRadius: 6, objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} /> : <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color || '#6B7280' }} />}
                    <div className="card-title">{p.nom}</div>
                    <span className="badge badge-neutral">{projEvents.length} événements</span>
                  </div>
                  <span className="badge badge-active">{PHASE_LABELS[normalizePhase(p.phase)] || p.phase}</span>
                </div>
                {projEvents.length > 0 && (
                  <div className="card-body" style={{ padding: 0 }}>
                    {projEvents.map(e => (
                      <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 24px', borderTop: '1px solid var(--s2)', cursor: 'pointer' }} onDoubleClick={() => setEditEvent({ ...e })}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: e.color }} />
                        <div style={{ flex: 1, fontSize: 13 }}>{e.titre}</div>
                        <div style={{ fontSize: 11, color: 'var(--t3)' }}>{formatDateFR(e.date)} {e.heure}</div>
                        <span className="badge badge-neutral">{e.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      {/* ═══ MODAL: Modifier evenement ═══ */}
      {editEvent && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setEditEvent(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 460, boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-.5px' }}>Modifier l'événement</div>
              <button onClick={() => setEditEvent(null)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t3)' }}>×</button>
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Titre</label><input style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)' }} value={editEvent.titre} onChange={e => setEditEvent(p => ({ ...p, titre: e.target.value }))} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Date</label><input type="date" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)' }} value={editEvent.date} onChange={e => setEditEvent(p => ({ ...p, date: e.target.value }))} /></div>
                <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Heure</label><input type="time" style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)' }} value={editEvent.heure || ''} onChange={e => setEditEvent(p => ({ ...p, heure: e.target.value }))} /></div>
              </div>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Type</label>
                <select style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f)', background: 'var(--s2)', color: 'var(--tx)' }} value={editEvent.type} onChange={e => setEditEvent(p => ({ ...p, type: e.target.value }))}>
                  <option value="reunion">Réunion</option><option value="visite">Visite chantier</option><option value="livraison">Livraison</option><option value="deadline">Deadline</option><option value="inspection">Inspection</option><option value="formation">Formation</option><option value="signature">Signature</option>
                </select>
              </div>
              <div><label style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Projet</label><input style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)' }} value={editEvent.projet || ''} onChange={e => setEditEvent(p => ({ ...p, projet: e.target.value }))} /></div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 6 }}>Couleur</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['#191c1d', '#2563EB', '#7C3AED', '#16A34A', '#F59E0B', '#EA580C', '#DC2626', '#0891B2', '#BE185D'].map(c => (
                    <div key={c} onClick={() => setEditEvent(p => ({ ...p, color: c }))} style={{ width: 28, height: 28, borderRadius: 8, background: c, cursor: 'pointer', border: editEvent.color === c ? '2.5px solid var(--tx)' : '2.5px solid transparent', boxShadow: editEvent.color === c ? '0 0 0 2px var(--surface-1), 0 0 0 4px ' + c : 'none', transition: 'all .12s' }} />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'space-between' }}>
              <button style={{ padding: '8px 14px', borderRadius: 8, background: 'rgba(220,38,38,.06)', color: 'var(--err)', border: '1px solid rgba(220,38,38,.15)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12 }} onClick={() => {
                updateStore(prev => ({ ...prev, deletedEventIds: [...(prev.deletedEventIds || []), editEvent.id] }))
                setEditEvent(null)
                showToast && showToast('Événement supprimé')
              }}>Supprimer</button>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm" onClick={() => setEditEvent(null)}>Annuler</button>
                <button className="btn btn-primary btn-sm" onClick={() => {
                  updateStore(prev => ({
                    ...prev,
                    eventOverrides: { ...(prev.eventOverrides || {}), [editEvent.id]: { titre: editEvent.titre, date: editEvent.date, heure: editEvent.heure, type: editEvent.type, projet: editEvent.projet, color: editEvent.color } }
                  }))
                  setEditEvent(null)
                  showToast && showToast('Événement modifié')
                }}>Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
