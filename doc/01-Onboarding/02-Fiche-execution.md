# FICHE D'EXÉCUTION — Onboarding : mise à niveau v1.30 → v1.52

**Type :** fiche d'exécution *(destinée à être suivie pas à pas, y compris par un agent)*
**Codes concernés :** `INS-01` `INS-09` `INS-12` `INS-14` `INS-20` `MKT-01` `MKT-06` `MKT-07` `SYS-06` `FIN-04`
**Priorité :** **P0** *(contient la correction de la faille `INS-20`)*
**Source :** `MEEREO_Specifications_v1.52.md` · **Code de départ :** `MEEREO-onboarding-code-P1-P2-v2-teste.zip`

---

## 0. À LIRE AVANT TOUTE MODIFICATION

**Ce que ce document est.** Le code d'onboarding livré a été écrit sur la **v1.30** du référentiel.
Vingt-et-une versions ont suivi. **Trois écarts sont devenus des défauts**, et cinq décisions
postérieures ne sont pas couvertes. Cette fiche les corrige.

**Trois règles qui s'appliquent à toute cette fiche :**

1. **Le référentiel fait foi, pas cette fiche.** En cas de divergence, `MEEREO_Specifications_v1.52.md`
   l'emporte et la fiche doit être corrigée.
2. **`dev.meereo.com` fait foi pour établir un défaut.** Si un constat ci-dessous ne correspond pas à ce
   que vous observez, **ne codez pas** : signalez l'écart.
3. **Ne relâchez jamais une contrainte pour faire passer un test.** Si un test échoue après un
   changement de schéma, c'est le test ou le code applicatif qu'il faut reprendre — **pas la
   contrainte**. C'est exactement l'enchaînement qui a produit `INS-20`.

> **⚠️ Si vous êtes un agent :** n'improvisez aucune valeur, aucun nom de champ, aucun libellé qui ne
> figure pas ici. Là où cette fiche dit **« à faire trancher »**, arrêtez-vous et demandez — ne
> choisissez pas d'option par défaut. Les décisions par défaut sont ce qui a créé la dette actuelle.

---

## 1. 🔴 POINT BLOQUANT À TRANCHER AVANT DE CODER

**Une conséquence de la décision « deux comptes liés » n'a pas encore été arbitrée, et elle bloque
l'étape 5.**

`INS-09` impose l'**unicité de l'adresse e-mail sur les comptes actifs**. La décision retenue crée
**deux comptes** pour une entreprise à deux rôles. **Ces deux comptes ne peuvent donc pas partager la
même adresse e-mail** — le dirigeant devrait en fournir une seconde.

| Option | Conséquence |
|---|---|
| **A — Deux adresses distinctes obligatoires** | Aucun changement de contrainte. Mais on exige une seconde boîte mail d'un dirigeant qui n'en a souvent qu'une, **au moment précis où il ajoute une activité** — friction maximale au pire endroit. |
| **B — Adresse partagée entre comptes liés** | L'unicité devient `UNIQUE(email, role)` sur les comptes actifs. Une adresse peut porter un compte PRO **et** un compte FOURNISSEUR, jamais deux du même rôle. **Impose de revoir la connexion** : à quel compte connecte-t-on ? |
| **C — L'entreprise porte l'identifiant** | La connexion se fait sur l'entreprise, puis on choisit l'activité. **Cohérent avec le sélecteur**, mais c'est une refonte de l'authentification, hors périmètre de cette fiche. |

**Aucune de ces options n'est retenue à ce jour. Ne codez pas l'étape 5 avant la réponse de MEEREO.**
Les étapes 1 à 4 et 6 à 8 ne dépendent pas de cet arbitrage et peuvent être réalisées immédiatement.

---

## 2. LES HUIT DÉCISIONS À IMPLÉMENTER

