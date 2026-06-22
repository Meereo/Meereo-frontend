import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
// projectsRepository: selectors only — no seed
import { ROLES, isAllowed, getProjectRole } from '../domain/permissions'
import { computePhaseProgress } from '../domain/projectAggregates'
import { api, setInMemoryToken } from '../services/api/client'
import { getSocket, disconnectSocket, onConversationUpdated, offConversationUpdated } from '../services/socket'

// Palette de couleurs projet — sobres, premium, variées
const PROJECT_COLORS = ['#2563EB', '#7C3AED', '#0891B2', '#DC2626', '#16A34A', '#F59E0B', '#EA580C', '#6366F1', '#0F766E', '#BE185D', '#92400E', '#4338CA', '#6B7280']
const autoProjectColor = (existingProjects) => {
  const used = new Set((existingProjects || []).map(p => p.color).filter(Boolean))
  const available = PROJECT_COLORS.filter(c => !used.has(c))
  return available.length > 0 ? available[0] : PROJECT_COLORS[existingProjects.length % PROJECT_COLORS.length]
}

// Fire-and-forget API sync — doesn't block UI, tracks errors
let _syncErrors = 0
const sync = (promise) => promise.catch(e => {
  _syncErrors++
  console.warn('[MEEREO sync]', e.message)
  // After 3+ consecutive failures, the backend is likely down
  if (_syncErrors >= 3 && typeof window !== 'undefined') {
    console.error('[MEEREO] Backend inaccessible — les données sont sauvées localement.')
  }
}).then(() => { _syncErrors = 0 }) // Reset on success

// Gendered client label — adapts to civilité stored in onboardingData
function clientLabel(store) {
  const c = store.onboardingData?.civilite
  if (c === 'Madame') return 'La cliente'
  if (c === 'Monsieur') return 'Le client'
  return 'Le ou la client(e)'
}

const STORE_KEY = 'meereo_store_v2'

const defaultStore = {
  _token: null,
  _hydrated: false,
  _checking: true,   // true tant que /auth/me n'a pas répondu — jamais persisté
  _cachedUser: null, // { id, type, name } — hint de session stocké localement pour éviter le flash
  _onboardingByUser: {},
  user: null,
  users: [],
  organizations: [],
  projects: [],
  aos: [],
  offers: [],
  markets: [],
  tasks: [],
  documents: [],
  products: [],
  notifications: [],
  transactions: [],
  activities: [],
  onboardingData: null,
  clients: [],
  intervenants: [],
  contacts: [],
  commandes: [],
  fournisseurs: [],
  notes: [],
  decisions: [],
  paymentRequests: [],
  photos: [],
  taskStates: {},
  lastProjectUpdate: null,
  clientPrefs: { notifEmail: true, notifPush: true, rappels: false, resume: false },
  invitations: [],
  sellerOrders: [],
  connectedIntegrations: [],
  events: [],
  rapportStatuts: {},
  reviews: [],
  offerStatuts: {},
  marketStatuts: {},
  deletedEventIds: [],
  eventOverrides: {},
  wallets: [],
  conversations: [],
  // Finance / Fintech
  paymentOrders: [],
  ledgerEntries: [],
  payoutRequests: [],
  proofDocuments: [],
  disputeCases: [],
  commissions: [],        // { id, introductionId, structureId, structureName, projectId, clientId, montantBase, montantCommission, rate, status, createdAt, paidAt }
  introductions: [],      // { id, projectId, clientId, structureId, structureName, metier, status, introDate, retainedAt, source:'meereo_cle_en_main' }
  commissionAcceptances: [], // { userId, acceptedAt } — structures qui ont accepté les CGV commission
  // KAI
  kaiEntitlement: {
    pro: { tier: 'standard', quotaLimit: 25, quotaUsed: 0, goldStartDate: null, goldEndDate: null },
    client: { tier: 'standard', quotaLimit: 25, quotaUsed: 0, goldStartDate: null, goldEndDate: null },
    fournisseur: { tier: 'standard', quotaLimit: 25, quotaUsed: 0, goldStartDate: null, goldEndDate: null },
  },
  kaiOnboardingDone: { pro: false, client: false, fournisseur: false },
  kaiUsage: [],
  kaiConversations: [],
  kaiMemory: [],
  projectInvitations: [],
  clotureRequests: [],
  entrepriseDocs: [],
  aoInvitations: [], // { id, aoId, senderUserId, targetUserId?, targetEmail?, targetPhone?, targetName?, targetTrade, message?, status: sent|opened|signed_up|responded, createdAt }
  // ═══ MULTI-ACTEURS V2 ═══
  projectMembers: [], // { id, projectId, userId, role, joinedAt } — membership formel projet
  _projectsSeeded: false,
}

// ─── Clés autorisées à être persistées dans localStorage ────────────────────
// RÈGLE DE SÉCURITÉ : seules ces clés survivent à un rechargement de page.
// Toute donnée métier (projects, aos, offers, tasks, contacts…) est EXCLUE —
// elle est refetchée depuis l'API au login/montage. En cas de XSS, l'attaquant
// ne peut récupérer ni les données utilisateurs ni les données de projet.
const PERSIST_KEYS = new Set([
  // SUPPRIMÉ : '_token' — le JWT n'est plus persisté dans localStorage.
  // Il vit dans sessionStorage (écrit par setInMemoryToken) + cookie httpOnly.
  // Un XSS ne peut pas l'extraire via localStorage.
  '_hydrated',           // flag de session — évite un double-fetch au montage
  '_cachedUser',         // hint minimal { id, type, name } pour éviter le flash de redirection
  '_onboardingByUser',   // wizard avant création compte (userId temp → data) — nécessaire car pas encore en BD
  // Acceptations légales
  'commissionAcceptances',
  // Note : onboardingData, clientPrefs, KAI sont en PostgreSQL et rechargés à chaque session.
])

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        console.warn('MEEREO: store corrompu, reset')
        localStorage.removeItem(STORE_KEY)
        return { ...defaultStore }
      }
      // Sécurité : on ne restaure QUE les clés de la liste blanche (PERSIST_KEYS).
      // Tout le reste (projets, aos, tasks…) sera refetché depuis l'API à
      // l'hydratation. Cela évite d'exposer des données métier en cas de XSS.
      const merged = { ...defaultStore }
      Object.keys(parsed).forEach(k => {
        if (PERSIST_KEYS.has(k) && merged.hasOwnProperty(k)) merged[k] = parsed[k]
      })
      return merged
    }
  } catch (e) {
    console.warn('MEEREO loadStore error — reset', e)
    localStorage.removeItem(STORE_KEY)
  }
  return { ...defaultStore }
}

function saveToStorage(store) {
  try {
    const toSave = {}
    for (const key of PERSIST_KEYS) {
      if (store[key] !== undefined) toSave[key] = store[key]
    }
    localStorage.setItem(STORE_KEY, JSON.stringify(toSave))
  } catch (e) {
    console.error('[MEEREO] saveToStorage CRASHED:', e.message)
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ _onboardingByUser: store._onboardingByUser || {} })) } catch { /* rien à faire */ }
  }
}

// Merge two arrays by ID — API data (source of truth) overrides local data
function mergeById(localArr, apiArr) {
  const map = new Map()
  ;(localArr || []).forEach(item => { if (item && item.id) map.set(item.id, item) })
  ;(apiArr || []).forEach(item => { if (item && item.id) map.set(item.id, { ...map.get(item.id), ...item }) })
  return Array.from(map.values())
}

const MeereoContext = createContext(null)

/**
 * Transforme le tableau d'entitlements retourné par GET /api/kai/entitlements
 * en les 3 clés du store : kaiEntitlement, kaiOnboardingDone.
 * Accepte aussi conversations + memory pour construire kaiConversations/kaiMemory.
 */
function buildKaiState(entitlements = [], conversations = [], memory = []) {
  const entObj = {
    pro: { tier: 'standard', quotaLimit: 25, quotaUsed: 0, goldStartDate: null, goldEndDate: null },
    client: { tier: 'standard', quotaLimit: 25, quotaUsed: 0, goldStartDate: null, goldEndDate: null },
    fournisseur: { tier: 'standard', quotaLimit: 25, quotaUsed: 0, goldStartDate: null, goldEndDate: null },
  }
  const onboardingDone = { pro: false, client: false, fournisseur: false }
  for (const e of entitlements) {
    if (!['pro', 'client', 'fournisseur'].includes(e.role)) continue
    entObj[e.role] = {
      tier: e.tier || 'standard',
      quotaLimit: e.quotaLimit ?? 25,
      quotaUsed: e.quotaUsed ?? 0,
      goldStartDate: e.goldStartDate || null,
      goldEndDate: e.goldEndDate || null,
    }
    onboardingDone[e.role] = e.onboardingDone ?? false
  }
  return {
    kaiEntitlement: entObj,
    kaiOnboardingDone: onboardingDone,
    kaiConversations: conversations,
    kaiMemory: memory,
  }
}

