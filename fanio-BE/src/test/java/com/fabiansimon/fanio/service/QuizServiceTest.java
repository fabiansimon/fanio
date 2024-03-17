package com.fabiansimon.fanio.service;

import com.fabiansimon.fanio.model.Quiz;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
public class QuizServiceTest {
    private static final String TEST_QUIZ_TITLE = "Test Quiz";
    private static final String TEST_QUIZ_DESCRIPTION = "This is a test quiz description";

    @Autowired
    private QuizService quizService;

    private Quiz createTestQuiz() {
        Quiz quiz = new Quiz();
        quiz.setTitle(TEST_QUIZ_TITLE);
        quiz.setDescription(TEST_QUIZ_DESCRIPTION);
        return quiz;
    }

    private Quiz saveQuizAndGet(Quiz quiz) {
        Quiz savedQuiz = quizService.saveQuiz(quiz);
        assertQuizMatchesTestData(savedQuiz);
        return savedQuiz;
    }

    private void assertQuizMatchesTestData(Quiz quiz) {
        assertThat(quiz.getTitle()).isEqualTo(TEST_QUIZ_TITLE);
        assertThat(quiz.getDescription()).isEqualTo(TEST_QUIZ_DESCRIPTION);
    }

    private Optional<Quiz> getQuizById(UUID quizId) {
        Optional<Quiz> retrievedQuiz = quizService.getQuiz(quizId);
        assertThat(retrievedQuiz).isPresent();
        retrievedQuiz.ifPresent(this::assertQuizMatchesTestData);
        return retrievedQuiz;
    }

    @Test
    public void testQuizServiceOperations() {
        Quiz newQuiz = createTestQuiz();
        Quiz savedQuiz = saveQuizAndGet(newQuiz);
        getQuizById(savedQuiz.getId());
    }
}
