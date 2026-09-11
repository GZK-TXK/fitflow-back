import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../db.js'

const buildToken = (user) =>
  jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    })

    const token = buildToken(user)

    return res.status(201).json({
      message: 'Usuario registrado correctamente',
      token,
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (error) {
    return next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.password) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const token = buildToken(user)

    return res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: { id: user.id, email: user.email, name: user.name },
    })
  } catch (error) {
    return next(error)
  }
}