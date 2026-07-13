import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Star, Camera } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMeereo } from '../../../hooks/useMeereoStore'
import { logoShapeStyle } from '../../../utils/logoShape'
import { formatBudgetDisplay } from '../../../utils/helpers'
// Mock imports removed — store is source of truth
import Modal from '../../../components/shared/Modal'
import MeereoLogo from '../../../components/shared/MeereoLogo'
import { api } from '../../../services/api/client'
import SectionRenderer from '../../../components/sections-builder/SectionRenderer'
import '../../../styles/profile.css'

// Services par dûfaut proposés aux pros si aucun service n'est encore renseigné
const DEFAULT_SERVICES = [
  'Maîtrise d\'é“uvre', 'Plans & permis', 'études structure', 'Suivi de chantier',
  'Réhabilitation', 'Architecture intérieure', 'Conception BIM', 'Bureau de contrôle',
]

// Dynamic projects from cockpit data — exclude archived/stopped
const getProjects = (projects) => (projects || [])
  .filter(p => p.status !== 'archived' && p.status !== 'stopped' && p.status !== 'deleted')
  .map((p, i) => ({
    num: String(i + 1).padStart(2, '0'),
    name: p.nom,
    loc: (p.adresse || 'Abidjan') + ' à Client : ' + p.client,
    budget: p.budget,
    status: p.avancement >= 100 ? 'Livré' : p.avancement > 0 ? 'En cours' : 'À lancer',
    cls: p.avancement >= 100 ? 'done' : p.avancement > 0 ? 'active' : 'delivery',
    img: p.img,
    progress: p.avancement || 0,
  }))


