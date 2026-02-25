package com.workforce.management.service.impl;

import com.workforce.management.dto.ShiftDto;
import com.workforce.management.entity.Employee;
import com.workforce.management.entity.Shift;
import com.workforce.management.exception.ResourceNotFoundException;
import com.workforce.management.mapper.ShiftMapper;
import com.workforce.management.repository.EmployeeRepository;
import com.workforce.management.repository.ShiftRepository;
import com.workforce.management.service.CurrentUserService;
import com.workforce.management.service.ShiftService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class ShiftServiceImpl implements ShiftService {

    private final ShiftRepository shiftRepository;
    private final EmployeeRepository employeeRepository;
    private final CurrentUserService currentUserService;

    @Override
    @Transactional
    public ShiftDto createShift(ShiftDto dto) {
        validateRange(dto.getStartAt(), dto.getEndAt());

        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        Shift shift = ShiftMapper.mapToShift(dto);
        shift.setEmployee(employee);

        Shift saved = shiftRepository.save(shift);
        return ShiftMapper.mapToShiftDto(saved);
    }

    @Override
    @Transactional
    public ShiftDto updateShift(Long shiftId, ShiftDto dto) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found"));

        validateRange(dto.getStartAt(), dto.getEndAt());

        shift.setTitle(dto.getTitle());
        shift.setStartAt(dto.getStartAt());
        shift.setEndAt(dto.getEndAt());
        shift.setNotes(dto.getNotes());

        // (optional) allow changing employee on update
        if (dto.getEmployeeId() != null && !dto.getEmployeeId().equals(shift.getEmployee().getId())) {
            Employee employee = employeeRepository.findById(dto.getEmployeeId())
                    .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
            shift.setEmployee(employee);
        }

        Shift updated = shiftRepository.save(shift);
        return ShiftMapper.mapToShiftDto(updated);
    }

    @Override
    @Transactional
    public void deleteShift(Long shiftId) {
        Shift shift = shiftRepository.findById(shiftId)
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found"));
        shiftRepository.delete(shift);
    }

    @Override
    public List<ShiftDto> getAllShifts(Long employeeId) {
        List<Shift> shifts = (employeeId == null)
                ? shiftRepository.findAll(Sort.by(Sort.Direction.ASC, "startAt"))
                : shiftRepository.findByEmployeeIdOrderByStartAtAsc(employeeId);

        return shifts.stream()
                .map(ShiftMapper::mapToShiftDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ShiftDto> getMyShifts() {
        Long myEmployeeId = currentUserService.getLoggedInEmployeeId();

        return shiftRepository.findByEmployeeIdOrderByStartAtAsc(myEmployeeId)
                .stream()
                .map(ShiftMapper::mapToShiftDto)
                .collect(Collectors.toList());
    }

    private void validateRange(Instant start, Instant end) {
        if (start == null || end == null) return;
        if (!end.isAfter(start)) {
            throw new RuntimeException("endAt must be after startAt");
        }
    }
}
