import { useState, useEffect, useRef } from 'react'
import { Camera, Upload, X, Loader } from 'lucide-react'
import { api } from '../../services/api/client'

export default function Gallery({ ctx }) {
  const { proj } = ctx
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [lightbox, setLightbox] = useState(null)
  const inputRef = useRef(null)

  // Fetch photos (documents avec type='photo') liés au projet
  useEffect(() => {
    if (!proj?.id) { setLoading(false); return }
    api.documents.getAll({ projectId: proj.id, type: 'photo' })
      .then(docs => setPhotos(Array.isArray(docs) ? docs : []))
      .catch(() => setPhotos([]))
      .finally(() => setLoading(false))
  }, [proj?.id])

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    setUploading(true)
    try {
      const uploaded = await Promise.all(
        files.map(f =>
          api.documents.upload(f, {
            name: f.name.replace(/\.[^.]+$/, ''),
            type: 'photo',
            projectId: proj?.id,
          })
        )
      )
      setPhotos(prev => [...uploaded.filter(Boolean), ...prev])
    } catch {
      // silent — user can retry
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDelete = async (doc) => {
    try {
      await api.documents.delete(doc.id)
      setPhotos(prev => prev.filter(p => p.id !== doc.id))
    } catch {
      // silent
    }
  }

  const getUrl = (doc) => {
    if (!doc) return ''
    // doc.url is a server-relative path like /uploads/documents/...
    const base = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BACKEND_URL)
      ? import.meta.env.VITE_BACKEND_URL
      : (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '')
    return doc.url?.startsWith('http') ? doc.url : `${base}${doc.url}`
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 0', color: 'var(--t4)' }}>
        <Loader size={20} style={{ animation: 'spin .6s linear infinite' }} />
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--t3)' }}>Photos et vidéos du chantier</div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: 'var(--surface-1)', border: '1px solid var(--border-card)', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--tx)' }}>
          {uploading ? <Loader size={13} style={{ animation: 'spin .6s linear infinite' }} /> : <Upload size={13} />}
          {uploading ? 'Envoi…' : 'Ajouter des photos'}
          <input ref={inputRef} type="file" accept="image/*,video/*" multiple style={{ display: 'none' }} onChange={handleUpload} />
        </label>
      </div>

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
          {photos.map((doc) => (
            <div key={doc.id} style={{ borderRadius: 10, overflow: 'hidden', aspectRatio: '4/3', position: 'relative', cursor: 'pointer' }} onClick={() => setLightbox(doc)}>
              <img src={getUrl(doc)} alt={doc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(doc) }}
                style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,.6)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <img src={getUrl(lightbox)} alt={lightbox.name} style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,.1)', border: 'none', color: '#fff', borderRadius: '50%', width: 36, height: 36, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} />
          </button>
        </div>
      )}
    </div>
  )
}
