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

// ─── Finance (real HTTP → PostgreSQL) ────────────────────────────────────────

const finance = {
  getBudgets:         (p) => {
    const qs = p?.projectId ? `?projectId=${p.projectId}` : ''
    return apiFetch(`/finance/budgets${qs}`, 'GET', null, true)
  },
  createBudget:       (d) => apiFetch('/finance/budgets', 'POST', d, true),
  updateBudget:       (id, d) => apiFetch(`/finance/budgets/${id}`, 'PATCH', d, true),
  deleteBudget:       (id) => apiFetch(`/finance/budgets/${id}`, 'DELETE', null, true),
  getExpenses:        (p) => {
    const qs = p?.projectId ? `?projectId=${p.projectId}` : ''
    return apiFetch(`/finance/expenses${qs}`, 'GET', null, true)
  },
  createExpense:      (d) => apiFetch('/finance/expenses', 'POST', d, true),
  updateExpense:      (id, d) => apiFetch(`/finance/expenses/${id}`, 'PATCH', d, true),
  deleteExpense:      (id) => apiFetch(`/finance/expenses/${id}`, 'DELETE', null, true),
  getInvoices:        (p) => {
    const qs = p?.projectId ? `?projectId=${p.projectId}` : ''
    return apiFetch(`/finance/invoices${qs}`, 'GET', null, true)
  },
  createInvoice:      (d) => apiFetch('/finance/invoices', 'POST', d, true),
  updateInvoice:      (id, d) => apiFetch(`/finance/invoices/${id}`, 'PATCH', d, true),
  patchInvoiceStatus: (id, statut) => apiFetch(`/finance/invoices/${id}`, 'PATCH', { statut }, true),
  getReports:         (projectId) => {
    const qs = projectId ? `?projectId=${projectId}` : ''
    return apiFetch(`/finance/reports${qs}`, 'GET', null, true)
  },
}

// ─── Payments (real HTTP → PostgreSQL) ───────────────────────────────────────

const payments = {
  getPayments:     (p = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(p).filter(([, v]) => v))).toString()
    return apiFetch(`/payments${qs ? '?' + qs : ''}`, 'GET', null, true)
  },
  getPayment:      (id) => apiFetch(`/payments/${id}`, 'GET', null, true),
  createPayment:   (d) => apiFetch('/payments', 'POST', d, true),
  updateStatus:    (id, status) => apiFetch(`/payments/${id}`, 'PATCH', { status }, true),
  updateMilestone: (id, milestoneId, milestoneData) => apiFetch(`/payments/${id}`, 'PATCH', { milestoneId, milestoneData }, true),
  addProof:        (id, d) => apiFetch(`/payments/${id}`, 'PATCH', { addProof: d }, true),
  validate:        (id, d) => apiFetch(`/payments/${id}`, 'PATCH', { addValidation: d }, true),
  getLogs:         (id) => apiFetch(`/payments/${id}/logs`, 'GET', null, true),
  delete:          (id) => apiFetch(`/payments/${id}`, 'DELETE', null, true),
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
  /** Timeline complète du projet (événements, missions, décisions, documents, marchés) */
  getTimeline: (id)   => apiFetch(`/projects/${id}/timeline`, 'GET', null, true),
}

