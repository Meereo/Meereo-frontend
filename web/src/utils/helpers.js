export function formatMoneyDisplay(val) {
  if (!val) return '0 FCFA'
  const n = parseFloat(String(val).replace(/[^\d.-]/g, ''))
  if (isNaN(n)) return '0 FCFA'
  return n.toLocaleString('fr-FR') + ' FCFA'
}

export function formatDateFR(iso) {
  if (!iso) return '\u2014'
  try {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    const dd = String(d.getDate()).padStart(2, '0')
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  } catch { return iso }
}

/**
 * Formate un budget brut (string ou number) pour l'affichage.
 * Gère : "100000000" → "100 000 000", "100 M FCFA" → passthrough,
 * "50-150 M FCFA" → passthrough (plage), et les nombres purs.
 * N'ajoute PAS la devise — à combiner avec useDevise.format() si besoin.
 */
export function formatBudgetDisplay(budget) {
  if (!budget && budget !== 0) return '—'
  const s = String(budget).trim()
  if (!s) return '—'
  // If it already contains readable formatting (letters, spaces, dashes between numbers), pass through
  if (/[A-Za-z]/.test(s) || /\d\s+\d/.test(s) || /\d-\d/.test(s)) return s
  // Pure numeric string — format with separators
  const n = parseFloat(s.replace(/[^\d.-]/g, ''))
  if (isNaN(n) || n === 0) return s
  return new Intl.NumberFormat('fr-FR').format(Math.round(n))
}

export function formatMonthYearFR(date) {
  const months = ['Janvier','F\u00e9vrier','Mars','Avril','Mai','Juin','Juillet','Ao\u00fbt','Septembre','Octobre','Novembre','D\u00e9cembre']
  return months[date.getMonth()] + ' ' + date.getFullYear()
}

export function getProgressColor(pct) {
  if (pct >= 75) return '#16A34A'
  if (pct >= 40) return '#F59E0B'
  return '#ba1a1a'
}

export function safeText(v) { return v || '\u2014' }
export function safeInt(v) { return parseInt(v) || 0 }
export function clampProgress(v) { return Math.max(0, Math.min(100, parseInt(v) || 0)) }

export function statusBadge(status) {
  const map = {
    'actif': 'badge-success', 'en cours': 'badge-active', 'brouillon': 'badge-neutral',
    'termin\u00e9': 'badge-success', 'en retard': 'badge-danger', 'en attente': 'badge-warning',
    'valid\u00e9': 'badge-success', 'refus\u00e9': 'badge-danger', 'ouvert': 'badge-active',
    'ferm\u00e9': 'badge-neutral', 'accept\u00e9e': 'badge-success', 'rejet\u00e9e': 'badge-danger',
    'en n\u00e9gociation': 'badge-warning', 'soumise': 'badge-warning', 'draft': 'badge-neutral',
    'open': 'badge-active', 'ongoing': 'badge-active', 'completed': 'badge-success',
    'pending': 'badge-warning', 'confirmed': 'badge-success', 'rejected': 'badge-danger',
    'accepted': 'badge-success'
  }
  return map[(status || '').toLowerCase()] || 'badge-neutral'
}

export function parseBudget(str) {
  if (!str) return 0
  const s = String(str).replace(/\s/g, '').replace(/FCFA/gi, '').replace(/\u20ac/g, '')
  if (s.includes('Mds')) return parseFloat(s) * 1e9
  if (s.includes('M')) return parseFloat(s) * 1e6
  if (s.includes('K')) return parseFloat(s) * 1e3
  return parseFloat(s.replace(/[^\d.-]/g, '')) || 0
}
