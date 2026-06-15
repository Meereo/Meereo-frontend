import { useState, useMemo, useEffect } from 'react'
import { HardHat, Home, Package, Truck, Store, ShoppingCart, Check, Star, MapPin, ClipboardList, Zap, Phone, Banknote, Flame, Building2, CreditCard, Smartphone, Layers, Palette, Droplets, Leaf, Armchair, UtensilsCrossed, TreePine } from 'lucide-react'
import { MKT_CATS, MKT_ITEMS, MKT_FLASH } from '../../data/marketplace'
import { api } from '../../services/api/client'
import { PAY_PROVIDERS } from '../../data/payments'
import { useDevise } from '../../hooks/useDevise'
import { useMeereo } from '../../hooks/useMeereoStore'
import { recommendRail, RAIL_META, RAILS } from '../../domain/fintech'

const RAIL_ICONS = {
  [RAILS.VIREMENT]: Building2,
  [RAILS.CARTE]: CreditCard,
  [RAILS.MOBILE_MONEY]: Smartphone,
}

const CAT_ICONS = {
  'all': Store,
  'gros-oeuvre': HardHat,
  'structure': Building2,
  'menuiseries': Layers,
  'revetements': Palette,
  'plomberie-cvc': Droplets,
  'electricite': Zap,
  'green': Leaf,
  'mobilier': Armchair,
  'mobilier-maison': Home,
  'cuisine': UtensilsCrossed,
  'exterieur': TreePine,
}
import { formatDateFR } from '../../utils/helpers'
import { HAS_LOGISTICS_PARTNER } from '../../config/featureFlags'
const COMMISSION = 0.05 // 5% MEEREO

const TRACKING_STEPS = [
  { id: 1, label: 'Commande confirmée', icon: <Check size={13}/>, desc: 'Votre commande a été validée' },
  { id: 2, label: 'En préparation', icon: <Package size={13}/>, desc: 'Le fournisseur prépare votre commande' },
  { id: 3, label: 'Collecte en cours', icon: <Truck size={13}/>, desc: 'Le livreur collecte chez le fournisseur' },
  { id: 4, label: 'En transit', icon: <MapPin size={13}/>, desc: 'Votre commande est en route' },
  { id: 5, label: 'Livrée', icon: <Home size={13}/>, desc: 'Commande livrée avec succès' },
]

const LOGISTICS_PARTNERS = [
  { nom: 'Livraison Express', vehicule: 'Camionnette', tel: '', plaque: '', chauffeur: 'Chauffeur assigné' },
  { nom: 'Transport Standard', vehicule: 'Véhicule cargo', tel: '', plaque: '', chauffeur: 'Chauffeur assigné' },
]

// Numerotation structuree pour KAI
let cmdCounter = 0 // start at 0, no demo orders
const genRef = (prefix) => {
  cmdCounter++
  const d = new Date()
  const yy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const num = String(cmdCounter).padStart(5, '0')
  return `${prefix}-${yy}${mm}-${num}`
}
// Prefixes: CMD = commande, DEV = devis, LIV = livraison, FAC = facture
const LIVRAISON = {
  base: 1500, pickup: 500,
  kmRate: (km) => km <= 5 ? 300 : km <= 15 ? 250 : 200,
  weight: (kg) => kg <= 30 ? 0 : kg <= 100 ? 1000 : kg <= 500 ? 3000 : kg <= 1000 ? 7500 : 15000,
  volume: (m3) => m3 <= 0.5 ? 0 : m3 <= 2 ? 2000 : 5000,
}
const calcLivraison = (km, kg) => {
  let cost = LIVRAISON.base + LIVRAISON.pickup
  for (let i = 0; i < km; i++) cost += LIVRAISON.kmRate(i)
  cost += LIVRAISON.weight(kg)
  return cost
}

