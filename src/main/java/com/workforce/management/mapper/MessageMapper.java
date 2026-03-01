package com.workforce.management.mapper;

import com.workforce.management.dto.MessageDto;
import com.workforce.management.entity.Message;
import org.springframework.stereotype.Component;

@Component
public class MessageMapper {

    public MessageDto toDto(Message m) {
        if (m == null) return null;

        MessageDto dto = new MessageDto();
        dto.setId(m.getId());
        dto.setSenderId(m.getSender() != null ? m.getSender().getId() : null);
        dto.setSenderRole(
                m.getSender() != null && m.getSender().getRole() != null
                        ? m.getSender().getRole().name()
                        : null
        );
        dto.setContent(m.getContent());
        dto.setCreatedAt(m.getCreatedAt());
        return dto;
    }
}
