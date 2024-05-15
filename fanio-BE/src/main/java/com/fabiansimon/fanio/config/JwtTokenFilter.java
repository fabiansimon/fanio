package com.fabiansimon.fanio.config;

import com.fabiansimon.fanio.utils.JwtTokenUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtTokenFilter extends OncePerRequestFilter {
    @Autowired
    private JwtTokenUtil jwtUtil;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = jwtUtil.extractJWT(request);

            if (jwt == null) {
                filterChain.doFilter(request, response);
                return;
            }

             String email = jwtUtil.getUserEmailFromToken(jwt);

            System.out.println(email);
             if (email != null && jwtUtil.validToken(jwt, email) && SecurityContextHolder.getContext().getAuthentication() == null) {
//                 SecurityContextHolder.set
                 filterChain.doFilter(request, response);
                 return;
             }

             response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        } catch (Exception e) {
            System.out.println("Error handling jwt token");
        }
    }
}
