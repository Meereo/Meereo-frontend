import { useState, useCallback, useEffect, useRef, lazy, Suspense } from 'react'
import CockpitLayout from '../../components/layout/CockpitLayout'
import Modal from '../../components/shared/Modal'
import { useMeereo } from '../../hooks/useMeereoStore'
import { api } from '../../services/api/client'
import KaiAssistant from '../../components/shared/KaiAssistant'
import ProDirectory from '../../components/shared/ProDirectory'
import '../../styles/cockpit.css'

// Dashboard loaded eagerly (first page seen), all others lazy
import Dashboard from './Dashboard'
const Projects = lazy(() => import('./Projects'))
const Clients = lazy(() => import('./Clients'))
const Messages = lazy(() => import('./Messages'))
const Worksite = lazy(() => import('./Worksite'))
const Contractors = lazy(() => import('./Contractors'))
const Payments = lazy(() => import('./Payments'))
const Marketplace = lazy(() => import('./Marketplace'))
const Agenda = lazy(() => import('./Agenda'))
const Offers = lazy(() => import('./Offers'))
const Exchange = lazy(() => import('./Exchange'))
const Documents = lazy(() => import('./Documents'))
const Integrations = lazy(() => import('./Integrations'))
const Settings = lazy(() => import('./Settings'))
const Contracts = lazy(() => import('./Contracts'))
const Reports = lazy(() => import('./Reports'))
const Orders = lazy(() => import('./Orders'))
const Suppliers = lazy(() => import('./Suppliers'))
const Finance = lazy(() => import('./Finance'))
const TasksBoard = lazy(() => import('./TasksBoard'))
const Budget = lazy(() => import('./Budget'))
const Missions = lazy(() => import('./Missions'))
const Assets = lazy(() => import('./Assets'))
const PageBuilder = lazy(() => import('./PageBuilder'))
const PAGES = {
  dashboard: Dashboard, projets: Projects, clients: Clients, messages: Messages,
  chantier: Worksite, intervenants: Contractors, paiements: Payments,
  marketplace: Marketplace, agenda: Agenda, offres: Offers, bourse: Exchange,
  documents: Documents, integrations: Integrations, parametres: Settings,
  marches: Contracts, rapports: Reports, commandes: Orders,
  fournisseurs: Suppliers, finance: Finance, 'taches-board': TasksBoard,
  budget: Budget, missions: Missions, actifs: Assets, 'page-builder': PageBuilder,
}

