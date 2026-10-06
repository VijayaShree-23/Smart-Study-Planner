package com.smartstudyplanner.config;

import com.smartstudyplanner.entity.StudySession;
import com.smartstudyplanner.repository.StudySessionRepository;
import com.smartstudyplanner.scheduler.StudySessionSchedulerService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;

/**
 * Quartz itself is configured in application.properties (spring.quartz.*): JDBC JobStore on the existing
 * MySQL datasource, schema from classpath:quartz/quartz-tables-mysql.sql, Spring-managed job instances.
 * This class only adds a startup back-fill for future SCHEDULED sessions that have no Quartz job yet
 * (e.g. sessions created before Quartz was introduced). Existing persisted jobs are left untouched.
 */
@Configuration
public class QuartzConfig {

    private static final Logger log = LoggerFactory.getLogger(QuartzConfig.class);

    @Bean
    ApplicationRunner quartzBackfillRunner(StudySessionRepository sessions, StudySessionSchedulerService scheduler) {
        return args -> {
            var upcoming = sessions.findByStatusAndStartTimeAfter(StudySession.Status.SCHEDULED, LocalDateTime.now());
            upcoming.forEach(scheduler::scheduleIfMissing);
            log.info("[Quartz] Startup check complete: {} upcoming study session(s) verified.", upcoming.size());
        };
    }
}
