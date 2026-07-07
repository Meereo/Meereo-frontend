# Inscription et Création du Cockpit

**Source :** PRD · Extension — Création du Cockpit lors de l'inscription / PRD · Tome 2 — Workflow Client / PRD · Tome 3 — Le Professionnel

## Vision

Dès son inscription, l'utilisateur choisit son profil. Ce choix détermine automatiquement le Cockpit généré, les fonctionnalités disponibles, les workflows, les permissions et l'expérience utilisateur.

## Profils disponibles

### 1. Client
Destiné aux particuliers, investisseurs, promoteurs, entreprises maîtres d'ouvrage.

### 2. Professionnel
Catégories V1 : Bureau d'Architecture, Entreprise de Construction, Bureau d'Études Structure, Bureau d'Études Fluides, Architecte d'Intérieur.

### 3. Fournisseur
Destiné aux fabricants, distributeurs, négociants, fournisseurs de matériaux/mobilier/solutions Green.

## Flow d'inscription Client

```
1. Arrivée sur MEEREO (découverte libre : annuaire, Pages Pro, Marketplace)
2. Clic "Créer un compte" → choix profil "Client"
3. Formulaire : prénom, nom, email, téléphone, pays, ville, mot de passe
4. Vérifications : email unique, téléphone valide, mot de passe sécurisé
5. Création compte → email de vérification envoyé
6. Première connexion → assistant d'accueil (type projet, pays, ville, description, budget, date)
7. Génération automatique :
   - Cockpit Client
   - Profil client
   - Préférences utilisateur
   - Communication Hub
   - CRM Client
   - Notifications
   - Assistant KAI Client
```

## Flow d'inscription Professionnel

```
1. Clic "Créer un compte" → choix catégorie (Bureau d'Architecture, etc.)
2. Formulaire : prénom, nom, fonction, téléphone, email, mot de passe
3. Création compte → état "Profil incomplet"
4. Assistant de configuration entreprise :
   - Identification : raison sociale, nom commercial, catégorie, forme juridique
   - Coordonnées : pays, ville, adresse, téléphone, email, site web
   - Infos administratives : RCCM, numéro contribuable, CNPS, année création
   - Présentation : description, domaines expertise, zones intervention, langues
5. Dépôt documents officiels (RCCM, attestation fiscale, etc.)
   → état "En attente de vérification"
6. Validation MEEREO : Validé / Demande de complément / Refusé
7. Si validé → badge "Professionnel vérifié MEEREO"
8. Première connexion vérifiée → parcours personnalisation :
   - Logo, couleurs, photo de couverture
   - Présentation, compétences, zones d'intervention
   - Création Page Professionnelle Publique
9. Génération automatique :
   - Cockpit Professionnel
   - Page Professionnelle Publique
   - Référentiel Documentaire Entreprise
   - CRM Professionnel
   - Messagerie
   - KAI Professionnel
```

## Flow d'inscription Fournisseur

```
1. Clic "Créer un compte" → choix profil "Fournisseur"
2. Formulaire d'inscription
3. Génération automatique :
   - Cockpit Fournisseur
   - Catalogue produits
   - Référentiel Documentaire Fournisseur
   - CRM
   - Messagerie
   - KAI
```

## Événements générés

- `UserRegistered`
- `CockpitCreated`
- `ProfileCreated`
- `ProfessionalVerified` (si applicable)
- `ProfessionalPageCreated`

## Règles métier

- Un compte = un seul profil principal
- Un professionnel = une seule entreprise
- Catégorie professionnelle non modifiable sans validation admin
- Aucun professionnel non vérifié ne peut répondre à un appel d'offres ou être affecté à une mission
- Toute modification des infos juridiques déclenche une nouvelle vérification