export default function MarketplacePage({ showToast, commerceScope }) {
  // commerceScope: 'private' (client) or 'shared_with_project' (cockpit) — defaults to shared
  const { format: fmt, formatShort: fmtShort } = useDevise()
  const { store, updateStore } = useMeereo()

  // Fetch produits depuis le backend (PostgreSQL) — partagés entre tous les utilisateurs
  const [backendProducts, setBackendProducts] = useState([])
  useEffect(() => {
    api.products.getAll()
      .then(prods => { if (Array.isArray(prods)) setBackendProducts(prods) })
      .catch(() => {}) // fallback silencieux sur store.products si backend KO
  }, [])

  // Fusionner produits backend + produits locaux (ajoutés en offline) + catalogue statique
  const allProducts = useMemo(() => {
    // Produits backend (source principale — partagés entre tous les users)
    const fromBackend = backendProducts
      .filter(p => p.isPublished !== false && p.status !== 'archived')
      .map(p => ({
        id: p.id,
        nom: p.name || '',
        cat: MKT_CATS.find(c => c.id === p.category)?.id || p.category || 'gros-oeuvre',
        fournisseur: p.supplier?.fournisseurProfile?.entreprise || p.supplier?.company || p.supplier?.name || 'Fournisseur',
        marque: '',
        prix: p.price ? fmt(Number(p.price)) : 'Sur devis',
        prix_num: Number(p.price) || 0,
        unit: '/ ' + (p.unit || 'unité').replace(/^\/\s*/, ''),
        img: p.photoUrl || '',
        dispo: true,
        note: 4.5,
        nb_avis: 0,
        desc: p.description || '',
        sponsorise: p.sponsored || false,
        flash: p.flash || false,
        flashPrice: p.flashPrice,
        fromStore: true,
      }))
    // Produits locaux (offline / pas encore synchro) — dédupliqués
    const backendIds = new Set(fromBackend.map(p => p.id))
    const fromLocal = (store.products || [])
      .filter(p => !backendIds.has(p.id) && p.isPublished !== false && p.status !== 'archived')
      .map(p => ({
        id: p.id,
        nom: p.name || p.nom || '',
        cat: MKT_CATS.find(c => c.id === p.category)?.id || p.category || 'gros-oeuvre',
        fournisseur: p.supplier?.fournisseurProfile?.entreprise || store.onboardingData?.entreprise || 'Fournisseur',
        marque: '',
        prix: p.price ? fmt(Number(p.price)) : 'Sur devis',
        prix_num: Number(p.price) || 0,
        unit: '/ ' + (p.unit || 'unité').replace(/^\/\s*/, ''),
        img: p.photoUrl || '',
        dispo: true,
        note: 4.5,
        nb_avis: 0,
        desc: p.description || '',
        sponsorise: p.sponsored || false,
        flash: p.flash || false,
        flashPrice: p.flashPrice,
        fromStore: true,
      }))
    const realIds = new Set([...fromBackend.map(p => p.id), ...fromLocal.map(p => p.id)])
    // Catalogue statique en dernier (démo)
    return [...fromBackend, ...fromLocal, ...MKT_ITEMS.filter(m => !realIds.has(m.id))]
  }, [backendProducts, store.products, store.onboardingData?.entreprise, fmt])

  const [categories, setCategories] = useState(MKT_CATS) // fallback to static data
  useEffect(() => {
    api.marketplace.getCategories()
      .then(cats => { if (cats?.length) setCategories(cats.map(c => ({ id: c.slug, label: c.label, ico: c.ico || '' }))) })
      .catch(() => {}) // keep static fallback on error
  }, [])

  const [activeCat, setActiveCat] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('pertinence')
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [detail, setDetail] = useState(null)
  const [detailQty, setDetailQty] = useState(1)
  const [activeFournisseur, setActiveFournisseur] = useState(null)
  const [showCheckout, setShowCheckout] = useState(false)
  const [livMode, setLivMode] = useState('retrait') // retrait | livraison
  const [livKm, setLivKm] = useState(10)
  const [livKg, setLivKg] = useState(50)
  const [payMethod, setPayMethod] = useState(null)
  const [livDest, setLivDest] = useState('chantier') // chantier | domicile
  const [livProjet, setLivProjet] = useState('')
  const [livAdresse, setLivAdresse] = useState('')
  const [livPin, setLivPin] = useState({ x: 50, y: 50 }) // % position on map
  const [livTel, setLivTel] = useState('+225 ')
  const [devisRequests, setDevisRequests] = useState([])
  const [showDevis, setShowDevis] = useState(null)
  const [commandes, setCommandes] = useState([])
  const [commandesLoaded, setCommandesLoaded] = useState(false)
  const [showTracking, setShowTracking] = useState(null)
  const [showCommandes, setShowCommandes] = useState(false)
  const [, refresh] = useState(0)

  // Charger les commandes depuis le backend au montage
  useEffect(() => {
    api.commandes.getAll()
      .then(orders => {
        if (Array.isArray(orders)) {
          setCommandes(orders.map(o => ({
            id: o.id, ref: o.ref,
            items: Array.isArray(o.items) ? o.items : [],
            designation: o.designation || '',
            fournisseur: o.fournisseur || '',
            total: o.total || 0,
            date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR') : 'Récent',
            statut: o.statut || 'confirmee',
            livMode: o.livMode || 'retrait',
            step: o.step || 1,
            img: o.img || '',
          })))
        }
        setCommandesLoaded(true)
      })
      .catch(() => setCommandesLoaded(true))
  }, [])

  // Filter — utilise allProducts (statiques + store)
  const filtered = allProducts.filter(m => {
    const catOk = activeCat === 'all' || m.cat === activeCat
    const q = search.toLowerCase()
    const searchOk = !q || (m.nom + m.fournisseur + m.marque + m.cat).toLowerCase().includes(q)
    const fournOk = !activeFournisseur || m.fournisseur === activeFournisseur
    return catOk && searchOk && fournOk
  })

  // Sort
  const sorted = [...filtered]
  if (sort === 'prix-asc') sorted.sort((a, b) => (a.prix_num || 9e9) - (b.prix_num || 9e9))
  if (sort === 'prix-desc') sorted.sort((a, b) => (b.prix_num || 0) - (a.prix_num || 0))
  if (sort === 'note') sorted.sort((a, b) => b.note - a.note)
  if (sort === 'avis') sorted.sort((a, b) => b.nb_avis - a.nb_avis)

  // Cart
  const addToCart = (item, qty) => {
    if (item.dispo === 'Sur devis') { showToast && showToast('Demande de devis envoyee pour ' + item.nom); return }
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id)
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + (qty || 1) } : c)
      return [...prev, { ...item, qty: qty || 1 }]
    })
    showToast && showToast(item.nom + ' ajoute au panier')
  }
  const changeQty = (id, delta) => setCart(prev => prev.map(c => c.id === id ? { ...c, qty: Math.max(1, c.qty + delta) } : c))
  const removeFromCart = (id) => setCart(prev => prev.filter(c => c.id !== id))
  const cartTotal = cart.reduce((s, c) => s + c.prix_num * c.qty, 0)
  const cartCount = cart.reduce((s, c) => s + c.qty, 0)

  const commissionAmount = Math.round(cartTotal * COMMISSION)
  const livraisonAmount = livMode === 'livraison' ? calcLivraison(livKm, livKg) : 0
  const grandTotal = cartTotal + commissionAmount + livraisonAmount

  const passerCommande = async () => {
    if (cart.length === 0 || !payMethod) return
    const prov = PAY_PROVIDERS.find(p => p.id === payMethod)
    // Vérification solde avant paiement
    if (prov && prov.solde !== null && prov.solde < grandTotal) {
      showToast && showToast('Solde insuffisant sur ' + prov.name + ' (' + fmt(prov.solde) + ')')
      return
    }
    const cmdRef = genRef('CMD')
    const activeProject = (store.projects || [])[0]
    const resolvedAddress = livAdresse ? livAdresse : (livDest === 'chantier' ? 'Chantier' : 'Domicile')

    // Trouver l'id vendeur depuis le premier produit du panier (backend)
    const firstProduct = backendProducts.find(p => cart[0] && p.id === cart[0].id)
    const sellerId = firstProduct?.supplierId || null

    // Persister la transaction locale (solde)
    const tx = { id: 'tx_mkt_' + Date.now(), type: 'debit', label: 'Achat Marketplace ' + cmdRef + ' — ' + cart.length + ' articles', montant: grandTotal, date: 'Aujourd\'hui', provider: payMethod, statut: 'confirme', projet: '' }
    updateStore(prev => ({ ...prev, transactions: [tx, ...(prev.transactions || [])] }))

    // Payload pour le backend
    const orderPayload = {
      ref: cmdRef,
      sellerId,
      designation: cart.map(c => c.nom).join(', '),
      fournisseur: cart[0]?.fournisseur || 'Fournisseur',
      items: cart.map(c => ({ name: c.nom, qty: c.qty, price: c.prix_num, fournisseur: c.fournisseur })),
      total: grandTotal,
      statut: 'confirmee',
      livMode,
      step: 1,
      projet: activeProject?.nom || activeProject?.name || '',
      address: resolvedAddress,
      paymentMethod: prov?.name || 'Plateforme',
      img: cart[0]?.img || '',
    }

    try {
      const saved = await api.commandes.create(orderPayload)
      const newCmd = {
        id: saved.id, ref: saved.ref,
        items: orderPayload.items, designation: saved.designation,
        fournisseur: saved.fournisseur, total: saved.total,
        date: new Date(saved.createdAt).toLocaleDateString('fr-FR'),
        statut: saved.statut, livMode: saved.livMode, step: saved.step, img: saved.img || '',
        ...(livMode === 'livraison' ? { partner: LOGISTICS_PARTNERS[Math.floor(Math.random() * LOGISTICS_PARTNERS.length)] } : {})
      }
      setCommandes(prev => [newCmd, ...prev])
      setCart([]); setShowCheckout(false); setShowCart(false)
      setShowCommandes(true)
      showToast && showToast('Commande confirmée — ' + fmt(grandTotal))
      // Simulate tracking progression (livraison)
      if (livMode === 'livraison') {
        setTimeout(() => { setCommandes(prev => prev.map(c => c.id === newCmd.id ? { ...c, step: 2 } : c)); api.commandes.update(newCmd.id, { step: 2 }) }, 3000)
        setTimeout(() => { setCommandes(prev => prev.map(c => c.id === newCmd.id ? { ...c, step: 3 } : c)); api.commandes.update(newCmd.id, { step: 3 }) }, 8000)
        setTimeout(() => { setCommandes(prev => prev.map(c => c.id === newCmd.id ? { ...c, step: 4 } : c)); api.commandes.update(newCmd.id, { step: 4 }) }, 15000)
      }
    } catch {
      showToast && showToast('Erreur lors de la commande — réessayez')
    }
  }

  // Devis
  const demanderDevis = (item) => {
    const devRef = genRef('DEV')
    setDevisRequests(prev => [...prev, { ref: devRef, itemId: item.id, itemNom: item.nom, fournisseur: item.fournisseur, status: 'pending', prixPropose: 0, contreProposition: '' }])
    showToast && showToast('Demande de devis envoyee a ' + item.fournisseur)
    // Simulate fournisseur response after 3s
    setTimeout(() => {
      setDevisRequests(prev => prev.map(d => d.itemId === item.id && d.status === 'pending' ? { ...d, status: 'responded', prixPropose: item.prix_num > 0 ? item.prix_num : Math.round(Math.random() * 2000000 + 500000) } : d))
      refresh(n => n + 1)
    }, 3000)
  }
  const accepterDevis = (itemId) => {
    const d = devisRequests.find(x => x.itemId === itemId)
    if (!d) return
    setDevisRequests(prev => prev.map(x => x.itemId === itemId ? { ...x, status: 'accepted' } : x))
    const item = MKT_ITEMS.find(m => m.id === itemId)
    if (item) addToCart({ ...item, prix: fmt(d.prixPropose), prix_num: d.prixPropose }, 1)
    showToast && showToast('Devis accepte — ajoute au panier')
  }

  const dispoColor = d => d === 'En stock' ? 'var(--ok)' : d === 'Sur commande' ? 'var(--wrn)' : 'var(--t4)'
  const fournisseurs = [...new Set(allProducts.map(m => m.fournisseur).filter(Boolean))]

  // Flash items
  const flashItems = MKT_FLASH.map(f => ({ ...MKT_ITEMS.find(m => m.id === f.id), flashRemise: f.remise })).filter(Boolean)

  return (
    <div style={{ margin: '-28px -36px -80px', display: 'flex', flexDirection: 'column', height: 'calc(100vh - var(--topbar-h))' }}>
      {/* ── Topbar MeereoShop ── */}
      <div style={{ background: 'linear-gradient(150deg, #0a0b0c 0%, #1a1d1e 50%, #0a0b0c 100%)', flexShrink: 0, padding: '18px 28px 14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-.5px', whiteSpace: 'nowrap' }}>Meereo<span style={{ color: '#F59E0B' }}>Shop</span></div>
          <div data-search style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.12)', borderRadius: 12, padding: '10px 16px', flex: 1, maxWidth: 520, transition: 'all .15s' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input value={search} onChange={e => { setSearch(e.target.value); if (e.target.value) setActiveCat('all') }} placeholder="Rechercher materiaux, mobilier, equipements..." style={{ background: 'none', border: 'none', outline: 'none', fontSize: 13.5, fontFamily: 'var(--f)', color: '#fff', width: '100%' }} />
          </div>
          <div style={{ display: 'flex', gap: 20, alignItems: 'center', marginLeft: 'auto' }}>
            {[{ v: MKT_ITEMS.length, l: 'Produits' }, { v: fournisseurs.length, l: 'Fournisseurs' }].map((s, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1 }}>{s.v}</div>
                <div style={{ fontSize: 8.5, fontWeight: 600, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.6px', marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setShowCommandes(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 10, background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.15)', color: '#fff', fontSize: 12, fontWeight: 600, fontFamily: 'var(--f)', cursor: 'pointer', whiteSpace: 'nowrap', position: 'relative' }}>
            <Package size={13}/> Commandes
            {commandes.filter(c => c.step < 5).length > 0 && <span style={{ position: 'absolute', top: -5, right: -5, minWidth: 16, height: 16, borderRadius: 100, background: '#F59E0B', color: '#fff', fontSize: 8, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{commandes.filter(c => c.step < 5).length}</span>}
          </button>
          <button onClick={() => setShowCart(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', borderRadius: 10, background: '#F59E0B', color: '#fff', fontSize: 12.5, fontWeight: 700, fontFamily: 'var(--f)', border: 'none', cursor: 'pointer', position: 'relative', whiteSpace: 'nowrap', boxShadow: '0 2px 12px rgba(245,158,11,.3)' }}>
            <ShoppingCart size={13}/> Panier
            {cartCount > 0 && <span style={{ position: 'absolute', top: -7, right: -7, minWidth: 18, height: 18, borderRadius: 100, background: '#DC2626', color: '#fff', fontSize: 9, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px', border: '2px solid #0a0b0c', boxShadow: '0 2px 8px rgba(220,38,38,.4)' }}>{cartCount}</span>}
          </button>
        </div>
        {/* Category pills inside header */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
          {categories.map(c => (
            <button key={c.id} onClick={() => { setActiveCat(c.id); setSearch(''); setActiveFournisseur(null) }} style={{ padding: '7px 16px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 11.5, fontWeight: 600, whiteSpace: 'nowrap', background: activeCat === c.id ? '#fff' : 'rgba(255,255,255,.08)', color: activeCat === c.id ? 'var(--tx)' : 'rgba(255,255,255,.6)', transition: 'all .15s' }}>
              {(() => { const CatI = CAT_ICONS[c.id]; return CatI ? <><CatI size={11} style={{marginRight:3}}/>{c.label}</> : c.label })()}
            </button>
          ))}
        </div>
      </div>

      {/* ── Body with sidebar ── */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden' }}>
        {/* Sidebar fournisseurs */}
        <div style={{ width: 210, flexShrink: 0, borderRight: '1px solid var(--border)', overflowY: 'auto', background: 'var(--surface-1)' }}>
          <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.8px', color: 'var(--t4)', marginBottom: 10 }}>Fournisseurs</div>
            <div onClick={() => setActiveFournisseur(null)} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: 'var(--tx)', background: !activeFournisseur ? 'var(--s2)' : 'transparent', borderRadius: 8, marginBottom: 4, transition: 'background .12s' }}>
              <Store size={13}/> Tous les fournisseurs <span style={{ fontSize: 10, color: 'var(--t4)', fontWeight: 500 }}>({allProducts.length})</span>
            </div>
          </div>
          <div style={{ padding: '8px 8px' }}>
            {fournisseurs.map(f => {
              const count = allProducts.filter(m => m.fournisseur === f).length
              const active = activeFournisseur === f
              const initials = f.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
              return (
                <div key={f} onClick={() => setActiveFournisseur(active ? null : f)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', cursor: 'pointer', borderRadius: 8, background: active ? 'var(--s2)' : 'transparent', transition: 'background .12s', marginBottom: 2 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 7, background: active ? 'var(--tx)' : 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 800, color: active ? '#fff' : 'var(--t3)', flexShrink: 0, transition: 'all .12s' }}>{initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11.5, fontWeight: active ? 700 : 500, color: active ? 'var(--tx)' : 'var(--t2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f}</div>
                    <div style={{ fontSize: 9.5, color: 'var(--t4)' }}>{count} produit{count > 1 ? 's' : ''}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>

        {/* Bannieres promo */}
        {activeCat === 'all' && !search && !activeFournisseur && (
          <div className="rg-hero" style={{ gap: 12, marginBottom: 22 }}>
            <div onClick={() => setActiveCat('mobilier')} style={{ height: 150, borderRadius: 14, overflow: 'hidden', position: 'relative', cursor: 'pointer', background: 'linear-gradient(135deg, #1a1d1e 0%, #2d3436 50%, #191c1d 100%)' }}>
              <div style={{ position: 'absolute', inset: 0 }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px 28px' }}>
                <span style={{ display: 'inline-flex', width: 'fit-content', padding: '3px 10px', borderRadius: 100, background: '#F59E0B', color: '#fff', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 8 }}><Flame size={9}/> Promo du mois</span>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', letterSpacing: '-.4px', lineHeight: 1.25, marginBottom: 5 }}>Mobilier de bureau<br />jusqu'a -20%</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.6)', marginBottom: 10 }}>Equipez vos espaces de travail</div>
                <span style={{ display: 'inline-flex', width: 'fit-content', padding: '6px 14px', borderRadius: 8, background: 'rgba(255,255,255,.15)', color: '#fff', fontSize: 11, fontWeight: 700, backdropFilter: 'blur(6px)' }}>Voir les offres →</span>
              </div>
            </div>
            <div onClick={() => setActiveCat('gros-oeuvre')} style={{ height: 150, borderRadius: 14, overflow: 'hidden', position: 'relative', cursor: 'pointer', background: 'linear-gradient(135deg, #2d3436 0%, #191c1d 50%, #0a0b0c 100%)' }}>
              <div style={{ position: 'absolute', inset: 0 }} />
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px 22px' }}>
                <span style={{ display: 'inline-flex', width: 'fit-content', padding: '3px 10px', borderRadius: 100, background: 'var(--err)', color: '#fff', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.4px', marginBottom: 8 }}><Zap size={9}/> Stock limite</span>
                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: '-.3px', lineHeight: 1.25, marginBottom: 5 }}>Gros Oeuvre<br />Livraison 24h</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)' }}>Beton, agglos, acier</div>
              </div>
            </div>
          </div>
        )}

        {/* Produits sponsorises */}
        {activeCat === 'all' && !search && !activeFournisseur && (
          <div style={{ marginBottom: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 800, letterSpacing: '-.3px' }}>Produits sponsorises</div>
              <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(245,158,11,.1)', color: '#F59E0B' }}>AD</span>
            </div>
            <div className="rg-4" style={{ gap: 10 }}>
              {MKT_ITEMS.filter(m => m.sponsorise).map(m => (
                <div key={m.id} onClick={() => { setDetail(m); setDetailQty(1) }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--surface-1)', border: '1px solid rgba(245,158,11,.15)', borderRadius: 10, cursor: 'pointer', transition: 'all .15s' }} onMouseOver={e => e.currentTarget.style.borderColor = '#F59E0B'} onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,.15)'}>
                  <img src={m.img} alt="" style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.nom}</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)' }}>{m.marque}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, marginTop: 2 }}>{m.prix}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Flash deals */}
        {activeCat === 'all' && !search && (
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-.3px', display: 'flex', alignItems: 'center', gap: 5 }}><Zap size={15}/> Ventes Flash <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--err)', background: 'rgba(220,38,38,.08)', padding: '3px 9px', borderRadius: 100, marginLeft: 4 }}>Offres limitees</span></div>
            </div>
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4 }}>
              {flashItems.map(m => (
                <div key={m.id} onClick={() => { setDetail(m); setDetailQty(1) }} style={{ flexShrink: 0, width: 170, background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'all .15s' }}>
                  <img src={m.img} alt="" style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display = 'none' }} />
                  <div style={{ padding: '10px 10px 12px' }}>
                    <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 100, background: 'var(--err)', color: '#fff', marginBottom: 5, display: 'inline-block' }}>-{m.flashRemise || m.remise}%</span>
                    <div style={{ fontSize: 11.5, fontWeight: 600, lineHeight: 1.35, marginBottom: 4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{m.nom}</div>
                    <div><span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--err)' }}>{m.prix}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sort bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 12, color: 'var(--t3)' }}><strong style={{ color: 'var(--tx)' }}>{sorted.length}</strong> produits</span>
          <select value={sort} onChange={e => setSort(e.target.value)} style={{ padding: '5px 10px', borderRadius: 8, border: '1px solid var(--border-card)', background: 'var(--surface-1)', fontSize: 12, fontFamily: 'var(--f)', color: 'var(--tx)', outline: 'none', cursor: 'pointer' }}>
            <option value="pertinence">Pertinence</option>
            <option value="prix-asc">Prix croissant</option>
            <option value="prix-desc">Prix decroissant</option>
            <option value="note">Mieux notes</option>
            <option value="avis">Plus d'avis</option>
          </select>
        </div>

        {/* Product grid */}
        <div className="rg-3" style={{ gap: 12 }}>
          {sorted.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ marginBottom: 12, opacity: .3, display: 'flex', justifyContent: 'center' }}><ShoppingCart size={32}/></div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>Aucun produit disponible</div>
              <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 16 }}>Les produits du marketplace apparaîtront ici dès qu'un fournisseur en publiera.</div>
            </div>
          )}
          {sorted.map(m => (
            <div key={m.id} onClick={() => { setDetail(m); setDetailQty(1) }} style={{ background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', transition: 'box-shadow .2s, transform .2s, border-color .2s' }} onMouseOver={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,.08)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--border)' }} onMouseOut={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}>
              <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--s2)' }}>
                <img src={m.img} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block', transition: 'transform .4s ease' }} onMouseOver={e => e.target.style.transform = 'scale(1.06)'} onMouseOut={e => e.target.style.transform = 'scale(1)'} onError={e => { e.target.style.display = 'none' }} />
                <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {m.remise > 0 && <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 100, background: 'var(--err)', color: '#fff', backdropFilter: 'blur(8px)' }}>-{m.remise}%</span>}
                </div>
                <span style={{ position: 'absolute', top: 8, right: 8, padding: '3px 8px', borderRadius: 100, fontSize: 8.5, fontWeight: 700, backdropFilter: 'blur(10px)', background: 'rgba(255,255,255,.85)', color: dispoColor(m.dispo) }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: dispoColor(m.dispo), display: 'inline-block', marginRight: 4, verticalAlign: 'middle' }} />{m.dispo}
                </span>
              </div>
              <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: 10, color: 'var(--tx)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.3px', marginBottom: 3 }}>{m.marque}</div>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '-.2px', lineHeight: 1.35, marginBottom: 8, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{m.nom}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 4 }}>
                  <span style={{ display: 'inline-flex', gap: 1, color: '#F59E0B' }}>{Array.from({length: Math.round(m.note)}, (_, i) => <Star key={i} size={11} fill="#F59E0B" strokeWidth={0}/>)}</span>
                  <span style={{ fontSize: 10, color: 'var(--t4)', marginLeft: 3 }}>({m.nb_avis})</span>
                </div>
                <div style={{ fontSize: 10, color: 'var(--ok)', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 3 }}><Check size={9}/> {m.livraison}</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)', marginTop: 'auto', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-.4px', lineHeight: 1 }}>{m.prix}</div>
                    <div style={{ fontSize: 9.5, color: 'var(--t4)', marginTop: 2 }}>{m.unit}</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); addToCart(m) }} style={{ width: 34, height: 34, borderRadius: 9, background: 'var(--tx)', color: '#fff', fontSize: 15, fontWeight: 700, fontFamily: 'var(--f)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform .12s' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>+</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* ── Cart drawer ── */}
      {showCart && (
        <>
        <div onClick={() => setShowCart(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.3)', zIndex: 1500 }} />
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 360, background: 'var(--surface-1)', borderLeft: '1px solid var(--border)', boxShadow: '0 0 40px rgba(0,0,0,.12)', zIndex: 1501, display: 'flex', flexDirection: 'column', animation: 'cartSlideIn .25s ease' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}><ShoppingCart size={15}/> Mon panier</span>
          <button onClick={() => setShowCart(false)} style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--s2)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'var(--t2)' }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cart.length === 0 && <div style={{ textAlign: 'center', padding: '40px 0', fontSize: 13, color: 'var(--t4)' }}>Votre panier est vide</div>}
          {cart.map(c => (
            <div key={c.id} style={{ display: 'flex', gap: 11, padding: 11, background: 'var(--s2)', border: '1px solid var(--border-card)', borderRadius: 10 }}>
              <img src={c.img} alt="" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nom}</div>
                <div style={{ fontSize: 10.5, color: 'var(--t3)' }}>{c.fournisseur}</div>
                <div style={{ fontSize: 13, fontWeight: 800, marginTop: 2 }}>{c.prix} {c.unit}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <button onClick={() => changeQty(c.id, -1)} style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--surface-1)', border: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontSize: 12, fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{c.qty}</span>
                  <button onClick={() => changeQty(c.id, 1)} style={{ width: 22, height: 22, borderRadius: 5, background: 'var(--surface-1)', border: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              </div>
              <span onClick={() => removeFromCart(c.id)} style={{ color: 'var(--t4)', cursor: 'pointer', fontSize: 13, alignSelf: 'flex-start' }}>×</span>
            </div>
          ))}
        </div>
        {cart.length > 0 && (
          <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--t2)' }}>Sous-total</span>
              <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-.4px' }}>{fmt(cartTotal)}</span>
            </div>
            <button onClick={() => { setShowCheckout(true); setPayMethod(null) }} style={{ width: '100%', padding: 11, borderRadius: 8, background: 'var(--tx)', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'var(--f)', border: 'none', cursor: 'pointer', marginBottom: 7 }}>Commander — {fmt(cartTotal)} →</button>
            <button onClick={() => { showToast && showToast('Devis multi-fournisseurs envoye'); setCart([]); setShowCart(false) }} style={{ width: '100%', padding: 9, borderRadius: 8, background: 'var(--s2)', color: 'var(--tx)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--f)', border: '1px solid var(--border-card)', cursor: 'pointer' }}>Demander un devis groupe</button>
          </div>
        )}
      </div>
      </>
      )}

      {/* ── Product detail modal ── */}
      {detail && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setDetail(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: '100%', maxWidth: 720, maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,.18)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 15, fontWeight: 700 }}>Detail produit</span>
              <button onClick={() => setDetail(null)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t3)' }}>×</button>
            </div>
            <div className="rg-2" style={{ minHeight: 420 }}>
              {/* Image */}
              <div style={{ background: 'var(--s2)', position: 'relative', overflow: 'hidden' }}>
                <img src={detail.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display = 'none' }} />
                {detail.remise > 0 && <span style={{ position: 'absolute', top: 12, left: 12, fontSize: 10, fontWeight: 800, padding: '3px 9px', borderRadius: 100, background: 'var(--err)', color: '#fff' }}>-{detail.remise}%</span>}
              </div>
              {/* Info */}
              <div style={{ padding: '22px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--tx)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px' }}>{detail.marque} · {detail.fournisseur}</div>
                <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: '-.4px', lineHeight: 1.25 }}>{detail.nom}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-flex', gap: 1, color: '#F59E0B' }}>{Array.from({length: Math.round(detail.note)}, (_, i) => <Star key={i} size={13} fill="#F59E0B" strokeWidth={0}/>)}</span>
                  <span style={{ fontSize: 11.5, color: 'var(--t3)' }}>{detail.nb_avis} avis</span>
                </div>
                <div style={{ height: 1, background: 'var(--border)' }} />
                <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.6px' }}>{detail.prix}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--t3)', marginLeft: 6 }}>{detail.unit}</span></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: dispoColor(detail.dispo), display: 'inline-block' }} />
                  <span style={{ color: dispoColor(detail.dispo), fontWeight: 600 }}>{detail.dispo}</span>
                  <span style={{ color: 'var(--t3)' }}>· {detail.livraison}</span>
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.65 }}>{detail.desc}</div>
                {/* Specs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, background: 'var(--s2)', borderRadius: 8, padding: '12px 14px' }}>
                  {[['Categorie', MKT_CATS.find(c => c.id === detail.cat)?.label || detail.cat], ['Fournisseur', detail.fournisseur], ['Marque', detail.marque], ['Disponibilite', detail.dispo], ['Livraison', detail.livraison]].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span style={{ color: 'var(--t3)' }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span></div>
                  ))}
                </div>
                {/* Qty */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 12, color: 'var(--t2)' }}>Qte :</span>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-card)', borderRadius: 8, overflow: 'hidden' }}>
                    <button onClick={() => setDetailQty(q => Math.max(1, q - 1))} style={{ width: 32, height: 32, background: 'var(--s2)', border: 'none', cursor: 'pointer', fontSize: 14 }}>−</button>
                    <span style={{ width: 36, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{detailQty}</span>
                    <button onClick={() => setDetailQty(q => q + 1)} style={{ width: 32, height: 32, background: 'var(--s2)', border: 'none', cursor: 'pointer', fontSize: 14 }}>+</button>
                  </div>
                </div>
                {/* CTA */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {detail.dispo !== 'Sur devis' && (
                    <button onClick={() => { addToCart(detail, detailQty); setDetail(null) }} style={{ flex: 1, padding: '10px 16px', borderRadius: 8, background: '#F59E0B', color: '#fff', fontSize: 13, fontWeight: 700, fontFamily: 'var(--f)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><ShoppingCart size={13}/> Ajouter au panier</button>
                  )}
                  <button onClick={() => { demanderDevis(detail); setDetail(null) }} style={{ flex: 1, padding: '10px 16px', borderRadius: 8, background: 'var(--s2)', color: 'var(--tx)', fontSize: 13, fontWeight: 700, fontFamily: 'var(--f)', border: '1px solid var(--border-card)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><ClipboardList size={13}/> Demander un devis</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Checkout modal ── */}
      {showCheckout && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setShowCheckout(false)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 520, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.2)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>Finaliser la commande</div>
                <div style={{ fontSize: 10, color: 'var(--t3)', fontFamily: 'monospace', marginTop: 2 }}>Ref: CMD-{new Date().getFullYear()}{String(new Date().getMonth() + 1).padStart(2, '0')}-{String(cmdCounter + 1).padStart(5, '0')}</div>
              </div>
              <button onClick={() => setShowCheckout(false)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t3)' }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Recapitulatif */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Recapitulatif ({cart.length} articles)</div>
                {cart.map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}>
                    <span style={{ color: 'var(--t2)' }}>{c.nom} x{c.qty}</span>
                    <span style={{ fontWeight: 700 }}>{fmt(c.prix_num * c.qty)}</span>
                  </div>
                ))}
              </div>

              {/* Livraison */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Livraison</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div onClick={() => setLivMode('retrait')} style={{ flex: 1, padding: '14px 14px', borderRadius: 10, border: livMode === 'retrait' ? '2px solid var(--tx)' : '1px solid var(--border-subtle)', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'center' }}><Store size={20}/></div>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>Retrait</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)' }}>Chez le fournisseur</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ok)', marginTop: 6 }}>Gratuit</div>
                  </div>
                  {HAS_LOGISTICS_PARTNER && <div onClick={() => setLivMode('livraison')} style={{ flex: 1, padding: '14px 14px', borderRadius: 10, border: livMode === 'livraison' ? '2px solid var(--tx)' : '1px solid var(--border-subtle)', cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'center' }}><Truck size={20}/></div>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>Livraison MEEREO</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)' }}>Partenaire logistique</div>
                    <div style={{ fontSize: 12, fontWeight: 800, marginTop: 6 }}>{fmt(calcLivraison(livKm, livKg))}</div>
                  </div>}
                </div>
                {livMode === 'livraison' && (
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Destination */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Livrer ou ?</div>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <div onClick={() => setLivDest('chantier')} style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: livDest === 'chantier' ? '2px solid var(--tx)' : '1px solid var(--border-subtle)', cursor: 'pointer', textAlign: 'center' }}>
                          <div style={{ fontSize: 16, marginBottom: 2, display: 'flex', justifyContent: 'center' }}><HardHat size={16}/></div>
                          <div style={{ fontSize: 11, fontWeight: 700 }}>Sur le chantier</div>
                        </div>
                        <div onClick={() => setLivDest('domicile')} style={{ flex: 1, padding: '10px 12px', borderRadius: 8, border: livDest === 'domicile' ? '2px solid var(--tx)' : '1px solid var(--border-subtle)', cursor: 'pointer', textAlign: 'center' }}>
                          <div style={{ fontSize: 16, marginBottom: 2, display: 'flex', justifyContent: 'center' }}><Home size={16}/></div>
                          <div style={{ fontSize: 11, fontWeight: 700 }}>A domicile</div>
                        </div>
                      </div>
                    </div>

                    {/* Projet ou adresse */}
                    {livDest === 'chantier' ? (
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t3)', marginBottom: 3 }}>Projet / Chantier</div>
                        <select value={livProjet} onChange={e => { setLivProjet(e.target.value); const p = (store.projects || []).find(x => x.nom === e.target.value); if (p?.adresse) setLivAdresse(p.adresse) }} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-card)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--f)', background: 'var(--s2)', color: 'var(--tx)' }}>
                          <option value="">Sélectionner un projet</option>
                          {(store.projects || []).map(p => <option key={p.id} value={p.nom}>{p.nom} — {p.adresse || p.client}</option>)}
                        </select>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t3)', marginBottom: 3 }}>Adresse de livraison</div>
                        <input value={livAdresse} onChange={e => setLivAdresse(e.target.value)} placeholder="Commune, quartier, rue, repere..." style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-card)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)' }} />
                      </div>
                    )}

                    {/* Carte GPS interactive */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t3)', marginBottom: 3 }}>Positionner sur la carte</div>
                      <div style={{ height: 160, borderRadius: 10, background: '#1a2332', position: 'relative', overflow: 'hidden', border: '1px solid var(--border-card)', cursor: 'crosshair' }}
                        onClick={e => { const rect = e.currentTarget.getBoundingClientRect(); setLivPin({ x: Math.round((e.clientX - rect.left) / rect.width * 100), y: Math.round((e.clientY - rect.top) / rect.height * 100) }) }}>
                        {/* Grid */}
                        {[0, 1, 2, 3, 4, 5].map(i => <div key={'h' + i} style={{ position: 'absolute', left: 0, right: 0, top: (i * 20) + '%', height: 1, background: 'rgba(255,255,255,.04)' }} />)}
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <div key={'v' + i} style={{ position: 'absolute', top: 0, bottom: 0, left: (i * 14.28) + '%', width: 1, background: 'rgba(255,255,255,.04)' }} />)}
                        {/* Roads */}
                        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                          <path d="M 0 80 Q 80 60 160 70 Q 280 85 400 50 L 500 55" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="3" />
                          <path d="M 120 0 Q 130 50 140 90 L 150 160" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="2" />
                          <path d="M 300 0 Q 290 60 310 100 L 320 160" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="2" />
                          <path d="M 0 40 Q 100 35 200 45 Q 350 55 500 30" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="2" />
                        </svg>
                        {/* Zone labels */}
                        <div style={{ position: 'absolute', top: 8, left: 10, fontSize: 8, color: 'rgba(255,255,255,.2)', fontWeight: 600 }}>Cocody</div>
                        <div style={{ position: 'absolute', top: 8, right: 10, fontSize: 8, color: 'rgba(255,255,255,.2)', fontWeight: 600 }}>Plateau</div>
                        <div style={{ position: 'absolute', bottom: 8, left: 10, fontSize: 8, color: 'rgba(255,255,255,.2)', fontWeight: 600 }}>Marcory</div>
                        <div style={{ position: 'absolute', bottom: 8, right: 10, fontSize: 8, color: 'rgba(255,255,255,.2)', fontWeight: 600 }}>Treichville</div>
                        <div style={{ position: 'absolute', top: '40%', left: '40%', fontSize: 8, color: 'rgba(255,255,255,.15)', fontWeight: 600 }}>Lagune Ebrie</div>
                        {/* Pin */}
                        <div style={{ position: 'absolute', left: livPin.x + '%', top: livPin.y + '%', transform: 'translate(-50%, -100%)', transition: 'left .15s, top .15s' }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50% 50% 50% 0', background: '#DC2626', transform: 'rotate(-45deg)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(220,38,38,.4)' }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', transform: 'rotate(45deg)' }} />
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: 9, color: 'var(--t4)', marginTop: 4 }}>Cliquez sur la carte pour positionner le point de livraison</div>
                    </div>

                    {/* Contact */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t3)', marginBottom: 3 }}>Telephone de contact *</div>
                      <input value={livTel} onChange={e => setLivTel(e.target.value)} placeholder="+225 07 00 00 00" style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-card)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)' }} />
                      <div style={{ fontSize: 9, color: 'var(--t4)', marginTop: 3 }}>Le livreur vous contactera a ce numero</div>
                    </div>

                    {/* Distance & poids */}
                    <div className="modal-row" style={{ gap: 8 }}>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t3)', marginBottom: 3 }}>Distance (km)</div>
                        <input type="number" value={livKm} onChange={e => setLivKm(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-card)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t3)', marginBottom: 3 }}>Poids estime (kg)</div>
                        <input type="number" value={livKg} onChange={e => setLivKg(parseInt(e.target.value) || 0)} style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border-card)', borderRadius: 8, fontSize: 12, fontFamily: 'var(--f)', background: 'var(--s2)', outline: 'none', color: 'var(--tx)' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Rail recommandé */}
              {(() => {
                const rec = recommendRail(grandTotal, 'commande', { terrain: livMode === 'livraison' })
                const meta = RAIL_META[rec.rail]
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: 'var(--s2)', borderRadius: 8, marginBottom: 10, border: '1px solid var(--border-card)' }}>
                    {(() => { const RI = RAIL_ICONS[rec.rail]; return RI ? <RI size={14}/> : <span style={{ fontSize: 14 }}>{meta?.icon}</span> })()}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--tx)' }}>Recommandé : {meta?.label}</div>
                      <div style={{ fontSize: 9, color: 'var(--t4)' }}>{rec.reason}</div>
                    </div>
                  </div>
                )
              })()}

              {/* Moyen de paiement */}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Moyen de paiement</div>
                <div className="rg-3" style={{ gap: 6 }}>
                  {PAY_PROVIDERS.filter(p => p.statut === 'Vérifié').map(p => (
                    <div key={p.id} onClick={() => setPayMethod(p.id)} style={{ padding: '10px 8px', borderRadius: 8, border: payMethod === p.id ? '2px solid var(--tx)' : '1px solid var(--border-subtle)', cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ fontSize: 18, marginBottom: 2 }}>{p.logo}</div>
                      <div style={{ fontSize: 10, fontWeight: 700 }}>{p.short || p.name}</div>
                    </div>
                  ))}
                  <div onClick={() => setPayMethod('cash')} style={{ padding: '10px 8px', borderRadius: 8, border: payMethod === 'cash' ? '2px solid var(--tx)' : '1px solid var(--border-subtle)', cursor: 'pointer', textAlign: 'center' }}>
                      <div style={{ marginBottom: 2, display: 'flex', justifyContent: 'center' }}><Banknote size={18}/></div>
                    <div style={{ fontSize: 10, fontWeight: 700 }}>Cash</div>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div style={{ padding: '14px 16px', background: 'linear-gradient(145deg,#0f1011,#2a2c2d)', borderRadius: 12, color: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: 'rgba(255,255,255,.5)' }}>Sous-total</span>
                  <span>{fmt(cartTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                  <span style={{ color: 'rgba(255,255,255,.5)' }}>Commission MEEREO (5%)</span>
                  <span>{fmt(commissionAmount)}</span>
                </div>
                {livMode === 'livraison' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                    <span style={{ color: 'rgba(255,255,255,.5)' }}>Livraison ({livKm}km, {livKg}kg)</span>
                    <span>{fmt(livraisonAmount)}</span>
                  </div>
                )}
                <div style={{ borderTop: '1px solid rgba(255,255,255,.15)', paddingTop: 8, marginTop: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>Total</span>
                  <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-1px' }}>{fmt(grandTotal)}</span>
                </div>
              </div>
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
              <button onClick={passerCommande} disabled={!payMethod} style={{ width: '100%', padding: '13px 16px', borderRadius: 10, background: payMethod ? 'var(--tx)' : 'var(--s3)', color: payMethod ? '#fff' : 'var(--t4)', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 14 }}>
                {payMethod ? (HAS_LOGISTICS_PARTNER ? 'Confirmer et payer ' : 'Confirmer la commande — ') + fmt(grandTotal) : 'Choisissez un moyen de paiement'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Devis notifications ── */}
      {devisRequests.filter(d => d.status === 'responded').length > 0 && !showCheckout && !detail && (
        <div style={{ position: 'fixed', bottom: 90, right: 24, zIndex: 100, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {devisRequests.filter(d => d.status === 'responded').map(d => (
            <div key={d.itemId} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', boxShadow: '0 8px 32px rgba(0,0,0,.12)', width: 320, animation: 'modalIn .2s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 2 }}>Devis recu !</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)' }}><span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--t2)' }}>{d.ref}</span> · {d.fournisseur}</div>
                </div>
                <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: 'rgba(52,199,89,.08)', color: 'var(--ok)' }}>Nouveau</span>
              </div>
              <div style={{ fontSize: 11, marginBottom: 6 }}>{d.itemNom}</div>
              <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 10 }}>{fmt(d.prixPropose)}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => accepterDevis(d.itemId)} style={{ flex: 1, padding: '8px 12px', borderRadius: 8, background: 'var(--tx)', color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'var(--f)', border: 'none', cursor: 'pointer' }}>Accepter</button>
                <button onClick={() => { const newPrix = prompt('Votre contre-proposition (FCFA):'); if (newPrix) { showToast && showToast('Contre-proposition envoyee'); setDevisRequests(prev => prev.map(x => x.itemId === d.itemId ? { ...x, status: 'pending' } : x)); setTimeout(() => { setDevisRequests(prev => prev.map(x => x.itemId === d.itemId && x.status === 'pending' ? { ...x, status: 'responded', prixPropose: parseInt(newPrix) || d.prixPropose } : x)); refresh(n => n + 1) }, 2000) } }} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--s2)', color: 'var(--tx)', fontSize: 11, fontWeight: 700, fontFamily: 'var(--f)', border: '1px solid var(--border-card)', cursor: 'pointer' }}>Contre-proposer</button>
                <button onClick={() => { setDevisRequests(prev => prev.filter(x => x.itemId !== d.itemId)); showToast && showToast('Devis refuse') }} style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(220,38,38,.06)', color: 'var(--err)', fontSize: 11, fontWeight: 700, fontFamily: 'var(--f)', border: '1px solid rgba(220,38,38,.15)', cursor: 'pointer' }}>Refuser</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal: Mes commandes ── */}
      {showCommandes && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setShowCommandes(false)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 580, maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.2)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 24px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>Mes commandes</div>
                <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{commandes.length} commandes · {commandes.filter(c => c.step < 5).length} en cours</div>
              </div>
              <button onClick={() => setShowCommandes(false)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t3)' }}>×</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 24px' }}>
              {commandes.map(cmd => {
                const currentStep = TRACKING_STEPS.find(s => s.id === cmd.step) || TRACKING_STEPS[0]
                const isActive = cmd.step < 5
                return (
                  <div key={cmd.id} style={{ padding: '16px 18px', background: isActive ? 'var(--surface-1)' : 'var(--s2)', border: '1px solid ' + (isActive ? 'var(--border)' : 'var(--border-subtle)'), borderRadius: 12, marginBottom: 10, cursor: cmd.livMode === 'livraison' && isActive ? 'pointer' : 'default' }} onClick={() => cmd.livMode === 'livraison' && isActive && setShowTracking(cmd)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 20 }}>{currentStep.icon}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{currentStep.label}</div>
                          <div style={{ fontSize: 10, color: 'var(--t3)' }}><span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--t2)' }}>{cmd.ref}</span> · {formatDateFR(cmd.date)} · {cmd.fournisseur}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 800 }}>{fmt(cmd.total)}</div>
                        <div style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 100, background: isActive ? 'rgba(245,158,11,.08)' : 'rgba(52,199,89,.08)', color: isActive ? '#F59E0B' : 'var(--ok)', display: 'inline-block', marginTop: 2 }}>{isActive ? 'En cours' : 'Livrée'}</div>
                      </div>
                    </div>
                    {/* Mini progress */}
                    <div style={{ display: 'flex', gap: 3 }}>
                      {TRACKING_STEPS.map(s => (
                        <div key={s.id} style={{ flex: 1, height: 3, borderRadius: 100, background: s.id <= cmd.step ? 'var(--tx)' : 'var(--s3)', transition: 'background .3s' }} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, fontSize: 10, color: 'var(--t4)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>{cmd.items.length} article{cmd.items.length > 1 ? 's' : ''} · {cmd.livMode === 'livraison' ? <><Truck size={9}/> Livraison</> : <><Store size={9}/> Retrait</>}</span>
                      {cmd.livMode === 'livraison' && isActive && <span style={{ color: '#F59E0B', fontWeight: 600 }}>Suivre en direct →</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Tracking GPS ── */}
      {showTracking && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2100, background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setShowTracking(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 600, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.25)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            {/* Header dark */}
            <div style={{ padding: '20px 24px', background: 'linear-gradient(145deg,#0f1011,#2a2c2d)', color: '#fff', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>Suivi en temps reel</div>
                  <div style={{ fontSize: 17, fontWeight: 800 }}>{showTracking.ref}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    {showTracking.refLiv && <span style={{ fontSize: 9, fontFamily: 'monospace', padding: '2px 7px', borderRadius: 4, background: 'rgba(245,158,11,.15)', color: '#F59E0B' }}>{showTracking.refLiv}</span>}
                    <span style={{ fontSize: 9, fontFamily: 'monospace', padding: '2px 7px', borderRadius: 4, background: 'rgba(255,255,255,.1)', color: 'rgba(255,255,255,.6)' }}>{showTracking.refFac}</span>
                  </div>
                </div>
                <button onClick={() => setShowTracking(null)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,.1)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'rgba(255,255,255,.6)' }}>×</button>
              </div>
              {/* GPS Map simulation */}
              <div style={{ height: 160, borderRadius: 12, background: '#1a2332', position: 'relative', overflow: 'hidden', border: '1px solid rgba(255,255,255,.08)' }}>
                {/* Grid lines */}
                {[0, 1, 2, 3, 4].map(i => <div key={'h' + i} style={{ position: 'absolute', left: 0, right: 0, top: (i * 25) + '%', height: 1, background: 'rgba(255,255,255,.04)' }} />)}
                {[0, 1, 2, 3, 4, 5, 6].map(i => <div key={'v' + i} style={{ position: 'absolute', top: 0, bottom: 0, left: (i * 16.6) + '%', width: 1, background: 'rgba(255,255,255,.04)' }} />)}
                {/* Route line */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                  <path d="M 60 130 Q 150 60 280 80 Q 400 100 520 50" fill="none" stroke="rgba(245,158,11,.3)" strokeWidth="2" strokeDasharray="6,4" />
                  <path d={`M 60 130 Q 150 60 ${60 + (showTracking.step / 5) * 460} ${130 - (showTracking.step / 5) * 80}`} fill="none" stroke="#F59E0B" strokeWidth="3" />
                </svg>
                {/* Origin */}
                <div style={{ position: 'absolute', left: 50, top: 120, width: 20, height: 20, borderRadius: '50%', background: 'var(--ok)', border: '3px solid #1a2332', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Package size={9}/></div>
                {/* Destination */}
                <div style={{ position: 'absolute', right: 60, top: 35, width: 20, height: 20, borderRadius: '50%', background: '#fff', border: '3px solid #1a2332', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a2332' }}><Home size={9}/></div>
                {/* Vehicle position */}
                <div style={{ position: 'absolute', left: `${10 + (showTracking.step / 5) * 75}%`, top: `${82 - (showTracking.step / 5) * 55}%`, transform: 'translate(-50%,-50%)', width: 32, height: 32, borderRadius: '50%', background: '#F59E0B', border: '3px solid #1a2332', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', boxShadow: '0 0 20px rgba(245,158,11,.5)', animation: 'kaibreathe 2s ease-in-out infinite', transition: 'left 1s, top 1s' }}><Truck size={14}/></div>
                {/* Labels */}
                <div style={{ position: 'absolute', left: 10, bottom: 8, fontSize: 9, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>Fournisseur</div>
                <div style={{ position: 'absolute', right: 10, top: 8, fontSize: 9, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>Votre adresse</div>
              </div>
            </div>

            {/* Tracking steps */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
                {TRACKING_STEPS.map((s, i) => {
                  const done = s.id <= showTracking.step
                  const current = s.id === showTracking.step
                  return (
                    <div key={s.id} style={{ display: 'flex', gap: 14 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: done ? 'var(--tx)' : 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: done ? '#fff' : 'var(--t4)', boxShadow: current ? '0 0 0 4px rgba(0,0,0,.08)' : 'none', transition: 'all .3s' }}>{done ? <Check size={14}/> : s.icon}</div>
                        {i < TRACKING_STEPS.length - 1 && <div style={{ width: 2, height: 32, background: done ? 'var(--tx)' : 'var(--s3)', transition: 'background .3s' }} />}
                      </div>
                      <div style={{ paddingBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: done || current ? 700 : 500, color: done || current ? 'var(--tx)' : 'var(--t4)' }}>{s.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--t3)' }}>{s.desc}</div>
                        {current && <div style={{ fontSize: 10, color: '#F59E0B', fontWeight: 600, marginTop: 3 }}>● En cours...</div>}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Partenaire logistique */}
              {HAS_LOGISTICS_PARTNER && showTracking.partner && (
                <div style={{ padding: '14px 16px', background: 'var(--s2)', borderRadius: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Partenaire logistique</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}><Truck size={16}/></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{showTracking.partner.nom}</div>
                      <div style={{ fontSize: 11, color: 'var(--t3)' }}>{showTracking.partner.chauffeur} · {showTracking.partner.vehicule}</div>
                      <div style={{ fontSize: 11, color: 'var(--t3)' }}>{showTracking.partner.plaque}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); showToast && showToast('Appel en cours...') }} style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--ok)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><Phone size={14}/></button>
                  </div>
                </div>
              )}

              {/* Articles */}
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Articles ({showTracking.items.length})</div>
              {showTracking.items.map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12, borderBottom: '1px solid var(--border)' }}>
                  <span>{it.nom} x{it.qty}</span>
                  <span style={{ fontWeight: 700 }}>{fmt(it.prix_num * it.qty)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 14, fontWeight: 800 }}>
                <span>Total</span>
                <span>{fmt(showTracking.total)}</span>
              </div>
            </div>

            {/* Footer */}
            {showTracking.step < 5 && (
              <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexShrink: 0 }}>
                <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => showToast && showToast('Support contacte')}>Contacter le support</button>
                <button style={{ flex: 1, padding: '10px 16px', borderRadius: 10, background: 'var(--tx)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 13 }} onClick={() => { setCommandes(prev => prev.map(c => c.id === showTracking.id ? { ...c, step: 5 } : c)); setShowTracking(null); refresh(n => n + 1); showToast && showToast('Livraison confirmee') }}>Confirmer la reception</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
