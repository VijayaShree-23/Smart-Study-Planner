# Smart Study Planner

A full-stack study management application for organizing subjects, tasks, scheduled study sessions, and academic progress.

## Features

- JWT-based registration and login with BCrypt password hashing
- Subject and task management with CRUD operations
- Task priorities, deadlines, status, search, filters, and smart rule-based prioritization
- Study-session scheduling and progress tracking
- Dashboard with study statistics and subject progress
- Focus Mode with configurable study timers
- Smart Plan for transparent rule-based task recommendations
- Progress and analytics views with charts, streaks, and achievements
- Responsive React interface
- Quartz Scheduler for persistent study-session jobs

## Tech Stack

**Frontend:** React 18, Vite, React Router, Axios, CSS  
**Backend:** Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA, JJWT, Quartz Scheduler  
**Database:** MySQL 8  
**Tools:** Maven, Git, GitHub, VS Code

## Architecture

```
React
  ↓
Axios / REST API
  ↓
Spring Boot
  ↓
Controller → Service → Repository → Entity
  ↓
MySQL

Study Session
  ↓
Quartz Scheduler
  ↓
Persistent Job / Trigger
  ↓
MySQL QRTZ_* tables
```

## Project Structure

```
Smart-Study-Planner/
├── backend/
│   ├── src/main/java/com/smartstudyplanner/
│   │   ├── config/
│   │   ├── controller/
│   │   ├── dto/
│   │   ├── entity/
│   │   ├── exception/
│   │   ├── repository/
│   │   ├── scheduler/
│   │   ├── security/
│   │   └── service/
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── quartz/
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── lib/
│   │   └── pages/
│   ├── package.json
│   └── vite.config.js
├── database/
│   └── schema.sql
├── QUARTZ-INTEGRATION.md
└── README.md
```

## Prerequisites

- JDK 17+
- Maven 3.9+
- Node.js 18+
- MySQL 8+

## Setup

### 1. Database

Make sure MySQL is running and create the database:

```sql
CREATE DATABASE smart_study_planner;
```

The schema is available in `database/schema.sql`.

### 2. Backend

Open a terminal:

```powershell
cd backend
mvn clean package
mvn spring-boot:run
```

Configure the required environment variables before starting the backend. See `.env.example`.

### 3. Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open:

`http://localhost:5173`

The backend runs on:

`http://localhost:8080`

## Quartz Scheduler

Study sessions are stored as application data in MySQL. When a session is scheduled, the backend creates a Quartz JobDetail and Trigger for that session. Quartz persists scheduler metadata in MySQL using the `QRTZ_*` tables and executes the job at the configured start time.

See [QUARTZ-INTEGRATION.md](QUARTZ-INTEGRATION.md) for the integration details and testing steps.

## Environment Variables

Use `.env.example` as a template. Never commit real database passwords, JWT secrets, or other credentials.

## API Overview

All endpoints except authentication endpoints require a JWT bearer token.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Get current user |
| GET/POST | `/api/tasks` | List/create tasks |
| GET/PUT/DELETE | `/api/tasks/{id}` | Manage a task |
| GET/POST | `/api/subjects` | List/create subjects |
| PUT/DELETE | `/api/subjects/{id}` | Manage a subject |
| GET/POST | `/api/study-sessions` | List/create study sessions |
| PUT/DELETE | `/api/study-sessions/{id}` | Manage a study session |
| GET | `/api/dashboard` | Dashboard statistics |
| GET | `/api/progress` | Progress statistics |

## Notes

The Smart Plan uses transparent rule-based prioritization; it is not an AI/ML model. Generated dependencies such as `node_modules/` and Maven `target/` are intentionally excluded from Git.

## Future Improvements

- Recurring study sessions
- Email reminders
- Automated tests
- Docker Compose
- Password reset and account management
