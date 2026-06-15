const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d'

if (!SECRET || SECRET.length < 32) {
  console.warn('[JWT] JWT_SECRET est absent ou trop court (< 32 chars). Définissez-le dans .env.')
}

/**
 * Génère un JWT signé pour un utilisateur.
 * @param {{ id: string, type: string }} payload
 * @returns {string}
 */
function signToken(payload) {
  return jwt.sign(
    { userId: payload.id, type: payload.type },
    SECRET,
    { expiresIn: EXPIRES_IN }
  )
}

/**
 * Vérifie et décode un JWT.
 * @param {string} token
 * @returns {{ userId: string, type: string, iat: number, exp: number }}
 */
function verifyToken(token) {
  return jwt.verify(token, SECRET)
}

module.exports = { signToken, verifyToken }
