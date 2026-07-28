# MEEREO — DOSSIER À TRANSMETTRE AU DÉVELOPPEUR

**Version corrigée du 28 juillet 2026** · Référentiel : `MEEREO_Specifications_v1.52.md`

> ## ⚠️ COMMENCEZ PAR `00-ERRATUM.md`
> **Ce dossier remplace intégralement celui qui a déjà été transmis.** Deux défauts y ont été trouvés,
> dont un qui **empêchait de terminer deux des trois parcours**. L'erratum dit lesquels et pourquoi.

---

## Ordre de lecture

| Ordre | Fichier | Pourquoi |
|---|---|---|
| **1** | `00-ERRATUM.md` | Ce qui était faux dans la version reçue |
| **2** | `01-Onboarding/01-Dossier-integration.md` | Le cadre : cible technique, douze arbitrages, trois parcours, modèle de données |
| **3** | `01-Onboarding/02-Fiche-execution.md` | La mise à niveau du code, étape par étape, avec le SQL |
| **4** | `02-KAi-Animations/02-Etat-implementation-v4.md` | Où en est KAi, ce qui reste à écrire |

---

## 01 — Onboarding

| Fichier | Contenu |
|---|---|
| `01-Dossier-integration.md` | **Le dossier de référence.** React + Express + PostgreSQL, les douze arbitrages, les trois parcours *(2 / 4 / 6 étapes)*, le modèle de données, les 43 tests, les pièges |
| `02-Fiche-execution.md` | **Fiche d'exécution** pas à pas — chemins exacts, Prisma, SQL, critères de vérification |
| `03-Code-teste.zip` | **Le code.** 33 fichiers, noyau métier sans dépendance à Express ni React. **43 tests verts, typecheck strict** |
| `04-Prototype-parcours-v4.html` | **Le parcours visuel**, un seul fichier. **Corrigé — les trois parcours vont au bout, vérifiés par exécution** |

### 🔴 Deux points bloquants, hors développement

1. **L'authentification n'est pas arrêtée.** `SessionPort` est un contrat vide : **un seul fichier à
   écrire**. Sans lui, l'inscription crée un compte mais ne connecte personne — défaut `NAV-07`.
2. **Aucun service d'e-mail en place.** L'implémentation fournie journalise au lieu d'envoyer.
   **Sans envoi réel, aucune adresse n'est vérifiée** et `INS-09` reste ouvert.

### Un point à trancher avant l'étape 5

Deux comptes liés ne peuvent pas partager une adresse e-mail. **Trois issues, aucune retenue** — voir
la fiche d'exécution §1. **Les étapes 1 à 4 et 6 à 8 n'en dépendent pas et ferment `INS-20`**, le
défaut le plus grave du référentiel.

---

## 02 — Animations de KAi

| Fichier | Contenu |
|---|---|
| `01-Specification-KAi-animations.md` | **La spécification du 22 juillet. Elle fait foi.** |
| `02-Etat-implementation-v4.md` | **L'écart** : ce qui est fait, trois valeurs divergentes, six séquences absentes |
| `03-kai-animations.css` | Les 14 keyframes et leurs déclencheurs, prêts à coller |
| `04-kai-idle-scheduler.js` | Le planificateur de micro-gestes |

### À vérifier avant tout

**Aucune animation de KAi ne fonctionne en production** *(`QAL-05`)*.

> Une règle globale `* { animation: none }` sous `prefers-reduced-motion` **éteint tout d'un coup** —
> ce qui expliquerait le symptôme. **Trente secondes de vérification avant d'auditer chaque animation.**

---

## 03 — Référence

`MEEREO_Specifications_v1.52.md` — **le référentiel complet, 95 codes.**

Chaque point renvoie au sien : `INS-20`, `FIN-04`, `QAL-05`… **Ces codes ne changent jamais.**

> **Deux conventions.** Le référentiel n'est jamais réécrit : une décision nouvelle est un
> **amendement daté**, et **le plus récent fait foi**. Et **les titres de code ne changent jamais** —
> deux sont périmés, `ANN-06` et `SYS-04` : c'est la décision qui fait foi, pas le titre.

---

> **Seul `dev.meereo.com` fait foi pour établir un défaut.** Si un constat ne correspond pas à ce que
> vous observez, **ne codez pas** : signalez l'écart.