// ─── ProjectMembers API (real HTTP → PostgreSQL) ──────────────────────────────
const projectMembersApi = {
  getAll:  (params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiFetch(`/project-members${qs ? '?' + qs : ''}`, 'GET', null, true)
  },
  create:  (data)     => apiFetch('/project-members', 'POST', data, true),
  respond: (id, accept) => apiFetch(`/project-members/${id}/respond`, 'PATCH', { accept }, true),
  getPending: ()      => apiFetch('/project-members/pending', 'GET', null, true),
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
  upload: (file, { name, type, projectId, isEntreprise, expiresAt, category } = {}) => {
    const form = new FormData()
    form.append('file', file)
    if (name)         form.append('name',         name)
    if (type)         form.append('type',         type)
    if (projectId)    form.append('projectId',    projectId)
    if (isEntreprise) form.append('isEntreprise', 'true')
    if (expiresAt)    form.append('expiresAt',    expiresAt)
    if (category)     form.append('category',     category)
    return apiFetchForm('/documents/upload', 'POST', form)
  },
  /** Get all versions of a document */
  getVersions: (id) => apiFetch(`/documents/${id}/versions`, 'GET', null, true),
  /** Upload a new version of an existing document */
  uploadNewVersion: (id, file, { expiresAt } = {}) => {
    const form = new FormData()
    form.append('file', file)
    if (expiresAt) form.append('expiresAt', expiresAt)
    return apiFetchForm(`/documents/${id}/new-version`, 'POST', form)
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
  delete:    (id)  => apiFetch(`/notifications/${id}`, 'DELETE', null, true),
  deleteAll: ()    => apiFetch('/notifications', 'DELETE', null, true),
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

// ─── Missions API (real HTTP → PostgreSQL) ───────────────────────────────────
const missionsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v))).toString()
    return apiFetch(`/missions${qs ? '?' + qs : ''}`, 'GET', null, true)
  },
  getByProject: (projectId) => apiFetch(`/missions?projectId=${encodeURIComponent(projectId)}`, 'GET', null, true),
  getById: (id)      => apiFetch(`/missions/${id}`, 'GET', null, true),
  create:  (data)    => apiFetch('/missions', 'POST', data, true),
  update:  (id, data) => apiFetch(`/missions/${id}`, 'PATCH', data, true),
  delete:  (id)      => apiFetch(`/missions/${id}`, 'DELETE', null, true),
}

// ─── Orders API (real HTTP → PostgreSQL) ─────────────────────────────────────
const ordersApi = {
  getAll: () => apiFetch('/orders', 'GET', null, true),
  create: (data) => apiFetch('/orders', 'POST', data, true),
  update: (id, data) => apiFetch(`/orders/${id}`, 'PATCH', data, true),
  delete: (id) => apiFetch(`/orders/${id}`, 'DELETE', null, true),
}

// ─── Rapports API (real HTTP → PostgreSQL) ───────────────────────────────────
const rapportsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v))).toString()
    return apiFetch(`/rapports${qs ? '?' + qs : ''}`, 'GET', null, true)
  },
  create: (data)      => apiFetch('/rapports', 'POST', data, true),
  update: (id, data)  => apiFetch(`/rapports/${id}`, 'PATCH', data, true),
  delete: (id)        => apiFetch(`/rapports/${id}`, 'DELETE', null, true),
}

// ─── Transactions API (real HTTP → PostgreSQL) ────────────────────────────────
const transactionsApiHttp = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v))).toString()
    return apiFetch(`/transactions${qs ? '?' + qs : ''}`, 'GET', null, true)
  },
  create: (data)      => apiFetch('/transactions', 'POST', data, true),
  update: (id, data)  => apiFetch(`/transactions/${id}`, 'PATCH', data, true),
  delete: (id)        => apiFetch(`/transactions/${id}`, 'DELETE', null, true),
}

// ─── Introductions API (real HTTP → PostgreSQL) ───────────────────────────────
const introductionsApiHttp = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v))).toString()
    return apiFetch(`/introductions${qs ? '?' + qs : ''}`, 'GET', null, true)
  },
  create: (data)      => apiFetch('/introductions', 'POST', data, true),
  update: (id, data)  => apiFetch(`/introductions/${id}`, 'PATCH', data, true),
}

// ─── Commissions Tracking API (real HTTP → PostgreSQL) ────────────────────────
const commissionsTrackingApiHttp = {
  getAll: ()           => apiFetch('/introductions/commissions', 'GET', null, true),
  create: (data)       => apiFetch('/introductions/commissions', 'POST', data, true),
  update: (id, data)   => apiFetch(`/introductions/commissions/${id}`, 'PATCH', data, true),
}

// ─── Photos API (maps to Documents with type='photo') ────────────────────────
const photosApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams({ ...params, type: 'photo' }).toString()
    return apiFetch(`/documents?${qs}`, 'GET', null, true)
  },
  create: (data) => apiFetch('/documents', 'POST', { ...data, type: 'photo' }, true),
  delete: (id)   => apiFetch(`/documents/${id}`, 'DELETE', null, true),
}

