package com.workforce.management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginDto {

    @NotBlank
    @Email(message = "Username must be a valid email")
    private String username;

    @NotBlank
    private String password;
}
