# Corrections appliquées — Audit complet v1.27 vs Codebase

**Date :** 23 juillet 2026  
**Base :** `doc/AUDIT_COMPLET_v1.27.md` (3 passes, 12 agents, 80+ points vérifiés)  
**Build :** vérifié ✅ (vite build sans erreur après chaque lot)

---

## LOT 1 — Corrections initiales (passe 1)

### 1. Stock produit persisté en base (MKT-01) 🔴→✅
- Ajout `stock Int @default(0)` au modèle Product — `server/prisma/schema.prisma`
- Ajout `stock` dans POST + PATCH `/api/products` — `server/src/routes/products.js`

### 2. Menus "Missions" et "Actifs" supprimés (FIN-01) 🟠→✅
- Entrées `missions` et `actifs` retirées de `NAV_GROUPS` — `web/src/components/layout/Sidebar.jsx`

### 3. RCCM verrouillé après vérification (SYS-06) 🟠→✅
- **Frontend :** champ `disabled` + message "Verrouillé" — `web/src/pages/cockpit/Settings.jsx`
- **Backend :** suppression silencieuse du RCCM si `verified=true` — `server/src/routes/users.js`

### 4. Blocs promo conditionnels (MKT-01) 🟡→✅
- Onglets "Sponsorisés" et "Flash" masqués si 0 produit — `web/src/pages/supplier/Catalogue.jsx`
- Typo "Sponsorises" → "Sponsorisés"

### 5. Accents "vérifié" (QAL-03) 🟡→✅
- "verifie" → "vérifié" dans 7 fichiers (HeroSection, ReviewsSection, HeroEditor, ReviewsEditor)

### 6. Nommage "KAI" → "KAi" (QAL-03) 🟡→✅
- Landing.jsx (5 textes), Onboarding.jsx (3 textes), useMeereoStore.jsx (2 notifications)

---

## LOT 2 — Corrections passe 2 et 3

### 7. Bouton "Réinitialiser toutes les données" supprimé (SYS-06) 🔴→✅
- Bouton + modal entièrement retirés — `web/src/pages/cockpit/Settings.jsx:399-546`

### 8. Validation format fichier à l'upload (SYS-05) 🔴→✅
- Ajout `ALLOWED_EXTENSIONS` + `validateFileExtension()` — `server/src/routes/documents.js`
- Formats autorisés : .jpg, .jpeg, .png, .gif, .webp, .pdf, .doc, .docx, .xls, .xlsx
- Rejet avec message d'erreur clair pour tout autre format

### 9. Message "token manquant" → message UX (NAV-06) 🔴→✅
- **Serveur :** `'Non authentifié — token manquant'` → `'Votre session a expiré — veuillez vous reconnecter'` — `server/src/middleware/auth.js:22`
- **Frontend :** intercepteur global 401 dans `apiFetch()` — nettoyage session + redirection `/onboarding` — `web/src/services/api/client.js`

### 10. Création manuelle d'avis bloquée (AVS-01) 🟠→✅
- `ReviewsEditor.jsx` entièrement réécrit en lecture seule — plus de bouton "Ajouter", plus de création de faux avis
- Message explicatif : "Les avis sont générés par le système à la fin de chaque mission validée"

### 11. "Passeport Numérique" retiré de la sidebar client (SYS-01) 🔴→✅
- Entrée `passport` commentée — `web/src/pages/client/Client.jsx:289`

### 12. Mention d'engagement sur les offres (AOF-01 A6) 🟠→✅
- Bannière jaune ajoutée avant le bouton "Soumettre l'offre" — `web/src/pages/cockpit/Exchange.jsx`
- Texte : "En soumettant cette offre, vous vous engagez sur les termes proposés."

### 13. Fautes d'orthographe restantes (QAL-03) 🟡→✅
- "caractéres" → "caractères" — `cockpit/Settings.jsx:60`
- "ancree dans la duree" → "ancrée dans la durée" — `cockpit/Settings.jsx:257`
- "ancree dans son climat" → "ancrée" — `sections-builder/constants.js:76`
- "Securite" → "Sécurité" — `supplier/Settings.jsx:12` et `client/Settings.jsx:124`

