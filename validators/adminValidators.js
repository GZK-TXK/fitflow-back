import { body, param } from 'express-validator'

export const trainerIdRule = [
  param('id').isString().trim().notEmpty().withMessage('El id es obligatorio'),
]

export const updateRoleRules = [
  body('role').isIn(['ADMIN', 'TRAINER']).withMessage('El rol debe ser ADMIN o TRAINER'),
]