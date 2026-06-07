import { Check, AlertTriangle } from 'lucide-react'
import { PAY_STATUS_META, PAY_STATUS } from '../../domain/fintech'

const STATUS_ICONS = {
  [PAY_STATUS.PAYOUT_DONE]: Check,
  [PAY_STATUS.DISPUTE]: AlertTriangle,
}

export default function PaymentBadge({ status, size = 'default' }) {
  const meta = PAY_STATUS_META[status]
  if (!meta) return null

  const isSmall = size === 'small'
  const IconComponent = STATUS_ICONS[status]

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: isSmall ? 5 : 7,
      padding: isSmall ? '3px 8px' : '5px 12px',
      borderRadius: 100,
      background: meta.bg,
      border: '1px solid ' + meta.bg,
    }}>
      {IconComponent
        ? <IconComponent size={isSmall ? 8 : 10}/>
        : <span style={{ fontSize: isSmall ? 8 : 10 }}>{meta.icon}</span>
      }
      <span style={{ fontSize: isSmall ? 9 : 11, fontWeight: 600, color: meta.color }}>{meta.label}</span>
    </div>
  )
}
