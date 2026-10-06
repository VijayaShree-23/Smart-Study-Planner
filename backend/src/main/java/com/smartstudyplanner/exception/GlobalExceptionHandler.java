package com.smartstudyplanner.exception;
import org.springframework.dao.DataAccessException; import org.springframework.http.*; import org.springframework.web.bind.MethodArgumentNotValidException; import org.springframework.web.bind.annotation.*; import java.util.Map; import java.util.NoSuchElementException;
@RestControllerAdvice public class GlobalExceptionHandler {
 public static class ConflictException extends RuntimeException{ public ConflictException(String m){super(m);} }
 public static class InvalidLoginException extends RuntimeException{ public InvalidLoginException(String m){super(m);} }
 private ResponseEntity<Map<String,String>> r(HttpStatus s,String m){ return ResponseEntity.status(s).body(Map.of("message",m)); }
 @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<Map<String,String>> valid(MethodArgumentNotValidException e){ var f=e.getBindingResult().getFieldError(); return r(HttpStatus.BAD_REQUEST,f==null?"Invalid input":f.getField()+" "+f.getDefaultMessage()); }
 @ExceptionHandler(NoSuchElementException.class) ResponseEntity<Map<String,String>> nf(NoSuchElementException e){ return r(HttpStatus.NOT_FOUND,e.getMessage()==null?"Not found":e.getMessage()); }
 @ExceptionHandler(ConflictException.class) ResponseEntity<Map<String,String>> cf(ConflictException e){ return r(HttpStatus.CONFLICT,e.getMessage()); }
 @ExceptionHandler(InvalidLoginException.class) ResponseEntity<Map<String,String>> il(InvalidLoginException e){ return r(HttpStatus.UNAUTHORIZED,e.getMessage()); }
 @ExceptionHandler(IllegalArgumentException.class) ResponseEntity<Map<String,String>> ia(IllegalArgumentException e){ return r(HttpStatus.BAD_REQUEST,e.getMessage()); }
 @ExceptionHandler(DataAccessException.class) ResponseEntity<Map<String,String>> db(DataAccessException e){ return r(HttpStatus.INTERNAL_SERVER_ERROR,"A database error occurred"); } }
