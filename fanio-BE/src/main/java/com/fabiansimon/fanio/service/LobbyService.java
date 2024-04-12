package com.fabiansimon.fanio.service;
import com.fabiansimon.fanio.model.Lobby;

import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;
import java.util.UUID;

@Service
public class LobbyService {
    private final ConcurrentHashMap<String, Lobby> lobbies = new ConcurrentHashMap<>();

    // Create a new lobby and return its ID
    public String createLobby() {
        String lobbyId = UUID.randomUUID().toString();
        lobbies.put(lobbyId, new Lobby(lobbyId));
        return lobbyId;
    }

    // Add a user to a lobby
    public boolean joinLobby(String lobbyId, String memberId) {
        Lobby lobby = lobbies.get(lobbyId);
        if (lobby != null) {
            return lobby.addMember(memberId);
        }
        return false;
    }

    // Remove a user from a lobby
    public boolean leaveLobby(String lobbyId, String memberId) {
        Lobby lobby = lobbies.get(lobbyId);
        if (lobby != null) {
            return lobby.removeMember(memberId);
        }
        return false;
    }

    // Get a lobby by its ID
    public Lobby getLobby(String lobbyId) {
        return lobbies.get(lobbyId);
    }

    // Additional methods like getLobbies, deleteLobby, etc., can be added as needed
}
