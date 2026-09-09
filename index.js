import express from 'express';
import cors from 'cors';
import prisma from './db.js';

// Importación de Rutas
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import exerciseRoutes from './routes/exerciseRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares Globales
app.use(cors());
app.use(express.json());

// Endpoint de prueba de base de datos
app.get('/test-db', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    let sampleUser = await prisma.user.findFirst();

    if (!sampleUser) {
      sampleUser = await prisma.user.create({
        data: {
          email: `trainer_${Date.now()}@fitflow.com`,
          name: 'Entrenador de Prueba',
        },
      });
    }

    res.json({
      message: '¡Conexión a Neon exitosa!',
      totalUsers: userCount,
      user: sampleUser,
    });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    res.status(500).json({ error: 'Error al conectar con la base de datos' });
  }
});

// Registro de Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/workouts', workoutRoutes);

// Servidor escuchando
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});