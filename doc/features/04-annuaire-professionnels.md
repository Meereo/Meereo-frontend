# Annuaire des Professionnels

**Source :** Platform Bible · Tome 14.4

## Vision

Point de rencontre entre la demande (clients) et l'offre (professionnels). Connecté au CRM, Communication Hub, Appels d'Offres, Cockpit Projet et KAI.

## Catégories V1

- Bureau d'Architecture
- Entreprise de Construction
- Bureau d'Études Structure
- Bureau d'Études Fluides
- Architecte d'Intérieur

Les fournisseurs ont un espace distinct dans le Marketplace.

## Structure de l'écran

- **Barre de recherche** : nom, spécialité, localisation, mots-clés (instantanée)
- **Filtres** : catégorie, pays, ville, domaine expertise, entreprise vérifiée, disponibilité (future)
- **Résultats en cartes** : logo, nom, catégorie, localisation, description, badge vérifié, boutons Voir profil / Contacter / Inviter

## Flow principal

```
Client ouvre l'Annuaire
  → Recherche / Filtrage
  → Résultats affichés en cartes

Actions possibles :

1. Voir le profil → ouverture Page Professionnelle Publique
   → Consulter portfolio, références, équipe, certifications
   → Prendre contact ou inviter

2. Contacter → ouverture Communication Hub
   → Création conversation privée (contexte : "Prise de contact")
   → Notification à l'entreprise
   → KAI Entreprise peut : message d'accueil, réponses simples, proposer RDV, transférer

3. Inviter dans un projet
   → Liste des projets du client
   → Sélection du projet
   → Création invitation officielle + notification + événement métier + historique
   → Professionnel accepte/refuse → si accepte : déclenchement Workflow
```

## Intervention de KAI

- Suggérer des entreprises selon le type de projet
- Expliquer les compétences d'une entreprise
- Rappeler les collaborations déjà réalisées (CRM)
- Proposer des entreprises déjà dans le CRM du client
- Recommander la publication d'un AO si plusieurs profils adaptés

## Événements générés

- `ProfessionalSearchPerformed`
- `ProfessionalProfileOpened`
- `ProfessionalContactStarted`
- `ProfessionalInvited`
- `SearchFilterApplied`

## Règles métier

- Affiche uniquement les entreprises actives
- Une entreprise peut masquer certaines infos de sa Page Pro
- Les coordonnées sensibles ne sont jamais affichées sans accord
- Le client ne peut pas modifier les informations d'une entreprise
- Toutes les invitations sont historisées
