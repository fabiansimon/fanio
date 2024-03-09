package com.fabiansimon.fanio.repository;

import com.fabiansimon.fanio.model.Score;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ScoreRepository extends JpaRepository<Score, UUID> {
    Page<Score> findByQuizId(Pageable pageable, UUID quizId);
}
