# H. SUIVI FINANCIER DE PROJET

> Retour au [sommaire](00_INDEX.md)

---

## `FIN-01` — Suivi financier de projet : Budget, Phases, Marchés, Paiements
**Statut : CADRÉ — DÉVELOPPABLE (2 sous-points à confirmer)**

> Remplace les anciens modules Budget / Missions / Actifs / Paiements par un modèle unifié, cadré avec MEEREO.

### Décisions de cadrage (socle du modèle)

- **D1 — Périmètre hybride, déclaratif d'abord.** Aucun argent ne transite par la plateforme dans cette version : paiements **déclarés**, pas exécutés. Modèle conçu pour accueillir plus tard un **paiement réel** (mobile money / banque) **sans refonte**.
- **D2 — Module « Actifs » SUPPRIMÉ.** Les composants physiques (fondation, structure, toiture…) sont **fusionnés** avec la **Phase**. Un seul concept : la **Phase**.
- **D3 — Budget global = plafond de référence unique** par projet, saisi par le client (pas un budget par phase).
- **D4 — Mission = marché validé** (`PRJ-01`). Objet unique.
- **D5 — Paiement = facture déclarée par phase**, imputée sur le budget global, marquée « reçue » par le pro, consultable par le client, cumulée dans un relevé.
- **D6 — Validation : client passif.** Le pro déclare la réception, le client consulte. Pas de double validation. *(Garde-fou : chaque paiement porte « déclaré par le professionnel le [date/heure] » côté client.)*
- **D7 — Montant par mission, imputé sur le plafond (modèle A).** À la création d'une mission, un **montant** est indiqué ; la **somme des missions** = l'**engagé**, imputé sur le budget global. Dépassement ⇒ **alerte** (non bloquante par défaut, cf. sous-point à confirmer).
- **D8 — Clôture de mission → activation de l'avancement.** Une mission **terminée** fait progresser automatiquement l'avancement de sa phase (cf. `PRJ-03`, `PRJ-07`).
- **D9 — MEEREO n'est pas un logiciel de comptabilité.** Registre de **traçabilité d'événements financiers**, jamais un ERP. Interdits : TVA, écritures, journaux, grand livre, plan comptable, charges/produits, comptes bancaires, rapprochements. Le budget est un **indicateur de pilotage**. Voir doctrine complète : `MEEREO_Doctrine_Flux_Financiers.md`.
- **D10 — Un flux financier = un événement du projet, pas un mouvement bancaire. Traçabilité proportionnée à la nature du flux (révisé v1.10).** MEEREO distingue désormais **deux natures de flux** :
  - **Flux intégrés (Mobile Money)** — abonnement **KAi Pro** (récurrent) et **petits achats Marketplace** : MEEREO encaisse réellement via Mobile Money. Ces transactions sont **tracées nativement** par le système de paiement (`FIN-02`).
  - **Flux déclaratifs (hors plateforme)** — gros paiements des marchés BTP : restent **hors plateforme** tant qu'aucun partenaire bancaire n'est intégré. Le professionnel **déclare** la réception (horodatée), sans que MEEREO ne touche l'argent.

  Au stade MVP, l'**historisation inaltérable complète** (chaque changement d'état conservé pour toujours) portée par le Passeport Numérique (`SYS-01`) est **reportée** : pour les flux déclaratifs, seule la déclaration horodatée est conservée, pas nécessairement l'historique de toutes ses modifications. La source unique de vérité (`QAL-02`) et le principe « un événement = une trace » restent la cible.

  > **À rouvrir avec le partenaire bancaire.** Le jour où les gros paiements passent par la plateforme, l'historisation inaltérable complète (D10 d'origine + `SYS-01`) devra être réactivée : c'est elle qui fait de MEEREO un « registre de preuve » et qui protège le garde-fou « client passif » (D6). Simplification assumée et **réversible** au stade actuel.
