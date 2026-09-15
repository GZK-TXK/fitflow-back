import jwt from 'jsonwebtoken';
import prisma from '../db.js';

const COOKIE_NAME = 'fitflow_docs_token';

const readCookie = (req, name) => {
  const header = req.headers.cookie;
  if (!header) return null;
  const match = header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
};

const verifyAdmin = async (token) => {
  const verified = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  const user = await prisma.user.findUnique({ where: { id: verified.userId } });
  if (!user || user.role !== 'ADMIN' || user.status !== 'ACTIVE') return null;
  return user;
};

/**
 * Protects the API documentation so only an active ADMIN can view it.
 * The token can be provided via `?token=`, the Authorization header, or the
 * httpOnly cookie set after a successful `?token=` navigation (so the Swagger
 * UI assets load on the following requests).
 */
export const apiDocsAuth = async (req, res, next) => {
  const queryToken = typeof req.query.token === 'string' ? req.query.token : null;
  const header = req.headers.authorization;
  const headerToken = header && header.startsWith('Bearer ') ? header.slice(7) : null;
  const cookieToken = readCookie(req, COOKIE_NAME);

  const token = queryToken || headerToken || cookieToken;

  if (!token) {
    return res.status(401).json({ error: 'Acceso restringido a administradores' });
  }

  try {
    const user = await verifyAdmin(token);
    if (!user) {
      return res.status(403).json({ error: 'Solo el administrador puede ver la documentación' });
    }

    if (queryToken) {
      res.cookie(COOKIE_NAME, queryToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 1000,
      });
    }

    return next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
