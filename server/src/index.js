import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'
import { createCrudRouter } from './routes/crud.js'
import { requireAuth } from './middleware/auth.js'

const prisma = new PrismaClient()
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '10mb' }))

// Health check (public)
app.get('/api/health', (_, res) => res.json({ status: 'ok', db: 'postgresql', ts: new Date().toISOString() }))

// Auth middleware on all /api routes except health and auth
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/auth') || req.path === '/health') return next()
  return requireAuth(req, res, next)
})

// ═══════════════════════════════════════
//  CRUD ROUTES — auto-generated from Prisma models
// ═══════════════════════════════════════

// Users — exclude password from responses
app.use('/api/users', createCrudRouter(prisma.user, { exclude: ['password'], modelName: 'user' }))
// ── Projects: shared (cross-actor), frontend filters by ownership ──
// NOTE: production should use projectMembers for backend-side ACL
app.use('/api/projects', createCrudRouter(prisma.project, { modelName: 'project' }))
app.use('/api/notifications', createCrudRouter(prisma.notification, { modelName: 'notification', scopeByUser: 'userId' }))
app.use('/api/activities', createCrudRouter(prisma.activity, { modelName: 'activity', scopeByUser: 'userId' }))
app.use('/api/transactions', createCrudRouter(prisma.transaction, { modelName: 'transaction', scopeByUser: 'userId' }))
app.use('/api/rapports', createCrudRouter(prisma.rapport, { modelName: 'rapport', scopeByUser: 'userId' }))

