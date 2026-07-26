# AUDIT — Codebase MEEREO vs Spécifications v1.30

**Date :** 26 juillet 2026
**Périmètre :** Frontend (`web/`) + Backend (`server/`) confrontés à la synthèse v1.30 (`doc/specs/SYNTHESE_Produit_UI_v1.30.md`)
**Méthode :** 6 audits parallèles par domaine, lecture exhaustive du code réel (composants React, hooks, routes Express, schéma Prisma, socket). Chaque constat est sourcé (`fichier:ligne`).
**Stack :** React (Vite) · Node/Express · Prisma/PostgreSQL · Socket.IO · JWT

---

## RÉSUMÉ EXÉCUTIF

47 exigences UI de la v1.30 auditées sur 6 domaines.

| Statut | Nombre | % |
|---|---|---|
| ✅ Conforme | 16 | 34 % |
| 🟡 Partiel | 17 | 36 % |
| ❌ Manquant | 11 | 23 % |
| 🔴 Bug avéré | 3 | 6 % |

**Couverture par domaine :**

| Domaine | ✅ | 🟡 | ❌/🔴 | Santé |
|---|---|---|---|---|
| A. Inscription & onboarding (INS) | 2 | 7 | 3 | Moyenne — beaucoup d'à-moitié |
| B. Annuaire & AO (ANN) | 1 | 1 | 0 | Bonne |
| C. Messagerie (MSG) | 2 | 2 | 0 | Bonne (2 bugs à traiter) |
| D. Stabilité/navigation (NAV) | 4 | 2 | 0 | **Bonne** |
| E./H. Projets & finance (PRJ/FIN) | 4 | 1 | 0 | **Bonne** |
| F./G. Avis & qualité (AVS/QAL) | 0 | 0 | 3 | **Faible** |
| J. Marketplace/fournisseur (MKT) | 1 | 2 | 5 | **Faible** |
| K. Paramètres & socle (SYS) | 2 | 2 | 3 | Moyenne |

### Les 3 chantiers de fond (vrais projets, pas des correctifs)

1. **SYS-03 Responsive** — cœur applicatif desktop-first. `useIsMobile` branché sur 1 seul composant, ~31 media queries (surtout landing/onboarding). Couverture mobile estimée ~10-15 %.
2. **SYS-04 i18n** — infra branchée mais adoption ~3-4 % : 5 fichiers sur 136 importent `react-i18next`, ~27 appels `t()`. Écrans auth/inscription entièrement en dur.
3. **MKT Fournisseur** — l'onboarding fournisseur ne collecte aucun moyen de paiement, publie les produits sans garde, et utilise un référentiel de catégories divergent. 5 sous-points non conformes.

### Bugs avérés à corriger en priorité (quick wins, fort impact)

| # | Bug | Fichier | Effet |
|---|---|---|---|
| 1 | Init de langue : précédence `\|\|` avant `?:` | `web/src/config/i18n.js:337` | App démarre en **EN** même si préférence FR stockée |
| 2 | `getMine()` renvoie `{products, quota}` testé via `Array.isArray()` | `web/src/pages/supplier/Supplier.jsx:161` | Produits backend **jamais hydratés**, quota jamais lu |
| 3 | `isOverQuota` calculé puis ignoré | `server/src/routes/products.js:67` | Quota gratuit **non appliqué** (>5 produits publiés) |
| 4 | Route `/reset-password` inexistante côté React | `web/src/App.jsx:123-136` | Lien de reset envoyé par le serveur → **404** |
| 5 | Bouton « Contacter » factice (aucune conversation créée) | `web/src/components/shared/ProSearch.jsx:54-57` | Régression MSG-02 sur « Rechercher un pro » |
| 6 | GET conversations omet `projectId`/`type`/`projectName` | `server/src/routes/conversations.js:91-106` | Libellé contextuel MSG-04 cassé |
| 7 | Templates d'avis fictifs encore dans la palette éditeur | `web/src/components/sections-builder/constants.js:18,361-396` | Étoiles/avis inventés sur page publique (AVS-01) |

---

## A. INSCRIPTION & ONBOARDING (INS)

