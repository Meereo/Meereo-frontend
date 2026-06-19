import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import MoneyInput from '../../components/shared/MoneyInput'
import AoGear, { getMetierColor } from '../../components/shared/AoGear'
import ShareMenu from '../../components/shared/ShareMenu'
import { METIERS_AO } from '../../data/ao'
import { useMeereo } from '../../hooks/useMeereoStore'
import { api } from '../../services/api/client'
import { useMergedData } from '../../hooks/useMergedData'
import { ANNUAIRE_PLATEFORME } from '../../data/chantier'
import { DSPageHeader, DSFilterBar } from '../../design/components'
import { formatBudgetDisplay } from '../../utils/helpers'
import { getEntrepriseAvatar } from '../../data/avatars'
import InviteProfessionalModal from '../../components/shared/InviteProfessionalModal'
import { getRoleLabel, getRoleBadgeStyle } from '../../domain/roleLabels'
import { Zap, Lock, RefreshCcw, ClipboardList, Radio, Inbox, Paperclip, FileText, AlertTriangle, Check, Star, Globe } from 'lucide-react'


// Documents entreprise — status: missing | uploaded | generated
const DOCS_ENTREPRISE_TEMPLATE = [
  { id: 'de1', nom: 'RCCM', type: 'Juridique' },
  { id: 'de2', nom: 'Attestation fiscale 2025', type: 'Fiscal' },
  { id: 'de3', nom: 'Attestation CNPS', type: 'Social' },
  { id: 'de4', nom: 'Assurance décennale', type: 'Assurance' },
  { id: 'de5', nom: 'Références projets (portfolio)', type: 'Référence' },
  { id: 'de6', nom: 'Organigramme équipe', type: 'RH' },
  { id: 'de7', nom: 'Certificat de qualification', type: 'Qualification' },
  { id: 'de8', nom: 'Bilan financier 2024', type: 'Financier' },
]

