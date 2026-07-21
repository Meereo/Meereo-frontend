# Plateforme MEEREO — Spécifications fonctionnelles
## Corrections, améliorations et règles de fonctionnement

L'ensemble des points ci-dessous constitue la liste des corrections, améliorations fonctionnelles et règles métier à intégrer à la plateforme MEEREO afin d'en améliorer la stabilité, l'ergonomie, la cohérence des workflows et l'expérience utilisateur.

---

## 1. Vérification, validation et unicité du RCCM et du numéro de contribuable

Lors de l'inscription d'un professionnel, les champs RCCM et Numéro de contribuable affichent actuellement des valeurs d'exemple destinées uniquement à illustrer le format attendu.

Ces valeurs d'exemple ne doivent jamais pouvoir être enregistrées comme données réelles. Si un utilisateur tente de valider son inscription avec ces valeurs, le système doit refuser automatiquement l'enregistrement et afficher un message invitant à renseigner les véritables informations administratives de l'entreprise.

Une fois le formulaire validé, le RCCM et le numéro de contribuable deviennent les identifiants administratifs officiels de l'entreprise et doivent être enregistrés de façon permanente en base de données.

Lorsque le professionnel télécharge ensuite ses documents officiels (RCCM, attestation fiscale ou tout autre document administratif), l'IA doit automatiquement :
- analyser les documents ;
- extraire les informations administratives ;
- identifier le numéro RCCM ;
- identifier le numéro de contribuable ;
- comparer ces informations avec celles renseignées lors de l'inscription.

En cas d'écart entre les informations enregistrées et celles présentes sur les documents officiels, le système doit bloquer immédiatement la validation du compte, signaler l'anomalie et demander au professionnel de corriger les informations avant toute validation définitive.

Ces deux identifiants doivent être strictement uniques sur l'ensemble de la plateforme : un RCCM ou un numéro de contribuable déjà associé à une entreprise ne pourra jamais être utilisé par une autre structure.

---

## 2. Gestion du logo lors de l'inscription

Le système doit garantir qu'un seul logo officiel est associé à un compte professionnel, à tout moment.

- Si un professionnel importe un logo personnalisé puis génère un logo via l'IA, le logo importé est définitivement remplacé par le logo généré.
- Si le professionnel importe ensuite un nouveau logo personnalisé, celui-ci remplace automatiquement le logo généré par l'IA.

À aucun moment plusieurs logos ne doivent coexister ou être considérés comme actifs.

---

## 3. Création obligatoire de la page professionnelle publique

La création de la page professionnelle publique fait partie intégrante du parcours d'inscription du professionnel.

**Comportement attendu :** à la toute première connexion au tableau de bord, un popup obligatoire doit s'afficher immédiatement pour inviter le professionnel à créer sa page publique — dès le premier chargement, sans action de l'utilisateur.

**Comportement actuel (bug) :** le professionnel accède directement au tableau de bord et le popup n'apparaît qu'après un rafraîchissement manuel de la page. À corriger.

Tant que la page professionnelle publique n'a pas été créée, le professionnel ne doit pas pouvoir accéder aux autres fonctionnalités de la plateforme. Cette étape est bloquante dans l'onboarding.

---

## 4. Recherche des entreprises dans les appels d'offres privés

Lors de la création d'un appel d'offres privé, l'utilisateur doit pouvoir rechercher rapidement les entreprises de l'annuaire professionnel, par :
- nom de l'entreprise ;
- mots-clés ;
- spécialités ;
- domaines d'expertise.

Les résultats doivent être instantanés et permettre l'ajout rapide d'une ou plusieurs entreprises à l'appel d'offres.

---

## 5. Affichage des entreprises dans les appels d'offres privés

Chaque entreprise affichée dans les résultats de recherche doit présenter au minimum :
- son logo ;
- son nom ;
- ses domaines d'expertise ;
- éventuellement sa localisation et son niveau de vérification.

**Bug actuel :** les logos ne s'affichent pas correctement, ce qui complique l'identification des entreprises. À corriger.

