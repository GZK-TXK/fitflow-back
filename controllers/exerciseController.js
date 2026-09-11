import prisma from '../db.js'

export const getExercises = async (req, res, next) => {
  try {
    const userId = req.user.userId
    const exercises = await prisma.exercise.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    })
    return res.json(exercises)
  } catch (error) {
    return next(error)
  }
}

export const getExerciseById = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const exercise = await prisma.exercise.findFirst({ where: { id, userId } })
    if (!exercise) {
      return res.status(404).json({ error: 'Ejercicio no encontrado' })
    }
    return res.json(exercise)
  } catch (error) {
    return next(error)
  }
}

export const createExercise = async (req, res, next) => {
  try {
    const { name, category, videoUrl } = req.body
    const userId = req.user.userId

    const newExercise = await prisma.exercise.create({
      data: { name, category, videoUrl, userId },
    })
    return res.status(201).json(newExercise)
  } catch (error) {
    return next(error)
  }
}

export const updateExercise = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, category, videoUrl } = req.body
    const userId = req.user.userId

    const existing = await prisma.exercise.findFirst({ where: { id, userId } })
    if (!existing) {
      return res.status(404).json({ error: 'Ejercicio no encontrado o sin permisos' })
    }

    const updatedExercise = await prisma.exercise.update({
      where: { id },
      data: { name, category, videoUrl },
    })
    return res.json(updatedExercise)
  } catch (error) {
    return next(error)
  }
}

export const deleteExercise = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.userId

    const existing = await prisma.exercise.findFirst({ where: { id, userId } })
    if (!existing) {
      return res.status(404).json({ error: 'Ejercicio no encontrado o sin permisos' })
    }

    await prisma.exercise.delete({ where: { id } })
    return res.json({ message: 'Ejercicio eliminado correctamente' })
  } catch (error) {
    return next(error)
  }
}