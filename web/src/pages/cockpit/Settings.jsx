import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, User } from 'lucide-react'
import { useDevise } from '../../hooks/useDevise'
import { useMeereo } from '../../hooks/useMeereoStore'
import { formatDateFR } from '../../utils/helpers'
import KaiSubscription from '../../components/shared/KaiSubscription'
import DeleteAccountSection from '../../components/shared/DeleteAccountSection'
import { METIERS_AO } from '../../data/ao'
import { api } from '../../services/api/client'

const TABS = [
  { id: 'profil', label: 'Profil' },
  { id: 'prefs', label: 'Pr�f�rences' },
  { id: 'devise', label: 'Devise & Region' },
  { id: 'securite', label: 'S�curit�' },
  { id: 'equipe', label: 'Equipe' },
  { id: 'abonnement', label: 'Abonnement' },
  { id: 'donnees', label: 'Donn�es' },
]

const PREFS = [
  { key: 'notifEmail',  label: 'Notifications email' },
  { key: 'notifPush',   label: 'Notifications push' },
  { key: 'rappels',     label: 'Rappels planning' },
  { key: 'resume',      label: 'R�sum� hebdomadaire' },
]
const ROLES = [
  { id: 'admin', label: 'Administrateur', desc: 'Acc�s complet, gestion �quipe et param�tres' },
  { id: 'chef', label: 'Chef de projet', desc: 'Gestion projets, chantier, documents, rapports' },
  { id: 'collaborateur', label: 'Collaborateur', desc: 'Consultation et edition des projets assignes' },
  { id: 'lecteur', label: 'Lecteur', desc: 'Consultation uniquement, pas de modification' },
]


const inputStyleSec = { width: '100%', padding: '10px 14px', border: '1px solid var(--border-card)', borderRadius: 10, fontSize: 13, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)' }
const labelStyleSec = { fontSize: 11, fontWeight: 600, color: 'var(--t3)', display: 'block', marginBottom: 4 }

function SecurityForm({ showToast }) {
  const [pwd, setPwd] = useState({ current: '', nouveau: '', confirm: '' })
  const handleSave = () => {
    if (!pwd.current || !pwd.nouveau || !pwd.confirm) { showToast && showToast('Tous les champs sont requis'); return }
    if (pwd.nouveau.length < 8) { showToast && showToast('Le mot de passe doit faire 8 caract�res minimum'); return }
    if (pwd.nouveau !== pwd.confirm) { showToast && showToast('Les mots de passe ne correspondent pas'); return }
    setPwd({ current: '', nouveau: '', confirm: '' })
    showToast && showToast('Mot de passe mis � jour')
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div><label style={labelStyleSec}>Mot de passe actuel</label><input type="password" placeholder="••••••••" style={inputStyleSec} value={pwd.current} onChange={e => setPwd(p => ({ ...p, current: e.target.value }))} /></div>
      <div><label style={labelStyleSec}>Nouveau mot de passe</label><input type="password" placeholder="Minimum 8 caract�res" style={inputStyleSec} value={pwd.nouveau} onChange={e => setPwd(p => ({ ...p, nouveau: e.target.value }))} /></div>
      <div><label style={labelStyleSec}>Confirmer</label><input type="password" placeholder="Confirmer le nouveau" style={inputStyleSec} value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} /></div>
      <button className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-end', marginTop: 8 }} onClick={handleSave}>Mettre a jour</button>
    </div>
  )
}