// ─── Export ───────────────────────────────────────────────────────────────────

// ─── AOs API (real HTTP → PostgreSQL) ────────────────────────────────────────
const aosApi = {
  getAll: () => apiFetch('/aos', 'GET', null, true),
  create: (data) => apiFetch('/aos', 'POST', data, true),
  update: (id, data) => apiFetch(`/aos/${id}`, 'PATCH', data, true),
  delete: (id) => apiFetch(`/aos/${id}`, 'DELETE', null, true),
  getById: (id) => apiFetch(`/aos/${id}`, 'GET', null, true),
  /** Récupérer le dossier auto-constitué depuis le référentiel entreprise */
  getDossier: (id) => apiFetch(`/aos/${id}/dossier`, 'GET', null, true),
}

// ─── Offers API (real HTTP → PostgreSQL) ─────────────────────────────────────
const offersApi = {
  getAll: () => apiFetch('/offers', 'GET', null, true),
  create: (data) => apiFetch('/offers', 'POST', data, true),
  update: (id, data) => apiFetch(`/offers/${id}`, 'PATCH', data, true),
  delete: (id) => apiFetch(`/offers/${id}`, 'DELETE', null, true),
  /** Vue comparative des candidatures pour un AO */
  compare: (aoId) => apiFetch(`/offers/compare/${aoId}`, 'GET', null, true),
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
  getMe:               () => apiFetch('/auth/me', 'GET', null, true),  updateMe:            (data) => apiFetch('/users/me', 'PATCH', data, true),  getFournisseurs:     () => apiFetch('/users/fournisseurs', 'GET', null, true),
  getRegistered:       () => apiFetch('/users/registered', 'GET', null, true),
  getPrefs:            () => apiFetch('/users/me/prefs', 'GET', null, true),
  updatePrefs:         (data) => apiFetch('/users/me/prefs', 'PATCH', data, true),
  getOnboardingData:   () => apiFetch('/users/me/onboarding', 'GET', null, true),
  updateOnboardingData:(data) => apiFetch('/users/me/onboarding', 'PATCH', data, true),
  getProProfile:       (publicId) => apiFetch(`/pro/${publicId}`, 'GET', null, false),
  getPageSections:     () => apiFetch('/pro/page-sections/me', 'GET', null, true),
  savePageSections:    (sections) => apiFetch('/pro/page-sections', 'PUT', { sections }, true),
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
  /** Historique unifié projets/AO/marchés/commandes avec un contact */
  getHistory: (id)    => apiFetch(`/contacts/${id}/history`, 'GET', null, true),
  /** Réseau professionnel (graphe de relations) */
  getNetwork: ()      => apiFetch('/contacts/network/graph', 'GET', null, true),
}

const conversationsApi = {
  getAll: () => apiFetch('/conversations', 'GET', null, true),
  create: (data) => apiFetch('/conversations', 'POST', data, true),
  getMessages: (id, params = {}) => {
    const qs = new URLSearchParams(params).toString()
    return apiFetch(`/conversations/${id}/messages${qs ? '?' + qs : ''}`, 'GET', null, true)
  },
  sendMessage: (id, data) => apiFetch(`/conversations/${id}/messages`, 'POST', data, true),
  markRead: (id) => apiFetch(`/conversations/${id}/read`, 'PATCH', null, true),
  addParticipant: (id, userId) => apiFetch(`/conversations/${id}/participants`, 'POST', { userId }, true),
  delete: (id) => apiFetch(`/conversations/${id}`, 'DELETE', null, true),
}

// ─── PaymentRequests API (real HTTP → PostgreSQL) ──────────────────────────────────
const paymentRequestsApi = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([, v]) => v))).toString()
    return apiFetch(`/payment-requests${qs ? '?' + qs : ''}`, 'GET', null, true)
  },
  create: (data)      => apiFetch('/payment-requests', 'POST', data, true),
  update: (id, data)  => apiFetch(`/payment-requests/${id}`, 'PATCH', data, true),
  delete: (id)        => apiFetch(`/payment-requests/${id}`, 'DELETE', null, true),
}

