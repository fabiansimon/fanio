package com.fabiansimon.fanio.repository;

import com.fabiansimon.fanio.model.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface QuizRepository extends JpaRepository<Quiz, UUID> {
}
