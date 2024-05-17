package com.fabiansimon.fanio.service;

import com.fabiansimon.fanio.enums.TimeFrame;
import com.fabiansimon.fanio.model.Score;
import com.fabiansimon.fanio.repository.ScoreRepository;
import com.fabiansimon.fanio.utils.PythonScriptRunner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
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

    public Page<Score> getScoresForUser(Pageable pageable, UUID userId, Optional<UUID> quizId) {
        if (!quizId.isPresent())
            return scoreRepository.findScoresFromUser(pageable, userId);
        return scoreRepository.findScoresFromUserByQuiz(pageable, userId, quizId.get());
    }

    public Score getTopScoreFromQuiz(UUID quizId) { return scoreRepository.findQuizTopScore(quizId); }

    public Page<Score> getTopScores(Pageable pageable, TimeFrame timeFrame) {
        switch (timeFrame) {
            case day -> { return scoreRepository.findDailyTopScores(pageable); }
            default -> { return scoreRepository.findAllTimeTopScores(pageable); }
        }
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

    public Integer getScorePlacement(UUID quizId, Double score) {
        return scoreRepository.findScorePlacement(quizId, score) + 1; // Query gets the amount on top;
    }

    public boolean usesProfanity(String username) {
        try {
            for (String variant : usernameVariants(username)) {
                if (Boolean.parseBoolean(PythonScriptRunner.run("profanity_filter", variant))) return true;
            }

            return false;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    private List<String> usernameVariants(String src) {
        List<String> variants = new ArrayList<>();
        variants.add(src);

        String cleanUsername = cleanUserNameInput(src);

        variants.add(cleanUsername);
        variants.add(removeConsecutiveDuplicates(cleanUsername));

        return variants;
    }

    private String removeConsecutiveDuplicates(String username) {
        if (username == null || username.isEmpty()) {
            return username;
        }

        StringBuilder result = new StringBuilder();
        result.append(username.charAt(0));

        for (int i = 1; i < username.length(); i++) {
            if (username.charAt(i) != username.charAt(i - 1))
                result.append(username.charAt(i));
        }

        return result.toString();
    }
    private String cleanUserNameInput(String username) {

        StringBuilder stringBuilder = new StringBuilder();
        for (Character c : username.toCharArray()) {
            if (Character.isLetter(c)) stringBuilder.append(c);
        }

        return stringBuilder.toString();
    }
}
