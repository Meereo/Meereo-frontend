# AUDIT COMPLET — Codebase MEEREO vs Spécifications v1.27

**Date :** 23 juillet 2026  
**Méthode :** 3 passes d'audit (12 agents spécialisés, 100+ vérifications ciblées)  
**Périmètre :** chaque exigence et sous-règle du référentiel v1.27 (1821 lignes, 60+ exigences)  
**Stack :** React (Vite) · Node.js / Express · Prisma / PostgreSQL · Socket.IO · JWT

---

## SYNTHÈSE GLOBALE

| Catégorie | Nb |
|-----------|-----|
| 🔴 Critiques (bloquants ou sécurité) | 9 |
| 🟠 Élevés (divergence significative) | 16 |
| 🟡 Moyens (manques mineurs, raffinements) | 13 |
| ✅ Conformes | 42 |
| **TOTAL points vérifiés** | **80** |

---

# A. INSCRIPTION & IDENTITÉ DU PROFESSIONNEL

## `INS-01` — Vérification RCCM / N° contribuable

| Sous-règle | État | Détail |
|------------|------|--------|
| Valeurs d'exemple bloquées (RCCM) | ✅ | `RCCM_BLOCKLIST` + `isBlockedRccm()` — `auth.js:25-49` |
| Valeurs d'exemple bloquées (NCC) | ✅ | `NCC_BLOCKLIST` + `isBlockedNcc()` — `auth.js:29-48` |
| Unicité RCCM en base | ✅ | Contrôle croisé proProfile + fournisseurProfile — `auth.js:175-186` |
| Unicité NCC en base | ✅ | Contrôle croisé proProfile + fournisseurProfile — `auth.js:182-232` |
| Format validé (front) | ✅ | Regex + messages d'erreur — `Onboarding.jsx:383-408` |
| IA analyse le document RCCM déposé | ⚠️ | Comparaison string simple du numéro RCCM (`pro.js:279-296`). **Pas d'OCR/extraction IA.** Acceptable MVP. |
| Blocage en cas d'écart | ✅ | Mismatch → `manual_review` + notification admin — `pro.js:298-304` |

## `INS-02` — Gestion du logo ✅

| Sous-règle | État | Détail |
|------------|------|--------|
| Un seul logo actif | ✅ | `activeLogoType` ("generated" ou "uploaded") — `schema.prisma:214` |
| Remplacement automatique | ✅ | Import → remplace généré, piloté par `activeLogoType` |

## `INS-03` — Page publique obligatoire ✅

| Sous-règle | État | Détail |
|------------|------|--------|
| Popup au 1er chargement | ✅ | `Cockpit.jsx:172-189` — vérifie `pagePublished` via API |
| Popup bloquant (pas de "fermer") | ✅ | Overlay plein écran sans bouton fermer — `Cockpit.jsx:218-252` |
| Bug "popup qu'après refresh" | ✅ | Corrigé — l'API est appelée systématiquement à chaque mount |

## `INS-04` — Badge « Vérifié par MEEREO »

| Sous-règle | État | Détail |
|------------|------|--------|
| Champ `verified` en base | ✅ | `User.verified` — `schema.prisma:38` |
| Auto-activation après vérification RCCM | ✅ | `pro.js:286` |
| Affiché sur page publique | ✅ | `HeroSection.jsx:65,93,165` |
| Affiché dans annuaire | ✅ | `users.js:67` retourne `verified` |
| Badge **vert** identique partout | 🟡 | `HeroSection.jsx` utilise `border-pp-ink` (pas vert explicite). `ProDirectory.jsx` utilise `rgba(52,199,89)` (vert). **Inconsistant.** |
| Visible sur AO, résultats de recherche | ⚠️ | API retourne `verified` mais affichage front non vérifié sur toutes les vues |

## `INS-05` — URL publique ✅

| Sous-règle | État | Détail |
|------------|------|--------|
| Génération auto depuis le nom | ✅ | Normalisation + suffixe 4 chars — `auth.js:119-127` |
| Unicité garantie | ✅ | `@unique` + vérification API — `pro.js:235` |
| Copie / partage facile | ✅ | Bouton "Partager" + clipboard — `Profile.jsx:244-247` |
| Modification possible | ✅ | `PUT /api/pro/slug` — `pro.js:214-249` |

## `INS-06` — Validation par étape onboarding

