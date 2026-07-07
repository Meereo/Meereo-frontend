# Module Appels d'Offres

**Source :** Platform Bible · Tome 14.6 / PRD · Tome 6 / PRD · Extension Référentiel Documentaire

## Vision

Système officiel de recrutement des professionnels. Processus structuré pour sélectionner les partenaires les plus adaptés à chaque mission. Chaque AO rattaché à un projet ou une mission.

## Qui peut créer un AO ?

- **Client** : uniquement pour rechercher un Bureau d'Architecture (point d'entrée projet)
- **Coordinateur Technique** : pour Entreprise de Construction, Bureau d'Études Structure, Bureau d'Études Fluides, Architecte d'Intérieur

## Flow complet

```
1. CRÉATION
   Créateur renseigne : titre, mission concernée, contexte, description besoin,
   localisation, critères, documents consultation, date limite réponse
   → Attribution auto : identifiant unique, statut, chronologie, historique

2. DIFFUSION
   Workflow Engine identifie entreprises éligibles selon :
   catégorie, compétences, localisation, préférences
   → KAI peut suggérer des entreprises adaptées
   → État : Publié

3. RÉPONSE PROFESSIONNEL
   MEEREO prépare automatiquement le dossier depuis le Référentiel Documentaire :
   - Présentation entreprise
   - Documents administratifs (RCCM, attestations, assurances)
   - Certifications
   - Références / Portfolio
   - Page Professionnelle Publique
   → Professionnel peut ajouter/retirer/remplacer
   → KAI vérifie : documents obligatoires, expiration, cohérence
   → Aucun envoi sans validation explicite du professionnel

4. ÉVALUATION
   Créateur consulte vue comparative :
   - Page Pro, domaines expertise, Portfolio, références, certifications, documents, lettre de réponse
   → KAI produit analyse comparative argumentée (ne désigne jamais de gagnant)

5. ATTRIBUTION
   Professionnel sélectionné →
   - Acceptation candidature
   - Création/activation mission concernée
   - Intégration entreprise au Cockpit Projet
   - Création espaces communication
   - Mise à jour CRM
   - Notifications
   → Si pro non inscrit → invitation → rattachement auto après inscription

6. INTÉGRATION
   Coordinateur technique confirme l'intégration (jamais automatique)
   → Création permissions, accès, conversations mission, CRM intervenant, événements
```

## États de l'appel d'offres

```
Brouillon → En préparation → Publié → En cours de réponse → En évaluation → Attribué → Clôturé → Archivé
```

## Événements générés

- `TenderCreated`, `TenderPublished`, `TenderViewed`, `TenderAnswered`
- `TenderCompared`, `TenderAwarded`
- `ProfessionalIntegrated`, `MissionActivated`, `CRMUpdated`

## Règles métier

- Client recrute directement uniquement le Bureau d'Architecture
- Autres professionnels intégrés par coordinateur technique en concertation avec client
- Une entreprise ne peut répondre qu'aux AO de sa catégorie
- Toutes les invitations historisées
- Toutes les décisions tracées
- Pas de jonction projet sans validation du Workflow
