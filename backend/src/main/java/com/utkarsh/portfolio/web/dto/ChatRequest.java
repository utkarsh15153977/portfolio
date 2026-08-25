package com.utkarsh.portfolio.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Inbound request for POST /api/ai/chat.
 *
 * Validation keeps the surface safe: no blank prompts, bounded input size.
 */
public record ChatRequest(

        @NotBlank(message = "message must not be blank")
        @Size(max = 1000, message = "message must not exceed 1000 characters")
        String message
) {
}
