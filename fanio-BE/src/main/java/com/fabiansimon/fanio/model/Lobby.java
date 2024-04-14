package com.fabiansimon.fanio.model;
import java.util.*;

public class Lobby {
    private String id;
    private UUID quizId;
    private Map<UUID, LobbyMember> members;

    public Lobby(String id, UUID quizId) {
        this.id = id;
        this.quizId = quizId;
        this.members = Collections.synchronizedMap(new HashMap<>());
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public UUID getQuizId() {
        return quizId;
    }

    public void setQuizId(UUID quizId) {
        this.quizId = quizId;
    }

    public boolean updateMember(UUID sessionToken, LobbyMember newState) {
        if (members.containsKey(sessionToken)) {
            members.replace(sessionToken, newState);
            return true;
        }

        return false;
    }

    public boolean addMember(UUID sessionToken, String userName) {
        if (!members.containsKey(sessionToken)) {
            members.put(sessionToken, new LobbyMember(sessionToken, userName));
            return true;
        }
        return false;
    }

    public boolean removeMember(UUID sessionToken) {
        if (members.containsKey(sessionToken)) {
            members.remove(sessionToken);
            return true;
        }
        return false;
    }
    public Map<UUID, LobbyMember> getMembers() {
        return Collections.unmodifiableMap(members);
    }

    public List<LobbyMember> getMembersAsList() {
        return List.copyOf(members.values());
    }

    public boolean isEmpty() {
        return members.isEmpty();
    }
}
