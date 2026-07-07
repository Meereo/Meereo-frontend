import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useMeereo } from '../../hooks/useMeereoStore'
import useUserIdentity from '../../hooks/useUserIdentity'

export default function UserMenu({ onNavigate }) {
  const { store, updateStore, logoutUser } = useMeereo()
  const navigate = useNavigate()
  const id = useUserIdentity()
  const [open, setOpen] = useState(false)
  const btnRef = useRef(null)
  const [pos, setPos] = useState({ top: 0, right: 0 })

  const toggle = useCallback(() => {
    setOpen(o => {
      if (!o && btnRef.current) {
        const r = btnRef.current.getBoundingClientRect()
        setPos({ top: r.bottom + 8, right: window.innerWidth - r.right })
      }
      return !o
    })
  }, [])

  const handleLogout = async () => {
    setOpen(false)
    await logoutUser()  // vide token mémoire + sessionStorage + cookie + socket
    navigate('/onboarding')
  }

  const handleParametres = () => {
    setOpen(false)
    if (onNavigate) onNavigate('parametres')
    else if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('meereo-navigate', { detail: 'parametres' }))
  }

  const handleProfil = () => {
    setOpen(false)
    const publicId = store?.user?.publicId
    navigate(publicId ? `/pro?uuid=${publicId}` : '/pro')
  }

  const btnStyle = { width: '100%', padding: '9px 16px', background: 'none', border: 'none', textAlign: 'left', fontSize: 12.5, fontFamily: 'var(--f)', color: 'var(--tx)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }

  return (
    <>
      <div className="um-avatar" ref={btnRef} onClick={toggle}>
        {id.photo
          ? <img src={id.photo} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
          : id.initials ? <span>{id.initials}</span> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        }
      </div>
      {open && createPortal(
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99994 }} onClick={() => setOpen(false)} />
          <div className="um-dropdown" style={{ position: 'fixed', top: pos.top, right: pos.right, zIndex: 99995 }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
              {id.displayName && <div style={{ fontSize: 13, fontWeight: 600 }}>{id.displayName}</div>}
              {id.email && <div style={{ fontSize: 11, color: 'var(--t3)' }}>{id.email}</div>}
              {!id.displayName && !id.email && <div style={{ fontSize: 12, color: 'var(--t4)' }}>Compte</div>}
            </div>
            <div style={{ padding: '6px 0' }}>
              {id.userType === 'pro' && (
                <button onClick={handleProfil} style={btnStyle} onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Mon profil professionnel
                </button>
              )}
              <button onClick={handleParametres} style={btnStyle} onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                Paramètres
              </button>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', padding: '6px 0' }}>
              <button onClick={handleLogout} style={{ ...btnStyle, color: 'var(--err)' }} onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'} onMouseOut={e => e.currentTarget.style.background = 'none'}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Se déconnecter
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
