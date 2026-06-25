/**
 * MEEREO API Client
 *
 * auth.*  → appels HTTP réels vers le backend Express / PostgreSQL
 * tout le reste → mock localStorage (inchangé jusqu'à la migration)
 */

// ─── Backend HTTP (auth uniquement) ──────────────────────────────────────────

// En développement (Vite), VITE_API_URL=/api → proxy Vite → pas de CORS
// En production, pointer vers l'URL réelle du backend
const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL)
    ? import.meta.env.VITE_API_URL
    : '/api'  // fallback proxy (Vite dev server)

// Token JWT gardé en mémoire + sessionStorage pour survivre aux rafraîchissements de page.
// sessionStorage est vidé à la fermeture de l'onglet (pas de persistance entre sessions).
let _inMemoryToken = null

const SESSION_TOKEN_KEY = 'meereo_session_token'

/** Appelé par useMeereoStore après login/hydration pour mettre le token en mémoire. */
export function setInMemoryToken(token) {
  _inMemoryToken = token || null
  try {
    if (token) {
      sessionStorage.setItem(SESSION_TOKEN_KEY, token)
    } else {
      sessionStorage.removeItem(SESSION_TOKEN_KEY)
    }
  } catch { /* sessionStorage non disponible */ }
}

/**
 * Retourne le JWT courant — mémoire en priorité, puis sessionStorage (après refresh).
 * @returns {string|null}
 */
function getStoredToken() {
  if (_inMemoryToken) return _inMemoryToken
  try { return sessionStorage.getItem(SESSION_TOKEN_KEY) || null } catch { return null }
}

/**
 * Effectue un appel HTTP vers le backend.
 * Lance une Error avec err.message = message retourné par le serveur.
 *
 * @param {string} path       - Chemin sans la base, ex: '/auth/login'
 * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} method
 * @param {object|null} body
 * @param {boolean} withAuth  - Inclure le JWT dans les headers
 * @returns {Promise<any>}
 */
async function apiFetch(path, method = 'GET', body = null, withAuth = false) {
  const headers = { 'Content-Type': 'application/json' }
  if (withAuth) {
    // Envoyer aussi le Bearer token pour la rétrocompatibilité
    // (le cookie httpOnly est envoyé automatiquement via credentials: 'include')
    const token = getStoredToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',   // envoie le cookie httpOnly meereo_token automatiquement
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg = data?.error || data?.message || `Erreur ${res.status}`
    const err = new Error(msg)
    err.status = res.status
    err.errors = data?.errors || null
    throw err
  }

  return data
}

/**
 * Effectue un appel multipart/form-data vers le backend (pour les uploads de fichiers).
 * Ne pose pas de Content-Type — le browser le fait automatiquement avec le boundary.
 */
async function apiFetchForm(path, method = 'POST', formData) {
  const headers = {}
  const token = getStoredToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: formData,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const msg = data?.error || data?.message || `Erreur ${res.status}`
    const err = new Error(msg)
    err.status = res.status
    throw err
  }

  return data
}

// ─── DB helpers (mock localStorage) ──────────────────────────────────────────

const DB_KEY = 'meereo_mock_db'

function getDb() {
  try { return JSON.parse(localStorage.getItem(DB_KEY) || '{}') } catch { return {} }
}

function saveDb(db) {
  try { localStorage.setItem(DB_KEY, JSON.stringify(db)) } catch {}
}

function getTable(name) {
  return getDb()[name] || []
}

