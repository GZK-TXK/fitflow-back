import prisma from '../db.js';
import { getOnlineUserIds } from '../lib/socket.js';

export const getStats = async (req, res, next) => {
  try {
    const [trainers, clients, exercises, workouts, pending] = await Promise.all([
      prisma.user.count(),
      prisma.client.count(),
      prisma.exercise.count(),
      prisma.workout.count(),
      prisma.user.count({ where: { status: 'PENDING' } }),
    ]);

    return res.json({ trainers, clients, exercises, workouts, pending });
  } catch (error) {
    return next(error);
  }
};

export const getTrainers = async (req, res, next) => {
  try {
    const online = new Set(getOnlineUserIds());

    const trainers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        lastSeenAt: true,
        _count: { select: { clients: true, exercises: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(trainers.map((trainer) => ({ ...trainer, isOnline: online.has(trainer.id) })));
  } catch (error) {
    return next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { role } = req.query;
    const where = role ? { role } : {};
    const online = new Set(getOnlineUserIds());

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        lastSeenAt: true,
        _count: { select: { clients: true, exercises: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(users.map((user) => ({ ...user, isOnline: online.has(user.id) })));
  } catch (error) {
    return next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (id === req.user.userId) {
      return res.status(400).json({ error: 'No puedes cambiar tu propio estado' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { status },
    });

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateTrainerRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (id === req.user.userId) {
      return res.status(400).json({ error: 'No puedes cambiar tu propio rol' });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
    });

    return res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch (error) {
    return next(error);
  }
};

export const deleteTrainer = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (id === req.user.userId) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }

    await prisma.user.delete({ where: { id } });

    return res.json({ message: 'Entrenador eliminado correctamente' });
  } catch (error) {
    return next(error);
  }
};