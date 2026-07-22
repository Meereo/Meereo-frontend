// ═══════════════════════════════════════════════════════
//  MEEREO — KAi · Assistant personnel IA
//  Composant partagé : cockpit, client, fournisseur
// ═══════════════════════════════════════════════════════

import { useState, useRef, useEffect, useCallback } from 'react'
import { BarChart2, Folder, ClipboardList, Package, MessageSquare, Home, CheckCircle2, FileText, ShoppingCart, Wallet, Check, Send } from 'lucide-react'
import { useMeereo } from '../../hooks/useMeereoStore'
import useUserIdentity from '../../hooks/useUserIdentity'
import { api } from '../../services/api/client'
import { getKaiQuotaStatus } from '../../domain/fintech'
import KaiGoldModal from './KaiGoldModal'
import KaiAvatar from './KaiAvatar'
import KaiThinkingCard from './KaiThinkingCard'

// ── Response engine ──
function getKaiResponse(q, context, store, memory) {
  const ql = q.toLowerCase()
  const projects = store.projects || []
  const projCount = projects.length
  const prodCount = (store.products || []).length
  const orders = store.sellerOrders || []
  const orderCount = orders.length
  const pendingOrders = orders.filter(o => o.status === 'pending')
  const decisions = (store.decisions || []).filter(d => d.statut === 'pending')
  const decCount = decisions.length
  const docs = store.documents || []
  const payOrders = store.paymentOrders || []
  const disputes = (store.disputeCases || []).filter(d => d.status === 'open')
  const offers = store.offers || []
  const pendingOffers = offers.filter(o => o.status === 'pending')
  const msgs = []  // store.messages supprimé — la messagerie passe par store.conversations
  const kaiEnt = store.kaiEntitlement || {}
  const isGold = kaiEnt.tier === 'gold' && kaiEnt.goldEndDate && new Date(kaiEnt.goldEndDate) > new Date()

  // Memory context — check if we discussed this topic before
  const memoryHit = (memory || []).find(m => ql.includes(m.topic?.toLowerCase?.() || ''))
  const memoryPrefix = memoryHit ? `Nous avions discuté de ${memoryHit.topic}. ` : ''

  if (context === 'fournisseur') {
    if (ql.includes('produit') || ql.includes('catalogue')) return memoryPrefix + (prodCount > 0 ? `${prodCount} produit(s) dans votre catalogue. ${(store.products || []).filter(p => p.sponsored).length > 0 ? 'Dont ' + (store.products || []).filter(p => p.sponsored).length + ' sponsorisé(s).' : 'Pensez au sponsoring.'}` : 'Votre catalogue est vide.')
    if (ql.includes('commande')) return memoryPrefix + (orderCount > 0 ? `${orderCount} commande(s) dont ${pendingOrders.length} en attente.${pendingOrders.length > 0 ? ' Action requise.' : ' Tout est à jour.'}` : 'Aucune commande.')
    if (ql.includes('paiement') || ql.includes('payout')) { const fp = payOrders.filter(o => o.type === 'commande'); return memoryPrefix + (fp.length > 0 ? `${fp.filter(o => o.status === 'PAYOUT_DONE').length} versement(s), ${fp.filter(o => o.status === 'PAYOUT_REQUESTED').length} en attente.${disputes.length > 0 ? ' ⚠ ' + disputes.length + ' litige(s).' : ''}` : 'Aucun versement.') }
    if (ql.includes('litige')) return disputes.length > 0 ? `⚠ ${disputes.length} litige(s) — libérations gelées.` : 'Aucun litige.'
    if (ql.includes('gold') || ql.includes('pro')) return isGold ? 'KAi Pro actif.' : 'KAi Pro automatise le suivi de vos commandes.'
    return `${prodCount} produit(s), ${orderCount} commande(s)${pendingOrders.length > 0 ? ' dont ' + pendingOrders.length + ' à traiter' : ''}.`
  }
  if (context === 'client') {
    if (ql.includes('projet') || ql.includes('avancement')) { if (projCount === 0) return 'Aucun projet en cours.'; const p = projects[0]; return memoryPrefix + `Votre projet${p.nom ? ' « ' + p.nom + ' »' : ''} est à ${p.avancement || p.progress || 0}% d'avancement.${p.phase ? ' Phase : ' + p.phase + '.' : ''}` }
    if (ql.includes('decision') || ql.includes('valid')) return memoryPrefix + (decCount > 0 ? `${decCount} décision(s) en attente.${decisions[0]?.label ? ' Prochaine : ' + decisions[0].label + '.' : ''}` : 'Aucune décision en attente.')
    if (ql.includes('paiement') || ql.includes('budget')) { const co = payOrders.filter(o => o.payerId === (store.user?.id || '')); return memoryPrefix + (co.length > 0 ? `${co.length} paiement(s) en cours. ${co.filter(o => o.status === 'HELD_FOR_MILESTONE').length} sécurisé(s).` : 'Aucun paiement en cours.') }
    if (ql.includes('litige')) return disputes.length > 0 ? `⚠ ${disputes.length} litige(s).` : 'Aucun litige.'
    if (ql.includes('document')) return docs.length > 0 ? `${docs.length} document(s).` : 'Aucun document.'
    if (ql.includes('message')) return msgs.length > 0 ? `${msgs.length} message(s) non lu(s).` : 'Aucun message.'
    return `${decCount > 0 ? decCount + ' décision(s) en attente. ' : ''}${msgs.length > 0 ? msgs.length + ' message(s). ' : ''}Que souhaitez-vous savoir ?`
  }
  if (ql.includes('offre')) return memoryPrefix + (pendingOffers.length > 0 ? `${pendingOffers.length} offre(s) en attente.${pendingOffers[0]?.price ? ' Montant le plus bas : ' + pendingOffers[0].price.toLocaleString('fr-FR') + ' FCFA.' : ''}` : 'Aucune offre.')
  if (ql.includes('marche') || ql.includes('marché')) { const markets = store.markets || []; const active = markets.filter(m => m.status === 'ongoing' || m.statut === 'en_cours' || m.statut === 'signe'); return memoryPrefix + (active.length > 0 ? `${active.length} marché(s) actif(s). ${markets.filter(m => m.statut === 'signe').length} signé(s), ${markets.filter(m => m.statut === 'en_cours' || m.status === 'ongoing').length} en cours.` : 'Aucun marché actif.') }
  if (ql.includes('commande') && context === 'pro') { const cmds = store.commandes || []; return memoryPrefix + (cmds.length > 0 ? `${cmds.length} commande(s). ${cmds.filter(c => c.step < 5).length} en cours de livraison.` : 'Aucune commande.') }
  if (ql.includes('chantier')) return memoryPrefix + (projCount > 0 ? `${projCount} projet(s) en cours.` : 'Aucun projet actif.')
  if (ql.includes('paiement') || ql.includes('finance') || ql.includes('budget')) { if (payOrders.length === 0) return 'Aucune opération financière.'; const pend = payOrders.filter(o => o.status === 'PAYOUT_REQUESTED').length; const held = payOrders.filter(o => o.status === 'HELD_FOR_MILESTONE').reduce((s, o) => s + (o.amountGross || 0), 0); return memoryPrefix + `${payOrders.length} ordre(s). ${pend > 0 ? pend + ' libération(s) en attente. ' : ''}${held > 0 ? held.toLocaleString('fr-FR') + ' FCFA sécurisés. ' : ''}${disputes.length > 0 ? '⚠ ' + disputes.length + ' litige(s).' : ''}` }
  if (ql.includes('urgence') || ql.includes('priorite') || ql.includes('alerte')) { const a = []; if (pendingOffers.length > 0) a.push(pendingOffers.length + ' offre(s)'); if (decCount > 0) a.push(decCount + ' décision(s)'); if (msgs.length > 0) a.push(msgs.length + ' message(s)'); if (disputes.length > 0) a.push(disputes.length + ' litige(s)'); return a.length > 0 ? 'Priorités : ' + a.join(' · ') + '.' : 'Tout est en ordre.' }
  if (ql.includes('litige')) return disputes.length > 0 ? `⚠ ${disputes.length} litige(s).` : 'Aucun litige.'
  if (ql.includes('aide') || ql.includes('comment')) return 'Demandez-moi : projets, offres, paiements, chantiers, clients, documents, décisions, litiges, agenda ou marketplace.'
  return `${projCount} projet(s), ${pendingOffers.length} offre(s)${msgs.length > 0 ? ', ' + msgs.length + ' message(s)' : ''}${disputes.length > 0 ? ' · ⚠ ' + disputes.length + ' litige(s)' : ''}.`
}

