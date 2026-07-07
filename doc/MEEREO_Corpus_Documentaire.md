# MEEREO — CORPUS DOCUMENTAIRE OFFICIEL

**Version :** 1.0
**Statut :** Document de référence consolidé
**Confidentialité :** Interne – MEEREO Project

Ce document consolide l'intégralité du corpus documentaire de la plateforme MEEREO : Platform Bible (Volumes 0 à 3), MEEREO Architecture Decision Records (MADR), Engineering Manual & Handbook, Knowledge Bible, Product Requirements Document (Tomes 1 à 11 avec principes et extensions) et prompts de référence.

**Note de classement :** les documents portant un Volume officiel (Platform Bible, Engineering, Knowledge Bible) sont classés selon la structure officielle (Volume 0 → 1 → 2 → 3). Les PRD Tomes 1 à 11 et leurs extensions, antérieurs à la numérotation en volumes, sont regroupés en Partie V dans leur ordre d'origine. Les prompts de travail sont isolés en Partie VI.

---

## TABLE DES MATIÈRES

**PARTIE I — PLATFORM BIBLE**
- MEEREO Platform Documentation (organisation générale)
- Volume 0 – Méta-Architecture — Tome 0 : La Carte d'Architecture de MEEREO
- Volume 1 – Constitution — Tome 20 : La Constitution de MEEREO
- Volume 2 – Architecture Fonctionnelle — Tome 15 : MEEREO Core · Tome 16 : Business Object Model · Tome 17 : Knowledge Graph · Tome 18 : Digital Twin Engine · Tome 19 : KAI AI Operating System · Tome 21 : Le Protocole de Collaboration du MEEREO Core · Tome 22 : Le Modèle d'Exécution du MEEREO Core
- Volume 3 – Documentation Fonctionnelle des Modules — Tome 14 : Module 01 Cockpit Client · Tomes 14.1 à 14.10 (écrans et modules)

**PARTIE II — MEEREO ARCHITECTURE DECISION RECORDS (MADR)**
- MADR-0001 à MADR-0005

**PARTIE III — ENGINEERING MANUAL & HANDBOOK**
- Engineering Manual Vol. 1 Tome 1 : La Méthodologie Officielle de Développement
- Engineering Handbook Vol. 2 Tome 2 : AI Development Constitution
- Engineering Handbook Vol. 3 Tome 1 : Business Object Registry (BOR)

**PARTIE IV — KNOWLEDGE BIBLE**
- Vol. 1 Tome 1 : L'Ontologie Métier de MEEREO

**PARTIE V — PRODUCT REQUIREMENTS DOCUMENT (PRD)**
- Tome 1 : Vision, Philosophie, Architecture Fonctionnelle et Principes Fondamentaux
- Tome 2 : Workflow Complet du Client
- Principe Fondamental : Organisation des Projets par Missions
- Tome 3 : Le Professionnel (Parties 1, 2 et 3)
- Extensions : Référentiel documentaire & appels d'offres · Base de Connaissances Intelligente · Architecture de KAI · Event Engine · Jumeau Numérique du Projet · Workflow Engine
- Tome 4 : Le Cockpit Projet
- Tome 5 : Le Moteur des Permissions
- Tome 6 : Le Module Appels d'Offres
- Tome 7 : Le Passeport Numérique du Bâtiment
- Tome 8 : Le Marketplace Intelligent
- Extension : Asset Engine
- Tome 9 : Le Projet comme Cœur de l'Écosystème
- Tome 10 : Le Communication Hub
- Tome 11 : Le CRM Relationnel Intelligent
- Extension : Création du Cockpit lors de l'inscription

**PARTIE VI — PROMPTS DE RÉFÉRENCE**
- Prompt : Architecture des missions, coordination du projet et workflow des professionnels
- Prompt Maître : Génération des Workflows Officiels de MEEREO

---

# PARTIE I — PLATFORM BIBLE

## MEEREO PLATFORM DOCUMENTATION — Documentation Fonctionnelle et Technique Officielle

**Version :** 1.0 · **Statut :** Document de référence officiel · **Confidentialité :** Interne – MEEREO Project

### Objectif

Ce document constitue la documentation officielle de la plateforme MEEREO. Son objectif est de décrire précisément le fonctionnement de la plateforme afin de garantir une compréhension commune entre les équipes Produit, Design, Développement, QA, IA et les partenaires techniques.

Cette documentation sert de référence unique pour toutes les évolutions de MEEREO. Toute nouvelle fonctionnalité devra respecter les principes définis dans ce document.

### Organisation de la documentation

La documentation est organisée en quatre volumes.

#### Volume 1 — Vision & Fondations

Ce volume décrit la philosophie de MEEREO. Il répond à la question : *Pourquoi MEEREO existe-t-elle ?*

Il comprend notamment :

- Vision de MEEREO
- Philosophie produit
- Valeurs
- Principes fondateurs
- Les trois acteurs de la plateforme
- Les Cockpits métiers
- Le Projet comme centre de l'écosystème
- Les règles métier fondamentales
- Les workflows globaux
- Le rôle de KAI

#### Volume 2 — Architecture Fonctionnelle

Ce volume décrit le fonctionnement global de la plateforme. Il répond à la question : *Comment fonctionne MEEREO ?*

Il comprend notamment :

- Architecture générale
- Cockpit Client, Cockpit Professionnel, Cockpit Fournisseur, Cockpit Projet
- Communication Hub
- CRM Relationnel
- Marketplace
- Référentiel Documentaire
- Knowledge Graph
- Digital Asset Graph
- Workflow Engine, Event Engine, Rules Engine
- KAI
- Passeport Numérique du Bâtiment
- Asset Engine
- Gestion des permissions
- Notifications
- Agenda
- Recherche intelligente

#### Volume 3 — Documentation des Modules

Ce volume décrit chaque module de la plateforme. Chaque écran est documenté individuellement : chaque bouton, chaque composant, chaque interaction, chaque workflow, chaque événement, chaque permission, chaque automatisation.

Chaque module suit exactement la même structure.

**Structure standard d'un module :**

1. **Présentation** — Objectif métier. Valeur ajoutée. Utilisateurs concernés.
2. **Objectifs** — Pourquoi ce module existe. Quels problèmes il résout.
3. **Interface** — Description détaillée de l'écran. Organisation. Widgets. Menus. Navigation.
4. **Composants** — Liste complète des composants. Description de chacun. Conditions d'affichage.
5. **Workflow** — Fonctionnement détaillé. Étapes. Transitions. Cas particuliers.
6. **Actions utilisateur** — Tous les boutons. Toutes les actions. Tous les formulaires. Toutes les validations.
7. **Règles métier** — Contraintes. Calculs. Conditions. Exceptions.
8. **Permissions** — Qui peut voir. Qui peut créer. Qui peut modifier. Qui peut supprimer. Qui peut valider.
9. **Événements** — Liste complète des événements générés (exemples : ProjectCreated, MissionAssigned, DocumentUploaded, MessageSent, TenderAccepted).
10. **Intervention de KAI** — Ce que KAI observe, analyse, recommande, automatise, et ce qu'elle ne peut jamais faire.
11. **Interactions** — Connexion avec : CRM, Cockpit Projet, Marketplace, Documents, Communication Hub, Workflow Engine, Event Engine, Rules Engine, Notifications, Agenda, Asset Engine, Passeport Numérique.
12. **Roadmap** — Fonctionnalités déjà disponibles. Fonctionnalités prévues. Évolutions futures.

#### Volume 4 — Architecture Technique

Ce volume est destiné aux développeurs. Il décrit notamment :

- Architecture logicielle
- Services
- APIs
- Base de données
- Authentification
- Permissions
- Événements
- Intelligence artificielle
- Modèle de données
- Intégrations
- Sécurité
- Monitoring
- Déploiement
- Tests
- Performances

### Méthodologie

Chaque nouvelle fonctionnalité développée pour MEEREO devra être documentée avant son implémentation. Aucun développement ne devra être réalisé sans mise à jour de cette documentation. La documentation devient la source officielle de vérité du produit.

### Principe fondamental

MEEREO est un écosystème numérique dédié au secteur de la construction. Le Projet constitue le cœur de la plateforme. Les Cockpits métiers offrent un environnement de travail adapté à chaque acteur. Le Cockpit Projet centralise l'ensemble des opérations liées à un projet. Tous les modules collaborent autour d'un même référentiel de données. KAI accompagne les utilisateurs dans toutes les étapes du cycle de vie d'un projet.

Chaque fonctionnalité développée doit respecter cette architecture afin de garantir une plateforme cohérente, évolutive, sécurisée et orientée métier.

### Objectif final

Construire la documentation produit la plus complète possible afin qu'un développeur, un chef de projet, un designer UX/UI ou une intelligence artificielle puisse comprendre, maintenir et faire évoluer MEEREO sans ambiguïté. Cette documentation constitue la référence officielle de la plateforme et accompagne son évolution sur le long terme.

---

## VOLUME 0 – MÉTA-ARCHITECTURE

### TOME 0 — LA CARTE D'ARCHITECTURE DE MEEREO : LA STRUCTURE GLOBALE DE L'ÉCOSYSTÈME

**Version :** 1.0 · **Statut :** Document de Référence

#### 1. Vision

MEEREO est une plateforme multi-acteurs conçue comme un système d'exploitation métier pour le secteur du BTP.

Son architecture repose sur une séparation claire entre :

- l'expérience utilisateur ;
- les capacités métier ;
- les moteurs de décision ;
- les connaissances ;
- les données.

Chaque couche possède une responsabilité propre. Aucune couche ne doit empiéter sur une autre.

#### 2. Les cinq couches de MEEREO

**Couche 1 — L'Expérience**

Cette couche regroupe tous les points d'entrée des utilisateurs. Elle comprend notamment :

- Cockpit Client ;
- Cockpit Professionnel ;
- Cockpit Fournisseur ;
- Cockpit Projet ;
- Applications mobiles ;
- APIs publiques ;
- Portail public ;
- Page Professionnelle Publique.

*Responsabilité :* présenter les informations et recueillir les actions des utilisateurs. Elle ne contient aucune logique métier.

**Couche 2 — Les Capacités Métier**

Cette couche regroupe les domaines fonctionnels. Exemples :

- Gestion de Projet ;
- Appels d'Offres ;
- CRM ;
- Marketplace ;
- Communication Hub ;
- Référentiel Documentaire ;
- Asset Management ;
- Passeport Numérique.

*Responsabilité :* modéliser les capacités offertes par MEEREO. Ces domaines utilisent le MEEREO Core mais ne le remplacent pas.

**Couche 3 — Le MEEREO Core**

Cette couche orchestre toute la plateforme. Elle comprend :

- Identity Engine ;
- Permission Engine ;
- Rules Engine ;
- Workflow Engine ;
- Event Engine ;
- Automation Engine ;
- Notification Engine ;
- Search Engine ;
- Audit Engine ;
- AI Orchestrator.

*Responsabilité :* garantir la cohérence fonctionnelle. Aucune décision métier n'est prise en dehors du Core.

**Couche 4 — La Connaissance**

Cette couche représente ce que MEEREO sait. Elle comprend :

- Business Object Model ;
- Ontologie Métier ;
- Knowledge Graph ;
- Digital Twin.

*Responsabilité :* organiser, relier et contextualiser les connaissances de la plateforme. Cette couche est exploitée par KAI, par les moteurs du Core et par les modules métier.

**Couche 5 — Les Données**

Cette couche regroupe les informations persistantes. Exemples : données des projets, documents, utilisateurs, commandes, produits, actifs, historiques, événements.

*Responsabilité :* conserver les données de manière fiable, sécurisée et durable. Les données ne sont jamais consultées directement par les Cockpits.

#### 3. Les flux entre les couches

Le flux descendant est le suivant :

Utilisateur → Expérience → Capacités Métier → MEEREO Core → Connaissance → Données

Le flux remontant suit le chemin inverse. Chaque couche ne communique qu'avec les couches prévues par cette architecture.

#### 4. Le rôle de KAI

KAI n'appartient à aucune couche métier. Elle agit comme un assistant transversal.

Elle reçoit un contexte préparé par le MEEREO Core. Elle exploite les connaissances autorisées. Elle restitue des explications, des recommandations ou des propositions d'action.

KAI ne contourne jamais les responsabilités des autres couches.

#### 5. Les principes d'évolution

Toute nouvelle fonctionnalité doit être positionnée dans cette carte avant son développement. Le concepteur doit répondre aux questions suivantes :

- Dans quelle couche se situe cette fonctionnalité ?
- Modifie-t-elle une couche existante ou en crée-t-elle une nouvelle ?
- Respecte-t-elle les responsabilités de chaque couche ?
- Peut-elle réutiliser un composant existant ?

Si une fonctionnalité traverse plusieurs couches sans justification, son architecture doit être revue.

#### 6. Les interdictions

Il est interdit :

- qu'un Cockpit accède directement aux données ;
- qu'un module métier contourne le Core ;
- qu'un moteur modifie directement les interfaces ;
- que KAI accède directement aux données persistantes ;
- qu'une logique métier soit dupliquée dans plusieurs couches.

#### 7. Objectif

Cette carte constitue la représentation officielle de l'architecture de MEEREO. Elle permet à toute personne ou toute intelligence artificielle de comprendre immédiatement :

- où se situe une responsabilité ;
- où une évolution doit être réalisée ;
- comment les composants interagissent.

Elle constitue le point de départ de toute évolution de la plateforme.

#### Principe fondateur

MEEREO est construit par couches indépendantes mais coopérantes. Chaque couche protège les autres de la complexité qu'elle encapsule.

Cette organisation garantit une plateforme durable, évolutive et compréhensible, quels que soient les métiers, les pays ou les technologies qui viendront s'y intégrer.

---

## VOLUME 1 – CONSTITUTION

### TOME 20 — LA CONSTITUTION DE MEEREO : LES PRINCIPES FONDATEURS

**Version :** 1.0 · **Statut :** Document de Gouvernance de la Plateforme

#### Préambule

Cette Constitution définit les principes immuables qui gouvernent la conception, le développement et l'évolution de MEEREO. Elle constitue la référence suprême de la plateforme.

Toute nouvelle fonctionnalité, tout nouveau module, toute évolution technique ou fonctionnelle doit être conforme à ces principes. En cas de conflit entre une implémentation et la Constitution, la Constitution prévaut.

#### Article 1 — Le Projet est le centre de l'écosystème

Tout dans MEEREO gravite autour du Projet. Le Projet est le point d'origine des missions, des documents, des décisions, des intervenants, des actifs, des commandes et du Passeport Numérique.

Aucun module ne doit rompre cette logique.

#### Article 2 — Un seul référentiel par information

Une information est créée une seule fois. Elle est ensuite référencée par les autres modules.

La duplication de données est interdite, sauf lorsqu'elle répond à une exigence technique clairement justifiée (performance, archivage, résilience ou intégration) et reste maîtrisée.

Le Référentiel Documentaire constitue l'unique source documentaire.

#### Article 3 — Les règles métier sont centralisées

Les règles métier appartiennent exclusivement au Rules Engine. Les Cockpits, les APIs et KAI ne doivent jamais contenir de logique métier divergente.

#### Article 4 — Les workflows gouvernent les évolutions

Les changements d'état des objets métier sont exclusivement pilotés par le Workflow Engine. Aucun module ne modifie directement un état métier.

#### Article 5 — Les événements sont la mémoire des actions

Toute action importante génère un événement. Les événements sont immuables. Ils assurent la traçabilité de la plateforme.

#### Article 6 — Les décisions restent humaines

KAI peut expliquer. KAI peut recommander. KAI peut préparer. KAI ne décide jamais à la place des utilisateurs.

Les décisions engageant juridiquement, financièrement ou contractuellement les acteurs nécessitent une validation humaine.

#### Article 7 — Les permissions sont contextuelles

Les permissions dépendent :

- du rôle ;
- du projet ;
- de la mission ;
- du contexte ;
- des règles métier.

Aucun utilisateur ne possède de privilège permanent hors de son contexte d'autorisation.

#### Article 8 — Le Cockpit est une interface

Les Cockpits ne contiennent pas la logique métier. Ils présentent les données. Ils exécutent les interactions utilisateur. Ils s'appuient sur le MEEREO Core.

#### Article 9 — Les Business Objects sont le langage commun

Tous les objets manipulés par la plateforme héritent du Business Object Model. Tout nouveau module doit s'intégrer à ce modèle.

#### Article 10 — Le Knowledge Graph est la mémoire relationnelle

Toutes les relations importantes sont enregistrées dans le Knowledge Graph. Le graphe constitue la représentation officielle des liens entre les objets métier.

#### Article 11 — Le Digital Twin représente le patrimoine

Chaque projet construit progressivement son Jumeau Numérique. Le Passeport Numérique constitue une représentation opérationnelle issue du Digital Twin. Le Digital Twin conserve une vision complète et évolutive du cycle de vie de l'ouvrage.

#### Article 12 — KAI est une couche d'assistance

KAI accompagne les utilisateurs. Elle n'est jamais propriétaire des données. Elle respecte les permissions. Elle agit exclusivement par l'intermédiaire du MEEREO Core.

#### Article 13 — La transparence est un principe

Toute action importante doit pouvoir être expliquée. Les utilisateurs doivent comprendre :

- pourquoi une décision est proposée ;
- pourquoi une règle s'applique ;
- pourquoi une action est refusée.

Les recommandations de KAI doivent être explicables.

#### Article 14 — La traçabilité est obligatoire

Les décisions, validations, transitions, documents, événements et interventions doivent être historisés conformément aux politiques de conservation de la plateforme. La traçabilité constitue une valeur fondamentale de MEEREO.

#### Article 15 — L'évolutivité est une exigence

Toute évolution de la plateforme doit pouvoir être réalisée sans remettre en cause les fondations du MEEREO Core. Les nouveaux modules doivent respecter les interfaces, les moteurs et les principes existants.

#### Article 16 — La modularité est la règle

Chaque composant possède une responsabilité clairement définie. Aucun module ne doit cumuler plusieurs responsabilités incompatibles. La communication entre modules passe par les interfaces prévues par le Core.

#### Article 17 — La sécurité est transversale

La sécurité n'est pas un module. Elle constitue une exigence applicable à toute la plateforme. Authentification, autorisation, journalisation, protection des données et confidentialité sont prises en compte dès la conception.

#### Article 18 — L'expérience utilisateur prime sur la complexité

La complexité technique doit rester invisible pour les utilisateurs. Chaque écran doit privilégier la simplicité, la clarté et l'accompagnement. KAI contribue à rendre les processus compréhensibles sans masquer les responsabilités de chacun.

#### Article 19 — Les données appartiennent à leurs propriétaires

Les données créées par les clients, les professionnels et les fournisseurs restent sous leur contrôle, sous réserve des obligations légales, contractuelles et des règles de fonctionnement de la plateforme. La plateforme ne détourne pas leur usage.

#### Article 20 — MEEREO est une plateforme vivante

MEEREO est conçu pour évoluer. Toute évolution doit renforcer :

- la collaboration ;
- la transparence ;
- la confiance ;
- la qualité des données ;
- la mémoire numérique du patrimoine bâti.

Aucune évolution ne doit affaiblir ces principes.

#### Clause finale

Cette Constitution constitue le fondement de toutes les décisions de conception, de développement et d'exploitation de MEEREO. Chaque développeur, architecte, designer, chef de produit, agent d'intelligence artificielle ou partenaire technique intervenant sur la plateforme est invité à s'y référer avant toute évolution.

Le respect de ces principes garantit la cohérence de l'écosystème MEEREO, aujourd'hui comme dans ses futures évolutions.

---

## VOLUME 2 – ARCHITECTURE FONCTIONNELLE

### TOME 15 — MEEREO CORE : LE NOYAU DE LA PLATEFORME

**Version :** 1.0 · **Statut :** Documentation d'Architecture

#### 1. Vision

Le MEEREO Core est le noyau fonctionnel de la plateforme. Il coordonne tous les moteurs, applique les règles métier, distribue les événements, orchestre les workflows et garantit la cohérence globale de l'écosystème.

Les modules visibles par les utilisateurs (Cockpits, Marketplace, CRM, Communication Hub, etc.) ne contiennent aucune logique métier critique. Ils interagissent exclusivement avec le MEEREO Core.

Cette architecture permet d'assurer une plateforme évolutive, cohérente et indépendante de l'interface utilisateur.

#### 2. Philosophie

Le MEEREO Core est responsable de toutes les décisions métier. Les interfaces sont responsables de l'expérience utilisateur.

Cette séparation garantit :

- une logique unique ;
- une cohérence entre tous les Cockpits ;
- une maintenance simplifiée ;
- une meilleure évolutivité.

#### 3. Composition du MEEREO Core

Le noyau est composé des moteurs suivants :

- **Workflow Engine** — pilote les cycles de vie des objets métier.
- **Rules Engine** — vérifie les règles métier avant toute action.
- **Event Engine** — diffuse les événements à l'ensemble de la plateforme.
- **Automation Engine** — exécute les actions automatiques consécutives aux événements et aux transitions.
- **Notification Engine** — centralise toutes les notifications. Il décide : qui notifier, quand notifier, par quel canal notifier.
- **Permission Engine** — calcule les droits d'accès. Les permissions sont dynamiques. Elles dépendent notamment : du rôle, du projet, de la mission, du contexte.
- **Search Engine** — fournit une recherche globale. Tous les Cockpits utilisent le même moteur.
- **Knowledge Engine** — construit le graphe de connaissances de MEEREO. Il relie : projets, missions, documents, actifs, entreprises, CRM, décisions, événements. Cette connaissance est exploitée par KAI.
- **Audit Engine** — conserve l'historique officiel. Toutes les actions importantes y sont enregistrées. L'historique est immuable.
- **AI Orchestrator** — constitue l'interface entre le MEEREO Core et KAI. Son rôle est de : transmettre le contexte pertinent ; appliquer les autorisations ; limiter les informations transmises aux droits de l'utilisateur ; recevoir les recommandations de KAI ; distribuer les réponses aux modules concernés. KAI ne dialogue jamais directement avec les bases de données. Toutes les interactions passent par cet orchestrateur.

#### 4. Architecture de communication

Les modules fonctionnels communiquent uniquement avec le MEEREO Core.

Exemple : Cockpit Client → MEEREO Core → Workflow Engine → Rules Engine → Automation Engine → Event Engine → Notification Engine → Mise à jour des modules → Réponse au Cockpit Client.

Cette architecture garantit que toutes les décisions passent par le même chemin.

#### 5. KAI

KAI est une couche d'intelligence. Elle ne remplace aucun moteur.

Elle observe les événements autorisés. Elle analyse les données. Elle formule des recommandations. Elle prépare des automatisations. Elle répond aux utilisateurs.

Mais toutes ses actions passent par le MEEREO Core.

#### 6. Évolutivité

Le MEEREO Core est conçu pour permettre l'ajout de nouveaux modules sans remettre en cause les fondations.

Exemples : nouveaux métiers, nouveaux pays, nouvelles réglementations, nouveaux moteurs, nouveaux Cockpits.

Chaque nouveau composant se connecte au Core en respectant les interfaces et les règles existantes.

#### 7. Sécurité

Le MEEREO Core applique systématiquement :

- l'authentification ;
- les permissions ;
- les règles métier ;
- la journalisation.

Aucune action critique ne peut contourner le noyau.

#### 8. Principe fondamental

Le MEEREO Core constitue le cœur fonctionnel de la plateforme. Toutes les décisions métier transitent par lui. Tous les modules visibles ne sont que des interfaces spécialisées s'appuyant sur ce noyau commun.

Cette architecture garantit que MEEREO reste cohérente, sécurisée, évolutive et capable d'intégrer de nouveaux métiers sans remettre en cause les fondations existantes.

---

### TOME 16 — BUSINESS OBJECT MODEL : LE MODÈLE D'OBJETS MÉTIER UNIFIÉ

**Version :** 1.0 · **Statut :** Documentation d'Architecture

#### 1. Vision

Le Business Object Model constitue le modèle de données fonctionnel universel de MEEREO. Tous les éléments manipulés par la plateforme sont considérés comme des Objets Métier.

Le Core ne traite jamais un Projet, un Document ou une Mission comme des cas particuliers. Il manipule un Business Object possédant des caractéristiques communes. Chaque type d'objet spécialise ensuite ce comportement général.

Cette architecture permet de créer une plateforme cohérente, extensible et évolutive.

#### 2. Philosophie

Tout élément ayant une existence dans MEEREO est un Business Object.

Exemples : Projet, Mission, Entreprise, Client, Fournisseur, Document, Appel d'Offres, Produit, Commande, Actif, Passeport Numérique, Conversation, Message, Décision, Tâche, Jalon, Notification.

Tous héritent d'un comportement commun.

#### 3. Structure commune

Chaque Business Object possède obligatoirement :

- **Identité** — identifiant unique, type d'objet, référence interne.
- **Propriétaire** — chaque objet possède un propriétaire. Selon le contexte : Client, Entreprise, Projet, Plateforme.
- **Cycle de vie** — chaque objet possède : un état, un workflow, un historique.
- **Permissions** — chaque objet définit : qui peut voir, qui peut modifier, qui peut supprimer, qui peut valider, qui peut partager. Les permissions sont calculées dynamiquement.
- **Historique** — toutes les modifications sont historisées. L'historique est immuable.
- **Relations** — chaque objet peut être relié à d'autres objets. Exemple : un document peut être lié à un projet, à une mission, à un actif, à une entreprise, à une décision. Les relations sont natives.
- **Documents** — chaque objet peut posséder : des documents, des images, des vidéos, des pièces jointes.
- **Conversations** — chaque objet peut générer une conversation. Exemples : une mission → conversation de mission ; un appel d'offres → conversation spécifique ; une commande → conversation fournisseur.
- **Événements** — chaque objet produit des événements. Exemples : création, modification, validation, archivage, suppression logique.

#### 4. Héritage

Le Projet hérite du Business Object. La Mission hérite du Business Object. Le Document hérite du Business Object. Le Produit hérite du Business Object. Le Passeport Numérique hérite du Business Object.

Chaque objet ajoute uniquement ses propriétés spécifiques.

#### 5. Avantages

Cette architecture permet :

- une logique uniforme ;
- des APIs homogènes ;
- des permissions communes ;
- une meilleure évolutivité ;
- une réduction du code spécifique ;
- une simplification des moteurs du Core.

#### 6. Utilisation par les moteurs

Le Workflow Engine manipule des Business Objects. Le Rules Engine applique des règles aux Business Objects. L'Event Engine diffuse les événements des Business Objects. Le Notification Engine notifie les changements des Business Objects. Le Search Engine indexe les Business Objects. Le Knowledge Engine relie les Business Objects. L'Automation Engine exécute des actions sur les Business Objects.

Cette homogénéité réduit fortement la complexité globale de la plateforme.

#### 7. Interaction avec KAI

KAI ne raisonne pas uniquement sur des modules. Elle raisonne sur des Objets Métier.

Elle peut comprendre qu'un projet est lié : à une entreprise, à des documents, à des décisions, à des commandes, à des actifs. Toutes ces relations sont disponibles via le Business Object Model.

Cette vision unifiée améliore la qualité des recommandations.

#### 8. Principe fondamental

Le Business Object Model constitue le langage commun de toute la plateforme. Tous les moteurs du MEEREO Core manipulent des Objets Métier standardisés.

Chaque nouveau module développé devra s'appuyer sur ce modèle afin de garantir la cohérence de l'ensemble de l'écosystème.

---

### TOME 17 — KNOWLEDGE GRAPH : LE GRAPHE DE CONNAISSANCES MÉTIER DE MEEREO

**Version :** 1.0 · **Statut :** Documentation d'Architecture

#### 1. Vision

Le Knowledge Graph constitue la mémoire relationnelle de MEEREO. Il ne stocke pas uniquement des données. Il représente les relations entre les objets métier de la plateforme.

Grâce à lui, KAI ne raisonne plus uniquement à partir de documents ou de conversations. Elle raisonne à partir des liens qui unissent les projets, les acteurs, les actifs, les documents, les décisions et les événements.

Le Knowledge Graph est l'une des fondations de l'intelligence de MEEREO.

#### 2. Philosophie

Les données n'ont de valeur que lorsqu'elles sont reliées.

Un projet n'existe pas isolément. Il est relié : à un client, à une entreprise, à des missions, à des documents, à des actifs, à des commandes, à des validations, à des décisions, à des événements.

Le Knowledge Graph mémorise ces relations.

#### 3. Les nœuds

Chaque Business Object devient un nœud du graphe.

Exemples : Projet, Mission, Entreprise, Client, Fournisseur, Produit, Commande, Document, Actif, Passeport Numérique, Conversation, Décision, Notification, Utilisateur.

Chaque nœud possède son identifiant unique et ses métadonnées.

#### 4. Les relations

Les relations décrivent les liens entre les objets.

Exemples :

- Projet **EST_POSSÉDÉ_PAR** Client
- Mission **FAIT_PARTIE_DE** Projet
- Document **EST_ASSOCIÉ_À** Mission
- Entreprise **INTERVIENT_SUR** Projet
- Produit **EST_INSTALLÉ_DANS** Actif
- Actif **APPARTIENT_À** Passeport Numérique
- Décision **CONCERNE** Mission

Les relations sont historisées.

#### 5. Construction automatique

Le Knowledge Graph est alimenté automatiquement. Chaque événement important enrichit le graphe.

Exemples : création d'un projet → création du nœud Projet → création de la relation Projet APPARTIENT_À Client. Puis : mission créée → nouvelle relation ; entreprise intégrée → nouvelle relation ; document ajouté → nouvelle relation.

Le graphe évolue naturellement avec la plateforme.

#### 6. Utilisation par KAI

KAI interroge le Knowledge Graph afin de comprendre le contexte.

Exemple. Question : « Quels sont tous les intervenants ayant travaillé sur la toiture ? »

KAI suit les relations : Projet → Mission Construction → Entreprise → Documents → Produits → Actifs → Décisions. Elle construit une réponse contextualisée.

#### 7. Recherche intelligente

Le moteur de recherche utilise le Knowledge Graph.

Exemple. Recherche : « Montre-moi tous les bâtiments utilisant cette référence de climatiseur. »

Le graphe retrouve : Produit → Actifs → Projets → Passeports Numériques. Le résultat est obtenu sans recherche textuelle classique.

#### 8. Détection d'impacts

Le Knowledge Graph permet d'identifier les conséquences d'une modification.

Exemple. Un document est remplacé. Le système identifie immédiatement : les missions concernées, les actifs concernés, les commandes concernées, les validations concernées, les entreprises concernées.

KAI peut alors proposer les actions nécessaires.

#### 9. Apprentissage

Le Knowledge Graph évolue automatiquement. Il est enrichi par : les nouveaux projets, les nouvelles missions, les nouvelles entreprises, les documents, les décisions, les événements.

Il ne nécessite aucune mise à jour manuelle.

#### 10. Interaction avec les moteurs

- Workflow Engine → modifie les relations.
- Rules Engine → vérifie les relations.
- Event Engine → alimente le graphe.
- Automation Engine → crée automatiquement certaines relations.
- Notification Engine → identifie les acteurs concernés.
- KAI → raisonne sur le graphe.

Tous les moteurs utilisent la même représentation des connaissances.

#### 11. Sécurité

Le Knowledge Graph respecte les permissions. Les relations existent, mais un utilisateur ne peut consulter que les nœuds et les liens auxquels il est autorisé.

KAI applique exactement les mêmes règles. Aucune information confidentielle n'est révélée.

#### 12. Principe fondamental

Le Knowledge Graph constitue la mémoire relationnelle de MEEREO. Il relie tous les objets métier de la plateforme afin de fournir un contexte complet aux moteurs du Core et à KAI.

Grâce à cette architecture, les réponses, les recommandations et les automatisations reposent sur les relations réelles entre les acteurs, les projets, les documents, les actifs et les décisions, et non uniquement sur des recherches textuelles ou des données isolées.

---

### TOME 18 — DIGITAL TWIN ENGINE : LE JUMEAU NUMÉRIQUE DU BÂTIMENT

**Version :** 1.0 · **Statut :** Documentation d'Architecture

#### 1. Vision

Le Digital Twin Engine est le moteur chargé de construire et de maintenir le Jumeau Numérique de chaque projet et de chaque bâtiment.

Le Jumeau Numérique représente l'ensemble des informations techniques, fonctionnelles, documentaires, relationnelles et historiques liées à un ouvrage. Il accompagne le bâtiment depuis sa création jusqu'à sa fin de vie.

Le Jumeau Numérique n'est pas une simple maquette. Il constitue la mémoire vivante du bâtiment.

#### 2. Philosophie

Le Jumeau Numérique est construit progressivement. Il ne naît pas à la réception du chantier. Il commence dès la création du projet.

Chaque événement enrichit le Jumeau Numérique : chaque mission, chaque document, chaque actif, chaque commande, chaque garantie, chaque décision, chaque intervention.

Toutes ces informations participent à la construction du patrimoine numérique du bâtiment.

#### 3. Le cycle de vie

Le Digital Twin évolue selon les phases suivantes :

- **Phase 1 — Projet.** Le Jumeau contient principalement : informations générales, programme, acteurs, documents initiaux.
- **Phase 2 — Conception.** Le Jumeau s'enrichit : plans, études, variantes, validations.
- **Phase 3 — Construction.** Le Jumeau reçoit : missions, commandes, matériaux, produits, actifs installés, photographies, contrôles, comptes rendus.
- **Phase 4 — Réception.** Le Passeport Numérique est généré. Le Jumeau est consolidé. Toutes les garanties sont associées. Les DOE sont intégrés. Les équipements sont référencés.
- **Phase 5 — Exploitation.** Le Jumeau continue d'évoluer. Il mémorise : maintenances, remplacements, interventions, nouveaux documents, nouvelles garanties. Le bâtiment continue à vivre dans MEEREO.

#### 4. Les composants

Le Digital Twin regroupe notamment :

- **Le Projet** — origine du Jumeau.
- **Les Missions** — historique des interventions.
- **Les Entreprises** — tous les intervenants.
- **Les Documents** — tous les documents validés.
- **Les Produits** — tous les produits installés.
- **Les Actifs** — tous les équipements.
- **Les Garanties** — toutes les garanties.
- **Les Contrats** — historique contractuel.
- **Les Décisions** — toutes les décisions importantes.
- **Les Événements** — historique complet.
- **Les Conversations** — historique des échanges associés au projet lorsque leur conservation est prévue par les règles de la plateforme.

#### 5. Le Passeport Numérique

Le Passeport Numérique constitue une composante du Digital Twin. Il représente la version opérationnelle destinée à l'exploitation du bâtiment. Il est automatiquement alimenté par le Digital Twin.

Le Passeport privilégie les informations utiles à la gestion et à la maintenance, tandis que le Digital Twin conserve l'historique complet du cycle de vie.

#### 6. Interaction avec les actifs

Chaque actif installé devient immédiatement un composant du Jumeau.

Le Digital Twin connaît notamment : son emplacement, son fabricant, son fournisseur, son installateur, sa garantie, ses documents techniques, son historique de maintenance.

#### 7. Interaction avec KAI

KAI interroge le Digital Twin afin de comprendre le bâtiment. Elle peut répondre à des questions telles que :

- Qui a installé cet équipement ?
- Quelle est la garantie de cette pompe ?
- Quand cette fenêtre a-t-elle été remplacée ?
- Quels documents concernent cette façade ?
- Quels équipements nécessitent une maintenance cette année ?

Les réponses sont construites à partir des informations autorisées du Jumeau Numérique.

#### 8. Interaction avec le Knowledge Graph

Le Digital Twin utilise le Knowledge Graph pour représenter les relations entre les objets métier. Le Knowledge Graph fournit les liens. Le Digital Twin fournit la représentation fonctionnelle et évolutive du bâtiment.

Les deux composants sont complémentaires.

#### 9. Interaction avec le MEEREO Core

Le Digital Twin est alimenté par : Workflow Engine, Event Engine, Automation Engine, Référentiel Documentaire, Asset Engine, CRM, Marketplace.

Il ne crée pas les données. Il les consolide et les organise.

#### 10. Règles métier

