package com.utkarsh.ai.repository;

import com.utkarsh.ai.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    List<Conversation> findByUserEmailOrderByUpdatedAtDesc(String userEmail);

    Optional<Conversation> findByIdAndUserEmail(Long id, String userEmail);

    long countByUserEmail(String userEmail);
}
