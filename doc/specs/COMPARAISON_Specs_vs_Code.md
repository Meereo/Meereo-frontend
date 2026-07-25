# COMPARAISON DÉTAILLÉE — Spécifications v1.27 vs Codebase

**Date :** 24 juillet 2026
**Objectif :** Pour chaque exigence du référentiel, confronter point par point ce que la spec demande et ce que le code fait réellement. Identifier les écarts, les risques et les actions correctives.

---

## LÉGENDE

- ✅ **OK** — Le code satisfait l'exigence
- ⚠️ **PARTIEL** — Implémenté partiellement, des points manquent
- ❌ **KO** — Non implémenté ou non conforme
- 🔧 **ACTION** — Correction ou développement requis

---

# A. INSCRIPTION & IDENTITÉ DU PROFESSIONNEL

## `INS-01` — RCCM et contribuable

| Exigence spec | Code | Statut |
|---|---|---|
| Valeurs d'exemple **jamais enregistrables** | Blocklist dans `auth.js:25-49` + regex dans `Onboarding.jsx:382-407` | ✅ OK |
| RCCM et NCC **permanents** en base | Champs persistés dans ProProfile/FournisseurProfile | ✅ OK |
| **Unicité stricte** sur toute la plateforme | `@unique` sur rccm et ncc (`schema.prisma:201-202, 250-251`) + check cross-profils (`auth.js:175-186`) | ✅ OK |
| IA analyse les documents déposés | Aucune extraction IA implémentée | ❌ KO |
| IA compare numéro extrait vs déclaré | Aucune comparaison automatique | ❌ KO |
| **Blocage immédiat** en cas d'écart | Pas de workflow de vérification | ❌ KO |

> 🔧 **ACTION :** Implémenter le pipeline de vérification IA : upload RCCM → extraction OCR/IA → comparaison → blocage si écart. Prérequis pour `INS-04`.

---

## `INS-02` — Logo unique

| Exigence spec | Code | Statut |
|---|---|---|
| **Un seul logo** à tout moment | Champ `logo` unique dans le store | ⚠️ PARTIEL |
| Import → IA remplace l'import | Pas de logique de remplacement atomique | ⚠️ PARTIEL |
| Source unique pour `QAL-02` | Chaque composant fait son propre fetch | ❌ KO |

> 🔧 **ACTION :** Créer un hook `useCompanyLogo(companyId)` unique, utilisé partout. Remplacement atomique côté serveur.

---

## `INS-03` — Page pro obligatoire

