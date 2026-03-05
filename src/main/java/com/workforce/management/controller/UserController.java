package com.workforce.management.controller;

import com.workforce.management.dto.ChangePasswordDto;
import com.workforce.management.entity.User;
import com.workforce.management.exception.ResourceNotFoundException;
import com.workforce.management.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PutMapping("/me/password")
    public ResponseEntity<?> changeMyPassword(@Valid @RequestBody ChangePasswordDto dto,
                                              Authentication authentication) {

        String username = authentication.getName();
        log.info("Password change attempt for user {}", username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Map<String, String> fieldErrors = new HashMap<>();

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            fieldErrors.put("currentPassword", "Wrong current password");
            log.warn("Password change failed (wrong current password) for user {}", username);
        }

        if (passwordEncoder.matches(dto.getNewPassword(), user.getPassword())) {
            fieldErrors.put("newPassword", "New password must be different from current password");
            log.warn("Password change failed (new equals current) for user {}", username);
        }

        if (!fieldErrors.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("fieldErrors", fieldErrors));
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        user.setMustChangePassword(false);

        userRepository.save(user);

        log.info("Password changed successfully for user {}", username);

        return ResponseEntity.ok().build();
    }
}