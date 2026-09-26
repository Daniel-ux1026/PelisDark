package com.pelisdark.controller;

import java.util.Map;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.*;
import org.springframework.mail.MailException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class Errors {
    @ExceptionHandler(ResponseStatusException.class) ResponseEntity<?> status(ResponseStatusException ex) { return ResponseEntity.status(ex.getStatusCode()).body(Map.of("message",ex.getReason()==null?"Solicitud rechazada":ex.getReason())); }
    @ExceptionHandler(MethodArgumentNotValidException.class) ResponseEntity<?> validation() { return ResponseEntity.badRequest().body(Map.of("message","Revisa los campos y la longitud de la contrasena (12 a 64 caracteres)")); }
    @ExceptionHandler(MailException.class) ResponseEntity<?> mail() { return ResponseEntity.status(503).body(Map.of("message","No se pudo enviar el correo. Revisa el servidor SMTP e intenta nuevamente.")); }
    @ExceptionHandler(DataIntegrityViolationException.class) ResponseEntity<?> conflict() { return ResponseEntity.status(409).body(Map.of("message","La operacion no se pudo completar; actualiza e intenta nuevamente")); }
}