function saveTable(name, rows) {
  const db = getDb()
  db[name] = rows
  saveDb(db)
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function now() {
  return new Date().toISOString()
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

function makeToken(userId, type) {
  return btoa(JSON.stringify({ userId, type, exp: Date.now() + 30 * 24 * 3600 * 1000 }))
}

function parseToken(token) {
  try { return JSON.parse(atob(token)) } catch { return null }
}

function getCurrentUserId() {
  // Token is now in-memory only (never stored in localStorage).
  // This function is kept as a stub for legacy compatibility.
  return null
}

function userPublic(u) {
  const { password: _, ...pub } = u
  return pub
}

// ─── Generic CRUD factory ────────────────────────────────────────────────────

function createEntityApi(table) {
  return {
    getAll: async () => getTable(table),

    getById: async (id) => {
      const row = getTable(table).find(r => r.id === id)
      if (!row) throw new Error('Not found')
      return row
    },

    create: async (data) => {
      const rows = getTable(table)
      const row = { id: uid(), createdAt: now(), updatedAt: now(), ...data }
      rows.push(row)
      saveTable(table, rows)
      return row
    },

    update: async (id, data) => {
      const rows = getTable(table)
      const idx = rows.findIndex(r => r.id === id)
      if (idx === -1) throw new Error('Not found')
      rows[idx] = { ...rows[idx], ...data, updatedAt: now() }
      saveTable(table, rows)
      return rows[idx]
    },

    delete: async (id) => {
      const rows = getTable(table).filter(r => r.id !== id)
      saveTable(table, rows)
      return null
    },
  }
}

// ─── Auth — appels HTTP réels vers le backend ─────────────────────────────────

const auth = {
  /**
   * Inscription — crée le compte + profil selon le type.
   * Payload : { email, password, name, type, ...profilComplet }
   * Réponse : { user, token }
   */
  register: async (data) => {
    return apiFetch('/auth/register', 'POST', data)
  },

  /**
   * Connexion — authentifie email + mot de passe.
   * Payload : { email, password }
   * Réponse : { user, token }
   */
  login: async (data) => {
    return apiFetch('/auth/login', 'POST', data)
  },

  /**
   * Profil courant — vérifie le JWT et retourne le user.
   * Réponse : { id, email, name, type, ... }
   */
  me: async () => {
    return apiFetch('/auth/me', 'GET', null, true)
  },

  /**
   * Suppression de compte (soft-delete).
   */
  deleteAccount: async (password) => {
    return apiFetch('/auth/account', 'DELETE', { password }, true)
  },

  /**
   * Déconnexion — supprime le cookie httpOnly côté serveur.
   */
  logout: async () => {
    return apiFetch('/auth/logout', 'POST', null, false).catch(() => {})
  },

  /**
   * Envoi d'un email de vérification.
   */
  sendVerification: async () => {
    return apiFetch('/auth/send-verification', 'POST', null, true)
  },

  /**
   * Vérifie l'email de l'utilisateur connecté.
   * (requireAuth côté backend — le token est envoyé automatiquement via cookie/Bearer)
   */
  verifyEmail: async () => {
    return apiFetch('/auth/verify-email', 'POST', {}, true)
  },

  /**
   * Changement de mot de passe (utilisateur connecté).
   * Payload : { currentPassword, newPassword, confirmPassword }
   */
  changePassword: async (data) => {
    return apiFetch('/auth/change-password', 'POST', data, true)
  },

  /**
   * Demande de réinitialisation de mot de passe.
   * Payload : { email }
   */
  forgotPassword: async (email) => {
    return apiFetch('/auth/forgot-password', 'POST', { email })
  },

  /**
   * Réinitialisation du mot de passe via le token du mail.
   * Payload : { token, newPassword, confirmPassword }
   */
  resetPassword: async (data) => {
    return apiFetch('/auth/reset-password', 'POST', data)
  },
}

// ─── File upload — store base64 as-is ────────────────────────────────────────

const upload = {
  file: async (base64) => ({ url: base64, objectName: uid(), size: base64.length }),
  delete: async () => null,
}

// ─── Professionals directory ──────────────────────────────────────────────────

const professionals = {
  getAll: async (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v))).toString()
    return apiFetch(`/users/pros${qs ? '?' + qs : ''}`, 'GET', null, true)
  },
  search: async (q, metier) => professionals.getAll({ q, metier }),
}

// ─── Marketplace categories (static) ─────────────────────────────────────────

const MARKETPLACE_CATS = [
  { id: 'all',            slug: 'all',            label: 'Tout',                  ico: '🏪', order: 0  },
  { id: 'gros-oeuvre',    slug: 'gros-oeuvre',    label: 'Gros Oeuvre',           ico: '🏗️', order: 1  },
  { id: 'structure',      slug: 'structure',      label: 'Structure & Charpente', ico: '🔩', order: 2  },
  { id: 'menuiseries',    slug: 'menuiseries',    label: 'Menuiseries',           ico: '🪟', order: 3  },
  { id: 'revetements',    slug: 'revetements',    label: 'Revêtements',           ico: '🪨', order: 4  },
  { id: 'plomberie-cvc',  slug: 'plomberie-cvc',  label: 'Plomberie & CVC',       ico: '🚿', order: 5  },
  { id: 'electricite',    slug: 'electricite',    label: 'Electricité',           ico: '⚡', order: 6  },
  { id: 'green',          slug: 'green',          label: 'Green & Energie',       ico: '☀️', order: 7  },
  { id: 'mobilier',       slug: 'mobilier',       label: 'Mobilier Bureau',       ico: '💼', order: 8  },
  { id: 'mobilier-maison',slug: 'mobilier-maison',label: 'Mobilier Maison',       ico: '🛋️', order: 9  },
  { id: 'cuisine',        slug: 'cuisine',        label: 'Cuisine & SDB',         ico: '🍳', order: 10 },
  { id: 'exterieur',      slug: 'exterieur',      label: 'Extérieur & Jardin',    ico: '🌳', order: 11 },
]

