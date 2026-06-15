import { useState, useMemo, useEffect } from 'react'
import { Store, Package, Settings, ShoppingCart, Truck, Wallet, BarChart2, Camera, Check, Smartphone } from 'lucide-react'
import MoneyInput from '../../components/shared/MoneyInput'
import { useMeereo } from '../../hooks/useMeereoStore'
import { api } from '../../services/api/client'
import Modal from '../../components/shared/Modal'
import ModalConfirm from '../../components/shared/ModalConfirm'
import DeleteAccountSection from '../../components/shared/DeleteAccountSection'
import { lazy, Suspense } from 'react'
const MarketplacePage = lazy(() => import('../cockpit/MarketplacePage'))
const BoursePage = lazy(() => import('../cockpit/BoursePage'))
import KaiAssistant from '../../components/shared/KaiAssistant'
import KaiQuota from '../../components/shared/KaiQuota'
import NotifBell from '../../components/shared/NotifBell'
import { formatDateFR } from '../../utils/helpers'
import { useDevise } from '../../hooks/useDevise'
import UserMenu from '../../components/shared/UserMenu'
import KaiSubscription from '../../components/shared/KaiSubscription'
import MeereoLogo from '../../components/shared/MeereoLogo'
import useUserIdentity from '../../hooks/useUserIdentity'
import { MKT_CATS } from '../../data/marketplace'
import './fournisseur.css'

const VIEWS = ['dashboard', 'catalogue', 'bourse', 'marketplace', 'commandes', 'paiements', 'stats', 'parametres']
const VIEW_LABELS = {
  dashboard: 'Accueil', catalogue: 'Mes produits', bourse: 'Appels d\'offres', marketplace: 'Boutique',
  commandes: 'Commandes', paiements: 'Paiements', stats: 'Performance', parametres: 'Paramètres'
}
const VIEW_ICONS = {
  dashboard: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  catalogue: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  bourse: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>,
  marketplace: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  commandes: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  paiements: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  stats: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  parametres: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
}
const VIEW_GROUPS = {
  dashboard: 'Mon activité', catalogue: 'Mon activité', bourse: 'Mon activité',
  marketplace: 'Ventes', commandes: 'Ventes',
  paiements: 'Finance', stats: 'Finance',
  parametres: 'Système',
}

// fmt supprimé — utiliser fmtMoney() de useDevise() partout

// Demo seller orders
const DEMO_ORDERS = []

const DELIVERY_STEPS = ['Commande confirmée', 'En préparation', 'Remise au transport', 'En cours de livraison', 'Livrée']
const PICKUP_STEPS = ['Commande confirmée', 'En préparation', 'Prête pour retrait', 'Récupérée par le client', 'Terminée']


const STATUS_LABELS = { pending: 'En attente', accepted: 'Acceptée', rejected: 'Refusée', preparing: 'En préparation', shipped: 'Expédiée', delivered: 'Livrée', completed: 'Terminée', cancelled: 'Annulée' }
const STATUS_COLORS = { pending: 'var(--wrn)', accepted: 'var(--color-info)', delivered: 'var(--ok)', completed: 'var(--ok)', rejected: 'var(--err)', cancelled: 'var(--err)', preparing: 'var(--color-info)', shipped: 'var(--color-info)' }

