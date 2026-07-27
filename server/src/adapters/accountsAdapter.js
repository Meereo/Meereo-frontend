// ─── AccountsPort ────────────────────────────────────────────────────────────
// Vérifie la disponibilité d'un email pour un rôle donné.
// Utilise du raw SQL pour : lower(email) + filtre type + deletedAt IS NULL.
// Les deux filtres sont OBLIGATOIRES (AVS-03 soft-delete + arbitrage 1 multi-rôle).
// ─────────────────────────────────────────────────────────────────────────────

const { getPrisma } = require('../db')

const accountsAdapter = {
  /**
   * @param {string} email
   * @param {'pro'|'client'|'fournisseur'} role
   * @returns {Promise<boolean>} true si l'email est libre pour ce rôle
   */
  async emailAvailableForRole(email, role) {
    const prisma = getPrisma()
    // Cast explicite vers l'enum PostgreSQL "UserType" pour éviter
    // l'erreur « operator does not exist: "UserType" = text ».
    const rows = await prisma.$queryRawUnsafe(
      `SELECT 1 FROM users
       WHERE lower(email) = lower($1)
         AND type = $2::"UserType"
         AND "deletedAt" IS NULL
       LIMIT 1`,
      email,
      role,
    )
    return rows.length === 0
  },
}

module.exports = accountsAdapter
