package com.fabiansimon.fanio.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class GameStatisticDTO {
    Integer totalTime;
    Integer totalQuizzes;
    Integer totalSongs;
    Integer totalGuesses;

}
