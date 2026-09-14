import jwt from 'jsonwebtoken'
import prisma from '../db.js'

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado: token no proporcionado' })
  }

  let verified
  try {
    verified = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
  } catch {
    return res.status(403).json({ error: 'Token inválido o expirado' })
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: verified.userId } })

    if (!user) {
      return res.status(401).json({ error: 'Sesión no válida' })
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        error:
          user.status === 'PENDING'
            ? 'Tu cuenta está pendiente de aprobación'
            : 'Tu cuenta está desactivada. Contacta con el administrador.',
        code: user.status,
      })
    }

    req.user = verified
    req.currentUser = user
    next()
  } catch (error) {
    next(error)
  }
}