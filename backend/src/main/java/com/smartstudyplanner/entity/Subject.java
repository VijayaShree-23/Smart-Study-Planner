package com.smartstudyplanner.entity;
import jakarta.persistence.*; import lombok.*; import java.time.LocalDateTime;
@Entity @Table(name="subjects") @Getter @Setter
public class Subject { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(nullable=false) private String name; @Column(length=500) private String description; private String color;
 private LocalDateTime createdAt=LocalDateTime.now();
 @ManyToOne(optional=false,fetch=FetchType.LAZY) @JoinColumn(name="user_id") private User user; }
