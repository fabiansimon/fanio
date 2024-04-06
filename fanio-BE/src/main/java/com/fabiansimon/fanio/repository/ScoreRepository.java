package com.fabiansimon.fanio.repository;

import com.fabiansimon.fanio.model.Score;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ScoreRepository extends JpaRepository<Score, UUID> {
    Page<Score> findByQuizId(Pageable pageable, UUID quizId);
    @Query(value = "SELECT SUM(time_elapsed) FROM scores", nativeQuery = true)
    Double countTotalTimeElapsed();
    @Query(value = "SELECT COUNT(qt.id) FROM scores s JOIN quizzes q ON s.quiz_id = q.id JOIN questions qt ON q.id = qt.quiz_id", nativeQuery = true)
    Integer countTotalGuesses();
    @Query(value = "SELECT * FROM scores WHERE DATE(created_at) = CURRENT_DATE ORDER BY total_score DESC", nativeQuery = true)
    Page<Score> findDailyTopScores(Pageable pageable);
    @Query(value = "SELECT * FROM scores ORDER BY total_score DESC", nativeQuery = true)
    Page<Score> findAllTimeTopScores(Pageable pageable);
    @Query(value = "SELECT * FROM scores WHERE quiz_id = :quizId ORDER BY total_score DESC LIMIT 1", nativeQuery = true)
    Score findQuizTopScore(UUID quizId);
    @Query(value = "SELECT COUNT(*) FROM scores WHERE quiz_id = :quizId AND total_score > :score", nativeQuery = true)
    Integer findScorePlacement(UUID quizId, Integer score);
}
