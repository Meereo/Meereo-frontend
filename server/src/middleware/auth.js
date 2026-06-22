const { verifyToken } = require('../utils/token')
const { getPrisma } = require('../db')

/**
 * Middleware d'authentification JWT.
 * Priorité : cookie httpOnly `meereo_token` → Authorization: Bearer <token>
 * Attache req.user = { id, email, type, ... }
 */
async function requireAuth(req, res, next) {
  // 1. Cookie httpOnly (prioritaire — non lisible par JS, protège des XSS)
  let token = req.cookies?.meereo_token

  // 2. Fallback : Authorization: Bearer (rétrocompatibilité / appels programmatiques)
  if (!token) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.slice(7)
    }
  }

  if (!token) {
    return res.status(401).json({ error: 'Non authentifié — token manquant' })
  }
  let decoded
  try {
    decoded = verifyToken(token)
  } catch (e) {
    if (e.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Session expirée — veuillez vous reconnecter' })
    }
    return res.status(401).json({ error: 'Token invalide' })
  }

  const prisma = getPrisma()
  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: {
      id: true,
      email: true,
      name: true,
      type: true,
      company: true,
      phone: true,
      avatar: true,
      metier: true,
      ville: true,
      emailVerified: true,
      verified: true,
      publicId: true,
    },
  })

  if (!user) {
    return res.status(401).json({ error: 'Utilisateur introuvable' })
  }

  // Refuse access to soft-deleted accounts
  if (user.email && user.email.startsWith('deleted_')) {
    return res.status(401).json({ error: 'Ce compte a été supprimé' })
  }

  req.user = user
  req.authToken = token  // expose le token validé pour les routes qui en ont besoin (ex: /auth/me)
  next()
}

module.exports = { requireAuth }
