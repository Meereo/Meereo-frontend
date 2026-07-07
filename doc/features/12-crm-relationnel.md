# CRM Relationnel Intelligent

**Source :** PRD · Tome 11

## Vision

Système de gestion des relations professionnelles. Mémoire relationnelle de tout l'écosystème. Chaque collaboration = relation durable réutilisable dans de futurs projets.

## Création automatique

Aucune saisie manuelle. Le CRM est généré automatiquement par :
- Création projet
- Réponse à un AO
- Attribution mission
- Intégration intervenant
- Création conversation
- Commande Marketplace
- Validation livrable

## Les fiches CRM

Chaque relation possède une fiche avec :

- **Infos générales** : identité, catégorie, coordonnées, Page Pro, statut vérification
- **Historique projets** : projets réalisés ensemble, missions, dates, résultats, livrables
- **Historique communications** : messages, documents partagés, RDV, décisions
- **Historique AO** : reçus, remportés, perdus, invitations
- **Historique Marketplace** : commandes, devis, livraisons, fournisseurs

## Cycle de vie d'une relation

```
Premier contact → Qualification → Collaboration → Projet terminé → Collaboration récurrente → Partenaire privilégié
```

États calculés automatiquement à partir des interactions.

## Flow principal

```
Nouvelle collaboration sur un projet
  → Création auto fiches CRM (Client, Professionnel, Projet, Fournisseur)
  → Enrichissement automatique à chaque interaction

Consultation CRM :
  → Vision 360° : projets communs, missions, documents, commandes, échanges, actifs, garanties
  → Réseau professionnel : Client A → Architecte X → Entreprise Y → Bureau d'Études Z → Fournisseur W

Recherche partenaires :
  → KAI rappelle collaborations passées
  → Suggère professionnel ayant déjà travaillé avec l'entreprise
  → Identifie partenaires réguliers
  → Propose reprendre contact ancien client
  → Détecte opportunités collaboration
```

## Événements générés

- `RelationshipCreated`, `RelationshipUpdated`
- `ContactCreated`
- `ClientCreated`, `ProfessionalLinked`, `SupplierLinked`
- `MeetingCreated`

## Règles métier

- Aucune relation n'est supprimée (même projets archivés)
- Chaque entreprise ne voit que les infos auxquelles elle est autorisée
- Pas de partage de données confidentielles entre entreprises
- Infos affichées dépendent des droits d'accès, projet, règles métier
