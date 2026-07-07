# Digital Twin (Jumeau Numérique)

**Source :** Platform Bible · Tome 18 / PRD · Extension Jumeau Numérique

## Vision

Représentation numérique vivante de chaque projet et bâtiment. Pas une simple maquette : la mémoire vivante du bâtiment depuis sa création jusqu'à sa fin de vie. Se construit progressivement.

## Cycle de vie

```
Phase 1 — Projet : infos générales, programme, acteurs, documents initiaux
Phase 2 — Conception : plans, études, variantes, validations
Phase 3 — Construction : missions, commandes, matériaux, produits, actifs, photos, contrôles, CR
Phase 4 — Réception : Passeport Numérique généré, garanties associées, DOE intégrés, équipements référencés
Phase 5 — Exploitation : maintenances, remplacements, interventions, nouveaux documents, nouvelles garanties
```

## Composants

- **Identité projet** : nom, client, coordinateur, localisation, type, objectifs, budget, dates
- **Cartographie intervenants** : qui participe, depuis quand, pourquoi, quelle mission, quels droits
- **Cartographie missions** : responsable, état, avancement %, prochain jalon, documents, livrables, alertes
- **Chronologie** : tous les événements importants (jamais supprimée)
- **Documents** : référencés (pas dupliqués), liens intelligents
- **Avancement** : calculé automatiquement (missions, jalons, validations, livrables)

## Flow

```
Création projet → Digital Twin créé automatiquement

Chaque événement enrichit le Jumeau :
  Mission acceptée → nouvel intervenant
  Document déposé → nouvelle référence
  Jalon terminé → mise à jour avancement + chronologie + indicateurs
  Commande Marketplace → association actif

Le Cockpit Projet = visualisation du Jumeau Numérique
  → Toutes infos affichées proviennent du Jumeau
  → Source unique de vérité pour l'état du projet

Clôture projet → Jumeau figé → archive consultable → réutilisable comme référence
```

## Versionnement

Chaque évolution importante = nouvelle version logique. Reconstitution possible de l'état exact à une date donnée (audit, litige, retour d'expérience).

## Règles métier

- Créé automatiquement lors de la création du projet
- Évolue sans interruption pendant toute la vie du bâtiment
- Aucune donnée supprimée (historisée si obsolète)
- Chaque élément relié à son historique et contexte
- KAI interroge le Jumeau pour comprendre le bâtiment
