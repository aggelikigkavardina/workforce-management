package com.workforce.management.mapper;

import com.workforce.management.dto.ConversationSummaryDto;
import com.workforce.management.entity.Conversation;
import com.workforce.management.entity.Employee;
import com.workforce.management.entity.Message;
import org.springframework.stereotype.Component;

@Component
public class ConversationSummaryMapper {

    public ConversationSummaryDto toDto(Conversation c,
                                        Message lastMessage,
                                        long unreadCount,
                                        Employee employeeForAdmin) {

        ConversationSummaryDto dto = new ConversationSummaryDto();
        dto.setId(c.getId());
        dto.setSubject(c.getSubject());
        dto.setUpdatedAt(c.getUpdatedAt());
        dto.setUnreadCount(unreadCount);

        if (lastMessage != null) {
            String preview = lastMessage.getContent();
            if (preview != null && preview.length() > 60) preview = preview.substring(0, 60) + "…";
            dto.setLastMessagePreview(preview);
            dto.setLastMessageAt(lastMessage.getCreatedAt());
        }

        if (employeeForAdmin != null) {
            dto.setEmployeeId(employeeForAdmin.getId());
            dto.setEmployeeName((employeeForAdmin.getFirstName() + " " + employeeForAdmin.getLastName()).trim());
            dto.setEmployeeEmail(employeeForAdmin.getEmail());
        }

        return dto;
    }
}
