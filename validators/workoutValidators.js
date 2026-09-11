import { body, param } from 'express-validator'

export const workoutIdRule = [
  param('id').isString().trim().notEmpty().withMessage('El id es obligatorio'),
]

export const createWorkoutRules = [
  body('title')
    .trim()
    .notEmpty().withMessage('El título es obligatorio')
    .isLength({ min: 2, max: 120 }).withMessage('El título debe tener entre 2 y 120 caracteres'),
  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 1000 }).withMessage('La descripción es demasiado larga'),
  body('clientId').trim().notEmpty().withMessage('El clientId es obligatorio'),
]

export const updateWorkoutRules = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 }).withMessage('El título debe tener entre 2 y 120 caracteres'),
  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 1000 }).withMessage('La descripción es demasiado larga'),
]