# MEEREO — Synthèse produit & modifications UI
**Extrait de la v1.30 des spécifications fonctionnelles — 26 juillet 2026**

---

## PARTIE 1 — CE QU'EST MEEREO

### Vision d'ensemble

MEEREO est une **plateforme BTP (bâtiment et travaux publics) en ligne** destinée au marché ivoirien et à la zone UEMOA. Elle connecte trois types d'acteurs en un écosystème unique :

- **Le Client** — maître d'ouvrage (particulier ou promoteur) qui lance des projets de construction ou de rénovation.
- **Le Professionnel** — entreprise de construction, architecte, bureau d'études, qui répond aux appels d'offres et pilote les chantiers.
- **Le Fournisseur** — négociant ou distributeur de matériaux, mobilier et équipements, qui vend via la Marketplace (MeereoShop).

### Les cinq grands modules

#### 1. Annuaire & appels d'offres (AOF)
Un client (ou un professionnel en sous-traitance) publie un **appel d'offres** — public (visible dans la Bourse, diffusé aux professionnels du bon secteur) ou privé (ciblé vers des entreprises choisies dans l'annuaire). Les professionnels déposent des offres, l'émetteur compare et accepte. L'acceptation crée directement le **marché signé** sans re-signature. L'annuaire permet aussi la recherche directe par nom, spécialités, localisation.

#### 2. Messagerie & communication
Messagerie **temps réel** intégrée, avec **une seule conversation par binôme Client ↔ Professionnel**, qui évolue au fil des étapes (contact → AO → suivi). Appels vocaux et vidéo natifs prévus. Le professionnel responsable peut ajouter des intervenants à la conversation projet.

#### 3. Cockpit Projet (suivi de chantier)
Interface de pilotage du chantier, côté Professionnel, organisée en **phases fixes** (Conception · Préparation · Gros Œuvre · Second Œuvre · Matériaux · Mobilier · Réception). Chaque phase contient des tâches avec statut (À faire / En cours / Terminé). Notes de chantier typées (Validation / Alerte / Information / Blocage). Tout est synchronisé en temps réel côté Client.

#### 4. Suivi financier de projet (FIN)
Modèle déclaratif (pas de paiement réel pour les gros marchés BTP) : le professionnel déclare les paiements reçus, le client consulte. Structure : **Budget global (plafond) → Phases → Marchés (missions) → Paiements déclarés**. Pour les petits flux (abonnement KAi Pro, achats Marketplace), vrai encaissement **Mobile Money** (Orange Money, MTN MoMo, Wave).

#### 5. Marketplace — MeereoShop
Marché de **produits physiques** (matériaux, mobilier, équipements BTP) vendu exclusivement par les fournisseurs. Clients et professionnels peuvent acheter. Paiement Mobile Money sous un seuil, devis + paiement direct au-dessus. Fonctionnalités : catalogue, promotions, ventes flash, produits sponsorisés (AD), suivi de commandes.

### L'assistant KAi
IA intégrée à toutes les étapes : recommandations en fin de parcours client, vérification IA des documents RCCM (badge « Vérifié »), surveillance de stock fournisseur, suggestion de ventes flash, prédiction des réapprovisionnements, analyse des meilleures ventes. **Règle fondatrice : KAi n'invente pas et ne comble jamais les vides de sa propre initiative.**

### Les rôles et droits
Trois rôles principaux (Client, Professionnel, Fournisseur) + un rôle Intervenant (sous-traitant, sans accès au projet où il est assigné) + Admin MEEREO. Le Professionnel dispose en plus de **4 rôles internes** (Administrateur, Chef de projet, Collaborateur, Lecteur). Une matrice centralisée (`SYS-02`) régit toutes les permissions.

### Modèle économique (3 phases)
- **Phase 1** — Gratuit, zéro commission. Revenus accessoires : publicité + abonnement KAi Pro.
- **Phase 2** — Toujours zéro commission sur les ventes (MEEREO n'a pas l'agrément). Revenus : quota de produits (5 gratuits, puis 1 500–2 500 FCFA/produit/mois), ventes flash, sponsoring, abonnement fournisseur, abonnement KAi Pro (9 900 / 19 900 / 39 000 FCFA/mois selon le rôle).
- **Phase 3 (cible)** — Escrow + partenaire logistique → commission prélevée automatiquement, y compris sur les flux offline.