- **D11 — Confirmation « client passif » (maintenue, doctrine alignée).** Le professionnel déclare la réception ; le paiement est **acté immédiatement** sans action requise du client, avec trace horodatée « déclaré par le professionnel le [date] ». Le client est **notifié** et peut **contester** en cas d'erreur (branche de correction), mais son inaction ne bloque rien. *La doctrine fondatrice a été révisée en v1.1 pour retirer la double validation obligatoire et rester cohérente avec ce choix.*
- **D12 — Avancement des étapes ≠ paiement.** Le professionnel pilote **seul** l'avancement des étapes de travail (cocher une étape faite, cf. `PRJ-07`) : il n'attend **aucune validation du client** pour progresser sur le chantier. La validation croisée ne concerne **que** les paiements (et encore, en mode passif via contestation). Ne jamais coupler l'avancement technique à une validation financière.

### Corrections de nomenclature et de menu (issues de l'audit cockpit pro)

- **Fusion « Missions » + « Marchés » + « Contrats » en UN seul objet, libellé unique : « Marchés ».** Ces trois entrées du menu désignent le **même objet** (le marché validé = la mission, cf. D4). Elles créent une redondance qui rend le module illisible. → **Conserver uniquement « Marchés »** ; supprimer les entrées « Missions » et « Contrats ». Le « Budget › Mes contrats » doit pointer vers ce même objet unique « Marchés ». *(Terme retenu : « Marchés », car c'est l'objet contractuel signé dans le vocabulaire métier MEEREO ; « Mission » était ambigu avec « tâche ».)*
- **Suppression de « Actifs » du menu.** Résidu de l'ancien module supprimé en **D2** (fusionné dans « Phase »). L'entrée « Actifs » ne doit plus exister dans la navigation.

### Modèle de données

**Chaîne unique :** `Projet → Budget global (plafond) → Missions (montant, rattachées aux Phases) → Paiements (par phase)`. Budget = plafond ; missions = engagé ; paiements = payé ; restant = déduit.

1. **BUDGET** — montant global unique par projet, saisi par le **client**, rattaché au **projet**. Sert de **plafond**. Indicateurs affichés : **budget / engagé / payé / restant**.
2. **PHASE** *(ex-« Actif »)* — corps d'état / composant (fondation, structure, toiture, façade, menuiserie, électricité, plomberie, climatisation…). Sert **à la fois** au découpage de l'**avancement** (`PRJ-03`, `PRJ-07`) **et** des **décaissements/factures**. Porte : libellé, statut d'avancement, missions et paiements rattachés.
3. **MISSION** *(= marché validé, `PRJ-01`)* — objet identique au marché validé. **Porte un montant** (D7) imputé sur le plafond. Rattachable à une **phase**. À sa **clôture**, active l'avancement de la phase (D8). Suppression du bouton « Démarrer le marché » et de la section « Paiement et sécurisation » (cf. `PRJ-01`).
4. **PAIEMENT** — facture déclarée, rattachée à **une phase**, émise par le **professionnel** à chaque décaissement. Champs : montant, phase, date de déclaration, mode (banque/cash/autre), statut (« reçu »). Effet : dès « reçu », imputé sur le payé et visible côté client.

### Flux fonctionnel (bout en bout)

1. Le client saisit le **budget global** (plafond).
2. Le projet est découpé en **phases**.
3. Des **missions** sont créées (= marchés validés). Chaque mission reçoit un **montant** et est rattachée à une phase ; la somme = **engagé**. **Alerte** si engagé > plafond (D7).
4. Le pro exécute les phases (`PRJ-03`, `PRJ-07`).
5. Une **mission terminée** active l'avancement de sa phase (D8).
6. À chaque décaissement, le pro **émet une facture** rattachée à une phase (mode : banque/cash/autre).
7. Le pro **marque le paiement « reçu »**.
8. Le paiement s'affiche **côté client** (« déclaré par le professionnel le [date] ») et alimente le **payé**.
9. Le client consulte : **budget, engagé, payé, restant, détail par phase**.
10. En fin de projet : **relevé complet** (solde) de toutes les transactions déclarées.