> Constat transverse : les boutons de progression ne sont **jamais `disabled`** — la validation se fait au clic via toast. Plusieurs champs « required » (téléphone, ville, secteurs, RCCM/NCC) ne sont **pas réellement enforced**, ni frontend ni serveur (`optionalPhone`, `.optional()` dans `server/src/validators/auth.js`).

### INS-01 — Champs RCCM & N° contribuable · 🟡 Partiel
- **Preuve :** `web/src/pages/Onboarding.jsx:383-408` — blocklists + `validateRCCM`/`validateNCC` rejettent les valeurs d'exemple, erreurs inline `:994`/`:998`, bordure rouge.
- **Écart :** bouton jamais désactivé (`:1858`, pas de `disabled`) ; RCCM/NCC optionnels (`:386` retourne `null` si vide) → un champ vide passe.
- **Action :** `disabled={!!rccmError || !!nccError || !form.rccm || !form.ncc}` sur le bouton étape 1 ; rendre les champs obligatoires.

### INS-03 — Popup page publique 1ère connexion · 🟡 Partiel
- **Preuve :** `web/src/pages/cockpit/Cockpit.jsx:174-188` — popup immédiat sans refresh, overlay bloquant sans bouton de fermeture.
- **Écart :** gate contournable — « Créer ma page » ferme le prompt (`:239`) sans exiger publication ; si l'utilisateur quitte le builder sans publier, l'accès n'est plus bloqué (le `useEffect` ne se re-déclenche pas).
- **Action :** re-vérifier `pagePublished` à chaque navigation ; ne fermer qu'après ACK serveur de publication.

