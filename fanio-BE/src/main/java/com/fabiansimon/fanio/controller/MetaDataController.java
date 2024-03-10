package com.fabiansimon.fanio.controller;

import com.fabiansimon.fanio.DTO.MetaRequestDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api")
public class MetaDataController {
    @PostMapping("/strip-meta")
    public ResponseEntity<?> stripMetaOfYoutube(@RequestBody MetaRequestDTO requestDTO) {
        try {
            RestTemplate template = new RestTemplate();
            ResponseEntity<String> res = template.getForEntity(requestDTO.getUrl(), String.class);
            String title = stripTitle(res.getBody());
            title = cleanRawTitle(title);
            return ResponseEntity.ok(title);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Unable to extract the Title");
        }
    }

    private String stripTitle(String body) throws Exception {
        String startKey = "<title>", endKey = "</title>";
        int start = body.indexOf(startKey) + startKey.length();
        int end = body.indexOf(endKey);
        if (start == -1 || end == -1) {
            throw new Exception();
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
        String[] featKeys = {"feat",  "feat.", "ft", "ft.", "feature", "featuring", "by", "Official Video", "Official Music Video", "Music Video", "prod", "prod."};
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
