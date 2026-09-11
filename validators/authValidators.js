import { body } from 'express-validator'

export const registerRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El email no es válido')
    .normalizeEmail(),
  body('password')
    .isString().withMessage('La contraseña debe ser texto')
    .isLength({ min: 8, max: 72 }).withMessage('La contraseña debe tener entre 8 y 72 caracteres')
    .matches(/[a-z]/).withMessage('La contraseña debe incluir una minúscula')
    .matches(/[A-Z]/).withMessage('La contraseña debe incluir una mayúscula')
    .matches(/[0-9]/).withMessage('La contraseña debe incluir un número'),
  body('name')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ min: 2, max: 80 }).withMessage('El nombre debe tener entre 2 y 80 caracteres'),
]

export const loginRules = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es obligatorio')
    .isEmail().withMessage('El email no es válido')
    .normalizeEmail(),
  body('password')
    .isString().withMessage('La contraseña debe ser texto')
    .notEmpty().withMessage('La contraseña es obligatoria'),
]

export const googleLoginRules = [
  body('idToken').isString().notEmpty().withMessage('El idToken es obligatorio'),
]