/**
 * Gestionnaire d'erreurs global Express.
 * Doit être le DERNIER middleware enregistré (app.use(errorHandler)).
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Erreurs de validation Zod (lancées avec err.name === 'ZodError')
  if (err.name === 'ZodError') {
    const errors = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    return res.status(422).json({ error: 'Données invalides', errors })
  }

  // Erreurs Prisma — violation de contrainte unique (P2002)
  if (err.code === 'P2002') {
    const field = err.meta?.target?.[0] || 'champ'
    return res.status(409).json({ error: `Cette valeur est déjà utilisée (${field})` })
  }

  // Erreurs métier avec statusCode explicite
  if (err.statusCode) {
    return res.status(err.statusCode).json({ error: err.message })
  }

  // Erreur interne non traitée
  const isDev = process.env.NODE_ENV !== 'production'
  console.error('[ERROR]', err)
  return res.status(500).json({
    error: 'Erreur interne du serveur',
    ...(isDev && { detail: err.message, stack: err.stack }),
  })
}

/**
 * Helper pour créer des erreurs HTTP typées.
 * @param {string} message
 * @param {number} statusCode
 */
function createError(message, statusCode = 400) {
  const err = new Error(message)
  err.statusCode = statusCode
  return err
}

module.exports = { errorHandler, createError }
