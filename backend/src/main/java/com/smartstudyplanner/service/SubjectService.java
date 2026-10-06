package com.smartstudyplanner.service;
import com.smartstudyplanner.dto.Dtos.SubjectRequest; import com.smartstudyplanner.entity.*; import com.smartstudyplanner.repository.*; import lombok.RequiredArgsConstructor; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import java.util.*;
@Service @RequiredArgsConstructor public class SubjectService { private final SubjectRepository subjects; private final TaskRepository tasks; private final UserRepository users;
 public List<Map<String,Object>> list(Long uid){ var all=tasks.findByUserId(uid); return subjects.findByUserId(uid).stream().map(s->view(s,all)).toList(); }
 public Map<String,Object> view(Subject s,List<Task> all){ long t=all.stream().filter(x->x.getSubject()!=null&&x.getSubject().getId().equals(s.getId())).count();
  long c=all.stream().filter(x->x.getSubject()!=null&&x.getSubject().getId().equals(s.getId())&&x.getStatus()==Task.Status.COMPLETED).count();
  Map<String,Object> m=new LinkedHashMap<>(); m.put("id",s.getId()); m.put("name",s.getName()); m.put("description",s.getDescription()); m.put("color",s.getColor()); m.put("taskCount",t); m.put("completedCount",c); m.put("progress",t==0?0:Math.round(100.0*c/t)); return m; }
 public Map<String,Object> create(Long uid,SubjectRequest r){ Subject s=new Subject(); s.setUser(users.getReferenceById(uid)); apply(s,r); return view(subjects.save(s),tasks.findByUserId(uid)); }
 public Map<String,Object> update(Long uid,Long id,SubjectRequest r){ Subject s=owned(uid,id); apply(s,r); return view(subjects.save(s),tasks.findByUserId(uid)); }
 @Transactional public void delete(Long uid,Long id){ Subject s=owned(uid,id); tasks.findByUserId(uid).stream().filter(t->t.getSubject()!=null&&t.getSubject().getId().equals(id)).forEach(t->t.setSubject(null)); subjects.delete(s); }
 public Subject owned(Long uid,Long id){ return subjects.findByIdAndUserId(id,uid).orElseThrow(()->new NoSuchElementException("Subject not found")); }
 private void apply(Subject s,SubjectRequest r){ s.setName(r.name().trim()); s.setDescription(r.description()); s.setColor(r.color()==null||r.color().isBlank()?"#3b5bdb":r.color()); } }