| # | Décision | Étape |
|---|---|---|
| 1 | **Table `Company`** portant RCCM et n° contribuable, unique sur toute la plateforme | 1 |
| 2 | **Deux comptes liés** à une même entreprise, avec sélecteur de bascule | 5 |
| 3 | **Mode de prix explicite** — le zéro cesse de signifier « sur devis » | 3 |
| 4 | **Suspension de tous les comptes en doublon de RCCM**, y compris le premier | 4 |
| 5 | **Monogramme calculé à l'affichage**, jamais stocké | 6 |
| 6 | **Correction de l'e-mail depuis l'espace connecté** | 7 |
| 7 | **Lexique** — *Professionnel* / *Intervenant* ; « Prestataire » et « Entreprise » proscrits comme rôles | 8 |
| 8 | **Migration SQL** de l'index partiel d'unicité d'e-mail | 2 |

---

## 3. SÉQUENCE D'EXÉCUTION

**Respectez l'ordre.** Chaque étape suppose la précédente.

---

### Étape 1 — Schéma : extraire l'identité d'entreprise

**Fichier :** `prisma/schema.prisma`

**Problème corrigé.** Le schéma actuel pose `rccm String @unique` **séparément** sur `ProProfile` et
sur `SupplierProfile`. Cela produit **deux défauts opposés** :

- une même entreprise **ne peut pas** ouvrir les deux profils — le cumul est pourtant autorisé ;
- le même RCCM **peut exister une fois dans chaque table**, sur deux comptes différents — c'est
  précisément la faille `INS-20`.

**À faire.** Créer le modèle `Company`, **retirer** `rccm` et `taxId` des deux profils, rattacher les
comptes à l'entreprise.

```prisma
/// INS-01 / INS-20 — L'IDENTITÉ LÉGALE EST PORTÉE PAR L'ENTREPRISE, PAS PAR LE COMPTE.
/// C'est ce déplacement qui rend le cumul possible (INS-14) SANS rouvrir INS-20.
model Company {
  id        String  @id @default(uuid())
  legalName String

  /// Unicité stricte sur toute la plateforme. NE JAMAIS retirer ces contraintes :
  /// leur absence est le défaut INS-20 (usurpation d'identité d'entreprise).
  rccm  String @unique
  taxId String @unique

  createdAt DateTime @default(now())
  accounts  Account[]

  @@index([legalName])
}
```

**Modifier `Account`** — ajouter le rattachement et les champs de suspension :

```prisma
model Account {
  // … champs existants inchangés …

  /// null pour un compte CLIENT : un particulier n'a pas d'entreprise.
  companyId String?
  company   Company? @relation(fields: [companyId], references: [id])

  /// INS-20 — suspension administrative (voir étape 4). Distinct de deletedAt :
  /// un compte suspendu existe toujours et peut être rétabli.
  suspendedAt     DateTime?
  suspensionReason String?

  /// Une entreprise ne peut avoir qu'UN compte par rôle.
  /// Cette contrainte remplace, en mieux, les @unique retirés des profils.
  @@unique([companyId, role])
}
```

**Retirer de `ProProfile` et de `SupplierProfile`** les lignes suivantes, **et elles seules** :

```prisma
  rccm  String @unique   // ← SUPPRIMER (déplacé dans Company)
  taxId String @unique   // ← SUPPRIMER (déplacé dans Company)
```

> **⚠️ Piège.** `@@unique([companyId, role])` **ne s'applique pas** aux comptes CLIENT, dont `companyId`
> est `null` — en SQL, `NULL` n'est jamais égal à `NULL`, donc les clients ne se gênent pas entre eux.
> **C'est le comportement voulu.** Ne le « corrigez » pas.

**Vérification :** `npx prisma validate` puis `npx prisma generate` passent sans erreur.

---

### Étape 2 — Migrations SQL

**Deux migrations manuelles.** Prisma ne sait exprimer ni l'une ni l'autre.

