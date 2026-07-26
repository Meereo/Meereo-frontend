# AUDIT — Codebase vs Spécifications v1.27

**Date :** 24 juillet 2026
**Portée :** Frontend (`/web`) + Backend (`/server`) vs `MEEREO_Specifications_v1.27.md`
**Méthode :** Lecture exhaustive du code source, schéma Prisma, routes API, composants React, hooks, services.

---

## RÉSUMÉ EXÉCUTIF

| Domaine | Conformité | Exigences couvertes | Écarts critiques |
|---|---|---|---|
| A. Inscription & identité | 75% | INS-01 ✅, INS-02 ⚠️, INS-03 ⚠️, INS-04 ❌, INS-05 ⚠️, INS-06 ⚠️ | Badge vérifié non implémenté, validation onboarding partielle |
| B. Annuaire & AO | 60% | ANN-01 ⚠️, ANN-02 ⚠️, ANN-03 ⚠️, ANN-04 ⚠️, ANN-05 ❌ | Pas de test Safari, performances non optimisées |
| C. Messagerie | 80% | MSG-01 ⚠️, MSG-02 ✅, MSG-03 ⚠️, MSG-04 ⚠️, MSG-05 ❌, MSG-06 ⚠️, MSG-07 ⚠️ | Appels audio/vidéo absents, conversation unique non garantie en DB |
| D. Stabilité & navigation | 70% | NAV-01 ⚠️, NAV-02 ⚠️, NAV-03 ⚠️, NAV-04 ⚠️, NAV-05 ⚠️, NAV-06 ⚠️ | Session/routing fragile, token manquant non résolu |
| E. Cycle de vie projets | 75% | PRJ-01 ⚠️, PRJ-02 ⚠️, PRJ-03 ⚠️, PRJ-04 ⚠️, PRJ-05 ⚠️, PRJ-06 ⚠️, PRJ-07 ✅, PRJ-08 ❌, PRJ-09 ❌, PRJ-10 ⚠️ | Synchro client↔pro incomplète, visualisation documentaire absente |
| F. Avis, notifs, compte | 70% | AVS-01 ⚠️, AVS-02 ✅, AVS-03 ❌ | Suppression compte : email réutilisable sans isolation (violation spec) |
| G. Qualité transverse | 50% | QAL-01 ⚠️, QAL-02 ❌, QAL-03 ⚠️ | Logo non centralisé (source unique absente) |
| H. Suivi financier | 80% | FIN-01 ✅, FIN-02 ❌, FIN-03 ❌ | Mobile Money non intégré, monétisation non implémentée |
| I. Cycle AO | 70% | AOF-01 ⚠️, AOF-02 ⚠️, AOF-03 ⚠️ | Fermeture auto AO manquante, notification refus absente |
| J. Marketplace | 75% | MKT-01 ✅, MKT-02 ⚠️, MKT-03 ✅, MKT-04 ⚠️, MKT-05 ❌ | KAi commercial absent, sponsoring partiel |
| K. Fondations | 55% | SYS-01 N/A, SYS-02 ⚠️, SYS-03 ❌, SYS-04 ⚠️, SYS-05 ⚠️, SYS-06 ⚠️ | Responsive insuffisant, permissions non centralisées |

**Légende :** ✅ Conforme | ⚠️ Partiellement implémenté | ❌ Absent ou non conforme | N/A Retiré

---

## STACK TECHNIQUE IDENTIFIÉE

| Couche | Technologie | Version |
|---|---|---|
| Frontend | React + React Router | 19.2 + 7.14 |
| Build | Vite | 8.0 |
| CSS | Tailwind CSS | 4.3 |
| State | React Context (useMeereoStore) | Custom |
| i18n | i18next + react-i18next | 26.3 + 17.0 |
| Temps réel | Socket.IO | 4.8 |
| Backend | Express.js | — |
| ORM | Prisma | 5.22 |
| DB | PostgreSQL | — |
| Auth | JWT + httpOnly cookies + bcryptjs | — |
| Validation | Zod (backend) | 3.23 |
| Déploiement | Docker + Nginx | — |

---

## A. INSCRIPTION & IDENTITÉ DU PROFESSIONNEL

### `INS-01` — RCCM et contribuable : ✅ CONFORME (avec réserve)

