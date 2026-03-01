package com.workforce.management.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class ConversationSummaryDto {
    private Long id;
    private String subject;
    private Instant updatedAt;

    private String lastMessagePreview;
    private Instant lastMessageAt;

    private long unreadCount;

    // admin-only display fields
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
}
