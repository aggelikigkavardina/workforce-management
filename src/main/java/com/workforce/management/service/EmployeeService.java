package com.workforce.management.service;

import com.workforce.management.dto.EmployeeCreateResponse;
import com.workforce.management.dto.EmployeeDto;

import java.util.List;

public interface EmployeeService {

    EmployeeCreateResponse createEmployee(EmployeeDto employeeDto);

    EmployeeDto getEmployeeById(Long employeeId);

    EmployeeDto getEmployeeByEmail(String email_id);

    List<EmployeeDto> getAllEmployees();

    EmployeeDto updateEmployee(Long employeeId, EmployeeDto updatedEmployee);

    void deleteEmployee(Long employeeId);
}