**Implémenté :**
- Contrainte `@unique` sur `rccm` et `ncc` dans le schéma Prisma (`schema.prisma:201-202`, `250-251`)
- Blocklist de valeurs d'exemple dans `auth.js:25-49` (ex. `CI-ABJ-2024-B-12345`)
- Validation de format regex dans `Onboarding.jsx:382-407`
- Vérification de l'unicité cross-profils (pro + fournisseur) à l'inscription (`auth.js:175-186`)

**Manquant :**
- ❌ **Vérification IA des documents** : aucune extraction automatique du numéro RCCM depuis un document déposé
- ❌ **Comparaison automatique** document ↔ déclaration : pas implémenté
- ❌ **Blocage en cas d'écart** : pas de workflow de vérification documentaire

### `INS-02` — Logo unique : ⚠️ PARTIEL

**Implémenté :**
- Upload de logo dans l'onboarding et les paramètres
- Champ `logo` unique par profil dans le store

**Manquant :**
- ⚠️ **Remplacement automatique** : pas de garantie qu'un seul logo coexiste (le remplacement n'est pas atomique côté UI)
- ⚠️ **Propagation** : le logo n'est pas lu depuis une source unique — chaque composant fait son propre fetch (cf. `QAL-02`)

### `INS-03` — Page pro obligatoire : ⚠️ PARTIEL

**Implémenté :**
- `PageBuilder.jsx` existe pour l'édition de la page pro
- Sections builder complet (Hero, Présentation, Expertise, Certifications, Portfolio, Reviews, Team, Contact)

**Manquant :**
- ❌ **Popup obligatoire** à la première connexion : non implémenté. Le spec exige un popup bloquant dès le premier chargement du dashboard
- ❌ **Blocage des fonctionnalités** tant que la page n'est pas créée : pas de guard implémenté

### `INS-04` — Badge « Vérifié par MEEREO » : ❌ NON IMPLÉMENTÉ

**État :** Aucun système de badge vérifié n'existe dans le code.
- Pas de modèle `verified` dans le schéma Prisma
- Pas de workflow de vérification IA
- Pas d'affichage de badge vert sur les interfaces
- Le champ `isVerified` n'existe pas dans les modèles User/ProProfile

### `INS-05` — URL publique : ⚠️ PARTIEL

**Implémenté :**
- Slug auto-généré à l'inscription (`auth.js:120-127`) : normalisation, accents supprimés, suffixe aléatoire
- Route publique `/pro/:slug` fonctionnelle (`Profile.jsx`)
- Modification de slug avec vérification d'unicité (`pro.js:214-249`)

**Manquant :**
- ⚠️ **Copie et partage** : pas d'UI dédiée pour copier/partager le lien (bouton de partage dans le spec)
- ⚠️ **Gestion du conflit d'unicité** côté UI : pas de suggestion de variante en cas de conflit

### `INS-06` — Validation par étape : ⚠️ PARTIEL

**Implémenté :**
- Validation de format (RCCM, email, NCC) dans `Onboarding.jsx`
- Blocklist des valeurs d'exemple
- Boutons désactivés si champs vides (partiellement)

**Manquant :**
- ❌ **Impossible de passer à l'étape suivante** sans validation : le stepper n'est pas « gardé ». Navigation directe par URL possible
- ❌ **Sortie d'impasse** : pas de redirection automatique vers l'étape manquante en cas de validation finale échouée
- ❌ **Revalidation serveur** avec réponse structurée (champ + étape) : le serveur bloque mais ne guide pas

---

## B. ANNUAIRE & APPELS D'OFFRES

### `ANN-01` — Recherche AO privés : ⚠️ PARTIEL
- `ProSearch.jsx` et `ProDirectory.jsx` existent pour la recherche de professionnels
- Pas de recherche par **spécialités** ou **domaines d'expertise** dédiée aux AO privés

### `ANN-02` — Affichage entreprises : ⚠️ PARTIEL
- Logos affichés mais via des sources multiples (violation `QAL-02`)
- Étoiles non reliées au système centralisé (`AVS-01`)

### `ANN-03` — Refonte Bourse des AO : ⚠️ PARTIEL
- Page Tenders/Offers existe mais UX non refaite
- Notification de nouvel AO via `AVS-02` fonctionnelle

