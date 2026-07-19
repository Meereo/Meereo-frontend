# 09. Simplification du workflow apres validation d'un appel d'offres

## Probleme constate
Le workflow actuel comporte une etape inutile :
1. Le client accepte une offre
2. Celle-ci apparait dans "Contrats valides"
3. Le professionnel doit ensuite confirmer le demarrage du projet

Cette etape supplementaire n'a aucun interet. Le professionnel a deja accepte les conditions lorsqu'il a repondu a l'appel d'offres.

## Nouveau fonctionnement attendu
Des que le client valide une offre :
- Le contrat devient automatiquement actif
- La mission demarre immediatement
- Le projet passe automatiquement en statut "En cours"
- Le planning est genere
- Les taches sont creees
- Le suivi budgetaire est active
- Les notifications sont envoyees aux parties concernees

Aucune validation supplementaire du professionnel ne doit etre demandee. Ce processus doit etre entierement automatise.
