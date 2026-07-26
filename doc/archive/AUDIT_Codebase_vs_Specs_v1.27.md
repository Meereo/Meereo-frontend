# AUDIT — Codebase MEEREO vs Spécifications v1.27

**Date :** 23 juillet 2026  
**Méthode :** analyse automatisée de l'intégralité du code (web + server) par 6 agents spécialisés, croisée avec les 60+ exigences du référentiel v1.27.  
**Stack observée :** React (Vite) · Node.js / Express · Prisma / PostgreSQL · Socket.IO · JWT (httpOnly cookie)

---

## LÉGENDE

| Icône | Signification |
|-------|---------------|
| ✅ | Conforme — implémenté et aligné avec la spec |
| ⚠️ | Partiel — implémenté mais incomplet ou divergent |
| ❌ | Absent — non implémenté ou non conforme |
| 🐛 | Bug confirmé dans le code |

---

## SYNTHÈSE EXÉCUTIVE

| Domaine | Total | ✅ | ⚠️ | ❌ |
|---------|-------|----|----|-----|
| A. Inscription & identité | 6 | 3 | 2 | 1 |
| B. Annuaire & AO | 5 | 4 | 1 | 0 |
| C. Messagerie | 7 | 5 | 2 | 0 |
| D. Stabilité & navigation | 6 | 5 | 0 | 1 |
| E. Cycle de vie projets | 10 | 8 | 2 | 0 |
| F. Avis, notifs & compte | 3 | 2 | 1 | 0 |
| G. Qualité transverse | 3 | 1 | 2 | 0 |
| H. Suivi financier | 3 | 2 | 1 | 0 |
| I. Cycle AO & marchés | 3 | 3 | 0 | 0 |
| J. Marketplace & fournisseur | 5 | 2 | 2 | 1 |
| K. Fondations transverses | 6 | 3 | 1 | 2 |
| **TOTAL** | **57** | **38** | **14** | **5** |

---

# A. INSCRIPTION & IDENTITÉ DU PROFESSIONNEL

## `INS-01` — Vérification RCCM / N° contribuable ⚠️

| Critère | État | Détail |
|---------|------|--------|
| Blocage des valeurs d'exemple | ✅ | `RCCM_BLOCKLIST` + `isBlockedRccm()` — `server/src/routes/auth.js:25-49` |
| Unicité en base | ✅ | Vérifié dans `proProfile` ET `fournisseurProfile` — `auth.js:175-186` |
| Format validé (front) | ✅ | Regex + messages d'erreur — `web/src/pages/Onboarding.jsx:383-408` |
| Vérification IA des documents | ⚠️ | Comparaison RCCM déclaré vs RCCM du document (`pro.js:279-296`), mais **pas d'analyse IA du contenu du document** — simple matching de chaîne |
| Blocage en cas d'écart | ✅ | Si mismatch → statut `manual_review` + notification admin (`pro.js:298-304`) |

**Écart :** la spec demande une **IA qui analyse le document, extrait le RCCM et le compare**. Le code actuel vérifie juste si le numéro soumis manuellement correspond à celui de l'inscription — pas d'OCR/extraction automatique.

---

## `INS-02` — Gestion du logo ✅

| Critère | État | Détail |
|---------|------|--------|
| Logo unique actif | ✅ | Champ `activeLogoType` ("generated" ou "uploaded") — `schema.prisma:214` |
| Remplacement automatique | ✅ | Import → remplace généré, et inversement — piloté par `activeLogoType` |
| Coexistence technique | ⚠️ | Les deux logos (généré + uploadé) coexistent en base, mais un seul est affiché — acceptable |

**Fichiers :** `server/prisma/schema.prisma:209-214`, `server/src/routes/pro.js:122`, `web/src/pages/cockpit/Settings.jsx:80`

---

## `INS-03` — Page publique obligatoire ❌

| Critère | État | Détail |
|---------|------|--------|
| Popup obligatoire au 1er login | ❌ | **Non implémenté** — `pagePublished` existe (`schema.prisma:217`) mais aucun popup bloquant |
| Blocage tant que non créée | ❌ | L'utilisateur accède librement au cockpit sans page publique |

**Écart critique :** la spec exige un popup bloquant dès le premier chargement du tableau de bord. Le code n'a aucune garde conditionnelle sur `pagePublished`.

---

## `INS-04` — Badge « Vérifié par MEEREO » ⚠️

