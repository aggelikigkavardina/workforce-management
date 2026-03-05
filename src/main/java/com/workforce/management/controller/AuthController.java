package com.workforce.management.controller;

import com.workforce.management.dto.JwtAuthResponse;
import com.workforce.management.dto.LoginDto;
import com.workforce.management.entity.User;
import com.workforce.management.exception.ResourceNotFoundException;
import com.workforce.management.repository.UserRepository;
import com.workforce.management.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDto loginDto) {
        String username = (loginDto == null) ? null : loginDto.getUsername();

        try {
            log.info("Login attempt for {}", username);

            Authentication authentication =
                    authenticationManager.authenticate(
                            new UsernamePasswordAuthenticationToken(
                                    loginDto.getUsername(),
                                    loginDto.getPassword()
                            )
                    );

            String token = jwtTokenProvider.generateToken(authentication);

            User user = userRepository.findByUsername(loginDto.getUsername())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

            JwtAuthResponse res = new JwtAuthResponse();
            res.setAccessToken(token);
            res.setRole(user.getRole().name());
            res.setMustChangePassword(user.isMustChangePassword());

            log.info("Login success for {} (role={}, mustChangePassword={})",
                    username, user.getRole().name(), user.isMustChangePassword());

            return ResponseEntity.ok(res);

        } catch (BadCredentialsException ex) {
            log.warn("Login failed (bad credentials) for {}", username);
            return ResponseEntity.status(401).body("Invalid credentials");
        } catch (DisabledException ex) {
            log.warn("Login failed (user disabled) for {}", username);
            return ResponseEntity.status(401).body("User disabled");
        } catch (AuthenticationException ex) {
            log.warn("Login failed (authentication error) for {}: {}", username, ex.getMessage());
            return ResponseEntity.status(401).body("Authentication failed");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        log.info("Logout called");
        return ResponseEntity.ok().build();
    }
}