package com.fabiansimon.fanio.repository;

import com.fabiansimon.fanio.model.Question;
import com.fabiansimon.fanio.model.Quiz;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface QuestionRepository extends JpaRepository<Question, UUID> {
    @Query(value = "SELECT COUNT(DISTINCT url) FROM questions", nativeQuery = true)
    Integer countDistinctSongs();
}
