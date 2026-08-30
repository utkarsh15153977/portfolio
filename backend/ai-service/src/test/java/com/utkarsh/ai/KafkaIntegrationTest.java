package com.utkarsh.ai;

import com.utkarsh.ai.entity.ChatMessage;
import com.utkarsh.ai.entity.Conversation;
import com.utkarsh.ai.kafka.event.ChatRequestEvent;
import com.utkarsh.ai.kafka.event.ChatResponseEvent;
import com.utkarsh.ai.repository.ChatMessageRepository;
import com.utkarsh.ai.repository.ConversationRepository;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.ContainerProperties;
import org.springframework.kafka.listener.KafkaMessageListenerContainer;
import org.springframework.kafka.listener.MessageListener;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.kafka.test.utils.ContainerTestUtils;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(properties = {
        "ai.kafka.consumer.enabled=true",
        "spring.kafka.bootstrap-servers=${spring.embedded.kafka.brokers}",
        "ai.kafka.topics.requests=ai.chat.requests",
        "ai.kafka.topics.responses=ai.chat.responses",
        "ai.kafka.topics.dlq=ai.chat.dlq"
})
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@EmbeddedKafka(partitions = 1, brokerProperties = {"listeners=PLAINTEXT://localhost:9093", "port=9093"},
        topics = {"ai.chat.requests", "ai.chat.responses", "ai.chat.dlq"})
class KafkaIntegrationTest {

    @Autowired
    private EmbeddedKafkaBroker embeddedKafkaBroker;

    @Autowired
    private KafkaTemplate<String, ChatRequestEvent> chatRequestKafkaTemplate;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    private BlockingQueue<ConsumerRecord<String, ChatResponseEvent>> responseRecords;
    private KafkaMessageListenerContainer<String, ChatResponseEvent> responseContainer;

