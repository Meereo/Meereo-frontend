# Plateforme MEEREO — Spécifications fonctionnelles

**Version : 1.52** · **Date : 27 juillet 2026** · **Statut : figée (référence de développement)**

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

> **🔴 QUEL ENVIRONNEMENT FAIT FOI (acté le 27/07/2026).**
> Plusieurs représentations de MEEREO coexistent et ont été confondues par le passé. **Règle désormais
> applicable à tout constat consigné dans ce référentiel :**
>
> | Source | Statut | Ce qu'on peut en conclure |
> |---|---|---|
> | **`dev.meereo.com`** | **Fait seul foi** | Un défaut constaté ici est un **défaut réel**, à corriger. |
> | Maquettes locales *(fichiers `.html` sur poste)* | Cible ou exploration | **Aucun défaut ne peut y être constaté** — une maquette ne vérifie rien par nature. |
> | Prototypes de parcours *(`meereo_parcours_complet*.html`)* | Livrable de design | Sert à décrire une intention, **jamais à établir un défaut de production**. |
>
> **Conséquence sur les lots antérieurs :** l'audit de l'**Annexe 6** portait sur un **prototype**. Ses
> constats doivent être reconfirmés sur `dev.meereo.com` avant correction — réserve déjà posée en A6.5,
> et déjà vérifiée deux fois *(téléphone et photo du client existent en production, contrairement à ce
> que le prototype montrait)*.

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
- `INS-07` — Validation du nouveau mot de passe à la réinitialisation *(ajouté v1.28)*
- `INS-08` — Données de compte obligatoires absentes du parcours (téléphone, ville) *(ajouté v1.30)*
- `INS-09` — Adresse e-mail : unicité, vérification et récupérabilité *(ajouté v1.30)*
- `INS-10` — Acceptation des CGU et de la politique de confidentialité *(ajouté v1.30)*
- `INS-11` — Secteurs d'activité du professionnel : collectés mais jamais enregistrés *(ajouté v1.30)*
- `INS-12` — Logo à l'inscription : étape franchissable à vide, sans repli *(ajouté v1.30)*
- `INS-13` — Brouillon d'inscription : portée, expiration et clôture *(ajouté v1.30)*
- `INS-14` — Rôle : unicité, cumul et changement après inscription *(ajouté v1.30)*
- `INS-15` — Fil d'étapes (stepper) : refléter le parcours réel du rôle *(ajouté v1.30)*
- `INS-16` — Recommandation KAi de fin de parcours client : interdiction des valeurs par défaut *(ajouté v1.30)*
- `INS-17` — Page publique : contenu de démonstration servi en production *(ajouté v1.34)*
- `INS-18` — Comptes employés : création par invitation *(ajouté v1.37)*
- `INS-19` — Page publique : barre d'action persistante et langage de formes *(ajouté v1.43)*
- `INS-20` — 🔴 Unicité du RCCM et du numéro de contribuable non appliquée *(ajouté v1.44)*
- `INS-21` — Constructeur de page publique : modules et langage visuel *(ajouté v1.44)*

**B. Annuaire & appels d'offres**
- `ANN-01` — Recherche des entreprises dans les appels d'offres privés
- `ANN-02` — Affichage des entreprises dans les appels d'offres privés
- `ANN-03` — Refonte de la Bourse des appels d'offres
- `ANN-04` — Performances de l'annuaire des professionnels
- `ANN-05` — Compatibilité multi-navigateurs de l'annuaire
- `ANN-06` — Le fournisseur n'a ni page publique ni présence dans l'annuaire *(ajouté v1.46)*

**C. Messagerie & communication**
- `MSG-01` — Contact d'une entreprise sans page publique
- `MSG-02` — Refonte complète de la messagerie
- `MSG-03` — Notification « lu / non-lu » des messages
- `MSG-04` — Conversation unique par binôme Client ↔ Professionnel
- `MSG-05` — Intégration native des API de communication (messagerie, appels vocaux/vidéo)
- `MSG-06` — Synchronisation instantanée d'une nouvelle conversation (sans refresh)
- `MSG-07` — Conversation projet multi-participants (ajout d'intervenants)
- `MSG-08` — Conversations multiples créées à l'attribution d'un marché *(ajouté v1.33)*
- `MSG-09` — Continuité de la messagerie après clôture & blocage bilatéral *(ajouté v1.38)*
- `MSG-10` — Sélecteur de contacts : l'utilisateur courant y figure *(ajouté v1.46)*

**D. Stabilité, session & navigation**
- `NAV-01` — Retour intempestif vers la landing page
- `NAV-02` — Déconnexions et sorties inattendues
- `NAV-03` — Conservation de la page active lors d'un rafraîchissement
- `NAV-04` — Logo absent sur la page professionnelle
- `NAV-05` — Lien « Paramètres » inopérant dans le menu de l'avatar
- `NAV-06` — « Token manquant » : requêtes non authentifiées
- `NAV-07` — Déconnexion/reconnexion apparente à la création d'un profil *(ajouté v1.33)*

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
- `PRJ-11` — Le bouton de validation persiste après la clôture par le client *(ajouté v1.33)*
- `PRJ-12` — L'équipe ne circule pas entre ses quatre emplacements *(ajouté v1.35)*
- `PRJ-13` — Espace client : blocs contradictoires et messages destinés au professionnel *(ajouté v1.35)*

**F. Avis, notifications & données de compte**
- `AVS-01` — Avis, notation et affichage centralisé des évaluations
- `AVS-02` — Gestion des notifications
- `AVS-03` — Suppression des profils et réutilisation des adresses e-mail
- `AVS-04` — Publication des avis sur la page publique & cohérence de la note moyenne *(ajouté v1.33)*
- `AVS-05` — Coordonnées du client transmises au professionnel *(ajouté v1.38)*
- `AVS-06` — Fiche client du CRM : nature, édition et cycle de vie *(ajouté v1.39)*
- `AVS-07` — Évaluation de fin de projet : destinataire, note et fenêtre de dépôt *(ajouté v1.49)*

**G. Qualité transverse**
- `QAL-01` — Optimisation générale des performances
- `QAL-02` — Source unique et affichage universel du logo d'entreprise
- `QAL-03` — Correction orthographique et grammaticale
- `QAL-04` — Défauts d'affichage transverses *(ajouté v1.34)*
- `QAL-05` — Animations KAi non fonctionnelles & état « attention » non conforme *(ajouté v1.40)*
- `QAL-06` — Retouches d'interface : huit ajustements *(ajouté v1.41)*
- `QAL-07` — Identité visuelle : composant unique et matrice d'affichage
- `QAL-08` — Lexique des rôles : un mot, une notion *(ajouté v1.50)* *(ajouté v1.42)*

**H. Suivi financier de projet**
- `FIN-01` — Suivi financier de projet : Budget, Phases, Marchés, Paiements
- `FIN-02` — Paiements intégrés Mobile Money (KAi Pro & Marketplace)
- `FIN-03` — Monétisation Marketplace : commission & stratégie en 3 phases
- `FIN-04` — Chaîne financière rompue : montants incohérents *(ajouté v1.34)*

**I. Cycle appel d'offres & marchés** *(cadré v1.4)*
- `AOF-01` — Cycle de vie complet appel d'offres → marché
- `AOF-02` — Offres reçues & comparaison (côté émetteur)
- `AOF-03` — Réponse d'un professionnel à un appel d'offres
- `AOF-04` — Filtre par métier de la Bourse des appels d'offres *(ajouté v1.33)*
- `AOF-05` — Plantage à l'ouverture du détail d'un marché *(ajouté v1.34)*

**J. Marketplace & espace fournisseur** *(cadré v1.11)*
- `MKT-01` — Catalogue produits du fournisseur
- `MKT-02` — Commande, paiement & livraison (Marketplace)
- `MKT-03` — Espace fournisseur (structure réelle)
- `MKT-04` — Produits sponsorisés (publicité Marketplace)
- `MKT-05` — KAi : surveillance de stock & conseil commercial
- `MKT-06` — Complétude opérationnelle du fournisseur à l'issue de l'inscription *(ajouté v1.30)*
- `MKT-07` — Étanchéité de la Marketplace : un seul point d'entrée transactionnel *(ajouté v1.48)*

**K. Fondations transverses** *(ajouté audit v1.3)*
- ~~`SYS-01` — Passeport Numérique du projet~~ *(RETIRÉ v1.10 — simplification MVP, réversible)*
- `SYS-02` — Matrice de droits et permissions par rôle
- `SYS-03` — Expérience mobile : web responsive puis app native
- `SYS-04` — Multilingue *(amendé v1.36 : anglais reporté, français seul au lancement)*
- `SYS-05` — Gestion des fichiers & documents
- `SYS-06` — Paramètres, page pro & aperçu public : trois portes distinctes
- `SYS-07` — Paramètres › Préférences : options sans effet et absence de validation *(ajouté v1.36)*

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
>
> **Confirmation par revue de code (25/07/2026) :** le prototype `meereo_parcours_complet.html` (écrans `p-struct`/`f-struct`) implémente correctement, côté front, trois des règles ci-dessus : format contrôlé par expression régulière (`RCCM_RE`, `TAX_RE`), **rejet explicite de la valeur d'exemple** (comparaison directe à la valeur affichée en placeholder, message *« Ceci est un exemple de format, pas un numéro valide »*), et bouton « Continuer » désactivé tant que les deux champs ne sont pas valides. **Point non vérifiable sur un prototype statique :** l'unicité réelle en base — le prototype simule ce contrôle avec une liste codée en dur d'un seul numéro (`TAKEN`), ce qui illustre l'intention mais ne remplace pas une vérification serveur contre la base de données réelle. À confirmer côté implémentation.

> **🔴 RÈGLE NON APPLIQUÉE EN PRODUCTION (27/07/2026).** Constat confirmé sur `dev.meereo.com` : le
> même RCCM et le même numéro de contribuable peuvent être enregistrés **plusieurs fois**, sur des
> profils **actifs simultanément**. L'unicité stricte exigée par le présent point **n'existe pas**.
> Voir **`INS-20`** — classé **critique**, avec les conséquences sur le badge (`INS-04`), sur les CGU,
> et le traitement des doublons déjà créés en base.
> **Précision apportée le 27/07/2026 — l'unicité porte sur l'ENTREPRISE.**
> L'exigence énoncée ci-dessus — *« un numéro déjà associé à une entreprise ne peut jamais être
> réutilisé par une autre »* — **reste intégralement valable**. La décision sur le cumul de rôles
> (`INS-14`) n'y déroge pas : elle précise seulement que **l'objet porteur du numéro est l'entreprise**,
> laquelle peut exercer deux activités *(Professionnel et Fournisseur)* sous un même RCCM.
>
> ⚠️ **Piège d'implémentation à éviter :** poser la contrainte d'unicité sur la table des **comptes**
> plutôt que sur celle des **entreprises** fermerait le cumul sans que personne ne l'ait décidé. Voir
> `INS-20` §1.
---

## `INS-02` — Gestion du logo lors de l'inscription
**Statut : RÈGLE**

Le système doit garantir qu'**un seul logo officiel** est associé à un compte professionnel, à tout moment.

- Si un professionnel importe un logo puis en génère un via l'IA, le logo importé est **définitivement remplacé** par le logo généré.
- S'il importe ensuite un nouveau logo personnalisé, celui-ci **remplace** le logo généré.
- À aucun moment plusieurs logos ne doivent coexister.

> **Dépendance :** ce logo officiel unique est la source du logo propagé partout (`QAL-02`).
>
> **Confirmation par revue de code (25/07/2026) :** le prototype `meereo_parcours_complet.html` (écrans `p-logo`/`f-logo`) est conforme à l'intention de cette règle côté interface : bascule à onglet unique entre « générer » et « importer » (`logoMode()`), aucune coexistence visuelle de deux logos, mention explicite « un seul logo reste actif ». **Ceci concerne uniquement le comportement d'écran** ; l'unicité effective en base (remplacement, jamais addition) reste une exigence serveur à vérifier indépendamment de ce prototype.
>
> **Amendement (26/07/2026) :** cette règle garantit qu'il n'y a **jamais plus d'un** logo — elle n'impose nulle part qu'il y en ait **au moins un**. L'audit de l'Annexe 6 montre que l'étape logo est franchissable à vide, sans valeur de repli définie, et que le générateur ignore le nom d'entreprise déjà saisi. Voir **`INS-12`**.

---

## `INS-03` — Création obligatoire de la page professionnelle publique
**Statut : À CORRIGER + RÈGLE**

La création de la page professionnelle publique fait partie intégrante de l'onboarding.

**Comportement attendu :** à la toute première connexion au tableau de bord, un **popup obligatoire** s'affiche immédiatement pour inviter le professionnel à créer sa page publique, dès le premier chargement, sans action de l'utilisateur.

**Comportement actuel (bug) :** le popup n'apparaît qu'après un **rafraîchissement manuel**. À corriger.

**Règle de blocage :** tant que la page publique n'est pas créée, le professionnel ne peut **pas** accéder aux autres fonctionnalités. Étape **bloquante**.

> **Complément (27/07/2026) :** la **conception** de cette page — barre d'action persistante, langage
> de formes arrondies — est spécifiée en **`INS-19`**. Le présent point traite l'**obligation** de la
> créer ; `INS-19` traite ce qu'elle doit être.
> **⚠️ Périmètre limité au seul Professionnel — manque relevé le 27/07/2026.**
> Le présent point n'impose la page publique qu'au **Professionnel**. **Le Fournisseur n'en a donc
> aucune** : il n'existe publiquement qu'à travers ses produits, et n'apparaît pas dans l'annuaire.
> **La « Boutique » de `MKT-03` n'y supplée pas** — c'est la vue vendeur de la Marketplace, un écran
> d'administration interne. Voir **`ANN-06`**, qui pose l'extension et les questions à trancher.
> **✅ PÉRIMÈTRE ÉTENDU AU FOURNISSEUR (27/07/2026).** La page publique devient **obligatoire pour les
> deux rôles à profil d'entreprise** — Professionnel **et** Fournisseur. La règle de blocage énoncée
> ci-dessus s'applique aux deux : tant que la page n'est pas créée, l'accès aux autres fonctionnalités
> est restreint. Pour le fournisseur, cette exigence rejoint les prérequis de mise en vente de
> `MKT-06`. Voir **`ANN-06`**.
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

> **⚠️ RÈGLE VIOLÉE EN PRODUCTION — constat du 27/07/2026, non signalé, relevé sur capture.**
> La page publique du compte MILLENIUM CONSTRUCTION affiche le badge « **Professionnel vérifié
> MEEREO** » alors que **son module Documents affiche « 0 documents »** et « Référentiel Entreprise
> (0) ». **Aucun RCCM n'a donc été déposé**, et aucune des conditions cumulatives posées ci-dessus
> n'est remplie.
>
> **Le badge est actuellement affiché sans aucun contrôle.** C'est l'exact inverse de l'objet de ce
> point : le présent article a été écrit pour que le badge ne soit **pas** un ornement, et que le dépôt
> seul ne suffise pas. Un badge accordé sans vérification **ne distingue plus rien** et induit en
> erreur les clients qui s'y fient pour confier un chantier. **Un badge faux est plus dommageable que
> pas de badge du tout** — il transforme une garantie en tromperie et engage MEEREO.
>
> **Correction attendue :** l'affichage du badge est **dérivé de l'état de vérification** persisté en
> base, jamais posé indépendamment. À défaut de vérification, aucun badge — et non un badge grisé ou
> une mention atténuée. Voir `INS-17` pour l'ensemble du défaut de la page publique.
> **🎨 DISPOSITION ET STYLE ARRÊTÉS (27/07/2026) — référence visuelle fournie par MEEREO.**
>
> **Forme retenue :** une **pastille** portant un **point vert** suivi du libellé en **capitales**
> — « **PROFIL VÉRIFIÉ MEEREO** » — sur un fond translucide clair.
>
> **Placement retenu :** **au-dessus du nom** de la structure, sur l'image d'en-tête de la page
> publique.
>
> **État actuel, à corriger :** le badge s'affiche « Professionnel vérifié MEEREO » en texte vert dans
> une pastille verte, **en ligne à côté du métier**, sous le nom. Il se lit comme une étiquette
> secondaire parmi d'autres.
>
> *Ce que le placement au-dessus du nom change :* la vérification devient la **première information
> lue**, avant même l'identité — ce qui correspond à sa fonction. Un badge noyé au milieu d'autres
> mentions ne remplit pas son rôle de repère de confiance.
>
> **⚠️ ÉCART DE PORTÉE CONSTATÉ.** Le présent point exige que le badge soit **« visible sur toutes les
> interfaces où le professionnel apparaît »**. Or il est **absent de l'annuaire** *(modale
> « Annuaire des professionnels »)* et **absent de la liste déroulante de recherche globale** — deux
> endroits où un client compare précisément des professionnels entre eux. **C'est là qu'il est le plus
> utile, et c'est là qu'il manque.** À ajouter dans les deux, sous une forme compacte *(point vert seul
> avec infobulle, si le libellé complet ne tient pas)*.
>
> **Rappel du constat de `INS-17`, non résolu :** ce badge s'affiche aujourd'hui **sans qu'aucun RCCM
> n'ait été déposé**. Le style et le placement ne doivent pas être corrigés avant la condition
> d'affichage — **un beau badge faux reste un badge faux**.
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

> **⚠️ CONFIRMÉ NON IMPLÉMENTÉ (26/07/2026) — constat non signalé dans la demande, relevé sur capture.**
> La page publique de MILLENIUM CONSTRUCTION est servie à l'adresse
> `dev.meereo.com/pro/04b7af02-0ab2-4b55-93c9-1ac67af77cdb` : **un identifiant technique brut**, et non
> une URL construite à partir du nom de l'entreprise comme l'exige le présent point.
>
> **Le pied de page de cette même page affiche pourtant `meereo.com/pro/votre-entreprise`** — le format
> cible est donc connu et affiché à l'utilisateur, mais **ce n'est pas l'adresse réelle**. Un
> professionnel qui copie l'URL de son navigateur pour la partager diffuse une chaîne illisible ; s'il
> recopie celle du pied de page, il diffuse un lien qui ne mène nulle part.
>
> **Aggravation à considérer :** ce point conditionne le partage sur les canaux visés par le présent
> article (site, e-mail, WhatsApp, réseaux sociaux). Une URL en identifiant technique **annule
> l'essentiel de la valeur** de la page publique. Elle affaiblit également l'affichage des avis
> (`AVS-04`), dont la vocation est d'être consultés par des tiers.
>
> **À traiter avec :** la génération du fragment d'URL à partir du nom, la garantie d'unicité et la
> variante automatique en cas de conflit, **et** la redirection permanente de l'ancienne adresse en
> identifiant technique vers la nouvelle — afin de ne pas casser les liens déjà partagés.
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
>
> **Confirmation par revue de code (25/07/2026) :** le prototype `meereo_parcours_complet.html` (livrable de design cité en v1.2) a été relu intégralement, y compris son script. Il **confirme précisément l'hypothèse (b)** de l'Annexe 3/A3.2 : sur l'écran commun d'inscription (« Étape 2 — Votre compte », id `s-account`), le bouton « Continuer » exécute `onclick="afterAccount()"` **sans aucune condition** — pas d'attribut `disabled`, pas de vérification de format sur l'e-mail, pas de contrôle de correspondance entre « Mot de passe » et « Confirmer », aucun champ marqué `.field.err`/`.field.ok`. La fonction `afterAccount()` ne fait qu'aiguiller vers l'étape suivante selon le rôle choisi, sans jamais lire l'état des champs. C'est la **cause racine exacte** du bug décrit ci-dessus : rien, dans le front, n'empêche de passer cette étape vide.
> Par contraste, les écrans `p-struct` (Professionnel) et `f-struct` (Fournisseur) **implémentent correctement** le patron attendu par `INS-06` : fonctions `checkLegal()` + `syncNext()`, bouton `disabled` tant que RCCM et numéro contribuable ne sont pas valides. **La preuve que l'équipe sait déjà construire ce contrôle existe dans le même fichier** — il suffit d'appliquer le même patron (validation par champ → état du bouton dérivé, jamais indépendant) à l'écran `s-account`, avec ces règles minimales : Prénom non vide, Nom non vide, Email au format valide, Mot de passe respectant la politique de complexité **(politique non définie dans le prototype — à trancher, voir Annexe 1)**, Confirmation strictement identique au mot de passe.
> **Portée étendue :** la même absence totale de validation a été retrouvée sur l'écran de réinitialisation de mot de passe (`s-reset`), hors périmètre onboarding — voir `INS-07`.
>
> **Amendement (26/07/2026) — bug d'origine corrigé, périmètre élargi.**
>
> **1. Le bug initialement décrit est corrigé dans le prototype v2** (`meereo_parcours_complet_v2.html`). L'écran `s-account` implémente désormais le patron attendu : `validateAccount()` contrôle prénom, nom, format d'e-mail, longueur du mot de passe et correspondance de la confirmation, et **dérive l'état du bouton** de ces contrôles (`btn.disabled=!ok`). L'écran `s-reset` fait de même via `validateReset()` (`INS-07`). Des liens de retour ont été ajoutés sur tous les écrans, et un mécanisme de reprise (« Inscription en cours · Reprendre / Recommencer ») permet de s'interrompre sans perdre sa saisie — voir `INS-13` pour ses limites. **L'impasse décrite en tête de ce point ne peut plus se produire par ce chemin.** Reste à répliquer côté serveur : un contrôle front seul ne protège de rien.
>
> **2. L'audit du 26/07/2026 (Annexe 6) révèle en revanche trois impasses d'une autre nature**, non couvertes par la rédaction initiale de ce point, parce qu'elles ne surviennent **pas pendant** le parcours mais **après** lui :
>
> - **Impasse par e-mail non vérifié (`INS-09`).** Une adresse mal saisie mais syntaxiquement valide produit un compte auquel l'utilisateur n'accédera jamais : il ne recevra ni lien de réinitialisation, ni notification. Aucun canal de reprise n'existe — c'est la seule impasse recensée qui soit **définitivement irrattrapable**, et elle échappe entièrement au dispositif actuel.
> - **Impasse par perte du brouillon (`INS-13`).** `clearDraft()` est appelé à l'**arrivée** sur l'écran de confirmation, donc **avant** tout acquittement du serveur. Un échec de création (réseau, conflit d'unicité, erreur serveur) fait perdre l'intégralité de la saisie et impose de tout recommencer : exactement la situation que ce point interdit.
> - **Impasse à la mise en service (`MKT-06`).** Un fournisseur termine le parcours, lit « Votre marketplace est prête […] Vous pouvez commencer à vendre », publie un produit — et découvre seulement alors qu'il ne peut ni être payé (aucun moyen de réception configuré) ni livrer (aucune zone définie). Il n'est pas bloqué *dans* un formulaire, mais **bloqué dans son activité, après avoir été informé du contraire**.
>
> **Conséquence sur la portée de ce point :** l'exigence « aucune situation ne doit bloquer définitivement l'utilisateur » doit être comprise comme couvrant **le parcours et sa sortie** — jusqu'à la première utilisation réelle du compte —, pas seulement l'enchaînement des écrans.

---

## `INS-07` — Validation du nouveau mot de passe à la réinitialisation
**Statut : À CORRIGER + RÈGLE** *(ajouté v1.28)*

**Constat (revue de code, 25/07/2026, `meereo_parcours_complet.html`, écran `s-reset`).** L'écran « Nouveau mot de passe » (parcours « mot de passe oublié ») affiche la consigne *« Choisissez un mot de passe d'au moins 8 caractères »* et deux champs (« Nouveau mot de passe », « Confirmer le mot de passe »), mais le bouton « Réinitialiser » exécute `onclick="go('s-login')"` **sans aucune vérification** : ni longueur minimale, ni correspondance entre les deux champs. Il est possible de valider avec un champ vide, deux valeurs différentes, ou un mot de passe d'un seul caractère.

**Fonctionnement attendu :**

- Le bouton « Réinitialiser » reste **désactivé** tant que : le nouveau mot de passe ne respecte pas la politique de complexité retenue **(à trancher — voir Annexe 1 ; le prototype ne mentionne que « 8 caractères minimum », insuffisant à lui seul comme politique de sécurité)**, et/ou que la confirmation ne correspond pas exactement.
- Chaque champ affiche un message d'erreur clair (même patron que `INS-06`/`p-struct`/`f-struct` : `checkLegal()` + `syncNext()` dans le prototype fournissent un exemple directement réutilisable).
- Le lien de réinitialisation reçu par e-mail reste **à usage unique et à durée limitée** (le prototype affiche « valable 30 minutes » sur l'écran `s-sent` — comportement serveur à confirmer, non vérifiable sur un prototype statique).

> **Dépendance :** même patron technique que `INS-06` — un seul chantier de validation de formulaire (front + serveur), pas deux implémentations séparées.
> **Origine :** ce point n'existait pas dans le référentiel avant la revue directe du code du prototype `meereo_parcours_complet.html` (25/07/2026) ; il ne pouvait pas être détecté depuis les seules captures d'écran statiques utilisées jusqu'ici.

---

## `INS-08` — Données de compte obligatoires absentes du parcours (téléphone, ville)
**Statut : À CORRIGER + RÈGLE** *(ajouté v1.30)*

**Constat (audit de traçabilité, 26/07/2026, prototype `meereo_parcours_complet_v2.html`).** Sur ses quinze écrans et pour les trois rôles, le parcours d'inscription ne demande **jamais** de numéro de téléphone ni de ville. Or ces deux champs sont documentés comme **existants et éditables** dans les Paramètres de chaque rôle (`SYS-06`) :

- « Nom de la structure, email, **téléphone, ville** *(coordonnées du compte)* » → Paramètres › Profil ;
- *Profil client :* photo, prénom, nom, email, **téléphone, ville** ;
- Fournisseur, onglet « Mon entreprise » : logo, nom, email, **téléphone, ville**.

**Ces champs existent donc en lecture, sans aucune origine en écriture.** Tout compte créé par ce parcours arrive dans ses Paramètres avec deux champs structurellement vides, qu'aucune étape n'a jamais permis de renseigner.

**Conséquences fonctionnelles avérées (constatées dans le référentiel, non hypothétiques) :**

- `MSG-01` conditionne explicitement l'invitation d'une entreprise référencée à la disposition d'**au moins un canal de contact (email ou téléphone)**. Ce second canal n'existe pour aucun compte issu du parcours actuel.
- `FIN-02` repose sur **Orange Money, MTN MoMo et Wave** — trois services dont l'identifiant de compte **est** un numéro de téléphone. Ni encaissement ni versement ne sont possibles sans lui.
- La ville conditionne la pertinence géographique de l'annuaire (`ANN-01`, `ANN-02`) et le ciblage des appels d'offres (`AOF-01`).

**Fonctionnement attendu :**

- **Téléphone : obligatoire**, à l'étape « Votre compte » (`s-account`), pour les **trois** rôles. Format ivoirien ou international, contrôlé à la saisie selon le patron déjà en place (`INS-06` : validation par champ → état du bouton dérivé, jamais indépendant).
- **Ville : obligatoire** pour le Professionnel et le Fournisseur (elle alimente l'annuaire et la page publique) ; **facultative** pour le Client, complétable ensuite depuis les Paramètres.
- ⚠️ **Ne pas confondre avec le champ « Localisation » de l'écran `c-project`** : celui-ci désigne la localisation **du projet**, pas celle du titulaire du compte. Deux données distinctes, deux destinations distinctes. Le remplissage de l'une ne doit jamais alimenter l'autre par défaut.

> **Dépendances :** `SYS-06` (destination), `MSG-01` (canal de contact), `FIN-02` (Mobile Money), `ANN-01`/`AOF-01` (pertinence géographique), `INS-06` (patron de validation).

> **✅ IMPLÉMENTÉ ET TESTÉ (26/07/2026) — lot `P1/P2`, voir Annexe 7.**
> Champs `phone` et `city` ajoutés à l'étape « Votre compte », pour les trois rôles. Le téléphone est
> **normalisé en E.164** (`+225XXXXXXXXXX`) et accepte toutes les saisies usuelles (`0707123456`,
> `07 07 12 34 56`, `+225 …`, `00225 …`). La ville est obligatoire pour Professionnel et Fournisseur,
> facultative pour le Client, avec **saisie libre** en complément de la liste de référence — une liste
> incomplète ne doit jamais bloquer une inscription.
> **Distinction respectée :** la ville du compte et la « Localisation » du projet client (`c-project`)
> sont deux champs distincts, dans deux étapes distinctes, sans report automatique de l'un vers l'autre.
> **⚠️ À vérifier avant production :** les préfixes retenus (mobiles `01`/`05`/`07`, fixes `21`→`27`)
> n'ont **pas pu être confirmés sur une source officielle ARTCI**. Un préfixe manquant bloquerait des
> inscriptions légitimes.

> **⚠️ CORRECTION DE CE CONSTAT (27/07/2026) — la production diffère du prototype.**
> **Ce point doit être partiellement corrigé, et il est honnête de le dire clairement.**
>
> La capture des **Paramètres › Mon profil** de l'espace client montre que les champs **Téléphone** et
> **Ville** **existent et sont renseignés** : `+225 0504440382` et `Abidjan`.
>
> **L'audit de l'Annexe 6 portait sur le prototype `meereo_parcours_complet_v2.html`, pas sur
> l'application de production** — la réserve était explicitement posée en A6.5 et en Annexe 7 : *« il
> est possible que certains champs manquants ici existent déjà en production ».* **C'est le cas.**
>
> **Ce qui reste à vérifier avant de clore ce point** — deux hypothèses distinctes, non départageables
> depuis une capture :
>
> 1. le parcours d'inscription **de production** collecte réellement ces champs, et le défaut n'existe
>    que dans le prototype — auquel cas ce point est **sans objet côté production** ;
> 2. les champs ont été **saisis manuellement** après coup depuis les Paramètres — auquel cas le défaut
>    subsiste : ils existent en lecture et en édition, mais restent sans origine à l'inscription.
>
> **Comment trancher :** créer un compte de test et observer si le téléphone et la ville sont demandés
> pendant le parcours. **Cinq minutes suffisent.**
>
> **Ce qui reste vrai dans tous les cas :** la **normalisation** du numéro. La valeur affichée est
> `+225 0504440382` — soit l'indicatif suivi d'un **0 initial conservé**. En numérotation
> internationale, le zéro national ne se conserve pas après l'indicatif : la forme attendue est
> `+225 0504440382` **ou** `+2250504440382` selon la convention retenue, mais elle doit être **unique
> et cohérente** pour que les services Mobile Money (`FIN-02`) et les envois SMS fonctionnent. À
> vérifier au regard du plan de numérotation ivoirien à dix chiffres.
> **Précision de statut (27/07/2026).** Un formulaire d'inscription fournisseur comportant
> **téléphone, ville et cases de consentement** a été transmis. **MEEREO confirme qu'il s'agit d'une
> maquette, non encore développée.** Ce point reste donc **entièrement ouvert côté production** — la
> maquette en devient la **cible à implémenter**.
> *Ne pas confondre avec la correction du 27/07/2026 ci-dessus, qui portait sur les Paramètres du
> client : là, les champs existent bien en production.*
---

## `INS-09` — Adresse e-mail : unicité, vérification et récupérabilité
**Statut : À CORRIGER + RÈGLE** *(ajouté v1.30)*

**Constat (audit du 26/07/2026).** L'écran `s-account` valide l'adresse e-mail **par son seul format** (`EMAIL_RE`, expression régulière). Trois contrôles absents :

1. **Aucune vérification d'unicité.** `AVS-03` fait pourtant de l'identité du compte une donnée structurante (UUID interne, réutilisation d'e-mail autorisée **uniquement** après suppression). L'unicité entre comptes actifs est donc une contrainte implicite du modèle, jamais vérifiée à la saisie.
2. **Aucune vérification de possession de l'adresse** (pas de lien ou de code de confirmation). Un utilisateur qui saisit `jean@gmial.com` au lieu de `jean@gmail.com` crée un compte parfaitement valide auquel **il ne pourra jamais accéder** : il ne recevra ni le lien de réinitialisation (`INS-07`), ni aucune notification (`AVS-02`).
3. **Conséquence directe :** c'est une **impasse définitive**, du même type que celle que `INS-06` a précisément pour objet d'éliminer — mais irrattrapable, puisque l'utilisateur ne dispose alors d'aucun canal de reprise.

**Fonctionnement attendu :**

- **Unicité vérifiée à l'étape où l'e-mail est saisi** (`s-account`), pas à la validation finale. C'est exactement le principe posé par `INS-06` : un conflit détecté en fin de parcours reproduit l'impasse que ce point corrige.
- **Vérification de l'adresse** par lien ou code à usage unique. **Point à trancher (voir Annexe 1) :** vérification *bloquante* avant l'accès à l'espace, ou *différée* avec un espace en accès restreint tant que l'adresse n'est pas confirmée. Les deux modèles sont défendables ; le premier protège mieux, le second réduit l'abandon. **Ne pas coder avant arbitrage.**
- **Filet de sécurité indispensable si la vérification est différée :** tant que l'adresse n'est pas confirmée, l'utilisateur doit pouvoir **la corriger** depuis son espace sans repasser par le parcours d'inscription. Sans cette porte de sortie, la faute de frappe reste irrattrapable.
- Le **téléphone** (`INS-08`), une fois collecté, constitue un **second canal de récupération** et réduit fortement ce risque. Les deux points se renforcent mutuellement.

> **Dépendances :** `AVS-03` (identité par UUID, réutilisation d'e-mail), `INS-06` (validation à l'étape, jamais à la fin), `INS-07` (réinitialisation), `INS-08` (canal de secours), `AVS-02` (notifications).

> **✅ IMPLÉMENTÉ ET TESTÉ (26/07/2026) — voir Annexe 7.**
> L'unicité est contrôlée **à l'étape de saisie** (appel différé de 300 ms vers
> `GET /api/onboarding/email-available`), et **revérifiée au moment de la création** pour traiter le
> cas de deux inscriptions concurrentes. Une panne du contrôle n'est **jamais bloquante** : le serveur
> revalide de toute façon.
> **⚠️ HYPOTHÈSE CODÉE, À ARBITRER (Annexe 1, pt 4) :** la vérification de possession de l'adresse a
> été implémentée en mode **différé** — le compte est créé avec `emailVerifiedAt = null` et un lien est
> envoyé. **La contrepartie exigée par ce point n'est PAS encore développée** : la porte permettant de
> corriger l'adresse tant qu'elle n'est pas confirmée existe seulement comme lien (`/compte/email`) sur
> l'écran final. **Tant que cet écran n'existe pas, la faute de frappe reste irrattrapable** et
> l'impasse décrite ci-dessus n'est pas fermée.
> **Anti-énumération :** limitation de débit posée sur l'endpoint, mais **en mémoire du process** —
> à remplacer par un compteur partagé (Redis) dès qu'il y a plusieurs instances, sinon elle est illusoire.

> **✅ TRANCHÉ (27/07/2026) — vérification différée, AVEC porte de correction.**
> Le compte est créé, le lien de confirmation envoyé, l'espace immédiatement accessible.
>
> **⚠️ Mais la contrepartie exigée par ce point doit maintenant être construite.** Tant que l'adresse
> n'est pas confirmée, l'utilisateur doit pouvoir **la corriger depuis son espace**, sans repasser par
> l'inscription. **C'est cette porte qui manque aujourd'hui** — le code livré (Annexe 7) ne fait
> qu'afficher un lien vers `/compte/email`, un écran qui n'existe pas.
>
> **Sans elle, la vérification différée est plus dangereuse que la vérification bloquante :** on crée
> un compte auquel personne ne pourra jamais accéder, et l'utilisateur ne s'en apercevra qu'au moment
> où il aura besoin de se reconnecter. **`INS-09` reste donc ouvert tant que cet écran n'existe pas.**
>
> **Spécification minimale de l'écran :** adresse actuelle affichée · état de vérification visible ·
> possibilité de la modifier · renvoi du lien · confirmation explicite après changement.

> **✅ PORTE DE CORRECTION ARRÊTÉE (27/07/2026) : depuis l'espace connecté.**
> Le compte étant créé avec une adresse **non vérifiée**, l'utilisateur entre dans son espace et corrige
> son adresse depuis un **bandeau persistant** — rappel de l'adresse, *« Renvoyer le lien »*,
> *« Corriger mon adresse »*. Le changement **revalide l'unicité** et **remet la vérification à zéro**.
>
> > **⚠️ Le bandeau doit afficher l'adresse enregistrée.** Sans elle, l'utilisateur ne peut pas voir sa
> > faute de frappe — **c'est précisément parce qu'il ne reçoit rien qu'il est là.** Un bandeau qui dit
> > seulement « vérifiez votre e-mail » ne sert à rien dans ce cas.
>
> **Ce point est désormais fermé**, sous réserve de la construction de ce bandeau.

---

## `INS-10` — Acceptation des CGU et de la politique de confidentialité
**Statut : À DÉVELOPPER + RÈGLE** *(ajouté v1.30)*

**Constat (audit du 26/07/2026).** Aucun écran du parcours d'inscription ne propose d'accepter des conditions générales d'utilisation ni une politique de confidentialité. L'écran de connexion affiche la mention « Connexion sécurisée · SSL · RGPD », mais il s'agit d'un **argument de réassurance**, pas d'un consentement recueilli. Le référentiel ne mentionne les CGU qu'à deux endroits, tous deux en aval : la modération des avis (`AVS-01`) et la traduction des contenus légaux (`QAL-03`) — **jamais leur acceptation**.

Or la plateforme collecte des données personnelles et d'identité d'entreprise (`INS-01`), héberge des échanges (`MSG-*`), et encaisse des paiements (`FIN-02`, `FIN-03`).

**Fonctionnement attendu :**

- Case à cocher **explicite et non pré-cochée** à l'étape « Votre compte » (`s-account`), liant vers les CGU et la politique de confidentialité, avec **liens consultables sans quitter le parcours** (le brouillon `INS-13` doit survivre à cette consultation).
- Le bouton « Continuer » reste **désactivé** tant que la case n'est pas cochée (même patron que `INS-06`).
- **Horodatage et version des CGU acceptées enregistrés** avec le compte : sans conservation de la version, un consentement n'est pas opposable.
- Consentements **distincts** : acceptation des CGU (obligatoire) et communications commerciales (facultative, jamais pré-cochée) ne doivent pas être recueillis dans une seule case.

> **Point à trancher (Annexe 1) :** rédaction des CGU et de la politique de confidentialité, et régime juridique applicable (Côte d'Ivoire, et le cas échéant RGPD si des utilisateurs européens sont visés — la mention « RGPD » est aujourd'hui affichée sans que le référentiel ne cadre cette obligation).
> **Dépendances :** `INS-06` (patron de validation), `INS-13` (survie du brouillon), `QAL-03` (contenus légaux traduits), `SYS-04` (multilingue FR/EN).

> **✅ IMPLÉMENTÉ ET TESTÉ (26/07/2026) — voir Annexe 7.**
> Deux cases **séparées et non pré-cochées** : acceptation des CGU (bloquante) et communications
> commerciales (facultative). Le bouton « Continuer » reste désactivé tant que la première n'est pas
> cochée. **Version et horodatage sont persistés** avec le compte (`termsVersion`, `termsAcceptedAt`),
> et le serveur **refuse une version périmée** en demandant une nouvelle acceptation.
> **⚠️ CE QUI MANQUE ENCORE :** les textes eux-mêmes. Les liens pointent vers `/legal/cgu` et
> `/legal/confidentialite`, **pages à produire**. Le régime juridique applicable reste à trancher
> (Annexe 1, pt 6). La constante `TERMS_VERSION` est un **repère technique**, pas une validation
> juridique.

> **📄 TEXTES RÉDIGÉS (26/07/2026) — projet non validé juridiquement, voir Annexe 8.**
> Les quatre textes que ce point appelait existent désormais : CGU, Politique de confidentialité,
> Conditions Générales de Vente de la Marketplace et Mentions légales. Ils sont rédigés à partir du
> fonctionnement réel de la plateforme décrit par le présent référentiel.
> **Ils ne sont PAS validés juridiquement** et ne doivent pas être publiés sans relecture par un
> avocat inscrit au barreau de Côte d'Ivoire. **53 marqueurs `[[À COMPLÉTER]]`** subsistent, dont
> l'identité de la société et le pays d'hébergement des données.
> **La constante `TERMS_VERSION` du code correspond à la version `2026-07-CI-v1` de ces textes.**

> **Précision de statut (27/07/2026).** La maquette d'inscription fournisseur comporte bien **deux
> cases distinctes** — conditions générales *(obligatoire)* et communications commerciales
> *(facultative)* — conformes à ce point. **Mais elle n'est pas développée** : le point reste ouvert,
> la maquette servant de cible.
> **⚠️ Écart relevé sur cette maquette :** elle affiche **deux fois la mention « RGPD »**
> (« Conformité RGPD » et « Données chiffrées et conformes RGPD »). **Or `SYS-04` a acté un périmètre
> Côte d'Ivoire + UEMOA, sans RGPD.** Ces mentions doivent être retirées avant développement — sinon on
> code une allégation que le référentiel a écartée.
---

## `INS-11` — Secteurs d'activité du professionnel : collectés mais jamais enregistrés
**Statut : À CORRIGER** *(ajouté v1.30)*

**Constat (revue de code, 26/07/2026, écran `p-struct`).** L'écran affiche un groupe de puces « Secteurs d'activité » (*Architecte & Design, BET structure, BET fluides, Gros œuvre, Second œuvre*). Leur gestionnaire est la fonction `tog(el)`, dont le corps complet est `el.classList.toggle('on')` : elle **bascule une classe CSS, et rien d'autre**. Ces puces n'ont **aucun identifiant**, ne figurent **pas** dans la liste des champs persistés (`PERSIST_IDS`), et **ne sont lues nulle part** au moment de passer à l'étape suivante. **La donnée est saisie par l'utilisateur puis perdue.**

**Gravité : élevée.** Contrairement à un champ décoratif, le secteur d'activité est **porteur de fonctions** dans trois points déjà figés du référentiel :

- `AOF-01` (A2) — les appels d'offres **publics** sont diffusés dans la Bourse « **aux pros du bon secteur** ». Sans secteur enregistré, aucun routage possible ;
- `SYS-06` — « nom et **secteurs** dans l'annuaire (`ANN-*`) » : la propagation est documentée, sa source ne l'est pas ;
- `SYS-06` (Décision 2) — les secteurs font partie du **contenu vitrine** édité dans « Modifier ma page pro ».

**Deux défauts secondaires sur le même écran :**

- La première puce (« Architecte & Design ») est **pré-sélectionnée en dur** dans le balisage. Un professionnel qui ne touche pas à ce bloc se voit attribuer un secteur qu'il n'a jamais choisi — donnée fausse, silencieusement.
- **Aucun minimum n'est exigé.** Il est possible de tout désélectionner et de continuer.

**Fonctionnement attendu :**

- Les secteurs sélectionnés sont **enregistrés avec le compte professionnel**, et deviennent la source unique alimentant l'annuaire (`ANN-01`, `ANN-02`), le routage des appels d'offres publics (`AOF-01`) et la page publique (`INS-03`) — principe de source unique de `QAL-02`.
- **Au moins un secteur obligatoire**, aucune pré-sélection par défaut. Bouton « Continuer » désactivé tant qu'aucun secteur n'est choisi (patron `INS-06`).
- Le secteur reste **modifiable** ensuite depuis « Modifier ma page pro » (`SYS-06`), jamais depuis deux endroits à la fois.
- **Symétrie fournisseur à traiter :** l'écran `f-struct` ne comporte **aucun équivalent**, alors que `SYS-06` prévoit des « **catégories servies** » dans l'onglet Marketplace du fournisseur. Voir `MKT-06`.

> **Dépendances :** `AOF-01` (routage), `ANN-01`/`ANN-02` (annuaire), `INS-03` (page publique), `SYS-06` (lieu d'édition), `QAL-02` (source unique), `MKT-06` (équivalent fournisseur).

> **✅ IMPLÉMENTÉ ET TESTÉ (26/07/2026) — voir Annexe 7.**
> Les secteurs sont désormais un état contrôlé, validé par schéma et **persisté** (table dédiée avec
> index sur `sectorId`, requis par le routage `AOF-01`). **Au moins un secteur obligatoire, aucune
> pré-sélection** — la valeur « Architecte & Design » cochée en dur a été supprimée. Test de rendu
> dédié : aucune puce cochée à l'arrivée, bouton bloqué tant qu'aucune sélection n'est faite.
> **Symétrie fournisseur traitée** : les « catégories servies » sont collectées de la même façon
> (`MKT-06 §3`).
> **⚠️ LISTE INSUFFISANTE, À COMPLÉTER AVEC MEEREO :** les **5 entrées** implémentées sont celles
> observées dans le prototype, reprises telles quelles pour ne rien inventer. Elles ne couvrent ni la
> topographie, ni le géotechnique, ni les corps d'état techniques détaillés. **Cette liste conditionne
> le routage des appels d'offres publics** : la compléter est un prérequis fonctionnel, pas un confort.

> **Confirmation terrain (26/07/2026) — voir `AOF-04`.** La capture de la Bourse des appels d'offres
> affiche « **Mes secteurs : 0** » pour un compte professionnel actif : cohérent avec l'absence
> d'enregistrement décrite ci-dessus, et **cause probable du filtre par métier inopérant**.
> La réserve posée plus haut sur l'**insuffisance de la liste** est par ailleurs **confirmée par la
> demande de MEEREO elle-même**, qui cite « architecte d'intérieur » — métier absent des cinq entrées
> reprises du prototype.
---

## `INS-12` — Logo à l'inscription : étape franchissable à vide, sans repli et désolidarisée du nom
**Statut : À CORRIGER + RÈGLE** *(ajouté v1.30)*

**Constat (revue de code, 26/07/2026, écrans `p-logo` et `f-logo`).** Trois défauts distincts, tous vérifiés dans le code :

1. **L'étape est franchissable sans aucun logo.** Le bouton « Continuer → » n'a ni attribut `disabled` ni condition : on peut basculer sur l'onglet « Mon logo existant », ne rien importer, et poursuivre. Le compte est alors créé **sans logo**, ce qui produit exactement le symptôme décrit par `NAV-04` (« logo absent sur la page professionnelle ») — non plus comme un bug, mais **par construction**.
2. **Aucune valeur de repli n'est définie.** `QAL-02` impose une **source unique** pour le logo affiché partout ; le référentiel ne dit nulle part ce qui s'affiche quand cette source est vide.
3. **Le logo généré ignore les informations déjà saisies.** L'aperçu affiche la lettre **« M » codée en dur** (`<span>M</span>`) et le libellé **« Votre Structure »**, également en dur — alors que le nom de l'entreprise vient d'être saisi à l'écran précédent (`p-name` / `f-name`). Une structure nommée « Traoré Architecture & Design » se voit donc proposer un logo portant un « M » et le libellé générique. Le générateur produit une forme et une couleur aléatoires (`regen()`), **sans jamais lire le nom**.

**Fonctionnement attendu :**

- **Le générateur lit le nom saisi** : monogramme dérivé des initiales réelles, libellé d'aperçu affichant le nom réel. Aucune donnée d'aperçu codée en dur.
- **Valeur de repli déterministe et documentée** : à défaut de logo choisi ou importé, la plateforme génère un **monogramme d'initiales** sur fond neutre, qui devient la source unique au sens de `QAL-02`. Ainsi, aucun emplacement d'affichage n'est jamais vide, et `NAV-04` ne peut plus se reproduire.
- **Point à trancher (Annexe 1) :** l'étape logo doit-elle être **bloquante** (aucun compte pro/fournisseur sans logo) ou **franchissable avec repli automatique** ? Le repli rend le blocage inutile et réduit l'abandon ; le blocage garantit une meilleure qualité d'annuaire. **Ne pas coder avant arbitrage.**
- Rappel `INS-02` : quelle que soit l'option retenue, **un seul logo actif** à tout moment — un import remplace la génération, et réciproquement, jamais d'addition.

> **Dépendances :** `INS-02` (unicité du logo), `QAL-02` (source unique et propagation), `NAV-04` (symptôme), `INS-03` (page publique), `MKT-01` (logo fournisseur sur les fiches produit).

> **❌ NON CORRIGÉ AU 26/07/2026 — hors périmètre du lot `P1/P2` (priorité 3).**
> Une étape `LogoStep` a été créée **uniquement pour que le parcours soit complet et franchissable**.
> Aucune des trois corrections exigées ci-dessus n'est implémentée :
> le **repli par monogramme d'initiales n'existe pas**, le générateur **ne lit toujours pas** le nom
> d'entreprise saisi, et l'étape reste franchissable à vide.
> **Conséquence à assumer en l'état :** un compte Professionnel ou Fournisseur peut être créé **sans
> aucun logo**, ce qui reproduit `NAV-04` et laisse `QAL-02` sans source. Cet avertissement est répété
> en tête du fichier `LogoStep.tsx` pour qu'il ne soit pas pris pour une étape terminée.

> **✅ La valeur de repli est désormais spécifiée (27/07/2026).** Ce point signalait qu'aucun repli
> n'était défini pour `QAL-02`. **`QAL-07` le définit** : monogramme de deux lettres, couleur dérivée
> de l'identifiant permanent de l'entité, forme dérivée de sa nature, rendu par le composant unique.
> **Le repli n'est donc plus un point ouvert** — reste à trancher si l'étape logo demeure franchissable
> à vide, ce qui est désormais acceptable puisque le repli est garanti et cohérent partout.
> **✅ Point clos par défaut (27/07/2026) : l'étape reste franchissable.** Le repli par monogramme
> étant désormais garanti et cohérent sur toute la plateforme (`QAL-07`), rien ne justifie de bloquer
> l'inscription sur cette étape. **Le compte créé sans logo affiche un monogramme, jamais un vide** —
> ce qui était la seule raison de vouloir la rendre bloquante.
> **Restent à corriger** : le générateur doit lire le nom saisi, et l'aperçu cesser d'afficher « M » et
> « Votre Structure » en dur.

> **✅ REPLI MONOGRAMME : CALCULÉ À L'AFFICHAGE, JAMAIS STOCKÉ (27/07/2026).**
> Le monogramme est produit par le **composant unique de `QAL-07`** à partir de l'**identifiant
> permanent** de l'entité. **Aucune image n'est générée ni enregistrée à l'inscription.**
>
> > **Pourquoi ne rien stocker.** Un monogramme enregistré comme « logo par défaut » devient une
> > **seconde source de vérité** : le jour où l'entreprise dépose son vrai logo, il faut penser à
> > effacer l'autre. **C'est le mécanisme même qui a produit `QAL-02` — dix écrans, dix rendus.**
> > *Une donnée dérivable ne se stocke pas.*

---

## `INS-13` — Brouillon d'inscription : portée, expiration et clôture
**Statut : À CORRIGER + RÈGLE** *(ajouté v1.30)*

**Origine.** La règle produit du 26/07/2026 — *aucun parcours ne doit laisser l'utilisateur bloqué ; il doit toujours pouvoir revenir, s'interrompre, reprendre plus tard et corriger avant validation* — a été implémentée dans le prototype `meereo_parcours_complet_v2.html` (bandeau « Inscription en cours · Reprendre / Recommencer »). **L'implémentation valide le principe mais comporte trois limites structurelles**, qui doivent être tranchées avant le développement réel.

1. **Le brouillon est purement local.** Il est stocké dans le `localStorage` du navigateur (clé `meereo_onboarding_draft_v1`). Il ne survit donc **ni au changement d'appareil, ni au vidage du cache, ni à la navigation privée**. Or le bandeau promet une reprise sans réserve. **Attendu :** dès que l'adresse e-mail est connue et vérifiée (`INS-09`), le brouillon devient **serveur**, rattaché au compte en cours de création. Le stockage local ne subsiste que comme confort avant cette étape.
2. **Le brouillon est effacé trop tôt.** La fonction `go()` appelle `clearDraft()` **à l'arrivée sur l'écran de confirmation** (`c-done`, `p-done`, `f-done`), c'est-à-dire **avant toute confirmation du serveur**. Si la création échoue (réseau, conflit d'unicité, erreur serveur), l'utilisateur perd l'intégralité de sa saisie et doit tout recommencer — la situation exacte que la règle voulait éliminer. **Attendu :** le brouillon n'est effacé qu'**après acquittement du serveur** confirmant la création du compte.
3. **Le brouillon n'expire jamais.** Un horodatage (`ts`) est bien enregistré, mais **il n'est jamais relu**. Un brouillon vieux de plusieurs mois proposera encore « Reprendre », avec des données obsolètes. **Attendu :** durée de validité explicite — **proposition : 30 jours**, à confirmer — au-delà de laquelle le brouillon est purgé et le bandeau ne s'affiche plus.

**Règle conservée telle quelle (à ne pas assouplir) :** les **mots de passe ne sont jamais écrits dans le brouillon**, ni localement ni côté serveur, même temporairement. L'utilisateur les ressaisit à la reprise. L'implémentation actuelle respecte déjà ce point (`acc-pass`, `acc-pass2`, `reset-pass`, `reset-pass2` sont exclus de `PERSIST_IDS`).

> **Dépendances :** `INS-06` (jamais d'impasse), `INS-09` (l'e-mail vérifié conditionne le passage au brouillon serveur), `NAV-02`/`NAV-03` (conservation de l'état de session), `SYS-05` (règles de gestion des données).

> **✅ IMPLÉMENTÉ ET TESTÉ (26/07/2026) — voir Annexe 7.** Les trois limites sont levées :
> 1. **Brouillon serveur** (`PUT/GET/DELETE /api/onboarding/draft`), plus de dépendance au `localStorage`.
> 2. **Purge après acquittement uniquement** : la suppression est passée **dans la transaction de
>    création**. Deux tests le prouvent — le brouillon disparaît après une création réussie, et
>    **survit** à un échec de transaction, avec le message « Vos informations sont conservées ».
> 3. **Expiration effective** : un brouillon périmé est traité comme absent **et purgé à la lecture**.
>    ⚠️ Durée fixée à **30 jours**, valeur à confirmer (Annexe 1, pt 7).
>
> **Règle de sécurité tenue et vérifiée :** aucun mot de passe n'est écrit dans un brouillon. La garde
> `stripSecrets()` est appliquée **côté serveur** — pas seulement côté client —, donc un client
> défectueux qui en enverrait ne pourrait pas les faire persister. Test dédié sur la sérialisation.

> **✅ Durée arrêtée par défaut (27/07/2026) : 30 jours.** Valeur proposée en v1.30, aucune objection.
> Au-delà, le brouillon est purgé et le bandeau de reprise ne s'affiche plus. *Réexaminable si le
> terrain montre des reprises plus tardives.*
---

## `INS-14` — Rôle : unicité, cumul et changement après inscription
**Statut : À TRANCHER** *(ajouté v1.30)*

**Constat (audit du 26/07/2026).** Le rôle choisi à l'étape 1 (`s-role`) détermine l'intégralité du parcours et, ensuite, la structure même de l'espace : `SYS-02` définit une matrice de droits par rôle, et `SYS-06` documente **trois structures de Paramètres différentes** (Client 5 onglets, Professionnel 7, Fournisseur 8) — *« ce ne sont pas des variantes d'un même écran »*. Le référentiel ne dit **nulle part** ce qui se passe si ce choix est erroné ou évolue.

**Questions ouvertes, à trancher avant développement :**

1. **Un utilisateur peut-il changer de rôle après inscription ?** Un client qui devient promoteur, un professionnel qui ouvre une activité de négoce. Si oui : que deviennent ses données existantes (projets, avis reçus, conversations) ? Si non : doit-il créer un second compte — ce que `AVS-03` interdit implicitement avec la même adresse e-mail active ?
2. **Un même titulaire peut-il cumuler deux rôles ?** Le cas est **réel et déjà documenté** : `MKT-01` précise que la Marketplace est consultée « par clients **et** professionnels (acheteurs) ». Un professionnel achète donc déjà des matériaux — ce cumul-là est **résolu** (le pro est acheteur sans être fournisseur). En revanche, le cas **Professionnel + Fournisseur** (une entreprise de gros œuvre qui revend aussi des matériaux) n'est tranché nulle part, alors qu'il est courant dans le BTP ivoirien.
3. **Le RCCM est-il partagé entre deux comptes de rôles différents ?** `INS-01` impose une unicité **stricte** du RCCM sur toute la plateforme : *« un numéro déjà associé à une entreprise ne peut jamais être réutilisé par une autre »*. Cette règle **interdit mécaniquement** à une même entreprise d'ouvrir un compte Professionnel **et** un compte Fournisseur. **C'est une conséquence non voulue et non documentée** de `INS-01` : soit elle est assumée explicitement, soit `INS-01` doit être amendé pour distinguer « une entreprise » de « un compte ».

> **Recommandation (à valider, non tranchée) :** traiter le rôle comme un **attribut du compte** et non comme sa nature, afin qu'un cumul ou un changement reste possible sans duplication d'identité légale. Cette option préserve `INS-01` (un RCCM = une entreprise) tout en autorisant une entreprise à exercer deux activités. Elle a un coût : `SYS-02` et `SYS-06` doivent alors gérer un espace à double casquette.
> **Dépendances :** `SYS-02` (droits), `SYS-06` (structure des Paramètres), `INS-01` (unicité RCCM), `AVS-03` (identité et e-mail).

> **⚠️ CORRECTION D'UNE PRÉMISSE DE CE POINT (27/07/2026).** Le point 3 ci-dessus affirme que
> l'unicité stricte du RCCM *« interdit mécaniquement »* à une même entreprise d'ouvrir un compte
> Professionnel **et** un compte Fournisseur, et en fait une conséquence non voulue à arbitrer.
>
> **Cette contrainte n'existe pas en production** (`INS-20`) : rien n'est contrôlé. La question du
> cumul de rôles **reste entière**, mais pour une raison inverse de celle décrite — non parce que le
> système l'interdit, mais **parce qu'il n'interdit rien**. L'arbitrage doit donc être rendu *avant*
> que la contrainte d'unicité ne soit posée, faute de quoi la correction de `INS-20` fermera par
> accident une possibilité que MEEREO souhaite peut-être ouvrir.
> **✅ QUESTION 2 TRANCHÉE (27/07/2026) — le cumul de rôles est RETENU.**
> Une même entreprise peut être **Professionnel et Fournisseur**. Le cas est réel : entreprise de gros
> œuvre qui revend des matériaux, menuisier qui pose et qui vend.
>
> **Question 3 tranchée par voie de conséquence :** le RCCM n'est pas « partagé entre deux comptes ».
> Il appartient à **l'entreprise**, qui porte un ou plusieurs profils de rôle. **La conséquence que je
> qualifiais de « non voulue » n'existe donc plus** : `INS-01` reste pleinement respecté, un RCCM
> demeure unique sur toute la plateforme — c'est l'objet porteur qui change.
>
> **Ce que cela impose au modèle de données :** une entité **Entreprise** distincte du compte, portant
> le RCCM et le numéro de contribuable, à laquelle se rattachent les profils de rôle. Voir `INS-20` §1
> pour les conséquences sur l'annuaire, le badge, la Marketplace, les Paramètres et la tarification.
>
> **Ce qui reste ouvert :** la **question 1** — un utilisateur peut-il **changer** de rôle, et que
> deviennent ses données ? Elle est atténuée par cette décision *(on peut désormais ajouter un rôle
> plutôt que d'en changer)*, mais le retrait d'un rôle reste à traiter.
> **✅ QUESTION 1 TRANCHÉE (27/07/2026) — ce point est désormais entièrement clos.**
> **On ne retire jamais un profil de rôle.** Pour cesser une activité, l'entreprise **supprime son
> compte et en crée un nouveau**.
>
> **Ce que cela implique, et qu'il faut dire à l'utilisateur avant qu'il n'agisse :** la suppression
> entraîne la perte de **l'historique de projets, des avis reçus et du badge de vérification**
> (`AVS-03`). Ce sont des actifs construits dans le temps, qu'aucun nouveau compte ne récupère.
>
> **En pratique, le cumul rend ce cas rare.** Un professionnel qui devient négociant **ajoute un profil
> Fournisseur** et cesse d'utiliser l'autre : il conserve tout. La suppression n'est nécessaire que
> pour **retirer** formellement un rôle — ce qui relève davantage du confort d'affichage que du besoin
> métier.
>
> **Exigence associée :** l'écran de suppression doit énoncer **précisément** ce qui sera perdu, et
> proposer l'alternative *(« Vous pouvez aussi ajouter un profil Fournisseur et conserver votre
> historique »)*. Une suppression irréversible décidée sans connaître son coût n'est pas un choix
> éclairé.
---

## `INS-15` — Fil d'étapes (stepper) : refléter le parcours réel du rôle
**Statut : À CORRIGER** *(ajouté v1.30)*

**Constat (revue de code, 26/07/2026).** Le fil d'étapes affiche **cinq points, en dur, sur tous les écrans et pour tous les rôles**, alors que les trois parcours n'ont pas la même longueur :

| Rôle | Écrans de saisie réels | Points affichés | Écran final |
|---|---|---|---|
| Client | 3 — `s-role`, `s-account`, `c-project` | **5** | `c-done` (« Dernière étape », **sans** fil d'étapes) |
| Professionnel | 4 — `s-role`, `s-account`, `p-struct`, `p-logo` | **5** | `p-done` (« Terminé », **sans** fil d'étapes) |
| Fournisseur | 5 — `s-role`, `s-account`, `f-struct`, `f-logo`, `f-mat` | **5** | `f-done` (« Terminé », **sans** fil d'étapes) |

Seul le parcours Fournisseur est donc correctement représenté. Un client voit deux points qu'il n'atteindra jamais ; un professionnel, un. S'y ajoute une incohérence de libellés : les écrans de saisie sont numérotés « Étape 2 », « Étape 3 »…, tandis que les écrans finaux portent « Dernière étape » (Client) ou « Terminé » (Pro, Fournisseur) — trois conventions pour un même moment du parcours.

**Fonctionnement attendu :**

- Le fil d'étapes est **dérivé du parcours réel du rôle sélectionné**, jamais codé en dur. Changer de rôle à l'étape 1 recalcule le fil.
- **Libellés unifiés** entre les trois parcours pour l'écran de confirmation.
- Un fil d'étapes qui promet plus d'étapes qu'il n'en existe est une **fausse information sur la durée restante** — c'est un motif d'abandon documenté en conception de formulaires, et cela contredit l'engagement de lisibilité du parcours porté par `INS-06`.

> **Dépendance :** `INS-06` (l'utilisateur doit toujours savoir où il en est et ce qu'il lui reste à faire).

> **✅ IMPLÉMENTÉ ET TESTÉ (26/07/2026) — voir Annexe 7.**
> Le fil est **dérivé du parcours réel** et non plus codé en dur. Changer de rôle à l'étape 1 le
> recalcule. Les libellés de l'écran final sont unifiés entre les trois rôles.
>
> **⚠️ CORRECTION D'UN CHIFFRE DE CE POINT.** Le tableau ci-dessus indiquait 5 étapes de saisie pour le
> Fournisseur. **Ce n'est plus exact depuis le lot `P1/P2`** : l'ajout de l'étape « Encaissement &
> livraison » (`MKT-06 §4`) porte le parcours fournisseur à **6 étapes**. Décompte à jour :
>
> | Rôle | Étapes de saisie |
> |---|---|
> | Client | **3** — profil, compte, projet |
> | Professionnel | **4** — profil, compte, structure, logo |
> | Fournisseur | **6** — profil, compte, structure, logo, **encaissement & livraison**, produit |
>
> Aucun rôle ne compte 5 étapes : le « 5 » codé en dur du prototype était donc faux pour les trois.
> Un test verrouille explicitement cette absence.

---

## `INS-16` — Recommandation KAi de fin de parcours client : interdiction des valeurs par défaut
**Statut : À CORRIGER + RÈGLE** *(ajouté v1.30)*

**Constat (revue de code, 26/07/2026, écrans `c-project` → `c-done`).** L'écran `c-project` est explicitement facultatif (« *ou passez cette étape pour le faire plus tard* », lien « Passer cette étape »). Or ce lien appelle `buildReco()` **exactement comme le bouton principal**, et `buildReco()` ne distingue jamais les deux cas. Le mécanisme précis :

- la première vignette de type de projet (« Villa / Maison ») porte la classe `sel` **codée en dur** dans le balisage : le sélecteur `#c-types .pick.sel` renvoie donc **toujours** un résultat, même si l'utilisateur n'a rien choisi ;
- le champ Budget a une option `selected` par défaut (« 20–50M FCFA ») ;
- les champs Surface et Localisation, laissés vides, sont remplacés par des littéraux de repli (`'—'` et `'votre zone'`).

**Résultat concret :** un client qui passe l'étape sans rien saisir voit un récapitulatif affirmant « Type · **Villa / Maison** », « Budget · **20–50M FCFA** », puis un message signé KAi : *« Pour votre villa / maison à votre zone, je vous recommande de publier un appel d'offres […] **J'ai déjà pré-rempli l'essentiel à partir de vos informations.** »*

**KAi affirme donc disposer d'informations que l'utilisateur n'a jamais fournies, et présente des valeurs par défaut comme des données saisies.** C'est une violation directe du principe fondateur de l'assistant (`KAi-specification-fonctionnement.md`) : KAi n'invente pas, ne comble pas les vides de sa propre initiative, et signale l'information manquante au lieu de la fabriquer.

**Fonctionnement attendu :**

- **Aucune pré-sélection** du type de projet ni du budget. L'absence de choix doit être un état représentable et visible.
- Si l'étape est **passée** ou incomplète, l'écran de fin **ne présente aucun récapitulatif** et KAi **ne formule aucune recommandation fondée sur un projet**. Il propose à la place les deux voies d'accès (appel d'offres / annuaire) **sans les hiérarchiser**, en indiquant explicitement qu'une recommandation personnalisée nécessite de décrire le projet — avec un lien direct pour le faire.
- La mention « J'ai déjà pré-rempli l'essentiel à partir de vos informations » ne s'affiche **que** si des informations ont effectivement été saisies, et ne porte **que** sur celles-ci.
- La règle d'aiguillage elle-même (construction → appel d'offres, rénovation → annuaire) reste une **proposition à valider côté produit** : elle est aujourd'hui codée dans le prototype sans être cadrée dans le référentiel.

> **Dépendances :** `KAi-specification-fonctionnement.md` (principe de non-invention), `AOF-01` (appel d'offres), `ANN-01` (annuaire), `PRJ-01` (création du projet), `FIN-01` (budget).

> **🟡 PARTIELLEMENT CORRIGÉ (26/07/2026) — voir Annexe 7.**
> **Ce qui est fait :** plus **aucune valeur par défaut**. Le type de projet n'est plus pré-sélectionné
> (la classe `sel` codée en dur a disparu), le budget s'ouvre sur « — Non renseigné — », et l'absence de
> choix est un **état visible** (« Aucun type sélectionné »). C'était la cause racine : KAi ne peut plus
> recevoir de valeurs qu'il prendrait pour des saisies.
> **Ce qui reste à faire :** l'écran de fin client et la formulation de la recommandation KAi — donc la
> règle « si l'étape est passée, aucun récapitulatif et aucune recommandation fondée sur un projet », et
> l'arbitrage de la règle d'aiguillage elle-même (construction → appel d'offres, rénovation → annuaire),
> toujours non cadrée dans le référentiel.

---

## `INS-17` — Page publique : contenu de démonstration servi en production
**Statut : À CORRIGER — MAJEUR** *(ajouté v1.34)*

**Constat (27/07/2026).** La page publique du compte **MILLENIUM CONSTRUCTION** affiche
**intégralement du contenu de démonstration**. Ce point n'a pas été signalé : il ressort de la lecture
de la capture.

| Élément affiché | Réalité |
|---|---|
| Nom de l'entreprise : « **Votre Entreprise** » | Le compte s'appelle MILLENIUM CONSTRUCTION — l'en-tête de la page l'affiche correctement juste au-dessus |
| « 18 collaborateurs · 47 projets réalisés · 3 pays d'intervention » | Compte créé le jour même ; 1 projet, 0 intervenant référencé |
| « Année de création : **2014** » | Contredit par le texte de la même page : « Agence fondée à Abidjan en **2020** » |
| Certifications : Ordre des Architectes, Agrément Ministère, ISO 9001:2015 | **0 document déposé** (module Documents : « 0 documents ») |
| 4 références : Villa Palmeraie, Residence Ivoire, Immeuble Lagune, Siege Horizon | Aucun projet livré sur la plateforme |
| Coordonnées : `contact@entreprise.ci`, `+225 27 22 00 00 00` | Adresse et numéro d'exemple |

**La page se contredit elle-même** : elle annonce une création en 2014 dans ses chiffres et en 2020 dans
son texte. C'est le signe le plus net qu'il s'agit d'un gabarit non remplacé, et non de données saisies.

### ⚠️ Le point le plus grave : le badge est affiché sans vérification

La page affiche le badge « **Professionnel vérifié MEEREO** ». Or `INS-04` pose des conditions
**cumulatives** : dépôt du RCCM dans la section Documents, analyse du document, concordance exacte du
numéro extrait avec celui déclaré, contrôles validés. Et il conclut : *« Tant que le RCCM n'est pas
déposé **et** vérifié, le professionnel n'est **pas** vérifié et le badge ne s'affiche pas. »*

**Le module Documents de ce compte affiche « 0 documents » et « Référentiel Entreprise (0) ».** Aucun
RCCM n'a donc été déposé, et le badge s'affiche malgré tout.

**Pourquoi c'est le défaut le plus coûteux de cette série.** Le badge est le **socle de confiance** de
la plateforme. `INS-04` a été introduit précisément pour qu'il ne soit pas un simple ornement : le
dépôt seul ne suffit pas, le numéro doit correspondre. Un badge affiché sans aucun contrôle **inverse
son sens** : il ne distingue plus rien, et il induit en erreur les clients qui s'y fient pour choisir
une entreprise à qui confier un chantier. Un badge faux est **pire que pas de badge du tout** — il
transforme une garantie en tromperie, et il engage MEEREO.

**Comportement attendu :**

- **Aucun contenu de démonstration ne doit être servi en production.** Un compte sans données affiche
  des **états vides explicites et invitants** (« Ajoutez votre présentation », « Aucune référence pour
  l'instant »), jamais des valeurs fictives.
- Le **nom réel** de l'entreprise est affiché, jamais un libellé générique.
- **Le badge est strictement dérivé de l'état de vérification** (`INS-04`). Sans RCCM déposé et
  vérifié, il ne s'affiche pas. C'est la même règle que celle appliquée ailleurs : une information
  affichée est **dérivée de la donnée**, jamais posée indépendamment.
- **Les certifications et références sont des données saisies par le professionnel**, jamais
  pré-remplies. Elles engagent sa responsabilité (`CGU`, A8.3, article 5).

> **⚠️ Portée juridique, à ne pas négliger.** Afficher des certifications non détenues (Ordre des
> Architectes, agrément ministériel, ISO 9001) et des références de projets non réalisés relève de la
> **pratique commerciale trompeuse** au sens de la loi n° 2016-412 relative à la consommation. Le
> risque pèse à la fois sur le professionnel — qui n'a rien saisi — et sur MEEREO, qui édite la page.
> **Ce point doit être traité avant toute ouverture publique de la plateforme.**

> **Dépendances :** `INS-03` (page publique), `INS-04` (badge — **règle violée**), `INS-05` (URL
> publique, également non implémentée), `AVS-04` (les avis manquent aussi sur cette page),
> `QAL-03` (les accents sont absents de toute la page), `SYS-06` (édition du contenu vitrine).

---

## `INS-18` — Comptes employés : création par invitation
**Statut : À DÉVELOPPER + RÈGLE** *(ajouté v1.37)*

**Origine.** Décision de MEEREO du 27/07/2026 : **chaque employé d'une entreprise dispose d'un compte**
(`PRJ-06`, `PRJ-12`). Il manquait au référentiel le **parcours de création** de ces comptes — ni
`INS-01` à `INS-17`, ni `PRJ-06` ne le décrivent.

**Le formulaire actuel ne convient pas.** Il crée une fiche descriptive : seul le nom complet est
obligatoire, l'e-mail est facultatif, aucun rôle interne n'est proposé, et le bouton indique
« Ajouter à l'équipe » — l'employé n'a aucun moyen d'accéder à la plateforme.

### Parcours attendu

1. **L'entreprise invite.** Champs obligatoires : **nom complet**, **e-mail**, **rôle interne** parmi
   les quatre de `PRJ-06`/E4. Champs facultatifs : métier, téléphone, photo.
2. **Contrôle d'unicité de l'e-mail** avant envoi (`INS-09`), avec message clair si l'adresse est déjà
   rattachée à un autre compte.
3. **Envoi d'une invitation** à usage unique et à durée limitée. **Le compte n'existe pas encore** : il
   est en attente.
4. **L'employé accepte** : il définit son mot de passe (politique de `password-policy`, Annexe 7) et
   **accepte les CGU** (`INS-10`) — il devient utilisateur de la plateforme, avec les obligations que
   cela emporte.
5. **Le compte devient actif** et l'employé accède aux projets auxquels il est affecté, dans la limite
   de son rôle interne.

### Règles

- **Un employé n'a ni RCCM ni numéro de contribuable.** Ces identifiants appartiennent à l'entreprise
  (`INS-01`) : un employé est rattaché à un compte professionnel, il n'en crée pas un second. Le
  parcours d'inscription standard (`INS-06`) **ne s'applique pas** — c'est un parcours distinct, plus
  court.
- **Deux champs distincts, à ne pas confondre :** le **métier** (texte libre — Architecte, Conducteur
  de travaux) est descriptif et affiché ; le **rôle interne** (liste fermée de quatre valeurs) gouverne
  les droits. Voir la confusion relevée en `PRJ-12`.
- **Le rôle interne restreint, il n'étend jamais** (`SYS-02`, second niveau). Un employé ne peut en
  aucun cas dépasser les droits du compte professionnel auquel il est rattaché.
- **Marqueur « Public »** (`PRJ-06`/E3) : l'entreprise choisit qui apparaît sur sa page publique.
  **Proposition : non public par défaut** — une entreprise doit décider d'exposer un collaborateur, pas
  le découvrir après coup. *À confirmer.*
- **Invitation en attente :** relançable et révocable. Une invitation non acceptée au terme du délai
  expire et ne laisse **aucun compte fantôme**.
- **Départ d'un employé** (`PRJ-06`/E5) : l'accès est **révoqué**, la personne disparaît de la page
  publique et des projets **en cours**, mais **reste attachée aux projets passés**. L'historique est
  préservé.

> **⚠️ Deux points à ne pas négliger.**
> **1. Un employé est une personne concernée au sens de la loi n° 2013-450.** Son nom, son e-mail et
> son téléphone sont des données personnelles. La politique de confidentialité (Annexe 8/A8.5) devra
> couvrir ce cas : l'entreprise saisit les données **d'un tiers**, ce qui suppose qu'elle en ait le
> droit. Une mention le rappelant au moment de l'invitation est recommandée.
> **2. Effet sur la facturation.** Le référentiel ne prévoit **aucune tarification par utilisateur** :
> l'abonnement KAi Pro est attaché au compte (`FIN-02`). Une entreprise de 18 collaborateurs pourrait
> donc ouvrir 18 accès sans surcoût. **À arbitrer** : est-ce voulu, ou faut-il un plafond, voire une
> tarification par siège ? *Point ajouté à l'Annexe 1.*

> **Dépendances :** `PRJ-06` (cycle de vie de l'équipe), `PRJ-12` (défaut constaté), `SYS-02` (rôles
> internes), `INS-09` (unicité de l'e-mail), `INS-10` (CGU), `AVS-03` (identité par UUID),
> `FIN-02` (abonnement), Annexe 8/A8.5 (données personnelles de tiers).

> **✅ Précision apportée (27/07/2026) :** le **rôle interne** attribué à l'invitation **détermine
> l'accès aux données financières**. Un employé invité comme **Collaborateur** ou **Lecteur** n'aura
> **jamais accès au budget ni aux factures** (`SYS-02`).
>
> **Conséquence sur le formulaire d'invitation :** le choix du rôle interne n'est pas une étiquette
> descriptive, **c'est une décision de confidentialité**. Il doit être présenté comme tel — un libellé
> seul ne suffit pas, chaque rôle doit indiquer en une ligne ce qu'il ouvre et ce qu'il ferme.
> *Sans cela, un dirigeant attribuera « Chef de projet » par courtoisie hiérarchique et exposera ses
> marges sans l'avoir voulu.*
> **✅ VISIBILITÉ PUBLIQUE — TRANCHÉE (27/07/2026) : non public par défaut.**
> Un employé invité **n'apparaît pas** sur la page publique tant que l'entreprise ne l'a pas
> explicitement marqué « Public » (`PRJ-06`/E3).
>
> **Motif :** le nom et la photographie d'un salarié sont des **données personnelles**. Les publier
> doit être **un acte, pas un défaut** — l'entreprise décide d'exposer un collaborateur, elle ne le
> découvre pas après coup.
>
> **Réserve consignée :** l'accord du salarié lui-même n'est **pas** exigé par cette décision. C'est
> l'entreprise qui tranche. *Défendable — la présentation d'une équipe relève de la communication de
> l'employeur — mais le salarié devrait au minimum en être informé.* **Une notification à l'employé
> lors de sa mise en visibilité coûte peu et évite une réclamation.**
---

## `INS-19` — Page publique : barre d'action persistante et langage de formes
**Statut : À DÉVELOPPER** *(ajouté v1.43)*

**Origine.** Demande de MEEREO du 27/07/2026, appuyée sur une maquette de référence transmise
(« Atelier Koffi & Associés »).

### A. Barre d'action persistante — ce qu'elle résout

**Ce n'est pas seulement un effet de design.** La page publique est **longue** : accroche, chiffres
clés, à propos, compétences, portfolio, certifications, références, pied de page. Or les actions
« Contacter » et « Inviter sur un projet » n'existent aujourd'hui **qu'en haut de page et dans le pied
de page**.

**Un visiteur convaincu au milieu du portfolio doit donc remonter toute la page pour agir.** C'est
exactement le moment où l'on perd un contact — l'intention est là, l'action ne l'est pas.

**La barre persistante supprime cette remontée.** L'action accompagne la lecture, à l'endroit et au
moment où l'envie de contacter se forme.

#### Spécification

| Élément | Règle |
|---|---|
| **Contenu** | Identité *(nom de la structure + métier · ville)* · séparateur vertical · action secondaire **« Inviter sur un projet »** · action principale **« Contacter → »** |
| **Position** | Bas de fenêtre, **centrée horizontalement**, avec une marge inférieure |
| **Forme** | Rectangle à **extrémités entièrement arrondies** *(rayon = moitié de la hauteur)* |
| **Fond** | Sombre, légèrement translucide avec flou d'arrière-plan — pour signaler qu'elle flotte au-dessus du contenu |
| **Hiérarchie des actions** | Une seule action principale, en plein contraste *(fond clair)*. L'action secondaire reste sourde *(fond gris sur fond sombre)*. **Ne jamais mettre deux actions au même niveau** : le visiteur ne saurait plus laquelle est attendue. |
| **Apparition** | Quand le bloc d'identité de l'accroche **sort du champ de vision**. Disparition quand il revient. *Elle ne double jamais une action déjà visible.* |
| **Transition** | Glissement vertical bref à l'apparition et à la disparition |

#### Trois règles qui ne se voient pas sur une maquette

1. **Visiteurs uniquement.** Un professionnel qui consulte sa propre page **ne se contacte pas
   lui-même**. La maquette de référence montre d'ailleurs une incohérence sur ce point : elle affiche
   simultanément une navigation de propriétaire *(« Tableau de bord », « + Nouveau projet »)* et une
   barre d'action de visiteur. **Pour le propriétaire, la barre affiche ses outils d'édition** — ou ne
   s'affiche pas.
2. **Sur mobile, elle ne doit pas masquer le contenu.** Une barre fixe en bas d'un petit écran mange
   une part importante de la surface utile. **La page doit réserver une marge basse équivalente**,
   sinon la dernière ligne de chaque section reste inaccessible.
3. **Respect de `prefers-reduced-motion`** *(cf. `QAL-05`)* : la barre apparaît sans glissement pour
   les utilisateurs concernés. **Apparaître sans animer reste acceptable ; ne pas apparaître ne l'est
   pas** — c'est une fonction, pas une décoration.

> **Vérification de non-collision.** `QAL-06` §3 déplace le widget KAi en **coin bas-droit**. Cette
> barre occupe le **bas-centre**. Le widget KAi ne semble pas présent sur la page publique — **à
> confirmer**, faute de quoi les deux éléments se disputeraient le bas de l'écran.

### B. Langage de formes — arrondir

**Constat.** La page publique actuelle est **entièrement anguleuse** : boutons rectangulaires à angles
vifs, logo carré, cartes de certification à bords droits, tableau de références sans rayon.

**Décision : adopter le traitement arrondi de la maquette.** Pour être applicable, cette demande doit
se traduire en **échelle de rayons**, et non en intention.

| Élément | Rayon |
|---|---|
| **Boutons** *(Contacter, Inviter sur un projet, Voir portfolio)* | Entièrement arrondis — **pilule** |
| Étiquettes de compétences et services | Entièrement arrondies |
| Badge « profil vérifié » | Entièrement arrondi *(cf. `INS-04`)* |
| Cartes et blocs de contenu | Rayon généreux — proposition **16 à 24 px** |
| Images du portfolio | Rayon modéré — proposition **12 à 16 px** |
| Avatar / logo de la structure | **Suit `QAL-07`** : rond pour une personne, carré arrondi pour une structure. *Ne pas décider ici.* |

> **Point de cohérence à ne pas manquer.** Ce rayon doit devenir une **échelle du design system**, pas
> une valeur propre à la page publique. Sans quoi la page publique sera arrondie et le reste de la
> plateforme restera anguleux — **on aura déplacé l'incohérence au lieu de la supprimer**.

### C. Ce que la maquette apporte d'autre, et que MEEREO n'a pas demandé

Signalé pour information — **hors du périmètre de la demande**, à retenir ou non :

- **Registre typographique éditorial** : nom de la structure, titres de section et chiffres clés en
  **serif italique**, contrastant avec le sans-serif du corps de texte. C'est ce qui donne à la
  maquette son caractère de vitrine plutôt que d'écran d'application.
- **Boutons translucides sur l'image d'accroche**, laissant transparaître la photographie.
- **Bloc de chiffres clés en carte chevauchant l'accroche**, qui lie visuellement l'image et le contenu.
- **Grille de portfolio asymétrique** avec légende en surimpression *(« Tour Plateau — 2023 »)*.

> **⚠️ AVERTISSEMENT DE PRIORITÉ — à lire avant d'engager ce chantier.**
> La page publique affiche aujourd'hui **« Votre Entreprise »**, 18 collaborateurs, 47 projets et trois
> certifications **qu'aucun document ne justifie** (`INS-17`), un **badge de vérification accordé sans
> RCCM déposé** (`INS-04`), une **URL en identifiant technique brut** (`INS-05`), **aucun accent** sur
> toute la page (`QAL-04`) et **deux représentations différentes du logo** à 200 pixels d'écart
> (`QAL-07`).
>
> **Redessiner cette page avant de corriger son contenu revient à soigner la présentation d'une
> information fausse.** La maquette de référence affiche elle-même « 147 projets livrés » et « 84 avis
> vérifiés » — **elle vaut comme référence de forme, jamais de contenu.**

> **Dépendances :** `INS-03` (page publique), `INS-04` (badge — style arrêté), `INS-05` (URL),
> `INS-17` (contenu de démonstration — **à corriger d'abord**), `AVS-04` (section avis),
> `QAL-04` (encodage), `QAL-05` (`prefers-reduced-motion`), `QAL-06` (position du widget KAi),
> `QAL-07` (identité visuelle).

> **🔴 STATUT REQUALIFIÉ (27/07/2026) — de proposition à CIBLE VALIDÉE.**
> La maquette de référence avait d'abord été qualifiée d'exploration. **MEEREO a corrigé** : c'est la
> cible. Le présent point n'est donc plus une proposition à discuter mais une **spécification à
> implémenter**.
> **Complément indispensable :** le langage visuel complet — transparence, double registre
> typographique, épure, couleur réservée au statut — est spécifié en **`INS-21` §C**. La barre
> persistante et l'échelle de rayons décrites ici n'en sont que deux traits sur six.
> **Et surtout :** la page publique étant **composée de modules** (`INS-21`), ce langage doit
> s'appliquer **à chaque variante de module**, pas à la page.
---

## `INS-20` — Unicité du RCCM et du numéro de contribuable : règle non appliquée
**Statut : À CORRIGER — 🔴 CRITIQUE** *(ajouté v1.44)*

**Constat (27/07/2026, confirmé sur `dev.meereo.com` — l'application réelle, non une maquette).**
Le même **numéro RCCM** et le même **numéro de contribuable** peuvent être enregistrés **plusieurs
fois**, sur des profils différents. **Les comptes ainsi créés sont actifs simultanément.**

**C'est la violation de l'une des toutes premières règles du référentiel.** `INS-01` énonce :
*« Ces deux identifiants doivent être **strictement uniques** sur toute la plateforme : un numéro déjà
associé à une entreprise ne peut **jamais** être réutilisé par une autre. »*

### Pourquoi ce point est classé critique et non majeur

Il ne dégrade pas une fonctionnalité : **il retire son fondement à tout l'édifice de confiance.**

1. **N'importe qui peut s'enregistrer avec le RCCM d'une entreprise existante.** Le RCCM est un
   identifiant **public** — il figure sur les documents commerciaux, les devis, les factures. Rien
   n'empêche donc d'usurper l'identité légale d'un concurrent, puis de recevoir des appels d'offres,
   de contracter, d'encaisser.
2. **Le badge « Vérifié par MEEREO » ne certifie plus rien.** `INS-04` fait dépendre le badge de la
   concordance entre le RCCM déposé et le RCCM déclaré. Si dix comptes déclarent le même numéro, la
   concordance est vraie pour les dix. **Combiné à `INS-17`** — où le badge s'affiche déjà **sans
   aucun document déposé** — la vérification est aujourd'hui **entièrement décorative**.
3. **Les CGU affirment une règle que le système n'applique pas.** L'article 4.3 (Annexe 8/A8.3) énonce
   l'unicité et le verrouillage après vérification. **Un contrat qui décrit un mécanisme inexistant
   expose MEEREO**, d'autant qu'un utilisateur lésé pourra produire ce texte.
4. **`INS-14` était fondé sur une prémisse fausse.** J'ai écrit que l'unicité stricte du RCCM
   *« interdit mécaniquement »* à une entreprise d'ouvrir un compte Professionnel **et** un compte
   Fournisseur, et j'en ai fait un point à trancher. **Cette contrainte n'existe pas** : elle n'est pas
   appliquée. La question du cumul de rôles reste entière, mais **pour une autre raison** — non pas
   parce que le système l'interdit, mais parce qu'il ne contrôle rien.

### Comportement attendu

- **Contrôle d'unicité côté serveur**, à la création **et** à la modification, sur les deux numéros.
  Un contrôle côté interface ne suffit pas : il se contourne.
- **Contrainte d'unicité en base de données**, indépendamment du code applicatif. *C'est la seule
  garantie qui résiste à un défaut de validation, à une requête concurrente ou à une importation.*
- **Message explicite en cas de conflit** : « Ce numéro RCCM est déjà associé à un compte MEEREO. »
  Puis une **voie de recours** — si l'utilisateur est le titulaire légitime, il doit pouvoir le
  signaler. Sans cette porte, on remplace un défaut de sécurité par une impasse (`INS-06`).
- **Normalisation avant comparaison** : casse, espaces et tirets ne doivent pas permettre de
  contourner le contrôle. `CI-ABJ-2024-B-12344` et `ci abj 2024 b 12344` sont **le même numéro**.

### ⚠️ Traitement des doublons déjà créés

**La correction de la règle ne suffira pas.** Des comptes en double existent déjà en base, et une
contrainte d'unicité ajoutée sur des données non conformes **échouera à la migration**.

**À prévoir dans le même chantier :** inventaire des doublons existants · règle de départage *(quel
compte conserve le numéro ?)* · **notification des titulaires concernés** — un utilisateur dont le
compte serait invalidé doit être prévenu et non découvrir la situation seul.

> **Dépendances :** `INS-01` (**règle violée**), `INS-04` (badge — fondement retiré), `INS-14` (prémisse
> corrigée), `INS-17` (badge sans document), `AVS-03` (identité par UUID), Annexe 8/A8.3 art. 4.3
> (CGU — **affirment une règle non appliquée**).

> **🔴 DÉCISIONS DE MEEREO (27/07/2026) — forme de la contrainte et traitement des doublons.**
>
> ### 1. La contrainte porte sur l'ENTREPRISE, pas sur le compte
>
> **Une même entreprise peut cumuler les rôles Professionnel et Fournisseur.** Le cas est réel dans le
> BTP ivoirien : une entreprise de gros œuvre qui revend aussi des matériaux, un menuisier qui pose et
> qui vend.
>
> **Conséquence structurante — et ce n'est pas qu'une contrainte à ajouter, c'est un modèle de données
> à corriger :**
>
> | | Modèle actuel *(implicite)* | Modèle attendu |
> |---|---|---|
> | Le RCCM appartient à… | un **compte** | une **entreprise** |
> | Une entreprise possède… | *(notion absente)* | un ou plusieurs **profils de rôle** |
> | Contrainte | `UNIQUE(rccm)` sur les comptes — **fermerait le cumul par accident** | `UNIQUE(rccm)` sur les **entreprises** |
>
> **`INS-01` est intégralement respecté** : un RCCM reste **strictement unique sur toute la
> plateforme**. Ce qui change, c'est que l'objet porteur du numéro devient l'**entreprise**, et non le
> compte — une entreprise pouvant exercer deux activités.
>
> ⚠️ **Poser naïvement `UNIQUE(rccm)` sur la table des comptes fermerait le cumul sans que personne
> ne l'ait décidé.** C'est précisément le risque signalé avant l'arbitrage : le correctif aurait
> supprimé une possibilité voulue.
>
> **Ce que le cumul impose ailleurs — à traiter dans le même chantier :**
>
> - **Annuaire :** l'entreprise apparaît **une seule fois**, avec ses deux activités. Deux fiches pour
>   un même RCCM se liraient comme un doublon et ruineraient la confiance dans l'annuaire.
> - **Badge de vérification :** vérifié **une fois pour l'entreprise**, affiché sur ses deux profils.
>   Vérifier deux fois le même document n'a pas de sens.
> - **`MKT-01` à amender :** ce point énonce *« ni le client, ni le professionnel ne vendent »*. C'est
>   désormais inexact — **un professionnel doté d'un profil fournisseur vend.**
> - **`SYS-06` à compléter :** le professionnel a 7 onglets de Paramètres, le fournisseur 8. **Que voit
>   une entreprise qui a les deux rôles ?** Un espace unifié, ou une bascule entre deux espaces ?
>   *Question ouverte, ajoutée à l'Annexe 1.*
> - **`FIN-02` — question nouvelle et non triviale :** l'abonnement KAi Pro est tarifé **par rôle**
>   (Professionnel 19 900, Fournisseur 39 000 FCFA/mois). **Quel tarif pour une entreprise qui cumule ?**
>   Le plus élevé, la somme, ou un tarif « double activité » ? *Ajouté à l'Annexe 1.*
>
> ### 2. Départage des doublons existants
>
> **Distinguer d'abord deux situations que la migration ne doit pas confondre :**
>
> - **Même RCCM, rôles différents** → ce ne sont **pas** des doublons. Ils doivent être **fusionnés**
>   en une seule entreprise portant deux profils de rôle. **Aucun compte n'est invalidé.**
> - **Même RCCM, même rôle** → doublon véritable. La cascade ci-dessous s'applique.
>
> | Rang | Critère | Pourquoi |
> |---|---|---|
> | **1** | Le compte ayant **déposé le document RCCM** | Il l'a **prouvé**. Seul critère touchant à la légitimité ; les deux autres ne touchent qu'à l'usage. |
> | **2** | À défaut, celui ayant une **activité réelle** *(projets, marchés, offres)* | Invalider un compte actif au profit d'un compte vide serait absurde. |
> | **3** | À défaut, le **plus ancien** | Départage objectif de dernier recours. |
>
> **Chaque échelon est objectif et vérifiable** — aucun ne repose sur une appréciation. C'est ce qui
> permettra de justifier la décision auprès d'un titulaire évincé.
>
> ### 3. Ce que la migration doit prévoir au-delà de la règle
>
> Les comptes non retenus ne sont **pas supprimés silencieusement**. Leurs titulaires sont
> **notifiés**, avec le motif et une **voie de recours** — un utilisateur de bonne foi doit pouvoir
> démontrer sa légitimité. **Ses données restent accessibles** le temps du recours ; seul l'usage du
> numéro est suspendu.

> **✅ FORME DU CORRECTIF ARRÊTÉE (27/07/2026) — l'identité légale quitte le compte.**
>
> **`RCCM` et numéro de contribuable sont portés par une entité `Entreprise`**, unique sur toute la
> plateforme, à laquelle les comptes se rattachent. **Ils sont retirés des profils.**
>
> **C'est ce déplacement, et lui seul, qui réconcilie deux exigences jusqu'ici incompatibles :** le
> cumul de rôles devient possible *(`INS-14`)* **sans** rouvrir la faille du présent point. *Tant que
> l'unicité portait sur le profil, autoriser le cumul revenait mécaniquement à autoriser les doublons.*
>
> **✅ Doublons déjà en production : tous suspendus, y compris le plus ancien**, jusqu'à vérification
> des documents.
>
> > **Pourquoi le premier arrivé n'est pas épargné.** Le RCCM est **public** : rien ne dit que le compte
> > le plus ancien est le légitime. **L'antériorité ne prouve rien** — l'usurpateur peut avoir été le
> > plus rapide. **Épargner le premier reviendrait à valider une usurpation par défaut.**
>
> **Une suspension n'est pas une suppression :** projets et conversations sont conservés, la page
> publique est retirée de l'annuaire, l'adresse e-mail **n'est pas libérée** *(à ne pas confondre avec
> `AVS-03`)*.
>
> **⚠️ Ordre impératif :** traiter les doublons **avant** de poser la contrainte. Une contrainte
> d'unicité posée sur une colonne qui en contient fait **échouer la migration**.

---

## `INS-21` — Constructeur de page publique : bibliothèque de modules et langage visuel
**Statut : À CORRIGER + RÈGLE** *(ajouté v1.44)*

**Découverte du 27/07/2026.** MEEREO a transmis l'écran `/cockpit/page-builder`, jusqu'ici absent du
référentiel. **La page publique n'est pas une page : c'est une composition de modules**, assemblée par
le professionnel lui-même.

**Cela change la façon de spécifier tout ce qui la concerne.** Un style ne peut pas être défini « pour
la page publique » — il doit l'être **au niveau de chaque module et de chacune de ses variantes**.

### A. La bibliothèque observée

| Catégorie | Variantes constatées |
|---|---|
| En-tête | Bannière · Éditorial · Compact |
| Présentation | Essai · Manifeste · Dossier |
| Chiffres clés | Bandeau · Cartouches · Phrase augmentée |
| Expertise | Nomenclature · Mosaïque |
| Portfolio · Équipe · Certifications · Références · Coordonnées · Contact | *(catégories présentes au filtre, variantes non observées)* |

L'écran comporte un aperçu en direct, une bascule desktop / tablette / mobile, un panneau d'édition à
droite, et les actions **Aperçu · Sauvegarder · Publier · Partager**, avec un indicateur « Sauvegardé ».
**La conception est bonne** — c'est un vrai constructeur, pas un formulaire déguisé.

### B. Trois défauts du constructeur

**1. Aucune vignette n'est rendue — toutes affichent « ? ».**
C'est le défaut principal : **on ne peut pas choisir un module qu'on ne voit pas.** Le professionnel
doit deviner ce que produit « Chiffres clés — Phrase augmentée » ou « Expertise — Mosaïque », l'insérer,
constater, puis retirer. **Une bibliothèque visuelle sans visuels n'est qu'une liste de noms.**
**Attendu :** une vignette réelle par variante, générée depuis le rendu du module.

**2. Le panneau d'édition expose du HTML brut.**
Le champ « Lead (HTML) » contient littéralement `<b>simples a vivre et durables a entretenir</b>`.
**Demander à un architecte d'écrire du HTML est un choix à assumer** — et il ne l'est probablement
pas. À défaut d'un éditeur de texte enrichi, une mise en gras cassera la page à la première faute de
balise.

**3. Nommage incohérent, et sans accents.**
Le libellé affiche « Presentation — Manifeste », l'identifiant technique `pres-manifesto`
*(ni français, ni cohérent avec le libellé)*. Et l'ensemble de la bibliothèque est **dépourvu
d'accents** : En-tete, Presentation, Chiffres cles, Equipe, Coordonnees, Mosaique, Banniere. Même
cause que `QAL-04`.

### C. 🔴 Le langage visuel — statut corrigé

> **CORRECTION DU STATUT (27/07/2026).** Les maquettes transmises — page « Atelier Koffi & Associés »,
> section d'avis, badge — avaient d'abord été qualifiées d'**explorations**. **MEEREO a corrigé cette
> réponse : ce sont des CIBLES VALIDÉES.** Le style demandé est explicite : *« le travail de
> transparence, le travail de style, le style épuré et bien maîtrisé »*.
> **`INS-19` est donc requalifié : ce n'est plus une proposition, c'est une cible.**

**« Je veux ce style » doit se traduire en règles applicables.** Six traits caractérisent la maquette
et la distinguent de la page actuelle :

| # | Trait | Ce que fait la maquette | Ce que fait la page actuelle |
|---|---|---|---|
| 1 | **Transparence et flou d'arrière-plan** | Les éléments posés sur une photographie sont **translucides** : boutons secondaires, badge, barre persistante. Seule l'action principale est opaque. L'image reste perceptible dessous. | Aucune transparence. Boutons pleins, noirs ou blancs, posés sur l'image. |
| 2 | **Double registre typographique** | **Serif italique** pour le nom, les titres de section et **les chiffres clés** ; sans-serif pour le corps et l'interface. | Tout en sans-serif gras. |
| 3 | **Petites capitales espacées** | Sur-titres et légendes en capitales fines, très espacées. | Présent, mais isolé — sans le contrepoint du serif. |
| 4 | **Épure : hiérarchie par l'espace** | Cartes blanches sur fond gris très clair, **ombres douces, aucune bordure**. | **Filets horizontaux épais**, bordures franches, cartes à angles vifs. |
| 5 | **Couleur réservée au statut** | Ensemble monochrome ; la couleur n'apparaît que sur les pastilles d'état *(vert en cours, bleu à venir, gris livré)*. | Couleur utilisée sans règle *(cf. `QAL-06`)*. |
| 6 | **Arrondi maîtrisé** | Échelle cohérente : pilule, cartes, images. | Angles vifs partout. |

> **Le trait n°2 est le plus déterminant.** Le serif italique sur le nom et **sur les chiffres** est ce
> qui fait basculer la page du registre « écran d'application » au registre « vitrine ». Les chiffres
> deviennent une affirmation — *147 projets livrés* — au lieu d'un tableau de bord. **Sans lui, les
> cinq autres traits produiront une page propre mais anonyme.**

**Où ce langage doit s'appliquer :** à **chaque variante de module**, pas à la page. Une variante
« En-tête — Éditorial » rendue dans l'ancien langage annulerait l'effet des autres.

### D. ⚠️ Un module de la maquette pose un problème de confidentialité

La maquette comporte un module « **Projets actifs · Cockpit** » affichant, **publiquement** :

> *Villa Duplex — Cocody Riviera · Maître d'ouvrage : **Famille Traoré** · **185 M FCFA** · EN COURS*
> *Immeuble R+5 — Zone 4 · Promoteur : **Groupe Dakar Immo** · **640 M FCFA** · LIVRAISON Q3*

**Cela publie l'identité d'un client et le montant de son chantier, sans son accord.** Le problème est
d'un autre ordre que celui déjà signalé en `AVS-04` sur le type de projet : ici, le client est **nommé**
et le montant **exact**.

**Attendu :** un tel module ne peut afficher un client nommé ou un montant qu'avec **l'accord explicite
de ce client**, recueilli projet par projet. À défaut, deux replis possibles : anonymiser *(« Villa
duplex — Cocody · particulier »)*, ou n'afficher que les projets **livrés** dont le client a autorisé
la publication. **Une vitrine ne doit pas se construire sur les données de tiers.**

> **Dépendances :** `INS-03` (page publique), `INS-19` (**requalifié en cible validée**),
> `INS-17` (contenu de démonstration), `AVS-04` (confidentialité des avis), `AVS-05` (données du
> client), `QAL-04` (accents), `QAL-06` (échelle de rayons), `QAL-07` (identité visuelle),
> `SYS-05` (fichiers du portfolio), Annexe 8/A8.5 (politique de confidentialité).

> **✅ MODULE « PROJETS ACTIFS » — TRANCHÉ (27/07/2026) : anonymisé par défaut.**
> Le module affiche par défaut **le type de projet, la localisation et l'état**, sans nommer le client
> ni afficher le montant : *« Villa duplex — Cocody · particulier · en cours »*.
>
> **Le nom du client et le montant n'apparaissent qu'avec son accord explicite, projet par projet.**
> L'accord est demandé au client, jamais présumé — et il reste **révocable**.
>
> **Ce que ce réglage préserve :** le professionnel montre sa **capacité à livrer** — nature des
> ouvrages, volume d'activité, zones d'intervention — ce qui est l'objet réel de la vitrine. **Le nom
> du client n'ajoute presque rien à la démonstration de compétence**, alors qu'il expose un tiers qui
> n'a rien demandé.
>
> **Cas particulier à prévoir :** un client **institutionnel** (collectivité, État, fondation) peut
> avoir un intérêt à être nommé — une référence publique valorise les deux parties. **L'accord reste
> requis**, mais il sera plus souvent donné : prévoir que la demande soit simple à formuler et à
> accepter.
> **🔴 MODULES DU FOURNISSEUR — CONTRAINTE AJOUTÉE (27/07/2026).**
> La bibliothèque devra comporter des **variantes propres au fournisseur** — zones de livraison,
> délais, conditions de vente, mise en avant du catalogue. Le **portfolio n'a pas de sens** de ce côté.
>
> **Contrainte impérative :** **aucun module de page fournisseur ne porte d'action de contact.**
> L'unique action est « Voir le catalogue ». Un module « Contact » proposé par erreur dans la
> bibliothèque **rouvrirait la brèche que `MKT-07` referme** — le constructeur doit donc filtrer les
> modules disponibles **selon le profil de rôle**, et non proposer la même bibliothèque à tous.
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

> **Complément (26/07/2026) :** le **filtre par métier** de la Bourse fait l'objet d'un point dédié —
> voir **`AOF-04`**, ainsi que sa dépendance bloquante à `INS-11`.
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

## `ANN-06` — Le fournisseur n'a ni page publique ni présence dans l'annuaire
**Statut : À DÉVELOPPER + À TRANCHER** *(ajouté v1.46)*

**Constat signalé (27/07/2026).** L'annuaire affiche « **2 professionnels sur MEEREO** » et ne liste
que des Professionnels. **Aucun fournisseur n'y figure**, et aucune page publique de fournisseur n'est
accessible.

### Le manque est plus profond que l'annuaire

**Le fournisseur n'a aucune vitrine publique, nulle part.** Vérification faite dans le référentiel :

- **`INS-03`** impose la création d'une page publique **au seul Professionnel** — le fournisseur n'y
  est pas mentionné ;
- **`MKT-03`** évoque bien une « Boutique », mais c'est la **vue vendeur de la Marketplace**, un écran
  d'administration interne — **pas une page consultable par un acheteur** ;
- **`INS-21`** décrit un constructeur de page publique, sans préciser s'il s'adresse aussi au
  fournisseur.

**Le comportement constaté est donc conforme au référentiel** — c'est le référentiel qui est
incomplet. *Le dire ainsi est plus utile que de traiter le point comme un défaut : il n'y a rien à
réparer, il y a quelque chose à construire.*

**Aujourd'hui, un fournisseur n'existe publiquement qu'à travers ses produits.**

### Pourquoi c'est un vrai manque, et pas un confort

**Un acheteur qui hésite entre deux fournisseurs de ciment ne peut évaluer ni l'un ni l'autre.** Il
voit des articles, pas des entreprises. Or sur un chantier, choisir un fournisseur engage bien plus
qu'un prix : **capacité de livraison, respect des délais, zones desservies, fiabilité, service
après-vente**. Ce sont précisément les informations qu'une fiche produit ne porte pas.

**La décision du 27/07/2026 sur le cumul de rôles (`INS-14`) rend le manque plus aigu.** Une entreprise
qui exerce les deux activités apparaît dans l'annuaire au titre de son activité Professionnel, mais
**son activité Fournisseur y reste invisible**. Un client cherchant *« qui peut me fournir les matériaux
ET poser »* ne la trouvera pas — alors que c'est précisément le cas d'usage que le cumul vient
d'autoriser.

### Attendu

1. **Le fournisseur dispose d'une page publique**, construite avec le même outil que le professionnel
   (`INS-21`), mais avec des **modules adaptés à son métier** : catalogue mis en avant, catégories
   servies, **zones de livraison et délais**, certifications, avis.
2. **Il figure dans l'annuaire**, avec un filtre par rôle. **Le titre « Annuaire des professionnels »
   devra changer** — il exclut par son libellé même ce qu'on veut y ajouter.
3. **Une entreprise à deux rôles apparaît une seule fois**, avec ses deux activités — cohérent avec
   `INS-20` §1, où le RCCM appartient à l'entreprise et non au compte.

### Questions à trancher

- **Un annuaire unique avec filtre par rôle, ou deux annuaires distincts ?** *Recommandation : un
  seul.* Deux annuaires obligeraient l'utilisateur à savoir d'avance quel type d'entreprise il
  cherche — or il cherche souvent une compétence, pas un statut.
- **Quels modules de page sont spécifiques au fournisseur ?** Les zones de livraison et les délais
  n'ont pas d'équivalent côté professionnel ; le portfolio n'a pas de sens côté fournisseur.
- **La page publique du fournisseur est-elle obligatoire**, comme celle du professionnel (`INS-03`),
  ou facultative ? *Une page vide dans un annuaire nuit davantage qu'elle ne sert.*

> **Dépendances :** `INS-03` (obligation limitée au professionnel — **à étendre**), `INS-14` (cumul de
> rôles), `INS-20` (unicité par entreprise), `INS-21` (constructeur de page), `ANN-01`/`ANN-02`
> (annuaire), `MKT-01`/`MKT-03` (catalogue et espace fournisseur), `AVS-04` (avis), `QAL-07`
> (identité visuelle).

> **✅ DEUX DÉCISIONS (27/07/2026) — ce point passe de « à trancher » à « à développer ».**
>
> **1. Un annuaire unique, avec filtre par rôle.** Toutes les entreprises y figurent, filtrables par
> rôle et par métier. *Motif :* **on cherche une compétence, pas un statut.** Un client qui veut
> refaire sa toiture ne sait pas d'avance s'il lui faut un professionnel, un fournisseur, ou les deux.
> **Une entreprise à deux rôles y apparaît une seule fois**, avec ses deux activités.
> **Conséquence immédiate :** le titre « Annuaire des professionnels » doit changer — *« Annuaire
> MEEREO »* ou *« Entreprises »*. **Il exclut aujourd'hui par son libellé même ce qu'on veut y
> ajouter.**
>
> **2. La page publique du fournisseur est obligatoire**, au même titre que celle du professionnel
> (`INS-03`). *Motif :* **pas de vente sans vitrine.** Un acheteur doit pouvoir évaluer l'entreprise
> avant de commander — c'est la contrepartie de l'accès à la Marketplace.
> **Cohérent avec la règle de garde de `MKT-06`** : on ne publie pas un produit tant que la boutique
> n'est pas opérationnelle. **La page publique rejoint cette liste de prérequis** — encaissement,
> livraison, **et vitrine**.
>
> **Reste à définir : les modules propres au fournisseur** (`INS-21`). Les zones de livraison et les
> délais n'ont pas d'équivalent côté professionnel ; le portfolio n'a pas de sens côté fournisseur.
> *Décision de conception, à traiter avec la bibliothèque de modules.*
> **🔴 CORRECTION IMPORTANTE (27/07/2026) — la page du fournisseur ne porte PAS les mêmes actions que
> celle du professionnel.**
> J'avais étendu la page publique au fournisseur **sans examiner quelles actions elle devait porter**.
> **C'était une erreur d'appréciation** : les deux rôles n'ont pas le même modèle de transaction.
>
> **La page du fournisseur est une vitrine de crédibilité, pas un point de contact.** Son action unique
> est **« Voir le catalogue »**, qui renvoie vers ses produits sur la Marketplace. **Aucun bouton
> « Contacter », aucune messagerie.**
>
> **Ce que la page doit alors porter, puisque le contact est fermé :** zones de livraison, délais,
> modes, certifications, références, avis — **toute l'information qu'un acheteur aurait demandée par
> message**. Voir **`MKT-07`**, qui pose le principe d'étanchéité et ses contreparties.
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

> **🔴 RESTRICTION AJOUTÉE (27/07/2026) — ce point ne s'applique pas au Fournisseur.**
> Le présent point permet de contacter **toute entreprise référencée**. **Cette faculté est désormais
> réservée aux Professionnels.**
>
> **Un fournisseur ne peut être contacté qu'après commande** — suivi, livraison, service après-vente,
> litige. Avant commande, l'acheteur passe par le **catalogue** ou par une **demande de devis** sur la
> Marketplace. Voir **`MKT-07`**.
>
> *Motif : une messagerie ouverte avant commande permet de négocier hors de la Marketplace, ce qui
> ferait perdre la traçabilité, la donnée de stock, les avis vérifiés — et rendrait impraticable la
> Phase 3 de `FIN-03`.*
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

> **Complément (26/07/2026) :** l'unicité posée ici concerne le **fil direct binôme**. Un défaut
> distinct a été constaté sur le **groupe de projet**, dont plusieurs exemplaires sont créés à
> l'attribution d'un marché — voir **`MSG-08`**. Le principe d'idempotence retenu par le présent point
> est celui à répliquer.
> **⚠️ Dégradation du nommage constatée (27/07/2026).** La conversation directe avec le client, qui
> s'affichait « **Jayem Troh** », s'affiche désormais « **Contact** » — **le fil est pourtant le même**,
> les messages antérieurs y figurent. Le nommage contextuel exigé par le présent point n'est donc pas
> stable dans le temps : il se dégrade vers un libellé générique.
>
> **Hypothèse à vérifier en priorité :** la relation Client ↔ Professionnel est rompue à la clôture du
> marché, et la conversation, ne retrouvant plus l'identité de son interlocuteur, retombe sur une
> valeur par défaut. **Cela expliquerait simultanément la perte du nom et l'impossibilité pour le
> professionnel d'écrire** (`MSG-09`). **Une seule correction traiterait alors les deux symptômes.**
>
> **Règle à poser :** le nom d'une conversation est **dérivé de l'identité persistée du participant**,
> jamais d'un état de relation susceptible d'être révoqué. Un interlocuteur reste nommé même après la
> fin du projet qui les a réunis.

> **🔴 CONTRADICTION TRANCHÉE (27/07/2026) — signalée par la revue de développement.**
>
> **Le référentiel se contredisait :** `MSG-07`/G1 posait que le groupe projet **étend** la conversation
> unique *(« cela ne crée pas une conversation séparée »)*, tandis que `MSG-08` posait que le fil direct
> **n'est pas concerné** et **coexiste** avec le groupe. **Les deux ne pouvaient pas être vrais**, et
> aucun amendement ne départageait.
>
> **✅ RÈGLE RETENUE — fusion tant qu'il n'y a qu'un professionnel, séparation dès le premier intervenant.**
>
> | Situation du projet | Objets de conversation |
> |---|---|
> | Le titulaire est **seul** | **Un seul fil** — le fil direct Client ↔ Professionnel *sert de fil de projet*. **Aucun groupe n'est créé.** |
> | **Un intervenant est ajouté** | **Deux objets** — le **groupe projet** naît à cet instant · le **fil direct** subsiste pour les échanges privés Client ↔ Professionnel |
>
> **Ce que cette règle règle d'un coup :** dans le cas majoritaire — un client, un professionnel, pas de
> sous-traitant — **il ne peut pas y avoir de doublon, puisqu'il n'y a qu'un objet.** Le défaut constaté
> en production disparaît par construction, sans règle de déduplication à écrire.
>
> **⚠️ Point d'implémentation décisif : que devient l'historique au moment de la séparation ?**
> **Il reste dans le fil direct. Le groupe projet démarre vide, à la date de sa création.** C'est la
> stricte application de `MSG-07`/G4 *(« un intervenant ajouté ne voit que les messages postérieurs à
> son ajout »)*. **Déplacer l'historique dans le groupe exposerait aux intervenants des échanges
> commerciaux antérieurs — prix, négociation, différends — qui ne les regardent pas.**
>
> **Ce que le client conserve :** un canal privé avec son professionnel, **avant, pendant et après** le
> projet. *C'est ce que la fusion pure aurait supprimé, et c'est ce qui a motivé l'arbitrage.*

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

> **Complément (26/07/2026) :** ce point suppose **un** groupe de projet auquel les intervenants se
> rattachent. Or plusieurs groupes sont créés au lancement — voir **`MSG-08`**. Tant que ce doublon
> subsiste, la règle du présent point est inapplicable : on ne sait pas à quel groupe rattacher un
> nouvel intervenant.

> **🔴 G1 AMENDÉ (27/07/2026).** La formule *« ajouter des participants étend la conversation unique ;
> cela ne crée pas une conversation séparée »* **n'est plus exacte**. Elle décrivait le cas où le
> titulaire est seul, qu'elle continue de régir. **Dès qu'un intervenant est ajouté, un groupe projet
> distinct est créé**, et le fil direct Client ↔ Professionnel subsiste. **Détail et motifs : `MSG-04`.**
>
> **G4 est renforcé, pas modifié :** le groupe naissant à la date de l'ajout, **il n'a pas d'historique
> antérieur à exposer.** La règle de confidentialité devient une conséquence de la structure au lieu
> d'un filtre à appliquer — *c'est nettement plus sûr.*

---

## `MSG-08` — Conversations multiples créées à l'attribution d'un marché
**Statut : À CORRIGER** *(ajouté v1.33)*

**Constat (26/07/2026, captures des messageries Professionnel et Client).** Lorsqu'un client attribue
un appel d'offres et que le projet est lancé, **plusieurs conversations sont créées automatiquement**
au lieu d'une seule.

**État observé, asymétrique entre les deux rôles :**

| Rôle | Conversations visibles |
|---|---|
| **Professionnel** (MILLENIUM CONSTRUCTION) | 2 — « Jayem Troh » *(fil direct)* · « PROJET FAMILLE — MILLENIUM CO… » *(groupe)* |
| **Client** (Jayem Troh) | 3 — « MILLENIUM CONSTRUCTION » *(fil direct)* · « PROJET FAMILLE — MILLENIUM CO… » *(groupe)* · « **Projet : PROJET FAMILLE** » *(groupe)* |

### Deux indices convergents sur la cause

**1. Deux conventions de nommage différentes pour un même objet.** Le client voit deux groupes de
projet nommés selon deux formats distincts : `PROJET FAMILLE — MILLENIUM CONSTRUCTION` et
`Projet : PROJET FAMILLE`. **Deux formats de nom signalent presque toujours deux points de création
distincts dans le code** — un même code produirait un seul format.

**2. L'asymétrie 2 / 3 est elle-même un indice.** Le professionnel ne voit pas le second groupe. Soit
il n'y est pas rattaché — auquel cas un groupe de projet a été créé **sans son destinataire principal**,
ce qui est un défaut en soi ; soit l'affichage diverge entre les deux espaces, ce qui pointe vers
`PRJ-10` (cohérence Client ↔ Professionnel).

**Hypothèses de création concurrente, à vérifier dans le code :** un groupe créé à la **validation du
marché** (`PRJ-01`) et un autre à la **création automatique du projet** qui en découle ; ou un groupe
créé par l'attribution de l'appel d'offres (`AOF-02`) doublé par l'initialisation du projet.

**Comportement attendu :**

- **Un seul groupe de discussion** est créé automatiquement au lancement du projet.
- Il réunit **tous les intervenants**, au minimum le maître d'ouvrage et le professionnel attributaire.
- Tout intervenant ajouté ensuite (architecte, bureau d'études, fournisseur) **rejoint ce même groupe**,
  conformément à `MSG-07`.
- **Le fil direct binôme Client ↔ Professionnel n'est pas concerné** : `MSG-04` en garantit l'unicité
  et il conserve sa raison d'être. Le doublon à supprimer est celui du **groupe projet**, pas la
  coexistence d'un fil direct et d'un groupe.
- **Garde-fou à poser :** la création d'un groupe de projet doit être **idempotente** — une seule
  conversation par identifiant de projet, quel que soit le nombre de fois où l'événement de lancement
  est déclenché. C'est le même principe que celui déjà retenu par `MSG-04` pour le binôme.

> **Dépendances :** `MSG-04` (unicité du fil binôme), `MSG-07` (conversation projet multi-participants),
> `PRJ-01` (création automatique du projet), `AOF-02` (attribution), `PRJ-10` (cohérence des deux vues).

> **Complément (27/07/2026) — le doublon ne concerne pas que les conversations.** Le flux « Activité
> récente » du tableau de bord professionnel affiche **deux fois** l'entrée « **Demande de clôture
> envoyée** », pour une seule demande.
>
> **Ce second doublon, sur un objet différent, renforce l'hypothèse d'une cause commune** : un
> gestionnaire d'événement exécuté deux fois, ou un effet déclenché deux fois côté interface. Il ne
> s'agit donc probablement pas d'un défaut propre à la messagerie, mais d'un **défaut d'idempotence**
> plus général. **À instruire ensemble.**
> **Toujours constaté le 27/07/2026 — non résolu.** Les **deux groupes projet** subsistent dans
> l'espace client, avec leurs deux conventions de nommage distinctes : « PROJET FAMILLE — MILLENIUM
> CO… » et « Projet : PROJET FAMILLE ». **L'indice des deux formats de nom reste donc valable** pour
> localiser les deux points de création.

> **🔴 PRÉCISION (27/07/2026) — le présent point restait vrai, mais incomplet.**
> L'affirmation *« la coexistence d'un fil direct et d'un groupe n'est pas le doublon »* **n'est exacte
> que si un intervenant a été ajouté**. Sur un projet où le titulaire est seul — **le cas constaté** —
> **il ne doit exister qu'un seul fil**, et la présence d'un groupe **est** le doublon.
> **Règle complète : `MSG-04`.**

---

## `MSG-09` — Continuité de la messagerie après clôture & blocage bilatéral
**Statut : À CORRIGER + À DÉVELOPPER** *(ajouté v1.38)*

**Constat signalé (27/07/2026).** Une fois le marché terminé, **le professionnel ne peut plus écrire au
client**. Le canal se ferme automatiquement à la clôture.

### 🔴 DÉCISION 1 — la messagerie reste ouverte, sans limite de durée

**Pourquoi c'est la bonne décision, au-delà du confort.** Un chantier ne s'arrête pas à la réception.
Les **garanties postérieures** — parfait achèvement, biennale, décennale *(déclinaison ivoirienne à
confirmer par un juriste)* — courent des mois ou des années après. **Le client doit pouvoir joindre son
constructeur pour signaler un désordre, et le professionnel doit pouvoir répondre.**

Fermer le canal à la clôture ne crée pas seulement une gêne : cela prive les deux parties du seul
moyen de correspondance que la plateforme leur avait fourni, **au moment précis où les obligations
légales du constructeur commencent à s'appliquer**. C'est un risque juridique pour l'entreprise, pas
une commodité pour l'utilisateur.

**Attendu :** aucune fermeture automatique. Le fil direct Client ↔ Professionnel (`MSG-04`) et le
groupe projet (`MSG-07`) restent accessibles après clôture, en lecture **et** en écriture.

### 🔴 DÉCISION 2 — blocage explicite, à l'initiative de l'une ou l'autre partie

**MEEREO retient un mécanisme de blocage bilatéral** : le maître d'ouvrage comme le maître d'œuvre
peuvent bloquer l'autre.

**Cette solution est meilleure que celle envisagée initialement.** Elle évite d'avoir à *interpréter*
l'effacement d'une conversation — geste ambigu, qui peut signifier « je range » aussi bien que « je ne
veux plus être contacté ». **Un blocage explicite dit ce qu'il veut dire.**

### ⚠️ Tension entre ces deux décisions, à trancher avant développement

**Prises ensemble, elles se contredisent partiellement.** La décision 1 maintient le canal ouvert
*parce que* les garanties l'exigent. La décision 2 permet de le couper. **Que se passe-t-il si un
professionnel bloque un client qui doit lui signaler un désordre couvert par la garantie décennale ?**

**Résolution proposée, à valider :** distinguer nettement **le canal MEEREO** de **la relation
contractuelle**.

- Bloquer **coupe le canal MEEREO**, rien d'autre. Les coordonnées obtenues légitimement à la signature
  du marché (`AVS-05`) restent en possession des deux parties : téléphone, e-mail, courrier. **La
  relation contractuelle et les garanties ne sont pas affectées** — ce qui est cohérent avec les CGU,
  où MEEREO n'est pas partie au contrat (Annexe 8/A8.3, article 2).
- **L'historique n'est jamais supprimé** par un blocage : il est conservé et reste consultable par la
  partie bloquante. En cas de litige, les échanges sont un élément de preuve — les effacer par un
  simple clic serait imprudent pour les deux parties.
- **Le blocage est réversible** à tout moment par celui qui l'a posé.

### Questions ouvertes, à arbitrer avant de coder

1. **Le blocage est-il possible pendant un projet en cours**, ou seulement après clôture ?
   *Recommandation : seulement après clôture.* Bloquer son cocontractant en pleine exécution empêche
   la coordination du chantier et pourrait être opposé comme un manquement.
2. **Le blocage s'applique-t-il au groupe projet multi-participants** (`MSG-07`), ou seulement au fil
   direct ? *Recommandation : fil direct uniquement.* Exclure quelqu'un d'un groupe projet où
   d'autres intervenants échangent poserait des problèmes de traçabilité collective.
3. **Que voit la partie bloquée ?** Un message explicite, ou un silence ? *Recommandation : une
   mention neutre* — « Cette personne ne reçoit plus de messages sur MEEREO ». Un silence ferait
   croire à une panne et générerait des relances inutiles.
4. **`SYS-02` doit-il intégrer « bloquer » comme action** dans la matrice de droits ? Aucune action de
   ce type n'y figure aujourd'hui.

*Points ajoutés à l'Annexe 1.*

> **Observation liée, possiblement de même origine.** La conversation directe avec le client, qui
> s'affichait « **Jayem Troh** », s'affiche désormais « **Contact** » — alors qu'il s'agit du même fil
> (les messages antérieurs y figurent). **Le lien vers la fiche client semble rompu.** Cette
> dégradation du nom et l'impossibilité d'écrire pourraient avoir **la même cause** : la relation
> Client ↔ Professionnel est cassée à la clôture du marché, ce qui prive la conversation à la fois de
> son identité et de son droit d'écriture. **À vérifier en priorité — une seule correction pourrait
> traiter les deux symptômes.** Voir `MSG-04`.

> **Dépendances :** `MSG-04` (fil unique par binôme, nommage contextuel), `MSG-07` (groupe projet),
> `PRJ-02` (clôture de projet), `AVS-05` (coordonnées détenues hors plateforme), `SYS-02` (matrice de
> droits — action « bloquer » à ajouter), Annexe 8/A8.3 (MEEREO n'est pas partie au contrat).

> **⚠️ Aggravation constatée le 27/07/2026 — le fil direct a disparu de l'affichage client.**
> Le client disposait le 26/07 de **trois** conversations, dont un fil direct avec MILLENIUM
> CONSTRUCTION. **Il n'en a plus que deux — les deux groupes projet.** Le fil direct n'apparaît plus.
>
> **Trois symptômes convergent désormais vers une cause unique** : le professionnel ne pouvait plus
> écrire après clôture · la conversation avait perdu son nom au profit de « Contact » (`MSG-04`) · et
> elle **disparaît maintenant de la liste du client**. **La rupture du lien Client ↔ Professionnel à la
> clôture du marché expliquerait les trois.** À vérifier en priorité : le fil existe-t-il encore en
> base, ou n'est-il plus que non affiché ? *La réponse départage une perte de données d'un défaut
> d'affichage.*
> **✅ MODALITÉS DU BLOCAGE — TRANCHÉES (27/07/2026).**
>
> **1. Le blocage n'est possible qu'APRÈS clôture du projet.** *Motif :* bloquer son cocontractant en
> pleine exécution empêche la coordination du chantier, et **pourrait lui être opposé comme un
> manquement** en cas de litige. Pendant le projet, le canal reste ouvert des deux côtés.
> **Conséquence à prévoir :** un utilisateur harcelé pendant un chantier n'a alors aucun recours dans
> la messagerie. **Il doit pouvoir signaler à MEEREO** — voie déjà prévue par les CGU (A8.3, art. 5.3,
> contenus illicites), à rendre accessible depuis la conversation.
>
> **2. Le blocage s'applique au fil direct uniquement, jamais au groupe projet** (`MSG-07`).
> *Décidé par défaut, réexaminable.* Exclure quelqu'un d'un groupe où d'autres intervenants échangent
> poserait un problème de traçabilité collective — et le groupe projet a une fonction contractuelle,
> pas relationnelle.
>
> **3. La partie bloquée voit une mention neutre**, pas un silence : *« Cette personne ne reçoit plus
> de messages sur MEEREO. »* *Décidé par défaut, réexaminable.* Un silence ferait croire à une panne et
> générerait des relances inutiles — l'inverse de l'effet recherché.
>
> **4. `SYS-02` doit intégrer « bloquer » comme action** dans la matrice de droits. Aucune action de ce
> type n'y figure aujourd'hui.
---

## `MSG-10` — Sélecteur de contacts : l'utilisateur courant figure dans la liste
**Statut : À CORRIGER** *(ajouté v1.46)*

**Constat signalé (27/07/2026, espace Client).** La modale « **Nouvelle conversation** » propose comme
destinataire **« Jayem Troh — Maître d'ouvrage — MOA »**, c'est-à-dire **l'utilisateur connecté
lui-même**. Un client ne peut pas s'écrire à lui-même.

**Ce que ce défaut révèle.** La liste des contacts est construite à partir des **participants du
projet**, sans **filtrer l'utilisateur courant**. La correction est triviale, mais le mécanisme mérite
attention : **le filtrage n'est pas fait à la source**, il est laissé à chaque écran.

**Attendu :**

- L'utilisateur courant est **exclu de toute liste de destinataires**, quel que soit l'écran.
- **Le même composant est vraisemblablement partagé entre les trois espaces :** vérifier la modale
  côté **Professionnel** et côté **Fournisseur** avant de conclure que le défaut est propre au client.
- Une conversation **déjà existante** avec un contact ne devrait pas non plus conduire à en créer une
  seconde — `MSG-04` pose l'unicité du fil par binôme. *À vérifier sur le même écran : que se passe-t-il
  si l'on sélectionne un contact avec qui une conversation existe déjà ?*

### Deux observations sur la même capture

**1. Le fil direct avec le professionnel a disparu de la liste du client.**
Le 26/07/2026, le client disposait de **trois** conversations : un fil direct « MILLENIUM
CONSTRUCTION », et deux groupes projet. **Il n'en a plus que deux — les deux groupes.** Le fil direct
n'apparaît plus.

**Cela renforce `MSG-09` et `MSG-04` :** le professionnel ne pouvait déjà plus écrire au client après
clôture, et la conversation avait perdu son nom au profit de « Contact ». **Le fil semble désormais
avoir disparu de l'affichage client.** Une même cause — la rupture du lien Client ↔ Professionnel à la
clôture — expliquerait les trois symptômes.

**2. `MSG-08` reste entier.** Les **deux groupes projet en double** — « PROJET FAMILLE — MILLENIUM
CO… » et « Projet : PROJET FAMILLE » — sont **toujours présents**, avec leurs deux conventions de
nommage distinctes.

**3. Défaut d'affichage :** « **Maitre d'ouvrage** » sans accent circonflexe (`QAL-04`).

> **Point positif à conserver :** la mention « *Les contacts externes devront accepter votre demande* »
> est **conforme à `MSG-01`** et bien placée — l'utilisateur sait avant d'agir que le contact n'est pas
> immédiat.

> **Dépendances :** `MSG-01` (invitation d'un contact externe), `MSG-04` (unicité du fil binôme),
> `MSG-08` (groupes en double — **non résolu**), `MSG-09` (continuité après clôture), `SYS-02` (qui
> peut écrire à qui), `QAL-04` (accents).

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

> **⚠️ Cause probablement commune avec `NAV-07` (26/07/2026).** La déconnexion/reconnexion apparente
> observée à la création d'un profil ouvre une **fenêtre pendant laquelle une requête peut partir sans
> jeton valide** — ce qui produirait exactement le symptôme décrit ici. **Les deux points sont à
> instruire comme un seul chantier**, sous peine de corriger deux fois le même défaut, ou de n'en
> corriger aucun durablement.
---

## `NAV-07` — Déconnexion/reconnexion apparente à la création d'un profil
**Statut : À CORRIGER** *(ajouté v1.33)*

**Constat (26/07/2026).** À l'issue de la création d'un profil, la plateforme paraît **déconnecter puis
reconnecter** l'utilisateur. Le phénomène est visible à l'écran.

**Comportement attendu :** l'utilisateur **reste connecté de façon totalement transparente** et est
redirigé vers l'étape suivante ou son tableau de bord, **sans interruption visible de session**.

### Réponse à la question posée : pourquoi cela se produit-il ?

**Ces explications sont des hypothèses.** Je n'ai pas accès au code de production : elles indiquent
**où regarder**, dans l'ordre de probabilité décroissante, et non ce qui se passe réellement.

**Hypothèse 1 — le rôle est inscrit dans le jeton d'authentification.** C'est la plus probable. Si le
jeton émis à l'inscription ne porte pas encore le rôle (ou porte un rôle provisoire), la création du
profil le rend obsolète. L'application demande alors un **nouveau jeton**, et selon la façon dont ce
renouvellement est implémenté, l'utilisateur transite visiblement par l'écran de connexion.
*Comment le vérifier :* décoder le jeton avant et après la création du profil et comparer les
revendications (`role`, `profileId`, `iat`).

**Hypothèse 2 — le jeton est remplacé côté client, ce qui démonte l'arbre applicatif.** L'écriture du
nouveau jeton dans le stockage déclenche un changement d'état global, l'application se réinitialise et
passe brièvement par l'état « non authentifié » avant de relire le jeton. Le résultat est correct, mais
le trajet est visible.
*Comment le vérifier :* observer les rendus du contexte d'authentification pendant l'opération.

**Hypothèse 3 — une redirection passe par la route de connexion.** Après création, la redirection cible
`/login` (ou un intercepteur y renvoie parce que la requête suivante part **avant** que le nouveau
jeton soit disponible), puis une redirection automatique ramène vers le tableau de bord.
*Comment le vérifier :* tracer les navigations dans l'onglet réseau, en conservant l'historique.

**Hypothèse 4 — la session serveur est régénérée par sécurité.** La régénération d'identifiant de
session après un changement de privilèges est une **bonne pratique** contre la fixation de session. Si
c'est la cause, **le mécanisme est légitime et ne doit pas être supprimé** : c'est son **effet visible**
qu'il faut masquer, en conservant l'utilisateur authentifié pendant l'échange.

### Est-ce nécessaire ?

**Le renouvellement du jeton l'est probablement ; sa visibilité ne l'est pas.** Ce sont deux questions
distinctes qu'il ne faut pas confondre : la réponse à « faut-il un nouveau jeton ? » est plausiblement
oui ; la réponse à « faut-il que l'utilisateur le voie ? » est non.

**Correction attendue :** obtenir le nouveau jeton **avant** toute redirection, le substituer sans
démonter le contexte d'authentification, puis rediriger **une seule fois** vers la destination finale.
Aucun passage par l'écran de connexion ne doit être observable.

> **⚠️ Deux effets de bord à contrôler**, plus graves que la gêne visuelle :
> 1. **Perte de données saisies.** Si une réinitialisation de session survient alors qu'un brouillon
>    d'inscription n'est pas encore confirmé, la saisie peut être perdue — exactement l'impasse que
>    `INS-13` corrige. Le brouillon est désormais **serveur**, ce qui protège, mais le comportement
>    doit être vérifié.
> 2. **Erreur « Token manquant ».** Une requête émise pendant la fenêtre de renouvellement part sans
>    jeton valide. C'est très vraisemblablement **la même cause racine que `NAV-06`**, constaté
>    indépendamment. **À traiter comme un seul chantier, pas deux.**

> **Dépendances :** `NAV-02` (déconnexions inattendues), `NAV-06` (« Token manquant » — **cause
> probablement commune**), `NAV-03` (conservation de l'état), `INS-13` (brouillon), `SYS-02` (le rôle
> détermine les droits, donc le contenu du jeton).

> **⚠️ AGGRAVATION CONSTATÉE (27/07/2026) — ce n'est plus une gêne visuelle, c'est une perte de compte.**
> Signalement de MEEREO : à l'inscription, en arrivant sur l'espace fournisseur, **le système
> déconnecte, le compte disparaît, et la connexion renvoie « Aucun compte trouvé avec cet email »**.
> Les captures montrent successivement la modale « **Session expirée — votre session a expiré pour des
> raisons de sécurité** », puis l'écran de connexion refusant l'adresse qui vient d'être utilisée.
>
> **Le diagnostic initial de ce point est donc insuffisant.** Il décrivait un renouvellement de jeton
> mal masqué. Le symptôme réel est plus grave : **le compte n'existe plus**, ou n'a jamais été
> confirmé côté serveur.
>
> **Deux hypothèses supplémentaires à instruire en priorité :**
> 1. **Le compte n'est jamais réellement créé.** L'inscription paraît aboutir côté interface, mais la
>    transaction serveur échoue ou n'est pas validée. C'est exactement le défaut que `INS-13` prévoit
>    de contenir : **le brouillon ne doit être purgé qu'après acquittement**. Si le brouillon est
>    effacé et la création échouée, tout est perdu — l'utilisateur ne peut ni se connecter, ni
>    reprendre.
> 2. **Le compte est créé puis invalidé.** Une contrainte échoue en aval — potentiellement celle du
>    RCCM (`INS-20`) — et l'enregistrement est annulé sans que l'utilisateur en soit informé.
>
> **À vérifier en premier :** l'adresse refusée à la connexion existe-t-elle en base ? La réponse
> départage les deux hypothèses en une requête.
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

> **Complément (26/07/2026) :** la création automatique décrite ici est **l'un des deux points de
> création concurrents** suspectés d'engendrer les conversations en double constatées à l'attribution
> d'un marché — voir **`MSG-08`**. À examiner conjointement avec le point de création lié à
> l'attribution (`AOF-02`).
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

> **🔴 DÉCISION DE MEEREO (27/07/2026) — les membres d'équipe sont des utilisateurs à part entière.**
> Chaque employé **dispose d'un compte**, se connecte, et accède aux projets auxquels il est affecté.
> Cette décision **rend E4 pleinement opérant** : les quatre rôles internes ne sont plus une simple
> classification, ils gouvernent un accès réel.
>
> **Conséquence sur E2 (référentiel réutilisable) :** un membre n'est plus seulement une fiche
> rattachée au compte professionnel, c'est un **compte utilisateur rattaché à une entreprise**. La
> création passe donc par une **invitation** — voir **`INS-18`**, nouveau point.
>
> **Conséquence sur E5 (retrait) :** le retrait d'un membre doit désormais **révoquer son accès**, et
> non seulement le masquer. La règle de conservation de l'historique posée par E5 reste inchangée :
> un projet livré conserve la trace de qui y a travaillé, même après le départ de la personne.
>
> **Ce que le constat de terrain confirme (`PRJ-12`) :** le bug décrit en tête de ce point — *« les
> membres créés sur la page publique ne semblent pas enregistrés de façon exploitable »* — est
> **avéré**. La modale d'affectation affiche « Votre équipe est vide » alors que des membres ont été
> créés. **E1 n'est donc pas implémenté** : les interfaces n'écrivent pas dans la même table.
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

## `PRJ-11` — Le bouton de validation persiste après la clôture par le client
**Statut : À CORRIGER** *(ajouté v1.33)*

**Constat (26/07/2026, capture « Suivi chantier », espace Professionnel).** Après validation de la fin
de projet par le client, l'action de validation reste proposée au professionnel.

**L'écran se contredit lui-même, en trois endroits simultanés :**

| Élément affiché | Ce qu'il indique |
|---|---|
| Bandeau vert en haut | « **Clôturé — validé par le client** » |
| Sept phases + 76/76 tâches | 100 %, toutes « Terminé » |
| Bas d'écran | « Toutes les tâches sont terminées ! **Validez le projet pour envoyer une demande de réception au client** » + bouton vert « **Valider le projet** » |

Le même écran affirme donc que le projet est clôturé **et** demande de le faire valider. Côté client,
la capture correspondante affiche « **Projet clôturé — avis envoyé** » : la clôture est bien
enregistrée, c'est **l'interface professionnelle qui ne s'aligne pas sur l'état réel**.

**Comportement attendu.** Dès que la validation du client est enregistrée :

- l'action de validation **disparaît** — elle n'est ni grisée ni inopérante, elle n'est plus affichée ;
- le message d'invitation à valider disparaît également ;
- le projet passe **définitivement** au statut *Terminé* ;
- **aucune action nouvelle n'est demandée au professionnel** sur ce projet.

**Règle de fond à retenir au-delà de ce cas :** l'affichage d'une action doit être **dérivé de l'état
du projet**, jamais de la seule complétude des tâches. Ici, la condition d'affichage semble être
« toutes les tâches sont terminées » — vraie **avant comme après** la clôture, d'où la persistance.
C'est le même principe que celui appliqué à `INS-06` pour les boutons de formulaire : l'état de
l'action est dérivé, jamais posé indépendamment.

### Observation complémentaire, non signalée dans la demande

Sur la capture **client** d'un projet pourtant clôturé, le bouton « **Arrêter ce projet** » reste
proposé. Une action d'interruption sur un projet déjà terminé n'a pas d'objet et peut produire un état
incohérent. **À vérifier et vraisemblablement à masquer** selon la même règle : action dérivée de
l'état. Voir `PRJ-02` pour les transitions autorisées.

> **Dépendances :** `PRJ-02` (cycle de vie et transitions d'état), `PRJ-07` (validation par section),
> `PRJ-10` (cohérence Client ↔ Professionnel), `AVS-01` (l'avis est déclenché par la clôture).

> **Complément (27/07/2026) — le même projet porte trois états différents selon l'écran.** Constat
> élargi, issu des captures du cockpit professionnel :
>
> | Écran | État de la phase « Réception & Livraison » |
> |---|---|
> | Suivi chantier | **Terminé**, 100 %, 9/9 tâches |
> | Projets › Phases de mission | « **En cours** » |
> | Tableau de bord | « **100 % (livraison imminente)** », avec une **alerte rouge** |
> | Bandeau de suivi | « **Clôturé — validé par le client** » |
>
> Un projet clôturé et validé génère donc encore une **alerte** sur le tableau de bord et affiche une
> phase « en cours ». La cause est vraisemblablement la même que celle décrite ci-dessus : **chaque
> écran recalcule l'état à partir de critères différents** au lieu de lire un état unique.
>
> **Attendu :** l'état d'un projet est une **donnée unique**, lue par tous les écrans — pas une
> déduction refaite localement. C'est le principe de `QAL-02` appliqué à l'état plutôt qu'au logo.
> **✅ CONFIRMÉ CÔTÉ CLIENT (27/07/2026) — le défaut est partagé, pas propre au cockpit professionnel.**
> L'écran **Mes projets** de l'espace client affiche simultanément :
> le bandeau « **✓ Projet clôturé** » **et**, dans les phases de mission, « Réception & Livraison —
> **En cours** ».
>
> **La même contradiction apparaît donc dans les deux espaces**, ce qui écarte l'hypothèse d'un défaut
> d'affichage local et **confirme la cause commune** : l'état de la phase est recalculé indépendamment
> de l'état du projet, dans un composant partagé par les deux rôles. Corriger à un seul endroit
> corrigera les deux espaces.
---

## `PRJ-12` — L'équipe ne circule pas entre ses quatre emplacements
**Statut : À CORRIGER — MAJEUR** *(ajouté v1.35)*

**Constat rapporté (27/07/2026).** Les membres d'équipe ajoutés — depuis la page professionnelle
publique ou depuis les Paramètres — **ne se propagent nulle part** :

- ils ne sont **pas proposés** à la sélection lors de l'édition d'un projet ;
- ils **n'apparaissent pas** dans la section Équipe des Paramètres du professionnel ;
- ils ne sont donc **pas visibles par le client** sur le projet.

**Ce point rend `PRJ-06` inopérant.** Celui-ci énonce que *« l'équipe circule à quatre endroits »* :
référentiel d'équipe, page publique, affectation aux projets, et vue client. **Aucune de ces
circulations ne fonctionne.** Un membre saisi reste prisonnier de l'écran où il a été créé.

**Confirmation visuelle :** l'accueil de l'espace client affiche « **Équipe — 1 intervenants** » et la
section « Équipe projet » ne liste que **MILLENIUM CONSTRUCTION**, l'entreprise elle-même. Aucun membre
nominatif. Côté professionnel, l'écran **Intervenants** affiche « **0 intervenants référencés** ».

### Cause probable — deux référentiels au lieu d'un

Le symptôme le plus révélateur est qu'un membre ajouté depuis la page publique **n'apparaît pas** dans
les Paramètres › Équipe. Ces deux écrans devraient lire la **même** collection.

**Hypothèse la plus probable : l'équipe est stockée à deux endroits distincts** — un tableau
« équipe » rattaché au contenu de la page publique, et une table de membres rattachée au compte —
sans lien entre eux. C'est exactement le défaut que `SYS-06` (Décision 2) et `QAL-02` visent à
éliminer : *une donnée, un seul lieu d'édition, plusieurs affichages*.

**Une seconde hypothèse à écarter d'abord :** l'équipe est bien unique mais **l'affectation à un
projet** n'est pas implémentée, ce qui expliquerait l'absence dans le sélecteur du projet sans
expliquer l'absence dans les Paramètres. **Le constat rapporté couvre les deux symptômes**, ce qui
oriente vers la première hypothèse.

**Comportement attendu :**

- **Un seul référentiel d'équipe** par compte professionnel. La page publique et les Paramètres
  **éditent la même collection** — conformément à `SYS-06`, l'édition du contenu vitrine et celle des
  données de compte ne doivent pas dupliquer la donnée sous-jacente.
- Tout membre du référentiel est **sélectionnable** à l'affectation d'un projet (`PRJ-05`).
- Les membres **affectés** à un projet sont **visibles par le client** dans la section Équipe projet,
  avec leur rôle — c'est l'un des rares moyens dont dispose le maître d'ouvrage pour savoir **qui
  intervient réellement** sur son chantier.
- Le retrait d'un membre suit les règles de cycle de vie déjà posées par `PRJ-06`, sans rupture
  d'historique sur les projets passés.

> **Enjeu réel, au-delà de la fonctionnalité.** Le client ne peut aujourd'hui pas savoir qui travaille
> sur son projet : il voit une raison sociale, pas des personnes. Sur un chantier, savoir qui est
> l'architecte, qui est le conducteur de travaux et qui contacter en cas de problème **est une
> information de premier ordre**, pas un confort.

> **Dépendances :** `PRJ-06` (cycle de vie de l'équipe — **règle inopérante**), `PRJ-05` (assignation
> d'intervenants), `SYS-06` (un seul lieu d'édition), `QAL-02` (source unique), `INS-03` (page
> publique), `SYS-02` (droits des intervenants).

> **🔍 PREUVE VISUELLE DU DÉFAUT (27/07/2026) — captures du parcours d'affectation.**
> La modale « **Ajouter un membre** », onglet « **Mon équipe** », affiche :
> *« Recherchez parmi vos collaborateurs et intervenants déjà enregistrés dans votre environnement
> MEEREO »* → **« Aucun résultat — Votre équipe est vide. »**
>
> **Alors que des membres ont bien été créés depuis la page professionnelle publique.** C'est la
> confirmation directe de l'hypothèse posée ci-dessus : **le sélecteur d'affectation lit un référentiel
> qui ne contient pas ce qui a été saisi ailleurs.** Deux collections coexistent.
>
> **Aggravation constatée : au moins trois portes de création coexistent** — la page publique, l'onglet
> « Nouveau membre » de cette modale, et le bouton « Créer un membre » de la recherche (sans compter
> Paramètres › Équipe). **Multiplier les portes d'écriture sans référentiel unique est précisément ce
> qui produit des collections divergentes.** `PRJ-06`/E1 l'énonce déjà : *« Ce ne sont pas deux listes
> à synchroniser mais une seule donnée avec deux interfaces. »*
>
> **Point positif à conserver :** la modale distingue correctement « **Mon équipe** » (membres de la
> structure) et « **Intervenants** » (externes), conformément à `PRJ-05` et `PRJ-06`. La structure de
> l'interface est juste ; c'est la donnée qui ne suit pas.

> **🔴 DÉCISION DE MEEREO (27/07/2026) : chaque employé dispose d'un compte.**
> Il se connecte, voit les projets auxquels il est affecté, et ses droits sont restreints par son rôle
> interne.
>
> **Cette décision confirme le référentiel plutôt qu'elle ne l'élargit** : `PRJ-06`/E4 prévoit déjà
> quatre rôles internes (Administrateur, Chef de projet, Collaborateur, Lecteur) et `SYS-02` un
> « second niveau » de droits. Des rôles qui *restreignent* n'ont de sens que si la personne se
> connecte — la décision **explicite ce qui était implicite**.
>
> ### ⚠️ Mais le formulaire actuel crée une fiche, pas un compte
>
> L'onglet « Nouveau membre » comporte : **Nom complet** *(seul champ obligatoire)*, **Poste / Rôle**
> *(texte libre)*, **Email** *(facultatif)*, **Téléphone**, et un bouton « **Ajouter à l'équipe** ».
>
> **Six éléments manquent pour que ce soit un compte** — voir **`INS-18`** :
>
> | Manque | Pourquoi c'est bloquant |
> |---|---|
> | **E-mail obligatoire** | C'est l'identifiant de connexion. Il est aujourd'hui facultatif : on peut créer un membre sans aucun moyen de l'inviter. |
> | **Unicité de l'e-mail** | Un compte = une adresse (`INS-09`, `AVS-03`). Non contrôlé ici. |
> | **Rôle interne** | Les 4 rôles de `PRJ-06`/E4 ne sont pas proposés. Sans eux, aucun droit ne peut être restreint. |
> | **Mécanisme d'invitation** | Le bouton dit « Ajouter à l'équipe », pas « Inviter ». L'employé n'a aucun moyen de définir son mot de passe. |
> | **Acceptation des CGU** | L'employé devient utilisateur de la plateforme : il doit accepter les conditions (`INS-10`). |
> | **Marqueur « Public »** | `PRJ-06`/E3 exige de pouvoir choisir qui apparaît sur la page publique. Absent du formulaire. |
>
> ### Une confusion de vocabulaire à lever
>
> Le champ « **Poste / Rôle** » est en **texte libre**, avec le repère « *Chef de projet, Architecte…* ».
> Il mélange deux notions qui ne doivent pas l'être :
>
> - le **métier** — Architecte, Conducteur de travaux, Dessinateur : information **descriptive**,
>   affichée au client et sur la page publique ;
> - le **rôle interne** — Administrateur, Chef de projet, Collaborateur, Lecteur : information
>   **de droits**, qui décide de ce que la personne peut faire.
>
> **« Chef de projet » appartient aux deux vocabulaires**, ce qui rend la confusion inévitable en
> l'état. **Deux champs distincts sont nécessaires** : un métier libre, et un rôle interne choisi dans
> une liste fermée.
---

## `PRJ-13` — Espace client : blocs contradictoires et messages destinés au professionnel
**Statut : À CORRIGER** *(ajouté v1.35)*

**Constat (27/07/2026, écran « Mes projets » de l'espace client).** Trois défauts non signalés, relevés
sur la même page.

### 1. Deux blocs « Marchés » contradictoires, l'un sous l'autre

La page affiche successivement :

| Bloc | Contenu |
|---|---|
| **Marchés (1)** | Architecte & Design — MILLENIUM CONSTRUCTION — statut `signed` |
| **Marchés (0)** | « Aucun marché — créez des marchés depuis l'onglet Marchés » |

**Deux sections du même nom, avec des comptes contradictoires, sur un écran unique.** L'utilisateur ne
peut pas savoir laquelle fait foi. Cause probable : deux composants distincts alimentés par deux
sources — l'une lisant les marchés du projet, l'autre une collection vide ou mal filtrée.

### 2. Un message qui s'adresse au professionnel, affiché au client

L'état vide invite à « **créer des marchés depuis l'onglet Marchés** ». **Or l'espace client ne
comporte aucun onglet « Marchés »** : sa navigation est *Accueil, Mes projets, Suivi du projet,
Budget, Messages, Choix & validations, Documents, Mes demandes, Offres reçues, Contrats validés,
Catalogue, Professionnels, Commandes, Paramètres*.

**Le client est invité à se rendre dans un onglet qui n'existe pas dans son espace, pour effectuer une
action qui ne lui revient pas** — la création d'un marché relève du professionnel (`SYS-02`). C'est un
composant du cockpit professionnel réutilisé sans adaptation du texte au rôle.

**Règle à poser :** tout état vide et tout message d'action sont **rédigés pour le rôle qui les lit**,
et ne renvoient jamais vers une section absente de sa navigation. Un message qui envoie vers nulle part
est une impasse au sens de `INS-06`.

### 3. Statut technique non traduit

La chronologie et la carte du marché affichent le statut « **signed** », en anglais, alors que
l'interface est en français et que le reste de l'application affiche « Signé ». Une valeur brute de
base de données est rendue telle quelle, sans passer par la table de libellés.

> **Point de vigilance pour `SYS-04` (multilingue) :** ce défaut révèle que **certaines valeurs
> d'affichage ne transitent pas par la couche de traduction**. Elles resteront donc en anglais aussi
> bien dans la version française que dans la version anglaise, où elles apparaîtront comme des termes
> techniques et non comme des libellés produits. À traiter avant le chantier multilingue, pas après.

> **Dépendances :** `PRJ-10` (cohérence Client ↔ Professionnel), `SYS-02` (ce que chaque rôle peut
> faire), `SYS-04` (multilingue), `QAL-04` (défauts d'affichage transverses), `INS-06` (aucune impasse).

> **Portée confirmée et élargie (27/07/2026) — ce n'est plus un point multilingue, c'est un point de qualité.**
> MEEREO confirme **n'avoir jamais vu d'anglais** dans l'application, et l'anglais est **retiré du
> périmètre de lancement** (`SYS-04`). Les fuites « `signed` » et « `Offer submitted` » ne sont donc
> **pas** les vestiges d'une version anglaise : ce sont des **valeurs techniques brutes rendues telles
> quelles**, faute de table de libellés.
>
> **Conséquence : ce défaut ne disparaît pas avec l'abandon de l'anglais — il devient au contraire le
> seul motif de le corriger.** Un utilisateur francophone lit aujourd'hui de l'anglais technique dans
> une application unilingue française. **Une table de libellés unique reste nécessaire, indépendamment
> de toute question de traduction.**
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

> **⚠️ Non implémenté — constat du 26/07/2026.** L'« affichage centralisé » énoncé par le présent point
> **n'existe pas en production** : les avis sont enregistrés mais n'apparaissent nulle part sur la page
> publique du professionnel. Voir **`AVS-04`** pour le détail du constat, les règles d'affichage
> attendues et la cohérence de la note moyenne.

> **🔴 TROIS PRÉCISIONS APPORTÉES (27/07/2026), à la suite du défaut relevé en `AVS-07`.**
>
> **1. Qui est évalué par le client — l'entreprise titulaire du marché, elle seule.** Les
> sous-traitants et intervenants engagés par le titulaire **ne sont pas évalués par le client**. Ils le
> sont par le titulaire, au titre de l'**évaluation croisée** ci-dessus, **qui reste pleinement en
> vigueur**. *La notation suit la chaîne contractuelle : chacun est évalué par celui qui a apprécié sa
> prestation.*
>
> **2. La « note globale » est calculée, jamais saisie.** Elle est la **moyenne des critères**,
> affichée en lecture seule. La rédaction initiale du présent point — *« note globale **+** évaluation
> par critères »* — laissait entendre deux saisies indépendantes ; **il n'y en a qu'une.**
>
> **⚠️ Conséquence directe : la liste des critères doit être fermée.** Le présent point énonce
> *« délais, qualité, communication, professionnalisme… »* — **une liste ouverte**, alors que la
> production en affiche **trois** *(qualité, délais, communication)*. **On ne peut pas dériver une
> moyenne d'un ensemble indéterminé** : la liste doit être arrêtée avant développement.
>
> **3. L'évaluation ne va que du client vers le professionnel.** **Le professionnel n'évalue pas le
> client** — ni note, ni commentaire, ni historique. *Cette exclusion ne concerne pas l'évaluation
> croisée entre professionnels, qui porte sur des entreprises et demeure.*
>
> **Fenêtre de dépôt :** invitation à la clôture, relances à **J+7** et **J+21**, **fermeture à J+30**.
> Le principe *« une seule évaluation par mission terminée »* est inchangé.
>
> **Détail des décisions et de leurs contreparties : `AVS-07`.**


> **✅ COMPOSITION DE LA NOTE ARRÊTÉE (27/07/2026).**
> **Quatre critères, à poids égal :** Qualité du travail · Respect des délais · Communication & suivi ·
> **Professionnalisme**. La liste énoncée ci-dessus, ouverte par des points de suspension, est
> **désormais close** — la note globale en étant la moyenne, elle ne peut pas dériver d'un ensemble
> indéterminé. **Note affichée à une décimale**, arrondi identique partout *(`AVS-04`)*.
>
> **Immuabilité étendue à l'auteur.** Le principe posé ci-dessus pour le professionnel vaut aussi pour
> le client : **une fois envoyé, un avis n'est plus modifiable par personne**, hormis l'administration
> MEEREO. **Contrepartie obligatoire : un écran de confirmation avant envoi** *(voir `AVS-07`)*.
>
> **Vocabulaire :** le client évalue le **Professionnel** ; le Professionnel évalue les
> **Intervenants** *(`QAL-08`)*. L'**évaluation croisée** décrite ci-dessus est donc, dans le nouveau
> lexique, l'évaluation des Intervenants par le Professionnel.

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

> **Complément (27/07/2026) — le CRM des professionnels n'était pas traité.**
> Le présent point garantit qu'aucune donnée n'est **réassociée** à un nouveau compte de même e-mail.
> Il ne disait rien de ce qu'il advient des coordonnées **déjà transmises à des professionnels**
> (`AVS-05`) et conservées dans leur CRM.
>
> **Décision de MEEREO :** à la suppression du compte d'un client, **son e-mail et son téléphone sont
> purgés des fiches CRM** des professionnels avec lesquels il a travaillé. **Nom, projets et montants
> sont conservés** — historique des chantiers et obligations comptables. Voir **`AVS-06`**.
---

## `AVS-04` — Publication des avis sur la page publique & cohérence de la note moyenne
**Statut : À CORRIGER** *(ajouté v1.33)*

**Constat (26/07/2026).** Les notes et commentaires laissés par le maître d'ouvrage en fin de projet
sont **enregistrés mais jamais affichés** sur la page publique du professionnel.

**Confirmation visuelle :** la page publique de MILLENIUM CONSTRUCTION affiche successivement
*Certifications · Agréments · Qualifications*, puis *Références*, puis le pied de page et l'appel à
contact. **Aucune section d'avis n'existe entre les deux** — l'emplacement n'est pas vide, il est
absent.

Côté client, la capture confirme que l'avis a bien été émis : « **Projet clôturé — avis envoyé** ».
**La donnée existe donc ; c'est sa restitution publique qui manque.**

**Comportement attendu — affichage :** une section d'avis en bas de la page publique, présentant pour
chaque évaluation :

- la **note** attribuée ;
- le **commentaire** du client ;
- la **date** de l'évaluation ;
- le **type de projet** réalisé *(souhaité — voir la réserve de confidentialité ci-dessous)*.

L'objectif est de constituer un **historique d'évaluations consultable par tout futur client**.

**Comportement attendu — cohérence de la note moyenne.** La note moyenne affichée doit être calculée
**à partir de ces mêmes évaluations**, et depuis une **source unique**, partout où elle apparaît :
page publique, résultats de recherche, annuaire (`ANN-01`/`ANN-02`), appels d'offres, et toute autre
interface. C'est exactement le principe déjà posé par `QAL-02` pour le logo et par `INS-04` pour le
badge : **une donnée, une source, plusieurs affichages.**

**Points à vérifier lors de la correction, au-delà de l'affichage :**

- le **mode de calcul** de la moyenne (arithmétique simple ou pondérée), et son **arrondi** — un même
  arrondi doit être appliqué partout, sinon deux écrans afficheront 4,3 et 4,4 pour la même donnée ;
- le **nombre d'avis** doit accompagner la moyenne : « 4,6 » sur un seul avis et « 4,6 » sur quarante
  n'ont pas la même valeur informative, et l'omettre est trompeur ;
- le comportement en **l'absence de tout avis** — afficher « Aucun avis » plutôt qu'une note de 0,
  qui serait interprétée comme une mauvaise évaluation.

> **⚠️ Réserve de confidentialité sur le « type de projet ».** Cette mention est utile, mais elle
> **expose une information sur le chantier d'un client**. Sur un marché où les projets sont peu
> nombreux et identifiables, le croisement type + date + professionnel peut suffire à identifier le
> maître d'ouvrage. **À trancher :** l'affichage du type de projet est-il systématique, ou soumis à
> l'accord du client au moment où il dépose son avis ? La seconde option est plus prudente et ne coûte
> qu'une case à cocher. **Point ajouté à l'Annexe 1.**

> **Rappel `AVS-01`, inchangé :** le professionnel ne peut **ni supprimer, ni masquer, ni modifier** un
> avis le concernant. Seule l'administration de MEEREO intervient en cas de contenu frauduleux ou
> diffamatoire. La présente correction ne doit ouvrir **aucune** faculté de tri ou de masquage qui
> viderait cette règle de son sens.

> **Dépendances :** `AVS-01` (règle de fond sur les avis), `INS-03` (page publique), `ANN-01`/`ANN-02`
> (annuaire et recherche), `QAL-02` (principe de source unique), `PRJ-11` (la clôture déclenche l'avis).

> **Point non vérifié au 27/07/2026.** L'écran « Choix & validations » de l'espace client — seul
> endroit susceptible de montrer l'avis déposé — **n'a pas été transmis**. Il reste donc impossible de
> déterminer si l'avis existe en base et n'est qu'invisible sur la page publique, ou s'il n'a jamais
> été enregistré. **Ces deux hypothèses appellent des corrections très différentes** : dans le premier
> cas un simple affichage manque, dans le second c'est l'enregistrement de l'avis qui est en cause.
> **À trancher avant toute correction.**
> **🎨 RÉFÉRENCE VISUELLE FOURNIE (27/07/2026).** MEEREO a transmis la maquette attendue pour la
> section d'avis de la page publique. Éléments à reprendre :
>
> - **Titre de section** « **Avis & crédibilité** » et, aligné à droite, un lien **« N avis vérifiés →»**
>   donnant accès à la liste complète. *Le mot « vérifiés » n'est pas décoratif : il suppose que seul
>   un client ayant réellement contracté puisse déposer un avis — règle à confirmer dans `AVS-01`.*
> - **Trois avis en aperçu**, présentés en cartes de largeur égale.
> - Chaque carte : **notation en étoiles** *(pleines et vides, pas de demi-étoile)* · **citation en
>   italique** · puis, en pied de carte, **identité de l'auteur** — avatar, nom, et **qualité +
>   organisation** *(« Directeur · Groupe Ouattara Invest », « Promoteur immobilier · Abidjan »)*.
> - **La date de l'évaluation**, exigée par le présent point, **n'apparaît pas** sur la maquette. À
>   ajouter : un avis sans date ne permet pas de juger de sa fraîcheur, et trois avis excellents de
>   2019 ne valent pas trois avis de cette année.
>
> **L'avatar de l'auteur suit le contrat de `QAL-07`** — photo si elle existe, monogramme à défaut,
> forme et couleur déterminées par le composant unique, jamais par cet écran.
>
> **⚠️ La maquette affiche « 84 avis vérifiés » et des avis nominatifs sur un compte qui n'en a
> aucun.** C'est le contenu de démonstration dénoncé par `INS-17`. **Elle vaut comme référence de mise
> en forme, pas comme contenu.**
> **✅ TYPE DE PROJET — TRANCHÉ (27/07/2026) : affiché systématiquement.**
> Chaque avis publié indique le **type de projet réalisé**, sans condition.
>
> **Cohérence avec la décision prise le même jour sur `INS-21` :** le **type** est public dans les deux
> cas ; ce sont le **nom du client** et le **montant** qui restent soumis à accord. La règle est donc
> homogène — *on montre ce qui a été construit, pas pour qui ni pour combien*.
>
> **Ce que cela apporte :** un avis sans contexte est peu exploitable. *« Excellent travail »* sur une
> villa individuelle et sur un immeuble R+5 n'engagent ni les mêmes compétences ni les mêmes montants.
> **Le type de projet est ce qui permet à un futur client de juger si l'avis le concerne.**
>
> **⚠️ Risque résiduel accepté, consigné pour mémoire :** sur un marché où les chantiers sont peu
> nombreux, le croisement *type + date + professionnel* peut permettre d'identifier le maître
> d'ouvrage. **MEEREO a arbitré en faveur de l'utilité de l'information.** *Si le volume d'avis
> augmente, le risque se dilue de lui-même ; s'il reste faible, le point mérite d'être réexaminé.*

> **🔴 UNE TROISIÈME HYPOTHÈSE, PLUS SIMPLE, APPARAÎT (27/07/2026) — voir `AVS-07`.**
>
> Le point ci-dessus hésite entre deux explications : *l'avis n'est pas enregistré*, ou *il l'est mais
> n'est pas affiché*. **Le défaut relevé en `AVS-07` en ouvre une troisième qui les rendrait toutes
> deux sans objet : l'avis serait enregistré contre la mauvaise entité.**
>
> Le modal d'évaluation désigne comme prestataire **le client lui-même** au lieu de l'entreprise
> intervenante. **Si l'enregistrement suit ce que le modal affiche, l'avis est rattaché au client** —
> et il n'apparaît pas sur la page publique du professionnel pour la raison la plus simple qui soit :
> *il n'y a jamais été rattaché.*
>
> **Ce que cela change pour la correction :** il ne s'agirait plus d'ajouter une section d'affichage
> manquante, mais de **corriger le destinataire de l'écriture, puis de reprendre en base les avis déjà
> déposés**. **Cette vérification doit précéder tout développement sur le présent point** — construire
> la section d'affichage avant de savoir où les avis sont rattachés reviendrait à afficher une page
> qui restera vide.

---

## `AVS-05` — Coordonnées du client transmises au professionnel : base légale et périmètre
**Statut : À CORRIGER + RÈGLE** *(ajouté v1.38)*

**Constat signalé (27/07/2026).** Lorsqu'un client est créé dans le CRM du professionnel, **son adresse
e-mail et son téléphone y sont recopiés sans que le client en soit informé ni sollicité**. La fiche
observée affiche `jayemmmh@gmail.com` et `+225 0504440382`.

**Ce n'est pas un détail d'ergonomie.** La transmission des données personnelles d'un utilisateur à un
autre utilisateur constitue un **traitement au sens de la loi n° 2013-450**, qui exige une base légale
identifiée. Aujourd'hui, cette transmission est **automatique, silencieuse et non documentée**.

### 🔴 DÉCISION DE MEEREO (27/07/2026)

**Base légale retenue : l'exécution du contrat.** Le professionnel reçoit les coordonnées de son client
**uniquement à la signature d'un marché** — jamais avant.

**Ce que cela implique concrètement :**

- **Avant la signature**, le professionnel ne dispose d'**aucune coordonnée** du client. Les échanges
  passent par la messagerie MEEREO (`MSG-01`, `MSG-04`). Un client qui publie un appel d'offres ne
  livre pas son téléphone à tous les candidats.
- **À la signature**, les coordonnées sont transmises et le **client en est informé** — mention
  explicite au moment de l'attribution : *« En attribuant ce marché, vos coordonnées seront
  communiquées à l'entreprise retenue. »*
- **La finalité est bornée** : exécution du chantier et suites contractuelles. **Toute utilisation à
  des fins de prospection est exclue** et doit être rappelée au professionnel — voir aussi les CGV
  (Annexe 8/A8.4, article 9), qui font du professionnel un responsable de traitement pour ses propres
  finalités.

*Option écartée — le consentement explicite du client :* un refus rendrait le chantier impraticable, le
consentement serait donc **de façade**. Un consentement qu'on ne peut pas refuser n'en est pas un, et
il serait plus fragile juridiquement que la base contractuelle retenue.

### 🔴 DÉCISION — le bouton « Exporter » est supprimé

**Décision de MEEREO : retrait immédiat du bouton d'export** de la fiche Clients.

**Pourquoi c'est la bonne décision à ce stade.** Cet export permet aujourd'hui de **sortir une base de
contacts entière de la plateforme, sans laisser de trace** — y compris juste avant une suppression de
compte. Tant qu'aucune journalisation n'existe, MEEREO ne peut ni savoir ce qui est sorti, ni le
justifier en cas de contrôle de l'ARTCI.

**Ce qu'il faudra rétablir plus tard, et à quelles conditions.** Le besoin est légitime : un
professionnel a le droit d'exploiter son propre fichier clients. La réintroduction suppose alors :
**journalisation de chaque export** (auteur, date, volume), périmètre explicite, et mention rappelant
la finalité autorisée. *À traiter dans un second temps, pas en urgence.*

> **⚠️ Conséquence sur les textes juridiques.** La **politique de confidentialité** (Annexe 8/A8.5) ne
> mentionne **pas** cette transmission de données entre utilisateurs. Elle doit être complétée : c'est
> une communication de données personnelles à un tiers, et elle doit figurer dans la liste des
> destinataires. **À faire avant toute publication des textes.**

> **Défaut d'affichage relevé sur la même fiche :** la ligne de contact affiche un **séparateur
> orphelin** (« · » suivi de rien), et le compteur indique « **Projets lies** » sans accent. Voir
> `QAL-04`.

> **Dépendances :** `AVS-03` (données de compte), `MSG-01`/`MSG-04` (échanges avant marché),
> `AOF-01` (attribution), `SYS-06` (Paramètres), Annexe 8/A8.5 (politique de confidentialité —
> **à compléter**), Annexe 8/A8.4 art. 9 (le professionnel devient responsable de traitement).

> **✅ Réintroduction de l'export précisée par défaut (27/07/2026).** Ce n'est pas un arbitrage mais un
> **prérequis technique** : l'export peut revenir dès lors que **chaque opération est journalisée**
> — auteur, date, volume, périmètre. Tant que cette journalisation n'existe pas, le bouton reste
> retiré. *Aucune décision produit n'est requise ; c'est une condition, pas un choix.*
---

## `AVS-06` — Fiche client du CRM : nature, édition et cycle de vie
**Statut : À CORRIGER — MAJEUR + RÈGLE** *(ajouté v1.39)*

### Constat : l'édition d'une fiche client détruit l'enregistrement

**Signalé le 27/07/2026.** En modifiant une fiche client et en changeant son type, la fiche
« disparaît et réapparaît », et le type revient à sa valeur par défaut.

**La capture montre pire que cela : la fiche a disparu du CRM.** L'écran Clients affiche
« **0 clients · 0 actifs** », « CRM — 0 clients » et « **Aucun client enregistré** ».

**Et le compteur « Projets liés » affiche toujours 1.** Il subsiste donc une **référence orpheline** :
un projet rattaché à un client qui n'existe plus. **C'est une perte de données, pas un défaut
d'affichage.**

### Hypothèse la plus probable — à vérifier en premier

**La fiche CRM n'est peut-être pas un enregistrement possédé par le professionnel, mais une projection
de la relation issue du marché.** L'éditer romprait la projection : la fiche cesserait d'être produite,
tandis que le compteur de projets, alimenté depuis le marché, continuerait d'afficher 1.

**Ce que cette hypothèse expliquerait d'un coup :** la disparition, la persistance du compteur, et le
retour du type à sa valeur par défaut — puisqu'une projection recalculée repart de zéro.

*Piste alternative à écarter ensuite :* une interface optimiste qui retire l'élément avant confirmation,
suivie d'un échec d'enregistrement silencieux côté serveur.

### 🔴 DÉCISIONS DE MEEREO (27/07/2026)

**1. La fiche est possédée par le professionnel, et liée au compte MEEREO du client.**

Le professionnel possède sa fiche et l'enrichit librement : **type**, **poste**, **statut**, notes.
En revanche, lorsque le client est un utilisateur MEEREO, les **champs d'identité** — nom, e-mail,
téléphone — sont **affichés en lecture seule**, depuis la source MEEREO.

*Pourquoi cette séparation :* si le professionnel pouvait modifier l'e-mail de son client, sa fiche et
le compte réel **divergeraient silencieusement**. Il croirait joindre son client à une adresse qu'il a
lui-même modifiée. **Le professionnel complète, il ne recopie pas** — c'est le principe de source
unique de `QAL-02` appliqué au CRM.

**2. La création manuelle de prospects est autorisée, avec rappel de responsabilité.**

Un CRM sans prospects n'est pas un CRM. Mais le professionnel saisit alors les données d'un **tiers qui
n'a jamais consenti à figurer sur MEEREO**.

**Mention obligatoire à la création** : rappel bref indiquant qu'il devient **responsable de ce
traitement** au sens de la loi n° 2013-450, et que ces données ne peuvent servir qu'à sa relation
commerciale. *Une ligne suffit ; son absence, en revanche, laisse MEEREO héberger des données de
personnes qui ignorent totalement leur présence sur la plateforme.*

**3. Suppression du compte MEEREO par le client : coordonnées purgées, historique conservé.**

E-mail et téléphone sont **retirés** de la fiche CRM du professionnel. Le **nom**, les **projets** et
les **montants** sont **conservés**.

*Équilibre retenu :* le retrait du client est respecté sur ce qui permet de le joindre, sans effacer la
mémoire de chantiers réellement exécutés ni les éléments nécessaires aux obligations comptables.
Complète `AVS-03`, qui traitait la non-réassociation des données mais **ne disait rien du CRM des
professionnels**.

**4. La suppression d'une fiche rattachée à un projet est autorisée, après avertissement.**

> **⚠️ Contrepartie indispensable, sans laquelle cette décision reproduit le défaut constaté.**
> Autoriser la suppression **impose** de décider ce que devient la référence côté projet. À défaut,
> l'état exact de la capture se reproduira : un projet rattaché à un client inexistant.
>
> **Règle à poser :** le projet conserve un **instantané immuable de l'identité du client** — au
> minimum son nom au moment de la signature du marché. Cet instantané **n'est pas une référence** vers
> la fiche : il ne peut donc pas devenir orphelin. La fiche supprimée disparaît du CRM ; le projet
> continue d'afficher « Client : Jayem Troh », sans lien cliquable.
>
> **L'avertissement doit être précis**, pas générique : *« Ce client est rattaché à 1 projet. Sa fiche
> sera supprimée de votre CRM ; le projet conservera son nom mais vous perdrez ses coordonnées. »*
> Un avertissement qui n'énonce pas la conséquence exacte ne permet pas de décider en connaissance de
> cause.

### Deux observations complémentaires

**Le type a une valeur par défaut : « Promoteur ».** Pour un particulier menant un projet familial,
c'est faux — et c'est exactement le mécanisme dénoncé par `INS-16` : une valeur pré-sélectionnée que
personne n'a choisie devient une donnée fausse, silencieusement. **Aucune valeur par défaut** ; l'état
« non renseigné » doit être représentable.

**Typologie observée, à consigner comme référence** : *Promoteur · Particulier · SCI · Collectivité ·
État · Entreprise*. Elle est pertinente pour la maîtrise d'ouvrage ivoirienne et mérite d'être une
**source unique**, réutilisable ailleurs (statistiques, filtres, ciblage d'appels d'offres).

> **Dépendances :** `AVS-03` (suppression de compte — **complété**), `AVS-05` (transmission des
> coordonnées), `QAL-02` (source unique), `INS-16` (aucune valeur par défaut), `PRJ-01` (rattachement
> du projet), Annexe 8/A8.5 (politique de confidentialité — **à compléter pour les prospects**).

> **✅ Instantané d'identité précisé par défaut (27/07/2026).** Le projet fige, **au moment de la
> signature du marché** : le **nom** du client et sa **qualité** *(particulier, promoteur, SCI…)*.
> Ni e-mail, ni téléphone — ce sont des coordonnées, pas une identité, et elles doivent rester
> purgeables (`AVS-03`).
> **Pourquoi à la signature et non à la suppression :** c'est le moment où la relation devient
> contractuelle. Figer plus tard reviendrait à enregistrer un nom peut-être déjà modifié.
---

## `AVS-07` — Évaluation de fin de projet : destinataire, composition de la note et fenêtre de dépôt
**Statut : À CORRIGER + RÈGLE** *(ajouté v1.49)*

**Constat (27/07/2026, espace Client, projet « PROJET FAMILLE » à 100 %).** Le modal **« Évaluer le
prestataire »** présente la carte suivante :

| Ce que le modal affiche | Ce que la même page affiche | Ce qui est vrai |
|---|---|---|
| **Jayem Troh** — *Prestataire du projet* | **Intervenants du projet : MILLENIUM CONSTRUCTION** *(entreprise)* | Jayem Troh est le **client**, seul intervenant : MILLENIUM CONSTRUCTION |

**Le modal lit la mauvaise entité : ni l'identité ni le rôle ne correspondent.** Le client se voit
proposer de **s'évaluer lui-même**, sur les quatre critères et le commentaire destinés au
professionnel. La mention de bas de modal — *« Votre avis sera visible sur le profil public du
prestataire et contribuera à son score de satisfaction »* — **désigne alors le profil du client**.

### 🔴 Hypothèse prioritaire : ce défaut expliquerait peut-être `AVS-04`

`AVS-04` constate que les avis de fin de projet sont **enregistrés mais n'apparaissent jamais** sur la
page publique du professionnel, et laisse ouvertes deux explications *(l'avis n'est pas enregistré / il
l'est mais n'est pas affiché)*.

> **Une troisième explication apparaît, et elle rend les deux premières inutiles : l'avis est
> enregistré, mais contre la mauvaise entité.** S'il est rattaché au client au lieu du professionnel,
> il n'apparaît pas sur la page de MILLENIUM CONSTRUCTION **pour la raison la plus simple qui soit —
> il n'y a jamais été rattaché.** Ce ne serait pas un défaut d'affichage, mais un défaut de
> destinataire, et **une seule correction réglerait les deux points**.

**Vérification à conduire avant toute correction — elle décide de l'ampleur du chantier :**

| Si… | Alors |
|---|---|
| Seul le **libellé** est erroné, l'écriture visant la bonne entité | Correction d'affichage. Les avis déjà déposés sont sains. |
| L'**écriture** vise aussi la mauvaise entité | Des avis de production sont rattachés à de **mauvais profils**. Correction du code **et reprise des données en base**. |

**Ce qu'il faut regarder n'est pas le nom affiché, mais l'identifiant de l'entité qui reçoit
l'enregistrement.** Une capture d'écran ne permet pas de trancher ; seule la base le permet.

### Cause vraisemblable, à confirmer

Le modal affiche l'**utilisateur connecté** là où il devrait afficher l'intervenant du projet — et le
monogramme « JA » le confirme, il est construit sur *Jayem*. **L'origine la plus probable est une
valeur par défaut** : le composant reçoit un paramètre vide *(l'intervenant n'est pas résolu)* et
retombe sur la session courante, au lieu d'échouer visiblement.

> **Règle de fond à retenir au-delà de ce cas.** Une donnée d'identité **manquante ne doit jamais être
> remplacée par l'utilisateur connecté**. Ce repli est particulièrement traître : il produit un écran
> **plausible** — un nom réel, un avatar correct, aucune erreur — là où une valeur absente aurait été
> vue immédiatement. **Mieux vaut un écran qui refuse de s'afficher qu'un écran qui affiche autre
> chose.** C'est le même principe que `INS-06` et `PRJ-11` : l'affichage est **dérivé** de la donnée,
> jamais suppléé localement.

### ✅ Décisions du 27/07/2026

**1. Destinataire de l'avis — l'entreprise titulaire du marché, elle seule.**

Le client évalue **le professionnel avec lequel il a contracté**. Les sous-traitants, architectes ou
bureaux d'études intervenant sous la responsabilité du titulaire **ne sont pas évalués par le client**.

> **Cette décision ne prive pas les sous-traitants de réputation — elle la fait passer par le bon
> canal.** L'**évaluation croisée** déjà prévue par `AVS-01` permet au titulaire d'évaluer les
> intervenants qu'il a lui-même engagés. **La notation suit ainsi exactement la chaîne
> contractuelle :** le client note le titulaire, le titulaire note ses sous-traitants. *Chacun est
> évalué par celui qui a réellement subi ou apprécié sa prestation, et par personne d'autre.*

**2. Note globale — calculée, jamais saisie.**

La **Note globale** est la **moyenne des critères d'évaluation**, affichée en **lecture seule** et mise
à jour à mesure que le client renseigne les critères. **La ligne « Note globale » du modal actuel, qui
propose cinq étoiles cliquables, doit être remplacée par un affichage non éditable.**

> **Ce que cette règle interdit mécaniquement :** un avis portant *5/5* en note globale et *2/5* sur
> chacun des critères. Le cas n'est pas théorique — il se produit dès qu'un utilisateur clique la
> note globale en premier puis affine, ou l'inverse. **Un avis qui se contredit lui-même n'est
> exploitable ni par le futur client, ni par le calcul de moyenne de `AVS-04`.**

> **⚠️ Conséquence à traiter obligatoirement : la liste des critères doit être arrêtée.** On ne peut
> pas dériver une note d'un ensemble non défini. Or `AVS-01` énonce *« délais, qualité, communication,
> professionnalisme… »* — **quatre critères et des points de suspension** — tandis que la production
> en affiche **trois** : *Qualité du travail · Respect des délais · Communication & suivi*.
> **`professionnalisme` a disparu et la liste reste ouverte.** *(voir « Points à trancher » ci-dessous)*

**3. Sens de l'évaluation — unilatéral, du client vers le professionnel.**

**Le professionnel n'évalue pas le client.** Aucune note, aucun commentaire, aucun historique
d'appréciation sur les maîtres d'ouvrage.

> **Ce que ce choix protège :** la **franchise du client**. Là où la réciprocité existe, un client
> hésite à signaler un défaut par crainte d'une note de représailles — et **les avis deviennent
> uniformément élogieux, donc sans valeur.** Le choix protège aussi MEEREO d'un traitement de données
> nettement plus sensible : noter des **personnes** ne relève pas du même régime que noter des
> **entreprises** *(loi n° 2013-450, déclaration ARTCI — voir Annexe 8)*.

> **⚠️ Contrepartie assumée : le professionnel n'a aucun moyen de signaler un mauvais payeur.** Ce
> besoin est réel et il faudra bien y répondre un jour — **mais par un signalement traité par MEEREO,
> pas par une note publique.** *À ne pas confondre avec l'évaluation croisée entre professionnels de
> `AVS-01`, qui reste en vigueur : elle vise des entreprises, pas des clients.*

**4. Fenêtre de dépôt — relance, puis fermeture à 30 jours.**

Le bouton **« Plus tard »** reporte l'invitation sans l'annuler :

| Échéance | Événement |
|---|---|
| Clôture | Invitation à évaluer |
| **J+7** puis **J+21** | Relance |
| **J+30** | **Fermeture définitive** — l'avis n'est plus déposable |

> **Ce que la fermeture garantit :** des avis **récents et rattachables à un chantier dont le client se
> souvient**. Sans limite, un avis peut être déposé deux ans après la réception, sur des faits
> reconstitués — et il pèsera pourtant du même poids qu'un avis rendu à chaud.

> **⚠️ Un avis perdu par oubli est perdu définitivement.** C'est le coût de la règle. Il rend les deux
> relances **indispensables et non optionnelles** : elles sont le seul rattrapage prévu. *La date de
> fermeture doit être visible dans le modal et rappelée dans les relances — « vous pouvez déposer votre
> avis jusqu'au JJ/MM » —, faute de quoi le client découvrira la fermeture en la subissant.*

### Effets sur le modal, à reprendre point par point

| Élément actuel | Correction |
|---|---|
| Carte « Jayem Troh — Prestataire du projet » | **Intervenant titulaire du projet**, résolu depuis le projet |
| Avatar « JA » sur carré noir | Composant unique de `QAL-07` — **pas de rendu local** |
| « Note globale » — 5 étoiles cliquables | **Affichage dérivé, non éditable** |
| Aucune échéance affichée | **Date de fermeture** de la fenêtre de dépôt |
| Terme « **Prestataire** » | *voir « Points à trancher »* |

### Points à trancher

| Point | Enjeu |
|---|---|
| **Liste des critères, arrêtée** | La note globale en dérive. `professionnalisme` est-il réintégré ? La liste est-elle close ? |
| **Moyenne simple ou pondérée** | Si la qualité pèse plus que la communication, le dire. `AVS-04` pose déjà la question pour la moyenne inter-avis. |
| **Arrondi de la note globale** | Même arrondi partout, sinon deux écrans afficheront 4,3 et 4,4 *(`AVS-04`)*. |
| **Modification par l'auteur** | `AVS-01` interdit au professionnel de toucher un avis, mais ne dit rien du **client**. Un délai de rétractation court est courant ; l'absence totale de correction possible expose à un avis déposé par erreur. |
| **Lexique** | La plateforme dit **Prestataire** *(modal)*, **Intervenant** *(section projet)*, **Entreprise** *(fiche)* et **Professionnel** *(annuaire)* pour la même entité. Un terme, un seul. |

> **Dépendances :** `AVS-01` (règle de fond, évaluation croisée) · `AVS-04` (publication et moyenne —
> **hypothèse commune ci-dessus**) · `PRJ-11` (la clôture déclenche l'avis) · `QAL-07` (avatar) ·
> `SYS-02` (droits) · Annexe 8 (traitement des données personnelles).


> **✅ QUATRE POINTS TRANCHÉS (27/07/2026) — le présent code n'a plus de point ouvert.**
>
> | Point | Décision |
> |---|---|
> | **Critères** | **Quatre** : Qualité du travail · Respect des délais · Communication & suivi · **Professionnalisme** |
> | **Pondération** | **Poids égal** — 25 % chacun |
> | **Arrondi** | *Réglé par défaut :* **une décimale**, arrondi arithmétique, appliqué à l'identique partout *(`AVS-04`)* |
> | **Modification par l'auteur** | **Jamais.** Seule l'administration MEEREO intervient |
> | **Lexique** | **Deux notions, pas un mot unique** — voir **`QAL-08`** |
>
> **⚠️ La production doit être modifiée : elle n'affiche que trois critères.** Le quatrième,
> *Professionnalisme*, est à ajouter au modal. **Les avis déjà déposés n'ont que trois critères** — leur
> reprise doit être décidée *(recalcul sur trois, ou marquage comme antérieurs au changement)*.
>
> **⚠️ Réserve maintenue, arbitrée en connaissance de cause.** *Communication & suivi* et
> *Professionnalisme* se recouvrent largement : à poids égal, **la moitié de la note globale porte sur
> le relationnel**, contre un quart pour la qualité technique et un quart pour les délais. **MEEREO a
> tranché en faveur des quatre critères à poids égal.** *Si les notes se révèlent peu discriminantes,
> c'est le premier réglage à revoir.*
>
> ### 🔴 Contrepartie obligatoire de l'avis définitif
>
> **Un avis qui ne peut jamais être corrigé ne peut pas être envoyé sans confirmation.** La règle
> retenue est saine, mais elle rend une erreur de saisie **irréversible** — une étoile cliquée de
> travers reste en ligne pour toujours et pèse sur la note publique d'une entreprise.
>
> **À implémenter obligatoirement avec la règle, non séparément :**
>
> - un **écran de confirmation** avant envoi, rappelant la note et le commentaire ;
> - une **mention explicite** : *« Votre avis sera définitif et ne pourra plus être modifié »* ;
> - le bouton **« Envoyer mon avis » reste inactif tant que les quatre critères ne sont pas
>   renseignés** — la note globale ne peut pas être calculée sur une moyenne partielle *(patron de
>   `INS-06` : l'état du bouton est dérivé, jamais posé)*.
>
> *Sans cette confirmation, la règle « jamais modifiable » ne protège pas l'intégrité des avis :
> elle fabrique des avis erronés définitifs.*


> **✅ AVIS ANTÉRIEURS AU QUATRIÈME CRITÈRE (27/07/2026) : conservés, moyenne calculée sur trois.**
> Chaque avis conserve **les critères avec lesquels il a été déposé**. Aucun n'est supprimé, aucun n'est
> complété rétroactivement.
>
> **Motif :** on ne fabrique pas une note de *Professionnalisme* que le client n'a jamais donnée.
> **Toute autre option supposerait d'inventer une donnée ou de détruire une réputation acquise.**
>
> **⚠️ Ce que le développeur doit en tirer, et qui n'est pas évident :** deux avis coexistent avec des
> bases de calcul différentes. **La moyenne d'un avis doit donc être calculée sur ses propres critères
> renseignés — jamais sur un dénominateur fixe de quatre.** *Un avis ancien divisé par quatre au lieu de
> trois verrait sa note amputée d'un quart, en silence.*

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

**Visible impérativement dans :** projets du client, appels d'offres, résultats de recherche, annuaire, conversations/messagerie (entreprise identifiée), fiches pro, notifications, **toute** section où une entreprise apparaît — **y compris, côté Fournisseur, la Marketplace : fiche produit, page boutique du vendeur, résultats de recherche Marketplace** (voir précision de portée ci-dessous, 25/07/2026).

**Absence de logo :** même **placeholder unique** partout (initiales / icône générique), jamais d'image cassée.

> **Cohérence architecturale :** même principe de **source unique centralisée** que `AVS-01` (avis) et `INS-04` (statut vérifié). Ces trois données — logo, avis, badge — proviennent d'un **référentiel unique** attaché au profil professionnel.
> **Complément technique (v1.27) :** hypothèses de cause (récupération indépendante par composant, copie dénormalisée obsolète, cache non invalidé) et protocole de vérification en **Annexe 3, section A3.3**.
>
> **Précision de portée (25/07/2026), suite à la revue du prototype `meereo_parcours_complet.html` :** le prototype confirme que **les rôles Professionnel et Fournisseur possèdent chacun leur propre logo unique** capté à l'inscription (écrans `p-logo` et `f-logo`, tous deux conformes à `INS-02`). Le libellé « profil professionnel » utilisé ci-dessus doit donc être lu comme **couvrant les deux rôles à profil d'entreprise (Professionnel et Fournisseur)**, et non le seul rôle nommé « Professionnel » — cette formulation était ambiguë dans un référentiel qui, partout ailleurs, distingue strictement les deux rôles. **Écart constaté à corriger :** ni `MKT-01` (catalogue produits) ni `MKT-03` (espace fournisseur) ne référençaient jusqu'ici `QAL-02` ni n'exigeaient explicitement l'affichage du logo fournisseur sur la Marketplace — ajouté ci-dessus et en dépendances de `MKT-01`/`MKT-03`. C'est la même famille de cause que celle déjà identifiée pour `ANN-02`/`MSG-02`/`NAV-04` : un principe transverse qui n'avait pas été propagé jusqu'à un domaine (Marketplace) ajouté plus tard au référentiel.
>
> **Photo de profil du Client — statut différent, ne pas confondre.** Contrairement au logo Pro/Fournisseur, **le Client n'a, à ce jour, aucun champ « photo de profil » dans son parcours d'inscription** (confirmé par la lecture du code du prototype, écran `s-account` — voir Annexe 1, point rouvert v1.28). La mention historique « photo de profil optionnelle » du journal v1.2 décrivait une intention non retrouvée dans le code livré. **Tant que ce champ n'existe pas, il n'y a rien à propager pour le Client** : la question de savoir *où* afficher une photo de client (conversations, avis laissés, équipe si mentionné) ne peut être tranchée qu'**après** la décision sur son existence même. Voir Annexe 1 pour la question complète, élargie à cette sous-question de propagation.

> **⚠️ CONSTAT DE FOND (27/07/2026) — cette règle est juste, et elle n'a jamais suffi.**
> MEEREO signale que le problème du logo **persiste malgré plusieurs tentatives de correction**.
> L'audit d'affichage confirme le constat et en donne la raison : **une seule entreprise apparaît
> aujourd'hui sous DIX représentations distinctes** — logo réel dans 3 emplacements, monogrammes dans
> 7, en **trois couleurs** et **deux formes**, avec **deux règles d'initiales** différentes.
>
> **Le présent point traite la DONNÉE ; le défaut est dans le RENDU.** Dix écrans peuvent lire la même
> source et l'afficher de dix façons. Tant qu'aucun **composant unique** ne rend l'identité visuelle,
> chaque écran continuera de composer la sienne — et **chaque nouvel écran reproduira le problème**.
>
> **C'est précisément pourquoi les corrections précédentes n'ont pas tenu :** elles ont été menées
> écran par écran, sur la source, jamais sur le composant. **Voir `QAL-07`**, qui pose le contrat de
> rendu, l'inventaire complet des emplacements et le critère de recette.
---

## `QAL-03` — Correction orthographique et grammaticale
**Statut : À CORRIGER**

Correction linguistique complète des textes visibles : libellés d'interface ; messages d'erreur/système ; notifications (in-app, email, SMS) ; popups et confirmations ; contenus générés par l'IA ; emails transactionnels ; contenus statiques (légal, CGU, aide, FAQ) ; pages publiques générées.

Couvre orthographe, grammaire, conjugaison, ponctuation et **cohérence terminologique** (mêmes termes pour mêmes concepts). Relecture systématique recommandée (CI ou relecture avant mise en production).

> **Note :** la liste précise des fautes (captures, pages, champs) sera fournie séparément par MEEREO.

> **Complément (27/07/2026) :** trois défauts d'affichage relevés en production relèvent en apparence
> de ce point, mais sont d'origine **technique** et non rédactionnelle — flèche « → » rendue « à »,
> absence totale d'accents sur la page publique, filtres dupliqués. **Les corriger à la main serait
> inefficace** : la cause est vraisemblablement un utilitaire de formatage partagé. Voir **`QAL-04`**.
---

## `QAL-04` — Défauts d'affichage transverses
**Statut : À CORRIGER** *(ajouté v1.34)*

Trois défauts relevés sur les captures du 27/07/2026, non signalés, chacun présent sur **plusieurs
écrans** — ce qui indique une origine partagée plutôt que des cas isolés.

### 1. Le caractère « → » est rendu « à » dans toute l'interface

Relevé sur **au moins six écrans distincts** :

| Écran | Texte affiché | Texte attendu |
|---|---|---|
| Finance | « Budgets **à** Dépenses **à** Factures **à** Rapports » | Budgets → Dépenses → Factures → Rapports |
| Marchés | « 1 contrats **à** Pipeline des missions » | 1 contrat → Pipeline des missions |
| Suivi chantier | « PROJET FAMILLE **à** Réception **à** 100% » | PROJET FAMILLE → Réception → 100 % |
| Offres | « 1 offres envoyées **à** 0 en attente **à** 1 acceptées » | … → … → … |
| Documents | « 0 documents **à** 0 nouveaux » | 0 document → 0 nouveau |
| Offres (fiche) | « 0 projets **à** Aucune certification » | 0 projet → Aucune certification |

**Deux causes possibles, à départager :** un problème d'**encodage** à la construction ou au stockage
des chaînes ; ou une fonction de **normalisation de caractères** — du type retrait d'accents ou
translittération — appliquée par erreur à des chaînes d'affichage alors qu'elle est destinée aux
identifiants d'URL.

**La seconde hypothèse est la plus probable** : le défaut n'apparaît **que** sur des séparateurs, dans
des composants différents, ce qui pointe vers un **utilitaire de formatage partagé** plutôt que vers un
fichier mal encodé. *Vérification : rechercher toute fonction de normalisation appliquée aux libellés
d'en-tête, et l'y retirer.*

### 2. Accents absents

- **Toute la page publique** est dépourvue d'accents : « batiments », « a vivre », « durables a
  entretenir », « premier trait a la reception », « Cote d'Ivoire », « Agence fondee », « econome »,
  « documentee », « Rigueur, sobriete, tracabilite ». **Aucun accent sur la page entière** — ce n'est
  pas une faute de frappe, c'est un traitement systématique, vraisemblablement la même cause qu'au
  point 1.
- Ailleurs, ponctuellement : « 1 **Termines** » (Projets), « 1 **Projets lies** » (Clients).

**Enjeu :** une vitrine professionnelle sans accents fait négligé et **dévalorise l'entreprise
présentée**. C'est précisément la page destinée à être partagée à des prospects.

### 3. Filtres de la liste de projets dupliqués

L'écran **Projets** affiche la barre de filtres suivante :

> Tous · **Conception** · **Conception** · **Conception** · **Préparation** · **Préparation** ·
> **Préparation** · Gros Œuvre · Réception

« Conception » apparaît **trois fois**, « Préparation » **trois fois**, pour un unique projet.

**Cause probable :** la liste des filtres est construite à partir des **phases de tous les projets**
sans **déduplication** — chaque phase produit une entrée, y compris lorsque plusieurs partagent le même
libellé.

**Attendu :** la liste des filtres est **dédupliquée** et présentée dans l'ordre du cycle de mission.
Un filtre qui n'apparaît qu'une fois par valeur distincte est une exigence élémentaire de lisibilité.

> **Dépendances :** `QAL-03` (correction linguistique — ces points en relèvent, mais ils sont d'origine
> **technique** et non rédactionnelle : les corriger à la main serait inefficace), `INS-17` (page
> publique), `SYS-04` (multilingue : un utilitaire de normalisation mal placé affecterait aussi la
> version anglaise).

> **✅ CONFIRMÉ CÔTÉ CLIENT (27/07/2026) — les trois défauts sont partagés par les deux espaces.**
> Les filtres dupliqués (« Conception » ×3, « Préparation » ×3) et la flèche rendue « **à** »
> apparaissent **à l'identique** dans l'espace client. **Ce ne sont donc pas des défauts du cockpit
> professionnel mais de composants partagés** — une correction unique traitera les deux espaces.
>
> **Quatre occurrences supplémentaires relevées :**
>
> | Écran | Affiché | Attendu |
> |---|---|---|
> | Mes projets (client) | « MILLENIUM CONSTRUCTION **à** — » | « MILLENIUM CONSTRUCTION → — » |
> | Mes demandes | « Publie le 26/07/2026 **à** Visible par les… » | « Publié le … → Visible par… » |
> | Accueil (client) | « Équipe — **1 intervenants** » | « 1 intervenant » — accord du pluriel |
> | Accueil (client) | « Architecte & Design **·** » *(séparateur orphelin, rien après)* | masquer le séparateur si la valeur est vide |
> | Paramètres | « Parametres », « Prenom », « Telephone » | Paramètres, Prénom, Téléphone |
>
> **Le séparateur orphelin est un cas distinct des trois autres** : il ne relève pas de l'encodage mais
> d'un gabarit qui concatène un séparateur sans vérifier que la valeur suivante existe. Défaut fréquent,
> à traiter par une règle générale : **un séparateur n'est rendu que si les deux valeurs qu'il sépare
> sont présentes.**
> **🔄 DIAGNOSTIC CORRIGÉ (27/07/2026) — mon hypothèse initiale était fausse.**
> J'avais supposé que la substitution de caractères venait d'un **utilitaire de normalisation appliqué
> aux libellés**. **C'est à écarter.**
>
> **Nouvelle observation décisive :** le bouton de fermeture de la modale « Modifier — client » affiche
> « **À** » au lieu de « **×** ». **Une icône de fermeture ne transite par aucun formateur de texte.**
>
> **Ce que cela change :** le défaut touche **au moins deux caractères non-ASCII distincts**, tous deux
> transformés en lettres accentuées :
>
> | Caractère attendu | Affiché | Où |
> |---|---|---|
> | `→` *(flèche)* | **à** | 6 écrans, dans les fils d'ariane et séparateurs |
> | `×` *(croix de fermeture)* | **À** | Modale d'édition client |
>
> **Il s'agit donc d'un problème d'encodage, pas de formatage** — au niveau des fichiers source, de la
> chaîne de construction, ou de l'en-tête de réponse HTTP. **Ce n'est pas une correction à faire écran
> par écran :** une seule cause explique toutes les occurrences, y compris l'absence totale d'accents
> sur la page publique (`INS-17`).
>
> **Deux pistes à examiner dans cet ordre :** l'encodage déclaré des fichiers source et de la sortie de
> build *(doit être UTF-8 de bout en bout)* ; puis l'en-tête `Content-Type` servi par le serveur
> *(`charset=utf-8` explicite)*. **Un test suffit à trancher :** afficher volontairement « é → × ° » sur
> une page de test.
---

## `QAL-05` — Animations KAi non fonctionnelles & état « attention » non conforme
**Statut : À CORRIGER** *(ajouté v1.40)*

**Constat signalé (27/07/2026).** Aucune animation de KAi ne fonctionne — ni celles liées à l'arrivée
d'un message, ni les autres. Le référentiel `KAi-specification-fonctionnement.md` décrit pourtant un
système complet : deux catégories d'animation (§11), trois micro-gestes idle (§12) et **six séquences
événementielles au timing exact** (§15).

### 🎯 Hypothèse prioritaire — une cause unique, testable en trente secondes

**`prefers-reduced-motion` désactivant tout.** La section 16 de la spécification KAi demande — à juste
titre — de respecter ce réglage d'accessibilité. **L'implémentation la plus courante de cette exigence
est une règle globale** du type :

```css
@media (prefers-reduced-motion: reduce) { * { animation: none !important } }
```

**Si le réglage « Réduire les animations » est activé au niveau du système d'exploitation, cette seule
règle éteint TOUT** — ambiant, idle et événementiel — sur toute l'application.

**Cela expliquerait exactement le symptôme rapporté :** non pas « telle animation est cassée », mais
« **aucune** animation ne marche ». *Quand tout est éteint d'un coup, chercher une cause unique avant
d'auditer chaque animation.*

**Vérification :** macOS → Réglages Système → Accessibilité → Affichage → **Réduire les animations**.
Windows → Paramètres → Accessibilité → Effets visuels → **Effets d'animation**. Tester ensuite sur un
appareil où le réglage est désactivé.

**Si cette hypothèse se confirme, la correction n'est pas de retirer le support de
`prefers-reduced-motion`** — c'est une exigence d'accessibilité légitime. La spécification indique
d'ailleurs la nuance à appliquer : *« les animations événementielles fonctionnelles (confirmation
d'action) peuvent être conservées sous forme de changement d'état instantané »*. **Réduire n'est pas
supprimer** : une confirmation d'action doit rester perceptible, même sans mouvement.

### Autres causes à examiner, dans cet ordre

1. **Le planificateur de gestes idle ne démarre pas** (§15, logique JS de référence). Il tire un
   intervalle aléatoire entre 2,6 et 6,8 s ; s'il n'est jamais initialisé, l'avatar respire sans jamais
   exécuter de nod, glance ni blink.
2. **Les classes d'animation ne sont pas posées.** Les séquences événementielles reposent sur l'ajout
   d'une classe au bon moment. Si l'événement métier (arrivée de message) ne déclenche pas cet ajout,
   la CSS est correcte mais jamais activée.
3. **Conflit de propriété `transform`.** La spécification §12 avertit explicitement : le geste *nod*
   doit porter sur un **élément wrapper distinct** de celui qui porte la respiration. Deux animations
   CSS sur la même propriété `transform` du même élément : la seconde écrase la première, l'une des
   deux paraît morte.

### ⚠️ Écart de conformité constaté sur l'état « attention »

Sur les captures de l'espace client, la pastille KAi porte un **badge rouge avec un point
d'exclamation**. La spécification §10.2 décrit tout autre chose : *« un **anneau violet** qui s'étend en
continu autour de l'avatar (`kai-ping`), **en plus** du point vert »* — les deux signaux devant
coexister : disponible **et** a quelque chose à signaler.

**Ce n'est pas un détail esthétique, c'est une inversion de sens.** Le rouge signifie erreur ou alerte ;
KAi ne signale pas un problème, il propose une recommandation. Et le violet est, dans ce design system,
**la couleur d'identité de KAi** — l'utiliser ici relie visuellement le signal à son émetteur, ce que le
rouge ne fait pas.

**Point positif à conserver :** la **bulle de suggestion proactive** (§10.5) est bien implémentée —
message court, bouton de fermeture, bouton d'action unique (« Résumé projet »). Le gabarit est
conforme. **Reste à vérifier le retour visuel au clic** : icône devenant une coche verte, puis retour à
l'état initial après 1,6 s (§15).

### Ce qui reste à vérifier hors captures

Les états **10.3 (indicateur de réflexion)**, **10.4 (arrivée de message)**, **10.6 (panneau étendu)**
et **10.7 (cartes d'événement produit)** n'apparaissent sur aucune capture. **Leur implémentation n'est
ni confirmée ni infirmée.**

> **Dépendances :** `KAi-specification-fonctionnement.md` §10 à §12 et §15 à §16, `QAL-01` (qualité
> générale), `QAL-04` (défauts d'affichage — cause distincte, ne pas confondre).

---

## `QAL-06` — Retouches d'interface : huit ajustements
**Statut : À CORRIGER — PRIORITÉ 3** *(ajouté v1.41)*

> **🔴 SÉQUENCEMENT DÉCIDÉ PAR MEEREO (27/07/2026) : après les points bloquants et majeurs.**
> On corrige d'abord ce qui empêche d'utiliser la plateforme — `AOF-05` (plantage), `FIN-04` (chaîne
> financière), `PRJ-12` (équipe), `INS-17` (page publique de démonstration). **Une interface soignée
> posée sur des données fausses reste inutilisable.** Ce point est consigné pour ne pas se perdre, pas
> pour passer devant.

**Origine.** Revue de l'interface à partir des captures des espaces Client et Professionnel
(27/07/2026), suivie de huit arbitrages.

> **⚠️ Limite de méthode, à ne pas oublier en lisant ce qui suit.** Cette revue s'appuie sur des
> **captures fixes**. Le mouvement, les états de survol et de focus, les temps de chargement et le
> comportement responsive **n'ont pas pu être évalués**. **La section Fournisseur n'a pas été
> observée.** Les constats portent sur la composition, la hiérarchie et la cohérence — pas sur le
> ressenti en usage réel.


### 1. Fusion des deux portes financières — le plus structurant

**Constat.** Deux modules financiers aux noms qui se recouvrent :

| Module | Portée | Contenu | Accès |
|---|---|---|---|
| **Budget** *(menu, section OPÉRATION)* | Un projet | Montant contractuel, reçu, en cours, « Mes contrats » | Entrée de menu |
| **Finance** / Centre Financier | L'entreprise | Budgets · Dépenses · Factures · Rapports | **Aucune entrée de menu** |

**Constat aggravant : « Finance » est introuvable.** On n'y accède que par le bouton « Voir la
finance » de la timeline financière d'un projet. Un module entier n'existe donc pas dans la navigation.

**🔴 Décisions :**

- **Fusionner en un seul module.**
- **Organisé par projet d'abord** : on choisit un chantier, on voit son budget, ses factures, ses
  paiements. *C'est ainsi qu'un professionnel du BTP raisonne — un chantier, une enveloppe.* Une vue
  consolidée « tous projets » reste accessible pour la lecture d'ensemble.
- **Placé sous BUSINESS**, aux côtés d'Appels d'offres, Offres et Marchés. *L'argent appartient au
  cycle commercial, pas à l'opérationnel : je réponds, je gagne, je facture.*
- **Ne s'applique pas à l'espace client**, qui conserve son Budget simple. Le client n'a pas de
  comptabilité d'entreprise à tenir : il veut savoir ce qu'il doit, ce qu'il a payé, ce qui reste.
  Conforme à `SYS-06`, qui pose que les trois rôles ont des structures distinctes et non des variantes
  d'un même écran.

> **Lien avec `FIN-04` :** cette dualité participe vraisemblablement à la confusion des montants. Trois
> endroits peuvent écrire un budget — le marché, la modale projet, le module Finance — et deux modules
> l'affichent sous des noms voisins. **La fusion est donc autant une correction fonctionnelle qu'une
> retouche d'interface**, et elle doit être conduite avec `FIN-04`, pas séparément.


### 2. Recherche globale : un libellé qui ment sur presque tous les écrans

**Constat.** La barre d'en-tête affiche « **Rechercher un professionnel…** » sur **tous** les écrans —
Documents, Commandes, Marchés, Paramètres inclus. Sur la Marketplace, **deux barres se superposent** :
la globale et « Rechercher materiaux, mobilier, equipements… ».

**Conséquence :** l'utilisateur qui saisit dans la première croit chercher dans la page. Une barre
d'en-tête est lue comme portant sur le contexte courant.

**🔴 Décision : placeholder contextuel.** La barre reste en place, son libellé s'adapte à l'écran
(« Rechercher un document… », « Rechercher une commande… »). **Sur la Marketplace, une seule barre.**

*Option écartée — la recherche universelle :* c'est ce qu'un utilisateur attend d'une barre en en-tête,
mais cela suppose indexation, pertinence et filtrage par droits. **Hors du périmètre d'une retouche.**


### 3. Widget KAi : repositionné en coin bas-droit

**Constat.** Le widget est ancré en **bas-centre** et masque du contenu sur presque tous les écrans :
il recouvrait la phase « Mobilier & Décoration » du suivi client, une carte projet sur « Mes projets »,
et la barre d'action du suivi chantier professionnel.

**Le bas-centre est la pire position possible** : c'est l'axe où le contenu s'écoule.

**🔴 Décision : coin bas-droit**, convention établie pour les assistants. Le coin est la seule zone où
un élément flottant ne gêne jamais.

> **⚠️ À vérifier avant application :** un élément occupe déjà le coin bas-droit sur les captures
> (rectangle sombre avec une icône). S'il s'agit d'un composant de l'application et non d'un outil de
> prévisualisation, **il y aura collision** — à traiter en même temps.


### 4. Les compteurs à zéro occupent la meilleure place

**Constat.** Un compte neuf affiche quatre grandes cartes à `0 / 0 / 0 / 0` sur Intervenants, sur
Commandes, et des variantes ailleurs. **L'espace le plus visible de l'écran sert à dire qu'il n'y a
rien.**

**Recommandation** *(non arbitrée)* : lorsque tous les indicateurs valent zéro, les replier en une
ligne et rendre l'espace à l'action suivante.


### 5. Les accents de couleur ne portent pas de sens stable

**Constat.** Les boutons principaux sont noirs partout — **sauf** « Valider le projet » en **vert** et
« Panier » en **orange**. S'y ajoute le badge KAi en **rouge** là où la spécification prévoit du violet
(`QAL-05`).

**Le vert sert donc simultanément de confirmation et d'action principale**, ce qui dilue les deux sens.

**Recommandation** *(non arbitrée)* : un accent, un sens. Vert = succès uniquement · violet = KAi
uniquement (`QAL-05`) · orange = commerce · noir = action principale.


### 6. Les libellés de navigation ne correspondent pas aux titres de page

| Entrée de menu | Titre de la page ouverte |
|---|---|
| Tâches | **Planning** *(un calendrier)* |
| Avancement | **Suivi chantier** |
| Budget | **Budget** *(mais contenu contractuel)* |

**Recommandation** *(non arbitrée)* : aligner libellé et titre. Un utilisateur qui clique « Tâches » et
arrive sur « Planning » doute d'avoir cliqué au bon endroit.


### 7. Des fils d'ariane qui n'en sont pas

**Constat.** « Budgets → Dépenses → Factures → Rapports » et « PROJET FAMILLE → Réception → 100% »
ressemblent à des chemins de navigation mais **ne sont pas cliquables** : ce sont des sous-titres
descriptifs.

**Recommandation** *(non arbitrée)* : soit les rendre navigables, soit les styler comme de simples
sous-titres. *Ces mêmes chaînes sont par ailleurs affectées par le défaut d'encodage de `QAL-04` — la
flèche y est rendue « à ».*


### 8. Documents : cinq modes d'affichage pour zéro document

**Constat.** L'écran Documents propose **Grille · Galerie · Liste · Chronologie · Catégorie** — cinq
façons de regarder un contenu qui n'existe pas encore.

**Recommandation** *(non arbitrée)* : en conserver deux jusqu'à ce que le volume justifie les autres.
*Cinq modes proposés d'emblée sont souvent le signe qu'un usage principal n'a pas été tranché.*


### Constat de gouvernance

**La structure de navigation des trois espaces n'est documentée nulle part dans le référentiel.**
`SYS-06` détaille la structure des **Paramètres** par rôle, mais **pas la navigation principale** —
sections, entrées, ordre. Elle n'existe aujourd'hui que dans les captures.

**Conséquence pratique :** la décision de déplacer le module financier sous BUSINESS **ne peut être
consignée nulle part** en l'état. Il manque une table de référence de la navigation, au même titre que
celle des Paramètres. *À produire — c'est le prérequis de toute décision d'architecture d'information.*

> **Dépendances :** `FIN-04` (à conduire avec la fusion), `QAL-04` (encodage, affecte les fils
> d'ariane), `QAL-05` (couleur du badge KAi), `SYS-06` (structure par rôle — **table de navigation
> manquante**), `INS-17` (page publique).

> **Ajout (27/07/2026) — une neuvième retouche, issue de `INS-19` : l'échelle de rayons.**
> MEEREO a demandé d'arrondir les formes de la page publique (`INS-19`, §B). **Cette décision ne doit
> pas rester locale à cette page.** Le rayon des boutons, cartes, étiquettes et images doit devenir une
> **échelle du design system**, appliquée partout.
>
> **Sans quoi la page publique sera arrondie et le reste de la plateforme restera anguleux : on aura
> déplacé l'incohérence au lieu de la supprimer.** C'est exactement le mécanisme qui a fait échouer les
> corrections du logo (`QAL-07`) — une règle appliquée à un écran plutôt qu'au composant.
---

## `QAL-07` — Identité visuelle : composant unique et matrice d'affichage
**Statut : À CORRIGER — MAJEUR** *(ajouté v1.42)*

> **Pourquoi ce point existe alors que `QAL-02` traite déjà le sujet.** `QAL-02` pose une règle de
> **donnée** : une seule source, aucune copie locale. Cette règle est juste, et elle ne suffit pas.
> **Dix écrans peuvent lire la même source et l'afficher de dix façons différentes.** C'est exactement
> ce qui se produit. Le présent point traite le **rendu**, là où `QAL-02` traite la **donnée**.
>
> **C'est la raison pour laquelle ce problème résiste depuis plusieurs versions :** on a corrigé la
> source, jamais l'affichage. Une règle énoncée comme principe n'a jamais produit de composant.

### A. Inventaire des représentations observées

**Une seule entreprise — MILLENIUM CONSTRUCTION — apparaît sous DIX représentations distinctes.**

| # | Emplacement | Espace | Ce qui s'affiche | Forme | Couleur |
|---|---|---|---|---|---|
| 1 | Barre latérale, bloc entreprise | Pro | **Logo réel** *(spirale)* | Carré | Noir |
| 2 | En-tête, avatar de compte | Pro | **Logo réel** | Rond | Noir |
| 3 | Page publique, bloc identité | Public | **Logo réel** | Carré | Noir |
| 4 | Page publique, en-tête de page | Public | Monogramme **« MC »** | Carré arrondi | **Bleu** |
| 5 | Annuaire *(modale)* | Client | Monogramme **« MC »** | **Rond** | **Bleu** |
| 6 | Recherche globale *(liste)* | Client | Monogramme **« MC »** | Carré | **Noir** |
| 7 | Marchés, carte de contrat | Pro | Monogramme **« MC »** | Carré | Noir |
| 8 | Équipe projet | Client | Monogramme **« MC »** | Carré | Noir |
| 9 | Offres reçues | Client | Monogramme **« MC »** | Carré | **Lavande** |
| 10 | Intervenants du projet | Client | Monogramme **« M »** | Carré | Noir |

**Trois défauts distincts se cumulent :**

1. **Le logo réel n'apparaît que dans 3 emplacements sur 10.** Partout ailleurs, un monogramme est
   affiché **alors qu'un logo existe**. Ce n'est donc pas un problème de repli — c'est le logo qui
   n'est pas lu.
2. **Trois couleurs pour la même entreprise** — bleu, noir, lavande. **La couleur est donc calculée
   localement, par chaque écran.** C'est la preuve la plus nette que chaque composant décide seul.
3. **Deux règles d'initiales** — « MC » d'un côté, « **M** » de l'autre.

**Sur la page publique, deux représentations coexistent à 200 pixels d'écart** : un monogramme bleu
« MC » dans l'en-tête, et le vrai logo juste en dessous. **Le même écran ne se met pas d'accord avec
lui-même.**

**Le client subit le même désordre :** photo dans son espace et dans la fiche client du professionnel,
monogramme « JT » dans la messagerie et les offres, **et texte seul** dans les Marchés
(« MOA : Jayem Troh », sans aucune identité visuelle).

### B. Cause racine — l'absence de composant, pas l'absence de règle

Chaque écran compose **lui-même** son identité visuelle : il choisit d'aller chercher le logo ou non,
fabrique ses initiales, tire une couleur, décide d'une forme. **Il n'existe pas de composant partagé.**

**Corriger écran par écran ne réglera rien durablement** — c'est ce qui a déjà été tenté. Le onzième
écran ajouté reproduira le problème.

### C. Le contrat à imposer — un composant unique

**Un seul composant rend toute identité visuelle sur la plateforme**, quel que soit le rôle, l'écran ou
l'espace. Aucun écran ne compose lui-même un fond, des initiales ou une couleur.

Il reçoit **une entité** et **une taille**, rien d'autre. Il décide de tout le reste.

**Règles internes du composant :**

1. **Ordre de repli, strict et sans exception :** logo ou photo enregistré → à défaut, **monogramme**.
   **Jamais de texte seul, jamais d'espace vide, jamais d'image cassée.**
2. **Règle d'initiales unique :** deux lettres maximum. Initiale du premier mot + initiale du deuxième.
   Un seul mot ⇒ ses deux premières lettres.
   *MILLENIUM CONSTRUCTION → MC · Jayem Troh → JT · Wave → WA.*
   **Corrige le « M » observé en position 10.**
3. **Couleur du monogramme dérivée de l'identifiant permanent de l'entité (UUID), jamais du contexte
   d'affichage.** *C'est la règle qui manque aujourd'hui :* une entité conserve **la même couleur sur
   toute la plateforme, à vie**. La couleur devient alors un repère de reconnaissance, au lieu d'être
   un bruit.
4. **Forme dérivée de la nature de l'entité :** **carré arrondi** pour une structure *(entreprise,
   fournisseur)*, **rond** pour une personne *(client, employé, intervenant)*. Convention lisible qui
   distingue une société d'un individu au premier coup d'œil. *Arbitrage à confirmer, mais une règle —
   quelle qu'elle soit — vaut mieux que le mélange actuel.*
5. **Jeu de tailles fermé** — proposition : 24 · 32 · 40 · 56 · 96 px. Aucune taille libre.
6. **Le logo prime toujours sur le monogramme lorsqu'il existe.** Les positions 4 à 10 de l'inventaire
   sont toutes des violations de cette règle.

### D. Matrice d'affichage — les emplacements à couvrir

**Cette liste est le périmètre de la correction.** Un emplacement absent de cette liste est un
emplacement qui redeviendra incohérent.

**Professionnel & Fournisseur *(entités à logo)* :** barre latérale · en-tête de compte · page publique
*(en-tête **et** bloc identité)* · annuaire · recherche globale · résultats de recherche · Bourse des
appels d'offres · offres émises et reçues · marchés et contrats · équipe projet · intervenants ·
messagerie *(liste et en-tête de conversation)* · notifications · documents *(auteur)* · avis *(auteur
de la réponse)* · **Marketplace : fiche produit, page boutique, résultats de recherche** · commandes.

**Client *(entité à photo)* :** son en-tête · ses Paramètres · fiche client du CRM professionnel ·
messagerie · offres · **marchés — aujourd'hui en texte seul** · équipe projet · avis déposés ·
notifications.

**Employé *(entité à photo, `INS-18`)* :** page publique *(si marqué public)* · équipe projet ·
Paramètres › Équipe · sélecteur d'affectation · messagerie de projet.

> **⚠️ Section Fournisseur non observée.** Aucune capture ne la couvre. Les emplacements Marketplace
> listés ci-dessus proviennent de `QAL-02` et de `MKT-01`/`MKT-03`, **non d'un constat**. À vérifier.

### E. Critère de recette

**Un seul test suffit à valider la correction, et il est simple à exécuter :** afficher la même
entreprise sur **chacun des emplacements de la matrice D** et vérifier qu'elle présente **le même
visuel, la même forme et la même couleur** partout. Puis changer son logo et vérifier que **tous**
suivent, sans exception et sans délai.

**Ce test doit être rejoué pour les trois natures d'entité** — entreprise avec logo, entreprise sans
logo *(repli monogramme)*, et personne avec ou sans photo. **Une correction validée sur le seul cas
« logo présent » laisserait le repli incohérent**, ce qui est précisément l'état actuel.

> **Dépendances :** `QAL-02` (source de la donnée — **complété, non remplacé**), `INS-02` (logo unique),
> `INS-12` (repli par monogramme — **spécifié ici**), `INS-04` (badge, même famille de problème),
> `INS-17` (page publique), `INS-18` (employés), `MKT-01`/`MKT-03` (Marketplace), `AVS-06` (fiche CRM).

> **✅ Forme confirmée par défaut (27/07/2026) : carré arrondi pour une structure, rond pour une
> personne.** Convention lisible qui distingue une entreprise d'un individu au premier coup d'œil, et
> qui reste cohérente avec la maquette de référence — où l'avatar de l'agence est rond parce qu'il
> représente… l'agence en tant qu'interlocuteur. *Point mineur, réexaminable : ce qui compte est qu'une
> règle existe, pas laquelle.*
---

## `QAL-08` — Lexique des rôles : un mot, une notion
**Statut : RÈGLE** *(ajouté v1.50)*

**Constat (27/07/2026).** Quatre écrans emploient **quatre mots différents pour la même entité** :
*Prestataire* (modal d'évaluation) · *Intervenant* (bloc « Intervenants du projet ») · *Entreprise*
(fiche) · *Professionnel* (annuaire, Paramètres, CGU).

### ✅ Décision du 27/07/2026 : deux notions distinctes, deux mots, pas quatre

MEEREO ne retient pas un mot unique — **et c'est un arbitrage plus fin que la question posée** :

| Mot | Ce qu'il désigne |
|---|---|
| **Professionnel** | L'entreprise **titulaire du marché**, celle avec qui le client a contracté. Elle a une page publique, figure à l'annuaire, reçoit les avis. |
| **Intervenant** | Un **corps de métier supplémentaire intégré à la mission** — sous-traitant, architecte, bureau d'études. Il travaille **sous la responsabilité du Professionnel**. |

> *« Le professionnel existe ; le fait d'intégrer un corps de métier supplémentaire dans la mission
> est l'intervenant. »* — MEEREO, 27/07/2026.

**Deux mots sont donc supprimés en tant que libellés de rôle :**

- **« Prestataire »** — n'apparaît plus nulle part. *Le modal d'évaluation devient « Évaluer le
  professionnel ».*
- **« Entreprise »** — reste employé pour désigner la **personne morale** *(RCCM, structure juridique,
  inscription)*, **jamais le rôle dans un projet**. La distinction n'est pas cosmétique : un artisan
  individuel est un Professionnel sans être une entreprise.

### 🔴 Pourquoi cette décision dépasse le vocabulaire

**Elle valide, par le langage, la règle de notation posée par `AVS-07`.** Les deux mots recouvrent
exactement les deux maillons de la chaîne contractuelle :

> **Le client évalue le Professionnel. Le Professionnel évalue les Intervenants.**

*Chacun est évalué par celui qui a apprécié sa prestation.* Une règle qu'on peut énoncer en une phrase
avec le vocabulaire de l'interface est une règle que les utilisateurs comprendront sans qu'on la leur
explique — **et qu'un développeur ne pourra pas implémenter de travers.**

### ⚠️ Conséquence à vérifier : le bloc « Intervenants du projet »

Sur l'écran de suivi client, ce bloc liste **MILLENIUM CONSTRUCTION**, qui est le **titulaire** — donc
un *Professionnel* au sens ci-dessus, pas un *Intervenant*.

**Le libellé est à reprendre.** Deux lectures possibles, à trancher au moment de coder :

- soit le bloc distingue **« Professionnel »** *(le titulaire)* et **« Intervenants »** *(les corps de
  métier ajoutés)* — deux sous-blocs ;
- soit il conserve un titre englobant **« Participants au projet »**, en indiquant la qualité de chacun
  en sous-titre.

*La seconde option est plus économe si un projet peut n'avoir aucun intervenant, ce qui est le cas ici.*

**Portée de la règle :** interface, notifications, e-mails, textes juridiques (Annexe 8) et
documentation. **Un terme retenu vaut partout ou ne vaut nulle part** — c'est le principe déjà appliqué
au logo (`QAL-02`) et à l'identité visuelle (`QAL-07`), transposé au vocabulaire.

> **Dépendances :** `AVS-07` (chaîne d'évaluation) · `AVS-01` (évaluation croisée) · `ANN-01` (annuaire)
> · `SYS-06` (Paramètres) · Annexe 8 (CGU/CGV — toute reformulation doit y être répercutée).


> **✅ BLOC DE L'ÉCRAN PROJET (27/07/2026) : deux blocs séparés.**
>
> | Bloc | Contenu |
> |---|---|
> | **Professionnel** | L'entreprise **titulaire du marché** |
> | **Intervenants** | Les **corps de métier ajoutés** à la mission |
>
> **Motif :** la responsabilité est lisible au premier coup d'œil — on voit **qui porte le marché** et
> qui travaille sous sa responsabilité.
>
> **⚠️ Condition d'affichage, à ne pas omettre : le bloc « Intervenants » est masqué lorsqu'il est
> vide.** Le cas est **majoritaire** — la plupart des projets n'ont qu'un titulaire. *Un bloc vide
> intitulé « Intervenants » ferait croire à une donnée manquante ou à un chargement en échec.*
> C'est la règle d'affichage dérivé déjà posée par `PRJ-11` : **on n'affiche pas un conteneur pour
> annoncer qu'il est vide.**

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

> **🔴 DÉCISIONS DE MEEREO (27/07/2026) — circuit de la facture et partage du budget.**
>
> **1. Le budget du projet est PARTAGÉ avec le client.** Arbitrage rendu : le budget rattaché à un
> projet est **le budget du chantier**, pas la planification de coûts interne du professionnel. Il est
> donc **visible par le client**, conformément à la « vue relevé financier (livrable client) » déjà
> prévue par le présent point. **La cloison constatée en `FIN-04` est donc un pur défaut**, sans
> justification métier — et non une confidentialité voulue.
>
> **2. Circuit de la facture — émission par le professionnel, déclaration du paiement par le client.**
> Le statut « Validée » signifie que **le professionnel a finalisé et émis** sa facture. Suite du
> circuit, désormais tranchée :
>
> | Étape | Qui | Effet |
> |---|---|---|
> | Émission | Professionnel | La facture devient **visible par le client** — ce qui n'est pas le cas aujourd'hui |
> | Réception | Client | Il la consulte dans son espace, avec le montant, l'échéance et le projet |
> | **Déclaration de paiement** | **Client** | Il indique **quand et comment** il a réglé, hors plateforme |
> | Confirmation | Professionnel | Il confirme avoir reçu — la facture passe à *Réglée* |
>
> **Cohérence avec la doctrine D1 :** ce circuit reste **strictement déclaratif**. MEEREO **trace**, ne
> transporte aucun fonds et ne garantit aucun règlement. C'est la seule option compatible avec
> l'absence d'agrément d'établissement de paiement (`FIN-03` Phase 2, Annexe 8/A8.1).
>
> **Option écartée et pourquoi :** un circuit d'**approbation/contestation** de facture par le client a
> été envisagé. Il protégerait mieux l'acheteur, mais il crée un état « contestée » que **MEEREO
> devrait arbitrer** — ce que les CGU excluent expressément (A8.3, article 11 : MEEREO n'est pas partie
> aux contrats entre utilisateurs). **Le désaccord sur une facture se règle entre les parties**, la
> plateforme se borne à en conserver la trace.
>
> **Reste à trancher :** qui peut **modifier** le budget partagé une fois le marché signé, et selon
> quelle traçabilité ? Un montant contractuel modifiable unilatéralement n'a pas de valeur.
> *Point ajouté à l'Annexe 1.*
> **✅ MODIFICATION DU BUDGET APRÈS SIGNATURE — TRANCHÉ (27/07/2026).**
> **Le professionnel peut modifier le montant, le client en est notifié.**
>
> **Ce qui rend cette décision cohérente :** MEEREO **n'est pas partie au contrat** (CGU, A8.3 art. 2).
> Le montant affiché ici ne *constitue* pas l'accord — il **trace** un accord conclu ailleurs. Verrouiller
> une donnée que la plateforme ne fait que refléter aurait empêché de corriger une saisie sans
> reproduire tout le circuit.
>
> **⚠️ Trois exigences sans lesquelles la notification n'a aucune valeur :**
>
> 1. **Historisation complète de chaque modification** — date, auteur, ancien montant, nouveau montant,
>    motif si saisi. *Sans historique, le client est prévenu d'un changement qu'il ne peut ni vérifier
>    ni contester.*
> 2. **L'historique est consultable par les deux parties.** Une trace visible du seul professionnel ne
>    protège personne.
> 3. **La notification indique l'écart**, pas seulement le nouveau montant : *« Le budget est passé de
>    14 000 000 à 15 500 000 FCFA (+ 1 500 000). »* Un client qui reçoit un chiffre isolé ne sait pas
>    ce qui a changé.
>
> **Ce que cela n'autorise pas :** modifier un montant **rétroactivement** sans trace, ou après
> clôture du projet. Une fois le projet clôturé, les montants sont figés.
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

> **⚠️ CONTRADICTION INTERNE RELEVÉE (26/07/2026) — À TRANCHER AVANT TOUT DÉVELOPPEMENT DE PAIEMENT.**
> Constatée en rédigeant les textes juridiques (Annexe 8), cette contradiction est **déterminante** :
> elle décide du régime réglementaire applicable à MEEREO.
>
> | Source | Ce qu'elle affirme |
> |---|---|
> | **Le présent point `FIN-02`** | MEEREO intègre un « **vrai encaissement Mobile Money** » pour deux usages, dont les **petits achats Marketplace**. |
> | **`FIN-03` Phase 2** | « Encaisser l'argent d'un tiers exige un **agrément d'établissement de paiement** — **MEEREO ne l'a pas au démarrage**. L'argent des ventes transite **directement de l'acheteur au fournisseur**. » |
> | **`SYS-06`** (onglet Paiements) | Le fournisseur configure ses moyens de réception et « **reçoit directement de l'acheteur** ». |
>
> **Les deux premières affirmations sont incompatibles.** `FIN-03` et `SYS-06` concordent entre eux et
> avec l'implémentation livrée (`MKT-06` : les moyens de réception appartiennent au fournisseur) ;
> c'est donc la mention « petits achats Marketplace » du présent point qui fait exception.
>
> **Position retenue par défaut dans les textes juridiques (Annexe 8) :** MEEREO **n'encaisse que ses
> propres revenus** — abonnement KAi Pro, forfait produits, sponsoring — et **jamais** le prix des
> ventes entre utilisateurs. Motif : encaisser pour compte de tiers sans agrément expose à une
> qualification d'exercice illégal de l'activité d'établissement de monnaie électronique
> (réglementation BCEAO/UEMOA). Le risque est sans commune mesure avec le gain.
>
> **Décision attendue de MEEREO :**
> - **soit** amender le présent point pour **retirer les « petits achats Marketplace »** du périmètre
>   encaissé — l'abonnement KAi Pro, revenu propre, ne pose aucune difficulté ;
> - **soit** documenter le **partenariat avec un établissement agréé** qui porterait ce flux, auquel
>   cas les Conditions Générales de Vente (Annexe 8, A8.4) devront être **réécrites**.
>
> **Tant que ce point n'est pas tranché, les CGV Marketplace ne doivent pas être publiées.**

> **✅ DEUX DÉCISIONS TARIFAIRES (27/07/2026).**
>
> **1. Entreprise cumulant deux rôles : le tarif le plus élevé s'applique — 39 000 FCFA/mois.**
> *Motif :* simple à comprendre et à facturer, et économiquement défendable — une entreprise qui vend
> tire déjà la valeur commerciale qui justifie le tarif fournisseur. **Surtout, ce choix n'encourage
> pas à fractionner** en deux structures juridiques pour payer moins, ce que la somme des deux tarifs
> (58 900 FCFA) aurait provoqué — et qui aurait vidé de son sens la décision d'autoriser le cumul.
>
> **2. Comptes employés : inclus, sans limite de nombre.**
> L'abonnement reste attaché à l'**entreprise**. Une structure de 18 collaborateurs ouvre 18 accès sans
> surcoût.
> *Motif :* le coût marginal d'un compte est faible, et l'adoption interne est ce qui ancre durablement
> une entreprise sur la plateforme. **Facturer au siège dès le premier accès freinerait l'adoption au
> moment précis où elle se joue.**
> ⚠️ **À surveiller :** ce choix suppose que les comptes employés restent des **accès restreints**
> (`SYS-02`). Si un employé disposait des mêmes droits qu'un compte principal, le modèle deviendrait
> contournable — une entreprise paierait un abonnement pour dix utilisateurs pleins.

> **✅ CONTRADICTION TRANCHÉE (27/07/2026) — décision en deux temps.**
>
> *« Au début directement, et dès qu'on pourra faire l'agrément on fera passer par notre API. »*
>
> | Étape | Flux de l'argent | Condition |
> |---|---|---|
> | **Aujourd'hui** | **Acheteur → Fournisseur, en direct.** MEEREO n'encaisse que ses **revenus propres** : abonnement KAi Pro, forfait fournisseur, sponsoring. | Aucune — praticable immédiatement |
> | **Ensuite** | Les paiements **transitent par l'API MEEREO** | **Obtention de l'agrément d'établissement de paiement** |
>
> **Ce que cette décision débloque immédiatement.** La mention « **petits achats Marketplace** » du
> présent point est **retirée du périmètre encaissé** : `FIN-02`, `FIN-03`, `SYS-06` et le code livré
> (`MKT-06`) disent désormais tous la même chose. **Les CGV Marketplace (Annexe 8, A8.4) peuvent être
> publiées** — la réserve qui l'interdisait est levée.
>
> **🔴 Ce qu'il faut anticiper, et qui n'est pas un sujet de développement.** L'agrément conditionne la
> **Phase 3** de `FIN-03` (escrow et commission). **Ce n'est pas le code qui sera le chemin critique,
> c'est le délai d'instruction du dossier.** Une équipe technique peut livrer une intégration de
> paiement en quelques semaines ; un agrément réglementaire ne s'obtient pas à ce rythme.
> **Le dossier doit donc être engagé bien avant que la fonctionnalité soit souhaitée.**
>
> **⚠️ Limite de ce que je peux affirmer.** Je **ne connais pas de façon vérifiée** les conditions
> exactes d'obtention de cet agrément dans l'espace UEMOA — capital minimum, pièces, autorité
> compétente, délai. **Je ne les invente pas.** Ce point doit être instruit avec un conseil spécialisé
> en réglementation bancaire ivoirienne, **au même titre que la validation juridique de l'Annexe 8**.
>
> **Conséquence documentaire à prévoir :** les CGV rédigées aujourd'hui décrivent un flux direct.
> **Le passage à l'API MEEREO les rendra caduques** et imposera une nouvelle version, ainsi qu'une
> information des utilisateurs. *À traiter comme une évolution planifiée, pas comme une surprise.*


> **✅ TARIF FOURNISSEUR CONFIRMÉ (27/07/2026) : 39 000 FCFA/mois, la rupture de motif est délibérée.**
> La revue de développement a relevé que la série **9 900 · 19 900 · 39 000** rompt le motif en « 900 »
> et suggérait une coquille pour **39 900**. **MEEREO confirme 39 000.** *Consigné ici pour que la
> question ne soit pas reposée à chaque relecture.*

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

> **Protection de la Phase 3 (27/07/2026).** L'étanchéité posée par **`MKT-07`** — un seul point
> d'entrée transactionnel pour le fournisseur — **conditionne la faisabilité de la Phase 3** décrite
> ci-dessous.
>
> **Le raisonnement mérite d'être explicite :** en Phase 2, MEEREO ne prélève aucune commission, donc
> une vente hors plateforme ne coûte **rien immédiatement**. Mais la Phase 3 introduit escrow et
> commission — **et elle suppose que les transactions passent déjà par la Marketplace**. Si l'habitude
> de contourner s'installe pendant la Phase 2, **la Phase 3 deviendra impraticable** : on ne ramène pas
> des utilisateurs vers un circuit qu'ils ont appris à éviter, surtout au moment précis où on leur
> annonce une commission.
>
> **La règle d'étanchéité n'est donc pas une contrainte de la Phase 2 — c'est un investissement pour la
> Phase 3.**

> **✅ DEUX PRÉCISIONS (27/07/2026).**
>
> **1. Principe de commission : un taux unique sur toutes les ventes.** Pas de variation par catégorie
> de produit, pas de dégressivité au volume. **Le taux lui-même reste à fixer** — il dépendra des
> volumes réels et de la concurrence.
>
> > **Ce que la simplicité achète ici :** un fournisseur comprend en une phrase ce qu'il paiera, et
> > **aucune contestation de classement n'est possible** — un taux par catégorie aurait produit des
> > discussions sans fin sur le rangement de chaque produit. *L'équité économique d'un taux différencié
> > ne compense pas ce coût au démarrage ; le point pourra être réexaminé quand les volumes le
> > justifieront.*
>
> **2. La condition d'entrée en Phase 3 est identifiée : l'agrément d'établissement de paiement.**
> `FIN-02` acte que les paiements transiteront par l'API MEEREO **une fois l'agrément obtenu**. La
> Phase 3 n'est donc plus conditionnée à une décision, mais à **une démarche réglementaire dont le
> délai n'est pas maîtrisable** — voir `FIN-02` pour la réserve sur ce que je ne peux pas affirmer.
>
> **Les deux conditions de la Phase 3 sont désormais nommées :** l'**agrément** *(`FIN-02`)* et
> **l'habitude de passer par la Marketplace** *(`MKT-07`)*. **La première est administrative, la
> seconde comportementale — et seule la seconde se perd si on la néglige aujourd'hui.**

---

## `FIN-04` — Chaîne financière rompue : montants incohérents entre offre, marché, budget et facture
**Statut : À CORRIGER — MAJEUR** *(ajouté v1.34)*

**Constat (27/07/2026, relevé sur six écrans du même projet « PROJET FAMILLE ».)** Ce point n'a pas été
signalé : il ressort du **recoupement** des captures. Les montants d'un même projet sont **contradictoires
selon l'écran consulté**.

| Écran | Montant affiché |
|---|---|
| Offre acceptée | **0 FCFA** — « Montant proposé », délai vide |
| Marchés (carte du contrat) | **0 FCFA**, deux dates vides |
| Budget › Mes contrats | **0 FCFA**, statut *Signé* |
| Budget › Montant contractuel | **0 FCFA** — reçu 0, en cours 0 |
| Projet › Budget | **0 FCFA** |
| **Finance › Budgets** | **14 000 000 FCFA** — dépensé **0 FCFA**, taux **0 %** |
| **Finance › Factures** | **3 500 000 FCFA** — référence DXZPVB3R, statut **Validée** |

### Trois ruptures distinctes, à ne pas confondre

**1. Une offre a pu être acceptée à 0 FCFA.** L'offre soumise porte « Montant proposé : 0 FCFA » et un
délai vide, et elle a néanmoins été **acceptée**, transformée en **marché signé**. Un marché de travaux
sans montant ni échéance n'a pas d'objet.
**Attendu :** un montant strictement positif et un délai sont **obligatoires** pour soumettre une offre
(`AOF-03`). Le bouton de soumission reste inactif à défaut — même patron que `INS-06`. *Réserve : si un
« montant sur devis » doit rester possible, il doit être un **état explicite**, jamais un zéro qui se
confond avec l'absence de saisie — comme la règle « prix = 0 » de `MKT-01`, qui est signalée à l'écran.*

**2. Le marché ne reprend pas les données de l'offre.** Le montant et les échéances de l'offre acceptée
ne sont pas reportés dans le marché créé. `AOF-01` prévoit pourtant un enchaînement continu
appel d'offres → offre → marché.
**Attendu :** à l'acceptation, le marché **hérite** du montant, du délai et des conditions de l'offre.
Ces valeurs deviennent les données contractuelles de référence.

**3. Le module Finance est déconnecté des marchés.** Un budget de **14 000 000 FCFA** et une facture
**validée de 3 500 000 FCFA** existent, mais :

- le **taux de consommation affiche 0 %** et « dépensé : 0 FCFA », alors qu'une facture validée de
  3,5 M existe — **les factures validées ne sont pas agrégées dans le budget** ;
- la **timeline financière affiche « Aucun flux financier »**, tout en indiquant elle-même : *« La
  timeline se remplit automatiquement à partir de vos marchés et paiements »* — **l'écran contredit sa
  propre promesse** ;
- ces montants n'apparaissent **nulle part** dans Marchés, Budget ou Projet.

**Attendu (conforme à `FIN-01`) :** Budget, Phases, Marchés et Paiements forment **une seule chaîne
cohérente**. Un montant saisi à un endroit se répercute partout, depuis une **source unique** — même
principe que `QAL-02` pour le logo. Une facture validée alimente le montant dépensé, le taux de
consommation et la timeline.

### Pourquoi ce point est classé majeur

Le suivi financier est l'une des raisons d'être de la plateforme. **Un utilisateur qui voit 0 FCFA sur
son marché et 14 000 000 FCFA sur son budget ne sait pas laquelle des deux valeurs est fausse — et
cesse de faire confiance aux deux.** La perte de confiance dans un chiffre affiché est plus coûteuse à
regagner que le défaut technique ne l'est à corriger.

> **Lien avec `AOF-05` :** ce marché à 0 FCFA aux dates vides est très probablement **celui-là même qui
> fait planter l'écran de détail**. Les deux points ont vraisemblablement une origine commune.

> **Dépendances :** `FIN-01` (modèle Budget/Phases/Marchés/Paiements), `AOF-01` (cycle),
> `AOF-03` (soumission d'offre), `AOF-05` (plantage), `PRJ-01` (création du projet), `QAL-02` (source unique).

> **⚠️ AMENDEMENT MAJEUR (27/07/2026) — cause racine identifiée, et portée élargie.**
>
> **1. La rupture commence à la source : l'appel d'offres n'a ni budget ni date de clôture.**
> La fiche de l'appel d'offres publié par le client affiche **« BUDGET — »** et **« CLOTURE — »**.
> Toute la chaîne en découle mécaniquement : un appel d'offres sans budget produit une **offre à
> 0 FCFA**, qui produit un **marché à 0 FCFA**, qui produit un **budget projet à 0 FCFA**.
> **Il ne s'agit donc pas de quatre défauts mais d'un seul, propagé.** Corriger le marché ou l'offre
> sans corriger la publication de l'appel d'offres ne servirait à rien.
> **Attendu :** budget (ou fourchette) et date de clôture **obligatoires à la publication** d'un appel
> d'offres (`AOF-01`). Sans eux, un professionnel ne peut ni chiffrer, ni s'organiser.
>
> **2. Le client ne voit AUCUNE donnée financière.** Constat plus grave que celui décrit ci-dessus.
> L'espace client affiche **quatre indicateurs à zéro** — Budget total 0, Engagé 0, Payé 0, En cours 0
> — et un contrat validé à **0 FCFA**.
>
> **Pendant ce temps, côté professionnel, existent un budget de 14 000 000 FCFA et une facture
> validée de 3 500 000 FCFA.** Ces montants sont **totalement invisibles pour le client**.
>
> **Ce n'est pas une divergence d'affichage, c'est une cloison.** Le maître d'ouvrage — celui qui paie
> — n'a aucune visibilité sur le budget engagé pour son propre chantier ni sur une facture déjà
> validée. `FIN-01` prévoit pourtant explicitement une **transversalité Client ↔ Professionnel** et une
> **vue « relevé financier » livrable au client**. Ni l'une ni l'autre n'existe.
>
> **Aggravation :** le professionnel peut valider une facture de 3,5 M sans que le client en soit
> informé. C'est un défaut qui touche à l'équilibre contractuel entre les parties, pas seulement à
> l'ergonomie.
>
> **Attendu :** tout montant contractuel, budget engagé et facture validée est **visible par le client
> concerné**, depuis la même source unique. Le tableau de bord financier du client cesse d'afficher des
> zéros lorsque des données existent.
> **🔍 CONSTAT COMPLÉMENTAIRE (27/07/2026) — une seconde source d'écriture pour le budget.**
> La modale « **Éditer le projet** » comporte un champ **« Budget (FCFA) »**, directement modifiable,
> et **actuellement à 0**.
>
> **Le budget d'un projet a donc au moins deux sources d'écriture** : l'héritage depuis le marché
> (aujourd'hui rompu) et cette saisie manuelle. À quoi s'ajoutent les budgets du module Finance
> (« Budget conception : 14 000 000 FCFA »).
>
> **Cela explique la divergence des montants sans la justifier.** Trois endroits peuvent écrire un
> budget, aucun ne fait autorité. **Décision à prendre en même temps que le correctif racine :**
>
> - le **montant contractuel** provient du **marché** et n'est pas modifiable à la main — c'est une
>   donnée contractuelle, pas un champ de saisie ;
> - le **budget d'enveloppe** du client peut rester saisissable, mais il doit être **explicitement
>   distinct** du montant contractuel à l'écran, et non porter le même nom ;
> - le champ « Budget » de la modale projet doit être **soit supprimé, soit clairement rattaché** à
>   l'un des deux — dans l'état actuel, il ne dit pas ce qu'il représente.
>
> **Constat annexe :** le champ **« Livraison »** de cette même modale est vide (`jj/mm/aaaa`), ce qui
> explique le « — » affiché partout ailleurs. Même origine que le budget : **une donnée jamais héritée
> du marché, laissée à une saisie manuelle qui n'a pas lieu.**
> **Décision liée (27/07/2026) — fusion des deux modules financiers.** MEEREO a décidé de **fusionner**
> « Budget » et « Finance » en un module unique, **organisé par projet** et placé sous BUSINESS
> (`QAL-06`, §1). **Ce n'est pas une simple retouche d'interface :** deux modules aux noms voisins
> affichant des montants différents participent directement à la confusion décrite ci-dessus.
> **Les deux chantiers doivent être conduits ensemble**, sous peine de corriger les montants dans une
> architecture qui continue d'en présenter deux versions.
> **L'espace client n'est pas concerné** par la fusion : il conserve son Budget simple.
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

> **🔴 DÉCISIONS DE MEEREO (27/07/2026) — correctif de la cause racine identifiée en `FIN-04`.**
> Un appel d'offres publié sans budget ni date de clôture propage des valeurs vides sur toute la
> chaîne. Deux règles sont désormais **obligatoires à la publication** :
>
> **1. Fourchette de budget — obligatoire et VISIBLE des candidats.**
> Le client saisit un **montant minimum et un montant maximum**, librement, en FCFA.
> *Pourquoi une fourchette et non un montant exact :* un montant exact affiché fait **converger toutes
> les offres dessus** — le client perd le bénéfice de la mise en concurrence qu'il cherchait. Une
> fourchette filtre les candidats hors de portée sans ancrer les prix.
> *Pourquoi min/max libres et non des tranches figées :* les tranches du parcours d'inscription
> (« < 20 M », « 20–50 M », « > 50 M ») rangeraient un projet réel de 14 M dans la tranche la plus
> basse, aux côtés d'un chantier de 3 M. **Trop grossier pour être utile**, et une grille fixe
> vieillirait avec l'inflation. Le min/max libre reste précis à tous les ordres de grandeur et permet
> un **tri et un filtrage réellement exploitables** dans la Bourse (`ANN-03`).
> **Contrôles attendus :** min > 0, max ≥ min, et cohérence à la saisie (patron `INS-06` : bouton de
> publication inactif tant que les deux champs ne sont pas valides).
>
> **2. Date de clôture — obligatoire, avec fermeture automatique.**
> Le client choisit librement la date. **À l'échéance, l'appel d'offres se ferme seul** et n'accepte
> plus d'offres ; il passe en comparaison puis en attribution.
> *Pourquoi la fermeture automatique :* sans elle, les appels d'offres restent ouverts indéfiniment.
> Une Bourse peuplée d'annonces mortes perd sa crédibilité, et les professionnels cessent de la
> consulter — ce qui vide de son sens le travail fait sur le ciblage par métier.
> **Prolongation : non retenue à ce stade.** Elle supposerait de notifier les candidats déjà
> positionnés, sous peine d'être déloyale envers eux. *Point réexaminable si le terrain montre que les
> clients reçoivent trop peu d'offres.*
>
> **Propagation attendue de ces deux valeurs :** la fourchette et l'échéance sont **reprises par
> l'offre**, puis par le **marché**, puis par le **budget du projet** — c'est précisément la chaîne
> aujourd'hui rompue (`FIN-04`). Le montant de l'offre acceptée devient le **montant contractuel**.
> **🔴 PÉRIMÈTRE PRÉCISÉ (27/07/2026) — le Fournisseur ne répond pas aux appels d'offres.**
> Les appels d'offres sont **réservés aux Professionnels**. Un fournisseur vend par **catalogue**
> (`MKT-07`).
>
> **Cette décision ne fait qu'appliquer une frontière déjà posée par `MKT-01`** : la Marketplace vend
> des **produits physiques**, les appels d'offres portent sur des **services** — main-d'œuvre,
> transport, location. **Un besoin de matériaux se satisfait au catalogue, pas par appel d'offres.**
>
> **Conséquence sur le routage :** le ciblage par métier (`AOF-01`/A2, `AOF-04`) ne diffuse qu'aux
> profils **Professionnel**. Une entreprise cumulant les deux rôles (`INS-14`) reçoit les appels
> d'offres **au titre de son seul profil professionnel**.
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

## `AOF-04` — Filtre par métier de la Bourse des appels d'offres
**Statut : À CORRIGER** *(ajouté v1.33)*

**Constat rapporté (26/07/2026).** Le filtre par métier de la Bourse existe mais ne filtre pas : la
sélection d'un métier ne restreint pas les résultats.

**Comportement attendu :**

- **Par défaut, tous les appels d'offres restent visibles** — l'accès large est le comportement voulu,
  il ne doit pas être restreint.
- La sélection d'un métier n'affiche que les appels d'offres de cette catégorie.
- Le retrait du filtre restaure l'intégralité de la liste.
- Les filtres doivent être **cumulables** avec les onglets existants (Tous / Ouverts / Suivis /
  Mes secteurs) sans se contredire.

### ⚠️ Cause racine probable — dépendance directe à `INS-11`

**Ce défaut n'est vraisemblablement pas un défaut de filtre, mais un défaut de donnée.**

`INS-11` a établi que les **secteurs d'activité du professionnel étaient saisis à l'inscription puis
perdus** : la fonction de bascule ne modifiait qu'une classe CSS, et aucune valeur n'était enregistrée.
`AOF-01` (A2) prévoit pourtant que les appels d'offres publics soient diffusés « **aux pros du bon
secteur** ».

**Un filtre par métier ne peut pas fonctionner si aucun métier n'est associé aux comptes.**

**Confirmation visuelle :** la capture de la Bourse affiche « **Mes secteurs : 0** » pour un compte
professionnel actif (MILLENIUM CONSTRUCTION). Ce compteur à zéro est cohérent avec l'absence
d'enregistrement décrite par `INS-11`.

> **Ordre de correction imposé par cette dépendance :** appliquer d'abord `INS-11` (persistance des
> secteurs, livrée dans le lot `P1/P2` — Annexe 7), **puis** vérifier si le filtre fonctionne. Corriger
> le filtre avant la donnée reviendrait à déboguer un mécanisme correct alimenté par du vide.

### ⚠️ Réserve de méthode sur la preuve fournie

**La capture d'écran transmise ne démontre pas le dysfonctionnement du filtre.** Elle affiche
« **0 disponibles** » et « Aucun appel d'offres disponible » : la Bourse est **vide**. Aucun filtre ne
peut produire de résultat sur un ensemble vide.

Le défaut est donc **rapporté mais non prouvé par cette image**. Pour le qualifier, il faut le
reproduire sur un jeu de données comportant **au moins deux appels d'offres de métiers différents**.
Cette précision n'est pas un doute sur le constat : elle évite de conclure trop vite et de traiter un
symptôme d'absence de données comme un défaut de code.

### Liste des métiers — à compléter

Les filtres observés sont : *Architecte & Design · Bureau d'étude structure · Bureau d'étude fluides ·
Construction gros œuvres · Construction seconde œuvres* (5 entrées, cohérentes avec la liste reprise
en `INS-11`).

**La demande mentionne « architecte d'intérieur », qui n'y figure pas.** C'est la confirmation directe
de la réserve posée en `INS-11` : cette liste de 5 entrées est **insuffisante pour un annuaire réel**.
Elle conditionne à la fois le filtre, le routage `AOF-01` et l'annuaire `ANN-01`/`ANN-02` : **la
compléter est un prérequis fonctionnel, pas un confort.**

> **Dépendances :** `INS-11` (source de la donnée — **bloquant**), `AOF-01` (routage des AO publics),
> `ANN-03` (Bourse), `ANN-01`/`ANN-02` (annuaire).

> **✅ RÉSERVE LEVÉE (27/07/2026) — la Bourse vide s'explique, et le filtre n'est pas nécessairement en cause.**
> La réserve de méthode posée ci-dessus était fondée. Les captures de l'espace client apportent
> l'explication :
>
> - **un seul appel d'offres existe** sur la plateforme (« Mes appels d'offres : 1 publiés par vous ») ;
> - il porte le statut **« Attribué »**, et le compteur « **AO ouverts : 0** » le confirme.
>
> **La Bourse affiche donc légitimement « 0 disponibles » : le seul appel d'offres du système est déjà
> attribué.** Le filtre n'a jamais été mis à l'épreuve.
>
> **Ce qui, en revanche, est confirmé et fonctionne :** l'appel d'offres porte la mention
> « **Visible par les Architecte & Design** ». **Le ciblage par métier existe donc bien à la
> publication**, et il correspond au secteur du professionnel attributaire. C'est un point positif qui
> n'était pas acquis.
>
> **Conséquence sur ce point :** il ne peut être ni confirmé ni infirmé en l'état. **Protocole de
> vérification :** publier **au moins trois appels d'offres ouverts de métiers différents**, puis
> appliquer chaque filtre. La dépendance à `INS-11` (secteurs non enregistrés, « Mes secteurs : 0 »)
> reste entière et doit être traitée en premier.
---

## `AOF-05` — Plantage à l'ouverture du détail d'un marché
**Statut : À CORRIGER — BLOQUANT** *(ajouté v1.34)*

**Constat (27/07/2026).** Depuis la section **Marchés**, l'ouverture d'un marché fait planter
l'application. L'écran est entièrement remplacé par « Une erreur est survenue » et un bouton
« Réinitialiser et recharger ». **La fonctionnalité est inaccessible.**

**Message exact :** `Minified React error #31 ; args[]=object with keys {}`

### Ce que dit précisément cette erreur

L'erreur #31 de React signifie : *« Les objets ne sont pas valides comme enfant React. »* Un composant
tente d'afficher un **objet** là où il attend une valeur affichable (texte ou nombre).

**Le détail est déterminant : l'objet incriminé est `{}` — un objet VIDE, sans aucune clé.** Ce n'est
donc pas un objet métier mal placé, mais une valeur qui aurait dû être un scalaire et qui arrive sous
forme d'objet vide.

### Premier réflexe de débogage, avant toute hypothèse

**Reproduire en mode développement.** Le message est *minifié* : il ne nomme ni le composant, ni la
propriété fautive. La version non minifiée donne **le nom du composant et la pile d'appels**, ce qui
désigne la ligne exacte. C'est cinq minutes de travail qui évitent des heures de recherche à l'aveugle.
Tout ce qui suit n'est utile que si cette étape ne suffit pas.

### Causes probables, par ordre de vraisemblance

**1. Un montant sérialisé depuis un type décimal.** C'est le cas le plus fréquent. Les types décimaux
de nombreux ORM (`Decimal`, `BigNumber`) **ne se sérialisent pas en JSON comme un nombre** : ils
produisent `{}` s'ils ne sont pas convertis explicitement. Le marché concerné affiche justement
**0 FCFA** et deux tirets « — » à la place de valeurs attendues.

**2. Une date nulle sérialisée en objet vide.** Même mécanisme. La carte du marché affiche « — » aux
emplacements de dates : ces champs sont vraisemblablement vides en base, et l'écran de détail — qui les
affiche, contrairement à la liste — tente de rendre l'objet directement.

**3. Une relation non résolue.** Un champ tel que le maître d'ouvrage ou le professionnel renvoyé comme
`{}` faute d'avoir été chargé, puis affiché tel quel au lieu d'une de ses propriétés.

### Pourquoi la liste fonctionne et le détail échoue

**La liste n'affiche pas les mêmes champs que le détail.** Elle se contente du nom, du secteur, du
maître d'ouvrage et du montant — et affiche « — » pour ce qu'elle ne sait pas rendre. Le détail
affiche davantage de champs, dont au moins un qui est un objet vide. **Cet écart est l'indice le plus
utile : chercher parmi les champs présents dans le détail et absents de la liste.**

**Comportement attendu :**

- Le détail d'un marché s'ouvre sans erreur, **y compris lorsque des champs sont vides**.
- Toute valeur absente s'affiche comme **valeur manquante explicite** (« — », « Non renseigné »), jamais
  par un rendu direct de l'objet.
- **Garde-fou architectural :** aucune valeur issue de l'API ne doit être rendue sans conversion
  garantie en chaîne ou en nombre. Un schéma de validation en sortie d'API — comme celui posé pour
  l'inscription (Annexe 7) — élimine cette famille entière de défauts.
- **Une erreur de rendu ne doit pas détruire l'écran entier.** Une frontière d'erreur (*error boundary*)
  placée au niveau du panneau de détail, et non de la page, aurait conservé la navigation et la liste.
  L'utilisateur perd aujourd'hui tout son contexte pour un champ mal typé.

> **Lien direct avec `FIN-04` :** ce marché porte un montant de 0 FCFA et des dates vides. **Le
> plantage et l'incohérence financière ont probablement la même origine** — un marché créé sans que les
> montants et échéances de l'offre acceptée y soient reportés. Traiter les deux points ensemble.

> **Dépendances :** `FIN-04` (données du marché), `AOF-01` (cycle appel d'offres → marché),
> `PRJ-01` (création du projet), `QAL-01` (qualité générale).

---

# J. MARKETPLACE & ESPACE FOURNISSEUR

> **Comblé lors de l'audit v1.2.** Tout le module marchand (visible dans les menus « Catalogue / Commandes / Marketplace ») n'avait aucune exigence. Le fournisseur, jusqu'ici quasi absent du référentiel, y est traité.

## `MKT-01` — Catalogue produits du fournisseur
**Statut : CADRÉ — DÉVELOPPABLE**

**Vendeur unique : le fournisseur.** Ni le client, ni le professionnel ne vendent (cf. `SYS-02`). Le fournisseur gère son catalogue : ajout/édition/retrait de produits (nom, catégorie, prix FCFA, photo, description, **stock/quantité disponible — obligatoire**, mode de livraison). Le **premier produit** est créé à l'inscription (parcours fournisseur, `INS`) ; les suivants depuis l'espace fournisseur (`MKT-03`). Chaque produit apparaît dans la Marketplace (« MeereoShop »), consultée par clients **et** professionnels (acheteurs, `SYS-02`/E).

> **Stock obligatoire.** À chaque ajout de produit, le fournisseur **doit renseigner son stock**. Cette donnée est **vivante** : elle décrémente à chaque vente, alimente le badge « Stock limité », déclenche les alertes et analyses de KAi (`MKT-05`), et conditionne les ventes flash de déstockage.
>
> **Amendement (26/07/2026) — le « premier produit créé à l'inscription » ne respecte pas ce formulaire.** L'audit de l'Annexe 6 établit que l'écran d'inscription `f-mat` ne collecte que 4 des champs décrits ci-dessus (nom, catégorie, prix, photo) : **le stock — pourtant déclaré obligatoire juste au-dessus — et l'unité sont absents**, de même que la description et l'interrupteur « Visible dans le Marketplace ». S'y ajoute un écart de taxonomie : **6 des 8 catégories** proposées à l'inscription n'existent pas dans la liste MeereoShop ci-dessus. Voir **`MKT-06`**.

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
> **Dépendances :** premier matériau à l'inscription ; `MKT-02` (achat), `MKT-04` (sponsoring), `FIN-02` (paiement Mobile Money), `QAL-02` (ajouté 25/07/2026 — le **logo du fournisseur**, distinct de la **photo du produit** mentionnée ci-dessus, doit apparaître de façon cohérente sur chaque fiche produit et dans les résultats de recherche Marketplace, depuis la même source unique que sur le reste de la plateforme).

> **⚠️ Amendement rendu nécessaire par la décision du 27/07/2026 sur le cumul de rôles (`INS-14`).**
> Le présent point énonce en tête : *« Vendeur unique : le fournisseur. **Ni le client, ni le
> professionnel ne vendent** »*. **Cette formulation devient inexacte.**
>
> Une même entreprise pouvant cumuler les rôles Professionnel et Fournisseur, **un professionnel doté
> d'un profil fournisseur vend** — c'est le cas de l'entreprise de gros œuvre qui revend des matériaux.
>
> **Formulation corrigée :** *« Seul un **profil Fournisseur** peut vendre. Une entreprise peut
> détenir ce profil en plus d'un profil Professionnel. Un Client ne vend jamais. »*
>
> **Le principe de fond est préservé** — la vente reste attachée au profil Fournisseur, pas au compte.
> Mais la rédaction actuelle interdirait par erreur un cas désormais autorisé.
> **🔴 « SUR DEVIS » — MODALITÉ ARRÊTÉE (27/07/2026).**
> Le présent point énonce que *« la valeur 0 signifie sur devis »* et que *« les acheteurs vous
> contacteront pour obtenir un prix »*. **Cette seconde formulation crée une porte de sortie** : il
> suffirait de mettre tous ses prix à 0 pour quitter entièrement la Marketplace.
>
> **Formulation corrigée :** la demande de prix se fait **sur la Marketplace**, par une **demande de
> devis structurée** rattachée au produit — **jamais par la messagerie**. Elle crée un objet doté d'un
> statut, et **une demande acceptée devient une commande**. Voir **`MKT-07`**.
>
> **Le « sur devis » reste indispensable** — sur-mesure, gros volumes, charpente, produits dont le prix
> dépend réellement de la quantité. **Ce n'est pas la faculté qui est retirée, c'est le canal qui est
> encadré.**

> **✅ « SUR DEVIS » DEVIENT UN ÉTAT, PLUS UN PRIX NUL (27/07/2026).**
>
> La formulation *« la valeur 0 signifie sur devis »* est **abandonnée**. Un produit porte désormais un
> **mode de prix explicite** — *prix ferme* ou *sur devis* — et le prix est **absent** dans le second cas.
>
> > **C'est exactement le motif que `FIN-04` impute à la chaîne financière rompue :** un montant absent
> > devenu `0`, puis propagé sur six écrans. **Avec un zéro, aucun écran en aval ne peut distinguer
> > « sur devis », « gratuit » et « non renseigné ».**
>
> **La cohérence doit être garantie en base**, pas seulement à la saisie : un prix ferme exige un
> montant strictement positif, un « sur devis » exige l'absence de montant. *Une validation applicative
> ne protège ni un import, ni un script de reprise.* **Le traitement de la demande relève de `MKT-07`.**

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
> **Dépendances :** `MKT-01`, `MKT-02`, `MKT-04`, `MKT-05`, `FIN-03`, `SYS-02`, `SYS-06`, `QAL-02` (ajouté 25/07/2026 — la page « Boutique » de cet espace, vue vendeur de la Marketplace, doit afficher le logo fournisseur depuis la même source unique que le reste de la plateforme ; non explicité avant cette version).

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


> **✅ PÉRIMÈTRE CONFIRMÉ (27/07/2026) : les produits sponsorisés sont actifs et facturés.**
> *« On paye la publicité dans la vraie version `dev.meereo.com`. »*
>
> **Correction d'une erreur de ma part.** J'avais classé ce point **hors périmètre MVP** en déduisant de
> la réponse *« monétisation = abonnement KAi Pro »* qu'aucun autre revenu n'était actif. **La déduction
> était fausse : la publicité est déjà payée en production.** `FIN-03` Phase 1, qui compte sur ce revenu
> accessoire dès le lancement, **était exact — c'est mon périmètre qui ne l'était pas.**
>
> **Conséquence sur `FIN-02` :** le sponsoring est un **revenu propre de MEEREO**, au même titre que
> l'abonnement. **Il n'appelle donc aucun agrément** — l'encaissement pour compte de tiers reste seul
> concerné. *Le second flux d'encaissement doit néanmoins être facturé et comptabilisé comme tel.*

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

## `MKT-06` — Complétude opérationnelle du fournisseur à l'issue de l'inscription
**Statut : À CORRIGER + RÈGLE** *(ajouté v1.30)*

**Question posée par l'audit du 26/07/2026 :** *un fournisseur qui termine intégralement le parcours d'inscription peut-il vendre ?* **Réponse vérifiée : non.** Cinq éléments indispensables ne sont jamais collectés, alors que le parcours se conclut par l'écran `f-done` : « **Votre marketplace est prête.** […] Vous pouvez commencer à vendre sur MEEREO. » **Cette affirmation est fausse en l'état.**

### 1. Le premier produit est incomplet au regard de `MKT-01`

`MKT-01` décrit le formulaire réel de création d'un produit : *nom\*, catégorie\*, **unité** (unité, sac, m², tonne…), description, **prix** (0 = sur devis), **stock disponible**, image, interrupteur « Visible dans le Marketplace », Sponsoriser, Offre flash*. L'écran d'inscription `f-mat` ne collecte que **quatre** de ces champs : nom, catégorie, prix, photo.

**Manquent notamment deux données que `MKT-01` qualifie lui-même d'obligatoires ou de vitales :**

- **Le stock.** `MKT-01` est explicite : *« À chaque ajout de produit, le fournisseur **doit renseigner son stock**. Cette donnée est **vivante** : elle décrémente à chaque vente, alimente le badge "Stock limité", déclenche les alertes et analyses de KAi (`MKT-05`), et conditionne les ventes flash de déstockage. »* Un produit créé sans stock ne peut ni être commandé correctement (`MKT-02`), ni être surveillé par KAi (`MKT-05`).
- **L'unité de vente.** Sans elle, un prix est ininterprétable : « 4 500 FCFA » pour un sac, une tonne ou un mètre cube n'a pas le même sens. Le placeholder du prototype (« Ciment CPA 42.5 — sac 50 kg ») fait porter l'unité par le **nom** du produit, ce qui la rend non exploitable pour le tri, le filtrage et le calcul.

À quoi s'ajoutent : l'absence de **description**, l'absence de l'interrupteur **« Visible dans le Marketplace »** — le statut de publication du produit créé à l'inscription n'est donc **défini nulle part** : publié d'office ou brouillon ? — et l'absence de rappel du **quota** (`MKT-01` : cinq produits gratuits ; ce premier produit consomme la première unité, sans que le compteur soit annoncé).

### 2. Les catégories du parcours ne correspondent pas à celles de la Marketplace

**Écart factuel, vérifié terme à terme.** La liste déroulante de l'écran `f-mat` propose : *Ciment & liants · Agrégats & sable · Fer & acier · Bois & menuiserie · Électricité · Plomberie · Peinture & finitions · Équipements* (8 entrées). Les catégories documentées de MeereoShop (`MKT-01`, état réel) sont : *Gros Œuvre · Structure & Charpente · Menuiseries · Revêtements · Plomberie & CVC · Électricité · Green & Énergie · Mobilier Bureau · Mobilier Maison · Cuisine & SDB · Extérieur & Jardin* (11 entrées).

**Une seule correspondance exacte** (« Électricité ») et une correspondance partielle (« Plomberie » / « Plomberie & CVC »). **Six des huit catégories proposées à l'inscription n'existent pas dans la Marketplace.** Un produit créé à l'inscription serait donc classé dans une catégorie inexistante, ou nécessiterait une table de correspondance qui n'est spécifiée nulle part. **La liste du parcours d'inscription doit être la même que celle de la Marketplace, lue depuis la même source.**

### 3. Aucune catégorie servie n'est déclarée par l'entreprise

`SYS-06` documente, dans l'onglet « Marketplace » des Paramètres fournisseur : *« Nom affiché sur la Marketplace, **catégories servies**, nombre de produits en ligne, visibilité »*. Le parcours ne collecte **jamais** ces catégories servies — à distinguer de la catégorie d'un produit isolé. C'est le pendant fournisseur du défaut relevé en `INS-11` pour les secteurs du professionnel.

### 4. Aucun moyen d'encaissement n'est configuré

`SYS-06` documente l'onglet « Paiements » du fournisseur : *« Configuration des moyens de **réception** : Orange Money, MTN MoMo, Wave. Le fournisseur reçoit **directement** de l'acheteur (`FIN-03` Phase 2 — MEEREO n'encaisse pas, faute d'agrément). »*

**Un fournisseur qui termine l'inscription et publie un produit ne peut donc pas être payé.** Puisque MEEREO n'encaisse pas pour lui, aucun mécanisme de rattrapage n'existe côté plateforme. Ce point est **bloquant pour la première vente**, et aggravé par `INS-08` : le numéro de téléphone, qui **est** l'identifiant de ces trois services, n'est lui-même jamais collecté.

### 5. Aucune zone de livraison n'est définie

`MKT-02` et `SYS-06` (onglet « Livraison ») prévoient délai, modes (Livraison / Retrait client) et **zones de livraison**. Le parcours l'annonce explicitement comme différé (« Catalogue et zones de livraison se complètent depuis votre espace »), ce qui est **acceptable** — à condition qu'une règle empêche une commande d'être passée vers une zone non couverte. Cette règle n'existe pas aujourd'hui.

### Fonctionnement attendu

- **Compléter `f-mat`** avec **unité** et **stock** (obligatoires, conformément à `MKT-01`), et **aligner la liste des catégories** sur celle de la Marketplace, depuis une source unique.
- **Collecter les catégories servies** de l'entreprise à l'étape `f-struct` (symétrique de `INS-11`).
- **Définir le statut de publication** du premier produit et l'annoncer clairement, avec le compteur de quota (« 1/5 produits gratuits »).
- **Distinguer deux niveaux d'achèvement**, et le dire à l'utilisateur : *compte créé* (fin du parcours) et *boutique opérationnelle* (encaissement et livraison configurés). Le message « Votre marketplace est prête […] Vous pouvez commencer à vendre » ne doit s'afficher **que** lorsque le second niveau est atteint.
- **Règle de garde :** un produit ne peut être **publié** sur la Marketplace que si le fournisseur a configuré **au moins un moyen de réception de paiement** et **au moins une zone de livraison ou le retrait client**. À défaut, le produit reste en **brouillon**, avec une liste de ce qu'il reste à faire — jamais un blocage sans explication (`INS-06`).

> **Dépendances :** `MKT-01` (formulaire, stock, quota, catégories), `MKT-02` (commande, livraison), `MKT-03` (espace fournisseur), `MKT-05` (surveillance de stock), `FIN-02`/`FIN-03` (encaissement), `SYS-06` (Paramètres fournisseur), `INS-08` (téléphone), `INS-11` (symétrie professionnel), `QAL-02` (logo sur fiche produit).

> **✅ IMPLÉMENTÉ ET TESTÉ (26/07/2026) — voir Annexe 7.** Les cinq manques sont traités :
> 1. **Unité et stock** ajoutés au premier produit, tous deux obligatoires. Description et statut de
>    publication ajoutés. **Quota affiché** (« 1/5 produits gratuits »).
> 2. **Taxonomie alignée** : la liste vient d'une source unique reprenant **exactement** les 11
>    catégories MeereoShop. Un test verrouille les deux sens — les 11 doivent être proposées, et les
>    6 catégories fantômes de l'ancien écran (`Ciment & liants`, `Agrégats & sable`, `Fer & acier`,
>    `Bois & menuiserie`, `Peinture & finitions`, `Équipements`) **ne doivent plus apparaître**.
> 3. **Catégories servies** collectées à l'étape structure.
> 4. **Moyens de réception** : nouvelle étape « Encaissement & livraison ». Opérateur choisi
>    explicitement parmi Orange Money / MTN MoMo / Wave, numéro **mobile strictement exigé** (un compte
>    Mobile Money ne peut pas être adossé à une ligne fixe).
>    **Décision de conception à connaître :** aucune inférence opérateur ⇄ préfixe téléphonique n'est
>    faite, volontairement — une erreur d'inférence enverrait de l'argent au mauvais opérateur, et le
>    mapping évolue avec la portabilité des numéros.
> 5. **Zones de livraison** exigées dès que le mode « livraison » est actif ; le retrait client seul
>    reste valide sans zone.
>
> **Règle de garde appliquée et vérifiée :** le produit créé à l'inscription est en **brouillon** par
> défaut, et sa publication est décidée **par le serveur**, jamais par le client. L'écran final
> n'annonce la vente que si elle est réellement possible : sinon il affiche « Votre compte est créé »
> et la liste des blocages, **chacun avec un lien actionnable** (`INS-06`). Test dédié vérifiant que la
> mention « commencer à vendre » est bien absente dans ce cas.

---

## `MKT-07` — Étanchéité de la Marketplace : un seul point d'entrée transactionnel
**Statut : RÈGLE + À DÉVELOPPER** *(ajouté v1.48)*

**Origine.** Question posée par MEEREO le 27/07/2026, en réaction à `ANN-06` : *« si on peut lui écrire
un message, on peut aussi demander un devis sans passer par la Marketplace ; sa page n'est qu'une
vitrine ».*

**Le constat était juste, et il révélait un manque dans `ANN-06`.** J'y avais étendu la page publique
au fournisseur **sans examiner quelles actions elle devait porter**. Les deux rôles n'ont pas le même
modèle de transaction : pour le Professionnel, la mise en relation **est** le produit ; pour le
Fournisseur, le produit est un catalogue.

### Pourquoi l'enjeu dépasse largement la commission

MEEREO **ne prélève aucune commission** sur les ventes (`FIN-03` Phase 2). Une vente conclue hors
plateforme ne lui coûte donc **rien aujourd'hui**. Quatre choses se perdent pourtant :

1. la **traçabilité** des commandes, livraisons et litiges (`MKT-02`) ;
2. la **donnée de stock**, dont dépendent les alertes et analyses de KAi (`MKT-05`) ;
3. les **avis vérifiés** — pas de commande, pas d'avis (`AVS-04`) ;
4. **et surtout, la possibilité même de la Phase 3.** `FIN-03` prévoit l'escrow et la commission à
   terme. **Si l'habitude de contourner se prend au lancement, elle ne se corrigera pas** — les usages
   pris à l'ouverture d'une plateforme sont ce qu'il y a de plus difficile à modifier ensuite.

*C'est l'argument décisif : la règle ne protège pas un revenu actuel, elle protège un revenu futur qui
n'existera pas si on la pose trop tard.*

### 🔴 Le principe retenu (décisions du 27/07/2026)

**Le fournisseur n'a qu'un point d'entrée transactionnel : la Marketplace.**

| Chemin | Décision |
|---|---|
| **Page publique** | **« Voir le catalogue »** — action unique. **Aucune messagerie.** |
| **Messagerie** | **Ouverte après commande uniquement** — suivi, livraison, SAV, litige. |
| **Produit « sur devis »** | **Demande de devis sur la Marketplace**, jamais dans la messagerie. |
| **Appel d'offres** | **Le fournisseur n'y répond pas.** Il vend par catalogue. |

**Cohérence avec `MKT-01` :** la Marketplace vend des **produits physiques**, les appels d'offres
portent sur des **services** *(main-d'œuvre, transport, location)*. Un besoin de matériaux se satisfait
au catalogue. **La quatrième décision ne fait qu'appliquer une frontière déjà posée.**

### La contrepartie indispensable : si le contact est fermé, l'information doit répondre

**C'est la condition de viabilité de la règle.** Un acheteur qui ne peut pas poser de question doit
trouver la réponse sur la fiche :

- **zones de livraison, modes et délais** (`MKT-06`) ;
- **stock disponible et unité de vente** (`MKT-06`) ;
- conditions de vente, minimum de commande le cas échéant ;
- certifications, références et avis (page publique, `ANN-06`).

**Un fournisseur dont la fiche est incomplète devient injoignable.** C'est un argument supplémentaire
pour la règle de garde de `MKT-06` — pas de publication sans encaissement ni livraison configurés — et
pour l'obligation de page publique.

### La demande de devis — spécification

Elle vit **sur la Marketplace**, rattachée au produit, et **jamais dans un fil de messagerie** :

- **formulaire structuré** : quantité, unité, délai souhaité, lieu de livraison, précisions libres ;
- crée un objet **Demande de devis** doté d'un statut propre : *émise → chiffrée → acceptée → refusée →
  expirée* ;
- les échanges éventuels se déroulent **à l'intérieur de cet objet**, pas dans une conversation ;
- **une demande acceptée devient une commande** (`MKT-02`) — la continuité est assurée sans jamais
  sortir du circuit.

> **Ce qui distingue un devis d'une conversation :** il a un **objet**, un **état** et une **issue**.
> Une conversation n'a rien de tout cela — c'est précisément pourquoi elle ne peut pas servir de
> support à une négociation commerciale traçable.

**Articulation avec `MKT-02` :** ce point prévoit déjà *« deux modes d'achat selon un seuil global »* —
paiement en ligne ou devis. **La demande de devis décrite ici est le second mode**, désormais outillé.

### ⚠️ Limite de la règle, à assumer

**Une entreprise cumulant Professionnel et Fournisseur (`INS-14`) conserve un bouton « Contacter » au
titre de son activité professionnelle.** Rien n'empêche alors un acheteur de lui demander un prix sur
des matériaux par ce canal.

**Cette brèche ne peut pas être fermée techniquement** sans retirer au professionnel ce qui fait sa
fonction. Trois atténuations, aucune parfaite :

1. la page distingue nettement les deux activités, et le bloc « fournisseur » ne porte que
   « Voir le catalogue » ;
2. les CGU rappellent que les commandes de produits passent par la Marketplace ;
3. un rappel contextuel apparaît dans la conversation si des produits du catalogue y sont évoqués.

**Il faut l'écrire clairement : la règle est étanche pour les fournisseurs purs, poreuse pour les
entreprises à deux rôles.** *Ces dernières resteront probablement peu nombreuses — mais l'exception
doit être connue, pas découverte.*

> **Dépendances :** `ANN-06` (page publique du fournisseur), `MSG-01` (contact d'une entreprise
> référencée — **à restreindre**), `MKT-01` (« sur devis », périmètre produits/services),
> `MKT-02` (deux modes d'achat), `MKT-05` (données de stock), `MKT-06` (complétude de la fiche),
> `AOF-01` (routage des appels d'offres), `AVS-04` (avis vérifiés), `FIN-03` (Phase 3 — **enjeu
> principal**), `INS-14` (cumul de rôles — **limite de la règle**), `INS-21` (modules de page).

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

> **Précision apportée par la décision du 27/07/2026 (`PRJ-12`, `INS-18`).** Le « second niveau » —
> les quatre rôles internes à l'entreprise — **gouverne un accès réel** : chaque employé dispose d'un
> compte et se connecte. Ce n'était pas explicite jusqu'ici, la formulation pouvant se lire comme une
> simple classification descriptive.
>
> **Ce que cela impose :** la granularité de ces quatre rôles, jusqu'ici « à préciser », devient
> **bloquante pour le développement**. Un rôle « Lecteur » qui ne restreint rien n'a aucun sens, et un
> rôle « Collaborateur » mal borné expose des données financières ou contractuelles à des personnes
> qui n'ont pas à les voir.
>
> **Question à trancher en priorité :** un **Collaborateur** voit-il le **budget et les factures** des
> projets auxquels il est affecté ? C'est la case la plus sensible de la matrice — un conducteur de
> travaux a besoin du planning et des documents, pas nécessairement de la marge de son employeur.
> *Point ajouté à l'Annexe 1.*
> **✅ CASE LA PLUS SENSIBLE TRANCHÉE (27/07/2026).**
> **Un Collaborateur ne voit ni le budget ni les factures** des projets auxquels il est affecté. Ces
> objets sont réservés aux rôles **Administrateur** et **Chef de projet**.
>
> **Motif :** un conducteur de travaux a besoin du planning, des documents et du suivi d'avancement —
> **pas de la marge de son employeur**. Le budget d'un chantier révèle la structure de coûts de
> l'entreprise, information qui n'a pas à circuler auprès de chaque personne temporairement affectée.
>
> | Objet | Administrateur | Chef de projet | Collaborateur | Lecteur |
> |---|---|---|---|---|
> | Budget, factures, paiements | Voir · Modifier | Voir · Modifier | **Aucun accès** | **Aucun accès** |
> | Projet, avancement, notes de chantier | Voir · Modifier | Voir · Modifier | Voir · Modifier *(à préciser)* | Voir |
> | Documents | Voir · Modifier | Voir · Modifier | Voir *(à préciser)* | Voir |
>
> **Restent à préciser :** droits d'écriture du Collaborateur sur l'avancement et les documents, et
> périmètre exact du Lecteur. *Moins sensibles — un mauvais réglage y coûte du confort, pas de la
> confidentialité.*
>
> **⚠️ Second niveau à étendre (27/07/2026) :** une entreprise cumulant les rôles Professionnel et
> Fournisseur (`INS-14`) fait porter à ses employés des droits sur **deux périmètres métier**. Un Chef
> de projet accède-t-il au catalogue et aux commandes de l'activité fournisseur ? **La matrice devra
> croiser rôle interne × profil de rôle**, ce qu'elle ne prévoit pas aujourd'hui.
> **✅ Droits résiduels précisés par défaut (27/07/2026).**
> - **Collaborateur** : peut **écrire** sur l'avancement, les tâches, les notes de chantier et les
>   documents **des projets où il est affecté**. C'est son travail quotidien — l'en empêcher viderait
>   le rôle de son sens.
> - **Lecteur** : **lecture seule** sur tout ce qui lui est ouvert, sans exception. Aucune écriture,
>   aucun commentaire, aucun dépôt de document.
> - **Ni l'un ni l'autre** n'accède au budget, aux factures ni aux paiements — décision du 27/07/2026
>   ci-dessus.
> *Ces réglages sont réexaminables : un mauvais choix y coûte du confort, pas de la confidentialité.*
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
>
> **Constat élargi (revue de code, 25/07/2026) :** l'absence de sélecteur de langue, déjà relevée pour les Paramètres (voir plus bas), est **également constatée sur l'ensemble du prototype `meereo_parcours_complet.html`** — connexion, mot de passe oublié, et les trois parcours d'inscription complets. Aucun sélecteur FR/EN, aucun attribut `lang` dynamique, aucun mécanisme d'i18n dans le script. Le point n'est donc pas isolé aux Paramètres : **la surface entière observée jusqu'ici (connexion + onboarding) est unilingue français**, à corriger sur l'ensemble du périmètre au moment de l'implémentation de `SYS-04`, pas seulement dans l'espace connecté.

> **🔴 DÉCISION DE MEEREO (27/07/2026) — L'ANGLAIS EST REPORTÉ. Le lancement se fera en français seul.**
> Cette décision **modifie la présente exigence**, qui imposait *« FR et EN livrés ensemble au
> lancement (pas “FR d'abord, EN plus tard”) »*. Cette phrase est **caduque** à compter de ce jour.
>
> **Constat à l'origine de la décision.** Le sélecteur de langue **existe désormais** dans les
> Paramètres — il était signalé absent au 25/07/2026 — mais **il est inerte** : le sélecteur change
> d'état, l'interface reste intégralement en français. MEEREO confirme **n'avoir jamais vu d'anglais
> nulle part** dans l'application. **Les traductions n'ont donc jamais été produites : le sélecteur est
> une coquille.** Voir `SYS-07`.
>
> ### Ce qui est retiré du périmètre de lancement
>
> - La livraison simultanée FR + EN.
> - Le **sélecteur de langue**, qui doit être **retiré de l'interface** tant qu'il n'a qu'une seule
>   option utile. *Une option qui ne fait rien est plus dommageable que son absence : elle promet une
>   capacité au moment précis où l'utilisateur cherche à contrôler son espace, et la promesse est
>   démentie au premier clic.* Voir `SYS-07`.
>
> ### ⚠️ Ce qui est MAINTENU, et qu'il ne faut pas retirer avec l'anglais
>
> **L'architecture d'externalisation des libellés reste obligatoire.** C'est le point sur lequel je me
> permets d'insister, parce que c'est là que se joue le coût réel :
>
> 1. **Le coût est asymétrique dans le temps.** Externaliser les libellés maintenant coûte peu :
>    c'est une discipline d'écriture. Le faire après coup impose de reprendre **chaque composant** de
>    l'application. La présente exigence l'énonçait déjà : *« L'i18n bien posée dès le départ permet
>    d'ajouter d'autres langues ultérieurement sans refonte. »* **Cet argument reste entièrement
>    valable même si l'anglais ne sort jamais.**
> 2. **Ce n'est plus une question de langue, mais de qualité d'affichage.** La preuve est déjà au
>    dossier : l'application laisse fuir des valeurs techniques brutes — « **signed** » dans la
>    chronologie projet, « **Offer submitted** » dans le fil d'activité (`PRJ-13`, `QAL-04`). **Ces
>    fuites démontrent qu'aucune couche de libellés n'existe aujourd'hui.** Un utilisateur francophone
>    lit donc déjà de l'anglais technique — dans une application censée être unilingue française.
>    **Le besoin d'une table de libellés unique existe indépendamment de l'anglais.**
> 3. **Les formats restent à localiser** : dates, nombres et devise (FCFA) doivent passer par un
>    formatage centralisé, quelle que soit la langue.
>
> **Formulation retenue :** *« Application livrée en français. Architecture de libellés externalisée
> obligatoire. L'anglais est une extension ultérieure, non planifiée à ce jour. »*
>
> ### Ce qu'il faut réexaminer avant d'ouvrir la sous-région
>
> La justification initiale — *« l'anglais sert les partenaires internationaux et l'ouverture régionale
> au-delà de la zone francophone »* — **reste valable dans son principe**. Elle est simplement
> **différée**, pas invalidée. Le périmètre juridique retenu en Annexe 8 étant **Côte d'Ivoire + UEMOA**
> — zone majoritairement francophone —, la décision est cohérente avec le lancement visé. **Toute
> ouverture vers le Ghana, le Nigeria ou une clientèle internationale rouvrira cette question.**
> *Point consigné en Annexe 1.*
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


> **✅ TAILLE MAXIMALE FIXÉE (27/07/2026) : 10 Mo par fichier, 50 Mo pour les plans.**
>
> | Type | Limite |
> |---|---|
> | Photos, documents courants, justificatifs | **10 Mo** |
> | **Plans** — PDF de plans, DWG et formats de CAO | **50 Mo** |
>
> **Motif du régime dérogatoire.** Un plan d'exécution dépasse couramment 10 Mo ; une limite unique
> basse aurait un effet parfaitement contraire au but recherché — **les plans partiraient par WhatsApp
> ou par courriel**, c'est-à-dire hors de la plateforme, hors du Passeport Numérique (`SYS-01`) et hors
> de toute traçabilité. *Une limite qu'on ne peut pas respecter n'est pas une limite : c'est une fuite.*
>
> **À préciser au développement :** la liste exacte des extensions ouvrant droit à la limite élargie,
> et le **message d'erreur en cas de dépassement** — il doit indiquer la limite applicable **et le
> poids du fichier refusé**, faute de quoi l'utilisateur ne saura pas quoi corriger.

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
| Notifications, ~~langue FR/EN~~ *(retiré — `SYS-04`, décision du 27/07/2026)* | **Paramètres › Préférences** |
| Devise, région | **Paramètres › Devise & Région** |
| Équipe *(pro uniquement)* | **Paramètres › Équipe** |
| Abonnement KAi, facturation, moyens de paiement | **Paramètres › Abonnement** |
| Export, suppression de compte | **Paramètres › Données** |
| Zones de livraison, seuil de stock bas, catalogue *(fournisseur)* | **Paramètres › Réglages boutique** |

> Les données de compte éditées dans les Paramètres (nom, coordonnées) **alimentent** la page publique en lecture, mais ne s'y éditent pas. Source unique, affichage multiple.

> **Amendement (26/07/2026) — plusieurs champs de ce tableau n'ont aucune origine dans le parcours d'inscription.** L'audit de traçabilité (**Annexe 6**) a confronté ce tableau, écran par écran, au parcours réel. Résultat : **téléphone** et **ville** (lignes « coordonnées du compte », pour les trois rôles), **catégories servies** (onglet Marketplace du fournisseur) et **moyens de réception Orange Money / MTN MoMo / Wave** (onglet Paiements) sont décrits ici comme existants et éditables, mais **aucun écran d'inscription ne les renseigne jamais**. Un compte créé par le parcours actuel arrive donc dans ses Paramètres avec ces champs structurellement vides. Voir **`INS-08`** (téléphone, ville) et **`MKT-06`** (catégories servies, encaissement). Le principe « source unique, affichage multiple » énoncé ci-dessus suppose qu'une source **existe** : ces quatre champs n'en ont pas.

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

- **Préférences.** Existant : notifications email, notifications push, **rappels planning**, **résumé hebdomadaire**. → ~~À ajouter : le sélecteur de langue FR/EN~~
  **[CORRIGÉ 27/07/2026]** Le sélecteur **a été ajouté depuis**, mais il est **inerte** — aucune traduction n'existe. **Décision : le retirer** (`SYS-04`, `SYS-07`). Reste à vérifier que les **quatre autres réglages de cet onglet sont réellement enregistrés**, ce que rien ne garantit.
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

> **⚠️ Manque relevé (27/07/2026) — la navigation principale n'est documentée nulle part.**
> Le présent point détaille la structure des **Paramètres** par rôle. Il n'existe en revanche **aucune
> table de référence de la navigation principale** — sections, entrées, ordre — pour les trois espaces.
> Elle n'apparaît aujourd'hui que dans les captures d'écran.
>
> **Conséquence immédiate :** la décision de déplacer le module financier sous BUSINESS (`QAL-06`) **ne
> peut être consignée nulle part**. Il manque une table de navigation au même titre que celle des
> Paramètres. **À produire — c'est le prérequis de toute décision d'architecture d'information.**
> **✅ ESPACE D'UNE ENTREPRISE À DEUX RÔLES — TRANCHÉ (27/07/2026).**
> **Un espace unique, sections fusionnées.** Une entreprise cumulant Professionnel et Fournisseur
> dispose d'**une seule navigation**, où figurent les sections des deux métiers : Marchés **et** Mes
> produits, Clients **et** Commandes, Appels d'offres **et** Boutique.
>
> **Motif :** l'entreprise est une, son espace aussi. Une bascule entre deux espaces obligerait
> l'utilisateur à savoir d'avance dans lequel se trouve ce qu'il cherche — friction quotidienne pour un
> gain d'ordre visuel.
>
> **Ce que cela impose :**
> - Les **Paramètres** fusionnent leurs onglets. Le professionnel en a 7, le fournisseur 8 ; les
>   communs *(Profil, Sécurité, Préférences, Abonnement, Données, Notifications)* ne sont **pas
>   dupliqués**. S'y ajoutent les onglets propres à chaque métier : Équipe côté professionnel,
>   Marketplace / Paiements / Livraison côté fournisseur.
> - La **navigation principale** s'allonge. **Elle n'est toujours documentée nulle part** — manque déjà
>   signalé ci-dessus. La table de référence devient un prérequis, non plus un confort.
> - **`SYS-02` doit croiser rôle interne × profil de rôle** : un Chef de projet accède-t-il au catalogue
>   et aux commandes de l'activité fournisseur ? *À préciser lors de l'implémentation.*

> **🔴 « ESPACE UNIQUE » AMENDÉ (27/07/2026) — deux comptes liés, un sélecteur.**
>
> La décision du 27/07 *(Annexe 1, point 2)* retenait un **espace unique aux sections fusionnées** pour
> une entreprise à deux rôles. **MEEREO retient désormais deux comptes distincts, rattachés à la même
> entreprise, entre lesquels l'utilisateur bascule sans se reconnecter.**
>
> **Ce que la bascule préserve de la décision initiale :** l'utilisateur n'a **pas** à se reconnecter
> pour changer d'activité. *L'unicité d'expérience est obtenue par le sélecteur plutôt que par la
> fusion des écrans — ce qui évite d'avoir à concilier une structure à 7 onglets et une autre à 8.*
>
> **⚠️ Contrainte de sécurité impérative.** Un sélecteur de compte est **une élévation de privilèges**.
> **Le lien ne doit jamais se déduire d'une égalité de RCCM constatée après coup** — sinon toute
> personne créant un compte avec le RCCM d'une entreprise obtiendrait l'accès au compte existant, et
> **`INS-20` deviendrait une prise de contrôle.** Le second compte **ne peut être créé que depuis
> l'espace du premier**, par un utilisateur déjà authentifié. Toute bascule est **journalisée**.
>
> **🔴 POINT OUVERT, BLOQUANT POUR LE DÉVELOPPEMENT.** `INS-09` impose l'unicité de l'adresse e-mail
> sur les comptes actifs. **Deux comptes liés ne peuvent donc pas partager la même adresse** — on
> exigerait une seconde boîte mail du dirigeant, **au moment précis où il ajoute une activité**.
> **Trois issues sont possibles ; aucune n'est retenue à ce jour** *(voir Annexe 1)*.

---

## `SYS-07` — Paramètres › Préférences : options sans effet et absence de validation
**Statut : À CORRIGER** *(ajouté v1.36)*

**Constat (27/07/2026, signalé par MEEREO pour les espaces Client et Professionnel).** Deux défauts
distincts sur le même écran, à ne pas confondre.

### 1. Le sélecteur de langue est inerte

Le sélecteur change bien d'état visuel, mais **l'interface reste intégralement en français**. MEEREO
confirme **n'avoir jamais vu d'anglais** dans l'application.

**Diagnostic : ce n'est pas un défaut, c'est une fonctionnalité non construite dont l'interface a été
exposée.** Le sélecteur a été ajouté — il était encore signalé absent au 25/07/2026 — mais les
traductions n'ont jamais été produites. Il n'y a donc **rien à déboguer** : il n'existe aucun contenu
anglais à afficher.

**Décision prise par MEEREO (voir `SYS-04`) : le français suffit au lancement.**

**Attendu :** **retirer le sélecteur de l'interface**, dans les deux espaces, plutôt que de le laisser
inopérant. *Une option qui ne fait rien est plus dommageable que son absence.* L'utilisateur va dans
les Paramètres précisément pour contrôler son espace : c'est le pire endroit pour lui présenter une
commande qui ne répond pas. Il en conclura, à raison, que d'autres réglages de cette page sont peut-être
tout aussi décoratifs.

### 2. Aucun moyen de valider les changements sur cet écran

**Point soulevé par MEEREO, et qui dépasse la seule question de la langue.** L'onglet Préférences ne
comporte **aucun bouton d'enregistrement**, alors que l'onglet **Mon profil du même écran en comporte
un** (« Enregistrer », visible sur la capture des Paramètres client).

**Deux conventions coexistent donc dans un même écran de Paramètres**, sans que rien ne l'indique à
l'utilisateur. Il ne peut pas savoir si son changement a été pris en compte.

**Deux solutions sont acceptables, une seule doit être retenue :**

| Solution | Ce qu'elle exige |
|---|---|
| **Bouton d'enregistrement explicite** | Cohérent avec l'onglet Mon profil. Le bouton reste inactif tant que rien n'a changé, et une confirmation apparaît après enregistrement. |
| **Enregistrement automatique** | Acceptable, **à condition d'un retour visible immédiat** (« Enregistré ») et d'un traitement de l'échec réseau — sans quoi l'utilisateur croit avoir réglé quelque chose qui ne l'est pas. |

**Ce qui n'est pas acceptable, c'est l'état actuel : mélanger les deux conventions dans un même écran,
sans aucun retour.** Le silence après une action est ambigu — l'utilisateur ne peut pas distinguer un
succès d'un échec.

> **Vérification demandée au-delà de la langue :** les autres options de cet onglet — notifications
> e-mail, notifications push, rappels planning, résumé hebdomadaire — **sont-elles réellement
> enregistrées et appliquées** ? Le sélecteur de langue étant inerte, **rien ne garantit que les autres
> le soient**. Il serait imprudent de corriger la langue sans tester les quatre autres réglages
> du même écran.

> **Dépendances :** `SYS-04` (décision : français seul au lancement), `SYS-06` (structure des
> Paramètres — table à amender), `AVS-02` (notifications : réglages du même onglet), `INS-06`
> (une action doit toujours produire un retour explicite).

---

# CONCLUSION

Les développements respecteront : cohérence entre profils ; synchronisation temps réel ; respect strict des workflows métier ; performance ; sécurité et gestion des droits ; qualité rédactionnelle ; UX fluide et homogène multi-navigateurs.

Chaque module (**Cockpit Projet, Annuaire, CRM, Messagerie, Appels d'offres, IA KAI, Gestion documentaire, Page professionnelle publique**) doit fonctionner de manière **intégrée et transparente**.

---

# ANNEXE 1 — Décisions à trancher & dépendances

### À trancher avant développement

> # ✅ TOUS LES POINTS OUVERTS SONT CLOS (27/07/2026)
>
> **Dix-neuf points restaient ouverts.** Douze ont été **arbitrés par MEEREO** ; sept ont été **réglés
> par défaut**, avec une valeur défendable et réexaminable, signalée comme telle dans le point concerné.
>
> **Aucun arbitrage produit ne bloque plus le développement.**

### Les douze arbitrages rendus par MEEREO

| # | Point | Décision |
|---|---|---|
| 1 | Changement de rôle (`INS-14`) | **Pas de retrait de profil.** Pour cesser une activité : supprimer le compte et en recréer un. Le cumul rend ce cas rare. |
| 2 | Espace d'une entreprise à deux rôles (`SYS-06`) | **Espace unique, sections fusionnées.** |
| 3 | Tarif KAi Pro en cumul (`FIN-02`) | **Le plus élevé — 39 000 FCFA/mois.** N'encourage pas à fractionner en deux structures. |
| 4 | Structure de l'annuaire (`ANN-06`) | **Un annuaire unique, filtre par rôle.** Le titre doit changer. |
| 5 | Vérification e-mail (`INS-09`) | **Différée + porte de correction** — cette porte reste **à construire**. |
| 6 | Comptes employés (`FIN-02`) | **Inclus, sans limite de nombre.** |
| 7 | Budget après signature (`FIN-01`) | **Modifiable par le pro, client notifié** — avec historisation complète. |
| 8 | Projets publiés (`INS-21`) | **Anonymisés par défaut.** Nom et montant sur accord explicite du client. |
| 9 | Page publique du fournisseur (`ANN-06`, `INS-03`) | **Obligatoire**, comme celle du professionnel. |
| 10 | Blocage d'un interlocuteur (`MSG-09`) | **Après clôture uniquement.** |
| 11 | Type de projet dans les avis (`AVS-04`) | **Affiché systématiquement.** Risque résiduel accepté. |
| 12 | Visibilité publique d'un employé (`INS-18`) | **Non public par défaut.** |

### Les sept points réglés par défaut

| Point | Valeur retenue |
|---|---|
| Durée du brouillon (`INS-13`) | **30 jours** |
| Étape logo (`INS-12`) | **Franchissable** — le repli monogramme est garanti |
| Instantané d'identité (`AVS-06`) | **Nom + qualité**, figés à la signature du marché |
| Export clients (`AVS-05`) | Réintroduction **conditionnée à la journalisation** — prérequis, non arbitrage |
| Forme des avatars (`QAL-07`) | **Carré arrondi** = structure · **rond** = personne |
| Blocage : périmètre et retour (`MSG-09`) | **Fil direct uniquement** · **mention neutre** à la partie bloquée |
| Droits résiduels (`SYS-02`) | Collaborateur : **écrit** sur ses projets · Lecteur : **lecture seule** |

### 🔴 Correction de la présente annexe (27/07/2026) — une affirmation était fausse

**L'annexe affirmait ci-dessus : *« Aucun arbitrage produit ne bloque plus le développement. »*
C'était inexact, et l'erreur est de ma part.**

**`FIN-02` portait une contradiction interne non résolue** — le point affirmait un encaissement des
petits achats Marketplace par MEEREO, quand `FIN-03` et `SYS-06` disaient l'inverse — **et je ne l'ai
jamais remontée dans la présente annexe** en la clôturant. Le point concerné énonçait pourtant lui-même
que *« tant que ce point n'est pas tranché, les CGV Marketplace ne doivent pas être publiées »*.

> **Ce que cet oubli enseigne sur la méthode.** Une contradiction relevée **à l'intérieur** d'un point
> n'a pas été vue par l'annexe qui recense les points ouverts. **Un défaut consigné au bon endroit mais
> non remonté à l'inventaire équivaut, en pratique, à un défaut non consigné.** *Toute réserve ouverte
> dans un code doit apparaître ici, sans exception.*

### Les huit arbitrages du 27/07/2026 (seconde session)

| # | Point | Décision |
|---|---|---|
| 13 | **Encaissement Marketplace** (`FIN-02`) | **En direct acheteur → fournisseur aujourd'hui**, puis **par l'API MEEREO une fois l'agrément obtenu**. *Lève la réserve qui bloquait la publication des CGV.* |
| 14 | Critères d'évaluation (`AVS-07`, `AVS-01`) | **Quatre**, dont *Professionnalisme*. Liste close. |
| 15 | Pondération (`AVS-07`) | **Poids égal**, 25 % chacun. |
| 16 | Modification d'un avis par son auteur (`AVS-07`) | **Jamais.** *Contrepartie obligatoire : confirmation avant envoi.* |
| 17 | Lexique des rôles (`QAL-08`) | **Deux notions :** *Professionnel* = titulaire · *Intervenant* = corps de métier ajouté. **« Prestataire » et « Entreprise » supprimés** comme libellés de rôle. |
| 18 | Photo de profil du client | **Propagée** en messagerie, sur les avis déposés et dans les notifications. |
| 19 | Taille des fichiers (`SYS-05`) | **10 Mo**, **50 Mo pour les plans**. |
| 20 | Principe de commission (`FIN-03`) | **Taux unique** sur toutes les ventes. Taux à fixer plus tard. |

**Un point réglé par défaut :** l'**arrondi** de la note globale — *une décimale, arrondi arithmétique*,
identique sur tous les écrans (`AVS-04`).

### ⚠️ Photo de profil du client : ce que la décision 18 implique

La photo suit le principe de source unique de `QAL-02` et le composant de `QAL-07`. **Elle apparaît
donc en messagerie, sur les avis déposés et dans les notifications.**

> **Une tension apparente, qui se résout par un principe simple.** `INS-21` **anonymise le client** sur
> les projets publiés par le professionnel, alors que la présente décision **l'expose** — nom et photo —
> sur les avis qu'il dépose. **Ce n'est pas contradictoire :**
>
> | Situation | Qui publie | Règle |
> |---|---|---|
> | Projet en portfolio | **Le professionnel**, sur un tiers | **Anonyme** sauf accord |
> | Avis déposé | **Le client**, sur lui-même | **Nominatif** |
>
> **On protège la personne dont un autre parle ; on n'a pas à protéger celle qui parle d'elle-même.**
>
> **Conséquence à implémenter :** au moment du dépôt, le client doit **voir comment son avis
> apparaîtra** — photo et nom compris. *Un avis nominatif déposé sans que l'auteur ait su qu'il le
> serait poserait un problème d'information au sens de la loi n° 2013-450.*

### 🔴 Hébergement et sous-traitance de KAi (27/07/2026) — état déclaré et ce qui manque

**Réponses de MEEREO :** pays d'hébergement — *« je ne sais pas encore »* · sous-traitance de KAi —
*« sécurité et data de MEEREO : interne ; le reste étranger »*.

**Ce que ces réponses établissent :** une partie des traitements s'effectue **hors de Côte d'Ivoire**.
**Le régime des transferts de la loi n° 2013-450 s'applique donc**, et la Politique de confidentialité
doit comporter une section transferts — elle ne peut pas rester vide.

> **⚠️ Une ambiguïté que je ne lève pas de moi-même.** Le mot **« interne »** peut signifier deux choses
> **qui n'ont pas les mêmes conséquences juridiques** :
>
> | Lecture | Conséquence |
> |---|---|
> | *Infrastructure propre à MEEREO*, quel que soit le pays | **Ne dit rien du régime des transferts** — la loi n° 2013-450 s'intéresse au **territoire**, pas à la propriété du serveur |
> | *Hébergé en Côte d'Ivoire* | Aucun transfert à déclarer pour cette partie |
>
> **La loi raisonne en territoire, pas en propriété.** Un serveur appartenant à MEEREO mais situé à
> l'étranger constitue un transfert. **Je ne tranche pas laquelle des deux lectures est la bonne : la
> réponse doit venir de MEEREO.**

**Trois informations restent nécessaires avant publication des textes :**

1. le **pays** d'hébergement des données de la plateforme ;
2. l'**identité et la localisation** du prestataire d'IA auquel KAi fait appel ;
3. **quelles données lui sont transmises** — un prompt contenant le budget, l'adresse d'un chantier ou
   le nom d'un client n'est pas un traitement anodin.

> **Conséquence à assumer : les textes juridiques ne sont pas publiables en l'état.** Ce n'était pas
> le cas des CGV, débloquées par `FIN-02` — **c'est le cas de la Politique de confidentialité et des
> Mentions légales.** *Ce point ne relève ni d'un arbitrage produit ni d'un avocat : il relève d'un
> choix d'infrastructure que MEEREO doit arrêter.*

### ⚠️ Ce qui reste — et qui n'est pas un arbitrage produit

**Trois chantiers subsistent, mais aucun n'attend une décision de MEEREO :**

1. **Validation juridique des textes** (Annexe 8) — relève d'un avocat inscrit au barreau de Côte
   d'Ivoire, pas d'un arbitrage produit. **42 marqueurs `[[À COMPLÉTER]]`** *(compte vérifié le 27/07/2026 ; le chiffre de 37 annoncé précédemment était erroné)* portent sur des
   informations factuelles : identité de la société, hébergeur, **pays d'hébergement des données**.
2. **Déclaration ARTCI** — obligation légale préalable à tout traitement de données personnelles.
3. **Décisions de conception à prendre pendant le développement** : modules propres au fournisseur
   (`ANN-06`), croisement rôle interne × profil de rôle (`SYS-02`), table de référence de la
   navigation principale (`SYS-06`). *Ce sont des choix d'implémentation, à faire au moment de coder.*

---

### Historique des points antérieurement clos



**Aucun point fonctionnel ne reste ouvert.** Les derniers arbitrages ont été tranchés en v1.26 (voir journal). Ne subsistent que :

- des **décisions business chiffrées** — montants du quota, des ventes flash, du sponsoring et de l'abonnement fournisseur (`MEEREO_Grille_Tarifaire.md`, à valider par le terrain) ;
- des **validations professionnelles** — 5 sujets à faire arbitrer par un juriste et un expert paiement avant mise en ligne (`MEEREO_Questions_Juriste_Paiement.md`).

*Historique des points résolus :* `MSG-01` (bouton contact, v1.16) · `FIN-01` (phases, dépassement de budget, v1.26) · `NAV-05` (points d'entrée Paramètres, v1.26) · `MKT-01` (produit impayé, périmètre services, v1.26) · `AVS-03` (factures impayées, v1.26) · `SYS-04` (multilingue, v1.15).

> **Correction (25/07/2026) — deux points rouverts par la revue du prototype `meereo_parcours_complet.html` :** l'affirmation ci-dessus n'est plus exacte telle quelle. Deux points fonctionnels, non identifiés avant cette revue, restent à trancher :
>
> 1. **Photo de profil du client, présente ou non à l'inscription.** Le journal v1.2 (livrable de design, ligne « Client : plus de RCCM ; photo de profil optionnelle ») **décrit** un champ photo optionnel pour le client. La lecture directe du code du prototype ne montre **aucun champ photo** sur l'écran d'inscription commun (`s-account`), pour aucun des trois rôles. Écart entre la description du livrable et le code livré : soit le champ a été retiré depuis, soit la description de v1.2 était anticipée et jamais implémentée dans ce prototype. **À trancher :** le client doit-il pouvoir ajouter une photo de profil à l'inscription (et si oui, à quelle étape), et si non, corriger la description erronée du journal v1.2 ?
>    - **Sous-question ajoutée (25/07/2026), une fois la décision d'existence prise :** si la photo de profil client est retenue, **où doit-elle être affichée** ensuite, selon le même principe de source unique que `QAL-02` (logo Pro/Fournisseur) ? Candidats identifiés par symétrie avec `QAL-02` mais **non tranchés** : conversations/messagerie (le client y est identifié par nom seul aujourd'hui), avis laissés par le client (`AVS-01` ne mentionne aucune photo d'auteur), notifications. **Ne pas trancher cette sous-question avant la question 1** — il ne peut pas y avoir de règle de propagation pour une donnée qui n'existe pas encore.
> 2. **Politique de complexité du mot de passe.** Ni `INS-06` ni le prototype ne définissent de règle au-delà de « 8 caractères minimum » (mention visible uniquement sur l'écran de réinitialisation, `s-reset` — absente de l'écran d'inscription `s-account`). **À trancher :** règle de complexité exacte (majuscule/chiffre/caractère spécial exigés ou non), et cohérence du message affiché entre inscription et réinitialisation.
>
> **Mise à jour (27/07/2026) — point 1 (photo de profil client) : la production tranche la question.**
> La capture des **Paramètres › Mon profil** de l'espace client montre une **photo de profil présente et
> affichée**, reprise dans l'en-tête de navigation. Le champ **existe donc en production**, contrairement
> à ce que montrait le prototype. **La question d'existence est close ; la sous-question de propagation
> ne l'est pas** : reste à décider où cette photo doit apparaître (conversations, avis laissés,
> notifications), selon le principe de source unique de `QAL-02`. Même remarque de méthode que pour
> `INS-08` : l'audit portait sur le prototype, la production diffère.
>
> **✅ POINT 2 CLOS (27/07/2026) — politique de mot de passe arrêtée.**
> **Dix caractères minimum, au moins une lettre et un chiffre. Ni majuscule ni caractère spécial
> imposés** — les règles de composition complexes sont déconseillées par le NIST (SP 800-63B) : elles
> produisent des contournements prévisibles sans gain réel. **Cette décision débloque `INS-06`,
> `INS-07` et `INS-09`.**
> **Le code déjà livré (Annexe 7) implémente exactement cette politique** : l'hypothèse devient
> décision, aucune modification n'est requise.
>
> **Historique (26/07/2026) — point 2 alors ouvert et bloquant pour trois implémentations.** La politique de mot de passe conditionne à présent `INS-06` (inscription), `INS-07` (réinitialisation) et `INS-09` (récupération de compte). Le prototype v2 code « 8 caractères » à deux endroits distincts, ce qui figera un choix par défaut si l'arbitrage tarde. **Point 1 (photo de profil client) également toujours ouvert :** la refonte du parcours du 26/07/2026 ne l'a pas ajoutée — le constat de v1.28/v1.29 reste valable à l'identique.

> **Ajout (26/07/2026) — cinq points ouverts issus de l'audit de traçabilité du parcours d'inscription (Annexe 6).** Ils portent sur des choix de modèle ou de conformité, et **doivent être arbitrés avant tout développement** — les coder « par défaut » créerait une dette structurelle :
>
> 3. **Cumul et changement de rôle (`INS-14`).** Un titulaire peut-il être à la fois Professionnel et Fournisseur, et peut-il changer de rôle après inscription ? **Conséquence non voulue à arbitrer explicitement :** l'unicité stricte du RCCM posée par `INS-01` (*« un numéro déjà associé à une entreprise ne peut jamais être réutilisé par une autre »*) **interdit mécaniquement** à une même entreprise d'ouvrir deux comptes de rôles différents. Soit cette conséquence est assumée, soit `INS-01` doit distinguer « une entreprise » de « un compte ». Impacte le modèle de données, `SYS-02` et `SYS-06`.
> 4. **Vérification de l'adresse e-mail : bloquante ou différée (`INS-09`).** Confirmation exigée avant l'accès à l'espace, ou espace en accès restreint tant que l'adresse n'est pas confirmée ? Le premier modèle protège mieux, le second réduit l'abandon. Dans les deux cas, une porte de correction de l'adresse est obligatoire.
> 5. **Caractère bloquant de l'étape logo (`INS-12`).** Aucun compte Pro/Fournisseur sans logo, ou franchissement autorisé avec **repli automatique par monogramme d'initiales** ? Le repli rend le blocage inutile et satisfait `QAL-02` dans tous les cas.
> 6. **CGU, politique de confidentialité et régime juridique (`INS-10`).** Rédaction à produire, et régime applicable à déterminer (Côte d'Ivoire, et RGPD si des utilisateurs européens sont visés — la mention « RGPD » est aujourd'hui **affichée à l'écran de connexion sans qu'aucune obligation correspondante ne soit cadrée dans le référentiel**).
>    - **Mise à jour (26/07/2026) — périmètre arbitré et textes rédigés.** Périmètre retenu par MEEREO :
>      **Côte d'Ivoire + UEMOA**, **sans** RGPD. Les quatre textes figurent en **Annexe 8**.
>      **Conséquence immédiate à traiter : la mention « RGPD » doit être retirée de l'écran de
>      connexion.** Afficher une conformité qu'on n'assume pas est une allégation vérifiable, donc un
>      risque en soi — remplacer par une mention exacte, par exemple « Données protégées ·
>      Loi n° 2013-450 ». **Reste ouvert :** la validation par un avocat, et la revue locale préalable
>      à toute ouverture commerciale dans un autre État de l'UEMOA.
> 7. **Durée de validité du brouillon d'inscription (`INS-13`).** Proposition : 30 jours. À confirmer.
> 10. **Granularité des quatre rôles internes (`SYS-02`, `INS-18`, ajouté 27/07/2026).** Devenue
>     **bloquante** depuis que chaque employé dispose d'un compte. Question la plus sensible : un
>     **Collaborateur voit-il le budget et les factures** des projets où il est affecté ?
> 11. **Tarification des comptes employés (`INS-18`, ajouté 27/07/2026).** Aucune tarification par
>     utilisateur n'existe : l'abonnement est attaché au compte (`FIN-02`). Une entreprise de 18
>     collaborateurs ouvrirait donc 18 accès sans surcoût. **Voulu, plafonné, ou facturé par siège ?**
> 12. **Modification du budget après signature (`FIN-01`, ajouté 27/07/2026).** Qui peut modifier le
>     budget partagé une fois le marché signé, et avec quelle traçabilité ? Un montant contractuel
>     modifiable unilatéralement n'a aucune valeur.
> 14. **Modalités du blocage (`MSG-09`, ajouté 27/07/2026).** Quatre sous-questions, à trancher avant
>     développement : blocage possible **pendant un projet en cours** ou seulement après clôture
>     *(recommandation : après clôture)* · s'applique-t-il au **groupe projet** ou au seul fil direct
>     *(recommandation : fil direct)* · **que voit la partie bloquée** *(recommandation : mention
>     neutre, pas un silence)* · faut-il ajouter « **bloquer** » à la matrice `SYS-02` ?
> 17. **Espace d'une entreprise à deux rôles (`INS-14`, `SYS-06`, ajouté 27/07/2026).** Le
>     Professionnel a 7 onglets de Paramètres, le Fournisseur 8. **Que voit une entreprise qui cumule
>     les deux rôles ?** Espace unifié, ou bascule entre deux espaces ? Impacte aussi la navigation
>     principale et la matrice `SYS-02`, qui devra croiser **rôle interne × profil de rôle**.
> 18. **Tarification KAi Pro d'une entreprise à deux rôles (`FIN-02`, ajouté 27/07/2026).**
>     L'abonnement est tarifé par rôle — Professionnel 19 900, Fournisseur 39 000 FCFA/mois. **Quel
>     tarif pour une entreprise qui cumule ?** Le plus élevé, la somme, ou un tarif « double
>     activité » ? Question de revenu, pas seulement de modèle.
> 16. **Instantané d'identité côté projet (`AVS-06`, ajouté 27/07/2026).** La suppression d'une fiche
>     client rattachée à un projet étant autorisée, le projet doit conserver un **instantané immuable**
>     du nom du client. **À préciser :** quels champs exactement sont figés, et à quel moment — à la
>     signature du marché, ou à la suppression de la fiche ?
> 15. **Réintroduction de l'export clients (`AVS-05`, ajouté 27/07/2026).** Le bouton est supprimé.
>     Sa réintroduction suppose une **journalisation** de chaque export (auteur, date, volume). À
>     traiter dans un second temps.
> 13. **Visibilité par défaut d'un employé sur la page publique (`INS-18`, ajouté 27/07/2026).**
>     Proposition retenue : **non public par défaut**. À confirmer.
>
> **Points CLOS le 27/07/2026 — second lot :** **politique de mot de passe** *(pt 2 — 10 caractères,
> au moins une lettre et un chiffre ; ouvert depuis la v1.28, il débloque `INS-06`, `INS-07` et
> `INS-09`)* · **cumul de rôles** *(pt 3 — retenu : une entreprise peut être Professionnel et
> Fournisseur ; l'unicité du RCCM porte sur l'entreprise)* · **granularité des rôles internes**
> *(pt 10 — un Collaborateur n'accède ni au budget ni aux factures)*.
>
> **Points CLOS par les arbitrages du 27/07/2026 :** budget d'appel d'offres *(fourchette min/max
> obligatoire et visible)* · date de clôture *(libre, fermeture automatique, sans prolongation)* ·
> nature du budget projet *(partagé avec le client)* · circuit de la facture *(émise par le pro,
> paiement déclaré par le client)* · statut des membres d'équipe *(comptes utilisateurs)*.
>
> 9. **Réouverture du multilingue (`SYS-04`, ajouté 27/07/2026).** L'anglais est **reporté** : le
>    lancement se fera en français seul. La justification initiale — partenaires internationaux et
>    ouverture au-delà de la zone francophone — **reste valable dans son principe, elle est différée**.
>    **À réexaminer avant toute ouverture** vers le Ghana, le Nigeria ou une clientèle internationale.
>    **Condition posée pour que ce report reste réversible à coût raisonnable :** l'architecture
>    d'externalisation des libellés doit être **maintenue dès maintenant** — sans quoi la réouverture
>    imposera de reprendre chaque composant.
> 8. **Affichage du type de projet dans les avis publics (`AVS-04`, ajouté 26/07/2026).** L'affichage
>    du type de projet réalisé enrichit l'avis, mais **expose une information sur le chantier d'un
>    client**. Sur un marché où les projets sont peu nombreux, le croisement type + date +
>    professionnel peut suffire à identifier le maître d'ouvrage. **À trancher :** affichage
>    systématique, ou subordonné à l'accord du client recueilli au dépôt de son avis ? La seconde
>    option ne coûte qu'une case à cocher et évite d'avoir à revenir en arrière sur des avis déjà
>    publiés.
>
> **Mise à jour (26/07/2026) — quatre de ces points ont reçu une valeur PROVISOIRE dans le code.**
> Le lot d'implémentation `P1/P2` (Annexe 7) ne pouvait pas avancer sans trancher. Ces valeurs sont
> **des hypothèses, pas des décisions**, chacune isolée dans un seul endroit du code pour qu'un
> arbitrage contraire coûte une ligne :
>
> | Point | Valeur codée | Où la changer |
> |---|---|---|
> | Politique de mot de passe (pt 2) | 10 caractères, ≥ 1 lettre, ≥ 1 chiffre | objet `PASSWORD_POLICY` |
> | Vérification e-mail (pt 4) | **Différée** | `emailVerifiedAt = null` à la création |
> | Durée du brouillon (pt 7) | 30 jours | constante `DRAFT_TTL_DAYS` |
> | Unités de vente (`MKT-06`) | 4 citées + 7 proposées | tableau `PRODUCT_UNITS` |
>
> ⚠️ **Le point 4 appelle une vigilance particulière.** La vérification différée n'est acceptable
> **que si** la porte de correction de l'adresse existe. **Elle n'est pas encore développée.** Tant
> qu'elle manque, une faute de frappe dans l'e-mail reste irrattrapable — l'impasse visée par `INS-09`
> n'est donc **pas fermée**, malgré le code livré.
>
> **Deux points restent entiers, sans valeur provisoire possible :** le cumul et le changement de rôle
> (pt 3, `INS-14` — il touche le modèle de données) et la rédaction des CGU et du régime juridique
> (pt 6 — il relève d'un juriste, pas du code).

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

### v1.52 — 27 juillet 2026 — *Lot : revue de développement et mise à niveau de l'onboarding*

> **Origine.** Revue du dossier de fiches par l'équipe de développement, et relecture du code
> d'onboarding livré au regard des vingt-et-une versions parues depuis.

## 🔴 Une contradiction interne du référentiel, relevée par la revue et non par moi

**`MSG-07`/G1 et `MSG-08` se contredisaient**, et aucun amendement ne les départageait : le premier
posait que le groupe projet **étend** la conversation unique *(« cela ne crée pas une conversation
séparée »)*, le second que le fil direct **coexiste** avec le groupe.

**✅ Arbitrage : fusion tant qu'il n'y a qu'un professionnel, séparation dès le premier intervenant.**

| Situation | Objets |
|---|---|
| Titulaire seul | **Un seul fil** — le fil direct sert de fil de projet. Aucun groupe |
| Un intervenant ajouté | **Deux objets** — groupe projet **+** fil direct privé Client ↔ Professionnel |

> **Ce que la règle règle par construction :** dans le cas majoritaire — un client, un professionnel —
> **il ne peut pas y avoir de doublon puisqu'il n'y a qu'un objet.** Le défaut de production disparaît
> sans qu'aucune règle de déduplication ait à être écrite.
>
> **Point d'implémentation décisif :** à la séparation, **l'historique reste dans le fil direct** et le
> groupe démarre vide. *Le déplacer exposerait aux intervenants des échanges commerciaux — prix,
> négociation, différends — qui ne les regardent pas.*

## Deux erreurs de ma part, corrigées

**`MKT-04` — j'avais exclu le sponsoring du MVP.** J'avais déduit de *« monétisation = abonnement KAi
Pro »* qu'aucun autre revenu n'était actif. **La déduction était fausse : la publicité est déjà payée en
production.** `FIN-03` Phase 1, qui compte sur ce revenu dès le lancement, **était exact — c'est mon
périmètre qui ne l'était pas.**

**`INS-02` — critère de recette désaligné.** Ma recette testait le repli monogramme, qui relève de
`INS-12`. Le présent point régit **l'unicité du logo actif**, pas son existence. Corrigé.

**Tarif fournisseur :** la série 9 900 · 19 900 · **39 000** rompt le motif en « 900 ». **MEEREO
confirme 39 000 — la rupture est délibérée.** *Consigné pour que la question ne soit pas reposée.*

## Mise à niveau de l'onboarding — six décisions

| Point | Décision |
|---|---|
| `INS-20` `INS-01` | **L'identité légale passe du compte à une entité `Entreprise`** unique |
| `INS-20` | **Tous les doublons de RCCM suspendus**, y compris le plus ancien |
| `INS-14` `SYS-06` | **Deux comptes liés** à une même entreprise, **avec sélecteur** — amende « espace unique » |
| `MKT-01` `FIN-04` | **Mode de prix explicite** — le zéro cesse de signifier « sur devis » |
| `INS-12` `QAL-07` | **Monogramme calculé à l'affichage**, jamais stocké |
| `INS-09` | **Correction de l'adresse e-mail depuis l'espace connecté** |

> **Le déplacement de l'identité légale est le point structurant.** Tant que l'unicité portait sur le
> profil, **autoriser le cumul revenait mécaniquement à autoriser les doublons.** Le déplacement
> réconcilie les deux exigences ; rien d'autre ne le faisait.

> **⚠️ Contrainte de sécurité, à ne pas traiter comme un détail.** Un sélecteur de compte est une
> **élévation de privilèges**. Si le lien se déduisait d'une égalité de RCCM, **`INS-20` deviendrait une
> prise de contrôle de compte.** Le second compte ne peut naître que **depuis l'espace du premier**.

### 🔴 Un point ouvert, bloquant

**Deux comptes liés ne peuvent pas partager une adresse e-mail** *(`INS-09`)*. On exigerait une seconde
boîte mail du dirigeant, au moment précis où il ajoute une activité. **Trois issues sont possibles,
aucune n'est retenue** — voir `SYS-06` et l'Annexe 1.

**Amendements :** `MSG-04` · `MSG-07` · `MSG-08` · `MKT-04` · `FIN-02` · `INS-20` · `SYS-06` ·
`MKT-01` · `INS-12` · `INS-09`.

---

### v1.51 — 27 juillet 2026 — *Lot : quatre derniers arbitrages*

| Point | Décision |
|---|---|
| **Avis antérieurs au 4ᵉ critère** (`AVS-07`) | **Conservés, moyenne sur trois critères** |
| **Bloc de l'écran projet** (`QAL-08`) | **Deux blocs séparés** : *Professionnel* · *Intervenants* |
| **Pays d'hébergement** (Annexe 8) | **Non arrêté** |
| **Sous-traitance de KAi** (Annexe 8) | *« Sécurité et data de MEEREO : interne ; le reste étranger »* |

**Deux pièges d'implémentation, signalés parce qu'ils passeraient inaperçus :**

**La moyenne d'un avis se calcule sur ses propres critères renseignés, jamais sur un dénominateur fixe
de quatre.** *Un avis ancien divisé par quatre au lieu de trois verrait sa note amputée d'un quart,
en silence.*

**Le bloc « Intervenants » est masqué quand il est vide** — cas majoritaire. *Un conteneur vide fait
croire à une donnée manquante.*

### 🔴 Les textes juridiques ne sont pas publiables en l'état

Les CGV l'étaient devenues grâce à `FIN-02`. **La Politique de confidentialité et les Mentions légales
ne le sont pas :** le pays d'hébergement n'est pas arrêté, et une partie des traitements s'effectue à
l'étranger — **le régime des transferts de la loi n° 2013-450 s'applique donc**.

> **Ambiguïté non levée, volontairement.** « Interne » peut désigner une **infrastructure propre** ou un
> **hébergement en Côte d'Ivoire**. **Ce n'est pas la même chose : la loi raisonne en territoire, pas en
> propriété.** Un serveur appartenant à MEEREO mais situé à l'étranger constitue un transfert.
> *Je ne choisis pas la lecture à la place de MEEREO.*

**Ce point ne relève ni d'un arbitrage produit ni d'un avocat — il relève d'un choix d'infrastructure.**

---

### v1.50 — 27 juillet 2026 — *Lot : clôture des huit derniers arbitrages*

## 🔴 Le plus important de ce lot : une erreur de ma part dans l'Annexe 1

**L'Annexe 1 affirmait que plus aucun arbitrage ne bloquait le développement. C'était faux.**
`FIN-02` portait une **contradiction interne non résolue** — encaissement des achats Marketplace par
MEEREO d'un côté, flux direct acheteur → fournisseur de l'autre — **que je n'avais jamais remontée dans
l'inventaire des points ouverts**, alors que le point lui-même interdisait de publier les CGV tant
qu'elle durait.

> **Une réserve consignée au bon endroit mais absente de l'inventaire équivaut à une réserve non
> consignée.** L'annexe est corrigée et la règle est désormais explicite.

## **`FIN-02` — l'encaissement, tranché en deux temps**

| Étape | Flux | Condition |
|---|---|---|
| **Aujourd'hui** | **Acheteur → Fournisseur en direct.** MEEREO n'encaisse que ses revenus propres | Aucune |
| **Ensuite** | Paiements **via l'API MEEREO** | **Agrément d'établissement de paiement** |

**La réserve qui bloquait la publication des CGV Marketplace est levée.**

> **🔴 Le chemin critique n'est pas le code, c'est le délai réglementaire.** Une intégration de paiement
> se livre en quelques semaines ; un agrément ne s'obtient pas à ce rythme. **Le dossier doit être
> engagé bien avant que la fonctionnalité soit souhaitée.**
>
> **Ce que je ne peux pas affirmer :** je ne connais pas de façon vérifiée les conditions d'obtention de
> cet agrément dans l'espace UEMOA — capital, pièces, autorité, délai. **Je ne les invente pas.** Point
> à instruire avec un conseil spécialisé, au même titre que l'Annexe 8.

## **[NOUVEAU] `QAL-08` — Lexique des rôles : deux notions, pas quatre mots**

MEEREO ne retient pas un mot unique — **l'arbitrage est plus fin que la question posée** :
**Professionnel** = le titulaire du marché · **Intervenant** = un corps de métier ajouté à la mission.
**« Prestataire » et « Entreprise » disparaissent** comme libellés de rôle.

> **Ce vocabulaire valide la règle de notation de `AVS-07` :**
> **le client évalue le Professionnel, le Professionnel évalue les Intervenants.**
> *Une règle énonçable en une phrase avec les mots de l'interface est une règle qu'un développeur ne
> peut pas implémenter de travers.*

## Les six autres décisions

| Point | Décision |
|---|---|
| Critères d'évaluation | **Quatre**, dont *Professionnalisme*. **La production n'en affiche que trois — à compléter** |
| Pondération | **Poids égal**, 25 % chacun |
| Modification d'un avis | **Jamais**, par personne |
| Photo de profil client | **Messagerie · avis déposés · notifications** |
| Taille des fichiers | **10 Mo**, **50 Mo pour les plans** |
| Principe de commission | **Taux unique** sur toutes les ventes |

### Deux contreparties que les décisions rendent obligatoires

**Un avis définitif exige une confirmation avant envoi.** La règle « jamais modifiable » est saine, mais
sans écran de confirmation elle ne protège pas l'intégrité des avis — **elle fabrique des avis erronés
définitifs**. Une étoile cliquée de travers pèserait pour toujours sur la note publique d'une
entreprise. Le bouton d'envoi reste par ailleurs inactif tant que les quatre critères ne sont pas
renseignés : *on ne calcule pas une moyenne sur un ensemble partiel.*

**Les 50 Mo accordés aux plans ne sont pas une facilité.** Un plan d'exécution dépasse couramment
10 Mo ; une limite unique basse ferait partir les plans par WhatsApp — **hors plateforme, hors Passeport
Numérique, hors traçabilité**. *Une limite qu'on ne peut pas respecter n'est pas une limite, c'est une
fuite.*

### Réserve maintenue, arbitrée en connaissance de cause

*Communication & suivi* et *Professionnalisme* se recouvrent largement : à poids égal, **la moitié de la
note porte sur le relationnel** contre un quart sur la qualité technique. MEEREO a tranché en
connaissance de ce recouvrement. *Si les notes se révèlent peu discriminantes, c'est le premier réglage
à revoir.*

**Amendements :** `FIN-02` · `FIN-03` · `AVS-01` · `AVS-07` · `SYS-05` · **Annexe 1** *(correction et
huit arbitrages)*.

---

### v1.49 — 27 juillet 2026 — *Lot : évaluation de fin de projet*

> **Constat MEEREO.** *« Le client ne peut pas donner son avis sur lui-même. Il y a une erreur,
> normalement ça devrait être le professionnel du projet. »*

**Le constat est exact.** Sur un projet dont le seul intervenant est **MILLENIUM CONSTRUCTION**, le
modal « Évaluer le prestataire » présente **Jayem Troh — *Prestataire du projet***, c'est-à-dire
**l'utilisateur connecté**. Ni l'identité ni le rôle ne correspondent.

## **[NOUVEAU] `AVS-07` — Évaluation de fin de projet : destinataire, note et fenêtre de dépôt**

### 🔴 Le point le plus important de ce lot : ce défaut expliquerait peut-être `AVS-04`

`AVS-04` constate depuis la v1.33 que les avis sont **enregistrés mais jamais affichés** sur la page
publique du professionnel, et hésite entre deux causes. **Une troisième les rend toutes deux sans
objet : l'avis serait enregistré contre la mauvaise entité.** S'il est rattaché au client, il
n'apparaît pas sur la page du professionnel **parce qu'il n'y a jamais été rattaché**.

> **Vérification préalable, à conduire avant tout développement.** Si seul le **libellé** est faux, la
> correction est cosmétique. Si l'**écriture** l'est aussi, des avis de production sont attachés à de
> mauvais profils et il faut **reprendre les données en base**. *Une capture ne permet pas de trancher
> — il faut regarder quel identifiant reçoit l'enregistrement.*

**Règle de fond dégagée :** une identité manquante **ne doit jamais être remplacée par l'utilisateur
connecté**. Ce repli produit un écran **plausible** — nom réel, avatar correct, aucune erreur — là où
une valeur absente aurait été vue immédiatement. **Mieux vaut un écran qui refuse de s'afficher qu'un
écran qui affiche autre chose.**

### Quatre arbitrages

| Point | Décision |
|---|---|
| **Destinataire** | **L'entreprise titulaire, elle seule.** Les sous-traitants sont évalués par le titulaire *(évaluation croisée `AVS-01`, maintenue)* |
| **Note globale** | **Calculée** — moyenne des critères, en lecture seule. Les 5 étoiles cliquables disparaissent |
| **Sens** | **Unilatéral** — le professionnel n'évalue pas le client |
| **Fenêtre** | Relances **J+7** et **J+21**, **fermeture J+30** |

**Le principe qui unifie les deux premiers :** *la notation suit la chaîne contractuelle — le client
note le titulaire, le titulaire note ses sous-traitants.* **Chacun est évalué par celui qui a apprécié
sa prestation, et par personne d'autre.**

**Contreparties consignées, non éludées :** le professionnel **n'a aucun moyen de signaler un mauvais
payeur** *(à traiter par signalement à MEEREO, jamais par une note publique)* · un avis **oublié est
perdu définitivement**, ce qui rend les deux relances **indispensables** · **la liste des critères doit
être fermée** — `AVS-01` en énonce quatre et une liste ouverte, la production en affiche trois : *on ne
dérive pas une moyenne d'un ensemble indéterminé*.

**Cinq points restent à trancher** *(listés dans `AVS-07`)* : liste des critères · pondération ·
arrondi · **modification de l'avis par son auteur** — `AVS-01` l'interdit au professionnel mais ne dit
rien du client · **lexique** — *Prestataire*, *Intervenant*, *Entreprise* et *Professionnel* désignent
la même entité sur quatre écrans.

**Deux points amendés :** `AVS-01` *(destinataire, note dérivée, sens unilatéral, fenêtre)* ·
`AVS-04` *(troisième hypothèse — vérifier le destinataire avant de développer l'affichage)*.

---

### v1.48 — 27 juillet 2026 — *Lot : étanchéité de la Marketplace*

> **Contexte.** MEEREO relève que la page publique du fournisseur, telle que je l'avais spécifiée en
> `ANN-06`, **rouvrait une porte de contournement** : *« si on peut lui écrire un message, on peut
> aussi demander un devis sans passer par la Marketplace ; sa page n'est qu'une vitrine ».*

**Le constat était juste et il révélait une erreur d'appréciation de ma part.** J'avais étendu la page
publique au fournisseur **sans examiner quelles actions elle devait porter**. Les deux rôles n'ont pas
le même modèle de transaction : **pour le Professionnel, la mise en relation *est* le produit ; pour le
Fournisseur, le produit est un catalogue.**

## **[NOUVEAU] `MKT-07` — Étanchéité de la Marketplace : un seul point d'entrée transactionnel**

| Chemin | Décision |
|---|---|
| Page publique du fournisseur | **« Voir le catalogue »** — action unique, **aucune messagerie** |
| Messagerie | **Après commande uniquement** — suivi, livraison, SAV, litige |
| Produit « sur devis » | **Demande de devis sur la Marketplace**, jamais dans la messagerie |
| Appel d'offres | **Le fournisseur n'y répond pas** — il vend par catalogue |

### L'enjeu dépasse largement la commission

MEEREO **ne prélève aucune commission** aujourd'hui (`FIN-03` Phase 2) : une vente hors plateforme ne
coûte **rien dans l'immédiat**. Quatre choses se perdent pourtant — traçabilité des commandes, donnée
de stock dont dépend KAi, avis vérifiés, **et surtout la possibilité même de la Phase 3**.

> **C'est l'argument décisif :** `FIN-03` prévoit escrow et commission à terme, ce qui **suppose que
> les transactions passent déjà par la Marketplace**. Si l'habitude de contourner s'installe pendant la
> Phase 2, **la Phase 3 devient impraticable** — on ne ramène pas des utilisateurs vers un circuit
> qu'ils ont appris à éviter, surtout au moment où on leur annonce une commission.
> **La règle n'est pas une contrainte de la Phase 2 : c'est un investissement pour la Phase 3.**

### La contrepartie, sans laquelle la règle ne tient pas

**Si l'acheteur ne peut pas poser de question, l'information doit répondre à sa place** : zones de
livraison, délais, modes, stock, unité de vente, conditions, certifications, avis.
**Un fournisseur dont la fiche est incomplète devient injoignable** — argument supplémentaire pour la
règle de garde de `MKT-06`.

### La demande de devis, désormais outillée

Formulaire structuré rattaché au produit *(quantité, unité, délai, lieu de livraison)* · objet doté
d'un statut *(émise → chiffrée → acceptée → refusée → expirée)* · échanges **à l'intérieur de l'objet**
· **une demande acceptée devient une commande**.

> **Ce qui distingue un devis d'une conversation :** il a un **objet**, un **état** et une **issue**.
> Une conversation n'a rien de cela — c'est pourquoi elle ne peut pas servir de support à une
> négociation commerciale traçable. *Ce second mode d'achat était déjà prévu par `MKT-02` ; il est
> maintenant spécifié.*

### ⚠️ Limite assumée

**Une entreprise cumulant les deux rôles (`INS-14`) conserve un bouton « Contacter » au titre de son
activité professionnelle.** Rien n'empêche alors de lui demander un prix sur des matériaux par ce
canal. **Cette brèche ne peut pas être fermée techniquement** sans retirer au professionnel ce qui fait
sa fonction. **La règle est étanche pour les fournisseurs purs, poreuse pour les entreprises à deux
rôles** — l'exception doit être connue, pas découverte.

**Six points amendés :** `ANN-06` *(correction de mon erreur — la page ne porte pas les mêmes actions)*
· `MSG-01` *(le contact avant commande est réservé aux Professionnels)* · `MKT-01` *(le « sur devis »
reste, son canal est encadré)* · `AOF-01` *(le fournisseur ne répond pas aux AO — application d'une
frontière déjà posée)* · `INS-21` *(**le constructeur doit filtrer les modules selon le profil** :
un module « Contact » proposé par erreur rouvrirait la brèche)* · `FIN-03` *(protection explicite de la
Phase 3)*.

---

### v1.47 — 27 juillet 2026 — *Lot : clôture de tous les points ouverts*

> **Contexte.** MEEREO demande à arbitrer définitivement l'ensemble des points restants. **Dix-neuf
> étaient ouverts : douze ont été tranchés, sept réglés par défaut.**

## ✅ **Aucun arbitrage produit ne bloque plus le développement**

### Les décisions les plus structurantes

- **Changement de rôle (`INS-14`)** — **pas de retrait de profil** : pour cesser une activité, on
  supprime le compte et on en recrée un. ⚠️ *Conséquence à afficher avant l'action : perte de
  l'historique, des avis et du badge. Le cumul rend heureusement ce cas rare — on ajoute un profil et
  on cesse d'utiliser l'autre.*
- **Espace d'une entreprise à deux rôles (`SYS-06`)** — **un espace unique, sections fusionnées.**
  Les Paramètres fusionnent leurs onglets sans dupliquer les communs. **La table de navigation
  principale, absente du référentiel, devient un prérequis.**
- **Tarif KAi Pro en cumul (`FIN-02`)** — **le plus élevé, 39 000 FCFA.** *La somme des deux aurait
  incité à créer deux structures juridiques pour payer moins — vidant de son sens la décision
  d'autoriser le cumul.*
- **Comptes employés inclus sans limite (`FIN-02`)** — ⚠️ *suppose que ces comptes restent des accès
  restreints : si un employé avait les droits d'un compte principal, le modèle deviendrait
  contournable.*
- **Annuaire unique + page fournisseur obligatoire (`ANN-06`, `INS-03`)** — *on cherche une
  compétence, pas un statut*, et **pas de vente sans vitrine**. La page publique rejoint les prérequis
  de mise en vente de `MKT-06`, aux côtés de l'encaissement et de la livraison.

### Confidentialité — une règle désormais homogène

**Projets publiés anonymisés par défaut (`INS-21`) · type de projet affiché systématiquement sur les
avis (`AVS-04`).** Les deux décisions convergent : **on montre ce qui a été construit, pas pour qui ni
pour combien.** Le nom du client et le montant restent soumis à son accord explicite, révocable.

**Employé non public par défaut (`INS-18`)** — *le nom et la photo d'un salarié sont des données
personnelles : les publier doit être un acte, pas un défaut.*

> **Risque résiduel consigné :** sur un marché où les chantiers sont peu nombreux, le croisement
> *type + date + professionnel* peut identifier un maître d'ouvrage. **MEEREO a arbitré en faveur de
> l'utilité de l'information** — un avis sans contexte étant peu exploitable. *Si le volume d'avis
> augmente, le risque se dilue ; s'il reste faible, le point mérite d'être réexaminé.*

### Deux décisions qui appellent une contrepartie technique

- **Vérification e-mail différée (`INS-09`)** — ⚠️ **`INS-09` reste ouvert tant que l'écran de
  correction d'adresse n'existe pas.** Sans lui, la vérification différée est **plus dangereuse** que
  la bloquante : on crée un compte auquel personne ne pourra jamais accéder, et l'utilisateur ne s'en
  apercevra qu'à la première reconnexion.
- **Budget modifiable après signature (`FIN-01`)** — cohérent puisque MEEREO **n'est pas partie au
  contrat** : elle trace un accord conclu ailleurs. Mais **trois exigences** conditionnent la validité
  de la notification : historisation complète, historique **visible des deux parties**, et notification
  indiquant **l'écart** et non le seul montant final.

### Les sept points réglés par défaut

30 jours pour le brouillon · étape logo franchissable *(le repli monogramme est garanti)* · instantané
d'identité = nom + qualité figés à la signature · export clients conditionné à la journalisation ·
carré arrondi pour une structure, rond pour une personne · blocage limité au fil direct avec mention
neutre · Collaborateur écrit sur ses projets, Lecteur en lecture seule.
**Chacun est signalé comme réexaminable dans le point concerné.**

> ### Ce qui reste, et qui n'est pas un arbitrage produit
> **Validation juridique** des textes de l'Annexe 8 par un avocat · **déclaration ARTCI** · et des
> **décisions de conception à prendre en codant** — modules propres au fournisseur, croisement rôle
> interne × profil de rôle, table de navigation. *Aucune ne requiert une décision de MEEREO en amont.*

---

### v1.46 — 27 juillet 2026 — *Lot : absence de vitrine fournisseur, sélecteur de contacts*

**[NOUVEAU] `ANN-06` — Le fournisseur n'a ni page publique ni présence dans l'annuaire.**

**Le manque est plus profond que l'annuaire.** Vérification faite : **`INS-03` n'impose la page
publique qu'au Professionnel**, et la « Boutique » de `MKT-03` est la **vue vendeur de la Marketplace**,
un écran d'administration — pas une vitrine consultable. **Le comportement constaté est donc conforme
au référentiel : c'est le référentiel qui est incomplet.** *Il n'y a rien à réparer, il y a quelque
chose à construire.*

**Pourquoi c'est un vrai manque :** un acheteur qui hésite entre deux fournisseurs de ciment **ne peut
évaluer ni l'un ni l'autre**. Il voit des articles, pas des entreprises — alors que choisir un
fournisseur engage capacité de livraison, délais, zones desservies et service après-vente, informations
qu'une fiche produit ne porte pas.

> **La décision de cumul (`INS-14`) rend le manque plus aigu.** Une entreprise exerçant les deux
> activités apparaît dans l'annuaire au titre de son activité Professionnel, mais **son activité
> Fournisseur y reste invisible** — alors que « fournir ET poser » est précisément le cas d'usage que
> le cumul vient d'autoriser.

**Trois questions à trancher :** annuaire unique avec filtre par rôle *(recommandé — on cherche une
compétence, pas un statut)* ou deux annuaires · quels modules sont spécifiques au fournisseur *(zones
de livraison, délais ; le portfolio n'a pas de sens)* · la page est-elle obligatoire comme celle du
professionnel ? *Une page vide dans un annuaire nuit plus qu'elle ne sert.* **Et le titre « Annuaire
des professionnels » devra changer** — il exclut par son libellé même ce qu'on veut y ajouter.

**[NOUVEAU] `MSG-10` — Le sélecteur de contacts propose l'utilisateur courant.** La modale
« Nouvelle conversation » de l'espace client propose **le client lui-même** comme destinataire. La
correction est triviale, mais **le filtrage n'est pas fait à la source** : le même composant étant
vraisemblablement partagé, vérifier les espaces Professionnel et Fournisseur avant de conclure.

**[AMENDÉ] `MSG-09` — aggravation : le fil direct a disparu de l'affichage client.** Le client avait
**trois** conversations le 26/07, il n'en a plus que **deux**. **Trois symptômes convergent désormais
vers une cause unique** — impossibilité d'écrire après clôture, perte du nom au profit de « Contact »,
et disparition du fil. **La rupture du lien Client ↔ Professionnel à la clôture les expliquerait tous
les trois.** *À vérifier en premier : le fil existe-t-il encore en base ? La réponse départage une
perte de données d'un défaut d'affichage.*

**[AMENDÉ] `MSG-08` — non résolu.** Les deux groupes projet en double subsistent, avec leurs deux
conventions de nommage — **l'indice reste exploitable** pour localiser les deux points de création.

**[AMENDÉ] `INS-03`** — le périmètre limité au seul Professionnel est signalé, avec renvoi vers
`ANN-06`.

---

### v1.45 — 27 juillet 2026 — *Lot : quatre arbitrages — cumul de rôles, départage des doublons, rôles internes, mot de passe*

> **Contexte.** Quatre décisions rendues, dont trois ferment des points ouverts depuis plusieurs
> versions. **Une réponse a été corrigée par MEEREO avant intégration** — la correction est intervenue
> au bon moment, rien n'étant encore codé.

## 1. Cumul de rôles : **RETENU** — et cela change la forme du correctif `INS-20`

**Une même entreprise peut être Professionnel et Fournisseur.** Le cas est réel dans le BTP ivoirien :
entreprise de gros œuvre qui revend des matériaux, menuisier qui pose et qui vend.

> **⚠️ Ce n'est pas qu'une réponse, c'est un modèle de données.** Le RCCM n'appartient pas au
> **compte** mais à l'**entreprise**, laquelle porte un ou plusieurs **profils de rôle**.
> **Poser naïvement `UNIQUE(rccm)` sur la table des comptes fermerait le cumul sans que personne ne
> l'ait décidé** — c'est exactement le risque que l'arbitrage préalable visait à écarter.
>
> **`INS-01` reste intégralement respecté :** un RCCM demeure strictement unique sur toute la
> plateforme. Seul change l'objet porteur.

**Quatre conséquences à traiter dans le même chantier :** l'entreprise apparaît **une seule fois** dans
l'annuaire, avec ses deux activités · le badge est vérifié **une fois pour l'entreprise** · **`MKT-01`
est amendé** — sa formulation *« ni le client, ni le professionnel ne vendent »* devenait inexacte ·
**`SYS-02` devra croiser rôle interne × profil de rôle**, ce qu'elle ne prévoit pas.

**Deux questions nouvelles, ouvertes en Annexe 1 :** que voit une entreprise à deux rôles dans ses
Paramètres *(7 onglets d'un côté, 8 de l'autre)* ? Et **quel tarif KAi Pro** — 19 900 côté
Professionnel, 39 000 côté Fournisseur : le plus élevé, la somme, ou un tarif « double activité » ?
*Question de revenu, pas seulement de modèle.*

## 2. Départage des doublons : cascade à trois échelons

**Distinction préalable que la migration ne doit pas manquer :** *même RCCM, rôles différents* n'est
**pas** un doublon — ce sont deux profils à **fusionner** en une entreprise, sans invalider personne.
Seul *même RCCM, même rôle* relève de la cascade : **document déposé** *(il l'a prouvé)* → **activité
réelle** → **ancienneté**. Chaque échelon est objectif et vérifiable, ce qui permettra de justifier la
décision auprès d'un titulaire évincé.

**Et les comptes non retenus ne sont pas supprimés silencieusement** : notification, motif, voie de
recours, données accessibles le temps du recours.

## 3. Rôles internes : un Collaborateur ne voit ni budget ni factures

Réservés à **Administrateur** et **Chef de projet**. *Un conducteur de travaux a besoin du planning et
des documents — pas de la marge de son employeur.*

> **Conséquence sur `INS-18` :** le choix du rôle interne à l'invitation n'est pas une étiquette
> descriptive, **c'est une décision de confidentialité**. Chaque rôle doit indiquer en une ligne ce
> qu'il ouvre et ce qu'il ferme — *sans cela, un dirigeant attribuera « Chef de projet » par courtoisie
> hiérarchique et exposera ses marges sans l'avoir voulu.*

## 4. Politique de mot de passe : **10 caractères, une lettre, un chiffre**

**Point ouvert depuis la v1.28, clos.** Ni majuscule ni caractère spécial imposés — le NIST
(SP 800-63B) le déconseille : ces règles produisent des contournements prévisibles sans gain réel.
**Débloque `INS-06`, `INS-07` et `INS-09`.** **Le code déjà livré (Annexe 7) implémente exactement
cette politique** : l'hypothèse devient décision, aucune modification requise.

---

### v1.44 — 27 juillet 2026 — *Lot : unicité du RCCM non appliquée, constructeur de page, statut des maquettes*

> **Contexte.** Quatre arbitrages rendus sur la distinction entre maquettes et application réelle,
> puis correction par MEEREO du statut des maquettes de design, et découverte du constructeur de page.

## 🔴 **[NOUVEAU] `INS-20` — Unicité du RCCM et du numéro de contribuable non appliquée. CRITIQUE.**

**Constat confirmé sur `dev.meereo.com`, l'application réelle :** le même RCCM et le même numéro de
contribuable peuvent être enregistrés **plusieurs fois**, sur des profils **actifs simultanément**.

**C'est le défaut le plus grave rencontré depuis le début de ce référentiel.** Il ne dégrade pas une
fonctionnalité : **il retire son fondement à tout l'édifice de confiance.**

- **N'importe qui peut s'enregistrer avec le RCCM d'une entreprise existante.** Le RCCM est un
  identifiant **public** — il figure sur devis et factures. Rien n'empêche d'usurper l'identité légale
  d'un concurrent, puis de recevoir des appels d'offres et de contracter.
- **Le badge « Vérifié par MEEREO » ne certifie plus rien.** Combiné à `INS-17` — où le badge s'affiche
  **sans aucun document déposé** — **la vérification est aujourd'hui entièrement décorative.**
- **Les CGU affirment une règle que le système n'applique pas** (A8.3, art. 4.3). Un contrat qui décrit
  un mécanisme inexistant expose MEEREO, d'autant qu'un utilisateur lésé pourra le produire.
- **Le chantier ne se limite pas à poser la contrainte :** des doublons existent déjà en base, et une
  contrainte d'unicité ajoutée sur des données non conformes **échouera à la migration**. Inventaire,
  règle de départage et **notification des titulaires** sont à prévoir.

**[AMENDÉ] `INS-14` — une prémisse de ce point était fausse.** J'avais écrit que l'unicité stricte du
RCCM *« interdit mécaniquement »* à une entreprise d'avoir deux rôles. **Cette contrainte n'existe
pas.** La question du cumul reste entière, mais pour la raison inverse — et l'arbitrage doit être rendu
**avant** de poser la contrainte, faute de quoi la correction de `INS-20` fermera par accident une
possibilité que MEEREO souhaite peut-être ouvrir.

**[AMENDÉ] `NAV-07` — aggravation : ce n'est plus une gêne visuelle, c'est une perte de compte.**
À l'inscription fournisseur, le système déconnecte, **le compte disparaît**, et la connexion renvoie
« Aucun compte trouvé avec cet email ». Deux hypothèses ajoutées : le compte n'est **jamais réellement
créé** *(transaction non validée — exactement ce que `INS-13` prévoit de contenir)*, ou il est **créé
puis invalidé** par une contrainte échouant en aval, potentiellement celle du RCCM. **Une requête
suffit à départager :** l'adresse refusée existe-t-elle en base ?

## **[NOUVEAU] `INS-21` — Constructeur de page publique : modules et langage visuel**

**Découverte :** l'écran `/cockpit/page-builder` était absent du référentiel. **La page publique n'est
pas une page, c'est une composition de modules** — En-tête *(Bannière · Éditorial · Compact)*,
Présentation *(Essai · Manifeste · Dossier)*, Chiffres clés *(Bandeau · Cartouches · Phrase
augmentée)*, Expertise *(Nomenclature · Mosaïque)*, et sept autres catégories.

**Cela change la façon de spécifier le style :** il ne peut pas être défini « pour la page publique »,
mais **pour chaque variante de module**. Une variante rendue dans l'ancien langage annulerait l'effet
des autres.

**Trois défauts du constructeur :** **aucune vignette n'est rendue** — toutes affichent « ? », or *on
ne peut pas choisir un module qu'on ne voit pas* · le panneau d'édition **expose du HTML brut**
(`<b>…</b>`), ce qui suppose qu'un architecte écrive du HTML · nommage incohérent et sans accents
*(libellé « Manifeste », identifiant `pres-manifesto`)*.

## 🔴 Statut des maquettes de design : **CIBLE VALIDÉE**

**MEEREO a corrigé sa réponse précédente.** Les maquettes ne sont pas des explorations : c'est la
cible. Demande explicite — *« le travail de transparence, le travail de style, le style épuré et bien
maîtrisé »*. **`INS-19` est requalifié de proposition en spécification.**

**« Je veux ce style » a été traduit en six traits applicables** (`INS-21` §C) : transparence et flou
d'arrière-plan · **double registre typographique** · petites capitales espacées · épure sans bordures ·
couleur réservée au statut · arrondi maîtrisé.

> **Le trait déterminant est le second.** Le serif italique sur le nom **et sur les chiffres** est ce
> qui fait basculer la page du registre « écran d'application » au registre « vitrine » : les chiffres
> deviennent une affirmation — *147 projets livrés* — au lieu d'un tableau de bord. **Sans lui, les
> cinq autres traits produiront une page propre mais anonyme.**

**⚠️ Un module de la maquette pose un problème de confidentialité.** « Projets actifs · Cockpit »
publie le **nom du client** et le **montant exact** de chantiers en cours — *« Maître d'ouvrage :
Famille Traoré · 185 M FCFA »*. Plus grave que le point déjà signalé en `AVS-04` : ici le client est
nommé. **Une vitrine ne doit pas se construire sur les données de tiers.**

## **[AMENDÉ] Gouvernance — quel environnement fait foi**

Une table de référence est ajoutée en tête de document : **`dev.meereo.com` fait seul foi**. Aucun
défaut ne peut être constaté sur une maquette — *une maquette ne vérifie rien par nature*.
**Conséquence :** les constats de l'**Annexe 6**, fondés sur un prototype, doivent être reconfirmés en
production. Réserve déjà posée en A6.5, et **déjà vérifiée deux fois** — téléphone et photo du client
existent bien en production.

**[AMENDÉ] `INS-08` et `INS-10`** — le formulaire d'inscription fournisseur transmis est une
**maquette non développée** : les deux points restent **ouverts**, la maquette devenant la cible.
**Écart relevé :** cette maquette affiche **deux fois « RGPD »**, alors que `SYS-04` a acté un périmètre
Côte d'Ivoire + UEMOA **sans RGPD**. À retirer avant développement.

---

### v1.43 — 27 juillet 2026 — *Lot : conception de la page publique — barre persistante et formes arrondies*

> **Contexte.** Demande de MEEREO appuyée sur une maquette de référence : reprendre la **barre d'action
> noire persistante** qui suit le défilement, et **arrondir les formes** de la page publique
> professionnelle, notamment les boutons.

**[NOUVEAU] `INS-19` — Page publique : barre d'action persistante et langage de formes.**

**Ce que la barre persistante résout, au-delà de l'esthétique.** La page publique est longue —
accroche, chiffres, à propos, compétences, portfolio, certifications, références, pied de page — et les
actions « Contacter » et « Inviter sur un projet » n'existent **qu'en haut et dans le pied de page**.
**Un visiteur convaincu au milieu du portfolio doit remonter toute la page pour agir.** C'est
précisément le moment où l'on perd un contact : l'intention est là, l'action ne l'est pas.

**Trois règles qui ne se lisent pas sur une maquette, et qui décident du résultat :**

1. **Visiteurs uniquement.** Un professionnel qui consulte sa propre page ne se contacte pas lui-même.
   *La maquette de référence montre d'ailleurs cette incohérence : navigation de propriétaire et barre
   d'action de visiteur affichées simultanément.*
2. **Sur mobile, réserver une marge basse équivalente**, sinon la dernière ligne de chaque section
   devient inaccessible.
3. **Respect de `prefers-reduced-motion` :** apparaître sans animer est acceptable ; **ne pas
   apparaître ne l'est pas** — c'est une fonction, pas une décoration.

**Sur les formes :** la demande « arrondir » a été traduite en **échelle de rayons** exploitable —
pilule pour les boutons et étiquettes, 16–24 px pour les cartes, 12–16 px pour les images. **Une
intention ne se code pas ; une échelle si.**

**[AMENDÉ] `QAL-06` — l'échelle de rayons doit être globale, pas locale.** Sans quoi la page publique
sera arrondie et le reste de la plateforme restera anguleux : **on aura déplacé l'incohérence au lieu
de la supprimer**. C'est le mécanisme exact qui a fait échouer les corrections du logo — une règle
appliquée à un écran plutôt qu'à un composant.

**[AMENDÉ] `INS-03`** — renvoi vers `INS-19` : ce point traite l'*obligation* de créer la page,
`INS-19` traite *ce qu'elle doit être*.

> **⚠️ Avertissement de priorité consigné dans le point.** Cette page affiche aujourd'hui
> « Votre Entreprise », des certifications qu'aucun document ne justifie, un badge accordé sans RCCM
> déposé, une URL en identifiant technique brut, aucun accent, et deux représentations différentes du
> logo à 200 pixels d'écart. **Redessiner cette page avant de corriger son contenu revient à soigner la
> présentation d'une information fausse.** La maquette elle-même affiche « 147 projets livrés » et
> « 84 avis vérifiés » : **elle vaut comme référence de forme, jamais de contenu.**

---

### v1.42 — 27 juillet 2026 — *Lot : audit complet de l'identité visuelle — pourquoi le logo résiste*

> **Contexte.** MEEREO signale que **le problème du logo persiste malgré plusieurs tentatives de
> correction**, et demande un audit exhaustif couvrant toutes les sections et tous les profils. Deux
> références visuelles transmises : disposition du badge « vérifié », et section d'avis.

**[NOUVEAU] `QAL-07` — Identité visuelle : composant unique et matrice d'affichage. MAJEUR.**

### Pourquoi ce problème résiste depuis plusieurs versions

**`QAL-02` traite la DONNÉE ; le défaut est dans le RENDU.** La règle « une seule source, aucune copie
locale » est juste — et elle ne suffit pas. **Dix écrans peuvent lire la même source et l'afficher de
dix façons.** Les corrections précédentes ont porté sur la source, jamais sur le composant : c'est
pourquoi elles n'ont pas tenu, et pourquoi chaque nouvel écran reproduit le problème.

### Ce que l'inventaire a révélé

**Une seule entreprise apparaît sous DIX représentations distinctes :**

- le **logo réel** dans **3 emplacements sur 10** seulement — partout ailleurs un monogramme s'affiche
  **alors qu'un logo existe** ;
- **trois couleurs** pour la même entreprise — bleu, noir, lavande — ce qui prouve que **la couleur est
  calculée localement** par chaque écran ;
- **deux formes** — rond et carré ;
- **deux règles d'initiales** — « MC » ici, « **M** » là.

> **Le fait le plus parlant :** sur la page publique, **deux représentations coexistent à 200 pixels
> d'écart** — un monogramme bleu dans l'en-tête, le vrai logo juste en dessous. **Le même écran ne se
> met pas d'accord avec lui-même.**

Le client subit le même désordre : photo dans son espace, monogramme dans la messagerie, et **texte
seul** dans les Marchés — sans aucune identité visuelle.

### Ce que le point impose

- **Un composant unique** rend toute identité visuelle, quel que soit le rôle ou l'écran. Aucun écran
  ne compose lui-même un fond, des initiales ou une couleur.
- **Couleur dérivée de l'identifiant permanent de l'entité, jamais du contexte** — c'est la règle qui
  manquait. Une entité garde **la même couleur partout, à vie** : la couleur devient un repère de
  reconnaissance au lieu d'un bruit.
- **Règle d'initiales unique**, ordre de repli strict *(logo → monogramme, jamais de texte seul)*,
  forme dérivée de la nature *(carré arrondi = structure, rond = personne)*, jeu de tailles fermé.
- **Une matrice d'emplacements exhaustive**, par rôle — c'est le périmètre de la correction. *Un
  emplacement absent de cette liste redeviendra incohérent.*
- **Un critère de recette simple :** afficher la même entreprise sur **chaque** emplacement de la
  matrice et vérifier qu'elle présente le même visuel, la même forme et la même couleur. Puis changer
  son logo et vérifier que **tous** suivent. **À rejouer pour les trois natures d'entité** — entreprise
  avec logo, entreprise sans logo, personne — car valider sur le seul cas « logo présent » laisserait
  le repli incohérent.

**[AMENDÉ] `INS-04` — disposition et style du badge arrêtés.** Pastille avec **point vert** et libellé
en **capitales** « PROFIL VÉRIFIÉ MEEREO », placée **au-dessus du nom** sur l'image d'en-tête — au lieu
d'une étiquette verte en ligne sous le nom. *Le placement au-dessus du nom fait de la vérification la
première information lue, ce qui correspond à sa fonction.*

> **⚠️ Écart de portée constaté sur le même point :** le badge est **absent de l'annuaire et de la
> recherche globale** — les deux endroits où un client compare précisément des professionnels.
> **C'est là qu'il est le plus utile, et c'est là qu'il manque.**
> **Et il reste affiché sans qu'aucun RCCM n'ait été déposé (`INS-17`) : un beau badge faux reste un
> badge faux.** Corriger la condition d'affichage avant le style.

**[AMENDÉ] `AVS-04` — référence visuelle de la section d'avis intégrée.** Titre « Avis & crédibilité »,
lien « N avis vérifiés », trois cartes *(étoiles · citation en italique · auteur avec qualité et
organisation)*. **La date manque sur la maquette et doit être ajoutée** — trois avis excellents de 2019
ne valent pas trois avis de cette année. L'avatar de l'auteur suit le contrat de `QAL-07`.

**[AMENDÉ] `QAL-02`** — constat de fond ajouté, avec renvoi vers `QAL-07`.
**[AMENDÉ] `INS-12`** — la valeur de repli, signalée manquante, est désormais spécifiée.

> **Réserve de périmètre.** **La section Fournisseur n'a jamais été observée.** Les emplacements
> Marketplace de la matrice proviennent de `QAL-02` et de `MKT-01`/`MKT-03`, **non d'un constat
> visuel**. À vérifier avant de considérer l'audit comme complet.

---

### v1.41 — 27 juillet 2026 — *Lot : revue d'interface — huit retouches et huit arbitrages*

> **Contexte.** Demande de MEEREO : identifier des retouches subtiles d'interface et d'expérience
> utilisateur à partir des captures des espaces Client et Professionnel. Huit arbitrages rendus en deux
> tours.

**[NOUVEAU] `QAL-06` — Retouches d'interface : huit ajustements. PRIORITÉ 3.**

> **🔴 Séquencement décidé : après les points bloquants et majeurs.** `AOF-05` (plantage), `FIN-04`
> (chaîne financière), `PRJ-12` (équipe) et `INS-17` (page publique de démonstration) passent devant.
> **Une interface soignée posée sur des données fausses reste inutilisable.** Ce point est consigné
> pour ne pas se perdre, pas pour passer devant.

**Les trois retouches arbitrées :**

1. **Fusion des deux portes financières.** « Budget » (portée projet, centré contrats) et « Finance »
   (portée entreprise, centré comptabilité) portent des noms qui se recouvrent — et **« Finance » n'a
   aucune entrée de menu** : on n'y accède que par un bouton contextuel. **Décisions : fusionner ·
   organiser par projet d'abord · placer sous BUSINESS · ne pas appliquer au client**, qui n'a pas de
   comptabilité d'entreprise à tenir.
   > **Ce n'est pas qu'une retouche.** Deux modules aux noms voisins affichant des montants différents
   > participent directement à la confusion de `FIN-04`. **Les deux chantiers doivent être conduits
   > ensemble.**
2. **Recherche globale : placeholder contextuel.** « Rechercher un professionnel… » s'affiche sur
   **tous** les écrans, y compris Documents et Paramètres, et la Marketplace en superpose **deux**.
   *La recherche universelle a été écartée : indexation, pertinence et filtrage par droits sortent du
   périmètre d'une retouche.*
3. **Widget KAi déplacé en coin bas-droit.** Ancré en bas-centre, il masquait du contenu sur presque
   tous les écrans — **le bas-centre est l'axe où le contenu s'écoule**. ⚠️ Un élément occupe déjà ce
   coin sur les captures : collision à vérifier.

**Cinq observations documentées, non arbitrées :** compteurs à zéro occupant la meilleure place ·
accents de couleur sans sens stable *(le vert sert à la fois de confirmation et d'action principale)* ·
libellés de menu ne correspondant pas aux titres de page *(« Tâches » ouvre « Planning »)* · faux fils
d'ariane non cliquables · **cinq modes d'affichage pour zéro document**.

**[AMENDÉ] `SYS-06` — manque de gouvernance relevé.** Le référentiel documente la structure des
**Paramètres** par rôle, mais **aucune table de la navigation principale** n'existe. Conséquence
immédiate : la décision de déplacer le module financier sous BUSINESS **ne peut être consignée nulle
part**. À produire.

> **Limite de méthode assumée et consignée.** Cette revue s'appuie sur des **captures fixes** : le
> mouvement, les états de survol et de focus, les temps de chargement et le responsive **n'ont pas pu
> être évalués**, et **la section Fournisseur n'a pas été observée**. L'option d'une annexe design
> complète a été écartée pour cette raison — produire une annexe design sans avoir utilisé le produit
> aurait été présomptueux.

---

### v1.40 — 27 juillet 2026 — *Lot : animations KAi non fonctionnelles*

> **Contexte.** Signalement : aucune animation de KAi ne fonctionne, alors que
> `KAi-specification-fonctionnement.md` décrit un système complet — deux catégories d'animation (§11),
> trois micro-gestes idle (§12) et six séquences événementielles au timing exact (§15).

**[NOUVEAU] `QAL-05` — Animations KAi non fonctionnelles & état « attention » non conforme.**

**Hypothèse prioritaire, testable en trente secondes : `prefers-reduced-motion`.** La spécification
KAi (§16) demande — à juste titre — de respecter ce réglage d'accessibilité. Or son implémentation la
plus courante est une règle globale `@media (prefers-reduced-motion: reduce) { * { animation: none } }`
qui, **si le réglage système est activé, éteint TOUT d'un seul coup**.

> **C'est précisément le symptôme rapporté :** non pas « telle animation est cassée », mais « **aucune**
> ne marche ». **Quand tout s'éteint ensemble, chercher une cause unique avant d'auditer chaque
> animation.** Vérification : Réglages Système → Accessibilité → Réduire les animations.
>
> **Si l'hypothèse se confirme, la correction n'est pas de retirer le support** — c'est une exigence
> d'accessibilité légitime. La spécification donne elle-même la nuance : les animations
> **fonctionnelles** (confirmation d'action) doivent être conservées sous forme de changement d'état
> instantané. **Réduire n'est pas supprimer.**

**Trois autres causes classées :** le planificateur de gestes idle qui ne démarre jamais · les classes
d'animation jamais posées par l'événement métier · un **conflit de propriété `transform`** entre la
respiration et le geste *nod*, que la spécification §12 avertit explicitement d'éviter en utilisant un
élément wrapper distinct.

**⚠️ Écart de conformité relevé sur les captures.** La pastille KAi porte un **badge rouge avec un
point d'exclamation**. La spécification §10.2 décrit un **anneau violet** s'étendant en continu,
**coexistant** avec le point vert. **Ce n'est pas un détail esthétique mais une inversion de sens** :
le rouge signifie erreur ; KAi ne signale pas un problème, il propose une recommandation. Et le violet
est la couleur d'identité de KAi dans ce design system — il relie le signal à son émetteur.

**Point positif :** la bulle de suggestion proactive (§10.5) est **conforme** — message court, bouton
de fermeture, bouton d'action unique. Reste à vérifier le retour visuel au clic (coche verte, retour
après 1,6 s).

**Non vérifiable sur les captures :** les états 10.3 *(indicateur de réflexion)*, 10.4 *(arrivée de
message)*, 10.6 *(panneau étendu)* et 10.7 *(cartes d'événement produit)* n'apparaissent nulle part.
Leur implémentation n'est **ni confirmée ni infirmée**.

---

### v1.39 — 27 juillet 2026 — *Lot : fiche client du CRM — perte de données et correction d'un diagnostic*

> **Contexte.** Signalement : l'édition d'une fiche client la fait « disparaître et réapparaître », et
> son type revient à la valeur par défaut. Quatre arbitrages rendus.

**[NOUVEAU] `AVS-06` — Fiche client du CRM : nature, édition et cycle de vie. MAJEUR.**

**Le constat est plus grave que le signalement.** La capture montre « **0 clients · 0 actifs** » et
« Aucun client enregistré » : **la fiche n'est pas revenue à sa valeur par défaut, elle a disparu du
CRM**. Et le compteur « Projets liés » affiche toujours **1** — il subsiste une **référence orpheline**
vers un client qui n'existe plus. **C'est une perte de données.**

**Hypothèse principale :** la fiche CRM n'est pas un enregistrement possédé mais une **projection** de
la relation issue du marché. L'éditer romprait la projection. *Cette seule hypothèse expliquerait
simultanément la disparition, la persistance du compteur, et le retour du type à sa valeur par défaut.*

**Les quatre décisions :**

1. **Fiche possédée par le professionnel, liée au compte MEEREO.** Il enrichit librement type, poste et
   statut ; les **champs d'identité restent en lecture seule** depuis la source MEEREO. *Sans cette
   séparation, sa fiche et le compte réel divergeraient silencieusement — il croirait joindre son
   client à une adresse qu'il a lui-même modifiée.*
2. **Prospects autorisés, avec rappel de responsabilité.** Un CRM sans prospects n'est pas un CRM, mais
   le professionnel saisit les données d'un tiers **qui n'a jamais consenti à figurer sur MEEREO**.
3. **Suppression du compte client : coordonnées purgées, historique conservé.** Complète `AVS-03`, qui
   traitait la non-réassociation mais **ne disait rien du CRM des professionnels**.
4. **Suppression d'une fiche rattachée à un projet : autorisée après avertissement.**

> **⚠️ Contrepartie signalée sur la décision 4.** Autoriser la suppression **impose** de décider ce que
> devient la référence côté projet — sinon **l'état exact de la capture se reproduira**. Règle posée :
> le projet conserve un **instantané immuable** du nom du client, qui n'est pas une référence et ne
> peut donc pas devenir orphelin. Et l'avertissement doit énoncer la conséquence **précise**, pas une
> formule générique : un avertissement vague ne permet pas de décider en connaissance de cause.

**[AMENDÉ] `QAL-04` — 🔄 je corrige mon propre diagnostic.** J'avais attribué la substitution de
caractères à un **utilitaire de normalisation appliqué aux libellés**. **C'est faux.** Le bouton de
fermeture de la modale affiche « **À** » au lieu de « **×** » — et **une icône de fermeture ne transite
par aucun formateur de texte**. Le défaut touche donc **au moins deux caractères non-ASCII distincts**
(`→` → « à », `×` → « À ») : c'est un problème **d'encodage**, pas de formatage.
**Ce que ça change concrètement :** ce n'est pas une correction écran par écran. **Une seule cause**
explique toutes les occurrences, y compris l'absence totale d'accents sur la page publique (`INS-17`).
Deux pistes dans l'ordre : encodage des sources et de la chaîne de build, puis en-tête `Content-Type`.

**[AMENDÉ] `AVS-03`** — la purge des coordonnées dans les CRM tiers est ajoutée.
**[AMENDÉ] Annexe 8/A8.5** — nouvelle section sur les **données de tiers saisies par un professionnel** :
c'est lui le responsable de traitement, MEEREO se borne à héberger, et une voie de recours est ouverte
aux personnes concernées.
**[AMENDÉ] Annexe 1, point 16** — quels champs exactement sont figés dans l'instantané d'identité, et
à quel moment ?

**Deux observations complémentaires :** le type client a une **valeur par défaut « Promoteur »** —
faux pour un particulier, et exactement le mécanisme dénoncé par `INS-16` ; et la typologie observée
*(Promoteur · Particulier · SCI · Collectivité · État · Entreprise)* mérite d'être consignée comme
**source unique** réutilisable.

---

### v1.38 — 27 juillet 2026 — *Lot : coordonnées du client, continuité de la messagerie et blocage bilatéral*

> **Contexte.** Deux signalements de MEEREO — transmission des coordonnées du client au professionnel
> sans information, et impossibilité pour le professionnel d'écrire après clôture — assortis de quatre
> arbitrages.

**[NOUVEAU] `AVS-05` — Coordonnées du client transmises au professionnel.** Le CRM du professionnel
reçoit l'e-mail et le téléphone du client **sans information ni sollicitation**. Ce n'est pas un détail
d'ergonomie : la transmission de données personnelles entre utilisateurs est un traitement au sens de
la **loi n° 2013-450**, qui exige une base légale identifiée.

- **Décision : base contractuelle, transmission à la signature du marché.** Avant la signature, le
  professionnel n'a **aucune coordonnée** — un client qui publie un appel d'offres ne livre pas son
  téléphone à tous les candidats. À la signature, les coordonnées sont transmises et **le client en est
  informé**. *L'option du consentement explicite a été écartée : un refus rendrait le chantier
  impraticable, le consentement serait donc de façade — et plus fragile juridiquement que la base
  contractuelle.*
- **Décision : suppression du bouton « Exporter ».** Il permettait de **sortir une base de contacts
  entière sans laisser de trace**, y compris juste avant une suppression de compte. Réintroduction
  possible plus tard, **à condition d'une journalisation** de chaque export.
- **[AMENDÉ] Annexe 8/A8.5** — la politique de confidentialité ne mentionnait **pas** cette
  transmission entre utilisateurs. Le professionnel attributaire est ajouté à la liste des
  destinataires. **À faire avant toute publication des textes.**

**[NOUVEAU] `MSG-09` — Continuité de la messagerie après clôture & blocage bilatéral.**

- **Décision : la messagerie reste ouverte sans limite de durée.** Justification retenue au-delà du
  confort : les **garanties postérieures à la réception** courent des années. Fermer le canal prive les
  deux parties de leur seul moyen de correspondance **au moment précis où les obligations du
  constructeur commencent à s'appliquer**. C'est un risque juridique pour l'entreprise.
- **Décision : blocage explicite, à l'initiative de l'une ou l'autre partie.** Solution proposée par
  MEEREO, **meilleure que celle envisagée initialement** : elle évite d'avoir à *interpréter*
  l'effacement d'une conversation — geste ambigu qui peut signifier « je range » aussi bien que « je ne
  veux plus être contacté ».

> **⚠️ Tension signalée entre ces deux décisions.** L'une maintient le canal ouvert *parce que* les
> garanties l'exigent ; l'autre permet de le couper. **Que se passe-t-il si un professionnel bloque un
> client qui doit signaler un désordre couvert par la garantie décennale ?**
> **Résolution proposée :** bloquer coupe **le canal MEEREO**, rien d'autre. Les coordonnées obtenues à
> la signature (`AVS-05`) restent en possession des deux parties — téléphone, e-mail, courrier. **La
> relation contractuelle et les garanties ne sont pas affectées**, ce qui est cohérent avec les CGU où
> MEEREO n'est pas partie au contrat. L'historique n'est **jamais supprimé** par un blocage : en cas de
> litige, les échanges sont un élément de preuve.

**[AMENDÉ] `MSG-04` — dégradation du nommage constatée.** La conversation directe, affichée
« **Jayem Troh** », s'affiche désormais « **Contact** » — alors que c'est **le même fil**. Hypothèse à
vérifier en priorité : la relation Client ↔ Professionnel est rompue à la clôture, et la conversation
retombe sur un libellé par défaut. **Cela expliquerait simultanément la perte du nom et l'impossibilité
d'écrire — une seule correction traiterait les deux symptômes.**

**[AMENDÉ] Annexe 1 — deux points ouverts ajoutés :** modalités du blocage *(quatre sous-questions, avec
recommandations)* et conditions de réintroduction de l'export clients.

> **Ce que ce lot ajoute au référentiel.** Le **blocage** est un concept entièrement nouveau : aucune
> action de ce type n'existe dans la matrice `SYS-02`. Il faudra l'y inscrire, et décider s'il
> s'applique au groupe projet ou au seul fil direct — exclure quelqu'un d'un groupe où d'autres
> intervenants échangent poserait des problèmes de traçabilité collective.

---

### v1.37 — 27 juillet 2026 — *Lot : huit arbitrages produits — chaîne financière, appels d'offres et comptes employés*

> **Contexte.** Huit questions posées à MEEREO sur les points que le diagnostic ne pouvait pas trancher
> seul, complétées par les captures du parcours d'affectation d'équipe.

**Les décisions rendues, et ce qu'elles ferment :**

- **[AMENDÉ] `AOF-01` — correctif de la cause racine.** Un appel d'offres exige désormais une
  **fourchette de budget min/max obligatoire et visible** des candidats, et une **date de clôture
  obligatoire avec fermeture automatique**. *Fourchette plutôt que montant exact, parce qu'un montant
  exact affiché fait converger toutes les offres dessus. Min/max libres plutôt que tranches figées,
  parce que les tranches du prototype rangeraient un projet réel de 14 M dans la même case qu'un
  chantier de 3 M.* Prolongation d'échéance **non retenue** : elle supposerait de notifier les
  candidats déjà positionnés.
- **[AMENDÉ] `FIN-01` — le budget projet est PARTAGÉ avec le client**, et le circuit de la facture est
  tranché : émission par le professionnel → visibilité client → **déclaration du paiement par le
  client** → confirmation du professionnel. Strictement déclaratif, seule option compatible avec
  l'absence d'agrément. *Le circuit d'approbation/contestation a été écarté : il ferait de MEEREO
  l'arbitre d'un différend, ce que les CGU excluent expressément.*
- **[AMENDÉ] `FIN-04` — la cloison est confirmée comme un pur défaut.** Le budget étant celui du
  projet et non la planification interne du professionnel, **rien ne justifie de le masquer au client**.
- **[AMENDÉ] `PRJ-06`, `PRJ-12`, `SYS-02` — chaque employé dispose d'un compte.** Cette décision
  **confirme le référentiel plutôt qu'elle ne l'élargit** : `PRJ-06`/E4 prévoyait déjà quatre rôles
  internes, et des rôles qui *restreignent* n'ont de sens que si la personne se connecte. Elle rend en
  revanche **bloquante** la granularité de ces rôles, jusqu'ici « à préciser ».

**Ce que les captures du parcours d'affectation ont révélé :**

- **`PRJ-12` — preuve visuelle du défaut.** La modale « Ajouter un membre » affiche
  « **Votre équipe est vide** » alors que des membres ont été créés depuis la page publique.
  **Confirmation directe de l'hypothèse des deux référentiels.** S'y ajoute une aggravation : **au
  moins trois portes de création coexistent** — page publique, onglet « Nouveau membre », bouton
  « Créer un membre » — sans référentiel unique. `PRJ-06`/E1 n'est donc pas implémenté.
- **[NOUVEAU] `INS-18` — Comptes employés : création par invitation.** Le formulaire actuel **crée une
  fiche, pas un compte** : seul le nom est obligatoire, l'e-mail est facultatif, aucun rôle interne
  n'est proposé, et le bouton dit « Ajouter à l'équipe » — l'employé n'a aucun moyen de se connecter.
  Six éléments manquent, dont l'**e-mail obligatoire**, le **rôle interne**, l'**invitation** et
  l'**acceptation des CGU**.
- **Une confusion de vocabulaire à lever :** le champ « Poste / Rôle » est en texte libre et mélange le
  **métier** (descriptif, affiché au client) et le **rôle interne** (droits). *« Chef de projet »
  appartenant aux deux vocabulaires, la confusion est inévitable en l'état.* Deux champs distincts sont
  nécessaires.
- **`FIN-04` — une seconde source d'écriture pour le budget.** La modale « Éditer le projet » comporte
  un champ **Budget (FCFA) directement modifiable**, à 0. **Trois endroits peuvent donc écrire un
  budget, aucun ne fait autorité** — ce qui explique la divergence des montants sans la justifier.

**[AMENDÉ] Annexe 1 — cinq points clos, quatre ouverts.** Nouveaux points ouverts : granularité des
rôles internes *(bloquante)*, tarification des comptes employés *(18 collaborateurs = 18 accès sans
surcoût ?)*, modification du budget après signature, visibilité par défaut d'un employé.

> **Un point positif à consigner.** L'interface d'affectation **distingue correctement** « Mon équipe »
> et « Intervenants externes », conformément à `PRJ-05` et `PRJ-06`. **La structure est juste ; c'est
> la donnée qui ne suit pas.** La correction porte sur le référentiel, pas sur l'ergonomie.

---

### v1.36 — 27 juillet 2026 — *Lot : décision multilingue — l'anglais est reporté*

> **Contexte.** Signalement : le changement de langue ne fonctionne ni côté client ni côté
> professionnel. Quatre questions posées à MEEREO ont permis de qualifier le défaut et d'obtenir un
> **arbitrage produit** qui modifie une exigence figée.

**Ce que les réponses ont établi :**

1. Le sélecteur **change d'état**, mais l'interface **reste intégralement en français**.
2. MEEREO **n'a jamais vu d'anglais** nulle part dans l'application.
3. Il **n'existe aucun bouton d'enregistrement** sur cet onglet, contrairement à l'onglet Mon profil du
   même écran.
4. **Le français suffit au lancement.**

**Le diagnostic en découle directement : il n'y a rien à déboguer.** Les traductions n'ont jamais été
produites. **Le sélecteur est une coquille** — l'interface d'une fonctionnalité non construite. Il avait
d'ailleurs été signalé *absent* au 25/07/2026 : il a donc été **ajouté depuis, sans son contenu**.

**[AMENDÉ] `SYS-04` — décision : anglais reporté, français seul au lancement.** La phrase *« FR et EN
livrés ensemble au lancement (pas “FR d'abord, EN plus tard”) »* est **caduque**. Le sélecteur est
**retiré de l'interface** : une option qui ne fait rien est plus dommageable que son absence — elle
promet une capacité à l'endroit précis où l'utilisateur cherche à contrôler son espace.

> **⚠️ Ce que j'ai maintenu contre la simplification, et pourquoi.** L'abandon de l'anglais ne doit pas
> emporter avec lui l'**architecture d'externalisation des libellés**. Trois raisons :
> **(1) le coût est asymétrique** — externaliser maintenant est une discipline d'écriture, le faire
> après coup impose de reprendre chaque composant ; **(2) ce n'est plus une question de langue mais de
> qualité** — l'application laisse déjà fuir « `signed` » et « `Offer submitted` », donc **un
> utilisateur francophone lit aujourd'hui de l'anglais technique dans une application unilingue
> française** ; **(3) les formats** (dates, nombres, FCFA) doivent rester centralisés dans tous les cas.
> **Le besoin d'une table de libellés unique existe indépendamment de toute traduction.**

**[NOUVEAU] `SYS-07` — Paramètres › Préférences : options sans effet et absence de validation.** Deux
défauts distincts sur le même écran. Le sélecteur inerte, traité ci-dessus. Et surtout, **point soulevé
par MEEREO et qui dépasse la langue** : aucun bouton d'enregistrement sur cet onglet, alors que
**l'onglet Mon profil du même écran en comporte un**. Deux conventions coexistent sans que rien ne
l'indique, et **le silence après une action est ambigu** — l'utilisateur ne peut pas distinguer un
succès d'un échec.

> **Vérification demandée, qui ne figurait pas dans le signalement :** les **quatre autres réglages** de
> cet onglet — notifications e-mail et push, rappels planning, résumé hebdomadaire — **sont-ils
> réellement enregistrés et appliqués ?** Le sélecteur de langue étant inerte, rien ne le garantit.
> Corriger la langue sans tester les quatre autres serait imprudent.

**[AMENDÉ] `PRJ-13` — le défaut change de nature.** Les fuites en anglais ne sont pas les vestiges
d'une version anglaise : ce sont des valeurs techniques brutes. **Ce point ne disparaît donc pas avec
l'abandon de l'anglais — celui-ci devient au contraire le seul motif de le corriger.**

**[AMENDÉ] `SYS-06`** — la ligne « langue FR/EN » de la table des Paramètres et les deux mentions
« à ajouter le sélecteur » sont barrées et datées.

**[AMENDÉ] Annexe 1, point 9 (nouveau)** — la réouverture du multilingue est consignée comme différée,
**non invalidée**. À réexaminer avant toute ouverture vers le Ghana, le Nigeria ou une clientèle
internationale. **Condition posée pour que ce report reste réversible à coût raisonnable :** maintenir
l'externalisation des libellés dès maintenant.

> **Cohérence avec le reste du référentiel.** Cette décision s'accorde avec le périmètre juridique
> retenu en Annexe 8 — **Côte d'Ivoire + UEMOA**, zone majoritairement francophone. Les deux arbitrages
> pointent dans la même direction : **un lancement resserré sur le marché ivoirien**.

---

### v1.35 — 27 juillet 2026 — *Lot : revue de l'espace client — cause racine financière, équipe cloisonnée, et correction d'un constat de l'audit*

> **Contexte.** Transmission des écrans de l'espace client (Budget, Mes demandes, Offres reçues,
> Accueil, Mes projets, Paramètres), plus un signalement direct sur la gestion de l'équipe.

**Le point signalé :**

- **[NOUVEAU] `PRJ-12` — L'équipe ne circule pas entre ses quatre emplacements. MAJEUR.** Un membre
  ajouté depuis la page publique ou les Paramètres n'est **ni sélectionnable** à l'affectation d'un
  projet, **ni visible** dans les Paramètres › Équipe, **ni visible par le client**. **`PRJ-06` est
  donc entièrement inopérant.** Cause probable : **deux référentiels d'équipe distincts** — l'un
  rattaché au contenu de la page publique, l'autre au compte — sans lien entre eux. Le symptôme
  décisif est qu'un membre ajouté d'un côté n'apparaît pas de l'autre.
  **Enjeu réel :** le client ne peut pas savoir **qui** travaille sur son chantier — il voit une raison
  sociale, pas des personnes.

**La découverte la plus utile de ce lot :**

- **[AMENDÉ] `FIN-04` — la cause racine est identifiée, et elle est unique.** L'appel d'offres publié
  par le client affiche **« BUDGET — »** et **« CLOTURE — »**. Toute la chaîne en découle
  mécaniquement : appel d'offres sans budget → offre à 0 FCFA → marché à 0 FCFA → budget projet à
  0 FCFA. **Ce ne sont pas quatre défauts mais un seul, propagé.** Corriger l'offre ou le marché sans
  rendre le budget obligatoire à la publication ne servirait à rien.
- **[AMENDÉ] `FIN-04` — portée élargie : le client ne voit aucune donnée financière.** Ses quatre
  indicateurs sont à zéro, alors qu'existent côté professionnel un budget de **14 000 000 FCFA** et une
  facture **validée de 3 500 000 FCFA**. **Ce n'est pas une divergence d'affichage, c'est une
  cloison** : le maître d'ouvrage — celui qui paie — ignore qu'une facture de 3,5 M a été validée sur
  son chantier. `FIN-01` prévoit pourtant une transversalité Client ↔ Professionnel et un relevé
  financier livrable au client.

**Une correction de mon propre audit, qu'il est honnête de signaler :**

- **[AMENDÉ] `INS-08` — la production diffère du prototype.** Les champs **Téléphone** et **Ville**
  **existent et sont renseignés** dans les Paramètres du client (`+225 0504440382`, `Abidjan`).
  **L'audit de l'Annexe 6 portait sur le prototype, pas sur la production** — la réserve était posée en
  A6.5, elle se vérifie ici. Reste à départager deux hypothèses : le parcours de production collecte
  réellement ces champs *(point sans objet)*, ou ils ont été saisis à la main depuis les Paramètres
  *(défaut subsistant)*. **Créer un compte de test tranche en cinq minutes.**
- **[AMENDÉ] Annexe 1, point 1 — question close.** La **photo de profil client existe en production**
  et s'affiche. Seule la sous-question de propagation reste ouverte.

**Une réserve levée, un point positif confirmé :**

- **[AMENDÉ] `AOF-04` — la réserve de méthode posée en v1.33 était fondée.** La Bourse affiche
  légitimement « 0 disponibles » : **un seul appel d'offres existe et il est déjà attribué**
  (« AO ouverts : 0 »). **Le filtre n'a donc jamais été mis à l'épreuve** — il ne peut être ni confirmé
  ni infirmé. En revanche, l'appel d'offres porte la mention « **Visible par les Architecte & Design** » :
  **le ciblage par métier fonctionne à la publication**, ce qui n'était pas acquis. Protocole :
  publier trois appels d'offres ouverts de métiers différents avant de conclure.

**Trois confirmations et un nouveau point :**

- **[AMENDÉ] `PRJ-11`** — la contradiction « Projet clôturé » / phase « En cours » apparaît **à
  l'identique côté client**. Le défaut est donc dans un **composant partagé** : une seule correction
  traitera les deux espaces.
- **[AMENDÉ] `QAL-04`** — filtres dupliqués et flèche rendue « à » **également présents côté client**,
  plus quatre occurrences nouvelles dont « 1 intervenants » (accord) et un **séparateur orphelin**.
- **[NOUVEAU] `PRJ-13` — Espace client : blocs contradictoires et messages destinés au professionnel.**
  Deux sections « **Marchés** » se suivent sur la même page, l'une affichant **1**, l'autre **0**. Et
  l'état vide invite le client à « créer des marchés depuis l'onglet Marchés » — **un onglet qui
  n'existe pas dans son espace**, pour une action qui ne lui revient pas. S'y ajoute un statut
  « `signed` » non traduit, révélant que **certaines valeurs n'empruntent pas la couche de
  traduction** — à traiter avant le chantier multilingue (`SYS-04`), pas après.
- **[AMENDÉ] `AVS-04`** — **non vérifiable** : l'écran « Choix & validations » n'a pas été transmis. On
  ignore encore si l'avis existe en base et n'est qu'invisible, ou s'il n'a jamais été enregistré.
  **Les deux hypothèses appellent des corrections très différentes.**

> **Ce que ce lot change dans l'ordre des priorités.** La cause racine financière étant unique et située
> **à la publication de l'appel d'offres**, elle doit être corrigée **avant** tout le reste de la
> chaîne — sans quoi les corrections aval seront invisibles. Et le fil rouge de v1.34 se confirme
> encore : `PRJ-11`, `PRJ-13` et `QAL-04` sont tous des cas où **un écran décide seul de ce qu'il
> affiche** au lieu de lire une donnée unique.

---

### v1.34 — 27 juillet 2026 — *Lot : plantage des marchés + revue complète du cockpit professionnel*

> **Contexte.** Signalement d'un **plantage bloquant** à l'ouverture d'un marché, accompagné de
> **vingt captures couvrant l'ensemble des écrans** du cockpit professionnel et de la page publique
> (hors Paramètres), avec la consigne explicite de tout examiner.

**Le point signalé :**

- **[NOUVEAU] `AOF-05` — Plantage à l'ouverture d'un marché. BLOQUANT.** *Minified React error #31* :
  un composant tente d'afficher un **objet vide `{}`** là où une valeur affichable est attendue. Trois
  causes probables classées, la plus vraisemblable étant un **montant de type décimal mal sérialisé**
  — ces types produisent `{}` en JSON sans conversion explicite. **Premier réflexe recommandé :
  reproduire en mode développement**, le message minifié ne nommant ni le composant ni la propriété.
  Indice le plus utile : **la liste fonctionne, le détail échoue** — chercher parmi les champs présents
  dans l'un et absents de l'autre. Deux garde-fous demandés : validation en sortie d'API, et *error
  boundary* au niveau du panneau plutôt que de la page, pour qu'un champ mal typé ne détruise pas
  l'écran entier.

**Quatre constats non signalés, issus du recoupement des captures :**

- **[NOUVEAU] `FIN-04` — Chaîne financière rompue. MAJEUR.** Six écrans du même projet affichent des
  montants contradictoires : **0 FCFA** pour l'offre, le marché, le contrat et le budget du projet,
  mais **14 000 000 FCFA** en budget Finance et une facture **validée de 3 500 000 FCFA**. Trois
  ruptures distinctes : une offre a pu être **acceptée à 0 FCFA** avec un délai vide ; le marché
  **n'hérite pas** des données de l'offre ; le module Finance est **déconnecté** des marchés — la
  timeline affiche « Aucun flux financier » tout en promettant à l'écran de se remplir depuis les
  marchés et paiements. **Probablement la même origine que `AOF-05`.**
- **[NOUVEAU] `INS-17` — Page publique : contenu de démonstration servi en production. MAJEUR.** La
  page affiche « **Votre Entreprise** », 18 collaborateurs, 47 projets réalisés, trois certifications
  et quatre références — pour un compte créé le jour même, avec 1 projet et **0 document déposé**. La
  page **se contredit elle-même** : création en 2014 dans les chiffres, en 2020 dans le texte.
  ⚠️ **Portée juridique** : afficher des certifications non détenues et des références fictives relève
  de la pratique commerciale trompeuse (loi n° 2016-412). **À traiter avant toute ouverture publique.**
- **[NOUVEAU] `QAL-04` — Défauts d'affichage transverses.** Le caractère « → » est rendu « **à** » sur
  au moins **six écrans** ; la page publique est **intégralement dépourvue d'accents** ; les filtres de
  la liste de projets sont **dupliqués** (« Conception » trois fois, « Préparation » trois fois).
  L'origine est **technique et partagée**, vraisemblablement un utilitaire de normalisation appliqué
  par erreur à des chaînes d'affichage : les corriger à la main serait inefficace.
- **[AMENDÉ] `INS-04` — le badge est affiché sans aucune vérification.** Le badge « Professionnel
  vérifié MEEREO » apparaît alors que le module Documents affiche « 0 documents ». **Aucune des
  conditions cumulatives de ce point n'est remplie.** C'est l'exact inverse de son objet : le badge est
  le socle de confiance de la plateforme, et **un badge faux est plus dommageable que pas de badge du
  tout** — il transforme une garantie en tromperie et engage MEEREO.

**Deux rapprochements établis avec des points existants :**

- **[AMENDÉ] `PRJ-11`** — le même projet porte **trois états différents selon l'écran** : « Terminé »
  au suivi chantier, « En cours » dans les phases de mission, « livraison imminente » avec **alerte
  rouge** au tableau de bord, et « Clôturé — validé par le client » dans le bandeau. Chaque écran
  **recalcule l'état localement** au lieu de lire une donnée unique.
- **[AMENDÉ] `MSG-08`** — le doublon ne concerne pas que les conversations : « Demande de clôture
  envoyée » apparaît **deux fois** dans l'activité récente. Un second doublon sur un objet différent
  renforce l'hypothèse d'un **défaut d'idempotence général**, et non d'un défaut propre à la messagerie.

> **Ce que ces constats ont en commun.** Cinq des sept points de ce lot relèvent du même principe :
> **une information affichée doit être dérivée d'une donnée unique, jamais recalculée ou posée
> localement.** Le badge, l'état du projet, les montants, le bouton de validation : à chaque fois, un
> écran décide seul de ce qu'il montre. C'est le principe déjà posé par `QAL-02` pour le logo et par
> `INS-06` pour l'état des boutons — il reste à l'étendre à l'état et aux montants.

---

### v1.33 — 26 juillet 2026 — *Lot : cinq anomalies constatées en production (AO, messagerie, clôture, avis, session)*

> **Contexte.** Signalement de MEEREO appuyé par six captures d'écran des espaces Professionnel et
> Client de `dev.meereo.com`. Cinq points rapportés, instruits ci-dessous, **plus deux constats
> supplémentaires relevés sur les mêmes captures et non signalés**.

**Nouveaux points (5) :**

- **[NOUVEAU] `AOF-04`** — Filtre par métier de la Bourse inopérant. **Cause racine probable : ce n'est
  pas un défaut de filtre mais un défaut de donnée.** `INS-11` a établi que les secteurs étaient saisis
  puis perdus ; un filtre par métier ne peut pas fonctionner si aucun métier n'est associé aux comptes.
  La capture affiche d'ailleurs « **Mes secteurs : 0** ». **Corriger `INS-11` d'abord.**
- **[NOUVEAU] `MSG-08`** — Conversations multiples créées à l'attribution d'un marché. Deux indices
  convergents : le client voit **deux groupes de projet aux noms de formats différents**
  (`PROJET FAMILLE — MILLENIUM CONSTRUCTION` et `Projet : PROJET FAMILLE`), ce qui trahit deux points
  de création distincts ; et l'asymétrie **2 conversations côté pro / 3 côté client** suggère qu'un
  groupe a été créé sans son destinataire principal.
- **[NOUVEAU] `PRJ-11`** — Le bouton de validation persiste après clôture. L'écran professionnel se
  contredit lui-même : bandeau « Clôturé — validé par le client » **et** bouton « Valider le projet ».
  Cause probable : l'affichage de l'action est conditionné à « toutes les tâches terminées », vrai
  **avant comme après** la clôture. L'action doit être dérivée de **l'état du projet**.
- **[NOUVEAU] `AVS-04`** — Avis enregistrés mais jamais publiés. La page publique enchaîne
  Certifications, Références et pied de page : **aucune section d'avis n'existe**. Le lot précise aussi
  la cohérence de la note moyenne (source unique, arrondi identique partout, nombre d'avis affiché,
  état « aucun avis » distinct d'une note de 0).
- **[NOUVEAU] `NAV-07`** — Déconnexion/reconnexion apparente à la création d'un profil. Quatre
  hypothèses techniques classées par probabilité, avec le moyen de vérifier chacune. **Distinction
  essentielle : le renouvellement du jeton est probablement nécessaire, sa visibilité ne l'est pas.**

**Deux constats supplémentaires, non signalés dans la demande :**

- **[AMENDÉ] `INS-05` — l'URL publique n'est pas implémentée.** La page professionnelle est servie à
  `/pro/04b7af02-0ab2-4b55-93c9-1ac67af77cdb`, un identifiant technique brut, alors que le pied de page
  de cette même page affiche le format cible `meereo.com/pro/votre-entreprise`. **Le professionnel qui
  copie son URL diffuse une chaîne illisible ; s'il recopie celle du pied de page, il diffuse un lien
  mort.** Ce défaut annule l'essentiel de la valeur de la page publique et affaiblit `AVS-04`.
- **[AMENDÉ] `PRJ-11`** — sur la capture **client** d'un projet clôturé, le bouton « **Arrêter ce
  projet** » reste proposé. Même règle : action dérivée de l'état.

**Rapprochements établis entre points existants :**

- **`NAV-06` et `NAV-07` ont vraisemblablement la même cause racine.** La fenêtre de renouvellement du
  jeton laisse partir des requêtes non authentifiées — soit exactement le symptôme « Token manquant ».
  **À traiter comme un seul chantier.**
- **`MSG-04`, `MSG-07`, `PRJ-01` et `AOF-02`** sont amendés en renvoi vers `MSG-08` : tant que le
  doublon subsiste, la règle de `MSG-07` est inapplicable — on ne sait pas à quel groupe rattacher un
  nouvel intervenant.
- **[AMENDÉ] Annexe 1, point 8 (nouveau)** — affichage du type de projet dans les avis publics :
  arbitrage de confidentialité à rendre.

> **Réserve de méthode, à ne pas escamoter.** La capture de la Bourse **ne démontre pas** que le filtre
> est défaillant : elle affiche « 0 disponibles ». Aucun filtre ne produit de résultat sur un ensemble
> vide. Le défaut est **rapporté mais non prouvé par cette image** — il faut le reproduire sur au moins
> deux appels d'offres de métiers différents. Cette précision n'est pas un doute sur le constat : elle
> évite de traiter un symptôme d'absence de données comme un défaut de code.

---

### v1.32 — 26 juillet 2026 — *Lot : intégration des textes juridiques et contradiction du modèle de paiement*

> **Contexte.** Demande de MEEREO : rédiger les CGU et les textes associés, appelés par `INS-10`, et
> les **intégrer directement au référentiel**. Périmètre arbitré par MEEREO : **Côte d'Ivoire + UEMOA,
> sans RGPD**.

**[NOUVEAU] Annexe 8 — Textes juridiques de la plateforme.** Quatre textes en version
`2026-07-CI-v1`, rédigés à partir du fonctionnement réel décrit par le présent référentiel :
Conditions Générales d'Utilisation, Conditions Générales de Vente de la Marketplace, Politique de
confidentialité, Mentions légales. S'y ajoute une section de **préalables bloquants** (A8.1).

**⚠️ Ces textes ne sont PAS validés juridiquement** et ne doivent pas être publiés sans relecture par
un avocat inscrit au barreau de Côte d'Ivoire. **53 marqueurs `[[À COMPLÉTER]]`** subsistent.

**[AMENDÉ] `FIN-02` — contradiction interne relevée, à trancher avant tout développement de paiement.**
C'est le constat le plus lourd de ce lot, découvert en rédigeant les textes. `FIN-02` affirme que
MEEREO encaisse réellement les « petits achats Marketplace » ; `FIN-03` Phase 2 affirme l'inverse en
invoquant l'absence d'agrément d'établissement de paiement, et `SYS-06` le confirme (« le fournisseur
reçoit directement de l'acheteur »). **Les deux premières affirmations sont incompatibles**, et le
choix détermine le régime réglementaire applicable à MEEREO au regard de la réglementation
BCEAO/UEMOA. Les textes juridiques sont rédigés sur la base de `FIN-03` — MEEREO n'encaisse que ses
propres revenus — parce que revendiquer un encaissement pour compte de tiers sans agrément expose à
une qualification d'exercice illégal. **Tant que le point n'est pas tranché, les CGV ne doivent pas
être publiées.**

**[AMENDÉ] `INS-10`** — les textes appelés par ce point existent désormais ; leur statut exact
(projet non validé) est consigné. La constante `TERMS_VERSION` du code correspond à la version
`2026-07-CI-v1`.

**[AMENDÉ] Annexe 1, point 6** — périmètre territorial arbitré (Côte d'Ivoire + UEMOA, sans RGPD).
**Conséquence à traiter : retirer la mention « RGPD » de l'écran de connexion** — afficher une
conformité qu'on n'assume pas est une allégation vérifiable, donc un risque en soi.

**Deux obligations indépendantes de ces textes, à ne pas confondre avec eux :**

1. La **déclaration préalable à l'ARTCI** de tout traitement de données personnelles, exigée par la
   loi n° 2013-450 **avant** mise en œuvre.
2. Le **fichier national des correspondants à la protection des données** mis en place par l'ARTCI,
   avec une **échéance de déclaration au 31 janvier 2026** — à vérifier auprès de l'ARTCI.

> **Réserve de méthode.** Les références légales citées ont été vérifiées par recherche documentaire,
> **non par consultation juridique**. Leur applicabilité précise au cas de MEEREO doit être confirmée
> par un avocat. La rédaction reflète fidèlement le produit ; elle ne garantit pas le droit.

---

### v1.31 — 26 juillet 2026 — *Lot : implémentation et vérification des priorités 1 et 2 de l'audit*

> **Contexte.** Suite directe de v1.30. Demande de MEEREO : produire le **code** correspondant aux
> constats de l'audit, l'**intégrer dans un parcours complet**, et le **tester avant transmission** au
> développeur. Livrable : `MEEREO-onboarding-code-P1-P2-v2-teste.zip` (React / Next.js + API).

**Ce que ce lot ferme.** Six points passent de « à corriger » à « implémenté et testé » : `INS-08`
(téléphone et ville), `INS-09` (unicité et vérification e-mail), `INS-10` (consentements),
`INS-11` (secteurs enregistrés), `INS-13` (brouillon serveur, purge après acquittement, expiration),
`MKT-06` (complétude opérationnelle du fournisseur). `INS-15` est corrigé **en supplément** : il venait
gratuitement avec l'orchestrateur.

**Ce que ce lot ne ferme pas, et le dit.** `INS-12` (repli du logo) n'est **pas** corrigé — une étape a
été créée pour rendre le parcours franchissable, rien de plus. `INS-16` n'est corrigé **qu'en partie** :
les valeurs par défaut ont disparu, mais l'écran de fin client reste à traiter. `INS-14` reste à
trancher.

**Amendements datés :**

- **[AMENDÉ] `INS-08`, `INS-09`, `INS-10`, `INS-11`, `INS-13`, `MKT-06`** — bloc « ✅ implémenté et
  testé » précisant ce qui est fait, ce qui est vérifié, et les réserves restantes.
- **[AMENDÉ] `INS-12`** — bloc « ❌ non corrigé », pour qu'une étape existante ne soit pas prise pour
  une exigence satisfaite.
- **[AMENDÉ] `INS-16`** — bloc « 🟡 partiellement corrigé ».
- **[AMENDÉ] `INS-15`** — **correction d'un chiffre de ce point** : le parcours fournisseur passe de 5 à
  **6 étapes** de saisie, l'étape « Encaissement & livraison » (`MKT-06 §4`) n'existant pas auparavant.
  Décompte à jour : Client 3, Professionnel 4, Fournisseur 6. Aucun rôle ne compte 5 étapes — le « 5 »
  codé en dur du prototype était donc faux pour les trois.
- **[AMENDÉ] Annexe 1** — les 4 hypothèses codées faute d'arbitrage sont signalées comme telles.

**[NOUVEAU] Annexe 7** — architecture du lot, couverture de vérification (**73 tests, 0 échec**), deux
défauts trouvés par les tests, comportements assumés, décisions à valider, et reste à faire.

> **Un enseignement à consigner.** Le test de rendu a détecté un défaut que les tests de validation ne
> pouvaient pas voir : un effet React dépendant d'un objet recréé à chaque rendu bouclait et gardait le
> bouton « Continuer » désactivé en permanence — **le parcours était infranchissable alors que toutes
> les règles de validation étaient justes**. Conclusion pour la suite : sur un parcours d'inscription,
> tester les règles ne suffit pas ; il faut jouer le parcours.

> **Avertissement de méthode, inchangé.** Aucun test ne tourne contre une vraie base de données ni un
> vrai navigateur (doublures en mémoire et DOM simulé). Le lot part de l'audit du **prototype**, pas de
> la production : certains champs existent peut-être déjà côté serveur. À reconfirmer avant intégration.

---

### v1.30 — 26 juillet 2026 — *Lot : audit de traçabilité du parcours d'inscription (« tout fonctionne, tout est intégré »)*

> **Contexte.** Demande directe de MEEREO : intégrer au référentiel le travail mené sur le parcours d'inscription, et **auditer le workflow complet pour vérifier que l'inscription fonctionne de bout en bout et que toutes les informations collectées sont intégrées dans la plateforme.** L'audit a été mené sur le prototype `meereo_parcours_complet_v2.html` (15 écrans, 3 rôles), par lecture intégrale du balisage et du script, puis confrontation ligne à ligne au référentiel v1.29.

**Méthode retenue — et pourquoi elle change le résultat.** L'audit ne s'est pas limité à « chaque champ saisi est-il valide ? » (question déjà traitée en v1.28). Il a posé la **question inverse, plus révélatrice** : *pour chaque donnée que le référentiel décrit comme existante en aval (Paramètres, annuaire, Marketplace, page publique), quelle étape du parcours la remplit ?* Cette seconde lecture a mis au jour **neuf champs orphelins** — décrits et éditables dans `SYS-06` ou `MKT-01`, mais qu'aucun écran d'inscription ne renseigne jamais.

**Résultat d'ensemble** (33 lignes de matrice, décompte détaillé en A6.3). **21 données sont effectivement saisies** par l'utilisateur : 9 sans réserve, 9 avec un défaut identifié, **2 saisies puis rendues inexploitables**, 1 en attente d'arbitrage. S'y ajoutent **10 champs orphelins** — attendus en aval par `SYS-06` ou `MKT-01`, jamais renseignés par aucun écran. Le parcours est **solide sur l'identité légale** (`INS-01` est exemplaire : format contrôlé, valeur d'exemple rejetée, bouton dérivé de l'état des champs) et **défaillant sur la mise en service du compte**. Ce déséquilibre a une cause unique et identifiable : le parcours a été conçu autour de *l'ouverture* d'un compte, pas de sa *mise en service*.

**Nouveaux points (10) :**

- **[NOUVEAU] `INS-08`** — Téléphone et ville : **jamais collectés**, alors que `SYS-06` les décrit dans les Paramètres des trois rôles. Conséquences avérées : `MSG-01` (canal de contact) et surtout `FIN-02` (Orange Money, MTN MoMo, Wave — services dont l'identifiant **est** un numéro de téléphone) sont inopérants.
- **[NOUVEAU] `INS-09`** — E-mail : validé par son seul format. Ni unicité (pourtant structurante dans `AVS-03`), ni vérification de possession. Une faute de frappe crée un compte **définitivement inaccessible** — une impasse du type même que `INS-06` a pour objet d'éliminer, mais irrattrapable.
- **[NOUVEAU] `INS-10`** — Aucune acceptation des CGU ni de la politique de confidentialité dans tout le parcours. La mention « RGPD » de l'écran de connexion est un argument de réassurance, pas un consentement recueilli.
- **[NOUVEAU] `INS-11`** — Secteurs d'activité du professionnel : **saisis puis perdus**. La fonction `tog()` bascule une classe CSS et rien d'autre ; les puces n'ont aucun identifiant et ne sont lues nulle part. Or `AOF-01` diffuse les appels d'offres publics « aux pros du bon secteur » : **sans cette donnée, aucun routage n'est possible.**
- **[NOUVEAU] `INS-12`** — Logo : étape franchissable à vide (ce qui produit `NAV-04` par construction), aucune valeur de repli définie pour `QAL-02`, et générateur affichant un « M » et « Votre Structure » **codés en dur**, sans jamais lire le nom saisi à l'écran précédent.
- **[NOUVEAU] `INS-13`** — Brouillon d'inscription : trois limites structurelles de l'implémentation du 26/07/2026 — stockage purement local (ne survit ni au changement d'appareil ni au vidage du cache), effacement **avant** acquittement du serveur (une erreur réseau perd toute la saisie), et horodatage enregistré mais **jamais relu** (aucune expiration).
- **[NOUVEAU] `INS-14`** — Rôle : cumul et changement non spécifiés. Met au jour une **conséquence non voulue de `INS-01`** : l'unicité stricte du RCCM interdit mécaniquement à une même entreprise d'ouvrir un compte Professionnel **et** un compte Fournisseur — cas pourtant courant dans le BTP ivoirien. **À trancher.**
- **[NOUVEAU] `INS-15`** — Fil d'étapes : 5 points affichés en dur pour les 3 rôles, alors que seul le parcours Fournisseur en compte 5 (Client : 3, Professionnel : 4). Plus trois conventions de libellé différentes pour l'écran final.
- **[NOUVEAU] `INS-16`** — Recommandation KAi de fin de parcours client : la première vignette de projet porte `sel` **codé en dur** et le budget a une option `selected`. Un client qui **passe** l'étape voit donc KAi affirmer *« Pour votre villa / maison […] j'ai déjà pré-rempli l'essentiel à partir de vos informations »* — **KAi présente des valeurs par défaut comme des données saisies**, en violation directe de son principe fondateur de non-invention.
- **[NOUVEAU] `MKT-06`** — Complétude opérationnelle du fournisseur. **Question posée : un fournisseur qui termine l'inscription peut-il vendre ? Réponse vérifiée : non**, alors que l'écran final affiche « Votre marketplace est prête […] Vous pouvez commencer à vendre ». Cinq manques : produit sans **stock** (que `MKT-01` déclare pourtant obligatoire) ni **unité** ; **liste de catégories sans correspondance avec MeereoShop** (6 des 8 catégories proposées n'existent pas dans la Marketplace — une seule correspondance exacte, « Électricité ») ; aucune **catégorie servie** déclarée ; **aucun moyen de réception de paiement** configuré (le fournisseur ne peut donc pas être payé, et MEEREO n'encaisse pas pour lui) ; aucune **zone de livraison**.

**Amendements datés sur des points existants :**

- **[AMENDÉ] `INS-06`** — le bug d'origine (impasse en fin de parcours) est **corrigé dans le prototype v2** : `validateAccount()` et `validateReset()` dérivent l'état du bouton des champs, l'impasse ne peut plus se produire. L'audit ajoute en revanche **trois cas d'impasse d'une autre nature**, non couverts par la rédaction initiale.
- **[AMENDÉ] `INS-02`** — renvoi vers `INS-12` : l'unicité du logo est respectée par l'interface, mais rien n'impose qu'un logo existe.
- **[AMENDÉ] `MKT-01`** — renvoi vers `MKT-06` : le « premier produit créé à l'inscription » ne respecte pas le formulaire décrit par `MKT-01` lui-même.
- **[AMENDÉ] `SYS-06`** — renvoi vers l'Annexe 6 : plusieurs champs documentés comme éditables dans les Paramètres n'ont aucune origine dans le parcours.
- **[AMENDÉ] Annexe 1** — cinq points ouverts ajoutés (rôle, vérification e-mail, logo bloquant, CGU/régime juridique, durée du brouillon) ; les deux points rouverts en v1.28 (photo client, politique de mot de passe) sont **confirmés toujours ouverts**, ce dernier étant désormais bloquant pour trois implémentations.

**[NOUVEAU] Annexe 6** — Audit de traçabilité complet : matrice « donnée collectée → destination plateforme » pour les 4 groupes du parcours (tronc commun, Client, Professionnel, Fournisseur), synthèse chiffrée, ordre de traitement recommandé en 3 priorités fondé sur les dépendances techniques, et **délimitation explicite de ce que l'audit ne couvre pas**.

> **Avertissement de méthode, repris de l'Annexe 5 et toujours valable.** Cet audit porte sur un **prototype de démonstration**, pas sur le code de production. Chaque constat doit être **reconfirmé sur l'application réelle avant correction** : il est possible que certains champs manquants ici existent déjà en production. Aucun comportement serveur n'a pu être vérifié (unicité en base, persistance, hachage, transactionnalité) — le prototype ne réalise aucun appel réseau.

---

### v1.29 — 25 juillet 2026 — *Lot : propagation de la photo/logo de profil par rôle (suite directe de la revue v1.28)*

> **Contexte.** Demande directe de MEEREO : au-delà de la simple présence du champ à l'inscription (traité en v1.28), vérifier que la photo de profil (client) et le logo (professionnel, fournisseur) sont bien **intégrés dans toutes les sections adéquates** de la plateforme, ou identifier où cette intégration manque.

- **[AMENDÉ] `QAL-02`** — précision de portée : le libellé « profil professionnel » couvre **les deux rôles à profil d'entreprise** (Professionnel **et** Fournisseur), confirmés tous deux dotés d'un logo unique par le prototype (`p-logo`/`f-logo`). Ajout de la Marketplace (fiche produit, boutique fournisseur, recherche Marketplace) à la liste des sections où le logo doit impérativement apparaître — absente jusqu'ici. Distinction explicitée entre le **logo fournisseur** (identité de l'entreprise) et la **photo produit** (`MKT-01`), deux données différentes à ne pas confondre.
- **[AMENDÉ] `MKT-01`, `MKT-03`** — ajout de la dépendance `QAL-02`, absente jusqu'ici : aucun des deux points ne référençait le principe de source unique du logo, alors que la Marketplace est une section où l'entreprise (fournisseur) apparaît.
- **[AMENDÉ] Annexe 1**, point rouvert n°1 (photo de profil client) — sous-question ajoutée : **si** un champ photo client est retenu, selon quel principe de propagation doit-il s'afficher (conversations, avis, notifications) ? Explicitement **non tranchée**, et explicitement **subordonnée** à la décision d'existence du champ (pas de règle de propagation pour une donnée qui n'existe pas).
- **Point de méthode :** aucune photo de profil client n'existant à ce jour dans le parcours observé, il n'y a **rien à corriger côté propagation pour le Client** dans cette version — seulement une question ouverte à trancher en amont. La propagation Pro/Fournisseur, elle, existait déjà en principe (`QAL-02`) mais avec un **angle mort avéré** (Marketplace) désormais comblé.

---

### v1.28 — 25 juillet 2026 — *Lot : revue de code du prototype d'onboarding `meereo_parcours_complet.html`*

> **Contexte.** Ce prototype (login, mot de passe oublié/reset, 3 branches d'inscription Client/Professionnel/Fournisseur) avait été mentionné en v1.2 comme « livrable de design séparé, hors référentiel d'exigences », décrit uniquement de façon narrative. Il a cette fois été **lu intégralement, y compris son script JavaScript** (HTML, CSS et JS complets, 631 lignes) — ce qui permet, pour la première fois, une confrontation directe entre le code du prototype et les exigences déjà actées (`INS-01`, `INS-02`, `INS-06`, `SYS-04`), au lieu d'une lecture par captures d'écran.

- **[AMENDÉ] `INS-06`** — renvoi daté confirmant, par preuve de code, l'hypothèse (b) de l'Annexe 3/A3.2 : le bouton de l'écran commun d'inscription (`s-account`, `afterAccount()`) ne porte **aucune** condition de validation, contrairement aux écrans `p-struct`/`f-struct` du même fichier qui, eux, implémentent correctement le patron attendu (`checkLegal()` + `syncNext()`). Aucune exigence existante réécrite — renvoi ajouté en fin de bloc.
- **[NOUVEAU] `INS-07`** — Validation du nouveau mot de passe à la réinitialisation. Même défaut de validation retrouvé sur l'écran `s-reset` (mot de passe oublié), hors périmètre onboarding donc hors portée initiale de `INS-06` : nouveau code ouvert dans le domaine A.
- **[AMENDÉ] `INS-01`** — renvoi confirmant que le prototype implémente correctement, côté front, le format, le rejet de la valeur d'exemple et le blocage du bouton tant que les champs légaux ne sont pas valides ; l'unicité réelle en base reste, elle, non vérifiable sur un prototype statique (simulée par une liste codée en dur).
- **[AMENDÉ] `INS-02`** — renvoi confirmant la conformité du comportement d'écran (un seul mode actif entre génération et import, aucune coexistence visuelle de deux logos).
- **[AMENDÉ] `SYS-04`** — renvoi élargissant le constat d'absence de sélecteur de langue : déjà connu pour les Paramètres, il est confirmé sur l'intégralité de la connexion et de l'onboarding.
- **[RÉOUVERT] Annexe 1** — la mention « aucun point fonctionnel ne reste ouvert » est corrigée par un ajout daté : deux points rouverts par cette revue — présence/absence d'un champ photo de profil client à l'inscription (écart entre la description du journal v1.2 et le code réel du prototype), et politique de complexité du mot de passe (non définie au-delà de « 8 caractères »).
- **[NOUVEAU]** Ajout de l'**Annexe 5 — Revue du prototype `meereo_parcours_complet.html`**, détaillant la méthode, les écrans lus, les fonctions JS analysées, les confirmations, les écarts et les limites propres à un prototype statique (ce qu'il ne permet pas de vérifier : unicité serveur, sécurité réelle du mot de passe, comportement réseau).

*Base observée :* lecture intégrale du fichier `meereo_parcours_complet.html` fourni par MEEREO le 25/07/2026 (HTML, CSS, JavaScript complets — aucune capture d'écran cette fois, code source direct).

---

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
- **Préférences** — contenu réel constaté (notifications email/push, **rappels planning**, **résumé hebdomadaire**) ; ~~manque : sélecteur de langue FR/EN~~ → **[CORRIGÉ 27/07/2026]** sélecteur ajouté mais **inopérant**, à **retirer** (`SYS-04`, `SYS-07`).
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

---

# ANNEXE 5 — Revue du prototype `meereo_parcours_complet.html`

**Ajouté :** v1.28. Contrairement aux revues précédentes (fondées sur des captures d'écran statiques), celle-ci s'appuie sur la **lecture intégrale du code source** du prototype : HTML, CSS et JavaScript, 631 lignes, aucune omission. C'est la première fois que le référentiel confronte directement du code à ses exigences, plutôt que des captures ou des descriptions.

## A5.1 — Méthode et périmètre

**Fichier revu :** `meereo_parcours_complet.html`, prototype de démonstration statique (navigation gérée par une fonction `go(id)` en JavaScript pur, sans backend réel). Il ne s'agit **pas** de l'application MEEREO en production : c'est une maquette interactive utilisée pour spécifier le comportement attendu du parcours de connexion et d'inscription.

**Écrans lus intégralement :** `s-login` (connexion), `s-forgot` (mot de passe oublié), `s-sent` (lien envoyé), `s-reset` (nouveau mot de passe), `s-role` (choix du rôle, Étape 1), `s-account` (compte commun aux 3 rôles, Étape 2), `c-project`/`c-done` (branche Client, Étapes 3), `p-struct`/`p-logo`/`p-done` (branche Professionnel, Étapes 3-4), `f-struct`/`f-logo`/`f-mat`/`f-done` (branche Fournisseur, Étapes 3-5).

**Fonctions JavaScript analysées :** `selRole()`, `afterAccount()`, `go()` (routage), `tp()` (afficher/masquer mot de passe), `selPick()`, `tog()`, `buildReco()` (moteur de recommandation KAi côté client), `checkLegal()` + `syncNext()` (validation RCCM/Contribuable), `logoMode()`/`pickSw()`/`pickShape()`/`regen()` (générateur de logo). Constantes : `RCCM_RE = /^CI-ABJ-\d{4}-[A-Z]-\d{4,6}$/`, `TAX_RE = /^CI-\d{7}-[A-Z]$/`, `TAKEN` (liste statique de démonstration pour simuler l'unicité).

## A5.2 — Confirmations (le prototype est conforme)

| Exigence | Constat |
|---|---|
| `INS-01` — format + rejet de l'exemple | Implémenté correctement pour Professionnel et Fournisseur (`checkLegal()`). |
| `INS-01` — bouton bloqué si invalide | Implémenté correctement (`syncNext()` désactive `p-next`/`f-next`). |
| `INS-02` — un seul logo actif | Comportement d'écran conforme (`logoMode()`, bascule exclusive génération/import). |
| `INS-06` — exception « démarrer vite, compléter ensuite » | Correctement respectée : les étapes réellement optionnelles (projet client, premier matériau fournisseur) proposent un bouton « Passer cette étape » qui n'entraîne aucune perte de données obligatoires, car aucune n'y est requise. |
| Nommage **KAi** | Orthographe correcte partout dans ce fichier (aucune occurrence de « KAI »). |
| Aiguillage KAi fin de parcours client (`c-done`) | Bien implémenté : `buildReco()` adapte réellement le message et les deux CTA (appel d'offres / annuaire) selon le type de projet saisi — illustration fonctionnelle cohérente avec le comportement proactif décrit dans la spécification KAi. |

## A5.3 — Écarts confirmés (nouveaux points, intégrés au corps du référentiel)

| Écart | Renvoi |
|---|---|
| Écran `s-account` (compte commun, Étape 2) : bouton « Continuer » sans aucune validation, cause racine exacte du bug déjà décrit par `INS-06` | Voir `INS-06`, note du 25/07/2026 |
| Écran `s-reset` (nouveau mot de passe) : même absence totale de validation, hors périmètre onboarding | Nouveau code `INS-07` |
| Absence de sélecteur de langue sur la connexion et les 3 parcours d'inscription | Voir `SYS-04`, note du 25/07/2026 |
| Écart entre la description du journal v1.2 (« photo de profil optionnelle » pour le client) et le code réel (aucun champ photo observé) | Voir Annexe 1, point rouvert |
| *(ajouté v1.29)* Marketplace absente de la liste des sections où le logo fournisseur doit s'afficher ; `MKT-01`/`MKT-03` ne référençaient pas `QAL-02` | Voir `QAL-02`, `MKT-01`, `MKT-03`, notes du 25/07/2026 |
| *(ajouté v1.29)* Aucune règle de propagation définie pour une éventuelle photo de profil client (conversations, avis, notifications) — question subordonnée au point ci-dessus sur l'existence du champ | Voir Annexe 1, sous-question ajoutée |

## A5.4 — Limites de cet exercice (ce qu'un prototype statique ne permet pas de vérifier)

1. **Unicité réelle du RCCM/Contribuable en base.** Le prototype simule ce contrôle avec une liste codée en dur (`TAKEN`, un seul numéro). Aucune conclusion ne peut être tirée sur le comportement du serveur réel.
2. **Sécurité effective du mot de passe** (hachage, transmission, stockage) — hors du périmètre d'un prototype front-end pur.
3. **Comportement réseau réel** (latence, gestion d'erreur serveur, expiration de session) — le prototype ne fait aucun appel réseau, tout est simulé en mémoire par `go()`.
4. **Toutes les destinations post-inscription du prototype ramènent à l'écran de connexion** (`go('s-login')`), y compris les trois CTA de l'écran `c-done` qui, en production, doivent mener respectivement à la publication d'un appel d'offres, à l'annuaire, et au cockpit — ceci est une simplification assumée du prototype de démonstration, pas un bug à corriger.

> **Avertissement de méthode (identique à celui de l'Annexe 3) :** cette revue porte sur un **prototype de démonstration**, pas sur le code de production. Les écarts confirmés ci-dessus (A5.3) le sont **au niveau du prototype** ; leur présence ou non dans l'application réelle reste à vérifier par le développeur avant toute correction.

---

# ANNEXE 6 — Audit du parcours d'inscription : traçabilité « donnée collectée → destination plateforme »

**Date : 26/07/2026 · Périmètre : `meereo_parcours_complet_v2.html` (15 écrans, 3 rôles), confronté au référentiel v1.29.**

## A6.1 — Objet et méthode

Demande de MEEREO : *vérifier que lors de l'inscription tout fonctionne et que toutes les informations sont intégrées dans la plateforme.*

Cet audit ne juge ni l'esthétique ni l'ergonomie. Il répond à **deux questions**, et à elles seules :

1. **Traçabilité** — pour chaque donnée demandée à l'utilisateur pendant l'inscription : où va-t-elle dans la plateforme, et cette destination est-elle documentée ?
2. **Complétude** — pour chaque donnée dont le référentiel affirme l'existence en aval (Paramètres, page publique, annuaire, Marketplace) : par quelle étape du parcours a-t-elle été saisie ?

**La seconde question est la plus révélatrice.** Elle met au jour les champs *orphelins* : ceux que le référentiel décrit comme existants et éditables, mais qu'aucun écran d'inscription ne remplit jamais.

**Méthode.** Lecture intégrale du balisage et du script du prototype (recensement exhaustif des `input`, `select`, éléments cliquables porteurs de données, et de leur traitement en JavaScript), puis confrontation ligne à ligne au référentiel. Chaque constat de cette annexe est **vérifié dans le code ou dans le référentiel** ; aucun n'est déduit ni supposé.

## A6.2 — Matrice de traçabilité

**Légende :** ✅ collecté et destination documentée · ⚠️ collecté mais problème identifié · ❌ **jamais collecté** alors que le référentiel en dépend · ⏸ question ouverte, non tranchée.

### Tronc commun aux trois rôles

| Donnée | Écran | Destination documentée | Statut | Renvoi |
|---|---|---|---|---|
| Rôle (Client / Pro / Fournisseur) | `s-role` | `SYS-02` matrice de droits ; `SYS-06` structure des Paramètres | ⏸ | `INS-14` |
| Prénom | `s-account` | Paramètres › Profil (`SYS-06`) | ✅ | — |
| Nom | `s-account` | Paramètres › Profil (`SYS-06`) | ✅ | — |
| Adresse e-mail | `s-account` | Paramètres › Profil ; identité (`AVS-03`) ; canal de contact (`MSG-01`) ; notifications (`AVS-02`) | ⚠️ | `INS-09` |
| Mot de passe | `s-account` | Paramètres › Sécurité (`SYS-06`) | ⚠️ | Annexe 1, pt 2 |
| **Téléphone** | **aucun** | Paramètres › Profil ; `MSG-01` ; **`FIN-02` Mobile Money** | ❌ | `INS-08` |
| **Ville** | **aucun** | Paramètres › Profil ; annuaire (`ANN-*`) ; page publique | ❌ | `INS-08` |
| **Acceptation CGU / confidentialité** | **aucun** | — *(aucune destination : le consentement n'est pas prévu)* | ❌ | `INS-10` |
| **Photo de profil (Client)** | **aucun** | — *(existence du champ non tranchée)* | ⏸ | Annexe 1, pt 1 |

### Branche Client

| Donnée | Écran | Destination documentée | Statut | Renvoi |
|---|---|---|---|---|
| Type de projet | `c-project` | `PRJ-01` (projet) ; `AOF-01` (appel d'offres) | ⚠️ pré-sélectionné en dur | `INS-16` |
| Surface estimée | `c-project` | `PRJ-01` ; `AOF-01` | ⚠️ repli silencieux si vide | `INS-16` |
| Localisation **du projet** | `c-project` | `PRJ-01` ; `AOF-01` — **≠ ville du compte** | ⚠️ | `INS-08`, `INS-16` |
| Budget estimé | `c-project` | `FIN-01` (Budget) ; `AOF-01` | ⚠️ option pré-sélectionnée | `INS-16` |
| Recommandation KAi | `c-done` | Aiguillage vers `AOF-01` ou `ANN-01` | ❌ produite à partir de valeurs par défaut | `INS-16` |

### Branche Professionnel

| Donnée | Écran | Destination documentée | Statut | Renvoi |
|---|---|---|---|---|
| Nom de la structure | `p-struct` | Paramètres › Profil ; page publique (`INS-03`) ; annuaire (`ANN-*`) ; URL publique (`INS-05`) | ✅ | — |
| N° RCCM | `p-struct` | `INS-01` (unicité, vérification IA) ; `INS-04` (badge) ; verrouillé après vérification (`SYS-06`) | ✅ | — |
| N° Contribuable | `p-struct` | `INS-01` | ✅ | — |
| **Secteurs d'activité** | `p-struct` | Page pro (`SYS-06`) ; annuaire (`ANN-*`) ; **routage des AO publics (`AOF-01`)** | ❌ **saisis puis perdus** | `INS-11` |
| Logo | `p-logo` | `QAL-02` source unique → partout | ⚠️ facultatif, sans repli, ignore le nom | `INS-12`, `INS-02` |
| **Page publique** | **aucun** | `INS-03` — étape **bloquante** à la 1re connexion | ⚠️ hors parcours, par décision | `INS-03` |

### Branche Fournisseur

| Donnée | Écran | Destination documentée | Statut | Renvoi |
|---|---|---|---|---|
| Nom de l'entreprise | `f-struct` | Paramètres › Mon entreprise (`SYS-06`) | ✅ | — |
| N° RCCM / N° Contribuable | `f-struct` | `INS-01` ; `INS-04` | ✅ | — |
| Logo | `f-logo` | `QAL-02` ; **fiches produit Marketplace** (`MKT-01`) | ⚠️ idem professionnel | `INS-12` |
| **Catégories servies** | **aucun** | Paramètres › Marketplace (`SYS-06`) | ❌ | `MKT-06` |
| **Moyens de réception (Orange Money / MTN MoMo / Wave)** | **aucun** | Paramètres › Paiements (`SYS-06`, `FIN-03` Ph. 2) | ❌ **le fournisseur ne peut pas être payé** | `MKT-06`, `INS-08` |
| **Zones de livraison** | **aucun** | Paramètres › Livraison (`MKT-02`) | ⏸ différé assumé, sans garde-fou | `MKT-06` |
| Produit — nom | `f-mat` | `MKT-01` | ✅ | — |
| Produit — catégorie | `f-mat` | `MKT-01` | ❌ **liste sans correspondance avec MeereoShop** | `MKT-06` |
| Produit — prix | `f-mat` | `MKT-01` (0 = sur devis) | ⚠️ règle « 0 = sur devis » non exposée | `MKT-06` |
| Produit — photo | `f-mat` | `MKT-01` | ✅ | — |
| **Produit — unité** | **aucun** | `MKT-01` (unité, sac, m², tonne…) | ❌ prix ininterprétable | `MKT-06` |
| **Produit — stock** | **aucun** | `MKT-01` — **déclaré obligatoire** ; `MKT-02` ; `MKT-05` | ❌ | `MKT-06` |
| **Produit — statut de publication** | **aucun** | `MKT-01` (« Visible dans le Marketplace ») | ❌ indéfini | `MKT-06` |

## A6.3 — Synthèse chiffrée

Décompte établi directement sur les 33 lignes de la matrice A6.2.

| | Nombre |
|---|---|
| **Lignes de la matrice A6.2** | **33** |
| **A. Données effectivement saisies par l'utilisateur** | **21** |
| — destination documentée, sans réserve (✅) | 9 |
| — collectées avec un défaut identifié (⚠️) | 9 |
| — collectées puis **inexploitables** (❌) | 2 *(secteurs d'activité du pro ; catégorie produit hors taxonomie MeereoShop)* |
| — en attente d'arbitrage (⏸) | 1 *(rôle)* |
| **B. Champs orphelins — attendus en aval, jamais saisis** | **10** |
| — manques avérés (❌) | 8 *(téléphone, ville, CGU, catégories servies, moyens de réception, unité, stock, statut de publication)* |
| — question ouverte (⏸) | 2 *(photo de profil client ; zones de livraison)* |
| **C. Éléments produits par le système, non saisis** | **2** |
| — recommandation KAi de fin de parcours (❌) | 1 |
| — page publique professionnelle, hors parcours par décision (⚠️) | 1 |

*Contrôle : 21 + 10 + 2 = 33. Répartition par statut : ✅ 9 · ⚠️ 10 · ❌ 11 · ⏸ 3.*

> **À ne pas confondre :** les **3 lignes ⏸** ci-dessus sont des lignes de matrice en attente d'arbitrage. Elles ne recouvrent pas les **7 points à trancher** listés en Annexe 1 (5 ajoutés par cet audit, 2 confirmés toujours ouverts depuis v1.28), qui portent sur des règles et non sur des champs.

**Lecture.** Le parcours est **solide sur l'identité légale** (`INS-01` : RCCM et numéro de contribuable sont correctement validés, format contrôlé, valeur d'exemple rejetée, bouton dérivé de l'état des champs — le patron y est exemplaire) et **défaillant sur tout ce qui rend le compte opérationnel après l'inscription** : moyen de contact secondaire, consentement, appartenance sectorielle, capacité à être payé.

**Le déséquilibre est net et il a une cause identifiable :** le parcours a été conçu autour de *l'ouverture du compte*, pas autour de *la mise en service du compte*. Les neuf champs orphelins ne sont pas des oublis isolés — ils appartiennent tous à la seconde catégorie.

## A6.4 — Ordre de traitement recommandé

Cet ordre découle des dépendances techniques, non d'un jugement d'importance.

**Priorité 1 — bloquants d'exploitation** *(sans eux, un compte créé ne peut pas fonctionner)*

1. `INS-08` — téléphone et ville. **Prérequis de tout le reste** : `MSG-01` et `FIN-02` en dépendent directement.
2. `MKT-06` §4 — moyens de réception du fournisseur. Sans cela, aucune vente n'est encaissable.
3. `INS-11` — enregistrement des secteurs. Sans cela, `AOF-01` ne peut router aucun appel d'offres public.
4. `MKT-06` §1 et §2 — stock, unité, et alignement des catégories sur la Marketplace.

**Priorité 2 — intégrité et conformité**

5. `INS-09` — unicité et vérification de l'e-mail *(dépend de `INS-08` pour le canal de secours)*.
6. `INS-10` — acceptation des CGU.
7. `INS-13` — brouillon serveur, clôture après acquittement, expiration.

**Priorité 3 — justesse et lisibilité**

8. `INS-16` — suppression des valeurs par défaut et de la recommandation KAi non fondée.
9. `INS-12` — repli du logo et lecture du nom saisi.
10. `INS-15` — fil d'étapes dérivé du parcours réel.

**À trancher en amont du développement** *(aucun code avant arbitrage)* : `INS-14` (cumul et changement de rôle — impacte le modèle de données), politique de mot de passe (Annexe 1, pt 2), caractère bloquant ou différé de la vérification d'e-mail (`INS-09`), caractère bloquant ou non de l'étape logo (`INS-12`), existence de la photo de profil client (Annexe 1, pt 1).

## A6.5 — Ce que cet audit ne couvre pas

Par honnêteté méthodologique, et dans le prolongement de l'avertissement de l'Annexe 5 :

1. **L'audit porte sur un prototype de démonstration, pas sur le code de production.** Chaque constat doit être **reconfirmé sur l'application réelle** avant correction. Il est possible que certains champs manquants ici existent déjà en production.
2. **Aucun comportement serveur n'a pu être vérifié** : unicité réelle en base, persistance après création, hachage du mot de passe, expiration des liens, transactionnalité de la création de compte. Le prototype ne réalise aucun appel réseau.
3. **La matrice A6.2 recense les données du parcours d'inscription uniquement.** Les données saisies plus tard (portfolio, équipe, documents, page publique) relèvent de `PRJ-06`, `SYS-05` et `SYS-06` et n'entrent pas dans ce périmètre.
4. **Les destinations documentées ont été lues dans le référentiel, non observées dans l'application.** Lorsque cette annexe indique qu'une donnée « va » dans les Paramètres, cela signifie que `SYS-06` l'y place — pas qu'un test l'a confirmé.

---

# ANNEXE 7 — Lot d'implémentation `P1/P2` : architecture, couverture de tests et reste à faire

**Date : 26/07/2026 · Livrable : `MEEREO-onboarding-code-P1-P2-v2-teste.zip` · Stack : React / Next.js (App Router) + API, TypeScript strict, Zod.**

Cette annexe documente la **mise en œuvre** des priorités 1 et 2 définies en Annexe 6/A6.4. Elle ne
remplace aucune exigence : elle indique ce qui est construit, ce qui est prouvé, et ce qui ne l'est pas.

## A7.1 — Le principe structurant : un seul schéma, deux côtés

L'Annexe 3/A3.2 prescrivait déjà : *« un schéma de validation par étape, **le même schéma** utilisé
pour activer/désactiver le bouton, afficher les erreurs, et revalider côté serveur »*. C'est ce qui a
été construit.

Un module unique (`schemas.ts`) est importé **par les composants React et par les route handlers**.
Une règle modifiée là s'applique aux deux côtés : il devient **structurellement impossible** qu'un
contrôle front et un contrôle serveur divergent.

Corollaire appliqué partout : **l'état du bouton est dérivé du schéma, jamais posé à la main.**
C'était la cause racine du bug d'origine de `INS-06` (`onclick="afterAccount()"` sans condition).

Trois séparations en découlent, chacune motivée :

| Couche | Fichier | Pourquoi elle est isolée |
|---|---|---|
| **Machine d'étapes** | `machine.ts` | Logique pure, sans React. La garde de progression est la règle la plus importante du parcours : elle doit être testable directement, sans rendu. |
| **Service serveur** | `service.ts` | Dépendances injectables (`ports.ts`). **C'est ce qui rend le parcours testable sans base de données** — donc exécutable en intégration continue. |
| **Adaptateurs HTTP** | `app/api/onboarding/*` | Ne font que traduire HTTP ⇄ service. Aucune logique métier. |

## A7.2 — Ce qui est construit

**47 fichiers source.** Points notables :

- **Orchestrateur** (`machine.ts` + `OnboardingFlow.tsx`) — c'est ce qui manquait entièrement : les
  étapes existaient isolément, rien ne les assemblait. Il porte l'aiguillage par rôle, la garde de
  progression, le retour arrière sans perte de saisie, la sauvegarde du brouillon à chaque étape, et
  le traitement des **erreurs structurées** : une erreur serveur ramène l'utilisateur sur l'étape
  **et** le champ fautifs, jamais un refus opaque.
- **Une seule page, trois branches** (`app/inscription/page.tsx`). Le rôle se choisit à l'étape 1 : il
  n'y a donc pas trois pages distinctes, conformément au parcours réel. Des routes d'entrée par rôle
  peuvent préremplir l'étape 1 sans dupliquer le parcours.
- **Étape « Encaissement & livraison »** — entièrement nouvelle, elle n'existait sous aucune forme.
- **Modèle de données** (`prisma/schema.prisma`) avec les champs manquants et les index requis.

## A7.3 — Couverture de vérification

`npm test` exécute : typecheck strict, puis **73 tests, 0 échec**.

| Suite | Nombre | Ce qu'elle prouve |
|---|---|---|
| Schémas | 28 | Chaque règle de validation, un test par exigence. |
| Machine d'étapes | 14 | Garde de progression, retour arrière sans perte, fil dérivé, changement de rôle. |
| Service (bout en bout) | 19 | Les 3 parcours jusqu'à la création du compte, avec base en mémoire : brouillon purgé après acquittement, brouillon **survivant** à un échec de transaction, unicité RCCM, CGU périmées, panne SMTP non bloquante. |
| Rendu (DOM) | 12 | Les 3 parcours **réellement cliqués** : champs remplis, boutons désactivés au bon moment, écrans finaux atteints, données arrivées en base. |

L'archive a été **revérifiée après extraction** sur une copie propre.

## A7.4 — Deux défauts trouvés par les tests

Consignés parce qu'ils disent quelque chose de la méthode, pas seulement du code.

**1. Un bug que seul le test de rendu pouvait voir.** Dans le composant de l'étape « Votre compte »,
l'effet de vérification d'unicité de l'e-mail dépendait de l'objet d'erreurs du formulaire —
**recréé à chaque rendu**. L'effet se relançait en boucle et remettait l'état à « vérification en
cours », ce qui gardait le bouton « Continuer » **désactivé en permanence** : le parcours était
infranchissable. **La logique de validation était juste ; l'interface ne fonctionnait pas.** Aucun
test de schéma n'aurait pu le détecter. Corrigé par une dépendance sur une valeur stable et la
mémorisation du dernier e-mail vérifié.

**2. Une supposition erronée corrigée par le test.** Le décompte « 5 étapes pour le fournisseur »,
repris de l'audit, est devenu faux dès l'ajout de l'étape d'encaissement — le parcours en compte
**6**. Le test échouait, le code avait raison. Le point `INS-15` est amendé en conséquence.

## A7.5 — Comportements assumés à connaître

1. **Le téléphone est réaffiché normalisé.** Le schéma transforme la saisie en E.164 : en revenant sur
   l'étape Compte, le champ affiche `+2250707123456` et non `0707123456`. La valeur reste valide et
   modifiable — aucune impasse.
2. **L'unicité de l'e-mail est revérifiée au retour** sur l'étape Compte, ce qui désactive le bouton
   pendant environ 300 ms. Volontaire : l'adresse peut avoir été prise entre-temps.

## A7.6 — Décisions prises faute d'arbitrage — À VALIDER PAR MEEREO

Chaque hypothèse est **isolée dans un seul endroit du code** pour qu'un changement d'avis coûte une
ligne, pas une reprise. Elles sont reprises en Annexe 1.

| # | Point | Retenu | Motif |
|---|---|---|---|
| 1 | Politique de mot de passe | 10 caractères, ≥ 1 lettre et ≥ 1 chiffre. **Pas** de caractère spécial ni de majuscule imposés. | 8 caractères est en dessous des recommandations actuelles pour un compte donnant accès à des paiements. Les règles de composition complexes sont déconseillées (NIST SP 800-63B) : elles produisent des contournements prévisibles sans gain réel. |
| 2 | Vérification e-mail | **Différée**, compte créé avec adresse non vérifiée. | Réduit l'abandon — **mais la porte de correction reste à développer**, sans quoi `INS-09` n'est pas fermé. |
| 3 | Durée du brouillon | 30 jours. | Proposition du référentiel, non confirmée. |
| 4 | Unités de vente | Les 4 citées par `MKT-01` + 7 proposées, marquées comme telles. | `MKT-01` écrit « unité, sac, m², tonne… » : liste explicitement ouverte. |

## A7.7 — Ce qui reste à faire avant mise en production

**Bloquants techniques (5 contrats d'accès aux données).** Leur signature est fournie, leur corps
dépend de la base de code existante :

| Contrat | Exigence attachée |
|---|---|
| `findActiveByEmail` | **Comptes actifs uniquement** (`deletedAt IS NULL`), sinon `AVS-03` casse. |
| CRUD du brouillon | `INS-13`. |
| `createAccount` (transaction) | **La suppression du brouillon doit être dans la même transaction** (`INS-13`). |
| Hachage du mot de passe | argon2id recommandé. |
| Envoi du lien de vérification | Usage unique, durée limitée. Un échec ne doit pas annuler la création. |

**Migration SQL manuelle** — Prisma ne sait pas exprimer un index partiel :

```sql
CREATE UNIQUE INDEX account_email_active_key
  ON "Account"(lower(email)) WHERE "deletedAt" IS NULL;
```

Sans lui, une contrainte d'unicité simple empêcherait la réutilisation d'e-mail **pourtant autorisée**
par `AVS-03`.

**Points fonctionnels non couverts :** `INS-12` (repli du logo) — non traité ; `INS-16` — partiellement
traité ; `INS-14` (cumul et changement de rôle) — non tranché, le modèle de données matérialise la
contrainte actuelle de `INS-01` ; textes des CGU et de la politique de confidentialité — à produire ;
limitation de débit anti-énumération à passer sur un compteur partagé.

## A7.8 — Limites de cette vérification

1. **Aucun test contre une vraie base de données ni un vrai navigateur.** Les tests utilisent des
   doublures en mémoire et un DOM simulé. Un test de bout en bout type Playwright, contre
   l'application réelle, **reste à écrire**.
2. **Rien n'a été vérifié en conditions réseau réelles** : latence, expiration de session, requêtes
   concurrentes autres que le cas d'unicité simulé.
3. **Le lot part de l'audit du prototype, pas de la production.** Certains de ces champs existent
   peut-être déjà côté serveur : à reconfirmer avant intégration. Ce paquet est une base, pas un
   correctif à appliquer sans relecture.


---

# ANNEXE 8 — Textes juridiques de la plateforme

**Date de rédaction : 26/07/2026 · Version des textes : `2026-07-CI-v1` · Périmètre : Côte d'Ivoire + UEMOA, sans RGPD.**

> ## ⚠️ AVERTISSEMENT — À LIRE AVANT TOUTE PUBLICATION
>
> **Ces textes constituent un projet de travail, non validé juridiquement.** Ils ont été rédigés à
> partir du fonctionnement réel de la plateforme décrit par le présent référentiel, et **doivent être
> relus et validés par un avocat inscrit au barreau de Côte d'Ivoire** avant toute mise en ligne.
>
> Trois raisons concrètes :
> 1. **Un contrat mal rédigé ne protège pas — il expose.** Une clause limitative de responsabilité mal
>    formulée est réputée non écrite, et le professionnel perd la protection qu'il croyait avoir.
> 2. **Le régime des paiements** touche à la réglementation BCEAO/UEMOA sur la monnaie électronique.
>    C'est le point le plus sensible du dispositif — voir A8.1.
> 3. **La déclaration préalable à l'ARTCI** est une obligation distincte de ces textes et ne s'y
>    substitue pas.
>
> **Ce que ces textes apportent malgré cette réserve :** ils décrivent la mécanique exacte de MEEREO —
> les trois rôles, la portée réelle du badge de vérification, le quota de cinq produits, le prix zéro
> valant « sur devis », la règle de garde à la publication, la notification des acheteurs au départ
> d'un fournisseur. Un avocat corrigera le droit ; il n'aurait pas deviné le produit.

## A8.1 — Préalables bloquants

### 1. Qui encaisse ? — contradiction du référentiel

Voir l'amendement porté sur **`FIN-02`**. Les textes ci-dessous sont rédigés sur la base retenue par
`FIN-03` Phase 2 et `SYS-06` : **MEEREO n'encaisse que ses propres revenus** et jamais le prix des
ventes entre utilisateurs.

**Tant que ce point n'est pas tranché, les Conditions Générales de Vente (A8.4) ne doivent pas être
publiées.**

### 2. Déclaration ARTCI

La **loi n° 2013-450** impose une **déclaration préalable** de tout traitement de données personnelles
auprès de l'**ARTCI**, **avant** sa mise en œuvre. Elle est obligatoire et ne se substitue pas à la
politique de confidentialité.

L'ARTCI a par ailleurs mis en place un **fichier national des correspondants à la protection des
données**, avec une **échéance de déclaration au 31 janvier 2026**. À vérifier auprès de l'ARTCI si
MEEREO est assujettie et si ce délai a été prorogé.

### 3. Mention « RGPD » à retirer de l'interface

Le périmètre retenu étant Côte d'Ivoire + UEMOA, **le RGPD ne s'applique pas**. L'écran de connexion
affiche pourtant « SSL · RGPD ». **Afficher une conformité qu'on n'assume pas est une allégation
vérifiable, donc un risque en soi.** Remplacer par une mention exacte, par exemple
« Données protégées · Loi n° 2013-450 ».

### 4. Informations manquantes

**53 marqueurs `[[À COMPLÉTER]]`** subsistent dans les quatre textes : identité de la société,
directeur de publication, hébergeur et **pays d'hébergement des données** — cette dernière information
est déterminante, car un hébergement hors de Côte d'Ivoire déclenche le régime des transferts de la
loi n° 2013-450.

### 5. Extension UEMOA

Les textes sont rédigés en base ivoirienne. **Chaque État de l'UEMOA a sa propre loi sur les données
personnelles et sa propre autorité de contrôle** : toute ouverture commerciale dans un nouveau pays
suppose une revue locale préalable.

## A8.2 — Architecture des textes

| Texte | Objet | Qui il lie |
|---|---|---|
| **A8.3 — CGU** | Règles d'usage, comptes, rôles, contenus, KAi, résiliation | MEEREO ⇄ tout utilisateur |
| **A8.4 — CGV Marketplace** | Vente de produits : **entre fournisseur et acheteur**, MEEREO tiers | Fournisseur ⇄ Acheteur |
| **A8.5 — Politique de confidentialité** | Données collectées, finalités, durées, droits, ARTCI | MEEREO ⇄ personne concernée |
| **A8.6 — Mentions légales** | Identification de l'éditeur et de l'hébergeur | Obligation légale d'information |

> **Pourquoi les CGV sont un texte séparé et non un chapitre des CGU.** Dans la Marketplace, **le
> vendeur est le Fournisseur, pas MEEREO** (`MKT-01` : « Vendeur unique : le fournisseur »). Les
> réunir dans un seul document laisserait entendre que MEEREO est partie au contrat de vente — et donc
> tenue de la conformité, de la livraison et des vices cachés. **La séparation est une protection, pas
> une commodité de rédaction.**

**Textes de référence utilisés :** loi n° 2013-450 (données personnelles, ARTCI) · loi n° 2013-546
(transactions électroniques) · loi n° 2013-451 (cybercriminalité) · loi n° 2016-412 (consommation) ·
Actes uniformes OHADA (RCCM) · réglementation BCEAO/UEMOA (monnaie électronique).
*Ces références ont été vérifiées par recherche documentaire, non par consultation juridique.*

---

## A8.3 — Conditions Générales d'Utilisation

**Version `2026-07-CI-v1`** · Entrée en vigueur : `[[À COMPLÉTER : date]]`

### Article 1 — Objet et acceptation

Les présentes conditions générales d'utilisation (les « **CGU** ») régissent l'accès et l'usage de la
plateforme **MEEREO** (la « **Plateforme** »), éditée par [[À COMPLÉTER : dénomination sociale]]
(« **MEEREO** », « **nous** »), dont l'identification complète figure dans les Mentions légales.

La création d'un compte vaut **acceptation pleine et entière** des présentes CGU. Cette acceptation
est recueillie par une case à cocher distincte, non pré-cochée, lors de l'inscription. La **version**
acceptée et la **date** d'acceptation sont conservées.

Toute personne qui n'accepte pas les CGU doit renoncer à créer un compte.

### Article 2 — Ce qu'est MEEREO, et ce qu'elle n'est pas

**MEEREO est une plateforme de mise en relation et d'outillage** destinée aux acteurs du bâtiment,
des travaux publics et de l'immobilier en Côte d'Ivoire et, progressivement, dans l'espace UEMOA.

**MEEREO n'est pas :**

- **ni une entreprise de construction** — elle ne réalise aucun travaux, n'établit aucun devis, ne
  dirige aucun chantier ;
- **ni un maître d'œuvre**, ni un bureau d'études, ni un architecte ;
- **ni un vendeur de matériaux** — dans la Marketplace, **le vendeur est le Fournisseur** (voir les
  Conditions Générales de Vente) ;
- **ni un établissement de paiement ou de monnaie électronique** — voir l'article 9 ;
- **ni un assureur**, ni un garant de la bonne exécution des marchés conclus entre Utilisateurs.

**MEEREO n'est pas partie aux contrats** conclus entre Utilisateurs, qu'il s'agisse d'un marché de
travaux, d'une mission de maîtrise d'œuvre ou d'une vente de produits. Elle fournit l'outil ; les
Utilisateurs contractent entre eux, sous leur seule responsabilité.

### Article 3 — Les trois rôles

MEEREO est **une seule plateforme** au sein de laquelle trois profils interagissent. Le rôle est
choisi à l'inscription et détermine l'espace, les droits et les fonctionnalités accessibles.

| Rôle | Qui | Ce qu'il peut faire |
|---|---|---|
| **Client** | Maître d'ouvrage, particulier ou personne morale | Décrire un projet, publier un appel d'offres, comparer les offres, suivre un chantier, acheter sur la Marketplace |
| **Professionnel** | Architecte, bureau d'études, entreprise de travaux, prestataire | Répondre aux appels d'offres, gérer missions, projets et équipes, disposer d'une page publique, acheter sur la Marketplace |
| **Fournisseur** | Négociant en matériaux, mobilier ou équipements | Publier un catalogue, recevoir et traiter des commandes, gérer ses ventes |

**Le Fournisseur est le seul rôle autorisé à vendre des produits** sur la Marketplace. Le Client et le
Professionnel y interviennent en qualité d'acheteurs.

**Changement de rôle.** [[À TRANCHER : voir `INS-14` du référentiel — le cumul des rôles
Professionnel et Fournisseur, ainsi que le changement de rôle après inscription, ne sont pas
définis. Cet article doit être complété une fois la décision prise.]]

### Article 4 — Inscription, exactitude et vérification

#### 4.1 Conditions d'accès

L'inscription est réservée aux personnes physiques **majeures** disposant de la capacité juridique, et
aux personnes morales régulièrement constituées agissant par un représentant habilité.

#### 4.2 Exactitude des informations

L'Utilisateur garantit l'exactitude, la sincérité et la mise à jour des informations qu'il fournit.
Toute information fausse ou trompeuse constitue un manquement grave aux présentes CGU.

Pour les **Professionnels** et les **Fournisseurs**, sont notamment requis :

- la **dénomination** de la structure ;
- le **numéro RCCM** et le **numéro de contribuable**, qui deviennent les identifiants administratifs
  officiels de l'entreprise sur la Plateforme ;
- pour le Professionnel, au moins un **secteur d'activité** ;
- pour le Fournisseur, au moins une **catégorie de produits** servie, ainsi qu'un **moyen de réception
  de paiement** et un **mode de livraison** avant toute mise en vente.

#### 4.3 Unicité des identifiants légaux

Le numéro RCCM et le numéro de contribuable sont **strictement uniques** sur la Plateforme. Un numéro
déjà associé à une entreprise ne peut être réutilisé par une autre. Une fois vérifiés, ces numéros
sont **verrouillés** et ne peuvent plus être modifiés par l'Utilisateur ; toute correction suppose une
demande motivée auprès de MEEREO.

#### 4.4 Vérification et badge « Vérifié par MEEREO »

Le badge « **Vérifié par MEEREO** » atteste que l'entreprise a déposé son RCCM et que le numéro extrait
du document, par analyse automatisée, **correspond** à celui déclaré à l'inscription.

**Portée exacte de ce badge, à ne pas surinterpréter :** il atteste une **concordance documentaire**.
Il ne constitue **ni un agrément**, **ni une certification de compétence**, **ni une garantie de
solvabilité**, **ni une recommandation** de MEEREO. Un professionnel vérifié peut mal exécuter ses
obligations : la vérification ne dispense aucun Client de sa propre diligence.

En cas d'écart entre le document déposé et les numéros déclarés, la validation du compte est
**suspendue** jusqu'à correction.

#### 4.5 Sécurité du compte

L'Utilisateur est responsable de la confidentialité de son mot de passe et de toute activité effectuée
depuis son compte. Il informe MEEREO sans délai de toute utilisation non autorisée. Le mot de passe est
conservé sous forme **chiffrée irréversible** et n'est jamais accessible à MEEREO.

### Article 5 — Contenus publiés par les Utilisateurs

#### 5.1 Responsabilité

Chaque Utilisateur est **seul responsable** des contenus qu'il publie : descriptions de projets,
appels d'offres, offres, fiches produits, photographies, documents, messages, avis.

Il garantit détenir les droits nécessaires et s'interdit de publier tout contenu :

- faux, trompeur ou de nature à induire en erreur sur ses qualifications ;
- portant atteinte aux droits de tiers, notamment de propriété intellectuelle ;
- diffamatoire, injurieux, discriminatoire, haineux ou contraire à l'ordre public ;
- constitutif d'une infraction, notamment au regard de la loi n° 2013-451 relative à la lutte contre
  la cybercriminalité ;
- comportant des données personnelles de tiers sans base légitime.

#### 5.2 Licence d'exploitation

L'Utilisateur conserve la **propriété** de ses contenus. Il concède à MEEREO une licence **non
exclusive, gratuite et limitée à la durée de publication**, aux seules fins d'héberger, d'afficher et
de diffuser ces contenus sur la Plateforme et, s'agissant des contenus expressément publics (page
professionnelle, fiche produit, appel d'offres public), de les rendre accessibles aux moteurs de
recherche.

Cette licence **ne confère aucun droit de cession, de sous-licence commerciale ou d'usage
publicitaire** hors de la Plateforme sans accord exprès de l'Utilisateur.

#### 5.3 Modération

MEEREO n'exerce **aucune obligation générale de surveillance** des contenus. Elle peut néanmoins,
après signalement ou constat, retirer tout contenu manifestement illicite ou contraire aux CGU, et en
informe l'auteur.

### Article 6 — Avis et évaluations

Les avis émanent des Utilisateurs et **n'engagent qu'eux**.

**Un professionnel ne peut ni supprimer, ni masquer, ni désactiver, ni modifier un avis ou une note le
concernant.** Il dispose d'un droit de réponse publique. Seule l'administration de MEEREO peut
intervenir sur un avis frauduleux, diffamatoire ou contraire aux présentes CGU.

Est notamment interdit et constitue un manquement grave : publier un avis sur sa propre structure,
rémunérer un avis, ou solliciter un avis en contrepartie d'un avantage.

### Article 7 — Appels d'offres, marchés et projets

MEEREO met à disposition les outils permettant de publier un appel d'offres, d'y répondre, de comparer
les offres, de formaliser un marché et d'en suivre l'exécution.

**MEEREO ne garantit ni la réception d'offres, ni leur qualité, ni la conclusion d'un marché, ni la
bonne exécution des travaux.** Le choix du cocontractant, la négociation, la rédaction des pièces
contractuelles et le suivi relèvent de la seule responsabilité des Utilisateurs concernés.

Les informations de suivi de chantier (avancement, validations, notes, photographies) sont **déclarées
par les Utilisateurs**. MEEREO n'en vérifie pas l'exactitude et ne procède à aucun contrôle technique.

### Article 8 — KAi, assistant intelligent

#### 8.1 Nature

**KAi** est un assistant fondé sur des traitements automatisés, intégré à la Plateforme. Il produit des
analyses, des suggestions et des aides à la décision.

#### 8.2 Limites — clause essentielle

**Les réponses de KAi sont des aides, jamais des décisions.** Elles ne constituent **ni un conseil
technique, ni un conseil juridique, ni un conseil financier, ni une prescription d'ouvrage**.

Un traitement automatisé peut produire un résultat inexact, incomplet ou inadapté à une situation
particulière. **L'Utilisateur reste seul décisionnaire** et conserve l'entière responsabilité de ses
choix. Toute décision engageant la sécurité, la conformité réglementaire ou des sommes significatives
doit être validée par un professionnel qualifié.

#### 8.3 Formules et quotas

KAi est proposé en formule **Standard**, incluse et limitée à **25 analyses par mois**, et en formule
**Pro**, payante et souscrite par abonnement mensuel. Les tarifs en vigueur sont ceux affichés dans
l'espace de l'Utilisateur au jour de la souscription.

### Article 9 — Sommes dues à MEEREO et flux financiers

#### 9.1 Ce que MEEREO facture

MEEREO facture **exclusivement ses propres services** :

- l'**abonnement KAi Pro**, mensuel et reconductible ;
- le **forfait de publication** des produits au-delà des cinq premiers, pour les Fournisseurs ;
- les **prestations de mise en avant** (sponsoring de produits), le cas échéant.

Ces sommes sont payables d'avance, par les moyens proposés sur la Plateforme.

#### 9.2 Ce que MEEREO n'encaisse pas — clause déterminante

**MEEREO n'encaisse pas les sommes dues entre Utilisateurs.** Elle ne détient à aucun moment de fonds
pour le compte de tiers.

- Le **prix des ventes** de la Marketplace est réglé **directement** par l'acheteur au Fournisseur, par
  les moyens de paiement que ce dernier a configurés.
- Les **paiements de marchés de travaux** entre Client et Professionnel s'effectuent **hors
  Plateforme**. Les montants renseignés dans l'outil de suivi financier sont **purement déclaratifs**
  et ne valent ni preuve de paiement, ni quittance, ni reconnaissance de dette.

**Conséquence assumée :** MEEREO n'exerce aucune activité d'établissement de paiement ou de monnaie
électronique au sens de la réglementation BCEAO/UEMOA, et **n'offre en conséquence aucune garantie de
séquestre, de remboursement ou de bonne fin** sur les sommes échangées entre Utilisateurs.

#### 9.3 Défaut de paiement

En cas d'impayé sur les sommes dues à MEEREO, l'accès aux services concernés peut être suspendu après
information préalable. Les produits d'un Fournisseur dont le forfait n'est pas réglé sont
**dépubliés** après alerte et préavis ; ils sont **conservés** dans son espace et redeviennent
publiables dès régularisation.

### Article 10 — Disponibilité, maintenance et évolutions

MEEREO met en œuvre les moyens raisonnables pour assurer l'accessibilité de la Plateforme, sans
garantie de disponibilité ininterrompue.

L'accès peut être suspendu pour maintenance, mise à jour ou raison de sécurité. MEEREO s'efforce
d'informer préalablement des interruptions programmées significatives.

MEEREO peut faire évoluer les fonctionnalités. Toute suppression d'une fonctionnalité substantielle
fait l'objet d'une information préalable **[[À COMPLÉTER : délai, ex. 30 jours]]**.

### Article 11 — Responsabilité

#### 11.1 Responsabilité de MEEREO

MEEREO est tenue d'une **obligation de moyens** dans la fourniture de la Plateforme.

Sa responsabilité ne saurait être engagée à raison :

- des **contenus publiés** par les Utilisateurs ;
- de l'**inexécution ou de la mauvaise exécution** des contrats conclus entre Utilisateurs ;
- des **décisions prises** par un Utilisateur, y compris sur la base d'une analyse produite par KAi ;
- des **différends** entre Utilisateurs ;
- d'une **indisponibilité** imputable au réseau, à l'hébergeur ou à un cas de force majeure.

**[[À FAIRE VALIDER PAR AVOCAT : plafond de responsabilité.** Une limitation chiffrée est usuelle
entre professionnels — par exemple, le montant des sommes versées à MEEREO au cours des douze mois
précédents. Sa rédaction et son opposabilité, notamment vis-à-vis d'un Client consommateur au sens de
la loi n° 2016-412, doivent être vérifiées : **une clause abusive est réputée non écrite**, et le
plafond disparaît alors entièrement.**]]**

#### 11.2 Responsabilité de l'Utilisateur

L'Utilisateur répond des dommages causés à MEEREO ou à des tiers du fait de son usage de la Plateforme
et garantit MEEREO contre toute réclamation qui en résulterait.

### Article 12 — Suspension et résiliation

#### 12.1 Par l'Utilisateur

L'Utilisateur peut supprimer son compte à tout moment depuis ses paramètres.

**Cas particulier du Fournisseur.** La suppression n'est **pas bloquée** par l'existence de commandes
en cours. Toutefois :

- ses produits sont **immédiatement retirés** de la Marketplace ;
- les **commandes en cours sont honorées hors Plateforme**, en direct avec l'acheteur ;
- MEEREO **notifie chaque acheteur** concerné et lui transmet les coordonnées du Fournisseur ;
- la suppression est **refusée tant qu'un solde reste dû** à MEEREO.

#### 12.2 Par MEEREO

MEEREO peut suspendre ou résilier un compte, après mise en demeure restée sans effet sauf urgence ou
manquement grave, en cas de : information fausse sur l'identité ou les qualifications, usage frauduleux,
manquement répété aux CGU, atteinte à la sécurité de la Plateforme, ou impayé persistant.

#### 12.3 Effets

La suppression d'un compte entraîne la perte d'accès aux services. Le compte est identifié par un
**identifiant interne unique**, jamais par la seule adresse e-mail : une adresse redevenue disponible
et réutilisée donne lieu à un compte **entièrement indépendant**, sans reprise des données antérieures.

Les données sont conservées ou supprimées selon les modalités de la Politique de confidentialité.

### Article 13 — Propriété intellectuelle de la Plateforme

La Plateforme, sa structure, ses interfaces, ses marques, ses logos et ses développements sont la
propriété de MEEREO et sont protégés. Aucune stipulation des présentes n'emporte cession de droits.

Sont notamment interdits : l'extraction automatisée de données, la reproduction de tout ou partie de
la Plateforme, la rétro-ingénierie, et tout usage de nature à en compromettre la sécurité.

### Article 14 — Données personnelles

Les traitements de données personnelles sont décrits dans la **Politique de confidentialité**, qui fait
partie intégrante des présentes CGU. Ils sont soumis à la **loi n° 2013-450 du 19 juin 2013** et
placés sous le contrôle de l'**ARTCI**.

### Article 15 — Modification des CGU

MEEREO peut modifier les présentes CGU. Toute modification substantielle est portée à la connaissance
des Utilisateurs **[[À COMPLÉTER : délai, ex. 30 jours avant entrée en vigueur]]**, et une **nouvelle
acceptation** est requise à la première connexion suivante. L'Utilisateur qui refuse peut résilier son
compte sans frais.

La **version** des CGU acceptée par chaque Utilisateur est conservée et opposable.

### Article 16 — Langue

Les présentes CGU sont rédigées en **français**. Toute traduction est fournie à titre d'information ;
**seule la version française fait foi**.

### Article 17 — Droit applicable et règlement des différends

Les présentes CGU sont soumises au **droit ivoirien**.

En cas de différend, les parties s'efforcent de trouver une solution amiable. À défaut d'accord dans un
délai de **trente (30) jours** suivant la réclamation écrite, le litige est porté devant les
**juridictions compétentes d'Abidjan**.

**[[À FAIRE VALIDER PAR AVOCAT :** l'attribution de compétence est inopposable au consommateur, qui
conserve le droit de saisir la juridiction de son domicile. Cet article doit être vérifié au regard de
la loi n° 2016-412 relative à la consommation, et adapté pour les Utilisateurs établis dans un autre
État de l'UEMOA.**]]**

### Article 18 — Dispositions diverses

Si une stipulation est jugée nulle ou inapplicable, les autres conservent leur plein effet.

Le fait pour MEEREO de ne pas se prévaloir d'un manquement ne vaut pas renonciation.

---

**Contact :** [[À COMPLÉTER : adresse e-mail]] · [[À COMPLÉTER : adresse postale]]

---

## A8.4 — Conditions Générales de Vente (Marketplace)

**Version `2026-07-CI-v1`** · ⚠️ **Ne pas publier tant que `FIN-02` n'est pas tranché** (voir A8.1).

>
> Voir `00_NOTE_DE_CADRAGE.md`.

---

### Article 1 — Qui vend, qui achète, et où se situe MEEREO

**Ces conditions régissent les ventes conclues entre un Fournisseur et un Acheteur** par
l'intermédiaire de la Marketplace de MEEREO.

| Partie | Qui |
|---|---|
| **Le Vendeur** | Le **Fournisseur**, professionnel inscrit, seul habilité à vendre sur la Marketplace |
| **L'Acheteur** | Un Client ou un Professionnel inscrit, agissant pour ses besoins propres ou professionnels |
| **MEEREO** | **Tiers au contrat de vente.** Elle fournit l'infrastructure technique de mise en relation |

#### 1.1 Position de MEEREO — clause déterminante

**MEEREO n'est ni vendeur, ni revendeur, ni mandataire du Vendeur, ni commissionnaire.**

Elle **ne détient aucun stock**, **n'expédie aucun produit**, **n'encaisse pas le prix des ventes** et
**n'intervient pas** dans la formation du contrat au-delà de la mise à disposition de l'outil.

Il en résulte que **le Vendeur est seul tenu** de la conformité du produit, de la garantie légale, de
la livraison, de la facturation et du service après-vente. **L'Acheteur exerce ses droits directement
auprès du Vendeur.**

### Article 2 — Le contrat de vente

#### 2.1 Formation

Le contrat est formé entre le Vendeur et l'Acheteur au moment de la **confirmation de la commande** par
le Vendeur.

La fiche produit constitue une **invitation à entrer en pourparlers**. Le Vendeur peut refuser une
commande, notamment en cas d'indisponibilité réelle du stock, d'erreur manifeste de prix ou de zone
non desservie. Le refus est notifié à l'Acheteur, et toute somme éventuellement versée lui est
restituée par le Vendeur.

#### 2.2 Informations obligatoires du Vendeur

Le Vendeur garantit que chaque fiche produit comporte : une **dénomination exacte**, une **catégorie**
conforme, une **unité de vente** explicite, un **prix en francs CFA**, le **stock disponible**, et une
description fidèle. Toute photographie doit correspondre au produit réellement proposé.

**Le Vendeur est seul responsable de l'exactitude de ces informations.** Une fiche trompeuse engage sa
responsabilité et constitue un manquement aux CGU.

#### 2.3 Prix

Les prix sont exprimés en **francs CFA (XOF)**, fixés librement par le Vendeur.

**[[À COMPLÉTER : mention TVA.** Le Vendeur doit indiquer si le prix s'entend hors taxes ou toutes
taxes comprises, et faire apparaître la TVA lorsqu'il y est assujetti. Régime à confirmer.**]]**

Les **frais de livraison** sont indiqués séparément avant validation de la commande.

**Produits « sur devis ».** Un prix affiché à **zéro** signifie que le produit est proposé
**exclusivement sur devis** : l'Acheteur doit contacter le Vendeur pour obtenir une offre. Aucune vente
n'est conclue à un prix nul.

### Article 3 — Paiement

#### 3.1 Le règlement s'effectue directement au Vendeur

**L'Acheteur règle directement le Vendeur**, par les moyens de paiement que celui-ci a configurés
(Orange Money, MTN MoMo, Wave, ou tout autre moyen convenu entre eux).

**MEEREO ne perçoit à aucun moment le prix de la vente, ne le conserve pas, et n'en garantit ni le
versement, ni la restitution.**

#### 3.2 Ce que cela implique concrètement — à lire attentivement

Parce qu'aucun séquestre n'existe :

- **MEEREO ne peut pas bloquer un paiement** en cas de litige ;
- **MEEREO ne peut pas rembourser** un Acheteur à la place d'un Vendeur défaillant ;
- **MEEREO n'offre aucune garantie de bonne fin** de la transaction.

**Il appartient à l'Acheteur d'apprécier la fiabilité du Vendeur avant de payer**, notamment au vu du
badge de vérification, des avis et de l'ancienneté du compte. Pour les commandes d'un montant
significatif, il est vivement recommandé de convenir d'un paiement à la livraison ou de formaliser un
contrat écrit distinct.

#### 3.3 Preuve du paiement

La transaction est tracée par l'opérateur de paiement choisi. **La référence de transaction délivrée
par cet opérateur constitue la preuve du règlement**, à l'exclusion de toute mention portée sur la
Plateforme, qui n'a qu'une valeur indicative.

### Article 4 — Livraison

#### 4.1 Modes et zones

Le Vendeur indique les modes qu'il propose — **livraison** ou **retrait par l'Acheteur** — ainsi que
les **zones desservies** et un délai indicatif.

**Une commande en livraison hors des zones déclarées ne peut être passée.**

#### 4.2 Exécution et risques

La livraison est assurée par le Vendeur ou son transporteur, **sous sa seule responsabilité**.

**[[À FAIRE VALIDER PAR AVOCAT — transfert des risques.** Le moment du transfert des risques
(remise au transporteur ou remise effective à l'Acheteur) doit être fixé sans ambiguïté et
conformément au droit applicable, notamment lorsque l'Acheteur est un consommateur.**]]**

#### 4.3 Réception

L'Acheteur vérifie l'état et la conformité des produits **à la réception** et formule ses réserves
auprès du Vendeur et, le cas échéant, du transporteur.

### Article 5 — Conformité, garanties et réclamations

#### 5.1 Garanties dues par le Vendeur

Le Vendeur est tenu des **garanties légales** applicables, notamment au titre des vices cachés et de la
conformité du produit à sa description.

**[[À COMPLÉTER PAR AVOCAT :** énoncé précis des garanties légales et de leurs délais au regard du
droit ivoirien et de la loi n° 2016-412 relative à la consommation. **Une garantie légale ne peut être
ni écartée ni réduite par contrat lorsque l'acheteur est un consommateur.**]]**

#### 5.2 Réclamations

Toute réclamation est adressée **directement au Vendeur**, par la messagerie de la Plateforme ou par
les coordonnées figurant sur sa page.

**Rôle de MEEREO en cas de litige :** MEEREO peut, sans y être tenue, faciliter la reprise du dialogue
entre les parties et conserve à disposition les éléments techniques utiles (historique de commande,
échanges). **Elle n'arbitre pas, ne tranche pas, et n'indemnise pas.**

#### 5.3 Droit de rétractation

**[[À TRANCHER PAR AVOCAT.** L'existence, la durée et les exceptions d'un droit de rétractation au
profit de l'acheteur non professionnel doivent être établies au regard du droit ivoirien. **Point à ne
pas laisser en blanc** : c'est l'une des premières mentions qu'un acheteur recherche, et son absence
peut être sanctionnée.**]]**

### Article 6 — Obligations propres au Vendeur

Le Vendeur s'engage à :

- ne proposer que des produits dont il a la **libre disposition** et dont la vente est **licite** ;
- **maintenir son stock à jour** — un stock inexact conduisant à des annulations répétées constitue un
  manquement ;
- **répondre aux commandes** et aux sollicitations dans un délai raisonnable ;
- **délivrer une facture** conforme à ses obligations fiscales ;
- assurer le **service après-vente** de ses produits ;
- respecter la réglementation applicable aux produits vendus, notamment en matière de sécurité,
  d'étiquetage et de normes de construction.

**Produits prohibés.** Sont notamment interdits : les produits contrefaits, volés, dangereux ou
non conformes aux normes applicables, ainsi que tout produit dont la commercialisation est
réglementée sans que le Vendeur dispose des autorisations requises.

**Périmètre de la Marketplace.** Elle est réservée aux **produits physiques** — matériaux, mobilier,
équipements. Les **prestations de services** (location, transport, main-d'œuvre) en sont exclues et
relèvent du dispositif d'appels d'offres.

### Article 7 — Publication des produits et sommes dues à MEEREO

#### 7.1 Conditions de publication

Un produit ne peut être publié que si le Vendeur a configuré **au moins un moyen de réception de
paiement** et **au moins un mode de livraison ou le retrait client**. À défaut, le produit demeure en
**brouillon**.

Cette règle protège l'Acheteur : elle évite qu'un produit soit offert à la vente par un Vendeur hors
d'état d'encaisser ou de livrer.

#### 7.2 Quota et forfait

Les **cinq premiers produits** publiés sont gratuits. Au-delà, chaque produit supplémentaire donne lieu
à un **forfait mensuel** dû à MEEREO, dont le montant est indiqué dans l'espace du Vendeur.

En cas de non-paiement : le Vendeur est **alerté plusieurs jours avant l'échéance**, puis le produit
est **dépublié** à la date d'échéance. **Il n'est pas supprimé** : il demeure dans son espace et
redevient publiable dès régularisation.

#### 7.3 Produits sponsorisés

Le Vendeur peut acheter une mise en avant de ses produits. **Tout emplacement sponsorisé est
identifié comme tel** auprès des utilisateurs.

### Article 8 — Suppression du compte Vendeur

En cas de suppression du compte d'un Vendeur ayant des commandes en cours :

- ses produits sont **immédiatement retirés** de la Marketplace ;
- les **commandes en cours sont honorées hors Plateforme**, directement entre les parties ;
- **MEEREO notifie chaque Acheteur concerné** et lui transmet les coordonnées du Vendeur, afin qu'il ne
  découvre pas seul la disparition de son interlocuteur ;
- la suppression est **refusée tant qu'un solde reste dû** à MEEREO.

### Article 9 — Données personnelles

Le traitement des données liées aux commandes est décrit dans la **Politique de confidentialité**.

**Le Vendeur qui reçoit les données d'un Acheteur en devient responsable de traitement pour ses
propres finalités** — exécution de la commande, facturation, service après-vente. Il s'interdit tout
usage étranger à ces finalités, notamment la prospection non consentie et la cession à des tiers.

### Article 10 — Droit applicable et différends

Les présentes conditions sont soumises au **droit ivoirien**.

Le différend né d'une vente oppose **le Vendeur et l'Acheteur** ; MEEREO n'y est pas partie.

À défaut de résolution amiable dans un délai de **trente (30) jours**, le litige est porté devant les
juridictions compétentes.

**[[À FAIRE VALIDER PAR AVOCAT :** compétence territoriale, protection du consommateur, et adaptation
pour les parties établies dans un autre État de l'UEMOA.**]]**

---

## A8.5 — Politique de confidentialité

**Version `2026-07-CI-v1`** · ⚠️ **La déclaration préalable à l'ARTCI est obligatoire et distincte de ce document.**

### 1. Qui traite vos données

Le responsable du traitement est **[[À COMPLÉTER : dénomination sociale]]**, dont le siège est situé
[[À COMPLÉTER : adresse]], RCCM n° [[À COMPLÉTER]].

**Contact données personnelles :** [[À COMPLÉTER : e-mail dédié, ex. donnees@meereo.ci]]

**Correspondant à la protection des données :** [[À COMPLÉTER — l'ARTCI a mis en place un fichier
national des correspondants ; vérifier si MEEREO est assujettie et procéder à la déclaration.]]

Les traitements sont soumis à la **loi n° 2013-450 du 19 juin 2013** relative à la protection des
données à caractère personnel, sous le contrôle de l'**ARTCI**.

### 2. Ce que nous collectons, et pourquoi

Nous ne collectons que des données **nécessaires** à un usage identifié. Aucune donnée n'est demandée
« au cas où ».

#### 2.1 À la création du compte — tous rôles

| Donnée | Pourquoi | Obligatoire |
|---|---|---|
| Prénom, nom | Vous identifier auprès des autres utilisateurs | Oui |
| Adresse e-mail | Identifiant de connexion, notifications, réinitialisation du mot de passe | Oui |
| **Numéro de téléphone** | Second canal de contact, récupération de compte, et — pour les Fournisseurs — réception des paiements | Oui |
| Ville | Pertinence géographique de l'annuaire et des appels d'offres | Oui pour Professionnel et Fournisseur, facultatif pour Client |
| Mot de passe | Sécuriser l'accès. **Conservé chiffré de façon irréversible**, jamais lisible par MEEREO | Oui |
| Acceptation des CGU (version + date) | Prouver le consentement contractuel | Oui |
| Consentement aux communications commerciales | Vous adresser des actualités | **Non** — case distincte, jamais pré-cochée |

#### 2.2 Professionnels

Dénomination de la structure, **numéro RCCM**, **numéro de contribuable**, secteurs d'activité, logo,
et les documents administratifs déposés (RCCM, attestation fiscale).

**Ces documents font l'objet d'une analyse automatisée** destinée à extraire les numéros
d'identification et à les comparer aux valeurs déclarées, aux fins d'attribution du badge « Vérifié par
MEEREO ». Voir l'article 6.

#### 2.3 Fournisseurs

Les mêmes données d'entreprise, ainsi que : catégories de produits servies, zones et modes de
livraison, fiches produits, et **coordonnées de réception des paiements** — opérateur (Orange Money,
MTN MoMo, Wave), numéro de téléphone associé et nom du titulaire du compte.

> **Précision importante :** ces coordonnées servent **uniquement** à indiquer à l'acheteur où adresser
> son règlement. **MEEREO n'accède à aucun compte de paiement, n'initie aucune transaction et ne
> détient aucun fonds.**

#### 2.4 Clients

Informations relatives aux projets : type d'ouvrage, surface, localisation **du projet** — à distinguer
de la ville du compte —, budget estimatif, et les documents versés au projet.

#### 2.5 Données produites par l'usage

Messages échangés, avis publiés, projets et suivis de chantier, documents partagés, commandes,
historique des analyses KAi, journaux techniques de connexion (adresse IP, date, type d'appareil) à des
fins de sécurité et de preuve.

#### 2.6 Données de tiers saisies par un professionnel *(ajouté 27/07/2026)*

Un professionnel peut enregistrer dans son espace des **prospects** — des personnes qui **ne sont pas
inscrites sur MEEREO** et qui n'ont pas consenti à y figurer. Il saisit alors leur nom et, le cas
échéant, leurs coordonnées.

**Dans ce cas, c'est le professionnel qui est responsable de ce traitement**, non MEEREO, qui se borne
à héberger. Il lui appartient de disposer d'un fondement pour détenir ces données et de répondre aux
demandes des personnes concernées. MEEREO le lui rappelle au moment de la saisie.

**Si vous découvrez que vos données figurent chez un professionnel sans motif**, écrivez-nous : nous
transmettons votre demande et pouvons intervenir sur les contenus manifestement illicites.

### 2.7 Ce que nous ne collectons pas

Nous ne demandons **aucune donnée sensible** au sens de la loi n° 2013-450 : origine, opinions
politiques ou religieuses, appartenance syndicale, santé, vie sexuelle. **Ne renseignez jamais de telles
informations** dans les champs libres, notamment dans les messages ou descriptions de projet.

### 3. Fondements des traitements

| Finalité | Fondement |
|---|---|
| Créer et gérer votre compte, fournir les services | **Exécution du contrat** que constituent les CGU |
| Vérifier les identifiants légaux (RCCM, contribuable) | **Exécution du contrat** et **intérêt légitime** : fiabilité de l'annuaire, prévention de la fraude |
| Facturer l'abonnement KAi Pro et les forfaits produits | **Exécution du contrat** et **obligation légale** (comptabilité) |
| Sécurité, prévention des abus, journalisation | **Intérêt légitime** de MEEREO et des utilisateurs |
| Communications commerciales | **Consentement**, révocable à tout moment |
| Conservation des pièces comptables et commerciales | **Obligation légale** |

### 4. Qui accède à vos données

#### 4.1 Ce qui est public

Sont **délibérément publics**, parce que c'est la fonction même du service : la page professionnelle
(dénomination, logo, secteurs, ville, présentation, badge de vérification), les fiches produits des
Fournisseurs, les appels d'offres publics, et les avis publiés.

**Ces informations sont accessibles à tous et indexables par les moteurs de recherche.** N'y publiez
que ce que vous acceptez de rendre public.

#### 4.2 Ce qui reste privé

Les messages, les documents de projet, les données financières déclarées, les coordonnées de réception
de paiement et les analyses KAi ne sont accessibles qu'aux personnes habilitées : vous-même, les
utilisateurs que vous avez expressément associés à un projet, et le personnel de MEEREO strictement
habilité.

#### 4.3 Destinataires extérieurs

| Destinataire | Ce qu'il reçoit |
|---|---|
| Hébergeur | Ensemble des données hébergées — [[À COMPLÉTER : identité et localisation]] |
| Prestataire d'envoi d'e-mails | Adresse e-mail, contenu des notifications |
| Prestataire de paiement (**pour les seules sommes dues à MEEREO**) | Données nécessaires au règlement de l'abonnement et des forfaits |
| **Le professionnel attributaire d'un marché** *(ajouté 27/07/2026)* | **Vos nom, e-mail et téléphone**, transmis **à la signature du marché** et pour sa seule exécution — voir `AVS-05`. Vous en êtes informé au moment de l'attribution. Ce professionnel devient alors **responsable de traitement** pour ses propres finalités (exécution, facturation, service après-vente) et s'interdit tout usage étranger, notamment la prospection. |
| Autorités judiciaires ou administratives | Sur réquisition régulière uniquement |

**Nous ne vendons pas vos données. Nous ne les louons pas. Nous ne les cédons à aucun courtier en
données.**

### 5. Durées de conservation

**[[À VALIDER PAR AVOCAT — les durées ci-dessous sont des propositions, à confronter aux obligations
comptables et commerciales OHADA applicables.]]**

| Donnée | Durée proposée |
|---|---|
| Compte actif | Toute la durée de la relation |
| Après suppression du compte | Suppression ou anonymisation sous **30 jours**, sauf obligation contraire |
| Documents administratifs (RCCM, attestation fiscale) | Durée de la relation, puis **[[à préciser]]** |
| Pièces comptables et factures | **10 ans** (obligation légale) |
| Messages et documents de projet | Durée de la relation, puis **[[à préciser]]** |
| Journaux de connexion | **12 mois** |
| Brouillon d'inscription non finalisé | **30 jours**, puis suppression automatique |
| Données de prospection commerciale | **3 ans** à compter du dernier contact |

### 6. Décisions automatisées et analyses KAi

#### 6.1 Vérification documentaire

Le contrôle de concordance entre les numéros extraits de vos documents et ceux que vous avez déclarés
est **automatisé**. Un écart entraîne la **suspension** de la validation du compte.

**Vous pouvez contester ce résultat** et demander un **réexamen humain** en écrivant à l'adresse
indiquée à l'article 1. Aucune décision définitive de refus n'est prise sur le seul fondement d'un
traitement automatisé sans possibilité de recours.

#### 6.2 Analyses KAi

KAi produit des analyses et suggestions à partir de vos données. **Ces analyses sont privées** : celles
d'un Fournisseur ne sont jamais exposées aux autres rôles.

**Elles n'ont aucune valeur décisionnelle** et ne produisent aucun effet juridique à votre égard.

**[[À COMPLÉTER — point à trancher :** si KAi repose en tout ou partie sur un prestataire tiers de
traitement automatisé, son identité, sa localisation et le régime des transferts doivent être indiqués
ici. C'est une mention obligatoire dès lors que des données quittent le territoire.**]]**

### 7. Transferts hors de Côte d'Ivoire

**[[À COMPLÉTER ET À VÉRIFIER — obligation forte.]]** La loi n° 2013-450 encadre le transfert de
données vers un pays tiers : il suppose un niveau de protection suffisant ou une **autorisation
préalable de l'ARTCI**.

Si l'hébergement ou un prestataire est situé hors de Côte d'Ivoire — hypothèse fréquente pour un
hébergement infonuagique — cette section doit préciser les pays concernés, les garanties mises en place
et l'autorisation obtenue. **Ce point ne peut pas rester en blanc.**

### 8. Sécurité

Nous mettons en œuvre : chiffrement des échanges (HTTPS), stockage irréversible des mots de passe,
cloisonnement des accès par rôle, journalisation des connexions, sauvegardes régulières et limitation
des accès internes aux seules personnes habilitées.

**Aucun système n'est infaillible.** En cas de violation de données susceptible de vous porter
atteinte, nous vous en informerons et procéderons aux notifications requises auprès de l'ARTCI.

### 9. Vos droits

Vous disposez des droits d'**accès**, de **rectification**, d'**opposition** et de **suppression** de
vos données, ainsi que du droit de **retirer votre consentement** aux communications commerciales à
tout moment.

**Comment les exercer :** écrivez à [[À COMPLÉTER : e-mail]] depuis l'adresse associée à votre compte,
ou par courrier à l'adresse du siège. Une pièce justificative d'identité peut être demandée en cas de
doute raisonnable.

**Délai de réponse : [[À VÉRIFIER auprès de l'ARTCI — un délai d'un mois est une pratique raisonnable ;
confirmer le délai légal applicable.]]**

**Limites à connaître.** Certaines données ne peuvent être supprimées à votre seule demande :

- les **pièces comptables**, soumises à une durée légale de conservation ;
- les **avis publiés**, dont la suppression unilatérale fausserait l'information des autres
  utilisateurs — leur retrait obéit aux règles de l'article 6 des CGU ;
- les données nécessaires à la **constatation ou à la défense d'un droit** en justice.

**Recours.** Si la réponse apportée ne vous satisfait pas, vous pouvez saisir l'**ARTCI**, autorité de
contrôle compétente en Côte d'Ivoire.

### 10. Cookies et traceurs

**[[À COMPLÉTER après inventaire technique.]]** Cette section doit distinguer les cookies strictement
nécessaires au fonctionnement — qui ne requièrent pas de consentement — des cookies de mesure
d'audience et de personnalisation, qui en requièrent un, recueilli avant dépôt.

**Tant que l'inventaire n'est pas fait, aucun traceur non nécessaire ne doit être déposé.**

### 11. Utilisateurs établis dans un autre État de l'UEMOA

MEEREO s'adresse à titre principal au marché ivoirien et se déploie progressivement dans l'espace
UEMOA. **Chaque État dispose de sa propre législation sur les données personnelles et de sa propre
autorité de contrôle.**

**[[À TRAITER AVANT TOUTE OUVERTURE COMMERCIALE DANS UN NOUVEAU PAYS :** revue locale des obligations
déclaratives, de la désignation éventuelle d'un représentant, et des règles de transfert.**]]**

### 12. Modification

Toute modification substantielle de la présente politique vous sera notifiée. La version en vigueur est
celle publiée sur la Plateforme, datée en tête de document.

---

## A8.6 — Mentions légales

⚠️ **Toutes les rubriques sont obligatoires.** Une mention légale incomplète est en elle-même une
infraction, indépendamment du contenu des autres textes.

### 1. Éditeur de la plateforme

| | |
|---|---|
| **Dénomination sociale** | [[À COMPLÉTER]] |
| **Forme juridique** | [[À COMPLÉTER : SARL, SA, SAS…]] |
| **Capital social** | [[À COMPLÉTER]] FCFA |
| **Siège social** | [[À COMPLÉTER : adresse complète]] |
| **N° RCCM** | [[À COMPLÉTER]] |
| **N° Contribuable** | [[À COMPLÉTER]] |
| **Téléphone** | [[À COMPLÉTER]] |
| **E-mail** | [[À COMPLÉTER]] |
| **Représentant légal** | [[À COMPLÉTER : nom et qualité]] |

### 2. Directeur de la publication

[[À COMPLÉTER : nom et qualité]]

### 3. Hébergement

| | |
|---|---|
| **Hébergeur** | [[À COMPLÉTER : dénomination]] |
| **Adresse** | [[À COMPLÉTER]] |
| **Pays d'hébergement des données** | [[À COMPLÉTER — information déterminante : si les données sont hébergées hors de Côte d'Ivoire, le régime des transferts de la loi n° 2013-450 s'applique et doit être traité dans la Politique de confidentialité]] |
| **Contact** | [[À COMPLÉTER]] |

### 4. Protection des données personnelles

Les traitements mis en œuvre sont soumis à la **loi n° 2013-450 du 19 juin 2013** relative à la
protection des données à caractère personnel.

| | |
|---|---|
| **Autorité de contrôle** | ARTCI — Autorité de Régulation des Télécommunications/TIC de Côte d'Ivoire |
| **Déclaration ARTCI** | [[À COMPLÉTER : référence et date de la déclaration préalable]] |
| **Correspondant à la protection des données** | [[À COMPLÉTER, le cas échéant]] |
| **Contact données personnelles** | [[À COMPLÉTER : e-mail dédié]] |

Les modalités d'exercice de vos droits figurent dans la **Politique de confidentialité**.

### 5. Nature de l'activité

MEEREO exploite une **plateforme numérique de mise en relation et d'outillage** destinée aux acteurs du
bâtiment, des travaux publics et de l'immobilier.

MEEREO **n'exerce aucune activité** de construction, de maîtrise d'œuvre, de vente de matériaux, ni
d'établissement de paiement ou de monnaie électronique. Les précisions figurent dans les
**Conditions Générales d'Utilisation** et dans les **Conditions Générales de Vente de la Marketplace**.

### 6. Propriété intellectuelle

La marque MEEREO, les logos, l'architecture de la plateforme, ses interfaces et ses développements sont
protégés. Toute reproduction ou représentation, totale ou partielle, sans autorisation écrite préalable
est interdite.

Les contenus publiés par les utilisateurs — descriptions, photographies, logos d'entreprise, documents
— demeurent la **propriété de leurs auteurs**.

**[[À COMPLÉTER, le cas échéant : numéro de dépôt de la marque MEEREO (OAPI).]]**

### 7. Signalement d'un contenu illicite

Tout contenu manifestement illicite peut être signalé à l'adresse [[À COMPLÉTER : e-mail]], en
précisant l'URL concernée, la nature du contenu et les motifs du signalement.

### 8. Crédits

**[[À COMPLÉTER, le cas échéant : conception, développement, photographies et illustrations sous
licence.]]**
