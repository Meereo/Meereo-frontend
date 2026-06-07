/**
 * Métier color palette — sober, premium tones.
 * Used for AO badge accents and gear icons.
 */
const METIER_COLORS = {
  'Architecte':         '#2563EB',
  'BET Structure':      '#7C3AED',
  'BET Fluides':        '#0891B2',
  'Gros-oeuvre':        '#DC2626',
  'Electricite':        '#F59E0B',
  'Plomberie':          '#0891B2',
  'CVC':                '#6366F1',
  'Menuiseries':        '#92400E',
  'Facades':            '#64748B',
  'Second-oeuvre':      '#EA580C',
  'VRD':                '#16A34A',
  'Economiste':         '#7C3AED',
  'OPC':                '#0F766E',
  'Geometre':           '#4338CA',
  'Designer interieur': '#BE185D',
}

export function getMetierColor(metier) {
  if (!metier) return '#6B7280'
  return METIER_COLORS[metier] || '#6B7280'
}

/**
 * AoGear — Small rotating cog icon for AO items.
 * @param {number} size - Icon size (default 13)
 * @param {string} color - Stroke color (default var(--tx))
 */
export default function AoGear({ size = 13, color }) {
  return (
    <span className="ao-gear">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || 'var(--tx)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
      </svg>
    </span>
  )
}
