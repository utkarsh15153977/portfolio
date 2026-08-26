package com.utkarsh.portfolio.web;

import com.utkarsh.portfolio.ai.PortfolioAgentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

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
    MockMvc mockMvc;

    @MockitoBean
    PortfolioAgentService agentService;

    @Test
    void agentEndpointReturnsSafeServiceUnavailableWhenDisabled() throws Exception {
        mockMvc.perform(post("/api/ai/agent/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"message": "What technologies did Utkarsh use at EdgeVerve?"}
                                """))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.error")
                        .value(AiAgentController.DISABLED_MESSAGE));

        verifyNoInteractions(agentService);
    }
}
