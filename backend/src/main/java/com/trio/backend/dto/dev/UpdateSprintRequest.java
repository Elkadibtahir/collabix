package com.trio.backend.dto.dev;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class UpdateSprintRequest {

    private UUID teamId;
    private String name;
    private String goal;
    private String description;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer capacity;
}
