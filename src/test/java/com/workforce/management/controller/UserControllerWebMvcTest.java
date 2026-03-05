package com.workforce.management.controller;

import com.workforce.management.entity.User;
import com.workforce.management.repository.UserRepository;
import com.workforce.management.security.CustomUserDetailsService;
import com.workforce.management.security.JwtAuthenticationFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerWebMvcTest {

    @Autowired private MockMvc mockMvc;

    @MockitoBean private UserRepository userRepository;
    @MockitoBean private PasswordEncoder passwordEncoder;
    @MockitoBean private JwtAuthenticationFilter jwtAuthenticationFilter;
    @MockitoBean private CustomUserDetailsService customUserDetailsService;

    private static UsernamePasswordAuthenticationToken principal(String email) {
        return new UsernamePasswordAuthenticationToken(email, "N/A");
    }

    @Test
    void changePassword_wrongCurrent_returnsFieldError() throws Exception {

        User u = new User();
        u.setUsername("emp@test.com");
        u.setPassword("HASH");
        u.setMustChangePassword(true);

        when(userRepository.findByUsername("emp@test.com")).thenReturn(Optional.of(u));

        // current password wrong
        when(passwordEncoder.matches("oldPass1", "HASH")).thenReturn(false);
        // new is not same as old hash (doesn't really matter here)
        when(passwordEncoder.matches("newPass1", "HASH")).thenReturn(false);

        var body = """
                {"currentPassword":"oldPass1","newPassword":"newPass1"}
                """;

        mockMvc.perform(put("/api/users/me/password")
                        .principal(principal("emp@test.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())

                .andExpect(jsonPath("$.fieldErrors.currentPassword").exists());

        verify(userRepository, never()).save(any());
    }

    @Test
    void changePassword_newSameAsCurrent_returnsFieldError() throws Exception {

        User u = new User();
        u.setUsername("emp@test.com");
        u.setPassword("HASH");
        u.setMustChangePassword(true);

        when(userRepository.findByUsername("emp@test.com")).thenReturn(Optional.of(u));

        // current correct
        when(passwordEncoder.matches("oldPass1", "HASH")).thenReturn(true);
        // new equals current
        when(passwordEncoder.matches("newPass1", "HASH")).thenReturn(true);

        var body = """
                {"currentPassword":"oldPass1","newPassword":"newPass1"}
                """;

        // Act + Assert
        mockMvc.perform(put("/api/users/me/password")
                        .principal(principal("emp@test.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors.newPassword").exists());

        verify(userRepository, never()).save(any());
    }

    @Test
    void changePassword_success_setsMustChangeFalse_andSaves() throws Exception {

        User u = new User();
        u.setUsername("emp@test.com");
        u.setPassword("HASH");
        u.setMustChangePassword(true);

        when(userRepository.findByUsername("emp@test.com")).thenReturn(Optional.of(u));

        // current correct
        when(passwordEncoder.matches("oldPass1", "HASH")).thenReturn(true);
        // new not same as current
        when(passwordEncoder.matches("newPass1", "HASH")).thenReturn(false);
        when(passwordEncoder.encode("newPass1")).thenReturn("NEW_HASH");

        var body = """
                {"currentPassword":"oldPass1","newPassword":"newPass1"}
                """;

        mockMvc.perform(put("/api/users/me/password")
                        .principal(principal("emp@test.com"))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk());

        verify(userRepository).save(u);
        assertEquals("NEW_HASH", u.getPassword());
        assertFalse(u.isMustChangePassword());
    }
}