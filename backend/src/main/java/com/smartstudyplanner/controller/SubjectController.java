package com.smartstudyplanner.controller;
import com.smartstudyplanner.dto.Dtos.SubjectRequest; import com.smartstudyplanner.service.SubjectService; import jakarta.validation.Valid; import lombok.RequiredArgsConstructor; import org.springframework.http.*; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.web.bind.annotation.*; import java.util.*;
@RestController @RequestMapping("/api/subjects") @RequiredArgsConstructor public class SubjectController { private final SubjectService s;
 @GetMapping public List<Map<String,Object>> list(@AuthenticationPrincipal Long u){ return s.list(u); }
 @PostMapping public ResponseEntity<Map<String,Object>> create(@AuthenticationPrincipal Long u,@Valid @RequestBody SubjectRequest r){ return ResponseEntity.status(HttpStatus.CREATED).body(s.create(u,r)); }
 @PutMapping("/{id}") public Map<String,Object> update(@AuthenticationPrincipal Long u,@PathVariable Long id,@Valid @RequestBody SubjectRequest r){ return s.update(u,id,r); }
 @DeleteMapping("/{id}") public ResponseEntity<Void> delete(@AuthenticationPrincipal Long u,@PathVariable Long id){ s.delete(u,id); return ResponseEntity.noContent().build(); } }
