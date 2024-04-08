package com.fabiansimon.fanio.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class MetaResponseDTO {
    private String title;
    private String sourceTitle;
    private String imageUri;
    private Integer length;
}