export default function Settings({ showToast }) {
  const { devise, setDevise, devises, taux, format: fmtMoney } = useDevise()
  const { store, updateStore, acceptCommissionTerms, hasAcceptedCommissionTerms } = useMeereo()
  const ob = store.onboardingData || {}
  const [tab, setTab] = useState('profil')
  // Profil fields — controlled state synced with store.onboardingData
  const [pEntreprise, setPEntreprise] = useState(ob.entreprise || store.user?.company || store.user?.name || '')
  const [pRccm, setPRccm] = useState(ob.rccm || '')
  const [pEmail, setPEmail] = useState(ob.email || ob.emailPro || store.user?.email || '')
  const [pTel, setPTel] = useState(ob.tel || ob.telPro || store.user?.phone || '')
  const [pVille, setPVille] = useState(ob.ville || 'Abidjan')
  const [pBio, setPBio] = useState(ob.bio || '')
  const [pSlogan, setPSlogan] = useState(ob.slogan || '')
  const [pLogoUrl, setPLogoUrl] = useState(ob.logoFileUrl || '')
  const [pSecteurs, setPSecteurs] = useState(ob.secteurs || [])
  const [pServices, setPServices] = useState(ob.services || [])
  const [newSecteur, setNewSecteur] = useState('')
  const [newService, setNewService] = useState('')
  const [pSaved, setPSaved] = useState(false)
  // �quipe — source de v�rit� UNIQUE dans store.onboardingData.cockpitTeam
  // Partag�e avec la page professionnelle
  const storedTeam = store.onboardingData?.cockpitTeam
  const initialTeam = []
  const [team, setTeamLocal] = useState(storedTeam && storedTeam.length > 0 ? storedTeam : initialTeam)
  const setTeam = (updater) => {
    setTeamLocal(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      updateStore(prevStore => ({ ...prevStore, onboardingData: { ...(prevStore.onboardingData || {}), cockpitTeam: next } }))
      return next
    })
  }
  const [showResetModal, setShowResetModal] = useState(false)
  const [resetText, setResetText] = useState('')
  const [inviteModal, setInviteModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteNom, setInviteNom] = useState('')
  const [invitePoste, setInvitePoste] = useState('')
  const [inviteRole, setInviteRole] = useState('collaborateur')
  const [invitePhoto, setInvitePhoto] = useState(null)
  const [editMember, setEditMember] = useState(null)

  const inviteMember = () => {
    if (!inviteEmail.trim()) return
    const newMember = {
      id: 'tm_' + Date.now(),
      nom: inviteNom || (inviteEmail || '').split('@')[0] || 'Membre',
      email: inviteEmail,
      role: inviteRole,
      poste: invitePoste || 'Collaborateur',
      photo: invitePhoto || '',
      photoUrl: invitePhoto || '',
      statut: 'invite',
      online: false,
    }
    setTeam(prev => [...prev, newMember])
    // Creer une conversation dans le store
    updateStore(prev => ({
      ...prev,
      conversations: [...(prev.conversations || []), {
        id: 'conv_tm_' + Date.now(), nom: newMember.nom, type: 'equipe', avatar: newMember.nom ? newMember.nom[0].toUpperCase() : '?', color: '#7C3AED',
        isGroup: false, participants: [newMember.nom],
        dernier: 'Invitation envoy�e', time: 'Maintenant', unread: 0,
        msgs: [{ side: 'out', text: 'Bienvenue dans l\'�quipe ! Vous avez �t� invit� � rejoindre notre espace MEEREO.', time: 'Maintenant' }]
      }]
    }))
    setInviteModal(false)
    setInviteEmail(''); setInviteNom(''); setInvitePoste(''); setInviteRole('collaborateur'); setInvitePhoto(null)
    showToast && showToast('Invitation envoy�e � ' + inviteEmail)
  }

  const removeMember = (id) => {
    const m = team.find(t => t.id === id)
    if (m?.role === 'admin') { showToast && showToast('Impossible de supprimer un administrateur'); return }
    setTeam(prev => prev.filter(t => t.id !== id))
    showToast && showToast('Membre retir� de l\'�quipe')
  }

  const saveEditMember = () => {
    if (!editMember) return
    setTeam(prev => prev.map(t => t.id === editMember.id ? editMember : t))
    setEditMember(null)
    showToast && showToast('Role mis � jour')
  }

  const roleLabel = r => ROLES.find(x => x.id === r)?.label || r
  const statusColor = s => s === 'actif' ? 'var(--ok)' : s === 'invite' ? 'var(--wrn)' : 'var(--t4)'

  return (
    <div>
      <div className="ph-row">
        <div><div className="ph-title">Parametres</div><div className="ph-sub">Espace de travail</div></div>
        <div className="ph-actions"><button className="btn btn-primary btn-sm" onClick={() => {
          if (tab === 'profil') {
            const patch = { entreprise: pEntreprise, rccm: pRccm, email: pEmail, tel: pTel, ville: pVille, bio: pBio, slogan: pSlogan, logoFileUrl: pLogoUrl, secteurs: pSecteurs, services: pServices }
            updateStore(prev => ({
              ...prev,
              onboardingData: { ...(prev.onboardingData || {}), ...patch },
              user: prev.user ? { ...prev.user, name: pEntreprise || prev.user.name, email: pEmail || prev.user.email, phone: pTel || prev.user.phone } : prev.user,
            }))
            // Persister c�t� serveur
            api.usersApi.updateOnboardingData(patch).catch(() => {})
            setPSaved(true); setTimeout(() => setPSaved(false), 1500)
          }
          showToast && showToast('Param�tres enregistr�s')
        }}>{pSaved ? <><Check size={10}/> Enregistr�</> : 'Enregistrer'}</button></div>
      </div>

      <div className="param-split">
        <div className="param-nav">
          {TABS.map(t => (
            <button key={t.id} className={`param-nav-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>

        <div className="param-content">
          <div style={{ maxWidth: tab === 'equipe' ? 700 : 560 }}>
            <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.3px', marginBottom: 20 }}>{TABS.find(t => t.id === tab)?.label}</div>

            {tab === 'profil' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Logo management */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 18px', background: 'var(--s2)', borderRadius: 14 }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    {pLogoUrl ? (
                      <img src={pLogoUrl} alt="Logo" style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'contain', background: '#fff', border: '1px solid var(--border-card)' }} />
                    ) : ob.photoUrl ? (
                      <img src={ob.photoUrl} alt="" style={{ width: 64, height: 64, borderRadius: 14, objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: 64, height: 64, borderRadius: 14, background: ob.logoColor || 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 800 }}>
                        {(pEntreprise || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{ob.prenom ? `${ob.prenom} ${ob.nom || ''}`.trim() : store.user?.name || pEntreprise || ''}</div>
                    <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 10 }}>{pEntreprise || 'Votre structure'}</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm" style={{ fontSize: 10.5, padding: '5px 12px' }} onClick={() => {
                        const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'
                        inp.onchange = async (e) => {
                          const file = e.target.files?.[0]; if (!file) return
                          try {
                            const { default: compress } = await import('../../utils/compressImage')
                            const url = await compress(file, 400, 0.8)
                            setPLogoUrl(url)
                            showToast && showToast('Logo mis � jour — pensez � enregistrer')
                          } catch { showToast && showToast('Erreur lors du chargement') }
                        }
                        inp.click()
                      }}>{pLogoUrl || ob.logoFileUrl ? 'Changer le logo' : 'Ajouter un logo'}</button>
                      {(pLogoUrl || ob.logoFileUrl) && (
                        <button className="btn btn-sm" style={{ fontSize: 10.5, padding: '5px 12px', color: 'var(--err)' }} onClick={() => { setPLogoUrl(''); showToast && showToast('Logo supprim� — pensez � enregistrer') }}>Supprimer</button>
                      )}
                    </div>
                  </div>
                </div>
                <div><label className="form-label">Nom de l'agence / structure</label><input className="form-input" value={pEntreprise} onChange={e => setPEntreprise(e.target.value)} placeholder="Nom de votre structure" /></div>
                <div><label className="form-label">Slogan / accroche</label><input className="form-input" value={pSlogan} onChange={e => setPSlogan(e.target.value)} placeholder="Une architecture ancree dans la duree" /></div>
                <div><label className="form-label">Bio / presentation</label><textarea className="form-input" value={pBio} onChange={e => setPBio(e.target.value)} placeholder="Presentez votre structure, votre approche, vos valeurs..." /></div>
                <div><label className="form-label">Numero RCCM</label><input className="form-input" value={pRccm} onChange={e => setPRccm(e.target.value)} placeholder="CI-ABJ-2019-B-12345" /></div>
                <div><label className="form-label">Email</label><input type="email" className="form-input" value={pEmail} onChange={e => setPEmail(e.target.value)} placeholder="contact@entreprise.com" /></div>
                <div><label className="form-label">Telephone</label><input className="form-input" value={pTel} onChange={e => setPTel(e.target.value)} placeholder="+225 07 00 11 22" /></div>
                <div><label className="form-label">Ville</label><input className="form-input" value={pVille} onChange={e => setPVille(e.target.value)} placeholder="Abidjan" /></div>
                {/* Secteurs d'activit� — s�lection depuis m�tiers existants */}
                <div>
                  <label className="form-label">Secteurs d'activit�</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                    {pSecteurs.map(s => (
                      <span key={s} style={{ padding: '5px 12px', borderRadius: 100, background: 'var(--tx)', color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {s}
                        <button onClick={() => setPSecteurs(prev => prev.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13, color: 'rgba(255,255,255,.6)', lineHeight: 1, display: 'flex' }}>�</button>
                      </span>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--t4)', marginBottom: 6 }}>Cliquez pour ajouter :</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {METIERS_AO.filter(m => !pSecteurs.includes(m)).map(m => (
                      <button key={m} onClick={() => setPSecteurs(prev => [...prev, m])} style={{ padding: '4px 10px', borderRadius: 100, border: '1px solid var(--border-card)', background: 'var(--surface-1)', fontSize: 10.5, fontWeight: 500, fontFamily: 'var(--f)', color: 'var(--t2)', cursor: 'pointer', transition: 'all .1s' }} onMouseOver={e => { e.currentTarget.style.background = 'var(--s2)'; e.currentTarget.style.borderColor = 'var(--tx)' }} onMouseOut={e => { e.currentTarget.style.background = 'var(--surface-1)'; e.currentTarget.style.borderColor = 'var(--border-card)' }}>+ {m}</button>
                    ))}
                  </div>
                  {/* Champ libre pour secteur personnalis� */}
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <input className="form-input" value={newSecteur} onChange={e => setNewSecteur(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newSecteur.trim()) { e.preventDefault(); if (!pSecteurs.includes(newSecteur.trim())) setPSecteurs(prev => [...prev, newSecteur.trim()]); setNewSecteur('') } }} placeholder="Ou saisir un secteur personnalis�..." style={{ flex: 1, fontSize: 12 }} />
                    <button className="btn btn-sm" style={{ flexShrink: 0 }} onClick={() => { if (newSecteur.trim() && !pSecteurs.includes(newSecteur.trim())) { setPSecteurs(prev => [...prev, newSecteur.trim()]); setNewSecteur('') } }}>+</button>
                  </div>
                </div>
                {/* Services — �ditable */}
                <div>
                  <label className="form-label">Services</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                    {pServices.map(s => (
                      <span key={s} style={{ padding: '4px 10px', borderRadius: 100, background: 'var(--s2)', fontSize: 11, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                        {s}
                        <button onClick={() => setPServices(prev => prev.filter(x => x !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 13, color: 'var(--t4)', lineHeight: 1, display: 'flex' }}>�</button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input className="form-input" value={newService} onChange={e => setNewService(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newService.trim()) { e.preventDefault(); if (!pServices.includes(newService.trim())) setPServices(prev => [...prev, newService.trim()]); setNewService('') } }} placeholder="Ajouter un service..." style={{ flex: 1 }} />
                    <button className="btn btn-sm" style={{ flexShrink: 0 }} onClick={() => { if (newService.trim() && !pServices.includes(newService.trim())) { setPServices(prev => [...prev, newService.trim()]); setNewService('') } }}>+</button>
                  </div>
                </div>
              </div>
            )}

            {tab === 'prefs' && (
              <div>
                {PREFS.map((pref) => {
                  const prefs = store.clientPrefs || { notifEmail: true, notifPush: true, rappels: false, resume: false }
                  const on = !!prefs[pref.key]
                  const toggle = () => {
                    const newVal = !on
                    updateStore(prev => ({
                      ...prev,
                      clientPrefs: { ...(prev.clientPrefs || prefs), [pref.key]: newVal }
                    }))
                    api.usersApi.updatePrefs({ [pref.key]: newVal }).catch(() => {})
                  }
                  return (
                    <div key={pref.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 13, color: 'var(--t2)' }}>{pref.label}</span>
                      <div onClick={toggle} style={{ width: 36, height: 20, borderRadius: 100, background: on ? 'var(--tx)' : 'var(--s3)', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .15s' }}>
                        <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, transition: 'all .15s', ...(on ? { right: 3 } : { left: 3 }) }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {tab === 'devise' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><label className="form-label">Devise</label>
                  <select className="form-input" value={devise} onChange={e => { setDevise(e.target.value); showToast && showToast('Devise changee en ' + e.target.value + ' — tous les montants sont convertis') }}>
                    {devises.map(d => <option key={d} value={d}>{d} ({taux[d]?.code}) {d !== 'FCFA' ? '— 1 ' + taux[d]?.symbol + ' = ' + Math.round(1 / taux[d]?.rate).toLocaleString() + ' FCFA' : ''}</option>)}
                  </select>
                </div>
                <div><label className="form-label">Fuseau horaire</label><select className="form-input"><option>Afrique/Abidjan (GMT+0)</option><option>Europe/Paris (GMT+2)</option></select></div>
              </div>
            )}

            {tab === 'securite' && <SecurityForm showToast={showToast} />}

            {tab === 'abonnement' && <KaiSubscription role="pro" />}

            {tab === 'donnees' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* KAI Pro — redirige vers onglet Abonnement */}
                {(() => {
                  const allEnt = store.kaiEntitlement || {}
                  const ent = allEnt.pro || {}
                  const isActive = ent.tier === 'gold' && ent.goldEndDate && new Date(ent.goldEndDate) > new Date()
                  return (
                    <div style={{ padding: 20, background: isActive ? 'rgba(124,58,237,.03)' : 'var(--s2)', borderRadius: 12, border: isActive ? '1px solid rgba(124,58,237,.1)' : '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: isActive ? '#7C3AED' : 'var(--t4)', flexShrink: 0 }} />
                        <div style={{ fontSize: 13, fontWeight: 700 }}>KAI {isActive ? 'Pro' : 'Standard'}</div>
                      </div>
                      {isActive
                        ? <div style={{ fontSize: 11, color: '#7C3AED', fontWeight: 600 }}>KAI Pro est actif jusqu'au {formatDateFR(ent.goldEndDate)}</div>
                        : <div style={{ fontSize: 11, color: 'var(--t3)' }}>Plan Standard — {ent.quotaUsed || 0}/{ent.quotaLimit || 25} analyses ce mois</div>
                      }
                      <button className="btn btn-sm" style={{ marginTop: 10, fontSize: 11 }} onClick={() => setTab('abonnement')}>G�rer mon abonnement �†’</button>
                    </div>
                  )
                })()}

                {/* �”€�”€ Commissions MEEREO (visible uniquement si des commissions existent) �”€�”€ */}
                {(store.commissions || []).length > 0 && (
                  <div style={{ padding: 20, background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>Commissions MEEREO</div>
                        <div style={{ fontSize: 11, color: 'var(--t3)' }}>Mises en relation via MEEREO — commission 5%</div>
                      </div>
                      {!hasAcceptedCommissionTerms() && (
                        <button className="btn btn-primary btn-sm" onClick={acceptCommissionTerms}>Accepter les conditions</button>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {(store.commissions || []).map(c => (
                        <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--s2)', borderRadius: 10 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: c.status === 'paid' ? 'var(--ok)' : c.status === 'due' || c.status === 'invoiced' ? 'var(--wrn)' : 'var(--t4)', flexShrink: 0 }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)' }}>{c.structureName || 'Structure'}</div>
                            <div style={{ fontSize: 10.5, color: 'var(--t4)' }}>Base : {fmtMoney(c.montantBase || 0)} � 5%</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tx)' }}>{fmtMoney(c.montantCommission || 0)}</div>
                            <div style={{ fontSize: 9.5, fontWeight: 600, padding: '1px 6px', borderRadius: 100, background: c.status === 'paid' ? 'rgba(52,199,89,.08)' : 'rgba(245,158,11,.08)', color: c.status === 'paid' ? 'var(--ok)' : 'var(--wrn)', display: 'inline-block' }}>
                              {c.status === 'potential' ? 'Potentielle' : c.status === 'due' ? 'Due' : c.status === 'invoiced' ? 'Factur�e' : c.status === 'paid' ? 'R�gl�e' : c.status === 'overdue' ? 'En retard' : c.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ padding: 20, background: 'var(--s2)', borderRadius: 12, border: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>R�initialiser toutes les donn�es</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 14, lineHeight: 1.5 }}>Cette action supprime toutes les donn�es locales : projets, clients, offres, march�s, commandes, messages, documents, �quipe, notifications et param�tres. La plateforme reviendra � son �tat initial vierge.</div>
                  <button className="btn btn-danger btn-sm" onClick={() => { setResetText(''); setShowResetModal(true) }}>R�initialiser et revenir � l'accueil</button>
                </div>
                <div style={{ padding: 20, background: 'var(--s2)', borderRadius: 12, border: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Exporter les donnees</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 14, lineHeight: 1.5 }}>Telechargez un export JSON de toutes vos donnees MEEREO.</div>
                  <button className="btn btn-sm" onClick={() => {
                    const data = localStorage.getItem('meereo_store_v2')
                    if (!data) { showToast && showToast('Aucune donnee a exporter'); return }
                    const blob = new Blob([data], { type: 'application/json' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url; a.download = 'meereo-export-' + new Date().toISOString().slice(0, 10) + '.json'
                    a.click(); URL.revokeObjectURL(url)
                    showToast && showToast('Export telecharge')
                  }}>Exporter en JSON</button>
                </div>
                <DeleteAccountSection profileType="pro" />
              </div>
            )}

            {tab === 'equipe' && (
              <div>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 13, color: 'var(--t3)' }}>{team.length} membres � {team.filter(t => t.online).length} en ligne</div>
                  <button className="btn btn-primary btn-sm" onClick={() => setInviteModal(true)}>+ Inviter un membre</button>
                </div>

                {/* Roles explanation */}
                <div className="rg-4" style={{ gap: 8, marginBottom: 20 }}>
                  {ROLES.map(r => (
                    <div key={r.id} style={{ padding: '10px 12px', background: 'var(--s2)', borderRadius: 8, border: '1px solid var(--border-card)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 2 }}>{r.label}</div>
                      <div style={{ fontSize: 10, color: 'var(--t4)', lineHeight: 1.4 }}>{r.desc}</div>
                    </div>
                  ))}
                </div>

                {/* Team list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {team.map(m => {
                    const initials = (m.nom || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
                    return (
                      <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 10 }}>
                        <div style={{ width: 38, height: 38, borderRadius: 19, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--t2)', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                          {(m.photo || m.photoUrl) ? <img src={m.photo || m.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none' }} /> : initials}
                          <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: m.online ? 'var(--ok)' : 'var(--t4)', border: '2px solid var(--surface-1)' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{m.nom}</div>
                          <div style={{ fontSize: 11, color: 'var(--t3)' }}>{m.poste} � {m.email}</div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 100, background: 'var(--s2)', color: 'var(--tx)' }}>{roleLabel(m.role)}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 100, background: statusColor(m.statut) + '18', color: statusColor(m.statut) }}>{m.statut === 'invite' ? '⏳ Invite' : '�—� Actif'}</span>
                        <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                          <button className="btn btn-sm" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => setEditMember({ ...m })}>Modifier</button>
                          {m.role !== 'admin' && <button style={{ fontSize: 10, padding: '3px 8px', borderRadius: 6, border: '1px solid rgba(220,38,38,.2)', background: 'rgba(220,38,38,.05)', color: 'var(--err)', cursor: 'pointer', fontFamily: 'var(--f)', fontWeight: 600 }} onClick={() => removeMember(m.id)}>Retirer</button>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* �•��•��•� MODAL: Inviter un membre �•��•��•� */}
      {inviteModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setInviteModal(false)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, width: 460, boxShadow: '0 20px 60px rgba(0,0,0,.15)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-.5px' }}>Inviter un collaborateur</div>
              <button onClick={() => setInviteModal(false)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--t3)' }}>�</button>
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ padding: '12px 14px', background: 'var(--s2)', borderRadius: 10, fontSize: 11.5, color: 'var(--t3)', lineHeight: 1.5 }}>
                Le membre recevra un email d'invitation pour rejoindre votre espace MEEREO. Il aura acces au cockpit et pourra communiquer avec l'equipe.
              </div>
              <div><label className="form-label">Email *</label><input className="form-input" type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="collaborateur@entreprise.com" autoFocus /></div>
              <div className="modal-row">
                <div><label className="form-label">Nom complet</label><input className="form-input" value={inviteNom} onChange={e => setInviteNom(e.target.value)} placeholder="Prenom Nom" /></div>
                <div><label className="form-label">Poste</label><input className="form-input" value={invitePoste} onChange={e => setInvitePoste(e.target.value)} placeholder="Architecte, Ingenieur..." /></div>
              </div>
              <div>
                <label className="form-label">Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 24, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1px solid var(--border-card)' }}>
                    {invitePhoto ? <img src={invitePhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={18} color="var(--t4)"/>}
                  </div>
                  <div>
                    <button className="btn btn-sm" style={{ fontSize: 10 }} onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = async e => { const f = e.target.files[0]; if (f) { try { const { default: compress } = await import('../../utils/compressImage'); const url = await compress(f, 300, 0.75); setInvitePhoto(url) } catch { setInvitePhoto(URL.createObjectURL(f)) } } }; inp.click() }}>Choisir une photo</button>
                    {invitePhoto && <button style={{ marginLeft: 6, fontSize: 10, color: 'var(--err)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)' }} onClick={() => setInvitePhoto(null)}>Supprimer</button>}
                  </div>
                </div>
              </div>
              <div><label className="form-label">Role sur la plateforme</label>
                <select className="form-input" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                  {ROLES.map(r => <option key={r.id} value={r.id}>{r.label} — {r.desc}</option>)}
                </select>
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-sm" onClick={() => setInviteModal(false)}>Annuler</button>
              <button className="btn btn-primary btn-sm" disabled={!inviteEmail.trim()} onClick={inviteMember}>Envoyer l'invitation</button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* �•��•��•� MODAL: Modifier le role �•��•��•� */}
      {/* �•��•��•� MODAL: Confirmer la r�initialisation �•��•��•� */}
      {showResetModal && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setShowResetModal(false)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, width: 460, boxShadow: '0 20px 60px rgba(0,0,0,.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-.5px', color: 'var(--err)' }}>R�initialiser toutes les donn�es ?</div>
              <button onClick={() => setShowResetModal(false)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--t3)' }}>�</button>
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '12px 14px', background: '#fff1f0', border: '1px solid #ffc5c0', borderRadius: 10, fontSize: 12, color: '#c0392b', lineHeight: 1.6 }}>
                �š�️ Cette action est <strong>irr�versible</strong>. Tous les projets, clients, offres, march�s, commandes, messages, documents et param�tres seront d�finitivement supprim�s.
              </div>
              <div>
                <label className="form-label">Pour confirmer, tapez <strong>R�INITIALISER</strong> ci-dessous</label>
                <input
                  className="form-input"
                  value={resetText}
                  onChange={e => setResetText(e.target.value)}
                  placeholder="R�INITIALISER"
                  autoFocus
                  style={{ fontFamily: 'monospace', letterSpacing: 1 }}
                />
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-sm" onClick={() => setShowResetModal(false)}>Annuler</button>
              <button
                className="btn btn-danger btn-sm"
                disabled={resetText !== 'R�INITIALISER'}
                onClick={() => { localStorage.removeItem('meereo_store_v2'); window.location.href = '/onboarding' }}
              >R�initialiser et revenir � l'accueil</button>
            </div>
          </div>
        </div>
      , document.body)}

      {editMember && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .15s ease' }} onClick={() => setEditMember(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, width: 400, boxShadow: '0 20px 60px rgba(0,0,0,.15)', padding: 22 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Modifier — {editMember.nom}</div>
              <button onClick={() => setEditMember(null)} style={{ width: 28, height: 28, borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--t3)' }}>�</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="form-label">Photo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 24, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden', border: '1px solid var(--border-card)' }}>
                    {(editMember.photo || editMember.photoUrl) ? <img src={editMember.photo || editMember.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={18} color="var(--t4)"/>}
                  </div>
                  <div>
                    <button className="btn btn-sm" style={{ fontSize: 10 }} onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = async e => { const f = e.target.files[0]; if (f) { try { const { default: compress } = await import('../../utils/compressImage'); const url = await compress(f, 300, 0.75); setEditMember(p => ({ ...p, photo: url, photoUrl: url })) } catch { setEditMember(p => ({ ...p, photo: URL.createObjectURL(f) })) } } }; inp.click() }}>Changer</button>
                    {(editMember.photo || editMember.photoUrl) && <button style={{ marginLeft: 6, fontSize: 10, color: 'var(--err)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)' }} onClick={() => setEditMember(p => ({ ...p, photo: '', photoUrl: '' }))}>Supprimer</button>}
                  </div>
                </div>
              </div>
              <div><label className="form-label">Poste</label><input className="form-input" value={editMember.poste} onChange={e => setEditMember(p => ({ ...p, poste: e.target.value }))} /></div>
              <div><label className="form-label">Role</label>
                <select className="form-input" value={editMember.role} onChange={e => setEditMember(p => ({ ...p, role: e.target.value }))}>
                  {ROLES.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
              <div><label className="form-label">Statut</label>
                <select className="form-input" value={editMember.statut} onChange={e => setEditMember(p => ({ ...p, statut: e.target.value }))}>
                  <option value="actif">Actif</option>
                  <option value="invite">Invite</option>
                  <option value="suspendu">Suspendu</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn btn-sm" onClick={() => setEditMember(null)}>Annuler</button>
                <button className="btn btn-primary btn-sm" onClick={saveEditMember}>Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  )
}

