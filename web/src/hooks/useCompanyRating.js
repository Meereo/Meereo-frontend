/**
 * AVS-01 — Hook centralisé pour la note et les avis d'une entreprise.
 *
 * Source UNIQUE : toutes les interfaces (page publique, annuaire, AO, messagerie)
 * appellent ce hook pour obtenir la note moyenne, le nombre d'avis et les statistiques.
 * Aucune copie ni calcul indépendant — même source partout.
 *
 * @param {Array} reviews - Tableau d'avis depuis le store ou l'API
 * @param {string} [companyId] - ID de l'entreprise (pour filtrer si nécessaire)
 * @returns {{ average: number, count: number, stars: object, hasReviews: boolean }}
 */
export function computeRating(reviews, companyId) {
  const filtered = companyId
    ? (reviews || []).filter(r => r.targetId === companyId)
    : (reviews || [])

  if (filtered.length === 0) {
    return {
      average: 0,
      count: 0,
      stars: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      hasReviews: false,
      label: 'Aucun avis pour le moment',
    }
  }

  const total = filtered.reduce((sum, r) => sum + (Number(r.note) || 0), 0)
  const average = Math.round((total / filtered.length) * 10) / 10

  const stars = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  filtered.forEach(r => {
    const n = Math.round(Number(r.note) || 0)
    if (n >= 1 && n <= 5) stars[n]++
  })

  // Moyennes par critère (si disponibles)
  const criteria = {}
  const criteriaKeys = ['qualite', 'delais', 'communication']
  for (const key of criteriaKeys) {
    const vals = filtered.filter(r => r[key] != null).map(r => Number(r[key]))
    if (vals.length > 0) {
      criteria[key] = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10
    }
  }

  return {
    average,
    count: filtered.length,
    stars,
    hasReviews: true,
    criteria,
    label: `${average}/5 (${filtered.length} avis)`,
  }
}

/**
 * Composant d'affichage des étoiles — à utiliser PARTOUT (QAL-02/AVS-01).
 * Même rendu sur page publique, annuaire, AO, messagerie.
 */
export function StarRating({ rating, size = 12, showCount = false, count = 0 }) {
  const stars = []
  const full = Math.floor(rating)
  const half = rating - full >= 0.3

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<span key={i} style={{ color: '#F59E0B', fontSize: size }}>★</span>)
    } else if (i === full && half) {
      stars.push(<span key={i} style={{ color: '#F59E0B', fontSize: size, opacity: 0.5 }}>★</span>)
    } else {
      stars.push(<span key={i} style={{ color: '#D1D5DB', fontSize: size }}>★</span>)
    }
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      {stars}
      {showCount && count > 0 && (
        <span style={{ fontSize: size * 0.85, color: 'var(--t4)', marginLeft: 2 }}>({count})</span>
      )}
    </span>
  )
}
