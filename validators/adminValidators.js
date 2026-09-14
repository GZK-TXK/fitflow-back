import { body, param, query } from 'express-validator'

export const trainerIdRule = [
  param('id').isString().trim().notEmpty().withMessage('El id es obligatorio'),
]

export const userIdRule = [
  param('id').isString().trim().notEmpty().withMessage('El id es obligatorio'),
]

export const updateRoleRules = [
  body('role').isIn(['ADMIN', 'TRAINER', 'CLIENT']).withMessage('El rol no es válido'),
]

export const updateUserStatusRules = [
  body('status')
    .isIn(['ACTIVE', 'PENDING', 'DISABLED'])
    .withMessage('El estado no es válido'),
]

export const usersQueryRules = [
  query('role')
    .optional({ values: 'falsy' })
    .isIn(['ADMIN', 'TRAINER', 'CLIENT'])
    .withMessage('El rol no es válido'),
]