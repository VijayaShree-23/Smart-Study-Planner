package com.smartstudyplanner.service;
import com.smartstudyplanner.entity.*; import com.smartstudyplanner.repository.*; import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service; import java.time.*; import java.util.*;
@Service @RequiredArgsConstructor public class ProgressService { private final TaskRepository tasks; private final StudySessionRepository sessions; private final SubjectService subjects; private final UserRepository users;
 private static long pct(long a,long b){ return b==0?0:Math.round(100.0*a/b); }
 public Map<String,Object> progress(Long uid){ var all=tasks.findByUserId(uid); long done=all.stream().filter(t->t.getStatus()==Task.Status.COMPLETED).count();
  long minutes=sessions.findByUserId(uid).stream().filter(s->s.getStatus()==StudySession.Status.COMPLETED&&s.getDuration()!=null).mapToLong(StudySession::getDuration).sum();
  Map<String,Object> m=new LinkedHashMap<>(); m.put("totalTasks",all.size()); m.put("completedTasks",done); m.put("pendingTasks",all.size()-done); m.put("overdueTasks",all.stream().filter(TaskService::overdue).count());
  m.put("overallProgress",pct(done,all.size())); m.put("studyHours",Math.round(minutes/6.0)/10.0); m.put("subjects",subjects.list(uid)); return m; }
 public Map<String,Object> dashboard(Long uid){ LocalDate today=LocalDate.now(); var all=tasks.findByUserId(uid); var open=all.stream().filter(t->t.getStatus()!=Task.Status.COMPLETED).toList();
  var todayTasks=all.stream().filter(t->today.equals(t.getDueDate())||(t.getCompletedAt()!=null&&t.getCompletedAt().toLocalDate().equals(today))).toList();
  long todayDone=todayTasks.stream().filter(t->t.getStatus()==Task.Status.COMPLETED).count();
  Map<String,Object> m=new LinkedHashMap<>(); m.put("name",users.findById(uid).orElseThrow().getName());
  m.put("todayTotal",todayTasks.size()); m.put("todayCompleted",todayDone); m.put("todayRemaining",todayTasks.size()-todayDone); m.put("todayProgress",pct(todayDone,todayTasks.size()));
  m.put("upcomingDeadlines",open.stream().filter(t->t.getDueDate()!=null&&!t.getDueDate().isBefore(today)).sorted(Comparator.comparing(Task::getDueDate)).limit(5).map(TaskService::view).toList());
  m.put("todaySessions",sessions.findByUserId(uid).stream().filter(s->s.getStartTime().toLocalDate().equals(today)).sorted(Comparator.comparing(StudySession::getStartTime)).map(StudySessionService::view).toList());
  m.put("subjects",subjects.list(uid));
  m.put("priorityTasks",open.stream().sorted(Comparator.comparingInt(TaskService::score).reversed()).limit(5).map(TaskService::view).toList()); return m; } }
