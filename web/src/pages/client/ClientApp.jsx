import { useState, useMemo, useEffect, Suspense, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import MoneyInput from '../../components/shared/MoneyInput'
import AoGear, { getMetierColor } from '../../components/shared/AoGear'
import KaiAssistant from '../../components/shared/KaiAssistant'
import ProDirectory from '../../components/shared/ProDirectory'
import KaiQuota from '../../components/shared/KaiQuota'
import NotifBell from '../../components/shared/NotifBell'
import UserMenu from '../../components/shared/UserMenu'
import KaiSubscription from '../../components/shared/KaiSubscription'
import DeleteAccountSection from '../../components/shared/DeleteAccountSection'
import { formatDateFR, formatBudgetDisplay } from '../../utils/helpers'
import MeereoLogo from '../../components/shared/MeereoLogo'
import { CHANTIER_PHASES } from '../../data/chantier'
import { Ruler, ClipboardList, HardHat as HardHatIcon, Wrench, Package, Sofa, CheckCircle2 as CheckCircle2Icon, MessageSquare, Store, Settings, FolderOpen, Users, Wallet, FileText, Camera, Radio, Check, X, Star } from 'lucide-react'
import { MKT_CATS, MKT_ITEMS } from '../../data/marketplace'
import { useDevise } from '../../hooks/useDevise'
import { useMergedData } from '../../hooks/useMergedData'
import { lazy } from 'react'
const MarketplacePage = lazy(() => import('../cockpit/MarketplacePage'))
const BoursePage = lazy(() => import('../cockpit/BoursePage'))
const OffresPage = lazy(() => import('../cockpit/OffresPage'))
const MarchesPage = lazy(() => import('../cockpit/MarchesPage'))
const CommandesPage = lazy(() => import('../cockpit/CommandesPage'))
const FournisseursPage = lazy(() => import('../cockpit/FournisseursPage'))
const MessagesPage = lazy(() => import('../cockpit/MessagesPage'))

import { METIERS_AO } from '../../data/ao'
import { getEntrepriseAvatar } from '../../data/avatars'
import { useMeereo } from '../../hooks/useMeereoStore'
import useUserIdentity from '../../hooks/useUserIdentity'
import { checkReplacementPreconditions } from '../../domain/replacementWorkflow'
import './client.css'

const PHASE_ICON_MAP = {
  '📐': <Ruler size={16}/>,
  '📋': <ClipboardList size={16}/>,
  '🏗️': <HardHatIcon size={16}/>,
  '🔧': <Wrench size={16}/>,
  '📦': <Package size={16}/>,
  '🛋️': <Sofa size={16}/>,
  '✅': <CheckCircle2Icon size={16}/>,
}

// fmt supprimé — utiliser fmtDevise() de useDevise() partout

// Compute progress from etapes (done/total as %) — single source of truth
const computeProgressFromEtapes = (etapes) => {
  if (!etapes || !etapes.length) return 0
  const done = etapes.filter(e => e.done).length
  return Math.round(done / etapes.length * 100)
}

// Smart progress: combines étapes, phase, and stored avancement
const computeSmartProgress = (project) => {
  if (!project) return 0
  // Priority 1: explicit avancement set by the system
  if (project.avancement > 0) return project.avancement
  // Priority 2: real progress from completed etapes
  const etapesP = computeProgressFromEtapes(project.etapes)
  if (etapesP > 0) return etapesP
  // Priority 3: phase-based estimate (only if project has active work)
  const hasMarkets = project._hasMarkets // set by caller if known
  if (hasMarkets) {
    const PHASE_PROGRESS = { ESQUISSE:5, AVANT_PROJET:12, PROJET_DETAILLE:25, PLANS_EXECUTION:35, CONSULTATION_ENTREPRISES:45, ATTRIBUTION_MARCHES:10, SUIVI_CHANTIER:65, RECEPTION:90 }
    return PHASE_PROGRESS[project.phase] || 0
  }
  return 0
}

// getMemberPhoto defined inside component to use merged data

const ProAvatar = ({ nom, size }) => {
  const av = getEntrepriseAvatar(nom)
  const sz = size || 42
  const initials = nom.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div style={{ width: sz, height: sz, borderRadius: sz / 2, background: av?.type === 'color' ? av.value : av?.type === 'img' ? 'var(--s2)' : 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: sz * .3, fontWeight: 800, color: av?.type === 'color' ? '#fff' : '#fff', flexShrink: 0, overflow: 'hidden' }}>
      {av?.type === 'img' ? <img src={av.value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} /> : (av?.initials || initials)}
    </div>
  )
}

// ═══ Composants Paramètres Client (state contrôlé, persistance réelle) ═══

function ClientProfileForm({ ob, store, updateStore, showToast }) {
  const [prenom, setPrenom] = useState(ob.prenom || '')
  const [nom, setNom] = useState(ob.nom || '')
  const [email, setEmail] = useState(ob.email || store.user?.email || '')
  const [tel, setTel] = useState(ob.tel || '')
  const [ville, setVille] = useState(ob.ville || 'Abidjan')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    updateStore(prev => ({
      ...prev,
      onboardingData: { ...(prev.onboardingData || {}), prenom, nom, email, tel, ville },
      user: prev.user ? { ...prev.user, name: `${prenom} ${nom}`.trim(), email, phone: tel } : prev.user,
    }))
    setSaved(true)
    showToast('Profil mis à jour')
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {ob.photoUrl && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
          <img src={ob.photoUrl} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700 }}>{prenom} {nom}</div>
            <div style={{ fontSize: 10, color: 'var(--t3)' }}>{store.user?.type === 'client' ? 'Client' : ''}</div>
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><label className="form-label">Prenom</label><input className="form-input" value={prenom} onChange={e => setPrenom(e.target.value)} /></div>
        <div><label className="form-label">Nom</label><input className="form-input" value={nom} onChange={e => setNom(e.target.value)} /></div>
      </div>
      <div><label className="form-label">Email</label><input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div><label className="form-label">Telephone</label><input className="form-input" value={tel} onChange={e => setTel(e.target.value)} /></div>
      <div><label className="form-label">Ville</label><input className="form-input" value={ville} onChange={e => setVille(e.target.value)} /></div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <button className="btn btn-primary btn-sm" onClick={handleSave}>{saved ? <><Check size={12}/> Enregistré</> : 'Enregistrer'}</button>
      </div>
    </div>
  )
}

