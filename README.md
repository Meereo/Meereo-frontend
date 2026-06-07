# MEEREO

**Plateforme multi-acteurs BTP & Immobilier — Côte d'Ivoire**

## Architecture

```
meereo-app/
├── web/                    # Frontend — Vite + React TSX + TailwindCSS
│   ├── src/
│   │   ├── pages/          # Pages par profil (client, cockpit, fournisseur)
│   │   ├── components/     # Composants partagés (KAI, Sidebar, Modal)
│   │   ├── hooks/          # Store Zustand-like, merged data, devises
│   │   ├── services/api/   # Client HTTP vers le backend
│   │   ├── domain/         # Logique métier (statuts, permissions, fintech)
│   │   ├── styles/         # CSS global + tokens
│   │   └── utils/          # Helpers (export, upload, format)
│   └── index.html
├── server/                 # Backend — Node.js + Express
│   ├── src/
│   │   ├── routes/         # CRUD, Auth, Upload, KAI
│   │   └── middleware/     # JWT auth
│   └── prisma/
│       └── schema.prisma   # 20+ modèles (PostgreSQL)
├── docker-compose.yml      # PostgreSQL + Redis + MinIO
└── README.md
```

## Démarrage rapide

### 1. Services Docker

```bash
docker compose up -d
```

### 2. Backend

```bash
cd server
cp .env.example .env
npm install
npx prisma db push
npm run dev
```

→ API sur `http://localhost:3001`

### 3. Frontend

```bash
cd web
npm install
npm run dev
```

→ App sur `http://localhost:5173`

## Profils

| Profil | Espace | Description |
|--------|--------|-------------|
| Client | `/client` | Pilotage projet, AO, offres, budget, suivi |
| Professionnel | `/cockpit` | Gestion chantiers, marchés, équipes |
| Fournisseur | `/fournisseur` | Catalogue, commandes, paiements |

## Stack

- **Frontend** : Vite, React 19, TypeScript, TailwindCSS v4, React Router, Lucide Icons
- **Backend** : Node.js, Express 5, Prisma ORM, JWT, bcrypt
- **Base de données** : PostgreSQL 16
- **Stockage** : MinIO (S3-compatible)
- **Cache** : Redis 7
