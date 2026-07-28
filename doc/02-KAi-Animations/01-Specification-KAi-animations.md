# KAi — Animations & mode de fonctionnement (spécification d'intégration)

**Version : 1.0** · **Date : 22 juillet 2026** · **Statut : prêt à intégrer**

> **Destinataire :** développeur front-end.
> **Objet :** document autonome regroupant **toutes les animations de KAi** et leur mode de fonctionnement, extraites de la spécification KAi complète (parties B et C). Objectif : permettre l'intégration directe sans naviguer dans la spec métier.
> **Règle stricte :** les valeurs CSS/JS ci-dessous ont été **validées visuellement pendant la conception**. Elles sont à utiliser **telles quelles**, pas comme point de départ à réinterpréter.
> **Orthographe du nom :** **KAi** (et non « KAI »). Toute mention antérieure en majuscules doit être lue comme KAi.

---

## Sommaire

1. Principe directeur : deux catégories d'animation, jamais mélangées
2. Le principe de « vivacité »
3. Tokens et contraintes visuelles liés aux animations
4. Animations ambiantes (boucle infinie)
5. Micro-gestes idle (avatar « vivant »)
6. Animations événementielles (une seule fois, sur déclenchement)
7. Séquences événementielles — timing exact
8. Scheduler idle — logique JS de référence
9. Mapping animation ↔ composant
10. Icônes utilisées dans les animations
11. Accessibilité
12. Points ouverts (à ne pas combler par supposition)

---

## 1. Principe directeur : deux catégories, jamais mélangées

Toutes les animations de KAi relèvent de **l'une ou l'autre** de ces deux catégories. Elles ne doivent **jamais** être mélangées :

| Catégorie | Déclenchement | Répétition | Rôle |
|---|---|---|---|
| **États ambiants** | Aucun (permanent) | Boucle infinie, silencieuse | Représentent un **état permanent** de la plateforme, pas un événement |
| **États événementiels** | Sur action / événement | Jouent **une seule fois** ; rejouables manuellement au clic, jamais en boucle auto | Représentent un **événement** ponctuel |

Font partie des **ambiants** : respiration de l'avatar, pulsation du point de présence, anneau d'attention, points de réflexion.
Font partie des **événementiels** : arrivée de message, confirmation d'action, projet terminé, achat confirmé, changement de palier.

---

## 2. Le principe de « vivacité »

Une boucle parfaitement régulière est perçue comme **mécanique**. La vivacité de KAi vient de la **variation et de l'aléatoire dans le timing** (voir micro-gestes idle, section 5), pas de la simple répétition. Ce principe conditionne le scheduler idle : les micro-gestes ne se déclenchent jamais à intervalle fixe.

---

## 3. Tokens et contraintes visuelles liés aux animations

