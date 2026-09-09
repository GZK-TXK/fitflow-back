import { Router } from 'express';
import { register, login } from '../controllers/authController.js';

const router = Router();

// Rutas públicas de autenticación
router.post('/register', register);
router.post('/login', login);

export default router;