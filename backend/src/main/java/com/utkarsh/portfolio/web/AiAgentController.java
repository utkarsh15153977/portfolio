package com.utkarsh.portfolio.web;

import com.utkarsh.portfolio.ai.PortfolioAgentService;
import com.utkarsh.portfolio.config.PortfolioAgentProperties;
import com.utkarsh.portfolio.config.PortfolioAiProperties;
import com.utkarsh.portfolio.web.dto.ChatRequest;
import com.utkarsh.portfolio.web.dto.ChatResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Phase 4.5 — agent-mode chat endpoint.
 *
 * POST /api/ai/agent/chat  { "message": "..." } → { "answer": "...", "source": "portfolio" }
 *
 * The success contract is identical to POST /api/ai/chat — only the service
 * behind it differs: PortfolioAgentService lets the model call the registered
 * read-only portfolio tools during the conversation.
 *
 * The endpoint is feature-flagged via PORTFOLIO_AI_AGENT_ENABLED (default
 * false): when disabled it answers with the standard safe ApiError JSON
 * (503) instead of reaching any model, so existing behavior can never change
 * accidentally.
 */
@RestController
@RequestMapping("/api/ai")
public class AiAgentController {

    static final String DISABLED_MESSAGE = "AI agent mode is disabled on this server";

    private final PortfolioAgentService agentService;
    private final PortfolioAiProperties properties;
    private final boolean agentEnabled;

    public AiAgentController(PortfolioAgentService agentService,
                             PortfolioAiProperties properties,
                             PortfolioAgentProperties agentProperties) {
        this.agentService = agentService;
        this.properties = properties;
        this.agentEnabled = agentProperties.enabled();
    }

    @PostMapping("/agent/chat")
    public ResponseEntity<?> chat(@Valid @RequestBody ChatRequest request) {
        if (!agentEnabled) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(new GlobalExceptionHandler.ApiError(DISABLED_MESSAGE));
        }
        String answer = agentService.answer(request.message());
        return ResponseEntity.ok(ChatResponse.of(answer, properties.responseSource()));
    }
}
