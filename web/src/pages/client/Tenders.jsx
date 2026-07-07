import { useState } from 'react'
import { createPortal } from 'react-dom'
import Modal from '../../components/shared/Modal'
import { Radio } from 'lucide-react'
import AoGear, { getMetierColor } from '../../components/shared/AoGear'
import MoneyInput from '../../components/shared/MoneyInput'
import { formatBudgetDisplay } from '../../utils/helpers'
import { METIERS_AO } from '../../data/ao'
import { checkReplacementPreconditions } from '../../domain/replacementWorkflow'

// Modal to create a new AO — rendered as portal
function CreateAOModal({ open, onClose, proj, createAO, showToast }) {
  const [ao, setAo] = useState({ titre: '', metier: '', desc: '', budget: '' })

  const precondCheck = ao.metier
    ? checkReplacementPreconditions(ao.metier, proj?.id, [])
    : { allowed: true, message: null }
  const canPublish = ao.titre.trim() && ao.metier && precondCheck.allowed

  const publish = async () => {
    if (!canPublish) return
    await createAO({ title: ao.titre, description: ao.desc, budget: ao.budget, lot: ao.metier, projectId: proj?.id, needType: precondCheck.needType, createdByClient: true })
    showToast("Appel d'offres publié — les " + ao.metier + 's seront notifiés')
    setAo({ titre: '', metier: '', desc: '', budget: '' })
    onClose()
  }

  if (!open) return null
  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={onClose}>
      <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 500, boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600 }}>Publier un appel d'offres</div>
            {proj && <div style={{ fontSize: 10, color: 'var(--t4)', marginTop: 2 }}>Projet : {proj.nom}</div>}
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: 'var(--t3)' }}>×</button>
        </div>
        <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ padding: '10px 14px', background: 'var(--s2)', borderRadius: 10, fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>
            Décrivez votre besoin. Les professionnels du métier sélectionné recevront votre appel et pourront vous envoyer une proposition.
          </div>
          <div>
            <label className="form-label">Titre *</label>
            <input className="form-input" value={ao.titre} onChange={e => setAo(p => ({ ...p, titre: e.target.value }))} placeholder="ex: Recherche architecte pour rénovation appartement" />
          </div>
          <div>
            <label className="form-label">Type de professionnel *</label>
            <select className="form-input" value={ao.metier} onChange={e => setAo(p => ({ ...p, metier: e.target.value }))}>
              <option value="">Choisir un métier</option>
              {METIERS_AO.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          {ao.metier && !precondCheck.allowed && (
            <div style={{ padding: '10px 14px', background: 'rgba(186,26,26,.05)', border: '1px solid rgba(186,26,26,.12)', borderRadius: 10, fontSize: 11, color: 'var(--err)', lineHeight: 1.5 }}>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Flux bloqué</div>
              {precondCheck.message}
            </div>
          )}
          {ao.metier && precondCheck.allowed && precondCheck.needType === 'complementary' && (
            <div style={{ padding: '10px 14px', background: 'rgba(52,199,89,.05)', border: '1px solid rgba(52,199,89,.12)', borderRadius: 10, fontSize: 11, color: 'var(--ok)', lineHeight: 1.5 }}>
              Besoin complémentaire — le lot précédent est clôturé. Vous pouvez publier un nouvel AO.
            </div>
          )}
          <div>
            <label className="form-label">Description du projet</label>
            <textarea className="form-input" value={ao.desc} onChange={e => setAo(p => ({ ...p, desc: e.target.value }))} placeholder="Surface, type de travaux, contraintes, délai souhaité..." />
          </div>
          <div>
            <label className="form-label">Budget estimatif (FCFA)</label>
            <MoneyInput value={ao.budget} onChange={v => setAo(p => ({ ...p, budget: v }))} placeholder="5 000 000" />
          </div>
        </div>
        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn btn-sm" onClick={onClose}>Annuler</button>
          <button className="btn btn-primary btn-sm" disabled={!canPublish} style={{ opacity: canPublish ? 1 : .5 }} onClick={publish}>
            Publier l'AO
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default function Tenders({ ctx }) {
  const { displayedAOs, store, setPage, showToast, proj, createAO } = ctx
  const [showCreate, setShowCreate] = useState(false)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Mes appels d'offres</div>
          <div style={{ fontSize: 12, color: 'var(--t3)' }}>Publiez un AO pour trouver un professionnel</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>+ Publier un appel d'offres</button>
      </div>

      {displayedAOs.length === 0 && (
        <div className="card" style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ marginBottom: 12, opacity: .3, display: 'flex', justifyContent: 'center' }}><Radio size={32} /></div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Aucun appel d'offres</div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 16 }}>
            Publiez un AO pour recevoir des propositions de professionnels qualifiés
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => setShowCreate(true)}>Publier mon premier AO</button>
        </div>
      )}

      {displayedAOs.map(ao => {
        const storeOffers = (store.offers || []).filter(o => o.aoId === ao.id)
        const nbRep = storeOffers.length || ao.reponses || 0
        const hasRep = nbRep > 0
        return (
          <div key={ao.id} style={{ background: 'linear-gradient(145deg,#191c1d,#3c3b3b)', borderRadius: 14, padding: '22px 24px 18px', color: '#fff', marginBottom: 10, position: 'relative', overflow: 'hidden', cursor: hasRep ? 'pointer' : 'default' }}
            onClick={() => { if (hasRep) setPage('offres') }}>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(255,255,255,.05),transparent 55%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Ma demande</span>
                <span style={{ fontSize: 9, color: 'rgba(255,255,255,.25)' }}>·</span>
                <span style={{ fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,.3)', fontFamily: 'monospace' }}>{ao.ref}</span>
                <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: hasRep ? 'rgba(52,199,89,.15)' : 'rgba(245,158,11,.15)', color: hasRep ? '#34c759' : '#F59E0B' }}>
                  {hasRep ? nbRep + ' réponse' + (nbRep > 1 ? 's' : '') : 'En attente'}
                </span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.3px', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 7, lineHeight: 1.25 }}>
                <AoGear size={14} color={getMetierColor(ao.metier || ao.lot)} />
                {ao.titre || ao.title}
              </div>
              {ao.desc && <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,.4)', lineHeight: 1.5, marginBottom: 10, maxHeight: 36, overflow: 'hidden' }}>{ao.desc}</div>}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: getMetierColor(ao.metier || ao.lot) + '22', color: getMetierColor(ao.metier || ao.lot) }}>
                  {ao.metier || ao.lot}
                </span>
                {(ao.budget && ao.budget !== '—') && (
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,.4)' }}>{formatBudgetDisplay(ao.budget)}</span>
                )}
              </div>
              {hasRep && (
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: 'rgba(52,199,89,.9)', fontWeight: 600 }}>Voir les offres ({nbRep})</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              )}
            </div>
          </div>
        )
      })}

      <CreateAOModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        proj={proj}
        createAO={createAO}
        showToast={showToast}
      />
    </div>
  )
}
