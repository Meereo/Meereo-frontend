# I. CYCLE APPEL D'OFFRES & MARCHÉS

> Retour au [sommaire](00_INDEX.md)

> **Comblé lors de l'audit v1.2.** Ce domaine décrit le **cœur transactionnel** de la plateforme, jusque-là absent : comment une intention client devient un marché signé. Il relie `ANN-03` (Bourse), `AVS-01` (avis en fin de mission) et `FIN-01` (le marché = objet financier).

---

## `AOF-01` — Cycle de vie complet appel d'offres → marché
**Statut : CADRÉ — DÉVELOPPABLE**

### Décisions de cadrage (socle du cycle)

- **A1 — Émetteurs.** Peuvent publier un AO : le **Client** et le **Professionnel**. Un pro publie un AO pour **sous-traiter** (relation pro→pro), régie par **exactement les mêmes règles** que client→pro. Un même pro est donc tour à tour émetteur (il cherche des sous-traitants) et répondeur (il répond aux AO).
- **A2 — Types.** Deux types coexistent : **Public** (diffusé dans la Bourse `ANN-03` aux pros du bon secteur) et **Privé** (ciblé sur des entreprises choisies dans l'annuaire, `ANN-01`). L'émetteur choisit à la publication.
- **A3 — Portée : globale.** Un AO porte sur **tout le projet**. Le lauréat est une **entreprise générale** qui prend l'ensemble (1 marché global). Le découpage en phases/corps d'état (`FIN-01`) devient **interne à cette entreprise**, qui sous-traite le cas échéant via ses propres AO (A1). Le client conserve **un interlocuteur unique**.
- **A6 — Acceptation = marché signé.** L'acceptation d'une offre par le client **crée directement le marché** (objet unique « Marchés », `FIN-01`). **Règle explicite : l'offre déposée vaut engagement du professionnel ; l'acceptation par le client scelle le marché sans re-signature.** Pas d'étape de contre-signature.
- **A8 — Fermeture.** Un AO se **ferme automatiquement** dès qu'une offre est acceptée.

### Flux de bout en bout

1. **Publication.** L'émetteur (client ou pro) publie l'AO : objet du projet, budget indicatif, localisation, délai, pièces jointes, type (public/privé). Alimenté par les données déjà connues (aiguillage KAi à l'inscription) — **pas de double saisie** (`D10`/SSOT).
2. **Diffusion.** Public → Bourse (`ANN-03`) ; Privé → entreprises ciblées (`ANN-01`). Notification aux pros concernés (`AVS-02`).
3. **Réponse.** Les pros déposent une **offre** (`AOF-03`).
4. **Comparaison.** L'émetteur consulte et compare les offres reçues (`AOF-02`).
5. **Sélection.** L'émetteur **accepte une offre** → les autres sont **refusées et notifiées automatiquement** (A5/A7) ; l'AO se ferme (A8).
6. **Marché.** L'acceptation crée le **marché signé** (A6) → crée le projet côté lauréat (`PRJ-01`) → devient l'objet financier de référence (`FIN-01`).

**Historisation :** chaque étape (publication, offre, modification d'offre, acceptation, refus, fermeture) est **historisée, jamais écrasée** (doctrine `D10`).

> **Dépendances :** `ANN-01`, `ANN-03`, `PRJ-01`, `FIN-01`, `AVS-02`, `SYS-02` (droits émetteur/répondeur).

---

## `AOF-02` — Offres reçues & comparaison (côté émetteur)
**Statut : CADRÉ — DÉVELOPPABLE**

L'émetteur (client, ou pro en sous-traitance) dispose d'une vue **« Offres reçues »** pour comparer les propositions d'un même AO. Chaque offre affiche : **montant, délai, note méthodologique, pièces jointes** (A4), ainsi que la **note/avis** du pro (`AVS-01`) et son **badge vérifié** (`INS-04`).

**Actions :**
- **Accepter** une offre (A5) → déclenche `AOF-01` étape 6 ; refuse et notifie automatiquement les autres (A7) ; ferme l'AO (A8).
- **Demander une précision** → ouvre la **conversation unique** avec le pro (`MSG-04`), sans quitter le contexte de l'AO.

Une seule offre peut être acceptée par AO (portée globale, A3).

---

## `AOF-03` — Réponse d'un professionnel à un appel d'offres
**Statut : CADRÉ — DÉVELOPPABLE**

Depuis la Bourse (`ANN-03`) ou une invitation privée, le pro dépose une **offre** contenant : **montant proposé, délai, note méthodologique, pièces jointes** (A4).

- **A9 — Modification/retrait.** Le pro peut **modifier ou retirer son offre tant qu'elle n'a pas été acceptée**. Une fois l'offre acceptée (marché scellé, A6), elle devient ferme et l'engage.
- Le pro **suit l'état** de ses offres dans son espace (« Offres ») : envoyée → vue → acceptée / refusée. Le refus est notifié automatiquement (A7).

> **Note d'engagement :** déposer une offre vaut engagement du pro sur les termes proposés (A6). Le pro doit en être clairement informé au moment du dépôt (mention explicite dans l'UI).
