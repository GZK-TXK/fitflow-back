import prisma from '../db.js'

export const getMyProfile = async (req, res, next) => {
  try {
    const client = req.client

    return res.status(200).json({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
      },
      trainer: {
        name: client.user?.name || null,
        email: client.user?.email || null,
        phone: client.user?.phone || null,
      },
    })
  } catch (error) {
    return next(error)
  }
}

export const getMyWorkouts = async (req, res, next) => {
  try {
    const workouts = await prisma.workout.findMany({
      where: { clientId: req.client.id },
      include: {
        items: { include: { exercise: true }, orderBy: { order: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return res.status(200).json(workouts)
  } catch (error) {
    return next(error)
  }
}

export const getMyWorkoutById = async (req, res, next) => {
  try {
    const { id } = req.params

    const workout = await prisma.workout.findFirst({
      where: { id, clientId: req.client.id },
      include: {
        items: { include: { exercise: true }, orderBy: { order: 'asc' } },
      },
    })

    if (!workout) {
      return res.status(404).json({ error: 'Rutina no encontrada' })
    }

    return res.status(200).json(workout)
  } catch (error) {
    return next(error)
  }
}

export const getMySchedule = async (req, res, next) => {
  try {
    const { from, to } = req.query

    const where = { clientId: req.client.id }
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