/**
 * SYS-02 — Middleware de permission centralisé
 *
 * Appelle checkPermission() du permissionEngine au lieu de vérifications ad-hoc
 * dans chaque route. La matrice de droits (SYS-02) est la source unique des permissions.
 *
 * Usage dans les routes :
 *   const { requirePermission } = require('../middleware/permission')
 *
 *   // Simple — vérifie l'action contre le rôle de l'utilisateur
 *   router.post('/missions', requireAuth, requirePermission('create_mission'), handler)
 *
 *   // Avec contexte workflow — passe le type et l'état de l'objet
 *   router.patch('/missions/:id', requireAuth, requirePermission('advance_mission', {
 *     workflowType: 'mission',
 *     getState: async (req) => {
 *       const m = await prisma.mission.findUnique({ where: { id: req.params.id } })
 *       return m?.status
 *     }
 *   }), handler)
 */

const { checkPermission } = require('../engines/permissionEngine')
const { getPrisma } = require('../db')

/**
 * Détermine le rôle de l'utilisateur dans le contexte du projet.
 * Priorité : membership du projet → type de compte global.
 */
async function resolveRole(user, projectId) {
  // Admin MEEREO
  if (user.role === 'admin') return 'admin'

  // Si un projectId est disponible, vérifier la membership
  if (projectId) {
    const prisma = getPrisma()
    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: user.id } },
    }).catch(() => null)

    if (member) {
      // Rôles internes du projet
      const roleMap = {
        'ADMIN': 'pro_admin',
        'SUPPLIER': 'fournisseur',
        'INTERVENANT': 'intervenant',
        'ARCHITECTE': 'architecte',
        'BET': 'bet',
        'ENTREPRISE': 'entreprise',
        'MEMBER': 'pro_member',
      }
      return roleMap[member.role] || 'pro_member'
    }

    // Vérifier si owner ou client du projet
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true, clientId: true },
    }).catch(() => null)

    if (project) {
      if (project.ownerId === user.id) return 'pro_admin'
      if (project.clientId === user.id) return 'client'
    }
  }

  // Fallback : type de compte global
  const typeMap = {
    'pro': 'pro_admin',
    'client': 'client',
    'fournisseur': 'fournisseur',
  }
  return typeMap[user.type] || 'pro_member'
}

/**
 * Middleware Express de vérification de permission.
 *
 * @param {string} action - Action à vérifier (ex: 'create_mission', 'edit_project')
 * @param {object} [options]
 * @param {string} [options.workflowType] - Type de workflow ('mission', 'project', 'document')
 * @param {Function} [options.getState] - async (req) => string — récupère l'état workflow
 * @param {Function} [options.getProjectId] - async (req) => string — récupère le projectId du contexte
 */
function requirePermission(action, options = {}) {
  return async (req, res, next) => {
    try {
      // Résoudre le projectId depuis le body, params ou query
      let projectId = req.body?.projectId || req.params?.projectId || req.query?.projectId
      if (options.getProjectId) {
        projectId = await options.getProjectId(req)
      }

      // Résoudre le rôle de l'utilisateur dans le contexte
      const role = await resolveRole(req.user, projectId)

      // Résoudre l'état du workflow si nécessaire
      let workflowState = null
      if (options.workflowType && options.getState) {
        workflowState = await options.getState(req)
      }

      // Vérifier la permission
      const result = checkPermission({
        role,
        action,
        workflowType: options.workflowType || null,
        workflowState,
      })

      if (!result.allowed) {
        return res.status(403).json({
          error: result.reason || 'Action non autorisée',
          action,
          role,
        })
      }

      // Attacher le rôle résolu à la requête pour usage dans le handler
      req.resolvedRole = role
      next()
    } catch (err) {
      next(err)
    }
  }
}

module.exports = { requirePermission, resolveRole }
