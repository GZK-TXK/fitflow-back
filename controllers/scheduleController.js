import prisma from '../db.js'

export const createSchedule = async (req, res, next) => {
  try {
    const { clientId, workoutId, date, notes } = req.body
    const userId = req.user.userId

    const client = await prisma.client.findFirst({ where: { id: clientId, userId } })
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado o sin permisos' })
    }

    const workout = await prisma.workout.findFirst({ where: { id: workoutId, clientId } })
    if (!workout) {
      return res
        .status(404)
        .json({ error: 'Rutina no encontrada o no pertenece a ese cliente' })
    }

    const scheduled = await prisma.scheduledWorkout.create({
      data: {
        clientId,
        workoutId,
        date: new Date(date),
        notes: notes || null,
      },
      include: { workout: { select: { id: true, title: true } } },
    })

    return res.status(201).json(scheduled)
  } catch (error) {
    return next(error)
  }
}

export const getSchedule = async (req, res, next) => {
  try {
    const userId = req.user.userId
    const { clientId, from, to } = req.query

    const client = await prisma.client.findFirst({ where: { id: clientId, userId } })
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado o sin permisos' })
    }

    const where = { clientId }
    if (from || to) {
      where.date = {}
      if (from) where.date.gte = new Date(from)
      if (to) where.date.lte = new Date(to)
    }

    const schedule = await prisma.scheduledWorkout.findMany({
      where,
      include: { workout: { select: { id: true, title: true } } },
      orderBy: { date: 'asc' },
    })

    return res.status(200).json(schedule)
  } catch (error) {
    return next(error)
  }
}

export const deleteSchedule = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const scheduled = await prisma.scheduledWorkout.findFirst({
      where: { id, client: { userId } },
    })
    if (!scheduled) {
      return res.status(404).json({ error: 'Asignación no encontrada o sin permisos' })
    }

    await prisma.scheduledWorkout.delete({ where: { id } })

    return res.status(200).json({ message: 'Asignación eliminada' })
  } catch (error) {
    return next(error)
  }
}