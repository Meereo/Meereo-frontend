# MEEREO COCKPIT — DOCUMENT DE SPÉCIFICATION PRODUIT (V1)

# 1. VISION GÉNÉRALE DU PRODUIT

## Nom du produit

MEEREO Cockpit

## Catégorie du produit

PropTech / ConstructionTech / SaaS , ERP de gestion immobilière et BTP

## Vision du produit

MEEREO Cockpit est une plateforme intelligente centralisée conçue pour piloter :

* les projets immobiliers,
* les opérations de construction,
* les finances chantier,
* les fournisseurs,
* les équipes,
* les clients,
* et les validations opérationnelles,

à partir d’un seul environnement numérique.

L’objectif principal est de remplacer les systèmes désorganisés actuellement utilisés dans le secteur :

* WhatsApp,
* fichiers Excel,
* appels téléphoniques,
* emails dispersés,
* documents papiers,
* reporting manuel,

par un système structuré, traçable et centralisé.

---

# 2. OBJECTIFS PRINCIPAUX DU PRODUIT

La plateforme doit permettre de :

1. Centraliser toutes les données projet
2. Réduire le chaos opérationnel
3. Améliorer le suivi financier
4. Améliorer la communication entre acteurs
5. Offrir de la transparence au client
6. Structurer les workflows chantier
7. Générer des reportings temps réel
8. Faciliter le pilotage multi-projets
9. Détecter les retards et anomalies
10. Intégrer l’intelligence artificielle dans la gestion opérationnelle

---

# 3. ACTEURS PRINCIPAUX DU SYSTÈME

# 3.1 SUPER ADMIN

Administrateur global de la plateforme.

## Permissions

* Créer des entreprises
* Supprimer des entreprises
* Gérer les abonnements
* Gérer tous les utilisateurs
* Accéder à tous les projets
* Accéder aux dashboards
* Accéder aux logs système
* Configurer les modules
* Gérer les permissions globales
* Activer/désactiver des fonctionnalités

---

# 3.2 ADMIN ENTREPRISE / DIRECTION

## Permissions

* Créer des projets
* Créer des équipes
* Créer des utilisateurs
* Assigner des rôles
* Accéder aux dashboards financiers
* Voir tous les projets entreprise
* Valider les budgets
* Valider les contrats fournisseurs
* Voir les indicateurs de rentabilité
* Voir les performances opérationnelles

---

# 3.3 CHEF DE PROJET

## Permissions

* Créer des tâches
* Assigner des tâches
* Mettre à jour l’avancement
* Ajouter des documents
* Créer des demandes fournisseurs
* Suivre les délais
* Générer des rapports
* Communiquer avec les clients
* Valider certaines étapes chantier

---

# 3.4 CONDUCTEUR DE TRAVAUX / INGÉNIEUR CHANTIER

## Permissions

* Mettre à jour l’avancement terrain
* Envoyer photos et vidéos
* Signaler incidents
* Signaler retards
* Valider exécution terrain
* Suivre consommation matériaux
* Recevoir tâches assignées

---

# 3.5 CLIENT

## Permissions

* Voir l’avancement du projet
* Voir les photos chantier
* Voir les documents validés
* Voir les devis approuvés
* Voir les échéanciers
* Voir les paiements
* Valider certaines étapes
* Envoyer des messages
* Recevoir des notifications

---

# 3.6 FOURNISSEUR / PRESTATAIRE

## Permissions

* Recevoir des demandes
* Soumettre des devis
* Voir les bons de commande
* Upload factures
* Suivre paiements
* Voir statut validations
* Répondre aux demandes opérationnelles

---

# 3.7 COMPTABILITÉ / FINANCE

## Permissions

* Gérer paiements
* Valider dépenses
* Voir budgets
* Générer rapports financiers
* Voir trésorerie projet
* Valider factures fournisseurs
* Voir historique financier

---

# 4. MODULES PRINCIPAUX DU PRODUIT

# 4.1 DASHBOARD GLOBAL

## Contenu

* Nombre de projets actifs
* Avancement global
* Retards critiques
* Budget consommé
* Factures en attente
* Activité récente
* Alertes IA
* KPI opérationnels

---

# 4.2 MODULE PROJETS

## Fonctionnalités

* Création projet
* Modification projet
* Assignation équipes
* Timeline projet
* Statut projet
* Milestones
* Documents associés
* Budget associé
* Historique actions

## États projet

* Brouillon
* En attente validation
* En cours
* Suspendu
* Terminé
* Livré

---

# 4.3 MODULE TÂCHES

## Fonctionnalités

* Créer tâches
* Assigner utilisateurs
* Ajouter deadline
* Ajouter priorité
* Ajouter commentaires
* Ajouter pièces jointes
* Suivre progression

## États tâche

