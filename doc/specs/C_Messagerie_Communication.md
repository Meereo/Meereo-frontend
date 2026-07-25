# C. MESSAGERIE & COMMUNICATION

> Retour au [sommaire](00_INDEX.md)

---

## `MSG-01` — Contact d'une entreprise sans page publique
**Statut : CADRÉ — DÉVELOPPABLE**

**Bug actuel :** le bouton « Contacter l'entreprise » est visible même sans page publique, mais les messages envoyés ne sont **jamais reçus** (perdus dans le vide). Comportement pire qu'un bouton absent : l'utilisateur croit avoir envoyé un message qui n'arrivera jamais.

**Décision : Solution 2 — transmission garantie.** Un message envoyé **arrive toujours**, jamais perdu. Trois cas à couvrir :

1. **Entreprise inscrite, page publique complète** → contact normal, message livré dans sa messagerie (`MSG-04`).
2. **Entreprise inscrite, page publique incomplète** (onboarding non terminé) → le message est **livré quand même** dans sa messagerie ; l'absence de page publique finalisée ne bloque pas la réception.
3. **Entreprise seulement référencée** (présente dans l'annuaire, sans compte encore créé) → le message est **retenu**, et l'entreprise reçoit une **invitation à s'inscrire pour le lire**. À l'inscription, elle **retrouve le message en attente** dans sa messagerie.

**Levier d'acquisition (cas 3).** Ce mécanisme transforme une demande de contact en **opportunité d'inscription** : « un client vous a contacté sur MEEREO, inscrivez-vous pour lire son message ». Motivation concrète et personnelle de rejoindre la plateforme — cohérent avec la stratégie d'acquisition (Phase 1, `FIN-03`).

> **Condition (cas 3) :** l'envoi de l'invitation suppose qu'on dispose d'au moins un **canal de contact** de l'entreprise référencée (email ou téléphone). Une entreprise référencée **sans aucune coordonnée** ne peut pas être invitée — dans ce cas, soit le bouton contact est masqué pour elle, soit le message reste en attente sans notification possible. À gérer côté données de l'annuaire.

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

> **Complément technique (v1.27) :** hypothèses de cause, architecture cible (optimistic UI, réconciliation, source unique) et protocole de vérification en **[Annexe 3, section A3.1](Annexe_3_Diagnostic_Technique.md#a31--msg-06--synchronisation-instantanée-dune-conversation)**.

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
