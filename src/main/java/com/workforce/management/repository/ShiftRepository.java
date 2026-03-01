package com.workforce.management.repository;

import com.workforce.management.entity.Shift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface ShiftRepository extends JpaRepository<Shift, Long> {

    List<Shift> findByEmployeeIdOrderByStartAtAsc(Long employeeId);

    // CREATE: overlap?
    @Query("""
        SELECT COUNT(s) > 0 FROM Shift s
        WHERE s.employee.id = :employeeId
          AND s.startAt < :endAt
          AND s.endAt   > :startAt
    """)
    boolean existsOverlappingShift(@Param("employeeId") Long employeeId,
                                   @Param("startAt") Instant startAt,
                                   @Param("endAt") Instant endAt);

    // UPDATE: overlap, only same shift?
    @Query("""
        SELECT COUNT(s) > 0 FROM Shift s
        WHERE s.employee.id = :employeeId
          AND s.id <> :shiftId
          AND s.startAt < :endAt
          AND s.endAt   > :startAt
    """)
    boolean existsOverlappingShiftExcludingId(@Param("employeeId") Long employeeId,
                                              @Param("shiftId") Long shiftId,
                                              @Param("startAt") Instant startAt,
                                              @Param("endAt") Instant endAt);

    void deleteByEmployeeId(Long employeeId);
}
