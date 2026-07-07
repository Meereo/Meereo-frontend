# Méta-Architecture — La Carte d'Architecture de MEEREO

**Source :** Platform Bible · Volume 0 · Tome 0

## Vision

MEEREO est une plateforme multi-acteurs conçue comme un système d'exploitation métier pour le secteur du BTP. Son architecture repose sur une séparation claire entre cinq couches indépendantes mais coopérantes.

## Les cinq couches

### Couche 1 — L'Expérience
Points d'entrée des utilisateurs : Cockpit Client, Cockpit Professionnel, Cockpit Fournisseur, Cockpit Projet, Applications mobiles, APIs publiques, Portail public, Page Professionnelle Publique.

**Responsabilité :** présenter les informations et recueillir les actions. Ne contient aucune logique métier.

### Couche 2 — Les Capacités Métier
Domaines fonctionnels : Gestion de Projet, Appels d'Offres, CRM, Marketplace, Communication Hub, Référentiel Documentaire, Asset Management, Passeport Numérique.

**Responsabilité :** modéliser les capacités offertes. Ces domaines utilisent le MEEREO Core mais ne le remplacent pas.

### Couche 3 — Le MEEREO Core
Moteurs d'orchestration : Identity Engine, Permission Engine, Rules Engine, Workflow Engine, Event Engine, Automation Engine, Notification Engine, Search Engine, Audit Engine, AI Orchestrator.

**Responsabilité :** garantir la cohérence fonctionnelle. Aucune décision métier n'est prise en dehors du Core.

### Couche 4 — La Connaissance
Business Object Model, Ontologie Métier, Knowledge Graph, Digital Twin.

**Responsabilité :** organiser, relier et contextualiser les connaissances. Exploitée par KAI, les moteurs du Core et les modules métier.

### Couche 5 — Les Données
Données persistantes : projets, documents, utilisateurs, commandes, produits, actifs, historiques, événements.

**Responsabilité :** conserver les données de manière fiable, sécurisée et durable. Jamais consultées directement par les Cockpits.

## Flow principal

```
Utilisateur → Expérience → Capacités Métier → MEEREO Core → Connaissance → Données
```

Le flux remontant suit le chemin inverse. Chaque couche ne communique qu'avec les couches prévues.

## Rôle de KAI

KAI n'appartient à aucune couche métier. Elle agit comme un assistant transversal. Elle reçoit un contexte préparé par le MEEREO Core, exploite les connaissances autorisées, restitue des explications, recommandations ou propositions d'action. KAI ne contourne jamais les responsabilités des autres couches.

## Interdictions

- Un Cockpit ne peut pas accéder directement aux données
- Un module métier ne peut pas contourner le Core
- Un moteur ne peut pas modifier directement les interfaces
- KAI ne peut pas accéder directement aux données persistantes
- Aucune logique métier ne peut être dupliquée dans plusieurs couches
