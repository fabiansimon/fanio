package com.fabiansimon.fanio.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class LobbyController {

    @MessageMapping("/lobby/join")
    @SendTo("/topic/lobby")
    public String joinLobby(String message) {
        return "User joined with message: " + message;
    }
}
