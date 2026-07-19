# 03. Suppression de l'acces au client depuis la messagerie

## Probleme constate
Au sein d'une conversation entre un professionnel et un client, une action permettant d'acceder a une fiche ou a un profil client est actuellement affichee. Cette fonctionnalite est une erreur.

## Regle
Les clients ne disposent pas de page publique ni de profil consultable sur MEEREO. Le client est un utilisateur prive.

## Correctifs
- Aucun bouton "Voir le client", "Profil client" ou equivalent ne doit apparaitre dans la messagerie
- Un professionnel ne doit jamais pouvoir acceder a une fiche detaillee du client
- Seules les informations strictement necessaires a la mission (nom du projet, informations liees au projet) doivent etre accessibles
- Toutes les autres informations relatives au client doivent rester confidentielles
