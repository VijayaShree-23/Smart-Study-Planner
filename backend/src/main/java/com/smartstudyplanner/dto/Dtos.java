package com.smartstudyplanner.dto;
import jakarta.validation.constraints.*; import java.time.*;
public final class Dtos { private Dtos(){}
 public record LoginRequest(@Email @NotBlank String email,@NotBlank String password){}
 public record RegisterRequest(@NotBlank @Size(max=100) String name,@Email @NotBlank String email,@NotBlank @Size(min=8,message="must be at least 8 characters") String password){}
 public record AuthResponse(String token,Long id,String name,String email){}
 public record SubjectRequest(@NotBlank @Size(max=100) String name,@Size(max=500) String description,String color){}
 public record TaskRequest(@NotBlank @Size(max=200) String title,@Size(max=1000) String description,Long subjectId,String priority,String status,LocalDate dueDate,@Min(1) Integer estimatedMinutes){}
 public record StudySessionRequest(Long taskId,Long subjectId,@NotNull LocalDateTime startTime,@NotNull LocalDateTime endTime,String status){}
}
