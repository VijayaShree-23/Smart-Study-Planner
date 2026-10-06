package com.smartstudyplanner.security;
import jakarta.servlet.*; import jakarta.servlet.http.*; import lombok.RequiredArgsConstructor; import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder; import org.springframework.stereotype.Component; import org.springframework.web.filter.OncePerRequestFilter; import java.io.IOException; import java.util.List;
@Component @RequiredArgsConstructor public class JwtAuthenticationFilter extends OncePerRequestFilter { private final JwtService jwt;
 @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain) throws ServletException,IOException {
  String h=req.getHeader("Authorization");
  if(h!=null&&h.startsWith("Bearer ")){ try{ Long id=jwt.parse(h.substring(7)); SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(id,null,List.of())); }catch(Exception ignored){} }
  chain.doFilter(req,res); } }
