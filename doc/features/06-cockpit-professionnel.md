# Cockpit Professionnel

**Source :** PRD · Tome 3 Partie 3

## Vision

Centre de pilotage de chaque entreprise. Véritable ERP collaboratif spécialisé BTP. Le professionnel ne quitte jamais cet espace pour retrouver une information.

## Modules V1

### Tableau de bord
Résumé dynamique : projets actifs, missions, clients, partenaires, demandes en attente, AO disponibles, messages non lus, documents à valider, alertes, recommandations KAI.

### Mes Projets
Tous les projets auxquels participe l'entreprise. Cartes avec : nom, client, ville, statut, mission principale, avancement %, intervenants, dernière activité. Filtres : en cours, terminés, en attente, archivés, favoris.

### Mes Missions
Missions de l'entreprise avec : nom, projet associé, responsable, état, priorité, échéance, livrables, documents, historique. Vue : à démarrer, en cours, en attente, en validation, terminées.

### Appels d'offres
AO correspondant à la catégorie de l'entreprise uniquement. Type, client, localisation, date limite, budget, description, documents. Actions : répondre, poser question, favoris, partager en interne, archiver.

### CRM
Généré automatiquement. Chaque collaboration crée : fiche Client, Projet, Professionnel, Fournisseur. Historique, documents, messages, projets, notes internes, activités, opportunités.

### Messagerie
Deux niveaux : Messagerie Projet (créée auto par mission) et Messagerie Directe. Pièces jointes associées à la conversation.

### Documents
Classement automatique par projet, mission, entreprise. Catégories : plans, contrats, photos, rapports, factures, PV, livrables.

### Marketplace
Achat direct : matériaux, mobilier, équipements, solutions Green. Affectable à mission ou projet. Commandes historisées.

### Agenda
Échéances centralisées : réunions, visites chantier, dates limites, livraisons, réceptions, validation livrables.

### Notifications
Toutes enregistrées (non lue → lue → archivée). Jamais supprimées.

### KAI
Analyse quotidienne : projets, missions, retards, AO, clients, documents. Propose : priorités du jour, actions urgentes, missions bloquées, documents manquants, partenaires recommandés, matériaux adaptés, risques.

### Paramètres
Profil, logo, page publique, collaborateurs (futur), notifications, préférences, sécurité.

## Flow principal

```
Connexion → Tableau de bord (indicateurs temps réel)
  → Navigation modules via menu
  → Sélection projet → Cockpit Projet
  → Gestion missions → jalons, livrables, tâches
  → Réponse AO → dossier auto-constitué
  → Communication → messagerie contextuelle
```

## Règles métier

- Point d'entrée unique de toutes les activités
- Aucune donnée dupliquée entre modules
- Chaque info = une seule source de vérité
- Modifications projet → tous modules mis à jour automatiquement
- Statistiques en temps réel
- Toutes les actions importantes historisées
- Doit rester fluide même avec des centaines de projets actifs
