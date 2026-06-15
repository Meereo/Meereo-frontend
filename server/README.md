# Meereo — Backend API

Express + Prisma + PostgreSQL

## Prérequis

- Node.js ≥ 18
- PostgreSQL (local ou Docker)

## Installation

```bash
cd server
npm install
cp .env.example .env
# Éditez .env avec vos valeurs (DATABASE_URL, JWT_SECRET, etc.)
```

## Base de données

### Démarrer PostgreSQL (Docker)

```bash
docker run -d \
  --name meereo-postgres \
  -e POSTGRES_USER=meereo \
  -e POSTGRES_PASSWORD=meereo2026 \
  -e POSTGRES_DB=meereo \
  -p 5432:5432 \
  postgres:16-alpine
```

### Appliquer le schéma

```bash
# Première fois (crée les tables)
npm run db:push

# Ou avec migrations versionnées
npm run db:migrate
```

## Lancement

```bash
# Développement (nodemon)
npm run dev

# Production
npm start
```

L'API écoute sur `http://localhost:3001` par défaut.

## Endpoints d'authentification

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| POST | `/api/auth/register` | — | Inscription (pro / client / fournisseur) |
| POST | `/api/auth/login` | — | Connexion |
| GET | `/api/auth/me` | ✅ JWT | Profil courant |
| POST | `/api/auth/change-password` | ✅ JWT | Changer le mot de passe |
| POST | `/api/auth/send-verification` | ✅ JWT | Envoyer l'email de vérification |
| POST | `/api/auth/verify-email` | — | Vérifier l'email |
| POST | `/api/auth/forgot-password` | — | Demande de réinitialisation MDP |
| POST | `/api/auth/reset-password` | — | Réinitialiser le MDP via token |
| DELETE | `/api/auth/account` | ✅ JWT | Supprimer le compte |
| GET | `/health` | — | Health check |

## Payload d'inscription

### Champs communs (tous types)

```json
{
  "email": "contact@structure.ci",
  "password": "motdepasse123",
  "name": "Traoré Architecture",
  "type": "pro",
  "company": "Traoré Architecture & Design",
  "phone": "+225 07 00 00 00 00",
  "metier": "Architecture & Design",
  "ville": "Abidjan"
}
```

### Champs supplémentaires — Client

```json
{
  "type": "client",
  "prenom": "Sékou",
  "nom": "Traoré",
  "civilite": "Monsieur",
  "projectType": "Villa / Maison",
  "location": "Cocody, Abidjan",
  "budget": "150000000",
  "situation": "Je n'ai pas encore d'architecte"
}
```

### Champs supplémentaires — Pro

```json
{
  "type": "pro",
  "entreprise": "Traoré Architecture & Design",
  "secteurs": ["Architecture & Design", "Gros Œuvre & Génie Civil"],
  "services": ["Plans & permis de construire", "Maîtrise d'œuvre"],
  "rccm": "CI-ABJ-2024-B-12345",
  "ncc": "CI1234567A",
  "bio": "Cabinet d'architecture fondé en 2018...",
  "slogan": "Construire l'avenir, un projet à la fois"
}
```

### Champs supplémentaires — Fournisseur

```json
{
  "type": "fournisseur",
  "entreprise": "Matériaux Pro CI",
  "categories": ["Gros Œuvre", "Structure & Charpente"],
  "zones": ["Cocody", "Plateau", "Marcory"],
  "delaiLivraison": "24-48h",
  "products": [
    { "name": "Ciment Portland 50kg", "price": "8500", "unit": "/sac", "category": "Gros Œuvre" }
  ]
}
```

## Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion PostgreSQL | `postgresql://user:pwd@localhost:5432/meereo` |
| `JWT_SECRET` | Clé secrète JWT (≥ 32 chars) | `change-me-in-production...` |
| `JWT_EXPIRES_IN` | Durée de validité du token | `30d` |
| `BCRYPT_ROUNDS` | Facteur de coût bcrypt | `12` |
| `PORT` | Port du serveur | `3001` |
| `ALLOWED_ORIGIN` | Origine(s) CORS autorisée(s) | `http://localhost:5173` |
| `RESET_TOKEN_EXPIRES_MIN` | Durée token reset MDP (min) | `60` |
