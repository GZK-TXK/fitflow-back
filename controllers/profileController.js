import prisma from '../db.js'

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, email: true, name: true, phone: true, role: true },
    })

    return res.status(200).json(user)
  } catch (error) {
    return next(error)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { name, phone },
      select: { id: true, email: true, name: true, phone: true, role: true },
    })

    return res.status(200).json(user)
  } catch (error) {
    return next(error)
  }
}