FROM node:20-alpine

# OpenSSL required by Prisma on Alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Install ALL deps (including prisma CLI for generate)
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Prune dev dependencies
RUN npm prune --omit=dev

# Ensure uploads directory exists
RUN mkdir -p uploads/documents

EXPOSE 3001

CMD ["node", "src/index.js"]
