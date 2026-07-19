import { createPortal } from 'react-dom'
import { FileText, Download, ExternalLink, X } from 'lucide-react'

/**
 * FilePreview — Modal de prévisualisation de fichiers (images, PDF, autres).
 *
 * Props:
 *   file: { url, name, nom, type, date, taille, projet } — le fichier à afficher
 *   onClose: () => void — fermer le viewer
 *
 * Usage:
 *   {viewerDoc && <FilePreview file={viewerDoc} onClose={() => setViewerDoc(null)} />}
 */
export default function FilePreview({ file, onClose }) {
  if (!file) return null

  const url = file.url || file.fileUrl || ''
  const name = file.nom || file.name || file.n || 'Document'
  const subtitle = [file.projet, file.date, file.taille].filter(Boolean).join(' · ')

  // Détecter le type depuis l'extension URL, le type MIME, ou le champ type
  const ext = (url.match(/\.(\w+)(\?.*)?$/)?.[1] || '').toLowerCase()
  const typeField = (file.type || '').toLowerCase()
  const isImg = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)
    || typeField === 'img' || typeField === 'image'
    || /^image\//i.test(file.type || '')
    || /^data:image\//i.test(url)
  const isPdf = ext === 'pdf'
    || typeField === 'pdf'
    || /^application\/pdf/i.test(file.type || '')
    || /^data:application\/pdf/i.test(url)

  const handleDownload = (e) => {
    e.stopPropagation()
    const a = document.createElement('a')
    a.href = url
    a.download = name
    a.rel = 'noopener noreferrer'
    a.target = '_blank'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return createPortal(
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(6px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }}
      onClick={onClose}
    >
      <div
        style={{ position: 'relative', width: '90vw', maxWidth: 960, maxHeight: '88vh', background: 'var(--surface-1, #fff)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,.35)', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid var(--border, #e5e7eb)', background: 'var(--surface-1, #fff)', flexShrink: 0 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            {subtitle && <div style={{ fontSize: 11, color: 'var(--t3, #888)', marginTop: 1 }}>{subtitle}</div>}
          </div>
          {url && (
            <button onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 8, background: 'var(--s2, #f3f4f5)', border: '1px solid var(--border, #e5e7eb)', fontSize: 12, fontWeight: 600, color: 'var(--tx, #191c1d)', cursor: 'pointer', fontFamily: 'var(--f)', flexShrink: 0 }}>
              <Download size={13} /> Télécharger
            </button>
          )}
          {url && !url.startsWith('data:') && (
            <a href={url} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', borderRadius: 8, background: 'var(--s2, #f3f4f5)', border: '1px solid var(--border, #e5e7eb)', fontSize: 12, fontWeight: 600, color: 'var(--tx, #191c1d)', textDecoration: 'none', flexShrink: 0 }}>
              <ExternalLink size={13} /> Ouvrir
            </a>
          )}
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border, #e5e7eb)', background: 'var(--surface-1, #fff)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t3, #888)', flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>

        {/* Content */}
        <div style={{ overflow: 'auto', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--s1, #fafafa)', minHeight: 300 }}>
          {!url ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--t3, #888)' }}>
              <FileText size={48} style={{ opacity: .3, marginBottom: 12 }} />
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Fichier non disponible</div>
              <div style={{ fontSize: 12 }}>Le fichier n'a pas pu être chargé.</div>
            </div>
          ) : isImg ? (
            <img src={url} alt={name} style={{ maxWidth: '100%', maxHeight: 'calc(88vh - 80px)', objectFit: 'contain', display: 'block' }} />
          ) : isPdf ? (
            <iframe src={url} title={name} style={{ width: '100%', height: 'calc(88vh - 70px)', border: 'none' }} />
          ) : (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--t3, #888)' }}>
              <FileText size={48} style={{ opacity: .3, marginBottom: 12 }} />
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Aperçu non disponible</div>
              <div style={{ fontSize: 12, marginBottom: 20 }}>Ce type de fichier ne peut pas être prévisualisé dans le navigateur.</div>
              <button onClick={handleDownload} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: 'var(--tx, #191c1d)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>
                <Download size={14} /> Télécharger
              </button>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
