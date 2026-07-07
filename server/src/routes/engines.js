const { Router } = require('express')
const { requireAuth } = require('../middleware/auth')
const { workflow, rules, permissions } = require('../engines')

const router = Router()

// ─── GET /api/engines/workflow/:name/:state — transitions possibles ──────────
router.get('/workflow/:name/:state', requireAuth, (req, res) => {
  const { name, state } = req.params
  const result = workflow.canTransition(name, state, req.query.target || '')
  const available = workflow.getAvailableTransitions(name, state)
  res.json({ currentState: state, availableTransitions: available, ...(req.query.target ? { check: result } : {}) })
})

// ─── POST /api/engines/rules/evaluate — évaluer des règles métier ────────────
router.post('/rules/evaluate', requireAuth, (req, res) => {
  const { rules: ruleNames, context } = req.body
  if (!Array.isArray(ruleNames)) return res.status(400).json({ error: 'rules doit être un tableau' })
  const result = rules.evaluateAll(ruleNames, { ...context, user: req.user })
  res.json(result)
})

// ─── GET /api/engines/rules — lister toutes les règles ──────────────────────
router.get('/rules', requireAuth, (req, res) => {
  res.json(rules.listRules())
})

// ─── POST /api/engines/permissions/check — vérifier une permission ───────────
router.post('/permissions/check', requireAuth, (req, res) => {
  const { role, action, workflowType, workflowState } = req.body
  const result = permissions.checkPermission({ role, action, workflowType, workflowState })
  res.json(result)
})

// ─── GET /api/engines/permissions/actions — actions disponibles pour un rôle ─
router.get('/permissions/actions', requireAuth, (req, res) => {
  const { role, workflowType, workflowState } = req.query
  if (!role) return res.status(400).json({ error: 'role requis' })
  const actions = permissions.getAvailableActions(role, workflowType, workflowState)
  res.json({ role, workflowType, workflowState, actions })
})

module.exports = router
