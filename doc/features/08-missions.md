# Organisation par Missions

**Source :** PRD · Principe Fondamental — Organisation des Projets par Missions / Prompt Architecture des Missions

## Vision

Un projet est structuré autour de missions clairement identifiées. Chaque mission = une étape métier avec son responsable, ses livrables, documents, historique et cycle de validation.

## Missions V1

| Mission | Responsable | Notes |
|---------|------------|-------|
| Conception Architecturale | Bureau d'Architecture | Créée automatiquement. Responsable = coordinateur technique |
| Études Structure | Bureau d'Études Structure | Créée par le coordinateur technique |
| Études Fluides | Bureau d'Études Fluides | Créée par le coordinateur technique |
| Construction | Entreprise de Construction | Créée par le coordinateur technique |
| Architecture d'Intérieur | Architecte d'Intérieur | Facultative, créée si nécessaire |

## Structure d'une mission

- Identifiant unique
- Responsable principal (une seule entreprise)
- Type de mission
- Statut
- Dates : création, début, fin prévisionnelle, clôture
- Livrables, documents, messagerie dédiée
- Journal d'activité, validations, tâches, commentaires

## Cycle de vie d'une mission

```
À créer
  → En attente d'un responsable
  → Invitation envoyée
  → Invitation acceptée
  → En préparation
  → En cours
  → En attente de validation
  → Validée
  → Terminée
  → Archivée
```

## Flow de création de mission

```
1. Coordinateur technique ouvre Cockpit Projet
2. Sélectionne "Ajouter une mission"
3. Choisit le type de mission
4. Recherche professionnel dans annuaire MEEREO ou saisie email
5. Si professionnel inscrit → envoi invitation
6. Si non inscrit → envoi email invitation MEEREO
7. Inscription terminée → affectation automatique à la mission
8. Professionnel accepte officiellement → intégration effective
```

## Automatisations à la création

```
Mission créée
  → Création dans le Cockpit Projet
  → Création droits d'accès
  → Création messagerie dédiée mission
  → Création relations CRM entre acteurs
  → Ajout à la chronologie projet
  → Notification utilisateurs concernés
  → Enregistrement événement dans journal
```

## Les jalons

Chaque mission est organisée en jalons (grandes étapes). Identiques pour toutes les entreprises d'une même catégorie.

**Exemple — Mission Construction :**
Préparation chantier → Terrassement → Fondations → Gros œuvre → Charpente → Couverture → Second œuvre → Finitions → Réception

Chaque jalon contient : tâches, documents, photos, commentaires, validations.
Les tâches appartiennent toujours à un jalon (jamais directement à une mission).

## Flow de progression

```
Professionnel termine un jalon → marque comme terminé
  → Mise à jour automatique avancement %
  → Alimentation historique
  → Mise à jour Cockpit Projet + Cockpit Client
  → Notification intervenants concernés
  → Recommandations KAI déclenchées
```

## Validation d'une mission

Double validation obligatoire :
```
Scénario A : Professionnel demande clôture → Client valide → état Terminée
Scénario B : Client demande clôture → Professionnel valide → état Terminée
```

Conservation : date demande, date validation, utilisateurs, commentaires.

## Autorité

- **Client** : propriétaire du projet
- **Bureau d'Architecture** : coordination technique, vision globale
- **Chaque professionnel** : responsable de sa mission uniquement
- Un professionnel ne peut pas modifier les missions d'un autre (sauf permissions spéciales)

## Événements générés

- `MissionCreated`, `MissionAssigned`, `MissionAccepted`, `MissionRejected`
- `MissionCompleted`, `MissionValidated`, `MissionReopened`, `MissionClosed`
- `MilestoneCompleted`, `MilestoneValidated`
- `InvitationSent`, `InvitationAccepted`, `InvitationDeclined`
