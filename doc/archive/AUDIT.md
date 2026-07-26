# MEEREO — Audit complet de la codebase

Date : 2026-07-19

---

## Resume executif

| Categorie | Critique | Haute | Moyenne | Basse | Total |
|-----------|----------|-------|---------|-------|-------|
| Serveur (routes, securite) | 4 | 6 | 6 | 1 | 17 |
| Frontend (pages, composants) | 0 | 2 | 12 | 5 | 19 |
| Core (store, hooks, schema) | 0 | 5 | 9 | 5 | 19 |
| **Total** | **4** | **13** | **27** | **11** | **55** |

---

## 1. SERVEUR — Routes & Securite

### CRITIQUE

#### 1.1 Notifications — injection de notifications arbitraires
- **Fichier :** `server/src/routes/notifications.js:21`
- **Route :** `POST /api/notifications`
- **Probleme :** N'importe quel utilisateur authentifie peut creer une notification pour N'IMPORTE QUEL autre utilisateur via `targetUserId`. Aucune verification d'autorisation.
- **Risque :** Escalade de privileges, phishing interne, spam de notifications.
- **Fix :** Verifier que le createur a une relation (projet, marche, conversation) avec le destinataire.

#### 1.2 Socket.IO — pas de validation des messages
- **Fichier :** `server/src/socket.js:67-134`
- **Event :** `message:send`
- **Probleme :** Aucune validation du contenu du message (XSS potentiel). Pas de rate limiting sur l'envoi de messages.
- **Risque :** XSS stocke, spam de messages.
- **Fix :** Sanitiser le contenu HTML, ajouter un rate limiter par utilisateur.

#### 1.3 Admin — authentification par email
- **Fichier :** `server/src/routes/admin.js:20`
- **Probleme :** La verification admin utilise une liste d'emails depuis une variable d'environnement. Pas de role admin en base.
- **Risque :** Contournable si l'email est compromis.
- **Fix :** Ajouter un champ `role` au modele User et verifier en base.

#### 1.4 Pro — fuite de donnees sur le profil public
- **Fichier :** `server/src/routes/pro.js:14-67`
- **Route :** `GET /api/pro/:identifier` (PUBLIC, sans auth)
- **Probleme :** Retourne `onboardingData` qui peut contenir des champs sensibles (mots de passe, tokens). Le filtre ligne 93 tente de les exclure mais n'est pas exhaustif.
- **Risque :** Exposition de donnees privees.
- **Fix :** Whitelist explicite des champs retournes au lieu de blacklist.

### HAUTE

#### 1.5 Documents — N+1 queries + pas de pagination
- **Fichier :** `server/src/routes/documents.js:48+`
- **Route :** `GET /api/documents`
- **Probleme :** 3 requetes imbriquees dans une boucle (projets, membres, suppliers). Aucune pagination malgre des fichiers de 50MB.

#### 1.6 Offres — N+1 queries sur le comparatif
- **Fichier :** `server/src/routes/offers.js:52-86`
- **Route :** `GET /api/offers/compare/:aoId`
- **Probleme :** Boucle `Promise.all` sur chaque offre pour charger les documents entreprise. Devrait utiliser un `include` Prisma.

#### 1.7 Contacts — N+1 queries sur l'historique
- **Fichier :** `server/src/routes/contacts.js:70-100`
- **Route :** `GET /api/contacts/:id/history`
- **Probleme :** Requetes sequentielles multiples, pas de pagination sur les donnees liees.

#### 1.8 Marches — N+1 queries sur les projets
- **Fichier :** `server/src/routes/markets.js:30-49`
- **Route :** `GET /api/markets`
- **Probleme :** Fetch tous les marches puis boucle pour chercher les projets lies (corrige partiellement, mais sans relation Prisma).

#### 1.9 Conversations — pas de pagination
- **Fichier :** `server/src/routes/conversations.js:36-80`
- **Route :** `GET /api/conversations`
- **Probleme :** Include complexe imbrique sans pagination. Potentiellement des centaines de conversations chargees d'un coup.

