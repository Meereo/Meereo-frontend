import { useState } from 'react'
import Modal from '../../components/shared/Modal'
import { createPortal } from 'react-dom'
import { Star, Check, Store, Package, Clock, Factory, MapPin, Phone, Mail, Circle } from 'lucide-react'
import MoneyInput from '../../components/shared/MoneyInput'
import { useNavigate } from 'react-router-dom'
import { useMeereo } from '../../hooks/useMeereoStore'
import { useMergedData } from '../../hooks/useMergedData'
import { DSPageHeader, DSKpiStrip, DSFilterBar, DSSearchBar , DSEmptyState } from '../../design/components'

const stars = n => <>{Array.from({length: Math.floor(n)}, (_, i) => <Star key={i} size={11} fill="#F59E0B" strokeWidth={0}/>)}{n % 1 >= .5 ? '½' : ''}</>

const VERIF_DOCS = [
  { id: 'rccm', label: 'RCCM / Registre de commerce', required: true },
  { id: 'fiscal', label: 'Attestation fiscale', required: true },
  { id: 'ncc', label: 'NCC (Numéro de contribuable)', required: true },
  { id: 'cnps', label: 'Attestation CNPS', required: false },
  { id: 'photos', label: 'Photos entreprise / entrepét', required: true },
  { id: 'catalogue', label: 'Catalogue produits', required: false },
]


const ErrMsg = ({ show }) => show
  ? <p style={{ color: 'var(--err)', fontSize: 11, marginTop: 4, fontWeight: 500 }}>Champ obligatoire</p>
  : null

function SupplierModal({ isOpen, onClose, showToast }) {
  const { updateStore } = useMeereo()
  const [f, setF] = useState({ raison: '', specialite: '', ville: '', tel: '', email: '' })
  const [submitted, setSubmitted] = useState(false)
  const submit = async () => {
    setSubmitted(true)
    if (!f.raison.trim()) return
    try {
      const created = await api.contacts.create({ type: 'fournisseur', nom: f.raison, role: f.specialite || null, email: f.email || null, tel: f.tel || null, entreprise: f.raison, statut: 'actif' })
      updateStore(prev => ({ ...prev, contacts: [...(prev.contacts || []), created] }))
      showToast('Fournisseur ajouté')
      setF({ raison: '', specialite: '', ville: '', tel: '', email: '' }); setSubmitted(false); onClose()
    } catch (e) { showToast(e.message || 'Erreur ajout fournisseur', 'red') }
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau fournisseur" footer={<><button className="btn btn-sm" onClick={onClose}>Annuler</button><button className="btn btn-primary btn-sm" onClick={submit}>Enregistrer</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label className="form-label">Raison sociale *</label><input className="form-input" placeholder="Nom de l'entreprise..." value={f.raison} onChange={e => setF(p => ({ ...p, raison: e.target.value }))} /><ErrMsg show={submitted && !f.raison.trim()} /></div>
        <div><label className="form-label">Spécialité</label><input className="form-input" placeholder="Gros oeuvre, électricité..." value={f.specialite} onChange={e => setF(p => ({ ...p, specialite: e.target.value }))} /></div>
        <div className="form-row">
          <div><label className="form-label">Ville</label><input className="form-input" placeholder="Abidjan" value={f.ville} onChange={e => setF(p => ({ ...p, ville: e.target.value }))} /></div>
          <div><label className="form-label">Téléphone</label><input className="form-input" placeholder="+225..." value={f.tel} onChange={e => setF(p => ({ ...p, tel: e.target.value }))} /></div>
        </div>
        <div><label className="form-label">Email</label><input className="form-input" type="email" placeholder="contact@entreprise.com" value={f.email} onChange={e => setF(p => ({ ...p, email: e.target.value }))} /></div>
      </div>
    </Modal>
  )
}

