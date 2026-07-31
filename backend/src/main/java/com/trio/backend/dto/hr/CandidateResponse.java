package com.trio.backend.dto.hr;

import com.trio.backend.enums.CandidateSource;
import com.trio.backend.enums.CandidateStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class CandidateResponse {

    private UUID id;
    private UUID departmentId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String position;
    private CandidateSource source;
    private CandidateStatus currentStatus;
    private UUID recruiterId;
    private boolean archived;
    private Instant createdAt;
    private Instant updatedAt;
}
