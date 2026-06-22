import { useState, useEffect } from 'react'
import Modal from '../../components/shared/Modal'
import MoneyInput from '../../components/shared/MoneyInput'
import { createPortal } from 'react-dom'
import { getEntrepriseAvatar } from '../../data/avatars'
import { useDevise } from '../../hooks/useDevise'
import { exportCSV } from '../../utils/export'
import { useMeereo } from '../../hooks/useMeereoStore'
import { useMergedData } from '../../hooks/useMergedData'
import { api } from '../../services/api/client'
import PaymentBadge from '../../components/shared/PaymentBadge'
import { recommendRail, RAIL_META, RAILS, PAY_STATUS, calculateCommission } from '../../domain/fintech'
import { MARKET_STATUS, getStatusLabel, PHASE_LABELS, normalizePhase } from '../../domain/status'
import { DSPageHeader, DSKpiStrip, DSFilterBar, DSEmptyState } from '../../design/components'
import { formatDateFR } from '../../utils/helpers'
import { Star, Building2, CreditCard, Smartphone } from 'lucide-react'

const RAIL_ICONS = {
  [RAILS.VIREMENT]: Building2,
  [RAILS.CARTE]: CreditCard,
  [RAILS.MOBILE_MONEY]: Smartphone,
}

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: MARKET_STATUS.SIGNED, label: 'Sign�s' },
  { key: MARKET_STATUS.IN_PROGRESS, label: 'En cours' },
  { key: MARKET_STATUS.COMPLETED, label: 'Livr�s' },
]

const getProjetImg = (nom, store) => { const p = (store.projects || []).find(x => x.nom === nom); return p?.img || null }


const ErrMsg = ({ show }) => show
  ? <p style={{ color: 'var(--err)', fontSize: 11, marginTop: 4, fontWeight: 500 }}>Champ obligatoire</p>
  : null

function ContractModal({ isOpen, onClose, showToast }) {
  const { store, updateStore, emitEvent } = useMeereo()
  const [f, setF] = useState({ objet: '', entreprise: '', montant: '', lot: '', projet: '' })
  const [submitted, setSubmitted] = useState(false)
  const submit = () => {
    setSubmitted(true)
    if (!f.objet.trim()) return
    updateStore(prev => ({ ...prev, markets: [...(prev.markets || []), { id: 'mkt_' + Date.now(), objet: f.objet, entreprise: f.entreprise, montant: parseFloat(f.montant) || 0, lot: f.lot, projectId: f.projet, statut: 'en_cours', createdAt: new Date().toISOString() }] }))
    emitEvent('market_signed', { company: f.entreprise }, { notifMsg: `March� sign� avec ${f.entreprise}`, notifType: 'green' })
    showToast('March� cr��')
    setF({ objet: '', entreprise: '', montant: '', lot: '', projet: '' }); setSubmitted(false); onClose()
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau march�" footer={<><button className="btn btn-sm" onClick={onClose}>Annuler</button><button className="btn btn-primary btn-sm" onClick={submit}>Enregistrer</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label className="form-label">Objet du march� *</label><input className="form-input" placeholder="Titre..." value={f.objet} onChange={e => setF(p => ({ ...p, objet: e.target.value }))} /><ErrMsg show={submitted && !f.objet.trim()} /></div>
        <div><label className="form-label">Entreprise attributaire</label><input className="form-input" placeholder="Nom..." value={f.entreprise} onChange={e => setF(p => ({ ...p, entreprise: e.target.value }))} /></div>
        <div className="form-row">
          <div><label className="form-label">Montant (FCFA)</label><MoneyInput value={f.montant} onChange={v => setF(p => ({ ...p, montant: v }))} placeholder="45 000 000" /></div>
          <div><label className="form-label">Lot</label><input className="form-input" placeholder="Gros Oeuvre" value={f.lot} onChange={e => setF(p => ({ ...p, lot: e.target.value }))} /></div>
        </div>
        <div><label className="form-label">Projet</label><select className="form-input" value={f.projet} onChange={e => setF(p => ({ ...p, projet: e.target.value }))}><option value="">Choisir</option>{(store.projects || []).map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}</select></div>
      </div>
    </Modal>
  )
}

