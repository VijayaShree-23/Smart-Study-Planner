package com.smartstudyplanner.config;
import com.smartstudyplanner.entity.*; import com.smartstudyplanner.repository.*; import lombok.RequiredArgsConstructor; import org.springframework.beans.factory.annotation.Value; import org.springframework.boot.CommandLineRunner; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.stereotype.Component; import java.time.*;
/** Optional demo data (SEED_DEMO=true). Creates demo@studyplanner.local / Demo@12345 — clearly marked demo data. */
@Component @RequiredArgsConstructor public class DemoDataSeeder implements CommandLineRunner { private final UserRepository users; private final SubjectRepository subjects; private final TaskRepository tasks; private final PasswordEncoder enc;
 @Value("${app.seed-demo}") private boolean seed;
 @Override public void run(String... a){ if(!seed||users.existsByEmail("demo@studyplanner.local")) return;
  User u=new User(); u.setName("Demo Student"); u.setEmail("demo@studyplanner.local"); u.setPassword(enc.encode("Demo@12345")); users.save(u);
  String[][] subs={{"[Demo] DBMS","#3b5bdb"},{"[Demo] Operating Systems","#0b7285"},{"[Demo] Computer Networks","#5f3dc4"}}; Subject[] s=new Subject[3];
  for(int i=0;i<3;i++){ s[i]=new Subject(); s[i].setName(subs[i][0]); s[i].setColor(subs[i][1]); s[i].setUser(u); subjects.save(s[i]); }
  Object[][] t={{"Normalization assignment",0,Task.Priority.HIGH,1,90,Task.Status.TODO},{"CPU scheduling notes",1,Task.Priority.MEDIUM,3,60,Task.Status.IN_PROGRESS},{"TCP congestion control revision",2,Task.Priority.MEDIUM,4,45,Task.Status.TODO},{"ER diagram practice",0,Task.Priority.LOW,0,30,Task.Status.COMPLETED}};
  for(Object[] r:t){ Task k=new Task(); k.setTitle("[Demo] "+r[0]); k.setSubject(s[(int)r[1]]); k.setPriority((Task.Priority)r[2]); k.setDueDate(LocalDate.now().plusDays((int)r[3])); k.setEstimatedMinutes((int)r[4]); k.setStatus((Task.Status)r[5]); if(k.getStatus()==Task.Status.COMPLETED) k.setCompletedAt(LocalDateTime.now()); k.setUser(u); tasks.save(k); } } }
