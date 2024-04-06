package com.fabiansimon.fanio.controller;

import com.fabiansimon.fanio.enums.TimeFrame;
import com.fabiansimon.fanio.model.Score;
import com.fabiansimon.fanio.service.ScoreService;
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
import java.util.UUID;


@RestController
@RequestMapping("/api")
public class ScoreController {
    @Autowired
    private ScoreService scoreService;

    @GetMapping("/scores")
    public ResponseEntity<Page<Score>> getAllScores(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Score> scores = scoreService.getAllScores(pageable);
        return ResponseEntity.ok(scores);
    }

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


    @GetMapping("/scores/{id}")
    public ResponseEntity<Page<Score>> getScoresFromQuiz(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @PathVariable UUID id
            ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("totalScore").descending());
        Page<Score> scores = scoreService.getScoresFromQuiz(pageable, id);
        return ResponseEntity.ok(scores);
    }

    @GetMapping("/score-placement/{quizId}/{score}")
    public ResponseEntity<?> getScorePlacement(@RequestParam UUID quizId,
                                               @RequestParam Integer score) {
        System.out.println(scoreService.getScorePlacement(quizId, score));
        return ResponseEntity.ok(scoreService.getScorePlacement(quizId, score));
    }

    @PostMapping("/upload-score")
    public ResponseEntity<?> createScore(@RequestBody Score score) {
        if (scoreService.usesProfanity(score.getUserName())) {
            Map<String, String> errorResponse = new HashMap<>();
            errorResponse.put("Profanity detected", "The username contains inappropriate content.");
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
        Score savedScore = scoreService.saveScore(score);
        return new ResponseEntity<>(savedScore, HttpStatus.CREATED);
    }
}
