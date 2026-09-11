import prisma from '../db.js'

export const getStats = async (req, res, next) => {
  try {
    const [trainers, clients, exercises, workouts] = await Promise.all([
      prisma.user.count(),
      prisma.client.count(),
      prisma.exercise.count(),
      prisma.workout.count(),
    ])

    return res.json({ trainers, clients, exercises, workouts })
  } catch (error) {
    return next(error)
  }
}

export const getTrainers = async (req, res, next) => {
  try {
    const trainers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: { select: { clients: true, exercises: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.json(trainers)
  } catch (error) {
    return next(error)
  }
}

export const updateTrainerRole = async (req, res, next) => {
  try {
    const { id } = req.params
    const { role } = req.body

    if (id === req.user.userId) {
      return res.status(400).json({ error: 'No puedes cambiar tu propio rol' })
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    })

    return res.json({ id: user.id, email: user.email, name: user.name, role: user.role })
  } catch (error) {
    return next(error)
  }
}

export const deleteTrainer = async (req, res, next) => {
  try {
    const { id } = req.params

    if (id === req.user.userId) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' })
    }

    await prisma.user.delete({ where: { id } })

    return res.json({ message: 'Entrenador eliminado correctamente' })
  } catch (error) {
    return next(error)
  }
}