package com.utkarsh.user.controller;

import com.utkarsh.user.dto.UpdateUserProfileRequest;
import com.utkarsh.user.dto.UserProfileResponse;
import com.utkarsh.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getCurrentUser(HttpServletRequest request) {
        String email = extractEmail(request);
        String name = request.getHeader("X-User-Name");
        UserProfileResponse response = userService.getOrCreateProfile(email, name);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileResponse> updateCurrentUser(
            @Valid @RequestBody UpdateUserProfileRequest updateRequest,
            HttpServletRequest request) {
        String email = extractEmail(request);
        UserProfileResponse response = userService.updateProfile(email, updateRequest);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileResponse> getUserById(@PathVariable Long id) {
        UserProfileResponse response = userService.getPublicProfile(id);
        return ResponseEntity.ok(response);
    }

    private String extractEmail(HttpServletRequest request) {
        String email = request.getHeader("X-User-Email");
        if (email == null || email.isBlank()) {
            throw new SecurityException("Missing authenticated user identity");
        }
        return email;
    }
}
