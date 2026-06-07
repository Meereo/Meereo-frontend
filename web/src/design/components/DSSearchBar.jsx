/**
 * DSSearchBar — Unified search input.
 * Replaces the 10+ hand-built search bars.
 *
 * @param {string} value
 * @param {Function} onChange
 * @param {string} placeholder
 */
export default function DSSearchBar({ value, onChange, placeholder = 'Rechercher...' }) {
  return (
    <div data-search style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 14px',
      background: 'transparent',
      borderRadius: 10,
      border: '1px solid var(--border-card)',
    }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          flex: 1, background: 'none', border: 'none', outline: 'none',
          fontSize: 12.5, fontFamily: 'var(--f)', color: 'var(--tx)',
          padding: 0, margin: 0,
        }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          style={{
            width: 18, height: 18, borderRadius: '50%',
            background: 'var(--s3)', border: 'none',
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 10, color: 'var(--t3)', flexShrink: 0,
          }}
        >x</button>
      )}
    </div>
  )
}
