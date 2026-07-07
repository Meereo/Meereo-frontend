# Cockpit Projet

**Source :** PRD · Tome 4 / Platform Bible · Tome 14

## Vision

Coeur opérationnel de MEEREO. Chaque projet = un Cockpit unique partagé par tous les intervenants. Chaque utilisateur voit une interface adaptée à son rôle et ses droits. Le Cockpit représente le Jumeau Numérique du projet.

## Acteurs dans le Cockpit

### Client (Propriétaire)
Consulte avancement, valide livrables, communique, consulte documents autorisés, suit achats, accepte/refuse décisions. Ne coordonne pas techniquement.

### Coordinateur Technique (Bureau d'Architecture V1)
Crée missions, intègre professionnels, coordonne échanges, suit jalons, contrôle cohérence. Vue globale du Cockpit.

### Professionnels
Accès limité : missions auxquelles ils participent, documents partagés, discussions concernées, validations de leur intervention.

## Structure

### Tableau de bord projet
Nom, statut, avancement % (auto-calculé), coordinateur, client, missions actives, jalons en cours, prochaines échéances, alertes KAI, dernières activités. Temps réel.

### Chronologie
Mémoire officielle du projet. Enregistrement automatique de chaque événement significatif. Aucun événement important ne peut être supprimé.

### Missions
Toutes les missions avec : responsable, statut, avancement, jalons, tâches, livrables, documents, validations, commentaires.

### Jalons
Grandes étapes de chaque mission. Terminé → validation → Workflow Engine → Jumeau Numérique → KAI.

### Documents
Centralisés, reliés au projet/mission/jalon/auteur/historique versions. Pas de doublons. Statuts : brouillon, partagé, en validation, validé, archivé.

### Collaboration
Messagerie dédiée par mission, espace commentaires, journal des décisions. Décisions marquées "Décision Projet" = références consultables.

## Flow principal

```
Ouverture projet
  → Chargement Cockpit (données temps réel du Jumeau Numérique)
  → Affichage tableau de bord + missions + chronologie

Gestion mission :
  → Coordinateur crée mission → choisit type → recherche professionnel
  → Invitation envoyée → acceptation → création permissions, conversation, CRM, tâches
  → Professionnel travaille : jalons, livrables, documents

Progression jalon :
  → Professionnel termine jalon → demande validation
  → Client/coordinateur valide
  → Workflow Engine → mise à jour état mission
  → Jumeau Numérique actualisé
  → KAI analyse impacts

Collaboration :
  → Échanges dans messagerie mission
  → Décisions marquées → journal officiel
  → Documents partagés contextuellement
```

## Événements générés

- `ProjectOpened`, `ProjectUpdated`, `ProjectClosed`
- `MissionCreated`, `MissionAccepted`, `MissionCompleted`
- `MilestoneCompleted`, `MilestoneValidated`
- `DocumentUploaded`, `DocumentValidated`
- `DecisionRecorded`

## KAI dans le Cockpit

- Détecter mission manquante
- Signaler document absent
- Rappeler validation en attente
- Recommander intégration nouveau professionnel
- Suggérer fournisseurs adaptés
- Rappeler obligations administratives
- Détecter incohérences
- Toutes recommandations contextualisées et expliquées