| Sous-règle | État | Détail |
|------------|------|--------|
| Champs obligatoires validés par étape | ✅ | Email, password, RCCM, NCC — `Onboarding.jsx:431-450` |
| Bouton désactivé si invalide | ✅ | Conditions de validation en place |
| Persistance wizard au refresh | ✅ | sessionStorage — `Onboarding.jsx:313-368` |
| Filet de sécurité (redirection si champ manque) | ⚠️ | Pas de redirection auto vers l'étape concernée à la dernière étape |
| Revalidation serveur structurée | ✅ | Zod schemas → HTTP 422 avec `{ field, message }` — `errorHandler.js:7-13` |

---

# B. ANNUAIRE & APPELS D'OFFRES

## `ANN-01` — Recherche dans AO privés ✅
Recherche par nom, métier, localisation. Pagination PAGE_SIZE=20. — `ProDirectory.jsx`

## `ANN-02` — Affichage entreprises ✅
Logo, nom, domaines affichés. Lazy loading images.

## `ANN-03` — Bourse des AO ✅
Board public. Socket `ao:new` broadcast. Badge compteur 48h dans sidebar — `useMergedData.jsx:189`

## `ANN-04` — Performances annuaire ✅
Lazy loading, pagination, compression images (800px, 70% JPEG). Manque : virtual scrolling.

## `ANN-05` — Multi-navigateurs ⚠️
Préfixes `-webkit-` présents. Pas de fallbacks Safari documentés. Pas de tests cross-browser.

---

# C. MESSAGERIE & COMMUNICATION

## `MSG-01` — Contact entreprise sans page publique

| Sous-règle | État | Détail |
|------------|------|--------|
| Cas 1 : entreprise inscrite, page complète | ✅ | Contact normal, message livré |
| Cas 2 : inscrite, page incomplète | ✅ | Message livré quand même |
| Cas 3 : entreprise seulement référencée → invitation | ❌ | **Non implémenté** — pas de rétention de message + invitation |

## `MSG-02` — Refonte messagerie

| Sous-règle | État | Détail |
|------------|------|--------|
| Temps réel Socket.IO | ✅ | Messages, typing, read, notifications |
| Pro ne voit que clients via CRM/projets | ✅ | Restriction pro→client si projet partagé — `conversations.js:134-157` |
| Client ne voit pas les autres clients | ✅ | Conversations scopées par participant |
| **Fournisseur restreint** | 🟠 | **Aucune restriction** — un fournisseur peut contacter n'importe qui |
| Logos dans les conversations | ⚠️ | Non vérifié — dépend de QAL-02 |

## `MSG-03` — Lu / non-lu ✅

| Sous-règle | État | Détail |
|------------|------|--------|
| Marquage basé sur événement d'ouverture | ✅ | `markRead()` à l'ouverture — `Messages.jsx:376-378` |
| `lastReadAt` persisté | ✅ | `ConversationParticipant.lastReadAt` — `socket.js:181-189` |
| Compteur non-lus correct | ✅ | Server-side : `createdAt > lastReadAt` — `conversations.js:75-85` |

## `MSG-04` — Conversation unique par binôme

| Sous-règle | État | Détail |
|------------|------|--------|
| Unicité 1:1 | ✅ | `findFirst` avec vérification 2 participants — `conversations.js:160-178` |
| Race condition gérée | ✅ | Catch `P2002` → retry — `conversations.js:209-227` |
| Bug doublon direct/projet | ✅ | Corrigé — une seule conversation par paire |
| **Nommage contextuel par rôle** | 🟠 | **Non implémenté** — affiche `firstOther?.name` pour tous. La spec exige : pro → nom projet seul ; client → projet + entreprise. `Messages.jsx:256-258` |

## `MSG-05` — Appels vocaux/vidéo ❌
Non implémenté. Hors scope MVP.

## `MSG-06` — Sync instantanée nouvelle conversation ✅

| Sous-règle | État | Détail |
|------------|------|--------|
| Optimistic UI | ✅ | `Messages.jsx:562-575` |
| ACK + réconciliation | ✅ | `Messages.jsx:585-615` |
| Revert si erreur | ✅ | `Messages.jsx:586-591` |
| Conversation apparaît sans refresh | ✅ | Socket `conversation:updated` — `useMeereoStore.jsx:357-389` |

## `MSG-07` — Multi-participants

