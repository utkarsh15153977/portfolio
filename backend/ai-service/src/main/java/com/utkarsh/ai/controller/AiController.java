package com.utkarsh.ai.controller;

import com.utkarsh.ai.dto.*;
import com.utkarsh.ai.service.AiService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatAcceptedResponse> chat(@Valid @RequestBody ChatRequest request,
                                                     HttpServletRequest httpRequest) {
        String email = extractEmail(httpRequest);
        ChatAcceptedResponse response = aiService.chat(email, request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(response);
    }

    @GetMapping("/chat/status/{correlationId}")
    public ResponseEntity<ChatStatusResponse> getChatStatus(@PathVariable String correlationId,
                                                            HttpServletRequest httpRequest) {
        String email = extractEmail(httpRequest);
        ChatStatusResponse response = aiService.getStatus(email, correlationId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getConversations(HttpServletRequest httpRequest) {
        String email = extractEmail(httpRequest);
        List<ConversationResponse> conversations = aiService.getConversations(email);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/conversations/{id}")
    public ResponseEntity<ConversationDetailResponse> getConversation(@PathVariable Long id,
                                                                      HttpServletRequest httpRequest) {
        String email = extractEmail(httpRequest);
        ConversationDetailResponse conversation = aiService.getConversation(email, id);
        return ResponseEntity.ok(conversation);
    }

    @DeleteMapping("/conversations/{id}")
    public ResponseEntity<Void> deleteConversation(@PathVariable Long id,
                                                   HttpServletRequest httpRequest) {
        String email = extractEmail(httpRequest);
        aiService.deleteConversation(email, id);
        return ResponseEntity.noContent().build();
    }

    private String extractEmail(HttpServletRequest request) {
        String email = request.getHeader("X-User-Email");
        if (email == null || email.isBlank()) {
            throw new SecurityException("Missing or blank X-User-Email header");
        }
        return email.trim();
    }
}
