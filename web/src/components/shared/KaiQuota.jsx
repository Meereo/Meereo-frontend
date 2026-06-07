import { useState } from 'react'
import { useMeereo } from '../../hooks/useMeereoStore'
import { getKaiQuotaStatus, shouldSuggestGold } from '../../domain/fintech'
import KaiGoldModal from './KaiGoldModal'

export default function KaiQuota({ context = {}, role = 'pro' }) {
  const { store } = useMeereo()
  const quota = getKaiQuotaStatus(store.kaiEntitlement, role)
  const suggest = shouldSuggestGold(quota, context)
  const [showGold, setShowGold] = useState(false)

  return (
    <>
      {quota.isGold ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(124,58,237,.04)', borderRadius: 10, border: '1px solid rgba(124,58,237,.1)', cursor: 'pointer' }} onClick={() => setShowGold(true)}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#7C3AED', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#7C3AED' }}>KAI Pro actif</div>
            <div style={{ fontSize: 10, color: 'var(--t4)' }}>Copilote opérationnel — usage illimité</div>
          </div>
        </div>
      ) : (
        <div style={{ padding: '12px 14px', background: 'var(--s2)', borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.05em' }}>KAI Standard</div>
            <div style={{ fontSize: 10, color: 'var(--t4)' }}>{quota.used}/{quota.limit}</div>
          </div>
          <div style={{ height: 3, background: 'var(--s3)', borderRadius: 100, overflow: 'hidden', marginBottom: suggest ? 8 : 0 }}>
            <div style={{ height: '100%', background: quota.pct >= 80 ? 'var(--wrn)' : 'var(--tx)', borderRadius: 100, width: quota.pct + '%', transition: 'width .3s ease' }} />
          </div>
          {suggest && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 10, color: 'var(--t4)' }}>Passez au pilotage proactif</div>
              <button onClick={() => setShowGold(true)} style={{ fontSize: 10, fontWeight: 600, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', whiteSpace: 'nowrap' }}>KAI Pro →</button>
            </div>
          )}
        </div>
      )}
      <KaiGoldModal isOpen={showGold} onClose={() => setShowGold(false)} role={role} />
    </>
  )
}
