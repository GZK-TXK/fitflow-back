import prisma from '../db.js'

export const requireRole = (role) => async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } })

    if (!user || user.role !== role) {
      return res.status(403).json({ error: 'Acceso denegado' })
    }

    req.currentUser = user
    next()
  } catch (error) {
    next(error)
  }
}