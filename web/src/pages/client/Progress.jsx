import { Ruler, ClipboardList, HardHat as HardHatIcon, Wrench, Package, Sofa, CheckCircle2 as CheckCircle2Icon, Check } from 'lucide-react'
import { CHANTIER_PHASES } from '../../data/chantier'

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
  const { proj, clientProjects, stoppedProjects, projProgress, setSelProjId, setPage, onStopProject } = ctx

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
        {proj?.img && <img src={proj.img} alt="" style={{ width: 48, height: 48, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />}
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
            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: e.done ? 'rgba(52,199,89,.06)' : e.current ? 'rgba(245,158,11,.06)' : 'transparent', color: e.done ? 'var(--ok)' : e.current ? '#F59E0B' : 'var(--t4)' }}>{e.done ? 'Termine' : e.current ? 'En cours' : 'A venir'}</span>
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
    </div>
  )
}
