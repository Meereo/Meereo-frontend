# MEEREO — ONBOARDING : DOSSIER D'INTÉGRATION COMPLET

**27 juillet 2026** · Référentiel `MEEREO_Specifications_v1.52.md` · Code `MEEREO-onboarding-v2-plateforme-teste.zip`

> **Il n'y a plus de MVP.** Ce dossier couvre l'onboarding de la **plateforme complète** : les trois
> rôles, tous les flux, toutes les fonctions, et le code prêt à intégrer.

---

## CIBLE TECHNIQUE — confirmée par MEEREO le 27/07/2026

| Élément | Décision | Conséquence sur le code livré |
|---|---|---|
| **Front** | **React**, API séparée | Le paquet précédent supposait Next.js App Router. **Entièrement restructuré** |
| **API** | **Express** | Routeur autonome ; le métier n'en dépend pas |
| **Base** | **PostgreSQL + Prisma** | Les migrations manuelles fonctionnent telles quelles |
| **Authentification** | **🔴 à vérifier** | Isolée derrière un port. **Un seul fichier à écrire** |
| **E-mails** | **Rien en place** | Implémentation de développement qui journalise. **À brancher avant production** |
| **Fichiers** | **Système de fichiers du serveur** | Adaptateur local livré, limites 10 / 50 Mo |

---

## LES DOUZE ARBITRAGES

| # | Point | Décision |
|---|---|---|
| 1 | Adresse e-mail des comptes liés | **Partagée** — unicité sur `(e-mail, rôle)` parmi les comptes actifs |
| 2 | Identité légale | Portée par une entité **`Company`**, retirée des profils |
| 3 | Cumul de rôles | **Deux comptes liés**, avec sélecteur de bascule |
| 4 | Doublons de RCCM existants | **Tous suspendus**, y compris le plus ancien |
| 5 | « Sur devis » | **Mode de prix explicite** — le zéro disparaît |
| 6 | Monogramme | **Calculé à l'affichage**, jamais stocké |
| 7 | Correction d'adresse | **Bandeau dans l'espace connecté** |
| 8 | Vérification du téléphone | **Aucune** — saisie simple, pas de SMS |
| 9 | Premier produit du fournisseur | **Facultatif, sans contrainte** |
| 10 | Page publique | **Créée en brouillon**, publication manuelle |
| 11 | Étape « projet » du client | **Supprimée** — *« elle ne crée aucune action »* |
| 12 | Justificatifs RCCM | **Après l'inscription**, depuis l'espace |

---

## 🔴 TROIS CONSÉQUENCES QUE CES DÉCISIONS ENTRAÎNENT

**Je les signale parce qu'aucune n'a été demandée, et que les trois changent quelque chose.**

### 1. La recommandation KAi de fin de parcours client disparaît

L'étape « projet » supprimée, **`INS-16` n'a plus aucune donnée d'entrée** : type de projet, surface,
lieu, budget étaient sa seule matière.

> **Deux issues, une seule acceptable.** Soit on la remplit de valeurs par défaut — ce que `INS-16`
> **interdit précisément** —, soit on la retire. **Elle est retirée du parcours.** *Une recommandation
> fondée sur rien n'est pas une recommandation : c'est une affirmation inventée présentée comme un
> conseil.*

### 2. Un professionnel qui ne publie jamais sa page reste invisible

La page en brouillon protège de `INS-17` — plus aucune page « Votre Entreprise » servie en production.
**Mais elle crée un état intermédiaire qui n'existait pas :** inscrit, actif, et **absent de
l'annuaire**.

> **Il faut donc une relance**, faute de quoi le professionnel conclura que la plateforme ne lui
> apporte rien — sans jamais comprendre qu'il n'y figure pas. *Le paquet expose déjà
> `assessPro()` / `assessSupplier()`, qui disent ce qui manque pour publier.*

### 3. Le badge « Vérifié par MEEREO » exige un back-office qui n'existe pas

Les justificatifs déposés **après** l'inscription doivent être **examinés et validés**. Le référentiel
décrit le badge *(`INS-04`)* et constate qu'il s'affiche sans document *(`INS-17`)*, **mais ne décrit
nulle part le circuit de validation** : qui regarde, selon quels critères, en combien de temps, et ce
qui se passe en cas de refus.

> **Sans ce circuit, le badge restera décoratif — le défaut aura simplement changé de forme.**
> **À spécifier avant de développer le dépôt de documents.**

---

# PARTIE I — LES TROIS PARCOURS

