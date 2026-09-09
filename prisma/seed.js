import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const baseExercises = [
  // Pecho
  {
    name: 'Press de Banca con Barra',
    description: 'Empuje horizontal acostado en banco plano enfocado en pectoral mayor.',
    category: 'Pecho',
    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
  },
  {
    name: 'Press Inclinado con Mancuernas',
    description: 'Enfocado en la porción clavicular (superior) del pecho.',
    category: 'Pecho',
    videoUrl: 'https://www.youtube.com/watch?v=8iPEnn-ltC8',
  },
  {
    name: 'Aperturas en Polea Alta (Crossover)',
    description: 'Aislamiento para la parte inferior y media del pectoral.',
    category: 'Pecho',
    videoUrl: 'https://www.youtube.com/watch?v=taI4XduLpTk',
  },
  {
    name: 'Fondos en Paralelas (Dips)',
    description: 'Ejercicio autocarga con énfasis en la parte inferior del pecho y tríceps.',
    category: 'Pecho',
    videoUrl: 'https://www.youtube.com/watch?v=2z8JmcrW-As',
  },

  // Espalda
  {
    name: 'Dominadas Pronadas',
    description: 'Tracción vertical para desarrollo de dorsal ancho.',
    category: 'Espalda',
    videoUrl: 'https://www.youtube.com/watch?v=eGo4IYlbE5g',
  },
  {
    name: 'Remo con Barra',
    description: 'Tracción horizontal enfocada en densidad de la espalda alta y trapecios.',
    category: 'Espalda',
    videoUrl: 'https://www.youtube.com/watch?v=VKFeB7jy8eE',
  },
  {
    name: 'Jalón al Pecho',
    description: 'Tracción vertical asistida ideal para hipertrofia de dorsales.',
    category: 'Espalda',
    videoUrl: 'https://www.youtube.com/watch?v=CAwf7n6Luuc',
  },
  {
    name: 'Remo Gironda (Poléa Baja)',
    description: 'Remo sentado con agarre estrecho para trabajo de zona media de la espalda.',
    category: 'Espalda',
    videoUrl: 'https://www.youtube.com/watch?v=GZbfZ033f74',
  },

  // Pierna
  {
    name: 'Sentadilla Trasera con Barra',
    description: 'Ejercicio multiarticular rey para cuadriceps y glúteos.',
    category: 'Piernas',
    videoUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8',
  },
  {
    name: 'Prensa de Piernas 45°',
    description: 'Trabajo pesado analítico para cuádriceps sin carga axial en la columna.',
    category: 'Piernas',
    videoUrl: 'https://www.youtube.com/watch?v=IZxyjWCY3lU',
  },
  {
    name: 'Peso Muerto Rumano',
    description: 'Enfocado en la cadena posterior (isquiotibiales y glúteos).',
    category: 'Piernas',
    videoUrl: 'https://www.youtube.com/watch?v=JCXUYuzwNrM',
  },
  {
    name: 'Zancadas Caminando con Mancuernas',
    description: 'Trabajo unilateral para estabilidad de rodilla, cuádriceps y glúteo.',
    category: 'Piernas',
    videoUrl: 'https://www.youtube.com/watch?v=D7KaRcUTQeE',
  },
  {
    name: 'Elevación de Talones de Pie',
    description: 'Aislamiento para los gemelos (gastrocnemio).',
    category: 'Piernas',
    videoUrl: 'https://www.youtube.com/watch?v=ym_KTo_tP88',
  },

  // Hombros
  {
    name: 'Press Militar con Barra',
    description: 'Empuje vertical overhead para deltoides anterior y triceps.',
    category: 'Hombros',
    videoUrl: 'https://www.youtube.com/watch?v=2yjwXTZQDDI',
  },
  {
    name: 'Elevaciones Laterales con Mancuernas',
    description: 'Aislamiento específico para la cabeza lateral del deltoides.',
    category: 'Hombros',
    videoUrl: 'https://www.youtube.com/watch?v=3VcKaXpzqRo',
  },
  {
    name: 'Pájaro con Mancuernas (Face Pull)',
    description: 'Enfocado en deltoides posterior y manguito rotador.',
    category: 'Hombros',
    videoUrl: 'https://www.youtube.com/watch?v=rep-qVOkqgk',
  },

  // Brazos (Bíceps / Tríceps)
  {
    name: 'Curl de Bíceps con Barra Z',
    description: 'Ejercicio clásico para masa general en bíceps braquial.',
    category: 'Brazos',
    videoUrl: 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
  },
  {
    name: 'Curl Martillo con Mancuernas',
    description: 'Énfasis en el supinador largo y braquial anterior.',
    category: 'Brazos',
    videoUrl: 'https://www.youtube.com/watch?v=zC3nLlEvin4',
  },
  {
    name: 'Extensiones de Tríceps en Polea Alta',
    description: 'Aislamiento para las cabezas lateral y media del tríceps.',
    category: 'Brazos',
    videoUrl: 'https://www.youtube.com/watch?v=2-LAMcpzODU',
  },
  {
    name: 'Press Francés con Barra Z',
    description: 'Aislamiento para la cabeza larga del tríceps acostado en banco.',
    category: 'Brazos',
    videoUrl: 'https://www.youtube.com/watch?v=d_KZxkY_0cM',
  },

  // Core / Abdomen
  {
    name: 'Plancha Abdominal Isométrica',
    description: 'Trabajo de estabilidad e integración del core.',
    category: 'Core',
    videoUrl: 'https://www.youtube.com/watch?v=pSHjTRCQxIw',
  },
  {
    name: 'Rueda Abdominal (Ab Wheel Rollout)',
    description: 'Ejercicio avanzado de anti-extensión lumbar.',
    category: 'Core',
    videoUrl: 'https://www.youtube.com/watch?v=rqiTPdK1c_I',
  }
];

async function main() {
  console.log('🌱 Iniciando la siembra de datos (Seeding)...');

  // Buscar el primer usuario existente en la BD
  const user = await prisma.user.findFirst();

  if (!user) {
    console.error('❌ Error: No existe ningún usuario en la BD. Registra un usuario antes de ejecutar el seed.');
    process.exit(1);
  }

  console.log(`👤 Asignando ejercicios base al usuario: ${user.email} (${user.id})`);

  let createdCount = 0;

  for (const exercise of baseExercises) {
    const existing = await prisma.exercise.findFirst({
      where: {
        name: exercise.name,
        userId: user.id,
      },
    });

    if (!existing) {
      await prisma.exercise.create({
        data: {
          ...exercise,
          userId: user.id,
        },
      });
      createdCount++;
    }
  }

  console.log(`✅ ¡Seeding completado! Se agregaron ${createdCount} ejercicios nuevos.`);
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });