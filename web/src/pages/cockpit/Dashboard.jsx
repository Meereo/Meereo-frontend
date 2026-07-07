import { useMemo, useState } from 'react'
import { Radio, Package, Settings, ClipboardList, MessageSquare, AlertCircle, Wallet, BarChart2, FileText, User, CheckCircle2, Pin, Users } from 'lucide-react'
// RECENT_ACTIVITY mock removed — store.activities is source of truth
import { useDevise } from '../../hooks/useDevise'
import { useMeereo } from '../../hooks/useMeereoStore'
import { useMergedData } from '../../hooks/useMergedData'
import useUserIdentity from '../../hooks/useUserIdentity'
import { getUserActiveProjects } from '../../domain/projectsRepository'
import { computeProjectAvancement } from '../../domain/projectAggregates'
import { PROJECT_PHASES, PHASE_LABELS, PHASE_DETAIL, normalizePhase } from '../../domain/status'
import { formatDateFR } from '../../utils/helpers'
import AoGear from '../../components/shared/AoGear'

// Couleur d'avancement cohérente avec la barre de progression
const progressColor = (pct) => {
  if (pct >= 80) return '#22C55E'  // vert — quasi terminé
  if (pct >= 50) return '#F59E0B'  // orange — en cours avancé
  if (pct > 0) return '#F59E0B'    // orange — en cours
  return 'rgba(255,255,255,.45)'   // gris — pas commencé
}

// Traduction des actions techniques → libellés français lisibles
const ACTION_LABELS = {
  PROJECT_MEMBER_ADDED: 'Membre ajouté au projet',
  PROJECT_CREATED: 'Projet créé',
  PROJECT_UPDATED: 'Projet mis à jour',
  PROJECT_ARCHIVED: 'Projet archivé',
  PROJECT_DELETED: 'Projet supprimé',
  USER_CREATED: 'Compte créé',
  USER_UPDATED: 'Profil mis à jour',
  USER_DELETED: 'Compte supprimé',
  OFFER_CREATED: 'Offre soumise',
  OFFER_ACCEPTED: 'Offre acceptée',
  OFFER_REJECTED: 'Offre refusée',
  OFFER_UPDATED: 'Offre mise à jour',
  PAYMENT_CREATED: 'Paiement créé',
  PAYMENT_CONFIRMED: 'Paiement confirmé',
  PAYMENT_PENDING: 'Paiement en attente',
  DECISION_CREATED: 'Décision créée',
  DECISION_APPROVED: 'Décision validée',
  DECISION_REJECTED: 'Décision refusée',
  MESSAGE_SENT: 'Message envoyé',
  DOCUMENT_UPLOADED: 'Document ajouté',
  DOCUMENT_CREATED: 'Document créé',
  MARKET_CREATED: 'Marché créé',
  MARKET_SIGNED: 'Marché signé',
  TASK_COMPLETED: 'Tâche terminée',
  TASK_CREATED: 'Tâche créée',
  AO_CREATED: 'Appel d\'offres créé',
  AO_PUBLISHED: 'Appel d\'offres publié',
  AO_CLOSED: 'Appel d\'offres clôturé',
  INVITATION_SENT: 'Invitation envoyée',
  INVITATION_ACCEPTED: 'Invitation acceptée',
}
const translateAction = (action) => {
  if (!action) return 'Activité'
  if (ACTION_LABELS[action]) return ACTION_LABELS[action]
  // Fallback: transformer SNAKE_CASE → phrase française lisible
  return action.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())
}