**Le fil d'étapes est dérivé du rôle** *(`INS-15`)*, jamais écrit en dur. Le prototype affichait cinq
points pour les trois rôles ; ils n'ont ni le même nombre ni les mêmes étapes.

## Client — 2 étapes

```
1. Rôle          → choix parmi Client / Professionnel / Fournisseur
2. Compte        → prénom, nom, e-mail, téléphone, ville (facultative), mot de passe, CGU
   ▸ Terminé     → session ouverte + bandeau de vérification d'adresse
```

## Professionnel — 4 étapes

```
1. Rôle
2. Compte        → ville OBLIGATOIRE
3. Entreprise    → raison sociale, RCCM, n° contribuable, secteurs d'activité (≥ 1)
4. Logo          → FRANCHISSABLE, aucun repli stocké
   ▸ Terminé     → page publique créée EN BROUILLON
```

## Fournisseur — 6 étapes

```
1. Rôle
2. Compte        → ville OBLIGATOIRE
3. Entreprise    → identité + catégories vendues, modes et zones de livraison, délai
4. Logo          → FRANCHISSABLE
5. Encaissement  → OBLIGATOIRE — opérateur, numéro MOBILE, titulaire
6. Premier produit → FACULTATIF
   ▸ Terminé     → page publique EN BROUILLON + avertissement si catalogue vide
```

> **L'étape 5 est ce qui distingue un fournisseur opérationnel d'un fournisseur inutile.**
> `MKT-06 §4` : MEEREO n'encaisse pas à sa place. Sans moyen de réception, **il termine son inscription
> sans pouvoir vendre, et aucun rattrapage n'est possible côté plateforme.**

## Règles communes aux trois parcours

| Règle | Code | Traduction dans le code |
|---|---|---|
| **La marche avant est gardée** — impossible d'atteindre l'étape N+1 sans valider N | `INS-06` | `canGoTo()` vérifie **toutes** les étapes obligatoires antérieures |
| **La marche arrière est libre et ne perd rien** | `INS-06` | `goBack()` ne touche pas à `state.data` |
| **Le bouton est dérivé du schéma**, jamais posé | `INS-06` | `useStepForm().isValid` — le défaut d'origine était un `onclick` sans condition |
| **Changer de rôle conserve le compte** | `INS-14` | `setRole()` garde les étapes communes, écarte les autres |
| **Le brouillon vit sur le serveur, 30 jours** | `INS-13` | `saveDraft()` à chaque étape ; **jamais de mot de passe** |
| **Une erreur ramène à son étape** | `INS-06` | Les erreurs portent `(step, field)` — sans quoi elles sont une impasse |

---

# PARTIE II — MODÈLE DE DONNÉES

## Le déplacement structurant

**Avant**, `rccm @unique` était posé **séparément** sur `ProProfile` et `SupplierProfile`. Deux défauts
opposés en découlaient : une entreprise **ne pouvait pas** ouvrir les deux profils, et le même RCCM
**pouvait exister une fois dans chaque table**, sur deux comptes différents.

> **C'est le déplacement de l'identité légale vers `Company`, et lui seul, qui réconcilie les deux
> exigences.** Tant que l'unicité portait sur le profil, **autoriser le cumul revenait mécaniquement à
> autoriser les doublons.**

```prisma
model Company {
  id        String @id @default(uuid())
  legalName String
  rccm  String @unique      // ← NE JAMAIS retirer : leur absence EST le défaut INS-20
  taxId String @unique
  accounts  Account[]
}

model Account {
  companyId String?          // null pour un CLIENT
  company   Company? @relation(fields: [companyId], references: [id])
  suspendedAt      DateTime? // INS-20 — distinct de deletedAt
  suspensionReason String?
  @@unique([companyId, role])   // une entreprise = au plus un compte par rôle
}
```

> **⚠️ `@@unique([companyId, role])` ne s'applique pas aux clients**, dont `companyId` est `null` :
> en SQL, `NULL` n'est jamais égal à `NULL`. **C'est voulu. Ne le « corrigez » pas.**

## `AccountLink` — le sélecteur d'activité

> **⚠️ Contrainte de sécurité, la plus importante de ce dossier.** Un sélecteur qui fait passer d'un
> compte à l'autre est **techniquement une élévation de privilèges**. Si le lien se déduisait d'une
> égalité de RCCM, **toute personne créant un compte avec le RCCM d'une entreprise obtiendrait l'accès
> au compte existant** — **`INS-20` deviendrait une prise de contrôle.**
>
> **Le lien ne naît que d'une action authentifiée** : « Ajouter une activité », depuis l'espace du
> premier compte. **Deux comptes préexistants au même RCCM ne sont jamais liés automatiquement.**
> *Le service le refuse explicitement, avec le message qui indique la marche à suivre.*

