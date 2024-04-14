package com.fabiansimon.fanio.controller;

import com.fabiansimon.fanio.model.LobbyMember;
import com.fabiansimon.fanio.service.LobbyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import java.util.UUID;

@Controller
public class LobbySocketController {
    @Autowired
    private final LobbyService lobbyService = new LobbyService();
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public LobbySocketController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/lobby/create")
    @SendToUser("/queue/lobby-created")
    public String createLobby(UUID quizId) {
        String lobbyId = lobbyService.createLobby(quizId);
        return lobbyId;
    }

    @MessageMapping("/lobby/{lobbyId}/exit")
    public void exitLobby(@DestinationVariable String lobbyId, UUID sessionToken) {
        lobbyService.leaveLobby(lobbyId, sessionToken);
        if (lobbyService.getLobby(lobbyId).getMembers().size() == 0) {
            lobbyService.clearLobby(lobbyId);
        } else {
            messagingTemplate.convertAndSend("/topic/lobby/" + lobbyId + "/members", lobbyService.getLobby(lobbyId).getMembersAsList());
        }
    }

    @MessageMapping("/lobby/{lobbyId}/update-member")
    public void updateMember(@DestinationVariable String lobbyId, LobbyMember newState) {
        lobbyService.updateMember(lobbyId, newState.getSessionToken(), newState);
        messagingTemplate.convertAndSend("/topic/lobby/" + lobbyId + "/members", lobbyService.getLobby(lobbyId).getMembersAsList());
    }

    @MessageMapping("/lobby/{lobbyId}/join")
    public void joinLobby(@DestinationVariable String lobbyId, String userName) throws Exception {
        try {
            lobbyService.joinLobby(lobbyId, userName);
            messagingTemplate.convertAndSend("/topic/lobby/" + lobbyId + "/members", lobbyService.getLobby(lobbyId).getMembersAsList());
        } catch (Exception e) {
            System.out.println(e.getMessage());
            // return error with message
        }
    }
}
