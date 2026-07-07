import { useState, useEffect } from 'react'
import Modal from '../../components/shared/Modal'
import { ClipboardList, HardHat, MessageSquare, Settings, BarChart2, Check, AlertTriangle, CalendarDays } from 'lucide-react'
import { useMeereo } from '../../hooks/useMeereoStore'
import { api } from '../../services/api/client'
import { DSPageHeader, DSEmptyState } from '../../design/components'
import { exportCSV } from '../../utils/export'
import { formatDateFR } from '../../utils/helpers'

const icons = {
  hebdo: <ClipboardList size={14}/>,
  visite: <HardHat size={14}/>,
  reunion: <MessageSquare size={14}/>,
  technique: <Settings size={14}/>,
  mensuel: <BarChart2 size={14}/>,
}
const getProjetImg = (nom, store) => { const p = (store.projects || []).find(x => x.nom === nom); return p?.img || null }


const ErrMsg = ({ show }) => show
  ? <p style={{ color: 'var(--err)', fontSize: 11, marginTop: 4, fontWeight: 500 }}>Champ obligatoire</p>
  : null

function ReportModal({ isOpen, onClose, showToast }) {
  const { store, updateStore, emitEvent } = useMeereo()
  const [f, setF] = useState({ type: 'Rapport hebdomadaire', projet: '', date: '', heure: '09:00', lieu: '', participants: '', ordre: '', decisions: '', alertes: '', prochaine: '' })
  const [saving, setSaving] = useState(false)
  const submit = async () => {
    setSaving(true)
    try {
      const created = await api.rapports.create({ ...f, visibility: 'client_visible', auteur: store.user?.name || '' })
      updateStore(prev => ({ ...prev, rapports: [...(prev.rapports || []), created] }))
      emitEvent('document_uploaded', { name: f.type }, { notifMsg: `Rapport créé : ${f.type}` })
      showToast('Rapport créé')
      setF({ type: 'Rapport hebdomadaire', projet: '', date: '', heure: '09:00', lieu: '', participants: '', ordre: '', decisions: '', alertes: '', prochaine: '' })
      onClose()
    } catch (e) {
      showToast(e.message || 'Erreur création rapport', 'red')
    } finally {
      setSaving(false)
    }
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau rapport" footer={<><button className="btn btn-sm" onClick={onClose}>Annuler</button><button className="btn btn-primary btn-sm" onClick={submit} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-row">
          <div><label className="form-label">Type de rapport</label><select className="form-input" value={f.type} onChange={e => setF(p => ({ ...p, type: e.target.value }))}><option>Rapport hebdomadaire</option><option>Rapport de visite</option><option>Compte-rendu réunion</option><option>Rapport technique</option><option>Rapport mensuel</option><option>Rapport de chantier</option><option>PV de réception</option></select></div>
          <div><label className="form-label">Projet</label><select className="form-input" value={f.projet} onChange={e => setF(p => ({ ...p, projet: e.target.value }))}><option value="">Sélectionner</option>{(store.projects || []).map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}</select></div>
        </div>
        <div className="form-row">
          <div><label className="form-label">Date</label><input className="form-input" type="date" value={f.date} onChange={e => setF(p => ({ ...p, date: e.target.value }))} /></div>
          <div><label className="form-label">Heure</label><input className="form-input" type="time" value={f.heure} onChange={e => setF(p => ({ ...p, heure: e.target.value }))} /></div>
        </div>
        <div><label className="form-label">Lieu</label><input className="form-input" placeholder="Bureau de chantier..." value={f.lieu} onChange={e => setF(p => ({ ...p, lieu: e.target.value }))} /></div>
        <div><label className="form-label">Participants</label><input className="form-input" placeholder="Noms séparés par des virgules" value={f.participants} onChange={e => setF(p => ({ ...p, participants: e.target.value }))} /></div>
        <div><label className="form-label">Ordre du jour</label><textarea className="form-input" rows="3" placeholder="1. Avancement
2. Points techniques" value={f.ordre} onChange={e => setF(p => ({ ...p, ordre: e.target.value }))} /></div>
        <div><label className="form-label">Décisions prises</label><textarea className="form-input" rows="2" placeholder="Décisions et actions..." value={f.decisions} onChange={e => setF(p => ({ ...p, decisions: e.target.value }))} /></div>
        <div><label className="form-label">Points d'alerte</label><textarea className="form-input" rows="2" placeholder="Retards, blocages..." value={f.alertes} onChange={e => setF(p => ({ ...p, alertes: e.target.value }))} /></div>
        <div><label className="form-label">Prochaine réunion</label><input className="form-input" type="date" value={f.prochaine} onChange={e => setF(p => ({ ...p, prochaine: e.target.value }))} /></div>
      </div>
    </Modal>
  )
}

