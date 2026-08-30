package com.utkarsh.ai;

import com.openai.client.OpenAIClient;
import com.openai.errors.BadRequestException;
import com.openai.errors.InternalServerException;
import com.openai.errors.OpenAIIoException;
import com.openai.errors.RateLimitException;
import com.openai.errors.UnauthorizedException;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import com.openai.models.chat.completions.ChatCompletionMessage;
import com.openai.services.blocking.ChatService;
import com.openai.services.blocking.chat.ChatCompletionService;
import com.utkarsh.ai.provider.AiProvider;
import com.utkarsh.ai.provider.AiProviderException;
import com.utkarsh.ai.provider.OpenAiProvider;
import com.utkarsh.ai.kafka.producer.ChatEventProducer;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@SpringBootTest(properties = {
        "ai.openai.api-key=test-key-for-testing",
        "ai.openai.model=gpt-4o-mini",
        "ai.openai.max-tokens=512",
        "ai.openai.temperature=0.5",
        "ai.kafka.consumer.enabled=false"
})
@ActiveProfiles("test")
class OpenAiProviderTest {

    @MockBean
    private OpenAIClient openAiClient;

    @MockBean
    private ChatEventProducer chatEventProducer;

    @Autowired
    private AiProvider aiProvider;

    @Autowired
    private com.utkarsh.ai.config.OpenAiConfig openAiConfig;

    private ChatService mockChatService;
    private ChatCompletionService mockCompletionService;

    @BeforeEach
    void setUp() {
        assertTrue(aiProvider instanceof OpenAiProvider,
                "AiProvider should be OpenAiProvider when API key is set");

        mockChatService = mock(ChatService.class);
        mockCompletionService = mock(ChatCompletionService.class);

        when(openAiClient.chat()).thenReturn(mockChatService);
        when(mockChatService.completions()).thenReturn(mockCompletionService);
    }

    @Test
    void successfulResponse_returnsAiContent() {
        ChatCompletion completion = mock(ChatCompletion.class);
        ChatCompletion.Choice choice = mock(ChatCompletion.Choice.class);
        ChatCompletionMessage message = mock(ChatCompletionMessage.class);

        when(mockCompletionService.create(any(ChatCompletionCreateParams.class))).thenReturn(completion);
        when(completion.choices()).thenReturn(List.of(choice));
        when(choice.message()).thenReturn(message);
        when(message.content()).thenReturn(Optional.of("Hello from OpenAI!"));
        when(completion.usage()).thenReturn(Optional.empty());

        String result = aiProvider.generateResponse("user@test.com", "1", "Hi");

        assertEquals("Hello from OpenAI!", result);
        verify(mockCompletionService).create(any(ChatCompletionCreateParams.class));
    }

    @Test
    void emptyResponse_throwsEmptyResponseException() {
        ChatCompletion completion = mock(ChatCompletion.class);
        ChatCompletion.Choice choice = mock(ChatCompletion.Choice.class);
        ChatCompletionMessage message = mock(ChatCompletionMessage.class);

        when(mockCompletionService.create(any(ChatCompletionCreateParams.class))).thenReturn(completion);
        when(completion.choices()).thenReturn(List.of(choice));
        when(choice.message()).thenReturn(message);
        when(message.content()).thenReturn(Optional.empty());
        when(completion.usage()).thenReturn(Optional.empty());

        AiProviderException ex = assertThrows(AiProviderException.class,
                () -> aiProvider.generateResponse("user@test.com", "1", "Hi"));
        assertEquals("EMPTY_RESPONSE", ex.getCode());
    }

    @Test
    void blankResponse_throwsEmptyResponseException() {
        ChatCompletion completion = mock(ChatCompletion.class);
        ChatCompletion.Choice choice = mock(ChatCompletion.Choice.class);
        ChatCompletionMessage message = mock(ChatCompletionMessage.class);

        when(mockCompletionService.create(any(ChatCompletionCreateParams.class))).thenReturn(completion);
        when(completion.choices()).thenReturn(List.of(choice));
        when(choice.message()).thenReturn(message);
        when(message.content()).thenReturn(Optional.of("   "));
        when(completion.usage()).thenReturn(Optional.empty());

        AiProviderException ex = assertThrows(AiProviderException.class,
                () -> aiProvider.generateResponse("user@test.com", "1", "Hi"));
        assertEquals("EMPTY_RESPONSE", ex.getCode());
    }