export const api = {
  auth,
  upload,
  users:               usersApi,
  projects:            projectsApi,
  contacts:            contactsApi,
  clients:             contactsApi,
  intervenants:        contactsApi,
  aos:                 aosApi,
  offers:              offersApi,
  markets:             marketsApi,
  missions:            missionsApi,
  documents:           documentsApi,
  tasks,
  events:              eventsApi,
  decisions:           decisionsApi,
  products:            productsApi,
  commandes:           ordersApi,
  usersApi,
  rapports:            rapportsApi,
  transactions:        transactionsApiHttp,
  notifications:       notificationsApi,
  activities:          activitiesApi,
  conversations:       conversationsApi,
  projectMembers:      projectMembersApi,
  introductions:       introductionsApiHttp,
  commissionsTracking: commissionsTrackingApiHttp,
  paymentRequests:     paymentRequestsApi,
  photos:              photosApi,
  professionals,
  marketplace,
  finance,
  payments,
  integrations,
  kai,
  reviews: {
    getAll: (params = {}) => { const qs = new URLSearchParams(params).toString(); return apiFetch(`/reviews${qs ? '?' + qs : ''}`, 'GET', null, true) },
    create: (data) => apiFetch('/reviews', 'POST', data, true),
  },
  admin: {
    getVerifications: () => apiFetch('/admin/verifications', 'GET', null, true),
    verify: (userId, data) => apiFetch(`/admin/verify/${userId}`, 'PATCH', data, true),
  },
  assets: {
    getAll: (params = {}) => { const qs = new URLSearchParams(Object.fromEntries(Object.entries(params).filter(([,v]) => v))).toString(); return apiFetch(`/assets${qs ? '?' + qs : ''}`, 'GET', null, true) },
    getByProject: (pid) => apiFetch(`/assets?projectId=${encodeURIComponent(pid)}`, 'GET', null, true),
    create: (data) => apiFetch('/assets', 'POST', data, true),
    update: (id, data) => apiFetch(`/assets/${id}`, 'PATCH', data, true),
    addMaintenance: (id, data) => apiFetch(`/assets/${id}/maintenance`, 'POST', data, true),
    delete: (id) => apiFetch(`/assets/${id}`, 'DELETE', null, true),
  },
  passports: {
    getAll: () => apiFetch('/passports', 'GET', null, true),
    getById: (id) => apiFetch(`/passports/${id}`, 'GET', null, true),
    generate: (projectId) => apiFetch(`/passports/generate/${projectId}`, 'POST', {}, true),
    transfer: (id, data) => apiFetch(`/passports/${id}`, 'PATCH', data, true),
  },
  knowledge: {
    search: (query, type) => apiFetch(`/knowledge/search?query=${encodeURIComponent(query)}${type ? '&type=' + type : ''}`, 'GET', null, true),
    getNode: (type, refId) => apiFetch(`/knowledge/node/${type}/${refId}`, 'GET', null, true),
    getProjectGraph: (pid) => apiFetch(`/knowledge/graph/${pid}`, 'GET', null, true),
    createNode: (data) => apiFetch('/knowledge/node', 'POST', data, true),
    createEdge: (data) => apiFetch('/knowledge/edge', 'POST', data, true),
  },
  engines: {
    /** Workflow : transitions possibles depuis un état */
    getTransitions: (workflow, state) => apiFetch(`/engines/workflow/${workflow}/${state}`, 'GET', null, true),
    /** Rules : évaluer des règles métier */
    evaluateRules: (rules, context) => apiFetch('/engines/rules/evaluate', 'POST', { rules, context }, true),
    /** Rules : lister toutes les règles */
    listRules: () => apiFetch('/engines/rules', 'GET', null, true),
    /** Permissions : vérifier une permission */
    checkPermission: (data) => apiFetch('/engines/permissions/check', 'POST', data, true),
    /** Permissions : actions disponibles pour un rôle */
    getActions: (params) => { const qs = new URLSearchParams(params).toString(); return apiFetch(`/engines/permissions/actions?${qs}`, 'GET', null, true) },
  },
}