| Critère | État | Détail |
|---------|------|--------|
| Champ `verified` en base | ✅ | `User.verified Boolean @default(false)` — `schema.prisma:38` |
| Auto-activation après vérification RCCM | ✅ | `pro.js:286` → `verified: true` si RCCM matche |
| Affiché sur page publique | ✅ | `HeroSection.jsx:65,93` — texte "Professionnel verifie MEEREO" |
| Affiché dans annuaire | ✅ | `users.js:67` retourne `verified` dans la liste des pros |
| Couleur verte identique partout | ⚠️ | Non vérifié — le texte est hardcodé mais pas de badge vert visuel standardisé |
| Visible sur AO, résultats de recherche | ⚠️ | Retourné par l'API mais **affichage front non vérifié** sur toutes les interfaces |

---

## `INS-05` — URL publique ✅

| Critère | État | Détail |
|---------|------|--------|
| Génération automatique depuis le nom | ✅ | Normalisation + suffixe aléatoire 4 chars — `auth.js:119-127` |
| Unicité garantie | ✅ | Contrainte `@unique` en base + vérification API — `pro.js:235` |
| Modification possible | ✅ | `PUT /api/pro/slug` avec re-normalisation — `pro.js:214-249` |
| Conflit géré | ✅ | Retourne 409 si slug déjà pris |

---

## `INS-06` — Validation par étape de l'onboarding ⚠️

| Critère | État | Détail |
|---------|------|--------|
| Validation des champs obligatoires par étape | ✅ | Email, password, RCCM, NCC validés — `Onboarding.jsx:431-450` |
| Bouton désactivé si champs invalides | ✅ | Conditions de validation en place |
| Persistance du wizard au refresh | ✅ | `sessionStorage` — `Onboarding.jsx:313-368` |
| Filet de sécurité (dernière étape) | ⚠️ | **Pas de revalidation serveur structurée** — si un champ manque, pas de redirection automatique vers l'étape concernée |
| Audit des 3 parcours | ⚠️ | Validation front uniquement — contournable via outils navigateur (pas de garde serveur avec réponse champ+étape) |

---

# B. ANNUAIRE & APPELS D'OFFRES

## `ANN-01` — Recherche entreprises dans AO privés ✅

Recherche par nom, métier, localisation implémentée via `ProDirectory.jsx` avec pagination (PAGE_SIZE=20).  
**Fichier :** `web/src/components/shared/ProDirectory.jsx`

## `ANN-02` — Affichage entreprises dans AO privés ✅

Logo, nom, domaines affichés. Images en lazy loading.  
**Écart mineur :** les étoiles (avis) ne sont pas vérifiées comme étant reliées à `AVS-01`.

## `ANN-03` — Refonte Bourse des AO ✅

Board public implémenté. Notification temps réel via socket `ao:new`. Badge compteur dans `NotifBell.jsx`.

## `ANN-04` — Performances annuaire ✅

Lazy loading images, pagination, compression d'images (`compressImage.js` : 800px, 70% JPEG).  
**Manque :** pas de virtual scrolling pour les très grandes listes.

## `ANN-05` — Compatibilité multi-navigateurs ⚠️

Préfixes `-webkit-` présents (backdrop-filter, line-clamp, scrollbar). **Pas de fallbacks documentés pour Safari.** Pas de tests cross-browser automatisés.

---

# C. MESSAGERIE & COMMUNICATION

## `MSG-01` — Contact entreprise sans page publique ⚠️

| Critère | État | Détail |
|---------|------|--------|
| Bouton visible si page publiée | ✅ | Conditionnel sur `pagePublished` — `Profile.jsx:262-267` |
| Message toujours délivré (cas 1 & 2) | ✅ | Conversation créée + message persisté + notification |
| Invitation entreprise référencée (cas 3) | ❌ | **Non implémenté** — pas de mécanisme de rétention de message + invitation à l'inscription |

## `MSG-02` — Refonte messagerie ✅

| Critère | État | Détail |
|---------|------|--------|
| Temps réel | ✅ | Socket.IO — messages, typing, read, notifications |
| Pro ne voit que ses clients CRM | ⚠️ | Restriction pro→client si projet partagé (`conversations.js:134-157`), mais commentaire "removed project-based client filter" suggère un relâchement |
| Client ne voit pas les autres clients | ✅ | Conversations scopées par participant |

## `MSG-03` — Lu / non-lu ✅

| Critère | État | Détail |
|---------|------|--------|
| Marquage basé sur événement d'ouverture | ✅ | `markRead()` déclenché à l'ouverture de la conversation — `Messages.jsx:376-378` |
| `lastReadAt` persisté en base | ✅ | `ConversationParticipant.lastReadAt` — `socket.js:181-189` |
| Compteur non-lus correct | ✅ | Calculé server-side : messages WHERE `createdAt > lastReadAt` — `conversations.js:75-85` |

## `MSG-04` — Conversation unique par binôme ✅

