package com.workforce.management.service;

import com.workforce.management.dto.EmployeeCreateResponse;
import com.workforce.management.dto.EmployeeDto;
import com.workforce.management.entity.Employee;
import com.workforce.management.entity.Role;
import com.workforce.management.entity.User;
import com.workforce.management.exception.ConflictException;
import com.workforce.management.exception.ResourceNotFoundException;
import com.workforce.management.repository.EmployeeRepository;
import com.workforce.management.repository.ShiftRepository;
import com.workforce.management.repository.UserRepository;
import com.workforce.management.service.impl.EmployeeServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceImplTest {

    @Mock private EmployeeRepository employeeRepository;
    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private ShiftRepository shiftRepository;

    @InjectMocks private EmployeeServiceImpl employeeService;

    @Test
    void createEmployee_whenUsernameExists_throwsConflict() {
        EmployeeDto dto = new EmployeeDto();
        dto.setEmail("john@acme.com");

        when(userRepository.existsByUsername("john@acme.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> employeeService.createEmployee(dto));

        verify(employeeRepository, never()).save(any());
        verify(userRepository, never()).save(any());
    }

    @Test
    void createEmployee_success_createsEmployeeAndUserAndReturnsTempPassword() {
        EmployeeDto dto = new EmployeeDto();
        dto.setFirstName("John");
        dto.setLastName("Doe");
        dto.setEmail("john@test.com");

        when(userRepository.existsByUsername("john@test.com")).thenReturn(false);

        Employee savedEmployee = new Employee();
        savedEmployee.setId(10L);
        savedEmployee.setFirstName("John");
        savedEmployee.setLastName("Doe");
        savedEmployee.setEmail("john@test.com");

        when(employeeRepository.save(any(Employee.class))).thenReturn(savedEmployee);
        when(passwordEncoder.encode(anyString())).thenReturn("ENCODED");

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);

        EmployeeCreateResponse res = employeeService.createEmployee(dto);

        assertNotNull(res);

        assertNotNull(res.getEmployeeDto());
        assertEquals("john@test.com", res.getEmployeeDto().getEmail());

        assertNotNull(res.getTemporaryPassword());
        assertEquals(12, res.getTemporaryPassword().length());

        verify(userRepository).save(userCaptor.capture());
        User createdUser = userCaptor.getValue();

        assertEquals("john@test.com", createdUser.getUsername());
        assertEquals("ENCODED", createdUser.getPassword());
        assertTrue(createdUser.isMustChangePassword());
        assertEquals(Role.ROLE_EMPLOYEE, createdUser.getRole());

        assertNotNull(createdUser.getEmployee());
        assertEquals(10L, createdUser.getEmployee().getId());
    }

    @Test
    void adminResetEmployeePassword_whenEmployeeMissing_throwsNotFound() {
        when(employeeRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> employeeService.adminResetEmployeePassword(99L));
    }

    @Test
    void adminResetEmployeePassword_success_setsMustChangeAndSavesUser() {
        Employee e = new Employee();
        e.setId(5L);
        e.setEmail("emp@test.com");

        User u = new User();
        u.setUsername("emp@test.com");
        u.setPassword("OLD_HASH");
        u.setMustChangePassword(false);

        e.setUser(u);

        when(employeeRepository.findById(5L)).thenReturn(Optional.of(e));
        when(passwordEncoder.encode(anyString())).thenReturn("NEW_HASH");

        String temp = employeeService.adminResetEmployeePassword(5L);

        assertNotNull(temp);
        assertEquals(12, temp.length());
        assertEquals("NEW_HASH", u.getPassword());
        assertTrue(u.isMustChangePassword());

        verify(userRepository).save(u);
    }

    @Test
    void deleteEmployee_deletesShiftsUserAndEmployee() {
        Employee e = new Employee();
        e.setId(7L);

        User u = new User();
        u.setUsername("emp@test.com");
        e.setUser(u);

        when(employeeRepository.findById(7L)).thenReturn(Optional.of(e));

        employeeService.deleteEmployee(7L);

        verify(shiftRepository).deleteByEmployeeId(7L);
        verify(userRepository).delete(u);
        verify(employeeRepository).delete(e);
    }
}
