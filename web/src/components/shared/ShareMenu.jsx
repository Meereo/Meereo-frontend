import { useState, useRef, useEffect } from 'react'

/**
 * ShareMenu — Dropdown with WhatsApp, Facebook, Email, Copy link.
 * @param {string} url - URL to share
 * @param {string} text - Share text/description
 * @param {Function} onCopied - Callback after link copied
 */
export default function ShareMenu({ url, text, onCopied }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const shareUrl = url || window.location.href
  const shareText = text || 'Découvrez cet appel d\'offres sur MEEREO'
  const encoded = encodeURIComponent(shareUrl)
  const encodedText = encodeURIComponent(shareText)

  const options = [
    {
      label: 'WhatsApp',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>,
      action: () => window.open(`https://wa.me/?text=${encodedText}%20${encoded}`, '_blank'),
    },
    {
      label: 'Facebook',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>,
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}`, '_blank', 'width=600,height=400'),
    },
    {
      label: 'Email',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--tx)" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
      action: () => window.open(`mailto:?subject=${encodedText}&body=${encodedText}%0A%0A${encoded}`, '_self'),
    },
    {
      label: 'Copier le lien',
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--tx)" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>,
      action: () => {
        navigator.clipboard?.writeText(shareUrl)
        onCopied && onCopied()
        setOpen(false)
      },
    },
  ]

  return (
    <div ref={ref} style={{ position: 'relative', flex: 1 }}>
      <button
        style={{ width: '100%', padding: 11, borderRadius: 9, border: '1px solid var(--border-card)', background: 'var(--surface-1)', color: 'var(--t2)', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12.5 }}
        onClick={() => setOpen(o => !o)}
      >
        Partager
      </button>

      {open && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          marginBottom: 6, background: 'var(--surface-1)', border: '1px solid var(--border-card)',
          borderRadius: 12, boxShadow: '0 8px 28px rgba(0,0,0,.12)', overflow: 'hidden',
          width: 200, zIndex: 100, animation: 'modalIn .15s ease',
        }}>
          {options.map((opt, i) => (
            <button
              key={opt.label}
              onClick={() => { opt.action(); if (opt.label !== 'Copier le lien') setOpen(false) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '11px 16px', border: 'none', background: 'none',
                cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12.5,
                fontWeight: 500, color: 'var(--tx)', textAlign: 'left',
                borderBottom: i < options.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                transition: 'background .1s',
              }}
              onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'}
              onMouseOut={e => e.currentTarget.style.background = 'none'}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}>{opt.icon}</span>
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
