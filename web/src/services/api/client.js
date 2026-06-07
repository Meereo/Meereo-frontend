/**
 * MEEREO API Client
 * Remplace les services localStorage par des appels HTTP vers le backend.
 *
 * Usage: import { api } from './services/api/client'
 *        const projects = await api.projects.getAll()
 *        const project = await api.projects.create({ nom: 'Mon projet' })
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

function toQuery(params) {
  if (!params) return ''
  const q = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')
  return q ? '?' + q : ''
}

function getToken() {
  try {
    const store = JSON.parse(localStorage.getItem('meereo_store_v2') || '{}')
    return store._token || null
  } catch { return null }
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (res.status === 204) return null
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `API error ${res.status}`)
  return data
}

function createEntityApi(endpoint) {
  return {
    getAll: () => request(`/${endpoint}`),
    getById: (id) => request(`/${endpoint}/${id}`),
    create: (data) => request(`/${endpoint}`, { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => request(`/${endpoint}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => request(`/${endpoint}/${id}`, { method: 'DELETE' }),
  }
}

export const api = {
  // Auth
  auth: {
    register: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data) => request('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    me: () => request('/auth/me'),
    deleteAccount: () => request('/auth/delete-account', { method: 'DELETE' }),
    sendVerification: (email) => request('/auth/send-verification', { method: 'POST', body: JSON.stringify({ email }) }),
    verifyEmail: (email, code) => request('/auth/verify-email', { method: 'POST', body: JSON.stringify({ email, code }) }),
    changePassword: (data) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(data) }),
  },
  // File upload → MinIO
  upload: {
    /**
     * Upload a base64 file to MinIO
     * @param {string} base64 - data URL (data:image/png;base64,...)
     * @param {string} folder - subfolder (projects, documents, products, avatars)
     * @param {string} filename - optional original filename
     * @returns {{ url: string, objectName: string, size: number }}
     */
    file: (base64, folder = 'uploads', filename = 'file') =>
      request('/upload', { method: 'POST', body: JSON.stringify({ file: base64, folder, filename }) }),
    delete: (objectName) =>
      request(`/upload/${objectName}`, { method: 'DELETE' }),
  },
  // Entities — exactly match the backend routes
  users: createEntityApi('users'),
  projects: createEntityApi('projects'),
  clients: createEntityApi('clients'),
  intervenants: createEntityApi('intervenants'),
  aos: createEntityApi('aos'),
  offers: createEntityApi('offers'),
  markets: createEntityApi('markets'),
  documents: createEntityApi('documents'),
  tasks: {
    ...createEntityApi('tasks'),
    assignedToMe: (params) => request('/tasks/assigned-to-me' + toQuery(params)),
    addComment: (id, content) => request(`/tasks/${id}/comments`, { method: 'POST', body: JSON.stringify({ comment: content }) }),
  },
  events: createEntityApi('events'),
  decisions: createEntityApi('decisions'),
  products: createEntityApi('products'),
  commandes: createEntityApi('commandes'),
  fournisseurs: createEntityApi('fournisseurs'),
  rapports: createEntityApi('rapports'),
  transactions: createEntityApi('transactions'),
  notifications: createEntityApi('notifications'),
  activities: createEntityApi('activities'),
  conversations: createEntityApi('conversations'),
  messages: createEntityApi('messages'),
  projectMembers: createEntityApi('project-members'),
  // Commission workflow (clé en main)
  introductions: createEntityApi('introductions'),
  commissionsTracking: createEntityApi('commissions-tracking'),
  // Photos chantier
  photos: createEntityApi('photos'),
  // Professionals directory & search
  professionals: {
    getAll:  (params) => request('/professionals' + toQuery(params)),
    search:  (q, metier) => request('/professionals' + toQuery({ q, metier })),
  },
  // Marketplace categories
  marketplace: {
    getCategories: () => request('/marketplace/categories'),
  },
  // Finance — Budget / Expenses / Invoices / Reports
  finance: {
    getBudgets:         (params) => request('/finance/budgets' + toQuery(params)),
    createBudget:       (data)   => request('/finance/budgets', { method: 'POST', body: JSON.stringify(data) }),
    updateBudget:       (id, data) => request(`/finance/budgets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteBudget:       (id)     => request(`/finance/budgets/${id}`, { method: 'DELETE' }),
    getExpenses:        (params) => request('/finance/expenses' + toQuery(params)),
    createExpense:      (data)   => request('/finance/expenses', { method: 'POST', body: JSON.stringify(data) }),
    updateExpense:      (id, data) => request(`/finance/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    deleteExpense:      (id)     => request(`/finance/expenses/${id}`, { method: 'DELETE' }),
    getInvoices:        (params) => request('/finance/invoices' + toQuery(params)),
    createInvoice:      (data)   => request('/finance/invoices', { method: 'POST', body: JSON.stringify(data) }),
    updateInvoice:      (id, data) => request(`/finance/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    patchInvoiceStatus: (id, statut) => request(`/finance/invoices/${id}`, { method: 'PATCH', body: JSON.stringify({ statut }) }),
    getReports:         (projectId) => request(`/finance/reports/${projectId}`),
  },
  // Payments — PaymentOrder escrow workflow
  payments: {
    getPayments:      (params)       => request('/payments' + toQuery(params)),
    getPayment:       (id)           => request(`/payments/${id}`),
    createPayment:    (data)         => request('/payments', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus:     (id, status, extra = {}) => request(`/payments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status, ...extra }) }),
    updateMilestone:  (id, mid, data) => request(`/payments/${id}/milestones/${mid}`, { method: 'PATCH', body: JSON.stringify(data) }),
    addProof:         (id, data)     => request(`/payments/${id}/proofs`, { method: 'POST', body: JSON.stringify(data) }),
    validate:         (id, data)     => request(`/payments/${id}/validate`, { method: 'POST', body: JSON.stringify(data) }),
    getLogs:          (id)           => request(`/payments/${id}/logs`),
  },
  // Integrations catalog (static on server — no DB model)
  integrations: {
    getAll: () => request('/integrations'),
  },
  // KAI assistant
  kai: {
    chat: (message, context) => request('/kai/chat', { method: 'POST', body: JSON.stringify({ message, context }) }),
  },
}
