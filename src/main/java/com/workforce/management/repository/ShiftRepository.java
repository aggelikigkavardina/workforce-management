package com.workforce.management.repository;

import com.workforce.management.entity.Shift;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findByEmployeeIdOrderByStartAtAsc(Long employeeId);
}
