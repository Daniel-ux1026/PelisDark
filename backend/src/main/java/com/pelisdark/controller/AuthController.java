package com.pelisdark.controller;

import java.security.Principal;
import java.util.*;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import com.pelisdark.dto.Requests.*;
import com.pelisdark.service.AuthService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.env.Environment;

@RestController
@RequestMapping("/api")
public class AuthController {
    private final AuthService auth;
    private final HttpSessionSecurityContextRepository contexts;
    private final Environment environment;
    public AuthController(AuthService auth,HttpSessionSecurityContextRepository contexts,Environment environment) { this.auth=auth; this.contexts=contexts; this.environment=environment; }
    @GetMapping("/health") public Map<String,String> health() { return Map.of("status","ok","database",Arrays.asList(environment.getActiveProfiles()).contains("preview")?"preview":"sqlserver"); }
    @GetMapping("/csrf") public Map<String,String> csrf(CsrfToken token) { return Map.of("token",token.getToken(),"headerName",token.getHeaderName()); }
    @PostMapping("/auth/register") public Map<String,String> register(@Valid @RequestBody Credentials input) { return Map.of("challengeId",auth.register(input)); }
    @PostMapping("/auth/login") public Map<String,String> login(@Valid @RequestBody Credentials input) { return Map.of("challengeId",auth.login(input)); }
    @PostMapping("/auth/verify") public Map<String,String> verify(@Valid @RequestBody Verification input,HttpServletRequest req,HttpServletResponse res) {
        String id=auth.verify(input);
        req.getSession(); req.changeSessionId();
        var context=SecurityContextHolder.createEmptyContext();
        context.setAuthentication(UsernamePasswordAuthenticationToken.authenticated(id,null,List.of(new SimpleGrantedAuthority("ROLE_USER"))));
        SecurityContextHolder.setContext(context); contexts.saveContext(context,req,res);
        return auth.me(id);
    }
    @GetMapping("/me") public Map<String,String> me(Principal user) { return auth.me(user.getName()); }
    @PutMapping("/me/password") public void password(Principal user,@Valid @RequestBody PasswordChange input,HttpServletRequest req) {
        auth.changePassword(user.getName(),input); req.getSession().invalidate(); SecurityContextHolder.clearContext();
    }
}