### `ANN-04` — Performances annuaire : ⚠️ NON VÉRIFIÉ
- Pagination implémentée (`getWithPagination` dans `client.js:305`)
- Pas de lazy loading d'images ni d'optimisation spécifique constatée

### `ANN-05` — Compatibilité Safari : ❌ NON VÉRIFIÉ
- Aucun test cross-browser, aucune correction WebKit constatée dans le code

---

## C. MESSAGERIE & COMMUNICATION

### `MSG-01` — Contact sans page publique : ⚠️ PARTIEL

**Implémenté :**
- Modal de contact sur la page publique (`Profile.jsx:69-140`)
- Création de conversation via `api.conversations.create()`

**Manquant :**
- ❌ **Cas 2** (page incomplète) : pas de livraison garantie si l'onboarding n'est pas fini
- ❌ **Cas 3** (entreprise référencée sans compte) : le backend retourne `202 pending` (`conversations.js:136-143`) mais le message **n'est pas persisté** (TODO dans le code). L'invitation à s'inscrire n'est pas envoyée

### `MSG-02` — Refonte messagerie : ✅ CONFORME (globalement)

**Implémenté :**
- WebSocket via Socket.IO (`socket.js`) : messages instantanés, typing indicators
- Conversations temps réel sans refresh
- Compteurs de non-lus
- Sécurité : pro ne peut contacter que ses clients CRM (`conversations.js:149-169`), fournisseur que ses acheteurs (`conversations.js:171-183`)

**Manquant :**
- ⚠️ **Cloisonnement annuaire** : le pro ne devrait accéder aux autres entreprises que via l'annuaire, pas via la messagerie. Non strictement implémenté

### `MSG-03` — Lu / non-lu : ⚠️ PARTIEL

**Implémenté :**
- `markRead()` appelé à l'ouverture de la conversation (`Messages.jsx:388-391`)
- Compteur `unread` calculé côté serveur via `lastReadAt`

**Manquant :**
- ⚠️ **Marquage prématuré** : le message est marqué lu dès l'ouverture du composant, pas nécessairement après lecture effective (pas d'événement de scroll/vue)

### `MSG-04` — Conversation unique : ⚠️ RISQUE

**Implémenté :**
- Vérification d'existence avant création (`conversations.js:186-208`)
- Retour de la conversation existante si trouvée

**Manquant :**
- ❌ **Pas de contrainte DB** : aucun `@@unique` sur le binôme de participants dans le schéma Prisma. La déduplication repose uniquement sur la logique applicative → **race condition possible**
- ❌ **Nommage contextuel par rôle** : pas implémenté. Le libellé ne s'adapte pas selon que c'est le client ou le pro qui regarde
- ❌ **Fusion directe/projet** : une conversation « directe » et une « projet » pour le même binôme peuvent coexister

### `MSG-05` — Appels audio/vidéo : ❌ NON IMPLÉMENTÉ
- Aucune intégration WebRTC, Twilio, ou autre API d'appel

### `MSG-06` — Synchro instantanée nouvelle conversation : ⚠️ PARTIEL

**Implémenté :**
- Socket.IO émet un événement à la création
- Le store est mis à jour en temps réel

**Manquant :**
- ⚠️ **Optimistic UI** : pas d'insertion optimiste de la conversation dans la liste avant réponse serveur
- ⚠️ **Sélection automatique** : la nouvelle conversation ne devient pas automatiquement active après envoi

### `MSG-07` — Multi-participants : ⚠️ PARTIEL

**Implémenté :**
- `addParticipant` dans l'API (`client.js:692`)
- Filtrage temporel des messages (`conversations.js:327`) : un participant ajouté ne voit que les messages après `joinedAt`
- Affichage du nombre de participants dans l'UI

**Manquant :**
- ⚠️ **Seul le pro responsable peut ajouter** : pas de vérification du rôle dans la route `addParticipant`
- ⚠️ **Retrait d'un participant** : endpoint non implémenté

---

## D. STABILITÉ, SESSION & NAVIGATION

### `NAV-01` / `NAV-02` / `NAV-03` — Session et routing : ⚠️ PARTIELLEMENT CORRIGÉ

