import { getStatusLabel, OFFER_STATUS, MARKET_STATUS, PAYMENT_STATUS, ORDER_STATUS, STATUS } from '../../domain/status'

/**
 * DSStatusBadge — Unified status badge using the status registry.
 * Replaces all ad-hoc badge styling scattered across pages.
 *
 * @param {string} status - Raw status value (supports old FR values via compat maps)
 * @param {'offer'|'market'|'payment'|'order'|'project'|'task'} domain - Which domain for theming
 * @param {string} label - Override the display label
 */

const SEMANTIC_COLORS = {
  success: { bg: 'rgba(52,199,89,.08)', color: 'var(--ok)' },
  warning: { bg: 'rgba(255,149,0,.08)', color: '#E07B00' },
  error:   { bg: 'rgba(220,38,38,.06)', color: 'var(--err)' },
  info:    { bg: 'rgba(0,122,255,.06)', color: '#007AFF' },
  neutral: { bg: 'rgba(0,0,0,.04)', color: 'var(--t3)' },
  dark:    { bg: 'rgba(0,0,0,.06)', color: 'var(--tx)' },
}

function getSemanticColor(status) {
  // Success states
  if ([STATUS.COMPLETED, STATUS.APPROVED, OFFER_STATUS.ACCEPTED, MARKET_STATUS.SIGNED,
       PAYMENT_STATUS.CONFIRMED, PAYMENT_STATUS.PAID, ORDER_STATUS.DELIVERED,
       'acceptee', 'signe', 'livre', 'done', 'actif', 'confirmed'].includes(status)) {
    return SEMANTIC_COLORS.success
  }
  // Warning states
  if ([STATUS.PENDING, STATUS.IN_REVIEW, OFFER_STATUS.PENDING, PAYMENT_STATUS.PENDING,
       'en_attente', 'en attente', 'pending', 'active', 'todo', 'in_review'].includes(status)) {
    return SEMANTIC_COLORS.warning
  }
  // Error states
  if ([STATUS.REJECTED, STATUS.CANCELLED, STATUS.BLOCKED, OFFER_STATUS.REJECTED,
       'refusee', 'rejected', 'cancelled', 'blocked', 'suspendu'].includes(status)) {
    return SEMANTIC_COLORS.error
  }
  // Info states
  if ([STATUS.IN_PROGRESS, STATUS.PUBLISHED, MARKET_STATUS.IN_PROGRESS, ORDER_STATUS.IN_TRANSIT,
       'en_cours', 'in_progress', 'published', 'in_transit'].includes(status)) {
    return SEMANTIC_COLORS.info
  }
  // Draft
  if ([STATUS.DRAFT, 'draft', 'brouillon'].includes(status)) {
    return SEMANTIC_COLORS.neutral
  }
  return SEMANTIC_COLORS.neutral
}

export default function DSStatusBadge({ status, label, style: customStyle }) {
  const colors = getSemanticColor(status)
  const displayLabel = label || getStatusLabel(status) || status

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 10,
      fontWeight: 600,
      padding: '3px 9px',
      borderRadius: 100,
      whiteSpace: 'nowrap',
      ...colors,
      ...customStyle,
    }}>
      {displayLabel}
    </span>
  )
}
