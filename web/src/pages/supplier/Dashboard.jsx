import { Package, Store, Settings } from 'lucide-react'

export default function Dashboard({ ctx }) {
  const { activeProducts, sellerOrders, pendingOrders, caTotal, products, ob, entreprise, categories, zones, fmtMoney, setView, setShowAddProduct, setNewProd, emptyProd, uid } = ctx

  return (
    <>
      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.4px', color: 'var(--tx)' }}>Bonjour, {entreprise}</div>
        <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}{uid.city ? ' · ' + uid.city : ''}</div>
      </div>

      {/* Hero — conditionnel selon activité */}
      {activeProducts.length === 0 ? (
        /* État vide — démarrage */
        <div style={{ maxWidth: 640 }}>
          <div style={{ background: 'linear-gradient(150deg, #0f1011, #1a1d1e 40%, #2a2c2d)', borderRadius: 18, padding: '48px 40px', color: '#fff', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.03) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 14 }}>Bienvenue</div>
              <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-.5px', marginBottom: 8, lineHeight: 1.2 }}>Développez votre activité sur MEEREO</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.7, maxWidth: 420, marginBottom: 28 }}>Ajoutez vos premiers produits, structurez votre catalogue et commencez à recevoir des demandes depuis votre espace.</div>
              <button className="btn" style={{ background: '#fff', color: '#111', padding: '11px 22px', borderRadius: 10, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => { setShowAddProduct(true); setNewProd(emptyProd) }}>+ Ajouter un produit</button>
            </div>
          </div>

          {/* Comment ça marche */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 14 }}>Comment ça marche</div>
            <div className="rg-4" style={{ gap: 10 }}>
              {[
                { n: '01', title: 'Présenter votre offre', desc: 'Ajoutez vos produits, catégories et informations clés.' },
                { n: '02', title: 'Gagner en visibilité', desc: 'Rendez votre catalogue accessible aux clients et professionnels.' },
                { n: '03', title: 'Recevoir des demandes', desc: 'Échangez avec les porteurs de projets.' },
                { n: '04', title: 'Gérer les commandes', desc: 'Suivez vos ventes et livraisons.' },
              ].map(step => (
                <div key={step.n} style={{ padding: '18px 16px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-medium)' }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--t4)', letterSpacing: '-1px', marginBottom: 10, lineHeight: 1 }}>{step.n}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>{step.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>{step.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Explorer */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 14 }}>Explorer</div>
            <div className="rg-3" style={{ gap: 10 }}>
              {[
                { icon: <Store size={18}/>, label: 'Boutique', desc: 'Découvrir le marketplace', v: 'marketplace' },
                { icon: <Package size={18}/>, label: 'Commandes', desc: 'Voir les demandes', v: 'commandes' },
                { icon: <Settings size={18}/>, label: 'Paramètres', desc: 'Configurer votre espace', v: 'parametres' },
              ].map(btn => (
                <div key={btn.v} onClick={() => setView(btn.v)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-medium)', cursor: 'pointer', transition: 'all .15s' }}>
                  <div style={{ fontSize: 18, flexShrink: 0 }}>{btn.icon}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)' }}>{btn.label}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--t4)' }}>{btn.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* État actif — activité en cours */
        <>
          {/* Actions urgentes */}
          {pendingOrders.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              {pendingOrders.slice(0, 2).map(o => (
                <div key={o.id} onClick={() => setView('commandes')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 10, cursor: 'pointer', marginBottom: 10 }}>
                  <Package size={14}/>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--tx)', flex: 1 }}>Commande {o.ref || ''} en attente{o.total ? ' — ' + fmtMoney(o.total) : ''}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              ))}
            </div>
          )}

          {/* Synthèse rapide */}
          <div className="rg-3" style={{ gap: 12, marginBottom: 28 }}>
            <div onClick={() => setView('catalogue')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)', cursor: 'pointer' }}>
              <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-1px', color: 'var(--tx)' }}>{activeProducts.length}</div>
              <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.3 }}>produit{activeProducts.length > 1 ? 's' : ''} actif{activeProducts.length > 1 ? 's' : ''}</div>
            </div>
            <div onClick={() => setView('commandes')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)', cursor: 'pointer' }}>
              <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-1px', color: 'var(--tx)' }}>{sellerOrders.length}</div>
              <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.3 }}>commande{sellerOrders.length > 1 ? 's' : ''}</div>
            </div>
            <div onClick={() => setView('paiements')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)', cursor: 'pointer' }}>
              <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '-.5px', color: 'var(--tx)' }}>{fmtMoney(caTotal)}</div>
              <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.3 }}>FCFA ce mois</div>
            </div>
          </div>

          {/* Bouton d'action */}
          <div style={{ marginBottom: 20 }}>
            <button className="btn btn-primary" onClick={() => { setShowAddProduct(true); setNewProd(emptyProd) }}>+ Ajouter un produit</button>
          </div>
        </>
      )}

      {/* Échéances & livraisons en attente */}
      {pendingOrders.length > 0 && (
        <div className="card" style={{ padding: 0, marginBottom: 16, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Commandes à traiter ({pendingOrders.length})</div>
            <button className="btn btn-sm" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => setView('commandes')}>Voir tout →</button>
          </div>
          {pendingOrders.slice(0, 3).map(o => (
            <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF9500', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{o.ref || o.buyer || 'Commande'}</div>
                <div style={{ fontSize: 10.5, color: 'var(--t3)' }}>{o.items?.length || 0} article(s) · {o.total ? fmtMoney(o.total) : '—'}</div>
              </div>
              <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: 'rgba(255,149,0,.08)', color: '#FF9500' }}>En attente</span>
            </div>
          ))}
        </div>
      )}

      {/* Infos entreprise */}
      {(ob.rccm || ob.ncc || ob.email) && (
        <div className="card" style={{ padding: 20, marginTop: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 12 }}>Informations entreprise</div>
          <div className="rg-2" style={{ gap: 10 }}>
            {ob.rccm && <div><div style={{ fontSize: 10, color: 'var(--t4)' }}>RCCM</div><div style={{ fontSize: 12, fontWeight: 600 }}>{ob.rccm}</div></div>}
            {ob.ncc && <div><div style={{ fontSize: 10, color: 'var(--t4)' }}>N° Contribuable</div><div style={{ fontSize: 12, fontWeight: 600 }}>{ob.ncc}</div></div>}
            {ob.email && <div><div style={{ fontSize: 10, color: 'var(--t4)' }}>Email</div><div style={{ fontSize: 12, fontWeight: 600 }}>{ob.email}</div></div>}
            {ob.tel && <div><div style={{ fontSize: 10, color: 'var(--t4)' }}>Téléphone</div><div style={{ fontSize: 12, fontWeight: 600 }}>{ob.tel}</div></div>}
            {ob.ville && <div><div style={{ fontSize: 10, color: 'var(--t4)' }}>Ville</div><div style={{ fontSize: 12, fontWeight: 600 }}>{ob.ville}, {ob.pays || "Côte d'Ivoire"}</div></div>}
            {ob.delaiLivraison && <div><div style={{ fontSize: 10, color: 'var(--t4)' }}>Délai livraison</div><div style={{ fontSize: 12, fontWeight: 600 }}>{ob.delaiLivraison}</div></div>}
          </div>
          {categories.length > 0 && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 10, color: 'var(--t4)', marginBottom: 6 }}>Catégories</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {categories.map(c => <span key={c} style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: 'var(--s2)', color: 'var(--t3)' }}>{c}</span>)}
              </div>
            </div>
          )}
          {zones.length > 0 && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 10, color: 'var(--t4)', marginBottom: 6 }}>Zones de livraison</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {zones.map(z => <span key={z} style={{ fontSize: 10.5, fontWeight: 500, padding: '3px 10px', borderRadius: 100, background: 'var(--s2)', color: 'var(--t3)' }}>{z}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Aperçu produits */}
      {products.length > 0 && (
        <div className="card" style={{ padding: 20, marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)' }}>Mes produits ({products.length})</div>
            <button className="btn btn-secondary btn-sm" onClick={() => setView('catalogue')}>Voir tout →</button>
          </div>
          <div className="rg-3" style={{ gap: 10 }}>
            {products.slice(0, 6).map((p, i) => (
              <div key={i} style={{ background: 'var(--s2)', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
                {p.sponsored && <span style={{ position: 'absolute', top: 6, right: 6, fontSize: 8, fontWeight: 600, padding: '1px 5px', borderRadius: 4, background: 'var(--tx)', color: '#fff' }}>Sponsorise</span>}
                {p.flash && <span style={{ position: 'absolute', top: 6, left: 6, fontSize: 8, fontWeight: 600, padding: '1px 5px', borderRadius: 4, background: 'var(--wrn)', color: '#fff' }}>Flash</span>}
                {p.photoUrl
                  ? <img src={p.photoUrl} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8 }} />
                  : <div style={{ width: '100%', height: 80, borderRadius: 8, background: 'var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t4)' }}><Package size={24}/></div>
                }
                <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ fontSize: 11, color: 'var(--t3)' }}>{p.price ? fmtMoney(p.price) : 'Sur devis'} {p.unit}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
