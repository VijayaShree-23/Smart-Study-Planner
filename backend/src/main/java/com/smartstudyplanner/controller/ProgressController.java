package com.smartstudyplanner.controller;
import com.smartstudyplanner.service.ProgressService; import lombok.RequiredArgsConstructor; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.web.bind.annotation.*; import java.util.Map;
@RestController @RequestMapping("/api") @RequiredArgsConstructor public class ProgressController { private final ProgressService s;
 @GetMapping("/progress") public Map<String,Object> progress(@AuthenticationPrincipal Long u){ return s.progress(u); }
 @GetMapping("/dashboard") public Map<String,Object> dashboard(@AuthenticationPrincipal Long u){ return s.dashboard(u); } }
