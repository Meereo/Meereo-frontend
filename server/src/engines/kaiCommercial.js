/**
 * MKT-05 — KAi : surveillance de stock & conseil commercial (fournisseur)
 *
 * Exploite les données de stock (MKT-01) et l'historique de ventes pour assister
 * activement le fournisseur. 4 fonctions :
 * 1. Alertes de stock (rupture, stock bas)
 * 2. Suggestion de vente flash (stock dormant)
 * 3. Prédiction des besoins (tendances)
 * 4. Analyse des meilleures ventes
 *
 * Ces analyses sont PRIVÉES au fournisseur (SYS-02).
 */

const { getPrisma } = require('../db')

/**
 * Analyse complète du catalogue d'un fournisseur.
 * Retourne les alertes, suggestions et statistiques.
 *
 * @param {string} supplierId - ID du fournisseur
 * @returns {Promise<object>} Analyse commerciale
 */
async function analyzeSupplierCatalogue(supplierId) {
  const prisma = getPrisma()

  // 1. Récupérer tous les produits du fournisseur
  const products = await prisma.product.findMany({
    where: { supplierId, status: { not: 'archived' } },
    orderBy: { createdAt: 'desc' },
  })

  // 2. Récupérer l'historique des commandes (30 derniers jours)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const orders = await prisma.order.findMany({
    where: {
      sellerId: supplierId,
      createdAt: { gte: thirtyDaysAgo },
      statut: { not: 'cancelled' },
    },
    select: { items: true, total: true, createdAt: true },
  })

  // ─── Alertes de stock ──────────────────────────────────────────────────────
  const DEFAULT_LOW_STOCK_THRESHOLD = 5
  const stockAlerts = []
  for (const p of products) {
    const stock = Number(p.stock) || 0
    if (stock === 0 && p.isPublished) {
      stockAlerts.push({
        type: 'rupture',
        severity: 'critical',
        productId: p.id,
        productName: p.name,
        message: `Rupture de stock : « ${p.name} » — stock à 0, produit encore visible sur la Marketplace.`,
        action: 'Réapprovisionner ou dépublier temporairement.',
      })
    } else if (stock > 0 && stock <= DEFAULT_LOW_STOCK_THRESHOLD && p.isPublished) {
      stockAlerts.push({
        type: 'stock_bas',
        severity: 'warning',
        productId: p.id,
        productName: p.name,
        stock,
        message: `Stock bas : « ${p.name} » — seulement ${stock} unités restantes.`,
        action: 'Prévoir un réapprovisionnement.',
      })
    }
  }

  // ─── Suggestion de vente flash (stock dormant) ─────────────────────────────
  // Un produit « dort » s'il a du stock mais n'a pas été vendu depuis 14+ jours
  const flashSuggestions = []
  const soldProductIds = new Set()
  for (const order of orders) {
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])
    items.forEach(item => soldProductIds.add(item.productId || item.id))
  }
  for (const p of products) {
    const stock = Number(p.stock) || 0
    if (stock > 3 && p.isPublished && !soldProductIds.has(p.id) && !p.flash) {
      flashSuggestions.push({
        productId: p.id,
        productName: p.name,
        stock,
        message: `« ${p.name} » a ${stock} unités en stock mais aucune vente récente. Une vente flash pourrait relancer les ventes.`,
        suggestedDiscount: stock > 20 ? 25 : 15,
      })
    }
  }

  // ─── Analyse des meilleures ventes ─────────────────────────────────────────
  const salesByProduct = {}
  for (const order of orders) {
    const items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])
    for (const item of items) {
      const key = item.productId || item.id || item.name
      if (!salesByProduct[key]) {
        salesByProduct[key] = { name: item.name || key, quantity: 0, revenue: 0 }
      }
      salesByProduct[key].quantity += Number(item.qty || item.quantity || 1)
      salesByProduct[key].revenue += Number(item.price || 0) * Number(item.qty || item.quantity || 1)
    }
  }
  const topSellers = Object.values(salesByProduct)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // ─── Statistiques globales ─────────────────────────────────────────────────
  const totalProducts = products.length
  const publishedProducts = products.filter(p => p.isPublished).length
  const totalStock = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0)
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
  const totalOrders = orders.length

  return {
    stockAlerts,
    flashSuggestions,
    topSellers,
    stats: {
      totalProducts,
      publishedProducts,
      totalStock,
      totalRevenue,
      totalOrders,
      period: '30 derniers jours',
    },
    generatedAt: new Date().toISOString(),
  }
}

module.exports = { analyzeSupplierCatalogue }
