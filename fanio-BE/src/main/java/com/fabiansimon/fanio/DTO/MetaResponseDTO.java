package com.fabiansimon.fanio.DTO;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class MetaResponseDTO {
    private String title;
    private String sourceTitle;
    private String imageUri;
    private String sourceUrl;
    private Integer length;
    private List<String> tags;
}
