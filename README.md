# FitFlow — Backend API

> REST API for a SaaS platform that helps personal trainers manage their clients, exercise library, training routines and weekly calendar, with a client portal and an admin panel.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#license)

[English](#english) | [Español](#espanol)

<a id="english"></a>
## English

### Overview

FitFlow is a multi-tenant REST API built with Node.js, Express and Prisma on top of PostgreSQL. It serves three types of users — **Admin**, **Trainer** and **Client** — and enforces at the query level that every user can only access their own data. Authentication supports email/password and Google (Firebase), with an account approval/activation workflow.

### Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 4
- **ORM:** Prisma 5
- **Database:** PostgreSQL (Neon)
- **Auth:** JWT (`jsonwebtoken`) + `bcryptjs` + Firebase Admin (Google sign-in)
- **Security:** `helmet`, `cors`, `express-rate-limit`, `express-validator`
- **Config:** `dotenv`

### Roles & Account Status

**Roles (`User.role`)**
- `ADMIN` — platform administrator (manage users, approve/activate/deactivate accounts).
- `TRAINER` — personal trainer (manages their own clients, exercises, routines and calendar).
- `CLIENT` — end client (read-only portal: assigned routines and calendar).

**Account status (`User.status`)**
- `PENDING` — new trainer awaiting admin approval (cannot sign in).
- `ACTIVE` — enabled account.
- `DISABLED` — deactivated by an admin (sessions stop working immediately).

### Features

- Trainer authentication: email/password and Google (Firebase).
- Account approval workflow: new trainers start as `PENDING` until an admin approves them.
- Admin can approve, activate and deactivate any account (trainers and clients).
- Per-trainer data isolation (ownership checks on every resource).
- Clients CRUD, with optional access to the client portal ("invite").
- Exercise library CRUD (category and video URL).
- Training routines per client, with items (sets, reps, weight, rest time, order).
- Weekly calendar: assign routines to specific dates and times.
- Client portal endpoints (`/api/me/*`) for the client's own data.
- Trainer profile (name and phone shown to clients).
- Demo seeder with realistic data (trainers, clients, exercises, routines, calendar).

### Security

- Passwords hashed with **bcrypt** (10 salt rounds). Client portal accounts use Google only.
- **JWT** signed with HS256 (algorithm pinned), 7-day expiry.
- **Account status verified on every request**: pending/disabled users are rejected immediately.
- **helmet** for HTTP security headers.
- **CORS** restricted to an allowlist via `FRONTEND_URL`.
- **Rate limiting:** 300 req / 15 min globally and 10 req / 15 min on auth endpoints.
- **Input validation and sanitization** with `express-validator`.
- **Ownership checks** on every resource to prevent IDOR (broken access control).
- **Centralized error handling** with Prisma error mapping and no internal detail leakage.
- Firebase ID tokens verified server-side (`firebase-admin`).
- Secrets in environment variables; `.env.example` provided; the app fails fast if required variables are missing.

### Data Model

- **User** — account. Fields: `email` (unique), `name`, `phone`, `password?`, `firebaseUid?` (unique), `role`, `status`, `stripeCustomerId?`. Relations: `clients` (as trainer), `clientAccount` (as client), `exercises`.
- **Client** — belongs to a User (trainer). Has many `Workout` and `ScheduledWorkout`. Optional link to its own portal account via `accountUserId` (unique).
- **Exercise** — belongs to a User (trainer library). Used by `WorkoutItem`.
- **Workout** — a routine for a Client. Has many `WorkoutItem`.
- **WorkoutItem** — an exercise inside a routine (`sets`, `reps`, `weight`, `restTime`, `order`).
- **ScheduledWorkout** — assigns a `Workout` to a `Client` on a `date` (with `notes?`).

Deletes cascade (removing a user/client removes its related records).

### Project Structure

```
fitflow-back/
├── index.js               # App entry point (middlewares + routes)
├── db.js                  # Prisma singleton
├── controllers/           # Request handlers
├── middlewares/           # Auth, roles, client, validation, error handler
├── routes/                # Express routers
├── validators/            # express-validator rule sets
├── lib/
│   └── firebaseAdmin.js   # Firebase Admin (Google token verification)
├── prisma/
│   ├── schema.prisma      # Data model
│   ├── seed.js            # Demo seeder
│   └── reset-demo.js      # Removes demo data
└── .env.example
```

### Getting Started

#### Requirements

- Node.js 18+
- A PostgreSQL database (e.g. Neon)
- npm

#### Installation

```bash
git clone https://github.com/GZK-TXK/fitflow-back.git
cd fitflow-back
npm install
```

#### Environment

```bash
cp .env.example .env
```

Fill in the values (see the table below).

#### Database

```bash
npx prisma db push
```

#### Demo data (optional)

```bash
npx prisma db seed       # or: npm run seed:demo
npm run reset:demo       # removes all demo data
```

Demo credentials (the seed prints the full list):
- Trainer: `carlos@demo.fitflow.app` / `Demo1234`
- Client (with portal access): `ana.garcia.11@demo.fitflow.app` / `Demo1234`

#### Run

```bash
npm run dev     # development (nodemon)
npm start       # production
```

The server listens on `http://localhost:4000`.

### Environment Variables

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | HTTP port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Secret used to sign JWTs | a long random string |
| `FRONTEND_URL` | Allowed CORS origin(s), comma-separated | `http://localhost:5173` |
| `FIREBASE_PROJECT_ID` | Firebase project id | `your-project` |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | `firebase-adminsdk-...@your-project.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key (with `\n`) | `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"` |

### Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start in development (nodemon) |
| `npm start` | Start in production |
| `npm run seed:demo` | Seed demo data (idempotent) |
| `npm run reset:demo` | Delete all demo data |

### Authentication Flows

- **Trainer (email/password):** `POST /api/auth/register` creates a `TRAINER` with `status: PENDING` (no token). An admin must approve it before the trainer can sign in.
- **Trainer (Google):** if the email is unknown, a `TRAINER` is created as `PENDING`; otherwise the existing account is used.
- **Client portal:** the trainer grants access with `POST /api/clients/:id/invite`, which creates/links a `CLIENT` account (Google-only). The client then signs in with Google using that email.
- **Revoke access:** `DELETE /api/clients/:id/invite` unlinks the account.

### API Endpoints

All endpoints except auth require `Authorization: Bearer <token>`.

**Auth (public)**

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register a trainer (starts as `PENDING`) |
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/google` | Google login (Firebase ID token) |

**Profile (any authenticated user)**

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/profile` | Get own profile |
| PUT | `/api/profile` | Update name and phone |

**Clients (trainer/admin)**

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/clients` | List own clients |
| GET | `/api/clients/:id` | Get a client (with workouts) |
| POST | `/api/clients` | Create a client |
| PUT | `/api/clients/:id` | Update a client |
| DELETE | `/api/clients/:id` | Delete a client |
| POST | `/api/clients/:id/invite` | Grant client portal access |
| DELETE | `/api/clients/:id/invite` | Revoke client portal access |

**Exercises (authenticated)**

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/exercises` | List exercises |
| GET | `/api/exercises/:id` | Get an exercise |
| POST | `/api/exercises` | Create an exercise |
| PUT | `/api/exercises/:id` | Update an exercise |
| DELETE | `/api/exercises/:id` | Delete an exercise |

**Workouts (authenticated)**

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/workouts` | List routines |
| GET | `/api/workouts/:id` | Get a routine (with items) |
| POST | `/api/workouts` | Create a routine |
| PUT | `/api/workouts/:id` | Update a routine |
| DELETE | `/api/workouts/:id` | Delete a routine |
| POST | `/api/workouts/:id/items` | Add an exercise to a routine |
| PUT | `/api/workouts/:id/items/:itemId` | Update a routine item |
| DELETE | `/api/workouts/:id/items/:itemId` | Remove a routine item |

**Schedule / Calendar (trainer/admin)**

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/schedule` | Assign a routine to a client on a date |
| GET | `/api/schedule?clientId=&from=&to=` | List assignments in a range |
| DELETE | `/api/schedule/:id` | Remove an assignment |

**Admin (admin only)**

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/admin/stats` | Global counters (trainers, clients, exercises, workouts, pending) |
| GET | `/api/admin/users?role=` | List users (optionally filtered by role) |
| PUT | `/api/admin/users/:id/status` | Set status (`ACTIVE`/`PENDING`/`DISABLED`) |
| PUT | `/api/admin/trainers/:id/role` | Change a user's role |
| DELETE | `/api/admin/trainers/:id` | Delete a user |

**Client portal (client only)**

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/me/profile` | Own profile + trainer contact |
| GET | `/api/me/workouts` | Own routines |
| GET | `/api/me/workouts/:id` | Routine detail (with exercises) |
| GET | `/api/me/schedule` | Own calendar |

**Health**

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Health check |

### Deployment

- **Hosting:** Render (Web Service) + Neon (PostgreSQL) + Firebase (Auth).
- **Build:** `npm install --include=dev && npx prisma generate`
- **Start:** `npm start`
- **Branch:** `develop`
- Set the environment variables (including the Firebase service account).
- Set `FRONTEND_URL` to the deployed frontend origin.
- Firebase: add the frontend domain to **Authentication → Authorized domains**, and restrict the browser API key in Google Cloud (HTTP referrers + APIs).

### License

Proprietary — All rights reserved. © 2026 GZK-TXK.

No permission is granted to use, copy, modify, distribute or sublicense this software without prior written consent. See [LICENSE](LICENSE).

### Author

- GitHub: [@GZK-TXK](https://github.com/GZK-TXK)

---

<a id="espanol"></a>
## Español

### Descripción general

FitFlow es una API REST multi-entrenador construida con Node.js, Express y Prisma sobre PostgreSQL. Da servicio a tres tipos de usuario — **Admin**, **Entrenador** y **Cliente** — y garantiza a nivel de consulta que cada usuario solo accede a sus propios datos. La autenticación admite email/contraseña y Google (Firebase), con un flujo de aprobación/activación de cuentas.

### Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 4
- **ORM:** Prisma 5
- **Base de datos:** PostgreSQL (Neon)
- **Autenticación:** JWT (`jsonwebtoken`) + `bcryptjs` + Firebase Admin (login con Google)
- **Seguridad:** `helmet`, `cors`, `express-rate-limit`, `express-validator`
- **Configuración:** `dotenv`

### Roles y estados de cuenta

**Roles (`User.role`)**
- `ADMIN` — administrador de la plataforma (gestiona usuarios, aprueba/activa/desactiva cuentas).
- `TRAINER` — entrenador personal (gestiona sus clientes, ejercicios, rutinas y calendario).
- `CLIENT` — cliente final (portal de solo lectura: rutinas asignadas y calendario).

**Estado de cuenta (`User.status`)**
- `PENDING` — entrenador nuevo pendiente de aprobación del admin (no puede entrar).
- `ACTIVE` — cuenta habilitada.
- `DISABLED` — desactivada por un admin (las sesiones dejan de funcionar al instante).

### Características

- Autenticación de entrenadores: email/contraseña y Google (Firebase).
- Aprobación de cuentas: los entrenadores nuevos quedan `PENDING` hasta que un admin los aprueba.
- El admin puede aprobar, activar y desactivar cualquier cuenta (entrenadores y clientes).
- Aislamiento de datos por entrenador (control de propiedad en cada recurso).
- CRUD de clientes, con acceso opcional al portal del cliente ("invitar").
- CRUD de la biblioteca de ejercicios (categoría y URL de vídeo).
- Rutinas por cliente, con ítems (series, reps, peso, descanso, orden).
- Calendario: asignar rutinas a fechas y horas concretas.
- Endpoints del portal del cliente (`/api/me/*`) para sus propios datos.
- Perfil del entrenador (nombre y teléfono visibles para sus clientes).
- Seeder de datos demo realistas (entrenadores, clientes, ejercicios, rutinas, calendario).

### Seguridad

- Contraseñas cifradas con **bcrypt** (10 rondas). Las cuentas del portal de cliente usan solo Google.
- **JWT** firmado con HS256 (algoritmo fijado), expiración de 7 días.
- **Estado de cuenta verificado en cada petición**: los usuarios pendientes/desactivados se rechazan de inmediato.
- **helmet** para cabeceras de seguridad HTTP.
- **CORS** restringido a una allowlist mediante `FRONTEND_URL`.
- **Rate limiting:** 300 peticiones / 15 min global y 10 peticiones / 15 min en autenticación.
- **Validación y saneado** con `express-validator`.
- **Control de propiedad** en cada recurso para evitar IDOR.
- **Manejo de errores centralizado** con mapeo de errores de Prisma y sin filtrar detalles internos.
- Tokens de Firebase verificados en el servidor (`firebase-admin`).
- Secretos en variables de entorno; se incluye `.env.example`; la app falla al arrancar si faltan variables obligatorias.

### Modelo de datos

- **User** — cuenta. Campos: `email` (único), `name`, `phone`, `password?`, `firebaseUid?` (único), `role`, `status`, `stripeCustomerId?`. Relaciones: `clients` (como entrenador), `clientAccount` (como cliente), `exercises`.
- **Client** — pertenece a un User (entrenador). Tiene varios `Workout` y `ScheduledWorkout`. Enlace opcional a su propia cuenta del portal mediante `accountUserId` (único).
- **Exercise** — pertenece a un User (biblioteca del entrenador). Se usa en `WorkoutItem`.
- **Workout** — rutina de un Client. Tiene varios `WorkoutItem`.
- **WorkoutItem** — un ejercicio dentro de una rutina (`sets`, `reps`, `weight`, `restTime`, `order`).
- **ScheduledWorkout** — asigna un `Workout` a un `Client` en una `date` (con `notes?`).

Los borrados son en cascada (eliminar un usuario/cliente elimina sus registros relacionados).

### Estructura del proyecto

```
fitflow-back/
├── index.js               # Punto de entrada (middlewares + rutas)
├── db.js                  # Singleton de Prisma
├── controllers/           # Manejadores de peticiones
├── middlewares/           # Auth, roles, cliente, validación, errores
├── routes/                # Routers de Express
├── validators/            # Reglas de express-validator
├── lib/
│   └── firebaseAdmin.js   # Firebase Admin (verificación de tokens de Google)
├── prisma/
│   ├── schema.prisma      # Modelo de datos
│   ├── seed.js            # Seeder de demo
│   └── reset-demo.js      # Borra los datos demo
└── .env.example
```

### Puesta en marcha

#### Requisitos

- Node.js 18+
- Una base de datos PostgreSQL (por ejemplo, Neon)
- npm

#### Instalación

```bash
git clone https://github.com/GZK-TXK/fitflow-back.git
cd fitflow-back
npm install
```

#### Variables de entorno

```bash
cp .env.example .env
```

Después rellena los valores (ver la tabla de abajo).

#### Base de datos

```bash
npx prisma db push
```

#### Datos demo (opcional)

```bash
npx prisma db seed       # o: npm run seed:demo
npm run reset:demo       # borra todos los datos demo
```

Credenciales demo (el seed imprime la lista completa):
- Entrenador: `carlos@demo.fitflow.app` / `Demo1234`
- Cliente (con acceso al portal): `ana.garcia.11@demo.fitflow.app` / `Demo1234`

#### Ejecución

```bash
npm run dev     # desarrollo (nodemon)
npm start       # producción
```

El servidor escucha en `http://localhost:4000`.

### Variables de entorno

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `PORT` | Puerto HTTP | `4000` |
| `DATABASE_URL` | Cadena de conexión a PostgreSQL | `postgresql://usuario:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Secreto para firmar los JWT | una cadena aleatoria larga |
| `FRONTEND_URL` | Origen(es) permitidos para CORS, separados por coma | `http://localhost:5173` |
| `FIREBASE_PROJECT_ID` | Id del proyecto de Firebase | `tu-proyecto` |
| `FIREBASE_CLIENT_EMAIL` | Email de la cuenta de servicio | `firebase-adminsdk-...@tu-proyecto.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Clave privada de la cuenta de servicio (con `\n`) | `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"` |

### Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Arranca en desarrollo (nodemon) |
| `npm start` | Arranca en producción |
| `npm run seed:demo` | Siembra datos demo (idempotente) |
| `npm run reset:demo` | Borra todos los datos demo |

### Flujos de autenticación

- **Entrenador (email/contraseña):** `POST /api/auth/register` crea un `TRAINER` con `status: PENDING` (sin token). Un admin debe aprobarlo antes de que pueda entrar.
- **Entrenador (Google):** si el email no existe, se crea un `TRAINER` como `PENDING`; si ya existe, se usa esa cuenta.
- **Portal del cliente:** el entrenador da acceso con `POST /api/clients/:id/invite`, que crea/vincula una cuenta `CLIENT` (solo Google). El cliente entra con Google usando ese email.
- **Quitar acceso:** `DELETE /api/clients/:id/invite` desvincula la cuenta.

### Endpoints de la API

Todos los endpoints excepto autenticación requieren `Authorization: Bearer <token>`.

**Auth (público)**

| Método | Endpoint | Descripción |
| --- | --- | --- |
| POST | `/api/auth/register` | Registro de entrenador (queda `PENDING`) |
| POST | `/api/auth/login` | Login con email/contraseña |
| POST | `/api/auth/google` | Login con Google (ID token de Firebase) |

**Perfil (cualquier usuario autenticado)**

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/profile` | Obtener el propio perfil |
| PUT | `/api/profile` | Actualizar nombre y teléfono |

**Clientes (entrenador/admin)**

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/clients` | Listar clientes propios |
| GET | `/api/clients/:id` | Obtener un cliente (con rutinas) |
| POST | `/api/clients` | Crear un cliente |
| PUT | `/api/clients/:id` | Actualizar un cliente |
| DELETE | `/api/clients/:id` | Eliminar un cliente |
| POST | `/api/clients/:id/invite` | Dar acceso al portal del cliente |
| DELETE | `/api/clients/:id/invite` | Quitar acceso al portal del cliente |

**Ejercicios (autenticado)**

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/exercises` | Listar ejercicios |
| GET | `/api/exercises/:id` | Obtener un ejercicio |
| POST | `/api/exercises` | Crear un ejercicio |
| PUT | `/api/exercises/:id` | Actualizar un ejercicio |
| DELETE | `/api/exercises/:id` | Eliminar un ejercicio |

**Rutinas (autenticado)**

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/workouts` | Listar rutinas |
| GET | `/api/workouts/:id` | Obtener una rutina (con ítems) |
| POST | `/api/workouts` | Crear una rutina |
| PUT | `/api/workouts/:id` | Actualizar una rutina |
| DELETE | `/api/workouts/:id` | Eliminar una rutina |
| POST | `/api/workouts/:id/items` | Añadir un ejercicio a la rutina |
| PUT | `/api/workouts/:id/items/:itemId` | Actualizar un ítem de la rutina |
| DELETE | `/api/workouts/:id/items/:itemId` | Quitar un ítem de la rutina |

**Calendario (entrenador/admin)**

| Método | Endpoint | Descripción |
| --- | --- | --- |
| POST | `/api/schedule` | Asignar una rutina a un cliente en una fecha |
| GET | `/api/schedule?clientId=&from=&to=` | Listar asignaciones en un rango |
| DELETE | `/api/schedule/:id` | Eliminar una asignación |

**Admin (solo admin)**

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/admin/stats` | Contadores globales (entrenadores, clientes, ejercicios, rutinas, pendientes) |
| GET | `/api/admin/users?role=` | Listar usuarios (opcionalmente por rol) |
| PUT | `/api/admin/users/:id/status` | Cambiar estado (`ACTIVE`/`PENDING`/`DISABLED`) |
| PUT | `/api/admin/trainers/:id/role` | Cambiar el rol de un usuario |
| DELETE | `/api/admin/trainers/:id` | Eliminar un usuario |

**Portal del cliente (solo cliente)**

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/me/profile` | Perfil propio + contacto del entrenador |
| GET | `/api/me/workouts` | Rutinas propias |
| GET | `/api/me/workouts/:id` | Detalle de rutina (con ejercicios) |
| GET | `/api/me/schedule` | Calendario propio |

**Salud**

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/health` | Health check |

### Despliegue

- **Hosting:** Render (Web Service) + Neon (PostgreSQL) + Firebase (Auth).
- **Build:** `npm install --include=dev && npx prisma generate`
- **Start:** `npm start`
- **Rama:** `develop`
- Configura las variables de entorno (incluida la cuenta de servicio de Firebase).
- Ajusta `FRONTEND_URL` al origen del frontend desplegado.
- Firebase: añade el dominio del frontend en **Authentication → Dominios autorizados** y restringe la API key del navegador en Google Cloud (referrers HTTP + APIs).

### Licencia

Propietaria — Todos los derechos reservados. © 2026 GZK-TXK.

No se concede permiso para usar, copiar, modificar, distribuir ni sublicenciar este software sin consentimiento previo por escrito. Ver [LICENSE](LICENSE).

### Autor

- GitHub: [@GZK-TXK](https://github.com/GZK-TXK)
