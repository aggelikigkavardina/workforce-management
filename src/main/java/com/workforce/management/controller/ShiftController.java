package com.workforce.management.controller;

import com.workforce.management.dto.ShiftDto;
import com.workforce.management.service.ShiftService;
import com.workforce.management.validation.OnCreate;
import com.workforce.management.validation.OnUpdate;
import lombok.AllArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shifts")
@AllArgsConstructor
public class ShiftController {

    private final ShiftService shiftService;

    @GetMapping
    public List<ShiftDto> getAllShifts(@RequestParam(required = false) Long employeeId) {
        return shiftService.getAllShifts(employeeId);
    }

    @PostMapping
    public ShiftDto createShift(@RequestBody @Validated(OnCreate.class) ShiftDto shiftDto) {
        return shiftService.createShift(shiftDto);
    }

    @PutMapping("/{id}")
    public ShiftDto updateShift(@PathVariable Long id,
                           @RequestBody @Validated(OnUpdate.class) ShiftDto shiftDto) {
        shiftDto.setId(id);
        return shiftService.updateShift(id, shiftDto);
    }

    @DeleteMapping("/{id}")
    public void deleteShift(@PathVariable Long id) {
        shiftService.deleteShift(id);
    }

    @GetMapping("/my")
    public List<ShiftDto> myShifts() {
        return shiftService.getMyShifts();
    }
}