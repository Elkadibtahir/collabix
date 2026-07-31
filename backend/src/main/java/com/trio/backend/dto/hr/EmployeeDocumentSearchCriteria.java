package com.trio.backend.dto.hr;

import com.trio.backend.enums.DocumentStatus;
import com.trio.backend.enums.EmployeeDocumentType;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
public class EmployeeDocumentSearchCriteria {

    private UUID employeeId;
    private EmployeeDocumentType documentType;
    private DocumentStatus status;
    private Boolean verified;
    private LocalDate expirationFrom;
    private LocalDate expirationTo;
    private Instant dateFrom;
    private Instant dateTo;
    private UUID uploadedBy;
    private String keyword;
}