- Le Digital Twin est créé automatiquement lors de la création du projet.
- Il évolue sans interruption pendant toute la vie du bâtiment.
- Aucune donnée n'est supprimée du Jumeau Numérique ; lorsqu'une information devient obsolète, elle est historisée selon les politiques de conservation de la plateforme.
- Chaque élément reste relié à son historique et à son contexte.

#### 11. Critères d'acceptation

Le Digital Twin est conforme lorsque :

- il est créé dès l'ouverture du projet ;
- il s'enrichit automatiquement ;
- les actifs sont correctement associés ;
- les documents sont reliés ;
- les garanties sont disponibles ;
- le Passeport Numérique est généré à partir de ses données ;
- KAI peut exploiter le contexte autorisé.

#### 12. Principe fondamental

Le Digital Twin est la représentation numérique vivante du bâtiment. Il rassemble l'ensemble des connaissances produites pendant le cycle de vie du projet. Il permet à MEEREO de conserver la mémoire technique, documentaire, relationnelle et opérationnelle d'un ouvrage bien au-delà de sa construction.

Le Digital Twin devient ainsi le socle numérique sur lequel s'appuient les utilisateurs, les moteurs du MEEREO Core et KAI pour comprendre, exploiter et faire évoluer le patrimoine bâti.

---

### TOME 19 — KAI AI OPERATING SYSTEM : ARCHITECTURE DE L'INTELLIGENCE ARTIFICIELLE DE MEEREO

**Version :** 1.0 · **Statut :** Documentation d'Architecture

#### 1. Vision

KAI est le système d'intelligence artificielle de MEEREO. Elle accompagne tous les utilisateurs de la plateforme.

KAI n'est pas un chatbot. KAI est un ensemble coordonné d'agents spécialisés. Ces agents collaborent afin d'assister les utilisateurs, d'automatiser certaines tâches, d'expliquer les workflows, de rechercher les informations pertinentes et de proposer des recommandations.

Pour l'utilisateur, KAI apparaît comme un assistant unique. En réalité, plusieurs agents travaillent simultanément en arrière-plan.

#### 2. Philosophie

KAI n'est jamais propriétaire des données. Elle ne modifie jamais directement les objets métier.

Elle consulte les informations autorisées. Elle analyse. Elle explique. Elle recommande. Elle prépare. Elle automatise lorsque cela est explicitement autorisé par les règles métier et les préférences de l'utilisateur.

Toutes les décisions importantes restent humaines.

#### 3. Le rôle de KAI

KAI intervient comme : assistant personnel, assistant métier, assistant documentaire, assistant projet, assistant commercial, assistant technique.

Son comportement dépend du contexte.

#### 4. Les agents spécialisés

L'architecture de KAI repose sur plusieurs agents.

- **Agent Conversation** — gère les échanges avec les utilisateurs. Comprend les intentions. Reformule si nécessaire. Distribue les demandes aux autres agents.
- **Agent Projet** — analyse les projets. Suit les workflows. Détecte les retards. Propose les prochaines étapes.
- **Agent Documents** — comprend les documents. Recherche les informations. Prépare les dossiers. Détecte les documents manquants.
- **Agent CRM** — analyse les relations. Retrouve les collaborations passées. Suggère des partenaires. Prépare des synthèses relationnelles.
- **Agent Marketplace** — accompagne les recherches de produits. Propose des alternatives. Retrouve les garanties. Relie les produits aux actifs.
- **Agent Workflow** — explique les étapes. Détecte les blocages. Guide les utilisateurs. Ne modifie jamais directement le Workflow.
- **Agent Recherche** — interroge : le Knowledge Graph, les Business Objects, les Documents, les Conversations, les Actifs. Construit une réponse unifiée.
- **Agent Passeport Numérique** — accompagne les utilisateurs dans la compréhension du bâtiment. Retrouve : garanties, historiques, interventions, actifs.
- **Agent Entreprise** — assiste les professionnels. Prépare : réponses aux appels d'offres, présentations, dossiers commerciaux. Peut proposer des réponses automatiques aux demandes reçues via le Communication Hub si l'entreprise l'a configuré.
- **Agent Client** — accompagne le client. Explique les projets. Traduit le vocabulaire technique. Présente les décisions à prendre.
- **Agent Fournisseur** — accompagne les fournisseurs. Analyse : produits, commandes, catalogues, fiches techniques.

#### 5. Orchestration

Les agents ne travaillent jamais seuls. Leur coordination est assurée par l'AI Orchestrator du MEEREO Core.

Exemple. Question : « Quel bureau d'études structure me recommandes-tu pour ce projet ? »

L'Orchestrateur sollicite : Agent Projet, Agent CRM, Agent Recherche, Agent Workflow. Les résultats sont fusionnés. Une réponse unique est produite.

#### 6. Sources d'information

KAI peut exploiter les informations auxquelles l'utilisateur est autorisé à accéder, notamment : Business Objects, Knowledge Graph, Référentiel Documentaire, CRM, Workflow Engine, Event Engine, Passeport Numérique, Asset Engine, Communication Hub, Marketplace.

Elle ne contourne jamais les permissions.

#### 7. Limites

KAI ne peut jamais :

- signer un contrat ;
- engager une entreprise ;
- attribuer définitivement un marché ;
- modifier les règles métier ;
- changer un workflow ;
- valider une étape à la place d'un utilisateur ;
- contourner les permissions.

Toutes les actions sensibles nécessitent une validation humaine.

#### 8. Mémoire

KAI distingue plusieurs niveaux de mémoire :

- **Mémoire de conversation** — contexte de l'échange en cours.
- **Mémoire de projet** — informations relatives au projet actif.
- **Mémoire documentaire** — documents autorisés.
- **Mémoire relationnelle** — informations issues du CRM et du Knowledge Graph.
- **Mémoire de plateforme** — connaissances générales sur MEEREO et ses fonctionnalités.

Chaque niveau de mémoire respecte les permissions applicables.

#### 9. Apprentissage

KAI n'altère jamais les données métier à partir de suppositions.

Les améliorations de ses recommandations reposent sur : les données validées, les workflows, les décisions humaines, les retours explicites des utilisateurs lorsque ceux-ci sont disponibles.

Toute évolution du comportement de KAI doit rester traçable.

#### 10. Interaction avec le MEEREO Core

Toutes les requêtes transitent par l'AI Orchestrator. KAI ne dialogue jamais directement avec les bases de données.

Le MEEREO Core : vérifie les permissions, prépare le contexte, transmet uniquement les données nécessaires, contrôle les actions proposées.

#### 11. Exemples d'assistance

- **Client :** « Explique-moi pourquoi cette mission est bloquée. »
- **Professionnel :** « Prépare une réponse à cet appel d'offres. »
- **Fournisseur :** « Quels produits sont les plus demandés ce mois-ci ? »
- **Exploitant :** « Quand faut-il remplacer cette pompe ? »

KAI construit ses réponses à partir du contexte autorisé.

#### 12. Principe fondamental

KAI est l'intelligence de MEEREO. Elle n'est ni un moteur métier, ni une base de données, ni un décideur.

Elle constitue une couche d'assistance intelligente reposant sur le MEEREO Core, le Knowledge Graph, le Digital Twin et les Business Objects. Son objectif est de rendre la plateforme plus simple, plus compréhensible et plus proactive, tout en laissant aux utilisateurs la maîtrise des décisions et en respectant strictement les règles métier et les permissions.

---

### TOME 21 — LE PROTOCOLE DE COLLABORATION DU MEEREO CORE : COMMENT LES MOTEURS COLLABORENT ENTRE EUX

**Version :** 1.0 · **Statut :** Documentation d'Architecture

#### 1. Vision

Le MEEREO Core est constitué d'un ensemble de moteurs spécialisés. Chaque moteur possède une responsabilité unique. Aucun moteur ne remplit le rôle d'un autre.

L'objectif est de construire une architecture faiblement couplée, hautement cohérente et facilement extensible. Tous les moteurs collaborent selon un protocole unique. Ce protocole est obligatoire.

#### 2. Les moteurs du Core

Le Core est composé des moteurs suivants :

- Identity Engine
- Permission Engine
- Rules Engine
- Workflow Engine
- Event Engine
- Automation Engine
- Notification Engine
- Search Engine
- Knowledge Graph
- Digital Twin Engine
- Audit Engine
- AI Orchestrator

Chaque moteur est indépendant. Ils communiquent exclusivement par des contrats clairement définis.

#### 3. Principe fondamental

Un moteur ne modifie jamais directement les données d'un autre moteur. Il émet une demande. Le moteur responsable décide.

Cette règle garantit : l'absence de dépendances circulaires, une meilleure testabilité, une meilleure évolutivité, une responsabilité claire.

#### 4. Séquence de traitement standard

Toute action métier importante suit la séquence suivante.

