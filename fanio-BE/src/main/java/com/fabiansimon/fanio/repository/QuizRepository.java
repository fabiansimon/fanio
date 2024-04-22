package com.fabiansimon.fanio.repository;

import com.fabiansimon.fanio.model.Quiz;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface QuizRepository extends JpaRepository<Quiz, UUID> {
    @Query(value = "SELECT * FROM quizzes q WHERE q.is_private = false AND " +
            "(q.title ILIKE %:term% OR EXISTS (" +
            "SELECT 1 FROM unnest(q.tags) as tag WHERE tag ILIKE %:term%" +
            "))", nativeQuery = true)
    Page<Quiz> findByTitleContainingIgnoreCaseOrTagsContainingAndIsPrivateFalse(@Param("term") String term, Pageable pageable);

    Page<Quiz> findAllByIsPrivateFalse(Pageable pageable);
}
