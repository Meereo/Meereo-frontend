# Rules Engine (Moteur des Règles Métier)

**Source :** Platform Bible · Tome 14.10

## Vision

Moteur central des règles métier. Contient TOUTES les règles. Aucun module n'implémente directement ses propres règles métier. Tous interrogent le Rules Engine avant d'exécuter une action.

## Catégories de règles

- **Inscription** : compte vérifié avant certaines actions, documents obligatoires, profil complet avant publication
- **Projet** : propriétaire obligatoire, identifiant unique, Cockpit auto
- **Missions** : une mission = un projet, un responsable, pas de clôture si tâches incomplètes
- **Appels d'Offres** : client recrute uniquement Bureau d'Architecture, coordinateur intègre les autres, catégorie doit correspondre
- **Documentaires** : document expiré non utilisable, versions accessibles, permissions respectées
- **Marketplace** : infos obligatoires avant publication, garantie associée, commande liée au projet
- **Passeport Numérique** : actif identifié uniquement, garanties rattachées, historique conservé

## Flow d'évaluation

```
Module demande une action
  → Rules Engine vérifie : permissions, rôle, statut projet, prérequis, validations
  → Résultat : Autorisé ou Refusé + justification

Si refusé :
  → Règle concernée
  → Raison du blocage
  → Actions pour débloquer
  → Affichable à l'utilisateur
  → Utilisable par KAI pour expliquer
```

## Ce qui N'EST PAS une règle métier

- Vérification format email
- Longueur maximale d'un champ
- Présence champ obligatoire dans formulaire
- Contraintes techniques interface

→ Ces validations restent dans les interfaces/services techniques.

## Interactions

- **Workflow Engine** : avant chaque transition → consultation Rules Engine → Autorisé/Refusé
- **KAI** : consulte pour expliquer refus, indiquer prérequis, guider utilisateur. Ne crée/modifie jamais de règle.
- **APIs** : interrogent le Rules Engine → même résultat partout (web, mobile, partenaire)

## Historique des règles

Règles versionnées, documentées, datées, auteur identifié. Anciennes versions conservées pour comprendre décisions passées.
