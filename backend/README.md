# Backend
Spring Boot 3 / Java 17 / Maven. Run: `mvn spring-boot:run` (see root README for env vars).

## Quartz scheduler
Each study session gets a Quartz job (`study-sessions/study-session-<id>`) that fires at `startTime` and logs
`[Quartz] Scheduled study session STARTED ...`. Jobs are persisted in MySQL (`QRTZ_*` tables, created automatically
from `src/main/resources/quartz/quartz-tables-mysql.sql`) and survive restarts. Create, update (start time/status)
and delete of a session create, reschedule and cancel the job.
