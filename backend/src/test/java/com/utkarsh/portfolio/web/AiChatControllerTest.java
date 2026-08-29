package com.utkarsh.portfolio.web;

import com.utkarsh.portfolio.ai.PortfolioChatService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

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
    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @MockitoBean
    private PortfolioChatService chatService;

    @BeforeEach
    void setUp() {
        // FIX: Ensure mockMvc is properly initialized
        if (mockMvc == null) {
            mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        }
    }

    @Test
    void chatReturnsStructuredAnswerWithPortfolioSource() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        when(chatService.answer("What technologies does Utkarsh use?"))
                .thenReturn("Production stack: Java, Spring Boot, Kafka, AWS.");

        String requestBody = "{\"message\": \"What technologies does Utkarsh use?\"}";

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer").value("Production stack: Java, Spring Boot, Kafka, AWS."))
                .andExpect(jsonPath("$.source").value("portfolio"));
    }

    @Test
    void blankMessageIsRejected() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        String requestBody = "{\"message\": \"   \"}";

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void missingMessageIsRejected() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        String requestBody = "{}";

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void oversizedMessageIsRejected() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        String tooLong = "x".repeat(1001);
        String requestBody = "{\"message\": \"" + tooLong + "\"}";

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("message must not exceed 1000 characters"));
    }

    @Test
    void malformedJsonIsRejected() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        String invalidJson = "{not-json}";

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("malformed request body"));
    }

    @Test
    void providerFailureMapsToBadGateway() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        when(chatService.answer("hi")).thenThrow(new NonTransientAiException("boom"));

        String requestBody = "{\"message\": \"hi\"}";

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.error").value("AI provider unavailable - try again later"));
    }

    @Test
    void missingProviderConfigurationMapsToServiceUnavailable() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        when(chatService.answer("hi")).thenThrow(new IllegalStateException("no api key"));

        String requestBody = "{\"message\": \"hi\"}";

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("AI provider is not configured on this server"));
    }

    @Test
    void statusReportsPhaseWithoutRevealingSecrets() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        mockMvc.perform(get("/api/ai/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.phase").value("4.5-agent-orchestration"))
                .andExpect(jsonPath("$.providerConfigured").value(false))
                .andExpect(jsonPath("$.ragEnabled").value(true))
                .andExpect(jsonPath("$.agentEnabled").value(false));
    }

    @Test
    void chatHandlesMessageWithSpecialCharacters() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        String message = "What about Java & Spring? What about C++?";
        when(chatService.answer(message))
                .thenReturn("The portfolio focuses on Java and Spring Boot.");

        String requestBody = "{\"message\": \"" + message + "\"}";

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer").value("The portfolio focuses on Java and Spring Boot."))
                .andExpect(jsonPath("$.source").value("portfolio"));
    }

    @Test
    void chatHandlesVeryShortMessage() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        when(chatService.answer("Hi")).thenReturn("Hello! How can I help you with Utkarsh's portfolio?");

        String requestBody = "{\"message\": \"Hi\"}";

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer").exists())
                .andExpect(jsonPath("$.source").value("portfolio"));
    }

    @Test
    void genericRuntimeExceptionMapsToInternalServerError() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        when(chatService.answer("hi")).thenThrow(new RuntimeException("Unexpected error"));

        String requestBody = "{\"message\": \"hi\"}";

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.error").value("An unexpected error occurred"));
    }

    @Test
    void statusEndpointReturnsCorrectStructure() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        mockMvc.perform(get("/api/ai/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").exists())
                .andExpect(jsonPath("$.phase").exists())
                .andExpect(jsonPath("$.providerConfigured").exists())
                .andExpect(jsonPath("$.ragEnabled").exists())
                .andExpect(jsonPath("$.agentEnabled").exists());
    }

    @Test
    void wrongContentTypeReturnsUnsupportedMediaType() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";

        String requestBody = "{\"message\": \"Hello\"}";

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.TEXT_PLAIN)
                        .content(requestBody))
                .andExpect(status().isUnsupportedMediaType());
    }
}