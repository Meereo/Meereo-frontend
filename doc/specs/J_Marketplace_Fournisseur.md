# J. MARKETPLACE & ESPACE FOURNISSEUR

> Retour au [sommaire](00_INDEX.md)

> **Comblé lors de l'audit v1.2.** Tout le module marchand (visible dans les menus « Catalogue / Commandes / Marketplace ») n'avait aucune exigence. Le fournisseur, jusqu'ici quasi absent du référentiel, y est traité.

---

## `MKT-01` — Catalogue produits du fournisseur
**Statut : CADRÉ — DÉVELOPPABLE**

**Vendeur unique : le fournisseur.** Ni le client, ni le professionnel ne vendent (cf. `SYS-02`). Le fournisseur gère son catalogue : ajout/édition/retrait de produits (nom, catégorie, prix FCFA, photo, description, **stock/quantité disponible — obligatoire**, mode de livraison). Le **premier produit** est créé à l'inscription (parcours fournisseur, `INS`) ; les suivants depuis l'espace fournisseur (`MKT-03`). Chaque produit apparaît dans la Marketplace (« MeereoShop »), consultée par clients **et** professionnels (acheteurs, `SYS-02`/E).

> **Stock obligatoire.** À chaque ajout de produit, le fournisseur **doit renseigner son stock**. Cette donnée est **vivante** : elle décrémente à chaque vente, alimente le badge « Stock limité », déclenche les alertes et analyses de KAi (`MKT-05`), et conditionne les ventes flash de déstockage.

### Catégories de produits (issues de l'état réel « MeereoShop »)

Matériaux & corps d'état : **Gros Œuvre · Structure & Charpente · Menuiseries · Revêtements · Plomberie & CVC · Électricité · Green & Énergie**. Mobilier & aménagement : **Mobilier Bureau · Mobilier Maison · Cuisine & SDB**. Extérieur : **Extérieur & Jardin**. La Marketplace vend donc **matériaux de construction, mobilier et équipements** (barre de recherche : « matériaux, mobilier, équipements »).

### Quota de produits (règle de monétisation)

Les **5 premiers produits** publiés sur la Marketplace sont **gratuits**. Au-delà, le fournisseur paie un **forfait par produit supplémentaire et par mois** (`FIN-03` Phase 2). **Aucun plafond** : plus le fournisseur publie, plus il paie. Le compteur de produits publiés est visible dans son espace (`MKT-03`).

**Facturation séparée (tranché).** Le **quota** et l'**abonnement fournisseur** sont deux lignes **distinctes**, facturées indépendamment — pas de paliers tout compris. Le fournisseur voit précisément ce qu'il paie pour quoi.

**Produit non payé — dépublication avec préavis (tranché).** Si le forfait d'un produit n'est pas réglé :
1. Le fournisseur reçoit une **alerte et des notifications quelques jours avant** l'échéance (`AVS-02`), lui laissant le temps de payer ou de retirer volontairement des produits.
2. À la date d'échéance, le produit est **dépublié le jour même** (retiré de la Marketplace).
3. Le produit reste **conservé dans l'espace du fournisseur** et redevient publiable dès régularisation — il n'est pas supprimé.

> **Implications UI :** afficher le quota consommé (ex. « 5/5 produits gratuits utilisés »), le coût du produit suivant, l'échéance de facturation, et un **compte à rebours visible** avant dépublication.

### Formulaire de création d'un produit (état réel)

**Identité produit :** nom*, **catégorie***, **unité** (unité, sac, m², tonne…), description.
**Prix & stock :** **prix en FCFA** — la valeur **0 signifie « sur devis »** — et **stock disponible** (quantité).
**Image produit :** JPG/PNG, recommandée pour la Marketplace.
**Publication Marketplace :** interrupteur **« Visible dans le Marketplace »**, plus deux options à cocher : **Sponsoriser** (`MKT-04`) et **Offre flash**. Ces deux options sont donc activées **au moment de la création/édition du produit**, pas depuis un module séparé.

> **Articulation avec le seuil global (`MKT-02`).** Le seuil de montant fixé par MEEREO reste la règle qui détermine paiement en ligne vs devis. Le champ « prix = 0 » est une **option du fournisseur** pour signaler d'emblée qu'un produit est **exclusivement sur devis**, quel que soit le seuil. Les deux mécanismes coexistent.

