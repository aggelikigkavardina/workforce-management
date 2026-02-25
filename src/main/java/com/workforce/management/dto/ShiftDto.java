package com.workforce.management.dto;

import com.workforce.management.validation.OnCreate;
import com.workforce.management.validation.OnUpdate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
public class ShiftDto {

    @NotNull(groups = OnUpdate.class, message = "Id is required for update")
    private Long id;

    @NotNull(groups = {OnCreate.class, OnUpdate.class}, message = "Employee id is required")
    private Long employeeId;

    @NotBlank(groups = {OnCreate.class, OnUpdate.class}, message = "Title is required")
    @Size(max = 80, groups = {OnCreate.class, OnUpdate.class}, message = "Title must be <= 80 characters")
    private String title;

    @NotNull(groups = {OnCreate.class, OnUpdate.class}, message = "Start time is required")
    private Instant startAt;

    @NotNull(groups = {OnCreate.class, OnUpdate.class}, message = "End time is required")
    private Instant endAt;

    @Size(max = 500, groups = {OnCreate.class, OnUpdate.class}, message = "Notes must be <= 500 characters")
    private String notes;
}
