# Plateforme MEEREO — Spécifications fonctionnelles

**Version : 1.27** · **Date : 23 juillet 2026** · **Statut : figée (référence de développement)**

> **Destinataire :** équipe de développement.
> **Objet :** référentiel unique et consolidé des corrections, améliorations et règles métier de la plateforme MEEREO.
> Les points sont regroupés par domaine fonctionnel et identifiés par un **code stable** (ex. `MSG-02`). Ce code ne change jamais, même si l'ordre d'affichage évolue : il sert de référence dans les renvois, le suivi de tâches et les versions futures.

---

# COMMENT LIRE ET FAIRE VIVRE CE DOCUMENT (gouvernance)

**Règles de mise à jour — à respecter pour ne pas casser le travail de développement :**

1. **Le code stable fait foi.** Chaque exigence porte un code (`INS-01`, `MSG-03`, `FIN-07`…). Les renvois entre points utilisent ce code, jamais le numéro de page ni l'ordre d'affichage.
2. **On ne réécrit pas l'existant.** À partir de cette v1.0, le corps des exigences déjà figées n'est plus modifié à la volée. Une exigence qui évolue est **amendée** (mention datée ajoutée à la fin de son bloc), jamais réécrite silencieusement.
3. **Un nouveau feedback = un nouveau code.** Tout retour ultérieur reçoit un **nouveau code** dans son domaine (le prochain numéro libre : `MSG-05`, `FIN-04`…), est ajouté à sa section, et est consigné dans le **Journal des versions** en fin de document.
4. **Le numéro de version augmente à chaque lot.** v1.1, v1.2… Le développeur sait ainsi exactement ce qui est nouveau depuis la version qu'il a déjà traitée, en lisant le seul Journal des versions.
5. **Statut par exigence.** Chaque point indique son statut : `À CORRIGER` (bug), `À DÉVELOPPER` (nouvelle fonctionnalité), `RÈGLE` (règle métier permanente), ou `À TRANCHER` (décision produit requise avant tout code).

**Codes de domaine :**

| Domaine | Préfixe |
|---|---|
| A. Inscription & identité du professionnel | `INS` |
| B. Annuaire & appels d'offres | `ANN` |
| C. Messagerie & communication | `MSG` |
| D. Stabilité, session & navigation | `NAV` |
| E. Cycle de vie & suivi des projets | `PRJ` |
| F. Avis, notifications & données de compte | `AVS` |
| G. Qualité transverse | `QAL` |
| H. Suivi financier de projet | `FIN` |

---

# SOMMAIRE

**A. Inscription & identité du professionnel**
- `INS-01` — Vérification, validation et unicité du RCCM et du numéro de contribuable
- `INS-02` — Gestion du logo lors de l'inscription
- `INS-03` — Création obligatoire de la page professionnelle publique
- `INS-04` — Badge « Vérifié par MEEREO »
- `INS-05` — Génération automatique, enregistrement et partage de l'URL publique
- `INS-06` — Validation par étape de l'onboarding & sortie d'impasse

**B. Annuaire & appels d'offres**
- `ANN-01` — Recherche des entreprises dans les appels d'offres privés
- `ANN-02` — Affichage des entreprises dans les appels d'offres privés
- `ANN-03` — Refonte de la Bourse des appels d'offres
- `ANN-04` — Performances de l'annuaire des professionnels
- `ANN-05` — Compatibilité multi-navigateurs de l'annuaire

