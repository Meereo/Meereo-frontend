# Communication Hub

**Source :** PRD · Tome 10

## Vision

Centre de communication officiel de toute la plateforme. Pas une simple messagerie : conversations historisées, contextualisées et reliées aux objets métier.

## Types de conversations

1. **Conversation libre** — Deux utilisateurs communiquent librement (ex: prise de contact depuis Page Pro). Pas de projet associé. Peut évoluer vers invitation/projet.

2. **Conversation Projet** — Créée automatiquement à la création du projet. Regroupe tous les intervenants autorisés. Échanges liés au projet, conservés dans historique.

3. **Conversation Mission** — Créée automatiquement par mission. Seules les entreprises concernées participent. Échanges associés à la mission.

4. **Conversation CRM** — Chaque fiche CRM possède historique de communication. Échanges commerciaux centralisés.

5. **Conversation Entreprise** — Messages reçus depuis Page Pro. Arrivée dans boîte de réception entreprise. Plusieurs collaborateurs peuvent consulter/traiter.

## Flow principal

```
CRÉATION AUTOMATIQUE :
  Création projet → conversation Projet auto
  Création mission → conversation Mission auto
  Invitation intervenant → fil de discussion auto

PRISE DE CONTACT :
  Visiteur sur Page Pro → clic "Contacter"
  → Conversation libre créée
  → Notification entreprise
  → KAI Entreprise peut : accueillir, répondre questions simples, proposer RDV, transférer

ÉCHANGES :
  Messages texte, pièces jointes, documents, photos, vidéos
  + Références vers : documents plateforme, missions, jalons, actifs, AO, commandes
  → Échanges toujours contextualisés

RECHERCHE :
  Par mot, entreprise, utilisateur, document, mission, commande, date
  → KAI : recherche langage naturel
```

## KAI dans le Communication Hub

- Notifier utilisateurs concernés
- Résumer automatiquement longue conversation
- Identifier décisions importantes
- Détecter actions à réaliser
- Proposer création tâche ou RDV
- Suggérer partage document
- Préparer réponse depuis contexte
- Traduire échanges si nécessaire

### Réponses automatiques KAI (si autorisé par l'entreprise)
- Demande présentation entreprise
- Demande brochure
- Demande horaires
- Demande prise de RDV
- Demande lien Page Pro
- Demande documentation commerciale

**Escalade :** KAI transfère automatiquement au collaborateur si demande dépasse son périmètre.

## Notifications

Chaque message peut générer : notification plateforme, notification mobile, notification email (selon préférences). Regroupées pour éviter surcharge.

## Événements générés

- `ConversationCreated`, `MessageSent`, `MessageRead`

## Règles métier

- Conversations privées restent privées
- Conversations Projet limitées aux intervenants autorisés
- Conversations Mission limitées aux responsables concernés
- Droits d'accès calculés selon projet, mission, rôle, permissions entreprise
- Toutes les conversations sont historisées
