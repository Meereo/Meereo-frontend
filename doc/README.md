# MEEREO — Documentation

## Structure

```
doc/
  README.md              <- Ce fichier (index)
  ARCHITECTURE.md        <- Stack technique, structure projet, modeles Prisma
  API.md                 <- Toutes les routes serveur
  FEATURES.md            <- Statut des features (implementees / a faire)
  DESIGN.md              <- Design system (The Monolithic Minimum)
  TODO.md                <- Taches en cours
  features/              <- Specs detaillees par feature (00 -> 23)
  specs/                 <- Specifications fonctionnelles v1.27 (REFERENCE)
    00_INDEX.md          <- Sommaire des exigences (codes stables INS-01, MSG-02...)
    A_*.md ... K_*.md    <- Domaines fonctionnels
    Annexe_*.md          <- Annexes (decisions, journal versions, diagnostic)
    audits/              <- Audits code vs specs (les plus recents)
  archive/               <- Versions anterieures conservees pour l'historique
```

## Documentation technique

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Stack, structure des fichiers, modeles de donnees, auth, real-time |
| [API.md](API.md) | Toutes les routes Express avec methodes et descriptions |
| [FEATURES.md](FEATURES.md) | Matrice des features : implementees, partielles, a faire |
| [DESIGN.md](DESIGN.md) | Regles du design system (palette, typo, elevations, composants) |
| [TODO.md](TODO.md) | Taches restantes |

## Specifications fonctionnelles (reference de developpement)

**Version courante : v1.30 (26 juil. 2026).** Point d'entree recommande — synthese produit
+ backlog des modifications UI par code (`INS-01`, `MSG-04`…) :
**[specs/SYNTHESE_Produit_UI_v1.30.md](specs/SYNTHESE_Produit_UI_v1.30.md)**.

Le detail exhaustif des exigences reste dans le dossier **[specs/](specs/)** — referentiel
decoupe par domaine, avec codes stables (`INS-01`, `MSG-02`, `FIN-03`…), fige en v1.27.
Sommaire : **[specs/00_INDEX.md](specs/00_INDEX.md)**. (Le fichier v1.30 integral n'est pas
encore verse dans le depot ; seule la synthese ci-dessus l'est.)

### Audits code vs specs (les plus recents)

| Document | Description |
|----------|-------------|
| [specs/audits/AUDIT_v1.30.md](specs/audits/AUDIT_v1.30.md) | **Audit courant** — code vs v1.30, 47 exigences, 6 domaines (26 juil.) |
| [specs/audits/AUDIT_Codebase_vs_Specs.md](specs/audits/AUDIT_Codebase_vs_Specs.md) | Ecarts code vs specs (24 juil.) |
| [specs/audits/AUDIT_Post_Corrections_v2.md](specs/audits/AUDIT_Post_Corrections_v2.md) | Etat apres 27 corrections (24 juil.) |
| [specs/audits/COMPARAISON_Specs_vs_Code.md](specs/audits/COMPARAISON_Specs_vs_Code.md) | Comparaison point par point |

## Features (specs detaillees)

| # | Feature | Fichier |
|---|---------|---------|
| 00 | Architecture 5 couches | [00-meta-architecture.md](features/00-meta-architecture.md) |
| 01 | Inscription et Cockpit | [01-inscription-et-cockpit.md](features/01-inscription-et-cockpit.md) |
| 02 | Cockpit Client | [02-cockpit-client.md](features/02-cockpit-client.md) |
| 03 | Creation de projet | [03-creation-projet.md](features/03-creation-projet.md) |
| 04 | Annuaire professionnels | [04-annuaire-professionnels.md](features/04-annuaire-professionnels.md) |
| 05 | Page professionnelle | [05-page-professionnelle-publique.md](features/05-page-professionnelle-publique.md) |
| 06 | Cockpit professionnel | [06-cockpit-professionnel.md](features/06-cockpit-professionnel.md) |
| 07 | Cockpit projet | [07-cockpit-projet.md](features/07-cockpit-projet.md) |
| 08 | Missions | [08-missions.md](features/08-missions.md) |
| 09 | Appels d'offres | [09-appels-offres.md](features/09-appels-offres.md) |
| 10 | Referentiel documentaire | [10-referentiel-documentaire.md](features/10-referentiel-documentaire.md) |
| 11 | Communication hub | [11-communication-hub.md](features/11-communication-hub.md) |
| 12 | CRM relationnel | [12-crm-relationnel.md](features/12-crm-relationnel.md) |
| 13 | Marketplace | [13-marketplace.md](features/13-marketplace.md) |
| 16 | Moteur de permissions | [16-moteur-permissions.md](features/16-moteur-permissions.md) |
| 17 | Workflow engine | [17-workflow-engine.md](features/17-workflow-engine.md) |
| 18 | Event engine | [18-event-engine.md](features/18-event-engine.md) |
| 19 | Rules engine | [19-rules-engine.md](features/19-rules-engine.md) |
| 20 | KAI (IA) | [20-kai-intelligence-artificielle.md](features/20-kai-intelligence-artificielle.md) |
| 22 | Digital twin | [22-digital-twin.md](features/22-digital-twin.md) |
| 23 | MEEREO Core | [23-meereo-core.md](features/23-meereo-core.md) |

## Archive

Le dossier **[archive/](archive/)** conserve les versions anterieures, remplacees mais
gardees pour l'historique :

- `MEEREO_Specifications_v1.27.md` — version monolithique de la spec (meme contenu que `specs/`)
- `MEEREO_Specifications_Fonctionnelles.md` — spec fonctionnelle initiale (sans version)
- `AUDIT.md`, `AUDIT_COMPLET_v1.27.md`, `AUDIT_Codebase_vs_Specs_v1.27.md`, `AUDIT_Second_Pass_v1.27.md` — audits du 23 juil. (generation precedente)
- `corrections-appliquees.md` — suivi des corrections liees a ces audits
- `UPDATE.MD` — retours client du 19/07 (integres depuis dans les specs)
- `image.png` — capture d'ecran
