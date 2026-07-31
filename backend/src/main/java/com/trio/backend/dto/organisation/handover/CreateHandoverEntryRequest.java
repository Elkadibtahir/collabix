package com.trio.backend.dto.organisation.handover;

import com.trio.backend.entity.HandoverEntry;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * Create request of a HandoverEntry.
 */
@Getter
@Setter
public class CreateHandoverEntryRequest {

    @NotNull
    private HandoverEntry.Shift shift;

    @NotNull
    private LocalDateTime passedAt;

    @NotBlank(message = "Work finished is required")
    private String workFinished;

    @NotBlank(message = "Work remaining is required")
    private String workRemaining;

    @NotBlank(message = "Difficulties are required")
    private String difficulties;

    @NotBlank(message = "Blockers are required")
    private String blockers;

    @NotBlank(message = "Important information is required")
    private String importantInformation;

    @NotBlank(message = "Priorities are required")
    private String priorities;

    @NotNull(message = "Time spent is required")
    private Long timeSpentMinutes;

    @NotNull(message = "Need help is required")
    private Boolean needHelp;

    private String additionalNotes;
}

