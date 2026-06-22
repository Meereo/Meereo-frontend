import { useState } from 'react'
import Modal from '../../components/shared/Modal'
import { HardHat, Star, Mail, Phone } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useMeereo } from '../../hooks/useMeereoStore'
import { useMergedData } from '../../hooks/useMergedData'
import { DSPageHeader , DSEmptyState } from '../../design/components'


const ErrMsg = ({ show }) => show
  ? <p style={{ color: 'var(--err)', fontSize: 11, marginTop: 4, fontWeight: 500 }}>Champ obligatoire</p>
  : null

function ContractorModal({ isOpen, onClose, showToast }) {
  const { updateStore } = useMeereo()
  const [f, setF] = useState({ nom: '', role: '', email: '', tel: '' })
  const [submitted, setSubmitted] = useState(false)
  const submit = async () => {
    setSubmitted(true)
    if (!f.nom.trim()) return
    try {
      const created = await api.contacts.create({ type: 'intervenant', nom: f.nom, role: f.role || null, email: f.email || null, tel: f.tel || null })
      updateStore(prev => ({ ...prev, contacts: [...(prev.contacts || []), created], intervenants: [...(prev.intervenants || []), created] }))
      showToast('Intervenant ajouté')
      setF({ nom: '', role: '', email: '', tel: '' }); setSubmitted(false); onClose()
    } catch (e) { showToast(e.message || 'Erreur ajout intervenant', 'red') }
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvel intervenant" footer={<><button className="btn btn-sm" onClick={onClose}>Annuler</button><button className="btn btn-primary btn-sm" onClick={submit}>Ajouter</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label className="form-label">Nom complet *</label><input className="form-input" placeholder="Prénom Nom" value={f.nom} onChange={e => setF(p => ({ ...p, nom: e.target.value }))} /><ErrMsg show={submitted && !f.nom.trim()} /></div>
        <div><label className="form-label">Rôle / Spécialité</label><input className="form-input" placeholder="BET Structure, Géomètre..." value={f.role} onChange={e => setF(p => ({ ...p, role: e.target.value }))} /></div>
        <div className="form-row">
          <div><label className="form-label">Email</label><input className="form-input" type="email" value={f.email} onChange={e => setF(p => ({ ...p, email: e.target.value }))} /></div>
          <div><label className="form-label">Téléphone</label><input className="form-input" placeholder="+225 07 00 00 00" value={f.tel} onChange={e => setF(p => ({ ...p, tel: e.target.value }))} /></div>
        </div>
      </div>
    </Modal>
  )
}

