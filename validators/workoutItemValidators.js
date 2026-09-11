import { body, param } from 'express-validator'

export const workoutItemIdRule = [
  param('itemId').isString().trim().notEmpty().withMessage('El itemId es obligatorio'),
]

export const addWorkoutItemRules = [
  body('exerciseId').trim().notEmpty().withMessage('El exerciseId es obligatorio'),
  body('sets')
    .optional({ values: 'null' })
    .isInt({ min: 1, max: 100 }).withMessage('Las series deben ser un número entre 1 y 100')
    .toInt(),
  body('reps')
    .optional({ values: 'null' })
    .isInt({ min: 1, max: 1000 }).withMessage('Las repeticiones deben ser un número entre 1 y 1000')
    .toInt(),
  body('weight')
    .optional({ values: 'null' })
    .isFloat({ min: 0, max: 1000 }).withMessage('El peso debe ser un número entre 0 y 1000')
    .toFloat(),
  body('restTime')
    .optional({ values: 'null' })
    .isInt({ min: 0, max: 3600 }).withMessage('El descanso debe ser un número entre 0 y 3600 segundos')
    .toInt(),
  body('order')
    .optional({ values: 'null' })
    .isInt({ min: 0, max: 1000 }).withMessage('El orden debe ser un número entre 0 y 1000')
    .toInt(),
]

export const updateWorkoutItemRules = [
  body('sets')
    .optional({ values: 'null' })
    .isInt({ min: 1, max: 100 }).withMessage('Las series deben ser un número entre 1 y 100')
    .toInt(),
  body('reps')
    .optional({ values: 'null' })
    .isInt({ min: 1, max: 1000 }).withMessage('Las repeticiones deben ser un número entre 1 y 1000')
    .toInt(),
  body('weight')
    .optional({ values: 'null' })
    .isFloat({ min: 0, max: 1000 }).withMessage('El peso debe ser un número entre 0 y 1000')
    .toFloat(),
  body('restTime')
    .optional({ values: 'null' })
    .isInt({ min: 0, max: 3600 }).withMessage('El descanso debe ser un número entre 0 y 3600 segundos')
    .toInt(),
  body('order')
    .optional({ values: 'null' })
    .isInt({ min: 0, max: 1000 }).withMessage('El orden debe ser un número entre 0 y 1000')
    .toInt(),
]