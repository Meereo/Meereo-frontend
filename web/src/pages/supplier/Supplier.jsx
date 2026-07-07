import { useState, useMemo, useEffect } from 'react'
import { Store, Package, ShoppingCart, Truck, Wallet, BarChart2, Camera, Check, Smartphone } from 'lucide-react'
import MoneyInput from '../../components/shared/MoneyInput'
import { useMeereo } from '../../hooks/useMeereoStore'
import { api } from '../../services/api/client'
import Modal from '../../components/shared/Modal'
import ModalConfirm from '../../components/shared/ModalConfirm'
import { lazy, Suspense } from 'react'
const Marketplace = lazy(() => import('../cockpit/Marketplace'))
const Payments = lazy(() => import('./Payments'))
const Orders = lazy(() => import('./Orders'))
import KaiAssistant from '../../components/shared/KaiAssistant'
import KaiQuota from '../../components/shared/KaiQuota'
import NotifBell from '../../components/shared/NotifBell'
import { formatDateFR } from '../../utils/helpers'
import { useDevise } from '../../hooks/useDevise'
import UserMenu from '../../components/shared/UserMenu'
import MeereoLogo from '../../components/shared/MeereoLogo'
import useUserIdentity from '../../hooks/useUserIdentity'
import { MKT_CATS } from '../../data/marketplace'
import Dashboard from './Dashboard'
import Catalogue from './Catalogue'
import Stats from './Stats'
import Settings from './Settings'
import '../../styles/supplier.css'

const VIEW_LABELS = {
  dashboard: 'Accueil', catalogue: 'Mes produits', marketplace: 'Boutique',
  orders: 'Commandes', payments: 'Paiements', stats: 'Performance', settings: 'Paramètres'
}
const VIEW_ICONS = {
  dashboard: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  catalogue: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  marketplace: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  orders: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  payments: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
  stats: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  settings: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
}

const DELIVERY_STEPS = ['Commande confirmée', 'En préparation', 'Remise au transport', 'En cours de livraison', 'Livrée']
const PICKUP_STEPS = ['Commande confirmée', 'En préparation', 'Prête pour retrait', 'Récupérée par le client', 'Terminée']
const STATUS_LABELS = { pending: 'En attente', accepted: 'Acceptée', rejected: 'Refusée', preparing: 'En préparation', shipped: 'Expédiée', delivered: 'Livrée', completed: 'Terminée', cancelled: 'Annulée' }
const STATUS_COLORS = { pending: 'var(--wrn)', accepted: 'var(--color-info)', delivered: 'var(--ok)', completed: 'var(--ok)', rejected: 'var(--err)', cancelled: 'var(--err)', preparing: 'var(--color-info)', shipped: 'var(--color-info)' }

