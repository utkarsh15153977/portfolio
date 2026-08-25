package com.utkarsh.portfolio.web.dto;

/**
 * Outbound response for POST /api/ai/chat.
 *
 * `source` is always "portfolio" in Phase 4.1 — answers come from the model
 * grounded by the portfolio system prompt. Later phases (4.2 RAG) will keep
 * this contract and may enrich it with citation data without breaking shape.
 */
public record ChatResponse(String answer, String source) {

    public static ChatResponse of(String answer, String source) {
        return new ChatResponse(answer, source);
    }
}
