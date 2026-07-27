// ─── CompaniesPort ───────────────────────────────────────────────────────────
// Opérations sur la table « entreprises » (modèle Entreprise du projet).
// Le paquet d'onboarding nomme cette entité « Company » ; ici tout pointe
// vers la table réelle du projet.
// ─────────────────────────────────────────────────────────────────────────────

const { getPrisma } = require('../db')

const companiesAdapter = {
  /**
   * Recherche une entreprise par RCCM.
   * @param {string} rccm
   * @returns {Promise<object|null>}
   */
  async findByRccm(rccm) {
    const prisma = getPrisma()
    return prisma.entreprise.findUnique({ where: { rccm } })
  },

  /**
   * Recherche une entreprise par NCC (numéro de contribuable / tax ID).
   * @param {string} ncc
   * @returns {Promise<object|null>}
   */
  async findByTaxId(ncc) {
    const prisma = getPrisma()
    return prisma.entreprise.findUnique({ where: { ncc } })
  },

  /**
   * Vérifie si l'entreprise possède déjà un compte actif pour le rôle donné.
   * Un compte actif = profil rattaché à un user dont deletedAt IS NULL.
   * @param {string} entrepriseId
   * @param {'pro'|'fournisseur'} role
   * @returns {Promise<boolean>}
   */
  async hasAccountForRole(entrepriseId, role) {
    const prisma = getPrisma()
    if (role === 'pro') {
      const hit = await prisma.proProfile.findFirst({
        where: { entrepriseId, user: { deletedAt: null } },
        select: { userId: true },
      })
      return !!hit
    }
    if (role === 'fournisseur') {
      const hit = await prisma.fournisseurProfile.findFirst({
        where: { entrepriseId, user: { deletedAt: null } },
        select: { userId: true },
      })
      return !!hit
    }
    // Les clients n'ont pas d'entreprise rattachée
    return false
  },
}

module.exports = companiesAdapter