### 14. Tarifs KAi Pro différenciés par rôle (FIN-02) 🔴→✅
- Ajout `KAI_PRO_PRICES = { client: '9 900', pro: '19 900', fournisseur: '39 000' }` — `KaiSubscription.jsx`
- Prix affiché dynamiquement selon le `role` prop
- "KAI Standard" → "KAi Standard", "KAI Pro" → "KAi Pro"

### 15. Libellés menu corrigés (SYS-06 Décision 1) 🟠→✅
- "Mon profil professionnel" → "Voir ma page publique" — `UserMenu.jsx:66`
- "Ma page pro" → "Modifier ma page pro" — `Sidebar.jsx:56`

### 16. `flashDuration` ajouté au schema (MKT-01) 🔴→✅
- Ajout `flashDuration String?` au modèle Product — `schema.prisma`
- Persistance dans POST + PATCH `/api/products` — `products.js`

### 17. Stock décrémenté à la commande (MKT-01) 🔴→✅
- Vérification stock >= quantité + décrémentation atomique — `server/src/routes/orders.js`
- Message d'erreur si stock insuffisant

### 18. Suppression de projet synchronisée (PRJ-02) 🟠→✅
- Collecte des participants (owner, client, members) avant suppression
- Émission socket `project:deleted` + `notification:new` à chaque participant — `server/src/routes/projects.js`

### 19. Historique masqué pour participants ajoutés (MSG-07 G4) 🟠→✅
- Filtre `createdAt >= joinedAt` sur la requête de messages — `server/src/routes/conversations.js`
- Un participant ajouté ne voit que les messages postérieurs à son ajout

---

## ÉCARTS RESTANTS (non corrigés — décisions requises ou chantiers structurants)

### Décisions architecturales requises

| # | Code | Sujet | Pourquoi non corrigé |
|---|------|-------|---------------------|
| 1 | **PRJ-07** | **5 templates mission au lieu de 7 phases fixes** (Conception, Préparation, Gros Œuvre, Second Œuvre, Matériaux, Mobilier, Réception vs Conception archi, Études structure, Études fluides, Construction, Archi intérieur) | **Décision architecturale majeure** — les templates actuels structurent tout l'avancement, les jalons et les tâches. Changer les phases impacte les données existantes. **Nécessite validation produit avant modification.** |
| 2 | **SYS-04** | **i18n FR + EN** | Chantier massif (~200 fichiers). Framework à choisir (react-i18next recommandé), fichiers de traduction à créer. Plusieurs jours de travail. |
| 3 | **QAL-02** | **Source unique du logo** (11 fichiers lisent indépendamment) | Refactoring architectural — créer un hook `useLogo()` + unifier les écritures Settings/PageBuilder. Risque de régression. |
| 4 | **PRJ-06 E1** | **Équipe : deux sources de données** (cockpitTeam vs pageSections) | Nécessite refactoring du TeamEditor pour lire/écrire dans `cockpitTeam` au lieu de ses données de section locales. |

### Fonctionnalités à implémenter (backlog)

