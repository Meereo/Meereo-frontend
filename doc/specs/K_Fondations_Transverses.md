# K. FONDATIONS TRANSVERSES

> Retour au [sommaire](00_INDEX.md)

> **Comblé lors de l'audit v1.2.** Concepts structurants présents dans les captures ou la doctrine, mais sans exigence.

---

## `SYS-01` — Passeport Numérique du projet
**Statut : RETIRÉ (v1.10) — module retiré, fonction reportée, réversible**

> **Décision (23/07/2026) :** le Passeport Numérique est **retiré comme module visible** (écran « mémoire du projet »). L'historisation inaltérable complète qu'il portait est **reportée**, pas définitivement abandonnée.
>
> **Justification (logique produit clarifiée) :** MEEREO distingue deux natures de flux (cf. `FIN-01`/D10 et `FIN-02`) :
> - les **flux intégrés Mobile Money** (KAi Pro, petits achats Marketplace) sont de vraies transactions, **tracées nativement** par le prestataire de paiement — pas besoin du Passeport pour ça ;
> - les **gros paiements de marché** restent **hors plateforme et déclaratifs** tant qu'aucun partenaire bancaire n'est intégré. Tant que MEEREO ne touche pas cet argent, une historisation inaltérable lourde est **prématurée**.
>
> **Réactivation prévue.** Le jour où un **partenaire bancaire** permet aux gros paiements de passer par la plateforme, le Passeport Numérique (ou une historisation inaltérable équivalente) devra être **réactivé** : c'est lui qui fait de MEEREO un « registre de preuve » et qui protège le garde-fou « client passif » (`FIN-01`/D6). Spécification d'origine conservée ci-dessous pour réactivation.
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

> **Commission app stores (choix assumé, réversible).** L'abonnement KAi Pro (`FIN-02`) sera payable **dans l'app**, ce qui expose à la commission Apple/Google (jusqu'à 30 %). **Choix de simplicité acté** au stade actuel. À rouvrir si KAi Pro devient un revenu significatif : basculer le paiement de l'abonnement sur le **web** évite cette commission. *(Note : ceci ne concerne que l'abonnement ; les achats Marketplace en Mobile Money passent par un prestataire tiers, hors périmètre app store.)*

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
- **Données.** Export JSON, suppression de compte (`AVS-03`), gestion de l'abonnement. → **« Réinitialiser toutes les données » est un outil de test : il DOIT être retiré en production.** Cette action efface projets, clients, offres, marchés, commandes, messages, documents, équipe, notifications et paramètres — inacceptable dans une version publique.

> **Cohérence de nom :** l'interface affiche « **KAI** Standard / **KAI** Pro » alors que le nom officiel acté est **KAi**. À corriger partout (`QAL-03`).

### Verrouillage du RCCM après vérification

**Problème :** le N° RCCM est aujourd'hui **librement modifiable**, alors qu'il doit être **unique par entreprise et lié à un seul compte** (`INS-01`) et qu'il conditionne le badge « Vérifié par MEEREO » (`INS-04`). Le modifier librement contournerait l'unicité et rendrait la vérification caduque.

**Décision :** une fois le RCCM **vérifié**, il est **verrouillé**. Toute modification passe par une **demande à l'administrateur MEEREO**, qui vérifie et applique le changement. Avant vérification, le champ reste modifiable par le titulaire, sous contrôle d'unicité et de format (`INS-01`).

### Règle de propagation

Toute donnée modifiée (Paramètres ou page pro) se **répercute immédiatement partout** où elle apparaît : logo dans les listes et la page publique (`QAL-02`), nom et secteurs dans l'annuaire (`ANN-*`), coordonnées sur la page publique (`INS-03`), langue dans toute l'interface (`SYS-04`). **Aucune double saisie, aucune donnée dupliquée.**

> **Dépendances :** `INS-01` (RCCM/contribuable), `INS-02` (logo), `INS-03` (page publique), `INS-04` (badge), `PRJ-06` (équipe), `AVS-02` (notifications), `AVS-03` (suppression), `FIN-02`/`FIN-03` (abonnement), `MKT-02`/`MKT-05` (boutique), `SYS-02` (droits), `SYS-04` (langue), `QAL-02` (propagation).
