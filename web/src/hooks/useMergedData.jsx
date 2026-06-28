import { useMemo } from 'react'
import { useMeereo } from './useMeereoStore'

// Static data imports — kept ONLY for STATIC re-export used by a few legacy pages
import { OFFRES_DATA } from '../data/offers'
import { MARCHES_DATA } from '../data/markets'
import { COMMANDES_DATA } from '../data/commandes'
import { FOURNISSEURS_DATA } from '../data/fournisseurs'
import { INTERVENANTS_DATA } from '../data/intervenants'
import { PAY_TRANSACTIONS, PAY_PROVIDERS } from '../data/payments'
import { DOCS_DATA } from '../data/documents'
import { CAL_EVENTS } from '../data/agenda'
import { AO_DATA, MES_AO } from '../data/ao'
import { CLIENTS_DATA } from '../data/clients'
import { normalizeOfferStatus, normalizeMarketStatus, OFFER_STATUS } from '../domain/status'

/**
 * useMergedData — Single source of truth for all entity data.
 *
 * IMPORTANT: Since the PostgreSQL backend is now the source of truth,
 * this hook reads exclusively from store.* (which is hydrated from the API).
 * Static mock data is NO LONGER merged into live entity lists.
 *
 * Usage:
 *   const { offers, markets, intervenants, ... } = useMergedData()
 */