### Contexte technique
- Lancement : **web responsive** (mobile-first), puis app native iOS/Android.
- **Bilingue FR + EN** dès le lancement (architecture i18n obligatoire).
- Données sur **source unique** : logo, avis, badge vérifié, secteurs — un seul référentiel, propagé partout.

---

## PARTIE 2 — MODIFICATIONS UI À FAIRE

> Les codes de référence (`INS-01`, `MSG-04`…) renvoient aux exigences du référentiel v1.30.
> Statuts : 🔴 Bug à corriger · 🟡 À développer · ⚪ Règle UI (comportement à implémenter)

---

### A. INSCRIPTION & ONBOARDING

#### `INS-01` — Champs RCCM & N° de contribuable 🔴
- Les valeurs d'**exemple affichées en placeholder ne doivent jamais être acceptées** comme données réelles. Afficher un message d'erreur si l'utilisateur valide avec la valeur d'exemple.
- Le bouton « Continuer » reste **désactivé** tant que les deux champs ne passent pas la validation de format (regex).

#### `INS-03` — Popup de création de page publique à la 1ère connexion 🔴
- Le **popup doit s'afficher immédiatement** au 1er chargement du tableau de bord, sans nécessiter de rafraîchissement manuel.
- Tant que la page publique n'est pas créée, l'accès aux autres fonctionnalités est **bloqué**.

#### `INS-06` — Validation par étape (stepper d'inscription) 🔴
- Sur l'écran `s-account` (étape commune « Votre compte »), le bouton « Continuer » doit être **désactivé** tant que les champs suivants ne sont pas valides : Prénom non vide, Nom non vide, Email au format valide, Mot de passe respectant la politique de complexité, Confirmation identique au mot de passe.
- Chaque champ affiche un **message d'erreur inline** dès qu'il perd le focus avec une valeur invalide.
- Si malgré tout un champ obligatoire manque en fin de parcours, la plateforme **redirige automatiquement** vers l'étape concernée (jamais de dead-end silencieux).

#### `INS-07` — Réinitialisation de mot de passe 🔴
- Sur l'écran `s-reset`, le bouton « Réinitialiser » doit être **désactivé** tant que : le mot de passe ne respecte pas la politique de complexité ET la confirmation ne correspond pas exactement.
- Messages d'erreur inline sur chaque champ.

#### `INS-08` — Ajout du téléphone et de la ville dans le formulaire d'inscription 🔴
- Ajouter le champ **Téléphone** (obligatoire pour les 3 rôles) à l'étape `s-account`, avec validation de format (ivoirien ou international).
- Ajouter le champ **Ville** (obligatoire pour Professionnel et Fournisseur ; facultatif pour le Client) à l'étape structure/profil correspondante.
- ⚠️ Ne pas confondre avec le champ « Localisation » de l'écran `c-project` (= localisation du projet, pas du compte).

#### `INS-09` — Vérification d'unicité et de possession de l'e-mail 🟡
- Vérifier l'unicité de l'e-mail **à l'étape de saisie** (`s-account`), pas à la validation finale.
- Envoyer un **lien ou code de confirmation** après la saisie (modalité à trancher : bloquant avant accès ou différé avec espace restreint).
- Si la vérification est différée, permettre à l'utilisateur de **corriger son adresse** depuis l'espace sans repasser par l'inscription.

#### `INS-10` — Case à cocher CGU et politique de confidentialité 🟡
- Ajouter à l'étape `s-account` une **case à cocher explicite, non pré-cochée**, avec liens vers les CGU et la politique de confidentialité (les liens s'ouvrent sans quitter le parcours ni perdre le brouillon).
- Le bouton « Continuer » reste **désactivé** tant que la case n'est pas cochée.
- Séparer en deux cases distinctes : acceptation CGU (obligatoire) et communications commerciales (facultative, jamais pré-cochée).

#### `INS-11` — Secteurs d'activité du Professionnel : sauvegarde et validation 🔴
- Les puces « Secteurs d'activité » sur l'écran `p-struct` doivent avoir un **identifiant** et être **incluses dans les données persistées**.
- **Aucune puce pré-sélectionnée** par défaut (supprimer la classe `sel` codée en dur sur « Architecte & Design »).
- Sélection d'**au moins un secteur obligatoire** : bouton « Continuer » désactivé si aucune puce n'est active.

