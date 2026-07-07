const path = require('path')
const fs = require('fs')
// Charge .env depuis server/ quel que soit le répertoire de lancement
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

// S'assurer que le dossier uploads existe au démarrage
fs.mkdirSync(path.join(__dirname, '../uploads/documents'), { recursive: true })

const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const cookieParser = require('cookie-parser')

const { errorHandler } = require('./middleware/errorHandler')
const { disconnectPrisma } = require('./db')
const { attachSocketIO } = require('./socket')

const authRouter = require('./routes/auth')
const productsRouter = require('./routes/products')
const aosRouter = require('./routes/aos')
const offersRouter = require('./routes/offers')
const usersRouter = require('./routes/users')
const conversationsRouter = require('./routes/conversations')
const ordersRouter = require('./routes/orders')
const marketsRouter = require('./routes/markets')
const projectsRouter = require('./routes/projects')
const projectMembersRouter = require('./routes/projectMembers')
const tasksRouter = require('./routes/tasks')
const eventsRouter = require('./routes/events')
const documentsRouter = require('./routes/documents')
const decisionsRouter = require('./routes/decisions')
const notificationsRouter = require('./routes/notifications')
const activitiesRouter = require('./routes/activities')
const contactsRouter = require('./routes/contacts')
const kaiRouter = require('./routes/kai')
const proRouter  = require('./routes/pro')
const financeRouter       = require('./routes/finance')
const paymentsRouter      = require('./routes/payments')
const rapportsRouter      = require('./routes/rapports')
const transactionsRouter  = require('./routes/transactions')
const introductionsRouter = require('./routes/introductions')
const paymentRequestsRouter = require('./routes/paymentRequests')
const missionsRouter = require('./routes/missions')
const reviewsRouter = require('./routes/reviews')
const adminRouter = require('./routes/admin')

// ─── App ──────────────────────────────────────────────────────────────────────

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)

// ─── Sécurité ─────────────────────────────────────────────────────────────────

app.use(helmet())

// CORS — autoriser uniquement le frontend
const allowedOrigins = (process.env.ALLOWED_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())

app.use(
  cors({
    origin: (origin, cb) => {
      // Autoriser les appels sans Origin (Postman, tests curl, SSR)
      if (!origin) return cb(null, true)
      if (allowedOrigins.includes(origin)) return cb(null, true)
      cb(new Error(`CORS bloqué pour l'origine : ${origin}`))
    },
    credentials: true,           // indispensable pour envoyer les cookies cross-origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition'],
  })
)

// ─── Rate limiting ─────────────────────────────────────────────────────────────
// En développement le rate limiter est désactivé (React Strict Mode double les
// effets → 2× les appels API au boot, ce qui déclenche faussement le limiteur).
const isDev = process.env.NODE_ENV !== 'production'

// Limite globale : 2000 req / 15 min par IP en prod, désactivé en dev
if (!isDev) {
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 2000,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Trop de requêtes — réessayez dans quelques minutes' },
    })
  )
}

// Limite renforcée sur les endpoints d'authentification sensibles (prod seulement)
const authLimiter = isDev
  ? (req, res, next) => next()  // no-op en dev
  : rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 20,
      message: { error: 'Trop de tentatives — réessayez dans 15 minutes' },
      standardHeaders: true,
      legacyHeaders: false,
    })

// ─── Body parsing ─────────────────────────────────────────────────────────────

// Limite à 10 MB pour supporter les images base64 du wizard
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// ─── Fichiers statiques — uploads utilisateurs ────────────────────────────────
// Les fichiers uploadés sont servis à /uploads/**
// Ex: /uploads/documents/proj-uuid/file-uuid.pdf
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  // Désactiver le listing des répertoires (sécurité)
  index: false,
  dotfiles: 'deny',
}))

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  })
})

// ─── Routes ───────────────────────────────────────────────────────────────────

// Appliquer le rate-limiter strict sur login/register/forgot-password
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/auth/forgot-password', authLimiter)
app.use('/api/auth/reset-password', authLimiter)

app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/aos', aosRouter)
app.use('/api/offers', offersRouter)
app.use('/api/users', usersRouter)
app.use('/api/conversations', conversationsRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/markets', marketsRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/project-members', projectMembersRouter)
app.use('/api/tasks', tasksRouter)
app.use('/api/events', eventsRouter)
app.use('/api/documents', documentsRouter)
app.use('/api/decisions', decisionsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/activities', activitiesRouter)
app.use('/api/contacts', contactsRouter)
app.use('/api/kai', kaiRouter)
app.use('/api/pro', proRouter)  // public — pas de requireAuth
app.use('/api/finance',       financeRouter)
app.use('/api/payments',      paymentsRouter)
app.use('/api/rapports',          rapportsRouter)
app.use('/api/transactions',      transactionsRouter)
app.use('/api/introductions',     introductionsRouter)
app.use('/api/payment-requests',  paymentRequestsRouter)
app.use('/api/missions',          missionsRouter)
app.use('/api/reviews',           reviewsRouter)
app.use('/api/admin',             adminRouter)

// ─── 404 ──────────────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route introuvable : ${req.method} ${req.path}` })
})

// ─── Error handler (doit être le dernier middleware) ──────────────────────────

app.use(errorHandler)

// ─── Démarrage ────────────────────────────────────────────────────────────────

const server = app.listen(PORT, async () => {
  console.log(`\n🚀 Meereo API — http://localhost:${PORT}`)
  console.log(`   Environnement : ${process.env.NODE_ENV || 'development'}`)
  console.log(`   CORS autorisé : ${allowedOrigins.join(', ')}\n`)

  // Backfill publicId pour les comptes existants qui n'en ont pas encore
  try {
    const { getPrisma } = require('./db')
    const { randomUUID } = require('crypto')
    const prisma = getPrisma()
    const nullUsers = await prisma.user.findMany({
      where: { publicId: null },
      select: { id: true },
    })
    if (nullUsers.length > 0) {
      await Promise.all(nullUsers.map(u =>
        prisma.user.update({
          where: { id: u.id },
          data: { publicId: randomUUID() },
        })
      ))
      console.log(`[BACKFILL] publicId généré pour ${nullUsers.length} utilisateur(s)`)
    }
  } catch (e) {
    console.warn('[BACKFILL] publicId:', e.message)
  }
})

// Attacher Socket.IO au serveur HTTP
attachSocketIO(server, allowedOrigins)

// Arrêt gracieux
async function shutdown(signal) {
  console.log(`\n[${signal}] Arrêt du serveur…`)
  server.close(async () => {
    await disconnectPrisma()
    console.log('Connexions fermées.')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

module.exports = app
