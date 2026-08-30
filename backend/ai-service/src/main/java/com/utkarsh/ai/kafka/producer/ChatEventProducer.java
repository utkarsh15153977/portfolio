package com.utkarsh.ai.kafka.producer;

import com.utkarsh.ai.kafka.event.ChatRequestEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
public class ChatEventProducer {

    private static final Logger log = LoggerFactory.getLogger(ChatEventProducer.class);

    private final KafkaTemplate<String, ChatRequestEvent> kafkaTemplate;
    private final String requestsTopic;

    public ChatEventProducer(@Qualifier("chatRequestKafkaTemplate") KafkaTemplate<String, ChatRequestEvent> kafkaTemplate,
                             @org.springframework.beans.factory.annotation.Value("${ai.kafka.topics.requests}") String requestsTopic) {
        this.kafkaTemplate = kafkaTemplate;
        this.requestsTopic = requestsTopic;
    }

    public CompletableFuture<SendResult<String, ChatRequestEvent>> sendChatRequest(ChatRequestEvent event) {
        String key = String.valueOf(event.getConversationId());
        log.info("Sending chat request event to topic={} key={} correlationId={}",
                requestsTopic, key, event.getCorrelationId());

        CompletableFuture<SendResult<String, ChatRequestEvent>> future =
                kafkaTemplate.send(requestsTopic, key, event);

        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("Failed to send chat request event correlationId={}: {}",
                        event.getCorrelationId(), ex.getMessage());
            } else {
                log.info("Chat request event sent successfully correlationId={} partition={} offset={}",
                        event.getCorrelationId(),
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            }
        });

        return future;
    }
}
