import { lazy, Suspense } from 'react'
const CockpitContracts = lazy(() => import('../cockpit/Contracts'))
const Spinner = () => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', opacity: .4 }}><div style={{ width: 24, height: 24, border: '2.5px solid var(--border)', borderTopColor: 'var(--tx)', borderRadius: '50%', animation: 'spin .6s linear infinite' }} /></div>
export default function Contracts(props) {
  return <Suspense fallback={<Spinner />}><CockpitContracts {...props} /></Suspense>
}
