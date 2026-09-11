# FitFlow — Backend API

> REST API for a SaaS platform that helps personal trainers manage their clients, exercise library and training routines.

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#license)

[English](README.md) | [Español](README.es.md)

## Overview

FitFlow is a multi-tenant REST API built with Node.js, Express and Prisma on top of PostgreSQL. Each trainer authenticates with JWT and can only access their own data (clients, exercises and routines), enforced at the query level.

## Tech Stack

- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 4
- **ORM:** Prisma 5
- **Database:** PostgreSQL (Neon)
- **Auth:** JWT (`jsonwebtoken`) + `bcryptjs`
- **Security:** `helmet`, `cors`, `express-rate-limit`, `express-validator`
- **Config:** `dotenv`

## Features

- Trainer authentication (register / login) with JWT
- Per-trainer data isolation
- Clients CRUD
- Exercise library CRUD (category and video URL)
- Training routines per client
- Routine items: add, edit and delete exercises with sets, reps, weight, rest time and order

## Security

- Passwords hashed with **bcrypt** (10 salt rounds), never stored in plain text
- **JWT** signed with HS256, algorithm pinned on verification, 7-day expiry
- **helmet** for HTTP security headers
- **CORS** restricted to an allowlist via `FRONTEND_URL`
- **Rate limiting:** 300 req / 15 min globally and 10 req / 15 min on auth endpoints
- **Input validation and sanitization** with `express-validator`
- **Ownership checks** on every resource to prevent IDOR (broken access control)
- **Centralized error handling** with Prisma error mapping and no internal detail leakage
- Secrets kept in environment variables; `.env.example` provided; the app fails fast if required variables are missing

## Data Model

- **User** — trainer account. Has many Clients and Exercises.
- **Client** — belongs to a User. Has many Workouts.
- **Exercise** — belongs to a User (the trainer's library) and is used inside WorkoutItems.
- **Workout** — a routine for a Client. Has many WorkoutItems.
- **WorkoutItem** — an exercise inside a routine (sets, reps, weight, rest time, order).

Deletes cascade (removing a client removes its routines, and so on).

## Project Structure

```
fitflow-back/
├── index.js               # App entry point (middlewares + routes)
├── db.js                  # Prisma singleton
├── controllers/           # Request handlers
├── middlewares/           # Auth, validation and error handler
├── routes/                # Express routers
├── validators/            # express-validator rule sets
├── prisma/
│   ├── schema.prisma      # Data model
│   └── seed.js            # Base exercise catalog
└── .env.example
```

## Getting Started

### Requirements

- Node.js 18 or higher
- A PostgreSQL database (e.g. Neon)
- npm

### Installation

```bash
git clone https://github.com/GZK-TXK/fitflow-back.git
cd fitflow-back
npm install
```

### Environment

```bash
cp .env.example .env
```

Then fill in the values (see the table below).

### Database

```bash
npx prisma db push
npx prisma db seed   # optional: loads a base exercise catalog
```

### Run

```bash
npm run dev     # development (nodemon)
npm start       # production
```

The server listens on `http://localhost:4000`.

## Environment Variables

| Variable | Description | Example |
| --- | --- | --- |
| `PORT` | HTTP port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `JWT_SECRET` | Secret used to sign JWTs | a long random string |
| `FRONTEND_URL` | Allowed CORS origin(s), comma-separated | `http://localhost:5173` |

## API Overview

Every route except the auth endpoints requires an `Authorization: Bearer <token>` header.

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

## License

Proprietary — All rights reserved. © 2026 GZK-TXK.

The source code is made available for viewing purposes only. No permission is granted to use, copy, modify, distribute or sublicense it without prior written consent. See [LICENSE](LICENSE).

## Author

- GitHub: [@GZK-TXK](https://github.com/GZK-TXK)