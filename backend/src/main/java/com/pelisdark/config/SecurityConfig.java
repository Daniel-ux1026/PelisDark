package com.pelisdark.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

@Configuration
public class SecurityConfig {
    @Bean PasswordEncoder passwords() { return new BCryptPasswordEncoder(12); }
    @Bean HttpSessionSecurityContextRepository contexts() { return new HttpSessionSecurityContextRepository(); }
    @Bean SecurityFilterChain chain(HttpSecurity http, HttpSessionSecurityContextRepository contexts) throws Exception {
        return http
            .authorizeHttpRequests(a -> a
                .requestMatchers("/api/csrf", "/api/auth/register", "/api/auth/login", "/api/auth/verify", "/api/catalog", "/api/health").permitAll()
                .requestMatchers("/api/**").authenticated().anyRequest().denyAll())
            .securityContext(c -> c.securityContextRepository(contexts))
            .exceptionHandling(e -> e
                .authenticationEntryPoint((req,res,ex) -> res.sendError(401))
                .accessDeniedHandler((req,res,ex) -> res.sendError(403)))
            .headers(h -> h.contentSecurityPolicy(p -> p.policyDirectives("default-src 'none'; frame-ancestors 'none'")))
            .logout(l -> l.logoutUrl("/api/auth/logout").deleteCookies("JSESSIONID")
                .logoutSuccessHandler((req,res,auth) -> res.setStatus(204)))
            .build();
    }
}
