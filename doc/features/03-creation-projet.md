# Création de Projet

**Source :** Platform Bible · Tome 14.3 / PRD · Tome 2 — Workflow Client

## Vision

Créer un projet initialise un environnement collaboratif complet : Projet, Cockpit Projet, premiers événements métier, contexte de travail, futures interactions entre acteurs.

## Prérequis

- Utilisateur connecté
- Compte Client actif
- Conditions d'utilisation acceptées

## Flow de création

```
1. Formulaire — Informations générales :
   - Nom du projet
   - Type de projet
   - Adresse / localisation
   - Ville
   - Pays
   - Description courte

2. Choix du mode d'accompagnement (4 options)

3. Validation → Récapitulatif → Confirmation

4. Création automatique :
   - Projet (identifiant unique)
   - Cockpit Projet
   - Journal d'Audit
   - Contexte du projet
   - Premiers événements
   - Permissions initiales
   - Chronologie du projet

5. Redirection vers Cockpit Projet
```

## Les 4 parcours d'accompagnement

### Option 1 — Je recherche un bureau d'architecture
```
Validation formulaire
  → Création projet
  → Création Cockpit Projet
  → Création appel d'offres réservé aux Bureau d'Architecture
  → État projet : "Recherche d'un Architecte"
  → Diffusion AO aux architectes de la zone géographique
  → KAI accompagne jusqu'à la sélection

Réponse architectes → tableau comparatif
  → Sélection par le client
  → Création Mission Architecture
  → Attribution rôle coordinateur technique
  → Création CRM Client + CRM Professionnel
  → Notifications
```

### Option 2 — J'ai déjà un bureau d'architecture
```
Saisie email du bureau d'architecture

Cas A — Compte existant :
  → Création projet + Cockpit
  → Envoi invitation
  → Création Mission Architecture en attente d'acceptation
  → Création CRM mutuels

Cas B — Pas inscrit :
  → Création projet
  → Envoi email d'invitation à créer un compte
  → État projet : "En attente de l'inscription de l'architecte"
  → Inscription architecte → rattachement automatique au projet
  → Activation Cockpit Projet + CRM + messagerie
```

### Option 3 — Accompagnement par KAI
```
Création projet immédiate
  → KAI analyse : nature, localisation, besoins
  → Proposition sélection de bureaux d'architecture
  → Client choisit (ou consulte annuaire)
  → Sélection → mêmes automatisations que parcours 1/2
```

### Option 4 — Découverte
```
Création projet uniquement (état préparatoire)
  → Client peut visiter annuaire, Pages Pro, préparer AO
  → Bouton "Créer mon projet" toujours visible
  → Transformation possible à tout moment
```

## Événements générés

- `ProjectCreated`
- `ProjectContextInitialized`
- `ProjectWorkspaceCreated`
- `ProjectTimelineCreated`
- `ProjectCockpitCreated`
- `TenderCreated` (si option 1)
- `ProfessionalInvitationSent` (si option 2)
- `ArchitectureMissionPrepared` (si option 2)
- `KAIAssistanceRequested` (si option 3)

## Règles métier

- Un projet appartient toujours à un client
- Un projet possède un identifiant unique
- Le Cockpit Projet est créé automatiquement
- Le choix du mode d'accompagnement conditionne uniquement le workflow de démarrage
- Le premier professionnel d'un projet est toujours un Bureau d'Architecture (V1)
- Toutes les étapes sont historisées
