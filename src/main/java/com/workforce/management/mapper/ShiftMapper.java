package com.workforce.management.mapper;

import com.workforce.management.dto.ShiftDto;
import com.workforce.management.entity.Shift;

public class ShiftMapper {

    public static ShiftDto mapToShiftDto(Shift shift) {
        ShiftDto shiftDto = new ShiftDto();
        shiftDto.setId(shift.getId());
        shiftDto.setEmployeeId(shift.getEmployee().getId());
        shiftDto.setTitle(shift.getTitle());
        shiftDto.setStartAt(shift.getStartAt());
        shiftDto.setEndAt(shift.getEndAt());
        shiftDto.setNotes(shift.getNotes());
        return shiftDto;
    }

    public static Shift mapToShift(ShiftDto shiftDto) {
        Shift shift = new Shift();
        shift.setId(shiftDto.getId());
        shift.setTitle(shiftDto.getTitle());
        shift.setStartAt(shiftDto.getStartAt());
        shift.setEndAt(shiftDto.getEndAt());
        shift.setNotes(shiftDto.getNotes());
        return shift;
    }
}
