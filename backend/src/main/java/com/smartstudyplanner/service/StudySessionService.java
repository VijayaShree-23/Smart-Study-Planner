package com.smartstudyplanner.service;
import com.smartstudyplanner.dto.Dtos.StudySessionRequest; import com.smartstudyplanner.entity.*; import com.smartstudyplanner.repository.*; import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service; import com.smartstudyplanner.scheduler.StudySessionSchedulerService; import java.time.Duration; import java.time.LocalDateTime; import java.util.*;
@Service @RequiredArgsConstructor public class StudySessionService { private final StudySessionRepository sessions; private final UserRepository users; private final SubjectService subjects; private final TaskService taskSvc; private final StudySessionSchedulerService scheduler;
 public static Map<String,Object> view(StudySession s){ Map<String,Object> m=new LinkedHashMap<>(); m.put("id",s.getId()); m.put("taskId",s.getTask()==null?null:s.getTask().getId()); m.put("taskTitle",s.getTask()==null?null:s.getTask().getTitle());
  Subject sub=s.getSubject()!=null?s.getSubject():(s.getTask()!=null?s.getTask().getSubject():null);
  m.put("subjectId",sub==null?null:sub.getId()); m.put("subjectName",sub==null?null:sub.getName()); m.put("subjectColor",sub==null?null:sub.getColor());
  m.put("startTime",s.getStartTime()); m.put("endTime",s.getEndTime()); m.put("duration",s.getDuration()); m.put("status",s.getStatus()); return m; }
 public List<Map<String,Object>> list(Long uid){ return sessions.findByUserId(uid).stream().sorted(Comparator.comparing(StudySession::getStartTime)).map(StudySessionService::view).toList(); }
 public Map<String,Object> create(Long uid,StudySessionRequest r){ StudySession s=new StudySession(); s.setUser(users.getReferenceById(uid)); StudySession saved=sessions.save(apply(uid,s,r)); scheduler.schedule(saved); return view(saved); }
 public Map<String,Object> update(Long uid,Long id,StudySessionRequest r){ StudySession existing=owned(uid,id); LocalDateTime oldStart=existing.getStartTime(); StudySession.Status oldStatus=existing.getStatus();
  StudySession saved=sessions.save(apply(uid,existing,r));
  boolean startChanged=oldStart==null||!oldStart.equals(saved.getStartTime()); boolean statusChanged=oldStatus!=saved.getStatus();
  if(saved.getStatus()==StudySession.Status.COMPLETED) scheduler.cancel(saved.getId()); else if(startChanged||statusChanged) scheduler.schedule(saved);
  return view(saved); }
 public void delete(Long uid,Long id){ StudySession s=owned(uid,id); sessions.delete(s); scheduler.cancel(id); }
 private StudySession owned(Long uid,Long id){ return sessions.findByIdAndUserId(id,uid).orElseThrow(()->new NoSuchElementException("Study session not found")); }
 private StudySession apply(Long uid,StudySession s,StudySessionRequest r){ if(!r.endTime().isAfter(r.startTime())) throw new IllegalArgumentException("End time must be after start time");
  s.setStartTime(r.startTime()); s.setEndTime(r.endTime()); s.setDuration((int)Duration.between(r.startTime(),r.endTime()).toMinutes());
  s.setTask(r.taskId()==null?null:taskSvc.owned(uid,r.taskId())); s.setSubject(r.subjectId()==null?null:subjects.owned(uid,r.subjectId()));
  if(r.status()!=null) s.setStatus(StudySession.Status.valueOf(r.status())); return s; } }
