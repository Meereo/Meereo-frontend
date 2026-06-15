/**
 * CockpitModals — All creation modals extracted from CockpitApp.
 * Each modal manages its own form state internally.
 * CockpitApp only passes: modal (which one is open), closeModal, showToast.
 */
import { useState } from 'react'
import Modal from '../../components/shared/Modal'
import MoneyInput from '../../components/shared/MoneyInput'
import { useMeereo } from '../../hooks/useMeereoStore'
import { api } from '../../services/api/client'

// Styles now in cockpit.css: .form-input, .form-label, .form-row, .form-stack

const ErrMsg = ({ show }) => show
  ? <p style={{ color: 'var(--err)', fontSize: 11, marginTop: 4, fontWeight: 500 }}>Champ obligatoire</p>
  : null

// ─── Individual modal components with internal state ───

function ProjetModal({ isOpen, onClose, showToast }) {
  const { updateStore, createProject } = useMeereo()
  const [f, setF] = useState({ nom: '', type: 'Maison / Villa', phase: 'ESQUISSE', client: '', clientEmail: '', budget: '', livraison: '', localisation: '', priorite: 'Normale', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const submit = () => {
    setSubmitted(true)
    if (!f.nom.trim() || submitting) return
    setSubmitting(true)
    createProject({ name: f.nom, type: f.type, budget: f.budget, address: f.localisation, phase: f.phase, livraison: f.livraison, priorite: f.priorite, description: f.description, client: f.client, clientEmail: f.clientEmail })
    if (f.client) {
      // Créer le contact client en base si pas déjà présent
      api.contacts.create({ type: 'client', nom: f.client, email: f.clientEmail || null })
        .then(created => updateStore(prev => {
          if ((prev.clients || []).some(c => c.nom === f.client)) return prev
          return { ...prev, contacts: [...(prev.contacts || []), created], clients: [...(prev.clients || []), created] }
        }))
        .catch(() => {})
    }
    showToast('Projet créé')
    setF({ nom: '', type: 'Maison / Villa', phase: 'ESQUISSE', client: '', clientEmail: '', budget: '', livraison: '', localisation: '', priorite: 'Normale', description: '' })
    setSubmitted(false)
    onClose()
    setSubmitting(false)
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau projet" footer={<><button className="btn btn-sm" onClick={onClose}>Annuler</button><button className="btn btn-primary btn-sm" onClick={submit} disabled={submitting}>{submitting ? 'Création...' : 'Créer le projet'}</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label className="form-label">Nom du projet *</label><input className="form-input" placeholder="ex: Mon premier projet" value={f.nom} onChange={e => setF(p => ({ ...p, nom: e.target.value }))} /><ErrMsg show={submitted && !f.nom.trim()} /></div>
        <div className="form-row">
          <div><label className="form-label">Type</label><select className="form-input" value={f.type} onChange={e => setF(p => ({ ...p, type: e.target.value }))}><option>Maison / Villa</option><option>Magasin / Activité</option><option>Usage mixte</option><option>Bureaux / Entreprise</option><option>Autre</option></select></div>
          <div><label className="form-label">Phase du projet</label><select className="form-input" value={f.phase} onChange={e => setF(p => ({ ...p, phase: e.target.value }))}><option value="ESQUISSE">Esquisse</option><option value="AVANT_PROJET">Avant-projet</option><option value="PROJET_DETAILLE">Projet détaillé</option><option value="PLANS_EXECUTION">Plans d'exécution</option><option value="CONSULTATION_ENTREPRISES">Consultation des entreprises</option><option value="ATTRIBUTION_MARCHES">Attribution des marchés</option><option value="SUIVI_CHANTIER">Suivi de chantier</option><option value="RECEPTION">Réception du projet</option></select></div>
        </div>
        <div><label className="form-label">Client</label><input className="form-input" placeholder="Nom du maître d'ouvrage" value={f.client} onChange={e => setF(p => ({ ...p, client: e.target.value }))} /></div>
        <div><label className="form-label">Email du client</label><input className="form-input" type="email" placeholder="client@email.com — invitation automatique" value={f.clientEmail} onChange={e => setF(p => ({ ...p, clientEmail: e.target.value }))} /></div>
        <div className="form-row">
          <div><label className="form-label">Budget estimé (FCFA)</label><MoneyInput value={f.budget} onChange={v => setF(p => ({ ...p, budget: v }))} placeholder="4 800 000" /></div>
          <div><label className="form-label">Livraison prévue</label><input className="form-input" type="date" value={f.livraison} onChange={e => setF(p => ({ ...p, livraison: e.target.value }))} /></div>
        </div>
        <div className="form-row">
          <div><label className="form-label">Localisation</label><input className="form-input" placeholder="Abidjan, Cocody" value={f.localisation} onChange={e => setF(p => ({ ...p, localisation: e.target.value }))} /></div>
          <div><label className="form-label">Priorité</label><select className="form-input" value={f.priorite} onChange={e => setF(p => ({ ...p, priorite: e.target.value }))}><option>Normale</option><option>Haute</option><option>Critique</option></select></div>
        </div>
        <div><label className="form-label">Description</label><textarea className="form-input" rows="2" placeholder="Contexte, objectifs..." value={f.description} onChange={e => setF(p => ({ ...p, description: e.target.value }))} /></div>
      </div>
    </Modal>
  )
}

function ClientModal({ isOpen, onClose, showToast }) {
  const { updateStore, emitEvent } = useMeereo()
  const [f, setF] = useState({ nom: '', type: 'Public', statut: 'actif', contact: '', poste: '', email: '', tel: '' })
  const [submitted, setSubmitted] = useState(false)
  const submit = async () => {
    setSubmitted(true)
    if (!f.nom.trim()) return
    try {
      const created = await api.contacts.create({ type: 'client', nom: f.nom, email: f.email || null, tel: f.tel || null, poste: f.poste || null, statut: f.statut || null, entreprise: f.contact || null })
      updateStore(prev => ({ ...prev, contacts: [...(prev.contacts || []), created], clients: [...(prev.clients || []), created] }))
      emitEvent('client_created', { name: f.nom })
      showToast('Client créé')
      setF({ nom: '', type: 'Public', statut: 'actif', contact: '', poste: '', email: '', tel: '' })
      setSubmitted(false)
      onClose()
    } catch (e) {
      showToast(e.message || 'Erreur création client', 'red')
    }
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau client" footer={<><button className="btn btn-sm" onClick={onClose}>Annuler</button><button className="btn btn-primary btn-sm" onClick={submit}>Créer le client</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label className="form-label">Nom / Raison sociale *</label><input className="form-input" placeholder="ex: Mairie de Vincennes" value={f.nom} onChange={e => setF(p => ({ ...p, nom: e.target.value }))} /><ErrMsg show={submitted && !f.nom.trim()} /></div>
        <div className="form-row">
          <div><label className="form-label">Type</label><select className="form-input" value={f.type} onChange={e => setF(p => ({ ...p, type: e.target.value }))}><option>Public</option><option>Privé</option><option>Particulier</option></select></div>
          <div><label className="form-label">Statut</label><select className="form-input" value={f.statut} onChange={e => setF(p => ({ ...p, statut: e.target.value }))}><option>Actif</option><option>Prospect</option><option>Inactif</option></select></div>
        </div>
        <div className="form-row">
          <div><label className="form-label">Contact</label><input className="form-input" placeholder="Prénom Nom" value={f.contact} onChange={e => setF(p => ({ ...p, contact: e.target.value }))} /></div>
          <div><label className="form-label">Poste</label><input className="form-input" placeholder="DGA Urbanisme" value={f.poste} onChange={e => setF(p => ({ ...p, poste: e.target.value }))} /></div>
        </div>
        <div className="form-row">
          <div><label className="form-label">Email</label><input className="form-input" type="email" placeholder="contact@exemple.com" value={f.email} onChange={e => setF(p => ({ ...p, email: e.target.value }))} /></div>
          <div><label className="form-label">Téléphone</label><input className="form-input" placeholder="+225 07 00 00 00" value={f.tel} onChange={e => setF(p => ({ ...p, tel: e.target.value }))} /></div>
        </div>
      </div>
    </Modal>
  )
}

function OffreModal({ isOpen, onClose, showToast }) {
  const { store, updateStore, emitEvent } = useMeereo()
  const [f, setF] = useState({ titre: '', entreprise: '', projet: '', montant: '', delai: '', note: '' })
  const [submitted, setSubmitted] = useState(false)
  const submit = () => {
    setSubmitted(true)
    if (!f.titre.trim()) return
    updateStore(prev => ({ ...prev, offers: [...(prev.offers || []), { id: 'off_' + Date.now(), ...f, statut: 'en_attente', createdAt: new Date().toISOString() }] }))
    emitEvent('offer_received', { title: f.titre, from: f.entreprise }, { notifMsg: `Nouvelle offre : ${f.titre}`, notifType: 'blue' })
    showToast('Offre enregistrée')
    setF({ titre: '', entreprise: '', projet: '', montant: '', delai: '', note: '' })
    setSubmitted(false)
    onClose()
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Enregistrer une offre" footer={<><button className="btn btn-sm" onClick={onClose}>Annuler</button><button className="btn btn-primary btn-sm" onClick={submit}>Enregistrer</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label className="form-label">Titre du lot *</label><input className="form-input" placeholder="ex: Gros Oeuvre — Villa" value={f.titre} onChange={e => setF(p => ({ ...p, titre: e.target.value }))} /><ErrMsg show={submitted && !f.titre.trim()} /></div>
        <div className="form-row">
          <div><label className="form-label">Entreprise</label><input className="form-input" placeholder="Nom" value={f.entreprise} onChange={e => setF(p => ({ ...p, entreprise: e.target.value }))} /></div>
          <div><label className="form-label">Projet</label><select className="form-input" value={f.projet} onChange={e => setF(p => ({ ...p, projet: e.target.value }))}>{(store.projects || []).map(p => <option key={p.id}>{p.nom}</option>)}</select></div>
        </div>
        <div className="form-row">
          <div><label className="form-label">Montant (FCFA)</label><MoneyInput value={f.montant} onChange={v => setF(p => ({ ...p, montant: v }))} placeholder="45 000 000" /></div>
          <div><label className="form-label">Délai</label><input className="form-input" placeholder="4 mois" value={f.delai} onChange={e => setF(p => ({ ...p, delai: e.target.value }))} /></div>
        </div>
        <div><label className="form-label">Note d'analyse</label><textarea className="form-input" rows="3" placeholder="Observations..." value={f.note} onChange={e => setF(p => ({ ...p, note: e.target.value }))} /></div>
      </div>
    </Modal>
  )
}

function MarcheModal({ isOpen, onClose, showToast }) {
  const { store, updateStore, emitEvent } = useMeereo()
  const [f, setF] = useState({ objet: '', entreprise: '', montant: '', lot: '', projet: '' })
  const [submitted, setSubmitted] = useState(false)
  const submit = () => {
    setSubmitted(true)
    if (!f.objet.trim()) return
    updateStore(prev => ({ ...prev, markets: [...(prev.markets || []), { id: 'mkt_' + Date.now(), objet: f.objet, entreprise: f.entreprise, montant: parseFloat(f.montant) || 0, lot: f.lot, projectId: f.projet, statut: 'en_cours', createdAt: new Date().toISOString() }] }))
    emitEvent('market_signed', { company: f.entreprise }, { notifMsg: `Marché signé avec ${f.entreprise}`, notifType: 'green' })
    showToast('Marché créé')
    setF({ objet: '', entreprise: '', montant: '', lot: '', projet: '' })
    setSubmitted(false)
    onClose()
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau marché" footer={<><button className="btn btn-sm" onClick={onClose}>Annuler</button><button className="btn btn-primary btn-sm" onClick={submit}>Enregistrer</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label className="form-label">Objet du marché *</label><input className="form-input" placeholder="Titre..." value={f.objet} onChange={e => setF(p => ({ ...p, objet: e.target.value }))} /><ErrMsg show={submitted && !f.objet.trim()} /></div>
        <div><label className="form-label">Entreprise attributaire</label><input className="form-input" placeholder="Nom..." value={f.entreprise} onChange={e => setF(p => ({ ...p, entreprise: e.target.value }))} /></div>
        <div className="form-row">
          <div><label className="form-label">Montant (FCFA)</label><MoneyInput value={f.montant} onChange={v => setF(p => ({ ...p, montant: v }))} placeholder="45 000 000" /></div>
          <div><label className="form-label">Lot</label><input className="form-input" placeholder="Gros Oeuvre" value={f.lot} onChange={e => setF(p => ({ ...p, lot: e.target.value }))} /></div>
        </div>
        <div><label className="form-label">Projet</label><select className="form-input" value={f.projet} onChange={e => setF(p => ({ ...p, projet: e.target.value }))}><option value="">Choisir</option>{(store.projects || []).map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}</select></div>
      </div>
    </Modal>
  )
}

function InterModal({ isOpen, onClose, showToast }) {
  const { updateStore } = useMeereo()
  const [f, setF] = useState({ nom: '', role: '', email: '', tel: '' })
  const [submitted, setSubmitted] = useState(false)
  const submit = async () => {
    setSubmitted(true)
    if (!f.nom.trim()) return
    try {
      const created = await api.contacts.create({ type: 'intervenant', nom: f.nom, role: f.role || null, email: f.email || null, tel: f.tel || null })
      updateStore(prev => ({ ...prev, contacts: [...(prev.contacts || []), created], intervenants: [...(prev.intervenants || []), created] }))
      showToast('Intervenant ajouté')
      setF({ nom: '', role: '', email: '', tel: '' })
      setSubmitted(false)
      onClose()
    } catch (e) {
      showToast(e.message || 'Erreur ajout intervenant', 'red')
    }
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvel intervenant" footer={<><button className="btn btn-sm" onClick={onClose}>Annuler</button><button className="btn btn-primary btn-sm" onClick={submit}>Ajouter</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label className="form-label">Nom complet *</label><input className="form-input" placeholder="Prénom Nom" value={f.nom} onChange={e => setF(p => ({ ...p, nom: e.target.value }))} /><ErrMsg show={submitted && !f.nom.trim()} /></div>
        <div><label className="form-label">Rôle / Spécialité</label><input className="form-input" placeholder="BET Structure, Géomètre..." value={f.role} onChange={e => setF(p => ({ ...p, role: e.target.value }))} /></div>
        <div className="form-row">
          <div><label className="form-label">Email</label><input className="form-input" type="email" value={f.email} onChange={e => setF(p => ({ ...p, email: e.target.value }))} /></div>
          <div><label className="form-label">Téléphone</label><input className="form-input" placeholder="+225 07 00 00 00" value={f.tel} onChange={e => setF(p => ({ ...p, tel: e.target.value }))} /></div>
        </div>
      </div>
    </Modal>
  )
}

function RapportModal({ isOpen, onClose, showToast }) {
  const { store, updateStore, emitEvent } = useMeereo()
  const [f, setF] = useState({ type: 'Rapport hebdomadaire', projet: '', date: '', heure: '09:00', lieu: '', participants: '', ordre: '', decisions: '', alertes: '', prochaine: '' })
  const submit = () => {
    updateStore(prev => ({ ...prev, rapports: [...(prev.rapports || []), { id: 'rap_' + Date.now(), ...f, visibility: 'client_visible', createdAt: new Date().toISOString() }] }))
    emitEvent('document_uploaded', { name: f.type }, { notifMsg: `Rapport créé : ${f.type}` })
    showToast('Rapport créé')
    setF({ type: 'Rapport hebdomadaire', projet: '', date: '', heure: '09:00', lieu: '', participants: '', ordre: '', decisions: '', alertes: '', prochaine: '' })
    onClose()
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau rapport" footer={<><button className="btn btn-sm" onClick={onClose}>Annuler</button><button className="btn btn-primary btn-sm" onClick={submit}>Enregistrer</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-row">
          <div><label className="form-label">Type de rapport</label><select className="form-input" value={f.type} onChange={e => setF(p => ({ ...p, type: e.target.value }))}><option>Rapport hebdomadaire</option><option>Rapport de visite</option><option>Compte-rendu réunion</option><option>Rapport technique</option><option>Rapport mensuel</option><option>Rapport de chantier</option><option>PV de réception</option></select></div>
          <div><label className="form-label">Projet</label><select className="form-input" value={f.projet} onChange={e => setF(p => ({ ...p, projet: e.target.value }))}><option value="">Sélectionner</option>{(store.projects || []).map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}</select></div>
        </div>
        <div className="form-row">
          <div><label className="form-label">Date</label><input className="form-input" type="date" value={f.date} onChange={e => setF(p => ({ ...p, date: e.target.value }))} /></div>
          <div><label className="form-label">Heure</label><input className="form-input" type="time" value={f.heure} onChange={e => setF(p => ({ ...p, heure: e.target.value }))} /></div>
        </div>
        <div><label className="form-label">Lieu</label><input className="form-input" placeholder="Bureau de chantier, salle de réunion..." value={f.lieu} onChange={e => setF(p => ({ ...p, lieu: e.target.value }))} /></div>
        <div><label className="form-label">Participants</label><input className="form-input" placeholder="Noms séparés par des virgules" value={f.participants} onChange={e => setF(p => ({ ...p, participants: e.target.value }))} /></div>
        <div><label className="form-label">Ordre du jour</label><textarea className="form-input" rows="3" placeholder="1. Avancement&#10;2. Points techniques&#10;3. Planning" value={f.ordre} onChange={e => setF(p => ({ ...p, ordre: e.target.value }))} /></div>
        <div><label className="form-label">Décisions prises</label><textarea className="form-input" style={{ resize: 'vertical', minHeight: 40 }} rows="2" placeholder="Décisions et actions..." value={f.decisions} onChange={e => setF(p => ({ ...p, decisions: e.target.value }))} /></div>
        <div><label className="form-label">Points d'alerte</label><textarea className="form-input" style={{ resize: 'vertical', minHeight: 40 }} rows="2" placeholder="Retards, blocages, risques..." value={f.alertes} onChange={e => setF(p => ({ ...p, alertes: e.target.value }))} /></div>
        <div><label className="form-label">Prochaine réunion</label><input className="form-input" type="date" value={f.prochaine} onChange={e => setF(p => ({ ...p, prochaine: e.target.value }))} /></div>
      </div>
    </Modal>
  )
}

function CommandeModal({ isOpen, onClose, showToast }) {
  const { store, updateStore, emitEvent, requestPayment } = useMeereo()
  const [f, setF] = useState({ projet: '', article: '', fournisseur: '', montant: '' })
  const [submitted, setSubmitted] = useState(false)
  const submit = () => {
    setSubmitted(true)
    const amount = parseFloat(f.montant) || 0
    if (!f.projet || !f.article.trim() || amount <= 0) return
    updateStore(prev => ({ ...prev, commandes: [...(prev.commandes || []), { id: 'cmd_' + Date.now(), ...f, montant: amount, scope: 'shared_with_project', createdAt: new Date().toISOString() }] }))
    if (amount > 0) requestPayment({ projectId: f.projet, amount, label: 'Commande : ' + f.article })
    emitEvent('order_placed', { ref: f.article }, { notifMsg: `Commande créée : ${f.article}` })
    showToast('Commande créée')
    setF({ projet: '', article: '', fournisseur: '', montant: '' })
    setSubmitted(false)
    onClose()
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvelle commande" footer={<><button className="btn btn-sm" onClick={onClose}>Annuler</button><button className="btn btn-primary btn-sm" onClick={submit}>Enregistrer</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label className="form-label">Projet *</label>
          <select className="form-input" value={f.projet} onChange={e => setF(p => ({ ...p, projet: e.target.value }))}><option value="">Sélectionner</option>{(store.projects || []).map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}</select>
          <ErrMsg show={submitted && !f.projet} />
        </div>
        <div>
          <label className="form-label">Article / Fourniture *</label>
          <input className="form-input" placeholder="Description..." value={f.article} onChange={e => setF(p => ({ ...p, article: e.target.value }))} />
          <ErrMsg show={submitted && !f.article.trim()} />
        </div>
        <div className="form-row">
          <div><label className="form-label">Fournisseur</label><input className="form-input" placeholder="Nom..." value={f.fournisseur} onChange={e => setF(p => ({ ...p, fournisseur: e.target.value }))} /></div>
          <div>
            <label className="form-label">Montant (FCFA) *</label>
            <MoneyInput value={f.montant} onChange={v => setF(p => ({ ...p, montant: v }))} placeholder="500 000" />
            <ErrMsg show={submitted && !(parseFloat(f.montant) > 0)} />
          </div>
        </div>
      </div>
    </Modal>
  )
}

function FournisseurModal({ isOpen, onClose, showToast }) {
  const { updateStore } = useMeereo()
  const [f, setF] = useState({ raison: '', specialite: '', ville: '', tel: '', email: '' })
  const [submitted, setSubmitted] = useState(false)
  const submit = () => {
    setSubmitted(true)
    if (!f.raison.trim()) return
    updateStore(prev => ({ ...prev, fournisseurs: [...(prev.fournisseurs || []), { id: 'fou_' + Date.now(), nom: f.raison, specialite: f.specialite, ville: f.ville, tel: f.tel, email: f.email, createdAt: new Date().toISOString() }] }))
    showToast('Fournisseur ajouté')
    setF({ raison: '', specialite: '', ville: '', tel: '', email: '' })
    setSubmitted(false)
    onClose()
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau fournisseur" footer={<><button className="btn btn-sm" onClick={onClose}>Annuler</button><button className="btn btn-primary btn-sm" onClick={submit}>Enregistrer</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label className="form-label">Raison sociale *</label><input className="form-input" placeholder="Nom de l'entreprise..." value={f.raison} onChange={e => setF(p => ({ ...p, raison: e.target.value }))} /><ErrMsg show={submitted && !f.raison.trim()} /></div>
        <div><label className="form-label">Spécialité</label><input className="form-input" placeholder="Gros oeuvre, Électricité..." value={f.specialite} onChange={e => setF(p => ({ ...p, specialite: e.target.value }))} /></div>
        <div className="form-row">
          <div><label className="form-label">Ville</label><input className="form-input" placeholder="Abidjan" value={f.ville} onChange={e => setF(p => ({ ...p, ville: e.target.value }))} /></div>
          <div><label className="form-label">Téléphone</label><input className="form-input" placeholder="+225..." value={f.tel} onChange={e => setF(p => ({ ...p, tel: e.target.value }))} /></div>
        </div>
        <div><label className="form-label">Email</label><input className="form-input" type="email" placeholder="contact@entreprise.com" value={f.email} onChange={e => setF(p => ({ ...p, email: e.target.value }))} /></div>
      </div>
    </Modal>
  )
}

function MessageModal({ isOpen, onClose, showToast }) {
  const { store, updateStore, emitEvent } = useMeereo()
  const [f, setF] = useState({ dest: '', sujet: '', texte: '', projet: '' })
  const [submitted, setSubmitted] = useState(false)
  const submit = () => {
    setSubmitted(true)
    if (!f.dest.trim()) return
    updateStore(prev => ({ ...prev, messages: [...(prev.messages || []), { id: 'msg_' + Date.now(), ...f, createdAt: new Date().toISOString() }] }))
    emitEvent('message_sent', { to: f.dest }, { notifMsg: `Message envoyé à ${f.dest}` })
    showToast('Message envoyé')
    setF({ dest: '', sujet: '', texte: '', projet: '' })
    setSubmitted(false)
    onClose()
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouveau message" footer={<><button className="btn btn-sm" onClick={onClose}>Annuler</button><button className="btn btn-primary btn-sm" onClick={submit}>Envoyer</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div><label className="form-label">Destinataire *</label><input className="form-input" placeholder="Nom ou entreprise..." value={f.dest} onChange={e => setF(p => ({ ...p, dest: e.target.value }))} /><ErrMsg show={submitted && !f.dest.trim()} /></div>
        <div><label className="form-label">Sujet</label><input className="form-input" placeholder="Sujet du message..." value={f.sujet} onChange={e => setF(p => ({ ...p, sujet: e.target.value }))} /></div>
        <div><label className="form-label">Message</label><textarea className="form-input" style={{ resize: 'vertical', minHeight: 80 }} rows="3" placeholder="Votre message..." value={f.texte} onChange={e => setF(p => ({ ...p, texte: e.target.value }))} /></div>
        <div><label className="form-label">Projet lié</label><select className="form-input" value={f.projet} onChange={e => setF(p => ({ ...p, projet: e.target.value }))}><option value="">Aucun</option>{(store.projects || []).map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}</select></div>
      </div>
    </Modal>
  )
}

function NoteModal({ isOpen, onClose, showToast }) {
  const { store, updateStore, createDecision } = useMeereo()
  const [f, setF] = useState({ tache: '', statut: 'Termine', avancement: '', type: 'Information', texte: '' })
  const submit = () => {
    const noteId = 'note_' + Date.now()
    updateStore(prev => ({ ...prev, notes: [...(prev.notes || []), { id: noteId, ...f, createdAt: new Date().toISOString() }] }))
    if (f.type === 'Validation' && f.tache) {
      createDecision({ titre: f.tache, desc: f.texte, urgent: f.statut === 'Bloque', projectId: (store.projects || [])[0]?.id || null, sourceType: 'note_chantier', sourceId: noteId, decisionType: 'validation' })
    }
    showToast('Note enregistrée')
    setF({ tache: '', statut: 'Termine', avancement: '', type: 'Information', texte: '' })
    onClose()
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Note de chantier" footer={<><button className="btn btn-sm" onClick={onClose}>Annuler</button><button className="btn btn-primary btn-sm" onClick={submit}>Enregistrer</button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div className="form-row">
          <div><label className="form-label">Tâche concernée</label><input className="form-input" placeholder="Nom de la tâche..." value={f.tache} onChange={e => setF(p => ({ ...p, tache: e.target.value }))} /></div>
          <div><label className="form-label">Statut</label><select className="form-input" value={f.statut} onChange={e => setF(p => ({ ...p, statut: e.target.value }))}><option>Terminé</option><option>En cours</option><option>À faire</option><option>Bloqué</option></select></div>
        </div>
        <div><label className="form-label">Avancement (%)</label><input className="form-input" type="number" min="0" max="100" placeholder="0-100" value={f.avancement} onChange={e => setF(p => ({ ...p, avancement: e.target.value }))} /></div>
        <div>
          <label className="form-label">Type de note</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Validation', 'Alerte', 'Information', 'Blocage'].map(t => (
              <button key={t} className={`filter-pill${f.type === t ? ' active' : ''}`} onClick={() => setF(p => ({ ...p, type: t }))} style={f.type === t ? { background: 'var(--tx)', color: '#fff' } : undefined}>{t}</button>
            ))}
          </div>
        </div>
        <div><label className="form-label">Note / Rapport</label><textarea className="form-input" style={{ resize: 'vertical', minHeight: 80 }} rows="4" placeholder="Avancement constaté, points de vigilance..." value={f.texte} onChange={e => setF(p => ({ ...p, texte: e.target.value }))} /></div>
      </div>
    </Modal>
  )
}

// EventForm stays in CockpitApp for now (uses ref pattern)

// ─── Main export: renders all modals based on `modal` state ───

const MODAL_MAP = {
  newProjet: ProjetModal,
  newClient: ClientModal,
  newOffre: OffreModal,
  newMarche: MarcheModal,
  newInter: InterModal,
  newRapport: RapportModal,
  newCommande: CommandeModal,
  newFournisseur: FournisseurModal,
  newMessage: MessageModal,
  newNote: NoteModal,
}

export default function CockpitModals({ modal, closeModal, showToast }) {
  return (
    <>
      {Object.entries(MODAL_MAP).map(([key, Component]) => (
        <Component key={key} isOpen={modal === key} onClose={closeModal} showToast={showToast} />
      ))}
    </>
  )
}
