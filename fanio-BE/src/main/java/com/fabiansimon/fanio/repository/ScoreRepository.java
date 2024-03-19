package com.fabiansimon.fanio.repository;

import com.fabiansimon.fanio.model.Score;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface ScoreRepository extends JpaRepository<Score, UUID> {
    Page<Score> findByQuizId(Pageable pageable, UUID quizId);

    @Query(value = "SELECT SUM(time_elapsed) FROM scores", nativeQuery = true)
    Double countTotalTimeElapsed();

    // SELECT COUNT(qt.id) AS total_question_count FROM scores s JOIN quizzes q ON s.quiz_id = q.id JOIN questions qt ON q.id = qt.quiz_id;
    @Query(value = "SELECT COUNT(qt.id) FROM scores s JOIN quizzes q ON s.quiz_id = q.id JOIN questions qt ON q.id = qt.quiz_id", nativeQuery = true)
    Integer countTotalGuesses();
}
