import { useState, useEffect } from 'react'
import Modal from '../../components/shared/Modal'
import { createPortal } from 'react-dom'
import { Users, User, Mail, Phone, Trash2 } from 'lucide-react'
import { useMeereo } from '../../hooks/useMeereoStore'
import { useMergedData } from '../../hooks/useMergedData'
import { DSPageHeader , DSEmptyState } from '../../design/components'
import { exportCSV } from '../../utils/export'
import { api } from '../../services/api/client'



const ErrMsg = ({ show }) => show
  ? <p style={{ color: 'var(--err)', fontSize: 11, marginTop: 4, fontWeight: 500 }}>Champ obligatoire</p>
  : null

function ClientModal({ isOpen, onClose, showToast }) {
  const { updateStore, emitEvent } = useMeereo()
  const [f, setF] = useState({ nom: '', type: 'Public', statut: 'actif', contact: '', poste: '', email: '', tel: '' })
  const [submitted, setSubmitted] = useState(false)
  const submit = async () => {
    setSubmitted(true)
    if (!f.nom.trim()) return
    try {
      const created = await api.contacts.create({ type: 'client', nom: f.nom, email: f.email || null, tel: f.tel || null, poste: f.poste || null, statut: f.statut || null, entreprise: f.contact || null })
      updateStore(prev => ({ ...prev, contacts: [...(prev.contacts || []), created], clients: [...(prev.clients || []), created] }))
      emitEvent('client_created', { name: f.nom })
      showToast('Client créé')
      setF({ nom: '', type: 'Public', statut: 'actif', contact: '', poste: '', email: '', tel: '' })
      setSubmitted(false); onClose()
    } catch (e) { showToast(e.message || 'Erreur création client', 'red') }
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau client" footer={<><button className="btn btn-sm" onClick={onClose}>Annuler</button><button className="btn btn-primary btn-sm" onClick={submit}>Créer le client</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label className="form-label">Nom / Raison sociale *</label><input className="form-input" placeholder="ex: Mairie de Vincennes" value={f.nom} onChange={e => setF(p => ({ ...p, nom: e.target.value }))} /><ErrMsg show={submitted && !f.nom.trim()} /></div>
        <div className="form-row">
          <div><label className="form-label">Type</label><select className="form-input" value={f.type} onChange={e => setF(p => ({ ...p, type: e.target.value }))}><option>Public</option><option>Privé</option><option>Particulier</option></select></div>
          <div><label className="form-label">Statut</label><select className="form-input" value={f.statut} onChange={e => setF(p => ({ ...p, statut: e.target.value }))}><option>Actif</option><option>Prospect</option><option>Inactif</option></select></div>
        </div>
        <div className="form-row">
          <div><label className="form-label">Contact</label><input className="form-input" placeholder="Prénom Nom" value={f.contact} onChange={e => setF(p => ({ ...p, contact: e.target.value }))} /></div>
          <div><label className="form-label">Poste</label><input className="form-input" placeholder="DGA Urbanisme" value={f.poste} onChange={e => setF(p => ({ ...p, poste: e.target.value }))} /></div>
        </div>
        <div className="form-row">
          <div><label className="form-label">Email</label><input className="form-input" type="email" placeholder="contact@exemple.com" value={f.email} onChange={e => setF(p => ({ ...p, email: e.target.value }))} /></div>
          <div><label className="form-label">Téléphone</label><input className="form-input" placeholder="+225 07 00 00 00" value={f.tel} onChange={e => setF(p => ({ ...p, tel: e.target.value }))} /></div>
        </div>
      </div>
    </Modal>
  )
}