export default function Contractors({ showToast, openModal }) {
  const { updateStore } = useMeereo()
  const { intervenants: allIntervenants } = useMergedData()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [, refresh] = useState(0)
  const [showCreateContractor, setShowCreateContractor] = useState(false)

  const total = allIntervenants.length
  const entreprises = allIntervenants.filter(i => i.entreprise).length
  const independants = total - entreprises

  const types = [...new Set(allIntervenants.map(i => i.role))]

  const filtered = allIntervenants.filter(i => {
    const tOk = typeFilter === 'all' || i.role === typeFilter
    const q = search.toLowerCase()
    return tOk && (!q || (i.nom + i.role + i.email + (i.projets || []).join(' ')).toLowerCase().includes(q))
  })

  const stars = n => <>{Array.from({length: Math.floor(n)}, (_, i) => <Star key={i} size={11} fill="#F59E0B" strokeWidth={0}/>)}{n % 1 >= .5 ? '½' : ''}</>

  return (
    <div>
      <DSPageHeader title="Intervenants" subtitle="Prestataires externes assignés à vos projets">
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateContractor(true)}>+ Intervenant</button>
      </DSPageHeader>

      <div className="rg-2" style={{ gap: 20, marginBottom: 24 }}>
        <div style={{ background: 'linear-gradient(145deg,#191c1d,#3c3b3b)', borderRadius: 12, padding: 22, color: '#fff' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Prestataires externes</div>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-2.5px', lineHeight: 1, marginBottom: 5 }}>{total}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)' }}>intervenants references</div>
        </div>
        <div className="rg-2" style={{ gap: 12 }}>
          {[{ v: entreprises, l: 'Entreprises' }, { v: independants, l: 'Independants' }, { v: allIntervenants.filter(i => i.statut === 'actif').length, l: 'Actifs' }, { v: [...new Set(allIntervenants.flatMap(i => i.projets || []))].length, l: 'Projets' }].map((k, i) => (
            <div key={i} className="card" style={{ padding: 16 }}><div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.8px', marginBottom: 4 }}>{k.v}</div><div style={{ fontSize: 12, color: 'var(--t3)' }}>{k.l}</div></div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <input placeholder="Rechercher un intervenant..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 280, padding: '8px 14px', border: '1px solid var(--border-card)', borderRadius: 8, fontSize: 13, fontFamily: 'var(--f)', background: 'transparent', outline: 'none', color: 'var(--tx)' }} />
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button className={`filter-pill ${typeFilter === 'all' ? 'active' : ''}`} onClick={() => setTypeFilter('all')}>Tous</button>
          {types.map(t => <button key={t} className={`filter-pill ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>{t}</button>)}
        </div>
      </div>

      <div className="three-col">
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <DSEmptyState icon={<HardHat size={24}/>} title="Aucun intervenant référencé" description="Les prestataires assignés à vos projets apparaîtront ici automatiquement." actionLabel="+ Intervenant" onAction={() => setShowCreateContractor(true)} />
          </div>
        )}
        {filtered.map(m => {
          const initials = (m.nom || "").split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
          return (
            <div key={m.id} className="card" style={{ padding: 20 }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                {m.photo ? (
                  <img src={m.photo} alt="" style={{ width: 46, height: 46, borderRadius: m.entreprise ? 10 : 23, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
                ) : (
                  <div style={{ width: 46, height: 46, borderRadius: m.entreprise ? 10 : 23, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'var(--t2)', flexShrink: 0 }}>{initials}</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{m.nom}</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)' }}>{m.role}{m.ville ? ' à ' + m.ville : ''}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: m.entreprise ? 'rgba(37,99,235,.08)' : 'rgba(124,58,237,.08)', color: m.entreprise ? '#2563EB' : '#7C3AED' }}>{m.entreprise ? 'Entreprise' : 'Independant'}</span>
              </div>

              {/* Note */}
              {m.note > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <span style={{ fontSize: 12, color: '#F59E0B' }}>{stars(m.note)}</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{m.note}/5</span>
                  <span style={{ fontSize: 10, color: 'var(--t4)' }}>({m.nbAvis || 0} avis)</span>
                </div>
              )}

              {/* Projets */}
              {(m.projets || []).length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
                  {m.projets.map((p, i) => (
                    <span key={i} style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 6, background: 'var(--s2)', border: '1px solid var(--border-card)' }}>{p}</span>
                  ))}
                </div>
              )}

              {/* Contact */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {m.email && <div style={{ fontSize: 11.5, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={11}/> {m.email}</div>}
                {m.tel && <div style={{ fontSize: 11.5, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={11}/> {m.tel}</div>}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                {m.profilUrl && (
                  <button className="btn btn-sm" style={{ fontSize: 11, padding: '5px 10px' }} onClick={() => navigate(m.profilUrl)}>Voir profil →</button>
                )}
                <button className="btn btn-sm" style={{ fontSize: 11, padding: '5px 10px' }} onClick={() => {  showToast && showToast('Nouveau message pour ' + m.nom) }}>Contacter</button>
                <button style={{ fontSize: 11, padding: '5px 10px', borderRadius: 6, border: '1px solid rgba(220,38,38,.2)', background: 'rgba(220,38,38,.04)', color: 'var(--err)', cursor: 'pointer', fontFamily: 'var(--f)', fontWeight: 600 }} onClick={() => {
                  updateStore(prev => ({ ...prev, intervenants: (prev.intervenants || []).filter(x => x.id !== m.id) }))
                  refresh(n => n + 1)
                  showToast && showToast(m.nom + ' retire des intervenants')
                }}>Retirer</button>
              </div>
            </div>
          )
        })}
      </div>
      <ContractorModal isOpen={showCreateContractor} onClose={() => setShowCreateContractor(false)} showToast={showToast} />
    </div>
  )
}

