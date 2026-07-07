# MEEREO Core — Le Noyau de la Plateforme

**Source :** Platform Bible · Tomes 15, 16, 21, 22 / Constitution · Tome 20

## Vision

Noyau fonctionnel de la plateforme. Coordonne tous les moteurs, applique les règles métier, distribue les événements, orchestre les workflows, garantit la cohérence globale. Les modules visibles (Cockpits, Marketplace, CRM, etc.) ne contiennent aucune logique métier critique.

## Composition

| Moteur | Responsabilité |
|--------|---------------|
| Identity Engine | Authentification, session, contexte de sécurité |
| Permission Engine | Calcul dynamique des droits d'accès |
| Rules Engine | Vérification des règles métier |
| Workflow Engine | Pilotage des cycles de vie |
| Event Engine | Diffusion des événements |
| Automation Engine | Actions automatiques post-événements |
| Notification Engine | Centralisation notifications (qui, quand, quel canal) |
| Search Engine | Recherche globale (même moteur pour tous les Cockpits) |
| Knowledge Engine | Graphe de connaissances (relie projets, missions, docs, actifs, etc.) |
| Audit Engine | Historique officiel immuable |
| AI Orchestrator | Interface entre Core et KAI |

## Séquence de traitement standard

```
1. Réception demande (Cockpit, API, partenaire, automatisation, KAI, traitement planifié)
2. Identity Engine → vérification identité/session/sécurité
3. Permission Engine → droits d'accès vérifiés
4. Rules Engine → prérequis, contraintes, validations → Autorisé/Refusé
5. Workflow Engine → vérification transition, état actuel, états autorisés → application
6. Event Engine → publication événements
7. Automation Engine → actions automatiques (création mission, CRM, conversation, permissions, tâches)
8. Knowledge Graph → enrichissement relations
9. Digital Twin → enrichissement si applicable
10. Audit Engine → journalisation immuable
11. Notification Engine → identification destinataires, canaux, priorité
12. AI Orchestrator → KAI reçoit nouveau contexte, peut expliquer/résumer/proposer
13. Réponse → Cockpit/API/application
```

## Business Object Model

Tous les éléments = Business Objects avec structure commune :
- Identité (ID unique, type, référence)
- Propriétaire
- Cycle de vie (état, workflow, historique)
- Permissions (calculées dynamiquement)
- Historique (immuable)
- Relations (natives, vers autres objets)
- Documents (associés)
- Conversations (générables)
- Événements (produits)

## Principes fondamentaux (Constitution)

1. Le Projet est le centre de l'écosystème
2. Un seul référentiel par information (pas de duplication)
3. Règles métier centralisées dans le Rules Engine
4. Les workflows gouvernent les évolutions
5. Les événements sont la mémoire des actions (immuables)
6. Les décisions restent humaines (KAI ne décide jamais)
7. Les permissions sont contextuelles
8. Le Cockpit est une interface (pas de logique métier)
9. Les Business Objects sont le langage commun
10. Le Knowledge Graph est la mémoire relationnelle

## Interdictions

- Un moteur ne modifie jamais directement les données d'un autre moteur
- Aucun moteur ne contourne un autre moteur
- Aucune action critique ne contourne le noyau
- Pas de logique métier dans les Cockpits
