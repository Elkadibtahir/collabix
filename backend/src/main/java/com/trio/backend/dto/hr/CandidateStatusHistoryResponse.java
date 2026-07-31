package com.trio.backend.dto.hr;

import com.trio.backend.enums.CandidateStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class CandidateStatusHistoryResponse {

    private UUID id;
    private UUID candidateId;
    private CandidateStatus previousStatus;
    private CandidateStatus newStatus;
    private UUID changedBy;
    private String reason;
    private Instant createdAt;
}
