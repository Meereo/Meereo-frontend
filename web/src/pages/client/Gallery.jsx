import { Camera } from 'lucide-react'

export default function Gallery({ ctx }) {
  const { proj } = ctx
  const photos = (proj?.photos || []).filter(Boolean)
  return (
    <div>
      <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 16 }}>Photos et vidéos du chantier</div>
      {photos.length === 0 ? (
        <div className="card" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ marginBottom: 12, opacity: .3, display: 'flex', justifyContent: 'center' }}><Camera size={32} /></div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>Aucune photo</div>
          <div style={{ fontSize: 12, color: 'var(--t3)' }}>
            Les photos de chantier apparaîtront ici au fur et à mesure de l'avancement.
          </div>
        </div>
      ) : (
        <div className="rg-3" style={{ gap: 10 }}>
          {photos.map((url, i) => (
            <div key={i} style={{ borderRadius: 10, overflow: 'hidden', aspectRatio: '4/3' }}>
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
