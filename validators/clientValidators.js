import { body, param } from 'express-validator'

export const clientIdRule = [
  param('id').isString().trim().notEmpty().withMessage('El id es obligatorio'),
]

export const createClientRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre del cliente es obligatorio')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail().withMessage('El email no es válido')
    .normalizeEmail(),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 30 }).withMessage('El teléfono es demasiado largo'),
  body('notes')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 1000 }).withMessage('Las notas son demasiado largas'),
]

export const updateClientRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('email')
    .optional({ values: 'falsy' })
    .trim()
    .isEmail().withMessage('El email no es válido')
    .normalizeEmail(),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 30 }).withMessage('El teléfono es demasiado largo'),
  body('notes')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 1000 }).withMessage('Las notas son demasiado largas'),
]