| Sous-règle | État | Détail |
|------------|------|--------|
| Création de groupe | ✅ | `Messages.jsx:1232-1272` |
| Ajout/retrait participant | ✅ | `conversations.js:391-456` |
| G3 — seul le pro responsable ajoute | ⚠️ | Non vérifié côté serveur |
| **G4 — historique masqué avant ajout** | 🟠 | **Non implémenté** — la requête de messages ne filtre PAS par `joinedAt`. `conversations.js:299-309` |

---

# D. STABILITÉ, SESSION & NAVIGATION

## `NAV-01` — Retour intempestif landing ✅
`LandingGuard` redirige les connectés. — `App.jsx:69-71`

## `NAV-02` — Déconnexions inattendues ✅
httpOnly cookie 30j + Bearer fallback. HydrationGate. — `App.jsx:17-30`

## `NAV-03` — Conservation page au refresh ✅
`_cachedUser` en sessionStorage. — `useMeereoStore.jsx:114-158`

## `NAV-04` — Logo absent page pro ⚠️
Dépend de QAL-02 (source unique).

## `NAV-05` — Lien Paramètres

| Point d'entrée | État | Détail |
|----------------|------|--------|
| Barre latérale | ✅ | `Sidebar.jsx:57` |
| Menu avatar | ✅ | `UserMenu.jsx:69-72` |
| Carte EXPLORER (fournisseur) | ✅ | `supplier/Dashboard.jsx:54` — "Paramètres · Configurer votre espace" |
| Carte EXPLORER (pro cockpit) | ❌ | **Non trouvée** dans le Dashboard pro |

## `NAV-06` — Token manquant

| Sous-règle | État | Détail |
|------------|------|--------|
| Token sur tous les appels auth | ✅ | 177 endpoints — cookie + Bearer |
| Middleware auth complet | ✅ | `middleware/auth.js:9-65` |
| **Message UX en cas d'expiration** | 🔴 | `auth.js:22` → `'Non authentifié — token manquant'` — **message technique brut** remonté à l'utilisateur. La spec interdit ça. |
| Redirection reconnexion | ❌ | Pas d'intercepteur global 401 côté frontend |

---

# E. CYCLE DE VIE & SUIVI DES PROJETS

## `PRJ-01` — Création auto projet ✅
Marché sans `projectId` → auto-création projet. — `markets.js:93-129`

| Sous-règle | État | Détail |
|------------|------|--------|
| Bouton "Démarrer le marché" supprimé | ✅ | `Contracts.jsx:364` — commentaire PRJ-01 |
| Section "Paiement et sécurisation" supprimée | ✅ | `Contracts.jsx:307-317` — bloc vide + commentaire |

## `PRJ-02` — Arrêt, clôture, archivage

| Sous-règle | État | Détail |
|------------|------|--------|
| 8 états avec transitions | ✅ | `projects.js:18-28` |
| Historique des transitions | ✅ | `statusHistory` JSON |
| **Suppression synchronisée en temps réel** | 🟠 | DELETE endpoint (`projects.js:323-332`) n'émet **aucun événement socket**. Les autres participants ne sont pas notifiés. |

## `PRJ-03` — Synchronisation notes

| Sous-règle | État | Détail |
|------------|------|--------|
| Notes partagées pro ↔ client | ✅ | Champ `notes` dans Project, sync via `project:updated` |
| **Notes typées (Validation/Alerte/Info/Blocage)** | 🟡 | **Non implémenté** — champ `notes String` simple, pas de type/catégorie |
| Notes internes vs partagées | ❌ | Pas de distinction — toutes les notes sont partagées |

## `PRJ-04` — Sync images ✅
Document model + versioning. Photos synchronisées.

## `PRJ-05` — Gestion intervenants

| Sous-règle | État | Détail |
|------------|------|--------|
| 4 sources d'assignation (I1) | ⚠️ | Équipe + recherche + email OK. "Créer un profil" non vérifié |
| Tout intervenant finit avec un compte (I2) | ✅ | Invitation par email |
| **Accès intervenant = AUCUN sur projet sous-traité (I3)** | 🟠 | **Non encodé** dans la matrice de droits. Aucun rôle `INTERVENANT` dans `permissionEngine.js:11-50` |

## `PRJ-06` — Équipe cycle de vie

| Sous-règle | État | Détail |
|------------|------|--------|
| Référentiel `cockpitTeam` en base | ✅ | JSON dans ProProfile |
| **E1 — deux portes, UNE base** | 🟠 | **Violation** — Settings écrit dans `onboardingData.cockpitTeam`, PageBuilder/TeamEditor écrit dans `pageSections[].members`. Deux sources distinctes. |
| E3 — membre "Public" sur page pro | ⚠️ | Non vérifié |
| E5 — retrait différencié | ⚠️ | Non vérifié |

