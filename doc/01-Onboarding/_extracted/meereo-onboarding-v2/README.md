# MEEREO — Onboarding des trois rôles

**Version 2.0 · 27 juillet 2026 · Référentiel `MEEREO_Specifications_v1.52.md`**

Cible confirmée par MEEREO : **React + API Express séparée**, **PostgreSQL + Prisma**.
Authentification **à confirmer** · aucun service d'e-mail en place · fichiers sur le
**système de fichiers du serveur**.

```bash
npm install
npm test     # typecheck strict + 43 tests, 0 échec
```

## Ce que le paquet contient

| Dossier | Rôle | Dépend de |
|---|---|---|
| `src/core/` | **Métier pur** — schémas, machine de parcours, service | rien (sauf `zod`) |
| `src/api/` | Routeur **Express** | `express`, `src/core` |
| `src/adapters/` | Stockage local, e-mail de développement, limitation de débit, fakes de test | — |
| `src/web/` | Composants **React** | `react`, `src/core` |
| `prisma/` | Schéma + **2 migrations SQL manuelles** | PostgreSQL |
| `tests/` | 43 tests, un par exigence | — |

**Le noyau ne connaît ni Express, ni Prisma, ni React.** C'est ce qui permet de
jouer les trois parcours complets en mémoire, sans base de données — et de
changer d'authentification sans toucher au métier.

## Ordre d'intégration

1. **`prisma/migrations/002_rccm_doublons.sql`** — auditer puis **suspendre** les
   doublons de RCCM. ⚠️ **Avant** toute contrainte : un `UNIQUE` posé sur une
   colonne qui contient des doublons **fait échouer la migration**.
2. Fusionner `prisma/schema.prisma` avec le schéma existant, puis
   `prisma migrate deploy`.
3. Exécuter **`001_meereo_onboarding.sql`** — les trois contraintes que Prisma ne
   sait pas exprimer.
4. Implémenter les **6 contrats** de `src/adapters/prisma/README-contrats.md`.
5. Monter le routeur (`src/api/server.example.ts`).
6. Brancher `OnboardingFlow` sur la route d'inscription.

## Ce qui reste à décider

| Point | Effet |
|---|---|
| **Authentification** | `SessionPort` est un contrat vide — un seul fichier à écrire |
| **Service d'e-mail** | `dev-logger` journalise au lieu d'envoyer. **Sans envoi réel, `INS-09` n'est pas fermé** |
| **Compteur de débit partagé** | En mémoire : valable pour **un seul processus** |

## Décisions structurantes portées par ce code

- **L'identité légale appartient à l'entreprise, pas au compte** — c'est ce
  déplacement, et lui seul, qui rend le cumul de rôles possible sans rouvrir la
  faille `INS-20`.
- **Le zéro ne signifie plus « sur devis »** — un mode de prix explicite, et une
  contrainte `CHECK` en base. C'est le motif exact de `FIN-04`.
- **L'état des boutons est dérivé du schéma**, jamais posé à la main (`INS-06`).
- **Aucune image de monogramme n'est stockée** : elle est calculée à l'affichage
  (`QAL-07`). Une donnée dérivable ne se stocke pas.
- **La session est ouverte dans la même réponse que la création** (`NAV-07`).
- **L'étape « projet » du client est supprimée** — décision du 27/07. La
  recommandation KAi de fin de parcours n'ayant plus aucune donnée d'entrée, elle
  est retirée plutôt que remplie de valeurs par défaut, ce que `INS-16` interdit.