### Transversalité Client ↔ Professionnel

Suivi **partagé et synchronisé** (cohérence `PRJ-10`) : le pro émet/déclare/gère les phases ; le client consulte budget/payé/restant/détail/relevé ; toute déclaration du pro est **répercutée immédiatement** côté client (`PRJ-10`, `QAL-01`).

### Vue « relevé financier » (livrable client)

Écran de synthèse : **budget global (plafond)** ; **engagé** (somme des missions) ; **payé** (paiements déclarés) ; **restant** (budget − payé, alerte si engagé > budget) ; **répartition par phase** (montant missions / payé / restant) ; **historique horodaté** de chaque paiement (montant, phase, mode, date).

### Extensibilité (préparation du paiement réel — D1)

Isoler « déclaration de paiement » de « exécution de paiement », afin qu'un futur module (mobile money / banque, contraintes UEMOA / BCEAO) remplace la déclaration manuelle par une transaction réelle **sans modifier** la structure Budget / Phases / Relevé.

### Sous-points tranchés (23/07/2026)

- **Liste des phases : FIXE.** Les phases de projet sont **imposées par MEEREO** et identiques pour tous les projets (Conception → Préparation → Gros Œuvre → Second Œuvre → Matériaux → Mobilier → Réception, cf. `PRJ-07`). Elles ne sont ni renommables ni modifiables par projet. *Avantage : comparabilité entre projets, cohérence des statistiques, simplicité du modèle de données.*
- **Dépassement de budget : ALERTE NON BLOQUANTE.** Un dépassement du budget global déclenche une **alerte visible**, mais **n'empêche jamais** la création d'un marché ou la poursuite du projet. Cohérent avec la doctrine : MEEREO **informe et trace**, il ne contrôle pas les décisions du client.

---

## `FIN-02` — Paiements intégrés Mobile Money (KAi Pro & Marketplace)
**Statut : CADRÉ — DÉVELOPPABLE**

MEEREO intègre un **vrai encaissement Mobile Money** pour deux usages précis, distincts des gros paiements de marché (qui restent déclaratifs, cf. `FIN-01`/D10).

### Périmètre (ce qui passe par Mobile Money)

- **Abonnement KAi Pro** — paiement **récurrent** (mensuel) donnant accès à la version Pro de l'assistant KAi. **Tarif différencié par rôle (acté) :**

  | Rôle | KAi Standard | KAi Pro |
  |---|---|---|
  | **Client** | Gratuit (25 analyses/mois) | **9 900 FCFA / mois** |
  | **Professionnel** | Gratuit (25 analyses/mois) | **19 900 FCFA / mois** |
  | **Fournisseur** | Gratuit (25 analyses/mois) | **39 000 FCFA / mois** |

  *Logique :* le prix suit la valeur générée — le client pilote un projet ponctuel, le professionnel l'utilise en continu sur ses chantiers, le fournisseur en tire une valeur commerciale directe (alertes stock, prédictions, suggestions de ventes flash, analyse des meilleures ventes — `MKT-05`).

- **Petits achats Marketplace** — règlement de commandes de faible montant sur la Marketplace (`MKT-02`), via Mobile Money.

### Ce qui NE passe PAS par Mobile Money (rappel)

- Les **gros paiements de marché** (client → entreprise, montants BTP) restent **hors plateforme** et **déclaratifs** (`FIN-01`/D5-D6, D10) tant qu'aucun **partenaire bancaire** n'est intégré. MEEREO ne touche pas cet argent.

### Règles

- Ces flux étant de **vraies transactions encaissées**, ils sont **tracés nativement** par le prestataire Mobile Money (référence de transaction, montant, date, statut) — la traçabilité y est donc assurée sans dépendre du Passeport Numérique retiré.
- Statuts de transaction : initiée → en attente → confirmée / échouée / remboursée.
- L'abonnement KAi Pro gère : souscription, renouvellement automatique, échec de paiement (relance/suspension), résiliation.
- Aucune logique comptable (cohérent doctrine `D9`) : MEEREO encaisse et trace, ne tient pas de comptabilité.

