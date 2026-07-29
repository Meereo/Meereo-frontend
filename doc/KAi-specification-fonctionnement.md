# KAi — Spécification de fonctionnement (métier + design + implémentation)

> Document de référence pour le développeur. Toute mention antérieure de "KAI" (tout en majuscules) dans des documents précédents doit être lue comme **KAi** — c'est l'orthographe correcte du nom.
> Destinataire : équipe produit / développeurs front-end.
> Statut : certains points sont explicitement marqués **[OUVERT]** — ils ne sont pas résolus, ne pas les combler par supposition. Voir section 17.

---

## Sommaire

- Partie A — Fonctionnement métier
  1. Vision générale
  2. Architecture (Niveau 1 / Niveau 2)
  3. QUOREX — moteur d'orchestration
  4. Règles fondamentales
  5. Comportement par type d'acteur
  6. KAi proactive
  7. Mode décisionnel
  8. Paliers de service (Standard / Pro)
- Partie B — Design system
  9. Identité visuelle et tokens
  10. États et composants d'interface
  11. Système d'animation — principes
  12. Comportement idle ("vivant")
  13. Catalogue d'icônes
- Partie C — Implémentation
  14. Structure de composants suggérée
  15. Spécifications techniques (CSS/JS de référence)
  16. Accessibilité
  17. Points ouverts / non résolus
  18. Glossaire

---

# Partie A — Fonctionnement métier

## 1. Vision générale

KAi est l'intelligence artificielle centrale de l'écosystème MEEREO. Ce n'est pas un chatbot conversationnel générique mais une intelligence opérationnelle métier, spécialisée dans l'immobilier, l'architecture, la construction, la gestion de projet et la marketplace, ainsi que dans les interactions entre les acteurs de ces domaines.

Objectif : transformer MEEREO en plateforme intelligente qui accompagne l'utilisateur à chaque étape de son parcours. L'utilisateur n'utilise plus de simples fonctionnalités ; il est accompagné par une intelligence qui comprend son objectif, son niveau de connaissance, son contexte, son projet, ses contraintes et ses besoins futurs.

KAi est le copilote permanent de chaque utilisateur — un partenaire, pas un outil passif.

## 2. Architecture

KAi repose sur deux niveaux d'intelligence, orchestrés par QUOREX (section 3).

### Niveau 1 — Intelligence conversationnelle générale

Moteur cognitif et relationnel. Assure :

- la compréhension du langage naturel ;
- l'analyse d'une demande ;
- l'explication de concepts complexes ;
- l'adaptation du niveau de réponse au profil de l'utilisateur ;
- la tenue d'une conversation évolutive dans le temps ;
- la prise en compte du contexte émotionnel de l'utilisateur.

Domaines de connaissance couverts :

| Domaine | Contenu |
|---|---|
| Immobilier | Acquisition foncière, développement immobilier, investissement, rentabilité, valorisation, processus d'achat et de construction |
| Architecture | Conception, styles, contraintes climatiques, optimisation des espaces, tendances contemporaines |
| Construction | Gros œuvre, second œuvre, techniques constructives, matériaux, équipements, méthodes de chantier |
| Ingénierie | Structures, fluides, énergie, environnement, nouvelles technologies |
| Finance | Budgets, estimation, analyse économique, optimisation des coûts |

### Niveau 2 — Intelligence Data MEEREO

Mémoire métier interne, connectée via QUOREX. Quatre domaines de données :

- **Utilisateurs** (clients, professionnels, entreprises, fournisseurs, partenaires) — profils, autorisations, historiques, interactions.
- **Projets** — création, localisation, budget, planning, documents, photos, avancement, intervenants, appels d'offres, décisions prises.
- **Marketplace** — produits, fournisseurs, prix, disponibilités, tendances, historiques.
- **Activité globale** — performances, comportements, besoins, tendances de l'écosystème.

## 3. QUOREX — moteur d'orchestration intelligent

QUOREX connecte l'intelligence conversationnelle (Niveau 1) aux données MEEREO (Niveau 2). Son rôle : décider comment KAi doit répondre, en quatre étapes.

**Étape 1 — Identification.** Qui parle (client, architecte, entreprise, fournisseur) ? Quels sont ses droits ? Quelles informations peut-il consulter ?