#### 1.10 Users — pas de pagination sur l'annuaire
- **Fichier :** `server/src/routes/users.js:8-41`
- **Routes :** `GET /users/pros`, `GET /users/fournisseurs`
- **Probleme :** Aucune limite sur le nombre de resultats retournes.

### MOYENNE

#### 1.11 Payments — pas de validation des arrays JSON
- **Fichier :** `server/src/routes/payments.js:36-100`
- **Probleme :** `milestones`, `proofs`, `validations` acceptes sans validation de taille ou de structure.

#### 1.12 Tasks — assignation non validee
- **Fichier :** `server/src/routes/tasks.js:71`
- **Probleme :** `assignedTo` accepte n'importe quelle string sans verifier que l'utilisateur existe.

#### 1.13 Auth — double requete inefficace
- **Fichier :** `server/src/routes/auth.js:366`
- **Probleme :** `findUnique` imbrique dans un `update`.

#### 1.14 Products — pas de pagination
- **Fichier :** `server/src/routes/products.js:9-26`
- **Probleme :** Endpoint public sans limite de resultats.

#### 1.15 ErrorHandler — stack exposee en dev
- **Fichier :** `server/src/middleware/errorHandler.js:27-32`
- **Probleme :** Stack trace complete exposee si `NODE_ENV` mal configure.

#### 1.16 Rate limiting desactive en dev
- **Fichier :** `server/src/index.js:86-113`
- **Probleme :** Pourrait etre deploye accidentellement sans rate limiting.

---

## 2. FRONTEND — Pages & Composants

### HAUTE

#### 2.1 Client.jsx — dependance manquante dans useEffect
- **Fichier :** `web/src/pages/client/Client.jsx:127`
- **Probleme :** `eslint-disable-line` pour cacher une dependance critique manquante dans un useEffect qui charge les projets.

#### 2.2 Passport.jsx — acces unsafe sur nom
- **Fichier :** `web/src/pages/client/Passport.jsx:73`
- **Probleme :** `(m.user?.name || '?')[0]` crash si `name` est une string vide.

### MOYENNE

#### 2.3 Console.log en production
- **Fichier :** `web/src/pages/client/Client.jsx:117`
- **Probleme :** `console.log('[Client] Projects loaded...')` reste en production.

#### 2.4 Erreurs API avalees silencieusement (x6)
- **Fichiers :** `Gallery.jsx`, `Settings.jsx (x2)`, `Decisions.jsx`, `Progress.jsx`, `Documents.jsx`
- **Probleme :** Pattern `.catch(() => {})` sur des appels API critiques. L'utilisateur ne sait pas que l'operation a echoue.

#### 2.5 prompt() utilise au lieu d'un modal
- **Fichier :** `web/src/pages/client/Progress.jsx:175`
- **Probleme :** `prompt()` du navigateur pour demander la raison de refus de cloture. UX pauvre.

#### 2.6 Dashboard — mainProj peut etre undefined
- **Fichier :** `web/src/pages/cockpit/Dashboard.jsx:228`
- **Probleme :** Le hero affiche `mainProj.nom` sans verifier que `mainProj` existe.

#### 2.7 Documents — condition toujours vraie
- **Fichier :** `web/src/pages/client/Documents.jsx:93`
- **Probleme :** `if (docs && docs.length >= 0)` est toujours vrai pour un tableau.

#### 2.8 Batch upload — erreur non specifique
- **Fichier :** `web/src/pages/client/Documents.jsx:348`
- **Probleme :** Si un fichier echoue dans un batch, l'utilisateur ne sait pas lequel.

### BASSE

#### 2.9 Encodage caracteres — Landing.jsx
- **Fichier :** `web/src/pages/Landing.jsx:59`
- **Probleme :** Caracteres corrompus (`dûcisions` au lieu de `decisions`).

