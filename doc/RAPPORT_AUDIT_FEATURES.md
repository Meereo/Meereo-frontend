# RAPPORT D'AUDIT — Features implémentées vs Documentation

**Date :** 2026-07-07 (mis à jour)
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

### Architecture

```
web/          → Frontend React (SPA)
server/       → Backend Express.js + Prisma
```

**53+ pages/routes, 100+ endpoints API, 3 rôles principaux (pro, client, fournisseur)**

---

## Résumé global

| Catégorie | Count |
|-----------|-------|
| ✅ Complet | 21 features |
| ⚠️ Partiel | 9 features |
| ❌ Non implémenté | 6 features |

---

## Features IMPLÉMENTÉES ✅

| # | Feature | Détails |
|---|---------|---------|
| 1 | **Inscription multi-rôle** | Onboarding wizard complet (pro/client/fournisseur), 10 étapes |
| 2 | **Authentification** | JWT, email/mdp, vérification email, reset mdp, httpOnly cookies |
| 3 | **Cockpit Client** | Dashboard, projets, AO, offres, commandes, messages, documents, budget, décisions, paiements, contrats, fournisseurs, galerie, progression, paramètres (17 pages) |
| 4 | **Cockpit Professionnel** | Dashboard, projets, clients, messages, chantier, intervenants, paiements, marketplace, agenda, offres, bourse, documents, intégrations, paramètres, contrats, rapports, commandes, fournisseurs, finance, tasks, budget, planning, profil, **missions** (20+ pages) |
| 5 | **Cockpit Fournisseur** | Dashboard, commandes, paiements, catalogue, stats, paramètres (7 pages) |
| 6 | **Création Projet** | Wizard complet avec phases (ESQUISSE → RECEPTION), budget, client, équipe, invitation architecte. **Auto-création AO Bureau d'Architecture** si parcours recherche. |
| 7 | **Gestion Projets** | CRUD, 8 phases strictes, progression, multi-acteurs, clôture avec validation |
| 8 | **Missions** | **Modèle complet** : 5 types (Architecture, Structure, Fluides, Construction, Intérieur), 9 statuts, jalons prédéfinis par type, calcul avancement auto, auto-création conversation mission, auto-création CRM intervenant, notifications Socket.IO, page Cockpit dédiée |
| 9 | **Appels d'Offres** | Création AO, publication, invitations, réponses, acceptation/rejet, conversion en marché. **Règle client → Bureau d'Architecture uniquement**. **Endpoint dossier auto** depuis référentiel entreprise. |
| 10 | **Messagerie / Communication Hub** | Socket.io temps réel, conversations groupe & directes, PJ, indicateurs frappe. **Conversations typées** (libre/projet/mission/crm/entreprise). **Auto-création** conversation projet et mission. |
| 11 | **Référentiel Documentaire** | Upload réel, types, visibilité. **Versioning** (parentId + version). **Expiration** (expiresAt + filtres expiring/expired). **Catégories entreprise** (RCCM, attestation, assurance, certification, présentation, portfolio). Endpoint versions + new-version. |
| 12 | **Annuaire Professionnels** | Recherche par nom/métier, filtres, profils publics |
| 13 | **Page Professionnelle Publique** | Profil complet avec bio, portfolio, équipe, services. **Stats auto-calculées** (projets, taux réponse AO, ancienneté, certifications). |
| 14 | **Notifications** | Temps réel (Socket.io), bell icon, panel, read/unread, 20+ types événements |
| 15 | **CRM / Contacts** | Contacts clients + intervenants, CRUD. **Auto-création** à la création projet (CRM client) et à l'acceptation mission (CRM intervenant). |
| 16 | **Marketplace** | 13 catégories, produits, recherche, filtres, catalogue fournisseur. **Documentation produit** (fiche technique, notice, certificat, garantie). **Liaison projet/mission** sur commandes. **Notifications Socket.IO** vendeur/acheteur. **Tracking temps réel** order:updated. |
| 17 | **Agenda** | Événements calendrier, types, invitations, lié aux projets |
| 18 | **Tâches** | Kanban board, CRUD, assignation, commentaires, lié aux projets + **missionId** |
| 19 | **Finance / Budget** | Budgets, dépenses, factures, rapports financiers |
| 20 | **Paiements** | Machine d'état (8 états), escrow/jalons, preuve de paiement, rails, litiges |
| 21 | **Permissions** | RBAC (7 rôles projet), matrice actions/visibilité, permissions missions |

