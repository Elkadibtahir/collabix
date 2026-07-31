package com.trio.backend.dto.dev;

import com.trio.backend.enums.SprintStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class SprintSearchCriteria {

    private UUID projectId;
    private UUID teamId;
    private SprintStatus status;
    private LocalDate dateFrom;
    private LocalDate dateTo;
    private String name;
}
