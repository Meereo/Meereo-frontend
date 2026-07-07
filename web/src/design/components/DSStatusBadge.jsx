import { getStatusLabel, OFFER_STATUS, MARKET_STATUS, PAYMENT_STATUS, ORDER_STATUS, STATUS } from '../../domain/status'

/**
 * DSStatusBadge — Unified status badge.
 * Tailwind version — Monochrome constraint compliant.
 */

const SEMANTIC_STYLES = {
  success: 'bg-[rgba(25,28,29,0.06)] text-[var(--tx)]',
  warning: 'bg-[rgba(71,71,71,0.06)] text-[var(--t3)]',
  error:   'bg-[rgba(186,26,26,0.06)] text-[var(--err)]',
  info:    'bg-[rgba(71,71,71,0.06)] text-[var(--t3)]',
  neutral: 'bg-[rgba(0,0,0,0.04)] text-[var(--t3)]',
  dark:    'bg-[rgba(0,0,0,0.06)] text-[var(--tx)]',
}

function getSemanticStyle(status) {
  if ([STATUS.COMPLETED, STATUS.APPROVED, OFFER_STATUS.ACCEPTED, MARKET_STATUS.SIGNED,
       PAYMENT_STATUS.CONFIRMED, PAYMENT_STATUS.PAID, ORDER_STATUS.DELIVERED,
       'acceptee', 'signe', 'livre', 'done', 'actif', 'confirmed'].includes(status)) {
    return SEMANTIC_STYLES.success
  }
  if ([STATUS.PENDING, STATUS.IN_REVIEW, OFFER_STATUS.PENDING, PAYMENT_STATUS.PENDING,
       'en_attente', 'en attente', 'pending', 'active', 'todo', 'in_review'].includes(status)) {
    return SEMANTIC_STYLES.warning
  }
  if ([STATUS.REJECTED, STATUS.CANCELLED, STATUS.BLOCKED, OFFER_STATUS.REJECTED,
       'refusee', 'rejected', 'cancelled', 'blocked', 'suspendu'].includes(status)) {
    return SEMANTIC_STYLES.error
  }
  if ([STATUS.IN_PROGRESS, STATUS.PUBLISHED, MARKET_STATUS.IN_PROGRESS, ORDER_STATUS.IN_TRANSIT,
       'en_cours', 'in_progress', 'published', 'in_transit'].includes(status)) {
    return SEMANTIC_STYLES.info
  }
  if ([STATUS.DRAFT, 'draft', 'brouillon'].includes(status)) {
    return SEMANTIC_STYLES.neutral
  }
  return SEMANTIC_STYLES.neutral
}

export default function DSStatusBadge({ status, label, className = '' }) {
  const displayLabel = label || getStatusLabel(status) || status
  const style = getSemanticStyle(status)

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${style} ${className}`}>
      {displayLabel}
    </span>
  )
}
