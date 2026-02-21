package com.workforce.management;

import com.workforce.management.entity.Employee;
import com.workforce.management.entity.Role;
import com.workforce.management.entity.User;
import com.workforce.management.repository.EmployeeRepository;
import com.workforce.management.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
public class WorkforceManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(WorkforceManagementApplication.class, args);
	}

	@Bean
	CommandLineRunner initAdmin(UserRepository userRepository,
								PasswordEncoder passwordEncoder,
								EmployeeRepository employeeRepository) {
		return args -> {

			String adminEmail = "admin@gmail.com";

			if (!userRepository.existsByUsername(adminEmail)) {

				Employee employee = new Employee();
				employee.setFirstName("System");
				employee.setLastName("Admin");
				employee.setEmail(adminEmail);

				Employee savedEmployee = employeeRepository.save(employee);

				User user = new User();
				user.setUsername(adminEmail);
				user.setPassword(passwordEncoder.encode("admin123"));
				user.setRole(Role.ROLE_ADMIN);
				user.setEmployee(savedEmployee);

				userRepository.save(user);

				System.out.println("ADMIN CREATED");
			}
		};
	}

}
