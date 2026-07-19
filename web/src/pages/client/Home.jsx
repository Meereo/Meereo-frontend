import AoGear, { getMetierColor } from '../../components/shared/AoGear'
import { formatDateFR, formatBudgetDisplay } from '../../utils/helpers'
import { ClipboardList, MessageSquare, Store, Settings, FolderOpen, Users, Wallet } from 'lucide-react'

export default function Home({ ctx }) {
  const {
    proj, projProgress, projBudget, projMarkets, projDocs,
    totalEngage, totalPendingActions, pendingPaymentReqs,
    displayedAOs, nonLus,
    setPage, respondProjectInvitation,
    ob, store, clientName,
    fmtDevise, formatShort,
    getMemberPhoto, setShowProDirectory,
  } = ctx

  // Détecte si un projet a une demande de clôture en attente
  // Vérifie le projet sélectionné d'abord, puis tous les projets, puis les clotureRequests
  const clotureProj = (proj?.clotureStatus === 'EN_ATTENTE_VALIDATION_CLIENT' ? proj : null)
    || (store.projects || []).find(p => p.clotureStatus === 'EN_ATTENTE_VALIDATION_CLIENT')
    || (() => {
      const req = (store.clotureRequests || []).find(r => r.status === 'EN_ATTENTE_VALIDATION_CLIENT')
      return req ? { ...(store.projects || []).find(p => p.id === req.projectId), id: req.projectId, nom: req.projectId, clotureStatus: 'EN_ATTENTE_VALIDATION_CLIENT' } : null
    })()

  return (
    <div className="cl-home-fadein">
      {/* Demande de clôture en attente */}
      {clotureProj && (
        <div style={{ padding: '18px 22px', marginBottom: 16, background: 'rgba(52,199,89,.04)', border: '2px solid rgba(52,199,89,.25)', borderRadius: 14, animation: 'modalIn .2s ease' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(52,199,89,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34c759" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#34C759' }}>Projet terminé — validation requise</div>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>Votre prestataire a déclaré le projet <strong>{clotureProj?.nom || 'votre projet'}</strong> comme terminé</div>
            </div>
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--t2)', lineHeight: 1.6, marginBottom: 14 }}>
            Confirmez la bonne réception du projet et partagez votre avis sur la prestation.
          </div>
          <button onClick={() => setPage('avancement')} style={{ padding: '10px 22px', borderRadius: 10, background: '#34C759', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', fontSize: 13, boxShadow: '0 4px 16px rgba(52,199,89,.25)' }}>
            Confirmer la réception
          </button>
        </div>
      )}

      {/* Invitations projet en attente */}
      {(() => {
        const email = ob.email || store.user?.email
        const pending = (store.projectInvitations || []).filter(i => i.clientEmail === email && i.status === 'pending')
        if (pending.length === 0) return null
        return pending.map(inv => {
          const project = (store.projects || []).find(p => p.id === inv.projectId)
          return (
            <div key={inv.id} style={{ padding: 20, marginBottom: 16, background: 'rgba(124,58,237,.03)', border: '1px solid rgba(124,58,237,.12)', borderRadius: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><ClipboardList size={16}/></div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Invitation projet</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)' }}>De {inv.sentByName || 'un professionnel'}</div>
                </div>
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--t2)', marginBottom: 12, lineHeight: 1.5 }}>
                Vous êtes invité à rejoindre le projet <strong>{project?.nom || project?.name || 'Nouveau projet'}</strong>.
                {project?.budget ? ` Budget : ${formatBudgetDisplay(project.budget)}.` : ''}
                {project?.localisation ? ` Localisation : ${project.localisation}.` : ''}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => respondProjectInvitation(inv.id, false)} style={{ flex: 1, padding: '10px 16px', borderRadius: 10, background: 'var(--surface-1)', color: 'var(--t3)', border: '1px solid var(--border)', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>Refuser</button>
                <button onClick={() => respondProjectInvitation(inv.id, true)} style={{ flex: 2, padding: '10px 16px', borderRadius: 10, background: '#7C3AED', color: '#fff', border: 'none', fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)' }}>Accepter le projet</button>
              </div>
            </div>
          )
        })
      })()}

      {!proj ? (
        /* ─── ÉTAT VIDE — Pas de projet ─── */
        <div style={{ maxWidth: 640, margin: '0 auto', paddingTop: 10 }}>
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-.4px', color: 'var(--tx)' }}>Bienvenue, {(clientName || '').split(' ')[0] || 'Client'}</div>
            <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 4 }}>Votre espace MEEREO est prêt.</div>
          </div>

          {(() => {
            const situation = ob.situation || ''
            const hasArchi = situation.includes('déjà un architecte')
            const cleEnMain = situation.includes('clé en main')
            const isExploring = situation.includes('découvrir la plateforme')
            let eyebrow = 'Demande envoyée'
            let title = 'Votre demande a bien été envoyée'
            let text = 'Des professionnels pourront bientôt vous répondre. Vous pourrez consulter leurs propositions et choisir avec qui avancer.'
            let action = 'En attendant, vous pouvez aussi rechercher vous-même un architecte, un constructeur ou un autre métier adapté à votre projet.'
            let cta = 'Rechercher un professionnel'
            let ctaPage = 'ao'

            if (isExploring) {
              eyebrow = 'Mode découverte'
              title = 'Bienvenue sur MEEREO'
              text = 'Explorez librement la plateforme — bourse des appels d\'offres, marketplace, suivi de projet, messagerie. Aucun engagement, aucune demande envoyée.'
              action = 'Quand vous êtes prêt à démarrer un projet, créez votre premier appel d\'offres pour trouver les professionnels adaptés.'
              cta = 'Explorer la bourse'
              ctaPage = 'ao'
            } else if (hasArchi) {
              eyebrow = 'Projet en préparation'
              title = 'Votre projet se prépare'
              text = 'Votre espace se met en place avec le professionnel associé à votre projet. Vous serez informé dès qu\'un document, une étape ou une action sera disponible.'
              action = 'Vous pouvez aussi rechercher d\'autres métiers si vous souhaitez compléter votre équipe.'
              cta = 'Compléter l\'équipe'
              ctaPage = 'ao'
            } else if (cleEnMain) {
              eyebrow = 'Prise en charge MEEREO'
              title = 'MEEREO organise votre projet'
              text = 'Nous prenons en charge la mise en place de votre projet. KAI vous accompagnera et vous tiendra informé des prochaines étapes.'
              action = 'Les professionnels adaptés seront identifiés et proposés au bon moment. Vous pouvez aussi explorer par vous-même.'
              cta = 'Explorer la plateforme'
              ctaPage = 'marketplace'
            }

            return (
              <div style={{ background: 'linear-gradient(150deg, #0f1011, #1a1d1e 40%, #2a2c2d)', borderRadius: 18, padding: '44px 40px', color: '#fff', marginBottom: 32, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.03) 0%, transparent 60%)', pointerEvents: 'none' }} />
                <div style={{ position: 'relative' }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,.35)', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: 14 }}>{eyebrow}</div>
                  <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-.5px', marginBottom: 10, lineHeight: 1.2 }}>{title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.5)', lineHeight: 1.7, maxWidth: 440, marginBottom: 6 }}>{text}</div>
                  <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.35)', lineHeight: 1.6, maxWidth: 440, marginBottom: 24 }}>{action}</div>
                  <button className="btn" style={{ background: '#fff', color: '#111', padding: '10px 20px', borderRadius: 10, fontSize: 12.5, fontWeight: 600, border: 'none', cursor: 'pointer' }} onClick={() => cta === 'Rechercher un professionnel' ? setShowProDirectory(true) : setPage(ctaPage)}>{cta}</button>
                </div>
              </div>
            )
          })()}

          {displayedAOs.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)' }}>Mes demandes en cours</div>
                <button className="btn btn-sm" style={{ fontSize: 10.5, padding: '4px 10px' }} onClick={() => setPage('ao')}>Voir tout</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {displayedAOs.slice(0, 3).map(ao => {
                  const storeOffers = (store.offers || []).filter(o => o.aoId === ao.id)
                  const hasOffers = storeOffers.length > 0
                  const isClosed = ao.status === 'closed'
                  const date = formatDateFR(ao.createdAt)
                  return (
                    <div key={ao.id} style={{ background: 'var(--surface-1)', borderRadius: 14, border: '1px solid var(--border-card)', overflow: 'hidden' }}>
                      <div onClick={() => setPage(hasOffers ? 'offres' : 'ao')} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', cursor: 'pointer', transition: 'background .12s' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: hasOffers ? 'rgba(22,163,74,.06)' : 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {hasOffers
                            ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>
                            : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--t3)" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>
                          }
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}><AoGear size={12} color={getMetierColor(ao.lot || ao.metier)} />{ao.title || ao.titre || 'Appel d\'offres'}</div>
                          <div style={{ fontSize: 11, color: 'var(--t4)', marginTop: 2 }}>{ao.lot || ao.metier || ''}{date ? ' · Créé le ' + date : ''}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: isClosed ? 'var(--t4)' : hasOffers ? 'var(--ok)' : 'var(--wrn)' }} />
                          <span style={{ fontSize: 11, fontWeight: 600, color: isClosed ? 'var(--t4)' : hasOffers ? 'var(--ok)' : 'var(--wrn)' }}>
                            {isClosed ? 'Clôturé' : hasOffers ? storeOffers.length + ' offre' + (storeOffers.length > 1 ? 's' : '') : 'Publié'}
                          </span>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6" /></svg>
                      </div>
                      {!hasOffers && !isClosed && (
                        <div style={{ padding: '10px 18px 14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--wrn)', marginTop: 6, flexShrink: 0 }} />
                          <div style={{ fontSize: 11.5, color: 'var(--t3)', lineHeight: 1.5 }}>
                            Votre demande est bien publiée et visible par les professionnels concernés. Vous serez notifié dès qu'une proposition sera reçue.
                          </div>
                        </div>
                      )}
                      {hasOffers && (
                        <div onClick={() => setPage('offres')} style={{ padding: '10px 18px 14px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                          <div style={{ fontSize: 11.5, color: 'var(--ok)', fontWeight: 600 }}>
                            {storeOffers.length} proposition{storeOffers.length > 1 ? 's' : ''} reçue{storeOffers.length > 1 ? 's' : ''} — consultez et comparez
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--tx)' }}>Voir →</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 14 }}>Comment ça marche</div>
            <div className="rg-4" style={{ gap: 10 }}>
              {[
                { n: '01', title: 'Découvrir le projet', desc: 'Comprendre la mission, les étapes et les intervenants.' },
                { n: '02', title: 'Suivre l\'avancement', desc: 'Voir où en est le chantier en temps réel.' },
                { n: '03', title: 'Valider les étapes', desc: 'Approuver les documents et livrables.' },
                { n: '04', title: 'Recevoir la livraison', desc: 'Centraliser les PV, échanges et paiements.' },
              ].map(step => (
                <div key={step.n} style={{ padding: '18px 16px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)' }}>
                  <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--t4)', letterSpacing: '-1px', marginBottom: 10, lineHeight: 1 }}>{step.n}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--tx)', marginBottom: 4 }}>{step.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.5 }}>{step.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 14 }}>Explorer</div>
            <div className="rg-3" style={{ gap: 10 }}>
              {[
                { icon: <MessageSquare size={18}/>, label: 'Messages', desc: 'Échanger avec votre équipe', p: 'messages' },
                { icon: <Store size={18}/>, label: 'Marketplace', desc: 'Parcourir les produits', p: 'marketplace' },
                { icon: <Settings size={18}/>, label: 'Paramètres', desc: 'Configurer votre espace', p: 'parametres' },
              ].map(btn => (
                <div key={btn.p} onClick={() => setPage(btn.p)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)', cursor: 'pointer', transition: 'all .15s' }}>
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{btn.icon}</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)' }}>{btn.label}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--t4)' }}>{btn.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ─── ÉTAT ACTIF — Projet en cours ─── */
        <div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-.4px', color: 'var(--tx)' }}>Bonjour, {(clientName || '').split(' ')[0] || 'Client'}</div>
            <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>

          {/* Actions urgentes — fusionne décisions + paiements */}
          {(() => {
            const storePending = (store.decisions || []).filter(d => d.statut === 'pending' && (d.projectId === proj?.id || !d.projectId) && d.visibility !== 'internal').map(d => ({ id: d.id, label: d.titre, page: 'decisions', severity: 'warn' }))
            const payReqs = pendingPaymentReqs.map(r => ({ id: r.id, label: r.label + ' — ' + fmtDevise(r.amount), page: 'budget', severity: 'critical' }))
            const items = [...payReqs, ...storePending].slice(0, 3)
            if (items.length === 0) return null
            return (
              <div style={{ marginBottom: 24 }}>
                {items.map((item, i) => (
                  <div key={item.id || i} onClick={() => setPage(item.page)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: 'var(--surface-1)', border: '1px solid var(--border-card)', borderRadius: 10, cursor: 'pointer', marginBottom: 6, transition: 'all .12s' }}>
                    <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{item.severity === 'critical' ? <Wallet size={14} color="var(--ok)"/> : <ClipboardList size={14} color="var(--wrn)"/>}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--tx)', flex: 1 }}>{item.label}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Hero projet */}
          <div className="dash-hero-v2" style={{ marginBottom: 28 }}>
            <div className="dash-hero-v2-glow" />
            <div style={{ position: 'relative' }}>
              <div className="dash-hero-v2-eyebrow">Votre projet</div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div className="dash-hero-v2-title">{proj.nom || 'Mon projet'}</div>
                  <div className="dash-hero-v2-client">{proj.type ? proj.type + ' · ' : ''}{proj.adresse || ''}{projBudget ? ' · ' + formatShort(projBudget) : ''}</div>
                </div>
                <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,.08)', color: 'rgba(255,255,255,.8)', border: '1px solid rgba(255,255,255,.12)', flexShrink: 0 }} onClick={() => setPage('avancement')}>Voir l'avancement →</button>
              </div>
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,.45)', fontWeight: 500 }}>Progression globale</span>
                  <span style={{ fontSize: 26, fontWeight: 600, color: proj.color || '#F59E0B', letterSpacing: '-1px', lineHeight: 1 }}>{projProgress}<span style={{ fontSize: 13, fontWeight: 500, opacity: .6 }}>%</span></span>
                </div>
                <div className="dash-hero-v2-track" style={{ height: 3 }}>
                  <div className="dash-hero-v2-fill" style={{ width: projProgress + '%', background: proj.color || undefined }} />
                </div>
              </div>
              <div className="rg-4" style={{ gap: 12 }}>
                {[
                  ['Phase', { ESQUISSE:'Esquisse', AVANT_PROJET:'Avant-projet', PROJET_DETAILLE:'Projet détaillé', PLANS_EXECUTION:'Plans d\'exécution', CONSULTATION_ENTREPRISES:'Consultation', ATTRIBUTION_MARCHES:'Attribution', SUIVI_CHANTIER:'Chantier', RECEPTION:'Réception' }[proj.phase] || proj.phase || '—'],
                  ['Budget engagé', totalEngage ? Math.round(totalEngage / Math.max(projBudget, 1) * 100) + '%' : '0%'],
                  ['Décisions', totalPendingActions > 0 ? totalPendingActions + ' en attente' : 'À jour'],
                  ['Livraison', proj.livraison ? formatDateFR(proj.livraison) : '—'],
                ].map(([l, v]) => (
                  <div key={l} style={{ padding: '12px 14px', background: 'rgba(255,255,255,.04)', borderRadius: 9, border: '1px solid rgba(255,255,255,.06)' }}>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,.3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 5 }}>{l}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Phases du projet — timeline horizontale */}
          {(proj?.etapes || []).length > 0 && (
            <div style={{ background: 'var(--surface-1)', borderRadius: 14, border: '1px solid var(--border-card)', padding: '18px 22px', marginBottom: 28 }}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)', marginBottom: 14 }}>Phases du projet</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 12, left: 16, right: 16, height: 2, background: 'var(--s3)', borderRadius: 2 }} />
                <div style={{ position: 'absolute', top: 12, left: 16, height: 2, borderRadius: 2, background: proj.color || '#F59E0B', width: ((proj.etapes.filter(e => e.done).length / Math.max(proj.etapes.length - 1, 1)) * 100) + '%', maxWidth: 'calc(100% - 32px)', transition: 'width .8s ease' }} />
                {proj.etapes.map((e, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, zIndex: 1, flex: 1 }}>
                    <div style={{ width: e.current ? 26 : 20, height: e.current ? 26 : 20, borderRadius: '50%', background: e.done ? (proj.color || 'var(--tx)') : e.current ? '#fff' : 'var(--surface-1)', border: e.done ? 'none' : e.current ? '2px solid ' + (proj.color || 'var(--tx)') : '1.5px solid var(--s3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: e.current ? '0 0 0 4px rgba(0,0,0,.06)' : 'none', transition: 'all .3s ease' }}>
                      {e.done && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>}
                      {e.current && <div style={{ width: 6, height: 6, borderRadius: '50%', background: proj.color || '#F59E0B' }} />}
                    </div>
                    <div style={{ fontSize: 8.5, fontWeight: e.done || e.current ? 700 : 400, color: e.current ? (proj.color || '#F59E0B') : e.done ? 'var(--tx)' : 'var(--t4)' }}>{e.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {displayedAOs.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--t4)' }}>Mes demandes</div>
                <button className="btn btn-sm" style={{ fontSize: 10.5, padding: '3px 10px' }} onClick={() => setPage('ao')}>Voir tout</button>
              </div>
              {displayedAOs.slice(0, 2).map(ao => {
                const aoOffers = (store.offers || []).filter(o => o.aoId === ao.id)
                const sLabel = ao.status === 'closed' ? 'Clôturé' : aoOffers.length > 0 ? aoOffers.length + ' offre' + (aoOffers.length > 1 ? 's' : '') : 'En attente'
                const sColor = ao.status === 'closed' ? 'var(--t4)' : aoOffers.length > 0 ? 'var(--ok)' : 'var(--wrn)'
                return (
                  <div key={ao.id} onClick={() => setPage('ao')} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', background: 'var(--surface-1)', borderRadius: 10, border: '1px solid var(--border-card)', cursor: 'pointer', marginBottom: 6, transition: 'all .12s' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: sColor, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--tx)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6 }}><AoGear size={11} color={getMetierColor(ao.lot || ao.metier)} />{ao.title || ao.titre}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--t4)' }}>{ao.lot || ao.metier}{ao.budget && ao.budget !== '—' ? ' · ' + formatBudgetDisplay(ao.budget) : ''}</div>
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 600, color: sColor, flexShrink: 0 }}>{sLabel}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--t4)" strokeWidth="2" style={{ flexShrink: 0 }}><polyline points="9 18 15 12 9 6" /></svg>
                  </div>
                )
              })}
            </div>
          )}

          <div className="rg-3" style={{ gap: 10, marginBottom: 28 }}>
            {[
              { icon: <FolderOpen size={18}/>, label: 'Documents', sub: (projDocs?.length || 0) + ' disponibles', p: 'documents' },
              { icon: <Users size={18}/>, label: 'Équipe', sub: ((proj?.equipe || []).length + projMarkets.filter(m => m.entreprise && !(proj?.equipe || []).some(e => e.nom === m.entreprise)).length) + ' intervenants', p: 'messages' },
              { icon: <MessageSquare size={18}/>, label: 'Messages', sub: nonLus > 0 ? nonLus + ' non lus' : 'À jour', p: 'messages' },
            ].map(card => (
              <div key={card.label} onClick={() => setPage(card.p)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--surface-1)', borderRadius: 12, border: '1px solid var(--border-card)', cursor: 'pointer', transition: 'all .12s' }}>
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>{card.icon}</div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--tx)' }}>{card.label}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--t4)' }}>{card.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Prochaines étapes + Équipe — 2 colonnes */}
          <div className="rg-2" style={{ gap: 16 }}>
            <div style={{ background: 'var(--surface-1)', borderRadius: 14, border: '1px solid var(--border-card)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>Prochaines étapes</div>
              </div>
              <div style={{ padding: 0 }}>
                {(() => {
                  const allEtapes = proj?.etapes || []
                  const steps = allEtapes.filter(e => !e.done).slice(0, 4).map(e => ({ label: e.label || e.n, date: e.deadline || '' }))
                  if (allEtapes.length === 0) return <div style={{ padding: '20px 18px', textAlign: 'center', fontSize: 12, color: 'var(--t4)' }}>Aucune étape configurée</div>
                  if (steps.length === 0) return <div style={{ padding: '20px 18px', textAlign: 'center', fontSize: 12, color: 'var(--t4)' }}>Toutes les étapes sont terminées</div>
                  return steps.map((e, i, arr) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: i === 0 ? '#F59E0B' : 'var(--s3)', flexShrink: 0 }} />
                      <div style={{ flex: 1, fontSize: 12, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? 'var(--tx)' : 'var(--t3)' }}>{e.label}</div>
                      {e.date && <span style={{ fontSize: 10, color: 'var(--t4)' }}>{formatDateFR(e.date)}</span>}
                    </div>
                  ))
                })()}
              </div>
            </div>

            <div style={{ background: 'var(--surface-1)', borderRadius: 14, border: '1px solid var(--border-card)', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tx)' }}>Équipe projet</div>
              </div>
              <div style={{ padding: 0 }}>
                {(() => {
                  const fromEquipe = proj?.equipe || []
                  const fromMarkets = projMarkets.filter(m => m.entreprise).map(m => ({ nom: m.entreprise, role: m.lot || 'Prestataire', statut: 'actif' }))
                  const allTeam = [...fromEquipe]
                  fromMarkets.forEach(fm => { if (!allTeam.some(t => t.nom === fm.nom)) allTeam.push(fm) })
                  return allTeam
                })().length === 0 ? (
                  <div style={{ padding: '20px 18px', textAlign: 'center', fontSize: 12, color: 'var(--t4)' }}>L'équipe sera visible une fois le projet démarré</div>
                ) : ((() => {
                  const fromEquipe = proj?.equipe || []
                  const fromMarkets = projMarkets.filter(m => m.entreprise).map(m => ({ nom: m.entreprise, role: m.lot || 'Prestataire', statut: 'actif' }))
                  const allTeam = [...fromEquipe]
                  fromMarkets.forEach(fm => { if (!allTeam.some(t => t.nom === fm.nom)) allTeam.push(fm) })
                  return allTeam
                })().slice(0, 5).map((m, i, arr) => {
                  const initials = (m.nom || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                  const photo = getMemberPhoto(m.nom)
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 18px', borderBottom: i < arr.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      {photo
                        ? <img src={photo} alt="" style={{ width: 28, height: 28, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                        : <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--s2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 600, color: 'var(--t2)', flexShrink: 0 }}>{initials}</div>
                      }
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{m.nom}</div>
                        <div style={{ fontSize: 10, color: 'var(--t3)' }}>{m.role}</div>
                      </div>
                    </div>
                  )
                }))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
