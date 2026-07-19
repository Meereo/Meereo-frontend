# MEEREO — Routes API

Base URL: `/api`

## Auth
| Methode | Route | Description |
|---------|-------|-------------|
| POST | /auth/register | Inscription (client, pro, fournisseur) |
| POST | /auth/login | Connexion (JWT cookie) |
| GET | /auth/me | Utilisateur connecte |
| POST | /auth/logout | Deconnexion |
| POST | /auth/forgot-password | Demande de reset |
| POST | /auth/reset-password | Reset avec token |

## Users
| Methode | Route | Description |
|---------|-------|-------------|
| GET | /users/pros | Annuaire des professionnels |
| GET | /users/registered | Liste des utilisateurs inscrits |
| GET | /users/prefs | Preferences utilisateur |
| PUT | /users/prefs | Modifier preferences |
| GET | /users/onboarding | Donnees d'onboarding |
| PUT | /users/onboarding | Modifier onboarding |
| PATCH | /users/profile | Modifier profil |
| DELETE | /users/account | Supprimer compte |

## Projects
| Methode | Route | Description |
|---------|-------|-------------|
| GET | /projects | Projets de l'utilisateur (owner, client, member, supplier) |
| GET | /projects/:id | Detail d'un projet |
| POST | /projects | Creer un projet |
| PATCH | /projects/:id | Modifier un projet |
| DELETE | /projects/:id | Supprimer un projet |
| GET | /projects/:id/timeline | Chronologie du projet |

## Project Members
| Methode | Route | Description |
|---------|-------|-------------|
| GET | /project-members | Membres des projets de l'utilisateur |
| POST | /project-members | Ajouter un membre (invitation) |
| PATCH | /project-members/:id/respond | Accepter/refuser invitation |
| GET | /project-members/pending | Invitations en attente |
| DELETE | /project-members/:id | Retirer un membre |

## Appels d'Offres (AO)
| Methode | Route | Description |
|---------|-------|-------------|
| GET | /aos | Liste des AO |
| POST | /aos | Creer un AO |
| PATCH | /aos/:id | Modifier un AO |
| DELETE | /aos/:id | Supprimer un AO |

## Offres
| Methode | Route | Description |
|---------|-------|-------------|
| GET | /offers | Offres (soumises par pro, recues par client) |
| GET | /offers/compare/:aoId | Comparatif des offres pour un AO |
| POST | /offers | Soumettre une offre |
| PATCH | /offers/:id | Accepter/refuser (client) ou modifier (pro) |
| DELETE | /offers/:id | Supprimer une offre |

## Marches (Contracts)
| Methode | Route | Description |
|---------|-------|-------------|
| GET | /markets | Marches de l'utilisateur (client ou supplier) |
| GET | /markets/:id | Detail d'un marche |
| POST | /markets | Creer un marche |
| PATCH | /markets/:id | Modifier statut/avancement |

## Documents
| Methode | Route | Description |
|---------|-------|-------------|
| GET | /documents | Documents de l'utilisateur |
| GET | /documents/:id | Detail d'un document |
| POST | /documents/upload | Upload fichier (multipart, 50MB max) |
| POST | /documents | Creer document (URL existante) |
| PATCH | /documents/:id | Modifier metadata |
| DELETE | /documents/:id | Supprimer |
| GET | /documents/:id/versions | Historique des versions |
| POST | /documents/:id/new-version | Upload nouvelle version |

## Conversations & Messages
| Methode | Route | Description |
|---------|-------|-------------|
| GET | /conversations | Conversations de l'utilisateur |
| POST | /conversations | Creer conversation |
| GET | /conversations/:id/messages | Messages d'une conversation |
| POST | /conversations/:id/messages | Envoyer un message |
| PATCH | /conversations/:id/read | Marquer comme lu |

## Notifications
| Methode | Route | Description |
|---------|-------|-------------|
| GET | /notifications | Notifications de l'utilisateur |
| POST | /notifications | Creer une notification |
| PATCH | /notifications/:id/read | Marquer une notif comme lue |
| PATCH | /notifications/read-all | Tout marquer comme lu |

## Finance
| Methode | Route | Description |
|---------|-------|-------------|
| GET | /finance/budgets | Budgets |
| GET | /finance/expenses | Depenses |
| GET | /finance/invoices | Factures |
| GET | /finance/reports | Rapports financiers |
| GET | /transactions | Transactions |
| GET | /payment-requests | Demandes de paiement |
| POST | /payment-requests | Creer demande |
| PATCH | /payment-requests/:id | Repondre a une demande |

## Missions
| Methode | Route | Description |
|---------|-------|-------------|
| GET | /missions | Missions de l'utilisateur |
| POST | /missions | Creer une mission |
| PATCH | /missions/:id | Modifier |
| POST | /projects/:projectId/missions/activate | Activer missions d'un projet |

## Pro (profil public)
| Methode | Route | Description |
|---------|-------|-------------|
| GET | /pro/:identifier | Profil public (slug ou publicId) |
| PUT | /pro/page-sections | Sauvegarder page builder |
| GET | /pro/page-sections/me | Mes sections de page |
| POST | /pro/request-verification | Demander verification RCCM |

## Reviews
| Methode | Route | Description |
|---------|-------|-------------|
| GET | /reviews?targetId=xxx | Avis recus par un pro |
| POST | /reviews | Creer un avis (apres collaboration) |

## Autres
| Methode | Route | Description |
|---------|-------|-------------|
| GET/POST | /contacts | Carnet d'adresses |
| GET/POST | /tasks | Taches |
| GET/POST | /events | Evenements agenda |
| GET/POST | /decisions | Decisions projet |
| GET | /activities | Journal d'activites |
| GET/POST | /rapports | Rapports de chantier |
| GET/POST | /orders | Commandes marketplace |
| GET/POST | /products | Catalogue produits |
| POST | /admin/verify/:userId | Verification admin |
| GET/POST | /kai/* | Assistant KAI |
| GET/POST | /assets | Gestion d'actifs |
| GET/POST | /passports | Passeports projet |
