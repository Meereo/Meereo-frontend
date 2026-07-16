import { useState, useMemo, useCallback, useEffect } from 'react'
import Modal from '../../components/shared/Modal'
import MoneyInput from '../../components/shared/MoneyInput'
import { ClipboardList, Clock, CheckCircle2, XCircle, Star, FileText, Archive, Building2, Send, User } from 'lucide-react'
import { getEntrepriseAvatar } from '../../data/avatars'
import { useDevise } from '../../hooks/useDevise'

// Résolution du logo d'une offre : logo réel > lookup statique > initiales
function getOfferAvatar(offer) {
  if (offer?.logoUrl) return { type: 'img', value: offer.logoUrl, initials: '' }
  return getEntrepriseAvatar(offer?.entreprise) || { type: null, initials: (offer?.entreprise || '').split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase() }
}
import { useMeereo } from '../../hooks/useMeereoStore'
import { useMergedData } from '../../hooks/useMergedData'
import { api } from '../../services/api/client'
import { sendSocketMessage, getSocket } from '../../services/socket'
import { getRoleLabel, getRoleBadgeStyle } from '../../domain/roleLabels'
import { normalizeOfferStatus, OFFER_STATUS, getStatusLabel } from '../../domain/status'
import { DSPageHeader, DSKpiStrip, DSFilterBar, DSStatusBadge, DSSearchBar, DSEmptyState } from '../../design/components'
import { exportCSV } from '../../utils/export'

const FILTERS = [
  { key: 'all', label: 'Toutes' },
  { key: OFFER_STATUS.PENDING, label: 'En attente' },
  { key: OFFER_STATUS.ACCEPTED, label: 'Acceptées' },
  { key: OFFER_STATUS.REJECTED, label: 'Refusées' },
]

// Délai d'archivage : offre dûcidûe depuis plus de 30 jours
const ARCHIVE_DAYS = 30
function isArchivable(offer) {
  if (offer.statut === OFFER_STATUS.PENDING) return false
  if (!offer.updatedAt && !offer.createdAt) return false
  const ref = new Date(offer.updatedAt || offer.createdAt)
  if (isNaN(ref.getTime())) return false
  return (Date.now() - ref.getTime()) > ARCHIVE_DAYS * 24 * 3600 * 1000
}


const ErrMsg = ({ show }) => show
  ? <p style={{ color: 'var(--err)', fontSize: 11, marginTop: 4, fontWeight: 500 }}>Champ obligatoire</p>
  : null

function OfferModal({ isOpen, onClose, showToast }) {
  const { store, updateStore, emitEvent } = useMeereo()
  const [f, setF] = useState({ titre: '', entreprise: '', projet: '', montant: '', delai: '', note: '' })
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)
  const submit = async () => {
    setSubmitted(true)
    if (!f.titre.trim()) return
    setSaving(true)
    try {
      const created = await api.offers.create({ ...f, statut: 'en_attente' })
      updateStore(prev => ({ ...prev, offers: [...(prev.offers || []), created] }))
      emitEvent('offer_received', { title: f.titre, from: f.entreprise }, { notifMsg: `Nouvelle offre : ${f.titre}`, notifType: 'blue' })
      showToast('Offre enregistrée')
      setF({ titre: '', entreprise: '', projet: '', montant: '', delai: '', note: '' }); setSubmitted(false); onClose()
    } catch (e) { showToast(e.message || 'Erreur enregistrement offre', 'red') }
    finally { setSaving(false) }
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enregistrer une offre" footer={<><button className="btn btn-sm" onClick={onClose}>Annuler</button><button className="btn btn-primary btn-sm" onClick={submit} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label className="form-label">Titre du lot *</label><input className="form-input" placeholder="ex: Gros Oeuvre — Villa" value={f.titre} onChange={e => setF(p => ({ ...p, titre: e.target.value }))} /><ErrMsg show={submitted && !f.titre.trim()} /></div>
        <div className="form-row">
          <div><label className="form-label">Entreprise</label><input className="form-input" placeholder="Nom" value={f.entreprise} onChange={e => setF(p => ({ ...p, entreprise: e.target.value }))} /></div>
          <div><label className="form-label">Projet</label><select className="form-input" value={f.projet} onChange={e => setF(p => ({ ...p, projet: e.target.value }))}>{(store.projects || []).map(p => <option key={p.id}>{p.nom}</option>)}</select></div>
        </div>
        <div className="form-row">
          <div><label className="form-label">Montant (FCFA)</label><MoneyInput value={f.montant} onChange={v => setF(p => ({ ...p, montant: v }))} placeholder="45 000 000" /></div>
          <div><label className="form-label">Délai</label><input className="form-input" placeholder="4 mois" value={f.delai} onChange={e => setF(p => ({ ...p, delai: e.target.value }))} /></div>
        </div>
        <div><label className="form-label">Note d'analyse</label><textarea className="form-input" rows="3" placeholder="Observations..." value={f.note} onChange={e => setF(p => ({ ...p, note: e.target.value }))} /></div>
      </div>
    </Modal>
  )
}

