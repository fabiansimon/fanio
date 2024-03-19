package com.fabiansimon.fanio.service;

import com.fabiansimon.fanio.model.Score;
import com.fabiansimon.fanio.repository.ScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class ScoreService {
    @Autowired
    private ScoreRepository scoreRepository;

    public Page<Score> getAllScores(Pageable pageable) {
        return scoreRepository.findAll(pageable);
    }

    public Page<Score> getScoresFromQuiz(Pageable pageable, UUID quizId) {
        return scoreRepository.findByQuizId(pageable, quizId);
    }

    public Integer getTotalTimeElapsed() {
        return (int) (scoreRepository.countTotalTimeElapsed() / 60);
    }

    public Integer getTotalGuesses() {
        return scoreRepository.countTotalGuesses();
    }

    public Score saveScore(Score score) {
        return scoreRepository.save(score);
    }

}
