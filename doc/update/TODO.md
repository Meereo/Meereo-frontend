# MEEREO — Audit fonctionnel & Corrections prioritaires

Suivi des corrections et améliorations avant mise en production.

---

## 01. Refonte du systeme de notifications
- [x] Rendre les badges de notifications plus visibles — badges sidebar fond noir/texte blanc
- [x] Uniformiser le fonctionnement des notifications — tous les événements passent par emitEvent()
- [x] Verifier que chaque evenement genere correctement sa notification — ajouté emitEvent pour project_created, offer_accepted, offer_rejected, ao_published, project_completed
- [x] Verifier que les compteurs se mettent a jour automatiquement sans rechargement — WebSocket notification:new
- [x] Audit complet — ajouté 11 templates EVENT_MESSAGES manquants

## 02. Securite de la messagerie et confidentialite des utilisateurs
- [x] Un pro ne doit voir que les clients avec lesquels il a un projet — filtrage serveur dans GET /api/conversations
- [x] Un pro ne doit voir que les conversations auxquelles il participe — filtré par participantId
- [x] Un pro ne doit voir que les groupes auxquels il appartient — groupes visibles via participation
- [x] Un client peut consulter l'annuaire des pros et initier un contact — ProDirectory fonctionne
- [x] Les clients ne doivent jamais etre visibles publiquement — GET /api/pro/:slug vérifie type=pro, conversations filtrées
- [x] Toutes les permissions controlees cote serveur — POST /api/conversations vérifie projet partagé

## 03. Suppression de l'acces au client depuis la messagerie
- [x] Supprimer tout bouton "Voir le client" / "Profil client" — lien profil limité aux type 'pro'
- [x] Un pro ne doit jamais acceder a une fiche detaillee du client — email/tel client masqués dans Offers.jsx
- [x] Seules les infos liees au projet doivent etre accessibles — nom MOA et ville uniquement

## 04. Synchronisation des messages en temps reel
- [x] Affichage immediat des nouveaux messages — Socket.IO message:new + conversation:updated
- [x] Actualisation automatique des conversations — handleConvUpdated incrémente unread
- [x] Mise a jour instantanee de la liste des discussions — conversation:updated émis à tous
- [x] Synchronisation entre tous les appareils connectes — socket room user:${userId}
- [x] Aucune actualisation manuelle necessaire — ajouté émission socket dans POST REST fallback

## 05. Notifications de nouveaux messages
- [x] Notifications dans la barre laterale — badge messages rouge
- [x] Notifications dans la section Messagerie — unread count par conversation
- [x] Notifications dans le centre de notifications — notification:new via socket
- [x] Notifications directement sur la conversation concernee — unread incrémenté par conv
- [x] Compteur des messages non lus mis a jour instantanement — via WebSocket

## 06. Refonte du suivi des paiements
- [x] Chaque paiement genere une notification automatique — emitEvent pour payment_requested/approved/rejected
- [x] Historique detaille : montant, date, heure, beneficiaire — tableau transactions dans Budget.jsx avec date/heure, n° transaction, bénéficiaire, statut
- [x] Moyen de paiement, numero de transaction, statut — n° transaction (#ID), statut coloré (badge)
- [x] Justificatifs eventuels — système de proofs dans PaymentOrder (upload + validation)
- [x] Suivi en temps reel des operations financieres — demandes en attente + historique transactions

## 07. Amelioration du menu de navigation
- [x] Etat actif plus marque — barre verticale ::before sur .ni.active
- [x] Texte plus contraste pour la section active — font-weight 600 + sidebar-text-active
- [x] L'utilisateur identifie instantanement la section active — barre + fond + texte bold

## 08. Verification du module "Ajout des intervenants"
- [x] Creation des invitations — POST /api/project-members avec invitationStatus='pending'
- [x] Reception des invitations — notification temps réel via socket + GET /api/project-members/pending
- [x] Acceptation / refus — PATCH /api/project-members/:id/respond avec accept=true/false
- [x] Attribution correcte des roles — role passé à la création, stocké dans ProjectMember
- [x] Gestion des permissions — invitationStatus ajouté au schéma Prisma
- [x] Notifications — notification créée à l'invitation + à l'acceptation (client notifié)
- [x] Acces aux modules apres validation — accès projet conditionné par membership

## 09. Simplification du workflow apres validation d'un AO
- [x] Le contrat devient automatiquement actif — market statut='signed' automatique
- [x] La mission demarre immediatement — pas de confirmation pro
- [x] Le projet passe en statut "En cours" — phase SUIVI_CHANTIER, status active
- [x] Le planning est genere automatiquement — 5 tâches auto-créées
- [x] Les taches sont creees — assignées au supplier
- [x] Le suivi budgetaire est active — montant enregistré
- [x] Les notifications sont envoyees — emitEvent + conversation auto
- [x] Aucune validation supplementaire du pro demandee — DEJA CONFORME

## 10. Refonte de la Page Professionnelle
- [x] Les avis et notes doivent etre affiches d'office — section Avis clients dans Profile.jsx (API reviews)
- [x] "RAW DESIGN" ne doit apparaitre nulle part — remplacé par "Votre Entreprise" dans constants.js
- [x] Solution pour obliger le pro a telecharger ses documents admin — POST /api/pro/request-verification vérifie la présence de docs admin
- [x] Verification du numero RCCM — endpoint vérifie RCCM obligatoire avant soumission
- [x] Badge "Valide par MEEREO" (couleur verte) — admin PATCH /api/admin/verify/:userId + notification verte

## 11. Audit global des workflows et permissions
- [x] Permissions des clients — conversations filtrées par projet, documents par accès projet
- [x] Permissions des professionnels — ne voient que clients avec projets partagés
- [x] Permissions des maitres d'ouvrage — permission engine vérifie rôle CLIENT
- [x] Permissions des architectes — permission engine vérifie rôle ARCHITECTE
- [x] Permissions des administrateurs — requireAdmin middleware sur routes admin
- [x] Droits des intervenants — ProjectMember avec invitationStatus
- [x] Acces aux documents — ajouté vérification membership sur GET /:id/versions et POST /:id/new-version
- [x] Acces aux projets — GET /:id/timeline corrigé (vérification membership ajoutée)
- [x] Acces a la messagerie — conversations filtrées par projet pour les pros
- [x] Acces aux informations financieres — transactions filtrées par userId
- [x] Notifications — système complet avec socket + API
- [x] Changements d'etat des projets — emitEvent pour chaque changement de phase
- [x] Workflows entre les differents modules — acceptOffer chain complet (AO→offre→marché→tâches→conv)
- [x] Toutes les permissions controlees cote serveur — 4 routes manquantes corrigées

## 12. Audit global de la plateforme
- [x] Coherence des parcours utilisateurs — workflow AO→offre→marché→projet complet et automatisé
- [x] Fluidite de la navigation — sidebar active state amélioré, topbar search fixe
- [x] Synchronisation des donnees en temps reel — WebSocket complet (messages, notifications, conversations)
- [x] Performances generales — API URLs configurées par env, pas de requêtes inutiles
- [x] Securite des acces — permissions serveur renforcées sur 4 routes manquantes
- [x] Coherence entre les differents modules — événements unifiés via emitEvent + EVENT_MESSAGES
- [x] Respect des regles metier MEEREO — clients privés, pros vérifiables, workflow automatisé