const marketplace = {
  getCategories: async () => MARKETPLACE_CATS,
}

// ─── Integrations (static) ───────────────────────────────────────────────────

const INTEGRATIONS = [
  { id: 'int1',  nom: 'Autodesk Revit',    desc: 'Synchronisation BIM & maquette numérique', cat: 'BIM',           logo: 'https://img.icons8.com/color/96/autodesk-revit.png' },
  { id: 'int7',  nom: 'ArchiCAD',          desc: 'Export plans DWG & IFC',                   cat: 'BIM',           logo: 'https://img.icons8.com/color/96/archicad.png' },
  { id: 'int2',  nom: 'Google Drive',      desc: 'Stockage & partage documents',              cat: 'Stockage',      logo: 'https://img.icons8.com/color/96/google-drive.png' },
  { id: 'int10', nom: 'Dropbox',           desc: 'Sauvegarde automatique',                    cat: 'Stockage',      logo: 'https://img.icons8.com/color/96/dropbox.png' },
  { id: 'int3',  nom: 'Slack',             desc: 'Notifications équipe en temps réel',        cat: 'Communication', logo: 'https://img.icons8.com/color/96/slack-new.png' },
  { id: 'int8',  nom: 'WhatsApp Business', desc: 'Communication client & prestataires',       cat: 'Communication', logo: 'https://img.icons8.com/color/96/whatsapp.png' },
  { id: 'int4',  nom: 'MS Project',        desc: 'Planning Gantt & suivi',                    cat: 'Planning',      logo: 'https://img.icons8.com/color/96/ms-project.png' },
  { id: 'int5',  nom: 'Wave',              desc: 'Paiements mobile money',                    cat: 'Paiements',     logo: 'https://img.icons8.com/color/96/wave.png' },
  { id: 'int6',  nom: 'Orange Money',      desc: 'Mobile money CI',                           cat: 'Paiements',     logo: 'https://img.icons8.com/color/96/orange.png' },
  { id: 'int9',  nom: 'Sage Comptabilité', desc: 'Export comptable automatique',              cat: 'Finance',       logo: 'https://img.icons8.com/color/96/sage.png' },
]

const integrations = {
  getAll: async () => INTEGRATIONS,
}

// ─── Finance (localStorage) ───────────────────────────────────────────────────

const finance = {
  getBudgets:         async (p) => getTable('fin_budgets').filter(r => !p?.projectId || r.projectId === p.projectId),
  createBudget:       async (d) => { const r = { id: uid(), createdAt: now(), ...d }; const t = getTable('fin_budgets'); t.push(r); saveTable('fin_budgets', t); return r },
  updateBudget:       async (id, d) => { const t = getTable('fin_budgets').map(r => r.id === id ? { ...r, ...d } : r); saveTable('fin_budgets', t); return t.find(r => r.id === id) },
  deleteBudget:       async (id) => { saveTable('fin_budgets', getTable('fin_budgets').filter(r => r.id !== id)); return null },
  getExpenses:        async (p) => getTable('fin_expenses').filter(r => !p?.projectId || r.projectId === p.projectId),
  createExpense:      async (d) => { const r = { id: uid(), createdAt: now(), ...d }; const t = getTable('fin_expenses'); t.push(r); saveTable('fin_expenses', t); return r },
  updateExpense:      async (id, d) => { const t = getTable('fin_expenses').map(r => r.id === id ? { ...r, ...d } : r); saveTable('fin_expenses', t); return t.find(r => r.id === id) },
  deleteExpense:      async (id) => { saveTable('fin_expenses', getTable('fin_expenses').filter(r => r.id !== id)); return null },
  getInvoices:        async (p) => getTable('fin_invoices').filter(r => !p?.projectId || r.projectId === p.projectId),
  createInvoice:      async (d) => { const r = { id: uid(), createdAt: now(), ...d }; const t = getTable('fin_invoices'); t.push(r); saveTable('fin_invoices', t); return r },
  updateInvoice:      async (id, d) => { const t = getTable('fin_invoices').map(r => r.id === id ? { ...r, ...d } : r); saveTable('fin_invoices', t); return t.find(r => r.id === id) },
  patchInvoiceStatus: async (id, statut) => { const t = getTable('fin_invoices').map(r => r.id === id ? { ...r, statut } : r); saveTable('fin_invoices', t); return t.find(r => r.id === id) },
  getReports:         async () => ({ budgets: [], expenses: [], invoices: [], kpis: {} }),
}