export function MeereoProvider({ children }) {
  const [store, setStore] = useState(loadFromStorage)
  const [toasts, setToasts] = useState([])
  const [notifOpen, setNotifOpen] = useState(false)

  // Ref for current store — avoids stale closures in sync() calls
  const storeRef = useRef(store)
  useEffect(() => { storeRef.current = store }, [store])

  const justCreated = useRef(false)
  const hydrationDone = useRef(false)

  // ═══ BOOT HYDRATION — PostgreSQL is the source of truth ═══
  // On app load: always verify session via /auth/me (cookie httpOnly),
  // then load all business data from API.
  useEffect(() => {
    if (hydrationDone.current) return
    hydrationDone.current = true

    ;(async () => {
      try {
        // 1. Verify session via cookie — token is refreshed from the response
        const me = await api.auth.me()
        if (!me || !me.id) throw new Error('Invalid session')

        // Restaurer le token en mémoire (utilisé par Bearer pour WS/API)
        if (me.token) setInMemoryToken(me.token)

        const user = {
          id: me.id, email: me.email, name: me.name, type: me.type,
          company: me.company || '', phone: me.phone || '', avatar: me.avatar || '',
          publicId: me.publicId || null,
          wallet: 0,
        }

        // 2. Fetch business data from PostgreSQL (source of truth)
        const [apiAos, apiOffers, apiProjects, apiMarkets, apiDocuments, apiProjectMembers, apiFournisseurs, apiContacts, apiKaiEnt, apiKaiConvs, apiKaiMem, apiPrefs, apiOnboarding] = await Promise.all([
          api.aos.getAll().catch(() => []),
          api.offers.getAll().catch(() => []),
          api.projects.getAll().catch(() => []),
          api.markets.getAll().catch(() => []),
          api.documents.getAll().catch(() => []),
          api.projectMembers.getAll().catch(() => []),
          api.usersApi.getFournisseurs().catch(() => []),
          api.contacts.getAll().catch(() => []),
          api.kai.getEntitlements().catch(() => []),
          api.kai.getConversations().catch(() => []),
          api.kai.getMemory().catch(() => []),
          api.usersApi.getPrefs().catch(() => ({})),
          api.usersApi.getOnboardingData().catch(() => ({})),
        ])

        // 3. PostgreSQL is source of truth — replace business data entirely
        // Local-only items (ao_xxx IDs) are discarded; backend data wins
        setStore(prev => {
          const apiClients = apiContacts.filter(c => c.type === 'client')
          const apiIntervenants = apiContacts.filter(c => c.type === 'intervenant')
          const next = {
            ...prev,
            _hydrated: true,
            _checking: false,
            _cachedUser: { id: user.id, type: user.type, name: user.name },
            user,
            users: mergeById(prev.users || [], [user]),
            // Business data: backend replaces local (no merge to avoid ghost duplicates)
            aos: apiAos,
            offers: apiOffers,
            projects: apiProjects,
            markets: apiMarkets,
            documents: apiDocuments,
            projectMembers: apiProjectMembers,
            fournisseurs: apiFournisseurs,
            contacts: apiContacts,
            clients: apiClients,
            intervenants: apiIntervenants,
            // KAI — depuis la base
            ...buildKaiState(apiKaiEnt, apiKaiConvs, apiKaiMem),
            // Préférences utilisateur
            clientPrefs: { notifEmail: true, notifPush: true, rappels: false, resume: false, ...(apiPrefs || {}) },
            // Acceptations CGV commission — depuis les préférences en DB
            commissionAcceptances: Array.isArray(apiPrefs?.commissionAcceptances)
              ? apiPrefs.commissionAcceptances
              : (prev.commissionAcceptances || []),
            // Token en mémoire (utilisé pour Bearer/Socket — pas en localStorage)
            _token: me.token || prev._token,
            // Données d'onboarding — BD prioritaire, localStorage en fallback si BD vide
            onboardingData: Object.keys(apiOnboarding || {}).length > 0
              ? apiOnboarding
              : (prev._onboardingByUser?.[user.id] || prev.onboardingData || {}),
          }
          saveToStorage(next)
          return next
        })
        console.log('[MEEREO] Hydration complete — user:', me.email, '— AOs:', apiAos.length, '— projects:', apiProjects.length)
      } catch (e) {
        console.warn('[MEEREO] Session expired or backend down:', e.message)
        // Si l'utilisateur vient de s'inscrire, le cookie peut ne pas encore être
        // reconnu par /auth/me (appelé avant la fin du register). Ne pas effacer
        // la session fraîchement créée.
        if (justCreated.current) {
          setStore(prev => { const next = { ...prev, _hydrated: true, _checking: false }; saveToStorage(next); return next })
          return
        }
        // Cookie invalid / réseau down → vider la session
        setInMemoryToken(null)
        setStore(prev => { const next = { ...prev, _hydrated: true, _checking: false, _cachedUser: null, user: null, _token: null }; saveToStorage(next); return next })
      }
    })()
  }, []) // Run once on mount — no deps needed

  // ═══ SOCKET.IO — connexion automatique dès qu'un token est disponible ═══
  useEffect(() => {
    const token = store._token
    if (!token) {
      disconnectSocket()
      return
    }
    // Initialiser le socket avec le token courant
    const socket = getSocket(token)

    // Écouter les mises à jour de conversation émises par d'autres utilisateurs
    const handleConvUpdated = ({ conversationId, lastMessage }) => {
      setStore(prev => {
        const convs = prev.conversations || []
        const exists = convs.some(c => c.id === conversationId)
        if (!exists) {
          // Nouvelle conversation reçue → re-fetcher la liste complète
          api.conversations.getAll().then(res => {
            const list = Array.isArray(res) ? res : (res?.conversations || [])
            setStore(p => {
              const next = { ...p, conversations: list.length ? list : p.conversations }
              saveToStorage(next)
              return next
            })
          }).catch(() => {})
          return prev
        }
        const next = {
          ...prev,
          conversations: convs.map(c =>
            c.id === conversationId
              ? { ...c, lastMessage, updatedAt: lastMessage?.createdAt || c.updatedAt }
              : c
          ),
        }
        saveToStorage(next)
        return next
      })
    }

    socket.on('conversation:updated', handleConvUpdated)

    // Charger les conversations depuis l'API au premier login
    if (!store.conversations || store.conversations.length === 0) {
      api.conversations.getAll().then(res => {
        const list = Array.isArray(res) ? res : (res?.conversations || [])
        if (list.length > 0) {
          setStore(prev => {
            const next = { ...prev, conversations: list }
            saveToStorage(next)
            return next
          })
        }
      }).catch(() => {})
    }

    return () => {
      socket.off('conversation:updated', handleConvUpdated)
      // En dev (React Strict Mode), le cleanup + remount crée 2 sockets simultanés.
      // On déconnecte proprement ici pour éviter "WebSocket closed before established".
      // En prod ce cleanup ne s'exécute qu'au logout ou au changement de token.
      socket.disconnect()
    }
  }, [store._token]) // eslint-disable-line react-hooks/exhaustive-deps

  // ═══ BACKGROUND SYNC — refetch business data every 30s ═══
  // Ensures pro sees AO closed / offer accepted without manual refresh
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentStore = storeRef.current
      if (!currentStore.user) return
      try {
        const [apiAos, apiOffers, apiMarkets, apiProjects, apiDocuments, apiConversations, apiMembers] = await Promise.all([
          api.aos.getAll().catch(() => null),
          api.offers.getAll().catch(() => null),
          api.markets.getAll().catch(() => null),
          api.projects.getAll().catch(() => null),
          api.documents.getAll().catch(() => null),
          api.conversations.getAll().catch(() => null),
          api.projectMembers.getAll().catch(() => null),
        ])
        if (!apiAos) return // Backend unreachable, skip
        setStore(prev => {
          // Merge conversations: keep local ones not yet synced, add backend ones
          let mergedConvs = prev.conversations || []
          const convList = Array.isArray(apiConversations) ? apiConversations : (apiConversations?.conversations || null)
          if (convList) {
            const backendIds = new Set(convList.map(c => c.id))
            const localOnly = mergedConvs.filter(c => !backendIds.has(c.id) && String(c.id).startsWith('conv_'))
            mergedConvs = [...convList, ...localOnly]
          }
          const next = {
            ...prev,
            aos: apiAos,
            offers: apiOffers || prev.offers,
            markets: apiMarkets || prev.markets,
            projects: apiProjects || prev.projects,
            documents: apiDocuments || prev.documents,
            projectMembers: apiMembers || prev.projectMembers,
            conversations: mergedConvs,
          }
          saveToStorage(next)
          return next
        })

        // ── Sync local-only AOs (created while server was down) ──────────────
        // IDs starting with 'ao_' were generated offline; push them to the backend now.
        const localAOs = (storeRef.current.aos || []).filter(a => String(a.id).startsWith('ao_'))
        for (const localAO of localAOs) {
          try {
            const backendAO = await api.aos.create({
              title: localAO.title,
              description: localAO.description || '',
              budget: localAO.budget || '',
              lot: localAO.lot || '',
              requestedTrade: localAO.requestedTrade || '',
              visibilityScope: localAO.visibilityScope || 'public',
              projectId: localAO.projectId || null,
              createdByClient: localAO.createdByClient || false,
              autoGenerated: localAO.autoGenerated || false,
            })
            // Replace temp ID with real backend ID
            setStore(prev => {
              const next = {
                ...prev,
                aos: prev.aos.map(a =>
                  a.id === localAO.id
                    ? { ...a, id: backendAO.id, status: backendAO.status || a.status, createdAt: backendAO.createdAt || a.createdAt }
                    : a
                ),
              }
              saveToStorage(next)
              return next
            })
          } catch (_) { /* server rejected or still down — retry next tick */ }
        }
      } catch { /* silent */ }
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  const updateStore = useCallback((updater) => {
    setStore(prev => {
      const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater }
      saveToStorage(next)
      return next
    })
  }, [])

  const showToast = useCallback((msg, color) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, msg, color: color || 'info' }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3200)
  }, [])

  const log = useCallback((action, data) => {
    updateStore(prev => {
      const activities = [
        {
          id: Date.now(), action, data: data || null,
          userId: prev.user?.id || null,
          userType: prev.user?.type || null,
          userName: prev.user?.name || null,
          ts: new Date().toISOString(),
        },
        ...prev.activities
      ].slice(0, 200)
      return { ...prev, activities }
    })
    sync(api.activities.create({ action, data: data || null, userId: storeRef.current.user?.id || null }))
  }, [updateStore])

  const addNotif = useCallback((msg, type, link, page) => {
    updateStore(prev => {
      const role = prev.user?.type || null
      const notifications = [
        { id: Date.now(), msg, type: type || 'info', link: link || null, page: page || null, read: false, ts: new Date().toISOString(), role },
        ...prev.notifications
      ].slice(0, 50)
      return { ...prev, notifications }
    })
    sync(api.notifications.create({ msg, type: type || 'info', role: storeRef.current.user?.type || null, userId: storeRef.current.user?.id || null }))
  }, [updateStore])

  const markNotifRead = useCallback((notifId) => {
    updateStore(prev => ({
      ...prev,
      notifications: (prev.notifications || []).map(n => n.id === notifId ? { ...n, read: true } : n)
    }))
  }, [updateStore])

  const markNotifsRead = useCallback(() => {
    updateStore(prev => {
      const role = prev.user?.type
      return {
        ...prev,
        notifications: (prev.notifications || []).map(n => (!n.role || n.role === role) ? { ...n, read: true } : n)
      }
    })
  }, [updateStore])

  const createUser = useCallback(async (data) => {
    justCreated.current = true // Skip boot hydration for fresh accounts
    const user = {
      id: 'u_' + Date.now(),
      type: data.type || 'pro',
      name: data.name || data.nom || '',
      company: data.company || data.entreprise || data.societe || '',
      email: data.email || '',
      phone: data.phone || data.tel || '',
      avatar: data.avatar || '',
      wallet: 0,
      createdAt: new Date().toISOString()
    }
    // Build onboardingData — keep only serializable, reasonably-sized fields
    const obData = {}
    // Text/number fields — safe to serialize
    const textKeys = ['userType','prenom','nom','civilite','entreprise','metier','ville','annee','rccm','ncc',
      'email','emailPro','tel','telPro','slogan','bio','projetsN','effectif','pays',
      'situation','projectType','location','surface','budget','description','architecteEmail',
      'delaiLivraison','logoColor','logoShape','logoTypo','bannerPosition','emailVerified']
    textKeys.forEach(k => { if (data[k] !== undefined && data[k] !== null) obData[k] = data[k] })
    // String arrays — safe
    if (Array.isArray(data.secteurs)) obData.secteurs = data.secteurs
    if (Array.isArray(data.services)) obData.services = data.services
    if (Array.isArray(data.zones)) obData.zones = data.zones
    if (Array.isArray(data.categories)) obData.categories = data.categories
    // Image URLs — keep base64 up to 2MB, always keep MinIO URLs
    const safeImg = (v) => {
      if (!v || typeof v !== 'string') return ''
      if (!v.startsWith('data:')) return v // MinIO URL — always keep
      if (v.length < 2500000) return v // base64 up to ~2MB — keep
      // Too large — attempt to reduce quality by truncating (better than silent discard)
      console.warn('[MEEREO] Image trop volumineuse (' + Math.round(v.length / 1024) + 'Ko) — conservée avec avertissement')
      return v.length < 5000000 ? v : '' // Hard limit 5MB, else discard
    }
    obData.photoUrl = safeImg(data.photoUrl)
    obData.logoFileUrl = safeImg(data.logoFileUrl)
    obData.coverUrl = safeImg(data.coverUrl)
    obData.bannerUrl = safeImg(data.bannerUrl)
    // Team — keep small photos
    if (data.team) obData.cockpitTeam = data.team.map(m => ({ nom: m.nom || m.name || '', role: m.role || '', photoUrl: safeImg(m.photoUrl) }))
    // Portfolio — keep small images
    if (data.portfolio) obData.portfolio = data.portfolio.map(p => ({ img: safeImg(p.img), cap: p.cap || '', feat: p.feat || false })).filter(p => p.img)
    else if (data.portfolioFiles) obData.portfolio = (data.portfolioFiles || []).filter(u => typeof u === 'string').map((url, i) => ({ img: safeImg(url), cap: 'Réalisation ' + (i+1), feat: i === 0 })).filter(p => p.img)
    // Products — keep small photos
    if (data.products) obData.products = data.products.map(p => ({ name: p.name, price: p.price, unit: p.unit, category: p.category, photoUrl: safeImg(p.photoUrl) }))

    updateStore(prev => {
      const exists = prev.users.find(u => u && u.email === user.email)
      // Save previous user's onboardingData before switching
      const savedObs = { ...(prev._onboardingByUser || {}) }
      if (prev.user?.id && prev.onboardingData) {
        savedObs[prev.user.id] = prev.onboardingData
      }
      return {
        ...prev,
        user,
        users: exists ? prev.users : [...prev.users, user],
        // Save onboarding data IN THE SAME atomic update
        onboardingData: obData,
        _onboardingByUser: savedObs,
        // Reset KAI pour un nouveau compte (entitlements créés côté backend à la 1ère requête)
        ...buildKaiState([], [], []),
        // Reset user-specific data only (messages, notifications, personal events)
        notifications: [],
        activities: [],
        messages: [],
        conversations: [],
        // PRESERVE cross-user shared business data:
        // aos, offers, markets, projects, tasks, documents, decisions,
        // transactions, commandes, events, sellerOrders
        // → These are public/shared entities that must survive user switches
      }
    })
    // Register on backend to get a JWT token (blocking — must complete before redirect)
    // Use the actual password entered by user in onboarding form, fallback to user.id for legacy
    const userPassword = data.password || user.id
    // Champs texte/tableau sûrs à envoyer (pas d'images volumineuses)
    const safeImgUrl = (v) => (v && typeof v === 'string' && !v.startsWith('data:')) ? v : undefined
    try {
      const res = await api.auth.register({
        email: user.email || 'user_' + user.id + '@meereo.ci',
        password: userPassword,
        name: user.name,
        type: user.type,
        // Champs de base
        ...(user.company    ? { company: user.company }    : {}),
        ...(user.phone      ? { phone: user.phone }        : {}),
        ...(data.ville      ? { ville: data.ville }        : {}),
        ...(data.pays       ? { pays: data.pays }          : {}),
        // Profil étendu — texte + tableaux (envoyés pour initialiser proProfile ET onboardingData)
        ...(data.metier     ? { metier: data.metier }      : data.secteurs?.[0] ? { metier: data.secteurs[0] } : {}),
        ...(obData.entreprise ? { entreprise: obData.entreprise } : {}),
        ...(obData.rccm       ? { rccm: obData.rccm }             : {}),
        ...(obData.ncc        ? { ncc: obData.ncc }               : {}),
        ...(obData.annee      ? { annee: obData.annee }           : {}),
        ...(obData.slogan     ? { slogan: obData.slogan }         : {}),
        ...(obData.bio        ? { bio: obData.bio }               : {}),
        ...(obData.projetsN   ? { projetsN: obData.projetsN }     : {}),
        ...(obData.effectif   ? { effectif: obData.effectif }     : {}),
        ...(obData.tel || obData.telPro ? { tel: obData.tel || obData.telPro } : {}),
        ...(obData.logoColor  ? { logoColor: obData.logoColor }   : {}),
        ...(obData.logoShape  ? { logoShape: obData.logoShape }   : {}),
        ...(obData.logoTypo   ? { logoTypo: obData.logoTypo }     : {}),
        ...(obData.secteurs?.length   ? { secteurs: obData.secteurs }   : {}),
        ...(obData.services?.length   ? { services: obData.services }   : {}),
        ...(obData.zones?.length      ? { zones: obData.zones }         : {}),
        ...(obData.categories?.length ? { categories: obData.categories } : {}),
        // Images : uniquement les URLs MinIO (pas de base64 > quelques Ko dans register)
        ...(safeImgUrl(obData.logoFileUrl)  ? { logoFileUrl: obData.logoFileUrl }   : {}),
        ...(safeImgUrl(obData.photoUrl)     ? { photoUrl: obData.photoUrl }         : {}),
        ...(safeImgUrl(obData.coverUrl)     ? { coverUrl: obData.coverUrl }         : {}),
      })
      if (res?.token) {
        // Store token + hydrate ALL shared business data from PostgreSQL (même logique que loginUser)
        const [apiAos, apiOffers, apiProjects, apiMarkets, apiProjectMembers, apiFournisseurs, apiContacts, apiKaiEnt, apiKaiConvs, apiKaiMem, apiPrefs] = await Promise.all([
          api.aos.getAll().catch(() => []),
          api.offers.getAll().catch(() => []),
          api.projects.getAll().catch(() => []),
          api.markets.getAll().catch(() => []),
          api.projectMembers.getAll().catch(() => []),
          api.usersApi.getFournisseurs().catch(() => []),
          api.contacts.getAll().catch(() => []),
          api.kai.getEntitlements().catch(() => []),
          api.kai.getConversations().catch(() => []),
          api.kai.getMemory().catch(() => []),
          api.usersApi.getPrefs().catch(() => ({})),
        ])
        // Update user with real backend ID so _onboardingByUser is keyed correctly
        const realUser = {
          ...user,
          id: res.user?.id || user.id,
          name: res.user?.name || user.name,
          type: res.user?.type || user.type,
          company: res.user?.company || user.company,
        }
        // Écriture synchrone du token en mémoire
        setInMemoryToken(res.token)
        storeRef.current = { ...storeRef.current, user: realUser, _token: res.token }
        updateStore(prev => {
          // Re-key _onboardingByUser from temp ID to real backend ID
          const updatedObs = { ...(prev._onboardingByUser || {}) }
          if (res.user?.id && user.id !== res.user.id) {
            if (prev.onboardingData) updatedObs[res.user.id] = prev.onboardingData
            delete updatedObs[user.id]
          }
          return {
            ...prev,
            user: realUser,
            users: mergeById(prev.users || [], [realUser]),
            _onboardingByUser: updatedObs,
            _token: res.token,
            _hydrated: true,
            _checking: false,
            _cachedUser: { id: realUser.id, type: realUser.type, name: realUser.name },
            aos: apiAos,
            offers: apiOffers,
            projects: apiProjects,
            markets: apiMarkets,
            projectMembers: apiProjectMembers,
            fournisseurs: apiFournisseurs,
            contacts: apiContacts,
            clients: apiContacts.filter(c => c.type === 'client'),
            intervenants: apiContacts.filter(c => c.type === 'intervenant'),
            ...buildKaiState(apiKaiEnt, apiKaiConvs, apiKaiMem),
            clientPrefs: { notifEmail: true, notifPush: true, rappels: false, resume: false, ...(apiPrefs || {}) },
            // onboardingData : garder ce qui a été saisi dans le wizard (pas encore en BD)
            onboardingData: prev.onboardingData || obData,
          }
        })
        // Persister onboardingData en BD maintenant que le compte existe
        if (obData && Object.keys(obData).length > 0) {
          api.usersApi.updateOnboardingData(obData).catch(() => {})
        }
      }
    } catch (e) {
      // Register failed (409 = email exists) → try login instead
      console.warn('[MEEREO] Register failed:', e.message, '— trying login')
      try {
        const loginRes = await api.auth.login({ email: user.email, password: userPassword })
        if (loginRes?.token) {
          // Update user ID with the real backend ID
          const realUser = {
            ...user,
            id: loginRes.user.id,
            name: loginRes.user.name || user.name,
            type: loginRes.user.type || user.type,
            company: loginRes.user.company || user.company,
          }
          const [apiAos, apiOffers, apiProjects, apiMarkets, apiProjectMembers, apiFournisseurs, apiContacts, apiKaiEnt, apiKaiConvs, apiKaiMem, apiPrefs] = await Promise.all([
            api.aos.getAll().catch(() => []),
            api.offers.getAll().catch(() => []),
            api.projects.getAll().catch(() => []),
            api.markets.getAll().catch(() => []),
            api.projectMembers.getAll().catch(() => []),
            api.usersApi.getFournisseurs().catch(() => []),
            api.contacts.getAll().catch(() => []),
            api.kai.getEntitlements().catch(() => []),
            api.kai.getConversations().catch(() => []),
            api.kai.getMemory().catch(() => []),
            api.usersApi.getPrefs().catch(() => ({})),
          ])
          // Écriture synchrone du token en mémoire (login fallback)
          setInMemoryToken(loginRes.token)
          storeRef.current = { ...storeRef.current, user: realUser, _token: loginRes.token }
          updateStore(prev => {
            // Re-key _onboardingByUser from temp ID to real backend ID
            const updatedObs = { ...(prev._onboardingByUser || {}) }
            if (loginRes.user?.id && user.id !== loginRes.user.id) {
              if (prev.onboardingData) updatedObs[loginRes.user.id] = prev.onboardingData
              delete updatedObs[user.id]
            }
            return {
              ...prev,
              user: realUser,
              users: mergeById(prev.users || [], [realUser]),
              _onboardingByUser: updatedObs,
              _token: loginRes.token,
              _hydrated: true,
              _checking: false,
              _cachedUser: { id: realUser.id, type: realUser.type, name: realUser.name },
              aos: apiAos,
              offers: apiOffers,
              projects: apiProjects,
              markets: apiMarkets,
              projectMembers: apiProjectMembers,
              fournisseurs: apiFournisseurs,
              contacts: apiContacts,
              clients: apiContacts.filter(c => c.type === 'client'),
              intervenants: apiContacts.filter(c => c.type === 'intervenant'),
              ...buildKaiState(apiKaiEnt, apiKaiConvs, apiKaiMem),
              clientPrefs: { notifEmail: true, notifPush: true, rappels: false, resume: false, ...(apiPrefs || {}) },
              onboardingData: prev.onboardingData || obData,
            }
          })
        }
      } catch (loginErr) {
        // 409 = email existe avec un autre mot de passe → erreur bloquante
        if (e.status === 409 && (loginErr.status === 401 || loginErr.status === 422)) {
          // Retirer l'utilisateur local fantôme qu'on vient d'ajouter
          updateStore(prev => ({
            ...prev,
            user: null,
            users: (prev.users || []).filter(u => u.id !== user.id),
            onboardingData: null,
          }))
          throw new Error('Un compte existe déjà avec cet email. Connectez-vous ou réinitialisez votre mot de passe.')
        }
        console.warn('[MEEREO] Login fallback also failed:', loginErr.message)
      }
    }
    log('USER_CREATED', { name: user.name, type: user.type })
    addNotif('Bienvenue sur MEEREO, ' + (user.name || user.company) + '\u00a0!', 'green', null, 'dashboard')
    return user
  }, [updateStore, log, addNotif])

  // ═══ LOGIN — API-first, PostgreSQL is source of truth ═══
  // Returns: { user object } on success, or throws Error with user-facing message
  const loginUser = useCallback(async (email, password) => {
    // 1. API-first: always try backend authentication
    try {
      const res = await api.auth.login({ email, password })
      if (res?.user && res?.token) {
        const backendUser = {
          id: res.user.id,
          type: res.user.type || 'pro',
          name: res.user.name || '',
          company: res.user.company || '',
          email: res.user.email || email,
          phone: res.user.phone || '',
          avatar: res.user.avatar || '',
          wallet: 0,
        }
        // 2. Hydrate business data from PostgreSQL
        const [apiAos, apiOffers, apiProjects, apiMarkets, apiProjectMembers, apiFournisseurs, apiContacts, apiKaiEnt, apiKaiConvs, apiKaiMem, apiPrefs, apiOnboarding] = await Promise.all([
          api.aos.getAll().catch(() => []),
          api.offers.getAll().catch(() => []),
          api.projects.getAll().catch(() => []),
          api.markets.getAll().catch(() => []),
          api.projectMembers.getAll().catch(() => []),
          api.usersApi.getFournisseurs().catch(() => []),
          api.contacts.getAll().catch(() => []),
          api.kai.getEntitlements().catch(() => []),
          api.kai.getConversations().catch(() => []),
          api.kai.getMemory().catch(() => []),
          api.usersApi.getPrefs().catch(() => ({})),
          api.usersApi.getOnboardingData().catch(() => ({})),
        ])
        // 3. Update store with API data + token + restore per-user onboardingData
        updateStore(prev => {
          // Save current user's onboardingData before switching
          const savedObs = { ...(prev._onboardingByUser || {}) }
          if (prev.user?.id && prev.onboardingData) {
            savedObs[prev.user.id] = prev.onboardingData
          }
          // Restore onboardingData for the logging-in user ONLY — never inherit another user's data
          // Also search by email as fallback for sessions with old temp-keyed OB data
          const restoredOb = savedObs[backendUser.id]
            || Object.values(savedObs).find(ob => ob && (ob.email === backendUser.email || ob.emailPro === backendUser.email))
            || null
          // If found by email, migrate the key to the real backend ID
          if (!savedObs[backendUser.id] && restoredOb) {
            savedObs[backendUser.id] = restoredOb
            // Remove old temp-keyed entry
            for (const k of Object.keys(savedObs)) {
              if (k !== backendUser.id && savedObs[k] === restoredOb) delete savedObs[k]
            }
          }
          return {
            ...prev,
            user: backendUser,
            users: mergeById(prev.users || [], [backendUser]),
            _token: res.token,
            _hydrated: true,
            _cachedUser: { id: backendUser.id, type: backendUser.type, name: backendUser.name },
            _onboardingByUser: savedObs,
            onboardingData: restoredOb,
            // Business data: backend replaces local (source of truth)
            aos: apiAos,
            offers: apiOffers,
            projects: apiProjects,
            markets: apiMarkets,
            projectMembers: apiProjectMembers,
            fournisseurs: apiFournisseurs,
            contacts: apiContacts,
            clients: apiContacts.filter(c => c.type === 'client'),
            intervenants: apiContacts.filter(c => c.type === 'intervenant'),
            // KAI — depuis la base
            ...buildKaiState(apiKaiEnt, apiKaiConvs, apiKaiMem),
            // Préférences utilisateur
            clientPrefs: { notifEmail: true, notifPush: true, rappels: false, resume: false, ...(apiPrefs || {}) },
            // Données d'onboarding — BD prioritaire, localStorage en fallback si BD vide
            onboardingData: Object.keys(apiOnboarding || {}).length > 0
              ? apiOnboarding
              : (prev._onboardingByUser?.[backendUser.id] || prev.onboardingData || {}),
          }
        })
        log('USER_LOGIN', { email, source: 'api' })
        return backendUser
      }
    } catch (e) {
      const msg = e.message || ''
      const status = e.status || 0

      // Compte supprimé — erreur définitive, ne pas chercher en local
      if (msg.includes('supprimé')) throw new Error('Ce compte a été supprimé')

      // 401 depuis le backend : email introuvable OU mauvais mot de passe
      // On distingue grâce au compte local :
      //   • Pas de compte local → email inconnu → "Aucun compte trouvé" (return null)
      //   • Compte local trouvé → il a été créé offline, on le migre vers PostgreSQL
      if (status === 401 || msg.includes('Mot de passe incorrect') || msg.includes('Email ou mot de passe')) {
        let localUser = null
        updateStore(prev => {
          localUser = (prev.users || []).find(
            u => u && (u.email || '').toLowerCase() === email.toLowerCase() && u.email !== ''
          ) || null
          return prev
        })

        if (!localUser) {
          // L'email n'existe vraiment nulle part → message clair
          return null
        }

        // Compte trouvé en local mais pas encore dans PostgreSQL
        // Tentative de migration : on l'enregistre côté backend avec le mot de passe fourni
        console.info('[LOGIN] Compte local détecté — migration vers PostgreSQL…')
        try {
          const ob = (() => {
            let d = null
            updateStore(prev => {
              d = prev._onboardingByUser?.[localUser.id] || prev.onboardingData || null
              return prev
            })
            return d
          })()

          const migrateRes = await api.auth.register({
            email: localUser.email,
            password,
            name: localUser.name || localUser.company || 'Utilisateur',
            type: localUser.type || 'pro',
            company: localUser.company || null,
            phone: localUser.phone || ob?.tel || null,
            metier: ob?.metier || ob?.secteurs?.[0] || null,
            ville: localUser.ville || ob?.ville || null,
            // Profil complet selon le type
            ...(ob || {}),
          })

          if (migrateRes?.user && migrateRes?.token) {
            // Migration réussie — mettre à jour le store avec le vrai ID backend
            const migratedUser = {
              id: migrateRes.user.id,
              type: migrateRes.user.type || localUser.type,
              name: migrateRes.user.name || localUser.name,
              company: migrateRes.user.company || localUser.company || '',
              email: migrateRes.user.email,
              phone: migrateRes.user.phone || localUser.phone || '',
              avatar: migrateRes.user.avatar || localUser.avatar || '',
              wallet: 0,
            }
            updateStore(prev => {
              const savedObs = { ...(prev._onboardingByUser || {}) }
              const ob = prev.onboardingData || savedObs[localUser.id] || null
              if (ob) savedObs[migratedUser.id] = ob
              delete savedObs[localUser.id]
              return {
                ...prev,
                user: migratedUser,
                users: mergeById(prev.users || [], [migratedUser]),
                _token: migrateRes.token,
                _hydrated: true,
                _onboardingByUser: savedObs,
                onboardingData: ob,
              }
            })
            log('USER_LOGIN', { email, source: 'migrated' })
            return migratedUser
          }
        } catch (regErr) {
          // 409 = email déjà en base avec un autre mot de passe → mauvais mot de passe
          if (regErr.status === 409) {
            throw new Error('Mot de passe incorrect')
          }
          // Autre erreur de migration — laisser passer au fallback local
          console.warn('[LOGIN] Migration échouée :', regErr.message)
        }

        // Fallback ultime : connecter avec le compte local (mode dégradé / offline)
        updateStore(prev => {
          const savedObs = { ...(prev._onboardingByUser || {}) }
          if (prev.user?.id && prev.onboardingData) savedObs[prev.user.id] = prev.onboardingData
          return { ...prev, user: localUser, onboardingData: savedObs[localUser.id] || null, _onboardingByUser: savedObs }
        })
        log('USER_LOGIN', { email, source: 'local_fallback' })
        return localUser
      }

      // Erreur réseau (serveur inaccessible) — fallback local
      console.warn('[LOGIN] Backend inaccessible, fallback local :', msg)
    }

    // 4. Fallback réseau : chercher en local si le serveur est down
    let found = null
    updateStore(prev => {
      found = (prev.users || []).find(
        u => u && (u.email || '').toLowerCase() === email.toLowerCase() && u.status !== 'deleted' && u.email !== ''
      ) || null
      if (found) {
        const savedObs = { ...(prev._onboardingByUser || {}) }
        if (prev.user?.id && prev.onboardingData) savedObs[prev.user.id] = prev.onboardingData
        return { ...prev, user: found, onboardingData: savedObs[found.id] || null, _onboardingByUser: savedObs }
      }
      return prev
    })
    if (found) {
      log('USER_LOGIN', { email, source: 'local' })
      return found
    }
    // 5. Introuvable partout
    return null
  }, [updateStore, log])

  // ── Organisation ──
  const createOrganization = useCallback((data) => {
    const org = {
      id: 'org_' + Date.now(),
      name: data.name || data.nom || '',
      type: data.type || 'entreprise', // entreprise, cabinet, bet, bureau_controle
      adminId: store.user?.id || null,
      members: [{ userId: store.user?.id, role: 'admin', joinedAt: new Date().toISOString() }],
      logo: data.logo || null,
      rccm: data.rccm || '',
      email: data.email || '',
      tel: data.tel || '',
      ville: data.ville || '',
      pays: data.pays || 'CI',
      createdAt: new Date().toISOString(),
    }
    updateStore(prev => ({ ...prev, organizations: [...(prev.organizations || []), org] }))
    return org
  }, [store.user, updateStore])

  const addMemberToOrg = useCallback((orgId, memberData) => {
    updateStore(prev => ({
      ...prev,
      organizations: (prev.organizations || []).map(o => o.id === orgId ? {
        ...o,
        members: [...o.members, { userId: memberData.userId || null, email: memberData.email, role: memberData.role || 'member', joinedAt: new Date().toISOString() }]
      } : o)
    }))
  }, [updateStore])

  // ═══ PROJECT MEMBERSHIP (multi-acteurs) — déclaré avant createProject ═══

  const addProjectMember = useCallback((projectId, userId, role, meta = {}) => {
    updateStore(prev => {
      const exists = (prev.projectMembers || []).some(m => m.projectId === projectId && m.userId === userId)
      if (exists) return prev
      const membership = {
        id: 'pm_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        projectId,
        userId,
        role: role || ROLES.PRO_MEMBER,
        userName: meta.userName || '',
        userEmail: meta.userEmail || '',
        organizationId: meta.organizationId || null,
        joinedAt: new Date().toISOString(),
      }
      return { ...prev, projectMembers: [...(prev.projectMembers || []), membership] }
    })
    sync(api.projectMembers.create({ projectId, userId, role: role || ROLES.PRO_MEMBER, userName: meta.userName || '', userEmail: meta.userEmail || '' }))
    log('PROJECT_MEMBER_ADDED', { projectId, userId, role })
    // Ajouter le nouveau membre au groupe de discussion du projet (si existant)
    const memberName = meta.userName || userId
    if (memberName) {
      updateStore(prev => ({
        ...prev,
        conversations: (prev.conversations || []).map(c => {
          if (c.projectId === projectId && c.isGroup && !c.participants?.includes(memberName)) {
            return { ...c, participants: [...(c.participants || []), memberName], dernier: memberName + ' a rejoint le groupe', time: 'Maintenant' }
          }
          return c
        }),
      }))
    }
  }, [updateStore, log])

  const removeProjectMember = useCallback((projectId, userId) => {
    updateStore(prev => ({
      ...prev,
      projectMembers: (prev.projectMembers || []).filter(m => !(m.projectId === projectId && m.userId === userId)),
    }))
    log('PROJECT_MEMBER_REMOVED', { projectId, userId })
  }, [updateStore, log])

  const getProjectMembers = useCallback((projectId) => {
    return (store.projectMembers || []).filter(m => m.projectId === projectId)
  }, [store.projectMembers])

  const createProject = useCallback((data) => {
    // Use storeRef for fresh values — avoids stale closure after createUser (same pattern as createAO)
    const currentUser = storeRef.current.user
    const p = {
      id: data.id || 'proj_' + Date.now(),
      color: data.color || autoProjectColor(storeRef.current.projects || []),
      name: data.name || data.nom || 'Nouveau projet',
      clientId: data.clientId || currentUser?.id || null,
      clientEmail: data.clientEmail || null,
      clientInviteStatus: data.clientEmail ? 'pending' : null,
      ownerId: data.ownerId || currentUser?.id || null,
      nom: data.name || data.nom || 'Nouveau projet',
      type: data.type || '',
      budget: data.budget || '',
      status: 'draft',
      phase: data.phase || 'ESQUISSE',
      progress: computePhaseProgress(data.phase || 'ESQUISSE'),
      avancement: computePhaseProgress(data.phase || 'ESQUISSE'),
      team: data.team || [],
      address: data.address || '',
      localisation: data.address || '',
      client: data.client || '',
      livraison: data.livraison || '',
      priorite: data.priorite || 'Normale',
      description: data.description || '',
      etapes: [],
      createdAt: new Date().toISOString()
    }
    updateStore(prev => {
      const updates = { ...prev, projects: [...prev.projects, p] }
      // Propager date livraison vers agenda
      if (p.livraison) {
        const evt = {
          id: 'evt_liv_' + p.id,
          title: 'Livraison — ' + p.nom,
          date: p.livraison,
          type: 'deadline',
          projectId: p.id,
          color: '#FF9500',
          auto: true,
        }
        updates.events = [...(prev.events || []), evt]
      }
      return updates
    })
    // Sync to PostgreSQL
    sync(api.projects.create({ nom: p.nom, type: p.type, phase: p.phase, budget: p.budget, adresse: p.address || p.localisation, livraison: p.livraison, priorite: p.priorite, description: p.description, avancement: p.avancement, status: p.status, client: p.client, clientEmail: p.clientEmail, clientId: p.clientId || null, sourceAoId: p.sourceAoId || null, etapes: p.etapes || null, equipe: p.team || p.equipe || null, color: p.color || null, ownerId: p.ownerId || 'local' }))
    if (p.livraison) {
      sync(api.events.create({ titre: 'Livraison — ' + p.nom, date: p.livraison, type: 'deadline', projectId: p.id, color: '#FF9500' }))
    }
    log('PROJECT_CREATED', { name: p.name })
    addNotif('Projet \u00ab ' + p.name + ' \u00bb cr\u00e9\u00e9', 'green', null, 'projets')
    showToast('\u2705 Projet \u00ab ' + p.name + ' \u00bb cr\u00e9\u00e9', 'green')
    // Auto-membership: enregistrer le créateur comme membre du projet
    const creatorRole = currentUser?.type === 'client' ? ROLES.CLIENT : ROLES.PRO_ADMIN
    addProjectMember(p.id, currentUser?.id, creatorRole, { userName: currentUser?.name, userEmail: currentUser?.email })
    // Créer automatiquement le groupe de discussion du projet
    const groupConvId = 'conv_grp_' + p.id
    const groupConv = {
      id: groupConvId,
      nom: p.name,
      type: 'equipe',
      avatar: (p.name || '?')[0].toUpperCase(),
      color: p.color || '#191c1d',
      isGroup: true,
      projectId: p.id,
      participants: [currentUser?.name || 'Vous'],
      invited: false,
      dernier: 'Groupe créé',
      time: 'Maintenant',
      unread: 0,
      msgs: [],
    }
    updateStore(prev => ({
      ...prev,
      conversations: [groupConv, ...(prev.conversations || []).filter(c => c.id !== groupConvId)],
    }))
    // Auto-invite si email client fourni
    if (data.clientEmail) {
      addNotif('Invitation envoyée à ' + data.clientEmail + ' pour le projet « ' + p.name + ' »', 'blue', null, 'projets')
    }
    return p
  }, [store.user, updateStore, log, addNotif, showToast, addProjectMember])

  const deleteProject = useCallback((projectId) => {
    updateStore(prev => ({
      ...prev,
      projects: (prev.projects || []).filter(p => p.id !== projectId),
      // Nettoyage des données liées
      taskStates: (() => { const ts = { ...(prev.taskStates || {}) }; delete ts[projectId]; return ts })(),
    }))
    sync(api.projects.delete(projectId))
    log('PROJECT_DELETED', { projectId })
    addNotif('Projet supprimé', 'orange', null, 'projets')
    showToast('Projet supprimé', 'orange')
  }, [updateStore, log, addNotif, showToast])

  const archiveProject = useCallback((projectId) => {
    updateStore(prev => ({
      ...prev,
      projects: (prev.projects || []).map(p =>
        p.id === projectId ? { ...p, status: 'archived', archivedAt: new Date().toISOString() } : p
      ),
    }))
    sync(api.projects.update(projectId, { status: 'archived' }))
    log('PROJECT_ARCHIVED', { projectId })
    addNotif('Projet archivé', 'info', null, 'projets')
    showToast('Projet archivé', 'info')
  }, [updateStore, log, addNotif, showToast])

  const unarchiveProject = useCallback((projectId) => {
    updateStore(prev => ({
      ...prev,
      projects: (prev.projects || []).map(p =>
        p.id === projectId ? { ...p, status: 'active', archivedAt: null } : p
      ),
    }))
    sync(api.projects.update(projectId, { status: 'active' }))
    log('PROJECT_UNARCHIVED', { projectId })
    showToast('Projet restauré', 'green')
  }, [updateStore, log, showToast])

  const updateProject = useCallback((projectId, updates) => {
    updateStore(prev => ({
      ...prev,
      projects: (prev.projects || []).map(p => {
        if (p.id !== projectId) return p
        const merged = { ...p, ...updates }
        // Auto-recalculate avancement when phase changes
        if (updates.phase && updates.phase !== p.phase) {
          const phaseFloor = computePhaseProgress(updates.phase)
          merged.avancement = Math.max(merged.avancement || 0, phaseFloor)
        }
        return merged
      }),
    }))
    sync(api.projects.update(projectId, updates))
  }, [updateStore])

  const inviteClientToProject = useCallback((projectId, clientEmail) => {
    if (!clientEmail || !clientEmail.includes('@')) return
    updateStore(prev => ({
      ...prev,
      projects: (prev.projects || []).map(p => p.id === projectId ? { ...p, clientEmail, clientInviteStatus: 'pending' } : p),
      projectInvitations: [...(prev.projectInvitations || []), {
        id: 'pinv_' + Date.now(),
        projectId,
        clientEmail,
        status: 'pending',
        sentBy: prev.user?.id,
        sentByName: prev.user?.name || prev.onboardingData?.entreprise || '',
        createdAt: new Date().toISOString(),
      }]
    }))
    addNotif('Invitation envoyée à ' + clientEmail, 'blue', null, 'projets')
    showToast('Invitation envoyée à ' + clientEmail, 'blue')
  }, [updateStore, addNotif, showToast])

  const respondProjectInvitation = useCallback((invitationId, accept) => {
    updateStore(prev => {
      const inv = (prev.projectInvitations || []).find(i => i.id === invitationId)
      if (!inv) return prev
      const newStatus = accept ? 'accepted' : 'refused'
      return {
        ...prev,
        projectInvitations: (prev.projectInvitations || []).map(i => i.id === invitationId ? { ...i, status: newStatus } : i),
        projects: (prev.projects || []).map(p => p.id === inv.projectId ? { ...p, clientInviteStatus: newStatus, clientId: accept ? (prev.user?.id || null) : p.clientId } : p),
      }
    })
    // Auto-membership: enregistrer le client comme membre du projet
    if (accept) {
      addProjectMember(
        (store.projectInvitations || []).find(i => i.id === invitationId)?.projectId,
        store.user?.id, ROLES.CLIENT, { userName: store.user?.name, userEmail: store.user?.email }
      )
    }
    addNotif(accept ? 'Vous avez accepté le projet' : 'Vous avez refusé l\'invitation', accept ? 'green' : 'orange')
    showToast(accept ? 'Projet accepté' : 'Invitation refusée', accept ? 'green' : 'orange')
  }, [store.user, store.projectInvitations, updateStore, addNotif, showToast, addProjectMember])

  // ── Clôture projet ──
  const requestCloture = useCallback((data) => {
    const req = {
      id: 'clot_' + Date.now(),
      projectId: data.projectId,
      requestedBy: store.user?.id || null,
      requestedByName: store.onboardingData?.entreprise || store.user?.name || '',
      clientId: data.clientId || null,
      clientEmail: data.clientEmail || null,
      clientPhone: data.clientPhone || null,
      validationMode: data.validationMode || 'PLATFORM', // PLATFORM | EXTERNAL_LINK | MANUAL
      status: data.validationMode === 'MANUAL' ? 'CLOTURE_VALIDE_EXTERNE' : 'EN_ATTENTE_VALIDATION_CLIENT',
      proof: data.proof || null,
      message: data.message || '',
      createdAt: new Date().toISOString(),
      validatedAt: data.validationMode === 'MANUAL' ? new Date().toISOString() : null,
    }
    updateStore(prev => {
      const projectStatus = data.validationMode === 'MANUAL' ? 'CLOTURE_VALIDE_EXTERNE' : 'DEMANDE_CLOTURE_ENVOYEE'
      // Si le projet n'est pas dans store.projects (projet statique), le copier
      const exists = (prev.projects || []).some(p => p.id === data.projectId)
      let projects = prev.projects || []
      if (exists) {
        projects = projects.map(p => p.id === data.projectId ? { ...p, clotureStatus: projectStatus, ...(data.validationMode === 'MANUAL' ? { status: 'archived' } : {}) } : p)
      } else {
        // Copier le projet statique dans le store avec le nouveau statut
        projects = [...projects, { id: data.projectId, clotureStatus: projectStatus, ...(data.validationMode === 'MANUAL' ? { status: 'archived' } : {}) }]
      }
      return {
        ...prev,
        clotureRequests: [...(prev.clotureRequests || []), req],
        projects,
      }
    })
    // Archiver le projet côté backend si validation immédiate
    if (data.validationMode === 'MANUAL') {
      api.projects.update(data.projectId, { status: 'archived' }).catch(() => {})
    }
    if (data.validationMode === 'MANUAL') {
      addNotif('Projet clôturé avec validation externe', 'green', null, 'projets')
      showToast('Projet clôturé', 'green')
    } else if (data.validationMode === 'EXTERNAL_LINK') {
      addNotif('Lien de validation envoyé', 'blue', null, 'projets')
      showToast('Lien envoyé', 'blue')
    } else {
      addNotif('Demande de clôture envoyée', 'blue', null, 'projets')
      showToast('Demande envoyée', 'blue')
    }
    return req
  }, [store.user, store.onboardingData, updateStore, addNotif, showToast])

  const respondCloture = useCallback((clotureId, accept, comment) => {
    updateStore(prev => {
      const req = (prev.clotureRequests || []).find(r => r.id === clotureId)
      if (!req) return prev
      const newStatus = accept ? 'CLOTURE_VALIDE_EXTERNE' : 'CLOTURE_REFUSEE'
      const projectStatus = accept ? 'archived' : 'EN_COURS'
      if (accept) {
        api.projects.update(req.projectId, { status: 'archived' }).catch(() => {})
      }
      return {
        ...prev,
        clotureRequests: (prev.clotureRequests || []).map(r => r.id === clotureId ? { ...r, status: newStatus, validatedAt: new Date().toISOString(), clientComment: comment || '' } : r),
        projects: (prev.projects || []).map(p => p.id === req.projectId ? { ...p, clotureStatus: newStatus, status: projectStatus } : p),
      }
    })
    addNotif(accept ? clientLabel(storeRef.current) + ' a confirmé la réception du projet' : clientLabel(storeRef.current) + ' a refusé la clôture', accept ? 'green' : 'orange', null, 'projets')
    showToast(accept ? 'Projet clôturé' : 'Clôture refusée', accept ? 'green' : 'orange')
  }, [updateStore, addNotif, showToast])

  // ── Invitations AO ──
  const sendAOInvitation = useCallback((data) => {
    // Guard: prevent duplicate email invites
    const inv = {
      id: 'aoinv_' + Date.now(),
      aoId: data.aoId,
      senderUserId: store.user?.id || null,
      targetUserId: data.targetUserId || null,
      targetEmail: data.targetEmail || null,
      targetPhone: data.targetPhone || null,
      targetName: data.targetName || '',
      targetTrade: data.targetTrade || '',
      message: data.message || '',
      status: 'sent',
      createdAt: new Date().toISOString(),
    }
    updateStore(prev => {
      // Prevent duplicate
      const exists = (prev.aoInvitations || []).some(i =>
        i.aoId === inv.aoId && ((i.targetEmail && i.targetEmail === inv.targetEmail) || (i.targetUserId && i.targetUserId === inv.targetUserId))
      )
      if (exists) return prev
      // If target is internal user, send notification
      const notifs = inv.targetUserId ? [
        ...prev.notifications,
        { id: Date.now(), msg: 'Vous avez été invité à répondre à un appel d\u2019offres', type: 'blue', link: null, page: 'bourse', read: false, ts: new Date().toISOString(), role: 'pro', aoId: inv.aoId }
      ] : prev.notifications
      return { ...prev, aoInvitations: [...(prev.aoInvitations || []), inv], notifications: notifs }
    })
    addNotif('Invitation envoyée' + (inv.targetName ? ' à ' + inv.targetName : ''), 'blue', null, 'bourse')
    showToast('Invitation envoyée', 'blue')
    return inv
  }, [store.user, updateStore, addNotif, showToast])

  /**
   * deleteAO — Suppression/annulation d'un AO avec règles métier
   * @returns {{ success: boolean, action?: string, reason?: string }}
   */
  const deleteAO = useCallback((aoId) => {
    const userId = store.user?.id
    const ao = (store.aos || []).find(a => a.id === aoId)
    if (!ao) return { success: false, reason: 'AO introuvable' }

    // Permission check
    if (ao.ownerUserId && String(ao.ownerUserId) !== String(userId)) {
      return { success: false, reason: 'Vous n\u2019êtes pas le propriétaire de cet AO' }
    }

    // Check if market was created from this AO
    const hasMarket = (store.markets || []).some(m => m.aoId === aoId)
    if (hasMarket) {
      return { success: false, reason: 'Cet appel d\u2019offres a déjà donné lieu à un marché', action: 'archive_only' }
    }

    // Check if responses exist
    const responses = (store.offers || []).filter(o => o.aoId === aoId)
    const hasResponses = responses.length > 0

    if (hasResponses) {
      // Cancel, don't hard delete
      updateStore(prev => ({
        ...prev,
        aos: (prev.aos || []).map(a => a.id === aoId ? { ...a, status: 'cancelled_by_owner', cancelledAt: new Date().toISOString() } : a),
        aoInvitations: (prev.aoInvitations || []).map(i => i.aoId === aoId && i.status === 'sent' ? { ...i, status: 'cancelled_with_ao' } : i),
      }))
      sync(api.aos.update(aoId, { status: 'cancelled_by_owner' }))
      log('AO_CANCELLED_BY_OWNER', { aoId, responses: responses.length })
      addNotif('Appel d\u2019offres annulé', 'orange', null, 'bourse')
      showToast('Appel d\u2019offres annulé', 'orange')
      return { success: true, action: 'cancelled' }
    }

    // Draft or published without responses — hard delete
    updateStore(prev => ({
      ...prev,
      aos: (prev.aos || []).filter(a => a.id !== aoId),
      aoInvitations: (prev.aoInvitations || []).map(i => i.aoId === aoId ? { ...i, status: 'cancelled_with_ao' } : i),
    }))
    sync(api.aos.delete(aoId))
    log('AO_DELETED', { aoId })
    addNotif('Appel d\u2019offres supprimé', 'info', null, 'bourse')
    showToast('Appel d\u2019offres supprimé', 'info')
    return { success: true, action: 'deleted' }
  }, [store.user, store.aos, store.offers, store.markets, updateStore, log, addNotif, showToast])

  const updateAO = useCallback((aoId, updates) => {
    const ao = (store.aos || []).find(a => a.id === aoId)
    if (!ao) return { success: false, reason: 'AO introuvable' }
    if (ao.ownerUserId && ao.ownerUserId !== store.user?.id) {
      return { success: false, reason: 'Vous n\u2019êtes pas le propriétaire de cet AO' }
    }
    // Only allow editing open AOs
    if (ao.status !== 'open') {
      return { success: false, reason: 'Seul un AO ouvert peut être modifié' }
    }
    const allowed = ['title', 'description', 'budget', 'lot', 'requestedTrade', 'visibilityScope']
    const clean = {}
    for (const k of allowed) { if (updates[k] !== undefined) clean[k] = updates[k] }
    updateStore(prev => ({
      ...prev,
      aos: (prev.aos || []).map(a => a.id === aoId ? { ...a, ...clean, updatedAt: new Date().toISOString() } : a),
    }))
    sync(api.aos.update(aoId, clean))
    log('AO_UPDATED', { aoId, fields: Object.keys(clean) })
    showToast('Appel d\u2019offres mis à jour')
    return { success: true }
  }, [store.user, store.aos, updateStore, log, showToast])

  const archiveAO = useCallback((aoId) => {
    updateStore(prev => ({
      ...prev,
      aos: (prev.aos || []).map(a => a.id === aoId ? { ...a, status: 'archived', archivedAt: new Date().toISOString() } : a),
    }))
    sync(api.aos.update(aoId, { status: 'archived' }))
    log('AO_ARCHIVED', { aoId })
    showToast('Appel d\u2019offres archivé', 'info')
  }, [updateStore, log, showToast])

  const createAO = useCallback(async (data) => {
    // Use storeRef for fresh values (avoids stale closure after createUser)
    const currentUser = storeRef.current.user
    const currentMembers = storeRef.current.projectMembers || []
    const userType = currentUser?.type
    const projectRole = data.projectId
      ? getProjectRole(currentUser?.id, data.projectId, currentMembers, currentUser)
      : (userType === 'client' ? ROLES.CLIENT : userType === 'pro' ? ROLES.PRO_ADMIN : null)
    // Skip permission check for auto-generated AOs (created by system during onboarding)
    if (!data.autoGenerated && !isAllowed(projectRole, 'create_ao')) {
      showToast('Vous n\'êtes pas autorisé à créer un appel d\'offres', 'orange')
      return null
    }
    const aoPayload = {
      title: data.title || data.titre || "Appel d'offres",
      description: data.description || '',
      budget: data.budget || '',
      lot: data.lot || '',
      status: 'open',
      projectId: data.projectId || null,
      ownerUserId: currentUser?.id || null,
      ownerProfileType: currentUser?.type || data.ownerProfileType || 'client',
      requestedTrade: data.requestedTrade || data.lot || '',
      visibilityScope: data.visibilityScope || 'public',
      createdByClient: data.createdByClient || (currentUser?.type === 'client'),
      deadline: data.deadline || '',
      prive: data.prive || false,
      listeRestreinte: data.listeRestreinte || [],
    }
    // Create on backend FIRST — get the real ID
    let ao
    try {
      const backendAO = await api.aos.create(aoPayload)
      ao = {
        ...aoPayload,
        id: backendAO.id,
        ownerRole: projectRole,
        autoGenerated: data.autoGenerated || false,
        createdAt: backendAO.createdAt || new Date().toISOString(),
      }
    } catch (e) {
      // Backend down — fallback to local ID
      console.warn('[createAO] Backend failed, using local ID:', e.message)
      ao = {
        ...aoPayload,
        id: 'ao_' + Date.now(),
        ownerRole: projectRole,
        autoGenerated: data.autoGenerated || false,
        createdAt: new Date().toISOString(),
      }
    }
    // Add to store (single source, no duplication)
    updateStore(prev => ({ ...prev, aos: [...(prev.aos || []), ao] }))
    log('AO_CREATED', { title: ao.title, trade: ao.requestedTrade, visibility: ao.visibilityScope, projectRole })
    addNotif('AO \u00ab ' + ao.title + " \u00bb publi\u00e9 \u2014 en attente d'offres", 'blue', null, 'ao')
    showToast("\ud83d\udce3 Appel d'offres publi\u00e9", 'blue')
    return ao
  }, [updateStore, log, addNotif, showToast])

  const submitOffer = useCallback(async (data) => {
    // Guard: seuls les prestataires (entreprise, BET, fournisseur) peuvent répondre
    const userType = store.user?.type
    const ao = (store.aos || []).find(a => a.id === data.aoId)
    const projectRole = ao?.projectId
      ? getProjectRole(store.user?.id, ao.projectId, store.projectMembers, store.user)
      : (userType === 'pro' ? ROLES.ENTREPRISE : userType === 'fournisseur' ? ROLES.SUPPLIER : null)
    if (!isAllowed(projectRole, 'respond_ao')) {
      showToast('Seuls les professionnels peuvent répondre à un appel d\'offres', 'orange')
      return null
    }
    // Guard: ne pas répondre à son propre AO
    if (ao && ao.ownerUserId === store.user?.id) {
      showToast('Vous ne pouvez pas répondre à votre propre appel d\'offres', 'orange')
      return null
    }
    const offerPayload = {
      titre: data.entreprise || store.onboardingData?.entreprise || store.user?.company || '',
      entreprise: data.entreprise || store.onboardingData?.entreprise || store.user?.company || '',
      montant: String(data.price || data.montant || 0),
      delai: data.delai || '',
      message: data.message || '',
      statut: 'pending',
      aoId: data.aoId,
      userId: store.user?.id || data.supplierId,
      supplierId: store.user?.id || data.supplierId || null,
      supplierRole: projectRole || null,
    }
    // Create on backend FIRST — get real ID
    let offer
    try {
      const backendOffer = await api.offers.create(offerPayload)
      offer = {
        id: backendOffer.id,
        aoId: data.aoId,
        supplierId: store.user?.id || data.supplierId,
        supplierRole: projectRole,
        entreprise: offerPayload.entreprise,
        supplierName: offerPayload.entreprise,
        price: data.price || data.montant || 0,
        montant: offerPayload.montant,
        delai: data.delai || '',
        message: data.message || '',
        status: 'pending',
        statut: 'pending',
        createdAt: backendOffer.createdAt || new Date().toISOString(),
      }
    } catch (e) {
      // 409 = déjà postulé sur cet AO (contrainte unique aoId+supplierId)
      if (e.status === 409 || (e.message || '').includes('Unique constraint') || (e.message || '').includes('déjà postulé')) {
        showToast('Vous avez déjà soumis une offre pour cet AO', 'orange')
        return null
      }
      console.warn('[submitOffer] Backend failed, using local ID:', e.message)
      offer = {
        id: 'off_' + Date.now(),
        aoId: data.aoId,
        supplierId: store.user?.id || data.supplierId,
        supplierRole: projectRole,
        entreprise: offerPayload.entreprise,
        supplierName: offerPayload.entreprise,
        price: data.price || data.montant || 0,
        montant: offerPayload.montant,
        delai: data.delai || '',
        message: data.message || '',
        status: 'pending',
        statut: 'pending',
        createdAt: new Date().toISOString(),
      }
    }
    updateStore(prev => ({ ...prev, offers: [...prev.offers, offer] }))
    log('OFFER_SUBMITTED', { aoId: offer.aoId, price: offer.price, supplierRole: projectRole })
    addNotif('Offre soumise \u2014 en attente de r\u00e9ponse', 'info', null, 'offres')
    showToast('\ud83d\udce9 Offre envoy\u00e9e avec succ\u00e8s', 'green')
    return offer
  }, [store.user, store.aos, store.projectMembers, updateStore, log, addNotif, showToast])

  const acceptOffer = useCallback((offerId) => {
    // Guard: seul le client ou architecte mandaté peut accepter
    const ao = (() => {
      const offer = (store.offers || []).find(o => o.id === offerId)
      return offer ? (store.aos || []).find(a => a.id === offer.aoId) : null
    })()
    const projectRole = ao?.projectId
      ? getProjectRole(store.user?.id, ao.projectId, store.projectMembers, store.user)
      : (store.user?.type === 'client' ? ROLES.CLIENT : store.user?.type === 'pro' ? ROLES.PRO_ADMIN : null)
    if (!isAllowed(projectRole, 'accept_offer')) {
      showToast('Seul le maître d\'ouvrage ou l\'architecte mandaté peut accepter une offre', 'orange')
      return null
    }

    let market = null
    updateStore(prev => {
      const offer = (prev.offers || []).find(o => o.id === offerId)
      if (!offer) return prev
      const offers = (prev.offers || []).map(o => {
        if (o.aoId === offer.aoId && o.id !== offerId) return { ...o, status: 'rejected', statut: 'rejected' }
        if (o.id === offerId) return { ...o, status: 'accepted', statut: 'accepted', acceptedBy: prev.user?.id, acceptedAt: new Date().toISOString() }
        return o
      })
      const aoObj = (prev.aos || []).find(a => a.id === offer.aoId)
      // If AO has no project, auto-create one from the market context
      let autoProject = null
      let projectId = aoObj?.projectId || null
      if (!projectId) {
        const pId = 'proj_' + Date.now()
        projectId = pId
        // Nettoyer le titre de l'AO des préfixes auto-générés ("Recherche architecte ·", "Mission complète ·")
        const cleanTitle = (aoObj?.title || '').replace(/^(Recherche\s+\w+\s*[·•]\s*|Mission\s+compl[eè]te\s*[·•]\s*)/i, '').trim()
        const projNom = cleanTitle || aoObj?.lot || offer.entreprise || 'Nouveau projet'
        autoProject = {
          id: pId,
          nom: projNom,
          type: aoObj?.lot || 'Mission',
          phase: 'ATTRIBUTION_MARCHES',
          budget: offer.price ? String(offer.price) : offer.montant ? String(offer.montant) : aoObj?.budget || '',
          adresse: '',
          description: aoObj?.description || '',
          avancement: 0,
          status: 'active',
          ownerId: prev.user?.id || 'local',
          clientId: aoObj?.ownerUserId || prev.user?.id || null,
          clientEmail: prev.user?.email || '',
          client: prev.user?.name || '',
          color: '#2563EB',
          createdAt: new Date().toISOString(),
          // Link back to AO and market
          sourceAoId: offer.aoId,
          etapes: [
            { n: 'Préparation', label: 'Préparation & mobilisation', done: false, current: true },
            { n: 'Installation', label: 'Installation chantier', done: false },
            { n: 'Exécution', label: 'Exécution des travaux', done: false },
            { n: 'Contrôle', label: 'Contrôle qualité', done: false },
            { n: 'Livraison', label: 'Livraison & réception', done: false },
          ],
          equipe: [{ nom: offer.entreprise || offer.supplierName || '', role: aoObj?.lot || 'Prestataire', statut: 'actif' }],
        }
      }
      // Heritage complet AO + Offre → Marche avec acteurs identifiés
      market = {
        id: 'mkt_' + Date.now(),
        projectId: projectId,
        aoId: offer.aoId,
        // ═══ ACTEURS CONTRACTUELS ═══
        clientId: aoObj?.ownerProfileType === 'client' ? aoObj?.ownerUserId : (prev.projects || []).find(p => p.id === aoObj?.projectId)?.clientId || null,
        supplierId: offer.supplierId,
        supplierRole: offer.supplierRole || null,
        acceptedBy: prev.user?.id || null,
        acceptedByRole: projectRole,
        aoOwnerId: aoObj?.ownerUserId || null,
        // Heritage AO
        lot: aoObj?.lot || aoObj?.title || '',
        titre: aoObj?.title || '',
        budget: aoObj?.budget || '',
        description: aoObj?.description || '',
        // Heritage Offre — montant depuis Prisma ou price depuis store local
        amount: offer.price || offer.montant || 0,
        montant: String(offer.price || offer.montant || 0),
        entreprise: offer.entreprise || offer.supplierName || '',
        offerMessage: offer.message || '',
        // Statut & cycle de vie
        statut: 'signed',
        progress: 0,
        status: 'ongoing',
        milestones: [],
        documents: [],
        validations: [],
        delai: offer.delai || '',
        createdAt: new Date().toISOString()
      }
      const defaultTasks = ['Pr\u00e9paration & mobilisation', 'Installation chantier', 'Ex\u00e9cution travaux', 'Contr\u00f4le qualit\u00e9', 'Livraison & r\u00e9ception']
      const tasks = defaultTasks.map((title, i) => ({
        id: 'task_' + Date.now() + '_' + i,
        marketId: market.id,
        projectId: market.projectId,
        title,
        status: 'pending',
        progress: 0,
        assignedTo: offer.supplierId || null,
        assignedRole: offer.supplierRole || null,
      }))
      // Propager evenement marche vers agenda
      const mktEvt = {
        id: 'evt_mkt_' + market.id,
        title: 'Marché signé — ' + (market.lot || market.titre || 'Nouveau marché'),
        date: new Date().toISOString().slice(0, 10),
        type: 'milestone',
        projectId: market.projectId,
        color: '#34C759',
        auto: true,
      }
      // Auto-membership: ajouter le prestataire au projet
      let newMembers = prev.projectMembers || []
      if (market.projectId && offer.supplierId) {
        const alreadyMember = newMembers.some(m => m.projectId === market.projectId && m.userId === offer.supplierId)
        if (!alreadyMember) {
          newMembers = [...newMembers, {
            id: 'pm_' + Date.now() + '_mkt',
            projectId: market.projectId,
            userId: offer.supplierId,
            role: offer.supplierRole || ROLES.ENTREPRISE,
            userName: offer.entreprise || offer.supplierName || '',
            joinedAt: new Date().toISOString(),
          }]
        }
      }
      // Close the AO — offer accepted, mark as attributed (not just closed)
      const closedAos = (prev.aos || []).map(a =>
        a.id === offer.aoId ? { ...a, status: 'attributed', closedAt: new Date().toISOString() } : a
      )
      const nextProjects = autoProject ? [...prev.projects, autoProject] : prev.projects.map(p =>
        // Mettre à jour la phase du projet existant quand une offre est acceptée
        p.id === projectId ? { ...p, phase: p.phase === 'ATTRIBUTION_MARCHES' || p.phase === 'CONSULTATION_ENTREPRISES' ? 'SUIVI_CHANTIER' : p.phase, status: 'active', avancement: Math.max(p.avancement || 0, 5) } : p
      )
      // Auto-create conversation between client and pro after market signing
      const autoConv = {
        id: 'conv_' + Date.now(),
        projectId: projectId,
        marketId: market.id,
        participants: [prev.user?.id, offer.supplierId].filter(Boolean),
        title: (aoObj?.title || 'Projet') + ' — ' + (offer.entreprise || ''),
        nom: offer.entreprise || offer.supplierName || aoObj?.title || 'Conversation',
        lastMessage: 'Marché signé — la conversation est ouverte.',
        lastAt: new Date().toISOString(),
        unread: 0,
      }
      return { ...prev, offers, aos: closedAos, projects: nextProjects, markets: [...prev.markets, market], tasks: [...prev.tasks, ...tasks], events: [...(prev.events || []), mktEvt], projectMembers: newMembers, conversations: [...(prev.conversations || []), autoConv] }
    })
    // Sync to PostgreSQL — project, market, offer, AO, event (all in async block)
    const closedAoId = (store.offers || []).find(o => o.id === offerId)?.aoId
    ;(async () => {
      try {
        // 1. Sync auto-project FIRST (market needs projectId)
        let backendProjectId = market?.projectId
        if (market?.projectId && !ao?.projectId) {
          try {
            const autoProj = storeRef.current.projects?.find(p => p.id === market.projectId)
            const backendProject = await api.projects.create({
              nom: autoProject?.nom || market.titre || 'Projet', type: market.lot || 'Mission',
              phase: 'ATTRIBUTION_MARCHES', budget: String(market.amount || market.budget || ''),
              description: market.description || '', status: 'active',
              ownerId: store.user?.id || 'local', clientId: store.user?.id || null,
              clientEmail: store.user?.email || '', client: store.user?.name || '',
              sourceAoId: market.aoId || null,
              etapes: autoProj?.etapes || null, equipe: autoProj?.equipe || null,
            })
            if (backendProject?.id) {
              backendProjectId = backendProject.id
              // Replace local proj_ ID with backend cuid
              updateStore(prev => ({
                ...prev,
                projects: (prev.projects || []).map(p => p.id === market.projectId ? { ...p, id: backendProject.id } : p)
              }))
              console.log('[acceptOffer] Auto-project synced:', backendProject.id)
            }
          } catch (e) { console.warn('[acceptOffer] Project sync failed:', e.message) }
        }
        // 2. Create market on backend with real projectId
        const backendMarket = await api.markets.create({ titre: market?.titre, entreprise: market?.entreprise, lot: market?.lot, montant: String(market?.amount || market?.montant || market?.budget || ''), statut: 'signed', avancement: 0, projectId: backendProjectId, offerId, aoId: market?.aoId || null, clientId: market?.clientId || null, supplierId: market?.supplierId || null, delai: market?.delai || null, description: market?.description || null })
        // Replace local mkt_ ID with backend cuid
        if (backendMarket?.id && market) {
          updateStore(prev => ({
            ...prev,
            markets: (prev.markets || []).map(m => m.id === market.id ? { ...m, id: backendMarket.id } : m)
          }))
        }
      } catch (e) { console.warn('[acceptOffer] Market sync failed:', e.message) }
      // Sync remaining entities (fire-and-forget)
      sync(api.offers.update(offerId, { statut: 'accepted', acceptedBy: store.user?.id || null, acceptedAt: new Date().toISOString() }))
      if (closedAoId) sync(api.aos.update(closedAoId, { status: 'attributed' }))
      sync(api.events.create({ titre: 'Marché signé — ' + (market?.lot || market?.titre || 'Nouveau marché'), date: new Date().toISOString().slice(0, 10), type: 'milestone', projectId: backendProjectId || market?.projectId, color: '#34C759' }))
      // Sync auto-conversation to backend
      const autoConvData = storeRef.current.conversations?.find(c => c.marketId === market?.id)
      if (autoConvData) {
        sync(api.conversations.create({ title: autoConvData.title, projectId: backendProjectId || autoConvData.projectId, marketId: autoConvData.marketId, participants: autoConvData.participants, lastMessage: autoConvData.lastMessage, lastAt: autoConvData.lastAt }))
      }
      // Sync project member (supplier added to project team)
      const offer = storeRef.current.offers?.find(o => o.id === offerId)
      if (offer?.supplierId && (backendProjectId || market?.projectId)) {
        sync(api.projectMembers.create({ projectId: backendProjectId || market.projectId, userId: offer.supplierId, role: offer.supplierRole || 'ENTREPRISE', userName: offer.entreprise || '' }))
      }
    })()
    log('OFFER_ACCEPTED', { offerId, acceptedByRole: projectRole })
    addNotif('Offre acceptée — marché en cours de création', 'green', null, 'marches')
    showToast('Offre acceptée', 'green')
    // ── Commission clé en main : créer introduction + commission si applicable ──
    if (_isCEM && _isCEM(storeRef.current) && market) {
      const offer = storeRef.current.offers?.find(o => o.id === offerId)
      if (offer) {
        const intro = {
          id: 'intro_' + Date.now(),
          projectId: market.projectId,
          clientId: storeRef.current.user?.id,
          structureId: offer.supplierId,
          structureName: offer.entreprise || offer.supplierName || '',
          metier: market.lot || '',
          status: 'retained',
          introDate: new Date().toISOString(),
          retainedAt: new Date().toISOString(),
          source: 'meereo_cle_en_main',
        }
        const calc = _calcComm ? _calcComm(market.amount || market.budget) : { base: 0, amount: 0, rate: 0.05 }
        const commission = {
          id: 'comm_' + Date.now(),
          introductionId: intro.id,
          structureId: offer.supplierId,
          structureName: intro.structureName,
          projectId: market.projectId,
          clientId: storeRef.current.user?.id,
          montantBase: calc.base,
          montantCommission: calc.amount,
          rate: calc.rate,
          status: 'due',
          createdAt: new Date().toISOString(),
          paidAt: null,
        }
        updateStore(prev => ({
          ...prev,
          introductions: [...(prev.introductions || []), intro],
          commissions: [...(prev.commissions || []), commission],
        }))
        sync(api.introductions.create({ projectId: intro.projectId, clientId: intro.clientId, structureId: intro.structureId, structureName: intro.structureName, metier: intro.metier, status: intro.status, source: intro.source }))
        sync(api.commissionsTracking.create({ introductionId: intro.id, structureId: commission.structureId, structureName: commission.structureName, projectId: commission.projectId, montantBase: commission.montantBase, montantCommission: commission.montantCommission, rate: commission.rate, status: commission.status }))
        log('COMMISSION_CLE_EN_MAIN', { structureName: intro.structureName, amount: commission.montantCommission })
      }
    }
    return market
  }, [store.user, store.offers, store.aos, store.projectMembers, updateStore, log, addNotif, showToast])

  const rejectOffer = useCallback((offerId) => {
    updateStore(prev => ({
      ...prev,
      offers: (prev.offers || []).map(o => o.id === offerId ? { ...o, status: 'rejected', statut: 'rejected' } : o)
    }))
    sync(api.offers.update(offerId, { statut: 'rejected' }))
    log('OFFER_REJECTED', { offerId })
    showToast('\u274c Offre refus\u00e9e', 'orange')
  }, [updateStore, log, showToast])

  const triggerPayment = useCallback((data) => {
    // Guard: seul le client peut initier un paiement
    const userType = store.user?.type
    if (userType !== 'client' && !data._systemGenerated) {
      const role = data.projectId ? getProjectRole(store.user?.id, data.projectId, store.projectMembers, store.user) : null
      if (!isAllowed(role, 'initiate_payment')) {
        showToast('Seul le maître d\'ouvrage peut initier un paiement', 'orange')
        return null
      }
    }
    const tx = {
      id: 'tx_' + Date.now(),
      projectId: data.projectId,
      marketId: data.marketId || null,
      amount: data.amount || 0,
      type: data.type || 'payment',
      paymentType: data.paymentType || 'paiement', // 'appel_de_fonds' | 'paiement' | 'acompte'
      status: 'pending',
      label: data.label || 'Paiement',
      // ═══ ACTEURS FINANCIERS ═══
      fromUserId: store.user?.id || data.fromUserId || null,
      toUserId: data.toUserId || null,
      fromRole: data.fromRole || (userType === 'client' ? ROLES.CLIENT : null),
      toRole: data.toRole || null,
      initiatedBy: store.user?.id || null,
      createdAt: new Date().toISOString()
    }
    updateStore(prev => ({ ...prev, transactions: [...prev.transactions, tx] }))
    sync(api.transactions.create({ type: tx.type || 'payment', label: tx.label, montant: tx.amount, statut: tx.status, projectId: tx.projectId, marketId: tx.marketId, userId: tx.fromUserId }))
    log('PAYMENT_TRIGGERED', { amount: tx.amount, fromUserId: tx.fromUserId, toUserId: tx.toUserId, paymentType: tx.paymentType })
    addNotif('Paiement de ' + formatAmount(tx.amount) + ' initi\u00e9', 'blue', null, 'paiements')
    showToast('\ud83d\udcb0 Paiement de ' + formatAmount(tx.amount) + ' initi\u00e9', 'blue')
    return tx
  }, [store.user, store.projectMembers, updateStore, log, addNotif, showToast])

  const confirmPayment = useCallback((txId) => {
    updateStore(prev => ({
      ...prev,
      transactions: (prev.transactions || []).map(t => t.id === txId ? { ...t, status: 'confirmed' } : t)
    }))
    sync(api.transactions.update(txId, { statut: 'confirmed' }))
    log('PAYMENT_CONFIRMED', { txId })
    addNotif('Paiement confirm\u00e9 \u2713', 'green', null, 'paiements')
    showToast('\u2705 Paiement confirm\u00e9', 'green')
  }, [updateStore, log, addNotif, showToast])

  const uploadDocument = useCallback((data) => {
    const doc = {
      id: 'doc_' + Date.now(),
      projectId: data.projectId,
      type: data.type || 'general',
      name: data.name || 'Document',
      url: data.url || '',
      uploadedBy: store.user?.id || null,
      createdAt: new Date().toISOString()
    }
    updateStore(prev => ({ ...prev, documents: [...prev.documents, doc] }))
    sync(api.documents.create({ name: doc.name, type: doc.type, url: doc.url, projectId: doc.projectId, userId: doc.uploadedBy }))
    log('DOCUMENT_UPLOADED', { name: doc.name })
    addNotif('Document \u00ab ' + doc.name + ' \u00bb ajout\u00e9', 'info', null, 'documents')
    showToast('\ud83d\udcce Document ajout\u00e9', 'info')
    return doc
  }, [store.user, updateStore, log, addNotif, showToast])

  const addProduct = useCallback((data) => {
    // Use storeRef for fresh user (avoids stale closure after createUser)
    const currentUser = storeRef.current.user
    const product = {
      id: 'prod_' + Date.now(),
      supplierId: data.supplierId || currentUser?.id || null,
      sellerId: data.sellerId || currentUser?.id || null,
      name: data.name || data.nom || '',
      category: data.category || data.categorie || '',
      price: data.price || data.prix || 0,
      unit: data.unit || 'unite',
      description: data.description || '',
      photoUrl: data.photoUrl || null,
      stock: data.stock || null,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      sponsored: data.sponsored || false,
      flash: data.flash || false,
      flashPrice: data.flashPrice || null,
      flashDuration: data.flashDuration || null,
      status: data.status || 'active',
      source: data.source || 'fournisseur',
      marketplace: data.marketplace !== undefined ? data.marketplace : true,
      createdAt: new Date().toISOString()
    }
    updateStore(prev => ({ ...prev, products: [...prev.products, product] }))
    // POST vers PostgreSQL — produit partagé entre tous les utilisateurs
    api.products.create({
      name: product.name,
      category: product.category,
      price: product.price,
      unit: product.unit,
      description: product.description,
      photoUrl: product.photoUrl || null,
      sponsored: product.sponsored,
      flash: product.flash,
      flashPrice: product.flashPrice || null,
    }).then(saved => {
      // Remplacer l'ID local par l'ID PostgreSQL
      if (saved?.id && saved.id !== product.id) {
        updateStore(prev => ({
          ...prev,
          products: prev.products.map(p => p.id === product.id ? { ...p, id: saved.id } : p),
        }))
      }
    }).catch(e => console.warn('[addProduct] Backend sync failed:', e.message))
    log('PRODUCT_ADDED', { name: product.name })
    showToast('\ud83d\udce6 Produit ajout\u00e9 au catalogue', 'green')
    return product
  }, [store.user, updateStore, log, showToast])

  const updateMarketProgress = useCallback((marketId, value) => {
    updateStore(prev => {
      const markets = (prev.markets || []).map(m => {
        if (m.id !== marketId) return m
        const progress = Math.max(0, Math.min(100, value))
        return { ...m, progress, status: progress >= 100 ? 'completed' : m.status }
      })
      return { ...prev, markets }
    })
    sync(api.markets.update(marketId, { avancement: Math.max(0, Math.min(100, value)) }))
    log('MARKET_PROGRESS', { marketId, value })
    showToast('\ud83d\udcca Avancement mis \u00e0 jour : ' + value + '%', 'info')
  }, [updateStore, log, showToast])

  const resetStore = useCallback(() => {
    updateStore({ ...defaultStore })
  }, [updateStore])

  // Logout complet : appel API, vide le store, clear le token en mémoire + sessionStorage
  const logoutUser = useCallback(async () => {
    // 1. Appel API pour invalider le cookie httpOnly côté serveur
    await api.auth.logout().catch(() => {})
    // 2. Vider le token JWT en mémoire et sessionStorage
    setInMemoryToken(null)
    // 3. Déconnecter le socket
    disconnectSocket()
    // 4. Réinitialiser le store et localStorage
    const next = { ...defaultStore, _hydrated: false, _checking: false, _cachedUser: null }
    saveToStorage(next)
    updateStore(next)
  }, [updateStore])

  // ═══ SYNCHRONISATION COCKPIT / CLIENT ═══

  // Émettre un événement métier (notif + log + badge update)
  const emitEvent = useCallback((eventType, data = {}, opts = {}) => {
    log(eventType, data)
    if (opts.notifMsg) {
      addNotif(opts.notifMsg, opts.notifType || 'info', opts.notifLink || null)
    }
    if (opts.toast) {
      showToast(opts.toast, opts.toastColor || 'info')
    }
    // Dispatch custom DOM event for cross-component reactivity
    window.dispatchEvent(new CustomEvent('meereo-event', { detail: { type: eventType, data, ts: Date.now() } }))
  }, [log, addNotif, showToast])

  // Mettre à jour les étapes d'un projet (quand le pro avance le chantier)
  const updateProjectEtapes = useCallback((projectId, newEtapes, newPhase, newAvancement) => {
    updateStore(prev => {
      // Mettre à jour dans le store
      const projects = (prev.projects || []).map(p =>
        p.id === projectId ? { ...p, etapes: newEtapes, phase: newPhase, avancement: newAvancement } : p
      )
      return { ...prev, projects, lastProjectUpdate: { projectId, phase: newPhase, avancement: newAvancement, ts: Date.now() } }
    })
    emitEvent('project_phase_changed', { projectId, phase: newPhase, progress: newAvancement }, {
      notifMsg: `Projet avancé en phase ${newPhase} (${newAvancement}%)`,
      notifType: 'info'
    })
  }, [updateStore, emitEvent])

  // Sauvegarder l'état des tâches chantier dans le store (pour sync)
  const saveTaskStates = useCallback((projectId, taskStates) => {
    updateStore(prev => ({
      ...prev,
      taskStates: { ...(prev.taskStates || {}), [projectId]: taskStates }
    }))
  }, [updateStore])

  // Valider une tâche chantier (client ou architecte uniquement)
  const validateTask = useCallback((taskId, projectId, approved, comment) => {
    const role = getProjectRole(store.user?.id, projectId, store.projectMembers, store.user)
    if (!isAllowed(role, 'validate_task')) {
      showToast('Seul le maître d\'ouvrage ou l\'architecte peut valider une tâche', 'orange')
      return false
    }
    updateStore(prev => ({
      ...prev,
      tasks: (prev.tasks || []).map(t => t.id === taskId ? {
        ...t,
        validationStatus: approved ? 'validated' : 'rejected',
        validatedBy: prev.user?.id,
        validatedByRole: role,
        validatedAt: new Date().toISOString(),
        validationComment: comment || '',
      } : t)
    }))
    log(approved ? 'TASK_VALIDATED' : 'TASK_VALIDATION_REJECTED', { taskId, projectId, role })
    emitEvent(approved ? 'task_validated' : 'task_validation_rejected', { taskId, projectId }, {
      notifMsg: approved ? 'Tâche validée par ' + (role === ROLES.CLIENT ? clientLabel(storeRef.current).toLowerCase() : 'l\'architecte') : 'Tâche refusée — corrections requises',
      notifType: approved ? 'green' : 'orange',
    })
    return true
  }, [store.user, store.projectMembers, updateStore, log, emitEvent, showToast])

  // Créer une décision (côté pro/architecte, visible par le client)
  const createDecision = useCallback((data) => {
    // Guard: seuls PRO_ADMIN ou ARCHITECTE peuvent créer une décision
    const role = data.projectId
      ? getProjectRole(store.user?.id, data.projectId, store.projectMembers, store.user)
      : (store.user?.type === 'pro' ? ROLES.PRO_ADMIN : null)
    if (!isAllowed(role, 'create_decision')) {
      showToast('Vous n\'êtes pas autorisé à créer une décision', 'orange')
      return null
    }
    const decision = {
      id: 'dec_' + Date.now(),
      projectId: data.projectId || null,
      titre: data.titre || data.title || '',
      desc: data.desc || data.description || '',
      urgent: data.urgent || false,
      statut: 'pending',
      visibility: data.visibility || 'client_visible',
      // Source métier — lien vers l'objet déclencheur
      sourceType: data.sourceType || null,
      sourceId: data.sourceId || null,
      deadline: data.deadline || null,
      decisionType: data.decisionType || 'validation',
      // ═══ ACTEUR ═══
      createdBy: store.user?.id || null,
      createdByRole: role,
      createdByName: store.user?.name || '',
      targetRole: ROLES.CLIENT,
      createdAt: new Date().toISOString(),
    }
    updateStore(prev => ({ ...prev, decisions: [...(prev.decisions || []), decision] }))
    sync(api.decisions.create({ titre: decision.titre, desc: decision.desc, statut: decision.statut, urgent: decision.urgent, projectId: decision.projectId, visibility: decision.visibility }))
    log('DECISION_CREATED', { title: decision.titre, projectId: decision.projectId, createdByRole: role })
    emitEvent('decision_created', { title: decision.titre, projectId: decision.projectId }, {
      notifMsg: `Décision requise : ${decision.titre}`,
      notifType: 'orange',
      toast: 'Décision envoyée'
    })
    return decision
  }, [store.user, store.projectMembers, updateStore, log, emitEvent, showToast])

  // Client valide/refuse une décision
  const respondDecision = useCallback((decisionId, response) => {
    // Guard: seul le client peut répondre à une décision
    if (!isAllowed(store.user?.type === 'client' ? ROLES.CLIENT : null, 'respond_decision')) {
      showToast('Seul le maître d\'ouvrage peut répondre à une décision', 'orange')
      return
    }
    // response = 'approved' | 'rejected' | 'info_requested'
    updateStore(prev => ({
      ...prev,
      decisions: (prev.decisions || []).map(d =>
        d.id === decisionId ? {
          ...d, statut: response,
          respondedBy: prev.user?.id || null,
          respondedByRole: ROLES.CLIENT,
          respondedAt: new Date().toISOString(),
        } : d
      )
    }))
    sync(api.decisions.update(decisionId, { statut: response }))
    const label = response === 'approved' ? 'validée' : response === 'rejected' ? 'refusée' : 'info demandée'
    log('DECISION_' + response.toUpperCase(), { decisionId, respondedByRole: ROLES.CLIENT })
    emitEvent('decision_' + response, { decisionId }, {
      notifMsg: `Décision ${label}`,
      notifType: response === 'approved' ? 'green' : 'orange',
      toast: `Décision ${label}`
    })
  }, [store.user, updateStore, log, emitEvent, showToast])

  // Demande de paiement (prestataire → client)
  const requestPayment = useCallback((data) => {
    // Guard: seuls les prestataires peuvent demander un paiement
    const role = data.projectId
      ? getProjectRole(store.user?.id, data.projectId, store.projectMembers, store.user)
      : null
    if (!isAllowed(role, 'request_payment') && store.user?.type !== 'pro') {
      showToast('Vous n\'êtes pas autorisé à demander un paiement', 'orange')
      return null
    }
    const req = {
      id: 'payreq_' + Date.now(),
      projectId: data.projectId,
      marketId: data.marketId || null,
      amount: data.amount || 0,
      label: data.label || 'Demande de paiement',
      paymentType: data.paymentType || 'paiement', // 'appel_de_fonds' | 'paiement' | 'acompte'
      statut: 'pending',
      visibility: 'client_visible',
      // ═══ ACTEURS ═══
      createdBy: store.user?.id || null,
      createdByRole: role,
      createdByName: store.user?.name || store.onboardingData?.entreprise || '',
      targetRole: ROLES.CLIENT, // Le client doit approuver
      createdAt: new Date().toISOString(),
    }
    updateStore(prev => ({
      ...prev,
      paymentRequests: [...(prev.paymentRequests || []), req]
    }))
    log('PAYMENT_REQUESTED', { amount: req.amount, projectId: req.projectId, createdByRole: role, paymentType: req.paymentType })
    emitEvent('payment_requested', { amount: req.amount, projectId: req.projectId }, {
      notifMsg: `Demande de paiement : ${formatAmount(req.amount)}`,
      notifType: 'blue',
      toast: 'Demande de paiement envoyée'
    })
    return req
  }, [store.user, store.projectMembers, store.onboardingData, updateStore, log, emitEvent, showToast])

  // Client approuve/rejette un paiement
  const respondPayment = useCallback((requestId, response) => {
    updateStore(prev => {
      const req = (prev.paymentRequests || []).find(r => r.id === requestId)
      const updatedRequests = (prev.paymentRequests || []).map(r =>
        r.id === requestId ? {
          ...r, statut: response,
          respondedBy: prev.user?.id || null,
          respondedByRole: prev.user?.type === 'client' ? ROLES.CLIENT : null,
          respondedAt: new Date().toISOString(),
        } : r
      )
      // Si approuvé, créer automatiquement une transaction avec acteurs identifiés
      let newTx = prev.transactions || []
      if (response === 'approved' && req) {
        newTx = [...newTx, {
          id: 'tx_' + Date.now(),
          type: 'credit',
          paymentType: req.paymentType || 'paiement',
          label: req.label || 'Paiement client',
          montant: req.amount || 0,
          amount: req.amount || 0,
          date: new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }),
          provider: 'client',
          statut: 'confirmed',
          projet: req.projectId,
          projectId: req.projectId,
          marketId: req.marketId || null,
          paymentRequestId: req.id,
          // ═══ ACTEURS FINANCIERS ═══
          fromUserId: prev.user?.id || null,  // Le client qui paie
          fromRole: ROLES.CLIENT,
          toUserId: req.createdBy || null,     // Le prestataire qui reçoit
          toRole: req.createdByRole || null,
          approvedBy: prev.user?.id || null,
          visibility: 'client_visible',
          createdAt: new Date().toISOString(),
        }]
      }
      return { ...prev, paymentRequests: updatedRequests, transactions: newTx }
    })
    const label = response === 'approved' ? 'approuvé' : 'refusé'
    log('PAYMENT_' + response.toUpperCase(), { requestId, respondedByRole: store.user?.type })
    emitEvent('payment_' + response, { requestId }, {
      notifMsg: `Paiement ${label}`,
      notifType: response === 'approved' ? 'green' : 'orange',
      toast: `Paiement ${label}`
    })
  }, [store.user, updateStore, log, emitEvent])

  // Partager un document avec le client
  const shareDocumentWithClient = useCallback((docId) => {
    updateStore(prev => ({
      ...prev,
      documents: (prev.documents || []).map(d =>
        d.id === docId ? { ...d, visibility: 'client_visible' } : d
      )
    }))
    emitEvent('document_shared_with_client', { docId }, {
      notifMsg: 'Document partagé',
      notifType: 'info'
    })
  }, [updateStore, emitEvent])

  // Ajouter une photo de chantier
  const addChantierPhoto = useCallback((data) => {
    const photo = {
      id: 'photo_' + Date.now(),
      projectId: data.projectId,
      url: data.url,
      caption: data.caption || '',
      date: new Date().toISOString(),
      visibility: data.visibility || 'client_visible',
    }
    updateStore(prev => ({
      ...prev,
      photos: [...(prev.photos || []), photo]
    }))
    sync(api.photos.create({ url: photo.url, caption: photo.caption, projectId: photo.projectId, userId: storeRef.current.user?.id || null }))
    if (photo.visibility === 'client_visible') {
      emitEvent('photo_added', { projectId: photo.projectId }, {
        notifMsg: 'Nouvelle photo de chantier ajoutée'
      })
    }
    return photo
  }, [updateStore, emitEvent])

  // ═══ FINTECH METHODS ═══
  const createPaymentOrder = useCallback((data) => {
    const order = {
      id: 'po_' + Date.now(),
      type: data.type || 'marche',
      projectId: data.projectId || null,
      marketId: data.marketId || null,
      orderId: data.orderId || null,
      milestoneId: data.milestoneId || null,
      payerId: data.payerId || store.user?.id || null,
      beneficiaryId: data.beneficiaryId || null,
      railRecommended: data.railRecommended || 'carte',
      railUsed: data.railUsed || null,
      amountGross: data.amount || 0,
      currency: 'XOF',
      pspFeesEstimated: Math.round((data.amount || 0) * 0.015),
      meereoCommission: data.commission || 0,
      status: 'PAY_INIT',
      createdAt: new Date().toISOString(),
    }
    updateStore(prev => ({
      ...prev,
      paymentOrders: [...(prev.paymentOrders || []), order],
      ledgerEntries: [...(prev.ledgerEntries || []), {
        id: 'le_' + Date.now(),
        paymentOrderId: order.id,
        entryType: 'credit',
        amount: order.amountGross,
        createdAt: order.createdAt,
        description: 'Ordre de paiement créé — ' + (data.label || order.type),
      }],
    }))
    addNotif('Ordre de paiement créé — ' + (data.label || order.amountGross.toLocaleString() + ' FCFA'), 'blue', null, 'finance')
    return order
  }, [store.user, updateStore, addNotif])

  const updatePaymentStatus = useCallback((orderId, newStatus, meta = {}) => {
    updateStore(prev => {
      const order = (prev.paymentOrders || []).find(o => o.id === orderId)
      if (!order) return prev
      const now = new Date().toISOString()
      const updatedOrders = (prev.paymentOrders || []).map(o =>
        o.id === orderId ? { ...o, status: newStatus, ...(newStatus === 'FUNDS_CONFIRMED' ? { confirmedAt: now, amountConfirmed: o.amountGross } : {}), ...(newStatus === 'PAYOUT_DONE' ? { payoutDoneAt: now, amountReleased: o.amountGross - o.meereoCommission } : {}), ...(newStatus === 'DISPUTE_OPEN' ? { disputeReason: meta.reason || '' } : {}), ...meta } : o
      )
      const newEntry = {
        id: 'le_' + Date.now(),
        paymentOrderId: orderId,
        entryType: newStatus === 'REVERSED' ? 'reverse' : newStatus === 'PAYOUT_DONE' ? 'release' : newStatus === 'HELD_FOR_MILESTONE' ? 'hold' : newStatus === 'DISPUTE_OPEN' ? 'hold' : 'credit',
        amount: order.amountGross,
        createdAt: now,
        description: 'Statut → ' + newStatus,
      }
      // Auto-generate commission on PAYOUT_DONE
      let newCommissions = prev.commissions || []
      if (newStatus === 'PAYOUT_DONE' && order.meereoCommission > 0) {
        const commType = order.type === 'commande' ? 'marketplace' : order.type === 'marche' ? 'services' : 'orchestration'
        newCommissions = [...newCommissions, {
          id: 'com_' + Date.now(),
          type: commType,
          linkedObjectId: orderId,
          linkedObjectType: order.type,
          rate: commType === 'marketplace' ? 0.08 : commType === 'services' ? 0.05 : 0.01,
          baseAmount: order.amountGross,
          commissionAmount: order.meereoCommission,
          status: 'calculated',
          createdAt: now,
        }]
      }
      return { ...prev, paymentOrders: updatedOrders, ledgerEntries: [...(prev.ledgerEntries || []), newEntry], commissions: newCommissions }
    })
  }, [updateStore])

  const openDispute = useCallback((orderId, reason) => {
    const now = new Date().toISOString()
    updateStore(prev => {
      const dispute = {
        id: 'disp_' + Date.now(),
        paymentOrderId: orderId,
        openedBy: prev.user?.id || 'unknown',
        reason: reason || 'Contestation',
        status: 'open',
        createdAt: now,
        impactedPayouts: (prev.paymentOrders || []).filter(o => o.status === 'PAYOUT_REQUESTED' && o.projectId === ((prev.paymentOrders || []).find(x => x.id === orderId)?.projectId)).map(o => o.id),
      }
      const updatedOrders = (prev.paymentOrders || []).map(o =>
        o.id === orderId ? { ...o, status: 'DISPUTE_OPEN', disputeReason: reason } : o
      )
      return { ...prev, disputeCases: [...(prev.disputeCases || []), dispute], paymentOrders: updatedOrders }
    })
    addNotif('Litige ouvert — libérations gelées', 'orange', null, 'finance')
  }, [updateStore, addNotif])

  const resolveDispute = useCallback((disputeId, resolution, inFavorOf) => {
    updateStore(prev => {
      const dispute = (prev.disputeCases || []).find(d => d.id === disputeId)
      if (!dispute) return prev
      const newStatus = inFavorOf === 'beneficiary' ? 'PAYOUT_DONE' : 'REVERSED'
      const updatedDisputes = (prev.disputeCases || []).map(d =>
        d.id === disputeId ? { ...d, status: 'resolved', resolution, resolvedAt: new Date().toISOString() } : d
      )
      const updatedOrders = (prev.paymentOrders || []).map(o =>
        o.id === dispute.paymentOrderId ? { ...o, status: newStatus } : o
      )
      return { ...prev, disputeCases: updatedDisputes, paymentOrders: updatedOrders }
    })
    addNotif('Litige résolu — ' + (inFavorOf === 'beneficiary' ? 'fonds libérés' : 'fonds remboursés'), 'green', null, 'finance')
  }, [updateStore, addNotif])

  const uploadProof = useCallback((data) => {
    const proof = {
      id: 'proof_' + Date.now(),
      payoutRequestId: data.payoutRequestId || data.paymentOrderId,
      type: data.type || 'autre',
      fileUrl: data.fileUrl || data.url || '',
      uploadedBy: store.user?.id || 'unknown',
      uploadedAt: new Date().toISOString(),
      verified: false,
    }
    updateStore(prev => ({ ...prev, proofDocuments: [...(prev.proofDocuments || []), proof] }))
    return proof
  }, [store.user, updateStore])

  const trackKaiUsage = useCallback((action, role = 'pro') => {
    const period = new Date().toISOString().slice(0, 7)
    updateStore(prev => {
      const allEnt = prev.kaiEntitlement || {}
      const ent = allEnt[role] || { tier: 'standard', quotaLimit: 25, quotaUsed: 0 }
      const isGold = ent.tier === 'gold' && ent.goldEndDate && new Date(ent.goldEndDate) > new Date()
      const newUsed = isGold ? ent.quotaUsed : (ent.quotaUsed || 0) + 1
      return {
        ...prev,
        kaiUsage: [...(prev.kaiUsage || []), { id: 'ku_' + Date.now(), userId: prev.user?.id, action, role, tier: isGold ? 'gold' : 'standard', createdAt: new Date().toISOString(), quotaPeriod: period }],
        kaiEntitlement: { ...allEnt, [role]: { ...ent, quotaUsed: newUsed } },
      }
    })
  }, [updateStore])

  const upgradeToGold = useCallback((role) => {
    const activeRole = role || store.user?.type || 'pro'
    const now = new Date()
    const end = new Date(now)
    end.setMonth(end.getMonth() + 1)
    const goldData = {
      tier: 'gold',
      goldStartDate: now.toISOString(),
      goldEndDate: end.toISOString(),
    }
    // Persister côté serveur
    api.kai.updateEntitlement(activeRole, goldData).catch(() => {})
    // Optimistic update
    updateStore(prev => {
      const allEnt = prev.kaiEntitlement || {}
      return {
        ...prev,
        kaiEntitlement: {
          ...allEnt,
          [activeRole]: { ...(allEnt[activeRole] || { quotaLimit: 25, quotaUsed: 0 }), ...goldData },
        },
      }
    })
    const labels = { pro: 'Professionnel', client: 'Client', fournisseur: 'Fournisseur' }
    addNotif('KAI Pro activé — Espace ' + (labels[activeRole] || activeRole), 'green', null, 'parametres')
    showToast('KAI Pro activé', 'green')
  }, [store.user, updateStore, addNotif, showToast])

  // ═══ COMMISSION WORKFLOW (clé en main uniquement) ═══
  const { isCleEnMain: _isCEM, calculateCommission: _calcComm, INTRO_STATUS: _IS, COMMISSION_STATUS: _CS } = (() => {
    try { return require('../domain/commission') } catch { return {} }
  })()

  // Créer une introduction (mise en relation MEEREO → structure)
  const createIntroduction = useCallback((data) => {
    // Guard: uniquement en mode clé en main
    if (!_isCEM || !_isCEM(storeRef.current)) return null
    const intro = {
      id: 'intro_' + Date.now(),
      projectId: data.projectId || null,
      clientId: data.clientId || storeRef.current.user?.id || null,
      structureId: data.structureId || null,
      structureName: data.structureName || '',
      metier: data.metier || '',
      status: _IS?.INTRODUCED || 'introduced',
      introDate: new Date().toISOString(),
      retainedAt: null,
      source: 'meereo_cle_en_main',
    }
    updateStore(prev => ({ ...prev, introductions: [...(prev.introductions || []), intro] }))
    log('INTRO_CREATED', { structureName: intro.structureName, projectId: intro.projectId })
    return intro
  }, [updateStore, log])

  // Retenir une structure → déclenche la commission
  const retainStructure = useCallback((introductionId, montantBase) => {
    if (!_isCEM || !_isCEM(storeRef.current)) return null
    let commission = null
    updateStore(prev => {
      const intro = (prev.introductions || []).find(i => i.id === introductionId)
      if (!intro) return prev
      const calc = _calcComm ? _calcComm(montantBase) : { base: montantBase || 0, rate: 0.05, amount: Math.round((montantBase || 0) * 0.05) }
      commission = {
        id: 'comm_' + Date.now(),
        introductionId,
        structureId: intro.structureId,
        structureName: intro.structureName,
        projectId: intro.projectId,
        clientId: intro.clientId,
        montantBase: calc.base,
        montantCommission: calc.amount,
        rate: calc.rate,
        status: _CS?.DUE || 'due',
        createdAt: new Date().toISOString(),
        paidAt: null,
      }
      return {
        ...prev,
        introductions: (prev.introductions || []).map(i => i.id === introductionId ? { ...i, status: _IS?.RETAINED || 'retained', retainedAt: new Date().toISOString() } : i),
        commissions: [...(prev.commissions || []), commission],
      }
    })
    if (commission) {
      log('COMMISSION_CREATED', { structureName: commission.structureName, amount: commission.montantCommission })
      addNotif('Commission MEEREO : ' + (commission.montantCommission || 0).toLocaleString('fr-FR') + ' FCFA', 'blue', null, 'parametres')
    }
    return commission
  }, [updateStore, log, addNotif])

  // Mettre à jour le statut d'une commission
  const updateCommissionStatus = useCallback((commissionId, newStatus) => {
    updateStore(prev => ({
      ...prev,
      commissions: (prev.commissions || []).map(c => c.id === commissionId ? { ...c, status: newStatus, ...(newStatus === 'paid' ? { paidAt: new Date().toISOString() } : {}) } : c),
    }))
    log('COMMISSION_STATUS_CHANGED', { commissionId, newStatus })
  }, [updateStore, log])

  // Accepter les CGV commission (côté pro)
  const acceptCommissionTerms = useCallback(() => {
    const userId = storeRef.current.user?.id
    if (!userId) return
    const updated = [...(storeRef.current.commissionAcceptances || []), { userId, acceptedAt: new Date().toISOString() }]
    updateStore(prev => ({
      ...prev,
      commissionAcceptances: updated,
    }))
    // Persister en DB dans les préférences utilisateur
    api.usersApi.updatePrefs({ commissionAcceptances: updated }).catch(() => {})
    log('COMMISSION_TERMS_ACCEPTED', { userId })
    showToast('Conditions de mise en relation acceptées', 'green')
  }, [updateStore, log, showToast])

  // Vérifier si un pro a accepté les CGV
  const hasAcceptedCommissionTerms = useCallback((userId) => {
    return (storeRef.current.commissionAcceptances || []).some(a => a.userId === (userId || storeRef.current.user?.id))
  }, [])

  const value = {
    store,
    updateStore,
    toasts,
    showToast,
    notifOpen,
    setNotifOpen,
    log,
    addNotif,
    markNotifRead,
    markNotifsRead,
    createUser,
    loginUser,
    createOrganization,
    addMemberToOrg,
    createProject,
    deleteProject,
    archiveProject,
    unarchiveProject,
    updateProject,
    inviteClientToProject,
    respondProjectInvitation,
    requestCloture,
    respondCloture,
    createAO,
    submitOffer,
    acceptOffer,
    rejectOffer,
    triggerPayment,
    confirmPayment,
    uploadDocument,
    addProduct,
    updateMarketProgress,
    resetStore,
    // Sync methods
    emitEvent,
    updateProjectEtapes,
    saveTaskStates,
    createDecision,
    respondDecision,
    requestPayment,
    respondPayment,
    shareDocumentWithClient,
    addChantierPhoto,
    // Fintech
    createPaymentOrder,
    updatePaymentStatus,
    openDispute,
    resolveDispute,
    uploadProof,
    trackKaiUsage,
    upgradeToGold,
    sendAOInvitation,
    deleteAO,
    updateAO,
    archiveAO,
    // Multi-acteurs V2
    addProjectMember,
    removeProjectMember,
    getProjectMembers,
    validateTask,
    // Commission workflow (clé en main)
    createIntroduction,
    retainStructure,
    updateCommissionStatus,
    acceptCommissionTerms,
    hasAcceptedCommissionTerms,
    logoutUser,
  }

  return <MeereoContext.Provider value={value}>{children}</MeereoContext.Provider>
}

export function useMeereo() {
  const ctx = useContext(MeereoContext)
  if (!ctx) throw new Error('useMeereo must be used within MeereoProvider')
  return ctx
}

export function formatAmount(val) {
  if (!val) return '0 FCFA'
  const n = parseFloat(val)
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'Mds FCFA'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M FCFA'
  if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K FCFA'
  return n.toLocaleString('fr-FR') + ' FCFA'
}

export function formatDate(iso) {
  if (!iso) return '\u2014'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch (e) { return iso }
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
}
