/**
 * ModalConfirm — Composant de confirmation pour actions sensibles
 *
 * Usage :
 *   <ModalConfirm
 *     open={showConfirm}
 *     title="Supprimer ce produit ?"
 *     message="Cette action est irréversible."
 *     confirmLabel="Supprimer"
 *     cancelLabel="Annuler"
 *     destructive
 *     onConfirm={() => { deleteProduct(id); setShowConfirm(false) }}
 *     onCancel={() => setShowConfirm(false)}
 *   />
 */
export default function ModalConfirm({
  open,
  title = 'Confirmer cette action ?',
  message = '',
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  destructive = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        animation: 'modalIn .12s ease',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 18,
          width: '100%',
          maxWidth: 400,
          boxShadow: '0 24px 80px rgba(0,0,0,.18)',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Content */}
        <div style={{ padding: '28px 28px 20px', textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: destructive ? 'rgba(186,26,26,.06)' : 'rgba(0,0,0,.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            {destructive
              ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            }
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, color: '#111' }}>{title}</div>
          {message && <div style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>{message}</div>}
        </div>
        {/* Actions */}
        <div style={{
          padding: '16px 28px 24px',
          display: 'flex', gap: 10,
        }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 12,
              background: '#f3f4f5', color: '#555',
              border: '1px solid rgba(0,0,0,.06)',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--f)',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 12,
              background: destructive ? '#ba1a1a' : '#191c1d',
              color: '#fff', border: 'none',
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'var(--f)',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
