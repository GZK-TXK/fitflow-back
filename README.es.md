# FitFlow — API Backend

> API REST para una plataforma SaaS que ayuda a entrenadores personales a gestionar sus clientes, biblioteca de ejercicios y rutinas de entrenamiento.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#licencia)

[English](README.md) | [Español](README.es.md)

## Descripción general

FitFlow es una API REST multi-entrenador construida con Node.js, Express y Prisma sobre PostgreSQL. Cada entrenador se autentica con JWT y solo puede acceder a sus propios datos (clientes, ejercicios y rutinas), garantizado a nivel de consulta.

## Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 4
- **ORM:** Prisma 5
- **Base de datos:** PostgreSQL (Neon)
- **Autenticación:** JWT (`jsonwebtoken`) + `bcryptjs`
- **Seguridad:** `helmet`, `cors`, `express-rate-limit`, `express-validator`
- **Configuración:** `dotenv`

## Características

- Autenticación de entrenadores (registro / login) con JWT
- Aislamiento de datos por entrenador
- CRUD de clientes
- CRUD de la biblioteca de ejercicios (categoría y URL de vídeo)
- Rutinas de entrenamiento por cliente
- Ítems de rutina: añadir, editar y eliminar ejercicios con series, repeticiones, peso, descanso y orden

## Seguridad

- Contraseñas cifradas con **bcrypt** (10 rondas de sal), nunca en texto plano
- **JWT** firmado con HS256, algoritmo fijado en la verificación, expiración de 7 días
- **helmet** para cabeceras de seguridad HTTP
- **CORS** restringido a una allowlist mediante `FRONTEND_URL`
- **Rate limiting:** 300 peticiones / 15 min global y 10 peticiones / 15 min en autenticación
- **Validación y saneado de entradas** con `express-validator`
- **Control de propiedad** en cada recurso para evitar IDOR (control de acceso roto)
- **Manejo de errores centralizado** con mapeo de errores de Prisma y sin filtrar detalles internos
- Secretos en variables de entorno; se incluye `.env.example`; la app falla al arrancar si faltan variables obligatorias

## Modelo de datos

- **User** — cuenta del entrenador. Tiene muchos Clients y Exercises.
- **Client** — pertenece a un User. Tiene muchos Workouts.
- **Exercise** — pertenece a un User (biblioteca del entrenador) y se usa dentro de los WorkoutItems.
- **Workout** — rutina de un Client. Tiene muchos WorkoutItems.
- **WorkoutItem** — un ejercicio dentro de una rutina (series, repeticiones, peso, descanso, orden).

Los borrados son en cascada (eliminar un cliente elimina sus rutinas, etc.).

## Estructura del proyecto

```
fitflow-back/
├── index.js               # Punto de entrada (middlewares + rutas)
├── db.js                  # Singleton de Prisma
├── controllers/           # Manejadores de peticiones
├── middlewares/           # Autenticación, validación y errores
├── routes/                # Routers de Express
├── validators/            # Reglas de express-validator
├── prisma/
│   ├── schema.prisma      # Modelo de datos
│   └── seed.js            # Catálogo base de ejercicios
└── .env.example
```

## Puesta en marcha

### Requisitos

- Node.js 18 o superior
- Una base de datos PostgreSQL (por ejemplo, Neon)
- npm

### Instalación

```bash
git clone https://github.com/GZK-TXK/fitflow-back.git
cd fitflow-back
npm install
```

### Variables de entorno

```bash
cp .env.example .env
```

Después rellena los valores (ver la tabla más abajo).

### Base de datos

```bash
npx prisma db push
npx prisma db seed   # opcional: carga el catálogo base de ejercicios
```

### Ejecución

```bash
npm run dev     # desarrollo (nodemon)
npm start       # producción
```

El servidor escucha en `http://localhost:4000`.

## Variables de entorno

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `PORT` | Puerto HTTP | `4000` |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | `postgresql://usuario:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Secreto para firmar los JWT | una cadena aleatoria larga |
| `FRONTEND_URL` | Origen(es) permitidos para CORS, separados por coma | `http://localhost:5173` |

## Resumen de endpoints

Todas las rutas excepto las de autenticación requieren la cabecera `Authorization: Bearer <token>`.

**Auth**
- `POST /api/auth/register`
- `POST /api/auth/login`

**Clients**
- `GET /api/clients`
- `GET /api/clients/:id`
- `POST /api/clients`
- `PUT /api/clients/:id`
- `DELETE /api/clients/:id`

**Exercises**
- `GET /api/exercises`
- `GET /api/exercises/:id`
- `POST /api/exercises`
- `PUT /api/exercises/:id`
- `DELETE /api/exercises/:id`

**Workouts**
- `GET /api/workouts`
- `GET /api/workouts/:id`
- `POST /api/workouts`
- `PUT /api/workouts/:id`
- `DELETE /api/workouts/:id`
- `POST /api/workouts/:id/items`
- `PUT /api/workouts/:id/items/:itemId`
- `DELETE /api/workouts/:id/items/:itemId`

## Licencia

Propietaria — Todos los derechos reservados. © 2026 GZK-TXK.

El código fuente se ofrece únicamente con fines de visualización. No se concede permiso para usarlo, copiarlo, modificarlo, distribuirlo ni sublicenciarlo sin consentimiento previo por escrito. Ver [LICENSE](LICENSE).

## Autor

- GitHub: [@GZK-TXK](https://github.com/GZK-TXK)