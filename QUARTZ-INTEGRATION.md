# Quartz Integration

This version preserves the upgraded Smart Study Planner and adds Quartz Scheduler to the existing study-session flow.

## What was added
- Spring Boot Quartz dependency
- JDBC-backed Quartz JobStore using the existing MySQL database
- `StudySessionJob`
- `StudySessionSchedulerService`
- Quartz startup backfill for upcoming scheduled sessions
- Quartz trigger creation on study-session creation/update and cancellation on delete/completion
- Idempotent MySQL `QRTZ_*` schema initialization

## Run
1. Start MySQL and ensure `smart_study_planner` exists.
2. From `backend` run: `mvn clean package`
3. Start backend: `mvn spring-boot:run`
4. From `frontend` run: `npm install` then `npm run dev`

## Test Quartz
Create a study session with a start time 1–2 minutes in the future. Keep the backend terminal open. At the scheduled time, the backend should log `[Quartz] Scheduled study session STARTED ...`.

Quartz scheduler metadata is persisted in `QRTZ_*` tables in MySQL.
