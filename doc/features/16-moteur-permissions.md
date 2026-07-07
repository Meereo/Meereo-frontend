# Moteur des Permissions

**Source :** PRD · Tome 5

## Vision

Permissions contextuelles calculées dynamiquement. Pas uniquement des profils utilisateurs. Le système analyse : qui, quel projet, quelle mission, quel état projet, quel état mission, quelle action.

## Les trois niveaux

### Niveau 1 — Le rôle
Client, Bureau d'Architecture, Entreprise de Construction, Bureau d'Études Structure, Bureau d'Études Fluides, Architecte d'Intérieur, Fournisseur.

### Niveau 2 — La mission
Une entreprise reçoit les droits correspondant à sa mission. Droits complémentaires possibles par le coordinateur technique.

### Niveau 3 — Le Workflow
Droits qui changent selon l'état du projet/mission. Ex: Mission terminée → documents consultables mais plus modifiables, validations verrouillées, livrables figés.

## Flow de calcul

```
Demande d'action
  → Utilisateur → Projet → Mission → Workflow → Action
  → Permission Engine calcule : Autorisé ou Refusé

Héritage :
  Projet → Mission → Jalon → Tâche
  (une tâche ne peut jamais donner plus de droits que sa mission)
```

## Permissions par objet

Chaque objet (Projet, Mission, Document, Jalon, Tâche, Message, CRM, Commande, AO) possède : lecture, création, modification, validation, archivage, suppression (très limitée).

## Cas particuliers

- **Coordinateur technique** : vision globale mais ne peut pas modifier les livrables techniques validés d'une autre entreprise
- **Client** : voit tout son projet mais ne peut pas modifier les livrables techniques. Peut valider, commenter, demander corrections, accepter, refuser.
- **Permissions temporaires** : partage document 48h, autoriser fournisseur à déposer, inviter expert externe. Expiration auto.

## Audit

Chaque refus historisé. Chaque autorisation exceptionnelle historisée. Chaque changement de permission historisé. Toujours possible d'expliquer pourquoi une action était autorisée ou interdite.

## KAI et permissions

KAI connaît les droits de chaque utilisateur. Adapte ses réponses. Ne propose jamais une action non autorisée. Peut expliquer pourquoi une action est refusée et orienter vers la personne habilitée.