## `PRJ-07` — Suivi chantier

| Sous-règle | État | Détail |
|------------|------|--------|
| Tâches avec états TODO→DONE+BLOCKED | ✅ | `projectMissions.js` |
| Validation par section | ✅ | `POST /milestones/:id/validate` |
| Progression en % | ✅ | Calcul mission → rollup projet |
| **Phases : 7 phases fixes de la spec** | 🔴 | **MISMATCH MAJEUR** — La spec définit 7 phases (Conception, Préparation, Gros Œuvre, Second Œuvre, Matériaux, Mobilier, Réception). Le code n'a que **5 templates** (Conception architecturale, Études structure, Études fluides, Construction, Architecture intérieur). `missions.js:10-31` |
| **"Valider section" en en-tête** | 🟡 | Bouton en **bas** de section (footer, `Worksite.jsx:772-785`). La spec demande en **en-tête**. |
| **"Valider projet" en bas** | 🟡 | Bouton au **milieu** (`Worksite.jsx:585-587`). La spec demande tout en **bas**. |

## `PRJ-08` — Visualisation documentaire ⚠️
Versioning + filtrage OK. Manque : mode galerie/cartes/timeline interactif.

## `PRJ-09` — Couleurs projets ✅
19 couleurs, sélection à la création, persistée. — `domain/status.js`

## `PRJ-10` — Cohérence Client ↔ Pro ✅
Sync temps réel via Socket.IO.

---

# F. AVIS, NOTIFICATIONS & DONNÉES DE COMPTE

## `AVS-01` — Avis et notation

| Sous-règle | État | Détail |
|------------|------|--------|
| Basés sur collaboration réelle | ✅ | Vérification projet partagé — `reviews.js:33-39` |
| Note 1-5 + critères (qualité, délais, communication) | ✅ | |
| Une évaluation par mission (upsert) | ✅ | |
| **Création manuelle bloquée dans l'éditeur** | 🟠 | **Violation** — `ReviewsEditor.jsx:34-39` permet de créer des avis factices avec `verified: true` par défaut |
| **Source unique centralisée (calcul côté serveur)** | 🟡 | Moyenne calculée dans `pro.js:74` (serveur) mais aussi recalculée côté client. Risque de divergence. |
| **Évaluation croisée pro ↔ intervenant** | ❌ | Seuls les clients peuvent noter — `reviews.js:50` |
| **Prompt automatique à la clôture** | ❌ | Pas de déclenchement automatique d'évaluation |
| **"Aucun avis pour le moment" si 0 avis** | 🟡 | **Message absent** — pas de texte explicite pour le cas 0 avis |
| Pro ne peut ni supprimer ni masquer un avis | ✅ | Pas d'endpoint DELETE accessible au pro |

## `AVS-02` — Notifications ✅

| Sous-règle | État | Détail |
|------------|------|--------|
| Temps réel Socket.IO | ✅ | Rooms `user:{userId}` |
| Compteur persistant | ✅ | Badge `NotifBell.jsx` — `9+` si > 9 |
| Historique | ✅ | 50 dernières notifications |
| Badge AO dans sidebar | ✅ | Compteur `newAos` (AO < 48h) — `useMergedData.jsx:189` |

## `AVS-03` — Suppression profil & email

| Sous-règle | État | Détail |
|------------|------|--------|
| UUID-based (pas email) | ✅ | `user.id` CUID |
| Hard delete en cascade | ✅ | `auth.js:649` |
| Email réutilisable | ✅ | Nouveau compte indépendant |
| Double friction (mot de passe + "SUPPRIMER") | ✅ | `DeleteAccountSection.jsx` |
| **Notification acheteurs avant suppression fournisseur** | ❌ | Non implémenté |
| **Blocage si factures impayées** | ❌ | Non implémenté |

---

# G. QUALITÉ TRANSVERSE

## `QAL-01` — Performances ✅
Lazy loading, code splitting, compression, pagination, cache session.

## `QAL-02` — Source unique logo

| Sous-règle | État | Détail |
|------------|------|--------|
| Un seul point de lecture | 🟠 | 11 fichiers lisent le logo indépendamment |
| Settings et PageBuilder = même source | 🟠 | **Non** — Settings écrit dans `onboardingData`, PageBuilder dans `pageSections` |
| Placeholder unifié (initiales) | ✅ | Composants Avatar/Logo cohérents (HeroSection, ProDirectory, Sidebar) |
| Pas d'image cassée | ✅ | Fallback initiales partout |