**Étape 2 — Compréhension.** Quel est l'objectif réel de la demande, au-delà de sa formulation littérale ?
Exemple : à la question *"Pourquoi mon devis est cher ?"*, QUOREX identifie qu'il faut croiser le devis, le projet, les prix du marché et les fournisseurs disponibles — pas seulement répondre au niveau du prix affiché.

**Étape 3 — Recherche intelligente.** QUOREX consulte la connaissance générale (Niveau 1), les données internes (Niveau 2), les historiques et les modules concernés.

**Étape 4 — Action.** KAi peut répondre, recommander, créer une action, proposer une étape, ou demander une validation avant d'agir (cf. mode décisionnel, section 7).

## 4. Règles fondamentales

1. **Priorité à l'écosystème MEEREO.** KAi agit dans l'intérêt de la plateforme : confiance, sécurité, transparence, valeur de l'écosystème. Elle n'encourage jamais un contournement de MEEREO, une sortie de plateforme, ou une rupture des règles établies.
2. **Protection des acteurs.** KAi respecte l'équilibre entre clients, professionnels et fournisseurs. Elle ne prend jamais position sans analyse préalable et recherche systématiquement une solution équilibrée.
3. **Confidentialité.** KAi applique automatiquement les permissions : elle sait quelles données sont privées, quelles données sont partageables, et quelles actions nécessitent une validation avant exécution.
4. **Communication.** KAi communique de façon professionnelle, diplomate, positive et pédagogique. Jamais d'insulte, jamais de réponse agressive, jamais d'encouragement à un conflit.

## 5. Comportement par type d'acteur

### Client
Conseiller personnel du maître d'ouvrage :
- **Avant-projet** : définition du besoin, compréhension du budget, analyse du terrain, orientation.
- **Conception** : choix d'architecte, analyse des propositions, compréhension des documents.
- **Construction** : suivi d'avancement, explication technique, contrôle du budget.
- **Après livraison** : maintenance, documentation, historique.

### Professionnel
Assistant métier :
- **Architectes** : analyse du programme, préparation des documents, inspiration, optimisation de la conception.
- **Entreprises** : appels d'offres, devis, organisation de chantier, sourcing fournisseurs.
- **BET** (bureaux d'études techniques) : analyse technique, documentation, contrôle de conformité.

### Fournisseur
Assistant commercial : création de fiches produits, optimisation des descriptions, analyse des ventes, anticipation des besoins.
Exemple : *"Votre produit est recherché par 250 professionnels cette semaine. Une campagne ciblée pourrait augmenter vos demandes."*

## 6. KAi proactive

Différence structurante par rapport à un assistant réactif : KAi observe en continu et alerte sans attendre d'être sollicitée.

Exemples :
- *"Votre projet n'a aucun professionnel sélectionné. Voulez-vous découvrir les architectes disponibles ?"*
- *"Votre budget risque d'être dépassé selon les dernières estimations."*
- *"Un document obligatoire manque avant la prochaine étape."*

## 7. Mode décisionnel

Séquence fixe en huit étapes, avant toute interaction :

1. Identifier l'utilisateur.
2. Comprendre son objectif.
3. Vérifier ses droits.
4. Chercher les données pertinentes.
5. Analyser.
6. Proposer.
7. Demander confirmation si nécessaire.
8. Exécuter uniquement avec autorisation.

**[OUVERT]** — cette séquence ne précise pas l'issue si l'étape 5 (analyse) n'aboutit pas à une conclusion exploitable, ou si deux acteurs sont en désaccord sans solution équilibrée possible. Comportement à définir : escalade vers un humain ? Réponse d'incertitude explicite ? Non tranché — voir section 17.

## 8. Paliers de service — KAi Standard / KAi Pro

L'existence de paliers a été confirmée par l'interface (tag affiché : "KAi Standard", avec transition prévue vers "KAi Pro"). **[OUVERT]** — aucune information n'a été fournie sur ce qui différencie fonctionnellement les deux paliers (fonctionnalités, limites d'usage, tarification, accès aux modules). Ne pas inventer de grille de différenciation tant que ces éléments ne sont pas communiqués. Voir section 17.

---

# Partie B — Design system

## 9. Identité visuelle et tokens

Principe directeur : design plat, sans dégradé, sans ombre portée, bordures fines uniquement. Le mark "K" reste abstrait (pas de visage / avatar humain littéral — décision validée).

### Couleurs de marque (valeurs fixes, indépendantes du mode clair/sombre de l'hôte)

