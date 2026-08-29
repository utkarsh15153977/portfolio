package com.utkarsh.portfolio.web;

import com.utkarsh.portfolio.ai.PortfolioAgentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Phase 4.5 feature-flag OFF behavior (the DEFAULT): /api/ai/agent/chat must
 * refuse safely with a 503 ApiError and never reach the agent service or any
 * model — while nothing about this test touches the existing RAG chat path.
 */
// No property override here: application.yml defaults PORTFOLIO_AI_AGENT_ENABLED to false,
// which is exactly the state being verified.
@WebMvcTest(AiAgentController.class)
class AiAgentControllerDisabledTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @MockitoBean
    private PortfolioAgentService agentService;

    @BeforeEach
    void setUp() {
        // FIX: Ensure mockMvc is properly initialized
        if (mockMvc == null) {
            mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        }
    }

    @Test
    void agentEndpointReturnsSafeServiceUnavailableWhenDisabled() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";
        
        // FIX: Use properly formatted JSON with escaped quotes
        String requestBody = "{\"message\": \"What technologies did Utkarsh use at EdgeVerve?\"}";
        
        mockMvc.perform(post("/api/ai/agent/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error")
                        .value(AiAgentController.DISABLED_MESSAGE));

        verifyNoInteractions(agentService);
    }

    @Test
    void agentEndpointReturnsServiceUnavailableForAnyRequestWhenDisabled() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";
        
        String requestBody = "{\"message\": \"Hello\"}";
        
        mockMvc.perform(post("/api/ai/agent/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error")
                        .value(AiAgentController.DISABLED_MESSAGE));

        verifyNoInteractions(agentService);
    }

    @Test
    void agentEndpointHandlesEmptyMessageGracefully() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";
        
        String requestBody = "{\"message\": \"\"}";
        
        mockMvc.perform(post("/api/ai/agent/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error")
                        .value(AiAgentController.DISABLED_MESSAGE));

        verifyNoInteractions(agentService);
    }

    @Test
    void agentEndpointHandlesNullMessageGracefully() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";
        
        String requestBody = "{\"message\": null}";
        
        mockMvc.perform(post("/api/ai/agent/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error")
                        .value(AiAgentController.DISABLED_MESSAGE));

        verifyNoInteractions(agentService);
    }

    @Test
    void agentEndpointHandlesMissingMessageField() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";
        
        String requestBody = "{}";
        
        mockMvc.perform(post("/api/ai/agent/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error")
                        .value(AiAgentController.DISABLED_MESSAGE));

        verifyNoInteractions(agentService);
    }

    @Test
    void agentEndpointRejectsInvalidJson() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";
        
        String invalidJson = "{invalid: json}";
        
        mockMvc.perform(post("/api/ai/agent/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(invalidJson))
                .andExpect(status().isBadRequest());
        
        // FIX: The service should not be called even for invalid JSON
        verifyNoInteractions(agentService);
    }

    @Test
    void agentEndpointRejectsWrongContentType() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";
        
        String requestBody = "{\"message\": \"Hello\"}";
        
        mockMvc.perform(post("/api/ai/agent/chat")
                        .contentType(MediaType.TEXT_PLAIN)
                        .content(requestBody))
                .andExpect(status().isUnsupportedMediaType());
        
        verifyNoInteractions(agentService);
    }

    @Test
    void agentEndpointReturnsServiceUnavailableForPostOnly() throws Exception {
        // FIX: Ensure mockMvc is not null
        assert mockMvc != null : "MockMvc is not initialized";
        
        // GET should be rejected (method not allowed)
        mockMvc.perform(post("/api/ai/agent/chat"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error")
                        .value(AiAgentController.DISABLED_MESSAGE));

        verifyNoInteractions(agentService);
    }
}