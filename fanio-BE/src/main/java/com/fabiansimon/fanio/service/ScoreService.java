package com.fabiansimon.fanio.service;

import com.fabiansimon.fanio.enums.TimeFrame;
import com.fabiansimon.fanio.model.Score;
import com.fabiansimon.fanio.repository.ScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
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

    public Score getTopScoreFromQuiz(UUID quizId) { return scoreRepository.findQuizTopScore(quizId); }

    public Page<Score> getTopScores(Pageable pageable, TimeFrame timeFrame) {
        switch (timeFrame) {
            case day -> { return scoreRepository.findDailyTopScores(pageable); }
        }
        return scoreRepository.findAllTimeTopScores(pageable);
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

    public boolean usesProfanity(String username) {
        try {
            String homeDirectory = System.getProperty("user.home");
            String path = homeDirectory + "/Developer/python_scripts/profanity_filter.py";

            /*  TODO:
                Handle Command Injection Vulnerability
             */

            username = cleanUserNameInput(username);

            List<String> commands = List.of("/Users/fabiansimon/opt/anaconda3/bin/python3", path, username);
            ProcessBuilder processBuilder = new ProcessBuilder(commands);
            processBuilder.redirectErrorStream(true);
            Process process = processBuilder.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            StringBuilder output = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                output.append(line);
            }

            int exitCode = process.waitFor();
            if (exitCode != 0) {
                return false;
            }

            return Boolean.parseBoolean(output.toString().trim());
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    String cleanUserNameInput(String username) {
        StringBuilder stringBuilder = new StringBuilder();
        for (Character c : username.toCharArray()) {
            if (Character.isLetter(c)) stringBuilder.append(c);
        }

        return stringBuilder.toString();
    }
}
