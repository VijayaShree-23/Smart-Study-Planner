package com.smartstudyplanner.controller;
import com.smartstudyplanner.dto.Dtos.TaskRequest; import com.smartstudyplanner.service.TaskService; import jakarta.validation.Valid; import lombok.RequiredArgsConstructor; import org.springframework.http.*; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api/tasks") @RequiredArgsConstructor public class TaskController { private final TaskService s;
 @GetMapping public List<Map<String,Object>> list(@AuthenticationPrincipal Long u,@RequestParam(required=false) Long subjectId){ return s.list(u,subjectId); }
 @GetMapping("/{id}") public Map<String,Object> get(@AuthenticationPrincipal Long u,@PathVariable Long id){ return s.get(u,id); }
 @PostMapping public ResponseEntity<Map<String,Object>> create(@AuthenticationPrincipal Long u,@Valid @RequestBody TaskRequest r){ return ResponseEntity.status(HttpStatus.CREATED).body(s.create(u,r)); }
 @PutMapping("/{id}") public Map<String,Object> update(@AuthenticationPrincipal Long u,@PathVariable Long id,@Valid @RequestBody TaskRequest r){ return s.update(u,id,r); }
 @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@AuthenticationPrincipal Long u,@PathVariable Long id){ s.delete(u,id); return ResponseEntity.noContent().build(); } }