export default function Supplier() {
  const [view, setView] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { store, showToast, updateStore, addProduct } = useMeereo()
  const { format: fmtMoney } = useDevise()

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

  const activeProducts = products.filter(p => p.status !== 'archived')
  const sponsoredProducts = products.filter(p => p.sponsored)
  const flashProducts = products.filter(p => p.flash)
  const visibleMarketplace = useMemo(() => {
    const sorted = [...activeProducts].sort((a, b) => {
      if (a.sponsored && !b.sponsored) return -1
      if (!a.sponsored && b.sponsored) return 1
      if (a.flash && !b.flash) return -1
      if (!a.flash && b.flash) return 1
      return 0
    })
    return sorted.slice(0, 20)
  }, [activeProducts])

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

  const refreshOrders = () => {
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
      }).catch(() => {})
  }

  const sellerPayments = sellerOrders.filter(o => o.statut === 'completed' || o.statut === 'delivered')
  const pendingOrders = sellerOrders.filter(o => o.statut === 'pending')
  const caTotal = sellerPayments.reduce((s, o) => s + (o.total || 0), 0)

  const [showAddProduct, setShowAddProduct] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [showOrderDetail, setShowOrderDetail] = useState(null)
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState(null)
  const [showSponsorModal, setShowSponsorModal] = useState(null)
  const [sponsorDuration, setSponsorDuration] = useState('72h')
  const [showFlashModal, setShowFlashModal] = useState(null)
  const [flashPrice, setFlashPrice] = useState('')
  const [flashDuration, setFlashDuration] = useState('24h')
  const [flashStock, setFlashStock] = useState('')
  const emptyProd = { name: '', category: '', price: '', unit: 'unité', description: '', stock: '', imageFile: null, imageUrl: '', sponsored: false, flash: false, flashPrice: '', flashDuration: '24h', isPublished: true }
  const [newProd, setNewProd] = useState(emptyProd)
  const [prodSaving, setProdSaving] = useState(false)
  const [catalogFilter, setCatalogFilter] = useState('all')
  const [paramTab, setParamTab] = useState('entreprise')
  const [orderFilter, setOrderFilter] = useState('all')
  const [notifPrefs, setNotifPrefs] = useState([true, true, true, false, false])
  const [fPwd, setFPwd] = useState({ current: '', nouveau: '', confirm: '' })
  const [fEntreprise, setFEntreprise] = useState({ nom: ob.entreprise || '', email: ob.email || '', tel: ob.tel || '', ville: ob.ville || '' })

  useEffect(() => {
    api.products.getMine()
      .then(backendProds => {
        if (!Array.isArray(backendProds) || backendProds.length === 0) return
        updateStore(prev => {
          const backendIds = new Set(backendProds.map(p => p.id))
          const localOnly = (prev.products || []).filter(p => String(p.id).startsWith('prod_') && !backendIds.has(p.id))
          return { ...prev, products: [...backendProds, ...localOnly] }
        })
      })
      .catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setFEntreprise({ nom: ob.entreprise || '', email: ob.email || '', tel: ob.tel || '', ville: ob.ville || '' })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.onboardingData])

  const handleImageUpload = (e, setter) => {
    const file = e.target.files?.[0]
    if (!file) return
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
    const stepMap = { pending: 1, accepted: 1, preparing: 2, shipped: 3, delivered: 5, completed: 5, cancelled: 1, rejected: 1 }
    const step = stepMap[newStatus] || 1
    api.commandes.update(orderId, { statut: newStatus, step }).catch(e => console.warn('[order update]', e.message))
    setSellerOrders(prev => prev.map(o => o.id === orderId ? { ...o, statut: newStatus, step } : o))
    showToast('Commande ' + (STATUS_LABELS[newStatus] || newStatus).toLowerCase(), newStatus === 'rejected' || newStatus === 'cancelled' ? 'orange' : 'green')
    setShowOrderDetail(null)
  }

  const filteredProducts = catalogFilter === 'all' ? activeProducts
    : catalogFilter === 'sponsored' ? sponsoredProducts
    : catalogFilter === 'flash' ? flashProducts
    : activeProducts

  // Shared context passed to all view components
  const ctx = {
    products, activeProducts, sponsoredProducts, flashProducts, filteredProducts, visibleMarketplace,
    sellerOrders, pendingOrders, sellerPayments, caTotal, ordersLoaded, refreshOrders,
    ob, user, entreprise, categories, zones, uid,
    fmtMoney, setView,
    catalogFilter, setCatalogFilter,
    orderFilter, setOrderFilter,
    paramTab, setParamTab,
    fEntreprise, setFEntreprise,
    fPwd, setFPwd,
    notifPrefs, setNotifPrefs,
    emptyProd, newProd, setNewProd,
    showToast, updateStore,
    setShowAddProduct, setEditProduct, setConfirmDeleteProduct,
    setShowSponsorModal, setSponsorDuration,
    setShowFlashModal, setFlashPrice, setFlashDuration, setFlashStock,
    setShowOrderDetail,
    handleToggleStatus, handleOrderAction, handleImageUpload,
  }

  const Spinner = () => <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '40vh', opacity: .4 }}><div style={{ width: 24, height: 24, border: '2.5px solid var(--border)', borderTopColor: 'var(--tx)', borderRadius: '50%', animation: 'spin .6s linear infinite' }} /></div>

  return (
    <div className="fournisseur-layout">
      {sidebarOpen && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.42)', zIndex: 199, backdropFilter: 'blur(2px)' }} onClick={() => setSidebarOpen(false)} />}
      <aside className={`fourni-sb${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="fourni-sb-logo">
          <MeereoLogo size={28} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 300, letterSpacing: 3 }}>MEEREO</div>
            <div style={{ fontSize: 8, color: 'var(--t3)', letterSpacing: '.07em', textTransform: 'uppercase', marginTop: 1 }}>Espace Fournisseur</div>
          </div>
        </div>

        <div style={{ margin: '8px 10px', padding: '10px 12px', background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 10 }}>
          <div style={{ fontSize: 9, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Marketplace</div>
          <div style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-.5px' }}>{visibleMarketplace.length}</div>
          <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 2 }}>produit{visibleMarketplace.length > 1 ? 's' : ''} visibles</div>
          {sponsoredProducts.length > 0 && <div style={{ fontSize: 9, color: 'var(--ok)', marginTop: 3 }}>{sponsoredProducts.length} sponsorise{sponsoredProducts.length > 1 ? 's' : ''}</div>}
        </div>

        <nav className="fourni-sb-nav">
          <div className="fourni-sb-cat">Activité</div>
          {['dashboard'].map(v => (
            <button key={v} className={`fourni-ni ${view === v ? 'on' : ''}`} onClick={() => { setView(v); setSidebarOpen(false) }}>
              <span style={{ color: { dashboard:'#191c1d', catalogue:'#0891B2', marketplace:'#EA580C', orders:'#F59E0B', payments:'#16A34A', stats:'#7C3AED', settings:'#6B7280' }[v] || '#6B7280' }}>{VIEW_ICONS[v]}</span> {VIEW_LABELS[v]}
            </button>
          ))}
          <div className="fourni-sb-cat">Marketplace</div>
          {['catalogue', 'marketplace', 'orders'].map(v => (
            <button key={v} className={`fourni-ni ${view === v ? 'on' : ''}`} onClick={() => { setView(v); setSidebarOpen(false) }}>
              <span style={{ color: { dashboard:'#191c1d', catalogue:'#0891B2', marketplace:'#EA580C', orders:'#F59E0B', payments:'#16A34A', stats:'#7C3AED', settings:'#6B7280' }[v] || '#6B7280' }}>{VIEW_ICONS[v]}</span> {VIEW_LABELS[v]}
              {v === 'catalogue' && products.length > 0 && <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: 'rgba(52,199,89,.1)', color: 'var(--ok)' }}>{products.length}</span>}
              {v === 'marketplace' && visibleMarketplace.length > 0 && <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: 'rgba(0,0,0,.06)', color: 'var(--tx)' }}>{visibleMarketplace.length}</span>}
              {v === 'orders' && pendingOrders.length > 0 && <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: 'rgba(224,123,0,.1)', color: 'var(--wrn)' }}>{pendingOrders.length}</span>}
            </button>
          ))}
          <div className="fourni-sb-cat">Finance</div>
          {['payments', 'stats'].map(v => (
            <button key={v} className={`fourni-ni ${view === v ? 'on' : ''}`} onClick={() => { setView(v); setSidebarOpen(false) }}>
              <span style={{ color: { dashboard:'#191c1d', catalogue:'#0891B2', marketplace:'#EA580C', orders:'#F59E0B', payments:'#16A34A', stats:'#7C3AED', settings:'#6B7280' }[v] || '#6B7280' }}>{VIEW_ICONS[v]}</span> {VIEW_LABELS[v]}
            </button>
          ))}
          <div className="fourni-sb-cat">Compte</div>
          {['settings'].map(v => (
            <button key={v} className={`fourni-ni ${view === v ? 'on' : ''}`} onClick={() => { setView(v); setSidebarOpen(false) }}>
              <span style={{ color: { dashboard:'#191c1d', catalogue:'#0891B2', marketplace:'#EA580C', orders:'#F59E0B', payments:'#16A34A', stats:'#7C3AED', settings:'#6B7280' }[v] || '#6B7280' }}>{VIEW_ICONS[v]}</span> {VIEW_LABELS[v]}
            </button>
          ))}
        </nav>

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

        {view === 'marketplace' && (
          <Suspense fallback={<Spinner />}>
            <div style={{ padding: '28px 36px 80px' }}>
              <Marketplace showToast={showToast} />
            </div>
          </Suspense>
        )}

        {view !== 'marketplace' && (
          <div className="fourni-pi" style={{ paddingTop: 24 }}>
            {view === 'dashboard' && <Dashboard ctx={ctx} />}
            {view === 'catalogue' && <Catalogue ctx={ctx} />}
            {view === 'orders' && <Orders ctx={ctx} />}
            {view === 'payments' && (
              <Suspense fallback={<Spinner />}>
                <Payments showToast={showToast} />
              </Suspense>
            )}
            {view === 'stats' && <Stats ctx={ctx} />}
            {view === 'settings' && <Settings ctx={ctx} />}
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
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Identite produit</div>
          <div><label className="form-label">Nom du produit *</label><input className="form-input" value={newProd.name} onChange={e => setNewProd(p => ({ ...p, name: e.target.value }))} placeholder="ex: Beton XR45, Carrelage 60x60..." /></div>
          <div className="modal-row" style={{ gap: 12 }}>
            <div><label className="form-label">Categorie *</label><select className="form-input" value={newProd.category} onChange={e => setNewProd(p => ({ ...p, category: e.target.value }))}><option value="">Choisir une categorie</option>{MKT_CATS.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.ico} {c.label}</option>)}</select></div>
            <div><label className="form-label">Unite</label><select className="form-input" value={newProd.unit} onChange={e => setNewProd(p => ({ ...p, unit: e.target.value }))}><option>unité</option><option>m²</option><option>m³</option><option>ml</option><option>kg</option><option>tonne</option><option>lot</option><option>sac</option><option>rouleau</option></select></div>
          </div>
          <div><label className="form-label">Description</label><textarea className="form-input" value={newProd.description} onChange={e => setNewProd(p => ({ ...p, description: e.target.value }))} placeholder="Description du produit..." /></div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4 }}>Prix & stock</div>
          <div className="modal-row" style={{ gap: 12 }}>
            <div><label className="form-label">Prix (FCFA)</label><MoneyInput value={newProd.price} onChange={v => setNewProd(p => ({ ...p, price: v }))} placeholder="0 = sur devis" /></div>
            <div><label className="form-label">Stock disponible</label><input className="form-input" type="number" value={newProd.stock} onChange={e => setNewProd(p => ({ ...p, stock: e.target.value }))} placeholder="Quantite" /></div>
          </div>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4 }}>Image produit</div>
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
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, marginTop: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 10 }}>Publication marketplace</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12 }}>Visible dans le Marketplace</span>
              <div onClick={() => setNewProd(p => ({ ...p, isPublished: !p.isPublished }))} style={{ width: 36, height: 20, borderRadius: 100, background: newProd.isPublished ? 'var(--tx)' : 'var(--s3)', cursor: 'pointer', position: 'relative', transition: 'background .15s' }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, transition: 'all .15s', ...(newProd.isPublished ? { right: 3 } : { left: 3 }) }} />
              </div>
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--s2)', borderRadius: 8, fontSize: 10, color: 'var(--t3)', lineHeight: 1.5 }}>
              Votre produit apparaitra dans le Marketplace MEEREO une fois active.
            </div>
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
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', letterSpacing: '.06em' }}>Image</div>
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
            Le sponsoring booste la visibilité de votre produit dans le marketplace.
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
            <div style={{ fontSize: 14, fontWeight: 600 }}>{sponsorDuration === '24h' ? '~200' : sponsorDuration === '72h' ? '~600' : '~2 000'} vues estimees</div>
          </div>
        </div>
      </Modal>

      {/* ═══ MODAL: Offre Flash ═══ */}
      <Modal isOpen={!!showFlashModal} onClose={() => setShowFlashModal(null)} title="Créer une offre flash" footer={
        <><button className="btn btn-sm" onClick={() => setShowFlashModal(null)}>Annuler</button><button className="btn btn-primary btn-sm" disabled={!flashPrice} style={{ opacity: flashPrice ? 1 : .5 }} onClick={handleFlash}>Lancer l'offre flash</button></>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ padding: '12px 14px', background: 'var(--s2)', borderRadius: 10, fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>
            Les offres flash sont des promotions temporaires avec un badge visible sur le marketplace.
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--s2)', borderRadius: 8 }}>
                {o.livMode === 'retrait' ? <Store size={14}/> : <Truck size={14}/>}
                <span style={{ fontSize: 12, fontWeight: 600 }}>{o.livMode === 'retrait' ? 'Retrait par le client' : 'Livraison'}</span>
                <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 600, padding: '1px 7px', borderRadius: 100, background: (STATUS_COLORS[o.statut] || 'var(--t4)') + '14', color: STATUS_COLORS[o.statut] || 'var(--t4)' }}>{STATUS_LABELS[o.statut] || o.statut}</span>
              </div>
              <div className="rg-2" style={{ gap: 12 }}>
                <div><div style={{ fontSize: 10, color: 'var(--t4)' }}>Client</div><div style={{ fontSize: 13, fontWeight: 600 }}>{o.buyer}</div></div>
                <div><div style={{ fontSize: 10, color: 'var(--t4)' }}>Montant</div><div style={{ fontSize: 13, fontWeight: 600 }}>{fmtMoney(o.total)}</div></div>
                {o.address && <div><div style={{ fontSize: 10, color: 'var(--t4)' }}>Adresse</div><div style={{ fontSize: 12 }}>{o.address}</div></div>}
                {o.paymentMethod && <div><div style={{ fontSize: 10, color: 'var(--t4)' }}>Paiement</div><div style={{ fontSize: 12 }}>{o.paymentMethod}</div></div>}
              </div>
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 8 }}>Articles</div>
                {(o.items || []).map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12 }}>
                    <span>{it.name} × {it.qty}</span>
                    <span style={{ fontWeight: 600 }}>{fmtMoney(it.price * it.qty)}</span>
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