export default function Contracts({ showToast, onNavigate, openModal }) {
  const { formatShort, parseBudget } = useDevise()
  const { store, updateStore, createPaymentOrder, updatePaymentStatus, openDispute, uploadProof } = useMeereo()
  const { markets: allMarches, STATIC: { INTERVENANTS_DATA } } = useMergedData()
  const [filter, setFilter] = useState('all')
  const [detail, setDetail] = useState(null)
  const [showCreateContract, setShowCreateContract] = useState(false)

  // Rafra�chir les march�s au montage (permet au pro de voir un march�
  // cr�� par le client depuis l'acceptation d'une offre)
  useEffect(() => {
    api.markets.getAll()
      .then(markets => {
        if (Array.isArray(markets) && markets.length > 0) {
          updateStore(prev => ({ ...prev, markets }))
        }
      })
      .catch(() => {})
  }, [])

  const total = allMarches.length
  const signes = allMarches.filter(m => m.statut === MARKET_STATUS.SIGNED).length
  const enCours = allMarches.filter(m => m.statut === MARKET_STATUS.IN_PROGRESS).length
  const livres = allMarches.filter(m => m.statut === MARKET_STATUS.COMPLETED).length
  const filtered = allMarches.filter(m => filter === 'all' || m.statut === filter)

  // Pipeline grouped by status
  const pipeline = {
    [MARKET_STATUS.SIGNED]: filtered.filter(m => m.statut === MARKET_STATUS.SIGNED),
    [MARKET_STATUS.IN_PROGRESS]: filtered.filter(m => m.statut === MARKET_STATUS.IN_PROGRESS),
    [MARKET_STATUS.COMPLETED]: filtered.filter(m => m.statut === MARKET_STATUS.COMPLETED),
  }

  const MarcheCard = ({ m }) => {
    const initials = m.entreprise.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
    const inter = INTERVENANTS_DATA.find(i => i.nom === m.entreprise)
    return (
      <div className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setDetail(m)}>
        {getProjetImg(m.projet, store) && (
          <div style={{ height: 80, position: 'relative', overflow: 'hidden' }}>
            <img src={getProjetImg(m.projet, store)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(transparent 40%, rgba(0,0,0,.6))' }} />
            <div style={{ position: 'absolute', bottom: 6, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: '#fff' }}>{m.projet}</span>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>{m.avancement}%</span>
            </div>
          </div>
        )}
        <div style={{ padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            {(() => { const av = getEntrepriseAvatar(m.entreprise); return (
              <div style={{ width: 36, height: 36, borderRadius: 9, background: av?.type === 'color' ? av.value : av?.type === 'img' ? 'var(--s2)' : 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0, overflow: 'hidden' }}>
                {av?.type === 'img' ? <img src={av.value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
              </div>
            )})()}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.entreprise}</div>
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>{m.lot}</div>
            </div>
            {inter?.note > 0 && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, color: '#F59E0B', fontWeight: 600 }}><Star size={11} fill="#F59E0B" strokeWidth={0}/> {inter.note}</span>}
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-1px', marginBottom: 6 }}>{formatShort(parseBudget(m.montant))}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--t3)' }}>
            <span>{m.delai}</span>
            <span>{formatDateFR(m.dateSig)}</span>
          </div>
          {m.avancement > 0 && m.avancement < 100 && (
            <div style={{ marginTop: 8 }}>
              <div className="prog-track" style={{ height: 3 }}><div className="prog-fill" style={{ width: m.avancement + '%' }} /></div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <DSPageHeader title="March�s" subtitle={`${total} contrats � Pipeline des missions`}>
        <DSFilterBar filters={FILTERS} active={filter} onChange={setFilter} />
        <button className="btn btn-sm" onClick={() => { exportCSV(allMarches.map(m => ({ entreprise: m.entreprise, lot: m.lot, montant: m.montant, statut: m.statut, delai: m.delai, avancement: m.avancement })), 'marches_meereo'); showToast && showToast('Export t�l�charg�') }}>Exporter</button>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateContract(true)}>+ Nouveau march�</button>
      </DSPageHeader>

      {/* Pipeline KPI */}
      <DSKpiStrip hero items={[
        { value: total, label: 'Total', sub: 'contrats' },
        { value: signes, label: 'Sign�s', sub: '� d�marrer' },
        { value: enCours, label: 'En cours', sub: 'Missions actives', color: '#F59E0B' },
        { value: livres, label: 'Livr�s', sub: 'Termin�s', color: 'var(--ok)' },
      ]} />

      {/* Pipeline columns */}
      {filter === 'all' ? (
        <div className="rg-3" style={{ gap: 16 }}>
          {[
            { key: MARKET_STATUS.SIGNED, label: 'Sign�s', color: 'var(--tx)', data: pipeline[MARKET_STATUS.SIGNED] },
            { key: MARKET_STATUS.IN_PROGRESS, label: 'En cours', color: '#F59E0B', data: pipeline[MARKET_STATUS.IN_PROGRESS] },
            { key: MARKET_STATUS.COMPLETED, label: 'Livr�s', color: 'var(--ok)', data: pipeline[MARKET_STATUS.COMPLETED] },
          ].map(col => (
            <div key={col.key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 8, borderBottom: '2px solid ' + col.color }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: col.color }} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{col.label}</span>
                <span style={{ fontSize: 11, color: 'var(--t4)', fontWeight: 600 }}>{col.data.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.data.map(m => <MarcheCard key={m.id} m={m} />)}
                {col.data.length === 0 && <div style={{ padding: '24px 0', textAlign: 'center', fontSize: 11.5, color: 'var(--t4)' }}>Aucun march� dans cette colonne</div>}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rg-3" style={{ gap: 12 }}>
          {filtered.map(m => <MarcheCard key={m.id} m={m} />)}
        </div>
      )}

      {/* Detail modal */}
      {detail && (() => {
        const proj = (store.projects || []).find(p => p.id === detail.projectId)
        const inter = INTERVENANTS_DATA.find(i => i.nom === detail.entreprise)
        const initials = detail.entreprise.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
        return createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setDetail(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 520, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            {/* Hero */}
            <div style={{ padding: '22px 24px 16px', background: 'linear-gradient(145deg,#0f1011,#2a2c2d)', color: '#fff', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {(() => { const av = getEntrepriseAvatar(detail.entreprise); return (
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, flexShrink: 0, overflow: 'hidden' }}>
                      {av?.type === 'img' ? <img src={av.value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                    </div>
                  )})()}
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{detail.entreprise}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>{detail.lot} � {getStatusLabel(detail.statut)}</div>
                  </div>
                </div>
                <button onClick={() => setDetail(null)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'rgba(255,255,255,.6)' }}>�</button>
              </div>
              <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-1.5px', marginBottom: 4 }}>{formatShort(parseBudget(detail.montant))}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>Avancement</span>
                <span style={{ fontSize: 16, fontWeight: 800 }}>{detail.avancement}%</span>
              </div>
              <div style={{ marginTop: 6, height: 4, background: 'rgba(255,255,255,.1)', borderRadius: 100, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#F59E0B', borderRadius: 100, width: detail.avancement + '%' }} />
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.3px' }}>{detail.titre}</div>

              <div className="rg-3" style={{ gap: 8 }}>
                {[['Signature', formatDateFR(detail.dateSig)], ['D�lai', detail.delai], ['�ch�ance', formatDateFR(detail.dateFin)]].map(([l, v]) => (
                  <div key={l} style={{ padding: '10px 12px', background: 'var(--s2)', borderRadius: 8 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 3 }}>{l}</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{v}</div>
                  </div>
                ))}
              </div>

              {proj && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--s2)', borderRadius: 10, cursor: 'pointer' }} onClick={() => { setDetail(null); onNavigate && onNavigate('projets') }}>
                  {proj.img && <img src={proj.img} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{proj.nom}</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)' }}>{proj.client} � {PHASE_LABELS[normalizePhase(proj.phase)] || proj.phase}</div>
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--t4)' }}>Projet �†’</span>
                </div>
              )}

              {inter && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--s2)', borderRadius: 10, cursor: 'pointer' }} onClick={() => { setDetail(null); onNavigate && onNavigate('intervenants') }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--surface-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--t2)', flexShrink: 0 }}>{initials}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 700 }}>{inter.nom}</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)' }}>{inter.role} � {inter.note > 0 ? <><Star size={10} fill="#F59E0B" strokeWidth={0}/> {inter.note}/5</> : 'Pas de note'}</div>
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--t4)' }}>Profil �†’</span>
                </div>
              )}

              {detail.contact && (
                <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--t3)' }}>
                  <span>{detail.contact}</span>
                  {detail.tel && <span>{detail.tel}</span>}
                </div>
              )}
            </div>

            {/* Bloc Fintech */}
            {(() => {
              const amount = parseBudget(detail.montant || '0')
              const po = (store.paymentOrders || []).find(o => o.marketId === detail.id)
              const rec = recommendRail(amount, 'marche')
              const railMeta = RAIL_META[rec.rail]
              const commission = calculateCommission('services', amount)
              return (
                <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Paiement & s�curisation</div>
                  {po ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <PaymentBadge status={po.status} />
                        <span style={{ fontSize: 10, color: 'var(--t4)' }}>R�f. {po.id.slice(-8)}</span>
                      </div>
                      {po.status === PAY_STATUS.CONFIRMED && (
                        <button className="btn btn-sm" style={{ width: '100%', marginTop: 4 }} onClick={() => { updatePaymentStatus(po.id, PAY_STATUS.HELD); showToast && showToast('Fonds s�curis�s pour ce march�') }}>Cantonner pour milestone</button>
                      )}
                      {po.status === PAY_STATUS.HELD && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                          <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => {
                            const proofs = (store.proofDocuments || []).filter(p => p.payoutRequestId === po.id)
                            if (proofs.length === 0) { showToast && showToast('D�posez une preuve avant de demander la lib�ration'); return }
                            updatePaymentStatus(po.id, PAY_STATUS.PAYOUT_REQ); showToast && showToast('Demande de lib�ration envoy�e')
                          }}>Demander la lib�ration</button>
                          <button className="btn btn-sm" style={{ fontSize: 10 }} onClick={() => {
                            const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*,.pdf'
                            input.onchange = async e => { const f = e.target.files[0]; if (!f) return; try { const { uploadFile } = await import('../../utils/upload'); const url = await uploadFile(f, 'proofs', f.name); uploadProof({ paymentOrderId: po.id, type: 'pv_signe', fileUrl: url }); showToast && showToast('Preuve d�pos�e') } catch(err) { const reader = new FileReader(); reader.onload = () => { uploadProof({ paymentOrderId: po.id, type: 'pv_signe', fileUrl: reader.result }); showToast && showToast('Preuve d�pos�e') }; reader.readAsDataURL(f) } }
                            input.click()
                          }}>Preuve</button>
                        </div>
                      )}
                      {po.status === PAY_STATUS.PAYOUT_REQ && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                          <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => { updatePaymentStatus(po.id, 'PAYOUT_DONE'); showToast && showToast('Versement effectu�') }}>Simuler le versement</button>
                          <button className="btn btn-danger btn-sm" style={{ fontSize: 10 }} onClick={() => { openDispute(po.id, 'Contestation sur le march� ' + (detail.titre || '')); showToast && showToast('Litige ouvert') }}>Signaler un litige</button>
                        </div>
                      )}
                      {po.status === 'PAYOUT_DONE' && <div style={{ padding: '8px 0', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--ok)', marginTop: 4 }}>Fonds transf�r�s au b�n�ficiaire</div>}
                      {po.status === 'DISPUTE_OPEN' && <div style={{ padding: '8px 12px', background: 'rgba(220,38,38,.04)', borderRadius: 8, border: '1px solid rgba(220,38,38,.1)', marginTop: 4, fontSize: 11, color: 'var(--err)', fontWeight: 600 }}>Litige en cours — lib�rations gel�es</div>}
                      {po.status === 'REVERSED' && <div style={{ padding: '8px 0', textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--t3)', marginTop: 4 }}>Fonds rembours�s au payeur</div>}
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        {(() => { const RI = RAIL_ICONS[rec.rail]; return RI ? <RI size={16}/> : <span style={{ fontSize: 16 }}>{railMeta?.icon}</span> })()}
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)' }}>{railMeta?.label}</div>
                          <div style={{ fontSize: 10, color: 'var(--t4)' }}>{rec.reason}</div>
                        </div>
                      </div>
                      {amount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--t4)', marginBottom: 8 }}>
                          <span>Montant : {formatShort(amount)}</span>
                          <span>Commission : {formatShort(commission)}</span>
                        </div>
                      )}
                      <button className="btn btn-primary btn-sm" style={{ width: '100%' }} onClick={() => {
                        const order = createPaymentOrder({ type: 'marche', marketId: detail.id, projectId: detail.projectId, amount, commission, beneficiaryId: detail.entreprise, railRecommended: rec.rail, label: detail.titre || 'March�' })
                        setTimeout(() => updatePaymentStatus(order.id, PAY_STATUS.PENDING), 500)
                        setTimeout(() => { updatePaymentStatus(order.id, PAY_STATUS.CONFIRMED); showToast && showToast('Fonds confirm�s — march� s�curis�') }, 2000)
                        setDetail({ ...detail })
                      }}>S�curiser le paiement</button>
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Historique */}
            <div style={{ padding: '12px 24px', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Historique du march�</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)', flexShrink: 0 }} />
                  <span style={{ color: 'var(--t2)' }}>March� cr��</span>
                  <span style={{ marginLeft: 'auto', color: 'var(--t4)', fontSize: 10 }}>{formatDateFR(detail.createdAt)}</span>
                </div>
                {(detail.statut === MARKET_STATUS.IN_PROGRESS || detail.statut === MARKET_STATUS.COMPLETED) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--wrn)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--t2)' }}>Mission d�marr�e</span>
                  </div>
                )}
                {detail.statut === MARKET_STATUS.COMPLETED && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)', flexShrink: 0 }} />
                    <span style={{ color: 'var(--t2)' }}>Livraison valid�e</span>
                  </div>
                )}
                {(detail.validations || []).map((v, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7C3AED', flexShrink: 0 }} />
                    <span style={{ color: 'var(--t2)' }}>{v.label || 'Validation'}</span>
                    <span style={{ marginLeft: 'auto', color: 'var(--t4)', fontSize: 10 }}>{v.date || '—'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer actions */}
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0 }}>
              {(() => {
                const isOwner = store.user?.id && (store.user.id === detail.clientId || store.user.id === detail.aoOwnerId)
                const updateMarketStatus = async (newStatut, extraFields = {}) => {
                  try { await api.markets.update(detail.id, { statut: newStatut, ...extraFields }) } catch (_) {}
                  updateStore(prev => ({
                    ...prev,
                    markets: (prev.markets || []).map(m =>
                      m.id === detail.id ? { ...m, statut: newStatut, ...extraFields } : m
                    ),
                  }))
                  setDetail(prev => ({ ...prev, statut: newStatut, ...extraFields }))
                }
                if (detail.statut === MARKET_STATUS.SIGNED) return (
                  isOwner ? (
                    <button className="btn btn-primary" style={{ flex: 1, padding: '11px 16px', borderRadius: '10px', fontSize: 13 }} onClick={async () => {
                      await updateMarketStatus(MARKET_STATUS.IN_PROGRESS)
                      showToast && showToast('Mission d�marr�e — ' + detail.entreprise)
                    }}>D�marrer la mission</button>
                  ) : (
                    <div style={{ flex: 1, padding: '11px 16px', borderRadius: 10, background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.12)', textAlign: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--wrn)' }}>⏳ En attente du d�marrage par le ma�tre d'ouvrage</span>
                    </div>
                  )
                )
                if (detail.statut === MARKET_STATUS.IN_PROGRESS) return (
                  <>
                    <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => { setDetail(null); onNavigate && onNavigate('chantier') }}>Suivi chantier �†’</button>
                    {isOwner && (
                      <button className="btn btn-primary" style={{ flex: 1, padding: '11px 16px', borderRadius: '10px', fontSize: 13 }} onClick={async () => {
                        await updateMarketStatus(MARKET_STATUS.COMPLETED, { avancement: 100 })
                        showToast && showToast('March� cl�tur�')
                      }}>Cl�turer</button>
                    )}
                  </>
                )
                if (detail.statut === MARKET_STATUS.COMPLETED) return (
                  <div style={{ flex: 1, padding: '11px 16px', borderRadius: 10, background: 'rgba(52,199,89,.06)', border: '1px solid rgba(52,199,89,.12)', textAlign: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ok)' }}>March� livr�</span>
                  </div>
                )
                return null
              })()}
            </div>
          </div>
        </div>
        , document.body)
      })()}
      <ContractModal isOpen={showCreateContract} onClose={() => setShowCreateContract(false)} showToast={showToast} />
    </div>
  )
}

