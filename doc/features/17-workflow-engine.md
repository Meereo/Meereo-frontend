# Workflow Engine

**Source :** Platform Bible · Tomes 14.8, 21, 22 / PRD · Extension Workflow Engine

## Vision

Moteur d'orchestration de MEEREO. Pilote automatiquement l'évolution des projets, missions, documents, validations et processus collaboratifs. Aucun module ne modifie directement son propre état.

## Niveaux de workflow

### Workflow Projet
```
Brouillon → Créé → Recherche d'Architecte → Conception → Études → Construction → Réception → Clôturé → Passeport Numérique
```

### Workflow Mission
```
À créer → Responsable recherché → Invitation envoyée → Mission acceptée → Préparation → En cours → En attente validation → Validée → Terminée → Archivée
```

### Workflow Jalon
```
Non commencé → En cours → Terminé → En validation → Validé → Réouvert
```

### Workflow Document
```
Brouillon → Déposé → Partagé → En validation → Validé → Obsolète → Archivé
```

## Chaîne d'exécution (Modèle d'Exécution)

```
Commande (intention) → Permissions → Règles métier → Workflow → Décision (Acceptée/Refusée)
  → Événement (fait accompli, immuable)
  → Automatisations (conséquences)
  → Notifications
  → Mise à jour Knowledge Graph
  → Mise à jour Digital Twin (si applicable)
  → Actualisation Cockpits
  → Assistance KAI
```

## Flow de transition

```
1. Demande de transition (utilisateur, KAI proposition, automatisation, date, événement, validation)
2. Workflow Engine vérifie : transition demandée, état actuel, états autorisés
3. Rules Engine vérifie : prérequis, contraintes, validations obligatoires, dépendances
4. Si conditions remplies : transition appliquée
5. Événements publiés → Event Engine
6. Automatisations déclenchées (création mission, CRM, conversation, permissions, tâches)
7. Knowledge Graph enrichi
8. Digital Twin mis à jour
9. Audit Engine journalise
10. Notifications envoyées
11. KAI reçoit nouveau contexte
12. Réponse au Cockpit
```

## Conditions de transition (exemples)

- Projet ne peut pas entrer en "Construction" si architecte non intégré ou études non validées
- Mission ne peut pas être clôturée si tâches obligatoires incomplètes
- Document expiré ne peut pas être utilisé si document valide obligatoire

## Historique

Chaque transition enregistre : ancien état, nouvel état, date, utilisateur, justification, événements déclenchés. Traçabilité complète.

## KAI et Workflow

KAI ne pilote jamais directement les workflows. Elle peut :
- Expliquer un blocage
- Proposer une transition
- Identifier actions nécessaires
- Rappeler prérequis
- Anticiper un retard

## Événements générés

- `WorkflowStarted`, `WorkflowTransitionRequested`
- `WorkflowTransitionApproved`, `WorkflowTransitionRejected`
- `WorkflowCompleted`, `WorkflowCancelled`