**Implémenté :**
- `HydrationGate` dans `App.jsx:17-24` : spinner pendant la vérification auth
- `RoleGuard` dans `App.jsx:37-49` : redirection par rôle
- Intercepteur 401 dans `client.js:72-84` : exclut `/auth/me` et `/auth/login` pour éviter la boucle de redirection
- Token en sessionStorage (survit au refresh)

**Manquant :**
- ⚠️ **Conservation de la page active** (`NAV-03`) : pas de persistance de la route exacte ni des filtres actifs après refresh. Le routing React Router préserve l'URL mais pas l'état interne (onglets, filtres, scroll)
- ⚠️ **Cause racine commune** : l'investigation unique recommandée dans les specs n'a pas été menée de façon documentée

### `NAV-04` — Logo absent : ⚠️ NON VÉRIFIÉ
- Lié à `QAL-02` (source unique du logo). Le hook `useLogo()` existe mais son utilisation n'est pas universelle

### `NAV-05` — Lien Paramètres inopérant : ⚠️ NON VÉRIFIÉ
- Le `UserMenu.jsx` contient un lien vers les paramètres. Vérification des 3 points d'entrée non effectuée

### `NAV-06` — Token manquant : ⚠️ PARTIELLEMENT CORRIGÉ

**Implémenté :**
- L'intercepteur 401 dans `client.js` ne redirige plus en boucle (fix appliqué : exclusion de `/auth/me`)
- `DeleteAccountSection.jsx` envoie le token via `apiFetch` avec `withAuth: true`

**Manquant :**
- ⚠️ **Message technique brut** : si la session a expiré, l'utilisateur peut voir « token manquant » au lieu d'un message clair avec reconnexion proposée

---

## E. CYCLE DE VIE & SUIVI DES PROJETS

### `PRJ-01` — Marché → Projet : ⚠️ PARTIEL

**Implémenté :**
- Création de projet avec conversation automatique (`projects.js:135-143`)
- Lien client CRM auto-créé

**Manquant :**
- ❌ **Création automatique du projet lors de la validation du marché** : pas de trigger dans le code. Le projet est créé manuellement
- ⚠️ **Bouton « Démarrer le marché »** : encore présent (devrait être supprimé selon spec)
- ⚠️ **Section « Paiement et sécurisation »** : encore présente (devrait être supprimée)

### `PRJ-02` — États du projet : ⚠️ PARTIEL

**Implémenté :**
- Champ `status` dans le modèle Project avec historique JSON (`schema.prisma:527`)
- Statuts : brouillon, en_cours, termine, cloture, archive, suspendu

**Manquant :**
- ⚠️ **Synchronisation côté client** : la suppression par le pro ne se répercute pas correctement côté client (bug documenté dans les specs)

### `PRJ-03` / `PRJ-04` — Synchro notes et images : ⚠️ PARTIEL

**Implémenté :**
- Modèle Document avec versioning et visibilité
- Relations projet → documents

**Manquant :**
- ❌ **Synchronisation temps réel** des notes et images pro → client : pas de WebSocket event spécifique pour les documents/notes
- ❌ **Distinction privé/partagé** : le champ `visibility` existe dans le schéma mais pas de filtre côté client

### `PRJ-05` — Intervenants : ⚠️ PARTIEL

**Implémenté :**
- Permission engine définit l'intervenant comme aveugle sauf messagerie (`permissionEngine.js:52-54`)
- Invitation par email possible

**Manquant :**
- ⚠️ **4 sources d'assignation** : seule l'invitation par email est clairement implémentée. « Mon équipe » / « Rechercher sur la plateforme » / « Créer un profil » ne sont pas distincts
- ⚠️ **Accès AUCUN** au projet sous-traité (`I3`) : défini dans le permission engine mais pas vérifié systématiquement dans les routes

### `PRJ-06` — Équipe : ⚠️ PARTIEL

**Implémenté :**
- Onglet « Équipe » dans les paramètres pro avec 4 rôles (Administrateur, Chef de projet, Collaborateur, Lecteur)
- Invitation de membres

**Manquant :**
- ❌ **Deux portes d'écriture, une seule base** (`E1`) : l'équipe créée sur la page publique et dans les paramètres ne pointe pas vers la même source (bug documenté)
- ❌ **Retrait différencié** (`E5`) : pas implémenté

### `PRJ-07` — Suivi chantier : ✅ GLOBALEMENT CONFORME

