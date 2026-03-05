package com.workforce.management.service;

import com.workforce.management.dto.ShiftDto;

import java.util.List;

public interface ShiftService {

    ShiftDto createShift(ShiftDto shiftDto);

    ShiftDto updateShift(Long shiftId, ShiftDto shiftDto);

    void deleteShift(Long shiftId);

    List<ShiftDto> getAllShifts(Long employeeId); // employeeId optional filter

    List<ShiftDto> getMyShifts();
}
