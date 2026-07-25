# ANNEXE 3 — Diagnostic technique : causes probables et protocole de vérification

> Retour au [sommaire](00_INDEX.md)

**Concerne :** `MSG-06`, `INS-06`, `QAL-02`.
**Ajouté :** v1.27, en fusionnant la branche parallèle qui avait développé ce contenu (voir [journal v1.27](Annexe_2_Journal_Versions.md)).

> **Avertissement de méthode, à lire avant toute chose :** ce diagnostic a été produit **sans accès au code source réel** de la plateforme. Les hypothèses ci-dessous sont classées par probabilité à partir des symptômes décrits dans `MSG-06`, `INS-06` et `QAL-02` — ce sont des **points de départ de diagnostic**, pas des causes confirmées. Le développeur doit vérifier chaque hypothèse contre le code avant d'implémenter un correctif. Aucune ligne ci-dessous ne doit être lue comme « c'est forcément ça ».

---

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

---

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

---

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

---

## A3.4 — Synthèse transversale

Les trois sujets partagent un **schéma de cause récurrent** : des composants qui gèrent leur propre état ou leur propre source de données au lieu de consulter une source unique et réactive — messagerie non branchée sur la mutation d'envoi, onboarding non gardé par un schéma partagé front/serveur, logo lu indépendamment par écran. C'est la **même famille de cause** que celle déjà identifiée pour `NAV-01`/`NAV-02`/`NAV-03` et pour le fil rouge architectural `INS-04` + `AVS-01` + `QAL-02` ([Annexe 1](Annexe_1_Decisions_Dependances.md)). Traiter ces bugs comme des manifestations d'un seul problème d'architecture — l'absence généralisée d'un état partagé et réactif — plutôt que comme des correctifs isolés.

---

## A3.5 — Points ouverts propres à ce diagnostic

1. **Stack technique non confirmée.** Les hypothèses ci-dessus supposent un modèle React + gestion de cache de requêtes. Si l'implémentation réelle repose sur autre chose, le principe reste valable mais le détail d'implémentation change. À confirmer par le développeur.
2. Toutes les hypothèses de cause (A3.1 à A3.3) sont des points de départ diagnostiques, non confirmés faute d'accès au code — à vérifier avant implémentation, pas à coder directement sur la base de cette annexe seule.
