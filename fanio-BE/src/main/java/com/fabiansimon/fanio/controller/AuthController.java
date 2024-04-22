package com.fabiansimon.fanio.controller;

import com.fabiansimon.fanio.DTO.AuthTokenDTO;

import com.google.api.client.json.JsonFactory;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import java.util.Arrays;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    @Value("${google.client-id}")
    private String googleClientId;

    JacksonFactory jsonFactory = new JacksonFactory();

    @PostMapping("/auth/google")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthTokenDTO tokenDTO) {
        String token = tokenDTO.getToken();
        GoogleIdToken idToken = verifyGoogleToken(token);

        System.out.println(idToken);

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Authentication");
    }

    private GoogleIdToken verifyGoogleToken(String token) {
        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), jsonFactory)
                .setAudience(Arrays.asList(googleClientId))
                .build();

        try {
            return verifier.verify(token);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