// ─── Payments (localStorage) ─────────────────────────────────────────────────

const payments = {
  getPayments:     async (p) => getTable('payments').filter(r => !p?.projectId || r.projectId === p.projectId),
  getPayment:      async (id) => getTable('payments').find(r => r.id === id) || null,
  createPayment:   async (d) => { const r = { id: uid(), createdAt: now(), updatedAt: now(), status: 'PAY_INIT', milestones: [], proofs: [], ...d }; const t = getTable('payments'); t.push(r); saveTable('payments', t); return r },
  updateStatus:    async (id, status, extra = {}) => { const t = getTable('payments').map(r => r.id === id ? { ...r, status, ...extra, updatedAt: now() } : r); saveTable('payments', t); return t.find(r => r.id === id) },
  updateMilestone: async (id, mid, d) => { const t = getTable('payments').map(r => r.id === id ? { ...r, milestones: (r.milestones || []).map(m => m.id === mid ? { ...m, ...d } : m) } : r); saveTable('payments', t); return t.find(r => r.id === id) },
  addProof:        async (id, d) => { const proof = { id: uid(), createdAt: now(), ...d }; const t = getTable('payments').map(r => r.id === id ? { ...r, proofs: [...(r.proofs || []), proof] } : r); saveTable('payments', t); return proof },
  validate:        async (id, d) => { const v = { id: uid(), createdAt: now(), ...d }; const t = getTable('payments').map(r => r.id === id ? { ...r, validations: [...(r.validations || []), v] } : r); saveTable('payments', t); return v },
  getLogs:         async () => [],
}

// ─── KAI API (real HTTP → PostgreSQL) ───────────────────────────────────────

const kai = {
  // ── Entitlements (tier, quota, onboarding) ──
  getEntitlements: () =>
    apiFetch('/kai/entitlements', 'GET', null, true),
  updateEntitlement: (role, data) =>
    apiFetch(`/kai/entitlements/${role}`, 'PATCH', data, true),
  incrementQuota: (role) =>
    apiFetch(`/kai/entitlements/${role}`, 'PATCH', { incrementQuota: true }, true),
  markOnboardingDone: (role) =>
    apiFetch(`/kai/entitlements/${role}`, 'PATCH', { onboardingDone: true }, true),

  // ── Conversations ──
  getConversations: (context) => {
    const qs = context ? `?context=${context}` : ''
    return apiFetch(`/kai/conversations${qs}`, 'GET', null, true)
  },
  saveConversation: (id, data) =>
    apiFetch(`/kai/conversations/${id}`, 'PUT', data, true),
  deleteConversation: (id) =>
    apiFetch(`/kai/conversations/${id}`, 'DELETE', null, true),

  // ── Memory ──
  getMemory: () =>
    apiFetch('/kai/memory', 'GET', null, true),
  saveMemory: (topic, context) =>
    apiFetch('/kai/memory', 'PUT', { topic, context }, true),
}

// ─── Tasks API (real HTTP → PostgreSQL) ──────────────────────────────────────
const tasks = {
  getAll:       (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiFetch(`/tasks${qs ? '?' + qs : ''}`, 'GET', null, true)
  },
  getByProject: (projectId)  => apiFetch(`/tasks?projectId=${encodeURIComponent(projectId)}`, 'GET', null, true),
  getById:      (id)          => apiFetch(`/tasks/${id}`, 'GET', null, true),
  create:       (data)        => apiFetch('/tasks', 'POST', data, true),
  update:       (id, data)    => apiFetch(`/tasks/${id}`, 'PATCH', data, true),
  delete:       (id)          => apiFetch(`/tasks/${id}`, 'DELETE', null, true),
  assignedToMe: (params = {}) => {
    const qs = new URLSearchParams({ ...params, assignedToMe: 'true' }).toString()
    return apiFetch(`/tasks?${qs}`, 'GET', null, true)
  },
  addComment:   (id, comment) => apiFetch(`/tasks/${id}`, 'PATCH', { comment }, true),
}

