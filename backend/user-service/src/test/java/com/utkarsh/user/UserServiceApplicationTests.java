package com.utkarsh.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.utkarsh.user.dto.UpdateUserProfileRequest;
import com.utkarsh.user.dto.UserProfileResponse;
import com.utkarsh.user.entity.UserProfile;
import com.utkarsh.user.repository.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class UserServiceApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserProfileRepository repository;

    @BeforeEach
    void setup() {
        repository.deleteAll();
    }

    @Test
    void contextLoads() {
    }

    @Test
    void getCurrentUser_createsProfileOnFirstAccess() throws Exception {
        mockMvc.perform(get("/api/users/me")
                        .header("X-User-Email", "new@example.com")
                        .header("X-User-Name", "New User"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("new@example.com"))
                .andExpect(jsonPath("$.name").value("New User"))
                .andExpect(jsonPath("$.id").isNumber());
    }

    @Test
    void getCurrentUser_returnsExistingProfile() throws Exception {
        UserProfile existing = new UserProfile("existing@example.com");
        existing.setName("Existing User");
        existing.setBio("Existing bio");
        repository.save(existing);

        mockMvc.perform(get("/api/users/me")
                        .header("X-User-Email", "existing@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("existing@example.com"))
                .andExpect(jsonPath("$.name").value("Existing User"))
                .andExpect(jsonPath("$.bio").value("Existing bio"));
    }

    @Test
    void getCurrentUser_withoutIdentityHeader_returns403() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isForbidden());
    }

    @Test
    void getCurrentUser_withBlankEmail_returns403() throws Exception {
        mockMvc.perform(get("/api/users/me")
                        .header("X-User-Email", "  "))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateCurrentUser_updatesProfile() throws Exception {
        UserProfile existing = new UserProfile("update@example.com");
        existing.setName("Original Name");
        repository.save(existing);

        UpdateUserProfileRequest request = new UpdateUserProfileRequest();
        request.setName("Updated Name");
        request.setBio("Updated bio");
        request.setLocation("New York");
        request.setWebsite("https://example.com");

        mockMvc.perform(put("/api/users/me")
                        .header("X-User-Email", "update@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Name"))
                .andExpect(jsonPath("$.bio").value("Updated bio"))
                .andExpect(jsonPath("$.location").value("New York"))
                .andExpect(jsonPath("$.website").value("https://example.com"));
    }

    @Test
    void updateCurrentUser_partialUpdate() throws Exception {
        UserProfile existing = new UserProfile("partial@example.com");
        existing.setName("Original Name");
        existing.setBio("Original bio");
        repository.save(existing);

        UpdateUserProfileRequest request = new UpdateUserProfileRequest();
        request.setBio("Only bio updated");

        mockMvc.perform(put("/api/users/me")
                        .header("X-User-Email", "partial@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Original Name"))
                .andExpect(jsonPath("$.bio").value("Only bio updated"));
    }

    @Test
    void updateCurrentUser_withoutIdentityHeader_returns403() throws Exception {
        UpdateUserProfileRequest request = new UpdateUserProfileRequest();
        request.setName("Updated Name");

        mockMvc.perform(put("/api/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void updateCurrentUser_userNotFound_returns404() throws Exception {
        UpdateUserProfileRequest request = new UpdateUserProfileRequest();
        request.setName("New Name");

        mockMvc.perform(put("/api/users/me")
                        .header("X-User-Email", "nonexistent@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value(containsString("not found")));
    }

    @Test
    void updateCurrentUser_validationErrors() throws Exception {
        UserProfile existing = new UserProfile("validate@example.com");
        existing.setName("Test User");
        repository.save(existing);

        UpdateUserProfileRequest request = new UpdateUserProfileRequest();
        request.setName("a");
        request.setBio("x".repeat(501));

        mockMvc.perform(put("/api/users/me")
                        .header("X-User-Email", "validate@example.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors").isMap());
    }

    @Test
    void getUserById_returnsProfile() throws Exception {
        UserProfile existing = new UserProfile("public@example.com");
        existing.setName("Public User");
        existing.setBio("Public bio");
        repository.save(existing);

        mockMvc.perform(get("/api/users/" + existing.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("public@example.com"))
                .andExpect(jsonPath("$.name").value("Public User"));
    }

    @Test
    void getUserById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/users/99999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value(containsString("not found")));
    }

    @Test
    void healthEndpoint() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void getCurrentUser_responseDoesNotExposeSensitiveFields() throws Exception {
        UserProfile existing = new UserProfile("safe@example.com");
        existing.setName("Safe User");
        repository.save(existing);

        mockMvc.perform(get("/api/users/me")
                        .header("X-User-Email", "safe@example.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.password").doesNotExist())
                .andExpect(jsonPath("$.createdAt").doesNotExist())
                .andExpect(jsonPath("$.updatedAt").doesNotExist());
    }
}
