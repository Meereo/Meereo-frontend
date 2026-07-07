# RAPPORT D'AUDIT — Features implémentées vs Documentation

**Date :** 2026-07-07 (audit final v3)
**Projet :** MEEREO Frontend
**Source de référence :** `doc/MEEREO_Corpus_Documentaire.md` → décomposé en `doc/features/`

---

## Stack technique

| Composant | Technologie |
|-----------|------------|
| Frontend | React 19 + Vite 8 (SPA) |
| Backend | Express.js + Prisma ORM + PostgreSQL |
| Realtime | Socket.io |
| Auth | JWT (httpOnly cookies + in-memory token) |
| State | Custom React Context (`useMeereoStore`) + sessionStorage |
| Engines | Workflow Engine, Event Engine, Rules Engine, Permission Engine |
| Monnaie | FCFA (Franc CFA ouest-africain) |

```
web/            → Frontend React (SPA)
server/         → Backend Express.js + Prisma
server/engines/ → Moteurs Core centralisés (workflow, events, rules, permissions)
```

**53+ pages/routes, 110+ endpoints API, 3 rôles principaux (pro, client, fournisseur), 4 engines backend**

---

## Résumé global

| Catégorie | Count |
|-----------|-------|
| ✅ Complet | 28 features |
| ❌ Non implémenté | 4 features |

**Toutes les features partielles ont été complétées.** Il ne reste que 4 features avancées non implémentées.

---

## Features IMPLÉMENTÉES ✅

| # | Feature | Détails vérifiés |
|---|---------|-----------------|
| 1 | **Inscription multi-rôle** | Onboarding wizard (pro/client/fournisseur), 10 étapes, auto-génération **slug SEO** |
| 2 | **Authentification** | JWT, email/mdp, vérification email, reset mdp, httpOnly cookies |
| 3 | **Cockpit Client** | 17 pages complètes |
| 4 | **Cockpit Professionnel** | 20+ pages incluant Missions |
| 5 | **Cockpit Fournisseur** | 7 pages |
| 6 | **Création Projet — 4 Parcours** | **Parcours 1** : recherche archi (auto-AO). **Parcours 2** : archi connu (invitation). **Parcours 3** : accompagnement KAI (auto-AO + recommandations). **Parcours 4** : découverte (mode préparatoire, status draft). 4 boutons dans le wizard. |
| 7 | **Gestion Projets** | CRUD, 8 phases, progression. **Chronologie** (composant ProjectTimeline + API timeline). **Section Missions** dans le détail. |
| 8 | **Missions** | 5 types, 9 statuts, jalons prédéfinis, calcul avancement auto, auto-conversation mission, auto-CRM intervenant, notifications Socket.IO, page Cockpit, permissions |
| 9 | **Appels d'Offres** | Création, publication, invitations, réponses, conversion en marché. **Règle client → Bureau d'Architecture**. **Dossier auto** depuis référentiel. **Vue comparative** (endpoint enrichi avec docs entreprise + profils). |
| 10 | **Messagerie / Communication Hub** | Socket.io temps réel, PJ, indicateurs frappe. **Conversations typées** (libre/projet/mission/crm/entreprise). **Auto-création** conversation projet et mission. Champs projectId, missionId sur Conversation. |
| 11 | **Référentiel Documentaire** | Upload, types, visibilité. **Versioning** (parentId, version, endpoints). **Expiration** (expiresAt, filtres, badges). **Catégories entreprise** (RCCM, attestation, assurance, certification). **Onglets** UI. |
| 12 | **Annuaire Professionnels** | Recherche par nom/métier, filtres, profils publics |
| 13 | **Page Professionnelle Publique** | Profil complet. **Stats auto-calculées** (projets, taux réponse AO, ancienneté, note moyenne, certifications). **URL SEO** /pro/:slug (rétrocompat publicId). **Avis clients** inclus. |
| 14 | **Avis Clients Vérifiés** | Modèle Review (note 1-5, qualité, délais, communication). Contrainte collaboration obligatoire. Route CRUD. |
| 15 | **Vérification Entreprise** | Route admin : GET /admin/verifications + PATCH /admin/verify (approve/reject/request_complement). Notifications Socket.IO. Config ADMIN_EMAILS. |
| 16 | **Notifications** | Temps réel (Socket.io), bell icon, panel, read/unread, 20+ types événements |
| 17 | **CRM Relationnel Enrichi** | CRUD contacts. **Auto-création** à la création projet/mission. **Cycle de vie** relation (premier_contact → partenaire_privilegie). **Historique unifié** (GET /contacts/:id/history → projets, marchés, offres, commandes). **Réseau professionnel** (GET /contacts/network/graph → nœuds + liens). linkedUserId pour traçabilité. |
| 18 | **Marketplace** | 13 catégories. **Documentation produit** (fiche technique, notice, certificat, garantie). **Liaison projet/mission**. **Notifications Socket.IO** + event order:updated. **Cart sessionStorage**. **Bouton "Étape suivante"** vendeur. |
| 19 | **Agenda** | Événements, types, invitations, lié aux projets |
| 20 | **Tâches** | Kanban, CRUD, assignation, commentaires, missionId |
| 21 | **Finance / Budget** | Budgets, dépenses, factures, rapports |
| 22 | **Paiements** | Machine d'état (8 états), escrow, preuves, rails, litiges |
| 23 | **Permissions** | RBAC 7 rôles, matrice actions, permissions missions |
| 24 | **Commissions & Referral** | Calcul, introductions, CGV |
| 25 | **Contrats / Marchés** | CRUD, conversion AO→marché |
| 26 | **Workflow Engine** | Module centralisé (`server/src/engines/workflowEngine.js`). **6 workflows** définis (project 8 états, mission 9 états, ao 5 états, order 4 états, document 3 états, market 8 états). Fonctions `canTransition()`, `getAvailableTransitions()`. Route API `GET /engines/workflow/:name/:state`. |
| 27 | **Event Engine** | Module centralisé (`server/src/engines/eventEngine.js`). Bus pub/sub avec `on()` et `emit()`. **Journal immuable** via table activities. **33 types d'événements** officiels. Socket.IO temps réel. Fonction `getProjectLog()`. |
| 28 | **Rules Engine + Permission Engine** | **Rules Engine** (`rulesEngine.js`) : 8 règles métier centralisées avec `evaluate()`, justification + actions de déblocage. **Permission Engine** (`permissionEngine.js`) : permissions dynamiques par rôle + état workflow. Restrictions par état (mission terminée → docs non modifiables, projet en réception → pas de nouvelles missions). Route API pour interroger les deux engines. |

