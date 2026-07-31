package com.trio.backend.dto.dev;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class CreateSprintRequest {

    @NotNull
    private UUID projectId;

    private UUID teamId;

    @NotBlank
    @Size(max = 150)
    private String name;

    @Size(max = 500)
    private String goal;

    @Size(max = 2000)
    private String description;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    private Integer capacity;
}
