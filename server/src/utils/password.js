const bcrypt = require('bcryptjs')

const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10)

/**
 * Hache un mot de passe en clair.
 * @param {string} password
 * @returns {Promise<string>}
 */
async function hashPassword(password) {
  return bcrypt.hash(password, ROUNDS)
}

/**
 * Compare un mot de passe en clair avec son hash.
 * @param {string} password
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash)
}

module.exports = { hashPassword, comparePassword }