| Token | Valeur | Usage |
|---|---|---|
| `--kai-avatar-bg` | `#15121F` | Fond de l'avatar (toutes tailles, tous états) |
| `--kai-accent` | `#9086E8` | Lettre "K", anneau d'attention, badge enveloppe, icône étincelle |
| `--kai-success` | `#2F9E5B` | Point de présence, anneau de confirmation (projet terminé), coche d'achat, confirmation d'action exécutée |
| `--kai-pro-bg` | `#EEEDFE` | Fond du tag "KAi Pro" |
| `--kai-pro-text` | `#3C3489` | Texte du tag "KAi Pro" |
| `--kai-on-dark` | `#F5F4FC` | Texte sur bouton/fond sombre |

Règle de sens : chaque couleur ne porte qu'une seule signification dans tout le système. Le vert = confirmation/succès uniquement. Le violet = identité/marque et signal d'attention uniquement. Ne jamais réutiliser le rouge pour un signal KAi (le rouge reste réservé aux erreurs système génériques, hors périmètre KAi).

### Layout

| Token | Valeur |
|---|---|
| Rayon des cartes | `12px` |
| Rayon des pilules / chips | `999px` |
| Rayon des contrôles (boutons, input) | `8px` |
| Bordure par défaut | `0.5px solid` (couleur hairline de l'hôte) |
| Anneau de bord de l'avatar | `1px solid rgba(255,255,255,0.08)` — garantit la lisibilité du mark sur fond clair ou sombre |
| Ombres | Aucune, nulle part |

### Tailles d'avatar — deux seulement

| Contexte | Taille |
|---|---|
| Autonome (pastille repliée) | `36px` |
| En ligne avec du texte (bulle, panneau, cartes d'événement) | `28px` |

Ne pas introduire de taille intermédiaire.

## 10. États et composants d'interface

### 10.1 Pastille repliée (état par défaut)
Avatar 36px + libellé "KAi" (gras) + sous-titre "Assistant personnel IA". Point de présence vert permanent en bas à droite de l'avatar.

### 10.2 Pastille "attention" (recommandation en attente)
Identique à 10.1, avec un anneau violet qui s'étend en continu autour de l'avatar (`kai-ping`), en plus du point vert (les deux signaux coexistent : disponible + a quelque chose à signaler).

### 10.3 Indicateur de réflexion
Carte avec avatar 28px + trois points qui rebondissent en cascade. État autonome, ne se transforme pas automatiquement en message (cf. décision de conception : garder cet état séparé, ne pas le fusionner avec l'arrivée du message).

### 10.4 Arrivée de message (enveloppe)
Badge circulaire violet avec icône enveloppe fermée qui apparaît sur l'avatar (scale-in avec rebond), bascule vers l'icône enveloppe ouverte, puis disparaît en révélant le contenu du message (représenté par des barres de texte qui se déploient — le contenu réel n'est jamais un texte inventé côté design system).

### 10.5 Bulle de suggestion proactive
Avatar 28px + message court + bouton de fermeture + un bouton d'action unique correspondant à la recommandation (ex. "Résumé projet"). Clic sur le bouton : icône devient une coche verte, bordure et texte du bouton passent au vert, retour à l'état initial après 1,6s (représente l'étape 8 du mode décisionnel : exécution après autorisation).

### 10.6 Panneau étendu
En-tête (avatar, nom, sous-titre, fermeture) + salutation personnalisée par prénom + ligne d'identité + invite à l'action + champ de saisie libre (icône d'envoi qui devient accent violet dès que du texte est saisi) + quatre raccourcis fixes avec icône (Mon projet / Mes décisions / Budget / Trouver un pro, retour visuel bref au clic) + pied de panneau (historique des discussions récentes + tag de palier de service).

### 10.7 Cartes d'événement produit
Trois événements couverts, même gabarit de carte, comportement rejouable au clic (icône de rejeu visible au survol) :
- **Projet terminé** — badge circulaire vert avec coche + anneau qui s'expand une fois.
- **Achat marketplace confirmé** — icône panier qui vibre légèrement puis coche verte qui apparaît en coin.
- **Passage Standard → Pro** — le tag change de fond et de texte (crossfade), une icône étincelle apparaît après la transition.

## 11. Système d'animation — principes

Deux catégories strictement séparées, ne jamais les mélanger :

1. **États ambiants** (boucle infinie, silencieuse, jamais déclenchée par une action) : respiration de l'avatar, pulsation du point de présence, anneau d'attention, points de réflexion. Représentent un état permanent de la plateforme, pas un événement.
2. **États événementiels** (jouent une fois, sur déclenchement) : arrivée de message, confirmation d'action, projet terminé, achat confirmé, changement de palier. Rejouables manuellement (clic), jamais en boucle automatique.

Principe de vivacité (voir section 12) : une boucle parfaitement régulière est perçue comme mécanique. La vivacité vient de la variation et de l'aléatoire dans le timing, pas de la répétition seule.

## 12. Comportement idle ("vivant")

L'avatar au repos (contexte pastille repliée, toute variante) doit exécuter, en plus de sa respiration continue, des micro-gestes aléatoires qui ne se répètent pas selon un rythme fixe.

Trois gestes, tirés aléatoirement, jamais combinés simultanément :

| Geste | Effet | Élément ciblé | Durée |
|---|---|---|---|
| Nod | Rotation légère du cercle entier | Conteneur avatar (wrapper) | 0,55s |
| Glance | Décalage horizontal de 2px | Lettre "K" uniquement | 0,5s |
| Blink | Chute d'opacité brève | Lettre "K" uniquement | 0,45s |

Le geste "nod" s'applique sur un élément wrapper distinct de celui qui porte l'animation de respiration (évite un conflit de propriété `transform` entre les deux animations CSS).

Planification : intervalle aléatoire entre chaque geste, tiré entre 2,6s et 6,8s. Pondération observée en test : ~40 % nod, ~35 % glance, ~25 % blink.

## 13. Catalogue d'icônes (Tabler, style outline uniquement)

| Icône | Usage |
|---|---|
| `ti-mail` / `ti-mail-opened` | Arrivée de message (fermée → ouverte) |
| `ti-check` | Confirmation (projet terminé, achat, action exécutée) |
| `ti-shopping-bag` | Achat marketplace |
| `ti-sparkles` | Upgrade de palier |
| `ti-building` | Raccourci "Mon projet" |
| `ti-list-check` | Raccourci "Mes décisions" |
| `ti-wallet` | Raccourci "Budget" |
| `ti-users` | Raccourci "Trouver un pro" |
| `ti-clock` | Historique des discussions |
| `ti-send` | Envoi dans le champ de saisie |
| `ti-x` | Fermeture |
| `ti-refresh` | Affordance de rejeu sur les cartes événementielles |

---

# Partie C — Implémentation

## 14. Structure de composants suggérée

```
KAi/
├─ KaiAvatar (props: size: 36|28, state: idle|thinking, showDot, showPing)
├─ KaiPill (collapsed widget — wraps KaiAvatar)
├─ KaiThinkingCard
├─ KaiMessageArrival (envelope → skeleton sequence)
├─ KaiSuggestionBubble (message + action button)
├─ KaiPanel (header + greeting + input + quick actions + footer)
├─ KaiQuickAction (chip: icon + label)
├─ KaiEventCard (variant: projectDone | purchaseConfirmed | tierUpgrade)
└─ KaiIdleScheduler (hook/service — attache les micro-gestes à un KaiAvatar au repos)
```

## 15. Spécifications techniques de référence

Les valeurs ci-dessous sont celles validées visuellement pendant la conception ; à utiliser telles quelles pour l'implémentation, pas comme point de départ à réinterpréter.

### Animations ambiantes (CSS)

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

### Animations événementielles (CSS)

```css
@keyframes kai-ring1 { 0% { transform: scale(.8); opacity: .8; } 100% { transform: scale(1.7); opacity: 0; } }
/* anneau vert one-shot (projet terminé), .9s cubic-bezier(0,0,.2,1), iteration-count: 1 */

@keyframes kai-wobble { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-8deg); } 75% { transform: rotate(8deg); } }
/* panier achat, .5s ease-in-out, iteration-count: 1 */
```

### Micro-gestes idle (CSS)

```css
@keyframes kai-nod { 0%,100% { transform: rotate(0); } 30% { transform: rotate(-5deg); } 65% { transform: rotate(4deg); } }
/* .55s ease-in-out, appliqué au wrapper de l'avatar (pas à l'élément qui respire) */

@keyframes kai-glance { 0%,100% { transform: translateX(0); } 30% { transform: translateX(-2px); } 65% { transform: translateX(2px); } }
/* .5s ease-in-out, appliqué à la lettre "K" uniquement */

@keyframes kai-blink { 0%,100% { opacity: 1; } 50% { opacity: .3; } }
/* .45s ease-in-out, appliqué à la lettre "K" uniquement */
```

### Scheduler idle (JS, logique de référence)

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

### Séquences événementielles (timing exact)

**Arrivée de message (enveloppe)**
1. `t=0` — badge enveloppe fermée : scale-in avec rebond (`cubic-bezier(.34,1.56,.64,1)`, .35s)
2. `t=550ms` — icône bascule vers enveloppe ouverte
3. `t=1000ms` — badge disparaît (fade .3s) pendant que le contenu (barres) apparaît (fade + slide .35s)

**Projet terminé**
1. `t=0` — anneau vert one-shot (.9s) + badge coche : scale-in avec rebond (.4s), simultanés

**Achat confirmé**
1. `t=0` — icône panier : wobble (.5s)
2. `t=400ms` — badge coche : scale-in avec rebond (.3s)

**Passage Standard → Pro**
1. `t=0` — état initial (fond neutre, texte "KAi Standard")
2. `t=500ms` — crossfade texte (.3s) + transition fond/couleur (.35s) vers état Pro
3. `t=850ms` — icône étincelle : scale-in avec rebond (.3s)

**Confirmation d'action (bouton, ex. "Résumé projet")**
1. Au clic — icône devient coche verte, bordure/texte du bouton passent au vert (immédiat)
2. `t=1600ms` — retour à l'état initial

**Retour de sélection (chips de raccourcis)**
1. Au clic — classe "active" (fond accent) ajoutée
2. `t=600ms` — classe retirée

## 16. Accessibilité

Points à couvrir en implémentation (ajout par bonnes pratiques standard, non issu des échanges de conception — signalé comme tel, à valider par l'équipe) :

- Respecter `prefers-reduced-motion` : désactiver ou réduire drastiquement les animations ambiantes et les micro-gestes idle pour les utilisateurs qui l'ont activé au niveau système. Les animations événementielles fonctionnelles (confirmation d'action) peuvent être conservées sous forme de changement d'état instantané sans transition.
- Toutes les icônes décoratives (`ti-x`, `ti-check`, etc. quand elles accompagnent un texte) : `aria-hidden="true"`.
- Icônes seules porteuses de sens (bouton de fermeture, bouton d'envoi) : `aria-label` explicite.
- Contraste : `#9086E8` sur `#15121F` et `#F5F4FC` sur `#15121F` à vérifier au ratio WCAG AA minimum (à contrôler avec l'outil de contraste final, pas garanti par la présente spec).

## 17. Points ouverts / non résolus

À ne pas combler par supposition — à faire trancher par le produit avant développement final.

1. **Mode décisionnel, étape 5 (section 7)** : comportement non défini si l'analyse n'aboutit pas à une conclusion exploitable, ou si deux acteurs sont en désaccord sans solution équilibrée. Escalade humaine ? Réponse d'incertitude type ? À définir.
2. **Paliers Standard / Pro (section 8)** : l'existence de deux paliers est confirmée visuellement, mais aucune information sur leur différenciation fonctionnelle (fonctionnalités, limites, tarif) n'a été communiquée.
3. **Cohérence des formulations d'identité** : la vision métier (section 1) décrit KAi par "comprendre, analyser, accompagner, anticiper" ; la baseline affichée dans le panneau (section 10.6) est "piloter, décider, exécuter vos actions". Les deux formulations coexistent sans qu'il ait été précisé si elles doivent être harmonisées ou si elles servent des registres différents (vision stratégique vs. promesse UI).
4. **Fréquence des micro-gestes idle (section 12)** : la valeur 2,6–6,8s est celle testée, jamais validée comme définitive — à confirmer ou ajuster après retour utilisateur.

## 18. Glossaire

| Terme | Définition |
|---|---|
| KAi | Intelligence artificielle centrale de l'écosystème MEEREO |
| MEEREO | La plateforme / écosystème hébergeant KAi |
| QUOREX | Moteur d'orchestration qui connecte l'intelligence conversationnelle aux données MEEREO et décide de la réponse à apporter |
| BET | Bureau d'études techniques |
| Maître d'ouvrage | Le client, porteur du projet immobilier/construction |