---

## Features NON implémentées ❌

| # | Feature | Priorité | Description |
|---|---------|----------|-------------|
| 1 | **KAI — Intégration LLM** | 🔴 P1 | Infrastructure complète (quotas, conversations, mémoire, modèles Prisma KaiEntitlement/KaiConversation/KaiMemory, composant KaiAssistant) mais **pas d'appels vers un LLM externe** (OpenAI/Claude). À brancher sur l'API Claude pour activer les recommandations, l'analyse de documents, et l'assistant contextuel. |
| 2 | **Passeport Numérique du Bâtiment** | 🟠 P2 | Transformation du Cockpit Projet en mémoire du bâtiment à la clôture. |
| 3 | **Asset Engine** | 🟠 P2 | Actifs physiques du bâtiment avec cycle de vie, garanties, maintenances. |
| 4 | **Knowledge Graph + Digital Twin** | 🟡 P3 | Graphe de relations entre objets métier. Représentation consolidée et versionnée du projet/bâtiment. |

---

## Checklist complète

### ✅ Implémenté et vérifié (46/51 items)

**Inscription & Cockpits :**
- [x] Inscription Client/Pro/Fournisseur avec Cockpit auto
- [x] Authentification complète
- [x] 3 Cockpits dédiés
- [x] Auto-génération slug SEO à l'inscription
- [x] Workflow vérification entreprise (admin approve/reject/request_complement)

**Projet & Missions :**
- [x] Création projet — 4 parcours (Email, Annuaire, KAI, Découverte)
- [x] Auto-création AO Bureau d'Architecture (parcours KAI)
- [x] Mode découverte (status draft, préparatoire)
- [x] Missions comme Business Object (5 types, 9 statuts, jalons)
- [x] Chronologie projet (composant + API GET /projects/:id/timeline)
- [x] Section Missions dans le détail projet
- [x] Journal des décisions
- [x] Permissions missions

