package com.pelisdark.security;

import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RateLimitFilter extends OncePerRequestFilter {
    private record Window(long start,int count) {}
    private final ConcurrentHashMap<String,Window> windows=new ConcurrentHashMap<>();
    @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain) throws ServletException,IOException {
        if (req.getRequestURI().startsWith("/api/auth/") && "POST".equals(req.getMethod())) {
            long now=System.currentTimeMillis();
            windows.entrySet().removeIf(e -> now-e.getValue().start()>600_000);
            if (windows.size()>10000) { res.sendError(429); return; }
            Window w=windows.compute(req.getRemoteAddr(),(k,old) -> old==null || now-old.start()>600_000 ? new Window(now,1) : new Window(old.start(),old.count()+1));
            if(w.count()>30) { res.setHeader("Retry-After","600"); res.sendError(429); return; }
        }
        chain.doFilter(req,res);
    }
}
