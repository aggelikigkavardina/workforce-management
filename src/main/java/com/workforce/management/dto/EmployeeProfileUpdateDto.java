package com.workforce.management.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeProfileUpdateDto {

    @Pattern(
            regexp = "^\\+30\\d{10}$",
            message = "Phone must be in format +30XXXXXXXXXX (10 digits after +30)"
    )
    private String phone;

    @Size(max = 255, message = "Address must be <= 255 characters")
    private String address;
}