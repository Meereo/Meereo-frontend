import { useCallback, useRef } from 'react'

/**
 * NewProjectButton — Composant unique pour "+ Nouveau projet"
 *
 * Anti-double-click : ignore les clics dans les 500ms suivant le premier.
 * Analytics-ready : prop `context` pour tracking.
 *
 * @param {Function} onOpen - Handler central (ex: openModal('newProjet'))
 * @param {string} context - 'header' | 'overview' | 'empty-state'
 * @param {string} [variant] - 'primary' | 'ghost' | 'light'
 * @param {object} [style] - Style override
 * @param {string} [className] - Class override
 */
export default function NewProjectButton({ onOpen, context = 'header', variant = 'primary', style, className }) {
  const lastClick = useRef(0)

  const handleClick = useCallback(() => {
    const now = Date.now()
    if (now - lastClick.current < 500) return // anti-double-click
    lastClick.current = now
    onOpen?.()
  }, [onOpen])

  const baseClass = variant === 'primary'
    ? 'btn btn-primary btn-sm'
    : variant === 'light'
      ? 'btn btn-sm'
      : 'btn btn-sm'

  const lightStyle = variant === 'light'
    ? { background: 'rgba(255,255,255,.15)', color: '#fff', border: '1px solid rgba(255,255,255,.25)' }
    : {}

  return (
    <button
      className={className || baseClass}
      style={{ ...lightStyle, ...style }}
      onClick={handleClick}
      data-analytics-event="NEW_PROJECT_CLICK"
      data-analytics-context={context}
    >
      + Nouveau projet
    </button>
  )
}