#### `INS-12` — Générateur de logo : lecture du nom & valeur de repli 🔴
- Le générateur de logo doit **lire le nom de l'entreprise** saisi à l'étape précédente : monogramme des initiales réelles, libellé d'aperçu affichant le nom réel (supprimer le « M » et « Votre Structure » codés en dur).
- Définir une **valeur de repli automatique** (monogramme d'initiales sur fond neutre) si l'utilisateur ne choisit aucun logo, afin qu'aucun emplacement ne soit jamais vide (`QAL-02`).
- (À trancher avant coda) : l'étape est-elle bloquante ou franchissable avec repli automatique ?

#### `INS-13` — Brouillon d'inscription 🔴
- Le brouillon ne doit être effacé (`clearDraft()`) qu'**après acquittement du serveur** confirmant la création du compte — pas à l'arrivée sur l'écran de confirmation.
- Définir une **durée d'expiration** (proposition : 30 jours) : le bandeau « Reprendre » ne s'affiche plus au-delà.

#### `INS-15` — Fil d'étapes (stepper) 🔴
- Le nombre de points affichés doit correspondre au **nombre d'étapes réelles du rôle sélectionné** (Client : 3 ; Professionnel : 4 ; Fournisseur : 5), jamais codé en dur à 5 pour tous.
- Recalculer le fil dynamiquement quand le rôle change à l'étape 1.
- Unifier le libellé de l'écran final (harmoniser « Dernière étape » / « Terminé » en une seule convention pour les 3 rôles).

#### `INS-16` — Fin de parcours Client : recommandation KAi 🔴
- Supprimer la **pré-sélection codée en dur** sur la première vignette de type de projet (classe `sel` en dur dans le balisage) et sur l'option de budget par défaut (`selected`).
- Si l'utilisateur **passe l'étape** sans rien saisir, l'écran de fin ne présente **aucun récapitulatif** et KAi ne formule **aucune recommandation fondée sur un projet**. Il propose les deux voies (appel d'offres / annuaire) sans les hiérarchiser, avec lien pour revenir remplir le projet.
- La mention « J'ai déjà pré-rempli l'essentiel à partir de vos informations » n'apparaît que si des informations ont effectivement été saisies.

---

### B. ANNUAIRE & APPELS D'OFFRES

#### `ANN-02` — Affichage des logos dans l'annuaire et les AO privés 🔴
- Les logos des entreprises doivent s'afficher correctement dans les **appels d'offres privés** et dans « Rechercher un professionnel ».
- Appliquer le principe de source unique (`QAL-02`) : récupérer le logo depuis le profil professionnel central, pas localement.
- Vérifier que les **étoiles affichées** sont bien reliées au système d'avis centralisé (`AVS-01`), pas calculées localement.

#### `ANN-03` — Refonte de la Bourse des appels d'offres 🟡
- Revoir entièrement le **design** (lisibilité, UX).
- Améliorer la **visibilité** des appels d'offres disponibles.
- Ajouter une **notification visible** à côté de la rubrique quand un nouvel AO est publié.

---

### C. MESSAGERIE

#### `MSG-02` — Refonte de la messagerie 🔴
- Corriger les bugs : messages Client→Professionnel non reçus, bouton Messagerie inopérant sur les pages pro, bouton Contacter incohérent.
- Afficher les **logos** dans les conversations (source unique `QAL-02`).
- Synchronisation **temps réel** : aucun rafraîchissement manuel requis.
- Côté Professionnel : accès uniquement aux clients de son CRM et à ses relations d'affaires — supprimer l'accès à la liste complète des clients.

#### `MSG-03` — Indicateur lu / non-lu 🔴
- Un message n'est marqué **lu** qu'après ouverture effective de la conversation (pas à la réception ni à l'affichage transitoire d'une notification).
- La notification reste visible tant que le message n'a pas été ouvert.

#### `MSG-04` — Conversation unique par binôme 🔴
- Fusionner les doublons de conversation : si « Conception — MILLENIUM CONSTRUCTION » et « Projet : Conception » coexistent pour le même binôme, **fusionner en une seule**.
- Affichage contextuel du libellé : côté Professionnel = nom du projet seul ; côté Client = nom du projet + nom de l'entreprise.

#### `MSG-06` — Apparition instantanée d'une nouvelle conversation 🔴
- Après le 1er message envoyé, la conversation doit apparaître **immédiatement** dans la liste du client (sans refresh), devenir la conversation active et afficher le message dans le fil.

---