---

## 6. Contact d'une entreprise ne possédant pas encore de page publique

**Bug actuel :** le bouton « Contacter l'entreprise » est visible même quand l'entreprise n'a pas encore de page professionnelle publique, mais les messages envoyés depuis ce bouton ne sont jamais reçus dans la messagerie du professionnel.

**Deux solutions sont envisageables** (arbitrage à faire côté produit avant développement — ce point n'est pas tranché dans la présente spécification) :
1. masquer automatiquement le bouton tant que la page publique n'existe pas ;
2. garantir le bon fonctionnement de la messagerie même sans page publique créée.

Dans tous les cas, le comportement actuel (bouton actif mais message perdu) doit être corrigé.

---

## 7. Badge « Professionnel vérifié par MEEREO »

Chaque page professionnelle publique doit intégrer un badge officiel « Professionnel vérifié par MEEREO », destiné à renforcer la confiance des utilisateurs.

Ce badge n'est **jamais** attribué automatiquement à l'inscription. Il ne s'active que lorsque toutes les conditions suivantes sont réunies :
- le professionnel a téléchargé son RCCM ;
- les documents administratifs obligatoires ont été transmis ;
- l'IA a analysé les documents ;
- les numéros RCCM et de contribuable extraits correspondent exactement à ceux renseignés à l'inscription ;
- les contrôles administratifs ont été validés avec succès.

Une fois ces vérifications terminées, le badge doit apparaître en vert sur la page publique.

---

## 8. Retour intempestif vers la landing page

Un dysfonctionnement provoque régulièrement un retour automatique vers la landing page alors que l'utilisateur est déjà connecté, ce qui interrompt la navigation.

Une analyse complète doit identifier précisément les causes de ces redirections (cf. aussi le point 14, qui couvre plus largement les pertes de session).

**Règle :** en dehors d'une déconnexion volontaire, d'une expiration de session ou d'une contrainte de sécurité, aucun utilisateur ne doit être redirigé automatiquement vers la landing page.

---

## 9. Logo absent sur la page professionnelle

Le logo affiché dans l'en-tête de la page professionnelle (partie supérieure droite) ne s'affiche pas correctement. À corriger afin que le logo officiel de l'entreprise soit visible en permanence sur l'ensemble de la page publique.

---

## 10. Refonte complète de la messagerie

La messagerie est l'un des modules les plus critiques de la plateforme et présente encore de nombreux dysfonctionnements. Une refonte complète est nécessaire pour garantir une communication fiable, instantanée et sécurisée.

**Problèmes constatés :**
- les messages envoyés d'un espace Client vers un espace Professionnel ne sont pas toujours reçus ;
- le bouton Messagerie sur les pages professionnelles ne fonctionne pas correctement ;
- le bouton Contacter a un comportement incohérent ;
- les notifications de nouveaux messages sont absentes ou incomplètes ;
- les logos des utilisateurs ne s'affichent pas correctement dans les conversations ;
- les conversations ne se synchronisent pas en temps réel ;
- certaines discussions nécessitent un rafraîchissement manuel pour apparaître ;
- les performances générales restent insuffisantes.

### Règles métier — Messagerie côté Client

Un client ne doit **jamais** avoir accès à la liste complète des utilisateurs de la plateforme. Il peut uniquement :
- consulter les professionnels avec lesquels il a déjà une relation de travail ;
- retrouver les entreprises déjà intégrées à ses projets ;
- rechercher de nouveaux professionnels exclusivement via l'annuaire des professionnels.

L'annuaire professionnel doit devenir le point d'entrée principal pour découvrir de nouveaux prestataires. Le client ne doit jamais avoir accès à la liste des autres clients inscrits.

### Règles métier — Messagerie côté Professionnel

**Comportement actuel (non conforme) :** un professionnel peut consulter la liste complète des clients inscrits, même sans relation commerciale entre eux. Ceci est strictement interdit.

Un professionnel doit uniquement avoir accès :
- aux clients présents dans son CRM ;
- aux clients avec lesquels il a une relation d'affaires active ou passée ;
- aux entreprises/prestataires avec lesquels il a déjà collaboré.

Il ne doit jamais pouvoir consulter ou contacter directement les autres clients de la plateforme. Il peut en revanche rechercher librement d'autres entreprises via l'annuaire professionnel pour initier de nouvelles collaborations — cette recherche doit obligatoirement passer par l'annuaire, jamais par la messagerie.

### Synchronisation en temps réel

Toutes les conversations doivent fonctionner en temps réel. Chaque message envoyé doit être :
- transmis instantanément ;
- affiché immédiatement chez le destinataire ;
- notifié automatiquement au destinataire ;
- répercuté sur les compteurs de notifications, sans rafraîchissement manuel.

Les appels vocaux et vidéo (détaillés au point 17) devront utiliser cette même architecture temps réel.

---

## 11. Conservation de la page active lors d'un rafraîchissement

Après un rafraîchissement, l'utilisateur doit retrouver exactement :
- la même page ;
- le même onglet actif ;
- les mêmes filtres ;
- la même position dans la page ;
- les mêmes données affichées, lorsque techniquement possible.

**Interdit :** qu'un simple rafraîchissement redirige automatiquement vers le tableau de bord, la landing page, une autre rubrique ou une autre section.

**Seules exceptions autorisées :** expiration de session, déconnexion volontaire, contrainte de sécurité.

Cette règle s'applique à l'ensemble des modules, pour une expérience proche d'une application native.

---

## 12. Compatibilité complète de l'annuaire des professionnels

L'annuaire fonctionne correctement sous Chrome mais présente des dysfonctionnements sous Safari (annuaire qui ne s'affiche pas, fonctionnalités inopérantes, composants mal chargés selon les cas).

