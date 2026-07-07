# RAPPORT D'AUDIT — Features implémentées vs Documentation

**Date :** 2026-07-07 (audit final)
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
| Monnaie | FCFA (Franc CFA ouest-africain) |

```
web/          → Frontend React (SPA)
server/       → Backend Express.js + Prisma
```

**53+ pages/routes, 100+ endpoints API, 3 rôles principaux (pro, client, fournisseur)**

---

## Résumé global

| Catégorie | Count |
|-----------|-------|
| ✅ Complet | 25 features |
| ⚠️ Partiel | 3 features |
| ❌ Non implémenté | 5 features |

---

## Features IMPLÉMENTÉES ✅

| # | Feature | Détails vérifiés |
|---|---------|-----------------|
| 1 | **Inscription multi-rôle** | Onboarding wizard (pro/client/fournisseur), 10 étapes, auto-génération **slug SEO** à l'inscription |
| 2 | **Authentification** | JWT, email/mdp, vérification email, reset mdp, httpOnly cookies |
| 3 | **Cockpit Client** | 17 pages : dashboard, projets, AO, offres, commandes, messages, documents, budget, décisions, paiements, contrats, fournisseurs, galerie, progression, paramètres |
| 4 | **Cockpit Professionnel** | 20+ pages incluant **Missions** dans le sidebar et le routing |
| 5 | **Cockpit Fournisseur** | Dashboard, commandes, paiements, catalogue, stats, paramètres (7 pages) |
| 6 | **Création Projet** | Wizard complet, 8 phases, invitation architecte. **Auto-création AO Bureau d'Architecture** si parcours recherche. |
| 7 | **Gestion Projets** | CRUD, 8 phases, progression, multi-acteurs, clôture. **Chronologie** (composant ProjectTimeline consommant l'API timeline). **Section Missions** dans le détail projet. |
| 8 | **Missions** | 5 types, 9 statuts, jalons prédéfinis, calcul avancement auto, auto-conversation mission, auto-CRM intervenant, notifications Socket.IO, page dédiée, permissions |
| 9 | **Appels d'Offres** | Création, publication, invitations, réponses, conversion en marché. **Règle client → Bureau d'Architecture**. **Endpoint dossier auto** depuis référentiel. **Vue comparative** (endpoint enrichi avec docs entreprise). |
| 10 | **Messagerie / Communication Hub** | Socket.io temps réel, PJ, indicateurs frappe. **Conversations typées** (libre/projet/mission/crm/entreprise). **Auto-création** conversation projet et mission. |
| 11 | **Référentiel Documentaire** | Upload, types, visibilité. **Versioning** (parentId, version, endpoints versions/new-version). **Expiration** (expiresAt, filtres, badges ExpirationBadge/VersionBadge). **Catégories entreprise** (RCCM, attestation, assurance, certification). **Onglets** Projets/Référentiel Entreprise/Alertes Expiration. |
| 12 | **Annuaire Professionnels** | Recherche par nom/métier, filtres, profils publics |
| 13 | **Page Professionnelle Publique** | Profil complet. **Stats auto-calculées** (projets, taux réponse AO, ancienneté, noteAvg, reviewsCount). **Certifications** servies par l'API. **URL SEO** /pro/:slug (rétrocompat publicId). **Avis clients** inclus dans la réponse API. |
| 14 | **Avis Clients Vérifiés** | Modèle Review (note 1-5, qualité, délais, communication, commentaire). Contrainte unique auteur+cible+projet. Vérification collaboration obligatoire. Route CRUD. |
| 15 | **Vérification Entreprise** | Route admin : `GET /admin/verifications` (pros non vérifiés + docs entreprise). `PATCH /admin/verify/:userId` (approve/reject/request_complement). Notifications Socket.IO au professionnel. Config via `ADMIN_EMAILS` env var. |
| 16 | **Notifications** | Temps réel (Socket.io), bell icon, panel, read/unread, 20+ types événements |
| 17 | **CRM / Contacts** | CRUD contacts. **Auto-création** CRM client à la création projet. **Auto-création** CRM intervenant à l'acceptation mission. |
| 18 | **Marketplace** | 13 catégories, produits, recherche, filtres. **Documentation produit** (fiche technique, notice, certificat, garantie, durée garantie). **Liaison projet/mission** sur commandes. **Notifications Socket.IO** vendeur/acheteur + event `order:updated`. **Cart sessionStorage**. **Bouton "Étape suivante"** vendeur. |
| 19 | **Agenda** | Événements calendrier, types, invitations, lié aux projets |
| 20 | **Tâches** | Kanban board, CRUD, assignation, commentaires, lié aux projets + missionId |
| 21 | **Finance / Budget** | Budgets, dépenses, factures, rapports financiers |
| 22 | **Paiements** | Machine d'état (8 états), escrow/jalons, preuve, rails, litiges |
| 23 | **Permissions** | RBAC (7 rôles projet), matrice actions/visibilité, permissions missions |
| 24 | **Commissions & Referral** | Calcul commissions, introductions, acceptation CGV |
| 25 | **Contrats / Marchés** | CRUD marchés, conversion AO→marché, suivi |

---

## Features PARTIELLEMENT implémentées ⚠️

| # | Feature | Ce qui existe | Ce qui manque |
|---|---------|--------------|---------------|
| 1 | **Création Projet parcours** | Parcours 1 (recherche archi + auto-AO), Parcours 2 (archi connu + invitation) | Parcours 3 (accompagnement KAI — recommandations architectes). Parcours 4 (découverte — mode préparatoire sans collaboration). |
| 2 | **CRM enrichi** | Auto-création contacts projet/mission. Statut contact. | Historique projets/AO/Marketplace par contact (vue unifiée). Réseau professionnel (graphe de relations). Cycle de vie relation (Premier contact → Partenaire privilégié). |
| 3 | **Moteurs Core** | Workflows implicites (phases projet, statuts mission/AO/paiement). Events via Socket.IO. Permissions RBAC. | Workflow Engine centralisé formel. Event Engine formel (bus + journal immuable). Rules Engine centralisé (évaluation + justification). Permissions dynamiques par état workflow. |

---

## Features NON implémentées ❌

| # | Feature | Priorité | Description |
|---|---------|----------|-------------|
| 1 | **KAI — Intelligence Artificielle** | 🔴 P1 | Infrastructure prête (quotas, conversations, mémoire, composant KaiAssistant) mais aucune intégration LLM réelle. Pas d'agents spécialisés. Pas de recommandations contextuelles. |
| 2 | **Passeport Numérique du Bâtiment** | 🟠 P2 | Transformation du Cockpit Projet en mémoire du bâtiment à la clôture. |
| 3 | **Asset Engine** | 🟠 P2 | Actifs physiques du bâtiment avec cycle de vie, garanties, maintenances. |
| 4 | **Knowledge Graph** | 🟡 P3 | Graphe de relations entre objets métier. |
| 5 | **Digital Twin** | 🟡 P3 | Représentation consolidée et versionnée du projet/bâtiment. |

---

## Checklist complète

### ✅ Implémenté et vérifié

**Inscription & Cockpits :**
- [x] Inscription Client/Pro/Fournisseur avec Cockpit auto
- [x] Authentification complète (JWT, email, reset)
- [x] 3 Cockpits dédiés (Client 17p, Pro 20+p, Fournisseur 7p)
- [x] Auto-génération slug SEO à l'inscription (`auth.js`)
- [x] Workflow vérification entreprise (admin/verifications + admin/verify avec approve/reject/request_complement)

**Projet & Missions :**
- [x] Création projet avec invitation architecte
- [x] Gestion projets (CRUD, 8 phases, progression)
- [x] Auto-création AO Bureau d'Architecture (parcours recherche)
- [x] Missions comme Business Object (5 types, 9 statuts, jalons prédéfinis)
- [x] Chronologie projet (composant ProjectTimeline + API GET /projects/:id/timeline)
- [x] Section Missions dans le détail projet
- [x] Journal des décisions (modèle Decision + route + UI)
- [x] Permissions missions (create, assign, advance, validate, archive)

**Communication & CRM :**
- [x] Auto-création conversation projet (type 'projet', projects.js)
- [x] Auto-création conversation mission (type 'mission', missions.js)
- [x] Conversations typées (libre/projet/mission/crm/entreprise)
- [x] Auto-création CRM client à la création projet
- [x] Auto-création CRM intervenant à l'acceptation mission
- [x] Socket helper onOrderUpdated/offOrderUpdated (socket.js)

**Appels d'Offres :**
- [x] Règle client → Bureau d'Architecture uniquement (aos.js)
- [x] Endpoint dossier auto-constitué (GET /aos/:id/dossier)
- [x] Vue comparative candidatures (GET /offers/compare/:aoId avec docs entreprise)
- [x] API frontend : getDossier, compare

**Documents :**
- [x] Versioning (version, parentId, GET /versions, POST /new-version)
- [x] Expiration (expiresAt, filtres expiring/expired)
- [x] Catégories entreprise (RCCM, attestation, assurance, certification, présentation, portfolio)
- [x] Composants ExpirationBadge + VersionBadge dans Documents.jsx
- [x] Onglets Projets / Référentiel Entreprise / Alertes Expiration
- [x] Tâches liées aux missions (missionId sur Task)
- [x] Documents liés aux missions (missionId sur Document)

**Page Pro & Annuaire :**
- [x] Stats auto-calculées (projets, taux réponse, ancienneté, noteAvg, reviewsCount, certifications)
- [x] URL SEO /pro/:slug (slug auto-généré, rétrocompat publicId)
- [x] Modèle Review (note 1-5, qualité, délais, communication, commentaire)
- [x] Route reviews (GET + POST avec vérification collaboration)
- [x] Reviews inclus dans la réponse API profil public

**Marketplace :**
- [x] Documentation produit (ficheUrl, noticeUrl, certificatUrl, garantieUrl, garantieDuree)
- [x] Liaison commandes → projet/mission (projectId, missionId sur Order)
- [x] Notifications Socket.IO vendeur/acheteur + event order:updated
- [x] Cart persistence sessionStorage (Marketplace.jsx)
- [x] Bouton "Étape suivante" vendeur (supplier/Orders.jsx)

### ⚠️ Reste à faire sur features existantes

- [ ] Parcours 3 Accompagnement KAI (recommandations architectes)
- [ ] Parcours 4 Découverte (mode préparatoire sans collaboration)
- [ ] Historique projets/AO/Marketplace par contact CRM (vue unifiée)
- [ ] Réseau professionnel CRM (graphe de relations)
- [ ] Cycle de vie relation CRM (Premier contact → Partenaire privilégié)
- [ ] Workflow Engine centralisé formel
- [ ] Event Engine formel (bus + journal immuable)
- [ ] Rules Engine centralisé (évaluation + justification)
- [ ] Permissions dynamiques par état workflow

### ❌ Non implémenté

- [ ] KAI : Intégration LLM réelle (OpenAI/Claude)
- [ ] KAI : Agents spécialisés (Projet, Documents, CRM, Marketplace)
- [ ] KAI : Recommandations contextuelles par module
- [ ] Passeport Numérique du Bâtiment (transformation post-projet)
- [ ] Asset Engine (actifs physiques avec cycle de vie, garanties, maintenances)
- [ ] Knowledge Graph (graphe de relations entre objets métier)
- [ ] Digital Twin / Jumeau Numérique (représentation consolidée versionnée)

---

## Priorités recommandées

### P1 — Impact immédiat

| # | Action | Effort |
|---|--------|--------|
| 1 | KAI — Intégration LLM (brancher l'infrastructure existante sur Claude/OpenAI) | Grand |
| 2 | Parcours 3 & 4 création projet (KAI recommandations + découverte) | Moyen |

### P2 — Features structurantes

| # | Action | Effort |
|---|--------|--------|
| 3 | Passeport Numérique du Bâtiment | Grand |
| 4 | Asset Engine | Grand |
| 5 | CRM enrichi (historique unifié, graphe, cycle de vie) | Moyen |

### P3 — Long terme

| # | Action | Effort |
|---|--------|--------|
| 6 | Knowledge Graph | Grand |
| 7 | Digital Twin | Grand |
| 8 | Workflow/Event/Rules Engine formels | Très grand |
