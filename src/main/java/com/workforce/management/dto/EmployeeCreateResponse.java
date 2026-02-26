package com.workforce.management.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class EmployeeCreateResponse {
    private  EmployeeDto employeeDto;
    private String temporaryPassword;
}