```sql
-- 1) INS-09 / AVS-03 — unicité de l'e-mail sur les comptes ACTIFS uniquement.
--    Sans cette forme partielle, la réutilisation d'adresse après suppression,
--    pourtant autorisée par AVS-03, deviendrait impossible.
CREATE UNIQUE INDEX IF NOT EXISTS account_email_active_key
  ON "Account"(lower(email)) WHERE "deletedAt" IS NULL;

-- 2) FIN-04 / MKT-01 — un produit a soit un prix ferme strictement positif,
--    soit le mode « sur devis » et AUCUN prix. Jamais les deux, jamais ni l'un ni l'autre.
ALTER TABLE "Product" ADD CONSTRAINT product_pricing_coherent CHECK (
     ("pricingMode" = 'FIXED'    AND "priceFcfa" IS NOT NULL AND "priceFcfa" > 0)
  OR ("pricingMode" = 'ON_QUOTE' AND "priceFcfa" IS NULL)
);
```

> **Pourquoi une contrainte en base et pas seulement dans Zod.** La validation applicative protège la
> saisie ; elle ne protège pas un import, un script de reprise ou une écriture directe. **`FIN-04` est
> né d'un montant absent devenu `0` puis propagé sur six écrans.** Une contrainte en base est le seul
> endroit où cela ne peut pas se reproduire.

**Vérification :** exécuter les deux migrations sur une base de test, puis tenter
`INSERT INTO "Product" (..., "pricingMode", "priceFcfa") VALUES (..., 'FIXED', 0);` → **doit échouer**.

---

### Étape 3 — Le prix « sur devis » devient un état, plus un zéro

**Fichiers :** `prisma/schema.prisma` · `src/lib/onboarding/schemas.ts` ·
`src/components/onboarding/SupplierProductStep.tsx`

**Problème corrigé.** Le code pose aujourd'hui :

```ts
export const PRICE_ON_QUOTE = 0;
export const isOnQuote = (priceFcfa: number) => priceFcfa === PRICE_ON_QUOTE;
```

**C'est le motif exact que `FIN-04` impute à la chaîne financière rompue.** Un écran en aval ne peut pas
distinguer *« sur devis »*, *« gratuit »* et *« non renseigné »* — les trois valent `0`.

**Prisma :**

```prisma
enum PricingMode {
  FIXED     // prix ferme, priceFcfa obligatoire et > 0
  ON_QUOTE  // sur devis, priceFcfa NULL — voir MKT-07 (objet Demande de devis)
}

model Product {
  // … champs existants …
  pricingMode PricingMode @default(FIXED)
  priceFcfa   Int?        // ← devient nullable ; ne JAMAIS y écrire 0
}
```

**Zod — remplacer la règle de prix par un refinement croisé :**

```ts
export const productSchema = z.object({
  // … champs existants …
  pricingMode: z.enum(['FIXED', 'ON_QUOTE']),
  priceFcfa: z.number().int().positive().nullable(),
}).refine(
  v => v.pricingMode === 'ON_QUOTE' ? v.priceFcfa === null : v.priceFcfa !== null,
  { path: ['priceFcfa'], message: 'Indiquez un prix, ou choisissez « Sur devis ».' },
);
```

**Supprimer entièrement** `PRICE_ON_QUOTE` et `isOnQuote`, et **toutes leurs utilisations**.

> **⚠️ Ne conservez pas `isOnQuote` en le réécrivant sur `pricingMode`.** Tant que la fonction existe,
> un développeur pressé la rappellera sur un prix numérique. **Le nom doit disparaître pour que
> l'ancien raisonnement disparaisse.**

**Interface :** le formulaire produit propose un choix explicite **« Prix ferme » / « Sur devis »**. Le
champ prix est **masqué**, non pas grisé, en mode « Sur devis ».

**Vérification :** un produit « Sur devis » enregistré puis relu a `priceFcfa === null` et
`pricingMode === 'ON_QUOTE'`. Aucun `0` en base.

---

### Étape 4 — Traiter les doublons de RCCM déjà en production

**⚠️ À faire AVANT de poser les contraintes de l'étape 1 sur la base de production.** Un `@unique` posé
sur une colonne contenant des doublons **échoue** : la migration ne passera pas.

**Décision MEEREO du 27/07/2026 : tous les comptes partageant un RCCM sont suspendus, y compris le plus
ancien**, jusqu'à vérification des documents.

