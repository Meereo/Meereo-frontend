# ⚠️ ERRATUM — À LIRE AVANT DE REPRENDRE LE DOSSIER

**28 juillet 2026** · **Ce dossier remplace intégralement celui qui vous a déjà été transmis.**

> **Deux défauts ont été trouvés dans la version que vous avez reçue.** L'un empêchait purement et
> simplement de terminer deux des trois parcours. Ils sont corrigés ici.
>
> **Ne travaillez plus sur l'ancienne version.** Le seul fichier concerné est
> `01-Onboarding/04-Prototype-parcours-v4.html` — les autres documents étaient corrects.

---

## Défaut 1 — 🔴 Le parcours ne pouvait pas être terminé

**Symptôme.** Sur les écrans **« Votre entreprise »** des parcours **Professionnel** et
**Fournisseur**, le bouton **« Continuer » restait désactivé quoi qu'on saisisse.** Aucun message
d'erreur, aucune indication : le parcours s'arrêtait là.

**Cause.** Trois constantes étaient **utilisées mais jamais définies** :

```js
const RCCM_RE = /^CI-ABJ-\d{4}-[A-Z]-\d{4,6}$/;
const TAX_RE  = /^CI-\d{7}-[A-Z]$/;
const TAKEN   = ['CI-ABJ-2024-B-99999'];
```

Elles étaient passées en argument à `checkLegal()`. À la première frappe dans le champ RCCM,
JavaScript levait une `ReferenceError` : la fonction `syncNext()` n'était jamais atteinte, et le
bouton restait désactivé **définitivement**.

> **Origine, et elle m'appartient.** En supprimant la fonction `buildReco()` — devenue inutile après
> le retrait de l'étape « projet » du client — j'ai découpé le code **jusqu'à la fonction suivante**.
> Les trois constantes se trouvaient **entre les deux** et ont disparu avec.
>
> **Pourquoi mes vérifications ne l'ont pas vu.** J'avais contrôlé que la syntaxe était valide, que
> toutes les fonctions appelées existaient et que tous les identifiants HTML étaient présents. Les
> trois éléments manquants n'étaient **ni des fonctions ni des identifiants** : des variables passées
> en argument. **Aucun de mes contrôles ne portait dessus.**

**Correction.** Les trois constantes sont restaurées, à leur place d'origine, avec un commentaire
expliquant pourquoi elles ne doivent plus être déplacées.

**Vérification.** Les trois parcours ont été **exécutés de bout en bout dans un vrai navigateur**
*(jsdom)*, pas relus :

| Parcours | Chemin vérifié |
|---|---|
| **Client** | rôle → compte → **terminé** |
| **Professionnel** | rôle → compte → entreprise → logo → **terminé** |
| **Fournisseur** | rôle → compte → entreprise → logo → **encaissement** → produit → **terminé** |

À chaque étape, le test vérifie que le bouton s'active réellement et que l'écran attendu s'affiche.
**Aucune erreur JavaScript n'est levée.**

---

## Défaut 2 — Sous-titre illisible sur l'écran final du client

**Symptôme.** Sur « Et maintenant ? », le sous-titre du bouton **« Publier un appel d'offres »**
s'affichait en **violet sur fond orange** — illisible.

**Cause.** Une règle `#rc-main .sub{color:var(--kai-accent)}` datait de l'époque où ce bouton portait
« Recommandé par KAi » sur fond noir. **Le violet signalait alors KAi, et c'était juste.** La
recommandation a été retirée, le bouton a pris la couleur du rôle — la règle est restée.

**Correction.** Règle supprimée : le sous-titre reprend le style commun, blanc à 70 %.

> **Ce défaut illustre une règle utile pour la suite :** quand on retire une fonctionnalité, **le CSS
> qui la servait survit silencieusement.** Il ne casse rien, il ne lève aucune erreur — il attend
> simplement le moment où le contexte change pour devenir absurde.

---

## Ce qui n'a pas changé

**Tout le reste du dossier est inchangé** : le dossier d'intégration, la fiche d'exécution, le code
testé, la spécification KAi et le référentiel. **Les treize décisions du prototype, le schéma en
réseau et les quatorze animations sont identiques.**

---

## Une leçon de méthode, pour vos propres vérifications

**Une page HTML dont la syntaxe est valide et dont toutes les fonctions existent peut être totalement
inutilisable.** Les trois contrôles qui auraient trouvé ce défaut, et que je fais désormais :

1. **Toute variable utilisée est-elle définie ?** — pas seulement les fonctions et les identifiants ;
2. **Le parcours va-t-il jusqu'au bout ?** — exécuté, pas relu ;
3. **Après avoir supprimé du code, que reste-t-il qui ne sert plus ?** — CSS et constantes orphelines.

*Le premier aurait suffi. Il coûte trois lignes.*
