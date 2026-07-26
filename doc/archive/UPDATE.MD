# Retours client — MEEREO

Date de compilation : 19/07/2026

## 1. Notifications

- Implémenter dans l'espace client le même système de notifications que celui de la barre latérale gauche de l'espace professionnel (homogénéité des deux espaces).
- Mettre en évidence les notifications non lues par une couleur (ex. rouge) pour une identification immédiate.
- Mettre en place les notifications par e-mail (actuellement absentes), sur le modèle des e-mails de réinitialisation de mot de passe déjà fonctionnels. Événements concernés :
  - création ou activation d'un projet
  - invitation d'un professionnel à rejoindre un projet
  - ajout d'une nouvelle tâche ou étape
  - partage d'un document
  - réception d'un nouveau message ou d'une nouvelle notification
  - action importante nécessitant l'attention du client ou du professionnel
  - Objectif : compléter les notifications internes pour informer les utilisateurs même hors connexion.

## 2. Recherche de professionnels

- Bug persistant : la pop-up ne s'affiche pas correctement lorsqu'on clique sur « Rechercher un professionnel » depuis l'espace professionnel. À corriger.
- Manque d'harmonisation de l'annuaire de recherche entre les deux espaces : plus visible/mis en avant côté professionnel que côté client. À uniformiser.

## 3. Documents et images

- Section Documents (espace pro) : les fichiers image sont présents mais sans miniature d'aperçu. Ajouter des vignettes pour faciliter l'identification.
- Afficher automatiquement les dernières images ajoutées :
  - dans le tableau de bord de l'espace professionnel, classées par projet ;
  - sur la page d'accueil de l'espace client.
- Section Projets (espace pro) : les photos sont affichées trop petites. Augmenter leur taille.
- Section Avancement : l'image d'illustration de chaque projet est trop petite. L'agrandir pour mieux valoriser le projet.
- Espace client, section Mes projets : même correctif à appliquer, images à afficher dans un format plus généreux.

## 4. Harmonisation UI entre espace professionnel et espace client

- Menu latéral de navigation : expérience différente entre les deux espaces.
  - Espace pro : section active bien mise en évidence (couleur plus sombre, fond marqué, meilleure profondeur), éléments de menu plus épais.
  - Espace client : effet nettement moins perceptible.
  - Uniformiser complètement design, comportement et effets visuels des deux menus pour une expérience cohérente et premium.
- Section « Ma page Pro » : pas assez mise en valeur par rapport aux autres rubriques. Lui donner une présentation plus visible et premium, avec un emplacement qui reflète son importance (vitrine publique du professionnel).

## 5. Formatage des montants

- Les montants financiers (ex. budgets) ne sont pas formatés avec des séparateurs de milliers côté client (ex. `15000000 FCFA` au lieu de `15 000 000 FCFA`).
- Appliquer ce formatage à l'ensemble des montants financiers de la plateforme, côté client comme côté professionnel.

## 6. Synchronisation des membres d'équipe

- Lorsqu'un collaborateur est ajouté à un projet depuis l'espace professionnel, il doit être automatiquement récupéré depuis l'équipe définie sur la page professionnelle publique.
- Inversement, un collaborateur créé directement depuis un projet doit être automatiquement ajouté à l'équipe de la page professionnelle publique.
- Les deux espaces doivent partager une base de données commune pour éviter les doublons et garantir la cohérence.

## 7. Module Suivi des chantiers

- Bug : l'ajout d'une note sur une étape ou un intervenant n'exécute aucune action (ni enregistrement, ni affichage).
- Ces informations ne sont pas non plus répercutées côté client.
- Les ajouts doivent être sauvegardés, synchronisés, et immédiatement visibles dans l'espace professionnel et l'espace client.

## 8. Suppression et archivage des projets

- Bug : un projet supprimé définitivement depuis la section Archives réapparaît par la suite. La suppression définitive doit retirer le projet de la base de données de façon permanente, sans réapparition dans aucune section.
- Problème de synchronisation plus général : une action d'archivage ou de suppression effectuée depuis la section Projet n'est pas répercutée dans les sections liées (Avancement, Budgets, Documents/Documentation, etc.), créant des incohérences.
- Comportement attendu :
  - **Archivage** : le projet doit être déplacé automatiquement dans les archives de toutes les sections liées et disparaître des espaces actifs.
  - **Suppression définitive** : le projet et toutes les données associées (avancement, budgets, documents, historiques, etc.) doivent être supprimés de l'ensemble de la plateforme.
- L'archivage/la suppression d'un projet doit être traité comme une action centrale impactant toutes ses occurrences, afin de garantir une base de données cohérente sans duplication ni donnée obsolète.