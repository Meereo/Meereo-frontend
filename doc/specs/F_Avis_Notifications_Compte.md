# F. AVIS, NOTIFICATIONS & DONNÉES DE COMPTE

> Retour au [sommaire](00_INDEX.md)

---

## `AVS-01` — Avis, notation et affichage centralisé des évaluations
**Statut : À DÉVELOPPER + RÈGLE**

Le système d'avis fait **partie intégrante du cycle de vie** d'un projet.

**Création manuelle interdite :** l'option de créer/gérer manuellement la section Avis est **supprimée** de l'éditeur de page publique. Les avis sont **entièrement générés par le système**, alimentés automatiquement à la fin de chaque mission.

**À la clôture d'une mission**, le client est **automatiquement invité** à évaluer le professionnel : **note globale + commentaire + évaluation par critères** (délais, qualité, communication, professionnalisme…).

**Évaluation croisée :** lorsqu'un professionnel travaille avec un autre intervenant (entreprise, architecte, bureau d'études…), il peut aussi **l'évaluer en fin de mission** (note + commentaire).

**Fondement :** avis basés **exclusivement** sur des missions réellement réalisées via la plateforme. **Une seule évaluation** par mission terminée (pas de doublon).

**Source unique de données (centralisation obligatoire) :**

- toutes les notes, avis et statistiques proviennent d'une **base unique et centralisée** ;
- **aucune** copie ni calcul indépendant : toutes les interfaces consultent la **même source** ;
- calcul **automatique** de la note moyenne, du nombre total d'avis et des statistiques ;
- après chaque évaluation, mise à jour **automatique** partout, sans intervention manuelle.

**Affichage identique partout :** étoiles, note moyenne, nombre d'avis, statistiques **strictement identiques** sur page publique, résultats de recherche, annuaire, appels d'offres, toute interface. Toute divergence entre deux interfaces = bug (source non unique).

**Cas « aucun avis » :** ni note fictive ni étoiles artificielles ; afficher un message explicite, ex. **« Aucun avis pour le moment »**.

**Immuabilité côté pro :** le professionnel ne peut ni supprimer, ni masquer, ni désactiver, ni modifier un avis/une note. Seule l'**administration MEEREO** intervient en cas de contenu frauduleux/diffamatoire/contraire aux CGU.

> **Dépendances :** déclenchement lié à la clôture de mission (`PRJ-02`) ; intervenants évalués issus de `PRJ-05`/`PRJ-06`.

---

## `AVS-02` — Gestion des notifications
**Statut : À DÉVELOPPER**

Chaque événement important génère une **notification temps réel** : nouveau message ; ajout de document/image ; création d'appel d'offres ; invitation sur un projet ; affectation d'intervenant ; validation d'étape ; demande d'action d'un client ; modification importante d'un projet ; clôture de projet ; réception d'un avis.

**Compteurs** mis à jour automatiquement (sans rafraîchissement). Notifications consultables dans un **historique dédié** jusqu'à lecture.

---

## `AVS-03` — Suppression des profils et réutilisation des adresses e-mail
**Statut : À CORRIGER + RÈGLE**

**Problème :** après suppression d'un profil puis recréation avec la **même adresse e-mail**, la plateforme réassocie automatiquement les **anciennes données** (anciennes missions, projets réapparus, mélange des données).

**Fonctionnement attendu :**

- chaque compte identifié par un **UUID / ID interne**, **non** par l'e-mail seul ;
- relations (projets, missions, conversations, documents…) basées sur cet identifiant unique ;
- à la suppression d'un compte, **aucune donnée** réassociée à un nouveau compte de même e-mail ;
- réutilisation d'e-mail autorisée ⇒ nouveau compte **entièrement indépendant**, sans héritage.

> **Prérequis** de `MSG-04` (conversation unique fondée sur les UUID).

### Cas particulier — suppression d'un compte FOURNISSEUR

Un fournisseur peut avoir du **contenu marchand actif** au moment de la suppression. Règle actée :

- **La suppression est possible** — elle n'est pas bloquée par l'existence de commandes en cours.
- **Ses produits sont retirés** de la Marketplace immédiatement (plus de vente possible).
- **Les commandes en cours sont honorées hors plateforme**, en direct entre le fournisseur et l'acheteur.

> **Exigence de protection de l'acheteur.** Puisque MEEREO cesse d'héberger la relation, l'acheteur ne doit pas découvrir seul que son fournisseur a disparu. Avant/lors de la suppression, la plateforme doit **notifier chaque acheteur ayant une commande en cours** (`AVS-02`) et lui **transmettre les coordonnées du fournisseur** pour qu'il puisse poursuivre en direct. Sans cela, l'acheteur se retournera vers MEEREO — qui n'aura plus ni trace ni interlocuteur.

> **Factures MEEREO impayées — suppression bloquée (tranché 23/07/2026).** Si le fournisseur a un **solde dû** à MEEREO (quota de produits, sponsoring, abonnement — `FIN-03`), **la suppression de compte est refusée** tant que le solde n'est pas réglé. Le message doit indiquer clairement le montant dû et la voie de règlement. *Objectif : empêcher qu'un compte soit supprimé pour échapper à une dette.*
