package com.trio.backend.dto.hr;

import com.trio.backend.enums.Recommendation;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InterviewFeedbackRequest {

    @Min(1)
    @Max(5)
    private Integer rating;

    @NotNull
    private Recommendation recommendation;

    @Size(max = 5000)
    private String notes;
}
