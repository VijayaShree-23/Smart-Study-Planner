package com.smartstudyplanner.service;
import com.smartstudyplanner.dto.Dtos.*; import com.smartstudyplanner.entity.User; import com.smartstudyplanner.exception.GlobalExceptionHandler.*; import com.smartstudyplanner.repository.UserRepository; import com.smartstudyplanner.security.JwtService;
import lombok.RequiredArgsConstructor; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.stereotype.Service;
@Service @RequiredArgsConstructor public class AuthService { private final UserRepository users; private final PasswordEncoder enc; private final JwtService jwt;
 public AuthResponse register(RegisterRequest r){ String email=r.email().trim().toLowerCase(); if(users.existsByEmail(email)) throw new ConflictException("An account with this email already exists");
  User u=new User(); u.setName(r.name().trim()); u.setEmail(email); u.setPassword(enc.encode(r.password())); return resp(users.save(u)); }
 public AuthResponse login(LoginRequest r){ User u=users.findByEmail(r.email().trim().toLowerCase()).orElseThrow(()->new InvalidLoginException("Invalid email or password"));
  if(!enc.matches(r.password(),u.getPassword())) throw new InvalidLoginException("Invalid email or password"); return resp(u); }
 public AuthResponse me(Long id){ return resp(users.findById(id).orElseThrow()); }
 private AuthResponse resp(User u){ return new AuthResponse(jwt.generate(u.getId()),u.getId(),u.getName(),u.getEmail()); } }