Une analyse doit identifier précisément les écarts de comportement entre navigateurs, en vérifiant :
- compatibilité JavaScript ;
- compatibilité CSS ;
- compatibilité WebKit ;
- appels API ;
- gestion du cache ;
- composants React ;
- gestion des événements ;
- performances de rendu.

**Objectif :** fonctionnement identique sur Safari, Chrome, Edge et Firefox. Aucun navigateur officiellement supporté ne doit offrir une expérience dégradée.

---

## 13. Correction des bugs provoquant une déconnexion ou une sortie inattendue de la plateforme

Plusieurs dysfonctionnements provoquent une sortie inattendue de la plateforme, une redirection non souhaitée ou une perte de session (cf. point 8 pour le cas particulier de la landing page).

Aucune action utilisateur ne doit entraîner : fermeture de session, déconnexion involontaire, redirection vers la landing page, retour forcé au tableau de bord, perte du contexte de navigation, ou rechargement complet non justifié.

**Les opérations suivantes doivent se dérouler sans interruption de session :** navigation entre modules, validation de formulaires, changement d'onglet, téléchargement de documents, création/modification de projets, consultation de profils, ouverture de la messagerie, actualisation de données.

Une analyse complète des événements déclencheurs devra être menée (gestion des sessions, authentification, tokens, cache, appels API, gestion des états React, etc.).

---

## 14. Gestion complète de l'arrêt, de la clôture, de l'archivage et de la suppression des projets

Le cycle de vie d'un projet doit être cohérent pour tous les utilisateurs.

**Bug actuel :** lorsqu'un professionnel supprime un projet, le comportement côté client n'est pas cohérent et certaines informations restent affichées à tort.

Selon ses droits, chaque utilisateur autorisé doit pouvoir : suspendre, reprendre, clôturer, archiver, ou supprimer définitivement un projet (lorsque les conditions du workflow sont réunies).

Toute clôture, archivage ou suppression doit être automatiquement synchronisée chez tous les utilisateurs concernés. Un projet supprimé ne doit plus apparaître dans « Mes Projets ».

**États du projet à définir précisément :** En préparation, En attente, En cours, Suspendu, Terminé, Clôturé, Archivé, Supprimé.