    @Test
    void noChoices_throwsEmptyResponseException() {
        ChatCompletion completion = mock(ChatCompletion.class);

        when(mockCompletionService.create(any(ChatCompletionCreateParams.class))).thenReturn(completion);
        when(completion.choices()).thenReturn(List.of());
        when(completion.usage()).thenReturn(Optional.empty());

        AiProviderException ex = assertThrows(AiProviderException.class,
                () -> aiProvider.generateResponse("user@test.com", "1", "Hi"));
        assertEquals("EMPTY_RESPONSE", ex.getCode());
    }

    @Test
    void authError_throwsProviderAuthError() {
        UnauthorizedException ex = mock(UnauthorizedException.class);
        when(mockCompletionService.create(any(ChatCompletionCreateParams.class))).thenThrow(ex);

        AiProviderException result = assertThrows(AiProviderException.class,
                () -> aiProvider.generateResponse("user@test.com", "1", "Hi"));
        assertEquals("PROVIDER_AUTH_ERROR", result.getCode());
    }

    @Test
    void badRequest_throwsInvalidRequest() {
        BadRequestException ex = mock(BadRequestException.class);
        when(mockCompletionService.create(any(ChatCompletionCreateParams.class))).thenThrow(ex);

        AiProviderException result = assertThrows(AiProviderException.class,
                () -> aiProvider.generateResponse("user@test.com", "1", "Hi"));
        assertEquals("INVALID_REQUEST", result.getCode());
    }

    @Test
    void rateLimit_throwsProviderRateLimit() {
        RateLimitException ex = mock(RateLimitException.class);
        when(mockCompletionService.create(any(ChatCompletionCreateParams.class))).thenThrow(ex);

        AiProviderException result = assertThrows(AiProviderException.class,
                () -> aiProvider.generateResponse("user@test.com", "1", "Hi"));
        assertEquals("PROVIDER_RATE_LIMIT", result.getCode());
    }

    @Test
    void serverError_throwsProviderServerError() {
        InternalServerException ex = mock(InternalServerException.class);
        when(mockCompletionService.create(any(ChatCompletionCreateParams.class))).thenThrow(ex);

        AiProviderException result = assertThrows(AiProviderException.class,
                () -> aiProvider.generateResponse("user@test.com", "1", "Hi"));
        assertEquals("PROVIDER_SERVER_ERROR", result.getCode());
    }

    @Test
    void ioException_throwsProviderTimeout() {
        OpenAIIoException ex = new OpenAIIoException("Connection timed out");
        when(mockCompletionService.create(any(ChatCompletionCreateParams.class))).thenThrow(ex);

        AiProviderException result = assertThrows(AiProviderException.class,
                () -> aiProvider.generateResponse("user@test.com", "1", "Hi"));
        assertEquals("PROVIDER_TIMEOUT", result.getCode());
    }

    @Test
    void unexpectedException_throwsProviderError() {
        RuntimeException ex = new RuntimeException("Something unexpected");
        when(mockCompletionService.create(any(ChatCompletionCreateParams.class))).thenThrow(ex);

        AiProviderException result = assertThrows(AiProviderException.class,
                () -> aiProvider.generateResponse("user@test.com", "1", "Hi"));
        assertEquals("PROVIDER_ERROR", result.getCode());
    }

    @Test
    void configValues_arePassedCorrectly() {
        assertEquals("test-key-for-testing", openAiConfig.getApiKey());
        assertEquals("gpt-4o-mini", openAiConfig.getModel());
        assertEquals(512, openAiConfig.getMaxTokens());
        assertEquals(0.5, openAiConfig.getTemperature(), 0.001);
    }
}
