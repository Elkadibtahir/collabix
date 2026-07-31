package com.trio.backend.dto.hr;

import com.trio.backend.enums.Recommendation;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class InterviewFeedbackResponse {

    private UUID id;
    private UUID interviewId;
    private Integer rating;
    private Recommendation recommendation;
    private String notes;
    private UUID submittedBy;
    private Instant submittedAt;
}
