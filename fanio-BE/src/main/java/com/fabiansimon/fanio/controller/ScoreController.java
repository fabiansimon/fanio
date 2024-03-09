package com.fabiansimon.fanio.controller;

import com.fabiansimon.fanio.model.Score;
import com.fabiansimon.fanio.service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

    @GetMapping("/scores/{id}")
    public ResponseEntity<Page<Score>> getScoresFromQuiz(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @PathVariable UUID id
            ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Score> scores = scoreService.getScoresFromQuiz(pageable, id);
        return ResponseEntity.ok(scores);
    }

    @PostMapping("/upload-score")
    public ResponseEntity<Score> createScore(@RequestBody Score score) {
        Score savedScore = scoreService.saveScore(score);
        return new ResponseEntity<>(savedScore, HttpStatus.CREATED);
    }
}
