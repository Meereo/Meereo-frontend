import { motion } from 'framer-motion'

/**
 * DSEmptyState — Unified empty state for all pages.
 * Tailwind + Framer Motion version.
 */
export default function DSEmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center py-14 px-6 text-center"
    >
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-[var(--s2)] flex items-center justify-center text-2xl mb-4">
          {icon}
        </div>
      )}
      <div className="text-[15px] font-semibold text-[var(--tx)] mb-1 tracking-[-0.2px]">{title}</div>
      {description && (
        <div className="text-xs text-[var(--t3)] leading-relaxed max-w-xs mb-5">
          {description}
        </div>
      )}
      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="btn btn-primary btn-sm text-xs"
          onClick={onAction}
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  )
}
