package com.fabiansimon.fanio.controller;

import com.fabiansimon.fanio.DTO.InitLobbyDtO;
import com.fabiansimon.fanio.DTO.PlayableQuizDTO;
import com.fabiansimon.fanio.model.Lobby;
import com.fabiansimon.fanio.model.Quiz;
import com.fabiansimon.fanio.model.Score;
import com.fabiansimon.fanio.service.LobbyService;
import com.fabiansimon.fanio.service.QuizService;
import com.fabiansimon.fanio.service.ScoreService;
import jakarta.persistence.Lob;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.swing.text.html.Option;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class LobbyMetaController {

    @Autowired
    private final LobbyService lobbyService = new LobbyService();
    @Autowired
    private final ScoreService scoreService = new ScoreService();
    @Autowired
    private final QuizService quizService = new QuizService();

    @GetMapping("/lobby/{quizId}")
    public ResponseEntity<?> getLobbyById(
            @PathVariable UUID quizId,
            @RequestParam String lobbyId
    ) {
        Optional<Quiz> quiz = quizService.getQuiz(quizId);
        Score score = scoreService.getTopScoreFromQuiz(quizId);
        Lobby lobby = lobbyService.getLobby(lobbyId);

        InitLobbyDtO initLobby = new InitLobbyDtO(quiz.get(), score, lobby);

        if (initLobby != null) {
            return ResponseEntity.ok(initLobby);
        }

        return ResponseEntity.notFound().build();
    }
}