// Suspense fallback — minimal loading indicator
const PageLoader = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', opacity: .4 }}>
    <div style={{ width: 24, height: 24, border: '2.5px solid var(--border)', borderTopColor: 'var(--tx)', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
  </div>
)

// Form styles now in cockpit.css: .form-input, .form-label

// Contacts invitables for EventForm — uses store.intervenants (API) + project equipe members
function getInvitableContacts(projects, intervenants) {
  const contacts = []
  const seen = new Set()
  ;(intervenants || []).forEach(i => { if (i && !seen.has(i.nom)) { seen.add(i.nom); contacts.push({ id: i.id, nom: i.nom, role: i.role || i.specialite || '', email: i.email || '', source: 'equipe' }) } })
  ;(projects || []).forEach(p => (p.equipe || []).forEach(m => { if (!seen.has(m.nom)) { seen.add(m.nom); contacts.push({ id: m.id, nom: m.nom, role: m.role, email: '', source: 'projet' }) } }))
  return contacts
}

function EventForm({ formRef }) {
  const { store } = useMeereo()
  const projects = (store.projects || []).filter(p => p.status !== 'archived' && p.status !== 'stopped' && p.status !== 'deleted')
  const intervenants = store.intervenants || []
  const [evTitle, setEvTitle] = useState('')
  const [evDate, setEvDate] = useState('')
  const [evTime, setEvTime] = useState('09:00')
  const [evProjet, setEvProjet] = useState('')
  const [evType, setEvType] = useState('Reunion')
  const [inviteSearch, setInviteSearch] = useState('')
  const [invited, setInvited] = useState([])
  const [inviteEmail, setInviteEmail] = useState('')
  if (formRef) formRef.current = { title: evTitle, date: evDate, time: evTime, projet: evProjet, type: evType, invited }

  const available = inviteSearch
    ? getInvitableContacts(projects, intervenants).filter(c => (c.nom + c.role).toLowerCase().includes(inviteSearch.toLowerCase()) && !invited.find(inv => inv.id === c.id))
    : []

  const addInvite = (c) => { setInvited(prev => [...prev, { ...c, status: 'pending' }]); setInviteSearch('') }
  const removeInvite = (id) => setInvited(prev => prev.filter(i => i.id !== id))
  const addByEmail = () => {
    if (!inviteEmail.trim()) return
    setInvited(prev => [...prev, { id: 'ext_' + Date.now(), nom: inviteEmail, role: 'Invité externe', email: inviteEmail, source: 'email', status: 'pending' }])
    setInviteEmail('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div><label className="form-label">Titre</label><input className="form-input" placeholder="Réunion de chantier..." value={evTitle} onChange={e => setEvTitle(e.target.value)} /></div>
      <div className="modal-row" style={{ gap: 12 }}>
        <div><label className="form-label">Date</label><input className="form-input" type="date" value={evDate} onChange={e => setEvDate(e.target.value)} /></div>
        <div><label className="form-label">Heure</label><input className="form-input" type="time" value={evTime} onChange={e => setEvTime(e.target.value)} /></div>
      </div>
      <div><label className="form-label">Projet associé</label><select className="form-input" value={evProjet} onChange={e => setEvProjet(e.target.value)}><option value="">Général</option>{projects.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}</select></div>
      <div><label className="form-label">Type</label><select className="form-input" value={evType} onChange={e => setEvType(e.target.value)}><option>Réunion</option><option>Visite chantier</option><option>Remise pièces</option><option>Rendez-vous client</option><option>Deadline</option></select></div>

      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
        <label className="form-label">Inviter des partenaires</label>
        {invited.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
            {invited.map(inv => {
              const initials = (inv.nom || "").split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
              return (
                <div key={inv.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'var(--s2)', borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: 'var(--t3)', flexShrink: 0 }}>{initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)' }}>{inv.nom}</div>
                    <div style={{ fontSize: 10, color: '#888' }}>{inv.role}</div>
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: inv.status === 'accepted' ? 'rgba(52,199,89,.1)' : 'rgba(255,149,0,.1)', color: inv.status === 'accepted' ? '#34C759' : '#FF9500' }}>{inv.status === 'accepted' ? 'Accepté' : 'En attente'}</span>
                  <button onClick={() => removeInvite(inv.id)} style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid rgba(220,38,38,.2)', background: 'rgba(220,38,38,.05)', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>À</button>
                </div>
              )
            })}
          </div>
        )}
        <div style={{ position: 'relative', marginBottom: 8 }}>
          <input value={inviteSearch} onChange={e => setInviteSearch(e.target.value)} placeholder="Rechercher un intervenant..." className="form-input" style={{ paddingRight: 36 }} />
          {inviteSearch && available.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4, background: '#fff', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.1)', maxHeight: 180, overflowY: 'auto', zIndex: 10 }}>
              {available.slice(0, 6).map(c => {
                const initials = (c.nom || "").split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
                return (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }} onClick={() => addInvite(c)}>
                    <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: 'var(--t3)', flexShrink: 0 }}>{initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{c.nom}</div>
                      <div style={{ fontSize: 10, color: '#888' }}>{c.role}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addByEmail() }} placeholder="Ou inviter par email..." className="form-input" style={{ flex: 1 }} />
          <button onClick={addByEmail} disabled={!inviteEmail.trim()} style={{ padding: '0 14px', borderRadius: 10, background: inviteEmail.trim() ? '#191c1d' : '#e1e3e4', color: inviteEmail.trim() ? '#fff' : '#888', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>Inviter</button>
        </div>
        <div style={{ fontSize: 10.5, color: '#888', marginTop: 8, lineHeight: 1.5 }}>Les partenaires invités recevront une notification.</div>
      </div>
    </div>
  )
}

