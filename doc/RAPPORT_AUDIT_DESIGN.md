# RAPPORT D'AUDIT DESIGN — Codebase vs Design System

**Date :** 2026-07-07
**Référence :** `doc/DESIGN.md` — "The Monolithic Minimum"
**Scope :** `web/src/styles/`, `web/src/design/`, `web/src/pages/`, `web/src/components/`

---

## Résumé global

| Règle Design System | Violations | Sévérité | Status |
|---------------------|-----------|----------|--------|
| 1. No-Line Rule (pas de borders) | 84 | 🔴 HAUTE | ❌ Non conforme |
| 2. Monochrome Constraint | 27 hardcoded + vars | 🔴 HAUTE | ❌ Non conforme |
| 3. Typography (max weight 600) | 75+ CSS + centaines JSX | 🔴 HAUTE | ❌ Non conforme |
| 4. Elevation (tonal layering) | 137+ shadows custom | 🔴 CRITIQUE | ❌ Non conforme |
| 5. Buttons | 0 | ✅ | ✅ Conforme |
| 6. No Dividers | 0 (via vars) | ✅ | ✅ Conforme |
| 7. Border Radius (no 90°) | 4 partiels | ✅ | ✅ Conforme |
| 8. No Pure Black Text | 0 | ✅ | ✅ Conforme |
| 9. Spacing Gallery (5.5rem) | Non implémenté | 🟡 MOYEN | ⚠️ Non vérifié |
| 10. CSS Tokens alignment | Conflit sémantique | 🟡 MOYEN | ⚠️ Partiel |

**Score de conformité : 4/10 règles respectées**

---

## Règle 1 — NO-LINE RULE

> *"Designers are prohibited from using 1px solid borders to section off the UI. Containers and sections must be defined solely through background color shifts."*

### Violation : 84 instances de `border: 1px solid`

| Fichier | Count | Détail |
|---------|-------|--------|
| `web/src/styles/onboarding.css` | 34 | Cards, inputs, sections, étapes wizard |
| `web/src/styles/cockpit.css` | 15 | `.card`, `.data-table`, `.filter-pill`, `.kpi-card` |
| `web/src/styles/global.css` | 10 | Navigation, KAI assistant, modals, tooltips |
| `web/src/components/layout/Sidebar.css` | 4 | Séparations sidebar |
| `web/src/components/layout/Topbar.css` | 3 | Border-bottom topbar |
| `web/src/components/shared/NotifPanel.css` | 3 | Items notification |
| `web/src/components/shared/Modal.css` | 3 | Borders modal header/footer |
| `web/src/styles/profile.css` | 5 | Sections profil public |
| `web/src/styles/client.css` | 2 | Layout client |
| `web/src/styles/supplier.css` | 2 | Layout fournisseur |
| **Inline JSX** | **200+** | `border: '1px solid var(--border)'` dans presque tous les composants |

### Exemples de violations

```css
/* cockpit.css */
.card { border: 1px solid var(--border-card); }
.data-table td { border-bottom: 1px solid var(--border); }
.filter-pill { border: 1px solid var(--border-subtle); }

/* global.css */
.topbar { border-bottom: 1px solid var(--border-subtle); }
```

```jsx
/* Inline JSX (partout) */
<div style={{ border: '1px solid var(--border)', borderRadius: 12 }}>
<div style={{ borderBottom: '1px solid var(--border)' }}>
```

### Correction requise

Remplacer toutes les borders par la hiérarchie de surfaces :
- **Level 0 (Base) :** `background: #f8f9fa` (--bg)
- **Level 1 (Section) :** `background: #f3f4f5` (--s1)
- **Level 2 (Card active) :** `background: #ffffff` (--s2 ou surface-container-lowest)
- **Level 3 (Popover) :** `background: #f8f9fa` + ambient occlusion

Exemple de fix :
```css
/* AVANT */
.card { border: 1px solid var(--border-card); background: var(--bg); }

/* APRÈS */
.card { background: #ffffff; } /* Level 2 sur fond Level 1 */
```

---

## Règle 2 — MONOCHROME CONSTRAINT

> *"The palette is strictly restricted to achieve a surgical, high-end aesthetic. We use a monochromatic spectrum."*

### Palette autorisée

| Token | Hex | Usage |
|-------|-----|-------|
| `surface` | `#f8f9fa` | Base background |
| `surface-container-low` | `#f3f4f5` | Sections |
| `surface-container-lowest` | `#ffffff` | Cards actives |
| `surface-container-high` | `#e7e8e9` | Secondary buttons |
| `surface-container-highest` | `#e1e3e4` | Input backgrounds |
| `primary` | `#000000` | CTA, texte principal |
| `primary-container` | `#3c3b3b` | Gradient CTA |
| `on_surface` | `#191c1d` | Body text |
| `on_surface_variant` | `#474747` | Secondary text |
| `outline-variant` | `#c6c6c6` | Ghost borders (10% opacity) |
| `on_primary` | `#e5e2e1` | Texte sur primary |
| `error` | `#ba1a1a` | Erreurs uniquement (usage minimal) |