| Critère | État | Détail |
|---------|------|--------|
| Unicité 1:1 | ✅ | `findFirst` avec vérification exacte des 2 participants — `conversations.js:160-178` |
| Race condition gérée | ✅ | Catch `P2002` (unique violation) → retry findFirst — `conversations.js:209-227` |
| Nommage contextuel par rôle | ⚠️ | **Non vérifié** — la spec demande un libellé différent côté pro vs client |

## `MSG-05` — API voix/vidéo ❌ (hors scope MVP)

Pas d'intégration d'appels audio/vidéo trouvée. Attendu comme développement futur.

## `MSG-06` — Synchronisation instantanée nouvelle conversation ✅

| Critère | État | Détail |
|---------|------|--------|
| Optimistic UI | ✅ | Message inséré immédiatement dans `messagesMap` — `Messages.jsx:562-575` |
| ACK serveur + réconciliation | ✅ | ID optimiste remplacé par ID réel — `Messages.jsx:585-615` |
| Revert si erreur | ✅ | Message retiré si envoi échoue — `Messages.jsx:586-591` |
| Conversation apparaît sans refresh | ✅ | Socket `conversation:updated` → re-fetch liste — `useMeereoStore.jsx:357-389` |

## `MSG-07` — Conversation multi-participants ✅

| Critère | État | Détail |
|---------|------|--------|
| Création de groupe | ✅ | Modal "Créer un groupe" — `Messages.jsx:1232-1272` |
| Ajout de participant | ✅ | Endpoint `addParticipant` — `conversations.js:391-440` |
| Retrait de participant | ✅ | Quit group (soft delete) — `conversations.js:442-456` |
| Messages système | ✅ | Messages automatiques à l'ajout/retrait — `Messages.jsx:1214,1249` |
| Historique masqué avant ajout (G4) | ⚠️ | **Non vérifié** — la spec demande que l'intervenant ne voie que les messages postérieurs à son ajout |

---

# D. STABILITÉ, SESSION & NAVIGATION

## `NAV-01` — Retour intempestif landing page ✅

`LandingGuard` redirige les utilisateurs connectés vers leur workspace. Pas de retour involontaire vers la landing.  
**Fichier :** `App.jsx:69-71`

## `NAV-02` — Déconnexions inattendues ✅

Session gérée par httpOnly cookie (30 jours) + Bearer fallback. `HydrationGate` attend la vérification `/auth/me` avant de rendre l'app. Pas de redirect flash.  
**Fichier :** `App.jsx:17-30`, `useMeereoStore.jsx:216-342`

## `NAV-03` — Conservation page au refresh ✅

`_cachedUser` en sessionStorage empêche le flash de login. Le routing React préserve la page active.  
**Fichier :** `useMeereoStore.jsx:114-158`

## `NAV-04` — Logo absent page pro ⚠️ (traité dans QAL-02)

Dépend de la résolution de `QAL-02` (source unique du logo).

## `NAV-05` — Lien Paramètres inopérant ✅

| Point d'entrée | État | Détail |
|----------------|------|--------|
| Barre latérale | ✅ | `Sidebar.jsx:57` — item "Paramètres" fonctionnel |
| Menu avatar | ✅ | `UserMenu.jsx:69-72` — `handleParametres` → `onNavigate('parametres')` |
| Carte EXPLORER | ❌ | **Non trouvée** dans le code — 2 points d'entrée sur 3 confirmés |

## `NAV-06` — Token manquant ✅

| Critère | État | Détail |
|---------|------|--------|
| Token sur tous les appels auth | ✅ | 177 endpoints utilisent `apiFetch(..., true)` — cookie + Bearer |
| Middleware auth complet | ✅ | Cookie → Bearer fallback → 401 — `middleware/auth.js:9-65` |
| Suppression de compte avec token | ✅ | `DELETE /auth/account` vérifie le mot de passe + token — `auth.js:605-657` |
| Message UX en cas d'expiration | ⚠️ | Le message "Token manquant" est encore technique — **pas de redirection reconnexion** |

---

# E. CYCLE DE VIE & SUIVI DES PROJETS

## `PRJ-01` — Création auto projet à validation marché ✅

Quand un marché est créé sans `projectId`, le système crée automatiquement un projet pour le professionnel.  
**Fichier :** `server/src/routes/markets.js:93-129`

## `PRJ-02` — Arrêt, clôture, archivage, suppression ✅

8 états avec transitions validées : `preparation → en_attente → active → suspendu → completed → cloture → archived → stopped`. Historique des transitions en JSON.  
**Fichier :** `server/src/routes/projects.js:18-28`

## `PRJ-03` — Synchronisation notes pro ↔ client ✅

