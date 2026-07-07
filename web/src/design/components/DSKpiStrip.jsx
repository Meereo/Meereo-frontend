import { motion } from 'framer-motion'
import useIsMobile from '../../hooks/useIsMobile'

/**
 * DSKpiStrip — Unified KPI grid for all cockpit pages.
 * Tailwind + Framer Motion version.
 */
export default function DSKpiStrip({ items = [], hero = false }) {
  const isMobile = useIsMobile()
  const cols = isMobile ? Math.min(2, items.length) : items.length

  return (
    <div
      className="grid gap-3 mb-6"
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
    >
      {items.map((k, i) => {
        const isHero = hero && i === 0
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
            whileHover={k.onClick ? { y: -2 } : {}}
            onClick={k.onClick}
            className={
              isHero
                ? 'rounded-xl p-4 text-white'
                : 'card p-4'
            }
            style={{
              cursor: k.onClick ? 'pointer' : 'default',
              ...(isHero ? { background: 'linear-gradient(145deg,#0f1011,#2a2c2d)' } : {}),
            }}
          >
            {k.icon && !isHero && (
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-[10px] flex items-center justify-center text-sm shrink-0"
                  style={{ background: k.iconBg || 'rgba(0,0,0,.04)' }}
                >{k.icon}</div>
                <div>
                  <div className="text-[22px] font-semibold tracking-[-0.8px] leading-none" style={{ color: k.color || 'var(--tx)' }}>{k.value}</div>
                  <div className="text-[11px] text-[var(--t3)] mt-0.5">{k.label}</div>
                </div>
              </div>
            )}
            {(k.icon && isHero) || (!k.icon && isHero) ? (
              <>
                <div className="text-[9px] font-semibold text-white/40 uppercase tracking-[0.08em] mb-1.5">{k.label}</div>
                <div className="text-[28px] font-semibold tracking-[-1.2px] leading-none">{k.value}</div>
                {k.sub && <div className="text-[11px] text-white/40 mt-1">{k.sub}</div>}
              </>
            ) : null}
            {!k.icon && !isHero && (
              <>
                <div className="text-xl font-semibold tracking-[-0.8px] leading-none mb-1" style={{ color: k.color || 'var(--tx)' }}>{k.value}</div>
                <div className="text-[11px] font-semibold mb-0.5">{k.label}</div>
                {k.sub && <div className="text-[10px] text-[var(--t4)]">{k.sub}</div>}
              </>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
