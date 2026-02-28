package com.workforce.management.service.impl;

import com.workforce.management.dto.EmployeeCreateResponse;
import com.workforce.management.dto.EmployeeDto;
import com.workforce.management.dto.EmployeeProfileUpdateDto;
import com.workforce.management.entity.Employee;
import com.workforce.management.entity.Role;
import com.workforce.management.entity.User;
import com.workforce.management.exception.ConflictException;
import com.workforce.management.exception.ResourceNotFoundException;
import com.workforce.management.mapper.EmployeeMapper;
import com.workforce.management.repository.EmployeeRepository;
import com.workforce.management.repository.UserRepository;
import com.workforce.management.service.EmployeeService;
import com.workforce.management.util.PasswordGenerator;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public EmployeeCreateResponse createEmployee(EmployeeDto dto) {

        if (userRepository.existsByUsername(dto.getEmail())) {
            throw new ConflictException("User already exists");
        }

        Employee employee = EmployeeMapper.mapToEmployee(dto);
        Employee savedEmployee = employeeRepository.save(employee);

        String tempPassword = PasswordGenerator.genarate(12);

        User user = new User();
        user.setUsername(savedEmployee.getEmail());
        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setMustChangePassword(true);
        user.setRole(Role.ROLE_EMPLOYEE);
        user.setEmployee(savedEmployee);
        savedEmployee.setUser(user);

        userRepository.save(user);

        return new EmployeeCreateResponse(
                EmployeeMapper.mapToEmployeeDto(savedEmployee),
                tempPassword
        );
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

    @Override
    public List<EmployeeDto> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .filter(e -> e.getEmail() == null || !e.getEmail().equalsIgnoreCase("admin@gmail.com"))
                .map(EmployeeMapper::mapToEmployeeDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EmployeeDto updateEmployee(Long employeeId, EmployeeDto updatedDto) {

        Employee employee =
                employeeRepository.findById(employeeId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Not found"));

        employee.setFirstName(updatedDto.getFirstName());
        employee.setLastName(updatedDto.getLastName());
        employee.setEmail(updatedDto.getEmail());

        User user = employee.getUser();

        if (user == null) {
            if (userRepository.existsByUsername(updatedDto.getEmail())) {
                throw new ConflictException("User already exists");
            }

            user = new User();
            user.setUsername(updatedDto.getEmail());
            user.setRole(Role.ROLE_EMPLOYEE);
            user.setEmployee(employee);
            employee.setUser(user);
        } else {
            user.setUsername(updatedDto.getEmail());
        }
        if (updatedDto.getPassword() != null && !updatedDto.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(updatedDto.getPassword()));
        }

        Employee updated = employeeRepository.save(employee);
        userRepository.save(user);

        return EmployeeMapper.mapToEmployeeDto(updated);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long employeeId) {

        Employee employee =
                employeeRepository.findById(employeeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Not found"));

        User user = employee.getUser();
        if (user != null) {
            userRepository.delete(user);
        }

        employeeRepository.delete(employee);
    }

    @Override
    @Transactional
    public EmployeeDto updateMyProfile(String username, EmployeeProfileUpdateDto dto) {

        Employee employee = employeeRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        employee.setPhone(dto.getPhone());
        employee.setAddress(dto.getAddress());

        Employee updated = employeeRepository.save(employee);
        return EmployeeMapper.mapToEmployeeDto(updated);
    }

    @Override
    @Transactional
    public String adminResetEmployeePassword(Long employeeId) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Not found"));

        User user = employee.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found for employee");
        }

        String tempPassword = PasswordGenerator.genarate(12);

        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setMustChangePassword(true);

        userRepository.save(user);

        return tempPassword;
    }
}