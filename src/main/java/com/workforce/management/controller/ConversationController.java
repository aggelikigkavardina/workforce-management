package com.workforce.management.controller;

import com.workforce.management.dto.*;
import com.workforce.management.service.ConversationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ConversationController {

    private final ConversationService conversationService;

    // employee list (my conversations)
    @GetMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public List<ConversationSummaryDto> myConversations() {
        return conversationService.listMyConversations();
    }

    // create conversation:
    // - employee: subject
    // - admin: use /api/admin/conversations for list & create (we keep separation)
    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public Map<String, Object> create(@RequestBody CreateConversationRequest req) {
        Long id = conversationService.createConversation(req);
        return Map.of("conversationId", id);
    }

    // conversation details (employee allowed only if participant; admin allowed always)
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
    public ConversationDto get(@PathVariable Long id) {
        return conversationService.getConversation(id);
    }

    @PostMapping("/{id}/messages")
    @PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
    public MessageDto send(@PathVariable Long id, @RequestBody SendMessageRequest req) {
        return conversationService.sendMessage(id, req);
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('EMPLOYEE','ADMIN')")
    public void read(@PathVariable Long id) {
        conversationService.markRead(id);
    }
}