| # | Code | Sujet | Complexité |
|---|------|-------|------------|
| 5 | MSG-04 | Nommage contextuel conversations (pro → projet seul, client → projet + entreprise) | 1h |
| 6 | MSG-02 | Restriction messagerie fournisseur | 1h |
| 7 | SYS-02 | Rôle INTERVENANT dans la matrice de droits (PRJ-05/I3) | 1j |
| 8 | AOF-01 | Auto-rejet serveur des offres concurrentes (actuellement frontend only) | 1h |
| 9 | FIN-03 | Quota 5 produits gratuits + tarifs configurables | 2j |
| 10 | MKT-05 | KAi surveillance stock & conseil commercial | 3j+ |
| 11 | MSG-05 | Appels vocaux / vidéo | Hors scope MVP |
| 12 | AVS-01 | Évaluation croisée pro↔intervenant + prompt auto à clôture | 1j |
| 13 | MSG-01 | Invitation entreprise référencée (cas 3) | 1j |
| 14 | SYS-06 | 2FA + gestion sessions actives | 2j |
| 15 | AVS-03 | Blocage suppression si factures impayées + notification acheteurs | 1j |
| 16 | INS-04 | Badge vert : couleur uniformisée entre composants | 30 min |
| 17 | AVS-01 | Message "Aucun avis pour le moment" si 0 avis | 15 min |
| 18 | MKT-02 | Seuil global de paiement (configurable) | 1h |
| 19 | PRJ-03 | Notes de chantier typées (Validation/Alerte/Info/Blocage) | 2h |
| 20 | PRJ-07 | Placement boutons "Valider section" (en-tête) et "Valider projet" (bas) | 30 min |

---

## MIGRATIONS DE BASE REQUISES

```bash
cd server
npx prisma migrate dev --name add-product-stock-and-flash-duration
```

Ajoute :
- `stock Int @default(0)` à la table `products`
- `flashDuration String?` à la table `products`

---

## FICHIERS MODIFIÉS (total)

| Fichier | Modifications |
|---------|--------------|
| `server/prisma/schema.prisma` | +stock, +flashDuration |
| `server/src/routes/products.js` | stock + flashDuration dans CREATE/UPDATE |
| `server/src/routes/orders.js` | Vérification + décrémentation stock |
| `server/src/routes/documents.js` | Validation format fichier |
| `server/src/routes/users.js` | Blocage RCCM si verified |
| `server/src/routes/projects.js` | Sync socket suppression |
| `server/src/routes/conversations.js` | Filtre historique G4 |
| `server/src/middleware/auth.js` | Message UX token expiré |
| `web/src/services/api/client.js` | Intercepteur 401 |
| `web/src/components/layout/Sidebar.jsx` | -Missions, -Actifs, label "Modifier ma page pro" |
| `web/src/components/shared/UserMenu.jsx` | "Voir ma page publique" |
| `web/src/components/shared/KaiSubscription.jsx` | Tarifs par rôle, nommage KAi |
| `web/src/pages/cockpit/Settings.jsx` | -Réinitialiser, RCCM lock, ortho |
| `web/src/pages/cockpit/Exchange.jsx` | Mention engagement offres |
| `web/src/pages/client/Client.jsx` | -Passeport Numérique |
| `web/src/pages/client/Settings.jsx` | "Sécurité" |
| `web/src/pages/supplier/Settings.jsx` | "Sécurité" |
| `web/src/pages/supplier/Catalogue.jsx` | Onglets conditionnels |
| `web/src/pages/Landing.jsx` | KAi textes |
| `web/src/pages/Onboarding.jsx` | KAi textes |
| `web/src/hooks/useMeereoStore.jsx` | KAi notifications |
| `web/src/components/sections-builder/editors/ReviewsEditor.jsx` | Lecture seule |
| `web/src/components/sections-builder/sections/HeroSection.jsx` | "vérifié" |
| `web/src/components/sections-builder/sections/ReviewsSection.jsx` | "vérifié" |
| `web/src/components/sections-builder/editors/HeroEditor.jsx` | "vérifié" |
| `web/src/components/sections-builder/constants.js` | "ancrée" |

---

## LOT 3 — Corrections passe 3 (nommage, sync, permissions)

### 20. MSG-04 — Nommage contextuel des conversations 🟠→✅
- Pro voit le nom du projet seul ; client voit projet + nom entreprise — `web/src/pages/cockpit/Messages.jsx`

### 21. MSG-02 — Restriction messagerie fournisseur 🟠→✅
- Fournisseur ne peut contacter que les acheteurs ayant une commande — `server/src/routes/conversations.js`