// ─── Projects API (real HTTP → PostgreSQL) ────────────────────────────────────
const projectsApi = {
  getAll:  ()         => apiFetch('/projects', 'GET', null, true),
  getById: (id)       => apiFetch(`/projects/${id}`, 'GET', null, true),
  create:  (data)     => apiFetch('/projects', 'POST', data, true),
  update:  (id, data) => apiFetch(`/projects/${id}`, 'PATCH', data, true),
  delete:  (id)       => apiFetch(`/projects/${id}`, 'DELETE', null, true),
}

// ─── ProjectMembers API (real HTTP → PostgreSQL) ──────────────────────────────
const projectMembersApi = {
  getAll:  (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiFetch(`/project-members${qs ? '?' + qs : ''}`, 'GET', null, true)
  },
  create:  (data)     => apiFetch('/project-members', 'POST', data, true),
  delete:  (id)       => apiFetch(`/project-members/${id}`, 'DELETE', null, true),
}

// ─── Events API (real HTTP → PostgreSQL) ──────────────────────────────────────
const eventsApi = {
  getAll:  (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiFetch(`/events${qs ? '?' + qs : ''}`, 'GET', null, true)
  },
  getById: (id)       => apiFetch(`/events/${id}`, 'GET', null, true),
  create:  (data)     => apiFetch('/events', 'POST', data, true),
  update:  (id, data) => apiFetch(`/events/${id}`, 'PATCH', data, true),
  delete:  (id)       => apiFetch(`/events/${id}`, 'DELETE', null, true),
}

// ─── Documents API (real HTTP → PostgreSQL) ───────────────────────────────────
const documentsApi = {
  getAll:  (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiFetch(`/documents${qs ? '?' + qs : ''}`, 'GET', null, true)
  },
  getById: (id)       => apiFetch(`/documents/${id}`, 'GET', null, true),
  create:  (data)     => apiFetch('/documents', 'POST', data, true),
  update:  (id, data) => apiFetch(`/documents/${id}`, 'PATCH', data, true),
  delete:  (id)       => apiFetch(`/documents/${id}`, 'DELETE', null, true),
  /** Upload a real File object to the server (saves to /uploads/documents/) */
  upload: (file, { name, type, projectId, isEntreprise } = {}) => {
    const form = new FormData()
    form.append('file', file)
    if (name)         form.append('name',         name)
    if (type)         form.append('type',         type)
    if (projectId)    form.append('projectId',    projectId)
    if (isEntreprise) form.append('isEntreprise', 'true')
    return apiFetchForm('/documents/upload', 'POST', form)
  },
}

// ─── Decisions API (real HTTP → PostgreSQL) ───────────────────────────────────
const decisionsApi = {
  getAll:  (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiFetch(`/decisions${qs ? '?' + qs : ''}`, 'GET', null, true)
  },
  create:  (data)     => apiFetch('/decisions', 'POST', data, true),
  update:  (id, data) => apiFetch(`/decisions/${id}`, 'PATCH', data, true),
  delete:  (id)       => apiFetch(`/decisions/${id}`, 'DELETE', null, true),
}

// ─── Notifications API (real HTTP → PostgreSQL) ───────────────────────────────
const notificationsApi = {
  getAll:   () => apiFetch('/notifications', 'GET', null, true),
  create:   (data) => apiFetch('/notifications', 'POST', data, true),
  markRead: (id)   => apiFetch(`/notifications/${id}/read`, 'PATCH', null, true),
  markAllRead: ()  => apiFetch('/notifications/read-all', 'PATCH', null, true),
}

// ─── Activities API (real HTTP → PostgreSQL) ──────────────────────────────────
const activitiesApi = {
  getAll:  () => apiFetch('/activities', 'GET', null, true),
  create:  (data) => apiFetch('/activities', 'POST', data, true),
}

// ─── Markets API (real HTTP → PostgreSQL) ─────────────────────────────────────
const marketsApi = {
  getAll:  ()        => apiFetch('/markets', 'GET', null, true),
  getById: (id)      => apiFetch(`/markets/${id}`, 'GET', null, true),
  create:  (data)    => apiFetch('/markets', 'POST', data, true),
  update:  (id, data) => apiFetch(`/markets/${id}`, 'PATCH', data, true),
  delete:  (id)      => apiFetch(`/markets/${id}`, 'DELETE', null, true),
}

