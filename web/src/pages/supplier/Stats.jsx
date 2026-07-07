import { BarChart2 } from 'lucide-react'

export default function Stats({ ctx }) {
  const { activeProducts, sellerOrders, pendingOrders, sponsoredProducts, visibleMarketplace, caTotal, products, fmtMoney, setView } = ctx

  return (
    <div>
      {products.length === 0 && sellerOrders.length === 0 && (
        <div className="card" style={{ padding: 48, textAlign: 'center', marginBottom: 20 }}>
          <div style={{ marginBottom: 12, opacity: .4 }}><BarChart2 size={32}/></div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Aucune statistique</div>
          <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 16 }}>Ajoutez des produits et recevez des commandes pour voir vos performances ici.</div>
          <button className="btn btn-primary btn-sm" onClick={() => setView('catalogue')}>Ajouter des produits</button>
        </div>
      )}
      <div className="rg-4" style={{ gap: 12, marginBottom: 20 }}>
        {[
          { l: 'Produits actifs', v: String(activeProducts.length), sub: sponsoredProducts.length + ' sponsorises' },
          { l: 'Commandes', v: String(sellerOrders.length), sub: pendingOrders.length + ' en attente' },
          { l: 'CA total', v: fmtMoney(caTotal) },
          { l: 'Visibilite', v: String(visibleMarketplace.length), sub: 'sur ' + activeProducts.length + ' actifs' },
        ].map((k, i) => (
          <div key={i} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 6 }}>{k.l}</div>
            <div style={{ fontSize: 22, fontWeight: 600 }}>{k.v}</div>
            <div style={{ fontSize: 10, color: 'var(--t4)', marginTop: 2 }}>{k.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button className="btn btn-sm" onClick={() => setView('marketplace')}>Voir le marketplace</button>
      </div>
      {products.length > 0 && (
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Produits par performance</div>
          {products.slice(0, 8).map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 7 ? '1px solid var(--border)' : 'none' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--t4)', width: 20 }}>{i + 1}.</span>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>
                {p.name}
                {p.sponsored && <span style={{ fontSize: 8, fontWeight: 600, padding: '0 4px', borderRadius: 3, background: 'var(--tx)', color: '#fff', marginLeft: 6 }}>S</span>}
                {p.flash && <span style={{ fontSize: 8, fontWeight: 600, padding: '0 4px', borderRadius: 3, background: 'var(--wrn)', color: '#fff', marginLeft: 4 }}>F</span>}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600 }}>{p.price ? fmtMoney(p.price) : 'Devis'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