## `QAL-03` — Correction orthographique

| Erreur | Fichier | Ligne | Correction |
|--------|---------|-------|------------|
| ~~"verifie" sans accent~~ | HeroSection, ReviewsSection, editors | — | ✅ **Corrigé** dans la passe 1 |
| ~~"KAI" au lieu de "KAi"~~ | Landing, Onboarding, useMeereoStore | — | ✅ **Corrigé** dans la passe 1 |
| "caractéres" (manque accent) | `cockpit/Settings.jsx` | 60 | 🟡 "caractères" |
| "ancree dans la duree" | `cockpit/Settings.jsx` | 257 | 🟡 "ancrée dans la durée" |
| "ancree dans son climat" | `sections-builder/constants.js` | 76 | 🟡 "ancrée" |
| "Securite" (manque accents) | `supplier/Settings.jsx` | 12 | 🟡 "Sécurité" |
| "Securite" (manque accents) | `client/Settings.jsx` | 124 | 🟡 "Sécurité" |
| "Sponsorises" (manque accent) | ~~`Catalogue.jsx`~~ | — | ✅ **Corrigé** passe 1 → "Sponsorisés" |

---

# H. SUIVI FINANCIER DE PROJET

## `FIN-01` — Budget / Phases / Marchés / Paiements

| Sous-règle | État | Détail |
|------------|------|--------|
| Budget global (plafond) | ✅ | Modèle `Budget` |
| Phases | ✅ | ESQUISSE → ETUDES → CHANTIER → LIVRAISON |
| Mission = Marché validé (D4) | ✅ | Modèle `Market` |
| Paiements déclarés par phase | ✅ | `PaymentOrder` avec rails Mobile Money |
| Agrégation financière | ✅ | `GET /finance/reports` |
| Client passif (D6) | ✅ | Pro déclare, client consulte |
| D7 — Alerte si engagé > budget | ✅ | `budgetAlert` dans le rapport |
| D8 — Clôture mission → avancement phase | ✅ | `useMeereoStore.jsx:2009`, `missions.js:201-204` |
| D9 — Pas de comptabilité | ✅ | Registre de traçabilité uniquement |
| D12 — Avancement découplé paiement | ✅ | Pas de couplage détecté |
| ~~Menu "Missions" séparé~~ | ✅ | **Corrigé** passe 1 — supprimé de la sidebar |
| ~~Menu "Actifs" présent~~ | ✅ | **Corrigé** passe 1 — supprimé de la sidebar |
| "Démarrer le marché" supprimé | ✅ | `Contracts.jsx:364` |
| "Paiement et sécurisation" supprimé | ✅ | `Contracts.jsx:307-317` |

## `FIN-02` — Mobile Money

| Sous-règle | État | Détail |
|------------|------|--------|
| Rails définis (Wave, Orange, MTN) | ✅ | `schema.prisma:862` |
| Recommandation rail (frontend) | ✅ | `fintech.js` |
| **Tarifs KAi Pro différenciés par rôle** | 🔴 | **Un seul prix hardcodé : 9 900 FCFA.** La spec exige 3 prix ACTÉS : Client 9 900, Pro 19 900, Fournisseur 39 000. `KaiSubscription.jsx:30`, `KaiGoldModal.jsx:73,149` |
| Gateway réelle connectée | ❌ | Infrastructure prête, pas de gateway branchée (normal MVP) |

## `FIN-03` — Monétisation Marketplace

| Sous-règle | État | Détail |
|------------|------|--------|
| Quota 5 produits gratuits | ❌ | Non implémenté |
| Tarifs configurables (back-office) | ❌ | Non implémenté |
| Abonnement fournisseur | ❌ | Non implémenté |

---

# I. CYCLE APPEL D'OFFRES & MARCHÉS

## `AOF-01` — Cycle AO → marché

