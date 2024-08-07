package com.fabiansimon.fanio.service;

import com.fabiansimon.fanio.enums.TimeFrame;
import com.fabiansimon.fanio.model.Quiz;
import com.fabiansimon.fanio.repository.QuizRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class QuizService {
    @Autowired
    private QuizRepository quizRepository;

    public List<Quiz> getAllQuizzes() {
        return quizRepository.findAll();
    }

    public Page<Quiz> getAllQuizzes(Pageable pageable) {
        return quizRepository.findAllByIsPrivateFalse(pageable);
    }
    public Page<Quiz> getQuizzesByTerm(Pageable pageable, String term) {
        return quizRepository.findByTitleContainingIgnoreCaseOrTagsContainingAndIsPrivateFalse(term, pageable);
    }

    public Page<Quiz> getTopQuizzes(Pageable pageable, TimeFrame timeFrame) {
        switch (timeFrame) {
            case day -> { return quizRepository.findTopQuizzes(pageable); }
            default -> { return quizRepository.findTopQuizzes(pageable); }
        }
    }

    public Integer getQuizzesCount() {
        return (int) quizRepository.count();
    };

    public Optional<Quiz> getQuiz(UUID id) {
        return quizRepository.findById(id);
    }

    public Quiz saveQuiz(Quiz quiz) {
        return quizRepository.save(quiz);
    }

    public boolean deleteQuizById(UUID id) {
        if (quizRepository.existsById(id)) {
            quizRepository.deleteById(id);
            return true;
        }

        return false;
    }
}

