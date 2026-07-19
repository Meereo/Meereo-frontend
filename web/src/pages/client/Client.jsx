import { useState, useMemo, useEffect, useCallback, Suspense, useRef } from 'react'
import { api } from '../../services/api/client'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import KaiAssistant from '../../components/shared/KaiAssistant'
import ProDirectory from '../../components/shared/ProDirectory'
import KaiQuota from '../../components/shared/KaiQuota'
import NotifBell from '../../components/shared/NotifBell'
import UserMenu from '../../components/shared/UserMenu'
import MeereoLogo from '../../components/shared/MeereoLogo'
import { Check, Star } from 'lucide-react'
import { useDevise } from '../../hooks/useDevise'
import { useMergedData } from '../../hooks/useMergedData'
import Home from './Home'
import Progress from './Progress'
import Decisions from './Decisions'
import Settings from './Settings'
import Documents from './Documents'
import Gallery from './Gallery'
import ProSearch from '../../components/shared/ProSearch'
import Tenders from './Tenders'
import ProAvatar from '../../components/shared/ProAvatar'
import Budget from './Budget'
import Marketplace from './Marketplace'
import Exchange from './Exchange'
import Offers from './Offers'
import Contracts from './Contracts'
import Orders from './Orders'
import Suppliers from './Suppliers'
import Messages from './Messages'
import Projects from './Projects'
import Passport from './Passport'

import { METIERS_AO } from '../../data/ao'
import { useMeereo } from '../../hooks/useMeereoStore'
import useUserIdentity from '../../hooks/useUserIdentity'
import '../../styles/client.css'


// Compute progress from etapes (done/total as %) — single source of truth
const computeProgressFromEtapes = (etapes) => {
  if (!etapes || !etapes.length) return 0
  const done = etapes.filter(e => e.done).length
  return Math.round(done / etapes.length * 100)
}

// Smart progress: combines taskStates (set by pro), étapes, and stored avancement
const computeSmartProgress = (project) => {
  if (!project) return 0

  // Priority 0 — task states set by the pro (most accurate, direct task completion)
  const taskStates = project.taskStates
  if (taskStates && typeof taskStates === 'object') {
    const keys = Object.keys(taskStates)
    if (keys.length > 0) {
      const done = keys.filter(k => taskStates[k] === 'done').length
      return Math.round(done / keys.length * 100)
    }
  }

  // Priority 1: explicit avancement stored in DB (set by pro via task completion)
  if (project.avancement > 0) return project.avancement

  // Priority 2: real progress from completed etapes phases
  const etapesP = computeProgressFromEtapes(project.etapes)
  if (etapesP > 0) return etapesP

  // Priority 3: minimal phase indicator (only if contract exists — shows project started)
  const hasMarkets = project._hasMarkets
  if (hasMarkets) {
    // Very conservative floors — just indicates project is under way, not % completed
    const PHASE_START = { SUIVI_CHANTIER: 5, RECEPTION: 10 }
    return PHASE_START[project.phase] || 0
  }
  return 0
}

// getMemberPhoto defined inside component to use merged data



