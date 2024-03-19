package com.fabiansimon.fanio.service;

import com.fabiansimon.fanio.repository.QuestionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class QuestionService {
    @Autowired
    private QuestionRepository questionRepository;

    public Integer getDistinctSongsCount() {
        return questionRepository.countDistinctSongs();
    }

}
