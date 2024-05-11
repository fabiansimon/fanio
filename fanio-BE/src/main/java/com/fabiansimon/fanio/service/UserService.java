package com.fabiansimon.fanio.service;

import com.fabiansimon.fanio.model.User;
import com.fabiansimon.fanio.repository.QuestionRepository;
import com.fabiansimon.fanio.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@Service
public class UserService {
    @Value("${google.client-id}")
    private String googleClientId;

    @Autowired
    private UserRepository userRepository;

    final JacksonFactory jsonFactory = new JacksonFactory();

    public User saveUser(User user) {
        return userRepository.save(user);
    }

    public Optional<User> findUser(String authId) {
        return userRepository.findByAuthId(authId);
    }

    public Optional<User> findUser(UUID userID) {
        return userRepository.findById(userID);
    }

    public GoogleIdToken verifyGoogleToken(String token) {
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

    public User createUserFromPayload(GoogleIdToken.Payload payload) {
        User newUser = new User();
        newUser.setFirstName((String) payload.get("given_name"));
        newUser.setLastName((String) payload.get("family_name"));
        newUser.setEmail(payload.getEmail());
        newUser.setAuthId(payload.getSubject());
        return newUser;
    }
}
