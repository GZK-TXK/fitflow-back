import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Importación de Rutas
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Importación de middlewares propios
import { errorHandler } from './middlewares/errorHandler.js';

// Validación de variables de entorno críticas (fail-fast)
const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`❌ Faltan variables de entorno obligatorias: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;

// Necesario detrás de proxies (Render, Railway, etc.) para que rate-limit lea bien la IP
app.set('trust proxy', 1);

// CORS con allowlist desde FRONTEND_URL
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir peticiones sin Origin (Postman, curl, apps móviles)
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origen no permitido por CORS'));
    },
    credentials: true,
  })
);

// Cabeceras de seguridad
app.use(helmet());

// Parseo de JSON con límite de tamaño
app.use(express.json({ limit: '100kb' }));

// Rate limit global (todas las rutas)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones, inténtalo de nuevo más tarde' },
});
app.use(globalLimiter);

// Rate limit estricto para autenticación (anti fuerza bruta)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de autenticación, espera 15 minutos' },
});

// Registro de Rutas de la API
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/admin', adminRoutes);

// Ruta no encontrada (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo global de errores (siempre al final)
app.use(errorHandler);

// Servidor escuchando
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});