package com.utkarsh.ai.provider;

public interface AiProvider {

    String generateResponse(String userEmail, String conversationId, String message) throws AiProviderException;
}
