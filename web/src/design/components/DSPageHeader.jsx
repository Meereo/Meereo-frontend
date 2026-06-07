/**
 * DSPageHeader — Unified page header for all cockpit pages.
 * Replaces the ad-hoc .ph-row divs scattered across 20+ pages.
 *
 * @param {string} title
 * @param {string} subtitle
 * @param {React.ReactNode} actions - Right-side slot (buttons, filters)
 */
export default function DSPageHeader({ title, subtitle, actions, children }) {
  return (
    <div className="ph-row" style={{ marginBottom: 24 }}>
      <div>
        <div className="ph-title">{title}</div>
        {subtitle && <div className="ph-sub">{subtitle}</div>}
      </div>
      {(actions || children) && (
        <div className="ph-actions">
          {actions || children}
        </div>
      )}
    </div>
  )
}
