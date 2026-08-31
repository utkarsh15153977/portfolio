package com.utkarsh.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.utkarsh.auth.dto.LoginRequest;
import com.utkarsh.auth.dto.RegisterRequest;
import com.utkarsh.auth.entity.User;
import com.utkarsh.auth.repository.UserRepository;
import com.utkarsh.auth.security.JwtService;
import com.utkarsh.auth.service.TokenRevocationService;
import com.utkarsh.auth.service.UserCacheService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthServiceApplicationTests {

    @SuppressWarnings("unchecked")
    @MockBean
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private TokenRevocationService tokenRevocationService;

    @Autowired
    private UserCacheService userCacheService;

    @SuppressWarnings("unchecked")
    @BeforeEach
    void setupRedisMocks() {
        ValueOperations<String, String> valueOps = org.mockito.Mockito.mock(ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valueOps);
        when(valueOps.increment(anyString())).thenReturn(1L);
        when(valueOps.get(anyString())).thenReturn(null);
        when(redisTemplate.hasKey(anyString())).thenReturn(false);
    }

    @Test
    void contextLoads() {
    }

    @Test
    void healthEndpoint() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void registerSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setName("Test User");
        request.setPassword("Password@123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").value(nullValue()))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.name").value("Test User"));
    }

    @Test
    void registerDuplicateEmail() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("dup@example.com");
        request.setName("First User");
        request.setPassword("Password@123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        RegisterRequest dupRequest = new RegisterRequest();
        dupRequest.setEmail("dup@example.com");
        dupRequest.setName("Second User");
        dupRequest.setPassword("Password@456");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dupRequest)))
                .andExpect(status().isConflict());
    }

    @Test
    void loginSuccess() throws Exception {
        RegisterRequest regReq = new RegisterRequest();
        regReq.setEmail("login@example.com");
        regReq.setName("Login User");
        regReq.setPassword("Password@123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated());

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("login@example.com");
        loginReq.setPassword("Password@123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.email").value("login@example.com"));
    }

    @Test
    void loginInvalidPassword() throws Exception {
        RegisterRequest regReq = new RegisterRequest();
        regReq.setEmail("wrong@example.com");
        regReq.setName("Wrong User");
        regReq.setPassword("Password@123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated());

        LoginRequest loginReq = new LoginRequest();
        loginReq.setEmail("wrong@example.com");
        loginReq.setPassword("WrongPassword");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void jwtGeneration() {
        String email = "jwt@example.com";
        String token = jwtService.generateToken(email, "JWT User");
        assert token != null;
        assert !token.isEmpty();
    }

    @Test
    void jwtValidation() {
        String email = "jwt@example.com";
        String token = jwtService.generateToken(email, "JWT User");
        assert jwtService.isTokenValid(token);
        assert jwtService.extractEmail(token).equals(email);
    }

    @Test
    void protectedEndpointWithoutJwt() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpointWithJwt() throws Exception {
        RegisterRequest regReq = new RegisterRequest();
        regReq.setEmail("protected@example.com");
        regReq.setName("Protected User");
        regReq.setPassword("Password@123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated());

        String token = jwtService.generateToken("protected@example.com", "Protected User");

        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("protected@example.com"))
                .andExpect(jsonPath("$.name").value("Protected User"));
    }

    @Test
    void registerValidationErrors() throws Exception {
        RegisterRequest emptyRequest = new RegisterRequest();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors").isMap());
    }

    @Test
    void registerInvalidEmail() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("not-an-email");
        request.setName("Test User");
        request.setPassword("Password@123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void registerShortPassword() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("short@example.com");
        request.setName("Test User");
        request.setPassword("ab");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void loginValidationErrors() throws Exception {
        LoginRequest emptyRequest = new LoginRequest();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Validation failed"));
    }

    @Test
    void protectedEndpointWithMalformedJwt() throws Exception {
        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer this.is.not.a.valid.jwt"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void protectedEndpointWithExpiredJwt() throws Exception {
        String expiredToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJleHBpcmVkQGV4YW1wbGUuY29tIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDB9.invalid";

        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + expiredToken))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void jwtHashConsistency() {
        String token = jwtService.generateToken("hash@example.com", "Hash User");
        String hash1 = jwtService.getTokenHash(token);
        String hash2 = jwtService.getTokenHash(token);
        assert hash1.equals(hash2);
        assert hash1.length() == 64;
    }

    @Test
    void tokenRevocationUsesRedis() {
        String token = jwtService.generateToken("revoke@example.com", "Revoke User");
        tokenRevocationService.revoke(token);
        org.mockito.Mockito.verify(redisTemplate).opsForValue();
    }

    @Test
    void protectedEndpointWithRevokedToken() throws Exception {
        RegisterRequest regReq = new RegisterRequest();
        regReq.setEmail("revoked@example.com");
        regReq.setName("Revoked User");
        regReq.setPassword("Password@123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(regReq)))
                .andExpect(status().isCreated());

        String token = jwtService.generateToken("revoked@example.com", "Revoked User");
        String hash = jwtService.getTokenHash(token);
        when(redisTemplate.hasKey("auth:revoked:" + hash)).thenReturn(true);

        mockMvc.perform(get("/api/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }
}
