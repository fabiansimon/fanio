package com.fabiansimon.fanio.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
public class MetaServiceTest {
    private static final List<String> sourceTitles = List.of(
            "BILLA JOE & FAROON - LIVE ON AIR (Official Video) prod. by Geenaro & Ghana Beats",
            "Peter Fox ft. reezy - TOAST",
            "KLEINER BROSKI",
            "ITACHI FLOW",
            "LOYALTY OVER LOVE",
            "STICKS & SEEDS",
            "BITCH BACK",
            "VORSICHT!",
            "Ansu feat. Levin Liam - Wünsche (prod. by Cato)",
            "OG Keemo - Fiesling/Boiler (prod. by Funkvater Frank)",
            "OG Keemo feat. Levin Liam - Bee Gees (prod by Funkvater Frank)"
    );

    private static final List<String> correctTrimmedTitles = List.of(
            "LIVE ON AIR",
            "TOAST" ,
            "KLEINER BROSKI",
            "ITACHI FLOW",
            "LOYALTY OVER LOVE",
            "STICKS & SEEDS",
            "BITCH BACK",
            "VORSICHT",
            "Wünsche",
            "Fiesling/Boiler",
            "Bee Gees"
    );

    @Autowired
    private MetaDataService metaDataService;

    @Test
    public void testTrimTitleFunctionality() {
        for (int i = 0; i < sourceTitles.size(); i++) {
            String currTitle = sourceTitles.get(i);
            String expected = correctTrimmedTitles.get(i);
            String trimmed = metaDataService.cleanRawTitle(currTitle);

            assertEquals(expected, trimmed, "Failed at sourceTitle: " + currTitle + ": expected \"" + expected + "\" got \"" + trimmed + "\" instead");
        }
    }
}
