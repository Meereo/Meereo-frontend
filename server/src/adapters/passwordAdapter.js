// ─── PasswordPort ────────────────────────────────────────────────────────────
// Délègue au MÊME algorithme que auth.js : bcryptjs, 12 rounds par défaut
// (configurable via BCRYPT_ROUNDS). Les comptes créés par l'onboarding se
// connectent via le login existant sans aucune migration.
//
// RÈGLE : jamais de mot de passe en clair dans les logs.
// ─────────────────────────────────────────────────────────────────────────────

const { hashPassword, comparePassword } = require('../utils/password')

const passwordAdapter = {
  /**
   * Hache un mot de passe en clair (bcryptjs).
   * @param {string} plaintext
   * @returns {Promise<string>} Hash bcrypt
   */
  async hash(plaintext) {
    return hashPassword(plaintext)
  },

  /**
   * Compare un mot de passe en clair avec son hash.
   * @param {string} plaintext
   * @param {string} hash
   * @returns {Promise<boolean>}
   */
  async verify(plaintext, hash) {
    return comparePassword(plaintext, hash)
  },
}

module.exports = passwordAdapter
