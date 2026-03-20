# TaskFlow — Task Management System

A full-stack Task Management System built with Node.js + TypeScript backend and Next.js 14 frontend.

## Tech Stack

**Backend**
- Node.js + Express
- TypeScript
- Prisma ORM (PostgreSQL)
- JWT Authentication (Access + Refresh Tokens)
- bcrypt password hashing
- Zod validation

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios
- react-hot-toast

## Features

- User Registration and Login
- JWT Access + Refresh Token authentication
- Create, Read, Update, Delete tasks
- Filter tasks by status
- Search tasks by title
- Toggle task status (Pending → In Progress → Completed)
- Pagination
- Responsive design (mobile + desktop)
- Toast notifications

## API Endpoints

### Auth
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout

### Tasks (Protected)
- GET /tasks
- POST /tasks
- GET /tasks/:id
- PATCH /tasks/:id
- DELETE /tasks/:id
- POST /tasks/:id/toggle

## How to Run

### Backend
cd backend
npm install
npx prisma migrate dev
npm run dev

### Frontend
cd frontend
npm install
npm run dev

Open http://localhost:3000