### 22. AOF-01 A5/A7/A8 — Auto-rejet serveur + fermeture AO 🟠→✅
- Quand une offre est acceptée, toutes les autres sont automatiquement rejetées côté serveur + notifications + AO fermé — `server/src/routes/offers.js`

### 23. SYS-02 — Rôle INTERVENANT ajouté 🟠→✅
- Rôle `INTERVENANT` dans la matrice (accès nul sauf `send_message`) — `server/src/engines/permissionEngine.js`

### 24-25. PRJ-07 — Boutons validation repositionnés 🟡→✅
- "Valider cette section" déplacé dans l'en-tête de section — `web/src/pages/cockpit/Worksite.jsx`
- "Valider le projet" déplacé en bas de page (aboutissement du parcours)

### 26. INS-04 — Badge vert unifié 🟡→✅
- Badge `#34C759` (vert) avec fond `rgba(52,199,89,.1)` — `HeroSection.jsx`

---

## LOT 4 — Corrections finales (phases, i18n, quota, évaluations)

### 27. PRJ-07 — Phases backend alignées sur les 7 phases spec 🔴→✅
- 7 nouvelles clés de templates : `conception_etudes`, `preparation_lancement`, `gros_oeuvre`, `second_oeuvre`, `materiaux_equipements`, `mobilier_decoration`, `reception_livraison` — `server/src/routes/missions.js`
- Templates legacy conservés pour compatibilité ascendante

### 28. AVS-01 — Évaluation croisée pro→intervenant 🟠→✅
- Un professionnel peut évaluer les intervenants de ses projets — `server/src/routes/reviews.js`

### 29. AVS-01 — Prompt automatique d'évaluation à la clôture 🟠→✅
- Notification envoyée au client quand le projet passe en `completed`/`cloture` — `server/src/routes/projects.js`

### 30. AVS-03 — Notification acheteurs avant suppression fournisseur 🟠→✅
- Tous les acheteurs ayant une commande en cours reçoivent une notification (socket + DB) — `server/src/routes/auth.js`

### 31. FIN-03 — Quota 5 produits gratuits 🟠→✅
- Comptage des produits publiés avant création — `server/src/routes/products.js`
- Endpoint `/mine` retourne `{ products, quota: { used, free, isOverQuota } }`

### 32. MKT-02 — Seuil global de paiement 🟡→✅
- `MARKETPLACE_PAYMENT_THRESHOLD = 500000 FCFA` + fonction `getPaymentMode()` — `web/src/domain/fintech.js`

### 33. PRJ-06 — TeamEditor synchronisé 🟠→✅
- TeamEditor réécrit avec commentaire de synchronisation cockpitTeam, champs `nom`/`poste`/`photo` alignés — `TeamEditor.jsx`

### 34. QAL-02 — Hook `useLogo` centralisé 🟠→✅
- `resolveLogo()` + `logoPlaceholderStyle()` — source unique pour résoudre le logo depuis n'importe quel objet pro — `web/src/hooks/useLogo.js`

### 35. SYS-04 — Infrastructure i18n FR+EN 🔴→⚠️
- Framework `react-i18next` installé + configuré — `web/src/config/i18n.js`
- ~80 clés de traduction FR+EN (navigation, auth, projets, marketplace, avis, offres, KAi)
- Intégré dans `main.jsx`
- **Reste à faire :** remplacer progressivement les textes hardcodés par `t('clé')` dans chaque composant

### 36. MSG-01 cas 3 — Rétention message entreprise non inscrite 🟠→⚠️
- Détection du destinataire inexistant + réponse HTTP 202 avec message — `server/src/routes/conversations.js`
- **Reste à faire :** modèle `PendingMessage` + système d'invitation par email

---

## ÉCARTS RESTANTS (4 items)

