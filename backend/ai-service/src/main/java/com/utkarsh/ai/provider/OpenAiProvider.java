package com.utkarsh.ai.provider;

import com.openai.client.OpenAIClient;
import com.openai.errors.BadRequestException;
import com.openai.errors.InternalServerException;
import com.openai.errors.OpenAIException;
import com.openai.errors.OpenAIIoException;
import com.openai.errors.RateLimitException;
import com.openai.errors.UnauthorizedException;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;
import com.utkarsh.ai.config.AiApiKeyPresentCondition;
import com.utkarsh.ai.config.OpenAiConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Conditional;
import org.springframework.stereotype.Component;

@Component
@Conditional(AiApiKeyPresentCondition.class)
public class OpenAiProvider implements AiProvider {

    private static final Logger log = LoggerFactory.getLogger(OpenAiProvider.class);

    private final OpenAIClient openAiClient;
    private final OpenAiConfig config;

    public OpenAiProvider(OpenAIClient openAiClient, OpenAiConfig config) {
        this.openAiClient = openAiClient;
        this.config = config;
    }

    @Override
    public String generateResponse(String userEmail, String conversationId, String message) {
        log.info("OpenAI generating response conversationId={}", conversationId);

        long startTime = System.currentTimeMillis();

        try {
            ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
                    .addUserMessage(message)
                    .model(config.getModel())
                    .maxTokens(config.getMaxTokens())
                    .temperature(config.getTemperature())
                    .build();

            ChatCompletion chatCompletion = openAiClient.chat().completions().create(params);

            long elapsed = System.currentTimeMillis() - startTime;

            String content = chatCompletion.choices().stream()
                    .findFirst()
                    .flatMap(choice -> choice.message().content())
                    .orElse(null);

            if (content == null || content.isBlank()) {
                throw new AiProviderException("EMPTY_RESPONSE",
                        "OpenAI returned an empty or blank response");
            }

            log.info("OpenAI response received conversationId={} tokens={} duration={}ms",
                    conversationId,
                    chatCompletion.usage().map(u -> u.totalTokens()).orElse(0L),
                    elapsed);

            return content;

        } catch (AiProviderException e) {
            throw e;

        } catch (UnauthorizedException e) {
            long elapsed = System.currentTimeMillis() - startTime;
            log.error("OpenAI auth error conversationId={} duration={}ms", conversationId, elapsed);
            throw new AiProviderException("PROVIDER_AUTH_ERROR",
                    "OpenAI authentication failed: invalid API key", e);

        } catch (BadRequestException e) {
            long elapsed = System.currentTimeMillis() - startTime;
            log.error("OpenAI bad request conversationId={} duration={}ms: {}",
                    conversationId, elapsed, e.getMessage());
            throw new AiProviderException("INVALID_REQUEST",
                    "OpenAI rejected the request: " + e.getMessage(), e);

        } catch (RateLimitException e) {
            long elapsed = System.currentTimeMillis() - startTime;
            log.error("OpenAI rate limit conversationId={} duration={}ms", conversationId, elapsed);
            throw new AiProviderException("PROVIDER_RATE_LIMIT",
                    "OpenAI rate limit exceeded", e);

        } catch (InternalServerException e) {
            long elapsed = System.currentTimeMillis() - startTime;
            log.error("OpenAI server error conversationId={} duration={}ms: {}",
                    conversationId, elapsed, e.getMessage());
            throw new AiProviderException("PROVIDER_SERVER_ERROR",
                    "OpenAI server error: " + e.getMessage(), e);

        } catch (OpenAIIoException e) {
            long elapsed = System.currentTimeMillis() - startTime;
            log.error("OpenAI network/timeout error conversationId={} duration={}ms: {}",
                    conversationId, elapsed, e.getMessage());
            throw new AiProviderException("PROVIDER_TIMEOUT",
                    "OpenAI request failed: " + e.getMessage(), e);

        } catch (OpenAIException e) {
            long elapsed = System.currentTimeMillis() - startTime;
            log.error("OpenAI error conversationId={} duration={}ms: {}",
                    conversationId, elapsed, e.getMessage());
            throw new AiProviderException("PROVIDER_ERROR",
                    "OpenAI error: " + e.getMessage(), e);

        } catch (Exception e) {
            long elapsed = System.currentTimeMillis() - startTime;
            String className = e.getClass().getSimpleName();

            if (className.contains("Timeout") || className.contains("SocketTimeout")
                    || className.contains("ConnectException")
                    || className.contains("IOException")) {
                log.error("OpenAI network/timeout error conversationId={} duration={}ms: {}",
                        conversationId, elapsed, e.getMessage());
                throw new AiProviderException("PROVIDER_TIMEOUT",
                        "OpenAI request failed: " + e.getMessage(), e);
            }

            log.error("Unexpected error calling OpenAI conversationId={} duration={}ms: {}",
                    conversationId, elapsed, e.getMessage());
            throw new AiProviderException("PROVIDER_ERROR",
                    "Unexpected error calling OpenAI: " + e.getMessage(), e);
        }
    }
}
