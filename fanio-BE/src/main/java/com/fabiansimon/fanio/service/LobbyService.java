package com.fabiansimon.fanio.service;
import com.fabiansimon.fanio.model.Lobby;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

import com.fabiansimon.fanio.model.LobbyMember;
import com.fabiansimon.fanio.utils.PythonScriptRunner;
import org.springframework.stereotype.Service;

@Service
public class LobbyService {
    private final ConcurrentHashMap<String, Lobby> lobbies = new ConcurrentHashMap<>();

    public String createLobby(UUID quizId) {
        String lobbyId = generateLobbyId(6);
        lobbies.put(lobbyId, new Lobby(lobbyId, quizId));
        return lobbyId;
    }

    public boolean joinLobby(String lobbyId, String userName) throws Exception {
        userName = userName.trim();
        if (Boolean.parseBoolean(PythonScriptRunner.run("profanity_filter", userName))) throw new Exception("Username is containing profanity");
        Lobby lobby = lobbies.get(lobbyId);
        UUID sessionToken = UUID.randomUUID();

        for (LobbyMember member : lobby.getMembers().values()) {
            if (member.getUserName().toLowerCase().equals(userName)) throw new Exception("Username already taken");
        }

        if (lobby != null) {
            return lobby.addMember(sessionToken, userName);
        }
        throw new Exception("Lobby not found");
    }

    public boolean leaveLobby(String lobbyId, UUID sessionToken) {
        Lobby lobby = lobbies.get(lobbyId);
        if (lobby != null) {
            return lobby.removeMember(sessionToken);
        }
        return false;
    }

    public boolean updateMember(String lobbyId, UUID sessionToken, LobbyMember member) {
        Lobby lobby = lobbies.get(lobbyId);
        lobby.updateMember(sessionToken, member);
        return true;
    }

    public Lobby getLobby(String lobbyId) {
        return lobbies.get(lobbyId);
    }

    public void clearLobby(String lobbyId) { lobbies.remove(lobbyId); }

    private String generateLobbyId(int length) {
        Random random = new Random();
        StringBuilder stringBuilder = new StringBuilder();
        for (int i = 0; i < length; i++) {
            char randomChar = (char) ('A' + random.nextInt(26));
            stringBuilder.append(randomChar);
        }

        String result = stringBuilder.toString();

        if (lobbies.containsKey(result)) return generateLobbyId(length);
        return result;
    }
}
