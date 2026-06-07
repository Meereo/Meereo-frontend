/**
 * formatFCFA — Formateur monétaire unique pour MEEREO
 *
 * Règles :
 *   - Un seul "FCFA" en sortie, jamais de double
 *   - Séparateur milliers français (espace)
 *   - Unit optionnelle : "/ unité", "/ m³", etc.
 *   - Pas de "/ /unité" ni "FCFA FCFA"
 *
 * @param {number} amount - Montant en FCFA
 * @param {string} [unit] - Unité optionnelle (ex: "unité", "m³", "palette")
 * @returns {string} ex: "250 000 FCFA" ou "85 000 FCFA / m³"
 */
export function formatFCFA(amount, unit) {
  if (amount == null || isNaN(amount)) return '0 FCFA'
  const formatted = Math.round(Number(amount)).toLocaleString('fr-FR')
  if (unit) {
    const cleanUnit = String(unit).replace(/^\/\s*/, '').replace(/^FCFA\s*/i, '').trim()
    return cleanUnit ? `${formatted} FCFA / ${cleanUnit}` : `${formatted} FCFA`
  }
  return `${formatted} FCFA`
}

/**
 * formatFCFAShort — Version courte pour KPIs
 * @param {number} amount
 * @returns {string} ex: "250M FCFA", "1,2Mds FCFA"
 */
export function formatFCFAShort(amount) {
  if (!amount) return '0 FCFA'
  const n = Number(amount)
  if (n >= 1e9) return (n / 1e9).toFixed(1).replace('.0', '') + ' Mds FCFA'
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace('.0', '') + ' M FCFA'
  if (n >= 1e3) return Math.round(n / 1e3) + ' K FCFA'
  return n.toLocaleString('fr-FR') + ' FCFA'
}
