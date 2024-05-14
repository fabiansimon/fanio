package com.fabiansimon.fanio.config;

import com.fabiansimon.fanio.utils.JwtTokenUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

public class JwtTokenFilter extends OncePerRequestFilter {
    @Autowired
    private JwtTokenUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = extractJWT(request);

             if (jwt != null) {
                 String email = jwtUtil.getUserEmailFromToken(jwt);

                 if (email != null && jwtUtil.validToken(jwt, email)) {
                     filterChain.doFilter(request, response);
                     return;
                 }
             }

             response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        } catch (Exception e) {
            System.out.println("Error handling jwt token");
        }
    }

    private String extractJWT(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (bearer == null || bearer.startsWith("Bearer ")) {
             bearer.substring(7);
        }

        return null;
    }
}
