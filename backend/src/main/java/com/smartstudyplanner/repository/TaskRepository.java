package com.smartstudyplanner.repository;
import com.smartstudyplanner.entity.Task; import org.springframework.data.jpa.repository.JpaRepository; import java.util.*;
public interface TaskRepository extends JpaRepository<Task,Long>{ List<Task> findByUserId(Long u); Optional<Task> findByIdAndUserId(Long id,Long u); }
