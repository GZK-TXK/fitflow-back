import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Obtener todos los workouts pertenecientes a los clientes del usuario autenticado
export const getWorkouts = async (req, res) => {
  try {
    const userId = req.user.userId;

    const workouts = await prisma.workout.findMany({
      where: {
        client: {
          userId, // Filtra solo rutinas de clientes pertenecientes al entrenador
        },
      },
      include: {
        client: {
          select: { id: true, name: true, email: true },
        },
        items: {
          include: {
            exercise: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json(workouts);
  } catch (error) {
    console.error('Error al obtener workouts:', error);
    return res.status(500).json({ error: 'Error al obtener la lista de rutinas' });
  }
};

// Obtener un workout específico por ID
export const getWorkoutById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const workout = await prisma.workout.findFirst({
      where: {
        id,
        client: { userId },
      },
      include: {
        client: true,
        items: {
          include: {
            exercise: true,
          },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!workout) {
      return res.status(404).json({ error: 'Rutina no encontrada o sin permisos' });
    }

    return res.status(200).json(workout);
  } catch (error) {
    console.error('Error al obtener el workout:', error);
    return res.status(500).json({ error: 'Error al obtener los detalles de la rutina' });
  }
};

// Crear una nueva rutina
export const createWorkout = async (req, res) => {
  try {
    const { title, description, clientId } = req.body;
    const userId = req.user.userId;

    if (!title || !clientId) {
      return res.status(400).json({ error: 'El título y el clientId son obligatorios' });
    }

    // Verificar que el cliente pertenece al entrenador autenticado
    const client = await prisma.client.findFirst({
      where: { id: clientId, userId },
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado o no pertenece a tu usuario' });
    }

    const newWorkout = await prisma.workout.create({
      data: {
        title,
        description,
        client: {
          connect: { id: clientId },
        },
      },
      include: {
        client: true,
      },
    });

    return res.status(201).json(newWorkout);
  } catch (error) {
    console.error('Error al crear workout:', error);
    return res.status(500).json({ error: 'Error al crear la rutina' });
  }
};

// Actualizar una rutina existente
export const updateWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user.userId;

    const existingWorkout = await prisma.workout.findFirst({
      where: { id, client: { userId } },
    });

    if (!existingWorkout) {
      return res.status(404).json({ error: 'Rutina no encontrada o sin permisos' });
    }

    const updatedWorkout = await prisma.workout.update({
      where: { id },
      data: { title, description },
    });

    return res.status(200).json(updatedWorkout);
  } catch (error) {
    console.error('Error al actualizar workout:', error);
    return res.status(500).json({ error: 'Error al actualizar la rutina' });
  }
};

// Eliminar una rutina
export const deleteWorkout = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const existingWorkout = await prisma.workout.findFirst({
      where: { id, client: { userId } },
    });

    if (!existingWorkout) {
      return res.status(404).json({ error: 'Rutina no encontrada o sin permisos' });
    }

    await prisma.workout.delete({
      where: { id },
    });

    return res.status(200).json({ message: 'Rutina eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar workout:', error);
    return res.status(500).json({ error: 'Error al eliminar la rutina' });
  }
};  