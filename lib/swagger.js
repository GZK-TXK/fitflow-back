import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'FitFlow API',
      version: '1.0.0',
      description:
        'REST API for FitFlow — a SaaS platform that helps personal trainers manage their clients, exercise library, routines and weekly calendar, with a client portal, an admin panel, profile photos and real-time presence.',
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Local' },
      { url: 'https://fitflow-back.onrender.com', description: 'Production' },
    ],
    tags: [
      { name: 'Auth', description: 'Public authentication endpoints' },
      { name: 'Profile', description: 'Authenticated user profile' },
      { name: 'Invitations', description: 'Invitation-based registration' },
      { name: 'Clients', description: 'Trainer client management' },
      { name: 'Exercises', description: 'Exercise library' },
      { name: 'Workouts', description: 'Training routines and their items' },
      { name: 'Schedule', description: 'Weekly calendar assignments' },
      { name: 'Admin', description: 'Platform administration' },
      { name: 'Client portal', description: 'Read-only endpoints for the client portal' },
      { name: 'Health', description: 'Service health' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT obtained from /api/auth/login or /api/auth/google',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string', nullable: true },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'TRAINER', 'CLIENT'] },
            status: { type: 'string', enum: ['ACTIVE', 'PENDING', 'DISABLED'] },
            avatarUrl: { type: 'string', nullable: true },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            token: { type: 'string' },
            user: { $ref: '#/components/schemas/User' },
          },
        },
        Profile: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            phone: { type: 'string', nullable: true },
            avatarUrl: { type: 'string', nullable: true },
            role: { type: 'string' },
          },
        },
        Client: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string', nullable: true },
            phone: { type: 'string', nullable: true },
            notes: { type: 'string', nullable: true },
            userId: { type: 'string' },
            accountUserId: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Exercise: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string', nullable: true },
            category: { type: 'string', nullable: true },
            videoUrl: { type: 'string', nullable: true },
            userId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        WorkoutItem: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            workoutId: { type: 'string' },
            exerciseId: { type: 'string' },
            sets: { type: 'integer', nullable: true },
            reps: { type: 'integer', nullable: true },
            weight: { type: 'number', nullable: true },
            restTime: { type: 'integer', nullable: true },
            order: { type: 'integer' },
          },
        },
        Workout: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            clientId: { type: 'string' },
            items: { type: 'array', items: { $ref: '#/components/schemas/WorkoutItem' } },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        ScheduledWorkout: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            clientId: { type: 'string' },
            workoutId: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            notes: { type: 'string', nullable: true },
          },
        },
        Invitation: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            url: { type: 'string' },
            type: { type: 'string', enum: ['TRAINER', 'CLIENT'] },
            email: { type: 'string', format: 'email' },
            expiresAt: { type: 'string', format: 'date-time' },
          },
        },
        InvitationStatus: {
          type: 'object',
          properties: {
            type: { type: 'string', enum: ['TRAINER', 'CLIENT'] },
            email: { type: 'string', format: 'email' },
            valid: { type: 'boolean' },
            used: { type: 'boolean' },
            expired: { type: 'boolean' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js', './index.js'],
};

export const swaggerSpec = swaggerJsdoc(options);
