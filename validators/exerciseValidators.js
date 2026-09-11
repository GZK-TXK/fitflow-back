import { body, param } from 'express-validator'

export const exerciseIdRule = [
  param('id').isString().trim().notEmpty().withMessage('El id es obligatorio'),
]

export const createExerciseRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 120 }).withMessage('El nombre debe tener entre 2 y 120 caracteres'),
  body('category')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 60 }).withMessage('La categoría es demasiado larga'),
  body('videoUrl')
    .optional({ values: 'falsy' })
    .trim()
    .isURL().withMessage('La URL del vídeo no es válida'),
]

export const updateExerciseRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 }).withMessage('El nombre debe tener entre 2 y 120 caracteres'),
  body('category')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 60 }).withMessage('La categoría es demasiado larga'),
  body('videoUrl')
    .optional({ values: 'falsy' })
    .trim()
    .isURL().withMessage('La URL del vídeo no es válida'),
]