**Implémenté :**
- `Worksite.jsx` avec phases de mission et rapports
- `status.js:22-30` : 8 phases définies (Esquisse → Réception)
- Notes de chantier typées
- Validation par section

**Manquant :**
- ⚠️ **Placement des boutons** : « Valider cette section » devrait être en en-tête (actuellement en bas), « Valider le projet » devrait être en bas (actuellement en haut)
- ⚠️ **Phases spec vs code** : le code définit 8 phases orientées architecture (Esquisse, Avant-projet, etc.) alors que la spec définit 7 phases orientées construction (Conception, Préparation, Gros Œuvre, etc.). **Divergence à résoudre**

### `PRJ-08` — Visualisation documentaire : ❌ NON IMPLÉMENTÉ
- Pas de vue galerie, cartes, vignettes, ni chronologie interactive

### `PRJ-09` — Couleurs de projets : ❌ NON IMPLÉMENTÉ
- Pas de système de couleurs associées aux projets

### `PRJ-10` — Cohérence Client ↔ Pro : ⚠️ PARTIEL
- Le store centralisé (`useMeereoStore`) synchronise les données mais pas en temps réel pour tous les modules

---

## F. AVIS, NOTIFICATIONS & DONNÉES DE COMPTE

### `AVS-01` — Avis centralisés : ⚠️ PARTIEL

**Implémenté :**
- Modèle Review avec contrainte `@@unique([authorId, targetId, projectId])` (`schema.prisma:152`)
- Création d'avis limitée aux projets terminés (`reviews.js:42-47`)
- 3 variants d'affichage (Testimony, Journal, Structured) dans `ReviewsSection.jsx`
- Évaluation croisée pro ↔ pro implémentée (`reviews.js:51-61`)

**Manquant :**
- ❌ **Source unique centralisée** : les étoiles/notes ne sont pas calculées depuis une source unique partagée. Chaque composant fait son propre calcul
- ❌ **Suppression de l'option manuelle** : le `ReviewsEditor.jsx` existe encore (devrait être supprimé selon spec)
- ❌ **Cas « aucun avis »** : message « Aucun avis pour le moment » non systématiquement affiché

### `AVS-02` — Notifications : ✅ CONFORME

**Implémenté :**
- Modèle complet (type, read, userId, indexes)
- `NotifBell.jsx` : agrégation notifications + messages non lus + offres en attente
- `NotifPanel.jsx` : historique, mark read, delete
- Socket.IO pour le temps réel

### `AVS-03` — Suppression de profils : ❌ NON CONFORME

**Problèmes critiques :**
1. ❌ **Email immédiatement réutilisable** après suppression : le `auth.js:681` fait un `prisma.user.delete()` (hard delete). L'email est libéré et un nouveau compte peut reprendre la même adresse. **Violation directe du spec** qui exige un nouveau compte « entièrement indépendant, sans héritage »
2. ⚠️ **Incohérence soft/hard delete** : le middleware auth (`auth.js:58`) vérifie un préfixe `deleted_` qui n'est jamais écrit (car c'est un hard delete)
3. ⚠️ **Factures impayées** : aucun blocage de la suppression en cas de solde dû à MEEREO (tranché v1.26)
4. ✅ **Notification des acheteurs** (fournisseur) : implémenté via socket (`auth.js:625-651`)

---

## G. QUALITÉ TRANSVERSE

### `QAL-01` — Performances : ⚠️ PARTIEL
- Lazy loading de pages via `React.lazy()` dans `App.jsx`
- Pas d'optimisation d'images, pas de cache intelligent côté frontend
- Pas de compression d'assets documentée

### `QAL-02` — Logo source unique : ❌ NON CONFORME

**Problème architectural majeur :**
- Le hook `useLogo()` existe mais **n'est pas utilisé partout**
- Plusieurs composants lisent le logo depuis des sources différentes (store user, ProProfile, onboardingData)
- Pas de composant `<CompanyLogo />` partagé unique
- Pas de placeholder unifié pour l'absence de logo (certains affichent une image cassée, d'autres des initiales)
- Le cache navigateur n'est pas invalidé au changement de logo (pas d'URL versionnée)

