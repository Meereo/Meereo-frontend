# Passeport Numérique du Bâtiment

**Source :** PRD · Tome 7 / Platform Bible · Tome 18

## Vision

Mémoire officielle de l'ouvrage. Accompagne le bâtiment pendant toute sa durée de vie. Créé automatiquement à la clôture du projet. Le Cockpit Projet est transformé en Passeport Numérique.

## Création automatique

```
Projet clôturé
  → Cockpit Projet → transformation en Passeport Numérique
  → Historique conservé
  → Données figées mais consultables
  → Aucune action supplémentaire demandée au client
```

## Contenu

- **Informations générales** : nom, adresse, localisation, client, coordinateur technique, date livraison, type bâtiment, surface, description
- **Historique complet** : chronologie intégrale, décisions, validations, jalons, missions, entreprises, versions
- **Entreprises intervenantes** : nom, mission, période intervention, documents, coordonnées
- **Documents** : plans, DOE, PV, notices, garanties, photos, contrats, rapports, certificats
- **Matériaux** (si achetés via Marketplace) : fabricant, référence, date pose, entreprise installation, garantie, emplacement

## Flow de vie

```
Phase Projet → Jumeau Numérique se construit progressivement
  → Chaque mission, document, actif, commande enrichit le Jumeau

Clôture projet → Passeport Numérique généré
  → Actifs, garanties, documents, entreprises, historique consolidés
  → Passeport accessible depuis Cockpit Client

Vie du bâtiment :
  → Maintenances, remplacements, interventions ajoutées
  → Nouveaux documents, nouvelles garanties
  → Le bâtiment continue à vivre dans MEEREO

Recherche :
  "Qui a réalisé la toiture ?"
  "Quelle entreprise a installé les menuiseries ?"
  "Où se trouve la garantie des ascenseurs ?"
  → KAI répond depuis les données du Passeport

Transmission :
  Vente du bâtiment → transfert Passeport au nouveau propriétaire
  → Droits d'accès transférés selon règles plateforme
  → Historique conservé, continuité documentaire assurée
```

## KAI dans le Passeport

- Retrouver documents
- Rappeler garanties arrivant à échéance
- Retrouver entreprises intervenantes
- Recommander entreprise déjà impliquée
- Préparer futur projet de rénovation

## Règles métier

- Créé automatiquement à la clôture projet
- S'enrichit automatiquement tout au long de la vie du bâtiment
- Aucune donnée supprimée du Passeport (historisée si obsolète)
- Chaque élément relié à son historique et contexte
