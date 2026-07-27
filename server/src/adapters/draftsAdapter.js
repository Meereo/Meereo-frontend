// ─── DraftsPort ──────────────────────────────────────────────────────────────
// CRUD sur OnboardingDraft (brouillon serveur, TTL 30 jours).
// RÈGLE ABSOLUE : un brouillon ne contient JAMAIS de mot de passe.
// purgeExpired est exposé pour être branché sur un cron externe.
// ─────────────────────────────────────────────────────────────────────────────

const { getPrisma } = require('../db')

const DRAFT_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 jours

/** Supprime tout champ sensible avant persistance. */
function stripSecrets(data) {
  if (!data || typeof data !== 'object') return {}
  const safe = { ...data }
  delete safe.password
  delete safe.passwordHash
  delete safe.currentPassword
  delete safe.newPassword
  delete safe.confirmPassword
  return safe
}

const draftsAdapter = {
  /**
   * Crée un brouillon.
   * @param {{ email: string, role: 'pro'|'client'|'fournisseur', data: object }} input
   * @returns {Promise<object>}
   */
  async create({ email, role, data }) {
    const prisma = getPrisma()
    return prisma.onboardingDraft.create({
      data: {
        email: email.trim().toLowerCase(),
        role,
        data: stripSecrets(data),
        expiresAt: new Date(Date.now() + DRAFT_TTL_MS),
      },
    })
  },

  /**
   * @param {string} id
   * @returns {Promise<object|null>}
   */
  async findById(id) {
    return getPrisma().onboardingDraft.findUnique({ where: { id } })
  },

  /**
   * Retrouve le brouillon le plus récent pour un couple (email, role).
   * @param {string} email
   * @param {string} role
   * @returns {Promise<object|null>}
   */
  async findByEmailAndRole(email, role) {
    return getPrisma().onboardingDraft.findFirst({
      where: {
        email: { equals: email.trim().toLowerCase(), mode: 'insensitive' },
        role,
        expiresAt: { gt: new Date() }, // ignorer les brouillons expirés
      },
      orderBy: { updatedAt: 'desc' },
    })
  },

  /**
   * Met à jour les données du brouillon (jamais de mot de passe).
   * @param {string} id
   * @param {object} data
   * @returns {Promise<object>}
   */
  async update(id, data) {
    return getPrisma().onboardingDraft.update({
      where: { id },
      data: { data: stripSecrets(data) },
    })
  },

  /**
   * Supprime un brouillon par ID. Accepte un client transactionnel (tx)
   * pour être appelé depuis OnboardingTxPort.
   * @param {string} id
   * @param {object} [tx] - Client Prisma transactionnel (optionnel)
   * @returns {Promise<object>}
   */
  async deleteById(id, tx) {
    return (tx || getPrisma()).onboardingDraft.delete({ where: { id } })
  },

  /**
   * Purge les brouillons expirés. À brancher sur un cron.
   * @returns {Promise<number>} Nombre de brouillons supprimés
   */
  async purgeExpired() {
    const { count } = await getPrisma().onboardingDraft.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    })
    return count
  },
}

module.exports = draftsAdapter
