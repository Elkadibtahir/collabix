package com.trio.backend.dto.ai;

import com.trio.backend.entity.ExecutiveReport;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class ReportingGenerateRequest {

    @NotNull
    private UUID workspaceId;

    @NotNull
    private UUID departmentId;

    private UUID projectId;

    @NotBlank
    private String title;

    @NotNull
    private ExecutiveReport.ReportType reportType;

    private LocalDate periodStart;

    private LocalDate periodEnd;
}
