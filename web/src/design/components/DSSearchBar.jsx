import { motion, AnimatePresence } from 'framer-motion'

/**
 * DSSearchBar — Unified search input.
 * Tailwind + Framer Motion version.
 */
export default function DSSearchBar({ value, onChange, placeholder = 'Rechercher...' }) {
  return (
    <div className="flex items-center gap-2 px-3.5 py-2 rounded-[10px] border border-[var(--border-subtle)] bg-transparent focus-within:border-[var(--tx)] focus-within:bg-[var(--surface-1)] transition-all">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-transparent border-none outline-none text-xs text-[var(--tx)] p-0 m-0 placeholder:text-[var(--t4)]"
        style={{ fontFamily: 'var(--f)' }}
      />
      <AnimatePresence>
        {value && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.12 }}
            onClick={() => onChange('')}
            className="w-[18px] h-[18px] rounded-full bg-[var(--s3)] border-none cursor-pointer flex items-center justify-center text-[10px] text-[var(--t3)] shrink-0 hover:bg-[var(--s4)]"
          >x</motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
