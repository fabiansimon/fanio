package com.fabiansimon.fanio.model;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

public class Lobby {
    private String id;
    private UUID quizId;
    private Set<LobbyMember> members;

    public Lobby(String id, UUID quizId) {
        this.id = id;
        this.quizId = quizId;
        this.members = Collections.synchronizedSet(new HashSet<>());
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

    public boolean addMember(UUID sessionToken, String userName) {
        return members.add(new LobbyMember(sessionToken, userName));
    }

    public boolean removeMember(String sessionId) {
        return members.remove(sessionId);
    }

    public Set<LobbyMember> getMembers() {
        return Collections.unmodifiableSet(members);
    }

    public boolean isEmpty() {
        return members.isEmpty();
    }
}