## Les trois migrations que Prisma ne sait pas exprimer

```sql
-- 1) Unicité (e-mail, rôle) sur les comptes ACTIFS uniquement.
--    • partielle : sinon la réutilisation d'adresse d'AVS-03 devient impossible
--    • par rôle  : une adresse peut porter un compte PRO ET un compte FOURNISSEUR
CREATE UNIQUE INDEX account_email_role_active_key
  ON "Account"(lower(email), role) WHERE "deletedAt" IS NULL;

-- 2) Un produit a SOIT un prix ferme > 0, SOIT le mode « sur devis » sans prix.
ALTER TABLE "Product" ADD CONSTRAINT product_pricing_coherent CHECK (
     ("pricingMode" = 'FIXED'    AND "priceFcfa" IS NOT NULL AND "priceFcfa" > 0)
  OR ("pricingMode" = 'ON_QUOTE' AND "priceFcfa" IS NULL));

-- 3) Une suspension sans motif est illisible.
ALTER TABLE "Account" ADD CONSTRAINT account_suspension_reason_required CHECK (
  ("suspendedAt" IS NULL) OR ("suspensionReason" IS NOT NULL));
```

> **Pourquoi en base et pas seulement dans Zod.** La validation applicative protège la saisie ; elle ne
> protège ni un import, ni un script de reprise, ni une écriture directe. **`FIN-04` est né d'un
> montant absent devenu `0`, puis propagé sur six écrans.**

---

# PARTIE III — INVENTAIRE DES FONCTIONS

**33 fichiers, 4 couches.** Le noyau ne connaît ni Express, ni Prisma, ni React — c'est ce qui permet
de jouer les trois parcours complets en mémoire, et de changer d'authentification sans toucher au métier.

## `src/core/` — métier pur *(dépend uniquement de `zod`)*

| Fichier | Fonctions exportées | Rôle |
|---|---|---|
| `reference-data.ts` | `PRO_SECTORS` · `MARKETPLACE_CATEGORIES` · `SALE_UNITS` · `PAYOUT_PROVIDERS` · `DELIVERY_MODES` | Listes fermées, **source unique**. Une liste recopiée ailleurs est une seconde source de vérité |
| `password-policy.ts` | `PASSWORD_POLICY` · `checkPassword()` · `PASSWORD_HINT` | **10 caractères, une lettre, un chiffre.** Lue par l'inscription **et** la réinitialisation — c'est ce qui corrige l'incohérence d'`INS-07` |
| `phone-ci.ts` | `normalizeCiPhone()` · `isMobileCi()` | E.164. **Volontairement permissif** : les préfixes n'ont pas pu être confirmés auprès de l'ARTCI, et un préfixe manquant bloquerait des inscriptions légitimes |
| `schemas.ts` | `makeAccountSchema(role)` · `companySchema` · `proStructureSchema` · `supplierStructureSchema` · `productSchema` · `payoutMethodSchema` · `logoSchema` · `validate()` · `collectErrors()` · `isStepValid()` | **Source unique de validation, front et API** |
| `steps.ts` | `PATHS` · `stepsOf()` · `inputStepsOf()` · `stepDef()` · `stepIndex()` | Les trois parcours. **2 / 4 / 6 étapes** |
| `machine.ts` | `initialState()` · `setRole()` · `setStepData()` · `advance()` · `goBack()` · `canGoTo()` · `isStepSatisfied()` · `stepper()` · `isComplete()` | Garde de progression et retour arrière |
| `service.ts` | `createOnboardingService()` → `checkEmailAvailability()` · `validateAll()` · `submit()` · `saveDraft()` · `resumeDraft()` · `purgeExpiredDrafts()` · `stripSecrets()` | Le cœur. **Testable sans base** |
| `ports.ts` | `AccountsPort` · `CompaniesPort` · `DraftsPort` · `OnboardingTxPort` · `PasswordPort` · `MailPort` · `SessionPort` · `StoragePort` · `RateLimitPort` · `Clock` | Tout ce que le noyau attend du dehors |
| `errors.ts` | `OnboardingError` · `issue()` | Erreurs portant **`(étape, champ)`** |
| `publish-guard.ts` | `assessPro()` · `assessSupplier()` · `completionMessage()` | Ce qui manque pour vendre et pour publier |