---

## Features PARTIELLEMENT implémentées ⚠️

| # | Feature | Ce qui existe | Ce qui manque |
|---|---------|--------------|---------------|
| 1 | **Cockpit Projet** | Timeline endpoint (events, missions, décisions, documents, marchés fusionnés), journal des décisions, messagerie par mission | Vue frontend exploitant la timeline API. Vue adaptée par rôle (client vs coordinateur vs pro). |
| 2 | **CRM enrichi** | Auto-création contacts à la création projet/mission. Statut contact (actif/prospect/inactif). | Historique projets/AO/Marketplace par contact. Réseau professionnel (graphe de relations). Cycle de vie relation (Premier contact → Partenaire privilégié). |
| 3 | **AO vue comparative** | Endpoint dossier auto-constitué. Règle client → architecte. | Vue frontend comparative des candidatures (tableau comparatif côte à côte). |
| 4 | **Page Pro complète** | Stats auto-calculées servies par l'API (taux réponse, ancienneté, certifications). | Section Certifications dans le frontend. Section Avis clients vérifiés (pas de modèle Review). URL SEO-friendly (/pro/slug au lieu de ?uuid=). |
| 5 | **Vérification entreprise** | Champ `verified` sur User. Badge affiché si vérifié. | Workflow complet : upload docs admin → admin review → validation → badge. Interface admin de vérification. |
| 6 | **Documents UI** | Backend complet (versioning, expiration, catégories). | Composants ExpirationBadge/VersionBadge à câbler dans Documents.jsx. Onglets Référentiel Entreprise / Alertes Expiration. |
| 7 | **Marketplace cart** | sessionStorage init dans Marketplace.jsx. | Sync useEffect pour persister le cart à chaque changement. Bouton "Étape suivante" supplier visible dans l'UI. |
| 8 | **Création Projet parcours** | Parcours 1 (recherche archi) avec auto-AO. Parcours 2 (archi connu) avec invitation. | Parcours 3 (accompagnement KAI — recommandations architectes). Parcours 4 (découverte — mode préparatoire). |
| 9 | **Moteurs Core** | Workflows implicites (phases projet, statuts mission/AO/paiement). Events via Socket.IO. Permissions RBAC. | Workflow Engine centralisé formel. Event Engine formel (bus + journal immuable). Rules Engine centralisé. Permissions dynamiques par état workflow. Permissions temporaires. |

---

## Features NON implémentées ❌

| # | Feature | Priorité | Description |
|---|---------|----------|-------------|
| 1 | **KAI — Intelligence Artificielle** | 🔴 P1 | Infrastructure prête (quotas, conversations, mémoire) mais aucune intégration LLM réelle. Pas d'agents spécialisés. Pas de recommandations contextuelles. |
| 2 | **Passeport Numérique du Bâtiment** | 🟠 P2 | Transformation du Cockpit Projet en mémoire du bâtiment à la clôture. Consultation actifs, garanties, entreprises, historique. |
| 3 | **Asset Engine** | 🟠 P2 | Actifs physiques du bâtiment avec cycle de vie, garanties, maintenances. |
| 4 | **Knowledge Graph** | 🟡 P3 | Graphe de relations entre objets métier. Construction automatique. |
| 5 | **Digital Twin** | 🟡 P3 | Représentation consolidée et versionnée du projet/bâtiment. |
| 6 | **Permissions temporaires** | 🟡 P3 | Partage de documents limité dans le temps, accès temporaire expert externe. |

---

## Checklist détaillée

### ✅ Fait

