package com.trio.backend.dto.organisation.project;

import com.trio.backend.enums.ProjectPriority;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class UpdateProjectRequest {

    @Size(max = 150)
    private String name;

    @Size(max = 2000)
    private String description;

    private ProjectPriority priority;

    private LocalDate startDate;

    private LocalDate endDate;

    private UUID managerId;

    @Size(max = 7)
    private String color;

    @Size(max = 50)
    private String icon;
}