Champ `notes` partagé dans le modèle `Project`, accessible par tous les participants. Sync temps réel via `project:updated`.  
**Écart :** pas de notes **typées** (Validation/Alerte/Information/Blocage) ni de notes internes vs partagées.

## `PRJ-04` — Synchronisation images ✅

Images via `Document` model avec versioning. Photos de projet synchronisées entre pro et client.

## `PRJ-05` — Gestion intervenants ✅

| Critère | État | Détail |
|---------|------|--------|
| Ajout de membres avec rôles | ✅ | `MEMBER`, `SUPPLIER`, `PRO_ADMIN` — `projectMembers.js:50-72` |
| Invitation par email | ✅ | Statut `pending → accepted → rejected` |
| 4 sources d'assignation | ⚠️ | Équipe + recherche plateforme + email implémentés. "Créer un profil" non vérifié |
| Accès intervenant = aucun (I3) | ⚠️ | **Non vérifié** — la matrice de droits devrait bloquer l'accès au cockpit projet pour un intervenant sous-traité |

## `PRJ-06` — Équipe (cycle de vie complet) ⚠️

| Critère | État | Détail |
|---------|------|--------|
| Référentiel `cockpitTeam` en base | ✅ | Stocké en JSON dans `ProProfile.cockpitTeam` |
| Deux portes d'écriture, une base (E1) | ⚠️ | **Problème** — Settings et PageBuilder écrivent dans des sources différentes (`onboardingData` vs `pageSections`). Pas de table unique |
| Membre marqué Public (E3) | ⚠️ | Non vérifié dans le code |
| Retrait différencié (E5) | ⚠️ | Non vérifié |

## `PRJ-07` — Suivi chantier ✅

| Critère | État | Détail |
|---------|------|--------|
| Phases de mission | ✅ | 5 missions template (Conception, Études, Fluides, Construction, Archi intérieur) |
| Tâches avec états | ✅ | `TODO → IN_PROGRESS → IN_VALIDATION → DONE + BLOCKED` |
| Validation par section | ✅ | `POST /milestones/:id/validate` — validation pro + client |
| Progression en % | ✅ | Calcul par mission → rollup projet |
| Bouton "Valider section" en en-tête | ⚠️ | **Placement non vérifié** — la spec demande le déplacement du bas vers l'en-tête |
| "Valider projet" en bas | ⚠️ | **Placement non vérifié** — la spec demande le déplacement du haut vers le bas |

## `PRJ-08` — Visualisation documentaire ✅

Documents avec versioning (`parentId`, `version`), filtrage par type/catégorie, pagination (max 200).  
**Manque :** pas de mode galerie/cartes/timeline interactif — affichage en liste uniquement.

## `PRJ-09` — Couleurs projets ✅

Palette de 19 couleurs implémentée. Sélection à la création du projet, persistée en base.  
**Fichier :** `web/src/domain/status.js`, `schema.prisma:533`

## `PRJ-10` — Cohérence données Client ↔ Pro ✅

Sync temps réel via Socket.IO (`project:updated`). Documents, notes, statuts partagés entre participants.

---

# F. AVIS, NOTIFICATIONS & DONNÉES DE COMPTE

## `AVS-01` — Avis et notation ⚠️

| Critère | État | Détail |
|---------|------|--------|
| Avis basés sur collaboration réelle | ✅ | Vérification projet partagé obligatoire — `reviews.js:33-39` |
| Note 1-5 + critères | ✅ | `note`, `qualite`, `delais`, `communication` |
| Une évaluation par mission | ✅ | Upsert `authorId_targetId_projectId` |
| Création manuelle bloquée sur page pro | ⚠️ | **Non vérifié** — la spec interdit l'option de créer manuellement des avis dans l'éditeur de page |
| Source unique centralisée | ⚠️ | Moyenne calculée **côté client** (front), pas côté serveur — risque de divergence |
| Évaluation croisée pro ↔ intervenant | ❌ | Seuls les clients peuvent noter les pros (`reviews.js:50`) |
| Déclenchement automatique à la clôture | ❌ | Pas de prompt automatique d'évaluation à la clôture d'une mission |

## `AVS-02` — Notifications ✅

| Critère | État | Détail |
|---------|------|--------|
| Temps réel Socket.IO | ✅ | `notification:new` émis par le serveur — rooms `user:{userId}` |
| Compteur persistant | ✅ | Badge `NotifBell.jsx` — affiche `9+` si > 9 |
| Historique | ✅ | Table `Notification` — lecture des 50 dernières |
| Marquer lu / tout lu | ✅ | `PATCH /notifications/:id/read` + `/read-all` |
| Événements couverts | ✅ | Offres, marchés, documents, paiements, tâches, décisions, missions |

