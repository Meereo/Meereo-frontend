import { useMemo } from 'react'
import { useMeereo } from './useMeereoStore'

// Static data imports — kept ONLY for STATIC re-export (legacy pages still reference them)
// These are NOT merged into live data anymore — store.* is the single source of truth.
import { OFFRES_DATA } from '../data/offers'
import { MARCHES_DATA } from '../data/markets'
import { COMMANDES_DATA } from '../data/commandes'
import { RAPPORTS_DATA } from '../data/reports'
import { FOURNISSEURS_DATA } from '../data/fournisseurs'
import { INTERVENANTS_DATA } from '../data/intervenants'
import { CONVERSATIONS } from '../data/messages'
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
      id: o.id, titre: o.titre || o.title || '', entreprise: o.entreprise || o.company || '',
      projet: o.projet || '', montant: o.montant || '', delai: o.delai || '',
      statut: normalizeOfferStatus(overrides[o.id] || o.statut || o.status || OFFER_STATUS.PENDING),
      lot: o.lot || '',
      aoId: o.aoId || null,
      userId: o.userId || o.supplierId || null,
      supplierId: o.supplierId || o.userId || null,
      supplierRole: o.supplierRole || null,
      soumis: o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR') : 'Récent',
      lu: true, color: '#6B7280', score: 0, nbRef: 0, certifs: [], docs: [],
      message: o.message || o.note || '', technique: '', note: o.note || ''
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
    // Intervenants: merge store + static (static = demo directory, useful for pro)
    const storeInter = (store.intervenants || [])
    const storeIds = new Set(storeInter.map(i => i.id))
    return [...storeInter, ...INTERVENANTS_DATA.filter(i => !storeIds.has(i.id))]
  }, [store.intervenants])

  const clients = useMemo(() => {
    return (store.clients || [])
  }, [store.clients])

  const commandes = useMemo(() => {
    const storeCmd = (store.commandes || []).map(c => ({
      id: c.id, ref: c.ref || 'CMD-' + String(c.id).slice(-5), designation: c.article || c.designation || '',
      fournisseur: c.fournisseur || '', montant: c.montant || 0, date: 'Récent',
      statut: c.statut || 'confirmee', projet: c.projet || '', livMode: 'livraison', step: 1,
    }))
    const mktCmd = (store.sellerOrders || []).filter(o => o.scope === 'shared_with_project').map(o => ({
      id: o.id, ref: o.ref, designation: o.items?.map(it => it.name).join(', ') || '',
      fournisseur: o.fournisseur || '', montant: o.total || 0, date: o.date || 'Récent',
      statut: o.statut === 'completed' || o.statut === 'delivered' ? 'livre' : 'en_transit',
      projet: '', livMode: o.livMode || 'livraison', step: o.step || 1, partner: o.partner,
    }))
    return [...storeCmd, ...mktCmd]
  }, [store.commandes, store.sellerOrders])

  const rapports = useMemo(() => {
    const rapportStatuts = store.rapportStatuts || {}
    return (store.rapports || []).map(r => {
      const mapped = {
        id: r.id, type: r.type || 'hebdo', titre: r.type || 'Rapport', projet: r.projet || '',
        date: r.date || "Aujourd'hui", heure: r.heure || '', lieu: r.lieu || '',
        auteur: 'Moi', statut: 'brouillon', participants: r.participants ? r.participants.split(',') : [],
        points: r.ordre ? r.ordre.split('\n').filter(Boolean) : [], decisions: r.decisions ? [r.decisions] : [],
        alertes: r.alertes ? [r.alertes] : [], medias: [],
      }
      return rapportStatuts[r.id] ? { ...mapped, statut: rapportStatuts[r.id] } : mapped
    })
  }, [store.rapports, store.rapportStatuts])

  const fournisseurs = useMemo(() => {
    // Fournisseurs: store only (real users from PostgreSQL)
    return (store.fournisseurs || []).map(f => ({
      id: f.id, nom: f.nom || '', specialite: f.specialite || '', ville: f.ville || 'Abidjan',
      tel: f.tel || '', email: f.email || '', note: 0, nbAvis: 0, verified: false, color: '#6B7280',
    }))
  }, [store.fournisseurs])

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
    return (store.documents || []).filter(d => !d._deleted)
  }, [store.documents])

  // Badge counts — computed from store data only (no mocks)
  const badgeCounts = useMemo(() => ({
    offresEnAttente: offers.filter(o => o.statut === OFFER_STATUS.PENDING).length,
    messagesNonLus: (store.conversations || []).reduce((s, c) => s + (c.unread || 0), 0) + (store.messages || []).filter(m => !m.read).length,
    aoOuverts: (store.aos || []).filter(a => a.status === 'open').length,
  }), [offers, store.messages, store.conversations, store.aos])

  return {
    offers, markets, intervenants, clients, commandes, rapports,
    fournisseurs, transactions, wallets, events, conversations, documents,
    badgeCounts,
    // Re-export static data for pages that still need raw access (legacy/demo)
    STATIC: { OFFRES_DATA, MARCHES_DATA, COMMANDES_DATA, RAPPORTS_DATA, FOURNISSEURS_DATA, INTERVENANTS_DATA, CONVERSATIONS, PAY_TRANSACTIONS, PAY_PROVIDERS, DOCS_DATA, CAL_EVENTS, AO_DATA, MES_AO, CLIENTS_DATA },
  }
}
