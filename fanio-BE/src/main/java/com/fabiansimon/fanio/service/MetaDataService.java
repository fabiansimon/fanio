package com.fabiansimon.fanio.service;

import com.fabiansimon.fanio.DTO.MetaRequestDTO;
import com.fabiansimon.fanio.DTO.MetaResponseDTO;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import com.google.gson.stream.JsonToken;
import org.checkerframework.checker.units.qual.A;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class MetaDataService {
    @Value("${youtube.api-key}")
    private String youtubeKey;
    private final Integer MAX_PLAYLIST_ITEMS = 15;
    RestTemplate template = new RestTemplate();

    public List<MetaResponseDTO> getMetaData(MetaRequestDTO requestDTO) {
        String url = requestDTO.getUrl();

        String playlistId = extractPlaylistId(url);
        String videoId = extractVideoId(url);

        String json = playlistId != null ? fetchYoutubeListData(playlistId) : fetchYoutubeVideoData(videoId);

        List<MetaResponseDTO> response = extractJsonData(json, videoId, playlistId);

        for (MetaResponseDTO res : response) {
            System.out.println(res.toString());
        }

        return response;
    }

    private List<MetaResponseDTO> extractJsonData(String json, String videoId, String playlistId) {
        List<MetaResponseDTO> data = new ArrayList<>();
        ObjectMapper objectMapper = new ObjectMapper();

        Boolean isPlaylist = playlistId != null;

        try {
            JsonNode rootNode = objectMapper.readTree(json);
            JsonNode itemsNode = rootNode.path("items");

            if (itemsNode.isMissingNode())
                return data;

            for (int i = 0; i < Math.min(itemsNode.size(), MAX_PLAYLIST_ITEMS) ; i++) {
                JsonNode itemNode = itemsNode.get(i);
                JsonNode snippedNode = itemNode.path("snippet");

                String duration = itemNode.path("contentDetails").path("duration").asText();
                String listVideoId = itemNode.path("contentDetails").path("videoId").asText();

                String sourceTitle = snippedNode.path("title").asText();
                String thumbnailUri = snippedNode.path("thumbnails").path("medium").path("url").asText();
                JsonNode tagsNode = snippedNode.path("tags");

                MetaResponseDTO curr = new MetaResponseDTO();

                curr.setLength(isPlaylist ? 60 : (int) Duration.parse(duration).getSeconds());
                curr.setTags(isPlaylist ? new ArrayList<>() : extractTags(tagsNode));
                curr.setTitle(cleanRawTitle(sourceTitle));
                curr.setSourceTitle(sourceTitle);
                curr.setImageUri(thumbnailUri);
                curr.setUri(generateYoutubeUri(isPlaylist ? listVideoId : videoId));

                data.add(curr);
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return data;
    }

    private String generateYoutubeUri(String id) {
        return "https://www.youtube.com/watch?v=" + id;
    }

    private ArrayList<String> extractTags(JsonNode node) {
        ArrayList<String> tags = new ArrayList<>();
        if (!node.isMissingNode()) {
            for (JsonNode tag : node) {
                tags.add(tag.asText());
            }
        }

        return tags;
    }

    private String extractVideoId(String url) {
        Matcher matcher = Pattern.compile("(?<=watch\\?v=)[^&]*").matcher(url);
        if (matcher.find()) {
            return matcher.group(0);
        }
        return "";
    }

    private String extractPlaylistId(String url) {
        Matcher matcher = Pattern.compile("(?<=list=)[^&]*").matcher(url);
        if (matcher.find()) {
            return matcher.group(0);
        }
        return null;
    }

    private String fetchYoutubeVideoData(String videoId) {
        String url = UriComponentsBuilder
                .fromHttpUrl("https://www.googleapis.com/youtube/v3/videos")
                .queryParam("part", "id,snippet,contentDetails,statistics")
                .queryParam("id", videoId)
                .queryParam("key", youtubeKey)
                .toUriString();

        return template.getForObject(url, String.class);
    }
    private String fetchYoutubeListData(String playlistId) {
        String url = UriComponentsBuilder
                .fromHttpUrl("https://www.googleapis.com/youtube/v3/playlistItems")
                .queryParam("part", "id,snippet,contentDetails")
                .queryParam("maxResults", MAX_PLAYLIST_ITEMS+1)
                .queryParam("playlistId", playlistId)
                .queryParam("key", youtubeKey)
                .toUriString();

        return template.getForObject(url, String.class);
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
        if (title.isEmpty()) return title;

        int left = 0, right = title.length() - 1;

        while (left <= right && !Character.isLetterOrDigit(title.charAt(left))) left++;
        while (right >= left && !Character.isLetterOrDigit(title.charAt(right))) right--;

        return left <= right ? title.substring(left, right + 1) : "";
    }

    private static String cleanRawTitle(String title) {
        try {
            String lowerTitle = title.toLowerCase();
            String[] featKeys = {"feat", "feat.", "ft", "ft.", "feature", "featuring", "by", "official video", "official music video", "music video", "prod", "prod.", "official version"};
            int dashIndex = title.indexOf("-");
            int left = dashIndex != -1 ? dashIndex + 1 : 0;
            int right = title.length() - 1;

            for (String s : featKeys) {
                int index = lowerTitle.indexOf(s);
                if (index != -1) {
                    right = Math.min(right, index);
                }
            }

            return trimSides(title.substring(left, right));
        } catch (Exception e) {
            return "";
        }
    }
}
