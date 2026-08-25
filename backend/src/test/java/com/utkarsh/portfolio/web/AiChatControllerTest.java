package com.utkarsh.portfolio.web;

import com.utkarsh.portfolio.ai.PortfolioChatService;
import org.junit.jupiter.api.Test;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Endpoint contract tests for POST /api/ai/chat and GET /api/ai/status.
 * The chat service is mocked — these tests verify HTTP behavior: validation,
 * response shape, status codes and safe JSON errors.
 */
// PortfolioAiProperties is available in the slice via @EnableConfigurationProperties
// on the application class — no extra import needed here.
@WebMvcTest(AiChatController.class)
class AiChatControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    PortfolioChatService chatService;

    @Test
    void chatReturnsStructuredAnswerWithPortfolioSource() throws Exception {
        when(chatService.answer("What technologies does Utkarsh use?"))
                .thenReturn("Production stack: Java, Spring Boot, Kafka, AWS.");

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"message": "What technologies does Utkarsh use?"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer").value("Production stack: Java, Spring Boot, Kafka, AWS."))
                .andExpect(jsonPath("$.source").value("portfolio"));
    }

    @Test
    void blankMessageIsRejected() throws Exception {
        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"message": "   "}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void missingMessageIsRejected() throws Exception {
        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void oversizedMessageIsRejected() throws Exception {
        String tooLong = "x".repeat(1001);
        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\": \"" + tooLong + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("message must not exceed 1000 characters"));
    }

    @Test
    void malformedJsonIsRejected() throws Exception {
        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{not-json}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("malformed request body"));
    }

    @Test
    void providerFailureMapsToBadGateway() throws Exception {
        when(chatService.answer("hi")).thenThrow(new NonTransientAiException("boom"));

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\": \"hi\"}"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.error").value("AI provider unavailable - try again later"));
    }

    @Test
    void missingProviderConfigurationMapsToServiceUnavailable() throws Exception {
        when(chatService.answer("hi")).thenThrow(new IllegalStateException("no api key"));

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\": \"hi\"}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("AI provider is not configured on this server"));
    }

    @Test
    void statusReportsPhaseWithoutRevealingSecrets() throws Exception {
        mockMvc.perform(get("/api/ai/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.phase").value("4.3-persistent-vector-store"))
                .andExpect(jsonPath("$.providerConfigured").value(false))
                .andExpect(jsonPath("$.ragEnabled").value(true));
    }
}
