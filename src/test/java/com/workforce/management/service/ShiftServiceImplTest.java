package com.workforce.management.service;

import com.workforce.management.dto.ShiftDto;
import com.workforce.management.entity.Employee;
import com.workforce.management.entity.Shift;
import com.workforce.management.exception.BadRequestException;
import com.workforce.management.exception.ResourceNotFoundException;
import com.workforce.management.repository.EmployeeRepository;
import com.workforce.management.repository.ShiftRepository;
import com.workforce.management.service.impl.ShiftServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.*;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShiftServiceImplTest {

    @Mock private ShiftRepository shiftRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private CurrentUserService currentUserService;

    @InjectMocks private ShiftServiceImpl shiftService;

    private static Instant athensInstant(int year, int month, int day, int hour, int minute) {
        return ZonedDateTime.of(year, month, day, hour, minute, 0, 0, ZoneId.of("Europe/Athens")).toInstant();
    }

    @Test
    void validateShift_nullStartOrEnd_throws400() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> shiftService.validateShift(null, Instant.now()));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void validateShift_endNotAfterStart_throws400() {
        Instant t = Instant.now();
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> shiftService.validateShift(t, t));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void validateShift_moreThan8Hours_throws400() {
        Instant s = athensInstant(2026, 3, 5, 10, 0);
        Instant e = s.plus(Duration.ofHours(9));
        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> shiftService.validateShift(s, e));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void validateShift_outsideWorkHours_throws400() {
        Instant s = athensInstant(2026, 3, 5, 5, 0);
        Instant e = athensInstant(2026, 3, 5, 7, 0);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                () -> shiftService.validateShift(s, e));
        assertEquals(400, ex.getStatusCode().value());
    }

    @Test
    void createShift_whenEmployeeMissing_throwsNotFound() {
        ShiftDto dto = new ShiftDto();
        dto.setEmployeeId(7L);
        dto.setStartAt(athensInstant(2026, 3, 5, 10, 0));
        dto.setEndAt(athensInstant(2026, 3, 5, 14, 0));

        when(employeeRepository.findById(7L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> shiftService.createShift(dto));
    }

    @Test
    void createShift_whenOverlaps_throwsBadRequest() {
        ShiftDto dto = new ShiftDto();
        dto.setEmployeeId(7L);
        dto.setTitle("Morning");
        dto.setStartAt(athensInstant(2026, 3, 5, 10, 0));
        dto.setEndAt(athensInstant(2026, 3, 5, 14, 0));

        Employee emp = new Employee();
        emp.setId(7L);

        when(employeeRepository.findById(7L)).thenReturn(Optional.of(emp));
        when(shiftRepository.existsOverlappingShift(eq(7L), any(), any())).thenReturn(true);

        assertThrows(BadRequestException.class, () -> shiftService.createShift(dto));
        verify(shiftRepository, never()).save(any(Shift.class));
    }

    @Test
    void getMyShifts_usesLoggedInEmployeeId() {
        when(currentUserService.getLoggedInEmployeeId()).thenReturn(55L);
        when(shiftRepository.findByEmployeeIdOrderByStartAtAsc(55L)).thenReturn(List.of());

        List<ShiftDto> res = shiftService.getMyShifts();

        assertNotNull(res);
        assertEquals(0, res.size());
        verify(shiftRepository).findByEmployeeIdOrderByStartAtAsc(55L);
    }
}