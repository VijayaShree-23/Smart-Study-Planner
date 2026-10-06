package com.smartstudyplanner.service;
import com.smartstudyplanner.dto.Dtos.TaskRequest; import com.smartstudyplanner.entity.*; import com.smartstudyplanner.repository.*; import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service; import java.time.*; import java.time.temporal.ChronoUnit; import java.util.*;
@Service @RequiredArgsConstructor public class TaskService { private final TaskRepository tasks; private final UserRepository users; private final SubjectService subjects;
 /** Smart Prioritization: priority weight (10/25/40) + deadline urgency (0-40) + remaining workload (0-10). Completed tasks score 0. */
 public static int score(Task t){ if(t.getStatus()==Task.Status.COMPLETED) return 0;
  int p=switch(t.getPriority()){case HIGH->40;case MEDIUM->25;case LOW->10;}; int u=0;
  if(t.getDueDate()!=null){ long d=ChronoUnit.DAYS.between(LocalDate.now(),t.getDueDate()); u=d<0?40:(int)Math.max(0,30-d*4); }
  int w=t.getEstimatedMinutes()==null?0:Math.min(10,t.getEstimatedMinutes()/12); return p+u+w; }
 public static boolean overdue(Task t){ return t.getStatus()!=Task.Status.COMPLETED&&t.getDueDate()!=null&&t.getDueDate().isBefore(LocalDate.now()); }
 public static boolean needsAttention(Task t){ int s=score(t); return t.getStatus()!=Task.Status.COMPLETED&&(overdue(t)||s>=60); }
 public static Map<String,Object> view(Task t){ Map<String,Object> m=new LinkedHashMap<>(); m.put("id",t.getId()); m.put("title",t.getTitle()); m.put("description",t.getDescription());
  m.put("subjectId",t.getSubject()==null?null:t.getSubject().getId()); m.put("subjectName",t.getSubject()==null?null:t.getSubject().getName()); m.put("subjectColor",t.getSubject()==null?null:t.getSubject().getColor());
  m.put("priority",t.getPriority()); m.put("status",t.getStatus()); m.put("dueDate",t.getDueDate()); m.put("estimatedMinutes",t.getEstimatedMinutes()); m.put("completedAt",t.getCompletedAt());
  m.put("score",score(t)); m.put("overdue",overdue(t)); m.put("needsAttention",needsAttention(t)); return m; }
 public List<Map<String,Object>> list(Long uid,Long subjectId){ return tasks.findByUserId(uid).stream().filter(t->subjectId==null||(t.getSubject()!=null&&t.getSubject().getId().equals(subjectId)))
  .sorted(Comparator.comparingInt(TaskService::score).reversed()).map(TaskService::view).toList(); }
 public Map<String,Object> get(Long uid,Long id){ return view(owned(uid,id)); }
 public Map<String,Object> create(Long uid,TaskRequest r){ Task t=new Task(); t.setUser(users.getReferenceById(uid)); return view(tasks.save(apply(uid,t,r))); }
 public Map<String,Object> update(Long uid,Long id,TaskRequest r){ return view(tasks.save(apply(uid,owned(uid,id),r))); }
 public void delete(Long uid,Long id){ tasks.delete(owned(uid,id)); }
 public Task owned(Long uid,Long id){ return tasks.findByIdAndUserId(id,uid).orElseThrow(()->new NoSuchElementException("Task not found")); }
 private Task apply(Long uid,Task t,TaskRequest r){ t.setTitle(r.title().trim()); t.setDescription(r.description()); t.setDueDate(r.dueDate()); t.setEstimatedMinutes(r.estimatedMinutes());
  t.setSubject(r.subjectId()==null?null:subjects.owned(uid,r.subjectId()));
  if(r.priority()!=null) t.setPriority(Task.Priority.valueOf(r.priority()));
  if(r.status()!=null){ Task.Status s=Task.Status.valueOf(r.status()); t.setCompletedAt(s==Task.Status.COMPLETED?(t.getCompletedAt()==null?LocalDateTime.now():t.getCompletedAt()):null); t.setStatus(s); } return t; } }
