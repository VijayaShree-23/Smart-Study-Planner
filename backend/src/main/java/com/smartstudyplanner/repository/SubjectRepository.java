package com.smartstudyplanner.repository;
import com.smartstudyplanner.entity.Subject; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface SubjectRepository extends JpaRepository<Subject,Long>{ List<Subject> findByUserId(Long u); Optional<Subject> findByIdAndUserId(Long id,Long u); }
