import { useState } from 'react'
import { Ruler, ClipboardList, HardHat as HardHatIcon, Wrench, Package, Sofa, CheckCircle2 as CheckCircle2Icon, Check, Star } from 'lucide-react'
import { CHANTIER_PHASES } from '../../data/chantier'
import { api } from '../../services/api/client'

const PHASE_ICON_MAP = {
  '📐': <Ruler size={16}/>,
  '📋': <ClipboardList size={16}/>,
  '🗏': <HardHatIcon size={16}/>,
  '🔧': <Wrench size={16}/>,
  '📦': <Package size={16}/>,
  '🛋️': <Sofa size={16}/>,
  '✅': <CheckCircle2Icon size={16}/>,
}

export default function Progress({ ctx }) {
  const { proj, clientProjects, stoppedProjects, projProgress, setSelProjId, setPage, onStopProject, store, respondCloture, showToast, updateStore } = ctx

  // Notes de chantier visibles par le client
  const projNotes = (store?.rapports || [])
    .filter(r => r.type === 'note_chantier' && r.projectId === proj?.id && r.visibility !== 'internal')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  // Clôture en attente de validation client — détecte via clotureStatus du projet (synced from backend)
  const pendingCloture = proj?.clotureStatus === 'EN_ATTENTE_VALIDATION_CLIENT'
    ? { id: 'clot_' + proj.id, projectId: proj.id, status: 'EN_ATTENTE_VALIDATION_CLIENT' }
    : (store?.clotureRequests || []).find(r => r.projectId === proj?.id && r.status === 'EN_ATTENTE_VALIDATION_CLIENT')
  const isClotured = proj?.clotureStatus === 'CLOTURE_VALIDE_EXTERNE' || proj?.clotureStatus === 'CLOTURE_VALIDE_MEEREO'

  // Rating modal state
  const [ratingModal, setRatingModal] = useState(null) // { targetId, targetName, projectId }
  const [refuseModal, setRefuseModal] = useState(false)
  const [refuseReason, setRefuseReason] = useState('')
  const [ratings, setRatings] = useState({ stars: 0, qualite: 0, delais: 0, communication: 0, comment: '' })
  const [ratingSubmitting, setRatingSubmitting] = useState(false)

  // Check if client already reviewed this project's pro
  const alreadyReviewed = (store?.reviews || []).some(r => r.projectId === proj?.id)

  // Find the pro (owner) of the project
  const proMember = (store?.projectMembers || []).find(m => m.projectId === proj?.id && (m.role === 'pro_admin' || m.role === 'PRO_ADMIN' || m.role === 'ADMIN'))
    || (store?.projectMembers || []).find(m => m.projectId === proj?.id && m.userId === proj?.ownerId)
  const proName = proMember?.userName || proj?.client || proj?.entreprise || 'Prestataire'
  const proId = proMember?.userId || proj?.ownerId || null

  const submitRating = async () => {
    if (ratings.stars < 1) return
    setRatingSubmitting(true)
    const review = {
      id: 'rev_' + Date.now(),
      targetId: ratingModal.targetId,
      projectId: ratingModal.projectId,
      note: ratings.stars,
      stars: ratings.stars,
      qualite: ratings.qualite,
      delais: ratings.delais,
      communication: ratings.communication,
      comment: ratings.comment,
      authorName: store?.user?.name || '',
      createdAt: new Date().toISOString(),
    }
    // Save to store
    updateStore(prev => ({ ...prev, reviews: [...(prev.reviews || []), review] }))
    // Persist to backend
    try {
      await api.reviews.create({ targetId: ratingModal.targetId, projectId: ratingModal.projectId, note: ratings.stars, qualite: ratings.qualite, delais: ratings.delais, communication: ratings.communication, comment: ratings.comment })
    } catch (e) { console.warn('[Progress] review API error:', e.message) }
    setRatingSubmitting(false)
    setRatingModal(null)
    setRatings({ stars: 0, qualite: 0, delais: 0, communication: 0, comment: '' })
    showToast && showToast('Merci ! Votre avis a été publié')
  }

  if (!proj) return (
    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: .3 }}><HardHatIcon size={32}/></div>
      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx)', marginBottom: 6 }}>Aucun projet actif</div>
      <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.6, maxWidth: 400, margin: '0 auto', marginBottom: 20 }}>Le suivi de projet démarre automatiquement quand vous acceptez une offre et qu'un marché est signé.</div>
      <button className="btn btn-primary btn-sm" onClick={() => setPage('ao')}>Publier un appel d'offres</button>
    </div>
  )

  return (
    <div>
      {/* Project selector */}
      {clientProjects.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
          {clientProjects.map(p => {
            const active = p.id === proj?.id
            return (
              <button key={p.id} onClick={() => setSelProjId(p.id)} style={{ padding: '7px 14px', borderRadius: 8, border: active ? '1.5px solid var(--tx)' : '1px solid var(--border-subtle)', background: active ? 'var(--tx)' : 'var(--surface-1)', color: active ? '#fff' : 'var(--t2)', fontSize: 11.5, fontWeight: active ? 700 : 500, cursor: 'pointer', fontFamily: 'var(--f)', transition: 'all .15s' }}>
                {p.nom}
              </button>
            )
          })}
        </div>
      )}

      {/* Progress summary */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        {proj?.img && <img src={proj.img} alt="" style={{ width: 72, height: 72, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600 }}>{proj?.nom}</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{proj?.adresse} · {({ ESQUISSE:'Esquisse', AVANT_PROJET:'Avant-projet', PROJET_DETAILLE:'Projet détaillé', PLANS_EXECUTION:'Plans d\'exécution', CONSULTATION_ENTREPRISES:'Consultation', ATTRIBUTION_MARCHES:'Attribution', SUIVI_CHANTIER:'Chantier', RECEPTION:'Réception' })[proj?.phase] || proj?.phase || '—'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{projProgress}%</div>
          <div style={{ fontSize: 10, color: 'var(--t4)' }}>avancement</div>
        </div>
      </div>

      {/* Etapes projet — synced from pro */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Phases du projet</div>
        {(proj?.etapes || []).map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: e.done ? 'var(--tx)' : e.current ? '#fff' : 'var(--s2)', border: e.done ? 'none' : e.current ? '2px solid var(--tx)' : '1.5px solid var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, color: e.done ? '#fff' : 'var(--t4)', flexShrink: 0 }}>{e.done ? <Check size={10}/> : i + 1}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: e.done || e.current ? 700 : 400, color: e.done || e.current ? 'var(--tx)' : 'var(--t4)' }}>{e.label}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: e.done ? 'rgba(52,199,89,.06)' : e.current ? 'rgba(245,158,11,.06)' : 'transparent', color: e.done ? 'var(--ok)' : e.current ? '#F59E0B' : 'var(--t4)' }}>{e.done ? 'Terminé' : e.current ? 'En cours' : 'À venir'}</span>
          </div>
        ))}
      </div>

      {/* Suivi chantier — shows real task completion from pro */}
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Suivi chantier</div>
      {CHANTIER_PHASES.map((ph, phIdx) => {
        // Read task completion directly from taskStates saved by the pro
        const taskStates = (proj?.taskStates && typeof proj.taskStates === 'object') ? proj.taskStates : {}
        const doneTasks = ph.tasks.filter(t => taskStates[t.id] === 'done').length
        const activeTasks = ph.tasks.filter(t => taskStates[t.id] === 'active').length
        const allDone = doneTasks === ph.tasks.length && ph.tasks.length > 0
        const anyActive = activeTasks > 0 || doneTasks > 0
        const pct = Math.round(doneTasks / Math.max(ph.tasks.length, 1) * 100)

        return (
          <div key={phIdx} className="card" style={{ padding: '14px 16px', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 16 }}>{PHASE_ICON_MAP[ph.icon] ?? ph.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{ph.name}</div>
                <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>{ph.desc}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 60 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: allDone ? 'var(--ok)' : anyActive ? 'var(--tx)' : 'var(--t4)' }}>{allDone ? 'Terminé' : anyActive ? pct + '%' : 'À venir'}</div>
                <div style={{ fontSize: 9, color: 'var(--t4)' }}>{ph.tasks.length} tâches</div>
              </div>
            </div>
            {(allDone || anyActive) && (
              <div style={{ marginTop: 8 }}>
                <div className="prog-track" style={{ height: 3 }}><div className="prog-fill" style={{ width: pct + '%', background: allDone ? 'var(--ok)' : 'var(--tx)' }} /></div>
              </div>
            )}
          </div>
        )
      })}
      {/* Bloc clôture — demande en attente de validation client */}
      {pendingCloture && !isClotured && (
        <div style={{ marginTop: 24, marginBottom: 16, padding: '20px 22px', background: 'rgba(52,199,89,.04)', border: '2px solid rgba(52,199,89,.2)', borderRadius: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ok)' }}>Mission terminée</div>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 14 }}>
            Votre prestataire a déclaré la mission comme terminée. Confirmez-vous la bonne réception du projet ?
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--ok)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 13 }} onClick={() => {
              respondCloture && respondCloture(pendingCloture.id, true)
              // Propose to rate
              if (proId && !alreadyReviewed) {
                setRatingModal({ targetId: proId, targetName: proName, projectId: proj.id })
              }
            }}>Confirmer la réception</button>
            <button style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--surface-1)', color: 'var(--err)', border: '1px solid rgba(255,59,48,.2)', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 13 }} onClick={() => setRefuseModal(true)}>Refuser</button>
          </div>
        </div>
      )}

      {/* Projet clôturé — proposer de noter si pas encore fait */}
      {isClotured && !alreadyReviewed && proId && (
        <div style={{ marginTop: 24, marginBottom: 16, padding: '20px 22px', background: 'rgba(52,199,89,.04)', border: '1px solid rgba(52,199,89,.15)', borderRadius: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ok)' }}>Projet terminé</div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 12 }}>Partagez votre expérience pour aider d'autres clients et améliorer la qualité des services.</div>
          <button style={{ padding: '10px 20px', borderRadius: 10, background: 'var(--tx)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 13 }} onClick={() => setRatingModal({ targetId: proId, targetName: proName, projectId: proj.id })}>
            Donner mon avis
          </button>
        </div>
      )}

      {/* Badge clôturé */}
      {isClotured && alreadyReviewed && (
        <div style={{ marginTop: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: 'rgba(52,199,89,.04)', border: '1px solid rgba(52,199,89,.12)', borderRadius: 12 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ok)' }}>Projet clôturé — avis envoyé</div>
        </div>
      )}

      {/* Intervenants du projet — visibles par le client */}
      {(() => {
        const projIntervenants = (store?.projectMembers || []).filter(m => m.projectId === proj?.id && m.userId !== proj?.ownerId && m.userId !== proj?.clientId && m.userId !== store?.user?.id)
        if (projIntervenants.length === 0) return null
        return (
          <div style={{ marginTop: 24, marginBottom: 24 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Intervenants du projet</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {projIntervenants.map(m => (
                <div key={m.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
                    {(m.userName || '?').charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{m.userName || 'Intervenant'}</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)' }}>{m.role || 'Membre'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Notes de chantier */}
      {projNotes.length > 0 && (
        <div style={{ marginTop: 24, marginBottom: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Notes de chantier</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {projNotes.map(note => {
              const typeColors = { Validation: '#16A34A', Alerte: '#F59E0B', Information: '#2563EB', Blocage: '#DC2626' }
              const color = typeColors[note.alertType] || '#6B7280'
              return (
                <div key={note.id} className="card" style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: color + '12', color }}>{note.alertType || 'Note'}</span>
                    {note.statut && <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--t3)' }}>{note.statut}</span>}
                    {note.avancement && <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--t4)' }}>{note.avancement}%</span>}
                    <span style={{ marginLeft: 'auto', fontSize: 9, color: 'var(--t4)' }}>{note.createdAt ? new Date(note.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
                  </div>
                  {note.titre && <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{note.titre}</div>}
                  {note.texte && <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.5 }}>{note.texte}</div>}
                  {note.auteur && <div style={{ fontSize: 10, color: 'var(--t4)', marginTop: 6 }}>Par {note.auteur}</div>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Projets arrêtés / archivés */}
      {stoppedProjects?.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t3)', letterSpacing: '.04em', textTransform: 'uppercase', marginBottom: 10 }}>Projets arrêtés</div>
          {stoppedProjects.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 6, background: 'var(--surface-1)', opacity: .7 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,149,0,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="8" x2="16" y2="16"/></svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600 }}>{p.nom}</div>
                <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 1 }}>{p.status === 'stopped' ? 'Arrêté' : 'Archivé'}{(p.stoppedAt || p.archivedAt) ? ' · ' + new Date(p.stoppedAt || p.archivedAt).toLocaleDateString('fr-FR') : ''}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Action : arrêter le projet actif */}
      {proj && proj.status !== 'stopped' && proj.status !== 'archived' && onStopProject && (
        <div style={{ marginTop: 32, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <button onClick={onStopProject} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 16px', borderRadius: 9, background: 'rgba(255,149,0,.06)', border: '1px solid rgba(255,149,0,.2)', color: '#FF9500', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="8" x2="16" y2="16"/></svg>
            Arrêter ce projet
          </button>
        </div>
      )}
      {/* MODAL: Refus de clôture */}
      {refuseModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setRefuseModal(false)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 440, padding: '24px', boxShadow: '0 24px 80px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Refuser la clôture</div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 16 }}>Expliquez pourquoi le projet ne peut pas être clôturé.</div>
            <textarea value={refuseReason} onChange={e => setRefuseReason(e.target.value)} placeholder="Raison du refus..." rows={4} style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-1)', fontSize: 13, fontFamily: 'var(--f)', resize: 'vertical', outline: 'none' }} autoFocus />
            <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
              <button style={{ padding: '9px 18px', borderRadius: 9, border: '1px solid var(--border)', background: 'var(--surface-1)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--f)' }} onClick={() => { setRefuseModal(false); setRefuseReason('') }}>Annuler</button>
              <button style={{ padding: '9px 18px', borderRadius: 9, border: 'none', background: 'var(--err)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }} onClick={() => { respondCloture && respondCloture(pendingCloture.id, false, refuseReason || ''); setRefuseModal(false); setRefuseReason('') }}>Confirmer le refus</button>
            </div>
          </div>
        </div>
      )}
      {/* MODAL: Évaluer le prestataire */}
      {ratingModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setRatingModal(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 500, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.2)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div style={{ padding: '22px 24px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ok)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Projet terminé</div>
                  <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.4px' }}>Évaluer le prestataire</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>{proj?.nom}</div>
                </div>
                <button onClick={() => setRatingModal(null)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t3)' }}>×</button>
              </div>
            </div>

            {/* Rating form */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: '14px 16px', background: 'var(--s2)', borderRadius: 10 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{(ratingModal.targetName || '?').slice(0, 2).toUpperCase()}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{ratingModal.targetName}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)' }}>Prestataire du projet</div>
                </div>
              </div>

              {[['stars', 'Note globale'], ['qualite', 'Qualité du travail'], ['delais', 'Respect des délais'], ['communication', 'Communication & suivi']].map(([field, label]) => (
                <div key={field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--t2)' }}>{label}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} onClick={() => setRatings(prev => ({ ...prev, [field]: s }))} style={{ cursor: 'pointer', transition: 'color .1s' }}><Star size={22} fill={s <= ratings[field] ? '#F59E0B' : 'none'} color={s <= ratings[field] ? '#F59E0B' : 'var(--s3)'}/></span>
                    ))}
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 4 }}>Commentaire (optionnel)</label>
                <textarea placeholder="Partagez votre expérience avec ce prestataire..." value={ratings.comment} onChange={e => setRatings(prev => ({ ...prev, comment: e.target.value }))} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 12, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)', resize: 'vertical', minHeight: 60 }} />
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--t4)', lineHeight: 1.5 }}>Votre avis sera visible sur le profil public du prestataire et contribuera à son score de satisfaction.</div>
            </div>

            {/* Footer */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end', flexShrink: 0 }}>
              <button className="btn btn-sm" onClick={() => { setRatingModal(null); showToast && showToast('Vous pourrez donner votre avis plus tard') }}>Plus tard</button>
              <button className="btn btn-primary btn-sm" disabled={ratings.stars < 1 || ratingSubmitting} style={{ opacity: ratings.stars < 1 ? .5 : 1 }} onClick={submitRating}>{ratingSubmitting ? 'Envoi...' : 'Envoyer mon avis'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
