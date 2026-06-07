import { Router } from 'express'

/**
 * Finance routes — Budget / Expenses / Invoices / KPIs
 *
 * Data model strategy (no schema migration needed):
 *   Transaction.type = 'budget'   → budget allocation per project
 *   Transaction.type = 'depense'  → expense
 *   Transaction.type = 'facture'  → invoice (statut: brouillon → emise → payee → validee)
 *   Transaction.type = 'credit'   → income / payment received
 *
 * All finance data is in the existing Transaction model.
 */
export default function financeRouter(prisma) {
  const router = Router()

  // ═══════════════════════════════════════
  //  BUDGETS
  // ═══════════════════════════════════════

  // GET /finance/budgets[?projectId=xxx]
  router.get('/budgets', async (req, res) => {
    try {
      const where = { type: 'budget' }
      if (req.query.projectId) where.projectId = req.query.projectId
      const budgets = await prisma.transaction.findMany({ where, orderBy: { createdAt: 'desc' } })
      res.json(budgets)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // POST /finance/budgets
  router.post('/budgets', async (req, res) => {
    try {
      const { projectId, montant, label } = req.body
      if (montant == null || isNaN(parseFloat(montant))) return res.status(400).json({ error: 'montant invalide' })
      const budget = await prisma.transaction.create({
        data: {
          type: 'budget',
          label: label || 'Budget général',
          montant: parseFloat(montant),
          statut: 'confirme',
          projectId: projectId || null,
          userId: req.userId || null,
        },
      })
      res.status(201).json(budget)
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  // PATCH /finance/budgets/:id
  router.patch('/budgets/:id', async (req, res) => {
    try {
      const { montant, label, statut } = req.body
      const data = {}
      if (montant != null) data.montant = parseFloat(montant)
      if (label) data.label = label
      if (statut) data.statut = statut
      if (Object.keys(data).length === 0) return res.status(400).json({ error: 'Aucun champ à mettre à jour' })
      const budget = await prisma.transaction.update({ where: { id: req.params.id }, data })
      res.json(budget)
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  // DELETE /finance/budgets/:id
  router.delete('/budgets/:id', async (req, res) => {
    try {
      await prisma.transaction.delete({ where: { id: req.params.id } })
      res.status(204).end()
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  // ═══════════════════════════════════════
  //  EXPENSES (dépenses)
  // ═══════════════════════════════════════

  // GET /finance/expenses[?projectId=xxx]
  router.get('/expenses', async (req, res) => {
    try {
      const where = { type: 'depense' }
      if (req.query.projectId) where.projectId = req.query.projectId
      if (req.query.statut) where.statut = req.query.statut
      const expenses = await prisma.transaction.findMany({ where, orderBy: { createdAt: 'desc' } })
      res.json(expenses)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // POST /finance/expenses
  router.post('/expenses', async (req, res) => {
    try {
      const { projectId, montant, label, statut, provider } = req.body
      if (!label) return res.status(400).json({ error: 'label requis' })
      if (montant == null || isNaN(parseFloat(montant))) return res.status(400).json({ error: 'montant invalide' })
      const expense = await prisma.transaction.create({
        data: {
          type: 'depense',
          label,
          montant: parseFloat(montant),
          statut: statut || 'confirme',
          provider: provider || null,
          projectId: projectId || null,
          userId: req.userId || null,
        },
      })
      res.status(201).json(expense)
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  // PATCH /finance/expenses/:id
  router.patch('/expenses/:id', async (req, res) => {
    try {
      const { montant, label, statut, provider } = req.body
      const data = {}
      if (montant != null) data.montant = parseFloat(montant)
      if (label) data.label = label
      if (statut) data.statut = statut
      if (provider) data.provider = provider
      if (Object.keys(data).length === 0) return res.status(400).json({ error: 'Aucun champ à mettre à jour' })
      const expense = await prisma.transaction.update({ where: { id: req.params.id }, data })
      res.json(expense)
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  // DELETE /finance/expenses/:id
  router.delete('/expenses/:id', async (req, res) => {
    try {
      await prisma.transaction.delete({ where: { id: req.params.id } })
      res.status(204).end()
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  // ═══════════════════════════════════════
  //  INVOICES (factures)
  //  Workflow: brouillon → emise → payee → validee
  // ═══════════════════════════════════════

  const INVOICE_STATUTS = ['brouillon', 'emise', 'payee', 'validee']

  // GET /finance/invoices[?projectId=xxx&statut=xxx]
  router.get('/invoices', async (req, res) => {
    try {
      const where = { type: 'facture' }
      if (req.query.projectId) where.projectId = req.query.projectId
      if (req.query.statut) where.statut = req.query.statut
      const invoices = await prisma.transaction.findMany({ where, orderBy: { createdAt: 'desc' } })
      res.json(invoices)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  // POST /finance/invoices — create a draft invoice
  router.post('/invoices', async (req, res) => {
    try {
      const { projectId, montant, label, provider } = req.body
      if (!label) return res.status(400).json({ error: 'label requis' })
      if (montant == null || isNaN(parseFloat(montant))) return res.status(400).json({ error: 'montant invalide' })
      const invoice = await prisma.transaction.create({
        data: {
          type: 'facture',
          label,
          montant: parseFloat(montant),
          statut: 'brouillon',
          provider: provider || null,
          projectId: projectId || null,
          userId: req.userId || null,
        },
      })
      res.status(201).json(invoice)
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  // PATCH /finance/invoices/:id — update or advance workflow
  router.patch('/invoices/:id', async (req, res) => {
    try {
      const { montant, label, statut, provider } = req.body
      if (statut && !INVOICE_STATUTS.includes(statut)) {
        return res.status(400).json({ error: `Statut invalide. Acceptés: ${INVOICE_STATUTS.join(', ')}` })
      }
      const data = {}
      if (montant != null) data.montant = parseFloat(montant)
      if (label) data.label = label
      if (statut) data.statut = statut
      if (provider) data.provider = provider
      if (Object.keys(data).length === 0) return res.status(400).json({ error: 'Aucun champ à mettre à jour' })
      const invoice = await prisma.transaction.update({ where: { id: req.params.id }, data })
      res.json(invoice)
    } catch (e) {
      res.status(400).json({ error: e.message })
    }
  })

  // ═══════════════════════════════════════
  //  REPORTS & KPIs
  // ═══════════════════════════════════════

  // GET /finance/reports/:projectId
  router.get('/reports/:projectId', async (req, res) => {
    try {
      const { projectId } = req.params
      const [project, transactions] = await Promise.all([
        prisma.project.findUnique({
          where: { id: projectId },
          select: { id: true, nom: true, budget: true, avancement: true, phase: true, priorite: true },
        }),
        prisma.transaction.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } }),
      ])
      if (!project) return res.status(404).json({ error: 'Projet introuvable' })

      const budgetTx = transactions.filter(t => t.type === 'budget')
      const expenses  = transactions.filter(t => t.type === 'depense')
      const invoices  = transactions.filter(t => t.type === 'facture')
      const credits   = transactions.filter(t => t.type === 'credit' || t.type === 'paiement')

      const totalBudget   = budgetTx.reduce((s, t) => s + t.montant, 0)
      const totalExpenses = expenses.reduce((s, t) => s + t.montant, 0)
      const totalInvoiced = invoices.reduce((s, t) => s + t.montant, 0)
      const totalPaid     = invoices
        .filter(i => i.statut === 'payee' || i.statut === 'validee')
        .reduce((s, t) => s + t.montant, 0)
      const totalCredits  = credits.reduce((s, t) => s + t.montant, 0)
      const remaining     = totalBudget - totalExpenses

      // Monthly breakdown — last 12 months
      const now = new Date()
      const monthlyBreakdown = []
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const year = d.getFullYear()
        const month = d.getMonth()
        const key = `${year}-${String(month + 1).padStart(2, '0')}`
        const monthTxs = transactions.filter(t => {
          const td = new Date(t.createdAt)
          return td.getFullYear() === year && td.getMonth() === month
        })
        monthlyBreakdown.push({
          month: key,
          budgets:  monthTxs.filter(t => t.type === 'budget').reduce((s, t) => s + t.montant, 0),
          depenses: monthTxs.filter(t => t.type === 'depense').reduce((s, t) => s + t.montant, 0),
          factures: monthTxs.filter(t => t.type === 'facture').reduce((s, t) => s + t.montant, 0),
          paye:     monthTxs.filter(t => t.type === 'facture' && (t.statut === 'payee' || t.statut === 'validee')).reduce((s, t) => s + t.montant, 0),
        })
      }

      res.json({
        project,
        kpi: {
          totalBudget,
          totalExpenses,
          totalInvoiced,
          totalPaid,
          totalCredits,
          remaining,
          burnRate: totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0,
          invoiceCollectionRate: totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0,
        },
        transactions: { budgets: budgetTx, expenses, invoices, credits },
        monthlyBreakdown,
      })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  return router
}
