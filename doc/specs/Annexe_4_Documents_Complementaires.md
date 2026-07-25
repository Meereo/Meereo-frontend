# ANNEXE 4 — Documents complémentaires : contrôle de cohérence

> Retour au [sommaire](00_INDEX.md)

**Ajouté :** v1.27. Les quatre documents ci-dessous, référencés depuis le corps du présent référentiel, ont été lus intégralement et vérifiés ligne à ligne contre lui.

| Document | Rôle | Cohérence constatée |
|---|---|---|
| `MEEREO_Doctrine_Flux_Financiers.md` (v1.3) | Doctrine détaillée derrière `FIN-01` : registre de traçabilité, pas de comptabilité, client passif, statuts de paiement, avenants. | Cohérent avec `FIN-01`/D1-D12. Assume et signale explicitement l'affaiblissement de la traçabilité inaltérable sur les gros marchés tant que `SYS-01`/D10 n'est pas réactivé — cohérent avec le journal v1.10. |
| `MEEREO_Lot_Correction.md` | Version détaillée, avec critères de vérification cochables, des 6 anomalies déjà résumées dans le corps (`NAV-05`, `NAV-06`, `MSG-04`, `MKT-01`, `SYS-06`, `INS-01`/`INS-04`). | Cohérent. N'introduit aucun code absent du corps du référentiel — apporte des checklists de test que le corps n'a pas. |
| `MEEREO_Questions_Juriste_Paiement.md` | 41 questions (vérifiées : 7+7+5+7 en partie A, 6+6+3 en partie B = 41) dérivées des décisions déjà actées (`AOF-01`, `SYS-02`, `FIN-02`, `FIN-03`), sans y répondre. | Cohérent. Daté « base v1.16 » — antérieur aux dernières décisions (v1.17-v1.26), mais aucune des questions posées n'est invalidée par les décisions prises depuis ; à relire par le juriste en connaissance de la v1.27. |
| `MEEREO_SYS-02_Matrice_Droits.md` | Détail complet de `SYS-02` : 5 rôles de plateforme × objets × 4 actions, + second niveau de rôles internes à l'entreprise. | Cohérent avec le corps et avec `PRJ-05`/I3, `MSG-07`, `FIN-01`/D6. La Note G (« pas de paiement intégré ») est correctement **limitée à l'objet Paiement de marché** (`FIN-01`/D1, déclaratif) — elle ne contredit pas `FIN-02` (Mobile Money réellement intégré pour KAi Pro et petits achats), qui porte sur d'autres objets. |

**Une incohérence relevée (mineure, dans un des quatre documents, pas dans ce référentiel) :**

- `MEEREO_Grille_Tarifaire.md` — l'encart de statut en tête de document présente encore **« l'unique prix déjà fixé par MEEREO (KAi Pro à 9 900 FCFA/mois) »** au singulier, alors que la section 5 du même document (et `FIN-02`/v1.25 de ce référentiel) donnent **trois tarifs actés par rôle** (9 900 / 19 900 / 39 000 FCFA). C'est un résidu de rédaction antérieur à la différenciation par rôle (v1.25), non mis à jour dans l'encart d'introduction. **Correction suggérée :** mettre à jour cette phrase dans `MEEREO_Grille_Tarifaire.md` pour refléter les trois tarifs — ne change aucune décision, corrige uniquement une phrase devenue inexacte.
