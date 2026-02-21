package com.workforce.management.service.impl;

import com.workforce.management.dto.EmployeeDto;
import com.workforce.management.entity.Employee;
import com.workforce.management.entity.Role;
import com.workforce.management.entity.User;
import com.workforce.management.exception.ResourceNotFoundException;
import com.workforce.management.mapper.EmployeeMapper;
import com.workforce.management.repository.EmployeeRepository;
import com.workforce.management.repository.UserRepository;
import com.workforce.management.service.EmployeeService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public EmployeeDto createEmployee(EmployeeDto dto) {

        if (userRepository.existsByUsername(dto.getEmail())) {
            throw new RuntimeException("User already exists");
        }

        Employee employee = EmployeeMapper.mapToEmployee(dto);

        Employee savedEmployee = employeeRepository.save(employee);

        User user = new User();
        user.setUsername(savedEmployee.getEmail());
        user.setPassword(
                passwordEncoder.encode("default123"));
        user.setRole(Role.ROLE_EMPLOYEE);
        user.setEmployee(savedEmployee);

        userRepository.save(user);

        return EmployeeMapper.mapToEmployeeDto(savedEmployee);
    }

    @Override
    public EmployeeDto getEmployeeById(Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee does not exist with given id : " + employeeId));
        return EmployeeMapper.mapToEmployeeDto(employee);
    }

    @Override
    public EmployeeDto getEmployeeByEmail(String email_id) {
        Employee employee = employeeRepository.findByEmail(email_id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        return EmployeeMapper.mapToEmployeeDto(employee);
    }

    @Override public List<EmployeeDto> getAllEmployees() {
        List<Employee> employees = employeeRepository.findAll();
        return employees.stream().map((employee) ->
                EmployeeMapper.mapToEmployeeDto(employee))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EmployeeDto updateEmployee(
            Long employeeId,
            EmployeeDto updatedDto) {

        Employee employee =
                employeeRepository.findById(employeeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Not found"));

        employee.setFirstName(updatedDto.getFirstName());
        employee.setLastName(updatedDto.getLastName());
        employee.setEmail(updatedDto.getEmail());

        employee.getUser()
                .setUsername(updatedDto.getEmail());

        Employee updated =
                employeeRepository.save(employee);

        return EmployeeMapper.mapToEmployeeDto(updated);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long employeeId) {

        Employee employee =
                employeeRepository.findById(employeeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Not found"));

        userRepository.delete(employee.getUser());
        employeeRepository.delete(employee);
    }
}