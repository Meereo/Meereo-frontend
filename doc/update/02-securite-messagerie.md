# 02. Securite de la messagerie et confidentialite des utilisateurs

## Probleme critique
Un professionnel peut voir apparaitre dans sa liste de contacts des clients avec lesquels il n'a absolument aucune relation. Ce comportement est strictement interdit.

## Fonctionnement attendu

Un professionnel doit uniquement pouvoir consulter :
- Les clients avec lesquels il possede un projet
- Les conversations auxquelles il participe
- Les groupes auxquels il appartient

Un client doit pouvoir :
- Consulter librement l'annuaire des professionnels
- Acceder a leur Page Professionnelle
- Initier une prise de contact ou une demande de collaboration

## Regles strictes
- Les clients ne doivent jamais etre visibles publiquement ni apparaitre dans les listes de contacts des professionnels en dehors d'une relation existante
- Toutes les permissions doivent etre controlees cote serveur afin d'empecher tout acces non autorise
