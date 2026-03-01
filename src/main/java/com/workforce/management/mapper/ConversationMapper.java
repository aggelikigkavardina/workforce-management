package com.workforce.management.mapper;

import com.workforce.management.dto.ConversationDto;
import com.workforce.management.entity.Conversation;
import com.workforce.management.entity.Message;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ConversationMapper {

    private final MessageMapper messageMapper;

    public ConversationDto toDto(Conversation c, List<Message> messages) {
        if (c == null) return null;

        ConversationDto dto = new ConversationDto();
        dto.setId(c.getId());
        dto.setSubject(c.getSubject());
        dto.setCreatedAt(c.getCreatedAt());
        dto.setUpdatedAt(c.getUpdatedAt());
        dto.setMessages(messages.stream().map(messageMapper::toDto).toList());
        return dto;
    }
}
