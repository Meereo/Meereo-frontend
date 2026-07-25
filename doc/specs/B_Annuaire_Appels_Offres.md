# B. ANNUAIRE & APPELS D'OFFRES

> Retour au [sommaire](00_INDEX.md)

---

## `ANN-01` — Recherche des entreprises dans les appels d'offres privés
**Statut : À DÉVELOPPER**

Lors de la création d'un appel d'offres privé, l'utilisateur doit pouvoir rechercher rapidement les entreprises de l'annuaire par : **nom, mots-clés, spécialités, domaines d'expertise**. Résultats **instantanés**, ajout rapide d'une ou plusieurs entreprises.

---

## `ANN-02` — Affichage des entreprises dans les appels d'offres privés
**Statut : À CORRIGER**

Chaque entreprise listée doit présenter au minimum : **logo, nom, domaines d'expertise** (et si possible localisation, niveau de vérification).

**Bug actuel :** les logos ne s'affichent pas correctement, dans les appels d'offres privés **et** dans « Rechercher un professionnel ». À corriger dans les deux contextes.

> Manifestation locale du problème traité globalement en `QAL-02` (source unique du logo). À corriger via ce principe transverse, pas isolément.
> **Étoiles :** vérifier que les étoiles affichées sur les fiches sont bien reliées au système d'avis centralisé (`AVS-01`), non calculées localement.

---

## `ANN-03` — Refonte de la Bourse des appels d'offres
**Statut : À DÉVELOPPER**

Refonte de l'interface de la Bourse des appels d'offres :

- revoir **entièrement le design** (lisibilité, UX) ;
- améliorer la **visibilité** des appels d'offres disponibles ;
- ajouter une **notification visible** à côté de la rubrique lorsqu'un nouvel appel d'offres est publié.

> La notification s'appuie sur le système global de notifications (`AVS-02`).

---

## `ANN-04` — Performances de l'annuaire des professionnels
**Statut : À CORRIGER**

Temps de chargement trop élevé. Optimiser : ouverture des pages, chargement des profils/logos/images, recherches multicritères et filtres, pagination, appels API et requêtes base de données.

**Objectif :** affichage quasi instantané, même avec plusieurs milliers de professionnels.

---

## `ANN-05` — Compatibilité multi-navigateurs de l'annuaire
**Statut : À CORRIGER**

L'annuaire fonctionne sous Chrome mais dysfonctionne sous **Safari** (non-affichage, fonctionnalités inopérantes, composants mal chargés).

Analyser les écarts : JavaScript, CSS, WebKit, appels API, cache, composants React, gestion des événements, performances de rendu.

**Objectif :** fonctionnement identique sur **Safari, Chrome, Edge, Firefox**.
