package com.utkarsh.portfolio.ai;

import com.utkarsh.portfolio.config.PortfolioAiProperties;
import com.utkarsh.portfolio.knowledge.PortfolioKnowledgeLoader;
import com.utkarsh.portfolio.knowledge.PortfolioKnowledgeService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.document.Document;
import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.beans.factory.ObjectProvider;

import java.util.Collections;
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
@ExtendWith(MockitoExtension.class)
class PortfolioChatServiceTest {

    private static final String BASE_PROMPT = "You are UTKARSH AI. Stay strictly honest.";

    private ChatClient chatClient;
    private ChatClient.ChatClientRequestSpec requestSpec;
    private ChatClient.CallResponseSpec callSpec;
    private PortfolioKnowledgeService knowledgeService;
    private ObjectProvider<PortfolioKnowledgeService> provider;

    @SuppressWarnings("unchecked")
    @BeforeEach
    void setUp() {
        // FIX: Initialize all mocks properly
        chatClient = mock(ChatClient.class);
        requestSpec = mock(ChatClient.ChatClientRequestSpec.class);
        callSpec = mock(ChatClient.CallResponseSpec.class);
        knowledgeService = mock(PortfolioKnowledgeService.class);
        provider = mock(ObjectProvider.class);

        // FIX: Properly mock the fluent API chain
        when(chatClient.prompt()).thenReturn(requestSpec);
        when(requestSpec.system(anyString())).thenReturn(requestSpec);
        when(requestSpec.user(anyString())).thenReturn(requestSpec);
        when(requestSpec.call()).thenReturn(callSpec);
        
        // FIX: Default provider behavior
        when(provider.getIfAvailable()).thenReturn(knowledgeService);
    }

    @SuppressWarnings("unchecked")
    private ObjectProvider<PortfolioKnowledgeService> providerReturning(PortfolioKnowledgeService svc) {
        ObjectProvider<PortfolioKnowledgeService> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(svc);
        return provider;
    }

    private ChatClient mockChatClientWithSpecs() {
        return chatClient;
    }

    private PortfolioChatService newService() {
        return new PortfolioChatService(
                mockChatClientWithSpecs(),
                new PortfolioAiProperties(BASE_PROMPT, "portfolio"),
                provider);
    }

    private PortfolioChatService newServiceWithProvider(ObjectProvider<PortfolioKnowledgeService> customProvider) {
        return new PortfolioChatService(
                mockChatClientWithSpecs(),
                new PortfolioAiProperties(BASE_PROMPT, "portfolio"),
                customProvider);
    }

    private Document doc(String id, String section, String title, String text) {
        // FIX: Use the correct Document constructor/builder pattern
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
        // Arrange
        when(knowledgeService.retrieve("How does Utkarsh use Kafka?"))
                .thenReturn(List.of(
                        doc("experience:domain-event-driven", "experience", "EVENT-DRIVEN SYSTEMS",
                                "Built Kafka-based event-driven systems for real-time transaction processing."),
                        doc("skills:messaging", "skills", "SKILLS: MESSAGING", "Messaging: Kafka.")));
        when(callSpec.content()).thenReturn("Kafka is part of his production event-driven experience.");

        // Act
        String answer = newService().answer("How does Utkarsh use Kafka?");

        // Assert
        assertThat(answer).isEqualTo("Kafka is part of his production event-driven experience.");

        ArgumentCaptor<String> systemCaptor = ArgumentCaptor.forClass(String.class);
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
        // Arrange
        when(knowledgeService.retrieve("What is his favourite colour?")).thenReturn(Collections.emptyList());
        when(callSpec.content())
                .thenReturn("That information is not available in the portfolio.");

        // Act
        String answer = newService().answer("What is his favourite colour?");

        // Assert
        assertThat(answer).contains("not available in the portfolio");

        ArgumentCaptor<String> systemCaptor = ArgumentCaptor.forClass(String.class);
        verify(requestSpec).system(systemCaptor.capture());
        assertThat(systemCaptor.getValue())
                .contains(PortfolioChatService.NO_CONTEXT_PLACEHOLDER)
                .contains("not available in the portfolio");
    }

    @Test
    void worksWhenRagLayerIsAbsent() {
        // Arrange
        PortfolioChatService service = new PortfolioChatService(
                mockChatClientWithSpecs(),
                new PortfolioAiProperties(BASE_PROMPT, "portfolio"),
                providerReturning(null));
        when(callSpec.content()).thenReturn("fallback path ok");

        // Act
        String answer = service.answer("hello");

        // Assert
        assertThat(answer).isEqualTo("fallback path ok");

        ArgumentCaptor<String> systemCaptor = ArgumentCaptor.forClass(String.class);
        verify(requestSpec).system(systemCaptor.capture());
        assertThat(systemCaptor.getValue()).contains(PortfolioChatService.NO_CONTEXT_PLACEHOLDER);
    }

    @Test
    void providerFailurePropagatesForSafeMapping() {
        // Arrange
        when(knowledgeService.retrieve(anyString())).thenReturn(Collections.emptyList());
        when(requestSpec.call()).thenThrow(new NonTransientAiException("provider down"));

        // Act & Assert
        assertThatThrownBy(() -> newService().answer("hi"))
                .isInstanceOf(NonTransientAiException.class)
                .hasMessageContaining("provider down");
    }

    @Test
    void blankMessageIsRejected() {
        // Act & Assert
        assertThatThrownBy(() -> newService().answer("   "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("must not be blank");

        assertThatThrownBy(() -> newService().answer(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("must not be null");
    }

    @Test
    void serviceShouldBeReadyWhenProperlyInitialized() {
        // Arrange
        PortfolioChatService service = newService();
        
        // Act & Assert
        assertThat(service.isReady()).isTrue();
    }

    @Test
    void handlesNullProviderGracefully() {
        // Arrange
        when(provider.getIfAvailable()).thenReturn(null);
        when(callSpec.content()).thenReturn("No context available");
        
        // Act
        String answer = newService().answer("Tell me about your projects");
        
        // Assert
        assertThat(answer).isNotNull();
    }
}