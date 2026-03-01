package com.workforce.management.repository;

import com.workforce.management.entity.Message;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    @Query("select m from Message m where m.conversation.id = :cid order by m.createdAt asc")
    List<Message> findAllByConversationOrdered(@Param("cid") Long conversationId);

    @Query("select count(m) from Message m " +
            "where m.conversation.id = :cid and m.createdAt > :after and m.sender.id <> :userId")
    long countUnread(@Param("cid") Long conversationId,
                     @Param("after") Instant after,
                     @Param("userId") Long userId);

    @Query("select m from Message m where m.conversation.id = :cid order by m.createdAt desc")
    List<Message> findLastMessage(@Param("cid") Long conversationId, Pageable pageable);
}
