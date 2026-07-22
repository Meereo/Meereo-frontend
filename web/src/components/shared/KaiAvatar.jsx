// ═══════════════════════════════════════════════════════
//  KAi Avatar — Animated avatar with idle scheduler
//  Spec v1.0 : breathe + presence + ping + micro-gestes
// ═══════════════════════════════════════════════════════

import { useEffect, useRef, useCallback } from 'react'

/**
 * useKaiIdleScheduler — recursive random scheduler for idle micro-gestures.
 * Activates only when `active` is true. Targets two distinct DOM elements
 * (wrapper for nod, letter for glance/blink) to avoid transform conflicts.
 */
export function useKaiIdleScheduler(wrapperRef, letterRef, active = true) {
  const timerRef = useRef(null)

  const playOnce = useCallback((el, className, duration) => {
    if (!el) return
    el.classList.add(className)
    setTimeout(() => el.classList.remove(className), duration)
  }, [])

  useEffect(() => {
    if (!active) return

    function schedule() {
      const delay = 2600 + Math.random() * 4200 // 2.6s – 6.8s
      timerRef.current = setTimeout(() => {
        const wrapper = wrapperRef.current
        const letter = letterRef.current
        if (!wrapper || !letter) { schedule(); return }

        const pick = Math.random()
        if (pick < 0.40) {
          playOnce(wrapper, 'do-nod', 560)
        } else if (pick < 0.75) {
          playOnce(letter, 'do-glance', 520)
        } else {
          playOnce(letter, 'do-blink', 470)
        }
        schedule() // reprogrammation récursive
      }, delay)
    }

    schedule()
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [active, wrapperRef, letterRef, playOnce])
}

/**
 * KaiAvatar — Animated avatar component.
 *
 * Props:
 *   size       — 'auto' (36px, default) | 'inline' (28px)
 *   idle       — enable idle micro-gestures (default: true)
 *   attention  — show violet ping ring (recommendation pending)
 *   presence   — show green presence dot (default: true)
 *   className  — additional class names
 *   style      — additional inline styles
 */
export default function KaiAvatar({
  size = 'auto',
  idle = true,
  attention = false,
  presence = true,
  className = '',
  style,
}) {
  const wrapperRef = useRef(null)
  const letterRef = useRef(null)

  useKaiIdleScheduler(wrapperRef, letterRef, idle)

  const wrapCls = [
    'kai-avatar-wrap',
    size === 'inline' ? 'kai-avatar-wrap--inline' : 'kai-avatar-wrap--auto',
    attention ? 'has-attention' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div ref={wrapperRef} className={wrapCls} style={style}>
      {/* Ping ring — rendered always, animated only with .has-attention */}
      <div className="kai-avatar-ping" />

      {/* Breathing circle */}
      <div className="kai-avatar-circle">
        <span ref={letterRef} className="kai-avatar-k">K</span>
      </div>

      {/* Presence dot */}
      {presence && <div className="kai-avatar-presence" />}
    </div>
  )
}
