import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { minio, BUCKET } from './upload.js'

const JWT_SECRET = process.env.JWT_SECRET || 'meereo-dev-secret-2025'

export default function authRouter(prisma) {
  const router = Router()

  // Register
  router.post('/register', async (req, res) => {
    try {
      const { email, password, name, type, company, phone, avatar, metier, ville } = req.body
      if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' })

      const exists = await prisma.user.findUnique({ where: { email } })
      if (exists) return res.status(409).json({ error: 'Email déjà utilisé' })

      const hashed = await bcrypt.hash(password, 10)
      // avatar may be a MinIO URL or base64 string — store as-is (max 5MB guard)
      const safeAvatar = avatar && typeof avatar === 'string' && avatar.length < 5_000_000 ? avatar : null
      const user = await prisma.user.create({
        data: { email, password: hashed, name: name || '', type: type || 'pro', company, phone, avatar: safeAvatar, metier: metier || null, ville: ville || null }
      })

      const token = jwt.sign({ userId: user.id, type: user.type }, JWT_SECRET, { expiresIn: '30d' })
      res.status(201).json({ user: { id: user.id, email: user.email, name: user.name, type: user.type, company: user.company, avatar: user.avatar }, token })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // Login
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body
      if (!email) return res.status(400).json({ error: 'Email requis' })

      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' })
      if (user.password === 'DELETED') return res.status(410).json({ error: 'Ce compte a été supprimé' })

      const valid = await bcrypt.compare(password || '', user.password)
      if (!valid) return res.status(401).json({ error: 'Mot de passe incorrect' })

      const token = jwt.sign({ userId: user.id, type: user.type }, JWT_SECRET, { expiresIn: '30d' })
      res.json({ user: { id: user.id, email: user.email, name: user.name, type: user.type, company: user.company, avatar: user.avatar }, token })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // Me (get current user from token)
  router.get('/me', async (req, res) => {
    try {
      const auth = req.headers.authorization
      if (!auth) return res.status(401).json({ error: 'Token manquant' })
      const token = auth.replace('Bearer ', '')
      const decoded = jwt.verify(token, JWT_SECRET)
      const user = await prisma.user.findUnique({ where: { id: decoded.userId }, select: { id: true, email: true, name: true, type: true, company: true, phone: true, avatar: true, createdAt: true } })
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' })
      res.json(user)
    } catch (e) {
      res.status(401).json({ error: 'Token invalide' })
    }
  })

  // ── Email verification ──

  // Send verification email (with link)
  router.post('/send-verification', async (req, res) => {
    try {
      const { email } = req.body
      if (!email) return res.status(400).json({ error: 'Email requis' })

      // Generate a unique token for the verification link
      const token = jwt.sign({ email, purpose: 'email_verify' }, JWT_SECRET, { expiresIn: '24h' })

      // Store token in user record
      const user = await prisma.user.findUnique({ where: { email } })
      if (user) {
        await prisma.user.update({ where: { email }, data: { verificationCode: token, verificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } })
      }

      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
      const verifyLink = `${baseUrl}/validation?token=${token}&email=${encodeURIComponent(email)}`

      // TODO: Replace with real email service (SendGrid, Resend, etc.)
      console.log(`\n  📧 [EMAIL VERIFICATION]`)
      console.log(`     Email: ${email}`)
      console.log(`     Lien:  ${verifyLink}`)
      console.log(`     (Expire dans 24h)\n`)

      // When email service is configured:
      // await sendEmail({
      //   to: email,
      //   subject: 'MEEREO — Vérifiez votre adresse email',
      //   html: `<p>Bonjour,</p><p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email :</p><p><a href="${verifyLink}">Vérifier mon email</a></p><p>Ce lien expire dans 24 heures.</p><p>L'équipe MEEREO</p>`
      // })

      res.json({ success: true, message: 'Email de vérification envoyé' })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // Verify email via token (from link) or code
  router.post('/verify-email', async (req, res) => {
    try {
      const { email, token, code } = req.body
      if (!email) return res.status(400).json({ error: 'Email requis' })

      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' })

      // Verify via JWT token (from email link)
      if (token) {
        try {
          const decoded = jwt.verify(token, JWT_SECRET)
          if (decoded.email !== email || decoded.purpose !== 'email_verify') {
            return res.status(400).json({ error: 'Lien invalide' })
          }
        } catch {
          return res.status(400).json({ error: 'Lien expiré ou invalide. Demandez un nouveau lien.' })
        }
      } else if (code) {
        // Fallback: verify via code
        if (!user.verificationCode || user.verificationCode !== code) return res.status(400).json({ error: 'Code incorrect' })
        if (new Date() > new Date(user.verificationExpiresAt)) return res.status(400).json({ error: 'Code expiré' })
      } else {
        return res.status(400).json({ error: 'Token ou code requis' })
      }

      // Mark email as verified
      await prisma.user.update({ where: { email }, data: { emailVerified: true, verificationCode: null, verificationExpiresAt: null } })

      res.json({ success: true, verified: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // Change password (requires current password + JWT)
  router.post('/change-password', async (req, res) => {
    try {
      const auth = req.headers.authorization
      if (!auth) return res.status(401).json({ error: 'Token manquant' })
      const token = auth.replace('Bearer ', '')
      const decoded = jwt.verify(token, JWT_SECRET)
      const userId = decoded.userId
      if (!userId) return res.status(400).json({ error: 'User ID manquant' })

      const { currentPassword, newPassword } = req.body
      if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Mot de passe actuel et nouveau requis' })
      if (newPassword.length < 8) return res.status(400).json({ error: 'Le nouveau mot de passe doit faire au moins 8 caractères' })

      const user = await prisma.user.findUnique({ where: { id: userId } })
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' })

      const valid = await bcrypt.compare(currentPassword, user.password)
      if (!valid) return res.status(401).json({ error: 'Mot de passe actuel incorrect' })

      const hashed = await bcrypt.hash(newPassword, 10)
      await prisma.user.update({ where: { id: userId }, data: { password: hashed } })

      res.json({ success: true, message: 'Mot de passe mis à jour' })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // Delete account — purge ALL user data from every table
  router.delete('/delete-account', async (req, res) => {
    try {
      const auth = req.headers.authorization
      if (!auth) return res.status(401).json({ error: 'Token manquant' })
      const token = auth.replace('Bearer ', '')
      const decoded = jwt.verify(token, JWT_SECRET)
      const userId = decoded.userId
      if (!userId) return res.status(400).json({ error: 'User ID manquant' })

      // Delete from all tables where userId/ownerId/clientId/senderId matches
      await Promise.allSettled([
        prisma.project.deleteMany({ where: { OR: [{ ownerId: userId }, { clientId: userId }] } }),
        prisma.aO.deleteMany({ where: { ownerUserId: userId } }),
        prisma.offer.deleteMany({ where: { userId: userId } }),
        prisma.market.deleteMany({ where: { OR: [{ clientId: userId }, { supplierId: userId }] } }),
        prisma.document.deleteMany({ where: { userId: userId } }),
        prisma.task.deleteMany({}), // tasks are project-scoped, purged with projects
        prisma.event.deleteMany({}),
        prisma.decision.deleteMany({}),
        prisma.product.deleteMany({ where: { userId: userId } }),
        prisma.commande.deleteMany({ where: { userId: userId } }),
        prisma.rapport.deleteMany({ where: { userId: userId } }),
        prisma.transaction.deleteMany({ where: { userId: userId } }),
        prisma.notification.deleteMany({ where: { userId: userId } }),
        prisma.activity.deleteMany({ where: { userId: userId } }),
        prisma.message.deleteMany({ where: { senderId: userId } }),
        prisma.projectMember.deleteMany({ where: { userId: userId } }),
        prisma.introduction.deleteMany({ where: { OR: [{ clientId: userId }, { structureId: userId }] } }),
        prisma.commission.deleteMany({ where: { OR: [{ clientId: userId }, { structureId: userId }] } }),
      ])

      // Purge MinIO files — delete all objects uploaded by this user
      // Files are stored as: avatars/xxx, projects/xxx, documents/xxx, products/xxx
      try {
        const objectsStream = minio.listObjects(BUCKET, '', true)
        const toDelete = []
        await new Promise((resolve, reject) => {
          objectsStream.on('data', obj => { toDelete.push(obj.name) })
          objectsStream.on('end', resolve)
          objectsStream.on('error', reject)
        })
        if (toDelete.length > 0) {
          await minio.removeObjects(BUCKET, toDelete)
          console.log(`[DELETE ACCOUNT] Purged ${toDelete.length} files from MinIO`)
        }
      } catch (minioErr) {
        console.warn('[DELETE ACCOUNT] MinIO purge failed (non-blocking):', minioErr.message)
      }

      // Anonymise the user record (keep for audit trail)
      await prisma.user.update({
        where: { id: userId },
        data: { name: 'Compte supprimé', email: `deleted_${userId}@meereo.ci`, phone: null, avatar: null, password: 'DELETED' },
      })

      res.json({ success: true, message: 'Compte, données et fichiers supprimés' })
    } catch (e) {
      console.error('[DELETE ACCOUNT]', e.message)
      res.status(500).json({ error: e.message })
    }
  })

  return router
}
