import { useState } from 'react'
import { Check } from 'lucide-react'
import { api } from '../../services/api/client'
import KaiSubscription from '../../components/shared/KaiSubscription'
import DeleteAccountSection from '../../components/shared/DeleteAccountSection'

function ClientProfileForm({ ob, store, updateStore, showToast }) {
  const _nameParts = (store.user?.name || '').trim().split(' ').filter(Boolean)
  const [prenom, setPrenom] = useState(ob.prenom || _nameParts[0] || '')
  const [nom, setNom] = useState(ob.nom || _nameParts.slice(1).join(' ') || '')
  const [email, setEmail] = useState(ob.email || store.user?.email || '')
  const [tel, setTel] = useState(ob.tel || store.user?.phone || '')
  const [ville, setVille] = useState(ob.ville || 'Abidjan')
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    const patch = { prenom, nom, email, tel, ville }
    updateStore(prev => ({
      ...prev,
      onboardingData: { ...(prev.onboardingData || {}), ...patch },
      user: prev.user ? { ...prev.user, name: `${prenom} ${nom}`.trim(), email, phone: tel } : prev.user,
    }))
    api.usersApi.updateOnboardingData(patch).catch(() => showToast('Erreur de sauvegarde', 'red'))
    setSaved(true)
    showToast('Profil mis à jour')
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {ob.photoUrl && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 4 }}>
          <img src={ob.photoUrl} alt="" style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover' }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{prenom} {nom}</div>
            <div style={{ fontSize: 10, color: 'var(--t3)' }}>{store.user?.type === 'client' ? 'Client' : ''}</div>
          </div>
        </div>
      )}
      <div className="modal-row" style={{ gap: 12 }}>
        <div><label className="form-label">Prenom</label><input className="form-input" value={prenom} onChange={e => setPrenom(e.target.value)} /></div>
        <div><label className="form-label">Nom</label><input className="form-input" value={nom} onChange={e => setNom(e.target.value)} /></div>
      </div>
      <div><label className="form-label">Email</label><input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} /></div>
      <div><label className="form-label">Telephone</label><input className="form-input" value={tel} onChange={e => setTel(e.target.value)} /></div>
      <div><label className="form-label">Ville</label><input className="form-input" value={ville} onChange={e => setVille(e.target.value)} /></div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <button className="btn btn-primary btn-sm" onClick={handleSave}>{saved ? <><Check size={12}/> Enregistré</> : 'Enregistrer'}</button>
      </div>
    </div>
  )
}

function ClientSecurityForm({ showToast }) {
  const [current, setCurrent] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = async () => {
    setError('')
    if (!current.trim()) { setError('Saisissez votre mot de passe actuel'); return }
    if (newPwd.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères'); return }
    if (newPwd !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    setLoading(true)
    try {
      await api.auth.changePassword({ currentPassword: current, newPassword: newPwd })
      setCurrent(''); setNewPwd(''); setConfirm('')
      showToast('Mot de passe mis à jour')
    } catch (e) {
      const msg = e.message || ''
      setError(msg.includes('incorrect') ? 'Mot de passe actuel incorrect' : msg.includes('8 caractères') ? msg : 'Erreur lors du changement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div><label className="form-label">Mot de passe actuel</label><input className="form-input" type="password" placeholder="••••••••" value={current} onChange={e => setCurrent(e.target.value)} /></div>
      <div><label className="form-label">Nouveau mot de passe</label><input className="form-input" type="password" placeholder="Minimum 8 caractères" value={newPwd} onChange={e => setNewPwd(e.target.value)} /></div>
      <div><label className="form-label">Confirmer le mot de passe</label><input className="form-input" type="password" placeholder="Confirmer" value={confirm} onChange={e => setConfirm(e.target.value)} /></div>
      {error && <div style={{ fontSize: 11, color: 'var(--err)', padding: '6px 10px', background: 'rgba(186,26,26,.05)', borderRadius: 8 }}>{error}</div>}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
        <button className="btn btn-primary btn-sm" onClick={handleChange} disabled={!current || !newPwd || !confirm || loading} style={{ opacity: (!current || !newPwd || !confirm || loading) ? .5 : 1 }}>{loading ? 'Modification...' : 'Changer le mot de passe'}</button>
      </div>
    </div>
  )
}

function ClientPrefsForm({ store, updateStore }) {
  const prefs = store.clientPrefs || { notifEmail: true, notifPush: true, rappels: false, resume: false }
  const toggle = (key) => {
    const newVal = !(prefs[key])
    updateStore(prev => ({ ...prev, clientPrefs: { ...(prev.clientPrefs || prefs), [key]: newVal } }))
    api.usersApi.updatePrefs({ [key]: newVal }).catch(() => {})
  }
  const items = [
    { key: 'notifEmail', label: 'Notifications email' },
    { key: 'notifPush', label: 'Notifications push' },
    { key: 'rappels', label: 'Rappels projet' },
    { key: 'resume', label: 'Resume hebdomadaire' },
  ]
  return (
    <div>
      {items.map(item => {
        const on = (store.clientPrefs || prefs)[item.key]
        return (
          <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--t2)' }}>{item.label}</span>
            <div onClick={() => toggle(item.key)} style={{ width: 36, height: 20, borderRadius: 100, background: on ? 'var(--tx)' : 'var(--s3)', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background .15s' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, transition: 'all .15s', ...(on ? { right: 3 } : { left: 3 }) }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

const PARAM_TABS = [
  { id: 'profil', label: 'Mon profil' },
  { id: 'securite', label: 'Securite' },
  { id: 'prefs', label: 'Préférences' },
  { id: 'abonnement', label: 'Abonnement' },
  { id: 'donnees', label: 'Données' },
]

export default function Settings({ ctx }) {
  const { ob, store, updateStore, showToast } = ctx
  const [paramTab, setParamTab] = useState('profil')

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div><div style={{ fontSize: 15, fontWeight: 600 }}>Parametres</div><div style={{ fontSize: 12, color: 'var(--t3)' }}>Mon compte</div></div>
      </div>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ width: 180, flexShrink: 0 }}>
          {PARAM_TABS.map(t => (
            <button key={t.id} onClick={() => setParamTab(t.id)} style={{ display: 'block', width: '100%', padding: '9px 14px', borderRadius: 8, border: 'none', background: paramTab === t.id ? 'var(--tx)' : 'transparent', color: paramTab === t.id ? '#fff' : 'var(--t2)', fontSize: 12.5, fontWeight: paramTab === t.id ? 700 : 500, fontFamily: 'var(--f)', cursor: 'pointer', textAlign: 'left', marginBottom: 4 }}>{t.label}</button>
          ))}
        </div>
        <div style={{ flex: 1, maxWidth: 500 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>{PARAM_TABS.find(t => t.id === paramTab)?.label}</div>
          {paramTab === 'profil' && <ClientProfileForm ob={ob} store={store} updateStore={updateStore} showToast={showToast} />}
          {paramTab === 'securite' && <ClientSecurityForm showToast={showToast} />}
          {paramTab === 'prefs' && <ClientPrefsForm store={store} updateStore={updateStore} />}
          {paramTab === 'abonnement' && <KaiSubscription role="client" />}
          {paramTab === 'donnees' && <DeleteAccountSection profileType="client" />}
        </div>
      </div>
    </div>
  )
}
