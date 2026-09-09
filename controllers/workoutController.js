import prisma from '../db.js';

// GET: Obtener todos los entrenamientos
export const getWorkouts = async (req, res) => {
  try {
    const workouts = await prisma.workout.findMany({
      include: {
        client: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(workouts);
  } catch (error) {
    console.error('Error al obtener entrenamientos:', error);
    res.status(500).json({ error: 'Error al obtener entrenamientos' });
  }
};

// GET: Obtener un entrenamiento por ID
export const getWorkoutById = async (req, res) => {
  try {
    const { id } = req.params;
    const workout = await prisma.workout.findUnique({
      where: { id },
      include: { client: true },
    });

    if (!workout) {
      return res.status(404).json({ error: 'Entrenamiento no encontrado' });
    }

    res.json(workout);
  } catch (error) {
    console.error('Error al obtener entrenamiento:', error);
    res.status(500).json({ error: 'Error al obtener el entrenamiento' });
  }
};

// POST: Crear un nuevo entrenamiento
export const createWorkout = async (req, res) => {
  try {
    const { title, name, description, notes, content, clientId } = req.body;

    const workoutTitle = title || name;
    const workoutDescription = description || notes;

    if (!workoutTitle || !clientId) {
      return res.status(400).json({
        error: 'El título/nombre y el clientId son obligatorios',
      });
    }

    const newWorkout = await prisma.workout.create({
      data: {
        title: workoutTitle,
        description: workoutDescription,
        content: content || {},
        client: {
          connect: { id: clientId },
        },
      },
    });

    res.status(201).json(newWorkout);
  } catch (error) {
    console.error('Error al crear entrenamiento:', error);
    res.status(500).json({ error: 'Error al crear el entrenamiento' });
  }
};

// PUT: Actualizar un entrenamiento existente
export const updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, name, description, notes, content, clientId } = req.body;

    const workoutTitle = title || name;
    const workoutDescription = description || notes;

    const dataToUpdate = {};
    if (workoutTitle) dataToUpdate.title = workoutTitle;
    if (workoutDescription !== undefined) dataToUpdate.description = workoutDescription;
    if (content !== undefined) dataToUpdate.content = content;
    if (clientId) {
      dataToUpdate.client = {
        connect: { id: clientId },
      };
    }

    const updatedWorkout = await prisma.workout.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json(updatedWorkout);
  } catch (error) {
    console.error('Error al actualizar entrenamiento:', error);
    res.status(500).json({ error: 'Error al actualizar el entrenamiento' });
  }
};

// DELETE: Eliminar un entrenamiento
export const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.workout.delete({ where: { id } });
    res.json({ message: 'Entrenamiento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar entrenamiento:', error);
    res.status(500).json({ error: 'Error al eliminar el entrenamiento' });
  }
};