- [x] Inscription Client/Pro/Fournisseur avec Cockpit auto
- [x] Authentification complète (JWT, email, reset, social)
- [x] 3 Cockpits dédiés (Client 17p, Pro 20+p, Fournisseur 7p)
- [x] Création projet avec invitation architecte
- [x] Gestion projets (CRUD, 8 phases, progression)
- [x] Missions comme Business Object (5 types, 9 statuts, jalons prédéfinis)
- [x] Auto-création conversation à la création projet (type 'projet')
- [x] Auto-création conversation à l'acceptation mission (type 'mission')
- [x] Conversations typées (libre/projet/mission/crm/entreprise)
- [x] Auto-création CRM client à la création projet
- [x] Auto-création CRM intervenant à l'acceptation mission
- [x] Règle AO : client recrute uniquement Bureau d'Architecture
- [x] Endpoint dossier auto-constitué pour réponse AO
- [x] Timeline projet (événements, missions, décisions, documents, marchés)
- [x] Journal des décisions (modèle + route + UI)
- [x] Document versioning (version, parentId, endpoint versions/new-version)
- [x] Document expiration (expiresAt, filtres expiring/expired)
- [x] Document catégories entreprise (RCCM, attestation, assurance, certification)
- [x] Marketplace : documentation produit (fiche technique, notice, certificat, garantie)
- [x] Marketplace : liaison commandes → projet/mission (projectId, missionId)
- [x] Marketplace : notifications Socket.IO vendeur/acheteur + event order:updated
- [x] Stats Page Pro auto-calculées (projets, taux réponse AO, ancienneté, certifications)
- [x] Auto-création AO Bureau d'Architecture (parcours 1 recherche)
- [x] Permissions missions (create, assign, advance, validate, archive)
- [x] Tâches liées aux missions (missionId sur Task)
- [x] Documents liés aux missions (missionId sur Document)

### ⚠️ Reste à faire sur les features existantes

- [ ] Vue frontend exploitant l'API timeline du projet
- [ ] Vue comparative des candidatures AO (tableau côte à côte)
- [ ] Section Certifications & Distinctions dans le frontend Page Pro
- [ ] Section Avis clients vérifiés (nécessite modèle Review)
- [ ] URL SEO-friendly pour Page Pro (/pro/slug au lieu de ?uuid=)
- [ ] Workflow vérification entreprise (upload → admin review → badge)
- [ ] Composants ExpirationBadge/VersionBadge dans Documents.jsx UI
- [ ] Onglets Référentiel Entreprise / Alertes Expiration dans Documents.jsx UI
- [ ] Persistance cart Marketplace (useEffect sessionStorage sync)
- [ ] Bouton "Étape suivante" visible dans le supplier Orders UI
- [ ] Parcours 3 Accompagnement KAI (recommandations architectes)
- [ ] Parcours 4 Découverte (mode préparatoire sans collaboration)
- [ ] Historique projets/AO/Marketplace par contact CRM
- [ ] Réseau professionnel CRM (graphe de relations)
- [ ] Cycle de vie relation CRM (Premier contact → Partenaire privilégié)
- [ ] Vue adaptée par rôle dans le Cockpit Projet
- [ ] Widget Passeport Numérique dans Cockpit Client
- [ ] Widget Recommandations KAI dans Dashboard

### ❌ Non implémenté

- [ ] KAI : Intégration LLM réelle (OpenAI/Claude)
- [ ] KAI : Agents spécialisés (Projet, Documents, CRM, Marketplace)
- [ ] KAI : Recommandations contextuelles par module
- [ ] KAI : Analyse quotidienne des projets
- [ ] Passeport Numérique du Bâtiment (transformation post-projet)
- [ ] Asset Engine (actifs physiques avec cycle de vie, garanties, maintenances)
- [ ] Knowledge Graph (graphe de relations entre objets métier)
- [ ] Digital Twin / Jumeau Numérique (représentation consolidée versionnée)
- [ ] Workflow Engine centralisé formel
- [ ] Event Engine formel (bus + journal immuable)
- [ ] Rules Engine centralisé (évaluation + justification)
- [ ] Permissions dynamiques par état workflow
- [ ] Permissions temporaires (accès limité dans le temps)

---

## Priorités recommandées

### P1 — Impact immédiat

| # | Action | Effort |
|---|--------|--------|
| 1 | Câbler ExpirationBadge/VersionBadge + onglets dans Documents.jsx | Petit |
| 2 | Vue frontend timeline projet (composant chronologie) | Moyen |
| 3 | Vue comparative AO (tableau candidatures) | Moyen |
| 4 | Section Certifications dans Page Pro frontend | Petit |
| 5 | URL SEO /pro/:slug | Moyen |
| 6 | Workflow vérification entreprise | Moyen |

### P2 — Features structurantes

| # | Action | Effort |
|---|--------|--------|
| 7 | KAI — Intégration LLM | Grand |
| 8 | Passeport Numérique | Grand |
| 9 | Asset Engine | Grand |
| 10 | Modèle Review pour avis clients | Moyen |

### P3 — Long terme

| # | Action | Effort |
|---|--------|--------|
| 11 | Knowledge Graph | Grand |
| 12 | Digital Twin | Grand |
| 13 | Workflow/Event/Rules Engine formels | Très grand |
| 14 | CRM enrichi (graphe, cycle de vie) | Grand |
