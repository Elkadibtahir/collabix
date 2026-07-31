package com.trio.backend.dto.hr;

import com.trio.backend.enums.CandidateStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CandidateStatusChangeRequest {

    @NotNull
    private CandidateStatus newStatus;

    @Size(max = 1000)
    private String reason;
}
