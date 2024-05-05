package com.fabiansimon.fanio.service;

import com.fabiansimon.fanio.DTO.MetaRequestDTO;
import com.fabiansimon.fanio.DTO.MetaResponseDTO;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.hibernate.jdbc.Expectation;
import org.springframework.beans.factory.annotation.Value;
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
    private final Integer MAX_PLAYLIST_ITEMS = 10;
    RestTemplate template = new RestTemplate();

    public List<MetaResponseDTO> getMetaData(MetaRequestDTO requestDTO) throws Exception {
        String url = requestDTO.getUrl();

        String playlistId = extractPlaylistId(url);
        String videoId = extractVideoId(url);

        String json = playlistId != null ? fetchYoutubeListData(playlistId) : fetchYoutubeVideoData(videoId);
        List<MetaResponseDTO> response = extractJsonData(json, videoId, playlistId);

        return response;
    }

    private List<MetaResponseDTO> extractJsonData(String json, String videoId, String playlistId) {
        List<MetaResponseDTO> data = new ArrayList<>();
        ObjectMapper objectMapper = new ObjectMapper();

        boolean isPlaylist = playlistId != null;

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
                curr.setSourceUrl(generateYoutubeUri(isPlaylist ? listVideoId : videoId));

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

    private String fetchYoutubeVideoData(String videoId) throws Exception {
        String url = UriComponentsBuilder
                .fromHttpUrl("https://www.googleapis.com/youtube/v3/videos")
                .queryParam("part", "id,snippet,contentDetails,statistics")
                .queryParam("id", videoId)
                .queryParam("key", youtubeKey)
                .toUriString();

        try {
            return template.getForObject(url, String.class);
        } catch (Exception e) {
            throw new Exception(e);
        }

    }
    private String fetchYoutubeListData(String playlistId) throws Exception {
        String url = UriComponentsBuilder
                .fromHttpUrl("https://www.googleapis.com/youtube/v3/playlistItems")
                .queryParam("part", "id,snippet,contentDetails")
                .queryParam("maxResults", MAX_PLAYLIST_ITEMS + 1)
                .queryParam("playlistId", playlistId)
                .queryParam("key", youtubeKey)
                .toUriString();

        try {
            return template.getForObject(url, String.class);
        } catch (Exception e) {
            throw new Exception(e);
        }
    }

    private static String trimSides(String title) {
        if (title.isEmpty()) return title;

        int left = 0, right = title.length() - 1;

        while (left <= right && !Character.isLetterOrDigit(title.charAt(left))) left++;
        while (right >= left && !Character.isLetterOrDigit(title.charAt(right))) right--;

        return left <= right ? title.substring(left, right + 1) : "";
    }

    public static String cleanRawTitle(String title) {
        try {
            String[] featKeys = {"feat", "feat.", "ft", "ft.", "feature", "featuring", "by", "official video", "official music video", "music video", "prod", "prod.", "official version", "audio", "lyrics"};
            String lowerTitle = title.toLowerCase();

            String[] dashes = {" - ", " – ", " – "};
            int dashIndex = -1;
            for (String dash : dashes) {
                dashIndex = lowerTitle.indexOf(dash);
                if (dashIndex != -1) break;
            }
            int left = dashIndex == -1 ? 0 : dashIndex + 1;
            int right = title.length();

            for (String s : featKeys) {
                int i = lowerTitle.indexOf(s);
                if (i != -1 && i > left && !Character.isLetterOrDigit(title.charAt(i-1))) {
                    right = Math.min(right, i);
                }
            }

            return trimSides(title.substring(left, right));
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to clean title: " + title, e);
        }
    }
}
