package com.utkarsh.ai.kafka.event;

import java.time.Instant;

public class ChatResponseEvent {

    public enum Status {
        COMPLETED, FAILED
    }

    private String correlationId;
    private Long conversationId;
    private String userEmail;
    private Status status;
    private String aiResponse;
    private Instant timestamp;
    private long processingTimeMs;
    private AiError error;

    public ChatResponseEvent() {}

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public Status getStatus() { return status; }
    public void setStatus(Status status) { this.status = status; }

    public String getAiResponse() { return aiResponse; }
    public void setAiResponse(String aiResponse) { this.aiResponse = aiResponse; }

    public Instant getTimestamp() { return timestamp; }
    public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }

    public long getProcessingTimeMs() { return processingTimeMs; }
    public void setProcessingTimeMs(long processingTimeMs) { this.processingTimeMs = processingTimeMs; }

    public AiError getError() { return error; }
    public void setError(AiError error) { this.error = error; }
}
