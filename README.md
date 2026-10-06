# Smart Study Planner

A full-stack study planner for students: subjects, tasks with deadlines, scheduled study sessions, and a progress dashboard. All data lives in MySQL and is served through a JWT-secured REST API.

## Features
- Register / login (BCrypt, JWT), protected API and React routes, persistent sessions
- Subjects: create, edit, delete, per-subject progress
- Tasks: CRUD, priority, status, deadline, estimate, search, filters (All/Today/Upcoming/Overdue/Completed), sort
- **Smart Prioritization** (rule-based, not AI): `score = priority weight (10/25/40) + deadline urgency (0–40) + workload (0–10)`; see `TaskService.score`. Tasks that are overdue or score ≥ 60 are flagged "Needs attention"
- Study sessions: schedule, complete, delete; today / upcoming / completed views
- Dashboard and Progress pages computed by the backend from the database
- Per-user data isolation: every query is scoped to the authenticated user's id

## Frontend highlights (v2 UI)
- **Dashboard**: live stats, weekly study chart, Today's Focus, deadlines, subject progress, achievements
- **Smart Plan** (`/smart-plan`): transparent rule-based ranking, score = urgency (0-40) + priority (0-25) + overdue (0-20) + subject-progress gap (0-10) + effort (0-5). Not AI/ML
- **Focus Mode** (`/focus`): 25/50/90/custom timer, persists across navigation/refresh, saves via `POST /api/study-sessions`
- **Analytics** (`/progress`): weekly hours, tasks/day, completion donut, session stats, streaks, achievements (dependency-free SVG/CSS charts)
- **Schedule**: month calendar + day agenda, create/edit/complete/delete sessions
- Header search, derived notification centre, toasts, loading/empty/error states, responsive down to 390px

## Tech stack
React 18, Vite, React Router, Axios · Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA, JJWT · MySQL 8

## Architecture
React → Axios → Spring Boot (JwtAuthenticationFilter → Controller → Service → Repository → Entity) → MySQL

## Database schema
`users` 1─* `subjects` 1─* `tasks` 1─* `study_sessions` (all also reference `users`). See `database/schema.sql`. Hibernate creates the tables automatically (`ddl-auto=update`); the SQL file is for reference/manual setup.

## Prerequisites
JDK 17+, Maven 3.9+, Node 18+, MySQL 8+

## Setup
1. MySQL: `mysql -u root -p < database/schema.sql` (optional; the database is also auto-created)
2. Backend (Linux/macOS; use `set` on Windows cmd):
```
cd backend
export DB_USERNAME=root DB_PASSWORD=your_password JWT_SECRET=$(openssl rand -hex 32)
export SEED_DEMO=true   # optional demo data
mvn spring-boot:run
```
3. Frontend:
```
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. Demo login (only if `SEED_DEMO=true`): `demo@studyplanner.local` / `Demo@12345`. Demo records are prefixed `[Demo]`.

## Environment variables
See `.env.example` (DB_URL, DB_USERNAME, DB_PASSWORD, JWT_SECRET, JWT_EXPIRATION_MS, CORS_ORIGIN, SEED_DEMO, VITE_API_URL).

## API (all except /api/auth/* need `Authorization: Bearer <token>`)
| Method | Path | Notes |
|---|---|---|
| POST | /api/auth/register, /api/auth/login | returns token + user |
| GET | /api/auth/me | current user |
| GET/POST | /api/tasks | `?subjectId=` filter; sorted by smart score |
| GET/PUT/DELETE | /api/tasks/{id} | |
| GET/POST | /api/subjects | includes task counts and progress |
| PUT/DELETE | /api/subjects/{id} | |
| GET/POST | /api/study-sessions | |
| PUT/DELETE | /api/study-sessions/{id} | |
| GET | /api/progress, /api/dashboard | aggregated stats |

Errors return `{ "message": "..." }` with 400/401/404/409/500.

## Screenshots
_Add screenshots here._

## Future improvements
Recurring sessions, password change, email reminders, automated tests, Docker Compose.