> **À préciser ultérieurement :** prestataire(s) Mobile Money retenu(s) (Orange Money, MTN MoMo, Wave, Moov…), tarifs KAi Pro, politique de remboursement Marketplace, gestion des échecs de paiement récurrents.
> **Dépendances :** `MKT-02` (commandes Marketplace), offre commerciale KAi, `SYS-02` (qui paie quoi).

---

## `FIN-03` — Monétisation Marketplace : commission & stratégie en 3 phases
**Statut : CADRÉ — DÉVELOPPABLE** (taux à définir)

**Modèle de revenu principal de MEEREO.** La monétisation de la Marketplace se déploie en **trois phases**, pour ne pas dépendre dès le lancement de partenariats lourds (banque/escrow, logistique). Les trois piliers de revenu — commission (`FIN-03`), publicité (`MKT-04`), abonnement KAi Pro (`FIN-02`) — s'activent progressivement.

### Phase 1 — Acquisition (gratuit, quelques mois)

Plateforme **gratuite, zéro commission** sur les ventes. Objectif unique : **construire le volume** (fournisseurs, produits, acheteurs). Le revenu accessoire existe déjà via la **publicité** (`MKT-04`) et l'**abonnement KAi Pro** (`FIN-02`), qui **ne dépendent pas** de l'escrow. « Gratuit » = zéro commission, pas zéro revenu.

### Phase 2 — Zéro commission, services vendus par MEEREO

**Contrainte réglementaire déterminante.** Encaisser l'argent d'un tiers exige un **agrément d'établissement de paiement**, coûteux et long à obtenir — **MEEREO ne l'a pas au démarrage**. L'argent des ventes transite **directement de l'acheteur au fournisseur** (moyens Mobile Money configurés par le fournisseur, `SYS-06`).

**Décision structurante : AUCUNE commission sur les ventes au démarrage.** MEEREO ne facture que **ses propres services**, payés d'avance. Aucun besoin de vérifier les ventes, aucun risque de sous-déclaration, aucune contrainte réglementaire.

**Les cinq sources de revenu :**

1. **Quota de produits (revenu récurrent principal).** Les **5 premiers produits** publiés sur la Marketplace sont **gratuits**. Au-delà, le fournisseur paie un **forfait par produit supplémentaire et par mois**. Monétise l'engagement du fournisseur, pas la transaction. Revenu **récurrent et prévisible**.
2. **Ventes flash** — mise en avant temporaire payante (`MKT-01`), levier de déstockage très demandé.
3. **Sponsoring / publicité** — produits sponsorisés « AD » (`MKT-04`).
4. **Abonnement fournisseur** — accès et présence sur la Marketplace.
5. **Abonnement KAi Pro** — tarif différencié par rôle : 9 900 (client) / 19 900 (pro) / 39 000 (fournisseur) FCFA/mois (`FIN-02`).

> **Annonce de transparence.** Il est communiqué dès le départ aux fournisseurs qu'une **commission sur les ventes sera introduite ultérieurement** (Phase 3). Cette annonce évite l'effet de rupture au moment du changement et laisse aux fournisseurs le temps de mesurer la valeur de la plateforme.

> **Grille tarifaire — à implémenter.** Document détaillé : `MEEREO_Grille_Tarifaire.md`.

| Service | Tarif | Statut |
|---|---|---|
| **Quota de produits** | 5 gratuits, puis **1 500–2 500 FCFA / produit / mois** — **aucun plafond** | Hypothèse à tester |
| **Vente flash** | **10 000–25 000 FCFA** par opération (48–72 h) | Hypothèse à tester |
| **Sponsoring produit** | **15 000–40 000 FCFA / mois / produit** | Hypothèse à tester |
| **Pack visibilité** | **50 000–100 000 FCFA / mois** | Hypothèse à tester |
| **Abonnement fournisseur** | **15 000–30 000 FCFA / mois** | Hypothèse à tester |
| **KAi Pro — Client** | **9 900 FCFA / mois** | **ACTÉ** |
| **KAi Pro — Professionnel** | **19 900 FCFA / mois** | **ACTÉ** |
| **KAi Pro — Fournisseur** | **39 000 FCFA / mois** | **ACTÉ** |

