import prisma from '../db.js'

export const requireClient = async (req, res, next) => {
  try {
    const client = await prisma.client.findUnique({
      where: { accountUserId: req.user.userId },
      include: {
        user: { select: { name: true, email: true, phone: true, avatarUrl: true } },
      },
    })

    if (!client) {
      return res.status(403).json({ error: 'Tu cuenta no está vinculada a ningún entrenador' })
    }

    req.client = client
    next()
  } catch (error) {
    next(error)
  }
}