export default function Offers({ showToast, openModal, onNavigate }) {
  const { formatShort, parseBudget } = useDevise()
  const { store, acceptOffer, rejectOffer, updateStore, emitEvent } = useMeereo()
  const { offers: rawOffres, STATIC: { INTERVENANTS_DATA } } = useMergedData()
  // Onglet principal : 'offres' | 'contrats'
  const [mainTab, setMainTab] = useState('offres')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [showCreateOffer, setShowCreateOffer] = useState(false)
  const [infoModal, setInfoModal] = useState(null) // offer object for "Demander info"
  const [infoMessage, setInfoMessage] = useState('')

  // Le backend filtre dûjé les offres par utilisateur (offres sur ses AOs pour un client,
  // offres soumises pour un pro). On utilise rawOffres directement.
  const isClient = store.user?.type === 'client'
  const allOffres = useMemo(() => rawOffres, [rawOffres])

  const total = allOffres.length
  const attente = allOffres.filter(o => o.statut === OFFER_STATUS.PENDING).length
  const acceptees = allOffres.filter(o => o.statut === OFFER_STATUS.ACCEPTED).length
  const refusees = allOffres.filter(o => o.statut === OFFER_STATUS.REJECTED).length

  // Séparer actives / archivées pour l'onglet offres
  const activeOffres = allOffres.filter(o => !isArchivable(o))
  const archivedOffres = allOffres.filter(o => isArchivable(o))

  const filtered = activeOffres.filter(o => {
    const statOk = filter === 'all' || o.statut === filter
    const q = search.toLowerCase()
    return statOk && (!q || (o.titre + o.entreprise + o.projet + o.lot).toLowerCase().includes(q))
  })
  const filteredArchived = archivedOffres.filter(o => {
    const q = search.toLowerCase()
    return !q || (o.titre + o.entreprise + o.projet + o.lot).toLowerCase().includes(q)
  })

  // Contrats = offres acceptées (actives + archivées)
  const contrats = allOffres.filter(o => o.statut === OFFER_STATUS.ACCEPTED)
  const contratsActifs = contrats.filter(o => !isArchivable(o))
  const contratsArchives = contrats.filter(o => isArchivable(o))

  const selected = selectedId ? allOffres.find(o => o.id === selectedId) : filtered[0]

  const decide = (id, decision) => {
    const normalized = normalizeOfferStatus(decision)
    if (normalized === OFFER_STATUS.ACCEPTED) {
      acceptOffer(id)
    } else if (normalized === OFFER_STATUS.REJECTED) {
      rejectOffer(id)
    } else {
      updateStore(prev => ({ ...prev, offerStatuts: { ...(prev.offerStatuts || {}), [id]: decision } }))
      api.offers.update(id, { statut: decision }).catch(() => {})
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flexShrink: 0 }}>
        <DSPageHeader
          title={isClient ? 'Offres reçues & Contrats' : 'Offres envoyées & Contrats'}
          subtitle={isClient
            ? `${total} offres à ${attente} en attente à ${acceptees} contrats`
            : `${total} offres envoyées à ${attente} en attente à ${acceptees} acceptées`}>
          <button className="btn btn-sm" onClick={() => { exportCSV(allOffres.map(o => ({ entreprise: o.entreprise, lot: o.lot, montant: o.montant, statut: o.statut, delai: o.delai, soumis: o.soumis })), 'offres_meereo'); showToast && showToast('Export téléchargé') }}>Exporter</button>
          {isClient && <button className="btn btn-primary btn-sm" onClick={() => setShowCreateOffer(true)}>+ Nouvelle offre</button>}
        </DSPageHeader>

        {/* Onglets principaux */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 0 }}>
          {[
            { key: 'offres', label: isClient ? 'Offres reçues' : 'Offres envoyées', icon: isClient ? <ClipboardList size={13}/> : <Send size={13}/>, count: total },
            { key: 'contrats', label: isClient ? 'Contrats validés' : 'Contrats obtenus', icon: <FileText size={13}/>, count: acceptees },
          ].map(t => (
            <button key={t.key} onClick={() => { setMainTab(t.key); setSelectedId(null) }} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 20px', border: 'none', background: 'transparent', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 13, fontWeight: mainTab === t.key ? 700 : 500, color: mainTab === t.key ? 'var(--tx)' : 'var(--t3)', borderBottom: mainTab === t.key ? '2px solid var(--tx)' : '2px solid transparent', marginBottom: -1, transition: 'all .15s' }}>
              {t.icon} {t.label}
              {t.count > 0 && <span style={{ fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 100, background: mainTab === t.key ? 'var(--tx)' : 'var(--s2)', color: mainTab === t.key ? '#fff' : 'var(--t3)' }}>{t.count}</span>}
            </button>
          ))}
        </div>

        <DSKpiStrip items={[
          { icon: <ClipboardList size={14}/>, iconBg: 'rgba(0,0,0,.04)', value: total, label: 'Total' },
          { icon: <Clock size={14}/>, iconBg: 'rgba(255,149,0,.06)', value: attente, label: 'En attente' },
          { icon: <CheckCircle2 size={14} color="var(--ok)"/>, iconBg: 'rgba(52,199,89,.06)', value: acceptees, label: 'Acceptées' },
          { icon: <XCircle size={14} color="var(--err)"/>, iconBg: 'rgba(220,38,38,.05)', value: refusees, label: 'Refusées' },
        ]} />
      </div>

      {/* VUE CONTRATS VALIDéS */}
      {mainTab === 'contrats' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {contrats.length === 0 ? (
            <DSEmptyState icon={<FileText size={24}/>} title="Aucun contrat validé" description="Les offres acceptées apparaîtront ici comme contrats actifs." />
          ) : (
            <>
              {contratsActifs.length > 0 && (
                <>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 12 }}>Contrats actifs ({contratsActifs.length})</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                    {contratsActifs.map(o => <ContratCard key={o.id} offer={o} formatShort={formatShort} parseBudget={parseBudget} INTERVENANTS_DATA={INTERVENANTS_DATA} />)}
                  </div>
                </>
              )}
              {contratsArchives.length > 0 && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <Archive size={12} color="var(--t4)" />
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Archives ({contratsArchives.length})</div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: 0.45 }}>
                    {contratsArchives.map(o => <ContratCard key={o.id} offer={o} formatShort={formatShort} parseBudget={parseBudget} INTERVENANTS_DATA={INTERVENANTS_DATA} archived />)}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* VUE OFFRES REéUES */}
      {mainTab === 'offres' && (
      <div className="split" style={{ marginTop: 0, flex: 1, overflow: 'hidden' }}>
        {/* Liste */}
        <div className="split-left">
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <DSSearchBar value={search} onChange={setSearch} placeholder="Rechercher une offre..." />
            <DSFilterBar filters={FILTERS} active={filter} onChange={setFilter} />
          </div>
          {filtered.map(o => (
            <div key={o.id} className="list-item" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selected?.id === o.id ? 'var(--s2)' : undefined }} onClick={() => setSelectedId(o.id)}>
              {(() => { const av = getOfferAvatar(o); return (
                <div style={{ width: 40, height: 40, borderRadius: 10, background: av?.type === 'color' ? av.value : av?.type === 'img' ? 'var(--s2)' : o.color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: av?.type === 'color' ? '#fff' : o.color, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                  {av?.type === 'img' ? <img src={av.value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (av?.initials || (o.entreprise || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase())}
                  {o.lu === false && <div style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: 'var(--tx)', border: '2px solid var(--surface-1)' }} />}
                </div>
              )})()}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: o.lu === false ? 800 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-.2px' }}>{o.entreprise}</div>
                <div style={{ fontSize: 11, color: o.lu === false ? 'var(--tx)' : 'var(--t3)', fontWeight: o.lu === false ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.lot} à {formatShort(parseBudget(o.montant))}</div>
              </div>
              <DSStatusBadge status={o.statut} />
            </div>
          ))}
          {filtered.length === 0 && filteredArchived.length === 0 && (
            <DSEmptyState icon={<ClipboardList size={24}/>} title="Aucune offre trouvée" description="Modifiez vos filtres ou enregistrez une nouvelle offre." />
          )}
          {/* Archives */}
          {filteredArchived.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 14px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--s2)' }}>
                <Archive size={11} color="var(--t4)" />
                <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Archivées ({filteredArchived.length})</span>
              </div>
              {filteredArchived.map(o => (
                <div key={o.id} className="list-item" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', opacity: 0.45, background: selected?.id === o.id ? 'var(--s2)' : undefined }} onClick={() => setSelectedId(o.id)}>
                  {(() => { const av = getOfferAvatar(o); return (
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: av?.type === 'color' ? av.value : av?.type === 'img' ? 'var(--s2)' : 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: av?.type === 'color' ? '#fff' : 'var(--t3)', flexShrink: 0, overflow: 'hidden' }}>
                      {av?.type === 'img' ? <img src={av.value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (av?.initials || (o.entreprise || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase())}
                    </div>
                  )})()}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.entreprise}</div>
                    <div style={{ fontSize: 10, color: 'var(--t4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.lot} à {formatShort(parseBudget(o.montant))}</div>
                  </div>
                  <DSStatusBadge status={o.statut} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detail */}
        <div className="split-right">
          {!selected ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <DSEmptyState icon={<ClipboardList size={24}/>} title="Sélectionnez une offre" description="Choisissez une offre dans la liste pour voir le dûtail et dûcider." />
            </div>
          ) : (
            <div>
              {/* Banniére statut si dûcision prise */}
              {selected.statut !== OFFER_STATUS.PENDING && (
                <div style={{ padding: '12px 18px', marginBottom: 20, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...(selected.statut === OFFER_STATUS.ACCEPTED ? { background: 'rgba(52,199,89,.06)', border: '1px solid rgba(52,199,89,.12)' } : { background: 'rgba(220,38,38,.05)', border: '1px solid rgba(220,38,38,.1)' }) }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: selected.statut === OFFER_STATUS.ACCEPTED ? 'var(--ok)' : 'var(--err)' }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Offre {getStatusLabel(selected.statut).toLowerCase()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {selected.statut === OFFER_STATUS.REJECTED && (
                      <button className="btn btn-sm" style={{ fontSize: 10 }} onClick={() => decide(selected.id, 'en_attente')}>Annuler</button>
                    )}
                    {selected.statut === OFFER_STATUS.REJECTED && (
                      <button className="btn btn-sm" style={{ fontSize: 10, color: 'var(--err)', background: 'rgba(220,38,38,.06)', border: '1px solid rgba(220,38,38,.12)' }} onClick={() => {
                        updateStore(prev => ({ ...prev, offers: (prev.offers || []).filter(o => o.id !== selected.id) }))
                        api.offers.delete ? api.offers.delete(selected.id).catch(() => {}) : api.offers.update(selected.id, { statut: 'deleted' }).catch(() => {})
                        setSelectedId(null)
                        showToast && showToast('Offre supprimée')
                      }}>Supprimer</button>
                    )}
                  </div>
                </div>
              )}

              {/* En-tête entreprise */}
              {(() => { const av = getOfferAvatar(selected); return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: av?.type === 'color' ? av.value : av?.type === 'img' ? 'var(--s2)' : 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 600, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
                  {av?.type === 'img' ? <img src={av.value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (av?.initials || (selected.entreprise || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase())}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-.3px' }}>{selected.entreprise}</span>
                    {selected.supplierRole && <span style={getRoleBadgeStyle(selected.supplierRole)}>{getRoleLabel(selected.supplierRole)}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--t3)' }}>{selected.nbRef || 0} projets à {(selected.certifs || []).join(' à ') || 'Aucune certification'}</div>
                </div>
                {(() => {
                  const inter = INTERVENANTS_DATA.find(i => i.nom === selected.entreprise)
                  const note = inter?.note || 0
                  return (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 1, marginBottom: 2 }}>
                        {Array.from({length: 5}, (_, i) => (
                          <Star key={i} size={15} fill={i < Math.round(note) ? '#F59E0B' : 'none'} color="#F59E0B" strokeWidth={1.5}/>
                        ))}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{note > 0 ? note + '/5' : '—'}</div>
                      <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--t4)' }}>{inter?.nbAvis || 0} avis</div>
                    </div>
                  )
                })()}
              </div>
              )})()}

              {/* Tags */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
                {selected.lot && <DSStatusBadge status="active" label={selected.lot} />}
                {selected.projet && <DSStatusBadge status="active" label={selected.projet} />}
                {selected.delai && <DSStatusBadge status="neutral" label={selected.delai} />}
                <DSStatusBadge status="neutral" label={'Soumis le ' + selected.soumis} />
              </div>

              {/* Montant */}
              <div style={{ padding: '18px 20px', background: 'linear-gradient(145deg,#0f1011,#2a2c2d)', borderRadius: 14, color: '#fff', marginBottom: 20 }}>
                <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Montant proposé</div>
                <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: '-1.5px', lineHeight: 1 }}>{formatShort(parseBudget(selected.montant))}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 5 }}>Délai : {selected.delai}</div>
              </div>

              {/* Message prestataire */}
              {selected.message && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Message du prestataire</div>
                  <div style={{ fontSize: 13, color: 'var(--tx)', lineHeight: 1.65, padding: '14px 18px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)', borderLeft: '3px solid var(--tx)' }}>"{selected.message}"</div>
                </div>
              )}

              {/* Mémoire technique / Description dûtaillée */}
              {(selected.technique || selected.description) && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Détails techniques</div>
                  <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.65, padding: '14px 18px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)' }}>
                    {selected.technique || selected.description}
                  </div>
                </div>
              )}

              {/* Documents de l'offre — toujours visible */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Documents de l'offre {selected.docs?.length > 0 ? `(${selected.docs.length})` : ''}</div>
                {selected.docs?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {selected.docs.map((d, i) => {
                      const fileUrl = d.url || d.fileUrl || null
                      const openDoc = () => {
                        if (!fileUrl) { showToast && showToast('Fichier non disponible — contactez le prestataire'); return }
                        // Validate URL scheme before opening (security)
                        try { const u = new URL(fileUrl); if (!['https:', 'http:', 'data:'].includes(u.protocol) && !fileUrl.startsWith('data:')) { showToast && showToast('URL invalide'); return } } catch { /* data: URIs throw, treat as safe */ }
                        window.open(fileUrl, '_blank', 'noopener,noreferrer')
                      }
                      const downloadDoc = () => {
                        if (!fileUrl) { showToast && showToast('Fichier non disponible — contactez le prestataire'); return }
                        const a = document.createElement('a')
                        a.href = fileUrl
                        a.download = d.n || d.name || 'document'
                        a.rel = 'noopener noreferrer'
                        a.target = '_blank'
                        document.body.appendChild(a); a.click(); document.body.removeChild(a)
                      }
                      return (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--surface-1)', borderRadius: 10, border: '1px solid var(--border-card)' }}>
                        <div style={{ width: 30, height: 30, borderRadius: 7, background: fileUrl ? 'rgba(59,130,246,.08)' : 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: fileUrl ? '#3B82F6' : 'var(--t2)', flexShrink: 0 }}>{(d.type || 'PDF').toUpperCase()}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 500 }}>{d.n || d.name || 'Document'}</div>
                          <div style={{ fontSize: 10, color: 'var(--t4)' }}>{d.size || (fileUrl ? 'Disponible' : 'Non disponible')}</div>
                        </div>
                        {fileUrl ? (
                          <>
                            <button className="btn btn-sm" style={{ fontSize: 10, padding: '3px 10px' }} onClick={openDoc}>Voir</button>
                            <button className="btn btn-sm" style={{ fontSize: 10, padding: '3px 10px' }} onClick={downloadDoc} title="Télécharger">↓</button>
                          </>
                        ) : (
                          <span style={{ fontSize: 10, color: 'var(--t4)', fontStyle: 'italic', whiteSpace: 'nowrap' }}>Non disponible</span>
                        )}
                      </div>
                      )
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '16px 18px', background: 'var(--surface-1)', borderRadius: 12, border: '1px dashed var(--border-card)', textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: 'var(--t4)' }}>Aucun document fourni avec cette offre</div>
                    <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 4 }}>Vous pouvez demander des pièces complémentaires au prestataire</div>
                  </div>
                )}
              </div>

              {/* Profil du prestataire — toujours visible pour le client */}
              {isClient ? (
                  // Profil complet — visible dès la réception de l'offre
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Profil du prestataire</div>
                    <div style={{ padding: '16px 18px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)' }}>
                      {(() => {
                        const s = selected.supplier
                        const ob = s?.onboardingData || {}
                        const ville = ob.ville || s?.company || ''
                        const metier = selected.lot || ob.secteurs?.[0] || ''
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{ob.entreprise || s?.company || selected.entreprise}</div>
                                {metier && <div style={{ fontSize: 11, color: 'var(--t3)' }}>{metier}{ville ? ' à ' + ville : ''}</div>}
                              </div>
                              {ob.rccm && <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'rgba(52,199,89,.08)', color: 'var(--ok)' }}>Vérifié</span>}
                            </div>
                            {ob.bio && <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.6 }}>{ob.bio}</div>}
                            {ob.services?.length > 0 && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                                {ob.services.slice(0, 4).map((sv, i) => <span key={i} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'var(--s2)', color: 'var(--t3)' }}>{sv}</span>)}
                              </div>
                            )}
                            {(ob.email || ob.tel) && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {ob.email && <div style={{ fontSize: 11, color: 'var(--t3)' }}>“é {ob.email}</div>}
                                {ob.tel && <div style={{ fontSize: 11, color: 'var(--t3)' }}>“é {ob.tel}</div>}
                              </div>
                            )}
                            {s?.publicId && (
                              <button className="btn btn-sm" style={{ alignSelf: 'flex-start', fontSize: 11, padding: '6px 14px' }}
                                onClick={() => window.open('/pro/' + (s.slug || s.publicId), '_blank')}>Voir le profil →</button>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  </div>
              ) : (
                // Vue pro : affiche les infos du client si l'offre est acceptée
                selected.statut === OFFER_STATUS.ACCEPTED && selected.aoOwner ? (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Informations du client</div>
                    <div style={{ padding: '16px 18px', background: 'rgba(52,199,89,.04)', borderRadius: 12, border: '1px solid rgba(52,199,89,.15)' }}>
                      {(() => {
                        const owner = selected.aoOwner
                        const ob = owner?.onboardingData || {}
                        const initials = (ob.prenom || owner.name || '?')[0].toUpperCase()
                        return (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                              <div style={{ width: 42, height: 42, borderRadius: 10, background: 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: '#fff', flexShrink: 0 }}>{initials}</div>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 600 }}>{ob.prenom ? ob.prenom + ' ' + (ob.nom || '') : owner.company || owner.name}</div>
                                {ob.ville && <div style={{ fontSize: 11, color: 'var(--t3)' }}>{ob.ville}</div>}
                              </div>
                            </div>
                            {(ob.email || ob.tel) && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                {ob.email && <div style={{ fontSize: 11, color: 'var(--t3)' }}>“é {ob.email}</div>}
                                {ob.tel && <div style={{ fontSize: 11, color: 'var(--t3)' }}>“é {ob.tel}</div>}
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  </div>
                ) : null
              )}

              {/* Appel d'offres lié */}
              {selected.aoId && (() => {
                const ao = (store.aos || []).find(a => a.id === selected.aoId)
                if (!ao) return null
                return (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Appel d'offres lié</div>
                    <div style={{ padding: '12px 16px', background: 'var(--surface-1)', borderRadius: 10, border: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ao.title || ao.titre}</div>
                        <div style={{ fontSize: 10, color: 'var(--t4)' }}>{ao.lot || ao.requestedTrade || ''}{ao.budget ? ' à ' + ao.budget : ''}</div>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: ao.status === 'open' ? 'rgba(52,199,89,.08)' : ao.status === 'attributed' ? 'rgba(59,130,246,.08)' : ao.status === 'cancelled_by_owner' ? 'rgba(245,158,11,.08)' : 'rgba(107,114,128,.08)', color: ao.status === 'open' ? 'var(--ok)' : ao.status === 'attributed' ? '#3B82F6' : ao.status === 'cancelled_by_owner' ? 'var(--wrn)' : 'var(--t4)' }}>{ao.status === 'open' ? 'Ouvert' : ao.status === 'attributed' ? 'Attribué' : ao.status === 'cancelled_by_owner' ? 'Annulé' : ao.status === 'archived' ? 'Archivé' : 'Clôturé'}</span>
                    </div>
                  </div>
                )
              })()}

              {/* Analyse KAI */}
              {selected.note && (
                <div style={{ marginBottom: 20, padding: '16px 18px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)', borderLeft: '3px solid var(--tx)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: 10, fontWeight: 600, color: '#7C3AED' }}>K</span></div>
                    <span style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)' }}>Analyse <span style={{ color: '#7C3AED' }}>KAI</span></span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.65 }}>{selected.note}</div>
                </div>
              )}

              {/* Boutons dûcision — uniquement pour le propriétaire de l'AO (client/pro qui a publié) */}
              {isClient ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  {selected.statut === OFFER_STATUS.PENDING && (
                    <button className="btn" style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', background: 'var(--surface-1)', color: 'var(--err)', border: '1px solid rgba(220,38,38,.15)', fontWeight: 600 }} onClick={() => decide(selected.id, 'refusee')}>Refuser</button>
                  )}
                  {selected.statut === OFFER_STATUS.PENDING && (
                    <button className="btn" style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--surface-1)', color: 'var(--t2)', border: '1px solid var(--border-card)', fontWeight: 500, fontSize: 12 }} onClick={() => { setInfoModal(selected); setInfoMessage('') }}>Demander info</button>
                  )}
                  {selected.statut !== OFFER_STATUS.ACCEPTED && (
                    <button className="btn btn-primary" style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', fontWeight: 600, fontSize: 13 }} onClick={() => decide(selected.id, 'acceptee')}>Accepter l'offre</button>
                  )}
                </div>
              ) : (
                // Vue pro — statut de l'offre envoyée
                <div style={{ padding: '14px 18px', borderRadius: 12, background: selected.statut === OFFER_STATUS.ACCEPTED ? 'rgba(52,199,89,.06)' : selected.statut === OFFER_STATUS.REJECTED ? 'rgba(220,38,38,.05)' : 'rgba(0,0,0,.03)', border: '1px solid', borderColor: selected.statut === OFFER_STATUS.ACCEPTED ? 'rgba(52,199,89,.15)' : selected.statut === OFFER_STATUS.REJECTED ? 'rgba(220,38,38,.1)' : 'var(--border-card)', display: 'flex', alignItems: 'center', gap: 10 }}>
                  {selected.statut === OFFER_STATUS.ACCEPTED
                    ? <><CheckCircle2 size={16} color="var(--ok)" /><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ok)' }}>Offre acceptée — vous avez obtenu ce marché !</span></>
                    : selected.statut === OFFER_STATUS.REJECTED
                    ? <><XCircle size={16} color="var(--err)" /><span style={{ fontSize: 13, fontWeight: 600, color: 'var(--err)' }}>Offre non retenue</span></>
                    : <><Clock size={16} color="var(--t4)" /><span style={{ fontSize: 13, fontWeight: 500, color: 'var(--t3)' }}>En attente de dûcision du client</span></>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      )} {/* fin mainTab === 'offres' */}

      {/* Modale "Demander plus d'infos" */}      {infoModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setInfoModal(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 480, boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Demander des informations</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 4 }}>à {infoModal.entreprise} — concernant l'offre {formatShort(parseBudget(infoModal.montant))}</div>
            </div>
            <div style={{ padding: '18px 22px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t4)', marginBottom: 6 }}>Votre message</div>
              <textarea
                value={infoMessage}
                onChange={e => setInfoMessage(e.target.value)}
                placeholder="Bonjour, j'aurais besoin de précisions concernant..."
                style={{ width: '100%', minHeight: 120, padding: '12px 14px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f)', resize: 'vertical', outline: 'none', color: 'var(--tx)', background: 'var(--s2)' }}
              />
              <div style={{ fontSize: 10, color: 'var(--t4)', marginTop: 6 }}>Ce message sera envoyé au professionnel et ouvrira une conversation liée à cette offre.</div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-sm" onClick={() => setInfoModal(null)}>Annuler</button>
              <button className="btn btn-primary btn-sm" disabled={!infoMessage.trim()} style={{ opacity: infoMessage.trim() ? 1 : .5 }} onClick={async () => {
                const ao = (store.aos || []).find(a => a.id === infoModal.aoId)
                const supplierId = infoModal.supplierId || infoModal.userId

                // Guard: cannot send a message to yourself
                if (supplierId === store.user?.id) {
                  showToast && showToast('Vous ne pouvez pas vous envoyer un message à vous-même')
                  setInfoModal(null)
                  return
                }

                // Try to create a real backend conversation with the supplier
                if (supplierId && store._token && !String(supplierId).startsWith('u_')) {
                  try {
                    const { conversation } = await api.conversations.create({
                      participantId: supplierId,
                      aoId: infoModal.aoId || null,
                      offerId: infoModal.id || null,
                    })
                    // Add to store if not present
                    updateStore(prev => {
                      const ids = new Set((prev.conversations || []).map(x => x.id))
                      if (ids.has(conversation.id)) return prev
                      return { ...prev, conversations: [conversation, ...(prev.conversations || [])] }
                    })
                    // Join the room then send the first message via WebSocket
                    const socket = getSocket(store._token)
                    socket.emit('conversation:join', conversation.id)
                    sendSocketMessage(
                      { conversationId: conversation.id, text: infoMessage.trim(), type: 'text' },
                      (ack) => {
                        if (ack?.error) showToast && showToast('Erreur envoi: ' + ack.error)
                      }
                    )
                    showToast && showToast('Message envoyé à ' + infoModal.entreprise)
                    setInfoModal(null)
                    setInfoMessage('')
                    // Navigate to messaging
                    if (onNavigate) onNavigate('messages')
                    else window.dispatchEvent(new CustomEvent('meereo-navigate', { detail: 'messages' }))
                    return
                  } catch (e) {
                    console.warn('[infoModal]', e.message)
                    // fallthrough to local conversation
                  }
                }

                // Fallback: local conversation
                const conv = {
                  id: 'conv_info_' + Date.now(),
                  projectId: ao?.projectId || null,
                  aoId: infoModal.aoId || null,
                  offerId: infoModal.id,
                  participants: [store.user?.id, supplierId].filter(Boolean),
                  title: (ao?.title || 'Offre') + ' — Demande d\'informations',
                  nom: infoModal.entreprise,
                  lastMessage: { text: infoMessage },
                  lastAt: new Date().toISOString(),
                  unread: 0,
                  msgs: [{ side: 'out', text: infoMessage, time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }],
                }
                updateStore(prev => ({ ...prev, conversations: [...(prev.conversations || []), conv] }))
                emitEvent('info_requested', { offerId: infoModal.id, company: infoModal.entreprise, message: infoMessage }, {
                  notifMsg: 'Demande d\'information envoyée à ' + infoModal.entreprise,
                  toast: 'Message envoyé à ' + infoModal.entreprise,
                })
                setInfoModal(null)
                setInfoMessage('')
              }}>Envoyer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// é─── Composant carte contrat ──────────────────────────────────────────────────
function ContratCard({ offer: o, formatShort, parseBudget, INTERVENANTS_DATA, archived }) {
  const inter = INTERVENANTS_DATA.find(i => i.nom === o.entreprise)
  const av = getOfferAvatar(o)
  return (
    <div style={{ padding: '18px 20px', background: archived ? 'var(--s2)' : 'var(--surface-1)', border: '1px solid', borderColor: archived ? 'var(--border)' : 'rgba(52,199,89,.15)', borderRadius: 14, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{ width: 46, height: 46, borderRadius: 12, background: av?.type === 'color' ? av.value : 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: av?.type === 'color' ? '#fff' : 'var(--t3)', flexShrink: 0, overflow: 'hidden' }}>
        {av?.type === 'img' ? <img src={av.value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (av?.initials || (o.entreprise || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase())}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.2px' }}>{o.entreprise}</span>
          {archived && <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: 'var(--s2)', color: 'var(--t4)' }}>Archivé</span>}
          {!archived && <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'rgba(52,199,89,.1)', color: 'var(--ok)' }}>Contrat actif</span>}
          {inter?.verified && <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: 'rgba(52,199,89,.08)', color: 'var(--ok)' }}>Vérifié</span>}
        </div>
        <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 8 }}>
          {o.lot && <span>{o.lot}</span>}
          {o.projet && <span> à {o.projet}</span>}
          {o.soumis && <span style={{ color: 'var(--t4)' }}> à Soumis le {o.soumis}</span>}
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Montant</div>
            <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-1px' }}>{formatShort(parseBudget(o.montant))}</div>
          </div>
          {o.delai && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Délai</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{o.delai}</div>
            </div>
          )}
          {inter && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Note</div>
              <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                {Array.from({length: 5}, (_, i) => <Star key={i} size={11} fill={i < Math.round(inter.note || 0) ? '#F59E0B' : 'none'} color="#F59E0B" strokeWidth={1.5}/>)}
                <span style={{ fontSize: 11, fontWeight: 600, marginLeft: 3 }}>{inter.note || '—'}</span>
              </div>
            </div>
          )}
        </div>
        {o.message && <div style={{ marginTop: 10, fontSize: 12, color: 'var(--t2)', fontStyle: 'italic', lineHeight: 1.5, borderLeft: '2px solid var(--border)', paddingLeft: 10 }}>"{o.message}"</div>}
      </div>
    </div>
  )
}