| Sous-règle | État | Détail |
|------------|------|--------|
| A1 — Émetteurs Client + Pro | ✅ | |
| A2 — Public vs Privé | ✅ | `visibilityScope` |
| A3 — Portée globale | ✅ | |
| **A5/A7 — Auto-rejet des autres offres** | ⚠️ | **Frontend uniquement** (`useMeereoStore.jsx:1887-1891`). Le serveur ne rejette PAS automatiquement les autres offres. Contournable via API. |
| A6 — Acceptation = marché signé | ✅ | |
| **A6 — Mention d'engagement au dépôt** | 🟠 | **Absente** — le bouton "Soumettre l'offre" n'a aucune mention que le dépôt vaut engagement. `Exchange.jsx:988-1094` |
| A8 — Fermeture auto AO | ✅ | Statut → `attributed` — `useMeereoStore.jsx:2003-2006` |
| A9 — Modification/retrait avant acceptation | ✅ | |

## `AOF-02` — Offres reçues & comparaison ✅
Vue comparative implémentée. — `offers.js:52-87`

## `AOF-03` — Réponse pro ✅
Upsert 1 offre/pro/AO. Dossier auto-préparé.

---

# J. MARKETPLACE & ESPACE FOURNISSEUR

## `MKT-01` — Catalogue produits

| Sous-règle | État | Détail |
|------------|------|--------|
| CRUD produits | ✅ | |
| 12 catégories conformes | ✅ | `marketplace.js:5-18` |
| ~~Stock non persisté~~ | ✅ | **Corrigé** passe 1 — champ `stock Int` ajouté |
| **Stock décrémenté à la vente** | 🔴 | **Non implémenté** — `orders.js:49-109` ne touche pas au stock. Pas de vérification de disponibilité. |
| ~~Blocs promo à vide~~ | ✅ | **Corrigé** passe 1 — rendu conditionnel |
| Prix 0 = "Sur devis" | ✅ | `Marketplace.jsx:99,128` |
| **`flashDuration` absent du schema** | 🔴 | Frontend propose 24h/48h/72h (`Supplier.jsx:147-149`) mais le champ n'existe PAS en base. Valeur perdue. |

## `MKT-02` — Commande & livraison

| Sous-règle | État | Détail |
|------------|------|--------|
| Statuts commande (reçue → livrée) | ✅ | |
| Notification temps réel | ✅ | |
| **Seuil global MEEREO (Mobile Money vs devis)** | 🟡 | Non défini dans le code. Aucune constante `THRESHOLD`/`SEUIL`. |

## `MKT-03` — Espace fournisseur ✅
4 sections conformes : Activité, Marketplace, Finance, Compte. 8 onglets paramètres OK.

## `MKT-04` — Produits sponsorisés ⚠️
Flag `sponsored` OK. Marquage "AD" non vérifié côté Marketplace publique. Pas de tracking impressions.

## `MKT-05` — KAi surveillance stock ❌
Non implémenté. Aucune intégration KAi pour alertes stock.

---

# K. FONDATIONS TRANSVERSES

## `SYS-01` — Passeport Numérique

| Sous-règle | État | Détail |
|------------|------|--------|
| Module RETIRÉ (spec v1.10) | ⚠️ | **Modèle Prisma existe**, mais surtout : **l'entrée "Passeport Numérique" est encore visible dans la sidebar client** (`Client.jsx:289`). Devrait être retirée. |

## `SYS-02` — Matrice de droits

| Sous-règle | État | Détail |
|------------|------|--------|
| Moteur centralisé serveur | ✅ | `permissionEngine.js` |
| Miroir côté client | ✅ | `domain/permissions.js` |
| 8+ rôles définis | ✅ | |
| **Rôle INTERVENANT sous-traité** | 🟠 | **Absent** de la matrice. Pas de rôle `INTERVENANT` qui encode la règle I3 (accès nul sauf messagerie). |
| Second niveau rôles internes | ⚠️ | Rôles dans `cockpitTeam` mais granularité fine non vérifiée |

## `SYS-03` — Responsive mobile ✅
Breakpoints 768px. Hook `useIsMobile`. Menu hamburger.

## `SYS-04` — Multilingue FR + EN ❌
**Non implémenté.** Aucun framework i18n. Tout hardcodé en français.

## `SYS-05` — Gestion fichiers

| Sous-règle | État | Détail |
|------------|------|--------|
| Upload multipart (max 50 Mo) | ✅ | |
| Versioning (parentId + version) | ✅ | |
| **Validation formats autorisés** | 🔴 | **Aucune validation.** Le serveur accepte TOUT format de fichier. `documents.js:36-45` |
| Privé / partagé | ⚠️ | `isEntreprise` boolean — simpliste |

## `SYS-06` — Paramètres, page pro & aperçu

