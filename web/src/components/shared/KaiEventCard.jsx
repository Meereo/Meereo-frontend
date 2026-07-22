// ═══════════════════════════════════════════════════════
//  KAi Event Cards — Animated event notifications
//  Spec v1.0 : séquences événementielles exactes
// ═══════════════════════════════════════════════════════

import { useState, useRef, useCallback, useEffect } from 'react'
import { Mail, MailOpen, Check, ShoppingBag, Sparkles, RefreshCw } from 'lucide-react'
import KaiAvatar from './KaiAvatar'

// ── Shared replay hook ──
function useReplayable(playFn) {
  const [playing, setPlaying] = useState(false)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  // Auto-play on mount
  useEffect(() => { playFn(setPlaying, mountedRef) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const replay = useCallback(() => {
    setPlaying(false)
    // Force reflow before replaying
    requestAnimationFrame(() => {
      if (mountedRef.current) playFn(setPlaying, mountedRef)
    })
  }, [playFn])

  return { playing, replay }
}

// ── Replay button (ti-refresh → RefreshCw) ──
function ReplayButton({ onClick }) {
  return (
    <button className="kai-event-replay" onClick={onClick} title="Rejouer" aria-label="Rejouer l'animation">
      <RefreshCw size={13} />
    </button>
  )
}

// ═══════════════════════════════════════════════════════
// MESSAGE ARRIVAL
// t=0    envelope closed: scale-in bounce .35s
// t=550  icon → envelope open
// t=1000 badge fade .3s, content bars fade+slide .35s
// ═══════════════════════════════════════════════════════

function playMessage(setState, mountedRef) {
  setState({ phase: 'closed', iconScale: true, barsVisible: false })
  setTimeout(() => { if (mountedRef.current) setState(s => ({ ...s, phase: 'open' })) }, 550)
  setTimeout(() => { if (mountedRef.current) setState(s => ({ ...s, phase: 'content', barsVisible: true })) }, 1000)
}

export function KaiMessageArrival({ label = 'Nouveau message' }) {
  const [state, setState] = useState({ phase: 'idle', iconScale: false, barsVisible: false })
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => { playMessage(setState, mountedRef) }, [])

  const replay = useCallback(() => {
    setState({ phase: 'idle', iconScale: false, barsVisible: false })
    requestAnimationFrame(() => playMessage(setState, mountedRef))
  }, [])

  const showEnvelope = state.phase !== 'idle'
  const isOpen = state.phase === 'open' || state.phase === 'content'

  return (
    <div className="kai-event-card">
      <ReplayButton onClick={replay} />
      <KaiAvatar size="inline" idle={false} presence={false} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx, #111)', marginBottom: 6 }}>{label}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {showEnvelope && (
            <div className={`kai-evt-icon${state.iconScale ? ' do-scale' : ''}`} style={{ color: 'var(--kai-accent)' }}>
              {isOpen ? <MailOpen size={18} /> : <Mail size={18} />}
            </div>
          )}
          {state.phase === 'content' && (
            <div className={`kai-evt-bars${state.barsVisible ? ' show' : ''}`}>
              <div className="kai-evt-bar" />
              <div className="kai-evt-bar" />
              <div className="kai-evt-bar" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════
// PROJECT DONE
// t=0  ring1 (.9s) + check scale-in bounce (.4s) simultanés
// ═══════════════════════════════════════════════════════

export function KaiProjectDone({ label = 'Projet terminé' }) {
  const play = useCallback((setPlaying) => { setPlaying(true) }, [])
  const { playing, replay } = useReplayable(play)

  return (
    <div className="kai-event-card">
      <ReplayButton onClick={replay} />
      <div style={{ position: 'relative' }}>
        <KaiAvatar size="inline" idle={false} presence={false} />
        <div className={`kai-event-ring${playing ? ' playing' : ''}`} style={{
          position: 'absolute', inset: -6, borderRadius: '50%',
          border: `2px solid var(--kai-success)`, pointerEvents: 'none',
        }} />
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx, #111)' }}>{label}</span>
        <span className={`kai-evt-check${playing ? ' show' : ''}`}>
          <Check size={16} />
        </span>
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════
// PURCHASE CONFIRMED
// t=0   shopping bag: wobble .5s
// t=400 check: scale-in bounce .3s
// ═══════════════════════════════════════════════════════

function playPurchase(setPlaying, mountedRef) {
  setPlaying({ wobble: true, check: false })
  setTimeout(() => {
    if (mountedRef.current) setPlaying({ wobble: true, check: true })
  }, 400)
}

export function KaiPurchaseConfirmed({ label = 'Achat confirmé' }) {
  const [state, setState] = useState({ wobble: false, check: false })
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => { playPurchase(setState, mountedRef) }, [])

  const replay = useCallback(() => {
    setState({ wobble: false, check: false })
    requestAnimationFrame(() => playPurchase(setState, mountedRef))
  }, [])

  return (
    <div className="kai-event-card">
      <ReplayButton onClick={replay} />
      <KaiAvatar size="inline" idle={false} presence={false} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div className={`kai-evt-icon${state.wobble ? ' do-wobble' : ''}`} style={{ color: 'var(--tx, #111)' }}>
          <ShoppingBag size={18} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx, #111)' }}>{label}</span>
        <span className={`kai-evt-check${state.check ? ' show-fast' : ''}`}>
          <Check size={16} />
        </span>
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════
// TIER UPGRADE (Standard → Pro)
// t=0    initial (neutral)
// t=500  crossfade text .3s + background transition .35s
// t=850  sparkle: scale-in bounce .3s
// ═══════════════════════════════════════════════════════

function playUpgrade(setPlaying, mountedRef) {
  setPlaying({ tier: 'standard', sparkle: false })
  setTimeout(() => {
    if (mountedRef.current) setPlaying(s => ({ ...s, tier: 'pro' }))
  }, 500)
  setTimeout(() => {
    if (mountedRef.current) setPlaying(s => ({ ...s, sparkle: true }))
  }, 850)
}

export function KaiTierUpgrade({ label = 'Passage KAi Pro' }) {
  const [state, setState] = useState({ tier: 'standard', sparkle: false })
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => { playUpgrade(setState, mountedRef) }, [])

  const replay = useCallback(() => {
    setState({ tier: 'standard', sparkle: false })
    requestAnimationFrame(() => playUpgrade(setState, mountedRef))
  }, [])

  return (
    <div className="kai-event-card">
      <ReplayButton onClick={replay} />
      <KaiAvatar size="inline" idle={false} presence={false} />
      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx, #111)' }}>{label}</span>
        <span className={`kai-tier-tag kai-tier-tag--${state.tier}`}>
          {state.tier === 'standard' ? 'KAi Standard' : 'KAi Pro'}
        </span>
        <span className={`kai-evt-sparkle${state.sparkle ? ' show' : ''}`}>
          <Sparkles size={14} />
        </span>
      </div>
    </div>
  )
}
