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
import com.workforce.management.repository.ShiftRepository;
import com.workforce.management.repository.UserRepository;
import com.workforce.management.service.EmployeeService;
import com.workforce.management.util.PasswordGenerator;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@AllArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {

    private EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ShiftRepository shiftRepository;

    @Override
    @Transactional
    public EmployeeCreateResponse createEmployee(EmployeeDto dto) {

        log.info("Create employee request: email={}", dto != null ? dto.getEmail() : null);

        if (userRepository.existsByUsername(dto.getEmail())) {
            log.warn("Create employee failed: user already exists (email={})", dto.getEmail());
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

        log.info("Employee created: employeeId={}, email={}, role={}, mustChangePassword=true",
                savedEmployee.getId(), savedEmployee.getEmail(), Role.ROLE_EMPLOYEE.name());

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

        log.info("Update employee request: employeeId={}, newEmail={}",
                employeeId, updatedDto != null ? updatedDto.getEmail() : null);


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
                log.warn("Update employee failed: user already exists (email={})", updatedDto.getEmail());
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
            log.info("Employee password updated: employeeId={}", employeeId);
        }

        Employee updated = employeeRepository.save(employee);
        userRepository.save(user);

        log.info("Employee updated: employeeId={}, email={}", updated.getId(), updated.getEmail());

        return EmployeeMapper.mapToEmployeeDto(updated);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long employeeId) {

        log.warn("Delete employee request: employeeId={}", employeeId);

        Employee employee =
                employeeRepository.findById(employeeId)
                        .orElseThrow(() -> new ResourceNotFoundException("Not found"));

        shiftRepository.deleteByEmployeeId(employeeId);

        User user = employee.getUser();
        if (user != null) {
            userRepository.delete(user);
        }

        employeeRepository.delete(employee);

        log.warn("Employee deleted: employeeId={}", employeeId);
    }

    @Override
    @Transactional
    public EmployeeDto updateMyProfile(String username, EmployeeProfileUpdateDto dto) {

        log.info("Update my profile request: username={}", username);

        Employee employee = employeeRepository.findByEmail(username)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        employee.setPhone(dto.getPhone());
        employee.setAddress(dto.getAddress());

        Employee updated = employeeRepository.save(employee);
        log.info("My profile updated: employeeId={}, email={}", updated.getId(), updated.getEmail());
        return EmployeeMapper.mapToEmployeeDto(updated);
    }

    @Override
    @Transactional
    public String adminResetEmployeePassword(Long employeeId) {

        log.warn("Admin reset password request: employeeId={}", employeeId);

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Not found"));

        User user = employee.getUser();
        if (user == null) {
            log.warn("Admin reset password failed: user not found for employeeId={}", employeeId);
            throw new ResourceNotFoundException("User not found for employee");
        }

        String tempPassword = PasswordGenerator.genarate(12);

        user.setPassword(passwordEncoder.encode(tempPassword));
        user.setMustChangePassword(true);

        userRepository.save(user);

        log.warn("Admin reset password done: employeeId={}, username={}, mustChangePassword=true",
                employeeId, user.getUsername());

        return tempPassword;
    }
}