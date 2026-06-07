/**
 * Logo shape utilities — converts shape name to CSS styles.
 * Used across the platform for consistent visual identity.
 */
export function logoShapeStyle(shape) {
  switch (shape) {
    case 'Cercle': return { borderRadius: '50%' }
    case 'Carré': return { borderRadius: '4px' }
    case 'Diamant': return { borderRadius: '6px', transform: 'rotate(45deg)' }
    case 'Triangle': return { borderRadius: '4px' }
    case 'Hexagone': default: return { borderRadius: '12px' }
  }
}

export function logoContentStyle(shape) {
  return shape === 'Diamant' ? { transform: 'rotate(-45deg)', display: 'block' } : {}
}
