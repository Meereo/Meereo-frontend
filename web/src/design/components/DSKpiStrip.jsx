/**
 * DSKpiStrip — Unified KPI grid for all cockpit pages.
 * Replaces the 8+ inline KPI grids with inconsistent styling.
 *
 * @param {Array<{value:string|number, label:string, sub?:string, icon?:string, iconBg?:string, color?:string, onClick?:Function}>} items
 * @param {boolean} hero - If true, first item uses dark hero style
 */
export default function DSKpiStrip({ items = [], hero = false }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${items.length}, 1fr)`,
      gap: 12,
      marginBottom: 24,
    }}>
      {items.map((k, i) => {
        const isHero = hero && i === 0
        return (
          <div
            key={i}
            className={isHero ? undefined : 'card'}
            onClick={k.onClick}
            style={{
              padding: '16px 18px',
              cursor: k.onClick ? 'pointer' : 'default',
              transition: 'all .18s ease',
              ...(isHero ? {
                background: 'linear-gradient(145deg,#0f1011,#2a2c2d)',
                borderRadius: 12,
                color: '#fff',
              } : {}),
            }}
          >
            {k.icon && !isHero && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: k.iconBg || 'rgba(0,0,0,.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0,
                }}>{k.icon}</div>
                <div>
                  <div style={{
                    fontSize: 22, fontWeight: 800,
                    letterSpacing: '-.8px', lineHeight: 1,
                    color: k.color || 'var(--tx)',
                  }}>{k.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{k.label}</div>
                </div>
              </div>
            )}
            {k.icon && isHero && (
              <>
                <div style={{
                  fontSize: 9, fontWeight: 700,
                  color: 'rgba(255,255,255,.4)',
                  textTransform: 'uppercase',
                  letterSpacing: '.08em', marginBottom: 6,
                }}>{k.label}</div>
                <div style={{
                  fontSize: 28, fontWeight: 800,
                  letterSpacing: '-1.2px', lineHeight: 1,
                }}>{k.value}</div>
                {k.sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>{k.sub}</div>}
              </>
            )}
            {!k.icon && (
              <>
                {isHero ? (
                  <>
                    <div style={{
                      fontSize: 9, fontWeight: 700,
                      color: 'rgba(255,255,255,.4)',
                      textTransform: 'uppercase',
                      letterSpacing: '.08em', marginBottom: 6,
                    }}>{k.label}</div>
                    <div style={{
                      fontSize: 28, fontWeight: 800,
                      letterSpacing: '-1.2px', lineHeight: 1,
                    }}>{k.value}</div>
                    {k.sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', marginTop: 4 }}>{k.sub}</div>}
                  </>
                ) : (
                  <>
                    <div style={{
                      fontSize: 20, fontWeight: 800,
                      letterSpacing: '-.8px', lineHeight: 1,
                      marginBottom: 4,
                      color: k.color || 'var(--tx)',
                    }}>{k.value}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 1 }}>{k.label}</div>
                    {k.sub && <div style={{ fontSize: 10, color: 'var(--t4)' }}>{k.sub}</div>}
                  </>
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
