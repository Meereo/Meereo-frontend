// MKT_CATS — référentiel statique des catégories marketplace.
// Intentionnellement gardé côté client : aucun modèle Prisma ni route /api/marketplace/categories
// n'existe encore. Quand les fournisseurs pourront déclarer leurs propres catégories en base,
// remplacer par un appel api.marketplace.getCategories() avec ce tableau comme fallback.
export const MKT_CATS = [
  { id: 'all', label: 'Tout', ico: '🏪' },
  { id: 'gros-oeuvre', label: 'Gros Oeuvre', ico: '🏗️' },
  { id: 'structure', label: 'Structure & Charpente', ico: '🔩' },
  { id: 'menuiseries', label: 'Menuiseries', ico: '🪟' },
  { id: 'revetements', label: 'Revetements', ico: '🪨' },
  { id: 'plomberie-cvc', label: 'Plomberie & CVC', ico: '🚿' },
  { id: 'electricite', label: 'Electricite', ico: '⚡' },
  { id: 'green', label: 'Green & Energie', ico: '☀️' },
  { id: 'mobilier', label: 'Mobilier Bureau', ico: '💼' },
  { id: 'mobilier-maison', label: 'Mobilier Maison', ico: '🛋️' },
  { id: 'cuisine', label: 'Cuisine & SDB', ico: '🍳' },
  { id: 'exterieur', label: 'Exterieur & Jardin', ico: '🌳' },
]

export const MKT_ITEMS = []

export const MKT_FLASH = []