> **Pour le développement :** seuls les tarifs **KAi Pro** sont définitifs. Les autres sont des **hypothèses de test** susceptibles d'évoluer après confrontation au marché — **les rendre configurables** (paramétrables en back-office, jamais codés en dur), afin de pouvoir les ajuster sans redéploiement.

> **Objectif de recrutement :** ~40–50 fournisseurs (3–5 par catégorie sur les 11 catégories de MeereoShop).

> **Cumul des services.** Un même fournisseur peut souscrire **plusieurs services simultanément** (quota + abonnement + sponsoring + ventes flash + KAi Pro). La facturation doit gérer ce **cumul de services récurrents et ponctuels** sur une facture mensuelle unique (`FIN-02`, `SYS-06` onglet Abonnement).

### Pourquoi ce modèle est robuste (raisonnement acté)

- **Aucun problème de vérification :** MEEREO facture des services rendus, payés d'avance — pas une part d'un flux qu'elle ne voit pas.
- **Aucune incitation au contournement :** une commission sur les ventes pousserait mécaniquement le fournisseur à vendre hors plateforme. Sans commission, **plus il vend via MEEREO, plus il a intérêt à acheter de la visibilité**. Les intérêts sont **alignés** au lieu d'être en tension.
- **Argument d'acquisition fort :** « zéro commission sur vos ventes » recrute des fournisseurs face à des concurrents qui commissionnent.

> **Deux limites assumées.** (a) Le revenu dépend du **nombre et de l'engagement des fournisseurs**, pas du volume de ventes : un gros vendeur ne rapporte pas plus qu'un petit, sauf s'il achète de la visibilité — la croissance du chiffre d'affaires est donc plus plate que celle de l'activité. (b) **La visibilité ne se vend que s'il y a de l'audience** : ce modèle exige d'attirer **d'abord les acheteurs** (clients et professionnels), sinon il n'y a rien à vendre aux fournisseurs.

### Phase 3 — Escrow + logistique (cible) : introduction de la commission

Intégration d'un **partenaire bancaire (escrow)** et d'un **partenaire logistique** :
- Le paiement des **gros devis transite par un compte séquestre MEEREO** → l'argent **repasse par la plateforme** → la commission est prélevée automatiquement, **y compris sur l'offline**. L'escrow résout **deux problèmes d'un coup** : sécurité de la livraison ET perception de la commission sur les gros montants.
- Le **partenaire logistique** (suivi live, validation mobile de livraison, signature) **déclenche la libération de l'escrow** : livraison confirmée → fonds libérés → commission prélevée. Escrow et logistique sont **couplés** (`MKT-02`, section livraison cible).
- Le forfait fournisseur (Phase 2) peut alors être **complété ou remplacé** par la commission transactionnelle sur l'offline.

> **Dépendances réglementaires (Phase 3).** L'escrow suppose un partenaire **agréé établissement de paiement** — mêmes exigences que le partenaire bancaire des gros marchés (`FIN-01`/D10) et que la traçabilité inaltérable (`SYS-01`, à réactiver). Ces trois besoins (gros marchés, escrow Marketplace, traçabilité) peuvent être servis par **le même partenaire** — à mutualiser lors de la recherche.

> **À définir (décisions business) :** taux de commission (fixe ? variable par catégorie ? dégressif ?) ; montant et paliers du forfait fournisseur ; seuil en ligne/hors ligne (`MKT-02`) ; délai et seuil de reversement au fournisseur.
> **Dépendances :** `FIN-02` (Mobile Money), `MKT-02` (ventes & livraison), `MKT-04` (pub), `SYS-02`.