| Sous-règle | État | Détail |
|------------|------|--------|
| **Libellés clarifiés (Décision 1)** | 🟠 | `UserMenu.jsx:66` affiche **"Mon profil professionnel"** au lieu de **"Voir ma page publique"**. `Sidebar.jsx:56` affiche "Ma page pro" au lieu de "Modifier ma page pro". |
| Séparation périmètres (Décision 2) | 🟠 | Logo/slogan/bio encore éditables aux deux endroits (Settings + PageBuilder) |
| ~~RCCM verrouillé après vérification~~ | ✅ | **Corrigé** passe 1 — front + back |
| NCC dans paramètres pro | 🟡 | Absent du cockpit pro (présent et verrouillé chez le fournisseur) |
| Sélecteur langue FR/EN | ❌ | Absent (lié à SYS-04) |
| 2FA + sessions actives | ❌ | Seul changement de mot de passe |
| **"Réinitialiser toutes les données"** | 🔴 | **Encore présent** dans `cockpit/Settings.jsx:400-542`. Doit être retiré avant production. |
| Abonnement KAi Pro | ✅ | Composant `KaiSubscription` présent |

---

# RÉCAPITULATIF : TOUS LES ÉCARTS PAR PRIORITÉ

## 🔴 CRITIQUES (9)

| # | Code | Écart | Fichier |
|---|------|-------|---------|
| 1 | SYS-06 | **Bouton "Réinitialiser toutes les données" en production** | `cockpit/Settings.jsx:400-542` |
| 2 | PRJ-07 | **5 templates mission au lieu de 7 phases fixes** (Conception, Préparation, Gros Œuvre, Second Œuvre, Matériaux, Mobilier, Réception) | `missions.js:10-31` |
| 3 | MKT-01 | **Stock non décrémenté à la commande** — pas de vérification dispo | `orders.js:49-109` |
| 4 | SYS-05 | **Aucune validation de format de fichier** à l'upload | `documents.js:36-45` |
| 5 | NAV-06 | **Message "token manquant"** technique affiché à l'utilisateur | `auth.js:22` |
| 6 | FIN-02 | **Tarifs KAi Pro : 1 seul prix** (9 900) au lieu de 3 par rôle (9 900 / 19 900 / 39 000) | `KaiSubscription.jsx:30` |
| 7 | MKT-01 | **`flashDuration` absent** du schema — durée flash non persistée | `schema.prisma` Product |
| 8 | SYS-04 | **i18n non implémenté** — FR+EN exigé au lancement | Codebase entière |
| 9 | SYS-01 | **"Passeport Numérique" encore dans sidebar client** alors que RETIRÉ | `Client.jsx:289` |

## 🟠 ÉLEVÉS (16)

