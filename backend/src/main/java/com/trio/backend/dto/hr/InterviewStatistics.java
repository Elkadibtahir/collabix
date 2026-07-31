package com.trio.backend.dto.hr;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InterviewStatistics {

    private long interviewsToday;
    private long upcomingInterviews;
    private long CompletedInterviews;
    private long cancelledInterviews;
    private Double averageRating;
    private long candidatesWaitingForInterview;
}