## `AVS-03` — Suppression profil & réutilisation email ✅

| Critère | État | Détail |
|---------|------|--------|
| Hard delete en cascade | ✅ | `prisma.user.delete()` — `auth.js:649` |
| Email libéré après suppression | ✅ | Nouveau compte indépendant |
| Pas d'héritage de données | ✅ | Cascade supprime toutes les relations |
| Double friction (mot de passe + "SUPPRIMER") | ✅ | `DeleteAccountSection.jsx` |
| Notification acheteurs avant suppression fournisseur | ❌ | **Non implémenté** |
| Blocage si factures impayées | ❌ | **Non implémenté** — la spec exige le blocage si solde dû à MEEREO |

---

# G. QUALITÉ TRANSVERSE

## `QAL-01` — Performances ✅

| Critère | État | Détail |
|---------|------|--------|
| Lazy loading (React.lazy) | ✅ | Pages cockpit chargées dynamiquement — `Client.jsx` |
| Images lazy loading | ✅ | `loading="lazy"` sur avatars — `ProDirectory.jsx:16` |
| Compression images | ✅ | 800px / 70% JPEG — `compressImage.js` |
| Cache session | ✅ | `_cachedUser` en sessionStorage |
| Pagination API | ✅ | Documents (max 200), professionnels (page_size=20) |

## `QAL-02` — Source unique logo ⚠️

| Critère | État | Détail |
|---------|------|--------|
| Un seul champ source | ⚠️ | `activeLogoType` pilote l'affichage, mais **11 fichiers** lisent le logo de façons différentes |
| Propagation automatique | ⚠️ | Settings écrit dans `onboardingData`, PageBuilder écrit dans `pageSections` — **pas de source unique** |
| Placeholder unifié (absence de logo) | ⚠️ | **Non vérifié** — pas de composant partagé pour l'avatar de repli |

**Fichiers concernés :** `Settings.jsx`, `Profile.jsx`, `Sidebar.jsx`, `HeroSection.jsx`, `useMeereoStore.jsx`, `pro.js`, `users.js`, `auth.js` — chacun lit le logo indépendamment.

## `QAL-03` — Correction orthographique ⚠️

| Critère | État | Détail |
|---------|------|--------|
| Nommage "KAi" vs "KAI" | 🐛 | Incohérent — `KAI_ONBOARDING`, `KAI_QUOTA` en constantes ; "KAi" dans l'UI ; devrait être **KAi** partout |
| "verifie" sans accent | 🐛 | `HeroSection.jsx:65` — "Professionnel verifie MEEREO" au lieu de "vérifié" |
| Relecture systématique | ❌ | Pas de CI linguistique ni de relecture automatisée |

---

# H. SUIVI FINANCIER DE PROJET

## `FIN-01` — Suivi financier (Budget/Phases/Marchés/Paiements) ⚠️

| Critère | État | Détail |
|---------|------|--------|
| Budget global (plafond) | ✅ | Modèle `Budget` — `schema.prisma:805+` |
| Phases | ✅ | `ESQUISSE → ETUDES → CHANTIER → LIVRAISON` |
| Missions = Marchés validés (D4) | ✅ | Modèle `Market` avec statuts signed/ongoing/completed |
| Paiements déclarés par phase | ✅ | `PaymentOrder` avec rail Mobile Money — `schema.prisma:862` |
| Agrégation financière | ✅ | `GET /finance/reports` — budget, engagé, payé, restant, burn rate |
| Client passif (D6) | ✅ | Pro déclare, client consulte |
| **Menu "Missions" encore séparé** | 🐛 | `Sidebar.jsx:23` — "Missions" et "Marchés" sont encore **deux entrées distinctes** au lieu d'une seule |
| **Menu "Actifs" encore présent** | 🐛 | `Sidebar.jsx:23` — "Actifs" existe encore dans la sidebar alors que D2 l'a supprimé |
| Alerte dépassement budget (D7) | ✅ | `budgetAlert` dans le rapport financier |

## `FIN-02` — Paiements Mobile Money ✅

| Critère | État | Détail |
|---------|------|--------|
| Rails définis | ✅ | `virement`, `carte`, `wave`, `orange_money`, `mtn`, `mobile_money` — `schema.prisma:862` |
| Frontend recommandation | ✅ | `recommendRail()` — `web/src/domain/fintech.js` |
| Intégration gateway réelle | ❌ | Infrastructure prête mais **pas de gateway de paiement connectée** |

## `FIN-03` — Monétisation Marketplace ⚠️