**Couleurs mobilisées par les animations** (valeurs fixes, indépendantes du mode clair/sombre de l'hôte) :

| Token | Valeur | Usage dans les animations |
|---|---|---|
| `--kai-avatar-bg` | `#15121F` | Fond de l'avatar animé (respiration, gestes idle) |
| `--kai-accent` | `#9086E8` | Lettre « K », anneau d'attention (`kai-ping`), badge enveloppe, étincelle upgrade |
| `--kai-success` | `#2F9E5B` | Point de présence pulsant, anneau de confirmation, coche d'achat/action |

**Règle de sens (à respecter dans toute animation) :** chaque couleur ne porte qu'**une seule** signification. Vert = confirmation/succès uniquement. Violet = identité/marque + signal d'attention uniquement. **Jamais de rouge** pour un signal KAi (le rouge reste réservé aux erreurs système génériques, hors périmètre KAi).

**Contraintes de rendu :** design plat — **aucune ombre portée, nulle part**, aucun dégradé, bordures fines uniquement. Anneau de bord de l'avatar : `1px solid rgba(255,255,255,0.08)` (garantit la lisibilité du mark « K » sur fond clair comme sombre).

**Tailles d'avatar animé — deux seulement**, pas de taille intermédiaire :

| Contexte | Taille |
|---|---|
| Autonome (pastille repliée) | `36px` |
| En ligne avec du texte (bulle, panneau, cartes d'événement) | `28px` |

---

## 4. Animations ambiantes (boucle infinie)

À utiliser telles quelles.

```css
@keyframes kai-breathe { 0%,100% { transform: scale(1); } 50% { transform: scale(1.025); } }
/* avatar, 3.6s ease-in-out infinite */

@keyframes kai-pulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.2); opacity: .7; } }
/* point de présence, 2.2s ease-in-out infinite */

@keyframes kai-ping { 0% { transform: scale(.85); opacity: .7; } 100% { transform: scale(1.5); opacity: 0; } }
/* anneau d'attention, 1.8s cubic-bezier(0,0,.2,1) infinite */

@keyframes kai-bounce { 0%,80%,100% { transform: translateY(0); opacity: .35; } 40% { transform: translateY(-4px); opacity: 1; } }
/* points de réflexion, 1.1s ease-in-out infinite, délais échelonnés 0s / .15s / .3s */
```

**Correspondance :**

- `kai-breathe` → respiration continue de l'avatar (tous contextes).
- `kai-pulse` → point de présence vert, permanent (indique que KAi est en ligne).
- `kai-ping` → anneau violet d'attention, actif **uniquement** quand une recommandation est en attente (pastille « attention », section 9). Coexiste alors avec le point vert : disponible **et** a quelque chose à signaler.
- `kai-bounce` → les trois points de l'indicateur de réflexion (état autonome, ne se transforme pas automatiquement en message).

---

## 5. Micro-gestes idle (avatar « vivant »)

Au repos (pastille repliée), l'avatar exécute — **en plus** de sa respiration continue — des micro-gestes **aléatoires** qui ne se répètent pas à rythme fixe.

**Trois gestes, tirés aléatoirement, jamais combinés simultanément :**

| Geste | Effet | Élément ciblé | Durée |
|---|---|---|---|
| Nod | Rotation légère du cercle entier | Conteneur avatar (**wrapper**) | 0,55 s |
| Glance | Décalage horizontal de 2px | Lettre « K » **uniquement** | 0,5 s |
| Blink | Chute d'opacité brève | Lettre « K » **uniquement** | 0,45 s |

```css
@keyframes kai-nod { 0%,100% { transform: rotate(0); } 30% { transform: rotate(-5deg); } 65% { transform: rotate(4deg); } }
/* .55s ease-in-out, appliqué au WRAPPER de l'avatar (pas à l'élément qui respire) */

@keyframes kai-glance { 0%,100% { transform: translateX(0); } 30% { transform: translateX(-2px); } 65% { transform: translateX(2px); } }
/* .5s ease-in-out, appliqué à la lettre « K » uniquement */

@keyframes kai-blink { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
/* .45s ease-in-out, appliqué à la lettre « K » uniquement */
```

**⚠️ Contrainte technique critique :** le geste **nod** s'applique sur un **élément wrapper distinct** de celui qui porte la respiration (`kai-breathe`). Les deux utilisent la propriété `transform` : les appliquer au même élément crée un **conflit**. Wrapper pour le nod, élément interne pour la respiration.

**Planification :** intervalle aléatoire entre chaque geste, tiré entre **2,6 s et 6,8 s**. Pondération observée en test : ~40 % nod, ~35 % glance, ~25 % blink. *(Ces valeurs de fréquence sont testées mais non définitives — voir section 12.)*

---

## 6. Animations événementielles (une seule fois)

Jouent **une fois** sur déclenchement. Rejouables manuellement au clic (affordance de rejeu `ti-refresh` visible au survol des cartes), **jamais en boucle automatique**.

```css
@keyframes kai-ring1 { 0% { transform: scale(.8); opacity: .8; } 100% { transform: scale(1.7); opacity: 0; } }
/* anneau vert one-shot (projet terminé), .9s cubic-bezier(0,0,.2,1), iteration-count: 1 */

@keyframes kai-wobble { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-8deg); } 75% { transform: rotate(8deg); } }
/* panier achat, .5s ease-in-out, iteration-count: 1 */
```

Les autres effets événementiels (scale-in avec rebond, crossfade, fade/slide) sont décrits par leurs timings exacts en section 7. Le rebond utilise systématiquement `cubic-bezier(.34,1.56,.64,1)`.

---

## 7. Séquences événementielles — timing exact

À respecter à la milliseconde.

**Arrivée de message (enveloppe)**
1. `t=0` — badge enveloppe **fermée** : scale-in avec rebond (`cubic-bezier(.34,1.56,.64,1)`, .35 s).
2. `t=550 ms` — icône bascule vers enveloppe **ouverte**.
3. `t=1000 ms` — badge disparaît (fade .3 s) pendant que le contenu (barres de texte) apparaît (fade + slide .35 s).
   *Le contenu réel n'est jamais un texte inventé côté design system : ce sont des barres qui se déploient.*

**Projet terminé**
1. `t=0` — anneau vert one-shot (`kai-ring1`, .9 s) **+** badge coche : scale-in avec rebond (.4 s), **simultanés**.

**Achat marketplace confirmé**
1. `t=0` — icône panier : wobble (`kai-wobble`, .5 s).
2. `t=400 ms` — badge coche : scale-in avec rebond (.3 s).

**Passage Standard → Pro**
1. `t=0` — état initial (fond neutre, texte « KAi Standard »).
2. `t=500 ms` — crossfade texte (.3 s) + transition fond/couleur (.35 s) vers état Pro.
3. `t=850 ms` — icône étincelle : scale-in avec rebond (.3 s).

**Confirmation d'action (bouton, ex. « Résumé projet »)**
1. Au clic — icône devient **coche verte**, bordure/texte du bouton passent au vert (immédiat).
2. `t=1600 ms` — retour à l'état initial.
   *Représente l'étape 8 du mode décisionnel de KAi : exécution après autorisation.*

**Retour de sélection (chips de raccourcis du panneau)**
1. Au clic — classe « active » (fond accent) ajoutée.
2. `t=600 ms` — classe retirée.

---

## 8. Scheduler idle — logique JS de référence

À utiliser telle quelle. Reprogrammation récursive pour un timing non fixe.

```js
function scheduleIdle(avatarWrapper, letterEl) {
  const delay = 2600 + Math.random() * 4200; // 2.6s à 6.8s
  setTimeout(() => {
    const pick = Math.random();
    if (pick < 0.40) {
      playOnce(avatarWrapper, 'do-nod', 560);
    } else if (pick < 0.75) {
      playOnce(letterEl, 'do-glance', 520);
    } else {
      playOnce(letterEl, 'do-blink', 470);
    }
    scheduleIdle(avatarWrapper, letterEl); // reprogrammation récursive
  }, delay);
}

function playOnce(el, className, duration) {
  el.classList.add(className);
  setTimeout(() => el.classList.remove(className), duration);
}
```

Note : `avatarWrapper` (pour le nod) et `letterEl` (pour glance/blink) sont bien **deux éléments distincts** — cohérent avec la contrainte de la section 5.

---

## 9. Mapping animation ↔ composant

Où chaque animation s'applique, selon la structure de composants de la spec :

| Composant | Animation(s) associée(s) | Catégorie |
|---|---|---|
| `KaiAvatar` (idle) | `kai-breathe` + micro-gestes (nod / glance / blink via `KaiIdleScheduler`) | Ambiant |
| `KaiAvatar` (point de présence) | `kai-pulse` | Ambiant |
| `KaiPill` — état « attention » | `kai-ping` (anneau violet) + point vert coexistants | Ambiant |
| `KaiThinkingCard` | `kai-bounce` (3 points échelonnés) | Ambiant |
| `KaiMessageArrival` | séquence enveloppe fermée → ouverte → contenu (section 7) | Événementiel |
| `KaiSuggestionBubble` (bouton d'action) | confirmation d'action → coche verte, retour à 1,6 s | Événementiel |
| `KaiPanel` — champ de saisie | icône d'envoi passe en accent violet dès qu'un texte est saisi | Événementiel |
| `KaiQuickAction` (chips) | retour de sélection (classe active, retrait à 600 ms) | Événementiel |
| `KaiEventCard` = `projectDone` | `kai-ring1` + coche scale-in (simultanés) | Événementiel |
| `KaiEventCard` = `purchaseConfirmed` | `kai-wobble` panier → coche à 400 ms | Événementiel |
| `KaiEventCard` = `tierUpgrade` | crossfade tag Standard→Pro → étincelle à 850 ms | Événementiel |

Toutes les `KaiEventCard` sont **rejouables au clic** (icône `ti-refresh` visible au survol).

---

## 10. Icônes utilisées dans les animations (Tabler, style outline uniquement)

| Icône | Rôle animé |
|---|---|
| `ti-mail` / `ti-mail-opened` | Arrivée de message (fermée → ouverte) |
| `ti-check` | Confirmation (projet terminé, achat, action exécutée) |
| `ti-shopping-bag` | Achat marketplace (wobble) |
| `ti-sparkles` | Upgrade de palier (apparaît après la transition Standard→Pro) |
| `ti-send` | Envoi (passe en accent violet quand du texte est saisi) |
| `ti-refresh` | Affordance de rejeu sur les cartes événementielles |
| `ti-x` | Fermeture |

---

## 11. Accessibilité

> **Note d'origine :** ces points relèvent des bonnes pratiques standard, **non issus des échanges de conception**. Signalés comme tels, à valider par l'équipe.

- **`prefers-reduced-motion` :** désactiver ou réduire drastiquement les **animations ambiantes** et les **micro-gestes idle** pour les utilisateurs ayant activé ce réglage système. Les animations événementielles **fonctionnelles** (confirmation d'action) peuvent être conservées sous forme de **changement d'état instantané sans transition**.
- Icônes **décoratives** accompagnant un texte (`ti-x`, `ti-check`…) : `aria-hidden="true"`.
- Icônes **seules porteuses de sens** (fermeture, envoi) : `aria-label` explicite.
- **Contraste :** `#9086E8` sur `#15121F` et `#F5F4FC` sur `#15121F` à vérifier au ratio **WCAG AA minimum** (à contrôler avec l'outil final — non garanti par la présente spec).

---

## 12. Points ouverts (à ne pas combler par supposition)

- **Fréquence des micro-gestes idle (section 5) :** la fourchette **2,6–6,8 s** et la pondération 40/35/25 sont **testées mais non validées comme définitives**. À confirmer ou ajuster après retour utilisateur, sans les traiter comme figées.
- **Accessibilité (section 11) :** ajout de bonnes pratiques, pas issu de la conception d'origine — à valider par l'équipe avant intégration finale.

> Ces deux points ne bloquent pas l'intégration : ils peuvent être développés avec les valeurs actuelles, puis ajustés. Ils sont signalés pour éviter qu'ils soient considérés comme définitivement arbitrés.

---

*Ce document est une extraction fidèle de la spécification KAi complète (parties B et C). Aucune animation, valeur ou timing n'a été ajouté ou modifié au-delà du regroupement thématique. Pour le fonctionnement métier de KAi (QUOREX, mode décisionnel, comportement par acteur), se référer à la spécification KAi complète.*