// ── AO: custom delete with business rules, then generic CRUD ──
import { Router } from 'express'
const aoCustom = Router()
aoCustom.delete('/:id', async (req, res) => {
  try {
    const ao = await prisma.aO.findUnique({ where: { id: req.params.id } })
    if (!ao) return res.status(404).json({ error: 'AO introuvable' })
    // Ownership check (skip in dev if no userId)
    if (req.userId && ao.ownerUserId && ao.ownerUserId !== req.userId) {
      return res.status(403).json({ error: 'Vous n\'êtes pas le propriétaire de cet AO' })
    }
    // Check if a market was created from this AO
    const marketCount = await prisma.market.count({ where: { aoId: ao.id } })
    if (marketCount > 0) {
      return res.status(409).json({ error: 'Cet AO a déjà donné lieu à un marché. Archivez-le au lieu de le supprimer.', action: 'archive_only' })
    }
    // Check for offers — cancel instead of delete if responses exist
    const offerCount = await prisma.offer.count({ where: { aoId: ao.id } })
    if (offerCount > 0) {
      const updated = await prisma.aO.update({ where: { id: ao.id }, data: { status: 'cancelled_by_owner' } })
      return res.json({ success: true, action: 'cancelled', ao: updated })
    }
    // No offers, no market — hard delete (Offer cascade handles any edge case)
    await prisma.aO.delete({ where: { id: ao.id } })
    res.status(204).end()
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})
app.use('/api/aos', aoCustom)
// ── Shared entities (all users see all — needed for cross-actor flows) ──
app.use('/api/aos', createCrudRouter(prisma.aO, { modelName: 'aO' }))
app.use('/api/offers', createCrudRouter(prisma.offer, { modelName: 'offer' }))
app.use('/api/markets', createCrudRouter(prisma.market, { modelName: 'market' }))
app.use('/api/documents', createCrudRouter(prisma.document, { modelName: 'document' }))
// ── Tasks special routes ──
import { Router as _TaskRouter } from 'express'
const taskSpecial = _TaskRouter()
// GET /tasks/assigned-to-me — tasks where assignedTo === current user id
taskSpecial.get('/assigned-to-me', async (req, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Non authentifié' })
    const where = { assignedTo: req.userId }
    if (req.query.projectId) where.projectId = req.query.projectId
    if (req.query.status) where.status = req.query.status
    const tasks = await prisma.task.findMany({ where, orderBy: { createdAt: 'desc' } })
    res.json(tasks)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})
// POST /tasks/:id/comments — add a comment to a task (stored as Activity + updates task.comment)
taskSpecial.post('/:id/comments', async (req, res) => {
  try {
    const { comment } = req.body
    if (!comment || !comment.trim()) return res.status(400).json({ error: 'Commentaire vide' })
    const task = await prisma.task.findUnique({ where: { id: req.params.id } })
    if (!task) return res.status(404).json({ error: 'Tâche introuvable' })
    const [activity] = await Promise.all([
      prisma.activity.create({
        data: { action: 'task_comment', data: { taskId: req.params.id, comment: comment.trim(), taskTitle: task.title }, userId: req.userId || null },
      }),
      prisma.task.update({ where: { id: req.params.id }, data: { comment: comment.trim() } }),
    ])
    res.status(201).json({ comment: comment.trim(), activityId: activity.id, taskId: req.params.id })
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
})
app.use('/api/tasks', taskSpecial)
app.use('/api/tasks', createCrudRouter(prisma.task, { modelName: 'task' }))
app.use('/api/events', createCrudRouter(prisma.event, { modelName: 'event' }))
app.use('/api/decisions', createCrudRouter(prisma.decision, { modelName: 'decision' }))
app.use('/api/products', createCrudRouter(prisma.product, { modelName: 'product' }))
app.use('/api/commandes', createCrudRouter(prisma.commande, { modelName: 'commande' }))
app.use('/api/conversations', createCrudRouter(prisma.conversation, { modelName: 'conversation' }))
app.use('/api/messages', createCrudRouter(prisma.message, { modelName: 'message' }))
app.use('/api/project-members', createCrudRouter(prisma.projectMember, { modelName: 'projectMember' }))

// ── Directory entities (public/shared — browse-like access) ──
app.use('/api/clients', createCrudRouter(prisma.client, { modelName: 'client' }))
app.use('/api/intervenants', createCrudRouter(prisma.intervenant, { modelName: 'intervenant' }))
app.use('/api/fournisseurs', createCrudRouter(prisma.fournisseur, { modelName: 'fournisseur' }))
app.use('/api/introductions', createCrudRouter(prisma.introduction, { modelName: 'introduction' }))
app.use('/api/commissions-tracking', createCrudRouter(prisma.commission, { modelName: 'commission' }))
app.use('/api/photos', createCrudRouter(prisma.photo, { modelName: 'photo' }))

// ═══════════════════════════════════════
//  PROFESSIONALS DIRECTORY & SEARCH
// ═══════════════════════════════════════

// GET /api/professionals?q=xxx&metier=xxx
// Returns all pro users. Optional filters: metier, free-text search.
app.get('/api/professionals', async (req, res) => {
  try {
    const { q, metier } = req.query

    const where = { type: 'pro' }
    const andClauses = []

    if (metier && metier !== 'all') andClauses.push({ metier })

    if (q && q.trim()) {
      const term = q.trim()
      andClauses.push({ OR: [
        { name:    { contains: term, mode: 'insensitive' } },
        { company: { contains: term, mode: 'insensitive' } },
        { metier:  { contains: term, mode: 'insensitive' } },
        { ville:   { contains: term, mode: 'insensitive' } },
      ]})
    }

    if (andClauses.length > 0) where.AND = andClauses

    const pros = await prisma.user.findMany({
      where,
      select: { id: true, name: true, company: true, metier: true, ville: true, verified: true, avatar: true, type: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json(pros)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ═══════════════════════════════════════
//  MARKETPLACE CATEGORIES
// ═══════════════════════════════════════

// Static seed — kept in sync with web/src/data/marketplace.js MKT_CATS
const MARKETPLACE_CATS_SEED = [
  { slug: 'gros-oeuvre',       label: 'Gros Oeuvre',           ico: '🏗️',  order: 1  },
  { slug: 'structure',         label: 'Structure & Charpente',  ico: '🔩',  order: 2  },
  { slug: 'menuiseries',       label: 'Menuiseries',            ico: '🪟',  order: 3  },
  { slug: 'revetements',       label: 'Revêtements',            ico: '🪨',  order: 4  },
  { slug: 'plomberie-cvc',     label: 'Plomberie & CVC',        ico: '🚿',  order: 5  },
  { slug: 'electricite',       label: 'Electricité',            ico: '⚡',  order: 6  },
  { slug: 'green',             label: 'Green & Energie',        ico: '☀️',  order: 7  },
  { slug: 'mobilier',          label: 'Mobilier Bureau',        ico: '💼',  order: 8  },
  { slug: 'mobilier-maison',   label: 'Mobilier Maison',        ico: '🛋️',  order: 9  },
  { slug: 'cuisine',           label: 'Cuisine & SDB',          ico: '🍳',  order: 10 },
  { slug: 'exterieur',         label: 'Extérieur & Jardin',     ico: '🌳',  order: 11 },
]

// Upsert categories once at startup (idempotent)
;(async () => {
  try {
    await Promise.all(MARKETPLACE_CATS_SEED.map(c =>
      prisma.marketplaceCategory.upsert({
        where:  { slug: c.slug },
        update: { label: c.label, ico: c.ico, order: c.order },
        create: { slug: c.slug, label: c.label, ico: c.ico, order: c.order },
      })
    ))
  } catch (e) {
    // Non-fatal — categories may not be seeded on first boot before DB is ready
    console.warn('MarketplaceCategory seed skipped:', e.message)
  }
})()

// GET /api/marketplace/categories — returns ordered list including virtual 'all' entry
app.get('/api/marketplace/categories', async (req, res) => {
  try {
    const cats = await prisma.marketplaceCategory.findMany({ orderBy: { order: 'asc' } })
    // Prepend the virtual 'all' entry (not stored in DB)
    res.json([{ id: 'all', slug: 'all', label: 'Tout', ico: '🏪', order: 0 }, ...cats])
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ═══════════════════════════════════════
//  INTEGRATIONS CATALOG (static — no DB model needed)
// ═══════════════════════════════════════

const INTEGRATIONS_CATALOG = [
  { id: 'int1',  nom: 'Autodesk Revit',    desc: 'Synchronisation BIM & maquette numérique', cat: 'BIM',           logo: 'https://img.icons8.com/color/96/autodesk-revit.png' },
  { id: 'int7',  nom: 'ArchiCAD',          desc: 'Export plans DWG & IFC',                   cat: 'BIM',           logo: 'https://img.icons8.com/color/96/archicad.png' },
  { id: 'int2',  nom: 'Google Drive',      desc: 'Stockage & partage documents',              cat: 'Stockage',      logo: 'https://img.icons8.com/color/96/google-drive.png' },
  { id: 'int10', nom: 'Dropbox',           desc: 'Sauvegarde automatique',                    cat: 'Stockage',      logo: 'https://img.icons8.com/color/96/dropbox.png' },
  { id: 'int3',  nom: 'Slack',             desc: 'Notifications équipe en temps réel',        cat: 'Communication', logo: 'https://img.icons8.com/color/96/slack-new.png' },
  { id: 'int8',  nom: 'WhatsApp Business', desc: 'Communication client & prestataires',       cat: 'Communication', logo: 'https://img.icons8.com/color/96/whatsapp.png' },
  { id: 'int11', nom: 'Microsoft Teams',   desc: 'Visioconférence & collaboration',           cat: 'Communication', logo: 'https://img.icons8.com/color/96/microsoft-teams.png' },
  { id: 'int4',  nom: 'MS Project',        desc: 'Planning Gantt & suivi',                    cat: 'Planning',      logo: 'https://img.icons8.com/color/96/ms-project.png' },
  { id: 'int14', nom: 'Google Calendar',   desc: 'Synchronisation agenda',                    cat: 'Planning',      logo: 'https://img.icons8.com/color/96/google-calendar.png' },
  { id: 'int5',  nom: 'Wave',              desc: 'Paiements mobile money',                    cat: 'Paiements',     logo: 'https://img.icons8.com/color/96/wave.png' },
  { id: 'int6',  nom: 'Orange Money',      desc: 'Mobile money CI',                           cat: 'Paiements',     logo: 'https://img.icons8.com/color/96/orange.png' },
  { id: 'int12', nom: 'MTN MoMo',          desc: 'Mobile money',                              cat: 'Paiements',     logo: 'https://img.icons8.com/color/96/mtn.png' },
  { id: 'int9',  nom: 'Sage Comptabilité', desc: 'Export comptable automatique',              cat: 'Finance',       logo: 'https://img.icons8.com/color/96/sage.png' },
  { id: 'int13', nom: 'QuickBooks',        desc: 'Facturation & comptabilité',                cat: 'Finance',       logo: 'https://img.icons8.com/color/96/quickbooks.png' },
]

app.get('/api/integrations', (_, res) => res.json(INTEGRATIONS_CATALOG))

// ═══════════════════════════════════════
//  AUTH ROUTES
// ═══════════════════════════════════════

import authRouter from './routes/auth.js'
app.use('/api/auth', authRouter(prisma))

// ═══════════════════════════════════════
//  FINANCE (budgets / expenses / invoices / KPIs)
// ═══════════════════════════════════════

import financeRouter from './routes/finance.js'
app.use('/api/finance', financeRouter(prisma))

// ═══════════════════════════════════════
//  PAYMENTS (PaymentOrder escrow)
// ═══════════════════════════════════════

import paymentsRouter from './routes/payments.js'
app.use('/api/payments', paymentsRouter(prisma))

// ═══════════════════════════════════════
//  FILE UPLOAD (MinIO)
// ═══════════════════════════════════════

import uploadRouter from './routes/upload.js'
app.use('/api/upload', uploadRouter())

// ═══════════════════════════════════════
//  KAI — Assistant IA (Anthropic Claude)
// ═══════════════════════════════════════

import kaiRouter from './routes/kai.js'
app.use('/api/kai', kaiRouter())

// Start
app.listen(PORT, () => {
  console.log(`\n  🏗️  MEEREO API running on http://localhost:${PORT}`)
  console.log(`  📊 Health: http://localhost:${PORT}/api/health`)
  console.log(`  🗄️  DB: PostgreSQL @ localhost:5432/meereo`)
  console.log(`  📦 Storage: MinIO @ localhost:9000 (console: localhost:9001)`)
  console.log(`  🤖 KAI: ${process.env.ANTHROPIC_API_KEY ? 'Claude API active' : 'Mode local (pas de clé API)'}\n`)
})
