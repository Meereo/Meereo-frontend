# Marketplace Intelligent

**Source :** PRD · Tome 8

## Vision

Plateforme d'approvisionnement officielle des projets. Pas un e-commerce classique. Chaque achat relié à un projet, une mission, un jalon, une tâche. Contexte métier pour chaque produit.

## Acteurs

- **Fournisseurs** : créent catalogue, mettent à jour produits, caractéristiques, disponibilités, docs techniques, garanties
- **Professionnels** : recherchent produits, comparent, favoris, demandent devis, commandent, proposent au client
- **Client** : consulte produits sélectionnés, valide achats (si prévu dans workflow), suit commandes

## Catalogue Produits

Chaque produit : nom, catégorie, sous-catégorie, fabricant, fournisseur, description, photos, fiche technique, certifications, garantie, prix, unité vente, disponibilité, délai livraison, identifiant unique.

Référentiel documentaire produit : fiche technique, notice installation, certificat conformité, garantie, fiche environnementale, manuel utilisation, doc commerciale.

## Flow principal

```
1. RECHERCHE
   Professionnel recherche produits pour sa mission
   → KAI peut proposer produits adaptés au jalon en cours
   (ex: Mission Construction, Jalon Fondations → ciment, acier, coffrage, adjuvants)

2. PANIER PROJET
   Panier associé au projet (pas panier classique)
   Chaque ligne reliée à : mission, jalon, livrable
   → Le système sait POURQUOI un produit est acheté
   → Enrichit Jumeau Numérique et Passeport Numérique

3. COMMANDE
   Cycle de vie :
   Brouillon → Préparée → En attente validation → Confirmée
   → En cours de préparation → Expédiée → Livrée → Réceptionnée → Clôturée

4. RÉCEPTION
   Responsable : confirme réception, signale problème, ajoute photos, enregistre réserves
   → Si produit intégré à l'ouvrage → élément du Passeport Numérique

5. TRAÇABILITÉ
   Achat relié à : projet, mission, fournisseur, produit, responsable commande, date, documents
   → Retrouver à tout moment l'origine d'un produit dans un bâtiment
```

## Fournisseurs

Chaque fournisseur possède : Page Fournisseur Publique, catalogue, Référentiel Documentaire, CRM, historique commandes, historique collaborations.

## KAI dans le Marketplace

- Proposer produits compatibles avec la mission
- Rappeler matériaux déjà utilisés sur le projet
- Détecter incohérences produit/mission
- Recommander alternatives si indisponible
- Vérifier que docs techniques nécessaires sont disponibles
- N'impose jamais un fournisseur

## Événements générés

- `ProductAdded`, `OrderCreated`, `OrderConfirmed`
- `OrderValidated`, `OrderDelivered`, `OrderCancelled`