## `src/api/` — Express

| Route | Méthode | Effet |
|---|---|---|
| `/api/onboarding/steps/:role` | `GET` | **Le fil est servi par l'API**, jamais écrit en dur côté front |
| `/api/onboarding/email-available` | `POST` | Disponibilité par `(adresse, rôle)`. **Réponse volontairement pauvre** : on ne révèle jamais qui possède une adresse |
| `/api/onboarding/draft` | `POST` | Enregistre le brouillon. `stripSecrets` retire tout mot de passe |
| `/api/onboarding/draft/:id` | `GET` | Reprise. **410** si expiré |
| `/api/onboarding/validate` | `POST` | Revalide côté serveur sans rien écrire |
| `/api/onboarding/submit` | `POST` | Crée le compte **et ouvre la session dans la même réponse** *(`NAV-07`)* |
| `/api/onboarding/logo` | `POST` | Dépôt facultatif. **413** si trop volumineux |

**Codes HTTP :** `422` validation · `409` unicité · `410` brouillon expiré · `429` débit · `201` créé.

## `src/adapters/`

| Fichier | Ce qu'il fait | Réserve |
|---|---|---|
| `in-memory.ts` | Fausse base complète | Sert aux 43 tests |
| `storage/local-fs.ts` | Écriture disque, **10 Mo / 50 Mo pour les plans** | ⚠️ **Ne survit pas à un redéploiement sur conteneur** et ne se partage pas entre instances |
| `mail/dev-logger.ts` | Journalise au lieu d'envoyer | 🔴 **Sans envoi réel, `INS-09` n'est pas fermé** — prévoir SPF et DKIM |
| `ratelimit/memory.ts` | Compteur anti-énumération | ⚠️ **Mono-processus** : avec N instances, la limite réelle est multipliée par N |
| `prisma/README-contrats.md` | Les **6 contrats** à implémenter, avec le SQL attendu | — |

## `src/web/` — React

`OnboardingFlow` *(orchestrateur)* · `Stepper` · `RoleStep` · `AccountStep` · `ProStructureStep` ·
`SupplierStructureStep` · `LogoStep` · `SupplierPayoutStep` · `SupplierProductStep` · `DoneStep` ·
`Field` · `Chips` · `useStepForm` · `api-client`.

> **`useStepForm` est le point à ne pas contourner.** Il expose `isValid`, dérivé du schéma. **Le bouton
> lit cela et rien d'autre.** Le défaut d'origine d'`INS-06` était un `onclick="afterAccount()"` sans
> aucune condition.

---

# PARTIE IV — LES 43 TESTS

```
npm install && npm test     # typecheck strict + 43 tests, 0 échec
```

| Suite | Nombre | Ce qu'elle prouve |
|---|---|---|
| `schemas.test.ts` | 12 | Une exigence, un test : mot de passe, téléphone, ville par rôle, CGU, RCCM, secteurs, prix |
| `machine.test.ts` | 8 | Garde de progression, retour sans perte, fil dérivé, changement de rôle |
| `service.e2e.test.ts` | 19 | **Les trois parcours complets**, unicité, cumul, brouillon, échec d'e-mail |
| `guard.test.ts` | 4 | Règles de publication et limites de taille |

**Les tests qui gardent les décisions les plus fragiles :**

| Test | Ce qu'il empêche de casser |
|---|---|
| `FIN-04 — un prix ferme à 0 est refusé` | Le retour du zéro comme « sur devis » |
| `INS-20 — le même RCCM ne peut pas créer une seconde entreprise` | La réouverture de la faille d'usurpation |
| `un second rôle ne se crée PAS depuis l'inscription publique` | La transformation d'`INS-20` en prise de contrôle |
| `la même adresse peut porter deux rôles, jamais deux fois le même` | La perte de la décision du 27/07 |
| `un échec d'envoi n'annule PAS la création du compte` | Le blocage d'un compte par une panne SMTP |
| `jamais de mot de passe dans un brouillon` | Une fuite par la table des brouillons |
| `le brouillon est supprimé dans la MÊME transaction` | Un brouillon orphelin reproposant une inscription faite |
| `INS-12 — aucun asset stocké sans logo` | Le retour de la seconde source de vérité de `QAL-02` |

---

# PARTIE V — ORDRE D'INTÉGRATION

