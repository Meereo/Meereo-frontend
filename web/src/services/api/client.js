/**
 * MEEREO API Client — Mock localStorage
 * Remplace le backend Express/PostgreSQL par un store localStorage.
 * Interface identique : tous les appelants fonctionnent sans modification.
 */

// ─── DB helpers ──────────────────────────────────────────────────────────────

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
  try {
    const store = JSON.parse(localStorage.getItem('meereo_store_v2') || '{}')
    const token = store._token
    if (!token) return null
    const decoded = parseToken(token)
    return decoded?.userId || null
  } catch { return null }
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

// ─── Auth ────────────────────────────────────────────────────────────────────

const auth = {
  register: async (data) => {
    const users = getTable('users')
    if (users.find(u => u.email === data.email)) {
      throw new Error('Email déjà utilisé')
    }
    const user = {
      id: uid(),
      email: data.email || '',
      password: data.password || '',
      name: data.name || '',
      type: data.type || 'pro',
      company: data.company || null,
      phone: data.phone || null,
      avatar: data.avatar || null,
      metier: data.metier || null,
      ville: data.ville || null,
      wallet: 0,
      emailVerified: false,
      verified: false,
      createdAt: now(),
      updatedAt: now(),
    }
    users.push(user)
    saveTable('users', users)
    const token = makeToken(user.id, user.type)
    return { user: userPublic(user), token }
  },

  login: async (data) => {
    const users = getTable('users')
    const user = users.find(u => u.email === data.email)
    if (!user) throw new Error('Utilisateur non trouvé')
    if (user.password === 'DELETED') throw new Error('Ce compte a été supprimé')
    if (user.password !== data.password) throw new Error('Mot de passe incorrect')
    const token = makeToken(user.id, user.type)
    return { user: userPublic(user), token }
  },

  me: async () => {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('Non authentifié')
    const user = getTable('users').find(u => u.id === userId)
    if (!user) throw new Error('Utilisateur non trouvé')
    return userPublic(user)
  },

  deleteAccount: async () => {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('Non authentifié')
    const users = getTable('users').map(u =>
      u.id === userId
        ? { ...u, name: 'Compte supprimé', email: `deleted_${userId}@meereo.ci`, password: 'DELETED', avatar: null }
        : u
    )
    saveTable('users', users)
    return { success: true }
  },

  sendVerification: async () => ({ success: true, message: 'Email de vérification envoyé (mock)' }),

  verifyEmail: async (email) => {
    const users = getTable('users').map(u =>
      u.email === email ? { ...u, emailVerified: true } : u
    )
    saveTable('users', users)
    return { success: true, verified: true }
  },

  changePassword: async (data) => {
    const userId = getCurrentUserId()
    if (!userId) throw new Error('Non authentifié')
    const users = getTable('users')
    const user = users.find(u => u.id === userId)
    if (!user) throw new Error('Utilisateur non trouvé')
    if (user.password !== data.currentPassword) throw new Error('Mot de passe actuel incorrect')
    if ((data.newPassword || '').length < 8) throw new Error('Le nouveau mot de passe doit faire au moins 8 caractères')
    const updated = users.map(u => u.id === userId ? { ...u, password: data.newPassword } : u)
    saveTable('users', updated)
    return { success: true }
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
    let pros = getTable('users').filter(u => u.type === 'pro')
    if (params.metier && params.metier !== 'all') pros = pros.filter(u => u.metier === params.metier)
    if (params.q) {
      const q = params.q.toLowerCase()
      pros = pros.filter(u => ((u.name || '') + (u.company || '') + (u.metier || '') + (u.ville || '')).toLowerCase().includes(q))
    }
    return pros.map(userPublic)
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

// ─── KAI (mock) ──────────────────────────────────────────────────────────────

const kai = {
  chat: async (message) => ({
    reply: `[KAI Mock] Message reçu : "${message}". Le backend KAI n'est pas actif en mode mock.`,
    suggestions: [],
  }),
}

// ─── Tasks (extended) ────────────────────────────────────────────────────────

const tasksBase = createEntityApi('tasks')
const tasks = {
  ...tasksBase,
  assignedToMe: async (params = {}) => {
    const userId = getCurrentUserId()
    return getTable('tasks').filter(t => t.assignedTo === userId && (!params.projectId || t.projectId === params.projectId))
  },
  addComment: async (id, comment) => {
    const rows = getTable('tasks').map(t => t.id === id ? { ...t, comment } : t)
    saveTable('tasks', rows)
    return { comment, taskId: id }
  },
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const api = {
  auth,
  upload,
  users:               createEntityApi('users'),
  projects:            createEntityApi('projects'),
  clients:             createEntityApi('clients'),
  intervenants:        createEntityApi('intervenants'),
  aos:                 createEntityApi('aos'),
  offers:              createEntityApi('offers'),
  markets:             createEntityApi('markets'),
  documents:           createEntityApi('documents'),
  tasks,
  events:              createEntityApi('events'),
  decisions:           createEntityApi('decisions'),
  products:            createEntityApi('products'),
  commandes:           createEntityApi('commandes'),
  fournisseurs:        createEntityApi('fournisseurs'),
  rapports:            createEntityApi('rapports'),
  transactions:        createEntityApi('transactions'),
  notifications:       createEntityApi('notifications'),
  activities:          createEntityApi('activities'),
  conversations:       createEntityApi('conversations'),
  messages:            createEntityApi('messages'),
  projectMembers:      createEntityApi('project-members'),
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