Les droits associés à chaque état devront être définis pour : le Maître d'Ouvrage (Client), le Professionnel, les Intervenants, et l'Administrateur.

---

## 15. Optimisation des performances de l'annuaire des professionnels

Le temps de chargement des profils est actuellement trop élevé. Une optimisation doit porter sur :
- le temps d'ouverture des pages ;
- le chargement des profils, logos et images ;
- les recherches multicritères et les filtres ;
- la pagination ;
- les appels API et les requêtes en base de données.

**Objectif :** affichage quasi instantané, même avec plusieurs milliers de professionnels référencés.

---

## 16. Intégration native des API de communication (messagerie, appels vocaux, appels vidéo)

Les trois fonctionnalités de communication de MEEREO (messagerie instantanée, appels vocaux, appels vidéo) doivent reposer sur une architecture API entièrement intégrée à la plateforme. L'utilisateur ne doit jamais être redirigé vers une application ou un service externe.

Les appels audio/vidéo doivent être accessibles directement depuis une conversation existante et permettre :
- le démarrage instantané d'un appel ;
- le passage d'un appel vocal à un appel vidéo ;
- les notifications d'appel entrant ;
- la gestion des refus et appels manqués ;
- l'affichage de l'état de connexion.

L'ensemble doit respecter les exigences de sécurité, de confidentialité et de performance attendues d'une plateforme professionnelle.

---

## 17. Synchronisation automatique des notes d'avancement avec le client

**Bug actuel :** une note ajoutée par le professionnel dans le module Avancement (Cockpit Projet) reste visible uniquement dans son espace.

**Comportement attendu :** chaque note doit être synchronisée automatiquement et immédiatement avec l'espace client, dans la section Notes du Projet, sans intervention supplémentaire.

Les notes doivent conserver : auteur, date, heure, étape concernée, catégorie, pièces jointes éventuelles. L'historique complet des échanges doit être conservé.

---

## 18. Refonte de la visualisation documentaire et de la chronologie

L'affichage actuel des documents, sous forme de listes, est peu intuitif. Une refonte visuelle est souhaitée, avec plusieurs modes de visualisation possibles :
- cartes visuelles (cards) ;
- galerie d'images ;
- vignettes ;
- chronologie interactive / timeline documentaire ;
- regroupement par catégorie ou par étape du projet.

Chaque document doit afficher rapidement : aperçu, type, auteur, date de dépôt, catégorie, étape d'avancement.

---

## 19. Gestion des intervenants affectés à un projet

Aujourd'hui, un intervenant affecté ne peut qu'être évalué. Le responsable du projet doit également pouvoir : le retirer, le remplacer, modifier son rôle, ou mettre fin à sa participation.

Lorsqu'un intervenant est supprimé, cette suppression doit automatiquement mettre à jour : droits d'accès, notifications, liste des intervenants, Cockpit Projet, permissions associées. Toutes les dépendances liées à cet intervenant doivent être recalculées automatiquement.

---

## 20. Validation rapide des étapes d'avancement

Valider chaque étape individuellement devient fastidieux sur les projets à nombreuses tâches. Le système doit proposer une validation groupée par section (ex. « Tout valider », « Valider cette section », « Marquer la section comme terminée »), tout en conservant la possibilité de valider individuellement une étape.

---

## 21. Amélioration du système visuel d'identification des projets

Le système de couleurs actuel est limité. Chaque projet doit pouvoir être associé à une couleur distincte, avec une palette élargie, appliquée de façon cohérente dans : tableau de bord, Cockpit Projet, listes de projets, chronologies, indicateurs d'avancement, calendriers, tableaux de suivi.

---

## 22. Synchronisation des images entre l'espace Professionnel et l'espace Client

**Bug actuel :** les images téléchargées par le professionnel dans un projet (photos de chantier, rendus 3D, plans, documents graphiques, comptes rendus visuels, etc.) n'apparaissent pas dans l'espace client.