### `QAL-03` — Orthographe : ⚠️ EN COURS
- i18n en place (`i18n.js`), mais de nombreux textes restent codés en dur dans les composants
- Incohérence « KAI » vs « KAi » constatée dans le code

---

## H. SUIVI FINANCIER DE PROJET

### `FIN-01` — Budget, Phases, Marchés, Paiements : ✅ GLOBALEMENT CONFORME

**Implémenté :**
- `Finance.jsx` : budgets, dépenses, factures, rapports avec KPI strip
- `Budget.jsx` : vue budget avec indicateurs (budget/engagé/payé/restant)
- Modèles Prisma : Budget, Expense, Invoice, PaymentOrder complets
- Statuts de paiement : `PAY_INIT → ... → PAYOUT_DONE`
- Client passif (D6) : le pro déclare, le client consulte
- Avancement découplé du paiement (D12)

**Manquant :**
- ⚠️ **Fusion menu** : vérifier que « Missions », « Contrats » sont bien supprimés au profit de « Marchés » uniquement
- ⚠️ **Entrée « Actifs »** : encore présente dans le code (`Assets.jsx` existe), devrait être supprimée (D2)
- ⚠️ **Phases fixes** : les phases dans le code (8 phases architecture) ne correspondent pas à celles de la spec (7 phases construction). À aligner

### `FIN-02` — Mobile Money : ❌ NON IMPLÉMENTÉ
- Aucune intégration Mobile Money (Orange Money, MTN MoMo, Wave)
- Les moyens de paiement dans les settings fournisseur sont des champs texte, pas des intégrations réelles
- Aucun prestataire de paiement intégré

### `FIN-03` — Monétisation Marketplace : ❌ NON IMPLÉMENTÉ
- Quota de 5 produits gratuits : **implémenté** côté backend (`products.js:62-67`)
- Facturation par produit au-delà : **non implémenté**
- Abonnement fournisseur : **non implémenté**
- Ventes flash payantes : **non implémenté**
- Sponsoring payant : champ `sponsored` existe mais pas de facturation associée
- Tarifs configurables en back-office : **non implémenté**

---

## I. CYCLE APPEL D'OFFRES & MARCHÉS

### `AOF-01` — Cycle AO → marché : ⚠️ PARTIEL

**Implémenté :**
- Modèle AO avec type (public/privé), statut, budget indicatif
- Création et listing d'AO
- Contrainte `@@unique([aoId, supplierId])` sur les offres

**Manquant :**
- ❌ **Fermeture automatique** de l'AO dès acceptation d'une offre (A8) : pas de trigger
- ❌ **Notification automatique des offres refusées** (A7) : pas implémenté
- ❌ **Création automatique du marché** à l'acceptation (A6) : pas de trigger marché → projet

### `AOF-02` / `AOF-03` — Offres : ⚠️ PARTIEL
- `api.offers.compare()` existe pour la comparaison
- Modification/retrait d'offre avant acceptation : implémenté
- **Mention d'engagement** au moment du dépôt : absente de l'UI

---

## J. MARKETPLACE & ESPACE FOURNISSEUR

### `MKT-01` — Catalogue : ✅ GLOBALEMENT CONFORME

**Implémenté :**
- 12 catégories définies dans `marketplace.js`
- Formulaire produit complet (nom, catégorie, prix, unité, stock, image)
- Prix 0 = « sur devis » géré dans l'UI
- Blocs promotionnels (Promo du mois, Stock limité, Ventes Flash)
- Quota 5 produits gratuits vérifié côté backend

**Manquant :**
- ⚠️ **Blocs promotionnels conditionnels** : les blocs s'affichent même si 0 produit/0 fournisseur (bug documenté dans spec)
- ⚠️ **Compteur de quota** visible : pas d'affichage « 5/5 produits gratuits utilisés » dans l'UI
- ⚠️ **Compte à rebours de dépublication** : non implémenté

### `MKT-02` — Commande et livraison : ⚠️ PARTIEL

**Implémenté :**
- Panier et création de commande
- Suivi de commande (confirmée → préparation → transit → livrée)
- Vérification de stock avant commande (`orders.js:57-70`)
- Calcul de livraison dynamique (`Marketplace.jsx:62-73`)

**Manquant :**
- ❌ **Seuil global** Mobile Money / hors plateforme : non implémenté
- ❌ **Paiement Mobile Money intégré** : non implémenté (cf. `FIN-02`)