function ClientSecurityForm({ showToast, updateStore }) {
  const [current, setCurrent] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = async () => {
    setError('')
    if (!current.trim()) { setError('Saisissez votre mot de passe actuel'); return }
    if (newPwd.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères'); return }
    if (newPwd !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    setLoading(true)
    try {
      const { api } = await import('../../services/api/client')
      await api.auth.changePassword({ currentPassword: current, newPassword: newPwd })
      setCurrent(''); setNewPwd(''); setConfirm('')
      showToast('Mot de passe mis à jour')
    } catch (e) {
      const msg = e.message || ''
      setError(msg.includes('incorrect') ? 'Mot de passe actuel incorrect' : msg.includes('8 caractères') ? msg : 'Erreur lors du changement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div><label className="form-label">Mot de passe actuel</label><input className="form-input" type="password" placeholder="••••••••" value={current} onChange={e => setCurrent(e.target.value)} /></div>
      <div><label className="form-label">Nouveau mot de passe</label><input className="form-input" type="password" placeholder="Minimum 8 caractères" value={newPwd} onChange={e => setNewPwd(e.target.value)} /></div>
      <div><label className="form-label">Confirmer le mot de passe</label><input className="form-input" type="password" placeholder="Confirmer" value={confirm} onChange={e => setConfirm(e.target.value)} /></div>
      {error && <div style={{ fontSize: 11, color: 'var(--err)', padding: '6px 10px', background: 'rgba(186,26,26,.05)', borderRadius: 8 }}>{error}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <button className="btn btn-primary btn-sm" onClick={handleChange} disabled={!current || !newPwd || !confirm || loading} style={{ opacity: (!current || !newPwd || !confirm || loading) ? .5 : 1 }}>{loading ? 'Modification...' : 'Changer le mot de passe'}</button>
      </div>
    </div>
  )
}

function ClientPrefsForm({ store, updateStore }) {
  const prefs = store.clientPrefs || { notifEmail: true, notifPush: true, rappels: false, resume: false }
  const toggle = (key) => {
    updateStore(prev => ({
      ...prev,
      clientPrefs: { ...(prev.clientPrefs || prefs), [key]: !(prev.clientPrefs || prefs)[key] }
    }))
  }
  const items = [
    { key: 'notifEmail', label: 'Notifications email' },
    { key: 'notifPush', label: 'Notifications push' },
    { key: 'rappels', label: 'Rappels projet' },
    { key: 'resume', label: 'Resume hebdomadaire' },
  ]
  return (
    <div>
      {items.map(item => {
        const on = (store.clientPrefs || prefs)[item.key]
        return (
          <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--t2)' }}>{item.label}</span>
            <div onClick={() => toggle(item.key)} style={{ width: 36, height: 20, borderRadius: 100, background: on ? 'var(--tx)' : 'var(--s3)', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .15s' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, transition: 'all .15s', ...(on ? { right: 3 } : { left: 3 }) }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ClientApp() {
  const navigate = useNavigate()
  const { store, updateStore, createAO, respondDecision, respondPayment, respondProjectInvitation } = useMeereo()
  const { conversations: mergedConversations } = useMergedData()
  const { format: fmtDevise, formatShort, parseBudget } = useDevise()
  const [page, setPage] = useState('home')
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
  const [showCreateAO, setShowCreateAO] = useState(false)
  const [clientAO, setClientAO] = useState({ titre: '', metier: '', desc: '', budget: '' })
  // Single source of truth: store.aos filtered by ownership
  const displayedAOs = useMemo(() => {
    const userId = store.user?.id
    return (store.aos || []).filter(a => a.ownerUserId === userId)
  }, [store.aos, store.user?.id])
  // Decisions filters
  const [decSearch, setDecSearch] = useState('')
  const [decTrade, setDecTrade] = useState('all')
  // Search pros
  const [proSearch, setProSearch] = useState('')
  const [proMetier, setProMetier] = useState('all')
  const [topSearch, setTopSearch] = useState('')
  const [topSearchOpen, setTopSearchOpen] = useState(false)
  const searchBarRef = useRef(null)
  // Parametres / profil client
  const [paramTab, setParamTab] = useState('profil')

  // All client projects — filtered by ownership (client sees only their own)
  const clientProjects = useMemo(() => {
    const userId = store.user?.id
    const userEmail = store.user?.email || ob.email
    return (store.projects || [])
      .filter(p => {
        // Client sees projects where they are owner, clientId, or clientEmail matches
        if (p.ownerId === userId) return true
        if (p.clientId === userId) return true
        if (userEmail && p.clientEmail === userEmail) return true
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
  const [selProjId, setSelProjId] = useState(null)
  // Selected project — default to oldest still in progress
  const proj = selProjId ? clientProjects.find(p => p.id === selProjId) || clientProjects[0] : clientProjects.find(p => p.progress < 100) || clientProjects[0]
  const projProgress = computeSmartProgress(proj)
  // Budget: project budget, fallback to market amount if no project budget
  const marketForProj = (store.markets || []).find(m => m.projectId === proj?.id)
  const projBudget = parseBudget(proj?.budget || '0') || parseBudget(String(marketForProj?.amount || marketForProj?.montant || '0'))
  // Documents: store only (no mock merge)
  const projDocs = useMemo(() => {
    return (store.documents || []).filter(d => d.projectId === proj?.id && d.visibility !== 'internal')
  }, [store.documents, proj?.id])
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

  const inputStyle = { width: '100%', padding: '10px 14px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)' }
  const labelStyle = { fontSize: 11, fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 4 }

  const filteredPros = apiPros.filter(p => {
    const metierOk = proMetier === 'all' || p.metier === proMetier
    const q = proSearch.toLowerCase()
    return metierOk && (!q || (p.nom + p.metier + p.ville).toLowerCase().includes(q))
  })

  const PAGES = {
    home: { label: 'Accueil', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>, group: 'Mon projet' },
    avancement: { label: 'Suivi du projet', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 18h20M4 18v-4a8 8 0 0116 0v4M12 2v4"/></svg>, group: 'Mon projet' },
    budget: { label: 'Budget', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>, group: 'Mon projet' },
    messages: { label: 'Messages', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>, group: 'Échanges', badge: nonLus > 0 ? nonLus : null, badgeColor: 'var(--err)' },
    decisions: { label: 'Choix & validations', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>, group: 'Échanges', badge: totalPendingActions > 0 ? totalPendingActions : null, badgeColor: 'var(--wrn)' },
    documents: { label: 'Documents', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>, group: 'Échanges' },
    ao: { label: 'Mes demandes', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>, group: 'Trouver' },
    offres: { label: 'Offres reçues', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>, group: 'Trouver' },
    marches: { label: 'Contrats validés', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.42 4.58a5.4 5.4 0 00-7.65 0l-.77.78-.77-.78a5.4 5.4 0 00-7.65 7.65l.78.77L12 20.65l7.65-7.65.77-.78a5.4 5.4 0 000-7.64z"/></svg>, group: 'Trouver' },
    marketplace: { label: 'Catalogue', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>, group: 'Achats' },
    fournisseurs: { label: 'Professionnels', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, group: 'Achats' },
    commandes: { label: 'Commandes', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>, group: 'Achats' },
    parametres: { label: 'Paramètres', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>, group: 'Système' },
  }
  const groups = [...new Set(Object.values(PAGES).map(p => p.group))]

  return (
    <div className="client-layout">
      {/* Sidebar */}
      <aside className="client-sb">
        <div className="client-sb-logo">
          <MeereoLogo size={28} />
          <div><div style={{ fontSize: 11, fontWeight: 300, letterSpacing: 3 }}>MEEREO</div><div style={{ fontSize: 8, color: 'var(--t3)', letterSpacing: '.07em', textTransform: 'uppercase', marginTop: 1 }}>Espace Client</div></div>
        </div>
        <div className="client-sb-proj">
          {clientProjects.length > 1 && (
            <select value={proj?.id || ''} onChange={e => setSelProjId(e.target.value)} style={{ width: '100%', marginBottom: 8, padding: '5px 8px', border: '1px solid var(--border-card)', borderRadius: 6, fontSize: 10, fontFamily: 'var(--f)', background: 'var(--surface-1)', color: 'var(--tx)', cursor: 'pointer', outline: 'none' }}>
              {clientProjects.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
            </select>
          )}
          {clientProjects.length <= 1 && <div style={{ fontSize: 8, fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--t4)', marginBottom: 4 }}>Projet suivi</div>}
          <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{proj?.nom}</div>
          <div style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 8 }}>{proj?.adresse} · {formatShort(projBudget)}</div>
          <div className="prog-track" style={{ height: 3 }}><div className="prog-fill" style={{ width: projProgress + '%', background: '#F59E0B' }} /></div>
          <div style={{ fontSize: 9, color: 'var(--t4)', marginTop: 4 }}>{projProgress}%</div>
        </div>
        <nav className="client-sb-nav">
          {groups.map(g => (
            <div key={g}>
              <div style={{ fontSize: 8.5, fontWeight: 500, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--t5)', padding: '10px 10px 4px' }}>{g}</div>
              {Object.entries(PAGES).filter(([, v]) => v.group === g).map(([k, v]) => (
                <button key={k} className={`fourni-ni ${page === k ? 'on' : ''}`} onClick={() => setPage(k)}>
                  <span style={{ color: { home:'#191c1d', avancement:'#EA580C', budget:'#16A34A', messages:'#7C3AED', decisions:'#F59E0B', documents:'#0891B2', ao:'#DC2626', offres:'#F59E0B', marches:'#16A34A', marketplace:'#0891B2', fournisseurs:'#2563EB', commandes:'#EA580C', parametres:'#6B7280' }[k] || '#6B7280' }}>{v.icon}</span> {v.label}
                  {v.badge && <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: v.badgeColor + '18', color: v.badgeColor }}>{v.badge}</span>}
                </button>
              ))}
            </div>
          ))}
        </nav>
        {/* KAI Quota — bottom-left, meme position que cockpit */}
        <div style={{ padding: '0 10px 8px' }}><KaiQuota role="client" /></div>
        <div className="fourni-sb-foot" style={{ cursor: 'pointer' }} onClick={() => setPage('parametres')}>
          {ob.photoUrl
            ? <img src={ob.photoUrl} alt="" style={{ width: 32, height: 32, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
            : <div className="fourni-sb-av">{clientInitials}</div>
          }
          <div>
            {clientName && <div style={{ fontSize: 12, fontWeight: 600 }}>{clientName}</div>}
            {uid.roleLabel && <div style={{ fontSize: 10, color: 'var(--t3)' }}>{uid.roleLabel}</div>}
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="client-main">
        <div className="client-topbar">
          <span style={{ fontSize: 13, fontWeight: 600 }}>{PAGES[page]?.label || 'Accueil'}</span>
          {/* Search bar — absolute center so it doesn't shift with title length */}
          <div ref={searchBarRef} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 420, maxWidth: 'calc(100% - 360px)', zIndex: 10 }}>
            <div data-search style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 14px', background: 'transparent', borderRadius: 10, border: '1px solid var(--border-card)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={topSearch} onChange={e => { setTopSearch(e.target.value); setTopSearchOpen(true) }} onFocus={() => topSearch && setTopSearchOpen(true)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); setTopSearchOpen(false); setDirSearch(topSearch); setTopSearch(''); setShowProDirectory(true) } }} placeholder="Rechercher un professionnel..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', boxShadow: 'none', fontSize: 12.5, fontFamily: 'var(--f)', color: 'var(--tx)' }} />
              <select value={proMetier} onChange={e => { setProMetier(e.target.value); setTopSearchOpen(true) }} style={{ background: 'none', border: 'none', fontSize: 11, fontFamily: 'var(--f)', color: 'var(--t3)', cursor: 'pointer', outline: 'none' }}>
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
          <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', opacity: .4 }}><div style={{ width: 24, height: 24, border: '2.5px solid var(--border)', borderTopColor: 'var(--tx)', borderRadius: '50%', animation: 'spin .6s linear infinite' }} /></div>}>
          {/* HOME */}
          {page === 'home' && (
            <div className="cl-home-fadein">
              {/* Invitations projet en attente */}
              {(() => {
                const email = ob.email || store.user?.email
                const pending = (store.projectInvitations || []).filter(i => i.clientEmail === email && i.status === 'pending')
                if (pending.length === 0) return null
                return pending.map(inv => {
                  const project = (store.projects || []).find(p => p.id === inv.projectId)
                  return (
                    <div key={inv.id} style={{ padding: 20, marginBottom: 16, background: 'rgba(124,58,237,.03)', border: '1px solid rgba(124,58,237,.12)', borderRadius: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><ClipboardList size={16}/></div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700 }}>Invitation projet</div>
                          <div style={{ fontSize: 11, color: 'var(--t3)' }}>De {inv.sentByName || 'un professionnel'}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12.5, color: 'var(--t2)', marginBottom: 12, lineHeight: 1.5 }}>
                        Vous êtes invité à rejoindre le projet <strong>{project?.nom || project?.name || 'Nouveau projet'}</strong>.
                        {project?.budget ? ` Budget : ${formatBudgetDisplay(project.budget)}.` : ''}
                        {project?.localisation ? ` Localisation : ${project.localisation}.` : ''}
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button onClick={() => respondProjectInvitation(inv.id, false)} style={{ flex: 1, padding: '10px 16px', borderRadius: 10, background: 'var(--surface-1)', color: 'var(--t3)', border: '1px solid var(--border)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>Refuser</button>
                        <button onClick={() => respondProjectInvitation(inv.id, true)} style={{ flex: 2, padding: '10px 16px', borderRadius: 10, background: '#7C3AED', color: '#fff', border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>Accepter le projet</button>
                      </div>
                    </div>
                  )
                })
              })()}
              {!proj ? (
                /* ═══ ÉTAT VIDE — Pas de projet ═══ */
                <div style={{ maxWidth: 640, margin: '0 auto', paddingTop: 10 }}>
                  {/* Greeting */}
                  <div style={{ marginBottom: 36 }}>
                    <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-.4px', color: 'var(--tx)' }}>Bienvenue, {clientName.split(' ')[0] || ''}</div>
                    <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 4 }}>Votre espace MEEREO est prêt.</div>
                  </div>

                  {/* Hero — contextuel selon la situation onboarding */}
                  {(() => {
                    const situation = ob.situation || ''
                    const hasArchi = situation.includes('déjà un architecte')
                    const cleEnMain = situation.includes('clé en main')
                    // Cas 1 : pas encore d'architecte (ou pas de situation renseignée)
                    let eyebrow = 'Demande envoyée'
                    let title = 'Votre demande a bien été envoyée'
                    let text = 'Des professionnels pourront bientôt vous répondre. Vous pourrez consulter leurs propositions et choisir avec qui avancer.'
                    let action = 'En attendant, vous pouvez aussi rechercher vous-même un architecte, un constructeur ou un autre métier adapté à votre projet.'
                    let cta = 'Rechercher un professionnel'
                    let ctaPage = 'ao'

                    if (hasArchi) {
                      // Cas 2 : architecte déjà identifié
                      eyebrow = 'Projet en préparation'
                      title = 'Votre projet se prépare'
                      text = 'Votre espace se met en place avec le professionnel associé à votre projet. Vous serez informé dès qu\'un document, une étape ou une action sera disponible.'
                      action = 'Vous pouvez aussi rechercher d\'autres métiers si vous souhaitez compléter votre équipe.'
                      cta = 'Compléter l\'équipe'
                      ctaPage = 'ao'
                    } else if (cleEnMain) {
                      // Cas 3 : prise en charge MEEREO / KAI
                      eyebrow = 'Prise en charge MEEREO'
                      title = 'MEEREO organise votre projet'
                      text = 'Nous prenons en charge la mise en place de votre projet. KAI vous accompagnera et vous tiendra informé des prochaines étapes.'
                      action = 'Les professionnels adaptés seront identifiés et proposés au bon moment. Vous pouvez aussi explorer par vous-même.'
                      cta = 'Explorer la plateforme'
                      ctaPage = 'marketplace'
                    }

                    return (
                      <div style={{ background: 'linear-gradient(150deg, #0f1011, #1a1d1e 40%, #2a2c2d)', borderRadius: 18, padding: '44px 40px', color: '#fff', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.03) 0%, transparent 60%)', pointerEvents: 'none' }} />
                        <div style={{ position: 'relative' }}>
                          <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 14 }}>{eyebrow}</div>
                          <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.5px', marginBottom: 10, lineHeight: 1.2 }}>{title}</div>
                          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.7, maxWidth: 440, marginBottom: 6 }}>{text}</div>
                          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.35)', lineHeight: 1.6, maxWidth: 440, marginBottom: 24 }}>{action}</div>
                          <button className="btn" style={{ background: '#fff', color: '#111', padding: '10px 20px', borderRadius: 10, fontSize: 12.5, fontWeight: 700, border: 'none', cursor: 'pointer' }} onClick={() => cta === 'Rechercher un professionnel' ? setShowProDirectory(true) : setPage(ctaPage)}>{cta}</button>
                        </div>
                      </div>
                    )
                  })()}

                  {/* Mes demandes en cours — AO visibles avec état rassurant */}
                  {displayedAOs.length > 0 && (
                    <div style={{ marginBottom: 32 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)' }}>Mes demandes en cours</div>
                        <button className="btn btn-sm" style={{ fontSize: 10.5, padding: '4px 10px' }} onClick={() => setPage('ao')}>Voir tout</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {displayedAOs.slice(0, 3).map(ao => {
                          const storeOffers = (store.offers || []).filter(o => o.aoId === ao.id)
                          const hasOffers = storeOffers.length > 0
                          const isClosed = ao.status === 'closed'
                          const date = formatDateFR(ao.createdAt)
                          return (
                            <div key={ao.id} style={{ background: 'var(--surface-1)', borderRadius: 14, border: '1px solid var(--border-card)', overflow: 'hidden' }}>
                              {/* Carte AO principale */}
                              <div onClick={() => setPage(hasOffers ? 'offres' : 'ao')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', cursor: 'pointer', transition: 'background .12s' }}>
                                <div style={{ width: 38, height: 38, borderRadius: 10, background: hasOffers ? 'rgba(22,163,74,.06)' : 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  {hasOffers
                                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>
                                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                                  }
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}><AoGear size={12} color={getMetierColor(ao.lot || ao.metier)} />{ao.title || ao.titre || 'Appel d\'offres'}</div>
                                  <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 2 }}>{ao.lot || ao.metier || ''}{date ? ' · Créé le ' + date : ''}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: isClosed ? 'var(--t4)' : hasOffers ? 'var(--ok)' : 'var(--wrn)' }} />
                                  <span style={{ fontSize: 11, fontWeight: 600, color: isClosed ? 'var(--t4)' : hasOffers ? 'var(--ok)' : 'var(--wrn)' }}>
                                    {isClosed ? 'Clôturé' : hasOffers ? storeOffers.length + ' offre' + (storeOffers.length > 1 ? 's' : '') : 'Publié'}
                                  </span>
                                </div>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6" /></svg>
                              </div>
                              {/* Message rassurant — visible tant qu'il n'y a pas de réponse */}
                              {!hasOffers && !isClosed && (
                                <div style={{ padding: '10px 18px 14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--wrn)', marginTop: 6, flexShrink: 0 }} />
                                  <div style={{ fontSize: 11.5, color: 'var(--t3)', lineHeight: 1.5 }}>
                                    Votre demande est bien publiée et visible par les professionnels concernés. Vous serez notifié dès qu'une proposition sera reçue.
                                  </div>
                                </div>
                              )}
                              {/* Résumé offres — visible quand des réponses existent */}
                              {hasOffers && (
                                <div onClick={() => setPage('offres')} style={{ padding: '10px 18px 14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                                  <div style={{ fontSize: 11.5, color: 'var(--ok)', fontWeight: 600 }}>
                                    {storeOffers.length} proposition{storeOffers.length > 1 ? 's' : ''} reçue{storeOffers.length > 1 ? 's' : ''} — consultez et comparez
                                  </div>
                                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--tx)' }}>Voir →</span>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Comment ça marche — version client */}
                  <div style={{ marginBottom: 32 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 14 }}>Comment ça marche</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                      {[
                        { n: '01', title: 'Découvrir le projet', desc: 'Comprendre la mission, les étapes et les intervenants.' },
                        { n: '02', title: 'Suivre l\'avancement', desc: 'Voir où en est le chantier en temps réel.' },
                        { n: '03', title: 'Valider les étapes', desc: 'Approuver les documents et livrables.' },
                        { n: '04', title: 'Recevoir la livraison', desc: 'Centraliser les PV, échanges et paiements.' },
                      ].map(step => (
                        <div key={step.n} style={{ padding: '18px 16px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)' }}>
                          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t4)', letterSpacing: '-1px', marginBottom: 10, lineHeight: 1 }}>{step.n}</div>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--tx)', marginBottom: 4 }}>{step.title}</div>
                          <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>{step.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explorer */}
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 14 }}>Explorer</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                      {[
                        { icon: <MessageSquare size={18}/>, label: 'Messages', desc: 'Échanger avec votre équipe', p: 'messages' },
                        { icon: <Store size={18}/>, label: 'Marketplace', desc: 'Parcourir les produits', p: 'marketplace' },
                        { icon: <Settings size={18}/>, label: 'Paramètres', desc: 'Configurer votre espace', p: 'parametres' },
                      ].map(btn => (
                        <div key={btn.p} onClick={() => setPage(btn.p)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)', cursor: 'pointer', transition: 'all .15s' }}>
                          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{btn.icon}</div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--tx)' }}>{btn.label}</div>
                            <div style={{ fontSize: 10.5, color: 'var(--t4)' }}>{btn.desc}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
              /* ═══ ÉTAT ACTIF — Projet en cours ═══ */
              <div>
                {/* Greeting */}
                <div style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.4px', color: 'var(--tx)' }}>Bonjour, {clientName.split(' ')[0] || ''}</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
                </div>

                {/* Actions urgentes — fusionne décisions + paiements */}
                {(() => {
                  const storePending = (store.decisions || []).filter(d => d.statut === 'pending' && (d.projectId === proj?.id || !d.projectId) && d.visibility !== 'internal').map(d => ({ id: d.id, label: d.titre, page: 'decisions', severity: 'warn' }))
                  const payReqs = pendingPaymentReqs.map(r => ({ id: r.id, label: r.label + ' — ' + fmtDevise(r.amount), page: 'budget', severity: 'critical' }))
                  const items = [...payReqs, ...storePending].slice(0, 3)
                  if (items.length === 0) return null
                  return (
                    <div style={{ marginBottom: 24 }}>
                      {items.map((item, i) => (
                        <div key={item.id || i} onClick={() => setPage(item.page)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 10, cursor: 'pointer', marginBottom: 6, transition: 'all .12s' }}>
                          <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{item.severity === 'critical' ? <Wallet size={14} color="var(--ok)"/> : <ClipboardList size={14} color="var(--wrn)"/>}</span>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--tx)', flex: 1 }}>{item.label}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                        </div>
                      ))}
                    </div>
                  )
                })()}

                {/* Hero projet */}
                <div className="dash-hero-v2" style={{ marginBottom: 28 }}>
                  <div className="dash-hero-v2-glow" />
                  <div style={{ position: 'relative' }}>
                    <div className="dash-hero-v2-eyebrow">Votre projet</div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                      <div>
                        <div className="dash-hero-v2-title">{proj.nom}</div>
                        <div className="dash-hero-v2-client">{proj.type ? proj.type + ' · ' : ''}{proj.adresse || ''}{projBudget ? ' · ' + formatShort(projBudget) : ''}</div>
                      </div>
                      <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.8)', border: '1px solid rgba(255,255,255,.12)', flexShrink: 0 }} onClick={() => setPage('avancement')}>Voir l'avancement →</button>
                    </div>
                    <div style={{ marginBottom: 28 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', fontWeight: 500 }}>Progression globale</span>
                        <span style={{ fontSize: 26, fontWeight: 800, color: proj.color || '#F59E0B', letterSpacing: '-1px', lineHeight: 1 }}>{projProgress}<span style={{ fontSize: 13, fontWeight: 500, opacity: .6 }}>%</span></span>
                      </div>
                      <div className="dash-hero-v2-track" style={{ height: 3 }}>
                        <div className="dash-hero-v2-fill" style={{ width: projProgress + '%', background: proj.color || undefined }} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                      {[
                        ['Phase', { ESQUISSE:'Esquisse', AVANT_PROJET:'Avant-projet', PROJET_DETAILLE:'Projet détaillé', PLANS_EXECUTION:'Plans d\'exécution', CONSULTATION_ENTREPRISES:'Consultation', ATTRIBUTION_MARCHES:'Attribution', SUIVI_CHANTIER:'Chantier', RECEPTION:'Réception' }[proj.phase] || proj.phase || '—'],
                        ['Budget engagé', totalEngage ? Math.round(totalEngage / Math.max(projBudget, 1) * 100) + '%' : '0%'],
                        ['Décisions', totalPendingActions > 0 ? totalPendingActions + ' en attente' : 'À jour'],
                        ['Livraison', formatDateFR(proj.livraison)],
                      ].map(([l, v]) => (
                        <div key={l} style={{ padding: '12px 14px', background: 'rgba(255,255,255,.04)', borderRadius: 9, border: '1px solid rgba(255,255,255,.06)' }}>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 5 }}>{l}</div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Phases du projet — timeline horizontale */}
                {(proj?.etapes || []).length > 0 && (
                  <div style={{ background: 'var(--surface-1)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '18px 22px', marginBottom: 28 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 14 }}>Phases du projet</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 12, left: 16, right: 16, height: 2, background: 'var(--s3)', borderRadius: 2 }} />
                      <div style={{ position: 'absolute', top: 12, left: 16, height: 2, borderRadius: 2, background: proj.color || '#F59E0B', width: ((proj.etapes.filter(e => e.done).length / Math.max(proj.etapes.length - 1, 1)) * 100) + '%', maxWidth: 'calc(100% - 32px)', transition: 'width .8s ease' }} />
                      {proj.etapes.map((e, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, zIndex: 1, flex: 1 }}>
                          <div style={{ width: e.current ? 26 : 20, height: e.current ? 26 : 20, borderRadius: '50%', background: e.done ? (proj.color || 'var(--tx)') : e.current ? '#fff' : 'var(--surface-1)', border: e.done ? 'none' : e.current ? '2px solid ' + (proj.color || 'var(--tx)') : '1.5px solid var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: e.current ? '0 0 0 4px rgba(0,0,0,.06)' : 'none', transition: 'all .3s ease' }}>
                            {e.done && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                            {e.current && <div style={{ width: 6, height: 6, borderRadius: '50%', background: proj.color || '#F59E0B' }} />}
                          </div>
                          <div style={{ fontSize: 8.5, fontWeight: e.done || e.current ? 700 : 400, color: e.current ? (proj.color || '#F59E0B') : e.done ? 'var(--tx)' : 'var(--t4)' }}>{e.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Synthèse rapide — 3 cards compactes */}
                {/* Mes demandes en cours — AO */}
                {displayedAOs.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)' }}>Mes demandes</div>
                      <button className="btn btn-sm" style={{ fontSize: 10.5, padding: '3px 10px' }} onClick={() => setPage('ao')}>Voir tout</button>
                    </div>
                    {displayedAOs.slice(0, 2).map(ao => {
                      const aoOffers = (store.offers || []).filter(o => o.aoId === ao.id)
                      const sLabel = ao.status === 'closed' ? 'Clôturé' : aoOffers.length > 0 ? aoOffers.length + ' offre' + (aoOffers.length > 1 ? 's' : '') : 'En attente'
                      const sColor = ao.status === 'closed' ? 'var(--t4)' : aoOffers.length > 0 ? 'var(--ok)' : 'var(--wrn)'
                      return (
                        <div key={ao.id} onClick={() => setPage('ao')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: 'var(--surface-1)', borderRadius: 10, border: '1px solid var(--border-card)', cursor: 'pointer', marginBottom: 6, transition: 'all .12s' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: sColor, flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}><AoGear size={11} color={getMetierColor(ao.lot || ao.metier)} />{ao.title || ao.titre}</div>
                            <div style={{ fontSize: 10.5, color: 'var(--t4)' }}>{ao.lot || ao.metier}{ao.budget && ao.budget !== '—' ? ' · ' + formatBudgetDisplay(ao.budget) : ''}</div>
                          </div>
                          <span style={{ fontSize: 10.5, fontWeight: 600, color: sColor, flexShrink: 0 }}>{sLabel}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6" /></svg>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 28 }}>
                  {[
                    { icon: <FolderOpen size={18}/>, label: 'Documents', sub: (projDocs?.length || 0) + ' disponibles', p: 'documents' },
                    { icon: <Users size={18}/>, label: 'Équipe', sub: ((proj?.equipe || []).length + projMarkets.filter(m => m.entreprise && !(proj?.equipe || []).some(e => e.nom === m.entreprise)).length) + ' intervenants', p: 'messages' },
                    { icon: <MessageSquare size={18}/>, label: 'Messages', sub: nonLus > 0 ? nonLus + ' non lus' : 'À jour', p: 'messages' },
                  ].map(card => (
                    <div key={card.label} onClick={() => setPage(card.p)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)', cursor: 'pointer', transition: 'all .12s' }}>
                      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{card.icon}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--tx)' }}>{card.label}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--t4)' }}>{card.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Prochaines étapes + Équipe — 2 colonnes */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {/* Prochaines étapes */}
                  <div style={{ background: 'var(--surface-1)', borderRadius: 14, border: '1px solid var(--border-card)', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>Prochaines étapes</div>
                    </div>
                    <div style={{ padding: 0 }}>
                      {(() => {
                        const allEtapes = proj?.etapes || []
                        const steps = allEtapes.filter(e => !e.done).slice(0, 4).map(e => ({ label: e.label || e.n, date: e.deadline || '' }))
                        if (allEtapes.length === 0) return <div style={{ padding: '20px 18px', textAlign: 'center', fontSize: 12, color: 'var(--t4)' }}>Aucune étape configurée</div>
                        if (steps.length === 0) return <div style={{ padding: '20px 18px', textAlign: 'center', fontSize: 12, color: 'var(--t4)' }}>Toutes les étapes sont terminées</div>
                        return steps.map((e, i, arr) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 ? '#F59E0B' : 'var(--s3)', flexShrink: 0 }} />
                            <div style={{ flex: 1, fontSize: 12, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? 'var(--tx)' : 'var(--t3)' }}>{e.label}</div>
                            {e.date && <span style={{ fontSize: 10, color: 'var(--t4)' }}>{formatDateFR(e.date)}</span>}
                          </div>
                        ))
                      })()}
                    </div>
                  </div>

                  {/* Équipe projet */}
                  <div style={{ background: 'var(--surface-1)', borderRadius: 14, border: '1px solid var(--border-card)', overflow: 'hidden' }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>Équipe projet</div>
                    </div>
                    <div style={{ padding: 0 }}>
                      {(() => {
                        // Merge equipe from project + enterprises from signed markets
                        const fromEquipe = proj?.equipe || []
                        const fromMarkets = projMarkets.filter(m => m.entreprise).map(m => ({ nom: m.entreprise, role: m.lot || 'Prestataire', statut: 'actif' }))
                        const allTeam = [...fromEquipe]
                        fromMarkets.forEach(fm => { if (!allTeam.some(t => t.nom === fm.nom)) allTeam.push(fm) })
                        return allTeam
                      })().length === 0 ? (
                        <div style={{ padding: '20px 18px', textAlign: 'center', fontSize: 12, color: 'var(--t4)' }}>L'équipe sera visible une fois le projet démarré</div>
                      ) : ((() => {
                        const fromEquipe = proj?.equipe || []
                        const fromMarkets = projMarkets.filter(m => m.entreprise).map(m => ({ nom: m.entreprise, role: m.lot || 'Prestataire', statut: 'actif' }))
                        const allTeam = [...fromEquipe]
                        fromMarkets.forEach(fm => { if (!allTeam.some(t => t.nom === fm.nom)) allTeam.push(fm) })
                        return allTeam
                      })().slice(0, 5).map((m, i, arr) => {
                        const initials = (m.nom || "").split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                        const photo = getMemberPhoto(m.nom)
                        return (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                            {photo
                              ? <img src={photo} alt="" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                              : <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'var(--t2)', flexShrink: 0 }}>{initials}</div>
                            }
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 600 }}>{m.nom}</div>
                              <div style={{ fontSize: 10, color: 'var(--t3)' }}>{m.role}</div>
                            </div>
                          </div>
                        )
                      }))}
                    </div>
                  </div>
                </div>
              </div>
              )}
            </div>
          )}

          {/* AVANCEMENT */}
          {page === 'avancement' && !proj && (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: .3 }}><HardHat size={32}/></div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--tx)', marginBottom: 6 }}>Aucun projet actif</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.6, maxWidth: 400, margin: '0 auto', marginBottom: 20 }}>Le suivi de projet démarre automatiquement quand vous acceptez une offre et qu'un marché est signé.</div>
              <button className="btn btn-primary btn-sm" onClick={() => setPage('ao')}>Publier un appel d'offres</button>
            </div>
          )}
          {page === 'avancement' && proj && (
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
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{proj?.nom}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{proj?.adresse} · {({ ESQUISSE:'Esquisse', AVANT_PROJET:'Avant-projet', PROJET_DETAILLE:'Projet détaillé', PLANS_EXECUTION:'Plans d\'exécution', CONSULTATION_ENTREPRISES:'Consultation', ATTRIBUTION_MARCHES:'Attribution', SUIVI_CHANTIER:'Chantier', RECEPTION:'Réception' })[proj?.phase] || proj?.phase || '—'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 22, fontWeight: 800 }}>{projProgress}%</div>
                  <div style={{ fontSize: 10, color: 'var(--t4)' }}>avancement</div>
                </div>
              </div>

              {/* Etapes projet — synced from pro */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Phases du projet</div>
                {(proj?.etapes || []).map((e, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: e.done ? 'var(--tx)' : e.current ? '#fff' : 'var(--s2)', border: e.done ? 'none' : e.current ? '2px solid var(--tx)' : '1.5px solid var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: e.done ? '#fff' : 'var(--t4)', flexShrink: 0 }}>{e.done ? <Check size={10}/> : i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: e.done || e.current ? 700 : 400, color: e.done || e.current ? 'var(--tx)' : 'var(--t4)' }}>{e.label}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: e.done ? 'rgba(52,199,89,.06)' : e.current ? 'rgba(245,158,11,.06)' : 'transparent', color: e.done ? 'var(--ok)' : e.current ? '#F59E0B' : 'var(--t4)' }}>{e.done ? 'Termine' : e.current ? 'En cours' : 'A venir'}</span>
                  </div>
                ))}
              </div>

              {/* Suivi chantier — shows real task completion from pro */}
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Suivi chantier</div>
              {CHANTIER_PHASES.map((ph, phIdx) => {
                // Derive phase status from etapes: map chantier phases to project etapes
                // Map chantier phases to main project phases via mainPhase field
                const etapeMapping = { 0: ['ESQUISSE','AVANT_PROJET','PROJET_DETAILLE','PLANS_EXECUTION'], 1: ['CONSULTATION_ENTREPRISES','ATTRIBUTION_MARCHES'], 2: ['SUIVI_CHANTIER'], 3: ['SUIVI_CHANTIER'], 4: ['SUIVI_CHANTIER'], 5: ['SUIVI_CHANTIER'], 6: ['RECEPTION'] }
                const mappedEtapes = (etapeMapping[phIdx] || []).map(label => (proj?.etapes || []).find(e => e.label === label)).filter(Boolean)
                const allDone = mappedEtapes.length > 0 && mappedEtapes.every(e => e.done)
                const anyActive = mappedEtapes.some(e => e.current)
                const doneTasks = allDone ? ph.tasks.length : anyActive ? ph.tasks.filter(t => t.defaultStatus === 'done').length : 0
                const pct = allDone ? 100 : Math.round(doneTasks / Math.max(ph.tasks.length, 1) * 100)

                return (
                  <div key={phIdx} className="card" style={{ padding: '14px 16px', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 16 }}>{PHASE_ICON_MAP[ph.icon] ?? ph.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{ph.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>{ph.desc}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 60 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: allDone ? 'var(--ok)' : anyActive ? 'var(--tx)' : 'var(--t4)' }}>{allDone ? 'Termine' : anyActive ? pct + '%' : 'A venir'}</div>
                        <div style={{ fontSize: 9, color: 'var(--t4)' }}>{ph.tasks.length} taches</div>
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
            </div>
          )}

          {/* BUDGET */}
          {page === 'budget' && !proj && (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
              <div style={{ marginBottom: 12, opacity: .3, display: 'flex', justifyContent: 'center' }}><Wallet size={32}/></div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--tx)', marginBottom: 6 }}>Aucun budget à afficher</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.6, maxWidth: 400, margin: '0 auto' }}>Le budget détaillé sera alimenté au démarrage du marché, après acceptation d'une offre.</div>
            </div>
          )}
          {page === 'budget' && proj && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                {[
                  { l: 'Budget total', v: formatShort(projBudget) },
                  { l: 'Paye', v: formatShort(totalPaye), color: 'var(--ok)' },
                  { l: 'Reste', v: formatShort(projBudget - totalPaye) },
                ].map((k, i) => (
                  <div key={i} className="card" style={{ padding: '18px 20px' }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 6 }}>{k.l}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: k.color || 'var(--tx)' }}>{k.v}</div>
                  </div>
                ))}
              </div>
              {/* Demandes de paiement en attente */}
              {pendingPaymentReqs.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Paiements a valider</div>
                  {pendingPaymentReqs.map(r => (
                    <div key={r.id} className="card" style={{ padding: '14px 18px', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{r.label}</div>
                        <span style={{ fontSize: 14, fontWeight: 800 }}>{fmtDevise(r.amount)}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary btn-sm" onClick={() => { respondPayment(r.id, 'approved'); showToast('Paiement approuve — budget mis à jour') }}>Approuver</button>
                        <button className="btn btn-sm" onClick={() => { respondPayment(r.id, 'rejected'); showToast('Paiement refuse') }}>Refuser</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Paiements approuvés récemment */}
              {(() => {
                const recentApproved = (store.paymentRequests || []).filter(r => (r.projectId === proj?.id) && r.statut === 'approved').slice(0, 3)
                return recentApproved.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Recemment approuves</div>
                    {recentApproved.map(r => (
                      <div key={r.id} className="card" style={{ padding: '12px 18px', marginBottom: 6, opacity: .7 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 20, height: 20, borderRadius: 6, background: 'rgba(52,199,89,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ok)', flexShrink: 0 }}><Check size={9}/></div>
                          <div style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{r.label}</div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ok)' }}>+{fmtDevise(r.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}

              <div className="card">
                <div className="card-header"><div className="card-title">Historique paiements</div></div>
                <div className="card-body" style={{ padding: 0 }}>
                  {projTx.length === 0 && <div style={{ padding: '24px 18px', textAlign: 'center', fontSize: 12, color: 'var(--t4)' }}>Aucune transaction</div>}
                  {projTx.map(t => (
                    <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.type === 'credit' ? 'var(--ok)' : 'var(--err)', flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: 12 }}>{t.label}</div>
                      <span style={{ fontSize: 10, color: 'var(--t4)' }}>{formatDateFR(t.date)}</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: t.type === 'credit' ? 'var(--ok)' : 'var(--err)' }}>{t.type === 'credit' ? '+' : '-'}{fmtDevise(t.montant || t.amount || 0)}</span>
                    </div>
                  ))}
                </div>
              </div>
              </div>
              )}

          {/* MARKETPLACE */}
          {page === 'marketplace' && <MarketplacePage showToast={showToast} commerceScope="private" />}
          {page === 'fournisseurs' && <FournisseursPage showToast={showToast} openModal={openModal} />}
          {page === 'commandes' && <CommandesPage showToast={showToast} openModal={openModal} onNavigate={p => setPage(p === 'marketplace' ? 'marketplace' : p)} />}
          {/* PARAMETRES / COMPTE */}
          {page === 'parametres' && (() => {
            const PARAM_TABS = [
              { id: 'profil', label: 'Mon profil' },
              { id: 'securite', label: 'Securite' },
              { id: 'prefs', label: 'Préférences' },
              { id: 'abonnement', label: 'Abonnement' },
              { id: 'donnees', label: 'Données' },
            ]
            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div><div style={{ fontSize: 15, fontWeight: 700 }}>Parametres</div><div style={{ fontSize: 12, color: 'var(--t3)' }}>Mon compte</div></div>
                </div>
                <div style={{ display: 'flex', gap: 24 }}>
                  {/* Tabs */}
                  <div style={{ width: 180, flexShrink: 0 }}>
                    {PARAM_TABS.map(t => (
                      <button key={t.id} onClick={() => setParamTab(t.id)} style={{ display: 'block', width: '100%', padding: '9px 14px', borderRadius: 8, border: 'none', background: paramTab === t.id ? 'var(--tx)' : 'transparent', color: paramTab === t.id ? '#fff' : 'var(--t2)', fontSize: 12.5, fontWeight: paramTab === t.id ? 700 : 500, fontFamily: 'var(--f)', cursor: 'pointer', textAlign: 'left', marginBottom: 4 }}>{t.label}</button>
                    ))}
                  </div>
                  {/* Content */}
                  <div style={{ flex: 1, maxWidth: 500 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>{PARAM_TABS.find(t => t.id === paramTab)?.label}</div>
                    {paramTab === 'profil' && (
                      <ClientProfileForm ob={ob} store={store} updateStore={updateStore} showToast={showToast} inputStyle={inputStyle} labelStyle={labelStyle} />
                    )}
                    {paramTab === 'securite' && (
                      <ClientSecurityForm showToast={showToast} updateStore={updateStore} inputStyle={inputStyle} labelStyle={labelStyle} />
                    )}
                    {paramTab === 'prefs' && (
                      <ClientPrefsForm store={store} updateStore={updateStore} />
                    )}
                    {paramTab === 'abonnement' && <KaiSubscription role="client" />}
                    {paramTab === 'donnees' && <DeleteAccountSection profileType="client" />}
                  </div>
                </div>
              </div>
            )
          })()}

          {page === 'ao' && <BoursePage showToast={showToast} onNavigate={p => setPage(p)} />}
          {page === 'offres' && <OffresPage showToast={showToast} openModal={openModal} />}
          {page === 'marches' && <MarchesPage showToast={showToast} openModal={openModal} onNavigate={p => setPage(p)} />}

          {/* DOCUMENTS */}
          {page === 'documents' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
              {projDocs.map(d => (
                <div key={d.id} className="card" style={{ padding: 14 }}>
                  <div style={{ height: 60, background: 'var(--s2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'var(--t3)', marginBottom: 8 }}>{(d.type || 'PDF').toUpperCase()}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nom}</div>
                  <div style={{ fontSize: 10, color: 'var(--t4)' }}>{formatDateFR(d.date)} · {d.taille}</div>
                </div>
              ))}
              {projDocs.length === 0 && (
                <div style={{ gridColumn: '1/-1', padding: '40px 24px', textAlign: 'center' }}>
                  <div style={{ marginBottom: 10, opacity: .3, display: 'flex', justifyContent: 'center' }}><FileText size={28}/></div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>{proj ? 'Aucun document partagé sur ce projet' : 'Aucun projet actif'}</div>
                  <div style={{ fontSize: 11, color: 'var(--t4)', lineHeight: 1.5 }}>{proj ? 'Les documents du projet apparaîtront ici au fur et à mesure de la mission.' : 'Acceptez une offre pour démarrer un projet et accéder aux documents.'}</div>
                </div>
              )}
            </div>
          )}

          {/* GALERIE */}
          {page === 'galerie' && (() => {
            const photos = (proj?.photos || []).filter(Boolean)
            return (
              <div>
                <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 16 }}>Photos et videos du chantier</div>
                {photos.length === 0 ? (
                  <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ marginBottom: 12, opacity: .3, display: 'flex', justifyContent: 'center' }}><Camera size={32}/></div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>Aucune photo</div>
                    <div style={{ fontSize: 12, color: 'var(--t3)' }}>Les photos de chantier apparaîtront ici au fur et à mesure de l'avancement.</div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {photos.map((url, i) => (
                      <div key={i} style={{ borderRadius: 10, overflow: 'hidden', aspectRatio: '4/3' }}>
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}

          {/* MESSAGES */}
          {page === 'messages' && <MessagesPage showToast={showToast} />}

          {/* DECISIONS */}
          {/* RECHERCHE PROFESSIONNELS */}
          {page === 'recherche' && (
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                <div data-search style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'transparent', borderRadius: 10, border: '1px solid var(--border-card)', flex: 1 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  <input value={proSearch} onChange={e => setProSearch(e.target.value)} placeholder="Rechercher un professionnel par nom, metier, ville..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, fontFamily: 'var(--f)', color: 'var(--tx)' }} />
                </div>
                <select value={proMetier} onChange={e => setProMetier(e.target.value)} style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid var(--border-card)', background: 'var(--s2)', fontSize: 12, fontFamily: 'var(--f)', color: 'var(--tx)' }}>
                  <option value="all">Tous les metiers</option>
                  {METIERS_AO.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 12 }}>{filteredPros.length} professionnel{filteredPros.length > 1 ? 's' : ''} trouve{filteredPros.length > 1 ? 's' : ''}</div>
              <div className="three-col">
                {filteredPros.map((p, i) => {
                  return (
                    <div key={i} className="card" style={{ padding: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                        <ProAvatar nom={p.nom} size={42} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontSize: 13, fontWeight: 700 }}>{p.nom}</span>
                            {p.verified && <span style={{ fontSize: 8, background: 'rgba(52,199,89,.08)', color: 'var(--ok)', padding: '1px 5px', borderRadius: 100, fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}><Check size={8}/></span>}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--t3)' }}>{p.metier} · {p.ville}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 10 }}>{Array.from({length:5},(_,i) => <Star key={i} size={12} fill={i < Math.round(p.note) ? '#F59E0B' : 'none'} color="#F59E0B" strokeWidth={1.5}/>)} <span style={{ fontWeight: 700, color: 'var(--t2)', fontSize: 12, marginLeft: 4 }}>{p.note}/5</span> <span style={{ fontSize: 10, color: 'var(--t4)' }}>({p.nbAvis} avis)</span></div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm" style={{ flex: 1, fontSize: 11 }} onClick={() => navigate('/profil')}>Voir profil</button>
                        <button className="btn btn-primary btn-sm" style={{ flex: 1, fontSize: 11 }} onClick={() => {
                          updateStore(prev => ({ ...prev, messages: [...(prev.messages || []), { id: 'msg_' + Date.now(), dest: p.nom, sujet: 'Demande de contact', texte: 'Bonjour, je souhaite vous contacter pour un projet.', type: 'contact', createdAt: new Date().toISOString() }] }))
                          showToast('Demande de contact envoyee a ' + p.nom)
                        }}>Contacter</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* CREER UN AO CLIENT */}
          {page === 'creerAO' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Mes appels d'offres</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)' }}>Publiez un AO pour trouver un professionnel</div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowCreateAO(true)}>+ Publier un appel d'offres</button>
              </div>
              {displayedAOs.length === 0 && !showCreateAO && (
                <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
                  <div style={{ marginBottom: 12, opacity: .3, display: 'flex', justifyContent: 'center' }}><Radio size={32}/></div>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Aucun appel d'offres</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 16 }}>Publiez un AO pour recevoir des propositions de professionnels qualifies</div>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowCreateAO(true)}>Publier mon premier AO</button>
                </div>
              )}
              {displayedAOs.map(ao => {
                const storeOffers = (store.offers || []).filter(o => o.aoId === ao.id)
                const nbRep = storeOffers.length || ao.reponses || 0
                const hasRep = nbRep > 0
                return (
                  <div key={ao.id} style={{ background: 'linear-gradient(145deg,#191c1d,#3c3b3b)', borderRadius: 14, padding: '22px 24px 18px', color: '#fff', marginBottom: 10, position: 'relative', overflow: 'hidden', cursor: hasRep ? 'pointer' : 'default' }} onClick={() => { if (hasRep) setPage('offres') }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(255,255,255,.05),transparent 55%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative' }}>
                      {/* Eyebrow */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Ma demande</span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,.25)' }}>·</span>
                        <span style={{ fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,.3)', fontFamily: 'monospace' }}>{ao.ref}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: hasRep ? 'rgba(52,199,89,.15)' : 'rgba(245,158,11,.15)', color: hasRep ? '#34c759' : '#F59E0B' }}>{hasRep ? nbRep + ' réponse' + (nbRep > 1 ? 's' : '') : 'En attente'}</span>
                      </div>
                      {/* Titre */}
                      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.3px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 7, lineHeight: 1.25 }}><AoGear size={14} color={getMetierColor(ao.metier || ao.lot)} />{ao.titre || ao.title}</div>
                      {/* Desc */}
                      {ao.desc && <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.4)', lineHeight: 1.5, marginBottom: 10, maxHeight: 36, overflow: 'hidden' }}>{ao.desc}</div>}
                      {/* Meta */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: getMetierColor(ao.metier || ao.lot) + '22', color: getMetierColor(ao.metier || ao.lot) }}>{ao.metier || ao.lot}</span>
                        {(ao.budget && ao.budget !== '—') && <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{formatBudgetDisplay(ao.budget)}</span>}
                      </div>
                      {/* Lien vers offres si réponses */}
                      {hasRep && (
                        <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: 'rgba(52,199,89,.9)', fontWeight: 600 }}>Voir les offres ({nbRep})</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {page === 'decisions' && (() => {
            // Decisions from store only — no hardcoded defaults
            const allStoreDecisions = store.decisions || []
            const allDecisions = allStoreDecisions.filter(sd =>
              (sd.projectId === proj?.id || !sd.projectId) &&
              sd.visibility !== 'internal'
            )

            // Statut logic: pending + info_requested = active | approved + rejected + cancelled = resolved
            const isActive = d => d.statut === 'pending' || d.statut === 'info_requested'
            const isResolved = d => !isActive(d)

            // Filtering state (uses component-level state from decSearch/decTrade)
            const q = (decSearch || '').toLowerCase()
            const tradeOk = t => !decTrade || decTrade === 'all' || (t || '').toLowerCase() === decTrade.toLowerCase()
            const searchOk = d => !q || (d.titre + (d.desc || '') + (d.trade || '')).toLowerCase().includes(q)
            const filtered = allDecisions.filter(d => tradeOk(d.trade) && searchOk(d))
            const active = filtered.filter(isActive)
            const resolved = filtered.filter(isResolved)

            const respond = (d, response) => {
              if (d.id.startsWith('dec_')) {
                updateStore(prev => ({ ...prev, decisions: [...(prev.decisions || []).filter(x => x.id !== d.id), { ...d, id: d.id, titre: d.titre, desc: d.desc, trade: d.trade, sourceType: d.sourceType, statut: response, respondedAt: new Date().toISOString() }] }))
              } else {
                respondDecision(d.id, response)
              }
              const labels = { approved: 'validée', rejected: 'refusée', info_requested: 'info demandée' }
              showToast('Décision ' + (labels[response] || response) + ' — le professionnel sera notifié')
            }
            const statusLabel = s => s === 'approved' || s === 'validee' ? 'Validée' : s === 'rejected' ? 'Refusée' : s === 'info_requested' || s === 'info' ? 'Info demandée' : s
            const statusColor = s => s === 'approved' || s === 'validee' ? 'var(--ok)' : s === 'rejected' ? 'var(--err)' : 'var(--color-info)'
            const statusBg = s => s === 'approved' || s === 'validee' ? 'rgba(52,199,89,.08)' : s === 'rejected' ? 'rgba(186,26,26,.06)' : 'rgba(0,122,255,.08)'
            const statusIcon = s => s === 'approved' || s === 'validee' ? <Check size={10}/> : s === 'rejected' ? <X size={10}/> : <span style={{fontSize:10}}>?</span>

            return (
              <div>
                {/* Pending payment requests from pro */}
                {pendingPaymentReqs.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Paiements en attente</div>
                    {pendingPaymentReqs.map(r => (
                      <div key={r.id} className="card" style={{ padding: '14px 18px', marginBottom: 8, borderLeft: '3px solid var(--color-info)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{r.label}</div>
                          <span style={{ fontSize: 13, fontWeight: 800 }}>{fmtDevise(r.amount)}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => { respondPayment(r.id, 'approved'); showToast('Paiement approuve') }}>Approuver</button>
                          <button className="btn btn-sm" onClick={() => { respondPayment(r.id, 'rejected'); showToast('Paiement refuse') }}>Refuser</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Search + trade filter */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <div data-search style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', background: 'transparent', borderRadius: 8, border: '1px solid var(--border-card)', flex: 1 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input value={decSearch} onChange={e => setDecSearch(e.target.value)} placeholder="Rechercher une décision..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 12, fontFamily: 'var(--f)', color: 'var(--tx)' }} />
                  </div>
                  <select value={decTrade} onChange={e => setDecTrade(e.target.value)} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border-card)', background: 'var(--s2)', fontSize: 11, fontFamily: 'var(--f)', color: 'var(--tx)' }}>
                    <option value="all">Tous metiers</option>
                    {METIERS_AO.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 12 }}>Choix en attente de votre validation</div>
                {active.length === 0 && pendingPaymentReqs.length === 0 && (
                  <div className="card" style={{ padding: '32px 24px', textAlign: 'center' }}>
                    <div style={{ marginBottom: 8, opacity: .3, display: 'flex', justifyContent: 'center' }}><CheckCircle2Icon size={24}/></div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t3)' }}>Aucune decision en attente</div>
                  </div>
                )}
                {active.map(d => (
                  <div key={d.id} className="card" style={{ padding: '16px 18px', marginBottom: 10, borderLeft: d.urgent ? '3px solid var(--wrn)' : d.statut === 'info_requested' ? '3px solid var(--color-info)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{d.titre}</div>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        {d.trade && <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 100, background: 'rgba(0,0,0,.04)', color: 'var(--t3)' }}>{d.trade}</span>}
                        {d.urgent && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 100, background: 'rgba(255,149,0,.08)', color: 'var(--wrn)' }}>Urgent</span>}
                        {d.statut === 'info_requested' && <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 100, background: 'rgba(0,122,255,.08)', color: 'var(--color-info)' }}>Info demandee</span>}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.5, marginBottom: 12 }}>{d.desc || ''}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => respond(d, 'approved')}>Valider</button>
                      <button className="btn btn-sm" onClick={() => respond(d, 'rejected')}>Refuser</button>
                      {d.statut !== 'info_requested' && <button className="btn btn-sm" onClick={() => respond(d, 'info_requested')}>Demander plus d'infos</button>}
                    </div>
                  </div>
                ))}
                {resolved.length > 0 && (
                  <div style={{ marginTop: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Decisions traitees</div>
                    {resolved.map(d => (
                      <div key={d.id} className="card" style={{ padding: '12px 18px', marginBottom: 6, opacity: .6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 6, background: statusBg(d.statut), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0, color: statusColor(d.statut) }}>{statusIcon(d.statut)}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600 }}>{d.titre}</div>
                            {d.trade && <div style={{ fontSize: 9, color: 'var(--t4)' }}>{d.trade}</div>}
                          </div>
                          <span style={{ fontSize: 9, fontWeight: 600, color: statusColor(d.statut) }}>{statusLabel(d.statut)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}
        </Suspense>
        </div>
      </main>

      {/* Modal creer AO */}
      {showCreateAO && (() => {
        // Vérification préconditions métier — un marché actif sur ce métier bloque le nouveau flux
        const precondCheck = clientAO.metier ? checkReplacementPreconditions(clientAO.metier, proj?.id, store.markets || []) : { allowed: true, message: null }
        const canPublish = clientAO.titre.trim() && clientAO.metier && precondCheck.allowed

        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setShowCreateAO(false)}>
            <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 500, boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>Publier un appel d'offres</div>
                  {proj && <div style={{ fontSize: 10, color: 'var(--t4)', marginTop: 2 }}>Projet : {proj.nom}</div>}
                </div>
                <button onClick={() => setShowCreateAO(false)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t3)' }}>×</button>
              </div>
              <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ padding: '10px 14px', background: 'var(--s2)', borderRadius: 10, fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>
                  Decrivez votre besoin. Les professionnels du metier selectionne recevront votre appel et pourront vous envoyer une proposition.
                </div>
                <div><label className="form-label">Titre *</label><input className="form-input" value={clientAO.titre} onChange={e => setClientAO(p => ({ ...p, titre: e.target.value }))} placeholder="ex: Recherche architecte pour renovation appartement" /></div>
                <div><label className="form-label">Type de professionnel *</label>
                  <select className="form-input" value={clientAO.metier} onChange={e => setClientAO(p => ({ ...p, metier: e.target.value }))}>
                    <option value="">Choisir un metier</option>
                    {METIERS_AO.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                {/* Précondition métier — alerte si marché actif */}
                {clientAO.metier && !precondCheck.allowed && (
                  <div style={{ padding: '10px 14px', background: 'rgba(186,26,26,.05)', border: '1px solid rgba(186,26,26,.12)', borderRadius: 10, fontSize: 11, color: 'var(--err)', lineHeight: 1.5 }}>
                    <div style={{ fontWeight: 700, marginBottom: 4 }}>Flux bloque</div>
                    {precondCheck.message}
                  </div>
                )}
                {clientAO.metier && precondCheck.allowed && precondCheck.needType === 'complementary' && (
                  <div style={{ padding: '10px 14px', background: 'rgba(52,199,89,.05)', border: '1px solid rgba(52,199,89,.12)', borderRadius: 10, fontSize: 11, color: 'var(--ok)', lineHeight: 1.5 }}>
                    Besoin complementaire — le lot precedent est cloture. Vous pouvez publier un nouvel AO.
                  </div>
                )}
                <div><label className="form-label">Description du projet</label><textarea className="form-input" value={clientAO.desc} onChange={e => setClientAO(p => ({ ...p, desc: e.target.value }))} placeholder="Surface, type de travaux, contraintes, delai souhaite..." /></div>
                <div><label className="form-label">Budget estimatif (FCFA)</label><MoneyInput value={clientAO.budget} onChange={v => setClientAO(p => ({ ...p, budget: v }))} placeholder="5 000 000" /></div>
              </div>
              <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button className="btn btn-sm" onClick={() => setShowCreateAO(false)}>Annuler</button>
                <button className="btn btn-primary btn-sm" disabled={!canPublish} style={{ opacity: canPublish ? 1 : .5 }} onClick={async () => {
                  if (!canPublish) return
                  await createAO({ title: clientAO.titre, description: clientAO.desc, budget: clientAO.budget, lot: clientAO.metier, projectId: proj?.id, needType: precondCheck.needType, createdByClient: true })
                  setShowCreateAO(false)
                  setClientAO({ titre: '', metier: '', desc: '', budget: '' })
                  showToast('Appel d\'offres publie — les ' + clientAO.metier + 's seront notifies')
                }}>Publier l'AO</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ═══ ANNUAIRE PROFESSIONNELS — composant partagé ═══ */}
      <ProDirectory open={showProDirectory} onClose={() => setShowProDirectory(false)} initialSearch={dirSearch} />

      {/* Search dropdown — rendered as portal to escape topbar stacking context */}
      {topSearchOpen && topSearch.trim().length >= 2 && createPortal(
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 9998 }} onClick={() => setTopSearchOpen(false)} />
          {(() => {
            const rect = searchBarRef.current?.getBoundingClientRect()
            if (!rect) return null
            const results = apiPros.filter(p => {
              const metierOk = proMetier === 'all' || p.metier === proMetier
              return metierOk && (p.nom + p.metier + p.ville).toLowerCase().includes(topSearch.toLowerCase())
            }).slice(0, 6)
            return (
              <div style={{ position: 'fixed', top: rect.bottom + 6, left: rect.left, width: rect.width, background: '#fff', border: '1px solid var(--border-card)', borderRadius: 12, boxShadow: '0 16px 48px rgba(0,0,0,.2)', maxHeight: 340, overflowY: 'auto', zIndex: 9999, fontFamily: 'var(--f)' }}>
                {results.length > 0 ? (<>
                  <div style={{ padding: '8px 14px', fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid var(--border)' }}>{results.length} professionnel{results.length > 1 ? 's' : ''}</div>
                  {results.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .1s' }} onClick={() => { setTopSearchOpen(false); setTopSearch(''); navigate('/profil') }} onMouseOver={e => e.currentTarget.style.background = '#f5f5f7'} onMouseOut={e => e.currentTarget.style.background = ''}>
                      <ProAvatar nom={p.nom} size={32} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#111' }}>{p.nom}</span>
                          {p.verified && <span style={{ fontSize: 8, background: 'rgba(52,199,89,.08)', color: '#16A34A', padding: '1px 4px', borderRadius: 100, fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}><Check size={8}/></span>}
                        </div>
                        <div style={{ fontSize: 10.5, color: '#777', display: 'flex', alignItems: 'center', gap: 2 }}>{p.metier} · {p.ville} · <Star size={9} fill="#F59E0B" color="#F59E0B" strokeWidth={1.5}/> {p.note}</div>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => { setTopSearchOpen(false); setTopSearch(''); setShowProDirectory(true) }} style={{ width: '100%', padding: '10px 14px', border: 'none', borderTop: '1px solid #eee', background: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 11.5, fontWeight: 600, color: '#777' }}>Voir tout l'annuaire →</button>
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
      <KaiAssistant context="client" userName={uid.firstName || clientName.split(' ')[0] || ''} onNavigate={p => setPage(p)} />
    </div>
  )
}
