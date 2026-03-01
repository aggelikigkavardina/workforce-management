package com.workforce.management.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateConversationRequest {
    private String subject;
    // admin only:
    private Long employeeId; // admin new message to employee
}