// ─── Orders API (real HTTP → PostgreSQL) ─────────────────────────────────────
const ordersApi = {
  getAll: () => apiFetch('/orders', 'GET', null, true),
  create: (data) => apiFetch('/orders', 'POST', data, true),
  update: (id, data) => apiFetch(`/orders/${id}`, 'PATCH', data, true),
}

// ─── Export ───────────────────────────────────────────────────────────────────

// ─── AOs API (real HTTP → PostgreSQL) ────────────────────────────────────────
const aosApi = {
  getAll: () => apiFetch('/aos', 'GET', null, true),
  create: (data) => apiFetch('/aos', 'POST', data, true),
  update: (id, data) => apiFetch(`/aos/${id}`, 'PATCH', data, true),
  delete: (id) => apiFetch(`/aos/${id}`, 'DELETE', null, true),
  getById: (id) => apiFetch(`/aos/${id}`, 'GET', null, true),
}

// ─── Offers API (real HTTP → PostgreSQL) ─────────────────────────────────────
const offersApi = {
  getAll: () => apiFetch('/offers', 'GET', null, true),
  create: (data) => apiFetch('/offers', 'POST', data, true),
  update: (id, data) => apiFetch(`/offers/${id}`, 'PATCH', data, true),
}

// ─── Products API (real HTTP → PostgreSQL) ────────────────────────────────────
const productsApi = {
  getAll: () => apiFetch('/products', 'GET'),
  getMine: () => apiFetch('/products/mine', 'GET', null, true),
  create: (data) => apiFetch('/products', 'POST', data, true),
  update: (id, data) => apiFetch(`/products/${id}`, 'PATCH', data, true),
  delete: (id) => apiFetch(`/products/${id}`, 'DELETE', null, true),
}

// ─── Users / Fournisseurs API (real HTTP → PostgreSQL) ───────────────────────
const usersApi = {
  getMe:               () => apiFetch('/auth/me', 'GET', null, true),
  getFournisseurs:     () => apiFetch('/users/fournisseurs', 'GET', null, true),
  getPrefs:            () => apiFetch('/users/me/prefs', 'GET', null, true),
  updatePrefs:         (data) => apiFetch('/users/me/prefs', 'PATCH', data, true),
  getOnboardingData:   () => apiFetch('/users/me/onboarding', 'GET', null, true),
  updateOnboardingData:(data) => apiFetch('/users/me/onboarding', 'PATCH', data, true),
  getProProfile:       (publicId) => apiFetch(`/pro/${publicId}`, 'GET', null, false),
}

// ─── Conversations API (real HTTP → PostgreSQL) ───────────────────────────────
// ─── Contacts API (real HTTP → PostgreSQL) ───────────────────────────────────
const contactsApi = {
  getAll:  (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiFetch(`/contacts${qs ? '?' + qs : ''}`, 'GET', null, true)
  },
  create:  (data)     => apiFetch('/contacts', 'POST', data, true),
  update:  (id, data) => apiFetch(`/contacts/${id}`, 'PATCH', data, true),
  delete:  (id)       => apiFetch(`/contacts/${id}`, 'DELETE', null, true),
}

const conversationsApi = {
  getAll: () => apiFetch('/conversations', 'GET', null, true),
  create: (data) => apiFetch('/conversations', 'POST', data, true),
  getMessages: (id, params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiFetch(`/conversations/${id}/messages${qs ? '?' + qs : ''}`, 'GET', null, true)
  },
  markRead: (id) => apiFetch(`/conversations/${id}/read`, 'PATCH', null, true),
}

export const api = {
  auth,
  upload,
  users:               createEntityApi('users'),
  projects:            projectsApi,
  contacts:            contactsApi,
  clients:             contactsApi,      // alias — filtre par type='client' côté appelant
  intervenants:        contactsApi,      // alias — filtre par type='intervenant' côté appelant
  aos:                 aosApi,
  offers:              offersApi,
  markets:             marketsApi,
  documents:           documentsApi,
  tasks,
  events:              eventsApi,
  decisions:           decisionsApi,
  products:            productsApi,
  commandes:           ordersApi,
  usersApi,
  transactions:        createEntityApi('transactions'),
  notifications:       notificationsApi,
  activities:          activitiesApi,
  conversations:       conversationsApi,
  projectMembers:      projectMembersApi,
  introductions:       createEntityApi('introductions'),
  commissionsTracking: createEntityApi('commissions-tracking'),
  photos:              createEntityApi('photos'),
  professionals,
  marketplace,
  finance,
  payments,
  integrations,
  kai,
}
