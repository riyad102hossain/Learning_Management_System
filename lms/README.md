# LMS (Learning Management System)

A full-stack Learning Management System built with Node.js, Express, PostgreSQL, and React.

## Features

- User authentication (Student, Instructor, Admin roles)
- Course creation and management
- Module and lesson management
- Student enrollment and progress tracking
- JWT-based authentication
- Docker containerization

## Development Setup

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- PostgreSQL (handled by Docker)

### Environment Variables

Create a `.env` file in the root directory:

```env
DB_USER=lms_user
DB_PASSWORD=your_password
DB_NAME=lms_db
JWT_SECRET=your_jwt_secret
```

### Hot Reload Development

For development with hot reload, use the development Docker Compose file:

```bash
# Start all services with hot reload
docker-compose -f docker-compose.dev.yml up --build

# Or for short:
docker-compose -f docker-compose.dev.yml up -d --build
```

This will start:
- **Backend** (Node.js/Express): http://localhost:3000 with nodemon hot reload
- **Frontend** (React/Vite): http://localhost:5173 with Vite HMR
- **Database** (PostgreSQL): localhost:5432
- **Redis**: localhost:6379

### Manual Development (Without Docker)

If you prefer to run services manually:

```bash
# Backend
npm install
npm run dev  # Runs with nodemon on port 3000

# Frontend (in client/ directory)
cd client
npm install
npm run dev  # Runs with Vite HMR on port 5173
```

### Production Deployment

For production deployment:

```bash
# Build and start production containers
docker-compose up --build -d
```

This will start optimized production builds with:
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:5173 (served by nginx)

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login

### Courses
- `GET /courses` - Get all published courses
- `GET /courses/:id` - Get course details
- `POST /courses` - Create course (Instructor/Admin)
- `POST /courses/:id/enroll` - Enroll in course (Student)

### Course Management (Instructor/Admin)
- `GET /my-courses` - Get instructor's courses
- `POST /courses/:id/modules` - Add module to course
- `POST /modules/:id/lessons` - Add lesson to module

### Content & Progress
- `GET /courses/:id/contents` - Get course content
- `POST /lessons/:id/complete` - Mark lesson complete
- `GET /courses/:id/progress` - Get student progress

## Database Schema

The system uses PostgreSQL with the following main tables:
- `users` - User accounts with roles
- `courses` - Course information
- `modules` - Course modules
- `lessons` - Individual lessons
- `enrollments` - Student course enrollments
- `progress` - Lesson completion tracking

## Development Workflow

1. **Backend Changes**: Files in `src/` are automatically reloaded with nodemon
2. **Frontend Changes**: Files in `client/src/` use Vite's Hot Module Replacement
3. **Database Changes**: Modify `migrations/schema.sql` and restart containers
4. **Environment Changes**: Update `.env` and restart containers

## Scripts

### Backend Scripts
- `npm start` - Production server
- `npm run dev` - Development with nodemon
- `npm run migrate` - Run database migrations

### Frontend Scripts
- `npm run dev` - Development server with HMR
- `npm run build` - Production build
- `npm run preview` - Preview production build

## Docker Commands

```bash
# Development
docker-compose -f docker-compose.dev.yml up --build
docker-compose -f docker-compose.dev.yml down

# Production
docker-compose up --build -d
docker-compose down

# Logs
docker-compose -f docker-compose.dev.yml logs -f app
docker-compose -f docker-compose.dev.yml logs -f client
```