# AUDIT — Deuxième passe : écarts supplémentaires détectés

**Date :** 23 juillet 2026  
**Base :** relecture intégrale de `MEEREO_Specifications_v1.27.md` croisée avec 32 vérifications ciblées dans le code  
**Complète :** `AUDIT_Codebase_vs_Specs_v1.27.md` (première passe) + `corrections-appliquees.md` (corrections déjà faites)

---

## RÉSUMÉ : 20 nouveaux écarts identifiés

| Sévérité | Nombre |
|----------|--------|
| 🔴 CRITIQUE (bloque le fonctionnement ou la sécurité) | 5 |
| 🟠 ÉLEVÉ (divergence significative avec la spec) | 8 |
| 🟡 MOYEN (manque mineur, raffinement) | 5 |
| ✅ Points vérifiés conformes | 12 |

---

# 🔴 CRITIQUES — À corriger avant production

## C1. Bouton « Réinitialiser toutes les données » encore présent
**Spec :** SYS-06 — « DOIT être retiré en production »  
**Code :** `web/src/pages/cockpit/Settings.jsx:400-542`  
**Détail :** Le bouton existe dans l'onglet "Données" du pro. Il efface projets, clients, offres, marchés, messages, documents, équipe, notifications et paramètres. Modal de confirmation avec saisie "RÉINITIALISER".  
**L'audit initial l'avait manqué (confusion avec le fournisseur qui ne l'a pas).**  
**Action :** Supprimer le bloc entier (bouton + modal) ou le conditionner à un flag `IS_DEV`.

---

## C2. Stock produit non décrémenté à la commande
**Spec :** MKT-01 — stock « vivant : décrémente à chaque vente »  
**Code :** `server/src/routes/orders.js:49-109`  
**Détail :** Le champ `stock` existe maintenant dans le schema (corrigé en passe 1), mais la route POST `/api/orders` ne lit NI ne décrémente le stock du produit. Aucune vérification de disponibilité non plus.  
**Action :** Dans orders.js, lors de la création d'une commande : vérifier que `stock >= quantité`, décrémenter le stock via `prisma.product.update({ data: { stock: { decrement: qty } } })`.

---

## C3. Aucune validation de format de fichier à l'upload
**Spec :** SYS-05 — formats autorisés : JPG, PNG, PDF, Word, Excel  
**Code :** `server/src/routes/documents.js:36-45, 219-256`  
**Détail :** `saveFileToDisk()` accepte TOUTE extension (`const ext = path.extname(originalname)`). Aucune vérification MIME type ni extension. Un utilisateur peut uploader des exécutables, DWG, ou tout autre fichier.  
**Action :** Ajouter un filtre d'extensions autorisées (`.jpg`, `.jpeg`, `.png`, `.pdf`, `.doc`, `.docx`, `.xls`, `.xlsx`) + validation MIME type.

---

## C4. Champ `flashDuration` absent du schema Prisma
**Spec :** MKT-01 — ventes flash avec « durée définie (48-72h) »  
**Code :** `server/prisma/schema.prisma` — modèle Product : `flash Boolean`, `flashPrice Float?` mais PAS de `flashDuration`  
**Détail :** Le frontend propose un sélecteur de durée (24h/48h/72h) dans `Supplier.jsx:147-149`, mais la valeur n'est jamais persistée en base.  
**Action :** Ajouter `flashDuration String?` au modèle Product + persister dans les routes products.js POST/PATCH.

---

## C5. Message technique « token manquant » affiché à l'utilisateur
**Spec :** NAV-06 / QAL-03 — « ne JAMAIS afficher un message technique brut »  
**Code :** `server/src/middleware/auth.js:22` → `'Non authentifié — token manquant'`  
**Détail :** Ce message remonte tel quel au frontend qui l'affiche. La spec exige un message clair type « Votre session a expiré, veuillez vous reconnecter » + redirection vers le login.  
**Action :** Côté serveur : remplacer par un message UX-friendly. Côté frontend : intercepteur global des 401 dans `api/client.js` qui redirige vers `/onboarding` avec un toast explicatif.

---

# 🟠 ÉLEVÉS — Divergences significatives

## E1. Avis : création manuelle NON bloquée dans l'éditeur de page
**Spec :** AVS-01 — « l'option de créer/gérer manuellement la section Avis est SUPPRIMÉE de l'éditeur »  
**Code :** `web/src/components/sections-builder/editors/ReviewsEditor.jsx:34-39`  
**Détail :** Le bouton "Ajouter" permet de créer des avis factices manuellement, avec `verified: true` par défaut. Viole directement la spec.  
**Action :** Supprimer le `ReviewsEditor` ou le rendre lecture seule (alimenté uniquement par les vrais avis depuis l'API).

---

## E2. MSG-04 : nommage contextuel des conversations par rôle NON implémenté
**Spec :** MSG-04 — « côté pro : nom du projet seul ; côté client : nom du projet + nom de l'entreprise »  
**Code :** `web/src/pages/cockpit/Messages.jsx:256-258`  
**Détail :** Le code affiche simplement `firstOther?.name || 'Contact'` pour tous les rôles. Aucune logique conditionnelle par rôle.  
**Action :** Ajouter un calcul de libellé basé sur `store.user.type` : si pro → projet seul, si client → projet + entreprise.

---

## E3. MSG-07 G4 : historique masqué avant ajout NON implémenté
**Spec :** MSG-07 — « un intervenant ajouté ne voit QUE les messages postérieurs à son ajout »  
**Code :** `server/src/routes/conversations.js:299-309`  
**Détail :** La requête `findMany` sur les messages ne filtre PAS par `joinedAt` du participant. Tous les messages sont retournés.  
**Action :** Filtrer les messages par `createdAt >= participant.createdAt` (date d'ajout du participant à la conversation).

---

## E4. MSG-02 : fournisseur sans restriction de messagerie
**Spec :** MSG-02 — accès messagerie « uniquement aux relations existantes »  
**Code :** `server/src/routes/conversations.js:134-157`  
**Détail :** La restriction pro→client (projet partagé obligatoire) existe, mais aucune restriction pour le fournisseur. Un fournisseur peut potentiellement contacter n'importe qui.  
**Action :** Ajouter une vérification pour le type `fournisseur` : ne peut contacter que les acheteurs ayant une commande avec lui.

---

## E5. PRJ-02 : suppression de projet non synchronisée en temps réel
**Spec :** PRJ-02 — « toute suppression est SYNCHRONISÉE chez tous les utilisateurs concernés »  
**Code :** `server/src/routes/projects.js:323-332`  
**Détail :** L'endpoint DELETE supprime le projet en base mais n'émet AUCUN événement socket. Les autres participants voient toujours le projet en cache jusqu'au prochain refresh.  
**Action :** Ajouter `io.to('user:{participantId}').emit('project:deleted', { projectId })` pour chaque participant.

---

## E6. SYS-02 : rôle « intervenant sous-traité » absent de la matrice de droits
**Spec :** PRJ-05/I3 + SYS-02 — « l'intervenant sous-traité ne voit RIEN du projet »  
**Code :** `server/src/engines/permissionEngine.js:11-50`  
**Détail :** Les rôles définis sont `PRO_ADMIN, PRO_MEMBER, CLIENT, ARCHITECTE, BET, ENTREPRISE, SUPPLIER`. Aucun rôle `INTERVENANT` ou `SUBCONTRACTOR` n'existe. La règle I3 (accès nul) n'est pas encodée.  
**Action :** Ajouter un rôle `INTERVENANT` à la matrice avec tous les droits projet à `false`, sauf la messagerie (`MSG-07`).

---

## E7. AOF-01 A6 : mention d'engagement absente du formulaire de soumission d'offre
**Spec :** AOF-01 — « le pro doit être clairement informé que déposer une offre vaut engagement »  
**Code :** `web/src/pages/cockpit/Exchange.jsx:988-1094`  
**Détail :** Le bouton "Soumettre l'offre" n'a aucun avertissement, mention légale, ou case à cocher sur l'engagement contractuel.  
**Action :** Ajouter une mention visible avant le bouton, ou une case à cocher obligatoire : « En soumettant cette offre, je m'engage sur les termes proposés. »

---

## E8. PRJ-06 E1 : équipe — deux sources de données séparées
**Spec :** PRJ-06 — « ce ne sont PAS deux listes à synchroniser mais UNE SEULE donnée avec deux interfaces »  
**Code :** Settings.jsx écrit dans `onboardingData.cockpitTeam` ; PageBuilder/TeamEditor écrit dans `pageSections[].members`  
**Détail :** Confirmé par la 2e passe — les deux interfaces écrivent dans des champs différents. Le Settings dit « source de vérité UNIQUE dans cockpitTeam » (commentaire ligne 105), mais le PageBuilder ne s'y réfère pas.  
**Action :** Faire lire et écrire le TeamEditor depuis `cockpitTeam` (via le store), pas depuis les données de section locales.

---

# 🟡 MOYENS — Manques mineurs

## M1. PRJ-03 : notes de chantier non typées
**Spec :** PRJ-07 — notes de type « Validation / Alerte / Information / Blocage »  
**Code :** `schema.prisma` — champ `notes String` simple  
**Action future :** Créer un modèle `ProjectNote` avec un champ `type` enum.

---

## M2. INS-04 : couleur badge pas strictement identique partout
**Spec :** badge « vert, couleur strictement identique partout »  
**Code :** `HeroSection.jsx` utilise `border-pp-ink` (pas vert explicite) ; `ProDirectory.jsx` utilise `rgba(52,199,89,.08)` (vert correct)  
**Action future :** Unifier via une classe CSS `.badge-verified` avec couleur verte unique.

---

## M3. AVS-01 : message « Aucun avis pour le moment » absent
**Spec :** quand 0 avis → « ni note fictive ni étoiles artificielles ; afficher un message explicite »  
**Code :** pas de message explicite trouvé pour le cas 0 avis  
**Action future :** Ajouter le message dans les composants affichant les avis.

---

## M4. MKT-02 : seuil global de paiement non défini
**Spec :** « un seuil de montant fixé globalement par MEEREO »  
**Code :** aucune constante `THRESHOLD` / `SEUIL` trouvée  
**Action future :** Définir un seuil configurable (back-office ou config serveur).

---

## M5. SYS-06 : champ NCC absent des paramètres pro (cockpit)
**Spec :** NCC doit apparaître aux côtés du RCCM, verrouillé après vérification  
**Code :** Settings.jsx (cockpit pro) affiche le RCCM mais PAS le NCC. Le fournisseur l'a en lecture seule.  
**Action future :** Ajouter le NCC dans l'onglet Profil du cockpit pro, verrouillé comme le RCCM.

---

# ✅ Points vérifiés CONFORMES (pas d'action)

| Point | Résultat |
|-------|----------|
| NCC : unicité vérifiée à l'inscription | ✅ `auth.js:182-232` — contrôle croisé proProfile + fournisseurProfile |
| NCC : valeurs d'exemple bloquées | ✅ `auth.js:29-48` — blocklist + regex |
| Sidebar client : structure correcte | ✅ `Client.jsx:275-340` — Projet, Échanges, Trouver, Achats, Système |
| Sidebar fournisseur : structure correcte | ✅ `Supplier.jsx:320-347` — Activité, Marketplace, Finance, Compte |
| FIN-01 : « Contrats » supprimé du menu | ✅ Plus d'entrée "Contrats" dans la sidebar |
| FIN-01 : bouton « Démarrer le marché » supprimé | ✅ `Contracts.jsx:364` — commentaire PRJ-01 + code supprimé |
| FIN-01 : section « Paiement et sécurisation » supprimée | ✅ `Contracts.jsx:307-317` — bloc vide + commentaire |
| FIN-01 D12 : avancement découplé du paiement | ✅ Pas de couplage entre progression et statut de paiement |
| INS-05 : copie/partage URL | ✅ `Profile.jsx:244-247` — bouton "Partager" + clipboard |
| MKT-01 : prix 0 = « Sur devis » | ✅ `Marketplace.jsx:99,128` — affichage correct |
| NCC fournisseur : présent et verrouillé | ✅ `supplier/Settings.jsx:54` — affiché en lecture seule |
| QAL-02 : placeholder logo initiales | ✅ Composants Avatar/Logo cohérents dans HeroSection, ProDirectory, Sidebar |

---

# PROCHAINES ACTIONS RECOMMANDÉES

## Priorité 1 — Avant mise en production
1. **Supprimer le bouton « Réinitialiser toutes les données »** (C1) — 5 min
2. **Ajouter la validation de format de fichier** (C3) — 30 min
3. **Corriger le message « token manquant »** (C5) — 30 min
4. **Supprimer la création manuelle d'avis** (E1) — 15 min
5. **Ajouter la mention d'engagement sur les offres** (E7) — 10 min

## Priorité 2 — Sprint suivant
6. **Décrémentation du stock à la commande** (C2) — 1h
7. **Ajouter flashDuration au schema + routes** (C4) — 30 min
8. **Synchronisation socket pour suppression de projet** (E5) — 30 min
9. **Historique masqué pour les participants ajoutés** (E3) — 1h
10. **Nommage contextuel des conversations** (E2) — 1h

## Priorité 3 — Backlog
11. Restriction messagerie fournisseur (E4)
12. Rôle INTERVENANT dans la matrice de droits (E6)
13. Source unique équipe Settings/PageBuilder (E8)
14. Notes de chantier typées (M1)
15. Reste des points moyens (M2-M5)
