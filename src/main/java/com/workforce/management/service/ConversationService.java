package com.workforce.management.service;

import com.workforce.management.dto.*;

import java.util.List;

public interface ConversationService {

    List<ConversationSummaryDto> listMyConversations();        // EMPLOYEE

    List<ConversationSummaryDto> listAllConversations();       // ADMIN

    Long createConversation(CreateConversationRequest req);    // role-based (EMPLOYEE or ADMIN)

    ConversationDto getConversation(Long conversationId);      // role-based access check

    MessageDto sendMessage(Long conversationId, SendMessageRequest req); // role-based access check

    void markRead(Long conversationId);                        // role-based access check
}
