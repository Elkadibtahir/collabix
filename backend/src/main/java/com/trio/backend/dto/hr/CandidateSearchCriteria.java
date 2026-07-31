package com.trio.backend.dto.hr;

import com.trio.backend.enums.CandidateStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class CandidateSearchCriteria {

    private String keyword;
    private CandidateStatus status;
    private UUID recruiterId;
    private Instant dateFrom;
    private Instant dateTo;
}