export function useMergedData() {
  const { store } = useMeereo()

  const offers = useMemo(() => {
    const overrides = store.offerStatuts || {}
    return (store.offers || []).map(o => ({
      id: o.id, titre: o.titre || o.title || o.ao?.title || '', entreprise: o.entreprise || o.company || '',
      projet: o.projet || '', montant: o.montant || '', delai: o.delai || '',
      statut: normalizeOfferStatus(overrides[o.id] || o.statut || o.status || OFFER_STATUS.PENDING),
      lot: o.lot || o.ao?.lot || '',
      aoId: o.aoId || null,
      userId: o.userId || o.supplierId || null,
      supplierId: o.supplierId || o.userId || null,
      supplierRole: o.supplierRole || null,
      soumis: o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR') : 'Récent',
      lu: true, color: '#6B7280', score: 0, nbRef: 0, certifs: [], docs: o.docs || [],
      message: o.message || o.note || '', technique: o.technique || '', note: o.note || '',
      // Logo réel du prestataire (onboardingData.logoFileUrl)
      logoUrl: o.supplier?.onboardingData?.logoFileUrl || null,
      // Données réelles du prestataire (depuis le backend)
      supplier: o.supplier || null,
      // Données du propriétaire de l'AO (visible après acceptation)
      aoOwner: o.ao?.owner || null,
      aoOwnerUserId: o.ao?.ownerUserId || null,
    }))
  }, [store.offerStatuts, store.offers])

  const markets = useMemo(() => {
    const overrides = store.marketStatuts || {}
    // Deduplicate by id
    const seen = new Set()
    return (store.markets || []).filter(m => {
      if (seen.has(m.id)) return false
      seen.add(m.id)
      return true
    }).map(m => {
      const override = overrides[m.id] || {}
      const raw = override.statut || m.statut
      return { ...m, ...override, statut: normalizeMarketStatus(raw) }
    })
  }, [store.markets, store.marketStatuts])

  const intervenants = useMemo(() => {
    // Intervenants : contacts de type 'intervenant' stockés en base
    return (store.contacts || []).filter(c => c.type === 'intervenant')
  }, [store.contacts])

  const clients = useMemo(() => {
    // Clients : contacts de type 'client' stockés en base
    return (store.contacts || []).filter(c => c.type === 'client')
  }, [store.contacts])

  const commandes = useMemo(() => {
    const storeCmd = (store.commandes || []).map(c => ({
      id: c.id, ref: c.ref || 'CMD-' + String(c.id).slice(-5), designation: c.designation || c.article || '',
      fournisseur: c.fournisseur || '', montant: c.montant || 0, date: c.date || 'Récent',
      statut: c.statut || 'confirmee', projet: c.projet || '', livMode: c.livMode || 'livraison',
      step: c.step || 1, img: c.img || '',
    }))
    const mktCmd = (store.sellerOrders || []).filter(o => o.scope === 'shared_with_project').map(o => ({
      id: o.id, ref: o.ref, designation: o.items?.map(it => it.name).join(', ') || '',
      fournisseur: o.fournisseur || '', montant: o.total || 0, date: o.date || 'Récent',
      statut: o.statut === 'completed' || o.statut === 'delivered' ? 'livre' : 'en_transit',
      projet: '', livMode: o.livMode || 'livraison', step: o.step || 1, partner: o.partner,
    }))
    return [...storeCmd, ...mktCmd]
  }, [store.commandes, store.sellerOrders])

  const rapports = useMemo(() => (store.rapports || []), [store.rapports])

  const fournisseurs = useMemo(() => {
    // Fournisseurs: registered pro users + contacts type='fournisseur'
    const registeredUsers = (store.fournisseurs || []).map(f => ({
      id: f.id, nom: f.nom || '', specialite: f.specialite || '', ville: f.ville || 'Abidjan',
      tel: f.tel || '', email: f.email || '', note: 0, nbAvis: 0,
      verified: f.verified || false,
      logoUrl: f.logoUrl || null,
      products: f.products || [],
      zones: f.zones || [],
      color: '#6B7280',
    }))
    const contactFournisseurs = (store.contacts || [])
      .filter(c => c.type === 'fournisseur')
      .map(c => ({
        id: c.id, nom: c.nom || c.name || '', specialite: c.role || '', ville: c.ville || '',
        tel: c.tel || '', email: c.email || '', note: 0, nbAvis: 0,
        verified: false,
        logoUrl: c.photo || c.avatar || null,
        products: [], zones: [],
        color: '#6B7280',
      }))
    const seen = new Set()
    return [...registeredUsers, ...contactFournisseurs].filter(f => {
      if (seen.has(f.id)) return false
      seen.add(f.id)
      return true
    })
  }, [store.fournisseurs, store.contacts])

  const transactions = useMemo(() => {
    return (store.transactions || [])
  }, [store.transactions])

  const wallets = useMemo(() => {
    return [...PAY_PROVIDERS, ...(store.wallets || []).filter(w => !PAY_PROVIDERS.find(p => p.id === w.id))]
  }, [store.wallets])

  const events = useMemo(() => {
    const deletedIds = new Set(store.deletedEventIds || [])
    const overrides = store.eventOverrides || {}
    return (store.events || []).filter(e => !deletedIds.has(e.id)).map(e => overrides[e.id] ? { ...e, ...overrides[e.id] } : e)
  }, [store.events, store.deletedEventIds, store.eventOverrides])

  const conversations = useMemo(() => {
    return (store.conversations || [])
  }, [store.conversations])

  const documents = useMemo(() => {
    const projectsMap = {}
    ;(store.projects || []).forEach(p => { if (p.id) projectsMap[p.id] = p.nom || p.name || '' })
    return (store.documents || [])
      .filter(d => !d._deleted)
      .map(d => ({
        ...d,
        // Backend returns `name`; legacy store/static data uses `nom`
        nom: d.nom || d.name || 'Sans titre',
        // Resolve project name from projectId if not already set
        projet: d.projet || (d.projectId ? projectsMap[d.projectId] || '' : ''),
        auteur: d.auteur || 'Moi',
        taille: d.taille || '—',
        date: d.date || d.createdAt || '',
        cat: d.cat || d.type || '',
        isNew: d.isNew || false,
      }))
  }, [store.documents, store.projects])

  // Badge counts — computed from store data only
  const badgeCounts = useMemo(() => ({
    offresEnAttente: offers.filter(o => o.statut === OFFER_STATUS.PENDING).length,
    messagesNonLus: (store.conversations || []).reduce((s, c) => s + (c.unread || 0), 0),
    aoOuverts: (store.aos || []).filter(a => a.status === 'open').length,
  }), [offers, store.conversations, store.aos])

  return {
    offers, markets, intervenants, clients, commandes, rapports,
    fournisseurs, transactions, wallets, events, conversations, documents,
    badgeCounts,
    // Re-export static data for pages that still need raw access (legacy/demo)
    STATIC: { OFFRES_DATA, MARCHES_DATA, COMMANDES_DATA, FOURNISSEURS_DATA, INTERVENANTS_DATA, PAY_TRANSACTIONS, PAY_PROVIDERS, DOCS_DATA, CAL_EVENTS, AO_DATA, MES_AO, CLIENTS_DATA },
  }
}