| Exigence spec | Code | Statut |
|---|---|---|
| **Popup obligatoire** à la 1ère connexion | Non implémenté | ❌ KO |
| Popup sans action de l'utilisateur | Non implémenté | ❌ KO |
| **Bloquant** : pas d'accès aux fonctionnalités sans page | Pas de guard | ❌ KO |
| Bug : popup seulement après refresh | Non corrigé (popup n'existe pas) | ❌ KO |
| PageBuilder existe | `PageBuilder.jsx` + sections builder complet | ✅ OK |

> 🔧 **ACTION :** Ajouter un guard dans `CockpitLayout.jsx` : si `user.type === 'pro'` et page publique non créée → popup modal bloquant.

---

## `INS-04` — Badge « Vérifié par MEEREO »

| Exigence spec | Code | Statut |
|---|---|---|
| Badge déclenché par dépôt RCCM + vérification IA | Aucun système de badge | ❌ KO |
| 4 conditions cumulatives (dépôt, analyse IA, correspondance, validation) | Rien implémenté | ❌ KO |
| Badge **vert**, identique partout | Aucun composant `<VerifiedBadge />` | ❌ KO |
| Visible sur toutes les interfaces | Aucun affichage | ❌ KO |
| Source unique partagée | Pas de champ `isVerified` | ❌ KO |

> 🔧 **ACTION :** (1) Ajouter `isVerified: Boolean` dans ProProfile/FournisseurProfile. (2) Créer le pipeline INS-01 IA. (3) Créer `<VerifiedBadge />` utilisé partout. Dépend de INS-01 (vérification IA).

---

## `INS-05` — URL publique

| Exigence spec | Code | Statut |
|---|---|---|
| URL **générée automatiquement** à la création | Slug auto-généré (`auth.js:120-127`) | ✅ OK |
| Construite à partir du nom | Normalisation du nom d'entreprise | ✅ OK |
| **Unicité garantie** | `@unique` sur slug + vérification (`pro.js:235-238`) | ✅ OK |
| Variante générée en cas de conflit | Suffixe aléatoire ajouté | ✅ OK |
| **Consultation, copie, partage** facile | Pas de boutons copier/partager | ❌ KO |
| Redirection directe | Route `/pro/:slug` fonctionnelle | ✅ OK |

> 🔧 **ACTION :** Ajouter un `<ShareMenu />` sur la page de gestion du profil pro avec copie du lien + partage réseaux sociaux. Le composant `ShareMenu.jsx` existe déjà — l'intégrer.

---

## `INS-06` — Validation par étape de l'onboarding

| Exigence spec | Code | Statut |
|---|---|---|
| Chaque étape **valide avant passage** | Validation partielle (certains champs seulement) | ⚠️ PARTIEL |
| **Impossible** de passer sans champs obligatoires | Navigation directe par URL possible (stepper non gardé) | ❌ KO |
| Boutons **désactivés** tant que champs invalides | Partiellement implémenté | ⚠️ PARTIEL |
| **Message d'erreur clair** par champ | Pas systématique | ⚠️ PARTIEL |
| Sortie d'impasse : redirection auto vers l'étape manquante | Non implémenté | ❌ KO |
| Revalidation serveur avec réponse structurée | Serveur bloque mais ne guide pas | ❌ KO |
| S'applique aux **3 parcours** | Validation variable selon le parcours | ⚠️ PARTIEL |

> 🔧 **ACTION :** (1) Implémenter un schéma Zod/Yup par étape, partagé front/back. (2) Garder le stepper (impossible d'atteindre step N+1 sans valider step N). (3) API de validation finale qui retourne `{ missingField, step }` pour redirection.

---

# B. ANNUAIRE & APPELS D'OFFRES

## `ANN-01` — Recherche AO privés

| Exigence spec | Code | Statut |
|---|---|---|
| Recherche par **nom, mots-clés, spécialités, expertise** | `ProSearch.jsx` : recherche par nom seulement | ⚠️ PARTIEL |
| Résultats **instantanés** | Recherche côté client dans le store | ✅ OK |
| Ajout rapide d'entreprises | Interface de sélection présente | ✅ OK |

> 🔧 **ACTION :** Ajouter filtres par spécialités et domaines d'expertise dans `ProSearch.jsx`.

---

## `ANN-02` — Affichage entreprises

| Exigence spec | Code | Statut |
|---|---|---|
| Logo, nom, domaines d'expertise minimum | Affiché mais logos depuis sources multiples | ⚠️ PARTIEL |
| Logos correctement affichés | Bug de source non unique (`QAL-02`) | ❌ KO |
| Étoiles reliées au système centralisé `AVS-01` | Calcul indépendant par composant | ❌ KO |

> 🔧 **ACTION :** Corriger via `QAL-02` (source unique logo) et `AVS-01` (source unique avis).

---

## `ANN-03` — Refonte Bourse des AO

| Exigence spec | Code | Statut |
|---|---|---|
| Revoir **entièrement le design** | Page Tenders existe mais pas refaite | ⚠️ PARTIEL |
| Notification **visible** pour nouvel AO | Notification via `AVS-02` | ✅ OK |

---

## `ANN-04` — Performances annuaire

| Exigence spec | Code | Statut |
|---|---|---|
| Affichage quasi instantané | Pagination présente (`getWithPagination`) | ⚠️ PARTIEL |
| Optimisation médias, cache, lazy loading | Pas d'optimisation spécifique constatée | ❌ KO |

> 🔧 **ACTION :** Implémenter lazy loading d'images, skeleton loading, cache API.

---

## `ANN-05` — Compatibilité multi-navigateurs

| Exigence spec | Code | Statut |
|---|---|---|
| Fonctionnement identique Safari, Chrome, Edge, Firefox | Aucun test cross-browser, aucune correction WebKit | ❌ KO |

> 🔧 **ACTION :** Audit + tests automatisés cross-browser. Corriger les incompatibilités WebKit/Safari.

---

# C. MESSAGERIE & COMMUNICATION

## `MSG-01` — Contact sans page publique

| Exigence spec | Code | Statut |
|---|---|---|
| **Cas 1** : inscrit + page complète → contact normal | Modal de contact sur `Profile.jsx` | ✅ OK |
| **Cas 2** : inscrit, page incomplète → livraison quand même | Pas de livraison garantie sans page finalisée | ❌ KO |
| **Cas 3** : seulement référencé → message retenu + invitation | Backend retourne `202 pending` mais message **non persisté** (TODO dans `conversations.js:139`) | ❌ KO |
| Levier d'acquisition (invitation à s'inscrire) | Pas d'envoi d'invitation | ❌ KO |

> 🔧 **ACTION :** (1) Persister les messages en attente en DB (`PendingMessage` model). (2) Envoyer l'invitation par email/SMS. (3) À l'inscription, rattacher les messages.

---

## `MSG-02` — Refonte messagerie

| Exigence spec | Code | Statut |
|---|---|---|
| Communication **fiable, instantanée, sécurisée** | WebSocket Socket.IO fonctionnel | ✅ OK |
| Synchronisation **temps réel** | Messages instantanés, typing indicators | ✅ OK |
| **Client** : accès uniquement relations de travail + annuaire | Sécurité backend implémentée (`conversations.js:149-169`) | ✅ OK |
| **Pro** : accès uniquement clients CRM | Sécurité backend implémentée | ✅ OK |
| Pro **ne peut pas** accéder à la liste des clients via messagerie | Filtre côté backend, mais vérification pas stricte | ⚠️ PARTIEL |
| Logos dans les conversations | Logos depuis sources multiples (cf. `QAL-02`) | ⚠️ PARTIEL |

---

## `MSG-03` — Lu / non-lu

| Exigence spec | Code | Statut |
|---|---|---|
| Notification **reste visible** tant que non lu | `unread` counter implémenté côté serveur via `lastReadAt` | ✅ OK |
| Marqué lu **après ouverture effective** seulement | `markRead()` appelé à l'ouverture du composant (`Messages.jsx:388-391`) | ⚠️ PARTIEL |
| Piloté par **événement d'ouverture réel** | Ouverture du composant, pas scroll/vue du message | ⚠️ PARTIEL |

> 🔧 **ACTION :** Utiliser un `IntersectionObserver` pour ne marquer lu qu'après affichage effectif du message dans le viewport.

---

## `MSG-04` — Conversation unique par binôme

| Exigence spec | Code | Statut |
|---|---|---|
| **Une seule conversation** par binôme | Vérification applicative avant création (`conversations.js:186-208`) | ⚠️ PARTIEL |
| Pas de contrainte DB (@@unique sur binôme) | Aucune contrainte Prisma — **race condition possible** | ❌ KO |
| Conversation **évolue** au fil des étapes | Pas de rattachement automatique des événements AO/marché | ❌ KO |
| Fusion directe/projet | Coexistence possible de 2 conversations pour le même binôme | ❌ KO |
| **Nommage contextuel** : pro voit le projet, client voit projet+entreprise | Non implémenté — même libellé pour tous | ❌ KO |
| Identifiée par **binôme d'UUID** | Recherche par participants mais pas de contrainte formelle | ⚠️ PARTIEL |

> 🔧 **ACTION :** (1) Ajouter contrainte DB unique sur le binôme de participants. (2) Implémenter le nommage contextuel par rôle. (3) Fusionner les conversations existantes dupliquées. (4) Rattacher les événements AO/marché à la conversation existante.

---

## `MSG-05` — Appels audio/vidéo

| Exigence spec | Code | Statut |
|---|---|---|
| Messagerie instantanée + appels vocaux + vidéo | Socket.IO pour la messagerie uniquement | ❌ KO |
| Architecture API entièrement intégrée | Aucune intégration WebRTC/Twilio | ❌ KO |
| Notifications d'appel entrant | Non implémenté | ❌ KO |

> 🔧 **ACTION :** Intégrer une API de communication (ex. Twilio, Daily.co, LiveKit) pour les appels audio/vidéo. Dépend de l'architecture temps réel `MSG-02` (✅ en place).

---

## `MSG-06` — Synchro instantanée nouvelle conversation

| Exigence spec | Code | Statut |
|---|---|---|
| Conversation créée **instantanément** dans la liste | Store mis à jour via Socket.IO | ⚠️ PARTIEL |
| Devient **automatiquement la conversation active** | Pas de sélection automatique | ❌ KO |
| Message **apparaît immédiatement** | Dépend de la latence réseau | ⚠️ PARTIEL |
| Compteur mis à jour **temps réel** | Compteur mis à jour au prochain fetch | ⚠️ PARTIEL |
| **Optimistic UI** (WhatsApp/Slack/Messenger) | Pas d'insertion optimiste avant réponse serveur | ❌ KO |

> 🔧 **ACTION :** (1) Insérer la conversation optimistiquement dans le store avant la réponse serveur. (2) Réconcilier avec l'id réel au retour. (3) Sélectionner automatiquement la nouvelle conversation. Cf. [Annexe 3, A3.1](Annexe_3_Diagnostic_Technique.md).

---

## `MSG-07` — Multi-participants

| Exigence spec | Code | Statut |
|---|---|---|
| **G1** — Extension de la conversation unique | `addParticipant` dans l'API | ✅ OK |
| **G2** — Intervenant aveugle au reste du projet | Permission engine définit cette restriction | ✅ OK |
| **G3** — Seul le pro responsable peut ajouter/retirer | Pas de vérification de rôle dans `addParticipant` | ❌ KO |
| **G4** — Messages postérieurs à l'ajout uniquement | Filtrage temporel via `joinedAt` (`conversations.js:327`) | ✅ OK |
| Retrait d'un intervenant | Pas d'endpoint de retrait | ❌ KO |
| Tous voient la composition du groupe | Nombre de participants affiché | ✅ OK |

> 🔧 **ACTION :** (1) Vérifier le rôle « pro responsable du marché » dans `addParticipant`. (2) Ajouter endpoint `removeParticipant`.

---

# D. STABILITÉ, SESSION & NAVIGATION

## `NAV-01` + `NAV-02` + `NAV-03` — Session et routing

| Exigence spec | Code | Statut |
|---|---|---|
| Aucun renvoi vers landing si connecté | `HydrationGate` + `RoleGuard` dans `App.jsx` | ⚠️ PARTIEL |
| Aucune déconnexion involontaire | Intercepteur 401 corrigé (exclut `/auth/me`) | ⚠️ PARTIEL |
| Refresh conserve **page, onglet, filtres, position** | URL conservée (React Router), mais pas l'état interne | ⚠️ PARTIEL |
| **Investigation unique** de la cause racine | Pas documentée | ❌ KO |

> 🔧 **ACTION :** (1) Persister l'onglet actif et les filtres dans l'URL (query params) ou sessionStorage. (2) Documenter et mener l'investigation unique de la cause racine commune.

---

## `NAV-04` — Logo absent

| Exigence spec | Code | Statut |
|---|---|---|
| Logo en-tête page pro affiché | Hook `useLogo()` existe mais pas utilisé partout | ⚠️ PARTIEL |

> 🔧 **ACTION :** Corriger via `QAL-02` (hook unique + composant partagé).

---

## `NAV-05` — Lien Paramètres inopérant

| Exigence spec | Code | Statut |
|---|---|---|
| Menu avatar → Paramètres fonctionne | `UserMenu.jsx` contient un lien | ⚠️ NON VÉRIFIÉ |
| **3 points d'entrée** testés pour les 3 rôles | Pas de test systématique | ⚠️ NON VÉRIFIÉ |

> 🔧 **ACTION :** Vérifier les 3 points d'entrée × 3 rôles = 9 chemins. Ajouter en non-régression.

---

## `NAV-06` — Token manquant

| Exigence spec | Code | Statut |
|---|---|---|
| Jeton transmis sur **tous** les appels authentifiés | `apiFetch` avec `withAuth` par défaut | ⚠️ PARTIEL |
| Jamais de message technique brut | « Token manquant » possible si session expirée | ❌ KO |
| Session expirée → message clair + reconnexion | Pas de détection proactive d'expiration | ❌ KO |

> 🔧 **ACTION :** (1) Intercepter les 401 → afficher un modal « Session expirée, veuillez vous reconnecter ». (2) Ne jamais exposer les messages d'erreur techniques au frontend.

---

# E. CYCLE DE VIE & SUIVI DES PROJETS

## `PRJ-01` — Marché → Projet auto

| Exigence spec | Code | Statut |
|---|---|---|
| Validation du marché **génère automatiquement** un projet | Création manuelle uniquement | ❌ KO |
| Supprimer bouton « Démarrer le marché » | Encore présent | ❌ KO |
| Supprimer section « Paiement et sécurisation » | Encore présente | ❌ KO |

> 🔧 **ACTION :** (1) Trigger backend : `Market.status = 'accepted'` → auto-créer Project. (2) Supprimer les éléments UI obsolètes.

---

## `PRJ-02` — États du projet

| Exigence spec | Code | Statut |
|---|---|---|
| 8 états définis | 6 états implémentés (brouillon, en_cours, termine, cloture, archive, suspendu) | ⚠️ PARTIEL |
| Synchronisation côté client | Suppression par le pro → incohérence côté client | ❌ KO |
| Droits par état par rôle | Permission engine défini mais pas utilisé dans les routes | ⚠️ PARTIEL |

> 🔧 **ACTION :** (1) Ajouter les 2 états manquants (En préparation, En attente). (2) Utiliser `permissionEngine.checkPermission()` dans les routes de transition.

---

## `PRJ-03` / `PRJ-04` — Synchro notes et images

| Exigence spec | Code | Statut |
|---|---|---|
| Notes synchronisées **automatiquement et immédiatement** pro → client | Pas d'événement WebSocket spécifique | ❌ KO |
| Images synchronisées **en temps réel** | Pas d'événement WebSocket spécifique | ❌ KO |
| Distinction **privé/interne** vs partagé | Champ `visibility` en DB mais pas de filtre UI | ⚠️ PARTIEL |

> 🔧 **ACTION :** (1) Émettre des événements Socket.IO lors d'ajout de note/image. (2) Ajouter un toggle « Privé / Partagé » dans l'UI de dépôt.

---

## `PRJ-05` — Intervenants

| Exigence spec | Code | Statut |
|---|---|---|
| **I1** — 4 sources d'assignation | Invitation email seulement implémentée clairement | ⚠️ PARTIEL |
| **I2** — Tout intervenant finit avec un compte | Email d'invitation envoyé | ✅ OK |
| **I3** — Accès AUCUN au projet sous-traité | Défini dans `permissionEngine.js:52-54` | ⚠️ PARTIEL |
| Retirer, remplacer, changer de rôle | Partiellement implémenté | ⚠️ PARTIEL |

> 🔧 **ACTION :** (1) Implémenter les 4 sources d'assignation distinctes dans l'UI. (2) Appeler `checkPermission()` systématiquement pour I3.

---

## `PRJ-06` — Équipe

| Exigence spec | Code | Statut |
|---|---|---|
| **E1** — Deux portes d'écriture, une seule base | Bug : page publique et paramètres pointent vers des sources différentes | ❌ KO |
| **E2** — Référentiel réutilisable | Membres enregistrés en base | ✅ OK |
| **E3** — Membre « Public » → page publique | Implémenté via sections builder | ✅ OK |
| **E4** — Rôles internes (4) | Admin, Chef de projet, Collaborateur, Lecteur dans Settings | ✅ OK |
| **E5** — Retrait différencié (projets passés conservés) | Non implémenté | ❌ KO |
| **E6** — Visible côté client, masquable | Non implémenté | ❌ KO |

> 🔧 **ACTION :** (1) Faire écrire les deux interfaces (Paramètres + Page publique) dans la **même table**. (2) Implémenter le retrait différencié. (3) Ajouter toggle de visibilité client.

---

## `PRJ-07` — Suivi chantier

| Exigence spec | Code | Statut |
|---|---|---|
| Phases de mission en frise | `Worksite.jsx` avec phases + `status.js:22-30` | ✅ OK |
| Validation groupée par section | Implémenté | ✅ OK |
| Notes de chantier typées (4 types) | Implémenté | ✅ OK |
| « Valider cette section » en **en-tête** (pas en bas) | Bouton encore en bas | ❌ KO |
| « Valider le projet » en **bas** (pas en haut) | Bouton encore en haut | ❌ KO |
| **Phases spec** : Conception, Préparation, Gros Œuvre, Second Œuvre, Matériaux, Mobilier, Réception | **Phases code** : Esquisse, Avant-projet, Projet détaillé, Plans d'exécution, Consultation, Attribution, Suivi chantier, Réception | ❌ KO (divergence) |

> 🔧 **ACTION :** (1) Déplacer les boutons de validation. (2) **Aligner les phases code sur les phases spec** (7 phases construction au lieu de 8 phases architecture). C'est un changement structurant car `FIN-01` utilise le même axe.

---

## `PRJ-08` — Visualisation documentaire

| Exigence spec | Code | Statut |
|---|---|---|
| Modes cartes, galerie, vignettes, chronologie | Liste simple uniquement | ❌ KO |

---

## `PRJ-09` — Couleurs de projets

| Exigence spec | Code | Statut |
|---|---|---|
| Couleur distincte par projet, palette élargie | Non implémenté | ❌ KO |

---

## `PRJ-10` — Cohérence Client ↔ Pro

| Exigence spec | Code | Statut |
|---|---|---|
| Mêmes données, temps réel, selon les droits | Store centralisé mais pas de synchro temps réel pour docs/notes | ⚠️ PARTIEL |

---

# F. AVIS, NOTIFICATIONS & DONNÉES DE COMPTE

## `AVS-01` — Avis centralisés

| Exigence spec | Code | Statut |
|---|---|---|
| Avis **entièrement générés par le système** | Invitation auto à la clôture de mission | ⚠️ PARTIEL |
| Option manuelle **supprimée** de l'éditeur de page | `ReviewsEditor.jsx` existe encore | ❌ KO |
| @@unique([author, target, project]) | Contrainte en place (`schema.prisma:152`) | ✅ OK |
| Évaluation croisée pro ↔ intervenant | Implémentée (`reviews.js:51-61`) | ✅ OK |
| **Source unique** centralisée | Chaque composant fait son propre calcul | ❌ KO |
| Affichage **identique partout** | Pas garanti (pas de composant partagé) | ❌ KO |
| Cas « aucun avis » : message explicite | Non systématique | ⚠️ PARTIEL |
| Immuabilité côté pro | Pro ne peut pas modifier les avis | ✅ OK |

> 🔧 **ACTION :** (1) Supprimer `ReviewsEditor.jsx`. (2) Créer un hook `useCompanyRating(companyId)` centralisé. (3) Utiliser un composant `<RatingDisplay />` unique partout.

---

## `AVS-02` — Notifications

| Exigence spec | Code | Statut |
|---|---|---|
| Notification **temps réel** par événement | Socket.IO + `NotifBell.jsx` + `NotifPanel.jsx` | ✅ OK |
| Compteurs sans rafraîchissement | Compteurs agrégés dans `NotifBell.jsx` | ✅ OK |
| Historique dédié | `NotifPanel.jsx` avec liste et actions | ✅ OK |

---

## `AVS-03` — Suppression de profils et email

| Exigence spec | Code | Statut |
|---|---|---|
| Chaque compte identifié par **UUID** | CUID + publicId UUID | ✅ OK |
| Relations basées sur l'identifiant unique | Relations Prisma via userId | ✅ OK |
| Suppression → **aucune donnée** réassociée au nouvel email | Hard delete (`auth.js:681`) → email immédiatement réutilisable → **données anciennes potentiellement réassociées** | ❌ KO |
| Nouveau compte **entièrement indépendant** | Non garanti car email libéré et projets nettoyés par email | ❌ KO |
| **Fournisseur** : suppression possible + produits retirés | Implémenté | ✅ OK |
| Notification acheteurs avec coordonnées fournisseur | Socket notification implémentée (`auth.js:625-651`) | ✅ OK |
| **Factures impayées → suppression BLOQUÉE** | Non implémenté | ❌ KO |

> 🔧 **ACTION CRITIQUE :** (1) Passer en soft-delete (flag `deletedAt` + prefixe email `deleted_TIMESTAMP_`) au lieu de hard delete. (2) Vérifier le solde dû avant suppression. (3) Empêcher la réassociation de données via l'ancien email.

---

# G. QUALITÉ TRANSVERSE

## `QAL-01` — Performances

| Exigence spec | Code | Statut |
|---|---|---|
| Temps de chargement optimisés | `React.lazy()` pour les pages | ⚠️ PARTIEL |
| Cache intelligent | Pas de cache API côté frontend | ❌ KO |
| Lazy loading médias | Pas implémenté | ❌ KO |
| Compatibilité multi-navigateurs | Non testé | ❌ KO |

> 🔧 **ACTION :** (1) Ajouter React Query ou SWR pour le cache API. (2) Lazy loading d'images. (3) Tests cross-browser.

---

## `QAL-02` — Logo source unique

| Exigence spec | Code | Statut |
|---|---|---|
| Logo récupéré depuis le **profil professionnel** uniquement | Composants lisent depuis des sources différentes | ❌ KO |
| **Toutes** les interfaces utilisent **une seule source** | Pas de hook/composant partagé universel | ❌ KO |
| Modification **répercutée automatiquement** partout | Cache navigateur non invalidé | ❌ KO |
| Placeholder unique en cas d'absence | Gestion incohérente (image cassée vs initiales) | ❌ KO |

> 🔧 **ACTION ARCHITECTURALE :** (1) Créer `<CompanyLogo companyId={id} />` et `useCompanyLogo(id)` centralisés. (2) URL versionnée (hash) à chaque remplacement. (3) Placeholder unique (initiales). (4) Recenser et remplacer toutes les occurrences dans le code. Cf. [Annexe 3, A3.3](Annexe_3_Diagnostic_Technique.md).

---

## `QAL-03` — Orthographe et terminologie

| Exigence spec | Code | Statut |
|---|---|---|
| Correction linguistique complète | Nombreux textes en dur non relus | ⚠️ PARTIEL |
| Cohérence terminologique | « KAI » vs « KAi » constaté dans le code | ❌ KO |
| Mêmes termes pour mêmes concepts | Variable (Mission vs Marché vs Contrat subsistent) | ❌ KO |

> 🔧 **ACTION :** (1) Passer tous les textes par i18n (`t()`). (2) Relecture complète des fichiers de traduction. (3) Uniformiser « KAi » partout.

---

# H. SUIVI FINANCIER

## `FIN-01` — Budget, Phases, Marchés, Paiements

| Exigence spec | Code | Statut |
|---|---|---|
| Budget global = plafond (D3) | Modèle Budget implémenté | ✅ OK |
| Phase (ex-Actif) (D2) | Modèle Phase/Expense implémenté | ✅ OK |
| Mission = marché validé (D4) | Relation Market/Mission existante | ✅ OK |
| Paiement = facture déclarée (D5) | PaymentOrder + Invoice complets | ✅ OK |
| Client passif (D6) | Pro déclare, client consulte | ✅ OK |
| Alerte dépassement non bloquante (D7) | Non implémenté (pas d'alerte) | ⚠️ PARTIEL |
| MEEREO ≠ comptabilité (D9) | Pas de logique comptable | ✅ OK |
| Avancement ≠ paiement (D12) | Découplé | ✅ OK |
| Fusion menu → « Marchés » uniquement | « Missions », « Contrats » encore présents | ❌ KO |
| Supprimer « Actifs » du menu | `Assets.jsx` encore présent | ❌ KO |
| **Phases fixes** (spec) vs **Phases code** | **Divergence** : 7 phases construction (spec) vs 8 phases architecture (code) | ❌ KO |

> 🔧 **ACTION :** (1) Supprimer les entrées menu obsolètes (Missions, Contrats, Actifs). (2) Aligner les phases. (3) Implémenter l'alerte de dépassement (badge visuel, non bloquant).

---

## `FIN-02` — Mobile Money

| Exigence spec | Code | Statut |
|---|---|---|
| Intégration encaissement Mobile Money | Aucune intégration | ❌ KO |
| Abonnement KAi Pro (3 tarifs par rôle) | Champs texte dans Settings, pas d'intégration | ❌ KO |
| Petits achats Marketplace | Non implémenté | ❌ KO |

> 🔧 **ACTION :** Intégrer un prestataire Mobile Money (Orange Money, MTN MoMo, Wave). Développement majeur.

---

## `FIN-03` — Monétisation 3 phases

| Exigence spec | Code | Statut |
|---|---|---|
| Quota 5 produits gratuits | Backend vérifie (`products.js:62-67`) | ✅ OK |
| Forfait par produit au-delà | Pas de facturation | ❌ KO |
| Ventes flash payantes | Champ flash dans Product, pas de facturation | ❌ KO |
| Sponsoring payant | Champ `sponsored`, pas de facturation | ❌ KO |
| Abonnement fournisseur | Non implémenté | ❌ KO |
| Tarifs **configurables** back-office | Non implémenté (serait codé en dur) | ❌ KO |
| Dépublication produit impayé avec préavis | Non implémenté | ❌ KO |

> 🔧 **ACTION :** Implémenter le système de facturation complet. Dépend de `FIN-02` (Mobile Money). Tarifs paramétrables via table de configuration en DB.

---

# I. CYCLE APPEL D'OFFRES & MARCHÉS

## `AOF-01` — Cycle AO → marché

| Exigence spec | Code | Statut |
|---|---|---|
| **A1** — Émetteurs : client ET pro | AO créable par les deux | ✅ OK |
| **A2** — Types public/privé | Champ type dans le modèle AO | ✅ OK |
| **A3** — Portée globale | Non explicitement codé | ⚠️ PARTIEL |
| **A6** — Acceptation = marché signé directement | Pas de trigger auto marché | ❌ KO |
| **A7** — Offres non retenues → refusées + notifiées | Pas de notification automatique | ❌ KO |
| **A8** — AO fermé automatiquement dès acceptation | Pas de trigger de fermeture | ❌ KO |
| Historisation des étapes | `statusHistory` JSON dans le modèle | ✅ OK |

> 🔧 **ACTION :** Implémenter les triggers : acceptation offre → (1) créer marché, (2) refuser les autres + notifier, (3) fermer l'AO. Workflow atomique dans une transaction.

---

## `AOF-02` / `AOF-03` — Offres

| Exigence spec | Code | Statut |
|---|---|---|
| Vue comparaison des offres | `api.offers.compare()` existe | ✅ OK |
| Badge vérifié + note/avis du pro | Badge absent (`INS-04`), avis non centralisés (`AVS-01`) | ❌ KO |
| Modification/retrait avant acceptation (A9) | CRUD offres implémenté | ✅ OK |
| **Mention d'engagement** au dépôt | Absente de l'UI | ❌ KO |
| @@unique([aoId, supplierId]) | Contrainte en place | ✅ OK |

> 🔧 **ACTION :** (1) Ajouter mention légale « Déposer cette offre vaut engagement » avant soumission. (2) Intégrer badge vérifié et note une fois `INS-04` et `AVS-01` corrigés.

---

# J. MARKETPLACE & ESPACE FOURNISSEUR

## `MKT-01` — Catalogue

| Exigence spec | Code | Statut |
|---|---|---|
| Vendeur = fournisseur uniquement | Vérifié dans les routes | ✅ OK |
| Stock **obligatoire** | Champ stock dans Product | ✅ OK |
| 12 catégories actées | `marketplace.js` : 12 catégories conformes | ✅ OK |
| Prix 0 = « sur devis » | Géré dans l'UI | ✅ OK |
| Blocs promo **conditionnels** (pas si 0 produit) | Blocs affichés même si 0 produit | ❌ KO |
| Compteur quota visible (« 5/5 gratuits ») | Non affiché | ❌ KO |
| Compte à rebours avant dépublication | Non implémenté | ❌ KO |
| Formulaire complet (nom, catégorie, unité, prix, stock, image, sponsoriser, flash) | Implémenté | ✅ OK |

> 🔧 **ACTION :** (1) Conditionner les blocs promo à `products.length > 0`. (2) Afficher le compteur de quota. (3) Implémenter la dépublication avec préavis.

---

## `MKT-02` — Commande et livraison

| Exigence spec | Code | Statut |
|---|---|---|
| Seuil global → Mobile Money / hors plateforme | Non implémenté | ❌ KO |
| Panier et commande | Implémenté | ✅ OK |
| Suivi de commande (4 statuts) | Implémenté (confirmée → transit → livrée) | ✅ OK |
| Stock vérifié avant commande | Vérifié + décrémenté atomiquement (`orders.js:57-70`) | ✅ OK |
| MVP : retrait/livraison au choix fournisseur | Calcul livraison dynamique implémenté | ✅ OK |

---

## `MKT-03` — Espace fournisseur

| Exigence spec | Code | Statut |
|---|---|---|
| 4 sections : Activité, Marketplace, Finance, Compte | Implémenté | ✅ OK |
| Module Paiements | Implémenté | ✅ OK |
| Module Performance | Implémenté | ✅ OK |
| 8 onglets de paramètres | Implémenté et conforme | ✅ OK |

---

## `MKT-04` — Sponsoring

| Exigence spec | Code | Statut |
|---|---|---|
| Marquage « AD » / « Sponsorisé » | Implémenté dans l'UI | ✅ OK |
| Ne pas noyer l'organique | Produits sponsorisés en priorité (`orderBy: sponsored desc`) | ⚠️ PARTIEL |
| Paiement du sponsoring | Non implémenté (dépend `FIN-02`) | ❌ KO |
| Ads uniquement sur la Marketplace | Conforme | ✅ OK |

---

## `MKT-05` — KAi commercial fournisseur

| Exigence spec | Code | Statut |
|---|---|---|
| Alertes de stock (rupture, stock bas) | Non implémenté | ❌ KO |
| Suggestion de vente flash (stock dormant) | Non implémenté | ❌ KO |
| Prédiction des besoins | Non implémenté | ❌ KO |
| Analyse des meilleures ventes | Non implémenté | ❌ KO |

> 🔧 **ACTION :** Développement complet à planifier. KAi existe (`KaiAssistant.jsx`) mais ne couvre pas les fonctions commerciales fournisseur.

---

# K. FONDATIONS TRANSVERSES

## `SYS-01` — Passeport Numérique : N/A (RETIRÉ)

| Exigence spec | Code | Statut |
|---|---|---|
| Module **retiré** (v1.10) | Code encore présent (`Passport.jsx`, modèle Prisma) | ⚠️ À NETTOYER |

> 🔧 **ACTION :** Soit supprimer le code mort, soit le garder commenté pour réactivation future (choix à faire).

---

## `SYS-02` — Matrice de droits

| Exigence spec | Code | Statut |
|---|---|---|
| 5 rôles × 18 objets × 4 actions | `permissionEngine.js` : 9 rôles, 10+ actions | ⚠️ PARTIEL |
| Matrice = source unique des permissions | Définie mais **non appelée** dans la plupart des routes | ❌ KO |
| Rôles internes (Admin, Chef de projet, Collaborateur, Lecteur) | Implémentés dans Settings | ✅ OK |
| Intervenant aveugle sauf messagerie | Défini dans le permission engine | ✅ OK |

> 🔧 **ACTION STRUCTURANTE :** Intégrer `checkPermission()` dans **chaque route** via un middleware Express. Remplacer les vérifications ad-hoc par l'appel centralisé.

---

## `SYS-03` — Mobile responsive

| Exigence spec | Code | Statut |
|---|---|---|
| Toutes les interfaces **pleinement utilisables sur mobile** | Desktop-first, pas repensé pour mobile | ❌ KO |
| Hook `useIsMobile()` | Existe | ✅ OK |
| Tailwind responsive | Disponible mais pas exploité systématiquement | ⚠️ PARTIEL |

> 🔧 **ACTION :** Audit responsive complet + refonte des composants clés (messagerie, suivi chantier, marketplace) pour mobile.

---

## `SYS-04` — Multilingue FR/EN

| Exigence spec | Code | Statut |
|---|---|---|
| i18n obligatoire, aucun texte en dur | i18next configuré mais textes FR hard-codés dans les composants | ❌ KO |
| FR et EN **livrés ensemble** | ~100 clés de traduction, couverture EN incomplète | ❌ KO |
| Sélecteur de langue dans Paramètres | **Absent** de l'onglet Préférences | ❌ KO |
| Détection par navigateur | Implémentée (`i18n.js`) | ✅ OK |

> 🔧 **ACTION :** (1) Extraire tous les textes hard-codés vers les fichiers i18n. (2) Compléter les traductions EN. (3) Ajouter le sélecteur de langue dans les Préférences.

---

## `SYS-05` — Gestion des fichiers

| Exigence spec | Code | Statut |
|---|---|---|
| Formats : JPG, PNG, PDF, Word, Excel | Upload multipart implémenté | ✅ OK |
| Taille maximale par fichier | Pas de validation côté frontend | ❌ KO |
| Versioning | Champ en DB mais non exploité côté UI | ⚠️ PARTIEL |
| Droits (matrice `SYS-02`) | Non vérifié systématiquement | ⚠️ PARTIEL |
| Privé/interne vs partagé | Champ en DB, pas de toggle UI | ⚠️ PARTIEL |
| Rattachement projet/phase/marché | Partiellement implémenté | ⚠️ PARTIEL |

> 🔧 **ACTION :** (1) Ajouter validation taille côté front (ex. 10 Mo max). (2) Ajouter toggle privé/partagé. (3) Exposer l'historique des versions dans l'UI.

---

## `SYS-06` — Paramètres, page pro, aperçu

| Exigence spec | Code | Statut |
|---|---|---|
| Libellés clarifiés (Voir / Modifier / Paramètres) | Anciens libellés encore en place | ❌ KO |
| Séparation nette des périmètres (vitrine vs compte) | Logo/secteurs éditables dans les deux endroits | ❌ KO |
| Onglets conformes par rôle (5/7/8) | Implémentés et conformes | ✅ OK |
| Verrouillage RCCM après vérification | Champs verrouillés côté fournisseur | ✅ OK |
| **2FA** | Absent | ❌ KO |
| **Sessions actives** (voir/révoquer) | Absent | ❌ KO |
| **Sélecteur de langue FR/EN** dans Préférences | Absent | ❌ KO |
| **Réinitialiser toutes les données** → retirer en prod | Encore présent | ❌ KO |
| Nommage « KAI » → « KAi » | Non corrigé | ❌ KO |

> 🔧 **ACTION :** (1) Renommer les libellés. (2) Séparer les périmètres d'édition. (3) Retirer « Réinitialiser toutes les données ». (4) Ajouter 2FA, sessions, sélecteur de langue. (5) Corriger KAI → KAi.

---

# SYNTHÈSE DES ACTIONS PAR PRIORITÉ

## Priorité 1 — Violations de spec / bugs bloquants (11 actions)

| # | Code | Action | Effort |
|---|---|---|---|
| 1 | AVS-03 | Soft-delete + isolation email + blocage si factures impayées | Moyen |
| 2 | MSG-04 | Contrainte DB unique sur binôme + nommage contextuel + fusion doublons | Moyen |
| 3 | QAL-02 | Hook + composant `<CompanyLogo />` centralisé + placeholder unifié | Moyen |
| 4 | INS-06 | Stepper gardé + schéma validation partagé front/back | Moyen |
| 5 | NAV-06 | Modal « session expirée » au lieu de « token manquant » | Faible |
| 6 | PRJ-07 | Aligner phases code (8 archi) sur phases spec (7 construction) | Fort |
| 7 | FIN-01 | Supprimer menu Missions/Contrats/Actifs | Faible |
| 8 | INS-03 | Popup bloquant page pro à la 1ère connexion | Faible |
| 9 | SYS-06 | Retirer « Réinitialiser toutes les données » | Faible |
| 10 | MKT-01 | Blocs promo conditionnels (pas si 0 produit) | Faible |
| 11 | MSG-01 | Persister les messages en attente pour les non-inscrits | Moyen |

## Priorité 2 — Fonctionnalités manquantes (impact business) (8 actions)

| # | Code | Action | Effort |
|---|---|---|---|
| 12 | INS-04 | Badge « Vérifié par MEEREO » complet (dépend INS-01 IA) | Fort |
| 13 | FIN-02 | Intégration Mobile Money | Fort |
| 14 | FIN-03 | Système de facturation (quota, abonnement, sponsoring) | Fort |
| 15 | MSG-05 | Appels audio/vidéo (WebRTC / Twilio) | Fort |
| 16 | MKT-05 | KAi commercial fournisseur (alertes, prédictions, analyse) | Fort |
| 17 | AOF-01 | Triggers automatiques : acceptation → marché + refus + fermeture | Moyen |
| 18 | PRJ-01 | Trigger : validation marché → création auto projet | Moyen |
| 19 | SYS-02 | Intégrer `checkPermission()` dans toutes les routes | Moyen |

## Priorité 3 — Complétude et qualité (12 actions)

| # | Code | Action | Effort |
|---|---|---|---|
| 20 | SYS-04 | Extraire textes hard-codés → i18n + compléter EN + sélecteur langue | Fort |
| 21 | SYS-03 | Audit responsive + refonte mobile des composants clés | Fort |
| 22 | AVS-01 | Source unique avis + supprimer ReviewsEditor + hook centralisé | Moyen |
| 23 | MSG-06 | Optimistic UI + sélection auto nouvelle conversation | Moyen |
| 24 | PRJ-03/04 | WebSocket events pour notes/images + toggle privé/partagé | Moyen |
| 25 | PRJ-06 | Écriture unique équipe (même table) + retrait différencié | Moyen |
| 26 | ANN-05 | Tests cross-browser + corrections Safari | Moyen |
| 27 | QAL-01 | Cache API (React Query/SWR) + lazy loading images | Moyen |
| 28 | INS-05 | Boutons copier/partager l'URL publique | Faible |
| 29 | QAL-03 | Relecture linguistique + uniformiser KAi | Faible |
| 30 | NAV-01-03 | Investigation cause racine session/routing | Moyen |
| 31 | MSG-07 | Vérifier rôle pro dans addParticipant + endpoint removeParticipant | Faible |

---

## COMPTEUR FINAL

| Statut | Nombre d'exigences | % |
|---|---|---|
| ✅ **Conforme** | 14 / 57 | 25% |
| ⚠️ **Partiel** | 25 / 57 | 44% |
| ❌ **Non conforme / absent** | 17 / 57 | 30% |
| N/A (retiré) | 1 / 57 | 1% |

**Taux de conformité globale : ~47%** (conforme + moitié des partiels)

Les fondations techniques sont solides (stack moderne, auth robuste, WebSocket fonctionnel, schéma DB structuré). L'écart principal est le **manque de centralisation** (logo, avis, permissions) et les **fonctionnalités de monétisation** (Mobile Money, facturation) qui ne sont pas encore développées.