> **Pourquoi le premier arrivé n'est pas épargné.** Le RCCM est un identifiant **public** : rien ne dit
> que le compte le plus ancien est le légitime. **L'antériorité ne prouve rien** — l'usurpateur peut
> avoir été le plus rapide. Suspendre tout le monde est brutal pour les utilisateurs de bonne foi, mais
> c'est la seule option qui ne valide pas une usurpation par défaut.

**4.1 — Audit, sans rien modifier :**

```sql
SELECT rccm, COUNT(*) AS n, array_agg(id) AS profile_ids
FROM (
  SELECT rccm, id FROM "ProProfile"
  UNION ALL
  SELECT rccm, id FROM "SupplierProfile"
) x
GROUP BY rccm HAVING COUNT(*) > 1;
```

**Produire la liste et la transmettre à MEEREO avant l'étape 4.2.** *Le nombre de comptes concernés
n'est pas connu à ce jour ; il conditionne l'ampleur du traitement de support à prévoir.*

**4.2 — Suspension :**

```sql
UPDATE "Account" a SET "suspendedAt" = now(),
       "suspensionReason" = 'RCCM en doublon — vérification des documents requise (INS-20)'
WHERE a.id IN ( /* comptes issus de la requête 4.1 */ );
```

**4.3 — Effets d'une suspension, à implémenter :**

- la connexion est **refusée**, avec un message expliquant la raison **et la marche à suivre** ;
- la **page publique** du compte est retirée de l'annuaire et des résultats de recherche ;
- les **projets et conversations en cours sont conservés** — une suspension n'est pas une suppression ;
- une **notification** est envoyée à l'adresse du compte.

> **⚠️ Un compte suspendu n'est pas un compte supprimé.** N'utilisez pas `deletedAt` : ce champ signifie
> autre chose *(`AVS-03` — réutilisation de l'e-mail)*. Les confondre libérerait l'adresse d'un compte
> simplement suspendu.

**Vérification :** après 4.2, la requête 4.1 sur les comptes **non suspendus** ne renvoie aucune ligne.
Les migrations de l'étape 1 passent alors.

---

### Étape 5 — Comptes liés et sélecteur d'activité

> **🔴 NE PAS COMMENCER avant l'arbitrage du §1 sur l'adresse e-mail.**

**Ce qui est décidé :** une entreprise à deux rôles a **deux comptes rattachés à la même `Company`**, et
l'utilisateur **bascule de l'un à l'autre sans se reconnecter**.

**Contrainte de sécurité impérative — dérivée, à valider par MEEREO.**

> Un sélecteur qui permet de passer d'un compte à un autre est, techniquement, **une élévation de
> privilèges**. Si le lien se déduisait du seul partage d'un RCCM, **toute personne créant un compte
> avec le RCCM d'une entreprise obtiendrait l'accès au compte existant** — on transformerait `INS-20`
> en prise de contrôle.
>
> **Règle proposée :** le second compte **ne peut être créé que depuis l'espace du premier**, par un
> utilisateur déjà authentifié *(« Ajouter une activité »)*. Le lien naît de cette action, **jamais
> d'une correspondance de RCCM constatée après coup**.
>
> **Deux comptes préexistants portant le même RCCM ne doivent donc PAS être liés automatiquement** —
> ils relèvent de l'étape 4.

**À implémenter :**

- `GET /api/account/linked` — renvoie les comptes de la même `Company` **liés explicitement** ;
- bascule : émission d'une nouvelle session pour le compte cible, **journalisée** *(qui, quand, depuis
  quel compte)* ;
- l'en-tête affiche l'activité active et permet de changer.

**Vérification :** créer un compte PRO, ajouter l'activité fournisseur depuis son espace, basculer.
Puis créer **séparément** un compte fournisseur avec le même RCCM → **refusé** *(étape 1)*.

---

### Étape 6 — Monogramme calculé, jamais stocké

**Fichiers :** `prisma/schema.prisma` · `src/components/onboarding/LogoStep.tsx`

**Décision :** le monogramme est **calculé à l'affichage** par le composant unique de `QAL-07`, à partir
de l'**identifiant permanent** de l'entité. **Rien n'est stocké.**

