# MEEREO — Architecture technique

## Stack

| Couche | Technologie | Version |
|--------|-------------|---------|
| Frontend | React + Vite | 19.2 / 8.0 |
| Routing | React Router | 7.14 |
| Styling | TailwindCSS | 4.3 |
| Icons | Lucide React | 1.8 |
| Charts | Recharts | 2.15 |
| Animations | Framer Motion | 12.42 |
| DnD | dnd-kit | - |
| Backend | Express | 4.19 |
| ORM | Prisma | 5.22 |
| Database | PostgreSQL | 16 (Alpine) |
| Real-time | Socket.IO | 4.8 |
| Auth | JWT (jsonwebtoken) | 9.0 |
| Passwords | bcryptjs | 2.4 |
| Upload | Multer | 2.2 (50MB limit) |
| Email | Nodemailer | 9.0 |
| Security | Helmet + Rate Limit | 7.1 / 7.4 |
| Validation | Zod | - |
| Containerisation | Docker + Nginx | Alpine |

## Structure du projet

```
Meereo-frontend/
  web/                          <- Frontend React
    src/
      pages/
        client/                 <- Pages utilisateur client
        cockpit/                <- Pages utilisateur pro (ERP)
        supplier/               <- Pages fournisseur
        public/                 <- Pages publiques (landing, onboarding)
      components/
        shared/                 <- Composants reutilisables (FilePreview, Modal, NotifPanel...)
        layout/                 <- Sidebar, Topbar
        sections-builder/       <- Page builder pro
      hooks/                    <- useMeereoStore, useMergedData, useDevise...
      services/api/client.js    <- Toutes les API calls frontend
      domain/                   <- Logique metier (status, permissions, fintech, events)
      data/                     <- Donnees statiques (legacy)
      design/                   <- Design system components
      utils/                    <- Helpers (export, upload, format)
    public/                     <- Assets statiques
    index.html                  <- Point d'entree
    vite.config.js

  server/                       <- Backend Express
    src/
      index.js                  <- Point d'entree, middlewares, routes
      routes/                   <- 33 fichiers de routes
      middleware/                <- auth.js, errorHandler.js
      socket.js                 <- Socket.IO setup + handlers
      db.js                     <- Connexion Prisma
      engines/                  <- Event engine, match engine
    prisma/
      schema.prisma             <- 45 modeles
    uploads/                    <- Fichiers uploades (documents/)

  deploy/                       <- Config Nginx (prod, dev)
  docker-compose.yml            <- Orchestration (postgres, api, web, nginx, certbot)
```

## Authentification

- JWT (30 jours) stocke en cookie httpOnly secure
- Middleware `requireAuth` sur toutes les routes protegees
- Rate limiting: 20 requetes / 15 min sur login
- Passwords hashes avec bcryptjs (12 rounds)

## Real-time (Socket.IO)

- Auth par JWT dans le handshake
- Rooms: `user:{userId}`, `conv:{conversationId}`
- Events emis: `message:new`, `conversation:updated`, `notification:new`, `event:new`
- Transport: WebSocket + polling fallback

## Upload de fichiers

- Route: `POST /api/documents/upload` (Multer, 50MB max)
- Stockage: `/uploads/documents/{subfolder}/{filename}`
- Servi via Express static
- Fallback base64 si serveur indisponible

## Modeles Prisma (45)

### Utilisateurs
User, ClientProfile, ProProfile, FournisseurProfile, Review, PasswordResetToken

### Projets
Project, ProjectMember, Task, Event, Document, Decision, Contact, Mission

### Marketplace
Product, Order, AO (Appel d'Offres), Offer, Market

### Communication
Conversation, ConversationParticipant, Message, Notification, Activity

### Finance
Budget, Expense, Invoice, PaymentOrder, Report, Transaction, Commission, PaymentRequest

### KAI (IA)
KaiEntitlement, KaiConversation, KaiMemory

### Avance
Asset, Passport, MissionTemplate, MilestoneTemplate, TaskTemplate, ProjectMission, ProjectMilestone, ProjectTask, KnowledgeNode, KnowledgeEdge, Introduction
