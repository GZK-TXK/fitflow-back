import prisma from '../db.js';

// GET: Obtener todos los ejercicios
export const getExercises = async (req, res) => {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(exercises);
  } catch (error) {
    console.error('Error al obtener ejercicios:', error);
    res.status(500).json({ error: 'Error al obtener ejercicios' });
  }
};

// GET: Obtener un ejercicio por ID
export const getExerciseById = async (req, res) => {
  try {
    const { id } = req.params;
    const exercise = await prisma.exercise.findUnique({ where: { id } });

    if (!exercise) {
      return res.status(404).json({ error: 'Ejercicio no encontrado' });
    }

    res.json(exercise);
  } catch (error) {
    console.error('Error al obtener ejercicio:', error);
    res.status(500).json({ error: 'Error al obtener el ejercicio' });
  }
};

// POST: Crear un nuevo ejercicio
export const createExercise = async (req, res) => {
  try {
    const { name, category, videoUrl, userId } = req.body;

    if (!name || !userId) {
      return res.status(400).json({ error: 'El nombre y el userId son obligatorios' });
    }

    const newExercise = await prisma.exercise.create({
      data: {
        name,
        category,
        videoUrl,
        trainer: {
          connect: { id: userId },
        },
      },
    });

    res.status(201).json(newExercise);
  } catch (error) {
    console.error('Error al crear ejercicio:', error);
    res.status(500).json({ error: 'Error al crear el ejercicio' });
  }
};

// PUT: Actualizar un ejercicio
export const updateExercise = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, videoUrl } = req.body;

    const updatedExercise = await prisma.exercise.update({
      where: { id },
      data: { name, category, videoUrl },
    });

    res.json(updatedExercise);
  } catch (error) {
    console.error('Error al actualizar ejercicio:', error);
    res.status(500).json({ error: 'Error al actualizar el ejercicio' });
  }
};

// DELETE: Eliminar un ejercicio
export const deleteExercise = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.exercise.delete({ where: { id } });
    res.json({ message: 'Ejercicio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar ejercicio:', error);
    res.status(500).json({ error: 'Error al eliminar el ejercicio' });
  }
};