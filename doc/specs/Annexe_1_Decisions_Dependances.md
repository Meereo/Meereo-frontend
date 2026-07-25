# ANNEXE 1 — Décisions à trancher & dépendances

> Retour au [sommaire](00_INDEX.md)

---

## À trancher avant développement

**Aucun point fonctionnel ne reste ouvert.** Les derniers arbitrages ont été tranchés en v1.26 (voir [journal](Annexe_2_Journal_Versions.md)). Ne subsistent que :

- des **décisions business chiffrées** — montants du quota, des ventes flash, du sponsoring et de l'abonnement fournisseur (`MEEREO_Grille_Tarifaire.md`, à valider par le terrain) ;
- des **validations professionnelles** — 5 sujets à faire arbitrer par un juriste et un expert paiement avant mise en ligne (`MEEREO_Questions_Juriste_Paiement.md`).

*Historique des points résolus :* `MSG-01` (bouton contact, v1.16) · `FIN-01` (phases, dépassement de budget, v1.26) · `NAV-05` (points d'entrée Paramètres, v1.26) · `MKT-01` (produit impayé, périmètre services, v1.26) · `AVS-03` (factures impayées, v1.26) · `SYS-04` (multilingue, v1.15).

---

## Dépendances (à traiter ensemble)

- `NAV-01` + `NAV-02` + `NAV-03` — cause racine commune (session/routing/état front). Investigation unique.
- `ANN-01` + `ANN-02` + `ANN-04` — même module annuaire. Même sprint.
- `MSG-02` + `MSG-05` — l'architecture temps réel des appels dépend de la refonte messagerie.
- `MSG-02` + `MSG-03` + `MSG-04` + `MSG-06` + `AVS-02` — même système d'état de messagerie (lu/non-lu, conversation unique, création instantanée, compteurs). Chantier temps réel unique.
- `INS-01` → `INS-04` — le badge dépend de la vérification IA du RCCM.
- `AVS-03` → `MSG-04` — la conversation unique s'appuie sur les UUID.
- `PRJ-01` + `PRJ-05` + `PRJ-06` + `AVS-01` — chaîne projet → équipe → avis. À traiter de bout en bout.
- `ANN-03` + `AVS-02` — la notification de la Bourse s'appuie sur le système global de notifications.

---

## Fil rouge architectural (le plus important)

- `INS-04` + `AVS-01` + `QAL-02` — **statut vérifié, avis, logo** doivent provenir d'un **référentiel centralisé unique** consulté par toutes les interfaces. La majorité des bugs d'incohérence (logos manquants, étoiles divergentes, badge absent selon les pages) viennent de la **même cause** : des calculs/copies locaux par écran au lieu d'une source partagée.

---

# CONCLUSION

Les développements respecteront : cohérence entre profils ; synchronisation temps réel ; respect strict des workflows métier ; performance ; sécurité et gestion des droits ; qualité rédactionnelle ; UX fluide et homogène multi-navigateurs.

Chaque module (**Cockpit Projet, Annuaire, CRM, Messagerie, Appels d'offres, IA KAI, Gestion documentaire, Page professionnelle publique**) doit fonctionner de manière **intégrée et transparente**.
