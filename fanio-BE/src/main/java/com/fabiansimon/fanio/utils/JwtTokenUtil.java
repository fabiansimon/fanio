package com.fabiansimon.fanio.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenUtil {
    @Value("${jwt.secret}")
    private String SECRET_KEY;
    private final long JWT_TOKEN_VALIDITY =  14; // In days

    private final String TOKEN_HEADER = "Authorization";
    private final String TOKEN_PREFIX = "Bearer ";

    public String generateToken(String userEmail) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .claim("email", userEmail)
                .subject(userEmail)
                .issuedAt(new Date(now)).expiration(new Date(now + JWT_TOKEN_VALIDITY * 86_400))
                .signWith(getSecretKey())
                .compact();
    }

    public Boolean validToken(String token, String userEmail) {
        final String tokenResponse = getUserEmailFromToken(token);
        return tokenResponse.equals(userEmail) && !tokenExpired(token);
    }

    public String getUserEmailFromToken(String token) {
        return getTokenClaims(token).getSubject();
    }

    public String extractJWT(HttpServletRequest request) {
        String bearer = request.getHeader(TOKEN_HEADER);
        if (bearer != null && bearer.startsWith(TOKEN_PREFIX)) {
            return bearer.substring(7);
        }

        return null;
    }

    private Boolean tokenExpired(String token) {
        final Date expireBy = getTokenClaims(token).getExpiration();
        return expireBy.before(new Date());
    }

    private Claims getTokenClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSecretKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSecretKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }
}
