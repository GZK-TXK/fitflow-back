# FitFlow — Backend API

> REST API for a SaaS platform that helps personal trainers manage their clients, exercise library, training routines and weekly calendar, with a client portal, an admin panel, profile photos and real-time presence.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Firebase](https://img.shields.io/badge/Firebase-Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?logo=socket.io&logoColor=white)](https://socket.io)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#license)

[English](#english) | [Español](#espanol)

<a id="english"></a>
## English

### Overview

FitFlow is a multi-tenant REST API built with Node.js, Express and Prisma on top of PostgreSQL. It serves three types of users — **Admin**, **Trainer** and **Client** — and enforces at the query level that every user can only access their own data. Authentication supports email/password and Google (Firebase), with invitation-based registration and an account approval/activation workflow. Profile photos are stored on Cloudinary and real-time presence is delivered over Socket.IO.

### Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 4
- **ORM:** Prisma 5
- **Database:** PostgreSQL (Neon)
- **Auth:** JWT (`jsonwebtoken`) + `bcryptjs` + Firebase Admin (Google sign-in)
- **Real-time:** Socket.IO (authenticated with JWT)
- **Media:** Cloudinary + Multer (profile photo uploads)
- **Docs:** Swagger UI (OpenAPI 3) with `swagger-jsdoc` + `swagger-ui-express`
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
- Invitation-based registration: accounts are created from email-bound invite links (7-day expiry, single use).
- Account approval workflow: new trainers start as `PENDING` until an admin approves them.
- Admin can approve, activate and deactivate any account (trainers and clients).
- Per-trainer data isolation (ownership checks on every resource).
- Clients CRUD, with portal access control (grant/revoke).
- Exercise library CRUD (category and video URL).
- Training routines per client, with items (sets, reps, weight, rest time, order).
- Weekly calendar: assign routines to specific dates and times.
- Client portal endpoints (`/api/me/*`) for the client's own data.
- Trainer profile (name, phone and photo shown to clients).
- Profile photo upload (Cloudinary).
- Real-time presence (Socket.IO): admins see everyone online; trainers see their own clients.
- Interactive API documentation (OpenAPI 3 / Swagger UI), restricted to admins.
- Demo seeder with realistic data (trainers, clients, exercises, routines, calendar).

### Security

- Passwords hashed with **bcrypt** (10 salt rounds). Client portal accounts use Google only.
- **JWT** signed with HS256 (algorithm pinned), 7-day expiry.
- **Account status verified on every request**: pending/disabled users are rejected immediately.
- **Socket.IO** connections are authenticated with the same JWT and account status check.
- **Avatar uploads** restricted to images (max 5 MB) and proxied through the API to Cloudinary.
- **helmet** for HTTP security headers.
- **CORS** restricted to an allowlist via `FRONTEND_URL` (also used for the Socket.IO allowlist).
- **Rate limiting:** 300 req / 15 min globally and 10 req / 15 min on auth endpoints.
- **Input validation and sanitization** with `express-validator`.
- **Ownership checks** on every resource to prevent IDOR (broken access control).
- **Centralized error handling** with Prisma error mapping and no internal detail leakage.
- Firebase ID tokens verified server-side (`firebase-admin`).
- Secrets in environment variables (never committed); the app fails fast if required variables are missing.

### Data Model

- **User** — account. Fields: `email` (unique), `name`, `phone?`, `avatarUrl?`, `password?`, `firebaseUid?` (unique), `role`, `status`, `lastSeenAt?`, `stripeCustomerId?`. Relations: `clients` (as trainer), `clientAccount` (as client), `exercises`, `invitationsCreated`.
- **Client** — belongs to a User (trainer). Has many `Workout`, `ScheduledWorkout` and `Invitation`. Optional link to its own portal account via `accountUserId` (unique).
- **Exercise** — belongs to a User (trainer library). Used by `WorkoutItem`.
- **Workout** — a routine for a Client. Has many `WorkoutItem`.
- **WorkoutItem** — an exercise inside a routine (`sets`, `reps`, `weight`, `restTime`, `order`).
- **ScheduledWorkout** — assigns a `Workout` to a `Client` on a `date` (with `notes?`).
- **Invitation** — a single-use, email-bound invite (`token`, `type`, `email`, `expiresAt`, `usedAt?`), optionally linked to a `Client`.

Deletes cascade (removing a user/client removes its related records).

### Project Structure

```
fitflow-back/
├── index.js               # App entry point (HTTP server, middlewares + routes)
├── db.js                  # Prisma singleton
├── controllers/           # Request handlers
├── middlewares/           # Auth, roles, client, upload, docs auth, validation, error handler
├── routes/                # Express routers (with @openapi annotations)
├── validators/            # express-validator rule sets
├── lib/
│   ├── firebaseAdmin.js   # Firebase Admin (Google token verification)
│   ├── cloudinary.js      # Cloudinary client (avatar uploads)
│   ├── socket.js          # Socket.IO server (real-time presence)
│   └── swagger.js         # OpenAPI 3 definition (swagger-jsdoc)
├── prisma/
│   ├── schema.prisma      # Data model
│   ├── seed.js            # Demo seeder
│   └── reset-demo.js      # Removes demo data
└── .env                   # Local environment variables (not committed)
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

Create a `.env` file and set the environment variables required by the application. They are not listed here for security reasons.

#### Database

```bash
npx prisma db push
```

#### Demo data (optional)

```bash
npm run demo:clean   # deletes every user except the protected admin
npm run demo:seed    # creates the demo trainer + client with data
npm run demo:reset   # runs both (clean + seed)
```

> `demo:clean` is **destructive**: it keeps a single protected admin account and removes everyone else. Use `--yes` to skip the confirmation prompt.

Demo credentials:
- Trainer: `demoentrenador@demo.fitflow.app` / `Demo1234`
- Client (with portal access): `democliente@demo.fitflow.app` / `Demo1234`

The legacy full seeder (5 trainers × 7 clients) is still available via `npm run seed:demo` and `npm run reset:demo`.

#### Run

```bash
npm run dev     # development (nodemon)
npm start       # production
```

The server listens on `http://localhost:4000`.

### Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start in development (nodemon) |
| `npm start` | Start in production |
| `npm run seed:demo` | Seed the legacy demo data (5 trainers × 7 clients, idempotent) |
| `npm run reset:demo` | Delete the legacy demo data (by domain) |
| `npm run demo:clean` | Delete every user except the protected admin (`--yes` skips the prompt) |
| `npm run demo:seed` | Create the demo trainer + client with data |
| `npm run demo:reset` | Clean + seed the demo |

### Authentication Flows

- **Trainer (email/password):** registration is **invitation-only**. An admin creates an invitation (`POST /api/invitations` with `type: "TRAINER"`), which returns a link (`.../register?invite=<token>`). `POST /api/auth/register` requires that `inviteToken`; the account is created as `PENDING` (no token). An admin must approve it before the trainer can sign in.
- **Trainer (Google):** if the email is unknown, a valid invitation is required; otherwise the existing account is used.
- **Client portal:** an admin or the client's trainer creates an invitation (`type: "CLIENT"`); the email must match an existing client record. The client registers (email/password or Google) with the `inviteToken`, which links the account to the client. The account starts as `PENDING` until the trainer grants access.
- **Grant/revoke access:** `PUT /api/clients/:id/access` sets the portal account to `ACTIVE` or `DISABLED`.

### API Endpoints

All endpoints except auth require `Authorization: Bearer <token>`.

**Auth (public)**

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/register` | Register from an invitation (`inviteToken` required; starts as `PENDING`) |
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/google` | Google login (Firebase ID token; `inviteToken` required for new accounts) |

**Profile (any authenticated user)**

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/profile` | Get own profile |
| PUT | `/api/profile` | Update name and phone |
| POST | `/api/profile/avatar` | Upload/replace own profile photo (multipart field `avatar`) |

**Invitations**

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/invitations/:token` | Check an invitation (public: valid/used/expired) |
| POST | `/api/invitations` | Create an invitation (admin → trainers; admin/trainer → clients) |

**Clients (trainer/admin)**

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/api/clients` | List own clients |
| GET | `/api/clients/:id` | Get a client (with workouts) |
| POST | `/api/clients` | Create a client |
| PUT | `/api/clients/:id` | Update a client |
| DELETE | `/api/clients/:id` | Delete a client |
| PUT | `/api/clients/:id/access` | Grant or revoke portal access (`ACTIVE`/`DISABLED`) |

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
| GET | `/api/admin/users?role=` | List users (optionally filtered by role; includes `isOnline` and `lastSeenAt`) |
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

### Real-time Presence (Socket.IO)

The API runs a Socket.IO server on the same host and port. Authenticate the connection with the JWT:

```js
import { io } from 'socket.io-client'

const socket = io(API_BASE_URL, { auth: { token } })
```

- The handshake is authenticated with the JWT; accounts that are not `ACTIVE` are rejected.
- `presence:init` — sent to the socket on connect with the list of online user ids it can see (everyone for admins; their own clients for trainers).
- `presence:update` — emitted when a user connects or disconnects: `{ userId, online, lastSeenAt }`.
- `lastSeenAt` is persisted on the user when their last socket disconnects.

### API Documentation

The interactive OpenAPI 3 documentation is generated from the route annotations with `swagger-jsdoc` and served with `swagger-ui-express`.

- **Swagger UI:** `GET /api-docs` — restricted to an active **ADMIN**.
- **OpenAPI JSON:** `GET /api-docs.json` — restricted to an active **ADMIN** (used by the frontend).

Access is granted with the admin JWT, provided either as an `Authorization: Bearer <token>` header or as a `?token=<jwt>` query parameter. On a valid `?token=` navigation the server sets a short-lived httpOnly cookie so the Swagger UI assets load.

### Deployment

- **Hosting:** Render (Web Service) + Neon (PostgreSQL) + Firebase (Auth) + Cloudinary (media).
- **Build:** `npm install --include=dev && npx prisma generate`
- **Start:** `npm start`
- **Branch:** `develop`
- Set the environment variables in the hosting provider (not listed here).
- Set `FRONTEND_URL` to the deployed frontend origin (also used for the Socket.IO CORS allowlist).
- Render supports WebSockets, so real-time presence works out of the box.
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

FitFlow es una API REST multi-entrenador construida con Node.js, Express y Prisma sobre PostgreSQL. Da servicio a tres tipos de usuario — **Admin**, **Entrenador** y **Cliente** — y garantiza a nivel de consulta que cada usuario solo accede a sus propios datos. La autenticación admite email/contraseña y Google (Firebase), con registro por invitación y un flujo de aprobación/activación de cuentas. Las fotos de perfil se almacenan en Cloudinary y la presencia en tiempo real se entrega mediante Socket.IO.

### Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 4
- **ORM:** Prisma 5
- **Base de datos:** PostgreSQL (Neon)
- **Autenticación:** JWT (`jsonwebtoken`) + `bcryptjs` + Firebase Admin (login con Google)
- **Tiempo real:** Socket.IO (autenticado con JWT)
- **Multimedia:** Cloudinary + Multer (subida de fotos de perfil)
- **Docs:** Swagger UI (OpenAPI 3) con `swagger-jsdoc` + `swagger-ui-express`
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
- Registro por invitación: las cuentas se crean desde enlaces de invitación ligados a un email (7 días de validez, un solo uso).
- Aprobación de cuentas: los entrenadores nuevos quedan `PENDING` hasta que un admin los aprueba.
- El admin puede aprobar, activar y desactivar cualquier cuenta (entrenadores y clientes).
- Aislamiento de datos por entrenador (control de propiedad en cada recurso).
- CRUD de clientes, con control de acceso al portal (dar/quitar).
- CRUD de la biblioteca de ejercicios (categoría y URL de vídeo).
- Rutinas por cliente, con ítems (series, reps, peso, descanso, orden).
- Calendario: asignar rutinas a fechas y horas concretas.
- Endpoints del portal del cliente (`/api/me/*`) para sus propios datos.
- Perfil del entrenador (nombre, teléfono y foto visibles para sus clientes).
- Subida de foto de perfil (Cloudinary).
- Presencia en tiempo real (Socket.IO): el admin ve a todos los usuarios en línea; el entrenador ve a sus propios clientes.
- Documentación interactiva de la API (OpenAPI 3 / Swagger UI), restringida a administradores.
- Seeder de datos demo realistas (entrenadores, clientes, ejercicios, rutinas, calendario).

### Seguridad

- Contraseñas cifradas con **bcrypt** (10 rondas). Las cuentas del portal de cliente usan solo Google.
- **JWT** firmado con HS256 (algoritmo fijado), expiración de 7 días.
- **Estado de cuenta verificado en cada petición**: los usuarios pendientes/desactivados se rechazan de inmediato.
- Las conexiones de **Socket.IO** se autentican con el mismo JWT y comprueban el estado de la cuenta.
- Las **subidas de avatar** se limitan a imágenes (máx. 5 MB) y se envían a Cloudinary a través de la API.
- **helmet** para cabeceras de seguridad HTTP.
- **CORS** restringido a una allowlist mediante `FRONTEND_URL` (también usada por Socket.IO).
- **Rate limiting:** 300 peticiones / 15 min global y 10 peticiones / 15 min en autenticación.
- **Validación y saneado** con `express-validator`.
- **Control de propiedad** en cada recurso para evitar IDOR.
- **Manejo de errores centralizado** con mapeo de errores de Prisma y sin filtrar detalles internos.
- Tokens de Firebase verificados en el servidor (`firebase-admin`).
- Secretos en variables de entorno (nunca en el repositorio); la app falla al arrancar si faltan variables obligatorias.

### Modelo de datos

- **User** — cuenta. Campos: `email` (único), `name`, `phone?`, `avatarUrl?`, `password?`, `firebaseUid?` (único), `role`, `status`, `lastSeenAt?`, `stripeCustomerId?`. Relaciones: `clients` (como entrenador), `clientAccount` (como cliente), `exercises`, `invitationsCreated`.
- **Client** — pertenece a un User (entrenador). Tiene varios `Workout`, `ScheduledWorkout` e `Invitation`. Enlace opcional a su propia cuenta del portal mediante `accountUserId` (único).
- **Exercise** — pertenece a un User (biblioteca del entrenador). Se usa en `WorkoutItem`.
- **Workout** — rutina de un Client. Tiene varios `WorkoutItem`.
- **WorkoutItem** — un ejercicio dentro de una rutina (`sets`, `reps`, `weight`, `restTime`, `order`).
- **ScheduledWorkout** — asigna un `Workout` a un `Client` en una `date` (con `notes?`).
- **Invitation** — invitación de un solo uso ligada a un email (`token`, `type`, `email`, `expiresAt`, `usedAt?`), opcionalmente vinculada a un `Client`.

Los borrados son en cascada (eliminar un usuario/cliente elimina sus registros relacionados).

### Estructura del proyecto

```
fitflow-back/
├── index.js               # Punto de entrada (servidor HTTP, middlewares + rutas)
├── db.js                  # Singleton de Prisma
├── controllers/           # Manejadores de peticiones
├── middlewares/           # Auth, roles, cliente, subida, auth de docs, validación, errores
├── routes/                # Routers de Express (con anotaciones @openapi)
├── validators/            # Reglas de express-validator
├── lib/
│   ├── firebaseAdmin.js   # Firebase Admin (verificación de tokens de Google)
│   ├── cloudinary.js      # Cliente de Cloudinary (avatares)
│   ├── socket.js          # Servidor Socket.IO (presencia en tiempo real)
│   └── swagger.js         # Definición OpenAPI 3 (swagger-jsdoc)
├── prisma/
│   ├── schema.prisma      # Modelo de datos
│   ├── seed.js            # Seeder de demo
│   └── reset-demo.js      # Borra los datos demo
└── .env                   # Variables de entorno locales (no se sube)
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

Crea un archivo `.env` y configura las variables de entorno que necesita la aplicación. No se listan aquí por seguridad.

#### Base de datos

```bash
npx prisma db push
```

#### Datos demo (opcional)

```bash
npm run demo:clean   # borra todos los usuarios excepto el admin protegido
npm run demo:seed    # crea el entrenador y el cliente demo con datos
npm run demo:reset   # ejecuta ambos (limpieza + seed)
```

> `demo:clean` es **destructivo**: conserva una única cuenta de admin protegida y elimina el resto. Usa `--yes` para omitir la confirmación.

Credenciales demo:
- Entrenador: `demoentrenador@demo.fitflow.app` / `Demo1234`
- Cliente (con acceso al portal): `democliente@demo.fitflow.app` / `Demo1234`

El seeder completo antiguo (5 entrenadores × 7 clientes) sigue disponible con `npm run seed:demo` y `npm run reset:demo`.

#### Ejecución

```bash
npm run dev     # desarrollo (nodemon)
npm start       # producción
```

El servidor escucha en `http://localhost:4000`.

### Scripts

| Script | Descripción |
| --- | --- |
| `npm run dev` | Arranca en desarrollo (nodemon) |
| `npm start` | Arranca en producción |
| `npm run seed:demo` | Siembra los datos demo antiguos (5 entrenadores × 7 clientes, idempotente) |
| `npm run reset:demo` | Borra los datos demo antiguos (por dominio) |
| `npm run demo:clean` | Borra todos los usuarios excepto el admin protegido (`--yes` omite el prompt) |
| `npm run demo:seed` | Crea el entrenador y el cliente demo con datos |
| `npm run demo:reset` | Limpieza + seed del demo |

### Flujos de autenticación

- **Entrenador (email/contraseña):** el registro es **solo por invitación**. Un admin crea una invitación (`POST /api/invitations` con `type: "TRAINER"`), que devuelve un enlace (`.../register?invite=<token>`). `POST /api/auth/register` exige ese `inviteToken`; la cuenta se crea como `PENDING` (sin token). Un admin debe aprobarla antes de que el entrenador pueda entrar.
- **Entrenador (Google):** si el email no existe, se exige una invitación válida; si ya existe, se usa esa cuenta.
- **Portal del cliente:** un admin o el entrenador del cliente crea una invitación (`type: "CLIENT"`); el email debe coincidir con un cliente existente. El cliente se registra (email/contraseña o Google) con el `inviteToken`, que vincula la cuenta al cliente. La cuenta queda `PENDING` hasta que el entrenador da acceso.
- **Dar/quitar acceso:** `PUT /api/clients/:id/access` pone la cuenta del portal en `ACTIVE` o `DISABLED`.

### Endpoints de la API

Todos los endpoints excepto autenticación requieren `Authorization: Bearer <token>`.

**Auth (público)**

| Método | Endpoint | Descripción |
| --- | --- | --- |
| POST | `/api/auth/register` | Registro desde una invitación (`inviteToken` obligatorio; queda `PENDING`) |
| POST | `/api/auth/login` | Login con email/contraseña |
| POST | `/api/auth/google` | Login con Google (ID token de Firebase; `inviteToken` obligatorio para cuentas nuevas) |

**Perfil (cualquier usuario autenticado)**

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/profile` | Obtener el propio perfil |
| PUT | `/api/profile` | Actualizar nombre y teléfono |
| POST | `/api/profile/avatar` | Subir/reemplazar la foto de perfil (campo multipart `avatar`) |

**Invitaciones**

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/invitations/:token` | Consultar una invitación (público: válida/usada/caducada) |
| POST | `/api/invitations` | Crear una invitación (admin → entrenadores; admin/entrenador → clientes) |

**Clientes (entrenador/admin)**

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/clients` | Listar clientes propios |
| GET | `/api/clients/:id` | Obtener un cliente (con rutinas) |
| POST | `/api/clients` | Crear un cliente |
| PUT | `/api/clients/:id` | Actualizar un cliente |
| DELETE | `/api/clients/:id` | Eliminar un cliente |
| PUT | `/api/clients/:id/access` | Dar o quitar acceso al portal (`ACTIVE`/`DISABLED`) |

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
| GET | `/api/admin/users?role=` | Listar usuarios (opcionalmente por rol; incluye `isOnline` y `lastSeenAt`) |
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

### Presencia en tiempo real (Socket.IO)

La API levanta un servidor Socket.IO en el mismo host y puerto. Autentica la conexión con el JWT:

```js
import { io } from 'socket.io-client'

const socket = io(API_BASE_URL, { auth: { token } })
```

- El handshake se autentica con el JWT; las cuentas que no están `ACTIVE` se rechazan.
- `presence:init` — se envía al socket al conectar con la lista de ids de usuarios en línea que puede ver (todos para los admins; sus propios clientes para los entrenadores).
- `presence:update` — se emite cuando un usuario conecta o desconecta: `{ userId, online, lastSeenAt }`.
- `lastSeenAt` se guarda en el usuario cuando se desconecta su último socket.

### Documentación de la API

La documentación interactiva (OpenAPI 3) se genera a partir de las anotaciones de las rutas con `swagger-jsdoc` y se sirve con `swagger-ui-express`.

- **Swagger UI:** `GET /api-docs` — restringido a un **ADMIN** activo.
- **JSON OpenAPI:** `GET /api-docs.json` — restringido a un **ADMIN** activo (lo usa el frontend).

El acceso se concede con el JWT del admin, enviado como cabecera `Authorization: Bearer <token>` o como parámetro `?token=<jwt>`. Tras una navegación válida con `?token=`, el servidor establece una cookie httpOnly de corta duración para que carguen los assets de Swagger UI.

### Despliegue

- **Hosting:** Render (Web Service) + Neon (PostgreSQL) + Firebase (Auth) + Cloudinary (multimedia).
- **Build:** `npm install --include=dev && npx prisma generate`
- **Start:** `npm start`
- **Rama:** `develop`
- Configura las variables de entorno en el proveedor de hosting (no se listan aquí).
- Ajusta `FRONTEND_URL` al origen del frontend desplegado (también se usa para el CORS de Socket.IO).
- Render soporta WebSockets, así que la presencia en tiempo real funciona sin configuración extra.
- Firebase: añade el dominio del frontend en **Authentication → Dominios autorizados** y restringe la API key del navegador en Google Cloud (referrers HTTP + APIs).

### Licencia

Propietaria — Todos los derechos reservados. © 2026 GZK-TXK.

No se concede permiso para usar, copiar, modificar, distribuir ni sublicenciar este software sin consentimiento previo por escrito. Ver [LICENSE](LICENSE).

### Autor

- GitHub: [@GZK-TXK](https://github.com/GZK-TXK)
