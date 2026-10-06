package com.smartstudyplanner.entity;
import jakarta.persistence.*; import lombok.*; import java.time.*;
@Entity @Table(name="tasks") @Getter @Setter
public class Task { public enum Priority{LOW,MEDIUM,HIGH} public enum Status{TODO,IN_PROGRESS,COMPLETED}
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private String title; @Column(length=1000) private String description;
 @Enumerated(EnumType.STRING) private Priority priority=Priority.MEDIUM; @Enumerated(EnumType.STRING) private Status status=Status.TODO;
 private LocalDate dueDate; private Integer estimatedMinutes; private LocalDateTime createdAt=LocalDateTime.now(); private LocalDateTime completedAt;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="subject_id") private Subject subject;
 @ManyToOne(optional=false,fetch=FetchType.LAZY) @JoinColumn(name="user_id") private User user; }
