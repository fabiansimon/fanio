package com.fabiansimon.fanio.controller;

import com.fabiansimon.fanio.DTO.GameStatisticDTO;
import com.fabiansimon.fanio.DTO.MetaRequestDTO;
import com.fabiansimon.fanio.DTO.MetaResponseDTO;
import com.fabiansimon.fanio.service.QuestionService;
import com.fabiansimon.fanio.service.QuizService;
import com.fabiansimon.fanio.service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api")
public class MetaDataController {
    @Autowired
    QuestionService questionService = new QuestionService();
    @Autowired
    QuizService quizService = new QuizService();
    @Autowired
    ScoreService scoreService = new ScoreService();


    @GetMapping("/statistic")
    public ResponseEntity<GameStatisticDTO> fetchTotalGameStatistic() {
        try {
            GameStatisticDTO gameStatistic = new GameStatisticDTO();
            gameStatistic.setTotalQuizzes(quizService.getQuizzesCount());
            gameStatistic.setTotalSongs(questionService.getDistinctSongsCount());
            gameStatistic.setTotalTime(scoreService.getTotalTimeElapsed());
            gameStatistic.setTotalGuesses(scoreService.getTotalGuesses());
            return ResponseEntity.ok(gameStatistic);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/strip-meta")
    public ResponseEntity<MetaResponseDTO> stripMetaOfYoutube(@RequestBody MetaRequestDTO requestDTO) {
        try {
            RestTemplate template = new RestTemplate();
            ResponseEntity<String> res = template.getForEntity(requestDTO.getUrl(), String.class);
            String body = res.getBody();

            MetaResponseDTO metaData = new MetaResponseDTO();
            String title = cleanRawTitle(stripTitle(body));
            String imageUri = extractThumbnail(body);
            Integer length = extractLength(body);

            metaData.setTitle(title);
            metaData.setLength(length);
            metaData.setImageUri(imageUri);

            return ResponseEntity.ok(metaData);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    private String extractThumbnail(String body) throws Exception {
        String key = "thumbnails\":[{\"url\":\"";
        int start = body.indexOf(key), right;
        if (start == -1) {
            throw new Exception("Unable to extract the thumbnail");
        }

        start += key.length();
        right = start;
        while (body.charAt(right++) != '\\');

        return body.substring(start, right-1);
    }

    private Integer extractLength(String body) throws Exception {
        String key = "approxDurationMs";
        int start = body.indexOf(key), right;
        if (start == -1) {
            throw new Exception("Unable to extract the length");
        }
        start += key.length() + 3; // Include key length and remove the '""' and ':';
        right = start;
        while (Character.isDigit(body.charAt(right++)));
        return Integer.parseInt(body.substring(start, right-1)) / 1000; // milliseconds > seconds
    }

    private String stripTitle(String body) {
        String startKey = "<title>", endKey = "</title>";
        int start = body.indexOf(startKey) + startKey.length();
        int end = body.indexOf(endKey);
        if (start == -1 || end == -1) {
            return "";
        }
        return body.substring(start, end);
    }

    private static String trimSides(String title) {
        int left = 0, right = title.length()-1;

        while (!Character.isLetterOrDigit(title.charAt(left))) left++;
        while (!Character.isLetterOrDigit(title.charAt(right))) right--;

        return title.substring(left, right+1);
    }

    private String cleanRawTitle(String title) {
        String lowerTitle = title.toLowerCase();
        String[] featKeys = {"feat",  "feat.", "ft", "ft.", "feature", "featuring", "by", "Official Video", "Official Music Video", "Music Video", "prod", "prod.", "Official Version", "official version"};
        title = title.replace("- YouTube", "");
        int left = title.indexOf("-") != -1 ? title.indexOf("-") + 1 : 0;
        int right = title.length()-1;

        for (String s : featKeys) {
            int index = lowerTitle.indexOf(s.toLowerCase());
            if (index != -1) {
                right = Math.min(right, index);
            }
        }

        return trimSides(title.substring(left, right));
    }
}
