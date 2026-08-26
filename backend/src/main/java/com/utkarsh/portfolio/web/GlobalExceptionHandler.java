package com.utkarsh.portfolio.web;

import org.springframework.ai.retry.NonTransientAiException;
import org.springframework.ai.retry.TransientAiException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.RestClientException;

/**
 * Central error handling — every failure leaves the API as safe, structured
 * JSON. Provider errors are mapped to 502 without leaking provider details,
 * URLs or stack traces.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    public record ApiError(String error) {
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(f -> f.getDefaultMessage())
                .orElse("invalid request");
        return ResponseEntity.badRequest().body(new ApiError(message));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException ex) {
        return ResponseEntity.badRequest().body(new ApiError("malformed request body"));
    }

    @ExceptionHandler({NonTransientAiException.class, TransientAiException.class, RestClientException.class})
    public ResponseEntity<ApiError> handleProviderFailure(Exception ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(new ApiError("AI provider unavailable - try again later"));
    }

    @ExceptionHandler(org.springframework.ai.tool.execution.ToolExecutionException.class)
    public ResponseEntity<ApiError> handleToolFailure(Exception ex) {
        // Phase 4.5: a portfolio tool failed mid-conversation. Spring AI usually
        // feeds tool errors back to the model itself; if one escapes we still map
        // it to a safe 502 without leaking tool internals or stack traces.
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                .body(new ApiError("AI provider unavailable - try again later"));
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiError> handleIllegalState(IllegalStateException ex) {
        // Spring AI surfaces missing/blank keys and client build issues as ISE.
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ApiError("AI provider is not configured on this server"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleUnexpected(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiError("unexpected server error"));
    }
}
