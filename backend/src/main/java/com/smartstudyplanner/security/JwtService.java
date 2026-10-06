package com.smartstudyplanner.security;
import io.jsonwebtoken.*; import io.jsonwebtoken.security.Keys; import org.springframework.beans.factory.annotation.Value; import org.springframework.stereotype.Service;
import javax.crypto.SecretKey; import java.nio.charset.StandardCharsets; import java.util.Date;
@Service public class JwtService { private final SecretKey key; private final long exp;
 public JwtService(@Value("${app.jwt.secret}") String s,@Value("${app.jwt.expiration-ms}") long exp){ key=Keys.hmacShaKeyFor(s.getBytes(StandardCharsets.UTF_8)); this.exp=exp; }
 public String generate(Long userId){ return Jwts.builder().subject(String.valueOf(userId)).issuedAt(new Date()).expiration(new Date(System.currentTimeMillis()+exp)).signWith(key).compact(); }
 public Long parse(String t){ return Long.valueOf(Jwts.parser().verifyWith(key).build().parseSignedClaims(t).getPayload().getSubject()); } }
