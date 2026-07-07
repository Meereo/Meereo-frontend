import { Check, Star } from 'lucide-react'
import { METIERS_AO } from '../../data/ao'
import ProAvatar from './ProAvatar'

export default function ProSearch({ ctx }) {
  const { proSearch, setProSearch, proMetier, setProMetier, filteredPros, navigate, updateStore, showToast } = ctx
  return (
    <div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <div data-search style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', background: 'transparent', borderRadius: 10, border: '1px solid var(--border-card)', flex: 1 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            value={proSearch}
            onChange={e => setProSearch(e.target.value)}
            placeholder="Rechercher un professionnel par nom, métier, ville..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 13, fontFamily: 'var(--f)', color: 'var(--tx)' }}
          />
        </div>
        <select value={proMetier} onChange={e => setProMetier(e.target.value)} style={{ padding: '9px 14px', borderRadius: 10, border: '1px solid var(--border-card)', background: 'var(--s2)', fontSize: 12, fontFamily: 'var(--f)', color: 'var(--tx)' }}>
          <option value="all">Tous les métiers</option>
          {METIERS_AO.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 12 }}>
        {filteredPros.length} professionnel{filteredPros.length > 1 ? 's' : ''} trouvé{filteredPros.length > 1 ? 's' : ''}
      </div>
      <div className="three-col">
        {filteredPros.map((p, i) => (
          <div key={i} className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <ProAvatar nom={p.nom} size={42} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{p.nom}</span>
                  {p.verified && (
                    <span style={{ fontSize: 8, background: 'rgba(52,199,89,.08)', color: 'var(--ok)', padding: '1px 5px', borderRadius: 100, fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}>
                      <Check size={8} />
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--t3)' }}>{p.metier} · {p.ville}</div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 10 }}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} size={12} fill={i < Math.round(p.note) ? '#F59E0B' : 'none'} color="#F59E0B" strokeWidth={1.5} />
              ))}
              <span style={{ fontWeight: 600, color: 'var(--t2)', fontSize: 12, marginLeft: 4 }}>{p.note}/5</span>
              <span style={{ fontSize: 10, color: 'var(--t4)' }}>({p.nbAvis} avis)</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {p.publicId && <button className="btn btn-sm" style={{ flex: 1, fontSize: 11 }} onClick={() => navigate(`/pro?uuid=${p.publicId}`)}>Voir profil</button>}
              <button className="btn btn-primary btn-sm" style={{ flex: 1, fontSize: 11 }} onClick={() => {
                updateStore(prev => ({ ...prev, messages: [...(prev.messages || []), { id: 'msg_' + Date.now(), dest: p.nom, sujet: 'Demande de contact', texte: 'Bonjour, je souhaite vous contacter pour un projet.', type: 'contact', createdAt: new Date().toISOString() }] }))
                showToast('Demande de contact envoyée à ' + p.nom)
              }}>Contacter</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
