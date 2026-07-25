# E. CYCLE DE VIE & SUIVI DES PROJETS

> Retour au [sommaire](00_INDEX.md)

---

## `PRJ-01` — Validation d'un marché et création automatique du projet
**Statut : À CORRIGER + RÈGLE**

**Bug actuel :** la validation d'un marché par le client ne crée aucun projet dans le profil du professionnel.

**Fonctionnement attendu :**

- la validation **génère automatiquement un nouveau projet** dans l'espace du professionnel ;
- ce projet est **directement intégré au suivi d'avancement** (toutes les fonctionnalités de gestion immédiatement disponibles).

**Simplifications imposées dans la section Marché** (cf. `FIN-01`) :

- **supprimer** le bouton **« Démarrer le marché »** (non fonctionnel, sans utilité) ;
- **supprimer** la section **« Paiement et sécurisation »** (sans objet : suivi financier désormais dans `FIN-01`).

> La « Mission » et le « marché validé » sont **un seul et même objet** (`FIN-01`, décision D4).

---

## `PRJ-02` — Arrêt, clôture, archivage et suppression des projets
**Statut : À CORRIGER + RÈGLE**

**Bug actuel :** quand un professionnel supprime un projet, le comportement côté client est incohérent (informations restant affichées à tort).

Selon ses droits, chaque utilisateur autorisé peut **suspendre, reprendre, clôturer, archiver ou supprimer définitivement** un projet. Toute clôture/archivage/suppression est **synchronisée** chez tous les utilisateurs concernés. Un projet supprimé disparaît de « Mes Projets ».

**États à définir :** En préparation, En attente, En cours, Suspendu, Terminé, Clôturé, Archivé, Supprimé.
**Droits par état à définir pour :** Maître d'Ouvrage (Client), Professionnel, Intervenants, Administrateur.

---

## `PRJ-03` — Synchronisation des notes d'avancement avec le client
**Statut : À CORRIGER**

**Bug actuel :** une note du professionnel (module Avancement / Cockpit Projet) reste visible uniquement de son côté.

**Attendu :** chaque note **synchronisée automatiquement et immédiatement** vers l'espace client (section Notes du Projet), en conservant **auteur, date, heure, étape, catégorie, pièces jointes**. Historique complet conservé.

---

## `PRJ-04` — Synchronisation des images Professionnel ↔ Client
**Statut : À CORRIGER**

**Bug actuel :** les images déposées par le professionnel (photos de chantier, rendus 3D, plans, etc.) n'apparaissent pas côté client.

**Attendu :** toute image **synchronisée en temps réel**, visible immédiatement côté client — sauf documents marqués **privés/internes**. Métadonnées conservées (date, auteur, description, catégorie, étape, historique). Toute modification/suppression/ajout répercutée chez les utilisateurs autorisés.

---

## `PRJ-05` — Gestion des intervenants affectés à un projet
**Statut : CADRÉ — DÉVELOPPABLE**

Lorsqu'une entreprise obtient un marché (`AOF-01`/`PRJ-01`), elle devient responsable du chantier et peut **assigner des intervenants** à ses tâches (suivi chantier / avancement). Ce module est cadré comme suit.

### Décisions de cadrage (assignation d'intervenants)

- **I1 — Quatre sources d'assignation** (depuis le modal « Assigner un intervenant ») :
  1. **Mon équipe** — membres du référentiel réutilisable de l'entreprise (`PRJ-06`).
  2. **Rechercher sur la plateforme** — un intervenant déjà présent dans l'annuaire (ex. un BET), assigné directement.
  3. **Inviter par email** — un intervenant externe reçoit une invitation à créer son compte professionnel.
  4. **Créer un profil** — l'entreprise crée un profil pré-rempli pour l'intervenant + renseigne son email ; l'intervenant reçoit l'invitation et vient finaliser son inscription.
