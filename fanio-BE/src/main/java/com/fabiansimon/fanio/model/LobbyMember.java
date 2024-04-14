package com.fabiansimon.fanio.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class LobbyMember {
    private UUID sessionToken;
    private String userName;
    private Double totalScore;
    private Double timeElapsed;
    private Integer currRound;

    public LobbyMember(UUID sessionToken, String userName) {
        this.sessionToken = sessionToken;
        this.userName = userName;
        this.totalScore = 0.0;
        this.timeElapsed = 0.0;
        this.currRound = -1;
    }
}
