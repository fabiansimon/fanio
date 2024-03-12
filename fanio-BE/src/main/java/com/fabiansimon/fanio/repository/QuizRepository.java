package com.fabiansimon.fanio.repository;

import com.fabiansimon.fanio.model.Quiz;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    @Query(value = "SELECT * FROM quizzes WHERE title ILIKE %:term%", nativeQuery = true)
    Page<Quiz> findByTitleContainingIgnoreCase(@Param("term") String name, Pageable pageable);
}