- `logoAssetId` **reste nullable** et ne reçoit **jamais** de valeur de repli ;
- **aucune image de monogramme n'est générée ni enregistrée** à l'inscription ;
- l'étape logo reste **franchissable** *(`INS-12`)*.

> **Pourquoi ne rien stocker.** Un monogramme enregistré comme « logo par défaut » devient une **seconde
> source de vérité** : le jour où l'entreprise dépose son vrai logo, il faut penser à effacer l'autre.
> **C'est exactement le mécanisme qui a produit `QAL-02` — dix écrans, dix rendus.** Une donnée
> dérivable ne se stocke pas.

**Vérification :** créer un compte sans logo → `logoAssetId` est `null` en base, et le monogramme
s'affiche. Déposer un logo ensuite → il remplace le monogramme **partout, sans autre action**.

---

### Étape 7 — Porte de correction de l'adresse e-mail

**Décision :** le compte étant créé avec une adresse **non vérifiée**, l'utilisateur entre dans son
espace et **corrige son adresse depuis un bandeau persistant**.

**À implémenter :**

- bandeau tant que `emailVerifiedAt IS NULL` : rappel de l'adresse, **« Renvoyer le lien »**,
  **« Corriger mon adresse »** ;
- le changement **revalide l'unicité** *(index partiel de l'étape 2)* et **remet `emailVerifiedAt` à
  `null`** ;
- limitation de débit sur le renvoi et sur le changement.

> **⚠️ Le bandeau doit afficher l'adresse enregistrée.** Sans elle, l'utilisateur ne peut pas voir sa
> faute de frappe — c'est justement parce qu'il ne reçoit rien qu'il est là. **Un bandeau qui dit
> seulement « vérifiez votre e-mail » ne sert à rien dans ce cas précis.**

**Vérification :** s'inscrire avec une adresse erronée, entrer dans l'espace, corriger, recevoir le lien.

---

### Étape 8 — Lexique et commentaires périmés

**Décision `QAL-08` :** **Professionnel** = titulaire du marché · **Intervenant** = corps de métier
ajouté. **« Prestataire » et « Entreprise » ne désignent plus un rôle.**

- remplacer toute occurrence de **« Prestataire »** dans les libellés de l'onboarding ;
- **« Entreprise »** reste autorisé pour la **personne morale** *(RCCM, structure)* — jamais pour le
  rôle ;
- corriger le commentaire de `src/lib/onboarding/steps.ts` qui annonce encore **« Fournisseur : 5 étapes »**
  alors que l'étape d'encaissement est implémentée. *Le code est juste, le commentaire est resté en
  arrière — mais un commentaire faux se propage en croyance fausse.*

**Vérification :** recherche de « Prestataire » dans `src/` → aucune occurrence dans un libellé affiché.

---

## 4. TESTS À AJOUTER

**Le paquet existant compte 73 tests. Aucun ne doit régresser.** Ajouter :

| Test | Ce qu'il doit prouver |
|---|---|
| `company.rccm.unique` | Deux entreprises avec le même RCCM → rejet **au niveau base**, pas seulement Zod |
| `company.dual-role` | Une entreprise peut porter un compte PRO **et** un compte FOURNISSEUR |
| `company.role.unique` | Une entreprise ne peut pas porter **deux** comptes du même rôle |
| `product.pricing.fixed` | `FIXED` sans prix → rejet · `FIXED` avec prix `0` → rejet |
| `product.pricing.onquote` | `ON_QUOTE` avec un prix → rejet · sans prix → accepté, `priceFcfa === null` |
| `account.suspended.login` | Un compte suspendu ne peut pas se connecter et n'apparaît pas à l'annuaire |
| `account.suspended.is-not-deleted` | Une suspension ne libère **pas** l'adresse e-mail |
| `logo.no-fallback-stored` | Inscription sans logo → `logoAssetId` reste `null` |
| `email.correction` | Correction de l'adresse → unicité revalidée, `emailVerifiedAt` remis à `null` |
| `link.requires-authenticated-creation` | Un second compte au même RCCM créé **hors** de l'espace du premier → **refusé** |