export default function BoursePage({ showToast, onNavigate }) {
  const { store, updateStore, createAO: storeCreateAO, submitOffer: storeSubmitOffer, sendAOInvitation, deleteAO, archiveAO, acceptOffer: storeAcceptOffer, rejectOffer: storeRejectOffer } = useMeereo()
  const { STATIC: { INTERVENANTS_DATA } } = useMergedData()
  const [tab, setTab] = useState(store.user?.type === 'client' ? 'mesao' : 'marche')
  const [selectedId, setSelectedId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [metierFilter, setMetierFilter] = useState([]) // [] = tous, ['Architecte','CVC'] = multi-select
  const [suivis, setSuivis] = useState([])
  const [showCreateAO, setShowCreateAO] = useState(false)
  const [newAO, setNewAO] = useState({ titre: '', metier: '', projet: '', budget: '', deadline: '', desc: '', prive: false, listeRestreinte: [] })
  const [aoInviteSearch, setAoInviteSearch] = useState('')
  const [showRepondre, setShowRepondre] = useState(null)
  // Documents entreprise : lus depuis le store (seuls les uploaded/generated sont joinables)
  const entrepriseDocs = useMemo(() => {
    const stored = store.entrepriseDocs || []
    return DOCS_ENTREPRISE_TEMPLATE.map(tpl => {
      const found = stored.find(s => s.id === tpl.id)
      return found ? { ...tpl, ...found } : { ...tpl, status: 'missing' }
    })
  }, [store.entrepriseDocs])
  // Aussi inclure les vrais documents importés dans le Dossier Entreprise (DocumentsPage)
  const uploadedEnterpriseDocs = useMemo(() =>
    (store.documents || []).filter(d => !d._deleted && (d.isEntreprise || d.category === 'entreprise'))
      .map(d => ({ id: d.id, nom: d.nom || d.name, type: d.cat || d.type || 'Document', status: 'uploaded', uploadedAt: d.createdAt || d.date })),
  [store.documents])
  const availableDocs = [
    ...entrepriseDocs.filter(d => d.status === 'uploaded' || d.status === 'generated'),
    // Dédupliquer si même id
    ...uploadedEnterpriseDocs.filter(d => !entrepriseDocs.some(t => t.id === d.id)),
  ]
  const [reponse, setReponse] = useState({ montant: '', delai: '', message: '', technique: '', docsJoints: [], docsEntreprise: [] })
  const [showDocsIntro, setShowDocsIntro] = useState(true)
  const [showInviteModal, setShowInviteModal] = useState(null) // AO object
  const [confirmDeleteAO, setConfirmDeleteAO] = useState(null) // AO object to delete
  const [tradeSearch, setTradeSearch] = useState('')
  const [tradeDropdownOpen, setTradeDropdownOpen] = useState(false)
  const tradeComboRef = useRef(null)
  const [, refresh] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [aoSubmitted, setAoSubmitted] = useState(false)
  const [reponseSubmitted, setReponseSubmitted] = useState(false)
  const [showEditAO, setShowEditAO] = useState(null) // AO object being edited
  const [editAOForm, setEditAOForm] = useState({ titre: '', metier: '', budget: '', deadline: '', desc: '' })
  const userType = store.user?.type || 'pro'
  const isClient = userType === 'client'

  // Secteurs de l'utilisateur — depuis onboarding uniquement (pas de fallback codé en dur)
  // Si vide → mesSecteurs.length === 0 → le filtre trade_only ne s'applique pas
  const mesSecteurs = useMemo(() => {
    const ob = store.onboardingData || {}
    return ob.services || ob.secteurs || []
  }, [store.onboardingData])

  // Source unique : tous les AO visibles par cet utilisateur (store only, no mocks)
  const allPublicAO = useMemo(() => {
    const uType = store.user?.type
    const userId = store.user?.id
    return (store.aos || [])
      .filter(a => a.status === 'open')
      .filter(a => {
        // Les clients ne voient pas les AOs des autres clients
        if (uType === 'client' && a.ownerUserId && a.ownerUserId !== userId) return false
        // trade_only : filtrer par métier SEULEMENT si le pro a des secteurs renseignés
        // → un nouveau compte sans secteurs voit quand même tous les AOs publics
        if (a.visibilityScope === 'trade_only' && a.requestedTrade && uType === 'pro' && mesSecteurs.length > 0) {
          return mesSecteurs.some(s =>
            s.toLowerCase() === (a.requestedTrade || '').toLowerCase() ||
            (a.requestedTrade || '').toLowerCase().includes(s.toLowerCase()) ||
            s.toLowerCase().includes((a.requestedTrade || '').toLowerCase())
          )
        }
        return true
      })
      .map(a => ({
        id: a.id, ref: 'AO-CLI-' + String(a.id).slice(-5), titre: a.title || a.titre, maoa: 'Client', lieu: '', budget: a.budget || '—',
        deadline: '—', statut: 'ouvert', categorie: a.lot || '', metier: a.requestedTrade || a.lot || '', desc: a.description || '',
        matching: 0, matching_raisons: [], fromClient: true, ownerUserId: a.ownerUserId, ownerRole: a.ownerRole || null,
      }))
  }, [store.aos, store.user, mesSecteurs])

  // Filtrage unique utilisé par stats ET liste
  const marcheFiltered = allPublicAO.filter(a => {
    const statOk = filter === 'all' || (filter === 'ouvert' && a.statut === 'ouvert') || (filter === 'suivi' && suivis.includes(a.id)) || (filter === 'secteur' && mesSecteurs.some(s => (a.metier || '').toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes((a.metier || '').toLowerCase())))
    const metierOk = metierFilter.length === 0 || metierFilter.includes(a.metier)
    return statOk && metierOk
  })

  // Mes AO — source unique: store.aos (no mocks)
  // Client: shows AOs they OWN. Pro: shows AOs they CREATED (not client-created)
  const allMesAO = useMemo(() => {
    const userId = store.user?.id
    return (store.aos || []).filter(a => {
      if (isClient) return a.ownerUserId === userId
      return !a.createdByClient
    }).map(a => ({
      id: a.id, ref: 'AO-' + String(a.id).slice(-5), titre: a.title || a.titre, projet: '', metier: a.lot || a.requestedTrade || '',
      budget: a.budget || '—', deadline: '—', statut: a.status === 'closed' ? 'clos' : a.status === 'attributed' ? 'attribué' : a.status === 'cancelled_by_owner' ? 'annulé' : a.status === 'archived' ? 'archivé' : 'ouvert', rawStatus: a.status, desc: a.description || '',
      reponses: (store.offers || []).filter(o => o.aoId === a.id).length,
      publie: a.createdAt ? new Date(a.createdAt).toLocaleDateString('fr-FR') : "Aujourd'hui",
    }))
  }, [store.aos, store.offers, store.user, isClient])

  // Offres reçues par le client — filtrées par ownership des AOs
  const clientReceivedOffers = useMemo(() => {
    if (!isClient) return []
    const userId = store.user?.id
    const myAOIds = new Set((store.aos || []).filter(a => a.ownerUserId === userId).map(a => a.id))
    return (store.offers || []).filter(o => myAOIds.has(o.aoId)).map(o => ({
      id: o.id, titre: o.titre || o.entreprise || '', entreprise: o.entreprise || '',
      montant: o.montant || '', delai: o.delai || '', statut: o.statut || o.status || 'pending',
      aoId: o.aoId, userId: o.userId || o.supplierId || '',
      soumis: o.createdAt ? new Date(o.createdAt).toLocaleDateString('fr-FR') : 'Récent',
    }))
  }, [isClient, store.aos, store.offers, store.user])

  const selectedOffer = tab === 'offres' ? (selectedId ? clientReceivedOffers.find(o => o.id === selectedId) : clientReceivedOffers[0]) : null

  // Close trade combobox on click outside
  useEffect(() => {
    if (!tradeDropdownOpen) return
    const handler = (e) => { if (tradeComboRef.current && !tradeComboRef.current.contains(e.target)) setTradeDropdownOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [tradeDropdownOpen])

  // Rafraîchir les AOs + offres — appelé au montage et via le bouton Actualiser
  const doRefresh = useCallback(() => {
    setRefreshing(true)
    Promise.all([
      api.aos.getAll().catch(() => null),
      api.offers.getAll().catch(() => null),
    ]).then(([freshAos, freshOffers]) => {
      updateStore(prev => ({
        ...prev,
        ...(freshAos ? { aos: freshAos } : {}),
        ...(freshOffers ? { offers: freshOffers } : {}),
      }))
    }).finally(() => setRefreshing(false))
  }, [updateStore])

  useEffect(() => {
    doRefresh()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Filtered trades for combobox search
  const filteredTrades = useMemo(() => {
    const q = tradeSearch.toLowerCase().trim()
    if (!q) return METIERS_AO
    return METIERS_AO.filter(m => m.toLowerCase().includes(q))
  }, [tradeSearch])

  const selectedMarche = tab === 'marche' ? (selectedId ? allPublicAO.find(a => a.id === selectedId) : marcheFiltered[0]) : null
  const selectedMesAO = tab === 'mesao' ? (selectedId ? allMesAO.find(a => a.id === selectedId) : allMesAO[0]) : null

  // Vérifier si le pro a déjà postulé à un AO donné
  const myOfferForAO = (aoId) => (store.offers || []).find(o => o.aoId === aoId && (o.supplierId === store.user?.id || o.userId === store.user?.id))
  const alreadyApplied = (aoId) => !!myOfferForAO(aoId)

  const createAO = () => {
    setAoSubmitted(true)
    if (!newAO.titre.trim() || !newAO.metier) return
    storeCreateAO({ title: newAO.titre, description: newAO.desc, budget: newAO.budget, lot: newAO.metier, projectId: newAO.projet || null })
    setShowCreateAO(false)
    setAoSubmitted(false)
    setNewAO({ titre: '', metier: '', projet: '', budget: '', deadline: '', desc: '' })
    refresh(n => n + 1)
    showToast && showToast('AO publie — visible par les ' + newAO.metier + 's')
  }

  const submitReponse = () => {
    setReponseSubmitted(true)
    const ao = showRepondre
    // Use store.submitOffer with permission guards instead of raw updateStore
    const result = storeSubmitOffer({
      aoId: ao?.id,
      montant: reponse.montant,
      delai: reponse.delai || '',
      message: reponse.message || '',
      entreprise: store.onboardingData?.entreprise || store.user?.company || store.user?.name || '',
    })
    if (!result) return // Permission denied — toast already shown by store
    setShowRepondre(null)
    setReponseSubmitted(false)
    showToast && showToast('Offre soumise avec ' + reponse.docsEntreprise.length + ' documents entreprise + ' + reponse.docsJoints.length + ' pièces jointes')
  }

  return (
    <div>
      <DSPageHeader
        title={tab === 'marche' ? "Bourse des appels d'offres" : tab === 'mesao' ? 'Mes appels d\u2019offres' : 'Offres reçues'}
        subtitle={tab === 'marche' ? `${marcheFiltered.length} disponibles sur le marché` : tab === 'mesao' ? `${allMesAO.length} publiés par vous` : `${clientReceivedOffers.length} offre${clientReceivedOffers.length > 1 ? 's' : ''} reçue${clientReceivedOffers.length > 1 ? 's' : ''}`}
      >
        <DSFilterBar
          filters={(isClient
            ? [['marche', 'Bourse'], ['mesao', 'Mes AO'], ['offres', 'Offres reçues']]
            : [['marche', 'Marché'], ['mesao', 'Mes AO'], ['docs', 'Mes documents']]
          ).map(([k, l]) => ({ key: k, label: l }))}
          active={tab}
          onChange={k => { setTab(k); setSelectedId(null) }}
        />
        <button
          className="btn btn-sm"
          onClick={doRefresh}
          disabled={refreshing}
          title="Actualiser les appels d'offres"
          style={{ opacity: refreshing ? .5 : 1, transition: 'opacity .2s' }}
        >
          {refreshing ? '⏳' : '🔄'}
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => setShowCreateAO(true)}>+ Créer un AO</button>
      </DSPageHeader>

      {/* ═══ TAB: Documents entreprise ═══ */}
      {tab === 'docs' && (
        <div>
          {/* Intro popup — first time */}
          {showDocsIntro && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setShowDocsIntro(false)}>
              <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 480, boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
                <div style={{ padding: '28px 28px 20px', textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><span style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>K</span></div>
                  <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-.5px', marginBottom: 8 }}>Vos documents entreprise</div>
                  <div style={{ fontSize: 13, color: 'var(--t3)', lineHeight: 1.65, maxWidth: 380, margin: '0 auto' }}>
                    Integrez vos documents administratifs et juridiques ici. <span style={{ color: '#7C3AED', fontWeight: 700 }}>KAI</span> les utilisera automatiquement pour completer vos reponses aux appels d'offres — RCCM, attestations, references, bilans...
                  </div>
                </div>
                <div style={{ padding: '0 28px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { icon: <Zap size={18}/>, title: 'Réponse automatique', desc: 'KAI joint vos documents quand vous répondez à un AO' },
                    { icon: <Lock size={18}/>, title: 'Sécurisé', desc: 'Vos documents ne sont partagés qu\'avec votre accord' },
                    { icon: <RefreshCcw size={18}/>, title: 'Toujours à jour', desc: 'Mettez à jour un document et il sera actualisé partout' },
                  ].map((f, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--s2)', borderRadius: 10 }}>
                      <span style={{ flexShrink: 0, display: 'flex' }}>{f.icon}</span>
                      <div><div style={{ fontSize: 12, fontWeight: 700 }}>{f.title}</div><div style={{ fontSize: 11, color: 'var(--t3)' }}>{f.desc}</div></div>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '14px 28px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="btn btn-sm" onClick={() => setShowDocsIntro(false)}>Je prefere faire manuellement</button>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowDocsIntro(false)}>Commencer a ajouter mes documents</button>
                </div>
              </div>
            </div>
          )}

          <div style={{ padding: '16px 20px', background: 'var(--s2)', borderRadius: 12, marginBottom: 20, border: '1px solid var(--border-card)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>K</span></div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>Documents entreprise</div>
                <div style={{ fontSize: 11, color: 'var(--t3)' }}>Ajoutez vos documents pour les joindre à vos réponses aux appels d'offres.</div>
              </div>
            </div>
            {availableDocs.length === 0 && <div style={{ fontSize: 11, color: 'var(--wrn)', fontWeight: 600, marginTop: 8, display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={12}/> Aucun document entreprise ajouté</div>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {entrepriseDocs.map(d => (
              <div key={d.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: d.status === 'missing' ? 'rgba(186,26,26,.04)' : 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{d.status === 'missing' ? <ClipboardList size={16} color="var(--err)"/> : <FileText size={16} color="var(--t3)"/>}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{d.nom}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)' }}>{d.type}</div>
                </div>
                {d.status === 'missing' && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(186,26,26,.06)', color: 'var(--err)' }}>Non fourni</span>}
                {d.status === 'uploaded' && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(52,199,89,.08)', color: 'var(--ok)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Check size={8}/> Ajouté</span>}
                {d.status === 'generated' && <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(124,58,237,.08)', color: '#7C3AED' }}>Généré par KAI</span>}
                {d.status === 'missing' ? (
                  <button className="btn btn-sm" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => { updateStore(prev => ({ ...prev, entrepriseDocs: [...(prev.entrepriseDocs || []), { id: d.id, status: 'uploaded', uploadedAt: new Date().toISOString() }] })); showToast && showToast('Document ajouté') }}>Ajouter</button>
                ) : (
                  <button className="btn btn-sm" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => showToast && showToast('Remplacer le document...')}>Remplacer</button>
                )}
              </div>
            ))}
            <div style={{ padding: '20px', border: '2px dashed var(--border-subtle)', borderRadius: 12, textAlign: 'center', cursor: 'pointer', marginTop: 8 }} onClick={() => showToast && showToast('Ajouter un document...')}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>+</div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--t2)' }}>Ajouter un document entreprise</div>
              <div style={{ fontSize: 10.5, color: 'var(--t4)', marginTop: 2 }}>RCCM, bilans, attestations, certifications...</div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TAB: Marché & Mes AO ═══ */}
      {tab !== 'docs' && (
        <>
          {/* KPI */}
          <div className="rg-2" style={{ gap: 20, marginBottom: 24 }}>
            <div style={{ background: 'linear-gradient(145deg,#191c1d,#3c3b3b)', borderRadius: 12, padding: 22, color: '#fff' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>{tab === 'marche' ? 'Bourse des AO' : tab === 'mesao' ? 'Mes appels d\u2019offres' : 'Offres reçues'}</div>
              <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: '-2.5px', lineHeight: 1, marginBottom: 5 }}>{tab === 'marche' ? marcheFiltered.length : tab === 'mesao' ? allMesAO.length : clientReceivedOffers.length}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.45)' }}>{tab === 'marche' ? 'disponibles sur le marché' : tab === 'mesao' ? 'publiés par vous' : 'propositions de professionnels'}</div>
            </div>
            <div className="rg-2" style={{ gap: 12 }}>
              {(tab === 'offres'
                ? [{ v: clientReceivedOffers.filter(o => o.statut === 'pending').length, l: 'En attente' }, { v: clientReceivedOffers.filter(o => o.statut === 'accepted').length, l: 'Acceptées' }, { v: new Set(clientReceivedOffers.map(o => o.aoId)).size, l: 'AO concernés' }, { v: clientReceivedOffers.length, l: 'Total' }]
                : tab === 'marche'
                ? isClient
                  ? [{ v: allPublicAO.filter(a => a.statut === 'ouvert').length, l: 'Ouverts' }, { v: suivis.length, l: 'Suivis' }, { v: (store.aoInvitations || []).filter(i => i.senderUserId === store.user?.id).length, l: 'Invitations' }, { v: allPublicAO.length, l: 'Total' }]
                  : [{ v: allPublicAO.filter(a => a.statut === 'ouvert').length, l: 'Ouverts' }, { v: suivis.length, l: 'Suivis' }, { v: mesSecteurs.length, l: 'Mes secteurs' }, { v: allPublicAO.length, l: 'Total' }]
                : isClient
                  ? [{ v: allMesAO.filter(a => a.statut === 'ouvert').length, l: 'AO ouverts' }, { v: allMesAO.reduce((s, a) => s + (a.reponses || 0), 0), l: 'Offres reçues' }, { v: (store.aoInvitations || []).filter(i => i.senderUserId === store.user?.id).length, l: 'Invitations' }, { v: allMesAO.length, l: 'Total' }]
                  : [{ v: allMesAO.filter(a => a.statut === 'ouvert').length, l: 'Ouverts' }, { v: allMesAO.reduce((s, a) => s + (a.reponses || 0), 0), l: 'Réponses' }, { v: [...new Set(allMesAO.map(a => a.metier))].length, l: 'Métiers' }, { v: allMesAO.length, l: 'Total' }]
              ).map((k, i) => (
                <div key={i} className="card" style={{ padding: 16, background: '#fff', border: '1px solid #EAEAEA', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}><div style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-.8px', marginBottom: 4 }}>{k.v}</div><div style={{ fontSize: 12, color: 'var(--t3)' }}>{k.l}</div></div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #EAEAEA', marginTop: 28, paddingTop: 24, background: '#F5F5F5', borderRadius: 14, padding: 16 }}>
          <div className="split" style={{ background: '#fff', borderRadius: 12, border: '1px solid #EAEAEA', boxShadow: '0 1px 4px rgba(0,0,0,.04)', overflow: 'hidden' }}>
            <div className="split-left">
              <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {tab === 'marche' && (
                  <>
                    {/* Niveau 1 — Statut */}
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      {[['all', 'Tous'], ['ouvert', 'Ouverts'], ['suivi', 'Suivis'], ...(!isClient ? [['secteur', 'Mes secteurs']] : [])].map(([k, l]) => (
                        <button key={k} className={`filter-pill ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>{l}</button>
                      ))}
                    </div>
                    {/* Niveau 2 — Métier */}
                    {isClient ? (
                      <div ref={tradeComboRef} style={{ position: 'relative' }}>
                        <div
                          onClick={() => setTradeDropdownOpen(!tradeDropdownOpen)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8,
                            border: tradeDropdownOpen ? '1.5px solid var(--tx)' : '1px solid var(--border-subtle)',
                            background: 'var(--surface-1)', cursor: 'pointer', transition: 'border-color .15s',
                            minHeight: 30, fontSize: 12, fontFamily: 'var(--f)', color: 'var(--tx)',
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, opacity: .4 }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                          {tradeDropdownOpen ? (
                            <input
                              autoFocus
                              value={tradeSearch}
                              onChange={e => setTradeSearch(e.target.value)}
                              onClick={e => e.stopPropagation()}
                              onKeyDown={e => {
                                if (e.key === 'Escape') { setTradeDropdownOpen(false); setTradeSearch('') }
                                if (e.key === 'Enter' && filteredTrades.length === 1) { setMetierFilter(filteredTrades[0]); setTradeDropdownOpen(false); setTradeSearch('') }
                              }}
                              placeholder="Rechercher un métier..."
                              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 12, fontFamily: 'var(--f)', color: 'var(--tx)', flex: 1, minWidth: 0, padding: 0 }}
                            />
                          ) : (
                            <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: metierFilter.length > 0 ? 600 : 400, color: metierFilter.length > 0 ? 'var(--tx)' : 'var(--t3)' }}>
                              {metierFilter.length === 0 ? 'Type de professionnel recherché' : metierFilter.join(', ')}
                            </span>
                          )}
                          {metierFilter.length > 0 && !tradeDropdownOpen && (
                            <button onClick={e => { e.stopPropagation(); setMetierFilter([]) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'var(--t3)', flexShrink: 0 }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                          )}
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ flexShrink: 0, opacity: .35, transform: tradeDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                        {tradeDropdownOpen && (
                          <div style={{
                            position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100,
                            background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 10,
                            boxShadow: '0 8px 32px rgba(0,0,0,.12)', maxHeight: 240, overflowY: 'auto',
                            animation: 'modalIn .12s ease',
                          }}>
                            <div
                              onClick={() => { setMetierFilter([]); setTradeDropdownOpen(false); setTradeSearch('') }}
                              style={{
                                padding: '9px 12px', fontSize: 12, fontFamily: 'var(--f)', cursor: 'pointer',
                                fontWeight: metierFilter.length === 0 ? 700 : 400, color: metierFilter.length === 0 ? 'var(--tx)' : 'var(--t2)',
                                background: metierFilter.length === 0 ? 'var(--s2)' : 'transparent',
                                borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 8,
                              }}
                              onMouseOver={e => { if (metierFilter.length > 0) e.currentTarget.style.background = 'var(--s2)' }}
                              onMouseOut={e => { if (metierFilter.length > 0) e.currentTarget.style.background = '' }}
                            >
                              <span style={{ width: 6, height: 6, borderRadius: '50%', background: metierFilter.length === 0 ? 'var(--tx)' : 'transparent', flexShrink: 0 }} />
                              Tous les métiers
                            </div>
                            {filteredTrades.map(m => {
                              const isActive = metierFilter.includes(m)
                              return (
                                <div
                                  key={m}
                                  onClick={() => { setMetierFilter(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]); setTradeSearch('') }}
                                  style={{
                                    padding: '9px 12px', fontSize: 12, fontFamily: 'var(--f)', cursor: 'pointer',
                                    fontWeight: isActive ? 700 : 400, color: isActive ? 'var(--tx)' : 'var(--t2)',
                                    background: isActive ? 'var(--s2)' : 'transparent',
                                    display: 'flex', alignItems: 'center', gap: 8,
                                  }}
                                  onMouseOver={e => { if (!isActive) e.currentTarget.style.background = 'var(--s2)' }}
                                  onMouseOut={e => { if (!isActive) e.currentTarget.style.background = '' }}
                                >
                                  <span style={{ width: 14, height: 14, borderRadius: 4, border: isActive ? 'none' : '1.5px solid var(--border-card)', background: isActive ? 'var(--tx)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    {isActive && <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                                  </span>
                                  {m}
                                </div>
                              )
                            })}
                            {filteredTrades.length === 0 && (
                              <div style={{ padding: '16px 12px', textAlign: 'center', fontSize: 12, color: 'var(--t4)' }}>Aucun métier trouvé</div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                        <button className={`filter-pill ${metierFilter.length === 0 ? 'active' : ''}`} onClick={() => setMetierFilter([])} style={{ fontSize: 10 }}>Tous métiers</button>
                        {METIERS_AO.map(m => {
                          const active = metierFilter.includes(m)
                          const mc = getMetierColor(m)
                          return (
                            <button key={m} className={active ? '' : 'filter-pill'} onClick={() => setMetierFilter(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])} style={active ? { fontSize: 10, padding: '4px 10px', borderRadius: 100, border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', fontWeight: 700, background: mc, color: '#fff', transition: 'all .15s' } : { fontSize: 10 }}>{m}</button>
                          )
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
              {tab === 'marche' && isClient && marcheFiltered.length > 0 && (
                <div style={{ padding: '8px 14px', margin: '0 0 4px', fontSize: 11, color: 'var(--t4)', background: 'rgba(0,122,255,.04)', borderRadius: 8, lineHeight: 1.5 }}>
                  Vous consultez les appels d'offres. Seuls les professionnels peuvent y répondre. Vous pouvez inviter ou partager un AO.
                </div>
              )}
              {tab === 'marche' && marcheFiltered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ marginBottom: 12, opacity: .3, display: 'flex', justifyContent: 'center' }}><ClipboardList size={32}/></div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>Aucun appel d'offres disponible</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginBottom: 16 }}>Les appels d'offres publiés sur la plateforme apparaîtront ici.</div>
                </div>
              )}
              {tab === 'marche' && marcheFiltered.map(ao => {
                const mc = getMetierColor(ao.metier)
                return (
                  <div key={ao.id} className="list-item" style={{ background: selectedMarche?.id === ao.id ? 'var(--s2)' : undefined }} onClick={() => setSelectedId(ao.id)}>
                    <div className="list-item-body">
                      <div className="list-item-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><AoGear size={12} color={mc} />{ao.titre}</div>
                      <div className="list-item-sub">{ao.maoa} · {ao.lieu}</div>
                    </div>
                    <div className="list-item-right">
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: mc + '12', color: mc }}>{ao.metier}</span>
                      <div className="list-item-date">{formatBudgetDisplay(ao.budget)}</div>
                    </div>
                  </div>
                )
              })}
              {tab === 'mesao' && allMesAO.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ marginBottom: 12, opacity: .3, display: 'flex', justifyContent: 'center' }}><Radio size={32}/></div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>Vous n'avez encore publié aucun appel d'offres</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)' }}>Publiez un AO pour recevoir des propositions.</div>
                </div>
              )}
              {tab === 'mesao' && allMesAO.map(ao => {
                const mc = getMetierColor(ao.metier)
                return (
                <div key={ao.id} className="list-item" style={{ background: selectedMesAO?.id === ao.id ? 'var(--s2)' : undefined }} onClick={() => setSelectedId(ao.id)}>
                  <div className="list-item-body">
                    <div className="list-item-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}><AoGear size={12} color={mc} />{ao.titre}</div>
                    <div className="list-item-sub">{ao.projet} · {ao.metier}</div>
                  </div>
                  <div className="list-item-right">
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: ao.reponses > 0 ? 'rgba(52,199,89,.08)' : 'rgba(245,158,11,.08)', color: ao.reponses > 0 ? 'var(--ok)' : 'var(--wrn)' }}>{ao.reponses > 0 ? ao.reponses + ' rép.' : 'En attente'}</span>
                    <div className="list-item-date">{formatBudgetDisplay(ao.budget)}</div>
                  </div>
                </div>
                )
              })}
              {/* ═══ Offres reçues — liste ═══ */}
              {tab === 'offres' && clientReceivedOffers.length === 0 && (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ marginBottom: 12, opacity: .3, display: 'flex', justifyContent: 'center' }}><Inbox size={32}/></div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>Vous n'avez encore reçu aucune offre</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)' }}>Les offres des professionnels apparaîtront ici.</div>
                </div>
              )}
              {tab === 'offres' && clientReceivedOffers.map(o => (
                <div key={o.id} className="list-item" style={{ background: selectedOffer?.id === o.id ? 'var(--s2)' : undefined }} onClick={() => setSelectedId(o.id)}>
                  <div className="list-item-body">
                    <div className="list-item-title">{o.entreprise}</div>
                    <div className="list-item-sub">{formatBudgetDisplay(o.montant)} · {o.delai}</div>
                  </div>
                  <div className="list-item-right">
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 100, background: o.statut === 'accepted' ? 'rgba(52,199,89,.08)' : o.statut === 'rejected' ? 'rgba(220,38,38,.06)' : 'rgba(245,158,11,.08)', color: o.statut === 'accepted' ? 'var(--ok)' : o.statut === 'rejected' ? 'var(--err)' : 'var(--wrn)' }}>{o.statut === 'accepted' ? 'Acceptée' : o.statut === 'rejected' ? 'Refusée' : 'En attente'}</span>
                    <div className="list-item-date">{o.soumis}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="split-right">
              {/* Marché detail */}
              {tab === 'marche' && !selectedMarche && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}><div style={{ opacity: .4 }}><ClipboardList size={28}/></div><div style={{ fontSize: 14, fontWeight: 600 }}>Selectionnez un AO</div></div>}
              {tab === 'marche' && selectedMarche && (() => {
                const mc = getMetierColor(selectedMarche.metier)
                return (
                <div>
                  <div style={{ background: 'linear-gradient(145deg,#191c1d,#3c3b3b)', borderRadius: 14, padding: '28px 28px 24px', color: '#fff', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(255,255,255,.05),transparent 55%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative' }}>
                      {/* Eyebrow */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Appel d'offres</span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,.25)' }}>·</span>
                        <span style={{ fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,.3)', fontFamily: 'monospace' }}>{selectedMarche.ref}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(52,199,89,.15)', color: '#34c759' }}>Ouvert</span>
                      </div>
                      {/* Titre */}
                      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.4px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, lineHeight: 1.25 }}><AoGear size={16} color={mc} />{selectedMarche.titre}</div>
                      {/* Meta */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: mc + '22', color: mc }}>{selectedMarche.metier}</span>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,.4)' }}>{selectedMarche.maoa}{selectedMarche.lieu ? ' · ' + selectedMarche.lieu : ''}</span>
                        {selectedMarche.matching && <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: 'rgba(255,255,255,.1)', color: '#F59E0B', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Zap size={10}/> {selectedMarche.matching}%</span>}
                      </div>
                    </div>
                  </div>
                  <div className="rg-3" style={{ gap: 12, marginBottom: 20 }}>
                    {[['Budget', selectedMarche.budget], ['Cloture', selectedMarche.deadline], ['Categorie', selectedMarche.categorie]].map(([l, v]) => (
                      <div key={l} className="card" style={{ padding: '16px 18px' }}><div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 5 }}>{l}</div><div style={{ fontSize: 15, fontWeight: 700 }}>{v}</div></div>
                    ))}
                  </div>
                  {selectedMarche.matching && (
                    <div className="card" style={{ padding: 18, marginBottom: 20 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: 'var(--t4)' }}>Score de pertinence</div>
                        <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: selectedMarche.matching >= 85 ? 'rgba(52,199,89,.1)' : 'rgba(255,149,0,.1)', color: selectedMarche.matching >= 85 ? 'var(--ok)' : 'var(--wrn)', display: 'inline-flex', alignItems: 'center', gap: 3 }}><Zap size={10}/> {selectedMarche.matching}%</span>
                      </div>
                      <div className="prog-track" style={{ height: 4, marginBottom: 12 }}><div className="prog-fill" style={{ width: selectedMarche.matching + '%', background: selectedMarche.matching >= 85 ? 'var(--ok)' : 'var(--wrn)' }} /></div>
                      {selectedMarche.matching_raisons && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>{selectedMarche.matching_raisons.map((r, i) => <span key={i} style={{ fontSize: 11, background: 'rgba(52,199,89,.08)', color: 'var(--ok)', padding: '3px 10px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 3 }}><Check size={9}/> {r}</span>)}</div>}
                    </div>
                  )}
                  <div className="card" style={{ padding: 18, marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 10 }}>Description</div>
                    <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.75 }}>{selectedMarche.desc}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button style={{ flex: 1, padding: 11, borderRadius: 9, border: '1px solid var(--border-card)', background: suivis.includes(selectedMarche.id) ? 'var(--tx)' : 'var(--surface-1)', color: suivis.includes(selectedMarche.id) ? '#fff' : 'var(--t2)', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 12.5 }}
                      onClick={() => { setSuivis(prev => prev.includes(selectedMarche.id) ? prev.filter(x => x !== selectedMarche.id) : [...prev, selectedMarche.id]) }}>
                      {suivis.includes(selectedMarche.id) ? <><Star size={13} fill="currentColor"/> Suivi</> : <><Star size={13}/> Suivre</>}
                    </button>
                    <ShareMenu url={window.location.origin + '/ao/' + selectedMarche.id} text={'Appel d\'offres : ' + (selectedMarche.titre || '')} onCopied={() => showToast && showToast('Lien copié')} />
                    {isClient ? (
                      <button className="btn btn-primary" style={{ flex: 2, padding: 11, borderRadius: 9, fontSize: 12.5, fontWeight: 600 }} onClick={() => setShowInviteModal(selectedMarche)}>Inviter un professionnel →</button>
                    ) : alreadyApplied(selectedMarche.id) ? (
                      <div style={{ flex: 2, padding: 11, borderRadius: 9, background: 'rgba(52,199,89,.08)', border: '1px solid rgba(52,199,89,.3)', fontSize: 12.5, fontWeight: 600, color: '#16a34a', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Check size={14}/> Offre soumise — {myOfferForAO(selectedMarche.id)?.montant || ''} FCFA
                      </div>
                    ) : (
                      <button className="btn btn-primary" style={{ flex: 2, padding: 11, borderRadius: 9, fontSize: 12.5, fontWeight: 600 }} onClick={() => { setShowRepondre(selectedMarche); setReponse({ montant: '', delai: '', message: '', technique: '', docsJoints: [], docsEntreprise: availableDocs.map(d => d.id) }) }}>Répondre à l'appel d'offres →</button>
                    )}
                  </div>
                </div>
                )
              })()}

              {/* Mes AO detail */}
              {tab === 'mesao' && !selectedMesAO && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}><div style={{ opacity: .4 }}><ClipboardList size={28}/></div><div style={{ fontSize: 14, fontWeight: 600 }}>Selectionnez un de vos AO</div></div>}
              {/* Offres reçues detail */}
              {tab === 'offres' && !selectedOffer && <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10 }}><div style={{ opacity: .4 }}><Inbox size={28}/></div><div style={{ fontSize: 14, fontWeight: 600 }}>Sélectionnez une offre</div></div>}
              {tab === 'offres' && selectedOffer && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--tx)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff', flexShrink: 0 }}>{(selectedOffer.entreprise || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.3px', marginBottom: 3 }}>{selectedOffer.entreprise}</div>
                      <div style={{ fontSize: 12, color: 'var(--t3)' }}>Soumis le {selectedOffer.soumis}</div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: selectedOffer.statut === 'accepted' ? 'rgba(52,199,89,.08)' : selectedOffer.statut === 'rejected' ? 'rgba(220,38,38,.06)' : 'rgba(245,158,11,.08)', color: selectedOffer.statut === 'accepted' ? 'var(--ok)' : selectedOffer.statut === 'rejected' ? 'var(--err)' : 'var(--wrn)' }}>{selectedOffer.statut === 'accepted' ? 'Acceptée' : selectedOffer.statut === 'rejected' ? 'Refusée' : 'En attente'}</span>
                  </div>
                  <div style={{ padding: '18px 20px', background: 'linear-gradient(145deg,#0f1011,#2a2c2d)', borderRadius: 14, color: '#fff', marginBottom: 20 }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,.4)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 6 }}>Montant proposé</div>
                    <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1 }}>{formatBudgetDisplay(selectedOffer.montant)}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', marginTop: 5 }}>Délai : {selectedOffer.delai || '—'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {selectedOffer.statut === 'pending' && <button className="btn" style={{ flex: 1, padding: '12px 16px', borderRadius: 10, background: 'var(--surface-1)', color: 'var(--err)', border: '1px solid rgba(220,38,38,.15)', fontWeight: 600 }} onClick={() => { storeRejectOffer(selectedOffer.id) }}>Refuser</button>}
                    {selectedOffer.statut === 'pending' && <button className="btn btn-primary" style={{ flex: 1, padding: '12px 16px', borderRadius: 10, fontWeight: 700, fontSize: 13 }} onClick={() => { storeAcceptOffer(selectedOffer.id) }}>Accepter l'offre</button>}
                    {selectedOffer.statut !== 'pending' && <div style={{ padding: '12px 16px', borderRadius: 10, background: selectedOffer.statut === 'accepted' ? 'rgba(52,199,89,.06)' : 'rgba(220,38,38,.05)', border: `1px solid ${selectedOffer.statut === 'accepted' ? 'rgba(52,199,89,.12)' : 'rgba(220,38,38,.1)'}`, fontSize: 13, fontWeight: 600, flex: 1, textAlign: 'center' }}>Offre {selectedOffer.statut === 'accepted' ? 'acceptée' : 'refusée'}</div>}
                  </div>
                </div>
              )}

              {tab === 'mesao' && selectedMesAO && (() => {
                const mc = getMetierColor(selectedMesAO.metier)
                return (
                <div>
                  <div style={{ background: 'linear-gradient(145deg,#191c1d,#3c3b3b)', borderRadius: 14, padding: '28px 28px 24px', color: '#fff', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(255,255,255,.05),transparent 55%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative' }}>
                      {/* Eyebrow */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                        <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,.3)', textTransform: 'uppercase', letterSpacing: '.1em' }}>Mon appel d'offres</span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,.25)' }}>·</span>
                        <span style={{ fontSize: 9, fontWeight: 500, color: 'rgba(255,255,255,.3)', fontFamily: 'monospace' }}>{selectedMesAO.ref}</span>
                        <span style={{ marginLeft: 'auto', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 100, background: selectedMesAO.reponses > 0 ? 'rgba(52,199,89,.15)' : 'rgba(245,158,11,.15)', color: selectedMesAO.reponses > 0 ? '#34c759' : '#F59E0B' }}>{selectedMesAO.reponses > 0 ? selectedMesAO.reponses + ' réponse' + (selectedMesAO.reponses > 1 ? 's' : '') : 'En attente'}</span>
                      </div>
                      {/* Titre */}
                      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-.4px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, lineHeight: 1.25 }}><AoGear size={16} color={mc} />{selectedMesAO.titre}</div>
                      {/* Meta */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: mc + '22', color: mc }}>{selectedMesAO.metier}</span>
                        <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,.4)' }}>{selectedMesAO.projet}</span>
                      </div>
                    </div>
                  </div>
                  <div className="rg-3" style={{ gap: 12, marginBottom: 20 }}>
                    {[['Budget', selectedMesAO.budget], ['Cloture', selectedMesAO.deadline], ['Reponses', selectedMesAO.reponses]].map(([l, v]) => (
                      <div key={l} className="card" style={{ padding: '16px 18px' }}><div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 5 }}>{l}</div><div style={{ fontSize: 15, fontWeight: 700 }}>{v}</div></div>
                    ))}
                  </div>
                  <div className="card" style={{ padding: 18, marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--t4)', textTransform: 'uppercase', marginBottom: 10 }}>Description</div>
                    <div style={{ fontSize: 13, color: 'var(--t2)', lineHeight: 1.75 }}>{selectedMesAO.desc}</div>
                  </div>
                  <div style={{ padding: '12px 16px', background: 'var(--s2)', borderRadius: 10, marginBottom: 20, fontSize: 12, color: 'var(--t2)' }}>Publie le {selectedMesAO.publie} · Visible par les <strong>{selectedMesAO.metier}</strong></div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {selectedMesAO.rawStatus === 'open' && (
                      <button className="btn btn-sm" style={{ flex: 1 }} onClick={() => {
                        updateStore(prev => ({
                          ...prev, aos: (prev.aos || []).map(a => a.id === selectedMesAO.id ? { ...a, status: 'closed', closedAt: new Date().toISOString() } : a)
                        }))
                        api.aos.update(selectedMesAO.id, { status: 'closed' }).catch(() => {})
                        setSelectedId(null)
                        refresh(n => n + 1)
                        showToast && showToast('AO clôturé')
                      }}>Clôturer</button>
                    )}
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => { onNavigate && onNavigate('offres') }}>Voir les offres ({selectedMesAO.reponses})</button>
                    {selectedMesAO.rawStatus !== 'attributed' && selectedMesAO.rawStatus !== 'archived' && (
                      <button className="btn btn-sm" style={{ color: 'var(--err)', fontSize: 11 }} onClick={() => setConfirmDeleteAO(selectedMesAO)}>Supprimer</button>
                    )}
                  </div>
                </div>
                )
              })()}
            </div>
          </div>
          </div>
        </>
      )}

      {/* ═══ MODAL: Créer AO ═══ */}
      {showCreateAO && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setShowCreateAO(false)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 500, boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>Créer un appel d'offres</div>
              <button onClick={() => setShowCreateAO(false)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t3)' }}>×</button>
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label className="form-label">Titre *</label>
                <input className="form-input" value={newAO.titre} onChange={e => setNewAO(p => ({ ...p, titre: e.target.value }))} placeholder="ex: Lot Gros Oeuvre — Mon projet" />
                {aoSubmitted && !newAO.titre.trim() && <p style={{ color:'var(--err)', fontSize:11, marginTop:4, fontWeight:500 }}>Champ obligatoire</p>}
              </div>
              <div>
                <label className="form-label">Métier recherché *</label>
                <select className="form-input" value={newAO.metier} onChange={e => setNewAO(p => ({ ...p, metier: e.target.value }))}>
                  <option value="">Choisir un metier</option>
                  {METIERS_AO.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                {aoSubmitted && !newAO.metier && <p style={{ color:'var(--err)', fontSize:11, marginTop:4, fontWeight:500 }}>Champ obligatoire</p>}
                <div style={{ fontSize: 10, color: 'var(--t4)', marginTop: 4 }}>Seuls les professionnels de ce metier verront votre AO</div>
              </div>
              <div><label className="form-label">Projet</label>
                <select className="form-input" value={newAO.projet} onChange={e => setNewAO(p => ({ ...p, projet: e.target.value }))}>
                  <option value="">Aucun</option>
                  {(store.projects || []).map(p => <option key={p.id} value={p.nom}>{p.nom}</option>)}
                </select>
              </div>
              <div className="modal-row">
                <div><label className="form-label">Budget (FCFA)</label><MoneyInput value={newAO.budget} onChange={v => setNewAO(p => ({ ...p, budget: v }))} placeholder="180 000 000" /></div>
                <div><label className="form-label">Cloture</label><input className="form-input" type="date" value={newAO.deadline} onChange={e => setNewAO(p => ({ ...p, deadline: e.target.value }))} /></div>
              </div>
              <div><label className="form-label">Description</label><textarea className="form-input" rows="3" value={newAO.desc} onChange={e => setNewAO(p => ({ ...p, desc: e.target.value }))} placeholder="Lot, exigences, conditions..." /></div>

              {/* Public / Prive */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                <label className="form-label">Visibilite</label>
                <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                  <div onClick={() => setNewAO(p => ({ ...p, prive: false, listeRestreinte: [] }))} style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: !newAO.prive ? '2px solid var(--tx)' : '1px solid var(--border-subtle)', background: !newAO.prive ? 'rgba(0,0,0,.02)' : 'var(--surface-1)', cursor: 'pointer' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}><Globe size={14}/> Public</div>
                    <div style={{ fontSize: 10.5, color: 'var(--t3)', lineHeight: 1.4 }}>Visible par tous les professionnels du metier selectionne</div>
                  </div>
                  <div onClick={() => setNewAO(p => ({ ...p, prive: true }))} style={{ flex: 1, padding: '12px 14px', borderRadius: 10, border: newAO.prive ? '2px solid var(--tx)' : '1px solid var(--border-subtle)', background: newAO.prive ? 'rgba(0,0,0,.02)' : 'var(--surface-1)', cursor: 'pointer' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}><Lock size={14}/> Prive</div>
                    <div style={{ fontSize: 10.5, color: 'var(--t3)', lineHeight: 1.4 }}>Visible uniquement par les entreprises que vous choisissez</div>
                  </div>
                </div>

                {/* Liste restreinte */}
                {newAO.prive && (
                  <div>
                    {newAO.listeRestreinte.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                        {newAO.listeRestreinte.map(nom => (
                          <span key={nom} style={{ fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 100, background: 'var(--tx)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
                            {nom} <span style={{ cursor: 'pointer', opacity: .7 }} onClick={() => setNewAO(p => ({ ...p, listeRestreinte: p.listeRestreinte.filter(x => x !== nom) }))}>×</span>
                          </span>
                        ))}
                      </div>
                    )}
                    <input value={aoInviteSearch} onChange={e => setAoInviteSearch(e.target.value)} placeholder="Rechercher une entreprise a inviter..." className="form-input" />
                    {aoInviteSearch && (
                      <div style={{ marginTop: 6, border: '1px solid var(--border-card)', borderRadius: 8, maxHeight: 150, overflowY: 'auto' }}>
                        {[...new Set([
                          ...INTERVENANTS_DATA.filter(i => i.entreprise).map(i => i.nom),
                          ...ANNUAIRE_PLATEFORME.map(p => p.nom)
                        ])].filter(n => n.toLowerCase().includes(aoInviteSearch.toLowerCase()) && !newAO.listeRestreinte.includes(n)).map(n => (
                          <div key={n} style={{ padding: '8px 12px', fontSize: 12, cursor: 'pointer', borderBottom: '1px solid var(--border)' }} onClick={() => { setNewAO(p => ({ ...p, listeRestreinte: [...p.listeRestreinte, n] })); setAoInviteSearch('') }}
                            onMouseOver={e => e.currentTarget.style.background = 'var(--s2)'} onMouseOut={e => e.currentTarget.style.background = ''}>{n}</div>
                        ))}
                      </div>
                    )}
                    {newAO.listeRestreinte.length === 0 && !aoInviteSearch && (
                      <div style={{ fontSize: 10.5, color: 'var(--t4)', marginTop: 6 }}>Ajoutez les entreprises autorisees a voir et repondre a cet AO</div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'space-between' }}>
              <span style={{ fontSize: 11, color: 'var(--t3)', alignSelf: 'center', display: 'flex', alignItems: 'center', gap: 4 }}>{newAO.prive ? <><Lock size={11}/> Prive · {newAO.listeRestreinte.length} invité{newAO.listeRestreinte.length > 1 ? 's' : ''}</> : <><Globe size={11}/> Public</>}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm" onClick={() => setShowCreateAO(false)}>Annuler</button>
                <button className="btn btn-primary btn-sm" disabled={newAO.prive && newAO.listeRestreinte.length === 0} onClick={createAO}>Publier</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: Repondre a un AO ═══ */}
      {showRepondre && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,.4)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'modalIn .18s ease' }} onClick={() => setShowRepondre(null)}>
          <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, width: 560, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800 }}>Repondre a l'appel d'offres</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 3 }}>{showRepondre.ref} · {showRepondre.titre}</div>
                </div>
                <button onClick={() => setShowRepondre(null)} style={{ width: 30, height: 30, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: 'var(--t3)' }}>×</button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Note technique */}
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginTop: 4 }}>Dossier technique</div>
              <div><label className="form-label">Memoire technique</label><textarea className="form-input" rows="4" value={reponse.technique} onChange={e => setReponse(p => ({ ...p, technique: e.target.value }))} placeholder="Methodologie, organisation, moyens humains et materiels, planning previsionnel, references similaires..." /></div>
              <div><label className="form-label">Message au maitre d'ouvrage</label><textarea className="form-input" rows="2" value={reponse.message} onChange={e => setReponse(p => ({ ...p, message: e.target.value }))} placeholder="Motivation, points forts de votre offre..." /></div>

              {/* Pièces jointes — vrai file picker */}
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginTop: 4 }}>Pièces jointes supplémentaires</div>
              <div
                style={{ padding: '18px 14px', border: '1.5px dashed var(--border-subtle)', borderRadius: 10, textAlign: 'center', cursor: 'pointer', background: 'var(--s2)', transition: 'border-color .15s, background .15s' }}
                onClick={() => document.getElementById('ao-file-picker')?.click()}
                onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--tx)'; e.currentTarget.style.background = 'rgba(0,0,0,.02)' }}
                onDragLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = '' }}
                onDrop={e => {
                  e.preventDefault(); e.currentTarget.style.borderColor = ''; e.currentTarget.style.background = ''
                  const files = Array.from(e.dataTransfer.files).map(f => ({ name: f.name, size: f.size, type: f.type }))
                  if (files.length) setReponse(p => ({ ...p, docsJoints: [...p.docsJoints, ...files] }))
                }}
              >
                <input id="ao-file-picker" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip" style={{ display: 'none' }} onChange={e => {
                  const files = Array.from(e.target.files || []).map(f => ({ name: f.name, size: f.size, type: f.type }))
                  if (files.length) setReponse(p => ({ ...p, docsJoints: [...p.docsJoints, ...files] }))
                  e.target.value = '' // reset pour permettre re-sélection du même fichier
                }} />
                <div style={{ marginBottom: 4, display: 'flex', justifyContent: 'center', opacity: .4 }}><Paperclip size={16}/></div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>Ajouter des fichiers</div>
                <div style={{ fontSize: 10, color: 'var(--t4)', marginTop: 2 }}>Plans, devis détaillé, planning, références…</div>
              </div>
              {reponse.docsJoints.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {reponse.docsJoints.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--s2)', borderRadius: 8, fontSize: 12 }}>
                      <FileText size={14} color="var(--t3)"/>
                      <span style={{ flex: 1, fontWeight: 500 }}>{d.name || d}</span>
                      {d.size && <span style={{ fontSize: 10, color: 'var(--t4)', flexShrink: 0 }}>{d.size > 1e6 ? (d.size / 1e6).toFixed(1) + ' MB' : Math.round(d.size / 1024) + ' KB'}</span>}
                      <button onClick={() => setReponse(p => ({ ...p, docsJoints: p.docsJoints.filter((_, j) => j !== i) }))} style={{ background: 'none', border: 'none', color: 'var(--err)', cursor: 'pointer', fontSize: 14, fontWeight: 700, lineHeight: 1, padding: 0 }}>×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Documents entreprise — seuls les documents existants sont joinables */}
              <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginTop: 4 }}>
                Documents entreprise
              </div>
              {availableDocs.length === 0 ? (
                <div style={{ padding: '12px 14px', background: 'rgba(245,158,11,.06)', borderRadius: 10, border: '1px solid rgba(245,158,11,.15)', fontSize: 12, color: 'var(--wrn)', lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 2 }}/> Aucun document entreprise ajouté. Rendez-vous dans la section Documents pour ajouter vos pièces administratives.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {availableDocs.map(d => {
                    const checked = reponse.docsEntreprise.includes(d.id)
                    return (
                      <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: checked ? 'rgba(52,199,89,.04)' : 'var(--s2)', borderRadius: 8, border: '1px solid ' + (checked ? 'rgba(52,199,89,.15)' : 'var(--border-subtle)'), cursor: 'pointer' }}
                        onClick={() => setReponse(p => ({ ...p, docsEntreprise: checked ? p.docsEntreprise.filter(x => x !== d.id) : [...p.docsEntreprise, d.id] }))}>
                        <div style={{ width: 18, height: 18, borderRadius: 4, border: checked ? 'none' : '1.5px solid var(--border)', background: checked ? 'var(--ok)' : 'var(--surface-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {checked && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>{d.nom}</div>
                          <div style={{ fontSize: 10, color: 'var(--t4)' }}>{d.type} · {d.status === 'generated' ? 'Généré par KAI' : 'Ajouté'}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div style={{ padding: '14px 22px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, justifyContent: 'space-between', flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: 'var(--t3)', alignSelf: 'center' }}>{reponse.docsEntreprise.length} doc{reponse.docsEntreprise.length > 1 ? 's' : ''} entreprise · {reponse.docsJoints.length} pièce{reponse.docsJoints.length > 1 ? 's' : ''} jointe{reponse.docsJoints.length > 1 ? 's' : ''}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm" onClick={() => setShowRepondre(null)}>Annuler</button>
                <button className="btn btn-primary btn-sm" onClick={submitReponse}>Soumettre l'offre</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal suppression AO */}
      {confirmDeleteAO && (() => {
        const hasMarket = (store.markets || []).some(m => m.aoId === confirmDeleteAO.id)
        const hasResponses = Number(confirmDeleteAO.reponses) > 0 || (store.offers || []).some(o => o.aoId === confirmDeleteAO.id)
        return (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setConfirmDeleteAO(null)}>
            <div style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 420, boxShadow: '0 24px 80px rgba(0,0,0,.18)', overflow: 'hidden' }} onClick={e => e.stopPropagation()}>
              <div style={{ padding: '28px 28px 20px', textAlign: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: hasMarket ? 'rgba(0,0,0,.04)' : 'rgba(186,26,26,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  {hasMarket
                    ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                  }
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
                  {hasMarket ? 'Suppression impossible' : hasResponses ? 'Annuler cet appel d\u2019offres\u00a0?' : 'Supprimer cet appel d\u2019offres\u00a0?'}
                </div>
                <div style={{ fontSize: 13, color: '#888', lineHeight: 1.55 }}>
                  {hasMarket
                    ? 'Cet appel d\u2019offres a déjà donné lieu à une attribution ou à un marché. Vous pouvez uniquement l\u2019archiver.'
                    : hasResponses
                      ? 'Cet appel d\u2019offres a déjà reçu des réponses. Il ne sera plus visible dans la bourse, mais son historique restera conservé.'
                      : 'Cette action retirera définitivement cet appel d\u2019offres de la plateforme.'
                  }
                </div>
              </div>
              <div style={{ padding: '16px 28px 24px', display: 'flex', gap: 10 }}>
                <button onClick={() => setConfirmDeleteAO(null)} style={{ flex: 1, padding: '12px 16px', borderRadius: 12, background: '#f3f4f5', color: '#555', border: '1px solid rgba(0,0,0,.06)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>
                  {hasMarket ? 'Fermer' : hasResponses ? 'Retour' : 'Annuler'}
                </button>
                {hasMarket ? (
                  <button onClick={() => { archiveAO(confirmDeleteAO.id); setConfirmDeleteAO(null); setSelectedId(null); refresh(n => n + 1) }} style={{ flex: 1, padding: '12px 16px', borderRadius: 12, background: '#191c1d', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>Archiver</button>
                ) : (
                  <button onClick={() => { const result = deleteAO(confirmDeleteAO.id); if (result && !result.success) { showToast && showToast(result.reason || 'Suppression impossible', 'orange'); } setConfirmDeleteAO(null); setSelectedId(null); refresh(n => n + 1) }} style={{ flex: 1, padding: '12px 16px', borderRadius: 12, background: '#ba1a1a', color: '#fff', border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>
                    {hasResponses ? 'Annuler l\u2019appel d\u2019offres' : 'Supprimer'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Modal invitation professionnel */}
      <InviteProfessionalModal
        open={!!showInviteModal}
        ao={showInviteModal}
        professionals={(store.users || []).filter(u => u && u.type === 'pro').map(u => ({ id: u.id, name: u.name, company: u.company || '', trade: u.trade || '' }))}
        onInvite={(data) => { sendAOInvitation(data); setShowInviteModal(null) }}
        onClose={() => setShowInviteModal(null)}
      />
    </div>
  )
}
