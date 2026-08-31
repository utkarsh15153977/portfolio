package com.utkarsh.auth.service;

import com.utkarsh.auth.dto.AuthResponse;
import com.utkarsh.auth.dto.RegisterRequest;
import com.utkarsh.auth.entity.User;
import com.utkarsh.auth.exception.DuplicateEmailException;
import com.utkarsh.auth.exception.InvalidCredentialsException;
import com.utkarsh.auth.middleware.RateLimitService;
import com.utkarsh.auth.repository.UserRepository;
import com.utkarsh.auth.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final UserCacheService userCacheService;
    private final RateLimitService rateLimitService;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       UserCacheService userCacheService,
                       RateLimitService rateLimitService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.userCacheService = userCacheService;
        this.rateLimitService = rateLimitService;
    }

    public AuthResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException("Email already registered");
        }

        User user = new User(
                request.getEmail(),
                request.getName(),
                passwordEncoder.encode(request.getPassword())
        );
        userRepository.save(user);

        return new AuthResponse(null, user.getId(), user.getEmail(), user.getName());
    }

    public AuthResponse loginUser(String email, String password, String clientIp) {
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    rateLimitService.recordFailedLogin(clientIp);
                    throw new InvalidCredentialsException("Invalid email or password");
                });

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            rateLimitService.recordFailedLogin(clientIp);
            throw new InvalidCredentialsException("Invalid email or password");
        }

        // Cache user profile on successful login
        userCacheService.cacheUser(user);

        String token = jwtService.generateToken(user.getEmail(), user.getName());
        return new AuthResponse(token, user.getId(), user.getEmail(), user.getName());
    }
}
