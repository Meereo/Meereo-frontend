import { FileText } from 'lucide-react'
import { formatDateFR } from '../../utils/helpers'

export default function Documents({ ctx }) {
  const { projDocs, proj } = ctx
  return (
    <div className="rg-4" style={{ gap: 10 }}>
      {projDocs.map(d => (
        <div key={d.id} className="card" style={{ padding: 14 }}>
          <div style={{ height: 60, background: 'var(--s2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: 'var(--t3)', marginBottom: 8 }}>
            {(d.type || 'PDF').toUpperCase()}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.nom}</div>
          <div style={{ fontSize: 10, color: 'var(--t4)' }}>{formatDateFR(d.date)} · {d.taille}</div>
        </div>
      ))}
      {projDocs.length === 0 && (
        <div style={{ gridColumn: '1/-1', padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ marginBottom: 10, opacity: .3, display: 'flex', justifyContent: 'center' }}><FileText size={28} /></div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>
            {proj ? 'Aucun document partagé sur ce projet' : 'Aucun projet actif'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--t4)', lineHeight: 1.5 }}>
            {proj
              ? "Les documents du projet apparaîtront ici au fur et à mesure de la mission."
              : "Acceptez une offre pour démarrer un projet et accéder aux documents."}
          </div>
        </div>
      )}
    </div>
  )
}
