import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const result = await prisma.user.deleteMany({
    where: { email: { endsWith: '@demo.fitflow.app' } },
  })
  console.log(`🗑️  Eliminados ${result.count} usuarios demo (y sus datos en cascada).`)
}

main()
  .catch((e) => {
    console.error('❌ Error al limpiar los datos demo:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })