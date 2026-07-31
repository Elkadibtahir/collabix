package com.trio.backend.dto.hr;

import com.trio.backend.enums.EmployeeDocumentType;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class EmployeeDocumentStatistics {

    private long totalDocuments;
    private long totalStorageBytes;
    private long verifiedCount;
    private long unverifiedCount;
    private long expiringCount;
    private long expiredCount;
    private Map<EmployeeDocumentType, Long> documentsByType;
}