### D. STABILITÉ & NAVIGATION

#### `NAV-01` — Retour intempestif vers la landing page 🔴
- Corriger tout renvoi automatique vers la landing page quand l'utilisateur est connecté (hors déconnexion volontaire ou expiration de session).

#### `NAV-02` — Déconnexions et sorties inattendues 🔴
- Aucune action utilisateur (changement d'onglet, upload, validation de formulaire, navigation entre modules…) ne doit provoquer de déconnexion ou de rechargement complet inattendu.

#### `NAV-03` — Conservation de la page active au rafraîchissement 🔴
- Après un F5, l'utilisateur retrouve la même page, le même onglet actif, les mêmes filtres. Interdit de rediriger vers le tableau de bord ou la landing page.

#### `NAV-04` — Logo absent sur la page professionnelle 🔴
- Afficher le logo dans l'en-tête de la page professionnelle (haut à droite). Cas particulier de `QAL-02`.

#### `NAV-05` — Lien « Paramètres » dans le menu avatar 🔴
- Le clic sur « Paramètres » dans le menu déroulant de l'avatar doit ouvrir la section Paramètres. Vérifier et corriger pour **les trois rôles** et les **trois points d'entrée** (barre latérale, menu avatar, carte EXPLORER).

#### `NAV-06` — Message « Token manquant » 🔴
- Ne jamais afficher le message technique « token manquant » à l'utilisateur. Afficher à la place un message clair (« Votre session a expiré ») avec proposition de reconnexion.
- Vérifier que le jeton d'authentification est systématiquement transmis sur tous les appels (tous rôles, toutes actions).

---

### E. SUIVI DE PROJETS

#### `PRJ-01` — Simplifications dans la section Marché 🔴
- **Supprimer** le bouton « Démarrer le marché » (non fonctionnel).
- **Supprimer** la section « Paiement et sécurisation » (obsolète).

#### `PRJ-07` — Placement des boutons de validation dans le suivi chantier 🔴
- **« Valider cette section »** doit se trouver dans l'**en-tête de chaque section** (à côté du titre, du pourcentage et de la flèche de repli), pas en bas de la liste des tâches.
- **« Valider le projet »** doit être placé **en bas**, après la dernière section, pas en haut sous les compteurs.

#### `PRJ-08` — Visualisation documentaire 🟡
- Ajouter plusieurs modes d'affichage des documents : cartes, galerie d'images, vignettes, chronologie/timeline interactive, regroupement par catégorie ou par étape.
- Chaque document affiche : aperçu, type, auteur, date de dépôt, catégorie, étape.

#### `PRJ-09` — Couleurs des projets 🟡
- Permettre d'associer une couleur distincte à chaque projet (palette élargie), appliquée de façon cohérente : tableau de bord, Cockpit, listes, chronologies, indicateurs d'avancement, calendriers.

---

### F. AVIS & NOTIFICATIONS

#### `AVS-01` — Section Avis sur la page publique 🟡
- **Supprimer** l'option de créer/gérer manuellement la section Avis dans l'éditeur de page publique. Les avis sont entièrement générés par le système.
- Afficher les étoiles, note moyenne et nombre d'avis depuis la **source centralisée** (même valeur partout : page publique, annuaire, AO, résultats de recherche).
- Si aucun avis : afficher « Aucun avis pour le moment » (jamais d'étoiles fictives).

---

### G. QUALITÉ TRANSVERSE

#### `QAL-02` — Logos manquants ou incohérents 🔴
- Afficher le logo depuis une **source unique centralisée** (profil professionnel/fournisseur) dans **toutes** les sections : projets client, AO, annuaire, conversations, fiches pro, notifications, Marketplace (fiche produit, boutique fournisseur, résultats de recherche).
- Si aucun logo : afficher le **même placeholder** partout (initiales ou icône générique — jamais d'image cassée).
- Toute modification du logo se répercute partout automatiquement.

#### `QAL-03` — Corrections textuelles 🔴
- Corriger les fautes d'orthographe, de grammaire et d'incohérences terminologiques sur tous les libellés, messages d'erreur, notifications, popups, e-mails, contenus statiques.
- Corriger « **KAI** » → **KAi** partout dans l'interface.
- Ne jamais afficher de message d'erreur technique brut à l'utilisateur final (ex. « token manquant »).

---

### H. SUIVI FINANCIER

#### `FIN-01` — Menu Cockpit Pro : fusion et suppressions 🔴
- **Fusionner** les entrées « Missions », « Marchés » et « Contrats » en une seule entrée libellée **« Marchés »**.
- **Supprimer** l'entrée « Actifs » du menu (résidu supprimé de la spec).

---

### J. MARKETPLACE

#### `MKT-01` — Blocs promotionnels conditionnels 🔴
- Les blocs « Promo du mois », « Stock limité », « Ventes Flash » ne doivent s'afficher que s'il existe de vrais produits/promotions correspondants. Si 0 produit ou 0 promo : afficher uniquement l'état vide.
- Afficher le compteur de quota visible (ex. « 5/5 produits gratuits utilisés ») + coût du produit suivant + échéance de facturation + compte à rebours avant dépublication.

#### `MKT-06` — Formulaire d'inscription Fournisseur : compléter `f-mat` 🔴
- Ajouter les champs obligatoires manquants dans le formulaire `f-mat` : **Stock disponible** (quantité) et **Unité de vente** (unité, sac, m², tonne…).
- **Aligner la liste des catégories** sur celles de MeereoShop (remplacer les 8 catégories actuelles par les 11 catégories réelles : Gros Œuvre · Structure & Charpente · Menuiseries · Revêtements · Plomberie & CVC · Électricité · Green & Énergie · Mobilier Bureau · Mobilier Maison · Cuisine & SDB · Extérieur & Jardin), depuis une source unique.
- Afficher l'**interrupteur « Visible dans le Marketplace »** et définir un statut de publication par défaut (publié ou brouillon — à arbitrer), avec annonce claire à l'utilisateur.
- Afficher le **compteur de quota** (« 1/5 produits gratuits »).
- Ajouter à l'étape `f-struct` les **catégories servies** de l'entreprise (symétrique de `INS-11`).
- L'écran `f-done` ne doit **pas** afficher « Votre marketplace est prête, vous pouvez commencer à vendre » tant que les moyens de réception de paiement et une zone de livraison ne sont pas configurés. Distinguer visuellement deux niveaux : *compte créé* vs *boutique opérationnelle*.
- Un produit ne peut être **publié** que si au moins un moyen de réception et une zone de livraison (ou retrait client) sont configurés — sinon, produit en brouillon avec liste des actions restantes.

---

### K. PARAMÈTRES (SYS-06)

#### `SYS-06` — Libellés des trois portes d'identité 🔴
- Renommer les entrées :
  - « Mon profil professionnel » → **« Voir ma page publique »**
  - « Ma page pro » → **« Modifier ma page pro »**
  - « Paramètres » → inchangé
- L'édition du contenu vitrine (logo, slogan, bio, secteurs, services) ne se fait **que** depuis « Modifier ma page pro » — supprimer ces champs des onglets Paramètres si doublon.

#### `SYS-06` — Onglet Préférences 🔴
- Ajouter le **sélecteur de langue FR / EN** (absent actuellement).

#### `SYS-06` — Onglet Sécurité 🟡
- Ajouter la **double authentification (2FA)**.
- Ajouter la **gestion des sessions actives** (voir et révoquer les appareils connectés).

#### `SYS-06` — Onglet Données : retrait d'un bouton de test 🔴
- **Retirer le bouton « Réinitialiser toutes les données »** — outil de test qui efface l'intégralité du compte ; inacceptable en production.

#### `SYS-06` — Verrouillage du RCCM après vérification ⚪
- Une fois le RCCM vérifié, afficher le champ en mode **verrouillé**. Toute demande de modification passe par l'admin MEEREO (mention explicite dans l'UI).

---

### RESPONSIVE & MULTILINGUE

#### `SYS-03` — Responsive mobile 🔴
- Repenser toutes les interfaces pour le **tactile et les petits écrans** (les maquettes actuelles sont desktop-first et se dégradent sur mobile). Pas seulement « rétrécir » mais revoir la hiérarchie des informations pour mobile.

#### `SYS-04` — Architecture i18n 🟡
- **Aucun texte codé en dur** dans les composants. Tous les libellés passent par des fichiers de traduction.
- Appliquer à toute la surface : connexion, mot de passe oublié, parcours d'inscription (3 rôles), espace connecté.
- Ajouter le sélecteur de langue sur l'ensemble du prototype (connexion, onboarding, espace connecté).

---

*Fin de la synthèse — basée sur MEEREO_Specifications_v1.30.md*