- **Étape 1 — Réception de la demande.** La demande peut provenir : d'un Cockpit, d'une API, d'un partenaire, d'une automatisation, de KAI (proposition d'action), d'un traitement planifié. Le Core crée un contexte d'exécution.
- **Étape 2 — Authentification.** L'Identity Engine vérifie : l'identité, la session, le contexte de sécurité. Si cette étape échoue, le traitement s'arrête.
- **Étape 3 — Permissions.** Le Permission Engine répond aux questions suivantes : l'utilisateur peut-il voir cet objet ? peut-il agir dessus ? dans quel contexte ? Sans permission valide, aucune action n'est exécutée.
- **Étape 4 — Règles métier.** Le Rules Engine vérifie : les prérequis, les contraintes métier, les validations obligatoires, les dépendances. Il renvoie : Autorisé, ou Refusé avec justification.
- **Étape 5 — Workflow.** Le Workflow Engine vérifie : la transition demandée, l'état actuel, les états autorisés. Il applique ensuite la transition.
- **Étape 6 — Événements.** Le Workflow Engine publie les événements. Ces événements sont transmis à l'Event Engine. L'Event Engine devient la source officielle de diffusion.
- **Étape 7 — Automatisations.** L'Automation Engine analyse les événements. Il exécute les actions prévues. Exemples : création d'une mission, génération d'un CRM, création d'une conversation, préparation d'une tâche, mise à jour d'un tableau de bord. Toutes les automatisations sont traçables.
- **Étape 8 — Mise à jour des connaissances.** Le Knowledge Graph est enrichi. Les nouvelles relations sont créées ou mises à jour. Si nécessaire, le Digital Twin est également enrichi.
- **Étape 9 — Journalisation.** L'Audit Engine enregistre : la demande, les décisions, les transitions, les événements, les automatisations exécutées. Cette journalisation est immuable.
- **Étape 10 — Notifications.** Le Notification Engine identifie : les destinataires, les canaux, le niveau de priorité. Il prépare les notifications.
- **Étape 11 — Assistance de KAI.** L'AI Orchestrator reçoit le nouveau contexte. KAI peut : expliquer le résultat, résumer les changements, proposer les prochaines étapes, détecter des anomalies. KAI n'exécute jamais d'action métier supplémentaire sans une nouvelle demande conforme aux règles.
- **Étape 12 — Réponse.** Le résultat est renvoyé : au Cockpit, à l'API, à l'application mobile, ou au système appelant. Toutes les interfaces reçoivent une réponse cohérente.

#### 5. Exemple complet

Cas : le Bureau d'Architecture souhaite intégrer une Entreprise de Construction.

Le protocole est le suivant :

1. Le Cockpit Professionnel transmet la demande.
2. L'Identity Engine vérifie l'identité.
3. Le Permission Engine confirme que l'utilisateur peut gérer ce projet.
4. Le Rules Engine vérifie que cette intégration respecte les règles métier et les validations attendues.
5. Le Workflow Engine exécute la transition correspondante.
6. L'Event Engine publie l'événement « ProfessionalIntegrated ».
7. L'Automation Engine : crée la mission Construction ; ouvre le CRM Intervenant ; crée la conversation de mission ; initialise les permissions ; prépare les tâches initiales.
8. Le Knowledge Graph relie l'entreprise au projet et à la mission.
9. Le Digital Twin enregistre le nouvel intervenant comme acteur du cycle de vie du bâtiment.
10. L'Audit Engine journalise toutes les étapes.
11. Le Notification Engine informe le client, le coordinateur technique et l'entreprise intégrée.
12. KAI met à jour son contexte et peut expliquer au client les conséquences de cette intégration.

#### 6. Règles d'orchestration

Les moteurs ne doivent jamais :

- contourner un autre moteur ;
- modifier directement les données d'un moteur tiers ;
- ignorer les permissions ;
- ignorer les règles métier ;
- créer des événements sans passer par l'Event Engine.

Toute interaction suit le protocole officiel.

#### 7. Tolérance aux erreurs

Chaque moteur doit être capable de signaler un échec.

Le Core doit : interrompre proprement le traitement si une étape critique échoue ; éviter les mises à jour partielles ; conserver les informations nécessaires au diagnostic.

Les actions doivent être conçues pour être rejouables lorsque cela est pertinent.

#### 8. Évolutivité

Tout nouveau moteur ajouté au Core devra :

- avoir une responsabilité clairement définie ;
- respecter le protocole de collaboration ;
- ne pas remettre en cause les responsabilités des moteurs existants.

#### 9. Impact sur les développements futurs

Avant de développer une fonctionnalité, le développeur doit être capable de répondre aux questions suivantes :

- Quel moteur reçoit la demande ?
- Quelles permissions sont vérifiées ?
- Quelles règles métier sont appliquées ?
- Quel workflow est concerné ?
- Quels événements seront publiés ?
- Quelles automatisations seront exécutées ?
- Quelles relations devront être mises à jour dans le Knowledge Graph ?
- Le Digital Twin est-il impacté ?
- Quelles notifications seront envoyées ?
- Quel contexte sera transmis à KAI ?

Si une de ces questions reste sans réponse, la conception de la fonctionnalité est incomplète.

#### 10. Principe fondamental

Le MEEREO Core fonctionne comme un orchestre. Chaque moteur possède une partition précise. Aucun moteur ne joue le rôle d'un autre.

L'orchestration garantit que toutes les actions de la plateforme sont cohérentes, traçables, sécurisées et explicables. C'est cette discipline architecturale qui permet à MEEREO d'évoluer tout en conservant une logique unique, quels que soient les modules, les Cockpits ou les interfaces utilisés.

---

### TOME 22 — LE MODÈLE D'EXÉCUTION DU MEEREO CORE : COMMANDES, DÉCISIONS, ÉVÉNEMENTS ET AUTOMATISATIONS

**Version :** 1.0 · **Statut :** Documentation d'Architecture

#### 1. Vision

Le MEEREO Core distingue quatre concepts fondamentaux :

- les Commandes ;
- les Décisions ;
- les Événements ;
- les Automatisations.

Cette séparation garantit une plateforme prévisible, traçable et explicable. Aucun moteur ne confond ces notions.

#### 2. Les Commandes

Une Commande représente une intention. Elle exprime une demande d'action. Une Commande ne signifie pas que cette action sera réalisée.

Exemples : créer un projet ; inviter une entreprise ; valider un document ; intégrer un intervenant ; publier un appel d'offres ; ajouter un produit au Marketplace.

Une Commande est toujours initiée par : un utilisateur, une API, un processus interne, ou une automatisation autorisée.

#### 3. Les Décisions

Une Décision est le résultat de l'évaluation d'une Commande. Elle est prise après consultation : du Permission Engine, du Rules Engine, du Workflow Engine.

Une Décision peut être : Acceptée ; Refusée ; Acceptée sous conditions.

Chaque Décision est justifiée et historisée.

#### 4. Les Événements

Un Événement représente un fait accompli. Contrairement à une Commande, il décrit quelque chose qui s'est réellement produit.

Exemples : ProjectCreated ; MissionAccepted ; DocumentValidated ; ProfessionalIntegrated ; ProductOrdered.

Un Événement est immuable. Il ne peut être ni modifié ni supprimé.

#### 5. Les Automatisations

Une Automatisation est une conséquence. Elle est déclenchée par un ou plusieurs événements.

Exemples :

- Après ProjectCreated : création du Cockpit Projet ; création du Journal d'Audit ; initialisation du CRM.
- Après MissionAccepted : création des permissions ; création de la conversation ; préparation des tâches.

Une automatisation ne crée jamais directement une nouvelle règle métier. Elle applique des actions prévues par la plateforme.

#### 6. Chaîne d'exécution

Toute action suit obligatoirement cette séquence :

Commande → Permissions → Règles métier → Workflow → Décision → Événement → Automatisations → Notifications → Mise à jour du Knowledge Graph → Mise à jour éventuelle du Digital Twin → Actualisation des Cockpits → Assistance de KAI

Chaque étape possède une responsabilité clairement définie.

#### 7. Exemple complet

Commande : « Intégrer une Entreprise de Construction au projet. »

1. Le Permission Engine vérifie les droits.
2. Le Rules Engine vérifie que le coordinateur technique peut réaliser cette intégration dans le contexte du projet.
3. Le Workflow Engine confirme que le projet se trouve dans une phase compatible.
4. Décision : Acceptée.
5. Événement : ProfessionalIntegrated.
6. Automatisations : création de la mission ; ouverture du CRM intervenant ; création de la conversation ; attribution des permissions ; création des tâches initiales.
7. Le Knowledge Graph crée les nouvelles relations.
8. Le Digital Twin ajoute l'entreprise comme intervenant du cycle de vie du bâtiment.
9. Les notifications sont envoyées.
10. KAI met à jour son contexte et peut expliquer la nouvelle organisation du projet.

#### 8. Responsabilités

- **Les Cockpits** — émettent des Commandes.
- **Le Rules Engine** — prend part à la Décision.
- **Le Workflow Engine** — exécute les transitions autorisées.
- **L'Event Engine** — diffuse les Événements.
- **L'Automation Engine** — exécute les conséquences.
- **KAI** — explique, résume et recommande. Elle ne transforme jamais une Commande en Événement.

#### 9. Avantages

Cette architecture permet :

- une meilleure compréhension des traitements ;
- une traçabilité complète ;
- des erreurs plus faciles à diagnostiquer ;
- des automatisations plus sûres ;
- une meilleure évolutivité.

Elle simplifie également les tests, car chaque étape peut être validée indépendamment.

#### 10. Impact sur les développements futurs

Toute nouvelle fonctionnalité devra être conçue en distinguant clairement :

- ce qui relève d'une Commande ;
- ce qui relève d'une Décision ;
- ce qui devient un Événement ;
- ce qui déclenche des Automatisations.

Aucun composant ne devra mélanger ces responsabilités.

#### 11. Principe fondamental

Dans MEEREO, une intention n'est jamais un fait.

Une Commande exprime une demande. Une Décision détermine si cette demande est recevable. Un Événement constate le résultat. Une Automatisation applique les conséquences.

Cette distinction structure l'ensemble de la plateforme et garantit une architecture claire, explicable et durable.

---

## VOLUME 3 – DOCUMENTATION FONCTIONNELLE DES MODULES

### TOME 14 — MODULE 01 : COCKPIT CLIENT

**Version :** 1.0 · **Statut :** Documentation Fonctionnelle Officielle

#### 1. Objectif

Le Cockpit Client est l'environnement de travail principal des clients de MEEREO. Il est automatiquement créé lors de l'inscription lorsque l'utilisateur choisit le profil Client.

Le Cockpit Client accompagne le client pendant tout le cycle de vie de ses projets. Son objectif est de permettre à un utilisateur non technique de piloter facilement ses opérations de construction, de rénovation ou d'aménagement, tout en étant accompagné par KAI.

Le Cockpit Client ne contient aucun outil destiné à produire des livrables techniques. Il est conçu pour piloter, suivre, décider et communiquer.

#### 2. Utilisateurs concernés

Le Cockpit Client est accessible aux :

- particuliers ;
- investisseurs ;
- promoteurs immobiliers ;
- entreprises maîtres d'ouvrage ;
- collectivités (versions futures).

Chaque utilisateur possède un seul Cockpit Client. Un client peut gérer plusieurs projets depuis ce même Cockpit.

#### 3. Création du Cockpit

Le Cockpit Client est créé automatiquement après :

- la création du compte utilisateur ;
- la validation de l'adresse e-mail ;
- la sélection du profil « Client ».

La création du Cockpit initialise automatiquement : le profil client ; les préférences utilisateur ; le Communication Hub ; le CRM Client ; les notifications ; l'assistant KAI Client.

Aucune configuration technique n'est demandée au client.

#### 4. Objectifs métiers

Le Cockpit Client permet de :

- créer un projet ;
- retrouver tous ses projets ;
- rechercher des professionnels ;
- inviter un professionnel déjà connu ;
- publier des appels d'offres ;
- suivre les missions en cours ;
- consulter les documents du projet ;
- communiquer avec les intervenants ;
- suivre les validations ;
- accéder au Passeport Numérique de ses bâtiments ;
- recevoir les recommandations de KAI.

#### 5. Structure du Cockpit

Le Cockpit est organisé autour des sections suivantes.

**Tableau de bord** — vue synthétique de l'activité. Le tableau de bord affiche : nombre de projets actifs ; projets terminés ; validations en attente ; nouveaux messages ; appels d'offres ouverts ; dernières activités ; alertes importantes ; recommandations KAI.

**Mes projets** — liste complète des projets. Chaque carte projet affiche : nom ; localisation ; type de projet ; image de couverture (si disponible) ; état du projet ; pourcentage d'avancement ; coordinateur technique ; date de création. Depuis cette page, le client peut : ouvrir un projet ; créer un projet ; archiver un projet (selon les règles métier) ; rechercher un projet.

**Recherche de professionnels** — le client accède à l'annuaire des professionnels. Il peut rechercher : Bureau d'Architecture ; Entreprise de Construction ; Bureau d'Études Structure ; Bureau d'Études Fluides ; Architecte d'Intérieur. Les résultats affichent : logo ; nom de l'entreprise ; spécialité ; localisation ; Page Professionnelle Publique ; badge Professionnel Vérifié ; bouton « Contacter » ; bouton « Inviter dans un projet » ; bouton « Consulter le profil ».

**Mes appels d'offres** — le client retrouve : les appels d'offres en préparation ; publiés ; en cours de réponse ; attribués ; clôturés. Chaque appel d'offres est relié à un projet.

**Communication Hub** — le client retrouve toutes ses conversations. Les conversations sont classées par contexte : conversations libres ; conversations Projet ; conversations Mission (si autorisées) ; conversations CRM. Le client peut contacter un professionnel directement depuis sa Page Professionnelle Publique.

**Mes documents** — le client consulte uniquement les documents auxquels il a accès. Les documents sont classés par : projet ; mission ; catégorie ; date. Le client peut télécharger les documents autorisés, les commenter ou demander des corrections lorsqu'une validation est prévue dans le workflow.

**Passeport Numérique** — lorsque des projets sont terminés, ils apparaissent automatiquement dans cette rubrique. Le client peut consulter : les actifs du bâtiment ; les garanties ; les documents ; les entreprises intervenantes ; l'historique des interventions ; les futures maintenances enregistrées.

**Paramètres** — le client peut gérer : son profil ; ses coordonnées ; ses préférences de notifications ; sa sécurité (mot de passe, authentification renforcée si disponible) ; les paramètres de confidentialité ; les préférences de KAI.

#### 6. KAI Client

Chaque Cockpit Client possède son propre assistant KAI. KAI accompagne le client dans toutes ses actions.

Elle peut notamment :

- expliquer le fonctionnement de la plateforme ;
- aider à créer un projet ;
- proposer des professionnels adaptés ;
- rappeler les validations à effectuer ;
- résumer l'avancement d'un projet ;
- retrouver rapidement un document ;
- répondre aux questions sur le projet en s'appuyant sur les données disponibles.

KAI n'engage jamais une entreprise et ne valide jamais une décision à la place du client.

#### 7. Règles métier

- Un client possède un seul Cockpit Client.
- Un Cockpit Client peut gérer plusieurs projets.
- Le client reste propriétaire de ses projets.
- Le client ne peut pas modifier les livrables techniques produits par les professionnels.
- Le client peut valider ou demander des corrections lorsque le workflow le prévoit.
- Le client peut inviter un professionnel à rejoindre un projet.
- Toutes les actions importantes sont historisées.

#### 8. Permissions

**Le client peut :**

- créer un projet ;
- consulter ses projets ;
- consulter les profils professionnels ;
- envoyer des messages ;
- publier un appel d'offres ;
- consulter les documents autorisés ;
- consulter le Passeport Numérique de ses bâtiments ;
- valider certaines étapes selon le workflow.

**Le client ne peut pas :**

- modifier les documents techniques des professionnels ;
- modifier les missions attribuées à une entreprise ;
- modifier les informations administratives d'une entreprise ;
- intervenir sur les paramètres internes d'une autre organisation.

#### 9. Événements générés

Les principales actions du Cockpit Client génèrent des événements métier. Exemples :

- ClientProjectCreated
- ProfessionalInvited
- TenderPublished
- ConversationStarted
- DocumentViewed
- ValidationRequested
- ValidationApproved
- ValidationRejected

Ces événements alimentent le Workflow Engine, le Journal d'Audit et KAI.

#### 10. Interactions

Le Cockpit Client interagit directement avec : Cockpit Projet ; Communication Hub ; CRM ; Marketplace ; Appels d'offres ; Référentiel Documentaire ; Workflow Engine ; Rules Engine ; Event Engine ; Asset Engine ; Passeport Numérique ; KAI.

Aucune donnée n'est dupliquée. Le Cockpit Client présente une vue contextualisée des informations provenant des différents modules.

#### 11. Principe fondamental

Le Cockpit Client est conçu pour permettre à tout maître d'ouvrage, qu'il soit particulier ou professionnel, de piloter ses projets de manière simple, transparente et sécurisée.

Il masque la complexité technique de la construction tout en donnant au client une vision complète de son projet, de ses partenaires et de l'évolution de son patrimoine immobilier.

Le Cockpit Client constitue la porte d'entrée de l'expérience MEEREO pour tous les utilisateurs ayant un besoin de construire, rénover, aménager ou suivre un bâtiment.

---

### TOME 14.1 — COCKPIT CLIENT · ÉCRAN 01 : DASHBOARD

**Version :** 1.0 · **Statut :** Documentation Fonctionnelle Officielle

#### 1. Objectif

Le Dashboard est la page d'accueil du Cockpit Client. Il constitue le centre de pilotage personnel du client.

À chaque connexion, le Dashboard fournit une vision synthétique de tous les projets du client, des actions à réaliser, des notifications importantes et des recommandations de KAI.

Le Dashboard est conçu pour répondre immédiatement à trois questions :

- Que se passe-t-il sur mes projets ?
- Quelles sont les actions qui nécessitent mon intervention ?
- Que me recommande KAI aujourd'hui ?

Le Dashboard ne permet pas de gérer directement les projets. Il oriente le client vers les différents modules de la plateforme.

#### 2. Utilisateurs

Accessible uniquement aux profils : Client. Aucun professionnel ou fournisseur n'a accès à cet écran.

#### 3. Chargement

Lors de la connexion, le système vérifie : l'identité de l'utilisateur ; les permissions ; les notifications ; les projets actifs. Ensuite, le Dashboard est chargé. Les widgets sont alimentés dynamiquement.

Le Dashboard ne stocke aucune donnée. Il interroge les différents modules de MEEREO.

#### 4. Structure de l'écran

Le Dashboard est composé de plusieurs zones.

**Zone supérieure** — cette zone comprend : logo MEEREO ; barre de recherche globale ; notifications ; messages ; accès au profil ; paramètres ; bouton d'assistance KAI.

**Menu latéral** — le menu donne accès aux principaux modules : Dashboard ; Mes Projets ; Rechercher un Professionnel ; Mes Appels d'Offres ; Communication Hub ; Mes Documents ; Passeport Numérique ; Paramètres. Le menu reste accessible en permanence.

**Zone centrale** — la partie centrale affiche les widgets. L'ordre des widgets peut être personnalisé dans une version future. Version 1 : ordre fixe.

#### 5. Widgets

**Widget Bonjour** — affiche : « Bonjour Jean-Marc. Bienvenue sur votre Cockpit Client. » Date du jour. Heure. Résumé de votre activité. KAI peut personnaliser ce message selon le contexte.

**Widget Mes projets** — affiche : nombre total de projets ; projets actifs ; projets terminés ; projet récemment créé ; projet nécessitant votre attention. Chaque projet est cliquable.

**Widget Mes validations** — affiche le nombre de validations en attente. Exemples : validation d'un livrable ; validation d'une mission ; validation d'une proposition ; validation d'un document. Chaque ligne ouvre directement l'élément concerné.

**Widget Activité récente** — affiche les derniers événements. Exemples : nouvelle réponse à un appel d'offres ; nouvelle entreprise intégrée ; document partagé ; message reçu ; mission terminée ; validation demandée. Les événements sont classés du plus récent au plus ancien.

**Widget Communication Hub** — affiche : messages non lus ; dernières conversations ; demandes de contact. Le bouton « Voir tout » ouvre la messagerie.

**Widget Appels d'offres** — affiche : appels d'offres publiés ; réponses reçues ; appels d'offres clôturés ; échéances proches.

**Widget Recommandations KAI** — KAI peut afficher : professionnels recommandés ; documents manquants ; prochaine étape d'un projet ; validation oubliée ; échéance importante ; conseils personnalisés. Chaque recommandation est expliquée. Le client garde toujours la décision finale.

**Widget Calendrier** — affiche : visites ; réunions ; dates importantes ; livraisons ; échéances. Toutes les informations proviennent des projets.

#### 6. Barre de recherche

La recherche est globale. Le client peut rechercher : projet ; entreprise ; document ; conversation ; adresse ; actif ; Passeport Numérique. La recherche utilise KAI lorsque nécessaire.

#### 7. Notifications

Les notifications sont regroupées. Catégories : Projet ; Mission ; Document ; Marketplace ; Messages ; Validation ; Appel d'offres. Chaque notification ouvre directement la ressource concernée.

#### 8. Actions rapides

Depuis le Dashboard, le client peut immédiatement :

- créer un projet ;
- rechercher un professionnel ;
- contacter une entreprise ;
- publier un appel d'offres ;
- consulter ses messages ;
- ouvrir un projet.

Toutes ces actions sont accessibles en un clic.

#### 9. Intervention de KAI

KAI analyse : les projets, les retards, les documents, les conversations, les validations, les appels d'offres, les recommandations. Elle prépare un résumé quotidien.

Exemple. Aujourd'hui :

- deux validations attendent votre décision ;
- un architecte a répondu à votre appel d'offres ;
- un document nécessite votre attention ;
- un rendez-vous est prévu demain.

KAI peut également répondre aux questions du client directement depuis le Dashboard.

#### 10. Événements

Le Dashboard ne crée pas de données métier. Il génère uniquement des événements de consultation. Exemples :

- DashboardOpened
- NotificationViewed
- RecommendationOpened
- ProjectOpened
- ConversationOpened

Ces événements servent à améliorer l'expérience utilisateur, les statistiques d'utilisation et les recommandations de KAI.

#### 11. Règles métier

Le Dashboard est personnalisé pour chaque utilisateur. Aucun client ne peut consulter les informations d'un autre client. Les informations affichées sont calculées en temps réel à partir des différents modules.

Le Dashboard ne permet jamais de modifier directement les données critiques. Il constitue un point d'entrée vers les fonctionnalités concernées.

#### 12. Performances

Le Dashboard doit être chargé rapidement. Les widgets sont indépendants. En cas d'indisponibilité temporaire d'un module, les autres widgets continuent de fonctionner.

Chaque widget peut afficher un état de chargement ou un message d'indisponibilité sans bloquer l'ensemble du Dashboard.

#### 13. Principe fondamental

Le Dashboard du Cockpit Client est le tableau de bord personnel du maître d'ouvrage. Il ne cherche pas à afficher toutes les informations de la plateforme.

Il met en avant les informations utiles, les actions prioritaires et les recommandations contextualisées afin que le client puisse piloter efficacement ses projets sans être submergé par la complexité technique.

---

### TOME 14.2 — COCKPIT CLIENT · ÉCRAN 02 : MES PROJETS

**Version :** 1.0 · **Statut :** Documentation Fonctionnelle Officielle

#### 1. Objectif

L'écran Mes Projets centralise l'ensemble des projets appartenant au client. Il constitue le point d'entrée vers tous les Cockpits Projet.

Le client ne travaille jamais directement depuis cette page. Il sélectionne simplement le projet sur lequel il souhaite travailler. Chaque projet représente une porte d'entrée vers son univers de travail.

#### 2. Objectifs métiers

Cet écran permet au client de :

- retrouver rapidement ses projets ;
- consulter leur état ;
- identifier les projets nécessitant une action ;
- créer un nouveau projet ;
- accéder au Cockpit Projet ;
- effectuer une recherche parmi ses projets.

#### 3. Données affichées

Chaque projet affiche au minimum :

- image de couverture (si définie) ;
- nom du projet ;
- référence unique ;
- type de projet ;
- localisation ;
- date de création ;
- dernière activité ;
- coordinateur technique ;
- statut ;
- pourcentage d'avancement ;
- nombre de missions ;
- nombre d'intervenants ;
- nombre de documents ;
- nombre de notifications non consultées.

Toutes ces données sont calculées en temps réel.

#### 4. Modes d'affichage

Version 1 : deux modes sont disponibles.

- **Vue Cartes** — chaque projet apparaît sous forme de carte. Cette vue est optimisée pour une lecture rapide.
- **Vue Liste** — les mêmes informations sont affichées sous forme de tableau. Cette vue facilite le tri et la recherche.

Le choix est mémorisé pour chaque utilisateur.

#### 5. Filtres

Le client peut filtrer ses projets par :

- Tous
- Actifs
- Terminés
- Archivés
- Brouillons (si disponibles)

Des filtres complémentaires pourront être ajoutés dans les versions futures.

#### 6. Recherche

Le moteur de recherche permet notamment de retrouver un projet par : nom ; référence ; adresse ; ville ; professionnel associé ; type de projet. La recherche s'effectue instantanément.

#### 7. Actions disponibles

Chaque carte projet propose :

- **Ouvrir** — ouvre le Cockpit Projet.
- **Voir les informations** — affiche les informations générales.
- **Partager** — selon les permissions.
- **Archiver** — disponible uniquement lorsque les règles métier l'autorisent.
- **Consulter le Passeport Numérique** — visible uniquement lorsque le projet est clôturé et qu'un Passeport Numérique a été généré.

#### 8. Bouton « Créer un projet »

Le bouton est toujours visible. Au clic, le client est dirigé vers le Workflow de création d'un projet. Ce workflow suit le processus défini dans les tomes précédents :

1. Informations générales.
2. Choix du mode d'accompagnement.
3. Création automatique du projet.
4. Création du Cockpit Projet.
5. Déclenchement des événements métier.

#### 9. États de l'interface

**Aucun projet** — le système affiche un écran d'accueil. Message : « Vous n'avez encore créé aucun projet. » Actions proposées : créer un projet ; découvrir le fonctionnement de MEEREO ; rechercher un professionnel. KAI peut expliquer les différentes options.

**Chargement** — les cartes sont remplacées par des espaces réservés (skeleton loading). L'utilisateur conserve la structure de la page pendant le chargement.

**Erreur** — si les données ne peuvent pas être récupérées, message : « Impossible de charger vos projets pour le moment. » Actions : réessayer ; contacter le support si le problème persiste.

#### 10. Interaction avec KAI

KAI analyse automatiquement les projets affichés. Elle peut notamment :

- détecter un projet inactif ;
- identifier un retard ;
- proposer le prochain professionnel à intégrer ;
- signaler un document manquant ;
- rappeler une validation en attente ;
- recommander l'ouverture d'un projet nécessitant une action.

Les recommandations sont contextualisées et expliquées.

#### 11. Événements générés

L'écran peut générer :

- ProjectOpened
- ProjectSearched
- ProjectFiltered
- ProjectArchived
- ProjectCreated
- PassportOpened

Ces événements alimentent : Event Engine ; Journal d'Audit ; Statistiques ; KAI.

#### 12. Dépendances

Cet écran dépend notamment de : Cockpit Projet ; Workflow Engine ; Communication Hub ; CRM ; Notifications ; Passeport Numérique ; Event Engine ; Rules Engine ; KAI.

Toute modification de ces modules doit préserver le fonctionnement de cet écran.

#### 13. Règles métier

Un client ne peut consulter que les projets dont il est propriétaire ou auxquels il a reçu un accès explicite. Les projets archivés restent consultables. Un projet clôturé ne peut plus être modifié directement depuis cet écran.

Les informations affichées sont calculées à partir des données réelles du projet. Aucun indicateur n'est saisi manuellement.

#### 14. Critères d'acceptation

L'écran est considéré conforme lorsque :

- tous les projets autorisés sont affichés ;
- les indicateurs sont exacts ;
- la recherche fonctionne ;
- les filtres fonctionnent ;
- l'ouverture d'un projet charge correctement le Cockpit Projet ;
- les recommandations de KAI correspondent au contexte ;
- les permissions sont respectées ;
- les états vide, chargement et erreur sont correctement gérés.

#### 15. Principe fondamental

L'écran Mes Projets n'est pas un simple tableau de liste. Il constitue la porte d'entrée vers les espaces de collaboration de MEEREO.

Chaque projet est présenté comme un environnement de travail vivant, enrichi en permanence par les missions, les documents, les communications, les événements métier et les analyses de KAI.

Le client doit pouvoir identifier en quelques secondes les projets nécessitant son attention et accéder immédiatement au Cockpit Projet correspondant.

---

### TOME 14.3 — COCKPIT CLIENT · ÉCRAN 03 : CRÉER UN PROJET

**Version :** 1.0 · **Statut :** Documentation Fonctionnelle Officielle

#### 1. Objectif

L'écran Créer un Projet constitue le point d'entrée de tout nouveau projet dans MEEREO.

Son objectif n'est pas uniquement de créer une fiche projet. Il initialise l'ensemble de l'écosystème du projet :

- le Projet ;
- le Cockpit Projet ;
- les premiers événements métier ;
- le contexte de travail ;
- les futures interactions entre les acteurs.

La création d'un projet doit être simple pour le client tout en générant une structure complète pour les professionnels.

#### 2. Philosophie

Le client ne doit pas être obligé de connaître les processus de construction. MEEREO collecte uniquement les informations nécessaires au démarrage. Les informations détaillées seront enrichies progressivement par les professionnels au cours du projet.

#### 3. Prérequis

Le client doit :

- être connecté ;
- disposer d'un compte Client actif ;
- avoir accepté les conditions d'utilisation de la plateforme.

Aucune vérification supplémentaire n'est nécessaire.

#### 4. Informations demandées

Le formulaire demande les informations essentielles.

**Informations générales :**

- Nom du projet
- Type de projet
- Adresse ou localisation
- Ville
- Pays
- Description courte

Ces informations peuvent être modifiées ultérieurement selon les règles métier.

#### 5. Choix du mode d'accompagnement

Après les informations générales, le client choisit la manière dont il souhaite démarrer son projet. Quatre scénarios sont proposés.

**Option 1 — Je recherche un bureau d'architecture.** Le client ne connaît encore aucun architecte. Après validation, MEEREO crée automatiquement : le projet ; le Cockpit Projet ; un appel d'offres réservé aux bureaux d'architecture. Le projet est placé dans l'état : Recherche d'un Architecte. KAI accompagne ensuite le client jusqu'à la sélection d'un professionnel.

**Option 2 — J'ai déjà un bureau d'architecture.** Le client connaît déjà le professionnel avec lequel il souhaite travailler. MEEREO demande l'adresse e-mail du bureau d'architecture. Deux cas sont possibles :

- *Cas 1 : l'entreprise possède déjà un compte MEEREO.* Le système : crée le projet ; crée le Cockpit Projet ; envoie une invitation au professionnel ; crée une mission Architecture en attente d'acceptation.
- *Cas 2 : le professionnel n'est pas inscrit.* Le système : crée le projet ; envoie automatiquement une invitation par e-mail ; invite le professionnel à créer un compte ; rattache automatiquement ce professionnel au projet dès la validation de son inscription. Le client n'a aucune autre action à effectuer.

**Option 3 — Je souhaite être accompagné par KAI.** Le client préfère déléguer la recherche d'un professionnel. MEEREO crée immédiatement le projet. KAI analyse : la nature du projet ; la localisation ; les besoins exprimés. Elle propose ensuite une sélection de bureaux d'architecture compatibles. Le client reste libre de choisir. Il peut également consulter lui-même l'annuaire des professionnels.

**Option 4 — Je souhaite simplement découvrir la plateforme.** Le client ne désire pas encore démarrer immédiatement une collaboration. MEEREO crée uniquement le projet. Le client peut ensuite : visiter l'annuaire ; consulter les Pages Professionnelles Publiques ; contacter des entreprises ; préparer un futur appel d'offres. Le projet reste dans un état préparatoire.

#### 6. Création automatique

Une fois le formulaire validé, le système crée automatiquement :

- le Projet ;
- l'identifiant unique du projet ;
- le Cockpit Projet ;
- le Journal d'Audit ;
- le contexte du projet ;
- les premiers événements ;
- les permissions initiales ;
- la chronologie du projet.

Le projet devient immédiatement accessible.

#### 7. Événements métier

La création d'un projet génère notamment :

- ProjectCreated
- ProjectContextInitialized
- ProjectWorkspaceCreated
- ProjectTimelineCreated
- ProjectCockpitCreated

Selon l'option choisie, d'autres événements peuvent être générés :

- TenderCreated
- ProfessionalInvitationSent
- ArchitectureMissionPrepared
- KAIAssistanceRequested

Tous les événements sont historisés.

#### 8. Intervention de KAI

Pendant la création du projet, KAI peut :

- expliquer chaque étape ;
- aider le client à choisir l'option adaptée ;
- vérifier la cohérence des informations saisies ;
- proposer des catégories de projet ;
- rappeler les prochaines étapes après la création.

KAI ne choisit jamais un professionnel à la place du client. Elle prépare des recommandations argumentées.

#### 9. États de l'interface

**Première utilisation** — le système explique brièvement le fonctionnement de MEEREO. Le client peut ignorer cette introduction.

**Brouillon** — le formulaire peut être enregistré comme brouillon. Le client pourra reprendre la création plus tard.

**Validation** — avant la création, un récapitulatif est présenté. Le client confirme les informations avant l'enregistrement définitif.

**Succès** — après la création, un message confirme la création du projet. Le client est automatiquement redirigé vers le Cockpit Projet.

**Erreur** — en cas d'échec, le système conserve les informations déjà saisies. Le client peut corriger les erreurs puis relancer la création.

#### 10. Règles métier

- Un projet appartient toujours à un client.
- Un projet possède un identifiant unique.
- Le Cockpit Projet est créé automatiquement.
- Le choix du mode d'accompagnement conditionne uniquement le workflow de démarrage. Il ne modifie jamais la structure du projet.
- Toutes les étapes sont historisées.

#### 11. Permissions

Seul le propriétaire du projet ou un utilisateur autorisé peut créer un projet depuis ce Cockpit. Le client ne peut pas attribuer directement une mission à un professionnel sans respecter le workflow prévu. Les invitations envoyées par la plateforme sont systématiquement enregistrées.

#### 12. Critères d'acceptation

L'écran est considéré conforme lorsque :

- le projet est créé avec succès ;
- le Cockpit Projet est automatiquement généré ;
- les événements métier sont enregistrés ;
- les permissions sont correctement initialisées ;
- le scénario choisi par le client est respecté ;
- les invitations éventuelles sont envoyées ;
- KAI est correctement contextualisée sur le nouveau projet.

#### 13. Principe fondamental

Créer un projet dans MEEREO ne consiste pas à créer un simple dossier. Cette action initialise un environnement collaboratif complet destiné à accompagner le client, les professionnels et les futurs intervenants pendant tout le cycle de vie du projet.

Chaque projet devient immédiatement un espace de travail intelligent, connecté à l'ensemble des services de la plateforme et prêt à évoluer au rythme des décisions du client et des professionnels.

---

### TOME 14.4 — COCKPIT CLIENT · ÉCRAN 04 : ANNUAIRE DES PROFESSIONNELS

**Version :** 1.0 · **Statut :** Documentation Fonctionnelle Officielle

#### 1. Objectif

L'Annuaire des Professionnels permet aux clients de découvrir, rechercher et sélectionner les entreprises présentes sur MEEREO. Il constitue le principal point de rencontre entre la demande et l'offre de services.

Chaque professionnel présent dans l'annuaire possède une Page Professionnelle Publique qui présente son entreprise, ses compétences, ses réalisations et ses informations officielles.

L'annuaire est entièrement connecté au CRM, au Communication Hub, aux Appels d'Offres, au Cockpit Projet et à KAI.

#### 2. Objectifs métiers

Cet écran permet au client de :

- rechercher un professionnel ;
- comparer plusieurs entreprises ;
- consulter leur Page Professionnelle Publique ;
- contacter directement une entreprise ;
- inviter une entreprise dans un projet ;
- créer un appel d'offres ;
- découvrir les compétences disponibles sur la plateforme.

#### 3. Entreprises disponibles

Dans la Version 1, l'annuaire référence uniquement les catégories suivantes :

- Bureau d'Architecture
- Entreprise de Construction
- Bureau d'Études Structure
- Bureau d'Études Fluides
- Architecte d'Intérieur

Les fournisseurs disposent d'un espace distinct dans le Marketplace.

#### 4. Structure de l'écran

L'écran est composé de plusieurs zones.

**Barre de recherche** — recherche par : nom d'entreprise ; spécialité ; localisation ; mots-clés. La recherche est instantanée.

**Filtres** — le client peut filtrer les résultats selon : catégorie ; pays ; ville ; domaine d'expertise ; entreprise vérifiée ; disponibilité (évolution future). Les filtres peuvent être combinés.

**Résultats** — chaque entreprise apparaît sous forme de carte. Chaque carte affiche : logo ; nom de l'entreprise ; catégorie ; localisation ; courte description ; badge Professionnel Vérifié (si applicable) ; bouton Voir le profil ; bouton Contacter ; bouton Inviter dans un projet. Les informations affichées proviennent directement de la Page Professionnelle Publique.

#### 5. Recherche

Le moteur de recherche interroge notamment : le profil de l'entreprise ; les domaines d'expertise ; les services proposés ; les mots-clés renseignés ; les localisations.

Dans les versions futures, KAI pourra également interpréter des recherches en langage naturel. Exemple : « Je recherche un bureau d'architecture spécialisé dans les immeubles résidentiels. »

#### 6. Consultation d'une entreprise

Lorsque le client sélectionne une entreprise, la Page Professionnelle Publique s'ouvre. Cette page constitue la vitrine officielle de l'entreprise.

Le client peut alors :

- consulter ses informations ;
- découvrir son portfolio ;
- consulter ses domaines d'expertise ;
- voir son équipe (selon les choix de l'entreprise) ;
- consulter ses références ;
- lire sa présentation ;
- prendre contact ;
- l'inviter à rejoindre un projet.

#### 7. Contact

Le bouton Contacter ouvre automatiquement le Communication Hub. Une nouvelle conversation privée est créée. Le contexte de cette conversation est : « Prise de contact ». Aucun projet n'est encore associé.

L'entreprise reçoit immédiatement une notification. Selon sa configuration, KAI Entreprise peut :

- envoyer un message d'accueil ;
- répondre aux questions simples ;
- proposer un rendez-vous ;
- transférer la conversation à un collaborateur.

#### 8. Inviter dans un projet

Le bouton Inviter dans un projet affiche la liste des projets appartenant au client. Le client choisit le projet concerné.

Le système crée ensuite : une invitation officielle ; une notification ; un événement métier ; une entrée dans l'historique du projet.

Le professionnel peut accepter ou refuser l'invitation. En cas d'acceptation, le Workflow correspondant est déclenché.

#### 9. Intervention de KAI

KAI accompagne le client dans sa recherche. Elle peut notamment :

- suggérer des entreprises correspondant au type de projet ;
- expliquer les compétences d'une entreprise ;
- rappeler les collaborations déjà réalisées ;
- proposer des entreprises déjà présentes dans le CRM du client ;
- recommander la publication d'un appel d'offres lorsque plusieurs profils semblent adaptés.

KAI n'impose jamais un choix. Elle présente des recommandations argumentées.

#### 10. États de l'interface

**Aucun résultat** — le système affiche un message clair : « Aucune entreprise ne correspond à votre recherche. » Actions proposées : modifier les filtres ; élargir la zone géographique ; publier un appel d'offres.

**Chargement** — les cartes sont remplacées temporairement par des placeholders.

**Erreur** — en cas d'indisponibilité du service, message : « Impossible de charger l'annuaire. » Bouton : Réessayer.

#### 11. Événements générés

Exemples :

- ProfessionalSearchPerformed
- ProfessionalProfileOpened
- ProfessionalContactStarted
- ProfessionalInvited
- SearchFilterApplied

Ces événements enrichissent : Event Engine ; CRM ; KAI ; Journal d'Audit.

#### 12. Règles métier

L'annuaire affiche uniquement les entreprises actives. Une entreprise peut masquer certaines informations de sa Page Professionnelle Publique. Les coordonnées sensibles ne sont jamais affichées publiquement sans l'accord de l'entreprise.

Le client ne peut pas modifier les informations d'une entreprise. Toutes les invitations sont historisées.

#### 13. Dépendances

Cet écran interagit avec : Communication Hub ; CRM ; Cockpit Projet ; Appels d'Offres ; Page Professionnelle Publique ; Workflow Engine ; Event Engine ; KAI ; Notifications.

Toute évolution de ces modules doit préserver le fonctionnement de l'annuaire.

#### 14. Critères d'acceptation

Le module est considéré conforme lorsque :

- les entreprises sont correctement référencées ;
- les recherches sont rapides et pertinentes ;
- les filtres fonctionnent ;
- la Page Professionnelle Publique est accessible ;
- les prises de contact créent une conversation ;
- les invitations déclenchent le workflow prévu ;
- les recommandations de KAI sont contextualisées.

#### 15. Principe fondamental

L'Annuaire des Professionnels est la porte d'entrée vers l'écosystème des entreprises de MEEREO. Il ne constitue pas un simple répertoire.

Il favorise les rencontres professionnelles, facilite la constitution des équipes projet et permet au client d'identifier rapidement les partenaires adaptés à ses besoins tout en restant connecté au CRM, au Communication Hub, aux Appels d'Offres et au Cockpit Projet.

---

### TOME 14.5 — MODULE : PAGE PROFESSIONNELLE PUBLIQUE

**Version :** 1.0 · **Statut :** Documentation Fonctionnelle Officielle

#### 1. Vision

La Page Professionnelle Publique constitue l'identité numérique officielle de chaque entreprise présente sur MEEREO. Chaque professionnel inscrit possède automatiquement une Page Professionnelle Publique.

Cette page remplace la simple fiche entreprise. Elle permet à une entreprise de présenter : son identité ; son savoir-faire ; ses références ; ses équipes ; ses réalisations ; ses certifications ; ses domaines d'expertise.

Elle constitue la vitrine officielle de l'entreprise sur MEEREO. Elle peut être partagée en dehors de la plateforme.

#### 2. Objectifs

La Page Professionnelle poursuit plusieurs objectifs. Permettre :

- aux clients de découvrir une entreprise ;
- aux professionnels de valoriser leur expertise ;
- aux entreprises de générer de nouveaux contacts ;
- à KAI de mieux comprendre les compétences réelles de l'entreprise ;
- d'améliorer la qualité des réponses aux appels d'offres.

#### 3. Création

La Page Professionnelle est créée automatiquement lors de l'inscription d'un professionnel. Elle reste privée tant que l'entreprise ne décide pas de la publier.

Une fois publiée, elle devient visible : dans l'annuaire ; dans les appels d'offres ; dans les CRM ; dans les recherches.

#### 4. Structure générale

La page est composée de plusieurs sections.

**En-tête** — affiche : logo de l'entreprise ; bannière ; nom de l'entreprise ; catégorie ; localisation ; badge Professionnel Vérifié ; slogan (optionnel). Cette section constitue l'identité visuelle principale.

**Présentation** — l'entreprise présente : son histoire ; sa vision ; ses valeurs ; ses domaines d'activité ; ses spécialités. Le contenu est entièrement personnalisable.

**Chiffres clés** — l'entreprise peut afficher notamment : année de création ; nombre de collaborateurs ; nombre de projets réalisés ; pays d'intervention ; domaines d'expertise. Ces informations sont mises à jour par l'entreprise.

**Domaines d'expertise** — l'entreprise sélectionne ses compétences. Exemple : Architecture ; Construction ; Structure ; Fluides ; Architecture d'intérieur. Dans les versions futures, plusieurs spécialités pourront être associées à une même entreprise.

**Portfolio** — le Portfolio constitue l'une des parties les plus importantes de la page. Chaque réalisation comprend : titre ; description ; localisation ; photographies ; vidéos (si disponibles) ; année ; mission réalisée. Le Portfolio peut être filtré. Les projets réalisés sur MEEREO peuvent être ajoutés automatiquement au Portfolio avec l'accord de l'entreprise et du client.

**Équipe** — l'entreprise peut présenter ses collaborateurs. Pour chaque membre : photo ; nom ; fonction ; courte biographie ; spécialités. L'affichage de cette section reste facultatif.

**Certifications** — l'entreprise peut afficher : certifications ; agréments ; qualifications. Les documents justificatifs restent privés sauf décision contraire de l'entreprise.

**Références** — cette section présente les principales références de l'entreprise. Les références peuvent provenir : de projets réalisés sur MEEREO ; de projets réalisés en dehors de la plateforme.

**Avis et satisfaction** — dans les versions futures, les clients pourront partager un retour d'expérience structuré à l'issue d'un projet. Ces retours ne seront publiés qu'après validation des règles définies par MEEREO. L'objectif est de privilégier des retours contextualisés et vérifiables, plutôt qu'un simple système de notation.

#### 5. Actions disponibles

Depuis cette page, un visiteur peut :

- contacter l'entreprise ;
- inviter l'entreprise dans un projet ;
- consulter son Portfolio ;
- consulter ses références ;
- partager la page ;
- copier le lien de la page.

Toutes les actions sont historisées.

#### 6. Communication Hub

Le bouton Contacter ouvre une conversation. Si l'entreprise l'autorise, KAI Entreprise peut :

- accueillir le visiteur ;
- répondre aux premières questions ;
- qualifier la demande ;
- proposer un rendez-vous ;
- transférer la conversation à un collaborateur.

Les échanges sont ensuite historisés dans le CRM.

#### 7. Interaction avec les Appels d'Offres

Lorsqu'une entreprise répond à un appel d'offres, la Page Professionnelle est automatiquement jointe à la candidature.

Le client peut ainsi consulter immédiatement : l'identité de l'entreprise ; son Portfolio ; ses domaines d'expertise ; ses références ; ses certifications publiées.

Aucune duplication d'information n'est nécessaire.

#### 8. Interaction avec KAI

KAI utilise la Page Professionnelle pour :

- comprendre les compétences de l'entreprise ;
- préparer les réponses aux appels d'offres ;
- recommander l'entreprise à un client ;
- générer des présentations personnalisées ;
- proposer des améliorations du profil.

KAI peut également signaler : un Portfolio incomplet ; une présentation trop courte ; des informations manquantes. Toutes les suggestions restent facultatives.

#### 9. Interaction avec le CRM

Chaque visite de la Page Professionnelle peut enrichir le CRM. Exemples : nouvelle prise de contact ; invitation ; consultation répétée ; projet partagé.

Le CRM mémorise la chronologie de la relation.

#### 10. États de la page

- **Brouillon** — visible uniquement par l'entreprise.
- **Publiée** — visible dans tout l'écosystème MEEREO.
- **Désactivée** — la page n'apparaît plus publiquement. Les projets existants restent inchangés.

#### 11. Règles métier

- Chaque entreprise possède une seule Page Professionnelle Publique.
- Les informations publiques sont choisies par l'entreprise.
- Les données confidentielles restent privées.
- Les documents administratifs ne sont jamais rendus publics automatiquement.
- Les informations affichées doivent rester cohérentes avec le profil vérifié de l'entreprise.

#### 12. Événements générés

- ProfessionalPagePublished
- ProfessionalPageUpdated
- ProfessionalPageVisited
- PortfolioOpened
- ProfessionalContactStarted
- ProfessionalInvited

Ces événements alimentent : CRM ; Event Engine ; Journal d'Audit ; KAI.

#### 13. Critères d'acceptation

Le module est conforme lorsque :

- chaque entreprise possède une Page Professionnelle unique ;
- les informations sont correctement affichées ;
- le Portfolio fonctionne ;
- les prises de contact créent une conversation ;
- les invitations fonctionnent ;
- les informations sont réutilisées dans les appels d'offres ;
- KAI peut analyser le contenu.

#### 14. Principe fondamental

La Page Professionnelle Publique constitue la carte d'identité numérique officielle de l'entreprise dans l'écosystème MEEREO. Elle ne se limite pas à une présentation commerciale.

Elle devient un point central de collaboration, de confiance et de visibilité, connecté au CRM, au Communication Hub, aux Appels d'Offres, au Cockpit Projet et à KAI.

Chaque interaction réalisée depuis cette page contribue à enrichir la mémoire relationnelle de la plateforme et à renforcer les opportunités de collaboration entre les acteurs.

---

### TOME 14.6 — MODULE : APPELS D'OFFRES

**Version :** 1.0 · **Statut :** Documentation Fonctionnelle Officielle

#### 1. Vision

Le module Appels d'Offres est le système officiel de recrutement des professionnels au sein de MEEREO. Il permet au client ou au coordinateur technique de rechercher, comparer, sélectionner et intégrer les entreprises qui participeront à un projet.

Chaque appel d'offres est directement rattaché à un projet ou à une mission. Il constitue une étape du Workflow du projet.

#### 2. Philosophie

Un appel d'offres dans MEEREO ne sert pas uniquement à recevoir des propositions. Son objectif est de créer une relation de travail durable.

Lorsqu'un professionnel est retenu :

- il rejoint le projet ;
- son CRM est enrichi ;
- le Cockpit Projet est mis à jour ;
- la mission lui est attribuée ;
- le Workflow évolue automatiquement.

L'appel d'offres devient ainsi un moteur de collaboration.

#### 3. Qui peut créer un appel d'offres ?

Dans la Version 1 :

**Le Client** — le client peut créer un appel d'offres uniquement lorsqu'il recherche un Bureau d'Architecture. Il s'agit du point d'entrée normal d'un nouveau projet.

**Le Coordinateur Technique** — une fois la mission Architecture acceptée, le coordinateur technique peut créer des appels d'offres pour : Entreprise de Construction ; Bureau d'Études Structure ; Bureau d'Études Fluides ; Architecte d'Intérieur.

Le coordinateur technique est responsable de la constitution progressive de l'équipe projet. Chaque intégration est réalisée en concertation avec le client. La validation finale de l'intégration dans MEEREO est effectuée par le coordinateur technique.

#### 4. Création d'un appel d'offres

Le créateur renseigne notamment :

- le titre ;
- la mission concernée ;
- le contexte ;
- la description du besoin ;
- la localisation ;
- les critères particuliers ;
- les documents de consultation ;
- la date limite de réponse.

Le système attribue automatiquement : un identifiant unique ; un statut ; une chronologie ; un historique complet.

#### 5. Diffusion

Le Workflow Engine identifie les entreprises pouvant répondre. La diffusion tient compte notamment : de la catégorie ; des compétences ; de la localisation (si applicable) ; des préférences de diffusion.

KAI peut suggérer des entreprises correspondant au contexte du projet. La décision finale appartient toujours au créateur de l'appel d'offres.

#### 6. Réponse d'une entreprise

Lorsqu'une entreprise répond, MEEREO prépare automatiquement le dossier de candidature. Le système récupère dans le Référentiel Documentaire :

- présentation de l'entreprise ;
- documents administratifs ;
- certifications ;
- références ;
- Portfolio ;
- Page Professionnelle Publique.

Le professionnel peut ajouter, retirer ou remplacer les éléments proposés. Aucun document n'est transmis sans validation explicite.

#### 7. Évaluation des candidatures

Le créateur de l'appel d'offres consulte une vue comparative. Chaque candidature présente notamment :

- la Page Professionnelle Publique ;
- les domaines d'expertise ;
- le Portfolio ;
- les références ;
- les certifications publiées ;
- les documents administratifs autorisés ;
- la lettre de réponse.

KAI peut produire une analyse comparative argumentée. Elle ne désigne jamais automatiquement un gagnant.

#### 8. Attribution

Lorsque le professionnel est sélectionné, le Workflow Engine déclenche automatiquement :

- l'acceptation de la candidature ;
- la création ou l'activation de la mission concernée ;
- l'intégration de l'entreprise au Cockpit Projet ;
- la création des espaces de communication nécessaires ;
- la mise à jour du CRM ;
- les notifications.

Si le professionnel n'est pas encore inscrit sur MEEREO, une invitation officielle lui est envoyée. Après son inscription, son profil est automatiquement rattaché au projet.

#### 9. Intégration au projet

L'intégration d'une entreprise n'est jamais réalisée automatiquement après une simple réponse. Le coordinateur technique confirme l'intégration.

Cette validation crée : les permissions ; les accès ; les conversations de mission ; le CRM intervenant ; les événements associés.

Toutes les opérations sont historisées.

#### 10. Intervention de KAI

KAI accompagne tout le processus. Elle peut notamment :

- vérifier les dossiers ;
- détecter les documents manquants ;
- signaler une certification expirée ;
- proposer des professionnels adaptés ;
- résumer les candidatures ;
- préparer une grille comparative ;
- rappeler les échéances.

Toutes les recommandations sont explicables.

#### 11. États de l'appel d'offres

Un appel d'offres peut évoluer selon les états suivants :

- Brouillon
- En préparation
- Publié
- En cours de réponse
- En évaluation
- Attribué
- Clôturé
- Archivé

Chaque changement d'état est enregistré dans l'historique.

#### 12. Règles métier

- Le client ne recrute directement que le Bureau d'Architecture.
- Les autres professionnels sont intégrés par le coordinateur technique.
- Le coordinateur technique agit toujours en concertation avec le client.
- Toutes les invitations sont historisées.
- Toutes les décisions importantes sont tracées.
- Une entreprise ne peut rejoindre un projet sans validation du Workflow prévu.

#### 13. Événements générés

- TenderCreated
- TenderPublished
- TenderViewed
- TenderAnswered
- TenderCompared
- TenderAwarded
- ProfessionalIntegrated
- MissionActivated
- CRMUpdated

Ces événements alimentent : Workflow Engine ; Event Engine ; CRM ; Cockpit Projet ; KAI.

#### 14. Critères d'acceptation

Le module est conforme lorsque :

- les appels d'offres peuvent être créés ;
- les professionnels peuvent répondre ;
- les dossiers sont automatiquement constitués ;
- les comparaisons fonctionnent ;
- les intégrations créent correctement les missions ;
- le Cockpit Projet est mis à jour ;
- les CRM sont enrichis ;
- les recommandations de KAI sont pertinentes.

#### 15. Principe fondamental

Le module Appels d'Offres constitue le moteur de constitution des équipes projet de MEEREO. Il relie le client, le coordinateur technique, les entreprises, les documents, le CRM, le Communication Hub, le Workflow Engine, KAI et le Cockpit Projet dans un processus unique, traçable et collaboratif.

Chaque professionnel intégré devient un acteur officiel du projet et participe à la construction progressive du patrimoine numérique du bâtiment.

---

### TOME 14.7 — MODULE : RÉFÉRENTIEL DOCUMENTAIRE INTELLIGENT

**Version :** 1.0 · **Statut :** Documentation Fonctionnelle Officielle

#### 1. Vision

Le Référentiel Documentaire Intelligent constitue le système officiel de gestion documentaire de MEEREO. Il ne s'agit pas d'un espace de stockage. Il constitue une base de connaissances vivante.

Chaque document est un objet métier intelligent pouvant être compris, analysé, versionné, sécurisé et réutilisé dans toute la plateforme. Le Référentiel Documentaire est partagé par l'ensemble des modules de MEEREO.

#### 2. Philosophie

Un document est chargé une seule fois. Il peut ensuite être utilisé dans :

- les appels d'offres ;
- les projets ;
- les missions ;
- le CRM ;
- la Page Professionnelle Publique ;
- le Marketplace ;
- le Passeport Numérique ;
- les actifs ;
- les réponses générées par KAI.

Le document n'est jamais dupliqué. La plateforme crée uniquement des références vers un document unique. Cette architecture garantit une source unique de vérité.

#### 3. Les référentiels

Chaque acteur possède son propre Référentiel Documentaire.

**Référentiel Client** — contient notamment : titres de propriété ; programmes de besoins ; études préliminaires ; documents administratifs ; contrats ; documents personnels liés aux projets.

**Référentiel Professionnel** — contient notamment : RCCM ; numéro de contribuable ; attestations fiscales ; attestations sociales ; assurances ; certifications ; qualifications ; portfolio ; références ; modèles de documents ; brochures commerciales ; présentations de l'entreprise. Ces documents peuvent être réutilisés automatiquement lors des réponses aux appels d'offres.

**Référentiel Fournisseur** — contient notamment : catalogues ; fiches techniques ; notices d'installation ; garanties ; certificats de conformité ; certifications environnementales ; visuels produits. Ces documents peuvent être associés aux produits du Marketplace.

**Référentiel Projet** — créé automatiquement avec chaque projet. Il regroupe tous les documents produits ou reçus pendant le cycle de vie du projet. Exemples : plans ; maquettes ; rapports ; comptes rendus ; devis ; marchés ; avenants ; procès-verbaux ; réceptions ; DOE.

#### 4. Structure d'un document

Chaque document possède une fiche descriptive. Elle comprend notamment :

- identifiant unique ;
- titre ;
- description ;
- catégorie ;
- propriétaire ;
- auteur ;
- version ;
- date de création ;
- date de dernière modification ;
- statut ;
- langue ;
- format ;
- taille ;
- niveau de confidentialité ;
- durée de validité (si applicable) ;
- date d'expiration (si applicable).

Ces métadonnées sont utilisées par les moteurs de recherche et par KAI.

#### 5. Versionning

Le Référentiel conserve l'historique complet des versions. Chaque nouvelle version :

- ne remplace pas définitivement la précédente ;
- est historisée ;
- conserve son auteur ;
- conserve sa date ;
- conserve son commentaire de modification.

Les utilisateurs autorisés peuvent consulter les anciennes versions. Une seule version est déclarée comme version active.

#### 6. Gestion des permissions

Les permissions sont définies à plusieurs niveaux : propriétaire ; entreprise ; projet ; mission ; rôle de l'utilisateur.

Pour chaque document, il est possible de définir les droits suivants : consulter ; télécharger ; commenter ; modifier ; valider ; partager.

Les droits sont hérités du contexte mais peuvent être affinés document par document.

#### 7. Recherche intelligente

Le moteur de recherche permet de retrouver un document par : titre ; catégorie ; type ; auteur ; projet ; mission ; entreprise ; date ; mots-clés.

KAI peut également effectuer des recherches en langage naturel. Exemple : « Retrouve le dernier plan de structure validé pour le projet Les Jardins. »

#### 8. Intervention de KAI

KAI analyse les documents autorisés. Elle peut notamment :

- extraire les métadonnées ;
- résumer un document ;
- détecter des incohérences ;
- identifier les dates importantes ;
- retrouver des références ;
- proposer des classements ;
- préparer automatiquement une réponse à un appel d'offres en sélectionnant les documents pertinents ;
- signaler un document expiré ou manquant.

KAI ne diffuse jamais un document sans validation lorsque celle-ci est requise.

#### 9. Automatisations

Le Référentiel peut déclencher des automatisations. Exemples :

- alerte avant expiration d'une assurance ;
- demande de renouvellement d'une attestation ;
- ajout automatique d'un document dans un dossier d'appel d'offres ;
- association d'une garantie à un actif du Passeport Numérique ;
- création d'une tâche lorsqu'un document nécessite une validation.

Toutes les automatisations sont traçables.

#### 10. Interactions

Le Référentiel Documentaire est utilisé par : Cockpit Client ; Cockpit Professionnel ; Cockpit Fournisseur ; Cockpit Projet ; Communication Hub ; CRM ; Appels d'Offres ; Marketplace ; Asset Engine ; Passeport Numérique ; Workflow Engine ; Event Engine ; Rules Engine ; KAI.

Il constitue une infrastructure transversale.

#### 11. Événements générés

- DocumentUploaded
- DocumentUpdated
- DocumentVersionCreated
- DocumentValidated
- DocumentShared
- DocumentLinkedToProject
- DocumentLinkedToMission
- DocumentExpired
- DocumentRenewed

Ces événements alimentent le Journal d'Audit, le Workflow Engine et KAI.

#### 12. Règles métier

- Un document possède un propriétaire unique.
- Un document n'est jamais dupliqué ; seules des références sont créées.
- Toutes les versions sont conservées.
- Les droits d'accès sont contrôlés avant chaque consultation.
- Les documents officiels expirés sont signalés aux propriétaires.
- Les documents utilisés dans un appel d'offres restent liés à leur version au moment de la soumission afin de garantir la traçabilité.

#### 13. Critères d'acceptation

Le module est conforme lorsque :

- les documents sont centralisés dans leur Référentiel ;
- les versions sont historisées ;
- les permissions sont respectées ;
- les recherches sont performantes ;
- les documents peuvent être réutilisés dans plusieurs modules sans duplication ;
- KAI peut exploiter les métadonnées et le contenu autorisé ;
- les automatisations se déclenchent correctement.

#### 14. Principe fondamental

Le Référentiel Documentaire Intelligent est la mémoire documentaire de MEEREO. Il garantit qu'un document est créé une seule fois, compris par KAI, sécurisé, versionné et réutilisable dans l'ensemble de l'écosystème.

Cette architecture élimine les duplications, améliore la qualité des données et permet une automatisation avancée des processus métier tout au long du cycle de vie du projet.

---

### TOME 14.8 — MODULE : WORKFLOW ENGINE

**Version :** 1.0 · **Statut :** Documentation Fonctionnelle Officielle

#### 1. Vision

Le Workflow Engine est le moteur d'orchestration de MEEREO. Il pilote automatiquement l'évolution des projets, des missions, des documents, des validations et des processus collaboratifs.

Aucun module de MEEREO ne modifie directement son propre état. Toute évolution passe par le Workflow Engine. Le Workflow Engine garantit que les règles métier sont appliquées de manière cohérente dans toute la plateforme.

#### 2. Philosophie

Dans MEEREO, un workflow représente le cycle de vie d'un objet métier. Chaque objet possède son propre workflow.

Exemples : Projet ; Mission ; Appel d'offres ; Document ; Validation ; Commande ; Actif ; Passeport Numérique.

Tous ces workflows utilisent le même moteur.

#### 3. Les états

Chaque workflow est composé d'états.

Exemple — Projet : Brouillon → Créé → Recherche d'Architecte → Conception → Études → Construction → Réception → Clôturé → Passeport Numérique.

Chaque changement d'état est enregistré.

#### 4. Les transitions

Un objet ne peut changer d'état que si les conditions métier sont satisfaites.

Exemple : le projet ne peut pas entrer dans l'état Construction si l'architecte n'est pas intégré, si les études obligatoires ne sont pas validées, ou si les prérequis définis par le workflow ne sont pas remplis.

Le Workflow Engine contrôle ces règles automatiquement.

#### 5. Les déclencheurs

Un changement d'état peut être déclenché par :

- un utilisateur ;
- KAI (proposition uniquement) ;
- une automatisation ;
- une date ;
- un événement ;
- une validation.

Toutes les transitions sont historisées.

#### 6. Les actions automatiques

Chaque transition peut déclencher automatiquement plusieurs actions.

Exemple — Mission acceptée : créer le CRM intervenant → créer la conversation de mission → créer les permissions → notifier les acteurs → créer les premières tâches → mettre à jour le Cockpit Projet.

Toutes ces actions sont exécutées automatiquement par le Workflow Engine.

#### 7. Les règles métier

Chaque transition est contrôlée par des règles. Exemples :

- documents obligatoires présents ;
- validation obtenue ;
- professionnel vérifié ;
- mission précédente terminée ;
- paiement confirmé (évolution future).

Le Workflow Engine ne permet jamais une transition non conforme.

#### 8. Interaction avec KAI

KAI ne pilote jamais directement les workflows. Elle peut :

- expliquer un blocage ;
- proposer une transition ;
- identifier les actions nécessaires ;
- rappeler les prérequis ;
- anticiper un retard.

La décision finale appartient toujours aux utilisateurs autorisés.

#### 9. Historique

Chaque transition enregistre :

- l'ancien état ;
- le nouvel état ;
- la date ;
- l'utilisateur ;
- la justification (si applicable) ;
- les événements déclenchés.

Le Workflow Engine garantit une traçabilité complète.

#### 10. Interactions

Le Workflow Engine est connecté à tous les modules : Cockpit Client ; Cockpit Professionnel ; Cockpit Fournisseur ; Cockpit Projet ; Communication Hub ; CRM ; Référentiel Documentaire ; Appels d'Offres ; Marketplace ; Asset Engine ; Passeport Numérique ; Notifications ; Agenda ; KAI.

Aucun module ne contourne le Workflow Engine.

#### 11. Événements générés

- WorkflowStarted
- WorkflowTransitionRequested
- WorkflowTransitionApproved
- WorkflowTransitionRejected
- WorkflowCompleted
- WorkflowCancelled

Chaque événement est transmis à l'Event Engine.

#### 12. Critères d'acceptation

Le Workflow Engine est conforme lorsque :

- toutes les transitions respectent les règles métier ;
- les actions automatiques sont exécutées ;
- les permissions sont vérifiées ;
- les événements sont générés ;
- les historiques sont complets ;
- KAI reçoit les informations nécessaires pour assister les utilisateurs.

#### 13. Principe fondamental

Le Workflow Engine est le chef d'orchestre de MEEREO. Il garantit que chaque projet, chaque mission, chaque document et chaque décision évoluent selon un processus maîtrisé, traçable et conforme aux règles métier définies par la plateforme.

Il constitue l'un des composants fondamentaux de l'architecture de MEEREO.

---

### TOME 14.9 — MODULE : EVENT ENGINE

**Version :** 1.0 · **Statut :** Documentation Fonctionnelle Officielle

#### 1. Vision

L'Event Engine constitue le système nerveux de MEEREO. Il enregistre, distribue et historise tous les événements générés par la plateforme.

Chaque action réalisée par un utilisateur ou un processus produit un événement. Ces événements sont ensuite utilisés par les autres moteurs de la plateforme pour déclencher des traitements, mettre à jour les interfaces et assister les utilisateurs.

L'Event Engine garantit que tous les modules restent synchronisés.

#### 2. Philosophie

Dans MEEREO, les modules ne communiquent pas directement entre eux. Ils communiquent au travers des événements.

Exemple. Le client crée un projet → le module Projet crée l'événement ProjectCreated → l'Event Engine reçoit cet événement → les autres modules réagissent : Cockpit Projet, CRM, Communication Hub, Notifications, Journal d'Audit, KAI, Workflow Engine.

Chaque module exécute ensuite ses propres traitements. Cette architecture réduit les dépendances directes entre les modules.

#### 3. Structure d'un événement

Chaque événement possède une structure commune. Elle comprend notamment :

- identifiant unique ;
- type d'événement ;
- module émetteur ;
- utilisateur à l'origine ;
- date et heure ;
- objet concerné ;
- contexte (projet, mission, CRM, etc.) ;
- données complémentaires ;
- niveau de priorité.

Cette structure est commune à toute la plateforme.

#### 4. Catégories d'événements

Les événements sont classés par domaines.

- **Projet** — ProjectCreated ; ProjectUpdated ; ProjectArchived ; ProjectClosed
- **Mission** — MissionCreated ; MissionAccepted ; MissionRejected ; MissionCompleted
- **Documents** — DocumentUploaded ; DocumentUpdated ; DocumentValidated ; DocumentExpired
- **Communication** — ConversationCreated ; MessageSent ; MessageRead
- **Appels d'offres** — TenderCreated ; TenderPublished ; TenderAnswered ; TenderAwarded
- **Marketplace** — ProductAdded ; OrderCreated ; OrderValidated ; OrderDelivered
- **CRM** — RelationshipCreated ; RelationshipUpdated ; ContactCreated
- **Actifs** — AssetCreated ; AssetUpdated ; AssetInstalled ; AssetMaintained

#### 5. Diffusion des événements

L'Event Engine diffuse chaque événement aux modules concernés.

Exemple : DocumentUploaded → Référentiel Documentaire → Workflow Engine → Notifications → KAI → Cockpit Projet → Journal d'Audit.

Chaque module décide ensuite de l'action à réaliser.

#### 6. Priorité des événements

Les événements peuvent être classés selon plusieurs niveaux :

- Information
- Important
- Critique

Cette priorité influence : les notifications ; les alertes ; les recommandations de KAI.

#### 7. Interaction avec KAI

KAI observe tous les événements auxquels elle est autorisée à accéder. Elle peut :

- détecter des anomalies ;
- résumer une série d'événements ;
- identifier une tendance ;
- anticiper un retard ;
- proposer des actions.

KAI n'intercepte jamais un événement. Elle l'analyse après sa création.

#### 8. Historique

Tous les événements sont conservés. Ils permettent : l'audit ; la reconstitution de l'historique ; l'analyse statistique ; les recommandations de KAI.

Les événements ne sont jamais modifiés. Ils sont immuables.

#### 9. Interactions

L'Event Engine communique avec : Workflow Engine ; Rules Engine ; Communication Hub ; Cockpit Projet ; Cockpit Client ; Cockpit Professionnel ; Cockpit Fournisseur ; CRM ; Marketplace ; Référentiel Documentaire ; Notifications ; Agenda ; KAI.

Tous les modules peuvent produire ou consommer des événements selon leurs autorisations.

#### 10. Règles métier

- Chaque événement possède un identifiant unique.
- Un événement ne peut jamais être supprimé.
- Les événements sont horodatés.
- Ils sont conservés afin d'assurer la traçabilité complète de la plateforme.
- Les événements sensibles respectent les règles de confidentialité et les permissions des utilisateurs.

#### 11. Critères d'acceptation

Le module est conforme lorsque :

- tous les événements sont correctement enregistrés ;
- les modules abonnés reçoivent les événements attendus ;
- les priorités sont respectées ;
- les historiques sont complets ;
- KAI peut exploiter les événements autorisés ;
- les événements restent traçables et immuables.

#### 12. Principe fondamental

L'Event Engine constitue le système nerveux de MEEREO. Il relie tous les modules de la plateforme sans créer de dépendances directes entre eux.

Chaque action devient un événement, chaque événement enrichit l'historique, déclenche des traitements, informe les utilisateurs et alimente KAI.

Cette architecture garantit une plateforme évolutive, cohérente et capable d'intégrer de nouveaux modules sans remettre en cause les fondations existantes.

---

### TOME 14.10 — MODULE : RULES ENGINE

**Version :** 1.0 · **Statut :** Documentation Fonctionnelle Officielle

#### 1. Vision

Le Rules Engine est le moteur central des règles métier de MEEREO. Il contient l'ensemble des règles qui gouvernent le fonctionnement de la plateforme.

Aucun module n'implémente directement ses propres règles métier. Tous les modules interrogent le Rules Engine avant d'exécuter une action.

Cette architecture garantit une cohérence globale et facilite l'évolution de la plateforme.

#### 2. Philosophie

Dans MEEREO, une règle métier est une décision de fonctionnement. Elle définit ce qui est autorisé, interdit ou conditionnel.

Les règles sont indépendantes des interfaces utilisateurs. Ainsi, une même règle s'applique de manière identique : dans le Cockpit Client ; dans le Cockpit Professionnel ; dans le Cockpit Fournisseur ; dans le Cockpit Projet ; dans KAI ; dans les APIs ; dans les automatisations.

#### 3. Catégories de règles

Les règles sont organisées par domaines fonctionnels.

**Règles d'inscription** — exemples : un compte doit être vérifié avant certaines actions ; un professionnel doit fournir les documents obligatoires ; un fournisseur doit compléter son profil avant de publier un produit.

**Règles Projet** — exemples : un projet possède un propriétaire ; un projet doit avoir un identifiant unique ; un Cockpit Projet est créé automatiquement.

**Règles Missions** — exemples : une mission appartient à un seul projet ; une mission possède un responsable ; une mission ne peut être clôturée si des tâches obligatoires sont incomplètes.

**Règles Appels d'Offres** — exemples : un client recrute directement uniquement un bureau d'architecture ; le coordinateur technique intègre les autres professionnels après accord avec le client ; une entreprise ne peut répondre qu'aux appels d'offres correspondant à sa catégorie.

**Règles Documentaires** — exemples : un document expiré ne peut pas être utilisé lorsqu'un document valide est obligatoire ; les versions précédentes restent accessibles aux utilisateurs autorisés ; un document partagé respecte les permissions définies.

**Règles Marketplace** — exemples : un produit ne peut être publié sans les informations obligatoires ; une garantie est associée au produit concerné ; une commande est liée à un projet lorsqu'elle est passée dans ce contexte.

**Règles Passeport Numérique** — exemples : un actif doit être identifié de manière unique ; les garanties sont rattachées aux actifs concernés ; l'historique des interventions est conservé.

#### 4. Évaluation des règles

Avant chaque action importante, le module interroge le Rules Engine.

Exemple. Un professionnel souhaite intégrer une entreprise au projet → le Cockpit Projet envoie une demande → le Rules Engine vérifie : les permissions ; le rôle ; le statut du projet ; les prérequis ; les validations nécessaires → le résultat est renvoyé : Autorisé, ou Refusé avec justification.

#### 5. Justification

Le Rules Engine ne renvoie jamais uniquement un refus. Il fournit également :

- la règle concernée ;
- la raison du blocage ;
- les actions permettant de débloquer la situation.

Cette justification peut être affichée à l'utilisateur et utilisée par KAI pour expliquer le contexte.

#### 6. Interaction avec KAI

KAI consulte le Rules Engine avant de proposer certaines actions. Elle peut expliquer : pourquoi une transition est impossible ; quels prérequis sont manquants ; quelles validations doivent être obtenues.

KAI ne contourne jamais les règles métier. Elle accompagne les utilisateurs dans leur compréhension.

#### 7. Interaction avec le Workflow Engine

Le Workflow Engine ne décide pas seul. Avant chaque transition importante : il interroge le Rules Engine ; il vérifie les conditions ; il applique uniquement les transitions autorisées.

Cette séparation garantit un comportement prévisible et homogène.

#### 8. Historique des règles

Les règles peuvent évoluer. Chaque modification est : versionnée ; documentée ; datée ; associée à son auteur.

Les anciennes versions sont conservées afin de comprendre les décisions passées.

#### 9. Interactions

Le Rules Engine est consulté par : Cockpit Client ; Cockpit Professionnel ; Cockpit Fournisseur ; Cockpit Projet ; Workflow Engine ; Event Engine ; Communication Hub ; CRM ; Référentiel Documentaire ; Marketplace ; Asset Engine ; Passeport Numérique ; APIs publiques ; KAI.

#### 10. Règles métier de la plateforme

Toutes les règles doivent respecter les principes fondateurs de MEEREO :

- le projet est le centre de l'écosystème ;
- le coordinateur technique pilote la constitution de l'équipe projet après concertation avec le client ;
- chaque action importante est traçable ;
- les permissions sont contextuelles ;
- les documents sont gérés dans un Référentiel unique ;
- les décisions restent humaines, KAI n'étant qu'un assistant.

#### 11. Critères d'acceptation

Le Rules Engine est conforme lorsque :

- toutes les règles sont centralisées ;
- les modules utilisent le moteur plutôt que des règles codées localement ;
- les justifications sont compréhensibles ;
- les règles sont versionnées ;
- les évolutions n'entraînent pas d'incohérences entre les modules.

#### 12. Principe fondamental

Le Rules Engine est la source officielle des règles métier de MEEREO. Il garantit que chaque décision prise dans la plateforme respecte les mêmes principes, quel que soit le module ou l'interface utilisée.

Il assure la cohérence, la traçabilité et l'évolutivité de l'ensemble de l'écosystème.

---

# PARTIE II — MEEREO ARCHITECTURE DECISION RECORDS (MADR)

## MADR-0001 — POURQUOI LE PROJET EST LE CENTRE DE MEEREO

**Version :** 1.0 · **Statut :** Accepté · **Date :** À compléter

### Contexte

Lors de la conception de MEEREO, plusieurs architectures étaient possibles.

Une première approche consistait à centrer la plateforme sur les utilisateurs. Une deuxième consistait à centrer la plateforme sur les entreprises. Une troisième consistait à organiser les données autour des documents. Une quatrième consistait à prendre le projet comme unité centrale.

Après analyse, la quatrième approche a été retenue.

### Décision

Le Projet constitue l'objet métier principal de MEEREO. Tous les autres objets gravitent autour de lui.

Le projet devient l'unité de collaboration entre les acteurs. Il représente le contexte commun dans lequel se déroulent les interactions.

### Justification

Le secteur du BTP est naturellement organisé autour des projets. Les entreprises changent. Les intervenants changent. Les documents évoluent. Les équipes évoluent. Le projet, lui, demeure le point de référence.

En plaçant le projet au centre :

- les permissions deviennent contextuelles ;
- les documents trouvent naturellement leur contexte ;
- les conversations sont organisées ;
- les workflows deviennent cohérents ;
- le Digital Twin se construit progressivement.

### Alternatives étudiées

**Architecture centrée Utilisateur** — Avantages : simplicité initiale. Inconvénients : multiplication des duplications ; difficultés de collaboration ; faible contextualisation. Décision : rejetée.

**Architecture centrée Entreprise** — Avantages : adaptée aux ERP classiques. Inconvénients : peu adaptée aux projets multi-acteurs. Décision : rejetée.

**Architecture centrée Documents** — Avantages : bonne gestion documentaire. Inconvénients : absence de contexte métier ; faible capacité de collaboration. Décision : rejetée.

### Conséquences

Tous les modules doivent être capables de se rattacher à un projet. Exemples : Mission ; Document ; Conversation ; Commande ; Actif ; Validation ; Décision ; Appel d'offres.

Le projet constitue leur contexte principal.

### Impact sur l'architecture

Cette décision influence : Business Object Model ; Workflow Engine ; Rules Engine ; Event Engine ; Cockpit Projet ; Knowledge Graph ; Digital Twin ; KAI.

Toute évolution future doit respecter ce principe.

### Règle de développement

Avant de créer un nouveau module, le développeur doit répondre à la question suivante : *À quel projet cet objet est-il rattaché ?*

Si la réponse est « Aucun », alors le modèle doit être réexaminé.

### Décision finale

Le Projet est la pierre angulaire de MEEREO. Cette décision est considérée comme fondatrice. Toute évolution de la plateforme doit préserver cette architecture.

### Validation

**Statut : ACCEPTÉ.** Cette décision constitue l'un des principes fondateurs de MEEREO.

---

## MADR-0002 — POURQUOI LES COCKPITS SONT DES INTERFACES ET NON DES MODULES MÉTIER

**Version :** 1.0 · **Statut :** ACCEPTÉ

### Contexte

Lors de la conception de MEEREO, plusieurs architectures applicatives ont été étudiées. La plus courante consiste à construire chaque Cockpit comme un module autonome contenant : ses propres règles métier ; ses propres validations ; ses propres traitements ; ses propres automatisations.

Cette approche est simple au démarrage mais devient difficile à maintenir lorsque plusieurs interfaces manipulent les mêmes données. MEEREO adopte une architecture différente.

### Décision

Les Cockpits de MEEREO sont exclusivement des interfaces utilisateur. Ils ne portent pas la logique métier de la plateforme.

Leur rôle est de : présenter les informations ; recueillir les actions de l'utilisateur ; transmettre les demandes au MEEREO Core ; afficher les résultats.

Toute décision métier est prise par les moteurs du Core.

### Justification

Cette séparation permet :

- d'assurer un comportement identique quel que soit le Cockpit utilisé ;
- d'éviter la duplication de règles ;
- de simplifier les évolutions ;
- de garantir une expérience cohérente.

Un même projet peut être consulté depuis : le Cockpit Client ; le Cockpit Professionnel ; le Cockpit Fournisseur (dans les cas autorisés) ; le Cockpit Projet ; KAI. La logique métier doit rester identique.

### Architecture

Le flux normal est le suivant :

Utilisateur → Cockpit → API → MEEREO Core → Rules Engine → Workflow Engine → Automation Engine → Event Engine → Notification Engine → Réponse au Cockpit

Le Cockpit n'exécute jamais directement les règles métier.

### Responsabilités d'un Cockpit

**Un Cockpit est responsable de :** l'affichage ; la navigation ; l'expérience utilisateur ; les formulaires ; la validation de format (exemple : adresse e-mail valide, champ obligatoire).

**Un Cockpit n'est pas responsable :** des permissions métier ; des workflows ; des règles de validation métier ; des décisions d'intégration ; des automatisations.

### Exemple

Le client souhaite inviter un Bureau d'Architecture.

Le Cockpit Client : affiche le formulaire ; collecte les informations ; envoie la demande.

Le MEEREO Core : vérifie les permissions ; applique les règles métier ; crée le projet si nécessaire ; crée l'invitation ; génère les événements ; déclenche les notifications.

Le Cockpit affiche ensuite le résultat.

### Alternatives étudiées

**Cockpit intelligent** — chaque Cockpit possède sa propre logique métier. Avantages : développement rapide au début. Inconvénients : duplication des règles ; incohérences entre interfaces ; maintenance difficile ; forte dépendance au front-end. Décision : rejetée.

**Cockpit connecté au Core** — le Cockpit reste léger. Toute logique est centralisée. Avantages : cohérence ; évolutivité ; réutilisation ; sécurité. Décision : acceptée.

### Impact sur KAI

KAI n'appelle jamais directement les Cockpits. Elle dialogue exclusivement avec le MEEREO Core.

Ainsi : les mêmes règles sont appliquées ; les mêmes permissions sont respectées ; les mêmes workflows sont suivis.

### Impact sur les APIs

Les APIs exposent les capacités du Core. Elles ne reproduisent pas les règles métier. Les applications mobiles, web ou partenaires obtiennent donc un comportement identique.

### Conséquences

Un nouveau Cockpit peut être créé sans modifier les règles métier. Exemples : application mobile ; tablette chantier ; interface BIM ; casque de réalité augmentée ; portail partenaire.

Tous utiliseront le même Core.

### Règle de développement

Avant d'implémenter une fonctionnalité dans un Cockpit, le développeur doit se poser les questions suivantes :

1. Cette logique relève-t-elle uniquement de l'interface utilisateur ?
2. Cette règle doit-elle être identique dans tous les Cockpits ?
3. Cette décision pourrait-elle être réutilisée par KAI ou une API ?

Si la réponse à la deuxième ou à la troisième question est oui, cette logique doit être implémentée dans le MEEREO Core et non dans le Cockpit.

### Décision finale

Les Cockpits de MEEREO sont des interfaces spécialisées. Ils ne contiennent pas la logique métier. Ils représentent la couche de présentation d'une plateforme pilotée par le MEEREO Core.

Cette décision est permanente et s'applique à tous les développements futurs.

---

## MADR-0003 — POURQUOI LES BUSINESS OBJECTS SONT LE LANGAGE UNIVERSEL DE MEEREO

**Version :** 1.0 · **Statut :** ACCEPTÉ

### Contexte

Au cours de la conception de MEEREO, plusieurs approches ont été étudiées pour modéliser les données métier.

La première consistait à créer un modèle spécifique pour chaque domaine : Projet, Mission, Document, Produit, Actif, Commande, Conversation, Décision. Chaque objet possédait sa propre structure, son propre historique, ses propres permissions et son propre cycle de vie. Cette approche semblait intuitive, mais elle entraînait une forte duplication des comportements.

Une seconde approche consistait à définir un modèle universel : le Business Object. Cette approche a été retenue.

### Décision

Tout élément manipulé par MEEREO est un Business Object. Chaque Business Object hérite d'un ensemble commun de capacités. Les objets spécialisés ajoutent uniquement les propriétés propres à leur domaine.

### Pourquoi cette décision ?

Parce que tous les objets de MEEREO possèdent finalement les mêmes besoins. Ils doivent :

- être identifiés ;
- être historisés ;
- être sécurisés ;
- être reliés à d'autres objets ;
- produire des événements ;
- être retrouvés par la recherche ;
- apparaître dans le Knowledge Graph ;
- être compris par KAI.

Il est donc inutile de réimplémenter ces comportements pour chaque nouveau module.

### Le Business Object n'est pas une table

Le Business Object ne représente pas une table de base de données. Il représente un contrat fonctionnel. Chaque objet métier s'engage à fournir un ensemble de comportements communs.

Exemples : Identité ; Métadonnées ; Historique ; Permissions ; Relations ; Événements ; Documents associés ; Conversations associées ; Cycle de vie.

### Exemples

- **Projet** → Business Object + nom du projet + adresse + type + surface + localisation.
- **Mission** → Business Object + type de mission + responsable + échéance.
- **Produit** → Business Object + référence fabricant + catégorie + garantie.
- **Décision** → Business Object + auteur + motif + décision.

Chaque objet conserve donc une base commune.

### Conséquences sur le Core

Tous les moteurs manipulent les mêmes contrats. Le Workflow Engine n'a pas besoin de connaître tous les objets : il connaît le Business Object. Le Rules Engine applique des règles à un Business Object. Le Search Engine indexe un Business Object. Le Knowledge Graph relie un Business Object. Le Notification Engine notifie un Business Object.

Cette homogénéité simplifie toute l'architecture.

### Impact sur les APIs

Les APIs suivent également ce modèle. Toutes les ressources exposent des capacités communes. Exemple : identifiant ; type ; statut ; propriétaire ; liens ; historique.

Les clients API bénéficient d'une expérience cohérente.

### Impact sur le Knowledge Graph

Chaque Business Object devient automatiquement un nœud potentiel du graphe. Aucun développement spécifique n'est nécessaire pour créer une nouvelle catégorie de nœuds. Le graphe évolue naturellement.

### Impact sur KAI

KAI raisonne sur les Business Objects. Elle ne distingue pas un Projet d'une Mission par leur structure interne. Elle distingue leurs propriétés spécifiques.

Cette approche améliore : la compréhension ; la recherche ; les recommandations ; les automatisations.

### Alternatives étudiées

**Modèle spécifique par module** — Avantages : simplicité initiale. Inconvénients : duplication importante ; maintenance complexe ; APIs hétérogènes ; faible réutilisation. Décision : rejetée.

**Business Object Universel** — Avantages : architecture homogène ; réutilisation maximale ; simplicité d'évolution ; cohérence globale. Décision : acceptée.

### Règle de développement

Avant de créer une nouvelle entité métier, le développeur doit se poser les questions suivantes :

1. Cet objet peut-il hériter du Business Object ?
2. Quels comportements communs réutilise-t-il ?
3. Quelles propriétés sont réellement spécifiques à ce nouvel objet ?

Si un nouveau développement réimplémente un comportement déjà fourni par le Business Object, il doit être revu.

### Exemples d'objets métier

Le modèle s'applique notamment à : Projet ; Mission ; Étape ; Jalon ; Tâche ; Document ; Décision ; Appel d'offres ; Réponse à un appel d'offres ; Produit ; Catalogue ; Commande ; Livraison ; Actif ; Garantie ; Passeport Numérique ; Conversation ; Message ; Notification ; Rapport ; Contrat ; Intervention de maintenance.

Cette liste est ouverte. Tout nouvel objet devra respecter ce modèle.

### Conséquences à long terme

Cette décision permet à MEEREO de grandir sans remettre en cause son architecture. L'ajout d'un nouveau métier, d'un nouveau module ou d'un nouveau service ne nécessite pas de créer un modèle entièrement différent. Le nouveau composant s'intègre naturellement à l'écosystème existant.

### Décision finale

Le Business Object constitue le langage universel de MEEREO. Tous les moteurs du Core, tous les Cockpits, toutes les APIs et KAI manipulent ce langage commun.

Cette décision garantit l'uniformité, la réutilisation et l'évolutivité de l'ensemble de la plateforme. Elle est considérée comme un principe fondamental de l'architecture de MEEREO.

---

## MADR-0004 — POURQUOI LE WORKFLOW EST UN MOTEUR ET NON UNE FONCTIONNALITÉ

**Version :** 1.0 · **Statut :** ACCEPTÉ

### Contexte

Toutes les plateformes possèdent des processus. Cependant, dans la majorité des applications, ces processus sont directement implémentés dans les modules métier.

Exemples : le module Projet contient le workflow des projets ; le module Appels d'Offres contient le workflow des appels d'offres ; le module Documents contient le workflow documentaire.

Cette approche crée des dépendances fortes entre les modules et rend les évolutions coûteuses. MEEREO adopte une architecture différente.

### Décision

Les workflows sont centralisés dans un Workflow Engine indépendant. Les modules ne connaissent pas les détails du cycle de vie des objets métier. Ils demandent au Workflow Engine si une transition est possible et lui confient son exécution.

### Justification

Cette séparation permet :

- d'ajouter de nouveaux workflows sans modifier les Cockpits ;
- de faire évoluer les processus métier indépendamment des interfaces ;
- d'assurer un comportement identique sur le Web, le Mobile, les APIs et KAI ;
- de conserver un historique complet des transitions.

Le Workflow Engine devient le référentiel officiel des cycles de vie.

### Exemple

Une mission passe de : En préparation → En cours → Terminée → Clôturée.

Le Cockpit Professionnel ne change pas directement l'état. Il demande au Workflow Engine : « La transition est-elle autorisée ? »

Le Workflow Engine consulte : le Rules Engine ; les permissions ; les prérequis ; les validations éventuelles.

Si la transition est valide : le changement d'état est effectué ; les événements sont générés ; les automatisations sont déclenchées ; les Cockpits sont mis à jour.

### Le workflow n'est pas une liste d'états

Chaque workflow est composé de : ses états ; ses transitions ; ses préconditions ; ses post-actions ; ses validations ; ses événements ; ses automatisations.

Il s'agit d'un véritable modèle métier.

### Interaction avec les autres moteurs

Le Workflow Engine ne fonctionne jamais seul.

- Avant une transition : le **Rules Engine** vérifie les règles.
- Après la transition : l'**Event Engine** publie les événements ; l'**Automation Engine** exécute les actions automatiques ; le **Notification Engine** informe les acteurs concernés ; le **Knowledge Graph** met à jour les relations si nécessaire ; **KAI** explique les changements et accompagne les utilisateurs.

### Alternatives étudiées

**Workflows embarqués dans les modules** — Avantages : simplicité de développement initial. Inconvénients : duplication ; incohérences ; difficulté à maintenir plusieurs interfaces ; faible évolutivité. Décision : rejetée.

**Workflow Engine central** — Avantages : cohérence ; réutilisation ; gouvernance unique ; meilleure traçabilité. Décision : acceptée.

### Impact sur les Business Objects

Tous les Business Objects susceptibles d'évoluer possèdent un workflow. Exemples : Projet ; Mission ; Appel d'offres ; Document ; Commande ; Actif ; Contrat ; Décision.

Le Workflow Engine n'est pas limité aux projets.

### Impact sur KAI

KAI n'exécute jamais une transition métier. Elle peut : expliquer un état ; indiquer pourquoi une transition est bloquée ; proposer les étapes suivantes ; préparer les informations nécessaires.

Toute transition reste pilotée par le Workflow Engine après validation des règles applicables.

### Impact sur les développements futurs

Tout nouveau Business Object devra répondre aux questions suivantes :

- possède-t-il un cycle de vie ?
- quels sont ses états ?
- quelles transitions sont possibles ?
- quelles règles conditionnent ces transitions ?
- quels événements doivent être publiés ?
- quelles automatisations doivent être déclenchées ?

Ces éléments devront être déclarés dans le Workflow Engine et non implémentés dans les Cockpits.

### Règle de développement

Aucun changement d'état métier ne doit être effectué directement par un écran, une API ou un agent KAI. Toute transition passe obligatoirement par le Workflow Engine. Cette règle est obligatoire.

### Conséquences à long terme

Cette décision permet :

- d'ajouter de nouveaux métiers sans réécrire les interfaces ;
- d'adapter les processus à différents pays ou réglementations ;
- de versionner les workflows ;
- d'introduire de nouveaux types de projets avec leurs propres cycles de vie.

Le Workflow devient un composant stratégique de la plateforme et non une implémentation locale.

### Décision finale

Le Workflow Engine est l'unique responsable des cycles de vie des Business Objects. Les Cockpits, les APIs et KAI ne pilotent jamais directement les transitions métier.

Cette décision garantit la cohérence, la traçabilité et l'évolutivité de MEEREO.

---

## MADR-0005 — POURQUOI LES RÈGLES MÉTIER SONT CENTRALISÉES DANS LE RULES ENGINE

**Version :** 1.0 · **Statut :** ACCEPTÉ

### Contexte

Chaque plateforme met en œuvre des règles métier. Ces règles déterminent : ce qui est autorisé ; ce qui est interdit ; les conditions d'exécution ; les validations obligatoires ; les permissions contextuelles.

Dans de nombreux logiciels, ces règles sont dispersées entre : les Cockpits ; les APIs ; les services ; les workflows ; les scripts d'automatisation. Cette dispersion entraîne des incohérences et augmente le coût des évolutions.

MEEREO adopte une approche centralisée.

### Décision

Toutes les règles métier sont définies et évaluées par le Rules Engine. Aucun autre composant ne constitue une source officielle des règles métier.

Les autres composants peuvent effectuer des validations purement techniques (format, champs obligatoires, intégrité des données), mais toute décision métier relève du Rules Engine.

### Justification

Cette décision garantit :

- une interprétation unique des règles ;
- une cohérence entre tous les Cockpits ;
- une évolution simplifiée ;
- une meilleure auditabilité ;
- une réduction des divergences entre interfaces.

Une règle métier est définie une seule fois. Elle est ensuite appliquée partout.

### Exemples de règles

**Recrutement des professionnels** — le client peut recruter directement uniquement un Bureau d'Architecture. Les autres professionnels sont intégrés par le coordinateur technique après concertation avec le client. Cette règle est définie dans le Rules Engine.

**Documents** — un document expiré ne peut être utilisé lorsqu'un document valide est requis.

**Missions** — une mission ne peut être clôturée si les validations obligatoires ne sont pas obtenues.

**Permissions** — un utilisateur ne peut accéder qu'aux objets métier pour lesquels il dispose d'une autorisation.

### Ce qui n'est pas une règle métier

Les éléments suivants ne relèvent pas du Rules Engine :

- vérification du format d'une adresse e-mail ;
- longueur maximale d'un champ ;
- présence d'un champ obligatoire dans un formulaire ;
- contraintes techniques liées à l'interface.

Ces validations restent du ressort des interfaces ou des services techniques.

### Interaction avec le Workflow Engine

Le Workflow Engine ne décide pas. Avant toute transition : consultation du Rules Engine → réponse : Autorisé, ou Refusé avec justification. Le Workflow Engine applique ensuite la décision.

### Interaction avec KAI

KAI consulte le Rules Engine pour : expliquer un refus ; indiquer les prérequis ; guider l'utilisateur.

KAI ne crée jamais de nouvelles règles. Elle ne modifie jamais une règle existante. Elle explique les règles applicables dans le contexte de l'utilisateur.

### Interaction avec les APIs

Les APIs interrogent le Rules Engine. Ainsi, une application web, une application mobile ou une intégration partenaire obtiendront toujours le même résultat.

### Alternatives étudiées

**Règles réparties dans chaque module** — Avantages : développement initial rapide. Inconvénients : duplication ; incohérences ; maintenance difficile ; risque élevé d'erreurs. Décision : rejetée.

**Rules Engine central** — Avantages : cohérence globale ; maintenance facilitée ; évolutivité ; meilleure gouvernance. Décision : acceptée.

### Impact sur les développements futurs

Avant d'ajouter une nouvelle règle, le développeur doit se poser les questions suivantes :

- s'agit-il réellement d'une règle métier ?
- cette règle pourrait-elle être utilisée par plusieurs modules ?
- cette règle doit-elle être identique sur le Web, le Mobile, les APIs et KAI ?

Si la réponse est oui, la règle doit être implémentée dans le Rules Engine.

### Règle de développement

Aucune règle métier ne doit être codée directement dans : un Cockpit ; une API ; un service métier ; un agent KAI ; une automatisation.

Toutes les règles métier sont centralisées dans le Rules Engine.

### Conséquences à long terme

Cette décision permet :

- d'adapter facilement la plateforme à plusieurs pays ;
- de gérer des variantes réglementaires ;
- de faire évoluer les règles sans modifier les interfaces ;
- d'assurer une gouvernance claire des décisions métier.

Le Rules Engine devient la référence officielle des règles de fonctionnement de MEEREO.

### Décision finale

Le Rules Engine constitue la source unique des règles métier de MEEREO. Toutes les décisions fonctionnelles importantes passent par lui.

Cette décision est permanente et s'impose à tous les développements futurs.

---

# PARTIE III — ENGINEERING MANUAL & HANDBOOK

## ENGINEERING MANUAL · VOLUME 1 · TOME 1 — LA MÉTHODOLOGIE OFFICIELLE DE DÉVELOPPEMENT DE MEEREO

**Version :** 1.0 · **Statut :** Norme de Développement

### Introduction

Le présent document définit la méthodologie officielle de développement de la plateforme MEEREO. Il ne décrit pas une technologie. Il décrit une manière de penser.

Tout développement réalisé sur MEEREO doit respecter cette méthodologie. Cette règle s'applique : aux développeurs ; aux architectes ; aux IA ; aux partenaires techniques ; aux contributeurs externes.

### Premier principe — On ne développe jamais un écran. On développe un besoin métier.

Un écran n'est que la conséquence visible d'un besoin. Le développement commence toujours par la compréhension du métier. Jamais par le design.

### Deuxième principe — On ne développe jamais une fonctionnalité. On développe un Workflow.

Une fonctionnalité isolée finit toujours par créer des incohérences.

Un Workflow possède : un début ; un contexte ; des acteurs ; des règles ; des transitions ; des événements ; une fin.

Chaque développement doit appartenir à un Workflow identifié.

### Troisième principe — On ne développe jamais un module. On développe un Business Object.

Chaque nouveau développement doit répondre :

- Quel est l'objet métier ?
- Quel est son cycle de vie ?
- Quelles relations possède-t-il ?
- Quels événements produit-il ?
- Quelles permissions possède-t-il ?

### Quatrième principe — Le Cockpit n'est jamais le centre.

Le Cockpit n'est qu'une interface. Le développement commence toujours par le Core. Puis les APIs. Puis les moteurs. Enfin seulement : le Cockpit.

### Cinquième principe — Toute action possède une histoire.

Avant d'écrire une ligne de code, le développeur doit répondre :

- Qui crée cette action ?
- Pourquoi ?
- Quand ?
- Que déclenche-t-elle ?
- Qui sera notifié ?
- Que verra KAI ?
- Comment le Digital Twin évoluera-t-il ?
- Que devient le Knowledge Graph ?

### Sixième principe — Aucun développement n'est isolé.

Avant toute implémentation, le développeur doit analyser son impact sur : Workflow Engine ; Rules Engine ; Event Engine ; Automation Engine ; Notification Engine ; Search Engine ; Knowledge Graph ; Digital Twin ; Audit Engine ; KAI.

### Septième principe — Les données ne voyagent jamais seules.

Toute donnée doit être accompagnée de son contexte.

Un document connaît son projet. Une mission connaît son entreprise. Un actif connaît son bâtiment. Une décision connaît son origine. Un événement connaît son auteur.

Le contexte est obligatoire.

### Huitième principe — Le code doit raconter le métier.

Un développeur qui lit le code doit comprendre immédiatement ce qui se passe. Le vocabulaire technique ne doit jamais remplacer le vocabulaire métier. Les noms doivent refléter les concepts de MEEREO.

### Neuvième principe — Une seule responsabilité.

Chaque moteur. Chaque module. Chaque service. Chaque API. Chaque composant. Chaque agent KAI. Possède une responsabilité unique.

### Dixième principe — KAI est un collaborateur. Jamais un décideur.

Le code ne doit jamais supposer que KAI possède une autorité métier. Toutes les décisions importantes passent par les moteurs du Core.

### Onzième principe — Tout doit pouvoir être expliqué.

Un utilisateur doit pouvoir demander : Pourquoi ? Le système doit répondre.

Pourquoi cette entreprise ? Pourquoi cette transition ? Pourquoi ce refus ? Pourquoi cette recommandation ?

L'explicabilité est obligatoire.

### Douzième principe — Rien ne doit être codé deux fois.

Avant toute nouvelle implémentation, le développeur doit vérifier : existe-t-il déjà un moteur ? une règle ? un événement ? un Business Object ? une API ? une automatisation ? une relation du Knowledge Graph ?

Si oui : on réutilise. On ne duplique jamais.

### Treizième principe — Les développements doivent survivre aux technologies.

MEEREO doit pouvoir changer : de framework ; de base de données ; de langage ; de fournisseur cloud ; d'IA. Sans perdre son architecture métier.

L'architecture métier est plus importante que la technologie.

### Quatorzième principe — Chaque développement prépare l'avenir.

Avant toute implémentation, le développeur doit répondre :

- Comment cette fonctionnalité fonctionnera dans cinq ans ?
- Avec dix fois plus d'utilisateurs ?
- Dans plusieurs pays ?
- Avec de nouveaux métiers ?

Cette réflexion fait partie intégrante du développement.

### Quinzième principe — Toute nouvelle fonctionnalité enrichit MEEREO.

Elle doit enrichir : les Business Objects ; les événements ; le Knowledge Graph ; le Digital Twin ; les connaissances de KAI ; sans compromettre la simplicité d'utilisation.

### Conclusion

Développer MEEREO ne consiste pas à écrire du code. Développer MEEREO consiste à construire progressivement le système d'exploitation numérique du secteur du BTP.

Chaque décision technique doit renforcer cette vision. Chaque ligne de code doit contribuer à un écosystème cohérent, évolutif et durable.

Cette méthodologie constitue la norme officielle de développement de MEEREO.

---

## ENGINEERING HANDBOOK · VOLUME 2 · TOME 2 — AI DEVELOPMENT CONSTITUTION : LES RÈGLES DE DÉVELOPPEMENT POUR LES IA

**Version :** 1.0 · **Statut :** Norme d'Ingénierie

### Préambule

MEEREO est développé avec l'assistance de plusieurs intelligences artificielles et de développeurs humains.

Afin de garantir la cohérence de la plateforme, toute intelligence artificielle intervenant sur le projet doit respecter les principes définis dans le présent document. Cette Constitution complète la Constitution de MEEREO, les MADR et le MEEREO Engineering Manual.

### Article 1 — L'architecture prévaut sur le code

Une IA ne doit jamais commencer par produire du code. Elle doit d'abord comprendre :

- le besoin métier ;
- les Business Objects concernés ;
- les workflows ;
- les règles métier ;
- les événements ;
- les automatisations ;
- les impacts sur le Knowledge Graph ;
- les impacts sur le Digital Twin.

Le code est la dernière étape.

### Article 2 — Aucune invention d'architecture

Une IA ne doit jamais créer spontanément : un nouveau moteur ; un nouveau workflow ; un nouveau Business Object ; une nouvelle règle métier fondamentale ; un nouveau protocole de communication.

Toute évolution structurante doit être compatible avec la Platform Bible ou proposée explicitement comme une évolution d'architecture à valider.

### Article 3 — Réutiliser avant de créer

Avant d'introduire un nouveau composant, l'IA doit vérifier si le besoin peut être satisfait par : un moteur existant ; un Business Object existant ; un événement existant ; une règle existante ; une API existante ; une automatisation existante.

La duplication est interdite.

### Article 4 — Le Core est la référence

Toute logique métier appartient au MEEREO Core. Une IA ne doit jamais déplacer une règle métier dans : un Cockpit ; une API publique ; un agent KAI ; une automatisation locale.

### Article 5 — Le métier avant la technique

Les propositions doivent être formulées d'abord en termes métier. Les détails techniques viennent ensuite.

Une IA doit expliquer : quel problème métier est résolu ; quels acteurs sont concernés ; quel Workflow est impacté ; quels moteurs sont sollicités.

### Article 6 — Expliquer les conséquences

Toute proposition importante doit préciser : les avantages ; les limites ; les impacts sur les modules existants ; les conséquences sur les développements futurs.

### Article 7 — Ne pas casser la cohérence

Une IA doit privilégier la cohérence globale de la plateforme. Une solution localement optimale mais globalement incohérente doit être rejetée.

### Article 8 — Utiliser le vocabulaire officiel

Une IA doit employer le vocabulaire défini dans la Platform Bible. Exemples : Business Object ; Cockpit ; Workflow Engine ; Rules Engine ; Event Engine ; Digital Twin ; Knowledge Graph.

Elle ne doit pas introduire de synonymes qui créeraient des ambiguïtés.

### Article 9 — Distinguer les niveaux d'abstraction

Une IA doit distinguer clairement : la vision produit ; l'architecture ; les règles métier ; la conception fonctionnelle ; la conception technique ; l'implémentation.

Ces niveaux ne doivent pas être mélangés.

### Article 10 — Justifier les évolutions

Toute proposition d'évolution importante doit répondre aux questions suivantes :

- Quel problème résout-elle ?
- Pourquoi les solutions existantes ne suffisent-elles pas ?
- Quels sont les impacts sur le Core ?
- Est-elle compatible avec les MADR ?
- Faut-il créer un nouveau MADR ?

### Article 11 — La documentation fait partie du développement

Une évolution n'est pas terminée tant que : les documents d'architecture sont mis à jour ; les MADR sont complétés si nécessaire ; les impacts sont documentés.

Le code et la documentation évoluent ensemble.

### Article 12 — Respecter les décisions humaines

L'IA assiste. Elle propose. Elle explique. Les décisions d'architecture, de gouvernance et de produit restent sous le contrôle des responsables du projet.

### Conclusion

Les intelligences artificielles sont des partenaires de développement. Elles contribuent à la qualité de MEEREO en respectant les principes définis dans la Platform Bible, les MADR et le présent document.

L'objectif n'est pas seulement de produire du code, mais de préserver la cohérence de l'écosystème MEEREO sur le long terme.

---

## ENGINEERING HANDBOOK · VOLUME 3 · TOME 1 — BUSINESS OBJECT REGISTRY (BOR) : LE REGISTRE OFFICIEL DES OBJETS MÉTIER

**Version :** 1.0 · **Statut :** Référentiel d'Ingénierie

### 1. Vision

Le Business Object Registry (BOR) est le registre officiel de tous les objets métier manipulés par MEEREO.

Il constitue la référence unique permettant de connaître : les objets existants ; leurs responsabilités ; leurs relations ; leurs cycles de vie ; leurs événements ; leurs permissions.

Aucun Business Object ne peut exister sans être enregistré dans le BOR.

### 2. Objectifs

Le BOR poursuit plusieurs objectifs :

- éviter la duplication de concepts ;
- normaliser les développements ;
- faciliter le travail des développeurs et des IA ;
- accélérer l'intégration de nouveaux modules ;
- assurer la cohérence du Knowledge Graph.

### 3. Structure d'une fiche BOR

Chaque Business Object possède une fiche officielle. Cette fiche contient obligatoirement :

- **Informations générales** — nom officiel ; code interne ; description ; domaine métier ; version.
- **Héritage** — Business Object parent ; interfaces implémentées ; capacités héritées.
- **Attributs** — liste complète des propriétés ; identification des propriétés obligatoires ; identification des propriétés optionnelles.
- **Relations** — relations autorisées avec les autres Business Objects ; nature de chaque relation ; cardinalités.
- **Workflows** — workflow principal ; workflows secondaires ; états possibles.
- **Événements** — événements produits ; événements consommés.
- **Permissions** — permissions par rôle ; permissions contextuelles.
- **APIs** — commandes disponibles ; consultations disponibles ; recherches disponibles.
- **Utilisation par KAI** — contexte exploité ; questions possibles ; actions recommandables ; limites.
- **Impact sur le Digital Twin** — si applicable.
- **Impact sur le Knowledge Graph** — relations créées ; relations supprimées ; relations modifiées.

### 4. Exemple

**Business Object : Mission** — Code : BO-MISSION

- Hérite de : BusinessObject.
- Produit les événements : MissionCreated ; MissionAccepted ; MissionCompleted ; MissionClosed.
- Workflow : Workflow Mission.
- Relations : Projet ; Entreprise ; Documents ; Décisions ; Actifs ; Conversation ; CRM.
- Permissions : coordinateur technique ; entreprise responsable ; client (consultation selon les droits).
- KAI : explique ; résume ; analyse ; propose les prochaines étapes ; ne valide jamais.

### 5. Classification

Les Business Objects sont classés par domaines :

- **Gouvernance** — Projet ; Mission ; Décision ; Validation.
- **Acteurs** — Client ; Entreprise ; Fournisseur ; Utilisateur ; Équipe.
- **Documents** — Document ; Contrat ; Plan ; DOE ; Rapport.
- **Marketplace** — Produit ; Catalogue ; Commande ; Livraison.
- **Patrimoine** — Actif ; Passeport Numérique ; Maintenance ; Garantie.
- **Communication** — Conversation ; Message ; Notification.
- **CRM** — Relation ; Organisation ; Contact.

### 6. Identifiants

Chaque Business Object possède un identifiant fonctionnel stable. Exemples : BO-PROJECT ; BO-MISSION ; BO-ASSET ; BO-DOCUMENT ; BO-TENDER ; BO-PRODUCT.

Ces identifiants sont indépendants des technologies utilisées.

### 7. Gouvernance

La création d'un nouveau Business Object nécessite :

- une analyse métier ;
- une validation d'architecture ;
- une mise à jour du BOR ;
- une mise à jour de l'Ontologie ;
- une mise à jour du Knowledge Graph ;
- une mise à jour de la documentation.

Aucun développement ne peut contourner cette gouvernance.

### 8. Impact sur les IA

Avant de proposer un nouveau modèle de données, une IA doit consulter le BOR. Elle doit vérifier : qu'un objet similaire n'existe pas déjà ; qu'elle ne crée pas un doublon ; qu'elle respecte les héritages existants.

Le BOR est la référence officielle pour toutes les IA.

### 9. Principe fondamental

Le Business Object Registry garantit que chaque concept métier de MEEREO est unique, documenté, gouverné et réutilisable.

Il constitue le catalogue officiel des objets métier de la plateforme et le point d'entrée privilégié pour tout nouveau développement.

---

# PARTIE IV — KNOWLEDGE BIBLE

## KNOWLEDGE BIBLE · VOLUME 1 · TOME 1 — L'ONTOLOGIE MÉTIER DE MEEREO : LE LANGAGE OFFICIEL DE LA PLATEFORME

**Version :** 1.0 · **Statut :** Référentiel Officiel

### 1. Vision

L'Ontologie Métier définit officiellement les concepts manipulés par MEEREO. Elle constitue la source unique de vérité concernant le vocabulaire métier.

Tous les composants de la plateforme utilisent cette ontologie : les Cockpits ; le MEEREO Core ; les APIs ; les Business Objects ; le Knowledge Graph ; le Digital Twin ; KAI ; la documentation.

Aucun composant ne définit ses propres concepts.

### 2. Objectifs

L'ontologie poursuit plusieurs objectifs :

- créer un langage commun ;
- supprimer les ambiguïtés ;
- faciliter les développements ;
- améliorer les recherches ;
- permettre le raisonnement de KAI ;
- structurer le Knowledge Graph.

### 3. Structure d'un concept

Chaque concept possède obligatoirement :

- **Nom officiel** — exemple : Projet.
- **Définition** — description officielle.
- **Description métier** — pourquoi ce concept existe.
- **Responsabilités** — ce qu'il représente.
- **Cycle de vie** — comment il évolue.
- **Relations** — avec quels concepts il est relié.
- **Business Object** — le Business Object correspondant.
- **Workflows** — les workflows concernés.
- **Événements** — les événements produits.
- **Permissions** — qui peut agir dessus.
- **Règles métier** — les règles principales.
- **Utilisation par KAI** — comment KAI exploite ce concept.

### 4. Exemple

**Concept : Projet**

- **Définition** — un Projet représente l'ensemble des activités permettant de concevoir, construire, exploiter ou transformer un ouvrage.
- **Relations** — Client possède Projet ; Projet contient Missions ; Projet possède Documents ; Projet possède Actifs ; Projet construit Digital Twin.
- **Événements** — ProjectCreated ; ProjectUpdated ; ProjectClosed.
- **Workflow** — Workflow Projet.
- **Business Object** — ProjectObject.
- **KAI** — comprend le contexte global du projet.

### 5. Types de concepts

L'ontologie couvre notamment :

- **Les acteurs** — Client ; Professionnel ; Entreprise ; Fournisseur ; Intervenant ; Administrateur.
- **Les objets métier** — Projet ; Mission ; Document ; Produit ; Commande ; Actif ; Passeport Numérique ; Conversation ; Décision ; Rapport.
- **Les moteurs** — Workflow Engine ; Rules Engine ; Automation Engine ; Event Engine ; Knowledge Graph ; Digital Twin.
- **Les workflows** — Workflow Projet ; Workflow Mission ; Workflow Commande ; Workflow Actif ; Workflow Document.
- **Les événements** — tous les événements officiels.

### 6. Utilisation

L'ontologie est utilisée : lors du développement ; par KAI ; par le Search Engine ; par le Knowledge Graph ; dans la documentation ; dans les APIs.

Elle constitue la référence officielle.

### 7. Évolution

Toute création d'un nouveau concept nécessite : une définition ; un Business Object ; des relations ; des événements ; un workflow ; des permissions.

Aucun concept ne peut être ajouté sans être intégré à l'ontologie.

### 8. Principe fondamental

Le langage officiel de MEEREO est défini par son Ontologie Métier. Tous les développements doivent s'y conformer.

Elle constitue la base de compréhension commune entre les utilisateurs, les développeurs, les moteurs du Core et KAI.

---

# PARTIE V — PRODUCT REQUIREMENTS DOCUMENT (PRD)

## PRD · TOME 1 — VISION, PHILOSOPHIE, ARCHITECTURE FONCTIONNELLE ET PRINCIPES FONDAMENTAUX

**Version :** 1.0 · **Statut :** Document de référence · **Confidentialité :** Confidentiel – MEEREO PROJECT

### Préambule

Ce document constitue la référence fonctionnelle officielle de la plateforme MEEREO.

Il ne s'agit pas d'un document technique destiné à expliquer comment développer la plateforme, mais d'un document métier qui décrit précisément sa philosophie, son fonctionnement, son architecture fonctionnelle, ses règles de gestion et les interactions entre tous les acteurs.

Tout développement futur devra respecter strictement les principes décrits dans ce document. Aucune fonctionnalité ne devra être implémentée si elle entre en contradiction avec les règles métier définies ici.

### 1. Vision de MEEREO

MEEREO est une plateforme numérique collaborative dédiée à l'univers de la construction, de la rénovation, de l'aménagement et de l'immobilier.

Sa mission est de centraliser, dans un environnement unique, l'ensemble des acteurs, des informations, des documents et des processus nécessaires à la réalisation d'un projet.

Aujourd'hui, un projet de construction implique une multitude d'intervenants qui utilisent chacun leurs propres outils, leurs propres méthodes de communication et leurs propres documents. Cette fragmentation entraîne des pertes d'information, des retards, des erreurs de coordination et un manque de visibilité pour le client.

MEEREO répond à cette problématique en créant un espace numérique unique où chaque acteur intervient selon son rôle, tout en partageant une vision commune du projet.

La plateforme ne cherche pas uniquement à mettre en relation des clients avec des professionnels. Elle a pour ambition de devenir le système d'exploitation des projets de construction.

### 2. Mission

La mission de MEEREO est de simplifier l'ensemble du cycle de vie d'un projet. Depuis la naissance de l'idée jusqu'à la livraison finale, chaque étape doit pouvoir être suivie, documentée, validée et historisée à l'intérieur de la plateforme.

MEEREO devient ainsi le point d'entrée unique du projet.

### 3. Les objectifs stratégiques

La plateforme poursuit plusieurs objectifs :

- créer une relation de confiance entre les clients et les professionnels ;
- faciliter la recherche de partenaires qualifiés ;
- créer un environnement collaboratif sécurisé ;
- centraliser les documents ;
- centraliser les échanges ;
- améliorer le suivi des projets ;
- digitaliser les processus métiers ;
- créer une véritable mémoire numérique du projet ;
- développer un écosystème complet autour du BTP.

### 4. Philosophie produit

MEEREO repose sur cinq principes fondamentaux.

**Premier principe : le Projet est le centre de tout.** Aucun élément de la plateforme n'existe indépendamment d'un projet. Un document appartient à un projet. Une conversation appartient à un projet. Une validation appartient à un projet. Une tâche appartient à un projet. Une commande appartient à un projet. Chaque donnée doit pouvoir être reliée à un projet ou à la préparation d'un projet. Le projet constitue donc l'objet métier principal de la plateforme.

**Deuxième principe : les utilisateurs collaborent, ils ne travaillent jamais isolément.** MEEREO est une plateforme collaborative. Chaque utilisateur possède son propre espace mais les informations utiles sont partagées avec les personnes autorisées. Le cloisonnement des informations est limité au strict nécessaire afin de favoriser la collaboration tout en respectant les droits d'accès.

**Troisième principe : la transparence.** Toutes les actions importantes sont historisées. Chaque utilisateur peut consulter les événements qui le concernent. Le système doit conserver la chronologie des décisions, des validations et des modifications. Aucune action importante ne doit disparaître sans laisser une trace.

**Quatrième principe : l'intelligence artificielle accompagne mais ne décide pas.** L'intelligence artificielle KAI assiste les utilisateurs. Elle analyse. Elle recommande. Elle alerte. Elle automatise certaines tâches. En revanche, elle ne remplace jamais la décision humaine. Le choix final appartient toujours aux utilisateurs habilités.

**Cinquième principe : l'évolutivité.** La première version de MEEREO est volontairement limitée afin de garantir une expérience utilisateur maîtrisée. Toutefois, son architecture doit permettre l'ajout de nouveaux métiers, de nouveaux services et de nouvelles fonctionnalités sans remettre en cause les fondations du système.

### 5. Les acteurs de la plateforme

La première version de MEEREO comporte trois familles d'utilisateurs.

**Le Client.** Le client est le propriétaire du projet. Il peut être un particulier, une entreprise, un promoteur ou une organisation. Son objectif est de créer, piloter et suivre son projet.

**Les Professionnels.** La première version limite volontairement les profils professionnels aux catégories suivantes :

- Bureau d'architecture
- Entreprise de construction
- Bureau d'études structure
- Bureau d'études fluides
- Architecte d'intérieur

Ces professionnels collaborent directement sur les projets. Ils peuvent être invités par un client ou par un autre professionnel selon les règles définies dans les workflows.

**Les Fournisseurs.** Les fournisseurs commercialisent leurs produits au travers du Marketplace. Ils alimentent les projets en matériaux, équipements, mobilier et solutions Green. Ils ne participent pas à la conception du projet sauf si une fonctionnalité future le prévoit.

### 6. Les objets métier fondamentaux

Toute la plateforme repose sur quelques objets centraux.

**Le Projet.** Le projet est l'objet principal. Il possède notamment : un propriétaire ; un statut ; une chronologie ; des intervenants ; une messagerie ; des documents ; des appels d'offres ; des achats ; un historique ; un Cockpit Projet. Aucun développement ne doit contourner cette logique.

**L'Utilisateur.** Chaque utilisateur possède un profil unique. Un même utilisateur peut intervenir sur plusieurs projets. Chaque utilisateur conserve un historique complet de ses activités.

**L'Entreprise.** Chaque professionnel est rattaché à une entreprise vérifiée. Les informations légales de cette entreprise sont validées avant toute activité sur la plateforme.

**Le CRM.** MEEREO génère automatiquement des relations CRM : CRM Client, CRM Professionnel, CRM Intervenant. Ces relations sont créées automatiquement en fonction des collaborations.

**Les Appels d'offres.** Les appels d'offres permettent de recruter un partenaire ou de répondre à un besoin. Ils peuvent être publics ou ciblés selon les workflows définis dans les tomes suivants.

**Le Marketplace.** Le Marketplace regroupe les produits proposés par les fournisseurs. Chaque produit appartient à un fournisseur identifié. Les achats peuvent être réalisés directement dans le cadre d'un projet afin d'assurer une traçabilité complète.

### 7. Les principes de sécurité

MEEREO doit inspirer confiance.

Chaque professionnel fait l'objet d'une vérification documentaire. Les documents transmis sont contrôlés avant la validation du compte. Les échanges sont sécurisés. Les droits d'accès sont définis selon le rôle de chaque utilisateur. Chaque action importante est historisée.

### 8. Les principes d'expérience utilisateur

La plateforme doit rester simple malgré la richesse fonctionnelle.

Chaque écran doit répondre à une seule intention principale. Le parcours utilisateur doit limiter le nombre d'actions nécessaires pour accomplir une tâche. Les informations importantes doivent être visibles immédiatement. L'utilisateur ne doit jamais se sentir perdu.

### 9. Les principes d'automatisation

MEEREO automatise tout ce qui peut l'être sans retirer le contrôle aux utilisateurs.

À titre d'exemple, la plateforme peut automatiquement :

- créer un projet ;
- créer un Cockpit Projet ;
- créer une messagerie dédiée ;
- créer les relations CRM ;
- notifier les intervenants concernés ;
- historiser les événements ;
- préparer les prochaines étapes du projet ;
- proposer des partenaires grâce à KAI.

Toutes ces automatisations sont déclenchées par des événements métier clairement définis dans les tomes suivants.

### 10. Les principes de conception logicielle

Afin de garantir la cohérence de la plateforme, tous les développements devront respecter les règles suivantes :

- une fonctionnalité doit toujours répondre à un besoin métier clairement identifié ;
- aucun écran ne doit exister sans objectif fonctionnel précis ;
- toute action utilisateur doit produire un résultat explicite ou une confirmation ;
- les automatisations ne doivent jamais surprendre l'utilisateur : elles doivent être compréhensibles et traçables ;
- les rôles et les permissions doivent être centralisés et appliqués de manière uniforme dans toute la plateforme ;
- les futures évolutions devront s'intégrer sans remettre en cause les fondations décrites dans ce document.

### Conclusion du Tome 1

Ce premier tome définit les fondations de MEEREO. Il fixe la vision, les principes directeurs, les objets métier et les règles qui guideront l'ensemble des développements.

Les tomes suivants détailleront, acteur par acteur et fonctionnalité par fonctionnalité, chaque workflow, chaque automatisation, chaque permission et chaque scénario d'utilisation afin que le comportement de la plateforme soit entièrement déterminé et ne laisse aucune place à l'interprétation.

---

## PRD · TOME 2 — WORKFLOW COMPLET DU CLIENT

**Version :** 1.0

### 1. Objectif du parcours Client

Le parcours Client constitue le point d'entrée principal de MEEREO. L'objectif de ce workflow est d'accompagner un porteur de projet depuis sa première visite sur la plateforme jusqu'à la création de son premier projet collaboratif.

À aucun moment le client ne doit se sentir perdu ou confronté à une décision technique. La plateforme doit comprendre son besoin et l'orienter vers le parcours le plus adapté.

Le workflow doit être simple pour le client mais extrêmement structuré en arrière-plan. Toutes les actions réalisées par le client doivent être historisées et pouvoir déclencher des automatisations.

### 2. Définition du Client

Le Client est le propriétaire d'un ou plusieurs projets. Il est le donneur d'ordre.

Il peut inviter des professionnels, accepter ou refuser des propositions, consulter l'avancement de ses projets et piloter l'ensemble de ses opérations.

Le Client ne réalise pas les prestations techniques. Son rôle est de piloter et de valider.

### 3. Premier accès à la plateforme

Lorsqu'un utilisateur arrive sur MEEREO pour la première fois, il peut librement découvrir les fonctionnalités publiques de la plateforme :

- présentation de MEEREO ;
- annuaire des professionnels ;
- pages publiques des professionnels ;
- Marketplace ;
- réalisations mises en avant ;
- biens immobiliers proposés ;
- informations générales.

Aucune fonctionnalité collaborative n'est accessible sans création de compte.

### 4. Création du compte Client

Le client clique sur Créer un compte. Il choisit le profil Client.

Le formulaire d'inscription demande uniquement les informations nécessaires au démarrage.

**Informations personnelles :** prénom ; nom ; adresse e-mail ; numéro de téléphone ; pays ; ville ; mot de passe.

La plateforme vérifie :

- que l'adresse e-mail n'est pas déjà utilisée ;
- que le numéro de téléphone est valide ;
- que le mot de passe respecte les règles de sécurité.

Après validation, un compte est créé. Le client reçoit un e-mail de vérification. Tant que cette vérification n'est pas effectuée, certaines fonctionnalités restent limitées.

### 5. Création du profil Client

Lors de sa première connexion, MEEREO lance automatiquement un assistant d'accueil. Cet assistant a pour objectif de comprendre le projet du client.

Le client renseigne :

- le type de projet ;
- le pays ;
- la ville ;
- la localisation approximative ;
- une description libre ;
- un budget estimatif (facultatif) ;
- une date souhaitée de démarrage (facultative).

Ces informations ne constituent pas encore un projet complet. Elles permettent uniquement à la plateforme de personnaliser le parcours du client.

### 6. Choix du parcours

Une fois ces informations enregistrées, la plateforme affiche une question centrale : *Comment souhaitez-vous démarrer votre projet ?* Quatre choix sont proposés.

#### Parcours 1 — Je recherche un architecte

Ce parcours s'adresse au client qui ne connaît encore aucun professionnel. En cliquant sur cette option, MEEREO ouvre un assistant de création d'appel d'offres.

Le client précise : le type de bâtiment ; une description plus détaillée ; les objectifs du projet ; les éventuelles contraintes.

Le système crée automatiquement un appel d'offres réservé aux bureaux d'architecture inscrits sur la plateforme.

**Traitements automatiques.** À la validation :

- un identifiant unique est généré pour l'appel d'offres ;
- le statut passe à Ouvert ;
- l'appel d'offres est publié uniquement auprès des profils « Bureau d'architecture » ;
- les architectes correspondant à la zone géographique reçoivent une notification ;
- l'événement est enregistré dans le journal d'activité.

**Réponse des architectes.** Chaque architecte peut : consulter la demande ; poser des questions ; transmettre une proposition ; refuser de répondre.

Toutes les propositions sont regroupées dans un tableau comparatif. Le client peut comparer : les profils ; les réalisations ; les notes ; les avis ; les domaines d'expertise ; les délais proposés.

**Sélection.** Lorsque le client choisit un architecte, la plateforme déclenche automatiquement plusieurs actions :

- **Création du Projet** — le projet est créé.
- **Création du Cockpit Projet** — le Cockpit est généré.
- **Attribution des rôles** — Client = Propriétaire ; Architecte = Premier intervenant.
- **Création des espaces** — messagerie du projet ; historique ; documents ; journal d'activité ; calendrier ; tableau des intervenants.
- **Création automatique des CRM** — chez l'architecte : CRM Client ; chez le client : CRM Professionnel.
- **Notifications** — le client reçoit une confirmation ; l'architecte reçoit une notification d'attribution.

#### Parcours 2 — J'ai déjà un architecte

Ce parcours concerne un client qui travaille déjà avec un bureau d'architecture. La plateforme demande uniquement l'adresse e-mail de l'architecte. Deux cas sont possibles.

**Cas A : l'architecte possède déjà un compte.** Le système vérifie : que l'adresse existe ; que le compte est actif ; que le profil est bien un Bureau d'architecture.

Si ces trois conditions sont réunies : le projet est créé automatiquement ; le Cockpit est créé ; les deux utilisateurs sont reliés ; le CRM est généré ; une notification est envoyée. L'architecte retrouve immédiatement le projet dans son tableau de bord.

**Cas B : l'architecte n'est pas inscrit.** Le système crée une invitation. L'architecte reçoit un e-mail personnalisé. Ce message contient : une présentation de MEEREO ; l'identité du client ; un lien sécurisé d'inscription.

Pendant cette période, le projet reste dans l'état : *En attente de l'inscription de l'architecte.*

Dès que l'architecte termine son inscription, le système : vérifie son identité professionnelle ; crée son profil ; l'associe automatiquement au projet ; active le Cockpit Projet ; ouvre la messagerie ; envoie une notification aux deux parties.

Aucune intervention manuelle n'est nécessaire.

#### Parcours 3 — Je souhaite que MEEREO m'accompagne

Le client préfère être guidé. Dans ce scénario, KAI intervient dès la création du projet.

Elle analyse : la localisation ; le type de bâtiment ; la complexité ; le budget (si renseigné) ; les besoins exprimés.

KAI construit ensuite une liste de professionnels recommandés. Chaque recommandation est justifiée, par exemple :

- expérience sur des projets similaires ;
- proximité géographique ;
- disponibilité estimée ;
- qualité des évaluations ;
- spécialisation.

Le client peut : accepter une recommandation ; consulter les profils publics ; échanger avec les professionnels proposés ; rechercher lui-même un autre professionnel.

Dès qu'un architecte est sélectionné, les mêmes automatisations que dans les parcours précédents sont déclenchées.

#### Parcours 4 — Je souhaite simplement découvrir MEEREO

Le client ne souhaite pas encore démarrer de projet. La plateforme lui donne accès à un mode découverte.

Il peut : consulter les pages publiques des professionnels ; rechercher un architecte ; consulter les réalisations ; visiter le Marketplace ; découvrir des matériaux ; rechercher du mobilier ; consulter les produits Green ; parcourir les biens immobiliers proposés.

À tout moment, un bouton Créer mon projet reste visible. Le client peut donc transformer son parcours de découverte en véritable projet sans recommencer son inscription.

### 7. Règles métier du parcours Client

Les règles suivantes sont obligatoires :

- Un client ne peut posséder qu'un seul compte utilisateur.
- Un client peut créer plusieurs projets.
- Chaque projet possède un propriétaire unique.
- Un projet ne peut jamais exister sans propriétaire.
- Le premier professionnel d'un projet est toujours un Bureau d'architecture.
- Une entreprise de construction ne peut pas être le premier intervenant d'un nouveau projet dans la version 1.
- Toute création de projet déclenche automatiquement la création d'un Cockpit Projet.
- Toute association entre un client et un professionnel crée automatiquement les fiches CRM correspondantes.
- Toutes les actions importantes sont historisées.
- Les invitations envoyées aux professionnels doivent être traçables.
- Chaque notification est enregistrée dans le journal d'activité.
- Les modifications apportées au projet doivent conserver un historique afin de garantir une traçabilité complète.

### 8. Objectif du Tome 2

À la fin de ce workflow, le client doit toujours se retrouver dans une situation claire :

- soit il est encore en phase de découverte ;
- soit il attend la réponse d'un architecte ;
- soit un architecte est déjà associé à son projet ;
- soit un projet collaboratif est créé avec son Cockpit entièrement opérationnel.

Aucune autre situation ne doit être possible dans la version 1 de MEEREO.

---

## PRD · PRINCIPE FONDAMENTAL — ORGANISATION DES PROJETS PAR MISSIONS

### Vision

MEEREO ne se limite pas à connecter un client avec des professionnels. La plateforme reproduit fidèlement le déroulement réel d'un projet de construction en structurant chaque projet autour de missions clairement identifiées.

Chaque mission représente une étape métier du projet et possède son propre responsable, ses livrables, ses documents, son historique et son cycle de validation.

Cette architecture garantit une meilleure organisation, une meilleure traçabilité et une collaboration plus fluide entre tous les intervenants.

### Principe général

Un projet est composé d'une ou plusieurs missions. Chaque mission est indépendante mais reste reliée au même projet.

Une mission ne peut être attribuée qu'à un seul professionnel responsable, mais plusieurs collaborateurs appartenant à la même entreprise pourront intervenir sur cette mission selon les droits qui leur seront accordés.

Chaque mission possède :

- un identifiant unique ;
- un responsable principal ;
- un type de mission ;
- un statut ;
- une date de création ;
- une date de début ;
- une date prévisionnelle de fin ;
- une date de clôture ;
- un ensemble de livrables ;
- des documents ;
- une messagerie dédiée ;
- un journal d'activité ;
- des validations ;
- des tâches ;
- des commentaires.

Toutes les actions réalisées dans une mission sont automatiquement historisées.

### Les missions disponibles dans la Version 1

**Mission 1 – Conception Architecturale.** Responsable : Bureau d'architecture. Objectifs : comprendre les besoins du client ; produire les esquisses ; réaliser les plans ; préparer les dossiers administratifs ; coordonner les autres intervenants techniques. Le bureau d'architecture devient automatiquement le pilote technique du projet dès son intégration.

**Mission 2 – Études Structure.** Responsable : Bureau d'études structure. Cette mission peut être créée par le bureau d'architecture lorsque les études structure deviennent nécessaires. Elle comprend notamment : notes de calcul ; plans structure ; rapports techniques ; validations.

**Mission 3 – Études Fluides.** Responsable : Bureau d'études fluides. Cette mission regroupe notamment : plomberie ; électricité ; climatisation ; ventilation ; réseaux techniques. Tous les documents restent attachés à cette mission.

**Mission 4 – Construction.** Responsable : Entreprise de construction. Cette mission comprend notamment : préparation du chantier ; planning d'exécution ; suivi des travaux ; rapports journaliers ; demandes de validation ; avancement ; réception. L'entreprise de construction pilote uniquement la mission Construction et n'a pas autorité sur les autres missions.

**Mission 5 – Architecture d'Intérieur.** Responsable : Architecte d'intérieur. Cette mission est facultative. Elle peut être créée à tout moment par le bureau d'architecture si le projet le nécessite.

### Création des missions

Les missions ne sont jamais créées automatiquement, à l'exception de la mission Conception Architecturale.

Lorsqu'un client sélectionne un bureau d'architecture, la plateforme crée automatiquement : le projet ; le Cockpit Projet ; la Mission Conception Architecturale.

Toutes les autres missions sont créées uniquement lorsque le bureau d'architecture décide qu'elles sont nécessaires.

### Intégration d'un professionnel

Le bureau d'architecture est responsable de la constitution de l'équipe technique. Lorsqu'il souhaite intégrer un professionnel :

1. Il ouvre le Cockpit Projet.
2. Il sélectionne « Ajouter une mission ».
3. Il choisit le type de mission.
4. Il recherche un professionnel dans l'annuaire MEEREO ou saisit son adresse e-mail.
5. Si le professionnel possède déjà un compte, une invitation lui est envoyée.
6. Si le professionnel ne possède pas encore de compte, la plateforme lui envoie une invitation à rejoindre MEEREO.
7. Une fois son inscription terminée, il est automatiquement affecté à la mission concernée.

L'intégration devient effective uniquement lorsque le professionnel accepte officiellement l'invitation.

### Autorité sur les missions

Le client est propriétaire du projet. Le bureau d'architecture est responsable de la coordination technique. Chaque professionnel est responsable de sa propre mission.

Un professionnel ne peut pas modifier les missions dont il n'est pas responsable, sauf si des permissions particulières lui sont accordées.

Le bureau d'architecture conserve une vision globale de l'ensemble du projet et coordonne les interactions entre les différentes missions.

### Cycle de vie d'une mission

Chaque mission suit le même cycle :

- À créer
- En attente d'un responsable
- Invitation envoyée
- Invitation acceptée
- En préparation
- En cours
- En attente de validation
- Validée
- Terminée
- Archivée

Chaque changement d'état est enregistré dans le journal d'activité.

### Automatisations

Lorsqu'une mission est créée, MEEREO exécute automatiquement les actions suivantes :

- création de la mission dans le Cockpit Projet ;
- création des droits d'accès associés ;
- création d'une messagerie dédiée à la mission ;
- création des relations CRM entre les acteurs concernés ;
- ajout de la mission dans la chronologie du projet ;
- notification des utilisateurs concernés ;
- enregistrement de l'événement dans le journal d'activité.

### Intervention de KAI

À chaque création de mission, KAI analyse automatiquement le contexte du projet. Elle peut notamment :

- recommander des professionnels adaptés ;
- signaler qu'une mission importante est absente ;
- proposer un ordre logique d'intervention ;
- détecter d'éventuels conflits entre missions ;
- rappeler les prochaines étapes du projet ;
- suggérer des fournisseurs et des matériaux adaptés à la mission en cours.

KAI agit comme un assistant de coordination. Elle recommande et accompagne les utilisateurs, mais ne prend jamais de décision à leur place.

### Principe fondamental

Dans MEEREO, un projet n'est pas une simple liste d'intervenants.

Un projet est une organisation structurée de missions, confiées à des professionnels qualifiés, collaborant dans un environnement commun, avec une traçabilité complète de toutes les actions réalisées.

Cette organisation par missions constitue l'un des fondements de l'architecture fonctionnelle de MEEREO et devra être respectée dans tous les développements futurs.

---

## PRD · TOME 3 — LE PROFESSIONNEL

**Version :** 1.0

### Introduction

Le Professionnel constitue le deuxième acteur majeur de l'écosystème MEEREO.

Contrairement à la majorité des plateformes qui se limitent à mettre en relation des clients et des prestataires, MEEREO fait du Professionnel un acteur central du cycle de vie du projet.

Le Professionnel ne vend pas uniquement une prestation. Il collabore. Il produit. Il valide. Il coordonne. Il échange. Il documente. Il construit l'intelligence collective du projet.

Chaque professionnel possède un environnement de travail complet lui permettant de gérer simultanément son entreprise, ses clients, ses missions et ses collaborations avec les autres intervenants. L'ensemble de ses activités est centralisé dans son Cockpit Professionnel.

### 1. Les profils professionnels

La Version 1 de MEEREO est volontairement limitée à cinq catégories professionnelles. Aucun autre métier ne pourra être créé tant qu'une évolution officielle de la plateforme ne l'autorisera pas.

Les cinq profils disponibles sont :

- Bureau d'architecture
- Entreprise de construction
- Bureau d'études structure
- Bureau d'études fluides
- Architecte d'intérieur

Chaque catégorie possède les mêmes outils de base mais des responsabilités différentes.

### 2. Philosophie du Professionnel

Le professionnel n'est pas un simple utilisateur. Il représente une entreprise. Chaque action réalisée sur la plateforme engage cette entreprise.

Toutes les informations affichées publiquement doivent donc être fiables, vérifiées et régulièrement mises à jour.

L'objectif de MEEREO est de créer un réseau de professionnels qualifiés et vérifiés, capable d'inspirer confiance aux clients. La vérification de l'identité de l'entreprise est donc obligatoire avant toute participation aux projets.

### 3. Inscription d'un Professionnel

Le professionnel clique sur Créer un compte. Il sélectionne la catégorie correspondant exactement à son activité.

Cette catégorie détermine ses permissions, les appels d'offres auxquels il pourra répondre et les missions qu'il pourra assumer.

Une fois sélectionnée, cette catégorie ne peut pas être modifiée directement par l'utilisateur. Toute modification nécessite une validation par les administrateurs de MEEREO afin d'éviter les erreurs ou les abus.

### 4. Création du compte

Le formulaire d'inscription est volontairement simple afin de faciliter l'accès à la plateforme. Les informations demandées sont :

**Informations personnelles du représentant :** prénom ; nom ; fonction dans l'entreprise ; téléphone ; adresse e-mail.

**Informations de connexion :** mot de passe ; confirmation du mot de passe.

Après validation, le compte utilisateur est créé, mais il reste dans l'état Profil incomplet. Le professionnel ne peut pas encore répondre aux appels d'offres ni être intégré à un projet.

### 5. Création de l'entreprise

Après la création du compte, MEEREO lance automatiquement un assistant de configuration. Cet assistant permet de créer la fiche de l'entreprise. Les informations suivantes sont demandées :

**Identification :** raison sociale ; nom commercial (si différent) ; catégorie professionnelle ; forme juridique.

**Coordonnées :** pays ; ville ; adresse ; téléphone principal ; adresse e-mail de contact ; site Internet (facultatif).

**Informations administratives :** RCCM ; numéro de contribuable ; numéro CNPS (facultatif selon les cas) ; année de création de l'entreprise.

**Présentation :** description de l'entreprise ; domaines d'expertise ; zones géographiques d'intervention ; langues parlées.

Toutes ces informations sont enregistrées dans la base de données de l'entreprise.

### 6. Vérification de l'entreprise

La confiance est un pilier fondamental de MEEREO. Avant d'autoriser une entreprise à intervenir sur la plateforme, celle-ci doit être vérifiée.

Le professionnel est invité à déposer les documents officiels de son entreprise. Par exemple :

- extrait RCCM ;
- attestation fiscale ou document équivalent ;
- document d'identification de l'entreprise ;
- tout autre document exigé par la réglementation applicable.

Ces documents sont transmis dans un espace sécurisé. Le système les associe automatiquement au profil de l'entreprise. Le statut du compte devient alors : *En attente de vérification.*

### 7. Validation par MEEREO

Les administrateurs de la plateforme analysent les documents. Trois résultats sont possibles.

**Validation.** Les documents sont conformes. Le compte passe à l'état : Professionnel vérifié. Toutes les fonctionnalités sont débloquées.

**Demande de complément.** Certains documents sont manquants ou illisibles. Le professionnel reçoit une notification détaillant les éléments à corriger. Le compte reste limité tant que les documents n'ont pas été complétés.

**Refus.** Si les documents sont invalides ou frauduleux, le compte est refusé. Le professionnel est informé du motif. Les administrateurs conservent une trace de cette décision dans le journal interne.

### 8. Badge de vérification

Une entreprise validée obtient automatiquement un badge Professionnel vérifié MEEREO. Ce badge apparaît :

- sur son profil public ;
- dans les résultats de recherche ;
- dans les appels d'offres ;
- dans les recommandations de KAI.

Le badge constitue un élément essentiel de confiance pour les clients.

### 9. Première connexion

Lorsqu'un professionnel vérifié se connecte pour la première fois, il n'arrive jamais directement sur son tableau de bord. MEEREO lui propose un parcours de personnalisation afin de compléter son identité numérique.

Les étapes sont les suivantes :

1. Création ou importation du logo.
2. Choix des couleurs de l'entreprise.
3. Import de la photo de couverture.
4. Présentation de l'entreprise.
5. Ajout des compétences.
6. Définition des zones d'intervention.
7. Création de la Page Professionnelle Publique.

Ce n'est qu'après avoir terminé ce parcours que le Cockpit Professionnel devient pleinement accessible.

### 10. Principes métier

Les règles suivantes sont obligatoires :

- Un compte professionnel représente une seule entreprise.
- Une entreprise ne peut posséder qu'un seul profil principal sur MEEREO.
- Chaque professionnel est rattaché à une catégorie unique dans la version 1.
- Aucun professionnel non vérifié ne peut répondre à un appel d'offres.
- Aucun professionnel non vérifié ne peut être affecté à une mission.
- Les informations légales de l'entreprise sont confidentielles et ne sont jamais affichées publiquement.
- Les documents administratifs ne sont accessibles qu'aux administrateurs autorisés.
- Toute modification des informations juridiques déclenche une nouvelle procédure de vérification.

### Conclusion de la première partie

L'inscription d'un professionnel sur MEEREO ne consiste pas seulement à créer un compte. Elle établit une relation de confiance entre la plateforme, les clients et les entreprises.

La vérification des informations, la création d'une identité numérique professionnelle et la validation des documents administratifs sont des étapes indispensables avant toute participation aux projets.

Une fois ces étapes terminées, le professionnel est prêt à construire sa présence sur MEEREO grâce à sa Page Professionnelle Publique, qui sera décrite dans la deuxième partie du Tome 3.

---

## PRD · TOME 3 – PARTIE 2 — LA PAGE PROFESSIONNELLE PUBLIQUE

### 11. Objectif

Chaque entreprise inscrite sur MEEREO possède une Page Professionnelle Publique. Cette page constitue son identité numérique officielle sur la plateforme.

Elle poursuit plusieurs objectifs :

- présenter l'entreprise aux futurs clients ;
- mettre en valeur son savoir-faire ;
- présenter ses réalisations ;
- renforcer la confiance grâce à la vérification MEEREO ;
- permettre au client de choisir son futur partenaire ;
- améliorer la visibilité de l'entreprise sur Internet grâce à une URL publique.

La Page Professionnelle Publique doit être suffisamment complète pour qu'un client puisse prendre une décision sans quitter MEEREO.

### 12. Philosophie

La page publique ne doit pas ressembler à un simple annuaire. Elle doit raconter l'histoire de l'entreprise.

Le visiteur doit comprendre en quelques secondes :

- qui est cette entreprise ;
- ce qu'elle réalise ;
- pourquoi lui faire confiance ;
- quelles sont ses compétences ;
- quels sont ses projets ;
- comment la contacter.

Cette page représente la vitrine digitale officielle de l'entreprise.

### 13. Structure de la page

La page est organisée en sections. Chaque section peut être mise à jour depuis le Cockpit Professionnel. Toutes les modifications sont enregistrées dans l'historique.

**Section 1 – En-tête.** L'en-tête contient : photo de couverture ; logo ; nom de l'entreprise ; catégorie professionnelle ; badge « Professionnel vérifié MEEREO » ; ville ; pays ; année de création ; nombre de projets réalisés sur MEEREO ; note moyenne de satisfaction ; bouton « Contacter » ; bouton « Inviter sur un projet » (visible uniquement pour les utilisateurs connectés).

**Section 2 – Présentation.** Cette section présente l'entreprise. Elle comprend : une description générale ; son histoire ; sa vision ; ses valeurs ; son approche des projets. Le texte est libre mais une limite de caractères est définie afin de conserver une bonne lisibilité.

**Section 3 – Domaines d'expertise.** Le professionnel sélectionne ses domaines d'intervention. Exemples : logements individuels ; immeubles résidentiels ; bâtiments tertiaires ; bâtiments industriels ; rénovation ; extension ; aménagement intérieur. Ces informations sont utilisées par KAI pour améliorer les recommandations.

**Section 4 – Portfolio.** Le portfolio constitue l'un des éléments les plus importants de la page. Chaque réalisation peut contenir : un titre ; une description ; des photographies ; des vidéos ; des plans (si autorisés) ; la localisation générale ; l'année de réalisation ; la surface ; le type de bâtiment ; les prestations réalisées. Le professionnel peut choisir de masquer certaines informations sensibles.

**Section 5 – L'équipe.** L'entreprise peut présenter ses principaux collaborateurs. Chaque membre comprend : photographie ; nom ; fonction ; courte biographie ; spécialités. Cette section est informative et ne détermine pas les droits d'accès dans MEEREO. Les véritables permissions sont gérées depuis le Cockpit Professionnel.

**Section 6 – Certifications et distinctions.** Le professionnel peut ajouter : certifications ; labels ; récompenses ; affiliations professionnelles. Certaines certifications pourront être vérifiées par MEEREO dans les versions futures.

**Section 7 – Avis clients.** Les avis ne peuvent être publiés que par des clients ayant réellement collaboré avec l'entreprise sur un projet MEEREO. Chaque avis comprend : une note globale ; un commentaire ; la date ; le projet concerné (si le client accepte de l'afficher). Le professionnel peut répondre publiquement à un avis. Les avis ne peuvent jamais être modifiés après leur publication. Ils peuvent uniquement être masqués par les administrateurs en cas de non-respect des règles de la plateforme.

**Section 8 – Statistiques.** Cette section présente automatiquement des indicateurs calculés par MEEREO. Exemples : nombre de projets réalisés ; taux de réponse aux appels d'offres ; délai moyen de réponse ; note moyenne ; nombre de missions terminées ; ancienneté sur la plateforme. Ces statistiques sont générées automatiquement et ne peuvent pas être modifiées par le professionnel.

**Section 9 – Coordonnées.** Le professionnel peut afficher : téléphone ; e-mail professionnel ; site Internet ; réseaux sociaux ; adresse. Certaines informations peuvent être rendues privées selon les préférences du professionnel.

**Section 10 – Contact.** Un visiteur connecté peut : envoyer un message ; demander un rendez-vous ; inviter le professionnel à rejoindre un projet ; enregistrer l'entreprise dans ses favoris ; partager la page. Chaque interaction est enregistrée dans le CRM du professionnel.

### 14. URL publique

Chaque entreprise dispose d'une adresse publique unique. Exemple : meereo.com/pro/raw-design

Cette URL peut être utilisée : sur les cartes de visite ; dans les signatures d'e-mails ; sur les réseaux sociaux ; dans les devis ; dans les présentations commerciales.

La page est accessible même aux visiteurs qui ne possèdent pas de compte MEEREO.

### 15. Référencement

La Page Professionnelle Publique doit être optimisée pour le référencement naturel (SEO). Chaque page possède notamment : un titre optimisé ; une description ; des balises adaptées ; une URL lisible.

L'objectif est que les entreprises puissent être trouvées depuis les moteurs de recherche sans passer obligatoirement par MEEREO.

### 16. Rôle de KAI

KAI accompagne le professionnel dans l'amélioration de sa page. Elle peut suggérer :

- d'ajouter des réalisations ;
- de compléter la présentation ;
- d'améliorer certaines descriptions ;
- d'importer davantage de photos ;
- de mettre en avant certaines compétences.

KAI n'effectue jamais ces modifications automatiquement. Toutes les propositions doivent être validées par le professionnel.

### 17. Règles métier

Les règles suivantes sont obligatoires :

- une entreprise ne possède qu'une seule page publique ;
- la page est créée automatiquement après la validation du compte ;
- seule l'entreprise peut modifier son contenu ;
- les informations juridiques restent privées ;
- les avis ne peuvent provenir que de clients ayant collaboré sur MEEREO ;
- les statistiques affichées sont calculées automatiquement ;
- toutes les modifications importantes sont historisées.

### Conclusion

La Page Professionnelle Publique constitue la carte de visite numérique officielle de chaque entreprise.

Elle ne doit pas être pensée comme un simple profil, mais comme un véritable outil de développement commercial, de mise en relation et de création de confiance.

Elle joue un rôle central dans les recommandations de KAI, dans les résultats de recherche, dans les appels d'offres et dans la décision finale du client.

---

## PRD · TOME 3 – PARTIE 3 — LE COCKPIT PROFESSIONNEL

### 18. Vision

Le Cockpit Professionnel constitue le centre de pilotage de chaque entreprise inscrite sur MEEREO.

Il ne s'agit pas d'un simple tableau de bord. Il représente l'environnement de travail principal de l'entreprise. Toutes les activités de l'entreprise passent par ce Cockpit.

Le professionnel ne doit jamais avoir besoin de quitter cet espace pour retrouver une information concernant son activité sur MEEREO.

Le Cockpit est conçu comme un véritable ERP collaboratif spécialisé dans le secteur du BTP.

### 19. Philosophie

Le Cockpit doit permettre au professionnel de répondre instantanément à plusieurs questions essentielles :

- Combien de projets sont actuellement en cours ?
- Quels sont les projets nécessitant une action aujourd'hui ?
- Quels nouveaux appels d'offres sont disponibles ?
- Quels messages sont en attente ?
- Quels clients attendent une réponse ?
- Quels documents doivent être validés ?
- Quels partenaires ont envoyé une demande ?
- Quels achats doivent être réalisés ?
- Quelles missions sont en retard ?
- Quelles recommandations KAI ont été générées ?

Toutes ces informations doivent être visibles dès l'ouverture du Cockpit.

### 20. Structure générale

Le Cockpit est composé de plusieurs modules indépendants. Chaque module possède son propre écran, mais tous communiquent entre eux.

Les modules de la Version 1 sont :

- Tableau de bord
- Mes Projets
- Mes Missions
- Appels d'offres
- CRM
- Messagerie
- Marketplace
- Documents
- Agenda
- Notifications
- KAI
- Paramètres

### 21. Tableau de bord

Le tableau de bord constitue la page d'accueil. Il présente un résumé dynamique de toute l'activité.

Le professionnel retrouve immédiatement : nombre de projets actifs ; nombre de missions ; nombre de clients ; nombre de partenaires ; nombre de demandes en attente ; nombre d'appels d'offres disponibles ; messages non lus ; documents à valider ; alertes ; recommandations KAI.

Les indicateurs sont mis à jour en temps réel.

### 22. Module « Mes Projets »

Cette section regroupe tous les projets auxquels participe l'entreprise.

Chaque carte Projet affiche : nom du projet ; client ; ville ; statut ; mission principale ; pourcentage d'avancement ; nombre d'intervenants ; dernière activité.

Chaque projet peut être filtré : en cours ; terminés ; en attente ; archivés ; favoris.

Un clic ouvre immédiatement le Cockpit Projet.

### 23. Module « Mes Missions »

Ce module est spécifique à MEEREO. Une entreprise ne travaille jamais directement sur un projet. Elle réalise une ou plusieurs missions au sein d'un projet.

Chaque mission possède : nom ; projet associé ; responsable ; état ; priorité ; échéance ; livrables ; documents ; historique.

Le professionnel visualise immédiatement les missions : à démarrer ; en cours ; en attente ; en validation ; terminées.

### 24. Module « Appels d'offres »

Le professionnel retrouve ici tous les appels d'offres correspondant à sa catégorie. Exemple : un Bureau d'architecture ne verra jamais un appel d'offres réservé à une entreprise de construction.

Chaque appel d'offres affiche : type ; client ; localisation ; date limite ; budget (si visible) ; description ; documents.

Le professionnel peut : répondre ; poser une question ; ajouter aux favoris ; partager en interne ; archiver.

### 25. Module « CRM »

Le CRM est généré automatiquement. Le professionnel n'a jamais besoin de créer une fiche client.

Chaque collaboration crée automatiquement : une fiche Client ; une fiche Projet ; une fiche Professionnel ; une fiche Fournisseur.

Chaque fiche conserve : historique ; documents ; messages ; projets ; notes internes ; activités ; opportunités futures.

Le CRM constitue la mémoire commerciale de l'entreprise.

### 26. Module « Messagerie »

Toutes les conversations sont organisées. Deux niveaux existent : Messagerie Projet ; Messagerie Directe.

Une conversation Projet est automatiquement créée lorsqu'une mission est attribuée. Toutes les discussions concernant cette mission doivent rester dans cet espace.

Aucun échange ne doit être perdu. Les pièces jointes restent associées à la conversation.

### 27. Module « Documents »

Tous les documents sont classés automatiquement. Chaque document appartient : à un projet, à une mission, ou à l'entreprise.

Le système crée automatiquement les catégories. Exemples : plans ; contrats ; photos ; rapports ; factures ; PV ; livrables.

Le professionnel peut rechercher n'importe quel document grâce au moteur de recherche.

### 28. Module « Marketplace »

Le professionnel peut acheter directement : matériaux ; mobilier ; équipements ; solutions Green.

Chaque achat peut être affecté : à une mission, ou au projet complet. Les commandes restent historisées.

### 29. Module « Agenda »

Toutes les échéances sont centralisées : réunions ; visites chantier ; dates limites ; livraisons ; réceptions ; validation des livrables.

Les événements peuvent être synchronisés avec un calendrier externe dans une version future.

### 30. Module « Notifications »

Toutes les notifications sont enregistrées. Exemples : invitation à une mission ; réponse à un appel d'offres ; message ; ajout d'un document ; validation ; nouvelle recommandation KAI.

Une notification n'est jamais supprimée. Elle passe simplement à l'état : non lue ; lue ; archivée.

### 31. Module « KAI »

KAI devient le véritable assistant du professionnel.

Chaque matin, elle analyse : les projets ; les missions ; les retards ; les appels d'offres ; les clients ; les documents.

Puis elle propose : les priorités du jour ; les actions urgentes ; les missions bloquées ; les documents manquants ; les partenaires recommandés ; les matériaux adaptés ; les risques potentiels.

KAI ne réalise jamais une action sans validation humaine. Elle conseille. Elle accompagne. Elle alerte.

### 32. Module « Paramètres »

L'entreprise peut gérer : son profil ; son logo ; sa page publique ; ses collaborateurs (dans une version future) ; ses notifications ; ses préférences ; sa sécurité ; ses connexions ; ses intégrations futures.

### 33. Règles métier

Le Cockpit Professionnel constitue le point d'entrée unique de toutes les activités de l'entreprise.

- Aucune donnée ne doit être dupliquée entre plusieurs modules.
- Chaque information doit posséder une seule source de vérité.
- Lorsqu'un projet est modifié, tous les modules concernés sont automatiquement mis à jour.
- Les statistiques sont calculées en temps réel.
- Toutes les actions importantes sont historisées.
- Toutes les automatisations sont traçables.
- Le Cockpit doit rester fluide, même avec plusieurs centaines de projets actifs.

### Conclusion

Le Cockpit Professionnel est bien plus qu'un tableau de bord. Il est le poste de commandement numérique de l'entreprise.

Il centralise l'ensemble de son activité, lui permet de collaborer efficacement avec les autres acteurs, de piloter ses missions et d'être accompagné en permanence par KAI.

Le Cockpit Professionnel constitue l'un des piliers de MEEREO et devra évoluer progressivement jusqu'à devenir un véritable ERP spécialisé dans les métiers de la construction.

---

## PRD · EXTENSION — RÉFÉRENTIEL DOCUMENTAIRE DES ENTREPRISES ET AUTOMATISATION DES APPELS D'OFFRES

### Principe fondamental

Chaque entreprise inscrite sur MEEREO possède un Référentiel Documentaire Entreprise. Ce référentiel est créé automatiquement lors de la création du profil professionnel.

Il regroupe l'ensemble des documents administratifs, juridiques, commerciaux et techniques de l'entreprise. Ces documents sont centralisés dans une bibliothèque unique afin d'éviter leur téléversement répétitif lors des différents appels d'offres et projets.

Le Référentiel Documentaire constitue la source officielle des documents de l'entreprise dans tout l'écosystème MEEREO.

### Documents du Référentiel Entreprise

Le référentiel peut notamment contenir :

**Documents administratifs :** RCCM ; numéro de contribuable ; attestation fiscale ; documents d'identification de l'entreprise ; agréments ; assurances ; attestations diverses.

**Documents commerciaux :** présentation de l'entreprise ; plaquette commerciale ; catalogue de services ; brochures.

**Documents techniques :** références techniques ; portfolio ; certifications ; qualifications ; références de projets.

**Documents complémentaires :** tout autre document que l'entreprise souhaite rendre disponible pour ses futurs appels d'offres.

Chaque document possède :

- un identifiant unique ;
- une catégorie ;
- une version ;
- une date de dépôt ;
- une date d'expiration (si applicable) ;
- un statut (Actif, En attente de validation, Expiré, Archivé) ;
- un niveau de confidentialité.

### Utilisation lors des appels d'offres

Lorsqu'un professionnel répond à un appel d'offres, MEEREO ne lui demande pas de téléverser une nouvelle fois les documents déjà présents dans son Référentiel Documentaire. La plateforme prépare automatiquement le dossier de candidature.

Celui-ci comprend notamment :

- les informations générales de l'entreprise ;
- le lien vers la Page Professionnelle Publique ;
- les références de projets pertinentes ;
- les documents administratifs requis ;
- les certifications disponibles ;
- les documents commerciaux nécessaires.

Le professionnel peut : accepter le dossier proposé ; retirer certains documents ; ajouter des documents spécifiques à cet appel d'offres.

### Consultation par le client

Lorsqu'un client consulte une réponse à un appel d'offres, il accède à un dossier complet comprenant :

- les informations de l'entreprise ;
- le lien vers la Page Professionnelle Publique ;
- le badge Professionnel vérifié MEEREO ;
- les références et réalisations pertinentes ;
- les documents administratifs autorisés au partage ;
- les certifications ;
- les documents complémentaires transmis pour cet appel d'offres.

Le client dispose ainsi de tous les éléments nécessaires pour évaluer la candidature sans demander plusieurs fois les mêmes pièces.

### Intervention de KAI

KAI possède un accès sécurisé au Référentiel Documentaire des entreprises. Cet accès est strictement limité aux automatisations autorisées par MEEREO.

Lorsqu'un professionnel prépare une réponse à un appel d'offres, KAI peut :

- identifier les documents exigés ;
- sélectionner automatiquement les documents déjà disponibles dans le Référentiel ;
- vérifier leur validité et leur date d'expiration ;
- signaler les documents manquants ou expirés ;
- proposer les références de projets les plus pertinentes ;
- préparer un dossier de réponse complet.

Aucun document n'est envoyé automatiquement au client sans validation du professionnel. Le professionnel conserve toujours le contrôle final sur le contenu transmis.

### Création automatique des dossiers Projet

Lorsqu'un professionnel est retenu et qu'il rejoint un projet, les documents transmis dans sa candidature sont automatiquement rattachés au projet. Ils deviennent accessibles, selon les droits définis, dans le Cockpit Projet.

Aucun nouveau téléversement n'est nécessaire. La plateforme garantit ainsi une continuité documentaire entre la candidature, la sélection du professionnel et l'exécution du projet.

### Règles métier

- Le Référentiel Documentaire Entreprise constitue la source officielle des documents de l'entreprise.
- Un document ne doit être déposé qu'une seule fois, puis réutilisé lorsque cela est pertinent.
- KAI peut consulter les documents afin de préparer des réponses et des automatisations, mais ne peut jamais transmettre un document sans validation explicite du professionnel.
- Toute utilisation d'un document dans un appel d'offres ou un projet est historisée afin d'assurer une traçabilité complète.
- Les documents expirés ou invalides sont automatiquement signalés et exclus des dossiers proposés jusqu'à leur mise à jour.

---

## PRD · EXTENSION — BASE DE CONNAISSANCES INTELLIGENTE (KNOWLEDGE GRAPH) DE MEEREO

### Vision

MEEREO ne considère jamais un document comme un simple fichier.

Chaque document est une source de connaissances. Chaque document enrichit progressivement l'intelligence de la plateforme. Chaque document peut être utilisé par KAI afin d'accompagner les utilisateurs tout au long du cycle de vie d'un projet.

L'objectif n'est pas uniquement de stocker des PDF. L'objectif est de construire la mémoire numérique de chaque entreprise et de chaque projet.

### Principe fondamental

Chaque document déposé sur MEEREO est automatiquement analysé par KAI.

L'analyse ne consiste pas à modifier le document. Elle consiste à comprendre son contenu afin de pouvoir le retrouver, le relier et le réutiliser lorsque cela est pertinent.

Le document reste toujours disponible dans son format d'origine. En parallèle, KAI construit une représentation structurée des informations qu'il contient. Cette représentation enrichit la Base de Connaissances de MEEREO.

### Types de documents concernés

La Base de Connaissances peut être alimentée par : RCCM ; attestations fiscales ; présentations d'entreprise ; références de projets ; plans ; cahiers des charges ; rapports ; comptes rendus ; contrats ; photos ; vidéos ; documents techniques ; devis ; factures ; procès-verbaux ; notices techniques ; catalogues fournisseurs ; certifications.

Tous ces documents deviennent consultables de manière intelligente.

### Analyse automatique par KAI

À chaque dépôt d'un document, KAI réalise plusieurs opérations. Elle identifie :

- le type de document ;
- son auteur ;
- son entreprise ;
- le projet concerné ;
- la mission concernée ;
- la date ;
- les informations importantes ;
- les mots-clés ;
- les versions précédentes.

Elle crée ensuite des liens avec les autres éléments de la plateforme.

### Exemple

Une entreprise dépose son RCCM. KAI comprend automatiquement :

- qu'il s'agit d'un document administratif ;
- qu'il appartient à cette entreprise ;
- qu'il est valable jusqu'à une certaine date si cette information existe ;
- qu'il peut être utilisé pour répondre aux futurs appels d'offres.

Quelques mois plus tard, cette entreprise répond à un appel d'offres. KAI sait déjà que le RCCM est disponible. Elle le propose automatiquement. L'utilisateur n'a plus besoin de le rechercher.

### Deuxième exemple

Une entreprise dépose un dossier présentant un immeuble R+12 réalisé à Abidjan. KAI comprend notamment :

- le type de bâtiment ;
- la localisation ;
- la surface si elle est indiquée ;
- la mission réalisée ;
- les compétences mises en œuvre.

Plus tard, lorsqu'un client publie un appel d'offres similaire, KAI pourra suggérer cette référence dans le dossier de candidature.

### Base de connaissances de l'entreprise

Chaque entreprise possède une base de connaissances privée. Cette base regroupe :

- ses documents ;
- ses réalisations ;
- ses certifications ;
- ses compétences ;
- ses réponses aux appels d'offres ;
- ses missions terminées ;
- ses retours d'expérience.

Cette base devient de plus en plus riche au fil du temps.

### Base de connaissances du projet

Chaque projet possède également sa propre mémoire. Elle regroupe :

- les décisions ;
- les validations ;
- les échanges ;
- les documents ;
- les livrables ;
- les photos ;
- les comptes rendus ;
- les achats ;
- les modifications ;
- les événements importants.

À la fin du projet, cette mémoire constitue un véritable dossier numérique complet.

### Intervention de KAI

Grâce à cette base de connaissances, KAI peut :

- retrouver instantanément un document ;
- préparer une réponse à un appel d'offres ;
- suggérer des références pertinentes ;
- détecter des documents manquants ;
- alerter lorsqu'un document est expiré ;
- proposer les prochains livrables ;
- retrouver les expériences similaires réalisées par l'entreprise ;
- répondre à des questions sur un projet en s'appuyant sur les documents disponibles.

KAI ne se contente plus de rechercher des fichiers. Elle comprend les informations qu'ils contiennent et les utilise pour assister les utilisateurs.

### Recherche intelligente

Le moteur de recherche de MEEREO ne fonctionne pas uniquement par nom de fichier. Un utilisateur peut effectuer des recherches en langage naturel. Exemples :

- « Montre-moi les projets où nous avons réalisé un immeuble de bureaux. »
- « Retrouve notre dernière attestation fiscale. »
- « Quels projets comportaient une façade ventilée ? »
- « Montre les références où notre entreprise était bureau d'études structure. »

La plateforme répond en s'appuyant sur la Base de Connaissances construite par KAI.

### Évolution continue

La Base de Connaissances s'enrichit automatiquement à chaque : nouveau document ; nouveau projet ; nouvelle mission ; nouveau livrable ; nouveau compte rendu ; nouvelle photo ; nouvelle réponse à un appel d'offres.

Plus l'entreprise travaille sur MEEREO, plus son patrimoine documentaire devient intelligent.

### Principe fondamental

MEEREO n'est pas un espace de stockage. MEEREO est une plateforme qui transforme les documents en connaissances exploitables.

Chaque document déposé augmente la valeur de la plateforme pour l'entreprise, pour le projet et pour KAI.

Cette Base de Connaissances constitue l'un des fondements de l'intelligence artificielle de MEEREO et devra être conçue dès l'origine comme un composant central de l'architecture logicielle.

---

## PRD · EXTENSION — ARCHITECTURE DE KAI : L'INTELLIGENCE OPÉRATIONNELLE DE MEEREO

### Vision

KAI est l'intelligence artificielle native de MEEREO.

Elle n'est pas un chatbot. Elle n'est pas un assistant isolé. Elle constitue la couche d'intelligence de toute la plateforme.

Chaque fonctionnalité développée dans MEEREO doit pouvoir être assistée par KAI. L'objectif est que chaque utilisateur bénéficie d'une assistance intelligente, proactive, contextuelle et sécurisée.

KAI accompagne les utilisateurs. Elle ne prend jamais les décisions à leur place.

### Principe fondamental

KAI agit comme un collaborateur numérique. Elle observe. Elle comprend. Elle analyse. Elle anticipe. Elle recommande.

Elle automatise uniquement ce qui a été explicitement autorisé par l'utilisateur ou par les règles métier de la plateforme. Elle ne remplace jamais l'expertise humaine.

### Les quatre rôles de KAI

**1. Assistant.** KAI répond aux questions des utilisateurs. Elle explique les fonctionnalités. Elle accompagne la prise en main. Elle aide à retrouver une information. Elle recherche dans : les projets ; les missions ; les documents ; les CRM ; les appels d'offres ; les fournisseurs ; les connaissances autorisées.

**2. Coordinateur.** KAI surveille l'avancement des projets. Elle détecte : les retards ; les missions incomplètes ; les documents manquants ; les validations oubliées ; les incohérences. Elle propose les prochaines étapes. Elle rappelle les échéances. Elle aide les coordinateurs techniques à organiser le projet.

**3. Automatisation.** KAI prépare automatiquement les tâches répétitives. Exemples : préparer une réponse à un appel d'offres ; préparer une liste de documents ; pré-remplir un dossier ; classer automatiquement un document ; associer un document à une mission ; préparer un compte rendu de réunion ; proposer un planning ; créer une liste de contrôle. Aucune automatisation critique n'est exécutée sans validation humaine.

**4. Intelligence décisionnelle.** KAI analyse les données disponibles afin de produire des recommandations. Par exemple : quels professionnels correspondent le mieux à ce projet ? quel fournisseur est le plus pertinent ? quels documents sont encore manquants ? quelle mission devrait commencer ensuite ? quels risques sont détectés ? KAI formule des recommandations argumentées. Elle ne décide jamais.

### KAI est présente partout

KAI est disponible dans tous les modules de MEEREO : Cockpit Projet ; Cockpit Professionnel ; Cockpit Client ; Marketplace ; CRM ; Messagerie ; Documents ; Appels d'offres ; Recherche ; Profil public ; Agenda.

Elle adapte automatiquement son comportement au contexte.

### Compréhension du contexte

Avant de répondre, KAI identifie :

- Qui pose la question ?
- Quel est son rôle ?
- Quel projet est actuellement ouvert ?
- Quelle mission est concernée ?
- Quels documents sont accessibles ?
- Quels droits possède l'utilisateur ?

Elle ne consulte jamais des informations auxquelles l'utilisateur n'a pas accès.

### Gestion des connaissances

KAI construit une mémoire structurée à partir : des entreprises, des projets, des missions, des documents, des appels d'offres, des fournisseurs, des réalisations, des échanges.

Chaque nouvelle information enrichit cette mémoire. Cette mémoire est organisée en graphes de connaissances afin de relier les données entre elles.

### Exemple : préparation d'un appel d'offres

Un bureau d'architecture souhaite répondre à un appel d'offres. KAI analyse automatiquement : les exigences du client, les documents demandés, les références de l'entreprise, les certifications, les projets similaires, les documents administratifs.

Elle prépare un dossier de candidature complet. Le professionnel vérifie ce dossier. Il décide ensuite de l'envoyer ou de le modifier.

### Exemple : intégration d'un intervenant

Le coordinateur technique crée une mission Structure. Avant l'envoi de l'invitation, KAI rappelle :

- qu'un échange avec le client est recommandé ;
- que les compétences du bureau d'études sélectionné correspondent au projet ;
- que certains documents devront être partagés.

Une fois l'invitation acceptée, KAI met automatiquement à jour le Cockpit Projet, les CRM, les droits d'accès et les notifications conformément aux règles métier.

### Exemple : suivi de chantier

Chaque jalon terminé est analysé. KAI peut : mettre à jour le pourcentage d'avancement ; préparer les prochaines étapes ; suggérer les prochains achats ; identifier les livrables attendus ; détecter un retard ; alerter les acteurs concernés.

### Gouvernance

Toutes les recommandations produites par KAI doivent être explicables. L'utilisateur doit comprendre :

- pourquoi cette recommandation est proposée ;
- quelles données ont été utilisées ;
- quelles conséquences peut avoir son acceptation.

Les recommandations ne doivent jamais être opaques.

### Journalisation

Toutes les actions réalisées par KAI sont historisées. Le système conserve : la date, le contexte, la recommandation, la décision prise par l'utilisateur, le résultat.

Cette traçabilité permet d'améliorer progressivement la qualité des recommandations.

### Architecture logicielle

KAI doit être développée comme un service transversal. Aucun module ne doit implémenter sa propre intelligence artificielle. Tous les modules utilisent le même moteur KAI.

Cela garantit : la cohérence des réponses, la mutualisation des connaissances, la réutilisation des apprentissages, une évolution centralisée.

### Principe fondamental

KAI n'est pas un chatbot ajouté à MEEREO. KAI est l'intelligence opérationnelle de la plateforme.

Chaque donnée produite par MEEREO peut être comprise, reliée, analysée et exploitée par KAI afin d'accompagner les utilisateurs dans leurs décisions, tout en respectant leurs droits d'accès et les règles métier de la plateforme.

---

## PRD · EXTENSION — EVENT ENGINE (MOTEUR D'ÉVÉNEMENTS)

### Vision

MEEREO est une plateforme pilotée par les événements métier.

Chaque action réalisée par un utilisateur ou par le système génère un ou plusieurs événements. Ces événements sont enregistrés, historisés et peuvent déclencher des automatisations.

Aucun module de la plateforme ne doit fonctionner de manière isolée. Tous les modules communiquent grâce au moteur d'événements. Cette architecture garantit une plateforme évolutive, modulaire et cohérente.

### Principe fondamental

Une action utilisateur ne modifie jamais directement toute la plateforme. Elle génère un événement. Le moteur d'événements distribue ensuite cet événement aux modules concernés. Chaque module décide de l'action qu'il doit exécuter selon les règles métier.

### Exemple 1 — Création d'un projet

Le client crée un projet. Cette action génère l'événement **ProjectCreated**. Le moteur d'événements le diffuse. Les modules réagissent automatiquement :

- **Cockpit Projet** — crée le Cockpit.
- **CRM** — crée le CRM du projet.
- **Historique** — ajoute la première ligne de vie.
- **Notifications** — informe le créateur.
- **KAI** — analyse le contexte du projet.
- **Agenda** — crée les premiers jalons si nécessaire.
- **Journal d'audit** — enregistre l'événement.

Chaque module reste indépendant mais synchronisé.

### Exemple 2 — Acceptation d'une mission

Une entreprise accepte une mission. Événement : **MissionAccepted**. Les modules exécutent automatiquement :

- **Projet** — ajoute l'entreprise aux intervenants.
- **Messagerie** — ouvre les espaces de discussion de la mission.
- **CRM** — crée la relation entre les acteurs.
- **KAI** — analyse les prochaines étapes.
- **Historique** — ajoute l'événement à la chronologie.
- **Notifications** — informe les autres intervenants.

### Exemple 3 — Dépôt d'un document

Événement : **DocumentUploaded**. Le moteur déclenche :

- **Base documentaire** — indexe le document.
- **Knowledge Graph** — extrait les connaissances.
- **KAI** — analyse le contenu.
- **Versioning** — crée une nouvelle version si nécessaire.
- **Projet** — rattache le document à la mission concernée.
- **Historique** — enregistre le dépôt.

### Exemple 4 — Jalon terminé

Le responsable d'une mission valide un jalon. Événement : **MilestoneCompleted**. Le moteur déclenche : calcul de l'avancement ; historique ; notifications ; mise à jour du Cockpit ; analyse KAI ; vérification des livrables ; suggestions de la prochaine étape.

### Journal des événements

Chaque événement possède un identifiant unique. Les informations minimales enregistrées sont :

- identifiant ;
- type d'événement ;
- date et heure ;
- utilisateur ou service à l'origine ;
- projet concerné ;
- mission concernée (si applicable) ;
- acteur concerné ;
- données associées ;
- résultat des traitements.

Ce journal constitue la mémoire technique de la plateforme.

### Classification des événements

Les événements sont regroupés par domaine.

- **Projets** — ProjectCreated ; ProjectUpdated ; ProjectArchived ; ProjectClosed
- **Missions** — MissionCreated ; MissionAssigned ; MissionAccepted ; MissionRejected ; MissionCompleted ; MissionValidated ; MissionReopened
- **Documents** — DocumentUploaded ; DocumentUpdated ; DocumentShared ; DocumentValidated ; DocumentArchived
- **Appels d'offres** — TenderCreated ; TenderPublished ; TenderAnswered ; TenderAccepted ; TenderRejected
- **Marketplace** — OrderCreated ; OrderConfirmed ; OrderDelivered ; OrderCancelled
- **CRM** — ClientCreated ; ProfessionalLinked ; SupplierLinked ; MeetingCreated
- **Utilisateurs** — UserRegistered ; ProfessionalVerified ; InvitationSent ; InvitationAccepted ; InvitationDeclined
- **KAI** — RecommendationGenerated ; RiskDetected ; ReminderGenerated ; KnowledgeUpdated ; AutomationPrepared

### Automatisations

Les automatisations ne sont jamais codées directement dans les écrans. Elles sont déclenchées par les événements.

Ainsi, lorsqu'un nouvel événement est créé, de nouvelles fonctionnalités pourront être ajoutées sans modifier les modules existants. Cette approche garantit une architecture évolutive.

### Rôle de KAI

KAI écoute les événements autorisés. Elle peut : analyser ; recommander ; préparer des actions ; détecter des incohérences ; générer des alertes.

Elle ne réalise jamais une action métier irréversible sans validation humaine.

### Sécurité

Chaque événement est associé aux droits d'accès de son auteur. Un utilisateur ne peut recevoir ou exploiter que les événements correspondant aux permissions qui lui sont accordées.

Les événements sensibles sont protégés par les mêmes règles que les données auxquelles ils se rapportent.

### Audit

Le journal des événements constitue la base de l'audit de MEEREO. Il permet :

- de reconstituer l'historique complet d'un projet ;
- d'expliquer une décision ;
- de vérifier une automatisation ;
- d'analyser un incident ;
- d'améliorer les processus.

### Principe fondamental

Dans MEEREO, les modules ne communiquent jamais directement entre eux. Ils communiquent exclusivement par des événements métier.

Cette architecture garantit la cohérence de la plateforme, facilite son évolution et permet à KAI d'accompagner les utilisateurs de manière contextuelle et proactive.

---

## PRD · EXTENSION — LE JUMEAU NUMÉRIQUE DU PROJET (PROJECT DIGITAL TWIN)

### Vision

Chaque projet créé dans MEEREO possède automatiquement un Jumeau Numérique.

Le Jumeau Numérique est la représentation vivante du projet. Il ne s'agit pas uniquement d'une fiche projet. Il représente l'état réel du projet à un instant donné.

Chaque modification réalisée par un intervenant met immédiatement à jour ce Jumeau Numérique. Le Cockpit Projet devient ainsi la visualisation du Jumeau Numérique.

### Principe fondamental

Le Jumeau Numérique est alimenté en permanence par :

- les missions ;
- les jalons ;
- les tâches ;
- les documents ;
- les validations ;
- les messages ;
- les commandes Marketplace ;
- les comptes rendus ;
- les photos ;
- les vidéos ;
- les décisions ;
- les recommandations validées de KAI.

Le Jumeau Numérique ne remplace jamais les données. Il constitue leur représentation consolidée.

### Les composants du Jumeau Numérique

Chaque projet possède automatiquement les composants suivants.

**1. Identité du projet.** Le Jumeau Numérique conserve : le nom du projet ; le client ; le coordinateur technique ; la localisation ; le type de projet ; les objectifs ; le budget prévisionnel (si communiqué) ; les dates importantes.

**2. Cartographie des intervenants.** Le Jumeau Numérique connaît en permanence : qui participe au projet ; depuis quand ; pourquoi ; sur quelle mission ; avec quels droits. Toutes ces informations sont mises à jour automatiquement.

**3. Cartographie des missions.** Chaque mission apparaît sous forme d'un bloc. Chaque bloc affiche : responsable ; état ; pourcentage d'avancement ; prochain jalon ; documents ; livrables ; alertes. Le coordinateur technique obtient immédiatement une vue globale.

**4. Chronologie.** Le Jumeau Numérique conserve toute la vie du projet. Par exemple : projet créé ; architecte intégré ; mission Architecture commencée ; plans déposés ; validation client ; mission Structure créée ; mission Construction commencée ; fondations terminées ; réception provisoire ; réception définitive. Cette chronologie n'est jamais supprimée.

**5. Documents.** Le Jumeau Numérique référence tous les documents. Il ne les duplique jamais. Chaque document reste stocké dans son emplacement d'origine. Le Jumeau conserve uniquement les liens intelligents vers ces documents.

**6. Avancement.** L'avancement global du projet est calculé automatiquement. Il dépend : des missions, des jalons, des validations, des livrables. Aucun utilisateur ne saisit manuellement un pourcentage. Le système le calcule.

### Vue dynamique

Le Jumeau Numérique n'est jamais statique. Chaque événement met immédiatement à jour son état.

Exemple. Une entreprise termine le jalon « Fondations ». L'Event Engine déclenche : MilestoneCompleted. Le Rules Engine applique les règles métier. Le Jumeau Numérique met à jour : le pourcentage, la chronologie, les indicateurs, les alertes, les prochaines étapes. Le Cockpit Projet affiche immédiatement ces changements.

### Utilisation par KAI

KAI ne consulte jamais directement des dizaines de tables. Elle interroge d'abord le Jumeau Numérique.

Celui-ci lui fournit immédiatement : l'état réel du projet, les missions, les documents, les retards, les validations, les intervenants, les risques.

Cela réduit le temps d'analyse et garantit que toutes les recommandations reposent sur une vision cohérente du projet.

### Recherche intelligente

Le Jumeau Numérique permet de répondre à des questions comme :

- « Où en est réellement ce projet ? »
- « Quelle est la prochaine étape ? »
- « Quelles missions sont bloquées ? »
- « Qui attend une validation ? »
- « Quels documents manquent encore ? »
- « Quel est le prochain jalon ? »

Toutes ces réponses sont calculées automatiquement.

### Archivage

À la fin d'un projet, le Jumeau Numérique est figé. Il devient la mémoire officielle du projet. Il reste consultable pendant toute la durée de conservation définie par la politique de MEEREO.

Il peut être réutilisé comme référence pour de futurs projets, sous réserve des droits d'accès.

### Versionnement

Le Jumeau Numérique évolue au fil du projet. Chaque évolution importante crée une nouvelle version logique. Il est ainsi possible de reconstituer l'état exact du projet à une date donnée.

Cette fonctionnalité est particulièrement utile en cas d'audit, de litige ou de retour d'expérience.

### Interaction avec le Marketplace

Le Jumeau Numérique est également relié aux achats. Chaque commande validée peut être associée à : une mission ; un jalon ; un livrable.

Le projet conserve ainsi la traçabilité complète des ressources utilisées.

### Interaction avec les CRM

Le Jumeau Numérique met automatiquement à jour : les relations clients, les relations professionnelles, les fournisseurs, les historiques de collaboration.

Chaque nouveau projet enrichit progressivement le réseau relationnel de MEEREO.

### Principe fondamental

Le Cockpit Projet n'est pas une simple interface utilisateur. Il est la représentation graphique du Jumeau Numérique du projet.

Toutes les informations affichées proviennent de ce Jumeau Numérique. Celui-ci devient la source unique de vérité concernant l'état d'un projet. Aucune information affichée dans le Cockpit ne doit contourner ce principe.

---

## PRD · EXTENSION — WORKFLOW ENGINE : LE MOTEUR DE PILOTAGE DES PROJETS

### Vision

Le Workflow Engine est le moteur qui pilote le cycle de vie de chaque projet.

Chaque projet suit un parcours organisé. Chaque mission suit un parcours organisé. Chaque jalon suit un parcours organisé. Chaque document suit un parcours organisé.

Le Workflow Engine garantit que les étapes sont réalisées dans le bon ordre, que les validations sont demandées aux bonnes personnes et que les utilisateurs disposent des informations nécessaires au bon moment.

Le Workflow Engine ne remplace pas les décisions humaines. Il structure leur exécution.

### Principe fondamental

Dans MEEREO, rien n'avance de manière arbitraire. Chaque action est rattachée à un état de workflow. Lorsqu'un état évolue, le moteur applique automatiquement les règles métier correspondantes.

### Les niveaux de workflow

Le moteur gère plusieurs niveaux simultanément.

**Workflow Projet** — il décrit l'état global du projet. Exemples : projet créé ; recherche de partenaires ; conception en cours ; études techniques ; préparation des travaux ; exécution ; réception ; clôture ; archivage.

**Workflow Mission** — chaque mission possède son propre cycle. Par exemple : à créer ; responsable recherché ; invitation envoyée ; mission acceptée ; préparation ; en cours ; en attente de validation ; validée ; terminée ; archivée.

**Workflow Jalon** — chaque jalon possède également son état : non commencé ; en cours ; terminé ; en validation ; validé ; réouvert.

**Workflow Document** — chaque document suit un cycle de vie : brouillon ; déposé ; partagé ; en validation ; validé ; obsolète ; archivé.

### Déclencheurs

Le Workflow Engine est piloté par les événements métier. Exemples : ProjectCreated ; MissionAccepted ; MilestoneCompleted ; DocumentValidated ; TenderAccepted.

Chaque événement peut provoquer une transition de workflow si les conditions sont remplies.

### Conditions de transition

Une transition ne peut être exécutée que lorsque les règles métier sont satisfaites.

Exemple : le projet ne peut pas passer à l'état Préparation des travaux tant que les missions obligatoires de conception et d'études ne sont pas terminées et validées.

Le moteur vérifie automatiquement ces prérequis avant toute évolution.

### Validation humaine

Certaines transitions nécessitent une validation.

Exemple : une mission passe à Terminée uniquement lorsque : le professionnel responsable demande la clôture ; le client confirme la clôture.

Le Workflow Engine conserve les deux validations et l'historique associé.

### Intervention de KAI

KAI accompagne le Workflow Engine. Elle ne modifie jamais directement un état. Elle peut :

- expliquer la prochaine étape ;
- rappeler les actions à effectuer ;
- détecter un blocage ;
- recommander les intervenants à intégrer ;
- signaler les documents attendus ;
- suggérer les prochains achats.

Les recommandations restent facultatives.

### Personnalisation future

La Version 1 fournit un workflow standard basé sur les bonnes pratiques de la construction.

Dans les versions futures, MEEREO pourra permettre aux entreprises d'ajouter des étapes complémentaires adaptées à leurs propres méthodes de travail, sans remettre en cause les étapes obligatoires de la plateforme.

### Historique

Chaque changement de workflow est enregistré. Le système conserve :

- l'état précédent ;
- le nouvel état ;
- la date et l'heure ;
- l'utilisateur ou le service ayant déclenché le changement ;
- la justification éventuelle ;
- les validations associées.

Cet historique permet de reconstituer le déroulement complet d'un projet.

### Principe fondamental

Le Workflow Engine est le chef d'orchestre des processus de MEEREO.

Le Cockpit affiche les informations. Le Jumeau Numérique représente l'état du projet. L'Event Engine diffuse les événements. Le Rules Engine applique les règles métier. KAI accompagne les utilisateurs.

Le Workflow Engine garantit que chaque projet progresse de manière cohérente, traçable et conforme aux pratiques professionnelles du secteur de la construction.

---

## PRD · TOME 4 — LE COCKPIT PROJET

**Version :** 1.0

### 1. Vision

Le Cockpit Projet est le cœur opérationnel de MEEREO.

Chaque projet possède un Cockpit unique. Tous les intervenants travaillent dans ce même Cockpit. Il n'existe jamais plusieurs Cockpits pour un même projet. Chaque utilisateur visualise cependant une interface adaptée à son rôle et à ses droits d'accès.

Le Cockpit représente le Jumeau Numérique du projet. Toutes les informations affichées proviennent des données du projet en temps réel.

### 2. Objectifs

Le Cockpit Projet poursuit plusieurs objectifs :

- centraliser toutes les informations du projet ;
- coordonner les intervenants ;
- suivre les missions ;
- piloter les jalons ;
- centraliser les documents ;
- suivre les validations ;
- historiser toutes les actions ;
- assister les utilisateurs grâce à KAI.

Le Cockpit devient la référence unique du projet. Aucune information ne doit exister uniquement dans un échange privé si elle est nécessaire au bon déroulement du projet.

### 3. Les acteurs dans le Cockpit

Le Cockpit est partagé entre plusieurs catégories d'utilisateurs.

**Le Client.** Le client est propriétaire du projet. Il peut :

- consulter l'avancement global ;
- consulter les missions ;
- valider les livrables qui le concernent ;
- communiquer avec les intervenants ;
- consulter les documents auxquels il a accès ;
- suivre les achats liés au projet ;
- accepter ou refuser certaines décisions nécessitant son accord.

Le client ne coordonne pas techniquement le projet.

**Le Coordinateur Technique.** Le coordinateur technique est l'entreprise responsable de la première mission active. Dans la Version 1, il s'agit généralement du bureau d'architecture. Il est chargé de :

- créer les nouvelles missions ;
- intégrer les nouveaux professionnels ;
- coordonner les échanges ;
- suivre les jalons ;
- contrôler la cohérence générale du projet.

Il dispose d'une vue globale du Cockpit.

**Les Professionnels.** Chaque professionnel accède uniquement :

- aux missions auxquelles il participe ;
- aux documents qui lui sont partagés ;
- aux discussions qui le concernent ;
- aux validations relevant de son intervention.

Les autres informations restent masquées si elles ne sont pas nécessaires.

### 4. Tableau de bord du projet

À l'ouverture d'un projet, le Cockpit affiche immédiatement :

- le nom du projet ;
- son statut ;
- son pourcentage d'avancement calculé automatiquement ;
- le coordinateur technique ;
- le client ;
- les missions actives ;
- les jalons en cours ;
- les prochaines échéances ;
- les alertes KAI ;
- les dernières activités.

Ces informations sont mises à jour en temps réel.

### 5. Chronologie du projet

Le Cockpit comprend une chronologie complète. Cette chronologie représente la mémoire officielle du projet. Elle enregistre automatiquement chaque événement significatif.

Exemples : création du projet ; acceptation d'une mission ; dépôt d'un document ; validation d'un livrable ; création d'un appel d'offres ; intégration d'un intervenant ; fin d'un jalon ; clôture d'une mission.

Aucun événement important ne peut être supprimé.

### 6. Les missions

Le Cockpit affiche toutes les missions du projet. Chaque mission présente :

- son responsable ;
- son statut ;
- son niveau d'avancement ;
- les jalons ;
- les tâches ;
- les livrables ;
- les documents ;
- les validations ;
- les commentaires.

Le coordinateur technique peut ouvrir chaque mission afin d'en consulter les détails.

### 7. Les jalons

Chaque mission est organisée autour de jalons. Les jalons représentent les grandes étapes de réalisation.

Lorsqu'un jalon est terminé :

- le responsable demande sa validation ;
- le client ou le professionnel concerné valide selon les règles métier ;
- le Workflow Engine met à jour l'état de la mission ;
- le Jumeau Numérique est actualisé ;
- KAI analyse les impacts sur la suite du projet.

Les tâches restent rattachées au jalon correspondant.

### 8. Documents du projet

Le Cockpit centralise tous les documents. Chaque document est automatiquement relié :

- au projet ;
- à une mission ;
- à un jalon si nécessaire ;
- à son auteur ;
- à son historique de versions.

Le système interdit les doublons documentaires lorsqu'une référence officielle existe déjà.

Chaque document possède un statut : brouillon ; partagé ; en validation ; validé ; archivé.

### 9. Collaboration

Le Cockpit favorise les échanges entre les acteurs. Chaque mission possède :

- une messagerie dédiée ;
- un espace de commentaires ;
- un journal des décisions.

Les décisions importantes peuvent être marquées comme « Décision Projet ». Ces décisions deviennent des références consultables par tous les intervenants autorisés.

### 10. KAI dans le Cockpit

KAI analyse en permanence le contexte actif du projet. Elle peut notamment :

- détecter une mission manquante ;
- signaler un document absent ;
- rappeler une validation en attente ;
- recommander l'intégration d'un nouveau professionnel ;
- suggérer des fournisseurs adaptés ;
- rappeler les prochaines obligations administratives ;
- détecter des incohérences dans le déroulement du projet.

Toutes les recommandations sont contextualisées et expliquées. Aucune action n'est exécutée automatiquement lorsqu'elle modifie l'organisation du projet sans validation des utilisateurs concernés.

### 11. Principe fondamental

Le Cockpit Projet est l'unique espace de pilotage d'un projet. Toutes les fonctionnalités de MEEREO convergent vers lui.

Le CRM, le Marketplace, les Appels d'offres, les Documents, les Missions, KAI, le Workflow Engine, le Rules Engine, le Jumeau Numérique et l'Event Engine doivent fonctionner de manière coordonnée afin que le Cockpit reflète à tout instant l'état réel du projet.

Le Cockpit Projet constitue la source opérationnelle unique de référence pour tous les acteurs autorisés.

---

## PRD · TOME 5 — LE MOTEUR DES PERMISSIONS

### Vision

La sécurité de MEEREO ne repose pas uniquement sur des profils utilisateurs. Elle repose sur le contexte métier. Chaque permission est calculée dynamiquement.

Le système analyse :

- Qui est l'utilisateur ?
- Dans quel projet travaille-t-il ?
- Quelle mission consulte-t-il ?
- Quel est l'état actuel du projet ?
- Quel est l'état actuel de la mission ?
- Quelle action souhaite-t-il effectuer ?

La décision est ensuite calculée automatiquement.

### Les trois niveaux de permission

Chaque autorisation est déterminée par trois niveaux.

**Niveau 1 — Le rôle.** Exemple : Client ; Bureau d'architecture ; Entreprise de construction ; Bureau d'études structure ; Bureau d'études fluides ; Architecte d'intérieur ; Fournisseur.

**Niveau 2 — La mission.** Une entreprise de construction n'obtient pas automatiquement tous les droits du projet. Elle reçoit les droits correspondant à sa mission. Elle peut éventuellement recevoir des droits complémentaires accordés par le coordinateur technique.

**Niveau 3 — Le Workflow.** Une même personne peut perdre ou gagner certains droits selon l'état du projet.

Exemple. Lorsque la mission est terminée : les documents deviennent consultables mais plus modifiables ; les validations deviennent verrouillées ; les livrables sont figés.

### Exemple concret

Entreprise Construction. Mission : Construction. État : En cours.

**Permissions :** créer des tâches ; modifier les tâches ; ajouter des photos ; déposer des documents ; demander une validation.

**Impossible :** modifier les documents de la mission Architecture ; modifier les missions Structure ; modifier le client ; modifier les informations administratives.

### Exemple 2

Même entreprise. Mission : Construction. État : Terminée.

Les permissions changent automatiquement. **Impossible désormais :** ajouter un nouveau livrable ; supprimer une photo ; modifier les jalons ; modifier les validations.

Les données deviennent historiques.

### Les droits calculés

Le moteur ne stocke pas uniquement des droits. Il calcule. Pour chaque demande :

Utilisateur → Projet → Mission → Workflow → Action → Autorisé ou Refusé

Cette logique garantit une sécurité beaucoup plus fine.

### Permissions par objet

Chaque objet possède sa propre matrice : Projet ; Mission ; Document ; Jalon ; Tâche ; Message ; CRM ; Commande Marketplace ; Appel d'offres.

Chaque objet possède : lecture ; création ; modification ; validation ; archivage ; suppression (très limitée).

### Héritage

Les permissions héritent automatiquement : Projet → Mission → Jalon → Tâche.

Une tâche ne peut jamais donner davantage de droits que sa mission.

### Cas particulier — Le coordinateur technique

Il possède une vision globale. Mais il ne peut pas modifier les livrables techniques validés d'une autre entreprise. Il coordonne. Il ne remplace jamais les autres professionnels.

### Cas particulier — Le client

Le client voit tout ce qui concerne son projet. Mais il ne peut pas modifier les livrables techniques.

Il peut : valider ; commenter ; demander des corrections ; accepter ; refuser. Mais jamais produire les documents techniques à la place du professionnel.

### Permissions temporaires

Le moteur peut accorder des droits temporaires. Exemple : partager un document pendant 48 heures ; autoriser un fournisseur à déposer un document ; inviter un expert externe.

À expiration, les droits disparaissent automatiquement.

### Audit

Chaque refus est historisé. Chaque autorisation exceptionnelle est historisée. Chaque changement de permission est historisé.

Ainsi, il est toujours possible d'expliquer pourquoi une action était autorisée ou interdite.

### Intervention de KAI

KAI connaît les droits de chaque utilisateur. Elle adapte automatiquement ses réponses. Elle ne proposera jamais une action que l'utilisateur n'est pas autorisé à réaliser.

Elle peut également expliquer pourquoi une action est refusée et orienter l'utilisateur vers la personne habilitée.

### Principe fondamental

Dans MEEREO, les permissions sont contextuelles. Elles dépendent simultanément : du rôle, de la mission, du workflow, du projet.

Cette architecture garantit une sécurité métier conforme au fonctionnement réel des opérations de construction et assure que chaque acteur intervient uniquement dans le périmètre qui lui est confié.

---

## PRD · TOME 6 — LE MODULE APPELS D'OFFRES

**Version :** 1.0

### 1. Vision

Le module Appels d'Offres est le moteur de mise en relation entre les besoins d'un projet et les compétences des professionnels présents sur MEEREO.

Il ne s'agit pas d'un simple système de publication d'annonces. Il constitue un processus structuré permettant de sélectionner les partenaires les plus adaptés à chaque mission du projet.

Chaque appel d'offres est directement lié à un projet ou à la création d'un futur projet.

### 2. Objectifs

Le module poursuit plusieurs objectifs :

- permettre à un client ou à un coordinateur technique de rechercher un professionnel ;
- garantir une comparaison transparente des candidatures ;
- automatiser la constitution des dossiers de réponse ;
- réduire les tâches administratives répétitives ;
- conserver un historique complet des consultations.

### 3. Qui peut créer un appel d'offres ?

Dans la Version 1, plusieurs acteurs peuvent créer un appel d'offres.

**Le Client.** Le client crée principalement un appel d'offres pour rechercher un bureau d'architecture lorsqu'il démarre un projet.

**Le Coordinateur Technique.** Une fois le projet lancé, le coordinateur technique peut créer des appels d'offres pour : une entreprise de construction ; un bureau d'études structure ; un bureau d'études fluides ; un architecte d'intérieur.

Chaque appel d'offres est obligatoirement rattaché à une mission existante ou à une mission en préparation.

### 4. Création d'un appel d'offres

L'utilisateur renseigne :

- le titre ;
- la mission concernée ;
- la description du besoin ;
- la localisation ;
- les documents à consulter ;
- les critères souhaités ;
- les délais de réponse ;
- les informations pouvant être rendues publiques.

Le système attribue automatiquement : un identifiant unique ; un statut ; une date de création ; un historique.

### 5. Diffusion

Le Workflow Engine détermine les professionnels éligibles. La diffusion tient compte notamment :

- de la catégorie professionnelle ;
- de la zone géographique si nécessaire ;
- des compétences déclarées ;
- des domaines d'expertise ;
- des préférences de diffusion.

KAI peut également suggérer une liste de professionnels particulièrement adaptés.

### 6. Réponse d'un professionnel

Lorsqu'un professionnel décide de répondre, il ne recommence jamais la constitution complète de son dossier. MEEREO prépare automatiquement une proposition à partir du Référentiel Documentaire de l'entreprise.

La réponse comprend notamment :

- les informations de l'entreprise ;
- le lien vers la Page Professionnelle Publique ;
- le badge Professionnel vérifié MEEREO ;
- les références pertinentes ;
- les documents administratifs requis ;
- les certifications ;
- les documents complémentaires éventuellement demandés.

Le professionnel peut compléter, retirer ou remplacer les éléments proposés avant l'envoi.

### 7. Intervention de KAI

Avant l'envoi, KAI vérifie automatiquement :

- que les documents obligatoires sont présents ;
- que les documents n'ont pas expiré ;
- que les références proposées sont cohérentes avec le besoin ;
- que les certifications correspondent aux exigences exprimées.

KAI peut également suggérer : une meilleure référence de projet ; un document complémentaire ; une amélioration de la présentation.

Aucun élément n'est envoyé sans validation du professionnel.

### 8. Consultation des candidatures

Le créateur de l'appel d'offres consulte toutes les réponses dans une interface de comparaison. Chaque candidature présente :

- les informations générales de l'entreprise ;
- la Page Professionnelle Publique ;
- les références proposées ;
- les documents transmis ;
- les certifications ;
- les commentaires éventuels.

Le système ne classe pas automatiquement les candidats. KAI peut toutefois produire une analyse comparative argumentée, laissant toujours la décision finale à l'utilisateur.

### 9. Sélection

Lorsque le créateur sélectionne un professionnel :

- l'appel d'offres passe à l'état « Attribué » ;
- le Workflow Engine déclenche les événements correspondants ;
- la mission est affectée au professionnel retenu ;
- le Cockpit Projet est mis à jour ;
- les CRM sont enrichis ;
- les notifications sont envoyées.

Les autres candidats sont informés de la clôture de la consultation.

### 10. Historique

Chaque appel d'offres conserve notamment :

- sa version initiale ;
- les modifications apportées ;
- la liste des destinataires ;
- les réponses reçues ;
- les échanges associés ;
- la décision finale ;
- les dates importantes.

Aucun élément n'est supprimé. L'appel d'offres devient une référence consultable dans l'historique du projet.

### 11. Principe fondamental

Le module Appels d'Offres constitue un processus collaboratif reliant le Projet, les Missions, les Professionnels, le Référentiel Documentaire, KAI, le Workflow Engine, le CRM et le Cockpit Projet.

Son objectif n'est pas seulement de sélectionner un prestataire, mais de créer les conditions d'une collaboration durable et entièrement traçable.

---

## PRD · TOME 7 — LE PASSEPORT NUMÉRIQUE DU BÂTIMENT

**Version :** 1.0

### Vision

Le projet ne prend pas fin lorsque les travaux sont terminés. La construction marque le début de la vie du bâtiment.

MEEREO conserve l'ensemble des informations produites pendant le projet afin de créer un Passeport Numérique du Bâtiment. Ce Passeport constitue la mémoire officielle de l'ouvrage. Il accompagne le bâtiment pendant toute sa durée de vie.

### Philosophie

Aujourd'hui, à la livraison d'un bâtiment, une grande partie des informations disparaît progressivement : plans ; photos ; documents techniques ; décisions ; entreprises intervenantes ; matériaux utilisés ; garanties ; historique des travaux.

MEEREO évite cette perte. Toutes ces informations restent organisées dans un espace unique.

### Création automatique

Le Passeport Numérique est créé automatiquement. Aucune action supplémentaire n'est demandée au client.

À la clôture du projet, le Cockpit Projet est transformé en Passeport Numérique. L'historique est conservé. Les données sont figées. Les informations restent consultables.

### Contenu

Le Passeport contient notamment :

**Informations générales** — nom du projet ; adresse ; localisation ; client ; coordinateur technique ; date de livraison ; type de bâtiment ; surface ; description.

**Historique complet** — chronologie intégrale du projet ; toutes les décisions ; toutes les validations ; tous les jalons ; toutes les missions ; toutes les entreprises ; toutes les versions importantes.

**Entreprises intervenantes** — le Passeport conserve la liste des entreprises ayant participé au projet. Pour chacune : nom ; mission ; période d'intervention ; documents associés ; coordonnées. Cela facilite les interventions futures.

**Documents** — le Passeport référence : plans ; DOE ; PV ; notices ; garanties ; photos ; contrats ; rapports ; certificats. Les documents restent accessibles selon les droits définis par le propriétaire.

**Matériaux** — lorsque les matériaux ont été commandés via le Marketplace MEEREO, ils sont automatiquement enregistrés. Le Passeport conserve notamment : fabricant ; référence ; date de pose ; entreprise ayant réalisé la pose ; garantie ; emplacement. Cette traçabilité facilite les futures opérations de maintenance ou de remplacement.

### Historique des modifications

Le Passeport ne s'arrête pas à la livraison. Chaque rénovation ou nouvelle intervention peut être ajoutée. Le bâtiment construit progressivement sa mémoire numérique.

### Recherche

Le propriétaire peut effectuer des recherches telles que :

- « Qui a réalisé la toiture ? »
- « Quelle entreprise a installé les menuiseries ? »
- « Où se trouve la garantie des ascenseurs ? »
- « Quel fournisseur a livré cette référence ? »

KAI répond à partir des données du Passeport.

### Intervention de KAI

KAI accompagne le propriétaire tout au long de la vie du bâtiment. Elle peut notamment :

- retrouver un document ;
- rappeler les garanties arrivant à échéance ;
- retrouver les entreprises intervenantes ;
- recommander une entreprise déjà impliquée dans le bâtiment ;
- préparer un futur projet de rénovation.

### Transmission

Le propriétaire peut décider de transmettre le Passeport Numérique à un nouveau propriétaire lors de la vente du bâtiment.

Les droits d'accès sont transférés selon les règles définies par la plateforme. L'historique reste conservé. La continuité documentaire est assurée.

### Valeur

Le Passeport Numérique augmente la valeur informationnelle du bâtiment. Il constitue un patrimoine numérique aussi important que le bâtiment lui-même.

Il facilite : la maintenance, les extensions, les rénovations, les audits, les expertises, les ventes, les assurances.

### Principe fondamental

MEEREO ne gère pas uniquement la construction. MEEREO accompagne le bâtiment pendant toute sa durée de vie.

Le Passeport Numérique devient la mémoire officielle de l'ouvrage et constitue l'aboutissement naturel du projet, du Cockpit, des Missions, du Jumeau Numérique et de KAI.

---

## PRD · TOME 8 — LE MARKETPLACE INTELLIGENT

**Version :** 1.0

### 1. Vision

Le Marketplace de MEEREO n'est pas un site de commerce électronique classique. Il constitue la plateforme d'approvisionnement officielle des projets.

Son objectif est de connecter les besoins des missions aux fournisseurs qualifiés présents sur MEEREO.

Chaque achat peut être relié à : un projet ; une mission ; un jalon ; une tâche. Ainsi, aucun achat n'est isolé. Chaque produit possède un contexte métier.

### 2. Les acteurs

Trois acteurs interviennent dans le Marketplace.

**Les Fournisseurs.** Ils créent leur catalogue. Ils mettent à jour : les produits ; les caractéristiques techniques ; les disponibilités ; les documents techniques ; les garanties.

**Les Professionnels.** Ils recherchent les produits nécessaires à leurs missions. Ils peuvent : consulter ; comparer ; enregistrer des favoris ; demander un devis ; commander ; proposer un produit au client.

**Le Client.** Le client peut : consulter les produits sélectionnés pour son projet ; valider certains achats lorsque cela est prévu dans le workflow ; suivre les commandes liées à son projet.

### 3. Catalogue Produits

Chaque produit comprend notamment : nom ; catégorie ; sous-catégorie ; fabricant ; fournisseur ; description ; photos ; fiche technique ; certifications ; garantie ; prix ; unité de vente ; disponibilité ; délai de livraison.

Chaque produit possède un identifiant unique.

### 4. Référentiel documentaire produit

Comme les entreprises, chaque produit possède son propre référentiel documentaire. Celui-ci peut contenir :

- fiche technique ;
- notice d'installation ;
- certificat de conformité ;
- garantie ;
- fiche environnementale ;
- manuel d'utilisation ;
- documentation commerciale.

KAI peut consulter ces documents afin d'assister les utilisateurs.

### 5. Liaison avec les missions

Le Marketplace est directement connecté au Workflow Engine. Lorsqu'une mission atteint un jalon nécessitant des matériaux ou des équipements, KAI peut proposer les produits adaptés.

Exemple. Mission : Construction. Jalon : Fondations. KAI peut suggérer : ciment ; acier ; coffrage ; adjuvants ; équipements nécessaires.

Le coordinateur technique ou l'entreprise reste libre de son choix.

### 6. Panier Projet

Contrairement à un panier classique, le panier est associé à un projet. Chaque ligne du panier peut être reliée : à une mission ; à un jalon ; à un livrable.

Le système sait ainsi pourquoi un produit est acheté. Cette information enrichit le Jumeau Numérique et le Passeport Numérique du Bâtiment.

### 7. Intervention de KAI

KAI accompagne les achats. Elle peut notamment :

- proposer des produits compatibles avec la mission ;
- rappeler les matériaux déjà utilisés sur le projet ;
- détecter des incohérences entre un produit et la mission concernée ;
- recommander des alternatives lorsqu'un produit est indisponible ;
- vérifier que les documents techniques nécessaires sont disponibles.

KAI n'impose jamais un fournisseur. Elle formule des recommandations argumentées.

### 8. Commandes

Une commande suit un cycle de vie :

- Brouillon
- Préparée
- En attente de validation
- Confirmée
- En cours de préparation
- Expédiée
- Livrée
- Réceptionnée
- Clôturée

Chaque changement d'état est historisé.

### 9. Réception

À la réception d'une commande, le responsable peut : confirmer la réception ; signaler un problème ; ajouter des photos ; enregistrer des réserves.

Ces informations deviennent des éléments du Passeport Numérique du Bâtiment lorsqu'elles concernent un produit intégré à l'ouvrage.

### 10. Fournisseurs

Chaque fournisseur possède : une Page Fournisseur Publique ; un catalogue ; un Référentiel Documentaire ; un CRM ; un historique des commandes ; un historique des collaborations.

Le fournisseur peut être invité à participer directement à un projet lorsque cela est nécessaire.

### 11. Traçabilité

Tous les achats sont reliés : au projet, à la mission, au fournisseur, au produit, au responsable de la commande, à la date, aux documents associés.

Cette traçabilité permet de retrouver à tout moment l'origine d'un produit utilisé dans un bâtiment.

### 12. Principe fondamental

Le Marketplace n'est pas une boutique indépendante. Il constitue un composant du projet.

Chaque produit acheté enrichit le Projet, le Cockpit, le Jumeau Numérique, le Passeport Numérique du Bâtiment et la Base de Connaissances de MEEREO.

L'objectif est que chaque matériau, équipement ou produit installé dans un bâtiment puisse être retrouvé, documenté et suivi pendant toute la durée de vie de l'ouvrage.

---

## PRD · EXTENSION — ASSET ENGINE (MOTEUR DES ACTIFS DU BÂTIMENT)

### Vision

MEEREO ne s'arrête pas à la livraison d'un projet. Une fois le projet terminé, le bâtiment continue d'exister pendant plusieurs décennies.

L'objectif de MEEREO est de conserver la mémoire technique complète de ce bâtiment afin d'accompagner son exploitation, sa maintenance, ses rénovations et son évolution.

Pour atteindre cet objectif, chaque projet doit progressivement être transformé en un ensemble d'Actifs (Assets). Chaque actif représente un élément physique identifiable du bâtiment.

L'Asset Engine devient ainsi la mémoire technique permanente de l'ouvrage.

### Principe fondamental

Le projet est temporaire. Le bâtiment est permanent.

Pendant la phase de construction, les informations sont organisées autour du projet. À mesure que le chantier progresse, les informations sont également rattachées aux actifs physiques du bâtiment. À la livraison, les actifs deviennent le centre de la mémoire numérique de l'ouvrage.

Le Cockpit Projet évolue alors naturellement vers le Passeport Numérique du Bâtiment.

### Définition d'un actif

Un actif représente un composant réel du bâtiment. Exemples :

- Fondations
- Structure
- Toiture
- Façades
- Menuiseries
- Électricité
- Plomberie
- Climatisation
- Ascenseurs
- Production solaire
- Groupe électrogène
- Réseau incendie
- Espaces verts
- Mobilier fixe
- Équipements techniques

L'architecture doit permettre d'ajouter de nouveaux types d'actifs sans modifier le fonctionnement général de la plateforme.

### Structure d'un actif

Chaque actif possède :

- un identifiant unique ;
- un nom ;
- une catégorie ;
- une localisation dans le bâtiment ;
- un statut ;
- une date de création ;
- une date d'installation ;
- une durée de vie estimée ;
- un historique complet.

Chaque actif est rattaché : à un bâtiment ; à un projet d'origine ; à une ou plusieurs missions ; à un ou plusieurs jalons.

### Informations conservées

Chaque actif centralise automatiquement :

**Les entreprises intervenantes** — entreprise responsable ; mission réalisée ; période d'intervention ; coordonnées ; historique des interventions.

**Les matériaux** — chaque matériau installé est enregistré. Le système conserve notamment : fabricant ; fournisseur ; référence ; quantité ; date d'installation ; garantie ; documentation technique.

**Les documents** — chaque actif référence automatiquement : plans ; DOE ; notices techniques ; certificats ; procès-verbaux ; photos ; vidéos ; rapports ; comptes rendus. Les documents restent stockés dans leur référentiel d'origine mais sont accessibles depuis la fiche de l'actif.

**Les garanties** — chaque actif possède ses garanties. Le système enregistre : date de début ; date d'expiration ; entreprise garante ; conditions de garantie ; documents associés. KAI surveille automatiquement les échéances.

**Les maintenances** — chaque intervention future peut être enregistrée. Le système conserve : date ; entreprise intervenante ; description ; pièces remplacées ; photographies ; rapport d'intervention. Le Passeport Numérique du Bâtiment s'enrichit automatiquement.

### Création automatique des actifs

Les actifs peuvent être créés de plusieurs manières.

**Pendant la conception** — le coordinateur technique peut définir la structure générale du bâtiment.

**Pendant l'exécution** — lorsqu'une mission est terminée, les actifs correspondants sont créés ou mis à jour automatiquement.

**Depuis le Marketplace** — lorsqu'un produit est installé et réceptionné, il peut être associé à un actif existant ou entraîner la création d'un nouvel actif.

### Relations avec les autres modules

Chaque actif est connecté : au Cockpit Projet ; au Jumeau Numérique ; au Passeport Numérique ; au Marketplace ; aux Missions ; aux Jalons ; aux Documents ; aux CRM ; à la Base de Connaissances ; à KAI.

Aucun module ne conserve une copie indépendante des informations. L'Asset Engine constitue la référence commune.

### Recherche intelligente

Grâce aux actifs, les utilisateurs peuvent effectuer des recherches en langage naturel. Exemples :

- « Qui a installé les ascenseurs ? »
- « Affiche les garanties de la toiture. »
- « Quels matériaux ont été utilisés pour la façade ? »
- « Quelle entreprise est intervenue sur la climatisation ? »
- « Affiche toutes les interventions réalisées sur le groupe électrogène. »

KAI répond en s'appuyant directement sur les actifs concernés.

### Intervention de KAI

KAI surveille les actifs pendant toute leur durée de vie. Elle peut notamment :

- rappeler une garantie arrivant à échéance ;
- proposer une maintenance préventive ;
- retrouver instantanément une notice technique ;
- identifier l'entreprise ayant réalisé l'installation ;
- recommander un professionnel ayant déjà travaillé sur cet actif ;
- préparer un futur projet de rénovation.

Toutes les recommandations sont contextualisées et basées sur les données réelles enregistrées dans MEEREO.

### Cycle de vie

Un actif possède son propre cycle de vie :

- Planifié
- En conception
- En réalisation
- Installé
- Réceptionné
- En exploitation
- En maintenance
- Rénové
- Remplacé
- Archivé

Chaque changement d'état est historisé. Aucune information n'est supprimée.

### Principe fondamental

MEEREO ne gère pas uniquement des projets. MEEREO construit progressivement un patrimoine numérique du bâtiment.

Chaque actif devient une source de connaissances, de traçabilité et de valeur pour les propriétaires, les professionnels et les futurs intervenants.

L'Asset Engine constitue le lien entre la phase de construction et la vie opérationnelle du bâtiment. Il garantit que l'ensemble des informations produites pendant le projet reste exploitable pendant toute la durée de vie de l'ouvrage.

---

## PRD · TOME 9 — LE PROJET COMME CŒUR DE L'ÉCOSYSTÈME

### Vision

MEEREO n'est pas un assemblage de modules indépendants. MEEREO est un écosystème dans lequel toutes les fonctionnalités gravitent autour d'un seul objet métier : le Projet.

Le Projet constitue la source principale de contexte. Chaque donnée créée dans la plateforme doit pouvoir être reliée à un projet, directement ou indirectement.

Cette architecture garantit une cohérence fonctionnelle, une traçabilité complète et une exploitation intelligente des données.

### Principe fondamental

Le Projet est le centre de gravité de MEEREO. Tous les modules se connectent au Projet. Aucun module ne devient le centre de la plateforme.

Cette règle est fondamentale et ne devra jamais être remise en cause.

### Architecture générale

Le Projet est relié aux éléments suivants : Client ; Coordinateur technique ; Professionnels ; Fournisseurs ; Missions ; Jalons ; Tâches ; Documents ; Livrables ; Appels d'offres ; CRM ; Marketplace ; Commandes ; Produits ; Actifs ; Jumeau Numérique ; Passeport Numérique ; KAI ; Workflow Engine ; Rules Engine ; Event Engine ; Knowledge Graph ; Digital Asset Graph ; Historique ; Notifications ; Agenda.

Tous ces objets dialoguent à travers le Projet.

### Le Projet comme contexte universel

À chaque fois qu'un utilisateur ouvre un projet, ce projet devient le Contexte Actif de toute la plateforme. Cela signifie que :

- les recherches sont automatiquement contextualisées ;
- les suggestions de KAI concernent ce projet ;
- les documents affichés appartiennent à ce projet ;
- les commandes Marketplace concernent ce projet ;
- les missions visibles sont celles de ce projet ;
- les CRM affichent les relations liées à ce projet.

L'utilisateur n'a plus besoin de préciser constamment le projet concerné.

### Les liens entre les modules

**Documents.** Chaque document appartient à un projet. Il peut également être relié à une mission, un jalon, une tâche ou un actif.

**CRM.** Chaque relation CRM est créée à partir d'un projet. Une collaboration n'existe jamais sans contexte. Le projet devient l'origine de la relation commerciale.

**Marketplace.** Une commande est toujours reliée à un projet. Même lorsqu'elle est préparée à l'avance, elle peut être affectée à un projet dès sa validation.

**Actifs.** Chaque actif est créé dans le cadre d'un projet. Une fois livré, il continue sa vie propre dans le Passeport Numérique tout en conservant son lien avec le projet d'origine.

**KAI.** KAI raisonne toujours dans le contexte du projet actif. Elle ne mélange jamais les informations de plusieurs projets sans autorisation explicite.

### Vue 360°

Le Projet devient une vue à 360°. Depuis une seule interface, un utilisateur autorisé peut accéder à :

- l'équipe projet ;
- les missions ;
- les documents ;
- les livrables ;
- les commandes ;
- les produits ;
- les fournisseurs ;
- les CRM ;
- les actifs ;
- les garanties ;
- les notifications ;
- l'historique ;
- les recommandations de KAI.

Toutes les informations restent cohérentes car elles proviennent du même contexte.

### Gestion des droits

Le fait qu'une donnée soit liée à un projet ne signifie pas qu'elle est visible par tous. Les permissions continuent de s'appliquer selon : le rôle ; la mission ; l'état du workflow ; les règles métier.

Le Projet est un contexte, pas un accès illimité.

### Traçabilité

Chaque action est reliée : à un projet ; à un utilisateur ; à une mission si nécessaire ; à un événement ; à une date ; à une justification.

Cette chaîne de traçabilité permet de reconstituer intégralement l'histoire du projet.

### Principe d'évolution

Toutes les futures fonctionnalités de MEEREO devront répondre à une question simple : *Comment cette fonctionnalité s'intègre-t-elle au Projet ?*

Si une fonctionnalité ne peut pas être reliée au Projet ou au cycle de vie du bâtiment, elle devra être réévaluée avant son intégration dans la plateforme.

Cette règle garantit la cohérence de l'écosystème MEEREO sur le long terme.

### Conclusion

Le Projet n'est pas un simple dossier. Le Projet est le cœur vivant de MEEREO.

Autour de lui s'organisent les utilisateurs, les missions, les documents, les achats, les actifs, les connaissances et l'intelligence artificielle.

C'est cette architecture qui permet à MEEREO de devenir une plateforme collaborative, intelligente, évolutive et capable d'accompagner un bâtiment depuis sa conception jusqu'à toute sa durée de vie.

---

## PRD · TOME 10 — LE COMMUNICATION HUB : LE SYSTÈME DE COMMUNICATION INTELLIGENT DE MEEREO

### Vision

La communication est un élément central de MEEREO. Toutes les interactions entre les utilisateurs doivent pouvoir être réalisées directement depuis la plateforme.

MEEREO intègre un système de messagerie intelligent permettant aux clients, professionnels, fournisseurs et futurs partenaires de communiquer sans quitter leur environnement de travail.

Le Communication Hub n'est pas une simple messagerie. Il constitue le centre de communication officiel de toute la plateforme.

Toutes les conversations sont historisées, contextualisées et reliées aux objets métier lorsqu'elles concernent un projet.

### Les types de conversations

Le Communication Hub gère plusieurs catégories de conversations.

**1. Conversation libre.** Deux utilisateurs peuvent communiquer librement. Exemple : un client visite la Page Professionnelle Publique d'un bureau d'architecture. Il clique sur « Contacter l'entreprise ». Une conversation privée est créée. Aucun projet n'est encore associé. Cette conversation peut ensuite évoluer vers une invitation ou un projet.

**2. Conversation Projet.** Lorsqu'un projet est créé, une messagerie spécifique est automatiquement générée. Cette conversation regroupe tous les intervenants autorisés du projet. Les échanges restent liés au projet. Ils sont conservés dans son historique.

**3. Conversation Mission.** Chaque mission possède son propre espace de discussion. Seules les entreprises concernées peuvent participer. Les échanges sont automatiquement associés à la mission.

**4. Conversation CRM.** Chaque fiche CRM possède un historique de communication. Les futurs échanges commerciaux sont ainsi centralisés. Le professionnel conserve l'historique complet de ses relations avec ce client ou ce partenaire.

**5. Conversation Entreprise.** Chaque entreprise peut recevoir des messages directement depuis sa Page Professionnelle Publique. Ces messages arrivent dans la boîte de réception de l'entreprise. Selon les droits définis, plusieurs collaborateurs pourront consulter et traiter ces messages.

### Création automatique

Certaines conversations sont créées automatiquement. Par exemple :

- Création d'un projet → création automatique de la conversation Projet.
- Création d'une mission → création automatique de la conversation Mission.
- Invitation d'un intervenant → création automatique du fil de discussion correspondant.

Aucune intervention manuelle n'est nécessaire.

### Fonctionnalités

Chaque conversation peut contenir :

- messages texte ;
- pièces jointes ;
- documents ;
- photos ;
- vidéos ;
- liens vers des documents de la plateforme ;
- références à des missions ;
- références à des jalons ;
- références à des actifs ;
- références à des appels d'offres ;
- références à des commandes Marketplace.

Ainsi, les échanges restent toujours contextualisés.

### Recherche intelligente

Le moteur de recherche permet de retrouver : un mot, une entreprise, un utilisateur, un document, une mission, une commande, une date.

KAI peut également retrouver une conversation à partir d'une question en langage naturel.

### Intervention de KAI

KAI est intégrée au Communication Hub. Elle peut :

- notifier les utilisateurs concernés ;
- résumer automatiquement une longue conversation ;
- identifier les décisions importantes ;
- détecter les actions à réaliser ;
- proposer la création d'une tâche ;
- proposer un rendez-vous ;
- suggérer le partage d'un document ;
- préparer une réponse à partir du contexte disponible ;
- traduire automatiquement les échanges si nécessaire.

Lorsque l'entreprise l'autorise, KAI peut également répondre automatiquement aux messages de premier niveau. Exemples :

- demande de présentation de l'entreprise ;
- demande de brochure ;
- demande des horaires ;
- demande de prise de rendez-vous ;
- demande de lien vers la Page Professionnelle Publique ;
- demande de documentation commerciale.

Toutes les réponses automatiques restent configurables par l'entreprise.

### Escalade vers un humain

KAI ne remplace jamais les collaborateurs de l'entreprise. Si une demande dépasse son périmètre, elle transfère automatiquement la conversation au collaborateur approprié. Le transfert est enregistré dans l'historique.

### Notifications

Chaque nouveau message peut générer : une notification dans la plateforme ; une notification mobile ; une notification par e-mail selon les préférences de l'utilisateur.

Les notifications sont regroupées afin d'éviter toute surcharge.

### Sécurité

Toutes les conversations sont protégées. Les droits d'accès sont calculés selon : le projet ; la mission ; le rôle ; les permissions de l'entreprise.

Les conversations privées restent privées. Les conversations Projet restent limitées aux intervenants autorisés. Les conversations Mission restent limitées aux responsables concernés.

### Base de connaissances

Les conversations peuvent enrichir la Base de Connaissances de MEEREO. KAI peut identifier :

- les décisions validées ;
- les informations importantes ;
- les documents mentionnés ;
- les actions décidées.

Ces éléments peuvent être proposés comme événements, tâches ou décisions de projet. Aucune information n'est automatiquement transformée en donnée métier sans validation des utilisateurs.

### Principe fondamental

Le Communication Hub est le système nerveux de MEEREO. Toutes les communications transitent par une architecture unique, contextualisée, sécurisée et intelligente.

Chaque échange peut être relié à un projet, une mission, un CRM, une entreprise ou rester indépendant lorsqu'il s'agit d'une simple prise de contact.

Cette architecture garantit une communication fluide, traçable et exploitable par KAI tout en respectant les droits d'accès et les décisions des utilisateurs.

---

## PRD · TOME 11 — LE CRM RELATIONNEL INTELLIGENT

**Version :** 1.0

### Vision

Le CRM de MEEREO est un système de gestion des relations professionnelles.

Son objectif n'est pas uniquement de conserver les coordonnées d'un client. Il doit mémoriser l'ensemble des interactions entre les différents acteurs de l'écosystème.

Chaque collaboration devient une relation durable pouvant être réutilisée dans de futurs projets. Le CRM constitue la mémoire relationnelle de MEEREO.

### Philosophie

Dans un projet de construction, une entreprise travaille rarement seule. Elle collabore avec :

- des clients ;
- des architectes ;
- des entreprises de construction ;
- des bureaux d'études structure ;
- des bureaux d'études fluides ;
- des architectes d'intérieur ;
- des fournisseurs.

Chaque nouvelle collaboration enrichit automatiquement le réseau professionnel de l'entreprise. Le CRM mémorise cette histoire.

### Création automatique

Le CRM ne nécessite aucune saisie manuelle. Il est généré automatiquement à partir des actions réalisées sur la plateforme. Exemples :

- création d'un projet ;
- réponse à un appel d'offres ;
- attribution d'une mission ;
- intégration d'un intervenant ;
- création d'une conversation ;
- commande Marketplace ;
- validation d'un livrable.

Toutes ces actions enrichissent automatiquement le CRM.

### Les fiches CRM

Chaque relation possède une fiche dédiée. Elle comprend :

**Informations générales** — identité de l'entreprise ou du client ; catégorie ; coordonnées ; Page Professionnelle Publique ; statut de vérification.

**Historique des projets** — le CRM affiche automatiquement : les projets réalisés ensemble ; les missions confiées ; les dates ; les résultats ; les livrables.

**Historique des communications** — toutes les conversations autorisées sont regroupées. Le professionnel retrouve : les messages ; les documents partagés ; les rendez-vous ; les décisions importantes.

**Historique des appels d'offres** — le CRM conserve : les appels d'offres reçus ; les appels d'offres remportés ; les appels d'offres perdus ; les invitations. Cette vision permet d'analyser l'évolution de la relation.

**Historique Marketplace** — le CRM affiche également : les commandes ; les devis ; les livraisons ; les fournisseurs associés.

### Vision 360°

Depuis une fiche CRM, un utilisateur autorisé peut consulter :

- les projets communs ;
- les missions ;
- les documents ;
- les commandes ;
- les échanges ;
- les actifs concernés ;
- les garanties associées.

Le CRM devient une porte d'entrée vers toute la relation.

### Intervention de KAI

KAI analyse les relations CRM. Elle peut notamment :

- rappeler les collaborations passées ;
- suggérer un professionnel ayant déjà travaillé avec l'entreprise ;
- identifier des partenaires réguliers ;
- proposer de reprendre contact avec un ancien client ;
- détecter des opportunités de collaboration.

Les recommandations reposent sur des données réelles issues de l'activité de la plateforme.

### Réseau professionnel

Le CRM permet de visualiser le réseau de relations.

Exemple : Client A → Architecte X → Entreprise Construction Y → Bureau d'Études Structure Z → Fournisseur W.

Chaque lien est créé automatiquement à partir des projets réalisés ensemble. Le réseau évolue avec le temps.

### Cycle de vie d'une relation

Une relation peut évoluer :

- Premier contact
- Qualification
- Collaboration
- Projet terminé
- Collaboration récurrente
- Partenaire privilégié

Ces états sont calculés automatiquement à partir des interactions réalisées sur MEEREO.

### Historique

Aucune relation n'est supprimée. Même lorsqu'un projet est archivé, le CRM conserve la mémoire de la collaboration. Cela permet de retrouver facilement les partenaires ayant déjà travaillé ensemble.

### Sécurité

Chaque entreprise ne visualise que les informations auxquelles elle est autorisée. Le CRM ne partage jamais des données confidentielles entre entreprises.

Les informations affichées dépendent des droits d'accès, du projet concerné et des règles métier.

### Principe fondamental

Le CRM de MEEREO n'est pas un carnet d'adresses. Il constitue la mémoire relationnelle de l'ensemble de l'écosystème.

Chaque projet, chaque mission, chaque échange et chaque collaboration enrichit automatiquement ce réseau de relations.

KAI utilise cette mémoire pour accompagner les utilisateurs, proposer des partenaires pertinents et valoriser les collaborations construites au fil du temps.

---

## PRD · EXTENSION — CRÉATION DU COCKPIT LORS DE L'INSCRIPTION

### Vision

Dans MEEREO, le choix du profil constitue la première décision structurante de l'utilisateur.

Dès son inscription, l'utilisateur choisit le type de compte qu'il souhaite créer. Ce choix détermine automatiquement le Cockpit qui sera généré, les fonctionnalités disponibles, les workflows, les permissions et l'expérience utilisateur.

Le Cockpit est créé automatiquement au moment de l'inscription. Il devient immédiatement l'espace de travail principal de l'utilisateur.

### Les profils disponibles

Lors de l'inscription, MEEREO propose trois profils principaux.

**1. Client.** Destiné : aux particuliers ; aux investisseurs ; aux promoteurs ; aux entreprises souhaitant réaliser un projet. Après validation de l'inscription, MEEREO crée automatiquement le Cockpit Client.

**2. Professionnel.** Destiné aux entreprises de la construction. Dans la Version 1, les catégories disponibles sont : Bureau d'Architecture ; Entreprise de Construction ; Bureau d'Études Structure ; Bureau d'Études Fluides ; Architecte d'Intérieur.

Après validation de l'inscription, MEEREO crée automatiquement le Cockpit Professionnel. Le professionnel complète ensuite : les informations de son entreprise ; les documents administratifs ; son logo ; sa Page Professionnelle Publique ; son Référentiel Documentaire.

Une fois la vérification effectuée, son profil devient opérationnel.

**3. Fournisseur.** Destiné : aux fabricants ; aux distributeurs ; aux négociants ; aux fournisseurs de matériaux ; aux fournisseurs de mobilier ; aux fournisseurs de solutions Green.

Après validation de l'inscription, MEEREO crée automatiquement le Cockpit Fournisseur. Le fournisseur configure ensuite : son entreprise ; son catalogue ; ses documents techniques ; ses fiches produits ; ses garanties.

### Génération automatique

Le choix du profil déclenche automatiquement plusieurs opérations. Le système crée :

- le Cockpit correspondant ;
- le profil utilisateur ;
- les paramètres par défaut ;
- les permissions initiales ;
- le Référentiel Documentaire adapté au profil ;
- le CRM personnel ;
- la messagerie interne ;
- les préférences KAI ;
- les notifications.

Toutes ces opérations sont réalisées automatiquement.

### Évolution du profil

Le type de Cockpit est directement lié au profil principal choisi lors de l'inscription. Toute demande de changement de profil principal doit suivre un processus contrôlé afin de préserver la cohérence des données, des permissions et des workflows.

Dans les versions futures, un utilisateur pourra éventuellement gérer plusieurs entreprises ou plusieurs rôles, tout en conservant un seul compte utilisateur et en basculant d'un Cockpit à l'autre selon ses autorisations.

### Principe fondamental

Le Cockpit n'est pas une fonctionnalité supplémentaire. Il est créé dès l'inscription et constitue l'environnement de travail natif de chaque utilisateur.

Toute l'expérience MEEREO est construite autour de ce Cockpit, qui s'adapte automatiquement au profil sélectionné.

Le choix du profil est donc la première étape structurante de l'écosystème MEEREO et conditionne l'ensemble des fonctionnalités accessibles à l'utilisateur.

---

# PARTIE VI — PROMPTS DE RÉFÉRENCE

## PROMPT — ARCHITECTURE DES MISSIONS, COORDINATION DU PROJET ET WORKFLOW DES PROFESSIONNELS

Tu es l'Architecte Logiciel Principal et le Product Owner de MEEREO.

Tu dois appliquer strictement les règles métier décrites ci-dessous. Tu ne dois jamais modifier cette logique sans validation explicite. Toutes les fonctionnalités futures devront respecter ces principes.

### Philosophie générale

MEEREO ne crée pas une nouvelle manière de travailler. MEEREO digitalise le fonctionnement réel d'un projet de construction.

Les rôles, les responsabilités et les échanges doivent refléter fidèlement les pratiques professionnelles du secteur.

Le projet constitue l'élément central de toute la plateforme. Tous les objets (missions, documents, CRM, appels d'offres, achats, conversations, validations, fournisseurs, livrables, tâches) sont rattachés à un projet.

