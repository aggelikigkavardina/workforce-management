package com.workforce.management.service.impl;

import com.workforce.management.dto.*;
import com.workforce.management.entity.*;
import com.workforce.management.exception.BadRequestException;
import com.workforce.management.exception.ResourceNotFoundException;
import com.workforce.management.mapper.ConversationMapper;
import com.workforce.management.mapper.ConversationSummaryMapper;
import com.workforce.management.mapper.MessageMapper;
import com.workforce.management.repository.*;
import com.workforce.management.service.ConversationService;
import com.workforce.management.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepo;
    private final ConversationParticipantRepository participantRepo;
    private final MessageRepository messageRepo;

    private final UserRepository userRepo;
    private final EmployeeRepository employeeRepo;

    private final CurrentUserService currentUserService;

    private final MessageMapper messageMapper;
    private final ConversationMapper conversationMapper;
    private final ConversationSummaryMapper summaryMapper;

    private void ensureCanAccessConversation(Long conversationId, User current) {
        if (current.getRole() == Role.ROLE_ADMIN) return;

        participantRepo.findByConversationIdAndUserId(conversationId, current.getId())
                .orElseThrow(() -> new RuntimeException("Forbidden"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationSummaryDto> listMyConversations() {
        User me = currentUserService.getLoggedInUser();
        if (me.getRole() != Role.ROLE_EMPLOYEE) throw new RuntimeException("Forbidden");

        return participantRepo.findAllByUser(me.getId()).stream()
                .map(cp -> toSummaryDto(cp.getConversation().getId(), me))
                .sorted(Comparator.comparing(ConversationSummaryDto::getUpdatedAt).reversed())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationSummaryDto> listAllConversations() {
        User me = currentUserService.getLoggedInUser();
        if (me.getRole() != Role.ROLE_ADMIN) throw new RuntimeException("Forbidden");

        return conversationRepo.findAll().stream()
                .map(c -> toSummaryDto(c.getId(), me))
                .sorted(Comparator.comparing(ConversationSummaryDto::getUpdatedAt).reversed())
                .toList();
    }

    @Override
    public Long createConversation(CreateConversationRequest req) {
        User me = currentUserService.getLoggedInUser();

        String subject = (req == null || req.getSubject() == null || req.getSubject().isBlank())
                ? "New conversation"
                : req.getSubject().trim();

        // EMPLOYEE -> ADMIN
        if (me.getRole() == Role.ROLE_EMPLOYEE) {
            User admin = userRepo.findFirstByRole(Role.ROLE_ADMIN)
                    .orElseThrow(() -> new RuntimeException("Admin user not found"));

            Conversation c = new Conversation();
            c.setSubject(subject);
            c.setCreatedAt(Instant.now());
            c.setUpdatedAt(Instant.now());
            conversationRepo.save(c);

            ConversationParticipant cpE = new ConversationParticipant();
            cpE.setConversation(c);
            cpE.setUser(me);
            cpE.setLastReadAt(Instant.now());

            ConversationParticipant cpA = new ConversationParticipant();
            cpA.setConversation(c);
            cpA.setUser(admin);
            cpA.setLastReadAt(null);

            participantRepo.saveAll(List.of(cpE, cpA));
            return c.getId();
        }

        // ADMIN -> EMPLOYEE (by Employee.id)
        if (me.getRole() == Role.ROLE_ADMIN) {
            if (req == null || req.getEmployeeId() == null) {
                throw new RuntimeException("employeeId is required");
            }

            Employee employee = employeeRepo.findById(req.getEmployeeId())
                    .orElseThrow(() -> new RuntimeException("Employee not found"));

            if (employee.getUser() == null) {
                throw new RuntimeException("Employee has no user mapped");
            }

            User employeeUser = employee.getUser();

            Conversation c = new Conversation();
            c.setSubject(subject);
            c.setCreatedAt(Instant.now());
            c.setUpdatedAt(Instant.now());
            conversationRepo.save(c);

            ConversationParticipant cpA = new ConversationParticipant();
            cpA.setConversation(c);
            cpA.setUser(me);
            cpA.setLastReadAt(Instant.now());

            ConversationParticipant cpE = new ConversationParticipant();
            cpE.setConversation(c);
            cpE.setUser(employeeUser);
            cpE.setLastReadAt(null);

            participantRepo.saveAll(List.of(cpA, cpE));
            return c.getId();
        }

        throw new RuntimeException("Forbidden");
    }

    @Override
    @Transactional(readOnly = true)
    public ConversationDto getConversation(Long conversationId) {
        User me = currentUserService.getLoggedInUser();
        ensureCanAccessConversation(conversationId, me);

        Conversation c = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        List<Message> messages = messageRepo.findAllByConversationOrdered(conversationId);

        return conversationMapper.toDto(c, messages);
    }

    @Override
    public MessageDto sendMessage(Long conversationId, SendMessageRequest req) {
        User me = currentUserService.getLoggedInUser();
        ensureCanAccessConversation(conversationId, me);

        String text = (req == null || req.getContent() == null) ? "" : req.getContent().trim();
        if (text.isBlank()) throw new RuntimeException("Message is empty");
        if (text.length() > 2000) throw new RuntimeException("Message too long");

        Conversation c = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        Message m = new Message();
        m.setConversation(c);
        m.setSender(me);
        m.setContent(text);
        m.setCreatedAt(Instant.now());
        messageRepo.save(m);

        c.setUpdatedAt(Instant.now());
        conversationRepo.save(c);

        return messageMapper.toDto(m);
    }

    @Override
    public void markRead(Long conversationId) {
        User me = currentUserService.getLoggedInUser();
        ensureCanAccessConversation(conversationId, me);

        ConversationParticipant cp = participantRepo
                .findByConversationIdAndUserId(conversationId, me.getId())
                .orElseThrow(() -> new RuntimeException("Participant not found"));

        cp.setLastReadAt(Instant.now());
        participantRepo.save(cp);
    }

    // -------- summary builder --------
    private ConversationSummaryDto toSummaryDto(Long conversationId, User current) {
        Conversation c = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        Message last = messageRepo.findLastMessage(conversationId, PageRequest.of(0, 1))
                .stream().findFirst().orElse(null);

        Instant lastRead = participantRepo.findByConversationIdAndUserId(conversationId, current.getId())
                .map(ConversationParticipant::getLastReadAt)
                .orElse(null);

        long unread = messageRepo.countUnread(
                conversationId,
                lastRead == null ? Instant.EPOCH : lastRead,
                current.getId()
        );

        Employee employeeForAdmin = null;

        if (current.getRole() == Role.ROLE_ADMIN) {
            var participants = participantRepo.findAllByConversation(conversationId);
            var empUser = participants.stream()
                    .map(ConversationParticipant::getUser)
                    .filter(u -> u.getRole() == Role.ROLE_EMPLOYEE)
                    .findFirst()
                    .orElse(null);

            if (empUser != null) {
                employeeForAdmin = empUser.getEmployee();
            }
        }

        return summaryMapper.toDto(c, last, unread, employeeForAdmin);
    }
}