| Critère | État | Détail |
|---------|------|--------|
| Quota 5 produits gratuits | ❌ | **Non implémenté** — aucune vérification de seuil |
| Tarifs KAi Pro par rôle | ⚠️ | Quota KAi Standard (25/mois) dans `fintech.js:92` mais **tarifs différenciés par rôle non vérifiés** |
| Tarifs configurables (back-office) | ❌ | **Non implémenté** — pas de paramétrage admin |
| Abonnement fournisseur | ❌ | **Non implémenté** |

---

# I. CYCLE APPEL D'OFFRES & MARCHÉS

## `AOF-01` — Cycle de vie AO → marché ✅

| Critère | État | Détail |
|---------|------|--------|
| Émetteurs Client + Pro (A1) | ✅ | Clients créent AO pour architectes, pros pour sous-traitance — `aos.js` |
| Public vs Privé (A2) | ✅ | `visibilityScope: 'public' | 'trade_only'` |
| Portée globale (A3) | ✅ | 1 AO = 1 entreprise générale |
| Acceptation = marché signé (A6) | ✅ | Offre acceptée → marché créé + projet auto-créé — `markets.js:93-129` |
| Fermeture auto (A8) | ✅ | AO fermé dès acceptation d'une offre |
| Notification temps réel | ✅ | Socket `ao:new` broadcast aux pros |

## `AOF-02` — Offres reçues & comparaison ✅

Vue comparative implémentée : `GET /offers/compare/:aoId` — profil fournisseur, docs, certifications.  
**Fichier :** `server/src/routes/offers.js:52-87`

## `AOF-03` — Réponse pro à un AO ✅

| Critère | État | Détail |
|---------|------|--------|
| Dépôt d'offre | ✅ | `POST /offers` avec montant, délai, technique, docs |
| Upsert (1 offre par pro par AO) | ✅ | `offers.js:118` |
| Modification/retrait avant acceptation (A9) | ✅ | Via PATCH/DELETE tant que statut != accepted |
| Dossier auto-préparé | ✅ | `GET /aos/:id/dossier` — `aos.js:119` |

---

# J. MARKETPLACE & ESPACE FOURNISSEUR

## `MKT-01` — Catalogue produits ⚠️

| Critère | État | Détail |
|---------|------|--------|
| CRUD produits | ✅ | Création, édition, suppression — `Supplier.jsx:402-506` |
| Champs conformes | ✅ | Nom, catégorie, prix, unité, description, image, stock |
| 12 catégories conformes à la spec | ✅ | `marketplace.js:5-18` |
| **Stock en base de données** | 🐛 | **CRITIQUE — le champ `stock` n'existe PAS dans le modèle Prisma `Product`** — stocké uniquement côté client, perdu au rechargement |
| Promotions/ventes flash | ✅ | Champs `flash`, `flashPrice`, `flashDuration` en base |
| **Blocs promo conditionnels** | 🐛 | Les blocs "Flash" et "Sponsorisé" s'affichent même avec 0 produit — `Catalogue.jsx:10-11` |
| Prix 0 = "sur devis" | ⚠️ | Non vérifié |

## `MKT-02` — Commande, paiement & livraison ✅

| Critère | État | Détail |
|---------|------|--------|
| Statuts de commande | ✅ | `pending → accepted → preparing → shipped → delivered → completed` |
| Steps 1-5 | ✅ | Commande confirmée → En préparation → Transport → En cours → Livrée |
| Mise à jour fournisseur | ✅ | `PATCH /orders/:id` — `orders.js:111-167` |
| Notification temps réel | ✅ | Socket WebSocket à chaque changement de statut |

## `MKT-03` — Espace fournisseur ✅

| Section | État | Détail |
|---------|------|--------|
| ACTIVITÉ (Accueil) | ✅ | Dashboard — `Supplier.jsx:321-326` |
| MARKETPLACE (Produits, Boutique, Commandes) | ✅ | `Supplier.jsx:327-335` |
| FINANCE (Paiements, Stats) | ✅ | `Supplier.jsx:336-341` |
| COMPTE (Paramètres) | ✅ | `Supplier.jsx:342-347` |

8 onglets de paramètres conformes à la spec.

## `MKT-04` — Produits sponsorisés ⚠️

| Critère | État | Détail |
|---------|------|--------|
| Flag `sponsored` en base | ✅ | `Product.sponsored` — `schema.prisma:318-320` |
| UI sponsoring | ✅ | Modal dans `Supplier.jsx:243-251,508-528` |
| Marquage "AD" | ⚠️ | **Non vérifié** côté Marketplace publique |
| Tracking impressions/performance | ❌ | Non implémenté |

## `MKT-05` — KAi surveillance stock ❌

