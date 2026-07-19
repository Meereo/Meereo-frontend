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

- [x] **4.1** Remplacer les `.catch(() => {})` par des toasts d'erreur
  - FAIT : 10 corrections sur Settings (client+cockpit), Documents (client+cockpit), Clients.jsx (update+delete)

- [x] **4.2** Remplacer `prompt()` par un modal dans Progress.jsx
  - FAIT : modal avec textarea pour la raison de refus de cloture

- [x] **4.3** Ajouter guards null sur Dashboard.jsx `mainProj`
  - FAIT : `mainProj?.nom`, `mainProj?.client`, etc.

- [x] **4.4** Corriger Passport.jsx — acces unsafe sur nom vide
  - FAIT : `.charAt(0)` avec fallback company

- [x] **4.5** Corriger Client.jsx — console.log supprime
  - FAIT : console.log retire, early return si pas de projets

- [x] **4.6** Corriger Documents.jsx — condition toujours vraie
  - FAIT : `docs.length >= 0` → `Array.isArray(docs)`

- [x] **4.7** Ajouter attributs aria sur Modal.jsx
  - FAIT : `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-title"`

- [x] **4.8** Corriger collision de cles Toast.jsx
  - FAIT : compteur atomique `useRef` au lieu de `Date.now()`

---

## PRIORITE 5 — Nettoyage & qualite

- [x] **5.1** Retirer les `console.log` de production
  - FAIT : deja nettoye en P4.5

- [x] **5.2** Corriger les caracteres corrompus dans Landing.jsx
  - FAIT : `dûcisions` → `décisions`, `dûcider` → `décider`, `gros-é"uvre` → `gros-œuvre`, `rèel` → `réel`

- [x] **5.3** Verifier les endpoints API du client
  - FAIT : `/knowledge/` et `/engines/` existent cote serveur — pas d'endpoints fantomes

- [x] **5.4** Uniformiser les noms de champs logo
  - FAIT : fallback chain `logoFileUrl || proProfile.logoFileUrl || logoUrl` dans useMergedData

- [x] **5.5** Ajouter les cas manquants dans normalizeOfferStatus
  - FAIT : `accepted`, `rejected`, `withdrawn`, `retiree` ajoutes au mapping

- [x] **5.6** Valider les fichiers null avant upload
  - FAIT : early reject si `!file` dans `documentsApi.upload()`

- [x] **5.7** Corriger la race condition du background sync apres logout
  - FAIT : double-check `storeRef.current.user` apres les requetes + guard dans setStore

- [x] **5.8** Stale closures dans log() et addNotif()
  - NON APPLICABLE : `storeRef.current` est synchronise via useEffect — pas de stale closure

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
