# ANNEXE 2 — Journal des versions

> Retour au [sommaire](00_INDEX.md)

> **Modèle d'entrée pour les versions futures** (à remplir à chaque nouveau lot de feedback) :
>
> ### vX.Y — [date] — [titre du lot]
> - **[NOUVEAU] `CODE-NN`** — [titre] : [résumé en une ligne].
> - **[AMENDÉ] `CODE-NN`** — [ce qui a changé, sans réécrire l'exigence d'origine].
> - **[TRANCHÉ] `CODE-NN`** — [décision prise sur un point auparavant « à trancher »].

---

### v1.27 — 23 juillet 2026 — *Lot : fusion d'une branche parallèle (diagnostic technique) + contrôle de cohérence des 4 documents complémentaires*

> **Contexte.** Une branche parallèle de ce référentiel (v1.2/v1.3, produite dans une autre session de travail) avait développé, en plus de `INS-06` et `MSG-06` (déjà présents ici depuis la v1.1 commune), une **annexe de diagnostic technique** (causes probables, architecture cible, protocole de vérification) pour `MSG-06`, `INS-06` et `QAL-02`. Cette branche divergeait de la présente lignée à partir de « v1.2 » : deux documents différents portaient le même numéro. Cette version **réconcilie les deux** en adoptant la présente lignée (la plus avancée, v1.26) comme référence unique, et en y greffant le contenu diagnostique de l'autre branche, qui n'avait pas d'équivalent ici.

