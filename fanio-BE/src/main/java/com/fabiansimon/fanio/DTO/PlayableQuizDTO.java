package com.fabiansimon.fanio.DTO;

import com.fabiansimon.fanio.model.Quiz;
import com.fabiansimon.fanio.model.Score;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class PlayableQuizDTO {
    private Quiz quiz;
    private Score topScore;
}