// ── Extract topic from a message for memory ──
function extractTopic(text) {
  const t = text.toLowerCase()
  const topics = [
    { keys: ['projet', 'chantier', 'avancement'], topic: 'votre projet' },
    { keys: ['budget', 'paiement', 'finance'], topic: 'le budget' },
    { keys: ['offre', 'ao', 'appel'], topic: 'les offres' },
    { keys: ['decision', 'valid'], topic: 'les décisions' },
    { keys: ['document', 'ged'], topic: 'les documents' },
    { keys: ['commande', 'livraison'], topic: 'les commandes' },
    { keys: ['produit', 'catalogue'], topic: 'le catalogue' },
    { keys: ['fournisseur', 'professionnel'], topic: 'les intervenants' },
    { keys: ['litige', 'dispute'], topic: 'un litige' },
    { keys: ['marketplace', 'materiau'], topic: 'le marketplace' },
  ]
  for (const tp of topics) { if (tp.keys.some(k => t.includes(k))) return tp.topic }
  return null
}

// ── Generate conversation title from first message ──
function generateTitle(text) {
  const t = text.trim()
  if (t.length <= 40) return t
  return t.slice(0, 37) + '...'
}

// ── Format relative date ──
function relativeDate(iso) {
  if (!iso) return ''
  const d = new Date(iso); const now = new Date()
  const diff = Math.floor((now - d) / 60000)
  if (diff < 1) return 'À l\'instant'
  if (diff < 60) return `Il y a ${diff} min`
  if (diff < 1440) return `Il y a ${Math.floor(diff / 60)}h`
  if (diff < 2880) return 'Hier'
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const QUICK = {
  pro: ['Analyse mes offres', 'Rapport chantier', 'Urgences du jour', 'Vérifier paiements'],
  client: ['Mon projet', 'Mes décisions', 'Budget', 'Trouver un pro'],
  fournisseur: ['Mes produits', 'Mes commandes', 'Mes paiements', 'Booster visibilité'],
}

// ── KAI Onboarding — first-time welcome messages per role ──
const KAI_ONBOARDING = {
  pro: {
    title: 'Bienvenue sur votre espace professionnel',
    intro: 'Je suis KAi, votre assistant personnel. Je vais vous guider dans votre espace MEEREO.',
    sections: [
      { icon: <BarChart2 size={14}/>, label: 'Tableau de bord', desc: 'Vue d’ensemble de vos projets, vos actions urgentes et votre activité.' },
      { icon: <Folder size={14}/>, label: 'Projets', desc: 'Créez et pilotez vos projets de A à Z : phases, budget, intervenants.' },
      { icon: <ClipboardList size={14}/>, label: 'Appels d’offres', desc: 'Publiez des AO, recevez des offres et sélectionnez vos prestataires.' },
      { icon: <Package size={14}/>, label: 'Marketplace', desc: 'Commandez des matériaux et suivez vos livraisons en temps réel.' },
      { icon: <MessageSquare size={14}/>, label: 'Messages', desc: 'Échangez avec vos clients, intervenants et partenaires.' },
    ],
    cta: 'Commencez par créer votre premier projet, ou explorez votre espace librement.',
  },
  client: {
    title: 'Bienvenue sur votre espace client',
    intro: 'Je suis KAi, votre assistant personnel. Je suis là pour vous aider à suivre votre projet simplement.',
    sections: [
      { icon: <Home size={14}/>, label: 'Suivi du projet', desc: 'Suivez l’avancement de votre projet, phase par phase, en toute transparence.' },
      { icon: <CheckCircle2 size={14}/>, label: 'Choix & validations', desc: 'Retrouvez les décisions qui vous sont soumises et validez en un clic.' },
      { icon: <ClipboardList size={14}/>, label: 'Mes demandes', desc: 'Consultez vos demandes envoyées et les offres reçues des professionnels.' },
      { icon: <FileText size={14}/>, label: 'Documents', desc: 'Tous les documents de votre projet, centralisés et accessibles.' },
      { icon: <MessageSquare size={14}/>, label: 'Messages', desc: 'Échangez directement avec votre architecte et les intervenants.' },
    ],
    cta: 'Votre professionnel vous invitera à rejoindre votre projet. En attendant, explorez votre espace.',
  },
  fournisseur: {
    title: 'Bienvenue sur votre espace fournisseur',
    intro: 'Je suis KAi, votre assistant commercial. Je vous aide à vendre et livrer efficacement sur MEEREO.',
    sections: [
      { icon: <Package size={14}/>, label: 'Mon catalogue', desc: 'Ajoutez vos produits et rendez-les visibles sur le marketplace MEEREO.' },
      { icon: <ShoppingCart size={14}/>, label: 'Commandes', desc: 'Recevez et traitez les commandes des professionnels et des projets.' },
      { icon: <BarChart2 size={14}/>, label: 'Performance', desc: 'Suivez vos ventes, votre chiffre d’affaires et vos statistiques.' },
      { icon: <ClipboardList size={14}/>, label: 'Bourse des AO', desc: 'Répondez aux appels d’offres et décrochez de nouveaux marchés.' },
      { icon: <Wallet size={14}/>, label: 'Paiements', desc: 'Suivez vos encaissements et vos virements en toute transparence.' },
    ],
    cta: 'Commencez par ajouter votre premier produit au catalogue pour être visible immédiatement.',
  },
}
const PLACEHOLDERS = {
  pro: ['Analyse mon budget...', 'Urgences du jour...', 'Crée un appel d\'offres...', 'État de mes chantiers...'],
  client: ['Où en est mon projet ?', 'Ai-je des décisions ?', 'Résumé de mon budget...', 'Messages non lus...'],
  fournisseur: ['Mes commandes en cours...', 'Créer une offre flash...', 'Mes paiements...', 'Booster un produit...'],
}
const PRI_ICONS = {
  clipboard: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>,
  message: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  check: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  box: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
}

// ── Typing hook — progressive text reveal ──
function useTyping(text, active, speed = 28) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!active) { setDisplayed(''); setDone(false); return }
    let i = 0; setDisplayed(''); setDone(false)
    const iv = setInterval(() => {
      i++
      if (i >= text.length) { setDisplayed(text); setDone(true); clearInterval(iv) }
      else setDisplayed(text.slice(0, i))
    }, speed)
    return () => clearInterval(iv)
  }, [text, active, speed])
  return { displayed, done }
}

