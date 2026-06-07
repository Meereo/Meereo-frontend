import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'meereo-dev-secret-2025'

/**
 * Auth middleware — verifies JWT token on protected routes.
 * Adds req.userId and req.userType if valid.
 * In dev mode (no token), allows through with a warning.
 */
export function requireAuth(req, res, next) {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    // Dev mode: allow without token but log warning
    if (process.env.NODE_ENV !== 'production') {
      req.userId = null
      req.userType = null
      return next()
    }
    return res.status(401).json({ error: 'Token requis' })
  }
  try {
    const token = auth.replace('Bearer ', '')
    const decoded = jwt.verify(token, JWT_SECRET)
    req.userId = decoded.userId
    req.userType = decoded.type
    next()
  } catch (e) {
    return res.status(401).json({ error: 'Token invalide' })
  }
}
