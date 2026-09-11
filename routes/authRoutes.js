import { Router } from 'express'
import { register, login, googleLogin } from '../controllers/authController.js'
import { registerRules, loginRules, googleLoginRules } from '../validators/authValidators.js'
import { validate } from '../middlewares/validate.js'

const router = Router()

// Rutas públicas de autenticación (llevan rate limit desde index.js)
router.post('/register', registerRules, validate, register)
router.post('/login', loginRules, validate, login)
router.post('/google', googleLoginRules, validate, googleLogin)

export default router