export default function Profile() {
  const navigate = useNavigate()
  const { slug: routeSlug } = useParams()
  const { store, showToast, updateStore, emitEvent } = useMeereo()

  // Route param slug (can be a slug or publicId — backend accepts both)
  const uuid = routeSlug || null

  // é── Données publiques (chargées depuis le backend via UUID) ──────────────
  const [pubData, setPubData]   = useState(null)   // { profile, stats, id, publicId, name, verified }
  const [pubLoading, setPubLoading] = useState(!!uuid)
  const [pubError, setPubError] = useState(null)

  useEffect(() => {
    if (!uuid) return
    setPubLoading(true)
    api.usersApi.getProProfile(uuid)
      .then(data => { setPubData(data); setPubLoading(false) })
      .catch(e  => { setPubError(e.message || 'Profil introuvable'); setPubLoading(false) })
  }, [uuid])

  // é── Détection rôle : propriétaire = pro connecté dont slug/publicId = route param ──
  const myPublicId = store.user?.publicId
  const isOwner = store.user?.type === 'pro' && (
    !uuid || uuid === myPublicId || uuid === store.user?.slug
  )
  const isClient  = store.user?.type === 'client'
  const isVisitor = !store.user

  // Seuls les comptes professionnels peuvent accéder à leur propre page pro.
  // (Toute URL avec ?uuid= reste publique pour les visiteurs/clients.)
  useEffect(() => {
    if (!uuid && store.user && store.user.type !== 'pro') {
      // Client ou fournisseur connecté → rediriger vers son propre espace
      const dest = store.user.type === 'client' ? '/client' : '/fournisseur'
      navigate(dest, { replace: true })
    }
  }, [uuid, store.user, navigate])

  // Redirect owner to canonical slug URL so the link is shareable
  const mySlug = store.user?.slug || myPublicId
  useEffect(() => {
    if (isOwner && !uuid && mySlug) {
      navigate(`/pro/${mySlug}`, { replace: true })
    }
  }, [isOwner, uuid, mySlug, navigate])

  // é── Source de données : toujours store.onboardingData pour le propriétaire
  // (garantit que saveEdit optimistic updates sont immédiatement visibles)
  // Pour un visiteur → pubData.profile (chargé depuis le backend)
  const ob = isOwner ? (store.onboardingData || {}) : (pubData?.profile || store.onboardingData || {})
  const remoteStats = pubData?.stats || null

  // Données profil dynamiques — onboarding d'abord, puis user, puis dûfaut
  const proName = ob.entreprise || store.user?.company || store.user?.name || pubData?.name || ''
  const proInitials = proName ? proName.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() : ''
  const proSpecialite = ob.secteurs?.[0] || ''
  const isVerified = pubData?.verified ?? store.user?.verified === true ?? ob.verified === true
  const verificationLevel = ob.verificationLevel || (isVerified ? 'full' : 'none')
  const [showVerifTooltip, setShowVerifTooltip] = useState(false)
  const proVille = ob.ville || 'Abidjan'
  const proEmail = ob.email || ob.emailPro || store.user?.email || ''
  const proTel = ob.tel || ob.telPro || store.user?.phone || ''

  // Banner — onboarding saves as 'coverUrl', Profile uploads save as 'bannerUrl' → read both
  const bannerUrl = ob.bannerUrl || ob.coverUrl || null
  const [bannerPos, setBannerPos] = useState(ob.bannerPosition || 50)
  // Sync bannerPos when ob loads asynchronously (hydration completes after mount)
  useEffect(() => { if (ob.bannerPosition !== undefined) setBannerPos(ob.bannerPosition) }, [ob.bannerPosition])
  const [editingBanner, setEditingBanner] = useState(false)
  const [tempPos, setTempPos] = useState(50)
  const bannerInputRef = useRef(null)
  const dragRef = useRef({ dragging: false, startY: 0, startPos: 0 })

  const handleBannerUpload = async (e) => {
    const f = e.target.files?.[0]; if (!f) return
    // Lire le fichier une seule fois — utiliser la base64 comme prévisualisation immédiate
    // puis remplacer par l'URL MinIO si l'upload réussit
    const { uploadFile: _uploadFile } = await import('../../../utils/upload')
    const reader = new FileReader()
    reader.onload = async () => {
      const base64 = reader.result
      // Afficher la prévisualisation locale immédiatement
      updateStore(prev => ({ ...prev, onboardingData: { ...(prev.onboardingData || {}), bannerUrl: base64 } }))
      setEditingBanner(true)
      setTempPos(bannerPos)
      // Upload vers MinIO en arrière-plan — remplacer la base64 par l'URL persistante
      try {
        const url = await _uploadFile(f, 'banners', 'cover')
        updateStore(prev => ({ ...prev, onboardingData: { ...(prev.onboardingData || {}), bannerUrl: url } }))
        api.usersApi.updateOnboardingData({ bannerUrl: url }).catch(() => {})
      } catch {
        // Garder la base64 locale — pas bloquant
      }
    }
    reader.readAsDataURL(f)
  }

  const saveBannerPos = () => {
    updateStore(prev => ({ ...prev, onboardingData: { ...(prev.onboardingData || {}), bannerPosition: tempPos } }))
    api.usersApi.updateOnboardingData({ bannerPosition: tempPos }).catch(() => {})
    setBannerPos(tempPos)
    setEditingBanner(false)
    showToast('Banniére ajustée')
  }
  const proBio = ob.bio || ''
  const proServices = ob.services || []
  const proSlogan = ob.slogan || ''
  const visitorName = store.user?.name || (ob.prenom ? `${ob.prenom} ${ob.nom || ''}`.trim() : '')
  const visitorRole = isClient ? 'client' : isOwner ? 'pro_owner' : 'pro_visitor'

  // Projets filtrès selon le rôle du visiteur
  const visitorProjects = isClient
    ? (store.projects || []).filter(p => !p.clientId || p.clientId === store.user?.id)
    : (store.projects || []).filter(p => p.avancement < 100)

  // Données dynamiques — ob pointe sur store.onboardingData pour l'owner, pubData.profile pour le visiteur
  // 'portfolio' = clé store/GET /me/onboarding ; 'portfolioFiles' = clé GET /api/pro/:uuid
  const rawPortfolio = ob.portfolio || ob.portfolioFiles || []
  // Normalise les items : peut être {img,cap,feat} OU une URL string brute (fallback proProfile)
  const displayPortfolio = rawPortfolio.map(p =>
    typeof p === 'string' ? { img: p, cap: 'Réalisation', feat: false } : p
  )
  // Team: ob.cockpitTeam (owner → store.onboardingData, visiteur → pubData.profile)
  const cockpitTeam = ob.cockpitTeam || null
  // Normalize: cockpit uses 'nom'/'poste', display uses 'name'/'role'
  const normalizeTeamMember = (t) => ({
    ...t,
    name: t.name || t.nom || '',
    // jobTitle/poste is the displayed job title; role may be platform role — prefer job title fields
    role: t.poste || t.jobTitle || t.role || '',
    photoUrl: t.photoUrl || t.photo || '',
    isPublic: t.isPublic !== undefined ? t.isPublic : true,
  })
  // Si cockpitTeam existe dans le store → l'utiliser. Sinon fallback = équipe cockpit par dûfaut (PAS la dûmo TEAM)
  const COCKPIT_DEFAULT_TEAM = []
  const rawTeam = (cockpitTeam && cockpitTeam.length > 0 ? cockpitTeam : COCKPIT_DEFAULT_TEAM).map(normalizeTeamMember)
  const displayTeam = rawTeam.filter(t => t.isPublic !== false)

  // Visitor modals state
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactMsg, setContactMsg] = useState('')
  const [contactMotif, setContactMotif] = useState('collaboration')
  const [contactSending, setContactSending] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteProjet, setInviteProjet] = useState('')
  const [inviteRole, setInviteRole] = useState('')
  const [inviteMsg, setInviteMsg] = useState('')
  const [inviteSending, setInviteSending] = useState(false)

  // Owner edit modals state
  const [editModal, setEditModal] = useState(null) // 'profil' | 'services' | 'logo' | 'portfolio' | 'equipe'
  // Profil general edit fields
  const [epEntreprise, setEpEntreprise] = useState(ob.entreprise || '')
  const [epBio, setEpBio] = useState(ob.bio || '')
  const [epSlogan, setEpSlogan] = useState(ob.slogan || '')
  const [epVille, setEpVille] = useState(ob.ville || 'Abidjan')
  const [epPays, setEpPays] = useState(ob.pays || "Côte d'Ivoire")
  const [epEmail, setEpEmail] = useState(ob.email || ob.emailPro || '')
  const [epTel, setEpTel] = useState(ob.tel || ob.telPro || '')
  const [epRccm, setEpRccm] = useState(ob.rccm || '')
  const [editSecteurs, setEditSecteurs] = useState(ob.secteurs || [])
  const [editServices, setEditServices] = useState(ob.services ? [...ob.services] : [])
  const [editNewService, setEditNewService] = useState('')
  const [editLogoColor, setEditLogoColor] = useState(ob.logoColor || '#1D1D1F')
  const [epNewSecteur, setEpNewSecteur] = useState('')
  const [epLogoUploading, setEpLogoUploading] = useState(false)
  const logoInputRef = useRef(null)
  // Portfolio edit
  const [editPortfolio, setEditPortfolio] = useState(displayPortfolio.map(p => ({ ...p, imgs: p.imgs?.length > 0 ? p.imgs : (p.img ? [p.img] : []) })))
  const [newPortfolio, setNewPortfolio] = useState({ cap: '', imgs: [], feat: false })
  const [portfolioViewer, setPortfolioViewer] = useState(null) // { imgs, idx, cap }
  // Team edit
  const [editTeamList, setEditTeamList] = useState(() => (rawTeam || []).map(t => ({ ...t })))
  const [newMember, setNewMember] = useState({ name: '', role: '', photoUrl: '' })
  // Keep editTeamList in sync if cockpitTeam is updated externally (e.g. from Settings page)
  useEffect(() => {
    if (editModal !== 'equipe') setEditTeamList(rawTeam.map(t => ({ ...t })))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ob.cockpitTeam])

  const saveEdit = useCallback(async (field, value) => {
    // Optimistic update
    updateStore(prev => ({ ...prev, onboardingData: { ...(prev.onboardingData || {}), [field]: value } }))
    try {
      const saved = await api.usersApi.updateOnboardingData({ [field]: value })
      // Update store with full server response (merged proProfile + onboardingData)
      if (saved && typeof saved === 'object' && Object.keys(saved).length > 0) {
        updateStore(prev => ({ ...prev, onboardingData: { ...(prev.onboardingData || {}), ...saved } }))
      }
      showToast('Profil mis \u00e0 jour', 'green')
      setEditModal(null)
    } catch (e) {
      // Rollback optimistic update
      updateStore(prev => ({ ...prev, onboardingData: { ...(prev.onboardingData || {}), [field]: ob[field] } }))
      showToast(e?.message || 'Erreur lors de la sauvegarde', 'red')
    }
  }, [updateStore, showToast, ob])

  const handleContact = useCallback(async () => {
    if (!contactMsg.trim() || contactSending) return
    setContactSending(true)
    const motifLabels = { collaboration: 'Demande de collaboration', devis: 'Demande de devis', information: 'Demande d\'information', autre: 'Prise de contact' }
    const convId = 'conv_' + Date.now()
    // Persistance backend — notif au pro
    try {
      await api.notifications.create({
        targetUserId: pubData?.id || null,
        type: 'contact_request',
        message: `Nouveau message de ${visitorName || 'un visiteur'} — ${motifLabels[contactMotif]}`,
        link: convId,
      })
    } catch { /* non bloquant */ }
    updateStore(prev => ({
      ...prev,
      messages: [...(prev.messages || []), {
        id: 'msg_' + Date.now(),
        conversationId: convId,
        dest: proName,
        sujet: motifLabels[contactMotif] || 'Prise de contact',
        texte: contactMsg,
        type: 'contact',
        motif: contactMotif,
        from: visitorName || 'Visiteur',
        senderRole: visitorRole,
        createdAt: new Date().toISOString(),
      }]
    }))
    emitEvent('message_sent', { to: proName, conversationId: convId }, {
      notifMsg: `Nouveau message de ${visitorName || 'un visiteur'} — ${motifLabels[contactMotif]}`,
      notifType: 'green'
    })
    setContactSending(false)
    showToast('Message envoyé ! ' + proName + ' vous recontactera sous 24h', 'green')
    setShowContactModal(false)
    setContactMsg('')
    setContactMotif('collaboration')
  }, [contactMsg, contactSending, contactMotif, proName, visitorName, visitorRole, pubData, updateStore, emitEvent, showToast])

  const handleInvite = useCallback(async () => {
    if (!inviteProjet || inviteSending) return
    setInviteSending(true)
    const projObj = (store.projects || []).find(p => p.id === inviteProjet)
    const invId = 'inv_' + Date.now()
    // Persistance backend — notif au pro
    try {
      await api.notifications.create({
        targetUserId: pubData?.id || null,
        type: 'project_invitation',
        message: `Invitation de ${visitorName || 'un visiteur'} pour ${projObj?.nom || 'un projet'} — rôle : ${inviteRole || proSpecialite}`,
        link: invId,
      })
    } catch { /* non bloquant */ }
    updateStore(prev => ({
      ...prev,
      invitations: [...(prev.invitations || []), {
        id: invId,
        professional: proName,
        professionalSpecialite: proSpecialite,
        projectId: inviteProjet,
        projectName: projObj?.nom || '',
        role: inviteRole || proSpecialite,
        message: inviteMsg,
        from: visitorName || 'Visiteur',
        senderRole: visitorRole,
        statut: 'pending',
        createdAt: new Date().toISOString(),
      }],
      notifications: [...(prev.notifications || []), {
        id: Date.now(),
        msg: `Invitation de ${visitorName || 'un visiteur'} pour ${projObj?.nom || 'un projet'} — rôle : ${inviteRole || proSpecialite}`,
        type: 'info',
        read: false,
        link: invId,
        ts: new Date().toISOString(),
      }],
    }))
    emitEvent('invitation_sent', { to: proName, project: projObj?.nom, invitationId: invId }, {
      notifMsg: `Invitation envoyée à ${proName} pour ${projObj?.nom}`,
      notifType: 'blue'
    })
    setInviteSending(false)
    showToast('Invitation envoyée à ' + proName + ' pour ' + (projObj?.nom || 'le projet'), 'blue')
    setShowInviteModal(false)
    setInviteProjet('')
    setInviteRole('')
    setInviteMsg('')
  }, [inviteProjet, inviteSending, inviteRole, inviteMsg, proName, proSpecialite, visitorName, visitorRole, pubData, store.projects, updateStore, emitEvent, showToast])

  const handleContactViaMsg = useCallback(() => {
    if (isVisitor || !store.user) { navigate('/onboarding'); return }
    // Chercher par pubData.id (backend ID) en priorité, puis par nom pour les convs locales
    const existing = (store.conversations || []).find(c =>
      !c.isGroup && !c._deleted && (
        (pubData?.id && c.participantId === pubData.id) ||
        c.nom === proName
      )
    )
    let convId
    if (existing) {
      convId = existing.id
    } else {
      convId = 'conv_' + Date.now()
      const newConv = {
        id: convId,
        nom: proName,
        participantId: pubData?.id || null,
        type: pubData?.id ? 'entreprise' : 'demande',
        avatar: proInitials?.[0] || proName[0] || '?',
        color: ob.logoColor || '#191c1d',
        isGroup: false,
        participants: [proName],
        pending: !pubData?.id,
        invited: !pubData?.id,
        dernier: pubData?.id ? '' : 'Demande envoyée',
        time: 'Maintenant',
        unread: 0,
        msgs: pubData?.id ? [] : [{ side: 'out', text: 'Bonjour, je souhaiterais échanger avec vous.', time: 'Maintenant', read: false }],
      }
      updateStore(prev => ({ ...prev, conversations: [newConv, ...(prev.conversations || [])] }))
    }
    sessionStorage.setItem('meereo_open_conv', convId)
    sessionStorage.setItem('meereo_nav_page', 'messages')
    navigate(isClient ? '/client' : '/cockpit')
  }, [isVisitor, store.user, store.conversations, proName, proInitials, pubData, ob.logoColor, isClient, navigate, updateStore])

  // Mémorisé pour éviter le double calcul dans le JSX
  const displayProjects = useMemo(() => getProjects(store.projects), [store.projects])

  return (
    <div className="pp-page">

      {/* LOADING / ERROR — pour les profils publics */}
      {pubLoading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 28, height: 28, border: '3px solid rgba(0,0,0,.08)', borderTopColor: '#111', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
          <div style={{ fontSize: 13, color: '#999' }}>Chargement du profil...</div>
        </div>
      )}
      {pubError && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 32, opacity: .3 }}>”é</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>Profil introuvable</div>
          <div style={{ fontSize: 13, color: '#666' }}>{pubError}</div>
          <button className="pp-btn-primary" onClick={() => navigate('/')}>Retour à l'accueil</button>
        </div>
      )}
      {(pubLoading || pubError) ? null : (<>

      {/* NAV */}
      <nav className="pp-nav">
        <div className="pp-nav-logo" style={{ display: 'flex', alignItems: 'center', gap: 10 }}><MeereoLogo size={28} /> MEEREO <span>Profil professionnel</span></div>
        <div className="pp-nav-actions">
          {isOwner ? (
            <>
              <button className="pp-btn-ghost" onClick={() => navigate('/cockpit')}>Tableau de bord</button>
              <button className="pp-btn-ghost" onClick={() => navigate('/cockpit/bourse')}>Bourse des AO</button>
              <button className="pp-btn-primary" onClick={() => navigate('/cockpit')}>+ Nouveau projet</button>
            </>
          ) : isVisitor ? (            <>
              <button className="pp-btn-ghost" onClick={() => navigate('/onboarding')}>S'inscrire</button>
              <button className="pp-btn-primary" onClick={() => navigate('/onboarding')}>Se connecter</button>
            </>
          ) : (
            <>
              <button className="pp-btn-ghost" onClick={() => navigate(isClient ? '/client' : '/cockpit')}>Mon espace</button>
              <button className="pp-btn-ghost" onClick={handleContactViaMsg}>Messagerie</button>
              <button className="pp-btn-primary" onClick={() => setShowContactModal(true)}>Contacter</button>
            </>
          )}
        </div>
      </nav>

      {/* HERO */}
      <div className="pp-hero">
        {bannerUrl ? (
          <div className="pp-hero-cover" style={{ background: 'none' }}>
            <img src={bannerUrl} alt="" style={{ objectPosition: `center ${editingBanner ? tempPos : bannerPos}%`, userSelect: 'none', pointerEvents: 'none' }} />
          </div>
        ) : (
          <div className="pp-hero-cover" style={ob.logoColor ? { background: `linear-gradient(135deg, ${ob.logoColor} 0%, ${ob.logoColor}88 40%, #191c1d 100%)` } : undefined} />
        )}
        {/* Banner controls — owner only */}
        {isOwner && (
          <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 6 }}>
            {editingBanner ? (<>
              <button onClick={saveBannerPos} style={{ padding: '7px 14px', borderRadius: 8, background: '#fff', color: '#111', border: 'none', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', boxShadow: '0 2px 8px rgba(0,0,0,.2)' }}>Enregistrer</button>
              <button onClick={() => setEditingBanner(false)} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', fontSize: 11.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--f)', backdropFilter: 'blur(8px)' }}>Annuler</button>
            </>) : (<>
              {bannerUrl && <button onClick={() => { setTempPos(bannerPos); setEditingBanner(true) }} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.15)', fontSize: 11.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--f)', backdropFilter: 'blur(8px)', transition: 'background .12s' }}>Ajuster</button>}
              {bannerUrl && <button onClick={() => { updateStore(prev => ({ ...prev, onboardingData: { ...(prev.onboardingData || {}), bannerUrl: null, bannerPosition: 50 } })); api.usersApi.updateOnboardingData({ bannerUrl: null, bannerPosition: 50 }).catch(() => {}); showToast('Banniére supprimée') }} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(220,38,38,.3)', color: '#fff', border: '1px solid rgba(220,38,38,.3)', fontSize: 11.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--f)', backdropFilter: 'blur(8px)', transition: 'background .12s' }}>Supprimer</button>}
              <button onClick={() => bannerInputRef.current?.click()} style={{ padding: '7px 14px', borderRadius: 8, background: 'rgba(255,255,255,.12)', color: '#fff', border: '1px solid rgba(255,255,255,.15)', fontSize: 11.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--f)', backdropFilter: 'blur(8px)', transition: 'background .12s' }}>{bannerUrl ? 'Changer' : 'Ajouter une banniére'}</button>
            </>)}
            <input ref={bannerInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleBannerUpload} />
          </div>
        )}
        {/* Drag overlay — covers entire hero in edit mode, above all content */}
        {editingBanner && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 8, cursor: 'ns-resize' }}
            onMouseDown={(e) => {
              e.preventDefault()
              dragRef.current = { dragging: true, startY: e.clientY, startPos: tempPos }
              const onMove = (ev) => { if (!dragRef.current.dragging) return; const dy = ev.clientY - dragRef.current.startY; setTempPos(Math.max(0, Math.min(100, dragRef.current.startPos - dy * 0.25))) }
              const onUp = () => { dragRef.current.dragging = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
              window.addEventListener('mousemove', onMove)
              window.addEventListener('mouseup', onUp)
            }}
          >
            <div style={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', padding: '6px 14px', borderRadius: 8, background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: 11, fontWeight: 500, backdropFilter: 'blur(8px)', pointerEvents: 'none' }}>Glissez pour ajuster la position</div>
          </div>
        )}
        <div className="pp-hero-content">
          <div className="pp-hero-logo-wrap" style={logoShapeStyle(ob.logoShape)}>
            {ob.logoFileUrl
              ? <img src={ob.logoFileUrl} alt="" style={{ width: 76, height: 76, ...logoShapeStyle(ob.logoShape), objectFit: 'contain' }} />
              : ob.photoUrl
                ? <img src={ob.photoUrl} alt="" style={{ width: 76, height: 76, ...logoShapeStyle(ob.logoShape), objectFit: 'cover' }} />
                : proInitials
                  ? <div className="pp-hero-logo-inner" style={{ background: ob.logoColor || 'var(--s3)', color: ob.logoColor ? '#fff' : '#474747', ...logoShapeStyle(ob.logoShape) }}>{proInitials}</div>
                  : <div className="pp-hero-logo-inner" style={{ background: 'var(--s3)', color: '#9a9a9a', fontSize: 20, ...logoShapeStyle(ob.logoShape) }}>?</div>
            }
          </div>
          <div className="pp-hero-info">
            {isVerified && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: 'rgba(22,163,74,.12)', backdropFilter: 'blur(8px)', marginBottom: 8, position: 'relative', cursor: 'pointer' }} onMouseEnter={() => setShowVerifTooltip(true)} onMouseLeave={() => setShowVerifTooltip(false)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <span style={{ fontSize: 10.5, fontWeight: 600, color: '#16A34A', letterSpacing: '.02em' }}>Structure vérifiée MEEREO</span>
                {showVerifTooltip && (
                  <div style={{ position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: 8, padding: '12px 16px', background: '#fff', borderRadius: 12, boxShadow: '0 8px 28px rgba(0,0,0,.15)', width: 280, zIndex: 10, textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#111', marginBottom: 4 }}>Profil vérifié par MEEREO</div>
                    <div style={{ fontSize: 11, color: '#666', lineHeight: 1.5, marginBottom: 8 }}>Cette structure a été contrôlée et validûe par MEEREO. Ses informations, son existence légale et sa conformité ont été vérifiées.</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {['Identité de la structure vérifiée', 'Documents légaux conformes', 'Critéres de qualité MEEREO validûs'].map(t => (
                        <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          <span style={{ fontSize: 10.5, color: '#444' }}>{t}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)', width: 10, height: 10, background: '#fff', boxShadow: '2px 2px 4px rgba(0,0,0,.08)' }} />
                  </div>
                )}
              </div>
            )}
            <h1 className="pp-hero-name">
              {proName || 'Profil professionnel'}
              {isVerified && <svg width="22" height="22" viewBox="0 0 24 24" fill="#16A34A" style={{ verticalAlign: 'middle', marginLeft: 8 }}><circle cx="12" cy="12" r="10" fill="#16A34A"/><polyline points="8 12 11 15 16 9" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </h1>
            <p className="pp-hero-meta">{proSpecialite ? <><strong>{proSpecialite}</strong> &nbsp;é&nbsp;</> : null}{proVille || 'Localisation non renseignée'}</p>
          </div>
        </div>
        <div className="pp-hero-actions">
          <button className="pp-btn-white" onClick={() => document.getElementById('pp-portfolio')?.scrollIntoView({behavior:'smooth'})}>Voir portfolio</button>
          {isOwner ? (
            <button className="pp-btn-white" onClick={() => {
              setEpEntreprise(ob.entreprise || ''); setEpBio(ob.bio || ''); setEpSlogan(ob.slogan || '')
              setEpVille(ob.ville || 'Abidjan'); setEpPays(ob.pays || "Côte d'Ivoire")
              setEpEmail(ob.email || ob.emailPro || ''); setEpTel(ob.tel || ob.telPro || ''); setEpRccm(ob.rccm || '')
              setEditSecteurs(ob.secteurs || []); setEditLogoColor(ob.logoColor || '#1D1D1F')
              setEditModal('profil')
            }}>Gerer mon profil</button>
          ) : (
            <>
              <button className="pp-btn-white" onClick={() => setShowInviteModal(true)}>Inviter sur un projet</button>
              {!isVisitor && <button className="pp-btn-white" onClick={handleContactViaMsg}>Messagerie</button>}
              <button className="pp-btn-white-solid" onClick={() => setShowContactModal(true)}>Contacter</button>
            </>
          )}
        </div>
      </div>

      {/* BODY */}
      <div className="pp-body">

        {/* METRICS — toujours visibles, contextualisés */}
        {(() => {
          const allReviews = (pubData?.reviews || store.reviews || []).map(r => ({ stars: r.note || r.stars || 0 }))
          // Si profil public chargé depuis backend → utilise les stats agregees
          const projTotal      = remoteStats ? remoteStats.projectsCount     : (store.projects || []).length
          const livres         = remoteStats ? remoteStats.projectsCompleted  : (store.projects || []).filter(p => p.avancement >= 100).length
          const enCours        = remoteStats ? remoteStats.projectsActive     : projTotal - livres
          const missionsCount  = remoteStats ? remoteStats.missionsCompleted  : (
            (store.markets || []).filter(m => m.statut === 'completed' || m.statut === 'livre').length +
            (store.offers  || []).filter(o => o.statut === 'accepted'  || o.statut === 'acceptee').length
          )
          const avgStars = allReviews.length > 0 ? allReviews.reduce((s, r) => s + (r.stars || 0), 0) / allReviews.length : 0
          const satisfaction = allReviews.length > 0 ? Math.round((avgStars / 5) * 100) : 0
          const ville = ob?.ville || ''

          const metrics = [
            { label: 'Projets', value: String(projTotal), sub: projTotal > 0 ? livres + ' livres à ' + enCours + ' en cours' : 'Activité en dûmarrage' },
            { label: 'Missions', value: String(missionsCount), sub: missionsCount > 0 ? missionsCount + ' réalisée(s)' : 'Aucune mission pour le moment' },
            { label: 'Satisfaction', value: allReviews.length > 0 ? satisfaction + '%' : '\u2014', sub: allReviews.length > 0 ? allReviews.length + ' avis vérifiés' : 'Pas encore évaluée' },
            { label: 'Zone', value: ville || '\u2014', sub: (ob?.zones?.length > 0 ? ob.zones.slice(0, 3).join(', ') : ob?.pays || "Côte d'Ivoire") || 'Non renseignée', small: true },
          ]

          return (
            <div className="pp-metrics">
              {metrics.map((m, i) => (
                <div key={i} className="pp-metric pp-fade-up" style={{animationDelay: `${i * .07}s`}}>
                  <span className="pp-metric-label">{m.label}</span>
                  <span className="pp-metric-value" style={m.small ? {fontSize:28,paddingTop:6} : undefined}>{m.value}</span>
                  <span className="pp-metric-sub">{m.sub}</span>
                </div>
              ))}
            </div>
          )
        })()}

        {/* ABOUT + SERVICES */}
        <div className="pp-two-col">
          <div className="pp-card pp-about">
            <p className="pp-section-label">à propos</p>
            <h2 className="pp-about-title">{proSlogan}</h2>
            {proBio ? (
              <p className="pp-about-text">{proBio}</p>
            ) : (
              <div style={{ padding: '16px 0', color: 'var(--t4)', fontSize: 13 }}>
                <p>Présentation non encore renseignée.</p>
                {isOwner && <button className="pp-see-all" style={{ marginTop: 8 }} onClick={() => {
                  setEpEntreprise(ob.entreprise || ''); setEpBio(ob.bio || ''); setEpSlogan(ob.slogan || '')
                  setEpVille(ob.ville || 'Abidjan'); setEpPays(ob.pays || "Côte d'Ivoire")
                  setEpEmail(ob.email || ob.emailPro || ''); setEpTel(ob.tel || ob.telPro || ''); setEpRccm(ob.rccm || '')
                  setEditSecteurs(ob.secteurs || []); setEditLogoColor(ob.logoColor || '#1D1D1F')
                  setEditModal('profil')
                }}>Ajouter une prèsentation →</button>}
              </div>
            )}
            {/* Infos clés — effectif, année, projets */}
            {(ob.effectif || ob.annee || ob.projetsN) && (
              <div style={{ display: 'flex', gap: 12, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border-subtle)', flexWrap: 'wrap' }}>
                {ob.annee && <div style={{ fontSize: 11, color: 'var(--t3)' }}>Fondûe en <strong style={{ color: 'var(--tx)' }}>{ob.annee}</strong></div>}
                {ob.effectif && <div style={{ fontSize: 11, color: 'var(--t3)' }}>Effectif : <strong style={{ color: 'var(--tx)' }}>{ob.effectif}</strong></div>}
                {ob.projetsN && <div style={{ fontSize: 11, color: 'var(--t3)' }}><strong style={{ color: 'var(--tx)' }}>{ob.projetsN}</strong> projets réalisés</div>}
              </div>
            )}
          </div>
          <div className="pp-card pp-services">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p className="pp-section-label" style={{ marginBottom: 0 }}>Compétences &amp; services</p>
              {isOwner && <button className="pp-see-all" style={{ fontSize: 11 }} onClick={() => { setEditServices(proServices.length > 0 ? [...proServices] : [...DEFAULT_SERVICES]); setEditModal('services') }}>Modifier</button>}
            </div>
            <div className="pp-services-grid" style={{ marginTop: 12 }}>
              {proServices.length > 0 ? proServices.map(s => <span key={s} className="pp-service-tag">{s}</span>) : (
                <div style={{ padding: '8px 0', color: 'var(--t4)', fontSize: 12 }}>
                  Aucun service renseigné.
                  {isOwner && <button className="pp-see-all" style={{ marginLeft: 8 }} onClick={() => { setEditServices([]); setEditModal('services') }}>Ajouter →</button>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* COORDONNéES */}
        {(proEmail || proTel || ob.rccm) && (
          <div className="pp-section">
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {proEmail && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--surface-1)', borderRadius: 10, border: '1px solid var(--border-card)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  <span style={{ fontSize: 12, color: 'var(--tx)' }}>{proEmail}</span>
                </div>
              )}
              {proTel && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--surface-1)', borderRadius: 10, border: '1px solid var(--border-card)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  <span style={{ fontSize: 12, color: 'var(--tx)' }}>{proTel}</span>
                </div>
              )}
              {ob.rccm && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--surface-1)', borderRadius: 10, border: '1px solid var(--border-card)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                  <span style={{ fontSize: 12, color: 'var(--tx)' }}>RCCM : {ob.rccm}</span>
                </div>
              )}
              {proVille && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--surface-1)', borderRadius: 10, border: '1px solid var(--border-card)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span style={{ fontSize: 12, color: 'var(--tx)' }}>{proVille}, {ob.pays || "Côte d'Ivoire"}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PORTFOLIO */}
        <div className="pp-section" id="pp-portfolio">
          <div className="pp-section-hdr">
            <h2 className="pp-section-title">Portfolio</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              {isOwner && <button className="pp-see-all" onClick={() => { setEditPortfolio(displayPortfolio.map(p => ({ ...p, imgs: p.imgs?.length > 0 ? p.imgs : (p.img ? [p.img] : []) }))); setEditModal('portfolio') }}>Gerer →</button>}
            </div>
          </div>
          {displayPortfolio.length > 0 ? (
            <div className="pp-portfolio-grid">
              {displayPortfolio.map((p, i) => {
                const imgs = p.imgs?.length > 0 ? p.imgs : (p.img ? [p.img] : [])
                const mainImg = imgs[0]
                const extraCount = imgs.length - 1
                return (
                  <div key={i} className={`pp-portfolio-item ${p.feat ? 'pp-feat' : ''}`} onClick={() => imgs.length > 0 && setPortfolioViewer({ imgs, idx: 0, cap: p.cap })} style={imgs.length > 0 ? { cursor: 'pointer' } : undefined}>
                    {mainImg && (mainImg.startsWith('data:') || mainImg.startsWith('http')) ? (
                      <img src={mainImg} alt={p.cap} />
                    ) : (
                      <div style={{ width: '100%', height: 200, background: 'var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9a9a9a', fontSize: 11, fontWeight: 500 }}>{p.cap || 'Realisation'}</div>
                    )}
                    {extraCount > 0 && (
                      <div style={{ position: 'absolute', bottom: 44, right: 10, background: 'rgba(0,0,0,.65)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 100, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        +{extraCount}
                      </div>
                    )}
                    <span className="pp-portfolio-count">{i + 1}/{displayPortfolio.length}</span>
                    <div className="pp-portfolio-overlay"><span>{p.cap}</span></div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 24px', background: 'var(--s2)', borderRadius: 12 }}>
              <div style={{ fontSize: 24, marginBottom: 8, opacity: .3 }}>&#128247;</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>Portfolio en cours de constitution</div>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 12 }}>Les realisations seront visibles ici une fois ajoutees.</div>
              {isOwner && <button className="pp-see-all" onClick={() => { setEditPortfolio([]); setEditModal('portfolio') }}>Ajouter des realisations →</button>}
            </div>
          )}
        </div>

        {/* TEAM */}
        <div className="pp-section">
          <div className="pp-section-hdr">
            <h2 className="pp-section-title">équipe dirigeante</h2>
            {isOwner && <button className="pp-see-all" onClick={() => { setEditTeamList(rawTeam.map(t => ({ ...t }))); setEditModal('equipe') }}>Gerer →</button>}
          </div>
          {displayTeam.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 24px', background: 'var(--s2)', borderRadius: 12 }}>
              <div style={{ fontSize: 24, marginBottom: 8, opacity: .3 }}>&#128101;</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>équipe non encore renseignée</div>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginBottom: 12 }}>Les membres de l'équipe apparaîtront ici.</div>
              {isOwner && <button className="pp-see-all" onClick={() => { setEditTeamList([]); setEditModal('equipe') }}>Ajouter des membres →</button>}
            </div>
          ) : (
          <div className="pp-three-col">
            {displayTeam.map((t, i) => {
              const initials = (t.name || '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
              // Photo uniquement si uploadûe par l'utilisateur (base64 ou URL rèelle)
              const photoUrl = t.photoUrl && t.photoUrl.startsWith('data:') ? t.photoUrl : (t.photoUrl && t.photoUrl.startsWith('http') ? t.photoUrl : null)
              return (
                <div key={i} className="pp-card pp-team-card">
                  {photoUrl
                    ? <img className="pp-team-av" src={photoUrl} alt={t.name} onError={e => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex') }} />
                    : null
                  }
                  {!photoUrl && <div className="pp-team-av" style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600, color: '#474747' }}>{initials}</div>}
                  <div>
                    <div className="pp-team-name">{t.name}</div>
                    <div className="pp-team-role">{t.role}</div>
                    {(t.email || t.linkedinUrl) && (
                      <div className="pp-team-links">
                        {t.linkedinUrl && (() => {
                          // Valider l'URL avant d'ouvrir (protection XSS)
                          let safeUrl = null
                          try { const u = new URL(t.linkedinUrl); if (u.protocol === 'https:') safeUrl = u.href } catch {}
                          return safeUrl ? <a className="pp-team-link" href={safeUrl} target="_blank" rel="noopener noreferrer" title="LinkedIn"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a> : null
                        })()}
                        {t.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t.email) && (
                          <a className="pp-team-link" href={'mailto:' + t.email} title="Email"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg></a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          )}
        </div>

        {/* PROJECTS */}
        <div className="pp-section">
          <div className="pp-section-hdr">
            <h2 className="pp-section-title">Projets actifs à Cockpit</h2>
            <button className="pp-see-all" onClick={() => navigate(isClient ? '/client' : '/cockpit')}>Accéder au suivi →</button>
          </div>
          {displayProjects.length > 0 ? (
            <div className="pp-card pp-project-list">
              {displayProjects.map((p, i) => (
                <div key={i} className="pp-project-row">
                  <span className="pp-project-num">{p.num}</span>
                  {p.img && <img src={p.img} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} onError={e => { e.target.style.display = 'none' }} />}
                  <div className="pp-project-info"><div className="pp-project-name">{p.name}</div><div className="pp-project-loc">{p.loc}</div></div>
                  <div className="pp-project-progress">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 9, color: '#9a9a9a' }}>{p.progress}%</span>
                    </div>
                    <div className="pp-project-progress-track"><div className="pp-project-progress-fill" style={{ width: p.progress + '%' }} /></div>
                  </div>
                  <span className={`pp-project-status pp-status-${p.cls}`}>{p.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 24px', background: 'var(--s2)', borderRadius: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t3)' }}>Aucun projet actif pour le moment.</div>
              {isOwner && <button className="pp-see-all" style={{ marginTop: 8 }} onClick={() => navigate('/cockpit')}>Créer un projet →</button>}
            </div>
          )}
        </div>

        {/* BADGE VERIFICATION — affiché uniquement si vérifié */}
        {isVerified && (
          <div className="pp-section">
            <div style={{ background: 'var(--surface-1)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(22,163,74,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11.5 14.5 15.5 9.5"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>Structure vérifiée par MEEREO</div>
                  <div style={{ fontSize: 12, color: 'var(--t3)', lineHeight: 1.6, marginBottom: 12 }}>Cette structure a été contrôlée et validûe par MEEREO. Son identité, ses documents légaux et sa conformité aux critéres de qualité ont été vérifiés.</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {['Identité vérifiée', 'Documents conformes', 'Critéres MEEREO validûs', 'Profil actif'].map(t => (
                      <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontWeight: 600, padding: '4px 10px', borderRadius: 100, background: 'rgba(22,163,74,.06)', color: '#16A34A' }}>
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {(() => {
          // Backend reviews (from pubData) or local store reviews — normalize format
          const rawReviews = pubData?.reviews || store.reviews || []
          const reviews = rawReviews.map(r => ({
            stars: r.note || r.stars || 0,
            text: r.comment || r.text || '',
            name: r.author?.name || r.authorName || r.name || '',
            company: r.author?.company || r.co || '',
            qualite: r.qualite,
            delais: r.delais,
            communication: r.communication,
            createdAt: r.createdAt,
          }))
          return (
            <div className="pp-section">
              <div className="pp-section-hdr">
                <h2 className="pp-section-title">Avis &amp; crédibilité</h2>
                {reviews.length > 0 && <span style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 500 }}>{reviews.length} avis vérifié{reviews.length > 1 ? 's' : ''}</span>}
              </div>
              {reviews.length > 0 ? (
                <div className="pp-three-col">
                  {reviews.map((r, i) => (
                    <div key={i} className="pp-card pp-review-card">
                      <span className="pp-review-quote">"</span>
                      <div className="pp-review-stars">{Array.from({length: r.stars}, (_, idx) => <Star key={idx} size={12} fill="#F59E0B" strokeWidth={0}/>)}</div>
                      {r.text && <p className="pp-review-text">"{r.text}"</p>}
                      {(r.qualite || r.delais || r.communication) && (
                        <div style={{ display: 'flex', gap: 8, marginTop: 6, marginBottom: 8 }}>
                          {r.qualite > 0 && <span style={{ fontSize: 10, color: 'var(--t3)', background: 'var(--s2)', padding: '2px 8px', borderRadius: 100 }}>Qualité {r.qualite}/5</span>}
                          {r.delais > 0 && <span style={{ fontSize: 10, color: 'var(--t3)', background: 'var(--s2)', padding: '2px 8px', borderRadius: 100 }}>Délais {r.delais}/5</span>}
                          {r.communication > 0 && <span style={{ fontSize: 10, color: 'var(--t3)', background: 'var(--s2)', padding: '2px 8px', borderRadius: 100 }}>Com. {r.communication}/5</span>}
                        </div>
                      )}
                      <div className="pp-review-author">
                        <div className="pp-review-av">{(r.name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()}</div>
                        <div><div className="pp-review-name">{r.name}</div>{r.company && <div className="pp-review-co">{r.company}</div>}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '32px 24px', background: 'var(--s2)', borderRadius: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--t3)' }}>Aucun avis vérifié pour le moment.</div>
                  <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 4 }}>Les avis des clients et partenaires apparaîtront ici.</div>
                </div>
              )}
            </div>
          )
        })()}

      </div>

      {/* STICKY CTA */}
      <div className="pp-sticky">
        <div className="pp-sticky-info">
          <div className="pp-sticky-name">{proName || 'Profil professionnel'}</div>
          <div className="pp-sticky-type">{[proSpecialite, proVille].filter(Boolean).join(' à ') || 'Professionnel MEEREO'}</div>
        </div>
        <div className="pp-sticky-sep" />
        {isOwner ? (
          <button className="pp-sticky-btn" onClick={() => navigate('/cockpit')}>Mon Cockpit →</button>
        ) : (
          <>
            <button className="pp-sticky-ghost" onClick={() => setShowInviteModal(true)}>Inviter sur un projet</button>
            {!isVisitor && <button className="pp-sticky-ghost" onClick={handleContactViaMsg}>Messagerie</button>}
            <button className="pp-sticky-btn" onClick={() => setShowContactModal(true)}>Contacter →</button>
          </>
        )}
      </div>

      {/* MODALS PROPRIéTAIRE: édition profil */}

      {/* Modal Profil Complet */}
      <Modal isOpen={editModal === 'profil'} onClose={() => setEditModal(null)} title="Gerer mon profil" wide footer={
        <><button className="btn btn-sm" onClick={() => setEditModal(null)}>Annuler</button><button className="btn btn-primary btn-sm" onClick={async () => {
          const updates = { entreprise: epEntreprise, bio: epBio, slogan: epSlogan, ville: epVille, pays: epPays, email: epEmail, tel: epTel, rccm: epRccm, secteurs: editSecteurs, logoColor: editLogoColor }
          const prevOb = store.onboardingData || {}
          updateStore(prev => ({
            ...prev,
            onboardingData: { ...(prev.onboardingData || {}), ...updates },
            user: prev.user ? { ...prev.user, name: epEntreprise || prev.user.name, email: epEmail || prev.user.email } : prev.user,
          }))
          try {
            const saved = await api.usersApi.updateOnboardingData(updates)
            if (saved && typeof saved === 'object' && Object.keys(saved).length > 0) {
              updateStore(prev => ({ ...prev, onboardingData: { ...(prev.onboardingData || {}), ...saved } }))
            }
            showToast('Profil mis à jour', 'green')
            setEditModal(null)
          } catch (e) {
            updateStore(prev => ({ ...prev, onboardingData: prevOb }))
            showToast(e?.message || 'Erreur lors de la sauvegarde', 'red')
          }
        }}>Enregistrer</button></>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Logo / Photo */}
          <div style={{ fontSize: 11, fontWeight: 600, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.06em' }}>Logo / Photo</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: 12, background: editLogoColor, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {ob.logoFileUrl
                ? <img src={ob.logoFileUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                : ob.photoUrl
                  ? <img src={ob.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ color: '#fff', fontSize: 22, fontWeight: 600 }}>{(epEntreprise || '?')[0]}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <input ref={logoInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                const f = e.target.files?.[0]; if (!f) return
                setEpLogoUploading(true)
                try {
                  const { uploadFile } = await import('../../../utils/upload')
                  let url = null
                  try { url = await uploadFile(f, 'logos', 'logo') } catch { /* MinIO indispo */ }
                  if (!url) {
                    // Fallback base64 — compressed logo (<400KB)
                    const { default: compress } = await import('../../../utils/compressImage')
                    url = await compress(f, 400, 0.85)
                  }
                  if (!url) throw new Error('Upload échoué')
                  updateStore(prev => ({ ...prev, onboardingData: { ...(prev.onboardingData || {}), logoFileUrl: url } }))
                  await api.usersApi.updateOnboardingData({ logoFileUrl: url }).catch(() => {})
                  showToast('Logo mis à jour', 'green')
                } catch { showToast('Erreur upload logo', 'red') } finally { setEpLogoUploading(false) }
              }} />
              <button className="btn btn-sm" disabled={epLogoUploading} onClick={() => logoInputRef.current?.click()}>{epLogoUploading ? 'Upload…' : 'Changer le logo'}</button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: '#9a9a9a' }}>Couleur fond :</span>
                <input type="color" value={editLogoColor} onChange={e => setEditLogoColor(e.target.value)} style={{ width: 28, height: 28, border: 'none', borderRadius: 6, cursor: 'pointer', padding: 0, background: 'none' }} />
              </div>
            </div>
          </div>
          {/* Identite */}
          <div style={{ fontSize: 11, fontWeight: 600, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 4 }}>Identite</div>
          <div><label className="form-label">Nom de la structure</label><input className="form-input" value={epEntreprise} onChange={e => setEpEntreprise(e.target.value)} placeholder="Nom de votre structure" /></div>
          <div><label className="form-label">Slogan / accroche</label><input className="form-input" value={epSlogan} onChange={e => setEpSlogan(e.target.value)} placeholder="Une architecture ancree dans la duree" /></div>
          <div><label className="form-label">Bio / presentation</label><textarea className="form-input" value={epBio} onChange={e => setEpBio(e.target.value)} placeholder="Presentez votre structure..." /></div>
          {/* Secteurs */}
          <div><label className="form-label">Secteurs d'activité</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
              {editSecteurs.map((s, i) => (
                <span key={i} style={{ padding: '4px 10px', borderRadius: 100, background: '#f3f4f5', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                  {s}
                  <button onClick={() => setEditSecteurs(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9a9a9a', fontSize: 14, lineHeight: 1 }}>×</button>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" value={epNewSecteur} onChange={e => setEpNewSecteur(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && epNewSecteur.trim()) { setEditSecteurs(prev => [...prev, epNewSecteur.trim()]); setEpNewSecteur('') } }} placeholder="Ex: Génie Civil, BTP, Architecture…" />
              <button className="btn btn-sm" disabled={!epNewSecteur.trim()} onClick={() => { if (epNewSecteur.trim()) { setEditSecteurs(prev => [...prev, epNewSecteur.trim()]); setEpNewSecteur('') } }}>+</button>
            </div>
          </div>
          {/* Coordonnees */}
          <div style={{ fontSize: 11, fontWeight: 600, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 8 }}>Coordonnees</div>
          <div className="modal-row" style={{ gap: 12 }}>
            <div><label className="form-label">Email</label><input className="form-input" type="email" value={epEmail} onChange={e => setEpEmail(e.target.value)} /></div>
            <div><label className="form-label">Telephone</label><input className="form-input" value={epTel} onChange={e => setEpTel(e.target.value)} /></div>
          </div>
          <div><label className="form-label">Numero RCCM</label><input className="form-input" value={epRccm} onChange={e => setEpRccm(e.target.value)} /></div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#9a9a9a', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 8 }}>Zone d'intervention</div>
          <div className="modal-row" style={{ gap: 12 }}>
            <div><label className="form-label">Ville principale</label><input className="form-input" value={epVille} onChange={e => setEpVille(e.target.value)} /></div>
            <div><label className="form-label">Pays</label><input className="form-input" value={epPays} onChange={e => setEpPays(e.target.value)} /></div>
          </div>
        </div>
      </Modal>

      {/* Modal Services */}
      <Modal isOpen={editModal === 'services'} onClose={() => setEditModal(null)} title="Gerer les services" footer={
        <><button className="btn btn-sm" onClick={() => setEditModal(null)}>Annuler</button><button className="btn btn-primary btn-sm" onClick={() => saveEdit('services', editServices)}>Enregistrer</button></>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {editServices.map((s, i) => (
              <span key={i} style={{ padding: '5px 12px', borderRadius: 100, background: '#f3f4f5', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                {s}
                <button onClick={() => setEditServices(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9a9a9a', fontSize: 14, lineHeight: 1 }}>×</button>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="form-input" value={editNewService} onChange={e => setEditNewService(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && editNewService.trim()) { setEditServices(prev => [...prev, editNewService.trim()]); setEditNewService('') } }} placeholder="Ajouter un service..." />
            <button className="btn btn-sm" disabled={!editNewService.trim()} onClick={() => { if (editNewService.trim()) { setEditServices(prev => [...prev, editNewService.trim()]); setEditNewService('') } }}>+</button>
          </div>
        </div>
      </Modal>

      {/* Modal Portfolio */}
      <Modal isOpen={editModal === 'portfolio'} onClose={() => setEditModal(null)} title="Portfolio" wide footer={
        <><button className="btn btn-sm" onClick={() => setEditModal(null)}>Annuler</button>
        <button className="btn btn-primary btn-sm" onClick={() => saveEdit('portfolio', editPortfolio)}>Enregistrer</button></>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {editPortfolio.length === 0 && (
            <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--t4)', fontSize: 13 }}>
              Aucun projet pour le moment — ajoutez-en un ci-dessous.
            </div>
          )}

          {editPortfolio.map((p, i) => {
            const imgs = p.imgs || []
            const pickAndAddImgs = () => {
              const inp = document.createElement('input')
              inp.type = 'file'; inp.accept = 'image/*'; inp.multiple = true
              inp.onchange = async (e) => {
                const files = Array.from(e.target.files || [])
                const { default: compress } = await import('../../../utils/compressImage')
                const newImgs = []
                for (const f of files) {
                  try {
                    // Try MinIO upload first — stores a URL instead of large base64
                    try {
                      const { uploadFile } = await import('../../../utils/upload')
                      const url = await uploadFile(f, 'portfolio', 'img')
                      if (url && typeof url === 'string') { newImgs.push(url); continue }
                    } catch { /* fall through to base64 */ }
                    // Fallback: small compressed base64 (~15-25 KB)
                    newImgs.push(await compress(f, 480, 0.60))
                  } catch { /* skip unreadable file */ }
                }
                if (newImgs.length) setEditPortfolio(prev => prev.map((x, j) => j === i ? { ...x, imgs: [...(x.imgs || []), ...newImgs] } : x))
              }
              inp.click()
            }

            return (
              <div key={i} style={{ background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)', overflow: 'hidden' }}>

                {/* ── Title row ────────────────────────── */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>
                  {/* Cover thumbnail / upload trigger */}
                  <div
                    onClick={pickAndAddImgs}
                    title="Cliquer pour ajouter des photos"
                    style={{ width: 46, height: 46, borderRadius: 8, overflow: 'hidden', flexShrink: 0, cursor: 'pointer', background: 'var(--s2)', border: '1.5px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {imgs[0]
                      ? <img src={imgs[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>}
                  </div>

                  <input
                    className="form-input"
                    style={{ flex: 1, fontWeight: 600 }}
                    value={p.cap}
                    onChange={e => setEditPortfolio(prev => prev.map((x, j) => j === i ? { ...x, cap: e.target.value } : x))}
                    placeholder="Titre du projet..."
                  />

                  {/* Featured star toggle */}
                  <button
                    title={p.feat ? 'Retirer de la une' : 'Mettre à la une'}
                    onClick={() => setEditPortfolio(prev => prev.map((x, j) => j === i ? { ...x, feat: !x.feat } : x))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px', flexShrink: 0, color: p.feat ? '#F59E0B' : 'var(--t4)', display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 500 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill={p.feat ? '#F59E0B' : 'none'} stroke={p.feat ? '#F59E0B' : 'currentColor'} strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {p.feat ? 'Une' : 'Une'}
                  </button>

                  <button
                    onClick={() => setEditPortfolio(prev => prev.filter((_, j) => j !== i))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--err)', fontSize: 18, lineHeight: 1, flexShrink: 0, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6 }}
                    title="Supprimer ce projet"
                  >×</button>
                </div>

                {/* ── Gallery row ───────────────────────── */}
                <div style={{ display: 'flex', gap: 7, padding: '2px 12px 12px', overflowX: 'auto', alignItems: 'flex-start' }}>
                  {imgs.map((src, k) => (
                    <div key={k} style={{ position: 'relative', flexShrink: 0 }}>
                      <img
                        src={src} alt=""
                        style={{ width: 70, height: 70, borderRadius: 8, objectFit: 'cover', display: 'block', border: k === 0 ? '2px solid #3B82F6' : '1.5px solid var(--border-card)' }}
                      />
                      {k === 0 && <span style={{ position: 'absolute', top: 3, left: 3, background: '#3B82F6', color: '#fff', fontSize: 8, fontWeight: 600, padding: '1px 5px', borderRadius: 3, pointerEvents: 'none' }}>Cover</span>}
                      <button
                        onClick={() => setEditPortfolio(prev => prev.map((x, j) => j === i ? { ...x, imgs: x.imgs.filter((_, m) => m !== k) } : x))}
                        style={{ position: 'absolute', top: -5, right: -5, width: 17, height: 17, borderRadius: '50%', background: 'var(--err)', color: '#fff', border: '1.5px solid var(--surface-1)', fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                      >×</button>
                    </div>
                  ))}
                  {/* Add photos */}
                  <div
                    onClick={pickAndAddImgs}
                    style={{ flexShrink: 0, width: 70, height: 70, borderRadius: 8, border: '1.5px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 3, background: 'var(--s2)', transition: 'opacity .15s' }}
                    onMouseOver={e => e.currentTarget.style.opacity = '.7'} onMouseOut={e => e.currentTarget.style.opacity = '1'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>
                    <span style={{ fontSize: 9, color: 'var(--t4)', fontWeight: 600 }}>Photos</span>
                  </div>
                </div>

                {imgs.length > 0 && (
                  <div style={{ padding: '0 12px 8px', fontSize: 10, color: 'var(--t4)' }}>
                    {imgs.length} photo{imgs.length > 1 ? 's' : ''} — la 1ère est la couverture
                  </div>
                )}
              </div>
            )
          })}

          {/* ── Add new project ───────────────────── */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 14px', background: 'var(--s2)', borderRadius: 10, border: '1.5px dashed var(--border)' }}>
            <input
              className="form-input"
              style={{ flex: 1, background: 'transparent', border: 'none', boxShadow: 'none', padding: '0 2px' }}
              value={newPortfolio.cap}
              onChange={e => setNewPortfolio(prev => ({ ...prev, cap: e.target.value }))}
              onKeyDown={e => {
                if (e.key === 'Enter' && newPortfolio.cap.trim()) {
                  setEditPortfolio(prev => [...prev, { cap: newPortfolio.cap, imgs: [], feat: false }])
                  setNewPortfolio({ cap: '', imgs: [], feat: false })
                }
              }}
              placeholder="+ Nouveau projet..."
            />
            <button className="btn btn-sm" disabled={!newPortfolio.cap.trim()} onClick={() => {
              setEditPortfolio(prev => [...prev, { cap: newPortfolio.cap, imgs: [], feat: false }])
              setNewPortfolio({ cap: '', imgs: [], feat: false })
            }}>Créer</button>
          </div>
        </div>
      </Modal>

      {/* Modal Equipe */}
      <Modal isOpen={editModal === 'equipe'} onClose={() => setEditModal(null)} title="Gerer l'equipe" wide footer={
        <><button className="btn btn-sm" onClick={() => setEditModal(null)}>Annuler</button><button className="btn btn-primary btn-sm" onClick={() => saveEdit('cockpitTeam', editTeamList.map(m => ({ ...m, nom: m.nom || m.name || '', name: m.name || m.nom || '', poste: m.poste || m.jobTitle || m.role || '', jobTitle: m.poste || m.jobTitle || m.role || '', photo: m.photo || m.photoUrl || '', photoUrl: m.photoUrl || m.photo || '' })))}>Enregistrer</button></>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {editTeamList.map((m, i) => (
            <div key={i} style={{ padding: '10px 14px', background: '#f8f9fa', borderRadius: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div
                  title="Cliquer pour ajouter une photo"
                  style={{ width: 36, height: 36, borderRadius: '50%', background: m.photoUrl ? 'transparent' : 'var(--s3)', overflow: 'hidden', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#474747', border: '1.5px dashed var(--border)', position: 'relative' }}
                  onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = async e => { const f = e.target.files[0]; if (!f) return; try { const { default: compress } = await import('../../../utils/compressImage'); const url = await compress(f, 150, 0.7); setEditTeamList(prev => prev.map((x, j) => j === i ? { ...x, photoUrl: url, photo: url } : x)) } catch { } }; inp.click() }}
                >
                  {m.photoUrl
                    ? <img src={m.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <Camera size={13} color="#9a9a9a" />}
                </div>
                <input className="form-input" style={{ flex: 1 }} value={m.name || ''} onChange={e => setEditTeamList(prev => prev.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Nom" />
                <input className="form-input" style={{ flex: 1 }} value={m.role || ''} onChange={e => setEditTeamList(prev => prev.map((x, j) => j === i ? { ...x, role: e.target.value } : x))} placeholder="Role" />
                <button onClick={() => setEditTeamList(prev => prev.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ba1a1a', fontSize: 14, flexShrink: 0 }}>×</button>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input className="form-input" style={{ flex: 1, fontSize: 11 }} value={m.email || ''} onChange={e => setEditTeamList(prev => prev.map((x, j) => j === i ? { ...x, email: e.target.value } : x))} placeholder="Email (optionnel)" />
                <input className="form-input" style={{ flex: 1, fontSize: 11 }} value={m.linkedinUrl || ''} onChange={e => setEditTeamList(prev => prev.map((x, j) => j === i ? { ...x, linkedinUrl: e.target.value } : x))} placeholder="LinkedIn URL (optionnel)" />
                <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#9a9a9a', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={m.isPublic !== false} onChange={e => setEditTeamList(prev => prev.map((x, j) => j === i ? { ...x, isPublic: e.target.checked } : x))} /> Public
                </label>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8, marginTop: 4, alignItems: 'center' }}>
            <div
              title="Photo du membre"
              style={{ width: 36, height: 36, borderRadius: '50%', background: newMember.photoUrl ? 'transparent' : 'var(--s3)', overflow: 'hidden', cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1.5px dashed var(--border)' }}
              onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = async e => { const f = e.target.files[0]; if (!f) return; try { const { default: compress } = await import('../../../utils/compressImage'); const url = await compress(f, 150, 0.7); setNewMember(prev => ({ ...prev, photoUrl: url })) } catch { } }; inp.click() }}
            >
              {newMember.photoUrl
                ? <img src={newMember.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <Camera size={13} color="#9a9a9a" />}
            </div>
            <input className="form-input" style={{ flex: 1 }} value={newMember.name} onChange={e => setNewMember(prev => ({ ...prev, name: e.target.value }))} placeholder="Nom du nouveau membre..." />
            <input className="form-input" style={{ flex: 1 }} value={newMember.role} onChange={e => setNewMember(prev => ({ ...prev, role: e.target.value }))} placeholder="Poste / rôle..." />
            <button className="btn btn-sm" disabled={!newMember.name.trim()} onClick={() => {
              setEditTeamList(prev => [...prev, { name: newMember.name, nom: newMember.name, role: newMember.role, poste: newMember.role, jobTitle: newMember.role, photoUrl: newMember.photoUrl || '', photo: newMember.photoUrl || '', email: '', linkedinUrl: '', isPublic: true }])
              setNewMember({ name: '', role: '', photoUrl: '' })
            }}>Ajouter</button>
          </div>
        </div>
      </Modal>

      {/* MODAL: Contacter le professionnel */}
      <Modal isOpen={showContactModal} onClose={() => setShowContactModal(false)} title={'Contacter ' + proName} footer={
        <>
          <button className="btn btn-sm" onClick={() => setShowContactModal(false)}>Annuler</button>
          <button className="btn btn-primary btn-sm" disabled={!contactMsg.trim() || contactSending} style={{ opacity: contactMsg.trim() && !contactSending ? 1 : .5 }} onClick={handleContact}>{contactSending ? '...' : 'Envoyer'}</button>
        </>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#f3f4f5', borderRadius: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: ob.logoColor || '#191c1d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{proInitials}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{proName}</div>
              <div style={{ fontSize: 10, color: '#6b7280' }}>{proSpecialite} à {proVille}</div>
            </div>
          </div>
          <div>
            <label className="form-label">Motif</label>
            <select className="form-input" value={contactMotif} onChange={e => setContactMotif(e.target.value)}>
              <option value="collaboration">Proposition de collaboration</option>
              <option value="devis">Demande de devis</option>
              <option value="information">Demande d'information</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div>
            <label className="form-label">Message</label>
            <textarea className="form-input" value={contactMsg} onChange={e => setContactMsg(e.target.value)} placeholder="Bonjour, je souhaite vous contacter concernant..." />
          </div>
        </div>
      </Modal>

      {/* MODAL: Inviter sur un projet */}
      <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title={'Inviter ' + proName + ' sur un projet'} footer={
        <>
          <button className="btn btn-sm" onClick={() => setShowInviteModal(false)}>Annuler</button>
          <button className="btn btn-primary btn-sm" disabled={!inviteProjet || inviteSending} style={{ opacity: inviteProjet && !inviteSending ? 1 : .5 }} onClick={handleInvite}>{inviteSending ? '...' : 'Envoyer l\'invitation'}</button>
        </>
      }>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#f3f4f5', borderRadius: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: ob.logoColor || '#191c1d', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>{proInitials}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{proName}</div>
              <div style={{ fontSize: 10, color: '#6b7280' }}>{proSpecialite} à {proVille}</div>
            </div>
          </div>
          <div>
            <label className="form-label">Projet *</label>
            <select className="form-input" value={inviteProjet} onChange={e => setInviteProjet(e.target.value)}>
              <option value="">Sélectionner un projet</option>
              {visitorProjects.map(p => <option key={p.id} value={p.id}>{p.nom} — {p.client}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Rôle / mission demandûe</label>
            <input className="form-input" value={inviteRole} onChange={e => setInviteRole(e.target.value)} placeholder="ex: Maitre d'oeuvre, BET Structure, OPC..." />
          </div>
          <div>
            <label className="form-label">Message (optionnel)</label>
            <textarea className="form-input" value={inviteMsg} onChange={e => setInviteMsg(e.target.value)} placeholder="Contexte de l'invitation..." />
          </div>
        </div>
      </Modal>

      {/* PORTFOLIO LIGHTBOX */}
      {portfolioViewer && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.93)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setPortfolioViewer(null)}>
          {/* Close */}
          <button onClick={() => setPortfolioViewer(null)} style={{ position: 'absolute', top: 20, right: 20, width: 42, height: 42, borderRadius: '50%', background: 'rgba(255,255,255,.1)', color: '#fff', border: 'none', fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>×</button>
          {/* Counter + caption */}
          <div style={{ position: 'absolute', top: 22, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,.7)', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>
            {portfolioViewer.cap && <span style={{ marginRight: 8, color: '#fff' }}>{portfolioViewer.cap} à</span>}
            {portfolioViewer.idx + 1} / {portfolioViewer.imgs.length}
          </div>
          {/* Prev arrow */}
          {portfolioViewer.imgs.length > 1 && (
            <button onClick={e => { e.stopPropagation(); setPortfolioViewer(prev => ({ ...prev, idx: (prev.idx - 1 + prev.imgs.length) % prev.imgs.length })) }} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,.1)', color: '#fff', border: 'none', fontSize: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>é</button>
          )}
          {/* Main image */}
          <img src={portfolioViewer.imgs[portfolioViewer.idx]} alt="" onClick={e => e.stopPropagation()} style={{ maxWidth: '88vw', maxHeight: '82vh', objectFit: 'contain', borderRadius: 10, boxShadow: '0 24px 64px rgba(0,0,0,.6)' }} />
          {/* Next arrow */}
          {portfolioViewer.imgs.length > 1 && (
            <button onClick={e => { e.stopPropagation(); setPortfolioViewer(prev => ({ ...prev, idx: (prev.idx + 1) % prev.imgs.length })) }} style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,255,255,.1)', color: '#fff', border: 'none', fontSize: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}>é</button>
          )}
          {/* Thumbnail strip */}
          {portfolioViewer.imgs.length > 1 && (
            <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6, maxWidth: '90vw', overflowX: 'auto', padding: '4px 8px' }} onClick={e => e.stopPropagation()}>
              {portfolioViewer.imgs.map((src, k) => (
                <div key={k} onClick={() => setPortfolioViewer(prev => ({ ...prev, idx: k }))} style={{ flexShrink: 0, width: 46, height: 46, borderRadius: 7, overflow: 'hidden', cursor: 'pointer', border: k === portfolioViewer.idx ? '2px solid #fff' : '2px solid rgba(255,255,255,.2)', opacity: k === portfolioViewer.idx ? 1 : 0.5, transition: 'all .15s' }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>,
        document.body
      )}

      {/* PAGE BUILDER SECTIONS */}
      {(pubData?.pageSections || []).length > 0 && (
        <div className="pp-builder-sections">
          {pubData.pageSections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))}
        </div>
      )}

      {/* FOOTER */}
      <footer className="pp-footer">
        <div className="pp-footer-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MeereoLogo size={22} /> MEEREO</div>
        <div className="pp-footer-links">
          <a href="#">Confidentialité</a><a href="#">Conditions</a><a href="#">Support</a>
          <span>© 2025 MEEREO SAS</span>
        </div>
      </footer>
      </>)}
    </div>
  )
}

