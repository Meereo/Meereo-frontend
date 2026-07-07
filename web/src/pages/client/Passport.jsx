import { useState, useEffect } from 'react'
import { useMeereo } from '../../hooks/useMeereoStore'
import { DSPageHeader, DSEmptyState } from '../../design/components'
import { ASSET_STATUS_LABELS, ASSET_CATEGORIES } from '../../domain/status'
import { api } from '../../services/api/client'
import { formatDateFR } from '../../utils/helpers'

export default function Passport() {
  const { store } = useMeereo()
  const [passports, setPassports] = useState([])
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.passports.getAll().then(p => { if (Array.isArray(p)) setPassports(p) }).finally(() => setLoading(false)).catch(() => setLoading(false))
  }, [])

  const loadDetail = async (passport) => {
    setSelected(passport)
    try {
      const full = await api.passports.getById(passport.id)
      setDetail(full)
    } catch { setDetail(null) }
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--t4)' }}>Chargement...</div>

  if (selected && detail) {
    const now = new Date()
    return (
      <div>
        <DSPageHeader title={detail.nom} subtitle="Passeport Numérique du Bâtiment" actions={
          <button className="btn btn-sm" onClick={() => { setSelected(null); setDetail(null) }}>← Retour</button>
        } />

        {/* Infos générales */}
        <div className="card" style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, fontSize: 12 }}>
            {[['Adresse', detail.adresse], ['Type', detail.type], ['Surface', detail.surface], ['Livraison', detail.dateLivraison ? formatDateFR(detail.dateLivraison) : '—'], ['Statut', detail.status]].map(([k, v]) => (
              <div key={k}><div style={{ color: 'var(--t4)', fontWeight: 600, marginBottom: 2 }}>{k}</div><div style={{ fontWeight: 600 }}>{v || '—'}</div></div>
            ))}
          </div>
        </div>

        {/* Actifs */}
        <div className="card" style={{ padding: 0, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600 }}>Actifs ({(detail.assets || []).length})</div>
          {(detail.assets || []).length === 0 ? (
            <div style={{ padding: '20px 18px', fontSize: 12, color: 'var(--t4)', textAlign: 'center' }}>Aucun actif enregistré</div>
          ) : (detail.assets || []).map(a => {
            const cat = ASSET_CATEGORIES.find(c => c.id === a.category)
            return (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 16 }}>{cat?.icon || '⚙️'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{a.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--t3)' }}>{cat?.label} · {a.localisation || '—'}{a.fabricant ? ' · ' + a.fabricant : ''}</div>
                </div>
                <div style={{ fontSize: 9, fontWeight: 600, color: a.garantieExpired ? '#EF4444' : a.garantieExpiringSoon ? '#F59E0B' : 'var(--ok)' }}>
                  {a.garantieFin ? (a.garantieExpired ? 'Garantie expirée' : formatDateFR(a.garantieFin)) : ''}
                </div>
              </div>
            )
          })}
        </div>

        {/* Entreprises intervenantes */}
        <div className="card" style={{ padding: 0, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600 }}>Entreprises intervenantes ({(detail.members || []).length})</div>
          {(detail.members || []).map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{(m.user?.name || '?')[0].toUpperCase()}</div>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{m.user?.company || m.user?.name}</div><div style={{ fontSize: 10, color: 'var(--t3)' }}>{m.user?.metier || m.role}</div></div>
            </div>
          ))}
        </div>

        {/* Documents */}
        <div className="card" style={{ padding: 0, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600 }}>Documents ({(detail.documents || []).length})</div>
          {(detail.documents || []).slice(0, 20).map(d => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
              <span>📄</span>
              <div style={{ flex: 1, fontWeight: 600 }}>{d.name}</div>
              <span style={{ fontSize: 10, color: 'var(--t4)' }}>{d.type}</span>
              {d.url && <a href={d.url} download style={{ fontSize: 10, color: 'var(--blue)', textDecoration: 'none' }}>Télécharger</a>}
            </div>
          ))}
        </div>

        {/* Missions */}
        {(detail.missions || []).length > 0 && (
          <div className="card" style={{ padding: 0, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600 }}>Missions ({detail.missions.length})</div>
            {detail.missions.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                <div style={{ flex: 1 }}><div style={{ fontWeight: 600 }}>{m.title}</div><div style={{ fontSize: 10, color: 'var(--t3)' }}>{m.responsibleUser?.company || m.responsibleUser?.name || '—'}</div></div>
                <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: m.status === 'completed' ? 'rgba(52,199,89,.08)' : 'rgba(0,0,0,.04)', color: m.status === 'completed' ? 'var(--ok)' : 'var(--t3)' }}>{m.status}</span>
              </div>
            ))}
          </div>
        )}

        {/* Chronologie */}
        {(detail.timeline || []).length > 0 && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 600 }}>Chronologie</div>
            {detail.timeline.slice(0, 20).map((t, i) => (
              <div key={t.id || i} style={{ display: 'flex', gap: 10, padding: '6px 18px', borderBottom: '1px solid var(--border)', fontSize: 11 }}>
                <span style={{ color: 'var(--t4)' }}>{formatDateFR(t.createdAt)}</span>
                <span style={{ fontWeight: 600 }}>{t.action || '—'}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <DSPageHeader title="Passeport Numérique" subtitle="Mémoire officielle de vos bâtiments" />

      {passports.length === 0 ? (
        <DSEmptyState icon="🏛️" title="Aucun passeport numérique" description="Le Passeport Numérique est généré automatiquement à la clôture d'un projet. Il conserve la mémoire complète du bâtiment : actifs, garanties, entreprises, documents." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {passports.map(p => (
            <div key={p.id} className="card" style={{ padding: 16, cursor: 'pointer' }} onClick={() => loadDetail(p)}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>🏛️</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{p.nom}</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 8 }}>{p.adresse || '—'} · {p.type || '—'}</div>
              {p.dateLivraison && <div style={{ fontSize: 11, color: 'var(--t4)' }}>Livré le {formatDateFR(p.dateLivraison)}</div>}
              <div style={{ marginTop: 8, fontSize: 10, fontWeight: 600, color: 'var(--blue)' }}>Consulter →</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
