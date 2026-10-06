package com.smartstudyplanner.repository;
import com.smartstudyplanner.entity.StudySession; import org.springframework.data.jpa.repository.JpaRepository; import java.time.LocalDateTime; import java.util.*;
public interface StudySessionRepository extends JpaRepository<StudySession,Long>{ List<StudySession> findByUserId(Long u); Optional<StudySession> findByIdAndUserId(Long id,Long u); List<StudySession> findByStatusAndStartTimeAfter(StudySession.Status status,LocalDateTime after); }
