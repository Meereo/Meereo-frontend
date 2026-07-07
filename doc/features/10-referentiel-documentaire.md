# Référentiel Documentaire Intelligent

**Source :** Platform Bible · Tome 14.7 / PRD · Extension Référentiel Documentaire / PRD · Extension Knowledge Graph

## Vision

Système officiel de gestion documentaire. Pas un espace de stockage : une base de connaissances vivante. Un document est chargé une seule fois puis référencé partout. Jamais dupliqué.

## Les référentiels

- **Référentiel Client** : titres propriété, programmes besoins, études, documents admin, contrats
- **Référentiel Professionnel** : RCCM, attestations, assurances, certifications, portfolio, présentations, brochures
- **Référentiel Fournisseur** : catalogues, fiches techniques, notices, garanties, certificats, visuels
- **Référentiel Projet** : créé auto avec chaque projet. Plans, maquettes, rapports, CR, devis, marchés, PV, DOE

## Structure d'un document

Identifiant unique, titre, description, catégorie, propriétaire, auteur, version, dates (création, modification), statut, langue, format, taille, niveau confidentialité, durée validité, date expiration.

## Flow principal

```
1. DÉPÔT
   Upload document → création fiche descriptive + métadonnées
   → KAI analyse automatiquement : type, auteur, entreprise, projet, mission, infos clés, mots-clés
   → Création liens avec autres éléments plateforme
   → Événement : DocumentUploaded

2. VERSIONNING
   Nouvelle version → historisée (auteur, date, commentaire)
   → Ancienne version conservée et accessible
   → Une seule version active

3. UTILISATION
   Document référencé (sans duplication) dans :
   AO, projets, missions, CRM, Page Pro, Marketplace, Passeport Numérique, actifs, réponses KAI

4. RECHERCHE
   Par titre, catégorie, type, auteur, projet, mission, entreprise, date, mots-clés
   → KAI : recherche langage naturel ("Retrouve le dernier plan structure validé pour Les Jardins")

5. AUTOMATISATIONS
   - Alerte avant expiration assurance
   - Demande renouvellement attestation
   - Ajout auto dans dossier AO
   - Association garantie à actif Passeport Numérique
   - Création tâche si validation nécessaire
```

## Permissions

Définis à plusieurs niveaux : propriétaire, entreprise, projet, mission, rôle utilisateur.
Droits par document : consulter, télécharger, commenter, modifier, valider, partager.
Hérités du contexte, affinables document par document.

## Événements générés

- `DocumentUploaded`, `DocumentUpdated`, `DocumentVersionCreated`
- `DocumentValidated`, `DocumentShared`
- `DocumentLinkedToProject`, `DocumentLinkedToMission`
- `DocumentExpired`, `DocumentRenewed`

## Règles métier

- Un document = un propriétaire unique
- Jamais dupliqué, uniquement des références
- Toutes les versions conservées
- Droits d'accès contrôlés avant chaque consultation
- Documents expirés signalés aux propriétaires
- Documents dans un AO liés à leur version au moment de la soumission (traçabilité)
