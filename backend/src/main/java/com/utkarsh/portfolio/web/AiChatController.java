package com.utkarsh.portfolio.web;

import com.utkarsh.portfolio.ai.PortfolioChatService;
import com.utkarsh.portfolio.config.PortfolioAiProperties;
import com.utkarsh.portfolio.config.PortfolioRagProperties;
import com.utkarsh.portfolio.web.dto.ChatRequest;
import com.utkarsh.portfolio.web.dto.ChatResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Phase 4.1 AI endpoint.
 *
 * POST /api/ai/chat  { "message": "..." } → { "answer": "...", "source": "portfolio" }
 *
 * The controller is provider-agnostic: which model answers is decided entirely
 * by environment configuration. Failures surface as safe JSON errors — never
 * stack traces, never provider details.
 */
@RestController
@RequestMapping("/api/ai")
public class AiChatController {

    private final PortfolioChatService chatService;
    private final PortfolioAiProperties properties;
    private final boolean providerConfigured;
    private final boolean ragEnabled;

    public AiChatController(PortfolioChatService chatService,
                            PortfolioAiProperties properties,
                            PortfolioRagProperties ragProperties,
                            @Value("${spring.ai.openai.api-key:}") String apiKey) {
        this.chatService = chatService;
        this.properties = properties;
        this.providerConfigured = apiKey != null && !apiKey.isBlank();
        this.ragEnabled = ragProperties.enabled();
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        String answer = chatService.answer(request.message());
        return ResponseEntity.ok(ChatResponse.of(answer, properties.responseSource()));
    }

    /**
     * Lightweight readiness probe for Phase 4.6 (Next.js integration) and local
     * verification — reports phase, RAG readiness and whether a provider key has
     * been configured, without ever revealing it.
     */
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "phase", "4.3-persistent-vector-store",
                "providerConfigured", providerConfigured,
                "ragEnabled", ragEnabled
        ));
    }
}