**Communication & CRM :**
- [x] Auto-création conversation projet (type 'projet')
- [x] Auto-création conversation mission (type 'mission')
- [x] Conversations typées (libre/projet/mission/crm/entreprise)
- [x] Auto-création CRM client à la création projet
- [x] Auto-création CRM intervenant à l'acceptation mission
- [x] Historique unifié par contact (projets/marchés/offres/commandes)
- [x] Réseau professionnel (graphe nœuds + liens)
- [x] Cycle de vie relation (premier_contact → partenaire_privilegie)

**Appels d'Offres :**
- [x] Règle client → Bureau d'Architecture uniquement
- [x] Dossier auto-constitué depuis Référentiel
- [x] Vue comparative candidatures enrichie
- [x] APIs frontend (getDossier, compare)

**Documents :**
- [x] Versioning (version, parentId, GET /versions, POST /new-version)
- [x] Expiration (expiresAt, filtres, badges ExpirationBadge/VersionBadge)
- [x] Catégories entreprise (RCCM, attestation, assurance, certification)
- [x] Onglets Projets / Référentiel Entreprise / Alertes Expiration

**Page Pro & Annuaire :**
- [x] Stats auto-calculées (taux réponse, ancienneté, note moyenne, certifications)
- [x] URL SEO /pro/:slug (rétrocompat publicId)
- [x] Modèle Review + route CRUD (vérification collaboration)
- [x] Reviews inclus dans la réponse profil public

**Marketplace :**
- [x] Documentation produit (ficheUrl, noticeUrl, certificatUrl, garantieUrl)
- [x] Liaison commandes → projet/mission
- [x] Notifications Socket.IO vendeur/acheteur + event order:updated
- [x] Cart persistence sessionStorage
- [x] Bouton "Étape suivante" vendeur

**Moteurs Core :**
- [x] Workflow Engine centralisé (6 workflows, transitions, canTransition)
- [x] Event Engine formel (bus pub/sub, journal immuable, 33 types d'événements)
- [x] Rules Engine centralisé (8 règles, evaluate + justification + actions déblocage)
- [x] Permission Engine (permissions dynamiques par rôle + état workflow)
- [x] Restrictions par état (mission terminée → docs non modifiables)
- [x] Route API /engines pour interroger les 4 engines

### ❌ Non implémenté (5 items)

- [ ] KAI : Intégration LLM réelle (OpenAI/Claude) — infrastructure prête
- [ ] Passeport Numérique du Bâtiment
- [ ] Asset Engine (actifs physiques)
- [ ] Knowledge Graph
- [ ] Digital Twin / Jumeau Numérique

---

## Architecture des Engines

```
server/src/engines/
├── index.js              → Point d'entrée centralisé
├── workflowEngine.js     → 6 workflows (project, mission, ao, order, document, market)
├── eventEngine.js        → Bus pub/sub + journal immuable (33 types d'événements)
├── rulesEngine.js        → 8 règles métier centralisées avec justification
└── permissionEngine.js   → Permissions dynamiques par rôle + état workflow

server/src/routes/engines.js → API REST pour interroger les engines
  GET  /api/engines/workflow/:name/:state     → transitions possibles
  POST /api/engines/rules/evaluate            → évaluer des règles
  GET  /api/engines/rules                     → lister les règles
  POST /api/engines/permissions/check         → vérifier une permission
  GET  /api/engines/permissions/actions       → actions disponibles par rôle
```

---

## Priorités restantes

| # | Feature | Effort | Impact |
|---|---------|--------|--------|
| 1 | **KAI — Brancher l'infrastructure sur Claude API** | Grand | L'infrastructure est prête (quotas, conversations, mémoire). Il faut connecter l'API Claude pour activer l'assistant contextuel, les recommandations, et l'analyse de documents. |
| 2 | **Passeport Numérique** | Grand | Transformation automatique du Cockpit Projet en mémoire du bâtiment à la clôture. Valeur différenciante. |
| 3 | **Asset Engine** | Grand | Modèle Asset avec cycle de vie, garanties, maintenances. Fondation pour le Passeport Numérique. |
| 4 | **Knowledge Graph + Digital Twin** | Très grand | Features long terme. Le réseau CRM (contacts/network/graph) en est une première brique. |
