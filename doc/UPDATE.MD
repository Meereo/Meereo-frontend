MEEREO – Audit fonctionnel, corrections prioritaires et améliorations de la plateforme

Bonjour,

À la suite de plusieurs phases de tests fonctionnels de la plateforme MEEREO, nous avons identifié un ensemble de bugs, d'incohérences fonctionnelles et de points d'amélioration qui doivent être corrigés avant la mise en production.

L'objectif de cette phase n'est pas uniquement de corriger des anomalies, mais également d'améliorer la qualité globale de la plateforme, de renforcer la sécurité des données, de fluidifier les parcours utilisateurs et de garantir une expérience premium, cohérente et fiable.

Merci de traiter les points suivants par ordre de priorité.

1. Refonte du système de notifications

Le système actuel de notifications manque de visibilité et présente plusieurs dysfonctionnements.

Problèmes constatés
Les badges de notifications (compteurs affichés à côté des différentes sections) sont trop discrets.
Leur couleur actuelle ne permet pas de les identifier rapidement.
Certaines notifications ne sont jamais générées.
D'autres restent affichées alors qu'elles ont déjà été consultées.
Les compteurs ne se mettent pas toujours à jour automatiquement.
Correctifs attendus
Utiliser une couleur beaucoup plus visible (rouge, orange ou toute couleur d'alerte compatible avec la charte graphique).
Uniformiser le fonctionnement des notifications sur l'ensemble de la plateforme.
Vérifier que chaque événement génère correctement sa notification.
Vérifier que les compteurs se mettent automatiquement à jour sans rechargement de page.
Réaliser un audit complet de toutes les notifications afin d'éliminer les incohérences.

1. Sécurité de la messagerie et confidentialité des utilisateurs

Nous avons identifié un problème critique concernant la confidentialité des données.

Aujourd'hui, un professionnel peut voir apparaître dans sa liste de contacts des clients avec lesquels il n'a absolument aucune relation.

Ce comportement est strictement interdit.

Fonctionnement attendu

Un professionnel doit uniquement pouvoir consulter :

les clients avec lesquels il possède un projet ;
les conversations auxquelles il participe ;
les groupes auxquels il appartient.

En revanche, un client doit pouvoir consulter librement l'annuaire des professionnels, accéder à leur Page Professionnelle et initier une prise de contact ou une demande de collaboration.

Les clients ne doivent jamais être visibles publiquement ni apparaître dans les listes de contacts des professionnels en dehors d'une relation existante.

Toutes les permissions doivent être contrôlées côté serveur afin d'empêcher tout accès non autorisé aux données d'un autre utilisateur.

1. Suppression de l'accès au client depuis la messagerie

Nous avons constaté qu'au sein d'une conversation entre un professionnel et un client, une action permettant d'accéder à une fiche ou à un profil client est actuellement affichée.

Cette fonctionnalité est une erreur et doit être supprimée.

Contrairement aux professionnels, les clients ne disposent pas de page publique ni de profil consultable sur MEEREO.

Le client est un utilisateur privé.

Par conséquent :

aucun bouton « Voir le client », « Profil client » ou équivalent ne doit apparaître dans la messagerie ;
un professionnel ne doit jamais pouvoir accéder à une fiche détaillée du client ;
seules les informations strictement nécessaires à la mission (nom du projet, informations liées au projet et éléments utiles à la collaboration) doivent être accessibles.

Toutes les autres informations relatives au client doivent rester confidentielles.

1. Synchronisation des messages en temps réel

Le système de messagerie manque aujourd'hui de réactivité.

Les nouveaux messages n'apparaissent pas systématiquement.

Dans de nombreux cas, il est nécessaire d'actualiser manuellement la page pour voir apparaître une nouvelle conversation ou un nouveau message.

Cette situation dégrade fortement l'expérience utilisateur.

Correctifs attendus

Mettre en place une synchronisation temps réel (WebSocket, SSE ou équivalent) permettant :

l'affichage immédiat des nouveaux messages ;
l'actualisation automatique des conversations ;
la mise à jour instantanée de la liste des discussions ;
la synchronisation entre tous les appareils connectés.

Aucune actualisation manuelle ne doit être nécessaire.

1. Notifications de nouveaux messages et d autres étapes

Aujourd'hui, les utilisateurs ne sont pas correctement avertis lorsqu'ils reçoivent un nouveau message.

Cette anomalie concerne aussi bien les clients que les professionnels.

Fonctionnement attendu

Les notifications doivent apparaître :

dans la barre latérale ;
dans la section Messagerie ;
dans le centre de notifications ;
directement sur la conversation concernée.

Le compteur des messages non lus doit être mis à jour instantanément.

1. Refonte du suivi des paiements

Le module financier doit offrir une transparence totale au client.

Chaque paiement effectué dans le cadre d'un projet doit automatiquement générer une notification.

Le client doit pouvoir consulter un historique détaillé comprenant notamment :

le montant ;
la date ;
l'heure ;
le bénéficiaire ;
le moyen de paiement ;
le numéro de transaction ;
le statut (en attente, validé, refusé, remboursé) ;
les justificatifs éventuels.

L'objectif est que le client puisse suivre en temps réel toutes les opérations financières liées à son projet.

1. Amélioration du menu de navigation

Le menu latéral manque aujourd'hui de visibilité.

La section active est uniquement affichée avec un fond gris.

Cette différence visuelle est insuffisante.

Amélioration souhaitée

Créer un véritable état actif comprenant par exemple :

une couleur de fond plus marquée ;
une barre verticale colorée ;
une icône mise en évidence ;
un texte plus contrasté ;
éventuellement une légère animation.

L'utilisateur doit identifier instantanément la section dans laquelle il se trouve.

1. Vérification complète du module « Ajout des intervenants dans un projet en cours.

Merci de réaliser un audit complet de cette fonctionnalité.

Les éléments suivants doivent être contrôlés :

création des invitations ;
réception des invitations ;
acceptation ;
refus ;
attribution correcte des rôles ;
gestion des permissions ;
notifications ;
accès aux différents modules après validation.

Cette fonctionnalité doit être entièrement fiable.

1. Simplification du workflow après validation d'un appel d'offres

Le workflow actuel comporte une étape inutile.

Aujourd'hui :

le client accepte une offre ;
celle-ci apparaît dans Contrats validés ;
le professionnel doit ensuite confirmer le démarrage du projet.

Cette étape supplémentaire n'a aucun intérêt.

Le professionnel a déjà accepté les conditions lorsqu'il a répondu à l'appel d'offres.

Nouveau fonctionnement attendu

Dès que le client valide une offre :

le contrat devient automatiquement actif ;
la mission démarre immédiatement ;
le projet passe automatiquement en statut En cours ;
le planning est généré ;
les tâches sont créées ;
le suivi budgétaire est activé ;
les notifications sont envoyées aux parties concernées.

Aucune validation supplémentaire du professionnel ne doit être demandée.

Ce processus doit être entièrement automatisé.

1. Refonte de la Page Professionnelle

La Page Professionnelle doit devenir une véritable vitrine digitale pour les clients. aujourdhui le professionel doit intégrer les moduls d avis et de notes directement par lui meme . cette option doit etre d office sur la plateforme et aussi RAW DESIGN ne doit pas apparaitre a aucun moment comme exmple sur la plateforme pro. 

Cette page doit inspirer confiance et permettre au client d'évaluer rapidement le sérieux du professionnel. Concernatn l option validation on doit trouver une solution qui oblige le professionnel a télécharger ses docuements admin et on doit pouvoir verifier le numero rccm afin de verifier les informations qu il a indiqué dans son inscription ce qui lui vaudra le badge validé par MEEREO ( dans la couleur Verte)

1. Audit global des workflows et des permissions

Nous souhaitons réaliser un audit complet de la plateforme afin de garantir la cohérence de l'ensemble des parcours utilisateurs.

Merci de vérifier notamment :

les permissions des clients ;
les permissions des professionnels ;
les permissions des maîtres d'ouvrage ;
les permissions des architectes ;
les permissions des administrateurs ;
les droits des intervenants ;
les accès aux documents ;
les accès aux projets ;
les accès à la messagerie ;
les accès aux informations financières ;
les notifications ;
les changements d'état des projets ;
les workflows entre les différents modules.

Chaque utilisateur doit uniquement accéder aux fonctionnalités et aux informations correspondant à son rôle.

Toutes les permissions doivent être contrôlées côté serveur afin de garantir la sécurité des données.

1. Audit global de la plateforme

Au-delà des points listés ci-dessus, nous souhaitons qu'un audit fonctionnel complet de MEEREO soit réalisé.

L'objectif est d'identifier toutes les incohérences, bugs, oublis fonctionnels ou problèmes d'expérience utilisateur qui pourraient nuire à la qualité du produit.

Chaque module doit être testé dans des conditions réelles afin de vérifier :

la cohérence des parcours utilisateurs ;
la fluidité de la navigation ;
la synchronisation des données en temps réel ;
les performances générales ;
la sécurité des accès ;
la cohérence entre les différents modules ;
le respect des règles métier propres à MEEREO.
Objectif final

Cette phase doit permettre de stabiliser définitivement la plateforme avant sa mise en production.

Notre ambition est de faire de MEEREO une plateforme BTP de référence, offrant une expérience premium, fluide, performante, sécurisée et cohérente, où chaque fonctionnalité respecte les workflows métiers, les droits d'accès des différents profils et les plus hauts standards de qualité logicielle.