const path = require('path')
// Charge .env depuis server/ quel que soit le répertoire de lancement
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

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
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ─── Rate limiting ─────────────────────────────────────────────────────────────

// Limite globale : 300 req / 15 min par IP
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Trop de requêtes — réessayez dans quelques minutes' },
  })
)

// Limite renforcée sur les endpoints d'authentification sensibles
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Trop de tentatives — réessayez dans 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
})

// ─── Body parsing ─────────────────────────────────────────────────────────────

// Limite à 10 MB pour supporter les images base64 du wizard
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))app.use(cookieParser())
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

// ─── 404 ──────────────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route introuvable : ${req.method} ${req.path}` })
})

// ─── Error handler (doit être le dernier middleware) ──────────────────────────

app.use(errorHandler)

// ─── Démarrage ────────────────────────────────────────────────────────────────

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Meereo API — http://localhost:${PORT}`)
  console.log(`   Environnement : ${process.env.NODE_ENV || 'development'}`)
  console.log(`   CORS autorisé : ${allowedOrigins.join(', ')}\n`)
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
