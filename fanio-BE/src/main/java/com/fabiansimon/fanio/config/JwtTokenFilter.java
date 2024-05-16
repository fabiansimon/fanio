package com.fabiansimon.fanio.config;

import com.fabiansimon.fanio.utils.JwtTokenUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtTokenFilter extends OncePerRequestFilter {
    final UserDetailsService userDetailsService;
    final JwtTokenUtil jwtUtil;

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

             if (email != null && jwtUtil.validToken(jwt, email) && SecurityContextHolder.getContext().getAuthentication() == null) {
                 UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                 UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                 authToken.setDetails(
                         new WebAuthenticationDetailsSource().buildDetails(request)
                 );
                 SecurityContextHolder.getContext().setAuthentication(authToken);
             } else {
                 response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
             }

        } catch (Exception e) {
            System.out.println(e);
            System.out.println("Error handling jwt token: " + e);
        }

        filterChain.doFilter(request, response);
    }
}
