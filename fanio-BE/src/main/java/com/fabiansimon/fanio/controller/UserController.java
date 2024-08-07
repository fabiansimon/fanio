package com.fabiansimon.fanio.controller;

import com.fabiansimon.fanio.DTO.AuthTokenDTO;

import com.fabiansimon.fanio.DTO.JWTUserDTO;
import com.fabiansimon.fanio.model.User;
import com.fabiansimon.fanio.service.UserService;
import com.fabiansimon.fanio.utils.JwtTokenUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;


@RestController
@RequestMapping("/api")
public class UserController {
    @Autowired
    private UserService userService;
    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @PostMapping("/auth/google")
    public ResponseEntity<?> authenticateUser(@RequestBody AuthTokenDTO tokenDTO) {
        String token = tokenDTO.getToken();
        GoogleIdToken idToken = userService.verifyGoogleToken(token);

        if (idToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Authentication");
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        String authId = payload.getSubject();
        Optional<User> user = userService.findUser(authId);

        String jwt;
        if (user.isPresent()) {
            jwt = jwtTokenUtil.generateToken(user.get().getEmail());
            return ResponseEntity.ok(new JWTUserDTO(jwt, user.get()));
        }

        User newUser = userService.createUserFromPayload(payload);
        User savedUser = userService.saveUser(newUser);
        jwt = jwtTokenUtil.generateToken(savedUser.getEmail());

        return ResponseEntity.status(HttpStatus.CREATED).body(new JWTUserDTO(jwt, savedUser));
    }
}
