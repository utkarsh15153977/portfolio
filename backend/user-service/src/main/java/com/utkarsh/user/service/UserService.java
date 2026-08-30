package com.utkarsh.user.service;

import com.utkarsh.user.dto.UpdateUserProfileRequest;
import com.utkarsh.user.dto.UserProfileResponse;
import com.utkarsh.user.entity.UserProfile;
import com.utkarsh.user.exception.ResourceNotFoundException;
import com.utkarsh.user.repository.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserProfileRepository repository;

    public UserService(UserProfileRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfileByEmail(String email) {
        UserProfile profile = repository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return toResponse(profile);
    }

    @Transactional
    public UserProfileResponse getOrCreateProfile(String email, String name) {
        UserProfile profile = repository.findByEmail(email)
                .orElseGet(() -> {
                    UserProfile newProfile = new UserProfile(email);
                    newProfile.setName(name);
                    return repository.save(newProfile);
                });
        return toResponse(profile);
    }

    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateUserProfileRequest request) {
        UserProfile profile = repository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (request.getName() != null) {
            profile.setName(request.getName());
        }
        if (request.getBio() != null) {
            profile.setBio(request.getBio());
        }
        if (request.getLocation() != null) {
            profile.setLocation(request.getLocation());
        }
        if (request.getWebsite() != null) {
            profile.setWebsite(request.getWebsite());
        }
        if (request.getAvatarUrl() != null) {
            profile.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getLinkedinUrl() != null) {
            profile.setLinkedinUrl(request.getLinkedinUrl());
        }
        if (request.getGithubUrl() != null) {
            profile.setGithubUrl(request.getGithubUrl());
        }

        repository.save(profile);
        return toResponse(profile);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getPublicProfile(Long id) {
        UserProfile profile = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return toResponse(profile);
    }

    private UserProfileResponse toResponse(UserProfile profile) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(profile.getId());
        response.setEmail(profile.getEmail());
        response.setName(profile.getName());
        response.setBio(profile.getBio());
        response.setLocation(profile.getLocation());
        response.setWebsite(profile.getWebsite());
        response.setAvatarUrl(profile.getAvatarUrl());
        response.setLinkedinUrl(profile.getLinkedinUrl());
        response.setGithubUrl(profile.getGithubUrl());
        return response;
    }
}
