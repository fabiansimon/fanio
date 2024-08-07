package com.fabiansimon.fanio.controller;

import com.fabiansimon.fanio.enums.TimeFrame;
import com.fabiansimon.fanio.model.Score;
import com.fabiansimon.fanio.model.User;
import com.fabiansimon.fanio.service.ScoreService;
import com.fabiansimon.fanio.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;


@RestController
@RequestMapping("/api")
public class ScoreController {
    @Autowired
    private ScoreService scoreService;
    @Autowired
    private UserService userService;

    @GetMapping("/top-scores")
    public ResponseEntity<Page<Score>> getTopScores(
             @RequestParam(defaultValue = "day") TimeFrame timeFrame,
             @RequestParam(defaultValue = "0") int page,
             @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Score> scores = scoreService.getTopScores(pageable, timeFrame);
        return ResponseEntity.ok(scores);
    }

    @GetMapping("/scores")
    public ResponseEntity<?> getScoresFromQuizAndUser(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam Optional<UUID> quizId,
            @RequestParam Optional<UUID> userId
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Score> scores;
        if (!userId.isPresent() && quizId.isPresent()) {
            scores = scoreService.getScoresFromQuiz(pageable, quizId.get());
        } else {
            scores = scoreService.getScoresForUser(pageable, userId.get(), quizId);
        }

        return ResponseEntity.ok(scores);
    }

    @GetMapping("/score-placement")
    public ResponseEntity<?> getScorePlacement(@RequestParam UUID quizId,
                                               @RequestParam Double score) {
        return ResponseEntity.ok(scoreService.getScorePlacement(quizId, score));
    }

    @PostMapping("/upload-score")
    public ResponseEntity<?> createScore(@RequestBody Score score, @RequestParam("userId") UUID userId) {
        if (scoreService.usesProfanity(score.getUserName())) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("Profanity detected", "The username contains inappropriate content.");
            return new ResponseEntity<>(errorResponse, HttpStatus.NOT_ACCEPTABLE);
        }
        User user = userService.findUser(userId).get();
        score.setUser(user);
        Score savedScore = scoreService.saveScore(score);

        return new ResponseEntity<>(savedScore, HttpStatus.CREATED);
    }
}
