import crypto from 'crypto'
import prisma from '../db.js'

const INVITE_TTL_DAYS = 7

const buildInviteUrl = (token) => {
  const origin = (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim()
  return `${origin}/register?invite=${token}`
}

const isExpired = (invitation) => invitation.expiresAt.getTime() < Date.now()

export const createInvitation = async (req, res, next) => {
  try {
    const { type, email } = req.body
    const role = req.currentUser.role

    if (type === 'TRAINER' && role !== 'ADMIN') {
      return res.status(403).json({ error: 'Solo un administrador puede invitar entrenadores' })
    }

    let clientId = null
    if (type === 'CLIENT') {
      const client = await prisma.client.findFirst({
        where: role === 'ADMIN' ? { email } : { email, userId: req.user.userId },
      })
      if (!client) {
        return res.status(404).json({
          error:
            role === 'ADMIN'
              ? 'No existe ningún cliente con ese email'
              : 'No tienes ningún cliente con ese email',
        })
      }
      clientId = client.id
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000)

    const invitation = await prisma.invitation.create({
      data: {
        token,
        type,
        email: email.toLowerCase(),
        clientId,
        createdById: req.user.userId,
        expiresAt,
      },
    })

    return res.status(201).json({
      token: invitation.token,
      url: buildInviteUrl(invitation.token),
      type: invitation.type,
      email: invitation.email,
      expiresAt: invitation.expiresAt,
    })
  } catch (error) {
    return next(error)
  }
}

export const getInvitation = async (req, res, next) => {
  try {
    const { token } = req.params

    const invitation = await prisma.invitation.findUnique({ where: { token } })
    if (!invitation) {
      return res.status(404).json({ error: 'Invitación no encontrada' })
    }

    const used = Boolean(invitation.usedAt)
    const expired = isExpired(invitation)

    return res.status(200).json({
      type: invitation.type,
      email: invitation.email,
      valid: !used && !expired,
      used,
      expired,
    })
  } catch (error) {
    return next(error)
  }
}