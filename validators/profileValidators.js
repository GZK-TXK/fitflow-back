import { body } from 'express-validator'

export const updateProfileRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 80 }).withMessage('El nombre debe tener entre 2 y 80 caracteres'),
  body('phone')
    .optional({ values: 'falsy' })
    .trim()
    .isLength({ max: 30 }).withMessage('El teléfono es demasiado largo'),
]