### Violations : 27 couleurs non-monochromes hardcodées

| Couleur | Hex | Instances | Fichier | Usage |
|---------|-----|-----------|---------|-------|
| Violet | `#7C3AED` | 6 | `global.css` | KAI orb, texte accent, greeting |
| Rouge vif | `#FF3B30` | 5 | `global.css` | Badge notification, delete |
| Orange | `#FF9500` | 2 | `global.css` | Warning KAI, status indicator |
| Vert vif | `#34C759` | 5 | `onboarding.css`, `tokens.css` | Status badge success |
| Orange foncé | `#e07b00` | 1 | `tokens.css` | Token status |
| Bleu foncé | `#00497d` | 1 | `tokens.css` | Token info |
| Bleu | `#007AFF` | 3 | `cockpit.css` | Type labels documents |
| Bleu | `#2563EB` | 4 | inline JSX | Liens, accents |
| Orange | `#EA580C` | 2 | inline JSX | Hardhat icon tint |
| Ambre | `#F59E0B` | 3 | inline JSX | Warning, cart button |
| Vert | `#16A34A` | 2 | inline JSX | Success |
| Rouge | `#DC2626` | 1 | inline JSX | Error |

### Variables CSS non-monochromes (tokens.css)

```css
--ok: #16A34A;    /* Vert — VIOLATION */
--err: #ba1a1a;   /* Rouge — seul autorisé par le DS */
--wrn: #F59E0B;   /* Ambre — VIOLATION */
--inf: #007AFF;   /* Bleu — VIOLATION */
--blue: #2563EB;  /* Bleu — VIOLATION */
```

### Correction requise

Remplacer les variables de status par des variantes monochromes :
```css
/* AVANT */
--ok: #16A34A;
--wrn: #F59E0B;
--inf: #007AFF;

/* APRÈS (monochrome) */
--ok: #191c1d;    /* Noir + icône checkmark */
--wrn: #474747;   /* Gris foncé + icône warning */
--inf: #474747;   /* Gris foncé + icône info */
```

Utiliser le **poids typographique** et les **icônes** pour différencier les statuts, pas les couleurs.

---

## Règle 3 — TYPOGRAPHY (Editorial Precision)

> *"We use Inter with precise weighting. Display/Title: Weight 600, Body: Weight 400, Label: Weight 500."*

### Poids autorisés : 400, 500, 600 uniquement

### Violations CSS : 75+ instances de weight > 600

| Weight | Count | Fichiers principaux |
|--------|-------|-------------------|
| `font-weight: 700` | 40+ | `onboarding.css` (30), `cockpit.css` (5), `global.css` (5) |
| `font-weight: 800` | 30+ | `cockpit.css` (KPIs, hero), `onboarding.css` |
| `font-weight: 900` | 2 | `cockpit.css` (type labels documents) |

### Exemples de violations CSS

```css
/* cockpit.css */
.kpi-v2-value { font-size: 26px; font-weight: 800; }        /* → 600 */
.dash-hero-v2-title { font-weight: 800; }                    /* → 600 */
.ph-title { font-size: 22px; font-weight: 800; }             /* → 600 */
.doc-card-name { font-weight: 700; }                          /* → 600 */

/* global.css */
.kai-greeting-emphasis { font-weight: 700; }                  /* → 600 */
```

### Violations JSX inline : centaines d'instances

```jsx
/* Pattern répété dans TOUS les fichiers .jsx */
<div style={{ fontWeight: 700 }}>Titre</div>     /* → 600 */
<div style={{ fontWeight: 800 }}>KPI</div>        /* → 600 */
<span style={{ fontWeight: 700 }}>Label</span>    /* → 500 ou 600 */
```

**Fichiers les plus touchés :**
- `Projects.jsx` : 50+ instances de `fontWeight: 700/800`
- `Marketplace.jsx` : 40+ instances
- `Documents.jsx` : 30+ instances
- `Missions.jsx` : 20+ instances
- `Cockpit.jsx` : 30+ instances
- `Orders.jsx` : 20+ instances
- `Contracts.jsx` : 20+ instances
- Tous les autres fichiers cockpit/client/supplier

### Correction requise

- Remplacer **tous** les `font-weight: 700` → `600`
- Remplacer **tous** les `font-weight: 800` → `600`
- Remplacer **tous** les `fontWeight: 700` → `600` dans les inline styles
- Remplacer **tous** les `fontWeight: 800` → `600` dans les inline styles
- Utiliser la **taille** pour la hiérarchie, pas le poids

