package com.utkarsh.ai.dto;

public class ChatStatusResponse {

    private String correlationId;
    private Long conversationId;
    private String status;
    private String aiResponse;
    private String error;

    public ChatStatusResponse() {}

    public ChatStatusResponse(String correlationId, Long conversationId, String status) {
        this.correlationId = correlationId;
        this.conversationId = conversationId;
        this.status = status;
    }

    public String getCorrelationId() { return correlationId; }
    public void setCorrelationId(String correlationId) { this.correlationId = correlationId; }

    public Long getConversationId() { return conversationId; }
    public void setConversationId(Long conversationId) { this.conversationId = conversationId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAiResponse() { return aiResponse; }
    public void setAiResponse(String aiResponse) { this.aiResponse = aiResponse; }

    public String getError() { return error; }
    public void setError(String error) { this.error = error; }
}