* À faire
* En cours
* Bloqué
* En validation
* Terminé

---

# 4.4 MODULE DOCUMENTS

## Fonctionnalités

* Upload documents
* Classement dossiers
* Gestion versions
* Validation documents
* Signature numérique
* Historique modifications

---

# 4.5 MODULE FINANCE

## Fonctionnalités

* Gestion budgets
* Dépenses chantier
* Paiements fournisseurs
* Appels de fonds
* Prévisions financières
* Rentabilité projet
* Validation dépenses
* Historique financier

---

# 4.6 MODULE FOURNISSEURS

## Fonctionnalités

* Création fournisseurs
* Scoring fournisseurs
* Historique collaboration
* Demandes devis
* Validation devis
* Bons commande
* Suivi livraisons
* Suivi factures

---

# 4.7 MODULE CLIENT

## Fonctionnalités

* Dashboard client
* Timeline projet
* Notifications
* Galerie chantier
* Validation devis
* Historique paiements
* Documents client
* Communication entreprise

---

# 4.8 MODULE IA — KAI

## Fonctionnalités prévues

* Détection retards
* Analyse coûts
* Génération rapports
* Résumé activité chantier
* Alertes automatiques
* Recherche intelligente documents
* Suggestions opérationnelles
* Analyse risques projet

---

# 5. INTERACTIONS ENTRE ACTEURS

# Exemple interaction fournisseur

1. Chef projet crée demande achat
2. Fournisseur reçoit notification
3. Fournisseur soumet devis
4. Direction valide devis
5. Comptabilité valide paiement
6. Fournisseur livre matériaux
7. Conducteur travaux valide réception
8. Facture clôturée

---

# Exemple interaction client

1. Client reçoit devis
2. Client valide devis
3. Projet passe en exécution
4. Conducteur travaux upload avancement
5. Client reçoit notifications
6. Client valide milestone
7. Paiement débloqué

---

# 6. SUCCESS FLOWS PAR PROFIL

# 6.1 SUCCESS FLOW CLIENT

1. Création compte
2. Connexion plateforme
3. Accès dashboard projet
4. Consultation devis
5. Validation devis
6. Paiement acompte
7. Réception notifications chantier
8. Consultation avancement
9. Validation étapes clés
10. Réception projet final

---

# 6.2 SUCCESS FLOW CHEF DE PROJET

1. Création projet
2. Création planning
3. Assignation équipes
4. Création tâches
5. Gestion fournisseurs
6. Validation étapes
7. Génération reporting
8. Livraison projet

---

# 6.3 SUCCESS FLOW FOURNISSEUR

1. Réception demande
2. Soumission devis
3. Validation devis
4. Livraison
5. Upload facture
6. Validation paiement
7. Paiement effectué

---

# 6.4 SUCCESS FLOW CONDUCTEUR TRAVAUX

1. Réception tâches
2. Exécution terrain
3. Upload photos
4. Mise à jour avancement
5. Signalement incidents
6. Validation étape chantier

---

# 7. SYSTÈME DE NOTIFICATIONS

## Types notifications

* Retard projet
* Nouvelle tâche
* Validation requise
* Paiement reçu
* Facture rejetée
* Nouveau document
* Milestone validé
* Incident chantier
* Message reçu

---

# 8. GESTION DES PERMISSIONS

Le système doit fonctionner avec un modèle RBAC (Role Based Access Control).

Chaque utilisateur possède :

* un rôle,
* des permissions,
* des modules accessibles,
* des actions autorisées.

---

# 9. KPI PRINCIPAUX

## KPI Projet

* Avancement %
* Respect délais
* Budget consommé
* Nombre incidents
* Nombre tâches terminées

## KPI Finance

* Marge projet
* Dépenses totales
* Factures impayées
* Cashflow projet

## KPI Fournisseurs

* Temps livraison
* Taux conformité
* Retards livraison
* Score performance

---

# 10. ROADMAP PRODUIT

# MVP (Version 1)

* Authentification
* Gestion utilisateurs
* Gestion projets
* Gestion tâches
* Documents
* Dashboard
* Notifications
* Suivi avancement

---

# VERSION 2

* Finance avancée
* Fournisseurs
* Validation multi-niveaux
* Reporting avancé
* Application mobile

---

# VERSION 3

* IA KAI
* Analyse prédictive
* Automatisation workflows
* Intégration WhatsApp
* Intégration comptable
* API externe

---

# 11. OBJECTIF FINAL DU PRODUIT

Créer une infrastructure numérique intelligente permettant de piloter efficacement les opérations immobilières et construction en Afrique.

Le produit doit devenir :

* un cockpit opérationnel,
* un système de gestion centralisé,
* un outil de pilotage financier,
* un outil de transparence client,
* et un assistant intelligent de gestion chantier.