**Comportement attendu :** toute image ajoutée doit être synchronisée automatiquement et en temps réel avec le projet, et visible immédiatement côté client — à l'exception des documents explicitement marqués privés/internes.

Chaque image doit conserver ses métadonnées : date de dépôt, auteur, description, catégorie, étape d'avancement, historique des modifications. Toute modification, suppression ou ajout doit être répercuté chez tous les utilisateurs autorisés (client, professionnel, intervenants).

---

## 23. Intégration des avis dans le workflow de fin de mission

Le système d'avis doit faire partie intégrante du cycle de vie d'un projet, et non être une fonctionnalité indépendante.

À la clôture d'une mission, le client doit être automatiquement invité à évaluer le professionnel, via une évaluation comprenant obligatoirement : une note globale, un commentaire, une évaluation par critères (délais, qualité d'exécution, communication, professionnalisme, etc.).

Une fois validée, l'évaluation est automatiquement publiée sur la page professionnelle publique de l'entreprise. Le professionnel **ne peut pas** : supprimer un avis, le masquer, désactiver la section avis, ou modifier une note attribuée. Seule l'administration MEEREO peut intervenir en cas de contenu manifestement frauduleux, diffamatoire ou contraire aux CGU.

---

## 24. Cohérence des données entre les espaces Client et Professionnel

Toute action du professionnel faisant partie du suivi normal du projet doit se répercuter automatiquement dans l'espace client (notes d'avancement, documents, images, comptes rendus, changements d'état, affectations/suppressions d'intervenants, notifications importantes) — et inversement pour les actions du client (validation, commentaires, demandes de modification, clôture de projet, etc.).

MEEREO doit fonctionner comme une plateforme collaborative unique où chaque acteur travaille sur les mêmes données en temps réel, selon ses droits.

---

## 25. Gestion des notifications

Chaque événement important doit générer automatiquement une notification en temps réel : nouveau message, ajout de document ou d'image, création d'appel d'offres, invitation sur un projet, affectation d'intervenant, validation d'étape, demande d'action d'un client, modification importante d'un projet, clôture de projet, réception d'un avis.

Les compteurs de notifications doivent se mettre à jour automatiquement, sans rafraîchissement manuel. Les notifications doivent rester consultables dans un historique dédié jusqu'à leur lecture.

---

## 26. Optimisation générale des performances de la plateforme

Au-delà des corrections ponctuelles listées ci-dessus, une optimisation globale de l'architecture technique doit être menée, pour une expérience fluide, stable et comparable à une application native.

**Performances :** réduction des temps de chargement ; optimisation des requêtes API et des requêtes base de données ; réduction des appels inutiles ; optimisation des images/médias ; mise en cache intelligente ; chargement progressif (lazy loading).

