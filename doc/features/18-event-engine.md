# Event Engine (Moteur d'Événements)

**Source :** Platform Bible · Tome 14.9 / PRD · Extension Event Engine

## Vision

Système nerveux de MEEREO. Enregistre, distribue et historise tous les événements. Les modules ne communiquent pas directement entre eux : ils communiquent par événements.

## Structure d'un événement

Identifiant unique, type, module émetteur, utilisateur origine, date/heure, objet concerné, contexte (projet, mission, CRM), données complémentaires, niveau de priorité.

## Catégories d'événements

| Domaine | Événements |
|---------|-----------|
| Projet | ProjectCreated, ProjectUpdated, ProjectArchived, ProjectClosed |
| Mission | MissionCreated, MissionAccepted, MissionRejected, MissionCompleted |
| Documents | DocumentUploaded, DocumentUpdated, DocumentValidated, DocumentExpired |
| Communication | ConversationCreated, MessageSent, MessageRead |
| Appels d'offres | TenderCreated, TenderPublished, TenderAnswered, TenderAwarded |
| Marketplace | ProductAdded, OrderCreated, OrderValidated, OrderDelivered |
| CRM | RelationshipCreated, RelationshipUpdated, ContactCreated |
| Actifs | AssetCreated, AssetUpdated, AssetInstalled, AssetMaintained |
| Utilisateurs | UserRegistered, ProfessionalVerified, InvitationSent, InvitationAccepted |
| KAI | RecommendationGenerated, RiskDetected, ReminderGenerated, KnowledgeUpdated |

## Flow de diffusion

```
Action utilisateur/système
  → Événement créé (immuable)
  → Event Engine reçoit
  → Diffusion aux modules abonnés :
    Workflow Engine, Rules Engine, Communication Hub, Cockpits,
    CRM, Marketplace, Référentiel Documentaire, Notifications,
    Agenda, KAI, Journal d'Audit
  → Chaque module décide de l'action à réaliser

Exemple : DocumentUploaded
  → Référentiel Documentaire (indexation)
  → Workflow Engine (mise à jour état)
  → Notifications (informer utilisateurs)
  → KAI (analyse contenu)
  → Cockpit Projet (affichage)
  → Journal d'Audit (enregistrement)
```

## Niveaux de priorité

- **Information** : événement informatif
- **Important** : influence notifications et alertes
- **Critique** : KAI alerte, notifications prioritaires

## Règles métier

- Chaque événement possède un identifiant unique
- Un événement ne peut jamais être supprimé
- Les événements sont horodatés
- Conservés pour traçabilité complète
- Événements sensibles respectent confidentialité et permissions
- Les automatisations sont déclenchées par les événements (jamais codées dans les écrans)
