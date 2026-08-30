package com.utkarsh.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.utkarsh.ai.dto.ChatRequest;
import com.utkarsh.ai.entity.Conversation;
import com.utkarsh.ai.kafka.event.ChatRequestEvent;
import com.utkarsh.ai.kafka.producer.ChatEventProducer;
import com.utkarsh.ai.repository.ChatMessageRepository;
import com.utkarsh.ai.repository.ConversationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.kafka.support.SendResult;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.concurrent.CompletableFuture;
import org.springframework.transaction.annotation.Transactional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AiServiceApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ChatEventProducer chatEventProducer;

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @BeforeEach
    void setUp() {
        chatMessageRepository.deleteAll();
        conversationRepository.deleteAll();

        SendResult<String, ChatRequestEvent> mockResult = org.mockito.Mockito.mock(SendResult.class);
        org.apache.kafka.clients.producer.RecordMetadata mockMetadata =
                org.mockito.Mockito.mock(org.apache.kafka.clients.producer.RecordMetadata.class);
        when(mockResult.getRecordMetadata()).thenReturn(mockMetadata);
        when(mockMetadata.partition()).thenReturn(0);
        when(mockMetadata.offset()).thenReturn(0L);
        when(chatEventProducer.sendChatRequest(any(ChatRequestEvent.class)))
                .thenReturn(CompletableFuture.completedFuture(mockResult));
    }

    @Test
    void contextLoads() {
    }

    @Test
    void chat_newConversation_returnsAcceptedWithCorrelationId() throws Exception {
        ChatRequest request = new ChatRequest();
        request.setMessage("Hello, AI!");

        mockMvc.perform(post("/api/ai/chat")
                        .header("X-User-Email", "test@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.correlationId").isNotEmpty())
                .andExpect(jsonPath("$.conversationId").isNumber())
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void chat_existingConversation_returnsAccepted() throws Exception {
        Conversation conversation = new Conversation("test@example.com", "Test Conversation");
        conversationRepository.save(conversation);

        ChatRequest request = new ChatRequest();
        request.setMessage("Follow-up message");
        request.setConversationId(conversation.getId());

        mockMvc.perform(post("/api/ai/chat")
                        .header("X-User-Email", "test@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.conversationId").value(conversation.getId()))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void chat_withoutIdentityHeader_returns403() throws Exception {
        ChatRequest request = new ChatRequest();
        request.setMessage("Hello");

        mockMvc.perform(post("/api/ai/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void chat_withBlankEmail_returns403() throws Exception {
        ChatRequest request = new ChatRequest();
        request.setMessage("Hello");

        mockMvc.perform(post("/api/ai/chat")
                        .header("X-User-Email", "  ")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void chat_emptyMessage_returns400() throws Exception {
        ChatRequest request = new ChatRequest();
        request.setMessage("");

        mockMvc.perform(post("/api/ai/chat")
                        .header("X-User-Email", "test@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getChatStatus_pendingRequest_returnsPending() throws Exception {
        ChatRequest request = new ChatRequest();
        request.getMessage();
        request.setMessage("Test message");

        String responseBody = mockMvc.perform(post("/api/ai/chat")
                        .header("X-User-Email", "test@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isAccepted())
                .andReturn().getResponse().getContentAsString();

        String correlationId = objectMapper.readTree(responseBody).get("correlationId").asText();

        mockMvc.perform(get("/api/ai/chat/status/" + correlationId)
                        .header("X-User-Email", "test@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.correlationId").value(correlationId))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void getChatStatus_nonExistentCorrelationId_returns404() throws Exception {
        mockMvc.perform(get("/api/ai/chat/status/non-existent-id")
                        .header("X-User-Email", "test@example.com"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getChatStatus_withoutIdentityHeader_returns403() throws Exception {
        mockMvc.perform(get("/api/ai/chat/status/some-id"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getConversations_returnsUserConversations() throws Exception {
        Conversation c1 = new Conversation("test@example.com", "First Conversation");
        Conversation c2 = new Conversation("test@example.com", "Second Conversation");
        Conversation c3 = new Conversation("other@example.com", "Other User Conversation");
        conversationRepository.save(c1);
        conversationRepository.save(c2);
        conversationRepository.save(c3);

        mockMvc.perform(get("/api/ai/conversations")
                        .header("X-User-Email", "test@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getConversations_withoutIdentityHeader_returns403() throws Exception {
        mockMvc.perform(get("/api/ai/conversations"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getConversation_returnsConversationWithMessages() throws Exception {
        Conversation conversation = new Conversation("test@example.com", "Test Conversation");
        conversationRepository.save(conversation);

        mockMvc.perform(get("/api/ai/conversations/" + conversation.getId())
                        .header("X-User-Email", "test@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(conversation.getId()))
                .andExpect(jsonPath("$.title").value("Test Conversation"))
                .andExpect(jsonPath("$.messages").isArray());
    }

    @Test
    void getConversation_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/ai/conversations/999")
                        .header("X-User-Email", "test@example.com"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getConversation_wrongUser_returns404() throws Exception {
        Conversation conversation = new Conversation("test@example.com", "Test Conversation");
        conversationRepository.save(conversation);

        mockMvc.perform(get("/api/ai/conversations/" + conversation.getId())
                        .header("X-User-Email", "other@example.com"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteConversation_removesConversation() throws Exception {
        Conversation conversation = new Conversation("test@example.com", "To Delete");
        conversationRepository.save(conversation);

        mockMvc.perform(delete("/api/ai/conversations/" + conversation.getId())
                        .header("X-User-Email", "test@example.com"))
                .andExpect(status().isNoContent());
    }

    @Test
    void deleteConversation_notFound_returns404() throws Exception {
        mockMvc.perform(delete("/api/ai/conversations/999")
                        .header("X-User-Email", "test@example.com"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteConversation_wrongUser_returns404() throws Exception {
        Conversation conversation = new Conversation("test@example.com", "Not Yours");
        conversationRepository.save(conversation);

        mockMvc.perform(delete("/api/ai/conversations/" + conversation.getId())
                        .header("X-User-Email", "other@example.com"))
                .andExpect(status().isNotFound());
    }

    @Test
    void healthEndpoint() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
    }
}