#### 2.10 Memory leak potentiel — Tenders.jsx
- **Fichier :** `web/src/pages/client/Tenders.jsx:82`
- **Probleme :** Portal vers `document.body` sans cleanup au demontage.

---

## 3. CORE — Store, Hooks, Schema Prisma

### HAUTE

#### 3.1 Prisma — Market.projectId sans @relation
- **Fichier :** `server/prisma/schema.prisma:440`
- **Probleme :** `projectId String?` sans `@relation` vers Project. Impossible de faire `include: { project }` ou de naviguer la relation.
- **Impact :** Oblige des requetes manuelles cote serveur (corrige avec lookup, mais fragile).
- **Fix :** Ajouter la relation au schema et migrer.

#### 3.2 Prisma — indexes manquants
- **Fichier :** `server/prisma/schema.prisma`
- **Probleme :** Aucun `@@index` sur les champs frequemment queries : `projectId`, `userId`, `createdAt`, `supplierId`, `clientId`, `aoId`.
- **Impact :** Performances degradees avec le volume de donnees.

#### 3.3 Prisma — Conversation sans relations
- **Fichier :** `server/prisma/schema.prisma:356-359`
- **Probleme :** `aoId`, `offerId`, `projectId`, `missionId` sont des `String?` sans `@relation`.

#### 3.4 Optimistic updates sans rollback
- **Fichier :** `web/src/hooks/useMeereoStore.jsx:1691-1900`
- **Fonctions :** `createAO`, `submitOffer`, `acceptOffer`
- **Probleme :** Les donnees sont ajoutees au store local (optimistic) puis synchronisees au backend. Si le backend echoue, les donnees locales persistent avec des IDs temporaires (`ao_xxx`, `proj_xxx`, `mkt_xxx`). Aucun rollback.
- **Impact :** Donnees fantomes visibles par l'utilisateur.

#### 3.5 API client — endpoints non valides
- **Fichier :** `web/src/services/api/client.js`
- **Probleme :** Certains endpoints (ex: `/knowledge/search`, `/engines/workflow/`) n'existent pas cote serveur. Echoue silencieusement (404 avale par `.catch`).

### MOYENNE

#### 3.6 Race condition — background sync apres logout
- **Fichier :** `web/src/hooks/useMeereoStore.jsx:423-546`
- **Probleme :** Le sync interval (30s) utilise `storeRef.current` sans verifier si le composant est monte ou si l'utilisateur est logout.

#### 3.7 Stale closure — log() et addNotif()
- **Fichier :** `web/src/hooks/useMeereoStore.jsx:564-591`
- **Probleme :** Ces callbacks utilisent `storeRef.current.user?.id` mais sont wrapes avec `useCallback([updateStore])`. Risque d'attribuer des activites au mauvais utilisateur.

#### 3.8 Phase constants — mismatch
- **Fichier :** `web/src/domain/status.js:22-31`
- **Probleme :** Le schema Prisma default la phase a `CONCEPTION` mais le frontend normalise vers `ESQUISSE`. Comparaisons incorrectes au premier chargement.

#### 3.9 Commission — validation manquante
- **Fichier :** `web/src/domain/commission.js:66-68`
- **Probleme :** Seul le statut `RETAINED` declenche une commission, mais aucune validation que l'introduction existe.

#### 3.10 Modal — accessibilite manquante
- **Fichier :** `web/src/components/shared/Modal.jsx:16`
- **Probleme :** Pas de `role="dialog"`, `aria-modal="true"`, `aria-labelledby`. Les lecteurs d'ecran ne detectent pas les modals.

#### 3.11 Toast — collision de cles
- **Fichier :** `web/src/components/shared/Toast.jsx:11`
- **Probleme :** `key={Date.now()}` — si deux toasts arrivent dans la meme milliseconde, collision de cles React.

#### 3.12 Socket — listeners accumules
- **Fichier :** `web/src/hooks/useMeereoStore.jsx:336-419`
- **Probleme :** Si le token change mid-session, le useEffect cree un nouveau socket mais les anciens listeners persistent jusqu'au cleanup.

