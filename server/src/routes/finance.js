// ─────────────────────────────────────────────────────────────────────────────
//  MEEREO — /api/finance
//  CRUD complet pour Budgets, Dépenses et Factures (PostgreSQL).
// ─────────────────────────────────────────────────────────────────────────────

const { Router } = require('express')
const { getPrisma } = require('../db')
const { requireAuth } = require('../middleware/auth')
const { createError } = require('../middleware/errorHandler')

const router = Router()

const parseNum = (v) => {
  const n = parseFloat(String(v ?? 0).replace(',', '.'))
  return isNaN(n) ? 0 : n
}

// ─── BUDGETS ──────────────────────────────────────────────────────────────────

router.get('/budgets', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const where = { ownerId: req.user.id }
    if (req.query.projectId) where.projectId = req.query.projectId
    const items = await prisma.budget.findMany({ where, orderBy: { createdAt: 'desc' } })
    res.json(items)
  } catch (e) { next(e) }
})

router.post('/budgets', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { label, montant, projectId } = req.body
    if (!label?.trim()) throw createError('label requis', 400)
    const item = await prisma.budget.create({
      data: { label: label.trim(), montant: parseNum(montant), projectId: projectId || null, ownerId: req.user.id },
    })
    res.status(201).json(item)
  } catch (e) { next(e) }
})

router.patch('/budgets/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.budget.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.ownerId !== req.user.id) throw createError('Non autorisé', 403)
    const data = {}
    if (req.body.label     !== undefined) data.label     = req.body.label
    if (req.body.montant   !== undefined) data.montant   = parseNum(req.body.montant)
    if (req.body.projectId !== undefined) data.projectId = req.body.projectId || null
    res.json(await prisma.budget.update({ where: { id: req.params.id }, data }))
  } catch (e) { next(e) }
})

router.delete('/budgets/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.budget.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.ownerId !== req.user.id) throw createError('Non autorisé', 403)
    await prisma.budget.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

// ─── DÉPENSES ─────────────────────────────────────────────────────────────────

router.get('/expenses', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const where = { ownerId: req.user.id }
    if (req.query.projectId) where.projectId = req.query.projectId
    res.json(await prisma.expense.findMany({ where, orderBy: { createdAt: 'desc' } }))
  } catch (e) { next(e) }
})

router.post('/expenses', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { label, montant, category, provider, projectId } = req.body
    if (!label?.trim()) throw createError('label requis', 400)
    const item = await prisma.expense.create({
      data: {
        label:     label.trim(),
        montant:   parseNum(montant),
        category:  category  || '',
        provider:  provider  || null,
        projectId: projectId || null,
        ownerId:   req.user.id,
      },
    })
    res.status(201).json(item)
  } catch (e) { next(e) }
})

router.patch('/expenses/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.expense.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.ownerId !== req.user.id) throw createError('Non autorisé', 403)
    const data = {}
    if (req.body.label    !== undefined) data.label    = req.body.label
    if (req.body.montant  !== undefined) data.montant  = parseNum(req.body.montant)
    if (req.body.category !== undefined) data.category = req.body.category || ''
    if (req.body.provider !== undefined) data.provider = req.body.provider || null
    res.json(await prisma.expense.update({ where: { id: req.params.id }, data }))
  } catch (e) { next(e) }
})

router.delete('/expenses/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.expense.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.ownerId !== req.user.id) throw createError('Non autorisé', 403)
    await prisma.expense.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

// ─── FACTURES ─────────────────────────────────────────────────────────────────

router.get('/invoices', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const where = { ownerId: req.user.id }
    if (req.query.projectId) where.projectId = req.query.projectId
    res.json(await prisma.invoice.findMany({ where, orderBy: { createdAt: 'desc' } }))
  } catch (e) { next(e) }
})

router.post('/invoices', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const { label, montant, provider, statut, projectId } = req.body
    if (!label?.trim()) throw createError('label requis', 400)
    const item = await prisma.invoice.create({
      data: {
        label:     label.trim(),
        montant:   parseNum(montant),
        provider:  provider  || null,
        statut:    statut    || 'brouillon',
        projectId: projectId || null,
        ownerId:   req.user.id,
      },
    })
    res.status(201).json(item)
  } catch (e) { next(e) }
})

router.patch('/invoices/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.invoice.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.ownerId !== req.user.id) throw createError('Non autorisé', 403)
    const data = {}
    if (req.body.label    !== undefined && req.body.label)   data.label    = req.body.label
    if (req.body.montant  !== undefined) data.montant  = parseNum(req.body.montant)
    if (req.body.provider !== undefined) data.provider = req.body.provider || null
    if (req.body.statut   !== undefined && req.body.statut)  data.statut   = req.body.statut
    if (req.body.projectId !== undefined) data.projectId = req.body.projectId || null
    res.json(await prisma.invoice.update({ where: { id: req.params.id }, data }))
  } catch (e) { next(e) }
})

router.delete('/invoices/:id', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const existing = await prisma.invoice.findUnique({ where: { id: req.params.id } })
    if (!existing || existing.ownerId !== req.user.id) throw createError('Non autorisé', 403)
    await prisma.invoice.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { next(e) }
})

// ─── RAPPORTS (agrégats) ──────────────────────────────────────────────────────

router.get('/reports', requireAuth, async (req, res, next) => {
  try {
    const prisma = getPrisma()
    const where = req.query.projectId
      ? { ownerId: req.user.id, projectId: req.query.projectId }
      : { ownerId: req.user.id }

    const [budgets, expenses, invoices] = await Promise.all([
      prisma.budget.findMany({ where }),
      prisma.expense.findMany({ where }),
      prisma.invoice.findMany({ where }),
    ])

    const totalBudget  = budgets.reduce((s, b) => s + b.montant, 0)
    const totalExpense = expenses.reduce((s, e) => s + e.montant, 0)
    const totalPaid    = invoices
      .filter(i => i.statut === 'payee' || i.statut === 'validee')
      .reduce((s, i) => s + i.montant, 0)
    const burnRate = totalBudget > 0 ? Math.round(totalExpense / totalBudget * 100) : 0

    // Dépenses par catégorie
    const byCat = {}
    for (const e of expenses) {
      const cat = e.category || 'Divers'
      byCat[cat] = (byCat[cat] || 0) + e.montant
    }
    const expensesByCategory = Object.entries(byCat).map(([name, value]) => ({ name, value }))

    // Dépenses mensuelles (6 derniers mois)
    const now = new Date()
    const monthlyExpenses = []
    for (let i = 5; i >= 0; i--) {
      const d   = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const label = d.toLocaleString('fr-FR', { month: 'short' })
      const sum = expenses
        .filter(e => {
          const ed = new Date(e.createdAt)
          return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth()
        })
        .reduce((s, e) => s + e.montant, 0)
      monthlyExpenses.push({ month: label, montant: sum })
    }

    res.json({
      budgets, expenses, invoices,
      kpis: { totalBudget, totalExpense, totalPaid, burnRate },
      expensesByCategory,
      monthlyExpenses,
    })
  } catch (e) { next(e) }
})

module.exports = router
