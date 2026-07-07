import { motion } from 'framer-motion'

/**
 * DSPageHeader — Unified page header for all cockpit pages.
 * Tailwind + Framer Motion version.
 */
export default function DSPageHeader({ title, subtitle, actions, children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start justify-between gap-4 mb-6"
    >
      <div>
        <h1 className="text-[22px] font-semibold text-[var(--tx)] tracking-[-0.02em] leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-[var(--t3)] mt-1">{subtitle}</p>}
      </div>
      {(actions || children) && (
        <div className="flex gap-2 shrink-0">
          {actions || children}
        </div>
      )}
    </motion.div>
  )
}
