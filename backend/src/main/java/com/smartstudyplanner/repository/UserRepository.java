package com.smartstudyplanner.repository;
import com.smartstudyplanner.entity.User; import org.springframework.data.jpa.repository.JpaRepository; import java.util.Optional;
public interface UserRepository extends JpaRepository<User,Long>{ Optional<User> findByEmail(String e); boolean existsByEmail(String e); }
