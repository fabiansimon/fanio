package com.fabiansimon.fanio.controller;

import com.fabiansimon.fanio.DTO.GameStatisticDTO;
import com.fabiansimon.fanio.DTO.MetaRequestDTO;
import com.fabiansimon.fanio.DTO.MetaResponseDTO;
import com.fabiansimon.fanio.service.QuestionService;
import com.fabiansimon.fanio.service.QuizService;
import com.fabiansimon.fanio.service.ScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api")
public class MetaDataController {

    @Value("${youtube.api-key}")
    private String youtubeKey;
    @Autowired
    QuestionService questionService = new QuestionService();
    @Autowired
    QuizService quizService = new QuizService();
    @Autowired
    ScoreService scoreService = new ScoreService();
    RestTemplate template = new RestTemplate();

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
    public ResponseEntity<?> stripMetaOfYoutube(@RequestBody MetaRequestDTO requestDTO) {
        try {
            ResponseEntity<String> res = template.getForEntity(requestDTO.getUrl(), String.class);
            String body = res.getBody();

            MetaResponseDTO metaData = new MetaResponseDTO();

            fetchYoutubeData("123");

            String sourceTitle = stripTitle(body);
            String title = cleanRawTitle(sourceTitle);
            String imageUri = extractThumbnail(body);
            Integer length = extractLength(body);

            metaData.setTitle(title);
            metaData.setSourceTitle(sourceTitle);
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

    private String fetchYoutubeData(String videoId) {
        System.out.println(videoId);
        System.out.println(youtubeKey);
        String url = UriComponentsBuilder
                .fromHttpUrl("https://www.googleapis.com/youtube/v3/videos")
                .queryParam("part", "id,snippet,contentDetails,statistics")
                .queryParam("id", videoId)
                .queryParam("key", youtubeKey)
                .toUriString();

        return template.getForObject(url, String.class);
    }
}