**C. Messagerie & communication**
- `MSG-01` — Contact d'une entreprise sans page publique
- `MSG-02` — Refonte complète de la messagerie
- `MSG-03` — Notification « lu / non-lu » des messages
- `MSG-04` — Conversation unique par binôme Client ↔ Professionnel
- `MSG-05` — Intégration native des API de communication (messagerie, appels vocaux/vidéo)
- `MSG-06` — Synchronisation instantanée d'une nouvelle conversation (sans refresh)
- `MSG-07` — Conversation projet multi-participants (ajout d'intervenants)

**D. Stabilité, session & navigation**
- `NAV-01` — Retour intempestif vers la landing page
- `NAV-02` — Déconnexions et sorties inattendues
- `NAV-03` — Conservation de la page active lors d'un rafraîchissement
- `NAV-04` — Logo absent sur la page professionnelle
- `NAV-05` — Lien « Paramètres » inopérant dans le menu de l'avatar
- `NAV-06` — « Token manquant » : requêtes non authentifiées

**E. Cycle de vie & suivi des projets**
- `PRJ-01` — Validation d'un marché et création automatique du projet
- `PRJ-02` — Arrêt, clôture, archivage et suppression des projets
- `PRJ-03` — Synchronisation des notes d'avancement avec le client
- `PRJ-04` — Synchronisation des images Professionnel ↔ Client
- `PRJ-05` — Assignation & gestion des intervenants (4 sources, accès sous-traité)
- `PRJ-06` — Équipe : cycle de vie complet (référentiel, page publique, projets)
- `PRJ-07` — Suivi chantier : avancement, validation par section & notes
- `PRJ-08` — Refonte de la visualisation documentaire et de la chronologie
- `PRJ-09` — Système visuel d'identification des projets (couleurs)
- `PRJ-10` — Cohérence des données Client ↔ Professionnel

**F. Avis, notifications & données de compte**
- `AVS-01` — Avis, notation et affichage centralisé des évaluations
- `AVS-02` — Gestion des notifications
- `AVS-03` — Suppression des profils et réutilisation des adresses e-mail

**G. Qualité transverse**
- `QAL-01` — Optimisation générale des performances
- `QAL-02` — Source unique et affichage universel du logo d'entreprise
- `QAL-03` — Correction orthographique et grammaticale

**H. Suivi financier de projet**
- `FIN-01` — Suivi financier de projet : Budget, Phases, Marchés, Paiements
- `FIN-02` — Paiements intégrés Mobile Money (KAi Pro & Marketplace)
- `FIN-03` — Monétisation Marketplace : commission & stratégie en 3 phases

**I. Cycle appel d'offres & marchés** *(cadré v1.4)*
- `AOF-01` — Cycle de vie complet appel d'offres → marché
- `AOF-02` — Offres reçues & comparaison (côté émetteur)
- `AOF-03` — Réponse d'un professionnel à un appel d'offres

**J. Marketplace & espace fournisseur** *(cadré v1.11)*
- `MKT-01` — Catalogue produits du fournisseur
- `MKT-02` — Commande, paiement & livraison (Marketplace)
- `MKT-03` — Espace fournisseur (structure réelle)
- `MKT-04` — Produits sponsorisés (publicité Marketplace)
- `MKT-05` — KAi : surveillance de stock & conseil commercial

**K. Fondations transverses** *(ajouté audit v1.3)*
- ~~`SYS-01` — Passeport Numérique du projet~~ *(RETIRÉ v1.10 — simplification MVP, réversible)*
- `SYS-02` — Matrice de droits et permissions par rôle
- `SYS-03` — Expérience mobile : web responsive puis app native
- `SYS-04` — Multilingue (Français + Anglais dès le lancement)
- `SYS-05` — Gestion des fichiers & documents
- `SYS-06` — Paramètres, page pro & aperçu public : trois portes distinctes

---

# A. INSCRIPTION & IDENTITÉ DU PROFESSIONNEL

## `INS-01` — Vérification, validation et unicité du RCCM et du numéro de contribuable
**Statut : À CORRIGER + RÈGLE**

Lors de l'inscription d'un professionnel, les champs RCCM et Numéro de contribuable affichent des valeurs d'exemple destinées uniquement à illustrer le format attendu.

**Règles à appliquer :**

- Ces valeurs d'exemple ne doivent **jamais** pouvoir être enregistrées comme données réelles. Toute tentative de validation avec ces valeurs doit être **refusée automatiquement**, avec un message invitant à renseigner les véritables informations.
- Une fois le formulaire validé, le RCCM et le numéro de contribuable deviennent les **identifiants administratifs officiels** de l'entreprise et sont enregistrés de façon **permanente** en base de données.
- Lorsque le professionnel dépose ensuite ses documents officiels (RCCM, attestation fiscale, etc.), l'**IA** doit automatiquement : analyser les documents, extraire les informations administratives, identifier les numéros RCCM et de contribuable, et les comparer à ceux renseignés à l'inscription.
- **En cas d'écart**, le système doit **bloquer immédiatement** la validation du compte, signaler l'anomalie et demander une correction.
- Ces deux identifiants doivent être **strictement uniques** sur toute la plateforme : un numéro déjà associé à une entreprise ne peut jamais être réutilisé par une autre.

> **Dépendance :** prérequis de `INS-04` (le badge dépend de cette vérification IA).

---

## `INS-02` — Gestion du logo lors de l'inscription
**Statut : RÈGLE**

Le système doit garantir qu'**un seul logo officiel** est associé à un compte professionnel, à tout moment.

- Si un professionnel importe un logo puis en génère un via l'IA, le logo importé est **définitivement remplacé** par le logo généré.
- S'il importe ensuite un nouveau logo personnalisé, celui-ci **remplace** le logo généré.
- À aucun moment plusieurs logos ne doivent coexister.

> **Dépendance :** ce logo officiel unique est la source du logo propagé partout (`QAL-02`).

---

## `INS-03` — Création obligatoire de la page professionnelle publique
**Statut : À CORRIGER + RÈGLE**

La création de la page professionnelle publique fait partie intégrante de l'onboarding.

**Comportement attendu :** à la toute première connexion au tableau de bord, un **popup obligatoire** s'affiche immédiatement pour inviter le professionnel à créer sa page publique, dès le premier chargement, sans action de l'utilisateur.

**Comportement actuel (bug) :** le popup n'apparaît qu'après un **rafraîchissement manuel**. À corriger.

**Règle de blocage :** tant que la page publique n'est pas créée, le professionnel ne peut **pas** accéder aux autres fonctionnalités. Étape **bloquante**.

---

## `INS-04` — Badge « Vérifié par MEEREO »
**Statut : À DÉVELOPPER + RÈGLE**

Le badge officiel « Vérifié par MEEREO » distingue les entreprises ayant fourni et fait valider leurs documents administratifs.

**Logique de déclenchement (arbitrage tranché) :** le badge est déclenché par le **dépôt du RCCM + vérification automatique du numéro par l'IA**. Le simple dépôt d'un fichier ne suffit pas : le numéro extrait doit correspondre à celui déclaré. *(Option retenue plutôt qu'un dépôt sans contrôle — badge non fiable — ou une validation 100 % humaine — non scalable. Voir Journal des versions.)*

Conditions cumulatives d'activation :

- le professionnel a déposé son **RCCM** dans la section **Documents** ;
- l'**IA a analysé** le document ;
- le **numéro RCCM extrait correspond exactement** à celui de l'inscription (`INS-01`) ;
- les contrôles administratifs sont **validés avec succès**.

Tant que le RCCM n'est pas déposé **et** vérifié, le professionnel n'est **pas** vérifié et le badge ne s'affiche pas.

**Affichage :** badge **vert**, couleur **strictement identique** partout, **visible sur toutes les interfaces** où le professionnel apparaît (page publique, résultats de recherche, annuaire, appels d'offres, toute autre interface).

**Circuit à vérifier de bout en bout :** dépôt enregistré → traitement IA + comparaison → résultat persisté en base → badge affiché automatiquement → badge maintenu sur toutes les interfaces sans incohérence.

> **Dépendances :** dépend de `INS-01`. L'état « vérifié » provient d'une **source unique** partagée (même principe que `AVS-01` et `QAL-02`).

---

## `INS-05` — Génération automatique, enregistrement et partage de l'URL publique
**Statut : À CORRIGER + À DÉVELOPPER**

**Bug actuel :** la création de l'URL publique n'est pas opérationnelle.

Lorsqu'un professionnel crée sa page et renseigne le nom de son entreprise, la plateforme doit générer **automatiquement une URL publique unique** d'accès direct, partageable sur tous ses canaux (site, e-mail, WhatsApp, LinkedIn, Facebook, Instagram, X, etc.).

**Fonctionnement attendu :**

- URL **unique générée automatiquement** dès la création de la page.
- **Construite à partir du nom** de l'entreprise, avec **unicité garantie**.
- En cas de conflit, **variante disponible générée automatiquement** (suffixe/incrément).
- **Consultation, copie et partage** faciles depuis l'espace professionnel.
- **Redirection directe** vers la page publique.
- **Génération, enregistrement et partage** entièrement fonctionnels et persistés.

**Objectif :** un lien public **permanent, stable et partageable** par entreprise.

> Test de bout en bout : saisie du nom → génération → gestion du conflit d'unicité → enregistrement → rechargement → persistance → redirection.

---

## `INS-06` — Validation par étape de l'onboarding & sortie d'impasse
**Statut : À CORRIGER + RÈGLE**

**Bug bloquant actuel :** il est possible de progresser dans les étapes de création de compte **sans avoir renseigné des informations obligatoires** (notamment l'adresse e-mail). L'utilisateur atteint la dernière étape, clique sur « Accéder au Cockpit », et l'accès est **refusé** car l'e-mail manque. Il n'a alors **aucun moyen simple** de revenir à l'étape concernée : **impasse (dead-end)**, sans indication ni solution.

**Fonctionnement attendu — validation par étape :**

- Chaque étape **valide les champs obligatoires** avant d'autoriser le passage à la suivante.
- **Impossible** de passer à l'étape suivante si les champs obligatoires de l'étape courante ne sont pas remplis.
- Les boutons « Suivant » / « Continuer » / « Accéder au Cockpit » restent **désactivés** tant que les champs obligatoires ne sont pas valides.
- Chaque champ concerné affiche un **message d'erreur clair** indiquant l'information manquante. L'utilisateur sait **toujours pourquoi** il ne peut pas continuer.

**Sortie d'impasse (filet de sécurité) :** si, malgré tout, une information obligatoire est détectée manquante à la dernière étape, la plateforme doit **soit** rediriger automatiquement l'utilisateur vers l'étape concernée, **soit** ouvrir directement la fenêtre permettant de compléter l'information. L'utilisateur ne doit **jamais** rester bloqué sans issue.

**Audit complet du parcours demandé :** identifier tous les cas où un utilisateur peut contourner une validation, accéder à une étape sans avoir rempli les champs requis, terminer un parcours incomplet, ou se retrouver dans une impasse. **Objectif : il doit être impossible de terminer un onboarding incomplet, et aucune situation ne doit bloquer définitivement l'utilisateur.**

> **Portée :** s'applique aux trois parcours d'inscription (Client, Professionnel, Fournisseur). Cohérent avec `INS-01` (l'e-mail et les identifiants légaux obligatoires doivent être validés **à l'étape où ils sont saisis**, pas à la fin).
> **Dépendance UX :** ne pas casser la structure 3-profils existante ; la validation par étape s'ajoute sans alourdir le parcours (principe « démarrer vite, compléter ensuite » réservé aux champs **non** obligatoires).
> **Complément technique (v1.27) :** hypothèses de cause, architecture cible et protocole de vérification en **Annexe 3, section A3.2**.

---

# B. ANNUAIRE & APPELS D'OFFRES

## `ANN-01` — Recherche des entreprises dans les appels d'offres privés
**Statut : À DÉVELOPPER**

Lors de la création d'un appel d'offres privé, l'utilisateur doit pouvoir rechercher rapidement les entreprises de l'annuaire par : **nom, mots-clés, spécialités, domaines d'expertise**. Résultats **instantanés**, ajout rapide d'une ou plusieurs entreprises.

---

## `ANN-02` — Affichage des entreprises dans les appels d'offres privés
**Statut : À CORRIGER**

Chaque entreprise listée doit présenter au minimum : **logo, nom, domaines d'expertise** (et si possible localisation, niveau de vérification).

**Bug actuel :** les logos ne s'affichent pas correctement, dans les appels d'offres privés **et** dans « Rechercher un professionnel ». À corriger dans les deux contextes.

> Manifestation locale du problème traité globalement en `QAL-02` (source unique du logo). À corriger via ce principe transverse, pas isolément.
> **Étoiles :** vérifier que les étoiles affichées sur les fiches sont bien reliées au système d'avis centralisé (`AVS-01`), non calculées localement.

---

## `ANN-03` — Refonte de la Bourse des appels d'offres
**Statut : À DÉVELOPPER**

Refonte de l'interface de la Bourse des appels d'offres :

- revoir **entièrement le design** (lisibilité, UX) ;
- améliorer la **visibilité** des appels d'offres disponibles ;
- ajouter une **notification visible** à côté de la rubrique lorsqu'un nouvel appel d'offres est publié.

> La notification s'appuie sur le système global de notifications (`AVS-02`).

---

## `ANN-04` — Performances de l'annuaire des professionnels
**Statut : À CORRIGER**

Temps de chargement trop élevé. Optimiser : ouverture des pages, chargement des profils/logos/images, recherches multicritères et filtres, pagination, appels API et requêtes base de données.

**Objectif :** affichage quasi instantané, même avec plusieurs milliers de professionnels.

---

## `ANN-05` — Compatibilité multi-navigateurs de l'annuaire
**Statut : À CORRIGER**

L'annuaire fonctionne sous Chrome mais dysfonctionne sous **Safari** (non-affichage, fonctionnalités inopérantes, composants mal chargés).

Analyser les écarts : JavaScript, CSS, WebKit, appels API, cache, composants React, gestion des événements, performances de rendu.

**Objectif :** fonctionnement identique sur **Safari, Chrome, Edge, Firefox**.

---

# C. MESSAGERIE & COMMUNICATION

## `MSG-01` — Contact d'une entreprise sans page publique
**Statut : CADRÉ — DÉVELOPPABLE**

**Bug actuel :** le bouton « Contacter l'entreprise » est visible même sans page publique, mais les messages envoyés ne sont **jamais reçus** (perdus dans le vide). Comportement pire qu'un bouton absent : l'utilisateur croit avoir envoyé un message qui n'arrivera jamais.

**Décision : Solution 2 — transmission garantie.** Un message envoyé **arrive toujours**, jamais perdu. Trois cas à couvrir :

1. **Entreprise inscrite, page publique complète** → contact normal, message livré dans sa messagerie (`MSG-04`).
2. **Entreprise inscrite, page publique incomplète** (onboarding non terminé) → le message est **livré quand même** dans sa messagerie ; l'absence de page publique finalisée ne bloque pas la réception.
3. **Entreprise seulement référencée** (présente dans l'annuaire, sans compte encore créé) → le message est **retenu**, et l'entreprise reçoit une **invitation à s'inscrire pour le lire**. À l'inscription, elle **retrouve le message en attente** dans sa messagerie.

**Levier d'acquisition (cas 3).** Ce mécanisme transforme une demande de contact en **opportunité d'inscription** : « un client vous a contacté sur MEEREO, inscrivez-vous pour lire son message ». Motivation concrète et personnelle de rejoindre la plateforme — cohérent avec la stratégie d'acquisition (Phase 1, `FIN-03`).

> **⚠️ Condition (cas 3) :** l'envoi de l'invitation suppose qu'on dispose d'au moins un **canal de contact** de l'entreprise référencée (email ou téléphone). Une entreprise référencée **sans aucune coordonnée** ne peut pas être invitée — dans ce cas, soit le bouton contact est masqué pour elle, soit le message reste en attente sans notification possible. À gérer côté données de l'annuaire.

> **Dépendances :** `MSG-04` (livraison dans la conversation unique), `INS-03` (page publique obligatoire à l'inscription — limite le cas 2), `AVS-02` (notification/invitation), stratégie d'acquisition `FIN-03`.

---

## `MSG-02` — Refonte complète de la messagerie
**Statut : À CORRIGER + RÈGLE**

Module critique, encore instable. Refonte pour une communication **fiable, instantanée et sécurisée**.

**Problèmes constatés :** messages Client→Professionnel non reçus ; bouton Messagerie inopérant sur les pages pro ; bouton Contacter incohérent ; notifications absentes ; logos absents dans les conversations (cf. `QAL-02`) ; pas de synchronisation temps réel ; rafraîchissement manuel nécessaire ; performances insuffisantes.

**Règles métier — côté Client :** accès **uniquement** aux professionnels avec relation de travail, aux entreprises de ses projets, et à la recherche **via l'annuaire**. Jamais d'accès à la liste des autres clients.

**Règles métier — côté Professionnel :** *(comportement actuel non conforme : accès à la liste complète des clients — interdit).* Accès **uniquement** aux clients de son CRM, à ses relations d'affaires actives/passées, aux entreprises déjà collaborées. Recherche d'autres entreprises **obligatoirement via l'annuaire**, jamais via la messagerie.

**Synchronisation temps réel :** chaque message transmis instantanément, affiché immédiatement, notifié, répercuté sur les compteurs, **sans rafraîchissement manuel**. Architecture partagée avec `MSG-05`.

---

## `MSG-03` — Notification « lu / non-lu » des messages
**Statut : À CORRIGER**

**Bug actuel :** la notification de nouveau message n'apparaît que quelques secondes puis disparaît, et le message est marqué **lu** alors qu'il n'a jamais été ouvert.

**Fonctionnement attendu :**

- la notification **reste visible** tant que le destinataire n'a pas **ouvert et lu** le message ;
- un message n'est marqué **lu** qu'**après ouverture effective** (pas à la réception ni à l'affichage transitoire).

**Implication technique :** l'état « lu » est piloté par un **événement d'ouverture réel** de la conversation, pas par un délai. Le compteur de non-lus (`AVS-02`) reflète strictement cet état.

---

## `MSG-04` — Conversation unique par binôme Client ↔ Professionnel
**Statut : À CORRIGER + RÈGLE**

**Bug actuel :** un même binôme peut avoir plusieurs conversations distinctes (une au premier échange, une à l'appel d'offres, une après validation du marché).

**Cas concret constaté (à corriger en priorité) :** côté client, la liste des messages affiche **deux conversations pour le même projet avec la même entreprise** — par exemple « Conception — MILLENIUM CONSTRUCTION » (conversation directe) **et** « Projet : Conception » (conversation projet) coexistent. C'est le doublon exact que cette règle interdit : il ne doit exister **qu'une seule** conversation par binôme/projet.

**Fonctionnement attendu :**

- **une seule conversation unique** par binôme Client ↔ Professionnel ;
- elle **évolue au fil des étapes** (contact → appel d'offres → validation → suivi) **sans créer de nouvelle discussion** ;
- une conversation « directe » et une conversation « projet » pour le même binôme doivent être **fusionnées en une seule** (pas de séparation directe/projet).

**Nommage contextuel (selon le rôle qui regarde) :** c'est le même objet conversation, mais son libellé s'adapte au destinataire :

- **Côté professionnel** : afficher le **nom du projet** seul (le pro sait déjà avec quelle entreprise il traite — c'est lui).
- **Côté client** : afficher le **nom du projet + le nom de l'entreprise** (le client peut avoir plusieurs pros sur plusieurs projets, il a besoin des deux repères).

**Implication technique :** conversation identifiée par le **binôme d'UUID** (client + professionnel, cf. `AVS-03`), rattachée au projet, **jamais recréée**. Les événements (appel d'offres, validation, suivi) se **rattachent** à la conversation existante. L'affichage du libellé est calculé **à la lecture, selon le rôle** de l'utilisateur courant — la donnée sous-jacente reste unique (SSOT).

> **Lien :** `MSG-07` (l'ajout d'intervenants étend cette conversation unique, ne la duplique pas).

---

## `MSG-05` — Intégration native des API de communication
**Statut : À DÉVELOPPER**

Messagerie instantanée, appels vocaux et vidéo sur une architecture API **entièrement intégrée**. Aucune redirection vers un service externe.

Appels audio/vidéo accessibles depuis une conversation : démarrage instantané, passage vocal→vidéo, notifications d'appel entrant, gestion des refus/manqués, état de connexion. Sécurité, confidentialité et performance de niveau professionnel.

> **Dépendance :** repose sur l'architecture temps réel de `MSG-02`.

---

## `MSG-06` — Synchronisation instantanée d'une nouvelle conversation (sans refresh)
**Statut : À CORRIGER**

**Bug actuel :** quand un client consulte la page publique d'un professionnel et clique sur « Contacter », une nouvelle conversation est créée et le message est bien envoyé — **mais la conversation n'apparaît pas immédiatement** dans la liste du client. Il faut **rafraîchir la page** pour la voir. L'utilisateur a l'impression que le message n'est pas parti : très mauvaise expérience.

**Comportement attendu (sans aucun refresh manuel) :**

- Dès l'envoi du **premier message**, la nouvelle conversation est **créée instantanément** dans la liste des conversations.
- Cette conversation devient **automatiquement la conversation active**.
- Le message envoyé **apparaît immédiatement** dans le fil de discussion.
- Le **compteur de conversations** est mis à jour en temps réel.
- **Toutes les vues concernées** restent synchronisées : liste des conversations, fenêtre de discussion, notifications, badges.

**Pistes d'analyse à investiguer (fournies par MEEREO, à confirmer par le dev) :**

- rafraîchissement du **cache React** ;
- absence d'**invalidation des requêtes** (query invalidation) ;
- problème de **gestion d'état** (state management) ;
- absence de **mise à jour optimiste** (Optimistic UI) ;
- défaut de **synchronisation temps réel**.

**Cible de qualité :** messagerie réactive, fluide et instantanée, comparable à WhatsApp, Slack ou Messenger — chaque action reflétée immédiatement dans l'interface, sans rechargement.

> **Complément technique (v1.27) :** hypothèses de cause, architecture cible (optimistic UI, réconciliation, source unique) et protocole de vérification en **Annexe 3, section A3.1**.

> **Dépendances :** manifestation directe du besoin de temps réel de `MSG-02` ; s'articule avec `MSG-04` (la conversation créée doit être **la** conversation unique du binôme, pas une nouvelle) et `MSG-03` / `AVS-02` (compteurs et badges synchronisés). À traiter dans le même chantier temps réel que `MSG-02`.

---

## `MSG-07` — Conversation projet multi-participants (ajout d'intervenants)
**Statut : CADRÉ — DÉVELOPPABLE**

Sur un projet, le professionnel responsable peut **intégrer un ou plusieurs intervenants** à la discussion avec le client, pour échanger à plusieurs.

### Décisions de cadrage

- **G1 — Extension, pas nouvelle conversation.** Ajouter des participants **étend la conversation unique** client↔pro (`MSG-04`) ; cela ne crée **pas** une conversation séparée. La conversation unique devient une **conversation de projet multi-participants**, sans violer le principe « une conversation par relation ».
- **G2 — L'intervenant participe à la messagerie mais reste aveugle au reste.** L'ajout à la discussion est la **seule** exception à `PRJ-05`/I3 : l'intervenant peut lire et écrire dans la conversation, mais **ne voit ni le Cockpit, ni l'avancement, ni le budget, ni les documents** du projet. Sa présence est strictement conversationnelle.
- **G3 — Seul le professionnel responsable du marché** peut ajouter (ou retirer) des intervenants dans la discussion. Ni le client ni les intervenants n'ont ce droit.
- **G4 — Confidentialité de l'historique (règle prudente par défaut).** Un intervenant ajouté ne voit **que les messages postérieurs à son ajout** ; il n'accède pas à l'historique client↔pro antérieur (qui peut contenir des échanges privés sur les prix, etc.). *À confirmer si tu veux au contraire donner tout l'historique.*

### Comportement

- Le pro ouvre la conversation projet et ajoute un ou plusieurs intervenants (parmi ceux qu'il peut déjà assigner, `PRJ-05` : équipe, annuaire, etc.).
- Les participants ajoutés reçoivent une notification (`AVS-02`) et voient la conversation dans leur messagerie.
- Le retrait d'un intervenant met fin à sa participation ; il ne voit plus les nouveaux messages.
- Tous les participants voient qui est dans la conversation (transparence sur la composition du groupe).

> **Dépendances :** `MSG-04` (conversation unique étendue), `PRJ-05`/I3 (dont G2 est l'exception), `SYS-02` (droit d'ajout réservé au pro responsable), `AVS-02` (notifications d'ajout).

---

# D. STABILITÉ, SESSION & NAVIGATION

> **Note transverse :** `NAV-01`, `NAV-02` et `NAV-03` partagent une **cause racine probablement commune** (gestion de session / routing / persistance d'état front). À traiter dans une **investigation technique unique**, pas en trois correctifs séparés.

## `NAV-01` — Retour intempestif vers la landing page
**Statut : À CORRIGER**

Un dysfonctionnement renvoie régulièrement vers la landing page alors que l'utilisateur est connecté.

**Règle :** hors déconnexion volontaire, expiration de session ou contrainte de sécurité, aucun renvoi automatique vers la landing page.

---

## `NAV-02` — Déconnexions et sorties inattendues
**Statut : À CORRIGER**

Plusieurs dysfonctionnements provoquent sortie inattendue, redirection non souhaitée ou perte de session.

**Aucune action utilisateur** ne doit entraîner : fermeture de session, déconnexion involontaire, redirection vers la landing page, retour forcé au tableau de bord, perte de contexte, rechargement complet injustifié.

**Opérations devant se dérouler sans interruption :** navigation entre modules, validation de formulaires, changement d'onglet, téléchargement de documents, création/modification de projets, consultation de profils, ouverture de la messagerie, actualisation de données.

Analyse complète requise (sessions, authentification, tokens, cache, appels API, états React).

---

## `NAV-03` — Conservation de la page active lors d'un rafraîchissement
**Statut : À CORRIGER + RÈGLE**

Après un rafraîchissement, l'utilisateur retrouve : la même page, le même onglet actif, les mêmes filtres, la même position, les mêmes données (si techniquement possible).

**Interdit :** qu'un rafraîchissement redirige vers le tableau de bord, la landing page ou une autre section.
**Exceptions autorisées :** expiration de session, déconnexion volontaire, contrainte de sécurité.

S'applique à **tous les modules**.

---

## `NAV-04` — Logo absent sur la page professionnelle
**Statut : À CORRIGER**

Le logo de l'en-tête de la page professionnelle (haut à droite) ne s'affiche pas. À corriger.

> Cas particulier du principe transverse `QAL-02`.

---

## `NAV-05` — Lien « Paramètres » inopérant dans le menu de l'avatar
**Statut : À CORRIGER**

**Bug constaté (espace fournisseur) :** dans le menu déroulant de l'avatar en haut à droite, l'entrée **« Paramètres »** ne renvoie pas vers la section Paramètres. Le lien est mort ou mal câblé.

**Attendu :** le clic ouvre la section Paramètres (`SYS-06`), exactement comme l'entrée « Paramètres » de la barre latérale.

**Contrôle à étendre à tous les rôles et à tous les accès.** Les Paramètres sont atteignables depuis **plusieurs points d'entrée** — barre latérale (section COMPTE), menu de l'avatar, et carte « Paramètres · Configurer votre espace » de la section EXPLORER sur l'accueil fournisseur. **Tous** doivent mener au même écran. Vérifier chacun, pour les trois rôles (client, professionnel, fournisseur).

> **Tranché (23/07/2026) : les trois points d'entrée sont conservés** — barre latérale, menu de l'avatar et carte EXPLORER. L'accès aux Paramètres doit être facile depuis n'importe où. **En contrepartie, les trois doivent être testés systématiquement** : c'est la multiplication des chemins qui a permis à l'un d'eux de casser sans être détecté. À inscrire dans les vérifications de non-régression.

> **Dépendances :** `SYS-06` (destination), `QAL-01` (qualité de navigation).

---

## `NAV-06` — « Token manquant » : requêtes non authentifiées
**Statut : À CORRIGER**

**Bug constaté (espace fournisseur) :** la suppression de compte depuis Paramètres › Données échoue avec le message **« token manquant »**. La requête part **sans jeton d'authentification** — le serveur ne peut pas identifier le demandeur et refuse l'opération.

**Deux causes possibles à investiguer :**
1. **Le jeton n'est pas transmis** par le front sur cet appel précis (bug d'implémentation isolé).
2. **La session a expiré** sans que l'interface ne le détecte — dans ce cas le problème dépasse cette action et rejoint `NAV-02` (déconnexions et sorties inattendues).

**Contrôle général demandé.** Ne pas corriger uniquement la suppression de compte : **vérifier l'ensemble des appels authentifiés** de la plateforme (toutes actions, tous rôles) pour s'assurer que le jeton est systématiquement transmis et valide. Un jeton manquant peut affecter silencieusement d'autres opérations.

**Exigence complémentaire :** si une session a réellement expiré, l'interface doit le **signaler clairement** et proposer une reconnexion — jamais afficher un message technique brut comme « token manquant » à l'utilisateur final (`QAL-03`).

> **Dépendances :** `NAV-02` (sessions), `AVS-03` (suppression de compte), `QAL-01`, `QAL-03`.

---

# E. CYCLE DE VIE & SUIVI DES PROJETS

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

---

# F. AVIS, NOTIFICATIONS & DONNÉES DE COMPTE

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

> **⚠️ Exigence de protection de l'acheteur.** Puisque MEEREO cesse d'héberger la relation, l'acheteur ne doit pas découvrir seul que son fournisseur a disparu. Avant/lors de la suppression, la plateforme doit **notifier chaque acheteur ayant une commande en cours** (`AVS-02`) et lui **transmettre les coordonnées du fournisseur** pour qu'il puisse poursuivre en direct. Sans cela, l'acheteur se retournera vers MEEREO — qui n'aura plus ni trace ni interlocuteur.

> **Factures MEEREO impayées — suppression bloquée (tranché 23/07/2026).** Si le fournisseur a un **solde dû** à MEEREO (quota de produits, sponsoring, abonnement — `FIN-03`), **la suppression de compte est refusée** tant que le solde n'est pas réglé. Le message doit indiquer clairement le montant dû et la voie de règlement. *Objectif : empêcher qu'un compte soit supprimé pour échapper à une dette.*

---

# G. QUALITÉ TRANSVERSE

## `QAL-01` — Optimisation générale des performances
**Statut : À DÉVELOPPER**

Optimisation globale de l'architecture, pour une expérience proche du natif.

**Performances :** temps de chargement, requêtes API/BD, réduction des appels inutiles, optimisation médias, cache intelligent, lazy loading.
**Fluidité :** aucune impression de blocage ou de rechargement inutile (transitions, modules, onglets, recherches, mises à jour instantanés).
**Temps réel :** messagerie, notifications, projets, documents, images, notes, appels d'offres synchronisés immédiatement.
**Compatibilité :** identique sur Safari, Chrome, Edge, Firefox.
**Stabilité :** aucune déconnexion intempestive, perte de données, redirection involontaire, rechargement injustifié, ou souci de cache.

---

## `QAL-02` — Source unique et affichage universel du logo d'entreprise
**Statut : À CORRIGER + RÈGLE**

**Bug actuel :** logos des entreprises mal affichés, notamment côté **profil Client** ; absents de plusieurs sections. Nuit à l'identification et à la cohérence visuelle.

Ce point pose la **règle transverse** qui unifie les occurrences locales (`ANN-02`, `MSG-02`, `NAV-04`) : régler à la **source**, pas écran par écran.

**Principe de source unique :**

- logo **récupéré automatiquement** depuis le **profil professionnel** (logo officiel unique `INS-02`) ;
- **toutes** les interfaces utilisent **une seule source** ; aucune copie/recalcul local ;
- toute **modification** du logo **répercutée automatiquement** partout, sans décalage.

**Visible impérativement dans :** projets du client, appels d'offres, résultats de recherche, annuaire, conversations/messagerie (entreprise identifiée), fiches pro, notifications, **toute** section où une entreprise apparaît.

**Absence de logo :** même **placeholder unique** partout (initiales / icône générique), jamais d'image cassée.

> **Cohérence architecturale :** même principe de **source unique centralisée** que `AVS-01` (avis) et `INS-04` (statut vérifié). Ces trois données — logo, avis, badge — proviennent d'un **référentiel unique** attaché au profil professionnel.
> **Complément technique (v1.27) :** hypothèses de cause (récupération indépendante par composant, copie dénormalisée obsolète, cache non invalidé) et protocole de vérification en **Annexe 3, section A3.3**.

---

## `QAL-03` — Correction orthographique et grammaticale
**Statut : À CORRIGER**

Correction linguistique complète des textes visibles : libellés d'interface ; messages d'erreur/système ; notifications (in-app, email, SMS) ; popups et confirmations ; contenus générés par l'IA ; emails transactionnels ; contenus statiques (légal, CGU, aide, FAQ) ; pages publiques générées.

Couvre orthographe, grammaire, conjugaison, ponctuation et **cohérence terminologique** (mêmes termes pour mêmes concepts). Relecture systématique recommandée (CI ou relecture avant mise en production).

> **Note :** la liste précise des fautes (captures, pages, champs) sera fournie séparément par MEEREO.

---

# H. SUIVI FINANCIER DE PROJET

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

  > **⚠️ À rouvrir avec le partenaire bancaire.** Le jour où les gros paiements passent par la plateforme, l'historisation inaltérable complète (D10 d'origine + `SYS-01`) devra être réactivée : c'est elle qui fait de MEEREO un « registre de preuve » et qui protège le garde-fou « client passif » (D6). Simplification assumée et **réversible** au stade actuel.
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

**⚠️ Contrainte réglementaire déterminante.** Encaisser l'argent d'un tiers exige un **agrément d'établissement de paiement**, coûteux et long à obtenir — **MEEREO ne l'a pas au démarrage**. L'argent des ventes transite **directement de l'acheteur au fournisseur** (moyens Mobile Money configurés par le fournisseur, `SYS-06`).

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

> **⚠️ Deux limites assumées.** (a) Le revenu dépend du **nombre et de l'engagement des fournisseurs**, pas du volume de ventes : un gros vendeur ne rapporte pas plus qu'un petit, sauf s'il achète de la visibilité — la croissance du chiffre d'affaires est donc plus plate que celle de l'activité. (b) **La visibilité ne se vend que s'il y a de l'audience** : ce modèle exige d'attirer **d'abord les acheteurs** (clients et professionnels), sinon il n'y a rien à vendre aux fournisseurs.

### Phase 3 — Escrow + logistique (cible) : introduction de la commission

Intégration d'un **partenaire bancaire (escrow)** et d'un **partenaire logistique** :
- Le paiement des **gros devis transite par un compte séquestre MEEREO** → l'argent **repasse par la plateforme** → la commission est prélevée automatiquement, **y compris sur l'offline**. L'escrow résout **deux problèmes d'un coup** : sécurité de la livraison ET perception de la commission sur les gros montants.
- Le **partenaire logistique** (suivi live, validation mobile de livraison, signature) **déclenche la libération de l'escrow** : livraison confirmée → fonds libérés → commission prélevée. Escrow et logistique sont **couplés** (`MKT-02`, section livraison cible).
- Le forfait fournisseur (Phase 2) peut alors être **complété ou remplacé** par la commission transactionnelle sur l'offline.

> **⚠️ Dépendances réglementaires (Phase 3).** L'escrow suppose un partenaire **agréé établissement de paiement** — mêmes exigences que le partenaire bancaire des gros marchés (`FIN-01`/D10) et que la traçabilité inaltérable (`SYS-01`, à réactiver). Ces trois besoins (gros marchés, escrow Marketplace, traçabilité) peuvent être servis par **le même partenaire** — à mutualiser lors de la recherche.

> **À définir (décisions business) :** taux de commission (fixe ? variable par catégorie ? dégressif ?) ; montant et paliers du forfait fournisseur ; seuil en ligne/hors ligne (`MKT-02`) ; délai et seuil de reversement au fournisseur.
> **Dépendances :** `FIN-02` (Mobile Money), `MKT-02` (ventes & livraison), `MKT-04` (pub), `SYS-02`.

---

# I. CYCLE APPEL D'OFFRES & MARCHÉS

> **Comblé lors de l'audit v1.2.** Ce domaine décrit le **cœur transactionnel** de la plateforme, jusque-là absent : comment une intention client devient un marché signé. Il relie `ANN-03` (Bourse), `AVS-01` (avis en fin de mission) et `FIN-01` (le marché = objet financier).

## `AOF-01` — Cycle de vie complet appel d'offres → marché
**Statut : CADRÉ — DÉVELOPPABLE**

### Décisions de cadrage (socle du cycle)

- **A1 — Émetteurs.** Peuvent publier un AO : le **Client** et le **Professionnel**. Un pro publie un AO pour **sous-traiter** (relation pro→pro), régie par **exactement les mêmes règles** que client→pro. Un même pro est donc tour à tour émetteur (il cherche des sous-traitants) et répondeur (il répond aux AO).
- **A2 — Types.** Deux types coexistent : **Public** (diffusé dans la Bourse `ANN-03` aux pros du bon secteur) et **Privé** (ciblé sur des entreprises choisies dans l'annuaire, `ANN-01`). L'émetteur choisit à la publication.
- **A3 — Portée : globale.** Un AO porte sur **tout le projet**. Le lauréat est une **entreprise générale** qui prend l'ensemble (1 marché global). Le découpage en phases/corps d'état (`FIN-01`) devient **interne à cette entreprise**, qui sous-traite le cas échéant via ses propres AO (A1). Le client conserve **un interlocuteur unique**.
- **A6 — Acceptation = marché signé.** L'acceptation d'une offre par le client **crée directement le marché** (objet unique « Marchés », `FIN-01`). **Règle explicite : l'offre déposée vaut engagement du professionnel ; l'acceptation par le client scelle le marché sans re-signature.** Pas d'étape de contre-signature.
- **A8 — Fermeture.** Un AO se **ferme automatiquement** dès qu'une offre est acceptée.

### Flux de bout en bout

1. **Publication.** L'émetteur (client ou pro) publie l'AO : objet du projet, budget indicatif, localisation, délai, pièces jointes, type (public/privé). Alimenté par les données déjà connues (aiguillage KAi à l'inscription) — **pas de double saisie** (`D10`/SSOT).
2. **Diffusion.** Public → Bourse (`ANN-03`) ; Privé → entreprises ciblées (`ANN-01`). Notification aux pros concernés (`AVS-02`).
3. **Réponse.** Les pros déposent une **offre** (`AOF-03`).
4. **Comparaison.** L'émetteur consulte et compare les offres reçues (`AOF-02`).
5. **Sélection.** L'émetteur **accepte une offre** → les autres sont **refusées et notifiées automatiquement** (A5/A7) ; l'AO se ferme (A8).
6. **Marché.** L'acceptation crée le **marché signé** (A6) → crée le projet côté lauréat (`PRJ-01`) → devient l'objet financier de référence (`FIN-01`).

**Historisation :** chaque étape (publication, offre, modification d'offre, acceptation, refus, fermeture) est **historisée, jamais écrasée** (doctrine `D10`).

> **Dépendances :** `ANN-01`, `ANN-03`, `PRJ-01`, `FIN-01`, `AVS-02`, `SYS-02` (droits émetteur/répondeur).

---

## `AOF-02` — Offres reçues & comparaison (côté émetteur)
**Statut : CADRÉ — DÉVELOPPABLE**

L'émetteur (client, ou pro en sous-traitance) dispose d'une vue **« Offres reçues »** pour comparer les propositions d'un même AO. Chaque offre affiche : **montant, délai, note méthodologique, pièces jointes** (A4), ainsi que la **note/avis** du pro (`AVS-01`) et son **badge vérifié** (`INS-04`).

**Actions :**
- **Accepter** une offre (A5) → déclenche `AOF-01` étape 6 ; refuse et notifie automatiquement les autres (A7) ; ferme l'AO (A8).
- **Demander une précision** → ouvre la **conversation unique** avec le pro (`MSG-04`), sans quitter le contexte de l'AO.

Une seule offre peut être acceptée par AO (portée globale, A3).

---

## `AOF-03` — Réponse d'un professionnel à un appel d'offres
**Statut : CADRÉ — DÉVELOPPABLE**

Depuis la Bourse (`ANN-03`) ou une invitation privée, le pro dépose une **offre** contenant : **montant proposé, délai, note méthodologique, pièces jointes** (A4).

- **A9 — Modification/retrait.** Le pro peut **modifier ou retirer son offre tant qu'elle n'a pas été acceptée**. Une fois l'offre acceptée (marché scellé, A6), elle devient ferme et l'engage.
- Le pro **suit l'état** de ses offres dans son espace (« Offres ») : envoyée → vue → acceptée / refusée. Le refus est notifié automatiquement (A7).

> **Note d'engagement :** déposer une offre vaut engagement du pro sur les termes proposés (A6). Le pro doit en être clairement informé au moment du dépôt (mention explicite dans l'UI).

---

# J. MARKETPLACE & ESPACE FOURNISSEUR

> **Comblé lors de l'audit v1.2.** Tout le module marchand (visible dans les menus « Catalogue / Commandes / Marketplace ») n'avait aucune exigence. Le fournisseur, jusqu'ici quasi absent du référentiel, y est traité.

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

> **⚠️ Note sur l'escrow (cible).** Le séquestre de fonds jusqu'à livraison est un excellent mécanisme de confiance, mais il implique un **statut réglementaire** spécifique (gérer de l'argent d'autrui = souvent établissement de paiement agréé). Il nécessitera le **même type de partenaire réglementé** que le partenaire bancaire prévu pour les gros marchés. À traiter avec `FIN-01`/D10 (réactivation traçabilité) le moment venu.
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

---

# K. FONDATIONS TRANSVERSES

> **Comblé lors de l'audit v1.2.** Concepts structurants présents dans les captures ou la doctrine, mais sans exigence.

## `SYS-01` — Passeport Numérique du projet
**Statut : RETIRÉ (v1.10) — module retiré, fonction reportée, réversible**

> **Décision (23/07/2026) :** le Passeport Numérique est **retiré comme module visible** (écran « mémoire du projet »). L'historisation inaltérable complète qu'il portait est **reportée**, pas définitivement abandonnée.
>
> **Justification (logique produit clarifiée) :** MEEREO distingue deux natures de flux (cf. `FIN-01`/D10 et `FIN-02`) :
> - les **flux intégrés Mobile Money** (KAi Pro, petits achats Marketplace) sont de vraies transactions, **tracées nativement** par le prestataire de paiement — pas besoin du Passeport pour ça ;
> - les **gros paiements de marché** restent **hors plateforme et déclaratifs** tant qu'aucun partenaire bancaire n'est intégré. Tant que MEEREO ne touche pas cet argent, une historisation inaltérable lourde est **prématurée**.
>
> **⚠️ Réactivation prévue.** Le jour où un **partenaire bancaire** permet aux gros paiements de passer par la plateforme, le Passeport Numérique (ou une historisation inaltérable équivalente) devra être **réactivé** : c'est lui qui fait de MEEREO un « registre de preuve » et qui protège le garde-fou « client passif » (`FIN-01`/D6). Spécification d'origine conservée ci-dessous pour réactivation.
>
> *Spécification d'origine (archivée) : le Passeport Numérique agrège automatiquement l'historique complet d'un projet — événements financiers, étapes d'avancement, documents, intervenants, décisions, avis — sans saisie manuelle, par propagation (SSOT). Référence inaltérable et transférable du projet.*

*Spécification d'origine (archivée, pour réactivation) : agrégation automatique de l'historique complet du projet — événements financiers, avancement, documents, intervenants, décisions, avis — sans saisie manuelle, par propagation SSOT ; référence inaltérable et transférable.*

---

## `SYS-02` — Matrice de droits et permissions par rôle
**Statut : CADRÉ — DÉVELOPPABLE** (matrice complète produite)

Le référentiel dit « selon ses droits » à de nombreux endroits (`PRJ-02`, `PRJ-05`, `MSG-02`…) **sans jamais centraliser ces droits**. Risque : chaque écran réinvente ses permissions. → **Une matrice unique** a été produite : `MEEREO_SYS-02_Matrice_Droits.md`.

**Contenu de la matrice :** 5 rôles (Client / Professionnel / Fournisseur / Intervenant / Admin MEEREO) × 18 objets (projet, marché, phase/avancement, note de chantier, document, intervenant, budget, paiement, appel d'offres, offre, avis, produit, commande, conversation, participant, profil, logo, équipe) × 4 actions (Voir / Créer / Modifier / Supprimer, + Valider/Contester sur les objets financiers/marchés). Toutes les cases sont tranchées.

**Second niveau — rôles internes à l'entreprise (ajouté v1.18) :** un compte professionnel subdivise ses droits entre **4 rôles internes** (Administrateur, Chef de projet, Collaborateur, Lecteur), gérés dans Paramètres › Équipe (`SYS-06`). Ces rôles **restreignent** les droits du compte pro sans jamais les étendre. Un membre marqué « Public » apparaît sur la page publique (`INS-03`). Granularité fine à préciser.

**7 arbitrages actés** dans la matrice : (A) admin lit les messages privés avec réserve RGPD + traçabilité ; (B) suppression définitive de projet par le propriétaire (le pro clôture seulement) ; (C) seul le pro rédige les notes de chantier ; (D) fournisseur = catalogue + commandes uniquement ; (E) client **et** pro peuvent commander sur la Marketplace ; (F) intervenant visible par défaut côté client (masquable par l'entreprise) ; (G) modération financière admin sans objet (pas de paiement intégré, déclaratif `FIN-01`/D1).

**Règles transverses** (priment sur toute case) : annuaires cloisonnés (`MSG-02`), intervenant sous-traité aveugle sauf messagerie (`PRJ-05`/I3 + `MSG-07`), client passif sur le financier (`FIN-01`/D6), affichage contextuel par rôle (`MSG-04`), admin modère sans se substituer.

> **La matrice est la source unique des permissions.** Toute nouvelle fonctionnalité vérifie ses droits ici ; toute nouvelle règle de droit y est ajoutée (jamais codée uniquement dans un écran).
> **Dépendance :** structurant pour `PRJ-02`, `PRJ-05`, `MSG-02`, `MSG-04`, `MSG-07`, `FIN-01`, `AOF-*`, `MKT-*`.

---

## `SYS-03` — Expérience mobile : web responsive puis application native
**Statut : CADRÉ — DÉVELOPPABLE**

L'usage terrain (chantiers, Côte d'Ivoire/UEMOA) est fortement mobile. Stratégie en deux temps :

### Phase 1 — Web responsive (lancement)

Toutes les interfaces doivent être **pleinement utilisables sur mobile via navigateur** : navigation, messagerie, dépôt de photos de chantier, suivi d'avancement, notifications, Marketplace. Les tâches lourdes (création d'AO, configuration) peuvent rester optimisées desktop mais rester **accessibles** sur mobile.

> **Écart actuel à corriger :** les maquettes existantes sont **desktop-first** (elles se dégradent sur écran étroit). Le responsive doit être repensé pour le tactile et les petits écrans, pas seulement « rétréci ».

### Phase 2 — Application native iOS / Android (ensuite)

Après le lancement web, une **vraie application mobile native** est prévue. **Recommandation technique : cross-platform** (React Native ou Flutter) pour produire iOS + Android depuis une seule base de code, plutôt que deux apps séparées.

**Priorité terrain de l'app :** ce qui a le plus de valeur en mobilité — **photos de chantier** (accès caméra natif), **suivi d'avancement** (cocher les tâches sur site), **messagerie** et **notifications push**. C'est là que le natif apporte plus que le web.

> **⚠️ Commission app stores (choix assumé, réversible).** L'abonnement KAi Pro (`FIN-02`) sera payable **dans l'app**, ce qui expose à la commission Apple/Google (jusqu'à 30 %). **Choix de simplicité acté** au stade actuel. À rouvrir si KAi Pro devient un revenu significatif : basculer le paiement de l'abonnement sur le **web** évite cette commission. *(Note : ceci ne concerne que l'abonnement ; les achats Marketplace en Mobile Money passent par un prestataire tiers, hors périmètre app store.)*

> **Dépendances :** touche toutes les interfaces ; particulièrement `PRJ-07` (photos/avancement chantier), `MSG-*` (messagerie), `AVS-02` (notifications push), `FIN-02` (paiement in-app).

---

## `SYS-04` — Multilingue (Français + Anglais dès le lancement)
**Statut : CADRÉ — DÉVELOPPABLE**

MEEREO est **bilingue Français + Anglais dès le départ**. L'anglais sert les partenaires internationaux et l'ouverture régionale au-delà de la zone francophone.

**Exigences :**
- **Architecture i18n obligatoire** dès la conception : aucun texte codé en dur, tous les libellés externalisés (fichiers de traduction), formats de date/nombre/devise localisables.
- **FR et EN livrés ensemble** au lancement (pas « FR d'abord, EN plus tard »).
- Le choix de langue est un **préférence utilisateur** (dans les paramètres), avec détection par défaut selon le navigateur/appareil.
- L'i18n bien posée dès le départ permet d'**ajouter d'autres langues** ultérieurement sans refonte.

> **Point d'attention :** les contenus **générés par les utilisateurs** (produits, messages, notes de chantier) ne sont pas traduits automatiquement — seule l'**interface** est bilingue. Une éventuelle traduction de contenu (ex. via KAi) serait une fonctionnalité distincte à cadrer.

---

## `SYS-05` — Gestion des fichiers & documents (règles)
**Statut : CADRÉ — DÉVELOPPABLE**

`PRJ-08` traite l'**affichage** des documents ; `SYS-05` définit les **règles**.

### Formats autorisés

- **Images / photos** : formats courants (JPG, PNG…) — usage central pour les photos de chantier.
- **PDF** : plans, dossiers, documents contractuels.
- **Documents bureautiques** : Word, Excel (devis, tableaux, courriers).
- *(Non retenus au stade actuel : formats lourds DWG/BIM/3D — à rouvrir si un besoin métier BET/architecte le justifie.)*

### Règles de gestion

- **Taille maximale** par fichier : à définir (ex. 5–10 Mo par défaut, plus pour les PDF de plans).
- **Versioning** : un document remplacé **conserve son historique** (versions antérieures accessibles), cohérent avec l'esprit de traçabilité — *sous réserve du niveau d'historisation retenu au stade MVP (cf. `FIN-01`/D10, `SYS-01`)*.
- **Droits** : qui peut déposer / voir / supprimer un document est régi par la matrice `SYS-02` (ex. l'intervenant sous-traité est aveugle aux documents ; le client voit les documents partagés, pas les internes).
- **Privé/interne vs partagé** : un document peut être **interne** (visible seulement de l'entreprise) ou **partagé** avec le client (`PRJ-04`). Le déposant choisit la portée.
- **Rattachement** : chaque document est rattaché à un **projet / phase / marché**, pour être retrouvé dans son contexte.

> **Dépendances :** `PRJ-04` (synchro images client/pro), `PRJ-08` (affichage), `SYS-02` (droits), `FIN-01`/D10 (niveau de versioning selon la phase de traçabilité).

---

## `SYS-06` — Paramètres, page pro & aperçu public : trois portes distinctes
**Statut : CADRÉ — DÉVELOPPABLE**

### Problème constaté (état réel)

Le professionnel dispose de **trois entrées** manipulant son identité professionnelle, aux **libellés trompeurs** et au **périmètre qui se chevauche** :

| Libellé actuel | Fonction réelle | Problème |
|---|---|---|
| « Mon profil professionnel » *(menu avatar)* | **Aperçu public** | « Profil » suggère l'édition, alors qu'on ne fait que regarder |
| « Ma page pro » *(sidebar)* | **Édition** de la page publique | « Ma page » suggère la consultation, alors que c'est l'édition |
| « Paramètres » › onglet Profil | **Réglages compte** — mais édite aussi logo, slogan, bio, secteurs, services | **Chevauche « Ma page pro »** : deux endroits éditent les mêmes données (viole `QAL-02`) |

### Décision 1 — Libellés clarifiés

- **« Voir ma page publique »** → aperçu, tel qu'un visiteur la voit *(anciennement « Mon profil professionnel »)*.
- **« Modifier ma page pro »** → édition du contenu vitrine *(anciennement « Ma page pro »)*.
- **« Paramètres »** → réglages du compte *(inchangé)*.

Le verbe dit l'action : **voir** vs **modifier** vs **régler**. Plus d'ambiguïté.

### Décision 2 — Séparation nette des périmètres

**L'édition du contenu vitrine sort des Paramètres.** Une donnée ne s'édite qu'à **un seul endroit** (`QAL-02`).

| Donnée | Où elle s'édite |
|---|---|
| Logo, slogan/accroche, bio/présentation, secteurs d'activité, services, portfolio | **Modifier ma page pro** |
| N° RCCM & N° contribuable *(données légales d'identité)* | **Paramètres › Profil** — verrouillées après vérification (voir plus bas) |
| Nom de la structure, email, téléphone, ville *(coordonnées du compte)* | **Paramètres › Profil** |
| Mot de passe, sessions, 2FA | **Paramètres › Sécurité** |
| Notifications, langue FR/EN | **Paramètres › Préférences** |
| Devise, région | **Paramètres › Devise & Région** |
| Équipe *(pro uniquement)* | **Paramètres › Équipe** |
| Abonnement KAi, facturation, moyens de paiement | **Paramètres › Abonnement** |
| Export, suppression de compte | **Paramètres › Données** |
| Zones de livraison, seuil de stock bas, catalogue *(fournisseur)* | **Paramètres › Réglages boutique** |

> Les données de compte éditées dans les Paramètres (nom, coordonnées) **alimentent** la page publique en lecture, mais ne s'y éditent pas. Source unique, affichage multiple.

### Structure des Paramètres par rôle (état réel observé)

Les trois rôles ont des **onglets différents** — ce ne sont pas des variantes d'un même écran.

| Client (5) | Professionnel (7) | Fournisseur (8) |
|---|---|---|
| Mon profil | Profil | **Mon entreprise** |
| Sécurité | Préférences | **Marketplace** |
| Préférences | Devise & Région | **Paiements** |
| Abonnement | Sécurité | **Livraison** |
| Données | Équipe | **Notifications** |
| — | Abonnement | **Abonnement** |
| — | Données | **Sécurité** |
| — | — | **Données** |

*Profil client :* photo, prénom, nom, email, téléphone, ville (pas de RCCM — `INS-01` ne s'applique qu'aux structures).

### Onglets spécifiques au fournisseur (contenu réel)

- **Mon entreprise.** Logo, nom, email, téléphone, ville, **RCCM et N° Contribuable** — ces deux derniers apparaissent **verrouillés** (conforme à la règle de verrouillage après vérification, voir plus bas).
- **Marketplace.** Nom affiché sur la Marketplace, **catégories servies**, nombre de produits en ligne (dont sponsorisés), visibilité. Définit comment l'entreprise apparaît dans MeereoShop.
- **Paiements.** Configuration des moyens de **réception** : **Orange Money, MTN MoMo, Wave**. Le fournisseur reçoit **directement** de l'acheteur (`FIN-03` Phase 2 — MEEREO n'encaisse pas, faute d'agrément).
- **Livraison.** Délai de livraison, **modes disponibles** (Livraison / Retrait client), **zones de livraison** (`MKT-02`).
- **Notifications.** Nouvelles commandes, paiements reçus, produits validés, offres flash, messages support.
- **Abonnement.** KAi Standard / KAi Pro (tarif selon rôle, `FIN-02`), moyen de paiement, facturation, historique.
- **Sécurité.** Email de connexion + changement de mot de passe. *(Manquent 2FA et sessions — voir corrections.)*
- **Données.** Suppression de compte uniquement (pas d'export JSON ni de réinitialisation, contrairement au pro).

### Contenu réel des onglets (état observé) & corrections requises

- **Préférences.** Existant : notifications email, notifications push, **rappels planning**, **résumé hebdomadaire**. → **À ajouter : le sélecteur de langue FR/EN** (`SYS-04`), aujourd'hui absent alors que le bilinguisme est exigé au lancement.
- **Devise & Région.** Existant : devise (FCFA/XOF), fuseau horaire (Afrique/Abidjan GMT+0). Conforme.
- **Sécurité.** Existant : mot de passe actuel / nouveau / confirmation. → **À ajouter : double authentification (2FA)** et **gestion des sessions actives** (voir/révoquer les appareils connectés), aujourd'hui absentes.
- **Équipe** *(pro)*. Invitation de membres + **4 rôles internes** : Administrateur, Chef de projet, Collaborateur, Lecteur (voir `SYS-02`). Les membres marqués « **Public** » apparaissent sur la page publique (`INS-03`).
- **Abonnement.** Formule **KAi Standard** (gratuit, 25 analyses/mois) ou **KAi Pro (39 000 FCFA/mois pour le fournisseur, `FIN-02`)** ; moyen de paiement Mobile Money (Orange Money) ; informations de facturation ; historique des transactions (`FIN-02`).
- **Données.** Export JSON, suppression de compte (`AVS-03`), gestion de l'abonnement. → **⚠️ « Réinitialiser toutes les données » est un outil de test : il DOIT être retiré en production.** Cette action efface projets, clients, offres, marchés, commandes, messages, documents, équipe, notifications et paramètres — inacceptable dans une version publique.

> **Cohérence de nom :** l'interface affiche « **KAI** Standard / **KAI** Pro » alors que le nom officiel acté est **KAi**. À corriger partout (`QAL-03`).

### ⚠️ Verrouillage du RCCM après vérification

**Problème :** le N° RCCM est aujourd'hui **librement modifiable**, alors qu'il doit être **unique par entreprise et lié à un seul compte** (`INS-01`) et qu'il conditionne le badge « Vérifié par MEEREO » (`INS-04`). Le modifier librement contournerait l'unicité et rendrait la vérification caduque.

**Décision :** une fois le RCCM **vérifié**, il est **verrouillé**. Toute modification passe par une **demande à l'administrateur MEEREO**, qui vérifie et applique le changement. Avant vérification, le champ reste modifiable par le titulaire, sous contrôle d'unicité et de format (`INS-01`).

### Règle de propagation

Toute donnée modifiée (Paramètres ou page pro) se **répercute immédiatement partout** où elle apparaît : logo dans les listes et la page publique (`QAL-02`), nom et secteurs dans l'annuaire (`ANN-*`), coordonnées sur la page publique (`INS-03`), langue dans toute l'interface (`SYS-04`). **Aucune double saisie, aucune donnée dupliquée.**

> **Dépendances :** `INS-01` (RCCM/contribuable), `INS-02` (logo), `INS-03` (page publique), `INS-04` (badge), `PRJ-06` (équipe), `AVS-02` (notifications), `AVS-03` (suppression), `FIN-02`/`FIN-03` (abonnement), `MKT-02`/`MKT-05` (boutique), `SYS-02` (droits), `SYS-04` (langue), `QAL-02` (propagation).

---

# CONCLUSION

Les développements respecteront : cohérence entre profils ; synchronisation temps réel ; respect strict des workflows métier ; performance ; sécurité et gestion des droits ; qualité rédactionnelle ; UX fluide et homogène multi-navigateurs.

Chaque module (**Cockpit Projet, Annuaire, CRM, Messagerie, Appels d'offres, IA KAI, Gestion documentaire, Page professionnelle publique**) doit fonctionner de manière **intégrée et transparente**.

---

# ANNEXE 1 — Décisions à trancher & dépendances

### À trancher avant développement

**Aucun point fonctionnel ne reste ouvert.** Les derniers arbitrages ont été tranchés en v1.26 (voir journal). Ne subsistent que :

- des **décisions business chiffrées** — montants du quota, des ventes flash, du sponsoring et de l'abonnement fournisseur (`MEEREO_Grille_Tarifaire.md`, à valider par le terrain) ;
- des **validations professionnelles** — 5 sujets à faire arbitrer par un juriste et un expert paiement avant mise en ligne (`MEEREO_Questions_Juriste_Paiement.md`).

*Historique des points résolus :* `MSG-01` (bouton contact, v1.16) · `FIN-01` (phases, dépassement de budget, v1.26) · `NAV-05` (points d'entrée Paramètres, v1.26) · `MKT-01` (produit impayé, périmètre services, v1.26) · `AVS-03` (factures impayées, v1.26) · `SYS-04` (multilingue, v1.15).

### Dépendances (à traiter ensemble)

- `NAV-01` + `NAV-02` + `NAV-03` — cause racine commune (session/routing/état front). Investigation unique.
- `ANN-01` + `ANN-02` + `ANN-04` — même module annuaire. Même sprint.
- `MSG-02` + `MSG-05` — l'architecture temps réel des appels dépend de la refonte messagerie.
- `MSG-02` + `MSG-03` + `MSG-04` + `MSG-06` + `AVS-02` — même système d'état de messagerie (lu/non-lu, conversation unique, création instantanée, compteurs). Chantier temps réel unique.
- `INS-01` → `INS-04` — le badge dépend de la vérification IA du RCCM.
- `AVS-03` → `MSG-04` — la conversation unique s'appuie sur les UUID.
- `PRJ-01` + `PRJ-05` + `PRJ-06` + `AVS-01` — chaîne projet → équipe → avis. À traiter de bout en bout.
- `ANN-03` + `AVS-02` — la notification de la Bourse s'appuie sur le système global de notifications.

### Fil rouge architectural (le plus important)

- `INS-04` + `AVS-01` + `QAL-02` — **statut vérifié, avis, logo** doivent provenir d'un **référentiel centralisé unique** consulté par toutes les interfaces. La majorité des bugs d'incohérence (logos manquants, étoiles divergentes, badge absent selon les pages) viennent de la **même cause** : des calculs/copies locaux par écran au lieu d'une source partagée.

---

# ANNEXE 2 — Journal des versions

### v1.27 — 23 juillet 2026 — *Lot : fusion d'une branche parallèle (diagnostic technique) + contrôle de cohérence des 4 documents complémentaires*

> **Contexte.** Une branche parallèle de ce référentiel (v1.2/v1.3, produite dans une autre session de travail) avait développé, en plus de `INS-06` et `MSG-06` (déjà présents ici depuis la v1.1 commune), une **annexe de diagnostic technique** (causes probables, architecture cible, protocole de vérification) pour `MSG-06`, `INS-06` et `QAL-02`. Cette branche divergeait de la présente lignée à partir de « v1.2 » : deux documents différents portaient le même numéro. Cette version **réconcilie les deux** en adoptant la présente lignée (la plus avancée, v1.26) comme référence unique, et en y greffant le contenu diagnostique de l'autre branche, qui n'avait pas d'équivalent ici.

- **[NOUVEAU]** Ajout de l'**Annexe 3 — Diagnostic technique**, complément **exclusivement technique** (pas de nouvelle décision produit) à `MSG-06`, `INS-06` et `QAL-02` : hypothèses de cause classées par probabilité, architecture cible, protocole de vérification pour chacun, plus synthèse transversale. `MSG-06`, `INS-06` et `QAL-02` ne portent qu'un renvoi daté vers cette annexe — aucune exigence existante réécrite.
- **[NOUVEAU]** Ajout de l'**Annexe 4 — Documents complémentaires : contrôle de cohérence**, recensant `MEEREO_Doctrine_Flux_Financiers.md`, `MEEREO_Lot_Correction.md`, `MEEREO_Questions_Juriste_Paiement.md` et `MEEREO_SYS-02_Matrice_Droits.md` : vérifiés ligne à ligne contre ce référentiel, cohérents à une exception près (signalée, non corrigée ici — ce n'est pas ce référentiel qui porte l'erreur).
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
- **[À TRANCHER]** Conserver les trois points d'entrée ou retirer la carte redondante d'EXPLORER ? Multiplier les chemins multiplie les liens susceptibles de casser — c'est ce qui s'est produit ici. *(Même schéma de redondance que celui corrigé en `SYS-06` pour l'identité professionnelle.)*

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

**Raisonnement acté :** (a) aucun problème de vérification, MEEREO facture des services payés d'avance ; (b) **aucune incitation au contournement** — une commission pousserait le fournisseur à vendre hors plateforme, tandis que sans commission, plus il vend via MEEREO plus il a intérêt à acheter de la visibilité : les intérêts sont **alignés** ; (c) « zéro commission » est un argument d'acquisition fort.

**⚠️ Limites assumées :** le revenu dépend du nombre/engagement des fournisseurs et non du volume de ventes (croissance plus plate) ; la visibilité ne se vend que s'il y a de l'audience — il faut donc **attirer d'abord les acheteurs**.

**[AJOUTÉ] `MKT-01`** — règle de quota (5 produits gratuits puis forfait mensuel par produit), avec implications UI à préciser (compteur, coût du suivant, sort d'un produit non payé).

---

### v1.20 — 23 juillet 2026 — *Lot : audit de l'espace fournisseur & correction du modèle de revenu*

Vérification complète de l'espace fournisseur réel (navigation, 8 onglets de paramètres, formulaire produit, paiements, performance). **Plusieurs spécifications antérieures étaient erronées — corrigées ici.**

**⚠️ Correction majeure — modèle de revenu (`FIN-03` Phase 2) :**
- **Contrainte réglementaire identifiée par MEEREO :** encaisser l'argent d'un tiers exige un **agrément d'établissement de paiement** que MEEREO n'a pas. La rédaction antérieure (« MEEREO encaisse et prélève sa commission au passage ») était donc **irréalisable au démarrage**.
- **Phase 2 réécrite** : l'argent va **directement de l'acheteur au fournisseur** (moyens Mobile Money configurés par le fournisseur). Trois revenus **sans agrément** : (1) **abonnement fournisseur**, (2) **fonctionnalités payantes** (sponsoring `MKT-04`, ventes flash), (3) **commission facturée a posteriori** — avec **risque de sous-déclaration assumé**.
- La **commission automatique** est repoussée en **Phase 3** (escrow), seul cas où l'argent transite par la plateforme.

**Corrections de structure :**
- **[CORRIGÉ] `SYS-06`** — la structure des onglets fournisseur était fausse. Réels (8) : **Mon entreprise · Marketplace · Paiements · Livraison · Notifications · Abonnement · Sécurité · Données**. Ni « Devise & Région » ni « Préférences ». Contenu détaillé de chaque onglet ajouté.
- **[CORRIGÉ] `MKT-03`** — modules **Paiements** et **Performance** oubliés. Espace fournisseur réel : ACTIVITÉ (Accueil) · MARKETPLACE (Mes produits, Boutique, Commandes) · FINANCE (Paiements, Performance) · COMPTE (Paramètres).
- **[PRÉCISÉ] `MKT-01`** — formulaire produit réel : nom, catégorie, **unité**, description, prix (**0 = sur devis**), stock, image, visibilité Marketplace, cases **Sponsoriser** et **Offre flash** (activées à la création, pas dans un module séparé). Le seuil global (`MKT-02`) et l'option « 0 = sur devis » **coexistent**.
- **Confirmé :** RCCM et N° Contribuable apparaissent **verrouillés** côté fournisseur — conforme à la règle de verrouillage après vérification (`SYS-06`).

---

### v1.19 — 23 juillet 2026 — *Lot : cycle de vie complet de l'équipe*

**Trou comblé.** Le référentiel affirmait séparément que l'équipe est réutilisable (`PRJ-06`), que les membres « Public » apparaissent sur la page publique (`SYS-06`) et qu'on peut assigner « Mon équipe » à un projet (`PRJ-05`) — **sans jamais dire comment ces affirmations s'articulent**. Une même personne circule à **quatre endroits** (Paramètres › Équipe, page pro publique, assignation projet, suivi côté client) sans règle de cohérence.

- **[CADRÉ] `PRJ-06`** — 6 règles de cycle de vie :
  - **E1** — **deux portes d'écriture, une seule base** : l'équipe s'édite depuis les Paramètres **et** la page publique ; ce ne sont pas deux listes à synchroniser mais une seule donnée à deux interfaces (`QAL-02`).
  - **E2** — référentiel réutilisable : l'assignation est une **relation**, jamais une recréation.
  - **E3** — membre marqué « Public » → visible sur la page publique (`INS-03`).
  - **E4** — rôle interne (Admin/Chef de projet/Collaborateur/Lecteur) qui **restreint** sans étendre (`SYS-02`).
  - **E5** — **retrait différencié** : le membre disparaît de la page publique et des projets **en cours**, mais **reste sur les projets passés** (historique préservé).
  - **E6** — **visible du client** dans le suivi (nom + métier), **par défaut, masquable** au cas par cas — même règle que les intervenants (`SYS-02`/F).
- **Diagnostic technique du bug existant :** les membres créés depuis la page publique ne sont pas enregistrés parce que l'écriture n'atteint pas le référentiel commun. La correction n'est pas de synchroniser deux listes, mais de faire écrire les deux interfaces dans **la même table**.

---

### v1.18 — 23 juillet 2026 — *Lot : audit détaillé des Paramètres pro & rôles internes*

Vérification des 7 onglets réels (Profil, Préférences, Devise & Région, Sécurité, Équipe, Abonnement, Données).

**Découverte structurante :**
- **[ÉTENDU] `SYS-02`** — la matrice ignorait les **rôles internes à une entreprise**. Ajout d'un **second niveau** : Administrateur / Chef de projet / Collaborateur / Lecteur (Paramètres › Équipe). Ces rôles **restreignent** les droits du compte pro sans jamais les étendre. Membre marqué « Public » → visible sur la page publique (`INS-03`). Granularité fine à préciser.

**Corrections & manques comblés dans `SYS-06` :**
- **Préférences** — contenu réel constaté (notifications email/push, **rappels planning**, **résumé hebdomadaire**) ; **manque : sélecteur de langue FR/EN** (`SYS-04`) → à ajouter.
- **Sécurité** — ne contient que le changement de mot de passe ; **manquent : 2FA et gestion des sessions actives** → à ajouter.
- **Abonnement** — tarifs constatés : KAi Standard gratuit (25 analyses/mois) / **KAi Pro 9 900 FCFA/mois**, paiement Orange Money, facturation, historique (`FIN-02`).
- **Données** — **⚠️ « Réinitialiser toutes les données » est un outil de test à RETIRER en production** (efface projets, clients, offres, marchés, messages, documents…).
- **Nommage** — l'interface affiche « KAI » au lieu de **KAi** → à corriger (`QAL-03`).

---

### v1.17 — 23 juillet 2026 — *Lot : Paramètres & clarification des trois portes d'identité pro*

- **[NOUVEAU] `SYS-06`** — angle mort comblé : la section **Paramètres** n'avait jamais été spécifiée alors qu'elle touche à presque tout (profil, logo, RCCM, langue, abonnement, notifications, suppression de compte).
- **Problème constaté :** le professionnel a **trois entrées** vers son identité pro, aux libellés trompeurs et périmètres chevauchants — « Mon profil professionnel » (= aperçu), « Ma page pro » (= édition), « Paramètres › Profil » (= réglages, mais éditait aussi le contenu vitrine).
- **[DÉCISION 1] Libellés clarifiés** : « **Voir ma page publique** » (aperçu) / « **Modifier ma page pro** » (édition) / « **Paramètres** » (réglages). Le verbe dit l'action.
- **[DÉCISION 2] Séparation nette** : l'édition du **contenu vitrine** (logo, slogan, bio, secteurs, services) **sort des Paramètres** → uniquement dans « Modifier ma page pro ». Les Paramètres gardent les **données de compte** (coordonnées, RCCM, sécurité, préférences, abonnement, données). Une donnée = un seul lieu d'édition (`QAL-02`).
- **[DÉCISION 3] Verrouillage du RCCM** après vérification : modification uniquement sur **demande à l'administrateur** (protège l'unicité `INS-01` et le badge `INS-04`).
- **Structure par rôle actée** : client 5 onglets ; professionnel 7 (dont Équipe) ; fournisseur 7 (sans Équipe, avec Réglages boutique).

---

### v1.16 — 23 juillet 2026 — *Lot : MSG-01 tranché (dernier point ouvert)*

- **[TRANCHÉ] `MSG-01`** — Solution 2 retenue : **transmission garantie** (le message arrive toujours). Trois cas couverts : entreprise inscrite (page complète ou non) → livraison en messagerie ; entreprise **seulement référencée** → message retenu + **invitation à s'inscrire pour le lire** (levier d'acquisition, cohérent Phase 1 `FIN-03`). Condition signalée : nécessite un canal de contact (email/tél) de l'entreprise référencée.
- **Effet :** le référentiel n'a **plus de point « À TRANCHER »** de nature fonctionnelle. Ne subsistent que des sous-points de `FIN-01` (phases fixes/modifiables, dépassement bloquant/alerte) et des décisions **business chiffrées** (taux de commission, seuils, tarifs), hors périmètre de spécification.

---

### v1.15 — 23 juillet 2026 — *Lot : fondations transverses (mobile, multilingue, fichiers)*

- **[CADRÉ] `SYS-03`** — mobile en 2 phases : **web responsive au lancement** (corriger le desktop-first actuel), puis **app native iOS/Android** (cross-platform recommandé, priorité photos/avancement/messagerie/push). ⚠️ Commission app stores sur KAi Pro payé in-app : choix de simplicité assumé et réversible.
- **[CADRÉ] `SYS-04`** — **bilingue FR + EN dès le lancement** ; architecture i18n obligatoire (aucun texte en dur) ; langue = préférence utilisateur. Seule l'interface est traduite, pas le contenu utilisateur.
- **[CADRÉ] `SYS-05`** — formats autorisés : images, PDF, Word/Excel (DWG/BIM/3D exclus au stade actuel) ; règles de taille, versioning (selon phase de traçabilité `FIN-01`/D10), droits (`SYS-02`), privé/partagé (`PRJ-04`), rattachement projet/phase/marché.

**Note :** avec ce lot, les 11 domaines du référentiel sont cadrés au niveau développable. Restent des sous-points « à définir » (taux de commission, seuils, tarifs) qui relèvent de décisions business/chiffrées, non de spécification fonctionnelle.

---

### v1.14 — 23 juillet 2026 — *Lot : stratégie de monétisation en 3 phases*

- **[STRATÉGIE] `FIN-03`** réécrit en feuille de route de monétisation :
  - **Phase 1 — Acquisition (gratuit) :** zéro commission, focus volume. Revenu accessoire déjà présent via pub (`MKT-04`) + KAi Pro (`FIN-02`).
  - **Phase 2 — Monétisation en ligne + forfait fournisseur :** commission automatique sur les ventes Mobile Money ; **forfait/abonnement fournisseur** (modèle lead-gen) pour capter la valeur des ventes hors ligne non traçables.
  - **Phase 3 — Escrow + logistique (cible) :** le paiement des gros devis transite par un **compte séquestre MEEREO** → l'argent repasse par la plateforme → commission prélevée **y compris sur l'offline**. Escrow + logistique couplés (la livraison confirmée libère les fonds).
- **Insight clé acté :** l'escrow ne sert pas qu'à sécuriser la livraison — il **ramène le flux offline dans la plateforme**, résolvant l'angle mort de la commission sur les gros devis.
- **Mutualisation signalée :** les 3 besoins réglementaires (gros marchés `FIN-01`/D10, escrow Marketplace, traçabilité `SYS-01`) peuvent être servis par le **même partenaire agréé**.

---

### v1.13 — 23 juillet 2026 — *Lot : modèle de revenu Marketplace & KAi commercial*

- **[NOUVEAU] `FIN-03`** — **commission Marketplace**, revenu **principal** de MEEREO (avec pub `MKT-04` et KAi Pro `FIN-02`). Prélevée simplement sur les ventes Mobile Money. **⚠️ Angle mort signalé :** comment commissionner les ventes payées **hors plateforme** (l'argent ne transite pas par MEEREO) — 3 options posées, à trancher. Taux et reversement à définir (décisions business).
- **[ENRICHI] `MKT-01`** — **stock obligatoire** à chaque produit (donnée vivante : décrémente aux ventes, alimente alertes KAi et ventes flash). **Promotions/ventes flash élevées au rang de moteur d'activité** (déstockage quotidien = flux de transactions récurrent).
- **[NOUVEAU] `MKT-05`** — **KAi surveillance stock & conseil commercial** au fournisseur : alertes rupture/stock bas, suggestion de vente flash sur stock dormant, prédiction des besoins, analyse des meilleures ventes. KAi devient conseiller commercial du fournisseur.

---

### v1.12 — 23 juillet 2026 — *Lot : Marketplace complétée (catégories, promos, sponsoring)*

- **[COMPLÉTÉ] `MKT-01`** — catégories réelles actées depuis « MeereoShop » (Gros Œuvre, Structure & Charpente, Menuiseries, Revêtements, Plomberie & CVC, Électricité, Green & Énergie, Mobilier Bureau/Maison, Cuisine & SDB, Extérieur & Jardin) : matériaux + mobilier + équipements. Ajout des **promotions / ventes flash** créées par le fournisseur.
- **[CORRECTION] `MKT-01`** — bug : les blocs promo (« Promo du mois », « Stock limité », « Ventes Flash ») s'affichent alors qu'il y a 0 produit → rendre **conditionnels** (cachés si aucun produit/promo réel).
- **[NOUVEAU] `MKT-04`** — **produits sponsorisés (AD)** : modèle de revenu publicitaire, avec garde-fous de neutralité (marquage AD obligatoire, ne pas noyer l'organique, ads limitées à la Marketplace).
- **Point encore ouvert :** services (location/transport/main-d'œuvre) en plus des produits physiques ? exclusions ? — en attente de précision MEEREO.

---

### v1.11 — 23 juillet 2026 — *Lot : cadrage de la Marketplace*

- **[CADRÉ] `MKT-01`** — catalogue : vendeur = **fournisseur uniquement** ; produits consultés par clients et pros. *Nature exacte des produits/services à confirmer par MEEREO.*
- **[CADRÉ] `MKT-02`** — achat à **deux modes selon un seuil global fixé par MEEREO** : sous le seuil → Mobile Money (`FIN-02`) ; au-dessus → devis + paiement hors plateforme. Suivi de commande (reçue → préparée → expédiée → livrée). **Livraison en deux temps** : MVP = retrait sur place / livraison au choix du fournisseur ; cible = partenaire logistique avec suivi live, validation mobile, signature et **escrow** (note réglementaire ajoutée).
- **`MKT-03`** — espace fournisseur (catalogue/commandes/ventes/messagerie), périmètre limité Marketplace (`SYS-02`/D). Reste à développer en détail.
- **Point ouvert :** nature exacte des produits vendus (matériaux/équipements/services/exclusions) — en attente de précision MEEREO.

---

### v1.10 — 23 juillet 2026 — *Lot : retrait du Passeport, deux natures de flux financiers, paiements Mobile Money*

**Passeport Numérique :**
- **[RETIRÉ] `SYS-01`** — Passeport Numérique retiré comme module (jugé prématuré au stade MVP). Spécification d'origine conservée pour réactivation future.

**Clarification majeure — deux natures de flux financiers :**
- **[NOUVEAU] `FIN-02`** — paiements **intégrés Mobile Money** : abonnement **KAi Pro** (récurrent mensuel/annuel) + **petits achats Marketplace**. Vraies transactions encaissées par MEEREO, tracées nativement par le prestataire Mobile Money.
- **[RÉVISÉ] `FIN-01`/D10** — traçabilité désormais **proportionnée à la nature du flux** : les flux Mobile Money sont tracés (transaction réelle) ; les **gros paiements de marché restent hors plateforme et déclaratifs** tant qu'aucun partenaire bancaire n'est intégré. L'historisation inaltérable complète (portée par `SYS-01`) est **reportée**, pas abandonnée.
- **[MAJ doctrine]** `MEEREO_Doctrine_Flux_Financiers.md` : à aligner sur cette distinction (flux intégrés vs déclaratifs).

**Logique produit (clarifiée par MEEREO) :** MEEREO encaisse réellement les petits flux (KAi Pro, Marketplace) via Mobile Money ; les gros marchés BTP restent déclaratifs/hors plateforme jusqu'à un partenaire bancaire. La traçabilité inaltérable complète sera réactivée avec ce partenaire — **simplification MVP assumée et réversible**, non un abandon.

---

### v1.9 — 23 juillet 2026 — *Lot : ergonomie du suivi chantier (placement des validations)*

- **[AMENDÉ] `PRJ-07`** — règle de placement des actions (continuité descendante) : « **Valider cette section** » déplacé dans l'**en-tête de section** (aujourd'hui en bas, oblige à scroller) ; « **Valider le projet** » déplacé **en bas** après la dernière section (aujourd'hui en haut sous les compteurs). Objectif : le sens de l'action suit le sens de lecture. Raffinement UI, pas de changement de comportement.

---

### v1.8 — 23 juillet 2026 — *Lot : matrice de droits SYS-02 (fondation)*

- **[CADRÉ] `SYS-02`** — matrice complète produite (`MEEREO_SYS-02_Matrice_Droits.md`) : 5 rôles × 18 objets × 4 actions, toutes cases tranchées. Centralise toutes les règles de permissions jusque-là éparpillées.
- **7 arbitrages tranchés** : A (admin lit messages privés + réserve RGPD), B (suppression projet par propriétaire), C (seul le pro rédige les notes), D (fournisseur = catalogue/commandes), E (client + pro commandent), F (intervenant visible par défaut, masquable), G (modération financière sans objet — déclaratif).
- **F précisé via capture réelle** (section « Intervenants du projet ») : visible par défaut côté client (nom + métier), l'entreprise peut masquer sa sous-traitance au cas par cas.
- **Fondation posée :** la matrice devient la source unique des permissions ; toute règle de droit future y est consignée.

---

### v1.7 — 23 juillet 2026 — *Lot : renforcement MSG-04 (doublon conversation + nommage contextuel)*

- **[AMENDÉ] `MSG-04`** — ajout du **cas concret constaté** : côté client, « Conception — MILLENIUM CONSTRUCTION » et « Projet : Conception » coexistent pour le même projet → doublon exact à corriger (une seule conversation directe/projet fusionnée). Preuve visuelle que le bug MSG-04 est réel.
- **[NOUVEAU dans `MSG-04`] Nommage contextuel par rôle :** même objet conversation, libellé calculé à la lecture — côté **pro** = nom du projet seul ; côté **client** = nom du projet + nom de l'entreprise. Donnée unique (SSOT), affichage adapté au rôle.

---

### v1.6 — 23 juillet 2026 — *Lot : conversation projet multi-participants*

- **[NOUVEAU] `MSG-07`** — le pro responsable d'un marché peut ajouter un ou plusieurs intervenants à la discussion avec le client. 4 décisions : **G1** extension de la conversation unique `MSG-04` (pas une nouvelle) ; **G2** l'intervenant participe à la messagerie mais reste aveugle au reste du projet (seule exception à `PRJ-05`/I3) ; **G3** seul le pro responsable ajoute/retire ; **G4** l'intervenant ne voit que les messages postérieurs à son ajout (confidentialité de l'historique, à confirmer).
- **Cohérence préservée :** `MSG-04` (conversation unique) et `PRJ-05`/I3 (intervenant aveugle) tiennent tous les deux ; `MSG-07` est une extension encadrée, pas une contradiction.

---

### v1.5 — 23 juillet 2026 — *Lot : suivi chantier & assignation d'intervenants*

Cadrage du module Suivi chantier / Avancement à partir de l'état réel de la plateforme (captures : frise de phases, modal « Assigner un intervenant », modal « Note de chantier »).

- **[CADRÉ] `PRJ-05`** — assignation d'intervenants. 3 décisions : **I1** 4 sources (Mon équipe / annuaire / invitation email / créer un profil) ; **I2** tout intervenant externe finit avec un compte pro (jamais de fantôme) ; **I3** l'intervenant a un compte pro pour son usage propre mais **aucun accès au projet où il est sous-traité** — l'entreprise générale gère 100 % de l'avancement en interne (choix produit assumé : interlocuteur unique).
- **[CADRÉ] `PRJ-07`** — suivi chantier structuré en **phases de mission** (Conception → Réception), tâches par phase, validation groupée par section, et **notes de chantier typées** (Validation / Alerte / Information / Blocage). Confirme que l'axe « phases » est commun à l'avancement (`PRJ-07`) et aux décaissements (`FIN-01`).
- **Lien confirmé :** obtenir un marché (`AOF-01`/`PRJ-01`) déclenche la capacité d'assigner des intervenants et de piloter l'avancement.
- **Renforce `SYS-02`** (matrice de droits) : l'accès « aucun sur projet sous-traité » (I3) doit y figurer explicitement.

---

### v1.4 — 23 juillet 2026 — *Lot : cadrage du cycle appel d'offres*

`AOF-01/02/03` passent de « cadre » à **spécification développable**. 9 décisions actées (A1–A9) :
- **A1** émetteurs = client **et** pro (sous-traitance pro→pro, mêmes règles) ; **A2** types public (Bourse) + privé (ciblé) ; **A3** portée **globale** = entreprise générale prend tout le projet, découpage phases interne à l'entreprise ; **A4** offre = montant + délai + note méthodo + pièces jointes ; **A5** le client accepte 1 offre, les autres refusées auto ; **A6** acceptation = **marché signé direct** (l'offre vaut engagement du pro, pas de re-signature) ; **A7** offres non retenues refusées + notifiées ; **A8** AO fermé dès acceptation ; **A9** pro peut modifier/retirer son offre tant que non acceptée.
- **[AMENDÉ] `AOF-02`** renommé « côté émetteur » (plus seulement client, car le pro sous-traitant compare aussi).
- **Point de vigilance acté :** l'engagement du pro naît du dépôt de l'offre (pas de contre-signature) — mention explicite requise dans l'UI au moment du dépôt.

---

### v1.3 — 23 juillet 2026 — *Lot : audit complet & comblement des manques*

Audit systématique du référentiel. Fusion actée + **11 nouvelles exigences** créées pour combler les angles morts identifiés.

**Fusion & cohérence :**
- **[TRANCHÉ]** Fusion **Missions + Marchés + Contrats** → libellé unique **« Marchés »**. Titre de `FIN-01` corrigé (Missions → Marchés). Entrée « Actifs » supprimée du menu.

**[NOUVEAU] Domaine I — Cycle appel d'offres & marchés** (cœur transactionnel, était absent) :
- `AOF-01` cycle AO→offre→sélection→marché ; `AOF-02` offres reçues/comparaison (client) ; `AOF-03` réponse du pro à un AO.

**[NOUVEAU] Domaine J — Marketplace & fournisseur** (module marchand, était absent) :
- `MKT-01` catalogue ; `MKT-02` commandes ; `MKT-03` espace fournisseur.

**[NOUVEAU] Domaine K — Fondations transverses** :
- `SYS-01` Passeport Numérique (présent doctrine+menu, jamais spécifié) ; `SYS-02` matrice de droits par rôle (dispersée partout, jamais centralisée) ; `SYS-03` mobile/responsive (angle mort majeur, usage terrain) ; `SYS-04` multilingue (à trancher) ; `SYS-05` règles fichiers/documents.

**Manques signalés, non encore résolus (reportés en Annexe 1) :**
- `MSG-01` (bouton contact) — *tranché en v1.16 (transmission garantie + invitation acquisition).*
- `FIN-01` : 2 sous-points ouverts (phases fixes/modifiables, dépassement bloquant/alerte).
- `SYS-04` (multilingue) et libellé Marchés désormais actés.
- Rôle **Intervenant** : géré comme objet (`PRJ-05`) mais son accès propre reste à décrire.

---

### v1.2 — 23 juillet 2026 — *Lot : doctrine financière, corrections menu, refonte parcours d'entrée*

**Doctrine & finance :**
- **[NOUVEAU] Doctrine des flux financiers** (`MEEREO_Doctrine_Flux_Financiers.md`, v1.1 alignée « client passif ») : MEEREO = registre de traçabilité, **pas** un logiciel de comptabilité.
- **[AMENDÉ] `FIN-01`** — ajout de D9 à D12 : non-comptable (D9), flux = événement historisé (D10), confirmation « client passif » maintenue et doctrine alignée en conséquence (D11), avancement des étapes découplé du paiement — le pro pilote seul son chantier (D12).
- **[TRANCHÉ] `FIN-01/D6`** — la « double validation » suggérée par la doctrine d'origine est **écartée** ; « client passif » confirmé. La doctrine a été révisée pour supprimer les passages contradictoires (étape « en attente de validation » non bloquante).

**Corrections menu (audit cockpit pro) :**
- **[AMENDÉ] `FIN-01`** — fusion **Missions + Marchés + Contrats** en un seul objet (supprime la redondance à 3 noms) ; **suppression de « Actifs »** du menu (résidu de D2). Libellé unique Marchés/Missions à trancher.

**Design (hors référentiel d'exigences, livrables séparés) :**
- Refonte complète du **parcours d'entrée** (`meereo_parcours_complet.html`) : login + satellites (mot de passe oublié/reset/vérif) + 3 branches d'inscription distinctes (Client / Professionnel / Fournisseur).
- **Client** : plus de RCCM ; photo de profil optionnelle ; fin de parcours = **aiguillage KAi** (recommande appel d'offres ou annuaire selon le projet, l'info saisie sert enfin).
- **Pro & Fournisseur** : générateur de logo KAi + import (conforme `INS-02`) ; champs légaux conformes `INS-01` (format, refus de l'exemple, unicité, bouton bloqué si invalide).
- **Fournisseur** : ajout du **premier matériau** (nom, catégorie, prix FCFA, photo).
- Nom officiel **MEEREO** + **KAi** appliqué partout.

*Base observée :* captures de l'état actuel (cockpit pro Budget, onboarding fournisseur, page client) + document doctrine fournis par MEEREO les 22–23/07/2026.

---

### v1.1 — 22 juillet 2026 — *Lot : bugs messagerie & onboarding*

- **[NOUVEAU] `INS-06`** — Validation par étape de l'onboarding & sortie d'impasse : bug bloquant (e-mail obligatoire jamais demandé → utilisateur coincé à la fin, sans retour possible). Exige la validation des champs obligatoires à chaque étape + un filet de sécurité anti-impasse + un audit complet des 3 parcours (Client/Pro/Fournisseur).
- **[NOUVEAU] `MSG-06`** — Synchronisation instantanée d'une nouvelle conversation : au clic « Contacter », la conversation n'apparaît qu'après refresh. Exige création instantanée + activation auto + affichage immédiat du message + compteurs/badges synchronisés, sans rechargement. Pistes techniques listées (cache React, invalidation, state, optimistic UI, temps réel).
- **[AMENDÉ] `MSG-04` / annexe dépendances** — `MSG-06` rattaché au cluster « système d'état de messagerie » (chantier temps réel unique avec MSG-02/03/04 et AVS-02).

*Base observée :* captures d'écran de l'état actuel de la plateforme (login, onboarding 3 profils, création espace pro, page publique, messagerie client) fournies par MEEREO le 22/07/2026.
*Note :* la refonte de la page de login demandée dans le même lot est traitée comme **livrable de design séparé** (audit + maquette), hors de ce référentiel d'exigences.

---

### v1.0 — 22 juillet 2026 — *Version figée de référence*

Première version consolidée et figée. Établit la numérotation par **codes stables** (`INS`, `ANN`, `MSG`, `NAV`, `PRJ`, `AVS`, `QAL`, `FIN`) et la gouvernance de mise à jour.

**Périmètre couvert (36 exigences réparties sur 8 domaines) :** l'ensemble des retours MEEREO collectés jusqu'à cette date, consolidés sans doublon depuis les fichiers sources (Specifications_Fonctionnelles, Feedback_Plateforme, retours complémentaires URL/badge/avis/logos, section suivi financier).

**Arbitrages actés en v1.0 :**
- `INS-04` — badge « Vérifié » : dépôt RCCM + vérification IA du numéro (option retenue parmi trois logiques contradictoires transmises).
- `FIN-01` — modèle financier cadré : hybride déclaratif (D1), module Actif supprimé/fusionné en Phase (D2), budget = plafond (D3), mission = marché validé (D4), paiement = facture par phase (D5), client passif (D6), montant par mission imputé sur le plafond — modèle A (D7), clôture de mission → avancement (D8).

**Restent à trancher (reportés en Annexe 1) :** `FIN-01` (phases fixes/modifiables ; dépassement bloquant/alerte).

---

> **Modèle d'entrée pour les versions futures** (à remplir à chaque nouveau lot de feedback) :
>
> ### vX.Y — [date] — [titre du lot]
> - **[NOUVEAU] `CODE-NN`** — [titre] : [résumé en une ligne].
> - **[AMENDÉ] `CODE-NN`** — [ce qui a changé, sans réécrire l'exigence d'origine].
> - **[TRANCHÉ] `CODE-NN`** — [décision prise sur un point auparavant « à trancher »].

---

# ANNEXE 3 — Diagnostic technique : causes probables et protocole de vérification

**Concerne :** `MSG-06`, `INS-06`, `QAL-02`.
**Ajouté :** v1.27, en fusionnant la branche parallèle qui avait développé ce contenu (voir journal v1.27).

> **Avertissement de méthode, à lire avant toute chose :** ce diagnostic a été produit **sans accès au code source réel** de la plateforme. Les hypothèses ci-dessous sont classées par probabilité à partir des symptômes décrits dans `MSG-06`, `INS-06` et `QAL-02` — ce sont des **points de départ de diagnostic**, pas des causes confirmées. Le développeur doit vérifier chaque hypothèse contre le code avant d'implémenter un correctif. Aucune ligne ci-dessous ne doit être lue comme « c'est forcément ça ».

## A3.1 — `MSG-06` : synchronisation instantanée d'une conversation

**Hypothèses de cause, classées par probabilité :**

a) **Absence d'invalidation/mise à jour du cache après la mutation d'envoi** (la plus probable) — la mutation déclenchée par « Contacter » ne met à jour, à son succès, ni le cache de la requête « liste des conversations » ni un store équivalent. *Vérification :* le `onSuccess` de cette mutation touche-t-il la source lue par le composant liste ?

b) **Liste des conversations et fenêtre de discussion alimentées par des sources différentes** (fetch local isolé vs écriture ailleurs). *Vérification :* la clé de requête/store lue par la liste est-elle littéralement la même que celle écrite par la mutation ?

c) **Conversation créée via un flux différent de celui écouté par la liste** (parcours page publique vs messagerie interne). *Vérification :* comparer les deux chemins de code en amont de la liste.

d) **Si canal temps réel (WebSocket/SSE) : l'émetteur ne se notifie pas lui-même** — seul le destinataire reçoit l'événement. *Vérification :* l'émetteur reçoit-il un événement pour ses propres actions ?

e) **Race condition à la navigation** — redirection vers la conversation avant résolution du refetch de la liste.

**Architecture cible (niveau WhatsApp/Slack/Messenger) :**

1. Optimistic UI au clic « Contacter » : conversation temporaire insérée immédiatement dans la liste (cache/store partagé, jamais un state local isolé), sélectionnée automatiquement, message affiché en « en cours d'envoi ».
2. Réconciliation à la réponse serveur : id temporaire remplacé par l'id réel dans la même entrée de cache. En cas d'échec : retrait de l'entrée optimiste + état d'erreur avec réessai.
3. Source unique consultée par `Sidebar`, `ConversationList`, `ChatWindow`, badges et compteurs — aucun fetch indépendant.
4. Temps réel répercuté aussi côté émetteur, pas seulement destinataire.

**Protocole de vérification :**

1. Ouvrir la page publique d'un pro sans conversation existante, cliquer Contacter, envoyer un message.
2. Sans rien rafraîchir : conversation visible immédiatement ? Sélectionnée automatiquement ? Message visible dans le fil ?
3. Badge/compteur mis à jour sans refresh ?
4. Second onglet, même compte : la conversation y apparaît-elle aussi ?
5. Coupure réseau juste après l'envoi puis rétablissement : réconciliation propre, sans doublon ni perte ?

**Dépendances à respecter en parallèle :** `MSG-04` (vérifier qu'une conversation n'existe pas déjà pour le binôme/projet avant d'en créer une nouvelle — cf. le doublon documenté en v1.7) ; `MSG-03` (ne pas marquer lu simplement parce que la conversation vient d'apparaître) ; `MSG-01` (transmission garantie, hors périmètre de ce diagnostic).

## A3.2 — `INS-06` : validation par étape de l'onboarding

**Hypothèses de cause :**

a) **Navigation entre étapes non gardée** (state `currentStep` modifiable sans passer par la validation — URL directe, bouton retour, state manipulé).

b) **Désactivation du bouton non couplée à un schéma de validation complet** (l'e-mail peut ne pas faire partie de la condition réelle de validité de l'étape).

c) **Absence de revalidation serveur avec réponse structurée** — le serveur bloque bien l'accès au Cockpit, mais sans indiquer quel champ/étape est en cause, donc sans chemin de retour possible pour le front.

d) **Pas de source unique de vérité sur « ce qui manque »** entre le front et le serveur.

**Architecture cible :** un schéma de validation par étape (ex. Zod/Yup), **le même schéma** utilisé pour activer/désactiver le bouton, afficher les erreurs, et revalider côté serveur. Stepper « gardé » : impossible d'atteindre l'étape N+1 sans validation de l'étape N, quel que soit le chemin de navigation. Validation finale consolidée côté serveur avec réponse structurée (champ + étape) permettant une redirection automatique — jamais un refus sans issue.

**Protocole de vérification :**

1. Naviguer directement vers l'URL de la dernière étape sans e-mail rempli — redirection automatique vers l'étape concernée ?
2. Remplir tout sauf l'e-mail, retour arrière puis avancer — bouton « Suivant » toujours désactivé ?
3. Désactiver la validation JS via les outils navigateur, soumettre — le serveur bloque-t-il quand même, avec un message exploitable ?
4. Deux onglets : compléter l'e-mail dans l'un, tenter « Accéder au Cockpit » dans l'autre resté obsolète.

## A3.3 — `QAL-02` : logo, source unique

**Hypothèses de cause :**

a) **Récupération indépendante par composant** — plusieurs écrans lisent des champs différents ou refont leur propre appel. *Vérification :* recenser toutes les occurrences de champs type `logo`/`logoUrl`/`companyLogo` dans le code — combien de chemins de lecture distincts ?

b) **Copie dénormalisée obsolète** — logo copié dans une table/index secondaire à un instant T, jamais resynchronisé après un remplacement (`INS-02`).

c) **Gestion incohérente de l'absence de logo** — image cassée au lieu d'un avatar de repli partagé.

d) **Cache navigateur/CDN sans invalidation** — logo remplacé mais URL inchangée, ancienne image encore servie.

**Architecture cible :** un seul point d'accès (composant/hook partagé) utilisé par tous les emplacements listés dans `QAL-02` ; lecture en direct depuis le profil professionnel (jamais une copie) ; URL versionnée ou nom de fichier basé sur un hash à chaque remplacement ; avatar de repli unique géré au même endroit.

**Protocole de vérification :**

1. Recenser tous les écrans listés dans `QAL-02`, vérifier qu'ils consomment le même composant/hook.
2. Remplacer le logo d'un professionnel de test : à jour partout, immédiatement, sans refresh ?
3. Professionnel sans logo : même avatar par défaut partout ?
4. Outils réseau du navigateur : image servie depuis un cache obsolète après remplacement (304, même URL, en-têtes de cache) ?

## A3.4 — Synthèse transversale

Les trois sujets partagent un **schéma de cause récurrent** : des composants qui gèrent leur propre état ou leur propre source de données au lieu de consulter une source unique et réactive — messagerie non branchée sur la mutation d'envoi, onboarding non gardé par un schéma partagé front/serveur, logo lu indépendamment par écran. C'est la **même famille de cause** que celle déjà identifiée pour `NAV-01`/`NAV-02`/`NAV-03` et pour le fil rouge architectural `INS-04` + `AVS-01` + `QAL-02` (Annexe 1). Traiter ces bugs comme des manifestations d'un seul problème d'architecture — l'absence généralisée d'un état partagé et réactif — plutôt que comme des correctifs isolés.

## A3.5 — Points ouverts propres à ce diagnostic

1. **Stack technique non confirmée.** Les hypothèses ci-dessus supposent un modèle React + gestion de cache de requêtes. Si l'implémentation réelle repose sur autre chose, le principe reste valable mais le détail d'implémentation change. À confirmer par le développeur.
2. Toutes les hypothèses de cause (A3.1 à A3.3) sont des points de départ diagnostiques, non confirmés faute d'accès au code — à vérifier avant implémentation, pas à coder directement sur la base de cette annexe seule.

---

# ANNEXE 4 — Documents complémentaires : contrôle de cohérence

**Ajouté :** v1.27. Les quatre documents ci-dessous, référencés depuis le corps du présent référentiel, ont été lus intégralement et vérifiés ligne à ligne contre lui.

| Document | Rôle | Cohérence constatée |
|---|---|---|
| `MEEREO_Doctrine_Flux_Financiers.md` (v1.3) | Doctrine détaillée derrière `FIN-01` : registre de traçabilité, pas de comptabilité, client passif, statuts de paiement, avenants. | Cohérent avec `FIN-01`/D1-D12. Assume et signale explicitement l'affaiblissement de la traçabilité inaltérable sur les gros marchés tant que `SYS-01`/D10 n'est pas réactivé — cohérent avec le journal v1.10. |
| `MEEREO_Lot_Correction.md` | Version détaillée, avec critères de vérification cochables, des 6 anomalies déjà résumées dans le corps (`NAV-05`, `NAV-06`, `MSG-04`, `MKT-01`, `SYS-06`, `INS-01`/`INS-04`). | Cohérent. N'introduit aucun code absent du corps du référentiel — apporte des checklists de test que le corps n'a pas. |
| `MEEREO_Questions_Juriste_Paiement.md` | 41 questions (vérifiées : 7+7+5+7 en partie A, 6+6+3 en partie B = 41) dérivées des décisions déjà actées (`AOF-01`, `SYS-02`, `FIN-02`, `FIN-03`), sans y répondre. | Cohérent. Daté « base v1.16 » — antérieur aux dernières décisions (v1.17-v1.26), mais aucune des questions posées n'est invalidée par les décisions prises depuis ; à relire par le juriste en connaissance de la v1.27. |
| `MEEREO_SYS-02_Matrice_Droits.md` | Détail complet de `SYS-02` : 5 rôles de plateforme × objets × 4 actions, + second niveau de rôles internes à l'entreprise. | Cohérent avec le corps et avec `PRJ-05`/I3, `MSG-07`, `FIN-01`/D6. La Note G (« pas de paiement intégré ») est correctement **limitée à l'objet Paiement de marché** (`FIN-01`/D1, déclaratif) — elle ne contredit pas `FIN-02` (Mobile Money réellement intégré pour KAi Pro et petits achats), qui porte sur d'autres objets. |

**Une incohérence relevée (mineure, dans un des quatre documents, pas dans ce référentiel) :**

- `MEEREO_Grille_Tarifaire.md` — l'encart de statut en tête de document présente encore **« l'unique prix déjà fixé par MEEREO (KAi Pro à 9 900 FCFA/mois) »** au singulier, alors que la section 5 du même document (et `FIN-02`/v1.25 de ce référentiel) donnent **trois tarifs actés par rôle** (9 900 / 19 900 / 39 000 FCFA). C'est un résidu de rédaction antérieur à la différenciation par rôle (v1.25), non mis à jour dans l'encart d'introduction. **Correction suggérée :** mettre à jour cette phrase dans `MEEREO_Grille_Tarifaire.md` pour refléter les trois tarifs — ne change aucune décision, corrige uniquement une phrase devenue inexacte.
