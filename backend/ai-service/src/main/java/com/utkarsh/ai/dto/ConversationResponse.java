package com.utkarsh.ai.dto;

import java.time.Instant;

public class ConversationResponse {

    private Long id;
    private String title;
    private int messageCount;
    private Instant createdAt;
    private Instant updatedAt;

    public ConversationResponse() {}

    public ConversationResponse(Long id, String title, int messageCount, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.title = title;
        this.messageCount = messageCount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public int getMessageCount() { return messageCount; }
    public void setMessageCount(int messageCount) { this.messageCount = messageCount; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
