# RAPPORT D'AUDIT — Features implémentées vs Documentation

**Date :** 2026-07-07
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
| ✅ Implémenté (complet ou quasi-complet) | 16 features |
| ⚠️ Partiellement implémenté | 8 features |
| ❌ Non implémenté | 4 features |

---

## Features IMPLÉMENTÉES

| # | Feature | Détails |
|---|---------|---------|
| 1 | **Inscription multi-rôle** | Onboarding wizard complet (pro/client/fournisseur), 10 étapes incluant logo, portfolio, équipe, produits |
| 2 | **Authentification** | JWT, email/mdp, vérification email, reset mdp, httpOnly cookies, rate limiting |
| 3 | **Cockpit Client** | Dashboard, projets, AO, offres, commandes, messages, documents, budget, décisions, paiements, contrats, fournisseurs, galerie, progression, paramètres (17 pages) |
| 4 | **Cockpit Professionnel** | Dashboard, projets, clients, messages, chantier, intervenants, paiements, marketplace, agenda, offres, bourse, documents, intégrations, paramètres, contrats, rapports, commandes, fournisseurs, finance, tasks, budget, planning, profil (20+ pages) |
| 5 | **Cockpit Fournisseur** | Dashboard, commandes, paiements, catalogue, stats, paramètres (7 pages) |
| 6 | **Création Projet** | Wizard complet avec phases (ESQUISSE → RECEPTION), budget, client, équipe, livraison, priorité, invitation architecte |
| 7 | **Gestion Projets** | CRUD, 8 phases strictes, progression, couleurs auto, multi-acteurs, clôture avec validation |
| 8 | **Appels d'Offres** | Création AO, publication (publique/restreinte), invitations ciblées, réponses avec prix/délai/technique/docs, acceptation/rejet, conversion en marché |
| 9 | **Messagerie / Communication Hub** | Socket.io temps réel, conversations groupe & directes, pièces jointes, indicateurs de frappe, statut lecture |
| 10 | **Documents** | Upload réel (stockage `/uploads/documents/`), types (plan, admin, CR, devis, PV, rapport, photo), visibilité (internal/client_visible/public), statut, approbation |
| 11 | **Annuaire Professionnels** | Recherche par nom/métier, filtres, profils publics |
| 12 | **Page Professionnelle Publique** | Profil complet (bio, portfolio, équipe, services, secteurs), URL publique `/pro?uuid=XXX` |
| 13 | **Notifications** | Temps réel (Socket.io), bell icon, panel, read/unread, 20+ types d'événements business |
| 14 | **CRM / Contacts** | Contacts (clients + intervenants), CRUD, types, filtrage |
| 15 | **Marketplace** | 13 catégories, produits, recherche, filtres, catalogue fournisseur, CRUD produits |
| 16 | **Agenda** | Événements calendrier, types (réunion, visite chantier), invitations, lié aux projets |
| 17 | **Tâches** | Kanban board, CRUD, assignation, commentaires, lié aux projets |
| 18 | **Finance / Budget** | Budgets, dépenses, factures, rapports financiers |
| 19 | **Paiements** | Machine d'état (8 états), escrow/jalons, preuve de paiement, rails (virement/carte/mobile money), litiges |
| 20 | **Commissions & Referral** | Calcul commissions, introductions, acceptation CGV |
| 21 | **Contrats / Marchés** | CRUD marchés, conversion AO→marché, suivi |
| 22 | **Rapports** | CRUD rapports |
| 23 | **Décisions** | CRUD décisions projet |
| 24 | **Permissions** | RBAC (7 rôles projet), matrice actions/visibilité par rôle, `permissions.js` centralisé |

---

## Comparaison détaillée — Feature par Feature

### 01 — Inscription & Cockpit ✅

**Doc :** 3 profils (Client, Pro, Fournisseur) avec génération auto du Cockpit.

**Code :** Les 3 sont implémentés. Onboarding en 10 étapes. Cockpits dédiés par rôle.

**Ce qui manque :**
- [ ] Workflow de vérification entreprise (upload docs admin → validation MEEREO → badge vérifié). Le badge existe en UI mais le workflow de validation admin n'est pas clair.

---

