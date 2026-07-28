# Adaptateurs Prisma — les 6 contrats à implémenter

Ces fonctions sont les **seules** qui touchent la base. Le reste du paquet ne
connaît que les interfaces de `src/core/ports.ts`.

## 1. `AccountsPort`

```ts
emailAvailableForRole(email, role) →
  SELECT 1 FROM "Account"
  WHERE lower(email) = lower($1) AND role = $2 AND "deletedAt" IS NULL
```
⚠️ **`deletedAt IS NULL` est obligatoire**, sinon `AVS-03` casse : une adresse
libérée par une suppression redeviendrait indisponible.
⚠️ **Le filtre par rôle est obligatoire** : décision du 27/07, une adresse peut
porter un compte PRO *et* un compte FOURNISSEUR.

## 2. `CompaniesPort`

`findByRccm` / `findByTaxId` : lecture simple sur `Company`.
`hasAccountForRole(companyId, role)` : `SELECT 1 FROM "Account" WHERE "companyId"=$1 AND role=$2 AND "deletedAt" IS NULL`.

## 3. `DraftsPort`
CRUD sur `OnboardingDraft` + `purgeExpired` (tâche planifiée quotidienne).

## 4. `OnboardingTxPort` — **une seule transaction**

```
prisma.$transaction(async tx => {
  1. company  = attachToCompanyId ? findUnique : create({ legalName, rccm, taxId })
  2. account  = create({ ...account, companyId: company?.id })
  3. profil   = create ProProfile | SupplierProfile (+ secteurs / catégories)
  4. payout   = create PayoutMethod (fournisseur)
  5. produit  = create Product (si fourni)
  6. draft    = delete si draftId   ← DANS LA MÊME TRANSACTION (INS-13)
})
```
⚠️ Si la suppression du brouillon sort de la transaction, un échec partiel
laisse un brouillon orphelin qui reproposera une inscription déjà faite.

Traduire les violations de contrainte en `OnboardingError` :
`account_email_role_active_key` → `EMAIL_TAKEN` · `Company_rccm_key` → `RCCM_TAKEN`
· `Account_companyId_role_key` → `ROLE_ALREADY_ON_COMPANY`.

## 5. `PasswordPort`
`argon2id` recommandé. Ne jamais journaliser le mot de passe en clair.

## 6. `SessionPort` — 🔴 **en attente de décision**
L'authentification n'est pas arrêtée côté MEEREO. C'est le **seul** fichier à
écrire le jour où elle le sera. `NAV-07` : la session doit être ouverte dans la
**même réponse** que la création, sans redirection vers un écran de connexion.
