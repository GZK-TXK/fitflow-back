import { body, param } from 'express-validator'

export const createInvitationRules = [
  body('type').isIn(['TRAINER', 'CLIENT']).withMessage('El tipo no es válido'),
  body('email').trim().isEmail().withMessage('El email no es válido').normalizeEmail(),
]

export const invitationTokenRule = [
  param('token').isString().trim().notEmpty().withMessage('El token es obligatorio'),
]