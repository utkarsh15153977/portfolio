package com.utkarsh.portfolio.ai;

import com.utkarsh.portfolio.config.PortfolioAiProperties;
import com.utkarsh.portfolio.knowledge.PortfolioKnowledgeLoader;
import com.utkarsh.portfolio.knowledge.PortfolioKnowledgeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.beans.factory.ObjectProvider;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Phase 4.2 RAG chat service tests:
 * - retrieved portfolio context is composed into the system prompt
 * - grounding rules are present
 * - missing knowledge produces a safe "not available" instruction
 * - provider failures propagate to the mapped error handler
 */
class PortfolioChatServiceTest {

    private static final String BASE_PROMPT = "You are UTKARSH AI. Stay strictly honest.";

    private ChatClient.ChatClientRequestSpec requestSpec;
    private ChatClient.CallResponseSpec callSpec;
    private PortfolioKnowledgeService knowledgeService;

    @SuppressWarnings("unchecked")
    private ObjectProvider<PortfolioKnowledgeService> providerReturning(PortfolioKnowledgeService svc) {
        ObjectProvider<PortfolioKnowledgeService> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(svc);
        return provider;
    }

    @BeforeEach
    void setUpFluentMocks() {
        requestSpec = mock(ChatClient.ChatClientRequestSpec.class);
        callSpec = mock(ChatClient.CallResponseSpec.class);

        //noinspection unchecked
        when(requestSpec.system(anyString())).thenReturn(requestSpec);
        //noinspection unchecked
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenReturn(callSpec);

        knowledgeService = mock(PortfolioKnowledgeService.class);
    }

    private ChatClient mockChatClientWithSpecs() {
        ChatClient chatClient = mock(ChatClient.class);
        when(chatClient.prompt()).thenReturn(requestSpec);
        return chatClient;
    }

    private PortfolioChatService newService() {
        return new PortfolioChatService(
                mockChatClientWithSpecs(),
                new PortfolioAiProperties(BASE_PROMPT, "portfolio"),
                providerReturning(knowledgeService));
    }

    private Document doc(String id, String section, String title, String text) {
        return Document.builder()
                .id(id)
                .text(text)
                .metadata(Map.of(
                        PortfolioKnowledgeLoader.META_SECTION, section,
                        PortfolioKnowledgeLoader.META_TITLE, title,
                        PortfolioKnowledgeLoader.META_SOURCE, "portfolio"))
                .build();
    }

    @Test
    void retrievedContextIsSuppliedToTheModel() {
        when(knowledgeService.retrieve("How does Utkarsh use Kafka?"))
                .thenReturn(List.of(
                        doc("experience:domain-event-driven", "experience", "EVENT-DRIVEN SYSTEMS",
                                "Built Kafka-based event-driven systems for real-time transaction processing."),
                        doc("skills:messaging", "skills", "SKILLS: MESSAGING", "Messaging: Kafka.")));
        when(callSpec.content()).thenReturn("Kafka is part of his production event-driven experience.");

        String answer = newService().answer("How does Utkarsh use Kafka?");

        assertThat(answer).isEqualTo("Kafka is part of his production event-driven experience.");

        var systemCaptor = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(requestSpec).system(systemCaptor.capture());
        String system = systemCaptor.getValue();

        assertThat(system)
                .contains("RETRIEVED PORTFOLIO CONTEXT")
                .contains("[experience / EVENT-DRIVEN SYSTEMS]")
                .contains("[skills / SKILLS: MESSAGING]")
                .contains("Built Kafka-based event-driven systems")
                .contains(BASE_PROMPT)
                .contains("Never invent employers, projects, technologies");

        verify(requestSpec).user("How does Utkarsh use Kafka?");
    }

    @Test
    void missingKnowledgeProducesSafeUnavailableInstruction() {
        when(knowledgeService.retrieve("What is his favourite colour?")).thenReturn(List.of());
        when(callSpec.content())
                .thenReturn("That information is not available in the portfolio.");

        String answer = newService().answer("What is his favourite colour?");

        assertThat(answer).contains("not available in the portfolio");

        var systemCaptor = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(requestSpec).system(systemCaptor.capture());
        assertThat(systemCaptor.getValue())
                .contains(PortfolioChatService.NO_CONTEXT_PLACEHOLDER)
                .contains("not available in the portfolio");
    }

    @Test
    void worksWhenRagLayerIsAbsent() {
        PortfolioChatService service = new PortfolioChatService(
                mockChatClientWithSpecs(),
                new PortfolioAiProperties(BASE_PROMPT, "portfolio"),
                providerReturning(null));
        when(callSpec.content()).thenReturn("fallback path ok");

        assertThat(service.answer("hello")).isEqualTo("fallback path ok");

        var systemCaptor = org.mockito.ArgumentCaptor.forClass(String.class);
        verify(requestSpec).system(systemCaptor.capture());
        assertThat(systemCaptor.getValue()).contains(PortfolioChatService.NO_CONTEXT_PLACEHOLDER);
    }

    @Test
    void providerFailurePropagatesForSafeMapping() {
        when(knowledgeService.retrieve(anyString())).thenReturn(List.of());
        when(requestSpec.call()).thenThrow(new NonTransientAiException("provider down"));

        assertThatThrownBy(() -> newService().answer("hi"))
                .isInstanceOf(NonTransientAiException.class);
    }
}
