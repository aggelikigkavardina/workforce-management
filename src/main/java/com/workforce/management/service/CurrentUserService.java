package com.workforce.management.service;

import com.workforce.management.entity.User;
import com.workforce.management.exception.ResourceNotFoundException;
import com.workforce.management.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;

    public User getLoggedInUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
    }

    public Long getLoggedInEmployeeId() {
        User user = getLoggedInUser();
        if (user.getEmployee() == null) {
            throw new ResourceNotFoundException("User has no employee mapped");
        }
        return user.getEmployee().getId();
    }
}
