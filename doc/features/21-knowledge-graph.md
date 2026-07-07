# Knowledge Graph

**Source :** Platform Bible · Tome 17 / PRD · Extension Knowledge Graph

## Vision

Mémoire relationnelle de MEEREO. Représente les relations entre tous les objets métier. KAI raisonne à partir des liens, pas uniquement des données isolées.

## Nœuds

Chaque Business Object = un nœud : Projet, Mission, Entreprise, Client, Fournisseur, Produit, Commande, Document, Actif, Passeport Numérique, Conversation, Décision, Notification, Utilisateur.

## Relations (exemples)

- Projet EST_POSSÉDÉ_PAR Client
- Mission FAIT_PARTIE_DE Projet
- Document EST_ASSOCIÉ_À Mission
- Entreprise INTERVIENT_SUR Projet
- Produit EST_INSTALLÉ_DANS Actif
- Actif APPARTIENT_À Passeport Numérique
- Décision CONCERNE Mission

Relations historisées.

## Construction automatique

```
Événement important → enrichissement graphe

Exemple :
  Création projet → nœud Projet → relation Projet APPARTIENT_À Client
  Mission créée → nouvelle relation
  Entreprise intégrée → nouvelle relation
  Document ajouté → nouvelle relation
```

## Utilisation

- **KAI** : interroge le graphe pour comprendre contexte. Suit les relations pour construire réponses contextualisées.
- **Recherche** : retrouve par relations (ex: "Tous les bâtiments utilisant cette référence de climatiseur" → Produit → Actifs → Projets → Passeports)
- **Détection d'impacts** : document remplacé → identification immédiate des missions, actifs, commandes, validations, entreprises concernées
- **Workflow Engine** : modifie les relations
- **Rules Engine** : vérifie les relations
- **Event Engine** : alimente le graphe
- **Automation Engine** : crée certaines relations automatiquement
- **Notification Engine** : identifie acteurs concernés

## Sécurité

Le graphe respecte les permissions. Relations existent mais utilisateur ne peut consulter que les nœuds/liens autorisés. KAI applique les mêmes règles.

## Apprentissage

S'enrichit automatiquement par : nouveaux projets, missions, entreprises, documents, décisions, événements. Aucune mise à jour manuelle nécessaire.
