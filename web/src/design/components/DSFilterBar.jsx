/**
 * DSFilterBar — Unified filter pills.
 * Replaces the repeated filter pill patterns in 10+ pages.
 *
 * @param {Array<{key:string, label:string}>} filters
 * @param {string} active - Currently active filter key
 * @param {Function} onChange - Called with the filter key
 */
export default function DSFilterBar({ filters = [], active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {filters.map(f => (
        <button
          key={f.key}
          className={`filter-pill ${active === f.key ? 'active' : ''}`}
          onClick={() => onChange(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  )
}