    @BeforeEach
    void setUp() {
        chatMessageRepository.deleteAll();
        conversationRepository.deleteAll();

        ConsumerFactory<String, ChatResponseEvent> responseConsumerFactory = new DefaultKafkaConsumerFactory<>(
                Map.of(
                        ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, embeddedKafkaBroker.getBrokersAsString(),
                        ConsumerConfig.GROUP_ID_CONFIG, "test-response-" + UUID.randomUUID(),
                        ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest",
                        ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class,
                        ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, ErrorHandlingDeserializer.class,
                        ErrorHandlingDeserializer.KEY_DESERIALIZER_CLASS, StringDeserializer.class,
                        ErrorHandlingDeserializer.VALUE_DESERIALIZER_CLASS, JsonDeserializer.class,
                        JsonDeserializer.TRUSTED_PACKAGES, "com.utkarsh.ai.kafka.event",
                        JsonDeserializer.VALUE_DEFAULT_TYPE, ChatResponseEvent.class.getName()
                )
        );

        responseRecords = new LinkedBlockingQueue<>();
        ContainerProperties containerProps = new ContainerProperties("ai.chat.responses");
        responseContainer = new KafkaMessageListenerContainer<>(responseConsumerFactory, containerProps);
        responseContainer.setupMessageListener(
                (MessageListener<String, ChatResponseEvent>) responseRecords::add);
        responseContainer.start();

        try {
            ContainerTestUtils.waitForAssignment(responseContainer, embeddedKafkaBroker.getPartitionsPerTopic());
        } catch (Exception e) {
            // ignore
        }

        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    @AfterEach
    void tearDown() {
        if (responseContainer != null) {
            responseContainer.stop();
        }
        chatMessageRepository.deleteAll();
        conversationRepository.deleteAll();
    }

    private ConsumerRecord<String, ChatResponseEvent> waitForResponse(String correlationId, long timeoutMs) throws InterruptedException {
        long deadline = System.currentTimeMillis() + timeoutMs;
        while (System.currentTimeMillis() < deadline) {
            ConsumerRecord<String, ChatResponseEvent> record = responseRecords.poll(200, TimeUnit.MILLISECONDS);
            if (record != null && correlationId.equals(record.value().getCorrelationId())) {
                return record;
            }
        }
        return null;
    }

    @Test
    void fullFlow_chatRequestGetsProcessed() throws Exception {
        Conversation conversation = new Conversation("test@example.com", "Test Conversation");
        conversationRepository.save(conversation);

        String correlationId = "fullflow-" + UUID.randomUUID();

        ChatMessage pendingMessage = new ChatMessage(
                conversation, "user", "Tell me about Spring Boot",
                ChatMessage.Status.PENDING, correlationId);
        chatMessageRepository.save(pendingMessage);

        ChatRequestEvent event = new ChatRequestEvent(
                correlationId,
                conversation.getId(),
                "test@example.com",
                "Tell me about Spring Boot"
        );

        chatRequestKafkaTemplate.send("ai.chat.requests", String.valueOf(conversation.getId()), event).get();

        long deadline = System.currentTimeMillis() + 30000;
        ChatMessage aiMessage = null;
        while (System.currentTimeMillis() < deadline) {
            aiMessage = chatMessageRepository.findByCorrelationId(correlationId).orElse(null);
            if (aiMessage != null && (aiMessage.getStatus() == ChatMessage.Status.COMPLETED
                    || aiMessage.getStatus() == ChatMessage.Status.FAILED)) {
                break;
            }
            Thread.sleep(200);
        }

        assertNotNull(aiMessage, "AI message should be created within 30 seconds");
        assertEquals(ChatMessage.Status.COMPLETED, aiMessage.getStatus());
        assertNotNull(aiMessage.getContent());
        assertFalse(aiMessage.getContent().isEmpty());
    }

    @Test
    void idempotency_duplicateEventIsSkipped() throws Exception {
        Conversation conversation = new Conversation("test@example.com", "Test Conversation");
        conversationRepository.save(conversation);

        String correlationId = "idempotency-" + UUID.randomUUID();

        ChatMessage existingMessage = new ChatMessage(
                conversation, "assistant", "Already completed response",
                ChatMessage.Status.COMPLETED, correlationId);
        chatMessageRepository.save(existingMessage);

        ChatRequestEvent event = new ChatRequestEvent(
                correlationId,
                conversation.getId(),
                "test@example.com",
                "Duplicate message"
        );

        chatRequestKafkaTemplate.send("ai.chat.requests", String.valueOf(conversation.getId()), event).get();

        ConsumerRecord<String, ChatResponseEvent> received = waitForResponse(correlationId, 10000);
        assertNull(received, "Duplicate event should not produce a response");
    }

    @Test
    void consumer_conversationNotFound_sendsFailedResponse() throws Exception {
        String correlationId = "notfound-" + UUID.randomUUID();
        ChatRequestEvent event = new ChatRequestEvent(
                correlationId,
                99999L,
                "test@example.com",
                "Message for non-existent conversation"
        );

        chatRequestKafkaTemplate.send("ai.chat.requests", "99999", event).get();

        ConsumerRecord<String, ChatResponseEvent> received = waitForResponse(correlationId, 10000);
        assertNotNull(received);

        ChatResponseEvent response = received.value();
        assertEquals(correlationId, response.getCorrelationId());
        assertEquals(ChatResponseEvent.Status.FAILED, response.getStatus());
        assertNotNull(response.getError());
        assertEquals("CONVERSATION_NOT_FOUND", response.getError().getCode());
    }

    @Test
    void consumer_wrongUser_sendsFailedResponse() throws Exception {
        Conversation conversation = new Conversation("owner@example.com", "Owner's Conversation");
        conversationRepository.save(conversation);

        String correlationId = "unauth-" + UUID.randomUUID();
        ChatRequestEvent event = new ChatRequestEvent(
                correlationId,
                conversation.getId(),
                "attacker@example.com",
                "Unauthorized message"
        );

        chatRequestKafkaTemplate.send("ai.chat.requests", String.valueOf(conversation.getId()), event).get();

        ConsumerRecord<String, ChatResponseEvent> received = waitForResponse(correlationId, 10000);
        assertNotNull(received);

        ChatResponseEvent response = received.value();
        assertEquals(ChatResponseEvent.Status.FAILED, response.getStatus());
        assertEquals("UNAUTHORIZED", response.getError().getCode());
    }
}