| # | Action | Pourquoi cet ordre |
|---|---|---|
| **1** | **`002_rccm_doublons.sql`** — auditer, transmettre la liste, **suspendre** | ⚠️ **Un `UNIQUE` posé sur une colonne contenant des doublons fait échouer la migration.** Rien ne peut passer avant |
| **2** | Fusionner `schema.prisma`, puis `prisma migrate deploy` | — |
| **3** | **`001_meereo_onboarding.sql`** — les trois contraintes | Ce que Prisma ne sait pas exprimer |
| **4** | Implémenter les **6 contrats** Prisma | Seul endroit qui touche la base |
| **5** | Monter le routeur Express | `server.example.ts` montre les cinq branchements |
| **6** | Brancher `OnboardingFlow` | — |
| **7** | Écrire `SessionPort` | 🔴 **Dès que l'authentification est arrêtée** |
| **8** | Brancher un service d'e-mail réel | 🔴 **Avant production** |

---

# PARTIE VI — PIÈGES À ÉVITER

| Piège | Pourquoi il est tentant | Ce qu'il coûte |
|---|---|---|
| **Retirer un `@unique` pour faire passer une migration** | Elle échoue sur des doublons | **C'est l'origine exacte d'`INS-20`.** Traiter les doublons, jamais la contrainte |
| **Écrire `0` dans `priceFcfa` pour un produit sur devis** | Le champ est numérique, `null` semble « sale » | **`FIN-04`** — un zéro se propage et redevient un montant |
| **Lier deux comptes sur la seule égalité de RCCM** | Semble être le sens de « comptes liés » | **Prise de contrôle de compte** |
| **Stocker le monogramme comme logo par défaut** | Simplifie e-mails et exports | **Seconde source de vérité — `QAL-02`, à nouveau** |
| **Utiliser `deletedAt` pour suspendre** | Le champ existe déjà | **Libère l'adresse** d'un compte simplement suspendu |
| **Sortir la suppression du brouillon de la transaction** | Plus simple à écrire | Brouillon orphelin reproposant une inscription déjà faite |
| **Faire dépendre un effet React d'un objet d'erreurs** | Cela paraît naturel | **Défaut déjà rencontré :** l'objet est recréé à chaque rendu, l'effet boucle, le bouton reste désactivé — **parcours inutilisable alors que toutes les règles sont correctes** |
| **Compléter un champ manquant par une valeur plausible** | L'écran est plus joli | Produit un écran **faux mais crédible**, le pire des deux mondes |

> **Règle générale dont tous ces pièges découlent : une donnée absente doit rester absente et se voir.**
> Un écran qui refuse de s'afficher se corrige ; un écran qui affiche autre chose ne se remarque pas.

---

# PARTIE VII — CE QUI RESTE OUVERT

| Point | Nature | Effet s'il n'est pas traité |
|---|---|---|
| **Authentification** | Décision technique MEEREO | `SessionPort` reste vide — **l'inscription ne connecte personne** |
| **Service d'e-mail** | Choix de prestataire | **Aucune adresse jamais vérifiée** ; `INS-09` non fermé ; notifications de suspension muettes |
| **Compteur de débit partagé** | Infrastructure | Limite anti-énumération multipliée par le nombre d'instances |
| **Circuit de validation des justificatifs** | **Spécification manquante** | **Le badge « Vérifié » restera décoratif** — le défaut aura changé de forme |
| **Relance de publication de page** | Conception | Des professionnels inscrits, actifs et **invisibles à l'annuaire** |
| **Stockage disque** | Infrastructure | **Les fichiers disparaissent** au redéploiement sur conteneur |

---

## Ce que ce paquet ferme

**`INS-20`** *(usurpation d'identité d'entreprise)* · **`INS-06`** *(validation par étape et sortie
d'impasse)* · **`INS-08`** *(téléphone et ville)* · **`INS-11`** *(secteurs enfin enregistrés)* ·
**`INS-13`** *(brouillon serveur, 30 jours)* · **`INS-12`** *(logo franchissable, aucun repli stocké)* ·
**`INS-14`** *(cumul de rôles)* · **`MKT-06`** *(fournisseur opérationnel)* · **`FIN-04`** *(le zéro ne
signifie plus « sur devis »)* · **`NAV-07`** *(session ouverte sans rupture — sous réserve de
`SessionPort`)*.

**`INS-09`** reste ouvert tant qu'aucun e-mail ne part réellement.

---

*Le détail de chaque code figure dans `MEEREO_Fiches_Dev/`.*
*Toute décision nouvelle doit être portée au référentiel, jamais à ce seul dossier.*
