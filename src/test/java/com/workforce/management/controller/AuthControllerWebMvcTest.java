package com.workforce.management.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workforce.management.entity.Role;
import com.workforce.management.entity.User;
import com.workforce.management.repository.UserRepository;
import com.workforce.management.security.JwtTokenProvider;
import com.workforce.management.security.CustomUserDetailsService;
import com.workforce.management.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.*;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerWebMvcTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @MockitoBean private AuthenticationManager authenticationManager;
    @MockitoBean private JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockitoBean private CustomUserDetailsService customUserDetailsService;
    @MockitoBean private JwtTokenProvider jwtTokenProvider;
    @MockitoBean private UserRepository userRepository;

    @Test
    void login_success_returnsTokenRoleMustChange() throws Exception {
        var body = """
                {"username":"admin@gmail.com","password":"admin123"}
                """;

        Authentication auth = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(jwtTokenProvider.generateToken(auth)).thenReturn("JWT_TOKEN");

        User u = new User();
        u.setUsername("admin@gmail.com");
        u.setRole(Role.ROLE_ADMIN);
        u.setMustChangePassword(false);

        when(userRepository.findByUsername("admin@gmail.com")).thenReturn(Optional.of(u));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("JWT_TOKEN"))
                .andExpect(jsonPath("$.role").value("ROLE_ADMIN"))
                .andExpect(jsonPath("$.mustChangePassword").value(false));
    }

    @Test
    void login_badCredentials_returns401() throws Exception {
        var body = """
                {"username":"x@y.com","password":"wrong"}
                """;

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("bad"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnauthorized())
                .andExpect(content().string("Invalid credentials"));
    }
}
