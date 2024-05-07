package com.fabiansimon.fanio.controller;

import com.fabiansimon.fanio.DTO.PlayableQuizDTO;
import com.fabiansimon.fanio.enums.TimeFrame;
import com.fabiansimon.fanio.model.Quiz;
import com.fabiansimon.fanio.model.Score;
import com.fabiansimon.fanio.model.User;
import com.fabiansimon.fanio.service.QuizService;
import com.fabiansimon.fanio.service.ScoreService;
import com.fabiansimon.fanio.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class QuizController {
    @Autowired
    private QuizService quizService;
    @Autowired
    private ScoreService scoreService;
    @Autowired
    private UserService userService;

    @GetMapping("/quizzes")
    public ResponseEntity<Page<Quiz>> getAllQuizzes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Quiz> quizzes = quizService.getAllQuizzes(pageable);

        return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/top-quizzes")
    public ResponseEntity<?> getTopQuizzes(
            @RequestParam(defaultValue = "allTime") TimeFrame timeFrame,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
       Pageable pageable = PageRequest.of(page, size);
       Page<Quiz> quizzes = quizService.getTopQuizzes(pageable, timeFrame);
       return ResponseEntity.ok(quizzes);
    }

    @GetMapping("/search-quiz")
    public ResponseEntity<Page<Quiz>> searchForQuizzes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = true) String term
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Quiz> quizzes = quizService.getQuizzesByTerm(pageable, term);

        return ResponseEntity.ok(quizzes);
    }


    @GetMapping("/quiz/{id}")
    public ResponseEntity<?> getQuizById(@PathVariable UUID id,
                                         @RequestParam(defaultValue = "false") boolean includeDetails
    ) {
        Optional<Quiz> rawQuiz = quizService.getQuiz(id);
        if (rawQuiz.isPresent()) {
            if (!includeDetails) return ResponseEntity.ok(rawQuiz.get());

            Score topScore = scoreService.getTopScoreFromQuiz(id);
            PlayableQuizDTO quiz = new PlayableQuizDTO(rawQuiz.get(), topScore);
            return ResponseEntity.ok(quiz);
        }

        return ResponseEntity.notFound().build();
    }
    @PostMapping("/create-quiz")
    public ResponseEntity<Quiz> createQuiz(@RequestBody Quiz quiz, @RequestParam("userId") UUID userId) {
        try {
            User creator = userService.findUser(userId).get();
            quiz.setCreator(creator);

            return new ResponseEntity<>(quizService.saveQuiz(quiz), HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/delete-quiz/{id}")
    public ResponseEntity<?> deleteQuiz(@PathVariable UUID id) {
        if (quizService.deleteQuizById(id)) {
            return ResponseEntity.ok().build();
        }

        return ResponseEntity.notFound().build();
    }

    @PatchMapping("/quiz-finished/{id}")
    public ResponseEntity<?> onQuizFinish(@PathVariable UUID id) {
        Optional<Quiz> existingQuiz = quizService.getQuiz(id);
        if (!existingQuiz.isPresent())
            return ResponseEntity.notFound().build();

        Quiz quiz = existingQuiz.get();
        Integer totalPlays = quiz.getTotalPlays()+1;
        quiz.setTotalPlays(totalPlays);

        try {
            quizService.saveQuiz(quiz);
            return ResponseEntity.ok(totalPlays);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PatchMapping("/patch-quiz/{id}")
    public ResponseEntity<?> patchQuiz(@PathVariable UUID id, @RequestBody Map<String, Object> updates) {
        Optional<Quiz> existingQuiz = quizService.getQuiz(id);
        if (!existingQuiz.isPresent())
            return ResponseEntity.notFound().build();

        Quiz quiz = existingQuiz.get();

        if (updates.containsKey("title")) {
            quiz.setTitle((String) updates.get("title"));
        }
        if (updates.containsKey("description")) {
            quiz.setDescription((String) updates.get("description"));
        }
        if (updates.containsKey("isPrivate")) {
            quiz.setIsPrivate((Boolean) updates.get("isPrivate"));
        }
        if (updates.containsKey("randomOffsets")) {
            quiz.setRandomOffsets((Boolean) updates.get("randomOffsets")) ;
        }

        try {
            Quiz savedQuiz = quizService.saveQuiz(quiz);
            return ResponseEntity.ok(savedQuiz);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