**Non implémenté.** Aucune intégration KAi pour alertes stock, suggestions de vente flash, prédictions, ou analyse des meilleures ventes.

---

# K. FONDATIONS TRANSVERSES

## `SYS-01` — Passeport Numérique ✅ (RETIRÉ conformément à la spec)

Modèle `Passport` existe en base mais le module est retiré (v1.10). Conforme à la décision spec.

## `SYS-02` — Matrice de droits ✅

| Critère | État | Détail |
|---------|------|--------|
| Moteur centralisé serveur | ✅ | `server/src/engines/permissionEngine.js` — `BASE_PERMISSIONS` + `WORKFLOW_RESTRICTIONS` |
| Miroir côté client | ✅ | `web/src/domain/permissions.js` — `ACTION_PERMISSIONS` |
| 8+ rôles définis | ✅ | `PRO_ADMIN`, `PRO_MEMBER`, `CLIENT`, `ARCHITECTE`, `BET`, `ENTREPRISE`, `SUPPLIER`, `ADMIN` |
| Second niveau rôles internes | ⚠️ | Rôles internes (Admin/Chef de projet/Collaborateur/Lecteur) dans `cockpitTeam` mais **granularité fine non vérifiée** |

## `SYS-03` — Responsive mobile ✅

| Critère | État | Détail |
|---------|------|--------|
| Breakpoints CSS | ✅ | `@media (max-width: 768px)` + tablet 769-1024px |
| Hook mobile | ✅ | `useIsMobile.js` |
| Menu hamburger | ✅ | Topbar mobile avec sidebar overlay |
| App native | ❌ | Hors scope actuel (Phase 2 de SYS-03) |

## `SYS-04` — Multilingue FR + EN ❌

**Non implémenté.** Aucun framework i18n. Tous les textes sont hardcodés en français. Pas de fichiers de traduction, pas de sélecteur de langue.

**Écart critique :** la spec exige FR + EN **dès le lancement**.

## `SYS-05` — Gestion fichiers & documents ✅

| Critère | État | Détail |
|---------|------|--------|
| Upload multipart | ✅ | Multer — max 50 Mo — `documents.js:19,219` |
| Versioning | ✅ | `parentId` + `version` — `documents.js:138,166` |
| Catégorisation | ✅ | rccm, attestation_fiscale, etc. |
| Rattachement projet/mission | ✅ | `projectId`, `missionId` |
| Privé / partagé | ⚠️ | `isEntreprise` boolean — simpliste vs la granularité attendue (privé/interne vs partagé) |
| Formats autorisés | ⚠️ | Pas de validation stricte des formats côté serveur |

## `SYS-06` — Paramètres, page pro & aperçu public ⚠️

| Critère | État | Détail |
|---------|------|--------|
| 3 portes distinctes | ⚠️ | Paramètres et PageBuilder existent mais **chevauchement** — logo/slogan/bio éditables aux deux endroits |
| Libellés clarifiés | ⚠️ | "Paramètres" OK, mais "Voir ma page publique" vs "Modifier ma page pro" **non vérifié** |
| RCCM verrouillé après vérification | 🐛 | **Non implémenté** — champ RCCM librement modifiable même après `verified=true` — `Settings.jsx:259` |
| Sélecteur langue FR/EN dans Préférences | ❌ | Absent (lié à SYS-04 non implémenté) |
| 2FA et sessions actives dans Sécurité | ❌ | Seul le changement de mot de passe est présent |
| "Réinitialiser toutes les données" retiré | ✅ | **Non trouvé** — safe pour production |
| Abonnement KAi Pro | ✅ | Composant `KaiSubscription` présent dans l'onglet Abonnement |

---

# BUGS CRITIQUES À CORRIGER EN PRIORITÉ

| # | Code | Bug | Sévérité | Fichier |
|---|------|-----|----------|---------|
| 1 | MKT-01 | **Stock produit non persisté en base** — champ absent du schema Prisma | 🔴 CRITIQUE | `schema.prisma` (modèle Product) |
| 2 | INS-03 | **Page publique non obligatoire** — aucun popup bloquant au 1er login | 🔴 CRITIQUE | Aucun guard sur `pagePublished` |
| 3 | SYS-04 | **i18n non implémenté** — tout est en français hardcodé, spec exige FR+EN | 🔴 CRITIQUE | Codebase entière |
| 4 | FIN-01 | **Menu "Missions" et "Actifs" encore présents** — doivent être supprimés/fusionnés | 🟠 ÉLEVÉ | `Sidebar.jsx` |
| 5 | SYS-06 | **RCCM non verrouillé après vérification** — contournement possible du badge | 🟠 ÉLEVÉ | `Settings.jsx:259` |
| 6 | QAL-02 | **Logo sans source unique** — 11 fichiers lisent le logo indépendamment, Settings et PageBuilder écrivent dans des sources différentes | 🟠 ÉLEVÉ | Multiple |
| 7 | MKT-01 | **Blocs promo affichés à vide** — "Flash" et "Sponsorisé" visibles avec 0 produit | 🟡 MOYEN | `Catalogue.jsx:10-11` |
| 8 | QAL-03 | **"KAI" au lieu de "KAi"** — incohérence de nommage dans le code | 🟡 MOYEN | `fintech.js`, `KaiAssistant.jsx` |
| 9 | QAL-03 | **"verifie" sans accent** dans le badge | 🟡 MOYEN | `HeroSection.jsx:65` |
| 10 | FIN-03 | **Quota 5 produits gratuits non implémenté** | 🟡 MOYEN | Logique métier absente |

