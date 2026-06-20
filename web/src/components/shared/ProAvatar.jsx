import { getEntrepriseAvatar } from '../../data/avatars'

export default function ProAvatar({ nom, size }) {
  const av = getEntrepriseAvatar(nom)
  const sz = size || 42
  const initials = nom.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return (
    <div style={{ width: sz, height: sz, borderRadius: sz / 2, background: av?.type === 'color' ? av.value : av?.type === 'img' ? 'var(--s2)' : 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: sz * .3, fontWeight: 800, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
      {av?.type === 'img'
        ? <img src={av.value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
        : (av?.initials || initials)}
    </div>
  )
}