**Fluidité :** aucune action utilisateur ne doit donner l'impression que l'application se bloque ou se recharge inutilement (transitions de pages, ouverture de modules, changements d'onglet, recherches, mises à jour — tous instantanés).

**Synchronisation temps réel :** messagerie, notifications, projets, documents, images, notes, appels d'offres — toutes les données critiques synchronisées immédiatement entre utilisateurs concernés.

**Compatibilité :** comportement identique sur tous les navigateurs officiellement supportés (Safari, Chrome, Edge, Firefox) — aucune différence fonctionnelle entre eux.

**Stabilité :** aucune déconnexion intempestive, perte de données, redirection involontaire, rechargement complet non justifié, ou dysfonctionnement lié au cache.

---

## 27. Correction orthographique et grammaticale de l'ensemble de la plateforme

De nombreuses fautes d'orthographe et de grammaire sont actuellement présentes sur la plateforme. Une correction linguistique complète doit être réalisée sur l'ensemble des textes visibles par l'utilisateur, notamment :
- les libellés d'interface (boutons, menus, titres, champs de formulaire) ;
- les messages d'erreur et messages système ;
- les notifications (in-app, email, SMS) ;
- les textes des popups et messages de confirmation ;
- les contenus générés automatiquement par l'IA (descriptions, résumés, textes associés aux badges, etc.) ;
- les emails transactionnels (inscription, validation, relances, factures) ;
- les contenus statiques (pages légales, CGU, aide, FAQ) ;
- les textes des pages professionnelles publiques générées par le système.

Cette correction doit couvrir l'orthographe, la grammaire, la conjugaison, la ponctuation, ainsi que la cohérence terminologique (mêmes termes utilisés pour désigner les mêmes concepts sur toute la plateforme — ex. « Cockpit Projet », « Annuaire des professionnels »).

Il est recommandé de mettre en place une relecture systématique (correcteur orthographique intégré au processus de développement/CI, ou relecture manuelle avant chaque mise en production) afin d'éviter la réapparition de fautes lors des évolutions futures.

**Note pour le développeur :** ce document ne contient pas la liste précise des fautes constatées par les utilisateurs. Une liste détaillée (captures d'écran, pages et champs concernés) devra être fournie séparément par MEEREO pour prioriser les corrections — sans cette liste, l'exigence reste une consigne générale de relecture/proofreading plutôt qu'un correctif ciblé.

---

## Conclusion

Les développements devront respecter les principes suivants :
- cohérence fonctionnelle entre tous les profils utilisateurs ;
- synchronisation en temps réel des données ;
- respect strict des workflows métier définis par MEEREO ;
- performance élevée sur l'ensemble de la plateforme ;
- sécurité des données et gestion rigoureuse des droits d'accès ;
- qualité rédactionnelle et orthographique irréprochable sur l'ensemble des contenus ;
- expérience utilisateur fluide, intuitive et homogène sur tous les navigateurs.

Chaque fonctionnalité devra préserver la cohérence globale de l'écosystème MEEREO, afin que chaque module (Cockpit Projet, Annuaire, CRM, Messagerie, Appels d'offres, IA KAI, Gestion documentaire, Page professionnelle publique) fonctionne de manière intégrée et transparente.

---

## Annexe — Points de vigilance identifiés lors de la relecture

Ces points ne modifient aucune exigence : ils signalent des zones de recouvrement ou des décisions non tranchées dans le texte source, à clarifier avant transmission finale au développeur.

1. **Décision non tranchée (point 6) :** le texte propose deux solutions alternatives (masquer le bouton *vs* fiabiliser la messagerie) sans trancher. Le développeur ne peut pas coder sur cette base — un choix doit être fait côté produit.
2. **Doublon supprimé :** les points originaux « Optimisation générale des performances » (initialement présents deux fois dans le texte source) ont été fusionnés en un seul point (26), la seconde version étant plus complète.
3. **Recouvrement points 4/5 et 15 :** recherche/affichage dans l'annuaire (4, 5) et performance de l'annuaire (15) touchent le même module — à traiter par la même équipe/sprint pour éviter les régressions croisées.
4. **Recouvrement points 8 et 13 :** le retour intempestif vers la landing page (8) est un cas particulier des sorties de session inattendues (13). Une cause racine commune est probable — recommandé de traiter les deux dans la même investigation technique.
5. **Recouvrement points 10 et 16 :** l'exigence d'architecture temps réel pour les appels vocaux/vidéo est énoncée dans les deux points. Non contradictoire, mais à implémenter comme un bloc technique unique.
6. **Grammaire corrigée :** dans le point 10 (« Synchronisation en temps réel »), la liste originale mélangeait participes passés et infinitifs (« transmis... affiché... **notifier**... **mettre à jour**... ») — corrigée en accord grammatical cohérent.
7. **Artefacts de mise en page supprimés :** le bloc de titre « CORRECTIONS, AMÉLIORATIONS ET RÈGLES DE FONCTIONNEMENT / Plateforme MEEREO – Spécifications fonctionnelles » se répétait trois fois dans le corps du texte source (probablement des sauts de page d'un document Word) — supprimé car sans valeur fonctionnelle.

Aucun contenu fonctionnel n'a été ajouté ou supprimé au-delà de ces corrections de forme et de ces fusions de doublons identiques.