---

## Règle 4 — ELEVATION (Ambient Occlusion)

> *"Traditional drop shadows are replaced with Ambient Occlusion. For floating elements: `box-shadow: 0 20px 40px rgba(0,0,0, 0.04)`"*

### Violations : 137+ box-shadow customs

| Type de shadow | Count | Fichiers |
|---------------|-------|---------|
| Shadows customs CSS | 60+ | `global.css` (40), `cockpit.css` (24) |
| `boxShadow` inline JSX | 50+ | Pages cockpit, composants |
| Animations shadow KAI | 20+ | `global.css` |

### Exemples de violations

```css
/* global.css */
box-shadow: 0 2px 8px rgba(0,0,0,.06);        /* VIOLATION */
box-shadow: 0 4px 14px rgba(0,0,0,.16);        /* VIOLATION */
box-shadow: 0 8px 32px rgba(0,0,0,.12);        /* VIOLATION */
box-shadow: 0 12px 40px rgba(0,0,0,.1);        /* VIOLATION */
box-shadow: 0 24px 70px rgba(0,0,0,.08);        /* VIOLATION */

/* cockpit.css */
.card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.06); } /* VIOLATION */
```

```jsx
/* Inline JSX */
style={{ boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}     /* VIOLATION */
style={{ boxShadow: '0 10px 36px rgba(0,0,0,.14)' }}    /* VIOLATION */
style={{ boxShadow: '0 24px 80px rgba(0,0,0,.18)' }}    /* VIOLATION */
```

### Seule shadow autorisée

```css
/* Pour les éléments flottants (modals, dropdowns) UNIQUEMENT */
box-shadow: 0 20px 40px rgba(0,0,0, 0.04);
```

### Correction requise

1. Supprimer toutes les `box-shadow` sur les cards (utiliser le contraste de surface)
2. Remplacer les shadows modals/dropdowns par la shadow autorisée
3. Supprimer les shadows hover sur les cards
4. Le "lift" doit venir du contraste `#ffffff` card sur `#f3f4f5` fond

---

## Règle 5 — BUTTONS ✅

> *"Primary: #000000 background, #e5e2e1 text. Radius: 8px. No border."*

**Conforme.** Les boutons utilisent `var(--gr)` (gradient noir) et `var(--on-primary)`.

---

## Règle 6 — NO DIVIDERS ✅

> *"Forbid the use of divider lines. Separate list items using spacing or alternating backgrounds."*

**Conforme via variables.** Pas de `<hr>` trouvé. Les séparations utilisent des variables CSS mais restent des borders 1px (couvert par Règle 1).

---

## Règle 7 — BORDER RADIUS ✅

> *"Even the smallest chips must have at least 0.25rem radius."*

**Conforme.** 4 instances de `border-radius: 0` partielles mais acceptables (coins arrondis sur un côté seulement).

---

## Règle 8 — NO PURE BLACK TEXT ✅

> *"Use on_surface (#191c1d) for body text."*