- **I2 — Tout intervenant externe finit avec un compte professionnel.** Soit il existe déjà (source 2), soit il en crée un via invitation (sources 3 et 4). Pas d'intervenant « fantôme » sans compte.
- **I3 — Accès de l'intervenant sur le projet sous-traité : AUCUN.** L'intervenant possède un compte professionnel **pour son usage propre** (ses propres marchés ailleurs, sa présence dans l'annuaire, sa réutilisabilité `PRJ-06`), mais **sur le projet où il est sous-traité par l'entreprise générale, il ne voit rien** : il ne reçoit pas la tâche, ne suit pas l'avancement, n'y participe pas. **L'entreprise générale gère 100 % de l'avancement en interne.** L'assignation est une **organisation interne de l'entreprise**, pas une collaboration active. *(Choix produit assumé : MEEREO reste, pour l'intervenant sous-traité, un outil piloté par l'entreprise générale ; l'intervenant garde un interlocuteur unique = l'entreprise, comme le client garde l'entreprise comme interlocuteur unique — cohérent `AOF-01`/A3.)*

### Gestion du cycle de vie de l'intervenant

Le responsable peut **retirer, remplacer, changer de rôle, ou mettre fin à la participation** d'un intervenant. Toute suppression met **automatiquement à jour** : liste des intervenants, Cockpit Projet, notifications internes, dépendances recalculées.

> **Dépendances :** `AOF-01`/`PRJ-01` (le marché déclenche la capacité d'assigner), `PRJ-06` (référentiel équipe), `SYS-02` (l'accès « aucun sur le projet sous-traité » est une règle de la matrice de droits), `AVS-01` (évaluation croisée entreprise ↔ intervenant en fin de mission).

---

## `PRJ-06` — Équipe : cycle de vie complet (référentiel, page publique, projets)
**Statut : CADRÉ — DÉVELOPPABLE**

**Bug actuel :** les membres d'équipe créés sur la page publique ne semblent pas enregistrés de façon exploitable — symptôme direct du problème de synchronisation traité ci-dessous.

### L'équipe circule à quatre endroits

Une même personne apparaît dans quatre contextes, qui doivent tous lire **la même donnée** :

```
Paramètres › Équipe  ←→  Page pro publique
            ↓
      Projets (assignation, PRJ-05)
            ↓
      Suivi de projet (vue client)
```

### Règles de cycle de vie

- **E1 — Deux portes d'écriture, une seule base.** L'équipe peut être **créée et éditée depuis les deux endroits** : Paramètres › Équipe **et** la page pro publique. Ce ne sont **pas deux listes à synchroniser** mais **une seule donnée avec deux interfaces** (`QAL-02`). Un membre ajouté d'un côté est immédiatement présent de l'autre, sans délai ni action manuelle.
- **E2 — Référentiel réutilisable.** Les membres sont **enregistrés durablement** en base, rattachés au compte professionnel (UUID, `AVS-03`). À l'assignation sur un projet (`PRJ-05`, source « Mon équipe »), le pro **sélectionne un membre existant** : l'affectation est une **relation** (membre ↔ projet), jamais une recréation. Pas de doublons de collaborateurs.
- **E3 — Visibilité publique.** Un membre marqué « **Public** » apparaît sur la page pro publique (`INS-03`) ; les autres restent internes à l'entreprise.
- **E4 — Rôles internes.** Chaque membre porte un rôle interne — Administrateur, Chef de projet, Collaborateur, Lecteur — qui **restreint** ses droits sans jamais les étendre au-delà de ceux du compte professionnel (`SYS-02`, second niveau).
- **E5 — Retrait d'un membre : effet différencié.** Retirer un membre de l'équipe le fait **disparaître de la page publique** et des projets **en cours**, **mais il reste attaché aux projets passés** (historique préservé). Un projet livré conserve la trace de qui y a travaillé — cohérent avec l'esprit de traçabilité du suivi de chantier.
- **E6 — Visibilité côté client.** Un membre d'équipe assigné à un projet est **visible par le client** dans le suivi de projet, avec son **nom et son métier/rôle** — **visible par défaut, masquable au cas par cas** par l'entreprise. Même règle que pour les intervenants (`SYS-02`/F, `PRJ-05`) : l'entreprise garde la main sur ce qu'elle expose.

> **Implication technique majeure.** Le bug constaté (membres créés sur la page publique non enregistrés) vient d'une écriture qui n'atteint pas le référentiel commun. La correction n'est pas de « synchroniser deux listes » mais de faire écrire **les deux interfaces dans la même table**, et de faire lire **tous les affichages** (page publique, sélecteur d'assignation, suivi de projet côté client) depuis cette même source.

> **Dépendances :** `PRJ-05` (assignation aux projets), `PRJ-01` (marché → projet), `INS-03` (page publique), `SYS-02` (rôles internes + visibilité client F), `SYS-06` (onglet Équipe), `AVS-01` (évaluation croisée), `QAL-02` (source unique).

---

## `PRJ-07` — Suivi chantier : avancement, validation par section & notes de chantier
**Statut : CADRÉ — DÉVELOPPABLE**

Module « Suivi chantier / Avancement » piloté par l'entreprise responsable du marché. Structure confirmée par l'état réel de la plateforme.

### Structure par phases de mission

Le projet est organisé en **phases de mission** affichées en frise : **Conception, Préparation, Gros Œuvre, Second Œuvre, Matériaux, Mobilier, Réception**. Chaque phase contient des **tâches** (ex. pour Conception & Études : relevé de mesures, analyse du site, faisabilité, esquisse, avant-projet, projet détaillé, estimation budgétaire, études BET structure, études BET fluides/CVC, plans d'exécution, dossier permis de construire…). Chaque phase affiche son **pourcentage d'avancement**.

> Ces phases confirment et prolongent le découpage de `FIN-01` (Phase = corps d'état / composant). C'est **le même axe** qui sert à l'avancement (ici) et aux décaissements (`FIN-01`).

### Validation & avancement

- Chaque tâche a un état (À faire / en cours / terminé) et peut recevoir un intervenant assigné (`PRJ-05`) via le bouton dédié.
- **Validation groupée par section** : « Valider cette section » valide toutes les tâches d'une phase en une action ; la validation **individuelle** reste possible.
- L'entreprise pilote **seule** cet avancement (cf. `D12` : découplé de toute validation financière ; et `PRJ-05`/I3 : les intervenants sous-traités n'y participent pas).

**Placement des actions (ergonomie — continuité descendante) :** le sens de l'action doit suivre le sens de lecture.

- **« Valider cette section »** est placé dans l'**en-tête de chaque section**, à côté du titre, du pourcentage et de la flèche de repli. *(Aujourd'hui ce bouton est en bas de la liste des tâches, ce qui oblige à scroller toute la section pour le trouver — à corriger.)* La validation est un geste **répété** au fil des sections : il doit être immédiatement accessible là où l'œil arrive.
- **« Valider le projet »** (action finale, disponible quand toutes les tâches sont à 100 %) est placé **en bas**, après la dernière section, comme **aboutissement** du parcours. *(Aujourd'hui il est en haut, sous les compteurs — à déplacer en bas.)*
- Résultat attendu : une progression cohérente de haut en bas — on valide chaque section au fil de la lecture (en-têtes), puis on valide le projet tout en bas comme point final.

> Ce point est un **raffinement de placement UI**, pas un changement de comportement : les actions restent identiques, seul leur emplacement change pour respecter la logique de progression.

### Notes de chantier (typées)

Une **note de chantier** peut être ajoutée, portant : tâche concernée, statut, avancement (%), **type de note** parmi **Validation / Alerte / Information / Blocage**, et un texte (constat, points de vigilance). Ces notes alimentent la timeline du projet et sont synchronisées avec le client (`PRJ-03`), à l'exception de ce qui est marqué interne.

> **Dépendances :** `FIN-01` (même axe de phases), `PRJ-03` (synchro des notes avec le client), `PRJ-05` (assignation), `D12` (avancement autonome).

---

## `PRJ-08` — Refonte de la visualisation documentaire et de la chronologie
**Statut : À DÉVELOPPER**

L'affichage en listes est peu intuitif. Proposer plusieurs modes : **cartes, galerie d'images, vignettes, chronologie/timeline interactive, regroupement par catégorie ou par étape**. Chaque document affiche : aperçu, type, auteur, date de dépôt, catégorie, étape.

---

## `PRJ-09` — Système visuel d'identification des projets (couleurs)
**Statut : À DÉVELOPPER**

Palette actuelle limitée. Chaque projet associable à une **couleur distincte** (palette élargie), appliquée de façon cohérente dans : tableau de bord, Cockpit Projet, listes, chronologies, indicateurs d'avancement, calendriers, tableaux de suivi.

---

## `PRJ-10` — Cohérence des données Client ↔ Professionnel
**Statut : RÈGLE**

Toute action du professionnel dans le suivi normal du projet se répercute automatiquement côté client (notes, documents, images, comptes rendus, états, affectations d'intervenants, notifications) — et **inversement** pour les actions du client (validation, commentaires, demandes, clôture).

MEEREO doit fonctionner comme une **plateforme collaborative unique** : mêmes données, en temps réel, selon les droits.
