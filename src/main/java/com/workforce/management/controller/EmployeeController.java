package com.workforce.management.controller;

import com.workforce.management.dto.EmployeeCreateResponse;
import com.workforce.management.dto.EmployeeDto;
import com.workforce.management.dto.EmployeeProfileUpdateDto;
import com.workforce.management.service.EmployeeService;
import com.workforce.management.validation.OnCreate;
import com.workforce.management.validation.OnUpdate;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin("*")
@AllArgsConstructor
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    private EmployeeService employeeService;

    // Build Add Employee REST API
    @PostMapping
    public ResponseEntity<EmployeeCreateResponse> createEmployee(@Validated(OnCreate.class) @RequestBody EmployeeDto employeeDto) {
        EmployeeCreateResponse response = employeeService.createEmployee(employeeDto);
        return ResponseEntity.ok(response);
    }

    // Build Get Employee REST API
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDto> getEmployeeById(@PathVariable("id") Long employeeId) {
        EmployeeDto employeeDto = employeeService.getEmployeeById(employeeId);
        return ResponseEntity.ok(employeeDto);
    }

    @GetMapping("/me")
    public ResponseEntity<EmployeeDto> getMyProfile(Authentication authentication) {
        String username = authentication.getName(); // email
        EmployeeDto employee = employeeService.getEmployeeByEmail(username);
        return ResponseEntity.ok(employee);
    }

    // Build Get All Employees REST API
    @GetMapping
    public ResponseEntity<List<EmployeeDto>> getAllEmployees() {
        List<EmployeeDto> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(employees); }

    // Build Update Employee REST API
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeDto> updateEmployee(@PathVariable("id") Long employeeId,
                                                      @Validated(OnUpdate.class) @RequestBody EmployeeDto updatedEmployee) {
        updatedEmployee.setId(employeeId);
        EmployeeDto employeeDto = employeeService.updateEmployee(employeeId, updatedEmployee);
        return ResponseEntity.ok(employeeDto);
    }

    // Build Delete Employee REST API
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEmployee(@PathVariable("id") Long employeeId) {
        employeeService.deleteEmployee(employeeId);
        return ResponseEntity.ok("Employee deleted successfully.");
    }

    @PutMapping("/me")
    public ResponseEntity<EmployeeDto> updateMyProfile(@Valid @RequestBody EmployeeProfileUpdateDto dto,
            Authentication authentication) {

        String username = authentication.getName();
        EmployeeDto updated = employeeService.updateMyProfile(username, dto);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/{id}/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@PathVariable Long id) {

        String tempPassword = employeeService.adminResetEmployeePassword(id);

        return ResponseEntity.ok(Map.of(
                "temporaryPassword", tempPassword
        ));
    }
}
