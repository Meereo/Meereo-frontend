const { PrismaClient } = require('@prisma/client')

// Singleton Prisma — évite de multiples connexions en dev (hot-reload)
let prisma

function getPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    })
  }
  return prisma
}

async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect()
    prisma = null
  }
}

module.exports = { getPrisma, disconnectPrisma }
