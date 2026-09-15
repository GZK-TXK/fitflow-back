import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEMO_DOMAIN = 'demo.fitflow.app'
const DEMO_PASSWORD = 'Demo1234'

const trainer = {
  name: 'Entrenador Demo',
  email: `demoentrenador@${DEMO_DOMAIN}`,
  phone: '+34 600 000 001',
}

const demoClient = {
  name: 'Cliente Demo',
  email: `democliente@${DEMO_DOMAIN}`,
  phone: '+34 600 000 002',
}

const extraClients = [
  { name: 'Laura Gómez', email: `laura.gomez@${DEMO_DOMAIN}`, phone: '+34 600 000 003' },
  { name: 'Sergio Díaz', email: `sergio.diaz@${DEMO_DOMAIN}`, phone: '+34 600 000 004' },
  { name: 'Marta Ruiz', email: `marta.ruiz@${DEMO_DOMAIN}`, phone: '+34 600 000 005' },
]

const baseExercises = [
  // Pecho
  { name: 'Press de Banca con Barra', description: 'Empuje horizontal acostado en banco plano enfocado en pectoral mayor.', category: 'Pecho', videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg' },
  { name: 'Press Inclinado con Mancuernas', description: 'Enfocado en la porción clavicular (superior) del pecho.', category: 'Pecho', videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8' },
  { name: 'Aperturas en Polea Alta (Crossover)', description: 'Aislamiento para la parte inferior y media del pectoral.', category: 'Pecho', videoUrl: 'https://www.youtube.com/watch?v=taI4XduLpTk' },
  { name: 'Fondos en Paralelas (Dips)', description: 'Ejercicio autocarga con énfasis en la parte inferior del pecho y tríceps.', category: 'Pecho', videoUrl: 'https://www.youtube.com/watch?v=2z8JmcrW-As' },

  // Espalda
  { name: 'Dominadas Pronadas', description: 'Tracción vertical para desarrollo de dorsal ancho.', category: 'Espalda', videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g' },
  { name: 'Remo con Barra', description: 'Tracción horizontal enfocada en densidad de la espalda alta y trapecios.', category: 'Espalda', videoUrl: 'https://www.youtube.com/watch?v=VKFeB7jy8eE' },
  { name: 'Jalón al Pecho', description: 'Tracción vertical asistida ideal para hipertrofia de dorsales.', category: 'Espalda', videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc' },
  { name: 'Remo Gironda (Polea Baja)', description: 'Remo sentado con agarre estrecho para trabajo de zona media de la espalda.', category: 'Espalda', videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74' },
  { name: 'Pull-over con Mancuerna', description: 'Aislamiento del dorsal ancho y serrato.', category: 'Espalda', videoUrl: 'https://www.youtube.com/watch?v=FK4rHfWKEac' },

  // Piernas
  { name: 'Sentadilla Trasera con Barra', description: 'Ejercicio multiarticular rey para cuádriceps y glúteos.', category: 'Piernas', videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8' },
  { name: 'Prensa de Piernas 45°', description: 'Trabajo pesado analítico para cuádriceps sin carga axial en la columna.', category: 'Piernas', videoUrl: 'https://www.youtube.com/watch?v=IZxyjWCY3lU' },
  { name: 'Peso Muerto Rumano', description: 'Enfocado en la cadena posterior (isquiotibiales y glúteos).', category: 'Piernas', videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM' },
  { name: 'Zancadas Caminando con Mancuernas', description: 'Trabajo unilateral para estabilidad de rodilla, cuádriceps y glúteo.', category: 'Piernas', videoUrl: 'https://www.youtube.com/watch?v=D7KaRcUTQeE' },
  { name: 'Elevación de Talones de Pie', description: 'Aislamiento para los gemelos (gastrocnemio).', category: 'Piernas', videoUrl: 'https://www.youtube.com/watch?v=ym_KTo_tP88' },
  { name: 'Hip Thrust con Barra', description: 'Empuje de cadera para glúteo mayor.', category: 'Piernas', videoUrl: 'https://www.youtube.com/watch?v=xDmFkJxRWaY' },
  { name: 'Curl Femoral Tumbado', description: 'Aislamiento de isquiotibiales.', category: 'Piernas', videoUrl: 'https://www.youtube.com/watch?v=1Tq3QdYUuHs' },
  { name: 'Extensión de Cuádriceps', description: 'Aislamiento analítico de cuádriceps.', category: 'Piernas', videoUrl: 'https://www.youtube.com/watch?v=YyvSfVjQeL0' },

  // Hombros
  { name: 'Press Militar con Barra', description: 'Empuje vertical overhead para deltoides anterior y tríceps.', category: 'Hombros', videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI' },
  { name: 'Elevaciones Laterales con Mancuernas', description: 'Aislamiento específico para la cabeza lateral del deltoides.', category: 'Hombros', videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo' },
  { name: 'Pájaro con Mancuernas (Face Pull)', description: 'Enfocado en deltoides posterior y manguito rotador.', category: 'Hombros', videoUrl: 'https://www.youtube.com/watch?v=rep-qVOkqgk' },
  { name: 'Elevaciones Frontales con Mancuerna', description: 'Aislamiento del deltoides anterior.', category: 'Hombros', videoUrl: 'https://www.youtube.com/watch?v=3ml7BH7mNwQ' },
  { name: 'Remo al Mentón con Barra Z', description: 'Deltoides lateral y trapecio superior.', category: 'Hombros', videoUrl: 'https://www.youtube.com/watch?v=6VL0FhUqC8Y' },

  // Brazos
  { name: 'Curl de Bíceps con Barra Z', description: 'Ejercicio clásico para masa general en bíceps braquial.', category: 'Brazos', videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo' },
  { name: 'Curl Martillo con Mancuernas', description: 'Énfasis en el supinador largo y braquial anterior.', category: 'Brazos', videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4' },
  { name: 'Extensiones de Tríceps en Polea Alta', description: 'Aislamiento para las cabezas lateral y media del tríceps.', category: 'Brazos', videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU' },
  { name: 'Press Francés con Barra Z', description: 'Aislamiento para la cabeza larga del tríceps acostado en banco.', category: 'Brazos', videoUrl: 'https://www.youtube.com/watch?v=d_KZxkY_0cM' },
  { name: 'Curl de Bíceps Predicador', description: 'Aislamiento del bíceps con banco Scott.', category: 'Brazos', videoUrl: 'https://www.youtube.com/watch?v=fIWP-FRFNU0' },

  // Core
  { name: 'Plancha Abdominal Isométrica', description: 'Trabajo de estabilidad e integración del core.', category: 'Core', videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw' },
  { name: 'Rueda Abdominal (Ab Wheel Rollout)', description: 'Ejercicio avanzado de anti-extensión lumbar.', category: 'Core', videoUrl: 'https://www.youtube.com/watch?v=rqiTPdK1c_I' },
  { name: 'Crunch en Polea Alta', description: 'Flexión de tronco con carga constante.', category: 'Core', videoUrl: 'https://www.youtube.com/watch?v=2fbujeH3F0E' },
  { name: 'Plancha Lateral', description: 'Estabilidad anti-inclinación lateral.', category: 'Core', videoUrl: 'https://www.youtube.com/watch?v=K2VljzCC16g' },
]

const workoutTemplates = [
  {
    title: 'Full Body A',
    description: 'Sesión de cuerpo completo (A)',
    exerciseNames: ['Sentadilla Trasera con Barra', 'Press de Banca con Barra', 'Remo con Barra', 'Press Militar con Barra', 'Plancha Abdominal Isométrica'],
  },
  {
    title: 'Full Body B',
    description: 'Sesión de cuerpo completo (B)',
    exerciseNames: ['Peso Muerto Rumano', 'Press Inclinado con Mancuernas', 'Jalón al Pecho', 'Elevaciones Laterales con Mancuernas', 'Rueda Abdominal (Ab Wheel Rollout)'],
  },
  {
    title: 'Tren Superior',
    description: 'Empuje y tracción',
    exerciseNames: ['Press de Banca con Barra', 'Dominadas Pronadas', 'Press Militar con Barra', 'Curl de Bíceps con Barra Z', 'Extensiones de Tríceps en Polea Alta'],
  },
  {
    title: 'Pierna y Glúteo',
    description: 'Enfoque tren inferior',
    exerciseNames: ['Sentadilla Trasera con Barra', 'Hip Thrust con Barra', 'Peso Muerto Rumano', 'Zancadas Caminando con Mancuernas', 'Elevación de Talones de Pie'],
  },
]

const scheduleWeekdays = [1, 3, 5] // lunes, miércoles, viernes
const scheduleTimes = ['09:00', '10:00', '18:00', '19:30']

const ensureTrainer = async (hashedPassword) =>
  prisma.user.upsert({
    where: { email: trainer.email },
    update: { name: trainer.name, phone: trainer.phone, role: 'TRAINER', status: 'ACTIVE' },
    create: {
      email: trainer.email,
      name: trainer.name,
      phone: trainer.phone,
      role: 'TRAINER',
      status: 'ACTIVE',
      password: hashedPassword,
    },
  })

const ensureExercises = async (trainerId) => {
  const exercisesByName = {}
  for (const ex of baseExercises) {
    let record = await prisma.exercise.findFirst({ where: { userId: trainerId, name: ex.name } })
    if (!record) {
      record = await prisma.exercise.create({ data: { ...ex, userId: trainerId } })
    }
    exercisesByName[ex.name] = record
  }
  return exercisesByName
}

const ensureClient = async ({ name, email, phone }, trainerId) => {
  let record = await prisma.client.findFirst({ where: { userId: trainerId, email } })
  if (!record) {
    record = await prisma.client.create({ data: { name, email, phone, userId: trainerId } })
  }
  return record
}

const ensureClientAccount = async (client, { name, email }, hashedPassword) => {
  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role: 'CLIENT', status: 'ACTIVE' },
    create: { email, name, role: 'CLIENT', status: 'ACTIVE', password: hashedPassword },
  })
  if (client.accountUserId !== user.id) {
    await prisma.client.update({
      where: { id: client.id },
      data: { accountUserId: user.id },
    })
  }
  return user
}

const ensureWorkouts = async (clientId, templates, exercisesByName) => {
  const workouts = []
  for (const tpl of templates) {
    let workout = await prisma.workout.findFirst({ where: { clientId, title: tpl.title } })
    if (!workout) {
      workout = await prisma.workout.create({
        data: { title: tpl.title, description: tpl.description, clientId },
      })
    }

    const itemsCount = await prisma.workoutItem.count({ where: { workoutId: workout.id } })
    if (itemsCount === 0) {
      const items = tpl.exerciseNames
        .map((name) => exercisesByName[name])
        .filter(Boolean)
        .map((exercise, index) => ({
          workoutId: workout.id,
          exerciseId: exercise.id,
          sets: 3 + (index % 2),
          reps: [10, 12, 8, 15][index % 4],
          weight: null,
          restTime: 60 + (index % 3) * 15,
          order: index,
        }))
      if (items.length > 0) {
        await prisma.workoutItem.createMany({ data: items })
      }
    }

    workouts.push(workout)
  }
  return workouts
}

const ensureSchedule = async (clientId, workouts) => {
  if (!workouts || workouts.length === 0) return 0

  const existing = await prisma.scheduledWorkout.count({ where: { clientId } })
  if (existing > 0) return 0

  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14)
  const totalDays = 42 // 2 semanas atrás + 4 adelante
  let created = 0

  for (let offset = 0; offset < totalDays; offset++) {
    const day = new Date(start)
    day.setDate(start.getDate() + offset)

    if (!scheduleWeekdays.includes(day.getDay())) continue

    const time = scheduleTimes[offset % scheduleTimes.length]
    const [hours, minutes] = time.split(':').map(Number)
    const when = new Date(day)
    when.setHours(hours, minutes, 0, 0)

    const workout = workouts[offset % workouts.length]

    await prisma.scheduledWorkout.create({
      data: { clientId, workoutId: workout.id, date: when },
    })
    created++
  }

  return created
}

async function main() {
  console.log('🌱 Creando datos de demo...')
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10)

  const trainerUser = await ensureTrainer(hashedPassword)
  const exercisesByName = await ensureExercises(trainerUser.id)

  // Cliente demo con acceso al portal
  const clientRecord = await ensureClient(demoClient, trainerUser.id)
  await ensureClientAccount(clientRecord, demoClient, hashedPassword)
  const clientWorkouts = await ensureWorkouts(clientRecord.id, workoutTemplates, exercisesByName)
  const scheduled = await ensureSchedule(clientRecord.id, clientWorkouts)

  // Clientes extra (sin acceso al portal)
  let extraWorkouts = 0
  for (let i = 0; i < extraClients.length; i++) {
    const extra = extraClients[i]
    const record = await ensureClient(extra, trainerUser.id)
    const templates = [
      workoutTemplates[i % workoutTemplates.length],
      workoutTemplates[(i + 1) % workoutTemplates.length],
    ]
    const workouts = await ensureWorkouts(record.id, templates, exercisesByName)
    extraWorkouts += workouts.length
  }

  console.log(`✅ Demo listo. Ejercicios: ${baseExercises.length}.`)
  console.log(`📅 Asignaciones de calendario nuevas: ${scheduled}. Rutinas de clientes extra: ${extraWorkouts}.`)
  console.log('')
  console.log('👨‍🏫 Entrenador demo:')
  console.log(`   Email:    ${trainer.email}`)
  console.log(`   Password: ${DEMO_PASSWORD}`)
  console.log('🧑‍💻 Cliente demo (con portal):')
  console.log(`   Email:    ${demoClient.email}`)
  console.log(`   Password: ${DEMO_PASSWORD}`)
}

main()
  .catch((e) => {
    console.error('❌ Error al crear los datos de demo:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
