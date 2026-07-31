package com.trio.backend.dto.hr;

import com.trio.backend.enums.CandidateStatus;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class CandidateStatistics {

    private long totalCandidates;
    private long hiredCount;
    private long rejectedCount;
    private long inProgressCount;
    private Map<CandidateStatus, Long> candidatesPerStatus;
}