export default function Client() {
  const navigate = useNavigate()
  const { store, updateStore, createAO, respondDecision, respondPayment, respondProjectInvitation, stopProject, respondCloture } = useMeereo()
  const { conversations: mergedConversations, documents: mergedDocuments } = useMergedData()
  const { format: fmtDevise, formatShort, parseBudget } = useDevise()
  const [page, setPage] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showToastMsg, setShowToastMsg] = useState(null)
  const showToast = msg => { setShowToastMsg(msg); setTimeout(() => setShowToastMsg(null), 2500) }
  // Client-side modal handler — cockpit components call openModal but client space handles differently
  const openModal = (type) => { showToast('Cette action sera bientôt disponible') }

  // Navigation depuis notifications / UserMenu
  useEffect(() => {
    const handler = (e) => setPage(e.detail)
    window.addEventListener('meereo-navigate', handler)
    return () => window.removeEventListener('meereo-navigate', handler)
  }, [])

  // Deep-link depuis ProfilApp : sessionStorage meereo_nav_page
  useEffect(() => {
    const pg = sessionStorage.getItem('meereo_nav_page')
    if (pg) { sessionStorage.removeItem('meereo_nav_page'); setPage(pg) }
  }, [])

  // Refresh projects / markets / members on mount AND when navigating to key pages
  // so the client picks up clotureStatus and other changes made by the pro
  const refreshProjects = useCallback(() => {
    Promise.all([
      api.projects.getAll().catch(() => null),
      api.projectMembers.getAll().catch(() => null),
      api.markets.getAll().catch(() => null),
    ]).then(([freshProjects, freshMembers, freshMarkets]) => {
      if (freshProjects) {
        const withCloture = freshProjects.filter(p => p.clotureStatus)
        console.log('[Client] Projects loaded:', freshProjects.length, '| With clotureStatus:', withCloture.length, withCloture.map(p => ({ id: p.id, nom: p.nom, clotureStatus: p.clotureStatus })))
      }
      updateStore(prev => ({
        ...prev,
        ...(freshProjects ? { projects: freshProjects } : {}),
        ...(freshMembers  ? { projectMembers: freshMembers } : {}),
        ...(freshMarkets  ? { markets: freshMarkets } : {}),
      }))
    })
  }, [updateStore])
  useEffect(() => { refreshProjects() }, []) // eslint-disable-line react-hooks/exhaustive-deps
  // Re-fetch when navigating to home or avancement (catches clotureStatus updates)
  useEffect(() => {
    if (page === 'home' || page === 'avancement' || page === 'projets') refreshProjects()
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  // Identite utilisateur — source unique
  const uid = useUserIdentity()
  const ob = store.onboardingData || {}
  const clientName = uid.displayName || ''
  const clientInitials = uid.initials || ''

  // Merged intervenants for member photos and pro directory (fixes B7 — was empty at module level)
  const { intervenants: mergedIntervenants } = useMergedData()
  const getMemberPhoto = (nom) => {
    if (!nom) return null
    const lastName = nom.split(' ').filter(Boolean).pop()?.toLowerCase()
    if (!lastName) return null
    const match = mergedIntervenants.find(i => i.nom?.toLowerCase().includes(lastName) && i.photo)
    return match?.photo || null
  }
  // Real professionals from the API (type=pro with metier + ville completed)
  const [apiPros, setApiPros] = useState([])
  useEffect(() => {
    api.professionals.getAll()
      .then(data => setApiPros((data || []).map(u => ({
        id: u.id,
        publicId: u.publicId || null,
        nom: u.company || u.name || '',
        metier: u.metier || '',
        ville: u.ville || '',
        note: 0,
        verified: u.verified || false,
        avatar: u.avatar || null,
      }))))
      .catch(() => {})
  }, [])
  // AO client
  const [showProDirectory, setShowProDirectory] = useState(false)
  const [dirSearch, setDirSearch] = useState('')
  // Single source of truth: store.aos filtered by ownership
  const displayedAOs = useMemo(() => {
    const userId = store.user?.id
    return (store.aos || []).filter(a => a.ownerUserId === userId)
  }, [store.aos, store.user?.id])

  // Auto-create AO when client chose "Je n'ai pas encore d'architecte" at registration
  // Runs once after store is hydrated AND user has no existing AOs
  const autoAOCreated = useRef(false)
  useEffect(() => {
    if (autoAOCreated.current) return
    if (!store._hydrated || !store.user?.id) return
    const situation = (store.onboardingData?.situation || '')
    if (!situation.includes("pas encore d'architecte")) return
    const userId = store.user.id
    const hasAOs = (store.aos || []).some(a => a.ownerUserId === userId)
    if (hasAOs) { autoAOCreated.current = true; return }
    autoAOCreated.current = true
    const ob = store.onboardingData || {}
    const projectType = ob.projectType || ob.situation || ''
    const budget = ob.budget || ''
    const description = ob.description
      ? ob.description
      : [projectType && `Type : ${projectType}`, ob.location && `Lieu : ${ob.location}`, ob.surface && `Surface : ${ob.surface}`].filter(Boolean).join(' — ')
    createAO({
      title: `Recherche architecte${projectType ? ' · ' + projectType : ''}`,
      lot: 'Architecte & Design',
      description,
      budget,
      createdByClient: true,
      autoGenerated: true,
    })
  }, [store._hydrated, store.user?.id, store.aos, store.onboardingData, createAO])
  // Search pros
  const [proSearch, setProSearch] = useState('')
  const [proMetier, setProMetier] = useState('all')
  const [topSearch, setTopSearch] = useState('')
  const [topSearchOpen, setTopSearchOpen] = useState(false)
  const searchBarRef = useRef(null)
  // Parametres / profil client

  // All client projects — filtered by ownership (client sees only their own)
  const clientProjects = useMemo(() => {
    const userId = store.user?.id
    const userEmail = (store.user?.email || ob.email || '').toLowerCase().trim()
    return (store.projects || [])
      .filter(p => {
        // Client sees projects where they are owner, clientId, or clientEmail matches
        if (p.ownerId === userId) return true
        if (p.clientId === userId) return true
        if (userEmail && (p.clientEmail || '').toLowerCase().trim() === userEmail) return true
        // Also show projects from accepted markets (auto-created)
        if (p.sourceAoId) {
          const ao = (store.aos || []).find(a => a.id === p.sourceAoId)
          if (ao && ao.ownerUserId === userId) return true
        }
        return false
      })
      .map(p => {
        const hasMarkets = (store.markets || []).some(m => m.projectId === p.id)
        return { ...p, nom: p.nom || p.name, etapes: p.etapes || [], _hasMarkets: hasMarkets, progress: computeSmartProgress({ ...p, _hasMarkets: hasMarkets }) }
      })
  }, [store.projects, store.user, store.aos, store.markets, ob.email])

  // Séparer projets actifs vs arrêtés/archivés
  const activeClientProjects = useMemo(() => clientProjects.filter(p => p.status !== 'stopped' && p.status !== 'archived'), [clientProjects])
  const stoppedClientProjects = useMemo(() => clientProjects.filter(p => p.status === 'stopped' || p.status === 'archived'), [clientProjects])

  const [stopConfirm, setStopConfirm] = useState(false)
  const [selProjId, setSelProjId] = useState(null)
  // Selected project — default to oldest still in progress (only among active projects)
  const proj = selProjId ? clientProjects.find(p => p.id === selProjId) || activeClientProjects[0] : activeClientProjects.find(p => p.progress < 100) || activeClientProjects[0]
  const projProgress = computeSmartProgress(proj)
  // Budget: project budget, fallback to market amount if no project budget
  const marketForProj = (store.markets || []).find(m => m.projectId === proj?.id)
  const projBudget = parseBudget(proj?.budget || '0') || parseBudget(String(marketForProj?.amount || marketForProj?.montant || '0'))
  // Documents: store only (no mock merge)
  const projDocs = useMemo(() => {
    return mergedDocuments.filter(d => d.projectId === proj?.id && d.visibility !== 'internal')
  }, [mergedDocuments, proj?.id])
  // Transactions: store only (no mock merge)
  const storeTx = (store.transactions || []).filter(t => (t.projet === proj?.id || t.projectId === proj?.id) && t.visibility !== 'internal')
  const projTx = storeTx
  const totalPaye = projTx.filter(t => t.type === 'credit').reduce((s, t) => s + (t.montant || t.amount || 0), 0)
  // Budget engagé = somme des marchés signés du projet (contrats validés)
  const projMarkets = (store.markets || []).filter(m => m.projectId === proj?.id)
  const totalEngage = projMarkets.reduce((s, m) => s + (parseFloat(m.montant) || parseFloat(m.amount) || 0), 0)
  const nonLus = mergedConversations.reduce((s, c) => s + (c.unread || 0), 0)

  // Synced data from store — decisions, payment requests, notifications
  const storeDecisions = (store.decisions || []).filter(d => d.projectId === proj?.id || !d.projectId)
  const pendingDecisions = storeDecisions.filter(d => d.statut === 'pending')
  const pendingPaymentReqs = (store.paymentRequests || []).filter(r => r.projectId === proj?.id && r.statut === 'pending')
  // Count pending actions (decisions + payment requests)
  const totalPendingActions = pendingDecisions.length + pendingPaymentReqs.length
  const pendingOffresCount = useMemo(() =>
    (store.offers || []).filter(o => o.statut === 'pending' || o.statut === 'en_attente' || o.statut === 'En attente').length
  , [store.offers])

  const filteredPros = apiPros.filter(p => {
    const metierOk = proMetier === 'all' || p.metier === proMetier
    const q = proSearch.toLowerCase()
    return metierOk && (!q || (p.nom + p.metier + p.ville).toLowerCase().includes(q))
  })

  const PAGES = {
    home: { label: 'Accueil', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>, group: 'Mon projet' },
    projets: { label: 'Mes projets', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>, group: 'Mon projet' },
    avancement: { label: 'Suivi du projet', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 18h20M4 18v-4a8 8 0 0116 0v4M12 2v4"/></svg>, group: 'Mon projet' },
    budget: { label: 'Budget', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>, group: 'Mon projet' },
    messages: { label: 'Messages', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>, group: 'Échanges', badge: nonLus > 0 ? nonLus : null, badgeColor: 'var(--err)' },
    decisions: { label: 'Choix & validations', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>, group: 'Échanges', badge: totalPendingActions > 0 ? totalPendingActions : null, badgeColor: 'var(--wrn)' },
    documents: { label: 'Documents', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>, group: 'Échanges' },
    ao: { label: 'Mes demandes', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>, group: 'Trouver' },
    offres: { label: 'Offres reçues', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>, group: 'Trouver', badge: pendingOffresCount > 0 ? pendingOffresCount : null, badgeColor: 'var(--wrn)' },
    marches: { label: 'Contrats validés', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.42 4.58a5.4 5.4 0 00-7.65 0l-.77.78-.77-.78a5.4 5.4 0 00-7.65 7.65l.78.77L12 20.65l7.65-7.65.77-.78a5.4 5.4 0 000-7.64z"/></svg>, group: 'Trouver' },
    marketplace: { label: 'Catalogue', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>, group: 'Achats' },
    fournisseurs: { label: 'Professionnels', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, group: 'Achats' },
    commandes: { label: 'Commandes', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>, group: 'Achats' },
    passport: { label: 'Passeport Numérique', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>, group: 'Mon projet' },
    parametres: { label: 'Paramètres', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>, group: 'Système' },
  }
  const groups = [...new Set(Object.values(PAGES).map(p => p.group))]

  return (
    <div className="client-layout">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.42)', zIndex: 199, backdropFilter: 'blur(2px)' }} onClick={() => setSidebarOpen(false)} />}
      {/* Sidebar */}
      <aside className={`client-sb${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="client-sb-logo">
          <MeereoLogo size={28} />
          <div><div style={{ fontSize: 11, fontWeight: 300, letterSpacing: 3 }}>MEEREO</div><div style={{ fontSize: 8, color: 'var(--t3)', letterSpacing: '.07em', textTransform: 'uppercase', marginTop: 1 }}>Espace Client</div></div>
        </div>
        <div className="client-sb-proj">
          {activeClientProjects.length > 1 && (
            <select value={proj?.id || ''} onChange={e => setSelProjId(e.target.value)} style={{ width: '100%', marginBottom: 8, padding: '5px 8px', border: '1px solid var(--border-card)', borderRadius: 6, fontSize: 10, fontFamily: 'var(--f)', background: 'var(--surface-1)', color: 'var(--tx)', cursor: 'pointer', outline: 'none' }}>
              {activeClientProjects.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          )}
          {activeClientProjects.length <= 1 && <div style={{ fontSize: 8, fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--t4)', marginBottom: 4 }}>Projet suivi</div>}
          {proj?.status === 'stopped' || proj?.status === 'archived' ? (
            <div style={{ fontSize: 11, fontWeight: 600, color: '#FF9500', marginBottom: 4 }}>Projet arrêté</div>
          ) : (
            <>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{proj?.nom}</div>
              <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 8 }}>{[proj?.address || proj?.localisation || proj?.adresse, proj?.budget || (projBudget > 0 ? formatShort(projBudget) : null)].filter(Boolean).join(' · ') || ' '}</div>
              <div className="prog-track" style={{ height: 3 }}><div className="prog-fill" style={{ width: projProgress + '%', background: '#F59E0B' }} /></div>
              <div style={{ fontSize: 9, color: 'var(--t4)', marginTop: 4 }}>{projProgress}%</div>
            </>
          )}
          {stoppedClientProjects.length > 0 && (
            <button onClick={() => setPage('projets')} style={{ marginTop: 10, width: '100%', display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', borderRadius: 6, background: 'rgba(255,149,0,.08)', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 10, fontWeight: 600, color: '#FF9500' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><line x1="8" y1="8" x2="16" y2="16"/></svg>
              {stoppedClientProjects.length} projet{stoppedClientProjects.length > 1 ? 's' : ''} arrêté{stoppedClientProjects.length > 1 ? 's' : ''}
            </button>
          )}
        </div>
        <nav className="client-sb-nav">
          {groups.map(g => (
            <div key={g}>
              <div style={{ fontSize: 8.5, fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--t5)', padding: '10px 10px 4px' }}>{g}</div>
              {Object.entries(PAGES).filter(([, v]) => v.group === g).map(([k, v]) => (
                <button key={k} className={`fourni-ni ${page === k ? 'on' : ''}`} onClick={() => { setPage(k); setSidebarOpen(false) }}>
                  <span style={{ color: { home:'#191c1d', avancement:'#EA580C', budget:'#16A34A', messages:'#7C3AED', decisions:'#F59E0B', documents:'#0891B2', ao:'#DC2626', offres:'#F59E0B', marches:'#16A34A', marketplace:'#0891B2', fournisseurs:'#2563EB', commandes:'#EA580C', parametres:'#6B7280' }[k] || '#6B7280' }}>{v.icon}</span> {v.label}
                  {v.badge && <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: v.badgeColor + '18', color: v.badgeColor }}>{v.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        {/* KAI Quota — bottom-left, meme position que cockpit */}
        <div style={{ padding: '0 10px 8px' }}><KaiQuota role="client" /></div>
        <div className="fourni-sb-foot" style={{ cursor: 'pointer' }} onClick={() => setPage('parametres')}>
          {uid.photo
            ? <img src={uid.photo} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex' }} />
            : null}
          <div className="fourni-sb-av" style={uid.photo ? { display: 'none' } : undefined}>{clientInitials}</div>
          <div>
            {clientName && <div style={{ fontSize: 12, fontWeight: 600 }}>{clientName}</div>}
            {uid.roleLabel && <div style={{ fontSize: 10, color: 'var(--t3)' }}>{uid.roleLabel}</div>}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="client-main">
        <div className="client-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="topbar-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Menu">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{PAGES[page]?.label || 'Accueil'}</span>
          </div>
          {/* Search bar — absolute center so it doesn't shift with title length */}
          <div ref={searchBarRef} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 420, maxWidth: 'calc(100% - 360px)', zIndex: 10 }}>
            <div data-search style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: 'transparent', borderRadius: 10, border: '1px solid var(--border-card)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={topSearch} onChange={e => { setTopSearch(e.target.value); setTopSearchOpen(true) }} onFocus={() => setTopSearchOpen(true)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setTopSearchOpen(false); setDirSearch(topSearch); setTopSearch(''); setShowProDirectory(true) } }} placeholder="Rechercher un professionnel..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', boxShadow: 'none', fontSize: 12.5, fontFamily: 'var(--f)', color: 'var(--tx)' }} />
              <select value={proMetier} onChange={e => { setProMetier(e.target.value); setTopSearchOpen(true) }} onFocus={() => setTopSearchOpen(true)} style={{ background: 'none', border: 'none', fontSize: 11, fontFamily: 'var(--f)', color: 'var(--t3)', cursor: 'pointer', outline: 'none' }}>
                <option value="all">Tous metiers</option>
                {METIERS_AO.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <NotifBell />
            <UserMenu onNavigate={setPage} />
          </div>
        </div>
        <div className="client-scroll">
          {/* Bannière projet arrêté */}
          {proj && (proj.status === 'stopped' || proj.status === 'archived') && (
            <div style={{ margin: '0 0 0 0', padding: '12px 24px', background: 'rgba(255,149,0,.08)', borderBottom: '1px solid rgba(255,149,0,.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="8" x2="16" y2="16"/></svg>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 12.5, fontWeight: 600, color: '#FF9500' }}>
                  {proj.status === 'stopped' ? 'Projet arrêté' : 'Projet archivé'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--t3)', marginLeft: 8 }}>
                  {proj.stoppedAt || proj.archivedAt ? 'Le ' + new Date(proj.stoppedAt || proj.archivedAt).toLocaleDateString('fr-FR') : ''}
                  {proj.status === 'stopped' ? ' — Ce projet a été arrêté. Consultez les archives pour accéder aux données.' : ' — Ce projet est archivé.'}
                </span>
              </div>
              <button onClick={() => setPage('projets')} style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 7, background: 'rgba(255,149,0,.12)', border: '1px solid rgba(255,149,0,.3)', color: '#FF9500', cursor: 'pointer', fontFamily: 'var(--f)', flexShrink: 0 }}>Voir mes projets</button>
            </div>
          )}
          {/* Modal arrêt confirmation */}
          {stopConfirm && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 2100, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setStopConfirm(false)}>
              <div style={{ background: 'var(--surface-1)', borderRadius: 16, width: 420, boxShadow: '0 24px 80px rgba(0,0,0,.2)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                <div style={{ padding: '24px 24px 16px', textAlign: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,149,0,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FF9500" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="8" x2="16" y2="16"/></svg>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 600, marginBottom: 8 }}>Arrêter ce projet ?</div>
                  <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.55 }}>Le projet sera marqué comme <strong>arrêté</strong> pour vous et votre prestataire. Les données restent accessibles dans les archives.</div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 8 }}>« {proj?.nom} »</div>
                </div>
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                  <button onClick={() => setStopConfirm(false)} style={{ flex: 1, padding: '11px 16px', borderRadius: 10, background: 'var(--surface-1)', color: 'var(--t3)', border: '1px solid var(--border)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>Annuler</button>
                  <button onClick={() => { stopProject(proj.id); setStopConfirm(false); showToast('Projet arrêté') }} style={{ flex: 1, padding: '11px 16px', borderRadius: 10, background: '#FF9500', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>Arrêter le projet</button>
                </div>
              </div>
            </div>
          )}
          <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', opacity: .4 }}><div style={{ width: 24, height: 24, border: '2.5px solid var(--border)', borderTopColor: 'var(--tx)', borderRadius: '50%', animation: 'spin .6s linear infinite' }} /></div>}>
          {/* HOME */}
          {page === 'home' && <Home ctx={{ proj, projProgress, projBudget, projMarkets, projDocs, totalEngage, totalPendingActions, pendingPaymentReqs, displayedAOs, nonLus, setPage, respondProjectInvitation, ob, store, clientName, fmtDevise, formatShort, getMemberPhoto, setShowProDirectory }} />}
          {/* AVANCEMENT */}
          {page === 'avancement' && <Progress ctx={{ proj, clientProjects: activeClientProjects, stoppedProjects: stoppedClientProjects, projProgress, setSelProjId, setPage, onStopProject: () => setStopConfirm(true), store, respondCloture, showToast, updateStore }} />}
          {/* BUDGET */}
          {page === 'budget' && <Budget showToast={showToast} onNavigate={p => setPage(p)} />}

          {/* MARKETPLACE */}
          {page === 'marketplace' && <Marketplace showToast={showToast} commerceScope="private" />}
          {page === 'fournisseurs' && <Suppliers showToast={showToast} openModal={openModal} />}
          {page === 'commandes' && <Orders showToast={showToast} openModal={openModal} onNavigate={p => setPage(p === 'marketplace' ? 'marketplace' : p)} />}
          {/* PARAMETRES / COMPTE */}
          {page === 'parametres' && <Settings ctx={{ ob, store, updateStore, showToast }} />}
          {page === 'passport' && <Passport />}

          {page === 'ao' && <Exchange showToast={showToast} onNavigate={p => setPage(p)} />}
          {page === 'offres' && <Offers showToast={showToast} openModal={openModal} />}
          {page === 'marches' && <Contracts showToast={showToast} openModal={openModal} onNavigate={p => setPage(p)} />}
          {page === 'projets' && <Projects showToast={showToast} openModal={openModal} onNavigate={p => setPage(p === 'chantier' ? 'avancement' : p)} />}

          {/* DOCUMENTS */}
          {page === 'documents' && <Documents showToast={showToast} />}

          {/* GALERIE */}
          {page === 'galerie' && <Gallery ctx={{ proj }} />}

          {/* MESSAGES */}
          {page === 'messages' && <Messages showToast={showToast} />}

          {/* DECISIONS */}
          {/* RECHERCHE PROFESSIONNELS */}
          {page === 'recherche' && <ProSearch ctx={{ proSearch, setProSearch, proMetier, setProMetier, filteredPros, navigate, updateStore, showToast, METIERS_AO }} />}

          {/* CREER UN AO CLIENT */}
          {page === 'creerAO' && <Tenders ctx={{ displayedAOs, store, setPage, showToast, proj, createAO }} />}

          {page === 'decisions' && <Decisions ctx={{ proj, store, pendingPaymentReqs, respondDecision, respondPayment, updateStore, showToast, fmtDevise }} />}
        </Suspense>
        </div>
      </main>

{/* ANNUAIRE PROFESSIONNELS */}
      <ProDirectory open={showProDirectory} onClose={() => setShowProDirectory(false)} initialSearch={dirSearch} />

      {/* Search dropdown — rendered as portal to escape topbar stacking context */}
      {topSearchOpen && createPortal(
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setTopSearchOpen(false)} />
          {(() => {
            const rect = searchBarRef.current?.getBoundingClientRect()
            if (!rect) return null
            const q = topSearch.trim().toLowerCase()
            const results = apiPros.filter(p => {
              const metierOk = proMetier === 'all' || p.metier === proMetier
              return metierOk && (!q || (p.nom + p.metier + p.ville).toLowerCase().includes(q))
            }).slice(0, 8)
            return (
              <div style={{ position: 'fixed', top: rect.bottom + 6, left: rect.left, width: rect.width, background: '#fff', border: '1px solid var(--border-card)', borderRadius: 12, boxShadow: '0 16px 48px rgba(0,0,0,.2)', maxHeight: 340, overflowY: 'auto', zIndex: 9999, fontFamily: 'var(--f)' }}>
                {results.length > 0 ? (<>
                  <div style={{ padding: '8px 14px', fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid var(--border)' }}>{results.length} professionnel{results.length > 1 ? 's' : ''}</div>
                  {results.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .1s' }} onClick={() => { setTopSearchOpen(false); setTopSearch(''); navigate(p.publicId ? `/pro/${p.slug || p.publicId}` : '/pro') }} onMouseOver={e => e.currentTarget.style.background = '#f5f5f7'} onMouseOut={e => e.currentTarget.style.background = ''}>
                      <ProAvatar nom={p.nom} size={32} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#111' }}>{p.nom}</span>
                          {p.verified && <span style={{ fontSize: 8, background: 'rgba(52,199,89,.08)', color: '#16A34A', padding: '1px 4px', borderRadius: 100, fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}><Check size={8}/></span>}
                        </div>
                        <div style={{ fontSize: 10.5, color: '#777', display: 'flex', alignItems: 'center', gap: 2 }}>{p.metier} · {p.ville} · <Star size={9} fill="#F59E0B" color="#F59E0B" strokeWidth={1.5}/> {p.note}</div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => { setTopSearchOpen(false); setTopSearch(''); setShowProDirectory(true) }} style={{ width: '100%', padding: '10px 14px', border: 'none', borderTop: '1px solid #eee', background: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 11.5, fontWeight: 600, color: '#777' }}>Voir tout l'annuaire â†’</button>
                </>) : (
                  <div style={{ padding: '28px 20px', textAlign: 'center' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 4 }}>Aucun résultat</div>
                    <div style={{ fontSize: 11.5, color: '#999', marginBottom: 14 }}>Aucun professionnel trouvé pour cette recherche.</div>
                    <button onClick={() => { setTopSearchOpen(false); setTopSearch(''); setShowProDirectory(true) }} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 600, color: '#111' }}>Voir tous les professionnels</button>
                  </div>
                )}
              </div>
            )
          })()}
        </>,
        document.body
      )}

      {showToastMsg && <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#191c1d', color: '#fff', padding: '10px 20px', borderRadius: 12, fontSize: 12.5, fontWeight: 600, zIndex: 99999, boxShadow: '0 8px 32px rgba(0,0,0,.18)' }}>{showToastMsg}</div>}
      <KaiAssistant context="client" userName={uid.firstName || (clientName || '').split(' ')[0] || ''} onNavigate={p => setPage(p)} />
    </div>
  )
}