### 02 — Cockpit Client ✅

**Doc :** Dashboard, projets, AO, communication, documents, passeport numérique, paramètres.

**Code :** 17 pages client. Dashboard complet. Budget, paiements, décisions, galerie en bonus.

**Ce qui manque :**
- [ ] Widget Passeport Numérique (projets terminés)
- [ ] Widget Recommandations KAI

---

### 03 — Création Projet ✅

**Doc :** 4 parcours (recherche archi, archi connu, KAI, découverte).

**Code :** Wizard multi-étapes avec invitation architecte par email ou annuaire.

**Ce qui manque :**
- [ ] Parcours 3 "Accompagnement KAI" (recommandations auto d'architectes)
- [ ] Parcours 4 "Découverte" (mode préparatoire sans collaboration)
- [ ] Création auto d'un AO pour Bureau d'Architecture (parcours 1)

---

### 04 — Annuaire Professionnels ✅

**Doc :** Recherche, filtres, consultation profil, contact, invitation.

**Code :** `ProDirectory`, `ProSearch`, filtrage par métier.

**Ce qui manque :**
- [ ] Bouton "Inviter dans un projet" directement depuis l'annuaire
- [ ] Intégration KAI (suggestions selon type de projet)

---

### 05 — Page Professionnelle Publique ✅

**Doc :** Sections (en-tête, présentation, portfolio, équipe, certifications, avis, stats, coordonnées).

**Code :** Profil complet avec bio, portfolio, équipe, services, secteurs.

**Ce qui manque :**
- [ ] Section Certifications & Distinctions
- [ ] Section Avis clients (retours d'expérience vérifiés)
- [ ] Statistiques auto-calculées (taux réponse AO, délai moyen, etc.)
- [ ] URL propre SEO-friendly (`meereo.com/pro/raw-design` au lieu de `?uuid=`)

---

### 06 — Cockpit Professionnel ✅

**Doc :** ERP collaboratif avec tous les modules.

**Code :** 20+ pages. Très complet : projets, missions, AO, CRM, messagerie, marketplace, agenda, documents, finance, tâches, budget, planning.

**Ce qui manque :**
- [ ] Module KAI fonctionnel (analyse quotidienne, priorités du jour)

---

### 07 — Cockpit Projet ✅

**Doc :** Espace partagé avec onglets (aperçu, missions, docs, équipe).

**Code :** Vue projet avec onglets, chronologie, équipe, documents.

**Ce qui manque :**
- [ ] Chronologie officielle (timeline événementielle immuable du projet)
- [ ] Journal des décisions (marquage "Décision Projet")
- [ ] Messagerie dédiée par mission (conversation mission auto-créée)
- [ ] Vue adaptée par rôle (client voit différemment du coordinateur)

---

### 08 — Missions ⚠️ Partiel

**Doc :** 5 types de missions, jalons structurés, tâches par jalon, double validation.

**Code :** Les projets ont des phases (8 phases d'ESQUISSE à RECEPTION), mais le concept de "Mission" au sens MEEREO (entité séparée confiée à une entreprise) n'est pas clairement implémenté comme objet métier distinct.

**Ce qui manque :**
- [ ] Mission comme Business Object dédié (avec responsable, type, cycle de vie propre)
- [ ] 5 types de missions (Architecture, Structure, Fluides, Construction, Intérieur)
- [ ] Jalons structurés par mission avec tâches sous-jacentes
- [ ] Double validation (pro + client) pour clôture mission
- [ ] Invitation d'un pro → création auto mission → acceptation → permissions

---

### 09 — Appels d'Offres ✅

**Doc :** Création, diffusion, réponse auto-constituée, évaluation, attribution.

**Code :** AO complet avec workflow (OPEN→ATTRIBUTED), offres, invitations restreintes, conversion en marché.

**Ce qui manque :**
- [ ] Constitution automatique du dossier de réponse depuis le Référentiel Documentaire entreprise
- [ ] Vue comparative des candidatures
- [ ] Analyse KAI des candidatures
- [ ] Règle : client recrute uniquement Bureau d'Architecture, coordinateur recrute les autres

---

### 10 — Référentiel Documentaire ⚠️ Partiel

**Doc :** Référentiel centralisé par acteur (client, pro, fournisseur, projet), versionning, réutilisation cross-module.

**Code :** Upload/stockage réel, types, visibilité, lié au projet.

**Ce qui manque :**
- [ ] Référentiel Entreprise (docs admin réutilisables pour tous les AO)
- [ ] Versionning (historique des versions d'un document)
- [ ] Réutilisation cross-module (même doc référencé dans AO, projet, Page Pro)
- [ ] Alertes expiration (assurances, attestations)
- [ ] Recherche intelligente / langage naturel

---

### 11 — Communication Hub ✅

**Doc :** 5 types de conversations (libre, projet, mission, CRM, entreprise).

**Code :** Messagerie temps réel, conversations groupe & directes.

**Ce qui manque :**
- [ ] Création automatique conversation par projet/mission
- [ ] Conversations typées (libre vs projet vs mission vs CRM)
- [ ] KAI dans le chat (résumé, détection décisions, réponses auto configurables)
- [ ] Escalade KAI → humain

---

### 12 — CRM Relationnel ⚠️ Partiel

**Doc :** Auto-généré par les collaborations, historique projets/AO/Marketplace, réseau professionnel.

**Code :** CRUD contacts (clients + intervenants).

**Ce qui manque :**
- [ ] Création automatique depuis les événements métier (projet créé, mission attribuée, etc.)
- [ ] Historique projets communs, AO, commandes Marketplace
- [ ] Réseau professionnel (graphe de relations)
- [ ] Cycle de vie relation (Premier contact → Partenaire privilégié)
- [ ] Recommandations KAI

---

### 13 — Marketplace ⚠️ Partiel

**Doc :** Panier Projet lié à mission/jalon, cycle commande, traçabilité produit→bâtiment.

**Code :** Catalogue 13 catégories, produits, filtres, CRUD.

**Ce qui manque :**
- [ ] Panier Projet (chaque ligne reliée à mission/jalon)
- [ ] Cycle commande complet (brouillon → réceptionné → clôturé)
- [ ] Liaison produit → actif du bâtiment → Passeport Numérique
- [ ] Référentiel documentaire produit (fiches techniques, notices)

---

### 14 — Passeport Numérique ❌

**Doc :** Transformation du Cockpit Projet en mémoire du bâtiment à la clôture.

**Code :** Non implémenté.

**Ce qui manque :**
- [ ] Transformation Cockpit Projet → Passeport Numérique à la clôture
- [ ] Consultation actifs, garanties, documents, entreprises, historique
- [ ] Recherche intelligente dans le Passeport
- [ ] Transmission lors de la vente du bâtiment
- [ ] KAI : rappel garanties, retrouver entreprises, préparer rénovation

---

### 15 — Asset Engine ❌

**Doc :** Actifs physiques du bâtiment avec cycle de vie, garanties, maintenances.

**Code :** Non implémenté.

**Ce qui manque :**
- [ ] Business Object "Actif" (identifiant, catégorie, localisation, statut)
- [ ] Cycle de vie (Planifié → Installé → En exploitation → Remplacé → Archivé)
- [ ] Entreprises intervenantes par actif
- [ ] Matériaux avec traçabilité fabricant/fournisseur/garantie
- [ ] Maintenances historisées
- [ ] KAI : rappel garanties, maintenance préventive

---

### 16 — Moteur Permissions ✅

**Doc :** Permissions contextuelles (rôle × projet × mission × workflow).

**Code :** `permissions.js` avec RBAC à 7 rôles projet, matrice actions/visibilité.

**Ce qui manque :**
- [ ] Permissions dynamiques par état de workflow (mission terminée → docs non modifiables)
- [ ] Permissions temporaires (partage limité dans le temps)
- [ ] Héritage Projet → Mission → Jalon → Tâche

---

### 17 — Workflow Engine ⚠️ Implicite

**Doc :** Moteur centralisé avec états, transitions, préconditions, post-actions.

**Code :** Les projets ont des phases (8 phases), les AO ont des statuts, les paiements ont 8 états, `replacementWorkflow.js` existe — mais pas de Workflow Engine formel/centralisé.

**Ce qui manque :**
- [ ] Machine d'état centralisée et réutilisable
- [ ] Préconditions de transition vérifiées automatiquement
- [ ] Post-actions automatiques (création CRM, conversation, permissions)
- [ ] Historique des transitions (ancien état, nouvel état, date, utilisateur, justification)

---

### 18 — Event Engine ⚠️ Implicite

**Doc :** Système événementiel centralisé, tous les modules communiquent par événements.

**Code :** Les notifications sont déclenchées par des événements business (20+ types), Socket.io diffuse en temps réel — mais pas d'Event Engine formel.

**Ce qui manque :**
- [ ] Bus d'événements centralisé
- [ ] Événements immuables avec structure standard (id, type, émetteur, date, contexte)
- [ ] Journal d'audit exhaustif
- [ ] Modules abonnés aux événements (pattern pub/sub)

---

### 19 — Rules Engine ❌

**Doc :** Moteur centralisé des règles métier, évaluation + justification.

**Code :** Les règles sont dispersées dans le code (permissions.js, domain/, routes/).

**Ce qui manque :**
- [ ] Centralisation des règles métier dans un moteur dédié
- [ ] Justification des refus (règle + raison + actions pour débloquer)
- [ ] Versioning des règles

---

### 20 — KAI (Intelligence Artificielle) ⚠️ Partiel

**Doc :** Multi-agents, orchestration, 4 rôles, mémoire multi-niveau.

**Code :** Infrastructure présente : quotas (25/jour), souscription (standard/gold), conversations KAI, mémoire, `KaiAssistant.jsx`.

**Ce qui manque :**
- [ ] Intégration LLM réelle (OpenAI/Claude/etc.)
- [ ] Agents spécialisés (Projet, Documents, CRM, Marketplace, etc.)
- [ ] Recommandations contextuelles dans chaque module
- [ ] Analyse quotidienne des projets
- [ ] Résumé de conversations

---

### 21 — Knowledge Graph ❌

**Doc :** Mémoire relationnelle — nœuds (Business Objects) + relations entre eux.

**Code :** Non implémenté.

**Ce qui manque :**
- [ ] Graphe de relations entre objets métier
- [ ] Construction automatique à chaque événement
- [ ] Requêtes par relations (ex: "tous les bâtiments utilisant ce produit")
- [ ] Détection d'impacts (document remplacé → missions/actifs concernés)

---

### 22 — Digital Twin ❌

**Doc :** Représentation numérique vivante du bâtiment, construite progressivement.

**Code :** Non implémenté.

**Ce qui manque :**
- [ ] Jumeau Numérique créé automatiquement avec le projet
- [ ] Enrichissement continu (missions, documents, actifs, commandes)
- [ ] Versionnement (reconstitution état à une date donnée)
- [ ] Le Cockpit Projet comme visualisation du Jumeau

---

## Priorités recommandées

### P0 — Fondations manquantes critiques

| Priorité | Feature | Justification |
|----------|---------|---------------|
| P0.1 | **Missions comme Business Object** | Concept fondamental de MEEREO absent. Les phases projet existent mais les missions (entités confiées à des entreprises avec leur propre cycle de vie) ne sont pas modélisées. |
| P0.2 | **Workflow Engine centralisé** | Les workflows sont implicites/dispersés. Un moteur centralisé permettrait de gérer tous les cycles de vie de façon cohérente. |

### P1 — Features structurantes

| Priorité | Feature | Justification |
|----------|---------|---------------|
| P1.1 | **KAI — Intégration LLM** | L'infrastructure (quotas, conversations, mémoire) est prête, il manque le branchement à un LLM. |
| P1.2 | **Référentiel Documentaire Entreprise** | Documents admin réutilisables pour tous les AO. Évite les uploads répétitifs. |
| P1.3 | **Vérification Professionnel** | Workflow complet upload → validation → badge. Fondement de la confiance. |
| P1.4 | **CRM auto-généré** | Les fiches CRM doivent se créer automatiquement à chaque collaboration. |
| P1.5 | **Conversations typées** | Création auto conversation Projet/Mission. Socle de la collaboration. |

### P2 — Features avancées

| Priorité | Feature | Justification |
|----------|---------|---------------|
| P2.1 | **Passeport Numérique** | Valeur ajoutée post-projet, différenciation produit. |
| P2.2 | **Asset Engine** | Traçabilité des actifs physiques du bâtiment. |
| P2.3 | **Rules Engine** | Centralisation des règles pour cohérence cross-module. |
| P2.4 | **Event Engine formel** | Bus événementiel + journal d'audit pour traçabilité. |

### P3 — Features long terme

| Priorité | Feature | Justification |
|----------|---------|---------------|
| P3.1 | **Knowledge Graph** | Mémoire relationnelle pour KAI et recherche intelligente. |
| P3.2 | **Digital Twin** | Représentation consolidée du projet/bâtiment. |
| P3.3 | **Page Pro SEO-friendly** | URL propre + avis clients + stats auto-calculées. |
| P3.4 | **Marketplace avancé** | Panier Projet, cycle commande complet, liaison Passeport Numérique. |

---

## Checklist complète des manques

### Inscription & Cockpits
- [ ] Workflow vérification entreprise (upload → validation admin → badge)
- [ ] Widget Passeport Numérique dans Cockpit Client
- [ ] Widget Recommandations KAI dans Dashboard

### Création Projet
- [ ] Parcours 3 "Accompagnement KAI" (recommandations auto d'architectes)
- [ ] Parcours 4 "Découverte" (mode préparatoire)
- [ ] Création auto d'un AO pour Bureau d'Architecture (parcours 1)

### Annuaire & Page Pro
- [ ] Bouton "Inviter dans un projet" depuis l'annuaire
- [ ] KAI suggestions selon type de projet
- [ ] Section Certifications & Distinctions
- [ ] Section Avis clients vérifiés
- [ ] Statistiques auto-calculées
- [ ] URL SEO-friendly

### Missions
- [ ] Mission comme Business Object dédié
- [ ] 5 types de missions
- [ ] Jalons structurés par mission avec tâches
- [ ] Double validation clôture (pro + client)
- [ ] Invitation pro → création auto mission → acceptation → permissions

### Appels d'Offres
- [ ] Constitution auto dossier réponse depuis Référentiel
- [ ] Vue comparative candidatures
- [ ] Analyse KAI des candidatures
- [ ] Règle client recrute uniquement Bureau d'Architecture

### Cockpit Projet
- [ ] Chronologie événementielle immuable
- [ ] Journal des décisions
- [ ] Messagerie dédiée par mission
- [ ] Vue adaptée par rôle

### Documents
- [ ] Référentiel Entreprise centralisé
- [ ] Versionning
- [ ] Réutilisation cross-module
- [ ] Alertes expiration
- [ ] Recherche langage naturel

### Communication Hub
- [ ] Création auto conversation par projet/mission
- [ ] Conversations typées
- [ ] KAI dans le chat (résumé, détection décisions)
- [ ] Réponses auto KAI configurables
- [ ] Escalade KAI → humain

### CRM
- [ ] Création auto depuis événements métier
- [ ] Historique projets/AO/Marketplace
- [ ] Réseau professionnel (graphe)
- [ ] Cycle de vie relation
- [ ] Recommandations KAI

### Marketplace
- [ ] Panier Projet (lié à mission/jalon)
- [ ] Cycle commande complet
- [ ] Liaison produit → actif → Passeport Numérique
- [ ] Référentiel documentaire produit

### Moteurs Core
- [ ] Workflow Engine centralisé (machine d'état, préconditions, post-actions, historique)
- [ ] Event Engine formel (bus, événements immuables, journal d'audit, pub/sub)
- [ ] Rules Engine (centralisation, justification, versioning)
- [ ] Permissions dynamiques par état workflow
- [ ] Permissions temporaires
- [ ] Héritage permissions Projet → Mission → Jalon → Tâche

### KAI
- [ ] Intégration LLM réelle
- [ ] Agents spécialisés
- [ ] Recommandations contextuelles par module
- [ ] Analyse quotidienne des projets
- [ ] Résumé de conversations

### Features non implémentées
- [ ] Passeport Numérique du Bâtiment
- [ ] Asset Engine (actifs physiques)
- [ ] Knowledge Graph
- [ ] Digital Twin / Jumeau Numérique
