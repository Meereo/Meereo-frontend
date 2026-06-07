/**
 * DSEmptyState — Unified empty state for all pages.
 * Inspired by Procore/Monday: clean, centered, single CTA, no clutter.
 *
 * @param {string} icon - Emoji or icon
 * @param {string} title - Main message
 * @param {string} description - Supporting text
 * @param {string} actionLabel - CTA text
 * @param {Function} onAction - CTA handler
 */
export default function DSEmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '56px 24px',
      textAlign: 'center',
    }}>
      {icon && (
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: 'var(--s2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24,
          marginBottom: 16,
        }}>{icon}</div>
      )}
      <div style={{
        fontSize: 15,
        fontWeight: 700,
        color: 'var(--tx)',
        marginBottom: 4,
        letterSpacing: '-.2px',
      }}>{title}</div>
      {description && (
        <div style={{
          fontSize: 12.5,
          color: 'var(--t3)',
          lineHeight: 1.5,
          maxWidth: 320,
          marginBottom: actionLabel ? 20 : 0,
        }}>{description}</div>
      )}
      {actionLabel && onAction && (
        <button
          className="btn btn-primary btn-sm"
          onClick={onAction}
          style={{ fontSize: 12 }}
        >{actionLabel}</button>
      )}
    </div>
  )
}
