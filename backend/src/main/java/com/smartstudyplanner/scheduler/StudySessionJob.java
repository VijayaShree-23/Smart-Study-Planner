package com.smartstudyplanner.scheduler;

import com.smartstudyplanner.entity.StudySession;
import com.smartstudyplanner.repository.StudySessionRepository;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Optional;

/**
 * Quartz job fired at a study session's start time.
 * It only carries the session id (in the JobDataMap) and re-reads the session from MySQL,
 * so a session that was deleted/changed after scheduling is handled correctly.
 * Spring Boot's SpringBeanJobFactory autowires the repository field.
 */
public class StudySessionJob implements Job {

    public static final String SESSION_ID_KEY = "sessionId";
    private static final Logger log = LoggerFactory.getLogger(StudySessionJob.class);

    @Autowired
    private StudySessionRepository sessions;

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        Long sessionId = context.getMergedJobDataMap().getLong(SESSION_ID_KEY);

        Optional<StudySession> found = sessions.findById(sessionId);
        if (found.isEmpty()) {
            log.warn("[Quartz] Trigger fired for study session id={} but it no longer exists; nothing to do.", sessionId);
            return;
        }

        StudySession s = found.get();
        String task = s.getTask() == null ? "-" : s.getTask().getTitle();
        String subject = s.getSubject() == null ? "-" : s.getSubject().getName();
        log.info("[Quartz] Scheduled study session STARTED: id={}, task='{}', subject='{}', start={}, end={}, duration={} min, status={}",
                s.getId(), task, subject, s.getStartTime(), s.getEndTime(), s.getDuration(), s.getStatus());
    }
}
