package com.fabiansimon.fanio.controller;

import com.fabiansimon.fanio.service.LobbyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.UUID;

@Controller
public class LobbyController {
    @Autowired
    private final LobbyService lobbyService;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public LobbyController(LobbyService lobbyService, SimpMessagingTemplate messagingTemplate) {
        this.lobbyService = lobbyService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/lobby/create")
    @SendToUser("/queue/lobby-created")
    public String createLobby(Principal principal) {
        String lobbyId = lobbyService.createLobby();
        return lobbyId;
    }

    @MessageMapping("/lobby/{lobbyId}/exit")
    public void exitLobby(@DestinationVariable String lobbyId, String memberId) {
        lobbyService.leaveLobby(lobbyId, memberId);
        messagingTemplate.convertAndSend("/topic/lobby/" + lobbyId + "/members", lobbyService.getLobby(lobbyId).getMembers());
    }

    @MessageMapping("/lobby/{lobbyId}/join")
    public void joinLobby(@DestinationVariable String lobbyId, String memberId) {
        lobbyService.joinLobby(lobbyId, memberId);
        messagingTemplate.convertAndSend("/topic/lobby/" + lobbyId + "/members", lobbyService.getLobby(lobbyId).getMembers());
    }
}
