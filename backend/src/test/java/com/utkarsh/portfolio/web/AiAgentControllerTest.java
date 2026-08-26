package com.utkarsh.portfolio.web;

import com.utkarsh.portfolio.ai.PortfolioAgentService;
import org.junit.jupiter.api.Test;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.definition.ToolDefinition;
import org.springframework.ai.tool.execution.ToolExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Endpoint contract tests for Phase 4.5 agent chat with the feature flag ON.
 * The agent service is mocked; these tests verify HTTP behavior: validation,
 * response shape and safe JSON errors for LLM and tool failures.
 */
@WebMvcTest(AiAgentController.class)
@org.springframework.test.context.TestPropertySource(properties = "portfolio.ai.agent.enabled=true")
class AiAgentControllerTest {

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    PortfolioAgentService agentService;

    private static ToolDefinition anyDefinition() {
        return ToolDefinition.builder()
                .name("searchProjects")
                .description("read-only portfolio tool")
                .inputSchema("{\"type\":\"object\",\"properties\":{}}")
                .build();
    }

    @Test
    void agentChatReturnsStructuredAnswerWithPortfolioSource() throws Exception {
        when(agentService.answer("What technologies did Utkarsh use at EdgeVerve?"))
                .thenReturn("Java, Spring Boot, Kafka and AWS at EdgeVerve Systems.");

        mockMvc.perform(post("/api/ai/agent/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"message": "What technologies did Utkarsh use at EdgeVerve?"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.answer").value("Java, Spring Boot, Kafka and AWS at EdgeVerve Systems."))
                .andExpect(jsonPath("$.source").value("portfolio"));
    }

    @Test
    void blankMessageIsRejectedSafely() throws Exception {
        mockMvc.perform(post("/api/ai/agent/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"message": "   "}
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").exists());
    }

    @Test
    void missingMessageIsRejectedSafely() throws Exception {
        mockMvc.perform(post("/api/ai/agent/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("message must not be blank"));
    }

    @Test
    void oversizedMessageIsRejectedSafely() throws Exception {
        String tooLong = "x".repeat(1001);
        mockMvc.perform(post("/api/ai/agent/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\": \"" + tooLong + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("message must not exceed 1000 characters"));
    }

    @Test
    void malformedJsonIsRejectedSafely() throws Exception {
        mockMvc.perform(post("/api/ai/agent/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{not-json}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("malformed request body"));
    }

    @Test
    void llmFailureMapsToBadGatewayWithoutInternalDetails() throws Exception {
        when(agentService.answer("hi")).thenThrow(new NonTransientAiException("secret provider details"));

        mockMvc.perform(post("/api/ai/agent/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\": \"hi\"}"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.error").value("AI provider unavailable - try again later"));
    }

    @Test
    void toolExecutionFailureMapsToBadGatewayWithoutInternalDetails() throws Exception {
        when(agentService.answer("hi")).thenThrow(
                new ToolExecutionException(anyDefinition(), new RuntimeException("internal tool stack")));

        mockMvc.perform(post("/api/ai/agent/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\": \"hi\"}"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.error").value("AI provider unavailable - try again later"));
    }

    @Test
    void missingProviderConfigurationMapsToServiceUnavailable() throws Exception {
        when(agentService.answer("hi")).thenThrow(new IllegalStateException("no api key"));

        mockMvc.perform(post("/api/ai/agent/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"message\": \"hi\"}"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error").value("AI provider is not configured on this server"));
    }
}
