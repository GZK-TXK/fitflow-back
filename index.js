import 'dotenv/config';
import { createServer } from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

// Importación de Rutas
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import meRoutes from './routes/meRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';

// Importación de middlewares propios
import { errorHandler } from './middlewares/errorHandler.js';
import { authenticateToken } from './middlewares/authMiddleware.js';
import { requireRole } from './middlewares/requireRole.js';
import { apiDocsAuth } from './middlewares/apiDocsAuth.js';
import { initSocket } from './lib/socket.js';
import { swaggerSpec } from './lib/swagger.js';

// Validación de variables de entorno críticas (fail-fast)
const requiredEnv = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`❌ Faltan variables de entorno obligatorias: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1);

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Origen no permitido por CORS'));
    },
    credentials: true,
  })
);

app.use(helmet());
app.use(express.json({ limit: '100kb' }));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones, inténtalo de nuevo más tarde' },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de autenticación, espera 15 minutos' },
});

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     security: []
 *     responses:
 *       '200':
 *         description: Service is up
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workouts', workoutRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/me', meRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/invitations', invitationRoutes);

// Documentación de la API (solo administradores)
app.get('/api-docs.json', authenticateToken, requireRole('ADMIN'), (req, res) => {
  res.json(swaggerSpec);
});

app.use(
  '/api-docs',
  apiDocsAuth,
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'FitFlow API Docs',
    swaggerOptions: { persistAuthorization: true },
  })
);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use(errorHandler);

const server = createServer(app);
initSocket(server, allowedOrigins);

server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 API docs (admin): http://localhost:${PORT}/api-docs`);
});
