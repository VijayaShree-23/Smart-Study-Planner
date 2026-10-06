package com.smartstudyplanner.entity;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDateTime;
@Entity @Table(name="study_sessions") @Getter @Setter
public class StudySession { public enum Status{SCHEDULED,COMPLETED}
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 private LocalDateTime startTime; private LocalDateTime endTime; private Integer duration;
 @Enumerated(EnumType.STRING) private Status status=Status.SCHEDULED;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="task_id") private Task task;
 @ManyToOne(fetch=FetchType.EAGER) @JoinColumn(name="subject_id") private Subject subject;
 @ManyToOne(optional=false,fetch=FetchType.LAZY) @JoinColumn(name="user_id") private User user; }
