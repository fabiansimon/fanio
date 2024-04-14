package com.fabiansimon.fanio.DTO;

import com.fabiansimon.fanio.model.Lobby;
import com.fabiansimon.fanio.model.Quiz;
import com.fabiansimon.fanio.model.Score;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class InitLobbyDtO {
    private Quiz quiz;
    private Score topScore;
    private Lobby lobby;
}
