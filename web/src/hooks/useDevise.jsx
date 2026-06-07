import { createContext, useContext, useState, useCallback } from 'react'

// Taux de change par rapport au FCFA (base)
// Source: taux approximatifs avril 2026
const TAUX = {
  'FCFA': { symbol: 'FCFA', code: 'XOF', rate: 1, locale: 'fr-FR' },
  'EUR': { symbol: '€', code: 'EUR', rate: 0.00152, locale: 'fr-FR' },  // 1 FCFA = 0.00152 EUR (1 EUR ≈ 656 FCFA)
  'USD': { symbol: '$', code: 'USD', rate: 0.00166, locale: 'en-US' },   // 1 FCFA = 0.00166 USD (1 USD ≈ 602 FCFA)
  'GBP': { symbol: '£', code: 'GBP', rate: 0.00131, locale: 'en-GB' },   // 1 FCFA = 0.00131 GBP
  'MAD': { symbol: 'MAD', code: 'MAD', rate: 0.0166, locale: 'fr-MA' },  // 1 FCFA = 0.0166 MAD
  'NGN': { symbol: '₦', code: 'NGN', rate: 2.65, locale: 'en-NG' },      // 1 FCFA = 2.65 NGN
}

const DeviseContext = createContext(null)

export function DeviseProvider({ children }) {
  const [devise, setDevise] = useState('FCFA')

  const convert = useCallback((amountFCFA) => {
    if (!amountFCFA || isNaN(amountFCFA)) return 0
    const t = TAUX[devise] || TAUX['FCFA']
    return Math.round(amountFCFA * t.rate * 100) / 100
  }, [devise])

  const format = useCallback((amountFCFA) => {
    if (amountFCFA == null || isNaN(amountFCFA)) return '—'
    const t = TAUX[devise] || TAUX['FCFA']
    const converted = amountFCFA * t.rate
    if (devise === 'FCFA') {
      return new Intl.NumberFormat('fr-FR').format(Math.round(converted)) + ' FCFA'
    }
    return new Intl.NumberFormat(t.locale, { style: 'currency', currency: t.code, maximumFractionDigits: converted >= 1000 ? 0 : 2 }).format(converted)
  }, [devise])

  const formatShort = useCallback((amountFCFA) => {
    if (amountFCFA == null || isNaN(amountFCFA)) return '—'
    const t = TAUX[devise] || TAUX['FCFA']
    const converted = amountFCFA * t.rate
    const abs = Math.abs(converted)
    let str
    if (abs >= 1e9) str = (converted / 1e9).toFixed(1) + ' Mds'
    else if (abs >= 1e6) str = Math.round(converted / 1e6) + ' M'
    else if (abs >= 1e3) str = Math.round(converted / 1e3) + ' K'
    else str = new Intl.NumberFormat('fr-FR').format(Math.round(converted))
    if (devise === 'FCFA') return str + ' FCFA'
    return str + ' ' + t.symbol
  }, [devise])

  // Parse a string like "4,8 Mds FCFA" or "320M FCFA" to number in FCFA
  const parseBudget = useCallback((str) => {
    if (!str || typeof str !== 'string') return 0
    const s = str.replace(/[^\d.,MmBbds]/g, '').replace(',', '.')
    const n = parseFloat(s) || 0
    if (str.includes('Mds') || str.includes('mds')) return n * 1e9
    if (str.toUpperCase().includes('M')) return n * 1e6
    return n
  }, [])

  return (
    <DeviseContext.Provider value={{ devise, setDevise, convert, format, formatShort, parseBudget, taux: TAUX, devises: Object.keys(TAUX) }}>
      {children}
    </DeviseContext.Provider>
  )
}

export function useDevise() {
  const ctx = useContext(DeviseContext)
  if (!ctx) return { devise: 'FCFA', setDevise: () => {}, format: (n) => new Intl.NumberFormat('fr-FR').format(n || 0) + ' FCFA', formatShort: (n) => { const abs = Math.abs(n || 0); if (abs >= 1e9) return (n / 1e9).toFixed(1) + ' Mds FCFA'; if (abs >= 1e6) return Math.round(n / 1e6) + ' M FCFA'; return new Intl.NumberFormat('fr-FR').format(n || 0) + ' FCFA' }, parseBudget: () => 0, convert: (n) => n, taux: {}, devises: ['FCFA'] }
  return ctx
}