- **[NOUVEAU]** Ajout de l'**[Annexe 3 — Diagnostic technique](Annexe_3_Diagnostic_Technique.md)**, complément **exclusivement technique** (pas de nouvelle décision produit) à `MSG-06`, `INS-06` et `QAL-02` : hypothèses de cause classées par probabilité, architecture cible, protocole de vérification pour chacun, plus synthèse transversale. `MSG-06`, `INS-06` et `QAL-02` ne portent qu'un renvoi daté vers cette annexe — aucune exigence existante réécrite.
- **[NOUVEAU]** Ajout de l'**[Annexe 4 — Documents complémentaires](Annexe_4_Documents_Complementaires.md)**, recensant `MEEREO_Doctrine_Flux_Financiers.md`, `MEEREO_Lot_Correction.md`, `MEEREO_Questions_Juriste_Paiement.md` et `MEEREO_SYS-02_Matrice_Droits.md` : vérifiés ligne à ligne contre ce référentiel, cohérents à une exception près (signalée, non corrigée ici — ce n'est pas ce référentiel qui porte l'erreur).
- **Branche v1.2/v1.3 parallèle :** abandonnée au profit de la présente lignée. Son seul contenu original (le diagnostic technique) est repris ci-dessus ; le reste de son contenu (confirmations par capture d'écran sur `PRJ-01`/menu Actifs) fait double emploi avec les v1.3/v1.7 de la présente lignée et n'est pas dupliqué.

---

### v1.26 — 23 juillet 2026 — *Lot : arbitrage des 7 derniers points ouverts*

Tous les points fonctionnels en suspens sont tranchés. Le référentiel n'a **plus aucune décision produit en attente**.

1. **[TRANCHÉ] `NAV-05` — Points d'entrée Paramètres :** les **trois sont conservés** (barre latérale, menu avatar, carte EXPLORER). En contrepartie, **tests systématiques des trois** inscrits en non-régression.
2. **[TRANCHÉ] `FIN-01` — Phases de projet : liste FIXE** imposée par MEEREO, identique pour tous les projets. Ni renommables ni modifiables. *Avantage : comparabilité entre projets, cohérence statistique, modèle de données simple.*
3. **[TRANCHÉ] `FIN-01` — Dépassement de budget : ALERTE NON BLOQUANTE.** N'empêche jamais la création d'un marché. Cohérent avec la doctrine : MEEREO informe et trace, ne contrôle pas les décisions du client.
4. **[TRANCHÉ] `MKT-01` — Produit non payé : dépublication le jour même, précédée d'alertes** quelques jours avant (`AVS-02`). Le produit est **conservé** dans l'espace du fournisseur et redevient publiable après régularisation. Compte à rebours visible dans l'UI.
5. **[TRANCHÉ] `AVS-03` — Factures impayées : suppression de compte BLOQUÉE** tant qu'un solde est dû à MEEREO. Empêche qu'un compte soit supprimé pour échapper à une dette.
6. **[TRANCHÉ] `MKT-01` — Périmètre Marketplace : produits physiques uniquement** (matériaux, mobilier, équipements). Les **services** (location, transport, main-d'œuvre) en sont exclus — ils relèvent du cycle appel d'offres (`AOF-*`).
7. **[TRANCHÉ] `FIN-03` — Abonnement et quota facturés SÉPARÉMENT**, pas de paliers tout compris. Le fournisseur voit précisément ce qu'il paie pour quoi.

**Reste ouvert (hors spécification fonctionnelle) :** les montants de la grille tarifaire (à valider par le terrain) et les 5 sujets à faire arbitrer par un juriste / expert paiement avant mise en ligne.

---

### v1.25 — 23 juillet 2026 — *Lot : tarifs KAi Pro actés & intégration de la grille pour le développement*

- **[ACTÉ] Tarifs KAi Pro différenciés par rôle** (remplace le tarif unique de 9 900 FCFA) :
  - **Client : 9 900 FCFA / mois**
  - **Professionnel : 19 900 FCFA / mois**
  - **Fournisseur : 39 000 FCFA / mois**
  - *Logique :* le prix suit la valeur générée — le client pilote un projet ponctuel, le pro l'utilise en continu, le fournisseur en tire une valeur commerciale directe (`MKT-05` : alertes stock, prédictions, suggestions de ventes flash, meilleures ventes).
- **[INTÉGRÉ] Grille tarifaire complète dans `FIN-03`** — tableau directement exploitable par l'équipe de développement, distinguant clairement les tarifs **ACTÉS** (KAi Pro) des **hypothèses à tester** (quota, ventes flash, sponsoring, abonnement fournisseur).
- **[EXIGENCE TECHNIQUE] Tarifs configurables.** Les montants non actés doivent être **paramétrables en back-office**, jamais codés en dur — ils évolueront après confrontation au marché, sans redéploiement.
- **[MIS À JOUR]** `MEEREO_Grille_Tarifaire.md` : section KAi Pro remplacée par la grille par rôle ; projections de cumul et d'ensemble recalculées (distributeur actif ≈ 274 000 FCFA/mois ; ~3,25 M FCFA/mois à 45 fournisseurs).

---

### v1.24 — 23 juillet 2026 — *Lot : bug d'authentification & suppression de compte fournisseur*

- **[NOUVEAU] `NAV-06`** — la suppression de compte (espace fournisseur, Paramètres › Données) échoue avec **« token manquant »** : la requête part sans jeton d'authentification. Deux causes à investiguer : jeton non transmis par le front, ou session expirée non détectée (rejoint `NAV-02`).
- **Contrôle général demandé (décision MEEREO) :** vérifier **tous les appels authentifiés** de la plateforme, tous rôles — pas seulement la suppression. Un jeton manquant peut affecter silencieusement d'autres opérations.
- **Exigence UX ajoutée :** ne jamais afficher un message technique brut (« token manquant ») à l'utilisateur ; signaler clairement une session expirée et proposer la reconnexion (`QAL-03`).
- **[AMENDÉ] `AVS-03`** — règle de **suppression d'un compte fournisseur** : suppression possible même avec des commandes en cours ; produits retirés immédiatement de la Marketplace ; commandes en cours **honorées hors plateforme**. **Exigence de protection de l'acheteur ajoutée** : notifier chaque acheteur concerné et lui transmettre les coordonnées du fournisseur, faute de quoi il se retournera vers MEEREO.
- **[À PRÉCISER]** Sort des factures MEEREO impayées (quota, sponsoring, abonnement) lors d'une suppression de compte.

---

### v1.23 — 23 juillet 2026 — *Lot : bug de navigation Paramètres*

- **[NOUVEAU] `NAV-05`** — dans l'espace fournisseur, l'entrée **« Paramètres » du menu de l'avatar** (haut à droite) ne renvoie pas vers la section Paramètres : lien mort ou mal câblé.
- **Contrôle étendu demandé :** les Paramètres sont atteignables depuis **trois points d'entrée** (barre latérale COMPTE, menu avatar, carte « Paramètres » de la section EXPLORER sur l'accueil fournisseur). Tous doivent mener au même écran — à vérifier pour les **trois rôles**.
- **[À TRANCHER]** Conserver les trois points d'entrée ou retirer la carte redondante d'EXPLORER ?

---

### v1.22 — 23 juillet 2026 — *Lot : grille tarifaire (hypothèses de test)*

- **[NOUVEAU DOCUMENT] `MEEREO_Grille_Tarifaire.md`** — grille chiffrée rattachée à `FIN-03` Phase 2. **Montants non validés par le marché**, présentés comme base de test à ajuster.
- **Contexte de calibrage acté :** paniers de commandes en centaines de milliers à millions FCFA ; cible **PME et grands distributeurs** ; **aucun concurrent local** → MEEREO crée la référence de prix.
- **[DÉCIDÉ] Aucun plafond de produits** par fournisseur : plus il publie, plus il paie — le revenu croît linéairement avec le catalogue.
- **[DÉCIDÉ] Objectif de recrutement : ~40–50 fournisseurs** (3–5 par catégorie sur les 11 catégories de MeereoShop).
- **[SIGNALÉ] KAi Pro à réévaluer :** 9 900 FCFA/mois est un prix de petit indépendant, sous-valorisé pour une cible PME/distributeurs (recommandation 20 000–35 000 FCFA).
- **[SIGNALÉ] Cumul des services :** un fournisseur peut souscrire plusieurs services simultanément — la facturation doit gérer récurrents et ponctuels sur une facture unique (`FIN-02`, `SYS-06`).

---

### v1.21 — 23 juillet 2026 — *Lot : modèle de revenu définitif — zéro commission au démarrage*

**Décision structurante (MEEREO).** Plutôt qu'une commission facturée a posteriori — invérifiable et incitant au contournement — MEEREO ne facture au démarrage que **ses propres services**, payés d'avance. **Zéro commission sur les ventes.**

**[RÉÉCRIT] `FIN-03` Phase 2 — cinq sources de revenu :**
1. **Quota de produits** — 5 gratuits, puis **forfait par produit supplémentaire et par mois** (revenu récurrent principal, monétise l'engagement et non la transaction).
2. **Ventes flash** (mise en avant temporaire payante).
3. **Sponsoring / publicité** (`MKT-04`).
4. **Abonnement fournisseur**.
5. **Abonnement KAi Pro** (`FIN-02`).

**Annonce de transparence :** les fournisseurs sont informés dès le départ qu'une commission sur ventes sera introduite en Phase 3 (avec l'escrow) — évite l'effet de rupture.

**Raisonnement acté :** (a) aucun problème de vérification, MEEREO facture des services payés d'avance ; (b) **aucune incitation au contournement** ; (c) « zéro commission » est un argument d'acquisition fort.

**[AJOUTÉ] `MKT-01`** — règle de quota (5 produits gratuits puis forfait mensuel par produit).

---

### v1.20 — 23 juillet 2026 — *Lot : audit de l'espace fournisseur & correction du modèle de revenu*

Vérification complète de l'espace fournisseur réel. **Plusieurs spécifications antérieures étaient erronées — corrigées ici.**

- **Correction majeure — modèle de revenu (`FIN-03` Phase 2)** : contrainte réglementaire identifiée (agrément d'établissement de paiement absent). Phase 2 réécrite : argent directement de l'acheteur au fournisseur.
- **[CORRIGÉ] `SYS-06`** — structure onglets fournisseur corrigée (8 onglets réels).
- **[CORRIGÉ] `MKT-03`** — modules Paiements et Performance ajoutés.
- **[PRÉCISÉ] `MKT-01`** — formulaire produit réel documenté.

---

### v1.19 — 23 juillet 2026 — *Lot : cycle de vie complet de l'équipe*

- **[CADRÉ] `PRJ-06`** — 6 règles de cycle de vie (E1–E6) : deux portes d'écriture/une base, référentiel réutilisable, visibilité publique, rôles internes, retrait différencié, visibilité client.
- Diagnostic technique du bug existant : écriture qui n'atteint pas le référentiel commun.

---

### v1.18 — 23 juillet 2026 — *Lot : audit détaillé des Paramètres pro & rôles internes*

- **[ÉTENDU] `SYS-02`** — second niveau de rôles internes (Administrateur / Chef de projet / Collaborateur / Lecteur).
- Corrections et manques comblés dans `SYS-06` : sélecteur de langue, 2FA, sessions, outil de test « Réinitialiser » à retirer, nommage KAi.

---

### v1.17 — 23 juillet 2026 — *Lot : Paramètres & clarification des trois portes d'identité pro*

- **[NOUVEAU] `SYS-06`** — angle mort comblé : section Paramètres spécifiée.
- **[DÉCISION 1]** Libellés clarifiés : Voir / Modifier / Paramètres.
- **[DÉCISION 2]** Séparation nette des périmètres.
- **[DÉCISION 3]** Verrouillage du RCCM après vérification.
- Structure par rôle actée : client 5 onglets, professionnel 7, fournisseur 7.

---

### v1.16 — 23 juillet 2026 — *Lot : MSG-01 tranché (dernier point ouvert)*

- **[TRANCHÉ] `MSG-01`** — Solution 2 retenue : transmission garantie. Trois cas couverts. Plus de point « À TRANCHER » fonctionnel.

---

### v1.15 — 23 juillet 2026 — *Lot : fondations transverses (mobile, multilingue, fichiers)*

- **[CADRÉ] `SYS-03`** — mobile en 2 phases (responsive + app native).
- **[CADRÉ] `SYS-04`** — bilingue FR + EN dès le lancement.
- **[CADRÉ] `SYS-05`** — formats, taille, versioning, droits, rattachement.

---

### v1.14 — 23 juillet 2026 — *Lot : stratégie de monétisation en 3 phases*

- **[STRATÉGIE] `FIN-03`** réécrit : Phase 1 acquisition, Phase 2 monétisation en ligne + forfait, Phase 3 escrow + logistique.
- Mutualisation des besoins réglementaires signalée.

---

### v1.13 — 23 juillet 2026 — *Lot : modèle de revenu Marketplace & KAi commercial*

- **[NOUVEAU] `FIN-03`** — commission Marketplace.
- **[ENRICHI] `MKT-01`** — stock obligatoire, promotions/ventes flash.
- **[NOUVEAU] `MKT-05`** — KAi surveillance stock & conseil commercial.

---

### v1.12 — 23 juillet 2026 — *Lot : Marketplace complétée (catégories, promos, sponsoring)*

- **[COMPLÉTÉ] `MKT-01`** — catégories réelles, promotions/ventes flash.
- **[CORRECTION] `MKT-01`** — blocs promo conditionnels.
- **[NOUVEAU] `MKT-04`** — produits sponsorisés (AD).

---

### v1.11 — 23 juillet 2026 — *Lot : cadrage de la Marketplace*

- **[CADRÉ] `MKT-01`** — catalogue fournisseur.
- **[CADRÉ] `MKT-02`** — achat deux modes, suivi commande, livraison deux temps.
- **`MKT-03`** — espace fournisseur structuré.

---

### v1.10 — 23 juillet 2026 — *Lot : retrait du Passeport, deux natures de flux financiers, paiements Mobile Money*

- **[RETIRÉ] `SYS-01`** — Passeport Numérique retiré (reporté post-MVP).
- **[NOUVEAU] `FIN-02`** — paiements intégrés Mobile Money.
- **[RÉVISÉ] `FIN-01`/D10** — traçabilité proportionnée à la nature du flux.

---

### v1.9 — 23 juillet 2026 — *Lot : ergonomie du suivi chantier (placement des validations)*

- **[AMENDÉ] `PRJ-07`** — « Valider cette section » en en-tête, « Valider le projet » en bas.

---

### v1.8 — 23 juillet 2026 — *Lot : matrice de droits SYS-02 (fondation)*

- **[CADRÉ] `SYS-02`** — matrice complète : 5 rôles × 18 objets × 4 actions. 7 arbitrages tranchés (A–G).

---

### v1.7 — 23 juillet 2026 — *Lot : renforcement MSG-04 (doublon conversation + nommage contextuel)*

- **[AMENDÉ] `MSG-04`** — cas concret constaté (doublon « Conception — MILLENIUM CONSTRUCTION »).
- **[NOUVEAU] Nommage contextuel par rôle** : même conversation, libellé adapté (pro = projet seul, client = projet + entreprise).

---

### v1.6 — 23 juillet 2026 — *Lot : conversation projet multi-participants*

- **[NOUVEAU] `MSG-07`** — 4 décisions (G1–G4) : extension de la conversation unique, intervenant aveugle au reste, seul le pro ajoute/retire, confidentialité de l'historique.

---

### v1.5 — 23 juillet 2026 — *Lot : suivi chantier & assignation d'intervenants*

- **[CADRÉ] `PRJ-05`** — 3 décisions (I1–I3) : 4 sources, compte obligatoire, aucun accès au projet sous-traité.
- **[CADRÉ] `PRJ-07`** — phases de mission, validation groupée, notes de chantier typées.

---

### v1.4 — 23 juillet 2026 — *Lot : cadrage du cycle appel d'offres*

- `AOF-01/02/03` cadrés. 9 décisions (A1–A9).

---

### v1.3 — 23 juillet 2026 — *Lot : audit complet & comblement des manques*

- Fusion Missions + Marchés + Contrats → « Marchés ».
- **[NOUVEAU]** Domaines I (AOF), J (MKT), K (SYS) — 11 nouvelles exigences.

---

### v1.2 — 23 juillet 2026 — *Lot : doctrine financière, corrections menu, refonte parcours d'entrée*

- **[NOUVEAU]** Doctrine des flux financiers.
- **[AMENDÉ] `FIN-01`** — D9 à D12 ajoutés.
- Fusion menu, suppression « Actifs ».
- Refonte du parcours d'entrée (design séparé).

---

### v1.1 — 22 juillet 2026 — *Lot : bugs messagerie & onboarding*

- **[NOUVEAU] `INS-06`** — Validation par étape & sortie d'impasse.
- **[NOUVEAU] `MSG-06`** — Synchronisation instantanée d'une conversation.

---

### v1.0 — 22 juillet 2026 — *Version figée de référence*

Première version consolidée et figée. 36 exigences sur 8 domaines. Numérotation par codes stables établie.

**Arbitrages actés :** `INS-04` (badge vérifié IA), `FIN-01` (modèle financier D1–D8).
