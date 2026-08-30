package com.utkarsh.ai.dto;

import java.time.Instant;
import java.util.List;

public class ConversationDetailResponse {

    private Long id;
    private String title;
    private Instant createdAt;
    private Instant updatedAt;
    private List<MessageDto> messages;

    public ConversationDetailResponse() {}

    public ConversationDetailResponse(Long id, String title, Instant createdAt, Instant updatedAt, List<MessageDto> messages) {
        this.id = id;
        this.title = title;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.messages = messages;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public List<MessageDto> getMessages() { return messages; }
    public void setMessages(List<MessageDto> messages) { this.messages = messages; }

    public static class MessageDto {
        private Long id;
        private String role;
        private String content;
        private Instant createdAt;

        public MessageDto() {}

        public MessageDto(Long id, String role, String content, Instant createdAt) {
            this.id = id;
            this.role = role;
            this.content = content;
            this.createdAt = createdAt;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }
}
