# Nestify Backend API

This is the backend service for the Nestify platform.

## Technologies
- **Node.js** & **Express.js**
- **Prisma ORM**
- **PostgreSQL**
- **Socket.io** (Real-time features)
- **Zod** (Validation)

## Setup
1. `npm install`
2. Create `.env` from `.env.example`.
3. `npx prisma migrate dev` (To sync database schema).
4. `npm run dev`

## API Documentation
The API follows a modular structure located in `src/modules`.
- `/auth`: Authentication and registration.
- `/users`: User profile management.
- `/properties`: Property and unit listings.
- `/bookings`: Rental agreements and bookings.
