# G. QUALITÉ TRANSVERSE

> Retour au [sommaire](00_INDEX.md)

---

## `QAL-01` — Optimisation générale des performances
**Statut : À DÉVELOPPER**

Optimisation globale de l'architecture, pour une expérience proche du natif.

**Performances :** temps de chargement, requêtes API/BD, réduction des appels inutiles, optimisation médias, cache intelligent, lazy loading.
**Fluidité :** aucune impression de blocage ou de rechargement inutile (transitions, modules, onglets, recherches, mises à jour instantanés).
**Temps réel :** messagerie, notifications, projets, documents, images, notes, appels d'offres synchronisés immédiatement.
**Compatibilité :** identique sur Safari, Chrome, Edge, Firefox.
**Stabilité :** aucune déconnexion intempestive, perte de données, redirection involontaire, rechargement injustifié, ou souci de cache.

---

## `QAL-02` — Source unique et affichage universel du logo d'entreprise
**Statut : À CORRIGER + RÈGLE**

**Bug actuel :** logos des entreprises mal affichés, notamment côté **profil Client** ; absents de plusieurs sections. Nuit à l'identification et à la cohérence visuelle.

Ce point pose la **règle transverse** qui unifie les occurrences locales (`ANN-02`, `MSG-02`, `NAV-04`) : régler à la **source**, pas écran par écran.

**Principe de source unique :**

- logo **récupéré automatiquement** depuis le **profil professionnel** (logo officiel unique `INS-02`) ;
- **toutes** les interfaces utilisent **une seule source** ; aucune copie/recalcul local ;
- toute **modification** du logo **répercutée automatiquement** partout, sans décalage.

**Visible impérativement dans :** projets du client, appels d'offres, résultats de recherche, annuaire, conversations/messagerie (entreprise identifiée), fiches pro, notifications, **toute** section où une entreprise apparaît.

**Absence de logo :** même **placeholder unique** partout (initiales / icône générique), jamais d'image cassée.

> **Cohérence architecturale :** même principe de **source unique centralisée** que `AVS-01` (avis) et `INS-04` (statut vérifié). Ces trois données — logo, avis, badge — proviennent d'un **référentiel unique** attaché au profil professionnel.
> **Complément technique (v1.27) :** hypothèses de cause (récupération indépendante par composant, copie dénormalisée obsolète, cache non invalidé) et protocole de vérification en **[Annexe 3, section A3.3](Annexe_3_Diagnostic_Technique.md#a33--qal-02--logo-source-unique)**.

---

## `QAL-03` — Correction orthographique et grammaticale
**Statut : À CORRIGER**

Correction linguistique complète des textes visibles : libellés d'interface ; messages d'erreur/système ; notifications (in-app, email, SMS) ; popups et confirmations ; contenus générés par l'IA ; emails transactionnels ; contenus statiques (légal, CGU, aide, FAQ) ; pages publiques générées.

Couvre orthographe, grammaire, conjugaison, ponctuation et **cohérence terminologique** (mêmes termes pour mêmes concepts). Relecture systématique recommandée (CI ou relecture avant mise en production).

> **Note :** la liste précise des fautes (captures, pages, champs) sera fournie séparément par MEEREO.