| # | Code | Écart | Fichier |
|---|------|-------|---------|
| 10 | AVS-01 | Avis manuels créables dans l'éditeur de page (devrait être lecture seule) | `ReviewsEditor.jsx:34-39` |
| 11 | MSG-04 | Nommage contextuel des conversations par rôle absent | `Messages.jsx:256-258` |
| 12 | MSG-07 | Historique masqué G4 non implémenté (messages avant ajout visibles) | `conversations.js:299-309` |
| 13 | MSG-02 | Fournisseur sans aucune restriction de messagerie | `conversations.js:134-157` |
| 14 | PRJ-02 | Suppression de projet non synchronisée (pas d'event socket) | `projects.js:323-332` |
| 15 | SYS-02 | Rôle INTERVENANT absent de la matrice de droits | `permissionEngine.js:11-50` |
| 16 | AOF-01 | Mention d'engagement absente du formulaire d'offre | `Exchange.jsx:988-1094` |
| 17 | PRJ-06 | Équipe : deux sources de données (Settings vs PageBuilder) | Settings + TeamEditor |
| 18 | QAL-02 | Logo : 11 fichiers lisent indépendamment, 2 sources d'écriture | Multiple |
| 19 | SYS-06 | Libellés menu incorrects ("Mon profil" au lieu de "Voir ma page publique") | `UserMenu.jsx:66`, `Sidebar.jsx:56` |
| 20 | AOF-01 | Auto-rejet des offres côté frontend uniquement (pas serveur) | `useMeereoStore.jsx:1887` |
| 21 | INS-04 | Badge vert : couleur inconsistante entre HeroSection et ProDirectory | `HeroSection.jsx`, `ProDirectory.jsx` |
| 22 | AVS-01 | Évaluation croisée pro↔intervenant absente | `reviews.js:50` |
| 23 | AVS-01 | Prompt automatique d'évaluation à la clôture absent | — |
| 24 | MSG-01 | Invitation entreprise référencée (cas 3, levier acquisition) absent | — |
| 25 | FIN-03 | Quota 5 produits gratuits non implémenté | — |

## 🟡 MOYENS (13)

| # | Code | Écart | Fichier |
|---|------|-------|---------|
| 26 | PRJ-03 | Notes de chantier non typées (Validation/Alerte/Info/Blocage) | `schema.prisma` |
| 27 | PRJ-07 | Bouton "Valider section" en bas au lieu d'en-tête | `Worksite.jsx:772-785` |
| 28 | PRJ-07 | Bouton "Valider projet" au milieu au lieu d'en bas | `Worksite.jsx:585-587` |
| 29 | AVS-01 | Message "Aucun avis pour le moment" absent si 0 avis | — |
| 30 | QAL-03 | "caractéres" → "caractères" | `cockpit/Settings.jsx:60` |
| 31 | QAL-03 | "ancree dans la duree" → "ancrée dans la durée" | `cockpit/Settings.jsx:257` |
| 32 | QAL-03 | "Securite" → "Sécurité" | `supplier/Settings.jsx:12`, `client/Settings.jsx:124` |
| 33 | QAL-03 | "ancree dans son climat" → "ancrée" | `constants.js:76` |
| 34 | MKT-02 | Seuil global de paiement non défini dans le code | — |
| 35 | SYS-06 | NCC absent des paramètres pro cockpit | `cockpit/Settings.jsx` |
| 36 | AVS-03 | Notification acheteurs avant suppression fournisseur absente | — |
| 37 | AVS-03 | Blocage suppression si factures impayées absent | — |
| 38 | INS-04 | Badge vérifié non affiché sur toutes les interfaces (AO, offres...) | — |

---

# CORRECTIONS DÉJÀ APPLIQUÉES (passe 1)

| # | Code | Correction | Fichier |
|---|------|-----------|---------|
| ✅ | MKT-01 | Stock ajouté au schema + routes backend | `schema.prisma`, `products.js` |
| ✅ | FIN-01 | "Missions" et "Actifs" supprimés de la sidebar | `Sidebar.jsx` |
| ✅ | SYS-06 | RCCM verrouillé après vérification (front + back) | `Settings.jsx`, `users.js` |
| ✅ | MKT-01 | Blocs promo conditionnels (masqués si 0 produit) | `Catalogue.jsx` |
| ✅ | QAL-03 | "verifie" → "vérifié" (7 fichiers) | HeroSection, ReviewsSection, editors |
| ✅ | QAL-03 | "KAI" → "KAi" dans textes visibles | Landing, Onboarding, useMeereoStore |

---

# PROCHAINES ACTIONS RECOMMANDÉES

## Avant mise en production (impératif)
1. Supprimer bouton "Réinitialiser toutes les données" (C1) — **5 min**
2. Validation formats fichiers à l'upload (C4) — **30 min**
3. Corriger message "token manquant" + intercepteur 401 (C5) — **30 min**
4. Supprimer création manuelle d'avis dans ReviewsEditor (E10) — **15 min**
5. Retirer "Passeport Numérique" de la sidebar client (C9) — **5 min**
6. Ajouter mention d'engagement sur les offres (E16) — **10 min**
7. Corriger les fautes d'orthographe restantes (M30-33) — **10 min**
8. Tarifs KAi Pro différenciés par rôle (C6) — **30 min**
9. Corriger libellés menu "Voir ma page publique" / "Modifier ma page pro" (E19) — **10 min**

## Sprint prioritaire
10. Aligner les 7 phases de mission avec la spec (C2) — **2-3h** (décision architecturale)
11. Décrémentation stock à la commande (C3) — **1h**
12. Ajouter `flashDuration` au schema + routes (C7) — **30 min**
13. Auto-rejet serveur des offres concurrentes (E20) — **1h**
14. Sync socket pour suppression projet (E14) — **30 min**
15. Historique masqué MSG-07 G4 (E12) — **1h**
16. Nommage contextuel conversations (E11) — **1h**

## Chantiers structurants (planifier)
17. i18n FR+EN (C8) — **Plusieurs jours**
18. Source unique logo QAL-02 (E18) — **Refactoring 1-2j**
19. Rôle INTERVENANT dans la matrice (E15) — **1j**
20. Quota produits + tarifs configurables FIN-03 (E25) — **2j**
