package com.workforce.management.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeProfileUpdateDto {

    @Pattern(
            regexp = "^69\\d{8}$",
            message = "Phone must be a valid 10 digits number"
    )
    private String phone;

    @Size(max = 255, message = "Address must be <= 255 characters")
    private String address;
}