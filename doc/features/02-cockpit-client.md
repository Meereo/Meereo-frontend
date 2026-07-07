# Cockpit Client

**Source :** Platform Bible · Volume 3 · Tomes 14, 14.1, 14.2

## Vision

Le Cockpit Client est l'environnement de travail principal des clients. Créé automatiquement à l'inscription. Conçu pour piloter, suivre, décider et communiquer — pas pour produire des livrables techniques.

## Utilisateurs

Particuliers, investisseurs, promoteurs immobiliers, entreprises maîtres d'ouvrage, collectivités (futures versions). Un client = un seul Cockpit, plusieurs projets.

## Structure

### Tableau de bord (Dashboard)
Page d'accueil. Répond à 3 questions :
- Que se passe-t-il sur mes projets ?
- Quelles actions nécessitent mon intervention ?
- Que me recommande KAI ?

**Widgets :**
- Bonjour (message personnalisé KAI)
- Mes projets (actifs, terminés, nécessitant attention)
- Mes validations (livrables, missions, documents en attente)
- Activité récente (événements chronologiques)
- Communication Hub (messages non lus, dernières conversations)
- Appels d'offres (publiés, réponses, échéances)
- Recommandations KAI (professionnels, documents manquants, prochaine étape)
- Calendrier (visites, réunions, dates importantes)

### Mes Projets
Liste complète avec vue Cartes ou Liste. Chaque projet affiche : nom, référence, type, localisation, date création, dernière activité, coordinateur technique, statut, avancement %, missions, intervenants, documents, notifications.

**Filtres :** Tous, Actifs, Terminés, Archivés, Brouillons.
**Actions :** Ouvrir, Voir infos, Partager, Archiver, Consulter Passeport Numérique.

### Recherche de professionnels
Annuaire filtrable. Résultats avec logo, nom, spécialité, localisation, badge vérifié, boutons Contacter / Inviter / Consulter profil.

### Mes appels d'offres
États : en préparation, publiés, en cours de réponse, attribués, clôturés. Chaque AO relié à un projet.

### Communication Hub
Conversations classées : libres, Projet, Mission, CRM.

### Mes documents
Documents classés par projet, mission, catégorie, date. Permissions de lecture/téléchargement/commentaire.

### Passeport Numérique
Projets terminés → actifs, garanties, documents, entreprises, historique interventions, maintenances.

### Paramètres
Profil, coordonnées, notifications, sécurité, confidentialité, préférences KAI.

## Flow principal — Navigation

```
Connexion
  → Vérification identité + permissions + notifications + projets actifs
  → Chargement Dashboard (widgets indépendants, temps réel)
  → Navigation vers modules via menu latéral
  → Sélection projet → ouverture Cockpit Projet
```

## Événements générés

- `DashboardOpened`, `NotificationViewed`, `RecommendationOpened`
- `ProjectOpened`, `ProjectSearched`, `ProjectFiltered`, `ProjectArchived`, `ProjectCreated`
- `ConversationOpened`, `PassportOpened`

## Permissions

**Peut :** créer projet, consulter projets, consulter profils pro, envoyer messages, publier AO, consulter documents autorisés, consulter Passeport Numérique, valider certaines étapes.

**Ne peut pas :** modifier documents techniques pro, modifier missions attribuées, modifier infos admin d'une entreprise, intervenir sur paramètres internes d'une autre organisation.
