package com.utkarsh.ai.kafka.consumer;

import com.utkarsh.ai.entity.ChatMessage;
import com.utkarsh.ai.entity.Conversation;
import com.utkarsh.ai.kafka.event.AiError;
import com.utkarsh.ai.kafka.event.ChatRequestEvent;
import com.utkarsh.ai.kafka.event.ChatResponseEvent;
import com.utkarsh.ai.provider.AiProvider;
import com.utkarsh.ai.provider.AiProviderException;
import com.utkarsh.ai.repository.ChatMessageRepository;
import com.utkarsh.ai.repository.ConversationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;

@Component
@ConditionalOnProperty(name = "ai.kafka.consumer.enabled", havingValue = "true", matchIfMissing = true)
public class ChatEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(ChatEventConsumer.class);

    private final ChatMessageRepository chatMessageRepository;
    private final ConversationRepository conversationRepository;
    private final AiProvider aiProvider;
    private final KafkaTemplate<String, ChatResponseEvent> responseKafkaTemplate;
    private final String responsesTopic;

    public ChatEventConsumer(ChatMessageRepository chatMessageRepository,
                             ConversationRepository conversationRepository,
                             AiProvider aiProvider,
                             @Qualifier("chatResponseKafkaTemplate") KafkaTemplate<String, ChatResponseEvent> responseKafkaTemplate,
                             @Value("${ai.kafka.topics.responses}") String responsesTopic) {
        this.chatMessageRepository = chatMessageRepository;
        this.conversationRepository = conversationRepository;
        this.aiProvider = aiProvider;
        this.responseKafkaTemplate = responseKafkaTemplate;
        this.responsesTopic = responsesTopic;
    }

    @KafkaListener(
            topics = "${ai.kafka.topics.requests}",
            groupId = "ai-chat-processor",
            containerFactory = "kafkaListenerContainerFactory"
    )
    @Transactional
    public void consumeChatRequest(@Payload ChatRequestEvent event,
                                   @Header(KafkaHeaders.RECEIVED_KEY) String key) {
        log.info("Received chat request event: correlationId={} conversationId={} user={}",
                event.getCorrelationId(), event.getConversationId(), event.getUserEmail());

        Optional<ChatMessage> existingMessage = chatMessageRepository.findByCorrelationId(event.getCorrelationId());
        if (existingMessage.isPresent() && existingMessage.get().getStatus() == ChatMessage.Status.COMPLETED) {
            log.info("Duplicate event detected for correlationId={}, skipping", event.getCorrelationId());
            return;
        }

        Optional<Conversation> conversationOpt = conversationRepository.findById(event.getConversationId());
        if (conversationOpt.isEmpty()) {
            log.error("Conversation not found for id={}", event.getConversationId());
            sendFailedResponse(event, "CONVERSATION_NOT_FOUND", "Conversation not found");
            return;
        }

        Conversation conversation = conversationOpt.get();
        if (!conversation.getUserEmail().equals(event.getUserEmail())) {
            log.error("User {} does not own conversation {}", event.getUserEmail(), event.getConversationId());
            sendFailedResponse(event, "UNAUTHORIZED", "User does not own this conversation");
            return;
        }

        existingMessage.ifPresent(msg -> {
            msg.setStatus(ChatMessage.Status.PROCESSING);
            chatMessageRepository.save(msg);
        });

        try {
            long startTime = System.currentTimeMillis();
            String aiResponse = aiProvider.generateResponse(
                    event.getUserEmail(),
                    String.valueOf(event.getConversationId()),
                    event.getMessage()
            );
            long processingTimeMs = System.currentTimeMillis() - startTime;

            existingMessage.ifPresent(msg -> {
                msg.setContent(aiResponse);
                msg.setStatus(ChatMessage.Status.COMPLETED);
                chatMessageRepository.save(msg);
            });

            ChatResponseEvent responseEvent = new ChatResponseEvent();
            responseEvent.setCorrelationId(event.getCorrelationId());
            responseEvent.setConversationId(event.getConversationId());
            responseEvent.setUserEmail(event.getUserEmail());
            responseEvent.setStatus(ChatResponseEvent.Status.COMPLETED);
            responseEvent.setAiResponse(aiResponse);
            responseEvent.setTimestamp(Instant.now());
            responseEvent.setProcessingTimeMs(processingTimeMs);

            responseKafkaTemplate.send(responsesTopic, String.valueOf(event.getConversationId()), responseEvent);

            log.info("Chat request processed successfully correlationId={} processingTimeMs={}",
                    event.getCorrelationId(), processingTimeMs);

        } catch (AiProviderException e) {
            log.error("AI provider error for correlationId={}: {}", event.getCorrelationId(), e.getMessage());
            existingMessage.ifPresent(msg -> {
                msg.setStatus(ChatMessage.Status.FAILED);
                chatMessageRepository.save(msg);
            });
            sendFailedResponse(event, e.getCode(), e.getMessage());

        } catch (Exception e) {
            log.error("Unexpected error processing chat request correlationId={}: {}",
                    event.getCorrelationId(), e.getMessage());
            existingMessage.ifPresent(msg -> {
                msg.setStatus(ChatMessage.Status.FAILED);
                chatMessageRepository.save(msg);
            });
            sendFailedResponse(event, "INTERNAL_ERROR", "An unexpected error occurred");
        }
    }

    @KafkaListener(
            topics = "${ai.kafka.topics.dlq}",
            groupId = "ai-chat-dlq-processor",
            containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeDlqMessage(@Payload ChatRequestEvent event) {
        log.warn("Received message in DLQ: correlationId={} conversationId={}",
                event.getCorrelationId(), event.getConversationId());

        chatMessageRepository.findByCorrelationId(event.getCorrelationId()).ifPresent(msg -> {
            msg.setStatus(ChatMessage.Status.DEAD_LETTER);
            chatMessageRepository.save(msg);
        });

        ChatResponseEvent responseEvent = new ChatResponseEvent();
        responseEvent.setCorrelationId(event.getCorrelationId());
        responseEvent.setConversationId(event.getConversationId());
        responseEvent.setUserEmail(event.getUserEmail());
        responseEvent.setStatus(ChatResponseEvent.Status.FAILED);
        responseEvent.setTimestamp(Instant.now());
        responseEvent.setError(new AiError("DEAD_LETTER", "Message moved to dead letter queue after max retries"));

        responseKafkaTemplate.send(responsesTopic, String.valueOf(event.getConversationId()), responseEvent);
    }

    private void sendFailedResponse(ChatRequestEvent event, String errorCode, String errorMessage) {
        ChatResponseEvent responseEvent = new ChatResponseEvent();
        responseEvent.setCorrelationId(event.getCorrelationId());
        responseEvent.setConversationId(event.getConversationId());
        responseEvent.setUserEmail(event.getUserEmail());
        responseEvent.setStatus(ChatResponseEvent.Status.FAILED);
        responseEvent.setTimestamp(Instant.now());
        responseEvent.setError(new AiError(errorCode, errorMessage));

        responseKafkaTemplate.send(responsesTopic, String.valueOf(event.getConversationId()), responseEvent);
    }
}
