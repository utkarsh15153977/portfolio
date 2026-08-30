package com.utkarsh.ai.kafka.event;

import java.time.Instant;

public class ChatRequestEvent {

    private String correlationId;
    private Long conversationId;
    private String userEmail;
    private String message;
    private Instant timestamp;
    private int retryCount;

    public ChatRequestEvent() {}

    public ChatRequestEvent(String correlationId, Long conversationId, String userEmail, String message) {
        this.correlationId = correlationId;
        this.conversationId = conversationId;
        this.userEmail = userEmail;
        this.message = message;
        this.timestamp = Instant.now();
        this.retryCount = 0;
    }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public int getRetryCount() { return retryCount; }
    public void setRetryCount(int retryCount) { this.retryCount = retryCount; }
}
