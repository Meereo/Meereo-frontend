# KAi — ÉTAT DE L'IMPLÉMENTATION

## Ce que le prototype fait, ce que la spécification demande, et l'écart entre les deux

**28 juillet 2026** · À lire avec `01-Specification-KAi-animations.md`

> **Ce document n'ajoute aucune règle.** La spécification du 22 juillet fait foi et se suffit à
> elle-même. Ce document dit seulement **où en est le code**.

---

## 1. Implémenté et conforme

| Animation | Rôle | Valeur |
|---|---|---|
| Respiration de l'avatar | Ambiante | `3.6s ease-in-out infinite` |
| Anneau d'attention | Ambiante | `3.6s ease-in-out infinite` |
| Pulsation du point de présence | Ambiante | `2.2s ease-in-out infinite` |
| Micro-gestes — nod · glance · blink | Ponctuelle, tirée au sort | `.55s` · `.5s` · `.45s` |
| Planificateur idle | — | **2,6 – 6,8 s**, pondération **40 / 35 / 25** |
| Garde `prefers-reduced-motion` | — | Le planificateur ne démarre pas |

*Fichier `04-kai-idle-scheduler.js`, reprenable tel quel.*

---

## 2. 🔴 Trois valeurs divergent de la spécification

| Élément | Spécification | Prototype | Écart |
|---|---|---|---|
| Respiration | `scale(1.025)` | `scale(1.045)` | **+80 % d'amplitude** |
| Pulsation du point | `scale(1.2)` | `scale(1.25)` | +25 % |
| Nommage | `kai-breathe` | `kaiBreathe` | Convention |

> La spécification est explicite : *« les valeurs ci-dessous ont été validées visuellement pendant la
> conception. Elles sont à utiliser telles quelles, pas comme point de départ à réinterpréter. »*
>
> **Ce sont donc les valeurs de la spécification qui l'emportent**, sauf décision contraire de MEEREO.
> L'écart sur la respiration n'est pas cosmétique : à `1.045`, sur une boucle permanente, cela se
> remarque et peut fatiguer.

**Sur le nommage :** choisir une convention, mais **pas les deux dans la même base** — c'est ainsi
qu'on se retrouve avec deux animations qui font la même chose.

---

## 3. 🔴 Six séquences événementielles n'existent pas

| Séquence | État |
|---|---|
| Arrivée de message | **Absente** |
| Projet terminé | **Absente** |
| Achat marketplace confirmé | **Absente** |
| Passage Standard → Pro | **Absente** |
| Confirmation d'action | **Absente** |
| Retour de sélection | **Absente** |

> **C'est normal :** le prototype couvre l'**inscription**, où aucun de ces événements ne survient.
> **Mais il ne peut donc pas servir de référence pour elles** — à écrire depuis la spécification, qui
> donne leur timing au détail près.

**Deux ambiantes manquent aussi** : `kai-ping` et `kai-bounce` *(points de réflexion)*.

---

## 4. Le lien avec le défaut de production

`QAL-05` constate qu'**aucune animation ne fonctionne** sur `dev.meereo.com`.

> **L'hypothèse prioritaire se teste en trente secondes :** une règle globale
> `@media (prefers-reduced-motion: reduce) { * { animation: none !important } }` **éteint tout d'un
> coup** dès que le réglage système est actif. Cela expliquerait exactement le symptôme — non pas
> « telle animation est cassée », mais « **aucune** ne marche ».
>
> **Vérifier cela avant d'auditer les animations une par une.**

**Si l'hypothèse se confirme, ne retirez pas le support de `prefers-reduced-motion`** — c'est une
exigence légitime. Le fichier CSS montre la forme correcte : **on nomme les animations à désactiver,
on n'écrit pas une règle universelle.**

---

## 5. Contenu de ce sous-dossier

| Fichier | Contenu |
|---|---|
| `01-Specification-KAi-animations.md` | **La spécification — elle fait foi** |
| `02-Etat-implementation-v4.md` | Ce document |
| `03-kai-animations.css` | Les 14 keyframes du prototype et leurs déclencheurs |
| `04-kai-idle-scheduler.js` | Le planificateur de micro-gestes |

---

## 6. Deux points laissés ouverts par la spécification

Elle demande de **ne pas les combler par supposition** : la fourchette **2,6 – 6,8 s** et la
pondération **40 / 35 / 25** sont *« testées mais non validées »* ; la section **accessibilité** est un
ajout *« à valider par l'équipe »*. **Aucun des deux ne bloque l'intégration.**
