import prisma from '../db.js'

export const addWorkoutItem = async (req, res, next) => {
  try {
    const workoutId = req.params.id
    const { exerciseId, sets, reps, weight, restTime, order } = req.body
    const userId = req.user.userId

    const workout = await prisma.workout.findFirst({
      where: { id: workoutId, client: { userId } },
    })
    if (!workout) {
      return res.status(404).json({ error: 'Rutina no encontrada o sin permisos' })
    }

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

export const updateWorkoutItem = async (req, res, next) => {
  try {
    const { id: workoutId, itemId } = req.params
    const { sets, reps, weight, restTime, order } = req.body
    const userId = req.user.userId

    const workout = await prisma.workout.findFirst({
      where: { id: workoutId, client: { userId } },
    })
    if (!workout) {
      return res.status(404).json({ error: 'Rutina no encontrada o sin permisos' })
    }

    const existingItem = await prisma.workoutItem.findFirst({
      where: { id: itemId, workoutId },
    })
    if (!existingItem) {
      return res.status(404).json({ error: 'Ítem no encontrado o sin permisos' })
    }

    const updatedItem = await prisma.workoutItem.update({
      where: { id: itemId },
      data: { sets, reps, weight, restTime, order },
      include: { exercise: true },
    })

    return res.status(200).json(updatedItem)
  } catch (error) {
    return next(error)
  }
}

export const deleteWorkoutItem = async (req, res, next) => {
  try {
    const { id: workoutId, itemId } = req.params
    const userId = req.user.userId

    const workout = await prisma.workout.findFirst({
      where: { id: workoutId, client: { userId } },
    })
    if (!workout) {
      return res.status(404).json({ error: 'Rutina no encontrada o sin permisos' })
    }

    const existingItem = await prisma.workoutItem.findFirst({
      where: { id: itemId, workoutId },
    })
    if (!existingItem) {
      return res.status(404).json({ error: 'Ítem no encontrado o sin permisos' })
    }

    await prisma.workoutItem.delete({ where: { id: itemId } })

    return res.status(200).json({ message: 'Ejercicio eliminado de la rutina' })
  } catch (error) {
    return next(error)
  }
}