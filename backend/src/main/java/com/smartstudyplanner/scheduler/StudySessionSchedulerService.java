package com.smartstudyplanner.scheduler;

import com.smartstudyplanner.entity.StudySession;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.TriggerKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Set;

/**
 * Creates / replaces / removes the Quartz job+trigger that belongs to a StudySession.
 * Scheduling problems are logged but never thrown, so the REST APIs keep working
 * (the MySQL row is always the source of truth).
 */
@Service
public class StudySessionSchedulerService {

    public static final String GROUP = "study-sessions";
    /** A start time slightly in the past (clock skew / request latency) still fires immediately. */
    private static final long GRACE_SECONDS = 60;
    private static final Logger log = LoggerFactory.getLogger(StudySessionSchedulerService.class);

    private final Scheduler scheduler;

    public StudySessionSchedulerService(Scheduler scheduler) {
        this.scheduler = scheduler;
    }

    static JobKey jobKey(Long sessionId) { return JobKey.jobKey("study-session-" + sessionId, GROUP); }

    static TriggerKey triggerKey(Long sessionId) { return TriggerKey.triggerKey("study-session-trigger-" + sessionId, GROUP); }

    /** Schedules (or replaces) the job for this session. Returns true if a trigger is now in place. */
    public boolean schedule(StudySession session) {
        Long id = session.getId();
        LocalDateTime start = session.getStartTime();
        try {
            if (id == null || start == null) return false;
            if (session.getStatus() == StudySession.Status.COMPLETED) {
                cancel(id);
                return false;
            }
            if (start.isBefore(LocalDateTime.now().minusSeconds(GRACE_SECONDS))) {
                // Start time already in the past: nothing to wait for. Drop any stale trigger.
                cancel(id);
                log.info("[Quartz] Study session id={} starts in the past ({}); not scheduling.", id, start);
                return false;
            }

            JobDetail job = JobBuilder.newJob(StudySessionJob.class)
                    .withIdentity(jobKey(id))
                    .withDescription("Start of study session " + id)
                    .usingJobData(StudySessionJob.SESSION_ID_KEY, id)
                    .storeDurably(false)
                    .requestRecovery(true)
                    .build();

            Trigger trigger = TriggerBuilder.newTrigger()
                    .withIdentity(triggerKey(id))
                    .forJob(job)
                    .startAt(Date.from(start.atZone(ZoneId.systemDefault()).toInstant()))
                    .withSchedule(SimpleScheduleBuilder.simpleSchedule().withMisfireHandlingInstructionFireNow())
                    .build();

            // replace=true makes this idempotent: an existing job/trigger for the same id is replaced.
            scheduler.scheduleJob(job, Set.of(trigger), true);
            log.info("[Quartz] Scheduled study session id={} to fire at {}", id, start);
            return true;
        } catch (SchedulerException | RuntimeException e) {
            log.error("[Quartz] Could not schedule study session id={}: {}", id, e.toString(), e);
            return false;
        }
    }

    /** Removes the job and its trigger if present. Returns true if something was removed. */
    public boolean cancel(Long sessionId) {
        if (sessionId == null) return false;
        try {
            boolean removed = scheduler.deleteJob(jobKey(sessionId));
            if (removed) log.info("[Quartz] Cancelled scheduled job for study session id={}", sessionId);
            return removed;
        } catch (SchedulerException | RuntimeException e) {
            log.error("[Quartz] Could not cancel job for study session id={}: {}", sessionId, e.toString(), e);
            return false;
        }
    }

    /** Used at startup to back-fill sessions that pre-date Quartz without touching persisted triggers. */
    public void scheduleIfMissing(StudySession session) {
        try {
            if (session.getId() != null && !scheduler.checkExists(jobKey(session.getId()))) schedule(session);
        } catch (SchedulerException | RuntimeException e) {
            log.error("[Quartz] Could not check job for study session id={}: {}", session.getId(), e.toString(), e);
        }
    }
}