**Conforme.** Aucun `color: #000` ou `color: black` hardcodé trouvé pour le texte. Utilise `var(--tx)` (#191c1d) partout.

---

## Règle 9 — SPACING GALLERY

> *"Use Spacing Scale 16 (5.5rem) for top-level page margins."*

### Non implémenté

Aucune instance de `margin-top: 5.5rem` ou `padding-top: 88px` trouvée. Les pages utilisent des marges de 20-24px.

### Correction requise

Ajouter au composant `DSPageHeader` ou à la classe `.content` :
```css
.cockpit-content { padding-top: 5.5rem; }
```

---

## Règle 10 — CSS TOKENS

> *Surface hierarchy: Level 0 (#f8f9fa), Level 1 (#f3f4f5), Level 2 (#ffffff), Level 3 (#f8f9fa + occlusion)*

### Tokens définis (tokens.css) — Correspondance partielle

| Token Design System | Token CSS actuel | Hex | Match |
|---------------------|-----------------|-----|-------|
| `surface` (Level 0) | `--bg` | `#f8f9fa` | ✅ |
| `surface-container-low` (Level 1) | `--s1` | `#f3f4f5` | ✅ |
| `surface-container-lowest` (Level 2) | `--surface-1` | `#ffffff` | ✅ |
| `surface-container-high` | `--s3` | `#e7e8e9` | ✅ |
| `surface-container-highest` | `--s4` | `#e1e3e4` | ✅ |
| `primary` | `--primary` | `#000000` | ✅ |
| `primary-container` | `--primary-container` | `#3c3b3b` | ✅ |
| `on_surface` | `--tx` | `#191c1d` | ✅ |
| `on_surface_variant` | `--t3` | `#474747` | ✅ |
| `outline-variant` | `--border-subtle` | `#c6c6c6` | ⚠️ Opacité 100% au lieu de 10% |
| `on_primary` | `--on-primary` | `#e5e2e1` | ✅ |
| `error` | `--err` | `#ba1a1a` | ✅ |

### Conflit : variables de status non-monochromes

```css
/* tokens.css — ces variables violent le design system */
--ok: #16A34A;     /* Vert vif → devrait être monochrome */
--wrn: #F59E0B;    /* Ambre → devrait être monochrome */
--inf: #007AFF;    /* Bleu → devrait être monochrome */
--blue: #2563EB;   /* Bleu → devrait être monochrome */
--color-info: ...  /* Bleu → devrait être monochrome */
```

---

## Violations dans les composants JSX inline

### Top 10 des fichiers les plus violés

| Fichier | Borders | Weights 700+ | Shadows | Couleurs |
|---------|---------|-------------|---------|----------|
| `Projects.jsx` | 30+ | 50+ | 10+ | 5+ |
| `Marketplace.jsx` | 25+ | 40+ | 15+ | 10+ |
| `Documents.jsx` | 20+ | 30+ | 5+ | 3+ |
| `Cockpit.jsx` | 15+ | 30+ | 5+ | 5+ |
| `Missions.jsx` | 15+ | 20+ | 5+ | 5+ |
| `Orders.jsx` | 10+ | 20+ | 5+ | 3+ |
| `Contracts.jsx` | 10+ | 20+ | 5+ | 3+ |
| `Assets.jsx` | 10+ | 15+ | 3+ | 3+ |
| `Exchange.jsx` | 10+ | 15+ | 5+ | 5+ |
| `Sidebar.jsx` | 5+ | 5+ | 0 | 5+ (icon tints) |

---

## Composants Design System existants

| Composant | Fichier | Conforme ? |
|-----------|---------|-----------|
| `DSPageHeader` | `web/src/design/components/DSPageHeader.jsx` | ⚠️ Utilise `.ph-title` (font-weight: 800) |
| `DSEmptyState` | `web/src/design/components/DSEmptyState.jsx` | ⚠️ `fontWeight: 700` |
| `DSFilterBar` | `web/src/design/components/DSFilterBar.jsx` | ⚠️ Borders sur pills |
| `DSKpiStrip` | `web/src/design/components/DSKpiStrip.jsx` | ⚠️ `fontWeight: 800` sur valeurs |
| `DSSearchBar` | `web/src/design/components/DSSearchBar.jsx` | ⚠️ Border input |
| `DSStatusBadge` | `web/src/design/components/DSStatusBadge.jsx` | ⚠️ Couleurs non-monochromes |

---

## Plan de remédiation

### Phase 1 — Tokens (fondation)
1. **tokens.css** : redéfinir les variables de status en monochrome
2. **tokens.css** : définir `--shadow-ambient: 0 20px 40px rgba(0,0,0, 0.04)` comme seule shadow
3. **tokens.css** : s'assurer que `--border-*` utilise 10% d'opacité

### Phase 2 — CSS globaux
4. **cockpit.css** : supprimer tous les `border: 1px solid`, `font-weight: 700/800/900`, `box-shadow` custom
5. **global.css** : supprimer couleurs KAI non-monochromes, shadows custom
6. **onboarding.css** : audit complet des 34 borders + 48 font-weights

### Phase 3 — Composants Design System
7. **DSPageHeader** : `font-weight: 800` → `600`
8. **DSEmptyState** : `fontWeight: 700` → `600`
9. **DSKpiStrip** : `fontWeight: 800` → `600`
10. **DSStatusBadge** : couleurs → monochrome

### Phase 4 — Pages JSX (le plus gros du travail)
11. Chaque fichier `.jsx` : remplacer `fontWeight: 700` → `600`, `fontWeight: 800` → `600`
12. Chaque fichier `.jsx` : supprimer les `border: '1px solid...'` inline
13. Chaque fichier `.jsx` : supprimer les `boxShadow` inline
14. Chaque fichier `.jsx` : remplacer les couleurs hardcodées par des tokens monochromes

### Phase 5 — Spacing
15. Ajouter `padding-top: 5.5rem` sur les pages principales
16. Vérifier l'utilisation de la grille 12 colonnes avec 3 colonnes vides

---

## Estimation de l'effort

| Phase | Fichiers | Effort estimé |
|-------|----------|--------------|
| Phase 1 — Tokens | 1 fichier | Petit |
| Phase 2 — CSS globaux | 4 fichiers | Moyen |
| Phase 3 — Design System | 6 composants | Petit |
| Phase 4 — Pages JSX | 30+ fichiers | **Grand** (travail le plus conséquent) |
| Phase 5 — Spacing | 2-3 fichiers | Petit |

**Total estimé : Phase 4 représente ~80% du travail** car les styles inline sont présents dans chaque composant.
