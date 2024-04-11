package com.fabiansimon.fanio.model;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public class Lobby {
    private String id;
    private Set<String> members;

    public Lobby(String id) {
        this.id = id;
        this.members = Collections.synchronizedSet(new HashSet<>());
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public boolean addMember(String sessionId) {
        return members.add(sessionId);
    }

    public boolean removeMember(String sessionId) {
        return members.remove(sessionId);
    }

    public Set<String> getMembers() {
        return Collections.unmodifiableSet(members);
    }

    public boolean isEmpty() {
        return members.isEmpty();
    }
}