export default function Dashboard({ onNavigate, openModal, openProDir }) {
  const { formatShort } = useDevise()
  const { store } = useMeereo()
  const { badgeCounts } = useMergedData()
  const uid = useUserIdentity()
  const ob = store.onboardingData || {}
  // Pro: use company name. Client: use first name.
  const userFirstName = uid.company || uid.displayName || uid.firstName || ''

  const [actTab, setActTab] = useState('all')

  const allProjetsRaw = useMemo(() => getUserActiveProjects(store, store.user?.id, store.user?.email), [store.projects, store.user, store.projectMembers])
  // Enrich each project with computed avancement (phase + étapes + stored + marchés liés)
  const allProjets = useMemo(() => allProjetsRaw.map(p => ({
    ...p,
    avancement: computeProjectAvancement(p, store.markets),
  })), [allProjetsRaw, store.markets])
  const parseBudget = (b) => { const s = String(b || '').replace(/[^\d.,]/g, '').replace(',', '.'); const n = parseFloat(s) || 0; return (b && b.includes('Mds')) ? n * 1e9 : (b && b.includes('M')) ? n * 1e6 : n }
  const mainProj = [...allProjets].sort((a, b) => parseBudget(b.budget) - parseBudget(a.budget))[0]
  const hasProjects = allProjets.length > 0
  const offAtt = badgeCounts.offresEnAttente
  const nonLus = badgeCounts.messagesNonLus
  // Prochaine étape — dérivée des étapes, de la phase courante, ou du contexte projet
  const nextStepLabel = useMemo(() => {
    if (!mainProj) return null
    // 1. Si des étapes existent, chercher la prochaine non terminée
    const etapes = mainProj.etapes || []
    const nextEtape = etapes.find(e => e.current || !e.done)
    if (nextEtape) return nextEtape.label || nextEtape.n || null

    // 2. Dériver depuis la phase courante
    const raw = mainProj.phase || 'IDEE'
    const phase = normalizePhase(raw)
    const idx = PROJECT_PHASES.indexOf(phase)

    // Phase terminale
    if (phase === 'RECEPTION') return 'Projet livré'

    // Sous-étapes de la phase courante (première non accomplie)
    const details = PHASE_DETAIL[phase] || []
    if (details.length > 0) return details[0]

    // Phase suivante
    if (idx >= 0 && idx < PROJECT_PHASES.length - 1) {
      const next = PROJECT_PHASES[idx + 1]
      return PHASE_LABELS[next] || next
    }

    return null
  }, [mainProj?.phase, mainProj?.etapes])
  const totalBudget = allProjets.reduce((s, p) => s + parseBudget(p.budget), 0)

  // ═══════════════════════════════════════════════════════
  //  ÉTAT VIDE — Onboarding propre, 1 seul CTA, 0 doublons
  // ═══════════════════════════════════════════════════════
  if (!hasProjects) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', paddingTop: 20 }}>
        {/* Greeting */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.4px', color: 'var(--tx)' }}>Bienvenue, {userFirstName}</div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>Espace professionnel</div>
          <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 4 }}>{ob.entreprise || 'Votre espace MEEREO est prêt.'}</div>
        </div>

        {/* Hero — unique, clair, 1 seul CTA */}
        <div style={{ background: 'linear-gradient(150deg, #0f1011, #1a1d1e 40%, #2a2c2d)', borderRadius: 18, padding: '48px 40px', color: '#fff', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.03) 0%, transparent 60%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative' }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 14 }}>Commencer</div>
            <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-.5px', marginBottom: 8, lineHeight: 1.2 }}>Créez votre premier projet</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.6, marginBottom: 28, maxWidth: 400 }}>Pilotez votre chantier, coordonnez vos intervenants et suivez chaque étape depuis un seul espace.</div>
            <button className="btn" style={{ background: '#fff', color: '#111', padding: '11px 22px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => onNavigate('projets')}>+ Créer un projet</button>
          </div>
        </div>

        {/* Onboarding — 4 étapes visuelles */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 14 }}>Comment ça marche</div>
          <div className="rg-4" style={{ gap: 10 }}>
            {[
              { n: '01', title: 'Créer un projet', desc: 'Définissez votre mission, budget et localisation.', color: 'var(--tx)' },
              { n: '02', title: 'Constituer l\'équipe', desc: 'Ajoutez intervenants et lancez un appel d\'offres.', color: 'var(--t2)' },
              { n: '03', title: 'Piloter le chantier', desc: 'Suivez l\'avancement phase par phase.', color: 'var(--t3)' },
              { n: '04', title: 'Livrer en confiance', desc: 'Validez les étapes et sécurisez les paiements.', color: 'var(--t4)' },
            ].map(step => (
              <div key={step.n} style={{ padding: '18px 16px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)' }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: step.color, letterSpacing: '-1px', marginBottom: 10, lineHeight: 1 }}>{step.n}</div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>{step.title}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Accès rapides — 3 max, pertinents pour le démarrage */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 14 }}>Explorer</div>
          <div className="rg-3" style={{ gap: 10 }}>
            {[
              { icon: <Users size={16} />, label: 'Annuaire des professionnels', desc: 'Trouver et contacter des structures', page: null },
              { icon: <Radio size={16} />, label: 'Bourse des AO', desc: 'Consulter les opportunités', page: 'bourse' },
              { icon: <Package size={16} />, label: 'Marketplace', desc: 'Parcourir les produits', page: 'marketplace' },
              { icon: <Settings size={16} />, label: 'Paramètres', desc: 'Configurer votre espace', page: 'parametres' },
            ].map(btn => (
              <div key={btn.page || btn.label} onClick={() => btn.page ? onNavigate(btn.page) : openProDir?.()} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)', cursor: 'pointer', transition: 'all .15s' }}>
                <div style={{ fontSize: 18, flexShrink: 0 }}>{btn.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)' }}>{btn.label}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--t4)' }}>{btn.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════
  //  ÉTAT ACTIF — Hiérarchie claire, 0 doublons, premium
  // ═══════════════════════════════════════════════════════

  // Actions urgentes — fusionné (pas de KPI + alertes + zone critique séparés)
  const urgentItems = []
  if (offAtt > 0) urgentItems.push({ icon: <ClipboardList size={13} />, label: `${offAtt} offre${offAtt > 1 ? 's' : ''} en attente de décision`, page: 'offres', severity: 'warn' })
  if (nonLus > 0) urgentItems.push({ icon: <MessageSquare size={13} />, label: `${nonLus} message${nonLus > 1 ? 's' : ''} non lu${nonLus > 1 ? 's' : ''}`, page: 'messages', severity: 'info' })
  allProjets.filter(p => p.avancement >= 90).forEach(p => urgentItems.push({ icon: <AlertCircle size={13} color="var(--err)" />, label: `${p.nom} — ${p.avancement}% (livraison imminente)`, page: 'projets', severity: 'critical' }))

  return (
    <div>
      {/* Greeting — compact */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.4px', color: 'var(--tx)' }}>Bonjour, {userFirstName}</div>
        <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{ob.entreprise ? ob.entreprise + ' · ' : ''}{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      </div>

      {/* Actions urgentes — seule zone d'alertes, pas de doublons */}
      {/* Accès annuaire */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => openProDir?.()} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 10, cursor: 'pointer', width: '100%', transition: 'all .12s' }}>
          <Users size={14} style={{ flexShrink: 0, color: 'var(--t3)' }} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--tx)', flex: 1, textAlign: 'left' }}>Annuaire des professionnels</span>
          <span style={{ fontSize: 11, color: 'var(--t4)' }}>Trouver une structure →</span>
        </button>
      </div>

      {urgentItems.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          {urgentItems.map((item, i) => (
            <div key={i} onClick={() => onNavigate(item.page)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 10, cursor: 'pointer', marginBottom: 8, transition: 'all .12s' }}>
              <span style={{ fontSize: 14, flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--tx)', flex: 1 }}>{item.label}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          ))}
        </div>
      )}

      {/* Hero — Projet principal */}
      <div className="dash-hero-v2" style={{ marginBottom: 28 }}>
        <div className="dash-hero-v2-glow" />
        <div style={{ position: 'relative' }}>
          <div className="dash-hero-v2-eyebrow">Projet principal</div>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <div className="dash-hero-v2-title">{mainProj.nom}</div>
              <div className="dash-hero-v2-client">Client — {mainProj.client}{mainProj.type ? ' · ' + mainProj.type : ''}{mainProj.adresse ? ' · ' + mainProj.adresse : ''}</div>
            </div>
            <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.8)', border: '1px solid rgba(255,255,255,.12)', flexShrink: 0 }} onClick={() => onNavigate('projets')}>Voir le projet →</button>
          </div>

          {/* Progress */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', fontWeight: 500 }}>Avancement global</span>
              <span style={{ fontSize: 26, fontWeight: 600, color: mainProj.color || progressColor(mainProj.avancement), letterSpacing: '-1px', lineHeight: 1 }}>{mainProj.avancement}<span style={{ fontSize: 13, fontWeight: 500, opacity: .6 }}>%</span></span>
            </div>
            <div className="dash-hero-v2-track" style={{ height: 3 }}>
              <div className="dash-hero-v2-fill" style={{ width: mainProj.avancement + '%', background: mainProj.color || undefined }} />
            </div>
          </div>

          {/* Meta */}
          <div className="rg-4" style={{ gap: 14 }}>
            {[
              ['Phase', PHASE_LABELS[normalizePhase(mainProj.phase)] || mainProj.phase],
              ['Budget', formatShort(parseBudget(mainProj.budget))],
              ['Livraison', formatDateFR(mainProj.livraison)],
              ['Prochaine étape', nextStepLabel || 'À définir']
            ].map(([l, v]) => (
              <div key={l} style={{ padding: '12px 14px', background: 'rgba(255,255,255,.04)', borderRadius: 9, border: '1px solid rgba(255,255,255,.06)' }}>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 5 }}>{l}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Synthèse portefeuille — compact, pas de KPI géants redondants */}
      <div className="rg-3" style={{ gap: 12, marginBottom: 28 }}>
        <div onClick={() => onNavigate('projets')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)', cursor: 'pointer', transition: 'all .12s' }}>
          <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-1px', color: 'var(--tx)' }}>{allProjets.length}</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.3, textTransform: 'uppercase', letterSpacing: '.03em' }}>projet{allProjets.length > 1 ? 's' : ''} actif{allProjets.length > 1 ? 's' : ''}</div>
        </div>
        <div onClick={() => onNavigate('finance')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)', cursor: 'pointer', transition: 'all .12s' }}>
          <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.5px', color: 'var(--tx)' }}>{formatShort(totalBudget)}</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.3, textTransform: 'uppercase', letterSpacing: '.03em' }}>budget total</div>
        </div>
        <div onClick={() => onNavigate('chantier')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)', cursor: 'pointer', transition: 'all .12s' }}>
          <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.5px', color: 'var(--tx)' }}>{Math.round(allProjets.reduce((s, p) => s + (p.avancement || 0), 0) / allProjets.length)}%</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.3, textTransform: 'uppercase', letterSpacing: '.03em' }}>avancement moyen</div>
        </div>
      </div>

      {/* Projets en cours */}
      {allProjets.length > 1 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--t4)' }}>Tous les projets</div>
            <button className="btn btn-sm" style={{ fontSize: 10.5, padding: '4px 10px' }} onClick={() => onNavigate('projets')}>Voir tout</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {allProjets.filter(p => p.id !== mainProj?.id).slice(0, 4).map(p => (
              <div key={p.id} className="proj-row" onClick={() => onNavigate('projets')}>
                {p.img ? (
                  <img src={p.img} alt="" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
                ) : (
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: (p.color || '#F59E0B') + '10', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <AoGear size={15} color={p.color || '#F59E0B'} />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nom}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--t4)' }}>{p.client}</div>
                </div>
                <span style={{ fontSize: 9.5, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: 'rgba(0,0,0,.04)', color: 'var(--t2)', flexShrink: 0 }}>{PHASE_LABELS[normalizePhase(p.phase)] || p.phase}</span>
                <div style={{ width: 80, flexShrink: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: p.color || progressColor(p.avancement) }}>{p.avancement}%</span>
                  </div>
                  <div className="prog-track" style={{ height: 2 }}><div className="prog-fill" style={{ width: p.avancement + '%', background: p.color || undefined }} /></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activité récente — feed unifié avec filtres catégoriels */}
      {(() => {
        const ACT_TABS = [
          { id: 'all',         label: 'Tout' },
          { id: 'projets',     label: 'Projets' },
          { id: 'offres',      label: 'Offres' },
          { id: 'messages',    label: 'Messages' },
          { id: 'marketplace', label: 'Marketplace' },
        ]
        const CAT_COLOR = { projets: '#3B82F6', offres: '#F59E0B', messages: '#8B5CF6', marketplace: '#10B981' }
        const CAT_NAV   = { projets: 'projets', offres: 'offres', messages: 'messages', marketplace: 'marketplace' }

        const getCat = (item) => {
          if (item._src === 'notif') {
            const p = item.page || ''
            if (p === 'marketplace' || p === 'commandes') return 'marketplace'
            if (p === 'messages') return 'messages'
            if (p === 'offres' || p === 'bourse') return 'offres'
            return 'projets'
          }
          const a = item.action || ''
          if (a.includes('MESSAGE')) return 'messages'
          if (a.includes('OFFER') || a.includes('AO') || a.includes('MARKET')) return 'offres'
          if (a.includes('COMMANDE') || a.includes('PRODUCT') || a.includes('ORDER')) return 'marketplace'
          return 'projets'
        }

        const getIcon = (item, cat) => {
          if (item._src === 'notif') {
            if (cat === 'messages')    return <MessageSquare size={11} />
            if (cat === 'offres')      return <ClipboardList size={11} />
            if (cat === 'marketplace') return <Package size={11} />
            return <BarChart2 size={11} />
          }
          const a = item.action || ''
          if (a.includes('PAYMENT'))  return <Wallet size={11} />
          if (a.includes('OFFER') || a.includes('AO')) return <ClipboardList size={11} />
          if (a.includes('MESSAGE'))  return <MessageSquare size={11} />
          if (a.includes('DOCUMENT')) return <FileText size={11} />
          if (a.includes('USER'))     return <User size={11} />
          if (a.includes('DECISION')) return <CheckCircle2 size={11} />
          return <BarChart2 size={11} />
        }

        const relTime = (ts) => {
          if (!ts) return ''
          const diff = Date.now() - new Date(ts).getTime()
          const m = Math.floor(diff / 60000)
          if (m < 1)  return 'À l\'instant'
          if (m < 60) return `${m}min`
          const h = Math.floor(m / 60)
          if (h < 24) return `${h}h`
          return `${Math.floor(h / 24)}j`
        }

        // Activities feed
        const actItems = (store.activities || []).map(a => ({
          _src: 'activity', id: 'act_' + a.id,
          text: (() => { const l = translateAction(a.action); const d = a.data?.name || a.data?.title || a.data?.label || ''; return d ? `${l} — ${d}` : l })(),
          ts: a.ts, read: true, action: a.action,
        }))

        // Notifications feed
        const notifItems = (store.notifications || []).map(n => ({
          _src: 'notif', id: 'notif_' + n.id,
          text: n.msg || '', ts: n.ts, read: n.read ?? true, page: n.page, type: n.type,
        }))

        const merged = [...actItems, ...notifItems]
          .filter(x => x.text)
          .sort((a, b) => new Date(b.ts) - new Date(a.ts))
          .slice(0, 30)
          .map(x => ({ ...x, cat: getCat(x) }))

        const filtered = actTab === 'all' ? merged : merged.filter(x => x.cat === actTab)

        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--t4)' }}>Activité récente</div>
              <span style={{ fontSize: 10, color: 'var(--t4)' }}>{merged.length} entrées</span>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 5, marginBottom: 10, overflowX: 'auto', paddingBottom: 2 }}>
              {ACT_TABS.map(t => {
                const active = actTab === t.id
                const col = t.id === 'all' ? '#6B7280' : CAT_COLOR[t.id]
                const count = t.id === 'all' ? merged.length : merged.filter(x => x.cat === t.id).length
                return (
                  <button key={t.id} onClick={() => setActTab(t.id)} style={{ flexShrink: 0, fontSize: 10.5, fontWeight: active ? 700 : 500, padding: '4px 10px', borderRadius: 20, border: active ? `1.5px solid ${col}` : '1px solid var(--border-card)', background: active ? col + '18' : 'var(--surface-1)', color: active ? col : 'var(--t3)', cursor: 'pointer', transition: 'all .12s', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {t.label}
                    {count > 0 && <span style={{ fontSize: 9, fontWeight: 600, background: active ? col + '30' : 'var(--border-card)', color: active ? col : 'var(--t4)', borderRadius: 10, padding: '1px 5px' }}>{count}</span>}
                  </button>
                )
              })}
            </div>

            {/* Feed list */}
            <div style={{ background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)', overflow: 'hidden' }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 16px', color: 'var(--t4)', fontSize: 12 }}>Aucune activité dans cette catégorie</div>
              ) : filtered.slice(0, 8).map((item, i, arr) => (
                <div key={item.id} onClick={() => onNavigate(CAT_NAV[item.cat])} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none', cursor: 'pointer', position: 'relative' }}>
                  {!item.read && <div style={{ position: 'absolute', left: 5, top: '50%', transform: 'translateY(-50%)', width: 4, height: 4, borderRadius: '50%', background: CAT_COLOR[item.cat] }} />}
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: CAT_COLOR[item.cat] + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', color: CAT_COLOR[item.cat], flexShrink: 0 }}>
                    {getIcon(item, item.cat)}
                  </div>
                  <span style={{ fontSize: 11.5, color: 'var(--tx)', fontWeight: item.read ? 400 : 600, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.text}</span>
                  <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 100, background: CAT_COLOR[item.cat] + '15', color: CAT_COLOR[item.cat], flexShrink: 0, textTransform: 'uppercase', letterSpacing: '.04em' }}>{item.cat}</span>
                  <span style={{ fontSize: 10, color: 'var(--t4)', flexShrink: 0, minWidth: 38, textAlign: 'right' }}>{relTime(item.ts)}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
