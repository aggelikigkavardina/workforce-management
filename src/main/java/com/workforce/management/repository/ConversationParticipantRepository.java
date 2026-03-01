package com.workforce.management.repository;

import com.workforce.management.entity.ConversationParticipant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long> {

    Optional<ConversationParticipant> findByConversationIdAndUserId(Long conversationId, Long userId);

    @Query("select cp from ConversationParticipant cp where cp.user.id = :userId")
    List<ConversationParticipant> findAllByUser(@Param("userId") Long userId);

    @Query("select cp from ConversationParticipant cp where cp.conversation.id = :cid")
    List<ConversationParticipant> findAllByConversation(@Param("cid") Long conversationId);
}