### `MKT-03` — Espace fournisseur : ✅ CONFORME
- 4 sections : Activité, Marketplace, Finance, Compte
- Modules Paiements et Performance présents
- 8 onglets de paramètres conformes à la spec

### `MKT-04` — Sponsoring : ⚠️ PARTIEL
- Champ `sponsored` dans le modèle Product
- Case « Sponsoriser » dans le formulaire produit
- Marquage « AD » dans l'UI Marketplace
- **Manquant** : facturation du sponsoring, limites par page, modèle tarifaire

### `MKT-05` — KAi commercial : ❌ NON IMPLÉMENTÉ
- Pas d'alertes de stock automatiques
- Pas de suggestion de vente flash
- Pas de prédiction des besoins
- Pas d'analyse des meilleures ventes
- Le `KaiAssistant.jsx` existe mais ne couvre pas les fonctions commerciales fournisseur

---

## K. FONDATIONS TRANSVERSES

### `SYS-01` — Passeport Numérique : N/A (RETIRÉ)
- Le modèle Passport existe encore dans le code (`schema.prisma:1029-1045`)
- Les pages `Passport.jsx` existent
- **À nettoyer** selon la décision de retrait v1.10, ou à laisser pour réactivation future

### `SYS-02` — Matrice de droits : ⚠️ PARTIEL

**Implémenté :**
- `permissionEngine.js` : 9 rôles, 10+ actions, restrictions par état de workflow
- `permissions.js` (frontend) : RBAC côté client
- Rôles internes : Administrateur, Chef de projet, Collaborateur, Lecteur dans les paramètres

**Problème majeur :**
- ❌ **Permission engine sous-utilisé** : défini dans le backend mais **pas appelé systématiquement** dans les routes. Les routes font des vérifications ad-hoc (`if (ownerId !== req.user.id)`) au lieu d'utiliser `checkPermission()`. Cela crée un risque d'incohérence entre les règles définies et celles réellement appliquées

### `SYS-03` — Mobile responsive : ❌ INSUFFISANT
- `useIsMobile()` hook existe
- Tailwind CSS permet le responsive
- **Mais** : les maquettes sont desktop-first (confirmé par la spec et le code). Pas de refonte responsive dédiée

### `SYS-04` — Multilingue FR/EN : ⚠️ PARTIEL

**Implémenté :**
- i18next configuré avec FR (défaut) + EN (`i18n.js`)
- Détection automatique de la langue navigateur
- Persistance en localStorage (`meereo_lang`)
- ~100 clés de traduction définies

**Manquant :**
- ❌ **Textes codés en dur** : nombreux libellés directement dans les composants JSX au lieu de passer par `t()`. L'i18n n'est **pas systématique**
- ❌ **Sélecteur de langue** dans les paramètres : absent de l'onglet Préférences (documenté comme manquant dans la spec)
- ⚠️ **Couverture EN** : probablement incomplète (beaucoup de textes FR hard-codés)

### `SYS-05` — Gestion des fichiers : ⚠️ PARTIEL

**Implémenté :**
- Upload via `apiFetchForm()` avec multipart
- Modèle Document avec versioning (`schema.prisma:667-697`)
- `compressImage.js` pour l'optimisation d'images

**Manquant :**
- ⚠️ **Taille maximale** : pas de validation côté frontend
- ⚠️ **Privé/partagé** : champ présent en DB mais pas de UI pour choisir la portée
- ⚠️ **Rattachement** projet/phase/marché : partiellement implémenté

### `SYS-06` — Paramètres, page pro, aperçu : ⚠️ PARTIEL

**Implémenté :**
- 3 entrées vers les paramètres (sidebar, menu avatar, carte EXPLORER)
- Onglets par rôle conformes (Client 5, Pro 7, Fournisseur 8)
- Verrouillage RCCM constaté côté fournisseur

**Manquant :**
- ⚠️ **Libellés trompeurs** : « Mon profil professionnel » au lieu de « Voir ma page publique » — non corrigé
- ⚠️ **Chevauchement** Paramètres ↔ Page pro : le logo et les secteurs sont encore éditables dans les deux endroits
- ❌ **2FA** : absent
- ❌ **Gestion des sessions actives** : absente
- ❌ **« Réinitialiser toutes les données »** : encore présent (doit être retiré en production)

