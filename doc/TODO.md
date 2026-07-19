# MEEREO — TODO

Derniere mise a jour : 2026-07-19

---

## PRIORITE 1 — Securite (BLOQUANT avant production)

- [x] **1.1** Securiser `POST /api/notifications` — verifier que le createur a une relation avec le destinataire
  - Fichier : `server/src/routes/notifications.js:21`
  - FAIT : verification projet partage ou marche partage avant creation

- [x] **1.2** Sanitiser les messages Socket.IO — empecher le XSS stocke + ajouter rate limiting
  - Fichier : `server/src/socket.js:67-134`
  - FAIT : sanitizeText() supprime balises HTML/script + rate limit 30 msg/min

- [x] **1.3** Remplacer l'authentification admin par email par un systeme de roles en base
  - Fichier : `server/src/routes/admin.js:20`
  - FAIT : champ `role` ajoute au modele User + verification en base (fallback email temporaire)

- [x] **1.4** Whitelist des champs retournes sur `GET /api/pro/:identifier`
  - Fichier : `server/src/routes/pro.js:14-67`
  - FAIT : whitelist explicite des champs onboardingData (plus de destructuring blacklist)

---

## PRIORITE 2 — Integrite des donnees

- [x] **2.1** Ajouter `@relation` sur `Market.projectId` vers Project + migration Prisma
  - FAIT : relation ajoutee + `markets Market[]` dans Project + `include: { project }` natif dans GET /api/markets

- [x] **2.2** Ajouter `@@index` sur les champs frequemment queries
  - FAIT : 15 indexes ajoutes sur Market, Offer, ProjectMember, Task, Event, Document, Notification, Conversation

- [x] **2.3** Ajouter `@@index` sur Conversation (`projectId`, `aoId`)
  - FAIT : indexes ajoutes (relations formelles reportees pour eviter de casser les routes existantes)

- [x] **2.4** Implementer rollback sur echec des optimistic updates
  - FAIT : createAO retire l'AO local si le backend echoue. submitOffer n'ajoute plus de donnee locale si le backend echoue

- [x] **2.5** Aligner phase default — `CONCEPTION` → `ESQUISSE`
  - FAIT : schema Prisma + route POST /api/projects alignes sur ESQUISSE

- [x] **2.6** Cascades de suppression — Task.projectId passe de SetNull a Cascade
  - FAIT : les taches sont supprimees avec leur projet. Order/Event restent en SetNull (donnees financieres preservees)

---

## PRIORITE 3 — Performance

- [x] **3.1** Ajouter pagination sur les routes listes
  - FAIT : pagination `?page=1&limit=50` ajoutee sur documents, conversations, users/pros, users/fournisseurs, products

- [x] **3.2** Eliminer les N+1 queries
  - FAIT : offers/compare — boucle docs remplacee par un seul `WHERE IN` par supplierId
  - FAIT : contacts/history — 4 requetes seq. → 2 phases paralleles (IDs puis donnees)
  - documents — deja en parallele (Promise.all), acceptable

---

## PRIORITE 4 — UX & Robustesse frontend

- [ ] **4.1** Remplacer les `.catch(() => {})` par des toasts d'erreur
  - Fichiers : `Gallery.jsx`, `Settings.jsx`, `Decisions.jsx`, `Progress.jsx`, `Documents.jsx`
  - 6 occurrences ou l'utilisateur ne sait pas que l'operation a echoue

- [ ] **4.2** Remplacer `prompt()` par un modal dans Progress.jsx
  - Fichier : `web/src/pages/client/Progress.jsx:175`
  - Creer un ModalConfirm avec champ texte pour la raison de refus

- [ ] **4.3** Ajouter guards null sur Dashboard.jsx `mainProj`
  - Fichier : `web/src/pages/cockpit/Dashboard.jsx:228`

- [ ] **4.4** Corriger Passport.jsx — acces unsafe sur nom vide
  - Fichier : `web/src/pages/client/Passport.jsx:73`
  - `(m.user?.name || '?')[0]` crash si name est string vide

- [ ] **4.5** Corriger Client.jsx — dependance manquante useEffect
  - Fichier : `web/src/pages/client/Client.jsx:127`
  - Retirer le `eslint-disable-line` et ajouter les deps manquantes

- [ ] **4.6** Corriger Documents.jsx — condition toujours vraie
  - Fichier : `web/src/pages/client/Documents.jsx:93`
  - `docs.length >= 0` → `docs.length > 0`

- [ ] **4.7** Ajouter attributs aria sur Modal.jsx
  - Fichier : `web/src/components/shared/Modal.jsx:16`
  - Ajouter `role="dialog"`, `aria-modal="true"`, `aria-labelledby`

- [ ] **4.8** Corriger collision de cles Toast.jsx
  - Fichier : `web/src/components/shared/Toast.jsx:11`
  - Remplacer `key={Date.now()}` par un compteur atomique

---

## PRIORITE 5 — Nettoyage & qualite

- [ ] **5.1** Retirer les `console.log` de production
  - Fichier : `web/src/pages/client/Client.jsx:117`

- [ ] **5.2** Corriger les caracteres corrompus dans Landing.jsx
  - Fichier : `web/src/pages/Landing.jsx:59` — `dûcisions` → `decisions`

- [ ] **5.3** Retirer les endpoints API inexistants du client
  - Fichier : `web/src/services/api/client.js`
  - Endpoints fantomes : `/knowledge/search`, `/engines/workflow/`, etc.

- [ ] **5.4** Uniformiser les noms de champs logo (`logoFileUrl` vs `logoUrl`)
  - Fichier : `web/src/hooks/useMergedData.jsx:60, 87`

- [ ] **5.5** Ajouter les cas manquants dans normalizeOfferStatus
  - Fichier : `web/src/domain/status.js:130-137`
  - Ajouter `accepted`, `rejected`, `withdrawn` en plus de `en_attente`, `acceptee`, `refusee`

- [ ] **5.6** Verifier la validation des fichiers null avant upload
  - Fichier : `web/src/services/api/client.js:479-490`

- [ ] **5.7** Corriger la race condition du background sync apres logout
  - Fichier : `web/src/hooks/useMeereoStore.jsx:423-546`
  - Verifier `storeRef.current.user` avant de continuer le sync

- [ ] **5.8** Corriger les stale closures dans log() et addNotif()
  - Fichier : `web/src/hooks/useMeereoStore.jsx:564-591`

---

## FEATURES A IMPLEMENTER

- [ ] **F1** KAI — Connecter le LLM (infrastructure UI/quota en place)
  - Fichier : `web/src/components/shared/KaiAssistant.jsx`
  - Routes : `server/src/routes/kai.js`

- [ ] **F2** Passeport numerique — auto-genere a la cloture du projet
  - Contient : historique, entreprises, documents, materiaux, garanties

- [ ] **F3** Asset engine — gestion du cycle de vie des actifs
  - Lifecycle, garanties, historique maintenance

- [ ] **F4** Knowledge graph — mapping des relations entre objets metier
  - Auto-enrichissement, detection d'impact

- [ ] **F5** Digital twin — versioning formel du projet
  - Representation vivante enrichie par evenements

---

## RESUME

| Priorite | Taches | Effort estime |
|----------|--------|---------------|
| P1 — Securite | 4 | ~6h |
| P2 — Donnees | 6 | ~7h |
| P3 — Performance | 2 | ~5h |
| P4 — UX | 8 | ~4h |
| P5 — Nettoyage | 8 | ~4h |
| Features | 5 | Variable |
| **Total corrections** | **28** | **~26h** |