export default function Reports({ openModal, showToast }) {
  const { store, updateStore } = useMeereo()
  const [allRapports, setAllRapports] = useState(store.rapports || [])
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.rapports.getAll().then(r => {
      setAllRapports(r)
      updateStore(prev => ({ ...prev, rapports: r }))
    }).catch(() => {})
  }, [])
  const [projetFilter, setProjetFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showCreateReport, setShowCreateReport] = useState(false)

  const setRapportStatut = async (id, statut) => {
    try {
      await api.rapports.update(id, { statut })
      setAllRapports(prev => prev.map(r => r.id === id ? { ...r, statut } : r))
      updateStore(prev => ({ ...prev, rapports: (prev.rapports || []).map(r => r.id === id ? { ...r, statut } : r) }))
    } catch (e) { showToast && showToast(e.message || 'Erreur', 'red') }
  }

  const projets = [...new Set(allRapports.map(r => r.projet).filter(Boolean))]
  const types = [...new Set(allRapports.map(r => r.type).filter(Boolean))]

  const filtered = allRapports.filter(r => {
    const pOk = projetFilter === 'all' || r.projet === projetFilter
    const tOk = typeFilter === 'all' || r.type === typeFilter
    const q = search.toLowerCase()
    const sOk = !q || ((r.titre || '') + (r.projet || '') + (r.auteur || '')).toLowerCase().includes(q)
    return pOk && tOk && sOk
  })

  const total = allRapports.length
  const valides = allRapports.filter(r => r.statut === 'valide').length

  const selected = selectedId ? allRapports.find(r => r.id === selectedId) : filtered[0]

  const slLabel = s => s === 'valide' ? 'Valide' : s === 'transmis' ? 'Transmis' : 'Brouillon'
  const slBg = s => s === 'valide' ? 'rgba(52,199,89,.09)' : s === 'transmis' ? 'rgba(0,122,255,.08)' : 'var(--s2)'
  const slColor = s => s === 'valide' ? 'var(--ok)' : s === 'transmis' ? 'var(--inf)' : 'var(--t3)'

  return (
    <div>
      <DSPageHeader title="Rapports" subtitle="Rapports de chantier et analyses">
        <button className="btn btn-sm" onClick={() => { exportCSV(allRapports.map(r => ({ titre: r.titre, type: r.type, projet: r.projet, date: r.date, auteur: r.auteur, statut: r.statut })), 'rapports_meereo'); showToast && showToast('Export téléchargé') }}>Exporter</button>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateReport(true)}>+ Nouveau rapport</button>
      </DSPageHeader>

      <div className="rg-2" style={{ gap: 20, marginBottom: 24 }}>
        <div style={{ background: 'linear-gradient(145deg,#191c1d,#3c3b3b)', borderRadius: 12, padding: 22, color: '#fff' }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Rapports de chantier</div>
          <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: '-2.5px', lineHeight: 1, marginBottom: 5 }}>{total}</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)' }}>rapports ce mois</div>
        </div>
        <div className="rg-2" style={{ gap: 12 }}>
          {[{ v: valides, l: 'Valides' }, { v: total - valides, l: 'En attente' }, { v: allRapports.filter(r => r.medias?.length > 0).length, l: 'Avec medias' }, { v: allRapports.filter(r => r.alertes?.length > 0).length, l: 'Alertes' }].map((k, i) => (
            <div key={i} className="card" style={{ padding: 16 }}><div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.8px', marginBottom: 4 }}>{k.v}</div><div style={{ fontSize: 12, color: 'var(--t3)' }}>{k.l}</div></div>
          ))}
        </div>
      </div>

      <div className="split">
        {/* Liste */}
        <div className="split-left">
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <input placeholder="Rechercher un rapport..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '8px 14px', border: '1px solid var(--border-card)', borderRadius: 8, fontSize: 13, fontFamily: 'var(--f)', background: 'transparent', outline: 'none', color: 'var(--tx)' }} />
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <button className={`filter-pill ${projetFilter === 'all' ? 'active' : ''}`} onClick={() => setProjetFilter('all')}>Tous</button>
              {projets.map(p => <button key={p} className={`filter-pill ${projetFilter === p ? 'active' : ''}`} onClick={() => setProjetFilter(p)}>{p.split(' — ')[0].split(' ').slice(0, 2).join(' ')}</button>)}
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <button className={`filter-pill ${typeFilter === 'all' ? 'active' : ''}`} onClick={() => setTypeFilter('all')}>Types</button>
              {types.map(t => <button key={t} className={`filter-pill ${typeFilter === t ? 'active' : ''}`} onClick={() => setTypeFilter(t)}>{t}</button>)}
            </div>
          </div>
          {filtered.length === 0 && (
            <DSEmptyState icon={<ClipboardList size={24}/>} title="Aucun rapport" description="Créez votre premier rapport de chantier." actionLabel="+ Nouveau rapport" onAction={() => setShowCreateReport(true)} />
          )}
          {filtered.map(r => (
            <div key={r.id} className="list-item" style={{ background: selected?.id === r.id ? 'var(--s2)' : undefined }} onClick={() => setSelectedId(r.id)}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>{icons[r.type] || <ClipboardList size={14}/>}</div>
              <div className="list-item-body">
                <div className="list-item-title">{r.titre}</div>
                <div className="list-item-sub">{r.projet || 'General'} · {formatDateFR(r.date)}</div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: slBg(r.statut), color: slColor(r.statut) }}>{slLabel(r.statut)}</span>
            </div>
          ))}
        </div>

        {/* Detail */}
        <div className="split-right">
          {!selected ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <DSEmptyState icon={<ClipboardList size={24}/>} title="Sélectionnez un rapport" description="Choisissez un rapport dans la liste pour le consulter." />
            </div>
          ) : (
            <div>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 20 }}>{icons[selected.type] || <ClipboardList size={20}/>}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 100, background: slBg(selected.statut), color: slColor(selected.statut) }}>{slLabel(selected.statut)}</span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-.4px', marginBottom: 4 }}>{selected.titre}</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)' }}>{formatDateFR(selected.date)}{selected.heure ? ' · ' + selected.heure : ''} · {selected.lieu || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--t4)', marginTop: 2 }}>Redige par {selected.auteur}</div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {selected.statut === 'brouillon' && (
                    <button className="btn btn-primary btn-sm" onClick={() => { setRapportStatut(selected.id, 'valide'); showToast && showToast('Rapport valide') }}>Valider</button>
                  )}
                  {selected.statut === 'valide' && (
                    <button className="btn btn-primary btn-sm" onClick={() => {
                      const p = (store.projects || []).find(x => x.nom === selected.projet)
                      const client = p ? p.client : 'le client'
                      setRapportStatut(selected.id, 'transmis')
                      showToast && showToast('Rapport transmis a ' + client)
                    }}>Transmettre au MOA</button>
                  )}
                  <button className="btn btn-sm" onClick={() => showToast && showToast('Telechargement PDF...')}>â†“ PDF</button>
                </div>
              </div>

              {/* Projet + client */}
              {selected.projet && (() => {
                const p = (store.projects || []).find(x => x.nom === selected.projet)
                return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--s2)', borderRadius: 10, marginBottom: 16 }}>
                  {getProjetImg(selected.projet, store) && <img src={getProjetImg(selected.projet, store)} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{selected.projet}</div>
                    <div style={{ fontSize: 11, color: 'var(--t3)' }}>Maitre d'ouvrage : {p ? p.client : '—'}</div>
                  </div>
                  {selected.statut === 'transmis' && <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 100, background: 'rgba(0,122,255,.08)', color: 'var(--inf)' }}>Transmis au MOA</span>}
                  {selected.statut === 'valide' && <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 100, background: 'rgba(52,199,89,.08)', color: 'var(--ok)' }}>Valide par le MOA</span>}
                </div>)
              })()}

              {/* Participants */}
              {selected.participants?.length > 0 && (
                <div className="card" style={{ padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 8 }}>Participants ({selected.participants.length})</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selected.participants.map((p, i) => (
                      <span key={i} style={{ fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: 'var(--s2)', border: '1px solid var(--border-card)' }}>{p}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Points abordes */}
              {selected.points?.length > 0 && (
                <div className="card" style={{ padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 8 }}>Points abordes</div>
                  {selected.points.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0', borderBottom: i < selected.points.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ fontSize: 10, color: 'var(--t4)', flexShrink: 0, marginTop: 2 }}>{i + 1}.</span>
                      <span style={{ fontSize: 12.5, color: 'var(--tx)', lineHeight: 1.5 }}>{p}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Decisions */}
              {selected.decisions?.length > 0 && (
                <div className="card" style={{ padding: 16, marginBottom: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 8 }}>Decisions prises</div>
                  {selected.decisions.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0' }}>
                      <span style={{ color: 'var(--ok)', flexShrink: 0, marginTop: 1 }}><Check size={10}/></span>
                      <span style={{ fontSize: 12.5, color: 'var(--tx)', lineHeight: 1.5 }}>{d}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Alertes */}
              {selected.alertes?.length > 0 && (
                <div className="card" style={{ padding: 16, marginBottom: 12, borderLeft: '3px solid var(--err)' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--err)', marginBottom: 8 }}>Points d'alerte</div>
                  {selected.alertes.map((a, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '6px 0' }}>
                      <span style={{ color: 'var(--err)', flexShrink: 0, marginTop: 1 }}><AlertTriangle size={10}/></span>
                      <span style={{ fontSize: 12.5, color: 'var(--tx)', lineHeight: 1.5 }}>{a}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Medias — photos & videos */}
              <div className="card" style={{ padding: 16, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)' }}>Photos & Videos ({(selected.medias || []).length})</div>
                  <button className="btn btn-sm" style={{ fontSize: 10, padding: '3px 10px' }} onClick={() => showToast && showToast('Selectionnez des fichiers a ajouter')}>+ Ajouter</button>
                </div>
                {(selected.medias || []).length > 0 ? (
                  <div className="rg-3" style={{ gap: 8 }}>
                    {selected.medias.map((m, i) => (
                      <div key={i} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '4/3' }}>
                        <img src={m.url} alt={m.legende || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '16px 8px 6px', background: 'linear-gradient(transparent, rgba(0,0,0,.6))' }}>
                          <div style={{ fontSize: 10, color: '#fff', fontWeight: 500 }}>{m.legende}</div>
                        </div>
                        {m.type === 'video' && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>â–¶</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '20px 0', textAlign: 'center', fontSize: 12, color: 'var(--t4)' }}>Aucun media — cliquez Ajouter pour integrer des photos ou videos</div>
                )}
              </div>

              {/* Prochaine reunion */}
              {selected.prochaineReunion && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'var(--s2)', borderRadius: 10 }}>
                  <CalendarDays size={14}/>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>Prochaine reunion</div>
                    <div style={{ fontSize: 11, color: 'var(--t3)' }}>{selected.prochaineReunion}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <ReportModal isOpen={showCreateReport} onClose={() => setShowCreateReport(false)} showToast={showToast} />
    </div>
  )
}

