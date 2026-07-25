# Plateforme MEEREO — Spécifications fonctionnelles

**Version : 1.27** · **Date : 23 juillet 2026** · **Statut : figée (référence de développement)**

> **Destinataire :** équipe de développement.
> **Objet :** référentiel unique et consolidé des corrections, améliorations et règles métier de la plateforme MEEREO.
> Les points sont regroupés par domaine fonctionnel et identifiés par un **code stable** (ex. `MSG-02`). Ce code ne change jamais, même si l'ordre d'affichage évolue : il sert de référence dans les renvois, le suivi de tâches et les versions futures.

---

# COMMENT LIRE ET FAIRE VIVRE CE DOCUMENT (gouvernance)

**Règles de mise à jour — à respecter pour ne pas casser le travail de développement :**

1. **Le code stable fait foi.** Chaque exigence porte un code (`INS-01`, `MSG-03`, `FIN-07`…). Les renvois entre points utilisent ce code, jamais le numéro de page ni l'ordre d'affichage.
2. **On ne réécrit pas l'existant.** À partir de cette v1.0, le corps des exigences déjà figées n'est plus modifié à la volée. Une exigence qui évolue est **amendée** (mention datée ajoutée à la fin de son bloc), jamais réécrite silencieusement.
3. **Un nouveau feedback = un nouveau code.** Tout retour ultérieur reçoit un **nouveau code** dans son domaine (le prochain numéro libre : `MSG-05`, `FIN-04`…), est ajouté à sa section, et est consigné dans le **Journal des versions** en fin de document.
4. **Le numéro de version augmente à chaque lot.** v1.1, v1.2… Le développeur sait ainsi exactement ce qui est nouveau depuis la version qu'il a déjà traitée, en lisant le seul Journal des versions.
5. **Statut par exigence.** Chaque point indique son statut : `À CORRIGER` (bug), `À DÉVELOPPER` (nouvelle fonctionnalité), `RÈGLE` (règle métier permanente), ou `À TRANCHER` (décision produit requise avant tout code).

**Codes de domaine :**

| Domaine | Préfixe |
|---|---|
| A. Inscription & identité du professionnel | `INS` |
| B. Annuaire & appels d'offres | `ANN` |
| C. Messagerie & communication | `MSG` |
| D. Stabilité, session & navigation | `NAV` |
| E. Cycle de vie & suivi des projets | `PRJ` |
| F. Avis, notifications & données de compte | `AVS` |
| G. Qualité transverse | `QAL` |
| H. Suivi financier de projet | `FIN` |

---

# SOMMAIRE

> Chaque section est dans un fichier séparé. Cliquez sur le lien pour accéder au détail.

**[A. Inscription & identité du professionnel](A_Inscription_Identite.md)**
- `INS-01` — Vérification, validation et unicité du RCCM et du numéro de contribuable
- `INS-02` — Gestion du logo lors de l'inscription
- `INS-03` — Création obligatoire de la page professionnelle publique
- `INS-04` — Badge « Vérifié par MEEREO »
- `INS-05` — Génération automatique, enregistrement et partage de l'URL publique
- `INS-06` — Validation par étape de l'onboarding & sortie d'impasse