**Commande attendue :** `npm test` → typecheck strict, **0 échec**.

---

## 5. PIÈGES À ÉVITER

**Cette section est écrite pour être lue avant de coder, et relue en cas d'échec de test.**

| Piège | Pourquoi il est tentant | Ce qu'il coûte |
|---|---|---|
| **Retirer un `@unique` pour faire passer une migration** | La migration échoue sur des doublons existants | **C'est l'origine exacte de `INS-20`.** Traiter les doublons *(étape 4)*, jamais la contrainte |
| **Garder `isOnQuote` en le réécrivant** | Moins de fichiers à toucher | Le nom survit, donc le raisonnement aussi. Quelqu'un le rappellera sur un nombre |
| **Utiliser `deletedAt` pour suspendre** | Le champ existe déjà | Libère l'adresse e-mail d'un compte simplement suspendu *(`AVS-03`)* |
| **Stocker le monogramme comme logo par défaut** | Simplifie les e-mails et les exports | Seconde source de vérité — **le défaut `QAL-02`, à nouveau** |
| **Lier deux comptes sur la seule égalité de RCCM** | Semble être le sens de « comptes liés » | Transforme `INS-20` en **prise de contrôle de compte** |
| **Mettre `0` dans `priceFcfa` pour un produit sur devis** | Le champ est numérique, `null` semble « sale » | **`FIN-04`** — un zéro se propage et redevient un montant |
| **Compléter un champ manquant par une valeur plausible** | L'écran est plus joli | Produit un écran **faux mais crédible**, le pire des deux mondes |

> **Règle générale dont tous ces pièges découlent : une donnée absente doit rester absente et se voir.**
> Un écran qui refuse de s'afficher se corrige ; un écran qui affiche autre chose ne se remarque pas.

---

## 6. CRITÈRES D'ACCEPTATION

**La mise à niveau est terminée lorsque les onze assertions suivantes sont vraies.**

1. `Company` existe ; `rccm` et `taxId` y sont **uniques** ; ils **ne figurent plus** dans les profils.
2. Une même entreprise peut ouvrir un compte **Professionnel** et un compte **Fournisseur**.
3. Deux entreprises **ne peuvent pas** partager un RCCM — vérifié **par la base**, pas par le code.
4. Aucun compte actif ne partage un RCCM avec un autre ; les doublons sont **suspendus** et notifiés.
5. Aucun produit n'a `priceFcfa = 0` ; « sur devis » est porté par `pricingMode`.
6. La contrainte `product_pricing_coherent` rejette un `INSERT` incohérent.
7. L'index partiel `account_email_active_key` existe.
8. Aucune image de monogramme n'est stockée ; `logoAssetId` reste `null` sans logo déposé.
9. Un utilisateur peut corriger son adresse e-mail depuis son espace, sans support.
10. Le mot « Prestataire » n'apparaît dans aucun libellé.
11. `npm test` passe — **73 tests existants + les 10 nouveaux, 0 échec**.

---

## 7. CE QUE CETTE FICHE NE COUVRE PAS

| Sujet | Où |
|---|---|
| Page publique du fournisseur, obligatoire | `ANN-06` · `INS-03` |
| Modules filtrés par profil de rôle | `INS-21` |
| Étanchéité de la Marketplace et objet Demande de devis | `MKT-07` |
| Comptes employés par invitation | `INS-18` |
| Écrans de Paramètres fusionnés d'une entreprise à deux rôles | `SYS-06` |

**Ces cinq points sont des développements à part entière, pas des correctifs d'onboarding.**

> **Une dernière chose.** L'étape 5 restera bloquée tant que l'arbitrage du §1 n'aura pas été rendu.
> **Livrez les étapes 1 à 4 et 6 à 8 sans attendre** : elles ferment la faille `INS-20`, qui est le
> point le plus grave de tout le référentiel.

---

*Fiche établie le 27 juillet 2026 depuis `MEEREO_Specifications_v1.52.md`.*
*Toute décision nouvelle doit être portée au référentiel, jamais à cette seule fiche.*