// ── KAI Animated Onboarding Component ──
function KaiOnboardingView({ context, displayName, onDragStart, onDismiss, onComplete }) {
  const { store } = useMeereo()
  const ob = KAI_ONBOARDING[context] || KAI_ONBOARDING.pro
  const [phase, setPhase] = useState(0) // 0=thinking, 1=typing title, 2=typing intro, 3=sections, 4=cta+button
  const [visibleSections, setVisibleSections] = useState(0)
  const scrollRef = useRef(null)

  // Adapt CTA for client based on onboarding situation
  const situation = store.onboardingData?.situation || ''
  const cleEnMain = situation.includes('clé en main') || situation.includes('MEEREO')
  const hasArchi = situation.includes('déjà un architecte')
  const ctaText = context === 'client'
    ? cleEnMain
      ? 'MEEREO prend en charge la mise en place de votre projet. KAI vous accompagnera et vous tiendra informé des prochaines étapes.'
      : hasArchi
        ? 'Votre professionnel vous invitera à rejoindre votre projet. En attendant, explorez votre espace.'
        : 'Votre demande est publiée. Vous serez notifié dès qu\u2019un professionnel vous répondra. En attendant, explorez votre espace.'
    : ob.cta

  const titleText = ob.title + (displayName ? ', ' + displayName : '') + '.'
  const introText = ob.intro

  const titleTyping = useTyping(titleText, phase >= 1, 24)
  const introTyping = useTyping(introText, phase >= 2, 18)

  // Phase progression
  useEffect(() => {
    if (phase === 0) { const t = setTimeout(() => setPhase(1), 1000); return () => clearTimeout(t) }
  }, [phase])
  useEffect(() => { if (titleTyping.done && phase === 1) { const t = setTimeout(() => setPhase(2), 300); return () => clearTimeout(t) } }, [titleTyping.done, phase])
  useEffect(() => { if (introTyping.done && phase === 2) { const t = setTimeout(() => setPhase(3), 400); return () => clearTimeout(t) } }, [introTyping.done, phase])

  // Stagger sections one by one
  useEffect(() => {
    if (phase < 3) return
    if (visibleSections >= ob.sections.length) {
      const t = setTimeout(() => setPhase(4), 350)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setVisibleSections(s => s + 1), 280)
    return () => clearTimeout(t)
  }, [phase, visibleSections, ob.sections.length])

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [phase, visibleSections, titleTyping.displayed, introTyping.displayed])

  const reveal = (visible) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0)' : 'translateY(6px)',
    transition: 'opacity .45s cubic-bezier(.22,1,.36,1), transform .45s cubic-bezier(.22,1,.36,1)',
  })

  return (
    <div className="kai-body" ref={scrollRef}>
      {/* Header */}
      <div className="kai-hdr" onMouseDown={onDragStart} style={{ cursor: 'grab' }}>
        <KaiAvatar size="auto" idle={phase > 0} presence={phase > 0} />
        <div className="kai-hdr-meta">
          <div className="kai-hdr-title">KAi</div>
          <div className="kai-hdr-sub">{phase === 0 ? 'Analyse de votre espace...' : 'Guide de bienvenue'}</div>
        </div>
        <button className="kai-close" onClick={onDismiss} aria-label="Fermer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      {/* Thinking dots */}
      {phase === 0 && (
        <div style={{ padding: '14px 0 6px' }}>
          <div className="kai-thinking-dots"><span /><span /><span /></div>
        </div>
      )}

      {/* Title — typing */}
      {phase >= 1 && (
        <div style={{ marginBottom: introTyping.displayed ? 10 : 4 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--tx)', letterSpacing: '-.3px', lineHeight: 1.35 }}>
            {titleTyping.displayed}<span style={{ opacity: titleTyping.done ? 0 : .6, transition: 'opacity .2s' }}>|</span>
          </div>
        </div>
      )}

      {/* Intro — typing */}
      {phase >= 2 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12.5, color: 'var(--t3)', lineHeight: 1.55 }}>
            {introTyping.displayed}<span style={{ opacity: introTyping.done ? 0 : .5, transition: 'opacity .2s' }}>|</span>
          </div>
        </div>
      )}

      {/* Sections — stagger reveal, MEEREO card style */}
      {phase >= 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: phase >= 4 ? 16 : 4 }}>
          {ob.sections.map((s, i) => (
            <div key={i} style={{
              ...reveal(i < visibleSections),
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 13px',
              background: 'var(--surface-1)',
              border: '1px solid var(--border-card)',
              borderRadius: 10,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'var(--s2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, fontSize: 14,
              }}>{s.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)', marginBottom: 1 }}>{s.label}</div>
                <div style={{ fontSize: 10.5, color: 'var(--t4)', lineHeight: 1.4 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA — MEEREO style: subtle dark card, no purple accent */}
      <div style={reveal(phase >= 4)}>
        <div style={{
          padding: '12px 14px', marginBottom: 12,
          background: 'var(--s2)', borderRadius: 10,
          border: '1px solid var(--border-card)',
          fontSize: 11.5, color: 'var(--t3)', lineHeight: 1.5,
        }}>
          {ctaText}
        </div>
      </div>

      {/* Button */}
      <div style={reveal(phase >= 4)}>
        <button onClick={onComplete} style={{
          width: '100%', padding: '11px 16px', borderRadius: 10,
          background: 'var(--tx)', color: 'var(--on-primary)',
          border: 'none', fontSize: 12.5, fontWeight: 600,
          cursor: 'pointer', fontFamily: 'var(--f)',
          transition: 'opacity .15s',
        }}>
          J'ai compris, explorer mon espace
        </button>
      </div>
    </div>
  )
}

// ── Quick-action chip with 600ms active feedback ──
function KaiQuickChip({ label, onActivate }) {
  const [active, setActive] = useState(false)
  const handleClick = () => {
    setActive(true)
    onActivate()
    setTimeout(() => setActive(false), 600)
  }
  return (
    <button className={`kai-pill kai-chip${active ? ' active' : ''}`} onClick={handleClick}>{label}</button>
  )
}

export default function KaiAssistant({ context = 'pro', userName = '', onNavigate }) {
  const { store, updateStore } = useMeereo()
  const uid = useUserIdentity()
  const [kaiOpen, setKaiOpen] = useState(false)
  const [kaiView, setKaiView] = useState('idle') // idle | conv | history | onboarding
  const [kaiInput, setKaiInput] = useState('')
  const [kaiMessages, setKaiMessages] = useState([])
  const [kaiState, setKaiState] = useState('idle') // idle | appearing | thinking | speaking | suggesting
  const [kaiPos, setKaiPos] = useState({ x: null, y: null })
  const [phIdx, setPhIdx] = useState(0)
  const [activeConvId, setActiveConvId] = useState(null)
  const [proactiveSuggestion, setProactiveSuggestion] = useState(null) // contextual suggestion bubble
  const [showGoldModal, setShowGoldModal] = useState(false)
  const kaiDrag = useRef({ dragging: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0, moved: false })
  const msgEndRef = useRef(null)
  const panelRef = useRef(null)
  const barRef = useRef(null)
  const inactivityTimer = useRef(null)
  const proactiveShown = useRef(false)

  const displayName = userName || uid.firstName || uid.displayName?.split(' ')[0] || ''
  const quick = QUICK[context] || QUICK.pro
  const phs = PLACEHOLDERS[context] || PLACEHOLDERS.pro
  const conversations = (store.kaiConversations || []).filter(c => c.context === context)
  const memory = store.kaiMemory || []
  const kaiQuota = getKaiQuotaStatus(store.kaiEntitlement, context)

  const pendingOffers = (store.offers || []).filter(o => o.statut === 'pending' || o.status === 'pending')
  const offersCount = pendingOffers.length
  const msgsUnread = (store.conversations || []).reduce((s, c) => s + (c.unread || 0), 0)
  const decPending = (store.decisions || []).filter(d => d.statut === 'pending').length
  const openAOs = (store.aos || []).filter(a => a.status === 'open')
  const aoWithoutOffers = openAOs.filter(a => !(store.offers || []).some(o => o.aoId === a.id))

  useEffect(() => {
    const iv = setInterval(() => setPhIdx(i => (i + 1) % phs.length), 4000)
    return () => clearInterval(iv)
  }, [phs.length])

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [kaiMessages, kaiState])

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setKaiOpen(o => { if (!o) setKaiView('idle'); return !o }) }
      if (e.key === 'Escape' && kaiOpen) { e.preventDefault(); setKaiOpen(false) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [kaiOpen])

  // ── KAi Proactive Onboarding — auto-open on first visit ──
  useEffect(() => {
    const onboardingDone = store.kaiOnboardingDone || {}
    if (onboardingDone[context]) return
    if (!store.user) return
    // Auto-open KAI panel with onboarding view after a brief delay
    const timer = setTimeout(() => {
      setKaiState('appearing')
      setTimeout(() => {
        setKaiOpen(true)
        setKaiView('onboarding')
        setKaiState('speaking')
      }, 600)
    }, 2500)
    return () => clearTimeout(timer)
  }, [store.user, store.kaiOnboardingDone, context])

  // ── KAi Proactive Suggestions — context-aware triggers ──
  useEffect(() => {
    if (!store.user || !store._hydrated || kaiOpen || proactiveShown.current) return
    const onboardingDone = store.kaiOnboardingDone || {}
    if (!onboardingDone[context]) return // Wait for onboarding to complete first

    // Trigger 1: Pending offers the user hasn't seen
    if (offersCount > 0 && context === 'client') {
      const timer = setTimeout(() => {
        const lot = pendingOffers[0]?.entreprise || pendingOffers[0]?.titre || ''
        setProactiveSuggestion({
          message: `Vous avez ${offersCount} offre${offersCount > 1 ? 's' : ''} en attente${lot ? ' de ' + lot : ''}. Souhaitez-vous les analyser ?`,
          actions: [{ label: 'Voir les offres', page: 'offres' }],
        })
        setKaiState('suggesting')
        proactiveShown.current = true
      }, 5000)
      return () => clearTimeout(timer)
    }

    // Trigger 2: AO without any response
    if (aoWithoutOffers.length > 0 && context === 'client') {
      const timer = setTimeout(() => {
        setProactiveSuggestion({
          message: `Votre appel d'offres "${aoWithoutOffers[0]?.title || ''}" n'a reçu aucune réponse. Je peux vous aider à inviter des professionnels.`,
          actions: [{ label: 'Mes demandes', page: 'ao' }, { label: 'Créer un AO', page: 'creerAO' }],
        })
        setKaiState('suggesting')
        proactiveShown.current = true
      }, 8000)
      return () => clearTimeout(timer)
    }

    // Trigger 3: Pending decisions
    if (decPending > 0) {
      const timer = setTimeout(() => {
        setProactiveSuggestion({
          message: `${decPending} décision${decPending > 1 ? 's' : ''} en attente de votre validation.`,
          actions: [{ label: 'Choix & validations', page: 'decisions' }],
        })
        setKaiState('suggesting')
        proactiveShown.current = true
      }, 6000)
      return () => clearTimeout(timer)
    }
  }, [store.user, store._hydrated, store.kaiOnboardingDone, kaiOpen, offersCount, aoWithoutOffers.length, decPending, context])

  // ── KAI Inactivity Detection — gentle nudge after 20s ──
  useEffect(() => {
    if (!store.user || kaiOpen || proactiveShown.current) return
    const onboardingDone = store.kaiOnboardingDone || {}
    if (!onboardingDone[context]) return

    const resetInactivity = () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
      inactivityTimer.current = setTimeout(() => {
        if (!proactiveShown.current && !kaiOpen) {
          setKaiState('suggesting')
          setProactiveSuggestion({
            message: 'Besoin d\'aide ? Je peux vous résumer l\'état de votre projet.',
            actions: [{ label: 'Résumé projet', action: () => { setKaiOpen(true); setKaiView('idle'); kaiSend('Résumé de mon projet') } }],
          })
          proactiveShown.current = true
        }
      }, 20000)
    }

    resetInactivity()
    window.addEventListener('mousemove', resetInactivity)
    window.addEventListener('keydown', resetInactivity)
    window.addEventListener('click', resetInactivity)

    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current)
      window.removeEventListener('mousemove', resetInactivity)
      window.removeEventListener('keydown', resetInactivity)
      window.removeEventListener('click', resetInactivity)
    }
  }, [store.user, store.kaiOnboardingDone, kaiOpen, context])

  // Dismiss proactive suggestion
  const dismissSuggestion = () => { setProactiveSuggestion(null); setKaiState('idle') }
  const handleSuggestionAction = (act) => {
    dismissSuggestion()
    if (act.action) { act.action(); return }
    if (act.page && onNavigate) { onNavigate(act.page) }
  }

  const dismissOnboarding = () => {
    // Persist côté serveur
    api.kai.markOnboardingDone(context).catch(() => {})
    // Optimistic update
    updateStore(prev => ({
      ...prev,
      kaiOnboardingDone: { ...(prev.kaiOnboardingDone || {}), [context]: true }
    }))
    setKaiView('idle')
  }

  // Drag
  const onDragStart = (e) => {
    e.preventDefault()
    const el = kaiOpen ? panelRef.current : barRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    kaiDrag.current = { dragging: true, startX: e.clientX, startY: e.clientY, startPosX: rect.left, startPosY: rect.top, moved: false }
    const onMove = (ev) => {
      const d = kaiDrag.current; const dx = ev.clientX - d.startX; const dy = ev.clientY - d.startY
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true
      if (d.moved) setKaiPos({ x: Math.max(0, Math.min(window.innerWidth - 100, d.startPosX + dx)), y: Math.max(0, Math.min(window.innerHeight - 60, d.startPosY + dy)) })
    }
    const onUp = () => { kaiDrag.current.dragging = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp)
  }
  const onBarClick = () => { if (!kaiDrag.current.moved) { setKaiOpen(o => !o); if (!kaiOpen) setKaiView('idle') } }

  // Save conversation to store + API
  const saveConversation = useCallback((msgs, convId) => {
    if (!msgs || msgs.length === 0) return
    const firstUserMsg = msgs.find(m => m.side === 'user')
    if (!firstUserMsg) return
    const title = generateTitle(firstUserMsg.text)
    const topic = extractTopic(firstUserMsg.text)
    const now = new Date().toISOString()

    // Persist to PostgreSQL
    api.kai.saveConversation(convId, { context, title, messages: msgs, topic }).catch(() => {})
    if (topic) api.kai.saveMemory(topic, context).catch(() => {})

    // Optimistic store update (source of truth est la BD, mais on met à jour l'UI)
    updateStore(prev => {
      const convs = [...(prev.kaiConversations || [])]
      const idx = convs.findIndex(c => c.id === convId)
      if (idx >= 0) {
        convs[idx] = { ...convs[idx], messages: msgs, updatedAt: now, title }
      } else {
        convs.unshift({ id: convId, title, context, messages: msgs, createdAt: now, updatedAt: now, topic })
      }
      const trimmed = convs.slice(0, 20)
      let mem = [...(prev.kaiMemory || [])]
      if (topic) {
        const existing = mem.findIndex(m => m.topic === topic && m.context === context)
        if (existing >= 0) { mem[existing] = { ...mem[existing], lastDiscussed: now } }
        else { mem.unshift({ topic, context, lastDiscussed: now }); mem = mem.slice(0, 15) }
      }
      return { ...prev, kaiConversations: trimmed, kaiMemory: mem }
    })
  }, [updateStore, context])

  // Build context snapshot for Claude API
  const buildKaiContext = useCallback(() => {
    const projects = store.projects || []
    const offers = store.offers || []
    const decisions = store.decisions || []
    const msgs = []
    const markets = store.markets || []
    const docs = store.documents || []
    const products = store.products || []
    const orders = store.sellerOrders || []
    const intervenants = store.intervenants || []
    const projectMembers = store.projectMembers || []
    return {
      userType: context,
      userName: displayName || store.user?.name || '',
      userCompany: store.onboardingData?.entreprise || store.user?.company || '',
      projects: projects.slice(0, 5).map(p => ({ nom: p.nom || p.name, phase: p.phase, avancement: p.avancement || 0, budget: p.budget, client: p.client })),
      pendingOffers: offers.filter(o => o.status === 'pending' || o.statut === 'pending').length,
      pendingDecisions: decisions.filter(d => d.statut === 'pending').length,
      unreadMessages: (store.conversations || []).reduce((s, c) => s + (c.unread || 0), 0),
      activeMarkets: markets.filter(m => m.status === 'ongoing' || m.statut === 'signe' || m.statut === 'signed').length,
      documentsCount: docs.length,
      productsCount: products.length,
      pendingOrders: orders.filter(o => o.status === 'pending').length,
      teamMembers: [...intervenants, ...projectMembers].slice(0, 10).map(m => ({ nom: m.nom || m.userName || '' })),
    }
  }, [store, context, displayName])

  // Send — tries Claude API first, falls back to local engine
  const kaiSend = (text) => {
    const q = (text || kaiInput).trim()
    if (!q) return
    // ── Quota guard — block if exhausted and not Gold ──
    if (kaiQuota.isExhausted) {
      setShowGoldModal(true)
      return
    }
    const convId = activeConvId || ('kconv_' + Date.now())
    if (!activeConvId) setActiveConvId(convId)

    const newMsgs = [...kaiMessages, { side: 'user', text: q }]
    setKaiMessages(newMsgs)
    setKaiInput('')
    setKaiView('conv')
    setKaiState('thinking')

    // Local keyword engine (mock mode — no backend)
    setTimeout(() => {
      setKaiState('responding')
      setTimeout(() => {
        const response = getKaiResponse(q, context, store, memory)
        const finalMsgs = [...newMsgs, { side: 'kai', text: response }]
        setKaiMessages(finalMsgs)
        setKaiState('idle')
        saveConversation(finalMsgs, convId)
        // Incrémenter le quota côté serveur (atomique — évite les race conditions)
        api.kai.incrementQuota(context).then(updated => {
          if (updated?.quotaUsed !== undefined) {
            updateStore(prev => {
              const ent = { ...(prev.kaiEntitlement || {}) }
              ent[context] = { ...(ent[context] || {}), quotaUsed: updated.quotaUsed }
              return { ...prev, kaiEntitlement: ent }
            })
          }
        }).catch(() => {})
      }, 400 + Math.random() * 400)
    }, 300)
  }

  // Open a past conversation
  const openConversation = (conv) => {
    setKaiMessages(conv.messages || [])
    setActiveConvId(conv.id)
    setKaiView('conv')
  }

  // Start new conversation
  const newConversation = () => {
    setKaiMessages([])
    setActiveConvId(null)
    setKaiView('idle')
  }

  // Delete a conversation
  const deleteConversation = (convId, e) => {
    e.stopPropagation()
    // Persist côté serveur
    api.kai.deleteConversation(convId).catch(() => {})
    // Optimistic update
    updateStore(prev => ({
      ...prev,
      kaiConversations: (prev.kaiConversations || []).filter(c => c.id !== convId)
    }))
  }

  // Priorities — multi-acteurs V2 (reuse openAOs, aoWithoutOffers from above)
  const priorities = []
  const stalledMarkets = (store.markets || []).filter(m => (m.status === 'ongoing' || m.statut === 'signe') && m.progress < 10)
  const tasksNeedValidation = (store.tasks || []).filter(t => t.status === 'done' && !t.validationStatus)
  if (context === 'pro') {
    if (offersCount > 0) priorities.push({ icon: PRI_ICONS.clipboard, label: `${offersCount} offre(s) à valider`, tag: 'URGENT', desc: 'Décisions en attente' })
    if (aoWithoutOffers.length > 0) priorities.push({ icon: PRI_ICONS.clipboard, label: `${aoWithoutOffers.length} AO sans réponse`, tag: 'ACTION', desc: 'Invitez des entreprises' })
    if (stalledMarkets.length > 0) priorities.push({ icon: PRI_ICONS.box, label: `${stalledMarkets.length} marché(s) sans avancement`, tag: 'ATTENTION', desc: 'Démarrez le suivi chantier' })
    if (msgsUnread > 0) priorities.push({ icon: PRI_ICONS.message, label: `${msgsUnread} message(s) non lu(s)`, tag: 'IMPORTANT', desc: 'Réponses en attente' })
  } else if (context === 'client') {
    if (decPending > 0) priorities.push({ icon: PRI_ICONS.check, label: `${decPending} décision(s) en attente`, tag: 'URGENT', desc: 'Validation requise par le maître d\u2019ouvrage' })
    if (tasksNeedValidation.length > 0) priorities.push({ icon: PRI_ICONS.check, label: `${tasksNeedValidation.length} tâche(s) à valider`, tag: 'ACTION', desc: 'Validez l\u2019avancement chantier' })
    if (aoWithoutOffers.filter(a => a.ownerUserId === store.user?.id).length > 0) priorities.push({ icon: PRI_ICONS.clipboard, label: 'AO sans offre reçue', tag: 'ATTENTION', desc: 'Invitez des professionnels' })
    if (msgsUnread > 0) priorities.push({ icon: PRI_ICONS.message, label: `${msgsUnread} message(s) non lu(s)`, tag: 'IMPORTANT', desc: 'Réponses en attente' })
  } else {
    const po = (store.sellerOrders || []).filter(o => o.status === 'pending').length
    if (po > 0) priorities.push({ icon: PRI_ICONS.box, label: `${po} commande(s) à traiter`, tag: 'URGENT', desc: 'Action requise' })
  }
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()

  return (
    <>
      {/* ═══ PROACTIVE SUGGESTION BUBBLE ═══ */}
      {!kaiOpen && proactiveSuggestion && (
        <div className="kai-suggestion" style={{
          position: 'fixed', bottom: 80, right: 20, zIndex: 1300,
          maxWidth: 340, background: '#fff', borderRadius: 16,
          boxShadow: '0 8px 40px rgba(0,0,0,.12), 0 2px 8px rgba(0,0,0,.06)',
          border: '1px solid rgba(0,0,0,.06)',
          animation: 'kaiSuggestIn .4s cubic-bezier(.22,1,.36,1)',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '16px 18px 12px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <KaiAvatar size="inline" idle={false} attention={true} presence={true} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: 'var(--t2)', lineHeight: 1.55, marginBottom: 10 }}>{proactiveSuggestion.message}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {proactiveSuggestion.actions.map((a, i) => (
                  <button key={i} onClick={() => handleSuggestionAction(a)} style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                    background: i === 0 ? 'var(--tx)' : 'var(--s2)', color: i === 0 ? '#fff' : 'var(--tx)',
                    border: 'none', cursor: 'pointer', fontFamily: 'var(--f)',
                  }}>{a.label}</button>
                ))}
              </div>
            </div>
            <button onClick={dismissSuggestion} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--t4)', flexShrink: 0 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* ═══ FLOATING BAR ═══ */}
      {!kaiOpen && (
        <div ref={barRef} className="k10-bar" style={kaiPos.x != null ? { left: kaiPos.x, bottom: 'auto', top: kaiPos.y, transform: 'none' } : undefined}>
          <div className="k10-bar-inner" onMouseDown={onDragStart} onClick={onBarClick} title="KAi · Ctrl+K">
            <div style={{ position: 'relative' }}>
              <KaiAvatar
                size="auto"
                idle={kaiState === 'idle'}
                attention={priorities.length > 0 || !!proactiveSuggestion}
                presence={true}
              />
              {(priorities.length > 0 || proactiveSuggestion) && (
                <span className="kai-orb-badge">{priorities.length || '!'}</span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, minWidth: 0, pointerEvents: 'none' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111', letterSpacing: '.04em' }}>KAi</span>
              <span style={{ fontSize: 10, color: '#999' }}>Assistant personnel IA</span>
            </div>
          </div>
        </div>
      )}

      {/* ═══ KAI PANEL ═══ */}
      {kaiOpen && (
        <div ref={panelRef} className="k10-panel show" style={kaiPos.x != null ? { left: kaiPos.x, bottom: 'auto', top: kaiPos.y, transform: 'none' } : undefined}>

          {/* ═══ ONBOARDING VIEW — Animated ═══ */}
          {kaiView === 'onboarding' && <KaiOnboardingView context={context} displayName={displayName} onDragStart={onDragStart} onDismiss={() => { dismissOnboarding(); setKaiOpen(false) }} onComplete={dismissOnboarding} />}

          {/* ═══ IDLE VIEW ═══ */}
          {kaiView === 'idle' && (
            <div className="kai-body">
              <div className="kai-hdr" onMouseDown={onDragStart} style={{ cursor: 'grab' }}>
                <KaiAvatar size="auto" idle={true} attention={priorities.length > 0} />
                <div className="kai-hdr-meta">
                  <div className="kai-hdr-title">KAi</div>
                  <div className="kai-hdr-sub">Assistant personnel IA</div>
                </div>
                <button className="kai-close" onClick={() => setKaiOpen(false)} aria-label="Fermer">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div className="kai-greet">
                <div className="kai-greet-hi">Bonjour{displayName ? ` ${displayName}` : ''} !</div>
                <div className="kai-greet-text">Je suis <strong>KAi</strong>, votre assistant personnel.</div>
                <div className="kai-greet-sub">Je vous aide à piloter, décider et exécuter vos actions.</div>
                <div className="kai-greet-cta">Que souhaitez-vous faire aujourd'hui ? Demandez-moi !</div>
              </div>

              <div className="kai-input-zone" style={kaiQuota.isExhausted ? { opacity: .55, pointerEvents: 'none' } : {}}>
                <textarea rows="1" value={kaiInput} onChange={e => setKaiInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); kaiSend() } }} placeholder={kaiQuota.isExhausted ? 'Quota épuisé — passez à KAi Pro' : phs[phIdx]} autoFocus disabled={kaiQuota.isExhausted} />
                <button className={`kai-send${kaiInput.trim() && !kaiQuota.isExhausted ? ' active' : ''}`} onClick={() => kaiSend()} disabled={kaiQuota.isExhausted} aria-label="Envoyer">
                  <Send size={14} className={`kai-send-icon${kaiInput.trim() ? ' has-text' : ''}`} />
                </button>
              </div>

              {kaiQuota.isExhausted && (
                <div style={{ margin: '0 16px 12px', padding: '12px 14px', borderRadius: 10, background: 'rgba(186,26,26,.06)', border: '1px solid rgba(186,26,26,.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#ba1a1a' }}>Quota mensuel épuisé — {kaiQuota.used}/{kaiQuota.limit} analyses</div>
                    <div style={{ fontSize: 10, color: 'var(--t4)', marginTop: 2 }}>Passez à KAi Pro pour des analyses illimitées.</div>
                  </div>
                  <button onClick={() => setShowGoldModal(true)} style={{ padding: '6px 12px', borderRadius: 8, background: 'var(--kai-accent)', color: '#fff', border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', whiteSpace: 'nowrap' }}>KAi Pro</button>
                </div>
              )}

              <div className="kai-quick">
                {quick.map(q => (<KaiQuickChip key={q} label={q} onActivate={() => kaiSend(q)} />))}
              </div>

              {/* Historique — lien discret */}
              {conversations.length > 0 && (
                <button className="kai-hist-link" onClick={() => setKaiView('history')}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {conversations.length} discussion{conversations.length > 1 ? 's' : ''} récente{conversations.length > 1 ? 's' : ''}
                </button>
              )}

              <div className="kai-status">
                <span className="kai-status-orb">K</span>
                <span>KAi {((store.kaiEntitlement || {})[context] || {}).tier === 'gold' ? 'Pro' : 'Standard'}</span>
                {priorities.length > 0 && <span className="kai-status-count">{priorities.length} alerte{priorities.length > 1 ? 's' : ''}</span>}
              </div>

              {priorities.length > 0 && (
                <div className="kai-priorities">
                  <div className="kai-pri-title">Priorités du {today}</div>
                  {priorities.map((p, i) => (
                    <div key={i} className="kai-pri-item">
                      <span className="kai-pri-icon">{p.icon}</span>
                      <div className="kai-pri-content">
                        <div className="kai-pri-label">{p.label}</div>
                        <span className={`kai-pri-tag${p.tag === 'URGENT' ? ' urgent' : ''}`}>{p.tag}</span>
                        <div className="kai-pri-desc">{p.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ HISTORY VIEW ═══ */}
          {kaiView === 'history' && (
            <div className="kai-body">
              <div className="kai-hdr" onMouseDown={onDragStart} style={{ cursor: 'grab' }}>
                <button className="kai-conv-btn" onClick={() => setKaiView('idle')}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <div className="kai-hdr-meta">
                  <div className="kai-hdr-title">Historique</div>
                  <div className="kai-hdr-sub">{conversations.length} discussion{conversations.length > 1 ? 's' : ''}</div>
                </div>
                <button className="kai-close" onClick={() => setKaiOpen(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              {/* New conversation button */}
              <button className="kai-hist-new" onClick={newConversation}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Nouvelle discussion
              </button>

              {/* Conversation list */}
              <div className="kai-hist-list">
                {conversations.map(c => {
                  const lastMsg = c.messages?.[(c.messages?.length || 1) - 1]
                  return (
                    <div key={c.id} className="kai-hist-item" onClick={() => openConversation(c)}>
                      <div className="kai-hist-item-top">
                        <div className="kai-hist-item-title">{c.title}</div>
                        <span className="kai-hist-item-time">{relativeDate(c.updatedAt)}</span>
                      </div>
                      {lastMsg && <div className="kai-hist-item-preview">{lastMsg.side === 'kai' ? 'KAi : ' : ''}{lastMsg.text.slice(0, 60)}{lastMsg.text.length > 60 ? '...' : ''}</div>}
                      <button className="kai-hist-item-del" onClick={(e) => deleteConversation(c.id, e)} title="Supprimer">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ═══ CONVERSATION VIEW ═══ */}
          {kaiView === 'conv' && (
            <div className="kai-conv">
              <div className="kai-conv-hdr" onMouseDown={onDragStart} style={{ cursor: 'grab' }}>
                <button className="kai-conv-btn" onClick={newConversation}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                </button>
                <KaiAvatar size="inline" idle={false} presence={false} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111', flex: 1 }}>KAi</span>
                {conversations.length > 0 && (
                  <button className="kai-conv-btn" onClick={() => setKaiView('history')} title="Historique">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  </button>
                )}
                <button className="kai-conv-btn" onClick={() => setKaiOpen(false)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
              <div className="kai-conv-msgs">
                {kaiMessages.length > 0 && kaiMessages[0].side === 'user' && (
                  <div className="kai-cmsg kai-cmsg-kai">
                    <div className="kai-cbub kai-cbub-kai">Comment puis-je vous aider ?</div>
                  </div>
                )}
                {kaiMessages.map((m, i) => (
                  <div key={i} className={`kai-cmsg kai-cmsg-${m.side}`}>
                    <div className={`kai-cbub kai-cbub-${m.side}`}>{m.text}</div>
                  </div>
                ))}
                {kaiState === 'thinking' && (
                  <div className="kai-cmsg kai-cmsg-kai">
                    <div className="kai-cbub kai-cbub-kai"><KaiThinkingCard inline /></div>
                  </div>
                )}
                <div ref={msgEndRef} />
              </div>
              <div className="kai-conv-foot" style={kaiQuota.isExhausted ? { flexDirection: 'column', gap: 8, padding: '10px 12px' } : {}}>
                {kaiQuota.isExhausted ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: '#ba1a1a' }}>Quota épuisé — {kaiQuota.used}/{kaiQuota.limit} analyses ce mois</div>
                      <div style={{ fontSize: 10, color: 'var(--t4)', marginTop: 2 }}>Passez à KAi Pro pour continuer sans limite.</div>
                    </div>
                    <button onClick={() => setShowGoldModal(true)} style={{ padding: '7px 14px', borderRadius: 8, background: 'var(--kai-accent)', color: '#fff', border: 'none', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', whiteSpace: 'nowrap', flexShrink: 0 }}>KAi Pro →</button>
                  </div>
                ) : (
                  <>
                    <textarea rows="1" value={kaiInput} onChange={e => setKaiInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); kaiSend() } }} placeholder="Écrire à KAI..." />
                    <button className={`kai-send${kaiInput.trim() ? ' active' : ''}`} onClick={() => kaiSend()} aria-label="Envoyer">
                      <Send size={14} className={`kai-send-icon${kaiInput.trim() ? ' has-text' : ''}`} />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      <KaiGoldModal isOpen={showGoldModal} onClose={() => setShowGoldModal(false)} role={context} />
    </>
  )
}