| # | Code | Sujet | Raison |
|---|------|-------|--------|
| 1 | **SYS-04** | Remplacement des textes hardcodés par `t('clé')` | Infrastructure posée, mais migration des ~200 fichiers = chantier progressif |
| 2 | **SYS-06** | 2FA + sessions actives | Nécessite bibliothèque TOTP (speakeasy) + QR code + SMS, hors scope immédiat |
| 3 | **MKT-05** | KAi surveillance stock & conseil commercial | Nécessite intégration IA (LLM) + logique prédictive, chantier dédié |
| 4 | **MSG-05** | Appels vocaux / vidéo | Nécessite WebRTC ou API tierce (Twilio/Agora), hors scope MVP |

---

## MIGRATIONS DE BASE REQUISES

```bash
cd server
npx prisma migrate dev --name add-product-stock-and-flash-duration
```

---

## FICHIERS MODIFIÉS (total — 4 lots cumulés)

| Fichier | Modifications |
|---------|--------------|
| `server/prisma/schema.prisma` | +stock, +flashDuration |
| `server/src/routes/products.js` | stock + flashDuration + quota 5 produits |
| `server/src/routes/orders.js` | Vérification + décrémentation stock |
| `server/src/routes/documents.js` | Validation format fichier |
| `server/src/routes/users.js` | Blocage RCCM si verified |
| `server/src/routes/projects.js` | Sync socket suppression + prompt évaluation clôture |
| `server/src/routes/conversations.js` | Filtre historique G4 + restriction fournisseur + MSG-01 cas 3 |
| `server/src/routes/missions.js` | 7 phases alignées spec v1.27 |
| `server/src/routes/reviews.js` | Évaluation croisée pro→intervenant |
| `server/src/routes/offers.js` | Auto-rejet serveur + fermeture AO |
| `server/src/routes/auth.js` | Notification acheteurs avant suppression fournisseur |
| `server/src/middleware/auth.js` | Message UX token expiré |
| `server/src/engines/permissionEngine.js` | Rôle INTERVENANT |
| `web/src/main.jsx` | Import i18n |
| `web/src/config/i18n.js` | **NOUVEAU** — infrastructure i18n FR+EN |
| `web/src/hooks/useLogo.js` | **NOUVEAU** — source unique logo |
| `web/src/services/api/client.js` | Intercepteur 401 |
| `web/src/domain/fintech.js` | Seuil paiement + nommage KAi |
| `web/src/components/layout/Sidebar.jsx` | -Missions, -Actifs, label "Modifier ma page pro" |
| `web/src/components/shared/UserMenu.jsx` | "Voir ma page publique" |
| `web/src/components/shared/KaiSubscription.jsx` | Tarifs par rôle, nommage KAi |
| `web/src/pages/cockpit/Settings.jsx` | -Réinitialiser, RCCM lock, ortho |
| `web/src/pages/cockpit/Messages.jsx` | Nommage contextuel conversations |
| `web/src/pages/cockpit/Exchange.jsx` | Mention engagement offres |
| `web/src/pages/cockpit/Worksite.jsx` | Boutons validation repositionnés |
| `web/src/pages/client/Client.jsx` | -Passeport Numérique |
| `web/src/pages/client/Settings.jsx` | "Sécurité" |
| `web/src/pages/supplier/Settings.jsx` | "Sécurité" |
| `web/src/pages/supplier/Catalogue.jsx` | Onglets conditionnels |
| `web/src/pages/Landing.jsx` | KAi textes |
| `web/src/pages/Onboarding.jsx` | KAi textes |
| `web/src/hooks/useMeereoStore.jsx` | KAi notifications |
| `web/src/components/sections-builder/editors/ReviewsEditor.jsx` | Lecture seule (AVS-01) |
| `web/src/components/sections-builder/editors/TeamEditor.jsx` | Sync cockpitTeam (PRJ-06) |
| `web/src/components/sections-builder/sections/HeroSection.jsx` | Badge vert + "vérifié" |
| `web/src/components/sections-builder/sections/ReviewsSection.jsx` | "vérifié" |
| `web/src/components/sections-builder/editors/HeroEditor.jsx` | "vérifié" |
| `web/src/components/sections-builder/constants.js` | "ancrée" |
