// === FICHIER : web/src/hooks/useInterval.js ===
import { useEffect, useRef } from 'react'

/**
 * useInterval — runs callback on a fixed interval, stops when delay=null.
 * Cleans up on unmount.
 * @param {Function} callback
 * @param {number|null} delay — ms between calls, null to pause
 */
export function useInterval(callback, delay) {
  const savedCallback = useRef(callback)
  useEffect(() => { savedCallback.current = callback }, [callback])
  useEffect(() => {
    if (delay === null) return
    const id = setInterval(() => savedCallback.current(), delay)
    return () => clearInterval(id)
  }, [delay])
}