Le fournisseur peut créer des **promotions** sur ses produits : réduction (ex. « -20 % »), **ventes flash / offres limitées** (durée définie), mises en avant « Promo du mois ». **Enjeu stratégique :** les ventes flash sont un **moteur d'activité quotidien** de la Marketplace — les fournisseurs les utilisent en continu pour **écouler leur stock (déstockage)**, ce qui génère un flux de transactions récurrent (et donc de commission `FIN-03` et de trafic pour la pub `MKT-04`). Elles ne sont pas un simple gadget marketing mais un **levier central** du modèle. Gérées par le fournisseur depuis son espace (`MKT-03`), et suggérées par KAi quand un stock dort (`MKT-05`).

### Correction — blocs promotionnels conditionnels

**Bug actuel constaté :** la page Marketplace affiche des blocs « Promo du mois », « Stock limité », « Ventes Flash » **alors qu'il y a 0 produit et 0 fournisseur** (« Aucun produit disponible »). Ces blocs sont codés en dur et s'affichent à vide, ce qui fait « faux ». → **Les blocs promotionnels doivent être conditionnels** : n'apparaître que s'il existe de vrais produits/promotions correspondants. Sinon, afficher uniquement l'état vide.

> **Périmètre tranché (23/07/2026) : produits physiques uniquement.** La Marketplace vend des **matériaux, du mobilier et des équipements**. Les **services** (location, transport, main-d'œuvre) en sont **exclus** — ils relèvent du cycle appel d'offres / marché (`AOF-*`), pas de la vente de produits.
> **Dépendances :** premier matériau à l'inscription ; `MKT-02` (achat), `MKT-04` (sponsoring), `FIN-02` (paiement Mobile Money).

---

## `MKT-02` — Commande, paiement & livraison (Marketplace)
**Statut : CADRÉ — DÉVELOPPABLE**

### Achat — deux modes selon un seuil global

Un **client** ou un **professionnel** (acheteurs, `SYS-02`/E) commande depuis la Marketplace (panier, quantités). Le mode de règlement dépend d'un **seuil de montant fixé globalement par MEEREO** (unique pour toute la plateforme, pas par produit) :

- **En dessous du seuil → paiement Mobile Money** intégré (`FIN-02`), transaction réelle encaissée et tracée.
- **Au-dessus du seuil → devis + paiement hors plateforme** (contact fournisseur, règlement externe), cohérent avec la logique des gros flux déclaratifs (`FIN-01`/D10).

### Suivi de commande

Statuts visibles côté acheteur **et** fournisseur : **reçue → préparée → expédiée → livrée**. Le fournisseur fait avancer les statuts (`SYS-02`).

### Livraison — vision en deux temps

- **MVP (maintenant) :** **retrait sur place** ou **livraison au choix du fournisseur** (il définit ses modalités). Pas de logistique centralisée.
- **Cible (future, hors MVP) :** partenariat avec une **structure logistique** offrant : **suivi live** de la livraison des matériaux, **validation mobile de la livraison** (l'acheteur confirme la réception depuis son mobile), **signature sur la plateforme**, et **paiement séquestré (escrow)** libéré à la livraison confirmée.

> **Note sur l'escrow (cible).** Le séquestre de fonds jusqu'à livraison est un excellent mécanisme de confiance, mais il implique un **statut réglementaire** spécifique (gérer de l'argent d'autrui = souvent établissement de paiement agréé). Il nécessitera le **même type de partenaire réglementé** que le partenaire bancaire prévu pour les gros marchés. À traiter avec `FIN-01`/D10 (réactivation traçabilité) le moment venu.
> **Dépendances :** `FIN-02` (Mobile Money), `SYS-02` (qui achète/vend), `MKT-01`, `MKT-03`.

---

## `MKT-03` — Espace fournisseur (structure réelle)
**Statut : CADRÉ — DÉVELOPPABLE**

L'espace fournisseur est organisé en **quatre sections** de navigation :

- **ACTIVITÉ** — *Accueil* (tableau de bord).
- **MARKETPLACE** — *Mes produits* (catalogue, `MKT-01`, avec filtres Tous / Sponsorisés / Flash), *Boutique* (vue de la Marketplace côté vendeur), *Commandes* (`MKT-02`, filtres Toutes / En attente / En livraison / Livrées / Terminées).
- **FINANCE** — *Paiements* et *Performance* (voir ci-dessous).
- **COMPTE** — *Paramètres* (`SYS-06`).

### Module Paiements (fournisseur)

Suivi du chiffre d'affaires Marketplace : **encaissé**, **en attente**, **total commandes**, **méthodes de paiement** configurées. Filtres Tout / Payés / En cours / Annulés, avec **export**.

> **Important — l'argent ne transite pas par MEEREO** (`FIN-03` Phase 2) : le fournisseur configure ses propres moyens de réception (Orange Money, MTN MoMo, Wave, cf. `SYS-06`) et **reçoit directement** de l'acheteur. Ce module est un **suivi**, pas un compte de dépôt.

### Module Performance (fournisseur)

Statistiques d'activité : **produits actifs** (dont sponsorisés), **commandes** (dont en attente), **CA total**, **visibilité** (nombre de produits visibles sur le total). Alimente et complète les analyses de KAi (`MKT-05`).

> **Périmètre du fournisseur** strictement limité à la Marketplace : pas d'appels d'offres, pas d'avis, pas d'équipe (`SYS-02`/D).
> **Dépendances :** `MKT-01`, `MKT-02`, `MKT-04`, `MKT-05`, `FIN-03`, `SYS-02`, `SYS-06`.

---

## `MKT-04` — Produits sponsorisés (publicité Marketplace)
**Statut : CADRÉ — DÉVELOPPABLE**

Modèle de revenu : un fournisseur peut **payer pour mettre en avant** ses produits sur la Marketplace (« Produits sponsorisés », marqués **AD**). Constitue une source de revenu MEEREO distincte de l'abonnement KAi Pro (`FIN-02`).

### Règles (garde-fous de neutralité)

- Tout produit sponsorisé est **clairement identifié « AD »** / « Sponsorisé » (transparence acheteur) — déjà présent dans l'UI actuelle, à conserver.
- La publicité **ne doit jamais noyer les résultats organiques** : les produits sponsorisés sont limités en nombre/emplacement, les résultats de recherche restent majoritairement pertinents (pas « pay-to-win » total).
- Le paiement du sponsoring passe par Mobile Money (`FIN-02`) ou facturation dédiée (à préciser).
- **Ads uniquement sur la Marketplace** — cohérent avec le principe que MEEREO ne place pas de publicité intrusive dans les espaces de pilotage projet (cockpit, messagerie…).

> **À préciser :** modèle tarifaire (au clic ? au forfait ? à la durée ?), emplacements sponsorisables (bannière « Promo du mois », carrousel, top de recherche), plafond d'annonces par page.
> **Dépendances :** `MKT-01`, `MKT-03`, `FIN-02`, `SYS-02`.

---

## `MKT-05` — KAi : surveillance de stock & conseil commercial (fournisseur)
**Statut : CADRÉ — DÉVELOPPABLE**

KAi exploite la donnée de stock (`MKT-01`) et l'historique de ventes pour **assister activement le fournisseur** dans la gestion de son catalogue. Quatre fonctions :

1. **Alertes de stock.** KAi alerte en cas de **rupture** (stock à 0) et de **stock bas** (sous un seuil, défini par le fournisseur ou par défaut). Objectif : éviter les ruptures soudaines et les ventes manquées.
2. **Suggestion de vente flash.** Quand un **stock dort** (produit peu vendu, quantité immobilisée), KAi **propose une vente flash** de déstockage — reliant directement la donnée stock au moteur d'activité (`MKT-01` promotions).
3. **Prédiction des besoins.** À partir des **ventes passées**, KAi anticipe les besoins de réapprovisionnement (quels produits vont manquer, quand).
4. **Analyse des meilleures ventes.** KAi indique au fournisseur **les types de matériaux les plus vendus** de son stock, pour orienter ses achats et sa mise en avant.

> **Rôle de KAi ici : conseiller commercial du fournisseur**, pas seulement surveillant. Cohérent avec la vision KAi (assistant proactif). Ces analyses sont **privées au fournisseur** (elles n'exposent pas ses données aux autres rôles, `SYS-02`).
> **Dépendances :** `MKT-01` (stock, promotions), `MKT-02` (historique de ventes), `MKT-03` (espace fournisseur), spécification KAi.
