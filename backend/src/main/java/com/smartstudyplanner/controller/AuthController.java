package com.smartstudyplanner.controller;
import com.smartstudyplanner.dto.Dtos.*; import com.smartstudyplanner.service.AuthService; import jakarta.validation.Valid; import lombok.RequiredArgsConstructor; import org.springframework.http.*; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor public class AuthController { private final AuthService auth;
 @PostMapping("/register") public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest r){ return ResponseEntity.status(HttpStatus.CREATED).body(auth.register(r)); }
 @PostMapping("/login") public AuthResponse login(@Valid @RequestBody LoginRequest r){ return auth.login(r); }
 @GetMapping("/me") public AuthResponse me(@AuthenticationPrincipal Long uid){ if(uid==null) throw new org.springframework.security.access.AccessDeniedException("Unauthenticated"); return auth.me(uid); } }