export default function FournisseurApp() {
  const [view, setView] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { store, showToast, updateStore, addProduct } = useMeereo()
  const { format: fmtMoney } = useDevise()

  // Navigation depuis notifications / UserMenu
  useEffect(() => {
    const handler = (e) => setView(e.detail)
    window.addEventListener('meereo-navigate', handler)
    return () => window.removeEventListener('meereo-navigate', handler)
  }, [])

  const uid = useUserIdentity()
  const ob = store.onboardingData || {}
  const user = store.user || {}
  const products = store.products || []
  const entreprise = uid.displayName || ''
  const initials = uid.initials || ''
  const categories = ob.categories || []
  const zones = ob.zones || []

  // Derived product metrics
  const activeProducts = products.filter(p => p.status !== 'archived')
  const sponsoredProducts = products.filter(p => p.sponsored)
  const flashProducts = products.filter(p => p.flash)
  const visibleMarketplace = useMemo(() => {
    // Visibility logic: sponsored first, then flash, then recent — max 20
    const sorted = [...activeProducts].sort((a, b) => {
      if (a.sponsored && !b.sponsored) return -1
      if (!a.sponsored && b.sponsored) return 1
      if (a.flash && !b.flash) return -1
      if (!a.flash && b.flash) return 1
      return 0
    })
    return sorted.slice(0, 20)
  }, [activeProducts])

  // Seller orders — chargées depuis le backend (PostgreSQL)
  const [sellerOrders, setSellerOrders] = useState([])
  const [ordersLoaded, setOrdersLoaded] = useState(false)
  useEffect(() => {
    api.commandes.getAll()
      .then(orders => {
        if (Array.isArray(orders)) setSellerOrders(orders.map(o => ({
          id: o.id, ref: o.ref,
          buyer: o.buyer?.name || o.buyer?.company || 'Client',
          fournisseur: o.fournisseur || '',
          items: Array.isArray(o.items) ? o.items : [],
          total: o.total || 0,
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR') : 'Récent',
          statut: o.statut === 'confirmee' ? 'pending' : o.statut,
          livMode: o.livMode || 'retrait',
          step: o.step || 1,
          address: o.address || '',
          paymentMethod: o.paymentMethod || '',
        })))
        setOrdersLoaded(true)
      })
      .catch(() => setOrdersLoaded(true))
  }, [])

  const sellerPayments = sellerOrders.filter(o => o.statut === 'completed' || o.statut === 'delivered')
  const pendingOrders = sellerOrders.filter(o => o.statut === 'pending')
  const caTotal = sellerPayments.reduce((s, o) => s + (o.total || 0), 0)

  // ═══ MODALS STATE ═══
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [showOrderDetail, setShowOrderDetail] = useState(null)
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState(null) // product id
  const [showSponsorModal, setShowSponsorModal] = useState(null) // product id
  const [sponsorDuration, setSponsorDuration] = useState('72h')
  const [showFlashModal, setShowFlashModal] = useState(null) // product id
  const [flashPrice, setFlashPrice] = useState('')
  const [flashDuration, setFlashDuration] = useState('24h')
  const [flashStock, setFlashStock] = useState('')
  const emptyProd = { name: '', category: '', price: '', unit: 'unité', description: '', stock: '', imageFile: null, imageUrl: '', sponsored: false, flash: false, flashPrice: '', flashDuration: '24h', isPublished: true }
  const [newProd, setNewProd] = useState(emptyProd)
  const [prodSaving, setProdSaving] = useState(false)
  const [catalogFilter, setCatalogFilter] = useState('all') // all | active | sponsored | flash
  const [paramTab, setParamTab] = useState('entreprise')
  const [orderFilter, setOrderFilter] = useState('all')
  const [notifPrefs, setNotifPrefs] = useState([true, true, true, false, false])
  const [fPwd, setFPwd] = useState({ current: '', nouveau: '', confirm: '' })
  const [fEntreprise, setFEntreprise] = useState({ nom: ob.entreprise || '', email: ob.email || '', tel: ob.tel || '', ville: ob.ville || '' })

  // Charger les produits depuis PostgreSQL au montage (source de vérité partagée)
  useEffect(() => {
    api.products.getMine()
      .then(backendProds => {
        if (!Array.isArray(backendProds) || backendProds.length === 0) return
        updateStore(prev => {
          // Garder les produits locaux sans ID backend (créés offline)
          const backendIds = new Set(backendProds.map(p => p.id))
          const localOnly = (prev.products || []).filter(p => String(p.id).startsWith('prod_') && !backendIds.has(p.id))
          return { ...prev, products: [...backendProds, ...localOnly] }
        })
      })
      .catch(() => {}) // silencieux si backend KO
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync fEntreprise when onboardingData changes (e.g. after save)
  useEffect(() => {
    setFEntreprise({ nom: ob.entreprise || '', email: ob.email || '', tel: ob.tel || '', ville: ob.ville || '' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.onboardingData])

  // ═══ HANDLERS ═══
  const handleImageUpload = (e, setter) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Show preview immediately, then upload to MinIO
    const reader = new FileReader()
    reader.onload = async (ev) => {
      const base64 = ev.target.result
      setter(p => ({ ...p, imageFile: file, imageUrl: base64, photoUrl: base64 }))
      try { const { uploadFile } = await import('../../utils/upload'); const url = await uploadFile(file, 'products', file.name); setter(p => ({ ...p, imageUrl: url, photoUrl: url })) } catch(err) { console.warn('Upload fallback:', err) }
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProduct = () => {
    if (!newProd.name.trim()) return
    setProdSaving(true)
    const prod = {
      name: newProd.name, category: newProd.category, price: newProd.price, unit: newProd.unit,
      description: newProd.description, stock: parseInt(newProd.stock) || 0,
      photoUrl: newProd.imageUrl || newProd.photoUrl || '',
      sponsored: newProd.sponsored, flash: newProd.flash,
      flashPrice: newProd.flash ? newProd.flashPrice : null,
      flashDuration: newProd.flash ? newProd.flashDuration : null,
      status: 'active', sellerId: store.user?.id || 'seller_default',
      source: 'fournisseur', marketplace: true,
      isPublished: newProd.isPublished !== false,
    }
    addProduct(prod)
    setTimeout(() => {
      setProdSaving(false)
      setShowAddProduct(false)
      setNewProd(emptyProd)
    }, 300)
  }

  const handleEditProduct = () => {
    if (!editProduct) return
    updateStore(prev => ({
      ...prev,
      products: (prev.products || []).map(p => p.id === editProduct.id ? { ...p, ...editProduct } : p)
    }))
    api.products.update(editProduct.id, {
      name: editProduct.name, category: editProduct.category, price: editProduct.price,
      unit: editProduct.unit, description: editProduct.description, photoUrl: editProduct.photoUrl,
    }).catch(e => console.warn('[editProduct] sync failed:', e.message))
    showToast('Produit mis à jour', 'green')
    setEditProduct(null)
  }

  const handleDeleteProduct = (id) => {
    updateStore(prev => ({ ...prev, products: (prev.products || []).filter(p => p.id !== id) }))
    api.products.delete(id).catch(e => console.warn('[deleteProduct] sync failed:', e.message))
    showToast('Produit supprime')
  }

  const handleToggleStatus = (id, field) => {
    updateStore(prev => ({
      ...prev,
      products: (prev.products || []).map(p => p.id === id ? { ...p, [field]: !p[field] } : p)
    }))
    const product = (store.products || []).find(p => p.id === id)
    if (product) {
      api.products.update(id, { [field]: !product[field] }).catch(e => console.warn('[toggleProduct] sync failed:', e.message))
    }
  }

  const handleSponsor = () => {
    if (!showSponsorModal) return
    updateStore(prev => ({
      ...prev,
      products: (prev.products || []).map(p => p.id === showSponsorModal ? { ...p, sponsored: true, sponsorDuration: sponsorDuration, sponsoredAt: new Date().toISOString() } : p)
    }))
    showToast('Produit sponsorise — visibilite boostee', 'green')
    setShowSponsorModal(null)
  }

  const handleFlash = () => {
    if (!showFlashModal) return
    updateStore(prev => ({
      ...prev,
      products: (prev.products || []).map(p => p.id === showFlashModal ? { ...p, flash: true, flashPrice: parseFloat(flashPrice) || p.price, flashDuration, flashStock: parseInt(flashStock) || 0, flashAt: new Date().toISOString() } : p)
    }))
    showToast('Offre flash activee', 'green')
    setShowFlashModal(null)
    setFlashPrice(''); setFlashDuration('24h'); setFlashStock('')
  }

  const handleOrderAction = (orderId, newStatus) => {
    // Mapper statut fournisseur → statut backend (step)
    const stepMap = { pending: 1, accepted: 1, preparing: 2, shipped: 3, delivered: 5, completed: 5, cancelled: 1, rejected: 1 }
    const step = stepMap[newStatus] || 1
    api.commandes.update(orderId, { statut: newStatus, step }).catch(e => console.warn('[order update]', e.message))
    setSellerOrders(prev => prev.map(o => o.id === orderId ? { ...o, statut: newStatus, step } : o))
    showToast('Commande ' + (STATUS_LABELS[newStatus] || newStatus).toLowerCase(), newStatus === 'rejected' || newStatus === 'cancelled' ? 'orange' : 'green')
    setShowOrderDetail(null)
  }

  // Filtered catalog
  const filteredProducts = catalogFilter === 'all' ? activeProducts
    : catalogFilter === 'sponsored' ? sponsoredProducts
    : catalogFilter === 'flash' ? flashProducts
    : activeProducts

  return (
    <div className="fournisseur-layout">
      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.42)', zIndex: 199, backdropFilter: 'blur(2px)' }} onClick={() => setSidebarOpen(false)} />}
      <aside className={`fourni-sb${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="fourni-sb-logo">
          <MeereoLogo size={28} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 300, letterSpacing: 3 }}>MEEREO</div>
            <div style={{ fontSize: 8, color: 'var(--t3)', letterSpacing: '.07em', textTransform: 'uppercase', marginTop: 1 }}>Espace Fournisseur</div>
          </div>
        </div>

        {/* Info card */}
        <div style={{ margin: '8px 10px', padding: '10px 12px', background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Marketplace</div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.5px' }}>{visibleMarketplace.length}</div>
          <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>produit{visibleMarketplace.length > 1 ? 's' : ''} visibles</div>
          {sponsoredProducts.length > 0 && <div style={{ fontSize: 9, color: 'var(--ok)', marginTop: 3 }}>{sponsoredProducts.length} sponsorise{sponsoredProducts.length > 1 ? 's' : ''}</div>}
        </div>

        <nav className="fourni-sb-nav">
          <div className="fourni-sb-cat">Activité</div>
          {['dashboard', 'bourse'].map(v => (
            <button key={v} className={`fourni-ni ${view === v ? 'on' : ''}`} onClick={() => { setView(v); setSidebarOpen(false) }}>
              <span style={{ color: { dashboard:'#191c1d', catalogue:'#0891B2', bourse:'#DC2626', marketplace:'#EA580C', commandes:'#F59E0B', paiements:'#16A34A', stats:'#7C3AED', parametres:'#6B7280' }[v] || '#6B7280' }}>{VIEW_ICONS[v]}</span> {VIEW_LABELS[v]}
            </button>
          ))}
          <div className="fourni-sb-cat">Marketplace</div>
          {['catalogue', 'marketplace', 'commandes'].map(v => (
            <button key={v} className={`fourni-ni ${view === v ? 'on' : ''}`} onClick={() => { setView(v); setSidebarOpen(false) }}>
              <span style={{ color: { dashboard:'#191c1d', catalogue:'#0891B2', bourse:'#DC2626', marketplace:'#EA580C', commandes:'#F59E0B', paiements:'#16A34A', stats:'#7C3AED', parametres:'#6B7280' }[v] || '#6B7280' }}>{VIEW_ICONS[v]}</span> {VIEW_LABELS[v]}
              {v === 'catalogue' && products.length > 0 && <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: 'rgba(52,199,89,.1)', color: 'var(--ok)' }}>{products.length}</span>}
              {v === 'marketplace' && visibleMarketplace.length > 0 && <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: 'rgba(0,0,0,.06)', color: 'var(--tx)' }}>{visibleMarketplace.length}</span>}
              {v === 'commandes' && pendingOrders.length > 0 && <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: 'rgba(224,123,0,.1)', color: 'var(--wrn)' }}>{pendingOrders.length}</span>}
            </button>
          ))}
          <div className="fourni-sb-cat">Finance</div>
          {['paiements', 'stats'].map(v => (
            <button key={v} className={`fourni-ni ${view === v ? 'on' : ''}`} onClick={() => { setView(v); setSidebarOpen(false) }}>
              <span style={{ color: { dashboard:'#191c1d', catalogue:'#0891B2', bourse:'#DC2626', marketplace:'#EA580C', commandes:'#F59E0B', paiements:'#16A34A', stats:'#7C3AED', parametres:'#6B7280' }[v] || '#6B7280' }}>{VIEW_ICONS[v]}</span> {VIEW_LABELS[v]}
            </button>
          ))}
          <div className="fourni-sb-cat">Compte</div>
          {['parametres'].map(v => (
            <button key={v} className={`fourni-ni ${view === v ? 'on' : ''}`} onClick={() => { setView(v); setSidebarOpen(false) }}>
              <span style={{ color: { dashboard:'#191c1d', catalogue:'#0891B2', bourse:'#DC2626', marketplace:'#EA580C', commandes:'#F59E0B', paiements:'#16A34A', stats:'#7C3AED', parametres:'#6B7280' }[v] || '#6B7280' }}>{VIEW_ICONS[v]}</span> {VIEW_LABELS[v]}
            </button>
          ))}
        </nav>

        {/* KAI Quota — bottom-left, meme position que cockpit */}
        <div style={{ padding: '0 10px 8px' }}><KaiQuota role="fournisseur" /></div>
        <div className="fourni-sb-foot">
          {uid.photo
            ? <img src={uid.photo} alt="" style={{ width: 26, height: 26, borderRadius: 6, objectFit: 'contain' }} />
            : <div className="fourni-sb-av">{initials}</div>
          }
          <div>
            {entreprise && <div style={{ fontSize: 12, fontWeight: 600 }}>{entreprise}</div>}
            <div style={{ fontSize: 10, color: 'var(--t3)' }}>{[uid.city, categories.length > 0 ? categories.length + ' catégorie' + (categories.length > 1 ? 's' : '') : ''].filter(Boolean).join(' · ') || uid.roleLabel || ''}</div>
          </div>
        </div>
      </aside>

      <main className="fourni-page">
        {/* Header — sticky, toujours visible */}
        <div style={{ padding: '0 24px', height: 52, maxWidth: 1440, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="topbar-hamburger" onClick={() => setSidebarOpen(true)} aria-label="Menu">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', letterSpacing: '-.01em' }}>{VIEW_LABELS[view]}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <NotifBell />
            <UserMenu onNavigate={setView} />
          </div>
        </div>

        {/* Marketplace — wrapper avec padding pour que le breakout du composant fonctionne */}
        {view === 'bourse' && (
          <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', opacity: .4 }}><div style={{ width: 24, height: 24, border: '2.5px solid var(--border)', borderTopColor: 'var(--tx)', borderRadius: '50%', animation: 'spin .6s linear infinite' }} /></div>}>
            <div style={{ padding: '28px 36px 80px' }}>
              <BoursePage showToast={showToast} />
            </div>
          </Suspense>
        )}

        {view === 'marketplace' && (
          <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', opacity: .4 }}><div style={{ width: 24, height: 24, border: '2.5px solid var(--border)', borderTopColor: 'var(--tx)', borderRadius: '50%', animation: 'spin .6s linear infinite' }} /></div>}>
            <div style={{ padding: '28px 36px 80px' }}>
              <MarketplacePage showToast={showToast} />
            </div>
          </Suspense>
        )}

        {/* Autres vues — dans fourni-pi */}
        {view !== 'marketplace' && (
        <div className="fourni-pi" style={{ paddingTop: 24 }}>

          {/* ═══ ACCUEIL ═══ */}
          {view === 'dashboard' && (
            <>
              {/* Greeting */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.4px', color: 'var(--tx)' }}>Bonjour, {entreprise}</div>
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
                      <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.5px', marginBottom: 8, lineHeight: 1.2 }}>Développez votre activité sur MEEREO</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.7, maxWidth: 420, marginBottom: 28 }}>Ajoutez vos premiers produits, structurez votre catalogue et commencez à recevoir des demandes depuis votre espace.</div>
                      <button className="btn" style={{ background: '#fff', color: '#111', padding: '11px 22px', borderRadius: 10, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer' }} onClick={() => { setShowAddProduct(true); setNewProd(emptyProd) }}>+ Ajouter un produit</button>
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
                          <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--t4)', letterSpacing: '-1px', marginBottom: 10, lineHeight: 1 }}>{step.n}</div>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--tx)', marginBottom: 4 }}>{step.title}</div>
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
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--tx)' }}>{btn.label}</div>
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
                      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-1px', color: 'var(--tx)' }}>{activeProducts.length}</div>
                      <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.3 }}>produit{activeProducts.length > 1 ? 's' : ''} actif{activeProducts.length > 1 ? 's' : ''}</div>
                    </div>
                    <div onClick={() => setView('commandes')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)', cursor: 'pointer' }}>
                      <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-1px', color: 'var(--tx)' }}>{sellerOrders.length}</div>
                      <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.3 }}>commande{sellerOrders.length > 1 ? 's' : ''}</div>
                    </div>
                    <div onClick={() => setView('paiements')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)', cursor: 'pointer' }}>
                      <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-.5px', color: 'var(--tx)' }}>{fmtMoney(caTotal)}</div>
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
                    <div style={{ fontSize: 12, fontWeight: 700 }}>Commandes à traiter ({pendingOrders.length})</div>
                    <button className="btn btn-sm" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => setView('commandes')}>Voir tout →</button>
                  </div>
                  {pendingOrders.slice(0, 3).map(o => (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 18px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF9500', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{o.ref || o.buyer || 'Commande'}</div>
                        <div style={{ fontSize: 10.5, color: 'var(--t3)' }}>{o.items?.length || 0} article(s) · {o.total ? fmtMoney(o.total) : '—'}</div>
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(255,149,0,.08)', color: '#FF9500' }}>En attente</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Infos entreprise */}
              {(ob.rccm || ob.ncc || ob.email) && (
                <div className="card" style={{ padding: 20, marginTop: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 12 }}>Informations entreprise</div>
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
                    <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)' }}>Mes produits ({products.length})</div>
                    <button className="btn btn-secondary btn-sm" onClick={() => setView('catalogue')}>Voir tout →</button>
                  </div>
                  <div className="rg-3" style={{ gap: 10 }}>
                    {products.slice(0, 6).map((p, i) => (
                      <div key={i} style={{ background: 'var(--s2)', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 6, position: 'relative' }}>
                        {p.sponsored && <span style={{ position: 'absolute', top: 6, right: 6, fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: 'var(--tx)', color: '#fff' }}>Sponsorise</span>}
                        {p.flash && <span style={{ position: 'absolute', top: 6, left: 6, fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 4, background: 'var(--wrn)', color: '#fff' }}>Flash</span>}
                        {p.photoUrl
                          ? <img src={p.photoUrl} alt="" style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 8 }} />
                          : <div style={{ width: '100%', height: 80, borderRadius: 8, background: 'var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t4)' }}><Package size={24}/></div>
                        }
                        <div style={{ fontSize: 12, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--t3)' }}>{p.price ? fmtMoney(p.price) : 'Sur devis'} {p.unit}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ═══ CATALOGUE / PRODUITS ═══ */}
          {view === 'catalogue' && (
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
                      {p.sponsored && <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'var(--tx)', color: '#fff', zIndex: 2 }}>Sponsorise</span>}
                      {p.flash && <span style={{ position: 'absolute', top: 8, left: 8, fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'var(--wrn)', color: '#fff', zIndex: 2 }}>Flash</span>}
                      {p.photoUrl
                        ? <img src={p.photoUrl} alt="" style={{ width: '100%', height: 130, objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: 130, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t4)' }}><Package size={32}/></div>
                      }
                      <div style={{ padding: 14 }}>
                        {p.category && <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>{p.category}</div>}
                        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
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
          )}

          {/* ═══ COMMANDES ═══ */}
          {view === 'commandes' && (
            <div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                {[['all', 'Toutes'], ['pending', 'En attente'], ['shipped', 'En livraison'], ['delivered', 'Livrées'], ['completed', 'Terminées']].map(([k, l]) => (
                  <button key={k} onClick={() => setOrderFilter(k)} style={{ padding: '5px 12px', borderRadius: 100, border: '1px solid var(--border-card)', background: orderFilter === k ? 'var(--surface-1)' : 'none', fontSize: 11, cursor: 'pointer', fontFamily: 'var(--f)', color: 'var(--t2)', fontWeight: orderFilter === k ? 600 : 400, boxShadow: orderFilter === k ? 'var(--shadow-xs)' : 'none' }}>{l}</button>
                ))}
              </div>
              {sellerOrders.length === 0 ? (
                <div className="card" style={{ padding: 48, textAlign: 'center' }}>
                  <div style={{ marginBottom: 12, opacity: .4 }}><Package size={32}/></div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Aucune commande</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)' }}>Les commandes apparaîtront ici quand un acheteur commandera vos produits</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {sellerOrders.filter(o => orderFilter === 'all' || (orderFilter === 'pending' && o.statut === 'pending') || (orderFilter === 'shipped' && o.statut === 'shipped') || (orderFilter === 'delivered' && o.statut === 'delivered') || (orderFilter === 'completed' && o.statut === 'completed')).map(o => {
                    const steps = o.livMode === 'retrait' ? PICKUP_STEPS : DELIVERY_STEPS
                    const currentStep = o.step || 1
                    return (
                      <div key={o.id} className="card" style={{ padding: '14px 18px', cursor: 'pointer' }} onClick={() => setShowOrderDetail(o)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                              <span style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--t4)' }}>{o.ref}</span>
                              <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 100, background: (STATUS_COLORS[o.statut] || 'var(--t4)') + '14', color: STATUS_COLORS[o.statut] || 'var(--t4)' }}>{STATUS_LABELS[o.statut] || o.statut}</span>
                              <span style={{ fontSize: 8, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: 'var(--s2)', color: 'var(--t3)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>{o.livMode === 'retrait' ? <><Store size={8}/> Retrait</> : <><Truck size={8}/> Livraison</>}</span>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 700 }}>{o.buyer}</div>
                            <div style={{ fontSize: 11, color: 'var(--t3)' }}>{o.items?.map(it => it.name).join(', ')} · {formatDateFR(o.date)}</div>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 800 }}>{fmtMoney(o.total)}</div>
                            <div style={{ fontSize: 9, color: 'var(--t4)', display: 'flex', alignItems: 'center', gap: 3 }}>{o.paymentMethod || '—'} · {o.paymentStatus === 'paid' ? <><Check size={8}/> Payé</> : 'En attente'}</div>
                          </div>
                        </div>
                        {/* Tracking steps */}
                        <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          {steps.map((s, si) => (
                            <div key={si} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                              <div style={{ width: '100%', height: 3, borderRadius: 2, background: si < currentStep ? 'var(--tx)' : 'var(--s3)' }} />
                              <span style={{ fontSize: 7, color: si < currentStep ? 'var(--tx)' : 'var(--t4)', fontWeight: si === currentStep - 1 ? 700 : 400, textAlign: 'center', lineHeight: 1.2 }}>{s}</span>
                            </div>
                          ))}
                        </div>
                        {/* Partenaire livraison */}
                        {o.livMode === 'livraison' && o.partner && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, padding: '6px 10px', background: 'var(--s2)', borderRadius: 6 }}>
                            <Truck size={12}/>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 10, fontWeight: 600 }}>{o.partner.nom} — {o.partner.chauffeur}</div>
                              <div style={{ fontSize: 9, color: 'var(--t4)' }}>{o.partner.vehicule} · {o.partner.tel}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ PAIEMENTS ═══ */}
          {view === 'paiements' && (() => {
            const paidOrders = sellerOrders.filter(o => o.paymentStatus === 'paid')
            const pendingPay = sellerOrders.filter(o => o.paymentStatus === 'pending' || (!o.paymentStatus && o.statut === 'pending'))
            const totalPaid = paidOrders.reduce((s, o) => s + (o.total || 0), 0)
            const totalPending = pendingPay.reduce((s, o) => s + (o.total || 0), 0)
            if (sellerOrders.length === 0) return (
              <div className="card" style={{ padding: 48, textAlign: 'center' }}>
                <div style={{ marginBottom: 12, opacity: .4 }}><Wallet size={32}/></div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Aucun paiement</div>
                <div style={{ fontSize: 12, color: 'var(--t3)' }}>Les paiements apparaîtront ici après vos premières ventes.</div>
              </div>
            )
            return (
              <div>
                <div className="rg-4" style={{ gap: 12, marginBottom: 20 }}>
                  {[
                    { l: 'Total recu', v: fmtMoney(totalPaid), color: 'var(--ok)' },
                    { l: 'Transactions', v: String(paidOrders.length), sub: 'confirmees' },
                    { l: 'En attente', v: fmtMoney(totalPending) },
                    { l: 'Methodes', v: String([...new Set(paidOrders.map(o => o.paymentMethod).filter(Boolean))].length), sub: 'Mobile Money' },
                  ].map((k, i) => (
                    <div key={i} className="card" style={{ padding: '16px 18px' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 6 }}>{k.l}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: k.color || 'var(--tx)' }}>{k.v}</div>
                      {k.sub && <div style={{ fontSize: 10, color: 'var(--t4)', marginTop: 2 }}>{k.sub}</div>}
                    </div>
                  ))}
                </div>

                {/* Transactions détaillées */}
                <div className="card">
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Transactions recues</div>
                  {paidOrders.length === 0 && <div style={{ padding: '24px 18px', textAlign: 'center', fontSize: 12, color: 'var(--t4)' }}>Aucun paiement recu</div>}
                  {paidOrders.map(o => (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ok)', flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{o.buyer}</div>
                        <div style={{ fontSize: 10, color: 'var(--t4)' }}>{o.ref} · {o.items?.map(it => it.name).join(', ')}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ok)' }}>+{fmtMoney(o.total)}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 2 }}>
                          <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: 'var(--s2)', color: 'var(--t3)' }}>{o.paymentMethod || '—'}</span>
                          <span style={{ fontSize: 9, color: 'var(--t4)' }}>{formatDateFR(o.date)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paiements en attente */}
                {pendingPay.length > 0 && (
                  <div className="card" style={{ marginTop: 16 }}>
                    <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: 12, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>En attente de paiement</div>
                    {pendingPay.map(o => (
                      <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--wrn)', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{o.buyer}</div>
                          <div style={{ fontSize: 10, color: 'var(--t4)' }}>{o.ref}</div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{fmtMoney(o.total)}</div>
                          <span style={{ fontSize: 9, color: 'var(--wrn)' }}>En attente</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })()}

          {/* ═══ STATISTIQUES ═══ */}
          {view === 'stats' && (
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
                    <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 6 }}>{k.l}</div>
                    <div style={{ fontSize: 22, fontWeight: 800 }}>{k.v}</div>
                    <div style={{ fontSize: 10, color: 'var(--t4)', marginTop: 2 }}>{k.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <button className="btn btn-sm" onClick={() => setView('marketplace')}>Voir le marketplace</button>
              </div>
              {products.length > 0 && (
                <div className="card" style={{ padding: 18 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 12 }}>Produits par performance</div>
                  {products.slice(0, 8).map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 7 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--t4)', width: 20 }}>{i + 1}.</span>
                      <div style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>
                        {p.name}
                        {p.sponsored && <span style={{ fontSize: 8, fontWeight: 700, padding: '0 4px', borderRadius: 3, background: 'var(--tx)', color: '#fff', marginLeft: 6 }}>S</span>}
                        {p.flash && <span style={{ fontSize: 8, fontWeight: 700, padding: '0 4px', borderRadius: 3, background: 'var(--wrn)', color: '#fff', marginLeft: 4 }}>F</span>}
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700 }}>{p.price ? fmtMoney(p.price) : 'Devis'}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* ═══ PARAMÈTRES ═══ */}
          {view === 'parametres' && (() => {
            const [pTab, setPTab] = [paramTab, setParamTab]
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
          })()}
        </div>
        )}
      </main>

      {/* ═══ MODAL: Ajouter un produit ═══ */}
      <Modal isOpen={showAddProduct} onClose={() => setShowAddProduct(false)} title="Ajouter un produit au Marketplace" wide footer={
        <>
          <span style={{ fontSize: 9, color: 'var(--t4)', marginRight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: newProd.isPublished ? 'var(--ok)' : 'var(--t3)', display: 'inline-block', flexShrink: 0 }}/>{newProd.isPublished ? 'Visible marketplace' : 'Non visible'}</span>
          <button className="btn btn-sm" onClick={() => setShowAddProduct(false)}>Annuler</button>
          <button className="btn btn-primary btn-sm" disabled={!newProd.name.trim() || !newProd.category || prodSaving} style={{ opacity: newProd.name.trim() && newProd.category && !prodSaving ? 1 : .5 }} onClick={handleSaveProduct}>{prodSaving ? '...' : 'Publier sur le Marketplace'}</button>
        </>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Section 1 — Identité */}
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Identite produit</div>
          <div><label className="form-label">Nom du produit *</label><input className="form-input" value={newProd.name} onChange={e => setNewProd(p => ({ ...p, name: e.target.value }))} placeholder="ex: Beton XR45, Carrelage 60x60..." /></div>
          <div className="modal-row" style={{ gap: 12 }}>
            <div><label className="form-label">Categorie *</label><select className="form-input" value={newProd.category} onChange={e => setNewProd(p => ({ ...p, category: e.target.value }))}><option value="">Choisir une categorie</option>{MKT_CATS.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.ico} {c.label}</option>)}</select></div>
            <div><label className="form-label">Unite</label><select className="form-input" value={newProd.unit} onChange={e => setNewProd(p => ({ ...p, unit: e.target.value }))}><option>unité</option><option>m²</option><option>m³</option><option>ml</option><option>kg</option><option>tonne</option><option>lot</option><option>sac</option><option>rouleau</option></select></div>
          </div>
          <div><label className="form-label">Description</label><textarea className="form-input" value={newProd.description} onChange={e => setNewProd(p => ({ ...p, description: e.target.value }))} placeholder="Description du produit..." /></div>

          {/* Section 2 — Prix & Stock */}
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4 }}>Prix & stock</div>
          <div className="modal-row" style={{ gap: 12 }}>
            <div><label className="form-label">Prix (FCFA)</label><MoneyInput value={newProd.price} onChange={v => setNewProd(p => ({ ...p, price: v }))} placeholder="0 = sur devis" /></div>
            <div><label className="form-label">Stock disponible</label><input className="form-input" type="number" value={newProd.stock} onChange={e => setNewProd(p => ({ ...p, stock: e.target.value }))} placeholder="Quantite" /></div>
          </div>

          {/* Section 3 — Image */}
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4 }}>Image produit</div>
          {newProd.imageUrl ? (
            <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: 'var(--s2)' }}>
              <img src={newProd.imageUrl} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
              <button onClick={() => setNewProd(p => ({ ...p, imageFile: null, imageUrl: '', photoUrl: '' }))} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 6, background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
          ) : (
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '20px 14px', border: '1.5px dashed var(--border-subtle)', borderRadius: 10, background: 'var(--s2)', cursor: 'pointer', textAlign: 'center' }}>
              <div style={{ opacity: .4 }}><Camera size={20}/></div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>Ajouter une image</div>
              <div style={{ fontSize: 10, color: 'var(--t4)' }}>JPG, PNG — recommande pour le marketplace</div>
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, setNewProd)} />
            </label>
          )}

          {/* Section 4 — Publication marketplace */}
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Publication marketplace</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12 }}>Visible dans le Marketplace</span>
              <div onClick={() => setNewProd(p => ({ ...p, isPublished: !p.isPublished }))} style={{ width: 36, height: 20, borderRadius: 100, background: newProd.isPublished ? 'var(--tx)' : 'var(--s3)', cursor: 'pointer', position: 'relative', transition: 'background .15s' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, transition: 'all .15s', ...(newProd.isPublished ? { right: 3 } : { left: 3 }) }} />
              </div>
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--s2)', borderRadius: 8, fontSize: 10, color: 'var(--t3)', lineHeight: 1.5 }}>
              Votre produit apparaitra dans le Marketplace MEEREO une fois active. Il sera visible par tous les acheteurs de la plateforme.
            </div>
            {/* Options boost */}
            <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={newProd.sponsored} onChange={e => setNewProd(p => ({ ...p, sponsored: e.target.checked }))} /> Sponsoriser
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer' }}>
                <input type="checkbox" checked={newProd.flash} onChange={e => setNewProd(p => ({ ...p, flash: e.target.checked }))} /> Offre flash
              </label>
            </div>
            {newProd.flash && (
              <div className="modal-row" style={{ gap: 12, marginTop: 10 }}>
                <div><label className="form-label">Prix promo (FCFA)</label><MoneyInput value={newProd.flashPrice} onChange={v => setNewProd(p => ({ ...p, flashPrice: v }))} placeholder="Prix flash" /></div>
                <div><label className="form-label">Durée</label><select className="form-input" value={newProd.flashDuration} onChange={e => setNewProd(p => ({ ...p, flashDuration: e.target.value }))}><option value="24h">24 heures</option><option value="48h">48 heures</option><option value="72h">72 heures</option><option value="7j">7 jours</option></select></div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* ═══ MODAL: Modifier un produit ═══ */}
      <Modal isOpen={!!editProduct} onClose={() => setEditProduct(null)} title="Modifier le produit" wide footer={
        <>
          <span style={{ fontSize: 9, color: 'var(--t4)', marginRight: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: editProduct?.isPublished !== false ? 'var(--ok)' : 'var(--t3)', display: 'inline-block', flexShrink: 0 }}/>{editProduct?.isPublished !== false ? 'Marketplace' : 'Non visible'}</span>
          <button className="btn btn-sm" onClick={() => setEditProduct(null)}>Annuler</button>
          <button className="btn btn-primary btn-sm" onClick={handleEditProduct}>Enregistrer</button>
        </>
      }>
        {editProduct && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label className="form-label">Nom *</label><input className="form-input" value={editProduct.name || ''} onChange={e => setEditProduct(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="modal-row" style={{ gap: 12 }}>
              <div><label className="form-label">Categorie</label><select className="form-input" value={editProduct.category || ''} onChange={e => setEditProduct(p => ({ ...p, category: e.target.value }))}><option value="">Choisir</option>{MKT_CATS.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.ico} {c.label}</option>)}</select></div>
              <div><label className="form-label">Unite</label><input className="form-input" value={editProduct.unit || ''} onChange={e => setEditProduct(p => ({ ...p, unit: e.target.value }))} /></div>
            </div>
            <div className="modal-row" style={{ gap: 12 }}>
              <div><label className="form-label">Prix (FCFA)</label><MoneyInput value={editProduct.price || ''} onChange={v => setEditProduct(p => ({ ...p, price: v }))} /></div>
              <div><label className="form-label">Stock</label><input className="form-input" type="number" value={editProduct.stock || ''} onChange={e => setEditProduct(p => ({ ...p, stock: e.target.value }))} /></div>
            </div>
            <div><label className="form-label">Description</label><textarea className="form-input" value={editProduct.description || ''} onChange={e => setEditProduct(p => ({ ...p, description: e.target.value }))} /></div>
            {/* Image */}
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Image</div>
            {(editProduct.photoUrl || editProduct.imageUrl) ? (
              <div style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', background: 'var(--s2)' }}>
                <img src={editProduct.photoUrl || editProduct.imageUrl} alt="" style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
                <button onClick={() => setEditProduct(p => ({ ...p, photoUrl: '', imageUrl: '' }))} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: 6, background: 'rgba(0,0,0,.6)', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            ) : (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '14px', border: '1.5px dashed var(--border-subtle)', borderRadius: 10, background: 'var(--s2)', cursor: 'pointer', textAlign: 'center' }}>
                <Camera size={16} style={{ opacity: .4 }}/>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--t2)' }}>Ajouter une image</div>
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, setEditProduct)} />
              </label>
            )}
            {/* Visibilité */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12 }}>Visible Marketplace</span>
              <div onClick={() => setEditProduct(p => ({ ...p, isPublished: p.isPublished === false ? true : false }))} style={{ width: 36, height: 20, borderRadius: 100, background: editProduct.isPublished !== false ? 'var(--tx)' : 'var(--s3)', cursor: 'pointer', position: 'relative' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, ...(editProduct.isPublished !== false ? { right: 3 } : { left: 3 }) }} />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ═══ MODAL: Sponsoriser un produit ═══ */}
      <Modal isOpen={!!showSponsorModal} onClose={() => setShowSponsorModal(null)} title="Sponsoriser le produit" footer={
        <><button className="btn btn-sm" onClick={() => setShowSponsorModal(null)}>Annuler</button><button className="btn btn-primary btn-sm" onClick={handleSponsor}>Activer le sponsoring</button></>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '12px 14px', background: 'var(--s2)', borderRadius: 10, fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>
            Le sponsoring booste la visibilité de votre produit dans le marketplace. Il sera affiché en priorité dans les résultats et les pages catégorie.
          </div>
          <div><label className="form-label">Durée du sponsoring</label>
            <select className="form-input" value={sponsorDuration} onChange={e => setSponsorDuration(e.target.value)}>
              <option value="24h">24 heures</option>
              <option value="72h">72 heures (recommandé)</option>
              <option value="7j">7 jours</option>
            </select>
          </div>
          <div style={{ padding: '10px 14px', background: 'var(--s2)', borderRadius: 10 }}>
            <div style={{ fontSize: 10, color: 'var(--t4)', marginBottom: 4 }}>Estimation visibilite</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{sponsorDuration === '24h' ? '~200' : sponsorDuration === '72h' ? '~600' : '~2 000'} vues estimees</div>
          </div>
        </div>
      </Modal>

      {/* ═══ MODAL: Offre Flash ═══ */}
      <Modal isOpen={!!showFlashModal} onClose={() => setShowFlashModal(null)} title="Créer une offre flash" footer={
        <><button className="btn btn-sm" onClick={() => setShowFlashModal(null)}>Annuler</button><button className="btn btn-primary btn-sm" disabled={!flashPrice} style={{ opacity: flashPrice ? 1 : .5 }} onClick={handleFlash}>Lancer l'offre flash</button></>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '12px 14px', background: 'var(--s2)', borderRadius: 10, fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>
            Les offres flash sont des promotions temporaires avec un badge visible sur le marketplace. Elles attirent les acheteurs avec un prix réduit et un sentiment d'urgence.
          </div>
          <div><label className="form-label">Prix promotionnel (FCFA) *</label><MoneyInput value={flashPrice} onChange={v => setFlashPrice(v)} placeholder="Prix réduit" /></div>
          <div className="modal-row" style={{ gap: 12 }}>
            <div><label className="form-label">Durée</label><select className="form-input" value={flashDuration} onChange={e => setFlashDuration(e.target.value)}><option value="24h">24 heures</option><option value="48h">48 heures</option><option value="72h">72 heures</option><option value="7j">7 jours</option></select></div>
            <div><label className="form-label">Stock limite (optionnel)</label><input className="form-input" type="number" value={flashStock} onChange={e => setFlashStock(e.target.value)} placeholder="Illimité" /></div>
          </div>
        </div>
      </Modal>



      {/* ═══ MODAL: Detail commande ═══ */}
      <Modal isOpen={!!showOrderDetail} onClose={() => setShowOrderDetail(null)} title={'Commande ' + (showOrderDetail?.ref || '')} footer={
        showOrderDetail?.statut === 'pending' ? (
          <><button className="btn btn-sm" style={{ color: 'var(--err)' }} onClick={() => handleOrderAction(showOrderDetail.id, 'rejected')}>Refuser</button><button className="btn btn-primary btn-sm" onClick={() => handleOrderAction(showOrderDetail.id, 'accepted')}>Accepter</button></>
        ) : showOrderDetail?.statut === 'accepted' ? (
          <button className="btn btn-primary btn-sm" onClick={() => handleOrderAction(showOrderDetail.id, 'shipped')}>Marquer expediee</button>
        ) : showOrderDetail?.statut === 'shipped' ? (
          <button className="btn btn-primary btn-sm" onClick={() => handleOrderAction(showOrderDetail.id, 'delivered')}>Marquer livree</button>
        ) : showOrderDetail?.statut === 'delivered' ? (
          <button className="btn btn-primary btn-sm" onClick={() => handleOrderAction(showOrderDetail.id, 'completed')}>Terminer</button>
        ) : <button className="btn btn-sm" onClick={() => setShowOrderDetail(null)}>Fermer</button>
      }>
        {showOrderDetail && (() => {
          const o = showOrderDetail
          const steps = o.livMode === 'retrait' ? PICKUP_STEPS : DELIVERY_STEPS
          const currentStep = o.step || 1
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Mode livraison */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--s2)', borderRadius: 8 }}>
                {o.livMode === 'retrait' ? <Store size={14}/> : <Truck size={14}/>}
                <span style={{ fontSize: 12, fontWeight: 600 }}>{o.livMode === 'retrait' ? 'Retrait par le client' : 'Livraison'}</span>
                <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 100, background: (STATUS_COLORS[o.statut] || 'var(--t4)') + '14', color: STATUS_COLORS[o.statut] || 'var(--t4)' }}>{STATUS_LABELS[o.statut] || o.statut}</span>
              </div>

              {/* Infos */}
              <div className="rg-2" style={{ gap: 12 }}>
                <div><div style={{ fontSize: 10, color: 'var(--t4)' }}>Client</div><div style={{ fontSize: 13, fontWeight: 700 }}>{o.buyer}</div></div>
                <div><div style={{ fontSize: 10, color: 'var(--t4)' }}>{o.livMode === 'retrait' ? 'Point de retrait' : 'Adresse livraison'}</div><div style={{ fontSize: 12 }}>{o.address}</div></div>
                <div><div style={{ fontSize: 10, color: 'var(--t4)' }}>Date</div><div style={{ fontSize: 12 }}>{formatDateFR(o.date)}</div></div>
                <div><div style={{ fontSize: 10, color: 'var(--t4)' }}>Montant</div><div style={{ fontSize: 15, fontWeight: 800 }}>{fmtMoney(o.total)}</div></div>
              </div>

              {/* Suivi étapes */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 10 }}>Suivi {o.livMode === 'retrait' ? 'retrait' : 'livraison'}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {steps.map((s, si) => (
                    <div key={si} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: si < currentStep ? 'var(--tx)' : 'var(--s3)', color: si < currentStep ? '#fff' : 'var(--t4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{si < currentStep ? <Check size={10}/> : si + 1}</div>
                      <span style={{ fontSize: 11, fontWeight: si === currentStep - 1 ? 700 : 400, color: si < currentStep ? 'var(--tx)' : 'var(--t4)' }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partenaire livraison */}
              {o.livMode === 'livraison' && o.partner && (
                <div style={{ padding: '10px 14px', background: 'var(--s2)', borderRadius: 8 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 6 }}>Partenaire logistique</div>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{o.partner.nom}</div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>Chauffeur : {o.partner.chauffeur} · {o.partner.vehicule}</div>
                  <div style={{ fontSize: 10, color: 'var(--t3)' }}>Tel : {o.partner.tel}</div>
                </div>
              )}

              {/* Paiement */}
              <div style={{ padding: '10px 14px', background: 'var(--s2)', borderRadius: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 6 }}>Paiement</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: o.paymentStatus === 'paid' ? 'var(--ok)' : 'var(--wrn)' }} />
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{o.paymentMethod || '—'}</span>
                  <span style={{ fontSize: 10, color: o.paymentStatus === 'paid' ? 'var(--ok)' : 'var(--wrn)', fontWeight: 600, marginLeft: 'auto' }}>{o.paymentStatus === 'paid' ? 'Paye' : 'En attente'}</span>
                </div>
              </div>

              {/* Articles */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 8 }}>Articles</div>
                {(o.items || []).map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}>
                    <span>{it.name} × {it.qty}</span>
                    <span style={{ fontWeight: 700 }}>{fmtMoney(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })()}
      </Modal>
      <KaiAssistant context="fournisseur" userName={entreprise} />
      <ModalConfirm
        open={!!confirmDeleteProduct}
        title="Supprimer ce produit ?"
        message="Cette action est irréversible. Le produit sera retiré de votre catalogue."
        confirmLabel="Supprimer"
        cancelLabel="Annuler"
        destructive
        onConfirm={() => { handleDeleteProduct(confirmDeleteProduct); setConfirmDeleteProduct(null) }}
        onCancel={() => setConfirmDeleteProduct(null)}
      />
    </div>
  )
}
