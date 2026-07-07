# KAI — Intelligence Artificielle de MEEREO

**Source :** Platform Bible · Tome 19 / PRD · Extension Architecture de KAI

## Vision

Système d'intelligence artificielle natif. Pas un chatbot. Ensemble coordonné d'agents spécialisés. Couche d'assistance intelligente qui n'est ni moteur métier, ni base de données, ni décideur.

## Les 4 rôles de KAI

1. **Assistant** : répond aux questions, explique fonctionnalités, retrouve informations
2. **Coordinateur** : surveille avancement, détecte retards/blocages, propose prochaines étapes
3. **Automatisation** : prépare tâches répétitives (dossiers AO, classement documents, etc.)
4. **Intelligence décisionnelle** : analyse données, recommandations argumentées

## Agents spécialisés

| Agent | Rôle |
|-------|------|
| Conversation | Gère échanges, comprend intentions, distribue aux autres agents |
| Projet | Analyse projets, suit workflows, détecte retards, propose étapes |
| Documents | Comprend documents, recherche infos, prépare dossiers, détecte manquants |
| CRM | Analyse relations, collaborations passées, suggère partenaires |
| Marketplace | Recherche produits, propose alternatives, relie produits aux actifs |
| Workflow | Explique étapes, détecte blocages, guide utilisateurs |
| Recherche | Interroge Knowledge Graph, Business Objects, Documents, Conversations |
| Passeport Numérique | Retrouve garanties, historiques, interventions, actifs |
| Entreprise | Prépare réponses AO, présentations, dossiers commerciaux |
| Client | Explique projets, traduit vocabulaire technique, présente décisions |
| Fournisseur | Analyse produits, commandes, catalogues, fiches techniques |

## Orchestration

AI Orchestrator du MEEREO Core coordonne les agents. Exemple :
```
Question : "Quel bureau d'études structure me recommandes-tu ?"
  → Orchestrateur sollicite : Agent Projet + Agent CRM + Agent Recherche + Agent Workflow
  → Résultats fusionnés → Réponse unique produite
```

## Mémoire

- Mémoire de conversation (échange en cours)
- Mémoire de projet (projet actif)
- Mémoire documentaire (documents autorisés)
- Mémoire relationnelle (CRM + Knowledge Graph)
- Mémoire de plateforme (connaissances générales MEEREO)

## Limites absolues

KAI ne peut JAMAIS :
- Signer un contrat
- Engager une entreprise
- Attribuer définitivement un marché
- Modifier les règles métier
- Changer un workflow
- Valider une étape à la place d'un utilisateur
- Contourner les permissions

## Flow d'interaction

```
Utilisateur pose question / action déclenche KAI
  → AI Orchestrator vérifie permissions
  → Prépare contexte (qui, quel rôle, quel projet, quelle mission, quels droits)
  → Transmet aux agents concernés uniquement données autorisées
  → Agents analysent et produisent recommandations
  → Réponse contextualisée et explicable
  → Toute action KAI journalisée (date, contexte, recommandation, décision utilisateur, résultat)
```

## Gouvernance

- Toutes recommandations explicables (pourquoi, quelles données, quelles conséquences)
- Recommandations jamais opaques
- Toutes actions KAI historisées
- KAI ne dialogue jamais directement avec les bases de données (tout passe par AI Orchestrator)
