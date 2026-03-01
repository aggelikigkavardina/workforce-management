package com.workforce.management.controller;

import com.workforce.management.dto.ConversationSummaryDto;
import com.workforce.management.dto.CreateConversationRequest;
import com.workforce.management.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/conversations")
@RequiredArgsConstructor
public class AdminConversationController {

    private final ConversationService conversationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<ConversationSummaryDto> all() {
        return conversationService.listAllConversations();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> create(@RequestBody CreateConversationRequest req) {
        Long id = conversationService.createConversation(req);
        return Map.of("conversationId", id);
    }
}