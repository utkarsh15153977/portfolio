package com.utkarsh.ai.service;

import com.utkarsh.ai.dto.*;
import com.utkarsh.ai.entity.ChatMessage;
import com.utkarsh.ai.entity.Conversation;
import com.utkarsh.ai.exception.ResourceNotFoundException;
import com.utkarsh.ai.kafka.event.ChatRequestEvent;
import com.utkarsh.ai.kafka.producer.ChatEventProducer;
import com.utkarsh.ai.repository.ChatMessageRepository;
import com.utkarsh.ai.repository.ConversationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatEventProducer chatEventProducer;

    public AiService(ConversationRepository conversationRepository,
                     ChatMessageRepository chatMessageRepository,
                     ChatEventProducer chatEventProducer) {
        this.conversationRepository = conversationRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.chatEventProducer = chatEventProducer;
    }

    @Transactional
    public ChatAcceptedResponse chat(String userEmail, ChatRequest request) {
        Conversation conversation;

        if (request.getConversationId() != null) {
            conversation = conversationRepository.findByIdAndUserEmail(request.getConversationId(), userEmail)
                    .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));
        } else {
            conversation = new Conversation(userEmail, truncateTitle(request.getMessage()));
            conversationRepository.save(conversation);
        }

        String correlationId = UUID.randomUUID().toString();

        ChatMessage userMessage = new ChatMessage(conversation, "user", request.getMessage(),
                ChatMessage.Status.COMPLETED, null);
        chatMessageRepository.save(userMessage);

        ChatMessage pendingAiMessage = new ChatMessage(conversation, "assistant", "",
                ChatMessage.Status.PENDING, correlationId);
        chatMessageRepository.save(pendingAiMessage);

        conversationRepository.save(conversation);

        ChatRequestEvent event = new ChatRequestEvent(correlationId, conversation.getId(), userEmail, request.getMessage());

        try {
            CompletableFuture<SendResult<String, ChatRequestEvent>> future = chatEventProducer.sendChatRequest(event);
            future.whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to publish chat request for correlationId={}: {}",
                            correlationId, ex.getMessage());
                }
            });
        } catch (Exception e) {
            log.error("Kafka unavailable, failed to publish chat request for correlationId={}: {}",
                    correlationId, e.getMessage());
            pendingAiMessage.setStatus(ChatMessage.Status.FAILED);
            chatMessageRepository.save(pendingAiMessage);
            throw new RuntimeException("AI service temporarily unavailable", e);
        }

        return new ChatAcceptedResponse(correlationId, conversation.getId(), "PENDING");
    }

    @Transactional(readOnly = true)
    public List<ConversationResponse> getConversations(String userEmail) {
        List<Conversation> conversations = conversationRepository.findByUserEmailOrderByUpdatedAtDesc(userEmail);
        return conversations.stream()
                .map(c -> {
                    long messageCount = chatMessageRepository.countByConversationId(c.getId());
                    return new ConversationResponse(c.getId(), c.getTitle(), (int) messageCount, c.getCreatedAt(), c.getUpdatedAt());
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ConversationDetailResponse getConversation(String userEmail, Long conversationId) {
        Conversation conversation = conversationRepository.findByIdAndUserEmail(conversationId, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        List<ChatMessage> messages = chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        List<ConversationDetailResponse.MessageDto> messageDtos = messages.stream()
                .map(m -> new ConversationDetailResponse.MessageDto(m.getId(), m.getRole(), m.getContent(), m.getCreatedAt()))
                .collect(Collectors.toList());

        return new ConversationDetailResponse(conversation.getId(), conversation.getTitle(),
                conversation.getCreatedAt(), conversation.getUpdatedAt(), messageDtos);
    }

    @Transactional
    public void deleteConversation(String userEmail, Long conversationId) {
        Conversation conversation = conversationRepository.findByIdAndUserEmail(conversationId, userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation not found"));

        chatMessageRepository.deleteByConversationId(conversationId);
        conversationRepository.delete(conversation);
    }

    @Transactional(readOnly = true)
    public ChatStatusResponse getStatus(String userEmail, String correlationId) {
        ChatMessage aiMessage = chatMessageRepository.findByCorrelationId(correlationId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat request not found"));

        if (!aiMessage.getConversation().getUserEmail().equals(userEmail)) {
            throw new ResourceNotFoundException("Chat request not found");
        }

        ChatStatusResponse response = new ChatStatusResponse(
                correlationId,
                aiMessage.getConversation().getId(),
                aiMessage.getStatus().name()
        );

        if (aiMessage.getStatus() == ChatMessage.Status.COMPLETED) {
            response.setAiResponse(aiMessage.getContent());
        } else if (aiMessage.getStatus() == ChatMessage.Status.FAILED
                || aiMessage.getStatus() == ChatMessage.Status.DEAD_LETTER) {
            response.setError("AI processing failed");
        }

        return response;
    }

    private String truncateTitle(String message) {
        if (message.length() <= 100) {
            return message;
        }
        return message.substring(0, 97) + "...";
    }
}