export default function Clients({ openModal, showToast }) {
  const { store, updateStore } = useMeereo()
  const { clients: allClients } = useMergedData()
  const [search, setSearch] = useState('')
  const [editClient, setEditClient] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [showCreateClient, setShowCreateClient] = useState(false)

  // Auto-sync clients from markets — pour les pros, chaque marché signé/en cours/complété
  // dont le pro est fournisseur ajoute automatiquement le client dans le carnet d'adresses
  useEffect(() => {
    if (store.user?.type !== 'pro') return
    const userId = store.user?.id
    const markets = store.markets || []
    const existingContacts = store.contacts || []

    const ACCEPTED_STATUSES = ['SIGNED', 'IN_PROGRESS', 'COMPLETED', 'signed', 'in_progress', 'completed']
    const myMarkets = markets.filter(m =>
      m.supplierId === userId &&
      m.clientId !== userId &&  // guard: client must be a different person than the supplier
      ACCEPTED_STATUSES.some(s => (m.statut || '').toUpperCase() === s.toUpperCase()) &&
      (m.clientId || m.client?.name || m.clientName)  // only pass if real client data exists
    )

    const newOnes = []
    for (const m of myMarkets) {
      // Use backend-populated client relation first; never use clientCompany (was always current user's company)
      const clientNom = m.client?.company || m.client?.name || m.clientName || null
      const clientEmail = m.client?.email || m.clientEmail || ''
      if (!clientNom) continue // skip if no client info available
      const alreadyExists = existingContacts.some(c =>
        (clientEmail && c.email && c.email === clientEmail) ||
        (clientNom && c.nom && c.nom.toLowerCase() === clientNom.toLowerCase())
      )
      if (!alreadyExists) {
        newOnes.push({
          type: 'client',
          nom: clientNom,
          email: clientEmail,
          tel: m.clientTel || '',
          statut: 'actif',
          note: '',
        })
      }
    }
    if (newOnes.length === 0) return

    Promise.all(newOnes.map(c => api.contacts.create(c).catch(() => null))).then(created => {
      const valid = created.filter(Boolean)
      if (valid.length > 0) {
        updateStore(prev => ({
          ...prev,
          contacts: [...(prev.contacts || []), ...valid],
        }))
      }
    })
  }, [store.markets, store.user]) // eslint-disable-line react-hooks/exhaustive-deps

  const total = allClients.length
  const actifs = allClients.filter(c => c.statut === 'actif').length
  const filtered = search ? allClients.filter(c => (c.nom + (c.contact || '') + (c.email || '') + (c.type || '')).toLowerCase().includes(search.toLowerCase())) : allClients

  const saveEdit = () => {
    if (!editClient) return
    api.contacts.update(editClient.id, editClient).catch(() => {})
    updateStore(prev => ({
      ...prev,
      contacts: (prev.contacts || []).map(c => c.id === editClient.id ? { ...c, ...editClient } : c)
    }))
    setEditClient(null)
    showToast && showToast('Client mis à jour')
  }

  const doDelete = (id) => {
    api.contacts.delete(id).catch(() => {})
    updateStore(prev => ({
      ...prev,
      contacts: (prev.contacts || []).filter(c => c.id !== id)
    }))
    setDeleteConfirm(null)
    showToast && showToast('Client supprimé')
  }

  return (
    <div>
      <DSPageHeader title="Clients" subtitle={`${total} clients · ${actifs} actifs`}>
        <button className="btn btn-sm" onClick={() => { exportCSV(allClients.map(c => ({ nom: c.nom, type: c.type, statut: c.statut, contact: c.contact, email: c.email, tel: c.tel })), 'clients_meereo'); showToast && showToast('Export téléchargé') }}>Exporter</button>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateClient(true)}>+ Nouveau client</button>
      </DSPageHeader>

      <div className="rg-2" style={{ gap: 20, marginBottom: 24 }}>
        <div style={{ background: 'linear-gradient(145deg,#191c1d,#3c3b3b)', borderRadius: 12, padding: 22, color: '#fff' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>CRM</div>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-2.5px', lineHeight: 1, marginBottom: 5 }}>{total}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)' }}>clients dans le CRM</div>
        </div>
        <div className="rg-2" style={{ gap: 12 }}>
          {[{ v: actifs, l: 'Actifs' }, { v: allClients.filter(c => c.statut === 'prospect').length, l: 'Prospects' }, { v: total - actifs, l: 'Inactifs' }, { v: (store.projects || []).length, l: 'Projets lies' }].map((k, i) => (
            <div key={i} className="card" style={{ padding: 16 }}><div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.8px', marginBottom: 4 }}>{k.v}</div><div style={{ fontSize: 12, color: 'var(--t3)' }}>{k.l}</div></div>
          ))}
        </div>
      </div>

      <input placeholder="Rechercher un client..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 280, padding: '8px 14px', border: '1px solid var(--border-card)', borderRadius: 8, fontSize: 13, fontFamily: 'var(--f)', background: 'transparent', outline: 'none', color: 'var(--tx)', marginBottom: 16 }} />

      <div className="three-col">
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <DSEmptyState icon={<Users size={24}/>} title="Aucun client enregistré" description="Ajoutez vos clients pour gérer vos relations et associer vos projets." actionLabel="+ Nouveau client" onAction={() => setShowCreateClient(true)} />
          </div>
        )}
        {filtered.map(c => {
          const initials = (c.nom || "").split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
          const projCount = (store.projects || []).filter(p => p.client === c.nom || p.clientId === c.id).length
          return (
            <div key={c.id} className="card" style={{ overflow: 'hidden' }}>
              <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--t2)' }}>{initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="card-title" style={{ fontSize: 13 }}>{c.nom}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)' }}>{c.type}</div>
                </div>
                <span className={`status-pill ${c.statut === 'actif' ? 'status-done' : 'status-pending'}`}>{c.statut}</span>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><User size={12}/> {c.contact} · {c.poste}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mail size={12}/> {c.email}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={12}/> {c.tel}</div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div><div style={{ fontSize: 13, fontWeight: 700 }}>{c.volume || '—'}</div><div style={{ fontSize: 10, color: 'var(--t3)' }}>{c.honoraires} · {projCount} projet{projCount > 1 ? 's' : ''}</div></div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => setEditClient({ ...c })}>Modifier</button>
                    <button className="btn btn-sm" style={{ fontSize: 11, padding: '4px 10px', color: 'var(--err)' }} onClick={() => setDeleteConfirm(c)}>Supprimer</button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* â•â•â• MODAL: Modifier client â•â•â• */}
      {editClient && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setEditClient(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 480, boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-.5px' }}>Modifier — {editClient.nom}</div>
              <button onClick={() => setEditClient(null)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t3)' }}>À</button>
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label className="form-label">Nom / Raison sociale</label><input className="form-input" value={editClient.nom} onChange={e => setEditClient(p => ({ ...p, nom: e.target.value }))} /></div>
              <div className="modal-row">
                <div><label className="form-label">Type</label>
                  <select className="form-input" value={editClient.type} onChange={e => setEditClient(p => ({ ...p, type: e.target.value }))}>
                    <option>Promoteur</option><option>Particulier</option><option>SCI</option><option>Collectivité</option><option>État</option><option>Entreprise</option>
                  </select>
                </div>
                <div><label className="form-label">Statut</label>
                  <select className="form-input" value={editClient.statut} onChange={e => setEditClient(p => ({ ...p, statut: e.target.value }))}>
                    <option value="actif">Actif</option><option value="prospect">Prospect</option><option value="inactif">Inactif</option>
                  </select>
                </div>
              </div>
              <div className="modal-row">
                <div><label className="form-label">Contact</label><input className="form-input" value={editClient.contact} onChange={e => setEditClient(p => ({ ...p, contact: e.target.value }))} /></div>
                <div><label className="form-label">Poste</label><input className="form-input" value={editClient.poste} onChange={e => setEditClient(p => ({ ...p, poste: e.target.value }))} /></div>
              </div>
              <div className="modal-row">
                <div><label className="form-label">Email</label><input className="form-input" type="email" value={editClient.email} onChange={e => setEditClient(p => ({ ...p, email: e.target.value }))} /></div>
                <div><label className="form-label">Telephone</label><input className="form-input" value={editClient.tel} onChange={e => setEditClient(p => ({ ...p, tel: e.target.value }))} /></div>
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-sm" onClick={() => setEditClient(null)}>Annuler</button>
              <button className="btn btn-primary btn-sm" onClick={saveEdit}>Enregistrer</button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* â•â•â• MODAL: Confirmer suppression â•â•â• */}
      {deleteConfirm && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setDeleteConfirm(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,.15)', padding: 24, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(220,38,38,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}><Trash2 size={20} color="rgb(220,38,38)"/></div>
            <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-.4px', marginBottom: 6 }}>Supprimer ce client ?</div>
            <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 4 }}>{deleteConfirm.nom}</div>
            <div style={{ fontSize: 12, color: 'var(--t4)', lineHeight: 1.5, marginBottom: 20 }}>Cette action est irreversible. Les projets lies ne seront pas supprimes.</div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="btn btn-sm" onClick={() => setDeleteConfirm(null)}>Annuler</button>
              <button style={{ padding: '8px 18px', borderRadius: 8, background: 'var(--err)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12.5 }} onClick={() => doDelete(deleteConfirm.id)}>Supprimer</button>
            </div>
          </div>
        </div>,
        document.body
      )}
      <ClientModal isOpen={showCreateClient} onClose={() => setShowCreateClient(false)} showToast={showToast} />
    </div>
  )
}

