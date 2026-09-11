import prisma from '../db.js'

export const getWorkouts = async (req, res, next) => {
  try {
    const userId = req.user.userId
    const workouts = await prisma.workout.findMany({
      where: { client: { userId } },
      include: {
        client: { select: { id: true, name: true, email: true } },
        items: { include: { exercise: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return res.status(200).json(workouts)
  } catch (error) {
    return next(error)
  }
}

export const getWorkoutById = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const workout = await prisma.workout.findFirst({
      where: { id, client: { userId } },
      include: {
        client: true,
        items: { include: { exercise: true }, orderBy: { order: 'asc' } },
      },
    })

    if (!workout) {
      return res.status(404).json({ error: 'Rutina no encontrada o sin permisos' })
    }
    return res.status(200).json(workout)
  } catch (error) {
    return next(error)
  }
}

export const createWorkout = async (req, res, next) => {
  try {
    const { title, description, clientId } = req.body
    const userId = req.user.userId

    const client = await prisma.client.findFirst({ where: { id: clientId, userId } })
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado o no pertenece a tu usuario' })
    }

    const newWorkout = await prisma.workout.create({
      data: {
        title,
        description,
        client: { connect: { id: clientId } },
      },
      include: { client: true },
    })
    return res.status(201).json(newWorkout)
  } catch (error) {
    return next(error)
  }
}

export const updateWorkout = async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, description } = req.body
    const userId = req.user.userId

    const existingWorkout = await prisma.workout.findFirst({
      where: { id, client: { userId } },
    })
    if (!existingWorkout) {
      return res.status(404).json({ error: 'Rutina no encontrada o sin permisos' })
    }

    const updatedWorkout = await prisma.workout.update({
      where: { id },
      data: { title, description },
    })
    return res.status(200).json(updatedWorkout)
  } catch (error) {
    return next(error)
  }
}

export const deleteWorkout = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const existingWorkout = await prisma.workout.findFirst({
      where: { id, client: { userId } },
    })
    if (!existingWorkout) {
      return res.status(404).json({ error: 'Rutina no encontrada o sin permisos' })
    }

    await prisma.workout.delete({ where: { id } })
    return res.status(200).json({ message: 'Rutina eliminada correctamente' })
  } catch (error) {
    return next(error)
  }
}