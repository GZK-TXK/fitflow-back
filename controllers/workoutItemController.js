import prisma from '../db.js'

export const addWorkoutItem = async (req, res, next) => {
  try {
    const workoutId = req.params.id
    const { exerciseId, sets, reps, weight, restTime, order } = req.body
    const userId = req.user.userId

    // La rutina debe pertenecer a un cliente del entrenador autenticado
    const workout = await prisma.workout.findFirst({
      where: { id: workoutId, client: { userId } },
    })
    if (!workout) {
      return res.status(404).json({ error: 'Rutina no encontrada o sin permisos' })
    }

    // El ejercicio también debe pertenecer al entrenador autenticado
    const exercise = await prisma.exercise.findFirst({
      where: { id: exerciseId, userId },
    })
    if (!exercise) {
      return res.status(404).json({ error: 'Ejercicio no encontrado o sin permisos' })
    }

    const newItem = await prisma.workoutItem.create({
      data: {
        workoutId,
        exerciseId,
        sets: sets ?? 3,
        reps: reps ?? 10,
        weight: weight ?? null,
        restTime: restTime ?? 60,
        order: order ?? 0,
      },
      include: { exercise: true },
    })

    return res.status(201).json(newItem)
  } catch (error) {
    return next(error)
  }
}