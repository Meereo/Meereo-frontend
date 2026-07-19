# 01. Refonte du systeme de notifications

## Problemes constates
- Les badges de notifications (compteurs) sont trop discrets
- Leur couleur actuelle ne permet pas de les identifier rapidement
- Certaines notifications ne sont jamais generees
- D'autres restent affichees alors qu'elles ont deja ete consultees
- Les compteurs ne se mettent pas toujours a jour automatiquement

## Correctifs attendus
- Utiliser une couleur beaucoup plus visible (rouge, orange ou couleur d'alerte compatible avec la charte graphique)
- Uniformiser le fonctionnement des notifications sur l'ensemble de la plateforme
- Verifier que chaque evenement genere correctement sa notification
- Verifier que les compteurs se mettent automatiquement a jour sans rechargement de page
- Realiser un audit complet de toutes les notifications afin d'eliminer les incoherences
