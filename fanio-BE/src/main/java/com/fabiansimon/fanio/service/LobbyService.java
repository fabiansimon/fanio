package com.fabiansimon.fanio.service;

import com.fabiansimon.fanio.model.Lobby;

import java.util.concurrent.ConcurrentHashMap;

public class LobbyService {
    private final ConcurrentHashMap<String, Lobby> lobbies = new ConcurrentHashMap<>();

    public String createLobby() {
        String lobbyId = generateUniqueID();
        lobbies.put(lobbyId, new Lobby(lobbyId));
        return lobbyId;
    }

    public void joinLobby(String lobbyId, String sessionId) {
        Lobby lobby = lobbies.get(lobbyId);
        if (lobby != null) {
            lobby.addMember(sessionId);
        }
    }

    private String generateUniqueID() {
        return Long.toHexString(System.nanoTime());
    }
}
