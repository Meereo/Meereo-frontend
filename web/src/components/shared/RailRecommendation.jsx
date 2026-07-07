import { Building2, CreditCard, Smartphone } from 'lucide-react'
import { recommendRail, RAIL_META, RAILS } from '../../domain/fintech'

const RAIL_ICONS = {
  [RAILS.VIREMENT]: Building2,
  [RAILS.CARTE]: CreditCard,
  [RAILS.MOBILE_MONEY]: Smartphone,
}

export default function RailRecommendation({ amount, type, context, onSelect }) {
  const { rail, reason } = recommendRail(amount, type, context)
  const meta = RAIL_META[rail]
  const RailIcon = RAIL_ICONS[rail]

  return (
    <div style={{ padding: '14px 16px', background: 'var(--s2)', borderRadius: 12, border: '1px solid var(--border-subtle)' }}>
      <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Rail recommandé</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>{RailIcon ? <RailIcon size={20}/> : meta.icon}</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>{meta.label}</div>
          <div style={{ fontSize: 11, color: 'var(--t3)' }}>{reason}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => onSelect && onSelect(rail)} style={{ flex: 1, padding: '9px 14px', borderRadius: 8, background: 'var(--tx)', color: '#fff', border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>Confirmer</button>
        <button onClick={() => onSelect && onSelect(null)} style={{ padding: '9px 14px', borderRadius: 8, background: 'var(--surface-1)', color: 'var(--t3)', border: '1px solid var(--border)', fontSize: 12, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--f)' }}>Autre moyen</button>
      </div>
    </div>
  )
}
