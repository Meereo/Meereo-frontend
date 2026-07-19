# MEEREO — Statut des features

Derniere mise a jour : 2026-07-19

## Legendes
- OK = Implemente et fonctionnel
- PARTIEL = Infrastructure en place, fonctionnalite incomplete
- A FAIRE = Non implemente

---

## Features utilisateur

| # | Feature | Statut | Notes |
|---|---------|--------|-------|
| 01 | Inscription & cockpit auto | OK | 3 profils (client, pro, fournisseur), onboarding complet |
| 02 | Cockpit client | OK | Dashboard, projets, AO, documents, messagerie, budget |
| 03 | Creation de projet | OK | 4 parcours (recherche archi, archi connu, KAI, decouverte) |
| 04 | Annuaire professionnels | OK | Recherche, filtres metier, navigation vers profil |
| 05 | Page professionnelle publique | OK | Builder de page, stats auto, portfolio, avis clients |
| 06 | Cockpit professionnel | OK | 12 modules ERP (projets, missions, AO, CRM, docs...) |
| 07 | Cockpit projet | OK | Dashboard partage, chronologie, missions, documents |
| 08 | Missions | OK | 5 types, 9 statuts, jalons, double validation |
| 09 | Appels d'offres | OK | Creation, diffusion, reponse avec dossier, evaluation, attribution |
| 10 | Referentiel documentaire | OK | Versioning, expiration, categories, upload serveur |
| 11 | Communication hub | OK | 5 types de conversations, auto-creation, Socket.IO temps reel |
| 12 | CRM relationnel | OK | Auto-genere sur activite projet/mission/AO |
| 13 | Marketplace | OK | Catalogue, commandes liees projets, suivi lifecycle |

## Moteurs internes

| # | Feature | Statut | Notes |
|---|---------|--------|-------|
| 16 | Moteur de permissions | OK | 3 niveaux (role, mission, workflow), controle serveur |
| 17 | Workflow engine | OK | 6 machines d'etat (projet, mission, jalon, document, AO, offre) |
| 18 | Event engine | OK | Bus pub/sub, 33+ types, Socket.IO distribution |
| 19 | Rules engine | OK | 8 regles centrales, evaluation avec justification |
| 23 | MEEREO Core | OK | 11 moteurs, sequence de traitement standard |

## Features avancees

| # | Feature | Statut | Notes |
|---|---------|--------|-------|
| 20 | KAI (IA) | PARTIEL | Infrastructure (quota, subscription, UI) OK. LLM non connecte |
| 22 | Digital twin | PARTIEL | Cockpit projet sert de visualisation. Versioning formel a faire |
| 14 | Passeport numerique | A FAIRE | Spec retiree. Auto-cree a la cloture projet |
| 15 | Asset engine | A FAIRE | Spec retiree. Gestion cycle de vie, garanties |
| 21 | Knowledge graph | A FAIRE | Spec retiree. Mapping relations objets metier |

## Modules transversaux

| Module | Statut | Details |
|--------|--------|---------|
| Notifications | OK | Temps reel (Socket.IO) + persistees en DB, mark read/all |
| Upload fichiers | OK | Multer, 50MB, stockage disque, preview image/PDF |
| Reviews/Avis | OK | 1-5 etoiles multi-criteres, verification collaboration |
| Paiements | OK | Demandes, validation, historique, commissions |
| Suivi chantier | OK | Phases, taches, notes, intervenants, vue client |
| Verification RCCM | OK | Soumission pro, validation admin, badge vert |
| Invitation membres | OK | Workflow complet (envoi, acceptation, roles, notifs) |

## Corrections recentes (juillet 2026)

- Notifications : persistence read/all en DB
- Sidebar : badges rouges visibles, section active bleue
- Offres : affichage MOA (pas sa propre entreprise) pour les pros
- Marches : info MOA + nom projet resolus depuis relations
- Documents offres : upload reel serveur + preview image/PDF/autre
- Notes chantier : chargees depuis rapports a l'hydratation
- Annuaire pro : navigation corrigee (publicId au lieu de slug)
- Avis : affiches sur page pro meme sans page builder
- Intervenants : visibles cote client dans le suivi
- Serveur : notifications offre acceptee/refusee + marche cree
- Serveur : project-members filtre par projets utilisateur
- Serveur : markets enrichis avec projet + client
- Serveur : projects enrichis avec client name
