import prisma from '../db.js'
import cloudinary from '../lib/cloudinary.js'

const userSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  role: true,
  avatarUrl: true,
}

export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: userSelect,
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
      select: userSelect,
    })

    return res.status(200).json(user)
  } catch (error) {
    return next(error)
  }
}

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha enviado ninguna imagen' })
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'fitflow/avatars',
          public_id: req.user.userId,
          overwrite: true,
          invalidate: true,
          transformation: [{ width: 256, height: 256, crop: 'fill', gravity: 'auto' }],
        },
        (error, uploadResult) => (error ? reject(error) : resolve(uploadResult))
      )
      stream.end(req.file.buffer)
    })

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: { avatarUrl: result.secure_url },
      select: userSelect,
    })

    return res.status(200).json(user)
  } catch (error) {
    return next(error)
  }
}