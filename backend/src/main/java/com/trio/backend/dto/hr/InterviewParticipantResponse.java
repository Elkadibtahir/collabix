package com.trio.backend.dto.hr;

import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class InterviewParticipantResponse {

    private UUID id;
    private UUID interviewId;
    private UUID userId;
    private String userFirstName;
    private String userLastName;
    private String userEmail;
    private String role;
}
