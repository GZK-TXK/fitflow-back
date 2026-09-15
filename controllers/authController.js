import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../db.js'
import { getFirebaseAuth } from '../lib/firebaseAdmin.js'

const buildToken = (user) =>
  jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
  role: user.role,
  avatarUrl: user.avatarUrl || null,
})

const findValidInvitation = async (token, email) => {
  if (!token) return null

  const invitation = await prisma.invitation.findUnique({ where: { token } })
  if (!invitation) return null
  if (invitation.usedAt) return null
  if (invitation.expiresAt.getTime() < Date.now()) return null
  if (invitation.email.toLowerCase() !== String(email).toLowerCase()) return null

  return invitation
}

const consumeInvitation = async (invitation, userId) => {
  await prisma.invitation.update({
    where: { id: invitation.id },
    data: { usedAt: new Date() },
  })

  if (invitation.type === 'CLIENT' && invitation.clientId) {
    await prisma.client.update({
      where: { id: invitation.clientId },
      data: { accountUserId: userId },
    })
  }
}

export const register = async (req, res, next) => {
  try {
    const { email, password, name, inviteToken } = req.body

    const invitation = await findValidInvitation(inviteToken, email)
    if (!invitation) {
      return res.status(400).json({ error: 'Invitación no válida o caducada' })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: invitation.type,
        status: 'PENDING',
      },
    })

    await consumeInvitation(invitation, user.id)

    return res.status(201).json({
      message: 'Cuenta creada. Queda pendiente de aprobación.',
      pendingApproval: true,
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

    if (user.status === 'PENDING') {
      return res
        .status(403)
        .json({ error: 'Tu cuenta está pendiente de aprobación', code: 'PENDING' })
    }
    if (user.status === 'DISABLED') {
      return res.status(403).json({
        error: 'Tu cuenta está desactivada. Contacta con el administrador.',
        code: 'DISABLED',
      })
    }

    const token = buildToken(user)

    return res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: publicUser(user),
    })
  } catch (error) {
    return next(error)
  }
}

export const googleLogin = async (req, res, next) => {
  try {
    const { idToken, inviteToken } = req.body

    let decoded
    try {
      decoded = await getFirebaseAuth().verifyIdToken(idToken)
    } catch (error) {
      console.error('verifyIdToken error:', error.code || error.message)
      return res.status(401).json({ error: 'Token de Google inválido o expirado' })
    }

    const { uid, email, name } = decoded
    if (!email) {
      return res.status(400).json({ error: 'La cuenta de Google no tiene email' })
    }

    let user = await prisma.user.findFirst({
      where: { OR: [{ firebaseUid: uid }, { email }] },
    })

    if (!user) {
      const invitation = await findValidInvitation(inviteToken, email)
      if (!invitation) {
        return res.status(403).json({
          error: 'Necesitas una invitación para crear una cuenta.',
          code: 'INVITE_REQUIRED',
        })
      }

      user = await prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          firebaseUid: uid,
          role: invitation.type,
          status: 'PENDING',
        },
      })

      await consumeInvitation(invitation, user.id)

      return res.status(403).json({
        error: 'Cuenta creada. Queda pendiente de aprobación.',
        code: 'PENDING',
      })
    }

    if (!user.firebaseUid) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { firebaseUid: uid },
      })
    }

    if (user.status === 'PENDING') {
      return res
        .status(403)
        .json({ error: 'Tu cuenta está pendiente de aprobación', code: 'PENDING' })
    }
    if (user.status === 'DISABLED') {
      return res.status(403).json({
        error: 'Tu cuenta está desactivada. Contacta con el administrador.',
        code: 'DISABLED',
      })
    }

    const token = buildToken(user)

    return res.json({
      message: 'Inicio de sesión con Google exitoso',
      token,
      user: publicUser(user),
    })
  } catch (error) {
    return next(error)
  }
}