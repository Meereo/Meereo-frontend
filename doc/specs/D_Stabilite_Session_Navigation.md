# D. STABILITÉ, SESSION & NAVIGATION

> Retour au [sommaire](00_INDEX.md)

> **Note transverse :** `NAV-01`, `NAV-02` et `NAV-03` partagent une **cause racine probablement commune** (gestion de session / routing / persistance d'état front). À traiter dans une **investigation technique unique**, pas en trois correctifs séparés.

---

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