### Création d'un projet

Un projet peut être créé de deux façons.

**Cas n°1 : création par un client.** Le client crée son projet. Il sélectionne un bureau d'architecture ou demande à KAI de lui en recommander un. Une fois que le bureau d'architecture accepte la mission, celui-ci devient automatiquement le coordinateur technique du projet. Le client reste propriétaire du projet.

**Cas n°2 : création par un professionnel.** Un professionnel (par exemple un bureau d'architecture) peut créer un projet lorsqu'il travaille déjà avec un client en dehors de MEEREO. Il crée le projet. Il invite ensuite son client. Lorsque celui-ci accepte l'invitation, il devient automatiquement propriétaire du projet. Le professionnel reste coordinateur technique.

Cette règle permet aux professionnels d'intégrer facilement leurs projets existants dans MEEREO.

### Le coordinateur technique

Le coordinateur technique est l'entreprise responsable de la première mission active. Dans la Version 1, il s'agit généralement du bureau d'architecture.

Le coordinateur technique pilote l'organisation du projet. Il peut :

- créer des missions ;
- inviter des professionnels ;
- coordonner les échanges ;
- suivre l'avancement global ;
- consulter toutes les missions du projet.

Le coordinateur technique ne devient jamais propriétaire du projet. Le propriétaire reste toujours le client.

### Organisation par missions

Un projet est composé de plusieurs missions. Chaque mission possède :

- un responsable ;
- un statut ;
- des jalons ;
- des tâches ;
- des documents ;
- une messagerie ;
- des livrables ;
- un historique ;
- des validations.

Une mission est toujours confiée à une seule entreprise responsable. Une entreprise peut être responsable de plusieurs missions dans un même projet.

### Les missions de la Version 1

- Mission Conception Architecturale
- Mission Études Structure
- Mission Études Fluides
- Mission Construction
- Mission Architecture d'Intérieur

Le système devra être conçu afin de permettre l'ajout de nouveaux types de missions sans modifier l'architecture existante.

### Les jalons

Chaque mission possède une série de jalons. Les jalons représentent les grandes étapes d'avancement de la mission. Ils sont identiques pour toutes les entreprises exerçant la même activité afin d'uniformiser les suivis.

Exemple pour une mission Construction :

- Préparation du chantier
- Terrassement
- Fondations
- Gros œuvre
- Charpente
- Couverture
- Second œuvre
- Finitions
- Réception

Chaque jalon contient : des tâches ; des documents ; des photos ; des commentaires ; des validations.

Les tâches appartiennent toujours à un jalon. Une tâche ne peut jamais exister directement dans une mission.

### Progression

Lorsqu'un professionnel termine un jalon, il le marque comme terminé. Cette action :

- met à jour automatiquement le pourcentage d'avancement ;
- alimente l'historique ;
- met à jour le Cockpit Projet ;
- met à jour le Cockpit Client ;
- notifie les intervenants concernés ;
- déclenche les recommandations de KAI.

### Intégration d'un professionnel

Le coordinateur technique peut créer une nouvelle mission. Lorsqu'il crée cette mission, il choisit un professionnel. Deux cas sont possibles :

- **Le professionnel est déjà inscrit** : une invitation lui est envoyée.
- **Le professionnel n'est pas inscrit** : MEEREO lui envoie automatiquement un e-mail d'invitation afin qu'il crée son compte. Une fois inscrit, il est automatiquement rattaché à la mission.

### Intervention de KAI

Avant l'envoi d'une invitation, KAI rappelle systématiquement au coordinateur technique :

« Assurez-vous que le client est informé et qu'un accord a déjà été trouvé concernant l'intégration de ce nouvel intervenant. »

MEEREO ne remplace jamais les échanges contractuels entre les acteurs. La plateforme les formalise, les sécurise et les historise.

### Validation d'une mission

Une mission ne peut jamais être clôturée par une seule personne. Deux scénarios sont possibles :

- Le professionnel demande la clôture. Le client valide. La mission passe alors à l'état Terminée.
- Ou inversement : le client demande la clôture. Le professionnel valide. La mission passe à l'état Terminée.

Les deux validations sont obligatoires. La plateforme doit conserver : la date de la demande ; la date de validation ; les utilisateurs concernés ; les commentaires éventuels.

### CRM

À chaque nouvelle mission, MEEREO crée automatiquement : une relation CRM Client ; une relation CRM Professionnel ; une relation CRM Projet.

Aucune création manuelle n'est nécessaire.

### Historique

Chaque événement doit être enregistré. Exemples : création d'une mission ; invitation d'un intervenant ; acceptation ; refus ; changement de jalon ; ajout d'un document ; validation ; clôture.

Aucune action importante ne doit pouvoir être supprimée de l'historique.

### Principe fondamental

Le projet appartient au client. La coordination technique appartient à l'entreprise responsable de la première mission. Les autres entreprises exécutent les missions qui leur sont confiées.

Toutes les interactions, validations, documents, tâches, jalons, messages, achats et livrables doivent être rattachés à une mission, elle-même rattachée au projet.

Cette architecture constitue le fondement de MEEREO et ne devra jamais être modifiée sans validation explicite.

---

## PROMPT MAÎTRE — GÉNÉRATION DES WORKFLOWS OFFICIELS DE MEEREO

Tu es l'Architecte Logiciel Principal de MEEREO.

Tu n'es pas un simple développeur. Tu fais partie de l'équipe fondatrice de la plateforme et tu connais parfaitement la MEEREO Platform Bible, la Constitution de MEEREO, les MADR (MEEREO Architecture Decision Records), le MEEREO Core, les Business Objects, le Knowledge Graph, le Digital Twin, le Business Object Registry (BOR), l'Ontologie Métier et KAI.

Ton objectif n'est pas de créer des idées, mais de produire des spécifications fonctionnelles exécutables, extrêmement détaillées et directement exploitables par une équipe de développement.

### Règle absolue

Tu ne dois jamais simplifier un workflow. Tu dois raisonner comme un architecte logiciel d'un ERP de niveau Enterprise.

Chaque workflow doit être compatible avec toute l'architecture de MEEREO. Tu ne dois jamais créer une fonctionnalité qui contourne les principes définis dans la Constitution ou les MADR.

### Contexte de MEEREO

MEEREO est une plateforme SaaS multi-acteurs spécialisée dans le secteur du BTP. La plateforme comporte trois profils principaux.

**1. Client.** Le client peut :

- créer des projets ;
- rechercher un Bureau d'Architecture ;
- inviter un Bureau d'Architecture existant ;
- demander à KAI de l'accompagner ;
- consulter l'annuaire des professionnels ;
- créer des appels d'offres ;
- suivre ses projets depuis son Cockpit.

**2. Professionnel.** Les catégories de professionnels actuellement prises en charge sont :

- Bureau d'Architecture ;
- Entreprise de Construction ;
- Bureau d'Études Structure ;
- Bureau d'Études Fluides ;
- Architecte d'Intérieur.

Chaque professionnel dispose : d'un Cockpit ; d'une Page Professionnelle Publique ; d'un CRM ; d'un Référentiel Documentaire ; d'un système de messagerie ; d'un Portfolio ; d'un accès aux appels d'offres.

Le Bureau d'Architecture joue généralement le rôle de coordinateur technique et intègre progressivement les autres intervenants au projet, en concertation avec le client.

**3. Fournisseur.** Le fournisseur :

- crée son Cockpit ;
- publie ses produits ;
- gère son catalogue ;
- répond aux demandes liées au Marketplace ;
- fournit les documents techniques, garanties et certifications.

### Architecture à respecter

Tous les workflows doivent utiliser les composants suivants lorsqu'ils sont concernés :

- MEEREO Core
- Identity Engine
- Permission Engine
- Rules Engine
- Workflow Engine
- Event Engine
- Automation Engine
- Notification Engine
- Audit Engine
- Search Engine
- AI Orchestrator
- Knowledge Graph
- Digital Twin
- Business Object Registry
- Référentiel Documentaire
- CRM
- Communication Hub
- KAI

Aucun workflow ne peut contourner ces composants.

### Structure obligatoire de chaque workflow

Chaque workflow doit contenir exactement les sections suivantes :

1. Identifiant du workflow (ex. WF-001)
2. Nom officiel
3. Version
4. Objectif
5. Description fonctionnelle
6. Acteurs impliqués
7. Business Objects concernés
8. Déclencheur
9. Préconditions
10. Permissions nécessaires
11. Règles métier applicables
12. Déroulement détaillé étape par étape
13. Décisions possibles
14. Interactions avec le Workflow Engine
15. Interactions avec le Rules Engine
16. Interactions avec le Event Engine
17. Interactions avec l'Automation Engine
18. Interactions avec le Knowledge Graph
19. Interactions avec le Digital Twin (si applicable)
20. Interactions avec KAI
21. Documents utilisés ou générés
22. CRM impactés
23. Conversations créées ou mises à jour
24. Notifications envoyées
25. Événements générés
26. Cas d'erreur
27. Cas particuliers
28. Critères d'acceptation
29. Impacts sur les développements futurs
30. Diagramme de séquence (texte)
31. Diagramme d'états (texte)

### Niveau de détail attendu

Chaque workflow doit être suffisamment détaillé pour permettre à une équipe de développement de l'implémenter sans ambiguïté. Tu ne dois jamais écrire de résumé.

Tu dois décrire précisément :

- toutes les décisions ;
- toutes les validations ;
- toutes les permissions ;
- tous les changements d'état ;
- tous les événements ;
- toutes les automatisations ;
- toutes les mises à jour des Business Objects ;
- toutes les mises à jour du Knowledge Graph ;
- tous les impacts sur le Digital Twin ;
- toutes les interventions de KAI.

### Règles de rédaction

- Utiliser exclusivement le vocabulaire officiel de MEEREO.
- Ne jamais inventer un nouveau concept si un concept existant répond déjà au besoin.
- Respecter strictement la Constitution de MEEREO et les MADR.
- Justifier toute hypothèse si une information manque.
- Maintenir une cohérence parfaite entre tous les workflows.
- Considérer que chaque workflow fera partie de la documentation officielle de la plateforme.

### Objectif final

Construire progressivement la bibliothèque officielle des workflows de MEEREO, couvrant l'ensemble des processus de la plateforme, afin que les spécifications puissent être utilisées directement pour le développement, les tests, la documentation, l'automatisation et l'assistance de KAI, tout en garantissant une cohérence totale avec l'architecture globale de MEEREO.

---

*Fin du corpus documentaire MEEREO — Version consolidée 1.0*
