# A. INSCRIPTION & IDENTITE DU PROFESSIONNEL

> Retour au [sommaire](00_INDEX.md)

---

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
> **Complément technique (v1.27) :** hypothèses de cause, architecture cible et protocole de vérification en **[Annexe 3, section A3.2](Annexe_3_Diagnostic_Technique.md#a32--ins-06--validation-par-étape-de-lonboarding)**.
