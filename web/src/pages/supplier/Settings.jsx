import { Smartphone } from 'lucide-react'
import KaiSubscription from '../../components/shared/KaiSubscription'
import DeleteAccountSection from '../../components/shared/DeleteAccountSection'

const PTABS = [
  { id: 'entreprise', label: 'Mon entreprise' },
  { id: 'marketplace', label: 'Marketplace' },
  { id: 'paiement', label: 'Paiements' },
  { id: 'livraison', label: 'Livraison' },
  { id: 'notifs', label: 'Notifications' },
  { id: 'abonnement', label: 'Abonnement' },
  { id: 'securite', label: 'Securite' },
  { id: 'donnees', label: 'Données' },
]

export default function Settings({ ctx }) {
  const { paramTab, setParamTab, fEntreprise, setFEntreprise, fPwd, setFPwd, notifPrefs, setNotifPrefs, ob, entreprise, categories, zones, activeProducts, sponsoredProducts, visibleMarketplace, products, showToast, updateStore } = ctx
  const pTab = paramTab
  const setPTab = setParamTab

  const saveProfil = () => {
    updateStore(prev => ({
      ...prev,
      onboardingData: {
        ...(prev.onboardingData || {}),
        entreprise: fEntreprise.nom || ob.entreprise,
        email: fEntreprise.email || ob.email,
        tel: fEntreprise.tel || ob.tel,
        ville: fEntreprise.ville || ob.ville,
      }
    }))
    showToast('Paramètres enregistrés', 'green')
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ width: 180, flexShrink: 0 }}>
          {PTABS.map(t => (
            <button key={t.id} onClick={() => setPTab(t.id)} style={{ display: 'block', width: '100%', padding: '9px 14px', borderRadius: 8, border: 'none', background: pTab === t.id ? 'var(--tx)' : 'transparent', color: pTab === t.id ? '#fff' : 'var(--t2)', fontSize: 12.5, fontWeight: pTab === t.id ? 700 : 500, fontFamily: 'var(--f)', cursor: 'pointer', textAlign: 'left', marginBottom: 4 }}>{t.label}</button>
          ))}
        </div>
        <div style={{ flex: 1, maxWidth: 560 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>{PTABS.find(t => t.id === pTab)?.label}</div>

          {pTab === 'entreprise' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {ob.logoFileUrl && <img src={ob.logoFileUrl} alt="" style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'contain', marginBottom: 4 }} />}
              <div><label className="form-label">Nom de l'entreprise</label><input className="form-input" value={fEntreprise.nom} onChange={e => setFEntreprise(p => ({ ...p, nom: e.target.value }))} /></div>
              <div><label className="form-label">Email</label><input className="form-input" type="email" value={fEntreprise.email} onChange={e => setFEntreprise(p => ({ ...p, email: e.target.value }))} /></div>
              <div><label className="form-label">Telephone</label><input className="form-input" value={fEntreprise.tel} onChange={e => setFEntreprise(p => ({ ...p, tel: e.target.value }))} /></div>
              <div><label className="form-label">Ville</label><input className="form-input" value={fEntreprise.ville} onChange={e => setFEntreprise(p => ({ ...p, ville: e.target.value }))} /></div>
              {ob.rccm && <div><label className="form-label">RCCM</label><div style={{ fontSize: 13, fontWeight: 600, padding: '10px 14px', background: 'var(--s2)', borderRadius: 10 }}>{ob.rccm}</div></div>}
              {ob.ncc && <div><label className="form-label">N° Contribuable</label><div style={{ fontSize: 13, fontWeight: 600, padding: '10px 14px', background: 'var(--s2)', borderRadius: 10 }}>{ob.ncc}</div></div>}
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="btn btn-primary btn-sm" onClick={saveProfil}>Enregistrer</button></div>
            </div>
          )}

          {pTab === 'marketplace' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '10px 14px', background: 'var(--s2)', borderRadius: 10, fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>
                Ces informations definissent comment votre entreprise apparait dans le Marketplace MEEREO.
              </div>
              <div><label className="form-label">Nom affiche marketplace</label><div style={{ fontSize: 13, fontWeight: 600, padding: '10px 14px', background: 'var(--s2)', borderRadius: 10 }}>{entreprise}</div></div>
              <div><label className="form-label">Categories servies</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {categories.length > 0 ? categories.map(c => <span key={c} style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: 'var(--s2)', color: 'var(--t3)' }}>{c}</span>) : <span style={{ fontSize: 11, color: 'var(--t4)' }}>Aucune categorie configuree</span>}
                </div>
              </div>
              <div><label className="form-label">Produits en ligne</label><div style={{ fontSize: 22, fontWeight: 800 }}>{activeProducts.length} <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--t3)' }}>dont {sponsoredProducts.length} sponsorises</span></div></div>
              <div><label className="form-label">Visibilite marketplace</label><div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ok)' }}>{visibleMarketplace.length} produit{visibleMarketplace.length > 1 ? 's' : ''} visible{visibleMarketplace.length > 1 ? 's' : ''}</div></div>
            </div>
          )}

          {pTab === 'paiement' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: '10px 14px', background: 'var(--s2)', borderRadius: 10, fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>
                Configurez vos moyens de reception de paiements sur la plateforme MEEREO.
              </div>
              {[
                { name: 'Orange Money', color: '#FF6600' },
                { name: 'MTN MoMo', color: '#FFCC00' },
                { name: 'Wave', color: '#1DC3F0' },
              ].map(pm => (
                <div key={pm.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 10 }}>
                  <Smartphone size={18} style={{ color: pm.color, flexShrink: 0 }}/>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{pm.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--t4)' }}>Non configure</div>
                  </div>
                  <button className="btn btn-sm" style={{ fontSize: 10 }} onClick={() => showToast('Configuration ' + pm.name + ' — bientot disponible')}>Configurer</button>
                </div>
              ))}
            </div>
          )}

          {pTab === 'livraison' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label className="form-label">Delai de livraison</label><input className="form-input" defaultValue={ob.delaiLivraison || ''} placeholder="ex: 24-48h, 3-5 jours..." /></div>
              <div><label className="form-label">Modes disponibles</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['Livraison', 'Retrait client'].map(m => (
                    <div key={m} style={{ padding: '10px 16px', background: 'var(--s2)', borderRadius: 8, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ok)' }} /> {m}
                    </div>
                  ))}
                </div>
              </div>
              <div><label className="form-label">Zones de livraison</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {zones.length > 0 ? zones.map(z => <span key={z} style={{ fontSize: 10.5, fontWeight: 500, padding: '3px 10px', borderRadius: 100, background: 'var(--s2)', color: 'var(--t3)' }}>{z}</span>) : <span style={{ fontSize: 11, color: 'var(--t4)' }}>Toutes zones</span>}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="btn btn-primary btn-sm" onClick={saveProfil}>Enregistrer</button></div>
            </div>
          )}

          {pTab === 'notifs' && (
            <div>
              {['Nouvelles commandes', 'Paiements recus', 'Produits valides', 'Offres flash', 'Messages support'].map((pref, i) => (
                <div key={pref} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, color: 'var(--t2)' }}>{pref}</span>
                  <div onClick={() => setNotifPrefs(prev => prev.map((v, idx) => idx === i ? !v : v))} style={{ width: 36, height: 20, borderRadius: 100, background: notifPrefs[i] ? 'var(--tx)' : 'var(--s3)', cursor: 'pointer', position: 'relative', flexShrink: 0 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, ...(notifPrefs[i] ? { right: 3 } : { left: 3 }) }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {pTab === 'abonnement' && <KaiSubscription role="fournisseur" />}

          {pTab === 'securite' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label className="form-label">Email de connexion</label><div style={{ fontSize: 13, padding: '10px 14px', background: 'var(--s2)', borderRadius: 10 }}>{ob.email || 'Non renseigne'}</div></div>
              <div><label className="form-label">Mot de passe actuel</label><input className="form-input" type="password" placeholder="••••••••" value={fPwd.current} onChange={e => setFPwd(p => ({ ...p, current: e.target.value }))} /></div>
              <div><label className="form-label">Nouveau mot de passe</label><input className="form-input" type="password" placeholder="Minimum 8 caractères" value={fPwd.nouveau} onChange={e => setFPwd(p => ({ ...p, nouveau: e.target.value }))} /></div>
              <div><label className="form-label">Confirmer</label><input className="form-input" type="password" placeholder="Confirmer le nouveau mot de passe" value={fPwd.confirm} onChange={e => setFPwd(p => ({ ...p, confirm: e.target.value }))} /></div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}><button className="btn btn-primary btn-sm" onClick={() => {
                if (!fPwd.current || !fPwd.nouveau || !fPwd.confirm) { showToast('Veuillez remplir tous les champs', 'orange'); return }
                if (fPwd.nouveau.length < 8) { showToast('Le nouveau mot de passe doit contenir au moins 8 caractères', 'orange'); return }
                if (fPwd.nouveau !== fPwd.confirm) { showToast('Les mots de passe ne correspondent pas', 'orange'); return }
                showToast('Mot de passe mis à jour', 'green')
                setFPwd({ current: '', nouveau: '', confirm: '' })
              }}>Changer le mot de passe</button></div>
            </div>
          )}
          {pTab === 'donnees' && <DeleteAccountSection profileType="fournisseur" />}
        </div>
      </div>
    </div>
  )
}