---

# FONCTIONNALITÉS NON IMPLÉMENTÉES (par priorité)

| # | Code | Fonctionnalité | Complexité |
|---|------|----------------|------------|
| 1 | SYS-04 | Multilingue FR + EN (i18n) | 🔴 Élevée |
| 2 | INS-03 | Popup obligatoire page publique | 🟢 Faible |
| 3 | MKT-05 | KAi surveillance stock & conseil commercial | 🟠 Moyenne |
| 4 | MSG-05 | Appels vocaux / vidéo intégrés | 🔴 Élevée |
| 5 | FIN-03 | Quota produits + tarifs configurables back-office | 🟠 Moyenne |
| 6 | AVS-01 | Évaluation croisée pro ↔ intervenant | 🟡 Faible |
| 7 | AVS-01 | Prompt automatique d'évaluation à la clôture | 🟡 Faible |
| 8 | MSG-01 | Invitation entreprise référencée (cas 3 — levier acquisition) | 🟠 Moyenne |
| 9 | SYS-06 | 2FA + gestion sessions actives | 🟠 Moyenne |
| 10 | AVS-03 | Blocage suppression si factures impayées | 🟡 Faible |
| 11 | AVS-03 | Notification acheteurs avant suppression fournisseur | 🟡 Faible |

---

# ARCHITECTURE — POINTS DE VIGILANCE

## 1. Dualité Settings / PageBuilder (QAL-02 / SYS-06)
**Problème racine :** `Settings.jsx` écrit dans `User.onboardingData` et `PageBuilder.jsx` écrit dans `ProProfile.pageSections`. Les deux contiennent logo, slogan, bio. Le serveur fait un merge (`pro.js:91-107`) avec priorité `onboardingData`, mais c'est fragile.  
**Solution spec :** une seule table, deux interfaces de lecture/écriture.

## 2. Calcul des avis côté client (AVS-01)
La moyenne des avis est calculée dans le frontend, pas par le serveur. Risque de divergence entre interfaces.  
**Solution spec :** calcul centralisé côté serveur, exposé via l'API.

## 3. Stock produit non persisté (MKT-01)
Le champ `stock` existe dans l'UI du fournisseur mais **pas dans le schema Prisma**. Toute donnée de stock est perdue au rechargement.  
**Impact :** bloque MKT-05 (KAi stock), le badge "Stock limité", les alertes de rupture, et les ventes flash de déstockage.

## 4. Fournisseur sans restriction de messagerie (MSG-02)
Le code restreint pro→client (projet partagé obligatoire) mais **le fournisseur n'a aucune restriction** — il peut potentiellement contacter n'importe qui.

---

# FICHIERS CLÉS DE RÉFÉRENCE

| Fichier | Rôle | Lignes |
|---------|------|--------|
| `server/prisma/schema.prisma` | Modèle de données complet | 1191 |
| `web/src/App.jsx` | Routing + guards d'authentification | ~80 |
| `web/src/hooks/useMeereoStore.jsx` | Store global + hydration session | 2600+ |
| `web/src/services/api/client.js` | Client HTTP — 177 endpoints | 37K |
| `web/src/pages/Onboarding.jsx` | Wizard inscription 3 profils | 152K |
| `web/src/pages/cockpit/Messages.jsx` | Interface messagerie complète | 1300+ |
| `web/src/components/layout/Sidebar.jsx` | Navigation latérale + menus | ~60 |
| `server/src/socket.js` | WebSocket temps réel | 201 |
| `server/src/middleware/auth.js` | Authentification JWT | 65 |
| `server/src/engines/permissionEngine.js` | Matrice de droits centralisée | ~100 |
| `web/src/domain/permissions.js` | Permissions côté client | ~200 |
| `web/src/domain/fintech.js` | Logique financière + KAi quota | ~120 |
