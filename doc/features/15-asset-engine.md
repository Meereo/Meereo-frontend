# Asset Engine (Moteur des Actifs du Bâtiment)

**Source :** PRD · Extension Asset Engine

## Vision

Mémoire technique permanente de l'ouvrage. Chaque actif = un composant réel identifiable du bâtiment. Le projet est temporaire, le bâtiment est permanent.

## Types d'actifs (exemples)

Fondations, Structure, Toiture, Façades, Menuiseries, Électricité, Plomberie, Climatisation, Ascenseurs, Production solaire, Groupe électrogène, Réseau incendie, Espaces verts, Mobilier fixe, Équipements techniques.

## Structure d'un actif

Identifiant unique, nom, catégorie, localisation dans le bâtiment, statut, date création, date installation, durée de vie estimée, historique complet. Rattaché à : bâtiment, projet d'origine, missions, jalons.

## Informations conservées par actif

- **Entreprises intervenantes** : responsable, mission, période, coordonnées, historique interventions
- **Matériaux** : fabricant, fournisseur, référence, quantité, date installation, garantie, doc technique
- **Documents** : plans, DOE, notices, certificats, PV, photos, vidéos, rapports (référencés, pas dupliqués)
- **Garanties** : date début, date expiration, entreprise garante, conditions, documents
- **Maintenances** : date, entreprise, description, pièces remplacées, photos, rapport

## Cycle de vie d'un actif

```
Planifié → En conception → En réalisation → Installé → Réceptionné → En exploitation → En maintenance → Rénové → Remplacé → Archivé
```

## Flow de création

```
1. Pendant la conception → coordinateur définit structure générale bâtiment
2. Pendant l'exécution → mission terminée → actifs créés/mis à jour automatiquement
3. Depuis Marketplace → produit installé et réceptionné → association à actif existant ou création nouveau

Vie de l'actif :
  → KAI surveille garanties (rappel échéance)
  → Maintenance préventive proposée
  → Notices techniques retrouvables instantanément
  → Entreprise installation identifiable
  → Professionnel ayant déjà travaillé sur cet actif recommandable
  → Préparation futur projet rénovation
```

## Recherche intelligente

- "Qui a installé les ascenseurs ?"
- "Affiche les garanties de la toiture."
- "Quels matériaux ont été utilisés pour la façade ?"
- "Quelle entreprise est intervenue sur la climatisation ?"

## Événements générés

- `AssetCreated`, `AssetUpdated`, `AssetInstalled`, `AssetMaintained`
