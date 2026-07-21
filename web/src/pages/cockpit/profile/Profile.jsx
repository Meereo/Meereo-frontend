import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMeereo } from '../../../hooks/useMeereoStore'
import Modal from '../../../components/shared/Modal'
import MeereoLogo from '../../../components/shared/MeereoLogo'
import { api } from '../../../services/api/client'
import SectionRenderer from '../../../components/sections-builder/SectionRenderer'
import { Star } from 'lucide-react'
import '../../../styles/profile.css'

export default function Profile() {
  const navigate = useNavigate()
  const { slug: routeSlug } = useParams()
  const { store, showToast, updateStore, emitEvent } = useMeereo()

  const uuid = routeSlug || null

  // ── Données publiques (chargées depuis le backend via UUID) ──────────────
  const [pubData, setPubData] = useState(null)
  const [pubLoading, setPubLoading] = useState(!!uuid)
  const [pubError, setPubError] = useState(null)

  useEffect(() => {
    if (!uuid) return
    setPubLoading(true)
    api.usersApi.getProProfile(uuid)
      .then(data => { setPubData(data); setPubLoading(false) })
      .catch(e => { setPubError(e.message || 'Profil introuvable'); setPubLoading(false) })
  }, [uuid])

  // ── Détection rôle ──
  const myPublicId = store.user?.publicId
  const isOwner = store.user?.type === 'pro' && (!uuid || uuid === myPublicId || uuid === store.user?.slug)
  const isClient = store.user?.type === 'client'
  const isVisitor = !store.user

  // Redirection non-pro
  useEffect(() => {
    if (!uuid && store.user && store.user.type !== 'pro') {
      const dest = store.user.type === 'client' ? '/client' : '/fournisseur'
      navigate(dest, { replace: true })
    }
  }, [uuid, store.user, navigate])

  // Redirect owner to canonical slug URL
  const mySlug = store.user?.slug || myPublicId
  useEffect(() => {
    if (isOwner && !uuid && mySlug) {
      navigate(`/pro/${mySlug}`, { replace: true })
    }
  }, [isOwner, uuid, mySlug, navigate])

  // ── Source de données ──
  const ob = isOwner ? (store.onboardingData || {}) : (pubData?.profile || store.onboardingData || {})
  const proName = ob.entreprise || store.user?.company || store.user?.name || pubData?.name || ''
  const proInitials = proName ? proName.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() : ''
  const proSpecialite = ob.secteurs?.[0] || ''
  const proVille = ob.ville || 'Abidjan'

  // Builder sections — owner reads from store or fetches, visitor from pubData
  const pageSections = useMemo(() => {
    if (!isOwner) return pubData?.pageSections || []
    return pubData?.pageSections || []
  }, [isOwner, pubData])

  // ── Écouter les actions des sections builder (boutons Contacter / Inviter) ──
  useEffect(() => {
    const handler = (e) => {
      if (e.detail === 'contact') setShowContactModal(true)
      if (e.detail === 'invite') setShowInviteModal(true)
    }
    window.addEventListener('meereo-profile-action', handler)
    return () => window.removeEventListener('meereo-profile-action', handler)
  }, [])

  // ── Contact modals ──
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactMsg, setContactMsg] = useState('')
  const [contactMotif, setContactMotif] = useState('collaboration')
  const [contactSending, setContactSending] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteProjet, setInviteProjet] = useState('')
  const [inviteRole, setInviteRole] = useState('')
  const [inviteMsg, setInviteMsg] = useState('')
  const [inviteSending, setInviteSending] = useState(false)

  const visitorName = store.user?.name || (ob.prenom ? `${ob.prenom} ${ob.nom || ''}`.trim() : '')
  const visitorRole = isClient ? 'client' : isOwner ? 'pro_owner' : 'pro_visitor'
  const visitorProjects = isClient
    ? (store.projects || []).filter(p => !p.clientId || p.clientId === store.user?.id)
    : (store.projects || []).filter(p => p.avancement < 100)

  const handleContact = useCallback(async () => {
    if (!contactMsg.trim() || contactSending) return
    if (!store.user) { navigate('/onboarding'); return }
    setContactSending(true)
    const motifLabels = { collaboration: 'Demande de collaboration', devis: 'Demande de devis', information: 'Demande d\'information', autre: 'Prise de contact' }
    const fullMsg = `[${motifLabels[contactMotif]}]\n${contactMsg}`
    try {
      // Créer ou retrouver une conversation backend avec le pro
      if (pubData?.id && store._token) {
        const convRes = await api.conversations.create({ participantId: pubData.id })
        const conv = convRes?.conversation || convRes
        if (conv?.id) {
          // Envoyer le message dans la conversation
          await api.conversations.sendMessage(conv.id, { text: fullMsg })
          // Notifier le pro
          api.notifications.create({
            targetUserId: pubData.id,
            type: 'contact_request',
            message: `Nouveau message de ${visitorName || 'un visiteur'} — ${motifLabels[contactMotif]}`,
            link: '/messages',
          }).catch(() => {})
          // Naviguer vers la messagerie
          sessionStorage.setItem('meereo_open_conv', conv.id)
          setContactSending(false)
          showToast('Message envoyé à ' + proName, 'green')
          setShowContactModal(false)
          setContactMsg('')
          setContactMotif('collaboration')
          navigate(isClient ? '/client/messages' : '/cockpit/messages')
          return
        }
      }
      // Fallback : notification seule si pas de backend ID
      api.notifications.create({
        targetUserId: pubData?.id || null,
        type: 'contact_request',
        message: `Nouveau message de ${visitorName || 'un visiteur'} — ${motifLabels[contactMotif]}`,
      }).catch(() => {})
      setContactSending(false)
      showToast('Message envoyé ! ' + proName + ' vous recontactera sous 24h', 'green')
      setShowContactModal(false)
      setContactMsg('')
      setContactMotif('collaboration')
    } catch (e) {
      setContactSending(false)
      showToast('Erreur : ' + (e.message || 'impossible d\'envoyer'), 'red')
    }
  }, [contactMsg, contactSending, contactMotif, proName, visitorName, pubData, store.user, store._token, isClient, navigate, showToast])

  const handleInvite = useCallback(async () => {
    if (!inviteProjet || inviteSending) return
    if (!store.user) { navigate('/onboarding'); return }
    setInviteSending(true)
    const projObj = (store.projects || []).find(p => p.id === inviteProjet)
    const inviteText = `[Invitation projet : ${projObj?.nom || 'Projet'}]\nRôle : ${inviteRole || proSpecialite || 'Non précisé'}${inviteMsg ? '\n' + inviteMsg : ''}`
    try {
      if (pubData?.id && store._token) {
        const convRes = await api.conversations.create({ participantId: pubData.id })
        const conv = convRes?.conversation || convRes
        if (conv?.id) {
          await api.conversations.sendMessage(conv.id, { text: inviteText })
          api.notifications.create({
            targetUserId: pubData.id,
            type: 'project_invitation',
            message: `Invitation de ${visitorName || 'un client'} pour ${projObj?.nom || 'un projet'}`,
            link: '/messages',
          }).catch(() => {})
          sessionStorage.setItem('meereo_open_conv', conv.id)
          setInviteSending(false)
          showToast('Invitation envoyée à ' + proName, 'blue')
          setShowInviteModal(false)
          setInviteProjet(''); setInviteRole(''); setInviteMsg('')
          navigate(isClient ? '/client/messages' : '/cockpit/messages')
          return
        }
      }
      api.notifications.create({
        targetUserId: pubData?.id || null,
        type: 'project_invitation',
        message: `Invitation de ${visitorName || 'un client'} pour ${projObj?.nom || 'un projet'} — rôle : ${inviteRole || proSpecialite}`,
      }).catch(() => {})
      setInviteSending(false)
      showToast('Invitation envoyée à ' + proName, 'blue')
      setShowInviteModal(false)
      setInviteProjet(''); setInviteRole(''); setInviteMsg('')
    } catch (e) {
      setInviteSending(false)
      showToast('Erreur : ' + (e.message || 'impossible d\'envoyer'), 'red')
    }
  }, [inviteProjet, inviteSending, inviteRole, inviteMsg, proName, proSpecialite, visitorName, pubData, store.user, store._token, store.projects, isClient, navigate, showToast])

  const handleContactViaMsg = useCallback(() => {
    if (isVisitor || !store.user) { navigate('/onboarding'); return }
    const existing = (store.conversations || []).find(c =>
      !c.isGroup && !c._deleted && (
        (pubData?.id && c.participantId === pubData.id) || c.nom === proName
      )
    )
    let convId
    if (existing) {
      convId = existing.id
    } else {
      convId = 'conv_' + Date.now()
      const newConv = {
        id: convId, nom: proName, participantId: pubData?.id || null,
        type: pubData?.id ? 'entreprise' : 'demande',
        avatar: proInitials?.[0] || proName[0] || '?', color: ob.logoColor || '#191c1d',
        isGroup: false, participants: [proName], pending: !pubData?.id, invited: !pubData?.id,
        dernier: pubData?.id ? '' : 'Demande envoyée', time: 'Maintenant', unread: 0,
        msgs: pubData?.id ? [] : [{ side: 'out', text: 'Bonjour, je souhaiterais échanger avec vous.', time: 'Maintenant', read: false }],
      }
      updateStore(prev => ({ ...prev, conversations: [newConv, ...(prev.conversations || [])] }))
    }
    sessionStorage.setItem('meereo_open_conv', convId)
    navigate(isClient ? '/client/messages' : '/cockpit/messages')
  }, [isVisitor, store.user, store.conversations, proName, proInitials, pubData, ob.logoColor, isClient, navigate, updateStore])

  return (
    <div className="pp-page">

      {/* LOADING / ERROR */}
      {pubLoading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 16 }}>
          <div style={{ width: 28, height: 28, border: '3px solid rgba(0,0,0,.08)', borderTopColor: '#111', borderRadius: '50%', animation: 'spin .6s linear infinite' }} />
          <div style={{ fontSize: 13, color: '#999' }}>Chargement du profil...</div>
        </div>
      )}
      {pubError && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 32, opacity: .3 }}>{'\u26A0'}</div>
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
              <button className="pp-btn-primary" onClick={() => {
                navigate('/cockpit/page-builder')
              }}>Modifier ma page</button>
            </>
          ) : isVisitor ? (
            <>
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

      {/* MAIN CONTENT — Builder sections or placeholder */}
      {pageSections.length > 0 ? (
        <div className="pp-builder-sections">
          {pageSections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))}
          {/* Visitor actions bar */}
          {!isOwner && !isVisitor && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: '32px 24px', background: 'var(--surface-1)', borderTop: '1px solid var(--border-card)' }}>
              <button className="pp-btn-ghost" onClick={() => setShowInviteModal(true)}>Inviter sur un projet</button>
              <button className="pp-btn-ghost" onClick={handleContactViaMsg}>Messagerie</button>
              <button className="pp-btn-primary" onClick={() => setShowContactModal(true)}>Contacter {proName}</button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '40px 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: 480 }}>
            <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 12px 32px rgba(37,99,235,.2)' }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
            </div>
            {isOwner ? (
              <>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--tx)', marginBottom: 10 }}>Créez votre page professionnelle</h2>
                <p style={{ fontSize: 14, color: 'var(--t3)', lineHeight: 1.6, marginBottom: 24 }}>
                  Construisez votre vitrine en ligne avec notre éditeur visuel. Ajoutez vos réalisations, votre équipe, vos services et bien plus — le tout en quelques minutes.
                </p>
                <button
                  onClick={() => { navigate('/cockpit/page-builder') }}
                  style={{ padding: '12px 28px', borderRadius: 10, background: '#191c1d', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', boxShadow: '0 4px 16px rgba(0,0,0,.15)', transition: 'transform .12s' }}
                  onMouseOver={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                  onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  Ouvrir l'éditeur de page
                </button>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--tx)', marginBottom: 10 }}>{proName || 'Professionnel MEEREO'}</h2>
                <p style={{ fontSize: 14, color: 'var(--t3)', lineHeight: 1.6, marginBottom: 24 }}>
                  Cette page est en cours de construction. Revenez bientôt pour découvrir le profil complet de {proName || 'ce professionnel'}.
                </p>
                {!isVisitor && (
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                    <button className="pp-btn-ghost" onClick={() => setShowInviteModal(true)}>Inviter sur un projet</button>
                    <button className="pp-btn-primary" onClick={() => setShowContactModal(true)}>Contacter</button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Avis clients — toujours visible si des avis existent */}
      {(pubData?.reviews || []).length > 0 && (
        <section style={{ padding: '48px 0', background: '#FAFAFA', borderTop: '1px solid #E5E5E5' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <span style={{ fontFamily: 'var(--f-mono, monospace)', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: '#888' }}>Avis clients</span>
              {pubData?.stats?.noteAvg && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600 }}>
                  {Array.from({ length: 5 }, (_, i) => <Star key={i} size={14} fill={i < Math.round(pubData.stats.noteAvg) ? '#F59E0B' : 'none'} stroke={i < Math.round(pubData.stats.noteAvg) ? '#F59E0B' : '#D1D5DB'} strokeWidth={1.5} />)}
                  <span style={{ marginLeft: 4 }}>{pubData.stats.noteAvg}/5</span>
                  <span style={{ fontSize: 11, color: '#888', fontWeight: 400, marginLeft: 4 }}>({pubData.stats.reviewsCount} avis)</span>
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {pubData.reviews.map((r, i) => (
                <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 22, padding: '18px 0', borderBottom: '1px solid #E5E5E5', borderTop: i === 0 ? '1px solid #1D1D1F' : undefined }}>
                  <div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {Array.from({ length: 5 }, (_, j) => <Star key={j} size={11} fill={j < r.note ? '#F59E0B' : 'none'} stroke={j < r.note ? '#F59E0B' : '#D1D5DB'} strokeWidth={1.5} />)}
                    </div>
                    <span style={{ fontFamily: 'var(--f-mono, monospace)', fontSize: 11, color: '#888', marginTop: 4, display: 'block' }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : ''}
                    </span>
                  </div>
                  <div>
                    {r.comment && <p style={{ fontSize: 14.5, color: '#333', margin: '0 0 8px', lineHeight: 1.5 }}>{r.comment}</p>}
                    <div style={{ fontSize: 12.5 }}>
                      <b style={{ fontWeight: 600 }}>{r.author?.company || r.author?.name || 'Client'}</b>
                      <span style={{ marginLeft: 6, fontFamily: 'var(--f-mono, monospace)', fontSize: 11, color: '#888' }}>Retour vérifié — projet MEEREO</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="pp-footer">
        <div className="pp-footer-logo" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MeereoLogo size={22} /> MEEREO</div>
        <div className="pp-footer-links">
          <a href="#">Confidentialité</a><a href="#">Conditions</a><a href="#">Support</a>
          <span>© 2025 MEEREO SAS</span>
        </div>
      </footer>

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
              <div style={{ fontSize: 10, color: '#6b7280' }}>{proSpecialite} {proVille}</div>
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
              <div style={{ fontSize: 10, color: '#6b7280' }}>{proSpecialite} {proVille}</div>
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
            <label className="form-label">Rôle / mission demandée</label>
            <input className="form-input" value={inviteRole} onChange={e => setInviteRole(e.target.value)} placeholder="ex: Maitre d'oeuvre, BET Structure, OPC..." />
          </div>
          <div>
            <label className="form-label">Message (optionnel)</label>
            <textarea className="form-input" value={inviteMsg} onChange={e => setInviteMsg(e.target.value)} placeholder="Contexte de l'invitation..." />
          </div>
        </div>
      </Modal>

      </>)}
    </div>
  )
}
