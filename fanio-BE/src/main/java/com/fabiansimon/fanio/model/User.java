package com.fabiansimon.fanio.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @CreationTimestamp
    private Date createdAt;

    private String userName;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "quiz_user_id", referencedColumnName = "id")
    private List<Quiz> quizzes;

    @OneToMany(cascade = CascadeType.ALL)
    @JoinColumn(name = "score_user_id", referencedColumnName = "id")
    private List<Score> scores;
}
