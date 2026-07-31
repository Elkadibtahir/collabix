package com.trio.backend.dto.cyber;

import com.trio.backend.enums.AuditPriority;
import com.trio.backend.enums.AuditType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class CreateSecurityAuditRequest {

    @NotNull
    private UUID projectId;

    private UUID teamId;

    @NotBlank
    @Size(max = 150)
    private String name;

    @Size(max = 2000)
    private String description;

    @NotNull
    private AuditType auditType;

    @NotNull
    private AuditPriority priority;

    private LocalDate startDate;

    private LocalDate endDate;
}
