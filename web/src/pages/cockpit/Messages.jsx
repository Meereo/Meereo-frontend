import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { Lock, MailOpen, Package, MessageSquare, Users, Camera, Video, Paperclip, Check, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { INTERVENANTS_DATA } from '../../data/intervenants'
import { CLIENTS_DATA } from '../../data/clients'
import { ANNUAIRE_PLATEFORME } from '../../data/chantier'
import { useMeereo } from '../../hooks/useMeereoStore'
import { api } from '../../services/api/client'
import {
  getSocket,
  joinConversation,
  leaveConversation,
  sendSocketMessage,
  onNewMessage,
  offNewMessage,
  emitTypingStart,
  emitTypingStop,
  onTyping,
  offTyping,
  emitRead,
} from '../../services/socket'

// Find avatar for a contact by name
const getContactAvatar = (nom, projects = []) => {
  if (!nom) return null
  // Intervenants with photos
  const inter = INTERVENANTS_DATA.find(i => i.nom === nom || nom.includes(i.nom.split(' ').pop()))
  if (inter?.photo) return { type: 'img', value: inter.photo }
  // Clients — use colored initials
  const client = CLIENTS_DATA.find(c => c.nom === nom)
  if (client) {
    const colors = {}
    return { type: 'color', value: colors[client.nom] || '#6B7280', initials: client.nom.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() }
  }
  // Partners from annuaire
  const partner = ANNUAIRE_PLATEFORME.find(p => p.nom === nom)
  if (partner) return { type: 'color', value: partner.color, initials: nom.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() }
  // Group with project name — use project image
  const proj = projects.find(p => nom.includes(p.nom.split(' ').pop()) || p.nom.includes(nom.split(' ').pop()))
  if (proj?.img) return { type: 'img', value: proj.img }
  return null
}

/**
 * Build contact list with registration status.
 * A contact is `registered: true` only if they have a real MEEREO account.
 * Otherwise they are `registered: false` (invited / pending inscription).
 *
 * Registration is determined by:
 *  - store.users[] contains a matching name or email
 *  - project.clientInviteStatus === 'accepted'
 *  - team member.registered === true (explicitly set)
 */
const getDirectContacts = (projects = [], store = {}) => {
  const seen = new Set()
  const contacts = []
  // Registered users on the platform (by name, for demo matching)
  const registeredNames = new Set((store.users || []).filter(u => u && u.status !== 'deleted').map(u => (u.name || '').toLowerCase()))
  const registeredEmails = new Set((store.users || []).filter(u => u && u.status !== 'deleted').map(u => (u.email || '').toLowerCase()))

  const isRegistered = (nom, email) => {
    if (registeredNames.has((nom || '').toLowerCase())) return true
    if (email && registeredEmails.has(email.toLowerCase())) return true
    return false
  }

  INTERVENANTS_DATA.forEach(i => {
    if (!seen.has(i.nom)) {
      seen.add(i.nom)
      contacts.push({ nom: i.nom, role: i.role, source: 'equipe', direct: true, registered: i.registered || isRegistered(i.nom, i.email) })
    }
  })
  projects.forEach(p => {
    if (p.client && !seen.has(p.client)) {
      seen.add(p.client)
      const clientRegistered = p.clientInviteStatus === 'accepted' || isRegistered(p.client, p.clientEmail)
      contacts.push({ nom: p.client, role: 'Maitre d\'ouvrage', source: 'client', direct: true, registered: clientRegistered, email: p.clientEmail })
    }
  })
  projects.forEach(p => (p.equipe || []).forEach(m => {
    if (!seen.has(m.nom)) {
      seen.add(m.nom)
      contacts.push({ nom: m.nom, role: m.role, source: 'prestataire', direct: true, registered: m.registered || isRegistered(m.nom, m.email), email: m.email })
    }
  }))
  return contacts
}
const EXTERNAL_PROS = []

const srcLabel = s => s === 'client' ? 'MOA' : s === 'equipe' ? 'Equipe' : s === 'prestataire' ? 'Prestataire' : 'Externe'
const srcColor = s => s === 'externe' ? '#F59E0B' : s === 'client' ? '#16A34A' : '#7C3AED'

function ChatHeader({ active, navigate, showToast, setShowInvite, setInviteSearch, setShowParticipants, projects, onAction }) {
  if (!active) return null
  const av = getContactAvatar(active.nom, projects)
  const client = CLIENTS_DATA.find(c => c.nom === active.nom)
  const isClientPrive = client && client.type === 'Particulier'
  const isPro = !active.isGroup && !active.pending && !isClientPrive
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
      <div onClick={() => isPro && active.publicId && navigate(`/pro?uuid=${active.publicId}`)} style={{ width: 40, height: 40, borderRadius: active.isGroup ? 12 : 20, background: av?.type === 'color' ? av.value : (active.color || '#666') + '14', color: av?.type === 'color' ? '#fff' : (active.color || '#666'), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, cursor: isPro && active.publicId ? 'pointer' : 'default', overflow: 'hidden' }}>
        {av?.type === 'img' ? <img src={av.value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : av?.type === 'color' ? av.initials : active.avatar}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-.2px', cursor: isPro && active.publicId ? 'pointer' : 'default' }} onClick={() => isPro && active.publicId && navigate(`/pro?uuid=${active.publicId}`)}>{active.nom}</span>
          {isPro && active.publicId && <span style={{ fontSize: 10, color: 'var(--t4)', fontWeight: 500, cursor: 'pointer' }} onClick={() => navigate(`/pro?uuid=${active.publicId}`)}>→ profil</span>}
        </div>
        <div style={{ fontSize: 11, color: 'var(--t3)', cursor: active.isGroup ? 'pointer' : 'default', display: 'flex', alignItems: 'center', gap: 3 }} onClick={() => active.isGroup && setShowParticipants(true)}>
          {active.pending ? <><Lock size={10}/> En attente d{'’'}acceptation</>
            : active.invited ? <><MailOpen size={10}/> Invité — en attente d{'’'}inscription</>
            : active.isGroup ? (active.participants || []).length + ' participants'
            : 'é—é En ligne'}
        </div>
      </div>
      {!active.pending && (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
          {/* Appel & Visio — uniquement pour les utilisateurs inscrits */}
          {!active.invited && (
            <>
              <button onClick={() => showToast && showToast('Appel en cours...')} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--s2)', border: '1px solid var(--border-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Appel">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--tx)" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
              </button>
              <button onClick={() => showToast && showToast('Videoconference...')} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--s2)', border: '1px solid var(--border-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Video">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--tx)" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
              </button>
            </>
          )}
          <button onClick={() => { setShowInvite(true); setInviteSearch('') }} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--s2)', border: '1px solid var(--border-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Ajouter">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--tx)" strokeWidth="2"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
          </button>
          {/* ─── Menu actions ─── */}
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button onClick={() => setMenuOpen(v => !v)} style={{ width: 36, height: 36, borderRadius: 10, background: menuOpen ? 'var(--s3)' : 'var(--s2)', border: '1px solid var(--border-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background .12s' }} title="Plus d'actions">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--tx)" strokeWidth="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
            </button>
            {menuOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: 6, width: 210, background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 12, boxShadow: '0 12px 40px rgba(0,0,0,.12)', overflow: 'hidden', zIndex: 100, animation: 'modalIn .12s ease' }}>
                {/* Archiver / Restaurer */}
                {active._archived ? (
                  <button onClick={() => { setMenuOpen(false); onAction('unarchive', active.id) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12.5, fontWeight: 500, color: 'var(--tx)', textAlign: 'left', transition: 'background .1s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                    <span>Restaurer</span>
                  </button>
                ) : (
                  <button onClick={() => { setMenuOpen(false); onAction('archive', active.id) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12.5, fontWeight: 500, color: 'var(--tx)', textAlign: 'left', transition: 'background .1s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5" rx="1"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                    <span>Archiver</span>
                  </button>
                )}
                {/* Marquer comme non lu */}
                <button onClick={() => { setMenuOpen(false); onAction('unread', active.id) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12.5, fontWeight: 500, color: 'var(--tx)', textAlign: 'left', transition: 'background .1s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="var(--t3)"/></svg>
                  <span>Marquer non lu</span>
                </button>
                {/* Quitter le groupe — only for groups */}
                {active.isGroup && (
                  <button onClick={() => { setMenuOpen(false); onAction('quit', active.id) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12.5, fontWeight: 500, color: 'var(--wrn, #F59E0B)', textAlign: 'left', transition: 'background .1s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    <span>Quitter le groupe</span>
                  </button>
                )}
                {/* Separator */}
                <div style={{ height: 1, background: 'var(--border-subtle)', margin: '2px 0' }} />
                {/* Supprimer */}
                <button onClick={() => { setMenuOpen(false); onAction('delete', active.id) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12.5, fontWeight: 500, color: 'var(--err, #EF4444)', textAlign: 'left', transition: 'background .1s' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,.04)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  <span>Supprimer pour moi</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Messages({ showToast }) {
  const navigate = useNavigate()
  const { store, updateStore } = useMeereo()
  const [activeId, setActiveId] = useState(null)
  const [msgTab, setMsgTab] = useState('all')
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')

  // Deep-link depuis ProfilApp : ouvrir directement la bonne conversation
  useEffect(() => {
    const convId = sessionStorage.getItem('meereo_open_conv')
    if (convId) { sessionStorage.removeItem('meereo_open_conv'); setActiveId(convId) }
  }, [])

  const [showNewConv, setShowNewConv] = useState(false)
  const [newConvSearch, setNewConvSearch] = useState('')
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [groupMembers, setGroupMembers] = useState([])
  const [groupSearch, setGroupSearch] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [inviteSearch, setInviteSearch] = useState('')
  const [showParticipants, setShowParticipants] = useState(false)
  // Conversation management
  const [confirmAction, setConfirmAction] = useState(null)
  const [ctxMenu, setCtxMenu] = useState(null)
  const ctxRef = useRef(null)
  // Pro — suggestion de prix/dûlai dans la conversation
  const [showSuggestPanel, setShowSuggestPanel] = useState(false)
  const [suggestMontant, setSuggestMontant] = useState('')
  const [suggestDelai, setSuggestDelai] = useState('')

  // ── Real-time state ──────────────────────────────────────────────────────────
  // messages: Map<conversationId, Message[]> — loaded per-conversation from API
  const [messagesMap, setMessagesMap] = useState({})
  const [loadingMessages, setLoadingMessages] = useState(false)
  // typingUsers: Set<userId> typing in active conversation
  const [typingUsers, setTypingUsers] = useState(new Set())
  const typingTimers = useRef({})
  const typingRef = useRef(false) // whether WE are currently "typing"
  const messagesEndRef = useRef(null)

  // ── Conversations from store (hydrated by socket useEffect in useMeereoStore) ─
  const allConversations = useMemo(() => {
    const storeConvs = store.conversations || []
    // Normalize backend conversations to the UI shape expected by existing components
    return storeConvs
      .filter(c => !c._deleted)
      .map(c => {
        // Backend shape (GET): { id, title, isGroup, participants: [{id,name,type}], lastMessage }
        // Backend shape (POST): { id, isGroup, participants: [{userId,user:{id,name,type}}] }
        // Local shape: { id, nom, msgs, ... } — always has a 'nom' field
        // Detect backend conv: no 'nom' AND participants are objects
        const hasParticipants = !!c.participants && Array.isArray(c.participants) && c.participants.length > 0
          && typeof c.participants[0] === 'object' && c.participants[0] !== null
        const isBackend = !c.nom && hasParticipants
        if (!isBackend) return c // already in UI shape (local-only convs)

        // Normalize participants: handle both GET format ({id,name}) and POST format ({userId,user:{id,name}})
        const participants = c.participants.map(p => {
          if (p.user && typeof p.user === 'object') return { ...p.user, photoUrl: p.user.photoUrl || null }
          return p
        })

        const myId = store.user?.id
        const otherParticipants = participants.filter(p => p.id !== myId)
        const firstOther = otherParticipants[0]
        const nom = c.isGroup
          ? (c.title || 'Groupe')
          : (firstOther?.name || 'Contact')
        // Photo réelle : priorité au champ photoUrl pré-calculé côté serveur
        const photoUrl = !c.isGroup
          ? (firstOther?.photoUrl ||
             firstOther?.onboardingData?.photoUrl ||
             firstOther?.onboardingData?.logoFileUrl ||
             firstOther?.avatar || null)
          : null
        const color = c.isGroup ? '#7C3AED' : '#2563EB'
        const lastMsg = c.lastMessage
        let dernier = ''
        if (lastMsg) {
          const content = lastMsg.type === 'image' ? 'Photo' : lastMsg.type === 'file' ? 'Fichier' : (lastMsg.text || '')
          if (content) {
            const isMe = lastMsg.senderId === myId
            const label = isMe ? 'Vous' : (lastMsg.senderName ? lastMsg.senderName.split(' ')[0].slice(0, 5) : null)
            dernier = label ? label + ' : ' + content : content
          }
        }
        // Safe date formatting — guard against undefined/invalid createdAt
        let time = ''
        if (lastMsg?.createdAt) {
          const d = new Date(lastMsg.createdAt)
          if (!isNaN(d.getTime())) {
            time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
          }
        }
        // Unread: messages after lastReadAt (simplified: keep existing unread count)
        const unread = c.unread || 0
        return {
          ...c,
          nom,
          color,
          avatar: nom?.[0]?.toUpperCase() || '?',
          photoUrl,
          participants,
          dernier,
          time,
          unread,
          // publicId du contact (pour lien vers profil public)
          publicId: !c.isGroup ? (firstOther?.publicId || null) : null,
          otherParticipantType: !c.isGroup ? (firstOther?.type || null) : null,
          // msgs is served from messagesMap; keep empty here so UI renders from messagesMap
          msgs: messagesMap[c.id] || [],
        }
      })
  }, [store.conversations, store.user?.id, messagesMap])

  const visibleConversations = allConversations.filter(c => !c._deleted)
  console.log('[MSG-DEBUG] all:', allConversations.length, 'visible:', visibleConversations.length, 'tab:', msgTab)
  const filtered = visibleConversations.filter(c => {
    if (msgTab === 'archives') return c._archived
    if (c._archived) return false
    const tabOk = msgTab === 'all' || c.type === msgTab || (msgTab === 'groupe' && c.isGroup) || (msgTab === 'demande' && c.pending)
    const q = search.toLowerCase()
    return tabOk && (!q || ((c.nom || c.title || '') + (c.participants || []).join(' ')).toLowerCase().includes(q))
  })
  console.log('[MSG-DEBUG] filtered:', filtered.length, 'search:', search)
  const _activeRaw = activeId ? visibleConversations.find(c => c.id === activeId) : null
  // Résoudre dynamiquement l'état `invited` : si le contact est inscrit sur Meereo,
  // on écrase `invited: false` même si l'ancienne donnée en store dit `true`.
  const active = useMemo(() => {
    if (!_activeRaw || _activeRaw.isGroup) return _activeRaw
    if (!_activeRaw.invited) return _activeRaw
    const users = store.users || []
    const nom = (_activeRaw.nom || '').toLowerCase()
    const email = (_activeRaw.email || '').toLowerCase()
    const found = users.some(u =>
      u && u.status !== 'deleted' &&
      ((u.name || '').toLowerCase() === nom || (email && (u.email || '').toLowerCase() === email))
    )
    return found ? { ..._activeRaw, invited: false } : _activeRaw
  }, [_activeRaw, store.users])
  const nonLus = visibleConversations.filter(c => !c._archived).reduce((s, c) => s + (c.unread || 0), 0)
  const archivedCount = visibleConversations.filter(c => c._archived).length

  // Close context menu on outside click
  useEffect(() => {
    if (!ctxMenu) return
    const handler = (e) => { if (ctxRef.current && !ctxRef.current.contains(e.target)) setCtxMenu(null) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [ctxMenu])

  // ── Load messages when active conversation changes ──────────────────────────
  useEffect(() => {
    if (!activeId) return
    const convId = activeId

    // If we already have messages, skip
    if (messagesMap[convId]) {
      joinConversation(convId)
      return
    }

    // Only load from API if the conversation has a backend ID (not a local "conv_xxx" ID)
    if (String(convId).startsWith('conv_')) {
      joinConversation(convId)
      return
    }

    setLoadingMessages(true)
    joinConversation(convId)

    api.conversations.getMessages(convId)
      .then(({ messages }) => {
        const shaped = (messages || []).map(m => ({
          id: m.id,
          side: m.senderId === store.user?.id ? 'out' : 'in',
          from: m.sender?.name,
          text: m.text,
          type: m.type || 'text',
          fileUrl: m.fileUrl,
          url: m.fileUrl || null,
          fileName: m.fileName,
          time: new Date(m.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          senderId: m.senderId,
          read: true,
        }))
        setMessagesMap(prev => ({ ...prev, [convId]: shaped }))
        // Mark read
        api.conversations.markRead(convId).catch(() => {})
        emitRead(convId)
      })
      .catch(() => {})
      .finally(() => setLoadingMessages(false))

    return () => {
      leaveConversation(convId)
    }
  }, [activeId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Real-time: subscribe to new messages ───────────────────────────────────
  useEffect(() => {
    const token = store._token
    if (!token) return
    const socket = getSocket(token)

    const handleNewMessage = (msg) => {
      const convId = msg.conversationId
      const shaped = {
        id: msg.id,
        side: msg.senderId === store.user?.id ? 'out' : 'in',
        from: msg.sender?.name,
        text: msg.text,
        type: msg.type || 'text',
        fileUrl: msg.fileUrl,
        url: msg.fileUrl || null,
        fileName: msg.fileName,
        time: new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        senderId: msg.senderId,
        read: convId === activeId,
      }

      setMessagesMap(prev => {
        const existing = prev[convId] || []
        // Prevent duplicate (optimistic already inserted)
        if (existing.some(m => m.id === msg.id)) return prev
        return { ...prev, [convId]: [...existing, shaped] }
      })

      // Update conversation lastMessage + unread in store
      updateStore(prev => ({
        ...prev,
        conversations: (prev.conversations || []).map(c => {
          if (c.id !== convId) return c
          const isActive = convId === activeId
          return {
            ...c,
            lastMessage: { id: msg.id, text: msg.text, type: msg.type, senderId: msg.senderId, senderName: msg.sender?.name, createdAt: msg.createdAt },
            unread: isActive ? 0 : (c.unread || 0) + 1,
          }
        }),
      }))

      if (convId === activeId) {
        emitRead(convId)
      }
    }

    socket.on('message:new', handleNewMessage)
    return () => { socket.off('message:new', handleNewMessage) }
  }, [store._token, store.user?.id, activeId]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Typing indicators ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeId || !store._token) return
    const socket = getSocket(store._token)

    const handleTyping = ({ userId: uid, conversationId }) => {
      if (conversationId !== activeId) return
      setTypingUsers(prev => new Set([...prev, uid]))
      // Clear typing after 3s
      clearTimeout(typingTimers.current[uid])
      typingTimers.current[uid] = setTimeout(() => {
        setTypingUsers(prev => { const next = new Set(prev); next.delete(uid); return next })
      }, 3000)
    }
    const handleTypingStop = ({ userId: uid, conversationId }) => {
      if (conversationId !== activeId) return
      setTypingUsers(prev => { const next = new Set(prev); next.delete(uid); return next })
    }

    socket.on('typing', handleTyping)
    socket.on('typing:stop', handleTypingStop)
    return () => {
      socket.off('typing', handleTyping)
      socket.off('typing:stop', handleTypingStop)
    }
  }, [activeId, store._token])

  // ── Auto-scroll to bottom when messages arrive ─────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messagesMap, activeId])

  // Handle conversation actions
  const handleConvAction = (type, convId) => {
    const conv = allConversations.find(c => c.id === convId)
    if (!conv) return
    if (type === 'unread') {
      updateConv(convId, c => ({ ...c, unread: 1 }))
      showToast && showToast('Conversation marquée non lue')
      return
    }
    if (type === 'unarchive') {
      // Direct unarchive (no confirm needed, it's non-destructive)
      updateConv(convId, c => ({ ...c, _archived: false }))
      showToast && showToast('Conversation restaurée')
      return
    }
    // Actions that require confirmation
    setConfirmAction({ type, convId, convName: conv.nom, isGroup: conv.isGroup })
  }

  const executeAction = () => {
    if (!confirmAction) return
    const { type, convId } = confirmAction
    const isStoreConv = (store.conversations || []).some(c => c.id === convId)

    if (type === 'archive') {
      if (isStoreConv) {
        updateConv(convId, c => ({ ...c, _archived: true }))
      } else {
        // Legacy conversation — copy to store with archived flag
        const conv = allConversations.find(c => c.id === convId)
        if (conv) updateStore(prev => ({ ...prev, conversations: [...(prev.conversations || []), { ...conv, _archived: true }] }))
      }
      if (activeId === convId) setActiveId(null)
      showToast && showToast('Conversation archivée')
    } else if (type === 'unarchive') {
      updateConv(convId, c => ({ ...c, _archived: false }))
      showToast && showToast('Conversation restaurée')
    } else if (type === 'delete') {
      // Call backend to remove the current user from this conversation (won't reload on next sync)
      if (!String(convId).startsWith('conv_')) {
        api.conversations.delete(convId).catch(() => {})
      }
      if (isStoreConv) {
        updateConv(convId, c => ({ ...c, _deleted: true }))
      } else {
        const conv = allConversations.find(c => c.id === convId)
        if (conv) updateStore(prev => ({ ...prev, conversations: [...(prev.conversations || []), { ...conv, _deleted: true }] }))
      }
      if (activeId === convId) setActiveId(null)
      showToast && showToast('Conversation supprimée')
    } else if (type === 'quit') {
      updateConv(convId, c => ({
        ...c,
        _deleted: true,
        msgs: [...(c.msgs || []), { side: 'in', from: 'Systeme', text: 'Vous avez quitté le groupe', time: new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }) }]
      }))
      if (activeId === convId) setActiveId(null)
      showToast && showToast('Vous avez quitté le groupe')
    }
    setConfirmAction(null)
  }

  const updateConv = (convId, updater) => {
    updateStore(prev => {
      const storeConvs = prev.conversations || []
      const inStore = storeConvs.some(c => c.id === convId)
      if (inStore) {
        return { ...prev, conversations: storeConvs.map(c => c.id === convId ? updater(c) : c) }
      }
      // Legacy conversation — copy to store with the update applied
      const legacy = allConversations.find(c => c.id === convId)
      if (legacy) {
        return { ...prev, conversations: [...storeConvs, updater({ ...legacy })] }
      }
      return prev
    })
  }

  const sendMsg = useCallback((text, type) => {
    if (!active || active.pending) return
    const msgText = text || input.trim()
    if (!msgText && !type) return

    const convId = active.id
    const myId = store.user?.id
    const time = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    const dernier = type === 'image' ? 'Photo' : type === 'file' ? 'Fichier' : type === 'devis' ? 'Proposition commerciale' : msgText

    // Optimistic insert
    const optimistic = {
      id: '_opt_' + Date.now(),
      side: 'out',
      text: msgText,
      type: type || 'text',
      time,
      senderId: myId,
      read: false,
      _pending: true,
    }

    setMessagesMap(prev => ({ ...prev, [convId]: [...(prev[convId] || []), optimistic] }))
    setInput('')
    if (typingRef.current) { emitTypingStop(convId); typingRef.current = false }

    // If this is a local (legacy) conversation without backend, just update in-place
    if (String(convId).startsWith('conv_')) {
      updateConv(convId, c => ({ ...c, msgs: [...(c.msgs || []), { ...optimistic, _pending: false }], dernier }))
      return
    }

    // Send via WebSocket
    sendSocketMessage({ conversationId: convId, text: msgText, type: type || 'text' }, (ack) => {
      if (ack?.error) {
        // Revert optimistic on error
        setMessagesMap(prev => ({
          ...prev,
          [convId]: (prev[convId] || []).filter(m => m.id !== optimistic.id),
        }))
        showToast && showToast('Erreur envoi — ' + ack.error)
        return
      }
      // Replace optimistic with confirmed message from server
      const confirmed = ack?.message
      if (confirmed) {
        const shaped = {
          id: confirmed.id,
          side: 'out',
          from: confirmed.sender?.name,
          text: confirmed.text,
          type: confirmed.type || 'text',
          time: new Date(confirmed.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          senderId: confirmed.senderId,
          read: true,
        }
        setMessagesMap(prev => ({
          ...prev,
          [convId]: (prev[convId] || []).map(m => m.id === optimistic.id ? shaped : m),
        }))
        // Update conversation list
        updateStore(prev => ({
          ...prev,
          conversations: (prev.conversations || []).map(c =>
            c.id === convId
              ? { ...c, lastMessage: { id: confirmed.id, text: confirmed.text, type: confirmed.type, senderId: myId, senderName: '', createdAt: confirmed.createdAt }, dernier }
              : c
          ),
        }))
      }
    })
  }, [active, input, store.user?.id, updateStore, showToast]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileAttach = () => {
    const inp = document.createElement('input')
    inp.type = 'file'
    inp.multiple = true
    inp.accept = 'image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx'
    inp.onchange = async (e) => {
      const files = Array.from(e.target.files || [])
      if (!files.length || !active) return
      for (const f of files) {
        const isImg = f.type.startsWith('image/')
        const isVid = f.type.startsWith('video/')
        const time = new Date().toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })
        const msg = { side: 'out', time, read: false }

        if (isImg) {
          // Compress and embed image
          try {
            const { default: compress } = await import('../../utils/compressImage')
            const url = await compress(f, 800, 0.75)
            msg.type = 'image'; msg.url = url; msg.text = f.name
          } catch { msg.type = 'file'; msg.text = f.name }
        } else if (isVid) {
          // Read video as data URL (only if small < 10MB)
          if (f.size < 10 * 1024 * 1024) {
            const url = await new Promise(r => { const reader = new FileReader(); reader.onload = () => r(reader.result); reader.readAsDataURL(f) })
            msg.type = 'video'; msg.url = url; msg.text = f.name
          } else {
            msg.type = 'video'; msg.text = f.name; msg.size = (f.size / 1e6).toFixed(1) + ' Mo'
          }
        } else {
          msg.type = 'file'; msg.text = f.name
          msg.size = f.size > 1e6 ? (f.size / 1e6).toFixed(1) + ' Mo' : Math.round(f.size / 1024) + ' Ko'
        }

        const dernier = isImg ? 'Photo' : isVid ? 'Vidûo' : f.name
        // For local conversations: update msgs array in store
        // For backend conversations: send via socket (file support future)
        const convId = active.id
        if (String(convId).startsWith('conv_')) {
          updateConv(convId, c => ({ ...c, msgs: [...(c.msgs || []), msg], dernier, time: 'Maintenant' }))
        } else {
          // Optimistic for backend conv — includes fileUrl so image displays immediately
          const optimistic = { ...msg, id: '_opt_' + Date.now(), senderId: store.user?.id }
          setMessagesMap(prev => ({ ...prev, [convId]: [...(prev[convId] || []), optimistic] }))
          sendSocketMessage({
            conversationId: convId,
            text: msg.text || dernier,
            type: msg.type || 'text',
            fileUrl: msg.url || null,
            fileName: msg.text || null,
          }, (ack) => {
            if (!ack?.error && ack?.message) {
              setMessagesMap(prev => ({
                ...prev,
                [convId]: (prev[convId] || []).map(m =>
                  m.id === optimistic.id
                    ? { ...optimistic, id: ack.message.id, _pending: false }
                    : m
                ),
              }))
            }
          })
        }
      }
    }
    inp.click()
  }

  const directContacts = getDirectContacts(store.projects || [], store)
  // Include all registered backend users as searchable contacts
  const registeredUserContacts = (store.users || [])
    .filter(u => u.id !== store.user?.id && u.status !== 'deleted' && u.name)
    .map(u => ({
      nom: u.name,
      role: u.type === 'pro' ? 'Professionnel' : u.type === 'client' ? 'Client' : u.type === 'fournisseur' ? 'Fournisseur' : 'Utilisateur',
      source: (u.type === 'pro' || u.type === 'fournisseur') ? 'prestataire' : 'client',
      direct: true, registered: true, email: u.email || '', userId: u.id,
    }))
  const allSearchable = [
    ...directContacts,
    ...registeredUserContacts.filter(u => !directContacts.find(d => d.nom === u.nom)),
    ...EXTERNAL_PROS.filter(e => !directContacts.find(d => d.nom === e.nom)).map(e => ({ ...e, source: 'externe', direct: false })),
  ]
  const newConvFiltered = newConvSearch
    ? allSearchable.filter(c => (c.nom + c.role).toLowerCase().includes(newConvSearch.toLowerCase()))
    : allSearchable.slice(0, 30)
  const inviteFiltered = inviteSearch
    ? allSearchable.filter(c => (c.nom + c.role).toLowerCase().includes(inviteSearch.toLowerCase()))
    : allSearchable.slice(0, 30)
  const groupFiltered = groupSearch
    ? allSearchable.filter(c => (c.nom + c.role).toLowerCase().includes(groupSearch.toLowerCase()) && !groupMembers.includes(c.nom))
    : allSearchable.filter(c => !groupMembers.includes(c.nom)).slice(0, 30)

  const startConversation = async (c) => {
    const existing = allConversations.find(conv => conv.nom === c.nom && !conv.isGroup)
    if (existing) { setActiveId(existing.id); setShowNewConv(false); return }

    // Try to find matching backend user — prefer userId if already resolved
    const backendUser = c.userId ? { id: c.userId }
      : (store.users || []).find(u => u.id !== store.user?.id && (u.name === c.nom || u.email === c.email) && u.id && !String(u.id).startsWith('u_'))
      || (store.fournisseurs || []).find(u => u.name === c.nom || u.nom === c.nom)

    if (backendUser?.id && store._token) {
      try {
        const { conversation } = await api.conversations.create({ participantId: backendUser.id })
        updateStore(prev => {
          const ids = new Set((prev.conversations || []).map(x => x.id))
          if (ids.has(conversation.id)) return prev
          return { ...prev, conversations: [conversation, ...(prev.conversations || [])] }
        })
        setActiveId(conversation.id)
        setShowNewConv(false)
        return
      } catch (e) {
        console.warn('[startConversation]', e.message)
      }
    }

    const id = 'conv_' + Date.now()
    let newConv
    if (!c.direct) {
      newConv = { id, nom: c.nom, type: 'demande', avatar: c.nom[0], color: '#F59E0B', isGroup: false, participants: [c.nom], pending: true, invited: true, dernier: 'Demande envoyée', time: 'Maintenant', unread: 0, msgs: [{ side: 'out', text: 'Bonjour, je souhaiterais échanger avec vous.', time: 'Maintenant', read: false }] }
      showToast && showToast('Demande envoyée — en attente d\'acceptation')
    } else if (!c.registered) {
      newConv = { id, nom: c.nom, type: c.source === 'client' ? 'client' : c.source === 'equipe' ? 'equipe' : 'entreprise', avatar: c.nom[0], color: srcColor(c.source), isGroup: false, participants: [c.nom], invited: true, email: c.email || '', role: c.role, dernier: 'Invitation envoyée', time: 'Maintenant', unread: 0, msgs: [] }
    } else {
      newConv = { id, nom: c.nom, type: c.source === 'client' ? 'client' : c.source === 'equipe' ? 'equipe' : 'entreprise', avatar: c.nom[0], color: srcColor(c.source), isGroup: false, participants: [c.nom], invited: false, dernier: '', time: 'Maintenant', unread: 0, msgs: [] }
    }
    updateStore(prev => ({ ...prev, conversations: [newConv, ...(prev.conversations || [])] }))
    setActiveId(id)
    setShowNewConv(false)
  }

  const ContactRow = ({ c, onClick }) => {
    const initials = c.nom.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    const isInvited = c.direct && !c.registered
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background .1s' }} onClick={onClick} onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'} onMouseOut={e => e.currentTarget.style.background = ''}>
        <div style={{ width: 36, height: 36, borderRadius: 18, background: !c.direct ? 'rgba(255,149,0,.1)' : isInvited ? 'rgba(107,114,128,.08)' : 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: !c.direct ? '#F59E0B' : isInvited ? '#9CA3AF' : 'var(--t2)', flexShrink: 0 }}>{initials}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{c.nom}</div>
          <div style={{ fontSize: 11, color: 'var(--t3)' }}>{c.role}{c.ville ? ' à ' + c.ville : ''}</div>
        </div>
        <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: srcColor(c.source) + '14', color: srcColor(c.source) }}>{srcLabel(c.source)}</span>
        {!c.direct && <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: 'rgba(255,149,0,.08)', color: '#F59E0B' }}>Demande</span>}
        {isInvited && <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: 'rgba(107,114,128,.08)', color: '#9CA3AF' }}>Invité</span>}
      </div>
    )
  }

  // Group marché conversations as Discord-style threads under their project parent
  const { mainConvs, threadMap } = useMemo(() => {
    const byProject = {}
    for (const c of visibleConversations) {
      if (!c.marketId && c.projectId) byProject[c.projectId] = c.id
    }
    const map = {}
    const threadIds = new Set()
    for (const c of visibleConversations) {
      if (c.marketId && c.projectId) {
        const parentId = byProject[c.projectId]
        if (parentId) {
          if (!map[parentId]) map[parentId] = []
          map[parentId].push(c)
          threadIds.add(c.id)
        }
      }
    }
    const result = filtered.filter(c => !threadIds.has(c.id))
    console.log('[MSG-DEBUG] mainConvs:', result.length, 'threadIds:', [...threadIds])
    return { mainConvs: result, threadMap: map }
  }, [visibleConversations, filtered])

  return (
    <div>
      <div className="split">
        {/* Sidebar */}
        <div className="split-left">
          {/* Header inside split-left */}
          <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-.3px' }}>Messages</span>
                {nonLus > 0 && <span style={{ padding: '2px 8px', borderRadius: 100, background: 'var(--tx)', color: '#fff', fontSize: 10, fontWeight: 700 }}>{nonLus}</span>}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={() => { setShowNewGroup(true); setGroupName(''); setGroupMembers([]); setGroupSearch('') }} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--s2)', border: '1px solid var(--border-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Créer un groupe">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--tx)" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                </button>
                <button onClick={() => { setShowNewConv(true); setNewConvSearch('') }} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--tx)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Nouvelle conversation">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                </button>
              </div>
            </div>
          </div>
          <div style={{ padding: '8px 14px 10px', borderBottom: '1px solid var(--border)' }}>
            <div data-search style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--s2)', borderRadius: 10, border: '1px solid var(--border-card)', marginBottom: 10 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 12, fontFamily: 'var(--f)', color: 'var(--tx)' }} />
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {[['all', 'Tout'], ['equipe', 'Equipe'], ['client', 'Clients'], ['entreprise', 'Prestataires'], ['groupe', 'Groupes'], ['demande', 'Demandes'], ['archives', 'Archivés']].map(([k, l]) => (
                <button key={k} className={`filter-pill ${msgTab === k ? 'active' : ''}`} onClick={() => setMsgTab(k)} style={{ fontSize: 10.5 }}>{l}{k === 'archives' && archivedCount > 0 ? ` (${archivedCount})` : ''}</button>
              ))}
            </div>
          </div>
          <div style={{ overflowY: 'auto' }}>
            {filtered.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, opacity: .3, marginBottom: 10 }}>{msgTab === 'archives' ? <Package size={28}/> : <MessageSquare size={28}/>}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>
                  {msgTab === 'archives' ? 'Aucune archive' : 'Aucune conversation'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>
                  {msgTab === 'archives'
                    ? 'Les conversations archivées apparaîtront ici. Utilisez le menu ééé ou le clic droit pour archiver.'
                    : 'Vos échanges apparaîtront ici.'}
                </div>
              </div>
            )}
            {mainConvs.map(c => {
              const av = getContactAvatar(c.nom, store.projects || [])
              // Photo réelle : priorité à photoUrl (depuis backend), puis getContactAvatar (statique)
              const listPhoto = c.photoUrl || (av?.type === 'img' ? av.value : null)
              const convThreads = threadMap[c.id] || []
              const mainRow = (
              <div key={'c-' + c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderBottom: convThreads.length ? 'none' : '1px solid var(--border)', cursor: 'pointer', background: active?.id === c.id ? 'var(--s2)' : undefined, transition: 'background .12s' }}
                onClick={() => { setActiveId(c.id); if (c.unread) updateConv(c.id, cv => ({ ...cv, unread: 0 })) }}
                onContextMenu={(e) => { e.preventDefault(); setCtxMenu({ convId: c.id, x: e.clientX, y: e.clientY }) }}
              >
                <div style={{ width: 42, height: 42, borderRadius: c.isGroup ? 12 : 21, background: av?.type === 'color' ? av.value : c.color + '14', color: av?.type === 'color' ? '#fff' : c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: av?.type === 'emoji' ? 20 : 13, fontWeight: 700, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                  {listPhoto
                    ? <img src={listPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
                    : av?.type === 'color' ? av.initials : av?.type === 'emoji' ? av.value : c.avatar
                  }
                  {c.isGroup && <div style={{ position: 'absolute', bottom: -2, right: -2, width: 16, height: 16, borderRadius: '50%', background: 'var(--surface-1)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={8}/></div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                    <div style={{ fontSize: 13.5, fontWeight: c.unread ? 800 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-.2px' }}>{c.nom}</div>
                    <span style={{ fontSize: 10, color: 'var(--t4)', flexShrink: 0, marginLeft: 8 }}>{c.time}</span>
                  </div>
                  <div style={{ fontSize: 12, color: c.unread ? 'var(--tx)' : 'var(--t3)', fontWeight: c.unread ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c._archived && <span style={{ fontSize: 10, color: 'var(--t4)', marginRight: 4 }}><Package size={10}/></span>}
                    {c.dernier}
                  </div>
                </div>
                {c.pending && <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 100, background: 'rgba(255,149,0,.1)', color: 'var(--wrn)', flexShrink: 0 }}>ATTENTE</span>}
                {!c.pending && c.invited && <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 100, background: 'rgba(107,114,128,.08)', color: '#9CA3AF', flexShrink: 0 }}>INVITé</span>}
                {c.unread > 0 && !c.pending && !c.invited && <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--tx)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{c.unread}</div>}
              </div>
            )})}
          </div>
        </div>

        {/* Chat */}
        <div className="split-right" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {!active ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 12 }}>
              <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MessageSquare size={24}/></div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Vos messages</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', maxWidth: 260, textAlign: 'center', lineHeight: 1.5 }}>Selectionnez une conversation ou demarrez-en une nouvelle</div>
              <button style={{ marginTop: 8, padding: '9px 18px', borderRadius: 10, background: 'var(--tx)', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12.5, fontWeight: 600, color: '#fff' }} onClick={() => { setShowNewConv(true); setNewConvSearch('') }}>Nouvelle conversation</button>
            </div>
          ) : (
            <>
              {/* Header */}
              <ChatHeader active={active} navigate={navigate} showToast={showToast} setShowInvite={setShowInvite} setInviteSearch={setInviteSearch} setShowParticipants={setShowParticipants} projects={store.projects || []} onAction={handleConvAction} />

              {/* Archive banner */}
              {active._archived && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', background: 'rgba(107,114,128,.04)', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 13 }}><Package size={13}/></span>
                    <span style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 500 }}>Cette conversation est archivée</span>
                  </div>
                  <button onClick={() => handleConvAction('unarchive', active.id)} style={{ padding: '6px 14px', borderRadius: 8, background: 'var(--tx)', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 11.5, fontWeight: 600, color: '#fff', transition: 'opacity .12s' }} onMouseOver={e => e.currentTarget.style.opacity = '.85'} onMouseOut={e => e.currentTarget.style.opacity = '1'}>Restaurer</button>
                </div>
              )}

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {/* Invited contact — info card at top of empty conversation */}
                {(() => {
                  const activeMsgs = active.invited ? (messagesMap[active.id] || active.msgs || []) : (messagesMap[active.id] || active.msgs || [])
                  return (
                    <>
                      {active.invited && activeMsgs.length === 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8 }}>
                          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(107,114,128,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6"/><path d="M23 11h-6"/></svg>
                          </div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tx)' }}>{active.nom}</div>
                          <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
                            Ce contact n'a pas encore créé son compte sur MEEREO. Invitez-le à rejoindre la plateforme pour dûmarrer la conversation.
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, padding: '6px 14px', borderRadius: 100, background: 'rgba(107,114,128,.06)' }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#9CA3AF' }} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF' }}>En attente d'inscription</span>
                          </div>
                        </div>
                      )}
                      {loadingMessages && !activeMsgs.length && (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px 0' }}>
                          <span style={{ fontSize: 11, color: 'var(--t4)' }}>Chargement...</span>
                        </div>
                      )}
                      {activeMsgs.map((m, i) => (
                        <div key={m.id || i}>
                          {active.isGroup && m.side === 'in' && m.from && (
                            <div style={{ fontSize: 10, fontWeight: 700, color: m.from === 'Systeme' ? 'var(--t4)' : active.color, marginBottom: 3, marginLeft: 4 }}>{m.from}</div>
                          )}
                          {m.from === 'Systeme' ? (
                            <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--t4)', fontStyle: 'italic', padding: '4px 0' }}>{m.text}</div>
                          ) : (
                            <>
                              <div style={{ display: 'flex', justifyContent: m.side === 'out' ? 'flex-end' : 'flex-start', opacity: m._pending ? 0.65 : 1 }}>
                                {(() => {
                                  // Src robuste : url (base64/http) OU fileUrl du backend
                                  const imgSrc = m.url || m.fileUrl || null
                                  const vidSrc = m.url || m.fileUrl || null
                                  if (m.type === 'image' && imgSrc) return (
                                    <div style={{ maxWidth: '65%', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,.08)' }} onClick={() => window.open(imgSrc, '_blank')}>
                                      <img src={imgSrc} alt={m.text || 'Photo'} style={{ width: '100%', display: 'block', objectFit: 'cover', maxHeight: 300 }} onError={e => { e.target.parentElement.style.display = 'none' }} />
                                      {m.text && m.text !== imgSrc && <div style={{ padding: '6px 12px', fontSize: 10, color: 'var(--t4)', background: m.side === 'out' ? 'var(--tx)' : 'var(--s2)' }}>{m.text}</div>}
                                    </div>
                                  )
                                  if (m.type === 'image' && !imgSrc) return (
                                    <div style={{ padding: '10px 14px', borderRadius: 14, background: m.side === 'out' ? 'var(--tx)' : 'var(--s2)', color: m.side === 'out' ? '#fff' : 'var(--tx)', display: 'flex', alignItems: 'center', gap: 10, maxWidth: '70%' }}>
                                      <Camera size={14}/><div style={{ fontSize: 12.5, fontWeight: 600 }}>{m.text || 'Photo'}</div>
                                    </div>
                                  )
                                  if (m.type === 'video' && vidSrc) return (
                                    <div style={{ maxWidth: '65%', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}>
                                      <video src={vidSrc} controls style={{ width: '100%', display: 'block', maxHeight: 300, borderRadius: 14 }} />
                                      {m.text && <div style={{ padding: '6px 12px', fontSize: 10, color: 'var(--t4)', background: m.side === 'out' ? 'var(--tx)' : 'var(--s2)' }}>{m.text}</div>}
                                    </div>
                                  )
                                  if (m.type === 'video') return (
                                    <div style={{ padding: '10px 14px', borderRadius: 14, background: m.side === 'out' ? 'var(--tx)' : 'var(--s2)', color: m.side === 'out' ? '#fff' : 'var(--tx)', display: 'flex', alignItems: 'center', gap: 10, maxWidth: '70%' }}>
                                      <Video size={14}/><div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{m.text || 'Vidéo'}</div>{m.size && <div style={{ fontSize: 10, opacity: .7 }}>{m.size}</div>}</div>
                                    </div>
                                  )
                                  if (m.type === 'file') return (
                                    <div style={{ padding: '10px 14px', borderRadius: 14, background: m.side === 'out' ? 'var(--tx)' : 'var(--s2)', color: m.side === 'out' ? '#fff' : 'var(--tx)', display: 'flex', alignItems: 'center', gap: 10, maxWidth: '70%', cursor: m.fileUrl ? 'pointer' : 'default' }}
                                      onClick={() => m.fileUrl && window.open(m.fileUrl, '_blank')}>
                                      <div style={{ width: 32, height: 32, borderRadius: 8, background: m.side === 'out' ? 'rgba(255,255,255,.15)' : 'var(--surface-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: m.side === 'out' ? '#fff' : 'var(--t2)', flexShrink: 0 }}><Paperclip size={14}/></div>
                                      <div><div style={{ fontSize: 12.5, fontWeight: 600 }}>{m.fileName || m.text}</div>{m.size && <div style={{ fontSize: 10, opacity: .7 }}>{m.size}</div>}</div>
                                    </div>
                                  )
                                  if (m.type === 'devis') {
                                    let d = {}
                                    try { d = JSON.parse(m.text) } catch { d = { montant: m.text } }
                                    const isOut = m.side === 'out'
                                    return (
                                      <div style={{ maxWidth: '72%', borderRadius: isOut ? '18px 18px 4px 18px' : '18px 18px 18px 4px', overflow: 'hidden', border: '1px solid var(--border-card)', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
                                      <div style={{ padding: '8px 14px 6px', background: isOut ? 'var(--tx)' : 'var(--s2)', display: 'flex', alignItems: 'center', gap: 7 }}>
                                        <span style={{ fontSize: 12 }}>“‹</span>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: isOut ? 'rgba(255,255,255,.55)' : 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Proposition commerciale</span>
                                      </div>
                                      <div style={{ padding: '10px 14px 12px', background: isOut ? 'rgba(0,0,0,.6)' : 'var(--surface-1)', display: 'flex', gap: 24 }}>
                                        {d.montant && (
                                          <div>
                                            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>Montant</div>
                                            <div style={{ fontSize: 15, fontWeight: 800, color: isOut ? '#fff' : 'var(--tx)', letterSpacing: '-.4px' }}>{Number(d.montant.toString().replace(/\D/g, '')).toLocaleString('fr-FR')} <span style={{ fontSize: 11, fontWeight: 500 }}>FCFA</span></div>
                                          </div>
                                        )}
                                        {d.delai && (
                                          <div>
                                            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>Délai</div>
                                            <div style={{ fontSize: 14, fontWeight: 700, color: isOut ? '#fff' : 'var(--tx)' }}>{d.delai}</div>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                  }
                                  return (
                                    <div style={{
                                      maxWidth: '72%', padding: '10px 16px', fontSize: 13, lineHeight: 1.55,
                                      ...(m.side === 'out'
                                        ? { background: 'var(--tx)', color: '#fff', borderRadius: '18px 18px 4px 18px' }
                                        : { background: 'var(--s2)', color: 'var(--tx)', borderRadius: '18px 18px 18px 4px' })
                                    }}>{m.text}</div>
                                  )
                                })()}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: m.side === 'out' ? 'flex-end' : 'flex-start', padding: '0 4px', marginTop: 2 }}>
                                <span style={{ fontSize: 10, color: 'var(--t4)' }}>{m.time}</span>
                                {m.side === 'out' && <span style={{ color: m.read ? '#007AFF' : 'var(--t4)' }}>{m.read ? <CheckCheck size={10}/> : <Check size={10}/>}</span>}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                      {/* Typing indicator */}
                      {typingUsers.size > 0 && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
                          <div style={{ display: 'flex', gap: 3, padding: '8px 14px', background: 'var(--s2)', borderRadius: '18px 18px 18px 4px' }}>
                            {[0,1,2].map(j => (
                              <div key={j} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--t3)', animation: `bounce 1.2s ${j*0.2}s infinite` }} />
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Auto-scroll anchor */}
                      <div ref={messagesEndRef} />
                    </>
                  )
                })()}
              </div>

              {/* Input — 3 states: pending / invited / normal */}
              {active.pending ? (
                <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)', flexShrink: 0, background: 'rgba(255,149,0,.03)' }}>
                  <div style={{ fontSize: 12, color: 'var(--t3)', textAlign: 'center', marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Lock size={12}/> En attente d’acceptation par <strong>{active.nom}</strong></div>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    <button className="btn btn-sm" onClick={() => { updateStore(prev => ({ ...prev, conversations: (prev.conversations || []).filter(c => c.id !== active.id) })); setActiveId(null); showToast && showToast('Demande annulée') }}>Annuler</button>
                    <button className="btn btn-primary btn-sm" onClick={() => { updateConv(active.id, c => ({ ...c, pending: false, invited: false, type: 'entreprise', avatar: active.nom ? active.nom[0] : '?', color: '#16A34A', msgs: [...(c.msgs || []), { side: 'in', text: 'Bonjour, je suis disponible. Comment puis-je vous aider ?', time: 'Maintenant', read: true }], dernier: 'Demande acceptée' })); setActiveId(null); setTimeout(() => setActiveId(active.id), 0); showToast && showToast(active.nom + ' a accepté') }}>Simuler l'acceptation</button>
                  </div>
                </div>
              ) : active.invited ? (
                /* ─── Contact invité — pas encore inscrit sur MEEREO ─── */
                <div style={{ padding: '18px 20px', borderTop: '1px solid var(--border)', flexShrink: 0, background: 'rgba(107,114,128,.02)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(107,114,128,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--tx)' }}>{active.nom} n'est pas encore sur MEEREO</div>
                      <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 1 }}>La messagerie sera disponible après son inscription.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn btn-primary btn-sm" style={{ fontSize: 11.5, padding: '8px 16px' }} onClick={() => {
                      const email = active.email
                      if (email) {
                        showToast && showToast('Invitation envoyée à ' + email)
                      } else {
                        showToast && showToast('Invitation envoyée')
                      }
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6, verticalAlign: -1 }}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                      {active.email ? 'Inviter par email' : 'Envoyer l\'invitation'}
                    </button>
                    <button className="btn btn-sm" style={{ fontSize: 11.5, padding: '8px 16px' }} onClick={() => {
                      const link = window.location.origin + '/inscription?ref=' + (store.user?.id || 'meereo')
                      navigator.clipboard?.writeText(link)
                      showToast && showToast('Lien d\'invitation copié')
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6, verticalAlign: -1 }}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                      Copier le lien
                    </button>
                    <button className="btn btn-sm" style={{ fontSize: 11.5, padding: '8px 16px' }} onClick={() => {
                      showToast && showToast('Invitation relancée')
                    }}>
                      Relancer
                    </button>
                  </div>
                  {active.email && <div style={{ fontSize: 10.5, color: 'var(--t4)', marginTop: 10 }}>Email : {active.email}</div>}
                </div>
              ) : (
                /* ─── Utilisateur inscrit — messagerie normale ─── */
                <div style={{ borderTop: '1px solid var(--border)', flexShrink: 0 }}>
                  {/* ── Banniére suggestion prix/dûlai — visible uniquement pour le PRO dans une conversation 1-1 ── */}
                  {store.user?.type === 'pro' && active && !active.isGroup && !active.pending && !active.invited && (
                    showSuggestPanel ? (
                      <div style={{ padding: '10px 20px 6px', background: 'var(--s2)', borderBottom: '1px solid var(--border-card)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.06em' }}>“‹ Proposition commerciale</span>
                          <button onClick={() => { setShowSuggestPanel(false); setSuggestMontant(''); setSuggestDelai('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t4)', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <input
                            value={suggestMontant}
                            onChange={e => setSuggestMontant(e.target.value.replace(/\D/g, ''))}
                            placeholder="Montant (FCFA)"
                            style={{ flex: 2, padding: '8px 12px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f)', background: 'var(--surface-1)', outline: 'none', color: 'var(--tx)' }}
                          />
                          <input
                            value={suggestDelai}
                            onChange={e => setSuggestDelai(e.target.value)}
                            placeholder="Délai (ex: 6 mois)"
                            style={{ flex: 1, padding: '8px 12px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f)', background: 'var(--surface-1)', outline: 'none', color: 'var(--tx)' }}
                          />
                          <button
                            disabled={!suggestMontant && !suggestDelai}
                            onClick={() => {
                              if (!suggestMontant && !suggestDelai) return
                              sendMsg(JSON.stringify({ montant: suggestMontant, delai: suggestDelai }), 'devis')
                              setShowSuggestPanel(false)
                              setSuggestMontant('')
                              setSuggestDelai('')
                            }}
                            style={{ padding: '8px 16px', borderRadius: 10, background: suggestMontant || suggestDelai ? 'var(--tx)' : 'var(--s3)', color: suggestMontant || suggestDelai ? '#fff' : 'var(--t4)', border: 'none', fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--f)', cursor: suggestMontant || suggestDelai ? 'pointer' : 'default', transition: 'all .15s', flexShrink: 0 }}
                          >Envoyer</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ padding: '6px 20px 0', display: 'flex', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setShowSuggestPanel(true)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: 'var(--s2)', border: '1px solid var(--border-card)', cursor: 'pointer', fontSize: 11, fontWeight: 600, color: 'var(--t3)', fontFamily: 'var(--f)', transition: 'all .15s' }}
                          title="Suggérer un prix et un dûlai au client"
                        >
                          <span>“‹</span> Suggérer un prix
                        </button>
                      </div>
                    )
                  )}
                  <div style={{ padding: '10px 20px', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <button onClick={handleFileAttach} style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--s2)', border: '1px solid var(--border-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} title="Joindre un fichier">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                  </button>
                  <input
                    value={input}
                    onChange={e => {
                      setInput(e.target.value)
                      // Typing indicator
                      if (active && !String(active.id).startsWith('conv_')) {
                        if (!typingRef.current) {
                          typingRef.current = true
                          emitTypingStart(active.id)
                        }
                        clearTimeout(typingRef._timer)
                        typingRef._timer = setTimeout(() => {
                          typingRef.current = false
                          emitTypingStop(active.id)
                        }, 2000)
                      }
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMsg()
                      }
                    }}
                    placeholder="écrire un message..."
                    style={{ flex: 1, padding: '11px 16px', border: '1px solid var(--border-card)', borderRadius: 14, fontSize: 13, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)' }}
                  />
                  <button onClick={() => sendMsg()} style={{ width: 40, height: 40, borderRadius: 12, background: input.trim() ? 'var(--tx)' : 'var(--s3)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: input.trim() ? '#fff' : 'var(--t4)', transition: 'all .15s' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                  </button>
                  </div>{/* inner input row */}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MODAL: Nouvelle conversation */}
      {showNewConv && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setShowNewConv(false)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 460, maxHeight: '75vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.18)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 22px 14px', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>Nouvelle conversation</div>
                <button onClick={() => setShowNewConv(false)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t3)' }}>×</button>
              </div>
              <div data-search style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'var(--s2)', borderRadius: 10, border: '1px solid var(--border-card)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input value={newConvSearch} onChange={e => setNewConvSearch(e.target.value)} placeholder="Rechercher un contact..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, fontFamily: 'var(--f)', color: 'var(--tx)' }} autoFocus />
              </div>
              <div style={{ fontSize: 10, color: 'var(--t4)', marginTop: 8 }}>Les contacts externes devront accepter votre demande.</div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid var(--border)' }}>
              {newConvFiltered.length === 0 && <div style={{ padding: '24px', textAlign: 'center', fontSize: 12, color: 'var(--t4)' }}>Aucun contact</div>}
              {newConvFiltered.map((c, i) => <ContactRow key={i} c={c} onClick={() => startConversation(c)} />)}
            </div>
          </div>
        </div>
      , document.body)}

      {/* MODAL: Inviter */}
      {showInvite && active && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setShowInvite(false)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 440, maxHeight: '70vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.18)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 22px 12px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Ajouter a la conversation</div>
              <button onClick={() => setShowInvite(false)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--t3)' }}>×</button>
            </div>
            <div style={{ padding: '0 22px 12px' }}>
              <input placeholder="Rechercher..." value={inviteSearch} onChange={e => setInviteSearch(e.target.value)} style={{ width: '100%', padding: '8px 14px', border: '1px solid var(--border-card)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)' }} autoFocus />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid var(--border)' }}>
              {inviteFiltered.filter(c => c.direct && !(active.participants || []).includes(c.nom)).map((c, i) => (
                <ContactRow key={i} c={c} onClick={() => { updateConv(active.id, cv => ({ ...cv, participants: [...(cv.participants || []), c.nom], isGroup: true, msgs: [...(cv.msgs || []), { side: 'in', from: 'Systeme', text: c.nom + ' a rejoint la conversation', time: 'Maintenant' }] })); setShowInvite(false); showToast && showToast(c.nom + ' ajoute') }} />
              ))}
            </div>
          </div>
        </div>
      , document.body)}

      {/* MODAL: Groupe */}
      {showNewGroup && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setShowNewGroup(false)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.18)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 22px 14px', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 16, fontWeight: 800 }}>Créer un groupe</div>
                <button onClick={() => setShowNewGroup(false)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t3)' }}>×</button>
              </div>
              <input placeholder="Nom du groupe..." value={groupName} onChange={e => setGroupName(e.target.value)} style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)', marginBottom: 10 }} autoFocus />
              {groupMembers.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>{groupMembers.map(m => <span key={m} style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 100, background: 'var(--tx)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>{m} <span style={{ cursor: 'pointer', opacity: .7 }} onClick={() => setGroupMembers(p => p.filter(x => x !== m))}>×</span></span>)}</div>}
              <input placeholder="Ajouter des participants..." value={groupSearch} onChange={e => setGroupSearch(e.target.value)} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-card)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)' }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid var(--border)' }}>{groupFiltered.map((c, i) => <ContactRow key={i} c={c} onClick={() => { setGroupMembers(p => [...p, c.nom]); setGroupSearch('') }} />)}</div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end', flexShrink: 0 }}>
              <button className="btn btn-sm" onClick={() => setShowNewGroup(false)}>Annuler</button>
              <button className="btn btn-primary btn-sm" disabled={!groupName.trim() || !groupMembers.length} onClick={async () => {
                const tempId = 'conv_g_' + Date.now()
                const grp = { id: tempId, nom: groupName, type: 'groupe', avatar: groupName ? groupName[0].toUpperCase() : 'G', color: '#191c1d', isGroup: true, title: groupName, participants: [...groupMembers], dernier: 'Groupe créé', time: 'Maintenant', unread: 0, msgs: [{ side: 'in', from: 'Système', text: 'Groupe créé avec ' + groupMembers.length + ' participants', time: 'Maintenant' }] }
                updateStore(prev => ({ ...prev, conversations: [grp, ...(prev.conversations || [])] }))
                setShowNewGroup(false); setActiveId(tempId); showToast && showToast('Groupe créé')
                // Résoudre les IDs backend pour les membres et persister
                const allContacts = [...(store.contacts || []), ...(store.fournisseurs || []), ...(store.users || [])]
                const participantIds = groupMembers.map(nom => {
                  const found = allContacts.find(u => (u.name || u.nom || '') === nom && (u.userId || u.id) && !String(u.userId || u.id).startsWith('u_'))
                  return found?.userId || (found?.id && !String(found.id).startsWith('u_') ? found.id : null)
                }).filter(Boolean)
                if (participantIds.length > 0 && store._token) {
                  try {
                    const { conversation } = await api.conversations.create({ participantIds, title: groupName })
                    updateStore(prev => ({
                      ...prev,
                      conversations: prev.conversations.map(c => c.id === tempId ? { ...grp, id: conversation.id, participants: conversation.participants } : c),
                    }))
                    setActiveId(conversation.id)
                  } catch (e) { console.warn('[createGroup]', e.message) }
                }
              }}>Créer le groupe</button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* MODAL: Participants */}
      {showParticipants && active && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setShowParticipants(false)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, width: 380, boxShadow: '0 20px 60px rgba(0,0,0,.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Participants ({(active.participants || []).length})</div>
              <button onClick={() => setShowParticipants(false)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--t3)' }}>×</button>
            </div>
            <div style={{ padding: '8px 0' }}>
              {(active.participants || []).map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 20px' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 16, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: 'var(--t2)', flexShrink: 0 }}>{(p || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()}</div>
                  <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{p}</div>
                  {active.isGroup && (active.participants || []).length > 2 && <button onClick={() => { updateConv(active.id, c => ({ ...c, participants: (c.participants || []).filter(x => x !== p), msgs: [...(c.msgs || []), { side: 'in', from: 'Systeme', text: p + ' retire', time: 'Maintenant' }] })); setShowParticipants(false); setTimeout(() => setShowParticipants(true), 0); showToast && showToast(p + ' retire') }} style={{ fontSize: 10, color: 'var(--err)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontWeight: 600 }}>Retirer</button>}
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
              <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => { setShowParticipants(false); setShowInvite(true); setInviteSearch('') }}>+ Ajouter</button>
              <button className="btn btn-sm" onClick={() => setShowParticipants(false)}>Fermer</button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* CONTEXT MENU (right-click on sidebar) */}
      {ctxMenu && (() => {
        const conv = allConversations.find(c => c.id === ctxMenu.convId)
        if (!conv) return null
        return createPortal(
          <div ref={ctxRef} style={{ position: 'fixed', left: ctxMenu.x, top: ctxMenu.y, zIndex: 3000, width: 200, background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 10, boxShadow: '0 10px 36px rgba(0,0,0,.14)', overflow: 'hidden', animation: 'modalIn .1s ease' }}>
            {conv._archived ? (
              <button onClick={() => { handleConvAction('unarchive', ctxMenu.convId); setCtxMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 500, color: 'var(--tx)', textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>
                Restaurer
              </button>
            ) : (
              <button onClick={() => { handleConvAction('archive', ctxMenu.convId); setCtxMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 500, color: 'var(--tx)', textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5" rx="1"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                Archiver
              </button>
            )}
            <button onClick={() => { handleConvAction('unread', ctxMenu.convId); setCtxMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 500, color: 'var(--tx)', textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3" fill="var(--t3)"/></svg>
              Marquer non lu
            </button>
            {conv.isGroup && (
              <button onClick={() => { handleConvAction('quit', ctxMenu.convId); setCtxMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 500, color: 'var(--wrn, #F59E0B)', textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Quitter le groupe
              </button>
            )}
            <div style={{ height: 1, background: 'var(--border-subtle)', margin: '2px 0' }} />
            <button onClick={() => { handleConvAction('delete', ctxMenu.convId); setCtxMenu(null) }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 500, color: 'var(--err, #EF4444)', textAlign: 'left' }} onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,.04)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
              Supprimer pour moi
            </button>
          </div>
        , document.body)
      })()}

      {/* CONFIRM MODAL */}
      {confirmAction && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 4000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .15s ease' }} onClick={() => setConfirmAction(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 380, padding: '28px 24px 22px', boxShadow: '0 24px 80px rgba(0,0,0,.18)' }} onClick={e => e.stopPropagation()}>
            {/* Icon */}
            <div style={{ width: 48, height: 48, borderRadius: 14, background: confirmAction.type === 'delete' ? 'rgba(239,68,68,.08)' : confirmAction.type === 'quit' ? 'rgba(245,158,11,.08)' : 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              {confirmAction.type === 'delete' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>}
              {confirmAction.type === 'archive' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--tx)" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5" rx="1"/><line x1="10" y1="12" x2="14" y2="12"/></svg>}
              {confirmAction.type === 'unarchive' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--tx)" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>}
              {confirmAction.type === 'quit' && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>}
            </div>
            {/* Title */}
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '-.3px', marginBottom: 8, color: 'var(--tx)' }}>
              {confirmAction.type === 'delete' && 'Supprimer la conversation'}
              {confirmAction.type === 'archive' && 'Archiver la conversation'}
              {confirmAction.type === 'unarchive' && 'Restaurer la conversation'}
              {confirmAction.type === 'quit' && 'Quitter le groupe'}
            </div>
            {/* Description */}
            <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.6, marginBottom: 22 }}>
              {confirmAction.type === 'delete' && <>La conversation avec <strong>{confirmAction.convName}</strong> sera supprimée de votre liste. Les autres participants conserveront la leur.</>}
              {confirmAction.type === 'archive' && <>La conversation avec <strong>{confirmAction.convName}</strong> sera dûplacée dans vos archives. Vous pourrez la restaurer à tout moment.</>}
              {confirmAction.type === 'unarchive' && <>La conversation avec <strong>{confirmAction.convName}</strong> sera restaurée dans votre liste principale.</>}
              {confirmAction.type === 'quit' && <>Vous quitterez le groupe <strong>{confirmAction.convName}</strong>. Vous ne recevrez plus de messages de ce groupe.</>}
            </div>
            {/* Buttons */}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-sm" onClick={() => setConfirmAction(null)} style={{ padding: '9px 18px', fontSize: 12.5 }}>Annuler</button>
              <button onClick={executeAction} style={{
                padding: '9px 18px', borderRadius: 10, border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12.5, fontWeight: 700,
                background: confirmAction.type === 'delete' ? '#EF4444' : confirmAction.type === 'quit' ? '#F59E0B' : 'var(--tx)',
                color: '#fff', transition: 'opacity .12s'
              }}
                onMouseOver={e => e.currentTarget.style.opacity = '.85'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                {confirmAction.type === 'delete' && 'Supprimer'}
                {confirmAction.type === 'archive' && 'Archiver'}
                {confirmAction.type === 'unarchive' && 'Restaurer'}
                {confirmAction.type === 'quit' && 'Quitter'}
              </button>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  )
}

