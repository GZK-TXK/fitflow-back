import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Añadir un ejercicio (WorkoutItem) a una rutina existente
export const addWorkoutItem = async (req, res) => {
  try {
    const { workoutId, exerciseId, sets, reps, weight, restTime, order } = req.body;
    const userId = req.user.userId;

    if (!workoutId || !exerciseId) {
      return res.status(400).json({ error: 'workoutId y exerciseId son obligatorios' });
    }

    // Validar que la rutina pertenece a un cliente del entrenador autenticado
    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        client: { userId },
      },
    });

    if (!workout) {
      return res.status(404).json({ error: 'Rutina no encontrada o sin permisos' });
    }

    // Crear el ítem asociado
    const newItem = await prisma.workoutItem.create({
      data: {
        workoutId,
        exerciseId,
        sets: sets ? Number(sets) : 3,
        reps: reps ? Number(reps) : 10,
        weight: weight ? Number(weight) : null,
        restTime: restTime ? Number(restTime) : 60,
        order: order ? Number(order) : 0,
      },
      include: {
        exercise: true,
      },
    });

    return res.status(201).json(newItem);
  } catch (error) {
    console.error('Error al añadir ítem a la rutina:', error);
    return res.status(500).json({ error: 'Error al añadir el ejercicio a la rutina' });
  }
};