export default function Suppliers({ showToast, openModal, onNavigate }) {
  const { store, updateStore } = useMeereo()
  const { fournisseurs: allFournisseurs } = useMergedData()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState('catalogue')
  const [showDevis, setShowDevis] = useState(null)
  const [devis, setDevis] = useState({ description: '', quantite: '', delai: '', projet: '', budget: '' })
  const [showVerif, setShowVerif] = useState(null)
  const [showCreateSupplier, setShowCreateSupplier] = useState(false)

  const total = allFournisseurs.length
  const verified = allFournisseurs.filter(f => f.verified).length
  const filtered = search ? allFournisseurs.filter(f => (f.nom + f.specialite + f.ville).toLowerCase().includes(search.toLowerCase())) : allFournisseurs

  const envoyerDevis = () => {
    if (!devis.description.trim()) return
    showToast && showToast('Demande de devis envoyée à ' + showDevis.nom + ' — le fournisseur vous répondra dans le Marketplace')
    setShowDevis(null)
    setDevis({ description: '', quantite: '', delai: '', projet: '', budget: '' })
  }

  const validerFournisseur = (f) => {
    updateStore(prev => ({
      ...prev,
      fournisseurs: (prev.fournisseurs || []).map(x => x.id === f.id ? { ...x, verified: true } : x)
    }))
    setShowVerif(null)
    showToast && showToast(f.nom + ' vérifié et approuvé')
  }

  return (
    <div>
      <DSPageHeader title="Fournisseurs" subtitle="Catalogue à évaluations à Vérification">
        <DSFilterBar filters={[{key:'catalogue',label:'Catalogue'},{key:'comparateur',label:'Comparateur'}]} active={viewMode} onChange={setViewMode} />
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateSupplier(true)}>+ Nouveau fournisseur</button>
      </DSPageHeader>

      <DSKpiStrip items={[
        { icon: <Store size={18}/>, iconBg: 'var(--s2)', value: total, label: 'Fournisseurs' },
        { icon: <Check size={18}/>, iconBg: 'var(--s2)', value: verified, label: 'Vérifiés' },
        { icon: <Package size={18}/>, iconBg: 'var(--s2)', value: [...new Set(allFournisseurs.map(f => f.specialite).filter(Boolean))].length, label: 'Spécialités' },
        { icon: <Clock size={18}/>, iconBg: 'var(--s2)', value: total - verified, label: 'En attente' },
      ]} />

      <div style={{ marginBottom: 16, maxWidth: 320 }}>
        <DSSearchBar value={search} onChange={setSearch} placeholder="Rechercher un fournisseur..." />
      </div>

      {viewMode === 'catalogue' ? (
        <div className="three-col">
          {filtered.length === 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <DSEmptyState icon={<Factory size={24}/>} title="Aucun fournisseur référencé" description="Retrouvez ici les fournisseurs avec lesquels vous travaillez." actionLabel="Aller au Marketplace" onAction={() => onNavigate && onNavigate('marketplace')} />
            </div>
          )}
          {filtered.map((f, idx) => {
            const initials = f.nom.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
            return (
              <div key={idx} className="card" style={{ padding: 18 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                  {f.logoUrl
                    ? <img src={f.logoUrl} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
                    : <div style={{ width: 44, height: 44, borderRadius: 10, background: f.color || 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{initials}</span>
                      </div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{f.nom}</span>
                      {f.verified ? (
                        <span style={{ fontSize: 9, background: 'rgba(52,199,89,.08)', color: 'var(--ok)', padding: '2px 6px', borderRadius: 100, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}><Check size={9}/> Vérifié</span>
                      ) : (
                        <span style={{ fontSize: 9, background: 'rgba(255,149,0,.08)', color: 'var(--wrn)', padding: '2px 6px', borderRadius: 100, fontWeight: 600, cursor: 'pointer' }} onClick={() => setShowVerif(f)}>Non vérifié</span>
                      )}
                    </div>
                    <div style={{ fontSize: 11.5, color: 'var(--t3)' }}>{f.specialite}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--s2)', padding: '3px 8px', borderRadius: 6, border: '1px solid var(--border-card)', display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={11}/> {f.ville}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                  {f.tel && <div style={{ fontSize: 11, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={11}/> {f.tel}</div>}
                  {f.email && <div style={{ fontSize: 11, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={11}/> {f.email}</div>}
                  {f.adresse && <div style={{ fontSize: 11, color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={11}/> {f.adresse}</div>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, color: '#F59E0B' }}>{stars(f.note)} <span style={{ fontWeight: 600, color: 'var(--t2)', marginLeft: 3 }}>{f.note}/5</span> <span style={{ fontSize: 10, color: 'var(--t4)' }}>({f.nbAvis || 0})</span></div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm" style={{ fontSize: 11, padding: '5px 10px' }} onClick={() => { setShowDevis(f); setDevis({ description: '', quantite: '', delai: '', projet: '', budget: '' }) }}>Devis</button>
                    {f.publicId && <button className="btn btn-primary btn-sm" style={{ fontSize: 11, padding: '5px 10px' }} onClick={() => navigate(`/pro?uuid=${f.publicId}`)}>Profil</button>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card">
          <table className="data-table">
            <thead><tr><th>Fournisseur</th><th>Spécialité</th><th>Ville</th><th>Note</th><th>Vérifié</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.sort((a, b) => b.note - a.note).map((f, i) => (
                <tr key={i}>
                  <td className="bold">{f.nom}</td>
                  <td className="muted">{f.specialite}</td>
                  <td className="muted">{f.ville}</td>
                  <td><span style={{ color: '#F59E0B' }}>{stars(f.note)}</span> <strong>{f.note}</strong> <span style={{ fontSize: 10, color: 'var(--t4)' }}>({f.nbAvis || 0})</span></td>
                  <td>{f.verified ? <span className="status-pill status-done" style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}><Check size={9}/> Vérifié</span> : <span style={{ fontSize: 10, color: 'var(--wrn)', cursor: 'pointer' }} onClick={() => setShowVerif(f)}>Non vérifié</span>}</td>
                  <td><div style={{ display: 'flex', gap: 6 }}><button className="btn btn-sm" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => { setShowDevis(f); setDevis({ description: '', quantite: '', delai: '', projet: '', budget: '' }) }}>Devis</button>{f.publicId && <button className="btn btn-sm" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => navigate(`/pro?uuid=${f.publicId}`)}>Profil</button>}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Demander un devis */}
      {showDevis && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setShowDevis(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 500, boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>Demander un devis</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{showDevis.nom} à {showDevis.specialite}</div>
                </div>
                <button onClick={() => setShowDevis(null)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t3)' }}>×</button>
              </div>
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: '10px 14px', background: 'var(--s2)', borderRadius: 10, fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>
                Décrivez votre besoin. Le fournisseur vous répondra avec un prix dans le <strong>Marketplace</strong>. Vous pourrez accepter, contre-proposer ou refuser.
              </div>
              <div><label className="form-label">Description du besoin *</label><textarea className="form-input" value={devis.description} onChange={e => setDevis(p => ({ ...p, description: e.target.value }))} placeholder="Decrivez les materiaux, les specifications, les quantites approximatives..." /></div>
              <div className="modal-row">
                <div><label className="form-label">Quantite</label><input className="form-input" value={devis.quantite} onChange={e => setDevis(p => ({ ...p, quantite: e.target.value }))} placeholder="ex: 50m², 200 unites, 5 tonnes" /></div>
                <div><label className="form-label">Delai souhaite</label><input className="form-input" value={devis.delai} onChange={e => setDevis(p => ({ ...p, delai: e.target.value }))} placeholder="ex: Sous 2 semaines" /></div>
              </div>
              <div><label className="form-label">Projet associe</label>
                <select className="form-input" value={devis.projet} onChange={e => setDevis(p => ({ ...p, projet: e.target.value }))}>
                  <option value="">Aucun</option>
                  {(store.projects || []).map(p => <option key={p.id} value={p.nom}>{p.nom}</option>)}
                </select>
              </div>
              <div><label className="form-label">Budget estimatif (FCFA)</label><MoneyInput value={devis.budget} onChange={v => setDevis(p => ({ ...p, budget: v }))} placeholder="500 000" /></div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-sm" onClick={() => setShowDevis(null)}>Annuler</button>
              <button className="btn btn-primary btn-sm" disabled={!devis.description.trim()} onClick={envoyerDevis}>Envoyer la demande</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Modal: Verification fournisseur */}
      {showVerif && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setShowVerif(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 520, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600 }}>Verification fournisseur</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{showVerif.nom}</div>
                </div>
                <button onClick={() => setShowVerif(null)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t3)' }}>×</button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
              {/* Status */}
              <div style={{ padding: '14px 16px', background: showVerif.verified ? 'rgba(52,199,89,.06)' : 'rgba(255,149,0,.06)', border: '1px solid ' + (showVerif.verified ? 'rgba(52,199,89,.12)' : 'rgba(255,149,0,.12)'), borderRadius: 10, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: showVerif.verified ? 'var(--ok)' : 'var(--wrn)' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: showVerif.verified ? 'var(--ok)' : 'var(--wrn)' }}>{showVerif.verified ? 'Fournisseur vérifié' : 'En attente de vérification'}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>
                  {showVerif.verified ? 'Ce fournisseur a ete valide par l\'equipe MEEREO. Ses documents sont conformes.' : 'Ce fournisseur n\'a pas encore ete verifie. Les documents requis doivent etre soumis et valides par MEEREO.'}
                </div>
              </div>

              {/* Documents requis */}
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Documents requis</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                {VERIF_DOCS.map(d => {
                  const submitted = showVerif.verified || Math.random() > 0.4
                  return (
                    <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--surface-1)', borderRadius: 10, border: '1px solid var(--border-card)' }}>
                      <div style={{ width: 28, height: 28, borderRadius: 7, background: submitted ? 'rgba(52,199,89,.08)' : 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{submitted ? <Check size={12} color="var(--ok)"/> : <Circle size={12} color="var(--t4)"/>}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: submitted ? 'var(--tx)' : 'var(--t3)' }}>{d.label}</div>
                        {d.required && <span style={{ fontSize: 9, color: 'var(--err)', fontWeight: 600 }}>Obligatoire</span>}
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: submitted ? 'var(--ok)' : 'var(--t4)' }}>{submitted ? 'Soumis' : 'Manquant'}</span>
                    </div>
                  )
                })}
              </div>

              {/* Infos fournisseur */}
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Informations</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--border)' }}><span style={{ color: 'var(--t3)' }}>Nom</span><span style={{ fontWeight: 600 }}>{showVerif.nom}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--border)' }}><span style={{ color: 'var(--t3)' }}>Spécialité</span><span style={{ fontWeight: 600 }}>{showVerif.specialite}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--border)' }}><span style={{ color: 'var(--t3)' }}>Ville</span><span style={{ fontWeight: 600 }}>{showVerif.ville}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0', borderBottom: '1px solid var(--border)' }}><span style={{ color: 'var(--t3)' }}>Email</span><span style={{ fontWeight: 600 }}>{showVerif.email}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '6px 0' }}><span style={{ color: 'var(--t3)' }}>Telephone</span><span style={{ fontWeight: 600 }}>{showVerif.tel}</span></div>
              </div>
            </div>

            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end', flexShrink: 0 }}>
              <button className="btn btn-sm" onClick={() => setShowVerif(null)}>Fermer</button>
              {!showVerif.verified && (
                <button style={{ padding: '8px 18px', borderRadius: 10, background: 'var(--ok)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 13 }} onClick={() => validerFournisseur(showVerif)}>Valider et approuver</button>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
      <SupplierModal isOpen={showCreateSupplier} onClose={() => setShowCreateSupplier(false)} showToast={showToast} />
    </div>
  )
}