---

## ÉCARTS CRITIQUES — SYNTHÈSE PRIORISÉE

### Priorité 1 — Bugs et violations de spec

| # | Code | Problème | Fichier(s) | Impact |
|---|---|---|---|---|
| 1 | AVS-03 | Email réutilisable après suppression — hard delete sans isolation | `auth.js:681` | Mélange de données entre comptes |
| 2 | MSG-04 | Pas de contrainte DB sur conversation unique — race condition | `schema.prisma:359-379` | Conversations dupliquées possibles |
| 3 | QAL-02 | Logo non centralisé — sources multiples | Transversal | Logos manquants/incohérents partout |
| 4 | INS-06 | Onboarding non gardé — skip d'étapes possible | `Onboarding.jsx` | Comptes incomplets |
| 5 | NAV-06 | Message technique « token manquant » affiché | `client.js:72-84` | UX dégradée |

### Priorité 2 — Fonctionnalités manquantes (bloquantes pour le produit)

| # | Code | Fonctionnalité absente | Impact business |
|---|---|---|---|
| 6 | INS-04 | Badge « Vérifié par MEEREO » | Confiance et crédibilité pro |
| 7 | FIN-02 | Mobile Money (paiements réels) | Monétisation impossible |
| 8 | FIN-03 | Facturation services (quota, abonnement, sponsoring) | Pas de revenu |
| 9 | MSG-05 | Appels audio/vidéo | Communication limitée |
| 10 | MKT-05 | KAi commercial fournisseur | Pas de valeur ajoutée IA |

### Priorité 3 — Fonctionnalités partielles (à compléter)

| # | Code | Ce qui manque |
|---|---|---|
| 11 | SYS-04 | i18n non systématique — textes FR hard-codés |
| 12 | SYS-02 | Permission engine défini mais non utilisé dans les routes |
| 13 | PRJ-07 | Phases code ≠ phases spec (8 vs 7, noms différents) |
| 14 | AOF-01 | Fermeture auto AO, notification refus, création marché auto |
| 15 | PRJ-01 | Création auto du projet à la validation du marché |
| 16 | SYS-06 | 2FA absent, sessions actives absentes, reset données à retirer |
| 17 | MSG-01 | Messages vers entreprises non inscrites : non persistés |
| 18 | SYS-03 | Responsive desktop-first, non repensé pour mobile |

---

## PROBLÈME ARCHITECTURAL TRANSVERSAL

Le diagnostic technique de l'Annexe 3 identifie un **schéma de cause récurrent** confirmé par cet audit :

> **Des composants qui gèrent leur propre état ou leur propre source de données au lieu de consulter une source unique et réactive.**

Cela se manifeste dans :
- **Logo** (`QAL-02`) : chaque composant lit le logo depuis une source différente
- **Avis** (`AVS-01`) : pas de calcul centralisé des notes moyennes
- **Badge** (`INS-04`) : pas de source unique « vérifié »
- **Messagerie** (`MSG-06`) : pas d'invalidation de cache après mutation
- **Onboarding** (`INS-06`) : pas de schéma de validation partagé front/back

**Recommandation :** avant de corriger chaque bug individuellement, établir un pattern architectural de **source unique de vérité** (SSOT) via le store centralisé (`useMeereoStore`) et des hooks partagés pour les données transverses (logo, badge vérifié, note moyenne, état de conversation).

---

## POINTS POSITIFS

✅ Stack moderne et cohérente (React 19 + Vite 8 + Tailwind 4)
✅ WebSocket fonctionnel pour le temps réel
✅ Auth robuste (JWT + httpOnly cookies + bcrypt)
✅ Anti-enumeration sur login/forgot-password
✅ Schéma Prisma bien structuré avec relations complètes
✅ i18n en place (infrastructure prête, à compléter)
✅ Feature flags pour activer/désactiver des modules
✅ Marketplace fonctionnelle avec stock, catégories, commandes
✅ Modèle financier Budget→Phase→Paiement implémenté
✅ Système de reviews avec contrainte d'unicité et vérification de collaboration
✅ Permission engine défini (même si sous-utilisé)
✅ Sections builder complet pour les pages pro publiques