export default function Cockpit() {
  const { store, updateStore, emitEvent } = useMeereo()
  const ob = store.onboardingData || {}
  const userName = ob.entreprise || store.user?.company || ob.prenom || store.user?.name?.split(' ')[0] || ''
  const [activePage, setActivePage] = useState('dashboard')
  const [modal, setModal] = useState(null)
  const [toast, setToast] = useState(null)
  const [showProDir, setShowProDir] = useState(false)
  const [showBuilderPrompt, setShowBuilderPrompt] = useState(false)
  const eventFormRef = useRef(null)

  // Popup "créer ta page pro" — s'affiche à chaque connexion tant que la page n'est pas créée
  useEffect(() => {
    if (store.user?.type !== 'pro') return
    api.usersApi.getPageSections()
      .then(res => {
        const sections = res?.sections || []
        if (sections.length === 0) setShowBuilderPrompt(true)
      })
      .catch(() => {})
  }, [store.user?.type])

  const openModal = useCallback((name) => setModal(prev => prev ? prev : name), [])
  const closeModal = useCallback(() => setModal(null), [])
  const showToast = useCallback((msg) => { setToast(msg); setTimeout(() => setToast(null), 2500) }, [])

  // Listen for navigation events from Topbar menu
  useEffect(() => {
    const handler = (e) => setActivePage(e.detail)
    window.addEventListener('meereo-navigate', handler)
    return () => window.removeEventListener('meereo-navigate', handler)
  }, [])

  // Deep-link depuis ProfilApp : sessionStorage meereo_nav_page
  useEffect(() => {
    const page = sessionStorage.getItem('meereo_nav_page')
    if (page && PAGES[page]) {
      sessionStorage.removeItem('meereo_nav_page')
      setActivePage(page)
    }
  }, [])

  const PageComponent = PAGES[activePage] || Dashboard

  return (
    <CockpitLayout activePage={activePage} onNavigate={setActivePage}>
      <Suspense fallback={<PageLoader />}>
        <div className="page-enter" key={activePage}>
          <PageComponent onNavigate={setActivePage} openModal={openModal} showToast={showToast} openProDir={() => setShowProDir(true)} />
        </div>
      </Suspense>

      <ProDirectory open={showProDir} onClose={() => setShowProDir(false)} />
      <KaiAssistant context="pro" userName={userName} onNavigate={setActivePage} />

      {toast && <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#191c1d', color: '#fff', padding: '10px 20px', borderRadius: 12, fontSize: 12.5, fontWeight: 600, zIndex: 99999, boxShadow: '0 8px 32px rgba(0,0,0,.18)', animation: 'modalIn .18s ease' }}>{toast}</div>}

      {/* Popup : créer sa page pro avec le builder */}
      {showBuilderPrompt && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .2s ease' }}>
          <div style={{ background: '#fff', borderRadius: 20, width: 440, boxShadow: '0 24px 64px rgba(0,0,0,.18)', overflow: 'hidden' }}>
            {/* Header visuel */}
            <div style={{ background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', padding: '32px 32px 28px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                </svg>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: 0 }}>Créez votre page professionnelle</h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,.8)', marginTop: 8, lineHeight: 1.5 }}>
                Votre vitrine en ligne en quelques clics
              </p>
            </div>
            {/* Body */}
            <div style={{ padding: '24px 32px' }}>
              <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, margin: '0 0 20px' }}>
                Utilisez notre éditeur visuel pour construire votre page pro. Présentez vos réalisations, votre équipe, vos certifications et vos services — tout est personnalisable.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  onClick={() => { setShowBuilderPrompt(false); setActivePage('page-builder') }}
                  style={{ width: '100%', padding: '13px 0', borderRadius: 10, background: '#191c1d', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', boxShadow: '0 4px 16px rgba(0,0,0,.12)' }}
                >
                  Créer ma page
                </button>
                <button
                  onClick={() => setShowBuilderPrompt(false)}
                  style={{ width: '100%', padding: '11px 0', borderRadius: 10, background: 'transparent', color: '#888', border: '1px solid #e5e7eb', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--f)' }}
                >
                  Plus tard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All creation modals — form states managed internally */}

      {/* Event modal — kept here because of ref pattern */}
      <Modal isOpen={modal === 'newEvent'} onClose={closeModal} title="Nouvel événement" footer={<><button className="btn btn-sm" onClick={closeModal}>Annuler</button><button className="btn btn-primary btn-sm" onClick={async () => {
        const fd = eventFormRef.current || {}
        const titre = fd.title || 'Nouvel événement'
        const date = fd.date || new Date().toISOString().slice(0, 10)
        const heure = fd.time || '09:00'
        const type = fd.type || 'reunion'
        const projet = fd.projet ? ((store.projects || []).find(p => p.id === fd.projet)?.nom || fd.projet) : ''
        const tempId = 'ev_' + Date.now()
        const optimistic = { id: tempId, titre, date, heure, type, projet, projectId: fd.projet || null, color: 'var(--tx)', invited: fd.invited || [] }
        updateStore(prev => ({ ...prev, events: [...(prev.events || []), optimistic] }))
        emitEvent('event_created', { title: titre }, { notifMsg: 'Événement créé' })
        showToast('Événement créé'); closeModal()
        try {
          const created = await api.events.create({ titre, date, heure, type, projet, projectId: fd.projet || null, color: 'var(--tx)' })
          updateStore(prev => ({ ...prev, events: (prev.events || []).map(e => e.id === tempId ? { ...e, ...created } : e) }))
        } catch (_) {}
      }}>Créer et inviter</button></>}>
        <EventForm formRef={eventFormRef} />
      </Modal>

    </CockpitLayout>
  )
}


