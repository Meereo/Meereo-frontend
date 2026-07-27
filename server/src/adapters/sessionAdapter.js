// ─── SessionPort ─────────────────────────────────────────────────────────────
// Ouvre une session identique à celle de POST /auth/register dans auth.js :
//   • JWT signé (jsonwebtoken, même secret, même durée)
//   • Cookie httpOnly meereo_token (même paramètres)
//
// NAV-07 : la session est ouverte DANS LA MÊME RÉPONSE que la création du
// compte — aucun écran de connexion intermédiaire.
// ─────────────────────────────────────────────────────────────────────────────

const { signToken } = require('../utils/token')

const sessionAdapter = {
  /**
   * Ouvre une session pour un utilisateur fraîchement créé.
   *
   * @param {{ id: string, type: string, [key: string]: any }} user
   *   L'objet user retourné par la transaction (contient passwordHash).
   * @param {import('express').Response} res
   *   Réponse Express sur laquelle le cookie est posé.
   * @returns {{ token: string, user: object }}
   *   Token JWT + user public (sans passwordHash).
   */
  open(user, res) {
    const token = signToken({ id: user.id, type: user.type })

    const isProd = process.env.NODE_ENV === 'production'
    res.cookie('meereo_token', token, {
      httpOnly: true,
      sameSite: 'strict',
      secure: isProd,
      maxAge: 30 * 24 * 3600 * 1000, // 30 jours — identique à auth.js
      path: '/',
    })

    // Ne jamais exposer le hash dans la réponse JSON
    const { passwordHash, ...publicUser } = user
    return { token, user: publicUser }
  },
}

module.exports = sessionAdapter
