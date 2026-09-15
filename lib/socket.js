import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../db.js';

let io = null;
const onlineSockets = new Map(); // userId -> Set<socketId>

const addSocket = (userId, socketId) => {
  if (!onlineSockets.has(userId)) onlineSockets.set(userId, new Set());
  onlineSockets.get(userId).add(socketId);
};

const removeSocket = (userId, socketId) => {
  const set = onlineSockets.get(userId);
  if (!set) return false;
  set.delete(socketId);
  if (set.size === 0) {
    onlineSockets.delete(userId);
    return true;
  }
  return false;
};

export const getOnlineUserIds = () => Array.from(onlineSockets.keys());

const getClientAccountIds = async (trainerId) => {
  const clients = await prisma.client.findMany({
    where: { userId: trainerId, accountUserId: { not: null } },
    select: { accountUserId: true },
  });
  return clients.map((client) => client.accountUserId);
};

const emitPresenceUpdate = (userId, online, lastSeenAt = null) => {
  const payload = { userId, online, lastSeenAt };
  io.to('admins').emit('presence:update', payload);

  prisma.client
    .findMany({ where: { accountUserId: userId }, select: { userId: true } })
    .then((rows) => {
      rows.forEach((row) => io.to(`user:${row.userId}`).emit('presence:update', payload));
    })
    .catch(() => {});
};

export const initSocket = (server, allowedOrigins = []) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        return callback(new Error('Origen no permitido por CORS'));
      },
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Token no proporcionado'));

      const verified = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
      const user = await prisma.user.findUnique({ where: { id: verified.userId } });

      if (!user || user.status !== 'ACTIVE') {
        return next(new Error('Sesión no válida'));
      }

      socket.data.user = { id: user.id, role: user.role };
      return next();
    } catch {
      return next(new Error('Token inválido o expirado'));
    }
  });

  io.on('connection', async (socket) => {
    const { id: userId, role } = socket.data.user;

    socket.join(`user:${userId}`);
    if (role === 'ADMIN') socket.join('admins');

    const firstConnection = !onlineSockets.has(userId);
    addSocket(userId, socket.id);

    let online = getOnlineUserIds();
    if (role === 'TRAINER') {
      const clientIds = new Set(await getClientAccountIds(userId));
      online = online.filter((id) => clientIds.has(id));
    } else if (role !== 'ADMIN') {
      online = [];
    }
    socket.emit('presence:init', { online });

    if (firstConnection) {
      emitPresenceUpdate(userId, true);
    }

    socket.on('disconnect', async () => {
      const fullyOffline = removeSocket(userId, socket.id);
      if (!fullyOffline) return;

      let lastSeenAt = null;
      try {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: { lastSeenAt: new Date() },
        });
        lastSeenAt = updated.lastSeenAt;
      } catch {
        // el usuario pudo ser eliminado
      }

      emitPresenceUpdate(userId, false, lastSeenAt ? lastSeenAt.toISOString() : null);
    });
  });

  return io;
};