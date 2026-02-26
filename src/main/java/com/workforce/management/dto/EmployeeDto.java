package com.workforce.management.dto;

import com.workforce.management.validation.OnCreate;
import com.workforce.management.validation.OnUpdate;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EmployeeDto {

    @NotNull(groups = OnUpdate.class, message = "Id is required for update")
    private Long id;

    @NotBlank(groups = {OnCreate.class, OnUpdate.class}, message = "First name is required")
    @Size(max = 50, groups = {OnCreate.class, OnUpdate.class}, message = "First name must be <= 50 characters")
    private String firstName;

    @NotBlank(groups = {OnCreate.class, OnUpdate.class}, message = "Last name is required")
    @Size(max = 50, groups = {OnCreate.class, OnUpdate.class}, message = "Last name must be <= 50 characters")
    private String lastName;

    @NotBlank(groups = {OnCreate.class, OnUpdate.class}, message = "Email is required")
    @Email(groups = {OnCreate.class, OnUpdate.class}, message = "Email must be valid")
    @Size(max = 120, groups = {OnCreate.class, OnUpdate.class}, message = "Email must be <= 120 characters")
    private String email;

    @NotBlank(groups = OnUpdate.class, message = "Password is required")
    @Size(min = 6, max = 64, groups = OnCreate.class, message = "Password must be 6-64 characters")
    //@JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;
}
