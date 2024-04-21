package com.fabiansimon.fanio.controller;

import com.fabiansimon.fanio.DTO.GameStatisticDTO;
import com.fabiansimon.fanio.DTO.MetaRequestDTO;
import com.fabiansimon.fanio.DTO.MetaResponseDTO;
import com.fabiansimon.fanio.service.MetaDataService;
import com.fabiansimon.fanio.service.QuestionService;
import com.fabiansimon.fanio.service.QuizService;
import com.fabiansimon.fanio.service.ScoreService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class MetaDataController {

    @Autowired
    QuestionService questionService = new QuestionService();
    @Autowired
    QuizService quizService = new QuizService();
    @Autowired
    ScoreService scoreService = new ScoreService();
    @Autowired
    MetaDataService metaDataService = new MetaDataService();

    @GetMapping("/statistic")
    public ResponseEntity<GameStatisticDTO> fetchTotalGameStatistic() {
        try {
            GameStatisticDTO gameStatistic = new GameStatisticDTO();
            gameStatistic.setTotalQuizzes(quizService.getQuizzesCount());
            gameStatistic.setTotalSongs(questionService.getDistinctSongsCount());
            gameStatistic.setTotalTime(scoreService.getTotalTimeElapsed());
            gameStatistic.setTotalGuesses(scoreService.getTotalGuesses());
            return ResponseEntity.ok(gameStatistic);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/strip-meta")
    public ResponseEntity<?> stripMetaOfYoutube(@RequestBody MetaRequestDTO requestDTO) {
        try {
            MetaResponseDTO response = metaDataService.getMetaData(requestDTO);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