**[B. Annuaire & appels d'offres](B_Annuaire_Appels_Offres.md)**
- `ANN-01` — Recherche des entreprises dans les appels d'offres privés
- `ANN-02` — Affichage des entreprises dans les appels d'offres privés
- `ANN-03` — Refonte de la Bourse des appels d'offres
- `ANN-04` — Performances de l'annuaire des professionnels
- `ANN-05` — Compatibilité multi-navigateurs de l'annuaire

**[C. Messagerie & communication](C_Messagerie_Communication.md)**
- `MSG-01` — Contact d'une entreprise sans page publique
- `MSG-02` — Refonte complète de la messagerie
- `MSG-03` — Notification « lu / non-lu » des messages
- `MSG-04` — Conversation unique par binôme Client ↔ Professionnel
- `MSG-05` — Intégration native des API de communication (messagerie, appels vocaux/vidéo)
- `MSG-06` — Synchronisation instantanée d'une nouvelle conversation (sans refresh)
- `MSG-07` — Conversation projet multi-participants (ajout d'intervenants)

**[D. Stabilité, session & navigation](D_Stabilite_Session_Navigation.md)**
- `NAV-01` — Retour intempestif vers la landing page
- `NAV-02` — Déconnexions et sorties inattendues
- `NAV-03` — Conservation de la page active lors d'un rafraîchissement
- `NAV-04` — Logo absent sur la page professionnelle
- `NAV-05` — Lien « Paramètres » inopérant dans le menu de l'avatar
- `NAV-06` — « Token manquant » : requêtes non authentifiées

**[E. Cycle de vie & suivi des projets](E_Cycle_Vie_Projets.md)**
- `PRJ-01` — Validation d'un marché et création automatique du projet
- `PRJ-02` — Arrêt, clôture, archivage et suppression des projets
- `PRJ-03` — Synchronisation des notes d'avancement avec le client
- `PRJ-04` — Synchronisation des images Professionnel ↔ Client
- `PRJ-05` — Assignation & gestion des intervenants (4 sources, accès sous-traité)
- `PRJ-06` — Équipe : cycle de vie complet (référentiel, page publique, projets)
- `PRJ-07` — Suivi chantier : avancement, validation par section & notes
- `PRJ-08` — Refonte de la visualisation documentaire et de la chronologie
- `PRJ-09` — Système visuel d'identification des projets (couleurs)
- `PRJ-10` — Cohérence des données Client ↔ Professionnel

**[F. Avis, notifications & données de compte](F_Avis_Notifications_Compte.md)**
- `AVS-01` — Avis, notation et affichage centralisé des évaluations
- `AVS-02` — Gestion des notifications
- `AVS-03` — Suppression des profils et réutilisation des adresses e-mail

**[G. Qualité transverse](G_Qualite_Transverse.md)**
- `QAL-01` — Optimisation générale des performances
- `QAL-02` — Source unique et affichage universel du logo d'entreprise
- `QAL-03` — Correction orthographique et grammaticale

**[H. Suivi financier de projet](H_Suivi_Financier.md)**
- `FIN-01` — Suivi financier de projet : Budget, Phases, Marchés, Paiements
- `FIN-02` — Paiements intégrés Mobile Money (KAi Pro & Marketplace)
- `FIN-03` — Monétisation Marketplace : commission & stratégie en 3 phases

**[I. Cycle appel d'offres & marchés](I_Cycle_Appels_Offres.md)** *(cadré v1.4)*
- `AOF-01` — Cycle de vie complet appel d'offres → marché
- `AOF-02` — Offres reçues & comparaison (côté émetteur)
- `AOF-03` — Réponse d'un professionnel à un appel d'offres

**[J. Marketplace & espace fournisseur](J_Marketplace_Fournisseur.md)** *(cadré v1.11)*
- `MKT-01` — Catalogue produits du fournisseur
- `MKT-02` — Commande, paiement & livraison (Marketplace)
- `MKT-03` — Espace fournisseur (structure réelle)
- `MKT-04` — Produits sponsorisés (publicité Marketplace)
- `MKT-05` — KAi : surveillance de stock & conseil commercial

**[K. Fondations transverses](K_Fondations_Transverses.md)** *(ajouté audit v1.3)*
- ~~`SYS-01` — Passeport Numérique du projet~~ *(RETIRÉ v1.10 — simplification MVP, réversible)*
- `SYS-02` — Matrice de droits et permissions par rôle
- `SYS-03` — Expérience mobile : web responsive puis app native
- `SYS-04` — Multilingue (Français + Anglais dès le lancement)
- `SYS-05` — Gestion des fichiers & documents
- `SYS-06` — Paramètres, page pro & aperçu public : trois portes distinctes

---

**Annexes :**
- [Annexe 1 — Décisions à trancher & dépendances](Annexe_1_Decisions_Dependances.md)
- [Annexe 2 — Journal des versions](Annexe_2_Journal_Versions.md)
- [Annexe 3 — Diagnostic technique](Annexe_3_Diagnostic_Technique.md)
- [Annexe 4 — Documents complémentaires : contrôle de cohérence](Annexe_4_Documents_Complementaires.md)
