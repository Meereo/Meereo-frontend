/**
 * MoneyInput — Input with live thousand separators (FCFA).
 *
 * Displays "1 000 000" while the user types, stores the raw number.
 * Drop-in replacement for <input type="number"> on monetary fields.
 *
 * @param {string|number} value - Raw numeric value (no formatting)
 * @param {Function} onChange - Receives the raw numeric string (digits only)
 * @param {string} placeholder
 * @param {string} className
 * @param {object} style
 */
export function formatMoney(v) {
  if (!v && v !== 0) return ''
  const raw = String(v).replace(/[^\d]/g, '')
  if (!raw) return ''
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

export function rawMoney(v) {
  return String(v || '').replace(/[^\d]/g, '')
}

export default function MoneyInput({ value, onChange, placeholder, className = 'form-input', style, ...rest }) {
  const display = formatMoney(value)

  const handleChange = (e) => {
    const raw = rawMoney(e.target.value)
    onChange(raw)
  }

  return (
    <input
      inputMode="numeric"
      className={className}
      style={style}
      value={display}
      onChange={handleChange}
      placeholder={placeholder}
      {...rest}
    />
  )
}
