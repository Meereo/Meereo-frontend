import { Package, ShoppingCart } from 'lucide-react'

export default function Catalogue({ ctx }) {
  const { filteredProducts, catalogFilter, setCatalogFilter, activeProducts, sponsoredProducts, flashProducts, fmtMoney, setShowAddProduct, setNewProd, setEditProduct, setConfirmDeleteProduct, setShowSponsorModal, setSponsorDuration, setShowFlashModal, setFlashPrice, setFlashDuration, setFlashStock, setView, emptyProd } = ctx

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['all', 'Tous (' + activeProducts.length + ')'], ['sponsored', 'Sponsorises (' + sponsoredProducts.length + ')'], ['flash', 'Flash (' + flashProducts.length + ')']].map(([k, l]) => (
            <button key={k} onClick={() => setCatalogFilter(k)} style={{ padding: '5px 12px', borderRadius: 100, border: catalogFilter === k ? '1.5px solid var(--tx)' : '1px solid var(--border-subtle)', background: catalogFilter === k ? 'var(--tx)' : 'var(--surface-1)', color: catalogFilter === k ? '#fff' : 'var(--t2)', fontSize: 11, fontWeight: catalogFilter === k ? 700 : 500, cursor: 'pointer', fontFamily: 'var(--f)' }}>{l}</button>
          ))}
        </div>
        <button className="btn btn-primary" onClick={() => { setNewProd(emptyProd); setShowAddProduct(true) }}>+ Ajouter un produit</button>
      </div>
      {filteredProducts.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ marginBottom: 12, opacity: .4 }}><ShoppingCart size={32}/></div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Aucun produit</div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 16 }}>Ajoutez vos premiers produits pour commencer à vendre sur le Marketplace</div>
          <button className="btn btn-primary" onClick={() => setShowAddProduct(true)}>+ Ajouter un produit</button>
        </div>
      ) : (
        <div className="rg-3" style={{ gap: 14 }}>
          {filteredProducts.map((p, i) => (
            <div key={i} className="card" style={{ overflow: 'hidden', position: 'relative' }}>
              {p.sponsored && <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 8, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'var(--tx)', color: '#fff', zIndex: 2 }}>Sponsorise</span>}
              {p.flash && <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 8, fontWeight: 600, padding: '2px 6px', borderRadius: 4, background: 'var(--wrn)', color: '#fff', zIndex: 2 }}>Flash</span>}
              {p.photoUrl
                ? <img src={p.photoUrl} alt="" style={{ width: '100%', height: 130, objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: 130, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t4)' }}><Package size={32}/></div>
              }
              <div style={{ padding: 14 }}>
                {p.category && <div style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>{p.category}</div>}
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                  {p.flash && p.flashPrice ? <><span style={{ textDecoration: 'line-through', color: 'var(--t4)', fontSize: 12 }}>{fmtMoney(p.price)}</span> {fmtMoney(p.flashPrice)}</> : fmtMoney(p.price)}
                  <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--t3)', marginLeft: 4 }}>{p.unit}</span>
                </div>
                {p.stock > 0 && <div style={{ fontSize: 10, color: 'var(--t4)', marginBottom: 4 }}>Stock : {p.stock}</div>}
                <div style={{ fontSize: 9, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: p.isPublished !== false ? 'var(--ok)' : 'var(--t4)' }} />
                  <span style={{ color: p.isPublished !== false ? 'var(--ok)' : 'var(--t4)', fontWeight: 600 }}>{p.isPublished !== false ? 'Marketplace' : 'Non visible'}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  <button className="btn btn-sm" style={{ fontSize: 9, padding: '3px 8px' }} onClick={() => setEditProduct({ ...p })}>Modifier</button>
                  <button className="btn btn-sm" style={{ fontSize: 9, padding: '3px 8px' }} onClick={() => setView('marketplace')}>Voir</button>
                  {!p.sponsored && <button className="btn btn-sm" style={{ fontSize: 9, padding: '3px 8px' }} onClick={() => { setShowSponsorModal(p.id); setSponsorDuration('72h') }}>Boost</button>}
                  {!p.flash && <button className="btn btn-sm" style={{ fontSize: 9, padding: '3px 8px' }} onClick={() => { setShowFlashModal(p.id); setFlashPrice(String(Math.round((p.price || 0) * 0.8))); setFlashDuration('24h'); setFlashStock('') }}>Flash</button>}
                  <button className="btn btn-sm" style={{ fontSize: 9, padding: '3px 8px', color: 'var(--err)' }} onClick={() => setConfirmDeleteProduct(p.id)}>×</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
