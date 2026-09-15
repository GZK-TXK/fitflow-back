import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import readline from 'readline'

const prisma = new PrismaClient()

const DEFAULT_ADMIN_EMAIL = 'chocarrovaz.gaizka@gmail.com'

const args = process.argv.slice(2)
const yes = args.includes('--yes') || args.includes('-y')
const emailArg = args.find((arg) => !arg.startsWith('-'))
const ADMIN_EMAIL = (emailArg || process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL).toLowerCase()

const confirm = (question) =>
  new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
    rl.question(question, (answer) => {
      rl.close()
      resolve(/^y(es)?$/i.test(answer.trim()))
    })
  })

async function main() {
  console.log(`🔒 Email de admin protegido: ${ADMIN_EMAIL}`)

  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })
  if (!admin) {
    console.error(
      `❌ No existe ningún usuario con el email ${ADMIN_EMAIL}. Abortando sin borrar nada.`
    )
    process.exit(1)
  }

  const total = await prisma.user.count()
  const toDelete = await prisma.user.count({ where: { email: { not: ADMIN_EMAIL } } })
  const invitations = await prisma.invitation.count()

  console.log(`👥 Usuarios totales: ${total} · a eliminar: ${toDelete} · a conservar: 1`)
  console.log(`✉️  Invitaciones a eliminar: ${invitations}`)

  if (toDelete === 0 && invitations === 0) {
    console.log('✅ No hay nada que limpiar.')
    return
  }

  if (!yes) {
    const ok = await confirm('⚠️  Esta acción es IRREVERSIBLE. ¿Continuar? (y/N) ')
    if (!ok) {
      console.log('🚫 Cancelado.')
      return
    }
  }

  const deletedInvitations = await prisma.invitation.deleteMany({})
  const deletedUsers = await prisma.user.deleteMany({ where: { email: { not: ADMIN_EMAIL } } })

  console.log(`🗑️  Invitaciones eliminadas: ${deletedInvitations.count}`)
  console.log(`🗑️  Usuarios eliminados: ${deletedUsers.count} (y sus datos en cascada).`)
  console.log(`✅ Limpieza completada. Se conserva: ${ADMIN_EMAIL}`)
}

main()
  .catch((e) => {
    console.error('❌ Error al limpiar la base de datos:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