### INS-06 — Stepper validation (`s-account`) · 🟡 Partiel
- **Preuve :** `validateCurrentStep()` `Onboarding.jsx:427-464` (clic + toast) ; route-guard anti dead-end `:413-422` ; erreur inline confirmation `:1022`.
- **Écart :** bouton non désactivé ; **aucun `onBlur`** (pas d'erreur inline par champ) ; politique mot de passe = `length>=8` seulement (front `:499` + serveur `validators/auth.js:11-14`).
- **Action :** bouton `disabled` selon `stepValid` ; handlers `onBlur` par champ ; renforcer la politique de mot de passe.

### INS-07 — Reset mot de passe (`s-reset`) · ❌ Manquant
- **Preuve :** aucune route `/reset-password` (`web/src/App.jsx:123-136`) alors que le serveur envoie `${frontendUrl}/reset-password?token=` (`server/src/routes/auth.js:560`) → **404**. `api.auth.resetPassword` (`client.js:305`) jamais appelé ; la modale forgot ne fait que `setForgotSent(true)` (`Onboarding.jsx:783`) sans appeler l'API.
- **Action :** créer `ResetPassword.jsx` + route, bouton `disabled` tant que non valide, erreurs inline, appel `api.auth.resetPassword` ; brancher la modale forgot sur `api.auth.forgotPassword`.

### INS-08 — Téléphone (obligatoire) & Ville · 🟡 Partiel
- **Preuve :** Téléphone présent 3 rôles (`:1008/1054/1074`), Ville obligatoire pro/fournisseur (`:969/1030`) et facultative client (`:1083`) — distinction correcte, distincte de la localisation projet (`:1103`).
- **Écart :** obligation purement visuelle — `handleFinish`/`validateCurrentStep` ne vérifient jamais `form.tel`/`form.ville` ; serveur `phone=optionalPhone`, `ville=.optional()` (`validators/auth.js:66,69`) ; pas de validation de format tél. côté front.
- **Action :** vérifier `!form.tel` (regex) + `!form.ville` (pro/fournisseur) dans la validation ; rendre `phone` requis serveur selon rôle.

### INS-09 — Unicité + possession email à la saisie · ❌ Manquant
- **Preuve :** email de vérification envoyé seulement en fin (`Onboarding.jsx:553-557`, après `createUser`) ; aucun contrôle d'unicité/possession au blur (pas de `onBlur`).
- **Action :** endpoint `check-email` + envoi code/lien à l'étape 1 avant progression ; flux de correction d'adresse depuis l'espace.

### INS-10 — Cases CGU + confidentialité · ❌ Manquant
- **Preuve :** aucune `checkbox`/`CGU` dans `Onboarding.jsx` ; `defaultForm` (`:340-357`) sans champ `cgu`/`communications`. Pages `/conditions` `/confidentialite` existent mais non liées au parcours.
- **Action :** 2 cases distinctes non pré-cochées à l'étape 1, liens ouvrant les pages sans quitter le parcours, bouton conditionné à la coche CGU, consentement persisté.

### INS-11 — Secteurs d'activité Pro (`p-struct`) · 🟡 Partiel
- **Preuve :** `defaultForm.secteurs:[]` (`:347`) — aucune pré-sélection en dur, `sel` dynamique (`:981`), puces avec id persistées (`:508`).
- **Écart :** minimum « 1 secteur » non enforced (`validateCurrentStep` `:429-433` ne teste pas `secteurs.length`).
- **Action :** `if (!form.secteurs.length) return 'Sélectionnez au moins un secteur'`.

### INS-12 — Générateur de logo · ✅ Conforme
- **Preuve :** monogramme = initiales réelles `:1158/1189`, aperçu = nom réel `:1162/1192`, repli `activeLogoType='generated'` `:524-528` (jamais vide). « M »/« Votre Structure » ne sont plus que des placeholders d'état vide.
- **Action :** (optionnel) uniformiser le placeholder vide.

### INS-13 — Brouillon d'inscription · 🟡 Partiel
- **Preuve :** clearDraft **après** ACK serveur (`:532` puis `:539`), pas à l'écran de confirmation ; `return` avant clear si échec.
- **Écart :** brouillon en **`sessionStorage`** (effacé à la fermeture d'onglet) ; **aucune expiration ~30j** (pas de `savedAt`/TTL).
- **Action :** migrer vers `localStorage` horodaté + purge à 30j.

### INS-15 — Stepper dynamique · 🟡 Partiel
- **Preuve :** nombre de points dynamique `steps=STEPS_MAP[userType]` (`:602-608`), jamais 5 en dur, recalcul au changement de rôle.
- **Écart :** les 3 rôles sont réduits à **2 étapes** (`*_STEPS` `:54/82/127`) ≠ 3/4/5 annoncés ; **code mort** d'étapes 3/4/5 inatteignables (`wizStep===3/4/5` `:1112/1280/1490…`) ; libellés finaux non unifiés.
- **Action :** supprimer le code mort, aligner `*_STEPS` sur le flux réel, unifier l'écran final.

### INS-16 — Fin parcours Client (KAi) · ✅ Conforme
- **Preuve :** `projectType:null` (`:346`) → pas de vignette `sel` par défaut ; budget `''` → « — Choisir — » ; auto-AO conditionné à `form.situation` (`:560-563`) ; récap conditionnel par champ (`:1557-1562`) ; mention « J'ai déjà pré-rempli » absente.
- **Note :** le bloc récap est de fait inatteignable (code mort INS-15) — à nettoyer avec INS-15.

---

## B. ANNUAIRE & APPELS D'OFFRES (ANN)

### ANN-02 — Logos & étoiles annuaire / AO privés · 🟡 Partiel
- **Preuve :** `CompanyLogo` central (`shared/CompanyLogo.jsx:16-19` → `hooks/useLogo.js:15-58`) utilisé dans `ProDirectory.jsx:145` ; backend `/users/pros` renvoie `logoUrl` seulement si type `uploaded` (`server/src/routes/users.js:69`).
- **Écart :** `ProSearch.jsx:31` (« Rechercher un pro ») et `InviteProfessionalModal.jsx:90-92` (AO privé) utilisent des initiales/`ProAvatar` locaux, pas `CompanyLogo`. **Étoiles non reliées à AVS-01** : `useCompanyRating` jamais importé (code mort), `ProDirectory.jsx:84` force `note:0`, `/users/pros` ne renvoie aucune note.
- **Action :** remplacer par `CompanyLogo` ; ajouter `noteAvg`/`reviewsCount` au select `users.js` ; rendre les étoiles via `StarRating`.

### ANN-03 — Refonte Bourse des AO · ✅ Conforme (design non vérifiable au code)
- **Preuve :** sous-titre « X disponibles · N nouveau(x) » `Exchange.jsx:311-318` ; badge sidebar `newAos` `Sidebar.jsx:41/178-190` ; temps réel via `ao:new` (`server/src/routes/aos.js:80` → `useMeereoStore.jsx:425-437`, sans refresh).
- **Note :** badge = AO ouverts <48 h, pas « non vus depuis dernière visite ». Qualité visuelle à valider par revue.

---

## C. MESSAGERIE (MSG)

### MSG-02 — Refonte messagerie · 🟡 Partiel (2 bugs 🔴)
- **Preuve :** Client→Pro reçus (`server/src/socket.js:117-162` + `useMeereoStore.jsx:357-389`) ; bouton page pro crée une vraie conversation (`profile/Profile.jsx:104-162`) ; logos dans conversations (`Messages.jsx:906-907`).
- **Écart 🔴 :** (1) `ProSearch.jsx:54-57` bouton « Contacter » factice — `updateStore` local, aucune conversation réelle. (2) Restriction CRM non appliquée : filtre liste retiré côté backend (`conversations.js:71-73`, `allowedClientIds=null`) et picker front (`Messages.jsx:722-728`) liste **tous** les inscrits (le backend bloque l'envoi en 403 mais la liste reste exposée).
- **Action :** aligner `ProSearch` sur le flux `Profile.jsx` ; filtrer `registeredUserContacts` sur CRM + relations d'affaires pour un pro.

### MSG-03 — Indicateur lu / non-lu · ✅ Conforme
- **Preuve :** `IntersectionObserver` sur visibilité réelle (`Messages.jsx:483-499`) ; `unread` recalculé serveur depuis `lastReadAt` (`conversations.js:79-84`) ; notif persiste si conv non active (`:418`).

### MSG-04 — Conversation unique par binôme · 🟡 Partiel
- **Preuve :** `pairHash` `@unique` + réutilisation à la création + gestion race P2002 (`conversations.js:201-269`) ; libellé contextuel (`Messages.jsx:260-273`).
- **Écart :** GET liste (`conversations.js:91-106`) ne renvoie ni `projectId`, ni `type`, ni `projectName` → la branche projet du libellé (`Messages.jsx:265`) ne se résout pas. Pas de **migration de fusion** des doublons historiques (`pairHash` ne s'applique qu'aux nouvelles).
- **Action :** ajouter `projectId`/`type`/`projectName` au mapping ; script de fusion des doublons existants.

### MSG-06 — Apparition instantanée nouvelle conversation · ✅ Conforme
- **Preuve :** insertion optimiste + réconciliation (`Messages.jsx:756-793`) ; côté destinataire re-fetch sur `conversation:updated` (`conversations.js:275-279` / `socket.js:152-162` → `useMeereoStore.jsx:361-370`), apparaît sans refresh.

---

## D. STABILITÉ, SESSION & NAVIGATION (NAV)

### NAV-01 — Retour intempestif landing · ✅ Conforme
- **Preuve :** `LandingGuard` `App.jsx:95-104` redirige le connecté vers son espace, `null` pendant `_checking` (pas de flash) ; seul `window.location.href='/'` = bouton volontaire `Validation.jsx:52`.

### NAV-02 — Déconnexions/sorties inattendues · ✅ Conforme
- **Preuve :** 401 nettoie le token + modal, **exclut** `/auth/me` et `/auth/login`, aucune redirection/reload (`services/api/client.js:81-86`) ; uploads via `apiFetchForm` même token ; SPA `BrowserRouter`.

### NAV-03 — Conservation page active au refresh · 🟡 Partiel
- **Preuve :** page active dérivée de l'URL (`Cockpit.jsx:156-159`, `Client.jsx:92-97`, `Supplier.jsx:52-57`) → F5 conserve la page top-level.
- **Écart :** sous-onglets/filtres internes en `useState` local non reflétés dans l'URL → perdus au F5 (la spec exige « mêmes filtres »).
- **Action :** persister filtres/sous-onglets via `useSearchParams` ou `sessionStorage` par page.

### NAV-04 — Logo page pro · 🟡 Partiel
- **Preuve :** logo affiché dans l'en-tête `profile/Profile.jsx:234-242` (données backend `pro.js:119-122`).
- **Écart :** positionné **à gauche** (spec = droite) ; construit à la main (pas `CompanyLogo`) ; ignore l'URL uploadée si `activeLogoType !== 'uploaded'`.
- **Action :** remplacer par `<CompanyLogo pro={ob} />` positionné à droite.

### NAV-05 — Lien « Paramètres » menu avatar · ✅ Conforme
- **Preuve :** `UserMenu.jsx:33-37` → `onNavigate('parametres')`, récepteurs `Cockpit.jsx:196-198`/`Client.jsx:108-111`/`Supplier.jsx:66-67`, page montée pour les 3 rôles.
- **Note :** la « carte EXPLORER » (3ᵉ point d'entrée cité) n'a pas été localisée — à confirmer/câbler si elle existe.

### NAV-06 — Message « Token manquant » · ✅ Conforme
- **Preuve :** tout 401 remappé en « Votre session a expiré… » (`client.js:87-91`), `SessionExpiredModal` i18n (`App.jsx:67-92`), token transmis partout (Bearer + cookie). Aucune chaîne « token manquant » visible.

---

## E./H. CYCLE DE VIE PROJETS & FINANCE (PRJ / FIN)

### PRJ-01 — Simplifications section Marché · ✅ Conforme
- **Preuve :** bouton « Démarrer le marché » supprimé (`cockpit/Contracts.jsx:364-368`, commentaire PRJ-01) ; section « Paiement & sécurisation » supprimée (`:315`). Grep = 0 rendu réel.

### PRJ-07 — Placement boutons validation · ✅ Conforme
- **Preuve :** « Valider cette section » dans l'en-tête de phase (`Worksite.jsx:718-724`) ; « Valider le projet » en bas après la dernière section (`:780-794`), l'emplacement haut retourne `null` (`:578`).

### PRJ-08 — Visualisation documentaire · 🟡 Partiel
- **Preuve :** 5 modes (grid/gallery/list/timeline/category) `Documents.jsx:231-232` ; champs aperçu/type/auteur/date/catégorie présents.
- **Écart :** le champ **étape** (phase projet) n'est affiché nulle part ; pas de regroupement « par étape ».
- **Action :** ajouter l'attribut `etape` au modèle + affichage + mode de regroupement.

### PRJ-09 — Couleurs des projets · ✅ Conforme
- **Preuve :** palette 20 teintes `domain/status.js:161-167`, picker `Projects.jsx:199-200`, auto-assignation unique `useMeereoStore.jsx:9-13`, appliqué dashboard/listes/timeline/agenda/sidebar.
- **Note :** 2 palettes coexistent (`PROJECT_COLORS` 13 vs `PROJECT_COLOR_PALETTE` 20) — unifier la source.

### FIN-01 — Fusion menu « Marchés » + suppression « Actifs » · ✅ Conforme
- **Preuve :** Sidebar une seule entrée `marches` (`Sidebar.jsx:43`), routée sur `Contracts.jsx` (`Cockpit.jsx:40`), commentaire FIN-01 `:33`. Plus de « Missions »/« Contrats »/« Actifs ».
- **Note :** label EN `nav.markets='Contracts'` (`i18n.js:184`) à harmoniser ; fichiers morts `Missions.jsx`/`Assets.jsx` à supprimer.

---

## F./G. AVIS & QUALITÉ TRANSVERSE (AVS / QAL)

### AVS-01 — Section Avis page publique · 🔴 Bug avéré
- **Preuve :** éditeur neutralisé (`editors/ReviewsEditor.jsx:1-18` lecture seule) ; backend exige une vraie collaboration (`reviews.js:33-61`) ; bloc « Avis clients » lit `pubData.stats/reviews` (`Profile.jsx:328-365`, `avgNote=null` si 0).
- **Écart :** (1) catégorie **« Avis » toujours dans la palette** (`sections-builder/constants.js:18` + 3 templates fictifs `:361-396` avec « K. Toure », `verified:true`) — un pro peut encore ajouter une section Avis inventée. (2) `SectionRenderer`/`ReviewsSection` rendent ces avis fictifs sur la page publique. (3) `useCompanyRating` = code mort. (4) aucun « Aucun avis pour le moment » rendu (bloc juste masqué).
- **Action :** retirer la catégorie `reviews` + templates de `constants.js` ; brancher `computeRating`/`StarRating` ; afficher l'état vide.

### QAL-02 — Logos source unique · 🔴 Bug avéré
- **Preuve :** socle central existant (`CompanyLogo.jsx` + `useLogo.js:15-58`, placeholder + anti-image-cassée) mais importé par **3 fichiers seulement**.
- **Écart (~8 fichiers / ~14 rendus à la main) :** `profile/Profile.jsx:236-238/385/416`, `Suppliers.jsx:118` (`onError` masque → trou), `Offers.jsx:11-12`, `useMergedData.jsx:60/126/137`, `Sidebar.jsx:209/218`, `Settings.jsx:219/223` + `supplier/Settings.jsx:48`, avatars `Contractors/Clients/Worksite`. Notifications/Marketplace/fiches projets sans résolution centralisée. Note annuaire ≠ page publique (`ProDirectory.jsx:84` `note:0`).
- **Action :** généraliser `<CompanyLogo>` ; corriger `Suppliers.jsx:118` (placeholder au lieu de masquage) ; uniformiser la note.

### QAL-03 — Corrections textuelles / « KAI » → « KAi » · 🔴 Bug avéré
- **Preuve :** i18n migré (`i18n.js:69-71`) et 401 neutralisés, **mais ~20 chaînes user-facing « KAI »** subsistent sur ~9 fichiers : `Landing.jsx:55/96/103/134/170/460`, `Onboarding.jsx:301/1136/1203`, `Offers.jsx:521`, `Exchange.jsx:355/360/399/1075`, `Projects.jsx:213/268/270`, `Settings.jsx:376/379` (en dur, pas les clés `kai.pro/standard`), `client/Home.jsx:115`, `KaiAssistant.jsx:194`, `Conditions.jsx:31`.
- **Action :** remplacer « KAI » → « KAi » sur ces chaînes ; `Settings.jsx:376/379` → `t('kai.pro')/t('kai.standard')` ; corriger le composant de marque `Onboarding.jsx:301`.

---

## J. MARKETPLACE & ESPACE FOURNISSEUR (MKT)

### MKT-01 — Blocs promo conditionnels + quota · 🟡 Partiel
- **Preuve :** bannières gardées par `allProducts.length>0` (`Marketplace.jsx:407`) ; Sponsorisés/Flash vraiment conditionnels (`:430/452`, `MKT_FLASH=[]`) ; état vide présent (`:486-491`). Backend calcule `quota{used,free:5,isOverQuota}` (`products.js:47-50`).
- **Écart :** contenu des 2 bannières hero **codé en dur** (promos fictives) ; **tout le volet quota UI absent** (compteur, coût du produit suivant, échéance, countdown) — 0 occurrence `quota` dans `supplier/*`. **Bug 🔴** `Supplier.jsx:160-162` : `getMine()` renvoie `{products,quota}` testé via `Array.isArray()` → produits jamais hydratés.
- **Action :** déballer `{products,quota}` (`Supplier.jsx:161`) ; bandeau quota dans Dashboard/Catalogue ; remplacer/masquer les bannières fictives.

### MKT-06a — Stock + Unité obligatoires (`f-mat`) · 🟡 Partiel
- **Preuve :** Unité présente (`Onboarding.jsx:1461-1466`) mais non obligatoire ; **Stock absent** de `f-mat` (existe seulement `supplier/Supplier.jsx:420`).
- **Action :** ajouter « Stock disponible », rendre Stock + Unité obligatoires (`:1476`).

### MKT-06b — Catégories alignées sur les 11 MeereoShop · ❌ Non conforme
- **Preuve :** `MKT_CATS` = 11 catégories canoniques (`data/marketplace.js:5-18`) **mais** `f-struct`/`f-mat` utilisent `FRN_CAT_SECTIONS` = **23 catégories** propriétaires hard-codées (`Onboarding.jsx:133-169`). Un produit créé reçoit une catégorie inexistante côté acheteur → invisible/mal classé.
- **Action :** supprimer `FRN_CAT_SECTIONS`, consommer `MKT_CATS` (import unique) dans `:1397` et `:1471`.

### MKT-06c — Toggle « Visible dans le Marketplace » (`f-mat`) · ❌ Manquant
- **Preuve :** aucun toggle ni statut dans `f-mat` (`Onboarding.jsx:1445-1481`, objet = `{name,price,unit,category,photoUrl}`) ; existe seulement post-inscription (`Supplier.jsx:439-442`, défaut `isPublished:true`).
- **Action :** ajouter l'interrupteur + texte de statut par défaut, propager `isPublished` jusqu'au backend.

### MKT-06d — Compteur quota « 1/5 » (`f-mat`) · ❌ Manquant
- **Preuve :** « X produit(s) ajouté(s) » (`:1426`) sans plafond ni quota ; 0 occurrence quota dans `Onboarding.jsx` alors que backend gère 5 (`products.js:63`).
- **Action :** afficher `products.length/5 produits gratuits` + avertissement au 6ᵉ.

### MKT-06e — `f-struct` catégories servies · ✅ Conforme
- **Preuve :** sélection multiple `Onboarding.jsx:1388-1419`, persistée `FournisseurProfile.categories` (`schema.prisma:266`). Réserve : source = point (b).

### MKT-06f — `f-done` gating paiement + zone · ❌ Non conforme
- **Preuve :** « Votre marketplace est prête » affiché inconditionnellement (`Onboarding.jsx:128/1689/1722`) ; **aucun moyen de paiement collecté** dans l'onboarding, aucun champ dans `FournisseurProfile` (`schema.prisma:246-277`) ; zones optionnelles.
- **Action :** collecter les moyens de réception (schéma + étape) ; titre/accroche conditionnels ; distinguer « compte créé » vs « boutique opérationnelle ».

### MKT-06g — Publication ⇒ ≥1 réception + ≥1 zone · ❌ Non conforme
- **Preuve :** POST `products.js:57-89` crée sans vérifier zones/paiement ; `isOverQuota` calculé puis **ignoré** (`:67`) ; `isPublished @default(true)` (`schema.prisma:323`) → publié immédiatement ; front force `isPublished` (`Supplier.jsx:190-203`).
- **Action :** garde backend : sans moyen de réception OU sans zone → `isPublished:false` (brouillon) + motif ; refléter dans l'UI ; **appliquer le quota** (`isOverQuota`).

---

## K. PARAMÈTRES & SOCLE (SYS)

### SYS-06 (libellés) — Trois portes d'identité · 🟡 Partiel
- **Preuve :** libellés renommés (`i18n.js:26-28`, `UserMenu.jsx:68/73`, `Sidebar.jsx:56-57`).
- **Écart :** l'édition vitrine (logo/slogan/bio/secteurs/services) reste **dupliquée** dans l'onglet Profil des Paramètres (`cockpit/Settings.jsx:216-304`).
- **Action :** retirer ces champs de Settings, ne garder que l'identité de compte ; rediriger l'édition vitrine vers le PageBuilder.

### SYS-06 (Préférences) — Sélecteur de langue FR/EN · 🟡 Partiel
- **Preuve :** présent cockpit (`Settings.jsx:331-346`) et client (`client/Settings.jsx:120-129`).
- **Écart :** **absent de l'espace fournisseur** et des écrans auth.
- **Action :** ajouter dans `supplier/Settings.jsx` + pages auth.

### SYS-06 (Sécurité) — 2FA + sessions actives · ❌ Manquant
- **Preuve :** 0 occurrence 2FA/sessions ; onglet Sécurité = mot de passe seul (`cockpit/Settings.jsx:40-66`), non branché côté fournisseur (toast simulé `supplier/Settings.jsx:139`) ; aucune route backend.
- **Action :** TOTP (backend enroll/verify/disable + secret chiffré) + registre de sessions (liste/révocation) + UI 3 espaces.

### SYS-06 (Données) — Retrait « Réinitialiser toutes les données » · ✅ Conforme
- **Preuve :** bouton retiré (`cockpit/Settings.jsx:419`), onglet = Export JSON + `DeleteAccountSection` ; aucun endpoint destructif backend.
- **Note :** état mort `showResetModal`/`resetText` (`:123-124`) à supprimer.

### SYS-06 (RCCM) — Champ verrouillé après vérification · ✅ Conforme
- **Preuve :** input RCCM `disabled={!!user.verified}` + mention admin (`cockpit/Settings.jsx:262`) ; lecture seule fournisseur (`supplier/Settings.jsx:53`).
- **Note :** ajouter la défense serveur (ignorer `rccm` si `verified`).

### SYS-03 — Responsive mobile · ❌ Manquant
- **Preuve :** `useIsMobile` utilisé dans **1 seul** composant (`DSKpiStrip.jsx`) ; **31 media queries** (20 dans `styles/`) ; Settings en style inline à largeurs fixes. Couverture ~10-15 %.
- **Action :** chantier dédié — layouts adaptatifs (Sidebar en drawer), unités relatives, breakpoints tactiles.

### SYS-04 — i18n · ❌ Manquant
- **Preuve :** infra branchée (`main.jsx:11`, `i18n.js:332-340`) mais **5/136 fichiers** importent `react-i18next`, ~27 `t()`. Dictionnaire ~90 clés. Auth/inscription/Settings en dur. **Bug 🔴** `i18n.js:337` : `lng: getItem('meereo_lang') || navigator.language?.startsWith('en') ? 'en':'fr'` — précédence `||` avant `?:` → démarre en **EN** dès qu'une préférence est stockée (même « fr »).
- **Action :** corriger la précédence (`getItem() || (startsWith('en')?'en':'fr')`) ; externaliser auth/Settings/partagés ; généraliser `useTranslation` + sélecteur partout.

---

## PLAN D'ACTION PRIORISÉ

### P0 — Bugs à corriger tout de suite (petit effort, fort impact)
1. `i18n.js:337` — corriger la précédence d'init de langue.
2. `supplier/Supplier.jsx:161` — déballer `{products,quota}` (produits fournisseur invisibles sinon).
3. `products.js:67` — appliquer `isOverQuota` (quota non enforced).
4. INS-07 — créer la page/route `/reset-password` (lien serveur mort, 404).
5. `ProSearch.jsx:54-57` — bouton « Contacter » réel (MSG-02).
6. `conversations.js:91-106` — exposer `projectId`/`type`/`projectName` (MSG-04).
7. AVS-01 — retirer les templates d'avis fictifs de la palette éditeur.

### P1 — Écarts fonctionnels ciblés (moyen effort)
- Onboarding : boutons `disabled` + `onBlur` + champs réellement obligatoires (INS-01/06/08/11) ; cases CGU (INS-10) ; vérif email à la saisie (INS-09) ; brouillon 30j en localStorage (INS-13) ; nettoyer le code mort d'étapes (INS-15/16).
- MKT-06 : aligner catégories sur `MKT_CATS` (b), Stock+Unité obligatoires (a), toggle + quota dans `f-mat` (c/d), gating `f-done`/publication (f/g).
- QAL-02 (généraliser `CompanyLogo`) + QAL-03 (« KAI »→« KAi »).
- NAV-03 (persister filtres), NAV-04 (logo pro via `CompanyLogo`, à droice), SYS-06 (dédoublonner vitrine, langue fournisseur).

### P2 — Chantiers de fond (projets à part entière)
- **SYS-03 Responsive mobile** (cœur applicatif desktop-first).
- **SYS-04 i18n** (couverture ~4 % → généraliser).
- **SYS-06 Sécurité** 2FA + gestion des sessions.
- **MSG-04** script de fusion des conversations dupliquées existantes.

### Nettoyages (dette)
- Supprimer fichiers morts `cockpit/Missions.jsx`, `cockpit/Assets.jsx`.
- Unifier les 2 palettes couleur projet (PRJ-09).
- Harmoniser le label EN `nav.markets` (FIN-01).
- Supprimer l'état mort `showResetModal`/`resetText` (Settings).

---

*Audit généré le 26 juillet 2026 — 6 clusters parallèles, constats sourcés au fichier:ligne. Voir la synthèse produit dans [../SYNTHESE_Produit_UI_v1.30.md](../SYNTHESE_Produit_UI_v1.30.md).*
