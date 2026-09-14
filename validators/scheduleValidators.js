import { body, param, query } from 'express-validator'

export const scheduleIdRule = [
  param('id').isString().trim().notEmpty().withMessage('El id es obligatorio'),
]

export const createScheduleRules = [
  body('clientId').isString().trim().notEmpty().withMessage('El clientId es obligatorio'),
  body('workoutId').isString().trim().notEmpty().withMessage('El workoutId es obligatorio'),
  body('date').isISO8601().withMessage('La fecha no es válida'),
  body('notes')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 500 }).withMessage('Las notas son demasiado largas'),
]

export const scheduleQueryRules = [
  query('clientId').isString().trim().notEmpty().withMessage('El clientId es obligatorio'),
  query('from')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('La fecha "from" no es válida'),
  query('to')
    .optional({ values: 'falsy' })
    .isISO8601().withMessage('La fecha "to" no es válida'),
]