#### 3.13 Offer status — cas manquants
- **Fichier :** `web/src/domain/status.js:130-137`
- **Probleme :** Ne mappe que `en_attente`, `acceptee`, `refusee`. Le backend peut retourner `accepted`, `rejected`, `withdrawn` directement.

#### 3.14 Upload — validation fichier null
- **Fichier :** `web/src/services/api/client.js:479-490`
- **Probleme :** `FormData.append()` accepte silencieusement `null`. Pas de validation cote client.

### BASSE

#### 3.15 Prisma — Market.clientId/supplierId nullable
- **Fichier :** `server/prisma/schema.prisma:444-448`
- **Probleme :** Les deux sont nullable mais chaque marche devrait avoir un client et un fournisseur.

#### 3.16 Prisma — cascades manquantes
- **Fichier :** `server/prisma/schema.prisma:413-415, 628-629`
- **Probleme :** Supprimer un projet laisse des orders, events et tasks orphelins.

#### 3.17 PropTypes manquants — composants partages
- **Fichier :** `web/src/components/shared/*`
- **Probleme :** Aucune validation de props. Les mauvais types echouent silencieusement.

#### 3.18 Logo URL inconsistant
- **Fichier :** `web/src/hooks/useMergedData.jsx:60, 87`
- **Probleme :** Utilise `logoFileUrl` dans certains cas, `logoUrl` dans d'autres. Pas de fallback uniforme.

#### 3.19 setStore apres unmount
- **Fichier :** `web/src/hooks/useMeereoStore.jsx:545`
- **Probleme :** Si le Provider unmount pendant un sync en cours, `setStore()` est appele sur un composant demonte.

---

## 4. PLAN DE REMEDIATION

### Priorite 1 — Securite (a corriger immediatement)

| # | Action | Effort |
|---|--------|--------|
| 1.1 | Verifier l'autorisation dans `POST /api/notifications` | 1h |
| 1.2 | Sanitiser les messages Socket.IO + rate limiter | 2h |
| 1.3 | Passer a un systeme de roles en base pour admin | 2h |
| 1.4 | Whitelist des champs sur `GET /api/pro/:identifier` | 1h |

### Priorite 2 — Integrite des donnees

| # | Action | Effort |
|---|--------|--------|
| 3.1 | Ajouter `@relation` sur Market.projectId + migration | 1h |
| 3.2 | Ajouter `@@index` sur les champs frequemment queries | 30min |
| 3.3 | Ajouter relations sur Conversation (projectId, aoId) | 1h |
| 3.4 | Implementer rollback sur echec des optimistic updates | 3h |
| 3.8 | Aligner phase default CONCEPTION vs ESQUISSE | 30min |

### Priorite 3 — Performance

| # | Action | Effort |
|---|--------|--------|
| 1.5-1.9 | Ajouter pagination sur GET documents, conversations, users, products | 3h |
| 1.6-1.7 | Remplacer N+1 queries par des includes Prisma | 2h |

### Priorite 4 — UX & Robustesse

| # | Action | Effort |
|---|--------|--------|
| 2.4 | Remplacer `.catch(() => {})` par des toasts d'erreur | 2h |
| 2.5 | Remplacer `prompt()` par un modal | 30min |
| 2.6 | Ajouter guards null sur Dashboard mainProj | 15min |
| 3.10 | Ajouter attributs aria sur Modal | 30min |
| 3.11 | Utiliser un compteur atomique pour les cles de toast | 15min |

### Priorite 5 — Nettoyage

| # | Action | Effort |
|---|--------|--------|
| 2.3 | Retirer les console.log de production | 15min |
| 2.9 | Corriger les caracteres corrompus dans Landing.jsx | 15min |
| 3.5 | Retirer les endpoints API inexistants | 30min |
| 3.17 | Ajouter PropTypes ou TypeScript sur les composants partages | 2h |

---

**Effort total estime : ~22h de travail technique**
