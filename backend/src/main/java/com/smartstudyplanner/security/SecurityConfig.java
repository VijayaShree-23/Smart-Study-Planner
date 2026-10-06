package com.smartstudyplanner.security;
import lombok.RequiredArgsConstructor; import org.springframework.beans.factory.annotation.Value; import org.springframework.context.annotation.*; import org.springframework.http.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity; import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; import org.springframework.security.crypto.password.PasswordEncoder; import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter; import org.springframework.web.cors.*; import java.util.List;
@Configuration @RequiredArgsConstructor public class SecurityConfig { private final JwtAuthenticationFilter filter;
 @Value("${app.cors.origin}") private String origin;
 @Bean PasswordEncoder encoder(){ return new BCryptPasswordEncoder(); }
 @Bean SecurityFilterChain chain(HttpSecurity http) throws Exception {
  http.csrf(c->c.disable()).cors(c->c.configurationSource(cors())).sessionManagement(s->s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
   .authorizeHttpRequests(a->a.requestMatchers("/api/auth/**").permitAll().requestMatchers(HttpMethod.OPTIONS,"/**").permitAll().anyRequest().authenticated())
   .exceptionHandling(e->e.authenticationEntryPoint((q,r,x)->{ r.setStatus(401); r.setContentType("application/json"); r.getWriter().write("{\"message\":\"Authentication required\"}"); }))
   .addFilterBefore(filter,UsernamePasswordAuthenticationFilter.class); return http.build(); }
 @Bean CorsConfigurationSource cors(){ CorsConfiguration c=new CorsConfiguration(); c.setAllowedOrigins(List.of(origin.split(","))); c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS")); c.setAllowedHeaders(List.of("*"));
  UrlBasedCorsConfigurationSource s=new UrlBasedCorsConfigurationSource(); s.registerCorsConfiguration("/**",c); return s; } }
