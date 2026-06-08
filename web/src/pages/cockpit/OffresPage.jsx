import { useState, useMemo } from 'react'
import { ClipboardList, Clock, CheckCircle2, XCircle, Star } from 'lucide-react'
import { getEntrepriseAvatar } from '../../data/avatars'
import { useDevise } from '../../hooks/useDevise'
import { useMeereo } from '../../hooks/useMeereoStore'
import { useMergedData } from '../../hooks/useMergedData'
import { api } from '../../services/api/client'
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

export default function OffresPage({ showToast, openModal }) {
  const { formatShort, parseBudget } = useDevise()
  const { store, acceptOffer, rejectOffer, updateStore, emitEvent } = useMeereo()
  const { offers: rawOffres, STATIC: { INTERVENANTS_DATA } } = useMergedData()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [infoModal, setInfoModal] = useState(null) // offer object for "Demander info"
  const [infoMessage, setInfoMessage] = useState('')

  // Client context: show only offers linked to client's own AOs
  // Pro context: show all offers (they see offers they received or submitted)
  const isClient = store.user?.type === 'client'
  const userId = store.user?.id
  const myAOIds = useMemo(() => {
    if (!isClient) return null // Pro sees all
    return new Set((store.aos || []).filter(a => a.ownerUserId === userId).map(a => a.id))
  }, [isClient, store.aos, userId])

  const allOffres = useMemo(() => {
    if (!isClient || !myAOIds) return rawOffres
    return rawOffres.filter(o => myAOIds.has(o.aoId))
  }, [rawOffres, isClient, myAOIds])

  const total = allOffres.length
  const attente = allOffres.filter(o => o.statut === OFFER_STATUS.PENDING).length
  const acceptees = allOffres.filter(o => o.statut === OFFER_STATUS.ACCEPTED).length
  const refusees = allOffres.filter(o => o.statut === OFFER_STATUS.REJECTED).length

  const filtered = allOffres.filter(o => {
    const statOk = filter === 'all' || o.statut === filter
    const q = search.toLowerCase()
    return statOk && (!q || (o.titre + o.entreprise + o.projet + o.lot).toLowerCase().includes(q))
  })

  const selected = selectedId ? allOffres.find(o => o.id === selectedId) : filtered[0]

  const decide = (id, decision) => {
    const normalized = normalizeOfferStatus(decision)
    if (normalized === OFFER_STATUS.ACCEPTED) {
      acceptOffer(id) // Store handles: market creation, auto-membership, tasks, events, notifications
    } else if (normalized === OFFER_STATUS.REJECTED) {
      rejectOffer(id)
    } else {
      // Reset to pending (undo decision)
      updateStore(prev => ({ ...prev, offerStatuts: { ...(prev.offerStatuts || {}), [id]: decision } }))
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flexShrink: 0 }}>
        <DSPageHeader title="Offres reçues" subtitle={`${total} offres · ${attente} en attente de décision`}>
          <button className="btn btn-sm" onClick={() => { exportCSV(allOffres.map(o => ({ entreprise: o.entreprise, lot: o.lot, montant: o.montant, statut: o.statut, delai: o.delai, soumis: o.soumis })), 'offres_meereo'); showToast && showToast('Export téléchargé') }}>Exporter</button>
          <button className="btn btn-primary btn-sm" onClick={() => openModal('newOffre')}>+ Nouvelle offre</button>
        </DSPageHeader>

        <DSKpiStrip items={[
          { icon: <ClipboardList size={14}/>, iconBg: 'rgba(0,0,0,.04)', value: total, label: 'Total' },
          { icon: <Clock size={14}/>, iconBg: 'rgba(255,149,0,.06)', value: attente, label: 'En attente' },
          { icon: <CheckCircle2 size={14} color="var(--ok)"/>, iconBg: 'rgba(52,199,89,.06)', value: acceptees, label: 'Acceptées' },
          { icon: <XCircle size={14} color="var(--err)"/>, iconBg: 'rgba(220,38,38,.05)', value: refusees, label: 'Refusées' },
        ]} />
      </div>

      <div className="split" style={{ marginTop: 0, flex: 1, overflow: 'hidden' }}>
        {/* Liste */}
        <div className="split-left">
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <DSSearchBar value={search} onChange={setSearch} placeholder="Rechercher une offre..." />
            <DSFilterBar filters={FILTERS} active={filter} onChange={setFilter} />
          </div>
          {filtered.map(o => (
            <div key={o.id} className="list-item" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', borderBottom: '1px solid var(--border)', cursor: 'pointer', background: selected?.id === o.id ? 'var(--s2)' : undefined }} onClick={() => setSelectedId(o.id)}>
              {(() => { const av = getEntrepriseAvatar(o.entreprise); return (
                <div style={{ width: 40, height: 40, borderRadius: 10, background: av?.type === 'color' ? av.value : av?.type === 'img' ? 'var(--s2)' : o.color + '14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: av?.type === 'color' ? '#fff' : o.color, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                  {av?.type === 'img' ? <img src={av.value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (av?.initials || (o.entreprise || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase())}
                  {o.lu === false && <div style={{ position: 'absolute', top: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: 'var(--tx)', border: '2px solid var(--surface-1)' }} />}
                </div>
              )})()}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: o.lu === false ? 800 : 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-.2px' }}>{o.entreprise}</div>
                <div style={{ fontSize: 11, color: o.lu === false ? 'var(--tx)' : 'var(--t3)', fontWeight: o.lu === false ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.lot} · {formatShort(parseBudget(o.montant))}</div>
              </div>
              <DSStatusBadge status={o.statut} />
            </div>
          ))}
          {filtered.length === 0 && (
            <DSEmptyState icon={<ClipboardList size={24}/>} title="Aucune offre trouvée" description="Modifiez vos filtres ou enregistrez une nouvelle offre." />
          )}
        </div>

        {/* Detail */}
        <div className="split-right">
          {!selected ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <DSEmptyState icon={<ClipboardList size={24}/>} title="Sélectionnez une offre" description="Choisissez une offre dans la liste pour voir le détail et décider." />
            </div>
          ) : (
            <div>
              {/* Bannière statut si décision prise */}
              {selected.statut !== OFFER_STATUS.PENDING && (
                <div style={{ padding: '12px 18px', marginBottom: 20, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', ...(selected.statut === OFFER_STATUS.ACCEPTED ? { background: 'rgba(52,199,89,.06)', border: '1px solid rgba(52,199,89,.12)' } : { background: 'rgba(220,38,38,.05)', border: '1px solid rgba(220,38,38,.1)' }) }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: selected.statut === OFFER_STATUS.ACCEPTED ? 'var(--ok)' : 'var(--err)' }} />
                    <span style={{ fontSize: 13, fontWeight: 600 }}>Offre {getStatusLabel(selected.statut).toLowerCase()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm" style={{ fontSize: 10 }} onClick={() => decide(selected.id, 'en_attente')}>Annuler</button>
                    {selected.statut === OFFER_STATUS.REJECTED && (
                      <button className="btn btn-sm" style={{ fontSize: 10, color: 'var(--err)', background: 'rgba(220,38,38,.06)', border: '1px solid rgba(220,38,38,.12)' }} onClick={() => {
                        updateStore(prev => ({ ...prev, offers: (prev.offers || []).filter(o => o.id !== selected.id) }))
                        setSelectedId(null)
                        showToast && showToast('Offre supprimée')
                      }}>Supprimer</button>
                    )}
                  </div>
                </div>
              )}

              {/* En-tête entreprise */}
              {(() => { const av = getEntrepriseAvatar(selected.entreprise); return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: av?.type === 'color' ? av.value : av?.type === 'img' ? 'var(--s2)' : 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
                  {av?.type === 'img' ? <img src={av.value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (av?.initials || (selected.entreprise || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase())}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.3px' }}>{selected.entreprise}</span>
                    {selected.supplierRole && <span style={getRoleBadgeStyle(selected.supplierRole)}>{getRoleLabel(selected.supplierRole)}</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--t3)' }}>{selected.nbRef || 0} projets · {(selected.certifs || []).join(' · ') || 'Aucune certification'}</div>
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
                      <div style={{ fontSize: 14, fontWeight: 800 }}>{note > 0 ? note + '/5' : '—'}</div>
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
                <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1 }}>{formatShort(parseBudget(selected.montant))}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 5 }}>Délai : {selected.delai}</div>
              </div>

              {/* Message prestataire */}
              {selected.message && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Message du prestataire</div>
                  <div style={{ fontSize: 13, color: 'var(--tx)', lineHeight: 1.65, padding: '14px 18px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)', borderLeft: '3px solid var(--tx)' }}>"{selected.message}"</div>
                </div>
              )}

              {/* Mémoire technique / Description détaillée */}
              {(selected.technique || selected.description) && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Détails techniques</div>
                  <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.65, padding: '14px 18px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)' }}>
                    {selected.technique || selected.description}
                  </div>
                </div>
              )}

              {/* Documents de l'offre — toujours visible */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Documents de l'offre {selected.docs?.length > 0 ? `(${selected.docs.length})` : ''}</div>
                {selected.docs?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {selected.docs.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--surface-1)', borderRadius: 10, border: '1px solid var(--border-card)' }}>
                        <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: 'var(--t2)', flexShrink: 0 }}>{(d.type || 'PDF').toUpperCase()}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 500 }}>{d.n || d.name || 'Document'}</div>
                          {d.size && <div style={{ fontSize: 10, color: 'var(--t4)' }}>{d.size}</div>}
                        </div>
                        <button className="btn btn-sm" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => showToast && showToast('Ouverture...')}>Voir</button>
                        <button className="btn btn-sm" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => showToast && showToast('Téléchargement...')}>Télécharger</button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '16px 18px', background: 'var(--surface-1)', borderRadius: 12, border: '1px dashed var(--border-card)', textAlign: 'center' }}>
                    <div style={{ fontSize: 12, color: 'var(--t4)' }}>Aucun document fourni avec cette offre</div>
                    <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 4 }}>Vous pouvez demander des pièces complémentaires au prestataire</div>
                  </div>
                )}
              </div>

              {/* Profil du professionnel */}
              {(() => {
                const inter = INTERVENANTS_DATA.find(i => i.nom === selected.entreprise)
                const ob = store.onboardingData || {}
                // Try to find supplier in store.users
                const supplierUser = (store.users || []).find(u => u.id === (selected.userId || selected.supplierId))
                const ville = inter?.ville || supplierUser?.ville || ''
                const metier = selected.lot || inter?.role || ''
                return (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Profil du professionnel</div>
                    <div style={{ padding: '16px 18px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{selected.entreprise}</div>
                            {metier && <div style={{ fontSize: 11, color: 'var(--t3)' }}>{metier}{ville ? ' · ' + ville : ''}</div>}
                          </div>
                          {inter?.verified && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(52,199,89,.08)', color: 'var(--ok)' }}>Vérifié</span>}
                        </div>
                        <div className="rg-3" style={{ gap: 8 }}>
                          <div style={{ padding: '8px 10px', background: 'var(--s2)', borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ fontSize: 14, fontWeight: 800 }}>{inter?.projets || selected.nbRef || 0}</div>
                            <div style={{ fontSize: 9, color: 'var(--t4)', fontWeight: 600 }}>Projets</div>
                          </div>
                          <div style={{ padding: '8px 10px', background: 'var(--s2)', borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ fontSize: 14, fontWeight: 800 }}>{inter?.note ? inter.note + '/5' : '—'}</div>
                            <div style={{ fontSize: 9, color: 'var(--t4)', fontWeight: 600 }}>Note</div>
                          </div>
                          <div style={{ padding: '8px 10px', background: 'var(--s2)', borderRadius: 8, textAlign: 'center' }}>
                            <div style={{ fontSize: 14, fontWeight: 800 }}>{inter?.nbAvis || 0}</div>
                            <div style={{ fontSize: 9, color: 'var(--t4)', fontWeight: 600 }}>Avis</div>
                          </div>
                        </div>
                        {(selected.certifs?.length > 0 || inter?.specialite) && (
                          <div style={{ fontSize: 11, color: 'var(--t3)' }}>
                            {inter?.specialite && <span>{inter.specialite}</span>}
                            {selected.certifs?.length > 0 && <span> · {selected.certifs.join(', ')}</span>}
                          </div>
                        )}
                        <button className="btn btn-sm" style={{ alignSelf: 'flex-start', fontSize: 11, padding: '6px 14px' }} onClick={() => {
                          // Navigate to pro profile if available
                          if (selected.userId || selected.supplierId) {
                            window.dispatchEvent(new CustomEvent('meereo-navigate', { detail: 'fournisseurs' }))
                          }
                          showToast && showToast('Ouverture du profil...')
                        }}>Voir le profil professionnel →</button>
                      </div>
                    </div>
                  </div>
                )
              })()}

              {/* Appel d'offres lié */}
              {selected.aoId && (() => {
                const ao = (store.aos || []).find(a => a.id === selected.aoId)
                if (!ao) return null
                return (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Appel d'offres lié</div>
                    <div style={{ padding: '12px 16px', background: 'var(--surface-1)', borderRadius: 10, border: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ao.title || ao.titre}</div>
                        <div style={{ fontSize: 10, color: 'var(--t4)' }}>{ao.lot || ao.requestedTrade || ''}{ao.budget ? ' · ' + ao.budget : ''}</div>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: ao.status === 'open' ? 'rgba(52,199,89,.08)' : ao.status === 'attributed' ? 'rgba(59,130,246,.08)' : ao.status === 'cancelled_by_owner' ? 'rgba(245,158,11,.08)' : 'rgba(107,114,128,.08)', color: ao.status === 'open' ? 'var(--ok)' : ao.status === 'attributed' ? '#3B82F6' : ao.status === 'cancelled_by_owner' ? 'var(--wrn)' : 'var(--t4)' }}>{ao.status === 'open' ? 'Ouvert' : ao.status === 'attributed' ? 'Attribué' : ao.status === 'cancelled_by_owner' ? 'Annulé' : ao.status === 'archived' ? 'Archivé' : 'Clôturé'}</span>
                    </div>
                  </div>
                )
              })()}

              {/* Analyse KAI */}
              {selected.note && (
                <div style={{ marginBottom: 20, padding: '16px 18px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)', borderLeft: '3px solid var(--tx)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: 10, fontWeight: 800, color: '#7C3AED' }}>K</span></div>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)' }}>Analyse <span style={{ color: '#7C3AED' }}>KAI</span></span>
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.65 }}>{selected.note}</div>
                </div>
              )}

              {/* Boutons décision */}
              <div style={{ display: 'flex', gap: 8 }}>
                {selected.statut !== OFFER_STATUS.REJECTED && (
                  <button className="btn" style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', background: 'var(--surface-1)', color: 'var(--err)', border: '1px solid rgba(220,38,38,.15)', fontWeight: 600 }} onClick={() => decide(selected.id, 'refusee')}>Refuser</button>
                )}
                {selected.statut === OFFER_STATUS.PENDING && (
                  <button className="btn" style={{ padding: '12px 16px', borderRadius: '10px', background: 'var(--surface-1)', color: 'var(--t2)', border: '1px solid var(--border-card)', fontWeight: 500, fontSize: 12 }} onClick={() => {
                    setInfoModal(selected)
                    setInfoMessage('')
                  }}>Demander info</button>
                )}
                {selected.statut !== OFFER_STATUS.ACCEPTED && (
                  <button className="btn btn-primary" style={{ flex: 1, padding: '12px 16px', borderRadius: '10px', fontWeight: 700, fontSize: 13 }} onClick={() => decide(selected.id, 'acceptee')}>Accepter l'offre</button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Modale "Demander plus d'infos" ═══ */}
      {infoModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setInfoModal(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 480, boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 16, fontWeight: 700 }}>Demander des informations</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 4 }}>À {infoModal.entreprise} — concernant l'offre {formatShort(parseBudget(infoModal.montant))}</div>
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
              <button className="btn btn-primary btn-sm" disabled={!infoMessage.trim()} style={{ opacity: infoMessage.trim() ? 1 : .5 }} onClick={() => {
                // Create contextual conversation linked to AO + offer
                const ao = (store.aos || []).find(a => a.id === infoModal.aoId)
                const conv = {
                  id: 'conv_info_' + Date.now(),
                  projectId: ao?.projectId || null,
                  aoId: infoModal.aoId || null,
                  offerId: infoModal.id,
                  participants: [store.user?.id, infoModal.userId || infoModal.supplierId].filter(Boolean),
                  title: (ao?.title || 'Offre') + ' — Demande d\'informations',
                  nom: infoModal.entreprise,
                  lastMessage: infoMessage,
                  lastAt: new Date().toISOString(),
                  unread: 0,
                  msgs: [{ side: 'out', text: infoMessage, time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) }],
                }
                updateStore(prev => ({
                  ...prev,
                  conversations: [...(prev.conversations || []), conv],
                }))
                // Sync message to backend
                api.messages.create({ contenu: infoMessage, conversationId: conv.id, userId: store.user?.id }).catch(() => {})
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
