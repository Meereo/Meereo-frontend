import { motion } from 'framer-motion'

/**
 * DSFilterBar — Unified filter pills.
 * Tailwind + Framer Motion version.
 */
export default function DSFilterBar({ filters = [], active, onChange }) {
  return (
    <div className="flex gap-1">
      {filters.map(f => (
        <motion.button
          key={f.key}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(f.key)}
          className={`px-3 py-1.5 rounded-lg text-[11.5px] font-medium border transition-all cursor-pointer ${
            active === f.key
              ? 'bg-[var(--tx)] text-white border-[var(--tx)] font-semibold'
              : 'bg-[var(--surface-1)] text-[var(--t3)] border-[var(--border-subtle)] hover:bg-[var(--s2)] hover:text-[var(--tx)]'
          }`}
          style={{ fontFamily: 'var(--f)' }}
        >
          {f.label}
        </motion.button>
      ))}
    </div>
  )
}
