package com.workforce.management.controller;

import com.workforce.management.dto.JwtAuthResponse;
import com.workforce.management.dto.LoginDto;
import com.workforce.management.entity.User;
import com.workforce.management.exception.ResourceNotFoundException;
import com.workforce.management.repository.UserRepository;
import com.workforce.management.security.JwtTokenProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginDto loginDto) {
        try {
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

            return ResponseEntity.ok(res);

        } catch (BadCredentialsException ex) {
            return ResponseEntity.status(401).body("Invalid credentials");
        } catch (DisabledException ex) {
            return ResponseEntity.status(401).body("User disabled");
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).body("Authentication failed");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.ok().build();
    }
}