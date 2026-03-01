package com.workforce.management.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
public class ConversationDto {
    private Long id;
    private String subject;
    private Instant createdAt;
    private Instant updatedAt;
    private List<MessageDto> messages;
}