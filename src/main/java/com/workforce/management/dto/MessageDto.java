package com.workforce.management.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
public class MessageDto {
    private Long id;
    private Long senderId;
    private String senderRole; // "ROLE_ADMIN" / "ROLE_EMPLOYEE"
    private String content;
    private Instant createdAt;
}
